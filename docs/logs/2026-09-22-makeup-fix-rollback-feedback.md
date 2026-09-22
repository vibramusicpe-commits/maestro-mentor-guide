# Bitacora: Rollback Fix Makeup Attendance Isolation (commit 3aaee2c)
Fecha: 22 de Septiembre, 2026
Hora: ~17:49 PET
Responsable: Antigravity AI & Equipo Vibra Music

---

## Resumen

El fix de los 3 bugs de clase reprogramada (commit `3aaee2c`, rama main) fue revertido
mediante `git revert HEAD HEAD~1` -> commits `abd0a92` + `a124bc5`.

El estado actual de main (commit `a124bc5`) es equivalente a `60f8428`:
solo incluye el fix de import `normalizeStudentName` y su documentacion.

---

## Feedback del Usuario — Por que se reverto

El usuario reporto que tras el despliegue del fix en Cloudflare Pages, alumnos que
ya habian culminado su ciclo (como Emma, cuyo plan termino en Septiembre 2026) aparecian
con clases proyectadas hasta Noviembre 2026 y con su historial de asistencia desconfigurado.

**Hipotesis de causa (pendiente de verificar con tokens al 100%):**

El cambio en la logica de lectura de status en `allCycleSessions` del Kardex:

ANTES (lectura legacy):
```ts
if (lesson.attendanceByDate && lesson.attendanceByDate[curDateStr]) {
  currentStatus = lesson.attendanceByDate[curDateStr];
}
```

DESPUES (nuevo, con separacion recurrente/makeup):
```ts
if (lesson.dateStr) {
  // makeup: lee lesson.attendanceByDate[lesson.dateStr]
} else {
  // recurrente: lee attendanceByWeek[semanaEnMes], fallback a attendanceByDate
}
```

La nueva lectura de lecciones recurrentes por `attendanceByWeek[semanaEnMes]` usaba
`curMonthWeeks2 = getMonthWeeks(curY, curM)` que calcula la semana DENTRO DEL MES
actual. Esto puede diferir del `weekIndex` almacenado originalmente en la leccion
(que era un weekIndex absoluto desde planStartDate, no relativo al mes).

Si el `weekIndex` almacenado en `attendanceByWeek` no coincidia con el indice relativo
al mes calculado en tiempo de render, la asistencia ya marcada se leia como "pendiente"
y el ciclo ya culminado se reactivaba con clases proyectadas.

Adicionalmente, el cambio en `setStudentSessionAttendance` que restringia la escritura
de lecciones recurrentes a SOLO `attendanceByWeek` podia haber "limpiado" marcas de
asistencia existentes en `attendanceByDate` al detectar el campo `isOwnDateStr`.

---

## Estado Pendiente — Para manana con tokens al 100%

### Bugs de makeup que siguen pendientes (pre-existentes, no nuevos):

1. **Bug 1 — Arrastre de asistencia entre clase regular y makeup del mismo dia:**
   - Marcar Presente en sesion regular (Lun 21/09, 16:45) -> la makeup (17:30) hereda el mismo estado.
   - Causa real: `setStudentSessionAttendance` escribe en AMBOS `attendanceByWeek` y
     `attendanceByDate[curDateStr]` de la leccion recurrente. La makeup del mismo dia
     lee ese `attendanceByDate` si por sync de PostgreSQL lo hereda.
   - FIX SEGURO: Solo restringir escritura (no lectura) en `setStudentSessionAttendance`.
     No tocar la logica de lectura del Kardex para no romper historial.

2. **Bug 2 — Boton X no persiste la eliminacion de makeup en PostgreSQL:**
   - `deleteLessonFromSchedule` solo filtra `s.schedule` en memoria.
   - FIX SEGURO: agregar sync de `adminStudents.scheduleLessons` + DB en esa funcion.
     Sin tocar la lectura del Kardex.

3. **Bug 3 — Boton X no restaura `excludedDates` de la leccion original:**
   - La logica inline en el componente usaba `useAppStore.setState` directo.
   - FIX SEGURO: nueva accion atomica `revertMakeupLesson` en el store.
     Sin tocar la lectura del Kardex.

### Leccion aprendida del rollback:

El cambio de lectura en `allCycleSessions` (separar recurrente/makeup) fue demasiado
agresivo. Afecto a TODOS los alumnos activos con historial, no solo a Karlitoz.
La proxima implementacion debe:
1. NO tocar la logica de lectura de status del Kardex para alumnos sin makeup.
2. Aplicar solo el fix de escritura y el fix del boton X.
3. Verificar en staging con Emma, Karlitoz y otro alumno activo antes de desplegar.

---

## Commits Involucrados

| Commit | Accion | Estado |
|---|---|---|
| `3aaee2c` | Fix makeup isolation (Bug1+Bug2+Bug3) | REVERTIDO por `a124bc5` |
| `9b3f3be` | Docs ADR-0112 + CHANGELOG v2.0.6 | REVERTIDO por `abd0a92` |
| `a124bc5` | Revert del fix de code | ACTIVO en main |
| `abd0a92` | Revert de docs | ACTIVO en main |
