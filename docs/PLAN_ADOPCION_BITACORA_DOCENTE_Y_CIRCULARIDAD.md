# PLAN OPERATIVO: ADOPCIÓN REAL DE LA BITÁCORA DOCENTE Y CIRCULARIDAD DEL FLUJO PEDAGÓGICO

**Fecha de emisión:** 2026-11-03
**Versión base:** 2.0.54 (Commit `b86e601`)
**Autor:** Open Code (ejecutor) — basado en directrices de Dirección
**Estado:** Propuesta para aprobación. **Nada de este documento está implementado aún.**
**Relación:** Complementa ADR-0183 (§86) y ADR-0175, ADR-0180, ADR-0182.

---

## 0. RESUMEN EJECUTIVO

ADR-0183 resolvió la **nomenclatura** (ya no confundimos Auditoría con Informes) y la **fricción de UI** (el botón de bitácora se ve y el guardado da feedback). Pero quedó demostrado que eso no mueve la aguja operativa:

| Métrica real en producción (2026-11-03) | Valor |
|---|---|
| `lesson_evaluations` (bitácoras de clase) | **3 registros** en toda la historia |
| `progress_reports` (informes) | **0 registros** |
| Docentes en el piloto | 3 (Jeremy, Fernando, Nathaly) |
| Alumnos activos | 57 |

**El diagnóstico honesto:** la UI ya no es el cuello de botella. El cuello de botella es que **el docente no tiene un motivo visible para registrar la bitácora ni una meta alcanzable**, y **Dirección no tiene forma de acompañarlo día a día**. Este plan ataca eso en tres frentes:

1. **Frente A — Docente (Código):** el botón sabe si la sesión ya se registró y muestra el avance hacia el informe.
2. **Frente B — Docente (Acompañamiento):** acompañar a Jeremy, Fernando y Nathaly de la mano, con meta semanal, material de una página y seguimiento nominal.
3. **Frente C — Dirección (Código):** tablero de adopción que muestre quién registra y quién no, por docente y por semana.

---

## 1. MARCO CONCEPTUAL INNEGOCIABLE (no re-litigar)

Estas tres entidades son distintas y así se mantienen. Cualquier cambio futuro debe respetar esta tabla (ADR-0183, §86):

| # | Entidad | Tabla | Quién | Duración | Para quién |
|---|---|---|---|---|---|
| 1 | **Bitácora / Reporte de Clase** | `lesson_evaluations` | Docente en aula | 2-3 min | Uso interno pedagógico |
| 2 | **Informe Pedagógico** | `progress_reports` | Docente redacta, Dirección publica | Ciclo lectivo | Apoderado (A4/PDF/WhatsApp) |
| 3 | **Auditoría de Alumnos** | `students`/`invoices`/`payment_audit_logs` | Dirección/Secretaría | Continuo | Cobranzas (S/ PEN) |

**Regla dura:** el Informe es un **consolidado de bitácoras + asistencia**. Nunca se alimenta de otro informe, nunca de la vista de Auditoría, nunca se inventa contenido pedagógico sin evidencia real (ADR-0180).

---

## 2. FRENTE A — CÓDIGO: DOCENTE (`/teacher`)

### A.1 Estado "✓ Ya registrada" en el botón de bitácora

**Problema:** hoy el docente abre la bitácora sin saber si esa sesión ya la registró. Puede duplicar trabajo o creer que perdió lo escrito. El guardado es idempotente por `session_key`, pero eso es invisible para él.

**Solución (sin tocar motores prohibidos):**

- Nuevo hook ligero `src/hooks/use-session-evaluations.ts`:
  - Llama a `getStudentEvaluations(studentId, { from, to })` — **ya existe** en `src/lib/services/evaluations.service.ts:253`, no se modifica.
  - Devuelve `Map<string, LessonEvaluationRow>` indexado por clave `${session_date}::${start_time.slice(0,5)}`.
  - Filtra siempre `is_test = false` (contrato del servicio, ADR-0175).
  - Se invoca **una sola vez por alumno y semana** visible en el Kiosco, no por tarjeta (evita N+1).

- En `teacher.index.tsx`, la tarjeta de clase resuelve:
  - `evaluated = evaluationMap.has(sessionKey)`
  - Etiqueta del botón:
    - `evaluated` → **`✓ Bitácora registrada · Ver / Editar`** (estilo neutro con check verde).
    - `!evaluated && status === "presente"` → **`📝 Llenar bitácora de hoy (2 min)`** (realce estático ya existente).
    - `!evaluated && status !== "presente"` → **`📝 Bitácora de clase`**.

**Restricciones:** `<ClassLog>` ya soporta edición vía `getEvaluationBySessionKey` con la misma `session_key`, así que no se modifica el componente.

