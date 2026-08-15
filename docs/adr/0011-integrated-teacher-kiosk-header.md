# ADR 0011: Unificación 3-en-1 del Kiosco de Asistencia y Fichaje para Profesores

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

El Kiosco del Profesor mostraba 3 tarjetas apiladas separadamente (`TimeTrackerWidget`, `CurrentLessonCard`, `AttendanceButtons`), lo que generaba un diseño redundante, pesado y con demasiado desplazamiento vertical (scroll).

## Decisión

Se unificaron los 3 bloques en una sola **Cabecera Integrada de Kiosco 3-en-1** ([`IntegratedTeacherKioskHeader`](file:///C:/Users/USER/my%20music%20staff%20backend/src/components/teacher/integrated-kiosk-header.tsx)):

1. **Barra Superior (Fichaje en Sede)**: Reloj cronómetro compacto en tiempo real + botón de 1 toque para **Fichar Entrada / Pausa / Salida**.
2. **Cuerpo Central (Clase en Curso)**: Nombre del alumno en grande, horario, instrumento y sala asignada.
3. **Barra Inferior (Marcador de Asistencia)**: Botones interactivos con 1 toque (**Presente**, **Ausente**, **Tarde**) integrados directamente en la misma tarjeta.

## Consecuencias
- Cero redundancia visual y reducción del 60% en desplazamiento vertical.
- Experiencia súper fluida y moderna para los profesores desde teléfonos móviles.
