# Reporte de Análisis de Excels Reales — Vibra Music

Se han analizado y convertido exitosamente los 5 archivos Excel reales compartidos por la Secretaría de la academia **Vibra Music**:

| Archivo Excel | Hojas Encontradas | Registros | Datos y Hallazgos Principales |
|---|---|:---:|---|
| `Control Pagos.xlsx` | `Sheet1` | 969 | Control mensual de mensualidades ($297, $252, $197), fechas fijas de pago (ej. día 1 de cada mes), estados (`CANCELADO`, `DEUDOR`), notas de abonos parciales y notas de ajuste de créditos por falta. |
| `Segmentación_de_Clientes Vms.xlsx` | `Base General`, `Importación`, `Librería`, `Segmentación Automática`, `Frecuencia de Mensajes` | 891 | Base maestra de alumnos con apoderados (celulares apoderado 1 y 2), fechas de cumpleaños de alumno y apoderado, segmento (A–D), conteo de clases perdidas (`Nº Clases Perdidas`), banderas de corrimiento de pago y plantillas para campañas de WhatsApp (Cumpleaños 25% desc, videos de avance, retorno). |
| `Registro de Asistencia - Escuela.xlsx` | `Febrero`, `Enero`, etc. | 245 por mes | Control detallado por fecha, hora de llegada, hora de salida, alumno, apoderado, profesor, curso (Piano Infantil, Violín, Canto) y observaciones. |
| `Registro_Ventas_Compras.xlsx` | `Ventas_25`, `Compras_25` | 1,186 / 1,000 | **Ventas**: Comprobantes, DNI, apoderado, alumno, curso, precio ($297, $252), medio de pago (Yape/Efectivo/Transferencia).<br>**Compras (Egresos)**: Proveedores, concepto, IGV y valores de compra (Confirmando privacidad restringida para Staff). |
| `CLASE DEMO REGISTRO.xlsx` | `Respuestas de formulario 1` | 19 | Registro de solicitudes de clases de prueba (demo) con marca temporal, nombre, teléfono, email, curso (Violín Junior/Juvenil) y estado atendido. |

---

## Estructuras Clave Extraídas para el Modelo de Datos

### 1. Control de Pagos y Vencimientos (`Control Pagos.xlsx`)
- **Día de Pago**: Las familias tienen asignado un día del mes (ejemplo: **Día 1**, **Día 15**).
- **Aviso Preventivo a 2 Días**: La Secretaría notifica cuando restan 2 días para la fecha fija de pago asignada.
- **Medios de Pago**: Yape, Efectivo en caja o Transferencia bancaria.
- **Monto de Mensualidad**: S/ 297 (Regular estándar), S/ 252 (Descuento hermanos/promoción), S/ 197.

### 2. Segmentación y Campañas (`Segmentación_de_Clientes Vms.xlsx`)
- **Datos de Apoderados**: Apoderado 1 (Nombre, Celular) y Apoderado 2 (Nombre, Celular).
- **Cumpleaños Alumno / Apoderado**: Fecha con mes para disparo automático de cupón de 25% de descuento en el mes del cumpleaños.
- **Clases Perdidas / Créditos**: Campo de seguimiento directo para descontar o sumar días de recuperación.

---

## Archivos Convertidos a CSV
Se han generado copias limpias en formato CSV listas para importar en la carpeta:
`C:\Users\USER\my music staff\docs\converted_csv\`

1. `Control_Pagos__Sheet1.csv`
2. `Segmentaci_n_de_Clientes_Vms__Base_General.csv`
3. `Segmentaci_n_de_Clientes_Vms__Librer_a.csv`
4. `Registro_de_Asistencia_-_Escuela__Febrero.csv`
5. `Registro_Ventas_Compras__Ventas___.csv`
6. `Registro_Ventas_Compras__Compras___.csv`
7. `CLASE_DEMO_REGISTRO__Respuestas_de_formulario_1.csv`
