# ADR-0192: Precarga y Edición Real de la Bitácora de Clase (`ClassLog`)

**Fecha:** 2026-11-10
**Estado:** Implementado (sin despliegue pendiente de confirmación del docente)
**Autores:** Dirección Vibra Music
**Referencia:** `docs/logs/2026-11-10-adr-0192-bitacora-edicion.log` y `scratch/test-adr-0192-bitacora-edicion.mjs`

---

## 1. Contexto

El Prof. Fernando reportó que **no podía corregir sus bitácoras** como sí lo hacía el Prof. Jeremy: al pulsar `Ver / Editar` en el portal docente, el formulario se abría **vacío** y al guardar **desaparecía lo que ya había registrado**.

Se revisaron primero los accesos y las puertas lógicas, y todas estaban correctas:

- Fernando figura en `org_settings.pilot_teacher_ids` (`...0003` Jeremy, `...0004` Fernando, `...0005` Nathaly).
- Sus criterios están cargados y visibles: 12 de Piano y 13 de Violín, todos con `draft = false` y `visible_in_report = true`.
- Los `feature_flags` están en `false`; el acceso se resuelve por piloto y funciona.

Por lo tanto **no era un problema de permisos ni de criterios**: era un defecto del formulario, y afectaba a los tres docentes del piloto.

---

## 2. Diagnóstico (evidencia en vivo)

Sobre la bitácora de `Hans` del **2026-11-10 16:45** (la que el docente intentó corregir) el registro en `lesson_evaluations` mostraba:

| Campo | Valor en base de datos |
|---|---|
| `extra_scores` | 12 criterios con nota (7, 7, 7, 7, 6, 5, 5, 8, 7, 8, 5, 8) |
| `overall_status` | `sin_evaluar` |
| `topic` | `null` |
| `teacher_comment` | `null` |
| `repertoire` | `[]` |

Es decir: los criterios sobrevivieron, pero **el estado, el tema, el repertorio y el comentario estaban vacíos**. La misma firma aparecía en su bitácora previa del `2026-10-22` (esa aún conservaba repertorio, comentario y nota `7.0`).

### Causa raíz (confirmada)

1. `ClassLog` **nunca leía la bitácora existente**. El `ClassLogSeed` solo transportaba alumno, fecha, hora, duración e instrumento; no había campo de contenido ni consulta de lectura.
2. `saveLessonEvaluation` resuelve el `session_key` determinista y, si la fila existe, hace **PATCH de todas las columnas** (`basePayload`, `evaluations.service.ts:413-436`).
3. Consecuencia: abrir en blanco y guardar **sobrescribía con vacíos** todo lo que el docente había escrito antes. No era un problema de "no se guarda", sino de **destrucción silenciosa al re-guardar**.

### Defecto secundario

`teacher-progress-reports.tsx` identificaba la bitácora de una sesión **solo por fecha** (`ev.session_date === session.dateStr`). En Plan Intensivo hay **dos bloques de 45 min el mismo día**, así que el listado de "clases asistidas" marcaba como evaluada la clase equivocada.

---

## 3. Decisión

### 3.1 Hidratar el formulario con la bitácora de ESA sesión

`ClassLog` ahora abre con el contenido real y lo indica en pantalla:

- Nueva consulta de lectura: **`getStudentEvaluations(studentId, { from, to })`** — la única que filtra `is_test = eq.false` (`§86.6`). Queda **prohibido** usar `getEvaluationBySessionKey`, que no filtra pruebas.
- Emparejamiento **exacto por alumno + fecha + hora** (`start_time` a `HH:MM`), una sola consulta por sesión (sin N+1).
- Se hidratan **todos** los campos que el PATCH reescribe: `class_mode`, `overall_status`, `score`, `topic`, `repertoire`, `homework`, `teacher_comment` y `extra_scores`.
- Si la sesión **no** tiene bitácora, el formulario se mantiene en blanco (no se arrastra contenido de otra clase).
- Si la lectura falla (sin red), el formulario sigue editable y se registra un `console.warn`: **la clase nunca se bloquea**.

### 3.2 Evitar la segunda consulta cuando el llamador ya tiene la fila

