# PROMPT PARA CLAUDE OPUS 5.5 — Implementación de Informes y Reportes

> Copia y pega **todo** este bloque en Claude Opus 5.5, adjuntando también el archivo
> `docs/BRIEF_INFORMES_PROGRESO_2026_10.md`.
>
> Este prompt está diseñado para que Opus **implemente**, no solo planifique.
> Exige primero un plan corto y aprobación; después, ejecución por fases.

---

```text
Actúa como ingeniero de software senior full-stack, con experiencia en TanStack Start,
React 19, TypeScript, Tailwind, Zustand, PostgreSQL/PostgREST (Insforge) y despliegue
en Cloudflare Pages. Trabajas sobre un sistema EN PRODUCCIÓN llamado "Vibra Music Staff".

## 0. CONTEXTO QUE DEBES LEER ANTES DE TOCAR NADA

Adjunto a este prompt tienes el documento:
`docs/BRIEF_INFORMES_PROGRESO_2026_10.md`

Léelo completo. Contiene:
- auditoría del sistema actual de notas,
- requerimientos de los docentes (Nathaly, Fernando; Jeremy pendiente),
- modelo de datos propuesto,
- restricciones de producción,
- minas terrestres específicas,
- criterios de aceptación y pruebas.

Además, si tienes acceso al repositorio, lee:
- `AGENTS.md` (reglas y ADR del proyecto; son obligatorias),
- `src/store/app-store.ts`,
- `src/lib/services/teacher-notes.service.ts`,
- `src/components/teacher/lesson-notes.tsx`,
- `src/components/admin/teacher-notes-moderation.tsx`,
- `src/components/admin/student-audit-report-dialog.tsx`,
- `src/lib/kardex-calculator.ts`,
- `src/lib/student-cycle.ts`,
- `src/lib/laya/laya-family-scope.ts`,
- `src/hooks/use-insforge-sync.ts`,
- `src/routes/admin.alumnos.tsx`, `src/routes/teacher.index.tsx`, `src/routes/family.tsx`.

## 1. OBJETIVO

Implementar en la webapp, de forma incremental y sin romper lo existente:

1. **Registro de clase** (bitácora interna del docente) con criterios estructurados.
2. **Nota a la familia** con moderación real y persistencia en PostgreSQL.
3. **Nota interna a Dirección** por alumno, persistida y con bandeja de lectura.
4. **Informe de progreso** periódico (mensual/trimestral), con:
   - cálculo automático de asistencia desde el motor oficial,
   - criterios, repertorio, nivel, resumen, próxima meta y tarea,
   - PDF A4 de 2 páginas,
   - vista en el portal de padres,
   - envío por WhatsApp,
   - exportación Markdown para LLM/auditoría.

## 2. REGLAS INNEGOCIABLES

- **NO reescribas** la app. Cambios quirúrgicos y aditivos.
- **NO toques** el motor de asistencia, agenda, Kardex, ciclos ni facturación sin plan de regresión.
- **NO uses `localStorage` como fuente de verdad.** PostgreSQL manda (ADR-0119).
- **NO dupliques** lógica de filtros, cuotas, ciclos, deduplicación o asistencia.
  Reutiliza `src/lib/kardex-calculator.ts` y `src/lib/student-cycle.ts`.
- **NO sobreescribas** `students.notes` ni `teacherNote`. Ese campo está sobrecargado
  (notas legacy + motivo de precio personalizado). Crea tablas nuevas.
- **NO construyas** sobre `notification_logs` para las notas nuevas. Hoy tiene 0 filas
  visibles y guarda metadatos dentro de `error_msg`; es frágil.
- **NO inventes** criterios de Jeremy (guitarra/batería). Incluye una fase de levantamiento.
- **NO publiques** nada a familias sin aprobación. La familia solo ve `published`/`aprobado`.
- **NO incluyas** datos financieros en el informe pedagógico.
- **NO dependas** de `/api/assistant` ni de Cloudflare Functions: hoy responde 404.
  Todo debe funcionar en cliente.
- **NO uses** `DROP TABLE`, `TRUNCATE` ni `DELETE` masivo.
- **NO hagas** `git add -A`. Commitea rutas explícitas.
- **Build gate:** `npm run build` verde antes de cada commit/push.
- **Mobile-first** en el portal de padres; botones de 44–56 px.
- **Español** en toda la UI.
- Identifica alumnos por `id` (UUID), nunca por nombre. Hay homónimos reales.

## 3. DECISIONES YA TOMADAS (no las re-litigues)

1. **Arquitectura de datos: Opción C (híbrida).**
   Tablas reales para lo transaccional + `jsonb` para puntajes y snapshots.
2. **Tablas nuevas**, aditivas. No modificar columnas existentes de `students`.
3. **`students.notes` queda como legacy de solo lectura.** No migrar ni borrar.
4. **La moderación nueva usa `family_notes`**, no `notification_logs`.
5. **La nota interna usa `internal_notes`**, no `privateNote` del store.
6. **El informe usa `progress_reports`** y congela un `attendance_snapshot` calculado
   por `computeStudentCycleLiquidation`.
7. **El informe NO lleva finanzas.** La ficha financiera existente se mantiene aparte.
8. **El portal de padres es solo lectura** y solo para sus hijos (`resolveFamilyScope`).
9. **Feature flag** para activar el módulo sin romper producción.
10. **Piloto con Nathaly y Fernando** antes de abrir a todas las familias.

## 4. ESQUEMA MÍNIMO VIABLE (SQL de migración)

Genera un archivo `docs/migrations/2026-10-informes.sql` con este esquema base.
Ajusta nombres solo si hay una razón técnica; documenta el cambio.

```sql
-- Criterios configurables por instrumento / categoría / nivel
create table if not exists evaluation_criteria (
  id uuid primary key default gen_random_uuid(),
  instrument text not null,                 -- 'Canto', 'Piano Infantil', 'Violín', 'Piano', 'Guitarra', 'Batería'
  age_category text,                        -- 'INFANTIL','JUNIOR','JUVENIL','MASTER', null = todas
  level text,                               -- 'Inicial','Intermedio','Avanzado', null = todos
  code text not null,
  label text not null,
  group_name text not null,                 -- 'Técnica','Lectura y teoría','Repertorio','Oído','Actitud'
  scale_type text not null,                 -- 'semaforo4' | 'numeric10' | 'boolean'
  is_core boolean not null default false,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (instrument, age_category, level, code)
);

