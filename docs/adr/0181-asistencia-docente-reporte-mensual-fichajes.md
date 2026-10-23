# ADR-0181: Reporte Mensual de Asistencia Docente por Perfil (Fichajes, Días sin Marcaje y Constancia Descargable)

**Fecha:** 2026-10-23
**Estado:** Implementado. Verificado en runtime con datos vivos (58/58). Sin cambios de esquema ni de datos.
**Autores:** Equipo Vibra (Open Code)

---

## Contexto

En la liquidación de **setiembre 2026** se descontaron **S/ 400** a la
**Prof. Nathaly** por inasistencias que, al revisar la base, no existían: sus
fichajes estaban completos en `teacher_time_logs`. El descuento se sustentó en
una lectura parcial del historial, no en un reporte oficial verificable.

El problema de fondo era doble:

1. **No existía un documento de asistencia por persona.** El panel
   `/admin/control-horario` mostraba un kardex agregado de "profesores en sede",
   pero no un reporte mensual descargable por perfil, con entradas, salidas,
   total de horas y días sin marcaje.
2. **Los meses antiguos "desaparecían" de la vista.** `getTeacherTimeLogs`
   aplicaba un `limit` bajo antes de filtrar por mes en el cliente, y el mes por
   defecto era el actual. Setiembre no estaba perdido en la base: estaba fuera
   del recorte de la consulta.

Además, el docente no tenía forma de verificar su propia asistencia. La sección
"Cierre de Nóminas" del portal docente existía pero estaba vacía, y **Fabricio
(Marketing)** nunca había usado el marcador, aunque su invitación y su rol ya
estaban activos.

Dirección fijó las reglas que gobiernan todo el diseño:

> **Transparencia total:** el docente debe ver sus fichajes **y también los días
> que no marcó**, marcados como "Por regularizar".
> **Un solo total de horas.** Prohibido el concepto "depurado": las incidencias
> se marcan en su fila, no se esconden ni se restan en silencio.
> **Cero soles en el reporte del docente.** La valorización económica es
> exclusiva de Dirección.

---

## Decisión

### 1. Un solo motor de cálculo (`src/lib/asistencia-docente.ts`)

Todo el reporte —pantalla, CSV, Markdown, WhatsApp y A4— sale de **un único
módulo**. Queda **PROHIBIDO** reimplementar el cálculo de horas, la detección de
incidencias o el formato en un componente (ADR-0119.3).

Exporta:

- **Roster oficial de perfiles con ficha** (`ATTENDANCE_PROFILES`): Rocío,
  Jackeline/Nayeli, Sergio, Karla, Nathaly, Jeremy, Fernando, Fabricio y
  "Turnos sin identidad" (`...0006`, que se oculta si no tiene fichajes).
- `resolveProfileForShift(teacher_id, teacher_name)`: resuelve el perfil de un
  turno histórico aunque el nombre haya cambiado (`"Nathaly (Canto y Piano)"`,
  `"Profesora Nathaly"`, `"Profesor/a Vibra"` → sin identidad).
- `resolveProfileForIdentity(email, name)`: resuelve la sesión activa por
  **alias de email/nombre**. No usa `resolveTeacherUserId`, que devuelve DEMO a
  todos salvo Jeremy/Fernando/Nathaly.
- `buildMonthlyAttendance(...)`: turnos del mes, incidencias, días asistidos,
  días con clase sin marcaje y totales.
- `buildAttendanceCSV`, `buildAttendanceRosterCSV`, `buildAttendanceMarkdown`,
  `buildAttendanceWhatsApp`, `buildAttendancePrintHtml`.

### 2. Horas siempre en `America/Lima`

`limaDateKey`, `limaMonthKey`, `limaTimeHM`, `limaTodayKey`, `limaMonthRange`
usan `Intl` con `timeZone: "America/Lima"`. Nunca la zona del navegador ni la del
servidor (PostgreSQL corre en GMT). Un fichaje de las 20:30 Lima (01:30Z del día
siguiente) cuenta en su día real.

### 3. Los minutos oficiales son los persistidos

`computeShiftMinutes` **prioriza `total_minutes_worked`** y solo cae al diff de
timestamps cuando el registro es antiguo y no lo guardó. Motivo medido: el
`floor` del diff pierde hasta un minuto por turno; en setiembre de Nathaly eran
**9 minutos menos** (3899 vs 3908). El total persistido es el registro con el que
se liquidó el turno.

### 4. Incidencias: se muestran, no se suman, no se corrigen

| Incidencia | Regla |
|---|---|
| `sin_salida` | Turno abierto (`clock_out` nulo) |
| `duracion_inusual` | Más de 14 h continuas (falta de cierre) |
| `sin_minutos` | 0 minutos registrados |
| `duplicado` | **Solo el par que realmente se superpone** |

`duplicado` se marca por pares, no por jornada: dos turnos separados el mismo día
son **jornada partida válida** y suman sus horas; un turno real de 4 h que
convive con dos micro-marcajes solapados del kiosco sigue siendo válido.

Todas las incidencias aparecen en su fila **entre paréntesis** y no engrosan el
total. El mensaje es explícito: *"No se ha corregido nada en silencio"*.

### 5. Días con clase sin marcaje (`projectScheduledDates`)

El reporte proyecta los días del mes en que el alumno tenía clase (desde
`emergency_contact.scheduleLessons` de los alumnos activos) y lista los que **no
tienen entrada registrada** como **"Por regularizar"**. Se presentan como
recordatorio, nunca como sanción, y solo hasta la fecha de corte (`todayKey`) —
nunca días futuros.

