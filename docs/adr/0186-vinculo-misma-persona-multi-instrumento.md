# ADR-0186: Vínculo de Misma Persona con Múltiples Instrumentos

**Fecha:** 2026-11-03
**Estado:** Fases 1 y 2 implementadas. Fase 3 (migración de datos) pendiente de confirmación.
**Autores:** Equipo Vibra (Open Code & Dirección)
**Versión:** 2.0.57
**Relación:** ADR-0125 (§25), ADR-0165 (§72), ADR-0107 (§8), ADR-0109 (§10), ADR-0119

---

## Contexto

Un alumno que contrata **2 instrumentos** se registra como **2 alumnos distintos**, con nombres ligeramente diferentes, para no ser bloqueado por la política de homónimos (ADR-0125.1).

Esto es aceptable pedagógicamente (son 2 matrículas: docente, sala, horario y plan distintos) pero **rompe la facturación**, porque el apoderado que paga de partes por 2 instrumentos aparece como 2 pagadores sin relación.

### Consecuencia (palabras de Dirección)

> *"Los alumnos contratan 2 instrumentos pero tienen hasta su 3era clase para pagar y van pagando de partes. Esto es genial cuando solo tiene un instrumento, pero cuando tiene 2 instrumentos ya no se pone genial sino más bien **engorroso y hasta podría haber confusiones**."*

---

## Casos verificados en producción (2026-11-03)

### Camila — 2 instrumentos

| Campo | Registro A | Registro B |
|---|---|---|
| `id` | `5c44e64a-…` | `064f2b68-…` |
| Nombre | `CAMILA VALENTINA` | `kamila Valentina G.` |
| Instrumento | Violín | Guitarra |
| Docente | Fernando | Jeremy |
| Modalidad | Regular (8 clases) | Intensivo (4 × 90 min) |
| Nacimiento | 2016-02-24 | 2016-02-24 |
| Tutor | Olivia Norma Conco | Olivia Norma Conco |
| Pagado | S/ 261 | S/ 261 |

### Mario — 2 instrumentos

| Campo | Registro A | Registro B |
|---|---|---|
| Nombre | `Mario Keffreen` | `Mario Kefren` |
| Instrumento | Guitarra clásica | Batería |
| Nacimiento | 2015-08-12 | 2015-08-12 |
| Tutor | Janett Emiliano Solano | Janett Emiliano Solano |
| Teléfono | 959463744 | 959463744 |
| Pagado | S/ 261 | S/ 261 |

### JAN / JAM — 2 instrumentos (adulta)

Nacimiento 1997-03-17 ambas. Piano (Fernando) y Canto (Nathaly). Sin tutor externo: es adulta.

### Falso positivo descartado

`Aaron` (Violín) y `Sylvia` (Guitarra) comparten `2016-04-09` pero **sus apoderados son distintos** (Kely Sosa Torres vs Sylvia Jaimes). **No son la misma persona.**

**Conclusión:** la fecha de nacimiento sola **no basta** para inferir identidad.

### Registro histórico (NO es basura)

`00000000-0000-0000-0002-000000000045` — *Camila Valentina Pastor Conco* — existe en `students` con `status = 'baja'`, `birthdate` nulo y S/ 261 **cobrados** en el recibo `00000000-0000-0000-0003-000000000045`.

- **No se elimina.** Representa dinero realmente percibido en el sistema anterior.
- Ya está excluido de las vistas activas por `status = 'baja'` (ADR-0124.2).

---

## Hallazgo que corrige una suposición

Se probó el motor real `isMatchingStudentName` (ADR-0125):

```
CAMILA VALENTINA vs kamila Valentina G.  → false
Mario Keffreen   vs Mario Kefren          → false
JAN              vs JAM                   → false
Aaron            vs Sylvia                → false
```

**El buscador ya distingue correctamente.** El problema no es de matching, es la ausencia de un vínculo explícito.

**Prohibido** "arreglarlo" tocando `isMatchingStudentName` o `normalizeStudentName`: son la deduplicación de ADR-0107 y ya provocaron el incidente ADR-0119.

---

## Decisiones

### 1. Vínculo explícito, sin fusión

- Campo `personGroupId` + `personGroupLabel` en `AdminStudent` (serializado en `emergency_contact` JSONB).
- **Sin `ALTER TABLE`**: todo va en el JSONB ya existente.
- Los registros **no se fusionan**: son 2 matrículas reales. Solo se **vinculan**.

### 2. Criterio único de identidad (`src/lib/student-person-group.ts`)

`isSamePerson()` exige **nacimiento + apoderado**:

1. Misma fecha de nacimiento (dato duro).
2. Mismo apoderado normalizado.

