# ADR-0178: Fase 7 — Kill Switch, Portal Familia Cerrado por Defecto y Tablero de Despliegue

**Fecha:** 2026-10-23
**Estado:** Aceptado e implementado
**Autores:** Equipo Vibra (Open Code)

---

## Contexto

Las Fases 1 a 6 de evaluaciones, notas e informes están implementadas y en producción:

- **Fase 2 (registro de clase):** Nathaly y Fernando ya validaron sus criterios (Canto 12, Piano Infantil 12, Piano 12, Violín 13).
- **Fase 3 (nota a familia):** en piloto, con moderación obligatoria de Dirección.
- **Fase 4 (nota interna):** en piloto.
- **Fase 5 (informe de progreso):** bandeja de Dirección y portal familia implementados.
- **Fase 6 (reportes y CSV):** bandeja general, filtros, columna «Último informe» y exportación CSV.

Al auditar el estado real de PostgreSQL el 2026-10-23:

| Elemento | Estado real |
|---|---|
| `feature_flags` | los 4 flags en `false` |
| `pilot_teacher_ids` | Jeremy, Fernando y Nathaly |
| `evaluation_fields` | 49 validados + **17 en borrador** (Guitarra 8, Batería 9) |
| `progress_reports` | 0 filas (aún ningún informe publicado) |
| `parentReports` | `false` |

Se detectaron tres huecos de despliegue:

1. **El portal familia nunca estuvo cerrado.** La pestaña «Progreso» se renderizaba siempre, aun con `parentReports = false`, y la ruta `/family/progreso` era accesible por URL directa. El flag existía pero no gobernaba nada visible.
2. **No existía un kill switch de build.** Si un despliegue salía mal, la única forma de apagar el módulo era cambiar filas en PostgreSQL.
3. **No había un lugar único donde Dirección viera qué falta** para abrir el portal familia (flags, pilotos, criterios en borrador, primer informe publicado).

Además, el plan original de Fase 7 preveía **retirar el flujo legacy de notas a familia** (`lesson-notes.tsx` + `teacher-notes-moderation.tsx`). Dirección decidió el 2026-10-23 **conservarlo**: el flujo actual de notas a familias funciona y no se elimina.

---

## Decisión

### 1. Kill switch de build (`src/lib/features.ts`)

Un único módulo resuelve el interruptor de Informes:

- `VITE_FEATURE_INFORMES=false` → apaga TODO el módulo en ese build (bandeja de Dirección, pestaña de Informes y portal familia), aunque PostgreSQL tenga los flags encendidos.
- `true` o ausente → **no fuerza nada**: la decisión sigue viviendo en `org_settings`.
- No existe «forzar encendido» por variable de entorno: abrir el portal familia exige `parentReports = true` en PostgreSQL.

### 2. Resolución pura y testeable del acceso

`getProgressReportsAccess()` se dividió en dos:

- `resolveProgressReportsAccess(envEnabled, flags, pilotList)` — **función pura**, sin red, con la matriz completa de decisión.
- `getProgressReportsAccess()` — lee PostgreSQL y delega en la función pura.

Esto permite verificar el kill switch y los cuatro escenarios de acceso sin tocar la base de datos.

### 3. Portal familia cerrado por defecto

- `useInformesAccess()` resuelve `panel` y `family` una sola vez por montaje (con el caché de 30 s del servicio).
- `family.tsx` **no monta** la pestaña «Progreso» si `family = false`.
- `/family/progreso` muestra un estado «Aún no disponible» con enlace al inicio y **no consulta** informes publicados.
- `family = true` solo cuando `parentReports = true`.

### 4. Tablero de despliegue (solo lectura)

`InformesRolloutCard` se muestra al inicio de la pestaña «Informes» (`/admin/alumnos`) y expone, sin escribir nada:

- Bandeja de Dirección: activa por flag o por piloto.
- Portal familia: habilitado o apagado.
- Docentes en piloto (nombre y cantidad).
- Criterios en borrador, agrupados por instrumento.
- Checklist dinámico: criterios de Nathaly/Fernando, criterios de Jeremy, primer informe publicado y portal familia habilitado.

### 5. El flujo legacy de notas a familia **no se retira**

- `lesson-notes.tsx` y `teacher-notes-moderation.tsx` permanecen intactos y siguen accesibles en la pestaña «Notas a Familias».
- `students.notes` sigue siendo legacy de **solo lectura** y `notification_logs` no se toca.
- La Fase 7 no borra ni migra ninguna nota. El rechazo de una nota v2 conserva su contenido.

### 6. Fuera de alcance

- El «Comunicado General» (`publicNote` global en Zustand/localStorage) no se modifica en esta fase. Queda como decisión pendiente: retirarlo del piloto o migrarlo a `family_notes` con `scope: 'academy'` y moderación.

---

## Procedimiento de apertura a familias

1. Jeremy valida sus 17 criterios (Guitarra y Batería) → `draft = false`, `visible_in_report = true`.
2. Dirección genera y publica el primer informe de un alumno del piloto.
3. Se descarga el PDF A4 y se confirma que son 2 páginas sin cortes.
4. Se activa `parentReports = true` en `org_settings.feature_flags`.
5. La familia del alumno entra a `/family` y confirma que ve «Progreso» y el PDF.
6. Recién entonces se evalúa abrir a todas las familias.

Abrir o cerrar **no requiere desplegar** (efecto en ≤ 30 s por el caché de flags). El kill switch sí requiere un build con `VITE_FEATURE_INFORMES=false`.

---

## Verificación

`scratch/test-fase7-rollout.mjs` — **14/14** comprobaciones en runtime, sin escribir en la base:

- Sin variable de entorno, informes habilitado.
- Bandeja de Dirección abierta por piloto (`source = pilot`).
- Portal familia apagado con `parentReports = false`.
- 17 criterios en borrador (Guitarra 8, Batería 9).
- Listado de publicados sin filas `is_test` y sin campos financieros.
- Kill switch cierra bandeja y portal familia.
- Con flag global, bandeja y familia abiertas (`source = flag`).
- Piloto abre bandeja y mantiene la familia cerrada.
- Sin flags ni pilotos, todo cerrado.

`npm run build` en verde. Rutas `/`, `/admin/alumnos`, `/family` y `/family/progreso` en 200.

---

## Consecuencias

- Un despliegue puede apagar el módulo sin tocar datos.
- Las familias no ven una pestaña vacía ni pueden entrar por URL directa antes de tiempo.
- Dirección tiene un tablero único para decidir cuándo abrir.
- El flujo legacy de notas a familia sigue disponible; no hay migración ni borrado.
- El estado de los criterios de Jeremy sigue bloqueando la publicación de informes que los incluyan (regla de Fase 5).

## Referencias

- `docs/adr/0175-fase-1-evaluaciones-informes-progreso-notas-sin-ui.md`
- `docs/PROMPT_OPUS_IMPLEMENTACION_INFORMES.md`
- `src/lib/features.ts`
- `src/hooks/use-informes-access.ts`
- `src/components/admin/informes-rollout-card.tsx`
