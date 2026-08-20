/**
 * ================================================================
 * students.service.ts — Capa de Datos: Módulo Alumnos
 * ================================================================
 *
 * MAPA DE EDGES DEL GRAFO (Insforge):
 *
 * [UI: Módulo Alumnos]
 *   │
 *   ├─[Edge: Auth Check]──→ ¿Rol en {super_admin, staff}? ──→ ❌ PERMISSION_DENIED
 *   │                                  │ ✅
 *   ├─[Edge: Payload Extract] ──→ Solo { id, status | modality | credits }
 *   │
 *   ├─[Edge: Success]  ──→ Actualiza Zustand store con dato real
 *   └─[Edge: Error]    ──→ Mantiene estado Zustand (modo offline)
 *
 * Tablas: students, families (join embebido)
 * ================================================================
 */

import {
  assertRole,
  postgrestInsert,
  postgrestPatch,
  postgrestRPC,
  postgrestSelect,
} from "@/lib/insforge";
import type { Role } from "@/store/app-store";

// ---------------------------------------------------------------
// Tipos de la capa de servicio (reflejan el schema SQL)
// ---------------------------------------------------------------
export interface DBStudent {
  id: string;
  family_id: string;
  full_name: string;
  instrument: string;
  level: string;
  assigned_teacher_id: string | null;
  modality: "Regular (8 clases / 45 min)" | "Intensivo (4 clases / 90 min)";
  status: "activo" | "pausa" | "baja";
  makeup_credits: number;
  birthdate: string | null;
  attendance_rate: number;
  emergency_contact: { name: string; phone: string; relation: string } | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Join embebido de PostgREST:
  families?: {
    family_name: string;
    email: string;
    primary_guardian_name: string;
    primary_guardian_phone: string;
  };
}

export interface BirthdayAlert {
  student_id: string;
  full_name: string;
  birthdate: string;
  instrument: string;
  family_name: string;
}

// ---------------------------------------------------------------
// EDGE: getStudents
// Carga alumnos con datos de familia embebidos.
// Roles permitidos: super_admin, staff
// ---------------------------------------------------------------
export async function getStudents(
  userRole: Role,
  filterStatus?: "activo" | "pausa" | "baja",
): Promise<DBStudent[]> {
  // [RBAC Gate]
  assertRole(userRole, ["super_admin", "staff"], "ver alumnos");

  // [Payload: solo campos necesarios + join de familia]
  const params: Record<string, string> = {
    order: "full_name.asc",
  };
  if (filterStatus) params["status"] = `eq.${filterStatus}`;

  return postgrestSelect<DBStudent>(
    "students",
    params,
    "id,family_id,full_name,instrument,level,assigned_teacher_id,modality,status,makeup_credits,birthdate,attendance_rate,emergency_contact,notes,families(family_name,email,primary_guardian_name,primary_guardian_phone)",
  );
}

// ---------------------------------------------------------------
// EDGE: getStudentsByTeacher
// Solo el profesor ve sus propios alumnos asignados.
// ---------------------------------------------------------------
export async function getStudentsByTeacher(
  userRole: Role,
  teacherId: string,
): Promise<DBStudent[]> {
  assertRole(userRole, ["teacher", "super_admin", "staff"], "ver alumnos del profesor");

  return postgrestSelect<DBStudent>("students", {
    assigned_teacher_id: `eq.${teacherId}`,
    status: "eq.activo",
    order: "full_name.asc",
  });
}

// ---------------------------------------------------------------
// EDGE: setStudentModality
// Cambia modalidad Regular ↔ Intensivo.
// ---------------------------------------------------------------
export async function setStudentModality(
  userRole: Role,
  studentId: string,
  modality: DBStudent["modality"],
): Promise<DBStudent> {
  // [RBAC Gate]
  assertRole(userRole, ["super_admin", "staff"], "cambiar modalidad");

  // [Payload mínimo: solo modality]
  return postgrestPatch<DBStudent>(
    "students",
    { id: `eq.${studentId}` },
    { modality },
  );
}