> **Hallazgo de verificación (obligatorio corregir en Fase 1):** `getEvaluationBySessionKey` (`evaluations.service.ts:238`) consulta `lesson_evaluations` **sin filtro `is_test`**. `getStudentEvaluations` sí filtra por defecto (`params.is_test = "eq.false"` cuando no se pasa `includeTest`). Para la detección de "✓ Ya registrada" en el Kiosco se usará **`getStudentEvaluations`** (ya filtra), **no** `getEvaluationBySessionKey`. Si en el futuro se usa esta última, primero hay que añadirle el filtro `is_test = eq.false`, que es requisito de la regla §3.3 del plan quirúrgico previo.

### A.2 Contador de avance hacia el informe

**Problema:** el docente no sabe que le faltan 2 bitácoras para poder emitir el informe del ciclo. Sin meta visible, no hay hábito.

**Solución:**

- Reutilizar el motor oficial `computeStudentReportReadiness()` (`src/lib/informes/report-readiness.ts:331`) — **prohibido reimplementar el cálculo**.
- En la tarjeta (o en una franja superior del día), una línea discreta:
  - `Bitácoras del ciclo: 3/8 · Informe disponible ✅` (si `canGenerate`).
  - `Bitácoras del ciclo: 1/8 · Faltan 7 para el informe` (si no).
- **Cero datos financieros** en esta franja.

> **Decisión pendiente de aprobación:** este contador requiere las `sessions` del ciclo del alumno (`StudentSessionItem[]`), que es justo lo que consume `computeStudentCycleSessions` de `kardex-calculator.ts`. **La regla dice que no se modifica ese archivo**, pero aquí solo se **consume** (import de lectura, sin editar una línea). Confirmar que consumirlo es aceptable; si no lo es, el contador se limita a mostrar `N bitácoras registradas` sin denominador, y la meta llega por WhatsApp (Frente B).

### A.3 Jerarquía visual del Kiosco (sin ruido nuevo)

- La bitácora sigue siendo **secundaria** frente a la asistencia: no se mueve encima de los 4 botones de estado.
- Se **descarta** cualquier animación (`animate-pulse`) por la razón documentada en ADR-0183: varias tarjetas en `presente` parpadeando a la vez saturan la pantalla y compiten con la acción principal.

---

## 3. FRENTE B — ACOMPAÑAMIENTO DOCENTE (sin código)

> Este frente es el que realmente destraba los números. Se ejecuta **en paralelo** al Frente A.

### B.1 Meta semanal única y alcanzable

- **Meta:** cada docente registra **al menos 2 bitácoras por semana** (≈2 alumnos distintos).
- Con 3 docentes → **6 bitácoras/semana** → en **2 semanas** se cumplen los mínimos para los primeros informes del ciclo.
- La meta **no es** "llena todo": es 2. Es un arranque, no una carga.

### B.2 Material de una página (entregable de este plan)

- Documento `docs/GUIA_BITACORA_DOCENTE.md` (crear en esta fase):
  - Qué es la bitácora en 2 frases: *"No es un informe. Es lo que trabajamos hoy en 3 clics."*
  - Dónde está: `/teacher` → tarjeta del alumno → `📝 Bitácora de clase`.
  - Las 4 cosas que se marcan: tema, 1-2 criterios, repertorio, tarea.
  - Qué pasa después: Dirección consolida y entrega el informe al apoderado.
  - Qué **no** hay que hacer: no escribir párrafos, no duplicar.
- Formato: Markdown en el repo + versión imprimible/WhatsApp para enviar al grupo.

### B.3 Seguimiento nominal (quién registra y quién no)

- **Día 1:** se envía la guía a Jeremy, Fernando y Nathaly con la meta de 2/semana.
- **Día 4 (miércoles):** Dirección revisa el tablero del Frente C y escribe **solo a quien tiene 0**.
- **Día 7 (cierre semanal):** se reconoce públicamente a quien cumplió; se pregunta al que no **qué le estorbó** (no se sanciona: si no registró, el problema es del proceso, no de la persona).
- **Día 14:** con ≥2 por docente, se emite el **primer informe piloto real** de un alumno de Jeremy y se revisa el PDF A4 con Dirección.

### B.4 Criterio de éxito medible

| Hito | Métrica | Fecha objetivo |
|---|---|---|
| Arranque | 6 bitácoras nuevas (2 × 3 docentes) | Semana 1 |
| Sostenibilidad | ≥6 bitácoras/semana durante 2 semanas seguidas | Semana 2 |
| Primer valor | 1 `progress_reports` en estado `published` | Semana 3 |
| Apertura | `parentReports = true` para familias piloto | Semana 4 |

