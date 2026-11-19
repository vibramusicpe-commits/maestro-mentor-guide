# 2026-11-18 · ADR-0197 · Dedupe por identidad y purga de fantasmas

## Contexto

Dos reportes abiertos el mismo día:

1. **"Mathias "** seguía sin aparecer en `/admin/alumnos` aun después del fix de
   búsqueda y confirmación de homónimos (ADR-0196, commit `6c39e18`, deploy
   Cloudflare Pages `success`).
2. **"Fernando Castillo"** había sido eliminado desde la UI y **seguía
   apareciendo en `/admin/agenda`**.

La regla del proyecto es PostgreSQL como única fuente de verdad
(ADR-001.3 / ADR-0119), así que se investigó con datos vivos antes de tocar
código.

## Investigación

### Mathias

Deduplicación reproducida con el **código real compilado**
(`scratch/.matching-check/student-matching.cjs`), no con una reimplementación:

```
activos en PostgreSQL: 71
visibles tras deduplicar: 63
ocultados: 8
```

Los 8 ocultos incluían personas **distintas**: `"Mathias "` (absorbido por
`"Gael Mathias"`), `"JAN"`/`"JAM"`, los cuatro registros `Luciana*` y un
`"Benjamin "`.

Diagnóstico: el problema **no era el buscador** (ya corregido en ADR-0196) sino
que el registro **nunca llegaba al store**. `hydrateFromBackend` deduplicaba con
`isMatchingStudentName`, que trata un nombre **contenido** en otro como el mismo
alumno. Con orden `full_name.asc`, el nombre compuesto gana y el corto
desaparece. El matcher es correcto para *buscar*, no para *deduplicar*.

### Fernando Castillo

```sql
select id, full_name, status from students where full_name ilike '%fernando%';            -- 0
select id from students where emergency_contact::text ilike '%fernando castillo%';        -- 0
select id from attendance_logs where note ilike '%fernando%';                             -- 0
```

Ausente en las tres tablas. El fantasma era **estado local**: `mergedStudents`
arrancaba con todos los activos de `localStorage` y la hidratación solo añadía o
actualizaba; nunca eliminaba. Un alumno borrado desde otra pestaña o PC
sobrevivía indefinidamente en la Agenda.

Además, el paso 1 de `cleanSchedule` conservaba clases locales resolviendo al
alumno por **parecido de nombre** y guardando la lección con el nombre original,
así que la clase podía seguir pintándose con el nombre de un alumno eliminado.

## Cambios (`src/store/app-store.ts`)

1. **Deduplicación por identidad**: nombre normalizado **exacto** + evidencia
   (misma familia normalizada **o** misma `birthdate`). Sin evidencia, se
   conservan ambos.
2. **Fusión con prioridad** `uuid → nombre exacto → difuso solo si el local no
   existe en PostgreSQL` (altas en vuelo).
3. **Purga de fantasmas** con `pendingStudentCreateIds` (nuevo `Set` de módulo,
   marcado en `backgroundCreateStudentInDB`, desmarcado en el `.then`
   confirmatorio del INSERT y del PATCH de fallback).
4. **Horario saneado**: coincidencia exacta primero y reescritura del `student`
   de la lección conservada al nombre del perfil activo.
5. **Tipado**: `incomingStudents: AdminStudent[]` para las clausuras anidadas.
   Sin `as any`.

## Verificación

```
activos en PostgreSQL: 71
visibles tras hidratar: 70
ocultados: 1 → "Benjamin "
"Mathias " visible: SÍ
fantasma "Fernando Castillo" en el horario: NO ✅
"JAN" y "JAM" visibles: true / true
```

El único ocultado restante es un **duplicado real** (dos `"Benjamin "` con la
misma `birthdate` 2015-08-28 y la misma familia Baltazar Espinoza).

`npx tsc --noEmit -p tsconfig.json` → **150**, idéntico al baseline
`scratch/.tsc-fix26.txt` agrupado por `(archivo, código TS)`: **0 nuevos**.

`npm run build` → **verde** (`BUILD_EXIT=0`).

## No se tocó

`isMatchingStudentName`, `normalizeStudentName`, `kardex-calculator.ts`,
`student-cycle.ts`, asistencia, Kardex, facturación, `persist.merge`.
Sin DDL ni escrituras en PostgreSQL.

## Pendiente operativo

- Pulsar **🔄 Sincronizar** en el navegador afectado para que la purga retire
  "Fernando Castillo" de la Agenda.
- Renombrar `"Mathias "` a "Mathias Gutierrez Chavez" **desde la ficha en la UI**
  (gobernanza de datos productivos: sin mutación directa).
