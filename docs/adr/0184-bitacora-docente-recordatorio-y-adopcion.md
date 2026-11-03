# ADR-0184: Bitácora Docente — Estado "Ya Registrada", Recordatorio a 2 Días y Tablero de Adopción

**Fecha:** 2026-11-03
**Estado:** Implementado y verificado con datos vivos de producción.
**Autores:** Equipo Vibra (Open Code & Dirección)
**Versión:** 2.0.55
**Relación:** ADR-0183 (§86), ADR-0175, ADR-0180, ADR-0182, ADR-0179, ADR-0140, ADR-0177

---

## Contexto

ADR-0183 resolvió la nomenclatura (Informes Pedagógicos vs. Auditoría de Alumnos) y la fricción visual del botón. Pero la medición en producción demostró que el problema no era la UI sola:

| Métrica verificada (2026-11-03) | Valor |
|---|---|
| `lesson_evaluations` (`is_test = false`) | **3** (una por docente: Jeremy 23/10, Fernando 22/10, Nathaly 21/10) |
| `progress_reports` | **0** |
| Días hábiles sin registrar al momento de esta decisión | Jeremy 9, Fernando 10, Nathaly 11 |

El docente no tenía motivo visible ni meta alcanzable; Dirección no tenía forma de acompañar.

### Decisiones de Dirección (cerradas)

| # | Decisión |
|---|---|
| D1 | Contador de avance `3/8`: **autorizado** (import de lectura de `computeStudentCycleSessions`) |
| D2 | Guía para docentes: **NO SE HACE** (el propio botón enseña) |
| D3 | Recordatorios de fichaje/puntualidad: **FUERA DE ALCANCE** (la empresa ya tiene su política) |
| D4 | Disparador: **2 días hábiles sin bitácora** |
| D5 | Canal: **in-app + `wa.me`** (costo cero) |
| D6 | Destinatario: **el propio docente** |
| D7 | Emisor: persona de Dirección hace clic y envía |

---

## Decisiones técnicas

### 1. Teléfonos del personal en la fuente única, no en `users.phone`

**Hallazgo:** los UUID de `TEACHER_IDS` son sintéticos (`00000000-...0003`), no usuarios de auth. La tabla `users` **no está expuesta por PostgREST** (404 en GET y PATCH). Los teléfonos que contenía (`9876543XX`) eran ficticios.

**Decisión:** `TEACHER_PHONES` en `src/lib/services/teacher-resolver.ts`, junto a `TEACHER_IDS` y `KNOWN_IDENTITIES`.

| Docente | `wa.me` |
|---|---|
| Jeremy | `51980308142` |
| Nathaly | `51959387858` |
| Fernando | `51983408944` |

- Función `resolveTeacherPhoneById(id)` y `resolveTeacherPhone(email, name)`.
- `toWhatsAppNumber(raw)`: normaliza a solo dígitos con `51`, exige 9 dígitos empezando en `9`; devuelve `null` si no cumple (nunca inventa un número).
- **Sobre "encriptar":** no se cifran. El navegador debe descifrarlos para armar `wa.me`, así que cifrarlos daría seguridad aparente. Son números de contacto **profesional**, ya publicados en el WhatsApp Business de la escuela y en las invitaciones. **Prohibido** poner aquí contraseñas o tokens.

### 2. Motor puro de recordatorios (`src/lib/informes/teacher-reminders.ts`)

- `REMINDER_THRESHOLD_WORKDAYS = 2`.
- `isWorkday()`: lunes a sábado. **Domingo no cuenta** (la escuela no dicta).
- `countWorkdaysBetween(from, to)`: fechas construidas en **local** (`new Date(y, m-1, d)`), no `new Date("YYYY-MM-DD")`, para evitar el desfase UTC (lección de ADR-0150).
- `computeTeachersNeedingReminder(evaluations, teachers, today)`.
- `buildTeacherReminderMessage()` y `buildTeacherReminderWhatsAppUrl()`.
- Función **pura, sin red, sin estado**, testeable.
- Si el docente **nunca** registró (`lastEvaluationDate = null`), `needsReminder` queda en `false`: no se inventa antigüedad ni se le reclama desde cero.
- **No evalúa fichaje ni puntualidad** (D3).

### 3. Hook de sesiones ya registradas (`src/hooks/use-session-evaluations.ts`)

