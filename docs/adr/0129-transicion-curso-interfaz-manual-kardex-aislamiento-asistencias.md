# ADR-0129: Transición de Curso e Instrumento con Interfaz Manual en Kardex y Aislamiento de Historial de Asistencias

## Estado
Aceptado

## Contexto
En la operativa diaria de Vibra Music Staff, surgen casos donde un alumno activo requiere cambiar de curso o instrumento a mitad de ciclo lectivo (por ejemplo, el caso de la alumna **Sasha Dharma Contreras de la Cruz**, quien por prescripción médica tras una cirugía debe cesar las clases de Canto y pasar a clases de Guitarra con el Prof. Jeremy).

La aplicación contaba con herramientas para reprogramaciones puntuales de una sesión (`[🔄 Reprogramar]`) y consumos de créditos de recuperación (`[+ Programar Recuperación]`), pero no disponía de un mecanismo formal en la interfaz para gestionar la transición completa de un curso hacia otro instrumento/docente preservando las clases y asistencias ya impartidas.

### Riesgos Detectados y Lecciones del Incidente
1. **Riesgo de Pérdida o Sobrescritura de Asistencias Pasadas**:
   - Reemplazar ingenuamente el horario del alumno en `scheduleLessons` o cambiar su instrumento directamente en la base de datos desconecta las asistencias pasadas de su docente y sala original.
2. **Prohibición Estricta de Scripts Automatizados en Producción (STOP & VERIFY)**:
   - Toda mutación sobre alumnos activos en PostgreSQL debe ser gobernada por la interfaz de usuario con confirmación explícita del personal administrativo (Secretaría / Dirección).

## Decisiones Técnicas

### 1. Botón Prominente en el Kardex de Asistencias (`StudentAttendanceKardex`)
- En la barra de acciones superior del Kardex (junto a `[+ Programar Recuperación]` y `[➕ Agregar Sesión / Adelanto]`), se incorpora el botón oficial:
  👉 **`[🎸 Cambiar Instrumento / Docente]`**
- Este botón abre el diálogo interactivo modal `CourseTransitionDialog`.

### 2. Modal Interactivo de Transición Personalizada (`CourseTransitionDialog`)
El modal permite a secretaría configurar con flexibilidad:
1. **Nuevo Instrumento**: Selector (`Guitarra`, `Piano`, `Violín`, `Canto`, `Batería`).
2. **Nuevo Docente y Sala Automática (ADR-0102)**:
   - Al seleccionar Guitarra o Batería -> Prof. Jeremy (Sala A).
   - Piano estándar o Violín -> Prof. Fernando (Sala B).
   - Piano Infantil o Canto -> Prof. Nathaly (Sala C).
3. **Fecha de Entrada en Vigencia (Fecha de Corte)**:
   - Opción A: *Desde la próxima sesión programada* (calculada dinámicamente como la siguiente fecha del ciclo con estado pendiente, ej. 29 de Setiembre).
   - Opción B: *Mismo día / Fecha personalizada* (selector calendario para iniciar el mismo día del acuerdo si hay vacante).
4. **Nuevo Horario y Días**:
   - Mantiene los días pareados oficiales (ej. Martes y Jueves) o permite días personalizados.
   - Selector de turno/hora (ej. `17:40` para Sasha, pasando de su turno anterior 18:15 al turno contiguo anterior 17:40 - 18:25).
   - Indicador de aforo en vivo para garantizar que el nuevo docente no supere las 5 vacantes por turno.
5. **Auditoría Previa y Conciliación Visual ("La clase no se pierde, se recupera")**:
   - Muestra antes de confirmar:
     - 🟢 N clases pasadas completadas: Preservadas como historial inmutable con el docente previo.
     - 💡 N créditos por inasistencias médicas acumuladas: Transferidos intactos para programar recuperaciones en el nuevo instrumento.
     - ⚪ N clases regulares pendientes: Asignadas al nuevo horario y docente a partir de la fecha de corte.

### 3. Aislamiento Estricto por Fecha de Corte (`effectiveUntil` y `effectiveFrom`)
- Las lecciones previas en `scheduleLessons` reciben `effectiveUntil: <fecha_corte_anterior>` (o exclusión a partir de la fecha de corte), garantizando que en el calendario y Kardex las sesiones anteriores se rendericen fielmente con su instrumento y profesor histórico.
- Las nuevas lecciones reciben `effectiveFrom: <fecha_corte>`, proyectándose únicamente a partir de dicha fecha.
- La función de ciclo contractual (`isLessonInStudentCycle` en `src/lib/student-cycle.ts`) y la proyección en `student-attendance-kardex.tsx` respetan estas marcas temporales.

### 4. Sincronización Estándar y Segura con PostgreSQL
- La acción `transitionStudentCourse` actualiza el store de Zustand y delega la persistencia a `backgroundSyncStudentToDB`, asegurando:
  - Debounce de 350ms contra condiciones de carrera.
  - Generación de auditoría en `student_audit_logs`.
  - Intactitud absoluta de la tabla inmutable `attendance_logs`.

## Consecuencias y Beneficios
- **Control Total para Secretaría**: El usuario puede ejecutar transiciones a su propio ritmo desde la pantalla del Kardex con un solo clic.
- **Historial Limpio e Inmutable**: Las 5 sesiones evaluadas de Sasha (3 presentes, 2 faltas justificadas) quedan auditadas con Prof. Nathaly en Sala C.
- **Cumplimiento Pedagógico**: Las nuevas sesiones de Guitarra se asignan a Jeremy en Sala A en el turno correspondiente sin cruces de sala ni sobreaforos.
