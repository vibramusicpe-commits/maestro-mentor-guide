# ADR 0093: Reportes Maestros de Clientes, Depuración Segura 2026, Clases Demo de Claudia y Expansión del Autopiloto

## Estado
Aceptado e Implementado

## Fecha
2026-09-15

## Contexto
Dirección General y Marketing (Fabricio) identificaron cuatro necesidades operativas críticas en el entorno de producción de Vibra Music Staff:
1. **Reporte Maestro Oficial de Clientes (Alumnos)**: Ausencia de una vista centralizada, enumerada correlativamente (1 a N), accesible exclusivamente para Dirección, Secretaría y Marketing (restringida a profesores y familias). Debe consolidar matrícula, saldos deudores en Soles (PEN) calculados en vivo desde `invoices`, asignación de cursos, horarios semanales, porcentaje de asistencia e indicadores superiores (KPIs), con exportación directa a Excel.
2. **Depuración Quirúrgica de la Base de Datos Histórica (2026)**: La base de datos inicial proveniente del Excel de Nayeli contiene registros y asistencias desactualizadas o incompletas. La dirección solicitó pausar a los alumnos antiguos sin eliminar registros en PostgreSQL para preservar historiales, notas y pagos pasados, proveyendo un panel para reactivar alumnos uno por uno con asignación de horario, profesor y asistencia mapeada, o mediante un importador de Excel limpio con cruce automático (auto-match) y plantilla descargable.
3. **Módulo Especializado de Clases Demo (Directora Claudia)**: La Directora Claudia no dicta clases regulares de planta; dicta exclusivamente las clases demostrativas a partir de las 4:00 p.m. (16:00 h). Se requería una sección dedicada (`/admin/demos`) para registrar prospectos sin matricularlos prematuramente, y permitir matricularlos oficialmente con 1 clic asignando a un profesor regular de planta (**Jeremy**, **Fernando** o **Nathaly**).
4. **Expansión del Tour Autopiloto en Vivo**: Incorporación de los nuevos módulos al recorrido guiado en vivo para capacitación rápida del equipo.

## Decisiones Técnicas

### 1. Módulo de Reportes Maestros (`src/routes/admin.reportes.tsx`)
- **Acceso Restringido**: Enrutado bajo el layout `/admin` que protege contra accesos de profesores (`/teacher`) y familias (`/family`).
- **5 Tarjetas KPI Superiores**:
  - Alumnos Activos (con porcentaje sobre la matrícula total).
  - Alumnos en Pausa / Baja.
  - Asistencia Promedio Global.
  - Deuda Total Acumulada en Soles (PEN).
  - Alumnos al Día vs. Alumnos en Mora.
- **Tabla Enumerada Correlativa (1 a N)**:
  - Enumeración correlativa estricta (`# 1, 2, 3... N`).
  - Nombre del alumno y apoderado.
  - Estado (`ACTIVO`, `PAUSA`, `BAJA`).
  - Deuda en Soles calculada en tiempo real comparando facturas pendientes de la familia/alumno.
  - Horario semanal consolidado extraído de `schedule`.
  - Profesor asignado y porcentaje de asistencia.
  - Enlace rápido de contacto directo por WhatsApp.
- **Exportador a Excel (.CSV con UTF-8 BOM)**:
  - Inyección de cabecera `\uFEFF` para compatibilidad nativa con acentos y caracteres latinos en Microsoft Excel.

### 2. Panel de Saneamiento y Reactivación (`src/components/admin/student-cleanup-panel.tsx`)
- **Pestaña 1: Activación 1 a 1**:
  - Búsqueda en vivo entre alumnos inactivos o en pausa.
  - Selector rápido de asistencia mapeada inicial (100%, 90%, 85%, 80%, 75% o valor numérico personalizado) para resolver incoherencias históricas.
  - Asignación de horario semanal (días pareados Lun-Mié o Mar-Jue, hora, sala y profesor).
  - Activación inmediata sin pérdida de historiales ni facturas.
- **Pestaña 2: Importación de Excel Limpio con Auto-Match**:
  - Descarga de plantilla CSV oficial con estructura: `Nombre Alumno;Familia;Celular WhatsApp;Instrumento;Profesor;Horario;% Asistencia`.
  - Procesador inteligente: si el alumno ya existe en PostgreSQL, reactiva y actualiza su horario y asistencia; si es un nuevo alumno, lo inserta como activo.
- **Pestaña 3: Pausa Masiva de Seguridad**:
  - Requiere escribir la frase de confirmación `"PAUSAR BASE 2026"` para evitar clics accidentales.
  - Pasa a los alumnos históricos a estado `pausa` liberando cupos en el horario sin borrar registros de la base de datos.
- **Integración**: Conectado directamente en `src/routes/admin.alumnos.tsx` mediante el botón `"🧹 Depuración & Reactivación 2026"`.

### 3. Módulo de Clases Demo con Claudia (`src/routes/admin.demos.tsx`)
- **Regla Institucional de Roles**: La Directora Claudia dicta exclusivamente las clases demostrativas a partir de las 16:00 h.
- **Pipeline de Estados de Prospectos**:
  - `pendiente` (Por Confirmar)
  - `confirmada` (Confirmada con la familia)
  - `asistio` (Asistió a la clase demo con Claudia)
  - `matriculado` (Inscrito oficialmente como alumno activo)
  - `cancelada` (Cancelada / No asistió)
- **Contacto WhatsApp Inmediato**:
  - Botón que abre WhatsApp Web con mensaje personalizado pre-cargado confirmando fecha, hora y ubicación en la sede Miraflores con Claudia.
- **Botón Estrella: "✓ Inscribir Oficialmente como Alumno Activo"**:
  - Convierte un lead de demo en alumno regular en 1 clic.
  - Pre-carga los datos del alumno y apoderado.
  - Permite seleccionar el docente regular de planta (**Jeremy**, **Fernando**, **Nathaly**), horario semanal (días pareados automáticos), plan y categoría de edad.
  - Registra al alumno en `adminStudents` (PostgreSQL `students`), programa sus lecciones en `schedule` y actualiza el lead en `demo_requests` a estado `matriculado`.

### 4. Expansión del Tour Autopiloto en Vivo (`src/store/autopilot-store.ts` y `src/components/admin/autopilot-tour-overlay.tsx`)
- Ampliación de 7 a 9 pasos cubriendo:
  - Paso 7: Reporte Maestro de Alumnos y Clientes (`/admin/reportes`).
  - Paso 8: Clases Demo con Directora Claudia y Matrícula Oficial (`/admin/demos`).
  - Paso 9: Monitoreo Docente en Sede en Vivo (`/admin`).

## Consecuencias y Beneficios
- **Cero Pérdida de Datos**: Ningún dato de Nayeli se borra de PostgreSQL; todo se preserva de forma auditable.
- **Control Financiero y Académico Preciso**: Dirección y Marketing cuentan con KPIs reales de alumnos activos, morosidad acumulada en PEN y asistencia promedio.
- **Eficiencia en Captación**: Las clases demo se convierten en matrículas oficiales en segundos sin doble digitación ni inconsistencias de agenda.
- **Compilación Limpia**: Código 100% tipado en TypeScript verificado con `npm run build` (código de salida 0).
