# ADR-0195: Depuración sistemática de errores de TypeScript por causa raíz

**Estado:** Aceptado · **Fecha:** 2026-11-18 · **Alcance:** repo `maestro-mentor-guide`

## 1. Contexto

El repo arrastraba **568 errores** de `tsc --noEmit`. `npm run build` (esbuild)
transpila sin verificar scopes ni tipos, así que un build verde **no** garantiza
que la app arranque (lección del incidente de `multiEnrollmentOpen`, ADR-0092 /
§92 de `AGENTS.md`). Los errores se concentraban en contratos de datos
desactualizados, ramas muertas y accesos a campos que nunca se escribieron.

## 2. Decisiones

1. **Agrupar por causa raíz, no por archivo.** Un mismo contrato roto genera
   decenas de errores en sus consumidores; se arregla el contrato una sola vez.
2. **Cero casting que oculte el problema.** Prohibidos `as any` y
   `as unknown as`. Se ensanchan los tipos reales, se eliminan ramas
   demostrablemente muertas y se crean alias/payloads con nombre cuando el
   objeto no tenía tipo.
3. **Comparación de regresiones por `(archivo, código TS)`**, no por texto del
   mensaje: los números de línea se desplazan con cada edición y un diff de
   cadenas produce falsos positivos. Criterio: **0 claves con conteo mayor**
   respecto al lote anterior.
4. **`emergency_contact` es una superficie de persistencia, no un saco de
   datos.** `EmergencyContact` declara ahora el contrato completo del JSONB
   (contacto, plan, cobros, pack de útiles, vigencias, asistencia,
   `scheduleLessons`, saldo a favor y `personGroup*`; ADR-0186/0188/0190/0191/0194).
   Es la fuente única para leerlo y escribirlo. **Sin DDL.**
5. **Roles de invitación separados por destino.** `InviteTargetRole` es el enum
   SQL (`teacher` | `family`, verificado en PostgreSQL); `InviteEffectiveRole`
   es el modelo de lectura (`| "staff"`). `toPersistedInviteRole` es el único
   traductor: `staff` se persiste como `teacher` y se reconoce por correo
   institucional (ADR-0174). `invitationRoleLabel` centraliza la etiqueta.
6. **Un único normalizador de método de pago** (`normalizePaymentMethodDB`) para
   la lectura desde PostgreSQL.
7. **La papelera lee desde el snapshot.** `DeletedStudentLog.studentSnapshot`
   contiene la ficha completa; los campos de contacto y modalidad **nunca**
   existieron en la raíz del log. `resolveContactInfo` es el único punto de
   lectura (ADR-0119.3: una sola implementación de la lógica compartida).

## 3. Cambios entregados

| Lote | Commit | Errores | Fix | Regresiones |
|---|---|---|---|---|
| 1 | `2f9c07d` | 568 → 520 | 48 | 0 |
| 2 | `0027030` | 520 → 393 | 127 | 0 |
| 3 | `bf6902c` | 393 → 360 | 33 | 0 |

**Lote 1 — ramas muertas y contratos de UI.** `setActivePair` → el API real
`setSelectedPairIndex`; guardas `!== "pendiente"` retirados en 4 vistas porque
`attendanceByDate` solo contiene `presente|ausente|tarde|justificada`; imports
de tipos faltantes; color `"PARCIAL"` → `"parcial"` (el bloque de abono del
libro ahora sí renderiza) y `"zinc"` → `"gray"` (pausa/baja ya no se pintan de
verde); rol `staff` enviado al enum SQL corregido; comparaciones imposibles
`super_admin`/`admin` eliminadas.

**Lote 2 — contrato del JSONB.** `EmergencyContact` ensanchado;
`DBStudent.emergency_contact: EmergencyContact | null`; `modality` tipada como
`LessonModality | null` (columna con enum `lesson_modality_enum`, ADR-0112);
alias `DBStudentUpdate`, `DBStudentCreate` y `DBFamilyUpdate` como fuente única
de los payloads de escritura; `payload`, `ecData` y `famPayload` en `app-store.ts`
dejan de ser `Record<string, unknown|any|string>`. 170 accesos TS4111 y 7 TS2339
desaparecen sin cambiar un solo valor escrito o leído.

**Lote 3 — papelera.** Ver §2.7. Efecto funcional real: el buscador por teléfono
y las columnas Papa/Mamá/Modalidad del CSV dejaron de salir vacías.

## 4. Restricciones cumplidas

- Sin `ALTER TABLE`, `DROP`, `TRUNCATE` ni borrado masivo.
- Sin `as any` ni `as unknown as` nuevo; se eliminaron los existentes en los
  archivos tocados.
- `kardex-calculator.ts` y `student-cycle.ts` **intactos** (motores de ciclo).
- `isMatchingStudentName` / `normalizeStudentName` **intactos** (ADR-0107/0119).
- Sin tocar asistencia, facturación, `attendance_logs` ni `payment_audit_logs`.
- `npm run build` verde en cada lote.

## 5. Verificación

- `npx tsc --noEmit -p tsconfig.json` volcado a `scratch/.tsc-fix11.txt` …
  `.tsc-fix16.txt` y comparado con el script de bucketing `(archivo, código)`.
- `npm run build` → `✓ built in 844 ms`, `BUILD_EXIT=0`.
- Filtro de errores por archivo tocado: 0 errores nuevos en cada uno (AGENTS §92).

## 6. Pendiente

Quedan **360 errores**. Siguientes causas raíz, en orden: `progress-report-format.ts`
(30), `students-table.tsx` (29), `invitations.service.ts` (29), `laya-engine.ts`
(18), `progress-reports.service.ts` (16), `evaluations.service.ts` (15), y los
clusters TS18048/TS2532/TS2345/TS2322/TS2379. Cada lote conserva el mismo
protocolo de verificación y su entrada en `docs/logs/`.
