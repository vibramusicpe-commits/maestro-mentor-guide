# ADR 0064: Horarios Multi-Mes Continuos, Gestión Total de Familias en Riesgo, Cumpleaños Dinámicos y Bloque Sábado 12:45-13:30

## Estado
Aceptado, Implementado y Auditado en Producción

## Contexto
Durante el uso operativo por Secretaría (Nayeli):
1. Las clases regulares de los alumnos desaparecían al navegar a Septiembre debido a un filtro estático de mes (`lMonth ?? 7`).
2. El panel de "Familias en Riesgo" no permitía modificar deudas, días de mora ni asentar abonos de forma directa desde el Dashboard.
3. El panel de "Cumpleaños" estaba restringido a Agosto y carecía de selector de meses y edición de fechas de nacimiento.
4. Faltaba el bloque horario de 12:45 a 1:30 pm (12:45 - 13:30) exclusivo de los Sábados.
5. El diálogo de registro de alumnos nuevos inicializaba la fecha de inicio fija en Agosto en lugar de admitir Septiembre u otras fechas seleccionadas.

## Decisiones Técnicas

### 1. Horarios Continuos y Recurrentes Multi-Mes (`agenda-board.tsx`)
- Alumnos con vigencia por plan (`planStartMonth` a `planEndMonth`) muestran sus clases en todos los meses que abarca el contrato.
- Alumnos activos en el instituto mantienen su asignación semanal recurrente a través de todos los meses activos.
- Clases de recuperación (`isMakeup`) continúan siendo puntuales para su mes/año programado.

### 2. Edición Completa en 'Familias en Riesgo' (`risk-families-table.tsx`)
- Se implementó un modal de edición reactivo para ajustar saldos, días en mora y estados (`pendiente`, `vencido`, `parcial`, `pagado`).
- Se integró el registro directo de abonos rápidos (Yape, Efectivo, Transferencia) con generación de registro en la bitácora de auditoría.

### 3. Panel de Cumpleaños Dinámico (`birthday-widget.tsx`)
- Selector dinámico de los 12 meses del año.
- Parser multi-formato de fechas de nacimiento.
- Modal de edición en caliente de fecha de cumpleaños y teléfono.

### 4. Bloque Horario de Sábados: 12:45 - 13:30 (`admin-seeds.ts`)
- Se incorporó `"12:45"` a `timeSlotsSaturday`.

### 5. Fecha Dinámica en Registro de Alumnos (`students-table.tsx`)
- `NewStudentDialog` inicializa `planStartDate` con la fecha actual del sistema (`YYYY-MM-DD`) y calcula `planStartMonth`/`planEndMonth` automáticamente.

## Consecuencias
- La secretaría puede planificar y visualizar los horarios de Septiembre en adelante sin pérdida de asignaciones.
- Mayor agilidad en la gestión de morosos y registro de abonos sin salir del Dashboard principal.
