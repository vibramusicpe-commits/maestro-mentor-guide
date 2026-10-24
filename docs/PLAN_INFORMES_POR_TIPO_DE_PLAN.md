# Plan — Informes por tipo de plan, evidencia mínima y botón del docente

**Fecha:** 2026-10-23
**Estado:** Aprobado por Dirección. **Fases A, B, C y D implementadas**
(motor y tipos, bandeja de Dirección, portal del docente, bitácora + A4 +
Markdown + WhatsApp). **Pendiente ejecutar la migración 011 en Insforge.**
**Alcance:** módulo de informes de progreso (ADR-0175). No toca Kardex, agenda,
asistencias, ciclos, facturación ni `students.notes`.

> ## Definición que gobierna todo el diseño
>
> **Un informe es el consolidado de varios reportes de clase.**
> Cada `lesson_evaluation` es un reporte de clase (qué se trabajó, criterios,
> repertorio, tarea, comentario). El informe los consolida y les suma la
> asistencia del periodo. **No** se alimenta de informes anteriores.
> Por eso: sin reportes de clase no hay informe, y el mínimo son **2**.

---

## 1. La pregunta y la respuesta corta

> Sylvia paga clase por clase (paquete flexible), asistió 5–6 veces y tal vez no
> vuelva. ¿Se le puede generar un informe? ¿El informe es un consolidado de
> varios informes? ¿Se necesita una cantidad específica?

**Respuesta corta:**

1. **Sí se le puede generar un informe**, pero hoy saldría casi vacío: el
   informe no se alimenta de informes anteriores, se alimenta de
   **evaluaciones de clase** (`lesson_evaluations`) + **asistencia**. Sylvia
   tiene 3 asistencias registradas y **0 evaluaciones de clase**.
2. **Un informe NO es un consolidado de informes.** Es un consolidado de
   **clases evaluadas + asistencia del periodo**. Los informes anteriores solo
   se usan para heredar el nivel inicial (`level_start`) en el trimestral.
3. **El mínimo es 2 clases evaluadas.** Con 2 el docente ya puede generar el
   informe si lo considera oportuno; lo recomendable es registrar más. Sin 2
   evaluaciones no hay informe: no se inventa contenido pedagógico.
4. **El informe debe contar la historia clase por clase**: cuándo inició y qué
   se trabajó/aprendió en cada sesión, no solo totales.

La pieza que falta no es "más informes": es que el docente registre la clase
con el botón que ya existe en `/teacher` (Registro de clase).

---

## 2. Lo que existe hoy (verificado en código y en PostgreSQL vivo)

### 2.1 Código

| Pieza | Estado actual |
|---|---|
| `progress_reports.period_type` | CHECK en base: **solo** `mensual` \| `trimestral` |
| Tipos TS | `ProgressReportPeriodType = "mensual" \| "trimestral"` |
| Creación | Solo en `/admin/alumnos` → pestaña **Informes** (Dirección/Secretaría) |
| Botón del docente | **No existe**. El docente solo registra clase, nota a familia y nota interna |
| Ventana del periodo | Por defecto **mes calendario**, editable a mano |
| Snapshot | `buildAttendanceSnapshot()` → motor oficial `computeStudentCycleSessions` + liquidación |
| Plan en el informe | Solo `content.student.modality` (texto). **No** guarda `planType` ni `packageTotalSessions` |
| Evidencia | No hay umbral: se puede generar un informe con 0 clases y 0 evaluaciones |
| Duplicados | Se evitan solo en la UI (busca mismo tipo + mismas fechas en memoria) |
| Estados | `draft → pending → published \| rejected`; publicado inmutable |
| Documento A4 | 2 páginas fijas (`PÁGINA 1 DE 2` / `PÁGINA 2 DE 2`), sin bitácora por clase |

### 2.2 Datos vivos (solo lectura, 2026-10-23)

Alumnos activos por plan (la columna SQL `modality` miente en flexibles, así que
se lee `emergency_contact.planType`):

| Plan real | Activos | Con evaluación de clase | Sin evaluación |
|---|---|---|---|
| Mensual | 49 (31 regular + 18 intensivo) | 2 | 47 |
| Paquete Flexible | 7 | 0 | 7 |
| Trimestral | 1 | 0 | 1 |
| **Total** | **57** | **2** | **55** |

- `lesson_evaluations` (producción): **2 filas** — Fernanda Sofía (Canto,
  21/10) y Hans (Piano, 22/10).
- `progress_reports`: **0 filas**.
- Asistencias últimas 4 semanas: **183 marcas** en 58 alumnos → el historial de
  asistencia sí existe; el de evaluaciones no.

