/**
 * ================================================================
 * Servicio de Notas Pedagógicas Docentes con Moderación — Vibra Music
 * ================================================================
 * 
 * Flujo:
 * 1. Docente redacta nota -> submitTeacherNote() -> status "pendiente"
 * 2. Administración (Dueña / Secretaría / Staff) evalúa:
 *    - approveTeacherNote() -> status "aprobado" -> se publica en students.notes y Portal Familiar
 *    - rejectTeacherNote() -> status "rechazado" -> registra motivo de rechazo en PostgreSQL
 * 
 * Persistencia:
 * - PostgreSQL: notification_logs (canal in_app, status pendiente/enviado/fallido)
 * - PostgreSQL: students.notes (solo cuando es aprobada)
 * - LocalStorage: 'cadencia_teacher_notes' para reactividad instantánea offline-first
 * ================================================================
 */

import { postgrestInsert, postgrestSelect, postgrestPatch } from "@/lib/insforge";
import type { Role } from "@/store/app-store";

export type TeacherNoteStatus = "pendiente" | "aprobado" | "rechazado";

export interface TeacherParentNote {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  familyName: string;
  parentPhone?: string;
  instrument: string;
  noteType: "student" | "general";
  content: string;
  status: TeacherNoteStatus;
  moderatedBy?: string;
  moderatedAt?: string;
  moderationComment?: string;
  createdAt: string;
  updatedAt?: string;
}

const STORAGE_KEY = "cadencia_teacher_parent_notes";
export const NOTES_SYNC_CHANNEL = "vibra_notes_sync_channel";

// Notificar cambio de notas a otras pestañas
export function notifyNotesUpdated() {
  try {
    if (typeof window !== "undefined") {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel(NOTES_SYNC_CHANNEL);
        bc.postMessage({ type: "NOTES_UPDATED", timestamp: Date.now() });
        bc.close();
      }
      window.dispatchEvent(new CustomEvent("vibra-notes-updated"));
    }
  } catch {}
}

// Obtener notas desde caché local
export function getLocalTeacherNotes(): TeacherParentNote[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Guardar notas en caché local
export function saveLocalTeacherNotes(notes: TeacherParentNote[]) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {}
}

// Mapear status de la BD ('pendiente', 'enviado', 'fallido') a TeacherNoteStatus
function mapDBStatusToNoteStatus(dbStatus: string): TeacherNoteStatus {
  if (dbStatus === "enviado") return "aprobado";
  if (dbStatus === "fallido") return "rechazado";
  return "pendiente";
}

function mapNoteStatusToDBStatus(status: TeacherNoteStatus): "pendiente" | "enviado" | "fallido" {
  if (status === "aprobado") return "enviado";
  if (status === "rechazado") return "fallido";
  return "pendiente";
}

