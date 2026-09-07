# ADR 0075: Cruce Bidireccional de Asistencia Docente-Secretaría y Auditoría en Vivo con Insforge MCP

## Estado
Aprobado e Implementado

## Fecha
2026-09-07

## Contexto
1. **Necesidad Operativa de Cruce de Información**:
   - En la academia Vibra Music, los profesores en aula (Jeremy en Sala A, Fernando en Sala B, Nathaly en Sala C) registran la asistencia de sus alumnos desde sus teléfonos móviles a través del **Kiosco del Profesor** (`/teacher`).
   - La Secretaría (Nayeli) en la recepción (`/admin/agenda`, `/admin/alumnos`) y los apoderados en el Portal de Familias (`/family`) requieren ver de forma inmediata, transparente y sin recargas si el alumno ya asistió, faltó o llegó tarde.
2. **Brechas Identificadas Previas**:
   - El Kiosco del Profesor utilizaba un índice de semana estático (`targetWeekIndex = 1`) cuando el docente marcaba asistencia sin especificar semana, provocando desalineaciones con las semanas lectivas reales del mes.
   - El marcado en el Kiosco docente no recalculaba la tasa de asistencia (`attendanceRate`) en el store global ni enviaba registros inmutables a la tabla `attendance_logs` en PostgreSQL (Insforge).
   - Los docentes no tenían acceso directo al Kardex de fechas y horas para auditar el cumplimiento del plan formativo de sus alumnos.
3. **Rol del MCP `insforge-postgres`**:
   - Se ejecutó una auditoría en vivo mediante la herramienta MCP para verificar el esquema relacional de PostgreSQL en Insforge, comprobando:
     - 83 estudiantes individualizados y activos (`students`).
     - 83 familias asociadas (`families`).
     - 83 facturas contables (`invoices`).
     - 6 usuarios con roles RBAC (`users`).
     - 0 registros en `attendance_logs` (confirmando la omisión física en base de datos).

---

## Decisiones Técnicas

### 1. Cálculo Dinámico de Semana Lectiva (`getCurrentWeekIndex`)
- En `src/lib/calendar-utils.ts`, se implementó la función `getCurrentWeekIndex(year, monthIndex)` que evalúa de forma determinista el día actual del mes contra las semanas calculadas con `getMonthWeeks()`.
- En el Kiosco del Profesor (`src/routes/teacher.index.tsx`), se inicializa `activeWeekIndex = getCurrentWeekIndex()`, asegurando que cada pulsación en `[🟢 Pres.]`, `[🔴 Aus.]`, `[🟡 Tar.]` o `[🔵 Just.]` quede asociada a la semana lectiva exacta.

### 2. Cruce y Recálculo en Tiempo Real (`markLessonAttendance` en `app-store.ts`)
- Al marcar asistencia desde el Kiosco docente:
  1. Se actualiza `schedule.attendanceByWeek[activeWeekIndex]` y `lesson.attendanceStatus`.
  2. Se recalcula en tiempo real la tasa de asistencia del alumno (`attendanceRate`, 0-100%) sobre todas sus clases programadas en el mes.
  3. Si la inasistencia es justificada (`justificada`), se incrementa automáticamente `makeupCredits + 1`.
  4. Se despachan mutaciones asíncronas a PostgreSQL:
     - `backgroundSyncStudentToDB`: Actualiza `attendance_rate` y `makeup_credits` en `students`.
     - `backgroundSyncAttendanceLogToDB`: Inserta un registro inmutable en `attendance_logs` con `student_id`, `status` (`presente`, `ausente`, `tarde`), `credit_delta` y nota descriptiva (`"Semana X - Marcado por Profesor en Kiosco"`).

### 3. Visualización Instantánea para Secretaría (Nayeli)
- **Agenda Didáctica (`/admin/agenda`)**: La celda del alumno en la cuadrícula Excel refleja de inmediato el punto de color y el estado (`● presente`, `● ausente`, etc.) para la semana activa.
- **Kardex de Asistencias (`StudentAttendanceKardex`)**: Como el Kardex lee las sesiones desde `schedule.attendanceByWeek`, la clase de esa fecha exacta aparece marcada automáticamente con el estado emitido por el docente.
- **Directorio de Alumnos (`/admin/alumnos`)**: La columna `% Asistencia` se actualiza sin requerir F5 ni recargas.

### 4. Kardex Disponible para Profesores (`/teacher/alumnos`)
- En el directorio de alumnos para docentes, se integró el botón **`📖 Kardex`** en cada tarjeta de estudiante, permitiendo que los profesores también puedan inspeccionar el historial cronológico completo de asistencias, fechas y horas de sus alumnos.

---

## Consecuencias y Validación
- **Sincronización Total**: Información 100% cruzada entre Profesores, Secretaría, Familias y PostgreSQL.
- **Resiliencia Offline-First**: La WebApp opera a latencia cero en la interfaz y procesa las escrituras hacia Insforge en segundo plano.
- **Compilación Limpia**: `npm run build` ejecutado exitosamente con 0 errores (código de salida 0).
- **Auditoría MCP Registrada**: Verificado el estado real de la base de datos PostgreSQL de Insforge mediante `call_mcp_tool`.
