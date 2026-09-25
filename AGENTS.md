# Guía y Reglas para Agentes de Código — Vibra Music Staff

Este documento establece las reglas arquitectónicas, decisiones técnicas (ADR), criterios pedagógicos y convenciones de persistencia de Vibra Music Staff. Cualquier agente de código que trabaje en esta base de código DEBE consultar y respetar estas directrices para garantizar la coherencia operativa entre el frontend y el backend, preservando la escalabilidad del sistema sin romper funcionalidades existentes.

---

## PARTE 1: Reglas de Arquitectura y Negocio — Vibra Music Staff

### 1. Decisiones Técnicas Fundamentales (ADR-001)
1. **WhatsApp Cloud API Oficial de Meta**: Usar la API oficial de la nube de Meta (`/api/whatsapp/webhook`, `whatsapp-bot.service.ts`); nunca emuladores QR ni librerías no oficiales como Baileys.
2. **Pasarela de Pagos Culqi**: Integración oficial con Culqi para cobros en Perú (Soles PEN).
3. **Persistencia y Estado**: Postgres / Insforge como única fuente de verdad para pedidos, prospectos (`demo_requests`), alumnos (`students`), asistencias y configuración (`whatsapp_bot_config`). Nunca almacenar estado transaccional en prompts o vector stores.
4. **Stack Tecnológico**: TanStack Start / Nitro sobre Cloudflare Pages y Node.js.
5. **Paleta Oficial Vibra Music**:
   - Fondo principal: `#0D0B0A` (Negro profundo)
   - Negro secundario: `#1A1410` (Negro cálido)
   - Naranja intenso: `#F47B20`
   - Amarillo/dorado luminoso: `#FFB52E`
   - Naranja acento: `#FF9E3D`
   - Texto claro: `#FFF8EC`
   - Texto oscuro: `#15120F`
6. **Horario de Clases**: Preservar estrictamente los colores funcionales del Excel físico de Nayeli para las celdas, categorías de alumnos y estados de asistencia.

---

### 2. Reglas Pedagógicas y Asignación de Profesores / Salas (ADR-0102)
1. **Piano vs. Piano Infantil (Separación Estricta por Edad y Nivel)**:
   - **Criterio innegociable**: La asignación docente se rige exclusivamente por rango de edad y nivel técnico, **jamás por falta de espacio en sala**.
   - **Prof. Nathaly (Sala C)**: Especialista exclusivamente en **Piano Infantil** (niños de 4 a 8 años / categorías Infantil, Tiny, Junior inicial) y **Canto**.
   - **Prof. Fernando (Sala B)**: **Piano estándar**, jóvenes, adultos, niveles intermedios/avanzados/Master y **Violín**.
   - **Prof. Jeremy (Sala A)**: **Guitarra clásica, Guitarra eléctrica y Batería**.
2. **Blindaje del Bot de WhatsApp (`whatsapp-bot.service.ts`)**:
   - Si Fernando no dispone de cupos para Piano o Violín, el bot **NUNCA** deriva al alumno con Nathaly ni viceversa.
   - El bot ofrece turnos alternativos con Fernando o transfiere el prospecto al estado `en_evaluacion` para coordinación personalizada con secretaría (Nayeli). Del mismo modo, niños pequeños no se asignan a la sala de Fernando si Nathaly está llena.
3. **Aforo y Vacantes de Salas**:
   - Cada docente maneja un aforo máximo estricto de **5 alumnos por turno** de 45 minutos.
   - Dos profesores distintos no pueden dictar en la misma sala simultáneamente (cruce de sala).

---

### 3. Planes de Estudio, Cuotas Contractuales y Kardex de Asistencias (ADR-0099, ADR-0100, ADR-0104)
1. **Cuotas Estrictas de Clases por Mes**:
   - **Plan Regular (8 clases / 45 min)**: Muestra exactamente **8 clases al mes** (2 clases por semana $\times$ 4 semanas lectivas).
   - **Plan Intensivo (4 clases / 90 min)**: Muestra exactamente **4 clases al mes** (1 clase por semana $\times$ 4 semanas). Admite personalización de horarios en **Jueves**, además de Viernes y Sábados.
   - **Paquete Flexible (A demanda)**: Se rige por la bolsa de horas contratadas (`packageTotalSessions`, ej. 24 clases a demanda por S/ 500). Su vigencia depende de las clases efectivamente consumidas y no del mes calendario.
2. **Deduplicación Absoluta de Horarios (`dateStr-time`)**:
   - Está terminantemente prohibido generar o renderizar clases duplicadas en el mismo día y hora para el mismo alumno. Las plantillas de horario y las sesiones del Kardex se deduplican por franja horaria.
3. **Reglas de Operación del Kardex de Asistencias (`student-attendance-kardex.tsx`)**:
   - **Botón `+ De corrido (+45m)`**: Debe permanecer visible y funcional en cada fila de sesión para agregar una clase contigua de 45 minutos inmediatamente posterior (`handleAddConsecutiveClass`).
   - **Botón `🔄 Reprogramar`**: Debe permanecer habilitado ante estados de **Falta** (`ausente`), **Tardanza** (`tarde`) y **Justificada** (`justificada`).
   - **Preservación Incondicional**: Cualquier sesión con asistencia ya evaluada (`✓ Presente`, `✗ Falta`, `⏰ Tardanza`, `🔵 Justificada`) o marcada como recuperación/adelanto (`isMakeup`) jamás debe ser excluida de la vista mensual.
   - **No recortar vigencias a alumnos activos**: Si el alumno tiene `status: "activo"`, el Kardex debe proyectar la totalidad de las clases de su plan en el mes seleccionado sin omitir sesiones previas a `planStartDate`.

---

### 4. Persistencia en Insforge PostgreSQL y Arquitectura de Datos (ADR-0103)
1. **Autenticación PostgREST sin Errores 401**:
   - `buildHeaders` en `src/lib/insforge.ts` solo debe enviar `Authorization: Bearer <token>` si es un JWT criptográfico real RFC 7519 (`startsWith("eyJ")` con 3 partes). Si es nulo o simulado, debe recurrir automáticamente a `INSFORGE_CONFIG.anonKey`.
2. **Debounce Inteligente contra Condiciones de Carrera**:
   - Toda mutación disparada desde inputs de formulario debe pasar por debounce (350ms) en `backgroundSyncStudentToDB` (`app-store.ts`) para evitar escrituras desordenadas (*out-of-order writes*) hacia PostgreSQL.
3. **Protección de Datos Activos (STOP & VERIFY)**:
   - **PROHIBIDO** ejecutar `DROP TABLE`, `TRUNCATE` ni `DELETE` masivo sobre `students`, `families` o `attendance_logs`. Los alumnos activos registrados son datos productivos intocables.
4. **Tabla Inmutable `attendance_logs`**:
   - Cada marca de asistencia en el Kardex o Kiosco docente se persiste en `attendance_logs`. Al iniciar la aplicación, `useInsforgeSync` consulta esta tabla y rehidrata el mapa de asistencias en memoria Zustand (`hydrateFromBackend`).
5. **Plantillas Semanales Recurrentes sin Candado de Mes**:
   - En las clases semanales estándar (`emergency_contact.scheduleLessons`), las lecciones recurrentes llevan `month: undefined` (no forzar `month = 7` ni el mes actual), permitiendo que se proyecten automáticamente a través de todos los meses lectivos.
6. **Esquema de Columnas y Metadatos**:
   - La tabla `students` utiliza la columna `full_name` (no `name`).
   - La columna `birthdate` de PostgreSQL es de tipo `date`; solo debe recibir fechas con formato estricto `YYYY-MM-DD`. Metadatos extendidos o no normalizados se guardan en `emergency_contact` JSONB.
7. **Sincronización Reactiva Bidireccional**:
   - Al invocar `setStudentSchedule` o `addLessonToSchedule`, se debe actualizar tanto `schedule` como `adminStudents.scheduleLessons` en el estado de Zustand, sincronizando simultáneamente en segundo plano hacia PostgreSQL.

---

### 5. Control Financiero y Gestión de Matrículas (ADR-0104)
1. **Pack de Útiles y Libro (S/ 67)**:
   - Se gestiona con campos dedicados en `emergency_contact`: costo total (`packUtilesCost`), monto abonado (`packUtilesAmountPaid`), estado (`packUtilesStatus`: pendiente, cancelado, exonerado) y entrega física (`packUtilesDelivered`).
2. **Desacoplamiento de Fechas**:
   - `enrollmentDate`: Fecha administrativa en que se formaliza el pago/inscripción.
   - `planStartDate`: Fecha efectiva en que el alumno asiste a su primera clase en sala. Ambas fechas deben mantenerse desacopladas para evitar desajustes en el calendario.

---

### 6. Blindaje de Reprogramaciones Puntuales y Cuota Contractual en Kardex (ADR-0105)
1. **Aislamiento Estricto por Fecha (`dateStr` y `excludedDates`)**:
   - Cuando se reprograma una clase con alcance *"Solo esta sesión"*, la nueva sesión DEBE recibir una fecha exacta (`dateStr: YYYY-MM-DD`).
   - La lección original semanal recurrente DEBE añadir la fecha reprogramada a su lista de exclusiones (`excludedDates: ["YYYY-MM-DD"]`).
   - Está **TERMINANTEMENTE PROHIBIDO** crear lecciones recurrentes semanales abiertas cuando el usuario solicita un cambio puntual de una sola clase.
