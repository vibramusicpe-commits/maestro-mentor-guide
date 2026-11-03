import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart2, FileText, Sparkles, Inbox, Users2, NotebookPen } from "lucide-react";
import { InformesTrackerPanel } from "@/components/admin/informes-tracker-panel";
import { ProgressReportsPanel } from "@/components/admin/progress-reports-panel";
import { TeacherAdoptionPanel } from "@/components/admin/teacher-adoption-panel";
import { BitacoraHistory } from "@/components/informes/bitacora-history";

export const Route = createFileRoute("/admin/informes")({
  // Enlace cruzado desde Auditoría de Alumnos (ADR-0183): `?alumno=<nombre>`
  // preselecciona el filtro de búsqueda. Es solo un filtro de lectura, no altera datos.
  validateSearch: (search: Record<string, unknown>): { alumno?: string } => ({
    alumno: typeof search.alumno === "string" && search.alumno.trim() ? search.alumno.trim() : undefined,
  }),
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
  const { alumno } = Route.useSearch();
  const [activeTab, setActiveTab] = useState<"tracker" | "bandeja" | "adopcion" | "bitacora">("tracker");

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

        <button
          type="button"
          onClick={() => setActiveTab("adopcion")}
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
            activeTab === "adopcion"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Users2 className="h-3.5 w-3.5" />
          <span>Adopción Docente</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bitacora")}
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
            activeTab === "bitacora"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <NotebookPen className="h-3.5 w-3.5" />
          <span>Bitácora Diaria</span>
        </button>
      </div>

      {/* Vista activa */}
      {activeTab === "tracker" ? (
        <InformesTrackerPanel initialStudentName={alumno} />
      ) : activeTab === "adopcion" ? (
        <TeacherAdoptionPanel />
      ) : activeTab === "bitacora" ? (
        <BitacoraHistory
          title="Bitácora diaria de todos los docentes"
          subtitle="Lo que se trabajó en cada clase, día por día. Solo lectura."
          showTeacher
        />
      ) : (
        <ProgressReportsPanel />
      )}
    </div>
  );
}

