# ADR 0156: Aislamiento Estricto de Slots en Reprogramaciones, Deduplicación Intra-Celda y Erradicación de Clases Duplicadas

## Estado
Aprobado e Implementado (v2.0.26) — 05 de Octubre, 2026

## Contexto
Al reprogramar la clase de una alumna (caso específico: **Mia Lucero Bellido Alvan**, viernes `2026-10-09` reprogramada puntualmente para el sábado `2026-10-10` a las `09:00` con Prof. Nathaly en Sala C), se detectó una anomalía crítica en el Horario de Clases (`AgendaBoard`, `/admin/agenda`):
1. **Aparición de Clase Duplicada en Horario Regular (Sábado 10:30)**:
   - A pesar de que la reprogramación puntual se registró correctamente en PostgreSQL (`dateStr: "2026-10-10"`, `time: "09:00"`, `isMakeup: true`) y la clase del viernes `2026-10-09` fue excluida (`excludedDates: ["2026-10-09"]`), la alumna aparecía **dos veces** el sábado 10/10/2026:
     - Una vez a las `09:00` (la clase de recuperación / reprogramada legítima).
     - Una segunda vez a las `10:30` (su plantilla semanal regular abierta).
2. **Causa Raíz Identificada en `src/lib/student-cycle.ts` (`isLessonInStudentCycle`)**:
   - En la regla de evaluación contra el ciclo contractual (`computeStudentCycle`), la condición de inclusión permitía:
     ```typescript
     if (cycle.validSlots.has(slotKey) || (cycle.validDates.has(lessonDateStr) && !lesson.dateStr)) {
       return true;
     }
     ```
   - La cláusula `(cycle.validDates.has(lessonDateStr) && !lesson.dateStr)` evaluaba como `true` para la plantilla recurrente de las 10:30 porque `cycle.validDates` contenía `"2026-10-10"` debido a la existencia de la clase de recuperación de las 09:00.
   - Dado que Mia ya contaba con 7 asistencias evaluadas en su ciclo contractual de 8 clases, la clase de las 09:00 cubría exactamente la cuota contractual restante (`8 - 7 - 1 = 0` clases regulares requeridas).
   - Por tanto, `cycle.validSlots` contenía `2026-10-10-09:00` y NO contenía `2026-10-10-10:30`.
   - Sin embargo, la condición laxa por fecha (`validDates`) ignoraba la franja horaria y dejaba pasar la clase de las 10:30, generando una 9.ª clase ilegal en el cronograma semanal y duplicando visualmente a la alumna el mismo sábado.
3. **Ausencia de Deduplicación Intra-Celda Defensiva**:
   - Si por cualquier contingencia una sesión puntual y una recurrente coincidían en el mismo profesor, sala y hora, la celda renderizaba dos tarjetas para el mismo alumno.

## Decisiones Técnicas

### 1. Validación Estricta por Slot (`cycle.validSlots.has(slotKey)`) en `src/lib/student-cycle.ts`
- Se erradicó la cláusula `|| (cycle.validDates.has(lessonDateStr) && !lesson.dateStr)` de `isLessonInStudentCycle`.
- La pertenencia de una sesión regular abierta al ciclo activo se determina **única y exclusivamente** verificando si su franja horaria exacta (`dateStr-time`) forma parte de `cycle.validSlots`.
- Esto garantiza que:
  - Cuando un alumno completa su cuota contractual (ej. 8 de 8 clases) mediante una reprogramación o recuperación, las plantillas regulares excedentes quedan automáticamente suprimidas.
  - No se producen colisiones ni duplicados entre turnos matutinos y vespertinos en la misma fecha.

### 2. Sincronización en Vista de Mes Calendario (`computeStudentMonthSessions` en `src/lib/kardex-calculator.ts`)
- En `src/lib/kardex-calculator.ts`, para alumnos no pertenecientes a Paquetes Flexibles, dentro del período lectivo activo (`curDateStr >= planStartDate`), las sesiones regulares pendientes se contrastan contra `cycle.validSlots.has(slotKey)`.
- Si la cuota ya fue satisfecha por una sesión puntual de recuperación en ese día, la plantilla regular pendiente excedente no se proyecta, manteniendo el Kardex mensual y el Horario de Clases en perfecta consonancia matemática.

### 3. Escudo de Deduplicación Intra-Celda (`dedupeLessonsForCell`)
- En `src/components/admin/agenda-board.tsx` (`renderSingleDayTable`, vista semanal `renderWeeklyGrid` de lunes a sábado y vista diaria `renderDailyView`), `src/components/agenda/minimal-agenda-calendar.tsx` y `src/routes/teacher.index.tsx`:
  - Se implementó la función auxiliar determinista `dedupeLessonsForCell(lessons, dateStr)`.
  - Si en una celda coinciden dos entradas para el mismo alumno:
    1. Prevalece la que tenga asistencia ya evaluada en esa fecha (`presente`, `ausente`, `tarde`, `justificada`).
    2. Prevalece la que tenga fecha puntual asignada (`dateStr`) o marca de recuperación (`isMakeup`).
    3. Descarta la plantilla semanal recurrente abierta redundante.

## Consecuencias y Verificación
- **Mia Lucero Bellido Alvan**:
  - Viernes 09/10/2026: Excluida limpiamente por reprogramación (`excludedDates: ["2026-10-09"]`).
  - Sábado 10/10/2026: Muestra **únicamente** su clase reprogramada a las `09:00` con Prof. Nathaly en Sala C. El duplicado fantasma de las `10:30` queda erradicado.
  - Kardex Ciclo y Mes: Reflejan exactamente sus 8 clases contractuales (7 evaluadas + 1 pendiente de recuperación).
- **Cero Regresiones en Alumnos Activos**:
  - Auditoría exhaustiva sobre los 41 alumnos activos de la base de datos PostgreSQL durante Septiembre y Octubre 2026: cero diferencias inesperadas; solo se eliminaron los duplicados ilegales de slots que excedían cuotas contractuales.
- **Compilación Exitosa**: `npm run build` compila al 100% en Vite/Nitro sin errores de tipado.
