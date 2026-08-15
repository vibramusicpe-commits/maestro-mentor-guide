# Auditoría Quirúrgica de Backend: Insforge PostgreSQL (Vibra Music)

Este documento detalla la estructura real de la base de datos PostgreSQL en Insforge, el estado de las tablas del MVP y el plan de sincronización bidireccional UI-Backend.

---

## 1. Inventario de Tablas Reales en PostgreSQL Insforge (18 Tablas Activas)

| Tabla | Columnas | Propósito en el MVP | Estado en Base de Datos |
|---|---|---|---|
| `users` | 19 | Usuarios con roles (`super_admin`, `staff`, `teacher`, `family`). | 1 registro activo (`dueña@vibramusic.pe`) |
| `invitations` | 15 | Enlaces de acceso y contraseñas maestras (`token`, `master_password`). | 1 registro activo (`nayeli-secretaria-vibra`) |
| `user_passwords` | 9 | Control de contraseñas y regla de cambio único (1 sola vez). | Estructura lista |
| `password_audit_trail` | 9 | Registro inmutable de cambios de claves y eventos de seguridad. | Estructura lista |
| `families` | 12 | Familias / Apoderados, teléfono WhatsApp y balance financiero. | Estructura lista |
| `students` | 15 | Alumnos matriculados, categorías por edad, nivel e instrumento. | 0 registros (Listo para poblar) |
| `lessons` | 12 | Horario oficial de clases (`16:00 - 19:45` y Sábados `09:00 - 13:30`). | Estructura lista |
| `attendance_logs` | 9 | Registro diario de asistencia (`presente`, `ausente`, `tarde`, `recuperacion`). | Estructura lista |
| `teacher_time_logs` | 13 | Fichaje y control horario de profesores (Reemplazo Bixpe). | Estructura lista |
| `payroll_closings` | 9 | Cierre y liquidación de horas auditadas por profesor. | Estructura lista |
| `invoices` | 13 | Facturación, abonos (Yape/Efectivo/Transferencia) y morosidad. | Estructura lista |
| `payment_audit_logs` | 12 | Trazabilidad inmutable de pagos y comprobantes. | Estructura lista |
| `company_expenses` | 8 | Gastos operativos de la sede (Solo visible por la Dueña). | Estructura lista |
| `daily_closings` | 14 | Cuadre diario de caja chica y balance en sede. | Estructura lista |
| `closing_audit_links` | 4 | Vinculación entre facturas/gastos y cierre de caja. | Estructura lista |
| `online_resources` | 12 | Material didáctico (partituras, audios, PDFs para alumnos). | Estructura lista |
| `notification_logs` | 11 | Historial de avisos enviados a WhatsApp/Email. | Estructura lista |
| `demo_requests` | 12 | Solicitudes de clases muestra y leads. | Estructura lista |

---

## 2. Diagnóstico del Estado Actual (Frontend vs Backend)

1. **Estado del Backend**: La arquitectura PostgreSQL en Insforge cuenta con todas sus tablas, restricciones de integridad referencial y enums oficiales creados.
2. **Estado del Frontend**:
   - Actualmente, componentes como la Agenda y la Tabla de Alumnos utilizan **semillas en memoria con Zustand** (`admin-seeds.ts` / `app-store.ts`) como fallback para garantizar fluidez y funcionamiento offline.
   - El servicio **`src/lib/services/invitations.service.ts`** ya está conectado a PostgREST (`postgrestInsert`, `postgrestSelect`, `verifyInvitationToken`).
3. **Paso Quirúrgico Inmediato**:
   - Poblar las tablas maestras (`students`, `lessons`, `families`) en PostgreSQL Insforge con los datos reales del Excel de Nayeli para que el sistema opere con persistencia real en la nube.
