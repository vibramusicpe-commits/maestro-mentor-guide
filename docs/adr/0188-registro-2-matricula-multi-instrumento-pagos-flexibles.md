# ADR-0188: Registro 2 — Matrícula Multi-Instrumento con Pagos Flexibles

**Fecha:** 2026-11-03
**Estado:** Implementado y verificado.
**Autores:** Equipo Vibra (Open Code & Dirección)
**Versión:** 2.0.59
**Relación:** ADR-0186 (vínculo multi-instrumento), ADR-0135 (3 rubros), ADR-0106, ADR-0119.3

---

## Contexto

El formulario de matrícula actual (**Registro 1**) está diseñado para **1 instrumento y planes establecidos**. Funciona bien en ese escenario y **no se modifica**.

Pero aparece un caso real que no encaja:

> *"Luciana entra como Piano y Canto. Ya pagó S/ 600: en su primer pago S/ 400 (su hija asistió y ese primer día pagó 400) y en su segunda clase pagó S/ 200. ¿Cómo registraría de esa forma?"*

Y otro patrón frecuente:

> *"En otros alumnos tengo que pagan hasta en su 4ta o 5ta clase, van abonando 50 soles en 50 soles, y tienen 2 instrumentos."*

### Por qué el Registro 1 no sirve aquí

`livePlanBalance = Math.max(0, planPrice - amountPaid)`

Con costo S/ 250 y abonado S/ 400:
- El saldo se recorta a **S/ 0** → muestra "✓ Cancelado (S/ 250.00)".
- Los **S/ 150 sobrantes desaparecen**: no se registran en ningún lado.
- No hay forma de asignar el pago al segundo instrumento.
- No hay historial de los abonos por clase.

---

## Decisión

### 1. Dos registros, dos propósitos (coexistentes)

| | **Registro 1** (existente) | **Registro 2** (nuevo) |
|---|---|---|
| Para quién | 1 instrumento, planes establecidos | **2 instrumentos** con pagos fraccionados |
| Ubicación | Sheet «Registrar Nuevo Alumno» | Botón «Matrícula Multi-Instrumento» |
| Estado | **Sin cambios** | Nuevo componente |
| Abonos | Monto único | **Por instrumento, con fecha y nota** |

Ambos botones conviven en el panel de alumnos. **El Registro 1 no se toca** (decisión de Dirección).

### 2. Componente `multi-instrument-enrollment.tsx`

**Datos del alumno y apoderado**: nombre, nacimiento, tutor, teléfono, familia, fecha de matrícula.

**Un bloque por instrumento**:
- Instrumento (Piano, Piano Infantil, Violín, Guitarra, Batería, Canto, Estimulación)
- Costo del plan
- Abonado
- **Nota libre por instrumento** (ej. *"Entra a piano con Fernando, canto con Nathaly"*)
- **Abonos detallados**: fecha, monto, método y **nota por cada abono**

**Tercer instrumento opcional**: botón para añadir más de dos.

**Resumen familiar**: Contratado · Abonado · Pendiente · **A favor**.

### 3. El excedente va a favor de la familia (decisión de Dirección)

No se aplica automáticamente al otro instrumento. Se muestra como **saldo a favor de la familia** y el formulario lo aclara explícitamente.

Razón: si el alumno finalmente no cursa el segundo instrumento, no hay que "deshacer" una aplicación automática.

### 4. Cada instrumento es una matrícula real

Se crean **2 registros** vinculados por `personGroupId` y con **el mismo `familyId`** (una sola cuenta para el apoderado, ADR-0186 Fase 4):
- Cada uno con su instrumento, su plan y su abono.
- **Nunca se fusionan**: cada matrícula conserva docente, sala y horario propios.

### 5. Notas flexibles y migración futura

Cada abono y cada instrumento tiene su **espacio de nota libre**, donde secretaría anota en su propio lenguaje:

```
26/10 · S/ 400 · Yape · "1er pago, día 1"
02/11 · S/ 200 · Efectivo · "2da clase"
```

Dirección indicó que posteriormente esta información se trasladará a una base más limpia. El diseño lo permite: las notas viven en `emergency_contact` (JSONB) sin esquema rígido.

### 6. Aviso de duplicado, sin bloqueo

Si la fecha de nacimiento + apoderado coinciden con un alumno existente, se muestra un aviso sugiriendo **vincular** en lugar de duplicar (reutiliza `detectSamePersonCandidates`, ADR-0186). **No bloquea**: decide secretaría.

---

## Verificación

### Cálculo del caso Luciana (Piano S/ 250 + Canto S/ 250)

```
Contratado: 500 | Abonado: 600 | Excedente a favor: 150 | Pendiente: 50
```

Corresponde exactamente a lo declarado: pagó S/ 400 (primer día) + S/ 200 (segunda clase) = **S/ 600**, con **S/ 150 a favor** y **S/ 50 pendiente** en Canto.

### Caso de abonos de S/ 50 hasta la 4.ª clase

El historial acumula filas independientes por instrumento; el total abonado se recalcula automáticamente.

`npm run build` en verde. `kardex-calculator.ts` y `student-cycle.ts` **sin cambios**. Sin DDL.

---

## Límites honestos

- El Registro 2 **no importa** automáticamente los datos de un alumno existente; se capturan en el formulario. Para vincular con un registro previo se usa el botón `🔗 Vincular con otro instrumento` (ADR-0186 Fase 5).
- El saldo a favor es informativo: **no genera un recibo** por sí solo. La aplicación a un cobro futuro es decisión manual de secretaría.
- Las notas por abono se muestran en el toast de confirmación y quedan en la ficha del alumno; **no crean filas en `payment_audit_logs`** (eso ocurre al cobrar desde `/admin/facturacion`).
- No se añadió validación de aforo por sala: la asignación de horario sigue siendo tarea de la Agenda (ADR-0121).

## Por qué no se tocó `payment_audit_logs`

Registrar cada abono allí requeriría un `invoice_id` existente y pasaría por la compuerta anti-fraude (ADR-0106). El Registro 2 crea la matrícula y sus notas; los cobros formales se consolidan en `/admin/facturacion` cuando se emite el recibo. Esto evita duplicar lógica contable y respeta el flujo vigente.
