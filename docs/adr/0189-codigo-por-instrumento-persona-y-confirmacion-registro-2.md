# ADR-0189 — Código por instrumento, ficha de persona con Kardex y confirmación visible del Registro 2

- **Fecha**: 2026-11-05
- **Estado**: Aceptado · Fases 0–3 implementadas (sin dinero). Fases 4–7 pendientes.
- **Base**: `main` @ `07c82b6`
- **Relacionado**: ADR-0186 (misma persona, varios instrumentos), ADR-0188 (Registro 2),
  ADR-0107 (deduplicación de alumnos), ADR-0119 (prohibido reimplementar lógica en cada vista),
  ADR-0125 (aislamiento por ID), ADR-0132 (base activa), ADR-0175/0180/0183 (informes).
- **Plan**: `docs/PLAN_QUIRURGICO_REGISTRO_2_CODIGOS_KARDEX.md`

---

## 1. Contexto y problema real

Un alumno puede contratar **2 o 3 instrumentos**. Eso produce:

| Nivel | Qué es | Entidad |
|---|---|---|
| Persona | Luciana (una sola) | `personGroupId` |
| Matrícula | Piano + Canto: docente, sala, horario y Kardex propios | `students.id` |
| Cuenta familiar | Quien paga (apoderado) | `family_id` + bolsa de abonos |

Antes de este ADR, el multi-instrumento existía **solo** en el Registro 2 (alta), en la
agrupación visual de `/admin/facturacion`, en el diálogo de vincular y en el aviso de borrado.
En la práctica eso significaba:

1. **Nadie sabía qué se acababa de crear.** El modal del Registro 2 se cerraba tras el
   `toast` y no quedaba rastro concreto de las matrículas ni acceso a su Kardex.
2. **No había un identificador corto y dictable.** Para hablar de "la matrícula de Piano"
   había que usar el nombre (que se repite: `Luciana` / `Luciana (Canto)`) o un UUID de 36
   caracteres imposible de dictar por teléfono.
3. **La ficha del alumno no mostraba a la persona.** El botón "Vincular con otro instrumento"
   aparecía suelto en *cualquier* ficha, sin contexto, y desde Piano no se podía llegar al
   Kardex de Canto en un clic.

## 2. Decisiones

### 2.1 Código derivado del UUID, sin DDL (D2 cerrada por Dirección)

- `studentCode(id)` → `VM-2307EF` desde el UUID de la matrícula.
- `personCode(personGroupId)` → `VM-F8FC5E` desde el grupo de persona.
- Ids heredados que no son UUID (semillas `st-001`) obtienen código vía hash **FNV-1a**.
- **No hay columna ni migración.** El código no es fuente de verdad: es una **vista
  determinista** del UUID. Misma fila ⇒ mismo código en cualquier dispositivo, siempre.
- Se usa el prefijo `VM` y 6 caracteres hexadecimales: suficiente para la base actual y
  legible al dictarlo.

### 2.2 La tarjeta «Persona · N matrículas» es la vista operativa

En el drawer de la ficha, cuando el alumno tiene `personGroupId` con 2+ matrículas:

```
Persona · 2 matrículas                     VM-F8FC5E
  Piano  VM-2307EF · Prof. Fernando · Sala B · Lun 16:00 · Mié 16:00   [📖 Kardex] [✏️ Ficha]
  Canto  VM-57EE3E · Prof. Nathaly · Sala C · Mar 18:15 · Jue 18:15    [📖 Kardex] [✏️ Ficha]
  Son matrículas distintas (docente, sala, horario y plan propios).
```

- Cada fila abre **su propio Kardex** (`setKardexStudent(member)`) y **su propia ficha**.
- El botón "Vincular con otro instrumento" queda como **acción secundaria** y solo se muestra
  cuando la persona no está vinculada, con el texto explícito:
  *"Úsalo solo si registraste a la misma persona dos veces por separado"*.
- La agrupación usa exclusivamente `personGroupId`. Un candidato detectado por
  nacimiento + apoderado pero **sin vincular** no se muestra como si ya lo estuviera
  (no se inventa el vínculo).

### 2.3 Confirmación visible al terminar el Registro 2

Tras registrar, se abre un diálogo de confirmación (el formulario se cierra y se limpia):

```
✓ Matrícula multi-instrumento registrada
  Luciana quedó en 2 matrículas. Cada instrumento tiene su código y su Kardex.
  Piano  VM-2307EF   [📖 Kardex]
  Canto  VM-57EE3E   [📖 Kardex]
  Contratado S/ 634.00 · Abonado S/ 600.00 · Pendiente S/ 34.00 · A favor S/ 0.00
```

