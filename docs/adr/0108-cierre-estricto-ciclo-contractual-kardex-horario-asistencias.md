# ADR 0108: Cierre Estricto de Ciclo Contractual, Preservación de Asistencias y Sincronización Kardex-Horario

## Estado
Aprobado (v2.0.2) — 18 de Septiembre, 2026

## Contexto
1. **Píldoras de Asistencia Ocultas en el Horario de Clases (Caso Camila Pastor Conco)**:
   - En `agenda-board.tsx` y `minimal-agenda-calendar.tsx`, la evaluación de asistencia en cada celda (`cardAtt` / `effectiveStatus`) leía únicamente el arreglo indexado por semana (`lesson.attendanceByWeek?.[safeWeekIndex]`).
   - Sin embargo, las marcas registradas por los docentes o la secretaría en el Kardex y Kiosco se persisten en PostgreSQL (`attendance_logs`) y en Zustand con fechas calendario exactas (`attendanceByDate: { "2026-09-10": "presente", ... }`).
   - Al no consultar `lesson.attendanceByDate?.[dayInfo.dateStr]`, las clases a las que la alumna ya asistió (ej. 10/09, 15/09, 17/09) se mostraban en el horario semanal sin el badge de asistencia "🟢 Pres".

2. **Clases "Fantasma" Posteriores a la Culminación del 100% de la Cuota (Caso Emma Micaela Sevilla Perez)**:
   - Emma completó el 100% de su cuota de 8 clases lectivas el viernes 18 de Setiembre de 2026 (tomó clases de corrido el 11/09 y 18/09).
   - Sin embargo, en el Horario de Clases seguían proyectándose clases no cursadas en la Semana 4 (21 al 25 de Setiembre), Semana 5 (28 al 30 de Setiembre) y en todos los meses subsiguientes (Octubre, Noviembre, etc.).
   - Causas raíz identificadas:
     a) Las plantillas recurrentes sin semana fija (`weekIndex === undefined`) proyectaban sesiones indefinidamente porque `agenda-board.tsx` solo verificaba si `selectedYearMonthStr < startMonth`, pero no si `selectedYearMonthStr > endMonth`.
     b) No existía una función centralizada de ciclo lectivo que determinase si el alumno ya consumió la totalidad de sus clases contratadas (`targetQuota = 8` en Plan Regular, `4` en Plan Intensivo, o `packageTotalSessions` en Paquete Flexible). Si la cuota ya estaba cubierta al 100%, el calendario continuaba proyectando slots vacíos.

## Decisiones Técnicas

1. **Módulo de Ciclo Contractual (`src/lib/student-cycle.ts`)**:
   - Creada la función `computeStudentCycle(student, lessons)` que calcula:
     - `targetQuota`: Cuota contractual contratada (8 Regular, 4 Intensivo, N Flexible).
     - `evaluatedSessions`: Conjunto ordenado cronológicamente de todas las clases ya evaluadas en sala (`presente`, `ausente`, `tarde`, `justificada`) extraídas desde `attendanceByDate`.
     - `isCompleted`: Booleano que se activa cuando `evaluatedCount >= targetQuota`.
     - `completionDate`: Fecha exacta de la última clase cursada que completó la cuota.
     - `validSlots`: Mapeo de fechas y horas permitidas que preserva incondicionalmente el 100% de las clases ya dictadas/asistidas, y solo permite las sesiones pendientes estrictamente necesarias hasta completar la cuota o alcanzar `planEndDate`.
   - Creada la función de guarda `isLessonInStudentCycle(student, lesson, dateStr, time, allLessons)` para su consumo directo en filtros de renderizado.

2. **Blindaje en `AgendaBoard` (`src/components/admin/agenda-board.tsx`)**:
   - En el filtro `visible`:
     ```ts
     if (!isLessonInStudentCycle(studentProfile, l, lessonDayInfo.dateStr, l.time, schedule)) return false;
     ```
     Si la cuota de la alumna ya está completa, cualquier slot no evaluado posterior a la fecha de culminación queda inmediatamente excluido.
   - En el filtro mensual:
     ```ts
     const endMonth = studentProfile.planEndDate ? studentProfile.planEndDate.slice(0, 7) : undefined;
     if (endMonth && selectedYearMonthStr > endMonth) return false;
     ```
     Impide que las plantillas semanales se proyecten en meses futuros cuando el contrato del alumno termina en el mes en curso.
   - En las celdas semanales (Lunes a Viernes y Sábado):
     `cardAtt` evalúa primero `lesson.attendanceByDate?.[dayInfo.dateStr]`, asegurando que "🟢 Pres" se pinte en las fechas reales de asistencia.

3. **Blindaje en `MinimalAgendaCalendar` (`src/components/agenda/minimal-agenda-calendar.tsx`)**:
   - Integrado `isLessonInStudentCycle` en el mapa de clases por día `lessonsByDay`.
   - Actualizado `effectiveStatus` para consultar `currentDayDateStr` en `attendanceByDate`.

4. **Sincronización Bidireccional en `hydrateFromBackend` (`src/store/app-store.ts`)**:
   - Al procesar `attendance_logs` de PostgreSQL, se sincroniza el mapa `attendanceByDate` tanto en `scheduleMap` como en `matchedStudent.scheduleLessons`.
   - Se añadió resolución de nombre por nota (`log.note && isMatchingStudentName(st.name, log.note)`) como fallback resiliente.

## Consecuencias
- **Camila Pastor Conco**: Sus 3 asistencias de Setiembre (10/09, 15/09, 17/09) se visualizan con su badge verde "🟢 Pres" en sus respectivos días lectivos.
- **Emma Sevilla**: Al haber culminado sus 8 créditos el 18/09, su historial de 8 clases queda perfectamente preservado y visible en las semanas 2 y 3, mientras que las semanas 4, 5 y los meses futuros quedan limpios de clases fantasma.
- **Total Coherencia**: El Kardex del alumno y el Horario de Clases comparten la misma verdad matemática sobre cuotas contractuales y asistencias.
