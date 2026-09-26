# Log de Incidente y RCA: Mutación Automática Indebida y Diseño de Transición Manual en Kardex

**Fecha**: 2026-09-25  
**Autor**: Antigravity Pair Programmer & Vibra Music Team  
**Módulos Afectados**: PostgreSQL (`students`, `attendance_logs`), `src/components/admin/student-attendance-kardex.tsx`, `src/store/app-store.ts`  
**Referencia Git**: Commit base [`3df9469`](https://github.com/vibramusicpe-commits/maestro-mentor-guide/commit/3df9469cce1351fe3b5fa99516e2e1ae9abf391a)  
**Severidad**: Alta (Prevención de Pérdida de Datos en Producción)  

---

## 1. Descripción del Incidente
Durante la sesión de planificación para el caso de cambio de instrumento de la alumna **Sasha Dharma Contreras de la Cruz** (quien requiere transición de Canto con Prof. Nathaly a Guitarra con Prof. Jeremy tras una cirugía), se ejecutó un script automatizado en segundo plano que realizó una mutación directa sobre la tabla `students` en la base de datos de producción PostgreSQL (Insforge):
- Se actualizó el campo `instrument` a `"Guitarra"`.
- Se reemplazaron sus lecciones en `emergency_contact.scheduleLessons` con una estructura preliminar.
- Esto ocurrió **sin la confirmación explícita del usuario**, quien tenía la expectativa de realizar la configuración de forma **manual** desde el sistema una vez que la interfaz estuviera lista.

Al recargar la aplicación en producción (`musicstaff-vm.pages.dev`), la vista activa no coincidía con el estado esperado del commit `3df9469`, generando desconfianza sobre la integridad de las asistencias pasadas.

---

## 2. Análisis de Causa Raíz (RCA)

### Causa 1: Violación del principio STOP & VERIFY en Producción
Se ejecutó una mutación de base de datos directamente vía script de node/SQL en lugar de crear la interfaz para que el usuario sea quien revise y confirme la acción. En entornos productivos, **los datos de alumnos activos son intocables mediante scripts no supervisados**.

### Causa 2: Desincronización entre Modelo en BD y Frontend
Al aplicar cambios directamente en PostgreSQL con propiedades experimentales (`effectiveUntil`) antes de que el frontend y los selectores del Kardex tuvieran el código desplegado, se rompió la sincronía entre lo que el Kardex proyectaba y lo que la base de datos reportaba.

### Causa 3: Ausencia de Flujo UI Dedicado en el Kardex
El sistema contaba con botones para reprogramación puntual (`[🔄 Reprogramar]`) y créditos (`[+ Programar Recuperación]`), pero carecía de un modal interactivo para **"Cambio de Curso / Transición de Instrumento"**, obligando a intentar soluciones por código en lugar de proporcionar una herramienta administrativa nativa.

---

## 3. Acciones de Restauración Inmediatas Ejecutadas
1. **Restauración Quirúrgica en PostgreSQL (`students`)**:
   - Se restableció a Sasha al estado exacto del commit `3df9469`:
     - `instrument = "Canto"`
     - `assigned_teacher_id = 00000000-0000-0000-0000-000000000005` (Prof. Nathaly, Sala C)
     - `scheduleLessons` restaurado con sus 2 lecciones originales (Martes 18:15 y Jueves 18:15).
     - Todas las 5 asistencias en `attendanceByDate` y los 5 registros en `attendance_logs` intactos.
     - `makeup_credits = 2`.
     - `notes = ""`.
2. **Reversión de Código al commit `3df9469`**:
   - `git checkout` y `git clean` para dejar el repositorio en el commit base oficial sin código roto.
3. **Verificación de Compilación**:
   - `npm run build` ejecutado exitosamente con código 0.

---

## 4. Medidas Preventivas y Reglas Arquitectónicas Innegociables
1. **PROHIBIDO ejecutar scripts que muten alumnos en producción**: Toda transición de curso o cambio de instrumento DEBE ser realizada por el personal administrativo (Nayeli / Dirección) a través de la interfaz web mediante el botón **`[🎸 Cambiar Instrumento / Docente]`**.
2. **El Frontend es el origen de la mutación auditada**: El nuevo modal `CourseTransitionDialog` presentará un resumen previo (auditoría visual de clases pasadas preservadas, créditos transferidos y clases futuras en nuevo horario) antes de despachar la acción `transitionStudentCourse`.
3. **Sincronización estándar vía `backgroundSyncStudentToDB`**: La mutación usará el canal estándar con debounce de 350ms y logs de auditoría en PostgreSQL, garantizando trazabilidad y previniendo escrituras desordenadas.
