# ADR-0150: Blindaje de Fechas de Inicio de Clases, Soporte Integral de Paquetes Flexibles (24 Clases) y Reactivación Dinámica de Vista por Mes en Kardex

## Estado
Aceptado

## Fecha
2026-10-01

## Contexto
Durante las operaciones de agendamiento y reprogramación en producción, se identificaron tres discrepancias críticas en la gestión del calendario lectivo y el Kardex de Asistencias:

1. **Omisión de Fecha de Inicio en Horario Semanal (`planStartDate`)**:
   Al agendar un nuevo horario desde `ScheduleStudentForm`, las lecciones recurrentes creadas omitían la propiedad `effectiveFrom: startStr`. En consecuencia, el motor de proyección proyectaba clases previas a la fecha contractual en que el alumno realmente empezaba sus clases. Adicionalmente, el cálculo de fechas con `new Date(startStr).toISOString()` sufría un retroceso de 1 día debido al desfase horario de UTC frente a UTC-5 (hora de Perú).

2. **Truncamiento Prematuro de Paquetes Flexibles (Caso Andrea Fernanda — 10 vs 24 clases)**:
   Al registrar o recalcular un alumno con Paquete Flexible (A demanda), se le asignaba una vigencia de solo 1 mes calendario (`planEndDate: 2026-07-31`). Al evaluar el filtro `isBeyondEnd = curDateStr > effectivePlanEndDate`, el sistema descartaba todas las clases regulares posteriores a julio. Dado que julio solo contenía 10 sesiones disponibles entre lunes y miércoles, las restantes 14 clases del paquete contratado (24 sesiones) desaparecían del Kardex y del Horario.

3. **Desconexión y Pantalla Vacía en la Pestaña "Por Mes" (Mes Calendario)**:
   En `student-attendance-kardex.tsx`, la vista "Por Mes" simplemente filtraba el arreglo `allCycleSessions` por el mes seleccionado (`selectedMonth`). Debido a que `allCycleSessions` representaba un único ciclo contractual acotado a la fecha de inicio del alumno (terminando en julio o agosto), cuando secretaría navegaba a "Setiembre" u "Octubre", el filtro devolvía un arreglo vacío (`[]`), dejando la vista mensual completamente inutilizable.

## Decisiones Técnicas

### 1. Inyección Estricta de `effectiveFrom` y Aritmética de Fechas Local en `ScheduleStudentForm`
- Toda lección recurrente generada en `ScheduleStudentForm` incluye explícitamente `effectiveFrom: startStr`.
- El cálculo de `planEndDate` se realiza mediante aritmética de fechas local de calendario (`Date(y, m + durationMonths, d)` formateada a `YYYY-MM-DD`), erradicando la regresión horaria de `toISOString()`.
- Para planes de Paquete Flexible (A demanda), la fecha límite se establece automáticamente con un horizonte extendido (mínimo a fin de año) para permitir el consumo de la bolsa completa de clases.

### 2. Exención de `isBeyondEnd` para Paquetes Flexibles en Kardex y Proyección de Ciclos
- En `kardex-calculator.ts` (`computeStudentCycleSessions`) y `student-attendance-kardex.tsx` (`allCycleSessions`), la condición de corte por fin de vigencia:
  ```ts
  const isBeyondEnd = (!isFlexiblePackage && effectivePlanEndDate) ? curDateStr > effectivePlanEndDate : false;
  ```
  exime formalmente a los paquetes flexibles.
- La vigencia de un Paquete Flexible está determinada exclusivamente por la cantidad de sesiones consumidas frente a la cuota contratada (`packageTotalSessions`, ej. 24 clases), nunca por un candado de mes calendario de 30 días.
- La ventana de escaneo para paquetes flexibles se amplía a 240 días (`maxDaysToScan = 240`), garantizando que las 24 sesiones se proyecten de forma continua a través de todos los meses necesarios (julio, agosto, setiembre, octubre).

### 3. Computación Dinámica del Mes Calendario vía `computeStudentMonthSessions`
- Se implementó y exportó la función `computeStudentMonthSessions` en `src/lib/kardex-calculator.ts`, la cual calcula en tiempo real todas las sesiones pertenecientes al mes y año calendario seleccionados:
  - Respeta `effectivePlanStartDate` como piso temporal absoluto (no proyecta clases previas al inicio).
  - Evalúa marcas de asistencia existentes (`attendanceByDate[dateStr]`), reprogramaciones puntuales (`dateStr`) y exclusiones (`excludedDates`).
  - Aplica barreras temporales absolutas de transición (`effectiveFrom` / `effectiveUntil`).
- En `student-attendance-kardex.tsx`, cuando la pestaña activa es `"calendar"`, se invoca directamente `computeStudentMonthSessions`, permitiendo navegar libremente entre Julio, Agosto, Setiembre, Octubre y cualquier mes con datos en vivo.
- Se expandió la interfaz de usuario con botones de acceso rápido para Julio, Agosto, Setiembre y Octubre, además del menú desplegable completo.

## Consecuencias
- **Precisión Contractual**: Las fechas de inicio de clases (`planStartDate`) se respetan en todos los planes sin generar clases fantasma en días previos.
- **Consumo Completo de Paquetes Flexibles**: Los alumnos de Paquete Flexible (como Andrea Fernanda) visualizan y gestionan la totalidad de sus 24 sesiones contratadas a través de los meses respectivos sin desaparición de clases.
- **Vista por Mes Operativa y en Tiempo Real**: Secretaría y dirección pueden alternar entre la vista contractual ("Ciclo Activo") y la vista mensual oficial ("Por Mes") sin que la interfaz quede vacía o desincronizada.