2. **Cumplimiento Invariable de la Cuota Contractual (8 Clases Regular / 4 Intensivo)**:
   - El Kardex del alumno jamás debe proyectar más clases de las contratadas salvo que existan clases extras evaluadas en sala.
   - Si existen lecciones marcadas como recuperación o adelanto, el sistema preserva todas las evaluadas (`status !== "pendiente"`) y acota las clases pendientes para que el total del ciclo sume exactamente la cuota del contrato (`targetQuota`).
3. **Clases de Corrido (+45 min) Circunscritas a Fecha**:
   - Al pulsar `+ De corrido (+45m)`, la lección creada debe registrar `dateStr: session.dateStr` para que únicamente exista en la fecha en que se impartió, impidiendo su réplica en semanas posteriores.
4. **Deduplicación por Fecha y Hora (`dateStr-time`)**:
   - Cuando se consolidan lecciones con fecha específica en el Kardex y horario semanal, las lecciones puntuales con `dateStr` distinto (por ejemplo, una clase de corrido el viernes 11/09 a las 16:45 y una reprogramación el viernes 18/09 a las 16:45) jamás deben descartarse entre sí, garantizando su coexistencia armónica.
5. **Restablecimiento Inmaculado a Pendiente (`status: "pendiente"`)**:
   - Restablecer una sesión evaluada al estado inicial pendiente invoca `postgrestDelete` sobre `attendance_logs` para esa fecha y limpia `attendanceByDate` en Zustand y PostgreSQL.
   - Está **TERMINANTEMENTE PROHIBIDO** persistir un registro con `status: "presente"` o cualquier otro valor en la base de datos cuando el usuario solicita "Restablecer" o "Sin marcar".
6. **Reversión y Eliminación Directa de Reprogramaciones**:
   - El Kardex debe permitir revertir o eliminar sesiones reprogramadas o extras en modo edición, liberando simultáneamente la exclusión en la lección original para restaurar el cronograma normal en un solo clic.


---

### 7. Gestión Quirúrgica de Cobros, Abonos y Facturación Vinculada a Alumnos Activos (ADR-0106)
1. **Facturación Exclusiva para Alumnos Activos**:
   - El panel de Cobros y Abonos (`/admin/facturacion`), la Matriz Anual y las tablas `invoices` y `payment_audit_logs` en PostgreSQL reflejan únicamente a los alumnos con `status: "activo"`.
   - No se deben inyectar facturas de semillas antiguas ni recibos dummy. Se preserva intacta la base de alumnos inactivos (`baja` / `pausa`) en `students` para su depuración y migración manual progresiva 1 a 1.
2. **Sincronización Bidireccional Automática entre Ficha y Recibo**:
   - Al registrar un abono (`recordPaymentAbono`) con comprobante o N° de Operación en el módulo de facturación, se persiste en `payment_audit_logs` y se actualiza el estado del recibo (`invoices`). Simultáneamente, actualiza de inmediato `amountPaid`, `balance` y `payment: "al-dia" | "pendiente"` en la ficha del alumno (`adminStudents`) y en PostgreSQL vía `backgroundSyncStudentToDB`.
   - Al matricular un nuevo alumno (`addNewStudent`), se genera automáticamente su recibo inicial y su log de auditoría si hubo un pago inicial.
   - Si se edita el precio del plan (`planPrice`) o abono (`amountPaid`) desde la ficha de edición del alumno (`updateStudentDetails`), el recibo enlazado actualiza su monto, saldo y estado en tiempo real.
3. **Control de Abonos Fraccionados y Planes Promocionales**:
   - Para planes con descuento especial (ej. Plan Trimestral de S/ 297 a S/ 261) o pagos fraccionados (ej. primer abono de reserva y segundo abono al inicio de clases), cada entrega queda registrada en `payment_audit_logs` con fecha, monto, medio de pago y referencia.

---

### 8. Resolución Prioritaria de Alumnos Activos y Preservación de Historial en Horario de Clases (ADR-0107)
1. **Prioridad Absoluta de Perfiles Activos (`findStudentProfileByName`)**:
   - Toda búsqueda o resolución de alumno en el Horario de Clases (`AgendaBoard`, `VacancyAvailabilityPanel`, `MinimalAgendaCalendar`, Kiosco Docente) debe priorizar resolver al alumno con `status: "activo"` sobre cualquier registro histórico previo en `baja` o `pausa`.
   - Está **TERMINANTEMENTE PROHIBIDO** que un registro en `baja` de una persona elimine u oculte las clases y asistencias de su versión re-matriculada o activa en el cronograma semanal.
2. **Deduplicación Reactiva en Hidratación (`hydrateFromBackend`)**:
   - Si un alumno activo ingresa desde PostgreSQL, reemplaza automáticamente cualquier registro previo inactivo con el mismo nombre.
   - La lista `adminStudents` en Zustand se deduplica descartando homónimos inactivos y ordena a todos los alumnos activos al inicio del array para garantizar que cualquier `.find` encuentre al alumno activo de forma inmediata.
3. **Preservación Incondicional del Historial de Clases Culminadas**:
   - Si un alumno completó el 100% de las clases contratadas de su ciclo (ej. 8 de 8 clases), sus clases asistidas o programadas deben permanecer visibles en las semanas correspondientes en que se impartieron dentro del Horario de Clases. La culminación de la cuota jamás debe borrar el historial visual de semanas pasadas o en curso.
4. **Soporte de Exclusión y Fecha Puntual en Celdas de Horario**:
   - Las lecciones con `dateStr` solo deben renderizarse en el día correspondiente a esa fecha exacta.
   - Las lecciones con `excludedDates` deben omitirse en los días correspondientes a esas fechas excluidas.
   - Las marcas de asistencia deben evaluar primero `attendanceByDate[dateStr]` para reflejar con precisión matemática el estado de asistencia real de esa fecha.

---

### 9. Cierre Estricto de Ciclo Contractual, Preservación de Asistencias y Sincronización Kardex-Horario (ADR-0108)
1. **Detección Dinámica de Culminación de Ciclo (`computeStudentCycle` / `isLessonInStudentCycle`)**:
   - Cuando un alumno alcanza o supera su cuota de clases contratadas (`evaluatedCount >= targetQuota`), el ciclo lectivo se considera formalmente **CULMINADO**.
   - En dicho estado, el Horario de Clases y el Kardex proyectan **ÚNICAMENTE** las sesiones ya evaluadas (`presente`, `ausente`, `tarde`, `justificada`) o explícitas con fecha exacta.
   - Queda **TERMINANTEMENTE PROHIBIDO** proyectar sesiones genéricas/pendientes en semanas posteriores a la fecha de culminación, evitando la aparición de clases "fantasma" en semanas 4 y 5 o en meses posteriores (ej. Octubre).
2. **Límite Estricto de Proyección Mensual (`planEndMonth`)**:
   - Toda plantilla semanal recurrente (`weekIndex === undefined`) debe acotarse estrictamente al rango de meses de vigencia del alumno (`selectedYearMonthStr <= endMonth`).
   - Ninguna clase regular de un plan que vence en Setiembre 2026 debe proyectarse en Octubre 2026 u otros meses posteriores.
3. **Resolución Unificada de Asistencias por Fecha Exacta (`attendanceByDate[dateStr]`)**:
   - Todas las vistas del Horario de Clases (`agenda-board.tsx`, `minimal-agenda-calendar.tsx`, vista diaria y semanal) deben resolver el estado de asistencia evaluando prioritariamente `lesson.attendanceByDate?.[dayInfo.dateStr]` antes de recurrir a estados genéricos o semanales.
   - Las marcas registradas en `attendance_logs` de PostgreSQL se rehidratan directamente en `lesson.attendanceByDate[dateStr]` y en `matchedStudent.scheduleLessons` para garantizar que las píldoras de asistencia (ej. "🟢 Pres") se reflejen de inmediato en la celda y fecha exacta en que el alumno asistió.
4. **Preservación Incondicional del Historial de Asistencia**:
   - La culminación del 100% de la cuota jamás debe ocultar o borrar las sesiones pasadas efectivamente dictadas. Las clases de un alumno graduado o que completó su ciclo deben permanecer visibles e inmutables con sus marcas de asistencia en las semanas y fechas en que ocurrieron.

---

### 10. Blindaje Backend para Migración 1 a 1 y Auto-Aprovisionamiento de Recibos (ADR-0109)
1. **Auto-Aprovisionamiento de Recibos en PostgreSQL (`backgroundCreateInvoiceInDB`)**:
   - Al matricular un nuevo alumno (`addNewStudent`) o al activar un alumno histórico desde el panel de depuración (`setStudentStatus` a `activo`), el backend aprovisiona y persiste de forma inmediata su recibo en la tabla `invoices`, garantiza la existencia de su familia en `families` y registra el pago inicial en `payment_audit_logs` si hubo un abono.
   - Esto evita que los alumnos migrados o reactivados carezcan de recibo en `/admin/facturacion` o que sus recibos desaparezcan al recargar la página.
2. **Sincronización Exacta de Abonos sin Valores Hardcodeados**:
   - `backgroundSyncPaymentToDB` recibe la información matemática real del recibo (`amount`, `amount_paid`, `remaining_balance`).
   - Queda **TERMINANTEMENTE PROHIBIDO** asumir montos fijos (como S/ 297) al registrar abonos, permitiendo el registro impecable de pagos fraccionados, planes promocionales (ej. S/ 261) y paquetes especiales.
