# PLAN DE EJECUCIÓN — Antigravity

**Proyecto:** Vibra Music Staff (producción)
**Fecha del documento:** 2026-11-09
**Ejecutor:** Google Antigravity
**Autor del diagnóstico:** sesión previa de auditoría (solo lectura) sobre PostgreSQL Insforge en vivo

---

## 0. Cómo usar este documento

### 0.1 Qué contiene

| Bloque | Qué hace | ¿Escribe en la base? |
|---|---|---|
| **Parte 1 — Fase 5 Luciana** | Consolida 6 matrículas duplicadas en 3 registros reales | **SÍ** |
| **Parte 2 — Caso EITHAN** | Explica las 12 clases y corrige la cuota | **SÍ**, solo tras una decisión de Dirección |
| **Parte 3 — Renovación con horario** | Rediseña el diálogo de renovación | Código, no datos |
| **Parte 4 — Causa raíz de fechas perdidas** | Blinda `performSyncStudentToDB` | Código, no datos |

**Ninguna parte se ejecuta sin leer su sección de verificación y su rollback.**

### 0.2 Reglas del proyecto (obligatorias, ya documentadas en `AGENTS.md`)

1. Producción en vivo. Trabajo quirúrgico y MVP.
2. **Prohibido** `DROP TABLE`, `TRUNCATE` y `DELETE` masivo sobre `students`, `families`, `attendance_logs`, `invoices`, `payment_audit_logs`.
3. **Prohibido** borrar registros históricos con dinero cobrado. Se archivan, no se eliminan.
4. **Prohibido** tocar `src/lib/kardex-calculator.ts` y `src/lib/student-cycle.ts`. Son los motores de cálculo; toda corrección va en datos o en la capa de hidratación/renovación.
5. `src/store/app-store.ts` solo con cambios **aditivos mínimos**.
6. Todo `emergency_contact` es un **JSONB**: PostgREST **reemplaza el objeto completo**. Nunca envíes un objeto parcial. Siempre: leer → mutar en memoria → devolver el objeto entero.
7. Antes de commitear cualquier cambio de UI:
   ```
   npm run build
   npx tsc --noEmit -p tsconfig.json
   ```
   Un build verde **no** prueba nada: esbuild no valida scopes ni tipos (ver `AGENTS.md` §92, incidente `multiEnrollmentOpen`).
8. Documentar en el mismo commit: ADR en `docs/adr/`, log en `docs/logs/` (requiere `git add -f`), `docs/CHANGELOG.md` y `AGENTS.md`. Push a `origin main` **y** `core main`, verificado con `git ls-remote`.

### 0.3 Entorno de datos

- Host PostgREST: `https://pdey9yma.us-east.insforge.app/api/database/records`
- Credenciales: `VITE_INSFORGE_URL` y `VITE_INSFORGE_ANON_KEY` (ver `.env.local`). El fallback está en `src/lib/insforge.ts:41-53`.
- **No pegues la key en este documento ni en el código.** Los scripts de los anexos la leen de `process.env.INSFORGE_ANON_KEY` — configúrala en tu terminal antes de ejecutar.

### 0.4 Regla de honestidad

Si un número esperado no coincide con el real, **detente y reporta**. No ajustes el documento para que cuadre. No inventes montos, fechas ni IDs. No marques una tarea como hecha sin haber ejecutado la verificación correspondiente.

---

# PARTE 1 — FASE 5: CONSOLIDACIÓN DE LUCIANA

## 1.1 Situación actual (verificada el 2026-11-09, solo lectura)

Hay **6 registros activos** cuyo nombre contiene "Luciana". Representan **3 personas/matrículas reales**, pero están mal vinculados.

### Grupo que debe quedar (par A + el registro con espacio final)

| UUID completo | Nombre en base | Instrumento | `family_id` | `personGroupId` actual | Plan | Libro | Lecciones |
|---|---|---|---|---|---|---|---|
| `2307efd3-4553-4676-9e7a-027334e90015` | `Luciana` | Piano | `2307efd3…` | `f8fc5eef-78dc-472b-bfa8-3b81720633be` | 250 / 250 / 0 | 50 / 50 | 0 |
| `57ee3ecc-21ed-48d1-9f95-2e61f150ca6f` | `Luciana (Canto)` | Canto | `2307efd3…` | `f8fc5eef…` | 250 / 250 / 0 | 50 / 50 | **2** (Lun y Mié 16:00, Sala C, Nathaly) |
| `f630d6df-36c0-41ff-80fb-c4fce40724fd` | `Luciana ` (espacio final) | Piano | `f630d6df…` | *(ausente)* | 250 / 250 / 0 | 0 / 0 | 0 |

### Grupo que debe archivarse (par B — duplicado completo)

| UUID completo | Nombre en base | Instrumento | `family_id` | `personGroupId` actual | Plan | Libro | Lecciones |
|---|---|---|---|---|---|---|---|
| `50996819-923e-4f0d-8d8a-7c77180285dc` | `Luciana` | Piano | `1bb0c180-459f-4a48-94c9-55b23873984a` | `18b6576e-dd65-4ef3-b3de-90114697a462` | 250 / 250 / 0 | 50 / 50 | 0 |
| `b32540d1-753d-426d-8270-a3ed0b7058d6` | `Luciana (Canto)` | Canto | `1bb0c180…` | *(ausente)* | 250 / **0** / **250** | 67 / **0** | **2** (mismos IDs que el par A) |

### Registro que debe separarse (es otra persona)

| UUID completo | Nombre en base | Instrumento | `family_id` | `personGroupId` actual | Plan | Libro | Matrícula |
|---|---|---|---|---|---|---|---|
| `90191dc0-b554-42bb-be64-4488fd447389` | `Luciana Mendoza Gómez` | Piano | `90191dc0…` | `f8fc5eef-78dc-472b-bfa8-3b81720633be` | 297 / 297 / 0 | 67 / 67 | **Promo Demo S/ 30 pendiente** |

> **Por qué importa:** `buildFamilyAccount` suma los miembros del grupo. Hoy Mendoza (S/ 297 + libro 67 + matrícula 30) se suma a la cuenta del par A. Eso produce **S/ 994 facturado / S/ 964 cobrado / S/ 30 pendiente** en una cuenta que no es suya. Verificado: `297 + 250 + 250 + 67 + 50 + 50 + 30 = 994`; `297 + 250 + 250 + 67 + 50 + 50 = 964`.

### Recibos involucrados

| UUID completo | Concepto actual | Monto | Abonado | Saldo | Estado | Destino |
|---|---|---|---|---|---|---|
| `4d1c896c-b9c1-4095-a111-f0389d73c697` | Plan Mensual (Piano) — Luciana | 250 | 250 | 0 | pagado | se queda |
| `c37aa58d-9714-4f71-825f-87e28e37a084` | Plan Mensual (Canto) — Luciana (Canto) | 250 | 250 | 0 | pagado | se queda |
| `2d198438-8a91-4858-9355-64b30b950282` | Plan Mensual (Piano) — Luciana | 250 | 250 | 0 | pagado | se queda |
| `99148d3d-5a98-465e-ad67-11975e5bb378` | Plan Mensual (Piano) — Luciana Mendoza Gómez | 297 | 297 | 0 | pagado | se queda (Mendoza) |
| `abb061f1-6960-4726-958a-8bf75a407c2d` | Plan Mensual (Piano) — Luciana | 250 | 250 | 0 | pagado | se queda (par B, histórico) |
| `55ae6b2c-4780-4b1d-9fcc-496a67363dd3` | Plan Mensual (Canto) — Luciana (Canto) | 250 | **0** | **250** | **pendiente** | **se anula (no se borra)** |

> ⚠️ **Falso positivo al buscar:** `concept ilike '%luciana%'` también devuelve `4424461b-780e-4abb-8f80-cf854037a23e` → `Plan Mensual (Violín) — LUCIANAA ` (familia `b8eb0a31-cff1-4ffb-93c6-80c114a18851`). **Es otra persona** (nombre termina en doble A, otra familia, otro instrumento). **No se toca.** Los 6 recibos de la tabla de arriba son los únicos de esta fase.
>
> Hoy el buscador devuelve **7** filas para `%luciana%`; las 6 de la tabla más ese Violín ajeno. Si al ejecutar ves un número distinto, **detente** y compara con el preflight A.1 antes de escribir.

### `attendance_logs` involucrado

| UUID completo | `student_id` actual | Estado | Nota | Registrado |
|---|---|---|---|---|
| `e9714109-431a-4c13-bbb2-5411c258ed5f` | `b32540d1-753d-426d-8270-a3ed0b7058d6` (par B) | `ausente` | `Fecha 2026-11-04 - Semana 1 - Marcado por Profesor en Kiosco` | `2026-11-05T00:47:20.899Z` |

Verificado: `57ee3ecc` (par A Canto) tiene **0** logs en esa fecha. Mover el log **no genera duplicado**.

## 1.2 Decisiones aprobadas por Dirección (2026-11-07)

1. **Par A vigente.** El par B se archiva como `baja`. **No se borra.**
2. El recibo pendiente del par B (`55ae6b2c`) **se anula, no se elimina**.
3. Los **S/ 250 cobrados** del Piano del par B quedan como **saldo a favor de la familia**. El dinero no desaparece.
4. `Luciana Mendoza Gómez` (`90191dc0`) **es otra persona** → se separa, no se cuenta junto.
5. `f630d6df` ("Luciana " con espacio final) **se unifica con el par A**, conservando su registro y sus S/ 250.

## 1.3 Procedimiento (6 pasos, en este orden)

> **Antes de empezar:** ejecuta el anexo **A.1** (`preflight`) y guarda la salida en `docs/logs/2026-11-09-fase5-preflight.log`. Es tu "antes" oficial y tu fuente de rollback.

### Paso A — Separar a `Luciana Mendoza Gómez`

**Motivo:** es otra persona; hoy contamina la cuenta del par A.

- Tabla: `students`
- Fila: `id = 90191dc0-b554-42bb-be64-4488fd447389`
- Operación sobre `emergency_contact`: **eliminar 2 claves** → `personGroupId`, `personGroupLabel`
- **No cambiar:** `family_id`, `full_name`, nombre de familia, montos, recibos, lecciones.

