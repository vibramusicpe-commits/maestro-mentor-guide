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
   - El saldo pendiente (`remainingBalance`) se calcula estrictamente como `Math.max(0, amount - amountPaid)`. Un saldo en 0 marca el recibo y alumno como `pagado` / `al-dia`.

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

