# Changelog: Vibra Music (Maestro Mentor Guide)

Todas las modificaciones notables a este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased] - 2026-08-15

### Añadido
- **Marco Integral de las 6 Funciones de Secretaría (Nayeli) y Dirección (Dueña)**:
  1. **Registro de Asistencia de Alumnos**: Marcado en vivo en la Ficha del Alumno (✓ Presente, ⏰ Tarde, ✗ Falta) con recálculo automático y reactivo de la tasa de asistencia (`attendanceRate`).
  2. **Registro de Matrículas**: Formulario integral con fecha exacta de inicio/fin, cálculo de vigencia y botón directo `+ Horario` para agendar sesiones semanales en 1 clic.
  3. **Registro de Reprogramaciones**: Módulo de reprogramación en `AgendaBoard` con selector de alcance (*Solo esta semana* vs *Todo el mes*) y validación anti-conflictos.
  4. **Atención de WhatsApp Business**: Integración directa con la API de WhatsApp con plantillas predefinidas de bienvenida, cobranzas y coordinación familiar.
  5. **Registro de Retiro de Alumnos**: Gestión de estados *En Pausa* y *Baja*, historial de reingresos y liberación de vacantes en el horario.
  6. **Registro de Cobranzas y Abonos**: Módulo de Facturación con registro de pagos totales y parciales (Yape, Plin, Efectivo, Transferencia) y comprobante WhatsApp.
- **Sistema de Seguridad y Jerarquía de Eliminaciones (ADR 005)**:
  - La secretaria (Nayeli) no puede eliminar permanentemente; el sistema genera una **Solicitud de Eliminación Protegida** con motivo justificado.
  - La Dueña (Super Admin) cuenta con el componente `DeletionRequestsPanel` en su Dashboard con botones para **Aceptar y Eliminar**, **Denegar** y consultar el **Reporte Oficial de Auditoría con Timestamp inmutable**.
- **ADR 005**: Documentación formal del flujo de aprobación y funciones operativas en [`docs/adr/0005-flujo-aprobacion-eliminaciones-y-funciones-secretaria.md`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/adr/0005-flujo-aprobacion-eliminaciones-y-funciones-secretaria.md).

## [1.4.0] - 2026-08-14

