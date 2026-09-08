# ADR 0076: Aislamiento Estricto de Mes en Kardex, Rediseño de Libreta de Asistencias y Purgado Total de Mock Data de Asistencia

## Estado
Aprobado e Implementado

## Fecha
2026-09-07

## Contexto y Causa Raíz
1. **Confusión en "Libreta de Asistencias y Control de Plan" (agenda-board.tsx)**:
   - Cada tarjeta mostraba una insignia del tipo `2 / 8 clases` junto a una alerta `⚠️ Faltan 6 clases en agenda para completar el mes`, mientras que debajo figuraba `🟢 0 Pres`, `🔴 0 Aus`.
   - **Causa Raíz**: El componente calculaba `scheduledCount = studentLessons.length` (que cuenta las frecuencias del horario semanal: ej. 2 frecuencias por semana para Plan Regular) y lo comparaba directamente contra `targetLessons = 8` (el objetivo mensual de clases). Esto creaba la falsa impresión de que el alumno había asistido a 2 de 8 clases, o que faltaban clases en la agenda, cuando en realidad 2 frecuencias semanales distribuidas a lo largo de las semanas del mes completan con exactitud las 8 clases requeridas.
2. **Desbordamiento de Sesiones en Kardex (student-attendance-kardex.tsx)**:
   - En alumnos con clases los viernes (como Juan Mateo Azael Pariona Pumahuillca), el Kardex mostraba 10 sesiones programadas y 10 pendientes para el mes de Agosto, a pesar de que el plan mensual es de 8 clases (o 4 intensivas).
   - **Causa Raíz**: La Semana 5 de Agosto 2026 contiene el Lunes 31 de Agosto y luego días del 1 al 5 de Setiembre. La iteración `monthWeeks.forEach` -> `week.days.forEach` no verificaba `if (!dayInfo.isCurrentMonth) return;`, provocando que el Viernes 04 de Setiembre se incluyera erróneamente en el conteo de Agosto (4 viernes de agosto + 1 viernes de setiembre = 5 viernes × 2 bloques = 10 sesiones).
3. **Tasas Ficticias (100%) y Mock Data de Asistencia**:
   - En `student-attendance-kardex.tsx`: `const rate = evaluadas > 0 ? Math.round((asistidasTotal / evaluadas) * 100) : 100;` devolvía un 100% artificial cuando no existía ninguna sesión evaluada aún.
   - En `src/store/official-control-pagos-seeds.ts`, `official-seeds.ts` y `admin-seeds.ts`: Todos los estudiantes tenían datos simulados (`recentAttendance: ["presente", "presente", "presente"]`, `attendanceRate: 100` o `75`).
   - El usuario solicitó explícitamente erradicar todos los datos simulados (mock data) para trabajar en producción real con la base de datos limpia de Insforge.

---

## Decisiones Técnicas

### 1. Aislamiento Estricto de Mes en el Kardex (src/components/admin/student-attendance-kardex.tsx)
- Se insertó la validación obligatoria:
  `if (!dayInfo.isCurrentMonth) return;`
  dentro de la generación de sesiones del Kardex. Con esto se garantiza que ninguna fecha perteneciente al mes anterior o siguiente desborde el cómputo del mes seleccionado (ej. Juan Mateo tiene ahora exactamente sus 8 sesiones en Agosto).
- Si `evaluadas === 0`, `stats.rate` ahora es `null`. En la tarjeta de "Tasa Global", reporte de WhatsApp y resúmenes se muestra `—` o `Sin evaluar` en lugar de un falso 100%.

### 2. Rediseño Conceptual de la Libreta de Asistencias (src/components/admin/agenda-board.tsx)
- Se separó la supervisión del **Horario Semanal** del **Cumplimiento de Asistencias del Mes**:
  - **Insignia de Horario Semanal**:
    - Si `weeklySlotsCount >= targetWeeklySlots`: `🟢 Horario Completo (X frec/sem)`
    - Si `weeklySlotsCount < targetWeeklySlots`: `🟡 Horario Parcial (X/Y frec)` con advertencia de días faltantes en la cuadrícula semanal.
  - **Cómputo Real de Asistencias del Mes**:
    - Se agregan las asistencias reales iterando las semanas del mes y leyendo `lesson.attendanceByWeek[week.weekIndex]`.
    - La barra de progreso y texto indican: `Cumplimiento de Asistencias del Mes: ${totalAsistidas} de ${targetLessons} clases asistidas`.
    - Si no se ha marcado ninguna clase, la barra muestra 0% y `0 de 8 clases asistidas`.
    - Desglose transparente: `🟢 X Pres`, `🔴 X Aus`, `🟡 X Tar`, `🔵 X Just`, `⚪ X Pend`.

### 3. Purgado Total de Mock Data de Asistencia para Producción Real
- **src/store/admin-seeds.ts**:
  `adminStudents` se inicializa mapeando `officialControlPagosStudents` con `recentAttendance: []` y `attendanceRate: 0`.
- **src/store/official-control-pagos-seeds.ts` y `src/store/official-seeds.ts**:
  Se purgó todo el array de `recentAttendance` simulado dejándolo en `[]`, y todos los `attendanceRate` en `0`.
- **src/store/app-store.ts**:
  En `markLessonAttendance`, `setStudentSessionAttendance` y `bulkRegularizeStudentAttendance`, la tasa de asistencia devuelve `0` si `totalEvaluated === 0`, y `recentAttendance` se reinicia a `[]` si se desmarcan las sesiones.
- **src/components/admin/students-table.tsx` y `src/routes/teacher.alumnos.tsx**:
  - Importación CSV ajustada a valores limpios (`attendanceRate: 0`, `recentAttendance: []`).
  - La columna de asistencia y la tarjeta del profesor muestran `—` o `Sin registros` cuando no hay evaluaciones previas.
  - El promedio global (`avgAttendance`) se calcula exclusivamente sobre alumnos con clases efectivamente evaluadas.

---

## Consecuencias y Validación
- **Veracidad Operativa**: Toda la información de asistencia mostrada en la plataforma proviene exclusivamente de marcas reales realizadas por profesores o secretaría, sincronizadas con `attendance_logs` en PostgreSQL (Insforge).
- **Cero Ambigüedad**: Secretaría y Dirección Académica distinguen claramente entre la configuración del horario semanal y el récord de asistencias del mes.
- **Compilación Exitosa**: `npm run build` ejecutado exitosamente con 0 errores (código de salida 0).
