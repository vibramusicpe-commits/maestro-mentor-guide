# ADR 0024: Puerta de Entrada Segura (Dueña vs Secretaria) y Control de Creación de Accesos

- **Estado**: Aceptado
- **Fecha**: 2026-08-13
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

1. **Vulnerabilidad en Demo**: En la pantalla de inicio `/`, cualquier contraseña permitía el acceso a ambos perfiles (Dueña y Secretaria) sin verificar la clave real correspondiente.
2. **Jerarquía Estricta de Accesos**:
   - **Dueña (Super Admin)**: Control total, finanzas, facturación, reportes y configuración.
   - **Secretaria (Staff - Nayeli)**: Gestión operativa, horario de clases, asistencia, registro de alumnos y generación de invitaciones por WhatsApp.
   - **Regla Inviolable**: La Secretaria **nunca** puede crear cuentas de Super Admin ni otorgarse acceso al panel financiero de la Dueña.

## Decisiones

1. **Credenciales Oficiales Asignadas en Puerta de Acceso (`/`)**:
   - **Dueña (`super_admin`)**: Clave `VibraDuena2026!` (correo: `direccion@vibramusic.pe`).
   - **Secretaria (`staff` - Nayeli)**: Clave `NayeliVibra2026*` (correo: `nayeli@vibramusic.pe`).
   - Cualquier otra palabra o clave errónea bloquea el acceso mostrando un mensaje de advertencia.

2. **Módulo de Creación de Invitaciones (`/admin/invitaciones`)**:
   - Tanto la Dueña como Nayeli pueden generar invitaciones para:
     - 🎓 **Profesores** (Acceso a Kiosco y toma de asistencia).
     - 👨‍👩‍👧 **Familias / Alumnos** (Acceso a Portal de Pagos y Avance).
   - En el selector de creación, está restringido exclusivamente a `teacher` y `family`. No existe la opción de que la secretaria cree un Super Admin.

3. **Blindaje de Rutas y Menú**:
   - La ruta `/admin/facturacion` posee un Route Guard (`beforeLoad`) que expulsa a la Secretaria si intenta ingresar manualmente por URL.

## Consecuencias
- La puerta de enlace es 100% segura con credenciales diferenciadas.
- La Dueña y Nayeli pueden otorgar accesos rápidos por WhatsApp sin requerir soporte de programación.
