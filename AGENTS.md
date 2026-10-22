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
   - En `AgendaBoard`, toda lección con `dateStr` se valida exclusivamente contra los días de la semana visualizada (`currentWeekObj.days.some(d => d.dateStr === l.dateStr)`), omitiendo incondicionalmente el filtro de coincidencia fija `l.weekIndex !== safeWeekIndex`. Esto garantiza que recuperaciones y reprogramaciones puntuales (ej. Alumna M.B.) se muestren en la semana de su fecha real y no sean filtradas por el índice de la clase original ausente.
   - En `rescheduleLesson` (`app-store.ts`), al crear una reprogramación de alcance *"Solo esta sesión"* con `newDateStr`, `weekIndex` se fija en `undefined` para evitar heredar índices estáticos obsoletos.
2. **Soporte de Fechas Excluidas en Celdas de Horario (`excludedDates`)**:
   - `AgendaBoard` valida `l.excludedDates?.includes(lessonDayInfo.dateStr)` para ocultar la clase original en el día específico en que fue reprogramada, evitando duplicidades visuales.
3. **Ampliación de Ventana Lectiva 2026**:
   - El límite inferior del año 2026 en `AgendaBoard` se amplía a Julio 2026 (`selectedMonth < 6`) para permitir la renderización de paquetes flexibles y ciclos iniciados a mitad de año (ej. Alumna A.M.).

---

### 17. Integridad Relacional en PostgreSQL (Insforge) entre Alumnos, Familias y Recibos (ADR-0116)
1. **Garantía y Vinculación Estricta de `family_id`**:
   - En `backgroundCreateStudentInDB`, todo alumno nuevo aprovisiona previamente su familia en `families` y persiste `family_id` en la tabla `students`. Esto garantiza que los joins PostgREST (`students?select=...,families(...)`) resuelvan en vivo con nombre del apoderado, teléfono y email sin retornar nulos.
2. **Auto-Aprovisionamiento Universal de Recibos y Auditoría de Abonos**:
   - Todo alumno activo cuenta exactamente con 1 recibo activo en `invoices` reflejando su plan, costo real, monto abonado y saldo.
   - Cada abono inicial o fraccionado se audita en `payment_audit_logs` con rol responsable, fecha y método de pago.
3. **Depuración de Recibos Obsoletos o Duplicados**:
   - Se eliminan recibos pendientes generados de semillas antiguas que duplican perfiles ya pagados (ej. duplicado previo de Alumna M.B.), asegurando que `/admin/facturacion` reporte cuentas claras y consistentes en todos los dispositivos.

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
   - En `isLessonInStudentCycle` (`src/lib/student-cycle.ts`), las sesiones que cuentan con una fecha exacta asignada (`lesson.dateStr && lesson.dateStr === lessonDateStr`) se aprueban incondicionalmente (`return true;`). Esto evita que filtros de cuota mensuales oculten clases reprogramadas o recuperaciones válidas (ej. Alumna M.B. y Alumno K.P. en Septiembre 2026).
3. **Corrección del Escaneo Multimensual en Kardex de Asistencias**:
   - En `student-attendance-kardex.tsx`, la validación de semana se realiza comparando `lesson.weekIndex` contra la semana dentro del mes consultado (`curWeekInMonth = weekIdx`), en vez de calcular semanas transcurridas desde `planStartDate` (`Math.floor(offset / 7)`). Esto soluciona la desaparición de clases en la previsualización del Kardex para alumnos con inicio previo al mes en curso (ej. Alumna A.M., cuyo plan inició en Julio).
4. **Prioridad Absoluta de Horarios Persistidos en PostgreSQL (`emergency_contact.scheduleLessons`)**:
   - En `hydrateFromBackend` (`app-store.ts`), las clases del horario local solo se conservan si el alumno no cuenta con clases oficiales guardadas en PostgreSQL. Al existir `scheduleLessons` en la base de datos, estas tienen prioridad total y sustituyen cualquier caché local obsoleta entre diferentes navegadores y computadoras.
5. **Persistencia Directa de Asistencias desde Kiosco Docente hacia PostgreSQL**:
   - `markLessonAttendance` acepta `dateStr`, registra `attendanceByDate[dateStr]`, actualiza `scheduleLessons` en el estado del alumno y persiste atómicamente hacia `emergency_contact.scheduleLessons` y `attendance_logs` en Insforge PostgreSQL, asegurando sincronización instantánea y consistente en tiempo real entre docentes y secretaría.

---

### 20. ⚠️ Cero Confianza en Caché Local para Estado Transaccional — Post-Mortem del Incidente Admin/Profesor (ADR-0119)

> **Origen de esta regla**: el 21 de septiembre de 2026 se detectó que la Agenda del Profesor (`MinimalAgendaCalendar`, ruta `/teacher/agenda`) no mostraba dos clases de recuperación (Alumna M.B. y Alumno K.P., ambas con Prof. Nathaly) que sí eran visibles correctamente en la Agenda Admin (`AgendaBoard`, ruta `/admin/agenda`), en la misma sesión y con los mismos datos en PostgreSQL. Una sesión de depuración exhaustiva confirmó, línea por línea, que: los datos existían correctamente en `emergency_contact.scheduleLessons`; el emparejamiento de docente (`teacherClean`) era correcto; la comparación de `dateStr` contra `dayInfo.dateStr` era correcta; `isLessonInStudentCycle` debía devolver `true` por `attendanceByDate`; y `hydrateFromBackend` debía dar prioridad absoluta a PostgreSQL (ver ADR-0118.4). **Ninguna de estas verificaciones estáticas reveló el bug.** La sesión se quedó sin presupuesto de tokens (~30% del total consumido en un solo incidente) sin confirmar la causa raíz. La hipótesis más fuerte que quedó pendiente de verificar en tiempo de ejecución es que el snapshot persistido en `localStorage` (vía Zustand `persist`) en el dispositivo/navegador del profesor nunca llega a ser completamente sustituido por el resultado de `hydrateFromBackend`, o que existe una condición de carrera entre el primer pintado (desde `initialSchedule`/`localStorage`) y la sincronización asíncrona con PostgreSQL — lo cual contradice directamente el principio fundacional de ADR-001.3 ("Postgres como única fuente de verdad... nunca almacenar estado transaccional" fuera de la base de datos).

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
   - Se validó mediante simulación en tiempo de ejecución directa (`scratch/test-runtime-pure.mjs`) con datos en vivo de Insforge PostgreSQL que las 4 clases de Alumna M.B. y Alumno K.P. (incluyendo recuperaciones con `dateStr`) son aprobadas y renderizadas en la Semana 4 (Lunes 21 de Setiembre).
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
5. **Puntito de Categoría de Edad en Clases de Recuperación (ADR 0169)**:
   - Las clases de recuperación (pill rojo) muestran un puntito de 8px en la esquina superior derecha con el color de la categoría real del alumno (Junior amarillo `#FBC02D`, Juvenil verde `#4CAF50`, Infantil morado `#7C4DFF`, Estimulación rosa `#EC407A`, Master/Adulto plomo `#546E7A`). El fondo rojo, el chip `🔴 Recuperación` y todo el resto de la píldora permanecen idénticos.
   - La paleta y la resolución de categoría viven **únicamente** en `src/lib/lesson-category-visual.ts` (`resolveRecoveryCategoryVisual`). Queda **PROHIBIDO** volver a reimplementar el cálculo del puntito (`dotColor`/`dotLabel`) de forma independiente en cada vista de `agenda-board.tsx` (ADR-0119.3).
   - El puntito debe ser `pointer-events-none` y `aria-hidden`, y en las vistas de tarjeta se reserva espacio (`pr-2.5` / `mr-2.5`) para no tapar el chip de sala ni las siglas `1ra/2da`.

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
   - Si una clase puntual fue justificada y adelantada a otro día de la semana (ej. Alumna M.B., cuya clase del viernes 25 se adelantó al jueves 24 y fue asistida con `🟢 PRESENTE`), la sesión original **NO DEBE** figurar como pendiente en el Kiosco ni sumar al contador del día original.
3. **Erradicación de Semillas Obsoletas Duplicadas**:
   - Si un alumno activo cuenta con clases oficiales persistidas en `studentProfile.scheduleLessons`, cualquier semilla antigua residual (ej. Alumna S.C. `sch-34` a las 17:30) debe ser invalidada por `isLessonInStudentCycle`, asegurando que el Kiosco y la Agenda muestren exactamente la misma cantidad de clases (ej. 1 sola clase a las 18:15 en Martes).
4. **Resolución de Asistencia Prioritaria desde Ficha Oficial**:
   - Al renderizar el estado de asistencia (`status`) en la tarjeta del Kiosco, se debe consultar prioritariamente `studentProfile.scheduleLessons` para que cualquier marca guardada en Kardex o rehidratada de PostgreSQL se refleje instantáneamente sin depender de la rehidratación asíncrona de `schedule`.

---

### 29. Transición de Curso e Instrumento con Interfaz Manual en Kardex y Aislamiento de Asistencias (ADR-0129)
1. **Gobernanza Exclusiva por Interfaz de Usuario (STOP & VERIFY)**:
   - **PROHIBIDO** ejecutar scripts automatizados o consultas directas de mutación (`UPDATE students`) sobre la base de datos de producción para cambios de curso o instrumento. Toda transición debe ser ejecutada de manera interactiva y consciente por el personal administrativo (Secretaría / Dirección) desde la interfaz web.
2. **Botón Oficial en Kardex de Asistencias (`StudentAttendanceKardex`)**:
   - En la barra de acciones superior del Kardex, junto a `[+ Programar Recuperación]` y `[➕ Agregar Sesión / Adelanto]`, se ubica el botón de acceso directo:
     👉 **`[🎸 Cambiar Instrumento / Docente]`**
   - Este botón abre el diálogo interactivo `CourseTransitionDialog`.
3. **Aislamiento Temporal de Historial y Clases Futuras (`effectiveUntil` y `effectiveFrom`)**:
   - Las sesiones impartidas o evaluadas previas a la fecha de corte conservan inmutablemente su instrumento, sala, docente y asistencias registradas en `attendanceByDate` y `attendance_logs`.
   - Las sesiones posteriores a la fecha de corte se asignan al nuevo instrumento, docente y sala (cumpliendo estrictamente la especialidad docente ADR-0102: Jeremy -> Sala A, Fernando -> Sala B, Nathaly -> Sala C).
4. **Preservación Incondicional de Créditos de Recuperación ("La clase no se pierde, se recupera")**:
   - Las faltas acumuladas por inasistencias médicas o justificadas en el curso anterior (ej. las 2 faltas de salud de un alumno en Canto) se trasladan íntegramente como créditos de recuperación disponibles para ser programados en el nuevo instrumento con el nuevo docente.
5. **Persistencia Estándar vía `backgroundSyncStudentToDB`**:
   - La acción `transitionStudentCourse` actualiza el store de Zustand y delega la sincronización con PostgreSQL al pipeline estándar con debounce de 350ms, garantizando la consistencia transaccional y la emisión limpia de eventos inter-pestañas post-escritura.
6. **Eliminación de Desbordamiento Horizontal y Proporciones Responsivas en Kardex**:
   - El contenedor `DialogContent` en `StudentAttendanceKardex` se amplía a `w-[96vw] max-w-5xl max-h-[92vh] overflow-hidden` y su contenedor de scroll cuenta obligatoriamente con `overflow-x-hidden min-w-0 w-full max-w-full`.
   - La barra de acciones de secretaría adopta `flex flex-col md:flex-row md:items-center justify-between gap-3 min-w-0` y se retira `shrink-0` de la agrupación de botones, evitando que una fila con 6+ botones empuje el modal horizontalmente fuera del viewport.
   - En `course-transition-dialog.tsx`, el diálogo se acota a `w-[94vw] max-w-2xl max-h-[92vh] overflow-y-auto overflow-x-hidden`.
   - Centrado estándar de Tailwind CSS: los componentes de diálogo (`dialog.tsx`, `alert-dialog.tsx`) deben usar `left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`.
7. **Asignación Automática de Categoría MASTER para Alumnos de 18+ Años (`AddNewStudentDialog`)**:
   - Al seleccionar o ingresar una fecha de nacimiento que corresponda a 18 años o más, la categoría del alumno debe seleccionarse y calcularse automáticamente como `"MASTER"` (no Estimulación ni Infantil), respetando las directrices de categorización por edad de Vibra Music.

---

### 30. Alineación Estricta con el Horario Oficial de Vibra Music y Erradicación de Horarios Inválidos (ADR-0130)
1. **Horario Oficial Canónico de la Escuela (Fuente de Verdad)**:
   - **Lunes a Viernes (Turno Tarde)**: De 4:00 pm a 7:45 pm (16:00 a 19:45). Turnos de 45 minutos que inician estrictamente en: `["16:00", "16:45", "17:30", "18:15", "19:00"]`. La última clase inicia a las 19:00 y concluye puntualmente a las 19:45.
   - **Sábados (Turno Mañana)**: De 9:00 am a 1:30 pm (09:00 a 13:30). Turnos de 45 minutos que inician estrictamente en: `["09:00", "09:45", "10:30", "11:15", "12:00", "12:45"]`. La última clase inicia a las 12:45 y concluye a las 13:30.
   - **No existen clases los sábados en la tarde** ni horarios nocturnos que inicien después de las 19:00.
2. **Prohibición de Arreglos Locales y Horarios Ficticios**:
   - Todo selector de horario en la plataforma (`CourseTransitionDialog`, `ScheduleStudentForm`, `VacancyAvailabilityPanel`, `StudentAttendanceKardex`) DEBE consumir obligatoriamente las constantes canónicas `timeSlotsWeekday` y `timeSlotsSaturday` de `@/store/admin-seeds`.
   - Está **TERMINANTEMENTE PROHIBIDO** hardcodear listas locales con horarios fuera de rango (`17:40`, `18:25`, `19:45` como inicio, `20:30`, `21:15` o tardes de sábado de `14:15` a `18:00`) o etiquetas fijas personalizadas en elementos de selección general.

---

### 31. Aislamiento de Vigencias de Transición, Deduplicación Estricta y Reversión Quirúrgica de Curso (ADR-0131)
1. **Barreras Temporales Absolutas (`effectiveFrom` y `effectiveUntil`)**:
   - `effectiveFrom` y `effectiveUntil` son barreras temporales deterministas y absolutas. Una lección con `effectiveFrom: <fecha_corte>` **NO EXISTE** antes de dicha fecha. Del mismo modo, una lección con `effectiveUntil: <fecha_corte - 1>` **NO EXISTE** después de dicha fecha.
   - Queda **TERMINANTEMENTE PROHIBIDO** condicionar estas barreras a si la sesión fue evaluada (`if (!isAlreadyEvaluated)`). Dicho antipatrón provocaba que marcas de asistencia previas proyectaran lecciones futuras en semanas pasadas, duplicando la cuota del contrato (ej. 9 clases en lugar de 8, y 5 asistidas / 4 faltas).
2. **Blindaje de Rehidratación de Asistencias (`isLessonEligibleForDate`)**:
   - Al hidratar asistencias históricas desde `attendance_logs` en `hydrateFromBackend` (`app-store.ts`), toda marca debe validar rigurosamente la elegibilidad de la lección antes de inyectar el estado en `attendanceByDate`:
     1. Si `dateStr < lesson.effectiveFrom`, se descarta.
     2. Si `dateStr > lesson.effectiveUntil`, se descarta.
     3. Si `lesson.excludedDates.includes(dateStr)`, se descarta.
     4. Si la lección es semanal recurrente (sin `dateStr`), el día de la semana (`lesson.day`) debe coincidir exactamente con el día de la fecha del log (`dateStr`).
   - Esto erradica el sangrado (*cross-contamination bleeding*) de asistencias pasadas hacia lecciones de cursos nuevos o hacia días distintos de la semana.
3. **Deduplicación Resiliente de Períodos de Transición**:
   - En `studentLessons` (`student-attendance-kardex.tsx`), dos lecciones no se consideran duplicadas si sus vigencias de corte (`effectiveUntil` o `effectiveFrom`) son distintas, garantizando la coexistencia armónica de la lección previa con la lección posterior aun cuando compartan el mismo día y hora en salas o docentes distintos.
4. **Capacidad de Reversión Quirúrgica de Transición (`revertStudentCourseTransition`)**:
   - Se incorpora la acción `revertStudentCourseTransition(studentId)` en el store central (`app-store.ts`) y el botón interactivo:
     👉 **`[🔄 Deshacer Transición / Volver al Curso Anterior]`** tanto en el banner de estado de `StudentAttendanceKardex` como en el pie y cuerpo de `CourseTransitionDialog`.
   - La reversión elimina de forma quirúrgica las lecciones del nuevo curso (`effectiveFrom`), retira el candado `effectiveUntil` de las lecciones del curso anterior, restituye el instrumento, docente y sala originales del alumno y persiste los cambios en PostgreSQL mediante `backgroundSyncStudentToDB`, preservando el 100% de los logs de auditoría y asistencias históricas.
5. **Confirmación Obligatoria con Mensaje de Advertencia (Anti-Error)**:
   - Tanto la aplicación de una transición de curso (`executeConfirmTransition`) como la reversión al curso anterior (`executeRevertTransition`) deben solicitar obligatoriamente confirmación explícita mediante un modal `AlertDialog` con advertencia destacada.
   - Está **TERMINANTEMENTE PROHIBIDO** ejecutar transiciones o reversiones de curso con un solo clic directo sin confirmación intermedia. El modal debe resumir el alumno, instrumento origen/destino, docente, sala, fecha de vigencia y la garantía de preservación del historial y pagos para evitar errores involuntarios de secretaría o dirección.

---

### 32. Calibración Exclusiva de Paneles de Cobros y Reportes con Alumnos Activos en Tiempo Real (ADR-0132)
1. **Scoping Estricto a la Base Activa Oficial (13 Alumnos)**:
   - Los paneles de gestión institucional `/admin/facturacion` y `/admin/reportes` operan **exclusivamente sobre alumnos con `status === "activo"`** (los 13 alumnos productivos oficiales de PostgreSQL Insforge).
   - Queda **TERMINANTEMENTE PROHIBIDO** que estos paneles incorporen en sus métricas, tablas, alertas o exportaciones a los 58 alumnos en `pausa` o 24 en `baja` (como registros inactivos), o semillas dummy de versiones antiguas.
2. **Sincronización Bidireccional en Tiempo Real (`useInsforgeSync`)**:
   - Ambos paneles incorporan el hook `useInsforgeSync()` y un botón interactivo:
     👉 **`[🔄 Sincronizar en Vivo]`** en su barra superior de acciones, permitiendo revalidar al instante los datos con PostgreSQL, con indicación de estado de red (`isSyncing`) y distintivos visuales `PostgreSQL en Vivo ({activeStudents.length} Activos)`.
3. **Deduplicación Quirúrgica y Cálculo Financiero Exacto (`activeInvoices`)**:
   - En `/admin/facturacion`, `activeInvoices` vincula recibos a alumnos activos por coincidencia exacta o normalizada de nombre, familia o ID de recibo. Deduplica registros duplicados por alumno y concepto base (`${studentId}-${baseConcept}`), priorizando la versión más reciente con comprobantes auditados.
   - Se mantiene el balance financiero exacto: **Total Facturado S/ 4,505.00**, **Total Cobrado S/ 3,717.00** y **Saldo Pendiente S/ 788.00** correspondiente a las 4 familias con cuotas pendientes (Alumna F.F. S/ 297, Alumno K.P. S/ 277, Alumno M.M. S/ 17 y Alumna S.C. S/ 197).
