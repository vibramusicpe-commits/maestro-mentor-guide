import { createFileRoute } from "@tanstack/react-router";
import { AgendaBoard } from "@/components/admin/agenda-board";
import { VacancyAvailabilityPanel } from "@/components/admin/vacancy-availability-panel";

export const Route = createFileRoute("/admin/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda de Clases — VM STAFF" },
      {
        name: "description",
        content:
          "Visualiza y reprograma clases semanales, gestiona franjas horarias y ocupación de salas.",
      },
      { property: "og:title", content: "Agenda de Clases — VM STAFF" },
      {
        property: "og:description",
        content: "Gestión semanal de horarios, profesores y salas en la academia.",
      },
    ],
  }),
  component: AdminAgendaPage,
});

function AdminAgendaPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Horario de Clases</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visualización por día, rejilla semanal o formato Excel, ocupación de salas y explorador de vacantes en tiempo real.
        </p>
      </div>

      <AgendaBoard />

      {/* Explorador de Vacantes y Disponibilidad por Horario */}
      <VacancyAvailabilityPanel />
    </div>
  );
}
