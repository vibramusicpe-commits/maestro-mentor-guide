# ADR-0112: Aislamiento de Asistencia entre Clase Regular y Clase Reprogramada (isMakeup)

## Estado
Aceptado e Implementado en Produccion — commit `3aaee2c` (2026-09-22)

## Contexto

Al marcar asistencia en la sesion regular de Karlitoz (Lun 21/09, 16:45-17:30),
la clase reprogramada del mismo dia (17:30-18:15, isMakeup) reflejaba automaticamente
el mismo estado. Adicionalmente, el boton X (eliminar/revertir makeup) no funcionaba.

### Tres bugs confirmados

**Bug 1 — Contaminacion cruzada de attendanceByDate:**
`setStudentSessionAttendance` escribia en AMBOS: `attendanceByWeek[weekIndex]` Y
`attendanceByDate[curDateStr]` para cualquier leccion. Al marcar la sesion regular
del Lun 21/09, se escribia `attendanceByDate["2026-09-21"]` en la leccion recurrente.
La leccion makeup (dateStr="2026-09-21") tambien iteraba ese mismo `curDateStr` y, al
sincronizar con PostgreSQL, podia heredar ese mark.

El Kardex leia el status de ambas sesiones desde `lesson.attendanceByDate[curDateStr]`
sin distinguir si la leccion tenia `dateStr` propio (makeup) o era recurrente.

**Bug 2 — deleteLessonFromSchedule no persistia en DB:**
Solo filtraba `s.schedule` en memoria. No actualizaba `adminStudents.scheduleLessons`
ni llamaba a `backgroundSyncStudentToDB`. Al recargar desde PostgreSQL, la makeup
reaparecia desde `emergency_contact.scheduleLessons`.

**Bug 3 — Boton X usaba setState directo desde componente:**
La logica inline en el componente llamaba `useAppStore.setState({ schedule: ... })`
directamente, un antipatron que no sincronizaba `adminStudents` ni la DB, y que
ademas no restauraba `excludedDates` de la leccion original en PostgreSQL.

---

## Decisiones Tecnicas

### 1. Separacion estricta de canales de escritura (Bug 1)

**`src/store/app-store.ts` — `setStudentSessionAttendance`:**

- Lecciones recurrentes (`!lesson.dateStr`): escriben SOLO en `attendanceByWeek[weekIndex]`.
- Lecciones puntuales/makeup (`lesson.dateStr`): escriben SOLO en `attendanceByDate[lesson.dateStr]`.
- Fallback de limpieza: al restablecer una leccion recurrente, tambien borra
  `attendanceByDate[dateStr]` si existia un mark legacy previo al fix.

**`student-attendance-kardex.tsx` — generador `allCycleSessions`:**

- Makeup (`lesson.dateStr`): status = `lesson.attendanceByDate[lesson.dateStr]`.
- Recurrente (sin `lesson.dateStr`): status = `lesson.attendanceByWeek[semanaEnMes]`,
  con fallback a `attendanceByDate[curDateStr]` para compatibilidad con datos previos.

### 2. deleteLessonFromSchedule sincroniza adminStudents y DB (Bug 2)

Ahora incluye:
1. Buscar la leccion eliminada para identificar el alumno.
2. Filtrar `adminStudents[x].scheduleLessons` por ID.
3. Llamar `backgroundSyncStudentToDB` con las `scheduleLessons` actualizadas.

### 3. Nueva accion atomica `revertMakeupLesson` (Bug 3)

```ts
revertMakeupLesson(makeupId: string, recoveringLessonDate?: string): void
```

En un solo `set()`:
1. Elimina la makeup de `s.schedule`.
2. En la misma pasada `.map()`, si encuentra la leccion recurrente del mismo alumno
   que tiene `recoveringLessonDate` en sus `excludedDates`, la elimina de la lista.
3. Recalcula `adminStudents[x].scheduleLessons` con todas las lecciones activas del alumno.
4. Llama a `backgroundSyncStudentToDB` con el resultado final.

El boton X del Kardex ahora llama a `revertMakeupLesson(item.lessonId, item.recoveringLessonDate)`.

---

## Flujo Correcto Post-Fix

```
Sesion regular (Lun 16:45) -> Marcar Falta
  -> Boton Reprogramar -> nueva makeup (Lun 17:30, isMakeup=true, recoveringLessonDate="2026-09-16")
    -> Si alumno no asiste a makeup -> Boton X
      -> revertMakeupLesson(): elimina makeup + restaura excludedDates en leccion del Mie
        -> Leccion recurrente del Mie 16/09 vuelve a ser visible
          -> Volver a Reprogramar si aplica
```

---

## Superficie de Impacto

| Area | Afectada | Riesgo |
|---|---|---|
| Kardex — marcar asistencia sesion regular | FIX — ya no arrastra a makeup | Bajo |
| Kardex — boton X en makeup | FIX — ahora funciona y persiste | Bajo |
| Kardex — boton Restablecer en makeup | Sin cambio — sigue funcionando | Ninguno |
| Agenda Admin / Profesor | Sin cambio directo | Ninguno |
| Kiosco docente (markLessonAttendance) | Sin cambio — usa ruta distinta | Ninguno |
| Facturacion / Recibos | Sin cambio | Ninguno |
| Datos previos (attendanceByDate legacy) | Fallback de lectura preserva historial | Ninguno |

## Criterio de Cierre

1. Marcar Presente en Sesion 2 (Lun 21 Sep, 16:45) -> Sesion 3 (17:30 makeup) queda Pendiente.
2. Marcar Falta en Sesion 2 -> Sesion 3 queda Pendiente.
3. Boton X en Sesion 3 -> desaparece del Kardex; la leccion recurrente del Mie 16/09
   vuelve visible sin exclusion; recarga desde PostgreSQL mantiene el estado.
