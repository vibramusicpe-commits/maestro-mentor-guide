# ADR-0175: Sistema de Evaluaciones, Informes de Progreso y Notas — Fase 1 (Datos y Servicios) y Fase 2 (Registro de Clase)

## Estado

Aceptado e implementado. **Fase 1 de 7 completada. Fase 2 de 7 implementada y en piloto con Jeremy, Nathaly y Fernando.**

## Fecha

2026-10-21 (Fase 1) · 2026-10-22 (documentación de Fase 1 y Fase 2).

## Contexto

La evaluación pedagógica de Vibra Music vivía en dos lugares débiles:

- `students.notes`: un solo campo de texto libre, sin estructura, sin periodo, sin historial y sin moderación.
- El flujo de notas del docente: funcional en la interfaz, pero sin una fuente de verdad normalizada ni auditoría formal.

Se necesitaba reemplazarlo por un sistema que permita:

1. Registrar la evaluación de cada clase (criterios, repertorio, estado, tarea y comentario).
2. Generar informes de progreso mensuales/trimestrales con snapshot de asistencia.
3. Enviar notas a las familias **solo después de moderación** de Dirección/Secretaría.
4. Mantener una bandeja interna para observaciones que no deben llegar a la familia.
5. Auditar cada cambio sin exponer datos financieros en el informe pedagógico.
6. Hacer todo esto sin romper kiosco docente, agenda, Kardex, asistencias ni facturación.

El riesgo principal era tocar producción de golpe. Por eso se decidió avanzar por fases y comenzar por la infraestructura de datos y servicios, sin interfaz visible y con los flags apagados.

## Decisión

Implementar **solo la Fase 1** del plan definido en `docs/PROMPT_OPUS_IMPLEMENTACION_INFORMES.md`:

- Migraciones aditivas `008` y `008b` ejecutadas en Insforge PostgreSQL.
- Tipos compartidos, utilidades y snapshot pedagógico.
- Servicios de evaluaciones, informes de progreso, notas de familia, notas internas y feature flags.
- Resolución de docente extraída a un módulo independiente.
- Cero cambios en `app-store.ts`, `kardex-calculator.ts`, `student-cycle.ts`, agenda, Kardex, asistencia o facturación.
- Cero UI nueva y cero flags activados.
- `students.notes` queda **congelado como legacy**.
- `notification_logs` no se toca.
- No se usa `localStorage` como fuente de verdad.

La Fase 1 no busca que el usuario final vea algo nuevo. Busca que la Fase 2 (interfaz) tenga una base sólida, probada y reversible.

## Alcance exacto de la Fase 1

### Implementado

- Migración `008_evaluations_progress_reports.sql`:
  - 7 tablas nuevas.
  - Vista `v_test_records`.
  - 9 seeds en `org_settings`.
  - 12 triggers (timestamps, auditoría, validaciones).
  - Constraints de estado, modo de clase y datos de prueba.
- Migración aditiva `008b_internal_notes_read_status.sql`:
  - `internal_notes.status` (`nueva | leida | archivada`).
  - `internal_notes.read_at`, `read_by_id`, `read_by_name`.
  - Índice y check de estado.
- `src/lib/informes/types.ts`: tipos DB y de dominio.
- `src/lib/informes/utils.ts`: `buildSessionKey`, normalización de títulos, validaciones, `deepFreeze`, `resolveTestFlags`.
- `src/lib/informes/attendance-snapshot.ts`: snapshot pedagógico congelado.
- `src/lib/services/teacher-resolver.ts`: resolución de docente por email/nombre.
- `src/lib/services/evaluations.service.ts`.
- `src/lib/services/progress-reports.service.ts`.
- `src/lib/services/family-notes.service.ts`.
- `src/lib/services/internal-notes.service.ts`.
- `src/lib/services/feature-flags.service.ts`.
- Barrel `src/lib/services/index.ts`.
- Re-export de `resolveTeacherUserId` desde `time-tracking.service.ts` para no romper imports existentes.

### Prohibido / no hecho en esta fase