// ---------------------------------------------------------------
// EDGE: submitTeacherNote (Profesor envía nota para aprobación)
// ---------------------------------------------------------------
export async function submitTeacherNote(
  userRole: Role,
  noteData: {
    teacherId: string;
    teacherName: string;
    studentId: string;
    studentName: string;
    familyName: string;
    parentPhone?: string;
    instrument: string;
    noteType?: "student" | "general";
    content: string;
  }
): Promise<TeacherParentNote> {
  const noteId = `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const nowIso = new Date().toISOString();

  const newNote: TeacherParentNote = {
    id: noteId,
    teacherId: noteData.teacherId,
    teacherName: noteData.teacherName,
    studentId: noteData.studentId,
    studentName: noteData.studentName,
    familyName: noteData.familyName,
    parentPhone: noteData.parentPhone,
    instrument: noteData.instrument,
    noteType: noteData.noteType || "student",
    content: noteData.content.trim(),
    status: "pendiente",
    createdAt: nowIso,
  };

  // 1. Guardar reactivamente en caché local
  const localList = getLocalTeacherNotes();
  // Si ya existía una nota pendiente para el mismo alumno y profesor, reemplazarla
  const updatedList = [
    newNote,
    ...localList.filter(
      (n) => !(n.studentId === newNote.studentId && n.teacherId === newNote.teacherId && n.status === "pendiente")
    ),
  ];
  saveLocalTeacherNotes(updatedList);
  notifyNotesUpdated();

  // 2. Persistir en PostgreSQL (notification_logs)
  try {
    const isUuidTeacher = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(noteData.teacherId);
    const validSentBy = isUuidTeacher ? noteData.teacherId : "00000000-0000-0000-0000-000000000003";

    const res = await postgrestInsert<any>("notification_logs", {
      recipient_type: "student",
      recipient_id: null, // Evitar conflictos de FK si el studentId es mock o local
      channel: "in_app",
      subject: `Nota Pedagógica: ${noteData.studentName} (${noteData.instrument}) [${noteData.teacherName}]`,
      body: noteData.content.trim(),
      sent_by: validSentBy,
      status: "pendiente",
      error_msg: JSON.stringify({
        familyName: noteData.familyName,
        parentPhone: noteData.parentPhone || "",
        studentId: noteData.studentId,
        studentName: noteData.studentName,
        teacherName: noteData.teacherName,
        noteType: noteData.noteType || "student",
        localId: noteId,
      }),
    });

    if (res?.id) {
      newNote.id = res.id;
      const refreshedList = getLocalTeacherNotes().map((n) => (n.id === noteId ? { ...n, id: res.id } : n));
      saveLocalTeacherNotes(refreshedList);
    }
  } catch (err) {
    console.warn("[TeacherNotes] Aviso al persistir en notification_logs de PostgreSQL:", err);
  }

  return newNote;
}

// ---------------------------------------------------------------
// EDGE: fetchAllTeacherNotes (Carga combinada PostgreSQL + local)
// ---------------------------------------------------------------
export async function fetchAllTeacherNotes(): Promise<TeacherParentNote[]> {
  const localList = getLocalTeacherNotes();

  try {
    const dbLogs = await postgrestSelect<any>("notification_logs", {
      channel: "eq.in_app",
      order: "sent_at.desc",
      limit: "100",
    });

    if (dbLogs && dbLogs.length > 0) {
      const dbNotes: TeacherParentNote[] = [];

      for (const log of dbLogs) {
        let meta: Record<string, any> = {};
        try {
          if (log.error_msg && log.error_msg.startsWith("{")) {
            meta = JSON.parse(log.error_msg);
          }
        } catch {}

        // Determinar nombre del profesor
        let tName = meta.teacherName || "Profesor";
        let sName = meta.studentName || log.subject?.replace(/^Nota Pedagógica:\s*/i, "") || "Alumno";

        dbNotes.push({
          id: log.id,
          teacherId: log.sent_by || "00000000-0000-0000-0000-000000000003",
          teacherName: tName,
          studentId: meta.studentId || log.recipient_id || log.id,
          studentName: sName,
          familyName: meta.familyName || "Familia Vibra",
          parentPhone: meta.parentPhone || "",
          instrument: meta.instrument || "Música",
          noteType: meta.noteType || "student",
          content: log.body,
          status: mapDBStatusToNoteStatus(log.status),
          moderationComment: meta.rejectionReason || (log.status === "fallido" ? log.error_msg : undefined),
          createdAt: log.sent_at || new Date().toISOString(),
        });
      }

      // Fusionar con notas locales pendientes para consistencia total
      const map = new Map<string, TeacherParentNote>();
      dbNotes.forEach((n) => map.set(n.id, n));
      localList.forEach((l) => {
        if (!map.has(l.id)) {
          map.set(l.id, l);
        }
      });

      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      saveLocalTeacherNotes(merged);
      return merged;
    }
  } catch (err) {
    console.warn("[TeacherNotes] Aviso al consultar notification_logs:", err);
  }

  return localList;
}

// ---------------------------------------------------------------
// EDGE: approveTeacherNote (Administración aprueba la nota)
// ---------------------------------------------------------------
export async function approveTeacherNote(
  adminRole: Role,
  adminName: string,
  noteId: string,
  editedContent?: string
): Promise<TeacherParentNote> {
  const nowIso = new Date().toISOString();
  const localList = getLocalTeacherNotes();
  const target = localList.find((n) => n.id === noteId);

  const finalContent = (editedContent !== undefined ? editedContent : target?.content || "").trim();

  const updatedNote: TeacherParentNote = target
    ? {
        ...target,
        content: finalContent,
        status: "aprobado",
        moderatedBy: adminName,
        moderatedAt: nowIso,
      }
    : {
        id: noteId,
        teacherId: "00000000-0000-0000-0000-000000000003",
        teacherName: "Profesor",
        studentId: "unknown",
        studentName: "Alumno",
        familyName: "Familia Vibra",
        instrument: "Música",
        noteType: "student",
        content: finalContent,
        status: "aprobado",
        moderatedBy: adminName,
        moderatedAt: nowIso,
        createdAt: nowIso,
      };

  // 1. Actualizar caché local
  const newList = localList.map((n) => (n.id === noteId ? updatedNote : n));
  if (!target) newList.unshift(updatedNote);
  saveLocalTeacherNotes(newList);
  notifyNotesUpdated();

  // 2. Persistir en PostgreSQL
  // A) Actualizar notification_logs a status = 'enviado'
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(noteId);
  if (isUuid) {
    postgrestPatch("notification_logs", { id: `eq.${noteId}` }, {
      status: "enviado",
      body: finalContent,
    }).catch((err) => console.warn("[TeacherNotes] Aviso actualizando notification_log:", err));
  }

  // B) Si el studentId es UUID o resoluble, actualizar students.notes en PostgreSQL
  if (updatedNote.studentId) {
    const isStudentUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(updatedNote.studentId);
    if (isStudentUuid) {
      postgrestPatch("students", { id: `eq.${updatedNote.studentId}` }, {
        notes: finalContent,
      }).catch((err) => console.warn("[TeacherNotes] Aviso actualizando students.notes:", err));
    }
  }

  return updatedNote;
}

// ---------------------------------------------------------------
// EDGE: rejectTeacherNote (Administración desaprueba / rechaza la nota)
// ---------------------------------------------------------------
export async function rejectTeacherNote(
  adminRole: Role,
  adminName: string,
  noteId: string,
  reason: string
): Promise<TeacherParentNote> {
  const nowIso = new Date().toISOString();
  const localList = getLocalTeacherNotes();
  const target = localList.find((n) => n.id === noteId);

  const updatedNote: TeacherParentNote = target
    ? {
        ...target,
        status: "rechazado",
        moderatedBy: adminName,
        moderatedAt: nowIso,
        moderationComment: reason.trim(),
      }
    : {
        id: noteId,
        teacherId: "00000000-0000-0000-0000-000000000003",
        teacherName: "Profesor",
        studentId: "unknown",
        studentName: "Alumno",
        familyName: "Familia Vibra",
        instrument: "Música",
        noteType: "student",
        content: "",
        status: "rechazado",
        moderatedBy: adminName,
        moderatedAt: nowIso,
        moderationComment: reason.trim(),
        createdAt: nowIso,
      };

  // 1. Actualizar caché local
  const newList = localList.map((n) => (n.id === noteId ? updatedNote : n));
  if (!target) newList.unshift(updatedNote);
  saveLocalTeacherNotes(newList);
  notifyNotesUpdated();

  // 2. Persistir en PostgreSQL
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(noteId);
  if (isUuid) {
    postgrestPatch("notification_logs", { id: `eq.${noteId}` }, {
      status: "fallido",
      error_msg: reason.trim(),
    }).catch((err) => console.warn("[TeacherNotes] Aviso actualizando rechazo en notification_logs:", err));
  }

  return updatedNote;
}
