# Changelog: Vibra Music (Maestro Mentor Guide)

Todas las modificaciones notables a este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [2.0.17] - 2026-09-26

### Aislamiento de Vigencias de Transición, Deduplicación Estricta y Reversión Quirúrgica de Curso (ADR-0131)
- **Barreras Temporales Absolutas (`effectiveFrom` y `effectiveUntil`)**:
  - En `student-attendance-kardex.tsx`, `agenda-board.tsx`, `minimal-agenda-calendar.tsx` y `teacher.index.tsx`, se retiró el antipatrón `if (!isAlreadyEvaluated)` que envolvía los límites de transición.
  - Las lecciones con `effectiveFrom: <fecha_corte>` se descartan de forma absoluta e incondicional en fechas anteriores a la fecha de corte, y las lecciones con `effectiveUntil: <fecha_corte - 1>` se descartan después de la fecha de corte.
- **Blindaje contra Sangrado de Asistencias en Hidratación (`isLessonEligibleForDate`)**:
  - En `hydrateFromBackend` (`app-store.ts`), se introdujo la guarda `isLessonEligibleForDate` tanto para `scheduleMap` como para `matchedStudent.scheduleLessons`.
  - Los logs de `attendance_logs` ya no pueden inyectarse en lecciones fuera de su rango de vigencia (`effectiveFrom` / `effectiveUntil`), en fechas excluidas (`excludedDates`) o en lecciones de días de la semana distintos (`lesson.day !== logDayKey`).
  - Esto resolvió la sobre-proyección en el Kardex de Sasha Contreras, devolviendo la cuota matemática exacta: exactamente 8 clases (5 históricas con Prof. Nathaly en Canto: 3 asistidas y 2 faltas + 3 pendientes con Prof. Jeremy en Guitarra; 2 créditos de falta preservados íntegramente).
- **Deduplicación Resiliente de Períodos de Transición**:
  - En `studentLessons` (`student-attendance-kardex.tsx`), se garantiza que clases con vigencias de transición distintas (`effectiveUntil !== l.effectiveUntil` o `effectiveFrom !== l.effectiveFrom`) no se descarten como duplicadas entre sí.
- **Acción y Botón de Reversión Quirúrgica (`revertStudentCourseTransition`)**:
  - Incorporación de `revertStudentCourseTransition` en `app-store.ts`.
  - Agregado el botón interactivo `[🔄 Deshacer Transición / Volver al Curso Anterior]` en el banner de estado activo del Kardex y en el cuerpo/pie de `CourseTransitionDialog`.
  - Al revertir, se eliminan quirúrgicamente las lecciones nuevas creadas en la transición, se retira `effectiveUntil` de las clases del curso anterior, se restituye el instrumento, profesor y sala originales y se sincroniza con PostgreSQL sin alterar las asistencias históricas ni recibos.
- **Identificación de Instrumento en Fila de Sesión del Kardex**:
  - En la tabla de sesiones del Kardex, cada fila muestra explícitamente el instrumento junto a la hora, sala y docente (ej. `Canto • Sala C • Prof. Nathaly` vs `Guitarra • Sala A • Prof. Jeremy`).

## [2.0.16] - 2026-09-26

### Alineación Estricta con el Horario Oficial de Vibra Music y Erradicación de Horarios Inválidos (ADR-0130)
- **Erradicación de Horarios Fantasma y Etiquetas en `CourseTransitionDialog`**:
  - Eliminación total de la hora inexistente `17:40` y de la etiqueta repetitiva `(1 turno antes: 17:40)`.
  - Reemplazo de listas locales por `timeSlotsWeekday` (`["16:00", "16:45", "17:30", "18:15", "19:00"]`) y `timeSlotsSaturday` (`["09:00", "09:45", "10:30", "11:15", "12:00", "12:45"]`).
  - Dinamismo de selector: al alternar entre días entre semana y sábado, se conmuta automáticamente el catálogo de turnos oficiales y se sincroniza la hora seleccionada.
  - Para Sasha Contreras, la hora inicial se toma de su lección actual (`18:15`), permitiendo seleccionar con 1 clic su turno previo real de 45 min (`17:30`) con Prof. Jeremy en Sala A.
- **Sincronización de Horarios en Organizador (`ScheduleStudentForm` en `students-table.tsx`)**:
  - Sustitución de listas hardcodeadas que contenían horarios nocturnos (`19:45`, `20:30`, `21:15`) y tardes de sábado (`14:15` a `18:00`) por los turnos oficiales canónicos de `admin-seeds.ts`.
- **Alineación de Matriz de Disponibilidad (`VacancyAvailabilityPanel`)**:
  - `WEEKDAY_TIMES` y `SATURDAY_TIMES` enlazados estrictamente a `timeSlotsWeekday` y `timeSlotsSaturday`, eliminando vacantes falsas fuera del horario operativo de la academia.
- **Limpieza de Turnos Demo (`AdminDemosPage`)**:
  - Remoción de `"19:45"` como hora de inicio en `DEMO_TIME_SLOTS`, fijando el último turno a las `19:00`.

## [2.0.15] - 2026-09-26

### Corrección de Desfase de Proporciones y Adaptabilidad Responsiva en Kardex (ADR-0129)
- **Eliminación de Desbordamiento Horizontal en Modal Kardex (`StudentAttendanceKardex`)**:
  - Ampliación del ancho del diálogo a `w-[96vw] max-w-5xl max-h-[92vh] overflow-hidden` y contenedor interno de scroll con `overflow-x-hidden min-w-0 w-full max-w-full`.
  - Corrección de la barra de acciones de secretaría a `flex flex-col md:flex-row md:items-center justify-between gap-3 min-w-0` y remoción de `shrink-0` de los botones para habilitar el acomodo fluido sin desbordar el modal.
  - Simplificación de etiquetas en botones (`➕ Agregar Sesión`, `Copiar WhatsApp`, `✏️ Editar`) y remoción del botón duplicado de transición en el banner de Filosofía Vibra.
  - Rejilla responsiva de tarjetas métricas con `grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 min-w-0` y texto truncado para evitar descalibres.
  - Reducción del ancho mínimo de la fila horaria a `min-w-[200px] flex-1` y liberación de `shrink-0` en los botones de asistencia para que se adapten con gracia en resoluciones reducidas.
- **Normalización de Diálogos Radix/Tailwind (`dialog.tsx`, `alert-dialog.tsx`)**:
  - Sustitución de sintaxis arbitraria por las clases estándar de Tailwind CSS `-translate-x-1/2 -translate-y-1/2` con `left-1/2 top-1/2`.
- **Cálculo Automático de Categoría MASTER para Alumnos de 18+ Años (`AddNewStudentDialog`)**:
  - Detección precisa de edad a partir de la fecha de nacimiento (`birthdate`): si la edad calculada es $\ge 18$, se asigna y selecciona automáticamente la categoría `"MASTER"`.

## [2.0.14] - 2026-09-25

### Transición de Curso e Instrumento con Interfaz Manual en Kardex y Aislamiento de Asistencias (ADR-0129)
- **Modal Interactivo `CourseTransitionDialog`**:
  - Incorporación del componente modal para transición manual de curso e instrumento, con selectores de nuevo instrumento, docente sugerido, asignación oficial de sala (ADR-0102), selector de fecha de corte ("Próxima sesión programada" vs "Fecha personalizada / Mismo día"), selector de horario (ej. 17:40 para turno previo) y verificación en vivo de aforo/vacantes en sala (máx 5 alumnos).
  - Panel informativo de auditoría: "La clase no se pierde, se recupera", detallando clases pasadas conservadas, créditos acumulados transferidos y clases pendientes reasignadas.
- **Botón `[🎸 Cambiar Instrumento / Docente]` en `StudentAttendanceKardex`**:
  - Integrado de forma prominente en el banner de Filosofía Vibra y en la barra de acciones rápidas superior del Kardex.
- **Aislamiento Temporal de Sesiones (`effectiveUntil` y `effectiveFrom`)**:
  - Soporte de `effectiveUntil` y `effectiveFrom` en `ScheduledLesson`, `student-cycle.ts`, `student-attendance-kardex.tsx`, `agenda-board.tsx`, `minimal-agenda-calendar.tsx` y `teacher.index.tsx`.
  - Las clases anteriores a la fecha de corte conservan su instrumento, docente, sala y marcas de asistencia inmutables. Las clases a partir de la fecha de corte se proyectan con el nuevo instrumento y horario.
- **Acción Segura en Store `transitionStudentCourse`**:
  - Actualización atómica en Zustand y persistencia estándar en segundo plano vía `backgroundSyncStudentToDB` (con debounce y auditoría en PostgreSQL).
  - Cero mutaciones vía scripts automatizados no supervisados (STOP & VERIFY).

## [2.0.13] - 2026-09-25

### Sincronización Estricta entre Kiosco Docente y Agenda mediante Validación de Ciclo Contractual (ADR-0128)
- **Unificación de Motor de Filtrado en Kiosco (`teacher.index.tsx`)**:
  - `isLessonInDay` integra `isLessonInStudentCycle(studentProfile, lesson, dateStr, lesson.time, schedule)` y verificación de `excludedWeeks`, garantizando que Kiosco (`/teacher`) y Agenda (`/teacher/agenda`, `/admin/agenda`) apliquen exactamente las mismas reglas de cuota y fechas.
  - Eliminación de clases "fantasma" pendientes en días donde la sesión ya fue reprogramada/adelantada a otra fecha (caso Mia Lucero Bellido Alvan, cuya clase del viernes 25 fue adelantada al jueves 24 y asistida con 🟢 PRESENTE).
  - Eliminación de duplicidad de semillas obsoletas en Martes (Sasha Contreras `sch-34` a las 17:30 descartada en favor de la lección real a las 18:15).
  - Reactividad de `countsByDay` y `dayLessons` ante mutaciones en `adminStudents` y `schedule`.
  - Resolución de estado de asistencia en tarjetas de sesión evaluando prioritariamente `studentProfile.scheduleLessons` desde PostgreSQL.

## [2.0.12] - 2026-09-25

### Navegación Automática a Días Pareados y Cierre de Sesión Resiliente (ADR-0127)
- **Navegación Determinista al Abrir Webapp (`agenda-board.tsx`)**:
  - Detección automática del día actual con `new Date().getDay()` para inicializar el par de días y día correspondiente:
    - Viernes (5) / Sábado (6) $\rightarrow$ Par `2` ("Viernes y Sábado"), día `4` (Vie) / `5` (Sáb).
    - Martes (2) / Jueves (4) $\rightarrow$ Par `1` ("Martes y Jueves"), día `1` (Mar) / `3` (Jue).
    - Lunes (1) / Miércoles (3) $\rightarrow$ Par `0` ("Lunes y Miércoles"), día `0` (Lun) / `2` (Mié).
    - Domingo (0) $\rightarrow$ Par `0`, día `0`.
  - Inicialización exclusiva vía `useState(() => ...)` sin efectos restrictivos colaterales, permitiendo el cambio manual completamente desbloqueado en las 3 vistas (**📊 Vista Didáctica**, **📱 Vista por Día** y **🗓️ Rejilla Semanal**).
  - Sincronización del botón "Ir al mes actual" para restablecer fecha, semana y par de hoy.
- **Cierre de Sesión Infalible y Multi-Dispositivo (`admin.tsx`, `role-switcher.tsx`)**:
  - Implementación de `handleLogout` que limpia `sessionStorage`, ejecuta `logout()` y fuerza la redirección instantánea a `window.location.href = "/"`.
  - Guardián reactivo `useEffect` en `AdminLayout`, `TeacherLayout` y `FamilyLayout` para redirigir automáticamente si `isAuthenticated` se anula.
  - Botón de cierre de sesión con ícono `LogOut` visible en la cabecera tanto en pantallas móviles como de escritorio.
  - Botón dedicado de salida en el pie de la barra lateral (`<aside>`) tanto en modo colapsado como expandido y en el menú drawer de teléfonos.
  - Corrección del botón "Salir" en `RoleSwitcher` para garantizar la salida limpia al login.

## [2.0.11] - 2026-09-25

### Sincronización en Tiempo Real Docente, Cola en Vuelo y Persistencia de Auditoría (ADR-0126)
- **Eliminación de Condición de Carrera en `BroadcastChannel` y `Debounce`**:
  - Eliminación de la emisión anticipada `triggerDataSyncBroadcast("student-mutation")` a $t = 0\text{ ms}$ en `backgroundSyncStudentToDB`.
  - `triggerDataSyncBroadcast("student-sync")` se emite estrictamente tras la resolución exitosa de `updateStudent(...)` en PostgreSQL.
- **Cola de Revalidación en Vuelo (`queuedSyncRef`) en `useInsforgeSync`**:
  - Si llega una señal de sincronización mientras una petición HTTP a PostgreSQL ya está en curso, se encola la solicitud y se ejecuta de inmediato en el bloque `finally` con retardo de 80 ms, impidiendo la pérdida de eventos entre pestañas.
- **Persistencia de Selección de Auditoría Docente (`sessionStorage`)**:
  - `adminSelectedTeacher` se guarda y recupera de `sessionStorage` (`vibra_audit_teacher`), manteniendo la selección de Jeremy, Nathaly o Fernando al alternar entre Kiosco (`/teacher`) y Agenda (`/teacher/agenda`).
- **Indicador Visual de Sincronización en Vivo y Atajos en Días Vacíos**:
  - Incorporación de píldora visual en cabecera docente: `🟢 En vivo · Sincronizado hace Xs` con pulsación activa y botón de refresco `🔄`.
  - En Kiosco y Agenda, las tarjetas de día vacío ahora muestran atajos interactivos hacia los días en que el docente sí tiene clases programadas (ej. Martes o Jueves para Prof. Jeremy).
- **Paridad en Métodos de Eliminación de Clases**:
  - `removeLessonFromSchedule` actualiza tanto el store en memoria como `emergency_contact.scheduleLessons` en PostgreSQL vía `backgroundSyncStudentToDB`.

## [2.0.10] - 2026-09-24

