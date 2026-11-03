# PLAN OPERATIVO: BITÁCORA DOCENTE, RECORDATORIO ANTI-BLOQUEO Y TABLERO DE ADOPCIÓN

**Fecha:** 2026-11-03
**Versión base:** 2.0.54 (commit `7a0299e`)
**Estado:** APROBADO por Dirección. Frente A y Fase 3 autorizados. Pendiente paso 0 (teléfonos reales).
**Relación:** ADR-0183 (§86), ADR-0175, ADR-0180, ADR-0182, ADR-0140, ADR-0179

---

## 1. DECISIONES TOMADAS POR DIRECCIÓN (cerradas, no re-litigar)

| # | Decisión | Valor |
|---|---|---|
| D1 | Contador de avance | **SÍ** — se muestra `3/8`. Se autoriza importar `computeStudentCycleSessions` **solo en lectura**. |
| D2 | Guía para docentes | **NO SE HACE.** Nadie la pidió. El propio botón enseña. |
| D3 | Recordatorios de fichaje | **FUERA DE ALCANCE.** La empresa ya tiene política de asistencia y puntualidad fuerte. No se duplica. |
| D4 | Disparador del recordatorio | **2 días seguidos sin llenar bitácora.** |
| D5 | Canal | **In-app (campanita) + `wa.me`** con mensaje personalizado. Costo cero. |
| D6 | Destinatario del WhatsApp | **Al propio docente** (opción A). |
| D7 | Emisor del WhatsApp | Se abre WhatsApp con el mensaje ya escrito; **una persona de Dirección hace clic** y envía. |

### D7 explicado honestamente (importante)

`wa.me` es un enlace: **no puede enviar desde un número distinto al del dispositivo donde se hace clic**. Por eso el flujo real es:

```
Sistema detecta "2 días sin bitácora"
        ↓
Genera aviso in-app + prepara texto personalizado
        ↓
Dirección ve el aviso en el tablero
        ↓
Clic en "📲 Recordar por WhatsApp"  →  wa.me/51XXXXXXXXX?text=<mensaje>
        ↓
Se abre WhatsApp de Dirección con el mensaje ya redactado → envía
```

**Envío 100% automático desde el WhatsApp Business central exigiría** la Cloud API oficial de Meta (ADR-001.1) + una plantilla aprobada por Meta + un servidor que dispare envíos + costo por mensaje. Eso **contradice ADR-0140 (costo cero)** y queda **FUERA DE ALCANCE** de este plan. Si Dirección lo quiere después, es un ADR nuevo.

---

## 2. PASO 0 — BLOQUEANTE PREVIO (sin código)

### 2.1 Hallazgo real verificado en `users` (2026-11-03)

| Docente | UUID | `phone` actual | ¿Real? |
|---|---|---|---|
| Fernando | `...0004` | `987654323` | ❌ Ficticio |
| Jeremy | `...0003` | `987654322` | ❌ Ficticio |
| Nathaly | `...0005` | `987654324` | ❌ Ficticio |
| Profesor Demo | `...0006` | `987654325` | ❌ Ficticio |

**Los 4 teléfonos son de relleno** (`9876543XX`). Si se construye el botón `wa.me` hoy, los recordatorios irían a números inexistentes.

### 2.2 Acción obligatoria antes de la Fase 2

Dirección/Secretaría debe actualizar el `phone` real de cada docente en `users`, con formato `51` + 9 dígitos (ej. `51987654322`).

- Sin este paso, el Frente B se construye pero **se muestra deshabilitado** con aviso `⚠ Sin teléfono registrado`.
- Prohibido inventar o hardcodear números.
- Prohibido usar el teléfono del apoderado del alumno: es dato de una familia, no del docente.

---

## 3. FRENTE A — CÓDIGO: KIOSCO DOCENTE (`/teacher`)

### A.1 Estado "✓ Ya registrada"

**Problema:** el docente no sabe si esa sesión ya la registró. El guardado es idempotente por `session_key`, pero eso es invisible.

**Solución:**
- Hook nuevo `src/hooks/use-session-evaluations.ts`:
  - Llama a **`getStudentEvaluations(studentId, { from, to })`** (`evaluations.service.ts:253`).
  - **Obligatorio usar esta función**: filtra `is_test = eq.false` por defecto.
  - **PROHIBIDO** usar `getEvaluationBySessionKey`: **no filtra `is_test`** (ver §86.6). Si se usara, una bitácora de prueba aparecería como real.
  - Devuelve `Map<sessionKey, LessonEvaluationRow>`, clave `${session_date}::${start_time.slice(0,5)}`.
  - **Una consulta por alumno-semana visible**, nunca una por tarjeta (evita N+1 en celular).

