# ADR 0049: Vista Didáctica Pareada, Sala D (Demo) y Filtros Avanzados por Edad y Modalidad

## Estado
Aprobado e Implementado

## Fecha
2026-08-17

## Contexto
En la operación diaria de la academia Vibra Music, Secretaría (Nayeli) y Dirección manejaban originalmente un archivo Excel estructurado en bloques de 2 días apareados (Lunes+Miércoles, Martes+Jueves, Viernes+Sábado) y con 4 salas físicas (Sala A para Jeremy, Sala B para Fernando, Sala C para Nathaly y Sala D para Demos).

La vista didáctica anterior renderizaba únicamente un solo día a la vez mediante pestañas individuales, lo cual impedía ver la continuidad de los planes regulares (2x semana) y no integraba la Sala D ni los filtros por rango de edad o modalidad de día. Adicionalmente, el filtro anterior presentaba un comportamiento en el que aparecían clases de docentes o instrumentos no seleccionados en celdas adyacentes.

## Decisiones de Arquitectura

1. **Renombramiento Oficial de Salas (Sala A..D)**:
   - **Sala A**: Profesor Jeremy (Guitarra y Batería).
   - **Sala B**: Profesor Fernando (Violín y Piano).
   - **Sala C**: Profesora Nathaly (Canto y Piano Infantil).
   - **Sala D**: Sala Demo / Proyección de Contenido por Categoría de Edad (Aforo Máx. 5).

2. **Estructura de la Vista Didáctica de 2 Días Pareados**:
   - Se agruparon los días en 3 bloques navegables:
     * **Par 1 (`L-M`)**: Lunes y Miércoles (Plan Regular).
     * **Par 2 (`M-J`)**: Martes y Jueves (Plan Regular).
     * **Par 3 (`V-S`)**: Viernes y Sábado (Intensivos y Fines de Semana).
   - Cada bloque renderiza dos tablas completas lado a lado (responsive) con su respectivo contador de clases y columnas de docentes.

3. **Corrección del Bug de Filtrado y Nuevos Filtros**:
   - Se corrigió la función `visible` para filtrar estrictamente por Profesor, Sala, Instrumento, Categoría de Edad y Modalidad/Días.
   - Filtro por Categoría de Edad: `JUNIOR` (7 a 12), `JUVENIL` (13 a 17), `ADULTO` (18 a +), `INFANTIL` (5 y 6), `PERSONALIZADA`, `RECUPERACION`.
   - Filtro por Modalidad / Días: `L-M (Regular)`, `M-J (Regular)`, `Vie (Viernes Intensivo)`, `Sáb (Sábado Intensivo)`, `Personalizado`.

4. **Migración Transparente del Store (cadencia-app-v9)**:
   - Se incrementó la versión a `v9` con una función `migrate` que convierte automáticamente cualquier registro existente de `"Sala 1"..."Sala 5"` a `"Sala A"..."Sala D"` sin pérdida de datos en la PC de Nayeli ni de Dirección.

## Consecuencias y Beneficios
- Visualización exacta del formato de trabajo de Nayeli.
- Búsqueda y filtrado estricto sin resultados parásitos.
- Integración completa de la Sala D para las clases demo.
