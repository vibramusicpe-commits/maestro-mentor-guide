# ADR-0183: Clarificación de Vistas (Auditoría vs. Informes) y Activación de la Bitácora Docente

**Fecha:** 2026-11-03
**Estado:** Implementado y verificado (`npm run build` en verde).
**Autores:** Equipo Vibra (Open Code & Antigravity)
**Versión:** 2.0.54

---

## Contexto

El diagnóstico de producción (2026-11-03) reveló un solapamiento terminológico que estaba frenando la adopción del módulo pedagógico:

| Entidad | Tabla | Dónde se llena | Quién |
|---|---|---|---|
| **1. Bitácora de Clase** | `lesson_evaluations` | Kiosco móvil `/teacher` | El docente en el aula (2-3 min) |
| **2. Informe Pedagógico de Progreso** | `progress_reports` | `/admin/informes` y `/teacher/informes` | Docente redacta borrador, Dirección aprueba |
| **3. Auditoría de Alumnos** | `students`, `invoices`, `payment_audit_logs` | `/admin/reportes` | Dirección y Secretaría (cobranzas) |

Estado real comprobado en Insforge PostgreSQL:

1. **`lesson_evaluations`:** solo **3 registros** en toda la historia de producción (Hans/Fernando, Alexis/Jeremy, Fernanda Sofía/Nathaly, todos de octubre 2026). Los docentes no están registrando las clases diarias.
2. **`progress_reports`:** **0 registros**. Ningún informe puede emitirse porque se requiere un mínimo de 2 bitácoras de clase (`report-readiness.ts`, ADR-0180).
3. **`org_settings`:** `evaluationsV2: false`, `progressReportsV2: false`, con `pilot_teacher_ids` incluyendo a Jeremy (`...003`), Fernando (`...004`) y Nathaly (`...005`). Los tres profesores **sí** tienen el módulo `ClassLog` disponible, pero no lo estaban usando.
4. **Criterios:** Jeremy ya validó sus 17 criterios de Guitarra y Batería (`draft = false`, `visible_in_report = true`). No hay criterios bloqueantes.

### Problemas detectados

1. **En Dirección (`/admin`):** el menú lateral ofrecía dos botones casi idénticos, `"Informes"` y `"Reportes"`. Dirección no sabía cuál abrir para auditar deudas y cuál para revisar avances pedagógicos.
2. **En el Portal Docente (`/teacher`):**
   - El botón `"Registrar clase"` era gris pálido, secundario y quedaba debajo de los 4 botones de asistencia: pasaba desapercibido.
   - El componente `<ClassLog>` se montaba en un `Sheet` inferior **sin la prop `onSaved`**: al guardar, la hoja no se cerraba ni daba feedback de éxito.
   - El docente asociaba "Registrar clase" con redactar un informe largo, cuando en realidad es un checklist de 2 minutos.
   - El botón no indicaba si la sesión ya estaba registrada ni si estaba pendiente.

---

## Decisiones

### 1. Renombrar y distinguir vistas en el sidebar administrativo (`src/routes/admin.tsx`)
- `"Informes"` → **`"Informes Pedagógicos"`**, icono `FileBarChart2`.
- `"Reportes"` → **`"Auditoría de Alumnos"`**, icono `ShieldCheck` (importado de `lucide-react`; se retira el `FileSpreadsheet` que quedó sin uso).
- El resto del `nav` (Dashboard, Campañas, WhatsApp Bot, Horario, Alumnos, Clases Demo, Cobros y Abonos, Invitaciones, Asistencia Docente) no se altera.

