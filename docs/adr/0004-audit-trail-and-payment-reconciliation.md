# ADR 0004: Control de Cobros por Secretaria y Bitácora Anti-Fraude (Audit Trail)

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
Dado que la Secretaría administra el número oficial de WhatsApp de la escuela donde las familias envían sus capturas y comprobantes de Yape, Efectivo o Transferencia, la Secretaria debe poder registrar y actualizar los pagos en tiempo real. Sin embargo, existía el riesgo de fuga de dinero o inconsistencias si se permitían ediciones arbitrarias de montos sin control.

## Decisión
1. **Registro de Abonos Parciales**: Permitir a la Secretaria registrar abonos (ej. abonar S/ 200 de S/ 297), seleccionando el medio de pago (Yape/Efectivo/Transferencia) e ingresando el N° de Operación o foto del comprobante de WhatsApp.
2. **Inmutabilidad del Precio Original**: El valor total del servicio (precio de la mensualidad) no puede ser alterado ni eliminado por la Secretaria.
3. **Bitácora de Auditoría (Audit Trail)**: Cada abono o actualización de cobro genera automáticamente un registro inalterable con timestamp, usuario, monto, medio de pago y N° de operación.
4. **Validación de Cierre por la Dueña**: La Super Admin (Dueña) cuenta con una vista de conciliación para cotejar el extracto bancario/Yape contra la bitácora de la Secretaria.

## Consecuencias
- Operatividad 100% fluida para la Secretaria desde el WhatsApp oficial.
- Control anti-fraude y cero pérdida de dinero mediante auditoría inmutable.
- Conciliación bancaria rápida para la Dueña.
