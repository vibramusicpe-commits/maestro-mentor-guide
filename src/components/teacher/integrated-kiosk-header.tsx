import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, Pause, Square, ShieldCheck, MapPin, UserCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppStore } from "@/store/app-store";

interface IntegratedTeacherKioskHeaderProps {
  totalDayStudents?: number;
}

export function IntegratedTeacherKioskHeader({ totalDayStudents = 0 }: IntegratedTeacherKioskHeaderProps) {
  const currentUser = useAppStore((s) => s.currentUser);

  const [shiftStatus, setShiftStatus] = useState<"fuera" | "trabajando" | "pausa">("fuera");
  const [seconds, setSeconds] = useState(0);

  // Timer activo durante el turno
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (shiftStatus === "trabajando") {
      timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [shiftStatus]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClockIn = () => {
    setShiftStatus("trabajando");
    toast.success("Turno iniciado en sede", {
      description: `Ingreso: ${new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`,
    });
  };

  const handleToggleBreak = () => {
    if (shiftStatus === "trabajando") {
      setShiftStatus("pausa");
      toast.info("Jornada en pausa");
    } else {
      setShiftStatus("trabajando");
      toast.success("Reanudando jornada");
    }
  };

  const handleClockOut = () => {
    toast.success("Turno finalizado", {
      description: `Tiempo total en sede: ${formatTimer(seconds)}`,
    });
    setShiftStatus("fuera");
    setSeconds(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-sidebar-border bg-sidebar p-4 text-sidebar-foreground shadow-lg space-y-3"
    >
      {/* 1. FICHAJE Y RELOJ DE SEDE (TOP BAR) */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sidebar-primary flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Fichaje de Sede
          </p>
          <p className="text-xs text-sidebar-foreground font-bold mt-0.5">
            {currentUser?.name ?? "Profesor/a Vibra"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="font-mono text-base font-black tracking-tight text-sidebar-foreground bg-sidebar-accent px-2.5 py-1 rounded-xl border border-sidebar-border">
            {formatTimer(seconds)}
          </div>

          {shiftStatus === "fuera" ? (
            <Button
              size="sm"
              onClick={handleClockIn}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-8 shadow-xs"
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Fichar Entrada
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleBreak}
                className="h-8 px-2 text-[11px] font-bold rounded-xl border-sidebar-border text-sidebar-foreground"
              >
                <Pause className="h-3 w-3" /> {shiftStatus === "pausa" ? "Reanudar" : "Pausa"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleClockOut}
                className="h-8 px-2 text-[11px] font-bold rounded-xl"
              >
                <Square className="h-3 w-3 fill-current" /> Salir
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 2. BARRA DE ESTADO DE LA JORNADA */}
      <div className="flex items-center justify-between pt-2 border-t border-sidebar-border/50 text-[11px] text-sidebar-foreground/80">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-sidebar-primary" /> Sede Miraflores
        </span>
        <span className="font-medium">
          {shiftStatus === "trabajando" ? (
            <strong className="text-emerald-400">● En Jornada Activa</strong>
          ) : shiftStatus === "pausa" ? (
            <strong className="text-amber-400">● En Pausa</strong>
          ) : (
            <span className="text-muted-foreground">● Fuera de Turno</span>
          )}
        </span>
      </div>
    </motion.div>
  );
}

