/**
 * ================================================================
 * family-notes.service.ts — Notas para familias
 * ================================================================
 *
 * Flujo: pendiente -> publicado | rechazado.
 *
 * Reglas:
 *   - Nada se publica sin moderación de Dirección/Secretaría.
 *   - `teacher_cohort` congela la lista de alumnos al publicar
 *     (`cohort_student_ids` + `cohort_snapshot_at`). Así una nota del
 *     "grupo de Nathaly" no cambia después si entra/sale un alumno.
 *   - `students.notes` queda congelado como legacy: este servicio NO lo toca.
 *   - El portal familia solo lee notas publicadas.
 */

import {
  postgrestInsert,
  postgrestPatch,
  postgrestSelect,
} from "@/lib/insforge";
import type {
  FamilyNoteRow,
  FamilyNoteScope,
  FamilyNoteStatus,
  SubmitFamilyNoteInput,
} from "@/lib/informes/types";
import {
  InformesValidationError,
  normalizeTeacherName,
  resolveTestFlags,
  uniqueStrings,
} from "@/lib/informes/utils";

const SCOPES: FamilyNoteScope[] = ["student", "teacher_cohort", "academy"];
const STATUSES: FamilyNoteStatus[] = ["pendiente", "publicado", "rechazado"];

interface CohortStudentRow {
  id: string;
  full_name: string;
  assigned_teacher_id: string | null;
  emergency_contact: Record<string, unknown> | null;
}

export interface ListFamilyNotesParams {
  status?: FamilyNoteStatus;
  teacherId?: string;
  studentId?: string;
  scope?: FamilyNoteScope;
  includeTest?: boolean;
  limit?: number;
}

/**
 * Cohorte docente = unión de:
 *   - alumnos activos con assigned_teacher_id = docente
 *   - alumnos activos cuyo horario (emergency_contact.scheduleLessons)
 *     incluye una lección con ese docente
 *
 * Se calcula al publicar y se congela.
 */
export async function resolveTeacherCohort(
  teacherId?: string | null,
  teacherName?: string | null,
): Promise<string[]> {
  const cleanTeacherId = (teacherId || "").trim();
  const cleanTeacherName = normalizeTeacherName(teacherName);

  if (!cleanTeacherId && !cleanTeacherName) return [];

  const rows = await postgrestSelect<CohortStudentRow>(
    "students",
    { status: "eq.activo" },
    "id,full_name,assigned_teacher_id,emergency_contact",
  );

  const ids = new Set<string>();

  for (const row of rows) {
    if (cleanTeacherId && row.assigned_teacher_id === cleanTeacherId) {
      ids.add(row.id);
      continue;
    }

    if (!cleanTeacherName) continue;

    const ec = (row.emergency_contact as Record<string, unknown>) || {};
    const lessons = Array.isArray(ec.scheduleLessons)
      ? (ec.scheduleLessons as Array<Record<string, unknown>>)
      : [];

    const teachesThisStudent = lessons.some(
      (lesson) =>
        normalizeTeacherName(String(lesson.teacher || "")) === cleanTeacherName,
    );

    if (teachesThisStudent) ids.add(row.id);
  }

  return [...ids];
}

export async function getFamilyNoteById(
  id: string,
): Promise<FamilyNoteRow | null> {
  const clean = (id || "").trim();
  if (!clean) throw new InformesValidationError("id es obligatorio.");
  const rows = await postgrestSelect<FamilyNoteRow>(
    "family_notes",
    { id: `eq.${clean}` },
    "*",
  );
  return rows[0] ?? null;
}

/**
 * Crea una nota en estado `pendiente`. No se publica automáticamente.
 */
