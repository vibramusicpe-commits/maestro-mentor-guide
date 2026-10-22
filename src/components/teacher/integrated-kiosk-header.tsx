import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, Pause, Square, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [confirmClockOut, setConfirmClockOut] = useState(false);

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
        toast.success(`Turno iniciado en ${geo.sedeName || "Sede SJL"} 🟢`, {
          description: `GPS verificado a ${formatDistance(geo.distanceMeters)} de sede (Precisión ±${geo.accuracy}m). Visible en dirección.`,
        });
      } else if (geo.status === "fuera_de_sede") {
        toast.warning("Turno iniciado (Fuera de Sede) 📍", {
          description: `Ubicación registrada a ${formatDistance(geo.distanceMeters)} de ${geo.sedeName || "sede"} para supervisión de dirección.`,
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

  const statusLabel =
    shiftStatus === "trabajando"
      ? "En jornada"
      : shiftStatus === "pausa"
        ? "En pausa"
        : "Fuera de turno";

  const statusDot =
    shiftStatus === "trabajando"
      ? "bg-emerald-400"
      : shiftStatus === "pausa"
        ? "bg-amber-400"
        : "bg-slate-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-sidebar-border bg-sidebar px-3 py-2.5 text-sidebar-foreground shadow-sm"
    >
      {/* FICHAJE COMPACTO: cronómetro + estado + acciones.
          Nombre y sede ya los muestra la cabecera del portal. */}
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${statusDot}`} aria-hidden />
        <span className="font-mono text-base font-black tabular-nums tracking-tight">
          {formatTimer(seconds)}
        </span>
        <span className="truncate text-xs font-semibold text-sidebar-foreground/70">
          {statusLabel}
        </span>

        <div className="ml-auto flex items-center gap-1.5">
          {shiftStatus === "fuera" ? (
            <Button
              size="sm"
              onClick={handleClockIn}
              disabled={loading}
              className="h-11 gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Fichar
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleBreak}
                disabled={loading}
                className="h-11 gap-1 rounded-xl border-sidebar-border px-3 text-xs font-bold text-sidebar-foreground cursor-pointer"
              >
                <Pause className="h-3.5 w-3.5" />
                {shiftStatus === "pausa" ? "Reanudar" : "Pausa"}
              </Button>

              <span className="mx-0.5 h-6 w-px bg-sidebar-border" aria-hidden />

              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmClockOut(true)}
                disabled={loading}
                className="h-11 gap-1 rounded-xl px-3 text-xs font-bold cursor-pointer"
              >
                <Square className="h-3 w-3 fill-current" /> Salir
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Geocontrol: solo se muestra si hay una marca GPS registrada */}
      {inLoc && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-sidebar-foreground/70">
          <MapPin className="h-3 w-3 shrink-0 text-sidebar-primary" />
          {inLoc.status === "en_sede" ? (
            <button
              type="button"
              onClick={() => inLoc.googleMapsUrl && window.open(inLoc.googleMapsUrl, "_blank")}
              className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-bold text-emerald-400"
              title="GPS verificado en sede"
            >
              Sede · {formatDistance(inLoc.distanceMeters)}
            </button>
          ) : inLoc.status === "fuera_de_sede" ? (
            <button
              type="button"
              onClick={() => inLoc.googleMapsUrl && window.open(inLoc.googleMapsUrl, "_blank")}
              className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 font-bold text-amber-400"
              title="Marcado fuera de sede"
            >
              Fuera de sede · {formatDistance(inLoc.distanceMeters)}
            </button>
          ) : (
            <span className="rounded-md bg-muted/40 px-1.5 py-0.5">Sin GPS</span>
          )}
        </div>
      )}

      <AlertDialog open={confirmClockOut} onOpenChange={setConfirmClockOut}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Finalizar el turno?</AlertDialogTitle>
            <AlertDialogDescription>
              Se registrará tu hora de salida y ubicación final en PostgreSQL. El
              cronómetro volverá a cero y este turno no se puede reanudar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmClockOut(false);
                void handleClockOut();
              }}
            >
              Sí, finalizar turno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