3. **Resiliencia contra Pérdida de Recibos en Hidratación (`hydrateFromBackend`)**:
   - Al recibir datos de PostgreSQL, se realiza una fusión inteligente que preserva los recibos locales de alumnos activos recién creados o en vuelo que aún no hayan sido indexados por la base de datos remota.
4. **Mapeo Robusto de Alumnos desde Concepto de Recibo (`mapDBInvoiceToInvoice`)**:
   - Si el concepto contiene el nombre del alumno (`Plan ... — Nombre`), se extrae de forma prioritaria para evitar confusiones con el nombre del apoderado (`primary_guardian_name`).

---

### 11. Soporte Integral para Modalidad Regular 1x/sem (ADR-0110)
1. **Diferenciación Estricta de Modalidades de Horario (`ScheduleStudentForm`)**:
   - `isRegular2x`: `Regular (8 clases / 45 min)` -> Requiere 2 clases por semana (Días Pareados o Modo Personalizado) y programa Sesión 1 y Sesión 2.
   - `isRegular1x`: `Regular 1x/sem (8 clases / 45 min)` -> Requiere únicamente **1 clase semanal de 45 minutos**. Solo evalúa y guarda Sesión 1, eliminando falsos cruces/alertas de aforo de Día 2 y calculando una vigencia contractual de **2 meses lectivos** (`planEndDate` = +2 meses).
   - `isIntensive`: `Intensivo (4 clases / 90 min)` -> Requiere 1 clase semanal de 90 minutos (Jueves, Viernes o Sábado).
2. **Asignación Oficial Automática de Sala por Docente (ADR-0102)**:
   - Al seleccionar docente o abrir el formulario, la sala se inicializa automáticamente según la especialidad del docente: Prof. Nathaly -> Sala C (Piano Infantil y Canto), Prof. Fernando -> Sala B (Piano estándar y Violín), Prof. Jeremy -> Sala A (Guitarra y Batería).
3. **Cálculo de Vigencia y Proyección en Kardex**:
   - Al registrar una matrícula (`AddNewStudentDialog`) en modalidad Regular 1x/sem, `durationMonths` se fija en 2 meses.
   - El Kardex de Asistencias (`StudentAttendanceKardex`) proyecta con una ventana de hasta 90 días (`maxDaysToScan = 90`) para abarcar holgadamente las 8 semanas de clases del ciclo lectivo sin truncar sesiones.

---

### 12. Ciclo de Vida de Matrícula (Registro ➔ Horario ➔ Kardex) y Flexibilidad Condicional de Modalidad (ADR-0111)
1. **Regla Estricta de Ciclo de Vida del Alumno**:
   - El flujo administrativo oficial es: **Registro (Ficha) ➔ Horario (Agendamiento) ➔ Kardex (Asistencias)**.
   - **Condición de Modificación de Modalidad**: La modalidad y frecuencia (`Regular 2x`, `Regular 1x/sem`, `Intensivo`, `Paquete Flexible`) **SOLO** se puede cambiar libremente si el alumno aún **NO** tiene un horario agendado / guardado en la agenda (`!hasSavedSchedule`).
   - Una vez que el alumno cuenta con clases agendadas y activas en el horario semanal, el selector de modalidad se **bloquea con candado** (`🔒 Horario activo`). Para cambiar de modalidad en dicho estado, secretaría o dirección deben retirar o reestructurar previamente las clases en la agenda para evitar inconsistencias contractuales.
2. **Selector Interactivo Directo en Organizador de Horario (`ScheduleStudentForm`)**:
   - Se incorpora un selector directo de modalidad en la cabecera de `ScheduleStudentForm` que permite a secretaría ajustar la modalidad antes de agendar sin salir a la ficha ni eliminar al alumno.
   - Al seleccionar una modalidad distinta, se recalcula dinámicamente `planEndDate` (+2 meses para 1x/sem, +1 mes para 2x o Intensivo) y al presionar "Guardar Horario" se sincroniza atómicamente la nueva modalidad y fechas con PostgreSQL.
3. **Resolución en Vivo y Descongelamiento de Snapshot (`liveScheduleModalStudent`)**:
   - `students-table.tsx` resuelve al alumno en vivo usando `useMemo` sobre `adminStudents` y monta `<ScheduleStudentForm>` con `key={`${liveScheduleModalStudent.id}-${liveScheduleModalStudent.modality || ''}`}` para forzar un ciclo de vida limpio y reactivo ante cualquier edición previa.
4. **Sanitización de Enum SQL y Prioridad PostgreSQL**:
   - La columna `modality` en PostgreSQL está restringida por el enum `lesson_modality_enum` (`'Regular (8 clases / 45 min)'` o `'Intensivo (4 clases / 90 min)'`). `setStudentModality` sanitiza automáticamente el valor hacia la columna SQL y preserva la descripción completa en `emergency_contact.modality` JSONB.
   - `hydrateFromBackend` prioriza incondicionalmente `dbSt.modality`, `dbSt.planStartDate` y `dbSt.planEndDate` sobre cachés residuales de `localStorage`.

---

### 13. Blindaje de Detección de Modalidad Regular 2x y Activación Resiliente de Alumnos Históricos (ADR-0112)
1. **Discriminación Inequívoca de Modalidad (`modStr`)**:
   - `isIntensive` evalúa explícitamente `modStr.includes("inten") || modStr.includes("90 min") || modStr.includes("4 clases")`.
   - Está **TERMINANTEMENTE PROHIBIDO** verificar subcadenas ambiguas como `.includes("4")` que colisionan con el valor `"45 min"` del Plan Regular (`"Regular (8 clases / 45 min)"`).
   - `isRegular2x` se activa cuando no es Intensivo, ni 1x/sem, ni Flexible, garantizando la renderización incondicional de los Días Pareados oficiales (`🔗 Días Pareados (Oficial)`: L-M / M-J) y de la Segunda Clase Semanal (Día 2).
2. **Resiliencia en Activación de Alumnos Históricos (`setStudentStatus`)**:
   - En `setStudentStatus`, `updatedInvoices` se inicializa obligatoriamente como `let updatedInvoices = s.invoices;` antes de cualquier verificación o creación de recibo en segundo plano (`backgroundCreateInvoiceInDB`), previniendo errores de tipo `ReferenceError`.
   - Tanto `setStudentStatus` como `updateStudentDetails` cuentan con fallback de coincidencia por nombre normalizado (`isMatchingStudentName`) para resolver de forma infalible la reactivación 1 a 1 de alumnos históricos desde el panel de depuración (`student-cleanup-panel.tsx`).

---

### 14. Soporte Integral para Paquete Flexible (A Demanda) en Horario y Kardex (ADR-0113)
1. **Frecuencia y Duración de Sesión de Paquete Flexible**:
   - Las clases de un Paquete Flexible son de **45 minutos** por sesión (no 90 minutos como en el Plan Intensivo).
   - Se permite seleccionar libremente la frecuencia semanal: **1 clase por semana (45 min)** o **2 clases por semana (45 min)** en `ScheduleStudentForm`.
   - Al seleccionar 2 clases semanales, se habilitan dos bloques de configuración independientes (`🎒 Flexible Libre`) con días y horas totalmente personalizables de lunes a sábado según disponibilidad del docente.
2. **Preservación Incondicional de Vigencia Contractual (`planEndDate`)**:
   - Para alumnos con Paquete Flexible, `handleSubmit` en `ScheduleStudentForm` conserva la fecha contractual previamente acordada (`liveStudent.planEndDate`), prohibiendo sobreescribirla con fórmulas fijas de +1 o +2 meses.
3. **Proyección Dinámica Multimensual en Kardex y Ciclo de Vida (`maxDaysToScan`)**:
   - El cálculo del ciclo del alumno (`computeStudentCycle` en `student-cycle.ts` y `StudentAttendanceKardex`) calcula dinámicamente la ventana de escaneo como `Math.max(isFlexiblePackage ? 180 : 90, daysToEnd)` días a partir de `planStartDate`.
   - Esto garantiza que paquetes de 24 sesiones o ciclos multimensuales (ej. Julio a Octubre) proyecten y permitan marcar asistencias en todas sus clases a lo largo de los meses correspondientes sin truncamiento prematuro.
4. **Exclusión de Facturación Recurrente Mensual (`generateMonthlyInvoices`)**:
   - Los alumnos matriculados bajo **Paquete Flexible (A demanda)** quedan explícitamente excluidos del generador masivo de recibos mensuales del día 20 (`generateMonthlyInvoices`). Al tratarse de una bolsa cerrada de horas contratadas (ej. 24 clases a demanda), su cobro se realiza por ciclo de paquete y no por mes calendario, impidiendo la generación de recibos duplicados en el backend.
5. **Normalización de Fechas de Nacimiento hacia PostgreSQL (`YYYY-MM-DD`)**:
   - `backgroundCreateStudentInDB` y `performSyncStudentToDB` normalizan formatos peruanos habituales (`D/M/YYYY` o `DD/MM/YYYY`) a formato ISO estricto `YYYY-MM-DD` antes de escribir en la columna SQL `birthdate` (tipo `date`), resolviendo el problema de campos nulos en PostgreSQL y habilitando las alertas automáticas de cumpleaños en la plataforma.

---

