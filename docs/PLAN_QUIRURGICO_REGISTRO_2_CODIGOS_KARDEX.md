# Plan quirúrgico — Registro 2: código por instrumento, Kardex por matrícula y Cuenta Familiar

Fecha: 2026-11-05
Estado: **plan aprobado en decisiones, pendiente de ejecución**
Base: `main` = `07c82b6`
Alcance: producción. Sin DDL destructivo. Sin tocar `kardex-calculator.ts` ni `student-cycle.ts`.
ADR previsto: **ADR-0189 — Cuenta Familiar, código por instrumento y consolidación asistida**

---

## 0. Los tres niveles que hoy están mezclados

| Nivel | Qué es | Entidad |
|---|---|---|
| **Persona** | Luciana (una sola) | `personGroupId` |
| **Matrícula** | Piano + Canto: docente, sala, horario y Kardex propios | `students.id` |
| **Cuenta familiar** | Quien paga (apoderado). Una sola cuenta para todas las matrículas | `family_id` + bolsa de abonos |

Luciana **no es una familia**: es una persona con dos matrículas bajo una cuenta de pago. El defecto actual es que el `family_id` de su matrícula de Piano **es igual al UUID del alumno** (`2307efd3…`), así que la "familia" es literalmente ella.

---

## 1. Estado verificado en vivo (2026-11-05)

### 1.1 Luciana tiene cuatro matrículas (dos pares)

| Par | Piano | Canto | `personGroupId` | Cobrado | Saldo |
|---|---|---|---|---|---|
| **A** | `2307efd3…` | `57ee3ecc…` | `f8fc5eef…` (ambas) | 250 + 250 + libros 50 + 50 = **S/ 600** | 0 |
| **B** | `50996819…` | `b32540d1…` | Piano sí / Canto **null** | 250 + libro 50 = S/ 300 | 250 + libro 67 |

- El par **A** coincide con lo declarado: S/ 400 + S/ 200 = **S/ 600**, al día.
- El par **B** nació de un **reintento** mientras la página se caía (el log muestra dos altas y dos recibos).
- **Decisión de Dirección: no se descarga ningún par.** Se resuelve con la herramienta de consolidación (Fase 5). Nada se borra.

### 1.2 La matrícula ya se cobra una sola vez

`multi-instrument-enrollment.tsx` (commit `7d04509`): matrícula solo en el primer instrumento; los demás quedan `Exonerada` con nota en `emergency_contact`. El libro sí queda por instrumento. **Correcto.**

### 1.3 El crash de `/admin/alumnos` ya está corregido en código

`modalityBadge` (`students-table.tsx:122-125`) usa `const value = modality || ""`. El `TypeError … includes` venía del bundle anterior. **Falta tu confirmación con Ctrl+F5.**

### 1.4 El 409 de `families_pkey` está absorbido

`ensureFamilyRecord` (`app-store.ts:371-420`) comparte la promesa entre escrituras simultáneas y tolera el 409. Solo hay que bajar el ruido del log.

### 1.5 La funcionalidad multi-instrumento no está aplicada en todo el sistema

Hoy existe solo en: Registro 2 (alta), agrupación visual en `/admin/facturacion`, diálogo de vincular y aviso de borrado.
**No está** en: ficha del alumno, Kardex, agenda, reportes, vistas docentes, portal de familia. Por eso "no aparece nada" al terminar de registrar.

### 1.6 El sufijo `"(Canto)"` es una protección, no un capricho

`hydrateFromBackend` (`app-store.ts:1149-1164`) descarta cualquier segundo alumno activo con nombre coincidente. Si ambos se llamaran `"Luciana"`, **Canto desaparecería del directorio y del horario** al recargar. Quitar el sufijo exige primero corregir esa deduplicación (Fase 6).

---

## 2. Decisiones cerradas por Dirección

