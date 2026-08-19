import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  MessageCircle,
  UserCheck,
} from "lucide-react";
import { IntegratedTeacherKioskHeader } from "@/components/teacher/integrated-kiosk-header";
import { LessonNotes } from "@/components/teacher/lesson-notes";
import { useAppStore, type ScheduledLesson, type WeekDay, type AttendanceStatus } from "@/store/app-store";
import { toast } from "sonner";

export const Route = createFileRoute("/teacher/")({
  head: () => ({
    meta: [
      { title: "Kiosco de clase — VM STAFF" },
      {
        name: "description",
        content:
          "Marca asistencia en un toque, revisa la clase en curso y deja notas privadas o para la familia.",
      },
      { property: "og:title", content: "Kiosco de Clase — VM STAFF" },
      {
        property: "og:description",
        content: "Asistencia instantánea y notas de clase desde el móvil del profesor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeacherKiosk,
});

const DAYS_OF_WEEK: { short: WeekDay; full: string }[] = [
  { short: "Lun", full: "Lunes" },
  { short: "Mar", full: "Martes" },
  { short: "Mié", full: "Miércoles" },
  { short: "Jue", full: "Jueves" },
  { short: "Vie", full: "Viernes" },
  { short: "Sáb", full: "Sábado" },
];

const statusStyles: Record<string, string> = {
  pendiente: "bg-muted text-muted-foreground border-border",
  programada: "bg-muted text-muted-foreground border-border",
  presente: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold",
  ausente: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30 font-bold",
  tarde: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold",
  justificada: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-bold",
};

export function TeacherKiosk() {
  const schedule = useAppStore((s) => s.schedule);
  const currentUser = useAppStore((s) => s.currentUser);
  const markLessonAttendance = useAppStore((s) => s.markLessonAttendance);

  // Determinar día actual por defecto
  const todayDayShort = useMemo<WeekDay>(() => {
    const d = new Date().getDay();
    const map: Record<number, WeekDay> = { 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb" };
    return map[d] || "Lun";
  }, []);

  const [selectedDay, setSelectedDay] = useState<WeekDay>(todayDayShort);

  // Extraer el nombre del profesor logueado
  const teacherRawName = currentUser?.name ?? "Jeremy (Guitarra y Batería)";
  const teacherClean = teacherRawName.toLowerCase().replace(/\s*\(.*?\)/, "").replace(/^prof\.\s*/i, "").trim();

  // Filtrar todas las clases de este profesor desde el horario central
  const teacherScheduleLessons = useMemo(() => {
    return schedule.filter((sch) => {
      if (sch.status === "cancelada") return false;
      const schTeacher = sch.teacher.toLowerCase().replace(/\s*\(.*?\)/, "").replace(/^prof\.\s*/i, "").trim();
      return (
        schTeacher.includes(teacherClean) ||
        teacherClean.includes(schTeacher) ||
        sch.teacher.toLowerCase().includes(teacherClean)
      );
    });
  }, [schedule, teacherClean]);

  // Contadores por día de la semana para los tabs
  const countsByDay = useMemo(() => {
    const map = new Map<WeekDay, number>();
    DAYS_OF_WEEK.forEach((d) => {
      const count = teacherScheduleLessons.filter((l) => l.day === d.short).length;
      map.set(d.short, count);
    });
    return map;
  }, [teacherScheduleLessons]);

  // Clases del día seleccionado ORDENADAS CRONOLÓGICAMENTE
  const dayLessons = useMemo(() => {
    return teacherScheduleLessons
      .filter((l) => l.day === selectedDay)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [teacherScheduleLessons, selectedDay]);

  // Agrupadas por bloque horario (e.g. 16:00, 16:45, 17:30...)
  const groupedTimeSlots = useMemo(() => {
    const map = new Map<string, ScheduledLesson[]>();
    dayLessons.forEach((l) => {
      const list = map.get(l.time) || [];
      list.push(l);
      map.set(l.time, list);
    });

    return Array.from(map.entries()).map(([time, lessons]) => ({
      time,
      lessons,
      room: lessons[0]?.room || "Sala A",
      instrument: lessons[0]?.instrument || "Instrumento",
    }));
  }, [dayLessons]);

  // Clase actual o primera del día para la cabecera
  const current = dayLessons[0]
    ? {
        id: dayLessons[0].id,
        time: dayLessons[0].time,
        student: dayLessons[0].student,
        instrument: dayLessons[0].instrument,
        room: dayLessons[0].room,
        status: (dayLessons[0].attendanceStatus || "pendiente") as AttendanceStatus,
      }
    : undefined;

  const selectedDayFull = DAYS_OF_WEEK.find((d) => d.short === selectedDay)?.full || selectedDay;

  return (
    <div className="space-y-5 pb-6">
      {/* 🚀 CABECERA INTEGRADA: FICHAJE DE SEDE + RELOJ DE TURNO */}
      <IntegratedTeacherKioskHeader currentLesson={current} />

      {/* 🗓️ SELECTOR DE DÍAS EN TABS MÓVILES (LUN..SÁB) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" /> Horario por Día · {teacherRawName.split(" ")[0]}
          </p>
          <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            {dayLessons.length} {dayLessons.length === 1 ? "alumno" : "alumnos"} el {selectedDayFull}
          </span>
        </div>

        <div className="grid grid-cols-6 gap-1 rounded-2xl border border-border bg-card p-1 shadow-sm">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day.short;
            const count = countsByDay.get(day.short) || 0;

            return (
              <button
                key={day.short}
                onClick={() => setSelectedDay(day.short)}
                className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-black shadow-md scale-105"
                    : "text-foreground/80 font-semibold hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="text-xs font-bold">{day.short}</span>
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
      </div>

      {/* 📋 LISTA CRONOLÓGICA DE BLOQUES HORARIOS */}
      <div className="space-y-3">
        {groupedTimeSlots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-xs space-y-1.5">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto text-xl">
              🏖️
            </div>
            <p className="text-sm font-bold text-foreground">Sin clases programadas para el {selectedDayFull}</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              No tienes alumnos asignados este día en la sede. Puedes cambiar de día arriba para ver el resto de tu semana.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupedTimeSlots.map((slot, sIdx) => (
              <motion.div
                key={slot.time}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sIdx * 0.04 }}
                className="rounded-2xl border-2 border-border/80 bg-card p-3.5 shadow-sm space-y-2.5"
              >
                {/* Encabezado del Bloque Horario */}
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-xl">
                      <Clock className="h-3.5 w-3.5" />
                      {slot.time}
                    </span>
                    <span className="text-xs font-bold text-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" /> {slot.room} · {slot.instrument}
                    </span>
                  </div>

                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-muted text-foreground border border-border">
                    👥 {slot.lessons.length} {slot.lessons.length === 1 ? "alumno" : "alumnos"}
                  </span>
                </div>

                {/* Lista de Alumnos en este Bloque Horario */}
                <div className="space-y-2">
                  {slot.lessons.map((lesson) => {
                    const status = lesson.attendanceStatus || "pendiente";

                    return (
                      <div
                        key={lesson.id}
                        className="rounded-xl border border-border/70 bg-background/80 p-3 space-y-2 hover:border-primary/40 transition-colors"
                      >
                        {/* Nombre y Badge de Tipo */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-black text-sm text-foreground truncate">{lesson.student}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {lesson.instrument} · {lesson.teacher}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {lesson.isMakeup && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-600 border border-red-500/30">
                                🔄 Recup.
                              </span>
                            )}
                            {lesson.category === "PERSONALIZADA" && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 border border-amber-500/30">
                                ⭐ Personalizada
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                statusStyles[status] || statusStyles.pendiente
                              }`}
                            >
                              ● {status}
                            </span>
                          </div>
                        </div>

                        {/* Botones de Marcado de Asistencia en 1 Clic (Móvil) */}
                        <div className="pt-1.5 border-t border-border/40 grid grid-cols-4 gap-1.5">
                          <button
                            onClick={() => {
                              markLessonAttendance(lesson.id, "presente");
                              toast.success(`Asistencia: ${lesson.student} PRESENTE 🟢`);
                            }}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition-all border text-center ${
                              status === "presente"
                                ? "bg-emerald-600 text-white border-emerald-700 shadow-xs scale-102"
                                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20"
                            }`}
                          >
                            🟢 Pres.
                          </button>
                          <button
                            onClick={() => {
                              markLessonAttendance(lesson.id, "ausente");
                              toast.error(`Asistencia: ${lesson.student} AUSENTE 🔴 (+1 Crédito de Recup.)`);
                            }}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition-all border text-center ${
                              status === "ausente"
                                ? "bg-red-600 text-white border-red-700 shadow-xs scale-102"
                                : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/25 hover:bg-red-500/20"
                            }`}
                          >
                            🔴 Aus.
                          </button>
                          <button
                            onClick={() => {
                              markLessonAttendance(lesson.id, "tarde");
                              toast.warning(`Asistencia: ${lesson.student} TARDE 🟡`);
                            }}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition-all border text-center ${
                              status === "tarde"
                                ? "bg-amber-600 text-white border-amber-700 shadow-xs scale-102"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25 hover:bg-amber-500/20"
                            }`}
                          >
                            🟡 Tar.
                          </button>
                          <button
                            onClick={() => {
                              markLessonAttendance(lesson.id, "justificada");
                              toast.info(`Asistencia: ${lesson.student} JUSTIFICADA 🔵 (+1 Crédito)`);
                            }}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition-all border text-center ${
                              status === "justificada"
                                ? "bg-blue-600 text-white border-blue-700 shadow-xs scale-102"
                                : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25 hover:bg-blue-500/20"
                            }`}
                          >
                            🔵 Just.
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Bitácora de Notas para la Familia / Alumno */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <LessonNotes />
      </section>

      {/* Nota al pie: Contacto Directo con Nayeli */}
      <div className="rounded-2xl border border-border bg-card p-3.5 text-center space-y-1.5 shadow-xs">
        <p className="text-xs font-medium text-muted-foreground">
          ¿Dudas sobre tus alumnos o necesitas coordinar una suplencia?
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