### Aislamiento Estricto en Eliminación por Checkbox y Detección Reactiva de Duplicados (ADR-0125)
- **Aislamiento Estricto por ID en Eliminación por Lotes**:
  - `deleteMultipleStudents`: eliminación circunscrita al conjunto exacto de IDs seleccionados (`isSameStudentId`), preservando el homónimo activo original si se elimina un duplicado.
  - El horario semanal solo remueve clases si el alumno no cuenta con otro perfil activo con el mismo nombre.
- **Detección Reactiva de Homónimos en Registro (`AddNewStudentDialog`)**:
  - Banner de advertencia visual en vivo al detectar coincidencia difusa con un alumno ya matriculado (`isMatchingStudentName`).
  - Alerta confirmatoria con `confirm()` antes de crear el registro duplicado.
- **Diálogo Detallado de Confirmación de Borrado**:
  - Desglose ítem por ítem con nombre del alumno, estado (`🟢 Activo`, `⚪ Baja`) y motivo de baja individual.

## [2.0.9] - 2026-09-23

### Matrícula Demo Nivelación, Erradicación de Asistencia Fantasma y Control en Agenda (ADR-0122)
- **Matrícula Oficial en Demo Nivelación**:
  - Eliminación de la exoneración forzada al registrar o editar alumnos en modalidad `Demo Nivelación`.
  - Configuración inicial en **`Promo Demo (S/ 30)`** (descuento promocional del 75% sobre los S/ 120 regulares), con libertad para que secretaría seleccione `Regular (S/ 120)` o `Exonerada (S/ 0)`.
- **Erradicación de Asistencias Fantasma en Horario de Clases**:
  - Remoción definitiva del fallback `(safeWeekIndex === currentWeekIndex ? lesson.attendanceStatus : undefined)` en las vistas Excel, Semanal, Diario, Sábado y Modal de `agenda-board.tsx`.
  - Las lecciones recurrentes sin evaluación explícita en `attendanceByDate` ni `attendanceByWeek` se renderizan estrictamente como pendientes.
  - Protección de plantilla recurrente: `markLessonAttendance` no sobreescribe la propiedad global `attendanceStatus` en lecciones con `weekIndex === undefined`.
- **Botón Interactivo de Restablecimiento en Modal de Clase**:
  - Adición del botón `⚪ Restablecer a Pendiente / Sin marcar` con `RotateCcw` en el modal de clase de la agenda.
  - Conexión del parámetro de fecha (`selectedDayDateStr`) como 5° argumento en todas las operaciones del modal.
- **Widget "Control de Asistencias del Alumno"**:
  - Recálculo matemático basado en las fechas reales de `attendanceByDate` y la cuota contractual correcta (4 para Intensivo/1x, 8 para Regular 2x, 1 para Demo Nivelación).
  - Eliminación de falsas alarmas de clases por agendar y soporte para alumnos con ciclo activo completo (ej. Flavia Nicole Concepción con 4 de 4 clases: 3 Pres. y 1 Justificada).
- **Idempotencia y Sincronización en PostgreSQL**:
  - `backgroundSyncAttendanceLogToDB`: borrado idempotente por fecha calendario (`like.*Fecha ${dateStr}*`) al restablecer a pendiente o antes de insertar nueva asistencia, evitando duplicados en `attendance_logs`.
  - `hydrateFromBackend`: ordenamiento cronológico (`registered_at ASC`) de logs de asistencia para garantizar la prevalencia del evento más reciente.
  - Depuración del log de prueba del 25/09 y completitud del log del 18/09 para Flavia Nicole Concepción en PostgreSQL.

## [2.0.8] - 2026-09-23

### Demo Nivelación (Tarifa Abierta), Restricción a Base Activa y Deduplicación de Leyenda (ADR-0122)
- **Modalidad y Plan "Demo Nivelación" (Opción C - Tarifa Abierta)**:
  - Adición de `Demo Nivelación` a `VibraPlanType` y `VIBRA_PRICING` con precio por defecto S/ 0 (editable libremente por secretaría según lo acordado con el cliente).
  - Adición de `Demo Nivelación (1 Alumno · 45 min)` a `LessonModality`.
  - Tratamiento como aforo exclusivo individual (1 solo alumno por sala) en `evaluateSlotPedagogicalCompatibility` (`src/lib/room-compatibility.ts`).
  - Asignación de cuota contractual objetivo `targetQuota = 1` en `computeStudentCycle` (`student-cycle.ts`) y `student-attendance-kardex.tsx`.
  - Soporte completo en `AddNewStudentDialog`, `EditStudentDialog` y `ScheduleStudentForm` con matrícula exonerada y banner informativo.
- **Directorio de Alumnos (`/admin/alumnos`) — Exclusividad de Alumnos Activos**:
  - Restricción estricta en `filteredStudents`: la tabla principal renderiza **únicamente** alumnos con `status === "activo"`.
  - Los alumnos de la base histórica inactiva (`baja`, `pausa`) se aíslan para su gestión y reactivación 1 a 1 en el panel dedicado "Depuración & Reactivación 2026" (`StudentCleanupPanel`).
  - Actualización de tiles de métricas y barra de filtros con badge oficial `🟢 Base Activa`.
- **Libreta de Asistencias y Plan (`agenda-board.tsx`)**:
  - `filteredLedgerList`: filtra estrictamente alumnos activos (`st.status === "activo"`), impidiendo la mezcla con alumnos dados de baja o en pausa.
  - Soporte de filtro para clases de Nivelación / Personalizada.
- **Leyenda del Horario de Clases (`agenda-board.tsx`)**:
  - Creación de `legendCategoryStyles` filtrando la clave técnica `ADULTO`.
  - Eliminación definitiva de la etiqueta duplicada `● CATEGORÍA MASTER (18 a +)` en las vistas Excel, Diario y Semanal, preservando la compatibilidad de lookup en base de datos.

## [2.0.7] - 2026-09-23

### Matriz Pedagógica Oficial, Aforos de Salas y Reglas de Convivencia (ADR-0121)
- **Módulo Puro de Compatibilidad (`src/lib/room-compatibility.ts`)**:
  - `checkAgeCompatibility`: validación matemática de compatibilidad de categorías por rangos de edad.
    - `ESTIMULACION` (4 a 5 años): requiere aislamiento estricto de sala (Sala D con Prof. Claudia). No comparte con ninguna otra categoría.
    - `INFANTIL` (5 a 6 años): requiere aislamiento estricto de sala (Sala C con Prof. Nathaly). No comparte con ninguna otra categoría.
    - `JUNIOR` (7 a 12 años): comparte exclusivamente con `JUNIOR` o `JUVENIL`. **PROHIBIDO compartir con `MASTER`**.
    - `JUVENIL` (13 a 17 años): comparte con `JUNIOR`, `JUVENIL` o `MASTER`.
    - `MASTER` (18+ años): comparte con `JUVENIL` o `MASTER`. **PROHIBIDO compartir con `JUNIOR`**.
    - `PERSONALIZADA`: regla de alumno único (aforo exclusivo de 1 alumno). Jamás comparte sala con ningún otro alumno.
  - `checkDurationCompatibility`: impide la convivencia en la misma sala y turno entre clases de 45 min y clases de 90 min (Plan Intensivo).
  - `getOfficialTeacherRoom`: asignación oficial garantizada por docente (Jeremy $\rightarrow$ Sala A, Fernando $\rightarrow$ Sala B, Nathaly $\rightarrow$ Sala C, Claudia $\rightarrow$ Sala D).
  - `evaluateSlotPedagogicalCompatibility`: diagnóstico completo y reactivo de advertencias pedagógicas en tiempo real.
- **Semillas y Catálogo Central (`src/store/admin-seeds.ts`)**:
  - Incorporación de `ESTIMULACION` y `MASTER` en el tipo `AgeCategory`, manteniendo `ADULTO` como alias transparente de base de datos PostgreSQL.
  - Adición de Prof. Claudia a `teachers` y `defaultTeacherRooms` en Sala D para Estimulación Musical y Demos de Principiantes.
  - Adición de `Estimulación Musical` al listado oficial de cursos (`musicalInstruments`).
  - Actualización de `getCategoryFromAge(age)`: mapeo automático para 4-5 años (`ESTIMULACION`), 5-6 años (`INFANTIL`), 7-12 (`JUNIOR`), 13-17 (`JUVENIL`) y 18+ (`MASTER`).
- **Visualización en Horario de Clases (`src/components/admin/agenda-board.tsx`)**:
  - Nuevos badges y estilos en `categoryStyles`:
    - `ESTIMULACION`: Rosa pedagógico (`#F48FB1`, `#EC407A`).
    - `MASTER`: Gris plata distinguido (`#78909C`, `#546E7A`).
    - `ADULTO`: Mapeado con idéntico estilo visual que `MASTER` para retrocompatibilidad total con registros históricos de PostgreSQL.
  - Select de categoría oficial actualizado en modal de programación manual.
- **Matrícula y Organizador de Horario (`src/components/admin/students-table.tsx`)**:
  - `AddNewStudentDialog`:
    - Incorporación de `Estimulación Musical` y `Piano Infantil` con autoselección inteligente de docente y sala por edad.
    - Opciones de categoría en interfaz: `🌸 Estimulación`, `🟣 Infantil`, `🟡 Junior`, `🟢 Juvenil`, `⚫ Master` y `⭐ Personalizada`.
  - `ScheduleStudentForm`:
    - Diagnóstico reactivo de convivencia pedagógica en vivo para Sesión 1 y Sesión 2.
    - **Alerta visual preventiva (ámbar/roja)** con casilla de confirmación explícita para secretaría: `[ ] Comprendo la incompatibilidad pedagógica y deseo confirmar este turno excepcionalmente`.
    - Bloqueo duro preservado exclusivamente para aforo completo (>5 alumnos) o cruce de dos docentes en la misma sala.

## [2.0.6] - 2026-09-23

### Aislamiento de Asistencia en Clases Makeup y Reversión Atómica en Kardex (ADR-0112)
- **Aislamiento en Escritura de Asistencia (`src/store/app-store.ts`)**:
  - `setStudentSessionAttendance` y `bulkRegularizeStudentAttendance`: etiquetan los logs de bitácora en PostgreSQL con `[hora:HH:mm] [lesson:id]`.
  - `backgroundSyncAttendanceLogToDB`: elimina únicamente los registros previos correspondientes a la lección específica, evitando el borrado o sobreescritura cruzada en días con múltiples sesiones.
  - `hydrateFromBackend`: valida `[lesson:id]` y `[hora:HH:mm]` antes de aplicar marcas de asistencia, y protege a las lecciones `isMakeup` contra contaminación por logs legacy sin tags.
- **Acción Atómica `revertMakeupLesson` en Zustand (`src/store/app-store.ts`)**:
  - Elimina de forma atómica la clase makeup de `schedule` y `adminStudents.scheduleLessons`.
  - Restaura la fecha excluida (`recoveringLessonDate`) del array `excludedDates` de la lección regular original.
  - Devuelve el crédito de recuperación (`makeupCredits + 1`).
  - Sincroniza atómicamente con PostgreSQL vía `backgroundSyncStudentToDB` y emite `triggerDataSyncBroadcast("lesson-removed")`.
- **Persistencia en `deleteLessonFromSchedule` (`src/store/app-store.ts`)**:
  - Garantiza que cualquier eliminación de lección actualice `adminStudents.scheduleLessons` y persista en PostgreSQL vía `backgroundSyncStudentToDB`.
- **Kardex de Asistencias (`src/components/admin/student-attendance-kardex.tsx`)**:
  - El botón X invoca de forma limpia `revertMakeupLesson(item.lessonId, item.recoveringLessonDate)` con notificación explicativa y restauración inmediata en el horario.
  - `allCycleSessions` permanece 100% inalterada, blindando el historial de alumnos con ciclo completado (ej. Emma Sevilla).

## [2.0.5] - 2026-09-22

### Fix Critico: Import Faltante de `normalizeStudentName` — ReferenceError en `hydrateFromBackend` (ADR-0111, ADR-0119)

**Sintoma:** Agenda mostraba 0 clases en cualquier PC/navegador sin cache de
`localStorage` (ej. Chrome limpio), mientras que Edge con snapshot antiguo mostraba
correctamente 15 clases. Consola del dispositivo afectado mostraba en cada ciclo:
`[Insforge Sync] Operando en fallback Zustand local: ReferenceError: normalizeStudentName is not defined`.

**Causa raiz:** `src/store/app-store.ts:39` importaba
`{ isMatchingStudentName, resolveStudentUUID, isSameStudentId }` de `@/lib/student-matching`
pero omitia `normalizeStudentName`, que era usada en `hydrateFromBackend` para la
deduplicacion de homonimos activos (introducida en ADR-0107/ADR-0112). El `ReferenceError`
era tragado silenciosamente por el `catch` de `useInsforgeSync`, dejando el `schedule`
con el snapshot de `localStorage` (vacio en dispositivos sin cache previa).

**Por que el kiosco seguia activo:** `attendance.service.ts` lee `attendance_logs`
directamente, sin pasar por `hydrateFromBackend` — ruta completamente independiente.

- **Fix (`src/store/app-store.ts`, linea 39):** añadir `normalizeStudentName` al import existente. Cambio de 1 token, sin modificar logica de negocio, filtros, Kardex, facturacion ni partialize.
- **Documentacion (`AGENTS.md`):** ADR-0119 punto 5 corregido (el desacople de `schedule`/`adminStudents`/`invoices` de `localStorage` era incorrecto; `app-store.ts:2866-2880` los persiste) + punto 6 nuevo con causa raiz confirmada y criterio de cierre.
- **ADR generado:** `docs/adr/0111-missing-import-normalizestudentname-hydratefrombackend-referenceerror.md`
- **Log generado:** `docs/logs/2026-09-22-normalizestudentname-referenceerror-incident.md`
- **Commit:** `1a578ee` — push a `main`, despliegue automatico via Cloudflare Pages.

**Criterio de cierre:** consola en Chrome (sin cache) muestra
`[Insforge Sync] Sincronizacion en tiempo real exitosa` y `CLASES PROGRAMADAS: 15`.

## [2.0.4] - 2026-09-19

