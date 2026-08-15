# ADR 0022: Solución al Cambio de Mes e Implementación del Timbre Acústico de Fin de Clase

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

1. **Corrección del Cambio de Mes**:
   - En el selector de fechas, el mensaje emergente mostraba un error por evaluar `selectedDate` de forma asíncrona dentro del callback. Se corrigió para actualizar y notificar el cambio de mes inmediatamente sin demoras ni peticiones 404.

2. **Timbre Acústico para Cambios de Clase (Web Audio API)**:
   - La academia cuenta con un parlante vinculado a la computadora principal de recepción. Nayeli deseaba hacer sonar un timbre acústico al finalizar los bloques de clase (4:45 pm, 5:30 pm, etc.).

## Decisiones

1. **Corrección del Manejador de Meses**:
   - Simplificada la evaluación del año y mes actual en `src/components/admin/agenda-board.tsx`.

2. **Timbre Acústico Nativo (`playClassChime`)**:
   - Implementada la función de audio sintético de dos tonos (armónico La5 880Hz y Mi6 1320Hz tipo campana institucional) utilizando la API estándar de navegadores **Web Audio API**.
   - **Ventajas**: No requiere descargar mp3 externos ni depende de servidores. Funciona al 100% en cualquier parlante de PC conectado.
   - Añadido el botón **`🔔 Probar Timbre`** en la cabecera del Horario de Clases para que Nayeli o cualquier miembro pueda probar o activar el timbre manualmente en el parlante.

## Consecuencias
- Cambio de mes instantáneo sin bloqueos.
- La academia cuenta con su timbre oficial de cambio de clases listo para sonar por su parlante vinculado.
