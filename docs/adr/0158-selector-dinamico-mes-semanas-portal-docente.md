# ADR 0158: Selector Dinámico de Mes y Semanas en Portal Docente (Octubre - Diciembre 2026)

## Estado
Aprobado e Implementado (v2.0.28) — 05 de Octubre, 2026

## Contexto
1. **Bloqueo Temporal en Kiosco Docente (`/teacher`)**:
   - En `src/routes/teacher.index.tsx`, el cálculo de semanas utilizaba `getMonthWeeks(2026, 8)` y `getCurrentWeekIndex(2026, 8)` hardcodeados, manteniendo la vista anclada permanentemente a la última semana de Setiembre 2026.
   - Los docentes no podían navegar ni visualizar sus clases del mes de Octubre 2026 ni registrar asistencias para el nuevo ciclo lectivo.
2. **Mes Fijo en "Mi Horario" (`/teacher/agenda`) y Calendario Mínimo**:
   - `teacher.agenda.tsx` pasaba `defaultMonth={8}` rígidamente.
   - En `src/components/agenda/minimal-agenda-calendar.tsx`, la selección inicial no reconocía el mes real en curso del sistema.

## Decisiones Técnicas
1. **Navegación Mensual y Semanal Dinámica (`src/routes/teacher.index.tsx`)**:
   - Se incorporó selector interactivo de mes (`selectedYear` y `selectedMonth`) con cobertura desde Julio hasta Diciembre 2026, inicializado en el mes activo del sistema (Octubre 2026).
   - Se añadieron botones de navegación por semana (`Sem 1`, `Sem 2`, `Sem 3`, `Sem 4`, `Sem 5`) y etiquetado con número de día (`Lun 5`, `Mar 6`, etc.).
2. **Dinamización de `teacher.agenda.tsx` y `MinimalAgendaCalendar`**:
   - Se eliminó el parámetro hardcodeado `defaultMonth={8}`.
   - `resolvedDefaultMonth` inicializa automáticamente en `new Date().getMonth()`.
   - Se extendió el rango de opciones del selector para abarcar Noviembre y Diciembre 2026.
3. **Coherencia con el Ciclo Contractual**:
   - Las sesiones visibles en el portal docente filtran de manera reactiva según `isLessonInStudentCycle`, asegurando que las clases de alumnos con ciclo renovado o en curso se proyecten en las semanas correctas.

## Verificación
- Verificado el acceso y navegación en `/teacher` y `/teacher/agenda` para Octubre 2026.
- Compilación `npm run build` exitosa con 0 errores.
