# ADR 0164: Inmunización de Autofill en Búsqueda, Corrección de Duplicidad Jueves Bruno Marcelo y Soporte de Adelantos Previos a planStartDate

## Estado
Aprobado e Implementado (v2.0.34) — 08 de Octubre, 2026

## Contexto
1. **Autofill Persistente en Búsqueda de Secretaría (`/admin/alumnos`)**:
   - En navegadores Chromium del equipo de secretaría ("Jackeline"), el campo de búsqueda de alumnos autocompletaba y precargaba involuntariamente el valor residual `"camila"` proveniente del historial de autocompletado y gestión de contraseñas.
   - Esto provocaba que cada vez que secretaría abría el directorio de alumnos, la vista apareciera filtrada automáticamente por Camila Valentina.
2. **Duplicidad de Clases los Jueves para Bruno Marcelo (`e40983ad-5a34-4ef8-9ac7-d2169f071e52`)**:
   - Bruno Marcelo tenía agendadas dos lecciones los Jueves: `sch-83` (17:30) y `sch-89` (18:15).
   - En consecuencia, el 01 y 08 de Octubre se le generaban 2 clases en el mismo día, consumiendo prematuramente su cuota mensual en 3 semanas y creando confusión en sala.
3. **Pérdida de Sesión al Adelantar Clase antes de `planStartDate` (Caso Santiago Valladolid / `165e513a-d8ea-4ba5-a5a7-ba12d365e2aa`)**:
   - Santiago inició formalmente su ciclo el 06/10/2026 pero asistió un día antes (05/10/2026). Secretaría intentó reprogramar para el 05/10, pero los motores `computeStudentCycleSessions` y `computeStudentCycle` iniciaban su escaneo temporal rígidamente en `startDate = effectivePlanStartDate`.
   - Las fechas anteriores eran ignoradas en el barrido, mientras que la lección recurrente original quedaba excluida con `excludedDates: ["2026-10-06"]`, resultando en solo 7 clases proyectadas en lugar de 8.

## Decisiones Técnicas
1. **Inmunización Absoluta del Input de Búsqueda contra Autofill (`src/components/admin/students-table.tsx`)**:
   - Atributos estrictos: `id="students-filter-search-input"`, `name="students_filter_search_no_autofill"`, `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="off"`, `spellCheck={false}`, `data-1p-ignore`, `data-lpignore="true"`.
   - Botón interactivo de limpieza rápida (`<X />`) cuando el campo contiene texto.
   - `useEffect` de montaje que fuerza `search = ""` para garantizar que el componente inicie limpio en cada renderizado.
2. **Deduplicación Reactiva en Hidratación (`src/store/app-store.ts`)**:
   - En `hydrateFromBackend`, se implementó una pasada de deduplicación que descarta homónimos o ciclos culminados anteriores en favor del ciclo activo.
   - Se pausó el ciclo culminado previo de **kamila Valentina G.** (`064f2b68-31da-4302-81d4-a447fcf1a1cc`), conservando activo únicamente **CAMILA VALENTINA** (`5c44e64a-b55d-4cf3-a668-1346b4a3cd8c`).
3. **Corrección de Horario de Bruno Marcelo en PostgreSQL Insforge**:
   - Se eliminó quirúrgicamente `sch-83` (Jue 17:30) de `emergency_contact.scheduleLessons`.
   - Bruno quedó con su horario pareado oficial: Martes 18:15 (`sch-36`) y Jueves 18:15 (`sch-89`) en Sala B con Prof. Fernando, totalizando exactamente 8 clases al mes.
4. **Soporte Dinámico para Clases Previas a `planStartDate` (`scanStartDate`)**:
   - En `src/lib/kardex-calculator.ts` y `src/lib/student-cycle.ts`, si existen lecciones puntuales con `dateStr < startDate`, `scanStartDate` retrocede hasta 30 días antes de `startDate` para incluirlas en el cómputo.
   - Las lecciones recurrentes abiertas se blindan con `if (curDateStr < startStr) return;`, evitando que proyecten clases genéricas antes de la fecha formal de inicio.
   - Saneada la ficha de Santiago Valladolid en PostgreSQL: `planStartDate = "2026-10-05"`, asistencia del 05/10 registrada como `presente` y lecciones recurrentes limpias sin falsas exclusiones.

## Verificación
- Input de búsqueda verificado: 0 precargas residuales de texto.
- Bruno Marcelo: 8/8 clases proyectadas en 4 semanas completas.
- Santiago Valladolid: 8/8 clases contractuales reflejadas en Kardex e Historial de Asistencia.
