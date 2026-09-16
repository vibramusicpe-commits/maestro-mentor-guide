# ADR 0097: Corrección de Horarios, UI Scrollable con Sticky Footer en Planificador y Control de Asistencia/Kardex en Ficha de Alumno

## Estado
Aceptado e Implementado en Producción

## Fecha
2026-09-15

## Contexto
Tras la reactivación 1 a 1 de alumnos en `/admin/alumnos`, el equipo de administración detectó cuatro incidencias operativas:
1. **Clase Inexistente los Viernes 19:00 en Camila Pastor (`sch-113`)**:
   - En la agenda aparecía Camila Pastor Conco con 3 clases semanales: Martes 17:30, Jueves 17:30 y Viernes 19:00 (marcada con categoría Juvenil en vez de Junior).
   - Camila está en Plan Regular (2 clases semanales); la clase del viernes provenía de una entrada residual del Excel histórico de Nayeli incorporado en `official-seeds.ts`.
2. **Botón de Aceptar/Guardar Inaccesible en el Modal de Horario (`ScheduleStudentForm`)**:
   - Al intentar reorganizar el horario con el botón `+ Horario`, el modal `DialogContent` no tenía scroll vertical ni altura máxima restringida (`max-h-[...]`). En pantallas de laptops o navegadores con barras de herramientas, el contenido empujaba los botones "Cancelar" y "Guardar Horario Completo" fuera de la pantalla.
3. **Falsos Conflictos de Sala y Cruces de Horario en `ScheduleStudentForm`**:
   - Al abrir el modal, la función `getSlotDetails` evaluaba lecciones de alumnos en estado `pausa` o `baja`, arrojando falsos avisos ("Cruce de Sala: Sala A ya está ocupada por Prof. Jeremy") y bloqueando el botón de guardar.
   - Además, el modal no se pre-poblaba con las clases existentes del alumno (Martes y Jueves 17:30 Sala B), sino que reseteaba los campos a Lunes 16:00 Sala A.
   - Al guardar, `handleSubmit` agregaba lecciones con `addLessonToSchedule` sin limpiar las clases anteriores del alumno, impidiendo corregir o retirar clases erróneas como la del viernes.
4. **Imposibilidad de Regularizar o Editar Asistencia desde "Editar Ficha"**:
   - En el drawer de "Editar Ficha" no existía ningún campo para ajustar el porcentaje de asistencia (`attendanceRate`) ni un acceso directo para abrir el Kardex de sesiones cronológicas, obligando a dar múltiples clics o no pudiendo regularizar el porcentaje inicial acordado para alumnos reactivados.

## Decisiones Técnicas Implementadas

### 1. Purgado Definitivo de `sch-113` en `official-seeds.ts`
- Se eliminó la lección errónea `sch-113` (Viernes 19:00 Sala B) de `officialSchedule`.
- Camila queda registrada exclusivamente en su horario regular oficial: Martes 17:30 y Jueves 17:30 (Sala B con Prof. Fernando).

### 2. Acción Atómica de Reemplazo de Horario (`setStudentSchedule`)
- En `src/store/app-store.ts`, se implementó `setStudentSchedule(studentName, lessons)`:
  - Filtra y purga todas las clases previas de ese alumno en `schedule` usando `isMatchingStudentName`.
  - Agrega atómicamente el nuevo par de clases asignadas.
  - Garantiza que cualquier lección antigua, obsoleta o duplicada se elimine en el mismo guardado.

### 3. Pre-poblado Inteligente y Eliminación de Falsos Cruces en `ScheduleStudentForm`
- **Pre-carga de datos**: Al abrir el modal, detecta las lecciones existentes del alumno en `schedule` y carga automáticamente: `day1`, `time1`, `room1`, `day2`, `time2`, `room2`, `teacher`, `instrument` y `category`.
- **Filtro de colisiones sin falsos positivos**: `getSlotDetails` ignora las lecciones del propio alumno que se está editando y descarta lecciones de alumnos en estado `pausa` o `baja`. Solo alumnos reales y activos compiten por aforo y salas.

### 4. Layout Responsivo con Scroll y Sticky Footer en `DialogContent`
- `DialogContent` ahora cuenta con `max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl`.
- El encabezado es fijo en la parte superior (`shrink-0 border-b`).
- El cuerpo del formulario es scrollable de forma independiente (`px-6 py-4 overflow-y-auto flex-1`).
- Los botones de acción (`Cancelar` y `Guardar Horario Completo`) se sitúan en un pie adhesivo (`p-4 px-6 border-t bg-card/95 backdrop-blur-xs flex justify-end gap-2 shrink-0`).
- **Los botones siempre son visibles y accesibles al 100%** en cualquier resolución.

### 5. Sección de Control de Asistencia y Kardex en "Editar Ficha"
- En `EditStudentSheetInner`, se agregó un módulo interactivo:
  - Input numérico de `% Asistencia` (0 a 100%).
  - Botones rápidos (pills) de 1 clic: `100%`, `90%`, `85%`, `80%`, `75%`.
  - Botón rápido `"⚡ Regularizar 100%"`.
  - Botón de acceso directo `"📅 Ver Fechas en Kardex"` (abre `StudentAttendanceKardex`).
- Persistencia bidireccional en PostgreSQL dentro de `emergency_contact` JSONB (`attendanceRate` y `recentAttendance`), asegurando su retención tras F5.

### 6. Migración de Caché Local a `cadencia-app-v27`
- Se actualizó el storage de Zustand a `cadencia-app-v27`, forzando la recarga limpia del `schedule` depurado sin la lección errónea del viernes.

## Consecuencias y Verificación
- **Horario de Camila 100% Exacto**: En la agenda solo aparecen sus 2 clases regulares (Martes 17:30 y Jueves 17:30 Sala B). El viernes 19:00 quedó totalmente eliminado.
- **Formulario de Horario Siempre Accesible**: La ventana emergente muestra claramente los botones de confirmación sin cortes.
- **Cero Falsos Conflictos**: Al abrir el modal de horario para Camila u otros alumnos, no se bloquea por cruces fantasma con alumnos pausados.
- **Control de Asistencia Ágil**: Secretaría puede regularizar la asistencia al 100% o ajustar el porcentaje acordado directamente desde "Editar Ficha".
- **Compilación Exitosa**: `npm run build` ejecutado sin errores en 1.35s.
