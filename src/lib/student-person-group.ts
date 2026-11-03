/**
 * ================================================================
 * student-person-group.ts — Misma persona, varios instrumentos (ADR-0186)
 * ================================================================
 *
 * Un alumno que contrata 2 instrumentos se registra como 2 alumnos (para no
 * bloquear por homónimo, ADR-0125). Facturación y búsqueda los ven sueltos.
 *
 * Este módulo es la ÚNICA fuente del criterio de "misma persona".
 *
 * Reglas innegociables:
 *   - NUNCA se fusionan los registros: son 2 matrículas reales (docente,
 *     sala, horario y plan distintos). Solo se VINCULAN.
 *   - La detección usa fecha de nacimiento **+ apoderado**. Nunca solo la
 *     fecha: `Aaron` y `Sylvia` comparten 2016-04-09 y son personas distintas.
 *   - PROHIBIDO tocar `isMatchingStudentName` / `normalizeStudentName`: son la
 *     deduplicación de ADR-0107 y ya causaron el incidente ADR-0119.
 *   - Función pura: sin red, sin estado, testeable.
 */

import type { AdminStudent } from "@/store/app-store";
import { normalizeStudentName } from "@/lib/student-matching";

export interface PersonSignals {
  birthdate: string | null;
  guardian: string | null;
}

/** Lee las señales duras de una ficha, sin inventar campos. */
export function readPersonSignals(student: Partial<AdminStudent>): PersonSignals {
  const birthdate = normalizeIsoDate(student.birthdate);

  const guardianCandidates = [
    student.emergencyContact?.name,
    student.motherName,
    student.fatherName,
  ]
    .map((value) => (value || "").trim())
    .filter((value) => value.length > 2 && !/^nn\.?$/i.test(value));

  return {
    birthdate,
    guardian: guardianCandidates[0] ? normalizeStudentName(guardianCandidates[0]) : null,
  };
}

/** Normaliza `DD/MM/YYYY`, `YYYY-MM-DD` o ISO completo a `YYYY-MM-DD`. */
export function normalizeIsoDate(value?: string | null): string | null {
  const raw = (value || "").trim();
  if (!raw) return null;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const dmy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(raw);
  if (dmy) {
    const day = dmy[1].padStart(2, "0");
    const month = dmy[2].padStart(2, "0");
    return `${dmy[3]}-${month}-${day}`;
  }
  return null;
}

/**
 * ¿Dos registros corresponden a la misma persona con distinto instrumento?
 *
 * Exige **ambas** condiciones:
 *   1. Misma fecha de nacimiento (dato duro).
 *   2. Mismo apoderado normalizado (evita falsos positivos).
 *
 * **Excepción adultos (18+):** un alumno adulto es su propio apoderado y no
 * tiene tutor registrado. Para ese caso se exige además coincidencia del
 * **nombre del alumno normalizado**, porque la fecha sola no basta para
 * afirmar identidad (ver falso positivo Aaron/Sylvia).
 *
 * Nunca compara apellidos sueltos ni usa el matching difuso de ADR-0107.
 */
export function isSamePerson(a: Partial<AdminStudent>, b: Partial<AdminStudent>): boolean {
  const sa = readPersonSignals(a);
  const sb = readPersonSignals(b);

  if (!sa.birthdate || !sb.birthdate) return false;
  if (sa.birthdate !== sb.birthdate) return false;

  if (sa.guardian && sb.guardian) return sa.guardian === sb.guardian;

  // Adulto sin tutor: se exige que el nombre del alumno coincida exactamente
  // (normalizado). "JAN"/"JAM" NO coinciden, así que se apoya en el vínculo
  // explícito (personGroupId) que registra Dirección, no en una adivinanza.
  const na = normalizeStudentName(a.name || "");
  const nb = normalizeStudentName(b.name || "");
  if (!na || !nb) return false;
  return na === nb;
}

/**
 * Candidatos a "misma persona" al matricular.
 * Devuelve solo los que cumplen nacimiento + apoderado.
 * Los ya dados de baja se separan para avisar con otro mensaje.
 */
export function detectSamePersonCandidates(
  candidate: Partial<AdminStudent>,
  students: AdminStudent[],
): { activos: AdminStudent[]; historicos: AdminStudent[] } {
  const matches = students.filter(
    (student) => student.id !== candidate.id && isSamePerson(candidate, student),
  );
  return {
    activos: matches.filter((student) => student.status === "activo"),
    historicos: matches.filter((student) => student.status !== "activo"),
  };
}

