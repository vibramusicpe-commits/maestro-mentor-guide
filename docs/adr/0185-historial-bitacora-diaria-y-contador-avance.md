# ADR-0185: Historial de Bitácora Diaria (Dirección y Docente) y Contador de Avance del Ciclo

**Fecha:** 2026-11-03
**Estado:** Implementado y verificado con datos vivos de producción.
**Autores:** Equipo Vibra (Open Code & Dirección)
**Versión:** 2.0.56
**Relación:** ADR-0184 (§87), ADR-0183 (§86), ADR-0175, ADR-0180, ADR-0182, ADR-0119.3, ADR-0140

---

## Contexto

ADR-0184 dejó el Kiosco diciendo "✓ Bitácora registrada" y a Dirección con un tablero de **conteos**. Pero Dirección planteó el hueco correcto:

> *"¿Dónde se mostrarán los reportes? Los reportes son diarios y el panel de administración también debería verlo... ¿Cómo se trabajará esa lógica visual?"*

**Diagnóstico real antes de este ADR:**

| Vista existente | Qué mostraba | Qué faltaba |
|---|---|---|
| `/teacher` (tarjeta) | Botón de bitácora | No se podía **releer** lo registrado |
| `/admin/informes` → Seguimiento | **Contadores** por alumno ("Hans: 1") | No se podía **leer** la bitácora |
| `/admin/informes` → Adopción | Bitácoras **sumadas** por docente | No se veía el **contenido** |

Nadie podía leer qué se trabajó en clase. El sistema parecía vacío porque no dejaba ver lo que ya existía.

### Aclaración terminológica (queda fijada)

| Término | Entidad | Naturaleza |
|---|---|---|
| **Bitácora / Reporte de clase** | `lesson_evaluations` | **Diaria**, por clase, la llena el docente |
| **Informe de progreso** | `progress_reports` | **Del ciclo**, consolidado, lo publica Dirección |

Este ADR construye la vista de la **bitácora diaria**. El informe ya tenía bandeja (ADR-0175/0180).

---

## Decisiones

### 1. Servicio único de listado (`src/lib/services/bitacora.service.ts`)

- `listBitacoras({ from, to, teacherId?, studentId?, limit? })`:
  - Filtra **`is_test = eq.false`** en la consulta **y** revalida en cliente.
  - Rango por `and=(session_date.gte.X,session_date.lte.Y)`, mismo patrón que `getStudentEvaluations`.
  - Orden `session_date.desc, start_time.desc`.
  - `limit` acotado a 1–1000 (defecto 500).
  - Rechaza fechas inválidas y rangos invertidos.
  - **Solo lectura**: no expone create/update/delete.
- `groupBitacorasByDate(rows)`: agrupa por fecha conservando orden.
- **Prohibido reimplementar esta consulta dentro de un componente** (ADR-0119.3).

### 2. Componente compartido (`src/components/informes/bitacora-history.tsx`)

**Un solo componente para dos públicos**:

| Dónde | Filtro | Muestra docente |
|---|---|---|
| `/admin/informes` → pestaña **"Bitácora Diaria"** | Todos | Sí |
| `/teacher` → **"Mi bitácora"** | Solo el docente logueado | No |

**UX amigable:**
- Navegación **semanal** con `‹` / `›` y botón **"Hoy"**; semana empieza **lunes**.
- Fechas en lenguaje humano: **"Hoy"**, **"Ayer"**, **"vie 23 oct"**.
- Cada clase es una fila táctil (mín. 44 px, ADR-0177) con **hora + alumno + píldora de estado + instrumento · docente**.
- Tocar la fila despliega el detalle: **tema, repertorio, tarea y comentario**.
- Solo se muestra la flecha `▾` si hay algo que desplegar (no se simula contenido).
- Estados legibles: `Logrado`, `En proceso`, `Necesita refuerzo`, `Sin evaluar`, **`No aplicó`** (§78: nunca el valor crudo `no_corresponde`).
- Estado vacío con instrucción útil, nunca una tabla en blanco.
- Error de red ⇒ mensaje claro, el panel no se rompe.

### 3. Contador de avance del ciclo (`src/lib/informes/bitacora-progress.ts`)

Implementa **D1** (autorizado por Dirección en ADR-0184).

