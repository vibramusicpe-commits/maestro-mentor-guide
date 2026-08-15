import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, Square, Clock, Check, X, AlertCircle, Music2, MapPin, UserCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppStore, type Lesson, type AttendanceStatus } from "@/store/app-store";

interface IntegratedTeacherKioskHeaderProps {
  currentLesson?: Lesson;
}

export function IntegratedTeacherKioskHeader({ currentLesson }: IntegratedTeacherKioskHeaderProps) {
  const currentUser = useAppStore((s) => s.currentUser);
  const setAttendance = useAppStore((s) => s.setAttendance);

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

  const handleMarkAttendance = (status: AttendanceStatus) => {
    setAttendance(currentLesson.id, status);
    const statusLabels: Record<AttendanceStatus, string> = {
      presente: "Presente ✓",
      ausente: "Ausente ✗",
      tarde: "Llegó Tarde 🕒",
      pendiente: "Pendiente",
    };
    toast.success(`Asistencia registrada: ${statusLabels[status]}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-sidebar-border bg-sidebar p-5 text-sidebar-foreground shadow-xl space-y-5"
    >
      {/* 1. FICHAJE Y RELOJ DE SEDE (TOP BAR) */}
      <div className="flex items-center justify-between pb-4 border-b border-sidebar-border/60">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sidebar-primary flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Fichaje de Sede
          </p>
          <p className="text-xs text-sidebar-foreground/80 font-medium mt-0.5">
            {currentUser?.name ?? "Profesor/a Vibra"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="font-mono text-lg font-bold tracking-tight text-sidebar-foreground bg-sidebar-accent/80 px-3 py-1 rounded-xl border border-sidebar-border">
            {formatTimer(seconds)}
          </div>

          {shiftStatus === "fuera" ? (
            <Button
              size="sm"
              onClick={handleClockIn}
              className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground font-bold rounded-xl text-xs"
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Fichar Entrada
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleBreak}
                className="h-8 px-2.5 text-[11px] font-semibold rounded-lg border-sidebar-border text-sidebar-foreground"
              >
                <Pause className="h-3 w-3" /> {shiftStatus === "pausa" ? "Reanudar" : "Pausa"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleClockOut}
                className="h-8 px-2.5 text-[11px] font-bold rounded-lg"
              >
                <Square className="h-3 w-3 fill-current" /> Salir
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 2. TARJETA DE LA CLASE EN CURSO O ESTADO DEL DOCENTE */}
      {currentLesson ? (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-sidebar-primary flex items-center gap-1.5">
                <Music2 className="h-3.5 w-3.5" /> Clase en Curso Ahora
              </span>
              <span className="text-xs font-mono font-bold text-sidebar-foreground/90 bg-sidebar-accent px-2.5 py-0.5 rounded-full border border-sidebar-border">
                {currentLesson.time}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-sidebar-foreground tracking-tight">
                {currentLesson.student}
              </h2>
              <p className="text-xs text-sidebar-foreground/80 font-medium mt-1 flex items-center gap-3">
                <span>🎵 {currentLesson.instrument}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-sidebar-primary" /> {currentLesson.room}
                </span>
              </p>
            </div>
          </div>

          {/* 3. MARCADOR DE ASISTENCIA INTEGRADO (1 SOLO TOQUE) */}
          <div className="pt-2 border-t border-sidebar-border/60 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-sidebar-foreground/70">
              Marcar Asistencia del Alumno
            </p>

            <div className="grid grid-cols-3 gap-2">
              {/* Presente */}
              <button
                onClick={() => handleMarkAttendance("presente")}
                className={`flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border transition-all ${
                  currentLesson.status === "presente"
                    ? "bg-success text-success-foreground font-bold border-success ring-2 ring-success/30 shadow-md"
                    : "bg-sidebar-accent/60 text-sidebar-foreground border-sidebar-border hover:bg-success/20 hover:border-success/50"
                }`}
              >
                <Check className="h-5 w-5" />
                <span className="text-xs font-bold">Presente</span>
              </button>

              {/* Ausente */}
              <button
                onClick={() => handleMarkAttendance("ausente")}
                className={`flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border transition-all ${
                  currentLesson.status === "ausente"
                    ? "bg-destructive text-destructive-foreground font-bold border-destructive ring-2 ring-destructive/30 shadow-md"
                    : "bg-sidebar-accent/60 text-sidebar-foreground border-sidebar-border hover:bg-destructive/20 hover:border-destructive/50"
                }`}
              >
                <X className="h-5 w-5" />
                <span className="text-xs font-bold">Ausente</span>
              </button>

              {/* Tardanza */}
              <button
                onClick={() => handleMarkAttendance("tarde")}
                className={`flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border transition-all ${
                  currentLesson.status === "tarde"
                    ? "bg-warning text-warning-foreground font-bold border-warning ring-2 ring-warning/30 shadow-md"
                    : "bg-sidebar-accent/60 text-sidebar-foreground border-sidebar-border hover:bg-warning/20 hover:border-warning/50"
                }`}
              >
                <AlertCircle className="h-5 w-5" />
                <span className="text-xs font-bold">Tarde</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="py-2 space-y-2">
          <p className="text-sm font-bold text-sidebar-foreground flex items-center gap-2">
            <Music2 className="h-4 w-4 text-sidebar-primary" /> Panel Docente Activo
          </p>
          <p className="text-xs text-sidebar-foreground/75">
            Docente: <strong className="text-sidebar-foreground">{currentUser?.name ?? "Profesor"}</strong>
          </p>
        </div>
      )}
    </motion.div>
  );
}
