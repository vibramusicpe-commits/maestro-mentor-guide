# PLAN QUIRÚRGICO: VÍNCULO DE MISMA PERSONA CON MÚLTIPLES INSTRUMENTOS

**Fecha:** 2026-11-03
**Versión base:** 2.0.56 (commit `b9c46e9`)
**Estado:** Diagnóstico verificado en producción. Pendiente ejecución por fases.
**Autor:** Open Code (ejecutor) — directrices de Dirección
**Relación:** ADR-0125 (§25), ADR-0165 (§72), ADR-0107 (§8), ADR-0109 (§10), ADR-0119

---

## 1. PROBLEMA REAL (verificado, no supuesto)

Un mismo alumno contrata **2 instrumentos** y se registra como **2 alumnos distintos** con nombres ligeramente diferentes para esquivar el bloqueo de homónimos (ADR-0125.1).

### Consecuencia que motivó este plan (palabras de Dirección)

> *"Los alumnos contratan 2 instrumentos pero tienen hasta su 3era clase para pagar y van pagando de partes. Esto es genial cuando solo tiene un instrumento, pero cuando tiene 2 instrumentos ya no se pone genial sino más bien **engorroso y hasta podría haber confusiones**."*

No es un problema de nombres. Es un problema de **facturación**: el apoderado paga de partes por 2 instrumentos y el sistema lo ve como 2 pagadores sin relación.

---

## 2. CASOS CONFIRMADOS EN PRODUCCIÓN (2026-11-03)

### 2.1 Camila — 2 instrumentos

| Campo | Registro A | Registro B |
|---|---|---|
| `id` | `5c44e64a-b55d-4cf3-a668-1346b4a3cd8c` | `064f2b68-31da-4302-81d4-a447fcf1a1cc` |
| `full_name` | `CAMILA VALENTINA` | `kamila Valentina G. ` |
| `instrument` | Violín | Guitarra |
| Docente | Fernando | Jeremy |
| Modalidad | Regular (8 clases) | Intensivo (4 clases / 90 min) |
| Nacimiento | 2016-02-24 | 2016-02-24 |
| Tutor | Olivia Norma Conco | Olivia Norma Conco |
| Teléfono | 934164251 | 910875526 |
| Familia | Familia PASTOR CONCO | Familia Pastor Conco |
| `family_id` | **propio** | **propio** |
| Pagado | S/ 261 | S/ 261 |

**Confirmado por Dirección:** mismo apoderado. Total real: **S/ 522**, hoy registrado como 2 cuentas.

### 2.2 Mario — 2 instrumentos

| Campo | Registro A | Registro B |
|---|---|---|
| `id` | `f7a13b12-1ae7-433c-badb-53d0272cdc77` | `9948ede5-6bac-4199-825e-e7bf509e2280` |
| `full_name` | `Mario Keffreen` | `Mario Kefren` |
| `instrument` | Guitarra clásica | Batería |
| Nacimiento | 2015-08-12 | 2015-08-12 |
| Tutor | Janett Emiliano Solano | Janett Emiliano Solano |
| Teléfono | 959463744 | 959463744 |
| Familia | Familia Martel Emiliano | Familia Martel Emiliano |
| `family_id` | **propio** | **propio** |
| Pagado | S/ 261 | S/ 261 |

**Confirmado por Dirección.** Total real: **S/ 522**, hoy en 2 cuentas.

### 2.3 JAN / JAM — 2 instrumentos (adulta)

| Campo | JAN | JAM |
|---|---|---|
| `id` | `c4acd9af-a0c6-4e25-9bb0-a68eeb8d4236` | `37b64949-b745-49d4-a587-e0212b06b3ac` |
| `instrument` | Piano | Canto |
| Docente | Fernando | Nathaly |
| Modalidad | Paquete Flexible | Regular (8 clases) |
| Nacimiento | 1997-03-17 | 1997-03-17 |
| Pagado | S/ 297 | S/ 494 |

**Es adulta:** el apoderado es ella misma, no hay tutor externo.
**Confirmado por Dirección:** misma persona.

### 2.4 Falsos positivos detectados y descartados

| Par | Por qué NO son duplicados |
|---|---|
| `Aaron` (Violín) vs `Sylvia` (Guitarra) | Ambos 2016-04-09, pero apoderados distintos: **Kely Sosa Torres** vs **Sylvia Jaimes** |

**Regla:** fecha de nacimiento sola **no basta**. Hay que cruzar el apoderado.