**Excepción adulto (18+):** sin tutor registrado, se exige además que el **nombre del alumno** coincida exactamente (normalizado). Por eso JAN/JAM no se detecta automáticamente: se vincula explícitamente, que es lo correcto para un adulto con alias.

Toda la lógica vive en este módulo. **Prohibido reimplementarla** en cada vista (ADR-0119.3).

### 3. Fase 1 — Detección al matricular

`detectSamePersonCandidates()` separa:

- `activos`: alumnado con quien comparte identidad y sigue activo.
- `historicos`: perfiles en `baja`/`pausa` con la misma identidad.

El formulario de matrícula informa; **no bloquea**. La decisión final sigue siendo de secretaría.

### 4. Fase 2 — Agrupación visual en facturación

- `buildInvoiceGroupMap()` agrupa por `personGroupId`; los grupos de tamaño 1 se descartan para no alterar la vista actual.
- En `/admin/facturacion`, el recibo de un alumno vinculado muestra:
  - Píldora `🎼 Violín + Guitarra`
  - `Total familia S/ 522.00`
- **Solo visual.** No suma a los totales globales ni modifica ningún monto individual. Sin `personGroupId`, todo se comporta exactamente como hoy.

### 5. Fase 3 — Migración de datos (EJECUTADA 2026-11-03)

Ejecutada caso por caso, con backup previo y verificación de totales.

**Backup previo (antes de escribir):**
```
recibos: 81 · facturado S/ 28,185.00 · cobrado S/ 27,345.00 · saldo S/ 1,628.00
```

**Casos vinculados:**

| Grupo | Registros | `personGroupId` (ancla) |
|---|---|---|
| Camila Valentina | `CAMILA VALENTINA` (Violín) + `kamila Valentina G.` (Guitarra) | `5c44e64a-…` |
| Mario Kefreen | `Mario Keffreen` (Guitarra) + `Mario Kefren` (Batería) | `f7a13b12-…` |
| JAN / JAM | `JAN` (Piano) + `JAM` (Canto) | `c4acd9af-…` |

**Método:** `postgrestPatch` sobre `students`, escribiendo `emergency_contact` **fusionando** el objeto existente (`{...ec, personGroupId, personGroupLabel}`). Se verificó el número de claves antes de cada escritura (29–35) para no perder campos.

**Verificación posterior:**
- Totales idénticos: **81 recibos · S/ 28,185.00 · S/ 27,345.00 · S/ 1,628.00**.
- Docentes, fechas de inicio, montos abonados y `scheduleLessons` intactos en cada registro (Camila Violín 4 lecciones, Guitarra 6; Mario 2 y 2).
- `buildInvoiceGroupMap` detecta los **3 grupos** y resuelve `Violín + Guitarra`, `Guitarra + Batería`, `Canto + Piano`.

**No se modificó `family_id` de JAN/JAM.** Son adultas con su propia cuenta de pago; unificarlas es decisión aparte de Dirección.

**No se eliminó ningún registro.** El histórico `00000000-…0045` (Camila Valentina Pastor Conco, `baja`, S/ 261 cobrados) permanece intacto.

### 6. Fase 4 — Unificación de familia (EJECUTADA 2026-11-03)

La Fase 3 solo agrupaba visualmente: cada instrumento seguía en **su propia familia**, así que al cobrar aparecían **dos deudores** y el portal del apoderado resolvía **un solo hijo**.

**Diagnóstico previo decisivo:** `invoicesInScope()` (`laya-family-scope.ts:142`) matchea recibos por **nombre del alumno en el concepto**, no por `invoices.family_id`. Por tanto unificar `students.family_id` es seguro y además **arregla el portal familia**.

**Ejecución (con backup en `scratch/backup-fase4.json`: 4 alumnos, 81 recibos, 315 asistencias):**

| Caso | Origen | Ancla |
|---|---|---|
| Camila | `064f2b68-…` (Guitarra) | `5c44e64a-…` (Violín) |
| Mario | `9948ede5-…` (Batería) | `f7a13b12-…` (Guitarra) |

Se movieron `students.family_id` **e** `invoices.family_id`.

**Verificación:**
- Recibos por familia: `5c44e64a-…` → 2 recibos S/ 522 · `f7a13b12-…` → 2 recibos S/ 522.
- **Totales globales idénticos**: 81 recibos · S/ 28,185.00 · S/ 27,345.00 · S/ 1,628.00.
- `resolveFamilyScope` real devuelve **ambos hijos** en cada familia.
- `buildInvoiceGroupMap` real detecta los 3 grupos.

**Familias que quedaron vacías** (`064f2b68-…`, `9948ede5-…`): **no se eliminan**. No participan de ninguna vista y borrarlas añadiría riesgo sin beneficio.

**Descartada la vía "borrar y recrear":** recrear cambia el UUID y dejaría huérfanos `attendance_logs`, `lesson_evaluations`, `invoices` y `payment_audit_logs`. Unificar `family_id` logra el mismo objetivo conservando toda la trazabilidad.

