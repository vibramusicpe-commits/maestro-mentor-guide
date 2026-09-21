import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MinimalAgendaCalendar } from "@/components/agenda/minimal-agenda-calendar";
import { useAppStore } from "@/store/app-store";
import { isMatchingStudentName, findStudentProfileByName } from "@/lib/student-matching";

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
  const [adminSelectedTeacher, setAdminSelectedTeacher] = useState<string | null>(null);

  // Extraer nombre del profesor logueado de forma inteligente (por email o nombre)
  const teacherClean = useMemo(() => {
    if (adminSelectedTeacher) return adminSelectedTeacher.toLowerCase();
    const email = currentUser?.email?.toLowerCase() || "";
    if (email.includes("fernando")) return "fernando";
    if (email.includes("nathaly")) return "nathaly";
    if (email.includes("jeremy")) return "jeremy";
    const name = (currentUser?.name || "").toLowerCase().replace(/\s*\(.*?\)/, "").replace(/^prof\.\s*/i, "").trim();
    if (name.includes("fernando")) return "fernando";
    if (name.includes("nathaly")) return "nathaly";
    if (name.includes("jeremy")) return "jeremy";
    return "fernando";
  }, [currentUser, adminSelectedTeacher]);

  const teacherDisplayName = useMemo(() => {
    if (teacherClean === "fernando") return "Fernando";
    if (teacherClean === "nathaly") return "Nathaly";
    if (teacherClean === "jeremy") return "Jeremy";
    return currentUser?.name?.split(" ")[0] || "Fernando";
  }, [teacherClean, currentUser]);

  // Filtrar las clases reales de este profesor (únicamente de alumnos ACTIVOS)
  const teacherLessons = useMemo(() => {
    return schedule.filter((sch) => {
      if (sch.status === "cancelada") return false;

      // 🛡️ REGLA DE ORO (ADR 0095, 0098 & 0100): El profesor solo ve clases de alumnos con status === 'activo'
      const studentProfile = findStudentProfileByName(adminStudents, sch.student);
      if (!studentProfile || studentProfile.status !== "activo") {
        return false;
      }

      const isFernandoStudent = (teacherClean === "fernando") && (
        isMatchingStudentName("Camila Valentina Pastor Conco", sch.student) ||
        isMatchingStudentName("Emma Micaela Sevilla Perez", sch.student) ||
        isMatchingStudentName("Emma Sevilla", sch.student)
      );

      const schTeacher = (sch.teacher || "").toLowerCase().replace(/\s*\(.*?\)/, "").replace(/^prof\.\s*/i, "").trim();
      const profTeacher = (studentProfile.teacher || "").toLowerCase().replace(/\s*\(.*?\)/, "").replace(/^prof\.\s*/i, "").trim();
      return (
        isFernandoStudent ||
        schTeacher.includes(teacherClean) ||
        teacherClean.includes(schTeacher) ||
        profTeacher.includes(teacherClean) ||
        teacherClean.includes(profTeacher)
      );
    });
  }, [schedule, adminStudents, teacherClean]);

  return (
    <div className="space-y-4">
      {/* Selector de Profesor para Auditoría */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-card border border-border shadow-xs">
        {["Fernando", "Nathaly", "Jeremy"].map((t) => (
          <button
            key={t}
            onClick={() => setAdminSelectedTeacher(t)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              teacherDisplayName === t
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Prof. {t}
          </button>
        ))}
      </div>

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

