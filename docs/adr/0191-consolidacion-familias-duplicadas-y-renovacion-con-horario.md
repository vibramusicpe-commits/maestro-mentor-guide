# ADR-0191: Consolidación de Familias Duplicadas (Fase 5 Luciana) y Saneamiento de Cuentas Familiares

**Fecha:** 2026-11-09  
**Estado:** Aprobado y Aplicado en Producción  
**Autores:** Dirección Vibra Music / Antigravity Architect  
**Referencia:** `docs/PLAN_ANTIGRAVITY_FASE5_LUCIANA_Y_RENOVACION_HORARIO.md` y `docs/logs/2026-11-09-fase5-luciana-consolidacion.log`  

---

## 1. Contexto

Durante la auditoría en vivo sobre PostgreSQL Insforge del 2026-11-09 se detectaron 6 registros con el nombre "Luciana", correspondientes en realidad a 3 personas/matrículas distintas:
1. `Luciana Mendoza Gómez` (`90191dc0`): Alumna independiente que erróneamente compartía el `personGroupId` (`f8fc5eef...`), contaminando los saldos de la cuenta familiar con su pensión (S/ 297), libro (S/ 67) y matrícula (S/ 30).
2. `Luciana` / `Luciana (Canto)` (Par A: `2307efd3` y `57ee3ecc`): Registros vigentes legítimos con pagos completos.
3. `Luciana ` (`f630d6df`, con espacio final): Registro legítimo de Piano con S/ 250 abonados, pero huérfano de vínculo familiar.
4. `Luciana` / `Luciana (Canto)` (Par B: `50996819` y `b32540d1`): Duplicado completo del Par A generado por una re-matrícula errónea, que contaba con un recibo pendiente inflado de S/ 250 y un log de asistencia huérfano.

Adicionalmente, se identificó un séptimo registro homónimo `LUCIANAA` (`4424461b`, Violín), perteneciente a otra familia totalmente distinta, el cual fue expresamente protegido de cualquier intervención.

---

## 2. Decisiones Técnicas y de Negocio

1. **Desvinculación Quirúrgica de Alumna Ajena:**
   - Se removieron las claves `personGroupId` y `personGroupLabel` del JSONB `emergency_contact` de `Luciana Mendoza Gómez` (`90191dc0`), restaurando su independencia financiera sin tocar montos ni recibos.
2. **Unificación de Registro Legítimo:**
   - Se vinculó `f630d6df` (`Luciana `) al grupo familiar `f8fc5eef-78dc-472b-bfa8-3b81720633be` con etiqueta `Piano + Canto`.
3. **Archivado de Registros Duplicados (Sin Borrado Físico):**
   - El Par B (`50996819` y `b32540d1`) pasó a `status = "baja"`. Sus lecciones salieron de la agenda semanal de forma automática y limpia sin pérdida de historial.
4. **Preservación Incondicional de Asistencia:**
   - El log de asistencia `e9714109` (ausente del 2026-11-04) registrado en el Par B huérfano fue reasignado al registro activo correspondiente (`57ee3ecc`), previa verificación de ausencia de duplicados.
5. **Anulación Trazable de Recibo Huérfano:**
   - El recibo `55ae6b2c` (S/ 250 pendiente) fue anulado sin eliminación física, actualizando su concepto a `[ANULADO 2026-11-09 · duplicado del par A · no cobrado] Plan Mensual (Canto) — Luciana (Canto)`, con `remaining_balance = 0`, `amount_paid = 0` y `status = "pagado"`.
6. **Reconocimiento de Saldo a Favor:**
   - Los S/ 250 efectivamente abonados por el Piano en el registro archivado se registraron formalmente como saldo a favor familiar (`creditBalance = 250`) en `2307efd3` con nota y fecha de auditoría.

---

## 3. Consecuencias y Verificación

- **Invariantes de Cartera:** La cuenta familiar de Luciana refleja exactamente **S/ 750.00 contratado / S/ 750.00 abonado / S/ 0.00 pendiente**, más **S/ 100.00 de libros cancelados** y **S/ 250.00 de saldo a favor de la familia**.
- **Cero Cartera Viciada:** Se eliminaron S/ 250 ficticios de deuda por cobrar en los reportes de cobranza y se separó la deuda de matrícula de Mendoza.
- **Rollback Disponible:** Las 7 operaciones cuentan con snapshot previo y scripts idempotentes en `scratch/_a1.mjs` y `scratch/_a2.mjs`.

---

## 4. Regularización Caso EITHAN (Camino 1 Aprobado)

- **Decisión de Dirección:** Cuota contractual confirmada en **8 clases** (Plan Mensual Regular, 1 solo instrumento).
- **Ajuste de Cartera:** Se actualizaron `packageTotalSessions = 8`, `planType = 'Mensual'`, `modality = 'Regular (8 clases / 45 min)'`, `planPrice = 261`.
- **Saldo a Favor:** De los S/ 783 abonados, S/ 261 cubren el mes 1 y **S/ 522** se registraron como saldo a favor familiar (`creditBalance = 522`) para cubrir los meses 2 y 3.
- **Anulación de Recibo:** Se anuló el recibo erróneo `c947e6e9` (S/ 261 pendiente) con prefijo `[ANULADO 2026-11-09 ...]`, eliminando la falsa deuda.

---

## 5. Habilitación de Informe Trimestral Culminado (Andrea Fernanda Meza)

- **Problema:** Andrea culminó sus 24 clases de Batería con Jeremy (02/07 al 09/10/2026). Al estar en `baja` y no tener bitácoras diarias previas (módulo nuevo), el docente no podía emitir el informe trimestral.
- **Resolución:**
  1. Se inyectó el borrador oficial en `progress_reports` (`e20fafea-0d49-4809-919f-3696bae11267`) asignado a Jeremy con 93% de asistencia (22 presentes, 2 faltas de 24 sesiones).
  2. Se ajustó `TeacherProgressReports` para incluir en la cohorte docente a alumnos con informes asignados aunque estén en `baja`, permitiendo a Jeremy abrir y redactar la conclusión cualitativa para revisión de Dirección.