### 2.3 El caso Sylvia, dato por dato

| Campo | Valor |
|---|---|
| `planType` | Paquete Flexible |
| `packageTotalSessions` | 8 clases |
| Vigencia | 2026-09-14 → 2026-12-31 |
| `modality` (SQL) | "Regular (8 clases / 45 min)" ← **no confiable** |
| Lecciones en horario | 2 |
| Asistencias registradas | 3 (30/09, 05/10, 07/10) |
| Evaluaciones de clase | **0** |
| Informes previos | 0 |

**Conclusión:** con la regla nueva, hoy el botón está bloqueado (0 de 2
evaluaciones). Fernando registra 2 clases y el informe se habilita.

---

## 3. Modelo propuesto: cuatro tipos de informe

| Tipo (`period_type`) | Para qué plan | Ventana | Cuándo se emite |
|---|---|---|---|
| `mensual` | Regular 2x, Regular 1x/sem, Intensivo | Ciclo activo (`planStartDate` → `planEndDate`), **no** mes calendario | Al cerrar el ciclo de 8 (o 4) clases |
| `trimestral` | Plan Trimestral | Vigencia completa (3 ciclos) | Al cierre del trimestre; convive con mensuales |
| `avance` **(nuevo)** | Paquetes largos (ej. 24 clases) | Desde `planStartDate` hasta la fecha de corte | A mitad del paquete (≈ 50 % consumido) o cuando Dirección lo pida |
| `cierre_ciclo` **(nuevo)** | Paquete Flexible, Personalizado, Demo Nivelación, y **cualquier plan cuando el alumno se retira** | `planStartDate` → última clase evaluada/asistida (o `planEndDate` si completó) | Cuando el alumno culmina, entra en pausa/baja o avisa que no continuará |

### Por qué "cierre_ciclo" y no "mensual" para Sylvia

- Su plan no es mensual: es una bolsa de 8 clases con vigencia amplia.
- Un informe mensual de setiembre/octubre partiría su proceso en pedazos
  arbitrarios y dejaría clases fuera.
- El valor para la familia es **un solo documento de cierre** con todo lo
  trabajado, que además sirve si decide volver después.

---

## 4. Regla de evidencia ("sin historial no hay informe")

### 4.1 Qué cuenta como historial

| Fuente | ¿Cuenta? | Por qué |
|---|---|---|
| `lesson_evaluations` del periodo | **Sí, es la base** | Evidencia pedagógica: tema, criterios, repertorio, tarea y comentario de cada clase |
| Asistencias (`attendanceByDate` / `attendance_logs`) | **Sí, contexto** | Dice a cuántas clases vino; no dice qué aprendió |
| Informes anteriores | **No** | Son salidas, no insumos (solo `level_start` en trimestral) |
| Notas a familia / notas internas | **No** | Otro canal y otro propósito |

### 4.2 Regla de habilitación y calidad

```
cobertura = clases_evaluadas / clases_asistidas   (presente + tarde)
```

| Estado | Condición | Qué permite |
|---|---|---|
| 🔴 **Bloqueado** | menos de 2 clases evaluadas | **No se genera informe.** La UI indica cuántas faltan y enlaza a Registro de clase |
| 🟠 **Básico** | ≥ 2 evaluadas y cobertura < 40 % | Se puede generar (decisión del docente), etiquetado como **Básico** |
| 🟡 **Parcial** | cobertura 40–69 % | Informe normal, etiquetado **Parcial** |
| 🟢 **Completo** | cobertura ≥ 70 % | Informe completo |

Excepciones:
- **Demo Nivelación / Personalizado de 1 sesión**: mínimo 1 evaluación (no se
  puede pedir 2 de una sola clase).
- **Intensivo**: se cuenta **por fecha** (los dos bloques de 45 min son una
  sola clase de 90), no por bloque.
- **Alumno en baja/pausa**: puede recibir `cierre_ciclo`; el estado
  administrativo no bloquea el cierre pedagógico.

> El mínimo de 2 es el piso duro. La cobertura no bloquea por encima de 2:
> solo etiqueta la calidad del documento para que la familia sepa qué está
> leyendo. El docente decide si genera con 2 o espera a tener más.

### 4.3 Por qué cobertura y no un número fijo

Un mínimo absoluto ("3 evaluaciones") castiga a quien tomó 4 clases y evaluó 3
(75 %) y premia a quien tomó 24 y evaluó 3 (12 %). La cobertura mide **cuánto
del proceso real quedó documentado**, que es lo que la familia necesita.

---

## 5. Ventana del periodo por plan (sin tocar el motor)

