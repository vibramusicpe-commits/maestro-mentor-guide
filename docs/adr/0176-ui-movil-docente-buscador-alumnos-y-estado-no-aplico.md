# ADR-0176: UI/UX móvil del portal docente — buscador de alumnos y estado "No aplicó"

## Estado

Aceptado e implementado. Cambio **aditivo y de interfaz**: no altera el modelo de datos, ni motores de cálculo, ni facturación.

## Fecha

2026-10-22.

## Contexto

El piloto de las Fases 2, 3 y 4 (registro de clase, nota a familia y nota interna) se probó **en celular**, que es el dispositivo real de los profesores en sala. Aparecieron dos problemas concretos de uso:

1. **El selector de alumno era un `<select>` nativo.** Con la base activa actual, el docente tenía que abrir una lista larga y deslizar mucho para encontrar a un alumno; en el Portal Docente (`/teacher/alumnos`) la búsqueda quedaba **debajo** de la cabecera grande y de la leyenda de categorías, así que el profesor debía hacer *scroll* incluso antes de poder escribir.
2. **La opción "No corresponde" no se entendía.** El estado general de la clase y los criterios usaban la etiqueta cruda `No corresponde`, que se lee como "no es mi responsabilidad" en lugar de "este aspecto no se trabajó hoy". Peor: el informe de progreso (`TRAFFIC_LABELS` en `progress-report-format.ts`) **no tenía traducción** para `no_corresponde`, así que un informe publicado podía imprimir literalmente `no_corresponde`.

El pedido de Dirección fue explícito: mejorar la experiencia en celular para los profesores y hacer comprensible la opción del reporte BETA, sin abrir fases nuevas ni tocar el kiosco, la agenda, el Kardex ni la asistencia.

## Decisión

### 1. Un único buscador táctil de alumno, reutilizable

Se crea `src/components/teacher/student-picker.tsx` (`StudentPicker`) y se usa en **los tres formularios del piloto**:

- `class-log.tsx` (Registro de clase BETA).
- `family-note-form.tsx` (Nota a familia, Fase 3).
- `internal-note-form.tsx` (Nota interna, Fase 4).

Comportamiento:

- Campo de búsqueda con lupa, `type="search"` y `enterKeyHint="search"` (teclado del celular muestra "Buscar").
- Filtro que **ignora tildes y mayúsculas** y admite varias palabras en cualquier orden (`"valen vio"` encuentra "Valentina Violín"). Busca en nombre, instrumento, docente y categoría.
- Resultados en filas de **mínimo 44 px** (objetivo táctil), con nombre + instrumento · categoría · docente, dentro de una lista con scroll propio (`max-h-64`) para no empujar el formulario.
- Con un alumno elegido, el control **se colapsa a una sola fila** con el nombre y el botón **Cambiar**: en el kiosco ya no hay que volver a deslizar la lista.
- `Enter` selecciona si hay un único resultado; `Escape` cierra; clic/touch fuera cierra.
- `allowEmpty` + `emptyLabel` conservan los casos que sí admiten "sin alumno" (nota general de la nota interna, nota sin alumno específico en la nota a familia).
- Contador visible (`N alumnos`) y mensaje de "Sin resultados" con sugerencia (apellido o instrumento).

### 2. Estado "No aplicó" (valor de base intacto)

El valor persistido sigue siendo **`no_corresponde`** en `lesson_evaluations.overall_status`, en el repertorio y en `evaluation_fields.options`. Lo que cambia es **lo que ve el docente**:

- Etiqueta visible: **"⚪ No aplicó"** en `STATUS_OPTIONS`, `STATUS_LABELS` y `DEFAULT_TRAFFIC_OPTIONS`.
- `OPTION_LABEL_OVERRIDES` traduce las etiquetas crudas que llegan de `evaluation_fields.options`, de modo que los criterios también muestran "No aplicó" sin migrar datos.
- Nueva ayuda contextual `STATUS_HELP` bajo el estado general: cada botón explica qué significa al seleccionarse, y `⚪ No aplicó` aclara **"no cuenta como bajo desempeño"**.
- Leyenda de una línea antes de los criterios: `Logrado · En proceso · No logrado · No aplicó (hoy no se trabajó ese aspecto; no es una nota baja)`.
- **Se retira** `no_corresponde` del desplegable de repertorio: una pieza que se lista en la clase sí se trabajó, así que el estado no aplicaba ahí.

