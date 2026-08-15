# ADR 0029: Vinculación Inteligente de Invitaciones (Profesor, Apoderado y Alumno Adulto) y Directorio de Salvataje de Clases

- **Estado**: Aceptado
- **Fecha**: 2026-08-13
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
1. **Generación de Invitaciones con Contexto de Alumno**:
   - Para evitar duplicación y errores al crear accesos, Nayeli necesita elegir entre 3 tipos de invitación:
     1. **Profesor / Docente**: Para acceso al Kiosco de asistencia.
     2. **Familiar / Apoderado (Menores de 18)**: Vinculado a un alumno menor de edad, completando automáticamente el nombre del apoderado o familia y su teléfono/correo.
     3. **Alumno Adulto (+18)**: Cuando el alumno es mayor de edad y él mismo gestiona y paga su formación.
2. **Directorio Global de Alumnos para Profesores (Salvatage de Horarios y Suplencias)**:
   - Ante la inasistencia imprevista de una profesora/profesor, otro docente en sede necesita poder buscar a los alumnos por **Profesor**, **Nombre** o **Instrumento**, ver de qué hora a qué hora le toca, en qué sala está y el teléfono del apoderado para salvar la clase y atender a la niña/niño a tiempo.

## Decisiones
1. En `src/routes/admin.invitaciones.tsx`:
   - Agregadas las 3 opciones de invitación con botones visuales y selector que arrastra la data de `adminStudents`.
   - Si el alumno es mayor de 18 años, el sistema selecciona automáticamente "Alumno Adulto"; si es menor de 18, asigna "Apoderado / Familia".
2. En `src/routes/teacher.alumnos.tsx`:
   - Se transformó la vista en un **Directorio Completo de Alumnos y Horarios**.
   - Incluye filtros por profesor (*Todos*, *Jeremy*, *Fernando*, *Nathaly*), buscador por texto, etiquetas de categoría (*Junior, Juvenil, Adulto, Infantil, Recuperación, Personalizada*), horario exacto de la clase (`schedule`) y teléfono de contacto directo.

## Consecuencias
- Nayeli genera enlaces de WhatsApp con un solo clic arrastrando la información correcta de los alumnos.
- Los profesores tienen una herramienta de contingencia para cubrir suplencias de inmediato y evitar que ningún alumno pierda su clase.