| Plan | Inicio sugerido | Fin sugerido |
|---|---|---|
| Regular 2x / 1x | `planStartDate` | `planEndDate` (ciclo vigente) |
| Intensivo | `planStartDate` | `planEndDate` |
| Trimestral | `planStartDate` | `planEndDate` |
| Paquete Flexible | `planStartDate` | `max(última clase evaluada, última asistencia, planEndDate si completó)` |
| Personalizado / Demo | `planStartDate` | `max(última clase, planEndDate)` |
| Avance (paquete largo) | `planStartDate` | Fecha de corte elegida (sugerida: 50 % de sesiones consumidas) |

Reglas:
- El usuario puede ajustar las fechas, pero el sistema **sugiere** la ventana
  del ciclo y avisa si el rango deja clases fuera.
- En renovaciones, `planStartDate`/`planEndDate` ya se actualizan (ADR-0161,
  ADR-0167), así que la ventana sigue al ciclo vigente sin lógica nueva.
- **No** se recalcula el ciclo en el módulo de informes: se reutiliza
  `computeStudentCycleSessions` (ADR-0175, prohibido duplicar).

---

## 6. Contenido del informe: la bitácora clase por clase

Requisito de Dirección: **el informe debe decir cuándo inició y qué aprendió
en cada clase**.

### 6.1 Secciones del documento

1. **Cabecera**: alumno, instrumento, docente, plan (sin montos), **fecha de
   inicio del plan**, **fecha de la primera clase**, periodo y nivel.
2. **Resumen de asistencia**: asistidas, tardanzas, faltas, justificadas,
   pendientes, % de asistencia.
3. **Bitácora de clases** (nueva): una fila por clase evaluada, en orden
   cronológico:
   - Fecha y hora · duración (45 / 90 min) · estado de asistencia.
   - **Tema / qué se trabajó** (`topic`).
   - Repertorio de esa clase y estado de cada obra.
   - Criterios evaluados en esa clase y su resultado.
   - Tarea asignada (`homework`).
   - Comentario del docente.
4. **Criterios consolidados** del periodo (último valor por criterio).
5. **Repertorio consolidado**.
6. **Narrativa pedagógica**: fortalezas, próxima meta, recomendaciones,
   mensaje a la familia, comentario del docente.
7. **Trazabilidad de evidencia**: "3 de 5 clases con registro pedagógico ·
   informe Básico/Parcial/Completo" y firmas.

Todo sale de `lesson_evaluations` (ya guarda `topic`, `repertoire`,
`homework`, `teacher_comment`, `extra_scores`, `overall_status`) y del motor de
asistencia. **No requiere columnas nuevas.**

### 6.2 Formato A4

- Páginas 1–2: resumen ejecutivo (identidad, asistencia, criterios,
  repertorio, narrativa, firmas) como hoy.
- **Anexo desde la página 3**: bitácora completa, con salto de página y
  encabezado "Anexo · Bitácora de clases". Se elimina el texto fijo
  `PÁGINA 2 DE 2` del bloque ejecutivo para no mentir cuando hay anexo.
- Paquetes de 24 clases pueden ocupar varias páginas de anexo; la tabla se
  corta por filas (`print-avoid-break`), nunca a mitad de una clase.
- Markdown y WhatsApp: el Markdown incluye la bitácora completa; WhatsApp
  incluye solo 3 hitos (inicio, avance, cierre) para no convertirlo en un
  mensaje eterno.

---

## 7. El botón del docente

### 7.1 Dónde

- **`/teacher/alumnos`**: botón **📄 Informe** en cada fila (junto a
  `📖 Kardex`), con semáforo de evidencia.
- **Nueva ruta `/teacher/informes`** (no una 6.ª pestaña: la barra de 390 px de
  ADR-0177 está calibrada a 5).
- **`class-log`**: al guardar una evaluación, aviso discreto "Ya puedes generar
  el informe" cuando se cruza el mínimo de 2.

### 7.2 Qué puede hacer el docente

1. Ver solo **sus alumnos** (mismo filtro del kiosco: `resolveTeacherClean`).
2. Ver el semáforo y qué falta ("faltan 2 evaluaciones para habilitar").
3. Pulsar **Generar borrador de informe** → se crea `draft` con
   `created_by_id = docente` y el snapshot del periodo.
4. Editar fortalezas, objetivos, recomendaciones y mensaje a la familia.
5. **Enviar a revisión** (`pending`).
6. **No puede publicar.** Dirección revisa y publica, como hoy.

### 7.3 Qué puede hacer Dirección