### 3. Informes: `no_corresponde` nunca se imprime en crudo

`TRAFFIC_LABELS` en `src/lib/informes/progress-report-format.ts` incorpora:

```ts
no_corresponde: "No aplicó",
no_aplica: "No aplicó",
```

Como ese archivo es la **fuente única** de vista, Markdown, WhatsApp y CSS de impresión (ADR-0119.3), la corrección aplica a las cuatro salidas a la vez.

### 4. Directorio docente (`/teacher/alumnos`) pensado para celular

- **La búsqueda va primero**, justo debajo de una cabecera compacta: el profesor puede escribir sin deslizar.
- Botón **X** para limpiar, `autoComplete/autoCorrect/autoCapitalize off` y `spellCheck={false}` (evita el autofill que ya había mordido en `/admin/alumnos`, ADR-0164).
- Filtro de docente compacto en la **misma fila** que la búsqueda (en celular ocupa 6.75 rem).
- **Leyenda de categorías colapsada** en un `<details>` ("toca para ver"): deja de robar la primera pantalla.
- Tarjetas convertidas en **filas densas de 3 líneas**: nombre + chip corto de categoría + edad; instrumento · docente · día/hora · sala; apoderado/teléfono (o teléfono del propio alumno si es +18). El botón `📖 Kardex` y el % de asistencia van a la derecha.
- Animación de entrada acotada (`delay` máximo 0.2 s) para que una lista larga no "tarde" en aparecer.
- Contador `N/total` en la cabecera y estado vacío con acción **Ver todos los alumnos**.

## Consecuencias

- El docente encuentra a un alumno escribiendo 2–3 letras, sin listas largas y sin desplazamientos previos.
- "No aplicó" se entiende en la pantalla y **no se imprime en crudo** en informes ni en WhatsApp a familias.
- Los formularios comparten un solo componente: cualquier mejora futura del selector se aplica a los tres (Fases 2, 3 y 4) de una vez.
- Sin cambios de esquema, sin migraciones, sin tocar `app-store.ts`, `kardex-calculator.ts` ni `student-cycle.ts`.
- Riesgo asumido: el picker se renderiza en un panel absoluto dentro del formulario; si un contenedor padre aplicara `overflow-hidden`, podría recortarse. Los tres formularios actuales no lo hacen.

## Reglas que quedan fijas

1. **Prohibido volver a usar `<select>` con la base activa de alumnos** en formularios docentes: usar `StudentPicker`.
2. **Prohibido mostrar el valor crudo `no_corresponde`** en pantalla, informe, Markdown o WhatsApp. La traducción vive en un solo lugar: `TRAFFIC_LABELS`.
3. **Prohibido renombrar el valor persistido** `no_corresponde` por motivos estéticos: cambiarlo exige migración de esquema y queda fuera de un cambio de UI.
4. La búsqueda del Directorio Docente debe seguir siendo **lo primero visible** en celular (cabecera compacta, leyenda colapsada).
5. Los formularios del piloto siguen naciendo en estado pendiente: este ADR **no** cambia el flujo de moderación de la Fase 3.

## Verificación

- `npm run build` en verde (sin errores de tipos) tras todos los cambios.
- Rutas servidas en 200: `/`, `/teacher`, `/teacher/alumnos`, `/admin/alumnos`, `/family/progreso`.
- Marcado presente en `/teacher/alumnos`: "Directorio de alumnos", buscador "Buscar alumno, apoderado o instrumento…" y leyenda colapsable.
- `grep "No corresponde"` en `src/` → **0 resultados** (solo persiste el valor `no_corresponde` en tipos y en la base de datos).

## Reversión

El cambio es de interfaz y no toca datos:

1. `git revert` del commit (o restaurar los cinco archivos de UI).
2. El valor `no_corresponde` sigue en la base de datos y en los tipos, por lo que ningún registro guardado se pierde ni requiere limpieza.
3. `StudentPicker` puede convivir con los `<select>` antiguos, así que se puede revertir formulario por formulario si hiciera falta.

## Referencias

- ADR-0175 (sistema de evaluaciones, informes y notas) — sección 2 (Fase 2), 3 (Fase 3) y 4 (Fase 4).
- ADR-0119.3 (fuente única de lógica y de formato).
- ADR-0136/0137 (impresión A4 y no-wrapping), aplicables a los informes donde ahora dice "No aplicó".
- `docs/logs/2026-10-22-ui-movil-docente.log`.
