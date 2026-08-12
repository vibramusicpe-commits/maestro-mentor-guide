import { createFileRoute } from "@tanstack/react-router";
import { MetricCards } from "@/components/admin/metric-cards";
import { RiskFamiliesTable } from "@/components/admin/risk-families-table";
import { AlertsPanel } from "@/components/admin/alerts-panel";
import { RoleSwitcher } from "@/components/role-switcher";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard de dirección — Cadencia" },
      {
        name: "description",
        content:
          "Ingresos del mes, clases impartidas, asistencia, familias en mora y alertas operativas de tu academia.",
      },
      { property: "og:title", content: "Dashboard de dirección — Cadencia" },
      {
        property: "og:description",
        content: "Métricas, morosidad y alertas de la academia en una sola vista.",
      },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Buenas tardes, Rocío</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen operativo de agosto · actualizado hace 4 minutos
          </p>
        </div>
        <RoleSwitcher className="sm:hidden" />
      </div>

      <MetricCards />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RiskFamiliesTable />
        </div>
        <AlertsPanel />
      </div>
    </div>
  );
}