export async function submitFamilyNote(
  input: SubmitFamilyNoteInput,
): Promise<FamilyNoteRow> {
  if (!SCOPES.includes(input.scope)) {
    throw new InformesValidationError(
      'El alcance debe ser "student", "teacher_cohort" o "academy".',
    );
  }

  const title = (input.title || "").trim();
  const body = (input.body || "").trim();
  if (!title) {
    throw new InformesValidationError("El título de la nota es obligatorio.");
  }
  if (!body) {
    throw new InformesValidationError("El mensaje de la nota es obligatorio.");
  }

  if (input.scope === "student" && !(input.studentId || "").trim()) {
    throw new InformesValidationError(
      "Una nota para un alumno requiere studentId.",
    );
  }

  if (
    input.scope === "teacher_cohort" &&
    !(input.teacherId || "").trim() &&
    !(input.teacherName || "").trim()
  ) {
    throw new InformesValidationError(
      "Una nota de cohorte requiere teacherId o teacherName.",
    );
  }

  const testFlags = resolveTestFlags({
    isTest: input.isTest,
    testRunId: input.testRunId,
  });

  const submittedById = (input.submittedById || "").trim() || null;
  const submittedByName = (input.submittedByName || "").trim() || null;

  const payload: Partial<FamilyNoteRow> = {
    scope: input.scope,
    student_id: (input.studentId || "").trim() || null,
    student_name_snapshot: (input.studentName || "").trim() || null,
    teacher_id: (input.teacherId || "").trim() || null,
    teacher_name: (input.teacherName || "").trim() || null,
    cohort_student_ids: uniqueStrings(input.cohortStudentIds || []),
    cohort_teacher_ids: uniqueStrings([
      input.teacherId,
      ...(input.cohortTeacherIds || []),
    ]),
    cohort_snapshot_at: null,
    title,
    body,
    status: "pendiente",
    submitted_at: new Date().toISOString(),
    submitted_by_id: submittedById,
    submitted_by_name: submittedByName,
    reviewed_by_id: null,
    reviewed_by_name: null,
    reviewed_at: null,
    rejection_reason: null,
    published_at: null,
    published_by_id: null,
    published_by_name: null,
    is_test: testFlags.is_test,
    test_run_id: testFlags.test_run_id,
    created_by_id: submittedById,
    created_by_name: submittedByName,
  };

  const created = await postgrestInsert<FamilyNoteRow>(
    "family_notes",
    payload,
  );
  if (!created || !created.id) {
    throw new Error(
      "PostgreSQL no devolvió la nota creada. Revisa permisos y el trigger de auditoría.",
    );
  }
  return created;
}

export async function listFamilyNotes(
  params: ListFamilyNotesParams = {},
): Promise<FamilyNoteRow[]> {
  const query: Record<string, string> = {
    order: "created_at.desc",
  };

  if (params.status) {
    if (!STATUSES.includes(params.status)) {
      throw new InformesValidationError(
        `Estado de nota inválido: "${params.status}".`,
      );
    }
    query.status = `eq.${params.status}`;
  }
  if (params.teacherId) query.teacher_id = `eq.${params.teacherId}`;
  if (params.studentId) query.student_id = `eq.${params.studentId}`;
  if (params.scope) query.scope = `eq.${params.scope}`;
  if (!params.includeTest) query.is_test = "eq.false";
  if (params.limit && params.limit > 0) {
    query.limit = String(Math.trunc(params.limit));
  }

  return postgrestSelect<FamilyNoteRow>("family_notes", query, "*");
}

/**
 * Dirección aprueba y publica. Para `teacher_cohort`, recalcula la cohorte
 * en ese instante y la congela. Para `student`, no toca `students.notes`.
 */
