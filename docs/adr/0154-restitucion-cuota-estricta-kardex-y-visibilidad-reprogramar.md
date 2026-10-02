# ADR 0154: Restitución de la Cuota Estricta Contractual en Kardex y Corrección de Visibilidad del Botón Reprogramar

## Estado
Aceptado

## Fecha
2026-10-02

## Contexto
1. **Inflación Indebida de Cuota Contractual**:
   En `kardex-calculator.ts`, `student-attendance-kardex.tsx` y `student-cycle.ts`, el cálculo de clases pendientes para completar el ciclo lectivo calculaba:
   `const scheduledCount = attendedCount + pendingMakeups.length;`
   `const regularSlotsNeeded = Math.max(0, targetQuota - scheduledCount);`
   donde `attendedCount` únicamente contabilizaba estados `presente` y `tarde`.
   Como consecuencia, si un alumno tenía inasistencias (`ausente`), estas no se descontaban de los cupos transcurridos, lo que provocaba que el sistema añadiera clases regulares adicionales al final del ciclo lectivo. Esto provocaba que alumnos con contratos regulares de 8 clases (como Mia Lucero, Sasha Dharma y Gael Mathias) mostraran "PROGRAMADAS: 9 / 8" o "10 / 8" clases, rompiendo la regla contractual estricta de Vibra Music Staff (ADR-0105 y Reglas 3.1 y 6.2 de `AGENTS.md`).

2. **Visibilidad Indebida del Botón `[ 🔄 Reprogramar ]` en Modo Consulta**:
   En `student-attendance-kardex.tsx`, la condición de renderizado del botón `[ 🔄 Reprogramar ]` incluía `item.status === "pendiente"`. Esto causaba que en Modo Consulta normal, todas las clases futuras sin evaluar mostraran un botón prominente naranja `[ 🔄 Reprogramar ]`, haciendo que el usuario y secretaría percibieran que "por defecto todos los alumnos aparecen en reprogramado".

3. **Robustez de Detección de Paquetes Flexibles (24 clases)**:
   Alumnos con bolsa flexible (como Andrea Fernanda, con 24 clases a demanda) cuyos metadatos en `emergency_contact` o `packageTotalSessions` contenían valores en formato numérico o string requerían normalización para evitar que el sistema asumiera cuotas fijas de 8 clases al rehidratar desde PostgreSQL.

## Decisiones Técnicas

1. **Restitución Estricta de la Cuota Contractual (ADR-0105 & ADR-0154)**:
   - Se ajusta la fórmula en `kardex-calculator.ts`, `student-attendance-kardex.tsx` y `student-cycle.ts`:
     `const regularSlotsNeeded = Math.max(0, targetQuota - evaluated.length - pendingMakeups.length);`
   - Todas las sesiones ya evaluadas (`presente`, `ausente`, `tarde`, `justificada`) más las recuperaciones agendadas (`pendingMakeups`) consumen formalmente cupos dentro del ciclo.
   - Solo se toman las clases regulares pendientes necesarias para que el total proyectado sume exactamente `targetQuota` (8 para Plan Regular, 4 para Intensivo, 24 para Paquete Flexible).
   - Resultado verificado:
     - Sasha Dharma: 8 de 8 clases.
     - Mia Lucero: 8 de 8 clases.
     - Gael Mathias: 8 de 8 clases.
     - Boris: 8 de 8 clases.
     - Andrea Fernanda: 24 de 24 clases.

2. **Aislamiento del Botón `[ 🔄 Reprogramar ]` a Inasistencias y Modo Edición**:
   - En `student-attendance-kardex.tsx`, la condición de renderizado del botón directo `[ 🔄 Reprogramar ]` se restringe a:
     `((item.status === "ausente" || item.status === "tarde" || item.status === "justificada") || isEditMode)`
   - En Modo Consulta, las sesiones pendientes (`⚪ Sin marcar`) ya no muestran el botón de reprogramación por defecto, eliminando la falsa impresión de que las clases están en estado reprogramado.
   - Si secretaría activa voluntariamente el `[ ✏️ Modo Edición ]`, los controles de reprogramación se habilitan en todas las filas para ajustes anticipados.

3. **Normalización Numérica de `packageTotalSessions` en Servicios y Rehidratación**:
   - En `students.service.ts`: `packageTotalSessions: ec.packageTotalSessions ? Number(ec.packageTotalSessions) : (isJonathanDB ? 24 : 8)`
   - En `app-store.ts` y componentes: `Boolean(student.packageTotalSessions) && Number(student.packageTotalSessions) > 8`.
   - Garantiza que los alumnos con bolsas a demanda (24 clases) proyecten la totalidad de sus 24 sesiones a través de los meses contratados.

## Consecuencias
- **Coherencia Contractual Absoluta**: Ningún alumno con plan regular proyecta 9 o 10 clases en el Kardex.
- **Claridad Visual en Consulta**: La interfaz del Kardex es limpia y solo destaca la acción de reprogramar en fechas donde efectivamente existió una falta o tardanza.
- **Fidelidad con Backend**: PostgreSQL rehidrata con precisión matemática tanto los planes regulares de 8 sesiones como las bolsas flexibles de 24 sesiones sin conflictos de cuota.
