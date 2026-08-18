# ADR 0050: Sistema de Cobros con Evidencia Fotográfica (Yape / Plin) e Importación Masiva

## Estado
Aprobado e Implementado

## Fecha
2026-08-17

## Contexto
En la operación de Vibra Music Perú, la mayoría de familias realiza sus pagos mediante **Yape**, **Plin** o **Transferencias BCP**, enviando los comprobantes digitales a la secretaria (Nayeli) a través de WhatsApp Web.

Anteriormente:
1. La moneda se mostraba como USD en lugar de Soles Peruanos (S/).
2. Solo existía un botón para generar recibos del mes sin capacidad de adjuntar fotos de comprobantes ni número de operación.
3. No existía un historial visual de vouchers para auditar depósitos ni una herramienta de carga masiva de pagos desde Excel.

## Decisiones de Arquitectura

1. **Formateo Monetario en Soles (PEN / S/)**:
   - Corrección en `src/lib/format.ts` para renderizar `currency: "PEN"` (`S/ 329.00`).

2. **Carga y Pegado de Vouchers Fotográficos (`Ctrl+V`)**:
   - Soporte para adjuntar imágenes (JPG, PNG, WEBP) o presionar `Ctrl+V` dentro de los modales de abono para importar directamente la captura copiada desde WhatsApp Web.
   - Las imágenes se persisten en base64 optimizado en el store local.

3. **Galería y Visor de Vouchers en Alta Resolución**:
   - Nueva pestaña "Historial de Vouchers Yape" con tarjetas interactivas de cada comprobante.
   - Modal de inspección en alta definición con metadatos completos: Monto, N° de Operación, Fecha/Hora, Registrado por y Notas.

4. **Importación Masiva de Pagos desde Excel/CSV**:
   - Modal con plantilla descargable `plantilla_pagos_vibra_music.csv`.
   - Conciliación automática de facturas y saldos existentes.

5. **Evolución del Store (Zustand `cadencia-app-v10`)**:
   - Migración de datos sin pérdida, extendiendo `PaymentLog` con `voucherImage`, `paymentTime` y soporte de `Plin`.

## Consecuencias
- Nayeli puede registrar comprobantes en segundos pegando capturas de WhatsApp.
- Dirección cuenta con evidencia fotográfica auditada para cada ingreso.
- Conciliación masiva de cobros rápida mediante archivos Excel/CSV.