### Soporte Integral para Modalidad Regular 1x/sem (8 clases / 45 min · 2 meses) (ADR-0110)
- **Organizador de Horario Adaptativo (`src/components/admin/students-table.tsx`)**:
  - `ScheduleStudentForm`: distingue formalmente entre `isRegular2x` (2 clases/semana · 8 clases/mes), `isRegular1x` (1 clase/semana de 45 min · 8 clases en 2 meses) e `isIntensive` (1 clase/semana de 90 min · 4 clases/mes).
  - Eliminación de falsas alertas de aforo y cruce de salas: al detectar modalidad 1x/semana, el formulario solo evalúa y requiere la franja horaria de la clase 1 (`day1`), suprimiendo la exigencia de un Día 2 inexistente.
  - Asignación pedagógica automática de sala (ADR-0102): Prof. Nathaly asigna por defecto Sala C (Canto y Piano Infantil), Prof. Fernando Sala B y Prof. Jeremy Sala A.
  - Sincronización de vigencia contractual: calcula automáticamente 2 meses lectivos (`planEndDate = +2 meses`) al guardar el horario en modalidad 1x/sem.
  - Botón de guardado dinámico: refleja claramente la frecuencia contratada (`Guardar Horario Completo (1 Clase Semanal · 45 min)`).
- **Cálculo de Vigencia al Matricular (`src/components/admin/students-table.tsx`)**:
  - En `AddNewStudentDialog`, la duración del plan regular con modalidad 1x/sem se fija en 2 meses lectivos para abarcar las 8 sesiones.
- **Ventana de Proyección en Kardex (`src/components/admin/student-attendance-kardex.tsx`)**:
  - Se amplió `maxDaysToScan` a 90 días (alineado con `computeStudentCycle`) para que el Kardex de Asistencias proyecte sin truncamientos las 8 semanas de clases del ciclo lectivo.

## [2.0.3] - 2026-09-19

### Blindaje Backend para Migración 1 a 1 y Auto-Aprovisionamiento de Recibos en PostgreSQL (ADR-0109)
- **Auto-Aprovisionamiento de Recibos en PostgreSQL (`src/store/app-store.ts`)**:
  - `backgroundCreateInvoiceInDB`: auto-persiste en la tabla `invoices` de PostgreSQL cualquier recibo nuevo originado al matricular (`addNewStudent`) o al activar un alumno histórico (`setStudentStatus` a `activo`).
  - Garantiza la existencia de la familia en la tabla `families` y persiste el comprobante inicial en `payment_audit_logs` si hubo un abono al matricular.
  - Elimina la pérdida de recibos al recargar la página (`F5`) y asegura que todo alumno activo cuente con su recibo correspondiente en `/admin/facturacion`.
- **Sincronización Dinámica de Abonos (`src/store/app-store.ts`)**:
  - `backgroundSyncPaymentToDB` ahora recibe y respeta los montos matemáticos reales del recibo (`amount`, `amount_paid`, `remaining_balance`), eliminando el hardcode anterior de S/ 297.
  - Integrado en `recordPaymentAbono` y `recordNewDirectAbono`, permitiendo registrar abonos fraccionados y planes promocionales sin desajustes de saldo.
- **Fusión Resiliente de Recibos en Hidratación (`src/store/app-store.ts`)**:
  - `hydrateFromBackend` preserva los recibos locales de alumnos activos que estén en vuelo o recién generados para que no sean eliminados durante el ciclo de lectura de PostgreSQL.
- **Mapeo Robusto de Alumnos desde Concepto de Recibo (`src/lib/services/invoices.service.ts`)**:
  - `mapDBInvoiceToInvoice` extrae con prioridad el nombre del alumno desde el concepto (`Plan ... — Nombre`), evitando que se asigne erróneamente el nombre del apoderado.

## [2.0.2] - 2026-09-18

### Cierre Estricto de Ciclo Contractual, Preservación de Asistencias y Sincronización Kardex-Horario (ADR-0108)
- **Módulo Central de Ciclo Contractual (`src/lib/student-cycle.ts`)**:
  - `computeStudentCycle`: calcula cuotas contractuales (`targetQuota`: 8 Regular, 4 Intensivo, N Flexible), evalúa sesiones registradas en `attendanceByDate` y detecta la culminación exacta del ciclo (`isCompleted`).
  - `isLessonInStudentCycle`: filtra slots de clase preservando incondicionalmente todas las sesiones evaluadas o dictadas y bloqueando clases fantasma posteriores a la culminación de la cuota o al vencimiento del plan (`planEndDate`).
- **Eliminación de Clases Fantasma y Límite Mensual en Horario (`src/components/admin/agenda-board.tsx`)**:
  - Integrado `isLessonInStudentCycle` en el filtro `visible` para que alumnos que completaron su cuota (ej. Emma Sevilla, 8 de 8 clases al 18/09) no muestren sesiones no cursadas en Semana 4, Semana 5 ni en meses futuros.
  - Filtro mensual estricto (`selectedYearMonthStr <= endMonth`) que evita que lecciones recurrentes sin semana asignada se proyecten en Octubre u otros meses cuando el contrato concluye en Setiembre.
- **Visualización Inmediata de Asistencias en Horario Semanal (`src/components/admin/agenda-board.tsx` y `src/components/agenda/minimal-agenda-calendar.tsx`)**:
  - `cardAtt` en vista semanal y sábado consulta prioritariamente `lesson.attendanceByDate?.[dayInfo.dateStr]`, permitiendo que las marcas de asistencia reales de PostgreSQL ("🟢 Pres" de Camila Pastor el 10/09, 15/09 y 17/09) se pinten directamente en el calendario.
  - Sincronización en `MinimalAgendaCalendar` para reflejar el estado diario exacto en dispositivos móviles y Kiosco.
- **Sincronización Bidireccional en Rehidratación (`src/store/app-store.ts`)**:
  - En `hydrateFromBackend`, los registros de `attendance_logs` rehidratan tanto `scheduleMap` como `matchedStudent.scheduleLessons`, asegurando coherencia instantánea entre el Kardex del alumno y el Horario general.
  - Inclusión de fallback por nota (`log.note && isMatchingStudentName`) para el mapeo resiliente de asistencias.

## [2.0.1] - 2026-09-18

### Resolución Prioritaria de Alumnos Activos y Preservación de Historial en Horario de Clases (ADR-0107)
- **Función `findStudentProfileByName` (`src/lib/student-matching.ts`)**:
  - Busca perfiles priorizando siempre `status === "activo"`, evitando que duplicados en baja generados durante pruebas de eliminación/re-creación oculten las clases del alumno.
  - Integrada en `AgendaBoard`, `VacancyAvailabilityPanel`, `MinimalAgendaCalendar` y en los módulos del portal docente (`teacher.agenda`, `teacher.alumnos`, `teacher.index`).
- **Deduplicación e Inmunidad a Sombras Inactivas (`src/store/app-store.ts`)**:
  - En `hydrateFromBackend`, un alumno activo de PostgreSQL sustituye automáticamente a cualquier homónimo inactivo.
  - Se depuran registros en baja que compartan nombre con un activo y se ordenan los alumnos activos al inicio de `adminStudents`.
- **Preservación Incondicional del Historial de Clases Culminadas (`src/components/admin/agenda-board.tsx`)**:
  - Los alumnos que completaron sus 8 créditos lectivos mantienen visibles todas sus clases asistidas en las semanas correspondientes.
  - Las celdas leen `attendanceByDate[dateStr]` para reflejar con exactitud las asistencias persistidas en `attendance_logs`.
  - Soporte de exclusión por fecha (`excludedDates`) y clases puntuales (`dateStr`) en la grilla semanal.

## [2.0.0] - 2026-09-18

### Gestión Quirúrgica de Cobros, Abonos y Facturación Vinculada Exclusivamente a Alumnos Activos (ADR-0106)
- **Facturación Limpia y Exclusiva para Alumnos Activos (`src/routes/admin.facturacion.tsx`)**:
  - Pestaña "Matriz Anual 2026" y tabla de cobranzas acotadas estrictamente a `activeStudents = adminStudents.filter(st => st.status === "activo")`.
  - Purgadas en PostgreSQL las 83 facturas antiguas de prueba/semillas previas a septiembre 2026.
  - Inicialización en frontend (`src/store/admin-seeds.ts`) con `initialInvoices = []` para evitar contaminación por datos mock.
- **Sincronización Reactiva Bidireccional de Pagos y Abonos (`src/store/app-store.ts`)**:
  - `recordPaymentAbono`: registra el cobro en `payment_audit_logs` con comprobante y actualiza `invoices`. Simultáneamente sincroniza en tiempo real `amountPaid`, `balance` y `payment: "al-dia" | "pendiente"` en la ficha del alumno (`adminStudents`) y persiste en PostgreSQL vía `backgroundSyncStudentToDB`.
  - `addNewStudent`: genera automáticamente el recibo inicial del alumno matriculado y su primer log de pago.
  - `updateStudentDetails`: mantiene la sincronización cuando se modifican montos del plan desde la ficha de edición del alumno.
  - `generateMonthlyInvoices`: genera recibos mensuales únicamente para alumnos con `status: "activo"`.
- **Carga de Auditoría Unificada (`src/lib/services/invoices.service.ts` y `src/hooks/use-insforge-sync.ts`)**:
  - Nuevo servicio `getInvoicesWithAudit` que consulta concurrentemente `invoices` y `payment_audit_logs`, rehidratando la bitácora de vouchers y abonos históricos de cada recibo.
- **Migración y Activación de Camila Pastor Conco**:
  - Alumna activada con Plan Trimestral (promoción S/ 261), matrícula exonerada por reingreso/continuación.
  - Abonos auditados en PostgreSQL: S/ 200 el 08/09/2026 y S/ 61 el 10/09/2026 (saldo cancelado S/ 261 al día).
  - Horario regular configurado: Martes 17:30 y Jueves 17:30 (Violín, Prof. Fernando, Sala B).
  - Clase puntual reprogramada: Jueves 17/09 a las 18:15 (`dateStr: "2026-09-17"`) con exclusión en la lección regular.
  - Asistencias registradas en `attendance_logs`: 3 clases evaluadas como presente (10/09, 15/09, 17/09).

## [1.9.9] - 2026-09-18

### Blindaje de Reprogramación Puntual con Fechas Exactas (`dateStr`), Fechas Excluidas y Cuota Contractual Estricta en Kardex (ADR-0105)
- **Aislamiento de Clases Reprogramadas a una Fecha Única (`src/store/admin-seeds.ts` y `src/store/app-store.ts`)**:
  - Incorporados `dateStr?: string` (fecha única `YYYY-MM-DD`) y `excludedDates?: string[]` a la interfaz `ScheduledLesson`.
  - Al reprogramar una clase con alcance *"Solo esta sesión"*, la lección original agrega `originalDateStr` a sus fechas excluidas y la nueva lección se crea con `dateStr: newDateStr`, evitando que se replique como clase semanal en las semanas sucesivas del mes.
  - Sincronización automática de `schedule` y `adminStudents.scheduleLessons` persistiendo en PostgreSQL.
- **Filtrado Estricto en el Generador de Sesiones (`src/components/admin/student-attendance-kardex.tsx`)**:
  - `allCycleSessions` valida que si una lección posee `dateStr`, solo se emita en esa fecha exacta (`lesson.dateStr === curDateStr`).
  - Se omiten fechas presentes en `lesson.excludedDates` y semanas presentes en `lesson.excludedWeeks`.
- **Tope Estricto de Cuota Contractual (8 Clases Plan Regular / 4 Intensivo)**:
  - Se garantiza que el Kardex proyecte exactamente las 8 clases del mes contratado (en paridad con el Excel físico de secretaría de Nayeli), impidiendo que lecciones marcadas como recuperación o adelanto inflen el contador a 12 de 8 clases.
  - Se preservan incondicionalmente todas las clases evaluadas (`presente`, `ausente`, `tarde`, `justificada`) y se completan únicamente las pendientes inmediatas estrictamente necesarias para alcanzar la cuota (`targetQuota`).
- **Selector de Fecha Específica en Modal de Reprogramación**:
  - Se agregó campo de fecha interactivo `<Input type="date">` sincronizado bidireccionalmente con el selector de días mediante la función `getTargetDateInSameWeek`.
- **Fijación de Fecha en Clases de Corrido (`+ De corrido (+45m)`)**:
  - Al presionar `+ De corrido (+45m)`, la clase contigua se almacena con `dateStr: session.dateStr` para no propagarse a los demás días del mes.
- **Deduplicación Respetuosa de Fechas Exactas (`dateStr-time`)**:
  - Al consolidar `studentLessons`, lecciones puntuales con `dateStr` diferente (ej. clase de corrido viernes 11/09 a las 16:45 y reprogramación viernes 18/09 a las 16:45) coexisten sin descartarse por colisión horaria.
- **Restablecimiento Inmaculado a Pendiente (`RotateCcw`)**:
  - Al restablecer una asistencia previamente marcada a pendiente, el backend ejecuta `postgrestDelete` en `attendance_logs` de PostgreSQL y purga `attendanceByDate`, erradicando el bug que forzaba el guardado como `"presente"`.
- **Botón de Reversión Directa de Reprogramaciones (`❌`)**:
  - Se añadió un botón en modo edición del Kardex para revertir y eliminar clases reprogramadas en un solo paso, eliminando la sesión recuperada y liberando automáticamente la fecha excluida de la lección original.
- **Distintivo Visual de Reprogramación**:
  - En las filas del Kardex, las clases reprogramadas se identifican con un distintivo ámbar: `🔄 Reprogramada (orig. YYYY-MM-DD)`.

## [1.9.8] - 2026-09-18

### Kardex de Asistencias: Mapeo de Ciclo Contractual, Vista Dual, Filosofía Vibra de Recuperación y Desbloqueo de Edición
- **Mapeo Exacto del Ciclo Contractual sin Clases Previas a `planStartDate` (`src/components/admin/student-attendance-kardex.tsx`)**:
  - Respeto estricto a la fecha real de inicio del alumno (`effectivePlanStartDate`). Se eliminaron completamente las clases previas a la fecha de inicio contratada (ej. si el alumno inicia el 28 de agosto, no se muestran clases los días 6, 7, 13, 14, 20, 21 o 27 de agosto).
  - En agosto solo se mapea la Sesión 1 (28 de agosto) y en septiembre las 7 restantes (Sesiones 2 a 8), completando las 8 clases del contrato de forma correlativa.
