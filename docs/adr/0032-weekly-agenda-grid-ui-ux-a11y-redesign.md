# ADR 0032: Rediseño Ergonómico de la Rejilla Semanal (UI/UX & A11y) con Bloques Lunes-Viernes y Sábados

- **Estado**: Aceptado
- **Fecha**: 2026-08-13
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
1. **Problema de Maquetación y Descuadre**:
   - En la vista de "Rejilla Semanal" de la Agenda (`/admin/agenda`), los horarios de Lunes a Viernes (Tarde: 16:00 a 19:45) compartían la misma tabla con los Sábados (Mañana: 09:00 a 13:30). Esto creaba un espacio vacío enorme e innecesario de 09:00 a 16:00 de L-V y descuadraba visualmente las celdas en pantallas medianas y móviles.
2. **Requisitos de Accesibilidad (a11y)**:
   - Las tarjetas de clase necesitaban atributos `aria-label` descriptivos (`Clase de {alumno}, {instrumento}, {profesor}, {sala}`).
   - Los botones de clase necesitaban soporte de foco accesible (`focus:ring-2 focus:ring-primary`) y tamaños de objetivo táctil cómodos.

## Decisiones
1. En `src/components/admin/agenda-board.tsx`:
   - Se estructuró la Rejilla Semanal en **dos bloques limpios y armónicos**:
     1. **Turno Tarde · Lunes a Viernes (16:00 a 19:45)**: 5 columnas fijas de días con cabecera de horario y tarjetas de 45 minutos.
     2. **Turno Mañana · Sábados (09:00 a 13:30)**: Matriz horizontal optimizada para la jornada sabatina intensiva.
   - Cada tarjeta incluye: Nombre del alumno en negrita, instrumento, sala destacada, profesor asignado y alerta de colisión en tiempo real.
   - Se añadieron `aria-label` y estilos de interacción accesibles para navegación por teclado y lectores de pantalla.

## Consecuencias
- Cero espacios en blanco innecesarios o desalineados.
- Navegación visual fluida tanto en computadoras de escritorio como en tablets y móviles.
