# ADR-0190 — Cuenta Familiar de solo lectura: agrupación sin `family_id` roto y atribución inequívoca de recibos

- **Fecha:** 2026-11-05
- **Estado:** implementado y desplegado
- **Contexto previo:** ADR-0186 (vínculo de misma persona), ADR-0188 (Registro 2 y matrícula única por familia), ADR-0189 (código por matrícula y por persona)
- **Archivos nuevos:** `src/lib/family-account.ts`, `src/components/admin/family-account-card.tsx`
- **Archivos tocados:** `src/store/admin-seeds.ts` (campo opcional), `src/lib/services/invoices.service.ts` (mapeo), `src/components/admin/students-table.tsx` (montaje)
- **Sin DDL. Sin escrituras de dinero. Sin tocar `kardex-calculator.ts` ni `student-cycle.ts`.**

---

## 1. Contexto

Antes de mover un solo sol en la Fase 4 (bolsa de abonos) y la Fase 5 (consolidación de Luciana), se hizo una auditoría **de solo lectura** de la base activa con datos vivos. Los hallazgos cambiaron el diseño:

### 1.1 La base real no son 13 alumnos

| Dato | Valor verificado |
|---|---|
| Alumnos activos | **62** |
| Recibos | **85** |
| Facturado | **S/ 29,185.00** |
| Cobrado | **S/ 28,095.00** |
| Saldo | **S/ 1,878.00** |

Las cifras de 13 alumnos de ADR-0132/ADR-0144 describen otro corte; la base creció. Cualquier "cuenta familiar" debe funcionar para 62, no para 13.

### 1.2 El `family_id` está roto en la mayoría de los casos

**56 de 62** alumnos activos tienen `family_id` **igual a su propio UUID de alumno**. Es decir: en la mayoría de los casos **no existe una familia real**, existe un puntero circular al alumno.

Consecuencia directa: **cualquier diseño de "cuenta por familia" basado en `family_id` a secas agrupa mal** y lo hace en silencio. No falla con un error: simplemente parte familias reales en pedazos y presenta números incorrectos como si fueran ciertos.

### 1.3 Los homónimos duplican los recibos

Luciana aparece **5 veces** en la base activa:

| Nombre | Instrumento | `family_id` | `personGroupId` | Plan/Pagado/Saldo |
|---|---|---|---|---|
| Luciana | Piano | `2307efd3…` (= su propio id) | `f8fc5eef…` | 250 / 250 / 0 |
| Luciana (Canto) | Canto | `2307efd3…` | `f8fc5eef…` | 250 / 250 / 0 |
| Luciana | Piano | `1bb0c180…` | `18b6576e…` | 250 / 250 / 0 |
| Luciana (Canto) | Canto | `1bb0c180…` | **null** | 250 / **0** / 250 |
| Luciana Mendoza Gómez | Piano | `90191dc0…` | null | 297 / 297 / 0 (**persona distinta**) |

Los cuatro primeros son **dos pares duplicados** de la misma persona (el par B nació de un reintento). El quinto es **otra persona**. Dos registros se llaman **exactamente** `"Luciana"`.

Esto rompe la atribución por nombre: un recibo `Plan Mensual (Piano) — Luciana` con `family_id = 2307efd3…` es igual de compatible con la matrícula `2307efd3…` que con la `50996819…`. En la primera versión del motor ese recibo se sumaba a **las dos cuentas**, inflando ambas.

---

## 2. Decisión

### 2.1 Un módulo puro, sin red y sin estado

`src/lib/family-account.ts` es la **única fuente** del cálculo de la cuenta familiar:

```
buildFamilyAccount(students, invoices, focusStudentId) → FamilyAccountSummary | null
```

- No importa el store, no hace `fetch`, no escribe nada.
- `AdminStudent` e `Invoice` lo satisfacen estructuralmente (tipos de entrada propios, sin acoplarse al store).
- Exporta además `groupStudentsByFamily`, `resolveInvoiceOwnership`, `matriculaAmountForType`, `libroAmountFor`, `resolveCreditToShow`, `formatSoles` y `classifyInvoiceRubro`.