- **D1 — Duplicados:** no se descarta ningún par. Se construye una **consolidación asistida** caso por caso, con nota y auditoría.
- **D2 — Código por instrumento:** derivado del UUID (`VM-7F3A21`). Sin cambios en la base.
- **D3 — Nombre:** se mantiene el sufijo hasta cerrar la Fase 6.
- **D4 — Abonos:** entran a una **bolsa familiar** y luego se aplican manualmente a cada instrumento, con nota libre por movimiento.

---

## 3. Fases

### Fase 0 — Contención (riesgo 0)
1. Confirmar con recarga forzada que `/admin/alumnos` ya no lanza `TypeError`.
2. Bajar el 409 de familias de `console.warn` a log informativo.
- **Aceptación:** consola limpia al matricular.

### Fase 1 — Código por instrumento (riesgo 0, sin dinero)
1. Nuevo `src/lib/student-code.ts`:
   - `studentCode(id)` → `VM-7F3A21`, determinista desde el UUID.
   - `personCode(personGroupId)` → código de la persona.
2. Se muestra en: ficha del alumno, cabecera del Kardex, concepto/referencia del recibo y buscador del directorio.
3. Se puede **buscar por código** en `/admin/alumnos`.
- **Aceptación:** mismo alumno = mismo código siempre; búsqueda por código funciona; cero DDL.

### Fase 2 — Ficha de persona con Kardex por instrumento (sin dinero)
En el drawer del alumno, tarjeta **"Persona · N matrículas"**:

```
Luciana · 2 matrículas · VM-F8FC5E
  Piano  VM-2307EF · Prof. Fernando · Sala B · Lun/Mié 17:30   [📖 Kardex] [✏️ Ficha]
  Canto  VM-57EE3E · Prof. Nathaly  · Sala C · Mar/Jue 18:15   [📖 Kardex] [✏️ Ficha]
```

- Reemplaza el botón suelto "Vincular con otro instrumento", que hoy aparece en **cualquier** ficha sin contexto.
- El vínculo manual queda como acción secundaria con texto explícito: *"Solo si registraste a la misma persona dos veces por separado"*.
- **Aceptación:** desde Luciana/Piano se abre el Kardex de Canto en un clic.

### Fase 3 — Confirmación visible al terminar el Registro 2 (sin dinero)
Hoy el modal se cierra y no queda rastro. Debe mostrar:

```
✓ Luciana matriculada en 2 instrumentos
   Piano  VM-2307EF   [📖 Kardex]
   Canto  VM-57EE3E   [📖 Kardex]
   Contratado S/ 634 · Abonado S/ 600 · Pendiente S/ 34
```

- **Aceptación:** tras matricular se ven los dos códigos y se llega a cada Kardex.

### Fase 4 — Cuenta Familiar con bolsa de abonos (dinero)
**Modelo:**

- **Una cuenta por familia** (`family_id` real, con nombre del apoderado), no por alumno.
- **Movimientos de la bolsa:** fecha, monto, método (Yape/Plin/Transferencia/Efectivo), N° de operación, nota libre y **aplicación** (opcional).
- Si el abono **no** se aplica, queda como **saldo a favor de la familia**.
- Se puede **aplicar después**, total o parcialmente, a cualquier instrumento.
- **Nunca se descarta excedente** (`Math.max(0, planPrice - amountPaid)` está prohibido para este cálculo).
- Todo movimiento se audita con la compuerta existente de `payment_audit_logs` (ADR-0106); no se duplica la lógica.
- En `/admin/facturacion`, la familia aparece como **un solo deudor** con el detalle por instrumento y el total.

**Vista mínima (senior-friendly, 48 px):**

```
Familia Luciana · 2 instrumentos
Contratado S/ 634 · Aplicado S/ 600 · A favor S/ 0 · Pendiente S/ 34
[ + Registrar abono ]   [ Aplicar saldo a favor ]   [ 📲 Cobrar WhatsApp ]
```

