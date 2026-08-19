import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar as CalendarIcon, Clock, MapPin, User, MessageCircle, CheckCircle2, XCircle, AlertCircle, Sparkles } from "lucide-react";
import type { Lesson, ScheduledLesson, AttendanceStatus, WeekDay } from "@/store/app-store";
import { useAppStore } from "@/store/app-store";
import { toast } from "sonner";

type CalendarLessonItem = (Lesson | ScheduledLesson) & {
  day?: WeekDay;
  attendanceStatus?: AttendanceStatus;
};

interface MinimalAgendaCalendarProps {
  lessons: CalendarLessonItem[];
  title?: string;
  subtitle?: string;
  userType: "teacher" | "family";
}

const DAYS_OF_WEEK: { short: WeekDay; full: string }[] = [
  { short: "Lun", full: "Lunes" },
  { short: "Mar", full: "Martes" },
  { short: "Mié", full: "Miércoles" },
  { short: "Jue", full: "Jueves" },
  { short: "Vie", full: "Viernes" },
  { short: "Sáb", full: "Sábado" },
];

const statusBadgeStyles: Record<string, string> = {
  pendiente: "bg-muted text-muted-foreground border-border",
  programada: "bg-muted text-muted-foreground border-border",
  presente: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold",
  ausente: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30 font-bold",
  tarde: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold",
  justificada: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-bold",
  cancelada: "bg-destructive/20 text-destructive border-destructive/40 font-bold",
};

