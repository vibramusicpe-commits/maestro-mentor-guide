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
    <div className="w-full max-w-full space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Horario de Clases</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Vista didáctica pareada, ocupación de salas A a D y explorador de vacantes en tiempo real.
          </p>
        </div>
      </div>

      <AgendaBoard />

      {/* Explorador de Vacantes y Disponibilidad por Horario */}
      <VacancyAvailabilityPanel />
    </div>
  );
}