4. **Matriz Anual y Reporte Maestro Dinámicos**:
   - En `/admin/facturacion`, la Matriz Anual erradica cualquier referencia estática heredada (`(99 Alumnos Oficiales)`) y adopta dinámicamente `(${activeStudents.length} Alumnos Activos Oficiales)`.
   - En `/admin/reportes`, las 5 tarjetas KPI superiores (Alumnos Activos, Al Día en Pagos, Con Saldo Pendiente, Deuda por Cobrar, Asistencia Promedio) y la exportación oficial a CSV computan sus datos única y exclusivamente sobre los alumnos activos.
5. **Blindaje de Persistencia y Deshidratación (`hydrateFromBackend` y `persist.merge`)**:
   - En `src/store/app-store.ts`, tanto la hidratación remota (`hydrateFromBackend`) como la rehidratación local (`persist.merge`) filtran estrictamente los recibos contra los alumnos activos, impidiendo de forma hermética que cachés residuales de `localStorage` o recibos de alumnos en `baja` reaparezcan al recargar la página.

---

### 33. Ficha Oficial de Auditoría y Rendición por Alumno, Edición en Caliente y Exportación Dual Humano/LLM (ADR-0133)
1. **Previsualización Integral e Inmediata por Alumno (`StudentAuditReportDialog`)**:
   - Cada fila de alumno activo en `/admin/reportes` cuenta con un botón dedicado `[👁️ Auditoría / Ficha Alumno]`, complementado por accesos en `/admin/alumnos` (en fila y drawer de detalle) y en la cabecera del Kardex (`StudentAttendanceKardex`).
   - El diálogo presenta un código de auditoría oficial autogenerado (`AUD-YYYYMMDD-XXXX`), metadatos contractuales, tarjetas de liquidación de ciclo, tabla de 8 clases (o cuota pactada) e historial de recibos/abonos.
2. **Edición en Caliente In-Modal (In-Modal Hot Editing) sin Salir del Contexto**:
   - **Abonos Faltantes (ej. Pago de 7:50 PM no anotado a tiempo)**: Permite ingresar monto, método (`Yape`, `Plin`, `Transferencia`, `Efectivo`), N° de comprobante / operación, hora y notas. Invoca `recordPaymentAbono` / `recordNewDirectAbono`, activando la compuerta anti-fraude en `invoices.service.ts` (`payment_audit_logs` INSERT previo a `invoices` PATCH), recalculando el saldo en tiempo real y persistiendo en PostgreSQL.
   - **Ajuste Quirúrgico de Asistencias**: Permite alternar en caliente el estado de cada sesión individual (`Presente`, `Ausente`, `Tardanza`, `Justificada`, `Sin marcar`) e ingresar notas pedagógicas, sincronizando atómicamente con `attendance_logs` y `students` sin desajustar el cronograma.
3. **Formato Dual de Exportación (Humano y LLM/Auditoría)**:
   - **Para Humanos (A4 / PDF / WhatsApp)**:
     - Impresión A4 formal (`window.print()`) con membrete corporativo, tabla limpia de sesiones, liquidación del ciclo y dos casillas de firma obligatorias: *Dirección / Secretaría Vibra Music* y *Firma de Conformidad Apoderado*.
     - Generación de mensaje cordial y formateado para WhatsApp con un clic.
   - **Para Modelos de Lenguaje (LLMs) y Auditores Automáticos (.md / .txt)**:
     - Generador estandarizado `generateStudentAuditMarkdown` que produce un documento Markdown estructurado con clave-valor (fechas ISO 8601, identificadores canónicos, moneda explícita `PEN S/`) y tablas Markdown limpias, descargable como `.md` o copiable al portapapeles con `[📋 Copiar Formato LLM]`, permitiendo a cualquier LLM (Gemini, Claude, GPT) ingerir y auditar la historia del alumno sin margen de error.
4. **Desacoplamiento Matemático en `kardex-calculator.ts`**:
   - Centraliza `computeStudentCycleSessions` y `computeStudentCycleLiquidation`, garantizando que tanto el Kardex de secretaría como la Ficha de Auditoría calculen exactamente las mismas clases, respetando transiciones de instrumento (`effectiveFrom`, `effectiveUntil`), clases de corrido (`+45m`), cuotas contractuales y asistencias evaluadas.

---

### 34. Filosofía Institucional de Créditos de Recuperación ("Las clases no se pierden, se recuperan"), Migración Inter-Instrumento y Auditoría Pedagógica (ADR-0134)
1. **Principio Pedagógico Innegociable ("Las clases no se pierden, se recuperan")**:
   - En Vibra Music Staff, ninguna inasistencia de un alumno activo (`ausente` o `justificada`) se cancela ni se pierde: genera automáticamente un derecho/crédito de recuperación (`makeupCredits` / `makeupCreditsAvailable`).
2. **Migración de Créditos por Transición Inter-Instrumento**:
   - Si un alumno realiza un cambio de instrumento a mitad de ciclo lectivo (por ejemplo, Alumna S.C.: de Canto a Guitarra), **los créditos acumulados por inasistencias en el instrumento previo no se anulan ni se descartan**: migran íntegramente al nuevo instrumento.
   - En la Ficha de Auditoría y en el Kardex, el desglose matemático se estructura de forma transparente:
     - **Clases Regulares de Cuota Pendientes en el Nuevo Instrumento**: Restan exactamente las clases necesarias para completar la cuota mensual contractual (ej. 3 clases de cuota en Guitarra para completar las 8).
     - **Créditos Acumulados a Recuperar**: Las inasistencias del curso previo (ej. 2 faltas del 15/09 y 17/09 en Canto) pasan como `+2 créditos` a favor en Guitarra.
     - **Total de Clases Efectivas por Impartir en el Nuevo Instrumento**: `regularPending + makeupCreditsMigrated` (ej. 3 regulares + 2 créditos = **5 clases totales** que el Prof. Jeremy dictará al alumno).
3. **Normalización Universal de Días (`normalizeDayKey`)**:
   - `kardex-calculator.ts` implementa `normalizeDayKey`, homologando de forma bidireccional formatos cortos (`"Mar"`, `"Jue"`) con nombres completos (`"Martes"`, `"Jueves"`), erradicando descalces que provocaban la visualización de 0 sesiones en alumnos con horario guardado en PostgreSQL.
4. **Trazabilidad Visual y Semántica en la Auditoría**:
   - **Banner de Transición y Filosofía**: Detalla la fecha de corte del instrumento previo (ej. 28/09), la fecha de inicio del nuevo instrumento (ej. 29/09), el nuevo horario docente (ej. Martes y Jueves 17:30 con Prof. Jeremy en Sala A) y 3 tarjetas resumen de balance de clases.
   - **Divisor Visual en Kardex**: Inserta una fila divisoria destacada entre las sesiones del instrumento previo y el nuevo.
   - **Badges de Inasistencia**: Toda sesión en falta indica explícitamente: `✗ FALTA ➔ Pasa a Crédito de Recuperación en {nuevoInstrumento}`.
   - **Deduplicación Contable por ID**: `matchingInvoices` indexa los recibos por `id` único mediante `Map<string, Invoice>()`, impidiendo filas triplicadas del mismo recibo.
   - **Salida Dual para WhatsApp y LLMs**: Produce plantillas de WhatsApp personalizadas para los padres y archivos `.md` con claves semánticas precisas para auditoría automatizada por cualquier modelo de lenguaje.



---

### 35. Matriz Oficial de 3 Rubros Financieros (1. Matrícula · 2. Mensualidad · 3. Libros), Deduplicación de Recibos y Totales Consolidados de Cartera (ADR-0135)
1. **Estructura Financiera Canónica de 3 Rubros**:
   - En toda la plataforma y en especial en la Ficha Oficial de Auditoría (`student-audit-report-dialog.tsx`, `kardex-calculator.ts`), la situación financiera de cualquier alumno se audita a través de una matriz estricta y automatizada de 3 rubros:
     1. **1. Matrícula Institucional**: Evalúa `student.matriculaType` (Regular S/ 120, Promo Demo S/ 30, o Exonerada S/ 0). En alumnos con beca o convenio (como Alumna S.C.), se audita como `Exonerada (S/ 0.00 / 0.00 / 0.00)`.
     2. **2. Mensualidad (Plan Contratado)**: Refleja la cuota del ciclo lectivo activo (ej. S/ 297.00), monto abonado (ej. S/ 100.00), saldo restante (ej. S/ 197.00), método de pago y referencia/voucher auditado (`paymentLogs`). Se deduplica estrictamente para que exista exactamente **1 fila** por ciclo lectivo, erradicando filas duplicadas o triplicadas.
     3. **3. Libros y Material Didáctico (Pack de Útiles)**: Evalúa `student.packUtilesCost`, `student.packUtilesAmountPaid`, `student.packUtilesStatus`, `student.packUtilesDelivered` y `student.packUtilesNotes`. Si el costo es 0 o está exonerado (como en Alumna S.C.), se audita como `Exonerado / Incluido (S/ 0.00)`. Si aplica costo estándar (S/ 67.00), audita el abono, saldo pendiente y entrega física en sala.
2. **Deduplicación Estricta de Recibos contra PostgreSQL (`hydrateFromBackend`)**:
   - En `src/store/app-store.ts`, al fusionar recibos remotos de PostgreSQL con cachés locales en vuelo de `localStorage`, se compara no solo por `inv.id`, sino por `${studentName}-${baseConcept}`. Si PostgreSQL ya cuenta con un recibo formal para ese alumno y concepto (ej. UUID `a4b3fe8a...`), se descartan copias locales o mock residuales, impidiendo que un recibo aparezca multiplicado.
3. **Totales Consolidados de Cartera (Table Footer, Badges, Markdown y WhatsApp)**:
   - Toda tabla financiera incorpora un pie consolidado (`tfoot`) con la suma matemática exacta:
     - `Total Facturado`: Suma de cuotas oficiales de los 3 rubros (ej. Alumna S.C.: S/ 0 + S/ 297 + S/ 0 = S/ 297.00).
     - `Total Abonado`: Suma de pagos efectivos (ej. Alumna S.C.: S/ 0 + S/ 100 + S/ 0 = S/ 100.00).
     - `Total Saldo Deuda`: Deuda real exigible (ej. Alumna S.C.: S/ 0 + S/ 197 + S/ 0 = S/ 197.00).
   - Esta cifra se refleja unificadamente en el badge de cabecera (`⚠ DEUDA: S/ 197.00`), en el Cuadro de Liquidación Oficial del Ciclo, en el exportable `.md` para LLMs y en el mensaje generado para WhatsApp.
4. **Universalidad para Todos los Alumnos**:
   - Si bien se tomó a Alumna S.C. como caso de calibración, la lógica de `computeStudentFinancialAudit` es 100% universal y calcula de forma automática y reactiva la matriz contable para cualquier alumno activo del colegio.

---

### 36. Arquitectura de Exportación A4 / PDF Ejecutivo de 2 Páginas, Desbordamiento de Diálogos Radix y No-Wrapping Monetario (ADR-0136)
1. **Resolución del Bug Crítico de Impresión en Diálogos Radix UI**:
   - En Chromium y navegadores modernos, un elemento con `position: fixed` o `position: absolute` y `overflow-y: auto` o `max-height` (como `DialogContent` en `@radix-ui/react-dialog`) se imprime como un viewport único congelado, imposibilitando la paginación natural y cortando las tablas a la mitad en la primera página.
   - En `StudentAuditReportDialog`, se inyecta un bloque de estilos `@media print` dedicado y se configuran utilidades de Tailwind (`print:static print:transform-none print:overflow-visible print:w-full print:h-auto`) que desmantelan el posicionamiento fijo, remueven el backdrop negro (`[data-radix-portal] > div[class*="bg-black"]`), suprimen el botón de cierre (X) y restauran el flujo de bloque estático del documento.
2. **Estructura Ejecutiva de 2 Páginas con Paginación Forzada**:
   - **Página 1: Auditoría Pedagógica y Asistencias en Sala**:
     - Membrete oficial Vibra Music con Código de Auditoría `AUD-YYYYMMDD-XXXX`, fecha de emisión y etiqueta `PÁGINA 1 DE 2`.
     - Badges de estado de alta fidelidad cromática (`-webkit-print-color-adjust: exact`).
     - Tarjetas de identidad (Alumno, Apoderado & Contacto, Plan & Horario) en 3 columnas impresas (`print:grid-cols-3`).
     - Banner institucional de transición de instrumento y filosofía *"Las clases no se pierden, se recuperan"* con 3 tarjetas métricas.
     - Kardex de 8 sesiones lectivas con divisor visual dorado de cambio de instrumento y marcas de asistencia.
   - **Página 2: Rendición Financiera, Liquidación y Firmas Oficiales**:
     - Activada por salto de página estricto: `.print-page-break { break-before: page !important; page-break-before: always !important; }`.
     - Sub-cabecera de continuación impresa con identificación institucional, nombre del alumno, código de auditoría y etiqueta `PÁGINA 2 DE 2`.
     - Matriz Oficial de 3 Rubros (1. Matrícula, 2. Mensualidad, 3. Libros) y pie consolidado (`tfoot`) de totales de cartera.
     - Cuadro de Liquidación Oficial del Ciclo (Contratadas, Asistidas, Inasistencias, Créditos a Favor, Pendientes, Veredicto y Saldo Total).
     - Casillas de firmas oficiales de Dirección/Secretaría y Padre de Familia / Apoderado protegidas contra cortes (`print-avoid-break`).
3. **No-Wrapping Monetario y Blindaje de Símbolo de Moneda**:
   - Se erradica por completo la separación de `S/` y el importe numérico (ej. `S/\n0.00`) mediante la aplicación obligatoria de `whitespace-nowrap font-mono` y espacios no separables (`S/&nbsp;{monto}` o `S/\u00A0{monto}`) en todas las celdas de tabla, badges, tarjetas KPI y pies de página.
4. **Deduplicación Visual en Columna de Observación del Kardex**:
   - En inasistencias migradas (`session.status === "ausente" && session.makeupCreditTransferred`), se renderiza un badge único y estilizado (`🔄 Pasa a Crédito en Guitarra (Prof. Jeremy)`), suprimiendo la impresión redundante de la nota de texto cruda superior y garantizando una presentación gráfica impecable tanto en pantalla como en papel/PDF.

---

### 37. Geometría Precisa de Impresión A4, Eliminación de Transform Offsets y Distribución Porcentual de Columnas (ADR-0137)
1. **Erradicación del Desfase Horizontal (-50% Transform Offset)**:
   - Al convertir el diálogo Radix UI a `position: static` durante la impresión, la persistencia de las variables CSS de Tailwind (`--tw-translate-x: -50%`) trasladaba el contenedor un 50% de su ancho fuera de la página hacia la izquierda, recortando la mitad izquierda de cada hoja.
   - Se blindó `src/components/ui/dialog.tsx` con `print:static print:left-0 print:top-0 print:translate-x-0 print:translate-y-0 print:transform-none print:max-w-none print:w-full print:p-0 print:border-none print:shadow-none print:animate-none` y en `@media print` se neutralizaron todas las variables con `--tw-translate-x: 0px !important; --tw-translate-y: 0px !important; transform: none !important; left: 0 !important; right: 0 !important; margin: 0 !important; width: 100% !important;` en `[data-radix-portal]` y `div[role="dialog"]`.
2. **Compactación Vertical Estricta para 2 Páginas Exactas en A4 Portrait**:
   - Para impedir que las tablas se dividan en 3 o 4 páginas, se calibraron los paddings y tamaños de tipografía para impresión:
     - **Página 1 (Pedagógica)**: Cabecera (`print:text-xs print:pb-2`), 3 tarjetas de alumno (`print:p-2 print:text-[10px]`), banner de transición (`print:p-2 print:space-y-1.5`) y filas de Kardex (`print:py-1 print:px-1.5 print:text-[9px]`). La altura total suma ~380px (<40% del alto imprimible de A4), asegurando que la tabla de clases nunca se fracture.
     - **Página 2 (Financiera & Liquidación)**: Sub-cabecera compacta (`print:pb-1.5 print:mb-2`), tabla de matriz financiera (`print:py-1 print:px-1.5 print:text-[9px]`), tarjetas KPI de liquidación (`print:p-1.5 print:gap-1.5`) y firmas oficiales (`print:pt-6 print:mt-2`). La altura total suma ~360px, garantizando un ajuste perfecto sin desbordar.
3. **Distribución Porcentual Fija de Columnas (`table-layout: fixed`) y Word-Break**:
   - Con márgenes de página A4 de `7mm 8mm 7mm 8mm`, las tablas tienen `table-layout: fixed !important; width: 100% !important;` con anchos porcentuales exactos que suman 100%:
     - Kardex: N° (`5%`), Fecha (`14%`), Hora (`13%`), Curso/Sala (`16%`), Docente (`15%`), Estado (`15%`), Observación (`22%`).
     - Matriz Financiera: Rubro (`15%`), Concepto (`27%`), Monto (`11%`), Abonado (`10%`), Saldo (`11%`), Estado (`11%`), Método (`8%`), Referencia (`7%`).
     - Inyección de `th, td { word-break: break-word !important; overflow-wrap: break-word !important; }` para impedir desbordamientos por textos largos.
4. **Corrección de Docente Destino en Créditos Transferidos**:
   - En sesiones transferidas (de Canto a Guitarra), el badge del Kardex ahora referencia correctamente `liveStudent?.teacher || "Jeremy"` en lugar de `session.teacher` (Nathaly), reflejando con exactitud que el crédito se recupera con el Prof. Jeremy en Sala A.

---

### 38. Erradicación de ExcludedWeeks Relativos, Prioridad de Slot en Deduplicación y Cuota Exacta de 8 Clases (ADR-0138)
1. **Erradicación de `excludedWeeks` en Reprogramaciones Puntuales**:
   - Al reprogramar una clase por fecha exacta (`originalDateStr`), el sistema **NUNCA** debe inyectar índices relativos al mes (`targetWeekIndex`) en `excludedWeeks`.
   - Las plantillas recurrentes no tienen mes fijo (`month: undefined`), por lo que un índice relativo como `[0]` o `[2]` contaminaba y borraba clases en meses pasados y futuros (Agosto, Setiembre, Octubre). La exclusión se realiza exclusivamente en `excludedDates: ["YYYY-MM-DD"]`.
   - Al invocar `revertMakeupLesson`, el sistema purga preventivamente `excludedWeeks: []` para limpiar cualquier remanente corruptor.
2. **Aislamiento por Fecha en Reprogramaciones Puntuales (`excludedDates`)**:
   - Al reprogramar una clase puntual (ej. Martes 25 de Agosto al Jueves 17 de Setiembre), la fecha original queda en `excludedDates` para que no se duplique en ese día, mientras que la nueva sesión agendada toma su lugar en el cronograma.
   - Las demás sesiones del ciclo (incluyendo otras inasistencias o faltas del alumno como Jueves 03 de Setiembre) permanecen 100% intactas e inmutables.
3. **Prioridad Determinista de Slot en Deduplicación (`rawCandidates.sort`)**:
   - Al ordenar las clases antes de deduplicar por franja horaria (`dateStr-time`):
     1. Prioridad 1: Sesión evaluada (`presente`, `ausente`, `tarde`, `justificada`) prevalece sobre sesión pendiente.
     2. Prioridad 2: Sesión de recuperación puntual (`isMakeup: true`) prevalece sobre lección recurrente abierta.
   - Esto impide que una clase recurrente genérica que cae en el mismo turno descarte a la sesión de recuperación agendada.