### Añadido
- **Vista Diaria de Horario en 3 Columnas por Docente (Estilo Excel Oficial)**:
  - Nueva matriz en [`/admin/agenda`](file:///C:/Users/USER/my%20music%20staff%20backend/src/components/admin/agenda-board.tsx) que organiza las clases del día en 3 columnas dedicadas para los profesores principales: **PROF. JEREMY**, **PROF. FERNANDO** y **PROF. NATHALY**.
  - Visualización simultánea de clases grupales y colores oficiales de categoría (Junior, Juvenil, Adulto, Infantil).
  - Casillas vacías con acción interactiva *"+ Disponible"* para agendado rápido.
  - Columna de **HORA** con fondo salmón del Excel y tipografía carbón oscuro (`text-slate-950`) de alto contraste y máxima legibilidad (TDAH-friendly).
- **Control Temporal Meticuloso Día por Día (DD/MM/AAAA)**:
  - Soporte de campos `planStartDate` y `planEndDate` con cálculo exacto del ciclo formativo (1 mes, 3 meses o 12 meses menos 1 día).
  - Sincronización precisa con la agenda: las clases solo se muestran durante el rango exacto contratado por cada alumno.
- **Historial de Reingresos y Bajas Editable en Agenda**:
  - Posibilidad de alternar estados (Activo, En Pausa, Baja), seleccionar planes del Dossier, y ajustar fechas de inicio/vencimiento directamente desde el panel de historial en [`/admin/agenda`](file:///C:/Users/USER/my%20music%20staff%20backend/src/components/admin/agenda-board.tsx).
  - Botón de acción rápida: *"🚀 Confirmar Reingreso (Activar)"*.
- **Matricular Nuevo Alumno con Esquema Completo del Dossier**:
  - Modal enriquecido en [`/admin/alumnos`](file:///C:/Users/USER/my%20music%20staff%20backend/src/components/admin/students-table.tsx) con selección de Planes Oficiales (Mensual S/ 329, Trimestral S/ 289.40, Anual S/ 263.20), Matrículas (Promo Demo S/ 30 / Regular S/ 120), Pack de Útiles (S/ 67) y Fecha Exacta de Inicio.
- **Sincronización del Botón "+ Horario"**:
  - Vinculación directa de las sesiones (1ra y 2da clase semanal) con el año y mes del plan del alumno en [`ScheduleStudentForm`](file:///C:/Users/USER/my%20music%20staff%20backend/src/components/admin/students-table.tsx).
- **Habilitación de Cobros y Abonos para Nayeli (Staff)**:
  - Registro de pagos WhatsApp/Yape/Efectivo con N° de operación y bitácora de auditoría inmutable, sin permisos de retiro o alteración de base contable.

### Logs & Arquitectura Graphify / Engram
- **Creación del Registro Maestro de Logs (`docs/logs/system_audit.log`)**:
  - Trazabilidad y auditoría cronológica de todos los diagnósticos, fixes y cambios.
- **Actualización de Grafos de Sistema (Graphify & Engram)**:
  - [`docs/graphify/data_flow_graph.mermaid`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/graphify/data_flow_graph.mermaid): Grafo de flujo de datos completo (Importadores, Estado, Timbre, Backend).
  - [`docs/graphify/dependency_graph.mermaid`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/graphify/dependency_graph.mermaid): Grafo de componentes y dependencias.
  - [`docs/engram/memory_graph.json`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/engram/memory_graph.json): Memoria gráfica persistida con las franjas horarias oficiales.

### Añadido & Automatización (Added)
- **Tokens de Invitación Autosuficientes y Enrutamiento Incógnito / Multiplataforma (ADR 0046)**:
  - Formato de enlace determinista `inv-{rol}-{nombre}-{timestamp}` que preserva el rol y nombre del usuario incluso en pestañas de incógnito, otros navegadores o futuras apps móviles (Flutter / Android / iOS).
  - Enrutamiento estricto al portal correcto (`/teacher`, `/family` o `/admin`) sin riesgo de caer en el portal familiar por omisión.
- **Validación Dual de Contraseña y Estado Aceptado en Invitaciones (ADR 0045)**:
  - Soporte de ingreso transparente tanto con la **Clave Maestra** como con la **nueva contraseña personalizada** creada por el profesor o apoderado.
  - Sincronización instantánea del estado de la invitación a **`aceptado`** tras completar el primer acceso.
  - Acceso directo en visitas posteriores sin volver a solicitar la clave maestra.
  - Manejo optimizado de endpoints PostgREST en modo híbrido.
- **Eliminación Individual y Selección Múltiple de Alumnos (ADR 0044)**:
  - Checkbox maestro en cabecera de tabla y checkboxes individuales en cada fila para seleccionar alumnos específicos.
  - Botón de acción masiva `🗑️ Eliminar Seleccionados (N)` con confirmación explícita.
  - Icono de papelera individual (`Trash2`) en la columna de acciones para borrar alumnos en 1 solo clic.
- **Arquitectura de Red Multidispositivo y Persistencia Insforge (ADR 0043)**:
  - Documentación detallada del flujo de sincronización híbrida: render reactivo inmediato en cliente + persistencia en PostgreSQL Insforge (`pdey9yma.us-east.insforge.app`).
  - Fijación estricta de puerto `5173` en desarrollo para evitar aislamiento de origen local (`Same-Origin Policy`).
  - Garantía de persistencia unificada en producción multidispositivo (móviles de profesores, tablets de recepción y dirección en Cloudflare).
- **Navegador Multi-Semana y Alcance de Reprogramación (ADR 0042)**:
  - Navegador interactivo de 4 semanas `[ < ] Semana X de 4 [ > ]` con cálculo y renderizado de fechas reales en las cabeceras (Lunes a Sábado).
  - Selector de alcance al mover/reprogramar una clase:
    - ⚡ **Solo esta semana**: Aplica el cambio únicamente para la semana activa sin alterar las demás semanas.
    - 🗓️ **Todo el mes**: Aplica el nuevo horario para las 4 semanas de Agosto.
  - Indicador cognitivo y accesible **`1ra Clase`** / **`2da Clase`** en las tarjetas de la Rejilla Semanal y de la Vista Diaria, eliminando la adivinación para el personal de secretaría.
- **Agendamiento Inteligente Multi-Día por Plan Oficial (ADR 0041)**:
  - Botón directo `+ Horario` en cada fila del Directorio de Alumnos (`students-table.tsx`).
  - Detección automática de modalidad:
    - **Plan Regular (8 clases / mes)**: solicita Día 1 (Hora y Sala) y Día 2 (Hora y Sala), agendando ambas sesiones en 1 clic.
    - **Plan Intensivo (4 clases / mes)**: solicita el día único de clase semanal.
  - Sincronización instantánea con la cuadrícula de la Agenda Interactiva y el portal del profesor asignado.
- **Sistema Directo de Alertas e Incidencias de Alumnos (`Alerta`)**:
  - Botón `Alerta` en el Directorio de Alumnos para registrar avisos de Salud (lesiones), Comportamiento, Logros o Coordinación familiar.
  - Reflejo automático en tiempo real en la tarjeta de Alertas del Dashboard (`alerts-panel.tsx`) con botón de resolución `✓ Listo`.
- **Identificación Visual por Categorías de Edad**:
  - Formato minimalista `Nombre (CATEGORÍA)` con los colores oficiales de Vibra Music (Junior en amarillo, Juvenil en verde, Adulto en gris, Infantil en morado, etc.).
  - Sincronizado en la Gestión de Alumnos y en el Directorio para Profesores (`/teacher/alumnos`).

### Corregido (Fixed)
- **Import de `PlusCircle` en Horario de Clases**:
  - Resuelto `ReferenceError: PlusCircle is not defined` importándolo en `agenda-board.tsx`.
- **Import de `useEffect` y `Calendar` en Gestión de Alumnos**:
  - Resuelto en `students-table.tsx`.
- **Sincronización de Sesión de Profesores y Familias**:
  - Resuelto para preservar sesión tras F5 y redirigir limpiamente a sus respectivos portales sin pasar por accesos de Dueña/Secretaria.

### Seguridad Crítica (Security)
- **Doble Filtro de Seguridad Estilo GitHub para Vaciado Masivo (ADR 0038)**.
- **Importador Universal de Alumnos CSV/Excel para Nayeli (ADR 0037)**.
- **Importador Universal de Horarios CSV/Excel para Nayeli (ADR 0035)**.
- **Purga Total de Mock Data para Producción (ADR 0039)**.
