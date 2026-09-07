# Auditoría Quirúrgica de Backend: Insforge PostgreSQL (Vibra Music)

Este documento detalla la estructura real y auditada de la base de datos PostgreSQL en Insforge (`https://pdey9yma.us-east.insforge.app`), el estado de las tablas del sistema y la arquitectura de sincronización bidireccional UI-Backend.

**Última Auditoría en Vivo vía MCP `insforge-postgres`:** 2026-09-07 16:50:00 -05:00

---

## 1. Inventario Físico de Tablas en PostgreSQL Insforge (18 Tablas Activas)

| Tabla | Columnas | Propósito Operativo | Conteo Físico en BD | Estado de Sincronización |
|---|---|---|---|---|
| `students` | 15 | Alumnos individualizados, nivel, instrumento, profesor asignado, créditos y tasa de asistencia. | **83 filas** | ✅ Activo y persistido |
| `families` | 12 | Familias / Apoderados, teléfonos reales de WhatsApp y correos de contacto. | **83 filas** | ✅ Activo y persistido |
| `invoices` | 13 | Facturación mensual de alumnos con planes oficiales (S/ 297, S/ 261.40, S/ 237.60). | **83 filas** | ✅ Activo y persistido |
| `users` | 19 | Personal con roles RBAC (`super_admin`, `staff`, `teacher`). | **6 filas** | ✅ Activo (Dueña, Nayeli, Jeremy, Fernando, Nathaly, Demo) |
| `invitations` | 15 | Enlaces de acceso y tokens (`nayeli-secretaria-vibra`, tokens de profesores). | **1 fila** | ✅ Activo y validado |
| `attendance_logs` | 9 | Bitácora inmutable de asistencia con FK a `students` y `users`. | **0 filas** | 🟡 Sincronización activa desde Kardex y Kiosco Docente |
| `lessons` | 12 | Horario oficial de clases (`16:00 - 19:45` y Sábados `09:00 - 13:30`). | **0 filas** | 🟡 Horario gestionado en Zustand `schedule` con persistencia |
| `demo_requests` | 12 | Solicitudes de clases demostrativas y prospectos de Meta WhatsApp Cloud API. | **0 filas** | ✅ Conectado al Webhook de WhatsApp |
| `daily_closings` | 14 | Cuadre diario de caja chica y balance en sede de Secretaría. | **0 filas** | Estructura lista |
| `payment_audit_logs` | 12 | Trazabilidad inmutable de pagos y comprobantes con voucher. | **0 filas** | ✅ Conectado a `backgroundSyncPaymentToDB` |
| `user_passwords` | 9 | Control de contraseñas maestras y personalizadas. | **0 filas** | ✅ Gestionado por `invitations.service.ts` |
| `password_audit_trail` | 9 | Registro inmutable de cambios de claves y eventos de seguridad. | **0 filas** | ✅ Conectado |
| `teacher_time_logs` | 13 | Fichaje y control horario de profesores (Kiosco docente). | **0 filas** | Estructura lista |
| `payroll_closings` | 9 | Cierre y liquidación de horas auditadas por profesor. | **0 filas** | Estructura lista |
| `company_expenses` | 8 | Gastos operativos de la sede (Solo visible por Dirección). | **0 filas** | Estructura lista |
| `closing_audit_links` | 4 | Vinculación entre facturas/gastos y cierre de caja. | **0 filas** | Estructura lista |
| `online_resources` | 12 | Material didáctico (partituras, audios, PDFs para alumnos). | **0 filas** | Estructura lista |
| `notification_logs` | 11 | Historial de avisos enviados a WhatsApp/Email. | **0 filas** | Estructura lista |

---

## 2. Diagnóstico del Flujo de Datos (Cruce Kiosco Profesor ↔ Secretaría ↔ Insforge)

1. **Estado del Backend en Insforge**:
   - Motor PostgreSQL 15.18 100% operativo.
   - Enums nativos validados: `attendance_enum` (`presente`, `ausente`, `tarde`, `recuperacion`).
   - Claves foráneas íntegras: `attendance_logs.student_id -> students.id`, `attendance_logs.teacher_id -> users.id`.
2. **Cruce de Asistencias (ADR 0074 y ADR 0075)**:
   - **Kiosco del Profesor (`/teacher`)**: Cuando el profesor Jeremy, Fernando o Nathaly presiona `[🟢 Pres.]` o `[🔴 Aus.]` en su móvil, se registra la asistencia para la semana lectiva calculada en tiempo real (`getCurrentWeekIndex()`).
   - **Recepción / Secretaría (`/admin/agenda`)**: Nayeli visualiza en vivo la celda del alumno con el punto de color y el estado actualizado.
   - **Kardex de Asistencias (`StudentAttendanceKardex`)**: Reconstruye el historial cronológico con fechas y horas exactas. Tanto Secretaría como los Profesores y las Familias ven el mismo registro cruzado.
   - **Persistencia Asíncrona**: Cada marcado ejecuta `backgroundSyncStudentToDB` (actualiza `attendance_rate` y `makeup_credits` en `students`) y `backgroundSyncAttendanceLogToDB` (inserta fila en `attendance_logs`).
3. **Resiliencia Offline-First**:
   - Si la conexión Wi-Fi de la sede parpadea, la interfaz nunca se bloquea ni muestra pantallas en blanco: Zustand resuelve la UI al instante y despacha las peticiones a PostgREST en segundo plano mediante colas resilientes.
