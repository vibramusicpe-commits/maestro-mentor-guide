# BRIEF MAESTRO — Evaluación, Notas y Informe de Progreso
## Vibra Music Staff · Documento de análisis para planificación (NO implementado)

**Fecha:** 21 de octubre de 2026  
**Estado:** Auditoría cerrada. Sin cambios de código.  
**Destinatario:** Claude Opus 5.5 (planificador) + Dirección Vibra Music.  
**Regla de oro:** estamos en PRODUCCIÓN. Cualquier plan debe ser incremental, reversible y no puede tocar el motor de asistencia, agenda, Kardex ni facturación sin pruebas de regresión.

---

## 0. Cómo debe usar este documento el planificador

1. Leer completo antes de proponer una sola línea de código.
2. No proponer reescrituras ni “migraciones big bang”. Todo debe ser aditivo y por fases.
3. Cada fase debe indicar: archivos exactos a tocar, migraciones SQL, rollback, criterios de aceptación y pruebas.
4. Reutilizar los motores existentes. Está prohibido reimplementar filtros de lecciones, cuotas, asistencias o cálculo de ciclos.
5. Separar explícitamente tres cosas que hoy están mezcladas: **registro de clase**, **nota a la familia** e **informe de progreso**.
6. Toda decisión pedagógica que no esté en este documento debe quedar como pregunta abierta, no inventada.
7. El plan final debe poder ejecutarse “quirúrgicamente”: un módulo a la vez, con `npm run build` verde antes de cada push.

---

## 1. Resumen ejecutivo

La academia quiere pasar de “notas sueltas” a un **sistema de evaluación pedagógica con informe de progreso**. Hoy existen dos flujos de notas, pero ambos son frágiles:

- **Nota a la Familia:** el docente escribe, administración aprueba/rechaza y se publica. Funciona a nivel de UI, pero la persistencia real es débil: la cola de moderación vive sobre todo en `localStorage`, la tabla `notification_logs` está vacía y se sobreescribe un único campo `students.notes`.
- **Nota Privada (Dirección):** es un cuadro de texto global, por sesión, que no se guarda en PostgreSQL y que **ninguna vista de administración lee**. En la práctica es un placeholder.

Además, los docentes ya levantaron sus criterios reales de evaluación:

- **Nathaly:** Canto (5 a 18+) y Piano Infantil (5 a 7 según su ficha). Quiere registro por clase en 3–5 minutos, semáforo de 4 colores, comentario de 2–3 líneas o un párrafo, columnas distintas para Canto y Piano Infantil.
- **Fernando:** Violín (5 a 18+) y Piano (8 a 18+). Quiere escala 1–10, actualización semanal, más de 10 minutos por informe, comentario de 1 línea. Se queja de que los informes actuales “no se entienden”.
- **Jeremy:** Guitarra y Batería. **Falta su levantamiento.** No se debe inventar.

El audio de Nathaly define el modelo de entrega: el **informe académico** se entrega en recital o reunión de padres, para que el apoderado verifique que lo escrito coincide con lo que el hijo toca en escenario. Debe ser objetivo, con avance de repertorio, técnica y un resumen final. Alex recomendó frecuencia **mensual o cada 3 meses** (no semanal), porque el nivel del alumno cambia cada trimestre. Los padres no valoran reportes semanales con poco avance; quieren ver el cambio radical “antes/después” para justificar la inversión.

**Conclusión:** no hace falta “arreglar” el sistema de notas actual. Hace falta construir una capa nueva de evaluación estructurada, mantener la moderación para lo que se publica a la familia, y separar la bitácora interna del informe periódico.

---

## 2. Auditoría del sistema actual (evidencia)

### 2.1 Mapa de archivos y responsabilidades

| Pieza | Archivo | Qué hace hoy | Estado |
|---|---|---|---|
| UI docente de notas | `src/components/teacher/lesson-notes.tsx` (624 líneas) | Dos pestañas: “Nota a la Familia” y “Nota Privada (Dirección)”. Incluye buscador de alumnos, plantillas rápidas, estado de moderación, WhatsApp y “Nota General”. | Funcional a medias |
| Servicio de notas | `src/lib/services/teacher-notes.service.ts` (364 líneas) | `submitTeacherNote`, `fetchAllTeacherNotes`, `approveTeacherNote`, `rejectTeacherNote`. Persiste en `localStorage` + intento en `notification_logs`. | Frágil |
| Moderación admin (pestaña) | `src/components/admin/teacher-notes-moderation.tsx` (612 líneas) | Bandeja con filtros por estado, edición, aprobación, rechazo y WhatsApp. | Funcional |
| Widget admin (dashboard) | `src/components/admin/teacher-notes-approval-widget.tsx` (466 líneas) | Versión resumida de la bandeja para el dashboard. | Duplica lógica |
| Pestaña admin | `src/routes/admin.alumnos.tsx` | Pestaña `notas` que monta `TeacherNotesModeration`. | Activa |
| Dashboard admin | `src/routes/admin.index.tsx` (línea 149) | Monta `TeacherNotesApprovalWidget`. | Activo |
| Portal familia | `src/components/family/kid-summary.tsx` | Muestra la última nota aprobada (`teacherNotes` o `student.teacherNote`). | Funcional con riesgo de dato viejo |
| Kiosco docente | `src/routes/teacher.index.tsx` (líneas 594–597) | Monta `LessonNotes` debajo de la lista de clases. | Activo |
| Modelo de alumno | `src/store/admin-seeds.ts` (161–217) | `AdminStudent.teacherNote: string`, `level: string`. | Insuficiente |
| Store | `src/store/app-store.ts` | `teacherNotes`, `privateNote`, `publicNote`, `setNote`, `addOrUpdateTeacherNote`. | Mezcla estado y UI |
| Mapeo DB | `src/lib/services/students.service.ts` (70–184) | `students.notes` → `teacherNote`; `emergency_contact` JSONB → campos extendidos. | Activo |
| Motor de sesiones | `src/lib/kardex-calculator.ts` | `computeStudentCycleSessions`, `computeStudentMonthSessions`, `computeStudentCycleLiquidation`, `computeStudentFinancialAudit`, `generateStudentAuditMarkdown`. | **Reutilizar, no duplicar** |
| Motor de ciclo | `src/lib/student-cycle.ts` | `computeStudentCycle`, `isLessonInStudentCycle`. | **Reutilizar, no duplicar** |
| Ficha A4 existente | `src/components/admin/student-audit-report-dialog.tsx` | Ficha de auditoría pedagógica + financiera, 2 páginas A4, exportación Markdown/WhatsApp. | **Reutilizar arquitectura de impresión** |

### 2.2 Flujo real de “Nota a la Familia”

```
Docente (LessonNotes)
  └─ submitTeacherNote()
       ├─ guarda en localStorage "cadencia_teacher_parent_notes"
       ├─ intenta INSERT en notification_logs
       │    recipient_id = null
       │    channel = "in_app"
       │    subject = "Nota Pedagógica: ..."
       │    body = contenido
       │    error_msg = JSON con studentId, teacherName, familyName, etc.
       └─ notifica por BroadcastChannel "vibra_notes_sync_channel"

Administración (TeacherNotesModeration / Widget)
  └─ fetchAllTeacherNotes()
       ├─ SELECT notification_logs (channel = in_app)
       ├─ fusiona con localStorage por id
       └─ muestra pendientes

Aprobar
  ├─ UPDATE notification_logs SET status = "enviado", body = contenido
  ├─ UPDATE students SET notes = contenido
  └─ updateStudentDetails(studentId, { teacherNote: contenido })
       └─ backgroundSyncStudentToDB → UPDATE students SET notes = ...

Portal Familia
  └─ KidSummary
       ├─ busca en teacherNotes (store persistido en localStorage) una nota "aprobado"
       └─ si no, usa student.teacherNote (que viene de students.notes)
```

### 2.3 Problemas confirmados del flujo actual

1. **`notification_logs` tiene 0 filas visibles con la anon key.** Verificado por PostgREST el 2026-10-21 (`Content-Range: */0`). Puede ser que el INSERT esté fallando (FK, RLS o columna) o que RLS oculte las filas. En cualquier caso, **la fuente real de la cola de moderación es `localStorage`**, no PostgreSQL.
2. **La cola no cruza dispositivos.** Si el docente escribe en su celular y la administración abre la bandeja en otra PC, la nota solo aparece si el INSERT en `notification_logs` funcionó. Hoy no hay evidencia de que funcione.
3. **No hay historial por alumno.** Cada aprobación sobrescribe `students.notes`. Solo sobrevive la última nota. No hay fecha, asignatura, sesión, criterios ni versión.
4. **`students.notes` está sobrecargado.** En producción contiene valores legacy y operativos: `"Blog Beneficios"`, `"Valor con Video"`, `"Alumno importado del registro oficial."`, `"Ex-alumno de Alex..."`. Aprobar una nota pedagógica **borra** ese contenido.
5. **`teacherNote` también se usa como “motivo de precio personalizado”.** En `students-table.tsx` (líneas ~3272 y ~4400) el campo `teacherNote` se inicializa desde `customPriceReason` y se guarda de vuelta. Aprobar una nota puede destruir la justificación de un precio especial.
6. **Metadatos dentro de `error_msg`.** El servicio guarda `studentId`, `teacherName`, `familyName`, `parentPhone`, etc. dentro de `error_msg` como JSON. Al rechazar una nota, `rejectTeacherNote` reemplaza `error_msg` por el motivo del rechazo: **se pierden los metadatos** y la siguiente lectura ya no puede reconstruir alumno/profesor.
7. **`recipient_id = null`.** Evita conflictos de FK, pero rompe la relación real con el alumno. El vínculo queda solo en el JSON.
8. **No hay vínculo con la sesión.** No se guarda `lesson_id`, `dateStr`, hora, instrumento ni criterios. Es texto libre.
9. **La nota aprobada no distingue “publicada al portal” de “enviada por WhatsApp”.** El estado es binario (`pendiente`/`aprobado`/`rechazado`).
10. **El portal familia puede mostrar una nota vieja.** `KidSummary` busca primero en `teacherNotes` del store persistido en `localStorage`; en un dispositivo que ya tuvo sesión de staff, puede haber una nota aprobada antigua que no coincide con `students.notes`.

