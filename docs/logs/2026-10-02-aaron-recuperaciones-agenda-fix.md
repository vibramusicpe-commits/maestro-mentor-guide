# Incidente y Resolución: Corrección de Clases de Recuperación en Agenda y Saneamiento de Horarios Recurrentes de Aaron

**Fecha**: 2026-10-02  
**Módulos Afectados**: `/admin/agenda` (`AgendaBoard`), `students` (PostgreSQL), `official-seeds.ts`  
**Referencia ADR**: ADR-0155  

---

## 1. Síntoma Reportado
El usuario constató que en el Horario de Clases (`https://musicstaff-vm.pages.dev/admin/agenda`), el alumno **Aaron** aparecía con clases marcadas en rojo como `🔴 Recuperación` en todas las semanas de octubre, a pesar de que:
1. En su Kardex de Asistencias, dichas clases figuraban como clases pendientes normales (`⚪ Sin marcar`).
2. Nunca se había agendado una recuperación recurrente para todo el mes; las recuperaciones de Aaron correspondían a fechas específicas pasadas (agosto y septiembre).
3. Esto impedía continuar llenando la base de datos con nuevos registros activos por riesgo de ensuciar el horario.

---

## 2. Investigación y Diagnóstico
1. **Auditoría de Base de Datos PostgreSQL**:
   Se consultó el registro de Aaron (`0a899060-3aaf-4574-b1ea-71163953dbae`):
   - En `emergency_contact->'scheduleLessons'`, se identificaron 7 lecciones.
   - Las lecciones `sch-1790797904156-it69` (Lunes 16:00) y `sch-1790797904156-gied` (Miércoles 16:00) son las plantillas recurrentes semanales del alumno. Ambas tenían registrado `"category": "RECUPERACION"`.
   - Se ejecutó una consulta global sobre todos los alumnos activos en PostgreSQL: Aaron era el **único** alumno con este vicio de categoría en plantillas recurrentes.
2. **Auditoría de Componente `agenda-board.tsx`**:
   - En 4 bloques de renderizado (vista por sala, vista por docente, grilla semanal y grilla de sábado), el flag de recuperación se computaba como:
     `const isRecup = lesson.isMakeup || lesson.category === "RECUPERACION";`
   - Al coincidir la plantilla recurrente de Aaron, se evaluaba `isRecup = true`, pintando la celda de rojo e insertando la píldora `🔴 Recuperación` en todas las semanas proyectadas.
3. **Auditoría de Semillas**:
   - Se detectó que en `src/store/official-seeds.ts`, Aaron (`sch-3`), Karen Gutierrez (`sch-19`) y Fabiana Arroyo (`sch-53`) tenían `"category": "RECUPERACION"` en lugar de su categoría de edad.

---

## 3. Acciones Ejecutadas
1. **Saneamiento Quirúrgico en PostgreSQL**:
   - Se actualizó el JSONB de `emergency_contact->'scheduleLessons'` para Aaron (`0a899060-3aaf-4574-b1ea-71163953dbae`):
     - `sch-1790797904156-it69` (Lun 16:00): `category` actualizada a `"JUNIOR"`.
     - `sch-1790797904156-gied` (Mié 16:00): `category` actualizada a `"JUNIOR"`.
     - Se preservaron intactas sus 4 recuperaciones reales y su asistencia histórica.
2. **Blindaje en Frontend (`agenda-board.tsx`)**:
   - Se ajustó la lógica en las 4 vistas para requerir `isMakeup` o `dateStr`:
     `const isRecup = Boolean(lesson.isMakeup || (lesson.dateStr && lesson.category === "RECUPERACION"));`
   - Si no es recuperación, `catKey` resuelve a la categoría real o al perfil del alumno (`ageCategory ?? "JUNIOR"`).
3. **Corrección de Semillas (`official-seeds.ts`)**:
   - Se normalizaron las plantillas de Aaron, Karen y Fabiana a sus categorías pedagógicas correspondientes.
4. **Verificación**:
   - `npm run build` ejecutado exitosamente sin advertencias ni errores de TypeScript.
