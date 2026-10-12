# ADR 0167: Blindaje Integral de Plan Intensivo (90 min), Motor de Ciclos/Kardex, Renovaciones y Sincronización Automática de Facturación

## Estado
Aprobado e Implementado (v2.0.37) — 12 de Octubre, 2026

## Contexto
Durante el cierre de la jornada lectiva del sábado 10 de octubre y la apertura del lunes 12 de octubre de 2026, la Dirección y Secretaría (Nayeli) de Vibra Music Staff identificaron una serie de inconsistencias operativas críticas en producción:

1. **Plan Intensivo (90 min = 2 horas pedagógicas) al Reprogramar (Casos Sebastian Paredes Ortega, Benjamin y Giuseppe Granda)**:
   - En el Plan Intensivo (`4 clases / 90 min`), cada clase se compone de dos bloques contiguos de 45 minutos (`sessionNumber: 1` y `sessionNumber: 2`).
   - Al reprogramar desde la interfaz, `rescheduleLesson` recibía únicamente el identificador de la Sesión 1.
   - Consecuencias:
     - La Sesión 2 permanecía activa en el horario habitual (ej. 11:15 en Sebastian / 16:45 en Giuseppe) sin agregarse a `excludedDates`.
     - Solo se creaba un bloque de recuperación puntual de 45 min en el nuevo horario (ej. 09:00 - 09:45 en lugar de 09:00 - 10:30).
     - En el Kardex de Benjamin, como la Sesión 2 del sábado 10/10 no estaba excluida, el motor la computaba como clase regular pendiente (`pendingRegular`), consumiendo un cupo contractual (`targetQuota`) y recortando la última clase contratada del mes (el sábado 17 de octubre).
2. **Renovación de Ciclo y Arrastre de Asistencias Pasadas (Caso Juan Diego / `9d0083b1-d45c-436c-b114-8bd93eff1cc1`)**:
   - Juan Diego renovó ciclo el 10/10/2026 para iniciar un nuevo ciclo de 4 clases intensivas.
   - El soporte previo de adelantos (ADR-0164) escaneaba hasta 30 días hacia atrás (`scanStartDate`), detectando recuperaciones de septiembre (19/09 y 26/09) y sumando esas 2 asistencias al ciclo de octubre, mostrando 2 asistencias pasadas y solo 2 clases pendientes.
3. **Falso Cierre Prematuro de Ciclo en Horario de Clases (Caso Alejandro Huarca / `d3765829-7338-4524-b7ee-88f1dcd51ce8`)**:
   - Alejandro inició nuevo ciclo el 05/10/2026. El escaneo de 30 días atrás sumó 6 asistencias de septiembre más 2 de octubre = 8 asistencias (100% de cuota).
   - El motor marcó `isCycleCompleted = true`, y la regla de cierre estricto (ADR-0108) retiró todas las clases pendientes de `validSlots`, ocultando sus clases lectivas del Lunes 12 de Octubre y Miércoles 14 de Octubre de la cuadrícula de `AgendaBoard`.
4. **Herencia Indebida de Barreras de Cursos Previos en Reprogramaciones (Caso Sasha Dharma / `03731896-8de9-49dc-8dbb-8a1983c57302`)**:
   - Sasha realizó una transición de Canto a Guitarra el 29/09/2026. Sus clases de Canto tenían `effectiveUntil: "2026-09-28"`.
   - Al reprogramar faltas de septiembre hacia el 13 y 15 de octubre, `rescheduleLesson` copió inadvertidamente `effectiveUntil: "2026-09-28"` a las nuevas lecciones, bloqueándolas en el Kardex y forzando la proyección de fechas viejas de septiembre (10/09 y 15/09).
5. **Recibos Desincronizados en Facturación y Cobranzas (`/admin/facturacion`)**:
   - 3 recibos figuraban en estado "Pendiente" con saldo total adeudado a pesar de que Secretaría ya había registrado los pagos en la ficha del alumno:
     - `e4608892-0eae-4dea-a87e-82531cbe3f6a` (Juan Diego: S/ 297.00)
     - `5e5c092a-b6ea-446c-b9b6-5e96abe43f08` (Santiago Mathias: S/ 148.50)
     - `01aff5f7-7f90-4126-a6a9-60d41b5c0d7a` (Matias Gabriel: S/ 297.00)
   - Causa: `updateStudentDetails` en `app-store.ts` sincronizaba la tabla `students` en PostgreSQL, pero nunca actualizaba la tabla `invoices`. Al recargar, `useInsforgeSync` rehidrataba los recibos remotos con saldo impago.

---

## Decisiones Técnicas