### 2.4 Flujo real de “Nota Privada (Dirección)”

- `privateNote` es **un único string global** en Zustand (`app-store.ts:124`), no es por alumno.
- `setNote("private", value)` solo cambia el estado en memoria (`app-store.ts:1386`).
- **No está en `partialize`** (`app-store.ts:3790–3804`), así que se pierde al recargar.
- **Ninguna vista de administración lee `privateNote`.** El grep solo lo encuentra en `lesson-notes.tsx` y en el store.
- `publicNote` (“Nota General”) tiene el mismo problema: no se persiste, no se muestra a las familias, no pasa por moderación. La UI dice “se mostrará a todos los apoderados”, pero eso no ocurre.

**Conclusión:** “Nota Privada (Dirección)” y “Nota General” no son canales reales. Son placeholders de UI. El plan debe decidir si se eliminan, se arreglan o se reemplazan por el nuevo modelo.

### 2.5 Esquema real de PostgreSQL (verificado en vivo)

**Tabla `students`** — columnas reales:

```
id, family_id, full_name, instrument, level, assigned_teacher_id,
modality, status, makeup_credits, birthdate, attendance_rate,
emergency_contact (JSONB), notes, created_at, updated_at
```

**Datos actuales (2026-10-21, PostgREST con anon key):**

| Métrica | Valor |
|---|---:|
| Alumnos totales | 146 |
| Alumnos activos | 57 |
| Alumnos en pausa | 57 |
| Alumnos de baja | 32 |
| Familias | 155 |
| `attendance_logs` | 301 |
| `notification_logs` | 0 visibles |

> **Advertencia de documentación:** varios ADR de `AGENTS.md` hablan de “13 alumnos activos” (ADR-0144/0145). La base real hoy tiene **57 activos**. El planificador no debe asumir 13 ni hardcodear métricas.

**Tablas que NO existen** (probadas por PostgREST, todas 404):

`lesson_notes`, `student_notes`, `evaluations`, `evaluation_criteria`, `progress_reports`, `academic_reports`, `report_cards`, `student_evaluations`, `lesson_evaluations`, `progress_notes`, `student_progress`, `evaluation_records`, `reportes`, `informes`, `evaluaciones`, `skills`, `student_skills`, `lesson_feedback`, `class_notes`.

**Tablas que sí existen y son relevantes:**

- `students`, `families`, `invoices`, `payment_audit_logs`, `invitations`, `attendance_logs`, `notification_logs`, `whatsapp_bot_config`.
- `lessons` y `demo_requests` existen pero están **vacías** (ADR-0171). El horario real vive en `emergency_contact.scheduleLessons`.
- `reminders` no existe.

**`students.level` no es confiable como nivel pedagógico real:**

- 56 de 57 activos tienen `level = "Principiante"`.
- 1 tiene `"Avanzado"`.
- En la base histórica hay valores como `"Nivel 1"`, `"Nivel 2"`, `"Iniciación Musical"`.
- No hay una escala canónica ni historial de cambios.

**`emergency_contact` es la bolsa de extensión de facto:** ahí viven `scheduleLessons`, `modality`, `planStartDate`, `planEndDate`, `ageCategory`, `teacher`, `room`, `packUtiles*`, `amountPaid`, `balance`, etc. Es útil para metadatos, pero **no** debe usarse como fuente de verdad de evaluaciones o informes (ADR-001.3 y ADR-0119).

### 2.6 Motores existentes que el plan DEBE reutilizar

| Motor | Archivo | Qué resuelve | Por qué no duplicarlo |
|---|---|---|---|
| `computeStudentCycleSessions` | `src/lib/kardex-calculator.ts` | Sesiones del ciclo, cuotas, transiciones, makeups, bloques de 90 min, deduplicación por slot. | Ya contiene todos los parches ADR-0131/0154/0156/0161/0165/0166/0173. Una copia nueva repetirá los bugs. |
| `computeStudentMonthSessions` | ídem | Proyección mensual del Kardex. | Misma razón. |
| `computeStudentCycleLiquidation` | ídem | Asistidas, faltas, justificadas, créditos, pendientes, veredicto. | El informe debe mostrar las mismas cifras que el Kardex. |
| `computeStudentFinancialAudit` | ídem | Matrícula, mensualidad, libros. | El informe pedagógico no debe recalcular finanzas. |
| `generateStudentAuditMarkdown` | ídem | Documento Markdown para LLM/auditoría. | Base para el exportable del nuevo informe. |
| `computeStudentCycle` / `isLessonInStudentCycle` | `src/lib/student-cycle.ts` | Elegibilidad de una lección en el ciclo. | Evita “clases fantasma” y duplicados. |
| `dedupeLessonsForCell` | `src/components/admin/agenda-board.tsx` (~143) | Deduplicación intra-celda. | Regla única de visibilidad (ADR-0119.3). |
| `useInsforgeSync` | `src/hooks/use-insforge-sync.ts` | Hidratación por rol, cola de sync, BroadcastChannel. | No crear un segundo mecanismo de sync. |
| Impresión A4 | `src/components/admin/student-audit-report-dialog.tsx` + `src/components/ui/dialog.tsx` | 2 páginas A4, `@media print`, sin offsets, sin cortes. | ADR-0136/0137 ya resolvieron los bugs de Radix + print. |

### 2.7 Lo que ya existe y se puede reutilizar sin reinventar

- **A4 de 2 páginas** con membrete, código de auditoría, tablas fijas y firmas (ADR-0136/0137).
- **Markdown para LLM** (`generateStudentAuditMarkdown`).
- **Plantillas de WhatsApp** con `wa.me` y mensajes prellenados.
- **Portal familia** con alcance por familia (`src/lib/laya/laya-family-scope.ts`) y pestañas Inicio/Horario/Asistencias/Avisar (`src/routes/family.tsx:132–136`).
- **Kiosco docente** con lista de alumnos y marcado de asistencia.
- **Moderación admin** con filtros, edición, aprobación y rechazo.
- **Categorías por edad** (`getCategoryFromAge`) y salas oficiales por docente.
- **Código de auditoría** `AUD-YYYYMMDD-XXXX`.

---

## 3. Requerimientos pedagógicos traducidos (fuente: fichas + audio)

> Esta sección es la materia prima. El planificador debe convertirla en configuración, no hardcodearla en componentes.

### 3.1 Nathaly — Canto y Piano Infantil

**Rangos declarados:**
- Canto: **5 años a 18+**.
- Piano Infantil: **5 a 7 años** (en su ficha). En otros documentos de la academia aparece “4 a 8” o “5 a 8”. **Discrepancia a resolver con Dirección.**

**Ficha “Registro de avance por clase” (Nathaly):**

| Columna | Opciones / uso |
|---|---|
| Clase / fecha | Fecha de la sesión |
| Digitación | Mano derecha / Mano izquierda / Ambas manos |
| ¿Cómo? | Tocando / Cantando / Ambos |
| Repertorio de la clase | Canción o pieza trabajada |
| Temario / tema visto | Objetivo técnico de la clase |
| Estado | Logrado / En proceso / Pendiente |

**Escala preferida:** semáforo de 4:
- 🔴 No logrado
- 🟡 En proceso
- 🟢 Logrado
- ⚪ Todavía no corresponde a su nivel (gris)

**Cadencia y tiempo:**
- Actualización: **cada clase**.
- Tiempo realista: **3 a 5 minutos**.
- Comentario escrito: **2 a 3 líneas**, **un párrafo** o **variado**.
- Le molesta: “hacerlo anecdotario (muy largo). Reporte técnico es distinto a la clase”.

**Criterios de Canto (manuscritos):**
- Relajación
- Respiración
- Proyección
- Apoyo diafragmático
- Lenguaje corporal
- Conducta / Disposición
- (Agregar en el diseño: afinación, letra/dicción, ritmo, repertorio, interpretación)

**Criterios de Piano Infantil (manuscritos):**
- Conducta / Disposición
- Lenguaje musical
- Digitación
- Solfeo
- Nota textual: **“Dos manos es diferente a digitación”** → deben ser criterios separados.

**Niveles y metas (Nathaly):**

| Nivel | Metas declaradas |
|---|---|
| Inicial (primeros meses) | Conocer el teclado; manejo de figuras musicales; digitación correcta |
| Intermedio | Manejo de digitación correcta; manejo de figuras musicales |
| Avanzado | Manejo de notas; dinámica correcta; manejo de figuras musicales; conocer repertorio a dos manos; clave de fa y clave de sol |

