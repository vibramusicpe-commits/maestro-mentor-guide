import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { MinimalAgendaCalendar } from "@/components/agenda/minimal-agenda-calendar";
import { useAppStore } from "@/store/app-store";

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

  // Extraer nombre del profesor logueado (ej. "Jeremy (Guitarra y Batería)" -> "jeremy")
  const teacherRawName = currentUser?.name ?? "Jeremy";
  const teacherClean = teacherRawName.toLowerCase().replace(/\s*\(.*?\)/, "").replace(/^prof\.\s*/i, "").trim();

  // Filtrar las clases reales de este profesor (únicamente de alumnos ACTIVOS)
  const teacherLessons = useMemo(() => {
    return schedule.filter((sch) => {
      if (sch.status === "cancelada") return false;

      // 🛡️ REGLA DE ORO (ADR 0095 & 0098): El profesor solo ve clases de alumnos con status === 'activo'
      const normL = sch.student.toLowerCase().trim();
      const studentProfile = adminStudents.find((st) => {
        const normSt = st.name.toLowerCase().trim();
        return normSt === normL || normSt.includes(normL) || normL.includes(normSt);
      });
      if (studentProfile && studentProfile.status !== "activo") {
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
        title={`Mi Horario Semanal (${teacherRawName.split(" ")[0]})`}
        subtitle="Clases asignadas y salas de la sede"
        userType="teacher"
      />
    </div>
  );
}

