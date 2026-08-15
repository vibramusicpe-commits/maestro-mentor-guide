# ADR 0027: Jerarquía de Seguridad en Invitaciones y Protección de Datos contra Fugas

- **Estado**: Aceptado
- **Fecha**: 2026-08-13
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
- A raíz del antecedente de fuga de datos sufrido por la Dueña con un ex-socio anterior, se requiere un esquema estricto de permisos y privilegios irrevocables:
  1. **Eliminación de Accesos/Profesores Activos**:
     - Nayeli (Secretaria / `staff`) **NO PUEDE** eliminar profesores ni familias que ya tengan acceso aceptado o activo en el sistema.
     - Nayeli **SÍ PUEDE** cancelar/eliminar invitaciones que todavía figuren en estado **"pendiente"** (por ejemplo, si se equivocó al escribir el correo o el nombre y necesita volver a generarla).
     - **Solo la Dueña (`super_admin`)** tiene el poder de eliminar o revocar cuentas ya aceptadas.
  2. **Restablecimiento de Contraseña Maestra (Reset)**:
     - **¿Qué significa el botón "Reset"?**: Si un profesor o un apoderado cambia su clave por una personal y luego la olvida (o hay sospecha de extravío), Nayeli puede presionar "Reset" para restaurar la cuenta a la **Clave Maestra** original generada por la academia, permitiéndole enviar nuevamente la clave temporal por WhatsApp para que la persona vuelva a ingresar sin llamar al desarrollador.
     - **Protección de la Dueña**: Nadie, ni siquiera Nayeli o un usuario Staff, puede presionar "Reset" sobre la cuenta o perfil de la Dueña.

## Decisiones
1. En `src/routes/admin.invitaciones.tsx`, el botón de eliminación/revocación (`<Ban />`) solo se renderiza para el rol `staff` si `inv.status === 'pendiente'`. Si la invitación ya fue aceptada, el botón queda oculto para Nayeli y solo visible para la Dueña (`activeRole === 'super_admin'`).
2. En `handleResetPassword`, se valida estrictamente que si el registro pertenece a la Dueña (`super_admin`), el sistema rechaza la acción con una alerta de denegación de privilegios.
3. Se añadió persistencia bidireccional en `localStorage` con clave `cadencia-invitations` para que las invitaciones creadas no generen errores 404 ni se pierdan tras recargar.

## Consecuencias
- Cero fugas o borrados no autorizados de información institucional.
- Nayeli tiene la libertad operativa de corregir errores en invitaciones pendientes y recuperar accesos de profesores/alumnos que olvidaron su clave.
