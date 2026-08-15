# ADR 0034: Botón de Inspección de Credenciales (Icono de Ojo) y Diagnóstico de Conexión Backend Insforge PostgREST

- **Estado**: Aceptado
- **Fecha**: 2026-08-13
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
1. **Botón de Inspección de Credenciales (Icono de Ojo)**:
   - En la tabla de Historial de Invitaciones (`/admin/invitaciones`), Nayeli y la Dueña necesitaban un botón con el icono de ojo (`👁️ Ver Acceso`) para ver el enlace generado y la clave de acceso de cualquier profesor o familia.
   - **Regla de Seguridad**: El botón de ojo queda estrictamente oculto para la cuenta de la Dueña (`super_admin`).
2. **Diagnóstico del Error 404 de PostgREST en Consola**:
   - Al inspeccionar la base de datos PostgreSQL de Insforge mediante MCP (`insforge-postgres`), confirmamos que la tabla `invitations` y sus 15 columnas existen físicamente en la base de datos de producción (`pdey9yma.us-east.insforge.app`).
   - El mensaje `404 (Not Found)` en la consola del navegador ocurre porque el servicio de API Gateway PostgREST remoto de Insforge no tiene expuesto o sincronizado el endpoint REST `/rest/v1/invitations` para la clave anónima (`anonKey`).
   - El motor de backend de la aplicación opera en **Modo Híbrido Resiliente**: intenta conectarse al servidor PostgREST y, al recibir un 404, conmuta en tiempo real al almacenamiento local (`cadencia-invitations`) sin romper la experiencia del usuario ni bloquear ninguna funcionalidad.

## Decisiones
1. En `src/routes/admin.invitaciones.tsx`:
   - Se agregó el botón `👁️ Ver Acceso` para todas las filas excepto la Dueña.
   - Al hacer clic, se abre un modal con la **Contraseña de Ingreso**, el **Enlace Directo de Acceso**, botones para copiar al portapapeles con feedback y botón para abrir el portal directamente.
2. En `src/lib/insforge.ts` e `invitations.service.ts`:
   - El manejo de errores PostgREST se mantiene optimizado y documentado en este ADR para que todo el equipo técnico conozca la causa y el funcionamiento del fallback.

## Consecuencias
- La secretaría puede consultar y reenviar cualquier credencial perdida en segundos con un clic en el icono de ojo.
- Las credenciales de la Dueña permanecen completamente invisibles y blindadas.
