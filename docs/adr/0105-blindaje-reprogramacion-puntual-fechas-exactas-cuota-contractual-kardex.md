# ADR 0105: Blindaje de Reprogramación Puntual con Fechas Exactas (`dateStr`), Fechas Excluidas y Cuota Contractual Estricta en Kardex

## Estado
Aprobado (v1.9.9) — 18 de Septiembre, 2026

## Contexto
1. **Explosión de Clases en Reprogramación Puntual ("Solo esta sesión")**:
   - Al reprogramar una única clase (ej. mover el jueves 10/09 al miércoles 09/09 por solicitud del alumno con la opción *"Solo esta sesión"*), el sistema generaba una lección con `day: "Mié"` pero sin fecha fija.
   - El algoritmo del Kardex (`allCycleSessions`) escaneaba los días lectivos y, al encontrar un miércoles, emitía una sesión para **cada uno de los miércoles del período** (02, 09, 16, 23, 30 Sep, 07, 14, 21 Oct) marcados como recuperación, inflando el contador del contrato de 8 a 12 o más clases.
   - Simultáneamente, la lección original del jueves no quedaba excluida de esa fecha puntual por falta de un registro de fechas exceptuadas (`excludedDates`).
2. **Desbordamiento de la Cuota Contractual del Plan Regular (8 Clases)**:
   - El Kardex mostraba clases de más cuando se acumulaban lecciones con bandera `isMakeup: true`, violando el aforo mensual contratado y desalineándose del registro físico del Excel de secretaría (Nayeli).
3. **Propagación No Deseada de Clases de Corrido (+45m)**:
   - Agregar una clase contigua de 45 minutos no debe convertirse en un horario permanente semanal, sino permanecer circunscrita a la fecha en la que se impartió.

## Decisiones Técnicas
1. **Tipado con Fechas Exactas en `ScheduledLesson` (`src/store/admin-seeds.ts`)**:
   - `dateStr?: string`: Fecha exacta `YYYY-MM-DD` para lecciones puntuales (reprogramaciones o clases de corrido).
   - `excludedDates?: string[]`: Array de fechas `YYYY-MM-DD` donde la lección recurrente NO debe impartirse.
2. **Aislamiento en `rescheduleLesson` (`src/store/app-store.ts`)**:
   - Al seleccionar `scope === "only-this-week"`:
     - Se añade `originalDateStr` al array `excludedDates` de la clase original (evita que el jueves original vuelva a proyectarse).
     - La nueva clase reprogramada se fija con `dateStr: newDateStr` y `recoveringLessonDate: originalDateStr`.
     - Sincronización inmediata tanto en `schedule` como en `adminStudents.scheduleLessons` hacia PostgreSQL.
3. **Restricción Unívoca en Generación de Sesiones (`student-attendance-kardex.tsx`)**:
   - Si una lección posee `dateStr`, **SOLO** se genera en esa fecha precisa (`if (lesson.dateStr !== curDateStr) return;`).
   - Si la fecha actual coincide con una fecha de `excludedDates`, se descarta de inmediato.
4. **Cuota Contractual Rigurosa (8 clases Regular / 4 Intensivo)**:
   - Se preservan incondicionalmente todas las clases evaluadas (`status !== "pendiente"`).
   - Si las evaluadas son menores que `targetQuota`, solo se toman las primeras clases pendientes estrictamente necesarias hasta completar la cuota:
     $$\text{clases\_finales} = \text{evaluadas} + \text{pendientes}[0 \dots (\text{targetQuota} - \text{evaluadas.length})]$$
   - El Kardex refleja exactamente 8 clases para el Plan Regular, en total paridad con el Excel físico.
5. **Selector de Fecha Específica en Modal de Reprogramación**:
   - Inclusión de un selector `<Input type="date">` sincronizado bidireccionalmente mediante `getTargetDateInSameWeek`, permitiendo reprogramar con precisión de calendario.
6. **Distinción Visual Clara**:
   - Las sesiones reprogramadas muestran un distintivo ámbar: `🔄 Reprogramada (orig. YYYY-MM-DD)`, diferenciándolas de las recuperaciones generales.

## Consecuencias
- Erradicación definitiva de clases fantasma multiplicadas en semanas posteriores.
- Paridad matemática al 100% con el Excel de Nayeli: exactamente 8 clases visibles para el contrato de 1 mes.
- Control auditable y transparente de reprogramaciones y clases de corrido en PostgreSQL.
