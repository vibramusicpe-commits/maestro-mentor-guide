import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, ShieldCheck, DoorOpen, Clock } from "lucide-react";
import { StudentsTable } from "@/components/admin/students-table";
import { VacancyAvailabilityPanel } from "@/components/admin/vacancy-availability-panel";
import { TeacherNotesModeration } from "@/components/admin/teacher-notes-moderation";
import { useAppStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/alumnos")({
  head: () => ({
    meta: [
      { title: "Directorio de Alumnos & Notas — VM STAFF" },
      {
        name: "description",
        content:
          "Directorio de alumnos, moderación de notas docentes para padres, asignación de profesores y disponibilidad de vacantes.",
      },
      { property: "og:title", content: "Directorio de Alumnos & Notas — VM STAFF" },
      {
        property: "og:description",
        content: "Administración integral de alumnos, familias y seguimiento académico con filtro de notas.",
      },
    ],
  }),
  component: AdminAlumnosPage,
});

function AdminAlumnosPage() {
  const [activeTab, setActiveTab] = useState<"directorio" | "notas" | "vacantes">("directorio");
  const [mounted, setMounted] = useState(false);
  const teacherNotes = useAppStore((s) => s.teacherNotes);
  const pendingCount = teacherNotes.filter((n) => n.status === "pendiente").length;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl text-foreground">Gestión Académica & Alumnos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Directorio de fichas, moderación institucional de notas pedagógicas y control de vacantes.
          </p>
        </div>

        {/* Navegación por pestañas */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("directorio")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === "directorio"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            <span>Alumnos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notas")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === "notas"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
            <span>Notas a Familias</span>
            {mounted && pendingCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 text-[10px] px-1.5 py-0 h-4 font-black bg-amber-500 text-black animate-pulse"
              >
                {pendingCount}
              </Badge>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vacantes")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === "vacantes"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <DoorOpen className="h-3.5 w-3.5 text-emerald-500" />
            <span>Vacantes</span>
          </button>
        </div>
      </div>

      {activeTab === "directorio" && (
        <div className="space-y-6">
          <StudentsTable />
          <VacancyAvailabilityPanel />
        </div>
      )}

      {activeTab === "notas" && <TeacherNotesModeration />}

      {activeTab === "vacantes" && <VacancyAvailabilityPanel />}
    </div>
  );
}
