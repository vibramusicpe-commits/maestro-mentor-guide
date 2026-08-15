# ADR 0031: Resolución de Rol en Invitaciones de Profesores e Importación de Slots en Rejilla Semanal

- **Estado**: Aceptado
- **Fecha**: 2026-08-13
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
1. **Error de Acceso de Profesor Redirigido como Apoderado**:
   - Al abrir un enlace de invitación generado para un profesor (ej. `/invite/inv-msrxyxo5-ups6`), la pantalla de bienvenida mostraba el título "APODERADO/A · Portal de Familias" en lugar de "PROFESOR/A · Kiosco de Clases".
   - **Causa**: En `src/lib/services/invitations.service.ts`, la función `verifyInvitationToken` no estaba consultando el registro guardado en `cadencia-invitations` de `localStorage`, recurriendo a un fallback que asumía `family` por defecto.
2. **Error `ReferenceError: timeSlotsWeekday is not defined` en Rejilla Semanal**:
   - Al cambiar la vista a "Rejilla Semanal" en el módulo de Agenda (`/admin/agenda`), la aplicación fallaba porque `timeSlotsWeekday` y `timeSlotsSaturday` se utilizaban en la línea 472 sin haber sido importados desde `@/store/admin-seeds`.

## Decisiones
1. **Sincronización de Rol en `verifyInvitationToken`**:
   - `verifyInvitationToken` ahora busca primero en `localStorage` (`cadencia-invitations`) el token exacto y extrae `target_role: "teacher"`, su nombre real y su especialidad musical, renderizando la pantalla de bienvenida oficial para **Profesores** y redirigiéndolo a `/teacher`.
2. **Importación de Horarios en `agenda-board.tsx`**:
   - Se importaron `timeSlotsWeekday` y `timeSlotsSaturday` en `src/components/admin/agenda-board.tsx`.

## Consecuencias
- Al abrir una invitación de profesor, se muestra inmediatamente la pantalla de bienvenida de Docente y el acceso al Kiosco de Clases.
- La vista de Rejilla Semanal en la Agenda carga sin errores.
