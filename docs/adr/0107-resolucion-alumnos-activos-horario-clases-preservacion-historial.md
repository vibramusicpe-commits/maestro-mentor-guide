# ADR 0107: Resolución Prioritaria de Alumnos Activos y Preservación de Historial en Horario de Clases

## Estado
Aprobado (v2.0.1) — 18 de Septiembre, 2026

## Contexto
1. **Ocultamiento Involuntario de Alumnos Activos en el Horario de Clases (`AgendaBoard`)**:
   - Al probar el flujo de borrado y nueva alta 1 a 1 de alumnos (caso Emma Micaela Sevilla Perez), el registro eliminado permanecía en PostgreSQL con `status = 'baja'` y el nuevo registro se guardaba con un nuevo UUID y `status = 'activo'`.
   - Al rehidratar desde la base de datos (`hydrateFromBackend`), se preservaban ambos registros. Como los registros antiguos en `baja` se crearon previamente, se situaban antes en el array `mergedStudents`.
   - Cuando el filtro del Horario de Clases (`agenda-board.tsx`) ejecutaba:
     ```ts
     const studentProfile = adminStudents.find((st) => isMatchingStudentName(st.name, l.student));
     if (!studentProfile || studentProfile.status !== "activo") return false;
     ```
     el método `.find` devolvía el registro antiguo en `baja`, concluyendo erróneamente que la alumna no estaba activa y descartando todas sus clases del cronograma.
   - Por el contrario, para alumnos con un solo registro como Camila Pastor Conco, `.find` encontraba inmediatamente el perfil activo, por lo que sus clases sí se mostraban.
2. **Preservación del Historial de Clases Culminadas**:
   - El hecho de que un alumno activo complete el 100% de las clases de su plan (ej. 8 de 8 sesiones) jamás debe provocar que sus clases desaparezcan del Horario de Clases en las semanas en que asistió. El historial pedagógico debe ser accesible en cada semana lectiva.
3. **Paridad de Asistencias Basada en Fechas Exactas**:
   - Las marcas de asistencia de cada celda en el Horario de Clases dependían únicamente del índice de semana (`attendanceByWeek[safeWeekIndex]`), sin consultar `attendanceByDate[dateStr]`, lo que podía producir discrepancias con los logs persistidos en PostgreSQL.

## Decisiones Técnicas
1. **Función de Búsqueda con Prioridad Activa (`findStudentProfileByName` en `src/lib/student-matching.ts`)**:
   - Implementada función genérica que busca primero alumnos con `status === "activo"`. Si no existe ninguno activo, recurre a estados secundarios (`pausa`, `baja`).
   - Reemplazados todos los `.find` en `AgendaBoard`, `VacancyAvailabilityPanel`, `MinimalAgendaCalendar` y en el portal de profesores (`teacher.agenda.tsx`, `teacher.alumnos.tsx`, `teacher.index.tsx`).
2. **Deduplicación e Inmunidad a Sombras Inactivas (`hydrateFromBackend` en `src/store/app-store.ts`)**:
   - Si un registro con `status === "activo"` ingresa desde PostgreSQL, reemplaza cualquier registro previo inactivo con el mismo nombre.
   - Un registro inactivo (`baja` o `pausa`) jamás degrada a un alumno activo.
   - Se depuran de `cleanStudents` homónimos inactivos si existe una versión activa del alumno.
   - Los alumnos activos se ordenan siempre al inicio de `adminStudents`.
3. **Soporte de Exclusión y Fecha Puntual en Celdas de Horario**:
   - `visible` en `AgendaBoard` valida `l.excludedDates?.includes(lessonDayInfo.dateStr)` para no proyectar clases canceladas o reprogramadas de esa fecha.
   - Las clases con `l.dateStr` solo se visualizan cuando `l.dateStr === lessonDayInfo.dateStr`.
4. **Lectura Directa de Asistencias por Fecha en el Horario**:
   - El badge de asistencia en las tarjetas de clase evalúa `lesson.attendanceByDate?.[dayInfo.dateStr]` antes del fallback semanal, reflejando el estado real persistido en `attendance_logs` de PostgreSQL.

## Consecuencias
- Alumnos re-matriculados o reactivados 1 a 1 reflejan sus horarios de inmediato sin ser ensombrecidos por registros antiguos.
- Las clases culminadas y asistidas se mantienen perfectamente legibles e identificables en el Horario de Clases.
- Total paridad operativa entre el Horario de Clases, el Kardex y la base de datos PostgreSQL.
