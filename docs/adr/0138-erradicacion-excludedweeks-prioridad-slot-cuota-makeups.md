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

### 2. Aislamiento Estricto por Fecha en Reprogramaciones Puntuales (`excludedDates`)
- Al reprogramar una clase con alcance puntual (`only-this-week`), la fecha original se registra en `excludedDates` de la lección base semanal para que la sesión original no se duplique en ese día.
- La nueva clase reprogramada (`isMakeup: true`) con fecha exacta (`dateStr: "YYYY-MM-DD"`) toma su lugar en el cronograma dentro del ciclo activo del alumno.
- Las demás clases del ciclo (incluyendo otras inasistencias o faltas como Jueves 03/09) se mantienen intactas e independientes.

### 3. Prioridad Determinista de Slot en Deduplicación (`rawCandidates.sort`)
Al ordenar las clases antes de deduplicar por `dateStr-time`, se establece un desempate jerárquico estricto:
1. **Prioridad 1**: Sesión evaluada (`presente`, `ausente`, `tarde`, `justificada`) prevalece incondicionalmente sobre cualquier sesión pendiente.
2. **Prioridad 2**: Sesión de recuperación puntual (`isMakeup: true`) prevalece sobre lecciones recurrentes abiertas.
Esto garantiza que una clase de recuperación agendada en el mismo día y hora que una lección recurrente se conserve intacta en el Kardex.

### 4. Cumplimiento Invariable de la Cuota Contractual (Exactamente 8 Clases en Plan Regular)
En el algoritmo de corte de cuota:
- El Kardex aplica un tope estricto al número de sesiones proyectadas: `finalSessions = combined.slice(0, targetQuota)`.
- Esto garantiza que el Plan Regular proyecte **exactamente 8 clases al mes**, impidiendo que reprogramaciones o colisiones inflen el total a 9, 10 u 11 sesiones.

### 5. Saneamiento Quirúrgico de la Base de Datos en Producción (PostgreSQL)
Se identificaron y sanearon los registros de alumnos activos en producción:
1. **Yasumi Cielo Chamorro Amasifuen** (`227ffd56-44c2-4672-a3ce-d5000a8b6bf0`):
   - Depurados los logs espurios de regularización en `attendance_logs` (17/09 ausente y 22/09 presente).
   - Eliminadas las lecciones de recuperación temporales en `emergency_contact.scheduleLessons`.
   - `excludedWeeks: []` y `excludedDates: []` en sus lecciones base de Martes y Jueves.
   - Restablecida su vigencia original a `planStartDate: "2026-08-20"` y `planEndDate: "2026-09-19"`, mostrando **exactamente sus 8 clases originales** (6 presentes y 2 faltas: 25/08 y 03/09).
   - Ahora secretaría puede reprogramar manualmente en el Kardex la falta del Martes 25/08 hacia el Jueves 17/09 en 1 clic.
2. **Karlitoz Pazos Huatuco** (`10ab2288-40ea-4032-84c2-ec168d98880f`):
   - `excludedWeeks: []` en lecciones de Lun y Mié, manteniendo sus `excludedDates` e historiales intactos (8 de 8 sesiones completas).
3. **Mia Lucero Bellido Alvan** (`892bcc0b-d635-465e-a823-1dc339eafe74`):
   - `excludedWeeks: []` en lecciones de Vie y Sáb, manteniendo sus `excludedDates` y makeups activos (8 de 8 sesiones completas).

---

## Verificación y Resultados
- **Simulación y Kardex Calculator**:
  - `Yasumi Cielo Chamorro Amasifuen`: Exactamente 8 clases en su estado base (6 presentes + 2 faltas: 25/08 y 03/09). Al reprogramar 25/08 al 17/09, proyecta exactamente 8 clases (6 presentes + 1 falta en 03/09 + 1 reprogramada el 17/09).
  - `Karlitoz Pazos Huatuco`: 8 clases exactas proyectadas.
  - `Mia Lucero Bellido Alvan`: 8 clases exactas proyectadas.
- **Build de Producción**:
  - `npm run build` ejecutado exitosamente con 0 errores TypeScript y compresión Nitro limpia en 726ms.
