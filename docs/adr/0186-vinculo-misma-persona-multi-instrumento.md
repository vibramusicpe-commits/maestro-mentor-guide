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

### 5. Fase 3 — Migración de datos (pendiente)

Requiere confirmación explícita de Dirección, caso por caso:

1. Escribir `personGroupId` + `personGroupLabel` en ambos registros.
2. Alinear `family_id` a la familia real del apoderado.
3. Verificar leyendo de vuelta que **ningún monto cambió**.
4. **No eliminar** el histórico `00000000-…0045`.

Protocolo: backup previo → un caso → verificar → siguiente caso. Nunca los tres de golpe.

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
- La Fase 2 no agrupa nada hasta que exista `personGroupId` en los datos. Hoy el vínculo está en **cero** registros: la vista se comporta igual que antes.
- La detección automática **no cubre** adultos con alias (JAN/JAM): requieren vínculo explícito.
- No hay UI para editar `personGroupId` manualmente todavía. Se resuelve en la Fase 3.
