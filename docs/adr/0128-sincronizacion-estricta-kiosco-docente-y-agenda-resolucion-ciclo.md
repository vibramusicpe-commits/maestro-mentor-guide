# ADR-0128: Sincronización Estricta entre Kiosco Docente y Agenda mediante Validación de Ciclo Contractual y Exclusiones de Reprogramación

## Estado
Aceptado

## Contexto
En producción, se detectó una discrepancia crítica entre el **Kiosco de Clase del Profesor** (`/teacher`) y las vistas de **Agenda** (`/teacher/agenda` y `/admin/agenda`):
- En el Kiosco docente (`/teacher`), la alumna **Mia Lucero Bellido Alvan** (alumna de Canto de la Prof. Nathaly) figuraba el Viernes 25 de Setiembre a las 16:00 como clase `• PENDIENTE` con contador `Vie 1`.
- En la Agenda docente (`/teacher/agenda`) y en la Agenda administrativa (`/admin/agenda`), el Viernes 25 de Setiembre figuraba con `0 clases` (`Vie -`).
- En Martes, el Kiosco docente contabilizaba 2 clases mientras que la Agenda contabilizaba 1 clase (Sasha Dharma a las 18:15).

### Causa Raíz
1. **Asimetría de Motores de Filtrado**:
   - `minimal-agenda-calendar.tsx` y `agenda-board.tsx` validan cada lección contra `isLessonInStudentCycle(studentProfile, schL, dayInfo.dateStr, l.time, schedule)` y filtran clases con `excludedDates` y `excludedWeeks`.
   - En contraste, `teacher.index.tsx` utilizaba una función primitiva `isLessonInDay` que no invocaba `isLessonInStudentCycle`, no evaluaba `excludedWeeks`, y no contrastaba la lección contra las clases oficiales persistidas en `studentProfile.scheduleLessons`.
2. **Historial Contractual de la Alumna Mia Lucero**:
   - La alumna cuenta con un Plan Regular de 8 clases al mes (S/ 297).
   - Su clase regular del Viernes 25 a las 16:00 fue **justificada** con anticipación el 21 de Setiembre y **reprogramada** para el Jueves 24 de Setiembre a las 18:15.
   - La Prof. Nathaly dictó dicha clase el Jueves 24 a las 18:15 y registró la asistencia como `🟢 PRESENTE` en el Kiosco (persistida en `attendance_logs` en PostgreSQL).
   - Por lo tanto, la clase del Viernes 25 ya había sido impartida y consumida el Jueves 24 (`excludedDates: ["2026-09-25"]`).
   - La Agenda reflejaba la realidad contractual y pedagógica correcta (0 clases el viernes), mientras que el Kiosco mostraba una clase "fantasma" pendiente por falta de validación de ciclo.
3. **Colisión de Semillas Antiguas en Martes**:
   - En `schedule` coexistía una semilla antigua (`sch-34`, Sasha Contreras, 17:30) con la lección oficial de PostgreSQL (`sch-1789837710698-rj1p`, Sasha Dharma, 18:15). Sin validación de ciclo, el Kiosco contaba ambas clases.

## Decisiones Técnicas
1. **Unificación Determinista del Motor de Filtrado en Kiosco (`isLessonInDay`)**:
   - En `src/routes/teacher.index.tsx`, `isLessonInDay` adopta la validación estricta de:
     1. Fecha puntual exacta (`lesson.dateStr`).
     2. Semanas excluidas (`lesson.excludedWeeks?.includes(safeWeekIndex)`).
     3. Fechas excluidas por reprogramación (`lesson.excludedDates?.includes(dateStr)`).
     4. Validación de ciclo contractual activo (`isLessonInStudentCycle(studentProfile, lesson, dateStr, lesson.time, schedule)`).
2. **Resolución Reactiva de Asistencias desde Perfil de PostgreSQL**:
   - En la tarjeta de sesión del Kiosco, el estado de asistencia (`status`) evalúa prioritariamente `studentProfile.scheduleLessons` para garantizar que asistencias registradas en Kardex o regularizadas se reflejen de inmediato sin latencias de sincronización de `schedule`.
3. **Reactividad de Dependencias en Memorización**:
   - `countsByDay` y `dayLessons` incluyen `adminStudents` y `schedule` en sus dependencias de `useMemo` para responder instantáneamente ante cambios en PostgreSQL vía `useInsforgeSync`.

## Consecuencias y Verificación
- **Consistencia Absoluta**: Kiosco (`/teacher`), Agenda Docente (`/teacher/agenda`) y Agenda Admin (`/admin/agenda`) muestran exactamente las mismas clases y contadores por día (Semana 4: Lun=3, Mar=1, Mié=3, Jue=2, Vie=0, Sáb=1).
- **Cero Clases Fantasma**: Las sesiones reprogramadas y adelantadas no vuelven a aparecer como pendientes en su fecha original excluida.
- **Preservación Contractual**: Ningún alumno excede su cuota mensual de clases ni se duplican horarios de semillas obsoletas.
