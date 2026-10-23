/**
 * ================================================================
 * session-log.ts — Bitácora clase por clase de un informe
 * ================================================================
 *
 * Un **informe** es el consolidado de varios **reportes de clase**
 * (`lesson_evaluations`) más la asistencia del periodo. Este módulo convierte
 * esos reportes en la bitácora que ve la familia: qué se trabajó en cada
 * clase, con su repertorio, criterios, tarea y comentario.
 *
 * Fuente única: A4, Markdown, WhatsApp y pantalla consumen
 * `buildSessionLog()`. Prohibido reimplementar el formato en cada vista
 * (ADR-0119.3).
 *
 * Reglas:
 *   - Orden cronológico ascendente (así se lee un proceso de aprendizaje).
 *   - Plan Intensivo: los dos bloques de 45 min de una misma fecha se
 *     consolidan en UNA sola entrada de 90 min.
 *   - CERO datos financieros.
 */

import type {
  LessonEvaluationRow,
  RepertoireItem,
  SessionLogCriterion,
  SessionLogEntry,
} from "./types";
import {
  addMinutesToTime,
  asArray,
  isIsoDate,
  isTimeHHMM,
  normalizeRepertoire,
} from "./utils";

const OVERALL_LABELS: Record<string, string> = {
  logrado: "Logrado",
  en_proceso: "En proceso",
  pendiente: "No logrado",
  no_corresponde: "No aplicó",
  sin_evaluar: "Sin evaluar",
};

export interface BuildSessionLogInput {
  evaluations: LessonEvaluationRow[];
  /** Si es Plan Intensivo, consolida los dos bloques de 45 min por fecha. */
  isIntensive?: boolean;
  /** Asistencia por fecha según el motor oficial (`attendanceByDate`). */
  attendanceByDate?: Record<string, SessionLogEntry["attendance"]>;
}

function cleanText(value: unknown): string | null {
  const text = String(value ?? "").trim();
  return text || null;
}

/** Formatea el valor crudo de un criterio sin depender de otras vistas. */
export function formatCriterionRaw(
  rawValue: unknown,
  band?: string | null,
): string {
  const bandText = cleanText(band);
  if (bandText) return bandText;

  if (typeof rawValue === "boolean") return rawValue ? "Sí" : "No";
  if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
    return String(rawValue);
  }
  if (Array.isArray(rawValue)) {
    return rawValue
      .map((item) => cleanText(item))
      .filter((item): item is string => Boolean(item))
      .join(", ");
  }
  return cleanText(rawValue) ?? "—";
}

function criteriaOf(evaluation: LessonEvaluationRow): SessionLogCriterion[] {
  const criteria: SessionLogCriterion[] = [];
  for (const raw of asArray<{
    label?: string;
    raw_value?: unknown;
    band?: string | null;
  }>(evaluation.extra_scores)) {
    const label = cleanText(raw?.label);
    if (!label) continue;
    criteria.push({
      label,
      value: formatCriterionRaw(raw?.raw_value, raw?.band),
      band: cleanText(raw?.band),
    });
  }
  return criteria;
}

function entryOf(
  evaluation: LessonEvaluationRow,
  attendanceByDate: Record<string, SessionLogEntry["attendance"]>,
): SessionLogEntry | null {
  const date = String(evaluation.session_date || "").slice(0, 10);
  if (!isIsoDate(date)) return null;

  const time = isTimeHHMM(String(evaluation.start_time || ""))
    ? String(evaluation.start_time).slice(0, 5)
    : "00:00";
  const durationMin =
    Number.isFinite(Number(evaluation.duration_min)) &&
    Number(evaluation.duration_min) > 0
      ? Number(evaluation.duration_min)
      : 45;

  return {
    date,
    time,
    timeEnd: addMinutesToTime(time, durationMin),
    durationMin,
    attendance: attendanceByDate[date] || "pendiente",
    topic: cleanText(evaluation.topic),
    repertoire: normalizeRepertoire(evaluation.repertoire),
    criteria: criteriaOf(evaluation),
    homework: cleanText(evaluation.homework),
    comment: cleanText(evaluation.teacher_comment),
    overallLabel:
      OVERALL_LABELS[String(evaluation.overall_status || "")] ?? null,
    teacher: cleanText(evaluation.teacher_name),
    instrument: cleanText(evaluation.instrument),
  };
}

function uniqueJoin(values: Array<string | null>, separator = " · ") {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const text = cleanText(value);
    if (!text) continue;
    const key = text.toLocaleLowerCase("es");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out.length ? out.join(separator) : null;
}

function mergeRepertoire(items: RepertoireItem[]): RepertoireItem[] {
  const map = new Map<string, RepertoireItem>();
  for (const item of items) {
    const key = item.normalized_title || item.title;
    map.set(key, item);
  }
  return [...map.values()];
}

function mergeCriteria(items: SessionLogCriterion[]): SessionLogCriterion[] {
  const map = new Map<string, SessionLogCriterion>();
  for (const item of items) {
    map.set(item.label.toLocaleLowerCase("es"), item);
  }
  return [...map.values()];
}

const ATTENDED: Array<SessionLogEntry["attendance"]> = ["presente", "tarde"];

/** Consolida los bloques de una misma fecha en una sola clase de 90 min. */
function mergeByDate(entries: SessionLogEntry[]): SessionLogEntry[] {
  const byDate = new Map<string, SessionLogEntry[]>();
  for (const entry of entries) {
    const list = byDate.get(entry.date) || [];
    list.push(entry);
    byDate.set(entry.date, list);
  }

  const merged: SessionLogEntry[] = [];
  for (const [, list] of [...byDate.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const ordered = [...list].sort((a, b) => a.time.localeCompare(b.time));
    const first = ordered[0];
    if (!first) continue;

    const durationMin = ordered.reduce(
      (total, entry) => total + entry.durationMin,
      0,
    );
    const attendance =
      ordered.find((entry) => ATTENDED.includes(entry.attendance))
        ?.attendance || first.attendance;

    merged.push({
      date: first.date,
      time: first.time,
      timeEnd: addMinutesToTime(first.time, durationMin),
      durationMin,
      attendance,
      topic: uniqueJoin(ordered.map((entry) => entry.topic)),
      repertoire: mergeRepertoire(ordered.flatMap((entry) => entry.repertoire)),
      criteria: mergeCriteria(ordered.flatMap((entry) => entry.criteria)),
      homework: uniqueJoin(
        ordered.map((entry) => entry.homework),
        " / ",
      ),
      comment: uniqueJoin(ordered.map((entry) => entry.comment), " "),
      overallLabel:
        [...ordered]
          .reverse()
          .map((entry) => entry.overallLabel)
          .find((label) => Boolean(label)) ?? null,
      teacher: first.teacher,
      instrument: first.instrument,
    });
  }

  return merged;
}

/**
 * Construye la bitácora del informe a partir de los reportes de clase.
 * Devuelve `[]` cuando no hay reportes: sin bitácora no hay informe.
 */
export function buildSessionLog(
  input: BuildSessionLogInput,
): SessionLogEntry[] {
  const evaluations = Array.isArray(input?.evaluations)
    ? input.evaluations
    : [];
  const attendanceByDate = input?.attendanceByDate || {};

  const entries = evaluations
    .map((evaluation) => entryOf(evaluation, attendanceByDate))
    .filter((entry): entry is SessionLogEntry => Boolean(entry))
    .sort((a, b) => {
      const byDate = a.date.localeCompare(b.date);
      if (byDate !== 0) return byDate;
      return a.time.localeCompare(b.time);
    });

  return input?.isIntensive ? mergeByDate(entries) : entries;
}
