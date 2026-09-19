# ADR 0109: Blindaje Backend para Migración 1 a 1 y Auto-Aprovisionamiento de Recibos

## Estado
Aprobado (v2.0.3) — 19 de Septiembre, 2026

## Contexto
1. **Migración Manual 1 a 1 de Alumnos a la Base Activa**:
   - La escuela cuenta con alumnos en la base de datos de PostgreSQL clasificados en `pausa` (60) y `baja` (22), manteniendo únicamente a los alumnos activos reales verificados (`Emma Micaela Sevilla Perez`, `Camila Pastor Conco`).
   - Al comenzar el proceso operativo de migración 1 a 1 mediante el panel de **Depuración & Reactivación 2026** (`StudentCleanupPanel`) o matriculando nuevos alumnos (`addNewStudent`), se requería garantizar que todos los módulos del backend y frontend permanezcan 100% interconectados sin fisuras de persistencia.

2. **Riesgos Críticos Identificados en la Auditoría Quirúrgica del Backend**:
   - **Pérdida de Recibos en Recarga**: Al matricular un nuevo alumno (`addNewStudent`), el recibo se creaba en memoria Zustand, pero no se persistía en la tabla `invoices` de PostgreSQL. Al recargar la página (`F5`), `useInsforgeSync` consultaba la base de datos y sobrescribía `invoices`, provocando la desaparición del recibo del alumno recién registrado.
   - **Ausencia de Recibo al Reactivar Alumno 1 a 1**: Al cambiar el estado de un alumno histórico a `activo` (`setStudentStatus`), el alumno ingresaba al horario y directorio, pero no tenía recibo asociado en `/admin/facturacion` para que la secretaría pudiera registrar sus abonos o vouchers.
   - **Valores Hardcodeados en Abonos (`S/ 297`)**: `backgroundSyncPaymentToDB` llamaba a `registerPayment` enviando un objeto de recibo prefijado en `{ amount: 297, amount_paid: 0, remaining_balance: 297 }`. Esto provocaba que abonos sucesivos (como el segundo abono de Camila Pastor de S/ 61 tras un primer abono de S/ 200) o planes promocionales no pudieran validarse con precisión matemática en la tabla `payment_audit_logs`.
   - **Mapeo de Nombre de Alumno en Facturas**: `mapDBInvoiceToInvoice` utilizaba el nombre del apoderado (`primary_guardian_name`) como fallback para el campo `student`, generando desalineaciones visuales en los recibos cuando el nombre del alumno figuraba en el concepto.

## Decisiones Técnicas

1. **Auto-Aprovisionamiento de Recibos y Familias (`backgroundCreateInvoiceInDB` en `src/store/app-store.ts`)**:
   - Implementada función que:
     a) Verifica y asegura la existencia de la familia en `families`.
     b) Inserta el recibo formal en la tabla `invoices` de PostgreSQL con su UUID canónico, concepto, monto contratado, saldo restante y estado inicial (`pendiente`, `parcial`, `pagado`).
     c) Si el alumno ingresó con un abono inicial (`amountPaid > 0`), inserta simultáneamente la fila en `payment_audit_logs` con su comprobante de auditoría.
   - Integrada tanto en la matrícula de nuevos alumnos (`addNewStudent`) como en la reactivación de alumnos existentes (`setStudentStatus` a `activo`) cuando no cuenten con un recibo activo previo.

2. **Sincronización Dinámica de Abonos (`backgroundSyncPaymentToDB`)**:
   - Ahora recibe el objeto matemático real del recibo (`amount`, `amount_paid`, `remaining_balance`) obtenido directamente desde la instancia activa de `invoices`.
   - Integrado en `recordPaymentAbono` y `recordNewDirectAbono`, asegurando que `registerPayment` en `invoices.service.ts` calcule con total fidelidad el nuevo saldo remanente y actualice `payment_audit_logs`.

3. **Fusión Resiliente en Hidratación (`hydrateFromBackend`)**:
   - Modificado el retorno de hidratación para no descartar recibos de alumnos activos que hayan sido creados localmente y se encuentren en vuelo hacia PostgreSQL antes del siguiente ciclo de lectura.

4. **Extracción Prioritaria de Alumno desde Concepto (`mapDBInvoiceToInvoice` en `src/lib/services/invoices.service.ts`)**:
   - Si el concepto sigue la convención estándar `Plan ... — Nombre del Alumno`, el nombre se extrae directamente para poblar el atributo `student`, preservando a la vez los datos de contacto de la familia.

## Consecuencias
- La secretaría y dirección pueden reactivar o matricular alumnos 1 a 1 con total certeza de persistencia en PostgreSQL (`students`, `families`, `invoices`, `payment_audit_logs`, `attendance_logs`).
- Cero pérdida de recibos al recargar el navegador (`F5`).
- Paridad matemática absoluta entre lo cobrado, los saldos pendientes y los comprobantes bancarios registrados.
