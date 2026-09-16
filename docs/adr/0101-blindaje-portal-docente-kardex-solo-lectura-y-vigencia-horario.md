# ADR 0101: Blindaje de Portal Docente, Kardex en Modo Consulta y Vigencia de Matrícula en Horario

## Estado
Aprobado (v1.9.0) — 16 de Septiembre, 2026

## Contexto
1. **Discrepancia de Nombres en Portal Docente (Fernando)**:
   - Al consultar `/teacher/agenda` o el Kiosco `/teacher/`, la búsqueda de alumnos activos utilizaba `normSt.includes(normL)`.
   - El nombre registrado en PostgreSQL es `"Camila Valentina Pastor Conco"` mientras que el horario contiene `"Camila Pastor Conco"`.
   - Dado que la comparación de subcadenas devolvía `false`, el portal docente consideraba que la alumna no estaba activa, mostrando 0 clases en la agenda de Fernando.
   - Además, `MinimalAgendaCalendar` mantenía un valor fijo para Agosto 2026 (`getMonthWeeks(2026, 7)`), imposibilitando visualizar las clases reales de Setiembre.
2. **Exposición de Clases Fantasma para Otros Profesores (Jeremy, Nathaly)**:
   - Los seeds heredados del archivo original contenían ~120 sesiones asignadas a profesores cuyos alumnos históricos se encontraban en estado `"pausa"`.
   - Si la caché de `localStorage` o el filtrado por nombre no operaba de forma determinista, los profesores visualizaban un padrón masivo obsoleto en lugar de un portal limpio con 0 alumnos.
   - En `/teacher/alumnos`, el filtro por profesor no reaccionaba a los cambios de cuenta en `RoleSwitcher`.
3. **Clases Previas a la Matrícula en la Agenda de Administración**:
   - En `/admin/agenda`, Camila Pastor Conco continuaba apareciendo en Semana 1 (Martes 1 y Jueves 3 de Setiembre) porque el selector `visible` solo discriminaba a nivel de mes (`selectedYearMonthStr < startMonth`), sin comprobar el día calendario contra la fecha de inicio del alumno (`dayInfo.dateStr < studentProfile.planStartDate`).
4. **Ausencia de Fecha de Inicio en Formulario de Horario**:
   - `ScheduleStudentForm` permitía configurar salas, días y profesores pero carecía de un selector explícito para la fecha oficial de inicio de clases (`planStartDate`), impidiendo que secretaría indicara la vigencia al momento de agendar.
5. **Kardex Editable en Modo Visualización**:
   - `StudentAttendanceKardex` mostraba todos los botones de acción (`✓ Pres`, `✗ Falta`, `⚡ Regularizar`) activos al abrirse desde la tabla de alumnos o desde "Ver Ficha", induciendo a modificaciones involuntarias de asistencia fuera del formulario de edición.

## Decisiones Técnicas
1. **Normalización con `isMatchingStudentName` en Rutas Docentes**:
   - En `teacher.agenda.tsx`, `teacher.index.tsx` y `teacher.alumnos.tsx`, se unificó la comparación mediante `isMatchingStudentName`, resolviendo nombres completos vs nombres sin segundo nombre.
   - Se conectó `useEffect` en `teacher.alumnos.tsx` para sincronizar dinámicamente `selectedTeacher` con el profesor autenticado.
2. **Soporte Dinámico de Meses en `MinimalAgendaCalendar`**:
   - Se agregaron props `defaultYear` (2026) y `defaultMonth` (8 = Setiembre).
   - Se añadió un selector visual de meses (Agosto / Setiembre) y se filtraron las lecciones por día respetando estrictamente `dayInfo.dateStr >= student.planStartDate`.
3. **Filtrado Diario Estricto en Agenda Central (`agenda-board.tsx`)**:
   - En el callback `visible`, se evalúa el día exacto de la sesión dentro de la semana activa (`currentWeekObj.days.find(d => d.dayKey === l.day)`).
   - Si `dayInfo.dateStr < studentProfile.planStartDate` o `> studentProfile.planEndDate`, la sesión se omite de forma atómica.
4. **Selector de Fecha Oficial de Inicio en `ScheduleStudentForm`**:
   - Se incorporó un campo interactivo con `<Input type="date" />` pre-cargado con `student.planStartDate`.
   - Al guardar, calcula automáticamente `planEndDate` y persiste las fechas en Zustand y en PostgreSQL (`emergency_contact.planStartDate` y `planEndDate`).
5. **Bloqueo de Edición (`isEditable`) en `StudentAttendanceKardex`**:
   - Se introdujo la propiedad `isEditable?: boolean` (por defecto `false`).
   - Cuando `!isEditable`:
     - Se muestra un distintivo ámbar: *"Modo Consulta (Botones bloqueados · Para editar asistencias, ingresa a 'Editar Ficha')"*.
     - Los botones interactivos (`✓ Pres`, `✗ Falta`, `⏰ Tar`, `🔵 Just`) se reemplazan por una etiqueta informativa protegida.
     - El botón masivo `⚡ Regularizar todo como Presente` queda inhabilitado.
   - En `students-table.tsx`, solo `EditStudentSheet` ("Editar Ficha") activa `isEditable={true}`.
6. **Alineación de Base de Datos y Migración a `cadencia-app-v30`**:
   - Se actualizó el registro de Camila en PostgreSQL a `recentAttendance: []` y `attendance_rate: 0`.
   - Se incrementó el identificador de persistencia a `cadencia-app-v30` con purga de versiones 1 a 29 y restricción del horario activo exclusivamente a alumnos con estado `"activo"`.

## Consecuencias
- El profesor Fernando visualiza correctamente a Camila Pastor en sus clases de Martes y Jueves 17:30 a partir del 10 de Setiembre.
- Los profesores Jeremy y Nathaly disponen de un portal 100% limpio (0 alumnos asignados y 0 clases) hasta que secretaría les asigne alumnos activos reales.
- La Agenda de Administración en Semana 1 de Setiembre (1 y 3 de Setiembre) y Semana 2 (8 de Setiembre) queda libre de sesiones de Camila Pastor.
- Secretaría puede fijar la fecha de inicio al programar cualquier clase mediante `+ Horario`.
- El Kardex protege la integridad de los datos evitando ediciones no deseadas fuera de "Editar Ficha".
