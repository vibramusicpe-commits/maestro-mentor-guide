import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Siren, Stethoscope, CalendarClock } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { resolveFamilyScope, SCHOOL_WHATSAPP_NUMBER } from "@/lib/laya/laya-family-scope";

export const Route = createFileRoute("/family/avisos")({
  head: () => ({
    meta: [
      { title: "Avisar a Secretaría — Portal de Familia" },
      {
        name: "description",
        content: "Canal urgente de mensajes a secretaría por WhatsApp.",
      },
    ],
  }),
  component: FamilyAvisosPage,
});

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function FamilyAvisosPage() {
  const adminStudents = useAppStore((s) => s.adminStudents);
  const currentUser = useAppStore((s) => s.currentUser);

  const scope = useMemo(
    () =>
      resolveFamilyScope({
        inviteFamilyId: currentUser?.familyId ?? null,
        userEmail: currentUser?.email ?? null,
        adminStudents,
      }),
    [currentUser?.familyId, currentUser?.email, adminStudents]
  );

  const kidName = scope.students[0]?.name || "mi hijo/a";
  const instrument = scope.students[0]?.instrument || "";

  const openWa = (kind: "falta" | "emergencia" | "cambio") => {
    const base =
      kind === "falta"
        ? `Hola Secretaría, les aviso que ${kidName} (${instrument}) NO podrá asistir a su clase de hoy ${todayStr()} por motivos de salud. Quedo atento/a a la recuperación.`
        : kind === "emergencia"
          ? `🚨 URGENTE — Hola Secretaría, soy apoderado de ${kidName} (${instrument}). Tuvimos una emergencia/accidente y necesito coordinar con ustedes hoy ${todayStr()}.`
          : `Hola Secretaría, soy apoderado de ${kidName} (${instrument}). Necesito coordinar un cambio de horario. ¿Qué turnos tienen disponibles?`;
    window.open(`https://wa.me/${SCHOOL_WHATSAPP_NUMBER}?text=${encodeURIComponent(base)}`, "_blank");
  };

  if (!scope.resolved) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-2">
        <p className="text-sm font-bold text-foreground">Sin alumnos vinculados</p>
        <p className="text-xs text-muted-foreground">
          Secretaría te asignará en breve la ficha de tu hijo/a.
        </p>
      </div>
    );
  }

  const btn =
    "w-full min-h-[56px] flex items-center gap-3 px-4 rounded-2xl border font-bold text-sm transition-all active:scale-[0.99] cursor-pointer";

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground px-1">
        Avisos directos a Secretaría por WhatsApp (atiende de 1:00 pm a 8:00 pm).
      </p>
      <button onClick={() => openWa("falta")} className={`${btn} border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200`}>
        <Stethoscope className="h-6 w-6 shrink-0" />
        <span className="text-left">Falta hoy por salud<span className="block text-[11px] font-medium opacity-80">Avisa la inasistencia y coordina recuperación</span></span>
      </button>
      <button onClick={() => openWa("emergencia")} className={`${btn} border-destructive/40 bg-destructive/10 text-destructive`}>
        <Siren className="h-6 w-6 shrink-0" />
        <span className="text-left">Emergencia / accidente<span className="block text-[11px] font-medium opacity-80">Contacto urgente con secretaría</span></span>
      </button>
      <button onClick={() => openWa("cambio")} className={`${btn} border-border bg-card text-foreground`}>
        <CalendarClock className="h-6 w-6 shrink-0 text-primary" />
        <span className="text-left">Pedir cambio de horario<span className="block text-[11px] font-medium opacity-80">Consulta turnos disponibles</span></span>
      </button>
    </div>
  );
}