### 1. Reprogramación Atómica de 90 Minutos para Plan Intensivo (`src/store/app-store.ts`)
- `rescheduleLesson` detecta automáticamente si el alumno pertenece a Plan Intensivo (`isIntensive`).
- Busca de forma atómica la sesión compañera en el mismo día habitual, agregando `originalDateStr` a `excludedDates` en **ambos bloques contiguos** (Sesión 1 y Sesión 2) y removiendo asistencias residuales de esa fecha.
- Genera **dos bloques contiguos de recuperación de 45 minutos** (`Block 1` a `time` y `Block 2` a `time + 45 min`, ej. 09:00 - 09:45 y 09:45 - 10:30), asignando `sessionNumber: 1` y `sessionNumber: 2`.
- Limpia incondicionalmente `effectiveUntil: undefined` en todas las lecciones reprogramadas (`isMakeup: true`) para erradicar cualquier bloqueo por barreras de cursos previos.

### 2. Aislamiento Estricto de Ciclo Activo y Protección de Cuota (`src/lib/student-cycle.ts` y `src/lib/kardex-calculator.ts`)
- **Acotamiento de `scanStartDate`**:
  - Solo retrocede hasta un máximo de **7 días** exclusivamente para adelantos legítimos (ej. alumnos que inician un día antes de la fecha administrativa de contrato).
  - Descarta explícitamente cualquier lección con `effectiveUntil < startStr` o recuperaciones que subsanaban faltas de ciclos anteriores (`recoveringLessonDate < startStr`).
- **Inmunización de Makeups contra Barreras de Transición**:
  - La condición de bloqueo por vigencia ahora exige `!lesson.isMakeup`:
    ```typescript
    if (!lesson.isMakeup && lesson.effectiveUntil && curDateStr > lesson.effectiveUntil) return;
    ```
- **Protección de Fechas en Kardex (`recoveringDates`)**:
  - En `computeStudentCycleSessions`, se calcula `recoveringDates = new Set(pendingMakeups.map(m => m.recoveringLessonDate).filter(Boolean))`.
  - Las fechas que ya cuentan con una recuperación pendiente agendada son filtradas de `pendingRegular`, evitando que ocupen cupos duplicados y desplazando fechas contractuales legítimas (preserva el sábado 17 de Benjamin).
- **Desbloqueo de Clases Futuras en `AgendaBoard`**:
  - Alejandro Huarca en octubre suma únicamente 2 asistencias (05/10 y 07/10), manteniendo `isCycleCompleted = false` y proyectando sus clases de los Lunes y Miércoles a las 17:30.

### 3. Sincronización Automática Ficha ➔ Recibos (`src/store/app-store.ts`)
- En `updateStudentDetails`, cada vez que se edita `amountPaid`, `planPrice` o `balance`, el sistema localiza los recibos vinculados del alumno en `invoices` y ejecuta un `postgrestPatch` asíncrono con el nuevo monto, abono, saldo restante y estado (`pagado` o `parcial`), emitiendo el evento `invoice-updated`.
- En `renewStudentCycle`, se añadió soporte para el parámetro opcional `amountPaid` para formalizar abonos inmediatos al momento de renovar.

### 4. Operaciones Quirúrgicas en Base de Datos PostgreSQL Insforge
- **Tabla `invoices`**: Actualizados los 3 recibos (`e4608892...`, `5e5c092a...`, `01aff5f7...`) a `status: 'pagado'`, `remaining_balance: 0.00`, y `amount_paid` igual al valor total del contrato.
- **Tabla `payment_audit_logs`**: Insertados 3 registros oficiales de auditoría con monto cancelado, método `Yape`, referencia `ABONO-RENOVACION` y rol `staff`.
- **Tabla `students`**:
  - **Matias Gabriel**: Corregido `emergency_contact.balance = 0`.
  - **Sebastian Paredes Ortega**: Saneado con Bloque 1 (09:00) y Bloque 2 (09:45) el 10/10/2026; excluidos ambos bloques habituales (10:30 y 11:15).
  - **Giuseppe Granda**: Saneado con Bloque 1 (16:00) y Bloque 2 (16:45) el 29/10/2026; excluido el 08/10 en ambos bloques.
  - **Sasha Dharma**: Removido `effectiveUntil` de sus makeups del 13/10 y 15/10; añadido `2026-09-15` a exclusiones de Canto.

---

## Verificación
- **Facturación**: Los recibos de Juan Diego, Santiago Mathias y Matias Gabriel figuran en verde con estado `pagado` y saldo S/ 0.00.
- **Horario Central (`AgendaBoard`)**: Alejandro Huarca visible hoy Lunes 12 y Miércoles 14 a las 17:30. Sebastian Paredes y Giuseppe Granda muestran sus 90 minutos continuos (2 bloques de 45m).
- **Kardex de Asistencias**: Juan Diego muestra sus 4 clases de octubre sin contaminación de septiembre; Benjamin mantiene su sábado 17 de octubre visible; Sasha proyecta sus recuperaciones de octubre sin recortes.
- **Compilación de Producción**: `npm run build` ejecutado exitosamente con código 0 (Nitro / Cloudflare Pages generado en 820ms).
