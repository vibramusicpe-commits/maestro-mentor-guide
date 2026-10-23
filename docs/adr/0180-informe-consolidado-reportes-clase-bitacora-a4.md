# ADR-0180: Informe como Consolidado de Reportes de Clase, 4 Tipos de Plan, Bitácora y Anexo A4

**Fecha:** 2026-10-23
**Estado:** Aceptado e implementado (Fases A–D). **Migración 011 pendiente de ejecutar en Insforge.**
**Autores:** Equipo Vibra (Open Code)

---

## Contexto

Hasta la Fase 7 de ADR-0175, un informe de progreso era un documento que
Dirección armaba a mano con el resumen de asistencia del periodo. Tenía cuatro
huecos que se volvieron bloqueantes en producción:

1. **Se podía generar un informe con 0 clases.** No había umbral de evidencia.
2. **Un solo tipo de periodo útil** (`mensual`, y `trimestral` en el CHECK de la
   base). No había forma de expresar un corte de avance ni el cierre de un
   paquete flexible.
3. **No contaba la historia**: el documento mostraba totales pero no **qué se
   trabajó en cada clase** ni **cuándo inició el proceso**, que es justamente lo
   que la familia pide ver.
4. **El docente no tenía botón**: solo Dirección podía crear informes, aunque
   el único que registra la clase es el docente.

Dirección fijó la definición que gobierna todo el diseño:

> **Un informe es el consolidado de varios reportes de clase**
> (`lesson_evaluations`) **más la asistencia del periodo.**
> **No** se alimenta de informes anteriores.

De ahí se derivan las reglas duras: sin reportes de clase no hay informe, el
mínimo son **2**, y el informe debe contener el inicio del proceso y la bitácora
sesión por sesión.

### Caso que motivó la discusión

**Sylvia** (`26d69ca0-…c1c1`, MASTER, Canto con Nathaly) paga por clase: plan
**Paquete Flexible** de 8 clases, vigencia 2026-09-14 → 2026-12-31, con las 8
asistencias ya consumidas (14/09, 16/09, 21/09, 23/09, 28/09, 30/09, 05/10,
07/10). Al cerrar su bolsa, Dirección necesitaba un **informe de cierre**, no un
"informe mensual" de un mes calendario que no representa su contrato.

---

## Decisión

### 1. Cuatro tipos de informe, no dos

| Tipo | Para qué plan | Ventana sugerida |
|---|---|---|
| `mensual` (Ciclo mensual) | Regular 8 clases / Intensivo 4 clases | Ciclo vigente: `planStartDate` → `planEndDate` |
| `trimestral` | Plan trimestral | Vigencia completa del trimestre |
| `avance` | Paquete largo (ej. 24 clases a demanda) | Corte intermedio, hasta consumir la mitad de la bolsa |
| `cierre_ciclo` | Paquete flexible que termina, personalizado, retiro | Hasta la última clase evaluada o asistida |

**La ventana mensual/trimestral es el ciclo contractual, no el mes calendario.**
Un plan que va del 05/10 al 04/11 no se parte en dos meses.

Fuente única TS: `src/lib/informes/report-kinds.ts` (etiquetas, pistas y colores
del semáforo) consumida por la bandeja de Dirección y el portal del docente.
Prohibido reimplementar listas locales (ADR-0119.3).

La base se alinea con la migración
`docs/migrations/011_progress_reports_tipos_plan.sql`:

- CHECK `period_type in ('mensual','trimestral','avance','cierre_ciclo')`.
- Índice único parcial `(student_id, period_type, period_start, period_end)`
  donde `is_test = false and status <> 'rejected'`: impide duplicados vivos sin
  bloquear la corrección de un informe rechazado.

### 2. El plan real sale de la ficha, nunca de la columna SQL `modality`

`buildReportPlanContext()` (`report-readiness.ts`) resuelve el plan desde
`planType`, `modality` y `packageTotalSessions`:

- **El contrato manda sobre `packageTotalSessions`**: Intensivo = 4 clases
  (ALEXIS traía 8 heredado), Demo y Personalizado = 1, Flexible = la bolsa
  contratada, Regular = 8.