4. **Cumplimiento Estricto de la Cuota Contractual (Exactamente 8 Clases en Plan Regular)**:
   - El ciclo activo de un Plan Regular debe proyectar **exactamente 8 clases** (`finalSessions = combined.slice(0, targetQuota)`), ni más ni menos.
   - Si el alumno reprograma una falta a una fecha posterior dentro de su ciclo, dicha sesión ocupa el casillero correspondiente completando rigurosamente las 8 clases contratadas sin inflar el total a 9, 10 u 11 sesiones.

---

### 39. Sistema Integral de Seguimiento, Retención y Renovación de Ciclos (ADR-0139)
1. **Regla Innegociable: Cero Vacante de Cortesía y Contacto Preventivo Anticipado**:
   - En Vibra Music **no existe plazo de gracia o cortesía posterior al vencimiento**. Un cupo docente (aforo máximo estricto de 5 alumnos por sala) no puede quedar congelado esperando si el alumno renueva o no.
   - La comunicación preventiva con el apoderado se realiza obligatoriamente durante la fase **🟡 AMARILLA (cuando restan 1 ó 2 clases o créditos por cumplir)** para consultar con días de anticipación si continuará el siguiente mes y asegurar su horario en sala antes de su última sesión.
2. **Condición Matemática de Retención ($S_{pend}$)**:
   - $S_{pend} = \text{pendientes regulares} + \text{makeups agendadas pendientes} + \text{créditos por inasistencia sin agendar}$.
   - **🟢 VERDE (`en_curso`)**: $S_{pend} > 2$. Progreso lectivo normal en sala.
   - **🟡 AMARILLO (`proximo_culminar`)**: $S_{pend} \in \{1, 2\}$. Alerta preventiva obligatoria con botón de WhatsApp preventivo pre-cargado.
   - **🔴 ROJO (`culminado`)**: $S_{pend} === 0$. Completó todas sus clases y créditos. Botón de renovación habilitado.
   - **⚪ GRIS (`pausa_baja`)**: Alumno en pausa o baja administrativa. Vacante disponible para nuevos alumnos.
3. **Renovación Exclusiva con 0 Créditos Pendientes (`renewStudentCycle`)**:
   - Un alumno solo puede renovar ciclo cuando ha cumplido el 100% de sus clases y recuperado todas sus faltas ($S_{pend} === 0$). El avance se mide por clases cumplidas; el nuevo mes arranca limpio con sus 8 clases nuevas (o 4 intensivas) sin arrastrar créditos anteriores.
   - La acción calcula `newStartDate` (+1 día hábil tras `planEndDate`) y `newEndDate` (+1 mes o +2 meses en 1x/sem), genera el recibo en estado `"pendiente"` en PostgreSQL (`invoices`) y sincroniza la ficha en `students` con `makeup_credits: 0`.
4. **Despeje Visual del Dashboard y Pestaña Dedicada**:
   - El dashboard principal (`/admin`) se mantiene limpio y sin saturación.
   - El seguimiento diario de secretaría vive en su propia pestaña dedicada **`[🔄 Seguimiento & Renovación]`** dentro de `/admin/alumnos` con badge en vivo de alumnos que requieren atención (`proximo_culminar` + `culminado`).

---

### 40. Motor de Decisiones Tipo Sistema 1 Laya ($0 Costo), Copiloto de Triage y Exportador de Contexto para Meta (ADR-0140)
1. **Costo Cero Absoluto ($0 Cost)**:
   - No requiere WhatsApp Cloud API ni consumo de tokens por mensaje.
   - El motor de inferencia corre localmente en el cliente con arquitectura encoder no-autoregresiva tipo Sistema 1 (<35 ms de latencia por decisión), usando esquemas tipados (`choice`, `score`, `noul`).
   - Los envíos de respuesta a padres de familia se despachan sin costo a través del protocolo web `wa.me` con mensaje URL-encoded.
2. **Triage Quirúrgico de Reprogramaciones y Aforo (ADR-0102 Compliance)**:
   - Toda solicitud de reprogramación procesada por Laya extrae el alumno de la nómina activa, determina la edad, nivel e instrumento y asigna rigurosamente el docente y sala correctos:
     - Prof. Nathaly: Sala C (Piano Infantil 4-8 años y Canto).
     - Prof. Fernando: Sala B (Piano estándar 9+ años y Violín).
     - Prof. Jeremy: Sala A (Guitarra y Batería).
   - Verifica el aforo en vivo sobre `schedule` y `adminStudents` en la franja solicitada:
     - 🟢 **Disponible (<5 alumnos)**: Habilita el agendamiento directo en el Kardex y genera la plantilla de confirmación por WhatsApp.
     - 🔴 **Lleno (5/5)**: Prohíbe el sobrecupo y calcula matemáticamente las mejores 2 opciones alternativas de horario con el docente en la misma semana.
3. **Exportador de Contexto en Tiempo Real para Agente de Meta Business Suite**:
   - Incluye botón dedicado **"📋 Copiar Snapshot para Agente Meta Business"** que sintetiza la matriz viva de disponibilidad de salas hora por hora en formato Markdown estructurado para inyectar como prompt context en Meta Business Suite / WhatsApp AI.
   - Incluye botón **"📥 Descargar Horarios Disponibles (.CSV)"** para alimentación de catálogos y sistemas externos sin intervención humana.
4. **Atajo Universal y Accesibilidad**:
   - Accesible globalmente en la barra superior del panel administrativo (`⚡ Copiloto Laya`) y mediante el atajo de teclado **`Ctrl+Shift+L`**.

---

### 41. Pauta Anti-Colisión de Homónimos, Fuzzy Matching Fonético y UI/UX Google Flow (ADR-0141)
1. **Pauta Multidimensional Anti-Colisión de Alumnos**:
   - En una escuela con múltiples homónimos (ej. varios alumnos con el mismo nombre de pila), Laya **NUNCA asume identidades a ciegas ni adivina**.
   - Evalúa similitud fonética (Levenshtein $\le 1$), coincidencia de bigramas y contexto secundario (instrumento, profesor, nombre de apoderado en ficha de PostgreSQL).
   - Si existen 2 o más candidatos cercanos en puntuación (diferencia $< 25$ pts), activa el **Estado de Desambiguación Obligatoria** (`isAmbiguous: true`), desplegando un selector interactivo en 1 clic para que secretaría confirme la alumna antes de procesar cualquier respuesta o acción.
2. **Consulta en Vivo de Clases Faltantes y Cuotas Contractuales**:
   - Intención tipada `consulta_clases_pendientes`: Cuando un apoderado consulta *"cuántas clases le faltan"*, Laya no lo confunde con nueva matrícula. Lee el Kardex real en PostgreSQL (`attendance_logs`) y calcula el desglose matemático: clases contratadas, asistidas, inasistencias por recuperar (créditos) y clases regulares restantes por dictar.
3. **UI/UX Idéntica a Google Flow (Cápsula Flotante Inferior + Panel Lateral Derecho)**:
   - Erradica los modales centrales obstructivos en favor de una arquitectura no invasiva:
     - **Cápsula Inferior (Modo Minimizado)**: Píldora horizontal en la parte inferior central (`fixed bottom-6 left-1/2 -translate-x-1/2`), con selector de agente, caja de texto rápida, botón de Snapshot Meta y botón `[ ➔ ]`.
     - **Panel Lateral Derecho (Modo Expandido)**: Drawer vertical acoplado a la derecha (`w-[460px]`), con cabecera de control (minimizar a cápsula `➖`, snapshot `📋`, cerrar `✖`), timeline de resolución inteligente, desambiguación de homónimos, ficha de Kardex en vivo y botón directo de WhatsApp Web (`wa.me`).

---

### 42. Autocompletado con Tab, Menciones @, Ocultamiento Lateral EyeOff, Guardrails de Seguridad y Recuperaciones de 45m (ADR-0142)
1. **Autocompletado con Tecla `Tab`**:
   - Al pulsar `Tab` en la caja de texto de Laya, si existe un candidato sugerido en "Alumno Identificado en PostgreSQL", se autocompleta inmediatamente como `@Nombre Completo `.
2. **Sintaxis y Desambiguación con `@Menciones`**:
   - Si la secretaria escribe o selecciona `@Nombre Completo` (ej. `@Estudiante Ejemplo A`), el motor de búsqueda en tiempo real fija al alumno con 100% de confianza inmediata, evitando colisiones con homónimos (ej. `@Estudiante Ejemplo B`).
   - Al hacer clic en una tarjeta de desambiguación de candidatas, se inserta automáticamente la mención `@Nombre` en el texto.
3. **Ocultamiento Total Exclusivo en Vista Lateral (`EyeOff`)**:
   - En la cabecera del panel lateral derecho (sidebar) se ubica un botón de ojo (`EyeOff`).
   - Al hacer clic en este botón, el agente se oculta por completo (`isFullyHidden: true`), retirando tanto el panel lateral como la cápsula flotante inferior.
   - Para volver a visualizarlo, el usuario pulsa el botón `[⚡ Copiloto Laya Ctrl+Shift+L]` de la barra de navegación o presiona la combinación `Ctrl+Shift+L`.
4. **Reglas Pedagógicas de Duración (Intensivos 90 min vs Recuperaciones 45 min en Viernes/Sábado)**:
   - Los Cursos Intensivos son de **90 minutos** continuos (1x por semana en Jueves, Viernes o Sábados).
   - Los Viernes y Sábados pueden emplearse formalmente para **recuperaciones de 45 minutos** de alumnos de Plan Regular, siempre que la sala del docente mantenga aforo disponible (< 5 alumnos en ese turno).
5. **Módulo de Inducción Técnica/Operativa y Guardrails de Seguridad Financiera**:
   - Laya responde consultas de arquitectura de la academia: Días Pareados (L-M, M-J, V-S), proceso de activación de alumnos (1. Ficha/Registro -> 2. Horario por edad/sala [ADR-0102] -> 3. Kardex), aforos y cupos.
   - **Guardrails Estrictos de Seguridad**: Bloqueo absoluto ante intentos de extraer números de tarjetas de crédito, contraseñas, credenciales de dueños o tokens, redireccionando canónicamente a `/admin/facturacion` y `/admin/reportes`.
6. **Saneamiento de Plantillas de WhatsApp**:
   - Supresión de duplicación de cadenas como `"Familia Familia ..."` mediante normalización de prefijos (`replace(/^familia\s+/i, "").trim()`).

---

### 43. Base de Conocimiento Pedagógico en Copiloto Laya: Categorías por Edad, Equivalencia Master = Adulto y Convivencia de Planes (ADR-0143)
1. **Equivalencia Oficial Master = Adulto (ADR-0121)**:
   - **SÍ, Master es exactamente igual a Adulto (alumnos de 18 años a más)**.
   - En la base de datos PostgreSQL se persiste bajo el valor histórico `ADULTO` por compatibilidad técnica sin romper migraciones ni llaves foráneas. En el frontend se muestra oficialmente como **`MASTER (18+)`**.
   - **Convivencia en Sala**: Los alumnos Master (18+) pueden compartir sala con la categoría **Juvenil (13 a 17 años)**, pero tienen **TERMINANTEMENTE PROHIBIDO compartir sala con la categoría Junior (7 a 12 años)**.
2. **Categorías Oficiales por Rango de Edad y Aislamiento (ADR-0102 / ADR-0121)**:
   - **Estimulación Musical (4 a 5 años)**: Prof. Claudia en Sala D. Sala Única (prohibido mezclar con otras edades). Aforo máx. 5.
   - **Infantil (5 a 6 años)**: Prof. Nathaly en Sala C. Sala Única (prohibido mezclar con mayores). Aforo máx. 5.
     - **Piano Infantil**: Especialidad de **4 a 8 años** (Infantil, Tiny, Junior inicial) a cargo exclusivo de la Prof. Nathaly en Sala C.
   - **Junior (7 a 12 años)**: Jeremy (Sala A) / Fernando (Sala B). Comparte con Juvenil. Prohibido con Master.
   - **Juvenil (13 a 17 años)**: Jeremy (Sala A) / Fernando (Sala B). Puente etario: comparte con Junior o Master.
   - **Personalizado y Demos de Nivelación**: Aforo = 1 alumno máx. (Aislamiento total, 45 min).
3. **Convivencia de Planes por Duración (45 min vs. 90 min)**:
   - Sesiones de **45 minutos** (Regular 2x, Regular 1x, Flexible 45m) SÍ pueden convivir en la misma sala hasta 5 alumnos respetando la compatibilidad de edad.
   - Sesiones de **90 minutos** (Intensivo) NO pueden convivir en sala con sesiones de 45 min porque la rotación de alumnos a los 45 minutos distrae y rompe la concentración del intensivo.
   - Los Viernes y Sábados pueden emplearse formalmente para recuperaciones de 45 minutos de Plan Regular siempre que haya cupo libre (<5 alumnos).
4. **Resolución Determinista en Laya**:
   - `laya-knowledge-base.ts` y `laya-realtime-matcher.ts` integran matchers semánticos y plantillas de WhatsApp para `master_adulto`, `categorias_edad`, `convivencia_salas` y `planes_estudio`.

---

### 44. Rediseño Integral de Cobros y Abonos Accesible para Personas Mayores (Senior-Friendly) con Perfil Dual Dueña/Contador y Cero Mock Data (ADR-0144)
1. **Erradicación Absoluta de Mock Data en `/admin/facturacion`**:
   - Está **TERMINANTEMENTE PROHIBIDO** importar o consumir arrays simulados como `billingTrend` o `recurringConcepts` de `admin-seeds.ts`.
   - Toda cifra, porcentaje de cobranza y resumen de cartera proviene 100% de los datos reales de PostgreSQL (`students`, `invoices`, `payment_audit_logs`).
   - Los 13 alumnos activos en producción representan exactamente:
     - **Total Facturado:** S/ 4,213.00 PEN.
     - **Total Cobrado en Caja:** S/ 3,425.00 PEN (81.3% recaudado).
     - **Saldo Pendiente de Cobro:** S/ 788.00 PEN (18.7%).
     - **Semáforo de Deudores Oficial:** Exactamente 4 alumnos con deuda:
       1. *Alumna F.F.*: Debe S/ 297.00.
       2. *Alumno K.P.*: Debe S/ 277.00.
       3. *Alumna S.C.*: Debe S/ 197.00.
       4. *Alumno M.M.*: Debe S/ 17.00.
     - **Alumnos al Día:** Exactamente los 9 alumnos restantes con saldo S/ 0.00.
2. **Barra de Accesibilidad Senior y Perfil Dual (`SeniorAccessibilityBar`)**:
   - Conmutador instantáneo entre `💼 Vista Dueña (Caja y Cobranza)` y `📑 Vista Contador (Bancos y Cuadre)`.
   - Selector de tamaño de letra de 3 niveles: `A` (Normal 14px), `A+` (Mediano 16px) y `A++ Senior` (Grande 18-24px con números de 36-48px).
   - Todos los botones de acción para personas mayores tienen un objetivo táctil mínimo de **48px de altura** (`min-h-[48px]`), previniendo pulsaciones accidentales.
   - Cero iconos huérfanos: toda acción cuenta con etiqueta textual descriptiva en español.
   - Botón `💡 Explicar con Laya` que despliega un diálogo explicativo en lenguaje sencillo y amigable.
3. **Vista Dueña (Ejecutiva de Caja y Cobranza)**:
   - Semáforo prioritario destacando a los 4 alumnos con deuda.
   - Botón directo de WhatsApp `📲 Cobrar WhatsApp` con mensaje pre-armado y respetuoso con nombre del alumno, instrumento y monto exacto adeudado.
   - Botón `💵 Registrar Abono` con soporte de pegado de voucher con `Ctrl+V` y compresión WebP.
4. **Vista Contador (Libro Diario y Conciliación Fiscal)**:
   - Libro Diario correlativo con Fecha, Hora, Alumno, Medio de Pago, N° de Operación bancario, Rubro Contable (Pensión, Matrícula, Pack Útiles), Importe y Auditoría.
   - Botón de exportación `📥 Descargar Libro Contable (CSV / Excel)` con prefijo UTF-8 BOM (`\uFEFF`) para compatibilidad perfecta con Microsoft Excel.
5. **Preservación Incondicional del Detalle Integral**:
   - El panel mantiene el acceso a las pestañas detalladas (`Recibos Activos`, `Matriz Anual 2026`, `Historial de Vouchers Yape` y `Conciliación y Caja` con tendencias y distribución de planes calculadas dinámicamente).

---

### 45. Purga de Semillas Heredadas, Respaldo Histórico en CSV y Blindaje de Facturación para 13 Alumnos Activos (ADR-0145)
1. **Respaldo Consolidado de Base Histórica Antigua en CSV**:
   - Los 142 registros históricos han sido extraídos y respaldados en `archivo_historico_base_antigua_alumnos_vibra_music.csv` con UTF-8 BOM (`\uFEFF`) para consulta externa en Microsoft Excel.
   - Contiene la totalidad de campos de contacto, datos pedagógicos, pack de útiles, notas y récord mensual de Junio a Diciembre.
2. **Desacoplamiento de Semillas en Frontend**:
   - `adminStudents` en `src/store/admin-seeds.ts` se inicializa como un arreglo vacío (`export const adminStudents: AdminStudent[] = []`).
   - Queda terminantemente prohibido inyectar arrays mock (`baseControlStudents`, `missingAdminStudents`, `missingScheduleStudents`) al estado de ejecución.
3. **Versión de Persistencia `v32` y Purga de Caché de Navegador**:
   - La persistencia de Zustand se actualiza a `cadencia-app-v32`, eliminando versiones previas (`cadencia-app-v1` a `cadencia-app-v31`) de `localStorage`.
   - La función `migrate` purga cualquier residuo mock inactivo y `hydrateFromBackend` preserva única y exclusivamente los alumnos reales provenientes de PostgreSQL.
4. **Blindaje de Emisión Masiva de Recibos en Facturación**:
   - En el modal de confirmación (`src/routes/admin.facturacion.tsx`), el conteo renderiza estrictamente `{activeStudents.length}` (los 13 alumnos activos confirmados) y nunca `{adminStudents.length}`.
   - `generateMonthlyInvoices` (`app-store.ts`) deduplica por alumno y mes lectivo, no sobrescribe recibos pagados ni emitidos previamente, y persiste cada nuevo recibo en PostgreSQL vía `backgroundCreateInvoiceInDB`.
5. **Preservación Incondicional de la Papelera de Reciclaje**:
   - Bajo el principio *"Ninguna clase se pierde, ningún dato se pierde"*, el sistema de papelera (`deletedStudents`, `deleteStudent`, `deleteStudents`, `restoreStudentLog`) permanece 100% activo en el store y la interfaz para documentar cualquier baja manual con su snapshot completo y motivo.

---

### 46. Control de Material Escolar / Libros (S/ 67) y Matriz Anual Dinámica con Estados de Culminación (ADR-0146)
1. **Pestaña Senior-Friendly Dedicada para Material Escolar y Libros (S/ 67)**:
   - Se incorpora la pestaña `📚 Material Escolar / Libros (S/ 67)` en `/admin/facturacion` con 5 tarjetas KPI métricas de alto contraste: Alumnos con Libro Requerido, Total Facturado, Total Recaudado, Saldo Pendiente por Cobrar y Libros Entregados vs Pendientes.
   - Filtros rápidos por estado (`Todos`, `Pendientes de Pago`, `Pendientes de Entrega`, `Cancelados`, `Exonerados`).
   - Botón interactivo a 1-clic para alternar entre `📦 Entregado en Sala` y `⚠️ Pendiente de Entrega`, sincronizado con PostgreSQL (`emergency_contact.packUtilesDelivered`) vía `updateStudentDetails`.
   - Botón `Cobrar Libro` con precarga del saldo del libro y sincronización atómica con `packUtilesStatus`, `packUtilesAmountPaid`, `packUtilesPaid` y `packUtilesDelivered`.
   - Botón de WhatsApp con mensaje formal preconfigurado para cobrar o confirmar entrega del libro escolar con 1 clic.
