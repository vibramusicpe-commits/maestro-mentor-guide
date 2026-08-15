# ADR 0013: Renombrado a 'Horario de Clases', Vista Swipe por Día y Registro Directo de Alumnos

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

Tras las pruebas operativas con la Secretaria (Nayeli):
1. El nombre "Agenda" causaba confusión; se prefiere **"Horario de Clases"**.
2. La rejilla semanal completa resultaba abrumadora al organizar grupos de más de 7 niños por clase; se requiere un selector/modo **Swipe Día a Día**.
3. En la sección Alumnos no existía el botón explícito de **Registrar Nuevo Alumno**.

## Decisiones

1. **Renombrado de Navegación**:
   - Cambiada la etiqueta en la barra lateral de `Agenda` a **`Horario de Clases`** (`/admin/agenda`).

2. **Vista Dual (Swipe por Día + Rejilla Semanal)**:
   - Añadido el selector de modo en `AgendaBoard`:
     - **`📱 Vista por Día (Swipe)`** (Activa por defecto): Muestra la lista limpia de clases y alumnos del día seleccionado (*Lunes, Martes, Miércoles...*) con botones de navegación rápida `← Día anterior` y `Siguiente día →`.
     - **`🗓️ Rejilla Semanal`**: Se conserva la panorámica semanal completa para cuando la Dueña o Secretaria deseen ver la semana entera.

3. **Botonera e Formulario de Registro de Alumnos (`NewStudentDialog`)**:
   - Añadido en la vista Alumnos el botón en la cabecera: **`+ Registrar Nuevo Alumno`**.
   - Abre un formulario emergente donde Nayeli registra el nombre del alumno, apoderado, instrumento, profesor asignado, modalidad (*Regular* u *Intensivo*), cumpleaños y teléfono.

## Consecuencias
- La Secretaria puede organizar los grupos de niños día a día sin saturación visual.
- Proceso de matrícula de nuevos estudiantes directo y sin fricciones.