- Todo lo anterior para cualquier alumno (incluidos baja/pausa).
- Elegir tipo de informe (mensual / trimestral / avance / cierre) y ajustar la
  ventana sugerida.
- Ver en la bandeja el tipo, la cobertura y la etiqueta de calidad.
- Publicar, rechazar con motivo y retirar (flujo actual, sin cambios).

---

## 8. Caso Sylvia, paso a paso con la nueva regla

| Escenario | Resultado |
|---|---|
| Hoy (0 evaluaciones, 3 asistencias) | 🔴 Bloqueado: "Faltan 2 clases evaluadas". Enlace a Registro de clase |
| Fernando registra 2 evaluaciones (30/09 y 05/10) | Habilitado. Cobertura 2/3 = 67 % → 🟡 **Parcial** |
| Fernando registra 3 de 3 | 🟢 **Completo**, con bitácora de las 3 clases |
| Sylvia avisa que no continuará | Se genera `cierre_ciclo` con lo registrado; no se espera a fin de año |
| Sylvia pasa a `baja` antes de evaluar | Sigue bloqueado; Dirección puede pedirle a Fernando 2 registros retroactivos o cerrar sin informe |

Recomendación operativa: pedirle a Fernando **2–3 registros de clase**
(retroactivos, con la fecha real) antes de emitir. Es 5 minutos y cambia por
completo la calidad del documento.

---

## 9. Cambios técnicos (quirúrgicos)

### 9.1 Nuevo — `src/lib/informes/report-readiness.ts` (puro, sin red)

- `resolveReportWindow(student, sessions, kind)` → `{ start, end }` sugerido.
- `computeReportReadiness({ student, sessions, evaluations, kind })` →
  `{ level, coverage, attended, evaluated, missing, label, canGenerate, window }`.
- `MIN_EVALUATIONS` por plan (2 general, 1 demo/personalizado de 1 sesión).
- `REPORT_KIND_META` (etiqueta, descripción, ventana).
- Deduplicación de intensivos por fecha.
- **No** importa `kardex-calculator` para no crear ciclos de importación: recibe
  las sesiones ya calculadas por el llamador.

### 9.2 Nuevo — `src/lib/informes/session-log.ts` (puro)

- `buildSessionLog(evaluations)` → `SessionLogEntry[]` ordenado por fecha/hora:
  `{ date, time, durationMin, attendance, topic, repertoire, criteria,
  homework, comment }`.
- Consolida los dos bloques de un intensivo en una sola entrada.
- Es la fuente única de la bitácora para A4, Markdown y pantalla
  (ADR-0119.3).

### 9.3 `src/lib/informes/types.ts`

- `ProgressReportPeriodType` += `"avance"` y `"cierre_ciclo"`.
- `AttendanceSnapshot` += `plan: ReportPlanContext`, `evidence: ReportEvidence`
  y `sessionLog: SessionLogEntry[]`.
- `ReportPlanContext`: `planType`, `modality`, `contractedSessions`,
  `isFlexiblePackage`, `isPersonalized`, `isDemo`, `planStartDate`,
  `firstClassDate`.
- `ReportEvidence`: `level`, `coverage`, `attended`, `evaluated`, `missing`,
  `label`.
- `SessionLogEntry`: la estructura de 9.2.

### 9.4 `src/lib/informes/attendance-snapshot.ts`

- Aceptar `planContext` y `evaluations` (ya los recibe) y devolver `plan`,
  `evidence` y `sessionLog`. Sin tocar el motor: sigue llamando a
  `computeStudentCycleSessions` y `computeStudentCycleLiquidation`.

### 9.5 `src/lib/services/progress-reports.service.ts`

- `assertPeriod()` acepta `avance` y `cierre_ciclo`.
- `createProgressReport()`:
  - resuelve el plan real con `planType`/`packageTotalSessions` (no con la
    columna SQL `modality`);
  - calcula readiness y **rechaza** con mensaje accionable si
    `canGenerate === false` (menos del mínimo de evaluaciones);
  - deduplica server-side por `(student_id, period_type, period_start,
    period_end, is_test=false)`;
  - guarda `content.plan`, `content.evidence` y `content.sessionLog`.
- `listProgressReports()`: filtro opcional por `period_type`.
- **No** cambia el flujo de estados ni la inmutabilidad del publicado.

### 9.6 `src/lib/informes/progress-report-format.ts`

- `buildProgressReportView()` expone plan, evidencia y bitácora.
- Markdown: sección "Bitácora de clases" completa + trazabilidad de evidencia.
- WhatsApp: resumen + 3 hitos.
- CSS A4: encabezado de anexo y corte por filas.

### 9.7 `src/components/informes/progress-report-document.tsx`

