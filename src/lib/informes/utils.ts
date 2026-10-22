/**
 * Utilidades puras del módulo de informes.
 * No tocan el store, la red ni el DOM.
 */

import type {
  RepertoireItem,
  TestFlags,
} from "./types";

export class InformesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InformesValidationError";
  }
}

/** Minúsculas, sin tildes, sin signos, espacios colapsados. */
export function normalizeTitle(value: string): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Normaliza el nombre de un docente para comparar cohortes del horario. */
export function normalizeTeacherName(value?: string | null): string {
  return normalizeTitle(value || "")
    .replace(/\b(prof|profesor|profesora|teacher|docente)\b/g, "")
    .trim();
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test((value || "").trim());
}

export function isTimeHHMM(value: string): boolean {
  return /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test((value || "").trim());
}

/** Convierte Date o string a YYYY-MM-DD usando calendario local. */
export function toIsoDate(value: string | Date): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new InformesValidationError("Fecha inválida.");
    }
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const trimmed = (value || "").trim();
  if (isIsoDate(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new InformesValidationError(
      `Fecha inválida: "${value}". Usa el formato YYYY-MM-DD.`,
    );
  }
  return toIsoDate(parsed);
}

export function addMinutesToTime(time: string, minutes: number): string {
  if (!isTimeHHMM(time)) {
    throw new InformesValidationError(
      `Hora inválida: "${time}". Usa HH:MM (24 horas).`,
    );
  }
  if (!Number.isFinite(minutes)) {
    throw new InformesValidationError("Los minutos deben ser un número.");
  }
  const [h, m] = time.split(":").map(Number);
  const total = (h * 60 + m + Math.trunc(minutes) + 1440 * 10) % 1440;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export interface BuildSessionKeyInput {
  studentId: string;
  sessionDate: string;
  startTime: string;
  durationMin?: number | null;
  modality?: string | null;
  sessionKey?: string | null;
}

/**
 * session_key determinista:
 *   Regular/Flexible 45m: <student_id>::<YYYY-MM-DD>::<HH:MM>
 *   Intensivo 90m:        <student_id>::<YYYY-MM-DD>::INT
 */
export function buildSessionKey(input: BuildSessionKeyInput): string {
  const explicit = (input.sessionKey || "").trim();
  if (explicit) return explicit;

  const studentId = (input.studentId || "").trim();
  if (!studentId) {
    throw new InformesValidationError("studentId es obligatorio para la sesión.");
  }

  const sessionDate = toIsoDate(input.sessionDate);
  const startTime = (input.startTime || "").trim();
  if (!isTimeHHMM(startTime)) {
    throw new InformesValidationError(
      `Hora de inicio inválida: "${input.startTime}". Usa HH:MM.`,
    );
  }

  const duration = Number(input.durationMin ?? 45);
  const isIntensive =
    (Number.isFinite(duration) && duration >= 90) ||
    /intensiv|90\s*min/i.test(input.modality || "");

  return `${studentId}::${sessionDate}::${isIntensive ? "INT" : startTime}`;
}

export interface ParsedSessionKey {
  studentId: string;
  sessionDate: string;
  slot: string;
}

export function parseSessionKey(sessionKey: string): ParsedSessionKey {
  const parts = (sessionKey || "").split("::");
  if (parts.length !== 3 || parts.some((p) => !p.trim())) {
    throw new InformesValidationError(
      `session_key inválido: "${sessionKey}". Formato esperado: studentId::YYYY-MM-DD::HH:MM|INT.`,
    );
  }
  return {
    studentId: parts[0]!,
    sessionDate: parts[1]!,
    slot: parts[2]!,
  };
}

/** Congela recursivamente el objeto para que nadie mute el snapshot. */
export function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value as Record<string, unknown>)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

/**
 * Normaliza is_test / test_run_id respetando el CHECK de PostgreSQL:
 *   is_test = (test_run_id IS NOT NULL)
 */
export function resolveTestFlags(input: {
  isTest?: boolean | null;
  testRunId?: string | null;
}): TestFlags {
  const testRunId = (input.testRunId || "").trim() || null;
  if (testRunId) {
    return { is_test: true, test_run_id: testRunId };
  }
  if (input.isTest) {
    throw new InformesValidationError(
      "testRunId es obligatorio cuando isTest=true. Usa un lote, por ejemplo PILOTO-2026-10.",
    );
  }
  return { is_test: false, test_run_id: null };
}

export function uniqueStrings(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const clean = (value || "").trim();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    out.push(clean);
  }
  return out;
}

export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function clampScore(score: number | null | undefined): number | null {
  if (score === null || score === undefined || String(score).trim() === "") {
    return null;
  }
  const n = Number(score);
  if (!Number.isFinite(n) || n < 1 || n > 10) {
    throw new InformesValidationError(
      "El puntaje debe ser un número entre 1 y 10 (o quedar vacío).",
    );
  }
  return Math.round(n * 10) / 10;
}

/** Normaliza una lista de repertorio y calcula normalized_title. */
export function normalizeRepertoire(value: unknown): RepertoireItem[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new InformesValidationError("El repertorio debe ser una lista.");
  }

  return value.map((raw, index) => {
    if (!raw || typeof raw !== "object") {
      throw new InformesValidationError(
        `El repertorio tiene un ítem inválido en la posición ${index + 1}.`,
      );
    }
    const item = raw as Record<string, unknown>;
    const title = String(item.title || "").trim();
    if (!title) {
      throw new InformesValidationError(
        `El ítem ${index + 1} del repertorio no tiene título.`,
      );
    }
    const status = String(item.status || "pendiente").trim();
    if (!["logrado", "en_proceso", "pendiente", "no_corresponde"].includes(status)) {
      throw new InformesValidationError(
        `Estado de repertorio inválido en "${title}": "${status}".`,
      );
    }
    return {
      title,
      normalized_title: normalizeTitle(title),
      status: status as RepertoireItem["status"],
      score: clampScore(item.score as number | null | undefined),
    };
  });
}

export function aggregateRepertoire(
  evaluations: Array<{ session_date: string; start_time: string; repertoire: unknown }>,
): RepertoireItem[] {
  const ordered = [...evaluations].sort((a, b) => {
    const byDate = a.session_date.localeCompare(b.session_date);
    if (byDate !== 0) return byDate;
    return (a.start_time || "").localeCompare(b.start_time || "");
  });

  const latest = new Map<string, RepertoireItem>();

  for (const evaluation of ordered) {
    for (const item of asArray<RepertoireItem>(evaluation.repertoire)) {
      const title = String(item.title || "").trim();
      if (!title) continue;
      const normalized = item.normalized_title || normalizeTitle(title);
      latest.set(normalized, {
        title,
        normalized_title: normalized,
        status: item.status || "pendiente",
        score: item.score ?? null,
        last_seen_date: evaluation.session_date,
      });
    }
  }

  return [...latest.values()].sort((a, b) =>
    a.title.localeCompare(b.title, "es", { sensitivity: "base" }),
  );
}
