# Log de Incidente: Erradicación de Clase Duplicada en Reprogramaciones y Aislamiento Estricto de Slots (Caso Mia Lucero)

- **Fecha**: 2026-10-05
- **Severidad**: Alta (Afectación visual en Agenda de Producción / Horario de Clases)
- **Componentes**: `src/lib/student-cycle.ts`, `src/components/admin/agenda-board.tsx`, `src/lib/kardex-calculator.ts`, `src/components/agenda/minimal-agenda-calendar.tsx`, `src/routes/teacher.index.tsx`
- **ADR Relacionado**: [ADR-0156](../adr/0156-aislamiento-slots-reprogramacion-y-erradicacion-duplicados.md)

---

## 1. Descripción del Problema
Al reprogramar la sesión del viernes `2026-10-09` de la alumna **Mia Lucero Bellido Alvan** (`Regular (8 clases / 45 min)`) para el sábado `2026-10-10` a las `09:00` con Prof. Nathaly en Sala C, la reprogramación se guardó con éxito en PostgreSQL, pero en la Agenda de Clases (`/admin/agenda`) la alumna aparecía **duplicada** el sábado 10/10/2026:
- A las `09:00` con su clase reprogramada.
- A las `10:30` con su plantilla recurrente estándar de los sábados.

Esto causaba confusión operativa en secretaría y docentes, sugiriendo falsamente que la alumna asistiría dos veces ese día y sumando una 9.ª clase que violaba su contrato de 8 clases lectivas.

---

## 2. Diagnóstico y Causa Raíz
1. **Auditoría de Datos en PostgreSQL**:
   - Mia tiene 7 asistencias evaluadas entre el 12 de septiembre y el 03 de octubre de 2026.
   - Su cuota contractual es `targetQuota = 8`.
   - La reprogramación generó una sesión con `dateStr: "2026-10-10"`, `time: "09:00"`, `isMakeup: true`.
   - Por ende, las 7 evaluadas + 1 reprogramación cubrían el 100% de su cuota (`targetQuota = 8`).
2. **Falla de Aislamiento en `isLessonInStudentCycle`**:
   - `cycle.validSlots` calculó correctamente: contenía `2026-10-10-09:00` y NO contenía `2026-10-10-10:30`.
   - Sin embargo, la condición:
     `if (cycle.validSlots.has(slotKey) || (cycle.validDates.has(lessonDateStr) && !lesson.dateStr))`
     permitía la clase de las 10:30 porque `cycle.validDates` contenía `"2026-10-10"` (debido a la clase de las 09:00).
   - Como resultado, cualquier plantilla recurrente sin fecha fija en ese día era aprobada erróneamente.

---

## 3. Solución Quirúrgica Aplicada
1. **Validación Estricta de Franja Horaria en `src/lib/student-cycle.ts`**:
   - Se removió el fallback laxo `(cycle.validDates.has(lessonDateStr) && !lesson.dateStr)`.
   - Toda sesión recurrente debe coincidir de forma unívoca con `cycle.validSlots.has(slotKey)`.
2. **Sincronización en `computeStudentMonthSessions` (`src/lib/kardex-calculator.ts`)**:
   - Dentro del ciclo activo (`curDateStr >= planStartDate`), las sesiones regulares pendientes no se proyectan si su franja horaria no está en `cycle.validSlots`.
3. **Escudo Defensivo Intra-Celda (`dedupeLessonsForCell`)**:
   - En `agenda-board.tsx`, `minimal-agenda-calendar.tsx` y `teacher.index.tsx`, se garantiza que ninguna celda pueda renderizar tarjetas duplicadas para el mismo alumno.

---

## 4. Pruebas y Verificación
- Verificado en tiempo real con datos de producción de PostgreSQL:
  - Mia el 10/10/2026 a las 10:30 -> `isLessonInStudentCycle: false` (eliminada).
  - Mia el 10/10/2026 a las 09:00 -> `isLessonInStudentCycle: true` (visible).
  - Mia el 09/10/2026 a las 16:00 -> `isLessonInStudentCycle: false` (excluida por reprogramación).
- Auditoría sobre los 41 alumnos activos: 0 regresiones en Septiembre y Octubre.
- `npm run build` compila con 0 errores.
