# ADR 0008: Agenda Minimalista de Clases en Solo Lectura para Profesores y Familias

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

A diferencia de la Secretaría y la Dueña (quienes gestionan cupos, salas, reprogramaciones masivas y conflictos en `/admin/agenda`), los **Profesores** y **Apoderados/Familias** requieren una vista de **Agenda Minimalista y Móvil**.

Se identificó que dar permisos de edición a profesores o familias en la agenda genera desorganización de cupos y cruces de salas.

## Decisión

1. **Componente Central (`MinimalAgendaCalendar`)**:
   - Selector de días semanal horizontal (Lun - Sáb) con contador de clases.
   - Tarjetas de clase con hora, materia, nombre de alumno/profesor, sala y badge de estado (Pendiente, Presente, Ausente).
   - **Solo Lectura Estricto**: Sin acciones de edición o reprogramación directa.
   - Enlace directo a WhatsApp de la Secretaría (`https://wa.me/51970608367`) para solicitar cualquier reprogramación o justificación.

2. **Integración en Roles**:
   - **Profesor**: Nueva pestaña en la barra de navegación del Kiosco (`/teacher/agenda`) mostrando la agenda completa semanal del profesor.
   - **Familia**: Integración dentro de la tarjeta de resumen del alumno (`/family`), mostrando el calendario semanal de clases correspondiente a su hijo.

## Consecuencias
- UI limpia, enfocada y fácil de leer desde teléfonos móviles.
- Garantía de que la secretaría mantiene el control central de la agenda y las salas de clase.
