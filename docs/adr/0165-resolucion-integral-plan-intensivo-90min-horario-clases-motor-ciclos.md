# ADR 0165: Resolución Integral del Plan Intensivo (90 min / 2 Bloques Contiguos) en Horario de Clases y Motor de Ciclos

## Estado
Aprobado e Implementado (v2.0.35) — 08 de Octubre, 2026

## Contexto
1. **Ocultamiento de la 4ta Clase de Alumnos Intensivos (Caso Antonella Osorio Huaman / `8c322418-4959-43eb-8fe8-7224451dee7e`)**:
   - Antonella asiste los Viernes en Plan Intensivo (4 clases al mes de 90 min / 2 bloques contiguos de 45m).
   - Sus clases del 18/09 y 02/10 estaban completas con `presente` en ambos bloques (16:00 y 16:45), pero la clase del 25/09 tenía solo el bloque de las 16:00 evaluado como `presente` y las 16:45 sin marcar.
   - En el motor de ciclos `src/lib/student-cycle.ts`, la fecha `2026-09-25` ya sumaba en `evaluatedCount`. Sin embargo, el bloque huérfano pendiente hacía que `2026-09-25` ingresara a `pendingRegular` y fuera consumida por `uniqueDates.slice(0, datesNeeded)`.
   - Esto agotaba prematuramente la cuota y expulsaba la 4ta clase del 09/10/2026 del ciclo válido, haciéndola desaparecer de la agenda central (`AgendaBoard`).
2. **Falta de Segundos Bloques Contiguos en Base de Datos para Alumnos Intensivos Históricos**:
   - Varios alumnos del Plan Intensivo inscritos antes de ADR-0157 (Sebastian Ortega, Marcelo Andree, Kayra Valery, Juan Mateo Azael) fueron registrados con solo 1 hora académica (45 min) en `emergency_contact.scheduleLessons`.
   - Como no existía físicamente el segundo bloque de 45 minutos en PostgreSQL, la agenda solo renderizaba 45 minutos en lugar de los 90 minutos reglamentarios.

## Decisiones Técnicas
1. **Blindaje del Motor de Ciclos en Plan Intensivo (`src/lib/student-cycle.ts`)**:
   - Se aislaron las fechas verdaderamente futuras que no hayan sido evaluadas previamente:
     ```typescript
     const futureDates = Array.from(new Set(pendingRegular.map((p) => p.dateStr)))
       .filter((d) => !evaluatedDates.has(d));
     const datesNeeded = Math.max(0, targetQuota - evaluatedCount - pendingMakeups.length);
     const chosenDates = new Set(futureDates.slice(0, datesNeeded));
     ```
   - Se seleccionan los bloques de las fechas futuras necesarias, MÁS cualquier bloque pendiente huérfano en fechas parcialmente evaluadas para completar sus 90 minutos:
     ```typescript
     chosenPendingRegular = pendingRegular.filter(
       (p) => chosenDates.has(p.dateStr) || evaluatedDates.has(p.dateStr)
     );
     ```
   - Se preserva incondicionalmente la 4ta fecha lectiva (`2026-10-09`) y se evitan expulsiones ilícitas.
2. **Alineación de Conteo Regular vs Intensivo**:
   - En Plan Intensivo, `evaluatedCount` y `attendedCount` computan por fechas lectivas completas (`cycleEvaluatedDates.size` / `cycleAttendedDates.size`).
   - En Plan Regular y Paquete Flexible, computan por slots individuales (`cycleEvaluatedSlots.size` / `cycleAttendedSlots.size`).
3. **Aprovisionamiento Histórico de Bloques Contiguos en PostgreSQL Insforge**:
   - **Sebastian Ortega** (`8001da91-3737-48da-b30b-843dadf76fc2`): Sábado a las 11:15 en Sala B con Prof. Fernando (Bloque 2 contiguo a su 10:30).
   - **Marcelo Andree** (`846e9c76-349f-44d9-9f24-bf96552d4a25`): Sábado a las 12:45 en Sala A con Prof. Jeremy (Bloque 2 contiguo a su 12:00).
   - **Kayra Valery** (`a118ba83-d07d-4b28-8d84-8792e94292c5`): Sábado a las 09:45 en Sala C con Prof. Nathaly (Bloque 2 contiguo a su 09:00).
   - **Juan Mateo Azael** (`6dbd7dad-00ba-4bf7-85e0-e3d8a27d15af`): Viernes a las 16:45 en Sala C con Prof. Nathaly (Bloque 2 contiguo a su 16:00), y Bloque 2 para su recuperación del 09/10 a las 16:45.
   - **Antonella Osorio Huaman** (`8c322418-4959-43eb-8fe8-7224451dee7e`): Normalización de nombre completo, regularización de asistencia `presente` en el bloque 2 del 25/09 y validación matemática de su 4ta clase el 09/10 (16:00 y 16:45).
   - **Joshua Leon Gonzales** (`26080f02-be6b-441c-90fe-65c98f48c121`): Limpieza de clases erróneas de los viernes, preservado en su horario de Sábados a las 12:00.

## Verificación
- Antonella Osorio proyecta sus 4/4 fechas completas (18/09, 25/09, 02/10 y 09/10), ambas franjas visibles en la agenda con `⚡ 90m`.
- Todos los alumnos intensivos de viernes y sábado renderizan sus 90 minutos continuos en sala.
- `npm run build` ejecutado exitosamente con 0 errores de compilación.
