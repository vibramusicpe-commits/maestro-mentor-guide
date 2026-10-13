import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { MinimalAgendaCalendar } from "@/components/agenda/minimal-agenda-calendar";
import { useAppStore } from "@/store/app-store";
import { isMatchingStudentName } from "@/lib/student-matching";

export const Route = createFileRoute("/family/agenda")({
  head: () => ({
    meta: [
      { title: "Horarios de Clase — Portal de Familia" },
      {
        name: "description",
        content: "Agenda semanal de clases de tus hijos en solo lectura.",
      },
    ],
  }),
  component: FamilyAgendaPage,
});

function FamilyAgendaPage() {
  const schedule = useAppStore((s) => s.schedule);
  const kids = useAppStore((s) => s.kids);
  const activeKidId = useAppStore((s) => s.activeKidId);
  const activeKid = kids.find((k) => k.id === activeKidId) ?? kids[0];

  // Clases reales del hijo desde PostgreSQL (huerfanas de seeds, ADR-0172)
  const lessons = useMemo(() => {
    if (!activeKid) return [];
    return schedule.filter(
      (l) => l.status !== "cancelada" && isMatchingStudentName(l.student, activeKid.name)
    );
  }, [schedule, activeKid]);

  return (
    <div className="space-y-4">
      <MinimalAgendaCalendar
        lessons={lessons}
        title={`Agenda de ${activeKid?.name ?? "Alumno"}`}
        subtitle={`Horario semanal de ${activeKid?.instrument ?? "Música"}`}
        userType="family"
      />
    </div>
  );
}
