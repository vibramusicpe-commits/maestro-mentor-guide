/**
 * ================================================================
 * attendance.service.ts — Kiosco del Profesor & Asistencia
 * ================================================================
 *
 * MAPA DE EDGES DEL GRAFO (Insforge):
 *
 * [UI: Kiosco Profesor → Marcar Asistencia]
 *   │
 *   ├─[Edge: Auth] teacher → solo sus clases del día (filtered by teacher_id)
 *   │
 *   ├─[Edge: Payload Extract] { lessonId, studentId, status, arrivedAt }
 *   │
 *   ├─[Edge: Credit Gate]
 *   │    ├─ status = 'ausente'      → p_delta = +1 (crédito por falta)
 *   │    ├─ status = 'recuperacion' → p_delta = -1 (consume crédito)
 *   │    └─ status = 'presente'     → p_delta = 0  (sin cambio)
 *   │
 *   ├─[Edge: Success] → lesson.status = 'completada', audit log insertado
 *   └─[Edge: Error]   → syncQueue guarda intento para retry
 *
 * Tablas: attendance_logs, lessons
 * ================================================================
 */

import {
  assertRole,
  postgrestPatch,
  postgrestRPC,
  postgrestSelect,
} from "@/lib/insforge";
import type { Role } from "@/store/app-store";

// ---------------------------------------------------------------
// Tipos DB
// ---------------------------------------------------------------
export type AttendanceStatusDB = "presente" | "ausente" | "tarde" | "recuperacion";

export interface DBLesson {
  id: string;
  student_id: string;
  teacher_id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: 45 | 90;
  modality: "Regular (8 clases / 45 min)" | "Intensivo (4 clases / 90 min)";
  room: string | null;
  status: "programada" | "completada" | "cancelada" | "reprogramada";
  notes: string | null;
  // Join embebido:
  students?: { full_name: string; instrument: string; makeup_credits: number };
}

export interface DBAttendanceLog {
  id: string;
  lesson_id: string;
  student_id: string;
  teacher_id: string;
  status: AttendanceStatusDB;
  arrived_at: string | null;
  credit_delta: number;
  note: string | null;
  registered_at: string;
}

// ---------------------------------------------------------------
// EDGE: getLessonsByDate
// Profesor ve solo sus clases. Admin/Staff ven todas.
// ---------------------------------------------------------------
export async function getLessonsByDate(
  userRole: Role,
  date: string,          // ISO: "2025-06-15"
  teacherId?: string,
): Promise<DBLesson[]> {
  assertRole(
    userRole,
    ["super_admin", "staff", "teacher"],
    "ver clases del día",
  );

  const params: Record<string, string> = {
    scheduled_date: `eq.${date}`,
    order: "scheduled_time.asc",
  };

  if (userRole === "teacher" && teacherId) {
    params["teacher_id"] = `eq.${teacherId}`;
  }

  return postgrestSelect<DBLesson>(
    "lessons",
    params,
    "id,student_id,teacher_id,scheduled_date,scheduled_time,duration_minutes,modality,room,status,notes,students(full_name,instrument,makeup_credits)",
  );
}

// ---------------------------------------------------------------
// EDGE: markAttendance
// Registra asistencia y aplica crédito si corresponde.
//
// Credit Gate Logic:
//   'ausente'      → +1 crédito (falta registrada)
//   'recuperacion' → -1 crédito (clase de recuperación)
//   'presente'/'tarde' → 0 (sin cambio de créditos)
// ---------------------------------------------------------------
export async function markAttendance(
  userRole: Role,
  teacherId: string,
  payload: {
    lessonId: string;
    studentId: string;
    status: AttendanceStatusDB;
    arrivedAt?: string;
    note?: string;
  },
): Promise<DBAttendanceLog> {
  assertRole(
    userRole,
    ["teacher", "super_admin", "staff"],
    "marcar asistencia",
  );

  // [Credit Gate] — Determinar delta
  let creditDelta = 0;
  if (payload.status === "ausente") creditDelta = 1;
  if (payload.status === "recuperacion") creditDelta = -1;

  // INSERT en attendance_logs (inmutable)
  const log = await postgrestRPC<DBAttendanceLog>("insert_attendance_log", {
    p_lesson_id: payload.lessonId,
    p_student_id: payload.studentId,
    p_teacher_id: teacherId,
    p_status: payload.status,
    p_arrived_at: payload.arrivedAt ?? null,
    p_credit_delta: creditDelta,
    p_note: payload.note ?? null,
  });

  // Actualizar estado de la clase a 'completada'
  await postgrestPatch<DBLesson>(
    "lessons",
    { id: `eq.${payload.lessonId}` },
    { status: "completada" },
  );

  return log;
}

// ---------------------------------------------------------------
// EDGE: getLessonAttendanceHistory
// Historial de asistencia de una clase específica.
// ---------------------------------------------------------------
export async function getLessonAttendanceHistory(
  userRole: Role,
  lessonId: string,
): Promise<DBAttendanceLog[]> {
  assertRole(
    userRole,
    ["super_admin", "staff", "teacher"],
    "ver historial de asistencia",
  );
  return postgrestSelect<DBAttendanceLog>("attendance_logs", {
    lesson_id: `eq.${lessonId}`,
    order: "registered_at.desc",
  });
}

// ---------------------------------------------------------------
// EDGE: getStudentAttendanceRate
// Calcula tasa de asistencia de un alumno.
// ---------------------------------------------------------------
export async function getStudentAttendanceRate(
  userRole: Role,
  studentId: string,
): Promise<{ total: number; present: number; absent: number; rate: number }> {
  assertRole(
    userRole,
    ["super_admin", "staff", "teacher"],
    "ver estadísticas de asistencia",
  );

  const logs = await postgrestSelect<DBAttendanceLog>("attendance_logs", {
    student_id: `eq.${studentId}`,
  });

  const total = logs.length;
  const present = logs.filter((l) =>
    l.status === "presente" || l.status === "tarde" || l.status === "recuperacion",
  ).length;
  const absent = logs.filter((l) => l.status === "ausente").length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 100;

  return { total, present, absent, rate };
}
