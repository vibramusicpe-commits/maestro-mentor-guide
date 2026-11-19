# ADR-0196: Registro "Mathias " no visible y falsos duplicados por nombre incompleto

**Estado:** Aceptado · **Fecha:** 2026-11-18 · **Incidente:** "Mathias Gutierrez Chavez"

## 1. Síntoma

El apoderado registró a "Mathias Gutierrez Chavez", el alumno no aparecía en
el Directorio y, al intentar registrarlo de nuevo, la app respondía
"⚠️ Alumno ya existente en el sistema" aunque se marcaba la casilla de
homónimo real.

## 2. Evidencia (datos vivos, MCP Insforge, solo lectura)

- Existe exactamente **un** registro activo: `539feb70-07c6-4f37-a1e3-beb5532c23ce`,
  `full_name = "Mathias "` (**solo el nombre, con espacio final**),
  instrumento Batería, `family_name = "Familia Gutierrez Chavéz"`,
  email `mathias.@gmail.com`, `fatherName = "Carlos Gutierrez"`,
  creado el 2026-11-18. El recibo `ada37ddc…` dice
  `Plan Mensual (Batería) — Mathias `.
- **No existe** ningún registro con el nombre completo "Mathias Gutierrez
  Chavez" (ni en baja/pausa). No hay datos perdidos: el alta se hizo con el
  nombre incompleto y los apellidos fueron al campo "Familia".
- Ejecución real de `isMatchingStudentName` (`scratch/check-matching.cjs`,
  compilado desde el código fuente):
  - `"Mathias Gutierrez Chavez"` vs `"Mathias "` → **true**
  - `"Mathias Gutierrez"` vs `"Mathias Chavez"` → **false** (los Mathias con
    apellidos distintos ya se distinguen correctamente; ADR-0141)

## 3. Causas

1. **El nombre quedó truncado en el alta**: se guardó `"Mathias "` y los
   apellidos quedaron en `family`/"Familia Gutierrez Chavéz". Por eso no hay
   un registro con el nombre completo buscado.
2. **El buscador del Directorio no normalizaba tildes ni repartía tokens**:
   hacía `String.includes()` literal sobre cada campo. Buscar
   "Mathias Gutierrez Chavez" no coincide con `"Mathias "` ni con
   `"Familia Gutierrez Chavéz"` (é ≠ e) ⇒ parece que no existe.
3. **El falso duplicado** nace de la regla legítima de `isMatchingStudentName`
   para nombres de una sola palabra ("Dulce", "Sasha"): al comparar un nombre
   completo contra `"Mathias "`, el token único coincide y devuelve `true`.
   La casilla de homónimo **sí** habilita el guard, pero se limpiaba en cada
   pulsación del input de nombre (`setAllowDuplicateConfirmed(false)` en
   `onChange`), así que escribir/pegar después de marcarla la desmarcaba
   silenciosamente.

## 4. Fix (surgicial, sin DDL, sin tocar motores)

- `students-table.tsx`: búsqueda con `normalizeStudentName` y **todos los
  tokens** de la consulta presentes en la concatenación de
  nombre/familia/instrumento/email. Así "Mathias Gutierrez Chavez" encuentra
  el registro guardado como "Mathias" + "Familia Gutierrez Chavéz". La
  búsqueda por código (ADR-0189) queda como ruta independiente.
- `students-table.tsx`: la confirmación de homónimo deja de limpiarse en cada
  tecla; se reinicia solo cuando cambia el `duplicateMatch?.id` o al abrir el
  formulario (`resetForm`). Si el usuario cambia a otro alumno detectado, se
  vuelve a pedir confirmación.
- **No se tocó** `isMatchingStudentName` ni `normalizeStudentName` (ADR-0107/
  0119): son la deduplicación global y cambiarlos afectaría a agenda, Kardex,
  facturación y portal familia. Los Mathias con apellidos distintos ya se
  diferencian entre sí.

## 5. Datos / operación pendiente (decisión de Secretaría)

El registro sigue llamándose `"Mathias "` en PostgreSQL. Para dejarlo como
"Mathias Gutierrez Chavez" hay que **editar la ficha desde la UI** (botón de
edición del Directorio). No se hizo mutación directa en la base: el nombre es
un dato productivo y la gobernanza de cambios de ficha es por interfaz.

## 6. Verificación

- `scratch/check-mathias-search.cjs` con la función real compilada:
  "Mathias Gutierrez Chavez" → `true`; "VM-2307EF" → `false` en tokens
  (lo resuelve `matchesStudentCode`).
- `tsc --noEmit`: **150 errores**, sin errores nuevos.
- `npm run build`: verde (`BUILD_EXIT=0`).
