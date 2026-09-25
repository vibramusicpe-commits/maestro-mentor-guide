# ADR-0126: Sincronización en Tiempo Real Docente, Cola de Peticiones en Vuelo y Persistencia de Auditoría

## Estado
Aprobado e Implementado en Producción.

## Contexto
Durante una auditoría manual de las vistas docentes (`/teacher` y `/teacher/agenda`), se detectó que los profesores no podían ver las clases en tiempo real cuando se realizaban cambios desde el panel de administración (`/admin/agenda` o `/admin/alumnos`), o percibían el horario vacío/incompleto.

Al realizar la trazabilidad técnica profunda entre el backend (PostgreSQL en Insforge) y el frontend (TanStack Router, Zustand, hooks de sincronización):
1. **Condición de carrera entre BroadcastChannel y Debounce**:
   - `backgroundSyncStudentToDB` (`src/store/app-store.ts`) emitía una señal anticipada `triggerDataSyncBroadcast("student-mutation")` a $t = 0\text{ ms}$.
   - La pestaña receptora (docente) recibía el mensaje e invocaba `syncBackendData(true)`, enviando un `GET` a PostgreSQL.
   - Pero en la pestaña emisora (administración), la escritura en PostgreSQL estaba detenida por un debounce de 350 ms (`setTimeout`). Por tanto, la pestaña docente leía datos **antiguos**.
   - A los 350 ms, la pestaña emisora enviaba la escritura y disparaba `triggerDataSyncBroadcast("student-sync")`.
   - La pestaña docente descartaba silenciosamente este segundo evento porque su primera petición HTTP aún estaba en vuelo (`inFlightRef.current === true`).
   - Al terminar la primera petición, la pestaña docente se quedaba congelada con datos obsoletos.
2. **Emisión síncrona antes de resolución de PostgreSQL**:
   - `performSyncStudentToDB` es asíncrono (`updateStudent`), pero la emisión de `student-sync` se ejecutaba sincrónicamente sin esperar a que PostgreSQL confirmara la persistencia.
3. **Reseteo de profesor seleccionado en auditoría**:
   - Cuando un directivo o dueña auditaba a Jeremy o Nathaly, el estado `adminSelectedTeacher` residía únicamente en memoria local del componente (`useState`), reseteándose a Fernando cada vez que se navegaba entre Kiosco y Agenda.
4. **Falsa percepción de horario vacío por día no lectivo del profesor**:
   - Las vistas docentes se abren en el día actual del dispositivo (hoy: Viernes).
   - Jeremy dicta exclusivamente Martes, Jueves y Sábados (0 clases los viernes).
   - Nathaly dicta Lunes, Martes, Miércoles, Jueves y Sábados (0 clases los viernes).
   - Sin un aviso claro de qué días dicta el docente, el auditor asumía que el horario se había borrado o roto.
5. **Cierre de vigencia contractual (ADR-0108)**:
   - Alumnos cuyos ciclos de 8 clases finalizaron a mediados de mes (ej. Ethan Jara al 16-Sep y Yasumi Chamorro al 19-Sep) no proyectan clases pendientes en la Semana 4 por regla de vigencia contractual.

## Decisiones Técnicas

### 1. Cola de Sincronización en Vuelo (`queuedSyncRef`) en `useInsforgeSync`
- Si llega cualquier evento de revalidación (`BroadcastChannel`, `StorageEvent`, o llamada manual) mientras una petición HTTP ya está en curso (`inFlightRef.current === true`), en lugar de descartarlo, se marca `queuedSyncRef.current = true`.
- En el bloque `finally` de `syncBackendData`, si `queuedSyncRef.current` es verdadero, se dispara inmediatamente una nueva consulta a PostgreSQL tras 80 ms, asegurando que ninguna actualización quede sin procesar.

### 2. Emisión Atómica Post-Escritura en PostgreSQL
- Se elimina la emisión prematura a $t = 0\text{ ms}$ en `backgroundSyncStudentToDB`.
- `triggerDataSyncBroadcast("student-sync")` se emite **únicamente dentro del `.then` exitoso** de `updateStudent(...)` en `performSyncStudentToDB`, cuando PostgreSQL ya ha persistido los datos de forma inmutable.

### 3. Sincronización Completa de Métodos de Eliminación de Clases
- `removeLessonFromSchedule` actualiza tanto el horario en memoria como las `scheduleLessons` del alumno en Zustand y PostgreSQL vía `backgroundSyncStudentToDB`, garantizando paridad con `deleteLessonFromSchedule`.

### 4. Persistencia de Sesión para Auditoría Docente (`sessionStorage`)
- `adminSelectedTeacher` se almacena en `sessionStorage` (`vibra_audit_teacher`). Al alternar entre Kiosco (`/teacher`) y Agenda (`/teacher/agenda`), se preserva el profesor elegido (Jeremy, Nathaly o Fernando) sin resetear a Fernando.

### 5. Indicador Visual de Sincronización en Vivo y Atajos en Días Vacíos
- Se añade un badge visual `🟢 En vivo · Sincronizado hace Xs` en la cabecera docente con botón táctil `🔄`.
- Cuando un profesor no tiene clases el día seleccionado, la tarjeta vacía expone botones directos a los días en que sí dicta (ej. `Mar (3 alumnos)`, `Jue (4 alumnos)`), guiando al auditor de inmediato.

## Consecuencias
- Cero eventos de sincronización descartados entre pestañas.
- Garantía de que cualquier consulta de la vista docente lee datos frescos de PostgreSQL.
- Auditoría fluida sin reseteos accidentales de docente ni confusión en días no lectivos.
- Se mantiene al 100% la compatibilidad con todas las directrices previas (ADR-001, ADR-0102, ADR-0108, ADR-0117, ADR-0125).
