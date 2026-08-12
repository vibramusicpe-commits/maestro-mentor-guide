import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, Timer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppStore, type Kid } from "@/store/app-store";

function format(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function PracticeTracker({ kid }: { kid: Kid }) {
  const addPractice = useAppStore((s) => s.addPractice);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      timer.current = setInterval(() => setSeconds((v) => v + 1), 1000);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running]);

  // Reiniciar el cronómetro al cambiar de hijo
  useEffect(() => {
    setRunning(false);
    setSeconds(0);
  }, [kid.id]);

  const pct = Math.min(100, Math.round((kid.practicedMinutes / kid.weeklyGoalMinutes) * 100));
  const remaining = Math.max(0, kid.weeklyGoalMinutes - kid.practicedMinutes);

  const stop = () => {
    const minutes = Math.max(1, Math.round(seconds / 60));
    setRunning(false);
    if (seconds > 0) {
      addPractice(kid.id, minutes);
      toast.success(`+${minutes} min de práctica`, {
        description: `Buen trabajo, ${kid.name}.`,
      });
    }
    setSeconds(0);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Timer className="h-3.5 w-3.5" /> Práctica en casa
      </p>

      <div className="mt-4 flex items-center gap-4">
        <p className="font-display text-4xl font-bold tabular-nums">{format(seconds)}</p>
        <Button
          variant={running ? "secondary" : "default"}
          className="ml-auto min-w-32"
          onClick={() => (running ? stop() : setRunning(true))}
        >
          {running ? <Pause className="mr-1.5 h-4 w-4" /> : <Play className="mr-1.5 h-4 w-4" />}
          {running ? "Detener" : "Iniciar"}
        </Button>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {kid.practicedMinutes} / {kid.weeklyGoalMinutes} min esta semana
          </span>
          <span className="font-semibold text-foreground">{pct}%</span>
        </div>
        <Progress value={pct} />
        <p className="text-xs text-muted-foreground">
          {pct >= 100
            ? "¡Meta semanal cumplida! 🎉"
            : `Faltan ${remaining} min para la meta · ${kid.practiceSessions} sesiones registradas`}
        </p>
      </div>
    </motion.section>
  );
}
