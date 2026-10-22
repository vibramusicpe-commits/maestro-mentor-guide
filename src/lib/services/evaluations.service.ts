/**
 * ================================================================
 * evaluations.service.ts — Criterios extra y registro de clase
 * ================================================================
 *
 * Fase 1: datos y servicios, sin UI.
 *
 * El núcleo de la evaluación (tema, estado, puntaje, repertorio, tarea,
 * comentario) vive como columnas de `lesson_evaluations`. `evaluation_fields`
 * solo contiene campos EXTRA configurables por docente/instrumento/edad.
 *
 * No toca `students.notes`, no escribe en `app-store` y no publica nada.
 */

import {
  postgrestInsert,
  postgrestPatch,
  postgrestSelect,
} from "@/lib/insforge";
import type {
  ClassMode,
  EvaluationCriteriaQuery,
  EvaluationFieldRow,
  ExtraScoreSnapshot,
  LessonEvaluationRow,
  OverallStatus,
  SaveLessonEvaluationInput,
  StudentEvaluationQuery,
} from "@/lib/informes/types";
import {
  InformesValidationError,
  buildSessionKey,
  clampScore,
  isTimeHHMM,
  normalizeRepertoire,
  normalizeTitle,
  resolveTestFlags,
  toIsoDate,
} from "@/lib/informes/utils";

const CLASS_MODES: ClassMode[] = ["individual", "grupal", "no_aplica"];
const OVERALL_STATUSES: OverallStatus[] = [
  "logrado",
  "en_proceso",
  "pendiente",
  "no_corresponde",
  "sin_evaluar",
];

function ageCategoryToRange(
  category?: string | null,
): { min: number; max: number } | null {
  switch ((category || "").trim().toUpperCase()) {
    case "ESTIMULACION":
      return { min: 4, max: 5 };
    case "INFANTIL":
      return { min: 5, max: 6 };
    case "JUNIOR":
      return { min: 7, max: 12 };
    case "JUVENIL":
      return { min: 13, max: 17 };
    case "MASTER":
    case "ADULTO":
      return { min: 18, max: 120 };
    default:
      return null;
  }
}

function programFromLevel(level?: string | null): string | null {
  const normalized = normalizeTitle(level || "");
  if (!normalized) return null;
  if (normalized.includes("intensiv")) return "Intensivo";
  if (
    normalized.includes("flexible") ||
    normalized.includes("demanda") ||
    normalized.includes("paquete")
  ) {
    return "Paquete Flexible";
  }
  if (normalized.includes("demo")) return "Demo Nivelación";
  if (normalized.includes("personaliz")) return "Personalizado";
  if (normalized.includes("regular")) return "Regular";
  return null;
}

function normalizeExtraScores(value: unknown): ExtraScoreSnapshot[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new InformesValidationError("extraScores debe ser una lista.");
  }
  return value.map((raw, index) => {
    if (!raw || typeof raw !== "object") {
      throw new InformesValidationError(
        `El campo extra ${index + 1} tiene un formato inválido.`,
      );
    }
    const item = raw as Record<string, unknown>;
    const label = String(item.label || "").trim();
    if (!label) {
      throw new InformesValidationError(
        `El campo extra ${index + 1} no tiene etiqueta.`,
      );
    }
    return {
      field_id: (item.field_id as string | null | undefined) ?? null,
      field_key: (item.field_key as string | null | undefined) ?? null,
      label,
      type: String(item.type || "short_text"),
      raw_value: item.raw_value ?? null,
      band: (item.band as string | null | undefined) ?? null,
    };
  });
}

/**
 * Devuelve los campos EXTRA configurados para un instrumento/categoría/nivel.
 * Si `evaluation_fields` está vacío, devuelve [] y la UI usa los campos núcleo.
 */