**Prohibido** recalcular montos, rubros o agrupaciones en un componente (ADR-0119.3).

### 2.2 Agrupación por unión de vínculos reales, nunca por `family_id` solo

Se usa *union-find* sobre dos claves:

1. `personGroupId` — misma persona con varios instrumentos.
2. `familyId` — **solo cuando es una familia real**, es decir, distinto del UUID del propio alumno.

Si un alumno no tiene ninguno de los dos, queda solo: **exactamente como hoy**. Esto preserva la vista actual de los 56 alumnos con `family_id` circular y no inventa familias.

Resultado verificado:

| Cuenta | Miembros |
|---|---|
| Luciana par A | Piano + Canto (por `personGroupId`) |
| Luciana par B | Piano + Canto (por `familyId` real, aunque el Canto no tenga persona) |
| Camila | CAMILA VALENTINA (Violín) + kamila Valentina G. (Guitarra) |
| Mario | Guitarra + Batería |

### 2.3 Atribución recibo → matrícula con cadena de prioridad y ambigüedad explícita

El recibo se atribuye a **una sola** matrícula, en este orden:

1. **Vínculo explícito** (`student.invoices[].id`).
2. **`family_id` del recibo**:
   - un solo alumno en esa familia → dueño;
   - varios → se acota por nombre exacto; si queda **uno**, dueño; si no, **ambiguo**.
3. **Nombre exacto normalizado**, solo si es **único** entre los activos (o único entre los inactivos si no hay activos).
4. Si nada desambigua → **`ambiguous: true`** y el recibo **no se suma a ninguna cuenta**. Se emite una advertencia visible.

Nunca se adivina. Un recibo perdido con aviso es infinitamente mejor que un recibo contado dos veces.

**Cambio de soporte:** `Invoice` gana el campo opcional `familyId`, poblado en `mapDBInvoiceToInvoice` desde `db.family_id`. Sin él, en la app los homónimos exactos serían irresolubles. Es aditivo y compatible con los recibos ya cargados.

### 2.4 Los 3 rubros, con sus reglas de negocio

| Rubro | Regla |
|---|---|
| **1. Matrícula** | Se cobra **una vez por familia**. Si dos matrículas declaran tipo, solo una lleva monto; la otra queda `Exonerada` con nota de quién la cubrió. |
| **2. Mensualidad** | Un recibo por ciclo. Si no hay recibo, se cae a la ficha (`planPrice`/`amountPaid`) y se marca **`sin-recibo`** con advertencia. |
| **3. Libro / Útiles** | Se cobra **por instrumento**. Costo declarado o S/ 67 por defecto, salvo exoneración. |

### 2.5 El saldo a favor se muestra aparte y no se aplica solo

`creditBalance` (bolsa familiar declarada) y `detectedOverpayment` (excedente detectado en pagos) se muestran en una tarjeta aparte que declara textualmente que **no se aplica automáticamente a ningún instrumento**. `resolveCreditToShow` prioriza lo declarado sobre lo detectado, para que la decisión de Dirección mande.

Queda **PROHIBIDO** usar `Math.max(0, planPrice - amountPaid)` para ocultar el excedente (ADR-0188 §2).

### 2.6 La tarjeta no aparece cuando no aporta nada

`isRelevant` es verdadero solo si hay **2+ matrículas**, saldo a favor, excedente o advertencias. Un alumno con una matrícula y un recibo pagado ve su ficha **exactamente igual que antes**. Cero ruido en 56 de 62 fichas.

---

## 3. Consecuencias

**Positivas**

- Antes de tocar dinero ya existe un número auditable y reproducible por familia.
- La duplicación de Luciana deja de ser un misterio: dos cuentas separadas con montos exactos.
- El `family_id` circular queda documentado y contenido, no "arreglado a ciegas".
- Un recibo ambiguo se señala en vez de duplicarse.

**Costos / límites conocidos**