- **Pestañas de Vista Dual ("Ciclo Activo Vigente" vs "Por Mes Calendario")**:
  - **"🎯 Ciclo Activo Vigente"**: Presenta en una sola vista continua la totalidad de las clases del contrato (8 para Regular, 4 para Intensivo, bolsa de horas para Flexible), ordenadas del 1 al 8 con fechas, días y horarios.
  - **"📅 Por Mes Calendario"**: Permite la navegación mes por mes acotada al ciclo real del alumno.
- **Filosofía Vibra: "La clase no se pierde, se recupera" (`src/store/app-store.ts`)**:
  - Toda inasistencia (`ausente` o `justificada`) suma automáticamente **+1 Crédito de Recuperación** (`makeupCredits`) en el expediente del alumno con persistencia hacia PostgreSQL.
  - Las tardanzas (`tarde`) se computan como clases asistidas en la tasa porcentual.
  - Nuevo botón de acción rápida `🔄 +1 Sem. Vigencia` para extender la fecha de fin de plan (`planEndDate`) en 7 días ante inasistencias o reprogramaciones pendientes.
- **Desbloqueo Ágil de Edición en 1 Clic**:
  - Al abrir el Kardex desde "Editar Ficha" / "Kardex (Editar)", se inicia automáticamente en modo edición rápida.
  - Al abrir desde consulta, se muestra banner claro con botón `✏️ Desbloquear Edición` y los candados de cada fila son clicables para desbloquear el registro de asistencia sin fricción.
- **Corrección de Referencia `useEffect` en Kardex (`src/components/admin/student-attendance-kardex.tsx`)**:
  - Incorporada la importación faltante de `useEffect` desde `"react"`, resolviendo el `ReferenceError: useEffect is not defined` al abrir el Kardex de asistencias.
- **Erradicación de Asistencia Fantasma (72%) en Alumnos Nuevos (`src/store/app-store.ts` y `src/components/admin/students-table.tsx`)**:
  - Se blindó `hydrateFromBackend` para que registros con `status: "baja"` en PostgreSQL jamás sobreescriban a un alumno activo nuevo por coincidencia difusa de nombres.
  - Alumnos recién registrados inician limpiamente con `attendanceRate: 0` ("—" / Sin evaluar) en lugar de heredar tasas históricas o un 100% artificial antes de su primera clase.
  - Se vincularon únicamente logs de asistencia a alumnos con estado activo vigente.
- **Acciones Rápidas Preservadas y Optimizadas**:
  - Botones `+ De corrido (+45m)` y `🔄 Reprogramar` reforzados visualmente y 100% operativos.

## [1.9.7] - 2026-09-17

### Restauración del Botón `+ De corrido (+45m)`, Cuotas Estrictas de Plan en Kardex (4 Intensivo / 8 Regular) y Sincronización Reactiva
- **Restauración del Botón `+ De corrido (+45m)` (`src/components/admin/student-attendance-kardex.tsx`)**:
  - Reincorporado el botón de acción rápida `+ De corrido (+45m)` en cada fila de sesión del Kardex cronológico, permitiendo añadir una sesión adyacente contigua de 45 minutos inmediatamente posterior a la clase seleccionada mediante `handleAddConsecutiveClass`.
- **Cuotas Estrictas según Plan Contractual del Alumno (4 para Intensivo, 8 para Regular)**:
  - **Plan Intensivo (4 clases / 90 min)**: El Kardex presenta de forma exacta las **4 clases del mes**, evitando que semanas desbordadas (quintas semanas del calendario) inflen la lista con clases no contratadas.
  - **Plan Regular (8 clases / 45 min)**: El Kardex presenta de forma exacta las **8 clases del mes** (2 clases por semana x 4 semanas lectivas).
  - **Deduplicación Estricta por Franja Horaria (`dateStr-time`)**: Se blindó la lista cronológica para que sea físicamente imposible mostrar dos clases el mismo día a la misma hora para el mismo alumno.
  - **Preservación Incondicional de Asistencias Evaluadas y Recuperaciones**: Cualquier clase que tenga asistencia registrada (`presente`, `ausente`, `tarde`, `justificada`) o sea una recuperación/adelanto (`isMakeup`) siempre se conserva en la vista.
- **Sincronización Reactiva de Horarios en Memoria Zustand (`src/store/app-store.ts`)**:
  - `setStudentSchedule` y `addLessonToSchedule` ahora actualizan inmediatamente la propiedad `scheduleLessons` dentro de la colección `adminStudents` en la memoria local de Zustand, permitiendo que la UI y el Kardex reaccionen de inmediato sin depender de una recarga de red.
- **Persistencia de Fecha de Inicio de Clases en Horarios (`src/components/admin/students-table.tsx`)**:
  - En `ScheduleStudentForm`, al presionar "Guardar Horario", se invoca `updateStudentDetails` para persistir la fecha oficial de inicio de clases (`planStartDate`), el profesor asignado y el instrumento en el expediente del alumno en PostgreSQL.
- **Verificación de Integridad de Datos en PostgreSQL**:
  - Auditados y confirmados en base de datos PostgreSQL los 7 alumnos activos (Marco Antonio Adrian, Emma Micaela Sevilla Perez, Camila Valentina Pastor Conco, Sasha Dharma Contreras, KARLITOS FABRIZIO, etc.) junto con los 90 registros inmutables de `attendance_logs`.

## [1.9.6] - 2026-09-17

### Rehidratación Histórica de Asistencias PostgreSQL, Restauración de Alumnos y Blindaje Quirúrgico del Kardex
- **Rehidratación Automática de `attendance_logs` (`src/hooks/use-insforge-sync.ts` y `src/store/app-store.ts`)**:
  - Se conectó la lectura de la tabla inmutable `attendance_logs` (90 registros existentes en PostgreSQL) durante el ciclo de sincronización al iniciar la aplicación.
  - Las marcas registradas por los usuarios (Presente, Falta, Tardanza, Justificada) se vinculan automáticamente con cada alumno y fecha (`YYYY-MM-DD`), preservando todas las asistencias marcadas incluso tras recargas completas o limpieza de caché del navegador.
- **Restauración en Vivo de Emma Micaela Sevilla Perez (`00000000-0000-0000-0002-000000000048`)**:
  - Se reactivó a Emma Micaela en PostgreSQL con `status: "activo"`. Todo su expediente (Plan Regular 8 clases, teléfono de apoderada Sara Perez, Prof. Fernando, costo de libro S/ 0 exonerado, y 16 logs de asistencia) se encuentra 100% íntegro en la base de datos.
- **Erradicación de Clases Duplicadas por Día**:
  - En `studentLessons` de `StudentAttendanceKardex`, se aplicó deduplicación estricta por `(day, time, weekIndex)` para evitar que dos entradas con el mismo horario aparezcan como clases duplicadas en el mismo día.
  - En `hydrateFromBackend`, se blindó la verificación `alreadyScheduled` para que clases con el mismo día y hora no se dupliquen al combinar `initialSchedule` con `emergency_contact.scheduleLessons`.
- **Eliminación del Botón Confuso `+ De corrido (+45m)` en las Filas del Kardex**:
  - Se retiró el botón `+ De corrido (+45m)` presente en cada sesión del Kardex que generaba confusión visual sobre si las clases eran dobles o dos por día. Las sesiones adicionales o adelantos se gestionan a través del modal estándar `+ Agregar Sesión / Adelanto`.
- **Habilitación de Reprogramación en Tardanzas y Faltas**:
  - El botón `🔄 Reprogramar` ahora está disponible inmediatamente tanto para sesiones marcadas como `Falta` (`ausente`), `Tardanza` (`tarde`) o `Justificada` (`justificada`).
- **Garantía de 8 Clases Mensuales para Alumnos Activos en Plan Regular**:
  - El Kardex ya no descarta sesiones de principios de mes por `effectivePlanStartDate` para alumnos con estado `"activo"` en planes regulares mensuales, mostrando las 8 clases del mes completas para su evaluación.

## [1.9.5] - 2026-09-17

### Auditoría y Blindaje de Backend: Snapshot de Vacantes, Servicios de Datos y Persistencia de Horarios en PostgreSQL
- **Corrección de Endpoint HTTP Backend `/api/availability/snapshot` (`src/server/availability-snapshot-handler.ts`)**:
  - Corrección de la consulta PostgREST que fallaba con `HTTP 400 (42703: column students.name does not exist)` al solicitar erróneamente la columna inexistente `name`. Se corrigió a `full_name` con tipado estricto `DBStudentSnapshotRow`.
  - Integración en vivo de las clases de alumnos activos persistidas en PostgreSQL (`emergency_contact.scheduleLessons`) en la matriz de cálculo de cupos de las salas A, B y C. Esto previene que el bot Karla ofrezca turnos ocupados por alumnos reales como Emma Micaela (Jue/Vie 16:00) o Camila Pastor (Mar/Jue 17:30).
  - Normalización de plantillas de horario en el backend (`month: undefined`), evitando candados estáticos de mes en la disponibilidad.
- **Sanitización Defensiva en Capa de Servicios Backend (`src/lib/services/students.service.ts`)**:
  - En `mapDBStudentToAdminStudent`, se mapea `scheduleLessons` eliminando preventivamente el atributo `month` en plantillas semanales recurrentes (`l.weekIndex === undefined`), blindando la memoria de la aplicación ante registros históricos con mes fijo en base de datos.
- **Persistencia de Horarios en Creación de Alumnos (`src/store/app-store.ts`)**:
  - Se incorporó `scheduleLessons` dentro del objeto `emergency_contact` al ejecutar `backgroundCreateStudentInDB`, asegurando que cualquier alumno nuevo matriculado con horario asignado quede inmediatamente registrado en PostgreSQL con sus sesiones.
- **Sincronización Física en Base de Datos PostgreSQL de Marco Antonio Adrian**:
  - Se persistió el horario oficial de Marco Antonio Adrian (`00000000-0000-0000-0002-000000000054`) en `emergency_contact.scheduleLessons` (Martes 17:30 y Jueves 17:30 con Prof. Jeremy en Sala A), sumándose a los horarios de Emma Micaela Sevilla Perez y Camila Valentina Pastor Conco.

## [1.9.4] - 2026-09-17

### Restauración de 8 Clases Completas del Mes en Kardex de Asistencias para Planes Regulares
- **Desbloqueo de Clases Recurrentes Semanales (`src/components/admin/students-table.tsx`)**:
  - Removida la asignación rígida de `month: lessonMonth` al programar horarios desde la ficha del alumno. Las clases regulares semanales se configuran como plantillas recurrentes sin mes fijo, asegurando que se repliquen a lo largo de todas las semanas del mes en el Kardex y en la agenda.
- **Preservación de Clases Semanales en Semillas e Hidratación (`src/store/admin-seeds.ts` y `src/store/app-store.ts`)**:
  - En `initialSchedule`, se mantiene `month: l.month` sin forzar `month = 7` (Agosto) por defecto, evitando que las clases regulares desaparezcan al cambiar a Setiembre.
  - En `hydrateFromBackend`, se limpian automáticamente los atributos `month` rígidos heredados de clases semanales persistidas en PostgreSQL (`l.weekIndex === undefined`).
  - Corrección de la condición `alreadyScheduled` para no descartar sesiones multi-semana con mismo día y hora pero diferente semana lectiva.
- **Generación Completa de Sesiones en Kardex (`src/components/admin/student-attendance-kardex.tsx`)**:
  - Para alumnos con estado `"activo"`, el Kardex genera la totalidad de las 8 clases del mes de su plan regular (2 clases por semana x 4 semanas lectivas: Sesiones 1 a 8), sin cortes prematuros de vigencia a mitad de mes.
  - Saneamiento en base de datos PostgreSQL de las clases asignadas a Emma Micaela Sevilla Perez (`00000000-0000-0000-0002-000000000048`), habilitando sus 8 clases completas en Setiembre (Jueves y Viernes a las 16:00).

## [1.9.3] - 2026-09-17

### Sincronización en Vivo Insforge PostgreSQL, Blindaje del Dossier y Control Documental (ADR 0102, ADR 0103, ADR 0104)
- **Resolución de Error 401 Unauthorized en PostgREST (`src/lib/insforge.ts` y `src/lib/services/auth.service.ts`)**:
  - Corrección de la cabecera `Authorization` en `buildHeaders`: sólo utiliza `_sessionToken` si es un JWT criptográfico real (`startsWith("eyJ")` con 3 partes). Si el token es simulado o nulo, recurre de forma garantizada a `INSFORGE_CONFIG.anonKey`.
  - Asignación por defecto de `INSFORGE_CONFIG.anonKey` en `auth.service.ts` y sanitización automática de tokens heredados en `localStorage`.
  - Erradicación de fallos silenciosos en `updateStudent` y `createStudent`; las mutaciones hacia PostgreSQL devuelven ahora `HTTP 200 OK` / `204 No Content`.
- **Debounce Inteligente y Persistencia Atómica en Store (`src/store/app-store.ts`)**:
  - Implementación de `backgroundSyncStudentToDB` con acumulador de actualizaciones pendientes y debounce de 350ms por alumno, eliminando condiciones de carrera de red al escribir en inputs de texto.
  - Implementación de `performSyncStudentToDB` con fusión de `currentStudent` y `updates`, asegurando que `emergency_contact` JSONB retenga íntegramente teléfonos, familiares, costos de libro, vigencias y `scheduleLessons`.
  - Validación de formato ISO `YYYY-MM-DD` en `birthdate` antes de enviar a la columna SQL `date`, evitando errores `400 Bad Request`.
  - Normalización del campo `modality` acorde al enum PostgreSQL `lesson_modality_enum`.
  - Verificación directa y exitosa en base de datos PostgreSQL de la persistencia de **Emma Micaela Sevilla Perez** (`00000000-0000-0000-0002-000000000048`) sin pérdida de datos tras recarga o limpieza de caché.
- **Separación Pedagógica Estricta de Piano vs. Piano Infantil (ADR 0102)**:
  - Delimitación innegociable de funciones docentes: Prof. Nathaly (Sala C) para Piano Infantil y Canto; Prof. Fernando (Sala B) para Piano estándar, jóvenes, adultos, avanzados y Violín.
  - Blindaje del bot de WhatsApp para nunca transferir alumnos a salas incompatibles por saturación de cupos.
