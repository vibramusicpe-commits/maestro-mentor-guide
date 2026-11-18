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
8. **Los snapshots del JSONB de informes tienen tipo.** `ReportContent` declara
   las claves que el propio servicio escribe en `progress_reports.content`
   (mantiene el índice libre para filas históricas). `asRecord<T>` es el único
   punto de parseo; acceso por corchete solo donde el objeto sí es dinámico.
9. **Lectura y escritura de invitaciones son tipos distintos.** `DBInvitation`
   es el modelo de lectura (sin secretos); `DBInvitationWrite` declara las
   columnas que realmente se INSERT/PATCHean (incluye `master_password`).
   Los índices de respuestas PostgREST se acceden con `?.[0]` y se validan.
10. **Los payloads de matrícula declaran lo que el store consume.**
    `addNewStudent` acepta `teacherNote?` y `balance?` (el store ya los leía);
    las props opcionales de funciones se pasan por spread condicional
    (AGENTS §92.4), nunca como `undefined` explícito.
11. **Estructuras auxiliares completas.** La matriz de Levenshtein se inicializa
    con todas sus celdas (antes era dispersa); los tokens se leen con `?? ""`.
    Mismo algoritmo, sin cambios en el matching fonético de ADR-0141.
12. **`ScheduledLesson` refleja el JSONB real.** Todas sus claves opcionales
    aceptan `undefined` explícito (ADR-0118.4), eliminando TS2379/TS2375 en
    todos los constructores de lección sin casts en los llamadores.
13. **Confirmación contra datos vivos (MCP Insforge, solo lectura).** Los
    contratos tipados se validan contra PostgreSQL antes de darlos por buenos:
    `evaluation_fields.ui_config.draft` y `progress_reports.content.*`
    (criteria = array, student = object). El acceso por corchete se reserva a
    claves verdaderamente dinámicas (filtros PostgREST y JSONB libre).

## 3. Cambios entregados

| Lote | Commit | Errores | Fix | Regresiones |
|---|---|---|---|---|
| 1 | `2f9c07d` | 568 → 520 | 48 | 0 |
| 2 | `0027030` | 520 → 393 | 127 | 0 |
| 3 | `bf6902c` | 393 → 360 | 33 | 0 |
| 4 | `4d7990f` | 360 → 330 | 30 | 0 |
| 5 | `c4df3f0` | 330 → 301 | 29 | 0 |
| 6 | `168f9b4` | 301 → 268 | 33 | 0 |
| 7 | `f95b3cc` | 268 → 252 | 16 | 0 |
| 8 | `cde9237` | 252 → 238 | 14 | 0 |
| 9 | `a3e3288` | 238 → 222 | 16 | 0 |

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

**Lote 4 — informes de progreso.** Ver §2.8. 30 TS4111 eliminados; se retiran
además los `as unknown as` de `plan`, `evidence` y del resumen de asistencia
legado. Los tipos `ageCategory` y `period.label` se ampliaron a `| null` porque
el servicio ya escribía `null` allí (el error TS2322 resultante se corrigió en
el tipo, no con un cast).

**Lote 5 — invitaciones.** Ver §2.9. 29 errores eliminados (3 TS2561, 18
TS18048/TS2532, TS2345/TS2379). Sin cambios en la verificación de vigencia
permanente del personal (ADR-0174) ni en el enum SQL.

**Lote 6 — matrícula y horario.** Ver §2.10. 33 errores eliminados en
`students-table.tsx`, `room-compatibility.ts`, `app-store.ts` y
`student-cleanup-panel.tsx`. La compatibilidad pedagógica **no cambió**: solo
se declaró que `modality`/`instrument` de una lección pueden venir `undefined`
del JSONB. Un error enmascarado en el alta por CSV (`student-cleanup-panel`)
salió a la luz al corregir el payload y se cerró completando `level`,
`birthdate` y `emergencyContact`.

**Lote 7 — Laya.** Ver §2.11. 16 errores eliminados en el motor Sistema 1 sin
tocar esquemas, plantillas ni el matching de homónimos (ADR-0141).

**Lote 8 — lecciones opcionales.** Ver §2.12. 14 errores eliminados de forma
global: el tipo de `ScheduledLesson` ahora coincide con lo que el JSONB real
entrega. Ninguna regla de visibilidad ni de ciclo se modificó.

**Lote 9 — servicio de informes.** Ver §2.13. 16 TS4111 eliminados al dejar de
recastear `content` (ya tipado en el lote 4). El bloqueo de criterios en
borrador (ADR-0175) sigue idéntico y se verificó contra datos vivos.

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

Quedan **222 errores**. Siguientes causas raíz, en orden: `evaluations.service.ts`
(18), `progress-reports.service.ts` (16), `evaluations.service.ts` (15), y los
clusters TS18048/TS2532/TS2345/TS2322/TS2379. Cada lote conserva el mismo
protocolo de verificación y su entrada en `docs/logs/`.