export async function approveFamilyNote(
  id: string,
  actorId: string | null,
  actorName: string | null,
): Promise<FamilyNoteRow> {
  const cleanId = (id || "").trim();
  if (!cleanId) throw new InformesValidationError("id es obligatorio.");

  const existing = await getFamilyNoteById(cleanId);
  if (!existing) {
    throw new InformesValidationError(`No existe la nota ${cleanId}.`);
  }
  if (existing.status === "publicado") {
    return existing;
  }

  const publishedAt = new Date().toISOString();
  const payload: Partial<FamilyNoteRow> = {
    status: "publicado",
    published_at: publishedAt,
    published_by_id: actorId,
    published_by_name: actorName,
    reviewed_by_id: actorId,
    reviewed_by_name: actorName,
    reviewed_at: publishedAt,
    rejection_reason: null,
  };

  if (existing.scope === "teacher_cohort") {
    const cohort = await resolveTeacherCohort(
      existing.teacher_id,
      existing.teacher_name,
    );
    if (cohort.length === 0) {
      throw new InformesValidationError(
        "No se pudo congelar la cohorte: el docente no tiene alumnos activos asignados ni en horario.",
      );
    }
    payload.cohort_student_ids = uniqueStrings([
      ...(existing.cohort_student_ids || []),
      ...cohort,
    ]);
    payload.cohort_teacher_ids = uniqueStrings([
      existing.teacher_id,
      ...(existing.cohort_teacher_ids || []),
    ]);
    payload.cohort_snapshot_at = publishedAt;
  }

  return postgrestPatch<FamilyNoteRow>(
    "family_notes",
    { id: `eq.${cleanId}` },
    payload,
  );
}

/** Dirección rechaza una nota con motivo obligatorio. */
export async function rejectFamilyNote(
  id: string,
  actorId: string | null,
  actorName: string | null,
  reason: string,
): Promise<FamilyNoteRow> {
  const cleanId = (id || "").trim();
  const cleanReason = (reason || "").trim();
  if (!cleanId) throw new InformesValidationError("id es obligatorio.");
  if (!cleanReason) {
    throw new InformesValidationError(
      "Debes indicar el motivo del rechazo para que el docente pueda corregir.",
    );
  }

  const existing = await getFamilyNoteById(cleanId);
  if (!existing) {
    throw new InformesValidationError(`No existe la nota ${cleanId}.`);
  }
  if (existing.status === "publicado") {
    throw new InformesValidationError(
      "No se puede rechazar una nota ya publicada.",
    );
  }

  return postgrestPatch<FamilyNoteRow>(
    "family_notes",
    { id: `eq.${cleanId}` },
    {
      status: "rechazado",
      rejection_reason: cleanReason,
      reviewed_by_id: actorId,
      reviewed_by_name: actorName,
      reviewed_at: new Date().toISOString(),
    },
  );
}

function mergeNotes(notes: FamilyNoteRow[]): FamilyNoteRow[] {
  const byId = new Map<string, FamilyNoteRow>();
  for (const note of notes) {
    if (note?.id) byId.set(note.id, note);
  }
  return [...byId.values()].sort((a, b) => {
    const aTime = a.published_at || a.created_at || "";
    const bTime = b.published_at || b.created_at || "";
    return bTime.localeCompare(aTime);
  });
}

async function fetchPublishedFamilyNotesForStudent(
  studentId: string,
  includeTest: boolean,
): Promise<FamilyNoteRow[]> {
  const clean = (studentId || "").trim();
  if (!clean) throw new InformesValidationError("studentId es obligatorio.");

  const base: Record<string, string> = {
    status: "eq.publicado",
    order: "published_at.desc",
  };
  if (!includeTest) base.is_test = "eq.false";

  const [direct, cohort, academy] = await Promise.all([
    postgrestSelect<FamilyNoteRow>(
      "family_notes",
      { ...base, student_id: `eq.${clean}` },
      "*",
    ),
    postgrestSelect<FamilyNoteRow>(
      "family_notes",
      { ...base, cohort_student_ids: `cs.{${clean}}` },
      "*",
    ),
    postgrestSelect<FamilyNoteRow>(
      "family_notes",
      { ...base, scope: "eq.academy" },
      "*",
    ),
  ]);

  return mergeNotes([...direct, ...cohort, ...academy]);
}