- No hay componentes ni rutas nuevas.
- No se modificó `src/routes/teacher.index.tsx` ni el kiosco.
- No se modificó `lesson-notes.tsx` ni `teacher-notes-moderation.tsx`.
- No se activó ningún feature flag.
- No se publicó nada a familias.
- No se tocó facturación ni el informe financiero.
- No se reimplementó el cálculo de asistencia: todo pasa por `kardex-calculator.ts` y `student-cycle.ts`.
- No se inventaron criterios para Jeremy en la Fase 1: `evaluation_fields` quedó vacío. (La versión 0 borrador se cargó después, en la Fase 2, el 2026-10-22.)
- No se creó un usuario/UUID para Claudia/Sala D porque hoy no tiene alumnos activos en la base.

## Fase 2 — Registro de clase del docente (implementada)

### Objetivo y alcance

Incorporar la primera pantalla visible del sistema: el docente registra la evaluación de una clase en **30–90 segundos**, sin salir del kiosco y sin retirar la pestaña actual de notas a familia.

La Fase 2 se habilita **solo por piloto**, no por flag global:

- `evaluationsV2` sigue en `false`.
- El acceso se muestra si `org_settings.pilot_teacher_ids` contiene al docente resuelto.
- Pilotos confirmados: **Jeremy** (`00000000-0000-0000-0000-000000000003`), **Fernando** (`00000000-0000-0000-0000-000000000004`) y **Nathaly** (`00000000-0000-0000-0000-000000000005`).
- **Jeremy** entró al piloto el 2026-10-22 para poder ver y validar su **versión 0 borrador** de criterios (Guitarra 8, Batería 9). Mientras siga en borrador (`ui_config.draft = true`, `visible_in_report = false`) esos criterios no pueden salir en informes ni en el portal familia.

### Interfaz

- Archivo nuevo: `src/components/teacher/class-log.tsx`.
- En `/teacher` se conserva la pestaña **“Notas a familia”** (`LessonNotes`) y se agrega **“Registro de clase (BETA)”**.
- Cada tarjeta de alumno del kiosco incorpora el botón **“Registrar clase / evaluación”**, que abre la pestaña y precarga alumno, fecha, hora, duración e instrumento.
- Ambas pestañas usan `forceMount` para conservar el formulario si el docente cambia de pestaña por error.
- El formulario incluye:
  - alumno, fecha y hora;
  - modalidad de Canto: `individual` o `grupal` (nunca coro);
  - estado general de la clase (semáforo de 4);
  - puntaje global 1–10 solo para Fernando;
  - criterios dinámicos por instrumento/categoría/nivel;
  - repertorio trabajado con estado por pieza;
  - tema, tarea y comentario corto.
- La “última evaluación” visible excluye filas `is_test`.

### Criterios sembrados

Se cargaron **49 filas** en `evaluation_fields` con criterios validados:

| Docente | Instrumento | Filas | Escala |
|---|---|---:|---|
| Nathaly | Canto | 12 | Semáforo de 4 (`traffic_light`) |
| Nathaly | Piano Infantil | 12 | Semáforo de 4 (`traffic_light`) |
| Fernando | Piano | 12 | Escala 1–10 (`score_1_10`) |
| Fernando | Violín | 13 | Escala 1–10 (`score_1_10`) |

Y además **17 filas en estado v0 BORRADOR** (no validadas por el docente), cargadas el 2026-10-22:

| Docente | Instrumento | Filas | Escala | Estado |
|---|---|---:|---|---|
| Jeremy | Guitarra | 8 | `traffic_light` Inicia / En proceso / Logrado / Destacado | `draft: true`, `visible_in_report: false` |
| Jeremy | Batería | 9 | `traffic_light` Inicia / En proceso / Logrado / Destacado | `draft: true`, `visible_in_report: false` |

Reglas del borrador (innegociables hasta que Jeremy valide):