2. **Matriz Anual Dinámica Conectada a PostgreSQL y Kardex Pedagógico**:
   - Sustitución de `annualRecords` estático por `renderDynamicMonthBadge`, que computa mes a mes (Junio a Diciembre) la situación real de los 13 alumnos activos.
   - Integración con el motor pedagógico (`computeStudentRetentionStatus` y `computeStudentCycleSessions`): si el alumno completó sus clases o culminó su vigencia, la matriz renderiza la insignia morada `🎓 Culminado (8/8)`.
   - Para meses lectivos activos, mapea las facturas en `invoices`: `✓ Cancelado` (Verde), `⏳ Parcial` (Ámbar) o `⚠️ Deudor` (Rojo).
   - Inclusión en la leyenda superior del estado oficial `🎓 Culminado (8/8)` y resaltado dinámico de la columna del mes en curso (`Septiembre (Actual)`).

---

### 47. Regla Inquebrantable de Transformación de Sala por Instrumento y Colindancia de Edades (ADR-0147)
1. **Regla de Transformación de Sala por Instrumento**:
   - Cuando el primer alumno entra a una sala en un turno específico, **la sala en ese turno se transforma y queda reservada exclusivamente para ese instrumento**.
   - Queda **TERMINANTEMENTE PROHIBIDO** mezclar instrumentos distintos en la misma sala y turno (ej. un alumno de Batería y uno de Guitarra con Jeremy en Sala A; o Piano y Violín con Fernando en Sala B; o Piano Infantil y Canto con Nathaly en Sala C).
   - Excepción temporal autorizada: Guitarra clásica y Guitarra eléctrica sí pueden convivir entre sí (familia `GUITARRA`) mientras se captan alumnos, pero jamás con Batería.
2. **Convivencia por Colindancia de Rangos de Edad (dentro del mismo instrumento)**:
   - Junior (7 a 12 años) puede compartir con Junior (7 a 12) o con Juvenil (13 a 17) por ser rangos colindantes.
   - Juvenil (13 a 17 años) puede compartir con Junior (7 a 12) o con Master (18+).
   - Junior (7 a 12 años) y Master (18+) tienen **PROHIBIDO** compartir sala (no son colindantes).
3. **Alerta Crítica y Bloqueo en Horarios (`ScheduleStudentForm`)**:
   - `evaluateSlotPedagogicalCompatibility` en `room-compatibility.ts` evalúa `checkInstrumentCompatibility`.
   - Al detectar conflicto de instrumento, se renderiza una alerta en rojo crítico (`🚨 Conflicto Crítico de Instrumentos en Sala`) y se desactiva el guardado hasta que secretaría marque la confirmación obligatoria de excepción autorizada por Dirección.

---

### 48. Desbloqueo Controlado de Modalidad y Aislamiento de Formularios de Matrícula (ADR-0148)
1. **Reseteo Atómico de Formularios (`resetForm`)**:
   - En `AddNewStudentDialog`, invocar `resetForm()` al abrir y cerrar el modal para garantizar que cada nuevo alumno comience con el estado predeterminado limpio (`modality: "Regular (8 clases / 45 min)"`), eliminando la contaminación cruzada entre formularios de matrícula sucesivos.
2. **Candado Interactivo de Desbloqueo Controlado**:
   - Implementar el botón toggle interactivo `[🔒 Desbloquear para Cambiar]` / `[🔓 Modalidad Desbloqueada]` tanto en `ScheduleStudentForm` como en `EditStudentSheetInner`, permitiendo correcciones administrativas explícitas sin romper las restricciones de horario.
3. **Universalización de Prioridad de Makeups en Paquetes Flexibles**:
   - Garantizar que las recuperaciones puntuales (`isMakeup: true`) aisladas por `dateStr` en `excludedDates` coexistan y tengan prioridad sobre lecciones recurrentes sin recortar la cuota total de sesiones contratadas (`packageTotalSessions`).

---

### 49. Desbloqueo Ilimitado de Reprogramaciones en Kardex y Preservación Integral de Asistencias y Makeups (ADR-0149)
1. **Preservación Incondicional de Evaluadas y Makeups**:
   - Todas las sesiones evaluadas (`status !== "pendiente"`) se preservan de manera inmutable como hechos históricos en el Kardex y en el Horario.
   - Todas las sesiones de recuperación (`isMakeup: true`), tanto evaluadas como pendientes, se preservan incondicionalmente, cumpliendo el principio fundacional: *"Las clases no se pierden, se recuperan"*.
   - Queda **TERMINANTEMENTE PROHIBIDO** aplicar `.slice(0, targetQuota)` sobre sesiones evaluadas o makeups. Solo se acotan las sesiones regulares pendientes (`status === "pendiente" && !isMakeup`) necesarias para completar la cuota contractual: `regularSlotsNeeded = Math.max(0, targetQuota - (attendedCount + pendingMakeups.length))`.
2. **Ventana Dinámica de Proyección (`maxLessonDays`)**:
   - `maxDaysToScan` calcula dinámicamente la fecha más lejana entre todas las lecciones del alumno (`lesson.dateStr`), asegurando que cualquier clase reprogramada a futuro (a 90, 120 o 180 días) sea alcanzada e incorporada en la proyección mensual y de ciclo.
3. **Proyección Proactiva hacia el Futuro (`getTargetDateInFuture`)**:
   - Al abrir el diálogo de reprogramación en el Kardex, `reschedDate` se calcula hacia el futuro (`getTargetDateInFuture`), garantizando que la fecha sugerida sea posterior a la falta y sincronizada bidireccionalmente con el día de semana seleccionado (`reschedDay`).
4. **Distintivo Visual de Recuperación Enlazada en Kardex**:
   - En la fila de cada falta (`ausente`), se añade un badge informativo que enlaza directamente con su clase de recuperación agendada (`🔄 Recup.: [Día] [Hora] ([Estado: ✓ Asistió | ⏳ Pendiente])`), otorgando total transparencia a secretaría y dirección.
5. **Fallback y Deduplicación Preventiva en `rescheduleLesson`**:
   - `rescheduleLesson` en `app-store.ts` busca la lección en `s.schedule` y en `adminStudents[...].scheduleLessons`. Además, si se reprograma nuevamente una inasistencia que tenía un makeup previo sin evaluar, actualiza la sesión previa en lugar de crear duplicados fantasma.

---

### 50. Blindaje de Fechas de Inicio de Clases, Soporte Integral de Paquetes Flexibles (24 Clases) y Reactivación Dinámica de Vista por Mes en Kardex (ADR-0150)
1. **Inyección Estricta de `effectiveFrom` en Horario Semanal (`ScheduleStudentForm`)**:
   - Toda lección recurrente generada en `ScheduleStudentForm` incluye explícitamente `effectiveFrom: startStr`.
   - El cálculo de `planEndDate` se realiza mediante aritmética de fechas local de calendario (`Date(y, m + durationMonths, d)` formateada a `YYYY-MM-DD`), erradicando la regresión horaria provocada por `toISOString()` (UTC frente a UTC-5).
   - Para planes de Paquete Flexible (A demanda), la fecha límite contractual se extiende automáticamente (mínimo a fin de año) para permitir el consumo fluido de toda la bolsa de clases.
2. **Exención de `isBeyondEnd` para Paquetes Flexibles en Kardex y Proyección de Ciclos**:
   - En `computeStudentCycleSessions` (`kardex-calculator.ts`) y `allCycleSessions` (`student-attendance-kardex.tsx`), la condición de corte por fin de vigencia:
     `const isBeyondEnd = (!isFlexiblePackage && effectivePlanEndDate) ? curDateStr > effectivePlanEndDate : false;`
     exime formalmente a los paquetes flexibles.
   - La vigencia de un Paquete Flexible está determinada exclusivamente por la cantidad de sesiones consumidas frente a la cuota contratada (`packageTotalSessions`, ej. 24 clases), nunca por un candado rígido de mes calendario de 30 días.
   - La ventana de escaneo para paquetes flexibles se amplía a 240 días (`maxDaysToScan = 240`), garantizando que las 24 sesiones se proyecten de forma continua a través de todos los meses necesarios (julio, agosto, setiembre, octubre).
3. **Computación Dinámica del Mes Calendario vía `computeStudentMonthSessions`**:
   - Se implementó y exportó la función `computeStudentMonthSessions` en `src/lib/kardex-calculator.ts`, la cual calcula en tiempo real todas las sesiones pertenecientes al mes y año calendario seleccionados:
     - Respeta `effectivePlanStartDate` como piso temporal absoluto (no proyecta clases previas al inicio).
     - Evalúa marcas de asistencia existentes (`attendanceByDate[dateStr]`), reprogramaciones puntuales (`dateStr`) y exclusiones (`excludedDates`).
     - Aplica barreras temporales absolutas de transición (`effectiveFrom` / `effectiveUntil`).
   - En `student-attendance-kardex.tsx`, cuando la pestaña activa es `"calendar"`, se invoca directamente `computeStudentMonthSessions`, permitiendo navegar libremente entre Julio, Agosto, Setiembre, Octubre y cualquier mes con datos en vivo.
   - Se expandió la interfaz de usuario con botones de acceso rápido para Julio, Agosto, Setiembre y Octubre, además del selector desplegable completo.

---

### 51. Consumo Simétrico de Créditos de Recuperación, Vinculación Visual en Kardex y Preservación de Cuota Regular (ADR-0151)
1. **Consumo y Restauración Simétrica de Créditos (`makeupCredits`)**:
   - Al agendar una reprogramación (`rescheduleLesson`) que recupera una inasistencia (`ausente`, `tarde` o `justificada`), se consume de inmediato 1 crédito: `makeupCredits = Math.max(0, makeupCredits - 1)`.
   - Al revertir o cancelar una clase de recuperación (`revertMakeupLesson`), se restaura automáticamente el crédito: `makeupCredits = makeupCredits + 1`.
   - Ambas mutaciones se persisten de inmediato en Zustand y PostgreSQL vía `backgroundSyncStudentToDB`.
2. **Vinculación Visual y Trazabilidad en Kardex (`linkedMakeup`)**:
   - Cada fila de sesión evalúa si existe una recuperación agendada asociada (`recoveringLessonDate === item.dateStr`).
   - Si existe una recuperación agendada (`linkedMakeup`), se oculta el botón `[🔄 Reprogramar]` y se muestra un badge interactivo con el estado de la sesión (`🔄 Recup.: ${dayShort} ${time} (⏳ Agendada / ✓ Asistió)`) acompañado del botón `✏️ Modificar`.
   - El banner de la filosofía Vibra `{liveStudent.makeupCredits} clase(s) pendiente(s) por recuperar` refleja fielmente los créditos no agendados.
3. **Preservación Incondicional de Clases Regulares en Ciclo Lectivo (`student-cycle.ts`)**:
   - El ciclo lectivo solo se considera formalmente culminado cuando el alumno ha asistido a la totalidad de clases contratadas (`attendedCount >= targetQuota`). Las inasistencias (faltas) **NO** culminan el ciclo.
   - El cálculo de cupos pendientes necesarios (`slotsNeeded`) descuenta únicamente las clases asistidas (`attendedCount`) y las recuperaciones ya agendadas (`pendingMakeups`), impidiendo que las faltas y makeups canibalicen las clases regulares de las semanas finales del ciclo (ej. Semana 4).
4. **Detección Universal de Paquetes Flexibles y Preservación de Vigencia**:
   - Se unificó la detección de Paquete Flexible de manera insensible a mayúsculas/minúsculas comprobando `modalityStr.includes("flex") || modalityStr.includes("demanda") || modalityStr.includes("paquete") || planType === "Paquete Flexible" || packageTotalSessions > 8` en `kardex-calculator.ts`, `student-cycle.ts`, `student-attendance-kardex.tsx` y `hydrateFromBackend` (`app-store.ts`).
   - Evita la degradación a 8 clases o corte a 30 días cuando PostgreSQL devuelve `'Regular (8 clases / 45 min)'` en la columna SQL `modality`.
   - En `students-table.tsx`, al editar `planStartDate`, se detecta la condición de Paquete Flexible para preservar su `planEndDate` extendido (`2026-12-31`).

---

### 52. Exclusión Incondicional por Reprogramación, Erradicación de Clases Fantasma y Proyección Integral de Paquetes Flexibles (ADR-0152)
1. **Exclusión Incondicional por Reprogramación (`excludedDates`)**:
   - Toda fecha presente en `lesson.excludedDates` queda excluida **incondicionalmente** en `student-attendance-kardex.tsx`, `kardex-calculator.ts` (`computeStudentCycleSessions` y `computeStudentMonthSessions`) y `student-cycle.ts` (`computeStudentCycle` y `isLessonInStudentCycle`).
   - Queda **TERMINANTEMENTE PROHIBIDO** evaluar excepciones como `if (!hasEvaluated) return;` que permitan que clases con faltas previas permanezcan visibles en su fecha original tras haber sido reprogramadas a otra fecha.
   - En `isLessonInStudentCycle`, la verificación de `excludedDates` se ejecuta prioritariamente antes de evaluar `attendanceByDate`, impidiendo que fechas reprogramadas sangren en el cálculo del ciclo lectivo.
   - En `computeStudentCycle`, se omite la recolección de asistencias evaluadas en fechas pertenecientes a `excludedDates`.
2. **Limpieza Atómica de Asistencia en `rescheduleLesson` (`app-store.ts`)**:
   - Al reprogramar una lección puntual (`originalDateStr`):
     - Se eliminan las marcas previas `cleanAttendanceByDate[originalDateStr]` y `cleanAttendanceByWeek[targetWeekIndex]`.
     - Se recalculan de forma reactiva `attendanceRate` y `recentAttendance` en el perfil del alumno en Zustand y PostgreSQL para eliminar falsas inasistencias (0% de asistencia).
     - Se invoca `postgrestDelete("attendance_logs", { student_id: targetSt.id, note: like.*originalDateStr* })` para purgar los registros de asistencia huérfanos en PostgreSQL.
3. **Reprogramación Directa en Estado Pendiente (`isEditMode` / `status === "pendiente"`)**:
   - El botón `🔄 Reprogramar` permanece visible y habilitado tanto en sesiones evaluadas (`ausente`, `tarde`, `justificada`) como en sesiones `pendiente` (sin marcar) y en modo edición (`isEditMode`), permitiendo la coordinación anticipada de cambios de horario sin requerir forzar marcas de falta previas.
4. **Proyección Matemática de 24 Clases en Paquetes Flexibles**:
   - Al detectar un Paquete Flexible (`isFlexiblePackage`), el Kardex y el ciclo escanean con una ventana extendida de hasta 240 días, proyectando la totalidad de la bolsa contratada (`packageTotalSessions`, ej. 24 clases a demanda) a lo largo de todos los meses lectivos sin recortes de fin de mes calendario.

---

### 53. Erradicación de Asistencia Semanal Relativa en Celdas de Calendario y Conteo Estricto de Bolsas Flexibles (ADR-0153)
1. **Aislamiento por Fecha Exacta en Celdas de Calendario (`agenda-board.tsx` y `teacher.index.tsx`)**:
   - Toda celda de calendario que represente un día específico (`dayInfo.dateStr` o `targetDateStr`) debe resolver su asistencia **exclusivamente** mediante `lesson.attendanceByDate?.[dateStr]`.
   - Queda **TERMINANTEMENTE PROHIBIDO** utilizar fallbacks a índices de semana relativos (`attendanceByWeek?.[safeWeekIndex]`), los cuales carecen de año y mes y contaminaban la semana 1 de nuevos meses (como Octubre) con asistencias de meses anteriores (como Setiembre), provocando falsas asistencias en días futuros (ej. Sábado 03 de Octubre).
2. **Conteo Fiel de Clases Consumidas en Bolsas Flexibles (`totalPackageAttended`)**:
   - `totalPackageAttended` calcula el número de fechas únicas donde el alumno asistió efectivamente (`"presente"` o `"tarde"`), descartando cancelaciones o exclusiones de reprogramación. Se elimina cualquier fallback que infle artificialmente la bolsa si el alumno cuenta con 0 asistencias reales.
3. **Preservación de Clases en Vista de Mes Calendario (Regla 3.3 AGENTS.md)**:
   - En `computeStudentMonthSessions` (`kardex-calculator.ts`), la vista de mes calendario proyecta las sesiones regulares agendadas del mes seleccionado sin truncar fechas previas a `planStartDate`, permitiendo auditar el cronograma de meses pasados y en curso con total integridad.

---

### 54. Restitución de la Cuota Estricta Contractual en Kardex y Corrección de Visibilidad del Botón Reprogramar (ADR-0154)
1. **Cumplimiento Estricto de la Cuota Contractual (`targetQuota`)**:
   - En `kardex-calculator.ts`, `student-attendance-kardex.tsx` y `student-cycle.ts`, el número de clases regulares pendientes a proyectar se rige estrictamente por:
     `const regularSlotsNeeded = Math.max(0, targetQuota - evaluated.length - pendingMakeups.length);`
   - Todas las sesiones ya evaluadas (`presente`, `ausente`, `tarde`, `justificada`) más las recuperaciones agendadas (`pendingMakeups`) consumen formalmente cupos dentro del ciclo lectivo.
   - Queda **TERMINANTEMENTE PROHIBIDO** omitir las inasistencias en el cálculo de cupos consumidos, impidiendo la inflación artificial del contrato a 9 o 10 clases en alumnos regulares de 8 sesiones (como Mia Lucero, Sasha Dharma o Gael Mathias).
2. **Aislamiento del Botón `[ 🔄 Reprogramar ]` en Modo Consulta**:
   - En `student-attendance-kardex.tsx`, el botón directo `[ 🔄 Reprogramar ]` solo se renderiza si la sesión tiene una inasistencia evaluada (`item.status === "ausente" || item.status === "tarde" || item.status === "justificada"`) o si el usuario ha habilitado activamente el `[ ✏️ Modo Edición ]` (`isEditMode === true`).
   - Las clases regulares pendientes (`⚪ Sin marcar`) en Modo Consulta no muestran el botón por defecto, eliminando la falsa percepción de que las clases están "por defecto en reprogramado".
3. **Normalización Numérica de `packageTotalSessions` para Bolsas Flexibles**:
   - En `students.service.ts` y Zustand (`app-store.ts`), `packageTotalSessions` se normaliza numéricamente mediante `Number(packageTotalSessions) > 8`, garantizando que alumnos con bolsa flexible (como Andrea Fernanda, con 24 clases a demanda) proyecten la totalidad de sus 24 sesiones sin recortes accidentales a cuotas de 8 clases.

---

### 55. Blindaje de Categoría de Recuperación en Agenda y Saneamiento de Horarios Recurrentes (ADR-0155)
1. **Definición Estricta de Recuperación en Agenda (`agenda-board.tsx`)**:
   - Una clase de recuperación es **exclusivamente puntual**: debe tener `lesson.isMakeup === true` o contar con una fecha específica acotada (`lesson.dateStr`) junto con `lesson.category === "RECUPERACION"`.
   - Está **TERMINANTEMENTE PROHIBIDO** clasificar o renderizar como recuperación (`isRecup = true`, chip `🔴 Recuperación` o color rojo) a ninguna lección de plantilla semanal recurrente abierta (`!lesson.dateStr && !lesson.isMakeup`).