// ---------------------------------------------------------------
// EDGE: setStudentStatus
// Cambia activo / pausa / baja.
// ---------------------------------------------------------------
export async function setStudentStatus(
  userRole: Role,
  studentId: string,
  status: DBStudent["status"],
): Promise<DBStudent> {
  assertRole(userRole, ["super_admin", "staff"], "cambiar estado del alumno");
  return postgrestPatch<DBStudent>("students", { id: `eq.${studentId}` }, { status });
}

// ---------------------------------------------------------------
// EDGE: addMakeupCredit (+1 falta) / consumeMakeupCredit (-1 recuperación)
// Llama a la función PostgreSQL SECURITY DEFINER (RBAC en DB).
// El edge en DB es la segunda línea de defensa (defense in depth).
// ---------------------------------------------------------------
export async function addMakeupCredit(
  userRole: Role,
  studentId: string,
  lessonId?: string,
): Promise<void> {
  assertRole(userRole, ["super_admin", "staff"], "agregar crédito de falta");
  await postgrestRPC("add_makeup_credit", {
    p_student_id: studentId,
    p_delta: 1,
    p_lesson_id: lessonId ?? null,
    p_note: "Crédito por inasistencia",
  });
}

export async function consumeMakeupCredit(
  userRole: Role,
  studentId: string,
  lessonId?: string,
): Promise<void> {
  assertRole(userRole, ["super_admin", "staff"], "consumir crédito de recuperación");
  await postgrestRPC("add_makeup_credit", {
    p_student_id: studentId,
    p_delta: -1,
    p_lesson_id: lessonId ?? null,
    p_note: "Crédito utilizado en clase de recuperación",
  });
}

// ---------------------------------------------------------------
// EDGE: getBirthdaysThisMonth
// Filtra alumnos cuyo cumpleaños cae en el mes actual.
// Usado para el widget "Cumpleaños del Mes" en el Dashboard.
// ---------------------------------------------------------------
export async function getBirthdaysThisMonth(userRole: Role): Promise<DBStudent[]> {
  assertRole(userRole, ["super_admin", "staff"], "ver cumpleaños del mes");

  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  // PostgREST: LIKE en campo DATE (texto ISO 'YYYY-MM-DD')
  return postgrestSelect<DBStudent>("students", {
    "birthdate": `like.*-${currentMonth}-*`,
    "status": "eq.activo",
    "order": "birthdate.asc",
  });
}

// ---------------------------------------------------------------
// EDGE: createStudent
// Función 2 de Secretaría: Registro de Matrículas
// Roles permitidos: super_admin y staff (Secretaría Nayeli)
// ---------------------------------------------------------------
export async function createStudent(
  userRole: Role,
  payload: Omit<DBStudent, "id" | "created_at" | "updated_at" | "families">,
): Promise<DBStudent> {
  assertRole(userRole, ["super_admin", "staff"], "registrar matrícula de nuevo alumno");
  return postgrestInsert<DBStudent>("students", payload);
}

// ---------------------------------------------------------------
// EDGE: updateStudent (Super Admin y Staff / Secretaría Nayeli)
// Permite actualizar todos los campos de un estudiante en la BD.
// ---------------------------------------------------------------
export async function updateStudent(
  userRole: Role,
  studentId: string,
  payload: Partial<Omit<DBStudent, "id" | "created_at" | "updated_at" | "families">>,
): Promise<DBStudent> {
  assertRole(userRole, ["super_admin", "staff"], "editar datos del alumno");
  return postgrestPatch<DBStudent>(
    "students",
    { id: `eq.${studentId}` },
    { ...payload, updated_at: new Date().toISOString() },
  );
}

// ---------------------------------------------------------------
// EDGE: deleteStudent (Exclusivo Super Admin / Dueña)
// Regla de Seguridad ADR 005: Nayeli no puede eliminar permanentemente.
// Solo la Dueña puede ejecutar la eliminación física directa en la BD.
// ---------------------------------------------------------------
export async function deleteStudent(
  userRole: Role,
  studentId: string,
): Promise<void> {
  assertRole(userRole, ["super_admin"], "eliminar permanentemente a un alumno");
  await postgrestRPC("delete_student_cascade", {
    p_student_id: studentId,
  });
}


