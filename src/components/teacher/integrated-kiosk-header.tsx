import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, Pause, Square, ShieldCheck, MapPin, UserCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppStore } from "@/store/app-store";
import {
  clockIn,
  toggleBreak,
  clockOut,
  getActiveShift,
  resolveTeacherUserId,
} from "@/lib/services/time-tracking.service";

interface IntegratedTeacherKioskHeaderProps {
  totalDayStudents?: number;
}

export function IntegratedTeacherKioskHeader({ totalDayStudents = 0 }: IntegratedTeacherKioskHeaderProps) {
  const currentUser = useAppStore((s) => s.currentUser);
  const activeRole = useAppStore((s) => s.activeRole) || "teacher";

  const [shiftStatus, setShiftStatus] = useState<"fuera" | "trabajando" | "pausa">("fuera");
  const [seconds, setSeconds] = useState(0);
  const [currentShiftId, setCurrentShiftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Restaurar turno activo al cargar desde PostgreSQL / Insforge
  useEffect(() => {
    async function restoreShift() {
      const teacherName = currentUser?.name ?? "Profesor/a Vibra";
      const teacherEmail = currentUser?.email ?? "";
      const teacherUserId = resolveTeacherUserId(teacherEmail, teacherName);

      try {
        const active = await getActiveShift(teacherUserId, teacherName);
        if (active && active.status !== "finalizado") {
          setCurrentShiftId(active.id);
          setShiftStatus(active.status);

          // Calcular segundos reales transcurridos desde clock_in
          const startTime = new Date(active.clock_in).getTime();
          const now = Date.now();
          const elapsedSec = Math.max(0, Math.floor((now - startTime) / 1000) - (active.break_minutes || 0) * 60);
          setSeconds(elapsedSec);
        }
      } catch (err) {
        console.warn("Aviso al verificar turno activo del profesor:", err);
      }
    }

    restoreShift();
  }, [currentUser]);

  // 2. Timer activo durante el turno
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

  const handleClockIn = async () => {
    const teacherName = currentUser?.name ?? "Profesor/a Vibra";
    const teacherEmail = currentUser?.email ?? "";
    const teacherUserId = resolveTeacherUserId(teacherEmail, teacherName);

    setLoading(true);
    try {
      const shift = await clockIn(activeRole, teacherUserId, teacherName);
      setCurrentShiftId(shift.id);
      setShiftStatus("trabajando");
      setSeconds(0);
      toast.success("Turno iniciado en sede (Conectado en Vivo)", {
        description: `Ingreso: ${new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })} — Ya visible para secretaría y dirección.`,
      });
    } catch (err: any) {
      toast.error("Error al registrar entrada: " + (err.message || "Intenta nuevamente"));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBreak = async () => {
    if (!currentShiftId) return;
    setLoading(true);
    try {
      const updated = await toggleBreak(activeRole, currentShiftId, shiftStatus);
      setShiftStatus(updated.status);
      if (updated.status === "pausa") {
        toast.info("Jornada en pausa (Registrado en Insforge)");
      } else {
        toast.success("Reanudando jornada (Registrado en Insforge)");
      }
    } catch (err: any) {
      toast.error("Error al cambiar estado: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!currentShiftId) {
      setShiftStatus("fuera");
      setSeconds(0);
      return;
    }
    setLoading(true);
    try {
      await clockOut(activeRole, currentShiftId);
      toast.success("Turno finalizado y sincronizado en PostgreSQL", {
        description: `Tiempo total en sede: ${formatTimer(seconds)}`,
      });
      setShiftStatus("fuera");
      setCurrentShiftId(null);
      setSeconds(0);
    } catch (err: any) {
      toast.error("Error al finalizar turno: " + err.message);
    } finally {
      setLoading(false);
    }
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

