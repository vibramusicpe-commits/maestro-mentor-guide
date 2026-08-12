import { createFileRoute } from "@tanstack/react-router";
import { AgendaBoard } from "@/components/admin/agenda-board";

export const Route = createFileRoute("/admin/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda de Clases — Cadencia" },
      {
        name: "description",
        content:
          "Visualiza y reprograma clases semanales, gestiona franjas horarias y ocupación de salas.",
      },
      { property: "og:title", content: "Agenda de Clases — Cadencia" },
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
        <h1 className="text-2xl font-bold sm:text-3xl">Agenda de Clases</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rejilla semanal de horarios, ocupación de salas y gestión de conflictos.
        </p>
      </div>

      <AgendaBoard />
    </div>
  );
}
