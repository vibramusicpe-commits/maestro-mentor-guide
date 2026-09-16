# ADR 0100: Separación de Base Histórica vs Base Activa 2026, Ojito de Consulta Histórica, Horario en Blanco y Corrección de Fechas en Kardex

## Estado
Aprobado (v1.8.9) — 16 de Septiembre, 2026

## Contexto
1. **Doble Base de Datos (Histórica de Consulta vs. Activa 2026)**:
   - La escuela requería una separación estricta e inmutable entre la "Base Histórica Inicial Vibra Music" (corte al 15/08/2026 con 83 alumnos para auditoría, consulta y referencia permanente) y la "Base Activa 2026" (alumnos confirmados y depurados).
   - Secretaría necesitaba exportar independientemente ambas bases a formato Excel/CSV con nombres claros y metadatos explícitos.
2. **Soporte Visual y Cognitivo para Secretaría ("Ojito" 👁️ de Consulta)**:
   - Para evitar confusiones y pérdida de contexto en secretaría durante la reactivación 1 a 1 en el panel de depuración, era imprescindible poder inspeccionar la ficha histórica del alumno (contacto, apoderado, instrumento, profesor anterior, modalidad, notas) con un solo clic en un "ojito" (`👁️`) sin modificar la base histórica original.
3. **Activación con Horario Limpio (0 Clases Programadas)**:
   - Al pasar a un alumno de "Pausa" a "Activo", el sistema tendía a resucitar lecciones heredadas de los seeds originales en el horario. La regla de negocio exige que cada alumno reactivado empiece con su horario completamente en blanco (`schedule: []`), obligando a que secretaría configure los días, salas y profesores de forma 100% manual y consciente mediante el botón `+ Horario`.
4. **Nueva Modalidad: Regular 1x/semana (8 clases en 2 meses)**:
   - Se requería dar soporte a alumnos que asisten una sola vez por semana en sesiones de 45 minutos (un paquete de 8 clases distribuido a lo largo de 2 meses o periodos lectivos), complementando a la modalidad Regular clásica (2x/semana, 1 mes) e Intensivo (fines de semana, 4 clases de 90 min).
5. **Corrección de Fechas en Kardex (Camila Pastor Conco)**:
   - Camila inició clases el 10/09/2026, pero el Kardex le seguía programando sesiones el 1, 3 y 8 de septiembre debido a que la semilla de control de pagos arrastraba `planStartDate: "2026-08-01"`.
6. **Desfase en "Ver Ficha" y Sobreescritura Mock en "Editar Ficha"**:
   - En el drawer de solo lectura "Ver Ficha", las pastillas de asistencia mostraban 3 valores fijos desfasados del Kardex y contenía un botón de regularización de fechas que debía pertenecer exclusivamente al modo edición.
   - En `EditStudentDialog`, al guardar la ficha, el código sobreescribía `recentAttendance` forzando `["presente", "presente", "presente"]` si `attendanceRate >= 85`, destruyendo las asistencias reales marcadas en el Kardex.

## Decisiones Técnicas
1. **Aislamiento de Bases y Exportación Independiente (`admin-seeds.ts` y `student-cleanup-panel.tsx`)**:
   - Se definió `HISTORICAL_BASE_METADATA` con 83 alumnos al 15/08/2026 y se desacopló `historicalStudents` en el store.
   - Se implementaron botones independientes en el encabezado del panel de depuración:
     - `Descargar Base Histórica (Excel/CSV)` -> `Base_Historica_Vibra_Music_2026-08-15.csv`.
     - `Descargar Base Activa 2026 (Excel/CSV)` -> `Base_Activa_Vibra_Music_2026.csv`.
     Ambos con prefijo UTF-8 BOM para apertura directa en Microsoft Excel.
2. **Modal "Ver Ficha Antigua" con Icono de Ojito (`👁️`)**:
   - En la pestaña "Activar 1 a 1", cada alumno encontrado en la base histórica incluye un botón `👁️ Ver Ficha Antigua`.
   - Al pulsarlo, se despliega un diálogo emergente con el perfil histórico completo (nombre, apoderado, parentesco, teléfono, instrumento, nivel, profesor anterior, modalidad, fecha de registro y notas).
3. **Purgado Forzoso de Horario al Activar**:
   - En `setStudentStatus` (`app-store.ts`) y `handleConfirmActivate` (`student-cleanup-panel.tsx`), cuando un alumno pasa a estado `"activo"`, se eliminan todas sus lecciones residuales en `schedule`.
   - Se removieron los inputs automáticos de emparejamiento de horario del formulario de activación, sustituyéndolos por una guía explicativa que indica que el alumno inicia con 0 clases para asignación manual.
4. **Inclusión de Modalidad `Regular 1x/sem (8 clases / 45 min)`**:
   - Actualización del tipo `LessonModality` en `admin-seeds.ts`.
   - Badges visuales en azul cian en la tabla de alumnos y opción seleccionable en todos los desplegables de matrícula y edición.
5. **Alineación de Fechas en Semillas y Filtro Estricto en Kardex**:
   - `official-control-pagos-seeds.ts`: `planStartDate: "2026-09-10"`, `planEndDate: "2026-10-09"`, `planStartMonth: "2026-09"`, `planEndMonth: "2026-10"`.
   - En `student-attendance-kardex.tsx`, se enlaza el estudiante reactivo en vivo (`liveStudent`) y se aplica `effectivePlanStartDate`, omitiendo cualquier clase anterior al 10/09/2026 (eliminando las fechas 1, 3 y 8 de septiembre).
6. **Fidelidad Reactiva de Asistencias en Fichas y Erradicación del Mock Overwrite**:
   - En `EditStudentDialog.handleSubmit`, se eliminó la asignación sintética de `["presente", "presente", "presente"]`, preservando fielmente `student.recentAttendance || []`.
   - En el drawer "Ver Ficha", las pastillas de asistencia se calculan dinámicamente desde `schedule.attendanceByDate` mostrando las etiquetas reales de las fechas marcadas (ej. `10 Set`, `15 Set`).
   - Se retiró el botón `⚡ Regularizar por Fechas (1 Clic)` del drawer de visualización.
7. **Migración a `cadencia-app-v29`**:
   - Se incrementó el identificador de persistencia de Zustand a `cadencia-app-v29` con purga controlada de versiones previas en `localStorage` y forzado de la fecha oficial de inicio para Camila Pastor.

## Consecuencias
- La Base Histórica de 83 alumnos queda blindada contra escrituras accidentales y disponible para descarga y auditoría.
- La secretaria puede activar alumnos con plena visibilidad de su historial sin estrés cognitivo gracias al "ojito".
- Los alumnos reactivados inician con 0 lecciones, impidiendo cruces de horario o clases no deseadas.
- El Kardex de Camila Pastor Conco muestra con exactitud sus 6 clases de Septiembre (10, 15, 17, 22, 24, 29), sin fechas fantasma previas a su matrícula.
- Al guardar la ficha de un alumno, no se sobreescriben ni se pierden las asistencias registradas en el Kardex.
