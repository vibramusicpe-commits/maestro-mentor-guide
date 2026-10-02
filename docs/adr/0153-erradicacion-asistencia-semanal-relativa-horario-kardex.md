# ADR-0153: Erradicación de Asistencia Semanal Relativa en Celdas de Calendario, Aislamiento por Fecha Exacta y Corrección de Bolsas Flexibles

## Estado
Aceptado e Implementado

## Fecha
2026-10-02

## Contexto
Al transicionar el calendario a Octubre de 2026 (viernes 02 de octubre, semana 1 del mes), se detectaron anomalías críticas en el Horario de Clases (`AgendaBoard`) y en el Kardex de Asistencias:
1. **Marcas Fantasma en Días Futuros y Semanas Nuevas (Viernes 2 y Sábado 3 de Octubre)**:
   - En el Horario de Clases (`src/components/admin/agenda-board.tsx`), las celdas del calendario resolvían el estado de asistencia con un fallback a índices de semana relativos:
     `const cardAtt = lesson.attendanceByDate?.[dayInfo.dateStr] ?? lesson.attendanceByWeek?.[safeWeekIndex] ?? ...`.
   - Debido a que `attendanceByWeek` se indexa únicamente por números relativos (`0, 1, 2, 3`) sin año ni mes, al iniciar la semana 1 de Octubre (`safeWeekIndex = 0`), el sistema evaluaba las marcas grabadas en la semana 1 de Setiembre.
   - En consecuencia, la alumna Mia Lucero Bellido Alvan aparecía marcada con "FALTA" el viernes 02 de octubre y con "JUSTIFICADA" el sábado 03 de octubre (un día futuro al que todavía no se había llegado en tiempo real).
   - El mismo patrón ocurría en la vista diaria, cuadrícula semanal, vista Excel y en el kiosco docente (`src/routes/teacher.index.tsx`).
2. **Falsa Clase Consumida en Bolsa de Paquete Flexible (24 Clases Andrea Fernanda)**:
   - En `src/components/admin/student-attendance-kardex.tsx`, la métrica `totalPackageAttended` evaluaba fallbacks sobre `recentAttendance` o `attendanceStatus` genéricos, indicando "1 de 24 clases consumidas (23 disponibles)" a pesar de que el alumno tenía 0 asistencias y 24 clases en estado pendiente.
3. **Truncamiento de Sesiones en Vista de Mes Calendario (`computeStudentMonthSessions`)**:
   - En `src/lib/kardex-calculator.ts`, la guarda `if (effectivePlanStartDate && curDateStr < effectivePlanStartDate) continue;` provocaba que al consultar meses como Setiembre u Octubre para alumnos con fecha de inicio en semanas avanzadas (ej. Eithan David con 19 de Octubre), el Kardex ocultara completamente las sesiones recurrentes del mes, violando la Regla 3.3 de `AGENTS.md`.

## Decisiones Técnicas

### 1. Erradicación Universal de `attendanceByWeek` en Celdas de Calendario
- En todas las vistas de `src/components/admin/agenda-board.tsx` (Pareada, Diaria, Semanal, Excel, Hoja Lateral y Resumen de Estado) y en `src/routes/teacher.index.tsx`:
  - Se eliminó el operador fallback hacia `lesson.attendanceByWeek?.[safeWeekIndex]`.
  - La asistencia de una celda se evalúa **única y exclusivamente** mediante `lesson.attendanceByDate?.[dayInfo.dateStr]`.
  - Si una fecha no cuenta con marca explícita en `attendanceByDate`, su estado es estrictamente `undefined` (sin marcar / pendiente), imposibilitando que marcas de meses anteriores contaminen semanas homólogas en meses futuros o días no transcurridos.

### 2. Conteo Matemático Estricto de Clases Consumidas en Paquetes Flexibles
- En `src/components/admin/student-attendance-kardex.tsx`, `totalPackageAttended` recopila las fechas únicas de `attendanceByDate` donde el estado es efectivamente `"presente"` o `"tarde"` y la fecha no está excluida por reprogramación (`!lesson.excludedDates.includes(dateStr)`).
- Elimina cualquier conteo espurio derivado de estados por defecto o arreglos residuales.

### 3. Preservación del Horario Recurrente en Vista de Mes Calendario (Regla 3.3 AGENTS.md)
- En `src/lib/kardex-calculator.ts` (`computeStudentMonthSessions`), se retiró la omisión por `curDateStr < effectivePlanStartDate`. Al navegar en la pestaña "Mes Calendario", el sistema proyecta las clases regulares agendadas del mes seleccionado respetando la disponibilidad de la sala y profesor.

## Consecuencias y Verificación
- El Horario de Clases para el Sábado 03 de Octubre de 2026 se muestra limpio, sin marcas falsas de asistencias anticipadas.
- El viernes 02 de Octubre muestra el estado real del día en curso sin arrastres de setiembre.
- Andrea Fernanda refleja con exactitud matemática: "0 de 24 clases consumidas (24 clases disponibles)".
- `npm run build` compila al 100% sin errores de tipado o empaquetado.
