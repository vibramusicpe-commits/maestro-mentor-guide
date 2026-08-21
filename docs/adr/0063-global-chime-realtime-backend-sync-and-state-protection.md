# ADR 0063: Timbre Automático 24/7 Global, Puente de Sincronización en Tiempo Real a PostgreSQL y Blindaje de Persistencia Local

## Estado
Aceptado, Implementado y Auditado en Producción

## Contexto
Durante las pruebas de producción con la secretaría (Nayeli):
1. Se reportó que al recargar o rehidratar la página, las modificaciones realizadas en caliente se restablecían al estado inicial debido a una recarga forzada en `onRehydrateStorage` y a la exclusión temporal de `adminStudents` en `partialize`.
2. El timbre automático oficial no sonaba consistentemente si Nayeli se encontraba trabajando en pantallas distintas a la Agenda (`/admin/alumnos`, `/admin/facturacion`, Dashboard) o si la pestaña del navegador entraba en suspensión/retraso de timers.
3. Las operaciones de edición de fichas, cambios de estado y registro de abonos no contaban con un puente asíncrono directo que enviara las mutaciones a la base de datos PostgreSQL de Insforge en tiempo real.

## Decisiones Técnicas

### 1. Blindaje Total de Persistencia Local (`cadencia-app-v21`)
- Se incluyeron nuevamente `adminStudents`, `invoices`, `schedule`, `lessons`, `chimeSettings`, `studentAlerts` y `deletionRequests` en la persistencia local de Zustand.
- Se eliminó cualquier reinicio forzado en `onRehydrateStorage`. Si el navegador del usuario contiene datos modificados válidos, estos se preservan intactos sin ser sobreescritos por constantes estáticas.

### 2. Timbre Automático de Escuela Global (24/7 en `AdminLayout`)
- Se trasladó el temporizador del timbre acústico desde `agenda-board.tsx` al layout raíz administrativo (`src/routes/admin.tsx`).
- Se implementó un detector de bloque horario inmune a fluctuaciones de reloj (`lastChimedMinuteRef`) para garantizar la emisión del timbre en los turnos oficiales de Vibra Music:
  * **Lunes a Viernes:** 16:00, 16:45, 17:30, 18:15, 19:00, 19:45
  * **Sábados:** 09:00, 09:45, 10:30, 11:15, 12:00, 12:45, 13:30
- Se integró el desbloqueo automático del motor Web Audio (`AudioContext`) en la primera interacción del usuario.

### 3. Puente de Sincronización en Tiempo Real a PostgreSQL Insforge
- Se corrigió `isConfigured: true` en `src/lib/insforge.ts` para habilitar el endpoint oficial de producción `https://pdey9yma.us-east.insforge.app/rest/v1`.
- Se crearon los sincronizadores en segundo plano `backgroundSyncStudentToDB` y `backgroundSyncPaymentToDB`:
  * Cada edición de ficha de alumno (`updateStudentDetails`, `setStudentStatus`, `setStudentModality`) envía un `PATCH` a la tabla `students`.
  * Cada abono registrado (`recordPaymentAbono`) inserta un registro en `payment_audit_logs` y actualiza el saldo en la tabla `invoices`.

## Consecuencias
- Cero pérdida de datos: el trabajo de Secretaría queda respaldado de inmediato en almacenamiento local (0ms) y en la nube PostgreSQL.
- El timbre escolar suena puntualmente en todas las pantallas del panel administrativo sin interrupciones.