- Los datos se leen del **store real** después de crear (`useAppStore.getState()`), de modo
  que los códigos corresponden al UUID definitivo que generó `addNewStudent`.
- Si por cualquier motivo no se pudieran leer, se muestra un aviso honesto pidiendo recargar;
  **no se inventan códigos**.
- No se muestran montos nuevos: son los mismos del formulario (contratado, abonado,
  pendiente, saldo a favor). El excedente **no** se aplica automáticamente.

### 2.4 Búsqueda por código en el directorio

`matchesStudentCode(id, search)` acepta `VM-2307EF`, `2307ef`, `2307 EF` y exige al menos
2 caracteres útiles para **no secuestrar** búsquedas normales por nombre.

## 3. Implementación

| Archivo | Cambio |
|---|---|
| `src/lib/student-code.ts` **(nuevo)** | `formatStudentCode`, `studentCode`, `personCode`, `normalizeCodeQuery`, `matchesStudentCode`, `describeStudentCode`. Función pura, sin red. |
| `src/components/admin/students-table.tsx` | Búsqueda por código; badges de código de matrícula y de persona en la cabecera del drawer; tarjeta «Persona · N matrículas»; "Vincular" degradado a acción secundaria; `onOpenKardex` del Registro 2. |
| `src/components/admin/student-attendance-kardex.tsx` | Código de matrícula + código de persona en la cabecera del Kardex. |
| `src/components/admin/multi-instrument-enrollment.tsx` | Estado `EnrollmentConfirmation`; lectura del store de las matrículas creadas; diálogo de confirmación con códigos y `onOpenKardex`. |

### 3.1 Nada de esto se tocó

- `kardex-calculator.ts` y `student-cycle.ts`: **intactos**.
- Registro 1 (`NewStudentDialog`): **intacto**.
- Recibos, `payment_audit_logs`, montos, `students.notes`, `notification_logs`: **intactos**.
- Ningún `ALTER TABLE`, ningún borrado, ninguna escritura de datos.

## 4. Verificación

1. `npm run build` en verde.
2. `npx tsc --noEmit` filtrado: **0 errores nuevos** en los archivos tocados (§92). Los errores
   preexistentes del repo siguen igual (no se tocaron esos tramos).
3. Runtime con datos vivos (`scratch/test-adr-0189-codigos.mjs`): **15/15**
   - determinismo, formato `VM-XXXXXX`, prefijo del UUID, id heredado, `null`, código de persona;
   - búsqueda por código (sufijo, prefijo con espacios, término corto, nombre normal, otro código);
   - **62 alumnos activos → 62 códigos únicos** (sin colisión);
   - Luciana: las 4 matrículas visibles con su código (Piano/Canto par A con `VM-F8FC5E`;
     Piano par B `VM-18B657`; Canto par B sin vínculo).

## 5. Fase 0 — contención

El 409 de `families_pkey` **ya estaba absorbido** en `ensureFamilyRecord` (comparte la promesa
en vuelo y devuelve éxito ante `23505/duplicate key`). No queda ningún `console.warn` propio de
ese caso en el código de aplicación: el ruido que se ve en el navegador es la respuesta HTTP
original de PostgREST, no un log nuestro. **No se requirió cambio.**

## 6. Pendiente (no incluido en este ADR)

- **Fases 4–5 (dinero)**: Cuenta Familiar con bolsa de abonos y consolidación asistida de
  matrículas duplicadas. Requieren revisión con Dirección antes de ejecutar
  (ver §3 del plan).
- **Fase 6**: quitar el sufijo `"(Canto)"` exige primero corregir la deduplicación de
  homónimos de `hydrateFromBackend` (ADR-0107/0119). **Prohibido** quitarlo antes.
- **Código en concepto/referencia del recibo**: se difiere a las fases de dinero para no
  tocar el pipeline de facturación en un cambio sin cobertura funcional.
- **Fase 7**: bug del docente en `/teacher/informes` — bloqueado hasta tener la consola real
  del dispositivo de Jeremy (ADR-0120).

## 7. Consecuencias

- Secretaría puede dictar por teléfono un código de 6 caracteres y localizar exactamente una
  matrícula, sin ambigüedad entre instrumentos homónimos.
- Desde una ficha se llega al Kardex del otro instrumento en un clic, que es donde realmente
  se trabaja la asistencia.
- Cero riesgo de datos: el código no se persiste y la confirmación no escribe nada nuevo.
