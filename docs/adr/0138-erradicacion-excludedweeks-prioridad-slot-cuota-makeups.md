# ADR-0138: Erradicación de ExcludedWeeks Relativos, Prioridad Determinista de Slot en Deduplicación y Preservación Universal de Cuota para Clases de Recuperación (Makeups)

## Estado
Aceptado

## Contexto e Incidente
En la operación en producción de Vibra Music Staff, se reportó un caso crítico al reprogramar una falta de la alumna **Yasumi Cielo Chamorro Amasifuen** (Piano, Prof. Fernando, Sala B, Plan Regular de 8 clases). La alumna presentaba 6 clases asistidas (`presente`) y 2 faltas (`ausente`), acumulando créditos para recuperar ambas sesiones.

Al intentar reprogramar una de sus faltas para el **Martes 29/09/2026**:
1. La otra falta existente en el historial desapareció visualmente del Kardex.
2. El Kardex pasó a mostrar únicamente 6 clases en lugar de 8.
3. Al intentar revertir la reprogramación, la visualización quedó permanentemente desconfigurada con solo 6 clases.

La investigación exhaustiva demostró que esta falla no era un caso aislado de una alumna, sino un **vicio arquitectónico latente** que afectaba a cualquier alumno al reprogramar o revertir clases puntuales.

---

## Causa Raíz (RCA)

### 1. Índices Relativos `excludedWeeks` vs. Plantillas Recurrentes sin Mes (`month: undefined`)
Por diseño arquitectónico (ADR-0103), las plantillas de lecciones semanales de los alumnos no poseen un mes fijo (`month: undefined`) para que se proyecten automáticamente a través de todos los meses de vigencia del ciclo.
Sin embargo, `rescheduleLesson` almacenaba un índice semanal relativo al mes (`excludedWeeks: [targetWeekIndex]`, por ejemplo `[0]` o `[2]`).
Consecuencia catastrófica: Al excluir la semana 0 o 2 para una fecha puntual de Setiembre, el array `excludedWeeks: [0, 2]` excluía automáticamente la semana 0 y 2 en **Agosto, Setiembre, Octubre y cualquier mes futuro**, borrando clases legítimas como Martes 01/09 (Semana 0) y Jueves 17/09 (Semana 2).

### 2. Pérdida Histórica en la Guarda de `excludedDates`
El filtro del Kardex descartaba ciegamente cualquier lección cuya fecha estuviera en `lesson.excludedDates`:
```typescript
if (lesson.excludedDates && lesson.excludedDates.includes(curDateStr)) {
  return; // ❌ Descartaba la sesión incluso si ya tenía asistencia evaluada
}
```
Esto eliminaba del Kardex la falta original del alumno (`ausente`), impidiendo ver la inasistencia histórica y generando una inconsistencia visual en el conteo total de clases.

### 3. Asimetría en la Reversión (`revertMakeupLesson`)
Al pulsar "Revertir", la función eliminaba la fecha de `excludedDates`, pero **nunca limpiaba `excludedWeeks`**. Por lo tanto, una vez que una lección quedaba contaminada con `excludedWeeks: [0]`, el daño quedaba grabado permanentemente en PostgreSQL, perpetuando la pérdida de clases incluso después de cancelar la reprogramación.

### 4. Conflicto de Deduplicación por Coincidencia Horaria (Slot Collision)
Cuando una sesión de recuperación (`isMakeup: true`) se programaba en un turno que coincidía con la lección regular recurrente (por ejemplo, Martes a las 19:00), la ordenación por defecto de `rawCandidates` procesaba primero la lección recurrente abierta (`isMakeup: false, status: "pendiente"`).
Al deduplicar por `dateStr-time`, la lección recurrente tomaba el slot y la clase de recuperación `isMakeup: true` era descartada como duplicado.

### 5. Supresión Prematura de Clases de Recuperación por Cuota
Cuando un alumno completaba 8 clases evaluadas (por ejemplo, 6 presentes + 2 faltas = 8 evaluadas), el algoritmo de cuota ejecutaba `if (evaluated.length >= targetQuota) finalSessions = evaluated;`, podando automáticamente todas las recuperaciones agendadas (`pendingMakeups`), violando el principio institucional innegociable: **"Las clases no se pierden, se recuperan"** (ADR-0134).

---

## Decisiones Técnicas Fundamentales

### 1. Erradicación Absoluta de `excludedWeeks` en Reprogramaciones Puntuales
- En `src/store/app-store.ts` (`rescheduleLesson`): Cuando la reprogramación proviene de una fecha exacta (`originalDateStr`), el sistema **NUNCA** inyecta índices numéricos en `excludedWeeks`; la exclusión se restringe estrictamente a `excludedDates: ["YYYY-MM-DD"]`.
- En `revertMakeupLesson`: Al revertir una sesión de recuperación, se purga preventivamente `excludedWeeks: []`, eliminando cualquier remanente histórico en la plantilla semanal tanto en Zustand como en PostgreSQL.

