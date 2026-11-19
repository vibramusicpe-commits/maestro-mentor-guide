# ADR-0197: Deduplicación por identidad y purga de fantasmas de `localStorage` en `hydrateFromBackend`

**Estado:** Aceptado · **Fecha:** 2026-11-18 · **Incidentes:** "Mathias " (invisible en el Directorio) y "Fernando Castillo" (eliminado, seguía en la Agenda)

## 1. Síntomas

1. **Alumno invisible.** "Mathias " (`539feb70-07c6-4f37-a1e3-beb5532c23ce`, activo, Batería, Prof. Jeremy, familia Gutierrez Chavéz) **no aparecía** en `/admin/alumnos` después del fix de búsqueda y confirmación de homónimos (ADR-0196). La búsqueda ya estaba corregida, pero el registro **nunca llegaba al store**.
2. **Alumno fantasma.** "Fernando Castillo", eliminado desde la UI, **seguía apareciendo en `/admin/agenda`** y en el Horario de Clases aunque el registro ya no existe en PostgreSQL.

Los dos síntomas son el mismo defecto visto desde dos lados: `hydrateFromBackend` fusionaba y deduplicaba la lista de alumnos con **parecido de nombre** en lugar de **identidad**, y nunca verificaba si un alumno local seguía existiendo en PostgreSQL.

## 2. Evidencia (datos vivos, Insforge MCP solo lectura + matcher real compilado)

Ejecución de la deduplicación anterior contra las 71 filas activas
(`scratch/check-dedupe-hydrate.mjs`, usando `scratch/.matching-check/student-matching.cjs`,
compilado desde `src/lib/student-matching.ts`):

```
activos en PostgreSQL: 71
visibles tras deduplicar: 63
ocultados por la deduplicación: 8

--- ocultados (nombre | familia | quién lo absorbió) ---
"Benjamin "             | Familia Baltazar Espinoza | absorbido por "Benjamin "
"JAM"                   | Familia LOPEZ DE LA CRUZ  | absorbido por "Benjamin "
"JAN"                   | Familia Adulto Titular    | absorbido por "Alejandro Huarca"
"Luciana "              | Familia Campana           | absorbido por "Luciana"
"LUCIANAA "             | Familia CAMPANA           | absorbido por "Luciana"
"Luciana (Canto)"       | Campo                     | absorbido por "Luciana"
"Luciana Mendoza Gómez" | Familia Mendoza Gómez     | absorbido por "Luciana"
"Mathias "              | Familia Gutierrez Chavéz  | absorbido por "Gael Mathias"
```

**8 alumnos reales y distintos** quedaban ocultos porque `isMatchingStudentName`
considera iguales los nombres **contenidos** en otro (`"Mathias"` ⊂ `"Gael Mathias"`,
`"JAM"` ⊂ `"Benjamin "`). Como el orden de lectura es `full_name.asc`, el nombre
compuesto ganaba siempre y el nombre corto desaparecía.

Caso Fernando Castillo, verificado en PostgreSQL:

```sql
select id, full_name, status from students where full_name ilike '%fernando%';  -- 0 filas
select id, full_name, status from students where emergency_contact::text ilike '%fernando castillo%';  -- 0 filas
select id, student_id, status, note from attendance_logs where note ilike '%fernando%';  -- 0 filas
```

No existe en `students`, ni en ningún `emergency_contact.scheduleLessons`, ni en
`attendance_logs`. **El fantasma era 100% estado local** (`localStorage`,
`cadencia-app-v32`), no un dato remoto.

## 3. Causas

1. **Deduplicación por parecido, no por identidad** (ADR-0164): `dedupedStudents.some(existing => isMatchingStudentName(existing.name, st.name))`. El matcher es correcto para sus fines (ADR-0107/0119), pero **no sirve para deduplicar**: está diseñado para *encontrar* a un alumno cuando el nombre viene truncado o invertido, no para decidir que dos filas son la misma persona.
2. **Fusión por parecido antes de llegar al UUID**: el `findIndex` de la fusión evaluaba `isSameStudentId(...) || isMatchingStudentName(...)` en una sola pasada, así que un registro con el nombre correcto podía ser localizado por el nombre de **otro** alumno antes de llegar a su propio UUID, y quedar pisado.
3. **Fantasmas perpetuos**: `mergedStudents` arrancaba con **todos** los activos locales y la hidratación solo añadía/actualizaba los que venían de PostgreSQL. Un alumno eliminado desde otra PC o pestaña **se quedaba en el store para siempre** y seguía inyectando clases en la Agenda. Contradecía ADR-001.3 y ADR-0119 ("PostgreSQL es la única fuente de verdad").
4. **El horario también se resolvía por parecido**: el paso 1 de `cleanSchedule` conservaba clases locales buscando al alumno con `isMatchingStudentName` y **guardaba la lección con su nombre original**, de modo que una clase podía seguir renderizándose bajo el nombre de un alumno eliminado.

