# ADR 0083: Unificación de Clave Maestra Estable y Sincronización de Invitaciones en Insforge PostgreSQL

## Estado
Aceptado e Implementado

## Contexto
Durante las pruebas de acceso del profesor Fernando (`fernando@vibramusic.pe`), se detectaron dos problemas críticos en el flujo de credenciales:
1. **Ausencia de Registro en PostgreSQL**: Mientras que Nathaly y Jeremy tenían registros en la tabla `public.invitations` en la nube, la invitación de Fernando solo existía en semillas estáticas (`baseSeeds`) y `localStorage` del navegador local, impidiendo su sincronización remota e imposibilitando la resolución de su token en navegadores limpios o móviles.
2. **Aleatoriedad Indebida en el Restablecimiento ("Reset")**: Al pulsar el botón "Reset" en el panel administrativo (`/admin/invitaciones`), la función `resetUserToMasterPassword` generaba una cadena aleatoria (`generateMasterPassword()`) en cada clic en lugar de restaurar la Clave Maestra oficial única (`Vibra-FERNAN-2026`). Además, la búsqueda en PostgreSQL fallaba porque comparaba `target_email: eq.${targetUserId}` pasando un ID de semilla en lugar del correo o UUID, dejando PostgreSQL sin actualizar y saturando el `localStorage` con variantes inconsistentes.
3. **Sensibilidad Estricta a Mayúsculas en Teclados Móviles**: Al escribir la clave maestra en dispositivos móviles, diferencias de mayúsculas/minúsculas (por ejemplo `vibra-fernan-2026` vs `Vibra-FERNAN-2026`) impedían el ingreso a pesar de ser la clave correcta.

## Decisiones Técnicas

1. **Clave Maestra Única, Oficial y Estable**:
   - Se estableció que cada profesor del equipo principal cuenta con una **única Clave Maestra oficial**, inmutable en reinicios:
     * **Fernando**: `Vibra-FERNAN-2026`
     * **Jeremy**: `Vibra-ZL3F-EMGN`
     * **Nathaly**: `Vibra-NATHAL-2026`
     * **Nayeli**: `NayeliVibra2026*`
   - La acción de "Reset" restaura estrictamente esta clave oficial a estado `pendiente` con `accepted_at: null`, en lugar de generar contraseñas efímeras.

2. **Sincronización Total en `public.invitations` de Insforge PostgreSQL**:
   - Se insertó y vinculó el registro de Fernando en PostgreSQL (`id: 0e9ad54a-ef5d-49fb-9ae0-4dcdc884d111`, `target_teacher_id: 00000000-0000-0000-0000-000000000004`, `token: inv-teacher-Fernando-Violin_Piano-vibra2026`).
   - `resetUserToMasterPassword` ahora recibe `targetUserId`, `targetEmail` y `token`, buscando en PostgreSQL por UUID, correo o token y actualizando la base de datos remota antes de sincronizar el caché local.
   - El panel de administración muestra en el toast de confirmación la clave maestra restaurada explícitamente (`Vibra-FERNAN-2026`).

3. **Tolerancia Case-Insensitive en Validación de Clave Maestra**:
   - En `src/routes/invite.$token.tsx`, `handlePasswordSubmit` evalúa tanto la coincidencia exacta como `toLowerCase()`, permitiendo a los profesores escribir sus credenciales en cualquier teclado sin rechazos por autocapitalización.

## Consecuencias y Validación

* **Estado en Producción**:
  - Fernando ingresó al portal, aceptó su invitación con su contraseña personalizada (`fernando123`), y fichó entrada en sede (`clock_in: 2026-09-09T22:50:07Z`, `status: trabajando`).
  - Los 3 profesores de la academia (Fernando, Jeremy, Nathaly) se encuentran simultáneamente registrados, con invitaciones aceptadas y turnos activos en `public.teacher_time_logs`.
* **Compilación**: `npm run build` completado sin errores (código de salida 0).
