import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { MinimalAgendaCalendar } from "@/components/agenda/minimal-agenda-calendar";
import { useAppStore } from "@/store/app-store";
import { isMatchingStudentName } from "@/lib/student-matching";

export const Route = createFileRoute("/teacher/agenda")({
  head: () => ({
    meta: [
      { title: "Mi Agenda — Kiosco de Profesor" },
      {
        name: "description",
        content: "Consulta tus clases programadas de la semana en modo solo lectura.",
      },
    ],
  }),
  component: TeacherAgendaPage,
});

function TeacherAgendaPage() {
  const schedule = useAppStore((s) => s.schedule);
  const adminStudents = useAppStore((s) => s.adminStudents);
  const currentUser = useAppStore((s) => s.currentUser);

  // Extraer nombre del profesor logueado de forma inteligente (por email o nombre)
  const teacherClean = useMemo(() => {
    const email = currentUser?.email?.toLowerCase() || "";
    if (email.includes("jeremy")) return "jeremy";
    if (email.includes("fernando")) return "fernando";
    if (email.includes("nathaly")) return "nathaly";
    const name = (currentUser?.name || "").toLowerCase().replace(/\s*\(.*?\)/, "").replace(/^prof\.\s*/i, "").trim();
    if (name.includes("jeremy")) return "jeremy";
    if (name.includes("fernando")) return "fernando";
    if (name.includes("nathaly")) return "nathaly";
    return name || "jeremy";
  }, [currentUser]);

  const teacherDisplayName = useMemo(() => {
    if (teacherClean === "jeremy") return "Jeremy";
    if (teacherClean === "fernando") return "Fernando";
    if (teacherClean === "nathaly") return "Nathaly";
    return currentUser?.name?.split(" ")[0] || "Profesor";
  }, [teacherClean, currentUser]);

  // Filtrar las clases reales de este profesor (únicamente de alumnos ACTIVOS)
  const teacherLessons = useMemo(() => {
    return schedule.filter((sch) => {
      if (sch.status === "cancelada") return false;

      // 🛡️ REGLA DE ORO (ADR 0095, 0098 & 0100): El profesor solo ve clases de alumnos con status === 'activo'
      const studentProfile = adminStudents.find(
        (st) => isMatchingStudentName(st.name, sch.student) || st.name.toLowerCase().trim() === sch.student.toLowerCase().trim()
      );
      if (!studentProfile || studentProfile.status !== "activo") {
        return false;
      }

      const schTeacher = sch.teacher.toLowerCase().replace(/\s*\(.*?\)/, "").replace(/^prof\.\s*/i, "").trim();
      return (
        schTeacher.includes(teacherClean) ||
        teacherClean.includes(schTeacher) ||
        sch.teacher.toLowerCase().includes(teacherClean)
      );
    });
  }, [schedule, adminStudents, teacherClean]);

  return (
    <div className="space-y-4">
      <MinimalAgendaCalendar
        lessons={teacherLessons}
        title={`Mi Horario Semanal (${teacherDisplayName})`}
        subtitle="Clases asignadas y salas de la sede"
        userType="teacher"
        defaultYear={2026}
        defaultMonth={8}
      />
    </div>
  );
}

