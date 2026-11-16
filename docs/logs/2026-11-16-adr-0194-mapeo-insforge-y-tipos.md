# 2026-11-16 — ADR-0194: mapeo Insforge completo y saneamiento de tipos

## 1. Origen

El editor mostraba errores de TypeScript en `src/lib/kardex-calculator.ts` (5) y
`src/lib/student-cycle.ts` (4) sobre el trabajo de ADR-0194 (Plan Regular
Compartido 4+4). Al revisar el mapeo a Insforge se detectó además que el marcador
`sharedPlanType` nunca se leía de vuelta desde PostgreSQL.

## 2. Diagnóstico

### 2.1 Errores de tipos (síntoma)

Los tipos `AdminStudent` e `Invoice` (en `src/store/admin-seeds.ts`) no declaraban
campos que el código ya usaba en runtime (`room`, `category`, `updatedAt`,
`courseTransition`, `invoices`, `student`, `phone`, `issueDate`, `items`). El
motor del Kardex los leía con `as any`, lo que ocultaba el problema y además
impedía que `exactOptionalPropertyTypes` validara el paso de opcionales.

Adicionalmente, `StudentSessionItem` estaba **duplicado**: declarado en
`kardex-calculator.ts` y otra vez en `student-attendance-kardex.tsx`, con
`isMakeup` requerido en una copia y opcional en la otra (violación de ADR-0119.3).

### 2.2 Gap real de persistencia (hallazgo)

`mapDBStudentToAdminStudent` (`src/lib/services/students.service.ts`)
reconstruía `emergencyContact` con **solo** `name`, `phone` y `relation`:

```ts
emergencyContact: {
  name: ec.name || db.families?.primary_guardian_name || ecFamily,
  phone: ecPhone,
  relation: ec.relation || "Apoderado",
},
```

El JSONB `emergency_contact` sí contenía `sharedPlanType: "compartido_4+4"`
(escrito en `multi-instrument-enrollment.tsx` y en `backgroundCreateStudentInDB`),
pero la ficha no lo veía después de recargar. Quedaban afectados también
`matriculaScope`, `matriculaAmountPaid` y `matriculaFamilyNote` (ADR-0188 §10).

El formulario de horario seguía funcionando únicamente por el fallback
`packageTotalSessions === 4`, y `EmergencyContact.sharedPlanType` no existía
como tipo (TS2339 en `students-table.tsx:5908`).

## 3. Cambios aplicados

### 3.1 Tipos raíz (`src/store/admin-seeds.ts`)

- `AdminStudent`: `room`, `category`, `updatedAt`, `courseTransition`,
  `invoices`; opcionales con `| undefined`.
- `Invoice`: `student`, `phone`, `issueDate`, `items`; `students`, `daysToDue`,
  `remindedAt`, `paymentLogs` pasan a opcionales.
- `EmergencyContact`: `sharedPlanType?: string | undefined`.

### 3.2 Motor y Kardex

- `kardex-calculator.ts`: se eliminan los `as any` sobre `student` y `invoices`;
  `StudentSessionItem` acepta `| undefined` en sus opcionales.
- `student-attendance-kardex.tsx`: importa `StudentSessionItem` de
  `@/lib/kardex-calculator` (fuente única) y corrige 7 accesos a índices
  posiblemente indefinidos (`split("-").map(Number)` y `WEEKDAYS_ORDER[i]`).
- `student-cycle.ts`: `cacheKey` usa `studentProfile.updatedAt` sin `as any`.

### 3.3 Estado y persistencia

- `app-store.ts`: se declara `AppState.invoices` (ya existía en runtime) y se
  protegen los spreads de `paymentLogs` con `(x.paymentLogs || [])`, evitando un
  `TypeError` con recibos sin historial de abonos.
- `students.service.ts`: la lectura devuelve `matriculaScope`,
  `matriculaAmountPaid`, `matriculaFamilyNote` y `sharedPlanType` desde el JSONB
  (acceso por corchetes por `noPropertyAccessFromIndexSignature`).

### 3.4 Bugs reales corregidos (no solo tipos)

1. **Estado del libro (ADR-0146)**: se escribía y comparaba en MAYÚSCULAS
   (`"CANCELADO"`, `"PARCIAL"`…) mientras los valores canónicos son minúsculas.
   Resultado: el badge y el selector del Pack de Útiles nunca coincidían. Se
   normaliza en lectura (`.toLowerCase()`) y el selector persiste en minúsculas.
2. **Cuentas pagadas como deudoras en la Matriz Anual**
   (`src/routes/admin.facturacion.tsx`): se comparaba `status === "pagada"` contra
   `InvoiceStatus`, que solo contiene `"pagado"`. La comparación nunca era cierta.
3. **`daysToDue` opcional sin guarda**: `i.daysToDue <= 2` con `undefined` daba
   falso por coerción; se hizo explícito con `(i.daysToDue ?? 0)`.

## 4. Verificación

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit -p tsconfig.json` | **592 errores** (antes 810 al inicio de la sesión) |
| Firmas nuevas vs línea base (`scratch/.tsc-now-0194.txt`) | **0** |
| Errores en `kardex-calculator.ts`, `student-cycle.ts`, `student-attendance-kardex.tsx` | **0** |
| Errores en `students.service.ts`, `admin-seeds.ts`, `students-table.tsx:5908` | **0** |
| `npm run build` | **verde** |

Los errores restantes son preexistentes del repositorio (TS4111 sobre
`Record<string, any>` en `hydrateFromBackend`, seeds con `Invoice.student`, etc.)
y quedan fuera del alcance de este cambio.

## 5. Estado del despliegue

- `8e28be6` — feat(enrollment): ADR-0194 (código base, ya desplegado).
- `fbf572b` — fix(types): tipos raíz + 3 bugs reales.
- `f1ffa6d` — fix(adr-0194): mapeo Insforge de `sharedPlanType` y metadatos.
- `origin/main` y `core/main` en `f1ffa6d`.

Sin `ALTER TABLE`, sin `DROP`/`TRUNCATE`, sin `DELETE`, sin escrituras de datos.

## 6. Pendiente / fuera de alcance

- `packageTotalSessions` sin clave en el JSONB devuelve `8` incluso para un Plan
  Intensivo histórico (que debería ser 4). No se tocó porque el contrato se
  resuelve en `buildReportPlanContext` (ADR-0180 §3) y cambiarlo afecta reportes.
- La deduplicación de homónimos de `hydrateFromBackend` (ADR-0107/0119) sigue
  pendiente: por eso se mantiene el sufijo `"(Canto)"` (ADR-0189 §6).
