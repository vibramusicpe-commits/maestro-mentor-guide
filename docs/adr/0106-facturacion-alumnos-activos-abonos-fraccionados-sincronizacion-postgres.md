# ADR 0106: Gestión Quirúrgica de Cobros, Abonos y Facturación Vinculada Exclusivamente a Alumnos Activos

## Estado
Aprobado (v2.0.0) — 18 de Septiembre, 2026

## Contexto
1. **Contaminación de Recibos Históricos y Falsos Positivos en Facturación**:
   - El módulo `/admin/facturacion` ("Cobros y Abonos") mostraba 83 recibos antiguos de una base anterior dada de baja y 98 alumnos en la "Matriz Anual 2026".
   - Al iniciar la depuración y migración manual 1 a 1 de alumnos activos, el panel de cobranzas no reflejaba la realidad contable de los alumnos recién matriculados y activos en sala.
2. **Registro y Auditoría de Abonos Fraccionados (Caso Camila Pastor Conco)**:
   - La alumna Camila Valentina Pastor Conco (Violín, Prof. Fernando) cuenta con una matrícula de reingreso/continuación en Plan Trimestral (promoción de S/ 297 a S/ 261).
   - Su apoderada realizó dos abonos por Yape:
     - Abono 1: S/ 200 el 08/09/2026 (reserva/matrícula formal).
     - Abono 2: S/ 61 el 10/09/2026 (día de su primera clase presencial, saldo cancelado al 100%).
   - Se requería una bitácora auditable de abonos con fecha, hora, monto, método y referencia de comprobante, que mantenga sincronizado tanto el recibo en `/admin/facturacion` como la ficha del alumno (`adminStudents`) y la base de datos PostgreSQL.
3. **Preservación Estricta de Alumnos en Baja/Pausa en Base de Datos**:
   - Para no romper la estrategia de migración manual 1 a 1, los alumnos en `status: "baja"` o `"pausa"` deben permanecer intactos en la tabla `students` de PostgreSQL (no borrar masivamente), pero deben ser excluidos del tablero activo de Facturación y de la Matriz Anual.

## Decisiones Técnicas
1. **Limpieza Quirúrgica de Facturas Antiguas en PostgreSQL**:
   - Se eliminaron las 83 facturas obsoletas generadas por mocks anteriores (`created_at < '2026-09-01'`) mediante la API PostgREST de Insforge.
   - Las semillas en frontend (`src/store/admin-seeds.ts`) se configuraron con `initialInvoices = []` para impedir que datos simulados sobreescriban el estado real.
2. **Sincronización Bidireccional `invoices` $\leftrightarrow$ `adminStudents` $\leftrightarrow$ PostgreSQL**:
   - Al registrar un abono (`recordPaymentAbono` en `src/store/app-store.ts`):
     - Se actualiza `invoices` y se añade un registro detallado en `payment_audit_logs`.
     - Se actualiza de inmediato `amountPaid`, `balance` y `payment: "al-dia" | "pendiente"` en la ficha del alumno (`adminStudents`).
     - Se invoca `backgroundSyncStudentToDB` para persistir los nuevos montos en el JSONB `emergency_contact` de PostgreSQL.
   - Al matricular un nuevo alumno (`addNewStudent`):
     - Se autogenera su recibo con el monto del plan contratado y su log de pago inicial si hubo abono.
   - Al editar los datos de un alumno (`updateStudentDetails`):
     - Si se modifica `planPrice` o `amountPaid`, el recibo asociado en `invoices` actualiza su precio, saldo y estado en tiempo real.
3. **Carga Reactiva con Bitácora de Auditoría (`getInvoicesWithAudit`)**:
   - En `src/lib/services/invoices.service.ts`, se implementó `getInvoicesWithAudit` para traer concurrentemente las facturas de `invoices` y sus registros históricos desde `payment_audit_logs`, unificándolos para la vista de comprobantes y detalle de cobranza.
   - En `src/hooks/use-insforge-sync.ts`, la hidratación desde backend consume este servicio, garantizando consistencia inmediata en recargas.
4. **Filtrado Estricto de Alumnos Activos en `/admin/facturacion`**:
   - En `src/routes/admin.facturacion.tsx`, la pestaña "Matriz Anual 2026" y su tabla de alumnos ahora consumen exclusivamente `activeStudents = adminStudents.filter(st => st.status === "activo")`.
   - La generación mensual de facturas (`generateMonthlyInvoices`) opera únicamente sobre alumnos activos.
5. **Migración Completa de Camila Pastor Conco**:
   - `id`: `00000000-0000-0000-0002-000000000045`.
   - `status`: `"activo"`.
   - `instrument`: `"Violín"`, Profesor: Fernando (Sala B).
   - `planType`: `"Trimestral"`, `planPrice`: 261, `amountPaid`: 261, `balance`: 0, `payment`: `"al-dia"`.
   - `matriculaType`: `"Exonerada"` (reingreso/continuación sin cobro de pack de matrícula).
   - Horario: Martes 17:30 y Jueves 17:30 (con clase puntual reprogramada el Jueves 17/09 a las 18:15).
   - Asistencias registradas en `attendance_logs`: 3 clases asistidas (`2026-09-10`, `2026-09-15`, `2026-09-17`).
   - Factura oficial N° `00000000-0000-0000-0003-000000000045` por S/ 261.00 (`pagado`), con sus 2 logs de abono de S/ 200 y S/ 61 auditados en `payment_audit_logs`.

## Consecuencias
- Facturación 100% limpia, reflejando únicamente la realidad de los alumnos activos en sala.
- Trazabilidad y auditoría completa de abonos y cuotas fraccionadas con soporte para Yape y transferencias.
- Preservación íntegra de la base de datos de alumnos inactivos en PostgreSQL para continuar con la migración manual 1 a 1 sin riesgo de pérdida de información.
- Paridad total entre el panel de Facturación, la Ficha de Alumno, el Kardex de Asistencias y PostgreSQL.
