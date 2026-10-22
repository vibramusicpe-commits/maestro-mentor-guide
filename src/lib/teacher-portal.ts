import type { AdminStudent, ScheduledLesson } from "@/store/app-store";
import { findStudentProfileByName, isMatchingStudentName } from "@/lib/student-matching";

/**
 * Helpers puros del portal docente (kiosco, agenda de clase y notas).
 *
 * Nacen de extraer, sin cambiar comportamiento, la resolución de identidad y
 * los filtros que ya vivían dentro de `teacher.index.tsx`. Se comparten para
 * que `/teacher` y `/teacher/notas` muestren exactamente los mismos alumnos
 * sin duplicar la lógica (ADR-0119.3).
 */

export interface TeacherUserLike {
  email?: string | null;
  name?: string | null;
}

/** "Prof. Fernando (Violín)" → "fernando" */
export function cleanTeacherToken(value?: string | null): string {
  return (value || "")
    .toLowerCase()
    .replace(/\s*\(.*?\)/, "")
    .replace(/^prof\.\s*/i, "")
    .trim();
}

/**
 * Identidad docente del portal: la selección de auditoría (Dirección) manda;
 * si no, se resuelve por email y luego por nombre; los admin caen en Fernando
 * para soporte, tal como hacía el kiosco.
 */
export function resolveTeacherClean(
  currentUser?: TeacherUserLike | null,
  adminSelectedTeacher?: string | null,
): string {
  if (adminSelectedTeacher) return adminSelectedTeacher.toLowerCase();

  const email = currentUser?.email?.toLowerCase() || "";
  if (email.includes("fernando")) return "fernando";
  if (email.includes("nathaly")) return "nathaly";
  if (email.includes("jeremy")) return "jeremy";

  const name = cleanTeacherToken(currentUser?.name);
  if (name.includes("fernando")) return "fernando";
  if (name.includes("nathaly")) return "nathaly";
  if (name.includes("jeremy")) return "jeremy";

  return "fernando";
}

export function resolveTeacherDisplayName(
  teacherClean: string,
  currentUser?: TeacherUserLike | null,
): string {
  if (teacherClean === "fernando") return "Fernando";
  if (teacherClean === "nathaly") return "Nathaly";
  if (teacherClean === "jeremy") return "Jeremy";
  return currentUser?.name?.split(" ")[0] || "Fernando";
}

/**
 * Clases del docente desde el horario central, solo de alumnos ACTIVOS
 * (ADR-0098/0100). Conserva la excepción histórica de Camila/Emma con
 * Fernando que ya existía en el kiosco.
 */
export function filterTeacherScheduleLessons(params: {
  schedule: ScheduledLesson[];
  adminStudents: AdminStudent[];
  teacherClean: string;
}): ScheduledLesson[] {
  const { schedule, adminStudents, teacherClean } = params;

  return schedule.filter((sch) => {
    if (sch.status === "cancelada") return false;

    const studentProfile = findStudentProfileByName(adminStudents, sch.student);
    if (!studentProfile || studentProfile.status !== "activo") return false;

    const isFernandoStudent =
      teacherClean === "fernando" &&
      (isMatchingStudentName("Camila Valentina Pastor Conco", sch.student) ||
        isMatchingStudentName("Emma Micaela Sevilla Perez", sch.student) ||
        isMatchingStudentName("Emma Sevilla", sch.student));

    const schTeacher = cleanTeacherToken(sch.teacher);
    const profTeacher = cleanTeacherToken(studentProfile.teacher);

    return (
      isFernandoStudent ||
      schTeacher.includes(teacherClean) ||
      teacherClean.includes(schTeacher) ||
      profTeacher.includes(teacherClean) ||
      teacherClean.includes(profTeacher)
    );
  });
}

/**
 * Alumnos activos del docente: aparece si tiene una clase en su horario o si
 * su ficha lo tiene asignado. Deduplica por id.
 */
export function resolveTeacherStudentList(params: {
  adminStudents: AdminStudent[];
  teacherScheduleLessons: ScheduledLesson[];
  teacherClean: string;
}): AdminStudent[] {
  const { adminStudents, teacherScheduleLessons, teacherClean } = params;

  const activeStudents = adminStudents.filter((student) => student.status === "activo");
  const scheduledNames = new Set(
    teacherScheduleLessons.map((lesson) => lesson.student.toLowerCase().trim()),
  );
  const seen = new Set<string>();

  return activeStudents.filter((student) => {
    if (seen.has(student.id)) return false;

    const studentTeacher = cleanTeacherToken(student.teacher);
    const matches =
      scheduledNames.has(student.name.toLowerCase().trim()) ||
      Boolean(studentTeacher && studentTeacher.includes(teacherClean)) ||
      Boolean(studentTeacher && teacherClean.includes(studentTeacher));

    if (matches) seen.add(student.id);
    return matches;
  });
}

export const AUDIT_TEACHER_STORAGE_KEY = "vibra_audit_teacher";
