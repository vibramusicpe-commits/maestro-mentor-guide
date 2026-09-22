# Bitacora de Incidencias: ReferenceError normalizeStudentName — Horario vacio en Chrome (0 clases)
Fecha: 22 de Septiembre, 2026
Hora: ~16:00-16:47 PET
Responsable: Antigravity AI & Equipo Vibra Music
Incidente relacionado: ADR-0119 (post-mortem sesion 2026-09-21) / ADR-0111 (fix formal)

---

## Resumen Ejecutivo

Se identifico y resolvio la causa raiz definitiva del incidente de paridad
Admin/Profesor iniciado el 21-Sep-2026. La Agenda mostraba 0 clases en cualquier PC
sin cache de localStorage, mientras que Edge (con snapshot antiguo) mostraba 15 clases
correctamente. El error era un import faltante de `normalizeStudentName` en
`src/store/app-store.ts` que causaba un ReferenceError en cada ejecucion de
`hydrateFromBackend`, tragado silenciosamente por el catch de `useInsforgeSync`.

---

## Cronologia

| Hora PET | Evento |
|---|---|
| ~2026-09-21 (sesion anterior) | Se detecta disparidad Admin vs Profesor; sesion de depuracion estatica de ~30% tokens sin confirmar causa raiz. Se queda pendiente hipotesis de localStorage/condicion de carrera. |
| 2026-09-22 ~16:00 | Usuario entrega evidencia de consola real de Chrome: `ReferenceError: normalizeStudentName is not defined` en cada ciclo de sync. |
| 2026-09-22 ~16:38 | Antigravity confirma: import faltante en linea 39 de app-store.ts. La funcion existe en student-matching.ts linea 6, nunca fue importada. |
| 2026-09-22 ~16:42 | Commit `1a578ee`: fix de 1 linea + documentacion ADR-0119 punto 5 y 6. Push a main. |
| 2026-09-22 ~16:47 | Cloudflare Pages inicia despliegue automatico desde main. |

---

## Causa Raiz Confirmada

**Archivo:** `src/store/app-store.ts`, linea 39

`hydrateFromBackend` llamaba a `normalizeStudentName(student.full_name)` para deduplicar
homonimos activos (introducido con ADR-0107 / ADR-0112), pero la funcion nunca fue
añadida al import del modulo `@/lib/student-matching`.

**Flujo de falla en tiempo de ejecucion:**

```
useInsforgeSync.ts
  └─> fetchStudentsFromDB()        [OK — datos llegan de Insforge]
  └─> hydrateFromBackend(dbData)   [FALLO en dedup de homonimos]
        └─> normalizeStudentName() [ReferenceError: not defined]
              └─> capturado por catch()
                    └─> log: "[Insforge Sync] Operando en fallback Zustand local: ReferenceError..."
                    └─> schedule queda con datos de localStorage (vacio si no hay cache)
```

**Por que Edge funcionaba y Chrome no:**

- Edge tenia un snapshot de localStorage de fecha anterior (post-ADR-0100) con 15 clases
  ya hidratadas. Al fallar hydrateFromBackend, el fallback usaba ese snapshot, mostrando
  15 clases — aparentemente correcto.
- Chrome (almacenamiento limpio) no tenia snapshot. El fallback devolvio un store vacio:
  0 clases, 0 alumnos activos en agenda.

**Por que el kiosco docente seguia funcionando:**

La asistencia docente se lee desde `attendance_logs` mediante `attendance.service.ts`,
que es un servicio independiente que no pasa por `hydrateFromBackend`. Por eso marcas
de asistencia seguian apareciendo aunque el horario estuviera vacio.

---

## Descartado Durante la Sesion Anterior (2026-09-21)

Con el script `scratch/test-runtime-pure.mjs` ejecutado sobre 88 alumnos (9 activos) en
datos reales de Insforge se verifico que:

- Los datos de Mia Lucero Bellido y Karlitoz Pazos (recuperaciones dateStr: 2026-09-21)
  renderizaban correctamente en Semana 4 cuando hydrateFromBackend no lanzaba error.
- NO era bug en: filtro por day/dateStr, teacherClean, isLessonInStudentCycle,
  colision de IDs, ni logica de weekIndex.
- La causa era anterior a todos esos filtros: el store nunca llegaba a tener datos
  porque hydrateFromBackend fallaba antes de escribir al state de Zustand.

---

## Fix Aplicado

**Commit:** `1a578ee` — `fix(store): add missing normalizeStudentName import`

```diff
// src/store/app-store.ts, linea 39
- import { isMatchingStudentName, resolveStudentUUID, isSameStudentId } from "@/lib/student-matching";
+ import { isMatchingStudentName, resolveStudentUUID, isSameStudentId, normalizeStudentName } from "@/lib/student-matching";
```

Sin cambios a logica de negocio, filtros, Kardex, facturacion ni persistencia.

---

## Verificacion de Cierre

Tras despliegue en Cloudflare Pages, abrir Chrome (sin cache) en URL de produccion
y verificar consola DevTools:

**Esperado:**
```
[Insforge Sync] Sincronizacion en tiempo real exitosa
CLASES PROGRAMADAS: 15
```

**No debe aparecer:**
```
ReferenceError: normalizeStudentName is not defined
[Insforge Sync] Operando en fallback Zustand local
```

---

## Documentacion Generada

- `docs/adr/0111-missing-import-normalizestudentname-hydratefrombackend-referenceerror.md`
- `AGENTS.md` ADR-0119 punto 5 (correccion) y punto 6 (causa raiz confirmada)
- `docs/logs/2026-09-22-normalizestudentname-referenceerror-incident.md` (este archivo)

---

## Señales de Alerta para Futuros Incidentes Similares

1. Un dispositivo muestra datos correctos y otro muestra 0 o vacio con los mismos datos
   en PostgreSQL = sospechar primero de error en hydrateFromBackend o en el path de
   hidratacion, NO en los filtros de agenda o Kardex.
2. El log `[Insforge Sync] Operando en fallback Zustand local:` seguido de un error
   significa que hydrateFromBackend fallo completamente — revisar la excepcion exacta
   antes de analizar logica de renderizado.
3. Asistencia docente activa + horario vacio = el fallo esta en la hidratacion del
   schedule, no en attendance_logs (son rutas independientes).
