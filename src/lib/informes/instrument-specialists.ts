/**
 * ================================================================
 * instrument-specialists.ts — Mapa oficial instrumento → especialista
 * ================================================================
 *
 * ADR-0179. Los criterios de evaluación pertenecen al **instrumento** y los
 * define su docente especialista (ADR-0102). Cuando otro docente dicta ese
 * instrumento por excepción, no se duplica la lista: se reutiliza la del
 * especialista, dejando trazabilidad de que se aplicó por excepción.
 *
 * Este archivo es la ÚNICA fuente de verdad del mapeo. Si mañana aparece un
 * instrumento nuevo (o un docente nuevo dictando uno existente), se resuelve
 * aquí y todas las vistas lo heredan.
 *
 * Reglas:
 *   - `Guitarra`, `Guitarra clásica` y `Guitarra eléctrica` son la misma
 *     familia `guitarra` (Jeremy).
 *   - `Piano` y `Piano Infantil` son familias DISTINTAS (Fernando / Nathaly).
 *   - `Violín` es de Fernando; `Canto` y `Piano Infantil` de Nathaly.
 *   - Un instrumento sin especialista (p. ej. Estimulación, que no tiene UUID
 *     en `TEACHER_IDS`) devuelve `null`: la UI muestra el mensaje de que aún
 *     no hay criterios configurados. Preferible a inventar un dueño.
 */

import { normalizeTitle } from "@/lib/informes/utils";
import { resolveTeacherNameById, TEACHER_IDS } from "@/lib/services/teacher-resolver";
import type { EvaluationFieldRow } from "@/lib/informes/types";

export interface InstrumentSpecialist {
  teacherId: string;
  teacherName: string;
}

/**
 * Mapa canónico instrumento → especialista. La clave es la **familia**
 * normalizada, no el texto crudo de la ficha.
 */
export const INSTRUMENT_SPECIALISTS: Record<string, InstrumentSpecialist> = {
  guitarra: { teacherId: TEACHER_IDS.JEREMY, teacherName: "Jeremy" },
  bateria: { teacherId: TEACHER_IDS.JEREMY, teacherName: "Jeremy" },
  piano: { teacherId: TEACHER_IDS.FERNANDO, teacherName: "Fernando" },
  violin: { teacherId: TEACHER_IDS.FERNANDO, teacherName: "Fernando" },
  "piano infantil": {
    teacherId: TEACHER_IDS.NATHALY,
    teacherName: "Nathaly",
  },
  canto: { teacherId: TEACHER_IDS.NATHALY, teacherName: "Nathaly" },
};

/**
 * Familia de instrumento para emparejar plantillas de criterios.
 *
 * La base viva guarda variantes del mismo instrumento ("Guitarra",
 * "Guitarra clásica", "Guitarra eléctrica"). Sin esta normalización, un alumno
 * con "Guitarra clásica" no recibiría los criterios configurados como
 * "Guitarra". Solo agrupa variantes explícitas; Piano y Piano Infantil siguen
 * siendo instrumentos distintos.
 */
export function instrumentFamily(value?: string | null): string {
  const normalized = normalizeTitle(value || "");
  if (!normalized) return "";
  if (normalized.startsWith("guitarra")) return "guitarra";
  if (normalized.startsWith("bateria")) return "bateria";
  if (normalized.startsWith("piano")) {
    return normalized.includes("infantil") ? "piano infantil" : "piano";
  }
  if (normalized.startsWith("violin")) return "violin";
  if (normalized.startsWith("canto")) return "canto";
  return normalized;
}

/** UUID del especialista que define los criterios de ese instrumento. */
export function resolveSpecialistTeacherId(
  instrument?: string | null,
): string | null {
  return INSTRUMENT_SPECIALISTS[instrumentFamily(instrument)]?.teacherId ?? null;
}

/** Nombre legible del especialista (para la píldora de excepción en la UI). */
export function resolveSpecialistTeacherName(
  instrument?: string | null,
): string | null {
  return INSTRUMENT_SPECIALISTS[instrumentFamily(instrument)]?.teacherName ?? null;
}

export interface CriteriaSource {
  /** Dueño de las filas devueltas (null si son globales o están mezcladas). */
  ownerTeacherId: string | null;
  ownerTeacherName: string | null;
  /** `true` cuando el docente que evalúa NO es el dueño de los criterios. */
  isException: boolean;
}

/**
 * Resuelve de quién son los criterios que se están mostrando.
 *
 * Se usa para avisar en el registro de clase que se aplicaron por excepción
 * (otro docente dictando el instrumento) y no silenciar el origen.
 */
export function resolveCriteriaSource(
  rows: EvaluationFieldRow[],
  teacherId?: string | null,
): CriteriaSource {
  const owners = Array.from(
    new Set(
      rows
        .map((row) => row.owner_teacher_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const ownerTeacherId = owners.length === 1 ? owners[0] : null;
  const isException = Boolean(
    teacherId && ownerTeacherId && ownerTeacherId !== teacherId,
  );
  return {
    ownerTeacherId,
    ownerTeacherName: ownerTeacherId
      ? resolveTeacherNameById(ownerTeacherId)
      : null,
    isException,
  };
}

/** True si el criterio sigue en borrador (no puede salir en informes). */
export function isDraftCriterion(field: EvaluationFieldRow): boolean {
  const config =
    field.ui_config && typeof field.ui_config === "object"
      ? (field.ui_config as Record<string, unknown>)
      : {};
  return config.draft === true;
}