2. **Resolución Jerárquica de Categoría Cromática (`catKey`)**:
   - Si la lección no cumple los criterios puntuales de recuperación, `catKey` se resuelve jerárquicamente a partir de su categoría pedagógica real (`lesson.category`) si es distinta de `"RECUPERACION"`, o con fallback inmediato a la categoría de edad del alumno (`studentProfile?.ageCategory ?? "JUNIOR"`).
   - Esto blinda las 4 vistas de la agenda (salas, docentes, grilla semanal y sábados) contra residuos históricos en metadatos.
3. **Preservación de Trazabilidad Histórica y Datos Limpios**:
   - Los registros de plantilla recurrente en `emergency_contact->'scheduleLessons'` de PostgreSQL deben mantener siempre la categoría pedagógica correspondiente (`ESTIMULACION`, `INFANTIL`, `JUNIOR`, `JUVENIL`, `MASTER`, `ADULTO`).
   - Las recuperaciones efectivas en PostgreSQL siempre deben almacenar `isMakeup: true`, `recoveringLessonDate` y la fecha puntual (`dateStr`).

---

### 56. Aislamiento Estricto de Slots en Reprogramaciones, Deduplicación Intra-Celda y Erradicación de Clases Duplicadas (ADR-0156)
1. **Validación Estricta por Franja Horaria en Ciclo Contractual (`cycle.validSlots.has(slotKey)`)**:
   - En `isLessonInStudentCycle` (`src/lib/student-cycle.ts`), queda **TERMINANTEMENTE PROHIBIDO** utilizar fallbacks por fecha como `|| (cycle.validDates.has(lessonDateStr) && !lesson.dateStr)`.
   - La aprobación de una lección semanal abierta dentro del ciclo lectivo requiere **obligatoriamente** que su franja horaria exacta (`dateStr-time`) forme parte del conjunto `cycle.validSlots`.
   - Si un alumno ya completó o cubrió su cuota contractual (ej. 8 de 8 clases) mediante una reprogramación o recuperación puntual en una fecha dada (ej. sábado 10/10/2026 a las 09:00 para Mia Lucero), la plantilla semanal regular de esa misma fecha (ej. 10:30) queda **automáticamente excluida**, eliminando duplicados visuales y previniendo la inflación ilícita del contrato.
2. **Sincronización en Vista de Mes Calendario (`computeStudentMonthSessions`)**:
   - En `src/lib/kardex-calculator.ts`, para alumnos regulares (`!isFlexiblePackage`), dentro de su período activo (`curDateStr >= planStartDate`), las sesiones regulares pendientes no se proyectan si su slot (`curDateStr-time`) no pertenece a `cycle.validSlots`.
   - Esto mantiene la concordancia matemática absoluta entre el Kardex mensual y el Horario de Clases.
3. **Escudo de Deduplicación Intra-Celda (`dedupeLessonsForCell`)**:
   - En `agenda-board.tsx` (`renderSingleDayTable`, vista semanal `renderWeeklyGrid` y vista diaria `renderDailyView`), `minimal-agenda-calendar.tsx` y `teacher.index.tsx`, toda celda/franja horaria aplica `dedupeLessonsForCell` para garantizar que un mismo alumno jamás figure más de una vez en la misma casilla:
     1. Prevalece la sesión con asistencia evaluada en esa fecha (`presente`, `ausente`, `tarde`, `justificada`).
     2. Prevalece la sesión puntual con fecha asignada (`dateStr`) o recuperación (`isMakeup`).
     3. Descarta la plantilla semanal abierta redundante.

---

### 57. Soporte Integral para Plan Intensivo (90 min), Doble Bloque Contiguo y Criterio Estricto de Reprogramación en Kardex (ADR-0157)
1. **Criterio Estricto de Reprogramación en Kardex (`student-attendance-kardex.tsx`)**:
   - El botón directo `[ 🔄 Reprogramar ]` en el Kardex de asistencias **SOLO** se muestra ante inasistencias reales: **Falta (`ausente`)** o **Justificada (`justificada`)**, o ante sesiones pendientes (`pendiente`) cuando secretaría activa el Modo Edición (`isEditMode`).
   - Las sesiones marcadas como **`presente`** o **`tarde`** tienen terminantemente prohibido mostrar el botón de reprogramación, respetando la regla pedagógica de que la tardanza computa como asistencia consumida en sala.
2. **Doble Bloque Contiguo de 45m para Plan Intensivo en Agenda Física (`ScheduleStudentForm`)**:
   - Las clases de Plan Intensivo tienen una duración de 90 minutos continuos (1h 30m).
   - En la grilla física de horarios (módulos de 45 minutos), el agendamiento del Plan Intensivo genera **DOS sesiones contiguas de 45 minutos** en el mismo día, sala y docente:
     - Bloque 1: Franja horaria inicial (`time1`, ej. 09:00 - 09:45).
     - Bloque 2: Franja horaria consecutiva (`getNextConsecutiveSlot`, ej. 09:45 - 10:30).
   - El formulario valida aforo y convivencia pedagógica de ambos turnos en tiempo real, bloqueando el turno si no existe franja consecutiva disponible.
3. **Consolidación de Sesiones en Kardex de Asistencias (`kardex-calculator.ts`)**:
   - En el Kardex del alumno, las dos lecciones de 45m del mismo día se consolidan por fecha (`slotKey = item.dateStr`), calculando la duración total como 90 minutos (`09:00 - 10:30`) y proyectando exactamente **4 sesiones al mes** (`targetQuota = 4`).
4. **Desbloqueo de Fechas de Inicio y Aislamiento de `effectiveFrom`**:
   - La barrera temporal `effectiveFrom` aplica **exclusivamente** a plantillas recurrentes abiertas (`!lesson.dateStr`).
   - Las sesiones puntuales con fecha (`lesson.dateStr`) y reprogramaciones (`isMakeup`) jamás son filtradas por `effectiveFrom`, permitiendo registrar e iniciar clases en la fecha exacta acordada (ej. caso Liam Renato el sábado 03/10/2026).

---

### 58. Selector Dinámico de Mes y Semanas en Portal Docente (Octubre - Diciembre 2026) (ADR-0158)
1. **Navegación Mensual y Semanal en Kiosco Docente (`/teacher`) y Mi Horario (`/teacher/agenda`)**:
   - Se incorporó un selector dinámico de Mes (Julio 2026 a Diciembre 2026) y selector de Semanas (`monthWeeks`) en `src/routes/teacher.index.tsx`, `src/routes/teacher.agenda.tsx` y `src/components/agenda/minimal-agenda-calendar.tsx`.
   - Permite a los docentes navegar y gestionar asistencias de meses en curso y futuros (Octubre, Noviembre y Diciembre 2026), erradicando el bloqueo visual que confinaba la vista hasta Setiembre 2026.
   - Sincroniza dinámicamente la semana activa según la fecha del sistema (`getCurrentWeekIndex`).

---

### 59. Restricción Estricta de Métricas a Cartera Activa en Seguimiento & Renovación (ADR-0159)
1. **Erradicación de Conteos Inflados con Base Histórica Inactiva**:
   - En `src/components/admin/student-renewals-retention-panel.tsx`, se eliminaron métricas de cartera global acumulada (como "Total Alumnos 93").
   - Las 4 tarjetas de indicadores clave operan **únicamente** sobre la base de alumnos con `status === 'activo'`:
     - Alumnos Activos en Cartera.
     - Próximos a Vencer (conteo y lista focalizada).
     - Cuota Completada (100% de clases asistidas / evaluadas).
     - Alumnos Al Día en Pagos.

---

### 60. Asignación Docente y de Sala Estricta para Piano Infantil (Caso Ethan Paolo Jara Saldarriaga) (ADR-0160)
1. **Cumplimiento Invariable de Regla Pedagógica ADR-0102**:
   - Alumnos de 4 a 8 años en Piano corresponden **exclusivamente** a la **Prof. Nathaly** en **Sala C** (Piano Infantil), nunca a Prof. Fernando (Piano estándar / Sala B).
   - Se actualizó el registro de **Ethan Paolo Jara Saldarriaga** (`ee03db47-1a4d-492a-a442-99bdabd8d66f`, 7 años, nacido en 2019) en Insforge PostgreSQL:
     - `instrument`: `"Piano Infantil"`.
     - `assigned_teacher_id`: `"00000000-0000-0000-0000-000000000005"` (Prof. Nathaly).
     - `emergency_contact.teacher`: `"Nathaly"`.
     - `emergency_contact.room`: `"Sala C"`.
     - `emergency_contact.ageCategory`: `"INFANTIL"`.
     - Lecciones semanales recurrentes (`sch-1790119019904-f6g0` Lun 17:30 y `sch-1790119019904-pegg` Mié 17:30) y recuperaciones puntuales (23/09 y 05/10 a las 18:15) asignadas a Nathaly en Sala C.
2. **Visibilidad en Kiosco Docente y Agenda Central**:
   - Ethan figura con sus marcas de asistencia en el portal de Prof. Nathaly (`/teacher` y `/teacher/agenda`) y en la columna de Sala C en `/admin/agenda`.
   - Se eliminaron cruces indebidos de sala en Sala B en la fecha 05/10/2026.

---

### 61. Cómputo de Evaluaciones por Vigencia de Ciclo Activo y Saneamiento de Ficha/Pago para Alejandro Huarca (ADR-0161)
1. **Aislamiento de Evaluaciones al Ciclo Activo (`dateStr >= planStartDate`) en `computeStudentCycle`**:
   - En `src/lib/student-cycle.ts`, `cycleEvaluatedDates` y `cycleAttendedDates` acotan las evaluaciones consideradas para el cumplimiento de la cuota (`targetQuota`) estrictamente a aquellas ocurridas dentro de la vigencia del ciclo contractual activo (`dateStr >= studentProfile.planStartDate`).
   - Las evaluaciones históricas anteriores a `planStartDate` (ej. las 8 clases de Agosto/Setiembre de un alumno que renovó para Octubre) se preservan en `evaluatedSlots` y `evaluatedDates` para que permanezcan visibles con sus marcas en meses pasados, pero **jamás saturan o agotan la cuota del nuevo ciclo**.
   - Esto erradica el bloqueo donde un alumno renovado (ej. Alejandro Huarca con inicio de nuevo ciclo el 05/10/2026) figuraba falsamente como "ciclo culminado" tras asistir a su primera clase, desbloqueando la proyección de sus 7 clases restantes en Octubre y Noviembre tanto en el Horario de Clases como en el Kardex.
2. **Saneamiento en PostgreSQL Insforge de Alejandro Huarca (`d3765829-7338-4524-b7ee-88f1dcd51ce8`)**:
   - `full_name`: `"Alejandro Huarca"`.
   - `emergency_contact.amountPaid`: 594 (297 ciclo 1 + 297 renovación ciclo 2).
   - `emergency_contact.balance`: 0.
   - `emergency_contact.payment`: `"al-dia"`.
   - `invoices` (`ca3be401-5b42-404f-8262-20483d37220d`): `amount_paid: 297.00`, `remaining_balance: 0.00`, `status: "pagado"`, `concept: "Plan Regular (8 clases / 45 min) (Violín) — Alejandro Huarca (Renovación Ciclo)"`.
   - `payment_audit_logs`: Registro oficial de auditoría de pago por S/ 297 vía Yape con referencia `RENOVACION-PAGO`.

---

### 62. Consolidación Integral de 90 Minutos para Plan Intensivo (4 clases / 90 min) en Kardex y Horario de Clases (ADR-0162)
1. **Consolidación de Bloques Contiguos en Kardex (`src/lib/kardex-calculator.ts`)**:
   - En `computeStudentMonthSessions`, se implementó la detección de `isIntensive` (`modalityStr.includes("inten") || modalityStr.includes("90 min") || (modalityStr.includes("4 clases") && !modalityStr.includes("45 min"))`).
   - Se corrigió el cálculo de duración de la sesión en el Kardex: `durationMin = isIntensive ? 90 : 45`, garantizando que `timeEnd` abarque los 90 minutos reglamentarios (ej. `10:30 - 12:00`, `09:00 - 10:30`, `16:00 - 17:30`).
   - Tanto en la proyección mensual como en la del ciclo completo, múltiples bloques contiguos de 45 minutos asignados a una misma fecha se consolidan en una única fila de sesión de 90 minutos para esa fecha (`slotKey = isIntensive ? item.dateStr : ...`), actualizando automáticamente su estado a evaluado si cualquiera de los bloques cuenta con marca de asistencia en sala.
2. **Ocultamiento del Botón `+ De corrido (+45m)` en Sesiones Intensivas (`src/components/admin/student-attendance-kardex.tsx`)**:
   - Se condicionó el botón de clase contigua a `{!isIntensivo && ...}`, impidiendo agregar 45 minutos adicionales sobre una sesión que por diseño contractual ya cubre 90 minutos.
3. **Sincronización Reactiva de Asistencias entre Bloques Contiguos (`src/store/app-store.ts`)**:
   - En `setStudentAttendance` y `setStudentSessionAttendance`, al evaluar una sesión de un alumno de Plan Intensivo (ej. marcar "Presente"), el estado se replica en ambos bloques contiguos de esa fecha, preservando la coherencia entre el Kardex, la Agenda central y el Kiosco docente.
4. **Saneamiento Quirúrgico en PostgreSQL Insforge**:
   - **Antonella** (`8c322418-4959-43eb-8fe8-7224451dee7e`): Horario oficial corregido a Viernes de 09:00 a 09:45 y 09:45 a 10:30 (Jeremy, Sala A, Piano, 2 bloques contiguos). Asistencias de 18/09, 25/09 y 02/10 preservadas como `presente`. Le resta su última clase el 09/10 para completar su ciclo de 4 sesiones de 90 min.
   - **Benjamin** (`57db57ae-ad12-4e58-bedc-659ac7dbef24`): Asignados 2 bloques contiguos los Sábados: 10:30 a 11:15 y 11:15 a 12:00 (Jeremy, Sala A, Piano). Asistencias de 26/09 y 03/10 preservadas como `presente`.
   - **Eitan Anton** (`482dd79d-630e-41dd-91d8-4730e73651d8`): Asignados 2 bloques contiguos los Sábados: 09:00 a 09:45 y 09:45 a 10:30 (Fernando, Sala B, Piano). Se corrigió `packageTotalSessions` a 4. Asistencias de 12/09 y 26/09 (recuperación de 19/09) preservadas como `presente`.
   - **Flavia Nicole Concepcion** (`4834995a-a8df-4531-b1de-ddaec8d2550f`): Asignados 2 bloques contiguos los Viernes: 16:00 a 16:45 y 16:45 a 17:30 (Fernando, Sala B, Piano). Asistencias de 04/09, 11/09 y 18/09 preservadas como `presente` y recuperación programada para el 09/10 en ambos bloques.
   - **Viernes Completo**: Confirmada la nómina de 4 alumnos activos los Viernes: Antonella (09:00 - 10:30, Sala A), Flavia Nicole (16:00 - 17:30, Sala B), Mia Lucero Bellido (16:00 - 16:45, Sala C) y Kamila Valentina (17:30 - 19:00, Sala A).

---

### 63. Blindaje de Autofill de Búsqueda, Saneamiento de Horario Bruno Marcelo y Soporte de Adelantos Previos a planStartDate (ADR-0164)
1. **Inmunización Absoluta del Input de Búsqueda contra Autofill del Navegador (`src/components/admin/students-table.tsx`)**:
   - Se erradicó el comportamiento anómalo en navegadores Chromium donde la barra de búsqueda en `/admin/alumnos` precargaba involuntariamente el texto "camila" desde la caché de perfiles y formularios del navegador de secretaría ("Jackeline").
   - Se agregaron atributos estrictos de bloqueo: `id="students-filter-search-input"`, `name="students_filter_search_no_autofill"`, `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="off"`, `spellCheck={false}`, `data-1p-ignore`, `data-lpignore="true"`.
   - Se incorporó un botón de limpieza rápida (`<X />`) en el lateral derecho del input cuando el texto no está vacío.
   - Se garantizó en el ciclo de vida del componente (`useEffect` de montaje) que `search` se inicialice incondicionalmente en cadena vacía `""`.
2. **Deduplicación Reactiva de Alumnos Activos en Hidratación (`src/store/app-store.ts`)**:
   - En `hydrateFromBackend`, se implementó una pasada de deduplicación sobre `cleanStudents` que descarta homónimos o registros duplicados activos (`status === 'activo'`), impidiendo que un alumno figure en múltiples filas repetidas en el Directorio.
   - Se pasó a estado `pausa` el ciclo anterior culminado de **kamila Valentina G.** (`064f2b68-31da-4302-81d4-a447fcf1a1cc`), conservando activo únicamente su ciclo vigente **CAMILA VALENTINA** (`5c44e64a-b55d-4cf3-a668-1346b4a3cd8c`).
3. **Corrección de Duplicidad en Jueves para Bruno Marcelo (`e40983ad-5a34-4ef8-9ac7-d2169f071e52`)**:
   - Se detectó que Bruno tenía registradas dos lecciones los Jueves: `sch-83` a las 17:30 y `sch-89` a las 18:15, lo que provocaba que el 01 de Octubre (y 08 de Octubre) se duplicara su asistencia en sala y consumiera prematuramente su cuota en solo 3 semanas.
   - Se eliminó quirúrgicamente `sch-83` (Jue 17:30) en PostgreSQL Insforge. Bruno quedó con su horario oficial pareado: Martes 18:15 (`sch-36`) y Jueves 18:15 (`sch-89`), totalizando exactamente sus 8 clases a lo largo de 4 semanas.
4. **Soporte de Adelantos y Recuperaciones Previas a `planStartDate` (Caso Santiago Valladolid / `165e513a-d8ea-4ba5-a5a7-ba12d365e2aa`)**:
   - **Diagnóstico del Bug**: Al reprogramar o adelantar una clase a una fecha anterior al `planStartDate` formal (ej. Santiago inició formalmente el 06/10/2026 pero asistió el 05/10/2026), los motores `computeStudentCycleSessions` (`src/lib/kardex-calculator.ts`) y `computeStudentCycle` (`src/lib/student-cycle.ts`) iniciaban el escaneo estrictamente en `startDate`. Al no visitar fechas previas, la clase puntual del 05/10 quedaba invisible, mientras que la clase original quedaba excluida vía `excludedDates`, reduciendo la cuota proyectada a 7 clases.
   - **Solución Arquitectónica (`scanStartDate`)**:
     - Se incorporó el cálculo dinámico de `scanStartDate`, que retrocede la ventana de escaneo hasta 30 días antes de `startDate` si existen lecciones puntuales agendadas con `dateStr < startDate`.
     - Se blindaron las lecciones recurrentes con la barrera temporal `if (curDateStr < startStr) return;`, asegurando que las plantillas semanales abiertas jamás proyecten clases antes de la fecha formal de inicio.
   - **Saneamiento en PostgreSQL Insforge**:
     - Se actualizó `emergency_contact.planStartDate = "2026-10-05"` para reflejar la asistencia real en sala.
     - Se limpiaron las exclusiones erróneas acumuladas en sus lecciones recurrentes (`sch-1790898875372-gked` y `sch-1790898875372-q5lb`).
     - Se preservó su clase adelantada del 05/10/2026 con marca `presente`, proyectando exactamente sus 8 sesiones contractuales.

---

