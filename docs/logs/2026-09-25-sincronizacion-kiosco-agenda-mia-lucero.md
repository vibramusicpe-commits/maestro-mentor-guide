# Log de Sincronización: Resolución de Discrepancia Kiosco vs Agenda (Caso Mia Lucero Bellido Alvan)

**Fecha**: 2026-09-25  
**Autor**: Antigravity Pair Programmer & Vibra Music Team  
**Módulos Afectados**: `src/routes/teacher.index.tsx` (Kiosco Docente), `src/lib/student-cycle.ts`, `src/components/agenda/minimal-agenda-calendar.tsx`, PostgreSQL (`attendance_logs`, `students`)  
**Versión**: v2.0.13  

---

## 1. Síntoma Reportado
El usuario compartió capturas donde:
1. En `/teacher/agenda` (Agenda de la Prof. Nathaly en Semana 4 de Setiembre 2026):
   - Viernes figuraba con **0 clases** (`Vie -`).
2. En `/teacher` (Kiosco de la Prof. Nathaly):
   - Viernes figuraba con **1 clase** (`Vie 1`), mostrando a:
     `16:00 · Sala C · Canto · 1 alumno: Mia Lucero Bellido Alvan · PENDIENTE`.
3. En `/admin/agenda` (Agenda Administrativa):
   - Viernes 25 de Setiembre figuraba con **0 clases** (columna vacía).
   - Lunes 21: Mia Lucero (🟢 Pres, 16:00).
   - Jueves 24: Mia Lucero (🟢 Pres, 18:15).

El usuario consultó: *"Si, mira , el kiosco esta actualizado y la agenda esta desactualizado"*.

---

## 2. Auditoría en Base de Datos (Insforge PostgreSQL)
Se consultó el registro de la alumna `Mia Lucero Bellido Alvan` (`id: 892bcc0b-d635-465e-a823-1dc339eafe74`):
1. **Contrato**: Plan Regular (8 clases / 45 min).
2. **Fecha Inicio**: `2026-09-12`.
3. **Lecciones Registradas**:
   - `sch-1790020146451-mz8x` (Viernes 16:00, Sala C, Nathaly):
     - `excludedDates: ["2026-09-25"]`
     - `attendanceByDate["2026-09-25"]: "justificada"`
   - `sch-resched-1790020381268-i9na` (Jueves 18:15, Sala C, Nathaly):
     - `dateStr: "2026-09-24"`
     - `recoveringLessonDate: "2026-09-25"`
     - `attendanceStatus: "presente"`
     - `attendanceByDate["2026-09-24"]: "presente"`
4. **Logs en `attendance_logs`**:
   - `2026-09-21T19:52:41Z`: "Inasistencia justificada (+1 crédito). Fecha 2026-09-25 - Regularización Kardex"
   - `2026-09-25T00:54:50Z`: "Fecha 2026-09-24 - Semana 4 - Marcado por Profesor en Kiosco: Fecha 2026-09-24" (`status: presente`).

**Conclusión del Caso Mia Lucero**:
La clase de hoy Viernes 25 fue **adelantada y tomada ayer Jueves 24**. La alumna ya tiene su asistencia marcada como PRESENTE en el horario adelantado. La Agenda mostraba la verdad contractual (0 clases para el viernes). El Kiosco mostraba erróneamente la clase como pendiente por falta de validación de ciclo.

---

## 3. Causa Técnica de la Falla en el Kiosco
- `teacher.index.tsx` contaba y filtraba clases usando `isLessonInDay`, el cual:
  - No invocaba `isLessonInStudentCycle`.
  - No verificaba `excludedWeeks`.
  - No contrastaba con la lista oficial `scheduleLessons` del perfil del alumno en PostgreSQL.
- Además, en Martes 22, mostraba 2 clases en vez de 1 debido a una colisión con una semilla antigua (`sch-34`, 17:30) que `isLessonInStudentCycle` filtraba correctamente en la Agenda.

---

## 4. Solución Implementada
1. En `src/routes/teacher.index.tsx`:
   - Se importó `isLessonInStudentCycle` desde `@/lib/student-cycle`.
   - Se actualizó `isLessonInDay` para validar:
     - Fechas puntuales (`dateStr`).
     - Semanas excluidas (`excludedWeeks`).
     - Fechas excluidas por reprogramación (`excludedDates`).
     - **Ciclo contractual activo y cuota** (`isLessonInStudentCycle`).
   - Se agregaron `adminStudents` y `schedule` a las dependencias de `countsByDay` y `dayLessons`.
   - Se enriqueció la resolución de asistencia en la tarjeta de sesión para priorizar `studentProfile.scheduleLessons`.
2. Verificación con `npm run build` exitosa.