### 2.5 Registro histórico de semilla (NO borrar sin análisis)

⚠️ **Corrección tras verificación**: NO es un recibo huérfano. El alumno **sí existe**:

| Campo | Valor |
|---|---|
| `students.id` | `00000000-0000-0000-0002-000000000045` |
| `full_name` | `Camila Valentina Pastor Conco` |
| `instrument` | Violín |
| `status` | **`baja`** |
| `birthdate` | **`null`** |
| `family_id` | `00000000-0000-0000-0001-000000000045` (Familia Pastor Conco) |
| Docente | Fernando · Intensivo |
| Recibo | `00000000-0000-0000-0003-000000000045` — S/ 261 **pagado** |

**Es un registro del sistema anterior** (UUID de semilla `0000...0045`), dado de baja, sin fecha de nacimiento.

**Riesgo si se borra:** perdería el registro de **S/ 261 efectivamente cobrados**. Eso descuadraría la conciliación histórica.

- **Acción correcta:** tratarlo como **histórico `baja`**, no como basura. Se excluye de las vistas activas (ya lo está por `status = 'baja'`, ADR-0124.2) y **no se elimina** sin decisión explícita de Dirección con la contabilidad a la vista.
- **PROHIBIDO** borrarlo en Fase 1 o 2. Si Dirección confirma que ese pago ya no aplica, se hace en Fase 3 con backup previo.

---

## 3. HALLAZGO QUE CORRIGE UNA SUPOSICIÓN

Se probó el motor real `isMatchingStudentName` (ADR-0125):

```
CAMILA VALENTINA vs kamila Valentina G.  → false
Mario Keffreen   vs Mario Kefren          → false
JAN              vs JAM                   → false
Aaron            vs Sylvia                → false
```

**El buscador NO confunde los nombres.** No hay riesgo de que el matching mezcle a Camila con Kamila al buscar.

El problema es **estructural**: no existe ningún campo que declare *"estos 2 registros son la misma persona"*. Prohibido "arreglarlo" tocando `isMatchingStudentName` o `normalizeStudentName`: eso sí rompería la deduplicación de ADR-0107 y provocaría el incidente de ADR-0119.

---

## 4. MODELO DE DATOS PROPUESTO

### 4.1 Campo de vínculo (sin migración DDL)

En `students.emergency_contact` (JSONB ya existente), añadir:

```json
{
  "personGroupId": "c4acd9af-a0c6-4e25-9bb0-a68eeb8d4236",
  "personGroupLabel": "Camila Valentina (Violín + Guitarra)"
}
```

- `personGroupId`: UUID compartido por todos los registros de la misma persona. Se usa el `id` del registro **más antiguo** como ancla.
- `personGroupLabel`: texto legible para UI y humano.
- **Sin `ALTER TABLE`.** No se toca el esquema (ADR-0119: producción).

### 4.2 Familia compartida

Los registros del mismo grupo comparten `family_id` (el de la familia real del apoderado).

- Camila: ambos usan la familia de **Olivia Norma Conco**.
- Mario: ambos usan **Familia Martel Emiliano**.
- JAN/JAM: cada uno conserva su familia hasta confirmar datos de pago de la adulta.

### 4.3 Por qué NO fusionar los registros

Son **2 matrículas reales**: distinto instrumento, docente, sala, horario, plan y cuota. Fusionarlas rompería el Kardex (ADR-0131/0165) y el cálculo de ciclos. Se **vinculan**, no se fusionan.

---

## 5. FASES DE EJECUCIÓN

### FASE 1 — Código de vínculo y detección (SIN tocar datos)

1. `src/lib/student-person-group.ts` (nuevo, puro):
   - `buildPersonGroupIndex(students)` → `Map<personGroupId, AdminStudent[]>`
   - `resolvePersonGroup(student)` → registros hermanos
   - `detectSamePersonCandidates(candidate, students)` → candidatos por **nacimiento + apoderado** (nunca solo nacimiento)
   - `describeInstrumentBundle(students)` → `"Violín + Guitarra"`
2. `AddNewStudentDialog`: aviso `⚠️ Este alumno ya existe con otro instrumento` cuando `detectSamePersonCandidates` devuelva algo, con opción de vincular. **No bloquea**: informa y ofrece.
3. **Cero escrituras.** Fase 1 es solo lectura + UI.

### FASE 2 — Agrupación en facturación (solo lectura)