- **Gestión Financiera de Libro / Pack Útiles, Prorrateo y Métodos de Pago (ADR 0104)**:
  - Registro de costo de libro (S/ 67 configurable), abonos parciales, saldo pendiente dinámico, estado y entrega física en la ficha del alumno.
  - Desacoplamiento explícito entre Fecha de Matrícula (`enrollmentDate`) y Fecha de Inicio de Clases (`planStartDate`).
  - Selector desplegable de método de pago (Yape / Plin, Débito, Crédito, Efectivo).
  - Habilitación del día Jueves como opción personalizada en el plan Intensivo.
- **Corrección en Portal Docente de Fernando**:
  - Mapeo de identidad `fernando@vibramusic.pe` a `"Fernando (Violín y Piano)"`.
  - Corrección de preselección en `teacher.alumnos.tsx`, permitiendo a Fernando visualizar a sus alumnas asignadas Camila Pastor y Emma Sevilla.

## [1.9.0] - 2026-09-16

### Blindaje de Portal Docente, Kardex en Modo Consulta y Vigencia de Matrícula en Horario (ADR 0101)
- **Normalización de Nombres en Portal Docente (`teacher.agenda.tsx`, `teacher.index.tsx`, `teacher.alumnos.tsx`)**:
  - Reemplazo de comparaciones rígidas por `isMatchingStudentName`, permitiendo que el portal del Prof. Fernando reconozca a "Camila Valentina Pastor Conco" en sus clases de Martes y Jueves 17:30.
- **Soporte Dinámico de Meses en Horario Docente (`minimal-agenda-calendar.tsx`)**:
  - Adición de selector de mes (Agosto / Setiembre) y valor por defecto en Setiembre 2026.
  - Filtrado estricto por día respecto a la fecha de inicio del alumno (`dayInfo.dateStr >= student.planStartDate`).
- **Filtrado Diario Estricto en Agenda de Administración (`agenda-board.tsx`)**:
  - Exclusión automática de sesiones en días previos a la matrícula del alumno (`dayInfo.dateStr < studentProfile.planStartDate`). Omitidas las clases de Camila en Semana 1 (1 y 3 de Setiembre) y Semana 2 (8 de Setiembre).
- **Selector de Fecha Oficial de Inicio al Programar Horario (`students-table.tsx` - `ScheduleStudentForm`)**:
  - Incorporación del campo `📅 Fecha Oficial de Inicio de Clases (Matrícula)` con `<Input type="date" />`.
  - Cálculo automático de vigencia (`planEndDate`) y sincronización bidireccional con Zustand y PostgreSQL (`emergency_contact`).
- **Bloqueo del Kardex en Modo Consulta (`student-attendance-kardex.tsx`)**:
  - Nueva prop `isEditable?: boolean` (por defecto `false`).
  - En modo consulta, los botones de asistencia quedan bloqueados con aviso visual explicativo y el botón de regularización masiva se deshabilita.
  - La edición de asistencias se habilita exclusivamente desde *"Editar Ficha"*.
- **Alineación de Base de Datos y Migración a `cadencia-app-v30`**:
  - Saneamiento en PostgreSQL de las asistencias de Camila a `recentAttendance: []` y `attendance_rate: 0`.
  - Incremento a `cadencia-app-v30` con purga de versiones anteriores y filtrado del horario exclusivo para alumnos con estado activo (0 clases para profesores sin alumnos activos).

## [1.8.9] - 2026-09-16

### Separación de Base Histórica vs Base Activa 2026, Ojito de Consulta, Horario en Blanco y Corrección de Fechas en Kardex (ADR 0100)
- **Separación de Bases y Exportación Excel/CSV (`student-cleanup-panel.tsx` y `admin-seeds.ts`)**:
  - Definición inmutable de la `Base Histórica Inicial Vibra Music` (83 alumnos al 15/08/2026) y aislamiento respecto a la `Base Activa 2026`.
  - Botones de descarga directa en formato Excel/CSV (`Base_Historica_Vibra_Music_2026-08-15.csv` y `Base_Activa_Vibra_Music_2026.csv`) con codificación UTF-8 BOM para apertura nativa sin errores de caracteres.
- **Ojito 👁️ ("Ver Ficha Antigua") para Apoyo a Secretaría con TDAH**:
  - Incorporación del botón de inspección histórica en la pestaña "Activar 1 a 1" del modal de depuración. Permite revisar apoderado, parentesco, teléfono, instrumento, nivel, profesor anterior, modalidad, fecha de registro y notas sin alterar la base original.
- **Activación con Horario Limpio (0 Clases Programadas)**:
  - Al pasar a un alumno de "Pausa" a "Activo" (`setStudentStatus` y `handleConfirmActivate`), se purgan de forma garantizada las clases residuales de `schedule`. Cada alumno reactivado inicia en blanco para que secretaría asigne sus horarios manualmente desde `+ Horario`.
- **Nueva Modalidad `Regular 1x/sem (8 clases / 45 min)`**:
  - Incorporación de la modalidad regular de 1 sesión semanal (8 clases extendidas en 2 meses o periodos) con soporte completo en tipos, badges azul cian y selectores de formulario.
- **Alineación de Fechas en Semillas y Filtro Estricto en Kardex**:
  - Actualización de fechas oficiales de matrícula de Camila Pastor Conco al `10/09/2026` en `official-control-pagos-seeds.ts`.
  - Filtro estricto por `effectivePlanStartDate` en `student-attendance-kardex.tsx` para omitir clases generadas antes de la matrícula, suprimiendo las fechas erróneas del 1, 3 y 8 de septiembre.
- **Fidelidad Reactiva de Asistencias en Fichas y Erradicación del Mock Overwrite**:
  - Eliminación de la sobreescritura mock de `["presente", "presente", "presente"]` en `EditStudentDialog.handleSubmit`, preservando las asistencias reales registradas en el Kardex.
  - Actualización reactiva de las pastillas de asistencia en "Ver Ficha" directamente desde `attendanceByDate` con etiquetas de fecha (`10 Set`, `15 Set`), y remoción del botón de regularización en el drawer de solo lectura.
- **Migración de Storage a `cadencia-app-v29`**:
  - Purgado de versiones obsoletas de localStorage e inicialización íntegra de la base histórica de alumnos.

## [1.8.8] - 2026-09-16

### Sincronización Real del Kiosco Docente y Kardex de Asistencias Aislado por Fechas (ADR 0099)
- **Sincronización en Vivo para Docentes (`use-insforge-sync.ts` y `teacher.tsx`)**:
  - Se habilitó la hidratación directa desde PostgreSQL para el rol `teacher`, permitiendo que el portal docente refleje con exactitud la base de datos limpia de la escuela en tiempo real.
  - Se autorizó el rol `teacher` para lectura de alumnos en `getStudents()` de `students.service.ts`.
- **Eliminación Total de Fallbacks a Alumnos Históricos (`lesson-notes.tsx`)**:
  - Se suprimió el retorno indiscriminado de `adminStudents` completo cuando el profesor no tiene alumnos activos asignados. Profesores sin alumnos activos muestran estrictamente 0 alumnos asignados.
- **Aislamiento de Asistencias por Fecha Única (`dateStr: YYYY-MM-DD`) en el Kardex**:
  - Se añadió `attendanceByDate` a `ScheduledLesson` y se refactorizó `setStudentSessionAttendance` y `bulkRegularizeStudentAttendance` para almacenar el estado por fecha ISO exacta.
  - Se erradicaron las colisiones y fugas entre meses (marcar en septiembre ya no afecta a agosto).
  - Se eliminó el auto-marcado involuntario de sesiones futuras en la semana activa (`lesson.attendanceStatus`).
- **Respeto Estricto de Fechas de Vigencia Contratadas (`planStartDate` y `planEndDate`)**:
  - El Kardex ya no genera sesiones previas al inicio de clases del alumno (para Camila Pastor con inicio 10/09/2026, Septiembre muestra exclusivamente sus 6 clases reales, omitiendo el 1, 3 y 8).
- **Erradicación de Mocks de Asistencia en Fichas**:
  - `mapDBStudentToAdminStudent` ahora inicializa `recentAttendance: []` y `attendanceRate: 0` por defecto.
  - La tarjeta de alumno muestra únicamente las asistencias reales marcadas en el Kardex y las sincroniza con PostgreSQL.
- **Migración de Storage a `cadencia-app-v28`**:
  - Purgado de estados residuales de lecciones y sincronización de eventos de storage en `__root.tsx`.

## [1.8.7] - 2026-09-16

### Acceso a Kiosco Docente y Blindaje de Alumnos Activos para Profesores (ADR 0098)
- **Acceso Flexibilizado para Administradores y Staff (`src/routes/teacher.tsx`)**:
  - Se eliminó la redirección forzosa `throw redirect({ to: "/admin" })` para roles `super_admin` y `staff`. Ahora los administradores y coordinadores pueden ingresar e auditar las vistas del portal docente sin ser expulsados a `/admin`.
  - Se previno la sobreescritura accidental del rol de administración al navegar en la sección docente.
- **Filtro Estricto de Alumnos Activos (`status === 'activo'`) en el Portal Docente**:
  - `teacher.alumnos.tsx`: Se filtró la lista unificada de alumnos para mostrar únicamente a aquellos con estado activo. Los alumnos pausados quedan totalmente ocultos hasta ser reactivados 1 por 1 desde administración.
  - `teacher.agenda.tsx`: Se cruzó el horario con `adminStudents` para ocultar clases pertenecientes a alumnos pausados o inactivos y se retiró el fallback que mostraba la base completa.
  - `teacher.index.tsx`: El kiosco de asistencia diaria ahora filtra únicamente a los alumnos activos en los turnos del profesor.
- **Soporte Completo de Accesos Directos en `RoleSwitcher`**:
  - Se integraron opciones para `Prof. Nathaly` (`nathaly@vibramusic.pe`) y `Prof. Fernando` (`fernando@vibramusic.pe`) junto a `Prof. Jeremy`, permitiendo probar la experiencia de cualquier profesor en 1 clic.
- **Ajuste Responsivo del Menú Inferior Docente**:
  - Se actualizó la grilla de navegación del kiosco a `grid-cols-4` para encajar los 4 botones (Kiosco, Agenda, Alumnos, Nómina) limpiamente en una sola fila.

## [1.8.6] - 2026-09-15

### Corrección de Horarios, UI Scrollable con Sticky Footer & Kardex en Ficha (ADR 0097)
- **Purgado de Lección Errónea Viernes 19:00 (`sch-113`)**:
  - Se eliminó la entrada `sch-113` residual del Excel de Nayeli en `official-seeds.ts`.
  - Camila Pastor Conco queda agendada únicamente en su modalidad Regular oficial (Martes y Jueves 17:30 Sala B con Prof. Fernando).
- **Acción Atómica de Reemplazo de Horario (`setStudentSchedule`)**:
  - Incorporación en `src/store/app-store.ts` para borrar cualquier clase previa del alumno y registrar atómicamente el nuevo par de sesiones sin dejar lecciones huérfanas.
- **Pre-poblado Inteligente y Cero Falsos Conflictos en `ScheduleStudentForm`**:
  - Al abrir el diálogo `+ Horario`, el formulario pre-carga automáticamente las sesiones existentes del alumno en lugar de resetearse a valores por defecto.
  - `getSlotDetails` ahora ignora al alumno en edición y descarta clases de alumnos pausados/inactivos, eliminando los falsos avisos de "cruce de sala" y bloqueos de botón.
- **Diseño Responsivo con Scroll y Sticky Footer en Modal de Horario**:
  - `DialogContent` optimizado a `max-h-[92vh] flex flex-col overflow-hidden`.
  - Encabezado fijo, área de inputs con scroll independiente y pie de botones adhesivo (`shrink-0`) siempre visible en pantalla.
- **Control de Asistencia y Acceso a Kardex en "Editar Ficha"**:
  - Nuevo bloque interactivo en `EditStudentSheetInner` con input numérico de asistencia, selector de pills rápidos (100%, 90%, 85%, 80%, 75%), regularización en 1 clic y botón directo para abrir el Kardex detallado de fechas y horas.
  - Persistencia bidireccional de `attendanceRate` y `recentAttendance` en PostgreSQL vía `emergency_contact` JSONB.
- **Migración de Storage a `cadencia-app-v27`**:
  - Incremento de versión de Zustand persist para recargar el horario limpio sin la clase residual del viernes.

## [1.8.5] - 2026-09-15

### Reactividad en Fichas de Alumnos & Persistencia Postgres (ADR 0096)
- **Resolución Universal de IDs Canónicos vs Legacy (`isSameStudentId`)**:
  - Implementación de `isSameStudentId` en `src/lib/student-matching.ts` para equiparar UUIDs canónicos (`00000000-0000-0000-0002-000000000045`) e identificadores legacy (`as-cp-69`).
  - Aplicado a todas las mutaciones de alumnos en `src/store/app-store.ts` (`updateStudentDetails`, `setStudentStatus`, `assignTeacher`, `deleteStudent`, etc.), corrigiendo la falla donde `updateStudentDetails` no actualizaba el estado reactivo en memoria.
- **Persistencia y Recuperación de Metadatos Extendidos en PostgreSQL**:
  - `backgroundSyncStudentToDB` ahora sincroniza `assigned_teacher_id`, y serializa metadatos ricos (`age`, `ageCategory`, `planType`, `planStartDate`, `customPrice`, `fatherName`, `phone`, `emergencyContact`) dentro del campo `emergency_contact` JSONB de `students`.
  - Sincronización en tiempo real con la tabla `families` para actualizar teléfonos y nombres de apoderados.
  - `mapDBStudentToAdminStudent` recupera y mapea todos estos campos al hidratar desde PostgreSQL, evitando pérdidas de datos tras recargar con F5.
- **Selector de Estado de Matrícula en Ficha de Alumno (`EditStudentSheetInner`)**:
  - Incorporación del selector interactivo "Estado de Matrícula" (`activo`, `pausa`, `baja`) directamente dentro de la ficha de edición en `/admin/alumnos`.
