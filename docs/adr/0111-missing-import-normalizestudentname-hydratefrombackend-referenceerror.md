# ADR-0111: Import Faltante de `normalizeStudentName` — ReferenceError Fatal en `hydrateFromBackend`

## Estado
Aceptado e Implementado en Produccion — commit `1a578ee` (2026-09-22)

## Contexto

El 22 de septiembre de 2026 se confirmo que `hydrateFromBackend` dentro de
`src/store/app-store.ts` usaba `normalizeStudentName` para deduplicar homonimos activos
(ADR-0107, ADR-0112), pero dicha funcion **nunca fue importada** en la linea 39.

El import original solo incluia:

```ts
import { isMatchingStudentName, resolveStudentUUID, isSameStudentId } from "@/lib/student-matching";
```

`normalizeStudentName` ya existia y estaba exportada correctamente desde
`src/lib/student-matching.ts` (linea 6), pero la importacion faltante producia un
`ReferenceError` en tiempo de ejecucion cada vez que `hydrateFromBackend` intentaba
deduplicar alumnos activos con homonimos.

### Sintoma Observado

| Dispositivo | Navegador | Cache localStorage | Clases mostradas |
|---|---|---|---|
| PC Secretaria | Edge | Snapshot antiguo (post-ADR-0100) | **15 clases** OK |
| PC Otra | Chrome | Almacenamiento limpio | **0 clases** FALLO |

Error exacto en consola de la PC afectada:

```
[Insforge Sync] Operando en fallback Zustand local:
ReferenceError: normalizeStudentName is not defined
```

Dicho mensaje provenia del `catch` de `use-insforge-sync.ts`, que tragaba el
`ReferenceError` y continuaba en modo "fallback local". En Edge pasaba desapercibido
porque el snapshot previo en `localStorage` ya contenia los horarios correctos.

### Por que el bug estuvo oculto

1. La Agenda Admin mostraba correctamente en el dispositivo con cache — no habia señal
   externa de falla.
2. La funcion de asistencia docente (`attendance.service.ts`) lee `attendance_logs`
   directamente, sin pasar por `hydrateFromBackend` — el kiosco seguia activo aunque
   el horario apareciera vacio.
3. Ningun analisis estatico detecta un `ReferenceError` de runtime por import faltante;
   requiere evidencia de consola en el dispositivo real afectado (ver ADR-0120).

## Decision Tecnica

### Fix quirurgico — 1 linea, archivo `src/store/app-store.ts` linea 39

Antes:
```ts
import { isMatchingStudentName, resolveStudentUUID, isSameStudentId } from "@/lib/student-matching";
```

Despues:
```ts
import { isMatchingStudentName, resolveStudentUUID, isSameStudentId, normalizeStudentName } from "@/lib/student-matching";
```

Sin cambios en logica de filtrado, Kardex, agenda, facturacion, asistencia ni partialize.

### Archivos modificados en commit 1a578ee

| Archivo | Cambio |
|---|---|
| `src/store/app-store.ts` | +1 simbolo en import linea 39 |
| `AGENTS.md` | ADR-0119 punto 5 corregido + punto 6 nuevo (causa raiz y criterio de cierre) |

## Superficie de Impacto

| Area | Afectada? | Notas |
|---|---|---|
| `hydrateFromBackend` | CORREGIDA | Deduplicacion de homonimos activos ejecuta sin error |
| Agenda Admin (AgendaBoard) | BENEFICIADA | PCs sin cache ya muestran los alumnos activos |
| Agenda Profesor (MinimalAgendaCalendar) | BENEFICIADA | Misma causa raiz del incidente 2026-09-21 |
| Kiosco Docente | SIN CAMBIO | Leia attendance_logs por ruta independiente |
| Kardex de Asistencias | SIN CAMBIO | No toca hydrateFromBackend directamente |
| Facturacion / Recibos | SIN CAMBIO | El error afectaba solo a schedule/adminStudents |
| localStorage / partialize | SIN CAMBIO | schedule, adminStudents e invoices siguen persistiendo (ver nota) |

> **NOTA CRITICA (correccion ADR-0119.5):** La afirmacion anterior de que `schedule`,
> `adminStudents` e `invoices` se desacoplaron de `localStorage` mediante `partialize`
> era INCORRECTA. `src/store/app-store.ts:2866-2880` los persiste. La solucion al
> problema de "cache stale" es unicamente la prioridad de PostgreSQL en
> `hydrateFromBackend` (ADR-0118.4), no la eliminacion del persist.

## Criterio de Cierre

En el dispositivo afectado (Chrome, almacenamiento limpio), tras desplegar:

```
[Insforge Sync] Sincronizacion en tiempo real exitosa
CLASES PROGRAMADAS: 15
```

Sin ningun `ReferenceError: normalizeStudentName is not defined`.

## Lecciones Aprendidas

1. Un import faltante en un path protegido por `catch` es invisible al analisis estatico.
   Solo se detecta con evidencia de consola en produccion en el dispositivo afectado.
2. El patron "fallback silencioso" en `useInsforgeSync` oculta errores de runtime
   criticos. Considerar toast de error visible al usuario cuando `hydrateFromBackend`
   falle, no solo un log de consola.
3. La disparidad entre dispositivos con y sin `localStorage` es la señal de alerta mas
   temprana de un error en el path de hidratacion (ver ADR-0119, ADR-0120).

## Consecuencias y Beneficios

- Todos los dispositivos sin cache previa sincronizan correctamente con PostgreSQL.
- Se elimina la dependencia silenciosa de localStorage para que el sistema "funcione".
- La deduplicacion de homonimos activos opera como fue diseñada en ADR-0107 y ADR-0112.
- 100% retrocompatible: ningun cambio a logica de negocio.