-- Registro de clase (bitácora)
create table if not exists lesson_evaluations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete restrict,
  lesson_id text,
  session_date date not null,
  start_time time,
  teacher_id uuid,
  instrument text,
  overall_status text,                      -- 'logrado'|'en_proceso'|'pendiente'|'no_corresponde'
  repertoire text,
  topic text,
  comment text,
  homework text,
  scores jsonb not null default '[]'::jsonb, -- [{criterion_id, code, value_enum, value_numeric, note}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_lesson_evaluations_student_date
  on lesson_evaluations (student_id, session_date desc);
create index if not exists idx_lesson_evaluations_teacher_date
  on lesson_evaluations (teacher_id, session_date desc);

-- Informe de progreso
create table if not exists progress_reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  report_type text not null default 'trimestral', -- 'mensual'|'trimestral'|'recital'
  status text not null default 'draft',           -- 'draft'|'pending'|'approved'|'published'|'rejected'
  level_at_start text,
  level_at_end text,
  summary text,
  next_goal text,
  homework text,
  teacher_comment text,
  scores jsonb not null default '[]'::jsonb,
  repertoire jsonb not null default '[]'::jsonb,
  attendance_snapshot jsonb not null default '{}'::jsonb,
  created_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_progress_reports_student_period
  on progress_reports (student_id, period_end desc);
create index if not exists idx_progress_reports_status
  on progress_reports (status);

-- Nota a la familia (con historial)
create table if not exists family_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete restrict,
  teacher_id uuid,
  lesson_evaluation_id uuid references lesson_evaluations(id) on delete set null,
  content text not null,
  status text not null default 'pendiente', -- 'pendiente'|'aprobado'|'rechazado'|'publicado'
  moderated_by uuid,
  moderated_at timestamptz,
  rejection_reason text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_family_notes_student
  on family_notes (student_id, created_at desc);
create index if not exists idx_family_notes_status
  on family_notes (status);

-- Nota interna a Dirección
create table if not exists internal_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete set null,
  author_id uuid,
  recipient text not null default 'direccion', -- 'direccion'|'secretaria'|'ambos'
  content text not null,
  status text not null default 'nueva',        -- 'nueva'|'leida'|'archivada'
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_internal_notes_status
  on internal_notes (status, created_at desc);

-- Auditoría
create table if not exists evaluation_audit_log (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  entity_id uuid not null,
  action text not null,
  actor_id uuid,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);
```

**Seguridad:** la app usa la anon key en el frontend. No diseñes políticas RLS que
dependan de un JWT que no existe. Documenta la limitación y aplica filtros explícitos
por `family_id`/`student_id` en los servicios. Si el riesgo de exposición es alto,
entrega primero el módulo solo para staff y deja el portal familia detrás de un flag.

**Migración:** no ejecutes DDL desde el agente. Deja el `.sql` listo y pide al usuario
que lo corra en el panel SQL de Insforge (o `psql`). Después verifica con PostgREST
que las tablas existen y están vacías.

## 5. RUTA DE ATERRIZAJE EN LA WEBAPP (cómo "bajarlo")

Implementa en este orden. No saltes fases.

### Fase 0 — Reconocimiento y plan corto
- Lee los archivos indicados.
- Entrega un plan de 1 página con: archivos a crear/modificar, migración, UI, pruebas y rollback.
- Lista solo los bloqueos reales (por ejemplo, falta de datos de Jeremy).
- **Espera aprobación antes de escribir código.**

### Fase 1 — Datos y servicios (sin UI)
Crear:
- `src/lib/services/evaluations.service.ts`
  - `getCriteria({ instrument, ageCategory, level })`
  - `saveLessonEvaluation(payload)`
  - `getStudentEvaluations(studentId, { from, to })`
- `src/lib/services/progress-reports.service.ts`
  - `createProgressReport(studentId, period)`
  - `updateProgressReport(id, patch)`
  - `approveProgressReport(id, actorId)`
  - `publishProgressReport(id, actorId)`
  - `getReportsForStudent(studentId)`
  - `getReportsForFamily(familyId)` (filtra por `students.family_id`)
- `src/lib/services/family-notes.service.ts`
  - `submitFamilyNote(payload)`
  - `listFamilyNotes({ status })`
  - `approveFamilyNote(id, actorId)`
  - `rejectFamilyNote(id, actorId, reason)`
- `src/lib/services/internal-notes.service.ts`
  - `createInternalNote`, `listInternalNotes`, `markInternalNoteRead`
- `src/lib/informes/types.ts` con tipos compartidos.
- `src/lib/informes/attendance-snapshot.ts` que envuelva
  `computeStudentCycleSessions` + `computeStudentCycleLiquidation` y devuelva
  un objeto congelado (asistidas, faltas, justificadas, tardanzas, créditos,
  pendientes, cuota, nivel, repertorio).

**Prohibido:** calcular asistencia a mano. Todo pasa por el motor.

### Fase 2 — Registro de clase (docente)
- Nuevo componente `src/components/teacher/class-log.tsx`.
- Integrarlo en `src/routes/teacher.index.tsx` como pestaña
  **“Registro de clase”**, sin quitar la pestaña actual de notas.
- Flujo:
  1. Elegir alumno (solo activos y solo sus alumnos).
  2. Fecha y hora automáticas desde la clase seleccionada.
  3. Criterios cargados por instrumento/categoría/nivel.
  4. Semáforo 4 o teclado 1–10 según el docente.
  5. Repertorio, tema, estado, comentario corto, tarea.
  6. Guardar en `lesson_evaluations`.
- Objetivo de tiempo: ≤ 90 segundos.
- Mostrar “última evaluación” en la tarjeta del alumno.

### Fase 3 — Nota a la familia (reemplazo del flujo actual)
- Nuevo componente `src/components/teacher/family-note-form.tsx`.
- Nuevo panel `src/components/admin/family-notes-moderation.tsx`.
- Mantén el componente viejo (`teacher-notes-moderation.tsx`) hasta que el nuevo
  esté probado; luego retíralo de la pestaña.
- La aprobación:
  - actualiza `family_notes.status = 'aprobado'` o `'publicado'`,
  - registra `moderated_by`, `moderated_at`,
  - **no toca `students.notes`**,
  - deja auditoría en `evaluation_audit_log`.
- El rechazo guarda `rejection_reason` **sin borrar** el contenido.
- Portal familia: leer solo `family_notes` con `status = 'publicado'`.

### Fase 4 — Nota interna a Dirección
- Nuevo componente `src/components/teacher/internal-note-form.tsx`.
- Bandeja en `src/components/admin/internal-notes-inbox.tsx`.
- Persistida en `internal_notes`; estado `nueva`/`leida`/`archivada`.
- **No visible** en el portal familia.
- Retirar o dejar en solo lectura el `privateNote` global.

### Fase 5 — Informe de progreso
- Nuevo componente `src/components/admin/progress-report-dialog.tsx`.
- Reutilizar la arquitectura A4 de `student-audit-report-dialog.tsx` y
  `src/components/ui/dialog.tsx` (ADR-0136/0137).
- Secciones:
  - Página 1: identidad, nivel, criterios, repertorio, asistencia.
  - Página 2: resumen, próxima meta, tarea, antes/después, firmas.
- Generación:
  - `createProgressReport` toma evaluaciones del periodo + snapshot de asistencia.
  - El docente revisa y edita.
  - Dirección aprueba y publica.
- Salidas:
  - PDF A4 (print).
  - Markdown (`generateProgressReportMarkdown`).
  - WhatsApp (mensaje corto).
- Portal familia: nueva ruta `src/routes/family.progreso.tsx` y pestaña
  “Progreso” en `src/routes/family.tsx`.
- Solo se muestran informes `published`.

### Fase 6 — Reportes y analítica
- En `src/routes/admin.reportes.tsx`: columna “Último informe” y filtro por estado.
- En `src/routes/admin.alumnos.tsx`: nueva pestaña “Informes”.
- Exportación CSV de la bandeja.
- Opcional: métricas por docente/instrumento (sin datos financieros).

### Fase 7 — Feature flag, piloto y despliegue
- Crear `src/lib/features.ts`:
  ```ts
  export const FEATURES = {
    informes: import.meta.env.VITE_FEATURE_INFORMES === "true",
  };
  ```
- Si el flag está apagado, no montar rutas/pestañas nuevas.
- Piloto: Nathaly y Fernando, 2–3 alumnos cada uno.
- Verificar en producción:
  - registro de clase,
  - nota aprobada visible en el portal,
  - informe publicado visible,
  - PDF de 2 páginas sin cortes.
- Recién después, abrir a todas las familias.

## 6. UI/UX OBLIGATORIA

- Docente: pestañas claras, botones grandes, sin jerga técnica.
- Administración: bandeja con filtros por estado, docente, instrumento y periodo.
- Familia: mobile-first, una tarjeta por informe, botón “Descargar PDF”.
- Nada de modales obstructivos en móvil; usar drawers si hace falta.
- Mostrar siempre el estado: borrador / pendiente / aprobado / publicado / rechazado.
- Mostrar “última actualización” y “quién aprobó”.

## 7. CRITERIOS DE ACEPTACIÓN

### Registro de clase
- [ ] Docente registra una clase en ≤ 90 s.
- [ ] Solo ve sus alumnos activos.
- [ ] Criterios correctos por instrumento/categoría/nivel.
- [ ] Persiste en PostgreSQL y sobrevive a recarga y cambio de dispositivo.
- [ ] Edición con auditoría.

### Nota a familia
- [ ] Se ve en cualquier dispositivo (no solo en el que se creó).
- [ ] Aprobar publica; rechazar conserva contenido y motivo.
- [ ] No toca `students.notes`.
- [ ] La familia solo ve publicadas.
- [ ] WhatsApp solo si está aprobada.

### Nota interna
- [ ] Persistida, con autor y fecha.
- [ ] Bandeja de Dirección/Secretaría.
- [ ] Invisible para la familia.
- [ ] No se pierde al recargar.

### Informe
- [ ] Se genera desde evaluaciones + motor de ciclos.
- [ ] Nivel, criterios, repertorio, resumen, asistencia, meta, tarea y firmas.
- [ ] Editable antes de aprobar.
- [ ] Aprobación/publicación con auditoría.
- [ ] Familia solo ve publicados.
- [ ] PDF A4 de 2 páginas, sin cortes ni desplazamientos.
- [ ] Markdown y WhatsApp.
- [ ] Sin datos financieros.

### No regresión
- [ ] Kiosco: los 4 estados de asistencia siguen funcionando.
- [ ] Agenda admin/docente: mismas clases, sin duplicados.
- [ ] Kardex: mismas cuotas, créditos y transiciones.
- [ ] Facturación: mismos totales y recibos.
- [ ] Portal familia: horario, asistencia y avisos intactos.
- [ ] `npm run build` verde.

## 8. PRUEBAS QUE DEBES ESCRIBIR

- Unitarias:
  - mapeo semáforo ↔ 1–10 ↔ banda normalizada,
  - carga de criterios,
  - snapshot de asistencia,
  - consolidación de 90 min (2 bloques → 1 sesión),
  - atribución por `effectiveFrom`/`effectiveUntil`,
  - Markdown del informe.
- Integración con PostgREST vivo:
  - crear en “dispositivo A” → leer en “dispositivo B”,
  - aprobar/rechazar/publicar,
  - negativo: familia A no ve familia B,
  - negativo: docente A no ve alumnos de docente B,
  - negativo: borrador no visible a familia.
- Regresión: kiosco, agenda, Kardex, facturación, portal.
- Impresión: Chrome/Edge “Guardar como PDF”, 2 páginas exactas.
- Móvil: 375 px, sin overflow, botones táctiles.

Deja los scripts de verificación en `scratch/` (como se hizo en ADR-0173/0174),
pero **no** los ejecutes contra producción si hacen escrituras.

## 9. DESPLIEGUE

1. Crear `docs/migrations/2026-10-informes.sql`.
2. El usuario corre el SQL en Insforge (o `psql`).
3. Verificar tablas con PostgREST (select vacío).
4. Implementar servicios + UI por fases.
5. `npm run build` local.
6. Commit explícito por fase. Ejemplo:
   - `feat(informes): tablas y servicios base`
   - `feat(informes): registro de clase docente`
   - `feat(informes): moderacion de notas a familia`
   - `feat(informes): notas internas a direccion`
   - `feat(informes): informe de progreso + PDF`
   - `feat(informes): portal familia y feature flag`
7. Push a `origin` y `core` (el proyecto tiene dos remotos).
8. Cloudflare Pages reconstruye automáticamente.
9. Verificar en `https://musicstaff-vm.pages.dev`:
   - `/teacher`, `/teacher/agenda`,
   - `/admin/alumnos`, `/admin/reportes`,
   - `/family`.
10. Si algo falla: apagar `VITE_FEATURE_INFORMES`, redeploy. Las tablas quedan
    (no borrar datos).

## 10. ROLLBACK

- **UI:** apagar el feature flag y volver a montar los componentes viejos.
- **Datos:** las tablas nuevas son aditivas; no afectan a las existentes.
- **Código:** revertir el commit de la fase. No usar `git reset --hard` si hay
  trabajo de otro agente en el árbol.
- **Nunca** borrar `students`, `families`, `attendance_logs`, `invoices`,
  `payment_audit_logs`.

## 11. QUÉ NO HACER

- No crear un segundo sistema de sync.
- No duplicar `computeStudentCycleSessions`.
- No leer `localStorage` para reportes.
- No usar `students.notes` como almacén del informe.
- No usar `notification_logs` como bandeja.
- No hardcodear docentes, salas, horarios ni alumnos.
- No asumir 13 alumnos activos: hoy hay 57.
- No mezclar finanzas con pedagogía.
- No publicar sin aprobación.
- No inventar criterios de Jeremy.

## 12. FORMATO DE TU PRIMERA RESPUESTA

No escribas código todavía. Responde con:

1. **Plan de 1 página** (fases, archivos, migración, pruebas, rollback).
2. **Decisiones técnicas** que tomaste y por qué.
3. **Bloqueos** (por ejemplo, falta de datos de Jeremy o de respuestas de Dirección).
4. **Preguntas** que necesitas responder antes de la Fase 1.
5. **Orden de commits** propuesto.

Después de mi aprobación, implementa **una fase a la vez**, mostrando:
- archivos creados/modificados,
- diff conceptual,
- cómo probar,
- resultado de `npm run build`,
- commit exacto.

## 13. CONTEXTO TÉCNICO RESUMIDO

- Stack: TanStack Start, React 19, TypeScript, Tailwind, Zustand, Radix UI,
  PostgreSQL Insforge vía PostgREST, Cloudflare Pages.
- Rutas clave: `/teacher`, `/teacher/agenda`, `/admin/agenda`, `/admin/alumnos`,
  `/admin/reportes`, `/family`.
- Motor de sesiones: `src/lib/kardex-calculator.ts`.
- Motor de ciclo: `src/lib/student-cycle.ts`.
- Alcance familia: `src/lib/laya/laya-family-scope.ts`.
- Sync: `src/hooks/use-insforge-sync.ts`.
- Impresión A4: `src/components/admin/student-audit-report-dialog.tsx`.
- Notas actuales: `src/lib/services/teacher-notes.service.ts` (no reutilizar su
  persistencia; sí su UI como referencia).
- Estado actual: 146 alumnos, 57 activos, 155 familias, 301 asistencias.
- `notification_logs`: 0 filas visibles. No construir sobre eso.
- `students.level`: 56/57 = "Principiante". No usar como nivel real.
- `students.notes`: sobrecargado con legacy y motivo de precio. No tocar.

## 14. DEFINITION OF DONE

Una fase está terminada solo si:
- [ ] `npm run build` pasa.
- [ ] No rompe kiosco, agenda, Kardex ni facturación.
- [ ] Tiene pruebas (unitarias o script de verificación).
- [ ] Tiene rollback documentado.
- [ ] Está commiteada con ruta explícita.
- [ ] Está verificada en producción o en preview.
- [ ] Actualiza `AGENTS.md` con un ADR corto (si cambia una regla del sistema).
```

---

## Notas para el usuario (no forman parte del prompt)

- **Qué hace este prompt:** obliga a Opus a leer el brief, respetar las reglas de
  producción y entregar primero un plan; después implementa por fases.
- **Qué necesitas tener a mano antes de usarlo:**
  1. El archivo `docs/BRIEF_INFORMES_PROGRESO_2026_10.md`.
  2. Acceso al repo (o copia de los archivos clave).
  3. Respuestas a las preguntas abiertas del brief (sobre todo Jeremy).
- **Cómo se "baja" a la webapp:** el SQL se corre una vez en Insforge; luego los
  servicios leen/escriben por PostgREST; las rutas nuevas se activan con
  `VITE_FEATURE_INFORMES=true`; Cloudflare Pages despliega al hacer push.
- **Riesgo principal:** la anon key está en el frontend. Antes de publicar informes
  a familias, decide si aceptas ese modelo o si hace falta auth real/RLS.
