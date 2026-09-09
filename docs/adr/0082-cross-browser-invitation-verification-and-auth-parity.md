# ADR 0082: Resolución de Paridad Multi-Navegador en Verificación de Invitaciones y Autenticación Docente

## Estado
Aprobado e Implementado

## Fecha
2026-09-09

## Contexto
Se reportó que al abrir un enlace de invitación docente (`/invite/{token}`) en Microsoft Edge, la profesora (Nathaly) pudo ingresar y definir su contraseña personalizada (`nathaly1`).
Sin embargo, al abrir el mismo enlace en otros navegadores (Google Chrome, Brave Browser) o en modo incógnito:
1. El sistema solicitaba la contraseña pero inmediatamente forzaba a la usuaria a "Crear una nueva contraseña" en cada navegador.
2. Si se ingresaba la contraseña personalizada ya establecida, el sistema la rechazaba con error de credenciales.

## Causa Raíz Diagnosticada
1. **Intercepción de Semillas Estáticas sobre la Base de Datos**: En `src/lib/services/invitations.service.ts`, la función `verifyInvitationToken` evaluaba primero el objeto estático `TEACHER_SEEDS` antes de consultar Insforge PostgreSQL.
2. **Dependencia Oculta del Almacenamiento Local**: Dentro del bloque de coincidencia de semillas, el código intentaba resolver el estado (`status: 'aceptado'`) y la contraseña (`custom_password`) leyendo exclusivamente `localStorage.getItem("cadencia-invitations")`.
3. **Aislamiento de Almacenamiento entre Navegadores**: Dado que cada navegador (Edge, Chrome, Brave) posee su propio `localStorage` aislado, en Chrome y Brave el caché estaba vacío. En consecuencia:
   - `realStatus` defaulteaba a `'pendiente'`.
   - `resolvedPassword` defaulteaba a la contraseña de semilla `'Vibra-NATHAL-2026'` en lugar de la contraseña real de PostgreSQL (`'nathaly1'`).
   - La base de datos PostgreSQL de Insforge (que ya tenía `status = 'aceptado'` y `master_password = 'nathaly1'`) nunca era consultada.
   - La vista de TanStack Router (`src/routes/invite.$token.tsx`), al recibir `status = 'pendiente'`, forzaba el paso `setView("change_password")`.

## Decisiones Técnicas Adoptadas
1. **PostgreSQL como Fuente de Verdad Primaria**:
   - `verifyInvitationToken` ahora consulta en primer lugar la tabla `public.invitations` en Insforge PostgreSQL (`postgrestSelect`).
   - Si el registro existe en la base de datos, retorna el `status` real (`aceptado` o `pendiente`) y el `master_password` vigente en la nube.
   - Solo si la base de datos remota está inaccesible o no tiene el registro, se recurre a `localStorage` y semillas estáticas como respaldo offline de contingencia.
2. **Validación Resiliente en `handlePasswordSubmit`**:
   - En `src/routes/invite.$token.tsx`, la contraseña ingresada se valida contra el registro de PostgreSQL.
   - Si no coincide de inmediato (por ejemplo, si fue cambiada hace segundos en otro dispositivo), se realiza una consulta en vivo a PostgreSQL por email.
   - Se mantiene soporte tanto para la clave personalizada como para las claves maestras iniciales.
3. **Control de Flujo de Aceptación Inmutable**:
   - Si `invite.status === 'aceptado'`, el usuario es autenticado de inmediato (`loginUser`) y redirigido a `/teacher` sin volver a mostrar jamás el formulario de cambio de contraseña.
4. **Preservación de Credenciales en Historial Administrativo**:
   - En `getInvitations`, la fusión de registros ahora preserva `master_password: remote.master_password` de PostgreSQL.

## Verificación de Resultados
- Confirmado que para el token de Nathaly (`inv-teacher-Nathaly-Canto_PianoInfantil-vibra2026`), `verifyInvitationToken` obtiene directamente de PostgreSQL `status: "aceptado"` y `master_password: "nathaly1"`.
- Al ingresar en Brave, Chrome o Edge, el sistema valida la contraseña y accede directamente sin solicitar crear una nueva contraseña.
- Compilación de producción (`npm run build`) completada con código 0.