**Qué cambia según edad/categoría:** “Nivel de exigencia técnica y repertorio”.

**Material:** Libro 1 de clases; Método Suzuki 1.

**Portafolio para alumno que cambia de escuela:**
- Datos indispensables: nivel actual, método/libro, si lee partitura, metas del siguiente trimestre, asistencia, piezas que ya domina, técnicas que domina, puntos a reforzar, fecha de inicio.
- Qué NO sirve del informe actual: **“Notas y logros”**.
- Qué preguntan los padres: **“Qué pueden tocar o tocar”** (repertorio).
- Qué debería mostrar el informe: foto del alumno, asistencia del periodo, logro destacado, observaciones finales, edad/categoría, próxima meta, tarea o práctica sugerida en casa.
- Nota manuscrita: **“Debe estar separado Coro e individual”** → el criterio de canto coral vs. canto individual no debe mezclarse.

### 3.2 Fernando — Violín y Piano

**Rangos declarados:**
- Violín: **5 a 18+**.
- Piano: **8 a 18+**.

**Escala preferida:** **1 al 10** (“Otra escala”).
**Cadencia:** **semanal** (escrito con flecha).
**Tiempo realista por alumno:** **más de 10 minutos**.
**Comentario:** **1 línea corta**.
**Le molesta:** **“Que no se entienda”**.

**Criterios marcados con aspa (X = núcleo) y punto (· = depende del nivel/categoría):**

| Grupo | Criterio | Marca |
|---|---|---|
| Técnica | Postura corporal | X |
| Técnica | Posición de manos | X |
| Técnica | Digitación | X |
| Técnica | Coordinación motriz | X |
| Técnica | Respiración y emisión | X |
| Técnica | Afinación | · |
| Técnica | Ritmo y pulso | · |
| Técnica | Dinámicas y articulación | · |
| Técnica | Escalas y arpegios | · |
| Técnica | Técnicas avanzadas | · |
| Lectura y teoría | Ubicación de notas | X |
| Lectura y teoría | Figuras y silencios | X |
| Lectura y teoría | Lectura de partitura | X |
| Lectura y teoría | Compases y tempo | X |
| Lectura y teoría | Acordes y armonía | · |
| Lectura y teoría | Teoría avanzada | · |
| Repertorio e interpretación | Toca piezas completas | X |
| Repertorio e interpretación | Toca de memoria | · |
| Repertorio e interpretación | Toca con pista o acompañamiento | · |
| Repertorio e interpretación | Expresividad / interpretación | · |
| Repertorio e interpretación | Improvisación | · |
| Repertorio e interpretación | Presentación en público | · |
| Oído | Entrenamiento auditivo | · |
| Oído | Sacar canciones de oído | · |
| Actitud | Concentración | X |
| Actitud | Práctica en casa | X |
| Actitud | Disposición y conducta | X |
| Actitud | Trabajo en grupo / ensamble | · |

**Niveles y metas (Fernando):**

| Nivel | Metas declaradas |
|---|---|
| Inicial | Leer partituras básicas; técnico básico |
| Intermedio | Técnica básica / intermedio |
| Avanzado | “Suelen tomar clases particulares” |

**Qué cambia según edad/categoría:** “Compromiso y disciplina”.
**Material / repertorio:** no completado → **preguntar**.

**Portafolio para alumno que cambia de escuela:**
- Datos indispensables: nivel actual, método/libro y página/unidad, si lee partitura o cifrado, técnicas que domina, fecha de inicio.
- Qué NO sirve: **“Asistencia y constancia”**.
- Qué preguntan los padres: **“Si es que ya tocan”**.
- Qué debería mostrar: **“El compromiso de los estudiantes”** (si no hay avance en semanas, suele ser por falta de compromiso y disciplina).
- Datos del alumno: foto, asistencia del periodo, edad/categoría, tarea o práctica sugerida en casa.

### 3.3 Jeremy — Guitarra y Batería (PENDIENTE)

No hay ficha ni audio de Jeremy. **No inventar criterios.** El plan debe incluir:

1. Un paso de levantamiento con el mismo formato (rangos de edad, instrumentos, escala, cadencia, tiempo, comentario, criterios, niveles, material, repertorio, qué preguntan los padres).
2. Una configuración genérica por instrumento que permita cargar sus criterios sin tocar código.
3. Una prueba piloto con él antes de publicar informes a familias.

### 3.4 Audio de Nathaly — modelo de entrega del informe

Transcripción limpia y puntos accionables:

- El **informe académico** se entrega cuando hay recitales, para que los padres verifiquen el progreso.
- Ideal: entregarlo en **reunión de padres o recital**; en su defecto, en la **semana de entregas**.
- El padre debe poder confrontar lo escrito con la interpretación real de su hijo en el escenario. Eso demuestra que no le “regalan la nota” y que los profesores son objetivos.
- En “My Music Staff”, al hacer clic en el nombre del alumno se veía información general: fecha de inicio, edad, tipo de alumno (infantil, amateur, etc.).
- Existía una vista **“agenda”** consolidada con los horarios fijos semanales de cada profesor y sus alumnos. Secretaría marcaba las recuperaciones en otro color. Los colores permitían saber qué horarios quedaban disponibles para vender a nuevos alumnos.
- Al hacer clic en el horario de un alumno se abría una pestaña de **“observaciones” o “avances de status”** específica de esa clase. Ahí se configuraban criterios internos: en canto, lenguaje corporal, respiración y proyección de voz. Se registraba el **repertorio exacto** trabajado ese día (por ejemplo, una canción de Mon Laferte) y se recopilaba como Excel para entregar a Alex.
- Para el **informe académico general** se usaba otra aplicación: **“Informes Vibra Music”**, donde se registraba desempeño y nivel (básico, avanzado, etc.).
- Existía opción quincenal, pero **Alex recomendó mensual o cada 3 meses**. Razón: el alumno varía su nivel cada 3 meses; si se hace muy seguido, siempre aparece en el mismo nivel. En 3 meses se le da la oportunidad de pasar de básico a intermedio o avanzado.
- El informe consta de: **avance (repertorio)**, **técnica (teoría, lectura musical, respiración)** y **resumen final** que une técnica + interpretación (si ya maneja piezas complejas, dominio escénico).
- Al entregar el informe espaciado, el padre ve un avance real con un repertorio acumulado de hasta **10 canciones**.
- A los padres no les interesan reportes semanales con poco avance; quieren ver el cambio radical de cómo llegó el niño a cómo está ahora, para saber si vale la pena la inversión.
- Sugerencia final: complementar con un video **“antes y después”** del estudiante.

---

## 4. Producto objetivo: cuatro capas separadas

El error actual es mezclar todo en “notas”. El plan debe separar:

### Capa 1 — Registro de clase (bitácora interna)
- Lo llena el docente al terminar la clase, en **30–90 segundos** si es modo rápido.
- Contiene: alumno, fecha, hora, instrumento, criterios (semáforo o 1–10), repertorio, tema trabajado, estado general, comentario corto, tarea.
- **No se publica automáticamente a la familia.**
- Sirve para: historial, alimentar el informe periódico, detectar estancamiento, auditoría pedagógica.

### Capa 2 — Nota a la familia (mensaje corto moderado)
- Texto breve (2–3 líneas o un párrafo) sobre la clase o el periodo.
- Pasa por **moderación de Dirección/Secretaría** antes de publicarse.
- Se publica en el portal y, opcionalmente, se envía por WhatsApp.
- Debe tener historial, estado y trazabilidad (no sobreescribir un campo único).

### Capa 3 — Informe de progreso (documento periódico)
- Frecuencia: **mensual o trimestral** (recomendado: trimestral alineado a recital; mensual solo para alumnos nuevos o casos especiales).
- Estructura: identidad, nivel actual, criterios evaluados, repertorio acumulado, técnica/lectura, resumen narrativo, asistencia, próxima meta, tarea, firmas.
- Entrega: PDF A4, portal familia, WhatsApp y Markdown para LLM.
- **No incluye datos financieros.** La ficha financiera ya existe aparte (`StudentAuditReportDialog`).
- Debe permitir “antes/después”: nivel al inicio vs. nivel actual, repertorio inicial vs. actual, video opcional.

### Capa 4 — Nota interna a Dirección
- Incidencias, conducta, coordinación administrativa, sugerencias.
- Visible solo para Dirección/Secretaría, **nunca** para la familia.
- Debe ser por alumno (o general), persistida, con estado leído/no leído y autor.
- Puede tener destinatario: Dirección, Secretaría o ambos.

---

## 5. Roles, permisos y alcance

| Rol | Puede ver | Puede crear/editar | Restricciones |
|---|---|---|---|
| Docente | Solo sus alumnos (por `assigned_teacher_id` y horario) | Registro de clase, borrador de informe, nota a familia (pendiente), nota a dirección | No aprueba, no publica, no ve alumnos de otros |
| Secretaría | Todos los alumnos y notas | Moderar notas, editar, aprobar/rechazar, publicar informes, registrar pagos | No cambia criterios pedagógicos sin Dirección |
| Dirección | Todo | Todo, incluida configuración de criterios, escalas y publicación | — |
| Familia | Solo sus hijos (`family_id` / email / alcance) | Nada (solo lectura) | No ve notas internas ni borradores |
| Admin técnico | Configuración | Migraciones, criterios, escalas | No edita contenido pedagógico sin permiso |

