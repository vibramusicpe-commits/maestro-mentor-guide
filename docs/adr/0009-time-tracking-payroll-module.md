# ADR 0009: Control Horario de Profesores y Cierre de Horas para Nómina

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

Vibra Music utilizaba la aplicación externa **Bixpe** para el marcaje de entrada y salida de los profesores. Tener el control horario fuera del sistema generaba doble trabajo y dificultaba el cálculo exacto de la nómina.

## Decisión

Se integra un módulo nativo de **Control Horario (Time Tracking)** dentro de Cadencia:

1. **Base de Datos & Insforge (`005_time_tracking_payroll.sql`)**:
   - Tabla `teacher_time_logs`: Registro de `clock_in`, `clock_out`, `break_minutes` y la columna generada en Postgres `total_minutes_worked`.
   - Tabla `payroll_closings`: Registro inmutable de cierres de periodo auditados por la administración.
   - Función RPC `generate_payroll_hours_report()`: Agrupa las horas netas trabajadas por cada profesor en el periodo seleccionado y bloquea los registros para evitar alteraciones.

2. **Kiosco Móvil del Profesor (`TimeTrackerWidget`)**:
   - Widget interactivo en el Kiosco del Profesor con botones: **Marcar Entrada** / **Pausa** / **Marcar Salida**.
   - Cronómetro en vivo que registra el tiempo exacto en la sede.

3. **Panel de Administración (`/admin/control-horario`)**:
   - Monitor en vivo de profesores en sede.
   - Generación del Cierre de Periodo con **Exportación Directa a Excel (`.CSV`)**.

## Consecuencias
- Eliminación del costo y dependencia de la app externa Bixpe.
- Transparencia total de horas para el cálculo de la nómina por parte de la Dueña y la Secretaria.
