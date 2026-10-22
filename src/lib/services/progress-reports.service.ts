/**
 * ================================================================
 * progress-reports.service.ts — Informes de progreso
 * ================================================================
 *
 * Flujo oficial:
 *   draft -> pending -> published | rejected
 *
 * Reglas:
 *   - El docente crea/edita el borrador y lo envía a revisión.
 *   - Dirección aprueba y publica. Al publicar se congela
 *     `published_snapshot`; la familia lee ESE snapshot, no el borrador.
 *   - Un informe publicado no se edita. Si se requiere corregir, se retira
 *     (fase posterior) y se genera uno nuevo.
 *   - El contenido es estrictamente pedagógico: asistencia, repertorio,
 *     fortalezas, objetivos y recomendaciones. CERO finanzas.
 */

import {
  postgrestInsert,
  postgrestPatch,
  postgrestSelect,
} from "@/lib/insforge";
import { buildAttendanceSnapshot } from "@/lib/informes/attendance-snapshot";
import type {
  ActorRef,
  ProgressReportPeriod,
  ProgressReportRow,
  RepertoireItem,
  UpdateProgressReportPatch,
} from "@/lib/informes/types";
import {
  InformesValidationError,
  resolveTestFlags,
  toIsoDate,
} from "@/lib/informes/utils";
import {
  mapDBStudentToAdminStudent,
  type DBStudent,
} from "./students.service";
import { getStudentEvaluations } from "./evaluations.service";

export interface CreateProgressReportOptions {
  actor?: ActorRef;
  isTest?: boolean;
  testRunId?: string | null;
}

function assertPeriod(period: ProgressReportPeriod): {
  type: "mensual" | "trimestral";
  start: string;
  end: string;
  label: string | null;
} {
  if (!period || (period.type !== "mensual" && period.type !== "trimestral")) {
    throw new InformesValidationError(
      'El tipo de período debe ser "mensual" o "trimestral".',
    );
  }
  const start = toIsoDate(period.start);
  const end = toIsoDate(period.end);
  if (start > end) {
    throw new InformesValidationError(
      "La fecha de inicio del período no puede ser posterior al fin.",
    );
  }
  return {
    type: period.type,
    start,
    end,
    label: (period.label || "").trim() || null,
  };
}

async function findStudent(studentId: string): Promise<DBStudent> {
  const rows = await postgrestSelect<DBStudent>(
    "students",
    { id: `eq.${studentId}` },
    "*",
  );
  const student = rows[0];
  if (!student) {
    throw new InformesValidationError(
      `No se encontró el alumno ${studentId} en PostgreSQL.`,
    );
  }
  return student;
}

export async function getReportById(
  id: string,
): Promise<ProgressReportRow | null> {
  const clean = (id || "").trim();
  if (!clean) throw new InformesValidationError("id es obligatorio.");
  const rows = await postgrestSelect<ProgressReportRow>(
    "progress_reports",
    { id: `eq.${clean}` },
    "*",
  );
  return rows[0] ?? null;
}

/**
 * Crea un informe en estado `draft` con el snapshot pedagógico del período.
 * No publica nada y no toca el portal familia.
 */
