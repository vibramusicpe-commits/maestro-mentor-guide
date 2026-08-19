# ADR 0053: Rediseño del Kiosco y Agenda Móvil de Profesores con Agrupación Cronológica y Sincronización en Tiempo Real

## Estado
Aceptado / Desplegado en Producción (Cloudflare Pages)

## Contexto y Puntos de Dolor
En las pruebas operativas en sede de Vibra Music con la Secretaría (Nayeli) y los docentes (Jeremy, Fernando, Nathaly):
1. **Desorden Horario en Móvil:** La lista de clases de los profesores en `/teacher` se renderizaba de forma desordenada (ej. `18:15` aparecía antes de `19:00`, `16:00` y `16:45`), lo que impedía a los docentes saber con claridad a qué hora les correspondía cada alumno.
2. **Agenda Semanal Desconectada:** En `/teacher/agenda` (Mi Horario Semanal), la vista consumía un array antiguo de prueba (`s.lessons`) con un filtro fijo que solo renderizaba martes y jueves, mostrando "0 clases" en lunes, miércoles, viernes y sábado a pesar de tener alumnos asignados.
3. **Falta de Selector de Días Móvil:** Los docentes no contaban con pestañas de días (Lunes a Sábado) para alternar rápidamente entre sus jornadas desde el celular.

## Decisiones Arquitectónicas y de Diseño

### 1. Ordenamiento Cronológico Estricto y Bloques Horarios
- Las clases del profesor se ordenan de forma ascendente por hora de inicio: `16:00` → `16:45` → `17:30` → `18:15` → `19:00` → `19:45`.
- Se agrupan visualmente por Bloque Horario (`🕒 16:00 - 16:45 · Sala A · 2 alumnos`). Dentro de cada bloque se listan los alumnos correspondientes a ese horario exacto.

### 2. Barra de Días Móvil (Lun..Sáb) con Conteo en Vivo
- Se implementó un selector superior de días tipo tabs (`Lun`, `Mar`, `Mié`, `Jue`, `Vie`, `Sáb`) con conteo reactivo de alumnos por día.
- Preselecciona de forma automática el día de la semana actual.

### 3. Conexión Directa al Horario Central (`schedule`)
- Ambas rutas (`/teacher` y `/teacher/agenda`) se conectaron directamente a `s.schedule`, compartiendo la misma fuente de verdad con la Agenda de Secretaría (`/admin/agenda`).
- Se actualizó el componente `MinimalAgendaCalendar` para procesar dinámicamente los 6 días de la semana y ordenar cronológicamente.

### 4. Marcado de Asistencia en 1 Toque y Sincronización Multi-Portal
- Cada alumno en la vista del profesor cuenta con 4 botones rápidos de asistencia (`🟢 Pres.`, `🔴 Aus.`, `🟡 Tar.`, `🔵 Just.`).
- Al presionar un botón, se invoca `markLessonAttendance(id, status)` en el store central, reflejándose inmediatamente en la pantalla de Nayeli (Secretaría) en la recepción con el indicador de color en la cuadrícula.

## Consecuencias y Beneficios
- **Claridad Total para Docentes:** Los profesores pueden consultar su flujo de alumnos en orden cronológico en menos de 2 segundos desde su celular.
- **Cero Fricción en Recepción:** Secretaría visualiza el estado de asistencia de cada sala en tiempo real sin necesidad de llamadas o mensajes manuales.
- **Trazabilidad:** Toda asistencia marcada actualiza los créditos de recuperación y la libreta del plan del alumno de forma automática.