```jsonc
// Después del paso A, emergency_contact de 90191dc0 debe conservar sus 33 claves
// (tenía 35) y NO debe contener personGroupId ni personGroupLabel.
```

**Valores previos para rollback:**
```
personGroupId    = "f8fc5eef-78dc-472b-bfa8-3b81720633be"
personGroupLabel = "Canto + Piano"
```

### Paso B — Vincular `f630d6df` al par A

**Motivo:** misma familia real, hoy huérfana de vínculo.

- Tabla: `students`
- Fila: `id = f630d6df-36c0-41ff-80fb-c4fce40724fd`
- Operación sobre `emergency_contact`: **añadir 2 claves**
  - `personGroupId = "f8fc5eef-78dc-472b-bfa8-3b81720633be"`
  - `personGroupLabel = "Piano + Canto"`
- **No cambiar:** `family_id` (sigue `f630d6df…`), `full_name` (conserva el espacio final), montos, recibos.

**Valores previos para rollback:** ambas claves **ausentes**.

> **Nota:** se conserva el espacio final en el nombre a propósito. Quitarlo es Fase 6 (requiere corregir la deduplicación de homónimos en `hydrateFromBackend`, ADR-0107/0119) y **está fuera de alcance**.

### Paso C — Archivar el par B

- Tabla: `students`
- Filas:
  - `50996819-923e-4f0d-8d8a-7c77180285dc`
  - `b32540d1-753d-426d-8270-a3ed0b7058d6`
- Operación: `status = "baja"`
- **No cambiar:** nada más. Ni `family_id`, ni nombre, ni `emergency_contact`, ni lecciones.

**Valores previos para rollback:** ambas filas tenían `status = "activo"`.

**Efecto colateral esperado y correcto:** el `schedule` de la app se arma **solo con alumnos activos**, así que las 2 lecciones del par B salen de la agenda automáticamente. **No se borra ninguna lección.**

### Paso C2 — Mover el log de asistencia huérfano

**Motivo:** la asistencia del 2026-11-04 pertenece a la alumna vigente (par A), no al registro archivado.

- Tabla: `attendance_logs`
- Fila: `id = e9714109-431a-4c13-bbb2-5411c258ed5f`
- Operación: `student_id` → `57ee3ecc-21ed-48d1-9f95-2e61f150ca6f`
- **No cambiar:** `status` (`ausente`), `note`, `registered_at`.

**Valor previo para rollback:** `student_id = b32540d1-753d-426d-8270-a3ed0b7058d6`.

> ⚠️ **Verificación previa obligatoria:** confirma que `57ee3ecc` no tiene ya un log con la misma fecha. Si lo tuviera, **no muevas** y reporta (duplicaría).
> ```sql
> select id, student_id, status, note
> from attendance_logs
> where student_id = '57ee3ecc-21ed-48d1-9f95-2e61f150ca6f'
>   and note like '%2026-11-04%';
> -- Esperado: 0 filas
> ```

### Paso D — Anular el recibo pendiente del par B

**Motivo:** el par B no cursa; su recibo pendiente infla la deuda de cartera.

- Tabla: `invoices`
- Fila: `id = 55ae6b2c-4780-4b1d-9fcc-496a67363dd3`
- Cambios:

| Campo | Antes | Después |
|---|---|---|
| `concept` | `Plan Mensual (Canto) — Luciana (Canto)` | `[ANULADO {FECHA_DE_EJECUCIÓN} · duplicado del par A · no cobrado] Plan Mensual (Canto) — Luciana (Canto)` |
| `amount_paid` | `0` | `0` (sin cambio) |
| `remaining_balance` | `250` | `0` |
| `status` | `pendiente` | `pagado` |

**Valores previos para rollback:** `concept` original, `remaining_balance = 250`, `status = "pendiente"`.

> `{FECHA_DE_EJECUCIÓN}` es el día real en que Antigravity ejecuta la anulación (formato `YYYY-MM-DD`, zona `America/Lima`). **No** es el 2026-11-07 de la aprobación de Dirección: dejar esa fecha en el prefijo documentaría un hecho que ocurrió otro día.

#### Por qué esta combinación y no otra

- El enum `InvoiceStatus` solo admite `pagado | parcial | pendiente | vencido`. **No existe `anulado`.**
- `amount` es **inmutable** (ADR-0106). No se toca: sigue registrando que se facturó S/ 250.
- `invoices` **no tiene columna `notes`**. La trazabilidad va en el prefijo del `concept`.
- `amount_paid = 0` garantiza **impacto cero en caja**: los totales de "cobrado" no se mueven.
- La familia del par B queda en `baja`, así que ni el recibo ni la ficha entran en las vistas de cartera activa.

> ⚠️ **No borres este recibo.** Representa un documento emitido. Su anulación es textual y auditable.

### Paso E — Registrar el saldo a favor de S/ 250

**Motivo:** se cobró S/ 250 por el Piano del par B y ese dinero sigue siendo de la familia.

- Tabla: `students`
- Fila: `id = 2307efd3-4553-4676-9e7a-027334e90015` (par A · Piano)
- Operación sobre `emergency_contact`: **añadir 3 claves**
  - `creditBalance = 250`
  - `creditNote = "Saldo a favor por S/ 250 cobrados del Piano del registro duplicado (par B), archivado el {FECHA_DE_EJECUCIÓN}. No aplicado automáticamente; requiere aplicación manual de secretaría."`
  - `creditSetAt = "{FECHA_DE_EJECUCIÓN}"`

**Valores previos para rollback:** las 3 claves **ausentes**.

> `resolveCreditToShow` / `buildFamilyAccount` (`src/lib/family-account.ts:309-312`, `:669`) **suman** el crédito declarado de todos los miembros del grupo, así que basta con declararlo en un miembro. Se muestra en su propia tarjeta y **nunca** se aplica solo a un instrumento (ADR-0188 §2).

## 1.4 Verificación después de aplicar

Ejecuta el anexo **A.1** de nuevo y compara contra esta tabla.

### 1.4.1 Fichas

| Registro | Checks |
|---|---|
| `90191dc0` | `personGroupId` **ausente**; `personGroupLabel` **ausente**; `family_id` intacto; `status = activo`; 33 claves EC |
| `f630d6df` | `personGroupId = f8fc5eef…`; `personGroupLabel = "Piano + Canto"`; `family_id` intacto; `full_name` con espacio final; 36 claves EC |
| `2307efd3` | `creditBalance = 250`; `creditNote` y `creditSetAt` presentes; 34 claves EC |
| `50996819` | `status = baja`; resto intacto |
| `b32540d1` | `status = baja`; resto intacto |
| `57ee3ecc` | `status = activo`; `personGroupId` sin cambios |

### 1.4.2 Invariantes de la cuenta familiar (lo que de verdad importa)

Con `buildFamilyAccount` / la tarjeta **Cuenta familiar** de la ficha:

| Invariante | Esperado |
|---|---|
| Grupo del par A tiene 3 matrículas activas | Piano + Canto + "Luciana " |
| Mensualidad del grupo | **750.00** facturado / **750.00** abonado / **0.00** saldo |
| Libro del grupo | **100.00** / **100.00** / **0.00** |
| Matrícula del grupo | **0.00** / **0.00** / **0.00** |
| **Total del grupo** | **850.00 / 850.00 / 0.00** |
| Saldo a favor declarado | **250.00**, en tarjeta separada, sin aplicarse |
| Cuenta de Mendoza | **394.00 / 364.00 / 30.00** (297 + 67 + 30) |
| Cuenta del par B | fuera de cartera activa (`baja`) |
| Recibos contados 2 veces | **0** |
| Advertencias de ambigüedad | **0** para este grupo |

> **Reconciliación del "antes":** 994 / 964 / 30 = Mendoza (297 + 67 + 30) + par A (250 + 250 + 50 + 50). Es decir, el "antes" incluía a Mendoza por el `personGroupId` compartido. Si al ejecutar el preflight obtienes otro "antes", **repórtalo antes de escribir**: significa que los datos cambiaron.

### 1.4.3 Cartera activa (global)

| Métrica | Cambio esperado |
|---|---|
| Total facturado | **−500.00** (salen los 2 registros del par B de la base activa) |
| Total cobrado | **−250.00** |
| Saldo pendiente | **−250.00** |
| Alumnos activos | **−2** |
| Dinero real | **sin cambio**: los S/ 250 se conservan como saldo a favor |

> Si los totales globales **no** se mueven, revisa que las vistas filtren `status === "activo"` (ADR-0132). Que no se muevan sería un bug de vista, no de datos.

## 1.5 Rollback de la Fase 5

El rollback restaura **7 operaciones** (13 valores en total). Nada se borra.

| # | Tabla | Fila | Restaurar |
|---|---|---|---|
| A | `students` | `90191dc0-b554-42bb-be64-4488fd447389` | `emergency_contact.personGroupId = "f8fc5eef-78dc-472b-bfa8-3b81720633be"`, `personGroupLabel = "Canto + Piano"` |
| B | `students` | `f630d6df-36c0-41ff-80fb-c4fce40724fd` | eliminar `emergency_contact.personGroupId` y `personGroupLabel` |
| C | `students` | `50996819-923e-4f0d-8d8a-7c77180285dc` | `status = "activo"` |
| C | `students` | `b32540d1-753d-426d-8270-a3ed0b7058d6` | `status = "activo"` |
| C2 | `attendance_logs` | `e9714109-431a-4c13-bbb2-5411c258ed5f` | `student_id = "b32540d1-753d-426d-8270-a3ed0b7058d6"` |
| D | `invoices` | `55ae6b2c-4780-4b1d-9fcc-496a67363dd3` | `concept = "Plan Mensual (Canto) — Luciana (Canto)"`, `remaining_balance = 250`, `status = "pendiente"` |
| E | `students` | `2307efd3-4553-4676-9e7a-027334e90015` | eliminar `creditBalance`, `creditNote`, `creditSetAt` |