## 4. Fix (quirúrgico, sin DDL, sin tocar motores)

Todo el cambio vive en `src/store/app-store.ts`.

### 4.1 Deduplicación por identidad
Dos registros activos se consideran **la misma persona** solo si coinciden
**nombre normalizado exacto** **y** una evidencia de identidad:

- misma familia normalizada, **o**
- misma `birthdate`.

Sin evidencia, **ambos se conservan**. Nunca se oculta a un alumno por parecido
de nombre: los casi-duplicados aparecen en el Directorio y se archivan desde
Depuración (ADR-0191).

### 4.2 Fusión con prioridad explícita
`findExistingStudentIndex(dbSt)` resuelve en este orden:

1. **UUID** (`isSameStudentId`).
2. **Nombre normalizado exacto**.
3. **Parecido difuso solo si** el registro local **no existe en PostgreSQL** (alta local en vuelo).

### 4.3 Purga de fantasmas con guardia de altas en vuelo
Nuevo `const pendingStudentCreateIds = new Set<string>()` a nivel de módulo:

- **marca** el id al iniciar `backgroundCreateStudentInDB`;
- **desmarca** en el `.then` confirmatorio del INSERT (o del PATCH de fallback).

`persistedActiveStudents` descarta todo alumno `activo` que **no** aparezca en la
lectura completa de `students`, salvo que esté en ese set. No se persiste: al
recargar, PostgreSQL manda.

Se conserva intacta la guarda superior: si la respuesta trae **0 alumnos** no se
purga nada (una lectura vacía no puede vaciar el Directorio).

### 4.4 Horario sin nombres eliminados
El paso 1 de `cleanSchedule` prioriza coincidencia **exacta** y, cuando conserva
una clase local, **reescribe `student` al nombre del perfil activo**, de modo que
ninguna lección puede renderizarse con el nombre de un alumno que ya no existe.

### 4.5 Tipado
`incomingStudents: AdminStudent[]` captura `data.students` (ya validado por el
guardia superior) para que las funciones anidadas conserven el tipo estrecho.
Sin `as any` ni `!`.

## 5. Resultado (mismos datos vivos, misma simulación)

| Métrica | Antes | Después |
|---|---|---|
| Activos en PostgreSQL | 71 | 71 |
| Visibles tras hidratar | 63 | **70** |
| Ocultados | 8 | **1** |
| `"Mathias "` visible | NO | **SÍ** |
| `"JAN"` / `"JAM"` visibles | NO / NO | **SÍ / SÍ** |
| Fantasma "Fernando Castillo" en el horario | SÍ | **NO** |

El único ocultado restante es un **duplicado real confirmado**: `"Benjamin "`
(`57db57ae…`, creado 2026-10-05) y `"Benjamin "` (`1d27dabd…`, creado 2026-11-14`)
con **misma fecha de nacimiento** (`2015-08-28`) y **misma familia**
("Familia Baltazar Espinoza"). Es exactamente el caso que la regla de identidad
debe colapsar.

## 6. Qué NO se tocó

- `isMatchingStudentName` / `normalizeStudentName` (ADR-0107/0119) intactos.
- `kardex-calculator.ts`, `student-cycle.ts`, asistencia, Kardex y facturación intactos.
- Sin `ALTER TABLE`, sin `DELETE`, sin escrituras en PostgreSQL.
- Sin cambios en `persist.merge`: la hidratación es la fuente de verdad y ya purga.

## 7. Operación para cerrar el incidente

1. En el navegador afectado, pulsar **🔄 Sincronizar** (o esperar el polling de ≤ 20 s). La purga retira "Fernando Castillo" de la Agenda y del Horario.
2. `"Mathias "` ya aparece en el Directorio. Para que figure como "Mathias Gutierrez Chavez" hay que **editar la ficha desde la UI** (gobernanza de datos de producción, sin mutación directa).

## 8. Verificación

- `scratch/check-dedupe-hydrate.mjs` con datos vivos y el matcher real compilado: 71 → 70, `"Mathias "` visible, fantasma ausente, `JAN`/`JAM` visibles.
- `npx tsc --noEmit -p tsconfig.json`: **150 errores**, idéntico al baseline `scratch/.tsc-fix26.txt` por `(archivo, código TS)` — **0 nuevos**.
- `npm run build`: verde (`BUILD_EXIT=0`).