- Es la misma corrección de ADR-0151: en alumnos flexibles la columna SQL
  `modality` puede decir "Regular (8 clases / 45 min)" y degradar la bolsa.

### 3. Evidencia mínima y semáforo de cobertura

| Regla | Valor |
|---|---|
| Mínimo de reportes de clase | **2** (`MIN_EVALUATIONS_DEFAULT`) |
| Excepción Demo / Personalizado de una sesión | **1** (`MIN_EVALUATIONS_SINGLE_SESSION`) |
| Cobertura parcial (etiqueta) | **≥ 40 %** de las clases asistidas |
| Cobertura completa (etiqueta) | **≥ 70 %** |

- `evaluationKeys()` deduplica del lado del servidor: en Intensivo, los dos
  bloques de 45 min de una misma fecha cuentan como **un** reporte (clave =
  fecha); en Regular, la clave es `fecha::hora`.
- Sin el mínimo, `createProgressReport` lanza `InformesValidationError` y tanto
  el panel de Dirección como el del docente lo muestran con `toast.error`.
- Los umbrales 40/70 **solo etiquetan**: no bloquean por encima del mínimo. Un
  informe con 2 reportes sobre 8 clases es legítimo, aunque se marque "parcial".
- **No existe "constancia de asistencia"** como sustituto: el mínimo duro son
  reportes de clase.

### 4. Bitácora clase por clase (`content.sessionLog`)

`buildSessionLog()` (`src/lib/informes/session-log.ts`) es la fuente única:

- Orden **cronológico ascendente** (así se lee un proceso de aprendizaje).
- Cada entrada lleva fecha, hora y hora de fin, duración, asistencia, tema
  trabajado, repertorio, criterios, estado general, tarea y comentario.
- **Intensivo**: los dos bloques de 45 min de una fecha se consolidan en **una**
  entrada de 90 min (`09:00–10:30`), no en dos clases.
- Se guarda en `content.sessionLog` (jsonb). **No se agregaron columnas.**

### 5. A4: páginas 1–2 ejecutivas + anexo de bitácora desde la página 3

- Nuevo `src/components/informes/report-session-log-annex.tsx`, **compartido**
  por el diálogo de Dirección (`progress-report-dialog.tsx`) y el documento de
  solo lectura del portal familia (`progress-report-document.tsx`). Una sola
  implementación de la tabla (ADR-0119.3).
- Arranca con `.print-page-break` (ADR-0137) y usa `colgroup` con anchos
  porcentuales que suman 100 %: `5 + 11 + 12 + 7 + 11 + 32 + 22`.
- Encabezado con **"Inicio del proceso"**, número de clases documentadas frente
  a las contratadas y el plan real.
- **Rótulo honesto**: `reportPageLabel(page, hasAnnex)` devuelve
  `PÁGINA N DE 2` sin bitácora y `PÁGINA N DE 2 · ANEXO` con bitácora. Se
  elimina el "PÁGINA 2 DE 2" fijo que mentía cuando el documento tenía 3+ hojas.
- Informes creados antes de la Fase A no tienen `content.sessionLog`: el anexo
  no se renderiza y los rótulos siguen correctos (compatibilidad hacia atrás).

### 6. Tres formatos, una sola fuente

`src/lib/informes/progress-report-format.ts` concentra vista, Markdown,
WhatsApp y el CSS de impresión:

- **A4**: resumen ejecutivo + anexo.
- **Markdown completo** (auditoría / LLM / archivo): incluye
  `## Bitácora clase por clase` con un bloque `### Clase N · ISO · horario ·
  asistencia` por sesión, tema, repertorio, criterios, estado, tarea y
  comentario; además de "Inicio del proceso documentado".
- **WhatsApp: exactamente 3 hitos** — (1) constancia en sala, (2) logro
  observado, (3) próxima meta — con respaldo honesto cuando falta información:
  si no hay logros registrados no inventa uno, usa el último tema trabajado.
  El detalle completo vive en el PDF y en el portal familia.

### 7. El docente genera y envía; Dirección publica

- Portal del docente en `/teacher/informes` (con `?student=<uuid>`), habilitado
  por `flags.progressReportsV2 || isPilotTeacher`, con alcance limitado a
  `teacherStudentList`.