### 15. Visibilidad, Resiliencia y Dinamismo en Agenda Docente y Kiosco (ADR-0114)
1. **Cálculo Dinámico de Semana Lectiva (`MinimalAgendaCalendar`)**:
   - En lugar de fijar una semana estática en el código (ej. semana 3), la vista de agenda calcula la semana activa del mes en tiempo real con `getCurrentWeekIndex(defaultYear, defaultMonth) + 1`.
   - El selector de meses abarca el rango lectivo completo (incluyendo Julio y Octubre) para la correcta visualización de paquetes extendidos.
2. **Resolución Robusta de Asignación Docente**:

### 16. Sincronización e Inmutabilidad de Lecciones con Fecha Exacta en Horario y Agenda (ADR-0115)
1. **Aislamiento de `weekIndex` en Clases con Fecha Exacta (`dateStr`)**:
   - En `AgendaBoard`, toda lección con `dateStr` se valida exclusivamente contra los días de la semana visualizada (`currentWeekObj.days.some(d => d.dateStr === l.dateStr)`), omitiendo incondicionalmente el filtro de coincidencia fija `l.weekIndex !== safeWeekIndex`. Esto garantiza que recuperaciones y reprogramaciones puntuales (ej. Mia Lucero Bellido) se muestren en la semana de su fecha real y no sean filtradas por el índice de la clase original ausente.
   - En `rescheduleLesson` (`app-store.ts`), al crear una reprogramación de alcance *"Solo esta sesión"* con `newDateStr`, `weekIndex` se fija en `undefined` para evitar heredar índices estáticos obsoletos.
2. **Soporte de Fechas Excluidas en Celdas de Horario (`excludedDates`)**:
   - `AgendaBoard` valida `l.excludedDates?.includes(lessonDayInfo.dateStr)` para ocultar la clase original en el día específico en que fue reprogramada, evitando duplicidades visuales.
3. **Ampliación de Ventana Lectiva 2026**:
   - El límite inferior del año 2026 en `AgendaBoard` se amplía a Julio 2026 (`selectedMonth < 6`) para permitir la renderización de paquetes flexibles y ciclos iniciados a mitad de año (ej. Andrea Fernanda Meza).

---

### 17. Integridad Relacional en PostgreSQL (Insforge) entre Alumnos, Familias y Recibos (ADR-0116)
1. **Garantía y Vinculación Estricta de `family_id`**:
   - En `backgroundCreateStudentInDB`, todo alumno nuevo aprovisiona previamente su familia en `families` y persiste `family_id` en la tabla `students`. Esto garantiza que los joins PostgREST (`students?select=...,families(...)`) resuelvan en vivo con nombre del apoderado, teléfono y email sin retornar nulos.
2. **Auto-Aprovisionamiento Universal de Recibos y Auditoría de Abonos**:
   - Todo alumno activo cuenta exactamente con 1 recibo activo en `invoices` reflejando su plan, costo real, monto abonado y saldo.
   - Cada abono inicial o fraccionado se audita en `payment_audit_logs` con rol responsable, fecha y método de pago.
3. **Depuración de Recibos Obsoletos o Duplicados**:
   - Se eliminan recibos pendientes generados de semillas antiguas que duplican perfiles ya pagados (ej. duplicado previo de Mia Bellido), asegurando que `/admin/facturacion` reporte cuentas claras y consistentes en todos los dispositivos.

---

### 18. Sincronización en Tiempo Real Multi-Pestaña y Multi-Dispositivo entre Panel Administrativo y Agenda Docente (ADR-0117)
1. **Canal de Difusión en Vivo (`DATA_SYNC_CHANNEL` vía `BroadcastChannel` y `localStorage` Heartbeat)**:
   - Toda mutación de horario (`rescheduleLesson`, `addLessonToSchedule`, `removeLessonFromSchedule`), alumnos (`addNewStudent`, `updateStudentDetails`, `setStudentStatus`), asistencias (`markLessonAttendance`, `setAttendance`) y pagos emite una señal instantánea a través del canal `"vibra_live_data_sync"`.
   - Todas las pestañas abiertas (Agenda del Profesor, Kiosco, Admin, Facturación) en el mismo navegador escuchan este canal y re-hidratan de inmediato su estado desde PostgreSQL sin necesidad de recargar la página.
2. **Revalidación al Enfocar y al Cambiar de Pestaña (`visibilitychange` / `window.focus`)**:
   - Cuando el profesor o administrador desbloquea su celular, regresa de WhatsApp o vuelve a enfocar la pestaña del navegador, `useInsforgeSync` revalida automáticamente contra PostgreSQL para asegurar que la vista esté actualizada.
3. **Polling Activo Inteligente en Segundo Plano**:
   - Mientras la aplicación permanezca visible, `useInsforgeSync` realiza un sondeo en segundo plano cada 20 segundos para reflejar cambios ejecutados desde otras computadoras o dispositivos móviles (Nayeli, Karla, Sergio, profesores).
4. **Revalidación en Montaje de Rutas Docentes y Botón Táctil de Refresco**:
   - `TeacherAgendaPage` (`src/routes/teacher.agenda.tsx`) ejecuta `useInsforgeSync()` al montar y provee un botón táctil de actualización rápida `🔄 Sincronizar` para que el docente pueda forzar la recarga de su horario con un toque en sala.
5. **Armonización Estricta de Filtros en `MinimalAgendaCalendar`**:
   - `MinimalAgendaCalendar` aplica los mismos filtros estrictos de `dateStr`, `weekIndex` y `excludedDates` que `AgendaBoard.tsx`, garantizando que lecciones puntuales (como recuperaciones o clases contiguas) solo figuren en su fecha exacta y se reflejen idénticas entre la vista de secretaría y la vista del profesor.

---

### 19. Sincronización Bidireccional PostgreSQL, Refresco Táctil en Admin/Kiosco y Resolución Multimensual de Kardex (ADR-0118)
1. **Botón Táctil de Sincronización con PostgreSQL en Admin y Kiosco**:
   - Se incorpora el botón de rehidratación instantánea `<RotateCw />` en la cabecera de la Agenda Administrativa (`/admin/agenda`) y en el Kiosco Docente (`/teacher`), permitiendo a directores, secretarias y profesores forzar la sincronización en vivo con PostgreSQL con un solo clic/toque en pantalla, mostrando animación de giro y confirmación toast.
2. **Preservación Incondicional de Clases con Fecha Específica (`dateStr`)**:
   - En `isLessonInStudentCycle` (`src/lib/student-cycle.ts`), las sesiones que cuentan con una fecha exacta asignada (`lesson.dateStr && lesson.dateStr === lessonDateStr`) se aprueban incondicionalmente (`return true;`). Esto evita que filtros de cuota mensuales oculten clases reprogramadas o recuperaciones válidas (ej. Mia Lucero Bellido y Karlitoz Pazos en Septiembre 2026).
3. **Corrección del Escaneo Multimensual en Kardex de Asistencias**:
   - En `student-attendance-kardex.tsx`, la validación de semana se realiza comparando `lesson.weekIndex` contra la semana dentro del mes consultado (`curWeekInMonth = weekIdx`), en vez de calcular semanas transcurridas desde `planStartDate` (`Math.floor(offset / 7)`). Esto soluciona la desaparición de clases en la previsualización del Kardex para alumnos con inicio previo al mes en curso (ej. Andrea Fernanda Meza Llallahui, cuyo plan inició en Julio).
4. **Prioridad Absoluta de Horarios Persistidos en PostgreSQL (`emergency_contact.scheduleLessons`)**:
   - En `hydrateFromBackend` (`app-store.ts`), las clases del horario local solo se conservan si el alumno no cuenta con clases oficiales guardadas en PostgreSQL. Al existir `scheduleLessons` en la base de datos, estas tienen prioridad total y sustituyen cualquier caché local obsoleta entre diferentes navegadores y computadoras.
5. **Persistencia Directa de Asistencias desde Kiosco Docente hacia PostgreSQL**:
   - `markLessonAttendance` acepta `dateStr`, registra `attendanceByDate[dateStr]`, actualiza `scheduleLessons` en el estado del alumno y persiste atómicamente hacia `emergency_contact.scheduleLessons` y `attendance_logs` en Insforge PostgreSQL, asegurando sincronización instantánea y consistente en tiempo real entre docentes y secretaría.

---

### 20. ⚠️ Cero Confianza en Caché Local para Estado Transaccional — Post-Mortem del Incidente Admin/Profesor (ADR-0119)

> **Origen de esta regla**: el 21 de septiembre de 2026 se detectó que la Agenda del Profesor (`MinimalAgendaCalendar`, ruta `/teacher/agenda`) no mostraba dos clases de recuperación (Mia Lucero Bellido y Karlitoz Pazos, ambas con Prof. Nathaly) que sí eran visibles correctamente en la Agenda Admin (`AgendaBoard`, ruta `/admin/agenda`), en la misma sesión y con los mismos datos en PostgreSQL. Una sesión de depuración exhaustiva confirmó, línea por línea, que: los datos existían correctamente en `emergency_contact.scheduleLessons`; el emparejamiento de docente (`teacherClean`) era correcto; la comparación de `dateStr` contra `dayInfo.dateStr` era correcta; `isLessonInStudentCycle` debía devolver `true` por `attendanceByDate`; y `hydrateFromBackend` debía dar prioridad absoluta a PostgreSQL (ver ADR-0118.4). **Ninguna de estas verificaciones estáticas reveló el bug.** La sesión se quedó sin presupuesto de tokens (~30% del total consumido en un solo incidente) sin confirmar la causa raíz. La hipótesis más fuerte que quedó pendiente de verificar en tiempo de ejecución es que el snapshot persistido en `localStorage` (vía Zustand `persist`) en el dispositivo/navegador del profesor nunca llega a ser completamente sustituido por el resultado de `hydrateFromBackend`, o que existe una condición de carrera entre el primer pintado (desde `initialSchedule`/`localStorage`) y la sincronización asíncrona con PostgreSQL — lo cual contradice directamente el principio fundacional de ADR-001.3 ("Postgres como única fuente de verdad... nunca almacenar estado transaccional" fuera de la base de datos).