### 64. Resolución Integral del Plan Intensivo (90 min / 2 Bloques Contiguos) en Horario de Clases y Motor de Ciclos (ADR-0165)
1. **Blindaje del Algoritmo de Proyección en Plan Intensivo (`src/lib/student-cycle.ts`)**:
   - **Diagnóstico del Bug de Doble Conteo**: En el cálculo de cuota del Plan Intensivo (4 clases de 90 min), si una fecha lectiva previa contaba con solo uno de sus dos bloques evaluados (ej. Antonella el 25/09 tenía 16:00 `presente` pero 16:45 sin marcar), esa fecha ya computaba en `evaluatedCount`. Sin embargo, el bloque huérfano pendiente provocaba que `2026-09-25` ingresara a `pendingRegular` y fuera seleccionada nuevamente por `uniqueDates.slice(0, datesNeeded)`. Esto consumía el cupo restante y expulsaba del ciclo a la 4ta fecha lectiva (`2026-10-09`), ocultándola del Horario de Clases (`AgendaBoard`).
   - **Corrección Arquitectónica**:
     - Se filtraron de forma estricta las fechas verdaderamente futuras que no hayan sido evaluadas previamente: `futureDates = uniqueDates.filter(d => !evaluatedDates.has(d))`.
     - `datesNeeded = Math.max(0, targetQuota - evaluatedCount - pendingMakeups.length)` toma sus fechas exclusivamente de `futureDates`.
     - Se preservan tanto los bloques de las fechas futuras necesarias como los bloques pendientes huérfanos en fechas parcialmente evaluadas (`chosenPendingRegular = pendingRegular.filter(p => chosenDates.has(p.dateStr) || evaluatedDates.has(p.dateStr))`), garantizando que la 4ta clase siempre aparezca y que los 90 minutos se completen.
   - **Alineación de Conteo Regular vs Intensivo**: En Plan Intensivo, `evaluatedCount` y `attendedCount` computan por fechas completas (`cycleEvaluatedDates.size` / `cycleAttendedDates.size`), mientras que en Plan Regular y Paquete Flexible computan por slots individuales (`cycleEvaluatedSlots.size` / `cycleAttendedSlots.size`).
2. **Aprovisionamiento Histórico de Bloques Contiguos en PostgreSQL Insforge**:
   - Antes de la implementación de ADR-0157, los alumnos intensivos históricos fueron registrados con solo 1 lección de 45 minutos en `emergency_contact.scheduleLessons`. Al no existir físicamente el segundo bloque de 45 minutos en la base de datos, el panel del horario (`AgendaBoard`) solo renderizaba 1 hora académica en lugar de los 90 minutos reglamentarios.
   - Se aprovisionaron quirúrgicamente los segundos bloques contiguos en PostgreSQL vía PostgREST:
     - **SEBASTIAN** (`8001da91-3737-48da-b30b-843dadf76fc2`): Sábado a las 11:15 en Sala B con Prof. Fernando (Bloque 2 contiguo a su 10:30). Asistencia del 03/10 sincronizada como `presente`.
     - **MARCELO ANDREE** (`846e9c76-349f-44d9-9f24-bf96552d4a25`): Sábado a las 12:45 en Sala A con Prof. Jeremy (Bloque 2 contiguo a su 12:00).
     - **Kayra Valery** (`a118ba83-d07d-4b28-8d84-8792e94292c5`): Sábado a las 09:45 en Sala C con Prof. Nathaly (Bloque 2 contiguo a su 09:00). Asistencia del 03/10 sincronizada como `presente`.
     - **Juan Mateo Azael** (`6dbd7dad-00ba-4bf7-85e0-e3d8a27d15af`): Viernes a las 16:45 en Sala C con Prof. Nathaly (Bloque 2 contiguo a su 16:00), y Bloque 2 para su recuperación del 09/10 a las 16:45.
     - **Joshua Leon Gonzales** (`26080f02-be6b-441c-90fe-65c98f48c121`): Limpieza de clases erróneas de los viernes; preservado en su horario habitual de Sábados a las 12:00.
     - **Antonella Osorio Huaman** (`8c322418-4959-43eb-8fe8-7224451dee7e`): Normalización de nombre completo en tabla `students`, regularización de asistencia `presente` en su bloque 2 del 25/09 y validación matemática de su 4ta clase el 09/10 (16:00 y 16:45) con `isLessonInStudentCycle = true`.

---

### 65. Preservación Incondicional de Clases Contiguas de Corrido (+45m) más allá de planEndDate (Caso Micaela Sofia / ADR-0166)
1. **Diagnóstico del Bug de la 8va Clase Oculta (Caso Micaela Sofia / `492b34f8-b4db-45fe-8f01-36809624c2cb`)**:
   - Micaela Sofia cuenta con 7 clases evaluadas en sala con marca `presente` (1 clase regular el 06/07/2026 y 6 recuperaciones/adelantos puntuales el 13/07, 17/07, 12/08, 17/08, 09/09 16:45 y 16/09 16:45).
   - Para completar su cuota contractual de 8 clases, secretaría utilizó la función `+ De corrido (+45m)` en la sesión de recuperación del Miércoles 09/09/2026, creando una sesión contigua a las 17:30 (`sch-1790814650424-aya`) con `dateStr: "2026-09-09"`.
   - **Bloqueador 1 (`src/lib/kardex-calculator.ts` líneas 337 y 526)**:
     - El cálculo evaluaba `const isBeyondEnd = effectivePlanEndDate && curDateStr > effectivePlanEndDate;`. Al ser `2026-09-09 > 2026-08-05`, `isBeyondEnd` era verdadero.
     - La condición `if (isBeyondEnd && currentStatus === "pendiente" && !lesson.isMakeup)` descartaba la clase porque la clase de corrido se creaba con `isMakeup: false` y la condición no comprobaba `!lesson.dateStr`.
   - **Bloqueador 2 (`src/lib/student-cycle.ts` líneas 188 y 218)**:
     - La verificación `if (!isFlexiblePackage && effectiveEndDate && curDateStr > effectiveEndDate) continue;` ocurría antes de revisar las lecciones del alumno, descartando indiscriminadamente cualquier sesión con fecha posterior al fin teórico del plan, incluso si fue explícitamente agendada por secretaría con `dateStr`.
     - Además, la deduplicación evaluaba `if (evaluatedSlots.has(slot) || (!isIntensive && evaluatedDates.has(curDateStr))) return;`. Como el primer bloque (16:45) de esa misma fecha ya estaba evaluado con `presente`, `evaluatedDates.has("2026-09-09")` era verdadero y descartaba el segundo bloque contiguo a las 17:30.
2. **Solución Arquitectónica (ADR-0166)**:
   - **Exención de `dateStr` en Barrera Temporal (`src/lib/kardex-calculator.ts`)**:
     - Las condiciones de descarte por `isBeyondEnd` en `computeStudentCycleSessions` y `computeStudentMonthSessions` ahora verifican `!lesson.dateStr` (`if (isBeyondEnd && currentStatus === "pendiente" && !lesson.isMakeup && !lesson.dateStr) return;`). Toda lección con fecha explícita programada por secretaría se respeta incondicionalmente, permitiendo que cumpla la cuota contractual.
     - Se aplicó fallback seguro `(allSchedule || [])` para prevenir excepciones al omitir el parámetro opcional.
   - **Soporte de Bloques Contiguos en la Misma Fecha (`src/lib/student-cycle.ts`)**:
     - Las barreras `effectiveEndDate` y `effectiveEndMonth` se movieron a la rama de plantillas recurrentes abiertas (`else`), de modo que las lecciones con `lesson.dateStr` puedan proyectarse en las fechas exactas fijadas por secretaría.
     - La deduplicación por fecha ahora solo descarta lecciones abiertas sin fecha específica: `if (evaluatedSlots.has(slot) || (!lesson.dateStr && !isIntensive && evaluatedDates.has(curDateStr))) return;`. Para lecciones con `dateStr` explícito, solo se descarta si su slot exacto (`dateStr-time`) ya fue evaluado, permitiendo clases contiguas de corrido (ej. 16:45 y 17:30 el mismo día).
   - **Herencia de Estado de Recuperación en Kardex (`src/components/admin/student-attendance-kardex.tsx`)**:
     - En `handleAddConsecutiveClass`, la nueva sesión contigua hereda `isMakeup: Boolean(session.isMakeup)`, de manera que si se añade de corrido a una sesión de recuperación, mantenga su naturaleza coherente.

---

### 66. Blindaje Integral de Plan Intensivo (90m), Motor de Ciclos/Kardex, Renovaciones y Sync de Facturación (ADR-0167)
1. **Reprogramación Atómica de 90 Minutos para Plan Intensivo (`rescheduleLesson` en `app-store.ts`)**:
   - Al reprogramar una clase de un alumno en Plan Intensivo (`isIntensive`), el sistema busca automáticamente la sesión compañera contigua del mismo día habitual.
   - Añade `originalDateStr` a `excludedDates` en **ambos bloques contiguos de 45m** (Sesión 1 y Sesión 2), limpiando marcas residuales de asistencia de esa fecha.
   - Crea de forma atómica **dos bloques contiguos de recuperación de 45 min** (`Block 1` a `time` y `Block 2` a `time + 45 min`, ej. 09:00 a 10:30), asignando `sessionNumber: 1` y `sessionNumber: 2`.
   - Limpia obligatoriamente `effectiveUntil: undefined` en todas las lecciones reprogramadas (`isMakeup: true`), impidiendo que arrastren barreras temporales vencidas de cursos o instrumentos anteriores (caso Sasha Dharma).
2. **Aislamiento Estricto de Ciclo Activo y Protección Contractual (`student-cycle.ts` y `kardex-calculator.ts`)**:
   - `scanStartDate` solo retrocede hasta un máximo de **7 días** exclusivamente para adelantos inmediatos legítimos de curso (ej. Santiago Valladolid). Descarta incondicionalmente lecciones expiradas (`effectiveUntil < startStr`) o recuperaciones de periodos anteriores (`recoveringLessonDate < startStr`), blindando el nuevo ciclo de Juan Diego contra contaminación de asistencias pasadas.
   - Makeups quedan expresamente exentos de la barrera `effectiveUntil` (`if (!lesson.isMakeup && lesson.effectiveUntil ...)`).
   - En `computeStudentCycleSessions`, se introduce `recoveringDates`: las fechas con recuperaciones pendientes agendadas no consumen cupos regulares (`eligiblePendingRegular = pendingRegular.filter(s => !recoveringDates.has(s.dateStr))`), blindando el cronograma del alumno (preserva el sábado 17 de Benjamin).
   - Corrige el falso cierre prematuro de ciclo en Alejandro Huarca, garantizando que sus clases de Lunes y Miércoles a las 17:30 se integren a `validSlots` y sean visibles en `AgendaBoard`.
3. **Sincronización Automática Ficha ➔ Facturación (`updateStudentDetails` en `app-store.ts`)**:
   - Toda mutación de `amountPaid`, `planPrice` o `balance` desde la ficha del alumno actualiza automáticamente los recibos asociados en PostgreSQL (`invoices`) vía `postgrestPatch`, emitiendo `invoice-updated`.
   - `renewStudentCycle` soporta el parámetro `amountPaid` para registrar abonos de renovación en tiempo real.

---

### 67. Asistente IA de Secretaría con Cloudflare Workers AI, Clef y PostgREST Server-Side (ADR-0168)
1. **Arquitectura Desacoplada de Inteligencia Artificial (`functions/api/assistant.ts`)**:
   - **Clef NO es un modelo conversacional**: Clef opera exclusivamente como clasificador de intenciones y moderador/guardrail de seguridad probabilístico.
   - La generación de respuestas en lenguaje natural se delega a **Llama 3.1 8B Instruct** (`@cf/meta/llama-3.1-8b-instruct`) sobre Cloudflare Workers AI.
   - Los datos operacionales se consultan en tiempo real a **Insforge PostgreSQL** vía PostgREST server-side (`functions/_lib/insforge.ts`) usando las variables de entorno `INSFORGE_URL` e `INSFORGE_ANON_KEY` sin prefijo `VITE_`.
2. **Optimización Semántica y Asistencia a Clef (`functions/_lib/clef.ts`)**:
   - Taxonomía explícita de 6 intenciones: `cobranzas`, `horarios_aforos`, `kardex_asistencias`, `prospectos_demos`, `recordatorios` y `ayuda_general`, con soporte para jerga peruana (*"yapeó"*, *"saldo"*, *"aforo"*, *"de corrido"*).
   - Inmunización contra falsos positivos de privacidad: las consultas administrativas de cobranza y apoderados por parte de Secretaría no son bloqueadas como contenido sensible.
   - Extractor de entidades auxiliar para docentes (Jeremy, Fernando, Nathaly), salas (A, B, C, D) e instrumentos.
   - Fallback heurístico resiliente ante caídas o latencias en el binding de Workers AI.
3. **Inyección Incondicional de Reglas Pedagógicas (ADR-0102) y Cuotas**:
   - El prompt del sistema (`functions/_lib/prompts.ts`) blinda las especialidades de docentes (Nathaly en Sala C para Piano Infantil/Canto; Fernando en Sala B para Piano/Violín; Jeremy en Sala A para Guitarra/Batería), el aforo máximo de 5 alumnos por sala y las cuotas de 8 clases (Regular) y 4 clases (Intensivo).
   - Temperatura en 0.2 para impedir alucinaciones de nombres, fechas o montos de deuda.

---

### 68. Renovación de Invitaciones Expiradas en 1 Clic sin Rotar Enlace ni Contraseña (ADR-0169)
1. **Diagnóstico del Caso (Prof. Nathaly, 2026-10-12)**:
   - La profesora fue expulsada de su sesión y su enlace `/invite/inv-teacher-...` mostraba "Enlace expirado (vence a los 30 días)". Causa: `createInvitation` fija `expires_at = ahora + 30 días` (`invitations.service.ts`) y `verifyInvitationToken` calcula la vigencia en vivo desde `expires_at`, sin importar el `status`. Sus clases y asistencias estaban intactas; era solo acceso.
2. **Acción `renewInvitation` (`src/lib/services/invitations.service.ts`)**:
   - Solo `super_admin` / `staff` (`assertRole`). Extiende `expires_at` a +30 días vía `postgrestPatch` sobre el mismo registro: **el mismo enlace y la misma contraseña vuelven a funcionar**, sin reenviar nada por WhatsApp.
   - Lee el registro antes de escribir y **rechaza renovar invitaciones `revocado`** (la revocación es deliberada: en ese caso se genera una nueva). Si el `status` persistido es `expirado`, lo devuelve a `pendiente`; `aceptado` se conserva.
   - Actualiza también el espejo local `cadencia-invitations` y soporta IDs `local-inv-*` solo-locales.
3. **Botón 🔄 Renovar (`src/routes/admin.invitaciones.tsx`)**:
   - Visible únicamente en invitaciones vencidas (`expires_at` pasado y `status !== "revocado"`), con el mismo blindaje de Dueña que Revocar/Reset. Muestra toast con la nueva fecha de vigencia y refresca la lista.
4. **Bug #4 — Cobranzas con @mención respondía Kardex + aforo en vez de pagos (2026-10-12)**:
   - Causa: el intent local (Sistema 1) no tenía opción "cobranzas" (caía en `pago_voucher`), `buildWhatsAppReply` no tenía rama de cobranzas con alumno y el aforo se calculaba aunque la pregunta fuera de pagos. Server-side (`assistant.ts`) sí consultaba invoices, pero `/api` está en 404 en producción.
   - Fix: opción `cobranzas` en el intent local (`laya-schemas.ts`); `buildStudentPaymentReply(student, invoices)` en el matcher (vinculación por concepto como facturación; todo pagado → "Sin deudas. Ciclo pagado y finalizado."); en el componente se conecta `s.invoices`, la respuesta de pagos es prioritaria y se salta el aforo en cobranzas. Verificado en vivo: Karlitoz → 1 recibo pagado, saldo 0.
   - Blindaje extra: `if (academyKnowledge && !isCobranzasQuery)` — la inducción académica ya no sobreescribe `intentVal` en cobranzas (la propuesta async con `getInvoicesByFamily` no aplicaba: este codebase no tiene ese cliente; los invoices ya vienen del store).
   - Cierre Bug #4 (2026-10-12): la @mención ESCRITA no fijaba alumno (`manualStudent` solo se seteaba clicando tarjetas) → caía al fallback genérico. Ahora se parsea `@Nombre` al inicio del análisis con 100% (ADR-0142), con red de seguridad que fuerza intent `cobranzas` ante palabras de pago con alumno fijado, y mensaje honesto si la mención no coincide. Verificado en vivo: "@Karlitoz" → 1 hit → cobranzas → SIN_DEUDAS.
5. **Cierre del ticket Nathaly**:
   - Pulsar Renovar en su fila en `/admin/invitaciones`, confirmar toast "Acceso renovado", verificar que su invitación valida el enlace y que entra a `/teacher` con píldora `🟢 En vivo`.

---

### 69. Corrección de 3 Bugs del Copiloto Laya: Cobranzas Genéricas, Conteo de Kardex y Hora 17:00 (ADR-0170)
1. **Bug #1 — "PAGOS PENDIENTES" mostraba el kardex de un solo alumno**:
   - Causa: la guardia anti-entidad solo existía server-side (`clef.ts`); si Workers AI igual devolvía `entities.studentName`, el cliente (`laya-copilot-flow.tsx`) fijaba el alumno por subcadena con confianza 0.98 sin umbral, y no existía rama de lista de deudores.
   - Fix: `isGenericBillingText` + `buildDebtorsListReply` en `laya-copilot-flow.tsx`. La guardia es independiente del intent (la taxonomía local Sistema 1 no tiene opción "cobranzas", así que cubre también el modo offline con `/api` caído). La fijación explícita (`@mención`/selección manual) siempre tiene prioridad. Frases precisas en plural para no secuestrar "cuánto debe Karlitoz".
   - Hallazgo de deploy (2026-10-12): `POST /api/assistant` responde 404 incluso en el preview del deploy `c741ae1` → las Functions no están activas en este proyecto Pages; Laya opera en fallback local. Revisar build log (sección Functions) y secrets `INSFORGE_URL`/`INSFORGE_ANON_KEY` en el dashboard.
2. **Bug #2 — Alumno con ciclo completo figuraba "En Curso" (caso Karlitoz)**:
   - La hipótesis de fechas faltantes era incorrecta: `planStartDate`/`planEndDate` SÍ llegan (Karlitoz 2026-09-07 → 2026-10-06, verificado en vivo). Causa real: `computeStudentKardexSummary` (`laya-realtime-matcher.ts`) deduplicaba con `dateStr-status`, colapsando lecciones distintas del mismo día. Recomputo con datos vivos: antes 5/2/7 → En Curso; después 11/2/13 → Ciclo Cumplido.
   - Fix: clave de deduplicación `${lessonId}-${dateStr}`. Cada lección evaluada cuenta como sesión independiente.
   - Refinamiento (2026-10-12): el conteo crudo daba "11 asistidas" por marcas residuales sangradas entre plantillas (misma fecha presente en 2-4 lecciones) y 2 faltas viejas en días no correspondientes. Se agregó filtro de elegibilidad por (lección, fecha): recurrente exige día de semana = `lesson.day` + vigencia + no excluida; puntual exige `dateStr` exacto + piso `planStart`, exenta del tope de fin (ADR-0161/0165/0166). Recomputo en vivo: **8/0/8 = Kardex oficial**. Además, `buildWhatsAppReply` responde "ciclo culminado 🎓, listo para renovar" cuando `cycleCompleted`, sin invitar a más recuperaciones.
   - Motor único (2026-10-12): `computeStudentKardexSummary` ya no cuenta a mano; delega a `computeStudentCycleSessions` + `computeStudentCycleLiquidation` (`kardex-calculator.ts`, sin ciclos de importación) y mapea los mismos campos, con el conteo con elegibilidad como respaldo en `catch`. La rama `consulta_clases_pendientes` de `buildWhatsAppReply` usa las 6 cifras canónicas del Kardex (Contratadas, Asistidas, Faltas, Tardanzas, Justificadas, Pendientes) + próxima acción. Coherencia por construcción para todos los alumnos, no por caso.
   - Cierre créditos + reprogramaciones (2026-10-13): el guardrail bloqueaba `"credito"` solo y cualquier pregunta de créditos de recuperación caía en `seguridad_restringida`; ahora exige la frase `"tarjeta de credito"` (tarjeta/token siguen bloqueados, verificado). El resumen incluye `makeups[]` (fecha/hora/estado desde el motor oficial) y la rama `reprogramacion` sin día/hora responde el estado ("2 recuperaciones asistidas" en Benjamin) en vez de silencio. Verificado en vivo en ambos puntos.
