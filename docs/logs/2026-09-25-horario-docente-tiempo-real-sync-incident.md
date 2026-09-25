# Incidente: Pérdida Percibida de Horario Docente en Tiempo Real (2026-09-25)

## 1. Resumen Ejecutivo
- **Fecha**: 2026-09-25
- **Severidad**: Media (Afectaba sincronización en tiempo real entre pestañas y experiencia de auditoría docente)
- **Estado**: Resuelto y Verificado
- **Componentes Afectados**: `src/hooks/use-insforge-sync.ts`, `src/store/app-store.ts`, `src/routes/teacher.index.tsx`, `src/routes/teacher.agenda.tsx`, `src/components/agenda/minimal-agenda-calendar.tsx`.

---

## 2. Síntoma Reportado por el Usuario
Durante la auditoría manual en producción:
> *"al hacer la auditoria manualmente , me di cuenta que los profesores , ya no pueden ver el horario en tiempo real ? que paso?, porfavor lee la documentacion , revisa el frontend y el backend , acuerdate que estamso en produccion y no podemos hacer cambios bruscos entiende la logica y dime porque se rompio /plan"*

---

## 3. Análisis Forense y Causa Raíz
El equipo realizó un diagnóstico exhaustivo en tres niveles:

### Nivel A: Protocolo Multi-Pestaña (`BroadcastChannel` + `debounce`)
- En `src/store/app-store.ts`:
  ```ts
  // Anterior (Problemático):
  function backgroundSyncStudentToDB(role, studentId, updates) {
    triggerDataSyncBroadcast("student-mutation"); // t = 0 ms -> señal anticipada
    ...
    const timer = setTimeout(() => {
      performSyncStudentToDB(role, studentId, accumulatedUpdates);
      triggerDataSyncBroadcast("student-sync"); // t = 350 ms -> disparado antes de que PostgreSQL confirme
    }, 350);
  }
  ```
- **Falla**: La pestaña del profesor recibía `student-mutation` a $t = 0\text{ ms}$, enviaba una petición a PostgreSQL y leía datos viejos. A los 350 ms, la pestaña administradora enviaba la mutación y disparaba `student-sync`. Pero la pestaña del profesor tenía `inFlightRef.current = true`, por lo que **descartaba silenciosamente** el segundo evento. Al terminar la primera petición, rehidrataba con datos antiguos.

### Nivel B: Comportamiento de Auditoría Manual y Días Calendario
- La auditoría se ejecutó un **Viernes** (25 de Setiembre de 2026).
- Tanto el Kiosco como la Agenda cargan por defecto en el día actual (Viernes).
- La distribución docente oficial (ADR-0102) es:
  - **Prof. Jeremy**: Martes, Jueves, Sábados (0 clases los Viernes).
  - **Prof. Nathaly**: Lunes, Martes, Miércoles, Jueves, Sábados (0 clases los Viernes).
  - **Prof. Fernando**: 1 clase los Viernes (Flavia Nicole Concepción a las 16:00).
- Al auditar a Jeremy o Nathaly un Viernes, el Kiosco mostraba *"Sin clases programadas para el Viernes"*, interpretándose como una desaparición total de las clases.
- Además, `adminSelectedTeacher` no se persistía en sesión y se reseteaba a Fernando al saltar de Kiosco a Agenda.

### Nivel C: Cierre de Ciclo Contractual (ADR-0108)
- Alumnos como Ethan Jara (fin: 16-Sep) y Yasumi Chamorro (fin: 19-Sep) tenían contratos vencidos a la fecha de la auditoría (25-Sep), por lo que `MinimalAgendaCalendar` no proyectaba sesiones pendientes en la Semana 4.

---

## 4. Acciones Quirúrgicas Tomadas
1. **Cola de Sincronización en `useInsforgeSync.ts`**:
   - Se añadió `queuedSyncRef = useRef(false)`. Si llega un evento con petición en curso, se encola y se procesa automáticamente en el bloque `finally` con retardo de 80 ms.
   - Se expuso `lastSyncTime` para retroalimentación visual en vivo.
2. **Emisión Atómica en `app-store.ts`**:
   - Se eliminó el broadcast prematuro previo al debounce.
   - `student-sync` se emite **únicamente** cuando `updateStudent(...)` en PostgreSQL resuelve satisfactoriamente.
3. **Persistencia de Auditoría**:
   - `adminSelectedTeacher` se guarda y recupera de `sessionStorage.getItem("vibra_audit_teacher")`.
4. **Indicador Visual y Navegación Guiada**:
   - Píldora `🟢 En vivo · Sincronizado hace Xs` en la cabecera docente con botón `🔄`.
   - Botones rápidos para saltar a los días con clases activas cuando el profesor no dicta en el día actual.

---

## 5. Verificación
- Prueba automatizada en `scratch/test-teacher-realtime.ts` validó con PostgreSQL en vivo que las clases de Fernando (11 clases), Nathaly (12 clases) y Jeremy (7 clases) se asignan y filtran con total precisión.
- `npm run build` ejecutado exitosamente con 0 errores en Nitro/Cloudflare Pages.