/**
 * Agrupa recibos/alumnos por `personGroupId`.
 * Sin `personGroupId` (aún sin vincular) cada uno queda suelto.
 */
export function buildPersonGroupIndex(
  students: Array<Pick<AdminStudent, "id" | "personGroupId">>,
): Map<string, string[]> {
  const index = new Map<string, string[]>();
  for (const student of students) {
    const groupId = student.personGroupId;
    if (!groupId) continue;
    const bucket = index.get(groupId);
    if (bucket) bucket.push(student.id);
    else index.set(groupId, [student.id]);
  }
  return index;
}

/** Registros hermanos (misma persona) de un alumno, sin incluirlo. */
export function resolvePersonSiblings(
  student: AdminStudent,
  students: AdminStudent[],
): AdminStudent[] {
  if (student.personGroupId) {
    return students.filter(
      (other) => other.id !== student.id && other.personGroupId === student.personGroupId,
    );
  }
  // Sin vínculo explícito: se buscan candidatos por señales duras.
  return students.filter((other) => other.id !== student.id && isSamePerson(student, other));
}

/** "Violín + Guitarra" — texto legible del paquete de instrumentos. */
export function describeInstrumentBundle(
  students: Array<Pick<AdminStudent, "instrument">>,
): string {
  const instruments = Array.from(
    new Set(
      students
        .map((student) => (student.instrument || "").trim())
        .filter((value) => value.length > 0),
    ),
  );
  if (instruments.length === 0) return "Sin instrumento";
  return instruments.join(" + ");
}

/**
 * Agrupa recibos que pertenecen a la misma persona (varios instrumentos).
 *
 * Devuelve un mapa `personGroupId` → ids de alumnos del grupo. Un alumno sin
 * `personGroupId` NO se agrupa: se comporta exactamente como hoy.
 *
 * Solo agrupa visualmente: los montos se suman para mostrar el total del
 * pagador, pero cada recibo conserva su importe individual.
 */
export function buildInvoiceGroupMap(
  students: Array<Pick<AdminStudent, "id" | "personGroupId">>,
): Map<string, { personGroupId: string; studentIds: string[]; label?: string }> {
  const groups = new Map<string, { personGroupId: string; studentIds: string[]; label?: string }>();
  for (const student of students) {
    const groupId = student.personGroupId;
    if (!groupId) continue;
    const existing = groups.get(groupId);
    if (existing) {
      if (!existing.studentIds.includes(student.id)) existing.studentIds.push(student.id);
    } else {
      groups.set(groupId, { personGroupId: groupId, studentIds: [student.id] });
    }
  }
  // Un grupo de 1 no aporta: se descarta para no cambiar la vista actual.
  return new Map(
    Array.from(groups.entries()).filter(([, group]) => group.studentIds.length > 1),
  );
}

/**
 * Devuelve el `personGroupId` de un alumno a partir de su id.
 * `null` si no está vinculado.
 */
export function resolveStudentPersonGroup(
  studentId: string,
  students: Array<Pick<AdminStudent, "id" | "personGroupId">>,
): string | null {
  const found = students.find((student) => student.id === studentId);
  return found?.personGroupId ?? null;
}

/**
 * ADR-0186 Fase 5 — ¿Este alumno tiene hermanos vinculados que se perderían
 * al eliminarlo?
 *
 * El borrado del store protege el horario comparando por NOMBRE
 * (`isMatchingStudentName`), pero los alias de un mismo alumno con 2
 * instrumentos NO coinciden entre sí (`JAN` vs `JAM`, `Mario Keffreen` vs
 * `Mario Kefren`). Esta función cubre ese hueco usando `personGroupId`.
 *
 * Devuelve SOLO hermanos activos (los que realmente hay que proteger).
 */
export function findLinkedSiblingsAtRisk(
  studentIds: string[],
  students: AdminStudent[],
): AdminStudent[] {
  const targets = students.filter((student) => studentIds.includes(student.id));
  if (targets.length === 0) return [];

  const groups = new Set(targets.map((student) => student.personGroupId).filter(Boolean) as string[]);
  if (groups.size === 0) return [];

  return students.filter(
    (student) =>
      student.status === "activo" &&
      Boolean(student.personGroupId) &&
      groups.has(student.personGroupId as string) &&
      !studentIds.includes(student.id),
  );
}