export async function createProgressReport(
  studentId: string,
  period: ProgressReportPeriod,
  options: CreateProgressReportOptions = {},
): Promise<ProgressReportRow> {
  const cleanStudentId = (studentId || "").trim();
  if (!cleanStudentId) {
    throw new InformesValidationError("studentId es obligatorio.");
  }

  const safePeriod = assertPeriod(period);
  const dbStudent = await findStudent(cleanStudentId);
  const student = mapDBStudentToAdminStudent(dbStudent);

  const evaluations = await getStudentEvaluations(cleanStudentId, {
    from: safePeriod.start,
    to: safePeriod.end,
  });

  const snapshot = buildAttendanceSnapshot({
    student,
    allSchedule: student.scheduleLessons || [],
    periodStart: safePeriod.start,
    periodEnd: safePeriod.end,
    evaluations,
  });

  const actor = options.actor;
  const actorId = (actor?.id || "").trim() || null;
  const actorName = (actor?.name || "").trim() || null;

  const assignedTeacherId = (dbStudent.assigned_teacher_id || "").trim() || null;
  const assignedTeacherName =
    student.teacher && student.teacher !== "Prof. por Asignar"
      ? student.teacher
      : null;

  const teacherId = assignedTeacherId || actorId;
  const teacherName = assignedTeacherName || actorName;

  // Para el período trimestral, el nivel inicial es el nivel final del
  // trimestre publicado anterior. Si no existe, se usa el nivel actual.
  let levelStart = student.level || null;
  if (safePeriod.type === "trimestral") {
    const previous = await postgrestSelect<ProgressReportRow>(
      "progress_reports",
      {
        student_id: `eq.${cleanStudentId}`,
        period_type: "eq.trimestral",
        status: "eq.published",
        is_test: "eq.false",
        order: "period_end.desc",
        limit: "1",
      },
      "*",
    );
    if (previous[0]?.level_end) {
      levelStart = previous[0].level_end;
    }
  }

  const testFlags = resolveTestFlags({
    isTest: options.isTest,
    testRunId: options.testRunId,
  });

  const content = {
    version: 1,
    student: {
      id: student.id,
      name: student.name,
      instrument: student.instrument,
      level: student.level,
      modality: String(student.modality || ""),
      ageCategory: student.ageCategory ?? null,
      teacher: student.teacher,
      familyId: student.familyId ?? null,
    },
    period: {
      type: safePeriod.type,
      start: safePeriod.start,
      end: safePeriod.end,
      label: safePeriod.label,
    },
    attendance: snapshot,
    criteria: snapshot.extraScores,
    repertoire: snapshot.repertoire,
    generatedAt: snapshot.generatedAt,
  };

  const payload: Partial<ProgressReportRow> = {
    student_id: student.id,
    student_name_snapshot: student.name,
    teacher_id: teacherId,
    teacher_name: teacherName,
    period_type: safePeriod.type,
    period_start: safePeriod.start,
    period_end: safePeriod.end,
    level_start: levelStart,
    level_end: null,
    attendance_summary: snapshot.period as unknown as Record<string, unknown>,
    repertoire_summary: snapshot.repertoire,
    strengths: null,
    goals: null,
    recommendations: null,
    family_message: null,
    teacher_comment: null,
    content,
    published_snapshot: null,
    status: "draft",
    submitted_at: null,
    submitted_by_id: null,
    submitted_by_name: null,
    reviewed_by_id: null,
    reviewed_by_name: null,
    reviewed_at: null,
    rejection_reason: null,
    published_at: null,
    published_by_id: null,
    published_by_name: null,
    is_test: testFlags.is_test,
    test_run_id: testFlags.test_run_id,
    created_by_id: actorId,
    created_by_name: actorName,
  };

  const created = await postgrestInsert<ProgressReportRow>(
    "progress_reports",
    payload,
  );
  if (!created || !created.id) {
    throw new Error(
      "PostgreSQL no devolvió el informe creado. Revisa permisos y el trigger de auditoría.",
    );
  }
  return created;
}

/**
 * Edita un borrador o un informe rechazado. También permite enviarlo a
 * revisión (`status: "pending"`). Un informe publicado es inmutable.
 */
export async function updateProgressReport(
  id: string,
  patch: UpdateProgressReportPatch,
  actor?: ActorRef,
): Promise<ProgressReportRow> {
  const cleanId = (id || "").trim();
  if (!cleanId) throw new InformesValidationError("id es obligatorio.");

  const existing = await getReportById(cleanId);
  if (!existing) {
    throw new InformesValidationError(`No existe el informe ${cleanId}.`);
  }
  if (existing.status === "published") {
    throw new InformesValidationError(
      "El informe ya está publicado y es inmutable. Retíralo antes de editarlo.",
    );
  }

  const payload: Partial<ProgressReportRow> = {};

  if (patch.level_start !== undefined) payload.level_start = patch.level_start;
  if (patch.level_end !== undefined) payload.level_end = patch.level_end;
  if (patch.strengths !== undefined) payload.strengths = patch.strengths;
  if (patch.goals !== undefined) payload.goals = patch.goals;
  if (patch.recommendations !== undefined) {
    payload.recommendations = patch.recommendations;
  }
  if (patch.family_message !== undefined) {
    payload.family_message = patch.family_message;
  }
  if (patch.teacher_comment !== undefined) {
    payload.teacher_comment = patch.teacher_comment;
  }
  if (patch.content !== undefined) payload.content = patch.content;
  if (patch.attendance_summary !== undefined) {
    payload.attendance_summary = patch.attendance_summary;
  }
  if (patch.repertoire_summary !== undefined) {
    payload.repertoire_summary = patch.repertoire_summary;
  }

  if (patch.status !== undefined) {
    if (patch.status !== "draft" && patch.status !== "pending") {
      throw new InformesValidationError(
        'Desde aquí solo puedes guardar como "draft" o enviar a "pending".',
      );
    }
    payload.status = patch.status;
    if (patch.status === "pending") {
      payload.submitted_at = new Date().toISOString();
      payload.submitted_by_id = actor?.id ?? null;
      payload.submitted_by_name = actor?.name ?? null;
      payload.rejection_reason = null;
    } else {
      payload.submitted_at = null;
      payload.submitted_by_id = null;
      payload.submitted_by_name = null;
    }
  }

  return postgrestPatch<ProgressReportRow>(
    "progress_reports",
    { id: `eq.${cleanId}` },
    payload,
  );
}

/**
 * Dirección aprueba y publica. Solo un informe `pending` puede publicarse.
 * Guarda `published_snapshot` con el contenido exacto que verá la familia.
 */
