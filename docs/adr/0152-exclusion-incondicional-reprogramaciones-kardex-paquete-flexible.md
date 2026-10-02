# ADR-0152: Exclusión Incondicional de Reprogramaciones en Kardex, Ciclo Lectivo y Blindaje de Paquete Flexible 24 Clases

## Estado
Aceptado e Implementado

## Fecha
2026-10-02

## Contexto
Al reprogramar una clase de un alumno (caso crítico detectado con Andrea Fernanda Meza, ID `27e1bb55-457a-42f8-b784-7d8ab6ed5d4d`), se identificaron dos fallas graves:
1. **Clase Fantasma y Evaluación Huérfana en Fecha Original**:
   - Al mover una clase puntual (por ejemplo, del miércoles 01/07 al jueves 02/07), la fecha original se agregaba a `lesson.excludedDates: ["2026-07-01"]`.
   - Sin embargo, tanto `student-attendance-kardex.tsx`, `kardex-calculator.ts` como `student-cycle.ts` contenían la guarda:
     `if (lesson.excludedDates && lesson.excludedDates.includes(curDateStr)) { const hasEvaluated = ...; if (!hasEvaluated) return; }`.
   - Si la sesión original había sido marcada previamente como falta (`ausente`) para habilitar el botón de reprogramación o por error de registro, `hasEvaluated` era verdadero, lo que impedía que `excludedDates` omitiera la fecha. Como resultado, la clase del 01 de julio seguía mostrándose como `✗ Falta (0% asistencia)`, y la nueva clase del 02 de julio aparecía como una clase adicional duplicada.
   - En `isLessonInStudentCycle`, la verificación de evaluación previa se ejecutaba antes de verificar `excludedDates`, forzando la inclusión de fechas excluidas en la agenda y el ciclo.
   - La acción `rescheduleLesson` en `app-store.ts` no purgaba `attendanceByDate[originalDateStr]` ni eliminaba el registro histórico en `attendance_logs` de PostgreSQL.
2. **Truncamiento a 10 Clases en Paquete Flexible (24 Clases a Demanda)**:
   - En la ficha de Andrea Fernanda en PostgreSQL, el alumno fue creado con `emergency_contact.planEndDate: "2026-07-31"` y `modality: "Regular (8 clases / 45 min)"`, a pesar de tener `planType: "Paquete Flexible"` y `packageTotalSessions: 24`.
   - En `student-attendance-kardex.tsx`, `isFlexiblePackage` no consideraba `student.planType === "Paquete Flexible"` ni `packageTotalSessions > 8`. Al evaluarse como plan regular mensual, el Kardex aplicaba el corte contractual rígido `curDateStr > effectivePlanEndDate` (31 de julio de 2026), proyectando únicamente las 10 sesiones correspondientes a julio (1 excluida + 1 reprogramada + 8 regulares) en lugar de las 24 sesiones del paquete.

## Decisiones Quirúrgicas

### 1. Exclusión Incondicional por Reprogramación (`excludedDates`)
- En `src/components/admin/student-attendance-kardex.tsx`, `src/lib/kardex-calculator.ts` (`computeStudentCycleSessions` y `computeStudentMonthSessions`) y `src/lib/student-cycle.ts` (`computeStudentCycle` y `isLessonInStudentCycle`), cualquier fecha presente en `lesson.excludedDates` se excluye **incondicionalmente** (`return;` o `return false;`).
- En `isLessonInStudentCycle`, la verificación de `lesson.excludedDates.includes(lessonDateStr)` se ejecuta prioritariamente antes de consultar `attendanceByDate`.
- En `computeStudentCycle`, se omite la recolección de asistencias evaluadas si la fecha pertenece a `excludedDates`, previniendo que evaluaciones huérfanas en fechas movidas saturen o distorsionen el conteo de clases asistidas.

### 2. Limpieza Atómica en `rescheduleLesson` (`app-store.ts`)
- Al invocar `rescheduleLesson` con `originalDateStr`:
  - Se elimina `cleanAttendanceByDate[originalDateStr]` y `cleanAttendanceByWeek[targetWeekIndex]`.
  - Se recalculan `attendanceRate` y `recentAttendance` en el perfil del estudiante en Zustand y PostgreSQL para eliminar el 0% de asistencia o marcas de falta residuales.
  - Se ejecuta `postgrestDelete("attendance_logs", { student_id: targetSt.id, note: like.*originalDateStr* })` para purgar de inmediato el log huérfano en PostgreSQL.
- Se habilitó el botón `🔄 Reprogramar` directamente en sesiones en estado `pendiente` (sin marcar) y en modo edición (`isEditMode`) en el Kardex, permitiendo reprogramar con antelación sin obligar al usuario a marcar una falta artificial.

### 3. Detección Universal de Paquetes Flexibles
- En `src/components/admin/student-attendance-kardex.tsx`, `src/lib/kardex-calculator.ts`, `src/lib/student-cycle.ts` y `src/store/app-store.ts`, la condición `isFlexiblePackage` evalúa unificadamente:
  - `modalityStr.includes("flex")`
  - `modalityStr.includes("demanda")`
  - `modalityStr.includes("paquete")`
  - `modalityStr.includes("irregular")`
  - `student.planType === "Paquete Flexible"`
  - `student.planType === "Paquete Especial"`
  - `(typeof student.packageTotalSessions === "number" && student.packageTotalSessions > 8)`
- Cuando `isFlexiblePackage` es verdadero, la ventana de escaneo del ciclo se proyecta hasta abarcar la totalidad de las clases contratadas (`packageTotalSessions`, ej. 24 clases a lo largo de 180 a 200 días), impidiendo el truncamiento por fin de mes calendario.

### 4. Saneamiento Quirúrgico de Registro en Base de Datos
- Se purgó el log de asistencia `4d453c52-c44d-4018-be32-589e2ce92d7b` en `attendance_logs`.
- Se actualizó el registro de Andrea Fernanda (`27e1bb55-457a-42f8-b784-7d8ab6ed5d4d`) en `students`:
  - `emergency_contact.modality: "Paquete Flexible (A demanda)"`
  - `emergency_contact.planType: "Paquete Flexible"`
  - `emergency_contact.packageTotalSessions: 24`
  - `emergency_contact.planEndDate: "2026-12-31"`
  - `emergency_contact.attendanceRate: 0`
  - `emergency_contact.recentAttendance: []`
  - `attendance_rate: 0`
  - `makeup_credits: 0`
  - En `emergency_contact.scheduleLessons`: lección de los miércoles (`sch-1790970902083-zmc3`) mantiene `excludedDates: ["2026-07-01"]` con `attendanceByDate: {}`, y lección recuperada en jueves 02/07 (`sch-resched-1790970973534-6cmp`) se proyecta como la primera clase del ciclo lectivo.

## Consecuencias y Verificación
- La clase del miércoles 01/07 desaparece de forma absoluta del Kardex y de la agenda semanal; no genera clases fantasma ni faltas falsas.
- La clase reprogramada del jueves 02/07 a las 16:00 se posiciona como la primera sesión válida.
- El Kardex proyecta con exactitud matemática las **24 sesiones** contratadas de Andrea Fernanda desde el 02 de julio hasta el 21 de septiembre de 2026.
- Compilación `npm run build` verificada sin errores de tipado o empaquetado.