3. **Bug #3 — "5pm" resolvía a "16:00"**:
   - Causa: el schema `horario` (`laya-schemas.ts`) no tenía opción "17:00" (saltaba de 16:45 a 17:30), así que el encoder caía al vecino.
   - Fix: agregada `"17:00": "5:00 pm, 5 de la tarde, 17:00"` solo como reconocimiento NLU; 17:00 no es turno oficial de inicio (ADR-0130), así que el análisis de aforo responde con alternativas reales sin inventar horarios.

---

### 70. Ramas Server del Asistente (Fase 1): Niveles, Filtros, Vencimientos y Kardex Verificables (ADR-0171)
1. **Premisa de datos verificada en vivo (2026-10-12)**: `invoices` (72) y `attendance_logs` (272) vivas; `lessons` y `demo_requests` existen pero VACÍAS (0 filas) — el horario real vive en `scheduleLessons` y las demos no escriben ahí; `reminders` no existe. Por eso la Fase 1 solo implementa ramas sobre tablas vivas; horarios/demos/recordatorios server quedan bloqueados hasta que haya datos o nueva especificación.
2. **Cambios (`functions/` únicamente, cero cambios al cliente)**:
   - `clef.ts`: intents `niveles_rechazo` y `alumnos_por_filtro` (taxonomía, heurística con prioridad 0 para niveles con `\b` para no confundir "nivelación", entidades `statusFilter`/`modality`, labels del modelo).
   - `insforge.ts`: `getDebtorsList`, `getUpcomingDueDates`, `getMonthCollection`, `getStudentsByFilter` (teacher→UUID oficial, flexible filtrado en código, Claudia por `ec.teacher`), `getKardexSummary` (unión logs + marcas de lecciones con elegibilidad del motor único) y helpers de fecha Lima `limaToday`/`limaWeekBounds`.
   - `prompts.ts`: regla de rechazo de niveles con texto exacto.
   - `assistant.ts`: retorno determinista para niveles (costo $0, sin IA), sub-ramas cobranzas (semana/mes), kardex con registro ACTIVO primero (ADR-0107), filtros con base activa por defecto, y formateadores deterministas en español cuando no hay binding AI.
3. **Correcciones halladas por el harness (bundle esbuild + PostgREST vivo)**: faltaba keyword `recaud` en la heurística; `searchStudent` devolvía el registro en `baja` primero (Karlitoz daba 3/2 en vez de 8/0) → prioridad activo; filtros sin estado ahora usan base activa por defecto.
4. **Verificación end-to-end (5/5)**: niveles→rechazo exacto; saldos parciales→4 recibos; vencimientos semana→1 (S/ 249); recaudación octubre→S/ 4659.50; Karlitoz→8/0/8 culminado idéntico al Kardex; guitarra→14 activos.

---

### 71. Modo Padre: Alcance por Familia e Identidad por Invitación, Fase 1 sin UI (ADR-0172)
1. **Riesgo rector**: Laya admin lista deudores/alumnos globales; en modo padre eso filtraría datos entre familias. La Fase 1 blinda el alcance antes que cualquier UI.
2. **Identidad sin onboarding**: la invitación ya trae la identidad (`target_family_id`/`target_email`); no se pregunta el nombre salvo fallback. Orden: `family_id` exacto → email de apoderado → nombre manual → no resuelto (mensaje de vinculación).
3. **Implementación (`src/lib/laya/laya-family-scope.ts`, nuevo, lógica pura)**:
   - `resolveFamilyScope`, `studentsInScope`, `invoicesInScope` (concepto enlazado o familia idéntica; resto excluido), `resolveChildReference` (@mención/nombre/pronombres solo dentro de sus hijos; fuera del alcance responde `notFound` sin filtrar existencia), `unresolvedScopeReply`/`childNotFoundReply`.
   - Expansión a hermanos: igual `familyId` o igual nombre de familia (los hermanos suelen traer emails distintos).
   - Soporte mínimo: `familyId?: string` en `AdminStudent` + passthrough en `mapDBStudentToAdminStudent`.
4. **Verificación con datos vivos (8/8)**: email→1 hijo; pronombre con 2 hermanos→pide elección; manual→Karlitoz; desconocido→no resuelto + 0 recibos; negativo (facturas ajenas excluidas, alumno ajeno→notFound); familyId exacto; scope 1/49; reply sin filtración.
5. **Fase 2 base — sesión y cápsula (2026-10-13, sin UI admin alterada)**:
   - Sesión: `currentUser.familyId?` + `login(..., { familyId })` (4° parámetro opcional, llamadores existentes intactos); `verify` devuelve `target_family_id` en sus 6 rutas; `invite.$token` lo pasa al login. Persistencia automática (currentUser ya se persistía).
   - `LayaCopilotFlow` acepta `familyScope?`: en modo padre filtra alumnos/recibos al alcance, oculta snapshot Meta/CSV/Kardex de secretaría, WhatsApp apunta a Secretaría (51970608367), sin alcance responde vinculación; título y placeholder parentales; drawer ya era `w-full sm:w-[460px]`.
   - `FamilyLayout` monta la cápsula + botón flotante 56px + atajo Ctrl+Shift+L, con scope desde la sesión. Solo lectura en v1 (Laya no muta; Kardex de edición oculto).
   - Piloto: autoregistro como alumno con email de apoderado real, probar las 3 preguntas + negativa (no ver datos ajenos).
6. **Portal familia operativo (2026-10-13)**:
   - Causa madre del piloto fallido: rol `family` excluido del sync → ahora sincroniza alumnos+recibos (sin logs); gates RBAC abiertos solo-lectura en `getStudents`/`getInvoicesWithAudit`; escrituras siguen restringidas (ver candados `lockEditing`).
   - `setKids` + hijos derivados del alcance; `AccountCard` real (`familyAccountSummary`); `family.agenda` filtra `schedule` por hijo; invitación resuelve `familyId` en vivo (read-before-write). Caso Camila verificado: su enlace (family_id nulo) ahora resuelve por email a CAMILA VALENTINA activa.
   - Pestañas: Inicio/Horario/Asistencias(Kardex `lockEditing` que oculta Editar, Reprogramar, De corrido, Agregar, Transición, Auditoría, Renovar, Vigencia)/Avisar (wa.me pre-llenado, botones 56px). Auditoría en caliente pospuesta (permite edición; requiere modo lectura propio).
   - Piloto: reingresar en incógnito tras el deploy (la sesión vieja no trae familyId; el email igual resuelve).
   - Fix de build (2026-10-13): mi candado en la rama Reprogramar dejó un `{...}` dentro de paréntesis (sintaxis JSX inválida) y tumbó el deploy de Pages (`6bd77d5` → "No deployment available"). Corregido con fragmento `<>...</>` y verificado con `npm run build` local antes de pushear (`47ecbda`). Lección: correr el build local siempre que se toque JSX con ternarios.
7. **Enlace padre por alumno + mensaje no-padre (2026-10-13)**:
   - `ensureParentInviteForStudent` (`invitations.service.ts`): reutiliza invitación family vigente del correo (renovándola si venció) o crea una con `familyId` real + email de apoderado; sin email en ficha, error explícito. Hallazgo: el formulario general pasaba id de alumno en `target_family_id`; aquí se usa el `familyId` real.
   - Botón 🔗 por fila en `/admin/alumnos` + modal con enlace, contraseña inicial (solo al crear) y copiar WhatsApp. Verificado: hoy hay 0 invitaciones family en BD (el botón llena ese vacío).
   - `nonParentScopeReply()` (WhatsApp escuela 51970608367): staff/docente/dirección sin vínculo familiar lo reciben en vez del pedido de nombres; rol family conserva el mensaje de vinculación.

---

### 72. Cálculo Quirúrgico de Aforo y Vacantes en Plantillas Semanales Recurrentes y Desacoplamiento por ID (ADR-0165)
1. **Aislamiento de Lecciones Puntuales (`dateStr` / `isMakeup`)**:
   - Las sesiones reprogramadas o de recuperación puntual (`isMakeup === true` o que poseen `dateStr: YYYY-MM-DD`) pertenecen **exclusivamente a su fecha exacta**.
   - Queda **TERMINANTEMENTE PROHIBIDO** que una clase puntual del pasado o futuro bloquee o infle el aforo de la plantilla semanal recurrente oficial en `ScheduleStudentForm`, `VacancyAvailabilityPanel`, `AvailabilitySnapshot` o `LayaRealtimeMatcher`.
2. **Deduplicación Estricta por Alumno Activo Único**:
   - El cálculo de alumnos inscritos (`enrolled`) en un turno docente se basa estrictamente en la cantidad de **alumnos activos únicos** (`new Set(...)`), impidiendo que un alumno con múltiples registros o lecciones en el mismo slot ocupe más de una vacante.
3. **Resolución Unívoca por ID en `setStudentSchedule`**:
   - Para soportar alumnos matriculados en dos instrumentos simultáneos con ligeras variaciones de nombre (ej. `Mario Keffreen` para Guitarra y `Mario Kefren` para Batería), `setStudentSchedule` en `app-store.ts` resuelve prioritariamente por `isSameStudentId(st.id, studentIdentifier)`.
   - Esto garantiza que al agendar un curso no se altere ni colisione con el otro instrumento del alumno.

---

### 73. Aprovisionamiento del Segundo Bloque Contiguo en Plan Intensivo y Blindaje Defensivo en `setStudentSchedule` (ADR-0173)
1. **Diagnóstico (caso Facundo Joaquin, 2026-10-17)**:
   - Facundo (Intensivo: 4 clases × 90 min) tenía en `emergency_contact.scheduleLessons` **solo el bloque 1 recurrente** (Sáb 09:00, `sessionNumber: 1`, `effectiveFrom 2026-10-03`) y **ningún bloque 2 recurrente**. Los dos bloques de 09:45 existentes eran **recuperaciones puntuales** (`isMakeup: true`, `dateStr` 10-10 y 10-17), no plantillas recurrentes.
   - Consecuencia: en la Semana 4 (Sábado 24/10) el alumno aparecía a las 09:00 pero **no** a las 09:45, incumpliendo las 2 horas pedagógicas del Plan Intensivo.
   - Auditoría de los 18 intensivos activos: el mismo faltante se detectó en **Matias Gabriel** (Sáb 12:00 sin 12:45, ciclo vigente) y, ya con ciclo vencido, en **URIEL** y **JUNIOR GABRIEL**. Los "duplicados" de Juan Diego y Kamila **no son duplicados**: son lección vieja (`effectiveUntil`) + lección nueva coexistiendo por ADR-0131.
2. **Corrección de datos en Insforge PostgreSQL**:
   - Se aprovisionó el bloque 2 recurrente espejando exactamente el bloque 1 (`day`, `room`, `teacher`, `instrument`, `category`, `year`, `effectiveFrom`, `excludedDates`), con `time` = franja consecutiva canónica, `sessionNumber: 2` y `attendanceByDate`/`attendanceByWeek` vacíos:
     - **Facundo Joaquin** (`837823f4-693e-469a-8bc9-fe74628ac73f`): `Sáb 09:45 · sn:2 · Sala A · Jeremy · Batería · JUVENIL · effectiveFrom 2026-10-03 · excludedDates [2026-10-10, 2026-10-31]`.
     - **Matias Gabriel** (`af9e9ac4-910f-4c66-901b-7c65ab7f5f80`): `Sáb 12:45 · sn:2 · Sala C · Nathaly · Canto · JUVENIL · effectiveFrom 2026-09-05 · excludedDates [2026-09-26]`.
   - Los parches puntuales de 09:45 (10-10 y 10-17) se conservaron: la deduplicación intra-celda (`dedupeLessonsForCell`, ADR-0156) prioriza la sesión puntual evaluada, sin triplicar.
   - Aforo verificado: Sáb 09:45 Sala A pasó de 1 a 2/5 (mismo instrumento Batería, mismo docente); sin cruce de sala.
3. **Blindaje de código (`setStudentSchedule`, `src/store/app-store.ts`)**:
   - Se añadió `normalizeIntensiveSecondBlock`: si el alumno destino tiene modalidad Intensiva (`inten` / `90 min` / `4 clases` sin `45 min`) y las lecciones entrantes **no** traen un bloque recurrente con `sessionNumber: 2`, se auto-completa con la franja consecutiva canónica de `timeSlotsWeekday`/`timeSlotsSaturday` (ADR-0130/ADR-0157), espejando el bloque 1.
   - Esto cubre el único escritor del horario completo, impidiendo que cualquier camino de guardado vuelva a dejar un intensivo con una sola hora pedagógica. El bloque autocompletado se persiste vía `backgroundSyncStudentToDB` junto con el resto.
4. **Verificación en runtime con datos vivos (`scratch/test-facundo-intensive.ts`)**:
   - Usando el motor oficial (`computeStudentMonthSessions` de `kardex-calculator.ts`) y el filtro de AgendaBoard (`isLessonInStudentCycle` de `student-cycle.ts`):
     - **Facundo**: Sábado 24/10 → 2 bloques (09:00 + 09:45) ✅; 31/10 → 0 (excluido) ✅. Kardex consolidado `09:00–10:30` (90 min).
     - **Matias**: Sábado 24/10 → 2 bloques (12:00 + 12:45) ✅; 31/10 → 2 (su 4ª clase, ciclo 10/10→09/11) ✅.
   - `npm run build` local en verde antes de commitear. No se tocó Kardex, Facturación, motor de asistencias ni lógica de ciclos.

---

### 74. Accesos de Personal (Profesor / Secretaría) sin Caducidad de 30 Días y Vigencia Real en Panel de Invitaciones (ADR-0174)
1. **Diagnóstico (Caso Prof. Fernando, 2026-10-19)**:
   - El profesor no podía entrar a su kiosco de asistencia: su enlace `https://musicstaff-vm.pages.dev/invite/inv-teacher-Fernando-Violin_Piano-vibra2026` mostraba **"Enlace expirado (vence a los 30 días)"** y bloqueaba el ingreso antes de pedir contraseña.
   - Evidencia en vivo (PostgreSQL Insforge, tabla `invitations`): la fila de Fernando (`0e9ad54a-ef5d-49fb-9ae0-4dcdc884d111`) tenía `expires_at = 2026-10-09` (vencida hacía 10 días) con `status = "aceptado"`. **Jeremy** (`2403a9f5-b8b7-4847-94fe-8f05a48bd061`) estaba igual de vencido (2026-10-09). El de **Nathaly** funcionaba porque su fila ya había sido renovada en el incidente anterior (ADR-0169, vence 2026-11-11).
   - Causa raíz: `verifyInvitationToken` (`src/lib/services/invitations.service.ts`) evaluaba la vigencia por `expires_at` **sin distinguir el rol**, así que la ventana de 30 días —que solo tiene sentido para el onboarding de un apoderado— tumbaba también los accesos de personal docente. El fallback de semillas `TEACHER_SEEDS` ya devolvía `is_valid: true` (diseño original: el enlace docente es permanente), pero la rama de PostgreSQL lo cortocircuitaba.
   - Agravante: el vencimiento **reincide cada 30 días** (ya ocurrió con Nathaly el 2026-10-12); depender del botón manual "Renovar" no escala para 3+ docentes.
2. **Correctivo A — Acceso de personal permanente (`verifyInvitationToken`)**:
   - La caducidad por `expires_at` ahora aplica **solo a invitaciones de `family`**. Los accesos de `teacher` y `staff` (secretaría/dirección) son permanentes: `blocksByExpiry = isExpired && !isStaffOrTeacherInvite`.
   - La **revocación deliberada** (`status = "revocado"`) sigue invalidando a **todos** por igual (`TOKEN_REVOKED`). El mecanismo de baja de un docente sigue siendo Revocar (genera enlace nuevo), nunca el paso del tiempo.
   - `error_code` solo reporta `TOKEN_EXPIRED` para invitaciones de familia vencidas.
3. **Correctivo B — Vigencia real en el Panel de Invitaciones (`getInvitations`)**:
   - La fusión con PostgreSQL sobrescribía `id`, `token` y `status` desde la fila remota pero **NO** `expires_at`, por lo que `/admin/invitaciones` mostraba siempre la fecha de la semilla local (2026-09-12, ya pasada) y el estado del botón 🔄 Renovar era engañoso (parecía vencida aun después de renovar).
   - Ahora se fusiona `expires_at: remote.expires_at || item.expires_at`, de modo que el panel refleja la vigencia real de la base de datos.
4. **Saneamiento de datos (sin borrados)**:
   - Se extendió `expires_at` a +30 días de las filas **Fernando** y **Jeremy** vía PostgREST (mismo efecto que el botón 🔄 Renovar de ADR-0169): ambos quedan en `2026-11-18`. Con el correctivo A, su enlace funciona igualmente aunque la fecha vuelva a pasar.
5. **Verificación en runtime con la función real y datos vivos (`scratch/test-invite-teacher-expiry.ts`)**:
   - `verifyInvitationToken("inv-teacher-Fernando-Violin_Piano-vibra2026")` → `is_valid=true, role=teacher, error=none` ✅.
   - `verifyInvitationToken("inv-teacher-Jeremy-Guitarra_Bateria-vibra2026")` → `is_valid=true` ✅. `verifyInvitationToken("nayeli-secretaria-vibra")` → `is_valid=true, role=staff` ✅.
   - Control negativo sin tocar la base viva (`scratch/test-invite-negative.ts`, interceptando `fetch`): **familia vencida → bloqueada (`TOKEN_EXPIRED`)**; **docente vencido → permitido**; **docente revocado → bloqueado (`TOKEN_REVOKED`)**. 3/3 ✅.
   - `npm run build` local en verde antes de commitear. No se tocó el kiosco, el motor de asistencias, el Kardex ni facturación.
6. **Protocolo de cierre**: que el Prof. Fernando abra su enlace en el celular y confirme que entra al Kiosco (`/teacher`) con la píldora `🟢 En vivo` y sus clases visibles; repetir con Jeremy cuando entre.

---

### 75. Sistema de Evaluaciones, Informes de Progreso y Notas — Fases 1, 2 y 3 (ADR-0175)

1. **Estado y alcance**:
   - La **Fase 1 de 7** está implementada y desplegada en el commit `b7a0795`. Incluye migraciones aditivas, tipos, snapshot pedagógico y servicios; **no incluye interfaz visible**.
   - La **Fase 2 de 7** está implementada y en piloto: registro de clase del docente en `/teacher`, visible solo para **Jeremy**, **Nathaly** y **Fernando** mediante `org_settings.pilot_teacher_ids`.
   - La **Fase 3 de 7** está implementada y en piloto: nota del docente a la familia (`/teacher` → “Nota nueva”) y bandeja de moderación de Dirección (`/admin/alumnos` → “Notas v2”). Nada llega a la familia sin aprobación explícita.
   - Los flags `evaluationsV2`, `familyNotesV2`, `progressReportsV2` y `parentReports` siguen en `false`. El kiosco, la agenda, el Kardex, la asistencia y la facturación siguen intactos.
   - **Jeremy** está en el piloto desde el 2026-10-22 y ve la pestaña con sus criterios en **v0 borrador**.
