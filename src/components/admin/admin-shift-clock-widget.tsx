import { useState, useEffect } from "react";
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
  type ShiftLocationMeta,
} from "@/lib/services/geolocation.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Clock,
  Play,
  Pause,
  Square,
  MapPin,
  ShieldCheck,
  Navigation,
  ExternalLink,
  Loader2,
} from "lucide-react";

export function AdminShiftClockWidget() {
  const currentUser = useAppStore((s) => s.currentUser);
  const activeRole = useAppStore((s) => s.activeRole) || "staff";

  // Identificación del usuario activo (Karla, Sergio, Nayeli, Rocío)
  const userName = currentUser?.name || (activeRole === "super_admin" ? "Sergio (Dirección)" : "Karla (Secretaría)");
  const userEmail = currentUser?.email || (activeRole === "super_admin" ? "sergio@vibramusic.pe" : "karla@vibramusic.pe");
  const userId = resolveTeacherUserId(userEmail, userName);
  const firstName = userName.split(" ")[0] || "Staff";

  const [shiftStatus, setShiftStatus] = useState<"fuera" | "trabajando" | "pausa">("fuera");
  const [seconds, setSeconds] = useState(0);
  const [currentShiftId, setCurrentShiftId] = useState<string | null>(null);
  const [currentShift, setCurrentShift] = useState<DBTeacherTimeLog | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Restaurar turno activo al cargar o cambiar de usuario
  const restoreShift = async () => {
    try {
      const active = await getActiveShift(userId, userName);
      if (active && active.status !== "finalizado") {
        const startTime = new Date(active.clock_in).getTime();
        const now = Date.now();
        const elapsedSec = Math.max(0, Math.floor((now - startTime) / 1000) - (active.break_minutes || 0) * 60);

        if (elapsedSec > MAX_SHIFT_DURATION_HOURS * 3600) {
          setCurrentShiftId(null);
          setCurrentShift(null);
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
      console.warn("Aviso al verificar turno activo de staff:", err);
    }
  };

  useEffect(() => {
    restoreShift();

    // Sincronización en vivo entre pestañas
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
  }, [userId, userName]);

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

  // Marcado de Entrada con GPS (1 única vez)
  const handleClockIn = async () => {
    setLoading(true);
    const toastId = toast.loading("Obteniendo ubicación GPS para verificar ingreso...", {
      description: "Solicitando coordenadas una única vez...",
    });

    try {
      const geo = await getCurrentGPSPosition();
      toast.dismiss(toastId);

      const shift = await clockIn(activeRole, userId, userName, geo);
      setCurrentShiftId(shift.id);
      setCurrentShift(shift);
      setShiftStatus("trabajando");
      setSeconds(0);

      if (geo.status === "en_sede") {
        toast.success(`Jornada iniciada: ${firstName} en Sede 🟢`, {
          description: `GPS verificado a ${formatDistance(geo.distanceMeters)} de Sede Miraflores (Precisión ±${geo.accuracy}m).`,
        });
      } else if (geo.status === "fuera_de_sede") {
        toast.warning(`Jornada iniciada: ${firstName} (Remoto / Fuera de Sede) 📍`, {
          description: `Ubicación registrada a ${formatDistance(geo.distanceMeters)} de sede para supervisión de horas.`,
        });
      } else {
        toast.info(`Jornada iniciada: ${firstName} (Sin GPS) ⚠️`, {
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

  // Pausa / Reanudar
  const handleToggleBreak = async () => {
    if (!currentShiftId) return;
    setLoading(true);
    try {
      const updated = await toggleBreak(activeRole, currentShiftId, shiftStatus);
      setShiftStatus(updated.status);
      setCurrentShift(updated);
      if (updated.status === "pausa") {
        toast.info("Jornada en pausa");
      } else {
        toast.success("Reanudando jornada");
      }
    } catch (err: any) {
      toast.error("Error al pausar/reanudar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Marcado de Salida con GPS (1 única vez)
  const handleClockOut = async () => {
    if (!currentShiftId) {
      setShiftStatus("fuera");
      setSeconds(0);
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Registrando salida y ubicación final...", {
      description: "Sincronizando horas netas en PostgreSQL...",
    });

    try {
      const geo = await getCurrentGPSPosition();
      toast.dismiss(toastId);

      await clockOut(activeRole, currentShiftId, geo);
      toast.success(`Jornada finalizada: ${firstName}`, {
        description: `Tiempo total trabajado: ${formatTimer(seconds)} (Registrado en nómina).`,
      });
      setShiftStatus("fuera");
      setCurrentShiftId(null);
      setCurrentShift(null);
      setSeconds(0);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error("Error al finalizar jornada: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const parsedLocation = parseShiftLocation(currentShift);
  const inLoc = parsedLocation.in;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {shiftStatus === "fuera" ? (
        <Button
          size="sm"
          onClick={handleClockIn}
          disabled={loading}
          className="h-8 px-2.5 sm:px-3 text-xs font-black rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs gap-1.5 transition-all cursor-pointer"
          title={`Iniciar jornada de ${firstName} con verificación GPS`}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Clock className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">Iniciar Turno ({firstName})</span>
          <span className="sm:hidden">Fichar ({firstName})</span>
        </Button>
      ) : (
        <div className="flex items-center gap-1.5 bg-sidebar-accent/80 border border-border px-2 py-1 rounded-xl shadow-xs">
          {/* Cronómetro en Vivo */}
          <div className="flex items-center gap-1">
            <span
              className={`h-2 w-2 rounded-full ${
                shiftStatus === "trabajando"
                  ? "bg-emerald-500 animate-ping"
                  : "bg-amber-500"
              }`}
            />
            <span className="font-mono text-xs font-black text-foreground">
              {formatTimer(seconds)}
            </span>
          </div>

          {/* Insignia GPS de Entrada */}
          {inLoc && inLoc.status === "en_sede" ? (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold px-1.5 py-0 h-5 gap-1 hidden md:inline-flex cursor-pointer"
              title={`Verificado en Sede Miraflores (a ${formatDistance(inLoc.distanceMeters)})`}
              onClick={() => inLoc.googleMapsUrl && window.open(inLoc.googleMapsUrl, "_blank")}
            >
              <Navigation className="h-2.5 w-2.5" />
              Sede
            </Badge>
          ) : inLoc && inLoc.status === "fuera_de_sede" ? (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold px-1.5 py-0 h-5 gap-1 hidden md:inline-flex cursor-pointer"
              title={`Marcado fuera de sede: a ${formatDistance(inLoc.distanceMeters)} de Sede Miraflores`}
              onClick={() => inLoc.googleMapsUrl && window.open(inLoc.googleMapsUrl, "_blank")}
            >
              <MapPin className="h-2.5 w-2.5" />
              {formatDistance(inLoc.distanceMeters)}
            </Badge>
          ) : null}

          {/* Botón Pausa */}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleToggleBreak}
            disabled={loading}
            className={`h-6 w-6 rounded-lg ${
              shiftStatus === "pausa"
                ? "text-emerald-500 hover:bg-emerald-500/15"
                : "text-amber-500 hover:bg-amber-500/15"
            }`}
            title={shiftStatus === "pausa" ? "Reanudar jornada" : "Pausar jornada"}
          >
            {shiftStatus === "pausa" ? (
              <Play className="h-3 w-3" />
            ) : (
              <Pause className="h-3 w-3" />
            )}
          </Button>

          {/* Botón Salir */}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleClockOut}
            disabled={loading}
            className="h-6 w-6 rounded-lg text-rose-500 hover:bg-rose-500/15"
            title="Finalizar turno y marcar salida"
          >
            <Square className="h-3 w-3 fill-current" />
          </Button>
        </div>
      )}
    </div>
  );
}