Ejecuta el rollback **en orden inverso** (E → D → C2 → C → B → A).

## 1.6 Prohibiciones específicas de la Fase 5

- ❌ **No** borrar `50996819`, `b32540d1` ni sus filas en `invoices`.
- ❌ **No** borrar `55ae6b2c` (se anula, no se elimina).
- ❌ **No** tocar `family_id` de ningún registro.
- ❌ **No** renombrar `f630d6df` (el espacio final se queda hasta Fase 6).
- ❌ **No** fusionar `90191dc0` con nadie.
- ❌ **No** crear `families` nuevas ni "arreglar" los `family_id` circulares en esta fase (es Fase 5 de datos, otro ticket).
- ❌ **No** ejecutar el anexo de escritura sin haber corrido el preflight.

## 1.7 Observación adicional (no bloqueante)

`2307efd3-4553-4676-9e7a-027334e90015` (par A · Piano) tiene `planStartDate = "2026-10-26"` y **`planEndDate` ausente**, mientras su hermano `57ee3ecc` sí tiene `2026-12-31`.

Consecuencia: su ciclo no cierra nunca; el Kardex puede proyectar clases indefinidamente.

**No lo corrijas en este ticket.** Repórtalo a Dirección y, si lo autorizan, es un cambio de 1 campo (`planEndDate`), con su propio log.

---

# PARTE 2 — CASO EITHAN: POR QUÉ TIENE 12 CLASES

## 2.1 El alumno

| Campo | Valor |
|---|---|
| ID | `d245066a-4f1e-4cb1-99ef-0695dc0fb68d` |
| Nombre | `EITHAN` |
| Instrumento | Piano Infantil |
| Docente / Sala | Nathaly / Sala C |
| `status` | `activo` |
| `modality` (columna SQL) | `Regular (8 clases / 45 min)` |
| `emergency_contact.modality` | `Paquete Flexible (A demanda)` |
| `emergency_contact.planType` | `Paquete Flexible` |
| **`emergency_contact.packageTotalSessions`** | **`12`** |
| `planStartDate` / `planEndDate` | `2026-10-19` / `2026-12-31` |
| `planPrice` / `amountPaid` / `balance` | `783` / `783` / `0` |
| `makeup_credits` | `1` |
| Matrícula | `Promo Demo (S/ 30)` |
| Lecciones | `sch-1794252351669-2g86` (Lun 17:30), `sch-1794252351669-5a0o` (Mié 17:30) |

Asistencias registradas: **19/10 presente**, **21/10 presente**, **26/10 presente**, **28/10 ausente**. Total evaluadas: **4 de 12**.

## 2.2 Respuesta directa: no hay un bug de cálculo, hay un dato que dice 12

Los tres motores leen `packageTotalSessions` y lo usan como cuota contractual:

```ts
// src/lib/kardex-calculator.ts:202-212  (proyección mensual)
const isFlexiblePackage =
  modalityStr.includes("flexible") ||
  modalityStr.includes("demanda") ||
  modalityStr.includes("paquete") ||
  student.planType === "Paquete Flexible" ||
  student.planType === "Paquete Especial" ||
  (Boolean(student.packageTotalSessions) && Number(student.packageTotalSessions) > 8);

let targetQuota = 8;
if (isIntensive) targetQuota = 4;
else if (isFlexiblePackage) targetQuota = Number(student.packageTotalSessions) || 24;
```

```ts
// src/lib/kardex-calculator.ts:1027-1031  (liquidación de ciclo)
const isFlexiblePackage = modalityStr.includes("flexible") || modalityStr.includes("demanda") || modalityStr.includes("paquete");
let targetQuota = 8;
if (isIntensive) targetQuota = 4;
else if (isFlexiblePackage) targetQuota = student.packageTotalSessions || 24;
```

```ts
// src/lib/student-cycle.ts:61-68  (visibilidad en Horario de Clases)
const isFlexiblePackage =
  modalityStr.includes("flex") || modalityStr.includes("demanda") || modalityStr.includes("paquete") ||
  studentProfile.planType === "Paquete Flexible" ||
  studentProfile.planType === "Paquete Especial" ||
  (studentProfile.packageTotalSessions !== undefined && studentProfile.packageTotalSessions > 8);

const targetQuota = studentProfile.packageTotalSessions || (isDemoNivelacion ? 1 : isFlexiblePackage ? 24 : isIntensivo ? 4 : 8);
```

**Conclusión:** con `packageTotalSessions = 12` y `planType = "Paquete Flexible"`, la cuota es **12**. El Kardex muestra 12 clases porque el registro **dice** que contrató 12. No hay corrupción ni duplicación de sesiones.

### 2.2.1 Por qué la renovación no lo arregló

`renewStudentCycle` (`src/store/app-store.ts:3638-3725`) escribe **solo** esto al alumno:

```ts
backgroundSyncStudentToDB(s.activeRole, target.id, {
  planStartDate: newStartDate,
  planEndDate: newEndDate,
  planStartMonth: newStartDate.slice(0, 7),
  planEndMonth: newEndDate.slice(0, 7),
  makeupCredits: 0,
  status: "activo",
});
```

Nunca escribe `planType`, `modality` ni `packageTotalSessions`. Por eso el **12 sobrevive a la renovación** y la cuota nueva sigue siendo 12.

### 2.2.2 Por qué las fechas tampoco cambiaron (la renovación se aplicó a medias)

Evidencia dura:

| Hecho | Dato |
|---|---|
| Recibo de renovación creado | `c947e6e9-4e60-4852-baef-fe73a348384d`, **2026-11-09T19:24:29Z**, S/ 261, `pendiente` |
| Fecha de vencimiento de ese recibo | `2026-10-19` → **prueba que `newStartDate = 2026-10-19`** (el recibo copia `dueDate = newStartDate`) |
| `planEndDate` esperado tras renovar | `2026-11-18` (1 mes − 1 día) |
| `planEndDate` real en la ficha | **`2026-12-31`** (sin cambio) |
| `makeup_credits` esperado | `0` |
| `makeup_credits` real | **`1`** (sin cambio) |
| Primer marcaje de Kardex posterior | **2026-11-09T19:27:17Z** (2 min 48 s después) |
| Segundo marcaje de Kardex | **2026-11-09T19:42:48Z** |

**Lectura:** el recibo se creó, pero la escritura del alumno **no quedó**. El patrón (recibo a las 19:24, marcajes de asistencia a las 19:27 y 19:42) apunta a que un marcaje desde otra pestaña o dispositivo reescribió `emergency_contact` con un snapshot viejo. Ver **Parte 4** para el mecanismo exacto y el blindaje.

> **Consecuencia financiera:** hoy EITHAN tiene un paquete de S/ 783 **pagado** con **8 sesiones aún disponibles** (4 usadas de 12) y además un recibo de renovación de **S/ 261 pendiente**. Es un cobro adelantado sobre un ciclo que no se ha consumido. **No borres nada**; se resuelve con la decisión de §2.4.

## 2.3 La aritmética del dinero (para decidir con datos, no con intuición)

- `783 ÷ 261 = 3` **exacto**. Y `261` es el precio mensual que usa la escuela en renovaciones (Hans, Fernanda, Mario, etc.).
- Por tanto S/ 783 parece ser **3 mensualidades prepagadas** (plan trimestral), no un paquete de 12 sesiones.
- EITHAN tiene **2 clases por semana** (Lun + Mié) → **8 clases al mes**.
- 3 meses × 8 clases = **24 sesiones**, no 12.
- 12 sesiones con 2 por semana = **6 semanas**, que es ~1,5 meses, no 2,7 meses (19/10 → 31/12).

**Ninguna de las tres lecturas cuadra entre sí.** El registro tiene tres números incompatibles: `783` (dinero), `12` (cuota) y `19/10 → 31/12` (vigencia). Por eso este caso **no se puede corregir a ciegas**.

## 2.4 ⛔ DECISIÓN OBLIGATORIA ANTES DE ESCRIBIR (STOP & VERIFY)

Antigravity **debe** detenerse y preguntar a Dirección. No elijas por tu cuenta; hay dinero cobrado de por medio.

Pregunta exacta a formular:

> **EITHAN** (`d245066a`) pagó **S/ 783**, el registro declara **12 clases** y su vigencia es **19/10/2026 → 31/12/2026**, con **2 clases por semana**. Además tiene un recibo de renovación de **S/ 261 pendiente** creado el 09/11. ¿Cuál es la verdad contractual?
>
> 1. **Plan Regular mensual: 8 clases, S/ 261.** El 783 fue un prepago de 3 meses y el 12 es un error de carga.
> 2. **Paquete Flexible de 12 sesiones: S/ 783.** El 12 es correcto; el recibo de renovación de S/ 261 **no corresponde** y debe anularse.
> 3. **Plan trimestral: 24 clases, S/ 783.** El 12 está mal y debe ser 24.
>
> Y por separado: **el recibo `c947e6e9` de S/ 261 (pendiente, del 09/11) ¿es un cobro real del nuevo ciclo o debe anularse?**

**No avances a §2.5 hasta tener la respuesta por escrito.**

## 2.5 Corrección según la decisión

> En **los tres** caminos: no borres el recibo `bd69b01e` (S/ 783 pagado) ni las asistencias ya registradas.

### Camino 1 — Regular 8 clases (S/ 261)

Es la lectura que coincide con la expectativa de Dirección ("deberían ser 8").

```sql
-- Camino 1 — Regular 8 clases. Idempotente: se puede re-ejecutar sin efectos raros.
update students
set emergency_contact = emergency_contact || jsonb_build_object(
      'planType',             'Mensual',
      'modality',             'Regular (8 clases / 45 min)',
      'packageTotalSessions', 8,
      'planPrice',            261,
      'planStartDate',        '2026-10-19',
      'planEndDate',          '2026-11-18',
      'planStartMonth',       '2026-10',
      'planEndMonth',         '2026-11',
      'amountPaid',           :cobrado_real,     -- ver §2.5.1
      'balance',              261 - :cobrado_real
    ),
    modality = 'Regular (8 clases / 45 min)'
where id = 'd245066a-4f1e-4cb1-99ef-0695dc0fb68d';
```