### 2. Preservación Incondicional de Asistencias Evaluadas frente a `excludedDates`
Tanto en `student-attendance-kardex.tsx` como en `kardex-calculator.ts`:
```typescript
if (lesson.excludedDates && lesson.excludedDates.includes(curDateStr)) {
  // 🛡️ REGLA INNEGOCIABLE DE PRESERVACIÓN (ADR-0100 & ADR-0105): Si la fecha ya cuenta con
  // asistencia evaluada (presente, ausente, justificada, tarde), DEBE preservarse para el
  // registro histórico del Kardex, permitiendo ver la falta original y su recuperación
  const hasEvaluated = lesson.attendanceByDate &&
    lesson.attendanceByDate[curDateStr] &&
    lesson.attendanceByDate[curDateStr] !== "pendiente";
  if (!hasEvaluated) {
    return;
  }
}
```

### 3. Prioridad Determinista de Slot en Deduplicación (`rawCandidates.sort`)
Al ordenar las clases antes de deduplicar por `dateStr-time`, se establece un desempate jerárquico estricto:
1. **Prioridad 1**: Sesión evaluada (`presente`, `ausente`, `tarde`, `justificada`) prevalece incondicionalmente sobre cualquier sesión pendiente.
2. **Prioridad 2**: Sesión de recuperación puntual (`isMakeup: true`) prevalece sobre lecciones recurrentes abiertas.
Esto garantiza que una clase de recuperación agendada en el mismo día y hora que una lección recurrente se conserve intacta en el Kardex.

### 4. Preservación Universal de Cuota para Clases de Recuperación (Makeups)
En el algoritmo de corte de cuota:
- Se aíslan `pendingMakeups` (`isMakeup: true, status: "pendiente"`) de las `pendingRegular`.
- Las clases pendientes de recuperación **JAMÁS** son descartadas por la cuota contractual si el alumno tiene inasistencias por compensar:
```typescript
const attendedCount = evaluated.filter((s) => s.status === "presente").length;
const attendedOrScheduled = attendedCount + pendingMakeups.length;

if (evaluated.length >= targetQuota && attendedOrScheduled >= targetQuota && pendingMakeups.length === 0) {
  finalSessions = evaluated;
} else {
  const slotsNeeded = Math.max(0, targetQuota - evaluated.length - pendingMakeups.length);
  const chosenPendingRegular = pendingRegular.slice(0, slotsNeeded);
  const combined = [...evaluated, ...pendingMakeups, ...chosenPendingRegular];
  // Ordenar y numerar correlativamente
  finalSessions = combined;
}
```

### 5. Saneamiento Quirúrgico de la Base de Datos en Producción (PostgreSQL)
Se identificaron y sanearon los registros de alumnos activos en producción que habían sido afectados por el vicio de `excludedWeeks`:
1. **Yasumi Cielo Chamorro Amasifuen** (`227ffd56-44c2-4672-a3ce-d5000a8b6bf0`):
   - `excludedWeeks: []` en lecciones de Mar y Jue.
   - `excludedDates: ["2026-08-25"]` en Mar (falta recuperada el 22/09) y `["2026-09-03"]` en Jue (falta reprogramada al 29/09).
   - Lección de recuperación agendada para el Martes 29/09/2026 a las 19:00 en Sala B con Prof. Fernando.
   - Vigencia contractual extendida a `planEndDate: "2026-10-05"`.
2. **Karlitoz Pazos Huatuco** (`10ab2288-40ea-4032-84c2-ec168d98880f`):
   - `excludedWeeks: []` en lecciones de Lun y Mié, manteniendo sus `excludedDates` e historiales intactos (8 de 8 sesiones completas).
3. **Mia Lucero Bellido Alvan** (`892bcc0b-d635-465e-a823-1dc339eafe74`):
   - `excludedWeeks: []` en lecciones de Vie y Sáb, manteniendo sus `excludedDates` y makeups activos (8 de 8 sesiones completas).

---

## Verificación y Resultados
- **Simulación y Kardex Calculator**:
  - `Karlitoz Pazos Huatuco`: 8 clases exactas proyectadas (6 asistencias, 2 faltas recuperadas).
  - `Mia Lucero Bellido Alvan`: 8 clases exactas proyectadas (2 asistencias, 3 faltas/justificadas recuperadas, 1 pendiente).
  - `Yasumi Cielo Chamorro Amasifuen`: 11 sesiones auditadas con total transparencia: 7 presentes, 3 ausentes históricas preservadas, 1 recuperación asistida (22/09) y 1 recuperación agendada pendiente para el 29/09.
- **Build de Producción**:
  - `npm run build` ejecutado exitosamente con 0 errores TypeScript y compresión Nitro limpia en 622ms.
