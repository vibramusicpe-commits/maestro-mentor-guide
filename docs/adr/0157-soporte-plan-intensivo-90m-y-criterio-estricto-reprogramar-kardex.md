# ADR 0157: Soporte Integral para Plan Intensivo de 90 min (Doble Bloque Contiguo), Desbloqueo de Fechas de Inicio y Criterio Estricto del Botón Reprogramar en Kardex

## Estado
Aprobado e Implementado (v2.0.27) — 05 de Octubre, 2026

## Contexto

### 1. Criterio Estricto de Reprogramación en Kardex de Asistencias
En `src/components/admin/student-attendance-kardex.tsx`, el botón `🔄 Reprogramar` se mostraba indiscriminadamente en múltiples estados de asistencia. 
La regla pedagógica y administrativa oficial de Vibra Music estipula que:
- Solo se puede reprogramar una clase cuando el alumno **Falta (`ausente`)** o tiene **Falta Justificada (`justificada`)**.
- Si el alumno llega tarde (**`tarde`**) o asiste (**`presente`**), la clase se cuenta como asistencia formalmente consumida; por tanto, **está terminantemente prohibido mostrar el botón de reprogramación**.
- En Modo Edición (`isEditMode`), secretaría o dirección pueden reprogramar clases pendientes (**`pendiente`**), ausentes o justificadas.

### 2. Caso Liam Renato Miranda Carbajal (`ebe12ee5-466c-4929-9471-79b316f22725`)
- Alumno nuevo en **Plan Intensivo (4 clases / 90 min)** matriculado para iniciar el sábado **03 de octubre de 2026**.
- Al registrar su horario en `ScheduleStudentForm`, la lección semanal recurrente se guardó con `effectiveFrom: "2026-10-05"` (la fecha en que se operó el formulario).
- En `src/lib/kardex-calculator.ts`, la condición `if (lesson.effectiveFrom && curDateStr < lesson.effectiveFrom) return;` provocó que el Kardex omitiera el sábado `03/10/2026` y empezara a contar recién desde el siguiente sábado `10/10/2026`.
- Cuando secretaría intentó reprogramar la última clase (31/10) hacia el `03/10` para subsanar el desfase, la sesión puntual de reprogramación heredó `effectiveFrom: "2026-10-05"`. Como `"2026-10-03" < "2026-10-05"`, la clase reprogramada desapareció de la vista mensual y el Kardex quedó mutilado con solo 3 clases.

### 3. Modelo Operativo del Plan Intensivo (4 clases / 90 min)
- Cada clase de Plan Intensivo consta de **90 minutos (1h 30m)** continuos.
- La grilla horaria física de Vibra Music opera en módulos de **45 minutos** por turno.
- Por tanto, un alumno de Plan Intensivo debe ocupar **DOS bloques contiguos de 45 minutos** en el mismo día, misma sala y con el mismo docente (ej. Liam: 09:00 - 09:45 y 09:45 - 10:30; Benjamin: 10:30 - 11:15 y 11:15 - 12:00).
- Anteriormente, el formulario de horarios solo agendaba 1 bloque de 45 minutos para el intensivo, dejando el segundo turno libre en la agenda (falso cupo disponible) y sin reservar la sala para el docente.
- En el Kardex, ambos bloques deben consolidarse bajo la misma fecha como una única sesión de 90 minutos para cumplir rigurosamente con la cuota contractual de **4 clases al mes** (`targetQuota = 4`).

---

## Decisiones Técnicas

### 1. Filtro Estricto de Visibilidad de Reprogramación (`student-attendance-kardex.tsx`)
En `src/components/admin/student-attendance-kardex.tsx`:
- El botón `🔄 Reprogramar` solo se renderiza si se cumple la condición:
  ```typescript
  ((item.status === "ausente" || item.status === "justificada") || (isEditMode && item.status === "pendiente"))
  ```
- Quedan excluidos incondicionalmente los estados `presente` y `tarde`.

### 2. Aislamiento de `effectiveFrom` y Preservación de Sesiones Puntuales
- En `src/store/app-store.ts` (`rescheduleLesson`): Las clases reprogramadas puntuales fijan explícitamente `effectiveFrom: undefined`, impidiendo que hereden barreras temporales que las oculten.
- En `src/lib/kardex-calculator.ts` y `src/lib/student-cycle.ts`:
  - `effectiveFrom` y `effectiveUntil` aplican **exclusivamente** a plantillas recurrentes abiertas (`!lesson.dateStr`).
  - Las lecciones con fecha específica (`lesson.dateStr`) jamás son bloqueadas por `effectiveFrom`.
- En `src/components/admin/agenda-board.tsx`, `src/components/agenda/minimal-agenda-calendar.tsx` y `src/routes/teacher.index.tsx`: Se garantiza que las sesiones con `dateStr` se proyecten en su fecha exacta sin importar la fecha de corte semanal.

### 3. Soporte Arquitectónico de Doble Bloque Contiguo para Plan Intensivo
- **En `src/components/admin/students-table.tsx` (`ScheduleStudentForm`)**:
  - Función `getNextConsecutiveSlot(day, time)` para calcular el segundo bloque de 45m contiguo.
  - Al agendar un Plan Intensivo, se evalúan ambos bloques en `conflictReport` y `pedagogicalReport`. Si el turno seleccionado es el último del día o carece de turno contiguo, se alerta al usuario.
  - Al enviar el formulario, se insertan dos sesiones en `scheduleLessons`:
    - Sesión 1: Franja horaria base (`time1`, ej. 09:00).
    - Sesión 2: Franja contigua (`intensiveSecondTime`, ej. 09:45).
  - Se fija automáticamente `packageTotalSessions: 4`.
  - Se sincroniza la fecha de inicio (`planStartDate`) seleccionada con el perfil del alumno.
- **En `src/lib/kardex-calculator.ts`**:
  - Para `isIntensive`: la duración por sesión se calcula como **90 min** (`timeEnd` = `time + 90m`, ej. `09:00 - 10:30` o `10:30 - 12:00`).
  - Al consolidar sesiones en la vista mensual, se agrupan por `item.dateStr`, unificando los dos bloques de 45m en una única fila de Kardex de 90 min con asistencia consolidada, preservando la cuota matemática de exactamente 4 clases.

---

## Verificación y Datos Productivos

1. **Liam Renato Miranda Carbajal (`ebe12ee5-466c-4929-9471-79b316f22725`)**:
   - `planStartDate`: `"2026-10-03"`
   - `packageTotalSessions`: `4`
   - `scheduleLessons`: 2 bloques en Sábado (09:00 y 09:45) con Prof. Jeremy en Sala A.
   - Asistencia `"presente"` registrada y respaldada en `attendance_logs` para el `2026-10-03`.
   - Kardex mensual proyecta exactamente 4 sesiones de 90 min (03/10, 10/10, 17/10, 24/10).
2. **Benjamin Baltazar Espinoza (`57db57ae-ad12-4e58-bedc-659ac7dbef24`)**:
   - `packageTotalSessions`: `4`
   - `scheduleLessons`: 2 bloques en Sábado (10:30 y 11:15) con Prof. Jeremy en Sala A.
   - Ambas sesiones ocupan sus respectivas celdas en la agenda física sin dejar falsos huecos libres.
3. **Compilación Limpia**:
   - `npm run build` ejecutado exitosamente con 0 errores (Vite y Nitro Cloudflare Module).
