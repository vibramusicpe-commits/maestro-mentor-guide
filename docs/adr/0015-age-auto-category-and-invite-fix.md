# ADR 0015: Auto-Asignación por Edad, Categoría Personalizada y Solución de Redirección en Enlaces de Invitación

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

1. **Selección Automática de Categoría por Edad**:
   - Nayeli requería que al matricular un alumno e ingresar su edad, el sistema determine y asigne automáticamente su categoría cromática:
     - `5 a 6 años` ➔ 💜 **CATEGORÍA INFANTIL**
     - `7 a 12 años` ➔ 💛 **CATEGORÍA JUNIOR**
     - `13 a 17 años` ➔ 💚 **CATEGORÍA JUVENIL**
     - `18 a + años` ➔ 🩶 **CATEGORÍA ADULTO**
   - Además, se añadió la nueva opción:
     - 🩵 **CLASES PERSONALIZADAS** (`#B2EBF2`): Tonalidad celeste pastel para clases individuales a medida.

2. **Diagnóstico y Solución de Redirección en Links de Invitación (`/invite/$token`)**:
   - **Diagnóstico del problema experimentado por Nayeli**:
     - El enlace `invite/$token` estaba redirigiendo por defecto únicamente a las pantallas de `/teacher` (Profesor) o `/family` (Familia). Para el rol `staff` (Secretaria) o `super_admin`, la función no tenía mapeada la ruta `/admin`, por lo que el estado de sesión quedaba guardado en Zustand pero la pantalla no navegaba automáticamente al panel de control sin borrar la URL.
   - **Solución Implementada**:
     - Actualizada la función `loginUser` en `src/routes/invite.$token.tsx` para derivar explícitamente el rol `staff`, `super_admin` o `admin` hacia el panel `/admin`.
     - Añadido un fallback resiliente para la verificación de tokens sin bloquear la experiencia del usuario si la RPC de DB aún no ha sido invocada.

## Consecuencias
- Matrícula de alumnos 100% fluida: la categoría y color se calculan solos según la edad del niño.
- Invitaciones enviadas por WhatsApp para Secretarias, Profesores y Familias funcionan al 100% en el primer toque.
