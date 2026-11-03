# ADR-0182: Dashboard de Seguimiento de Informes y Reportes (/admin/informes y /teacher/informes)

**Fecha:** 2026-11-02
**Estado:** Implementado y verificado en runtime (`npm run build` en verde).
**Autores:** Equipo Vibra (Open Code & Antigravity)

---

## Contexto

Previamente, la plataforma contaba con la bandeja general de informes generados (`ProgressReportsPanel` en `/admin/alumnos?tab=informes`) y el generador individual por alumno en el portal docente (`/teacher/informes?student=<uuid>`). Sin embargo, existía un gap operativo crítico:

1. **Invisibilidad del estado de preparación de alumnos**: Dirección no disponía de una vista consolidada para saber de un vistazo quién cumplía el mínimo de evaluaciones para informe, quién aún no lo tenía y quién estaba bloqueado por falta de evaluaciones.
2. **Carencia de panorama para el docente**: Al entrar a `/teacher/informes`, el docente veía únicamente un selector individual, sin un resumen visual de su cohorte ni semáforos que le permitieran priorizar a qué alumno evaluar o redactar informe.
3. **Validación de criterios de Jeremy**: Los 17 criterios de Guitarra y Batería creados para el Prof. Jeremy (`00000000-0000-0000-0000-000000000003`) requerían aprobación formal en base de datos para no advertir estado borrador ni bloquear la publicación.

---

## Decisiones

### 1. Validación Oficial de los 17 Criterios de Jeremy
Se ejecutó la actualización en la tabla `evaluation_fields` de Insforge PostgreSQL:
- Se actualizaron los 17 criterios propios de Jeremy a `visible_in_report = true`.
- En `ui_config`, se estableció `draft = false`, `status = "validado"`, `needs_validation = false` y se registró la validación formal con fecha `2026-11-02`.
- Verificado: `getDraftCriteriaFields()` ahora devuelve 0 criterios pendientes de borrador en el sistema.

### 2. Servicio de Resumen Ligero (`src/lib/services/evaluations-summary.service.ts`)
- `getEvaluationsSummaryMap(studentIds?)`: consulta `lesson_evaluations` filtrando estrictamente `is_test = false` y ordenando descendentemente por fecha y hora.
- Agrupa en memoria cliente devolviendo un mapa `Map<string, StudentEvaluationSummary>` con: total de evaluaciones, fecha de la última evaluación, último docente e instrumento.
- Evita consultas N+1 en PostgREST y no modifica esquemas de base de datos.

### 3. Panel de Seguimiento Operativo (`src/components/admin/informes-tracker-panel.tsx`)
- Cruza en tiempo real:
  - Alumnos con `status: "activo"` desde `useAppStore` (ADR-0106 / ADR-0107).
  - Resumen de evaluaciones desde `getEvaluationsSummaryMap()`.
  - Informes existentes desde `listProgressReports({ limit: 500 })`.
- **Semáforo Operativo de 4 Estados**:
  - 🟢 **Con informe**: Alumno con informe generado (`draft`, `pending`, `published`, `rejected`).
  - 🟡 **Listo para informe**: Cumple el mínimo de evaluaciones (≥ 2 en Regular/Intensivo o ≥ 1 en Demo) y aún no tiene informe.
  - 🟠 **Insuficiente**: Cuenta con evaluaciones registradas pero no alcanza el mínimo requerido.
  - 🔴 **Sin evaluaciones**: Cero evaluaciones registradas en sala.
- **Acciones Directas**:
  - `[📄 Ver informe]`: Abre `ProgressReportDialog` con el informe existente.
  - `[✨ Generar borrador]`: Crea el borrador atómico en PostgreSQL con ventana sugerida oficial (`resolveReportWindow`) y lo abre de inmediato en el diálogo.
  - `[Faltan eval.]`: Deshabilitado si no se cumple el mínimo contractual.
- **KPIs y Exportación**: Contadores en cabecera (Total, Con Informe, Listos, Por Evaluar) y exportación a CSV con BOM UTF-8 respetando la regla innegociable de **cero datos financieros**.

### 4. Nueva Ruta Dedicada `/admin/informes` (`src/routes/admin.informes.tsx`)
- Registrada en TanStack Start y enlazada en el menú lateral principal de navegación (`src/routes/admin.tsx`) con icono `FileBarChart2`.
- Ofrece alternancia de pestañas entre **Seguimiento Operativo** (`InformesTrackerPanel`) y la **Bandeja General de Informes** (`ProgressReportsPanel`).

### 5. Resumen Móvil-First en Portal Docente (`src/components/teacher/teacher-progress-reports.tsx`)
- Cuando el docente ingresa a `/teacher/informes` sin un alumno seleccionado en URL, se despliega una vista resumen con tarjetas de toda su cohorte asignada (`myStudents`).
- Cada tarjeta muestra el instrumento, plan, total de evaluaciones, fecha de la última clase y botón de acción contextual:
  - "Ver informe" si ya tiene borrador o informe en revisión.
  - "Generar informe" si está listo (🟡).
  - "Ver alumno y registrar clases" si requiere registrar evaluaciones previas mediante `ClassLog`.
- Al seleccionar a un alumno, se visualiza un botón de navegación superior `[← Volver a ver todos mis alumnos]` para retornar al panorama general con un solo toque.
- Se mantiene la regla estricta: el docente solo crea y envía a revisión (`draft` / `pending`), **jamás publica**.

---

## Verificación

- `UPDATE` de 17 criterios de Jeremy ejecutado y comprobado contra Insforge Postgres (0 borradores restantes).
- `npm run build` ejecutado exitosamente sin errores de TypeScript ni de empaquetado.
- Cero alteraciones a `app-store.ts`, `kardex-calculator.ts` ni `student-cycle.ts`.
- Cero datos financieros expuestos en pantalla, exportación CSV o consola.
