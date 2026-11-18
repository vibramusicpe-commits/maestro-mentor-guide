# 2026-11-18 — ADR-0195: depuración de TypeScript, lotes 1 a 4

## Lote 1 — `2f9c07d` (568 → 520, 48 fix, 0 regresiones)

- `agenda-board.tsx`: `setActivePair(` → `setSelectedPairIndex(` (9 sitios, API
  real del store); import de `AgeCategory`; 4 guardas `!== "pendiente"` muertas.
- `alerts-panel.tsx` / `students-table.tsx`: imports de tipos `ScheduledLesson`
  y `VibraPlanType`; `"PARCIAL"` → `"parcial"` (2 sitios) — el bloque de abono
  del pack de útiles estaba inalcanzable; 2 `else if (isAdult)` muertos.
- `student-renewals-retention-panel.tsx`: `"zinc"` → `"gray"` (pausa/baja).
- `time-tracking.service.ts`: línea duplicada del filtro eliminada.
- `invoices.service.ts`: `normalizePaymentMethodDB` nueva fuente única;
  `app-store.ts` la usa para `dbMethod`/`cleanMethod` (3 casts menos).
- `invitations.service.ts`: `InviteEffectiveRole`, `invitationRoleLabel`,
  `toPersistedInviteRole`; `admin.invitaciones.tsx` persiste `staff` como
  `teacher` (el enum SQL rechazaba `staff` y la invitación solo quedaba en el
  `localStorage` de ese navegador); 6 guardas `super_admin` muertas y 2
  ternarios de etiqueta duplicados → helper.
- `invite.$token.tsx`, `minimal-agenda-calendar.tsx`, `teacher.index.tsx`:
  comparaciones muertas retiradas.

## Lote 2 — `0027030` (520 → 393, 127 fix, 0 regresiones)

- `admin-seeds.ts`: `EmergencyContact` pasa de 3 claves al contrato completo del
  JSONB sin DDL (ver ADR-0195 §2.4).
- `students.service.ts`: `DBStudent` tipado contra las columnas reales; `ec` es
  `Partial<EmergencyContact>` sin cast; alias `DBStudentUpdate`,
  `DBStudentCreate`, `DBFamilyUpdate`; `setStudentModality` sin `as any`.
- `app-store.ts`: `payload`, `ecData` y `famPayload` usan esos tipos. `ecData`
  siembra `name/phone/relation` para satisfacer las claves obligatorias sin
  alterar los valores reales del spread.
- Efecto: 65 TS4111 en `students.service.ts` y 7 TS2339 en
  `laya-realtime-matcher.ts` → 0; 56 TS4111 en `app-store.ts` → 1.

## Lote 3 — `bf6902c` (393 → 360, 33 fix, 0 regresiones)

- `deleted-students-trash-modal.tsx`: los 33 TS2339 revelaron un bug real.
  `deleteStudent` (`app-store.ts:2335`) y `deleteStudents` (`:2371`) guardan
  `studentSnapshot: { ...student }`; la vista leía 6 campos desde la raíz del
  log, que nunca los tuvo. Ahora `resolveContactInfo()` los lee del snapshot y
  alimenta filtro, CSV, copia de teléfonos, WhatsApp promo y ficha de contactos.
- Selector de fecha sin `(v: any)`: `isDateFilterValue` con `DATE_FILTERS`.
- Commit: `git add … && git commit -F scratch/.commit-msg-fix16.txt`.

## Lote 4 — `4d7990f` (360 → 330, 30 fix, 0 regresiones)

- `informes/types.ts`: `ReportContent` tipa las claves conocidas del JSONB
  `progress_reports.content` y `ProgressReportRow.content` lo usa. Sin DDL.
- `progress-report-format.ts`: `asRecord<T>` centraliza el parseo del JSONB;
  desaparecen los `as unknown as` de `plan`, `evidence` y del resumen de
  asistencia legado; `formatValue` usa corchetes solo donde el objeto es
  verdaderamente dinámico.
- Regresión detectada y corregida en el tipo (no con cast): `student.ageCategory`
  y `period.label` pueden ser `null` — el servicio los escribe así — y el
  nuevo tipo no lo declaraba (TS2322). Tras ampliarlos, 0 regresiones.
- `npm run build` verde (`BUILD_EXIT=0`).

## Lote 5 — `c4df3f0` (330 → 301, 29 fix, 0 regresiones)

- `invitations.service.ts`: `DBInvitationWrite` separa el modelo de lectura
  (sin secretos) del de escritura (con `master_password`, y `target_role`
  restringido al enum SQL). Los 4 INSERT/PATCH lo usan.
- Recuperación de la primera fila de PostgREST con `?.[0]` y guarda explicita
  en `verifyInvitationToken`; mismo comportamiento cuando no hay fila.
- Índices bajo `noUncheckedIndexedAccess` (`parts[2]`, `split("(")[0]`) con
  fallback a `""`; `target_name` cae al email si no hay nombre.
- `npm run build` verde (`BUILD_EXIT=0`).

## Lote 6 — `168f9b4` (301 → 268, 33 fix, 0 regresiones)

- `students-table.tsx`: guarda `!== "pendiente"` muerta, índices de `split` y
  de primeros elementos con `??`, `getNextConsecutiveSlot` con `?? null`,
  `studentAge = liveStudent.age ?? 0` para fichas sin edad, props de función
  por spread condicional y `teacherNote: ""` en la edición.
- `room-compatibility.ts`: `modality?`/`instrument?` de las lecciones de sala
  aceptan `undefined` explícito (JSONB). Sin cambios en las reglas pedaggóicas.
- `app-store.ts`: `addNewStudent` declara `teacherNote?` y `balance?`, que el
  store ya leía.
- `student-cleanup-panel.tsx`: alta desde CSV completada con `level`,
  `birthdate` y `emergencyContact` (error enmascarado por un TS2353 previo).
- `npm run build` verde.

## Lote 7 — `f95b3cc` (268 → 252, 16 fix, 0 regresiones)

- `laya-engine.ts`: matriz de Levenshtein inicializada completa (fila 0
  `[0,1,…]`, filas i `[i,0,…]`), lecturas con `?? 0`; tokens con `?? ""`;
  `remoteUrl?: string | undefined`.
- `npm run build` verde. Algoritmo y resultados de similitud sin cambios.

## Lote 8 — `cde9237` (252 → 238, 14 fix, 0 regresiones)

- `admin-seeds.ts`: claves opcionales de `ScheduledLesson` con `| undefined`
  (coinciden con el JSONB `scheduleLessons`). Causa raíz de TS2379/TS2375 en
  app-store y vistas de agenda.
- `app-store.ts`: `addNewStudent` declara los campos derivados que el store ya
  leía (`joinedAt`, `attendanceRate`, `makeupCredits`, `recentAttendance`).
- `npm run build` verde. Sin cambios en motores ni en reglas de visibilidad.

## Verificación repetida en cada lote

```
npx tsc --noEmit -p tsconfig.json 2>&1 | Out-File -Encoding utf8 scratch/.tsc-fixNN.txt
# script PowerShell: cuenta errores por "<archivo>|TS<codigo>" y lista solo
# claves cuyo conteo SUBIÓ => "REGRESIONES: 0" en los tres lotes
npm run build     # ✓ built in 844ms, BUILD_EXIT=0 en el lote 3
```

Push a ambos remotos (`musicstaff-vm`, `musicstaff-core`) confirmado;
`main -> main` en cada lote. PowerShell marca `NativeCommandError` al pushear
por escribir en stderr; el push efectivamente se completó.