1. **Prohibición Explícita de Confiar en `localStorage`/`persist` para Datos Transaccionales**:
   - Ningún componente (Admin, Profesor, Kiosco) debe leer alumnos, `schedule`/`scheduleLessons`, `attendanceByDate`/`attendance_logs`, `invoices` o `payment_audit_logs` asumiendo que el snapshot de `localStorage` (Zustand `persist`) ya está sincronizado con PostgreSQL.
   - `localStorage` únicamente puede usarse como *placeholder visual mientras carga la conexión* (skeleton/loading state). Su contenido **NUNCA** debe tener prioridad, ni siquiera parcial o por campo individual, sobre el resultado fresco de `hydrateFromBackend`. En caso de conflicto, PostgreSQL gana siempre, sin excepción y sin fusiones parciales que puedan dejar campos obsoletos.
   - Toda vista que muestre horario, asistencia o cobros debe exponer (aunque sea en un log de consola o en un indicador visual discreto) el momento exacto en que terminó su última rehidratación exitosa desde PostgreSQL, para poder diagnosticar divergencias entre dispositivos sin adivinar.
2. **Prohibido Declarar un Bug "Descartado" Solo por Trazado Estático de Código**:
   - Ante cualquier discrepancia confirmada entre dos vistas que leen el mismo store (ej. Admin vs Profesor) donde la lógica, leída línea por línea, "debería funcionar en teoría", el agente **NO** puede concluir que la lógica está bien y detenerse ahí. Debe instrumentar el código en tiempo de ejecución (logs temporales, breakpoints, o pedir al usuario capturas reales de consola/`localStorage`/pestaña de Red del dispositivo afectado) antes de cerrar o pausar la investigación.
   - Se debe considerar explícitamente, como hipótesis alterna a un bug de lógica pura, la posibilidad de: caché de `Service Worker`, caché de edge/CDN de Cloudflare Pages sirviendo un bundle de JS desactualizado al dispositivo del profesor, o un `localStorage` con datos de una sesión anterior que nunca se purgó.
3. **Fuente Única de Verdad para la Lógica de Filtrado de Lecciones**:
   - Toda lógica de filtrado por `dateStr`, `weekIndex`, `excludedDates`, `isMakeup` y `attendanceByDate` que hoy vive duplicada en `AgendaBoard.tsx`, `MinimalAgendaCalendar.tsx` y `student-attendance-kardex.tsx` debe migrarse a una única función pura y compartida (p. ej. `src/lib/lesson-visibility.ts`), importada por los tres. Está **PROHIBIDO** seguir reimplementando el mismo filtro de forma independiente en un componente nuevo o existente "porque se ve equivalente": las divergencias sutiles entre copias duplicadas ya motivaron los parches puntuales de ADR-0102, ADR-0107, ADR-0114, ADR-0115 y ADR-0117 sin eliminar la causa estructural (la duplicación en sí).
   - Cualquier corrección futura a esta lógica se aplica en el archivo compartido único; una corrección que solo toque una de las copias duplicadas se considera incompleta y no cierra el ticket.
4. **Protocolo de Cierre para Incidentes de Paridad Admin/Profesor/Kiosco**:
   - Antes de dar por resuelta cualquier tarea de este tipo, se debe confirmar en el dispositivo real donde ocurría el problema (no solo en desarrollo) que: (a) se inspeccionó el `localStorage` real de ese dispositivo, (b) se purgó o reconcilió si contenía datos obsoletos, y (c) el fix se verificó con datos frescos de PostgreSQL y no solo con lectura estática del código.
5. **Resolución Confirmada y Eliminación de Caching Local Transaccional**:
   - Se validó mediante simulación en tiempo de ejecución directa (`scratch/test-runtime-pure.mjs`) con datos en vivo de Insforge PostgreSQL que las 4 clases de Mia Lucero Bellido y Karlitoz Pazos (incluyendo recuperaciones con `dateStr`) son aprobadas y renderizadas en la Semana 4 (Lunes 21 de Setiembre).
   - NOTA DE CORRECCIÓN (2026-09-22): la afirmación anterior de que `schedule`, `adminStudents` e `invoices` se desacoplaron de `localStorage` en `partialize` era incorrecta; `src/store/app-store.ts:2866-2880` todavía los persiste. No volver a afirmar el desacople sin verificar el código.
   - Se limpiaron las menciones de "Nayeli" en el pie de WhatsApp de `minimal-agenda-calendar.tsx` y en las pestañas de `agenda-board.tsx`.
6. **Causa Raíz Confirmada con Evidencia de Consola en Producción (2026-09-22)**:
   - Síntoma: Agenda Admin mostraba 15 clases en una PC (Edge, con snapshot viejo en `localStorage`) y 0 clases en otra PC (Chrome, almacenamiento limpio), con el error en consola `[Insforge Sync] Operando en fallback Zustand local: ReferenceError: normalizeStudentName is not defined` en cada intento de `hydrateFromBackend`.
   - Causa: `src/store/app-store.ts` usaba `normalizeStudentName` (`hydrateFromBackend`, deduplicación de homónimos activos) sin importarla de `@/lib/student-matching` (línea 39 solo importaba `isMatchingStudentName, resolveStudentUUID, isSameStudentId`). Al correr la sincronización, lanzaba `ReferenceError`, el `catch` de `useInsforgeSync` lo tragaba como "fallback local" y el `schedule` quedaba vacío en cualquier dispositivo sin caché previa. Por eso la función de asistencia docente (que lee `attendance_logs` por otro servicio) seguía activa mientras el horario aparecía vacío.
   - Fix MVP: agregar `normalizeStudentName` al import de `src/store/app-store.ts:39`. Cambio de 1 línea, sin tocar lógica de filtrado, Kardex, facturación ni asistencia. Tras desplegar, verificar en la PC afectada que la consola muestre `[Insforge Sync] Sincronización en tiempo real exitosa` y `CLASES PROGRAMADAS: 15`.

---

### 21. Protocolo Anti-Bucle de Depuración y Uso Eficiente de Tokens (ADR-0120)

> **Origen de esta regla**: durante la investigación de ADR-0119, el agente repitió decenas de veces la misma conclusión ("esto debería funcionar en teoría, no encuentro el bug") sin incorporar evidencia nueva entre repeticiones, agotando cerca del 30% del presupuesto total de tokens del proyecto en una sola sesión sin llegar a una causa raíz confirmada ni dejar un resumen guardado para la siguiente sesión.

1. **Regla del "Circuit Breaker"**:
   - Si el agente se descubre repitiendo una conclusión ya alcanzada (p. ej. "en teoría esto debería funcionar") **3 veces o más** sin incorporar un dato nuevo (un log real de ejecución, un archivo no revisado antes, una respuesta del usuario), debe **detenerse de inmediato** y ejecutar los tres pasos siguientes, en orden:
     1. Guardar en memoria persistente (`engram` o el mecanismo de memoria disponible) un resumen con: síntoma exacto, hipótesis descartadas y por qué, hipótesis pendientes de verificar, y la lista de archivos/líneas ya revisados en esta sesión.
     2. Cambiar de método de investigación: abandonar la relectura estática de código y pasar a instrumentación en tiempo real (logs temporales desplegados, o solicitar al usuario capturas directas de consola/Network/`localStorage` del dispositivo afectado).
     3. Si tras cambiar de método el bug sigue sin resolverse, comunicar al usuario el estado exacto de la investigación (qué se descartó y qué 2-3 hipótesis quedan) en vez de seguir consumiendo tokens en el mismo bucle.
2. **Presupuesto Máximo por Hipótesis**:
   - No gastar más de ~8-10 llamadas de herramienta verificando una sola hipótesis de causa raíz antes de documentarla (descartada o confirmada) y pasar a la siguiente, o pausar y reportar.
3. **Prioridad de Herramientas de Grafo sobre Lectura Manual (recordatorio reforzado)**:
   - `graphify` (o el servidor MCP equivalente que exponga grafo de dependencias) se usa **siempre** antes de releer un archivo completo o hacer grep manual. Releer un archivo ya leído en la misma sesión sin una razón nueva y específica (ej. "acabo de cambiar esta línea, confirmo el resultado") está prohibido — es exactamente el patrón que agotó el presupuesto de tokens en el incidente de ADR-0119.
4. **Reanudación de Tareas Interrumpidas por Límite de Tokens**:
   - Al reanudar una investigación que fue cortada por falta de presupuesto, el primer paso siempre es leer el resumen guardado en memoria persistente (`engram`), no reiniciar la investigación desde cero repitiendo pasos ya hechos.
   - Si no existe un resumen guardado (como ocurrió en el incidente de ADR-0119), el agente debe reconstruir en un único bloque, al inicio de la nueva sesión, el estado conocido: qué se confirmó, qué se descartó y cuál es la hipótesis principal pendiente — antes de ejecutar ninguna herramienta nueva.