Notas de ejecución:

- `||` hace *merge* de claves de primer nivel sobre el JSONB existente: **no borra** las otras ~26 claves. Es la forma segura; no uses `jsonb_set` anidado (ilegible y fácil de equivocar).
- `:cobrado_real` se sustituye por el monto efectivamente asignado al ciclo, **no** por 783 sin análisis. Ver §2.5.1.
- `modality` (columna SQL) **solo admite** `'Regular (8 clases / 45 min)'` o `'Intensivo (4 clases / 90 min)'` (`lesson_modality_enum`). Por eso el texto legible completo va en `emergency_contact.modality`.
- `packageTotalSessions = 8` es obligatorio incluso en Regular: `student-cycle.ts:68` le da **prioridad absoluta** sobre la modalidad. Si lo dejas en 12, seguirá mostrando 12.
- `makeup_credits` **no** se toca: el crédito del 28/10 se conserva ("las clases no se pierden").

Alternativa equivalente con el patrón de script (recomendada si prefieres leer-modificar-escribir con validación previa): ver el patrón de `scripts/fase5-apply.mjs` (anexo A.2).

### Camino 2 — Paquete Flexible de 12 (S/ 783)

- La ficha **no se toca** (el 12 es correcto).
- Anular el recibo de renovación `c947e6e9` con el mismo patrón que §1.3 Paso D (prefijo `[ANULADO …]`, `remaining_balance = 0`, `status = "pagado"`, `amount_paid = 0`).
- Corregir solo la vigencia si Dirección lo indica (`planEndDate` coherente con 12 sesiones a 2/semana ≈ 6 semanas desde el 19/10 → `2026-11-29`).

### Camino 3 — Trimestral 24 clases (S/ 783)

- `packageTotalSessions = 24`
- `planType = "Paquete Flexible"`, `modality = "Paquete Flexible (A demanda)"`
- `planEndDate = "2027-01-18"` (3 meses desde 19/10)
- Anular igualmente `c947e6e9` si Dirección confirma que el trimestre ya estaba pagado.

### 2.5.1 Regla financiera que aplica a los 3 caminos

`amountPaid` del ciclo **nunca** puede superar lo realmente cobrado para ese ciclo. Si el S/ 783 cubre 3 meses, no lo asignes íntegro a un ciclo de 1 mes: deja el excedente como **saldo a favor** (`creditBalance` + `creditNote`), igual que en §1.3 Paso E.

**Nunca uses `Math.max(0, planPrice - amountPaid)` para esconder el excedente** (ADR-0188 §2).

## 2.6 Auditoría global: EITHAN no está solo

Ejecuté la auditoría de cuotas sobre los **69 alumnos activos**. Resultado:

- **68 de 69** tienen `packageTotalSessions` declarado (es un campo estándar, no un residuo).
- **8** están correctamente clasificados como Paquete Flexible.
- **2 tienen el mismo defecto que EITHAN** (cuota declarada que contradice su plan):

| Alumno | ID completo | Plan real | `packageTotalSessions` | Cuota que proyecta | Cuota correcta |
|---|---|---|---|---|---|
| `Stefano Yrco Samaniego` | `00000000-0000-0000-0002-000000000015` *(semilla legacy)* | Intensivo (4 × 90 min) | **8** | **8** | **4** |
| `ALEXIS` | `80216a77-2608-4d44-954d-2d0deeda123e` | Intensivo (4 × 90 min) | **8** | **8** | **4** |

**Acción:** repórtalos a Dirección. Son alumnos activos con cuota duplicada. La corrección es de 1 campo (`packageTotalSessions = 4`) y **no** requiere tocar código.

> No los corrijas dentro de este ticket salvo autorización expresa. Documenta el hallazgo y deja el arreglo listo.

## 2.7 Blindaje de código (sin tocar los motores)

Está prohibido modificar `kardex-calculator.ts` y `student-cycle.ts`. La corrección va en las dos fronteras:

### 2.7.1 Normalización en hidratación

En `mapDBStudentToAdminStudent` (`src/lib/services/students.service.ts:70`) o en `hydrateFromBackend` (`app-store.ts`), añadir una función pura:

```ts
// src/lib/plan-quota.ts  (nuevo, puro, testeable)
export type PlanQuotaInput = {
  planType?: string;
  modality?: string;
  packageTotalSessions?: number | string;
};

/**
 * Cuota contractual única del plan.
 * INVARIANTE: el valor devuelto ES el que los motores usarán como targetQuota.
 * Si esta función y el motor discrepan, el bug vuelve.
 */
export function quotaForPlan(input: PlanQuotaInput): number {
  const mod = String(input.modality || "").toLowerCase();
  const planType = String(input.planType || "").toLowerCase();
  const raw = Number(input.packageTotalSessions);

  if (mod.includes("nivelaci") || planType.includes("demo")) return 1;
  if (mod.includes("inten") || mod.includes("90 min") || (mod.includes("4 clases") && !mod.includes("45 min"))) return 4;

  const isFlexible =
    mod.includes("flex") || mod.includes("demanda") || mod.includes("paquete") ||
    planType.includes("flexible") || planType.includes("especial");

  if (isFlexible) return Number.isFinite(raw) && raw > 0 ? raw : 24;
  return 8; // Regular 2x y Regular 1x/sem
}
```

Uso en la hidratación:

```ts
const declared = Number(ec.packageTotalSessions);
const expected = quotaForPlan({ planType: ec.planType, modality: ec.modality, packageTotalSessions: ec.packageTotalSessions });
const normalizedPackageTotalSessions = declared === expected ? declared : expected;
```

**Cuidado:** este cambio **corregiría en memoria** a Stefano y ALEXIS de 8 → 4 sin escribir en la base. Es deseable, pero debe anunciarse en el log y verificarse con los dos casos. Si Dirección prefiere corregir el dato primero, hazlo y luego normaliza.

### 2.7.2 Guarda en la renovación

`renewStudentCycle` **debe** exigir y persistir el plan del nuevo ciclo (ver Parte 3). Sin eso, el 12 se vuelve a heredar.

---

# PARTE 3 — RENOVACIÓN CON ELECCIÓN DE HORARIO

## 3.1 Defectos actuales del diálogo y de la acción

Archivo: `src/components/admin/renew-student-cycle-dialog.tsx` (244 líneas)
Acción: `src/store/app-store.ts:3638-3725`

| # | Defecto | Evidencia | Impacto |
|---|---|---|---|
| 1 | **No permite elegir horario** | El diálogo no tiene ningún selector de día/hora; el texto dice "se preservará su horario habitual" pero **no escribe `scheduleLessons`** | La frase es falsa. Obliga a ir a Horario después |
| 2 | **No permite elegir plan** | No hay selector de modalidad. `renewStudentCycle` no escribe `planType`/`modality`/`packageTotalSessions` | La cuota vieja se hereda (caso EITHAN) |
| 3 | **No bloquea renovar un paquete no consumido** | Renueva con 8 de 12 sesiones disponibles | Cobro adelantado (recibo S/ 261) |
| 4 | **`useMemo` usado como efecto** | Línea 55: `useMemo(() => { setStartDate(...) }, [student, defaultStartDate])` | Escribe estado durante el render; warning de React y comportamiento indefinido |
| 5 | **Match por nombre en Zustand** | Línea 3700: `isMatchingStudentName(st.name, target.name)` | Renovar "EITHAN" puede mutar "Eithan David" u otro homónimo (viola ADR-0125) |
| 6 | **Saldo y estado hardcodeados** | Línea 3709: `balance: (st.balance \|\| 0) + planPrice`, `payment: "pendiente"` | Duplica deuda previa sin mostrarla; no se persiste en PostgreSQL |
| 7 | **Divergencia Zustand ↔ PostgreSQL** | El payload a `updateStudent` no incluye `balance`, `payment` ni `amountPaid` | Tras recargar, el saldo vuelve al valor viejo |
| 8 | **No cierra el ciclo anterior** | No pone `effectiveUntil` a las lecciones viejas | Clases del ciclo pasado conviven con el nuevo (ADR-0131) |
| 9 | **Duración fija** | `durationMonths = is1x ? 2 : 1` | Un Flexible de 3 meses se renueva como si fuera de 1 |
| 10 | **Sin confirmación de dinero** | Genera el recibo con un clic | Error irreversible en facturación |

## 3.2 Nueva experiencia (tres bloques en un mismo diálogo)

```
┌────────────────────────────────────────────────────────────┐
│ 🔄 Renovar ciclo · EITHAN                                   │
│ Piano Infantil · Nathaly · Sala C                           │
├────────────────────────────────────────────────────────────┤
│ Ciclo anterior: 19/10/2026 → 31/12/2026   [✓ 4/12 clases]   │
│ ⚠ Paquete Flexible con 8 sesiones sin usar                  │
├────────────────────────────────────────────────────────────┤
│ PASO 1 · Vigencia del nuevo ciclo                           │
│   Inicio [2026-11-19]   Fin calculado [2026-12-18]          │
│   (Fin editable si el plan es Paquete Flexible)             │
├────────────────────────────────────────────────────────────┤
│ PASO 2 · Plan del nuevo ciclo                               │
│   Plan: ( ) Regular 2x/sem · 8 clases · S/ 261              │
│         ( ) Regular 1x/sem · 8 clases · S/ 261              │
│         ( ) Intensivo · 4 clases · 90 min · S/ 297          │
│         (•) Paquete Flexible · N clases · S/ ___            │
│         ( ) Demo Nivelación · 1 clase                       │
│   Cuota resultante: 8 clases                                │
│   Monto [261.00]   Medio de pago [Yape]                     │
├────────────────────────────────────────────────────────────┤
│ PASO 3 · Horario del nuevo ciclo                            │
│   (•) Mantener el mismo horario                             │
│       Previsualización:                                     │
│         Lun 17:30 · Piano Infantil · Sala C · Nathaly       │
│         Mié 17:30 · Piano Infantil · Sala C · Nathaly       │
│       (las recuperaciones y clases puntuales no se copian)   │
│   ( ) Cambiar de horario                                    │
│       → despliega el mismo selector de ScheduleStudentForm   │
│         (día, hora, docente, sala, aforo y validación)       │
├────────────────────────────────────────────────────────────┤
│ ⚠ Al confirmar se generará un recibo en Facturación por     │
│   S/ 261.00. El ciclo anterior quedará cerrado.             │
│                         [Cancelar]  [Confirmar renovación]  │
└────────────────────────────────────────────────────────────┘
```