- **56 familias reales no existen todavía.** Crear `families` reales es trabajo de datos de la Fase 5, no de esta fase.
- Un recibo ambiguo queda **fuera** de los totales hasta que se consolide la duplicación. Es deliberado.
- El módulo **no** corrige la deduplicación de homónimos de `hydrateFromBackend` (ADR-0107/ADR-0119); eso sigue siendo la Fase 6.

---

## 4. Prohibiciones

1. **Prohibido escribir dinero desde este módulo o desde la tarjeta.** Los cobros viven en `/admin/facturacion`.
2. **Prohibido agrupar familias por `family_id` sin comprobar que es una familia real.**
3. **Prohibido aplicar el excedente a otro instrumento de forma automática.**
4. **Prohibido duplicar el cálculo** en otra vista: se importa `family-account.ts`.
5. **Prohibido mostrar la tarjeta en fichas simples** (se perdería la vista actual).
6. **Prohibido tocar** `kardex-calculator.ts`, `student-cycle.ts`, `students.notes` o `notification_logs`.

---

## 5. Verificación

- `npm run build` en verde.
- `npx tsc --noEmit -p tsconfig.json`: **0 errores nuevos** en `family-account.ts`, `family-account-card.tsx` y `students-table.tsx` (§92).
- `scratch/test-adr-0190-cuenta-familiar.mjs` — **24/24** con datos vivos de Insforge PostgreSQL:
  - los dos pares de Luciana siguen identificables y **no se contaminan** entre sí (ningún recibo del par B entra en la cuenta del par A ni al revés);
  - agrupación **solo por vínculo real** (persona o familia real), nunca por nombre parecido;
  - Camila y Mario agrupados por `familyId` real;
  - `family_id` = UUID propio **no** agrupa con ajenos (57 alumnos);
  - **ningún recibo aparece en 2 cuentas** (0 duplicados);
  - suma de abonados **≤** cartera real (S/ 25,390.00 ≤ S/ 28,345.00);
  - ficha simple no se marca como relevante;
  - matrícula cobrada como máximo **1 vez** por familia;
  - saldo a favor declarado se lee y **no** se aplica a la deuda;
  - el módulo solo exporta funciones de lectura.

> El test verifica **invariantes**, no fotos del día: los conteos de homónimos cambian con los datos (ver §6).

---

## 6. Cambios de datos observados mientras estaba en curso (2026-11-07)

Entre la auditoría y el cierre aparecieron **cambios en producción**, no defectos del motor:

1. **Nueva matrícula `f630d6df`** con nombre `"Luciana "` (espacio final), familia propia y sin `personGroupId`. Queda **sola**, como corresponde; no se fusiona por nombre parecido.
2. **`Luciana Mendoza Gómez` (`90191dc0`) tiene `personGroupId = f8fc5eef`**, el mismo del par A. Por eso el motor la incluye en esa cuenta: 3 matrículas, **S/ 994.00** contratado, **S/ 964.00** abonado y **S/ 30.00** pendientes (su matrícula *Promo Demo*).

El motor **no** agrupa por nombre: agrupa porque el dato dice que es la misma persona. Si Dirección confirma que `Luciana Mendoza Gómez` es **otra** persona, el error está en el `personGroupId` de su ficha y se corrige **ahí**, no en el motor.

**Punto abierto que exige decisión de Dirección:** ¿`Luciana Mendoza Gómez` (plan S/ 297, matrícula Promo Demo) es la misma persona que `Luciana` (plan S/ 250) o un homónimo mal vinculado? Hasta que se decida, aparece sumada a la cuenta del par A.

Cartera al 2026-11-07: **S/ 28,345.00** cobrado (subió desde S/ 28,095.00 por los abonos nuevos).

---

## 7. Siguiente paso (no incluido aquí)

Fase 5 — consolidación asistida del caso Luciana, con la decisión de Dirección ya tomada:
**par A vigente**, par B archivado como baja (sin borrar), su recibo pendiente **anulado** (no eliminado) y los S/ 250 cobrados del Piano del par B como **saldo a favor de la familia**. Requiere confirmación explícita final antes de escribir.
