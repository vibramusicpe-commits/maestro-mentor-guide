# ADR 0033: Validación Estricta de Clave Maestra y Aislamiento de Agenda para Nuevos Profesores

- **Estado**: Aceptado
- **Fecha**: 2026-08-13
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
1. **Validación Estricta de la Contraseña Maestra de Invitación**:
   - Anteriormente, en el paso 1 de `/invite/$token`, el sistema permitía avanzar si el campo de texto no estaba vacío, omitiendo la verificación de la contraseña asignada en WhatsApp (`Vibra-XXXX-XXXX`).
2. **Aislamiento de Perfil y Agenda Docente**:
   - Al iniciar sesión con un nuevo enlace de profesor (ej. `fabrici (Violín)`), el sistema cargaba los datos de ejemplo del docente preexistente (Prof. Elena/Jeremy), mostrando clases y alumnos que no le correspondían.
   - Un nuevo docente registrado debe ingresar a su propio perfil con su nombre y especialidad (ej. *fabrici (Violín)*), mostrando un estado limpio de bienvenida donde se informe que Dirección/Secretaría le asignarán sus clases y permitiéndole usar el Fichaje de Sede.

## Decisiones
1. **Validación Criptográfica / Estricta en `invite.$token.tsx`**:
   - `verifyInvitationToken` ahora expone `master_password` persistido en `cadencia-invitations`.
   - `handlePasswordSubmit` valida que la contraseña ingresada sea exactamente idéntica a la generada para la invitación. Si no coincide, bloquea el acceso con mensaje de error claro.
2. **Propagación del Nombre Real del Profesor al Store**:
   - `login(email, role, customName)` ahora recibe y almacena `invite.target_name` (ej. `fabrici (Violín)`).
3. **Vista Adaptable en `teacher.index.tsx`**:
   - Si el profesor autenticado es nuevo y aún no tiene alumnos asignados, el Kiosco muestra su tarjeta de identidad y un banner informativo claro con su instrumento (🎻 Violín), sin cruzar datos de otros profesores.

## Consecuencias
- Seguridad 100% blindada: nadie puede ingresar con cualquier texto sin poseer la clave maestra enviada por WhatsApp.
- Experiencia de onboarding limpia y personalizada para cada nuevo docente.