- El componente del docente solo importa `createProgressReport`,
  `listProgressReports` y `updateProgressReport` (este último ya limita a
  `draft`/`pending`). **No puede publicar.**
- El flujo `draft → pending → published | rejected` y la inmutabilidad de
  `published_snapshot` quedan intactos.

---

## Verificación

### Fase A — motor (`scratch/test-fase-a-informes.mjs`, 40/40)
Plan real, ventana por tipo, mínimo 2/1, cobertura 40/70, dedupe de Intensivo y
guard de creación del lado del servidor.

### Fase B — panel de Dirección (`scratch/test-fase-b-panel.mjs`, 57 alumnos)
57 activos → **0 habilitados / 57 bloqueados** con el mínimo de 2 (los datos
vivos solo tienen 1 evaluación en Hans y 1 en Fernanda Sofía). Selector de 4
tipos, ventana sugerida, semáforo y filtro/CSV por tipo. Cero campos
financieros.

### Fase C — portal del docente (`scratch/test-fase-c-teacher.mjs`, 11/11)
Gate abierto para Jeremy, Nathaly y Fernando; Jeremy ve 24 de 57 alumnos (control
negativo con los otros 33); el componente no importa aprobar/publicar/rechazar;
`/teacher/informes` en 200.

### Fase D — documento (`scratch/test-fase-d-documento.mjs`, 28/28)
- Bitácora 8/8 entradas, orden cronológico, `timeEnd` calculado.
- Intensivo: dos bloques de 45 min → una entrada `09:00–10:30 (90 min)`.
- Markdown: 8 bloques `### Clase N`, fecha de inicio, tema/tarea/comentario y
  **cero datos financieros**.
- WhatsApp: **3 hitos** en los 4 escenarios (completo, sin asistencia, sin
  logros ni metas, sin nada).
- Anexo: 8 filas, anchos `5+11+12+7+11+32+22 = 100`, `print-page-break`, fecha
  de inicio y repertorio.
- Rutas `/admin/alumnos`, `/family/progreso` y `/teacher/informes` → 200.

`npm run build` en verde en todas las fases.

---

## Consecuencias

- Un informe ya no puede publicarse vacío: o hay reportes de clase, o no hay
  informe. La calidad pedagógica deja de depender de la memoria de Dirección.
- La familia recibe **la historia de su hijo**, no solo un promedio: qué se
  trabajó cada día y desde cuándo.
- El A4 nunca miente sobre su longitud; el anexo es la evidencia auditable.
- El docente gana el botón que faltaba, pero **no** gana la potestad de publicar:
  la moderación de Dirección sigue siendo obligatoria.
- WhatsApp deja de ser un volcado de texto: tres hitos, siempre tres, sin
  inventar logros.
- **Bloqueo operativo pendiente**: mientras no se ejecute la migración 011, la
  base rechaza `avance` y `cierre_ciclo`. `mensual` y `trimestral` siguen
  funcionando. El usuario/Dirección debe correr
  `docs/migrations/011_progress_reports_tipos_plan.sql` en Insforge (los
  agentes solo tienen lectura sobre esa base).
- Los 17 criterios de Jeremy siguen en `draft = true` y por tanto siguen
  bloqueando la publicación de informes que los incluyan (ADR-0175, Fase 5).

## Referencias

- `src/lib/informes/report-readiness.ts`
- `src/lib/informes/session-log.ts`
- `src/lib/informes/report-kinds.ts`
- `src/lib/informes/progress-report-format.ts`
- `src/lib/informes/attendance-snapshot.ts`
- `src/lib/services/progress-reports.service.ts`
- `src/components/informes/report-session-log-annex.tsx`
- `src/components/informes/progress-report-document.tsx`
- `src/components/admin/progress-report-dialog.tsx`
- `src/components/admin/progress-reports-panel.tsx`
- `src/components/teacher/teacher-progress-reports.tsx`
- `src/routes/teacher.informes.tsx`
- `docs/migrations/011_progress_reports_tipos_plan.sql`
- `docs/PLAN_INFORMES_POR_TIPO_DE_PLAN.md`
- `docs/adr/0175-fase-1-evaluaciones-informes-progreso-notas-sin-ui.md`
- `docs/logs/2026-10-23-fase-d-informes-bitacora-a4.log`