- `ui_config.draft = true`, `ui_config.status = "borrador"`, `ui_config.version = 0`, `ui_config.needs_validation = true`.
- Campos de aprobación **vacíos**: `approved_by_id`, `approved_by_name`, `approved_at`, `approved_role`.
- Comentario libre por criterio en `ui_config.validation.comment` (`ui_config.comment_enabled = true`).
- `visible_in_report = FALSE`: **prohibido** publicarlo en informes, portal familia, WhatsApp o exportaciones de las Fases 3–5. La Fase 5 debe exigir `draft = false` **y** `validation.approved_at` no nulo.
- Al validar: `draft = false`, `status = "validado"`, `validation.approved_*` completos y `visible_in_report = true`.
- `getCriteria` agrupa variantes del mismo instrumento (`Guitarra`, `Guitarra clásica`, `Guitarra eléctrica` → `guitarra`; `Batería` → `bateria`) para que los 3 alumnos con "Guitarra clásica" reciban sus criterios. Piano y Piano Infantil **no** se agrupan. El filtro por `owner_teacher_id` no se relajó.

La migración de datos de los criterios validados es `docs/migrations/009_seed_evaluation_fields.sql`, idempotente con `ON CONFLICT DO NOTHING`. Rollback: `DELETE FROM evaluation_fields WHERE created_by_name = 'Migración 009';`.

La migración del borrador de Jeremy es `docs/migrations/010_seed_evaluation_fields_jeremy_borrador.sql`, idempotente. Rollback: `DELETE FROM evaluation_fields WHERE created_by_name = 'Criterios v0 borrador (010)';`.

### Guardado y contratos

- `saveLessonEvaluation` guarda con `isTest: false`.
- La idempotencia sigue siendo por `session_key` (`<student_id>::<YYYY-MM-DD>::<HH:MM>` y `::INT` para 90 min): guardar dos veces la misma clase actualiza el mismo registro.
- No se envía ningún dato financiero.
- No se publica nada a familias en esta fase.
- `getCriteria` ahora recibe también `teacherId` para filtrar la plantilla del docente correcto.
- No se modificó `app-store.ts`, `kardex-calculator.ts` ni `student-cycle.ts`.
- No se tocó `lesson-notes.tsx`, agenda, Kardex, asistencia ni facturación.

### Verificación

- `npm run build` en verde (cliente, SSR y Nitro) después de la integración y de `forceMount`.
- Prueba de runtime con datos vivos:
  - criterios 12 (Nathaly/Canto), 12 (Nathaly/Piano Infantil), 12 (Fernando/Piano), 13 (Fernando/Violín);
  - criterios 8 (Jeremy/Guitarra), 8 (Jeremy/"Guitarra clásica"), 9 (Jeremy/Batería) y 0 (Jeremy/Piano);
  - aislamiento entre docentes: Fernando con un alumno de Guitarra ve **0** criterios de Jeremy;
  - gate del piloto: abierto para Jeremy, Nathaly y Fernando; cerrado para Karla y docentes desconocidos;
  - guardado idempotente con un alumno real;
  - relectura desde PostgreSQL;
  - exclusión de `is_test` en la última evaluación visible;
  - limpieza de la fila de prueba al finalizar.

## Modelo de datos

| Tabla | Propósito | Claves y reglas |
|---|---|---|
| `evaluation_catalog` | Catálogo de instrumentos, edades y modalidades | Incluye bloque `canto`: `min_students=1`, `max_students=5`, `modes=["individual","grupal"]`, `not_choir=true` |
| `evaluation_fields` | Criterios configurables por instrumento/edad/nivel | **66 filas**: 49 validadas (Nathaly 24, Fernando 25) + **17 borrador de Jeremy** (Guitarra 8, Batería 9) con `draft=true` y `visible_in_report=false` |
| `lesson_evaluations` | Evaluación de una clase concreta | `session_key` único; `is_test` + `test_run_id`; `class_mode` |
| `progress_reports` | Informe de progreso mensual/trimestral | Flujo `draft → pending → published | rejected`; `published_snapshot` JSONB |
| `family_notes` | Nota para familia | `scope`: `student | teacher_cohort | academy`; cohorte congelada al publicar |
| `internal_notes` | Bandeja interna Dirección/Staff | `status`: `nueva | leida | archivada`; `read_at`, `read_by_id`, `read_by_name` |
| `evaluation_audit_log` | Auditoría append-only | Solo `SELECT, INSERT` para `anon`/`authenticated`; sin `UPDATE`/`DELETE` |
| `v_test_records` | Vista de datos de prueba | Lista filas `is_test=true` para auditoría y limpieza |
| `org_settings` | Configuración global | Seeds de `feature_flags`, `pilot_student_ids`, `teacher_specialties`; sin `DELETE` |