---

## 4. FRENTE C — CÓDIGO: DIRECCIÓN (tablero de adopción)

### C.1 Panel "Adopción Docente" en `/admin/informes`

- Nueva pestaña **`👥 Adopción Docente`** junto a "Seguimiento de Alumnos" y "Bandeja General".
- Componente nuevo `src/components/admin/teacher-adoption-panel.tsx` (no se modifica el tracker existente).
- Contenido por docente (Jeremy, Fernando, Nathaly):
  - Bitácoras registradas en el mes / en la semana en curso.
  - Semáforo de la meta de 2/semana: 🟢 cumplió · 🟡 fue 1 · 🔴 0.
  - Última bitácora registrada (fecha).
  - Alumnos de su cohorte sin ninguna bitácora.
- Fuente de datos: `getEvaluationsSummaryMap()` (ya existe, `is_test = false`) + conteo por `session_date`.
- **Cero datos financieros.** Solo pedagogía.

### C.2 Fuera de alcance explícitamente

- **No** se implementan recordatorios automáticos por WhatsApp (consume tokens/costo y hay ADR-0140 de costo cero).
- **No** se añaden notificaciones push.
- **No** se sanciona ni se calcula desempeño económico con esta métrica.

---

## 5. ORDEN DE EJECUCIÓN Y BLOQUEOS

```
FASE 0 (hoy, sin código)  → Enviar guía B.2 a los 3 docentes. Arranca la meta B.1.
FASE 1 (código ~1h)       → A.1 "✓ Ya registrada" (independiente, bajo riesgo)
FASE 2 (código ~1h)       → C.1 Tablero de adopción (Dirección ve el avance)
FASE 3 (decisión)         → A.2 Contador de avance (requiere OK sobre consumir kardex-calculator)
FASE 4 (sin código)       → B.3 seguimiento + B.4 primer informe piloto
```

**Por qué la Fase 0 va antes que el código:** si los docentes no reciben la guía hoy, el código solo cambia lo que ya no usan.

---

## 6. RIESGOS Y MITIGACIONES

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El docente percibe la bitácora como "trabajo extra" | No la usa | Guía de 1 página + meta de solo 2/semana + "2 min" visible en UI |
| El contador de avance se percibe como presión/sanción | Rechazo | Etiqueta neutra, sin ranking público, sin cruce con sueldos (ADR-0181) |
| Se duplican cálculos de readiness | Divergencia (patrón ADR-0119.3) | Reutilizar `computeStudentReportReadiness`, prohibido reimplementar |
| N+1 en `/teacher` | Kiosco lento en celular | Una consulta por alumno-semana, no por tarjeta |
| `kardex-calculator.ts` se toca por error | Rompe kardex/asistencia/facturación | Solo import de lectura; verificar con graphify antes de editar |
| La métrica de adopción se usa para sancionar | Desconfianza | Declarado fuera de alcance en C.2 y en §86 |

---

## 7. CHECKLIST DE CIERRE (sin vacíos)

Antes de dar por terminada cualquier fase:

- [ ] `npm run build` en verde (obligatorio; ver lección ADR-0172 §6 sobre JSX roto).
- [ ] Consulta de impacto en **graphify** para todo archivo compartido tocado.
- [ ] Confirmar que `app-store.ts`, `kardex-calculator.ts`, `student-cycle.ts` **no** fueron modificados (`git diff --stat`).
- [ ] Confirmar `is_test = false` en toda consulta nueva (usar `getStudentEvaluations`, que ya filtra; **no** `getEvaluationBySessionKey`, que hoy no filtra).
- [ ] Confirmar cero `S/` en `/teacher` y `/admin/informes`.
- [ ] Actualizar ADR-0183 (o nuevo ADR-0184) + CHANGELOG + AGENTS §86 **en el mismo commit**.
- [ ] Push a `origin main` **y** `core main`, verificado con `git ls-remote`.
- [ ] Guardar resumen del estado en **engram** (ADR-0120: no re-descubrir en la próxima sesión).

---

## 8. LO QUE NECESITO DE TI PARA ARRANCAR

1. **¿Apruebas Fase 0 + Fase 1 + Fase 2** (guía + "✓ Ya registrada" + tablero de adopción)? Es lo de menor riesgo y mayor efecto inmediato.
2. **¿Autorizas que `/teacher` importe `computeStudentCycleSessions` solo en lectura** para el contador A.2? Si prefieres no tocarlo, A.2 se degrada a "N bitácoras registradas" sin denominador.
3. **¿Quién es el contacto directo de cada docente** para el Frente B (tú, secretaría, o Dirección)? Define quién manda la guía y quién hace el seguimiento del día 4.
