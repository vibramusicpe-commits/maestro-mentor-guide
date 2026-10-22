/**
 * ================================================================
 * internal-notes.service.ts — Notas internas (Dirección / Staff)
 * ================================================================
 *
 * Bandeja interna: lo que el docente observa y Dirección/Secretaría debe
 * revisar. NUNCA se expone al portal familia.
 *
 * La migración 008b agregó:
 *   status: nueva | leida | archivada
 *   read_at, read_by_id, read_by_name
 */

import {
  postgrestInsert,
  postgrestPatch,
  postgrestSelect,
} from "@/lib/insforge";
import type {
  CreateInternalNoteInput,
  InternalNoteRow,
  InternalNoteStatus,
  InternalNoteVisibility,
} from "@/lib/informes/types";
import {
  InformesValidationError,
  resolveTestFlags,
} from "@/lib/informes/utils";

const STATUSES: InternalNoteStatus[] = ["nueva", "leida", "archivada"];
const VISIBILITIES: InternalNoteVisibility[] = ["staff", "direction"];

export interface ListInternalNotesParams {
  status?: InternalNoteStatus;
  studentId?: string;
  teacherId?: string;
  visibility?: InternalNoteVisibility;
  includeTest?: boolean;
  includeArchived?: boolean;
  limit?: number;
}

export async function getInternalNoteById(
  id: string,
): Promise<InternalNoteRow | null> {
  const clean = (id || "").trim();
  if (!clean) throw new InformesValidationError("id es obligatorio.");
  const rows = await postgrestSelect<InternalNoteRow>(
    "internal_notes",
    { id: `eq.${clean}` },
    "*",
  );
  return rows[0] ?? null;
}

export async function createInternalNote(
  input: CreateInternalNoteInput,
): Promise<InternalNoteRow> {
  const body = (input.body || "").trim();
  if (!body) {
    throw new InformesValidationError(
      "El contenido de la nota interna es obligatorio.",
    );
  }

  const visibility = input.visibility || "staff";
  if (!VISIBILITIES.includes(visibility)) {
    throw new InformesValidationError(
      'La visibilidad debe ser "staff" o "direction".',
    );
  }

  const testFlags = resolveTestFlags({
    isTest: input.isTest,
    testRunId: input.testRunId,
  });

  const createdById = (input.createdById || "").trim() || null;
  const createdByName = (input.createdByName || "").trim() || null;

  const payload: Partial<InternalNoteRow> = {
    student_id: (input.studentId || "").trim() || null,
    student_name_snapshot: (input.studentName || "").trim() || null,
    teacher_id: (input.teacherId || "").trim() || null,
    teacher_name: (input.teacherName || "").trim() || null,
    body,
    visibility,
    status: "nueva",
    read_at: null,
    read_by_id: null,
    read_by_name: null,
    is_test: testFlags.is_test,
    test_run_id: testFlags.test_run_id,
    created_by_id: createdById,
    created_by_name: createdByName,
  };

  const created = await postgrestInsert<InternalNoteRow>(
    "internal_notes",
    payload,
  );
  if (!created || !created.id) {
    throw new Error(
      "PostgreSQL no devolvió la nota interna creada. Revisa permisos y el trigger de auditoría.",
    );
  }
  return created;
}

/**
 * Bandeja interna. Por defecto oculta las archivadas y los datos de prueba.
 */
export async function listInternalNotes(
  params: ListInternalNotesParams = {},
): Promise<InternalNoteRow[]> {
  const query: Record<string, string> = {
    order: "created_at.desc",
  };

  if (params.status) {
    if (!STATUSES.includes(params.status)) {
      throw new InformesValidationError(
        `Estado de nota interna inválido: "${params.status}".`,
      );
    }
    query.status = `eq.${params.status}`;
  } else if (!params.includeArchived) {
    query.status = "neq.archivada";
  }

  if (params.studentId) query.student_id = `eq.${params.studentId}`;
  if (params.teacherId) query.teacher_id = `eq.${params.teacherId}`;
  if (params.visibility) query.visibility = `eq.${params.visibility}`;
  if (!params.includeTest) query.is_test = "eq.false";
  if (params.limit && params.limit > 0) {
    query.limit = String(Math.trunc(params.limit));
  }

  return postgrestSelect<InternalNoteRow>("internal_notes", query, "*");
}

/**
 * Marca una nota como leída. Si ya estaba leída, es idempotente. Si estaba
 * archivada, conserva el estado archivado pero deja registro de lectura.
 */