2. **Base de datos creada (migraciones `008` y `008b`)**:
   - Tablas: `evaluation_catalog`, `evaluation_fields`, `lesson_evaluations`, `progress_reports`, `family_notes`, `internal_notes`, `evaluation_audit_log`; vista `v_test_records`.
   - `lesson_evaluations.session_key` es determinista: `<student_id>::<YYYY-MM-DD>::<HH:MM>` y `::INT` para 90 min. Guardar dos veces la misma clase actualiza el mismo registro.
   - `class_mode` admite `individual`, `grupal`, `no_aplica`. Canto admite 1 a 5 alumnos, individual o grupal, **nunca coro**.
   - `progress_reports` sigue `draft → pending → published | rejected`; al publicar se congela `published_snapshot` y el informe queda inmutable.
   - `family_notes` distingue `student | teacher_cohort | academy`; al publicar una cohorte se congelan `cohort_student_ids` y `cohort_snapshot_at`.
   - `internal_notes` usa `nueva | leida | archivada` con `read_at`, `read_by_id` y `read_by_name`.
   - `evaluation_audit_log` es **append-only** (`SELECT, INSERT`); `org_settings` no permite `DELETE`.
3. **Reglas innegociables**:
   - **No tocar `students.notes`**: queda congelado como legacy. **No tocar `notification_logs`**.
   - **No modificar `app-store.ts`, `kardex-calculator.ts` ni `student-cycle.ts`** para esta funcionalidad: el snapshot y los servicios consumen el motor oficial, no lo duplican.
   - **Cero datos financieros** en el snapshot, en el informe pedagógico o en el registro de clase.
   - **Moderación obligatoria** antes de publicar cualquier nota a familia.
   - **Identidad por UUID** (`student_id` / `family_id`), nunca por nombre.
   - **Datos de prueba aislados**: `is_test = true` exige `test_run_id`; el portal familia filtra `is_test = false`; solo las variantes `*ForAudit` (Dirección) pueden leer pruebas.
   - **No usar `localStorage`** como fuente de verdad transaccional.
4. **Servicios disponibles**: `evaluations.service.ts`, `progress-reports.service.ts`, `family-notes.service.ts`, `internal-notes.service.ts`, `feature-flags.service.ts` y `teacher-resolver.ts` (re-exportado desde `time-tracking.service.ts`).
5. **Fase 2 — Registro de clase (`src/components/teacher/class-log.tsx`)**:
   - En `/teacher` se conserva la pestaña **“Notas a familia”** (`LessonNotes`) y se agrega **“Registro de clase (BETA)”**. Cada tarjeta de alumno tiene el botón **“Registrar clase / evaluación”**, que precarga alumno, fecha, hora, duración e instrumento.
   - Ambas pestañas usan `forceMount` para conservar el formulario si el docente cambia de pestaña por error.
   - El formulario registra estado general, criterios dinámicos, repertorio, tema, tarea y comentario. Nathaly usa semáforo de 4 (`traffic_light`); Fernando usa escala 1–10 (`score_1_10`). Canto permite `individual` o `grupal`, nunca coro.
   - Guardado idempotente con `saveLessonEvaluation` y `session_key`; `isTest: false`. La “última evaluación” visible excluye filas `is_test`.
   - Criterios sembrados en `evaluation_fields`: **49 filas** (Nathaly Canto 12, Nathaly Piano Infantil 12, Fernando Piano 12, Fernando Violín 13). Migración idempotente `docs/migrations/009_seed_evaluation_fields.sql`; rollback por `created_by_name = 'Migración 009'`.
   - No se tocó `lesson-notes.tsx`, `teacher-notes-moderation.tsx`, agenda, Kardex, asistencia ni facturación.
6. **Fases pendientes**: Fase 4 nota interna y bandeja; Fase 5 informe A4/PDF/Markdown/WhatsApp y portal familia; Fase 6 reportes y CSV; Fase 7 despliegue gradual y retiro del flujo legacy.
7. **Referencia obligatoria**: `docs/adr/0175-fase-1-evaluaciones-informes-progreso-notas-sin-ui.md`, `docs/logs/2026-10-21-fase-1-evaluaciones-informes-notas.log`, `docs/logs/2026-10-22-fase-2-registro-clase.log` y `docs/logs/2026-10-22-fase-3-notas-familia-moderacion.log`.
8. **Criterios v0 BORRADOR de Jeremy (Guitarra y Batería) — 17 filas nuevas, sin validar**:
   - Cargados como **datos de configuración editables** en `evaluation_fields` (no en código). Migración idempotente `docs/migrations/010_seed_evaluation_fields_jeremy_borrador.sql`; rollback por `created_by_name = 'Criterios v0 borrador (010)'`.
   - Guitarra **8** (Postura y sujeción, Mano izquierda, Mano derecha, Acordes y cambios, Ritmo y pulso, Lectura, Afinación y oído, Práctica y actitud). Batería **9** (Postura y agarre, Coordinación, Técnica de baquetas, Pulso y tempo, Grooves y patrones, Fills y transiciones, Lectura rítmica, Dinámica y musicalidad, Práctica y actitud).
   - **Estados obligatorios**: `ui_config.draft = true`, `status = "borrador"`, `version = 0`, `needs_validation = true` y `visible_in_report = FALSE`. Los campos de aprobación (`approved_by_id`, `approved_by_name`, `approved_at`, `approved_role`) quedan **vacíos** hasta que Jeremy los valide. Cada criterio tiene su comentario libre en `ui_config.validation.comment`.
   - **Prohibido** incluir un criterio con `draft = true` en informes de progreso, portal familia o cualquier salida de las Fases 3–5. La Fase 5 debe exigir explícitamente `draft = false` antes de publicar.
   - Escala: `traffic_light` de 4 niveles — **Inicia, En proceso, Logrado, Destacado** (la escala móvil de la Fase 2).
   - `getCriteria` agrupa variantes del mismo instrumento (`Guitarra`, `Guitarra clásica`, `Guitarra eléctrica` → `guitarra`; `Batería` → `bateria`) para que los alumnos con "Guitarra clásica" reciban sus criterios. Piano y Piano Infantil **no** se agrupan. El filtro por `owner_teacher_id` sigue siendo estricto: los criterios de Jeremy no aparecen para docentes ni alumnos de otros docentes.
   - Jeremy **sí** está en `pilot_teacher_ids` desde el 2026-10-22: ve la pestaña con sus 17 criterios en borrador para poder validarlos. Revertir = quitar `00000000-0000-0000-0000-000000000003` del arreglo en `org_settings.pilot_teacher_ids` (efecto en ≤ 30 s, sin desplegar).
   - Al validar Jeremy: `ui_config.draft = false`, `ui_config.status = 'validado'`, `ui_config.validation.approved_by_id/approved_by_name/approved_at`, y recién entonces `visible_in_report = true`. **Prohibido** ponerlos visibles antes de esa validación.
9. **Fase 3 — Nota a familia y moderación**:
   - **Componentes**: `src/components/teacher/family-note-form.tsx` (docente) y `src/components/admin/family-notes-moderation.tsx` (Dirección). Montados como pestañas en `/teacher` (“Nota nueva”, BETA) y `/admin/alumnos` (“Notas v2”, BETA).
   - **Habilitación sin desplegar** (`getFamilyNotesAccess` en `feature-flags.service.ts`): con `familyNotesV2 = true` se abre para todos; sin flag, el formulario se abre solo a docentes de `pilot_teacher_ids` y la bandeja de Dirección si hay al menos un docente en el piloto. Cualquier error → todo cerrado.
   - **Flujo**: `submitFamilyNote` siempre crea en `pendiente`; `approveFamilyNote` pasa a `publicado` (registra `published_at` y `reviewed_by_*`, y para `teacher_cohort` congela `cohort_student_ids` + `cohort_snapshot_at`); `rejectFamilyNote` exige motivo, deja `rechazado` y **conserva el contenido**.
   - **Auditoría**: el trigger `trg_audit_family_notes` registra INSERT/UPDATE/DELETE en `evaluation_audit_log` con `entity_type = 'family_note'`. La UI no duplica auditoría y `evaluation_audit_log` sigue append-only.
   - **Reglas**: no toca `students.notes` ni `notification_logs`; cero datos financieros; el portal familia sigue leyendo solo `publicado` y `is_test = false`; identidad por UUID.
   - **Legacy intacto**: `teacher-notes-moderation.tsx` y `LessonNotes` siguen operativos en la pestaña “Notas a Familias”. No retirarlos hasta cerrar la Fase 7.
   - **Cómo probar**: docente del piloto → `/teacher` → “Nota nueva” → enviar; Dirección → `/admin/alumnos` → “Notas v2” → aprobar o rechazar con motivo; el docente ve el estado y, si fue rechazada, el motivo con “Usar como base para corregir”.
   - **Verificación**: 24/24 checks de runtime con datos vivos (`is_test` + `test_run_id`, limpieza final) y 7/7 del gate; rutas `/teacher`, `/admin/alumnos` y `/` en 200; `npm run build` en verde.
   - **Revertir**: dejar `pilot_teacher_ids = []` y `familyNotesV2 = false`; las pestañas desaparecen sin desplegar. Las notas ya guardadas permanecen en `family_notes`.

---

### 76. Notas Internas Docente → Dirección con Bandeja y Flujo `nueva → leida → archivada` (ADR-0175, Fase 4)

1. **Alcance y visibilidad**:
   - `internal_notes` es un canal **interno**: lo escribe el docente y lo lee Dirección/Secretaría. **Nunca** se expone en el portal familia ni modifica `students.notes`.
   - Componentes: `src/components/teacher/internal-note-form.tsx` (pestaña “Interna”, BETA, en `/teacher`) y `src/components/admin/internal-notes-inbox.tsx` (pestaña “Notas internas”, BETA, en `/admin/alumnos`).
2. **Flujo de estado innegociable**:
   - `nueva` al crear → `leida` con `markInternalNoteRead` (registra `read_at`, `read_by_id`, `read_by_name`; idempotente) → `archivada` con `archiveInternalNote`.
   - `reopenInternalNote` reabre una archivada en `leida`. **Nada se borra**: la nota conserva contenido e historial de lectura.
3. **Habilitación por datos (`getInternalNotesAccess`)**:
   - `org_settings.internal_notes_enabled = true` abre para todos; sin esa clave se rige por `pilot_teacher_ids` (la bandeja se muestra a Dirección si hay al menos un docente en el piloto). Cualquier error ⇒ cerrado.
   - Abrir o cerrar el módulo **no requiere desplegar**.
4. **Reglas de datos**:
   - Identidad por UUID (`student_id`, `teacher_id`, `created_by_id`, `read_by_id`); el nombre es solo snapshot legible.
   - `is_test` + `test_run_id` siguen amarrados por CHECK; la bandeja de producción lista **sin** `includeTest`, así que jamás muestra filas de prueba.
   - Cero datos financieros y cero escritura sobre `students.notes` o `notification_logs`.
5. **Auditoría y señalización**:
   - `trg_audit_internal_notes` registra INSERT/UPDATE/DELETE en `evaluation_audit_log` con `entity_type = 'internal_note'`; la UI no duplica auditoría.
   - `notifyInternalNotesChanged` / `subscribeToInternalNotesChanges` solo señalizan “algo cambió” entre pestañas; la fuente de verdad sigue siendo PostgreSQL.
6. **Prohibiciones**:
   - No modificar `app-store.ts`, `kardex-calculator.ts` ni `student-cycle.ts` para este módulo.
   - No agregar botones de “eliminar nota”: el ciclo termina en `archivada`.
7. **Verificación de referencia**: `scratch/test-fase4-internal-notes.mjs` (20/20 con datos vivos) y `npm run build` en verde antes de commitear.

---

### 77. Informe de Progreso A4, Publicación con Snapshot Congelado y Portal Familia en Solo Lectura (ADR-0175, Fase 5)

1. **Bandeja de Dirección y generación**:
   - `src/components/admin/progress-reports-panel.tsx` se monta en `/admin/alumnos` como pestaña **“Informes” (BETA)**. Solo lista **alumnos activos**.
   - `createProgressReport` arma el snapshot pedagógico con el motor oficial (`buildAttendanceSnapshot` → `computeStudentCycleSessions`) y las evaluaciones del periodo. **Nunca** recalcula ciclos por su cuenta ni toca `kardex-calculator.ts`.
   - Si ya existe un informe del mismo alumno + tipo + rango de fechas, la bandeja abre el existente en lugar de duplicarlo.
2. **Flujo de estados innegociable**:
   - `draft` → `pending` → `published` (con `published_snapshot` congelado) o `rejected` (con motivo obligatorio; el contenido se conserva).
   - `updateProgressReport` prohíbe editar un `published`. Cualquier corrección posterior exige retirar el informe (campos `retracted_*` ya existentes).
   - Nada llega a la familia antes de `published`.
3. **Criterios en borrador bloquean la publicación**:
   - `getDraftCriteriaInReport(report)` consulta `evaluation_fields.ui_config.draft` para los `field_id` del snapshot.
   - Si hay al menos un criterio en borrador, la UI **bloquea** “Enviar a revisión” y “Publicar” listando los criterios.
   - Los 17 criterios v0 de Jeremy siguen en `draft = true`: no pueden salir en un informe publicado hasta que él los valide (ADR-0175, Fase 2).
4. **Formato y salidas en un solo lugar**:
   - `src/lib/informes/progress-report-format.ts` concentra vista, Markdown, WhatsApp y `PROGRESS_REPORT_PRINT_CSS`. Prohibido reimplementar el formato en otro componente (ADR-0119.3).
   - El A4 de 2 páginas reutiliza la arquitectura de impresión de ADR-0136/0137: se desmonta el portal Radix, se neutraliza `transform`, se fuerza `table-layout: fixed` y el salto de página `.print-page-break`.
   - Cero datos financieros en el informe, el Markdown, el WhatsApp y el portal familia.
5. **Portal familia (`/family/progreso`)**:
   - Solo lee `published` + `is_test = false` + `published_snapshot` fusionado (`getPublishedReportsForStudent`).
   - Resuelve el alcance por familia (ADR-0172); si la sesión no tiene `family_id`, consulta por los alumnos del alcance resueltos por correo.
   - Es **solo lectura**: sin edición, sin reprogramación, sin botones de mutación.
6. **Habilitación por datos (`getProgressReportsAccess`)**:
   - `progressReportsV2 = true` abre la bandeja; sin flag se abre por `pilot_teacher_ids` (hoy Jeremy, Fernando y Nathaly).
   - `parentReports` solo informa el valor `family`; la ruta del portal es de solo lectura y muestra estado vacío mientras no haya publicaciones.
   - Cualquier error → cerrado. Abrir o cerrar no requiere desplegar.
7. **Prohibiciones**:
   - No modificar `app-store.ts`, `kardex-calculator.ts` ni `student-cycle.ts` para informes.
   - No tocar `students.notes` (legacy congelado) ni `notification_logs`.
   - No exponer informes `draft`, `pending`, `rejected` ni filas `is_test` al portal familia.
8. **Verificación de referencia**: `scratch/test-fase5-progress-reports.mjs` (28/28 con datos vivos, `is_test` + `test_run_id`, limpieza final); rutas `/`, `/admin/alumnos`, `/family/progreso` y `/teacher` en 200; `npm run build` en verde antes de commitear.


---

### 78. UI/UX Móvil del Portal Docente: Buscador Táctil de Alumnos y Estado "No aplicó" (ADR-0176)

1. **Un solo buscador de alumno reutilizable (`StudentPicker`)**:
   - `src/components/teacher/student-picker.tsx` reemplaza los `<select>` de alumno en **Registro de clase** (`class-log.tsx`), **Nota a familia** (`family-note-form.tsx`) y **Nota interna** (`internal-note-form.tsx`).
   - Búsqueda que ignora tildes y mayúsculas, admite varias palabras en cualquier orden y filtra por nombre, instrumento, docente y categoría. Filas táctiles de **mínimo 44 px**, lista con scroll propio (`max-h-64`) y contador de resultados.
   - Con un alumno elegido, el control **se colapsa a una sola fila** con botón **Cambiar**; `Enter` selecciona el único resultado, `Escape` y el clic/touch fuera cierran.
   - `allowEmpty` + `emptyLabel` conservan los casos que sí admiten "sin alumno". Queda **PROHIBIDO** volver a introducir un `<select>` con la base activa de alumnos en formularios docentes.

2. **Estado visible "No aplicó" (valor de base intacto)**:
   - El valor persistido sigue siendo **`no_corresponde`** en `lesson_evaluations.overall_status`, en el repertorio y en `evaluation_fields.options`. Solo cambia la etiqueta visible.
   - `STATUS_OPTIONS`, `STATUS_LABELS` y `DEFAULT_TRAFFIC_OPTIONS` muestran **"⚪ No aplicó"**; `OPTION_LABEL_OVERRIDES` traduce las etiquetas crudas que llegan de `evaluation_fields`; `STATUS_HELP` explica cada estado al seleccionarlo, aclarando que "No aplicó" **no cuenta como bajo desempeño**.
   - Leyenda de una línea antes de los criterios: `Logrado · En proceso · No logrado · No aplicó (hoy no se trabajó ese aspecto; no es una nota baja)`.
   - Se retira `no_corresponde` del desplegable de **repertorio**: una pieza listada en la clase sí se trabajó.

3. **Informes y WhatsApp sin valores crudos**:
   - `TRAFFIC_LABELS` en `src/lib/informes/progress-report-format.ts` mapea `no_corresponde` y `no_aplica` → **"No aplicó"**. Como ese archivo es la fuente única de vista, Markdown, WhatsApp y CSS de impresión (ADR-0119.3), la corrección aplica a las cuatro salidas.
   - Queda **TERMINANTEMENTE PROHIBIDO** imprimir `no_corresponde` en pantalla, informe, Markdown o WhatsApp, y **prohibido renombrar el valor persistido** sin una migración de esquema explícita.

4. **Directorio Docente (`/teacher/alumnos`) optimizado para celular**:
   - La **búsqueda va primero**, debajo de una cabecera compacta: el profesor escribe sin deslizar. Botón **X** para limpiar y `autoComplete/autoCorrect/autoCapitalize off`, `spellCheck={false}` y `type="search"` (ADR-0164).
   - Filtro de docente compacto en la misma fila que la búsqueda; contador `N/total` en la cabecera.
   - **Leyenda de categorías colapsada** en `<details>` ("toca para ver"), con etiquetas cortas (`ESTIM.`, `INFANTIL`, `JUNIOR`, `JUVENIL`, `MASTER`, `RECUP.`, `PERSONAL.`).
   - Tarjetas convertidas en **filas densas de 3 líneas**: nombre + chip de categoría + edad; instrumento · docente · día/hora · sala; apoderado/teléfono (teléfono del propio alumno si es +18). `📖 Kardex` y % de asistencia a la derecha. Sin horario agendado se indica explícitamente.
   - La animación de entrada se acota (`delay` máximo 0.2 s) para listas largas.

5. **Verificación de referencia**: `npm run build` en verde; rutas `/`, `/teacher`, `/teacher/alumnos`, `/admin/alumnos` y `/family/progreso` en 200; `grep "No corresponde"` en `src/` sin resultados. Documentación: ADR-0176 y `docs/logs/2026-10-22-ui-movil-docente.log`.