**Regla de identidad:** resolver siempre por `id` de alumno, nunca por nombre. Hay homónimos reales en la base (`Mario Keffreen` / `Mario Kefren`, `EMMA`, etc.).

---

## 6. Modelo de datos propuesto (opciones para el planificador)

> **No ejecutar todavía.** Son opciones de diseño. El planificador debe elegir una y justificarla.

### Opción A (recomendada): tablas normalizadas

```sql
-- 1. Marco de evaluación por instrumento y categoría/edad
evaluation_frameworks (
  id uuid primary key,
  instrument text not null,              -- "Canto", "Piano Infantil", "Violín", ...
  age_category text,                     -- INFANTIL, JUNIOR, JUVENIL, MASTER, null = todas
  level text,                            -- Inicial, Intermedio, Avanzado, null = todos
  name text not null,
  version int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz default now()
)

-- 2. Criterios configurables
evaluation_criteria (
  id uuid primary key,
  framework_id uuid references evaluation_frameworks(id) on delete cascade,
  code text not null,                    -- "respiracion", "digitacion", ...
  label text not null,
  group_name text not null,              -- Técnica, Lectura, Repertorio, Oído, Actitud
  scale_type text not null,              -- "semaforo4" | "numeric10" | "boolean"
  is_core boolean default false,
  sort_order int default 0,
  is_active boolean default true
)

-- 3. Registro de clase (bitácora)
lesson_evaluations (
  id uuid primary key,
  student_id uuid references students(id),
  lesson_id text,                        -- id de scheduleLessons (puede ser no-UUID)
  session_date date not null,
  start_time time,
  teacher_id uuid,
  instrument text,
  framework_id uuid references evaluation_frameworks(id),
  overall_status text,                   -- logrado | en_proceso | pendiente | no_corresponde
  repertoire text,
  topic text,
  comment text,
  homework text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (student_id, session_date, start_time, lesson_id)
)

-- 4. Puntajes por criterio
lesson_evaluation_scores (
  id uuid primary key,
  evaluation_id uuid references lesson_evaluations(id) on delete cascade,
  criterion_id uuid references evaluation_criteria(id),
  value_enum text,                       -- rojo | amarillo | verde | gris
  value_numeric numeric,                 -- 1..10
  note text
)

-- 5. Informe de progreso
progress_reports (
  id uuid primary key,
  student_id uuid references students(id),
  period_start date not null,
  period_end date not null,
  report_type text not null,             -- mensual | trimestral | recital
  status text not null default 'draft',  -- draft | pending | approved | published | rejected
  level_at_start text,
  level_at_end text,
  summary text,                          -- resumen final técnica + interpretación
  next_goal text,
  homework text,
  attendance_snapshot jsonb,             -- congelado del motor de ciclos
  teacher_comment text,
  created_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)

-- 6. Detalle del informe
progress_report_scores (
  id uuid primary key,
  report_id uuid references progress_reports(id) on delete cascade,
  criterion_id uuid references evaluation_criteria(id),
  value_enum text,
  value_numeric numeric,
  comment text
)

progress_report_repertoire (
  id uuid primary key,
  report_id uuid references progress_reports(id) on delete cascade,
  title text not null,
  composer text,
  status text,                           -- en_proceso | dominada | presentada
  sort_order int default 0
)

-- 7. Nota a la familia (con historial)
family_notes (
  id uuid primary key,
  student_id uuid references students(id),
  teacher_id uuid,
  lesson_evaluation_id uuid references lesson_evaluations(id),
  content text not null,
  status text not null default 'pendiente', -- pendiente | aprobado | rechazado | publicado
  moderated_by uuid,
  moderated_at timestamptz,
  rejection_reason text,
  published_at timestamptz,
  created_at timestamptz default now()
)

-- 8. Nota interna a dirección
internal_notes (
  id uuid primary key,
  student_id uuid references students(id),
  author_id uuid,
  recipient text not null,               -- direccion | secretaria | ambos
  content text not null,
  status text not null default 'nueva',  -- nueva | leida | archivada
  read_at timestamptz,
  created_at timestamptz default now()
)

-- 9. Auditoría de cambios
evaluation_audit_log (
  id uuid primary key,
  entity text not null,                  -- family_notes | progress_reports | internal_notes
  entity_id uuid not null,
  action text not null,                  -- create | update | approve | reject | publish
  actor_id uuid,
  before jsonb,
  after jsonb,
  created_at timestamptz default now()
)
```

**Ventajas:** consultas limpias, historial, reportes, RLS, auditoría, sin sobrecargar `students.notes`.
**Costos:** migraciones, más código, más cuidado con RLS y sync.

### Opción B: JSONB en `students.emergency_contact`

Guardar `evaluations: []` y `progressReports: []` dentro del JSONB existente.

**Ventajas:** cero migraciones, rápido de prototipar.
**Desventajas:** no se puede consultar/filtrar bien, no hay historial relacional, se pierde con escrituras concurrentes, choca con ADR-001.3 y ADR-0119. **No recomendada para el núcleo.**

### Opción C (híbrida, buen MVP)

- `lesson_evaluations` y `progress_reports` como tablas reales.
- `scores` y `attendance_snapshot` como JSONB dentro de esas tablas.
- Criterios en tabla `evaluation_criteria` para configurarlos sin deploy.

**Recomendación:** Opción C para el MVP; migrar a Opción A cuando los criterios se estabilicen. Empezar con **una sola tabla de evaluaciones + una de informes + una de notas**, no con 9 tablas.

### Reglas de migración

- **Solo `CREATE TABLE` / `CREATE INDEX` / `ALTER TABLE ... ADD COLUMN` nullable.** Nada de `DROP`, `TRUNCATE` ni `DELETE` masivo.
- No tocar `students.notes` ni `teacherNote` en la primera fase.
- No migrar los valores legacy de `students.notes`; solo leerlos como “nota histórica”.
- Toda tabla nueva debe tener `created_at` y, si aplica, `updated_at`.
- RLS: familia solo lectura de sus hijos y solo registros `published`/`aprobado`; docente solo sus alumnos; staff todo.
- Si se usa la anon key del frontend, **verificar RLS** con pruebas negativas entre familias.

---

## 7. Taxonomía pedagógica propuesta (configuración, no hardcode)

### 7.1 Grupos canónicos

1. **Técnica**
2. **Lectura y teoría**
3. **Repertorio e interpretación**
4. **Oído**
5. **Actitud y hábitos**

### 7.2 Criterios por instrumento (punto de partida)

> Cargar como datos en `evaluation_criteria`. El planificador puede ajustar etiquetas, pero no debe inventar criterios que los docentes no validaron.

**Canto (Nathaly):**
- Técnica: relajación, respiración, apoyo diafragmático, proyección, afinación, ritmo/pulso, lenguaje corporal.
- Lectura/teoría: lenguaje musical, solfeo, figuras.
- Repertorio: canción trabajada, interpretación, letra/dicción, presentación en público.
- Actitud: conducta/disposición, práctica en casa.
- Separar **coro** vs. **individual** (nota textual de Nathaly).

**Piano Infantil (Nathaly):**
- Técnica: postura, digitación, mano derecha, mano izquierda, ambas manos (¡separar “dos manos” de “digitación”!), coordinación.
- Lectura/teoría: lenguaje musical, solfeo, ubicación de notas, figuras.
- Repertorio: pieza trabajada, interpretación.
- Actitud: conducta/disposición, práctica en casa.

**Piano (Fernando):**
- Técnica: postura corporal, posición de manos, digitación, coordinación motriz, respiración y emisión, afinación, ritmo y pulso, dinámicas y articulación, escalas y arpegios, técnicas avanzadas.
- Lectura/teoría: ubicación de notas, figuras y silencios, lectura de partitura, compases y tempo, acordes y armonía, teoría avanzada.
- Repertorio: piezas completas, memoria, pista/acompañamiento, expresividad, improvisación, presentación en público.
- Oído: entrenamiento auditivo, sacar de oído.
- Actitud: concentración, práctica en casa, disposición y conducta, ensamble.

**Violín (Fernando):**
- Técnica: postura, sujeción del arco, posición de manos, digitación, coordinación, afinación, ritmo, dinámicas, escalas/arpegios.
- Lectura/teoría: lectura de partitura, figuras/silencios, compases/tempo.
- Repertorio: piezas completas, memoria, interpretación, presentación en público.
- Actitud: concentración, práctica, disciplina.

**Guitarra (Jeremy — pendiente):**
- Base sugerida: postura, mano izquierda, mano derecha, digitación, acordes, rasgueo/púa, lectura/tablatura, ritmo, repertorio, memoria, interpretación, práctica.
- **No publicar hasta validar con Jeremy.**

**Batería (Jeremy — pendiente):**
- Base sugerida: postura, agarre, coordinación, independencia, rudimentos, tempo, lectura, grooves, fills, repertorio, ensamble, práctica.
- **No publicar hasta validar con Jeremy.**

### 7.3 Escalas y normalización

Hoy hay dos escalas incompatibles:

| Docente | Escala | Valores |
|---|---|---|
| Nathaly | Semáforo 4 | 🔴 No logrado · 🟡 En proceso · 🟢 Logrado · ⚪ No corresponde |
| Fernando | Numérica | 1 al 10 |