### Reglas de la interfaz

- **"Mantener el mismo horario"** es el default y **siempre** muestra la previsualización completa (día, hora, instrumento, sala, docente). Sin previsualización no se puede confirmar: es la diferencia entre "se preserva" y "creo que se preserva".
- **"Cambiar de horario"** reutiliza la lógica de `ScheduleStudentForm` (aforo de 5, regla de sala por docente ADR-0102, colindancia de edades ADR-0121/0147, instrumento por turno). **Prohibido** reimplementar esas validaciones: importarlas.
- La cuota se muestra **siempre** antes de confirmar (`Cuota del nuevo ciclo: N clases`).
- Si `quotaForPlan(...) !== packageTotalSessions` actual, mostrar aviso: *"El plan seleccionado cambia la cuota de 12 a 8 clases."*
- Si el plan anterior es Paquete Flexible y quedan sesiones sin consumir, mostrar bloqueo con opción a continuar bajo confirmación explícita (ver §3.5.2).

## 3.3 Cambios en `renewStudentCycle`

### 3.3.1 Nueva firma (aditiva, retrocompatible)

```ts
renewStudentCycle: (
  studentId: string,
  options?: {
    newStartDate?: string;
    newEndDate?: string;            // NUEVO: obligatorio en Flexible
    planPrice?: number;
    amountPaid?: number;
    paymentMethod?: string;
    notes?: string;
    // NUEVO — plan del nuevo ciclo
    planType?: string;
    modality?: string;
    packageTotalSessions?: number;
    // NUEVO — horario
    keepSchedule?: boolean;         // true = clonar el recurrente actual
    scheduleLessons?: ScheduledLesson[]; // si keepSchedule === false (tipo real en admin-seeds.ts:221)
    confirmUnconsumedPackage?: boolean; // ver §3.5.2
  }
) => Promise<boolean>;
```

### 3.3.2 Cuerpo (esqueleto de referencia)

```ts
renewStudentCycle: async (studentId, options) => {
  const s = get();
  // (a) ID estricto. PROHIBIDO isMatchingStudentName aquí (ADR-0125).
  const target = s.adminStudents.find((st) => isSameStudentId(st.id, studentId));
  if (!target) return false;

  // (b) Cuota y vigencia derivadas del PLAN elegido, no del ciclo anterior.
  const plan = {
    planType: options?.planType ?? target.planType,
    modality: options?.modality ?? target.modality,
    packageTotalSessions:
      options?.packageTotalSessions !== undefined
        ? Number(options.packageTotalSessions)
        : target.packageTotalSessions,
    // El precio forma parte del plan: sin él, `plan.planPrice` es undefined
    // y el saldo se calcula como NaN.
    planPrice: options?.planPrice ?? target.planPrice ?? 0,
  };
  const quota = quotaForPlan(plan);

  // (c) Guarda de paquete no consumido (ver §3.5.2).
  const consumed = countConsumedSessions(target); // usa computeStudentCycleSessions
  if (!options?.confirmUnconsumedPackage && consumed < quota && isFlexiblePlan(plan)) {
    // Devuelve un estado tipado para que la UI muestre el bloqueo.
    return false;
  }

  // (d) Fechas.
  const newStartDate = options?.newStartDate ?? nextBusinessDay(target.planEndDate);
  const newEndDate = options?.newEndDate ?? defaultEndDateForPlan(newStartDate, plan);

  // (e) Cerrar el ciclo anterior: effectiveUntil = día antes del nuevo inicio.
  //     Se preserva el historial y se evita que las clases viejas sigan proyectándose.
  const closedLessons = (target.scheduleLessons || []).map((l) =>
    l.dateStr || l.isMakeup ? l : { ...l, effectiveUntil: dayBefore(newStartDate) }
  );

  // (f) Lecciones del nuevo ciclo: IDs NUEVOS, marcas limpias, sin exclusiones.
  const freshLessons = options?.keepSchedule !== false
    ? cloneRecurringForNewCycle(target, newStartDate, closedLessons)
    : (options?.scheduleLessons || []);

  // (g) Recibo.
  const newInvoice: Invoice = { /* igual que hoy, con dueDate: newStartDate */ };
  backgroundCreateInvoiceInDB(s.activeRole, newInvoice, target);

  // (h) Persistir TODO el estado del ciclo, incluido lo que hoy se omite.
  const nextAmountPaid = options?.amountPaid ?? 0;
  const nextBalance = Math.max(0, plan.planPrice - nextAmountPaid) + carryOverDebt(target);
  backgroundSyncStudentToDB(s.activeRole, target.id, {
    planStartDate: newStartDate,
    planEndDate: newEndDate,
    planStartMonth: newStartDate.slice(0, 7),
    planEndMonth: newEndDate.slice(0, 7),
    planType: plan.planType,
    modality: plan.modality,
    packageTotalSessions: quota,          // ← el fix de las 12 clases
    planPrice: plan.planPrice,
    amountPaid: nextAmountPaid,
    balance: nextBalance,
    payment: nextBalance > 0 ? "pendiente" : "al-dia",
    makeupCredits: 0,
    status: "activo",
    scheduleLessons: freshLessons,
  });

  // (i) Zustand: SOLO por ID.
  set((state) => ({
    adminStudents: state.adminStudents.map((st) =>
      isSameStudentId(st.id, target.id)
        ? { ...st, planStartDate: newStartDate, planEndDate: newEndDate, /* … */ }
        : st
    ),
    invoices: [newInvoice, ...state.invoices],
    syncQueue: [...state.syncQueue, queueItem(`Ciclo renovado · ${target.name}`)],
  }));

  // (j) Confirmación de escritura (ver Parte 4).
  return true;
},
```

### 3.3.3 Inventario de helpers: qué existe y qué hay que crear

El esqueleto de §3.3.2 usa funciones que **no todas existen hoy**. Esta tabla es contractual: si un helper marcado «CREAR» no existe, el código no compila.

| Helper | Estado real | Ubicación / acción |
|---|---|---|
| `computeStudentCycleSessions` | **EXISTE** | `src/lib/kardex-calculator.ts:197`. Importar **solo en lectura**. Prohibido modificarlo. |
| `getNextConsecutiveSlot` | **EXISTE pero es privado** | Declarado dentro de `students-table.tsx:5834`, no se puede importar. **Extraer** a `src/lib/schedule-slots.ts` y consumirlo desde ambos sitios. Prohibido crear una segunda copia. |
| `quotaForPlan` | **CREAR** | Definido en §2.7.1 (nuevo `src/lib/plan-quota.ts`). |
| `isFlexiblePlan` | **CREAR** | Debe usar la **misma** normalización que `quotaForPlan` para que no discrepen. |
| `countConsumedSessions` | **CREAR** | Envoltorio de `computeStudentCycleSessions` que cuenta sesiones con estado evaluado (`presente`, `ausente`, `tarde`, `justificada`). |
| `nextBusinessDay` | **CREAR** | Día siguiente saltando domingo (día hábil = lunes a sábado). |
| `defaultEndDateForPlan` | **CREAR** | Aritmética de calendario **local** (`new Date(y, m, d)`), nunca `toISOString()` (ADR-0150). |
| `dayBefore` | **CREAR** | Resta 1 día en calendario local; se usa para `effectiveUntil`. |
| `cloneRecurringForNewCycle` | **CREAR** | Genera IDs nuevos con prefijo `sch-`. Nunca reutiliza los del ciclo anterior. |
| `carryOverDebt` | **CREAR** | Devuelve el saldo pendiente previo del alumno (`target.balance`), no lo inventa. |

Sugerencia de organización (no obligatoria): los siete helpers marcados «CREAR» viven en `src/lib/renewal-plan.ts`, módulo **puro sin red ni store**, para poder probarlos sin tocar producción.

### 3.3.4 Reglas de las lecciones nuevas

1. **Siempre IDs nuevos** (prefijo `sch-` + timestamp). Nunca reutilices los del ciclo anterior: el historial debe quedar inmutable (ADR-0131).
2. `effectiveFrom = newStartDate`.
3. `effectiveUntil` **eliminado** (el nuevo ciclo está abierto).
4. `excludedDates: []`, `excludedWeeks: []`.
5. `attendanceByDate: {}`, `attendanceByWeek: {}`, `attendanceStatus: undefined`.
6. **No copiar** lecciones con `isMakeup: true` ni con `dateStr`.
7. **No copiar** créditos del ciclo anterior: `makeup_credits = 0`. Excepción: si Dirección autoriza arrastrar créditos, se hace con nota explícita.
8. Plan Intensivo: **dos bloques contiguos** de 45 min (ADR-0157/0165). Reutiliza `getNextConsecutiveSlot`; **no** inventes franjas.

## 3.4 Cambios en el diálogo

1. **Sustituir `useMemo` por `useEffect`** (línea 55):
   ```tsx
   useEffect(() => {
     if (!student) return;
     setStartDate(defaultStartDate);
     setPlanType(student.planType ?? "");
     setModality(student.modality ?? "");
     setPackageTotalSessions(Number(student.packageTotalSessions) || 0);
     setPlanPrice(student.planPrice || 297);
     setPaymentMethod(student.paymentMethod || "Yape");
     setKeepSchedule(true);
     setNotes(`Renovación mensual regular (${student.instrument || "Música"} - Prof. ${student.teacher || ""})`);
   }, [student?.id]);
   ```
   Dependencia por `student?.id`, no por el objeto: evita re-render en bucle.

2. **Añadir los 3 bloques** de §3.2 con `RadioGroup` (ya existe `src/components/ui/radio-group.tsx` si está disponible; si no, usa `<button>` con `aria-pressed`).

