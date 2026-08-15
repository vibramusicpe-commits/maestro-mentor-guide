# Documento de Traspaso (Handoff): Maestro Mentor Guide / Cadencia

Este documento detalla el estado del frontend, el inventario de pantallas, el modelo de datos, los servicios backend construidos para **Insforge**, la matriz de permisos por rol ajustada a las necesidades de la Secretaria y Dueña, y el registro de arquitectura en grafos.

---

## 1. Horarios Oficiales & Timbre Acústico de Fin de Clase

| Función | Tecnología / Mecanismo | Aplicación Visual / Sonora |
|---|---|---|
| **Horarios L-V (4:00pm - 7:45pm)** | Matriz oficial 45 min | `16:00` · `16:45` · `17:30` · `18:15` · `19:00` |
| **Horarios Sábados (9:00am - 1:30pm)** | Matriz oficial 45 min | `09:00` · `09:45` · `10:30` · `11:15` · `12:00` |
| **🔔 Timbre Acústico de Fin de Clase** | Web Audio API (Sintetizador Dual 880Hz / 1320Hz) | Botón **`🔔 Probar Timbre`** en la cabecera. Emite el sonido en el parlante vinculado a la PC. |

---

## 2. Puerta de Acceso Oficial & Seguridad

| Perfil | Rol en Sistema | Correo Asignado | Contraseña de Acceso |
|---|---|---|---|
| **Dueña (Super Admin)** | `super_admin` | `direccion@vibramusic.pe` | **`VibraDuena2026!`** |
| **Nayeli (Secretaria / Staff)** | `staff` | `nayeli@vibramusic.pe` | **`NayeliVibra2026*`** |

---

## 3. Inventario de Pantallas y Módulos (11 Rutas)

| Ruta | Nombre / Módulo | Descripción / Funciones Principales | Roles Permitidos |
|---|---|---|---|
| `/` | Landing / Login Admin | Puerta segura con contraseñas reales obligatorias. | Todos |
| `/invite/$token` | Acceso por Invitación | Bienvenida e ingreso de contraseña maestra. Redirección automática al portal. | Público |
| `/admin` | Dashboard de Dirección | Métricas operativas, widget de **Cumpleaños del Mes**, alertas y morosidad. | Super Admin, Staff |
| `/admin/agenda` | Horario de Clases | **Horarios Oficiales + Popover de Fecha sin demoras + Botón de Timbre Parlante**. | Super Admin, Staff |
| `/admin/alumnos` | Módulo Alumnos | Registro de alumnos con persistencia completa al dar F5. | Super Admin, Staff |
| `/admin/facturacion` | Módulo Facturación | Registro de abonos por **Yape**, **Efectivo** o **Transferencia**, avisos y comprobantes. | **SOLO Super Admin (Dueña)** |
| `/admin/invitaciones` | Gestión de Invitaciones | Generador de links WhatsApp con **Envío Directo en 1 clic** (`wa.me/`). | Super Admin, Staff |
| `/admin/control-horario` | Control Horario & Cierre | Monitor en vivo de profesores en sede, consolidado de horas y **exportación a Excel (.CSV)**. | Super Admin, Staff |
| `/teacher` | Kiosco Profesor (3-en-1) | Cabecera Unificada **IntegratedTeacherKioskHeader** (Fichaje + Clase en curso + Asistencia). | Profesor |
| `/teacher/agenda` | Agenda Didáctica Profe | Vista semanal interactiva con botones de marcado rápido de asistencia. | Profesor |
| `/teacher/nomina` | Registro de Horas Profe | **Sin montos ni saldos**: Registro transparente de **Horas Impartidas** y estado Auditado. | Profesor |
| `/family` | Portal Familia | Resumen del hogar, avance de asistencia y **Modal Onboarding "Pagar con..."** (`970608367`). | Familia |

---

## 4. Estructura de Documentación (.ADR, .LOG, Graphify)

- **ADRs Registrados (`docs/adr/`)**:
  - `0001` a `0023`: Historial técnico completo.
  - `0024-secure-login-gate-and-invitation-hierarchy.md`: Puerta de acceso y jerarquía de contraseñas.
  - `0025-session-persistence-f5-and-invitation-resilience.md`: Persistencia de sesión tras recargar F5 y resiliencia en invitaciones.
- **Auditoría de Backend**: [`docs/BACKEND_AUDIT.md`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/BACKEND_AUDIT.md).
- **Control de Versiones**: [`docs/CHANGELOG.md`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/CHANGELOG.md).