**Propuesta:** guardar el valor **crudo** de cada docente (`value_enum` o `value_numeric`) y, además, un **valor normalizado** de 4 bandas para comparar y graficar:

| Banda normalizada | Semáforo | Numérico |
|---|---|---|
| 1. No logrado | 🔴 | 1–3 |
| 2. En proceso | 🟡 | 4–6 |
| 3. Logrado | 🟢 | 7–9 |
| 4. Destacado / no corresponde | ⚪ | 10 o “no corresponde” |

**Decisión pendiente con Dirección:** si se muestra la escala original al docente y la normalizada solo en reportes, o si se unifica todo a semáforo. Recomendación: mostrar la original al docente (respetar su método) y normalizar solo para analítica e informe.

### 7.4 Niveles

Separar **nivel pedagógico** de **categoría de edad**:

- Categoría de edad: Estimulación, Infantil, Junior, Juvenil, Master (18+).
- Nivel pedagógico: Iniciación, Inicial, Intermedio, Avanzado.

No usar “Master” como nivel. No confundir “Principiante” (valor legacy de `students.level`) con “Inicial”.

**Regla:** el nivel del informe se propone a partir de las evaluaciones, pero **Dirección lo aprueba**. No cambiar `students.level` automáticamente en la primera fase.

---

## 8. Informe de Progreso — estructura propuesta

### 8.1 Página 1 — Identidad, nivel y criterios

- Membrete Vibra Music.
- Código `INF-YYYYMMDD-XXXX`.
- Periodo (`period_start` a `period_end`), tipo (mensual/trimestral/recital), página 1 de 2.
- Identidad: alumno, edad/categoría, instrumento, docente, sala, horario, fecha de inicio, plan.
- Nivel: nivel al inicio, nivel actual, progreso (subió/mantiene/refuerzo).
- Tabla de criterios: grupo, criterio, valor (color o número), comentario breve.
- Repertorio: pieza, compositor, estado (en proceso/dominada/presentada).
- Asistencia resumida: asistidas, faltas, justificadas, tardanzas, créditos de recuperación.

### 8.2 Página 2 — Resumen, metas y firmas

- Resumen narrativo: técnica + interpretación, logros, puntos a reforzar.
- Próxima meta del trimestre.
- Tarea o práctica sugerida en casa.
- “Antes/después”: nivel y repertorio al inicio vs. actual; enlace opcional a video.
- Observaciones del docente (1 párrafo).
- Firmas: Docente, Dirección/Secretaría, Apoderado.
- Pie: “Las clases no se pierden, se recuperan.”
- **Sin datos financieros.** Si se necesita, se adjunta la ficha financiera existente.

### 8.3 Formatos de salida

1. **PDF A4** (impresión del navegador, 2 páginas, sin cortes).
2. **Portal familia** (solo `published`).
3. **WhatsApp** (mensaje corto + enlace al portal/PDF).
4. **Markdown** para LLM/auditoría (`generateProgressReportMarkdown`).
5. **CSV** para administración (opcional).

### 8.4 Reglas de impresión

- Reutilizar `student-audit-report-dialog.tsx` y `src/components/ui/dialog.tsx` (ADR-0136/0137).
- Nada de `position: fixed`, `max-height` ni `overflow-y: auto` en el contenedor imprimible.
- `table-layout: fixed`, anchos porcentuales que sumen 100%, `word-break: break-word`.
- `S/` con espacio no separable (`S/\u00A0`) y `whitespace-nowrap` en montos.
- `print-page-break` entre página 1 y 2.
- Probar en Chrome y Edge, con “Guardar como PDF”.

---

## 9. UX propuesta (superficies)

### 9.1 Docente (`/teacher`)

Hoy `LessonNotes` está debajo del kiosco. Propuesta:

- **Pestaña “Registro de clase”**: seleccionar alumno (o venir desde su tarjeta), fecha automática, criterios con taps (semáforo o teclado numérico), repertorio, tema, estado, comentario corto. Guardar en 30–90 s.
- **Pestaña “Nota a la familia”**: el flujo actual, pero con historial y estado real.
- **Pestaña “Nota a Dirección”**: por alumno, persistida, con estado leído.
- **Pestaña “Informe”**: borrador del informe trimestral; el docente ve lo que ya registró, no empieza de cero.
- En la tarjeta de cada alumno: indicador “última evaluación: hace X días”, “nivel actual”, “repertorio acumulado”.

### 9.2 Administración (`/admin/alumnos`, `/admin/reportes`)

- Pestaña **“Notas”** existente: moderación de notas a familia.
- Nueva pestaña **“Informes”**: bandeja de borradores/pendientes/aprobados/publicados; filtros por docente, instrumento, periodo, estado.
- En la ficha del alumno (drawer / `StudentAuditReportDialog`): acceso a “Evaluaciones”, “Informes”, “Notas internas”.
- En `/admin/reportes`: columna “Último informe” y botón “Generar informe”.
- Configuración de criterios: pantalla simple para Dirección (instrumento, categoría, nivel, criterios, escala, orden).

### 9.3 Familia (`/family`)

Agregar pestaña **“Progreso”** (además de Inicio/Horario/Asistencias/Avisar):

- Informes publicados (lista por periodo).
- Último informe destacado: nivel, repertorio, resumen, próxima meta.
- Asistencia del periodo.
- Botón “Descargar PDF”.
- Botón “Enviar por WhatsApp” solo si hay informe publicado.
- **No** mostrar notas internas ni borradores.
- Mobile-first, botones de 44–56 px.

### 9.4 Impresión / exportación

- Botón “Imprimir / PDF” en el informe (admin y familia).
- Botón “Copiar Markdown” para LLM.
- Botón “Enviar WhatsApp” con mensaje prellenado.
- Botón “Descargar CSV” en la bandeja admin.

---

## 10. Integraciones y mapa de impacto (archivos)

| Área | Archivos | Cambio esperado |
|---|---|---|
| Nuevas tablas | `docs/migrations/` + script SQL | `CREATE TABLE` aditivo |
| Servicio de evaluaciones | `src/lib/services/evaluations.service.ts` (nuevo) | CRUD + fetch por alumno/periodo |
| Servicio de informes | `src/lib/services/progress-reports.service.ts` (nuevo) | CRUD + publicación + snapshot |
| Servicio de notas | `src/lib/services/teacher-notes.service.ts` | Refactor o reemplazo; dejar de usar `error_msg` como metadata |
| Store | `src/store/app-store.ts` | Añadir `lessonEvaluations`, `progressReports`, `internalNotes` solo si se necesita reactividad; preferir servicios + estado local |
| UI docente | `src/components/teacher/lesson-notes.tsx` | Separar en tabs; nuevo quick capture |
| UI admin moderación | `src/components/admin/teacher-notes-moderation.tsx` | Extender o crear `progress-reports-moderation.tsx` |
| UI admin widget | `src/components/admin/teacher-notes-approval-widget.tsx` | Mostrar también informes pendientes |
| Pestaña admin | `src/routes/admin.alumnos.tsx` | Nueva pestaña “Informes” |
| Dashboard | `src/routes/admin.index.tsx` | Widget de informes pendientes |
| Ficha alumno | `src/components/admin/student-audit-report-dialog.tsx` | Pestaña/sección “Progreso” o botón “Generar informe” |
| Reportes | `src/routes/admin.reportes.tsx` | Columna “Último informe” + filtro |
| Portal familia | `src/routes/family.tsx` + `family.progreso.tsx` (nuevo) | Nueva pestaña |
| Kid summary | `src/components/family/kid-summary.tsx` | Mostrar último informe publicado, no nota vieja |
| Impresión | `src/components/ui/dialog.tsx` | Reutilizar estilos print existentes |
| Motor de sesiones | `src/lib/kardex-calculator.ts` | Añadir helper de snapshot de asistencia para informe; no duplicar |
| Ciclo | `src/lib/student-cycle.ts` | Reutilizar `computeStudentCycle` |
| Sync | `src/hooks/use-insforge-sync.ts` | Fetch por rol de informes/notas; no bloquear asistencia |
| WhatsApp | `src/lib/services/whatsapp.service.ts` o componentes | Plantilla de informe |
| Laya | `src/lib/laya/*` | Opcional: consultas “¿cómo va mi hijo?”; no bloquear |
| Docs | `AGENTS.md` | Nuevo ADR cuando se implemente |

---

## 11. Restricciones no negociables (producción)

1. **No romper** el kiosco docente, la agenda, el Kardex, la asistencia, la facturación ni el portal familia.
2. **No** `DROP TABLE`, `TRUNCATE`, `DELETE` masivo ni migraciones destructivas.
3. **No** usar `localStorage` como fuente de verdad transaccional (ADR-0119). PostgreSQL manda.
4. **No** duplicar filtros de lecciones, cuotas, asistencias o ciclos (ADR-0119.3). Usar los motores existentes.
5. **No** hardcodear horarios, salas, docentes ni alumnos (ADR-0130).
6. **No** sobreescribir `students.notes` ni `teacherNote` sin una decisión explícita.
7. **No** publicar nada a familias sin moderación/aprobación.
8. **No** exponer datos de otra familia. Resolver por `family_id` y probar negativo.
9. **No** depender de `/api/assistant` ni de Functions: hoy responde 404 en producción (ADR-0170). Todo debe funcionar en cliente.
10. **No** confiar en `students.level` como nivel real.
11. **No** mezclar datos financieros con el informe pedagógico.
12. **Build gate:** `npm run build` local verde antes de cada push. No `git add -A`; commitear rutas explícitas.
13. **Mobile-first** en el portal familia; objetivos táctiles de 44–56 px.
14. **Español** en toda la UI; accesibilidad y contraste.
15. **Trazabilidad:** toda aprobación/publicación debe dejar auditoría (quién, cuándo, antes/después).