### 22. Matriz Pedagógica de Cursos, Salas Oficiales, Aforos y Reglas de Convivencia (ADR-0121)
1. **Asignación Oficial de Salas por Especialidad Docente**:
   - **Prof. Jeremy** $\rightarrow$ **Sala "A"**: Batería y Guitarra.
   - **Prof. Fernando** $\rightarrow$ **Sala "B"**: Violín y Piano (estándar, Juvenil y Master).
   - **Prof. Nathaly** $\rightarrow$ **Sala "C"**: Piano Infantil (5 a 6 años) y Canto.
   - **Prof. Claudia** $\rightarrow$ **Sala "D"**: Estimulación Musical (4 a 5 años) y Clases Demo de Principiantes exclusivamente.
   - **Clases Demo de Nivelación**: Se dictan exclusivamente con el **Profesor Especialista** en su respectiva sala (A, B o C). Prohibido asignarlas a Sala D.
2. **Aforos y Reglas de Convivencia por Categoría de Edad**:
   - **Estimulación Musical (4 a 5 años)**: Sala D exclusiva con Claudia. Aforo máx: hasta 5 alumnos homogéneos de su misma categoría. Prohibido mezclar con otras edades.
   - **Infantil (5 a 6 años)**: Sala C exclusiva con Nathaly. Aforo máx: hasta 5 alumnos homogéneos de su misma categoría. Prohibido mezclar con otras edades.
   - **Junior (7 a 12 años)**: Aforo máx: hasta 5. Puede compartir sala con **Juvenil (13-17)**. **PROHIBIDO compartir sala con Master (18+)**.
   - **Juvenil (13 a 17 años)**: Aforo máx: hasta 5. Puede compartir sala con Junior o con Master.
   - **Master (18+ años)**: Aforo máx: hasta 5. Puede compartir sala con Juvenil. **PROHIBIDO compartir sala con Junior**. En base de datos se preserva compatibilidad con `ADULTO`.
   - **Personalizado**: Aforo estricto = **1 alumno máx**. Sesión de 45 min. Prohibido compartir sala con cualquier otro alumno.
   - **Clase Demo Principiante**: Aforo = **1 alumno máx**. Sala D exclusiva con Claudia.
   - **Clase Demo Nivelación**: Aforo = **1 alumno máx**. Con profesor especialista en su sala.
3. **Convivencia por Duración de Sesión (45 min vs. 90 min)**:
   - Sesiones de **45 minutos** (Regular Normal, Regular Extenso, Paquete Flexible) pueden convivir en la misma sala hasta el aforo de 5 si respetan la compatibilidad de edad.
   - Sesiones de **45 minutos** y **90 minutos** (Plan Intensivo) **NO** pueden compartir sala.
   - *Excepción:* Paquete Flexible con sesión de 90 min declarada **SÍ** puede compartir sala con Plan Intensivo (90 min).
   - Personalizado y Demo Nivelación jamás comparten sala con ningún otro plan.
4. **Validación Preventiva en Agenda**:
   - Ante cualquier incompatibilidad de edad, duración o aforo individual, la agenda emite una **Alerta Visual Preventiva (Amarillo/Rojo) con Opción de Confirmación** para no bloquear la operativa de secretaría en excepciones justificadas.

---

### 23. Matrícula en Demo Nivelación, Erradicación de Asistencia Fantasma, Control de Asistencias en Modal e Idempotencia en PostgreSQL (ADR-0122)
1. **Regla de Matrícula en Demo Nivelación (No asumir costo cero)**:
   - Todo plan contratado contempla matrícula por defecto. Al seleccionar `Demo Nivelación`, el sistema inicializa la matrícula en **`Promo Demo (S/ 30)`** (75% de descuento sobre la matrícula regular de S/ 120).
   - Queda **TERMINANTEMENTE PROHIBIDO** forzar automáticamente `setMatriculaType("Exonerada")`. La opción de exoneración existe en el dropdown, pero debe ser una decisión explícita de secretaría o dirección.
2. **Prohibición de Fallback de Template en Semanas Activas (Fin de Asistencia Fantasma)**:
   - En las vistas del Horario de Clases (`Excel`, `Semanal`, `Diario`, `Sábado` y `Modal`), queda **TERMINANTEMENTE PROHIBIDO** evaluar fallbacks del tipo:
     `(safeWeekIndex === currentWeekIndex ? lesson.attendanceStatus : undefined)`.
   - Si una clase recurrente no tiene fecha registrada en `attendanceByDate` ni semana en `attendanceByWeek`, su estado visual es estrictamente **pendiente (`undefined`)**, evitando que clases de semanas en curso (ej. viernes 25 de Setiembre) aparezcan marcadas como presentes sin haber sido evaluadas.
   - En `markLessonAttendance`, las plantillas recurrentes (`weekIndex === undefined`) no deben mutar `attendanceStatus` global.
3. **Botón Interactivo de Restablecimiento en Modal de Clase**:
   - El modal de asistencia rápida de clase (`agenda-board.tsx`) debe incorporar siempre el botón **`⚪ Restablecer a Pendiente / Sin marcar`** con icono `RotateCcw`, permitiendo al usuario deshacer marcas accidentales o de prueba.
   - Todas las llamadas de asistencia en este modal deben enviar `selectedDayDateStr` como 5° parámetro (`dateStr`).
4. **Cálculo Exacto en Widget "Control de Asistencias del Alumno"**:
   - El widget del modal de clase debe consolidar todas las asistencias registradas en `attendanceByDate` del alumno (presentes, ausentes, tardes, justificadas) y proyectar la cuota mensual contratada (4 para Intensivo/1x, 8 para Regular 2x, 1 para Demo Nivelación).
   - Prohibido contar `studentLessons.length` (que solo mide plantillas de franja) ni evaluar únicamente `l.attendanceStatus`, evitando falsas alertas de "Faltan clases por agendar".
5. **Idempotencia y Borrado Preciso en `attendance_logs` de PostgreSQL**:
   - Al registrar `status === "pendiente"`, `backgroundSyncAttendanceLogToDB` busca prioritariamente por fecha calendario (`like.*Fecha ${dateStr}*`), eliminando cualquier registro previo en esa fecha sin importar si fue creado por Kiosco, Agenda o Kardex.
   - Al insertar un nuevo registro con fecha, se elimina de antemano cualquier log existente de esa misma fecha para garantizar 0 duplicados en la base de datos.
   - En `hydrateFromBackend`, se ordenan cronológicamente (`registered_at ASC`) los logs antes de procesar, garantizando que el registro más reciente prevalezca siempre.

---
---

# Guía de uso de servidores MCP (pegar al inicio del proyecto / AGENTS.md)

> Objetivo: que el agente use la herramienta correcta para cada tarea en vez de
> leer/grepear archivos completos, que es lo que agota los tokens y lo que
> probablemente causó que la webapp se rompiera por cambios que rompían algo
> "invisible" en otro archivo.

## 0. Antes de usar esto: verifica qué tienes REALMENTE instalado

Nombres como "CodeAtlas", "Graphify" y "Engram" corresponden a varios proyectos
distintos de distintos autores (no son un estándar único). Haz clic en la ">"
de cada servidor en tu panel de MCP para ver la lista real de tools expuestos,
y ajusta la sección 1 si no coincide con lo que ves. Esto evita que le des al
agente instrucciones sobre una herramienta que no es la que tienes.

## 1. Rol de cada servidor y cuándo usarlo

| Servidor | Función principal | Úsalo cuando... | NO lo uses para... |
|---|---|---|---|
| **engram** | Memoria persistente entre sesiones (decisiones, bugs ya resueltos, arquitectura) | Al iniciar sesión (recuperar contexto) y al terminar una tarea importante (guardar resumen) | Preguntas puntuales de sintaxis o detalles que no necesitan persistir |
| **graphify** (PRIMARIO, estructural) | Grafo crudo del código: qué llama a qué, vecinos, ruta más corta, impacto | En TODA tarea que edite una función/módulo compartido: antes de editar (impacto) y después (confirmar que no rompiste nada) | Pedirle explicaciones narrativas largas — para eso está codeatlas |
| **codeatlas** (SECUNDARIO, semántico/documental) | Capa narrativa sobre el código: explicaciones en lenguaje natural, resumen de arquitectura, wiki/documentación | Cuando necesites una explicación para humanos ("qué hace este módulo y por qué"), generar/actualizar documentación, o planear una feature grande | Como chequeo de impacto antes de cada edit — es más lento y más caro en tokens que graphify para eso |
| **data-agent-kit** | Consultas y transformación sobre datos estructurados / operaciones analíticas | Tareas de análisis de datos, consultas sobre fuentes externas | Tareas de UI, estilos, o lógica que no toca datos |
| **insforge-postgres** | Acceso puntual a tu base Postgres (esquema/queries) | Necesitas ver el esquema real o correr una query específica | Como fuente de "contexto general" del proyecto |
| **gemini-api-docs** | Documentación de la API de Gemini | Estás integrando o depurando llamadas a esa API | Cualquier otra tarea |
| **notebooks** | Ejecutar/gestionar notebooks | Prototipado de datos o análisis exploratorio | Tareas normales de desarrollo web |
| **visualization** | Generar diagramas/gráficos | Cuando ya tienes la estructura (vía graphify/codeatlas) y quieres el diagrama final | Como sustituto de leer el grafo |

## 2. División de trabajo entre graphify y codeatlas (la más coherente)

No son intercambiables si los usas para lo que cada uno hace mejor:

- **Graphify = el "reflejo" automático del agente.** Es una consulta directa
  al grafo (sin pasar por un LLM intermedio), por eso es barata: del orden de
  ~235 tokens para ubicar algo contra ~60 000 tokens de grep+leer archivos.
  Es la herramienta que va a evitar que la webapp se vuelva a romper: úsala
  SIEMPRE antes de tocar algo compartido, en cada tarea, sin pedir permiso.
- **CodeAtlas = la herramienta deliberada.** Genera explicación/documentación
  (normalmente pasa por un LLM para redactar), así que cuesta más tokens por
  llamada. Se usa a propósito, pocas veces por sesión: para entender un área
  nueva del proyecto, redactar documentación, o justificar una decisión de
  diseño antes de un cambio grande.

En una palabra: graphify responde "¿qué toco y qué se rompe?" en cada edit;
codeatlas responde "¿por qué está hecho así y cómo lo explico?" cuando hace
falta, no en cada edit. Con esta división mantienes el mayor contexto posible
(estructural + narrativo) sin pagar dos veces por lo mismo.

## 3. Bloque para pegar al inicio del proyecto (system prompt / AGENTS.md)

```
## Política de uso de herramientas MCP (seguir en TODA tarea)

Antes de leer archivos manualmente o hacer búsquedas de texto libres, sigue
este orden:

1. Memoria de proyecto (engram): al empezar, recupera contexto de sesiones
   previas (decisiones, convenciones, bugs ya resueltos) en vez de volver a
   descubrirlo. Al terminar una tarea relevante, guarda un resumen corto.

2. Impacto estructural (graphify, SIEMPRE): antes de modificar cualquier
   función, componente o módulo, consulta su grafo de dependencias (qué lo
   llama, qué llama él). Si existe una consulta de "impacto" o "tests
   recomendados", úsala antes de editar y de nuevo antes de dar por cerrada
   la tarea. Esto es obligatorio, no opcional, incluso en cambios que
   parezcan pequeños.

2b. Explicación/documentación (codeatlas, SOLO A PROPÓSITO): úsalo cuando la
   tarea requiera entender el "por qué" de un área del código, redactar o
   actualizar documentación, o dar contexto a un humano — no como parte del
   chequeo rutinario de cada edit.

3. Datos (data-agent-kit) y backend (insforge-postgres): solo cuando la
   tarea implique explícitamente datos o la base de datos. No los consultes
   "por si acaso".

4. Documentación externa (gemini-api-docs): solo si la tarea toca la API de
   Gemini.

5. Notebooks / visualization: al final, para prototipos de datos o para
   entregar el diagrama/gráfico que se pidió — no como forma de explorar el
   código.

Regla de oro: si una herramienta de grafo o de memoria puede responder la
pregunta con una consulta dirigida, NO leas el archivo completo ni hagas
grep manual. Eso es lo que agota el contexto/tokens.

Antes de cerrar cualquier tarea que modifique una función usada en más de un
lugar, corre la consulta de impacto del grafo para confirmar que no rompiste
nada fuera del archivo que editaste.

REGLA ANTI-BUCLE (ver ADR-0120 en la Parte 1): si en una tarea de depuración
repites 3 veces la misma conclusión ("en teoría esto debería funcionar") sin
evidencia nueva, DETENTE, guarda el resumen en engram, y cambia de método
(instrumentación en tiempo real en vez de más lectura estática).
```

## 4. Que se actualicen en tiempo real

- **Grafo de código (graphify/codeatlas):** normalmente no se auto-actualiza
  solo; necesita un comando de re-escaneo incremental (en Graphify suele ser
  algo como `--update`, que solo reprocesa archivos cambiados). Pide al
  agente que lo corra automáticamente al inicio de cada sesión y después de
  cualquier refactor grande, en vez de en cada mensaje (para no gastar
  tokens en rebuilds innecesarios). Si tu versión expone una herramienta de
  "freshness"/chequeo de cambios, úsala primero: si dice que no hay cambios
  estructurales, no hace falta reconstruir el grafo.
- **Memoria (engram):** normalmente se guarda de forma incremental cada vez
  que el agente llama a la función de "guardar", así que solo necesitas
  pedirle explícitamente que guarde al cerrar cada tarea importante.
- **Datos/backend:** no necesitan "tiempo real"; se consultan on-demand.

## 5. Próximo paso

Expande cada servidor en tu panel de MCP y dime qué tools exactos aparecen
bajo `codeatlas`, `notebooks` y `visualization` (son los tres donde hay más
de un producto posible con ese nombre). Con eso te ajusto la tabla de la
sección 1 para que quede exacta a lo que realmente tienes, en vez de una
inferencia.

## 6. Protocolo Anti-Bucle de Depuración y Checkpoints de Memoria (NUEVO — post-incidente 2026-09-21)

> Contexto: una sesión de depuración (bug de paridad entre Agenda Admin y
> Agenda Profesor, ver ADR-0119/ADR-0120 en la Parte 1) consumió ~30% del
> presupuesto de tokens del proyecto re-derivando la misma conclusión lógica
> decenas de veces, sin instrumentar el código en tiempo de ejecución y sin
> guardar ningún resumen en memoria antes de agotarse. Esta sección existe
> para que no se repita.

1. **Detector de bucle**: si notas que ya llegaste a la misma conclusión
   ("la lógica debería funcionar, no encuentro el bug") más de 2 veces en la
   misma tarea sin haber incorporado un dato de ejecución real nuevo, es
   una señal de alarma explícita. No sigas "pensando más fuerte" sobre el
   mismo código ya leído: cambia de fuente de evidencia.
2. **Orden de escalamiento cuando el análisis estático no resuelve el bug**:
   1. `graphify`: confirma que no falta ningún llamador/dependencia fuera
      del archivo que ya revisaste.
   2. Instrumentación real: agrega logs temporales y pide al usuario (o
      ejecuta tú mismo si tienes el entorno) la salida real de consola /
      pestaña de Red / contenido de `localStorage` en el dispositivo donde
      ocurre el problema — nunca asumas el contenido de `localStorage`,
      pídelo o léelo directamente.
   3. Si el bug involucra una discrepancia entre dos vistas/dispositivos
      (como Admin vs Profesor), verifica primero si ambos están leyendo el
      mismo resultado de `hydrateFromBackend` o si uno de los dos está
      sirviendo un snapshot de `localStorage`/caché de build no reconciliado
      (ver ADR-0119).
   4. Solo si lo anterior no revela la causa, considera hipótesis de
      infraestructura: caché de CDN/Cloudflare Pages, Service Worker, o
      bundle de JS desactualizado en el dispositivo del usuario final.
3. **Checkpoint obligatorio antes de quedarte sin presupuesto**: si estás
   en medio de una investigación larga y notas que el contexto/tokens se
   están agotando, guarda de inmediato en `engram` (o dilo explícitamente
   en tu respuesta si no tienes memoria persistente disponible) un resumen
   de: síntoma, datos confirmados, hipótesis descartadas con motivo, e
   hipótesis pendiente más probable — para que la siguiente sesión (sea el
   mismo agente u otro, incluso en otra herramienta) continúe desde ahí en
   vez de repetir el mismo camino desde cero.

---

### 24. Demo Nivelación (Tarifa Abierta), Restricción a Base Activa y Deduplicación de Leyenda (ADR-0122)
1. **Modalidad y Plan "Demo Nivelación" (Opción C - Tarifa Abierta)**:
   - Duración: exactamente **45 minutos** por sesión.
   - Aforo: **1 solo alumno** (exclusivo). No comparte sala con ningún otro alumno ni admite múltiples alumnos simultáneos en ese turno.
   - Costo: **Tarifa abierta / libre** (Opción C seleccionada por dirección). El valor por defecto en catálogo es S/ 0.00 y la secretaría digita libremente el monto acordado.
   - Matrícula: Exonerada (S/ 0.00).
   - Cuota contractual objetivo: **1 clase** (`targetQuota = 1`).
2. **Directorio de Alumnos (`/admin/alumnos`) — Base Activa Exclusiva**:
   - La tabla principal del Directorio muestra **únicamente alumnos activos** (`status: "activo"`).
   - Los alumnos históricos inactivos (`baja`, `pausa`) jamás deben contaminar la vista del directorio principal ni cargarse por defecto. Su consulta y reactivación 1 a 1 se realiza exclusivamente en el panel modal "Depuración & Reactivación 2026" (`StudentCleanupPanel`).
3. **Libreta de Asistencias y Plan (`agenda-board.tsx`)**:
   - `filteredLedgerList` filtra con condición innegociable `st.status === "activo"`. Ningún alumno inactivo o dado de baja debe figurar en el control de asistencias y plan.
4. **Leyenda de Categorías en Horario de Clases**:
   - En la interfaz gráfica del horario semanal, diario y vista didáctica Excel, las etiquetas de leyenda se renderizan a través de `legendCategoryStyles`, excluyendo el alias de compatibilidad técnica `ADULTO`. La categoría `MASTER` se renderiza exactamente una sola vez.

---

### 25. Aislamiento Estricto por ID en Eliminación por Checkbox, Detección de Duplicados y Preservación de Horario (ADR-0125)
1. **Detección Reactiva de Duplicados al Matricular (`NewStudentDialog`)**:
   - En el formulario de matrícula ("Matricular Nuevo Alumno"), la entrada del nombre se coteja reactivamente en tiempo real (`isMatchingStudentName`) contra todos los perfiles de `adminStudents`.
   - Si coincide con un alumno activo: despliega una alerta prominente (*"⚠️ Estás agregando un alumno que ya existe"*) y bloquea la matrícula a menos que secretaría confirme conscientemente mediante checkbox que se trata de un homónimo real.
   - Si coincide con un alumno inactivo (baja o pausa): despliega un aviso informativo (*"ℹ️ Este alumno ya figura en la base histórica"*) recomendando reactivarlo desde el panel *"Depuración & Reactivación 2026"* para preservar su historial y asistencias.
