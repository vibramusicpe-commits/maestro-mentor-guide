# ADR-0193 — Ciclo de Paquete Flexible que no "// Clases futuras del alumno desaparecen del Kiosco y de la Agenda" y de-hardcodeo del alumno Jonathan

- **Fecha**: 2026-11-12
- **Estado**: ACEPTADO y desplegado
- **Alcance**: `src/lib/student-cycle.ts`, `src/lib/services/students.service.ts`, `src/store/app-store.ts`
- **Motor afectado**: `computeStudentCycle` / `isLessonInStudentCycle` (motor oficial de ciclo contractual, ADR-0119.3)
- **Datos migrados**: 1 campo en PostgreSQL (`students.emergency_contact.ageCategory` de la ficha legacy `00000000-0000-0000-0002-000000000001`)

---

## 1. Síntoma reportado

> "Porque no aparece Jonathan Ticona en el kiosco de la profesora Nathaly si él tiene clase hoy con ella?"

Además se reportó que "Edi Jack" aparecía *hardcodeado* y que no debía existir nada hardcodeado por alumno.

## 2. Diagnóstico con evidencia (no por lectura estática)

### 2.1 Lo que realmente dice PostgreSQL (fuente de verdad, ADR-001.3)

`students` con `emergency_contact->>'teacher' = 'Nathaly'`:

| id | full_name | status | instrumento | clases en `scheduleLessons` |
|---|---|---|---|---|
| `0022a7f2-0fca-48da-904e-d7f8f7066636` | **Jonathan** | **activo** | Canto | Mar 18:15 · Mié 18:15 + 10 recuperaciones/adelantos puntuales |
| `00000000-0000-0000-0002-000000000001` | Ticona Cachay, Jonathan | baja | Canto | (sin clases) |

- `planType = "Paquete Flexible"`, `packageTotalSessions = 24`, `planStartDate = 2026-08-18`, `planEndDate = 2026-12-31`.
- **El jueves 2026-11-12 no tiene ninguna clase programada.** Sus clases fijas son **Martes y Miércoles 18:15**; el resto de sesiones se agendaron como recuperaciones/adelantos puntuales (Lun, Vie, Jue).
- La clase de **Jueves 18:15** que se recuerda existe solo en una **semilla hardcodeada** (`src/store/official-seeds.ts`, ids `sch-jt-c1..c6`, generado desde `public/horarios_final.csv`). En runtime **nunca llega al horario**: `hydrateFromBackend` (ADR-0118.4) solo inyecta `initialSchedule` si el alumno activo **no** tiene `scheduleLessons` en PostgreSQL — y Jonathan sí las tiene. Verificado: `llego al horario? NO` para las 6 semillas.

### 2.2 Bug real encontrado: el ciclo se anclaba en el pasado

`computeStudentCycle` (rama no intensiva) elegía las clases pendientes así:

```ts
const slotsNeeded = Math.max(0, targetQuota - evaluatedCount - pendingMakeups.length);
chosenPendingRegular = pendingRegular.slice(0, slotsNeeded);   // ← pendingRegular empieza en planStartDate
```

`pendingRegular` está ordenado cronológicamente **desde el inicio del plan**, por lo que las clases pendientes **ya pasadas y no marcadas** (el backlog) consumían la cuota pendiente:

- `evaluatedCount = 18`, `targetQuota = 24` → `slotsNeeded = 6`.
- Los 6 slots elegidos fueron `2026-09-22, 10-20, 10-27, 10-28, 11-03, 11-10` (todos en el pasado).
- `validSlots` quedó con fechas **pasadas** ⇒ toda clase futura (`2026-11-17-18:15`, `2026-11-18-18:15`, …) fue **rechazada** por `isLessonInStudentCycle` ⇒ **Jonathan desaparecía del Kiosco y de la Agenda desde el 17/11** pese a tener 6 sesiones por dictar.

### 2.3 Medición en runtime (motor oficial, datos vivos)

`scratch/test-jonathan-kiosco.ts` replica el pipeline real del Kiosco (`hydrateFromBackend` → `filterTeacherScheduleLessons` → `isLessonInDay` → `isLessonInStudentCycle`).

**Antes del fix:**

| Fecha | Clases de Nathaly | Jonathan |
|---|---|---|
| Mar 2026-11-10 | 1 | ✅ aparece |
| Mié 2026-11-11 | 5 | ❌ ausente |
| Jue 2026-11-12 | 0 | ❌ (correcto: hoy no tiene clase) |
| Mar 2026-11-17 | **0** | ❌ **bug** |
| Mié 2026-11-18 | 4 | ❌ **bug** |

