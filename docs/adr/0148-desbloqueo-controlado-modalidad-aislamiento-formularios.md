# ADR-0148: Desbloqueo Controlado de Modalidad y Aislamiento de Formularios de Matrícula

## Estado
Aprobado e Implementado

## Fecha
2026-09-30

## Contexto
Al registrar un alumno con "Paquete Flexible" (ej. Aaron) y posteriormente intentar matricular a otro alumno (ej. Kiara) en "Plan Regular", el diálogo de matrícula retenía en memoria el estado previo de modalidad flexible, impidiendo cambiar o guardar la modalidad regular correcta. Del mismo modo, en `ScheduleStudentForm` y `EditStudentSheetInner` el candado de modalidad bloqueaba la reconfiguración cuando se requería una corrección administrativa legítima.

## Decisión
1. **Reseteo Atómico de Formularios (`resetForm`)**:
   En `AddNewStudentDialog`, invocar `resetForm()` al abrir y cerrar el modal para garantizar que cada nuevo alumno comience con el estado predeterminado limpio (`modality: "Regular (8 clases / 45 min)"`), eliminando la contaminación cruzada entre formularios.
2. **Candado Interactivo de Desbloqueo Controlado**:
   Implementar el botón toggle `[🔒 Desbloquear para Cambiar]` / `[🔓 Modalidad Desbloqueada]` tanto en `ScheduleStudentForm` como en `EditStudentSheetInner`.
3. **Universalización de Prioridad de Makeups en Paquetes Flexibles**:
   Garantizar que las recuperaciones puntuales (`isMakeup: true`) aisladas por `dateStr` en `excludedDates` coexistan y tengan prioridad sobre lecciones recurrentes sin recortar la cuota total de sesiones contratadas (`packageTotalSessions`).

## Consecuencias
- El registro de nuevos alumnos es completamente aislado e independiente.
- Las secretarías pueden corregir modalidades con el botón de desbloqueo explícito sin recurrir a manipulaciones manuales en base de datos.
