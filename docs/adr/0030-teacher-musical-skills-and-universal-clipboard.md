# ADR 0030: Selector de Habilidad Musical Docente y Portapapeles Universal con Retroalimentación Visual

- **Estado**: Aceptado
- **Fecha**: 2026-08-13
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
1. **Asociación de Especialidad / Habilidad Musical al Invitar Profesores**:
   - Para identificar de qué disciplina es cada docente desde el momento de su enrolamiento, se debe poder vincular la habilidad musical oficial (*Batería, Canto, Guitarra, Piano, Piano Infantil, Violín*). El nombre en la lista de invitaciones y en el mensaje de WhatsApp debe reflejar dicha especialidad.
2. **Copia Universal al Portapapeles (Ctrl + C) para Redes Sociales y Correo**:
   - El botón de copia en el modal de invitación necesitaba funcionar de manera universal (en navegadores seguros y no seguros) y ofrecer **retroalimentación visual inmediata** ("¡Copiado al Portapapeles! 📋") para que el personal pueda pegar el mensaje en Instagram, Messenger, WhatsApp Web o correos.

## Decisiones
1. En `src/store/admin-seeds.ts`:
   - Se exportó el arreglo oficial `musicalInstruments = ["Batería", "Canto", "Guitarra", "Piano", "Piano Infantil", "Violín"]`.
2. En `src/routes/admin.invitaciones.tsx`:
   - Se agregó el campo desplegable **"Especialidad / Habilidad Musical"** cuando `inviteType === 'teacher'`, concatenando la especialidad al nombre del docente (ej. `Prof. Elena Márquez (Piano Infantil)`).
   - Se implementó `handleCopyWhatsApp` con fallback de `document.execCommand('copy')` para garantizar copia infalible en cualquier dispositivo y sistema operativo, cambiando el texto del botón temporalmente a `¡Copiado al Portapapeles!` con check verde.

## Consecuencias
- Todos los profesores quedan clasificados por su instrumento de enseñanza desde su registro.
- El personal puede copiar el mensaje formateado con un solo clic y pegarlo en cualquier red social sin fallos.
