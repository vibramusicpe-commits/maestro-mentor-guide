# ADR-0110: Soporte Integral para Modalidad Regular 1x/sem (8 clases / 45 min · 2 meses)

## Estado
Aceptado e Implementado en Producción (v2.0.4)

## Contexto
Al matricular o editar a la alumna **Sasha Dharma Contreras de la Cruz** (Canto, Prof. Nathaly, Adulto) bajo la modalidad oficial:
`Regular: 8 clases (1x semana, 45 min · 2 meses)` (`Regular 1x/sem (8 clases / 45 min)`), el formulario de organización de horario (`ScheduleStudentForm`) agrupaba a todos los planes regulares bajo `isRegular` (asumiendo 2 clases semanales obligatorias).

Esto provocaba:
1. Alerta falsa de vacantes y aforo: el modal exigía un "Día 2" inexistente, arrojando *"¡Sin cupos simultáneos disponibles para 2 clases/semana! Prof. Nathaly tiene horarios ocupados en uno de los días..."*.
2. Exigencia de 2 clases por semana: el modal obligaba a configurar Día 1 y Día 2 con pares de días o modo personalizado.
3. Botón bloqueado con texto *"Guardar Horario Completo (2 Clases Semanales)"*.
4. Recorte de vigencia: si se calculaba la vigencia como 1 mes, 8 clases a 1 clase por semana (8 semanas) quedaban truncadas en el Kardex y en la agenda.

## Decisiones Técnicas

1. **Tríada de Modalidades en `ScheduleStudentForm`**:
   - `isRegular2x`: `Regular (8 clases / 45 min)` -> Requiere Día 1 y Día 2 (45 min c/u).
   - `isRegular1x`: `Regular 1x/sem (8 clases / 45 min)` -> Requiere únicamente **Día 1 (45 min)**.
   - `isIntensive`: `Intensivo (4 clases / 90 min)` -> Requiere únicamente **Día 1 (90 min)**.

2. **Diagnóstico Reactivo de Conflictos sin Día 2 Fantasma**:
   - `conflictReport`: evalúa `session2` exclusivamente cuando `isRegular2x` es `true`. Para `isRegular1x`, `session2` es `null`, validando únicamente la franja horaria y aforo de la clase semanal seleccionada.
   - `suggestedSlots`: genera sugerencias basadas en vacantes de `day1` sin exigir vacantes simultáneas en un día complementario.

3. **Asignación Oficial Automática de Salas por Docente (ADR-0102)**:
   - Nathaly -> Sala C (Piano Infantil y Canto)
   - Fernando -> Sala B (Piano estándar y Violín)
   - Jeremy -> Sala A (Guitarra y Batería)
   - Al seleccionar docente o abrir el formulario, las salas se inicializan automáticamente con la sala oficial asignada al docente.

4. **Extensión de Vigencia Contractual a 2 Meses**:
   - Al matricular en `AddNewStudentDialog` o guardar en `ScheduleStudentForm`, la fecha fin se proyecta sumando **2 meses** (`monthsToAdd = 2`), garantizando que las 8 clases queden cubiertas dentro de su ciclo contractual.

5. **Ventana de Proyección en Kardex (`StudentAttendanceKardex`)**:
   - Se aumentó `maxDaysToScan` a 90 días en `StudentAttendanceKardex` (alineado con `computeStudentCycle`), asegurando que las 8 semanas de clases del ciclo lectivo se proyecten completas sin truncamiento.

## Consecuencias y Beneficios
- Alumnos con modalidad 1x semana pueden organizar su horario en un solo clic seleccionando su único día y hora de clase semanal.
- Cero falsas alertas de falta de cupo por requerimientos de días dobles.
- Asignación pedagógica limpia en Sala C con Prof. Nathaly respetando ADR-0102.
- 100% de retrocompatibilidad con planes regulares tradicionales (2x/sem) e intensivos (90m).
