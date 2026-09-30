# ADR-0146: Control de Material Escolar / Libros (S/ 67) y Matriz Anual Dinámica con Estados de Culminación

## Estado
Aprobado e Implementado

## Fecha
2026-09-30

## Contexto
En el módulo de Cobros y Abonos (`/admin/facturacion`), la administración (dueña y contador) detectó dos omisiones críticas:
1. **Material Escolar y Libro de Método Vibra (S/ 67.00 PEN)**:
   - No existía una pestaña o vista dedicada para el control de los libros escolares.
   - En la interfaz solo se mostraban tres pestañas: "Recibos Activos", "Matriz Anual 2026" e "Historial de Vouchers Yape".
   - No había visibilidad de quiénes debían el libro (ej. Alumna F.F. con saldo deudor de S/ 67.00), quiénes lo tenían pagado (ej. Alumna C.P.), quiénes estaban exonerados, ni si el libro físico ya había sido entregado en sala de clase o continuaba pendiente de entrega.
2. **Matriz Anual de Control de Pagos 2026 Desactualizada y sin Estados de Culminación**:
   - Al purgar las semillas mock heredadas (ADR-0145), los registros mes a mes (Junio a Diciembre) mostraban guiones vacíos (`—`) porque leían una propiedad estática `annualRecords` desvinculada de la base de datos real.
   - La leyenda de la matriz solo contemplaba tres estados: "Cancelado", "Deudor" y "Parcial", omitiendo a los alumnos que ya culminaron su ciclo contractual de 8 clases (ej. Alumno E.J., Alumna V.A. y Alumna Y.C. con 8/8 clases completadas en Septiembre).

## Decisiones Técnicas

### 1. Pestaña Senior-Friendly Dedicada para Material Escolar y Libros (S/ 67)
- Se añadió la pestaña `📚 Material Escolar / Libros (S/ 67)` con conteo dinámico de alumnos con libro requerido (`activeTab === "utiles"`).
- Se implementaron 5 tarjetas KPI métricas accesibles en tipografía grande y alto contraste:
  1. Alumnos con Libro Requerido.
  2. Total Facturado por Libros (PEN).
  3. Total Recaudado (PEN).
  4. Saldo Pendiente por Cobrar (PEN).
  5. Libros Entregados en Sala vs. Pendientes de Entrega.
- Filtros rápidos por estado (`Todos`, `Pendientes de Pago`, `Pendientes de Entrega`, `Cancelados`, `Exonerados`).
- Botón de toggle interactivo a 1-clic para alternar entre `📦 Entregado en Sala` y `⚠️ Pendiente de Entrega`, persistido inmediatamente en PostgreSQL en `emergency_contact.packUtilesDelivered` vía `updateStudentDetails`.
- Botón de cobro directo `Cobrar Libro` que abre el modal de abono preconfigurado con el saldo del libro, y al registrar el pago actualiza automáticamente `packUtilesStatus`, `packUtilesAmountPaid`, `packUtilesPaid` y `packUtilesDelivered`.
- Botón de WhatsApp integrado para enviar el recordatorio del libro escolar con 1 clic al teléfono del apoderado.

### 2. Matriz Anual Dinámica Conectada a PostgreSQL y Kardex Pedagógico
- Se sustituyó la lectura de `annualRecords` estático por `renderDynamicMonthBadge`:
  - Para cada mes (Junio a Diciembre), se evalúa la fecha de matrícula (`enrollmentDate`) y la vigencia del alumno (`planStartDate`, `planEndDate`). Si el mes es previo al ingreso, se muestra `—` inactivo.
  - Se integra el cálculo dinámico de ciclo pedagógico con `computeStudentRetentionStatus` y `computeStudentCycleSessions`.
  - Si el alumno completó la totalidad de sus clases contratadas (`retention.category === 'culminado'` o cuota de asistencias evaluadas $\ge 8$), la matriz renderiza una insignia distintiva morada: `🎓 Culminado (8/8)`.
  - Para meses activos, se cruza con las facturas reales del alumno en `invoices` para dicho mes:
    - Saldo 0: `✓ Cancelado (S/ XXX)` (Verde esmeralda).
    - Saldo parcial: `⏳ Parcial (S/ XXX)` (Ámbar).
    - Saldo total pendiente: `⚠️ Deudor (S/ XXX)` (Rojo coral).
- Se actualizó la leyenda superior de la Matriz Anual incorporando la insignia oficial `🎓 Culminado (8/8)` junto a Cancelado, Deudor y Parcial.
- Se añadió un indicador visual distintivo en el encabezado de la columna correspondiente al mes lectivo en curso (`Septiembre (Actual)`).

## Consecuencias
- La administración y el contador cuentan con trazabilidad integral del inventario y cobro de libros de método (S/ 67.00), distinguiendo a deudores, pagados y entregas físicas.
- La Matriz Anual 2026 refleja fielmente la realidad financiera y pedagógica de los 13 alumnos activos en producción sin recurrir a datos estáticos.
- 0 errores de TypeScript en `npm run build` y total compatibilidad con las directrices de accesibilidad senior.
