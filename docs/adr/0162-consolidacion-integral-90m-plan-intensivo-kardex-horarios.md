# ADR 0162: Consolidación Integral de 90 Minutos para Plan Intensivo (4 clases / 90 min) en Kardex y Horario de Clases

## Estado
Aprobado e Implementado (v2.0.32) — 06 de Octubre, 2026

## Contexto
1. **Regla de Plan Intensivo (4 clases / 90 min)**:
   - Los alumnos de Plan Intensivo contratan 4 clases al mes de **90 minutos (2 horas pedagógicas de 45 min continuas)**.
   - En la grilla de la agenda física, deben ocupar 2 turnos contiguos en la misma sala y con el mismo docente (ej. 09:00 - 09:45 y 09:45 - 10:30, o 10:30 - 11:15 y 11:15 - 12:00).
   - En el Kardex, cada clase semanal debe consolidarse en una sola fila por fecha que muestre la franja horaria real de 90 minutos (ej. `10:30 - 12:00`).
2. **Deficiencias Encontradas**:
   - En `src/lib/kardex-calculator.ts` (`computeStudentMonthSessions`), la duración de fin de turno estaba hardcodeada a `+ 45`, mostrando sesiones de solo 45 min (ej. `10:30 - 11:15`) y deduplicaba por hora individual `${item.dateStr}-${item.time}`, generando dos filas separadas en lugar de una consolidada de 90 minutos.
   - En `src/components/admin/student-attendance-kardex.tsx`, el botón `+ De corrido (+45m)` se mostraba innecesariamente para clases intensivas.
   - En PostgreSQL, varios alumnos intensivos (Antonella, Benjamin, Eitan Anton, Flavia Nicole) solo tenían 1 bloque registrado o tenían cuotas desfasadas (Eitan tenía `packageTotalSessions: 8` en vez de 4; Antonella estaba registrada a las 16:00 en vez de su horario matutino de 09:00 a 10:30).

## Decisiones Técnicas
1. **Consolidación en Kardex (`src/lib/kardex-calculator.ts`)**:
   - Detección inequívoca de `isIntensive`:
     ```typescript
     const isIntensive = modalityStr.includes("inten") || modalityStr.includes("90 min") || (modalityStr.includes("4 clases") && !modalityStr.includes("45 min"));
     ```
   - Cálculo dinámico de duración: `durationMin = isIntensive ? 90 : 45` para proyectar `timeEnd` como ventana completa de 90 min.
   - Deduplicación por fecha en `computeStudentCycleSessions` y `computeStudentMonthSessions`:
     ```typescript
     const slotKey = isIntensive ? item.dateStr : `${item.dateStr}-${item.time}`;
     ```
     Si alguno de los dos bloques contiguos cuenta con asistencia evaluada (`status !== "pendiente"`), la fila consolidada hereda la evaluación.
2. **Ocultamiento de `+ De corrido (+45m)` en Kardex (`student-attendance-kardex.tsx`)**:
   - Condicionado a `{!isIntensivo && ...}`, eliminando la opción redundante de agregar 45 minutos contiguos adicionales sobre una sesión que ya dura 90 min.
3. **Sincronización Reactiva de Asistencias en `src/store/app-store.ts`**:
   - En `setStudentAttendance` y `setStudentSessionAttendance`, al evaluar un bloque de un alumno intensivo, el estado se replica automáticamente en el bloque contiguo de la misma fecha, manteniendo sincronía absoluta entre el Kardex, la Agenda y el Kiosco docente.
4. **Saneamiento Quirúrgico en Insforge PostgreSQL**:
   - **Antonella** (`8c322418-4959-43eb-8fe8-7224451dee7e`): Viernes 09:00 - 09:45 y 09:45 - 10:30 con Jeremy en Sala A (Piano). Asistencias de 18/09, 25/09 y 02/10 preservadas como `presente`. Le resta su última clase el 09/10.
   - **Benjamin** (`57db57ae-ad12-4e58-bedc-659ac7dbef24`): Sábado 10:30 - 11:15 y 11:15 - 12:00 con Jeremy en Sala A (Piano). Asistencias de 26/09 y 03/10 preservadas como `presente`.
   - **Eitan Anton** (`482dd79d-630e-41dd-91d8-4730e73651d8`): Sábado 09:00 - 09:45 y 09:45 - 10:30 con Fernando en Sala B (Piano). `packageTotalSessions = 4`. Asistencias de 12/09 y 26/09 preservadas como `presente`.
   - **Flavia Nicole Concepcion** (`4834995a-a8df-4531-b1de-ddaec8d2550f`): Viernes 16:00 - 16:45 y 16:45 - 17:30 con Fernando en Sala B (Piano). Asistencias de 04/09, 11/09 y 18/09 preservadas como `presente` y recuperación programada para el 09/10 en ambos bloques.
   - **Viernes Completo**: Confirmada la nómina oficial de 4 alumnos activos los Viernes: Antonella (09:00 - 10:30, Sala A), Flavia Nicole (16:00 - 17:30, Sala B), Mia Lucero Bellido (16:00 - 16:45, Sala C) y Kamila Valentina (17:30 - 19:00, Sala A).

## Verificación
- Verificado el Kardex de Benjamín, Antonella, Eitan y Flavia: muestran exactamente sus clases de 90 min (ej. `10:30 - 12:00`).
- No existen botones de `+ De corrido` en sesiones intensivas.
- Nómina de Viernes cuadrante sin cruces de sala.
- `npm run build` ejecutado exitosamente con 0 errores.