- Etiqueta del botón:
  - `evaluated` → **`✓ Bitácora registrada · Ver / Editar`** (neutro, con check verde).
  - `!evaluated && status === "presente"` → **`📝 Llenar bitácora de hoy (2 min)`** (realce estático ya existente).
  - `!evaluated && status !== "presente"` → **`📝 Bitácora de clase`**.

- `<ClassLog>` **no se modifica**: ya soporta edición con la misma `session_key`.

### A.2 Contador de avance (AUTORIZADO — D1)

- Reutilizar el motor oficial **`computeStudentReportReadiness()`** (`report-readiness.ts:331`). **Prohibido reimplementar** (ADR-0119.3).
- Las `sessions` del ciclo se obtienen **importando en solo lectura** `computeStudentCycleSessions` desde `kardex-calculator.ts`.
  - **AUTORIZADO por D1.**
  - **Condición dura:** import de lectura. `git diff --stat src/lib/kardex-calculator.ts` debe quedar **vacío** al terminar.
  - Antes de tocar nada: consulta de impacto en **graphify**.
- Presentación en la tarjeta:
  - `Bitácoras del ciclo: 3/8 · Informe disponible ✅` si `canGenerate`.
  - `Bitácoras del ciclo: 1/8 · Faltan 7 para el informe` si no.
- **Cero datos financieros.**

### A.3 Lo que NO se toca

- La bitácora sigue **debajo** de los 4 botones de asistencia. No se reordena.
- **Sin `animate-pulse`** (descartado en ADR-0183: 5-6 tarjetas parpadeando saturan).
- `min-h-[44px]` se conserva (ADR-0177).

---

## 4. FRENTE B — CÓDIGO: RECORDATORIO "2 DÍAS SIN BITÁCORA"

### B.1 Motor de detección (función pura)

`src/lib/informes/teacher-reminders.ts`:

```
computeTeachersNeedingReminder(evaluations, teachers, today)
  → para cada docente:
      última bitácora (max session_date)
      días hábiles sin bitácora desde entonces
      needsReminder = díasHábilesSinBitacora >= 2
```

- **Días hábiles**: lunes a sábado. Domingos no cuentan (la escuela no dicta).
- Se basa en `lesson_evaluations` con `is_test = false`.
- Función **pura y testeable**, sin red.
- Si el docente nunca registró, cuenta desde `planStartDate` del ciclo o desde su primer alumno activo, nunca desde el epoch.

### B.2 Mensaje personalizado por WhatsApp

- Plantilla con nombre del docente y cifras reales:
  > *Hola {docente}, te escribimos de Vibra Music. Vemos que hace {N} días no registras la bitácora de clase. Recuerda que toma 2 minutos por alumno y que la necesitamos para poder emitir el informe del ciclo. Gracias.*
- Enlace: `https://wa.me/51XXXXXXXXX?text=<encodeURIComponent(mensaje)>`
- **Sin números hardcodeados**: se lee `users.phone`. Si falta o es inválido → botón deshabilitado con `⚠ Sin teléfono registrado`.
- **Nunca** se envía automáticamente sin clic humano.

### B.3 Registro del recordatorio (in-app)

- Tabla existente: **`notification_logs`** (verificada en vivo: existe, 0 filas, con `recipient_type`, `recipient_id`, `channel`, `subject`, `body`, `status`, `sent_at`).
- Al pulsar "Recordar", se inserta una fila con:
  - `recipient_type = 'teacher'`, `recipient_id = <uuid del docente>`
  - `channel = 'whatsapp'`
  - `subject = 'Recordatorio de bitácora'`
  - `body = <mensaje generado>`
  - `status = 'pendiente'` → `'enviado'` cuando Dirección confirma
- **No se crea tabla nueva.** Prohibido alterar el esquema de `notification_logs`.
- **Cumple §83/§86**: no toca `students.notes`.

### B.4 Campanita in-app en `/teacher`

- Aviso al docente **solo si lo tuvo**: no se le notifica lo que no hizo.
- El docente ve: "Recuerda registrar la bitácora de tus clases de hoy."
- Sin coste, sin API.

---

## 5. FRENTE C — CÓDIGO: TABLERO DE ADOPCIÓN (`/admin/informes`)

### C.1 Pestaña "👥 Adopción Docente"

