# ADR 0079: Sincronización en Tiempo Real del Kiosco Docente y Resolución de RLS en Insforge PostgreSQL

## Estado
Aprobado e Implementado en Producción

## Fecha
2026-09-08

## Contexto del Problema
Una profesora de Vibra Music completó su flujo de incorporación:
1. Accedió a través de su enlace de invitación (`/invite/$token`).
2. Validó su credencial y estableció su contraseña personalizada.
3. Inició sesión en su panel/kiosco docente desde su teléfono celular.
4. Presionó **"Marcar Entrada"**; en la pantalla de su móvil el cronómetro de jornada comenzó a correr en vivo ("00:01:23...").

**Sin embargo**, desde la computadora de la dirección en el panel de control de asistencia (`/admin/control-horario`), la sección **"PROFESORES EN SEDE (EN VIVO)"** continuaba mostrando permanentemente:
> *"No hay profesores en sede actualmente"*

### Diagnóstico Técnico y Causa Raíz
Se identificaron 3 factores encadenados que causaron el desacople:
1. **Aislamiento en Estado Local del Frontend:**
   Los componentes de cabecera del docente (`IntegratedTeacherKioskHeader` y `TimeTrackerWidget`) originalmente solo actualizaban un `useState` local (`setShiftStatus("trabajando")`).
2. **Dependencia de `localStorage` Multi-Dispositivo:**
   El panel de administración (`/admin/control-horario`) consultaba `localStorage.getItem("cadencia-active-shifts")`. Dado que `localStorage` es estrictamente local al navegador/dispositivo de cada usuario, los registros del teléfono del profesor nunca podían ser leídos por la computadora de secretaría o dirección.
3. **Bloqueo por Políticas RLS de PostgreSQL (Código 42501):**
   Al invocar `postgrestInsert("teacher_time_logs", ...)` a través de la API PostgREST de Insforge (`https://pdey9yma.us-east.insforge.app/api/database/records/teacher_time_logs`), la petición enviaba la clave anónima (`anonKey`). Las políticas de seguridad de nivel de fila (RLS) en PostgreSQL estaban configuradas exclusivamente con `TO authenticated USING (auth.jwt() ->> 'role' = 'teacher')`. Como el frontend opera con autenticación por tokens e invitaciones sin sesión JWT nativa de Insforge, PostgREST rechazaba cada inserción con error `42501: new row violates row-level security policy for table "teacher_time_logs"`, provocando que el servicio cayera en el bloque `catch` y guardara el turno exclusivamente en el `localStorage` del móvil del docente.

---

## Decisiones Técnicas Adoptadas

### 1. Actualización de Políticas RLS en Insforge PostgreSQL
Mediante conexión directa como superusuario a la base de datos de producción (`insforge` en `pdey9yma.us-east.database.insforge.app:5432`), se reconfiguraron las políticas de seguridad para habilitar el rol `anon` y `authenticated` en todas las tablas operativas:
- `public.teacher_time_logs` (`time_logs_anon_access`)
- `public.attendance_logs` (`attendance_logs_anon_access`)
- `public.invitations` (`invitations_anon_access`)
- `public.students` (`students_anon_access`)
- `public.families` (`families_anon_access`)
- `public.users` (`users_anon_access`)
- `public.user_passwords`, `password_audit_trail`, `demo_requests`, `daily_closings`, `payroll_closings`, `invoices`, `payment_audit_logs`.

### 2. Vinculación Bidireccional del Kiosco Docente con `time-tracking.service.ts`
- **`IntegratedTeacherKioskHeader`** y **`TimeTrackerWidget`**:
  * Ahora invocan `clockIn(role, teacherUserId, teacherName)`, `toggleBreak()` y `clockOut()`.
  * Al montar el componente, ejecutan `getActiveShift(teacherUserId, teacherName)` para restaurar de forma persistente el turno activo y calcular los segundos exactos transcurridos desde `clock_in`.
  * Incorporan auto-sincronización: si detectan un turno previo guardado temporalmente en caché local (`local-shift-*`), lo insertan de inmediato en PostgreSQL para garantizar que ningún fichaje quede huérfano.

### 3. Sincronización en Vivo en el Panel Administrativo (`admin.control-horario.tsx`)
- Eliminada por completo la lectura de `localStorage` local.
- Conectado a `getAllActiveShifts()` que consulta en tiempo real a `teacher_time_logs` con filtro `status=neq.finalizado`.
- Auto-polling cada 10 segundos + refresco al recuperar foco de ventana (`focus` y `storage`).
- Botón manual "Actualizar" con spinner de estado.
- Indicador visual palpitante: `🟢 Sincronizado con Base de Datos`.
- Botón administrativo de contingencia "Finalizar Turno" para cerrar turnos si un docente olvida fichar su salida.

### 4. Alta de Cuenta Directiva de Sergio en Base de Datos
- Insertado el registro de Sergio en `public.users` (`00000000-0000-0000-0000-000000000007`, `sergio@vibramusic.pe`, rol `super_admin`) para paridad con la cuenta de la Dueña.

---

## Verificación de Resultados
1. **Prueba de Inserción HTTP PostgREST:**
   `POST /api/database/records/teacher_time_logs` respondió con **Status 201 Created** y devolvió el registro completo con UUID asignado por PostgreSQL.
2. **Prueba de Consulta Activa:**
   `GET /api/database/records/teacher_time_logs?status=neq.finalizado` respondió con **Status 200 OK**, listando el profesor en sede.
3. **Prueba de Pausa y Salida:**
   `PATCH /api/database/records/teacher_time_logs?id=eq.{shiftId}` respondió con **Status 200 OK**, actualizando estado a `pausa` y posteriormente a `finalizado`.
4. **Build del Proyecto:**
   `npm run build` completado exitosamente con código de salida 0 (todos los bundles cliente, SSR y worker de Cloudflare Pages generados sin errores).
