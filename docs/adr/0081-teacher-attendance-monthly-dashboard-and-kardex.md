# ADR 0081: Dashboard Mensual de Asistencia Docente, Kardex Histórico y Monitoreo en Vivo

## Estado
Aprobado e Implementado

## Fecha
2026-09-09

## Contexto
Los profesores de Vibra Music (iniciando por Nathaly — Canto y Piano) utilizan el Quiosco Docente para registrar su ingreso ("En Sede") y salida de clases ("Turno Finalizado").
Sin embargo, en el panel administrativo (`/admin/control-horario`), la vista anterior únicamente mostraba turnos activos (`status !== 'finalizado'`). Por tanto, en cuanto una profesora marcaba su salida tras cumplir su jornada, su registro desaparecía inmediatamente de la pantalla.
Además:
1. No existía un kardex histórico mensual donde la Dirección (Dueña / Sergio) o Secretaría (Nayeli) pudieran auditar qué días asistió cada docente en el mes seleccionado.
2. El ítem del menú lateral figuraba con el nombre ambiguo "Control Horario", generando dudas sobre dónde supervisar la asistencia docente.
3. Se requería una herramienta para conciliar la nómina mensual y exportar un reporte oficial en formato Excel (.CSV) con el desglose cronológico de cada turno, descansos y horas netas trabajadas.

---

## Decisiones Técnicas Adoptadas

### 1. Kardex Histórico Mensual en `time-tracking.service.ts`
- Implementación de `getTeacherTimeLogs(params)` con filtros por fecha de inicio, fin y profesor.
- Implementación de `computeTeacherMonthlySummary(shifts, activeShifts)` para calcular métricas acumuladas por docente: total de turnos, minutos/horas trabajadas, último registro y estado de presencia en tiempo real.
- Función `exportDetailedAttendanceCSV` para exportar a Excel con codificación UTF-8 BOM, incluyendo Fecha, Profesor, Entrada, Salida, Minutos de Refrigerio, Horas Netas y Estado.

### 2. Rediseño Quirúrgico de la Ruta `/admin/control-horario`
- Se estructuró la página en 3 vistas operativas:
  - **Pestaña 1: Kardex Mensual de Profesores**: Selector de mes y año (2026), filtro por profesor (Nathaly, Jeremy, Fernando, Demo), 4 tarjetas KPI (Horas acumuladas, días asistidos, docentes en sede, promedio por turno), cuadrícula de resumen individual por profesor, y tabla cronológica detallada con badge de estado y opción de forzar cierre de turno abierto.
  - **Pestaña 2: Profesores en Sede en Vivo**: Vista de monitoreo en tiempo real con contador pulsante de presencia y botón de salida administrativo.
  - **Pestaña 3: Cierre de Nómina & Horas**: Reporte consolidado mensual con totales para liquidación de honorarios.

### 3. Navegación y Descubrimiento Directo
- En `src/routes/admin.tsx`: Se renombró el ítem de navegación a **"Asistencia Docente"** con el ícono representativo `UserCheck`.
- En `src/routes/admin.index.tsx`: Se integró el widget `TeacherAttendanceWidget` en el dashboard principal de administración, mostrando en tiempo real los docentes presentes en la academia y un acceso directo con el botón `"Ver Asistencias del Mes →"`.

---

## Verificación de Resultados
- **Registro Real de Nathaly:** Se auditó y visualizó el turno real de Nathaly (`id: 647fd9d3-51cb-4df0-9136-dea9eed334b7`) en `teacher_time_logs` dentro del mes de Septiembre 2026.
- **Filtros Dinámicos:** Selector mensual y selector por profesor funcionando fluidamente sin recargas completas de página.
- **Exportación:** Generación exitosa de reportes CSV compatibles con Microsoft Excel.
- **Compilación de Producción:** `npm run build` ejecutado exitosamente con 0 errores de TypeScript y Nitro SSR.
