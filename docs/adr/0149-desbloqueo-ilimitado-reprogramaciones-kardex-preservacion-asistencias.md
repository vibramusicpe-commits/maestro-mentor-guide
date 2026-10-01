# ADR-0149: Desbloqueo Ilimitado de Reprogramaciones en Kardex y Preservación Integral de Asistencias y Makeups

## Estado
Aprobado e Implementado

## Fecha
2026-10-01

## Contexto
En casos de alumnos con múltiples inasistencias (como Micaela Vilchez Oroncoy, con 1 asistencia y 8 faltas registradas en su ciclo regular), al intentar reprogramar clases de recuperación más de 2 veces, el sistema notificaba que la reprogramación se había efectuado con éxito y se persistía en PostgreSQL, pero las nuevas sesiones no se visualizaban en la vista del Kardex de Asistencias (`StudentAttendanceKardex`) ni en los cálculos de ciclo (`kardex-calculator.ts`).

### Causa Raíz
1. **Truncamiento Rígido a Cuota Contractual (`combined.slice(0, targetQuota)`)**:
   Tanto en `computeStudentCycleSessions` (`src/lib/kardex-calculator.ts`) como en `allCycleSessions` (`src/components/admin/student-attendance-kardex.tsx`), al superar `targetQuota = 8`, el arreglo combinado de sesiones ejecutaba `combined.slice(0, targetQuota)`. Al tener 1 asistencia + 5 faltas + 2 recuperaciones evaluadas (8 sesiones), todas las sesiones posteriores (meses de Agosto y Setiembre) eran cortadas tajantemente en el índice 8, imposibilitando ver la 3ra, 4ta o 5ta reprogramación.
2. **Ventana de Escaneo Estática (`maxDaysToScan`)**:
   La ventana de proyección calculaba `maxDaysToScan` acotada a `planEndDate` (+90 días desde inicio). Clases reprogramadas en meses posteriores (ej. Setiembre u Octubre) no eran alcanzadas por el bucle de generación cronológica.
3. **Ambigüedad en el Diálogo de Reprogramación**:
   El diálogo inicializaba la fecha `reschedDate` con la fecha de la falta original en el pasado (`session.dateStr`), lo que provocaba que si el usuario no cambiaba explícitamente el campo de fecha, la clase se guardaba en el pasado o colisionaba en deduplicación por franja horaria (`dateStr-time`).
4. **Falta de Fallback en `rescheduleLesson`**:
   `rescheduleLesson` en `app-store.ts` buscaba la lección objetivo únicamente en `s.schedule`, fallando silenciosamente si la lección residía en `targetSt.scheduleLessons`.

## Decisión
1. **Preservación Incondicional de Evaluadas y Makeups**:
   - Todas las sesiones evaluadas (`status !== "pendiente"`) se preservan de manera inmutable como hechos históricos.
   - Todas las sesiones de recuperación (`isMakeup: true`), tanto evaluadas como pendientes, se preservan incondicionalmente, cumpliendo el principio fundacional: *"Las clases no se pierden, se recuperan"*.
   - Solo se acotan las sesiones regulares pendientes (`status === "pendiente" && !isMakeup`) necesarias para completar la cuota contractual: `regularSlotsNeeded = Math.max(0, targetQuota - (attendedCount + pendingMakeups.length))`.
2. **Ventana Dinámica de Proyección (`maxLessonDays`)**:
   `maxDaysToScan` calcula la fecha más lejana entre todas las lecciones del alumno (`lesson.dateStr`), asegurando que cualquier clase reprogramada a futuro (a 90, 120 o 180 días) sea alcanzada e incorporada en la proyección.
3. **Proyección Proactiva hacia el Futuro (`getTargetDateInFuture`)**:
   Al abrir el diálogo de reprogramación, `reschedDate` se calcula hacia el futuro (`getTargetDateInFuture`), garantizando que la fecha sugerida sea posterior a la falta y sincronizada bidireccionalmente con el día de semana seleccionado (`reschedDay`).
4. **Distintivo Visual de Recuperación Enlazada en Kardex**:
   En la fila de cada falta (`ausente`), se añade un badge informativo que enlaza directamente con su clase de recuperación agendada (`🔄 Recup.: [Día] [Hora] ([Estado: ✓ Asistió | ⏳ Pendiente])`), otorgando total transparencia a secretaría y dirección.
5. **Fallback y Deduplicación Preventiva en `rescheduleLesson`**:
   `rescheduleLesson` busca la lección en `s.schedule` y en `adminStudents[...].scheduleLessons`. Además, si se reprograma nuevamente una inasistencia que tenía un makeup previo sin evaluar, reemplaza la sesión previa evitando duplicados fantasma.

## Consecuencias
- Un alumno puede reprogramar tantas clases como inasistencias tenga justificadas/permitidas sin ningún tope artificial.
- En la vista por mes calendario ("Por Mes") y en "Ciclo Activo", todas las clases de meses posteriores (Agosto, Setiembre, Octubre) se reflejan de inmediato al recargar y en tiempo real.
- Base de datos en PostgreSQL limpia y sincronizada.
