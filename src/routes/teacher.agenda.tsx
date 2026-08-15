import { createFileRoute } from "@tanstack/react-router";
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
  const lessons = useAppStore((s) => s.lessons);

  return (
    <div className="space-y-4">
      <MinimalAgendaCalendar
        lessons={lessons}
        title="Mi Horario Semanal"
        subtitle="Clases asignadas y salas"
        userType="teacher"
      />
    </div>
  );
}