- Añadir el anexo de bitácora desde la página 3 y ajustar la numeración fija.

### 9.8 UI

- `progress-reports-panel.tsx`: 4 tipos, ventana sugerida, semáforo, botón
  deshabilitado con motivo, filtro por tipo en la bandeja.
- `src/routes/teacher.informes.tsx` (nuevo) + botón en `teacher.alumnos.tsx`.
- Gate: `useTeacherPilotAccess()` + `useInformesAccess()`; docente solo ve sus
  alumnos.

### 9.9 Migración SQL — `docs/migrations/011_progress_reports_tipos_plan.sql`

```sql
alter table progress_reports drop constraint progress_reports_period_type_check;
alter table progress_reports add constraint progress_reports_period_type_check
  check (period_type in ('mensual','trimestral','avance','cierre_ciclo'));

create unique index if not exists progress_reports_unique_period
  on progress_reports (student_id, period_type, period_start, period_end)
  where is_test = false and status <> 'rejected';
```

- Aditiva y reversible (rollback borra el índice y restaura el CHECK anterior).
- **No** se agregan columnas: plan, evidencia y bitácora van en `content` jsonb.
- **No** se tocan filas existentes (hoy hay 0 informes).

---

## 10. Fases de implementación

| Fase | Entrega | Verificación |
|---|---|---|
| **A** | Migración 011 + `report-readiness.ts` + `session-log.ts` + tipos + snapshot + servicio | Arnés en `scratch/` con datos vivos: Sylvia, regular, intensivo, trimestral, paquete largo, baja/pausa, transición. `npm run build` verde |
| **B** | UI Dirección: 4 tipos, ventana sugerida, semáforo, bloqueo, filtro por tipo | Manual + build; 0 datos financieros |
| **C** | Botón docente + `/teacher/informes` + gate de piloto | Rutas 200 a 390 px; docente solo ve sus alumnos; no puede publicar |
| **D** | Bitácora en A4 (anexo), Markdown y WhatsApp; etiqueta de calidad | PDF sin cortes a mitad de fila; Markdown sin `S/` |
| **E** | ADR-0180, AGENTS §83, CHANGELOG 2.0.50, log, checklist de apertura | Push a `origin` y `core` |

Cada fase: commits con rutas explícitas, sin `scratch/*`, sin `git add -A`.

---

## 11. Criterios de aceptación

1. **Sylvia con 0 evaluaciones** → botón bloqueado con mensaje accionable
   ("faltan 2 clases evaluadas") y enlace a Registro de clase.
2. **Sylvia con 2 evaluaciones** → informe generado con bitácora de 2 clases,
   etiqueta **Parcial** (2/3) y fecha de inicio visible.
3. **Sylvia con 3 evaluaciones** → informe **Completo** con bitácora de 3.
4. **Regular** → la ventana sugerida es su ciclo, no el mes calendario.
5. **Intensivo** → 2 bloques = 1 sesión; la bitácora dice 90 min, no dos clases.
6. **Paquete de 24 clases** → puede emitir `avance` a mitad y `cierre_ciclo` al
   final; la bitácora pagina sin cortar clases.
7. **Sin asistencias** → nunca se genera informe.
8. **Duplicado** → el segundo intento abre el informe existente (UI + índice).
9. **Publicado** → inmutable; la familia solo ve `published` + `is_test=false`.
10. **Cero finanzas** en pantalla, PDF, Markdown, WhatsApp y CSV.
11. **Alumno en baja** → puede cerrarse su ciclo; su historial no desaparece.
12. **Docente no publica**; Dirección sí.

---

## 12. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Solo 2 de 57 alumnos tienen evaluaciones → el botón nace bloqueado | Registro retroactivo desde `class-log` (permite elegir fecha) y campaña de 2 semanas con los 3 docentes |
| `modality` SQL dice "Regular" en flexibles | Usar `planType` + `packageTotalSessions`; nunca la columna para decidir |
| Bitácora de 24 clases hace el PDF larguísimo | Anexo paginado; WhatsApp solo 3 hitos; Markdown completo para auditoría |
| Docente registra 2 clases y genera un informe pobre | Etiqueta **Básico** visible en el documento y en la bandeja |
| Cambio de instrumento a mitad de ciclo | El snapshot toma instrumento/docente del periodo; el detalle de transición queda para v2 |
| Docente olvida enviar a revisión | La bandeja de Dirección muestra borradores con antigüedad |
| El índice único choca con informes rechazados | Se excluye `status = 'rejected'` del índice |

---

## 13. Decisiones aprobadas (2026-10-23)

