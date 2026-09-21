import { createFileRoute } from "@tanstack/react-router";
import { AgendaBoard } from "@/components/admin/agenda-board";
import { VacancyAvailabilityPanel } from "@/components/admin/vacancy-availability-panel";

import { useInsforgeSync } from "@/hooks/use-insforge-sync";
import { RotateCw } from "lucide-react";

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
  const { syncNow, isSyncing } = useInsforgeSync();

  return (
    <div className="w-full max-w-full space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Horario de Clases</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Vista didáctica pareada, ocupación de salas A a D y explorador de vacantes en tiempo real.
          </p>
        </div>

        <button
          onClick={() => syncNow()}
          disabled={isSyncing}
          title="Rehidratar y sincronizar horario con PostgreSQL"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-xs disabled:opacity-50"
        >
          <RotateCw className={`h-4 w-4 ${isSyncing ? "animate-spin text-primary" : ""}`} />
          <span>{isSyncing ? "Sincronizando con PostgreSQL..." : "Sincronizar con PostgreSQL"}</span>
        </button>
      </div>

      <AgendaBoard />

      {/* Explorador de Vacantes y Disponibilidad por Horario */}
      <VacancyAvailabilityPanel />
    </div>
  );
}
