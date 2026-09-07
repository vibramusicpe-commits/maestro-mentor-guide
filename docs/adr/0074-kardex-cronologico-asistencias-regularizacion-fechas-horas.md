# ADR 0074: Kardex Cronológico de Asistencias con Fechas, Horas, Regularización Retroactiva y Sincronización Insforge PostgreSQL

## Estado
Aprobado e Implementado

## Fecha
2026-09-07

## Contexto
1. **Incidencia Operativa de Secretaría**: Se identificó que Secretaría (Nayeli) omitió el registro diario de asistencia de los alumnos en la plataforma web durante el ciclo activo.
2. **Reclamo de Padres y Dirección**: Varios apoderados y la Dirección de Vibra Music solicitaron un control exhaustivo e histórico demostrable de fechas, horas y salas de las clases tomadas, exigiendo un reporte transparente para validar el cumplimiento del plan mensual (8 clases para Plan Regular o 4 clases para Plan Intensivo).
3. **Auditoría Backend vía MCP `insforge-postgres`**:
   - Se realizó una inspección en vivo de la base de datos PostgreSQL alojada en Insforge utilizando la herramienta MCP `insforge-postgres`.
   - Se validaron las 18 tablas públicas del esquema: `students` contiene 83 alumnos individualizados y activos, `families` 83 familias asociadas, `invoices` 83 recibos contables.
   - La tabla `attendance_logs` arrojó **0 registros**, corroborando físicamente en base de datos la omisión en el registro de asistencias por parte de recepción.
4. **Necesidad de Regularización Inmediata y Resiliente**: Se requiere dotar a la plataforma de una herramienta que permita tanto la regularización manual en 1 clic de sesiones pasadas como la regularización masiva retroactiva ("⚡ Regularizar todo como Presente"), sincronizando tanto el estado local en Zustand como la persistencia en PostgreSQL (`students.attendance_rate`, `students.makeup_credits` y la tabla inmutable `attendance_logs`).

---

## Decisiones Técnicas

### 1. Componente `StudentAttendanceKardex` (`src/components/admin/student-attendance-kardex.tsx`)
Se desarrolló un módulo especializado tipo Kardex de asistencia escolar que reconstruye de forma determinista todas las sesiones del alumno en el mes o ciclo seleccionado:
- **Cálculo Calendárico Preciso**: Utiliza `getMonthWeeks(year, monthIndex)` y el día programado en la agenda (`dayIndex` 0 al 5) para derivar la fecha calendario exacta de cada sesión (ej. `Lun 18 Ago 2026`).
- **Detalle Integral por Sesión**: Cada fila expone Número de Sesión (`#1`, `#2`...), Fecha y Día exacto, Franja Horaria (`16:00 - 16:45`), Instrumento, Profesor asignado, Sala de clase y Estado de asistencia (`presente`, `ausente`, `tarde`, `justificada`, `pendiente`).
- **Botones de Marcado Rápido**: Modificación inmediata de estado en 1 clic:
  - `[✓ Pres]` (Verde: Presente)
  - `[✗ Falta]` (Rojo: Ausente, no recuperable)
  - `[⏰ Tar]` (Amarillo: Tarde)
  - `[🔵 Just]` (Azul: Inasistencia justificada, suma +1 crédito de recuperación)
  - `[↺]` (Gris: Devolver a pendiente)
- **Acción Masiva "⚡ Regularizar todo como Presente"**: En un solo clic marca todas las sesiones no registradas del alumno como "Presente", recalculando automáticamente la tasa de asistencia al 100% y notificando a la cola de sincronización.
- **Generador de Reporte WhatsApp**: Redacta y copia al portapapeles en 1 clic un mensaje formal dirigido al apoderado con el desglose cronológico de cada clase (fecha, hora, estado), facilitando la comunicación de Secretaría.
- **Soporte de Impresión / PDF**: Incluye botón `🖨️ Imprimir Kardex` con estilos CSS `@media print` para entregar reportes físicos firmados a los padres si lo requieren.

### 2. Puntos de Integración en la Webapp
El Kardex se encuentra accesible en todos los puntos neurálgicos donde interactúan Secretaría, Dirección, Profesores y Familias:
1. **Directorio de Alumnos (`src/components/admin/students-table.tsx`)**:
   - Botón `📖 Kardex` en la columna de acciones de cada fila.
   - Enlace interactivo en la columna `% Asistencia`: al hacer clic en el porcentaje, abre de inmediato el Kardex del estudiante.
   - Botón `📖 Kardex de Asistencias (Fechas y Horas)` dentro del Drawer lateral de detalles del alumno.
2. **Agenda y Control de Clases (`src/components/admin/agenda-board.tsx`)**:
   - Botón `Kardex Fechas` en la tarjeta de *Control de Asistencias y Plan Mensual* dentro del Sheet de detalle de la clase.
   - Acceso desde la modal general de *Libreta de Asistencias y Control de Plan*.
3. **Portal de Familias (`src/components/family/kid-summary.tsx`)**:
   - Botón `Ver Kardex de Fechas` para que los padres de familia puedan auditar en cualquier momento el historial de asistencias con fecha, hora y profesor de sus hijos de manera transparente.

### 3. Sincronización Asíncrona con Insforge PostgreSQL
Para asegurar que las regularizaciones no queden únicamente en memoria del navegador:
- **`backgroundSyncStudentToDB`**: Sincroniza en segundo plano `attendance_rate` y `makeup_credits` en la tabla `students` de PostgreSQL mediante llamadas a PostgREST (`PATCH /students?id=eq.{studentId}`).
- **`backgroundSyncAttendanceLogToDB`**: Inserta registros en la tabla inmutable `attendance_logs` (`POST /attendance_logs`):
  - Mapea el estado al enum de base de datos (`attendance_enum`: `presente`, `ausente`, `tarde`, `recuperacion`).
  - Para inasistencias justificadas, registra `status = 'ausente'`, `credit_delta = 1` y una nota descriptiva de justificación.
  - Incluye `registered_at` con timestamp ISO y nota de trazabilidad (`"Semana X - Regularización Kardex"`).

---

## Consecuencias y Validación

### Positivas
- **Resolución Inmediata del Conflicto Operativo**: Secretaría puede regularizar en menos de 5 segundos el historial completo de un alumno y enviar el reporte formateado a los padres por WhatsApp.
- **Trazabilidad Total**: Cada sesión cuenta con fecha calendario exacta (día, mes, año), horario de inicio/fin y profesor responsable.
- **Doble Persistencia Garantizada**: Los datos persisten reactivamente en Zustand (offline-ready) y se sincronizan asíncronamente con PostgreSQL en Insforge.
- **Cero Violaciones de Esquema**: Se respeta estrictamente el esquema de `attendance_logs` y los enums nativos de PostgreSQL verificados mediante el MCP `insforge-postgres`.

### Validación
- `npm run build` compila con 0 errores y 0 advertencias de tipo en `StudentAttendanceKardex`, `app-store.ts`, `students-table.tsx`, `agenda-board.tsx` y `kid-summary.tsx`.
- Verificación en vivo vía MCP `insforge-postgres` confirmando compatibilidad del esquema y tipos de datos.
