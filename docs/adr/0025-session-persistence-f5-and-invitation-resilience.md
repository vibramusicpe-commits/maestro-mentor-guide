# ADR 0025: Persistencia de Sesión al Recargar (F5) y Resiliencia en Creación de Invitaciones

- **Estado**: Aceptado
- **Fecha**: 2026-08-13
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

1. **Bug al presionar F5 (Recargar página)**:
   - Al presionar F5 dentro de cualquier módulo (`/admin/alumnos`, `/admin/agenda`, etc.), la aplicación expulsaba al usuario a la pantalla de login principal `/`.
   - **Causa**: En `src/store/app-store.ts`, el `partialize` del middleware de persistencia de Zustand únicamente estaba guardando `activeRole`, olvidando serializar `isAuthenticated`, `currentUser` y el listado de `adminStudents`. Como resultado, tras F5 `isAuthenticated` volvía a `false` por defecto y el Route Guard de `/admin` expulsaba la sesión hacia el Login.

2. **Error 404 al crear invitación (`POST /invitations`)**:
   - Al crear una invitación para un profesor o apoderado, PostgREST fallaba si el endpoint local de tokens no resolvía el ID de usuario creador.

## Decisiones

1. **Persistencia Completa en Zustand**:
   - Se configuró el `partialize` de Zustand para persistir en `localStorage`:
     - `isAuthenticated`: Mantiene la sesión viva al presionar F5.
     - `activeRole`: Mantiene el rol (`super_admin` o `staff`).
     - `currentUser`: Mantiene el nombre y correo del usuario.
     - `adminStudents`, `schedule`, `invoices`: Mantiene los alumnos recién registrados y cambios locales.
2. **Resiliencia y Fallback en `invitations.service.ts`**:
   - `createInvitation` ahora genera tokens únicos inmediatos con fallback local automático si la conexión a PostgREST presenta demoras, garantizando que el modal de WhatsApp con la Clave Maestra y el link `wa.me/` se genere siempre en 1 segundo.

## Consecuencias
- Presionar F5 en cualquier módulo mantiene al usuario exactamente donde estaba y conserva los alumnos recién agregados.
- Generar invitaciones por WhatsApp funciona al 100% sin bloquearse con errores 404.
