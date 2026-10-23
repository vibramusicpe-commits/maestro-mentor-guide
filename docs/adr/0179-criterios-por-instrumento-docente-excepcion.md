# ADR-0179: Criterios por Instrumento y Docente por Excepción

**Fecha:** 2026-10-23
**Estado:** Aceptado e implementado
**Autores:** Equipo Vibra (Open Code)

---

## Contexto

Los criterios de evaluación viven en `evaluation_fields`, con `owner_teacher_id`
e `instrument`. La base real tiene **6 sets**:

| Docente | Instrumento | Filas | Estado |
|---|---|---|---|
| Nathaly | Canto | 12 | validado |
| Nathaly | Piano Infantil | 12 | validado |
| Fernando | Piano | 12 | validado |
| Fernando | Violín | 13 | validado |
| Jeremy | Guitarra | 8 | borrador |
| Jeremy | Batería | 9 | borrador |

`getCriteria()` filtraba por `owner_teacher_id` **estricto**. Eso es correcto
para impedir que los criterios de Canto aparezcan en una clase de Piano, pero
rompe el caso real de un docente dictando un instrumento que no es su
especialidad:

- **Sylvia** (MASTER) toma **Guitarra con Fernando por excepción**. Fernando no
  tiene set de Guitarra (es de Jeremy), así que recibía 0 criterios y el
  mensaje genérico.

Dirección pidió resolverlo de forma que **sirva para el futuro**: otro alumno,
otro docente u otro instrumento pueden repetir el caso. La respuesta no puede
ser duplicar listas cada vez.

---

## Decisión

### 1. Fuente única del mapeo (`src/lib/informes/instrument-specialists.ts`)

Un solo módulo concentra:

- `instrumentFamily()`: normaliza el texto de la ficha a la familia del
  instrumento.
- `INSTRUMENT_SPECIALISTS`: familia → docente especialista (UUID + nombre).
- `resolveSpecialistTeacherId()` / `resolveSpecialistTeacherName()`.
- `resolveCriteriaSource()`: dice de quién son los criterios mostrados y si se
  aplicaron por excepción.
- `isDraftCriterion()`: borrador sí/no.

Ninguna vista vuelve a reimplementar esta tabla.

### 2. Orden de resolución en `getCriteria()`

1. Filtros pedagógicos comunes: activo, **familia de instrumento**, programa y
   rango de edad.
2. Se usan las plantillas **globales** (`owner_teacher_id = null`) y las del
   **propio docente**.
3. Si el docente no tiene ninguna para ese instrumento, se usa el set del
   **especialista** de la familia (sin mezclar filas).
4. Si el instrumento no tiene especialista mapeado, se devuelve `[]` y la UI
   muestra "Aún no hay criterios configurados para {instrumento}".

**Prohibido** fusionar el set propio con el del especialista: se elige uno u
otro para no duplicar etiquetas ni inflar el informe.

### 3. Familias de instrumento

- `Guitarra`, `Guitarra clásica`, `Guitarra eléctrica` → **guitarra** (Jeremy).
- `Batería` → **bateria** (Jeremy).
- `Piano` → **piano** (Fernando). `Piano Infantil` → **piano infantil**
  (Nathaly). **No se agrupan**: son currículos distintos.
- `Violín` → **violin** (Fernando). `Canto` → **canto** (Nathaly).
- `Estimulación Musical` queda **sin especialista** porque Claudia no tiene
  UUID sintético en `TEACHER_IDS`; no se inventa un dueño.

### 4. Trazabilidad en el registro de clase (`class-log.tsx`)

- **Píldora de excepción**: "Criterios de Guitarra definidos por el especialista
  Jeremy. Se aplican por excepción: hoy dicta la clase otro docente y no se
  duplica la lista."
- **Chip "Borrador"** por criterio y banner con el conteo: se pueden registrar
  en clase, pero no salen en informes hasta que el especialista los valide
  (regla de Fase 5).
- Se eliminó el mensaje muerto "Los criterios de Guitarra y Batería están
  pendientes de levantamiento con el Prof. Jeremy", que nunca se mostraba
  porque las filas ya existen.

### 5. Política para casos futuros

| Situación | Qué pasa |
|---|---|
| Docente nuevo dicta un instrumento existente | Hereda el set del especialista y se marca la excepción. Cero código nuevo. |
| Alumno nuevo con instrumento existente | Igual: resuelve por familia. |
| Instrumento nuevo (p. ej. Ukelele) | 0 criterios + mensaje. Para habilitarlo se agrega a `INSTRUMENT_SPECIALISTS` y se siembran sus filas. |
| Docente nuevo con especialidad propia | Se agrega al mapa y se siembran sus criterios. |

---

## Verificación

`scratch/test-criteria-exception.mjs` contra PostgreSQL vivo, **sin escrituras**:

- Sylvia: 8 criterios, dueño Jeremy, `isException = true`, 8 borradores.
- ALEXIS (`Guitarra clásica`, Jeremy): 8, dueño Jeremy, sin excepción.
- Luciana (`Piano`, Fernando): 12, dueño Fernando.
- Fernando / Violín: 13. Jeremy / Batería: 9. Nathaly / Canto: 12.
- Ethan (`Piano Infantil`, Nathaly): 12.
- `Guitarra eléctrica` (Jeremy): 8 (misma familia).
- Excepciones cruzadas: Jeremy + Piano → 12 de Fernando; Fernando + Piano
  Infantil → 12 de Nathaly; Nathaly + Batería → 9 de Jeremy.
- `Ukelele`: 0 criterios.
- Piano y Piano Infantil no comparten ningún `field_key`.
- La excepción de Guitarra no mezcla filas de Fernando.
- `resolveTeacherNameById()` resuelve UUID sintéticos.

`npm run build` en verde. Arnés de Fase 7 (14/14) sigue pasando.

---

## Consecuencias

- Un solo instrumento se evalúa siempre con la misma lista, la defina quien la
  defina.
- El especialista mantiene el control: si Jeremy edita sus 8 de Guitarra,
  Sylvia los hereda sin tocar su ficha.
- La UI nunca oculta de quién son los criterios ni si están en borrador.
- No se duplican filas en `evaluation_fields`; el costo de mantenimiento no
  crece con cada excepción.
- Los cambios de ficha (Alexis, Luciana, Sylvia) viven en PostgreSQL, no en
  git; quedan registrados en el log de esta fase.

## Referencias

- `src/lib/informes/instrument-specialists.ts`
- `src/lib/services/evaluations.service.ts` (`getCriteria`)
- `src/components/teacher/class-log.tsx`
- `docs/adr/0175-fase-1-evaluaciones-informes-progreso-notas-sin-ui.md`
- `docs/logs/2026-10-23-criterios-instrumento-excepcion.log`
