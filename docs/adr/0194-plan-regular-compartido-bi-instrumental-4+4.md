# ADR-0194: Plan Regular Compartido Bi-Instrumental (4+4)

**Fecha:** 2026-11-14
**Estado:** Implementado y verificado en producción.
**Autores:** Equipo Vibra (Dirección + Open Code)
**Versión:** 2.0.60
**Relación:** ADR-0186 (vínculo multi-instrumento), ADR-0188 (Registro 2), ADR-0189 (confirmación y códigos), ADR-0099/0100 (cuotas contractuales), ADR-0103 (CERO ALTER TABLE)

---

## Contexto

Una mamá contrató un **Plan Regular de 8 clases** para su hijo con la siguiente distribución:

- El alumno **vendrá 4 veces al mes** (1 vez por semana).
- En **cada visita (90 min de corrido)** asistirá:
  - **45 min → Canto** con la Prof. Nathaly en Sala C.
  - **45 min → Guitarra** con el Prof. Jeremy en Sala A.
- Total contractual: **4 clases de Canto + 4 clases de Guitarra = 8 clases del plan**.
- Precio: el de **1 solo Plan Regular estándar** (S/ 297 o promo S/ 261).
- Libros: 2 libros de S/ 67 (1 por instrumento) con flexibilidad de pago.
- Matrícula: **1 sola vez** institucional por familia (ADR-0188 §10).

### Por qué el sistema anterior no lo permitía

1. **`lesson_modality_enum` en PostgreSQL** solo tiene 2 valores:
   `Regular (8 clases / 45 min)` e `Intensivo (4 clases / 90 min)`.
   **No se puede alterar el enum** (ADR-0103 §4: CERO `ALTER TABLE`).

2. **`computeStudentCycle` y `computeStudentCycleSessions`** calculaban `targetQuota`
   con la lógica: `packageTotalSessions || (isDemoNivelacion ? 1 : isFlexiblePackage ? 24 : isIntensivo ? 4 : 8)`.
   El operador `||` hacía que `packageTotalSessions = 4` (valor falsy solo si es `0`) fuera
   ignorado y cayera al default `8`, proyectando 4 "clases fantasma" en el Kardex.
   
   > **Nota**: `4 || 8` = `4` (correcto en JS). El bug real era que `isFlexiblePackage`
   > requería `packageTotalSessions > 8`, así que con valor `4` tampoco entraba ahí y
   > el guard era innecesariamente restrictivo. Se clarificó la lógica.

3. **`multi-instrument-enrollment.tsx`** solo tenía el modo "Dos Planes Completos"
   (8 sesiones por instrumento), sin opción para dividir un solo plan.

---

## Decisión

### 1. Arquitectura: 2 matrículas vinculadas (igual que ADR-0186)

**No se fusiona** ningún dato en una sola fila de `students`. Se generan 2 registros:

| Campo | Matrícula A | Matrícula B |
|---|---|---|
| `full_name` | `[Nombre]` | `[Nombre] (Guitarra)` |
| `instrument` | `Canto` | `Guitarra` |
| `assigned_teacher_id` | UUID Nathaly | UUID Jeremy |
| `modality` | `Regular (8 clases / 45 min)` | `Regular (8 clases / 45 min)` |
| `packageTotalSessions` | `4` | `4` |
| `planPrice` | Precio del plan (ej. S/ 261) | `0` (**no duplicar en facturación**) |
| `personGroupId` | mismo UUID compartido | mismo UUID compartido |
| `familyId` | mismo UUID | mismo UUID |
| `emergency_contact.sharedPlanType` | `"compartido_4+4"` | `"compartido_4+4"` |

### 2. Corrección en motores de cuota (`student-cycle.ts` y `kardex-calculator.ts`)

Se introduce `explicitQuota` para respetar `packageTotalSessions` sin pasar por
`isFlexiblePackage` (que exige `> 8`):

```ts
// Si packageTotalSessions es un número positivo explícito y no es Flexible,
// se usa directamente como targetQuota.
const explicitQuota =
  typeof studentProfile.packageTotalSessions === "number" &&
  studentProfile.packageTotalSessions > 0 &&
  !isFlexiblePackage
    ? studentProfile.packageTotalSessions
    : undefined;

const targetQuota =
  explicitQuota ??
  (isDemoNivelacion ? 1 : isFlexiblePackage ? 24 : isIntensivo ? 4 : 8);
```

**Resultado:** Con `packageTotalSessions = 4`, el Kardex de Nathaly proyecta exactamente
4 sesiones de Canto y el Kardex de Jeremy proyecta exactamente 4 sesiones de Guitarra.

### 3. Nuevo modo en `multi-instrument-enrollment.tsx`: "🔗 Plan Regular Compartido (4+4)"

Selector de **Distribución del Plan** con 2 opciones:

- **Dos Planes Completos** (modo original): 8 sesiones por instrumento.
- **Plan Regular Compartido (4+4)**: 4 sesiones por instrumento.
  - Precio del plan → solo en Instrumento 1.
  - Instrumento 2 → `planPrice = 0` con nota explicativa.
  - Ambos → `packageTotalSessions = 4`.
  - Notas del docente → incluyen la etiqueta `"Plan Compartido 4+4"`.

### 4. Agenda (sin cambio de código)

Secretaría registra en el Horario de Clases:
- **Clase A**: mismo día (ej. Viernes), hora 16:00, Sala C, Nathaly, Canto.
- **Clase B**: mismo día, hora 16:45, Sala A, Jeremy, Guitarra.

El validador de conflictos ya permite horas contiguas en **salas distintas**.

---

## Consecuencias

- **Kiosco de Nathaly**: muestra al alumno para Canto. Al evaluar, usa criterios de Canto.
- **Kiosco de Jeremy**: muestra al alumno para Guitarra. Al evaluar, usa criterios de Guitarra.
- **Kardex de cada matrícula**: proyecta exactamente 4 sesiones.
- **Facturación (`/admin/facturacion`)**: el cobro del plan aparece 1 sola vez (en la matrícula A).
- **Bitácoras e Informes de Progreso A4**: independientes por instrumento y docente.
- **Si falta a Canto pero llega a Guitarra**: la clase de Canto queda `ausente` y la de Guitarra `presente`, sin interferencia entre `attendance_logs`.
- **Sin `ALTER TABLE`**: todo en JSONB. CERO riesgo de migración de datos.

---

## Reglas Innegociables Preservadas

1. **ADR-0186**: 1 matrícula = 1 instrumento + 1 docente + 1 sala. NUNCA fusionar.
2. **ADR-0102**: Nathaly → Sala C (Canto/Piano Infantil). Jeremy → Sala A (Guitarra/Batería).
3. **ADR-0103**: CERO `ALTER TABLE`. El enum `lesson_modality_enum` NO se modifica.
4. **ADR-0188 §10**: Matrícula institucional UNA sola vez por familia.
5. **ADR-0105**: Deduplicación `dateStr-time`. Las 2 clases del mismo día no colisionan porque son horas distintas (16:00 vs 16:45).