### 6. Cero montos

Ni el reporte del docente, ni el CSV, ni el Markdown, ni el consolidado de
Dirección contienen `S/`, "soles", descuentos ni valorización. El pie lo declara:
*"No incluye información económica ni descuentos: es tu constancia de horario"*.
La valorización económica es exclusiva de Dirección, fuera de este módulo.

### 7. Descarga por mes, para cada perfil

- **Docente** (`/teacher/nomina`, pestaña **"Asistencia"**): solo lectura, sobre
  su propio perfil, con selector de mes/año, KPIs, fichajes del mes, días por
  regularizar y descargas **PDF/A4 · Excel (.CSV) · Markdown · Copiar resumen**.
- **Dirección** (`/admin/control-horario`, pestaña **"Asistencia por Perfil"**):
  KPIs consolidados del mes, tabla de los 9 perfiles con turnos, horas, días,
  incidencias y días por regularizar, **CSV/PDF por perfil** y **Consolidado
  (.CSV)**, más el detalle de cualquier perfil.
- **Secretaría y Marketing** ven su propio reporte desde su sesión, igual que los
  docentes: la identidad se resuelve por email, no por rol.

### 8. El marcador funciona para Marketing

Fabricio ya tenía invitación activa y rol `teacher`; el kiosco le permite fichar
como a cualquier docente. Sus turnos se resuelven por su UUID y aparecen en su
propio reporte y en el consolidado de Dirección.

---

## Verificación

`scratch/test-asistencia-docente.mjs` — **58/58** con datos vivos de Insforge
(solo lectura):

- Identidad: 9 casos de email → perfil, incluido el negativo (desconocido no
  adivina perfil).
- **Nathaly · setiembre:** 20 turnos, 18 válidos, 2 incidencias, **3908 min =
  65h 08m**, 20 días, 6 por regularizar.
- Fabricio: 6 turnos, 2 válidos, **8h 00m**. "Turnos sin identidad": 5 turnos,
  **18h 48m**, ninguno atribuido a Nathaly.
- Proyección de faltantes: `missingDates ⊆ scheduledDates`, ningún día con
  fichaje figura como faltante, ningún faltante es futuro.
- Jornada partida (2 franjas separadas = 240 min) vs. solapamiento real (ambos
  marcados, 0 min) vs. micro-marcajes + turno real (el turno real sigue válido).
- Turno abierto → `sin_salida`, no suma.
- CSV/Markdown/consolidado **sin `S/` ni "soles"**, con "Por regularizar".
- Fechas Lima con turno nocturno 20:30–21:30.

**Consolidado real de setiembre 2026** (idéntico en pantalla, CSV y arnés):

| Perfil | Turnos | Válidos | Incid. | Horas | Días | Por regularizar |
|---|---|---|---|---|---|---|
| Karla (Secretaría) | 3 | 2 | 1 | 8h 00m | 2 | 0 |
| Nathaly (Canto y Piano Infantil) | 20 | 18 | 2 | **65h 08m** | 20 | 6 |
| Jeremy (Guitarra y Batería) | 22 | 16 | 6 | 61h 06m | 18 | 8 |
| Fernando (Violín y Piano) | 14 | 13 | 1 | 47h 14m | 13 | 12 |
| Fabricio (Marketing) | 6 | 2 | 4 | 8h 00m | 2 | 0 |
| Turnos sin identidad | 5 | 5 | 0 | 18h 48m | 5 | 0 |

Verificado en el navegador (sesión local simulada, sin escribir en producción):
`/teacher/nomina` muestra **65h 08m** para setiembre y `/admin/control-horario` →
"Asistencia por Perfil" reproduce la misma tabla.

---

## Consecuencias

- **La asistencia deja de ser opinable.** Antes de cualquier descuento, Dirección
  descarga el reporte del mes del perfil y ve exactamente qué se marcó y qué no.
- **El docente puede reclamar con evidencia**: su constancia no incluye montos,
  así que no expone información económica ni sirve de base para descuentos.
- Los registros con incidencia **no se limpian automáticamente**: requieren
  regularización explícita de Dirección. Es deuda operativa conocida (turnos sin
  cierre de Jeremy, micro-fichajes de prueba de Fabricio del 12/09).
- Se sigue usando `time_logs_anon_access = true` en el aislamiento por perfil
  del cliente. El riesgo de RLS abierta está documentado y **no se tocó**.

### Fuera de alcance (pendiente)

- La función `generate_payroll_hours_report` (cierre contable) **no se usa** para
  este reporte: su cálculo truncaba minutos y su corrección queda como migración
  `012` aparte, que depende del mismo acceso SQL que la `011`.
- No se agregó ni modificó ninguna tabla ni columna.

---

## Referencias

- `src/lib/asistencia-docente.ts` — motor único.
- `src/components/teacher/teacher-attendance-report.tsx` — UI compartida
  (docente y Dirección) y descargas.
- `src/routes/teacher.nomina.tsx` — pestaña "Asistencia" del docente.
- `src/routes/admin.control-horario.tsx` — pestaña "Asistencia por Perfil".
- `src/lib/services/time-tracking.service.ts` — `getTeacherTimeLogs` con rango
  server-side y `computeTeacherMonthlySummary` con Jackeline/Nayeli y Rocío.
- `scratch/test-asistencia-docente.mjs` — arnés de verificación vivo.