1. `/admin/facturacion`: agrupar recibos por `personGroupId`.
   - Antes: 2 filas sueltas (`Mario Kefren` S/ 261 / `Mario Keffreen` S/ 261)
   - Después: 1 bloque `Mario Kefren — Guitarra + Batería · S/ 522 · pagado`
2. El desglose por instrumento sigue visible al expandir.
3. **Cero escrituras.** Si no hay `personGroupId`, todo se comporta como hoy.

### FASE 3 — Migración de datos (REQUIERE CONFIRMACIÓN EXPLÍCITA)

Por caso, y uno por uno:

1. Escribir `personGroupId` + `personGroupLabel` en ambos registros.
2. Alinear `family_id` al de la familia del apoderado.
3. **Verificar leyendo de vuelta** que no cambió ningún monto.
4. **NO eliminar** el alumno histórico `00000000-...0045` (`baja`, S/ 261 cobrados). Solo se decide con Dirección y la contabilidad a la vista.
5. Re-verificar que el total facturado no cambió.

**Protocolo obligatorio:**
- Backup de los valores previos **antes** de escribir.
- Un caso → verificar → siguiente caso. Nunca los 3 de golpe.
- `npm run build` en verde entre casos.
- Prohibido `DELETE` sobre `students`, `families`, `invoices` de alumnos activos.
- Prohibido `TRUNCATE`.
- Si un monto cambia o no cuadra, **STOP** y reportar.

---

## 6. REGLAS ARQUITECTÓNICAS (STOP & VERIFY)

1. **Intocables:** prohibido modificar `src/store/app-store.ts`, `src/lib/kardex-calculator.ts`, `src/lib/student-cycle.ts`.
2. **Prohibido tocar `isMatchingStudentName` / `normalizeStudentName`**: son la deduplicación de ADR-0107 y ya causaron el incidente ADR-0119.
3. **Identidad por UUID.** Nunca comparar montos o personas por nombre de texto.
4. **Una sola fuente** para la detección: `student-person-group.ts`. Prohibido reimplementar el criterio en cada vista (ADR-0119.3).
5. **Cero datos financieros** en vistas pedagógicas (`/teacher`, `/admin/informes`).
6. **Cero cambios de esquema.** Todo va en `emergency_contact` JSONB.
7. **Producción:** cada fase con build verde y verificación en vivo antes de la siguiente.

---

## 7. RIESGOS Y MITIGACIONES

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Alinear `family_id` duplica recibos | Facturación inflada | Verificar count de `invoices` antes/después |
| Agrupar falsos positivos (Aaron/Sylvia) | Pacientes mal vinculados | Exigir nacimiento **+ apoderado**; nunca solo fecha |
| Fusionar en vez de vincular | Rompe Kardex/ciclos | Solo `personGroupId`, jamás mover `scheduleLessons` |
| Tocar el matching de nombres | Incidente ADR-0119 | Prohibido por regla §6.2 |
| Recibo huérfano mal borrado | Pérdida de dato | Verificar que ningún alumno lo referencia antes |
| Confusión al cobrar | Cobro doble o pérdida | Agrupación visual + desglose por instrumento |

---

## 8. CHECKLIST DE CIERRE (por fase)

- [ ] `npm run build` en verde.
- [ ] `git diff --stat` vacío en los 3 archivos prohibidos.
- [ ] Cero `ALTER TABLE`, cero `DROP`, cero `TRUNCATE`.
- [ ] Totales de facturación idénticos antes y después (solo cambia el **agrupamiento**, no el monto).
- [ ] ADR-0186 + `docs/logs/` + CHANGELOG + AGENTS §89 en el mismo commit.
- [ ] Log con `git add -f` (`.gitignore` ignora `*.log`).
- [ ] Push a `origin main` y `core main`, verificado con `git ls-remote`.
- [ ] Resumen guardado en engram.

---

## 9. DATOS CONFIRMADOS POR DIRECCIÓN

- ✅ Camila: 2 instrumentos, 2 registros. Apoderado **Olivia Norma Conco** en ambos.
- ✅ Mario: 2 instrumentos, 2 registros. Tutor **Janett Emiliano Solano**, tel **959463744** en ambos.
- ✅ JAN/JAM: misma persona adulta, 2 instrumentos.
- ✅ El recibo `Camila Pastor Conco` **NO se elimina**: es un alumno real en `baja` con S/ 261 cobrados (semilla antigua). Se excluye de vistas activas y se decide aparte con contabilidad.
- ✅ Aplicar a futuros casos, no solo a estos tres.