`ClassLogSeed` gana un campo opcional `evaluation?: LessonEvaluationRow | null`. El kiosco (`/teacher`) y el dossier de informes (`/teacher/informes`) ya tienen las bitácoras del día en memoria (`dayEvaluations` / `evaluations`), así que pasan la fila y el formulario **nace con su contenido**, sin parpadeo y sin consultar de nuevo.

### 3.3 Señales explícitas para el docente

- Cabecera: **"Editar bitácora"** cuando hay registro previo (antes siempre decía "Registro de clase").
- Banner: *"✏️ Editando la bitácora ya registrada · {fecha} {hora} — Al guardar se actualiza este registro; no se crea un duplicado."*
- Mientras busca: *"Buscando la bitácora de esta sesión…"*.
- Toast distinto: **"✓ Bitácora actualizada"** vs **"✓ Bitácora de clase guardada"**.

### 3.4 Emparejamiento correcto en el dossier de informes

La bitácora se identifica por **fecha + hora**; el fallback por fecha se conserva **solo si hay una única bitácora ese día** (compatibilidad con registros viejos sin hora fiable). Los bloques de un Intensivo ya no se pisan.

---

## 4. Invariantes que se preservan

1. **Nada se borra**: no hay `DELETE` ni `TRUNCATE`; el único efecto es leer y, si el docente guarda, actualizar la misma fila (`session_key` determinista).
2. **Guardar nunca duplica**: `buildSessionKey` reproduce exactamente la clave almacenada, incluido el sufijo `::INT` en sesiones de 90 min.
3. **Identidad por UUID**: el emparejamiento usa `student_id`, nunca el nombre.
4. **Cero datos financieros** en el formulario, el dossier y los mensajes.
5. **Cero cambios** en `kardex-calculator.ts`, `student-cycle.ts`, `app-store.ts`, asistencia, Kardex y facturación.
6. **Cero filas de prueba**: la lectura filtra `is_test = false`.

---

## 5. Verificación

- `scratch/test-adr-0192-bitacora-edicion.mjs`: **37/37**. Corre sobre un *fixture* con filas reales de producción (las lecturas PostgREST exigen JWT de usuario y el harness corre sin sesión). Comprueba:
  - **A.** Emparejamiento por alumno + fecha + hora: el par 17:30 / 18:15 del `2026-10-05` resuelve cada bloque a su propia fila; una sesión sin bitácora devuelve `null`; no confunde alumnos.
  - **B.** Hidratación: nota `7`, estado `en_proceso`, repertorio `Cuento Azul`, comentario de 187 caracteres y **12 criterios**; el caso reportado (10/11) conserva sus **12 criterios**; Kayra (90 min) recupera `class_mode = individual`, tema y repertorio; Jeremy recupera tema, tarea, comentario y sus 8 criterios de guitarra.
  - **C.** **Re-guardado sin pérdida**: para las 6 filas del fixture, el payload que enviaría el formulario tras hidratar es **idéntico** al registro almacenado (0 diferencias).
  - **D.** `buildSessionKey` reproduce las 6 `session_key` almacenadas (incluye `::INT`).
  - **E.** Dossier de informes: con dos bitácoras el mismo día devuelve la de la hora pedida; una hora sin bitácora **no** marca una clase ajena como evaluada.
- `npm run build`: verde (✓ 674 ms).
- `npx tsc --noEmit -p tsconfig.json`: 843 errores **preexistentes** en el repo; en los archivos tocados solo aparecen categorías ya existentes (`TS4111` index-signature, `TS2322` de `findLessonForStudent`, `TS2379`, `TS18047`/`TS2367` previos). **Ningún error nuevo** y ninguno dentro del bloque de hidratación.

---

## 6. Límites conocidos y siguiente paso

- La consulta de precarga no reintenta si falla por red; el docente puede seguir escribiendo y guardar (el `session_key` evita duplicados).
- **Confirmación en dispositivo pendiente**: el Prof. Fernando debe abrir `Ver / Editar` de una bitácora suya, comprobar que ve el contenido anterior, añadir tema/estado y guardar; el registro debe actualizarse conservando sus 12 criterios.
- No se modifica el flujo legacy de notas (`lesson-notes.tsx`) ni `students.notes`.

---

## 7. Rollback

Revertir el commit devuelve `ClassLog` al formulario en blanco. No hay migración de esquema ni datos escritos: los registros existentes quedan intactos.
