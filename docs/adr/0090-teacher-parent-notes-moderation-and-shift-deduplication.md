# ADR 0090: Filtro de Moderación Administrativa para Notas Docentes y Resolución de Turnos Duplicados en Backend

## Estado
Aceptado (Accepted)

## Fecha
2026-09-14

## Contexto
1. **Incidencia de Control Horario y Asistencia Docente**:
   - Múltiples turnos simultáneos se registraron para el docente Jeremy en la jornada del 14 de Septiembre a las 04:05 p.m.
   - La administración intentó finalizar sesiones y una de ellas no respondía al cierre inmediato desde el panel.
   - **Diagnóstico Quirúrgico**:
     * En PostgreSQL, la columna `total_minutes_worked` en `teacher_time_logs` es una columna calculada `GENERATED ALWAYS AS (...) STORED`.
     * Las funciones `clockIn`, `getActiveShift` y `getAllActiveShifts` intentaban enviar `total_minutes_worked: 240` al auto-cerrar turnos viejos (>14h).
     * PostgreSQL rechazaba la consulta con el error nativo `428C9` (*column "total_minutes_worked" can only be updated to DEFAULT*).
     * El bloque `.catch(() => {})` silenciaba el error, manteniendo el turno zombie del 12 de Septiembre permanentemente en estado `trabajando`.
     * Al no ordenar por `clock_in.desc`, `postgrestSelect` obtenía siempre el registro antiguo del 12 de Septiembre, asumía falsamente que no había turno hoy y creaba duplicados en cada click.
     * En `clockOut`, al finalizar el turno desde el navegador de un administrador, la caché local no contenía los metadatos GPS del profesor, sobreescribiendo el campo `origin_device` y borrando las coordenadas geográficas de entrada.

2. **Requerimiento Pedagógico de Notas para Familias**:
   - En el plan de la escuela, los profesores pueden redactar notas pedagógicas individuales o comunicados para las familias.
   - **Regla Estricta**: Ninguna nota redactada por un profesor puede enviarse a los padres ni publicarse en el Portal de Familia sin pasar previamente por el filtro y aprobación de la administración (Dueña, Secretaría o Staff).

## Decisiones Técnicas

### 1. Blindaje del Motor de Control Horario (`time-tracking.service.ts` e `insforge.ts`)
- **Remoción de `total_minutes_worked`**: Todas las sentencias `postgrestPatch` delegan el cálculo del tiempo trabajado al motor nativo de PostgreSQL mediante `clock_out` y `clock_in`.
- **Ordenamiento Estricto por `clock_in.desc`**: Garantiza que tanto `clockIn` como `getActiveShift` consulten siempre el registro más reciente del profesor.
- **Prevención de Duplicados en `clockIn`**: Si un profesor ya tiene un turno abierto con antigüedad menor a 14 horas, la función retorna dicho turno en vez de insertar uno nuevo.
- **Preservación de Metadatos GPS**: `clockOut` consulta previamente la base de datos en PostgreSQL para recuperar los metadatos de geolocalización de entrada (`in: { lat, lng, ... }`) antes de concatenar los de salida (`out`), impidiendo la pérdida de auditoría GPS.
- **Resiliencia ante Respuestas HTTP 204**: Se optimizó `postgrestPatch` en `src/lib/insforge.ts` para tolerar respuestas 204 No Content sin generar errores `undefined`.
- **Limpieza de Turnos Zombies**: Se finalizaron en PostgreSQL los 3 turnos residuales del 12 de Septiembre (Jeremy, Fabricio y Karla) restableciendo el conteo exacto de 1 profesor por turno.

### 2. Flujo Completo de Moderación de Notas a Padres (`teacher-notes.service.ts`)
- **Estado de las Notas**:
  - `pendiente`: Nota redactada por el docente enviada a revisión.
  - `aprobado`: Nota evaluada y autorizada por la administración; publicada en `students.notes` y visible en el Portal de Familia (`/family`).
  - `rechazado`: Nota devuelta al docente con motivo/observaciones; no visible para los padres.
- **Persistencia en PostgreSQL**:
  - Las solicitudes se almacenan en `notification_logs` con `channel: 'in_app'`, `status: 'pendiente'`, y los metadatos del alumno, familia y docente en `error_msg` estructurado.
  - Al aprobarse, el estado en `notification_logs` se actualiza a `'enviado'`, y se sincroniza en la columna `notes` de la tabla `students` en PostgreSQL.
- **Interfaz del Docente (`lesson-notes.tsx`)**:
  - El botón de guardado directo se reemplazó por **"Enviar a Revisión de Administración"**.
  - Si la nota está pendiente o rechazada, el botón de WhatsApp a los padres se encuentra **bloqueado**.
  - Se visualizan badges de estado en vivo (`⏳ En Revisión`, `✅ Aprobada`, `❌ Observada`) junto con una bitácora histórica de notas enviadas.
- **Panel Administrativo de Moderación (`teacher-notes-moderation.tsx` y `/admin/alumnos`)**:
  - Pestaña **"Notas a Familias"** en el encabezado de `/admin/alumnos` con badge numérico en tiempo real de notas pendientes.
  - Acciones administrativas:
    - **Aprobar Nota**: Guarda en la ficha del alumno, publica en el Portal de Familia y genera el enlace oficial formateado de WhatsApp.
    - **Desaprobar**: Permite ingresar el motivo del rechazo para orientar al profesor en su corrección.
    - **Editar y Aprobar**: Permite ajustar ortografía o redacción antes de dar el visto bueno institucional.
- **Portal de Familia (`kid-summary.tsx`)**:
  - Los padres visualizan exclusivamente notas con estado `aprobado`.

## Consecuencias
- 0 turnos duplicados y 0 inconsistencias de cálculo de horas en PostgreSQL.
- Auditoría GPS 100% preservada tanto en entradas como salidas gestionadas desde el panel administrativo.
- Control de calidad institucional garantizado en todas las comunicaciones dirigidas a los padres de familia.
