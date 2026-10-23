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
  ProgressReportPeriodType,
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
  type: ProgressReportPeriodType;
  start: string;
  end: string;
  label: string | null;
} {
  const allowed: ProgressReportPeriodType[] = [
    "mensual",
    "trimestral",
    "avance",
    "cierre_ciclo",
  ];
  if (!period || !allowed.includes(period.type)) {
    throw new InformesValidationError(
      'El tipo de período debe ser "mensual", "trimestral", "avance" o "cierre_ciclo".',
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

  const testFlags = resolveTestFlags({
    isTest: options.isTest ?? null,
    testRunId: options.testRunId ?? null,
  });

  // Deduplicación en servidor: un mismo alumno no puede tener dos informes
  // vivos del mismo tipo y misma ventana. Si ya existe, se devuelve ese.
  const existing = await postgrestSelect<ProgressReportRow>(
    "progress_reports",
    {
      student_id: `eq.${cleanStudentId}`,
      period_type: `eq.${safePeriod.type}`,
      period_start: `eq.${safePeriod.start}`,
      period_end: `eq.${safePeriod.end}`,
      status: "neq.rejected",
      is_test: `eq.${testFlags.is_test}`,
      order: "created_at.desc",
      limit: "1",
    },
    "*",
  );
  if (existing[0]) return existing[0];

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
    kind: safePeriod.type,
  });

  // Regla aprobada (2026-10-23): un informe es el consolidado de varios
  // reportes de clase. Sin el mínimo de reportes no se genera nada.
  if (!snapshot.evidence.canGenerate) {
    throw new InformesValidationError(snapshot.evidence.message);
  }

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

  const content = {
    version: 2,
    student: {
      id: student.id,
      name: student.name,
      instrument: student.instrument,
      level: student.level,
      modality: String(student.modality || ""),
      planType: snapshot.plan.planType,
      contractedSessions: snapshot.plan.contractedSessions,
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
    plan: snapshot.plan,
    evidence: snapshot.evidence,
    sessionLog: snapshot.sessionLog,
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

/** Instrumento del informe, leído del snapshot de contenido (jsonb `content`). */
export function getReportInstrument(report: ProgressReportRow | null): string {
  if (!report) return "";
  const content =
    report.content && typeof report.content === "object"
      ? (report.content as Record<string, unknown>)
      : null;
  const student =
    content && content.student && typeof content.student === "object"
      ? (content.student as Record<string, unknown>)
      : null;
  const value = student?.instrument;
  return typeof value === "string" ? value.trim() : "";
}

export interface ProgressReportListFilters {
  studentId?: string;
  status?: string;
  teacherName?: string;
  instrument?: string;
  periodType?: ProgressReportPeriodType;
  periodFrom?: string;
  periodTo?: string;
  limit?: number;
}

function asIsoDateOrNull(value: string | undefined): string | null {
  const clean = (value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(clean) ? clean : null;
}

/**
 * Bandeja general de informes para Dirección/Secretaría (Fase 6).
 *
 * - Solo producción: `is_test = false` siempre.
 * - Filtros server-side: estado, alumno, docente y rango de periodo.
 * - El instrumento vive dentro de `content.student.instrument` (jsonb), por
 *   eso se filtra en cliente después de traer la página de resultados.
 * - Cero datos financieros.
 */
export async function listProgressReports(
  filters: ProgressReportListFilters = {},
): Promise<ProgressReportRow[]> {
  const limit = Math.min(Math.max(Number(filters.limit) || 300, 1), 1000);
  const query: Record<string, string> = {
    is_test: "eq.false",
    order: "created_at.desc",
    limit: String(limit),
  };

  const status = (filters.status || "").trim();
  if (status) query.status = `eq.${status}`;

  const studentId = (filters.studentId || "").trim();
  if (studentId) query.student_id = `eq.${studentId}`;

  const periodType = (filters.periodType || "").trim();
  if (periodType) query.period_type = `eq.${periodType}`;

  const teacherName = (filters.teacherName || "").trim();
  if (teacherName) query.teacher_name = `ilike.*${teacherName}*`;

  const periodFrom = asIsoDateOrNull(filters.periodFrom);
  if (periodFrom) query.period_start = `gte.${periodFrom}`;

  const periodTo = asIsoDateOrNull(filters.periodTo);
  if (periodTo) query.period_end = `lte.${periodTo}`;

  const rows = await postgrestSelect<ProgressReportRow>(
    "progress_reports",
    query,
    "*",
  );

  const wantedInstrument = (filters.instrument || "").trim().toLowerCase();
  if (!wantedInstrument) return rows;

  return rows.filter(
    (row) => getReportInstrument(row).toLowerCase() === wantedInstrument,
  );
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

/**
 * Informes publicados de un alumno, con el snapshot congelado fusionado.
 * Lo usa el portal familia cuando la sesión resuelve alumnos pero no un
 * `family_id` explícito (fallback por correo del apoderado, ADR-0172).
 */
export async function getPublishedReportsForStudent(
  studentId: string,
): Promise<ProgressReportRow[]> {
  const clean = (studentId || "").trim();
  if (!clean) return [];

  const rows = await postgrestSelect<ProgressReportRow>(
    "progress_reports",
    {
      student_id: `eq.${clean}`,
      status: "eq.published",
      is_test: "eq.false",
      order: "period_end.desc",
    },
    "*",
  );

  return rows.map(mergePublishedSnapshot);
}

function collectReportFieldIds(report: ProgressReportRow): string[] {
  const content =
    report.content && typeof report.content === "object"
      ? (report.content as Record<string, unknown>)
      : {};
  const criteria = Array.isArray(content.criteria)
    ? (content.criteria as Array<Record<string, unknown>>)
    : [];
  const ids = criteria
    .map((item) => (item?.field_id ? String(item.field_id).trim() : ""))
    .filter(Boolean);
  return Array.from(new Set(ids));
}

/**
 * Criterios en borrador (`ui_config.draft = true`) presentes en el informe.
 *
 * Regla ADR-0175: un criterio no validado por el docente NUNCA puede salir
 * en un informe publicado. La UI llama a esta función antes de enviar a
 * revisión y antes de publicar; si devuelve algo, se bloquea la acción.
 */
export async function getDraftCriteriaInReport(
  report: ProgressReportRow,
): Promise<string[]> {
  const ids = collectReportFieldIds(report);
  if (ids.length === 0) return [];

  const rows = await postgrestSelect<{
    id: string;
    label: string | null;
    ui_config: Record<string, unknown> | null;
  }>("evaluation_fields", { id: `in.(${ids.join(",")})` }, "id,label,ui_config");

  return rows
    .filter((row) => {
      const config = row.ui_config;
      return Boolean(config && typeof config === "object" && config.draft === true);
    })
    .map((row) => (row.label || row.id).trim());
}