### `session_key`

Formato determinista:

```text
<student_id>::<YYYY-MM-DD>::<HH:MM>
```

Para Plan Intensivo (90 min):

```text
<student_id>::<YYYY-MM-DD>::INT
```

Esto permite que guardar dos veces la misma clase actualice el mismo registro en lugar de duplicarlo.

### `class_mode`

Valores permitidos: `individual`, `grupal`, `no_aplica`.

- Canto: `individual` o `grupal`, nunca `coro`.
- Otros instrumentos: `no_aplica` es válido.
- El modo se guarda **por sesión**, porque un mismo alumno de Canto puede tener clases individuales o grupales según el día y horario.

## Contratos de servicio

### `evaluations.service.ts`

- `getCriteria({ instrument, ageCategory, level, teacherId })`
- `getStudentEvaluations(studentId, { from, to })`
- `getEvaluationBySessionKey(sessionKey)`
- `getLatestEvaluation(studentId)` — excluye datos de prueba.
- `saveLessonEvaluation(payload)` — idempotente por `session_key`.

### `progress-reports.service.ts`

- `createProgressReport(studentId, period, options)` — crea `draft` con snapshot pedagógico.
- `updateProgressReport(id, patch, actor)` — edita borrador/rechazado; permite `draft → pending`.
- `approveProgressReport(id, actorId, actorName)`.
- `publishProgressReport(id, actorId, actorName)` — alias explícito.
- `rejectProgressReport(id, actorId, actorName, reason)`.
- `getReportById(id)`.
- `getReportsForStudent(studentId)` — historial completo del docente/dirección.
- `getReportsForFamily(familyId)` — solo publicados, **nunca** `is_test`, y devuelve el `published_snapshot`.
- `getReportsForFamilyForAudit(familyId)` — lectura interna de Dirección; incluye `is_test`. **Nunca** usar en el portal familia.

### `family-notes.service.ts`

- `submitFamilyNote(input)` — crea en `pendiente`.
- `listFamilyNotes({ status, teacherId, studentId, scope })`.
- `approveFamilyNote(id, actorId, actorName)` — congela cohorte si es `teacher_cohort`.
- `rejectFamilyNote(id, actorId, actorName, reason)`.
- `getFamilyNoteById(id)`.
- `resolveTeacherCohort(teacherId, teacherName)` — unión de `assigned_teacher_id` + docentes del horario.
- `getPublishedFamilyNotesForStudent(studentId)`.
- `getPublishedFamilyNotesForFamily(familyId)`.
- `getPublishedFamilyNotesForStudentForAudit(studentId)` / `getPublishedFamilyNotesForFamilyForAudit(familyId)` — solo Dirección.

### `internal-notes.service.ts`

- `createInternalNote(input)`.
- `listInternalNotes({ status, studentId, teacherId, visibility, includeArchived })`.
- `markInternalNoteRead(id, actorId, actorName)`.
- `archiveInternalNote(id, actorId, actorName)`.
- `getInternalNoteById(id)`.

### `feature-flags.service.ts`

- `getFeatureFlags({ force })` — cache de 30 s.
- `isFeatureEnabled(flag, flags?)`.
- `getOrgSetting(key, fallback)`.
- `clearFeatureFlagsCache()`.

Flags actuales, todos en `false`:

```json
{
  "evaluationsV2": false,
  "familyNotesV2": false,
  "progressReportsV2": false,
  "parentReports": false
}
```

La Fase 2 no enciende `evaluationsV2`: el acceso se controla con `org_settings.pilot_teacher_ids` para no exponer la pantalla a todos los docentes antes del piloto.

## Reglas de negocio y seguridad