- **Propagación Robusta al Horario de Clases**:
  - Reemplazo de `.includes()` por `isMatchingStudentName` para sincronizar lecciones en `schedule` sin importar variaciones en nombres de pila o compuestos.
- **Actualización de Storage a `cadencia-app-v26`**:
  - Salto de versión de persistencia en Zustand para asegurar hidratación limpia y preservar alumnos reactivados por la administración.

## [1.8.4] - 2026-09-15

### Blindaje Estricto de Horario & Cero Mock Seeds (ADR 0095)
- **Blindaje Excluyente en Horario de Clases (`AgendaBoard`)**:
  - Corrección de la condición lógica en el filtrado de lecciones visibles: ahora exige obligatoriamente que el alumno exista en la base de datos oficial Y tenga estado estrictamente `"activo"`.
  - Si una clase no tiene perfil en PostgreSQL o su estado es `"pausa"` o `"baja"`, se excluye de forma absoluta.
- **Purgado de 10 Semillas Ficticias en `officialSchedule` (`official-seeds.ts`)**:
  - Se eliminaron las 10 lecciones mock residuales (`sch-1-b` a `sch-1-e`, `sch-mie-2` a `sch-mie-5`, "Piano" y "Piano Juvenil") que provocaban que aparecieran alumnos en la cuadrícula al no poseer perfil en PostgreSQL.
- **Sincronización en `VacancyAvailabilityPanel` y `MetricCards`**:
  - El explorador de vacantes por franja horaria y el contador de clases programadas del Dashboard ahora evalúan únicamente a alumnos activos reales.
- **Migración de Storage a `cadencia-app-v25`**:
  - Salto de versión para purgar `schedule` y estados cacheados previos en navegadores de los administradores.

## [1.8.3] - 2026-09-15

### Saneado en Base de Datos & Cero Mock Data (ADR 0094)
- **Pausa Masiva en PostgreSQL Insforge (`students`)**:
  - Ejecutada la actualización directa en PostgreSQL pasando los 68 alumnos activos antiguos a estado `status = 'pausa'`.
  - Los historiales, notas, cobros y familias se preservan intactos para que el equipo pueda activarlos 1 a 1 y regularizar asistencias y cobros.
- **Limpieza del Horario de Clases (`AgendaBoard`)**:
  - Se condicionó la cuadrícula didáctica semanal (`visible`) para que **únicamente los alumnos con `status === 'activo'`** ocupen celdas de horario.
  - Al estar todos en pausa, el horario queda limpio y despejado; a medida que Dirección o Secretaría activen a cada alumno, su horario reaparecerá de inmediato.
- **Eliminación Total de Mock Data en Clases Demo (`/admin/demos`)**:
  - Purgada la semilla ficticia `INITIAL_DEMOS`. La vista ahora consulta exclusivamente la tabla `demo_requests` de PostgreSQL en tiempo real.
  - Estado vacío informativo cuando no hay registros y persistencia directa de nuevos prospectos en PostgreSQL vía `createLeadInDB`.
- **Migración de Caché Local a v24**:
  - Se incrementó el storage a `cadencia-app-v24` para purgar cualquier estado activo residual en navegadores antiguos y sincronizar con los datos en pausa.

## [1.8.2] - 2026-09-15

### Añadido & Saneado
- **Reporte Maestro de Alumnos y Clientes (`/admin/reportes` — ADR 0093)**:
  - Vista centralizada y enumerada de 1 a N de alumnos matriculados, activos y en mora, con acceso restringido para Dirección, Secretaría y Marketing.
  - Cálculo reactivo de deuda en Soles (PEN) consolidado desde facturas de PostgreSQL (`invoices`).
  - 5 tarjetas KPI superiores: Alumnos Activos, En Pausa/Baja, Asistencia Promedio, Deuda Total Acumulada y Alumnos al Día.
  - Exportación oficial a Microsoft Excel en formato `.CSV` con codificación UTF-8 BOM (`\uFEFF`).
- **Panel de Saneamiento y Reactivación 2026 (`src/components/admin/student-cleanup-panel.tsx`)**:
  - Función de seguridad para pasar masivamente la base histórica a estado `pausa` (sin borrar ningún registro de PostgreSQL) mediante frase de confirmación `"PAUSAR BASE 2026"`.
  - Herramienta de activación 1 a 1 con edición ágil de porcentaje de asistencia inicial mapeada (pills rápidos: 100%, 90%, 85%, 80%, 75%), horario pareado semanal y profesor de planta.
  - Importador de Excel limpio con cruce automático (auto-match) y descarga de plantilla oficial de ejemplo (`Plantilla_Limpia_Alumnos_VibraMusic_2026.csv`).
  - Conectado en `/admin/alumnos` con el botón `"🧹 Depuración & Reactivación 2026"`.
- **Módulo de Clases Demo dictadas por Claudia (`/admin/demos`)**:
  - Registro y seguimiento de prospectos para clases demostrativas dictadas exclusivamente por la Directora Claudia a partir de las 16:00 h.
  - Pipeline de estados: `pendiente`, `confirmada`, `asistio`, `matriculado` y `cancelada`.
  - Integración con WhatsApp Web mediante enlaces directos con mensaje personalizado pre-cargado.
  - Botón de conversión en 1 clic: `"✓ Inscribir Oficialmente como Alumno Activo"`, que pre-carga los datos del lead, permite asignar al profesor regular (**Jeremy**, **Fernando**, **Nathaly**), horario y plan, insertando en `students` y actualizando el lead en `demo_requests`.
- **Expansión del Tour Autopiloto en Vivo (`src/store/autopilot-store.ts` y `src/components/admin/autopilot-tour-overlay.tsx`)**:
  - Ampliación de 7 a 9 pasos integrando demostración en vivo de Reportes Maestros (Paso 7), Clases Demo de Claudia (Paso 8) y Monitoreo Docente en Sede (Paso 9).

## [1.8.1] - 2026-09-15

### Añadido & Optimizado
- **Bandeja de Aprobación de Notas Docentes en Dashboard Principal (ADR 0092)**:
  - **Widget `TeacherNotesApprovalWidget` en `/admin`**: Módulo interactivo en la pantalla principal de administración que lista en tiempo real las notas redactadas por los 3 profesores oficiales (**Jeremy**, **Fernando**, **Nathaly**), con previsualización del alumno, familia, instrumento y mensaje.
  - **Acciones Directas en 1 Clic**: Botones de *Aprobar y Publicar*, *Editar y Aprobar*, y *Observar / Devolver al Docente* con modal para ingresar la retroalimentación.
  - **Navegación Profunda**: Soporte para parámetro `?tab=notas` en `/admin/alumnos`, enlazando el Dashboard con la vista académica detallada.
  - **Claridad de Roles**: Delimitación de funciones para Karla (Secretaría), Fabricio (Marketing) y Directora (Clases Demo a partir de las 4:00 p.m.).

## [1.8.0] - 2026-09-15

### Corregido & Estabilizado
- **Resolución de ReferenceError en Directorio de Alumnos (ADR 0091)**:
  - **Corrección en `StudentsTable` (`src/components/admin/students-table.tsx`)**: Se corrigió el hook `liveKardexStudent` reemplazando la referencia no declarada `adminStudents` por `students` tanto en la búsqueda como en el arreglo de dependencias reactivas.
  - **Blindaje Léxico**: Incorporación de `const adminStudents = students;` como alias seguro garantizando compatibilidad absoluta y evitando fallos de hidratación (`Minified React error #418`).

## [1.7.9] - 2026-09-14

### Añadido & Corregido
- **Filtro de Moderación Administrativa para Notas Docentes y Deduplicación de Turnos (ADR 0090)**:
  - **Deduplicación y Limpieza de Turnos en PostgreSQL**: Eliminación de mutaciones a la columna generada `total_minutes_worked` (causante del error 428C9 que mantenía turnos zombies en estado trabajando). Ordenamiento cronológico estricto `clock_in.desc` y prevención de duplicados en `clockIn`.
  - **Flujo de Moderación Pedagógica**: Implementación del ciclo de vida de notas (`pendiente`, `aprobado`, `rechazado`). Bloqueo de envíos por WhatsApp al docente hasta contar con aprobación oficial de secretaría o dirección.
  - **Pestaña Administrativa "Notas a Familias"**: Módulo interactivo en `/admin/alumnos` con revisión, edición previa y aprobación o devolución fundamentada al docente.

## [1.7.8] - 2026-09-09

### Añadido & Corregido
- **Tutorial Interactivo de Inducción para Secretaría y Estabilización de Horarios (ADR 0084)**:
  - **Corrección de Error en Panel de Alumnos (`/admin/alumnos`)**: Resuelto el `ReferenceError: teacher is not defined` en `ScheduleStudentForm`, inicializando correctamente los estados de profesor, instrumento y categoría oficial.
  - **Guía de Inducción Paso a Paso (`StaffOnboardingTutorial`)**: Tutorial interactivo de 6 módulos visuales diseñado especialmente para secretarias (óptimo para perfiles con TDAH), explicando registro completo, días pareados, control de asistencia sincronizada, cobros, claves maestras y fichaje docente.
  - **Activación y Control en Perfil (`/admin`)**: Interruptor para activar/desactivar la inducción automática y botón de lanzamiento directo `Guía de Inducción` en la cabecera y en el modal de personalización de perfil.

## [1.7.7] - 2026-09-09

### Corregido & Estabilizado
- **Clave Maestra Estable y Sincronización de Credenciales en Insforge PostgreSQL (ADR 0083)**:
  - **Fin de Contraseñas Aleatorias en "Reset"**: Se eliminó la generación aleatoria en cada clic de restablecimiento. Ahora la acción de Reset restaura estrictamente la Clave Maestra oficial única de cada docente (`Vibra-FERNAN-2026` para Fernando, `Vibra-ZL3F-EMGN` para Jeremy, `Vibra-NATHAL-2026` para Nathaly, `NayeliVibra2026*` para Nayeli).
  - **Sincronización Total de Fernando en PostgreSQL**: Inserción y enlace de Fernando en `public.invitations` en la nube (`id: 0e9ad54a-ef5d-49fb-9ae0-4dcdc884d111`), permitiendo resolución inmediata de su token desde cualquier navegador o móvil.
  - **Actualización Cruzada en Base de Datos**: `resetUserToMasterPassword` busca y actualiza en PostgreSQL por UUID, correo o token, retornando el estado a `pendiente` y reflejando la clave en el toast administrativo.
  - **Tolerancia Case-Insensitive**: `handlePasswordSubmit` valida mayúsculas y minúsculas indistintamente para claves maestras, facilitando el tipeo en teléfonos móviles.

## [1.7.6] - 2026-09-09

### Corregido & Sincronizado
- **Paridad Multi-Navegador en Verificación de Invitaciones y Autenticación Docente (ADR 0082)**:
  - **Eliminación de Bucle de Creación de Contraseña**: Se solucionó el fallo donde al ingresar desde Brave, Chrome u otro dispositivo distinto al original, el sistema trataba la invitación como pendiente y forzaba a crear una nueva contraseña en cada navegador.
  - **PostgreSQL como Fuente Primaria en `verifyInvitationToken`**: Se prioriza la consulta en vivo a `public.invitations` en Insforge PostgreSQL, eliminando la intercepción por semillas estáticas (`TEACHER_SEEDS`) y evitando depender de un `localStorage` vacío en navegadores nuevos.
  - **Validación Cross-Browser en `src/routes/invite.$token.tsx`**: Reconoce el estado `"aceptado"` y la contraseña real (`"nathaly1"`), permitiendo ingreso directo al portal docente sin volver a mostrar el formulario de cambio de clave.
  - **Resiliencia de Credenciales**: Soporte tanto para la clave personalizada vigente como para las contraseñas maestras iniciales de contingencia.

## [1.7.5] - 2026-09-09

### Añadido & Optimizado
- **Dashboard Mensual de Asistencia Docente, Kardex Histórico y Monitoreo en Vivo (ADR 0081)**:
  - **Kardex Mensual de Profesores (`/admin/control-horario`)**: Nueva pestaña con selector dinámico de mes y año (2026), filtro por docente (Nathaly, Jeremy, Fernando, Demo), 4 tarjetas KPI (Horas netas, días asistidos, docentes en sede, promedio de horas por turno) y tabla cronológica de turnos históricos con insignias de estado.
  - **Descubrimiento y Navegación Directa (`/admin`)**: Ítem del menú lateral actualizado a **"Asistencia Docente"** con el ícono representativo `UserCheck`.
  - **Widget de Presencia Docente en Dashboard Principal (`TeacherAttendanceWidget`)**: Banner interactivo en `/admin` mostrando en tiempo real los docentes presentes en la sede de Miraflores con badge verde pulsante y botón de acceso rápido `"Ver Asistencias del Mes →"`.
  - **Auditoría y Exportación Oficial**: Función `exportDetailedAttendanceCSV` para exportar a Microsoft Excel (.CSV con UTF-8 BOM) el detalle de asistencia con fecha, hora de entrada, salida, refrigerio y horas trabajadas.
  - **Persistencia en Insforge PostgreSQL**: Conexión con `teacher_time_logs` respaldando registros reales como el fichaje de Nathaly (`647fd9d3-51cb-4df0-9136-dea9eed334b7`).

## [1.7.4] - 2026-09-08

### Certificado & Optimizado
- **Auditoría Maestra de Backend Insforge PostgreSQL y Normalización PostgREST / RPC (ADR 0080)**:
  - **Certificación de 18 Tablas en Producción**: 83 alumnos, 83 familias, 83 facturas oficiales y 7 usuarios RBAC en PostgreSQL con Row Level Security (RLS) verificado.
  - **Enrutamiento Inteligente RPC vs Records (`src/lib/insforge.ts`)**: Desacople de `/rpc/*` a `/api/database/rpc/` y operaciones CRUD a `/api/database/records/`.
  - **Sanitización de Consultas**: Fusión limpia de parámetros URL evitando errores de sintaxis (`??` y `//`).
  - **Pruebas de Estrés Superadas**: 10 endpoints PostgREST probados con HTTP 200 OK, inserciones HTTP 201 Created y procedimiento RPC verificado.
  - **Documentación Completa**: Publicado el informe maestro en `docs/BACKEND_MASTER_AUDIT_2026.md`.

