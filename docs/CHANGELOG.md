# Changelog: Vibra Music (Maestro Mentor Guide)

Todas las modificaciones notables a este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

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