1. **El motor oficial manda.** El snapshot de asistencia envuelve `computeStudentCycleSessions` y `computeStudentCycleLiquidation`. No se calcula asistencia a mano.
2. **Cero finanzas en el informe pedagógico.** El snapshot y el `content` del informe no incluyen precios, abonos, saldos, facturas ni auditoría financiera.
3. **Moderación obligatoria.** Una nota de familia no se publica sola: pasa por `pendiente` y requiere aprobación de Dirección/Secretaría.
4. **Cohorte congelada.** Al publicar una nota `teacher_cohort`, se guardan `cohort_student_ids` y `cohort_snapshot_at`. Si luego entra o sale un alumno, la nota no cambia.
5. **Informe publicado inmutable.** `published_snapshot` guarda exactamente lo que verá la familia. Editar el borrador después de publicar está prohibido.
6. **`students.notes` no se toca.** Queda como legacy congelado para no romper el flujo viejo.
7. **`notification_logs` no se toca.** El sistema nuevo no depende de ese historial.
8. **Datos de prueba aislados.** `is_test=true` exige `test_run_id`. El portal familia filtra `is_test=false`. Las funciones `*ForAudit` son las únicas que pueden leer datos de prueba.
9. **Auditoría append-only.** `evaluation_audit_log` no permite `UPDATE` ni `DELETE` desde el cliente.
10. **Identidad por UUID.** El portal familia y los servicios resuelven por `student_id`/`family_id`, no por nombre.
11. **Especialidades oficiales.** Nathaly: Piano Infantil y Canto (Sala C). Fernando: Piano estándar y Violín (Sala B). Jeremy: Guitarra y Batería (Sala A). La excepción de Sylvia (Guitarra con Fernando porque Jeremy no tenía cupo) se registra como dato y se muestra como “Excepción autorizada”, no se usa para reasignar a otros alumnos.
12. **Canto no es coro.** El catálogo admite 1 a 5 alumnos, en modo individual o grupal, jamás coro.

## Verificación ejecutada

- `npm run build` en verde (cliente, SSR y Nitro).
- Arnés `scratch/test-informes-phase1.mjs` con Vite `ssrLoadModule` y datos vivos de Insforge: **24/24 pasos OK**.
- `session_key` validado para 45 min y 90 min.
- Flags leídos desde PostgreSQL y todos en `false`.
- Snapshots de los 4 pilotos:
  - Layla: cuota 8, periodo 0/4, ciclo 0%.
  - Alonso: cuota 8, periodo 4/8, ciclo 63%.
  - Kayra: cuota 4, periodo 3/4, ciclo 75%.
  - Ethan: cuota 8, periodo 7/8, ciclo 100%.
- `saveLessonEvaluation`: creación y actualización idempotente por `session_key`.
- `getLatestEvaluation`: excluye `is_test`.
- Informe: `draft → pending → published`, snapshot congelado e inmutabilidad.
- Portal familia: no ve informes `is_test`; auditoría interna sí.
- Cohorte de Nathaly: 14 alumnos congelados al publicar.
- Nota de cohorte: visible para alumno incluido, invisible para alumno fuera del grupo, invisible para el portal si es `is_test`.
- Nota interna: `nueva → leida → archivada`; la bandeja oculta archivadas por defecto.
- Limpieza: `lesson_evaluations`, `progress_reports`, `family_notes` e `internal_notes` quedaron en 0 filas.
- `evaluation_audit_log`: 53 filas, 51 de prueba; append-only por diseño. `v_test_records` lista las 51 de prueba.

### Incidencia de PostgREST y resolución

Los INSERT en `internal_notes` fallaban con `PGRST204` (“Could not find the 'status'/'read_at' column in the schema cache”) aunque las columnas y los grants existían. La causa fue cache de esquema desactualizado en PostgREST. Se resolvió con:

```sql
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
```

Tras la recarga, un POST mínimo funcionó y la prueba completa pasó. No se relajó el esquema ni los permisos.

## Consecuencias

### Positivas

- Base de datos normalizada y auditable.
- Servicios probados con datos reales.
- Flujo de moderación y snapshots congelados listos para la UI.
- Cero riesgo para kiosco, agenda, Kardex, asistencia y facturación en esta fase.
- Datos de prueba aislados y limpiables por `test_run_id`.