3. **Previsualización del horario** desde `student.scheduleLessons`, filtrando `!isMakeup && !dateStr`, mostrando `day · time · instrument · room · teacher`. Si no hay lecciones: *"Sin horario recurrente guardado"* y forzar la opción "Cambiar de horario".

4. **Selector de plan** con la cuota calculada por `quotaForPlan` y el monto sugerido.

5. **Confirmación de dinero**: el botón debe decir el monto (`Confirmar y generar recibo S/ 261.00`) y deshabilitarse si `planPrice <= 0` sin justificación.

6. **Corregir el texto de garantía** (línea 223): hoy afirma que se preserva el horario y no es cierto. Reemplazar por una descripción real de lo que hará, según la opción elegida.

7. `durationMonths` deja de ser `is1x ? 2 : 1`: sale de la duración del plan elegido (`defaultEndDateForPlan`).

## 3.5 Reglas de negocio de la renovación

### 3.5.1 Tabla de planes (fuente única: `quotaForPlan`)

| Plan | Clases | Duración | `packageTotalSessions` | Precio ref. |
|---|---|---|---|---|
| Regular 2x/sem | 8 | 1 mes | 8 | 261 / 297 |
| Regular 1x/sem | 8 | 2 meses | 8 | 261 / 297 |
| Intensivo | 4 | 1 mes | 4 | 297 |
| Paquete Flexible | N | hasta fecha fin | N | según contrato |
| Demo Nivelación | 1 | 1 sesión | 1 | tarifa abierta |

**Invariante verificable:**
```
para todo alumno activo:  quotaForPlan(alumno) === cuota que proyecta el motor
```

### 3.5.2 Bloqueo de renovación de paquete no consumido

Si el plan actual es Flexible y `consumed < packageTotalSessions`:

- Mostrar: *"Le quedan N de M clases del paquete pagado. Renovar ahora generaría un cobro adicional sin consumir el anterior."*
- Ofrecer: **[Ver Kardex]** (recomendado) o **[Renovar de todos modos]** (requiere confirmación explícita + nota obligatoria).
- `confirmUnconsumedPackage: true` solo cuando el usuario lo confirme.

Esto, por sí solo, habría evitado el caso EITHAN.

### 3.5.3 Saldo previo

Si el alumno debe dinero del ciclo anterior:

- **Mostrarlo** en el diálogo (`Saldo anterior pendiente: S/ X`).
- No sumarlo en silencio. Ofrecer: `[ ] Arrastrar el saldo anterior al nuevo ciclo` con casilla explícita.

### 3.5.4 Créditos de recuperación

`makeupCredits = 0` al renovar (ADR-0139 §3). Si Dirección decide arrastrarlos, debe quedar en la nota del recibo y en `emergency_contact`.

## 3.6 Defectos adicionales a corregir (checklist)

- [ ] `set()` por **ID estricto** (`app-store.ts:3700`). Eliminar `isMatchingStudentName`.
- [ ] Persistir `balance`, `payment`, `amountPaid`, `planPrice`, `planType`, `modality`, `packageTotalSessions`, `scheduleLessons`.
- [ ] `useEffect` en lugar de `useMemo` (`renew-student-cycle-dialog.tsx:55`).
- [ ] Cerrar ciclo anterior con `effectiveUntil`.
- [ ] Confirmación con monto visible.
- [ ] Texto de garantía veraz.
- [ ] `durationMonths` derivado del plan.
- [ ] Bloqueo de paquete no consumido.
- [ ] Previsualización obligatoria del horario.

## 3.7 Verificación de la Parte 3

1. **Renovar a EITHAN en seco** (sin escribir en la base: usa el store en memoria o un entorno de prueba) y confirmar que la cuota resultante es 8 si se elige Regular.
2. Caso "mantener horario": el nuevo ciclo tiene 2 lecciones nuevas, mismas horas, IDs distintos, marcas vacías, `effectiveFrom = inicio`.
3. Caso "cambiar horario": el formulario bloquea aforo lleno y cruce de sala (probar con un turno al 5/5).
4. Caso Flexible no consumido: aparece el bloqueo y no se crea recibo.
5. Homónimos: renovar "EITHAN" no modifica "Eithan David Florindez Alguilar" (verificar por ID antes/después).
6. Tras recargar la página, el saldo y las fechas persisten (no vuelven al valor viejo).
7. `npm run build` + `npx tsc --noEmit -p tsconfig.json` sin errores nuevos.

---

# PARTE 4 — CAUSA RAÍZ DE LA PÉRDIDA DE FECHAS

## 4.1 El mecanismo

`performSyncStudentToDB` (`src/store/app-store.ts:621-789`) reconstruye el JSONB **desde el estado local**:

```ts
// línea 624 — lee el alumno del store local (puede estar desactualizado)
const currentStudent = useAppStore.getState().adminStudents.find((st) => isSameStudentId(st.id, studentId));

// líneas 699-702 — el JSONB se arma con ese snapshot + los campos puntuales
const ecData: Record<string, any> = {
  ...(typeof currentStudent?.emergencyContact === "object" ? currentStudent.emergencyContact : {}),
  ...(typeof updates.emergencyContact === "object" ? updates.emergencyContact : {}),
};

// línea 751 — se envía el objeto COMPLETO
payload.emergency_contact = ecData;
```

Y el `catch` final de la llamada **se traga el error**:

```ts
// línea 766-771
.catch((err) => {
  console.warn(`[Insforge Sync] Error sincronizando alumno ${resolvedStudentId}, intentando create:`, err);
  if (currentStudent) backgroundCreateStudentInDB(role, currentStudent);
});
```

### Secuencia que explica EITHAN

1. **19:24:29** — `renewStudentCycle` crea el recibo `c947e6e9` y encola la escritura del alumno (`planEndDate = 2026-11-18`, `makeupCredits = 0`) con debounce de 350 ms.
2. **19:27:17 / 19:42:48** — se marcan asistencias desde el Kardex (`Regularización Kardex`). Cada marcaje llama `backgroundSyncStudentToDB` con `scheduleLessons` y, por el diseño de `ecData`, **envía el `emergency_contact` completo del store de esa pestaña**.
3. Si esa pestaña tenía un snapshot anterior a la renovación (no había rehidratado), su `ecData` lleva `planEndDate = 2026-12-31` y `makeup_credits = 1`.
4. La última escritura gana. La renovación queda **sin efecto en la ficha**, pero **con efecto en facturación**.

Es exactamente el patrón de ADR-0119/ADR-0126 (§20 y §26 de `AGENTS.md`), aplicado a `emergency_contact`.

**Verificado:** ningún alumno tiene `planEndDate = 2026-11-18` proveniente de esa renovación, y la ficha de EITHAN conserva `2026-12-31` y `makeup_credits = 1`.

## 4.2 Corrección: leer antes de escribir

> Es la corrección más importante de todo el documento. Sin ella, cualquier arreglo de fechas se puede volver a perder el mismo día.

### 4.2.1 `performSyncStudentToDB` — base remota

Cambiar el armado de `ecData` para partir del registro **de PostgreSQL**, no del store local.

> ⚠️ `performSyncStudentToDB` (`app-store.ts:621`) **no es `async`**: la escritura ocurre dentro de un `import("@/lib/services/students.service").then(...)` en la línea 633. Ese callback **sí puede ser `async`**, y ahí va el `await`. No conviertas la función externa en `async`: cambiaría el orden de suscripción y el debounce.

```ts
import("@/lib/services/students.service").then(
  async ({ updateStudent, updateFamily, getStudentEmergencyContact }) => {
    // … mergedStudent y payload ya armados como hoy …

    const ecRemote = await getStudentEmergencyContact(resolvedStudentId); // GET acotado, 1 fila
    const ecData: Record<string, any> = {
      ...(ecRemote ?? (typeof currentStudent?.emergencyContact === "object" ? currentStudent.emergencyContact : {})),
      ...(typeof updates.emergencyContact === "object" ? updates.emergencyContact : {}),
    };

    // … resto del armado de ecData (líneas 704-749) SIN CAMBIOS …

    payload.emergency_contact = ecData;

    const syncRole: Role = role === "super_admin" || role === "staff" ? role : "staff";
    // … escritura + verificación: ver §4.2.3 …
  },
);
```

Requiere:

```ts
// src/lib/services/students.service.ts — función nueva, aditiva
// `postgrestSelect` vive en src/lib/insforge.ts:188 y su firma es
// (table, params, select = "*"). El `select` va como TERCER argumento,
// no dentro de `params`.
import { postgrestSelect } from "@/lib/insforge";

export async function getStudentEmergencyContact(
  studentId: string,
): Promise<Record<string, any>> {
  const rows = await postgrestSelect<{ emergency_contact: Record<string, any> | null }>(
    "students",
    { id: `eq.${studentId}`, limit: "1" },
    "emergency_contact",
  );
  return rows?.[0]?.emergency_contact ?? {};
}
```

> Si el proyecto ya importa `postgrestSelect` en `students.service.ts`, **no dupliques el import**: reutiliza el existente.

Coste: **1 lectura extra por escritura debounced**. Aceptable y muy inferior al coste de un dato perdido.

### 4.2.2 Defensa en profundidad (recomendada)

Aunque exista read-before-write, los **campos críticos de ciclo** no deben heredarse del snapshot local. Hay una trampa importante: `emergency_contact` es un JSONB que se **reemplaza completo**, así que *borrar* una clave del objeto que envías la **elimina de la base**. La regla correcta no es «eliminar del payload», sino «restaurar el valor remoto».

```ts
// DEBE ir DESPUÉS del bloque `if (mergedStudent.xxx) ecData.xxx = …`
// (líneas 704-749) y ANTES de `payload.emergency_contact = ecData`.
const CRITICAL = [
  "planStartDate", "planEndDate", "planStartMonth", "planEndMonth",
  "planType", "modality", "packageTotalSessions",
] as const;

for (const key of CRITICAL) {
  // Un campo es "explícito" si viene por `updates` o por `updates.emergencyContact`.
  const explicit =
    (updates as any)[key] ??
    ((updates.emergencyContact as Record<string, any> | undefined)?.[key]);
  if (explicit !== undefined) continue; // esta escritura SÍ lo cambia
  if (ecRemote && ecRemote[key] !== undefined) {
    ecData[key] = ecRemote[key]; // el remoto manda: restaura su valor
  } else {
    delete ecData[key];          // no existía remotamente: no lo inventamos
  }
}
```

