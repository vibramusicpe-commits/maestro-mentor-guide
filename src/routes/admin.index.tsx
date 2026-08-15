import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MetricCards } from "@/components/admin/metric-cards";
import { DeletionRequestsPanel } from "@/components/admin/deletion-requests-panel";
import { RiskFamiliesTable } from "@/components/admin/risk-families-table";
import { AlertsPanel } from "@/components/admin/alerts-panel";
import { BirthdayWidget } from "@/components/admin/birthday-widget";
import { useAppStore } from "@/store/app-store";
import { getDailyGreeting } from "@/lib/greetings";
import { Settings, Sparkles, User, Check } from "lucide-react";
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

        {/* Botón de Configuración Personal */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCustomName(displayName);
            setIsSettingsOpen(true);
          }}
          className="gap-2 font-bold rounded-xl border-border hover:bg-muted"
        >
          <Settings className="h-4 w-4 text-primary" />
          Personalizar Perfil
        </Button>
      </div>

      <MetricCards />

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
              Personaliza cómo quieres que el sistema te salude y muestre tu nombre en la plataforma.
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
    </div>
  );
}
