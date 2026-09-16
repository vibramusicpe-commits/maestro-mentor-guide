# ADR 0099: Sincronización Real del Kiosco Docente y Kardex de Asistencias Aislado por Fechas

## Estado
Aprobado (v1.8.8) — 16 de Septiembre, 2026

## Contexto
1. **Fuga de Alumnos Inactivos al Portal Docente**:
   - En `src/components/teacher/lesson-notes.tsx`, si un profesor no tenía alumnos activos asignados, el fallback `return merged.length > 0 ? merged : adminStudents;` devolvía los 35 alumnos de la base histórica.
   - En `src/hooks/use-insforge-sync.ts`, la sincronización en vivo con PostgreSQL solo se ejecutaba en `/admin` y para roles `super_admin` o `staff`. Al ingresar directamente a `/teacher`, la vista docente operaba sobre la caché local obsoleta.
2. **Auto-marcado Fantasma y Fuga de Asistencias en el Kardex**:
   - En `src/components/admin/student-attendance-kardex.tsx`, al marcar una sesión se guardaba un estado global en la lección (`lesson.attendanceStatus`). Al renderizar sesiones de la semana lectiva activa que aún no habían sido evaluadas, la línea `(selectedMonth === currentRealMonth && week.weekIndex === currentActiveWeek && lesson.attendanceStatus) ? lesson.attendanceStatus` heredaba el estado global y marcaba sesiones futuras (como el 17 de Septiembre al marcar el 10) de forma involuntaria.
   - En `src/store/app-store.ts`, `attendanceByWeek` se indexaba solo por `weekIndex` (`0, 1, 2, 3, 4`), provocando colisiones entre meses (marcar semana 1 de septiembre marcaba semana 1 de agosto).
   - El Kardex ignoraba las fechas de vigencia contratadas (`student.planStartDate` y `student.planEndDate`), generando sesiones anteriores a la matrícula del alumno (ej. 1, 3 y 8 de septiembre para Camila Pastor, quien inició el 10/09/2026).
   - En `src/lib/services/students.service.ts`, `recentAttendance` tenía un mock por defecto de `["presente", "presente", "presente"]` y `attendanceRate: 100`, mostrando 3 asistencias y 100% incluso en alumnos sin registros reales.

## Decisiones Técnicas
1. **Sincronización en Vivo y Cero Fallbacks en Rutas Docentes**:
   - Se habilitó `useInsforgeSync()` para el rol `teacher` y se integró su llamada en `src/routes/teacher.tsx`.
   - Se autorizó el rol `teacher` en `getStudents()` de `students.service.ts`.
   - Se eliminó el fallback a la base total en `lesson-notes.tsx`: si el profesor no tiene alumnos activos asignados, la lista queda en `0 alumnos asignados` con array vacío.
   - Se reforzó la verificación de alumnos activos en `teacher.index.tsx` y `teacher.agenda.tsx` (`!studentProfile || studentProfile.status !== 'activo' => return false`).
2. **Aislamiento Estricto por Fecha ISO (`dateStr: YYYY-MM-DD`) en el Kardex**:
   - Se incorporó `attendanceByDate?: Record<string, AttendanceStatus>` en `ScheduledLesson`.
   - `setStudentSessionAttendance` y `bulkRegularizeStudentAttendance` guardan e indexan la asistencia por fecha única (`YYYY-MM-DD`), erradicando colisiones entre meses.
   - Se eliminó completamente la herencia de `lesson.attendanceStatus` en la semana activa. Cada sesión es estrictamente `pendiente` hasta ser marcada explícitamente.
   - Se aplicó el filtro por vigencia de matrícula en `student-attendance-kardex.tsx`:
     `if (student.planStartDate && dayInfo.dateStr < student.planStartDate) return;`
     `if (student.planEndDate && dayInfo.dateStr > student.planEndDate) return;`
     Garantizando que no se generen sesiones previas a la fecha de inicio del alumno ni posteriores a su vencimiento.
3. **Erradicación de Mocks de Asistencia en Fichas de Alumnos**:
   - `mapDBStudentToAdminStudent` ahora asigna `recentAttendance: []` y `attendanceRate: 0` por defecto.
   - El cálculo de `recentAttendance` en `app-store.ts` se basa exclusivamente en las sesiones reales evaluadas y se sincroniza bidireccionalmente con PostgreSQL (`emergency_contact.recentAttendance`).
4. **Migración de Almacenamiento a `cadencia-app-v28`**:
   - Se limpiaron los `attendanceStatus` globales residuales de las lecciones recurrentes para eliminar el estado corrupto previo en los navegadores de los usuarios.

## Consecuencias
- Docentes como Jeremy y Nathaly muestran 0 alumnos asignados mientras no tengan alumnos reactivados por administración.
- Camila Pastor figura exclusivamente con el Prof. Fernando en sus 6 clases reales de Septiembre (10, 15, 17, 22, 24, 29).
- Marcar el 10 de Septiembre ya no marca automáticamente el 17 de Septiembre ni ninguna otra fecha.
- Agosto queda 100% limpio sin sesiones antes del 10 de Septiembre.
- La ficha del alumno refleja exactamente las asistencias reales marcadas (0, 1, 2, etc.), sin los 3 mocks anteriores.