export async function markInternalNoteRead(
  id: string,
  actorId: string | null,
  actorName: string | null,
): Promise<InternalNoteRow> {
  const cleanId = (id || "").trim();
  if (!cleanId) throw new InformesValidationError("id es obligatorio.");

  const existing = await getInternalNoteById(cleanId);
  if (!existing) {
    throw new InformesValidationError(`No existe la nota interna ${cleanId}.`);
  }

  if (existing.status === "leida" && existing.read_at) {
    return existing;
  }

  const now = new Date().toISOString();

  if (existing.status === "archivada") {
    if (existing.read_at) return existing;
    return postgrestPatch<InternalNoteRow>(
      "internal_notes",
      { id: `eq.${cleanId}` },
      {
        read_at: now,
        read_by_id: actorId,
        read_by_name: actorName,
      },
    );
  }

  return postgrestPatch<InternalNoteRow>(
    "internal_notes",
    { id: `eq.${cleanId}` },
    {
      status: "leida",
      read_at: now,
      read_by_id: actorId,
      read_by_name: actorName,
    },
  );
}

/**
 * Archiva una nota. Si nunca fue leída, también registra la lectura/archivo
 * con el actor que la archivó.
 */
export async function archiveInternalNote(
  id: string,
  actorId: string | null,
  actorName: string | null,
): Promise<InternalNoteRow> {
  const cleanId = (id || "").trim();
  if (!cleanId) throw new InformesValidationError("id es obligatorio.");

  const existing = await getInternalNoteById(cleanId);
  if (!existing) {
    throw new InformesValidationError(`No existe la nota interna ${cleanId}.`);
  }
  if (existing.status === "archivada") {
    return existing;
  }

  const now = new Date().toISOString();

  return postgrestPatch<InternalNoteRow>(
    "internal_notes",
    { id: `eq.${cleanId}` },
    {
      status: "archivada",
      read_at: existing.read_at || now,
      read_by_id: existing.read_by_id || actorId,
      read_by_name: existing.read_by_name || actorName,
    },
  );
}

/**
 * Reabre una nota archivada. La deja en `leida` (ya fue vista al abrirla) y
 * conserva el registro original de lectura. No borra nada.
 */
export async function reopenInternalNote(
  id: string,
  actorId: string | null,
  actorName: string | null,
): Promise<InternalNoteRow> {
  const cleanId = (id || "").trim();
  if (!cleanId) throw new InformesValidationError("id es obligatorio.");

  const existing = await getInternalNoteById(cleanId);
  if (!existing) {
    throw new InformesValidationError(`No existe la nota interna ${cleanId}.`);
  }
  if (existing.status !== "archivada") {
    return existing;
  }

  const now = new Date().toISOString();

  return postgrestPatch<InternalNoteRow>(
    "internal_notes",
    { id: `eq.${cleanId}` },
    {
      status: "leida",
      read_at: existing.read_at || now,
      read_by_id: existing.read_by_id || actorId,
      read_by_name: existing.read_by_name || actorName,
      updated_by_id: actorId,
      updated_by_name: actorName,
    },
  );
}

/* ================================================================
 * Sincronización de UI (Fase 4)
 * ----------------------------------------------------------------
 * Solo señaliza "algo cambió" para que el formulario del docente y la
 * bandeja de Dirección se recarguen. NO transporta datos ni estado
 * transaccional: la fuente de verdad sigue siendo PostgreSQL.
 * ================================================================ */

export const INTERNAL_NOTES_SYNC_CHANNEL = "vibra-internal-notes-sync";
export const INTERNAL_NOTES_UPDATED_EVENT = "vibra-internal-notes-updated";

let broadcastChannel: BroadcastChannel | null = null;

/** Avisa a las demás pestañas/vistas que la bandeja debe recargarse. */
export function notifyInternalNotesChanged(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new Event(INTERNAL_NOTES_UPDATED_EVENT));
  } catch {
    /* no-op */
  }
  try {
    if ("BroadcastChannel" in window) {
      broadcastChannel =
        broadcastChannel || new BroadcastChannel(INTERNAL_NOTES_SYNC_CHANNEL);
      broadcastChannel.postMessage({ at: Date.now() });
    }
  } catch {
    /* no-op */
  }
}

/** Suscribe una vista a los cambios. Devuelve la función de limpieza. */
export function subscribeToInternalNotesChanges(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => callback();
  window.addEventListener(INTERNAL_NOTES_UPDATED_EVENT, handler);

  let bc: BroadcastChannel | null = null;
  try {
    if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel(INTERNAL_NOTES_SYNC_CHANNEL);
      bc.onmessage = () => callback();
    }
  } catch {
    bc = null;
  }

  return () => {
    window.removeEventListener(INTERNAL_NOTES_UPDATED_EVENT, handler);
    bc?.close();
  };
}
