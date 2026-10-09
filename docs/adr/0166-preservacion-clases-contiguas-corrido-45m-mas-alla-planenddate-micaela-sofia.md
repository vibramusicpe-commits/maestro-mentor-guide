# ADR 0166: Preservación Incondicional de Clases Contiguas de Corrido (+45m) más allá de planEndDate

## Estado
Aprobado e Implementado (v2.0.36) — 09 de Octubre, 2026

## Contexto
1. **Ocultamiento de la 8va Clase en Kardex de Micaela Sofia (`492b34f8-b4db-45fe-8f01-36809624c2cb`)**:
   - Micaela Sofia cuenta con 7 clases evaluadas en sala con marca `presente` (1 clase regular el 06/07/2026 y 6 recuperaciones/adelantos puntuales el 13/07, 17/07, 12/08, 17/08, 09/09 16:45 y 16/09 16:45).
   - Para completar su cuota contractual de 8 clases, secretaría utilizó la función `+ De corrido (+45m)` en la sesión de recuperación del Miércoles 09/09/2026, creando una sesión contigua a las 17:30 (`sch-1790814650424-aya`) con `dateStr: "2026-09-09"`.
   - Sin embargo, en el Kardex solo se mostraban 7 clases y la 8va sesión no era visible.
2. **Causa Raíz Arquitectónica**:
   - **Bloqueador 1 (`src/lib/kardex-calculator.ts` líneas 337 y 526)**:
     - El cálculo evaluaba `const isBeyondEnd = effectivePlanEndDate && curDateStr > effectivePlanEndDate;`. Al ser `2026-09-09 > 2026-08-05`, `isBeyondEnd` era verdadero.
     - La condición `if (isBeyondEnd && currentStatus === "pendiente" && !lesson.isMakeup)` descartaba la clase porque la clase de corrido se creaba con `isMakeup: false` y la condición no comprobaba `!lesson.dateStr`.
   - **Bloqueador 2 (`src/lib/student-cycle.ts` líneas 188 y 218)**:
     - La verificación `if (!isFlexiblePackage && effectiveEndDate && curDateStr > effectiveEndDate) continue;` ocurría antes de revisar las lecciones del alumno, descartando indiscriminadamente cualquier sesión con fecha posterior al fin teórico del plan, incluso si fue explícitamente agendada por secretaría con `dateStr`.
     - Además, la deduplicación evaluaba `if (evaluatedSlots.has(slot) || (!isIntensive && evaluatedDates.has(curDateStr))) return;`. Como el primer bloque (16:45) de esa misma fecha ya estaba evaluado con `presente`, `evaluatedDates.has("2026-09-09")` era verdadero y descartaba el segundo bloque contiguo a las 17:30.

## Decisiones Técnicas
1. **Exención de `dateStr` en Barrera Temporal (`src/lib/kardex-calculator.ts`)**:
   - Las condiciones de descarte por `isBeyondEnd` en `computeStudentCycleSessions` y `computeStudentMonthSessions` ahora verifican `!lesson.dateStr`:
     ```typescript
     if (isBeyondEnd && currentStatus === "pendiente" && !lesson.isMakeup && !lesson.dateStr) return;
     ```
   - Toda lección con fecha explícita programada por secretaría se respeta incondicionalmente, permitiendo que cumpla la cuota contractual.
   - Se aplicó fallback defensivo `(allSchedule || [])` para prevenir excepciones por parámetros opcionales.
2. **Soporte de Bloques Contiguos en la Misma Fecha (`src/lib/student-cycle.ts`)**:
   - Las barreras `effectiveEndDate` y `effectiveEndMonth` se circunscribieron exclusivamente a plantillas recurrentes abiertas (`!lesson.dateStr`), permitiendo que lecciones con `lesson.dateStr` se proyecten en sus fechas programadas.
   - La deduplicación por fecha ahora solo descarta lecciones abiertas sin fecha específica:
     ```typescript
     if (evaluatedSlots.has(slot) || (!lesson.dateStr && !isIntensive && evaluatedDates.has(curDateStr))) return;
     ```
   - Para lecciones con `dateStr` explícito, solo se descarta si su slot exacto (`dateStr-time`) ya fue evaluado, permitiendo clases contiguas de corrido (ej. 16:45 y 17:30 el mismo día).
3. **Herencia de Estado de Recuperación en Kardex (`src/components/admin/student-attendance-kardex.tsx`)**:
   - En `handleAddConsecutiveClass`, la nueva sesión contigua hereda `isMakeup: Boolean(session.isMakeup)`.

## Verificación
- Kardex de Micaela Sofia proyecta exactamente sus 8/8 sesiones contractuales (7 evaluadas + la 8va sesión a las 17:30 del 09/09).
- `computeStudentMonthSessions` para Setiembre 2026 proyecta exactamente las 3 sesiones del mes (09/09 16:45, 09/09 17:30, 16/09 16:45).
- `isLessonInStudentCycle` retorna `true` para la sesión de las 17:30.
- `npm run build` ejecutado exitosamente con 0 errores de compilación y SSR.
