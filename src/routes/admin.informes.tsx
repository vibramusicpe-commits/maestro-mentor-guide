import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart2, FileText, Sparkles, Inbox } from "lucide-react";
import { InformesTrackerPanel } from "@/components/admin/informes-tracker-panel";
import { ProgressReportsPanel } from "@/components/admin/progress-reports-panel";

export const Route = createFileRoute("/admin/informes")({
  head: () => ({
    meta: [
      { title: "Seguimiento de Informes — VM STAFF" },
      {
        name: "description",
        content:
          "Dashboard de seguimiento operativo de evaluaciones de clase e informes de progreso para Dirección y Coordinación Pedagógica.",
      },
      { property: "og:title", content: "Seguimiento de Informes — VM STAFF" },
      {
        property: "og:description",
        content:
          "Vista de control de cobertura de evaluaciones por alumno activo y bandeja de emisión de informes.",
      },
    ],
  }),
  component: AdminInformesPage,
});

function AdminInformesPage() {
  const [activeTab, setActiveTab] = useState<"tracker" | "bandeja">("tracker");

  return (
    <div className="space-y-4">
      {/* Selector de pestañas */}
      <div className="flex items-center gap-1.5 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("tracker")}
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
            activeTab === "tracker"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <FileBarChart2 className="h-3.5 w-3.5" />
          <span>Seguimiento de Alumnos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bandeja")}
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
            activeTab === "bandeja"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Inbox className="h-3.5 w-3.5" />
          <span>Bandeja General de Informes</span>
        </button>
      </div>

      {/* Vista activa */}
      {activeTab === "tracker" ? <InformesTrackerPanel /> : <ProgressReportsPanel />}
    </div>
  );
}
