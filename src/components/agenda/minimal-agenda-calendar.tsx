import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar as CalendarIcon, Clock, MapPin, User, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import type { Lesson } from "@/store/app-store";
import { useAppStore } from "@/store/app-store";

interface MinimalAgendaCalendarProps {
  lessons: Lesson[];
  title?: string;
  subtitle?: string;
  userType: "teacher" | "family";
}

const DAYS_OF_WEEK = [
  { short: "Lun", full: "Lunes" },
  { short: "Mar", full: "Martes" },
  { short: "Mié", full: "Miércoles" },
  { short: "Jue", full: "Jueves" },
  { short: "Vie", full: "Viernes" },
  { short: "Sáb", full: "Sábado" },
];

const statusBadgeStyles: Record<string, string> = {
  pendiente: "bg-warning/15 text-warning border-warning/30",
  presente: "bg-success/15 text-success border-success/30",
  ausente: "bg-destructive/15 text-destructive border-destructive/30",
  tarde: "bg-warning/20 text-warning border-warning/40",
};

export function MinimalAgendaCalendar({
  lessons,
  title = "Agenda Semanal",
  subtitle = "Horarios y clases programadas",
  userType,
}: MinimalAgendaCalendarProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // Lunes por defecto

  const selectedDayName = DAYS_OF_WEEK[selectedDayIndex]?.full;
  // Clases filtradas por el día seleccionado (Martes/Jueves) y por el estudiante actual
  const dayLessons = lessons.filter((l) => {
    // Las 2 clases semanales del Plan Regular son Martes (index 1) y Jueves (index 3)
    const isMatchingDay = selectedDayIndex === 1 || selectedDayIndex === 3;
    if (!isMatchingDay) return false;
    if (userType === "teacher") return true;
    
    // Si la propiedad title contiene el nombre del alumno (ej. Mateo o Sofía)
    return title.toLowerCase().includes(l.student.toLowerCase()) || l.student.toLowerCase().includes("mateo");
  });

  const [selectedWeek, setSelectedWeek] = useState<number>(1); // Semana 1 a 4 del mes

  return (
    <div className="space-y-4">
      {/* Header con Selector de Semana */}
      <div className="flex items-center justify-between">
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
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
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

      {/* Tira de días de la semana */}
      <div className="grid grid-cols-6 gap-1 rounded-2xl border border-border bg-card p-1.5 shadow-sm">
        {DAYS_OF_WEEK.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          // En Plan Regular las clases caen solo en Martes (1) y Jueves (3). En el resto de días es 0.
          const hasClassOnThisDay = idx === 1 || idx === 3;
          const count = hasClassOnThisDay ? 1 : 0;

          return (
            <button
              key={day.short}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground font-extrabold shadow-md"
                  : "text-foreground/90 font-semibold hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="text-[11px] font-bold">{day.short}</span>
              {count > 0 && (
                <span
                  className={`mt-1 text-[9px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-primary-foreground/25 text-primary-foreground font-black" : "bg-primary/15 text-primary font-bold"
                  }`}
                >
                  {count}
                </span>
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
            {dayLessons.length} {dayLessons.length === 1 ? "clase" : "clases"}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDayIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {dayLessons.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center shadow-xs">
                <p className="text-xs font-semibold text-muted-foreground">Sin clases programadas para este día.</p>
              </div>
            ) : (
              dayLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                        <Clock className="h-3.5 w-3.5" />
                        {lesson.time}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {lesson.instrument}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadgeStyles[lesson.status]}`}
                    >
                      {lesson.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/60">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="h-3.5 w-3.5 shrink-0 text-foreground" />
                      <span className="truncate font-medium">
                        {userType === "teacher" ? `Alumno: ${lesson.student}` : `Profesor: Prof. Elena`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate justify-end">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-foreground" />
                      <span className="truncate font-medium">{lesson.room}</span>
                    </div>
                  </div>

                  {/* 🎯 Si es vista Profesor: Botones de Marcado Rápido y Notas */}
                  {userType === "teacher" && (
                    <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-muted-foreground">Marcar estado:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => useAppStore.getState().setAttendance(lesson.id, "presente")}
                          className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-success/15 text-success hover:bg-success/25 transition-colors border border-success/30"
                        >
                          ✓ Presente
                        </button>
                        <button
                          onClick={() => useAppStore.getState().setAttendance(lesson.id, "ausente")}
                          className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-destructive/15 text-destructive hover:bg-destructive/25 transition-colors border border-destructive/30"
                        >
                          ✗ Ausente
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nota al pie: Solicitar cambio por WhatsApp */}
      <div className="rounded-2xl border border-border bg-card p-4 text-center space-y-2 shadow-xs">
        <p className="text-xs font-medium text-muted-foreground">
          ¿Necesitas reprogramar o avisar una inasistencia?
        </p>
        <a
          href="https://wa.me/51970608367?text=Hola%20Vibra%20Music!%20Deseo%20consultar/reprogramar%20una%20clase."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-success hover:underline"
        >
          <MessageCircle className="h-4 w-4 fill-current" />
          Contactar a la Secretaría por WhatsApp →
        </a>
      </div>
    </div>
  );
}
