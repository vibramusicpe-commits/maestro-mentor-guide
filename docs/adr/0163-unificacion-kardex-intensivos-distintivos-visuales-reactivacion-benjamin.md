# ADR 0163: Unificación de Kardex para Plan Intensivo, Distintivos Visuales de 90m y Reactivación de Benjamin

## Estado
Aprobado e Implementado (v2.0.33) — 07 de Octubre, 2026

## Contexto
1. **Divergencia entre `student-attendance-kardex.tsx` y `kardex-calculator.ts`**:
   - En la versión v2.0.32 se corrigió `kardex-calculator.ts` (`computeStudentCycleSessions`), pero `student-attendance-kardex.tsx` mantenía una copia local obsoleta de ~200 líneas (`allCycleSessions`, líneas 277-474) que no invocaba dicha función.
   - Dicha copia interna tenía hardcodeado `endMinuteTotal = hh * 60 + mm + 45;` y deduplicaba por hora individual `${item.dateStr}-${item.time}`, lo cual provocaba que el Kardex de alumnos Intensivos (Benjamin, Eitan Anton Chapi, Antonella) continuase mostrando 45 minutos (ej. `10:30 - 11:15` o `09:00 - 09:45`) y generase filas fragmentadas en lugar de la sesión unificada de 90 minutos (2 horas pedagógicas).
2. **Impacto Operativo en Producción**:
   - Al observar que Benjamin mostraba 45 minutos en su Kardex, la dirección asumió erróneamente que su perfil estaba corrupto y procedió a pasarlo a estado `baja`.
   - Se contempló realizar la misma acción con Eitan Anton Chapi, lo cual habría provocado la pérdida de sus 2 asistencias evaluadas en sala (`2026-09-12` y `2026-09-26`) y desvinculación de su recibo cancelado de S/ 261.
3. **Falta de Indicadores Visuales para Docentes y Secretaría**:
   - En la grilla central (`AgendaBoard`) y en el Kiosco del Docente (`TeacherKiosk`), las clases intensivas ocupan 2 celdas de 45 minutos contiguas, pero carecían de un distintivo visual explícito, dificultando reconocer rápidamente que ambos bloques componen una sola clase intensiva de 90 minutos.

## Decisiones Técnicas
1. **Unificación y Eliminación de Código Duplicado en `student-attendance-kardex.tsx`**:
   - Se eliminó el bucle interno redundante de `allCycleSessions` y se reemplazó por la invocación directa a la función oficial `computeStudentCycleSessions({ student: liveStudent, allSchedule: studentLessons, selectedYear, selectedMonth })` de `src/lib/kardex-calculator.ts`.
   - Ahora el Kardex renderiza de forma infalible la ventana horaria completa de 90 minutos (`09:00 - 10:30` para Eitan, `10:30 - 12:00` para Benjamin, `09:00 - 10:30` para Antonella) y consolida la asistencia entre ambos bloques contiguos.
2. **Insignia Visual `⚡ 90 min (Intensivo)` en Toda la Plataforma**:
   - **Kardex (`student-attendance-kardex.tsx`)**: Se agregó el badge `⚡ 90 min (Intensivo)` en la cabecera de cada fila de sesión.
   - **Horario Central (`agenda-board.tsx`)**: Se incorporó el badge `⚡ 90m` en la tarjeta de clase de cada celda horaria del alumno intensivo.
   - **Kiosco Docente (`teacher.index.tsx`)**: Se incorporó el badge `⚡ 90 min` en la tarjeta del alumno para advertir al profesor que el estudiante permanece en aula por 2 horas pedagógicas continuas.
3. **Reactivación y Normalización Quirúrgica en PostgreSQL Insforge**:
   - **Benjamin** (`57db57ae-ad12-4e58-bedc-659ac7dbef24`): Reactivado de `"baja"` a `"activo"` con sus asistencias de `2026-09-26` y `2026-10-03` intactas en Sábados 10:30 a 12:00 (Jeremy, Sala A).
   - **Eitan Anton Chapi** (`482dd79d-630e-41dd-91d8-4730e73651d8`): Normalizado `full_name` de `"EITAN"` a `"Eitan Anton Chapi"` y actualizado `student: "Eitan Anton Chapi"` en sus 4 registros de `scheduleLessons` para consistencia absoluta en el directorio, recibos y reportes.

## Verificación
- `npm run build` ejecutado exitosamente con 0 errores de compilación y empaquetado SSR.
- Benjamin reactivado en PostgreSQL PostgREST con código HTTP 200.
- Eitan normalizado en PostgreSQL PostgREST con código HTTP 200.
