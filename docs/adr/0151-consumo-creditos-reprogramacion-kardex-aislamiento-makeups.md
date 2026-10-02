# ADR-0151: Consumo Simétrico de Créditos de Recuperación, Vinculación Visual de Reprogramaciones en Kardex y Blindaje de Cuota Regular

## Estado
Aceptado

## Fecha
2026-10-02

## Contexto
Durante la operación en producción con los alumnos **Gael Mathias** (Plan Regular con inasistencias reprogramadas) y **Andrea Fernanda** (Paquete Flexible de 24 sesiones), se detectaron tres anomalías críticas en el ciclo de reprogramaciones y persistencia:

1. **Fuga de Créditos y Botón Redundante de Reprogramación**:
   Al reprogramar una falta desde el Kardex, se creaba la sesión de recuperación (`isMakeup: true, recoveringLessonDate: originalDateStr`), pero el contador `makeupCredits` no se decrementaba. En la fila de la inasistencia original, el botón `[🔄 Reprogramar]` permanecía visible como si la sesión nunca se hubiese recuperado, y el banner superior continuaba mostrando un saldo inflado de clases pendientes por recuperar (ej. 6 créditos en vez de 2).

2. **Truncamiento Prematuro de Clases Regulares por Inasistencias en el Ciclo Lectivo**:
   En `src/lib/student-cycle.ts`, el cálculo de cupos pendientes (`slotsNeeded`) restaba `evaluatedCount` (que incluía todas las faltas) y `pendingMakeups.length`. Esto penalizaba doblemente al alumno: las faltas y las recuperaciones consumían prematuramente los cupos del contrato, provocando que las clases regulares de las semanas finales (ej. Semana 4, 25 y 27 de agosto en Gael Mathias) fueran excluidas del horario.

3. **Degradación de Modalidad de Paquete Flexible por Enum SQL de PostgreSQL**:
   La columna `modality` de la tabla `students` en PostgreSQL está tipada con el enum `lesson_modality_enum` (`'Regular (8 clases / 45 min)'` o `'Intensivo (4 clases / 90 min)'`). Al hidratar alumnos desde el backend, la modalidad `"Paquete Flexible (A demanda)"` almacenada en `emergency_contact` colisionaba o era sobreescrita, haciendo que `computeStudentMonthSessions` y `computeStudentCycle` trataran al alumno como un plan regular de 8 sesiones acotado a 30 días (`planEndDate: 2026-07-31`), mostrando solo 10 clases en vez de las 24 contratadas.

## Decisiones Técnicas

### 1. Consumo y Restauración Simétrica de Créditos de Recuperación (`makeupCredits`)
- En `rescheduleLesson` (`src/store/app-store.ts`), cuando la reprogramación corresponde a una inasistencia (`originalDateStr` con estado `ausente`, `tarde` o `justificada`), se consume exactamente 1 crédito:
  ```ts
  const newCredits = isRecoveringAbsence
    ? Math.max(0, (targetSt.makeupCredits ?? 0) - 1)
    : (targetSt.makeupCredits ?? 0);
  ```
- En `revertMakeupLesson`, al eliminar o revertir una sesión de recuperación, se restaura automáticamente el crédito (`makeupCredits = (targetSt.makeupCredits || 0) + 1`).
- Ambas mutaciones se persisten inmediatamente en segundo plano hacia PostgreSQL vía `backgroundSyncStudentToDB`.

### 2. Vinculación Visual Bidireccional en Filas de Kardex (`linkedMakeup`)
- En `src/components/admin/student-attendance-kardex.tsx`, cada fila de sesión busca si existe una recuperación agendada que la vincule:
  ```ts
  const linkedMakeup = allCycleSessions.find(
    (m) => m.isMakeup && m.recoveringLessonDate === item.dateStr
  );
  ```
- Si `linkedMakeup` existe:
  - Se oculta el botón `[🔄 Reprogramar]`.
  - Se renderiza un badge informativo claro: `🔄 Recup.: ${linkedMakeup.dayShort} ${linkedMakeup.time} (⏳ Agendada / ✓ Asistió)`.
  - Se provee el botón `✏️ Modificar` para cambiar la fecha u hora de la recuperación sin duplicar lecciones.
- Si no tiene recuperación agendada, se mantiene el botón `[🔄 Reprogramar]`.

### 3. Preservación Incondicional de la Cuota Regular ante Inasistencias
- En `src/lib/student-cycle.ts`:
  - Se diferencian los conjuntos de slots asistidos efectivos (`attendedSlots`: `presente` o `tarde`) de los meramente evaluados (`evaluatedSlots`).
  - La culminación del ciclo (`isCycleCompleted`) se define formalmente como `attendedCount >= targetQuota`. Las faltas **NO** culminan el ciclo contractual ("Las clases no se pierden, se recuperan").
  - `slotsNeeded = Math.max(0, targetQuota - (attendedCount + pendingMakeups.length))`. Esto garantiza que todas las clases regulares pendientes de semanas posteriores permanezcan intactas en el cronograma.

### 4. Detección Universal de Paquetes Flexibles y Preservación de Vigencia
- En `kardex-calculator.ts`, `student-cycle.ts`, `student-attendance-kardex.tsx` y `hydrateFromBackend` (`app-store.ts`), la detección de Paquete Flexible se unificó para comprobar de forma robusta e insensible a mayúsculas:
  ```ts
  const isFlexiblePackage =
    modalityStr.includes("flex") ||
    modalityStr.includes("demanda") ||
    modalityStr.includes("paquete") ||
    student.planType === "Paquete Flexible" ||
    student.planType === "Paquete Especial" ||
    (typeof student.packageTotalSessions === "number" && student.packageTotalSessions > 8);
  ```
- En `src/components/admin/students-table.tsx`, al editar `planStartDate`, se detecta si el alumno es Paquete Flexible para preservar su `planEndDate` extendido (`2026-12-31`), evitando que se reduzca a 1 mes calendario.

## Consecuencias
- **Trazabilidad Total**: Secretaría puede ver con total claridad qué clase recupera a qué falta y el estado de la sesión de recuperación.
- **Cuota Íntegra Garantizada**: Un alumno con faltas no ve recortadas sus clases regulares de fin de ciclo; las recuperaciones suman a su cuota asistida sin canibalizar su horario habitual.
- **Créditos Precisos**: El saldo de créditos (`makeupCredits`) refleja en todo momento las clases pendientes reales por agendar.
- **Estabilidad de Paquetes Flexibles**: Los alumnos con bolsas de 24 sesiones mantienen visible la totalidad de sus clases a lo largo de todos los meses de vigencia.