**Después del fix:** Mar 17/11 → 1 (Jonathan), Mié 11/11 → 7 (incluye Jonathan 18:15), Mié 11/18 → 6 (incluye Jonathan 18:15), Jue 12/11 → 0 (sin cambios).

## 3. Decisión

### 3.1 Fix del motor (acotado a Paquete Flexible)

En `src/lib/student-cycle.ts`, rama no intensiva:

```ts
if (isFlexiblePackage) {
  // la cuota pendiente se cubre con las clases FUTURAS; el backlog pasado se conserva visible
  const futureRegular = pendingRegular.filter((p) => p.dateStr >= todayStr);
  const pastRegular   = pendingRegular.filter((p) => p.dateStr <  todayStr);
  chosenPendingRegular = [...pastRegular, ...futureRegular.slice(0, slotsNeeded)];
} else {
  chosenPendingRegular = pendingRegular.slice(0, slotsNeeded);   // Regular / Intensivo: sin cambios
}
```

**Por qué solo Paquete Flexible (alcance cero para Regular e Intensivo):**

1. El síntoma se debe a **ciclos largos** (bolsa de 24 sesiones a demanda con vigencia hasta 31/12). En Plan Regular (ciclos de 1 mes) y Plan Intensivo (4 fechas) el backlog no alcanza a agotar la cuota futura.
2. Para flexibles, la vista mensual del Kardex **no** filtra por `cycle.validSlots` (`kardex-calculator.ts:543`, condicional `!isFlexiblePackage`), por lo que **el backlog pasado sigue visible** en el Kardex: cero regresión de historial.
3. `evaluatedSlots` se conserva intacto: ninguna asistencia histórica se borra ni se reescribe.

**Invariante preservado:** `validSlots` sigue siendo el conjunto cerrado del ciclo (evaluadas + makeups pendientes + regulares pendientes). Lo único que cambia es **qué** regulares pendientes cuentan para la cuota: las futuras.

### 3.2 De-hardcodeo de Jonathan

Se eliminó **todo** el tratamiento por alumno de "Jonathan":

| Archivo | Antes | Ahora |
|---|---|---|
| `students.service.ts` | `isJonathanDB` → docente, planPrice 500, amountPaid 500, instrumento Canto, modalidad Paquete Flexible, teacherNote, ageCategory MASTER, planType, 24 sesiones, fechas 18/08–31/12 | valores genéricos: todo sale de `emergency_contact` |
| `app-store.ts` (hidratación) | `isJonathan` → forzar flexible, fecha inicio, amountPaid/balance/planPrice/payment | detección de flexible **por datos** (`packageTotalSessions`, `planType`, `modality`) |
| `app-store.ts` (`migrate`) | `isJonathan` → forzar `status = activo` y plan 500/24 | sin caso por alumno: el homónimo histórico queda archivado (`baja`) |

**Verificaciones previas a retirar el hardcode:**

1. `isMatchingStudentName` (genérico) ya resuelve los homónimos: `"Jonathan" ↔ "Ticona Cachay, Jonathan"` → **true**, `"Ticona Cachay, Jonathan" ↔ "Jonathan Ticona Cachay"` → **true**. El hardcode era **redundante**.
2. Todos los valores que el código inyectaba **ya existían** en `emergency_contact` de ambas fichas (verificado campo por campo). El único dato que el código aportaba y la base no tenía era `ageCategory` de la ficha legacy ⇒ **migrado a PostgreSQL** (`ageCategory = "MASTER"`, 12 → 13 claves, 0 claves perdidas, sin montos ni DDL).
3. Resultado: **0 cambios de comportamiento** en el mapeo de fichas (perfiles verificados idénticos antes/después en el test de runtime).

### 3.3 "Edi Jack" NO es hardcode (hallazgo documentado)

Búsqueda exhaustiva (código + historial Git + base de datos):

- `grep -ri "edi jack"` en el repo → **0 resultados**; `git log --all -S "Edi Jack"` → **0 commits**. **Nunca estuvo en el repositorio.**
- En PostgreSQL solo existen **2 filas de datos**, creadas el **2026-11-07 17:21:21** por el autoaprovisionamiento de matrícula (ADR-0109/0116):
  - `families.e1212cf7-5c51-4c74-99b0-963a775a9fd8` → "Familia VASQUEZ ASCATE", titular `NN`, email `edi.jack.@gmail.com`, **sin alumnos**.
  - `invoices.d836aa94-f8aa-4ee1-9ce4-1e7870673b7b` → "Plan Mensual (Canto) — EDI JACK ", S/ 261, pagado, saldo 0.
