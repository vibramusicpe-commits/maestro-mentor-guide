# ADR 0104: Gestión de Libro / Pack Útiles Anual (S/ 67), Prorrateo, Métodos de Pago y Flexibilidad Horaria

## Estado
Aprobado (v1.9.3) — 17 de Septiembre, 2026

## Contexto
1. **Seguimiento Financiero del Libro / Pack Útiles**:
   - El pack de útiles y libro oficial tiene un costo de **S/ 67** (configurable).
   - Muchos alumnos no cancelan el libro de forma inmediata o prorratean el pago (ej. abonan S/ 30 junto con su mensualidad de S/ 297 y dejan pendiente un saldo de S/ 37 para la siguiente sesión).
   - La plataforma requería campos específicos para registrar costo total, monto abonado, saldo deudor, estado (pendiente, cancelado, prorrateado, exonerado) y entrega física.
2. **Distinción entre Fecha de Matrícula y Fecha de Inicio de Clases**:
   - La fecha en que el alumno formaliza su inscripción (`enrollmentDate`) puede ser previa o distinta al día en que efectivamente asiste a su primera clase (`planStartDate`).
   - Se requería desacoplar ambos campos en la ficha del alumno para no generar discrepancias en la agenda ni en el cálculo de vigencias.
3. **Diversificación de Canales de Cobro**:
   - Se requería selector desplegable interactivo para métodos de pago: Yape / Plin, Tarjeta de Débito, Tarjeta de Crédito y Efectivo.
4. **Opción Personalizada de Intensivo en Jueves**:
   - El plan Intensivo opera habitualmente los viernes y sábados (sesiones dobles de 90 minutos).
   - Se requería habilitar el día **Jueves** como opción personalizada para alumnos de plan Intensivo que requieran dicha flexibilidad por disponibilidad de salas y docentes.

## Decisiones Técnicas
1. **Persistencia de Libro en JSONB (`emergency_contact`)**:
   - Se introdujeron los atributos `packUtilesCost`, `packUtilesAmountPaid`, `packUtilesStatus`, `packUtilesDelivered` y `packUtilesNotes`.
   - Se generó el badge visual dinámico que calcula el saldo exacto adeudado: `Debe S/ (Cost - Paid) (Abonó S/ Paid)`.
2. **Desacoplamiento de Fechas**:
   - `enrollmentDate` almacena la fecha de firma/registro administrativo.
   - `planStartDate` y `planEndDate` controlan la visibilidad activa del alumno en el calendario semanal de `agenda-board.tsx`.
3. **Mapeo de Métodos de Pago y Soporte de Jueves en Intensivo**:
   - Soporte para métodos de cobro en `paymentMethod` y en la emisión de recibos.
   - Habilitación del día Jueves en la selección de horarios intensivos sin alterar la coherencia lógica de las salas ni los reportes docentes.

## Consecuencias
- Mayor precisión financiera en secretaría para el control de inventario de libros y cobro de saldos adeudados.
- Claridad contractual al diferenciar inscripción de primera clase.
- Flexibilidad operativa para los alumnos intensivos de los días jueves.
