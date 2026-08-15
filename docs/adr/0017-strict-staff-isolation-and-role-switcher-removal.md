# ADR 0017: Eliminación de Selector de Roles Móvil y Blindaje Estricto del Rol Staff

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

Durante las pruebas en formato móvil (celular):
1. Aparecía el componente `RoleSwitcher` (la píldora de simulación con opciones *Super Admin, Staff, Profesor, Familia*) que permitía a Nayeli cambiar su rol en caliente a la Dueña.
2. Al estar en rol `staff`, un `useEffect` en `admin.tsx` la ascendía erróneamente a `super_admin`.

## Decisiones

1. **Eliminación Total de `RoleSwitcher`**:
   - Se removió el componente `RoleSwitcher` de `src/routes/admin.index.tsx` para asegurar que ningún usuario pueda auto-cambiarse de rol desde el cliente.

2. **Preservación del Rol y Guard en Facturación**:
   - En `src/routes/admin.tsx` se eliminó el cambio automático de rol, respetando la sesión `staff`.
   - En `src/routes/admin.facturacion.tsx` se añadió un `beforeLoad` Route Guard estricto que redirige inmediatamente a `/admin` a cualquier usuario con rol `staff`.

## Consecuencias
- Nayeli o cualquier miembro del equipo `staff` solo verá lo correspondiente a sus funciones operativas sin posibilidad alguna de saltar al rol de la Dueña ni ver las finanzas corporativas.
- Experiencia móvil totalmente limpia y segura.