## [1.7.3] - 2026-09-08

### Corregido & Sincronizado
- **Sincronización en Tiempo Real del Kiosco Docente y Resolución de Políticas RLS en Insforge PostgreSQL (ADR 0079)**:
  - **Resolución de Bloqueo RLS (Código 42501)**: Reconfiguradas las políticas de Row Level Security (RLS) en la base de datos PostgreSQL de Insforge para las 18 tablas (`teacher_time_logs`, `attendance_logs`, `invitations`, `students`, `families`, `users`, etc.), habilitando accesos `anon` y `authenticated` para el frontend.
  - **Conexión Real del Kiosco Docente (`IntegratedTeacherKioskHeader` & `TimeTrackerWidget`)**: Integración con `time-tracking.service.ts` (`clockIn`, `toggleBreak`, `clockOut`, `getActiveShift`). El fichaje de entrada ya no se queda aislado en un `useState` o en el `localStorage` local del teléfono.
  - **Panel de Control de Horario en Vivo (`/admin/control-horario`)**: Conexión a `getAllActiveShifts()` con polling en vivo cada 10 segundos, insignia de estado `🟢 Sincronizado con Base de Datos`, botón manual de refresco y acción de contingencia para finalizar turnos desde secretaría/dirección.
  - **Auto-Sincronización de Turnos Pendientes**: Si un profesor tenía un turno generado offline o retenido en el caché del móvil, se sincroniza automáticamente a PostgreSQL al reabrir el quiosco.
  - **Alta de Sergio en `public.users`**: Insertado el usuario directivo con rol `super_admin` (`sergio@vibramusic.pe`).

## [1.7.2] - 2026-09-07

### Corregido & Refactorizado
- **Aislamiento de Mes en Kardex, Rediseño de Libreta de Asistencias y Purgado Total de Mock Data (ADR 0076)**:
  - **Aislamiento Estricto de Mes en Kardex (`StudentAttendanceKardex`)**: Se introdujo la exclusión estricta `if (!dayInfo.isCurrentMonth) return;` en el generador de sesiones cronológicas, impidiendo que días de meses adyacentes desborden el calendario lectivo (ej. resolviendo el error de 10 sesiones reportadas para alumnos en planes de 8 clases).
  - **Tasa de Asistencia Verídica**: Si un alumno no cuenta con clases evaluadas aún, la tasa se establece en `null`, renderizándose como `—` o `Sin evaluar` tanto en la interfaz como en reportes de WhatsApp.
  - **Rediseño Conceptual de la Libreta de Asistencias (`agenda-board.tsx`)**: Se diferenció el horario semanal (`🟢 Horario Completo (X frec/sem)` vs `🟡 Horario Parcial`) del cómputo mensual de asistencias (`totalAsistidas de targetLessons clases asistidas`), eliminando la confusión donde 2 frecuencias semanales se interpretaban como 2 asistencias mensuales.
  - **Purgado de Mock Data de Asistencia**: Eliminación completa de historiales y tasas simuladas (`recentAttendance: []`, `attendanceRate: 0`) en las semillas oficiales y store para operación real con Insforge PostgreSQL.

## [1.7.1] - 2026-09-07

### Añadido & Sincronizado
- **Cruce Bidireccional de Asistencia Docente-Secretaría e Integración Insforge MCP (ADR 0075)**:
  - **Kiosco Móvil del Profesor (`/teacher`)**: Cálculo determinista de la semana lectiva activa (`getCurrentWeekIndex()`). Al marcar asistencia (`[🟢 Pres.]`, `[🔴 Aus.]`, `[🟡 Tar.]`, `[🔵 Just.]`), se asocia inmediatamente a la semana lectiva real del mes en `schedule.attendanceByWeek`.
  - **Recálculo Inmediato de Estadísticas**: `markLessonAttendance` ahora recalcula en tiempo real el `% de Asistencia` (`attendanceRate`) en el store global y añade créditos de recuperación para inasistencias justificadas.
  - **Persistencia en Insforge PostgreSQL**: Despacho asíncrono en segundo plano a `attendance_logs` (registros inmutables con fecha/hora y usuario) y `students` (`attendance_rate` y `makeup_credits`).
  - **Kardex para Docentes**: Botón `📖 Kardex` integrado en cada ficha de alumno dentro de `/teacher/alumnos`.
  - **Auditoría MCP en Vivo**: Confirmación de 83 alumnos, 83 familias, 83 facturas y 6 usuarios RBAC en PostgreSQL, documentada en `docs/BACKEND_AUDIT.md`.

## [1.7.0] - 2026-09-07

### Añadido & Implementado
- **Kardex de Asistencias y Regularización Cronológica con Fechas y Horas por Alumno (`StudentAttendanceKardex`) (ADR 0074)**:
  - Mapeo automático de todas las lecciones del alumno a sus fechas calendario reales (Lunes a Sábado), bloques de hora (ej. 16:00 - 16:45), sala y profesor asignado utilizando las semanas lectivas calculadas (`getMonthWeeks`).
  - **Regularización en 1 Clic**: Acciones directas para marcar `[✓ Presente]`, `[✗ Falta]`, `[⏰ Tardanza]`, `[🔵 Justificada]` y `[⚪ Sin marcar]` por cada sesión pasada con recálculo automático de la tasa de asistencia (`attendanceRate`) y créditos de recuperación (`makeupCredits`).
  - **⚡ Regularizar todo como Presente**: Botón para actualizar todas las clases pendientes de un alumno a presentes de un solo golpe.
  - **📋 Copiar Reporte para WhatsApp**: Generador de resumen formal con emojis, fechas y horas listo para compartir con el apoderado o dirección.
  - **Integración Multicanal**:
    - En el **Directorio de Alumnos (`/admin/alumnos`)**: Botón `Kardex` en la tabla, celda interactiva de porcentaje de asistencia y panel ampliado en la ficha lateral del alumno (Drawer).
    - En la **Agenda Semanal (`/admin/agenda`)**: Botón `Kardex Fechas` en cada alumno dentro de la **Libreta de Asistencias y Control de Plan**.
    - En el **Portal de Familias (`/family`)**: Botón `Ver Kardex de Fechas` para que los padres auditen el cumplimiento de clases de sus hijos.

## [1.6.9] - 2026-09-05

### Añadido & Actualizado
- **Módulo de Campañas Masivas de WhatsApp Meta Cloud API (`/admin/campanas`)**:
  - Implementación completa del panel de campañas masivas basado en especificaciones operativas:
    - Métricas clave: Campañas activas, mensajes enviados este mes, costo acumulado estimado en Soles (S/ 0.08 por conversación de marketing + IGV) y conteo de plantillas aprobadas por Meta.
    - Asistente de 4 pasos para programar campañas: selección de plantilla aprobada con variables dinámicas, segmentación por checkboxes (Todos los contactos, Prospectos demo_requests, Matriculados activos, Inactivos), proyección de costos antes del envío y opción de envío inmediato o programado con fecha/hora.
    - Historial de campañas enviadas y auditadas con tasas de entrega, lectura y coste real.
  - Acceso directo añadido en el menú de navegación lateral de `/admin`.
- **Sistema Global de Modo Noche / Modo Día con Paleta Oficial Vibra Music**:
  - Botón de alternancia de tema persistente en `localStorage` (`☀️ Modo Día` / `🌙 Modo Noche`) en la barra superior.
  - Aplicación de la paleta de identidad visual de Vibra Music:
    - Fondo principal: `#0D0B0A` (Negro profundo)
    - Fondo secundario / tarjetas: `#1A1410` (Negro cálido)
    - Naranja de transición / marca: `#F47B20`
    - Amarillo / dorado luminoso: `#FFB52E`
    - Naranja claro acento: `#FF9E3D`
    - Texto claro: `#FFF8EC`
    - Texto oscuro: `#15120F`
    - Tipografía titular: `Bebas Neue` con tracking optimizado.
  - **Blindaje Estricto del Horario de Clases**: Las celdas, categorías por edades (Junior `#FFF2B2`, Juvenil `#4CAF50`, Adulto `#9E9E9E`, Infantil `#B388FF`, Recuperación `#EF4444`, Personalizada `#B2EBF2`), horas salmón (`#FCD7D2`) y estados de asistencia se mantienen con sus códigos de colores exactos del Excel físico de Nayeli, completamente inmunes al cambio de tema del sistema.
- **Desacoplamiento y Limpieza Total de Lovable**:
  - Eliminación completa de tags, comentarios y referencias a Lovable en `AGENTS.md`, `README.md`, `docs/DEPLOYMENT.md`, `vite.config.ts` y `src/routes/__root.tsx`.
  - Supresión del archivo obsoleto `src/lib/lovable-error-reporting.ts`.

## [1.6.8] - 2026-09-05

### Añadido & Implementado
- **Módulo de Gestión de WhatsApp Business & Agente Inteligente (`/admin/whatsapp`) (ADR 0073)**:
  - Implementación completa de las 4 pestañas operativas basadas en los mockups aprobados (`media_1788622148516.png` y `media_1788622148468.jpg`):
    - **Agente**: Estado de conexión de Meta Cloud API, configuración de nombre, saludo y contexto de negocio con sincronización en PostgreSQL (`whatsapp_bot_config`), atajos deterministas sin IA con toggle y modal de edición, lista de conversaciones recientes y chat interactivo en vivo con transcripción y envío de mensajes manuales por asesores.
    - **Reglas**: Reglas de escalamiento y handoff automático a Claudia y Sergio (`requiere_asesor`), parámetros de inferencia Gemini con tool_choice forzado y horarios de atención.
    - **Conversaciones**: Historial unificado de mensajes con estados y filtros rápidos.
    - **Citas y Ventas**: Embudo de conversión y prospección conectado a la tabla `demo_requests` de Insforge, con métricas de tasa de cierre, botón para matricular directamente y generador de enlaces de cobro seguro con Culqi.
- **Webhook Oficial de Meta Cloud API (`/api/webhook/whatsapp`)**:
  - Servidor server-side en Nitro/Cloudflare Pages (`src/server/whatsapp-webhook.ts`), con handshake GET (`hub.verify_token`, `hub.challenge`) y procesamiento POST con idempotencia en Upstash Redis (`wa:msg:{message_id}`) y fallback en memoria.
- **Página de Checkout Culqi Segura (`/checkout`)**:
  - Portal de cobro oficial que solicita el email del apoderado y abre el modal de Culqi Checkout v4 para cobro con tarjeta, Yape y Plin, enlazado directamente a los prospectos de WhatsApp y Facebook Ads.
- **Acceso en Barra Lateral (`/admin`)**:
  - Integración del icono de WhatsApp Bot en la navegación administrativa.

## [1.6.7] - 2026-09-04

### Añadido & Corregido
- **Capa de Datos para Leads y Solicitudes Demo en Insforge (`leads.service.ts`) (ADR 0072)**:
  - Creación del servicio oficial para interactuar con la tabla `demo_requests` de PostgreSQL en Insforge (`getLeadsFromDB`, `createLeadInDB`, `updateLeadStatusInDB`).
  - Habilitación de la infraestructura base para que un bot de WhatsApp (Evolution API, Meta Cloud API) o landing page en WordPress pueda registrar prospectos directamente en la base de datos de la escuela sin requerir un CRM de pago externo.

## [1.6.6] - 2026-09-02

### Añadido & Corregido
- **Aislamiento Estricto de Clases de Recuperación a 1 Sola Semana (ADR 0071)**:
  - Las clases de recuperación ahora persisten y filtran estrictamente por `weekIndex`, `month` y `year`. Se muestran únicamente en la semana y mes elegidos, permitiendo que el alumno continúe con su horario habitual en las demás semanas sin alterar su plan.
  - Incorporación de selector de semana (Semanas 1 a 5) en el modal de **Programar Recuperación** con navegación automática al día y semana agendada.
- **Delimitación Oficial del Ciclo Escolar 2026-2027 (ADR 0071)**:
  - En **2028 en adelante**: Agenda 100% limpia sin alumnos matriculados (0 alumnos).
  - En **mediados de 2027 (Agosto 2027 en adelante)**: Contratos anuales concluidos, no se muestran clases fantasma (0 alumnos).
  - En **primer semestre 2027 (Enero a Julio 2027)**: Únicamente se muestran los estudiantes con Plan Anual.
  - En **2026 (Agosto a Diciembre)**: Horarios completos y vigentes para todos los alumnos activos.

## [1.6.5] - 2026-09-02

### Añadido & Corregido
- **Selector de Alcance de Horario por Semana ("Solo esta semana" vs "Todo el mes") (ADR 0070)**:
  - Integración del selector de alcance tanto en el modal de **`+ Programar Clase`** como en el panel lateral de **`➕ Agregar Alumno a este Horario`**, permitiendo que Nayeli cambie a un alumno de día únicamente para la semana activa o para todo el mes.