1. **Mínimo 2 clases evaluadas** para generar. El docente decide si genera con
   2 o espera a tener más. Sin 2, no hay informe (no se inventa contenido).
   *Demo/Personalizado de una sola sesión: mínimo 1.*
2. **El informe debe incluir la bitácora clase por clase**: fecha de inicio,
   tema, repertorio, criterios, tarea y comentario de cada sesión.
3. **El docente genera borrador y envía a revisión.** Dirección publica.
4. **Umbral de calidad**: 40 % parcial / 70 % completo (solo etiqueta, no
   bloquea por encima de 2 evaluaciones).
5. **Se incluye el tipo `avance`** desde ahora para paquetes largos.
6. **Los 4 tipos de informe**: mensual, trimestral, avance, cierre de ciclo.

---

## 14. Estado de implementación — Fase A (2026-10-23)

### 14.1 Entregado

| Archivo | Cambio |
|---|---|
| `src/lib/informes/report-readiness.ts` | Nuevo. Plan real (`planType`, no la columna `modality`), ventana por tipo, mínimo 2 reportes, cobertura 40/70 %, mensajes accionables. |
| `src/lib/informes/session-log.ts` | Nuevo. `buildSessionLog()`: bitácora clase por clase; consolida los dos bloques de 45 min de un intensivo en una entrada de 90 min. |
| `src/lib/informes/types.ts` | `PeriodType` += `avance` y `cierre_ciclo`; nuevos `ReportPlanContext`, `ReportEvidence`, `SessionLogEntry`; `AttendanceSnapshot` ahora incluye `plan`, `evidence` y `sessionLog`. |
| `src/lib/informes/attendance-snapshot.ts` | Devuelve plan, evidencia y bitácora; acepta `kind`; filtra las evaluaciones al periodo. Sigue usando el motor oficial. |
| `src/lib/services/progress-reports.service.ts` | `assertPeriod` acepta 4 tipos; guard que **rechaza** sin el mínimo de reportes; dedupe en servidor (devuelve el existente); guarda `content.plan`, `content.evidence` y `content.sessionLog`; filtro `periodType` en la bandeja. |
| `docs/migrations/011_progress_reports_tipos_plan.sql` | CHECK con 4 tipos + índice único parcial por alumno/tipo/ventana. |

### 14.2 Verificado en runtime con datos vivos (40/40, solo lectura)

`scratch/test-fase-a-informes.mjs`:

- **Sylvia**: Paquete Flexible, 8 clases, mínimo 2, ventana 2026-09-14 → 2026-10-07.
  Con 0 reportes: **bloqueada** ("Faltan 2 reporte(s) de clase...").
  Con 2: habilitada, **Básico 25 %**. Con 8: **Completo 100 %**.
- **Bitácora**: orden cronológico, 45 min por clase regular, hora de fin y
  criterios formateados.
- **Intensivo (ALEXIS)**: 4 clases contratadas (el `packageTotalSessions: 8`
  heredado ya no manda); 2 bloques de 45 min = **1 entrada de 90 min**
  (09:00 → 10:30) y **1 solo reporte** para la cuota.
- **Regular**: ventana = ciclo contractual, no el mes calendario.
- **Trimestral**: ventana = vigencia completa.
- **Paquete 24**: `avance` corta en la clase 12.
- **Snapshot**: CERO datos financieros (`S/`, precios, saldos, facturas).
- **Sin asistencias ni reportes**: nunca genera.

`npm run build` en verde.

### 14.3 Pendiente antes de probar `avance` / `cierre_ciclo` en producción

Ejecutar `docs/migrations/011_progress_reports_tipos_plan.sql` en Insforge
PostgreSQL. Sin esa migración, el CHECK actual rechaza los dos tipos nuevos.
La Fase A ya está desplegable: `mensual` y `trimestral` siguen funcionando
con el guard de mínimo de 2 reportes.
---

## 15. Estado de implementación — Fase B (Bandeja de Dirección, 2026-10-23)

### 15.1 Entregado (`src/components/admin/progress-reports-panel.tsx`)

- **Cuatro tipos de informe** en el selector (`Ciclo mensual`, `Trimestral`,
  `Avance`, `Cierre`) con la pista de para qué plan aplica cada uno.
- **Ventana sugerida automática**: al elegir alumno o tipo, las fechas se
  rellenan con `resolveReportWindow()`. Se recalcula solo cuando cambia
  `alumno|tipo`, de modo que el ajuste manual del usuario no se pisa.
- **Semáforo de evidencia** (rojo / naranja / ámbar / verde) con
  `evaluated/attended` clases con reporte y el mensaje accionable.
  Lee los reportes de clase reales con `getStudentEvaluations()`.