- **Reutiliza** `computeStudentCycleSessions` (kardex) y `computeStudentReportReadiness` / `minimumEvaluations`. **Prohibido reimplementar**.
- **`kardex-calculator.ts` se importa solo en lectura**: verificado con `git diff --stat` vacío.
- Devuelve `{ done, required, canGenerate, label, percent }` o **`null`** si falta información.
  - Preferible **no mostrar nada** que mostrar una meta inventada.
- Texto en el Kiosco:
  - `Bitácoras del ciclo: 3/8 · Informe disponible ✅`
  - `Bitácoras del ciclo: 1/8 · Faltan 7 para el informe`
- Barra de progreso simple; verde al alcanzar el mínimo.
- **Cero datos financieros.**

### 4. El Set de sesiones evaluadas ahora expone las filas

`useSessionEvaluations` devuelve además `rows: LessonEvaluationRow[]`, necesario para calcular el avance sin una consulta extra. Se mantiene la regla de **una consulta por alumno y rango**.

---

## Bug detectado y corregido durante la verificación

`friendlyDateLabel()` restaba 1 a `getMonth()`, que **ya devuelve 0–11**. Resultado: **octubre se mostraba como "set"**.

```
antes:  2026-10-23 -> vie 23 set   ❌
después: 2026-10-23 -> vie 23 oct   ✅
```

Documentado en el código para que no se reintroduzca. Sin este dato, la vista habría mentido sobre cada fecha del historial.

---

## Verificación con datos vivos

`scratch/test-bitacora-historial.mjs` y `scratch/test-bitacora-ui.mjs` (`vite.ssrLoadModule`):

```
bitácoras reales en producción: 3
 - 2026-10-23 17:30 | Jeremy   | ALEXIS                    | Guitarra clásica | sin_evaluar | Cariñito (libro), trabajo de acordes con cejilla
 - 2026-10-22 16:45 | Fernando | Hans                      | Piano            | en_proceso  | —
 - 2026-10-21 16:45 | Nathaly  | Fernanda Sofía Fajardo Condo | Canto         | logrado     | RELAJACION, RESPIRACIÓN, PROYECCION, LENGUAJE CORPORAL

agrupadas por fecha: 2026-10-23(1), 2026-10-22(1), 2026-10-21(1)
filas is_test en el resultado: 0  ✅

fechas legibles:
  2026-11-03 -> Hoy
  2026-11-02 -> Ayer
  2026-10-23 -> vie 23 oct   ✅ (corregido)
  2026-10-22 -> jue 22 oct
  2026-10-21 -> mié 21 oct

filtro por docente:
  Jeremy  -> 1 ✅
  Nathaly -> 1 ✅

rango invertido -> "La fecha inicial no puede ser posterior a la final." ✅
```

`scratch/test-bitacora-progress.mjs`:

```
progreso: { done: 1, required: 2, canGenerate: false,
            label: "Bitácoras del ciclo: 1/2 · Faltan 1 para el informe", percent: 50 }
sin datos -> null ✅
```

`npm run build` en verde. `app-store.ts`, `kardex-calculator.ts` y `student-cycle.ts` **sin cambios**.

---

## Consecuencias

**Positivas:**
- Dirección puede **leer** qué se trabajó cada día, por alumno y docente.
- El docente ve su propio historial y su avance hacia el informe.
- El sistema deja de "parecer vacío": las 3 bitácoras existentes ahora son visibles.

**Límites honestos:**
- Con **3 bitácoras** en producción, la vista mostrará 3 filas en la semana del 21-23 de octubre. No es un problema de la vista: es el estado real de adopción.
- No hay aún buscador por alumno dentro del historial (filtro por docente y semana). Se puede añadir cuando haya volumen.
- No se implementó exportación CSV del historial. Fuera de alcance.

## Riesgos residuales

1. **`limit` 500** por consulta: suficiente para una semana de una escuela de este tamaño. Si crece, paginar.
2. **Sin caché**: cada cambio de semana consulta PostgreSQL. Es intencional (ADR-0119: PostgreSQL es la única fuente de verdad para datos transaccionales).
3. **El contador depende del ciclo contractual**: si un alumno no tiene `planStartDate`/plan definido, devuelve `null` y no se muestra. Es el comportamiento correcto.