- **Detección Inteligente de Horarios Existentes y Reprogramación Rápida (ADR 0070)**:
  - Al seleccionar a un alumno que ya tiene clases asignadas, el modal despliega sus horarios vigentes con opción de mover la clase existente o agendar una sesión adicional.
  - Soporte de actualización de docente y sala en `rescheduleLesson` en [`src/store/app-store.ts`](file:///c:/Users/USER/my%20music%20staff%20backend/src/store/app-store.ts).
- **Auto-Navegación Visual de Pestañas al Guardar (ADR 0070)**:
  - Al guardar o mover una clase a un día diferente (ej. de Lunes a Martes), la vista cambia automáticamente a la pestaña correspondiente (`Mar-Jue`), garantizando visibilidad inmediata de la clase agendada.

## [1.6.4] - 2026-09-01

### Añadido & Corregido
- **Habilitación de Eliminación Directa de Alumnos para Secretaría (Nayeli) (ADR 0069)**:
  - Eliminación directa con confirmación en la tabla de alumnos y en la ficha lateral (`Sheet`) sin necesidad de solicitudes de aprobación bloqueantes.
  - Autorización de rol `staff` en [`src/lib/services/students.service.ts`](file:///c:/Users/USER/my%20music%20staff%20backend/src/lib/services/students.service.ts).
- **Visibilidad Continua y Registro en Casillas de Agenda (ADR 0069)**:
  - Remoción de la restricción de meses rígida que ocultaba clases recurrentes en meses posteriores a Agosto. Las clases semanales se mantienen visibles mientras el alumno esté activo.
  - Corrección de `handleSelectStudentForNewLesson` en [`src/components/admin/agenda-board.tsx`](file:///c:/Users/USER/my%20music%20staff%20backend/src/components/admin/agenda-board.tsx) para preservar el docente y sala seleccionados al hacer clic en "+ Añadir".
  - Optimización del mapeo de columnas en la matriz diaria por profesor.

## [1.6.3] - 2026-09-01

### Corregido & Mejorado
- **Corrección de ReferenceError en Copia de Invitaciones (ADR 0068)**:
  - Importación explícita de `CheckCircle2` en [`src/routes/admin.invitaciones.tsx`](file:///c:/Users/USER/my%20music%20staff%20backend/src/routes/admin.invitaciones.tsx), eliminando la excepción `ReferenceError: CheckCircle2 is not defined` al copiar enlaces de acceso o credenciales en el modal de visualización.
- **Diferenciación Visual de Iconos de Navegación (ADR 0068)**:
  - Asignación de iconos únicos en la barra lateral en [`src/routes/admin.tsx`](file:///c:/Users/USER/my%20music%20staff%20backend/src/routes/admin.tsx): **`GraduationCap`** para *Alumnos* y **`UserPlus`** para *Invitaciones*, evitando confusiones visuales.

## [1.6.2] - 2026-08-31

### Añadido & Corregido
- **Sincronización Real del Calendario Dinámico y Soporte de Semanas Completas (ADR 0067)**:
  - Implementación del módulo central de cálculo de calendario formativo ([`src/lib/calendar-utils.ts`](file:///c:/Users/USER/my%20music%20staff%20backend/src/lib/calendar-utils.ts)) con función `getMonthWeeks(year, monthIndex)`.
  - Soporte completo para la **Semana 5 de Agosto (Lunes 31 de Agosto)** y meses de 5 semanas, eliminando el límite fijo y estático de 4 semanas.
  - Corrección de fechas estáticas en todos los meses del año (como Setiembre, Octubre, etc.), garantizando que los días coincidan 100% con la realidad física del calendario (ej. resolviendo el error donde Setiembre mostraba *"Lunes 3 de Setiembre"*).
  - Sincronización en las 3 vistas de la Agenda ([`agenda-board.tsx`](file:///c:/Users/USER/my%20music%20staff%20backend/src/components/admin/agenda-board.tsx)), Libreta de Asistencia, Modal de Reprogramación y [`minimal-agenda-calendar.tsx`](file:///c:/Users/USER/my%20music%20staff%20backend/src/components/agenda/minimal-agenda-calendar.tsx).
- **Optimización y Compactación de Alta Densidad en Vista por Día y Rejilla Semanal (ADR 0066)**:
  - Reducción del tamaño vertical en más del 50%, suprimiendo textos e instrumentos duplicados en la Vista por Día y ajustando la altura mínima por franja horaria a 48px.
  - Formato micro-card en la Rejilla Semanal para visualización panorámica sin necesidad de scroll vertical prolongado.
  - Preservación 100% inalterada de la **Vista Didáctica Oficial de Nayeli (1x1 y 2x2)**.
- **Normalización de Endpoint de Registros en Insforge Database API (ADR 0065)**:
  - Normalización de `INSFORGE_CONFIG.baseUrl` a `/api/database/records` en [`src/lib/insforge.ts`](file:///c:/Users/USER/my%20music%20staff%20backend/src/lib/insforge.ts), eliminando errores 404 en la consola del navegador.

## [Unreleased] - 2026-08-15

### Añadido
- **Marco Integral de las 6 Funciones de Secretaría (Nayeli) y Dirección (Dueña)**:
  1. **Registro de Asistencia de Alumnos**: Marcado en vivo en la Ficha del Alumno (✓ Presente, ⏰ Tarde, ✗ Falta) con recálculo automático y reactivo de la tasa de asistencia (`attendanceRate`).
  2. **Registro de Matrículas**: Formulario integral con fecha exacta de inicio/fin, cálculo de vigencia y botón directo `+ Horario` para agendar sesiones semanales en 1 clic.
  3. **Registro de Reprogramaciones**: Módulo de reprogramación en `AgendaBoard` con selector de alcance (*Solo esta semana* vs *Todo el mes*) y validación anti-conflictos.
  4. **Atención de WhatsApp Business**: Integración directa con la API de WhatsApp con plantillas predefinidas de bienvenida, cobranzas y coordinación familiar.
  5. **Registro de Retiro de Alumnos**: Gestión de estados *En Pausa* y *Baja*, historial de reingresos y liberación de vacantes en el horario.
  6. **Registro de Cobranzas y Abonos**: Módulo de Facturación con registro de pagos totales y parciales (Yape, Plin, Efectivo, Transferencia) y comprobante WhatsApp.
- **Sistema de Seguridad y Jerarquía de Eliminaciones (ADR 005)**:
  - La secretaria (Nayeli) no puede eliminar permanentemente; el sistema genera una **Solicitud de Eliminación Protegida** con motivo justificado.
  - La Dueña (Super Admin) cuenta con el componente `DeletionRequestsPanel` en su Dashboard con botones para **Aceptar y Eliminar**, **Denegar** y consultar el **Reporte Oficial de Auditoría con Timestamp inmutable**.
- **ADR 005**: Documentación formal del flujo de aprobación y funciones operativas en [`docs/adr/0005-flujo-aprobacion-eliminaciones-y-funciones-secretaria.md`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/adr/0005-flujo-aprobacion-eliminaciones-y-funciones-secretaria.md).

## [1.4.0] - 2026-08-14

### Añadido
- **Vista Diaria de Horario en 3 Columnas por Docente (Estilo Excel Oficial)**:
  - Nueva matriz en [`/admin/agenda`](file:///C:/Users/USER/my%20music%20staff%20backend/src/components/admin/agenda-board.tsx) que organiza las clases del día en 3 columnas dedicadas para los profesores principales: **PROF. JEREMY**, **PROF. FERNANDO** y **PROF. NATHALY**.
  - Visualización simultánea de clases grupales y colores oficiales de categoría (Junior, Juvenil, Adulto, Infantil).
  - Casillas vacías con acción interactiva *"+ Disponible"* para agendado rápido.
  - Columna de **HORA** con fondo salmón del Excel y tipografía carbón oscuro (`text-slate-950`) de alto contraste y máxima legibilidad (TDAH-friendly).
- **Control Temporal Meticuloso Día por Día (DD/MM/AAAA)**:
  - Soporte de campos `planStartDate` y `planEndDate` con cálculo exacto del ciclo formativo (1 mes, 3 meses o 12 meses menos 1 día).
  - Sincronización precisa con la agenda: las clases solo se muestran durante el rango exacto contratado por cada alumno.
- **Historial de Reingresos y Bajas Editable en Agenda**:
  - Posibilidad de alternar estados (Activo, En Pausa, Baja), seleccionar planes del Dossier, y ajustar fechas de inicio/vencimiento directamente desde el panel de historial en [`/admin/agenda`](file:///C:/Users/USER/my%20music%20staff%20backend/src/components/admin/agenda-board.tsx).
  - Botón de acción rápida: *"🚀 Confirmar Reingreso (Activar)"*.
- **Matricular Nuevo Alumno con Esquema Completo del Dossier**:
  - Modal enriquecido en [`/admin/alumnos`](file:///C:/Users/USER/my%20music%20staff%20backend/src/components/admin/students-table.tsx) con selección de Planes Oficiales (Mensual S/ 329, Trimestral S/ 289.40, Anual S/ 263.20), Matrículas (Promo Demo S/ 30 / Regular S/ 120), Pack de Útiles (S/ 67) y Fecha Exacta de Inicio.
- **Sincronización del Botón "+ Horario"**:
  - Vinculación directa de las sesiones (1ra y 2da clase semanal) con el año y mes del plan del alumno en [`ScheduleStudentForm`](file:///C:/Users/USER/my%20music%20staff%20backend/src/components/admin/students-table.tsx).
- **Habilitación de Cobros y Abonos para Nayeli (Staff)**:
  - Registro de pagos WhatsApp/Yape/Efectivo con N° de operación y bitácora de auditoría inmutable, sin permisos de retiro o alteración de base contable.

### Logs & Arquitectura Graphify / Engram
- **Creación del Registro Maestro de Logs (`docs/logs/system_audit.log`)**:
  - Trazabilidad y auditoría cronológica de todos los diagnósticos, fixes y cambios.
- **Actualización de Grafos de Sistema (Graphify & Engram)**:
  - [`docs/graphify/data_flow_graph.mermaid`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/graphify/data_flow_graph.mermaid): Grafo de flujo de datos completo (Importadores, Estado, Timbre, Backend).
  - [`docs/graphify/dependency_graph.mermaid`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/graphify/dependency_graph.mermaid): Grafo de componentes y dependencias.
  - [`docs/engram/memory_graph.json`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/engram/memory_graph.json): Memoria gráfica persistida con las franjas horarias oficiales.

### Añadido & Automatización (Added)
- **Tokens de Invitación Autosuficientes y Enrutamiento Incógnito / Multiplataforma (ADR 0046)**:
  - Formato de enlace determinista `inv-{rol}-{nombre}-{timestamp}` que preserva el rol y nombre del usuario incluso en pestañas de incógnito, otros navegadores o futuras apps móviles (Flutter / Android / iOS).
  - Enrutamiento estricto al portal correcto (`/teacher`, `/family` o `/admin`) sin riesgo de caer en el portal familiar por omisión.
- **Validación Dual de Contraseña y Estado Aceptado en Invitaciones (ADR 0045)**:
  - Soporte de ingreso transparente tanto con la **Clave Maestra** como con la **nueva contraseña personalizada** creada por el profesor o apoderado.
  - Sincronización instantánea del estado de la invitación a **`aceptado`** tras completar el primer acceso.
  - Acceso directo en visitas posteriores sin volver a solicitar la clave maestra.
  - Manejo optimizado de endpoints PostgREST en modo híbrido.
- **Eliminación Individual y Selección Múltiple de Alumnos (ADR 0044)**:
  - Checkbox maestro en cabecera de tabla y checkboxes individuales en cada fila para seleccionar alumnos específicos.
  - Botón de acción masiva `🗑️ Eliminar Seleccionados (N)` con confirmación explícita.
  - Icono de papelera individual (`Trash2`) en la columna de acciones para borrar alumnos en 1 solo clic.
- **Arquitectura de Red Multidispositivo y Persistencia Insforge (ADR 0043)**:
  - Documentación detallada del flujo de sincronización híbrida: render reactivo inmediato en cliente + persistencia en PostgreSQL Insforge (`pdey9yma.us-east.insforge.app`).
  - Fijación estricta de puerto `5173` en desarrollo para evitar aislamiento de origen local (`Same-Origin Policy`).
  - Garantía de persistencia unificada en producción multidispositivo (móviles de profesores, tablets de recepción y dirección en Cloudflare).
- **Navegador Multi-Semana y Alcance de Reprogramación (ADR 0042)**:
  - Navegador interactivo de 4 semanas `[ < ] Semana X de 4 [ > ]` con cálculo y renderizado de fechas reales en las cabeceras (Lunes a Sábado).
  - Selector de alcance al mover/reprogramar una clase:
    - ⚡ **Solo esta semana**: Aplica el cambio únicamente para la semana activa sin alterar las demás semanas.
    - 🗓️ **Todo el mes**: Aplica el nuevo horario para las 4 semanas de Agosto.
  - Indicador cognitivo y accesible **`1ra Clase`** / **`2da Clase`** en las tarjetas de la Rejilla Semanal y de la Vista Diaria, eliminando la adivinación para el personal de secretaría.
- **Agendamiento Inteligente Multi-Día por Plan Oficial (ADR 0041)**:
  - Botón directo `+ Horario` en cada fila del Directorio de Alumnos (`students-table.tsx`).
  - Detección automática de modalidad:
    - **Plan Regular (8 clases / mes)**: solicita Día 1 (Hora y Sala) y Día 2 (Hora y Sala), agendando ambas sesiones en 1 clic.
    - **Plan Intensivo (4 clases / mes)**: solicita el día único de clase semanal.
  - Sincronización instantánea con la cuadrícula de la Agenda Interactiva y el portal del profesor asignado.
- **Sistema Directo de Alertas e Incidencias de Alumnos (`Alerta`)**:
  - Botón `Alerta` en el Directorio de Alumnos para registrar avisos de Salud (lesiones), Comportamiento, Logros o Coordinación familiar.
  - Reflejo automático en tiempo real en la tarjeta de Alertas del Dashboard (`alerts-panel.tsx`) con botón de resolución `✓ Listo`.
- **Identificación Visual por Categorías de Edad**:
  - Formato minimalista `Nombre (CATEGORÍA)` con los colores oficiales de Vibra Music (Junior en amarillo, Juvenil en verde, Adulto en gris, Infantil en morado, etc.).
  - Sincronizado en la Gestión de Alumnos y en el Directorio para Profesores (`/teacher/alumnos`).

### Corregido (Fixed)
- **Import de `PlusCircle` en Horario de Clases**:
  - Resuelto `ReferenceError: PlusCircle is not defined` importándolo en `agenda-board.tsx`.
- **Import de `useEffect` y `Calendar` en Gestión de Alumnos**:
  - Resuelto en `students-table.tsx`.
- **Sincronización de Sesión de Profesores y Familias**:
  - Resuelto para preservar sesión tras F5 y redirigir limpiamente a sus respectivos portales sin pasar por accesos de Dueña/Secretaria.

### Seguridad Crítica (Security)
- **Doble Filtro de Seguridad Estilo GitHub para Vaciado Masivo (ADR 0038)**.
- **Importador Universal de Alumnos CSV/Excel para Nayeli (ADR 0037)**.
- **Importador Universal de Horarios CSV/Excel para Nayeli (ADR 0035)**.
- **Purga Total de Mock Data para Producción (ADR 0039)**.
