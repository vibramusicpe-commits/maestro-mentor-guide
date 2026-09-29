import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, ShieldCheck, DoorOpen, Clock, Sparkles, RotateCw } from "lucide-react";
import { StudentsTable } from "@/components/admin/students-table";
import { StudentRenewalsRetentionPanel } from "@/components/admin/student-renewals-retention-panel";
import { VacancyAvailabilityPanel } from "@/components/admin/vacancy-availability-panel";
import { TeacherNotesModeration } from "@/components/admin/teacher-notes-moderation";
import { StudentCleanupPanel } from "@/components/admin/student-cleanup-panel";
import { useAppStore } from "@/store/app-store";
import { computeStudentCycleSessions, computeStudentRetentionStatus } from "@/lib/kardex-calculator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  const [activeTab, setActiveTab] = useState<"directorio" | "renovaciones" | "notas" | "vacantes">("directorio");
  const [mounted, setMounted] = useState(false);
  const [isCleanupOpen, setIsCleanupOpen] = useState(false);
  const teacherNotes = useAppStore((s) => s.teacherNotes);
  const pendingCount = teacherNotes.filter((n) => n.status === "pendiente").length;
  const students = useAppStore((s) => s.adminStudents);
  const schedule = useAppStore((s) => s.schedule);

  // Cantidad de alumnos que requieren atención (amarillos: por culminar + rojos: culminados)
  const attentionCount = useMemo(() => {
    return students
      .filter((st) => st.status === "activo")
      .reduce((acc, st) => {
        const modalityStr = (st.modality || "").toLowerCase();
        const isIntensive = modalityStr.includes("inten") || modalityStr.includes("90 min");
        const targetQuota = isIntensive ? 4 : (st.packageTotalSessions || 8);
        const sessions = computeStudentCycleSessions({
          student: st,
          allSchedule: schedule,
        });
        const ret = computeStudentRetentionStatus(st, sessions, targetQuota);
        if (ret.category === "proximo_culminar" || ret.category === "culminado") {
          return acc + 1;
        }
        return acc;
      }, 0);
  }, [students, schedule]);

  useEffect(() => {
    setMounted(true);
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        if (tab === "notas" || tab === "vacantes" || tab === "directorio" || tab === "renovaciones") {
          setActiveTab(tab);
        }
      }
    } catch {}
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

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Botón Depuración & Reactivación 2026 */}
          <Button
            variant="outline"
            onClick={() => setIsCleanupOpen(true)}
            className="h-8 gap-1.5 rounded-xl border-[#F47B20]/40 bg-[#F47B20]/10 text-[#F47B20] hover:bg-[#F47B20]/20 text-xs font-bold shadow-xs transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Depuración & Reactivación 2026
          </Button>

          {/* Navegación por pestañas */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border">
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
              onClick={() => setActiveTab("renovaciones")}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === "renovaciones"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <RotateCw className="h-3.5 w-3.5 text-[#F47B20]" />
              <span>Seguimiento & Renovación</span>
              {mounted && attentionCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 text-[10px] px-1.5 py-0 h-4 font-black bg-[#F47B20] text-black animate-pulse"
                >
                  {attentionCount}
                </Badge>
              )}
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
      </div>

      {activeTab === "directorio" && <StudentsTable />}

      {activeTab === "renovaciones" && <StudentRenewalsRetentionPanel />}

      {activeTab === "notas" && <TeacherNotesModeration />}

      {activeTab === "vacantes" && <VacancyAvailabilityPanel />}

      {/* Modal de Depuración y Activación 1 a 1 */}
      <StudentCleanupPanel isOpen={isCleanupOpen} onClose={() => setIsCleanupOpen(false)} />
    </div>
  );
}
