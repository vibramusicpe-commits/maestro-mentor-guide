import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  RotateCw,
  ClipboardList,
} from "lucide-react";
import { IntegratedTeacherKioskHeader } from "@/components/teacher/integrated-kiosk-header";
import { ClassLog, type ClassLogSeed } from "@/components/teacher/class-log";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  useAppStore,
  type AdminStudent,
  type ScheduledLesson,
  type WeekDay,
} from "@/store/app-store";
import { getCurrentWeekIndex, getMonthWeeks } from "@/lib/calendar-utils";
import { findStudentProfileByName } from "@/lib/student-matching";
import { isLessonInStudentCycle } from "@/lib/student-cycle";
import { useTeacherIdentity } from "@/hooks/use-teacher-identity";
import { useTeacherPilotAccess } from "@/hooks/use-teacher-pilot-access";
import { toIsoDate } from "@/lib/informes/utils";
import { useInsforgeSync } from "@/hooks/use-insforge-sync";
import { toast } from "sonner";

export const Route = createFileRoute("/teacher/")({
  head: () => ({
    meta: [
      { title: "Kiosco de clase — VM STAFF" },
      {
        name: "description",
        content:
          "Marca asistencia en un toque, revisa la clase en curso y registra la evaluación de la clase.",
      },
      { property: "og:title", content: "Kiosco de Clase — VM STAFF" },
      {
        property: "og:description",
        content: "Asistencia instantánea y registro de clase desde el móvil del profesor.",
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

const MONTH_OPTIONS = [
  { value: 6, label: "Julio 2026" },
  { value: 7, label: "Agosto 2026" },
  { value: 8, label: "Setiembre 2026" },
  { value: 9, label: "Octubre 2026" },
  { value: 10, label: "Noviembre 2026" },
  { value: 11, label: "Diciembre 2026" },
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
  const adminStudents = useAppStore((s) => s.adminStudents);
  const markLessonAttendance = useAppStore((s) => s.markLessonAttendance);
  const { isSyncing, syncNow, lastSyncTime } = useInsforgeSync();

  const {
    teacherClean,
    teacherDisplayName,
    teacherId,
    isDirector,
    teacherScheduleLessons,
    teacherStudentList,
    selectTeacher,
  } = useTeacherIdentity();

  const { classLogAccess, isPilotTeacher, v2FlagsOn } = useTeacherPilotAccess(teacherId);

  // Determinar día actual por defecto
  const todayDayShort = useMemo<WeekDay>(() => {
    const d = new Date().getDay();
    const map: Record<number, WeekDay> = { 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb" };
    return map[d] || "Lun";
  }, []);

  const [selectedDay, setSelectedDay] = useState<WeekDay>(todayDayShort);

  // Navegación de Mes y Semana dinámicos (ADR-0158)
  const [selectedYear] = useState<number>(() => {
    const now = new Date();
    return now.getFullYear() === 2026 ? 2026 : now.getFullYear();
  });

  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const now = new Date();
    if (now.getFullYear() === 2026 && now.getMonth() >= 6) {
      return now.getMonth();
    }
    return 9; // Octubre 2026 por defecto
  });

  // Semanas lectivas del mes seleccionado
  const monthWeeks = useMemo(() => getMonthWeeks(selectedYear, selectedMonth), [selectedYear, selectedMonth]);

  // Semana activa calculada dinámicamente según la fecha actual dentro del mes seleccionado
  const computedWeekIndex = useMemo(() => {
    const curIdx = getCurrentWeekIndex(selectedYear, selectedMonth);
    return Math.max(0, Math.min(curIdx, monthWeeks.length - 1));
  }, [selectedYear, selectedMonth, monthWeeks.length]);

  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(computedWeekIndex);

  const safeWeekIndex = Math.min(Math.max(0, selectedWeekIndex), Math.max(0, monthWeeks.length - 1));
  const currentWeekObj = monthWeeks[safeWeekIndex] || monthWeeks[0];
  const targetDayInfo = currentWeekObj?.days.find((d) => d.dayKey === selectedDay);
  const targetDateStr = targetDayInfo?.dateStr;

  // Función determinista para evaluar si una clase pertenece a un día y fecha específica (ADR-0105, ADR-0108, ADR-0128)
  const isLessonInDay = (lesson: ScheduledLesson, dayKey: WeekDay, dateStr?: string) => {
    if (lesson.day !== dayKey) return false;

    // 1. Filtro estricto de fecha puntual o semana
    if (lesson.dateStr) {
      if (dateStr && lesson.dateStr !== dateStr) return false;
    } else {
      if (lesson.weekIndex !== undefined && lesson.weekIndex !== safeWeekIndex) return false;
      if (lesson.excludedWeeks?.includes(safeWeekIndex)) return false;
    }

    // 2. Validación de exclusión por fecha puntual (reprogramaciones con fecha aislada)
    if (dateStr && lesson.excludedDates?.includes(dateStr)) {
      return false;
    }

    // 2.1 🛡️ Barreras temporales absolutas por transición de curso (ADR-0131)
    if (dateStr) {
      if (!lesson.dateStr && lesson.effectiveFrom && dateStr < lesson.effectiveFrom) return false;
      if (lesson.effectiveUntil && dateStr > lesson.effectiveUntil) return false;
    }

    // 3. 🛡️ REGLA FUNDAMENTAL DE CUOTA Y VIGENCIA (ADR-0108 & ADR-0128):
    // El Kiosco y la Agenda comparten el mismo motor determinista de ciclo contractual.
    // Esto previene mostrar clases 'fantasma' en días donde la sesión ya fue reprogramada/adelantada.
    if (dateStr) {
      const studentProfile = findStudentProfileByName(adminStudents, lesson.student);
      if (studentProfile && !isLessonInStudentCycle(studentProfile, lesson, dateStr, lesson.time, schedule)) {
        return false;
      }
    }

    return true;
  };

  // Contadores por día de la semana para la tira de días
  const countsByDay = useMemo(() => {
    const map = new Map<WeekDay, number>();
    DAYS_OF_WEEK.forEach((d) => {
      const dayObj = currentWeekObj?.days.find((cd) => cd.dayKey === d.short);
      const count = teacherScheduleLessons.filter((l) => isLessonInDay(l, d.short, dayObj?.dateStr)).length;
      map.set(d.short, count);
    });
    return map;
  }, [teacherScheduleLessons, currentWeekObj, safeWeekIndex, adminStudents, schedule]);

  // Clases del día seleccionado ORDENADAS CRONOLÓGICAMENTE
  const dayLessons = useMemo(() => {
    const raw = teacherScheduleLessons
      .filter((l) => isLessonInDay(l, selectedDay, targetDateStr))
      .sort((a, b) => a.time.localeCompare(b.time));

    const dedupedMap = new Map<string, ScheduledLesson>();
    raw.forEach((l) => {
      const key = `${l.time}-${l.student.toLowerCase().trim()}`;
      const existing = dedupedMap.get(key);
      if (!existing) {
        dedupedMap.set(key, l);
      } else {
        const lIsEval = Boolean(targetDateStr && l.attendanceByDate?.[targetDateStr] && l.attendanceByDate[targetDateStr] !== "pendiente");
        const exIsEval = Boolean(targetDateStr && existing.attendanceByDate?.[targetDateStr] && existing.attendanceByDate[targetDateStr] !== "pendiente");
        if (lIsEval && !exIsEval) {
          dedupedMap.set(key, l);
        } else if (!exIsEval && (l.dateStr || l.isMakeup) && (!existing.dateStr && !existing.isMakeup)) {
          dedupedMap.set(key, l);
        }
      }
    });
    return Array.from(dedupedMap.values());
  }, [teacherScheduleLessons, selectedDay, targetDateStr, safeWeekIndex, adminStudents, schedule]);

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

  // 🧪 Fase 2 — Registro de clase (hoja inferior, piloto Nathaly / Fernando / Jeremy)
  const [classLogSeed, setClassLogSeed] = useState<ClassLogSeed | null>(null);

  const handleMonthChange = (newMonth: number) => {
    setSelectedMonth(newMonth);
    const curW = getCurrentWeekIndex(selectedYear, newMonth);
    setSelectedWeekIndex(Math.max(0, Math.min(curW, getMonthWeeks(selectedYear, newMonth).length - 1)));
  };

  const moveWeek = (delta: number) => {
    setSelectedWeekIndex((prev) => Math.max(0, Math.min(prev + delta, monthWeeks.length - 1)));
  };

  const openClassLog = (
    student: AdminStudent,
    lesson: ScheduledLesson,
    dateStr?: string,
  ) => {
    const modality = (student.modality || "").toLowerCase();
    const isIntensive =
      modality.includes("inten") ||
      modality.includes("90 min") ||
      (modality.includes("4 clases") && !modality.includes("45 min"));

    setClassLogSeed({
      studentId: student.id,
      studentName: student.name,
      lessonId: lesson.id,
      sessionDate: lesson.dateStr || dateStr || toIsoDate(new Date()),
      startTime: lesson.time,
      durationMin: isIntensive ? 90 : 45,
      instrument: student.instrument || lesson.instrument,
      nonce: Date.now(),
    });
  };

  const selectedDayFull = DAYS_OF_WEEK.find((d) => d.short === selectedDay)?.full || selectedDay;
  const hasDayLessons = groupedTimeSlots.length > 0;
  const showPilotBadge = isPilotTeacher && !v2FlagsOn;

  return (
    <div className="space-y-3 pb-6">
      {/* FICHAJE: cronómetro y turno (nombre y sede viven en la cabecera del portal) */}
      <IntegratedTeacherKioskHeader totalDayStudents={dayLessons.length} />

      {/* Barra de control: auditoría docente solo para Dirección + estado en vivo */}
      <div className="flex items-center justify-between gap-2">
        {isDirector ? (
          <div className="flex min-w-0 flex-1 items-center gap-1 rounded-2xl border border-border bg-card p-1">
            {["Fernando", "Nathaly", "Jeremy"].map((t) => (
              <button
                key={t}
                onClick={() => selectTeacher(t)}
                aria-pressed={teacherDisplayName === t}
                className={`min-h-[40px] min-w-0 flex-1 rounded-xl px-1 text-xs font-bold transition-colors ${
                  teacherDisplayName === t
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <p className="truncate text-sm font-bold text-foreground">
              {selectedDayFull} · {dayLessons.length}{" "}
              {dayLessons.length === 1 ? "clase" : "clases"}
            </p>
            {showPilotBadge && (
              <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                Piloto
              </span>
            )}
          </div>
        )}

        <div className="flex shrink-0 items-center gap-1">
          <span className="hidden items-center gap-1.5 text-xs font-semibold text-muted-foreground sm:flex">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                  isSyncing ? "bg-amber-400" : "bg-emerald-400"
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  isSyncing ? "bg-amber-500" : "bg-emerald-500"
                }`}
              />
            </span>
            {isSyncing
              ? "Sincronizando…"
              : lastSyncTime
                ? `En vivo · ${new Date(lastSyncTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "En vivo"}
          </span>
          <button
            onClick={async () => {
              await syncNow();
              toast.success("Kiosco sincronizado con la base de datos central");
            }}
            disabled={isSyncing}
            title="Actualizar datos en tiempo real con PostgreSQL"
            aria-label="Sincronizar con PostgreSQL"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
          >
            <RotateCw className={`h-4 w-4 ${isSyncing ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* FECHA: tira de días con flechas + selector compacto de mes/semana */}
      <div className="space-y-2 rounded-2xl border border-border bg-card p-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => moveWeek(-1)}
            disabled={safeWeekIndex <= 0}
            aria-label="Semana anterior"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-1">
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              aria-label="Mes lectivo"
              className="h-11 min-w-0 flex-1 cursor-pointer rounded-xl border border-border bg-background px-2 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary"
            >
              {MONTH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={safeWeekIndex}
              onChange={(e) => setSelectedWeekIndex(Number(e.target.value))}
              aria-label="Semana del mes"
              className="h-11 min-w-0 flex-1 cursor-pointer rounded-xl border border-border bg-background px-2 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary"
            >
              {monthWeeks.map((w) => (
                <option key={w.weekIndex} value={w.weekIndex}>
                  Sem {w.weekIndex + 1} · {w.startDayNum}-{w.endDayNum}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => moveWeek(1)}
            disabled={safeWeekIndex >= monthWeeks.length - 1}
            aria-label="Semana siguiente"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-6 gap-1">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day.short;
            const count = countsByDay.get(day.short) || 0;
            const dayInfo = currentWeekObj?.days.find((cd) => cd.dayKey === day.short);

            return (
              <button
                key={day.short}
                onClick={() => setSelectedDay(day.short)}
                aria-pressed={isSelected}
                className={`flex min-h-[56px] flex-col items-center justify-center rounded-xl px-0.5 py-1 transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="text-xs font-bold">{day.short}</span>
                <span
                  className={`text-xs ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                >
                  {dayInfo?.dayNum ?? ""}
                </span>
                <span
                  className={`text-xs font-bold ${
                    isSelected
                      ? "text-primary-foreground"
                      : count > 0
                        ? "text-primary"
                        : "text-muted-foreground"
                  }`}
                >
                  {count > 0 ? count : "–"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LISTA CRONOLÓGICA DE BLOQUES HORARIOS */}
      <div className="space-y-2.5">
        {!hasDayLessons ? (
          <div className="space-y-2 rounded-2xl border border-dashed border-border bg-card p-6 text-center">
            <p className="text-sm font-bold text-foreground">
              Sin clases el {selectedDayFull}
            </p>
            <p className="text-xs text-muted-foreground">
              {teacherDisplayName} no tiene alumnos asignados ese día.
            </p>
            {Array.from(countsByDay.entries()).some(([, c]) => c > 0) && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  Días con clases:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {Array.from(countsByDay.entries())
                    .filter(([, c]) => c > 0)
                    .map(([dayShort, c]) => (
                      <button
                        key={dayShort}
                        onClick={() => setSelectedDay(dayShort)}
                        className="min-h-[40px] rounded-xl border border-border px-3 text-xs font-bold text-foreground transition-colors hover:bg-muted"
                      >
                        {dayShort} ({c})
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {groupedTimeSlots.map((slot, sIdx) => (
              <motion.div
                key={slot.time}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sIdx * 0.04 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                {/* Encabezado del Bloque Horario */}
                <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-foreground">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {slot.time}
                    </span>
                    <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {slot.room} · {slot.instrument}
                      </span>
                    </span>
                  </div>

                  <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                    {slot.lessons.length} {slot.lessons.length === 1 ? "alumno" : "alumnos"}
                  </span>
                </div>

                {/* Lista de Alumnos en este Bloque Horario */}
                <div className="divide-y divide-border/60">
                  {slot.lessons.map((lesson) => {
                    const studentProfile = findStudentProfileByName(adminStudents, lesson.student);
                    const profileLesson = studentProfile?.scheduleLessons?.find(
                      (pl) =>
                        pl.id === lesson.id ||
                        (pl.day === lesson.day &&
                          pl.time === lesson.time &&
                          (pl.dateStr === lesson.dateStr || (!pl.dateStr && !lesson.dateStr))),
                    );
                    const effectiveAttendanceByDate = profileLesson?.attendanceByDate || lesson.attendanceByDate;

                    const status = targetDateStr && effectiveAttendanceByDate?.[targetDateStr]
                      ? effectiveAttendanceByDate[targetDateStr]!
                      : "pendiente";

                    const isIntensiveStudent = Boolean(
                      studentProfile?.modality?.toLowerCase().includes("inten") ||
                        studentProfile?.modality?.toLowerCase().includes("90 min") ||
                        (studentProfile?.modality?.toLowerCase().includes("4 clases") &&
                          !studentProfile?.modality?.toLowerCase().includes("45 min")),
                    );

                    return (
                      <div key={lesson.id} className="space-y-2 px-3 py-2.5">
                        {/* Nombre, badges y estado */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-foreground">{lesson.student}</p>
                            <p className="text-xs text-muted-foreground">
                              {lesson.instrument} · {lesson.teacher}
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                            {lesson.isMakeup && (
                              <span className="rounded-md border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-xs font-bold text-red-600">
                                Recup.
                              </span>
                            )}
                            {lesson.category === "PERSONALIZADA" && (
                              <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-xs font-bold text-amber-600">
                                Personalizada
                              </span>
                            )}
                            {isIntensiveStudent && (
                              <span className="rounded-md border border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                                90 min
                              </span>
                            )}
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs uppercase ${
                                statusStyles[status] || statusStyles.pendiente
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                        </div>

                        {/* Asistencia en 1 toque (móvil) */}
                        <div className="grid grid-cols-4 gap-1.5">
                          <button
                            onClick={() => {
                              markLessonAttendance(lesson.id, "presente", "", safeWeekIndex, targetDateStr);
                              toast.success(`Asistencia: ${lesson.student} PRESENTE 🟢 (${targetDateStr || `Semana ${safeWeekIndex + 1}`})`);
                            }}
                            className={`min-h-[44px] rounded-xl border px-1 text-xs font-bold transition-colors ${
                              status === "presente"
                                ? "border-emerald-700 bg-emerald-600 text-white"
                                : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
                            }`}
                          >
                            🟢 Pres.
                          </button>
                          <button
                            onClick={() => {
                              markLessonAttendance(lesson.id, "ausente", "", safeWeekIndex, targetDateStr);
                              toast.error(`Asistencia: ${lesson.student} AUSENTE 🔴 (+1 Crédito de Recup.)`);
                            }}
                            className={`min-h-[44px] rounded-xl border px-1 text-xs font-bold transition-colors ${
                              status === "ausente"
                                ? "border-red-700 bg-red-600 text-white"
                                : "border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-300"
                            }`}
                          >
                            🔴 Aus.
                          </button>
                          <button
                            onClick={() => {
                              markLessonAttendance(lesson.id, "tarde", "", safeWeekIndex, targetDateStr);
                              toast.warning(`Asistencia: ${lesson.student} TARDE 🟡`);
                            }}
                            className={`min-h-[44px] rounded-xl border px-1 text-xs font-bold transition-colors ${
                              status === "tarde"
                                ? "border-amber-700 bg-amber-600 text-white"
                                : "border-amber-500/25 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
                            }`}
                          >
                            🟡 Tar.
                          </button>
                          <button
                            onClick={() => {
                              markLessonAttendance(lesson.id, "justificada", "", safeWeekIndex, targetDateStr);
                              toast.info(`Asistencia: ${lesson.student} JUSTIFICADA 🔵 (+1 Crédito)`);
                            }}
                            className={`min-h-[44px] rounded-xl border px-1 text-xs font-bold transition-colors ${
                              status === "justificada"
                                ? "border-blue-700 bg-blue-600 text-white"
                                : "border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-300"
                            }`}
                          >
                            🔵 Just.
                          </button>
                        </div>

                        {classLogAccess && studentProfile?.id && (
                          <button
                            type="button"
                            onClick={() => openClassLog(studentProfile, lesson, targetDateStr)}
                            className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 text-xs font-bold text-primary transition-colors hover:bg-primary/10"
                          >
                            <ClipboardList className="h-4 w-4" />
                            Registrar clase
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Contacto con secretaría */}
      <div className="rounded-2xl border border-border bg-card px-3 py-2.5 text-center">
        <a
          href="https://wa.me/51970608367?text=Hola%2C%20te%20escribe%20un%20profesor%20de%20Vibra%20Music%20para%20coordinar%20una%20clase."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 text-xs font-bold text-success hover:underline"
        >
          <MessageCircle className="h-4 w-4 fill-current" />
          Contactar a Secretaría por WhatsApp
        </a>
      </div>

      {/* Registro de clase en hoja inferior (solo docentes del piloto) */}
      <Sheet
        open={Boolean(classLogSeed)}
        onOpenChange={(open) => {
          if (!open) setClassLogSeed(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="max-h-[92vh] overflow-y-auto rounded-t-3xl px-4 pb-6 pt-5"
        >
          <SheetHeader className="mb-3 text-left">
            <SheetTitle className="text-base font-black">Registro de clase</SheetTitle>
            <SheetDescription className="text-xs">
              {classLogSeed?.studentName || "Alumno"}
              {classLogSeed?.sessionDate ? ` · ${classLogSeed.sessionDate}` : ""}
              {classLogSeed?.startTime ? ` · ${classLogSeed.startTime}` : ""}
            </SheetDescription>
          </SheetHeader>

          {classLogSeed && classLogAccess && (
            <ClassLog
              key={classLogSeed.nonce}
              teacherName={teacherDisplayName}
              teacherClean={teacherClean}
              students={teacherStudentList}
              schedule={teacherScheduleLessons}
              initialSeed={classLogSeed}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
