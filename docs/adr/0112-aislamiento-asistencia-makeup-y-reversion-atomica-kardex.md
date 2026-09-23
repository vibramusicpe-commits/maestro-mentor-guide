# ADR-0112: Aislamiento de Asistencia en Clases Makeup y Reversión Atómica en Kardex

## Estado
Aceptado e Implementado

## Fecha
2026-09-23

## Contexto y Problema
En Vibra Music Staff, el ciclo de vida de una clase reprogramada (makeup) es un proceso crítico:
1. Una inasistencia genera un crédito de recuperación.
2. La secretaría o administración reprograma la sesión asignando fecha exacta (`dateStr`), hora, docente y sala (`isMakeup: true`, `recoveringLessonDate: "YYYY-MM-DD"`), excluyendo la fecha original en la lección semanal (`excludedDates: ["YYYY-MM-DD"]`).
3. Se reportaron 3 bugs pre-existentes:
   - **Bug 1 (Arrastre de Asistencia)**: Al registrar asistencia en una clase regular (ej. Lunes 16:45), la clase de recuperación del mismo día (ej. Lunes 17:30) heredaba el mismo estado automáticamente debido a que los logs de asistencia en PostgreSQL y `hydrateFromBackend` sobreescribían todas las lecciones del alumno para esa fecha.
   - **Bug 2 (Botón X no persistente)**: `deleteLessonFromSchedule` solo filtraba en memoria `s.schedule`, sin actualizar `adminStudents.scheduleLessons` ni persistir en PostgreSQL (`backgroundSyncStudentToDB`). Al recargar la página, la clase makeup volvía a aparecer.
   - **Bug 3 (Botón X no restauraba `excludedDates` ni devolvía crédito)**: El botón X ejecutaba mutaciones inline frágiles con `useAppStore.setState` sin persistir a PostgreSQL y sin devolver el crédito de recuperación consumido.

Un intento previo (commit `3aaee2c`) intentó separar la lectura en `allCycleSessions` del Kardex usando semanas relativas al mes, lo que causó una regresión crítica reabriendo ciclos completados (como el de Emma Sevilla) con clases fantasma hasta noviembre. Dicho commit fue revertido en `a124bc5`.

## Decisiones Técnicas Adoptadas

### 1. Invariante Innegociable: `allCycleSessions` Intacta
- La lógica de cálculo y lectura de estado en `allCycleSessions` (`student-attendance-kardex.tsx`) **PERMANECE 100% INTACTA**.
- No se introducen lecturas por índices relativos ni modificaciones al filtrado de cuotas completadas.

### 2. Aislamiento Quirúrgico en Escritura y Rehidratación
- En `setStudentSessionAttendance` y `bulkRegularizeStudentAttendance`, la nota enviada a `backgroundSyncAttendanceLogToDB` se enriquece con metadatos exactos de la lección:
  `Fecha ${dateStr} [hora:${time}] [lesson:${lessonId}] - Regularización Kardex`
- En `backgroundSyncAttendanceLogToDB`, la eliminación previa de logs se acota al identificador específico de la lección (`like.*lesson:${lessonId}*`), impidiendo la eliminación colateral de otras sesiones del mismo día.
- En `hydrateFromBackend`, al rehidratar `attendance_logs` hacia `scheduleMap` y `adminStudents.scheduleLessons`:
  - Si el log contiene `[lesson:id]` o `[hora:HH:mm]`, solo se aplica a la lección que coincida.
  - Si es un log legacy (sin tags) y el alumno tiene múltiples lecciones en esa fecha, se protege explícitamente a las lecciones `isMakeup` para evitar que hereden el estado de la clase regular.

### 3. Acción Atómica en Zustand: `revertMakeupLesson`
- Se incorpora en `AppState`:
  `revertMakeupLesson: (makeupId: string, recoveringLessonDate?: string) => void;`
- Ejecuta en una sola transacción atómica:
  1. Filtrado de `makeupId` en `schedule` y `adminStudents.scheduleLessons`.
  2. Eliminación de `recoveringLessonDate` del array `excludedDates` de la lección regular original.
  3. Restauración de +1 crédito de recuperación (`(st.makeupCredits || 0) + 1`).
  4. Sincronización inmediata a PostgreSQL vía `backgroundSyncStudentToDB(role, studentId, { scheduleLessons, makeupCredits })`.
  5. Difusión en tiempo real con `triggerDataSyncBroadcast("lesson-removed")`.

### 4. Persistencia en `deleteLessonFromSchedule`
- Se actualizó `deleteLessonFromSchedule` para que además de filtrar `s.schedule`, actualice `adminStudents.scheduleLessons` del alumno y despache `backgroundSyncStudentToDB`.

## Consecuencias y Beneficios
- **Cero Arrastre**: Alumnos con doble sesión en el mismo día (regular + recuperación) mantienen estados de asistencia completamente aislados e independientes.
- **Reversión Perfecta**: Al hacer clic en el botón X en el Kardex, la sesión de recuperación se elimina en pantalla y en PostgreSQL, la clase original se restaura en el calendario y el crédito se devuelve para una nueva reprogramación.
- **Historial Protegido**: Alumnos con ciclo culminado (ej. Emma Sevilla) conservan su cuota de 8 clases exacta sin reaperturas fantasma.
