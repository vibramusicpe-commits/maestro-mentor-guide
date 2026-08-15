# ADR 0010: Ocultamiento de Montos en Nómina del Profesor y Didáctica en Agenda

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

Por requerimiento de dirección, la interfaz de **Nómina del Profesor** (`/teacher/nomina`) no debe exhibir tarifas por clase (`S/ 18`), montos totales (`S/ 1,386`) ni desgloses financieros semanales. Su función es actuar como un **Registro Transparente de Horas Impartidas y Clases Auditadas**, manteniendo la privacidad de la política salarial.

Asimismo, la **Agenda del Profesor** (`/teacher/agenda`) debía ser interactiva y útil para la didáctica diaria.

## Decisiones

1. **Remoción de Dinero en Nómina del Profesor (`teacher.nomina.tsx`)**:
   - Reemplazada la tarjeta de `Total Estimado (S/ 1,386)` por **"Horas Impartidas del Mes"** (cálculo de horas netas enseñadas).
   - Reemplazados los montos por semana (`S/ 396`) por estados de auditoría contable (**"Auditado"** vs **"Pendiente"**).
   - Se mantiene el conteo exacto de clases impartidas y cancelaciones.

2. **Didáctica en la Agenda del Profesor (`MinimalAgendaCalendar`)**:
   - Añadidos **Acciones Rápidas de Asistencia (`✓ Presente` / `✗ Ausente`)** directamente en las tarjetas de la agenda semanal.
   - Al marcar asistencia desde la agenda, el estado se sincroniza al instante con el Kiosco y la Torre de Control.

## Consecuencias
- Cero exposición de montos o precios en el dispositivo del profesor.
- Experiencia de uso ágil y didáctica para la gestión del aula desde la agenda.
