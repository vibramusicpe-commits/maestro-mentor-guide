import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MetricCards } from "@/components/admin/metric-cards";
import { DeletionRequestsPanel } from "@/components/admin/deletion-requests-panel";
import { RiskFamiliesTable } from "@/components/admin/risk-families-table";
import { AlertsPanel } from "@/components/admin/alerts-panel";
import { BirthdayWidget } from "@/components/admin/birthday-widget";
import { TeacherAttendanceWidget } from "@/components/admin/teacher-attendance-widget";
import { StaffOnboardingTutorial } from "@/components/admin/staff-onboarding-tutorial";
import { useAppStore } from "@/store/app-store";
import { getDailyGreeting } from "@/lib/greetings";
import { Settings, Sparkles, User, Check, BookOpen, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — VM STAFF" },
      {
        name: "description",
        content:
          "Ingresos del mes, clases impartidas, asistencia, familias en mora y alertas operativas de tu academia.",
      },
      { property: "og:title", content: "Dashboard — VM STAFF" },
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
  const currentUser = useAppStore((s) => s.currentUser);
  const updateUserName = useAppStore((s) => s.updateUserName);
  const isStaff = activeRole === "staff";

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customName, setCustomName] = useState(currentUser?.name || (isStaff ? "Nayeli" : "Dirección (Dueña)"));
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [autoTutorialEnabled, setAutoTutorialEnabled] = useState(() => {
    try {
      return localStorage.getItem("vibra-onboarding-auto-open") !== "false";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      const autoEnabled = localStorage.getItem("vibra-onboarding-auto-open") !== "false";
      const completed = localStorage.getItem("vibra-onboarding-completed") === "true";
      if (autoEnabled && !completed) {
        setIsTutorialOpen(true);
      }
    } catch {}
  }, []);

  const greetingPhrase = getDailyGreeting();
  const displayName = currentUser?.name || (isStaff ? "Nayeli" : "Rocío");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    updateUserName(customName.trim());
    setIsSettingsOpen(false);
    toast.success("Perfil actualizado", {
      description: `Ahora te saludaremos como ${customName.trim()}.`,
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Cabecera con Nombre Personalizado, Frase del Día e Ícono de Configuración */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {isStaff ? "Secretaría · Vibra Music" : "Dirección General"}
            </span>
          </div>
          <h1 className="text-2xl font-black sm:text-3xl text-foreground">
            ¡Hola, {displayName}! 👋
          </h1>
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 pt-0.5">
            <Sparkles className="h-4 w-4 text-warning inline shrink-0" />
            <span className="italic">"{greetingPhrase}"</span>
          </p>
        </div>

        {/* Botones de Cabecera: Guía de Inducción y Configuración Personal */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTutorialOpen(true)}
            className="gap-1.5 font-bold rounded-xl border-primary/40 text-primary hover:bg-primary/10 shadow-xs"
          >
            <BookOpen className="h-4 w-4" />
            Guía de Inducción
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCustomName(displayName);
              setIsSettingsOpen(true);
            }}
            className="gap-2 font-bold rounded-xl border-border hover:bg-muted shadow-xs"
          >
            <Settings className="h-4 w-4 text-primary" />
            Personalizar Perfil
          </Button>
        </div>
      </div>

      <MetricCards />

      {/* Widget de Asistencia Docente y Monitoreo en Vivo */}
      <TeacherAttendanceWidget />

      {/* Panel de Solicitudes de Eliminación (Exclusivo Dirección y Secretaría) */}
      <DeletionRequestsPanel />

      {/* Grid Principal: Nayeli y Dueña ven la tabla de Familias en Riesgo / Morosidad */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RiskFamiliesTable />
          <BirthdayWidget />
        </div>
        <div>
          <AlertsPanel />
        </div>
      </div>

      {/* Modal de Personalización de Perfil */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <User className="h-5 w-5 text-primary" /> Configuración de tu Perfil
            </DialogTitle>
            <DialogDescription>
              Personaliza cómo quieres que el sistema te salude y administra la inducción para el equipo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            <div>
              <label htmlFor="user-display-name" className="block text-xs font-bold text-foreground mb-1.5">
                ¿Cómo te gustaría que te llamemos?
              </label>
              <Input
                id="user-display-name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Ej. Nayeli, Nayeli Solórzano, etc."
                className="text-sm font-medium"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Este cambio es visual para tu sesión y no afecta las configuraciones maestras del sistema.
              </p>
            </div>

            {/* Control de Tutorial Guiado para Secretaría (Ideal para TDAH / Nuevos Ingresos) */}
            <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 text-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="text-xl shrink-0">🎓</span>
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground block text-xs">
                    Tutorial de Inducción Paso a Paso
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Guía explicativa de 6 pasos: registro de alumnos, horarios pareados, asistencias (kiosco/kardex), cobros, invitaciones y asistencia docente.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-primary/20">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoTutorialEnabled}
                    onChange={(e) => {
                      setAutoTutorialEnabled(e.target.checked);
                      try {
                        localStorage.setItem("vibra-onboarding-auto-open", e.target.checked ? "true" : "false");
                      } catch {}
                      toast.info(e.target.checked ? "Tutorial activado para nuevas sesiones" : "Tutorial automático desactivado");
                    }}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span className="text-[11px] font-semibold text-foreground">
                    Activar inducción para el equipo
                  </span>
                </label>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsTutorialOpen(true);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs gap-1.5 rounded-xl shadow-xs"
                >
                  <BookOpen className="h-3.5 w-3.5" /> Iniciar Tutorial Guiado
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs space-y-1">
              <span className="font-bold text-foreground block">✨ Frases del día activadas:</span>
              <p className="text-muted-foreground">
                El sistema incluye más de 30 mensajes motivacionales que rotan automáticamente cada día para hacer más amena tu jornada.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsSettingsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="font-bold gap-1.5">
                <Check className="h-4 w-4" /> Guardar Nombre
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tutorial Interactivo Paso a Paso para Secretaría y Dirección */}
      <StaffOnboardingTutorial
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
}
