# ADR 0052: Autonomía Operativa de Secretaría en Gestión de Horarios y Eliminación Directa

## Estado
Aceptado / Implementado en Producción

## Contexto y Puntos de Dolor
En la prueba operativa de Secretaría (Nayeli), se identificó que el sistema bloqueaba la eliminación de clases mal digitadas requiriendo aprobación previa de Dirección. Dirección autorizó la autonomía total de Secretaría para la gestión diaria de horarios y fechas de pago.

## Decisiones de Diseño
1. **Eliminación Directa:** Secretaría puede eliminar sesiones erróneas del horario sin generar créditos ni trámites burocráticos.
2. **Edición en Caliente:** Nombre del alumno, profesor, sala e instrumento son editables directamente desde el panel lateral.
3. **Regla de Cumplimiento (8 / 4 Clases):** Toda falta genera automáticamente 1 crédito de recuperación para garantizar que el alumno cumpla sus 8 clases mensuales (Regular) o 4 (Intensivo).

## Consecuencias
- Operación 100% fluida en recepción.
- Trazabilidad y auditoría completa en logs del sistema.
