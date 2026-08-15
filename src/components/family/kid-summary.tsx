import { motion } from "framer-motion";
import { CalendarClock, Clock, GraduationCap, Ticket, CheckCircle2 } from "lucide-react";
import type { Kid } from "@/store/app-store";
import { useAppStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { MinimalAgendaCalendar } from "@/components/agenda/minimal-agenda-calendar";

export function KidSummary({ kid }: { kid: Kid }) {
  return (
    <motion.section
      key={kid.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-sidebar p-5 text-sidebar-foreground shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{kid.name}</h1>
          <p className="text-sm text-sidebar-foreground/80 font-medium">{kid.instrument}</p>
        </div>
        <Badge variant="secondary" className="gap-1 text-xs font-semibold bg-sidebar-accent text-sidebar-foreground border border-sidebar-border">
          <Clock className="h-3 w-3 text-sidebar-primary" />
          {kid.id === "k1" ? "Plan Regular (8 clases / 45m)" : "Plan Intensivo (4 clases / 90m)"}
        </Badge>
      </div>

      {/* Seguimiento de Asistencia para los Padres */}
      <div className="mt-4 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-sidebar-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            Progreso de Asistencia del Mes
          </span>
          <span className="text-sidebar-foreground font-mono font-bold">
            {kid.id === "k1" ? "2 de 8 clases completadas" : "1 de 4 clases completadas"}
          </span>
        </div>

        {/* Barra de progreso de clases */}
        <div className="w-full bg-sidebar-border h-2 rounded-full overflow-hidden">
          <div
            className="bg-success h-full rounded-full transition-all"
            style={{ width: kid.id === "k1" ? "25%" : "25%" }}
          />
        </div>
        <p className="text-[11px] text-sidebar-foreground/75">
          {kid.id === "k1"
            ? "Clases asistidas: 2 · Faltantes: 6 (2 clases por semana)"
            : "Clases asistidas: 1 · Faltantes: 3 (1 clase por semana)"}
        </p>
      </div>

      <div className="mt-3 space-y-2 text-sm text-sidebar-foreground/80">
        <p className="inline-flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-sidebar-primary" /> {kid.teacher}
        </p>
        <p className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-sidebar-primary" /> {kid.nextLesson}
        </p>
        <p className="flex items-center gap-2 font-medium">
          <Ticket className="h-4 w-4 text-warning" />
          <span className="text-sidebar-foreground">{kid.makeupCredits} créditos de recuperación disponibles</span>
        </p>
      </div>

      <div className="mt-5 border-t border-sidebar-border pt-4">
        <MinimalAgendaCalendar
          lessons={useAppStore.getState().lessons}
          title={`Agenda Semanal de ${kid.name}`}
          subtitle={`Clases de ${kid.instrument}`}
          userType="family"
        />
      </div>
    </motion.section>
  );
}