- Usa **`getStudentEvaluations`**, que filtra `is_test = eq.false` por defecto.
- **PROHIBIDO `getEvaluationBySessionKey`**: no filtra `is_test` (§86.6) y marcaría como real una bitácora de prueba.
- Clave determinista `sessionEvaluationKey()` = `YYYY-MM-DD::HH:MM`.
- **Una consulta por alumno y rango**, no una por tarjeta (evita N+1 en celular).
- Cualquier error ⇒ mapa vacío y el Kiosco sigue funcionando.

### 4. Kiosco docente (`/teacher`)

Tres estados del botón de bitácora:

| Situación | Etiqueta | Estilo |
|---|---|---|
| Ya registrada | `✓ Bitácora registrada · Ver / Editar` | Verde suave |
| Pendiente y `presente` | `📝 Llenar bitácora de hoy (2 min)` | Realce naranja estático |
| Pendiente, otro estado | `📝 Bitácora de clase` | Suave |

- `onSaved` refresca el set de evaluaciones además de cerrar la hoja.
- Sin `animate-pulse` (ADR-0183). `min-h-[44px]` conservado (ADR-0177).

### 5. Tablero de adopción (`TeacherAdoptionPanel`)

- Pestaña **"Adopción Docente"** en `/admin/informes`.
- Docentes resueltos **solo** desde `TEACHER_IDS` + `resolveTeacherNameById` (§86.7). Prohibido hardcodear nombres.
- Columnas: bitácoras, última fecha, semáforo (`🟢 Al día` / `🔴 N días`), acción.
- Acción: `📲 Recordar` abre `wa.me` con el mensaje personalizado; si no hay teléfono válido muestra `⚠ Sin teléfono` deshabilitado.
- **Cero datos financieros.** Sin fichaje ni puntualidad.

---

## Limitación conocida y documentada

`getEvaluationsSummaryMap` **no expone el UUID del docente**, solo `lastTeacherName`. Por eso el motor resuelve al docente por **nombre normalizado** como fallback, y el conteo de bitácoras por docente es una **aproximación honesta** (suma de las bitácoras de los alumnos cuyo último registro fue de ese docente).

- No se inventó un campo que el servicio no tiene.
- Cuando exista un servicio que agregue por `teacher_id`, debe migrarse a UUID estricto.
- La **detección de "2 días sin bitácora"** es correcta para el caso real (3 bitácoras, 3 docentes distintos).

---

## Verificación

Prueba en runtime con datos vivos (`scratch/test-adopcion-docente.mjs`, `vite.ssrLoadModule`):

```
alumnos con bitácora: 3
 - 80216a77 | 1 | 2026-10-23 | Jeremy
 - f700e1d8 | 1 | 2026-10-22 | Fernando
 - 9a7a4c76 | 1 | 2026-10-21 | Nathaly

=== TABLERO hoy 2026-11-03 ===
Jeremy    last:2026-10-23  habiles:9   recordar:true  tel:51980308142
Fernando  last:2026-10-22  habiles:10  recordar:true  tel:51983408944
Nathaly   last:2026-10-21  habiles:11  recordar:true  tel:51959387858

MENSAJE:
Hola Jeremy, te escribimos de Vibra Music. Vemos que hace 9 días no registras
la bitácora de clase. Recuerda que toma 2 minutos por alumno y que la
necesitamos para poder emitir el informe del ciclo. Gracias.
```

Casos de borde verificados:
- Domingo no cuenta como día hábil (vie → lun = 2).
- `toWhatsAppNumber("+51 980 308 142")` → `51980308142`.
- Docente sin teléfono → `buildTeacherReminderWhatsAppUrl()` devuelve `null` (botón deshabilitado).

`npm run build` en verde. `app-store.ts`, `kardex-calculator.ts` y `student-cycle.ts` **sin cambios** (`git diff --stat` vacío).

---

## Riesgos residuales

1. **El contador `3/8` (D1, Fase A.2) no se implementó en este ADR.** Requiere `computeStudentCycleSessions` por alumno; se deja para una fase siguiente para no mezclar dos cambios de riesgo distinto en un solo commit. El estado "✓ Bitácora registrada" ya está operativo.
2. **El envío no es automático.** `wa.me` abre WhatsApp en el dispositivo de quien hace clic. Envío 100% automático desde el WhatsApp Business central exigiría Cloud API + plantilla aprobada por Meta + costo por mensaje, y contradice ADR-0140. Queda como ADR futuro si Dirección lo pide.
3. **`notification_logs` no se escribió.** Está disponible (verificada: existe, 0 filas) para auditar envíos cuando se implemente el registro.
4. **Mejora operativa urgente:** los docentes con 9-11 días sin bitácora deben ser contactados hoy; el software ya expone el botón, pero no sustituye la conversación.
