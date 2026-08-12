import { createFileRoute } from "@tanstack/react-router";
import { MetricCards } from "@/components/admin/metric-cards";
import { RiskFamiliesTable } from "@/components/admin/risk-families-table";
import { AlertsPanel } from "@/components/admin/alerts-panel";
import { BirthdayWidget } from "@/components/admin/birthday-widget";
import { RoleSwitcher } from "@/components/role-switcher";
import { useAppStore } from "@/store/app-store";

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
  const activeRole = useAppStore((s) => s.activeRole);
  const isStaff = activeRole === "staff";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {isStaff ? "Buenas tardes, Secretaría" : "Buenas tardes, Rocío"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen operativo de agosto · {isStaff ? "Vista operativa de Staff" : "Actualizado hace 4 minutos"}
          </p>
        </div>
        <RoleSwitcher className="sm:hidden" />
      </div>

      <MetricCards />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {!isStaff && <RiskFamiliesTable />}
          <BirthdayWidget />
        </div>
        <div>
          <AlertsPanel />
        </div>
      </div>
    </div>
  );
}