/**
 * Notas publicadas visibles para un alumno en el portal familia:
 *   - nota directa del alumno
 *   - nota de cohorte que lo congeló
 *   - nota de academia (para todos)
 * Nunca devuelve datos de prueba (`is_test = true`).
 */
export async function getPublishedFamilyNotesForStudent(
  studentId: string,
): Promise<FamilyNoteRow[]> {
  return fetchPublishedFamilyNotesForStudent(studentId, false);
}

/**
 * Lectura interna de auditoría para Dirección. Incluye notas de prueba.
 * NUNCA debe usarse desde el portal familia.
 */
export async function getPublishedFamilyNotesForStudentForAudit(
  studentId: string,
): Promise<FamilyNoteRow[]> {
  return fetchPublishedFamilyNotesForStudent(studentId, true);
}

async function fetchPublishedFamilyNotesForFamily(
  familyId: string,
  includeTest: boolean,
): Promise<FamilyNoteRow[]> {
  const clean = (familyId || "").trim();
  if (!clean) throw new InformesValidationError("familyId es obligatorio.");

  const students = await postgrestSelect<{ id: string }>(
    "students",
    { family_id: `eq.${clean}` },
    "id",
  );
  const ids = students.map((student) => student.id).filter(Boolean);
  if (ids.length === 0) return [];

  const perStudent = await Promise.all(
    ids.map((id) => fetchPublishedFamilyNotesForStudent(id, includeTest)),
  );

  return mergeNotes(perStudent.flat());
}

/**
 * Notas publicadas visibles para una familia. Agrupa a todos sus hijos y
 * deduplica por id (una nota de academia aparece una sola vez).
 */
export async function getPublishedFamilyNotesForFamily(
  familyId: string,
): Promise<FamilyNoteRow[]> {
  return fetchPublishedFamilyNotesForFamily(familyId, false);
}

/**
 * Lectura interna de auditoría para Dirección. Incluye notas de prueba.
 * NUNCA debe usarse desde el portal familia.
 */
export async function getPublishedFamilyNotesForFamilyForAudit(
  familyId: string,
): Promise<FamilyNoteRow[]> {
  return fetchPublishedFamilyNotesForFamily(familyId, true);
}

/* ================================================================
 * Sincronización de UI (Fase 3)
 * ----------------------------------------------------------------
 * Solo señaliza "algo cambió" para que el formulario del docente y la
 * bandeja de Dirección se recarguen. NO transporta datos ni estado
 * transaccional: la fuente de verdad sigue siendo PostgreSQL.
 * ================================================================ */

export const FAMILY_NOTES_SYNC_CHANNEL = "vibra-family-notes-sync";
export const FAMILY_NOTES_UPDATED_EVENT = "vibra-family-notes-updated";

let broadcastChannel: BroadcastChannel | null = null;

/** Avisa a las demás pestañas/vistas que la bandeja debe recargarse. */
export function notifyFamilyNotesChanged(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new Event(FAMILY_NOTES_UPDATED_EVENT));
  } catch {
    /* no-op */
  }
  try {
    if ("BroadcastChannel" in window) {
      broadcastChannel = broadcastChannel || new BroadcastChannel(FAMILY_NOTES_SYNC_CHANNEL);
      broadcastChannel.postMessage({ at: Date.now() });
    }
  } catch {
    /* no-op */
  }
}

/** Suscribe una vista a los cambios. Devuelve la función de limpieza. */
export function subscribeToFamilyNotesChanges(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => callback();
  window.addEventListener(FAMILY_NOTES_UPDATED_EVENT, handler);

  let bc: BroadcastChannel | null = null;
  try {
    if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel(FAMILY_NOTES_SYNC_CHANNEL);
      bc.onmessage = () => callback();
    }
  } catch {
    bc = null;
  }

  return () => {
    window.removeEventListener(FAMILY_NOTES_UPDATED_EVENT, handler);
    bc?.close();
  };
}
