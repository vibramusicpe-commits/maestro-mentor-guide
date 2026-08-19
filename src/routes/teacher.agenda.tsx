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
  const allLessons = useAppStore((s) => s.lessons);
  const currentUser = useAppStore((s) => s.currentUser);

  // Extraer nombre del profesor logueado (ej. "Jeremy (Guitarra y Batería)" -> "jeremy")
  const teacherRawName = currentUser?.name ?? "Jeremy";
  const teacherClean = teacherRawName.toLowerCase().replace(/\s*\(.*?\)/, "").replace(/^prof\.\s*/i, "").trim();

  // Filtrar las clases reales de este profesor
  const teacherLessons = useMemo(() => {
    const matched = schedule.filter((sch) => {
      if (sch.status === "cancelada") return false;
      const schTeacher = sch.teacher.toLowerCase().replace(/\s*\(.*?\)/, "").replace(/^prof\.\s*/i, "").trim();
      return (
        schTeacher.includes(teacherClean) ||
        teacherClean.includes(schTeacher) ||
        sch.teacher.toLowerCase().includes(teacherClean)
      );
    });

    if (matched.length > 0) return matched;

    // Fallback a schedule completo si es admin probando
    return schedule;
  }, [schedule, teacherClean]);

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