- **Botón "Generar informe" bloqueado** cuando `evidence.canGenerate` es
  false; se muestra el motivo debajo y `handleGenerate` aborta con el mismo
  mensaje (doble defensa: UI + servicio).
- **Filtro por tipo** en la bandeja general y en el CSV (`Tipo de periodo`
  ahora usa `PERIOD_TYPE_LABELS`: ya no etiqueta todo como "Mensual").
- **Etiqueta de tipo correcta** en cada fila de la bandeja.

### 15.2 Verificado en runtime con datos vivos (solo lectura)

`scratch/test-fase-b-panel.mjs`: filtros `mensual`/`trimestral`/`avance`/
`cierre_ciclo` responden sin romper PostgREST; `""` equivale a sin filtro;
cero campos financieros en la bandeja.

Barrido de los **57 alumnos activos**: **0 habilitados, 57 bloqueados**, todos
con mensaje accionable. Casos reales:
- **Hans** (Mensual, 8 clases): 1 reporte, falta 1.
- **Fernanda Sofía** (Mensual): 1 reporte, 3 asistencias, falta 1.
- **Sylvia** (Paquete Flexible): 0 reportes, faltan 2.

Es el comportamiento esperado: todavía no hay reportes de clase suficientes en
producción. El botón se habilita en cuanto el docente registre el segundo.

`npm run build` en verde; `npx tsc --noEmit` sin errores nuevos en los
archivos tocados (el panel arrastra errores previos de `index signature`).
---

## 16. Estado de implementación — Fase C (Portal del docente, 2026-10-23)

### 16.1 Entregado

| Archivo | Cambio |
|---|---|
| `src/lib/informes/report-kinds.ts` | Nuevo. Fuente única de los 4 tipos (etiqueta, pista), etiquetas de listado y colores del semáforo. Dirección y Docente lo importan; prohibido duplicarlo. |
| `src/components/teacher/teacher-progress-reports.tsx` | Nuevo. El docente elige **uno de sus alumnos activos**, ve plan/ventana/semáforo, genera el borrador, escribe las 4 secciones y lo **envía a revisión**. Nunca publica. |
| `src/routes/teacher.informes.tsx` | Nuevo. Ruta `/teacher/informes` con `?student=<uuid>` para llegar con el alumno preseleccionado. |
| `src/routes/teacher.alumnos.tsx` | Botón **📄 Informe** por alumno (link con `?student=`) y acceso **📄 Mis informes de progreso** en la cabecera. |
| `src/hooks/use-teacher-pilot-access.ts` | Nuevo campo `progressReportsAccess` (`progressReportsV2` o docente en `pilot_teacher_ids`). |
| `src/components/admin/progress-reports-panel.tsx` | Pasa a consumir `report-kinds.ts` (sin listas locales). |

### 16.2 Reglas respetadas

- **El docente no publica**: el componente solo importa `createProgressReport`,
  `listProgressReports` y `updateProgressReport`. Publicar sigue siendo
  exclusivo de Dirección (`approveProgressReport`/`publishProgressReport`).
- `updateProgressReport` ya limita el estado a `draft` o `pending`; el
  envío a revisión exige al menos una sección escrita.
- **Alcance**: solo `teacherStudentList` (sus alumnos activos); nunca la base
  completa. La lista de "Mis informes" se filtra por esa misma lista de UUID.
- **Misma evidencia que Dirección**: `buildReportPlanContext` +
  `resolveReportWindow` + `computeReportReadiness`. Si divergieran, el
  docente generaría un informe que Dirección no podría conciliar.
- Mínimo 2 reportes de clase (1 en Demo/Personalizado) antes de generar.
- Cero datos financieros; identidad por UUID; nada de `localStorage`.

### 16.3 Verificado en runtime (`scratch/test-fase-c-teacher.mjs`, 11/11)

- Gate abierto para **Jeremy, Nathaly y Fernando** (los 3 están en el piloto).
- **Jeremy**: 24 alumnos activos propios de 57 totales → el alcance excluye a
  los otros 33 (control negativo incluido).
- El componente **no importa** aprobar, publicar ni rechazar; solo guarda
  `draft`/`pending`.
- La evidencia resuelve para 8/8 alumnos muestreados.
- `/teacher/informes` en HTTP 200.

Rutas verificadas en vivo: `/`, `/teacher`, `/teacher/alumnos`,
`/teacher/informes`, `/admin/alumnos` y `/family` → 200.
`npm run build` en verde.

---

## 17. Estado de implementación — Fase D (Bitácora, A4, Markdown y WhatsApp, 2026-10-23)

