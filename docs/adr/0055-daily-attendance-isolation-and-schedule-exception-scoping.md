# ADR 0055: Aislamiento Diario y Semanal de Asistencia, Manejo de Excepciones en Reprogramación y Timbre de Clases Resiliente

## Estado
Aceptado / Desplegado en Producción (Cloudflare Pages)

## Contexto y Puntos de Dolor
1. **Asistencia Replicada en Todas las Semanas:** Al marcar asistencia de un alumno (ej: Presente en Martes de la Semana 2), el estado se guardaba en el objeto global de la plantilla de la clase (`l.attendanceStatus`), provocando que apareciera como "Presente" en la Semana 1, Semana 3 y Semana 4 del mes.
2. **Reprogramación Mutaba el Mes Completo:** Cuando secretaría reprogramaba a un alumno seleccionando "Solo esta semana", el slot original quedaba modificado con `weekIndex: 1`, haciendo que desapareciera de las Semanas 1, 3 y 4 en el horario base.
3. **Falla en el Timbre de Cambio de Clase:** El reproductor de audio fallaba por políticas de autoplay del navegador al intentar cargar archivos con espacios no codificados (`/school bell.mp3`) y carecía de fallback inmediato con Web Audio API.

## Decisiones Arquitectónicas y de Implementación

### 1. Aislamiento Semanal y Diario de Asistencias (`attendanceByWeek`)
- En `ScheduledLesson`, se introdujo `attendanceByWeek: Record<number, AttendanceStatus>`.
- `markLessonAttendance` ahora recibe `targetWeekIndex` y guarda la asistencia específicamente para esa semana.
- La vista de la Agenda y el Sheet lateral leen el estado correspondiente a `currentWeekIndex`. Si se marca en la Semana 2, las Semanas 1, 3 y 4 permanecen limpias en espera de su clase real.

### 2. Manejo de Excepciones en Reprogramaciones Puntuarias
- Cuando se reprograma con alcance `"only-this-week"`:
  * El slot recurrente base agrega la semana actual a `excludedWeeks: [targetWeekIndex]`, preservando su visibilidad en el resto del mes.
  * Se genera una instancia puntual exclusiva para `(moveDay, moveTime, weekIndex: targetWeekIndex)`.
- Si se elige `"all"` (Todo el mes), se actualiza la matriz central completa.

### 3. Timbre Acústico Oficial Resiliente con Web Audio API
- Se implementó `playSyntheticBellChime` en `src/store/app-store.ts` con osciladores de doble armónico (Do6 1046.5Hz + Mi6 1318.5Hz + Sol6 1567.98Hz y segundo repique con C7 2093Hz) y `ctx.resume()`.
- Se generó el archivo seguro `public/school-bell.mp3` y se conectó con fallback automático en caso de bloqueo de autoplay.

## Consecuencias y Beneficios
- **Cero Confusiones para Secretaría:** Nayeli puede marcar asistencias día a día sin temor a sobreescribir el resto del mes.
- **Reprogramaciones Seguras:** Mover a un alumno por una semana específica no altera sus clases normales de las demás semanas.
- **Timbre 100% Confiable:** Emisión sonora garantizada tanto en el botón manual como en el reloj automático.
