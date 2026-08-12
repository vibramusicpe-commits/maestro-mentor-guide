# ADR 0002: Modelo de Datos Basado en Archivos Excel Reales

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
El análisis de los 5 archivos Excel operativos de Vibra Music (`Control Pagos.xlsx`, `Segmentación_de_Clientes Vms.xlsx`, `Registro de Asistencia - Escuela.xlsx`, `Registro_Ventas_Compras.xlsx`, `CLASE DEMO REGISTRO.xlsx`) reveló requerimientos específicos que no estaban en un esquema genérico de academia.

## Decisión
Incorporar en los esquemas de Zustand y componentes de React:
1. **Modalidades de Clase**: `Regular (8 clases / 45 min)` y `Intensivo (4 clases / 90 min)`.
2. **Sistema de Créditos por Falta**: Suma de +1 crédito al faltar y consumo de -1 crédito al recuperar.
3. **Contactos de Emergencia y Cumpleaños**: Incorporar apoderados secundario/emergencia, fecha de cumpleaños de alumno/apoderado y disparo de plantilla festiva con 25% de descuento.
4. **Notificaciones de Vencimiento a 2 Días**: Identificar recibos con `daysToDue <= 2` para alertas preventivas por WhatsApp/Email.
5. **Canales de Abono**: Clasificación de cobros por `Yape`, `Efectivo` o `Transferencia`.

## Consecuencias
- Un frontend 100% fiel a la operativa diaria reportada por la Secretaria.
- Esquemas de tipos listos para generar la base de datos PostgreSQL en el backend futuro.
