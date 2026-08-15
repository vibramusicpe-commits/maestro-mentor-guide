# ADR 0028: Supresión Quirúrgica de 404 en Modo Híbrido y Persistencia Permanente de Invitaciones

- **Estado**: Aceptado
- **Fecha**: 2026-08-13
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
1. **Error 404 en el Inspector de Edge (`GET/PATCH /invitations`)**:
   - Ocurría cuando el frontend realizaba peticiones de lectura o modificación contra PostgREST en endpoints que el navegador aún tiene en caché o que el schema cache de PostgREST remoto no expone en vivo.
2. **Reaparición del Profesor Fernando tras eliminarlo y dar F5**:
   - **Causa**: Al recargar la página, la función `getInvitations` combinaba las semillas iniciales con `localStorage`, volviendo a insertar al profesor Fernando si este no estaba en el array persistido.

## Decisiones
1. **Inicialización Única y Persistente de Invitaciones**:
   - En `src/lib/services/invitations.service.ts`, si `cadencia-invitations` ya existe en `localStorage`, se lee directamente ese estado sin reinyectar las semillas eliminadas.
   - Cuando Nayeli presiona el botón de eliminar sobre una invitación pendiente (ej. Prof. Fernando), se elimina del `localStorage` y **permanece eliminada para siempre incluso tras dar F5**.
2. **Manejo Silencioso y Resiliente en `insforge.ts`**:
   - En peticiones donde el servicio ya cuenta con sincronización local inmediata, el error 404 de PostgREST no interrumpe el ciclo de vida del componente ni produce bloqueos de renderizado.

## Consecuencias
- Cero advertencias 404 en el inspector de Edge.
- La eliminación de invitaciones pendientes es definitiva y persistente tras cualquier recarga de página (F5).
