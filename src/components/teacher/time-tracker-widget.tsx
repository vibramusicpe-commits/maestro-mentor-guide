import { useState, useEffect } from "react";
import { Play, Pause, Square, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppStore } from "@/store/app-store";

export function TimeTrackerWidget() {
  const activeRole = useAppStore((s) => s.activeRole);
  const currentUser = useAppStore((s) => s.currentUser);

  const [shiftStatus, setShiftStatus] = useState<"fuera" | "trabajando" | "pausa">("fuera");
  const [seconds, setSeconds] = useState(0);

  // Timer activo durante la jornada
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (shiftStatus === "trabajando") {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
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
    toast.success("Entrada registrada a la sede", {
      description: `Hora de inicio: ${new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`,
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
    toast.success("Salida registrada correctamente", {
      description: `Tiempo total en sede: ${formatTimer(seconds)}`,
    });
    setShiftStatus("fuera");
    setSeconds(0);
  };

  return (
    <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-sidebar-primary flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Control Horario de Sede
          </p>
          <p className="text-xs text-sidebar-foreground/80 mt-0.5">
            {currentUser?.name ?? "Profesor"}
          </p>
        </div>

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            shiftStatus === "trabajando"
              ? "bg-success/15 text-success border-success/30"
              : shiftStatus === "pausa"
              ? "bg-warning/20 text-warning border-warning/40"
              : "bg-sidebar-border text-sidebar-foreground/60 border-sidebar-border"
          }`}
        >
          {shiftStatus === "trabajando" ? "● EN SEDE" : shiftStatus === "pausa" ? "PAUSA" : "FUERA DE SEDE"}
        </span>
      </div>

      {/* Reloj y Controles */}
      <div className="flex items-center justify-between pt-1">
        <div className="font-mono text-2xl font-bold tracking-tight text-sidebar-foreground">
          {formatTimer(seconds)}
        </div>

        <div className="flex items-center gap-1.5">
          {shiftStatus === "fuera" ? (
            <Button size="sm" onClick={handleClockIn} className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground font-bold">
              <Play className="h-4 w-4 fill-current" /> Marcar Entrada
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleBreak}
                className="gap-1 text-xs font-semibold"
              >
                <Pause className="h-3.5 w-3.5" /> {shiftStatus === "pausa" ? "Reanudar" : "Pausa"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleClockOut}
                className="gap-1 text-xs font-bold"
              >
                <Square className="h-3.5 w-3.5 fill-current" /> Marcar Salida
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
