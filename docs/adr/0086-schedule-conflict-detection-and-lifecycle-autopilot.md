# ADR 0086: Detección Reactiva de Conflictos de Horario (1 o 2 Días), Recomendación de Vacantes en 1 Clic y Prueba Fehaciente del Ciclo Completo del Alumno en el Tour Autopiloto

## Estado
Aceptado e Implementado

## Contexto
En el flujo operativo diario de Vibra Music Staff, la secretaria académica (Nayeli) y el equipo de dirección gestionan la programación de horarios de alumnos regulares e intensivos. 
Históricamente, la validación del aforo pedagógico máximo (estrictamente 5 alumnos por profesor en sala) se ejecutaba al enviar el formulario (`handleSubmit`), generando frustración si el horario seleccionado ya estaba saturado o generaba cruce de sala, sin ofrecer alternativas inmediatas.
Asimismo, existía la necesidad de que el **Tour Autopiloto en Vivo** no fuera meramente explicativo o simulado, sino que ejecutara una **prueba fehaciente en tiempo real**: creando realmente a la alumna (**Luciana Mendoza Gómez**), configurando su horario resolviendo un conflicto en vivo, y posteriormente demostrando la eliminación con auditoría obligatoria y su restauración íntegra desde la Papelera.

## Decisiones Técnicas

### 1. Motor Reactivo de Diagnóstico de Conflictos (`ScheduleStudentForm`)
- Se implementó un evaluador de estados con `useMemo` que analiza en tiempo real la **Sesión 1** (`day1`, `time1`, `room1`) y, si aplica para planes regulares de 2 clases semanales, la **Sesión 2** (`day2`, `time2`, `room2`).
- **Discriminación de Conflictos (1 Día vs 2 Días)**:
  - El sistema cuenta cuántos días presentan problemas (`conflictingDaysCount`).
  - Muestra un banner visual prominente que desglosa puntualmente:
    - Si es **1 día**: `⚠️ Tu horario tiene conflicto en 1 día:` especificando día, hora, sala y motivo.
    - Si son **2 días**: `⚠️ Tu horario tiene conflictos en 2 días:` listando individualmente la Sesión 1 y la Sesión 2.
  - Motivos evaluados:
    - Aforo saturado: `Aforo completo (5/5 cupos ocupados) con Prof. {Docente}`.
    - Cruce de sala: `Cruce de Sala: {Sala} ya está ocupada por Prof. {Docente}`.
  - Deshabilita el botón de guardado mientras persista cualquier conflicto.

### 2. Algoritmo de Sugerencia de Franjas Disponibles con Corrección en 1 Clic
- Se agregó el calculador `suggestedSlots` que busca en la agenda del profesor las franjas horarias con vacantes libres (`vacancies > 0` y sin cruces).
- Presenta chips interactivos con el distintivo `data-tour="schedule-suggestion-chip"`.
- Al hacer clic en un chip sugerido (ej. `Lun + Mié a las 16:45 (1 vacante libre)`):
  - Actualiza automáticamente `time1` y `time2` a la hora libre.
  - El estado del conflicto pasa a `false`, transformando la alerta en un badge verde de confirmación (`✓ Horario Disponible sin Conflictos`).
  - Habilita de inmediato el guardado.

### 3. Indicadores de Ocupación en los Selectores de Hora
- Cada `<SelectItem>` del desplegable de horas renderiza un indicador visual:
  - `🔴 Lleno (5/5)` cuando la franja está saturada.
  - `🟢 {X} vac.` cuando existen cupos disponibles.

### 4. Prueba Fehaciente en el Tour Autopiloto en Vivo (`autopilot-tour-overlay.tsx`)
- **Paso 1 (Creación Real)**: Escribe los datos completos de **Luciana Mendoza Gómez**, apoderados (*Carlos Mendoza*, *Rosa Huamán*) y contacto de emergencia (*Elena Gómez (Abuela)*), y pulsa el botón real `Guardar Matrícula` (`data-tour="btn-submit-new-student"`). Luciana ingresa en la posición 0 del store de alumnos activos.
- **Paso 2 (Horario y Resolución en Vivo)**: Abre `+ Horario` en la fila de Luciana. El horario por defecto (Lun y Mié 16:00 con Prof. Jeremy) gatilla el cartel de conflicto de 2 días. El cursor enfoca la alerta, se desplaza al chip sugerido (`16:45`), lo presiona para disolver el conflicto y guarda el horario oficial.
- **Paso 3 y 4 (Agenda y Kardex)**: Inspección de cupos semanales y justificación por WhatsApp abonando +1 crédito de recuperación.
- **Paso 5 (Eliminación Auditada y Restauración en Papelera)**:
  - El cursor pulsa el botón eliminar (`data-tour="btn-row-delete"`) en la fila de Luciana.
  - El modal de confirmación solicita motivo obligatorio y el cursor pulsa `Confirmar y Mover a Papelera` (`data-tour="btn-confirm-delete-student"`).
  - Luciana sale de la lista activa y se archiva en la Papelera.
  - El cursor abre la Papelera (`data-tour="btn-trash"`), navega a **Leads de Reincorporación** (`data-tour="trash-tab-reincorp"`), enfoca los filtros de auditoría y pulsa **Restaurar Alumno** (`data-tour="trash-btn-restore"`).
  - Luciana regresa de inmediato al Directorio Activo, cerrando la Papelera con éxito.

## Consecuencias y Beneficios
1. **Confianza Total del Usuario**: La demostración es 100% tangible sobre la base de datos y la interfaz real; no existen mocks ni animaciones engañosas.
2. **Cero Cruces en Salas**: Imposibilita el sobreaforo o la superposición de docentes en una misma sala.
3. **Agilidad Administrativa**: La secretaria no necesita memorizar vacantes; el sistema las recomienda y aplica en un solo toque.
4. **Seguridad y Reversibilidad de Datos**: Toda baja de alumno queda auditada con motivo formal y puede ser restaurada en cualquier momento con un clic.
