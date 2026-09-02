# ADR 0070: Selector de Alcance por Semana (Solo esta semana vs Todo el mes) y Detección de Clases Existentes en Programación de Horarios

## Estado
Aceptado e Implementado

## Contexto
1. **Queja Operativa de Secretaría (Nayeli):**
   - Al usar el botón **+ Programar Clase** con un alumno ya existente, el horario se replicaba forzosamente en todas las semanas del mes, sin permitir agendar o mover al alumno únicamente para la semana activa (no se registra en una semana específica, se replica en todo el mes y no debería ser así, cada semana es diferente, solo quiero cambiar al niño de día).
   - Adicionalmente, al reprogramar un alumno a un día diferente (por ejemplo, pasarlo de Lunes a Martes), la vista permanecía en la pestaña del día anterior (Lun-Mié) y no se actualizaba automáticamente al día destino (Mar-Jue), dando la impresión visual de que *no aparece el horario agendado*.
2. **Falta de Control de Horarios Existentes:**
   - Si el alumno ya contaba con una clase regular agendada, el modal no mostraba sus clases actuales ni permitía elegir entre **mover/reprogramar** una clase existente o **añadir una sesión adicional**.

## Decisiones Técnicas

### 1. Detección Inteligente de Horarios Actuales (genda-board.tsx)
- Al seleccionar o buscar un alumno en el modal de **+ Programar Clase**, el sistema evalúa reactivamente si el alumno tiene clases vigentes (currentStudentLessons).
- Si ya cuenta con clases agendadas, se despliega un panel donde Nayeli puede:
  1. Seleccionar la clase existente que desea mover a otro día/hora.
  2. O marcar la opción de registrar una sesión adicional sin alterar los días previos.

### 2. Selector de Alcance de Horario (Solo esta semana vs Todo el mes)
- Se incorporó el selector de alcance en el modal isAddLessonOpen y en el panel lateral de inscripción isAddEventOpen:
  - **⚡ Solo esta semana (Semana X de Y):** Configura weekIndex: safeWeekIndex. Al mover una clase existente, invoca escheduleLesson con alcance only-this-week, excluyendo automáticamente el día original solo para la semana activa y ubicando al alumno en el nuevo día.
  - **🗓️ Todo el mes (Las Y semanas):** Actualiza el horario de forma recurrente mensual sin fijar weekIndex.
- Se actualizó la firma y comportamiento de escheduleLesson en src/store/app-store.ts para soportar opcionalmente actualización de docente y sala.

### 3. Navegación y Sincronización Reactiva de Vista Diaria
- Al guardar la clase o reprogramación, el sistema conmuta automáticamente ctivePair (Lun-Mié, Mar-Jue o Vie-Sáb) según el día de la clase agendada, permitiendo a Nayeli verificar al instante en pantalla el horario actualizado.

## Consecuencias
- Nayeli puede cambiar a cualquier alumno de día únicamente para la semana deseada o para todo el mes con 1 clic.
- Cero duplicidad accidental y cero desorientación de vistas.
- 
pm run build verificado exitosamente con 0 errores.
