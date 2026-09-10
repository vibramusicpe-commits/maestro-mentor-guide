# ADR 0088: Sincronización en Tiempo Real de Asistencias Docentes, Normalización de Alumnos y Alineación de Kardex / Agenda

## Estado
Aceptado

## Contexto
El usuario reportó que al marcar asistencia desde la cuenta del profesor (**Fernando** en `/teacher`) para su clase de hoy (Jueves por la tarde), la asistencia no se reflejaba en la aplicación web (Kardex en `/admin/alumnos`, tarjetas del horario en `/admin/agenda`, ni en la base de datos PostgreSQL de Insforge).

Tras una auditoría exhaustiva de extremo a extremo, se detectaron cinco causas raíces críticas:

1. **Desincronización de Mes en Kardex**: El modal `StudentAttendanceKardex` tenía `defaultMonth = 7` (Agosto) hardcodeado. Al marcar asistencia hoy (10 de Setiembre, mes 8), el Kardex abría por defecto en Agosto, mostrando todas las sesiones como pendientes.
2. **Discrepancia en Nombres entre Horario (`officialSchedule`) y Alumnos (`adminStudents`)**:
   - En el horario: `"Valerie Angulo Chipana"`, `"Camila Pastor Conco"`.
   - En el directorio: `"Valerie Yidda Angulo"`, `"Camila Valentina Pastor Conco"`.
   - La condición `.includes()` de JavaScript evaluaba a `false`, impidiendo que `markLessonAttendance` actualizara la tasa de asistencia (`attendanceRate`), la bitácora reciente (`recentAttendance`) y bloqueando la sincronización en segundo plano.
3. **Ausencia de Indicador de Asistencia en Tarjetas de la Agenda (`/admin/agenda`)**: Las vistas del horario (Vista 1 por Salas y Vista 2 Rejilla Semanal) no renderizaban el estado de asistencia o dependían de un punto microscópico de 2px en una sola vista.
4. **Fallo en Resolución de UUID para PostgreSQL**: `backgroundSyncAttendanceLogToDB` verificaba `!isNaN(Number(studentId))`. Los IDs como `"as-cp-65"` retornaban `NaN`, enviando `student_id = NULL` a la tabla `attendance_logs`.
5. **Horario Desfasado por Defecto**: `agenda-board.tsx` iniciaba con `new Date(2026, 7, 12)` (Agosto 2026), obligando al usuario a avanzar manualmente a Setiembre para ver las clases en curso.

## Decisiones Tomadas

1. **Módulo Centralizado de Matching y UUIDs (`src/lib/student-matching.ts`)**:
   - Se creó `isMatchingStudentName(nameA, nameB)` con normalización NFD, tolerancia a acentos, inversión de apellidos y coincidencia por palabras clave.
   - Se implementó `resolveStudentUUID(id)` determinista, convirtiendo códigos como `"as-cp-65"` a formato canónico hexadecimal UUID `00000000-0000-0000-0002-000000000041` compatible con las claves foráneas de Insforge PostgreSQL.
2. **Normalización del Catálogo Completo (`admin-seeds.ts`)**:
   - Se garantizó que el 100% de los alumnos del horario (`officialSchedule`) y de la lista administrativa (`officialAdminStudents`) existan en `adminStudents` (incluyendo alumnos como `Ivanna Soto` y clases particulares).
3. **Actualización Reactiva de Asistencias en Store (`app-store.ts`)**:
   - `markLessonAttendance`, `setStudentSessionAttendance` y `bulkRegularizeStudentAttendance` ahora utilizan `isMatchingStudentName`.
   - Se sincroniza inmediatamente `attendance_logs` en Insforge PostgreSQL con el UUID resuelto del alumno.
4. **Kardex Dinámico y Selector Rápido Agosto/Setiembre (`student-attendance-kardex.tsx`)**:
   - `defaultMonth` se inicializa dinámicamente en el mes real en curso (`now.getMonth()`).
   - Se incorporaron botones de conmutación directa `[ Agosto ]` y `[ Setiembre (Mes en curso) ]` en la cabecera del Kardex.
   - Se añadió resolución de estado reactivo para la semana activa.
5. **Badges de Asistencia Visibles en Todas las Vistas de la Agenda (`agenda-board.tsx`)**:
   - Se añadieron pastillas visuales de asistencia en tiempo real (🟢 Presente, 🔴 Ausente, 🟡 Tarde, 🔵 Justificada) en:
     - Vista 1: Modo Pareado (2x2).
     - Vista 1: Modo Día a Día (1x1).
     - Vista 2: Rejilla Semanal Lunes a Viernes.
     - Vista 2: Turno Mañana Sábados.
     - Detalle / Drawer lateral de la sesión.
   - La fecha por defecto de la agenda se calcula dinámicamente con `now` para abrir directamente en la semana y mes activos de las clases.

## Consecuencias y Validación
- Cuando un profesor marca asistencia en `/teacher`, la tarjeta en `/admin/agenda` se ilumina de inmediato con su pastilla de color (Verde, Rojo, Amarillo, Azul).
- En `/admin/alumnos`, el Kardex del alumno abre en el mes actual (Setiembre), muestra las sesiones con su estado real y actualiza la tasa porcentual (`attendanceRate`).
- La tabla de PostgreSQL `attendance_logs` recibe registros con el `student_id` foráneo correcto en tiempo real.
