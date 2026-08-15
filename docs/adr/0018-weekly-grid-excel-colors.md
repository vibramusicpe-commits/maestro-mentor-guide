# ADR 0018: Aplicación Unificada de Colores del Excel en la Rejilla Semanal

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

En la vista **`🗓️ Rejilla Semanal`** de Horario de Clases, los bloques de las clases aún se estaban pintando con los estilos genéricos antiguos por instrumento en lugar de usar la paleta de colores por categoría cromática del Excel (*Junior, Juvenil, Adulto, Infantil, Recuperación, Personalizadas*).

## Decisiones

1. **Estandarización Unificada de Colores**:
   - Se reemplazó la función genérica `toneFor(instrument)` por el mapeo directo a `categoryStyles` en los botones de la rejilla semanal.
   - Ahora, tanto en la **`📱 Vista por Día (Swipe)`** como en la **`🗓️ Rejilla Semanal`**, las tarjetas adoptan exactamente los mismos colores del Excel:
     - 💛 **CATEGORÍA JUNIOR** (Amarillo)
     - 💚 **CATEGORÍA JUVENIL** (Verde)
     - 🩶 **CATEGORÍA ADULTO** (Gris)
     - 💜 **CATEGORÍA INFANTIL** (Púrpura)
     - 🔴 **RECUPERACIÓN DE CLASES** (Rojo)
     - 🩵 **CLASES PERSONALIZADAS** (Celeste)

2. **Barra de Leyenda en Ambas Vistas**:
   - La rejilla semanal ahora también incluye la **Barra de Leyenda Explicativa** en la parte superior.

## Consecuencias
- Coherencia visual 100% garantizada en todos los ángulos de visualización del horario.
