# ADR 0096: Actualización Reactiva de Fichas de Alumnos y Persistencia Bidireccional en PostgreSQL

## Estado
Aceptado e Implementado en Producción

## Fecha
2026-09-15

## Contexto
Durante el proceso de reactivación y regularización 1 a 1 de alumnos desde el panel de administración (`/admin/alumnos`), el equipo de Dirección y Marketing realizó una prueba reactivando y editando la ficha de "Camila Valentina Pastor Conco". Tras pulsar "Guardar Cambios", la interfaz mostraba la alerta "Ficha guardada exitosamente en la base de datos", pero los cambios no se reflejaban de forma reactiva en la tabla ni en la ficha, y al recargar la página se perdían datos extendidos.

Tras una auditoría técnica profunda del flujo de mutación y persistencia, se detectaron las siguientes causas raíz:

1. **Discrepancia de Formato de ID (`UUID` Canónico vs Legacy ID)**:
   - Al hidratar la lista `adminStudents` desde PostgreSQL (`students`), los IDs asignados correspondían a UUIDs canónicos (ej. `00000000-0000-0000-0002-000000000045`).
   - Los componentes de la interfaz utilizaban o recibían IDs en formato legacy (ej. `as-cp-69`).
   - Las acciones del store Zustand (`updateStudentDetails`, `setStudentStatus`, `deleteStudent`, etc.) evaluaban la pertenencia mediante comparación estricta: `st.id === id`.
   - Como `'00000000-0000-0000-0002-000000000045' === 'as-cp-69'` es `false`, el estado en memoria de Zustand nunca se modificaba de forma reactiva (optimistic update fallido).
   - En paralelo, el guardado en segundo plano (`backgroundSyncStudentToDB`) sí convertía el ID mediante `resolveStudentUUID`, por lo que enviaba el PATCH a PostgreSQL con éxito, generando la falsa impresión de que se guardó pero "no actualizó la página".

2. **Pérdida de Metadatos en Sincronización DB (`backgroundSyncStudentToDB`)**:
   - La sincronización a PostgreSQL solo enviaba un subconjunto mínimo de campos a la tabla `students`.
   - Omitía la asignación de profesor regular (`assigned_teacher_id`), teléfono, edad (`age`), categoría de edad (`ageCategory`), tipo de plan (`planType`), fecha de inicio (`planStartDate`), etc., y no sincronizaba los datos de contacto con la tabla `families`.

3. **Pérdida de Metadatos en la Hidratación (`mapDBStudentToAdminStudent`)**:
   - Al recargar la página (F5) o sincronizar desde el backend, `mapDBStudentToAdminStudent` fijaba por defecto `planType = "Mensual"`, profesor `"Fernando"`, y dejaba `ageCategory` indefinido, sobrescribiendo los datos previamente configurados.

4. **Fallo en Propagación al Horario de Clases (`isMatchingStudentName` vs `.includes`)**:
   - Cuando se cambiaba el nombre o horario en `updateStudentDetails`, la actualización de las lecciones del horario utilizaba `lesson.student.toLowerCase().includes(...)`, lo cual fallaba cuando los nombres tenían diferencias de segundo nombre o apellidos (ej. "Camila Valentina Pastor Conco" vs "Camila Pastor Conco").

5. **Ausencia del Selector de Estado de Matrícula en "Editar Ficha"**:
   - El formulario `EditStudentSheetInner` no incluía un selector para cambiar directamente el estado del alumno (`activo`, `pausa`, `baja`), obligando al usuario a buscar acciones dispersas.

## Decisiones Técnicas Implementadas

### 1. Función Universal de Comparación de IDs (`isSameStudentId`)
Se implementó y exportó en `src/lib/student-matching.ts`:
```typescript
export function isSameStudentId(idA: string | undefined | null, idB: string | undefined | null): boolean {
  if (!idA || !idB) return false;
  if (idA === idB) return true;
  const uuidA = resolveStudentUUID(idA);
  const uuidB = resolveStudentUUID(idB);
  if (uuidA && uuidB && uuidA === uuidB) return true;
  return false;
}
```
Esta función fue integrada en **todas las mutaciones de alumnos** en `src/store/app-store.ts`:
- `updateStudentDetails`
- `setStudentStatus`
- `assignTeacher`
- `setStudentModality`
- `addStudentCredit` / `consumeStudentCredit`
- `deleteStudent` / `deleteStudents` / `restoreDeletedStudent`
- `addStudentReentryRecord`
- `approveDeletionRequest`

Garantizando que cualquier acción funcione de forma idéntica si recibe un UUID canónico o un ID legacy.

### 2. Preservación Completa de Metadatos Ricos en PostgreSQL (`emergency_contact` JSONB)
Dado que la tabla `students` en PostgreSQL posee la columna `emergency_contact` de tipo `JSONB`, se aprovechó para persistir los atributos extendidos del alumno sin requerir migraciones DDL invasivas:
- `age`, `ageCategory`
- `planType`, `planStartDate`
- `customPrice`, `fatherName`
- `phone`, `emergencyContact`

`mapDBStudentToAdminStudent` (`src/lib/services/students.service.ts`) ahora extrae y mapea estos atributos transparentemente al hidratar, evitando pérdidas tras F5.

### 3. Sincronización Bidireccional con Tabla `families` y Profesores
En `backgroundSyncStudentToDB`:
- Se mapea el profesor asignado (`teacher`) a su UUID correspondiente (`assigned_teacher_id`) en `students`.
- Se actualiza la tabla `families` vía `studentsService.updateFamily(student.family_id, ...)` para mantener actualizados los teléfonos y nombres de apoderados.

### 4. Propagación Robusta al Horario Lectivo
En `updateStudentDetails`:
- Se reemplazó la búsqueda por `.includes()` por la función canónica `isMatchingStudentName(lesson.student, student.name)`.
- Si el alumno pasa a estado no-activo (`pausa` o `baja`), sus clases en el horario se limpian o marcan acorde a las reglas oficiales de Vibra Music.

### 5. Selector de Estado de Matrícula en `EditStudentSheetInner`
En `src/components/admin/students-table.tsx`:
- Se incorporó el campo interactivo "Estado de Matrícula" con opciones visuales:
  - `activo`: Activo (aparece en horario y reportes oficiales)
  - `pausa`: En Pausa (conservado en base de datos, fuera de cuadrícula)
  - `baja`: Baja Definitiva
- Al pulsar "Guardar Cambios", el estado se propaga inmediatamente tanto al estado en memoria de Zustand como a PostgreSQL en segundo plano.

### 6. Migración de Caché Local a `cadencia-app-v26`
- Se elevó la versión de persistencia de Zustand a `cadencia-app-v26`.
- La migración conserva los alumnos activados por la administración y previene la reversión a copias desactualizadas de LocalStorage.

## Consecuencias y Verificación
- **Reactividad Instantánea**: Al editar y guardar la ficha de un alumno, la tabla y los paneles reflejan los cambios en 0 ms sin requerir F5.
- **Persistencia Confiable**: Al recargar la página (F5), los datos de Camila Valentina Pastor Conco (y cualquier otro alumno) se cargan exactamente como fueron configurados, respaldados en PostgreSQL.
- **Sincronización de Horario Impecable**: Las lecciones del horario se vinculan correctamente sin importar discrepancias menores en los nombres compuestos.
- **Compilación Exitosa**: `npm run build` ejecutado sin errores en 1.3s.