Con esto, un marcaje de asistencia (`updates = { scheduleLessons }`) **no puede** tocar las fechas del ciclo, y tampoco puede **borrar** un `planType` que sí existe en PostgreSQL.

> ❌ **Antipatrón prohibido:** `for (const key of CRITICAL) if (!updates[key]) delete ecData[key];` sin consultar `ecRemote`. Si `ecRemote` no se leyó (por ejemplo, por un fallo de red), ese bucle borra de la base los campos de ciclo en cada sincronización.

### 4.2.3 Escribir, verificar y reintentar una vez

La llamada actual (`app-store.ts:754-771`) es una cadena `.then(...).catch(...)`, no `await`. Se mantiene ese estilo y se añade la verificación **solo cuando el payload tocó campos de ciclo**:

```ts
updateStudent(syncRole, resolvedStudentId, payload)
  .then(async (res) => {
    if (!res || !res.id) {
      if (currentStudent) backgroundCreateStudentInDB(role, currentStudent);
      return;
    }
    console.log(`[Insforge Sync] Alumno ${resolvedStudentId} (${mergedStudent.name}) sincronizado en PostgreSQL`);

    // Verificación read-after-write: solo si esta escritura traía campos de ciclo.
    const touchedCycle = CRITICAL.some((key) => (updates as any)[key] !== undefined);
    if (touchedCycle) {
      const check = await getStudentEmergencyContact(resolvedStudentId);
      const datesOk =
        check.planStartDate === ecData.planStartDate &&
        check.planEndDate === ecData.planEndDate;
      if (!datesOk) {
        console.warn(
          "[Insforge Sync][CRÍTICO] Fechas de ciclo no persistieron; reintentando una vez",
          { studentId: resolvedStudentId },
        );
        await updateStudent(syncRole, resolvedStudentId, {
          emergency_contact: {
            ...check,
            planStartDate: ecData.planStartDate,
            planEndDate: ecData.planEndDate,
          },
        });
      }
    }

    triggerDataSyncBroadcast("student-sync");
  })
  .catch((err) => {
    console.warn(`[Insforge Sync] Error sincronizando alumno ${resolvedStudentId}, intentando create:`, err);
    if (currentStudent) backgroundCreateStudentInDB(role, currentStudent);
  });
```

**No dejes el `catch` silencioso** para los campos de ciclo: registra en consola con `[Insforge Sync][CRÍTICO]` y muestra un `toast.error` al usuario que ejecutó la renovación. El `catch` genérico de create se conserva para los demás casos.

## 4.3 Verificación de la Parte 4

1. Renovar un alumno y, **en otra pestaña**, marcar asistencia en la misma fecha. Las fechas del ciclo deben **sobrevivir**.
2. En consola no debe aparecer `[Insforge Sync][CRÍTICO]`.
3. Tras recargar, `planStartDate`/`planEndDate`/`makeup_credits` coinciden con lo renovado.

---

# PARTE 5 — ORDEN DE EJECUCIÓN RECOMENDADO

```
1. Preflight (anexo A.1) + guardar log
2. Parte 1: pasos A → B → C → C2 → D → E
3. Verificación §1.4 (mismos scripts) + comparar tabla
4. Pregunta de decisión §2.4 → esperar respuesta de Dirección
5. Parte 2: aplicar el camino elegido (1, 2 o 3)
6. Parte 4: read-before-write + campos críticos + verificación (CÓDIGO)
7. Parte 3: renovación con horario (CÓDIGO)
8. Build + tsc
9. Documentación + commit + push
10. Verificación en la app real (no solo en local)
```

**¿Por qué la Parte 4 antes de la 3?** Porque el nuevo diálogo escribe fechas de ciclo. Si primero construyes el diálogo y después blindas la escritura, el bug de EITHAN reaparece durante tus pruebas.

---

# PARTE 6 — VERIFICACIONES OBLIGATORIAS

| # | Qué | Cómo | Criterio |
|---|---|---|---|
| 1 | Build | `npm run build` | Verde |
| 2 | Tipos | `npx tsc --noEmit -p tsconfig.json` | 0 errores **nuevos** en archivos tocados (hay ~843 preexistentes) |
| 3 | Fase 5 | anexo A.1 | Coincide con §1.4 |
| 4 | Fase 5 UI | abrir ficha de `2307efd3` | Cuenta familiar 850/850/0, 3 matrículas, saldo a favor 250 |
| 5 | Fase 5 UI | abrir ficha de `90191dc0` | Cuenta propia 394/364/30, sin hermanos |
| 6 | Fase 5 UI | abrir ficha de `50996819` | No aparece en cartera activa |
| 7 | EITHAN | Kardex + Horario | Cuota = la decidida en §2.4 |
| 8 | Renovación | prueba real | Horario nuevo con IDs nuevos y marcas vacías |
| 9 | Concurrencia | 2 pestañas | Fechas de ciclo sobreviven |
| 10 | Rutas | `/admin/alumnos`, `/admin/agenda`, `/teacher`, `/admin/facturacion` | HTTP 200 |

---

# PARTE 7 — ROLLBACK GENERAL

| Parte | Rollback |
|---|---|
| 1 | §1.5, en orden E→D→C2→C→B→A |
| 2 | Guardar **antes** el `emergency_contact` completo de EITHAN en el log. Restaurar ese JSONB. Si anulaste `c947e6e9`, revertir `concept`/`remaining_balance`/`status`. |
| 3 y 4 | `git revert` del commit. No hay datos que revertir (no escriben en producción por sí solos). |

**Regla:** antes de cualquier `PATCH` sobre `emergency_contact`, guarda el objeto completo en el log. Es tu único rollback fiel.

---

# PARTE 8 — ENTREGABLES DE DOCUMENTACIÓN

Todo en el **mismo commit** que el código:

1. `docs/adr/0191-consolidacion-familias-duplicadas-y-renovacion-con-horario.md`
   - Contexto, decisiones, alternativas descartadas, consecuencias.
   - Debe cubrir: Fase 5 (datos), cuota contractual, renovación con horario, read-before-write.
2. `docs/logs/2026-11-09-fase5-luciana-consolidacion.log` (requiere `git add -f`)
   - Preflight, cada PATCH con su payload, verificación posterior, totales antes/después.
3. `docs/logs/2026-11-09-renovacion-horario-y-blindaje-fechas.log`
   - Diagnóstico EITHAN, decisión de Dirección, cambios de código, pruebas.
4. `docs/CHANGELOG.md` → **`[2.0.65]`** (la última publicada es `[2.0.64]`, del 2026-11-05).
5. `AGENTS.md` → nueva sección numerada **§96** (la última existente es §95, «Cuenta Familiar de Solo Lectura»).
6. Push a `origin main` **y** `core main`, verificado:
   ```
   git ls-remote origin main
   git ls-remote core main
   ```
   Ambos SHA deben coincidir con `HEAD`.

---

# ANEXO A — Scripts de verificación

> Ejecutar desde la raíz del repo. Configura primero:
> ```powershell
> $env:INSFORGE_ANON_KEY = "<la key de .env.local>"
> ```
> Todos los scripts son **solo lectura** salvo el A.2, que exige `--apply`.

## A.1 `scripts/fase5-preflight.mjs` (lectura)

```js
// Solo lectura. Guarda un snapshot completo antes/después de la Fase 5.
const KEY = process.env.INSFORGE_ANON_KEY;
if (!KEY) throw new Error("Falta INSFORGE_ANON_KEY");
const HOST = "https://pdey9yma.us-east.insforge.app/api/database/records";

const IDS = {
  mendoza:       "90191dc0-b554-42bb-be64-4488fd447389",
  parA_piano:    "2307efd3-4553-4676-9e7a-027334e90015",
  parA_canto:    "57ee3ecc-21ed-48d1-9f95-2e61f150ca6f",
  parB_piano:    "50996819-923e-4f0d-8d8a-7c77180285dc",
  parB_canto:    "b32540d1-753d-426d-8270-a3ed0b7058d6",
  conEspacio:    "f630d6df-36c0-41ff-80fb-c4fce40724fd",
  eithan:        "d245066a-4f1e-4cb1-99ef-0695dc0fb68d",
};

async function get(path) {
  const r = await fetch(`${HOST}/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) throw new Error(`${path} -> ${r.status} ${await r.text()}`);
  return r.json();
}

console.log("=== FICHAS ===");
for (const [label, id] of Object.entries(IDS)) {
  const s = (await get(`students?select=id,full_name,status,family_id,makeup_credits,emergency_contact&id=eq.${id}`))[0];
  if (!s) { console.log(`${label}: NO ENCONTRADO`); continue; }
  const ec = s.emergency_contact || {};
  console.log(`\n[${label}] ${s.id}`);
  console.log(`  "${s.full_name}" | ${s.status} | family=${s.family_id} | makeup=${s.makeup_credits}`);
  console.log(`  personGroupId=${ec.personGroupId ?? "(ausente)"} | label=${ec.personGroupLabel ?? "(ausente)"}`);
  console.log(`  planType=${ec.planType} | modality=${ec.modality} | pts=${ec.packageTotalSessions}`);
  console.log(`  plan=${ec.planPrice}/${ec.amountPaid}/${ec.balance} | inicio=${ec.planStartDate} fin=${ec.planEndDate}`);
  console.log(`  creditBalance=${ec.creditBalance ?? "(ausente)"} | clavesEC=${Object.keys(ec).length} | lecciones=${(ec.scheduleLessons || []).length}`);
}