### 2. Enlace cruzado desde Auditoría hacia Informes (`src/routes/admin.reportes.tsx`)
- La celda **"Último informe"** de la tabla de `/admin/reportes` queda envuelta en un `<Link to="/admin/informes" search={{ alumno: st.name }}>`.
- Con informe: el `Badge` de estado muestra el sufijo `↗` y subraya el borde al hacer hover (`group-hover/report:border-primary`); debajo se mantiene la fecha fin de periodo.
- Sin informe: se muestra `Sin informe ↗` en color primario al hover.
- Se añade `title={`Ver seguimiento pedagógico de ${st.name}`}` para accesibilidad.
- **Filtro real por alumno:** la ruta `/admin/informes` declara `validateSearch` para `?alumno=<nombre>` (`alumno?: string`, vacío ⇒ `undefined`). `AdminInformesPage` lo lee con `Route.useSearch()` y lo entrega a `<InformesTrackerPanel initialStudentName>` como **valor inicial del filtro de búsqueda** (`useState(initialStudentName ?? "")`). El usuario aterriza con la nómina ya acotada a ese alumno y puede ampliarla con "Limpiar filtros".
- Es un **filtro de lectura**: no crea, modifica ni pre-selecciona ningún informe. No altera la lógica del consolidado (`progress_reports` se sigue generando desde `lesson_evaluations`, nunca desde la vista de Auditoría).

### 3. Fricción cero en el Kiosco Docente (`src/routes/teacher.index.tsx`)
- **`onSaved` conectado:** al guardar la bitácora se llama `setClassLogSeed(null)` (cierra la hoja) y se emite `toast.success("✓ Bitácora de clase guardada correctamente")` con el nombre del alumno en la descripción.
- **Botón con jerarquía contextual:**
  - Con asistencia `presente`: `border-2 border-primary bg-primary/15` (realce estático, sin `animate-pulse`) y etiqueta **`📝 Llenar bitácora de hoy (2 min)`**.
  - En cualquier otro estado: estilo suave y etiqueta **`📝 Bitácora de clase`**.
  - Se conserva `min-h-[44px]` (ADR-0177) y la acción principal sigue siendo la de asistencia.
  - **Se descartó `animate-pulse`**: en el Kiosco conviven hasta 5-6 tarjetas por franja; si todas están en `presente`, el parpadeo simultáneo satura y resta jerarquía a la asistencia. El realce estático comunica lo mismo sin ruido visual.
- **Encabezado pedagógico del Sheet:** título **"Bitácora de Clase"**, píldora `⏱ 2 minutos`, identidad de la sesión (alumno · fecha · hora) y una línea aclaratoria: *"Selecciona el tema visto, marca 1-2 criterios y añade el repertorio trabajado. No es un informe formal para apoderados."*

---

## Reglas y blindajes respetados

1. **Intocables absolutos:** no se tocó `src/store/app-store.ts`, `src/lib/kardex-calculator.ts` ni `src/lib/student-cycle.ts`. Tampoco los motores de asistencia.
2. **Cero datos financieros en vistas pedagógicas:** `/admin/informes` y `/teacher` no renderizan montos `S/`, saldos ni deudas. El vínculo creado va de Auditoría (financiera) hacia Informes (pedagógica), nunca al revés.
3. **Filtro `is_test = false`:** intacto en todos los servicios de evaluaciones e informes (ADR-0175).
4. **Identidad por UUID:** el enlace y el `ClassLog` operan con `student.id`; el nombre es solo texto visible.
5. **No breaking changes:** `npm run build` en verde; solo se añadieron props ya declaradas en `ClassLogProps` (`onSaved`) y clases de estilo.
6. **Sin cambios de esquema:** ninguna migración ni escritura de datos. El estado de la base (3 bitácoras, 0 informes) no se altera con este ADR.

---

## Consecuencias

- **Positivas:** Dirección distingue sin ambigüedad las dos vistas; el docente identifica que registrar la bitácora toma 2 minutos y recibe confirmación inmediata al guardar, lo que habilita la acumulación de `lesson_evaluations` necesaria para generar los primeros `progress_reports` de producción.
- **Neutrales:** el flujo legacy de notas a familia (`lesson-notes.tsx`, `teacher-notes-moderation.tsx`) sigue operativo y sin cambios.
- **Pendientes:** los flags `evaluationsV2` y `progressReportsV2` permanecen en `false`; el acceso se rige por `pilot_teacher_ids`. Abrir el módulo a todos no requiere desplegar (efecto en ≤ 30 s).