- El **alumno "EDI JACK" fue eliminado de `students`** (búsqueda `%edi%` / `%jack%` → 0 filas). Lo que sobrevive es el par recibo + familia huérfanos, porque las facturas **nunca se borran** (ADR-0191): se anulan.
- **No hay que agregarlo manualmente.** Si debe existir como alumno, se matricula desde la interfaz (el sistema reutiliza/aprovisiona familia y recibo). Si no debe existir, el recibo se anula con el patrón ADR-0191 (`[ANULADO <fecha> · motivo]`, saldos a 0) y la familia vacía se conserva (ADR-0190 §8b).

**Resolución ejecutada (2026-11-12, con autorización de Dirección)**: el alumno fue matriculado el **07/11/2026 17:21:21** con un abono Yape de **S/ 261** (voucher `ABONO-MATRICULA`, nota *"Abono inicial al matricular (Mensual)"*, titular `NN` → registro de prueba). El alumno se eliminó después y quedaron el recibo y la familia vacíos. Se **anuló** el recibo `d836aa94-f8aa-4ee1-9ce4-1e7870673b7b`:

| Campo | Antes | Después |
|---|---|---|
| `concept` | `Plan Mensual (Canto) — EDI JACK ` | `[ANULADO 2026-11-12 · alumno dado de baja (sin alumno activo)] Plan Mensual (Canto) — EDI JACK` |
| `amount_paid` | 261 | **0** |
| `remaining_balance` | 0 | 0 |
| `status` | pagado | pagado |
| `amount` | 261 | 261 (sin cambios) |
| `payment_audit_logs` | 1 log (261, Yape) | **preservado intacto** (rastro del cobro) |

**Impacto cero verificado con el motor del panel** (`scratch/anular-edi-jack.ts`, lógica `activeInvoices` de `/admin/facturacion` replicada sobre datos vivos):

| Total del panel | Antes | Después |
|---|---|---|
| Facturas | 93 | 93 |
| Total facturado | S/ 31,591.00 | S/ 31,591.00 |
| Total cobrado | S/ 29,253.00 | S/ 29,253.00 |
| Saldo pendiente | S/ 2,615.00 | S/ 2,615.00 |

El recibo **ya estaba excluido** del panel antes de anularlo (no coincide con ningún alumno activo), por lo que el cambio no mueve ninguna cifra. La familia `e1212cf7` se conserva vacía (ADR-0190 §8b: las familias vacías no se eliminan).

## 4. Verificación

| Prueba | Resultado |
|---|---|
| `scratch/test-jonathan-kiosco.ts` (runtime, datos vivos) | Jonathan reaparece el 10/11, 11/11, **17/11** y **18/11**; jueves 12/11 sigue en 0 (correcto) |
| `scratch/test-facundo-intensive.ts` (regresión del motor) | ✅ TODO OK (Facundo y Matias, Plan Intensivo 90 min intacto) |
| `scratch/test-adr-0192-bitacora-edicion.mjs` (regresión bitácora) | ✅ 37/37 |
| `npm run build` | ✅ verde |
| `npx tsc --noEmit -p tsconfig.json` | **210 errores en los 3 archivos tocados ANTES y DESPUÉS → 0 errores nuevos** (843 preexistentes en el repo) |
| Migración de datos | 1 campo agregado, 0 claves perdidas, 0 montos tocados, sin DDL |

## 5. Alcance y prohibiciones respetadas

- Sin DDL, sin `DELETE`/`TRUNCATE`, sin tocar `kardex-calculator.ts`, `students.notes`, `notification_logs` ni `payment_audit_logs`.
- Cero datos financieros en vistas pedagógicas; los montos de la migración no se alteraron.
- Motor único: el fix vive en `student-cycle.ts` (fuente única del filtro de ciclo), no en copias de componentes.

## 6. Referencia

- `docs/adr/0193-ciclo-paquete-flexible-y-de-hardcodeo-jonathan.md`
- `docs/logs/2026-11-12-adr-0193-ciclo-flexible-dehardcodeo.log`
- `scratch/test-jonathan-kiosco.ts`, `scratch/fix-jonathan-dehardcode.mjs`