### 7. Fase 5 — Blindaje de borrado y botón Vincular (EJECUTADA 2026-11-03)

**Hallazgo crítico previo:** `deleteStudent` (`app-store.ts:2283`) protege el horario comparando **por nombre**, y los alias de un mismo alumno no coinciden (`JAN` vs `JAM` → `false`). Sin blindaje, borrar JAN dejaba huérfano el vínculo de JAM.

**Persistencia (archivos tocados, mínimo y aditivo):**
- `app-store.ts`: +4 líneas en `performSyncStudentToDB` que escriben `personGroupId`/`personGroupLabel` **solo si vienen definidos** (nunca borra un vínculo existente al actualizar otro campo).
- `students.service.ts`: lectura del campo en `mapDBStudentToAdminStudent`. **Sin esto el vínculo se perdía al recargar.**
- `kardex-calculator.ts` y `student-cycle.ts`: **sin cambios**.

**Blindaje de borrado** (`findLinkedSiblingsAtRisk` + aviso en el modal): cuando el alumno tiene hermanos vinculados activos, el modal muestra *"⚠️ Este alumno tiene otro instrumento vinculado… usa «Dar de baja» en lugar de eliminar"*. **No se alteró la lógica interna de `deleteStudent`** (código sensible con protección por nombre); se previene el error humano en la UI.

**Botón "🔗 Vincular con otro instrumento"** (`link-person-dialog.tsx`): muestra hermanos actuales con **Desvincular**, coincidencias automáticas (nacimiento + apoderado) y **búsqueda manual** —necesaria porque los alias de un adulto solo los conoce Dirección y la detección automática no los encuentra.

**Pruebas con datos vivos:**
```
borrar JAN                 → 1 en riesgo (JAM)   ✅
borrar JAM                 → 1 en riesgo (JAN)   ✅
borrar JAN + JAM a la vez  → 0 en riesgo         ✅
borrar Mario Keffreen      → 1 en riesgo         ✅
borrar Aaron (sin vínculo) → 0 en riesgo         ✅
hidratación                → 6/6 vinculados      ✅
```

**Escalabilidad:** un 3.er instrumento no requiere código nuevo. Todo campo nuevo de persona debe añadirse en **los dos** puntos (`app-store.ts` y `students.service.ts`); omitir el segundo hace que el dato se pierda al recargar.

---

## Verificación

`scratch/test-person-group.mjs` y `scratch/test-person-group2.mjs`:

```
=== FALSOS POSITIVOS (deben ser false) ===
Aaron vs Sylvia: false                                   ✅

=== MISMA PERSONA (deben ser true) ===
Camila(Kamila): true                                     ✅
Mario: true                                              ✅
JAN/JAM (adulta, sin tutor): false  ← deliberado         ✅

=== normalización de fechas ===
"2016-02-24"              -> 2016-02-24                  ✅
"2016-02-24T05:00:00.000Z"-> 2016-02-24                  ✅
"24/02/2016"              -> 2016-02-24                  ✅
""                        -> null                        ✅

=== vínculo explícito ===
JAN/JAM hermanos: 1                                      ✅
bundle: Piano + Canto                                    ✅
sin vínculo (no adivina): 0                              ✅
candidatos al matricular: CAMILA VALENTINA, kamila Valentina G.  ✅
```

`npm run build` en verde. `app-store.ts`, `kardex-calculator.ts` y `student-cycle.ts` **sin cambios**.

Totales de facturación verificados en vivo: no se altera ningún importe; solo se agrega la agrupación visual.

---

## Riesgos y límites

| Riesgo | Mitigación |
|---|---|
| Vincular falsos positivos | Exigir nacimiento **+ apoderado**; nunca solo fecha |
| Fusionar en vez de vincular | Solo `personGroupId`; jamás mover `scheduleLessons` |
| Tocar el matching de nombres | Prohibido por regla explícita |
| Duplicar recibos al alinear `family_id` | Verificar count y montos antes/después (Fase 3) |

**Límites honestos:**
- La agrupación visual requiere que el alumno tenga `personGroupId`. **Hoy los 3 casos reales ya están vinculados**; cualquier alumno nuevo se vincula manualmente o mediante la detección de la Fase 1.
- **Camila y Mario** ya comparten familia y recibo único; **JAN/JAM no** (adultas con cuenta propia).
- La detección automática **no cubre** adultos con alias (JAN/JAM): requieren vínculo explícito.
- No existe todavía una UI para vincular/desvincular manualmente desde la ficha. Se hace por datos.
- Quedan 2 familias vacías (`064f2b68-…`, `9948ede5-…`) sin alumnos ni recibos; no afectan ninguna vista.