export async function approveProgressReport(
  id: string,
  actorId: string | null,
  actorName: string | null,
): Promise<ProgressReportRow> {
  const cleanId = (id || "").trim();
  if (!cleanId) throw new InformesValidationError("id es obligatorio.");

  const existing = await getReportById(cleanId);
  if (!existing) {
    throw new InformesValidationError(`No existe el informe ${cleanId}.`);
  }
  if (existing.status === "published") {
    return existing;
  }
  if (existing.status !== "pending") {
    throw new InformesValidationError(
      "Solo se puede publicar un informe enviado a revisión (pending).",
    );
  }

  const publishedAt = new Date().toISOString();
  const { published_snapshot: _ignored, ...base } = existing;

  const publishedSnapshot = {
    ...base,
    status: "published" as const,
    published_at: publishedAt,
    published_by_id: actorId,
    published_by_name: actorName,
    reviewed_by_id: actorId,
    reviewed_by_name: actorName,
    reviewed_at: publishedAt,
    rejection_reason: null,
  };

  return postgrestPatch<ProgressReportRow>(
    "progress_reports",
    { id: `eq.${cleanId}` },
    {
      status: "published",
      published_snapshot: publishedSnapshot as unknown as Record<string, unknown>,
      published_at: publishedAt,
      published_by_id: actorId,
      published_by_name: actorName,
      reviewed_by_id: actorId,
      reviewed_by_name: actorName,
      reviewed_at: publishedAt,
      rejection_reason: null,
    },
  );
}

/** Alias explícito para el botón "Publicar" de Dirección. */
export async function publishProgressReport(
  id: string,
  actorId: string | null,
  actorName: string | null,
): Promise<ProgressReportRow> {
  return approveProgressReport(id, actorId, actorName);
}

/** Dirección rechaza un informe con motivo obligatorio. */
export async function rejectProgressReport(
  id: string,
  actorId: string | null,
  actorName: string | null,
  reason: string,
): Promise<ProgressReportRow> {
  const cleanId = (id || "").trim();
  const cleanReason = (reason || "").trim();
  if (!cleanId) throw new InformesValidationError("id es obligatorio.");
  if (!cleanReason) {
    throw new InformesValidationError(
      "Debes indicar el motivo del rechazo para que el docente pueda corregir.",
    );
  }

  const existing = await getReportById(cleanId);
  if (!existing) {
    throw new InformesValidationError(`No existe el informe ${cleanId}.`);
  }
  if (existing.status === "published") {
    throw new InformesValidationError(
      "No se puede rechazar un informe ya publicado.",
    );
  }

  return postgrestPatch<ProgressReportRow>(
    "progress_reports",
    { id: `eq.${cleanId}` },
    {
      status: "rejected",
      rejection_reason: cleanReason,
      reviewed_by_id: actorId,
      reviewed_by_name: actorName,
      reviewed_at: new Date().toISOString(),
    },
  );
}

/** Historial completo del alumno para el docente/dirección (incluye borradores). */
export async function getReportsForStudent(
  studentId: string,
): Promise<ProgressReportRow[]> {
  const clean = (studentId || "").trim();
  if (!clean) throw new InformesValidationError("studentId es obligatorio.");

  const rows = await postgrestSelect<ProgressReportRow>(
    "progress_reports",
    {
      student_id: `eq.${clean}`,
      is_test: "eq.false",
      order: "period_end.desc",
    },
    "*",
  );

  return rows;
}

function mergePublishedSnapshot(row: ProgressReportRow): ProgressReportRow {
  const snapshot =
    row.published_snapshot && typeof row.published_snapshot === "object"
      ? (row.published_snapshot as Partial<ProgressReportRow>)
      : null;
  if (!snapshot) return row;
  return {
    ...row,
    ...snapshot,
    published_snapshot: null,
  };
}

async function fetchReportsForFamily(
  familyId: string,
  includeTest: boolean,
): Promise<ProgressReportRow[]> {
  const clean = (familyId || "").trim();
  if (!clean) throw new InformesValidationError("familyId es obligatorio.");

  const students = await postgrestSelect<{ id: string }>(
    "students",
    { family_id: `eq.${clean}` },
    "id",
  );
  const ids = students.map((student) => student.id).filter(Boolean);
  if (ids.length === 0) return [];

  const query: Record<string, string> = {
    student_id: `in.(${ids.join(",")})`,
    status: "eq.published",
    order: "period_end.desc",
  };
  if (!includeTest) query.is_test = "eq.false";

  const rows = await postgrestSelect<ProgressReportRow>(
    "progress_reports",
    query,
    "*",
  );

  return rows.map(mergePublishedSnapshot);
}

/**
 * Informes visibles para el portal familia. Solo devuelve publicados, nunca
 * datos de prueba (`is_test = true`), y reemplaza el contenido por el snapshot
 * congelado al publicar.
 */
export async function getReportsForFamily(
  familyId: string,
): Promise<ProgressReportRow[]> {
  return fetchReportsForFamily(familyId, false);
}

/**
 * Lectura interna de auditoría para Dirección. Incluye informes de prueba.
 * NUNCA debe usarse desde el portal familia.
 */
export async function getReportsForFamilyForAudit(
  familyId: string,
): Promise<ProgressReportRow[]> {
  return fetchReportsForFamily(familyId, true);
}

/**
 * Repertorio consolidado de un informe (útil para la UI de edición).
 */
export function getReportRepertoire(
  report: ProgressReportRow,
): RepertoireItem[] {
  return Array.isArray(report.repertoire_summary)
    ? report.repertoire_summary
    : [];
}