---

## 12. Riesgos y minas terrestres (específicos de esta base)

1. **`students.notes` está sobrecargado.** Aprobar una nota puede borrar “Blog Beneficios”, “Valor con Video” o la justificación de un precio especial. **No reutilizar ese campo.**
2. **`teacherNote` se usa como `customPriceReason`.** En `students-table.tsx` (~3272 y ~4400) el mismo campo guarda el motivo del precio. Colisión directa.
3. **`notification_logs` está vacío.** No construir la nueva moderación sobre esa tabla sin antes verificar por qué el INSERT falla. Mejor tabla nueva.
4. **Metadatos en `error_msg`.** Rechazar una nota destruye el JSON de metadatos. No repetir ese patrón.
5. **`privateNote` y `publicNote` no se persisten.** Cualquier diseño que los use debe arreglarlos o retirarlos.
6. **`teacherNotes` vive en `localStorage`.** Dos dispositivos pueden ver colas distintas. La nueva arquitectura debe leer de PostgreSQL.
7. **`students.level` es basura operativa.** 56/57 activos = “Principiante”. No usarlo para el informe.
8. **Homónimos reales.** `Mario Keffreen` (Guitarra) y `Mario Kefren` (Batería); `EMMA`; etc. Resolver por UUID.
9. **Intensivo = 2 bloques de 45 min.** El informe debe consolidar por fecha (90 min) y no contar doble (ADR-0162/0165/0173).
10. **Transiciones de instrumento.** `effectiveFrom`/`effectiveUntil` cambian instrumento, docente y sala. El informe debe atribuir cada sesión a la etapa correcta (ADR-0131).
11. **Cuotas y recuperaciones.** No contar asistencias a mano; usar `computeStudentCycleLiquidation` (ADR-0154).
12. **Filtros de visibilidad.** `dateStr`, `excludedDates`, `weekIndex`, `isMakeup`, `attendanceByDate`. Usar el motor, no una copia.
13. **Impresión en Radix.** Un `DialogContent` con `fixed`/`overflow` se imprime como viewport congelado. Reutilizar ADR-0136/0137.
14. **Hydration SSR (#418).** Cualquier fecha mostrada en SSR debe ser determinista o renderizarse solo en cliente. No introducir nuevas diferencias UTC/Lima.
15. **RLS/anon key.** La anon key está en el frontend. Las tablas nuevas deben tener RLS y pruebas negativas entre familias.
16. **Sync storms.** `useInsforgeSync` rehidrata alumnos/recibos/asistencias. No disparar sync completo por cada tecla del informe; usar debounce y guardado explícito.
17. **Docentes hardcodeados.** `teacherId` se resuelve por email (`jeremy`/`fernando`/`nathaly`) en `lesson-notes.tsx`. Usar IDs reales y no depender del email.
18. **Jeremy sin datos.** No inventar criterios ni rangos. Incluir levantamiento como fase 0.
19. **Doble escritura.** `approveTeacherNote` hace PATCH a `students.notes` y el componente llama a `updateStudentDetails`, que vuelve a escribir. Evitar duplicar.
20. **Documentación desactualizada.** `AGENTS.md` dice 13 activos; la base tiene 57. Verificar siempre contra PostgreSQL.

---

## 13. Criterios de aceptación (alto nivel)

### Registro de clase
- [ ] El docente puede registrar una clase en ≤ 90 segundos.
- [ ] La fecha se autocompleta; el alumno se elige de su lista (solo activos y solo sus alumnos).
- [ ] Los criterios se cargan según instrumento/categoría/nivel.
- [ ] La escala respeta al docente (semáforo 4 o 1–10).
- [ ] Se guarda en PostgreSQL y sobrevive a recarga y cambio de dispositivo.
- [ ] Se puede editar dentro de un plazo razonable y queda auditoría.

### Nota a la familia
- [ ] El docente envía; administración ve la nota en cualquier dispositivo.
- [ ] Aprobar publica en el portal; rechazar devuelve con motivo sin perder el contenido original.
- [ ] La familia ve solo la última nota aprobada/publicada de su hijo.
- [ ] No se sobreescribe `students.notes` legacy.
- [ ] WhatsApp solo se habilita si está aprobada.

### Nota a Dirección
- [ ] Es por alumno (o general), persistida, con autor y fecha.
- [ ] Dirección/Secretaría tienen una bandeja para leerla.
- [ ] La familia no la ve.
- [ ] No se pierde al recargar.

### Informe de progreso
- [ ] Se genera desde evaluaciones + motor de ciclos, sin recalcular a mano.
- [ ] Incluye nivel, criterios, repertorio, resumen, asistencia, próxima meta, tarea y firmas.
- [ ] Se puede editar antes de aprobar.
- [ ] Se aprueba y publica con auditoría.
- [ ] La familia lo ve solo si está publicado.
- [ ] Se imprime en A4, 2 páginas, sin cortes ni desplazamientos.
- [ ] Se exporta a Markdown y WhatsApp.
- [ ] No incluye datos financieros.

### No regresión
- [ ] Kiosco docente: marcar presente/ausente/tarde/justificada sigue funcionando.
- [ ] Agenda admin/docente: mismas clases, mismas fechas, sin duplicados.
- [ ] Kardex: mismas cuotas, mismos créditos, mismas transiciones.
- [ ] Facturación: mismos totales y recibos.
- [ ] Portal familia: horario, asistencia y avisos siguen funcionando.
- [ ] `npm run build` verde.

---

## 14. Plan de pruebas sugerido

### 14.1 Pruebas unitarias
- Mapeo semáforo ↔ banda normalizada ↔ 1–10.
- Carga de criterios por instrumento/categoría/nivel.
- Construcción del snapshot de asistencia desde `computeStudentCycleLiquidation`.
- Deduplicación de sesiones de 90 min (2 bloques → 1 fila).
- Atribución de sesiones a etapa de instrumento (`effectiveFrom`/`effectiveUntil`).
- Serialización Markdown del informe.

### 14.2 Pruebas de integración con PostgreSQL vivo
- Crear evaluación en “dispositivo A” (simulado) → leer en “dispositivo B”.
- Crear nota → aprobar → verificar `family_notes`/`students` y portal.
- Rechazar nota → verificar que el contenido original y los metadatos sobreviven.
- Crear informe → aprobar → publicar → verificar visibilidad por rol.
- Prueba negativa: familia A no ve alumno/informe de familia B.
- Prueba negativa: docente A no ve alumnos de docente B.
- Prueba negativa: borrador no visible a familia.

### 14.3 Pruebas de regresión
- Kiosco: marcar los 4 estados en una fecha; verificar `attendance_logs` y Kardex.
- Agenda: comparar admin vs. docente para un alumno con recuperación y transición.
- Kardex: verificar cuota exacta (8/4), makeups y bloques de 90 min.
- Facturación: totales y recibos sin cambios.
- Portal familia: horario, asistencia, avisos.

### 14.4 Pruebas de impresión y móvil
- Chrome/Edge “Guardar como PDF”: 2 páginas exactas, sin recortes, `S/` sin saltos.
- 375 px de ancho: botones táctiles, sin overflow horizontal.
- Safari iOS si es posible.

### 14.5 Pruebas de datos
- Alumno con homónimo: resolver por ID.
- Alumno con transición de instrumento: informe muestra dos etapas.
- Alumno intensivo: 4 sesiones de 90 min, no 8 de 45.
- Alumno con paquete flexible: 24 sesiones, no 8.
- Alumno con notas legacy en `students.notes`: no se borran.

---

## 15. Preguntas abiertas (decisiones del cliente)

> El planificador debe listarlas y no asumir respuestas.

1. **Piano Infantil:** ¿5 a 7 años (ficha de Nathaly) o 4 a 8 / 5 a 8 (documentos previos)? ¿Qué rango oficial usamos?
2. **Canto:** ¿Nathaly trabaja hasta 18+ inclusive? ¿Atiende también adultos mayores de 18? (Su ficha marca Master 18+).
3. **Fernando:** confirmar Violín 5–18+ y Piano 8–18+. ¿Atiende adultos?
4. **Jeremy:** falta todo el levantamiento (rangos, criterios, escala, cadencia, tiempo, repertorio, niveles, material).
5. **Escala:** ¿mostramos la escala original de cada docente o unificamos a semáforo? ¿Cómo mapeamos 1–10 a bandas?
6. **Frecuencia del informe:** ¿mensual, trimestral o “por recital”? ¿Todos los alumnos o solo quienes tienen recital?
7. **Quién aprueba:** ¿solo Dirección o también Secretaría? ¿Quién publica?
8. **Qué ve la familia:** ¿solo el informe periódico o también las notas de clase? Nathaly dice que los padres no valoran reportes semanales; Alex recomienda mensual/trimestral.
9. **Nota General:** ¿se mantiene el comunicado a todas las familias? Hoy no se persiste ni se muestra. ¿Se arregla o se elimina?
10. **Nota Privada:** ¿es por alumno o general? ¿Quién la lee? ¿Debe notificar a Dirección?
11. **Video “antes/después”:** ¿se sube archivo, se guarda enlace (YouTube/Drive) o solo un campo de texto?
12. **Datos financieros en el informe:** confirmar que **no** van (recomendación firme).
13. **`students.notes`:** ¿se deja como legacy de solo lectura o se migra a la nueva tabla? ¿Qué hacemos con “Blog Beneficios”, “Valor con Video”, etc.?
14. **Nivel:** ¿lo propone el docente, lo calcula el sistema o lo aprueba Dirección? ¿Cada cuánto se actualiza?
15. **Recitales:** ¿necesitamos una entidad “Recital/Evento” para anclar la entrega, o basta un campo de fecha/tipo en el informe?
16. **Idioma y tono:** ¿plantillas por docente? ¿Tuteo o usted? ¿Nombre del apoderado?
17. **Privacidad:** ¿la familia puede ver el detalle criterio por criterio o solo el resumen?
18. **Jeremy:** ¿guitarra clásica y eléctrica se evalúan igual? ¿Batería usa escala numérica o semáforo?

---

## 16. Anexo A — Formularios transcritos

### A.1 Ficha Nathaly — “Registro de avance por clase”

- Encabezado: Vibra Music · Academia de Música · Ficha para docentes · Levantamiento de criterios de evaluación · Base para el nuevo informe de progreso.
- Título: Registro de avance por clase.
- Subtítulo: Propuesta basada en la profesora Nathaly (Piano infantil). Se llena al terminar cada clase, en 1 minuto: qué se trabajó y qué repertorio se vio.
- Datos generales: Alumno/a, Docente, Categoría, Mes/quincena.
- Tabla: Clase/fecha · Digitación · ¿Cómo? · Repertorio de la clase · Temario/tema visto · Estado.
- Ejemplo: Mano derecha · Tocando · Los gatos negros · Ubicar Do-Re-Mi con la mano derecha · Logrado.
- Preguntas al pie: ¿esta hoja te sirve? Sí, así está bien / Sí, con cambios / Para Canto necesita otras columnas (respiración, afinación, letra...) / Para otro instrumento necesita otras columnas. Columnas que agregarías o quitarías.

### A.2 Ficha Nathaly — “Ficha de levantamiento para docentes”

- Datos del docente: nombre/fecha; instrumentos: Piano, Canto; categorías: Infantil (5 y 6), Junior (7 a 12), Master (18 a +).
- B1. Escala de colores: semáforo de 4 (los 3 anteriores + gris = todavía no corresponde a su nivel).
- B2. Cada cuánto: cada clase.
- B3. Tiempo: 3 a 5 min.
- B4. Comentario: 2 a 3 líneas, un párrafo, variado.
- B5. Qué le molesta: “Hacerlo anecdotario (muy largo). Reporte técnico es distinto a la clase”.
- Apuntes: Canto: relajación, respiración, proyección, apoyo diafragmático, lenguaje corporal, conducta-disposición. Piano Infantil: conducta-disposición, lenguaje musical, digitación, solfeo. “Dos manos es diferente a digitación”. Repertorio C1 - 10/20 / Tu fiel (1-10) / Su cortejo.

### A.3 Ficha Nathaly — “Metas por nivel y material”

- Instrumento: Canto.
- Inicial: conocer el teclado; manejo de figuras musicales; digitación correcta.
- Intermedio: manejo de digitación correcta; manejo de figuras musicales.
- Avanzado: manejo de notas; dinámica correcta; manejo de figuras musicales; conocer repertorio a dos manos; clave de fa y clave de sol.
- Qué cambia según edad/categoría: nivel de exigencia técnica y repertorio.
- Material: Libro 1 clases / Método Suzuki 1.

### A.4 Ficha Nathaly — “Habilidades que enseñas y evalúas”

- Técnica: postura corporal, digitación o técnica básica, posición de manos/dedos/agarre/embocadura, coordinación motriz, respiración y emisión, afinación, ritmo y pulso, dinámicas y articulación, escalas y arpegios, técnicas avanzadas.
- Lectura y teoría: ubicación de notas, figuras y silencios, lectura de partitura/tablatura, compases y tempo, acordes y armonía, teoría avanzada.
- Repertorio e interpretación: toca piezas completas, toca de memoria, toca con pista o acompañamiento, expresividad/interpretación, improvisación, presentación en público.
- Oído: entrenamiento auditivo, sacar canciones de oído.
- Actitud: concentración, práctica en casa, disposición y conducta, trabajo en grupo/ensamble.
- Apunte: “Debe estar separado Coro e individual”.

### A.5 Ficha Nathaly — “Para el alumno que cambia de escuela”

- C1. Datos indispensables: nivel actual, método o libro, si lee partitura, metas del siguiente trimestre, asistencia, piezas que ya domina, técnicas que domina, puntos a reforzar, fecha de inicio.
- C2. Qué no sirve: “Notas y logros”.
- C3. Qué preguntan los padres: “Que pueden tocar o tocar”.
- C4. Qué debería mostrar y hoy no: (en blanco).
- C5. Datos del alumno: foto, asistencia del periodo, logro destacado, observaciones finales, edad/categoría, próxima meta, tarea o práctica sugerida en casa.
- Firmas: docente / fecha de entrega.

### A.6 Ficha Fernando — “Registro de avance por clase”

- Misma plantilla que Nathaly.
- Ejemplo: Mano derecha · Tocando · Los gatos negros · Ubicar Do-Re-Mi con la mano derecha · En proceso.
- Apunte manuscrito: “...ando / Romero Chon” (cortado).

### A.7 Ficha Fernando — “Ficha de levantamiento para docentes”

- Instrumentos marcados: Guitarra, Violín, Piano, Flauta.
- Categorías: Junior (7–12), Juvenil (13–17), Master (18+).
- B1. Escala: “Otra escala: 1 AL 10”.
- B2. Cada cuánto: “SEMANAL”.
- B3. Tiempo: más de 10 min.
- B4. Comentario: 1 línea corta.
- B5. Qué le molesta: “Que no se entienda”.

### A.8 Ficha Fernando — “Habilidades que enseñas y evalúas”

- Ver tabla de la sección 3.2.
- Apunte: “( . ) = depende (Junior... ad.)”.

### A.9 Ficha Fernando — “Metas por nivel y material”

- Inicial: leer partituras básicas; técnico básico.
- Intermedio: técnica básica / intermedio.
- Avanzado: “Para nivel avanzado, suelen tomar clases particulares”.
- Qué cambia según edad/categoría: compromiso y disciplina.
- Libros/métodos: en blanco.
- Repertorio típico: en blanco.

### A.10 Ficha Fernando — “Para el alumno que cambia de escuela”

- C1. Datos indispensables: nivel actual, método o libro y página/unidad, si lee partitura o cifrado, técnicas que domina, fecha de inicio.
- C2. Qué no sirve: “Asistencia y constancia”.
- C3. Qué preguntan los padres: “Si es que ya tocan”.
- C4. Qué debería mostrar: “El compromiso de los estudiantes (si no hay avance en semanas, suele ser por falta de compromiso y disciplina del alumno)”.
- C5. Datos del alumno: foto, asistencia del periodo, edad/categoría, tarea o práctica sugerida en casa.

---

## 17. Anexo B — Audio de Nathaly (transcripción limpia)

### Audio 1 (00:35)

El informe académico se da cuando se hacen recitales para que los padres puedan verificar el progreso. Idealmente, los informes deberían entregarse en una reunión de padres o en un recital, o en su defecto en la semana de entregas. Esto se hace para que el padre pueda verificar que lo que dice el informe por escrito se refleje verdaderamente en la interpretación de su hijo en el escenario. De esta forma, el padre puede confrontar la información y darse cuenta de que no le están regalando la nota a su hijo. Esto también sirve para demostrar que los profesores están siendo objetivos con las calificaciones.

### Audio 2 (07:11)

En el aplicativo “My Music Staff”, al dar clic en el nombre completo del alumno, se encontraba información general como la fecha de inicio de clases, la edad y el tipo de alumno (infantil, amateur, etc.). Además del índice por apellido, el sistema tenía una opción de consolidado llamada “agenda”, donde se mostraban los horarios fijos semanales de cada profesor y sus alumnos. La secretaria tenía acceso a este consolidado y podía marcar las clases de recuperación, las cuales aparecían en otro color. Ese sistema de colores permitía saber qué horarios quedaban disponibles a la semana siguiente para poder venderlos a nuevos alumnos. Se menciona que el trabajo previo de Nayeri fue bueno porque se guio de los colores y leyendas del “My Music Staff” para marcar la disponibilidad. Los horarios regulares siempre quedaban fijos en el sistema todas las semanas, salvo que el alumno tuviera un evento especial y se tuviera que modificar o marcar. Al hacer clic en el horario de un alumno dentro de la agenda, se abría una pestaña de “observaciones” o “avances de status” específica de esa clase. En esa pestaña se podían configurar criterios de evaluación internos; por ejemplo, en canto se evaluaba el lenguaje corporal, la respiración y la proyección de voz. Esas observaciones diarias indicaban el repertorio exacto que se trabajó ese día (por ejemplo, una canción de Mon Laferte) y esta información se recopilaba como en un Excel para entregarla a Alex. Para el informe académico general se usaba otra aplicación llamada “Informes Vibra Music”, donde se registraba el desempeño y el nivel del alumno (básico, avanzado, etc.). Aunque existía la opción de hacer el informe quincenal, Alex recomendó hacerlo mensual o cada tres meses. La razón de espaciar los informes es que los alumnos varían su nivel cada tres meses; si se hace muy seguido, el alumno siempre aparecerá en el mismo nivel, pero en tres meses se le da la oportunidad de pasar de básico a intermedio o avanzado. El informe académico consta de varios aspectos: el avance (repertorio), la técnica (teoría, lectura musical, respiración) y un resumen final. El resumen final une la técnica con la interpretación, detallando si el alumno ya maneja piezas complejas o tiene dominio escénico. Al entregar este informe espaciado, el padre puede ver un avance real con un repertorio acumulado de hasta 10 canciones. A los padres no les interesan los reportes semanales con poco avance; ellos quieren ver el cambio radical de cómo llegó el niño a cómo está actualmente para saber si vale la pena la inversión. Finalmente, se sugiere que a este proceso le haría falta complementarse con un video de un “antes y después” del estudiante.

---

## 18. Anexo C — Evidencia técnica (consultas y archivos)

### C.1 Consultas PostgREST ejecutadas (solo lectura, 2026-10-21)

- `students?select=*&limit=1` → columnas reales.
- `students?select=id` con `Prefer: count=exact` → `0-145/146`.
- `students?select=id&status=eq.activo` → `0-56/57`.
- `students?select=id&status=eq.pausa` → `0-56/57`.
- `students?select=id&status=eq.baja` → `0-31/32`.
- `families?select=id` → `0-154/155`.
- `attendance_logs?select=id` → `0-300/301`.
- `notification_logs?select=id` → `*/0`.
- `notification_logs?select=id,recipient_type,recipient_id,channel,subject,body,sent_by,status,error_msg,sent_at&limit=1` → 200, 0 filas (columnas existen).
- 13 nombres de tablas de evaluación/informes → 404.

> Nota: la anon key puede leer `students` y `attendance_logs`. Si `notification_logs` tuviera RLS restrictivo, un 0 no probaría que la tabla esté vacía. Aun así, el servicio usa la misma key y obtendría 0; el flujo cross-device seguiría roto. Verificar con rol de servicio antes de decidir.

### C.2 Archivos y líneas clave

- `src/components/teacher/lesson-notes.tsx:251–259` — tabs “Nota a la Familia” / “Nota Privada”.
- `src/components/teacher/lesson-notes.tsx:548–571` — nota privada (solo estado global).
- `src/components/teacher/lesson-notes.tsx:574–621` — historial de notas.
- `src/lib/services/teacher-notes.service.ts:43–44` — `localStorage` key y canal.
- `src/lib/services/teacher-notes.service.ts:144–161` — INSERT en `notification_logs` con `error_msg` JSON.
- `src/lib/services/teacher-notes.service.ts:245–308` — aprobación (PATCH `notification_logs` + `students.notes`).
- `src/lib/services/teacher-notes.service.ts:313–364` — rechazo (sobreescribe `error_msg`).
- `src/store/app-store.ts:124` — `privateNote`.
- `src/store/app-store.ts:604` — `teacherNote` → `students.notes`.
- `src/store/app-store.ts:1386` — `setNote`.
- `src/store/app-store.ts:3790–3804` — `partialize` (no incluye `privateNote`/`publicNote`).
- `src/store/app-store.ts:2597` — `markLessonAttendance` (acepta `notes`, pero el kiosco no lo usa).
- `src/store/app-store.ts:2726` — `setStudentSessionAttendance`.
- `src/components/family/kid-summary.tsx:52–73` — resolución de nota aprobada.
- `src/routes/admin.alumnos.tsx:34,173` — pestaña “notas”.
- `src/routes/admin.index.tsx:149` — widget de aprobación.
- `src/routes/teacher.index.tsx:594–597` — `LessonNotes` en el kiosco.
- `src/routes/family.tsx:132–136` — pestañas del portal familia.
- `src/lib/services/students.service.ts:70–184` — mapeo DB → `AdminStudent`.
- `src/hooks/use-insforge-sync.ts:39–60` — roles y sync.
- `src/lib/kardex-calculator.ts:58–81` — `StudentSessionItem`.
- `src/lib/kardex-calculator.ts:197,462` — motores de sesiones.
- `src/lib/kardex-calculator.ts:1278` — `generateStudentAuditMarkdown`.
- `src/components/admin/student-audit-report-dialog.tsx` — A4 2 páginas.
- `src/components/admin/students-table.tsx:2076–2088` — editor de `teacherNote`.
- `src/components/admin/students-table.tsx:3272,4400` — `teacherNote` como `customPriceReason`.

---

## 19. Anexo D — Glosario

- **Bitácora / registro de clase:** evaluación rápida de una sesión.
- **Informe de progreso:** documento periódico (mensual/trimestral) para la familia.
- **Marco de evaluación:** conjunto de criterios por instrumento/categoría/nivel.
- **Criterio:** habilidad evaluable (ej. respiración, digitación).
- **Escala:** semáforo 4 o numérica 1–10.
- **Nivel pedagógico:** Iniciación, Inicial, Intermedio, Avanzado.
- **Categoría de edad:** Estimulación, Infantil, Junior, Juvenil, Master.
- **Ciclo:** periodo contractual de clases (8 regulares / 4 intensivas / paquete flexible).
- **Crédito de recuperación:** derecho generado por una falta; “las clases no se pierden, se recuperan”.
- **Transición de instrumento:** cambio de curso con `effectiveFrom`/`effectiveUntil`.
- **Bloque contiguo:** dos sesiones de 45 min que forman 90 min de Plan Intensivo.
- **Publicado:** visible para la familia; **aprobado:** validado internamente pero aún no visible.

---

## 20. Anexo E — Prompt listo para Claude Opus 5.5

> Copiar y pegar junto con este documento.

```text
Actúa como arquitecto de software senior y planificador técnico de un sistema en producción.

CONTEXTO:
- Producto: "Vibra Music Staff" (TanStack Start / React 19 / TypeScript / Tailwind / Zustand / PostgreSQL Insforge vía PostgREST / Cloudflare Pages).
- Está en producción con 146 alumnos (57 activos), 155 familias, 301 registros de asistencia.
- Hay un motor de asistencia, agenda, Kardex, ciclos y facturación que NO se puede romper.
- El documento adjunto "BRIEF_INFORMES_PROGRESO_2026_10.md" contiene la auditoría completa, los requerimientos de los docentes, las restricciones y las minas terrestres.

OBJETIVO:
Diseñar un plan de implementación incremental para un sistema de:
1) registro de clase por evaluación estructurada,
2) notas a la familia con moderación,
3) notas internas a Dirección,
4) informes de progreso periódicos con PDF A4, portal familia, WhatsApp y Markdown para LLM.

REGLAS:
- No reescribir el sistema. Cambios quirúrgicos y aditivos.
- No tocar el motor de asistencia/agenda/Kardex/facturación sin plan de regresión.
- No usar localStorage como fuente de verdad.
- No duplicar lógica de filtros, cuotas, ciclos o deduplicación: reutilizar `kardex-calculator.ts` y `student-cycle.ts`.
- No inventar criterios de Jeremy: incluir una fase de levantamiento.
- Toda migración debe ser `CREATE TABLE` / `ADD COLUMN` nullable; nada destructivo.
- Respetar RLS y alcance por familia.
- El plan debe poder ejecutarse por fases, cada una con build verde y rollback.

ENTREGABLES QUE NECESITO:
1. Diagnóstico en 10 bullets de lo que está mal hoy y por qué.
2. Decisión de arquitectura de datos (Opción A, B o C del brief) con justificación.
3. Modelo de datos final (SQL propuesto, tablas, columnas, índices, RLS).
4. Plan por fases (0 a N), con:
   - objetivo de la fase,
   - archivos exactos a crear/modificar,
   - migraciones,
   - UI/UX,
   - criterios de aceptación,
   - pruebas,
   - rollback.
5. Orden de implementación que minimice riesgo en producción.
6. Lista de preguntas abiertas que deben responderse antes de codificar.
7. Riesgos específicos y mitigaciones.
8. Estimación relativa (S/M/L) por fase, sin prometer fechas.
9. Un "Definition of Done" verificable.
10. Un checklist de regresión para el kiosco docente, agenda, Kardex y facturación.

FORMATO:
- Markdown.
- Tablas cuando ayuden.
- Sin código de implementación todavía; solo plan, SQL de migración y contratos de datos.
- Sé explícito cuando algo sea supuesto y márcalo como "SUPUESTO".
```

---

## 21. Cierre

Este documento no propone una implementación. Deja el terreno masticado para que el planificador decida con evidencia:

- Lo que existe y funciona.
- Lo que existe y está roto o es un placeholder.
- Lo que los docentes realmente pidieron.
- Lo que la base de datos realmente tiene.
- Lo que no se puede tocar.
- Las preguntas que Dirección debe responder antes de escribir código.

**Siguiente paso recomendado:** revisar la sección 15 (preguntas abiertas) con Dirección y los tres docentes, y recién después pedir el plan a Claude Opus 5.5.