### Negativas / pendientes

- **No hay nada visible para el usuario final todavía.** Es intencional: la Fase 1 es infraestructura.
- Los flags están apagados; la Fase 2 se muestra solo a los docentes del piloto (Jeremy, Nathaly y Fernando).
- `evaluation_fields` tiene 66 filas: 49 validadas (Nathaly y Fernando) + 17 de Jeremy en **v0 borrador**, sin aprobación y fuera de informes hasta que él las valide.
- Claudia/Sala D no tiene UUID ni alumnos activos; su configuración queda pendiente.
- Quedan 51 filas de auditoría de prueba (append-only). No se borran por diseño.
- El flujo viejo de notas sigue activo y no se retira hasta que el nuevo esté probado.

## Fases restantes

| Fase | Entregable | Estado |
|---|---|---|
| 1 | Datos, tipos, snapshot y servicios | ✅ Implementada |
| 2 | Registro de clase docente (`class-log.tsx`, pestaña en `/teacher`) | ✅ Implementada (piloto Jeremy/Nathaly/Fernando) |
| 3 | Nota a familia + moderación (`family-note-form.tsx`, `family-notes-moderation.tsx`) | ⏳ Pendiente |
| 4 | Nota interna + bandeja (`internal-note-form.tsx`, `internal-notes-inbox.tsx`) | ⏳ Pendiente |
| 5 | Informe de progreso A4, PDF/Markdown/WhatsApp y ruta `family.progreso.tsx` | ⏳ Pendiente |
| 6 | Reportes, filtros y exportación CSV en admin | ⏳ Pendiente |
| 7 | Flags, piloto Jeremy/Nathaly/Fernando y despliegue gradual | ⏳ Pendiente |

## Resultado visible en producción

- **Fase 1:** ninguna pantalla nueva. El deploy de `b7a0795` incluye el código y la migración, pero los flags están en `false`, no hay rutas ni pestañas nuevas y el kiosco, la agenda, el Kardex y facturación siguen exactamente igual.
- **Fase 2:** los docentes del piloto (**Jeremy**, **Nathaly** y **Fernando**) ven en `/teacher` la pestaña **“Registro de clase (BETA)”** y el botón **“Registrar clase / evaluación”** en cada tarjeta de alumno. El resto de docentes y roles no ve cambios.
- La pestaña **“Notas a familia”** se conserva sin modificaciones.
- **Jeremy** usa la pestaña con sus 17 criterios en **v0 borrador** (Guitarra 8, Batería 9) y escala Inicia / En proceso / Logrado / Destacado. Esos criterios no aparecen en informes ni en el portal familia hasta que él los valide.
- No se publica nada a familias en esta fase.

La siguiente funcionalidad visible será la **Fase 3** (nota a familia con moderación).

## Referencias

- `docs/PROMPT_OPUS_IMPLEMENTACION_INFORMES.md` — plan de 7 fases.
- `docs/BRIEF_INFORMES_PROGRESO_2026_10.md` — criterios validados de Nathaly y Fernando.
- `docs/migrations/008_evaluations_progress_reports.sql`.
- `docs/migrations/008b_internal_notes_read_status.sql`.
- `docs/migrations/009_seed_evaluation_fields.sql` — 49 criterios de Fase 2, idempotente.
- `src/lib/informes/types.ts`, `utils.ts`, `attendance-snapshot.ts`.
- `src/lib/services/evaluations.service.ts`, `progress-reports.service.ts`, `family-notes.service.ts`, `internal-notes.service.ts`, `feature-flags.service.ts`, `teacher-resolver.ts`.
- `src/components/teacher/class-log.tsx` — registro de clase de Fase 2.
- `src/routes/teacher.index.tsx` — pestaña, gate de piloto y botón por tarjeta.
- `scratch/test-informes-phase1.mjs` y `scratch/test-fase2-class-log.mjs` — arneses temporales, no commiteados.
- Commit `b7a0795` — implementación Fase 1.
- Commit de Fase 2 — registro de clase y seed de criterios.