export function MinimalAgendaCalendar({
  lessons,
  title = "Agenda Semanal",
  subtitle = "Horarios y clases programadas",
  userType,
}: MinimalAgendaCalendarProps) {
  // Determinar el día de hoy por defecto (0=Dom, 1=Lun... 6=Sáb)
  const todayDayIndex = useMemo(() => {
    const d = new Date().getDay();
    if (d === 0) return 0; // Domingo -> muestra Lunes
    return Math.min(5, d - 1);
  }, []);

  const [selectedDayIndex, setSelectedDayIndex] = useState(todayDayIndex);
  const [selectedWeek, setSelectedWeek] = useState<number>(2); // Semana 2 (Agosto 2026 activa)

  const markLessonAttendance = useAppStore((s) => s.markLessonAttendance);
  const setAttendance = useAppStore((s) => s.setAttendance);

  const selectedDayObj = DAYS_OF_WEEK[selectedDayIndex] || DAYS_OF_WEEK[0];
  const selectedDayShort = selectedDayObj.short;
  const selectedDayName = selectedDayObj.full;

  // Mapa de clases por día (contadores reales)
  const lessonsByDay = useMemo(() => {
    const map = new Map<WeekDay, CalendarLessonItem[]>();
    DAYS_OF_WEEK.forEach((d) => map.set(d.short, []));

    lessons.forEach((l) => {
      if (l.status === "cancelada") return;
      const d = (l as ScheduledLesson).day || (userType === "family" ? "Mar" : "Lun");
      const list = map.get(d) || [];
      list.push(l);
      map.set(d, list);
    });

    // Ordenar cronológicamente cada día
    map.forEach((list) => {
      list.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    });

    return map;
  }, [lessons, userType]);

  const currentDayLessons = lessonsByDay.get(selectedDayShort) || [];

  return (
    <div className="space-y-4">
      {/* Header con Selector de Semana */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" /> {title}
          </h2>
          <p className="text-xs font-medium text-muted-foreground">{subtitle}</p>
        </div>

        {/* Selector de Semanas del Mes */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border text-xs">
          {[1, 2, 3, 4].map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedWeek === w
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground/80 hover:text-foreground hover:bg-background"
              }`}
            >
              Sem {w}
            </button>
          ))}
        </div>
      </div>

      {/* Tira interactiva de días de la semana con contadores reales */}
      <div className="grid grid-cols-6 gap-1 rounded-2xl border border-border bg-card p-1.5 shadow-sm">
        {DAYS_OF_WEEK.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          const count = (lessonsByDay.get(day.short) || []).length;

          return (
            <button
              key={day.short}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all relative ${
                isSelected
                  ? "bg-primary text-primary-foreground font-extrabold shadow-md scale-105"
                  : "text-foreground/90 font-semibold hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="text-[11px] font-bold">{day.short}</span>
              {count > 0 ? (
                <span
                  className={`mt-1 text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected
                      ? "bg-primary-foreground/25 text-primary-foreground"
                      : "bg-primary/15 text-primary"
                  }`}
                >
                  {count}
                </span>
              ) : (
                <span className="mt-1 text-[9px] opacity-40">-</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lista de clases del día seleccionado */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold text-foreground">
            Clases del {selectedDayName}
          </p>
          <span className="text-xs font-semibold text-muted-foreground tabular-nums">
            {currentDayLessons.length} {currentDayLessons.length === 1 ? "clase" : "clases"}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDayIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-2.5"
          >
            {currentDayLessons.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-xs space-y-1">
                <p className="text-sm font-bold text-foreground">Sin clases programadas para este día</p>
                <p className="text-xs text-muted-foreground">Disfruta tu día libre o coordina con Secretaría para agregar alumnos.</p>
              </div>
            ) : (
              currentDayLessons.map((lesson) => {
                const effectiveStatus =
                  (lesson as ScheduledLesson).attendanceStatus ||
                  lesson.status ||
                  "programada";

                return (
                  <div
                    key={lesson.id}
                    className="rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-all hover:border-primary/40 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                          <Clock className="h-3.5 w-3.5" />
                          {lesson.time}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          {lesson.instrument}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          statusBadgeStyles[effectiveStatus] || statusBadgeStyles.pendiente
                        }`}
                      >
                        ● {effectiveStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/60">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="h-3.5 w-3.5 shrink-0 text-foreground" />
                        <span className="truncate font-bold text-foreground">
                          {lesson.student}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate justify-end">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-foreground" />
                        <span className="truncate font-semibold">{lesson.room}</span>
                      </div>
                    </div>

                    {/* 🎯 Vista Profesor: Botones de Asistencia en 1 Clic */}
                    {userType === "teacher" && (
                      <div className="pt-2 border-t border-border/40 grid grid-cols-4 gap-1.5">
                        <button
                          onClick={() => {
                            markLessonAttendance(lesson.id, "presente");
                            setAttendance(lesson.id, "presente");
                            toast.success(`Asistencia: ${lesson.student} PRESENTE 🟢`);
                          }}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all border text-center ${
                            effectiveStatus === "presente"
                              ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20"
                          }`}
                        >
                          🟢 Pres.
                        </button>
                        <button
                          onClick={() => {
                            markLessonAttendance(lesson.id, "ausente");
                            setAttendance(lesson.id, "ausente");
                            toast.error(`Asistencia: ${lesson.student} AUSENTE 🔴 (+1 Crédito)`);
                          }}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all border text-center ${
                            effectiveStatus === "ausente"
                              ? "bg-red-600 text-white border-red-700 shadow-xs"
                              : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/25 hover:bg-red-500/20"
                          }`}
                        >
                          🔴 Aus.
                        </button>
                        <button
                          onClick={() => {
                            markLessonAttendance(lesson.id, "tarde");
                            setAttendance(lesson.id, "tarde");
                            toast.warning(`Asistencia: ${lesson.student} TARDE 🟡`);
                          }}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all border text-center ${
                            effectiveStatus === "tarde"
                              ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25 hover:bg-amber-500/20"
                          }`}
                        >
                          🟡 Tar.
                        </button>
                        <button
                          onClick={() => {
                            markLessonAttendance(lesson.id, "justificada");
                            setAttendance(lesson.id, "justificada");
                            toast.info(`Asistencia: ${lesson.student} JUSTIFICADA 🔵 (+1 Crédito)`);
                          }}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all border text-center ${
                            effectiveStatus === "justificada"
                              ? "bg-blue-600 text-white border-blue-700 shadow-xs"
                              : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25 hover:bg-blue-500/20"
                          }`}
                        >
                          🔵 Just.
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nota al pie: Solicitar cambio por WhatsApp */}
      <div className="rounded-2xl border border-border bg-card p-3.5 text-center space-y-1.5 shadow-xs">
        <p className="text-xs font-medium text-muted-foreground">
          ¿Necesitas reprogramar o avisar una inasistencia?
        </p>
        <a
          href="https://wa.me/51970608367?text=Hola%20Nayeli,%20te%20escribe%20un%20profesor%20de%20Vibra%20Music%20para%20coordinar%20una%20clase."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-success hover:underline"
        >
          <MessageCircle className="h-4 w-4 fill-current" />
          Contactar a Nayeli (Secretaría) por WhatsApp →
        </a>
      </div>
    </div>
  );
}