export async function getCriteria(
  query: EvaluationCriteriaQuery = {},
): Promise<EvaluationFieldRow[]> {
  const params: Record<string, string> = {
    order: "report_order.asc,label.asc",
  };
  if (!query.includeInactive) params.is_active = "eq.true";

  const fields = await postgrestSelect<EvaluationFieldRow>(
    "evaluation_fields",
    params,
    "*",
  );

  const instrument = normalizeTitle(query.instrument || "");
  const program = programFromLevel(query.level);
  const ageRange = ageCategoryToRange(query.ageCategory);

  return fields
    .filter((field) => {
      if (!query.includeInactive && !field.is_active) return false;

      // Sin docente explícito solo se muestran plantillas globales.
      if (query.teacherId) {
        if (
          field.owner_teacher_id &&
          field.owner_teacher_id !== query.teacherId
        ) {
          return false;
        }
      } else if (field.owner_teacher_id) {
        return false;
      }

      if (instrument && field.instrument) {
        if (normalizeTitle(field.instrument) !== instrument) return false;
      }

      if (program && field.program) {
        const fieldProgram = normalizeTitle(field.program);
        const wanted = normalizeTitle(program);
        if (
          !fieldProgram.includes(wanted) &&
          !wanted.includes(fieldProgram)
        ) {
          return false;
        }
      }

      if (ageRange) {
        if (field.age_min !== null && field.age_min > ageRange.max) return false;
        if (field.age_max !== null && field.age_max < ageRange.min) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (a.report_order !== b.report_order) {
        return a.report_order - b.report_order;
      }
      return a.label.localeCompare(b.label, "es", { sensitivity: "base" });
    });
}

export async function getEvaluationBySessionKey(
  sessionKey: string,
): Promise<LessonEvaluationRow | null> {
  const key = (sessionKey || "").trim();
  if (!key) {
    throw new InformesValidationError("sessionKey es obligatorio.");
  }
  const rows = await postgrestSelect<LessonEvaluationRow>(
    "lesson_evaluations",
    { session_key: `eq.${key}` },
    "*",
  );
  return rows[0] ?? null;
}

export async function getStudentEvaluations(
  studentId: string,
  query: StudentEvaluationQuery = {},
): Promise<LessonEvaluationRow[]> {
  const id = (studentId || "").trim();
  if (!id) {
    throw new InformesValidationError("studentId es obligatorio.");
  }

  const params: Record<string, string> = {
    student_id: `eq.${id}`,
    order: "session_date.desc,start_time.desc",
  };

  const from = query.from ? toIsoDate(query.from) : null;
  const to = query.to ? toIsoDate(query.to) : null;

  if (from && to) {
    if (from > to) {
      throw new InformesValidationError(
        "La fecha inicial no puede ser posterior a la fecha final.",
      );
    }
    params.and = `(session_date.gte.${from},session_date.lte.${to})`;
  } else if (from) {
    params.session_date = `gte.${from}`;
  } else if (to) {
    params.session_date = `lte.${to}`;
  }

  if (!query.includeTest) params.is_test = "eq.false";
  if (query.limit && query.limit > 0) {
    params.limit = String(Math.trunc(query.limit));
  }

  const rows = await postgrestSelect<LessonEvaluationRow>(
    "lesson_evaluations",
    params,
    "*",
  );

  return rows.sort((a, b) => {
    const byDate = b.session_date.localeCompare(a.session_date);
    if (byDate !== 0) return byDate;
    return (b.start_time || "").localeCompare(a.start_time || "");
  });
}

export async function getLatestEvaluation(
  studentId: string,
): Promise<LessonEvaluationRow | null> {
  const rows = await getStudentEvaluations(studentId, { limit: 1 });
  return rows[0] ?? null;
}

/**
 * Guarda una evaluación de clase. Si ya existe la misma session_key, actualiza
 * el registro (conservando created_by_* original). Si no, inserta.
 */
export async function saveLessonEvaluation(
  input: SaveLessonEvaluationInput,
): Promise<LessonEvaluationRow> {
  const studentId = (input.studentId || "").trim();
  const teacherId = (input.teacherId || "").trim();
  const teacherName = (input.teacherName || "").trim();

  if (!studentId) {
    throw new InformesValidationError("studentId es obligatorio.");
  }
  if (!teacherId) {
    throw new InformesValidationError("teacherId es obligatorio.");
  }
  if (!teacherName) {
    throw new InformesValidationError("teacherName es obligatorio.");
  }

  const sessionDate = toIsoDate(input.sessionDate);
  const startTime = (input.startTime || "").trim();
  if (!isTimeHHMM(startTime)) {
    throw new InformesValidationError(
      `Hora de inicio inválida: "${input.startTime}". Usa HH:MM (24 horas).`,
    );
  }

  const durationMin = Number(input.durationMin ?? 45);
  if (!Number.isFinite(durationMin) || durationMin <= 0) {
    throw new InformesValidationError("durationMin debe ser mayor que cero.");
  }

  let studentName = (input.studentName || "").trim();
  let instrument = (input.instrument || "").trim();
  let modality = (input.modality || "").trim();
  let program = (input.program || "").trim();

  if (!studentName || !instrument || !modality) {
    const rows = await postgrestSelect<{
      full_name: string;
      instrument: string;
      modality: string;
      level: string;
    }>(
      "students",
      { id: `eq.${studentId}` },
      "full_name,instrument,modality,level",
    );
    const student = rows[0];
    if (!student) {
      throw new InformesValidationError(
        `No se encontró el alumno ${studentId} en PostgreSQL.`,
      );
    }
    studentName ||= student.full_name || "";
    instrument ||= student.instrument || "";
    modality ||= student.modality || "";
  }

  if (!program) program = modality;

  const sessionKey = buildSessionKey({
    studentId,
    sessionDate,
    startTime,
    durationMin,
    modality,
    sessionKey: input.sessionKey,
  });

  const isCanto = normalizeTitle(instrument).includes("canto");
  let classMode: ClassMode =
    input.classMode || (isCanto ? "individual" : "no_aplica");
  if (isCanto && classMode === "no_aplica") classMode = "individual";
  if (!CLASS_MODES.includes(classMode)) {
    throw new InformesValidationError(
      `classMode inválido: "${classMode}". Usa individual, grupal o no_aplica.`,
    );
  }

  const score = clampScore(input.score);

  let overallStatus: OverallStatus = input.overallStatus || "sin_evaluar";
  if (!OVERALL_STATUSES.includes(overallStatus)) {
    throw new InformesValidationError(
      `overallStatus inválido: "${overallStatus}".`,
    );
  }
  if (!input.overallStatus && score !== null) {
    overallStatus =
      score >= 8 ? "logrado" : score >= 5 ? "en_proceso" : "pendiente";
  }

  const repertoire = normalizeRepertoire(input.repertoire);
  const extraScores = normalizeExtraScores(input.extraScores);
  const testFlags = resolveTestFlags({
    isTest: input.isTest,
    testRunId: input.testRunId,
  });

  const createdById = (input.createdById || input.teacherId || "").trim();
  const createdByName = (input.createdByName || input.teacherName || "").trim();

  const basePayload: Partial<LessonEvaluationRow> = {
    session_key: sessionKey,
    lesson_id: (input.lessonId || "").trim() || null,
    student_id: studentId,
    student_name_snapshot: studentName || null,
    teacher_id: teacherId,
    teacher_name: teacherName,
    session_date: sessionDate,
    start_time: startTime,
    duration_min: durationMin,
    modality: modality || null,
    instrument: instrument || null,
    program: program || null,
    class_mode: classMode,
    topic: (input.topic || "").trim() || null,
    overall_status: overallStatus,
    score,
    repertoire,
    homework: (input.homework || "").trim() || null,
    teacher_comment: (input.teacherComment || "").trim() || null,
    extra_scores: extraScores,
    is_test: testFlags.is_test,
    test_run_id: testFlags.test_run_id,
  };

  const existing = await getEvaluationBySessionKey(sessionKey);

  if (existing) {
    return postgrestPatch<LessonEvaluationRow>(
      "lesson_evaluations",
      { session_key: `eq.${sessionKey}` },
      {
        ...basePayload,
        updated_by_id: createdById || null,
        updated_by_name: createdByName || null,
      },
    );
  }

  const created = await postgrestInsert<LessonEvaluationRow>(
    "lesson_evaluations",
    {
      ...basePayload,
      created_by_id: createdById || null,
      created_by_name: createdByName || null,
    },
  );

  if (!created || !created.id) {
    throw new Error(
      "PostgreSQL no devolvió la evaluación creada. Revisa permisos y el trigger de auditoría.",
    );
  }
  return created;
}