- Componente nuevo `src/components/admin/teacher-adoption-panel.tsx`.
- **NO se modifica** `informes-tracker-panel.tsx` salvo lo ya hecho en ADR-0183.

### C.2 Mapeo de docentes desde fuente única (PROHIBIDO hardcodear)

- Derivar de **`TEACHER_IDS` + `resolveTeacherNameById`** (`src/lib/services/teacher-resolver.ts`), la misma fuente que `INSTRUMENT_SPECIALISTS` (ADR-0179).
- **Prohibido** escribir `["Jeremy","Nathaly","Fernando"]` o filtrar por `teacher_name` texto: ya falló con la Prof. Claudia.
- Docente con bitácoras pero **sin UUID mapeado** → fila explícita `⚠️ Docente sin UUID mapeado` con sus bitácoras resueltas por nombre. **No se oculta ni se inventa.**

### C.3 Contenido por docente

| Columna | Fuente |
|---|---|
| Bitácoras del mes | `lesson_evaluations` (`is_test=false`) |
| Última bitácora | `max(session_date)` |
| Días sin bitácora | `computeTeachersNeedingReminder` |
| Semáforo 2 días | 🟢 al día · 🔴 requiere recordatorio |
| Teléfono | `users.phone` (deshabilitado si ficticio/ausente) |
| Botón | `📲 Recordar por WhatsApp` |

- **Cero datos financieros.** Solo pedagogía.
- **FUERA DE ALCANCE (D3):** no se muestran fichajes, puntualidad ni asistencia del docente. Ya tienen su política.

---

## 6. ORDEN DE EJECUCIÓN

```
PASO 0 (Dirección, sin código)  → Cargar teléfonos reales en users.phone.
FASE 1 (código)                 → A.1 "✓ Ya registrada"
FASE 2 (código)                 → A.2 Contador 3/8 (autorizado)
FASE 3 (código)                 → B.1 motor + B.2 wa.me + tablero C
FASE 4 (verificación real)      → Primer informe piloto publicado
```

**El Paso 0 no bloquea las Fases 1 y 2** (no usan teléfono). SÍ bloquea el envío real del recordatorio en Fase 3.

---

## 7. RIESGOS Y MITIGACIONES

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Teléfonos ficticios (`9876543XX`) | Mensajes a números inexistentes | Paso 0 obligatorio; botón deshabilitado si falta |
| `getEvaluationBySessionKey` sin `is_test` | Bitácora de prueba marcada como real | Usar `getStudentEvaluations` (§86.6) |
| Docentes hardcodeados | Falla con el 4.º docente (ya pasó con Claudia) | Derivar de `TEACHER_IDS` (§86.7) |
| Cálculo de readiness duplicado | Divergencia (ADR-0119.3) | Reutilizar `computeStudentReportReadiness` |
| N+1 en `/teacher` | Kiosco lento en celular | Una consulta por alumno-semana |
| `kardex-calculator.ts` editado por error | Rompe kardex/asistencia/facturación | Solo import; `git diff --stat` vacío obligatorio |
| Recordatorio percibido como presión | Rechazo del docente | Mensaje respetuoso, sin sanción, sin ranking |
| `notification_logs` con esquema alterado | Rompe otros módulos | Solo INSERT, sin DDL |

---

## 8. CHECKLIST DE CIERRE

- [ ] `npm run build` en verde (lección ADR-0172 §6: JSX roto tumbó un deploy).
- [ ] `git diff --stat src/store/app-store.ts src/lib/kardex-calculator.ts src/lib/student-cycle.ts` → **vacío**.
- [ ] Consulta de impacto en **graphify** para todo archivo compartido.
- [ ] `is_test = false` en toda consulta (usar `getStudentEvaluations`).
- [ ] Cero `S/` en `/teacher`, `/admin/informes`, tablero de adopción.
- [ ] Sin DDL: `notification_logs` solo INSERT.
- [ ] ADR-0184 + CHANGELOG `[2.0.55]` + AGENTS §87 + log en `docs/logs/` en el **mismo commit**.
- [ ] Log del `.log` con `git add -f` (`.gitignore` ignora `*.log`).
- [ ] Push a `origin main` **y** `core main`, verificado con `git ls-remote`.
- [ ] Guardar resumen en **engram**.

---

## 9. APROBADO — LISTO PARA EJECUTAR

Las 7 decisiones (D1–D7) están cerradas. No queda ninguna definición pendiente de Dirección.

**Único requisito externo:** el Paso 0 (teléfonos reales). Las Fases 1 y 2 pueden arrancar ya; el envío real de recordatorios espera los números verdaderos.
