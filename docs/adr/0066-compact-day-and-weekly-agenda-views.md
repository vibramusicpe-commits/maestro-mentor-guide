# ADR 0066: Optimización y Reducción Compacta de la Vista por Día y Rejilla Semanal

## Estado
Aceptado e Implementado

## Contexto
1. En la agenda administrativa (genda-board.tsx), las vistas **Vista por Día** (iewMode: diario) y **Rejilla Semanal** (iewMode: semanal) ocupaban un espacio vertical excesivo:
   - En la Vista por Día, las tarjetas duplicaban innecesariamente el nombre del alumno y el instrumento en dos bloques separados, además de márgenes y alturas mínimas sobredimensionadas (min-h-[90px]).
   - En la Rejilla Semanal, cada franja horaria (ej. 16:00) con múltiples alumnos generaba celdas de más de 280px de alto, requiriendo un scroll vertical prolongado y ralentizando la consulta operativa de secretaría y dirección.
2. **Restricción Explícita de Negocio:** La **Vista Didáctica de Nayeli (1x1 e individual / 2x2 pareado)** se mantuvo 100% intacta e inalterada, ya que cuenta con la disposición y jerarquía oficial requerida por la academia.

## Decisiones Técnicas

### 1. Compactación en Vista por Día (iewMode: diario)
- **Eliminación de Redundancias:** Se suprimió la duplicidad del nombre y del instrumento, consolidando la tarjeta en 2 líneas nítidas:
  - **Línea 1:** Nombre del alumno (ont-black text-[11px] truncate) + Badge de Sala (Sala A) + Distintivos de Recuperación (🔴 Recup), Alumno Nuevo (✨) y Puntito de Categoría de Edad para personalizadas.
  - **Línea 2:** Instrumento (🎵 {instrument}) + Enlace de acción rápida (Editar →).
- **Ajuste de Alturas y Rellenos:**
  - Altura mínima por fila reducida de 90px a 48px.
  - Altura de casilla Disponible ajustada a 40px con padding optimizado.
  - Encabezados de profesores reducidos a py-1.5 px-2.

### 2. Micro-Tarjetas de Alta Densidad en Rejilla Semanal (iewMode: semanal)
- **Formato Micro-Card:**
  - **Línea 1:** Nombre del alumno (	ext-[10.5px] font-black) + Badge de sesión (1ra / 2da) + Badge de sala.
  - **Línea 2:** {instrumento} · Prof. {docente} (	ext-[8.5px] font-semibold).
- **Ajuste de Celdas:**
  - Altura mínima de celda reducida de 5.5rem a 3.2rem.
  - Padding reducido a px-1.5 py-0.5 por tarjeta.
  - Reducción del espacio vertical acumulado en más del **50%**.

## Consecuencias
- Navegación ultra rápida sin scroll excesivo en pantallas de laptops y tablets de recepción.
- Información 100% visible, legible y accesible.
- Vista Didáctica original de Nayeli conservada de forma idéntica.