2. **Preservación Incondicional del Horario ante Eliminación de Copias/Duplicados**:
   - Al ejecutar `deleteStudent` o `deleteStudents`, el store verifica si tras remover el alumno con `id` **aún existe otro alumno ACTIVO con el mismo nombre**.
   - Si aún queda un alumno activo con ese nombre, **las clases del horario (`schedule`) no se tocan ni eliminan**, protegiendo el cronograma del alumno legítimo.
3. **Aislamiento Estricto por ID en Mutaciones de Estado y Ficha**:
   - En `updateStudentDetails` y `setStudentStatus`, si se encuentra coincidencia exacta por ID (`isSameStudentId`), se actualiza únicamente ese registro específico. El fallback por coincidencia de nombre solo opera si no existe ningún registro coincidente por ID (migración de semillas heredadas), impidiendo mutaciones en cascada sobre homónimos.
4. **Modal de Eliminación Múltiple Detallado**:
   - El diálogo de confirmación de eliminación múltiple (`deleteModalOpen`) muestra un listado interactivo con el nombre, ID truncado, familia, profesor e instrumento de cada alumno seleccionado, permitiendo remover individualmente a cualquier alumno (`✕`) de la cola de eliminación antes de confirmar.

---

### 26. Sincronización en Tiempo Real Docente, Cola de Peticiones en Vuelo y Persistencia de Auditoría (ADR-0126)
1. **Cola de Revalidación en Vuelo (`queuedSyncRef`) en `useInsforgeSync`**:
   - Está **TERMINANTEMENTE PROHIBIDO** descartar silenciosamente señales de `BroadcastChannel`, `StorageEvent` o recarga forzada cuando una petición HTTP a PostgreSQL ya se encuentra en curso (`inFlightRef.current === true`).
   - El hook encola la solicitud entrante mediante `queuedSyncRef.current = true` y la ejecuta de inmediato en el bloque `finally` con retardo de 80 ms, impidiendo que las vistas docentes queden congeladas con snapshots antiguos tras guardados en administración.
2. **Emisión Atómica Exclusivamente Post-Escritura en PostgreSQL**:
   - Está **TERMINANTEMENTE PROHIBIDO** emitir señales de sincronización inter-pestañas (`triggerDataSyncBroadcast`) de forma anticipada antes o durante timers de debounce (`setTimeout`), ya que provocan que los clientes remotos lean datos obsoletos antes de la escritura física.
   - En `backgroundSyncStudentToDB` y `performSyncStudentToDB`, la señal `triggerDataSyncBroadcast("student-sync")` se emite **únicamente dentro del `.then` confirmatorio** de `updateStudent(...)` en PostgreSQL.
3. **Persistencia de Sesión para Auditoría Docente (`sessionStorage`)**:
   - El selector de profesor para auditoría (`adminSelectedTeacher`) se almacena en `sessionStorage` (`vibra_audit_teacher`).
   - Al alternar entre el Kiosco Docente (`/teacher`) y la Agenda Semanal (`/teacher/agenda`), se preserva de forma continua el docente inspeccionado (Jeremy, Nathaly o Fernando) sin resetear a Fernando.
4. **Indicador Visual de Estado en Vivo y Atajos en Días Vacíos**:
   - Ambas cabeceras docentes (`teacher.index.tsx` y `teacher.agenda.tsx`) exponen una píldora visual en vivo (`🟢 En vivo · Sincronizado hace Xs`) conectada a `lastSyncTime` y el botón táctil `🔄`.
   - Si un profesor no tiene clases el día seleccionado (ej. Jeremy los viernes), el estado vacío muestra de inmediato atajos directos a los días en que sí dicta (ej. `Mar (3)`, `Jue (4)`), evitando falsas alarmas de horario perdido durante auditorías.
5. **Paridad Total en Métodos de Eliminación de Clases**:
   - Tanto `removeLessonFromSchedule` como `deleteLessonFromSchedule` actualizan de forma atómica el horario local, las `scheduleLessons` del alumno y disparan la sincronización persistente hacia PostgreSQL con `backgroundSyncStudentToDB`.

---

### 27. Navegación Determinista a Días Pareados y Cierre de Sesión Resiliente (ADR-0127)
1. **Inicialización Determinista sin Bloqueo Manual en Horario (`agenda-board.tsx`)**:
   - Al iniciar la jornada y abrir el sistema, `AgendaBoard` calcula el par y día por defecto evaluando `new Date().getDay()`:
     - **Viernes (5) / Sábado (6)**: `selectedPairIndex = 2` ("Viernes y Sábado"), `selectedDayIndex = 4` (Vie) / `5` (Sáb).
     - **Martes (2) / Jueves (4)**: `selectedPairIndex = 1` ("Martes y Jueves"), `selectedDayIndex = 1` (Mar) / `3` (Jue).
     - **Lunes (1) / Miércoles (3)**: `selectedPairIndex = 0` ("Lunes y Miércoles"), `selectedDayIndex = 0` (Lun) / `2` (Mié).
     - **Domingo (0)**: `selectedPairIndex = 0`, `selectedDayIndex = 0`.
   - **Prohibición de `useEffect` Restrictivos**: Queda **TERMINANTEMENTE PROHIBIDO** colocar un `useEffect` que sobreescriba o fuerce estos índices ante re-renders. Los selectores se inicializan exclusivamente mediante callbacks lazy de `useState(() => ...)`. El usuario debe poder alternar libremente y de forma manual entre días, pares y las 3 vistas (**📊 Vista Didáctica**, **📱 Vista por Día** y **🗓️ Rejilla Semanal**) sin experimentar bloqueos o regresiones forzadas.
   - **Sincronización del Botón de Reinicio**: El botón de "Ir al mes actual" reinicializa fecha, semana, par y día con los valores de la fecha en curso.
2. **Cierre de Sesión Infalible y Redirección Dura (`admin.tsx`, `role-switcher.tsx`)**:
   - Está **TERMINANTEMENTE PROHIBIDO** invocar `logout()` sin acompañarlo de una redirección forzada a `window.location.href = "/"`.
   - TanStack Router no re-evalúa `Route.beforeLoad` mientras el usuario permanece en la misma ruta. Todo layout autenticado (`AdminLayout`, `TeacherLayout`, `FamilyLayout`) debe incorporar un guardián reactivo `useEffect(() => { if (!isAuthenticated) window.location.href = "/"; }, [isAuthenticated])`.
   - `handleLogout` debe limpiar `sessionStorage` para no arrastrar estados de auditoría docente (`vibra_audit_teacher`), ejecutar `logout()` y redirigir inmediatamente a `/`.
3. **Accesibilidad Universal y Responsive del Botón de Salida**:
   - El botón de cierre de sesión en `admin.tsx` debe ser accesible en **todas las resoluciones de pantalla**, mostrando el ícono `LogOut` en dispositivos móviles (`< 640px`) y texto completo en pantallas de escritorio.
   - En la barra lateral (`<aside>`), el pie debe contar con un botón dedicado de "Cerrar Sesión" tanto en modo expandido como colapsado y en el drawer de móviles.

---

### 28. Sincronización Estricta entre Kiosco Docente y Agenda mediante Validación de Ciclo Contractual (ADR-0128)
1. **Unificación Innegociable del Motor de Filtrado en Kiosco (`teacher.index.tsx`)**:
   - El Kiosco Docente (`/teacher`) y las Agendas (`/teacher/agenda`, `/admin/agenda`) deben compartir **el mismo motor determinista de ciclo contractual**.
   - `isLessonInDay` en `teacher.index.tsx` **DEBE** invocar obligatoriamente `isLessonInStudentCycle(studentProfile, lesson, dateStr, lesson.time, schedule)` y verificar `excludedWeeks` además de `excludedDates`.
2. **Erradicación de Clases "Fantasma" en Sesiones Reprogramadas o Adelantadas**:
   - Si una clase puntual fue justificada y adelantada a otro día de la semana (ej. Mia Lucero Bellido Alvan, cuya clase del viernes 25 se adelantó al jueves 24 y fue asistida con `🟢 PRESENTE`), la sesión original **NO DEBE** figurar como pendiente en el Kiosco ni sumar al contador del día original.
3. **Erradicación de Semillas Obsoletas Duplicadas**:
   - Si un alumno activo cuenta con clases oficiales persistidas en `studentProfile.scheduleLessons`, cualquier semilla antigua residual (ej. Sasha Contreras `sch-34` a las 17:30) debe ser invalidada por `isLessonInStudentCycle`, asegurando que el Kiosco y la Agenda muestren exactamente la misma cantidad de clases (ej. 1 sola clase a las 18:15 en Martes).
4. **Resolución de Asistencia Prioritaria desde Ficha Oficial**:
   - Al renderizar el estado de asistencia (`status`) en la tarjeta del Kiosco, se debe consultar prioritariamente `studentProfile.scheduleLessons` para que cualquier marca guardada en Kardex o rehidratada de PostgreSQL se refleje instantáneamente sin depender de la rehidratación asíncrona de `schedule`.