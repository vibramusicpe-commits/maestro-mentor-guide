# ADR 0161: Cómputo de Evaluaciones por Vigencia de Ciclo Activo y Saneamiento de Ficha/Pago para Alejandro Huarca

## Estado
Aprobado e Implementado (v2.0.31) — 06 de Octubre, 2026

## Contexto
1. **Bloqueo de Proyección de Clases en Renovaciones de Ciclo**:
   - Alumno Alejandro Huarca renovó su ciclo con fecha de inicio `planStartDate = "2026-10-05"`. Asistió a su primera clase el mismo 05/10/2026.
   - Sin embargo, sus clases restantes de Octubre no se proyectaban ni en el Horario de Clases ni en el Kardex.
   - **Causa Raíz**: En `src/lib/student-cycle.ts` (`computeStudentCycle`), el cómputo de evaluaciones acumuladas sumaba indiscriminadamente todas las clases históricas evaluadas del alumno desde el inicio de los tiempos (las 8 clases de Agosto/Setiembre de su ciclo 1). Al sumar 8 evaluadas, el sistema consideraba que el alumno ya había alcanzado su cuota contractual (`evaluatedCount >= targetQuota = 8`), marcando el ciclo como culminado e impidiendo la proyección de sesiones regulares pendientes para el mes de Octubre.
2. **Desfase Financiero en Ficha**:
   - Alejandro figuraba con saldo pendiente de S/ 297 a pesar de haber realizado el pago oficial de renovación por Yape el 05/10/2026.

## Decisiones Técnicas
1. **Aislamiento de Evaluaciones al Ciclo Activo (`src/lib/student-cycle.ts`)**:
   - Se crearon `cycleEvaluatedDates`, `cycleEvaluatedSlots`, `cycleAttendedDates` y `cycleAttendedSlots`, que filtran las evaluaciones que consumen la cuota contractual **estrictamente a aquellas que ocurren dentro de la vigencia del ciclo activo** (`dateStr >= studentProfile.planStartDate`).
   - Las evaluaciones históricas anteriores a `planStartDate` se preservan en `evaluatedDates` y `evaluatedSlots` para que las marcas de meses pasados permanezcan visibles en el calendario, pero **jamás saturan la cuota del nuevo ciclo**.
2. **Saneamiento en PostgreSQL Insforge**:
   - Ficha de Alejandro Huarca (`d3765829-7338-4524-b7ee-88f1dcd51ce8`): `amountPaid = 594`, `balance = 0`, `payment = "al-dia"`.
   - Recibo de renovación (`ca3be401-5b42-404f-8262-20483d37220d`): `amount_paid: 297.00`, `remaining_balance: 0.00`, `status: "pagado"`.
   - Log de auditoría insertado en `payment_audit_logs` respaldando el pago de S/ 297 por Yape.

## Verificación
- Verificada la proyección completa de las 7 clases restantes de Octubre y Noviembre para Alejandro Huarca en Agenda y Kardex.
- Recibo en `/admin/facturacion` en estado "Pagado".
- Compilación `npm run build` exitosa con 0 errores.
