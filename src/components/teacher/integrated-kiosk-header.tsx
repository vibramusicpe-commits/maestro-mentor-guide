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
  parseShiftLocation,
  SHIFT_SYNC_CHANNEL,
  SHIFT_STORAGE_KEY,
  SHIFT_SYNC_EVENT_KEY,
  MAX_SHIFT_DURATION_HOURS,
  type DBTeacherTimeLog,
} from "@/lib/services/time-tracking.service";
import {
  getCurrentGPSPosition,
  formatDistance,
} from "@/lib/services/geolocation.service";

interface IntegratedTeacherKioskHeaderProps {
  totalDayStudents?: number;
}

export function IntegratedTeacherKioskHeader({ totalDayStudents = 0 }: IntegratedTeacherKioskHeaderProps) {
  const currentUser = useAppStore((s) => s.currentUser);
  const activeRole = useAppStore((s) => s.activeRole) || "teacher";

  const [shiftStatus, setShiftStatus] = useState<"fuera" | "trabajando" | "pausa">("fuera");
  const [seconds, setSeconds] = useState(0);
  const [currentShiftId, setCurrentShiftId] = useState<string | null>(null);
  const [currentShift, setCurrentShift] = useState<DBTeacherTimeLog | null>(null);
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
          // Calcular segundos reales transcurridos desde clock_in
          const startTime = new Date(active.clock_in).getTime();
          const now = Date.now();
          const elapsedSec = Math.max(0, Math.floor((now - startTime) / 1000) - (active.break_minutes || 0) * 60);

          // Si el turno tiene más de 14 horas, es un turno residual zombie de ayer: auto-cerrar
          if (elapsedSec > MAX_SHIFT_DURATION_HOURS * 3600) {
            setCurrentShiftId(null);
            setShiftStatus("fuera");
            setSeconds(0);
            return;
          }

          setCurrentShiftId(active.id);
          setCurrentShift(active);
          setShiftStatus(active.status);
          setSeconds(elapsedSec);
        } else {
          setCurrentShiftId(null);
          setCurrentShift(null);
          setShiftStatus("fuera");
          setSeconds(0);
        }
      } catch (err) {
        console.warn("Aviso al verificar turno activo del profesor:", err);
      }
    }

    restoreShift();

    // Sincronización en vivo inmediata entre pestañas
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel(SHIFT_SYNC_CHANNEL);
      bc.onmessage = () => {
        restoreShift();
      };
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === SHIFT_SYNC_EVENT_KEY || e.key === SHIFT_STORAGE_KEY) {
        restoreShift();
      }
    };
    const onCustom = () => restoreShift();

    window.addEventListener("storage", onStorage);
    window.addEventListener("vibra-shift-updated", onCustom);
    window.addEventListener("focus", restoreShift);

    return () => {
      bc?.close();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("vibra-shift-updated", onCustom);
      window.removeEventListener("focus", restoreShift);
    };
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
    const toastId = toast.loading("Verificando ubicación GPS en sede...", {
      description: "Capturando coordenadas una única vez...",
    });

    try {
      const geo = await getCurrentGPSPosition();
      toast.dismiss(toastId);

      const shift = await clockIn(activeRole, teacherUserId, teacherName, geo);
      setCurrentShiftId(shift.id);
      setCurrentShift(shift);
      setShiftStatus("trabajando");
      setSeconds(0);

      if (geo.status === "en_sede") {
        toast.success("Turno iniciado en Sede Miraflores 🟢", {
          description: `GPS verificado a ${formatDistance(geo.distanceMeters)} de sede (Precisión ±${geo.accuracy}m). Visible en dirección.`,
        });
      } else if (geo.status === "fuera_de_sede") {
        toast.warning("Turno iniciado (Fuera de Sede) 📍", {
          description: `Ubicación registrada a ${formatDistance(geo.distanceMeters)} de sede para supervisión de dirección.`,
        });
      } else {
        toast.info("Turno iniciado sin GPS ⚠️", {
          description: "Marcado registrado sin permiso de geolocalización.",
        });
      }
    } catch (err: any) {
      toast.dismiss(toastId);
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
      setCurrentShift(updated);
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
    const toastId = toast.loading("Registrando salida y ubicación final...", {
      description: "Sincronizando horas trabajadas en PostgreSQL...",
    });

    try {
      const geo = await getCurrentGPSPosition();
      toast.dismiss(toastId);

      await clockOut(activeRole, currentShiftId, geo);
      toast.success("Turno finalizado y sincronizado en PostgreSQL", {
        description: `Tiempo total en sede: ${formatTimer(seconds)}`,
      });
      setShiftStatus("fuera");
      setCurrentShiftId(null);
      setCurrentShift(null);
      setSeconds(0);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error("Error al finalizar turno: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const parsedLocation = parseShiftLocation(currentShift);
  const inLoc = parsedLocation.in;

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
              disabled={loading}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-8 shadow-xs cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Fichar Entrada
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleBreak}
                disabled={loading}
                className="h-8 px-2 text-[11px] font-bold rounded-xl border-sidebar-border text-sidebar-foreground"
              >
                <Pause className="h-3 w-3" /> {shiftStatus === "pausa" ? "Reanudar" : "Pausa"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleClockOut}
                disabled={loading}
                className="h-8 px-2 text-[11px] font-bold rounded-xl"
              >
                <Square className="h-3 w-3 fill-current" /> Salir
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 2. BARRA DE ESTADO DE LA JORNADA Y GEOCONTROL */}
      <div className="flex items-center justify-between pt-2 border-t border-sidebar-border/50 text-[11px] text-sidebar-foreground/80">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-sidebar-primary" />
          <span>Sede Miraflores</span>
          {inLoc && inLoc.status === "en_sede" ? (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 cursor-pointer"
              onClick={() => inLoc.googleMapsUrl && window.open(inLoc.googleMapsUrl, "_blank")}
              title="GPS verificado en sede"
            >
              🟢 Sede ({formatDistance(inLoc.distanceMeters)})
            </span>
          ) : inLoc && inLoc.status === "fuera_de_sede" ? (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 cursor-pointer"
              onClick={() => inLoc.googleMapsUrl && window.open(inLoc.googleMapsUrl, "_blank")}
              title="Marcado fuera de sede"
            >
              📍 Fuera ({formatDistance(inLoc.distanceMeters)})
            </span>
          ) : inLoc && inLoc.status === "sin_gps" ? (
            <span className="text-[10px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded-md">
              ⚠️ Sin GPS
            </span>
          ) : null}
        </div>
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