> Un informe **no** es un resumen suelto: es el consolidado de varios
> **reportes de clase** (`lesson_evaluations`) más la asistencia del periodo.
> La Fase D hace visible esa evidencia en los tres formatos de salida.

### 17.1 Entregado

| Archivo | Cambio |
|---|---|
| `src/components/informes/report-session-log-annex.tsx` | **Nuevo.** Anexo A4 de bitácora (páginas 3+). Lo comparten el diálogo de Dirección y el documento del portal familia: una sola implementación de la tabla. `print-page-break`, `colgroup` `5+11+12+7+11+32+22 = 100 %`, encabezado **"Inicio del proceso"** y clases documentadas vs contratadas. |
| `src/lib/informes/progress-report-format.ts` | `ProgressReportView` expone `plan`, `evidence` y `sessionLog`. Markdown con `## Bitácora clase por clase` (`### Clase N · ISO · horario · asistencia`) + "Inicio del proceso documentado". WhatsApp reducido a **exactamente 3 hitos**. Nuevos: `PERIOD_TYPE_NOUN`, `SESSION_ATTENDANCE_LABELS`, `formatSessionAttendance`, `formatSessionSlot`, `repertoireLabel`, `repertoireStatusLabel`, `reportPageLabel`, `buildWhatsAppHighlights`. |
| `src/components/informes/progress-report-document.tsx` | Rótulos dinámicos vía `reportPageLabel` y anexo compartido. Tabla de repertorio pasa a `repertoireStatusLabel`. |
| `src/components/admin/progress-report-dialog.tsx` | Mismo rótulo dinámico y anexo compartido en el A4 editable de Dirección. |

### 17.2 Reglas respetadas

- **Rótulo honesto**: sin bitácora `PÁGINA N DE 2`; con bitácora
  `PÁGINA N DE 2 · ANEXO`. Se elimina el "PÁGINA 2 DE 2" fijo, que mentía
  cuando el documento crecía a 3+ hojas.
- **Compatibilidad**: los informes creados antes de la Fase A no tienen
  `content.sessionLog`; el anexo no se renderiza y los rótulos siguen
  correctos.
- **Intensivo**: los dos bloques de 45 min de una misma fecha se consolidan en
  **una** entrada de 90 min (`09:00–10:30`), tanto en el anexo como en el
  Markdown.
- **WhatsApp**: 3 hitos (constancia, logro, próxima meta) con respaldo honesto
  cuando falta información; nunca inventa un logro. El detalle completo vive en
  el PDF y en el portal familia.
- **Repertorio**: el tipo real es
  `logrado | en_proceso | pendiente | no_corresponde`. Las comparaciones con
  `"consolidada"` eran ramas muertas que dejaban todas las obras como
  "Iniciada"; se centralizaron en `repertoireStatusLabel()`.
- Cero datos financieros en el anexo, el Markdown y el WhatsApp.
- No se tocó `app-store.ts`, `kardex-calculator.ts` ni `student-cycle.ts`.

### 17.3 Verificado en runtime (`scratch/test-fase-d-documento.mjs`, 28/28)

- Bitácora 8/8 entradas en orden cronológico (`2026-09-14` → `2026-10-07`) y
  `timeEnd` calculado (`16:45–17:30`).
- Intensivo: dos bloques de 45 min → **una** entrada `09:00–10:30 (90 min)`.
- Markdown: 8 bloques `### Clase N`, fecha de inicio, tema/tarea/comentario,
  sin datos financieros.
- WhatsApp: **3 hitos** en los 4 escenarios (completo, sin asistencia, sin
  logros ni metas, sin nada).
- Anexo: 8 filas, anchos `5+11+12+7+11+32+22 = 100`, `print-page-break`,
  fecha de inicio y repertorio trabajado.
- Rutas `/admin/alumnos`, `/family/progreso` y `/teacher/informes` → 200.

`npm run build` en verde.

### 17.4 Bloqueo operativo — RESUELTO (2026-10-23)

La migración `docs/migrations/011_progress_reports_tipos_plan.sql` fue **aplicada y verificada exitosamente**:

- Constraint `progress_reports_period_type_check` ampliado a los 4 tipos: `mensual`, `trimestral`, `avance` y `cierre_ciclo`.
- Índice único parcial `progress_reports_unique_period` creado: `(student_id, period_type, period_start, period_end) WHERE is_test = false AND status <> 'rejected'`.
- Ejecutado con el rol `postgres` (dueño de la tabla).
- Verificado con inserción y borrado limpio (0 filas residuales).
- Todos los 4 tipos de informe están 100 % habilitados y operativos.