console.log("\n=== ATTENDANCE_LOGS 2026-11-04 (par A y par B canto) ===");
for (const id of [IDS.parA_canto, IDS.parB_canto]) {
  const logs = await get(`attendance_logs?select=id,student_id,status,note,registered_at&student_id=eq.${id}&order=registered_at.asc`);
  console.log(`${id} -> ${logs.length}`);
  for (const l of logs) console.log(`   ${l.id} | ${l.status} | "${l.note}" | ${l.registered_at}`);
}

console.log("\n=== RECIBOS DE LUCIANA ===");
const inv = await get("invoices?select=id,family_id,concept,amount,amount_paid,remaining_balance,status,due_date&concept=ilike.%25luciana%25&order=created_at.asc");
for (const i of inv) {
  console.log(`  ${i.id} | fam=${i.family_id} | "${i.concept}"`);
  console.log(`     ${i.amount}/${i.amount_paid} saldo=${i.remaining_balance} ${i.status} due=${i.due_date}`);
}

console.log("\n=== EITHAN: RECIBOS ===");
const eInv = await get("invoices?select=id,concept,amount,amount_paid,remaining_balance,status,due_date,created_at&concept=ilike.%25EITHAN%25&order=created_at.asc");
for (const i of eInv) {
  console.log(`  ${i.id} | "${i.concept}"`);
  console.log(`     ${i.amount}/${i.amount_paid} saldo=${i.remaining_balance} ${i.status} due=${i.due_date} creado=${String(i.created_at).slice(0, 19)}`);
}
```

## A.2 `scripts/fase5-apply.mjs` (escritura, con `--dry-run` obligatorio primero)

```js
// node scripts/fase5-apply.mjs --dry-run   → muestra los 7 PATCH, sin escribir
// node scripts/fase5-apply.mjs --apply     → los ejecuta
const KEY = process.env.INSFORGE_ANON_KEY;
if (!KEY) throw new Error("Falta INSFORGE_ANON_KEY");
const HOST = "https://pdey9yma.us-east.insforge.app/api/database/records";
const APPLY = process.argv.includes("--apply");

const IDS = {
  mendoza:    "90191dc0-b554-42bb-be64-4488fd447389",
  parA_piano: "2307efd3-4553-4676-9e7a-027334e90015",
  parB_piano: "50996819-923e-4f0d-8d8a-7c77180285dc",
  parB_canto: "b32540d1-753d-426d-8270-a3ed0b7058d6",
  conEspacio: "f630d6df-36c0-41ff-80fb-c4fce40724fd",
  logAusente: "e9714109-431a-4c13-bbb2-5411c258ed5f",
  reciboAnular: "55ae6b2c-4780-4b1d-9fcc-496a67363dd3",
};
const PERSONA = "f8fc5eef-78dc-472b-bfa8-3b81720633be";

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

// Fecha real de ejecución en zona Lima (YYYY-MM-DD).
const TODAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Lima",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

async function getOne(path) {
  const r = await fetch(`${HOST}/${path}`, { headers });
  if (!r.ok) throw new Error(`${path} -> ${r.status} ${await r.text()}`);
  const rows = await r.json();
  if (rows.length !== 1) throw new Error(`${path} -> se esperaba 1 fila, llegaron ${rows.length}`);
  return rows[0];
}

async function patch(table, id, body, label) {
  console.log(`\n--- ${label}`);
  console.log(JSON.stringify({ table, id, body }, null, 2));
  if (!APPLY) return;
  const r = await fetch(`${HOST}/${table}?id=eq.${id}`, {
    method: "PATCH", headers, body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${label} -> ${r.status} ${await r.text()}`);
  console.log(`    OK (${r.status})`);
}

const ecOf = async (id) => (await getOne(`students?select=emergency_contact&id=eq.${id}`)).emergency_contact || {};

// A) Mendoza: quitar el vínculo
{
  const ec = await ecOf(IDS.mendoza);
  const next = { ...ec };
  delete next.personGroupId;
  delete next.personGroupLabel;
  await patch("students", IDS.mendoza, { emergency_contact: next }, "A · separar Mendoza");
}

// B) f630d6df: vincular al par A
{
  const ec = await ecOf(IDS.conEspacio);
  await patch("students", IDS.conEspacio, {
    emergency_contact: { ...ec, personGroupId: PERSONA, personGroupLabel: "Piano + Canto" },
  }, "B · vincular 'Luciana ' al par A");
}

// C) par B a baja
await patch("students", IDS.parB_piano, { status: "baja" }, "C · par B Piano -> baja");
await patch("students", IDS.parB_canto, { status: "baja" }, "C · par B Canto -> baja");

// C2) mover el log
await patch("attendance_logs", IDS.logAusente, { student_id: "57ee3ecc-21ed-48d1-9f95-2e61f150ca6f" }, "C2 · mover log 2026-11-04");

// D) anular el recibo
{
  const inv = await getOne(`invoices?select=id,concept,remaining_balance,status&id=eq.${IDS.reciboAnular}`);
  // Guarda de idempotencia: re-ejecutar el script no debe duplicar el prefijo.
  if (inv.concept.startsWith("[ANULADO")) {
    console.log("\n--- D · recibo ya anulado, se omite (idempotente)");
  } else {
    await patch("invoices", IDS.reciboAnular, {
      concept: `[ANULADO ${TODAY} · duplicado del par A · no cobrado] ${inv.concept}`,
      amount_paid: 0,
      remaining_balance: 0,
      status: "pagado",
    }, "D · anular recibo 55ae6b2c");
  }
}

// E) saldo a favor
{
  const ec = await ecOf(IDS.parA_piano);
  await patch("students", IDS.parA_piano, {
    emergency_contact: {
      ...ec,
      creditBalance: 250,
      creditNote: `Saldo a favor por S/ 250 cobrados del Piano del registro duplicado (par B), archivado el ${TODAY}. No aplicado automáticamente; requiere aplicación manual de secretaría.`,
      creditSetAt: TODAY,
    },
  }, "E · saldo a favor S/ 250");
}

console.log(APPLY ? "\n✅ Aplicado. Ejecuta el preflight para verificar." : "\nℹ️ Dry-run. Nada se escribió.");
```

## A.3 `scripts/audit-cuotas.mjs` (lectura)

```js
// Detecta alumnos activos cuya cuota no coincide con su plan.
const KEY = process.env.INSFORGE_ANON_KEY;
const HOST = "https://pdey9yma.us-east.insforge.app/api/database/records";
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const quotaForPlan = ({ planType, modality, packageTotalSessions }) => {
  const mod = String(modality || "").toLowerCase();
  const pt = String(planType || "").toLowerCase();
  const raw = Number(packageTotalSessions);
  if (mod.includes("nivelaci") || pt.includes("demo")) return 1;
  if (mod.includes("inten") || mod.includes("90 min") || (mod.includes("4 clases") && !mod.includes("45 min"))) return 4;
  const flex = mod.includes("flex") || mod.includes("demanda") || mod.includes("paquete") || pt.includes("flexible") || pt.includes("especial");
  if (flex) return Number.isFinite(raw) && raw > 0 ? raw : 24;
  return 8;
};

const rows = await (await fetch(`${HOST}/students?select=id,full_name,modality,emergency_contact&status=eq.activo&limit=500`, { headers })).json();
let bad = 0;
for (const s of rows) {
  const ec = s.emergency_contact || {};
  const expected = quotaForPlan({ planType: ec.planType, modality: ec.modality || s.modality, packageTotalSessions: ec.packageTotalSessions });
  const declared = Number(ec.packageTotalSessions);
  if (Number.isFinite(declared) && declared !== expected) {
    bad++;
    console.log(`⚠ ${s.id} | ${s.full_name} | declarado=${declared} esperado=${expected} | ${ec.planType} · ${ec.modality}`);
  }
}
console.log(`\nTotal con desajuste: ${bad} de ${rows.length} activos`);
```

**Resultado esperado hoy:** **2 desajustes** → `Stefano Yrco Samaniego` y `ALEXIS` (Intensivo con `packageTotalSessions = 8`).

> EITHAN **no** aparece aquí: su `packageTotalSessions = 12` es coherente con su `planType = "Paquete Flexible"` declarado. Su problema es distinto (el plan contractual está mal, no la coherencia interna) y se resuelve en §2.5.

---

# ANEXO B — Checklist de cierre

```
[ ] Preflight ejecutado y guardado en docs/logs/
[ ] Fase 5: A, B, C, C2, D, E aplicados
[ ] Verificación §1.4 coincide (850/850/0 · 394/364/30 · −500/−250/−250)
[ ] Rollback documentado y probado en dry-run
[ ] Decisión §2.4 obtenida por escrito
[ ] EITHAN corregido según el camino elegido
[ ] Stefano y ALEXIS reportados a Dirección
[ ] Parte 4 implementada (read-before-write + campos críticos + reintento)
[ ] Parte 3 implementada (horario + plan + bloqueo de paquete)
[ ] npm run build verde
[ ] npx tsc --noEmit sin errores nuevos
[ ] Prueba real de renovación con horario nuevo
[ ] Prueba de concurrencia entre 2 pestañas
[ ] ADR + 2 logs + CHANGELOG + AGENTS.md
[ ] Push a origin/main y core/main verificado con git ls-remote
[ ] Verificación en la app desplegada (no solo local)
```

---

## Resumen en 5 líneas

1. **Fase 5 (Luciana):** 6 registros → 3 reales. Mendoza se separa, par B se archiva en `baja`, su recibo pendiente se anula, y los S/ 250 cobrados quedan como saldo a favor.
2. **EITHAN tiene 12 clases porque la base dice `packageTotalSessions = 12` + `planType = "Paquete Flexible"`.** No es un error de cálculo; los tres motores usan ese número como cuota.
3. **La renovación no lo arregló porque nunca escribe el plan** (`planType`/`modality`/`packageTotalSessions`), así que el 12 se hereda.
4. **Las fechas tampoco cambiaron** porque un marcaje de asistencia posterior (19:27, tres minutos después del recibo de 19:24) reescribió `emergency_contact` con un snapshot viejo. Se blinda con read-before-write.
5. **La renovación debe ofrecer horario y plan**, previsualizar el horario actual y bloquear la renovación de un paquete con sesiones sin consumir.
