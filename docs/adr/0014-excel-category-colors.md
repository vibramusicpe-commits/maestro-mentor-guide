# ADR 0014: Integración del Sistema de Colores por Categoría del Excel de Nayeli

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

Nayeli (Secretaria) utilizaba un cuadro en Excel organizado por colores exactos para identificar la edad y tipo de grupo de los alumnos (*Junior, Juvenil, Adulto, Infantil, Recuperaciones*). La vista diaria necesitaba incorporar esta distinción cromática para facilitar su trabajo de empaquetamiento visual de clases.

## Decisiones

1. **Definición de Categorías Cromáticas del Excel**:
   - 💛 **CATEGORÍA JUNIOR** (`#FFF2B2`): Amarillo pastel para alumnos niños/júnior.
   - 💚 **CATEGORÍA JUVENIL** (`#4CAF50`): Verde brillante para adolescentes/juvenil.
   - 🩶 **CATEGORÍA ADULTO** (`#9E9E9E`): Gris neutral para adultos.
   - 💜 **CATEGORÍA INFANTIL** (`#B388FF`): Púrpura pastel para la etapa infantil inicial.
   - 🔴 **RECUPERACIÓN DE CLASES** (`#FF8A80`): Rojo rosado suave para clases recuperadas por faltas.

2. **Visualización Didáctica por Día**:
   - En la vista **`📱 Vista por Día (Swipe)`**, las tarjetas de los alumnos toman el color exacto de su categoría.
   - Se añadió una **Barra de Leyenda de Colores** en la cabecera del Horario de Clases.

## Consecuencias
- La Secretaria identifica la edad y categoría de cada grupo al primer golpe de vista, exactamente igual a su Excel pero con la agilidad digital de Cadencia.