- **Aceptación:** un abono de S/ 100 a la bolsa deja el saldo familiar correcto sin tocar ningún instrumento hasta que se aplique.

### Fase 5 — Consolidación asistida de matrículas duplicadas (dinero, sobre la bolsa)
**Problema real:** en la operación diaria "siempre salen cada cosa" — reintentos, homónimos, matrículas repetidas.

**Herramienta (nueva, no destructiva):**

1. **Detección:** matrículas activas con el mismo nombre (o misma fecha de nacimiento + apoderado) que no estén ya vinculadas.
2. Por cada caso, Dirección elige:
   - **Mantener ambas** (re-matrícula legítima) → quedan vinculadas como persona.
   - **Consolidar** → se elige la matrícula que queda activa; los abonos de la otra **se transfieren a la bolsa familiar**; la otra pasa a `baja` con motivo y nota. **Recibos y auditoría se conservan íntegros.**
   - **Dejar pendiente** → queda marcada para revisar después.
3. Toda decisión exige confirmación explícita con resumen (alumno, montos, qué se mueve) — igual que la transición de curso (ADR-0131).

**Caso Luciana:** se consolidan los pares A y B en una sola cuenta familiar con los S/ 850 cobrados entre ambos (S/ 600 + S/ 250) y el saldo real resultante, sin borrar ningún recibo.

- **Aceptación:** los totales globales de facturación no cambian; no se borra ningún registro; la familia queda con una sola cuenta y dos matrículas.

### Fase 6 — Nombre limpio (riesgo medio, aislado)
1. Corregir `hydrateFromBackend`: dos activos con el mismo nombre solo son duplicado si comparten instrumento o si uno no tiene `personGroupId`.
2. Test de runtime con datos vivos **antes** de mergear.
3. Recién entonces quitar el sufijo `"(Canto)"` en los nombres nuevos.
- **Aceptación:** dos matrículas de la misma persona sobreviven a la recarga; un duplicado real sigue descartándose.

### Fase 7 — Bug abierto del docente (`/teacher/informes`)
No se puede cerrar con lectura estática (ADR-0120). Necesito la **consola real del dispositivo de Jeremy** al pulsar *"📄 Informe"*. Con eso: causa raíz + `error boundary` en `/teacher` para que un fallo nunca deje la pantalla en blanco.

---

## 4. Orden de ejecución propuesto

| # | Fase | Toca dinero | Riesgo |
|---|---|---|---|
| 1 | Fase 0 — contención | No | Nulo |
| 2 | Fase 1 — código por instrumento | No | Nulo |
| 3 | Fase 2 — ficha de persona + Kardex | No | Bajo |
| 4 | Fase 3 — confirmación del Registro 2 | No | Bajo |
| 5 | Fase 4 — Cuenta Familiar (bolsa) | **Sí** | Medio |
| 6 | Fase 5 — consolidación de Luciana | **Sí** | Medio |
| 7 | Fase 6 — nombre limpio | No | Medio |
| 8 | Fase 7 — bug del docente | No | Bajo |

Se puede desplegar 1–4 sin tocar un solo sol. Las fases 5 y 6 se revisan contigo antes de ejecutar.

---

## 5. Lo que NO se toca

- Registro 1 (`NewStudentDialog`).
- `kardex-calculator.ts` y `student-cycle.ts`.
- Recibos y `payment_audit_logs` existentes: no se borran ni se reescriben montos.
- Alumnos históricos con dinero cobrado.
- `students.notes` y `notification_logs`.

## 6. Protocolo de cierre de cada fase

1. `npm run build` en verde.
2. `npx tsc --noEmit` sin errores nuevos en los archivos tocados (§92).
3. Verificación con datos vivos (`scratch/`), no solo lectura de código.
4. ADR-0189 + `docs/logs/*.log` + CHANGELOG + AGENTS.md en el mismo commit.
5. Push a `origin main` y `core main`, verificado con `git ls-remote`.
