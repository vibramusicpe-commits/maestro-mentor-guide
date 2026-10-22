import { useCallback, useMemo, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { resolveTeacherUserId } from "@/lib/services/teacher-resolver";
import {
  AUDIT_TEACHER_STORAGE_KEY,
  filterTeacherScheduleLessons,
  resolveTeacherClean,
  resolveTeacherDisplayName,
  resolveTeacherStudentList,
} from "@/lib/teacher-portal";

/**
 * Identidad del docente logueado (o del docente inspeccionado por Dirección).
 *
 * Es la misma resolución que vivía en `teacher.index.tsx`, extraída para que
 * el kiosco y la pestaña de notas compartan una única fuente y no dupliquen
 * el fallback por email/nombre ni la lectura de `sessionStorage`.
 */
export function useTeacherIdentity() {
  const schedule = useAppStore((s) => s.schedule);
  const adminStudents = useAppStore((s) => s.adminStudents);
  const currentUser = useAppStore((s) => s.currentUser);
  const activeRole = useAppStore((s) => s.activeRole);

  const [adminSelectedTeacher, setAdminSelectedTeacher] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(AUDIT_TEACHER_STORAGE_KEY);
  });

  const selectTeacher = useCallback((teacher: string) => {
    setAdminSelectedTeacher(teacher);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(AUDIT_TEACHER_STORAGE_KEY, teacher);
    }
  }, []);

  const teacherClean = useMemo(
    () => resolveTeacherClean(currentUser, adminSelectedTeacher),
    [currentUser, adminSelectedTeacher],
  );

  const teacherDisplayName = useMemo(
    () => resolveTeacherDisplayName(teacherClean, currentUser),
    [teacherClean, currentUser],
  );

  // Resolución de la cuenta docente a partir del nombre visible (mismo criterio del kiosco).
  const teacherId = useMemo(
    () => resolveTeacherUserId(undefined, teacherDisplayName),
    [teacherDisplayName],
  );

  const isDirector =
    activeRole === "super_admin" || activeRole === "staff" || activeRole === "admin";

  const teacherScheduleLessons = useMemo(
    () => filterTeacherScheduleLessons({ schedule, adminStudents, teacherClean }),
    [schedule, adminStudents, teacherClean],
  );

  const teacherStudentList = useMemo(
    () =>
      resolveTeacherStudentList({
        adminStudents,
        teacherScheduleLessons,
        teacherClean,
      }),
    [adminStudents, teacherScheduleLessons, teacherClean],
  );

  return {
    currentUser,
    adminStudents,
    schedule,
    adminSelectedTeacher,
    selectTeacher,
    teacherClean,
    teacherDisplayName,
    teacherId,
    isDirector,
    teacherScheduleLessons,
    teacherStudentList,
  };
}
