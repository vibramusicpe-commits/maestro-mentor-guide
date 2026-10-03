# ADR-0155: Blindaje de Categoría de Recuperación en Agenda de Horarios y Saneamiento de Plantillas Recurrentes

## Estado
Aprobado e Implementado

## Fecha
2026-10-02

## Contexto
En la vista del Horario de Clases (`/admin/agenda`), el alumno **Aaron** (y potencialmente otros alumnos con semillas antiguas o perfiles mal migrados) aparecía con clases marcadas en rojo como `🔴 Recuperación` a lo largo de todo el mes de octubre, noviembre y diciembre, a pesar de que en su Kardex de asistencias dichas sesiones figuraban correctamente como clases regulares pendientes (`⚪ Sin marcar`).

### Causa Raíz
1. **Detección Permisiva de Recuperación en UI (`agenda-board.tsx`)**:
   En las líneas 1505, 1901, 2108 y 2264 de `src/components/admin/agenda-board.tsx`, se evaluaba:
   ```typescript
   const isRecup = lesson.isMakeup || lesson.category === "RECUPERACION";
   const catKey = isRecup ? "RECUPERACION" : (lesson.category ?? "JUNIOR");
   ```
   Si una lección recurrente semanal (plantilla sin `dateStr` y sin `isMakeup`) tenía registrado `"category": "RECUPERACION"`, el sistema la renderizaba en todas las semanas del año con el chip `🔴 Recuperación` y el estilo visual rojo de recuperación (`CLASE DE RECUPERACIÓN (ROJO)`).
2. **Defecto en Semilla y Registro en PostgreSQL**:
   En la base de datos PostgreSQL (`students` table, id `0a899060-3aaf-4574-b1ea-71163953dbae`) y en `src/store/official-seeds.ts`, las dos lecciones recurrentes de la plantilla semanal de Aaron (Lunes 16:00 y Miércoles 16:00 con Fernando en Sala B) tenían `"category": "RECUPERACION"` en lugar de su categoría de edad real (`"JUNIOR"`). Aaron tiene 10 años, por lo que su categoría contractual es `JUNIOR`.

## Decisiones Técnicas

### 1. Definición Inequívoca de Clase de Recuperación en Agenda
Una clase de recuperación es **estrictamente puntual**:
- Debe contar obligatoriamente con `lesson.isMakeup === true`, O BIEN con una fecha explícita y acotada (`lesson.dateStr`) junto con `lesson.category === "RECUPERACION"`.
- Una lección de plantilla semanal recurrente (sin `dateStr` y con `!lesson.isMakeup`) **JAMÁS** puede ser interpretada como una recuperación en la agenda semanal.

### 2. Blindaje de Evaluación Cromática y Chips en `agenda-board.tsx`
Se blindaron las 4 vistas de la agenda (vista de salas, vista de docentes, grilla semanal y grilla de sábado):
```typescript
const studentProfile = findStudentProfileByName(adminStudents, lesson.student);
const isRecup = Boolean(lesson.isMakeup || (lesson.dateStr && lesson.category === "RECUPERACION"));
const catKey = isRecup
  ? "RECUPERACION"
  : ((lesson.category && lesson.category !== "RECUPERACION")
      ? lesson.category
      : (studentProfile?.ageCategory ?? "JUNIOR"));
const catStyle = categoryStyles[catKey] || categoryStyles.JUNIOR!;
```
Si `isRecup` es falso, el color y categoría de la celda se resuelven a partir de la categoría real de la lección o del perfil del alumno (`ageCategory`), impidiendo que un residuo `"RECUPERACION"` tiña las clases regulares.

### 3. Saneamiento Quirúrgico en Base de Datos PostgreSQL
Se actualizó la columna `emergency_contact->'scheduleLessons'` de Aaron (`0a899060-3aaf-4574-b1ea-71163953dbae`):
- `sch-1790797904156-it69` (Lun 16:00): `category` pasa de `"RECUPERACION"` a `"JUNIOR"`.
- `sch-1790797904156-gied` (Mié 16:00): `category` pasa de `"RECUPERACION"` a `"JUNIOR"`.
- Sus 4 recuperaciones puntuales legítimas de agosto y septiembre (`isMakeup: true`, con `dateStr`) se preservaron íntegras e inmutables.
- Se verificó que ningún otro alumno activo en PostgreSQL posee lecciones recurrentes con categoría errónea.

### 4. Saneamiento en Semillas Oficiales (`official-seeds.ts`)
Se normalizaron las plantillas de `official-seeds.ts`:
- Aaron Balarezo Sosa (`sch-3`, Lun 16:00): `category: "JUNIOR"`.
- Karen Gutierrez (`sch-19`, Lun 19:00): `category: "ADULTO"`.
- Fabiana Arroyo Tineo (`sch-53`, Mié 16:45): `category: "JUNIOR"`.

## Consecuencias
- En `/admin/agenda`, las clases semanales de Aaron en octubre, noviembre y diciembre se muestran limpias en color naranja/ámbar de `JUNIOR`, con estado normal programado.
- Las clases de recuperación solo se activan en rojo cuando son asignadas manualmente de forma puntual con fecha y flag de recuperación.
- La consistencia entre el Kardex (donde figuraban como pendientes sin marcar) y la Agenda (donde ahora se ven como clases normales programadas) queda 100% restituida.
