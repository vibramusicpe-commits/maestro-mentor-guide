import { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Printer,
  Sparkles,
  BookOpen,
  User,
  Ticket,
  GraduationCap,
  DoorOpen,
  CalendarCheck,
  Send,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAppStore,
  type AdminStudent,
  type ScheduledLesson,
  type WeekDay,
} from "@/store/app-store";
import {
  getMonthWeeks,
  MONTHS_NAME,
  WEEKDAY_FULL_NAMES,
  getCurrentWeekIndex,
  type CalendarWeekInfo,
} from "@/lib/calendar-utils";
import { isMatchingStudentName } from "@/lib/student-matching";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface StudentSessionItem {
  id: string; // Key única: `${lesson.id}-w${weekIndex}`
  lessonId: string;
  sessionIndex: number;
  weekIndex: number;
  weekLabel: string;
  dateStr: string; // YYYY-MM-DD
  dayNum: number;
  dayName: string; // "Lunes 03 de Agosto 2026"
  dayShort: string; // "Lun 03 Ago"
  dayKey: WeekDay;
  time: string; // "16:00"
  timeEnd: string; // "16:45"
  teacher: string;
  room: string;
  instrument: string;
  isMakeup: boolean;
  status: "presente" | "ausente" | "tarde" | "justificada" | "pendiente";
}

interface StudentAttendanceKardexProps {
  student: AdminStudent;
  isOpen?: boolean;
  onClose?: () => void;
  defaultMonth?: number; // 0 a 11 (7 para Agosto)
  defaultYear?: number;
  isDialog?: boolean;
}

export function StudentAttendanceKardex({
  student,
  isOpen = true,
  onClose,
  defaultMonth,
  defaultYear,
  isDialog = true,
}: StudentAttendanceKardexProps) {
  const schedule = useAppStore((s) => s.schedule);
  const setStudentSessionAttendance = useAppStore((s) => s.setStudentSessionAttendance);
  const bulkRegularizeStudentAttendance = useAppStore((s) => s.bulkRegularizeStudentAttendance);

  const now = new Date();
  const currentRealMonth = now.getMonth();
  const currentRealYear = now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number>(
    defaultMonth !== undefined ? defaultMonth : currentRealMonth
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    defaultYear !== undefined ? defaultYear : currentRealYear
  );
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  // Semanas del mes seleccionado
  const monthWeeks = useMemo(() => {
    return getMonthWeeks(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Clases agendadas para este alumno (matching inteligente de nombres)
  const studentLessons = useMemo(() => {
    return schedule.filter(
      (l) => isMatchingStudentName(l.student, student.name) && l.status !== "cancelada"
    );
  }, [schedule, student.name]);

  // Generar lista cronológica exacta de sesiones con fecha y hora
  const sessions: StudentSessionItem[] = useMemo(() => {
    const result: StudentSessionItem[] = [];
    const currentActiveWeek = getCurrentWeekIndex(selectedYear, selectedMonth);

    monthWeeks.forEach((week) => {
      week.days.forEach((dayInfo) => {
        // Ignorar días desbordados que no pertenecen al mes actual del ciclo
        if (!dayInfo.isCurrentMonth) return;

        // Buscar si el alumno tiene lección este día de la semana
        studentLessons.forEach((lesson) => {
          // Si la lección es para un día específico
          if (lesson.day !== dayInfo.dayKey) return;

          // Si la lección es exclusiva de una semana y no es esta semana
          if (lesson.weekIndex !== undefined && lesson.weekIndex !== week.weekIndex) return;

          // Si la lección excluye esta semana
          if (lesson.excludedWeeks && lesson.excludedWeeks.includes(week.weekIndex)) return;

          // Calcular hora de fin (+45 min)
          const [hh, mm] = (lesson.time || "16:00").split(":").map((v) => parseInt(v, 10));
          const endMinuteTotal = (hh || 16) * 60 + (mm || 0) + 45;
          const endH = String(Math.floor(endMinuteTotal / 60)).padStart(2, "0");
          const endM = String(endMinuteTotal % 60).padStart(2, "0");
          const timeEnd = `${endH}:${endM}`;

          // Determinar estado de asistencia para esta semana
          const currentStatus: StudentSessionItem["status"] =
            (lesson.attendanceByWeek && lesson.attendanceByWeek[week.weekIndex])
              ? lesson.attendanceByWeek[week.weekIndex]!
              : (lesson.weekIndex === week.weekIndex && lesson.attendanceStatus)
              ? lesson.attendanceStatus
              : (selectedMonth === currentRealMonth && week.weekIndex === currentActiveWeek && lesson.attendanceStatus)
              ? lesson.attendanceStatus
              : "pendiente";

          const monthName = MONTHS_NAME[dayInfo.monthIndex] || "Agosto";
          const fullDayName = WEEKDAY_FULL_NAMES[dayInfo.dayKey] || dayInfo.dayKey;

          result.push({
            id: `${lesson.id}-w${week.weekIndex}`,
            lessonId: lesson.id,
            sessionIndex: 0, // Se numera al ordenar
            weekIndex: week.weekIndex,
            weekLabel: week.label,
            dateStr: dayInfo.dateStr,
            dayNum: dayInfo.dayNum,
            dayName: `${fullDayName} ${String(dayInfo.dayNum).padStart(2, "0")} de ${monthName} ${dayInfo.year}`,
            dayShort: `${dayInfo.dayKey} ${dayInfo.dayNum} ${monthName.slice(0, 3)}`,
            dayKey: dayInfo.dayKey,
            time: lesson.time,
            timeEnd,
            teacher: lesson.teacher || student.teacher || "Por asignar",
            room: lesson.room || student.room || "Sala A",
            instrument: lesson.instrument || student.instrument || "Música",
            isMakeup: !!lesson.isMakeup,
            status: currentStatus,
          });
        });
      });
    });

    // Ordenar cronológicamente por fecha y hora
    result.sort((a, b) => {
      const cmpDate = a.dateStr.localeCompare(b.dateStr);
      if (cmpDate !== 0) return cmpDate;
      return a.time.localeCompare(b.time);
    });

    // Asignar índice secuencial (Sesión 1, 2, 3...)
    result.forEach((item, idx) => {
      item.sessionIndex = idx + 1;
    });

    return result;
  }, [monthWeeks, studentLessons, student.teacher, student.room, student.instrument]);

  // Contadores de Asistencia
  const stats = useMemo(() => {
    const total = sessions.length;
    const presentes = sessions.filter((s) => s.status === "presente").length;
    const ausentes = sessions.filter((s) => s.status === "ausente").length;
    const tardes = sessions.filter((s) => s.status === "tarde").length;
    const justificadas = sessions.filter((s) => s.status === "justificada").length;
    const pendientes = sessions.filter((s) => s.status === "pendiente").length;
    const evaluadas = presentes + ausentes + tardes + justificadas;
    const asistidasTotal = presentes + tardes;
    const rate: number | null = evaluadas > 0 ? Math.round((asistidasTotal / evaluadas) * 100) : null;

    return {
      total,
      presentes,
      ausentes,
      tardes,
      justificadas,
      pendientes,
      evaluadas,
      asistidasTotal,
      rate,
    };
  }, [sessions]);

  // Acción: Cambiar estado individual de una sesión
  const handleSetStatus = (
    item: StudentSessionItem,
    newStatus: "presente" | "ausente" | "tarde" | "justificada" | "pendiente"
  ) => {
    setStudentSessionAttendance(student.name, item.lessonId, item.weekIndex, newStatus);
    const labels = {
      presente: "🟢 Presente",
      ausente: "🔴 Falta / Ausente",
      tarde: "🟡 Tardanza",
      justificada: "🔵 Justificada (+1 Crédito)",
      pendiente: "⚪ Pendiente",
    };
    toast.success(`Sesión ${item.sessionIndex} actualizada: ${labels[newStatus]}`, {
      description: `${item.dayShort} · ${item.time} (${student.name})`,
    });
  };

  // Acción: Regularizar todo lo pendiente como Presente
  const handleRegularizeAllPending = () => {
    const pendingSessions = sessions.filter((s) => s.status === "pendiente");
    if (pendingSessions.length === 0) {
      toast.info("No hay sesiones pendientes por regularizar.");
      return;
    }

    const updates = pendingSessions.map((s) => ({
      lessonId: s.lessonId,
      weekIndex: s.weekIndex,
      status: "presente" as const,
    }));

    bulkRegularizeStudentAttendance(student.name, updates);
    toast.success(`Se regularizaron ${updates.length} sesiones como PRESENTES`, {
      description: `Alumno: ${student.name}`,
    });
  };

  // Acción: Copiar reporte para WhatsApp
  const handleCopyWhatsapp = () => {
    const isIntensivo = student.modality?.includes("Intensivo");
    const planLabel = isIntensivo ? "Plan Intensivo (4 clases / 90m)" : "Plan Regular (8 clases / 45m)";
    const monthName = MONTHS_NAME[selectedMonth] || "Agosto";

    let text = `📋 *HISTORIAL DE ASISTENCIA — VIBRA MUSIC*\n`;
    text += `👤 *Alumno:* ${student.name}\n`;
    text += `🎵 *Curso:* ${student.instrument} · Prof. ${student.teacher || "Vibra"}\n`;
    text += `📅 *Ciclo:* ${monthName} ${selectedYear} (${planLabel})\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    sessions.forEach((s) => {
      let icon = "⚪";
      let statusTxt = "Pendiente";
      if (s.status === "presente") {
        icon = "🟢";
        statusTxt = "Presente";
      } else if (s.status === "ausente") {
        icon = "🔴";
        statusTxt = "Falta";
      } else if (s.status === "tarde") {
        icon = "🟡";
        statusTxt = "Tardanza";
      } else if (s.status === "justificada") {
        icon = "🔵";
        statusTxt = "Justificada (Recuperable)";
      }

      text += `*Clase ${s.sessionIndex}* — ${s.dayShort} (${s.time} - ${s.timeEnd})\n`;
      text += `   Estado: ${icon} ${statusTxt} ${s.isMakeup ? "· [Recuperación]" : ""}\n\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📊 *Resumen de Cumplimiento:*\n`;
    text += `• Total clases programadas: ${stats.total}\n`;
    text += `• Clases asistidas: ${stats.asistidasTotal}\n`;
    text += `• Faltas no justificadas: ${stats.ausentes}\n`;
    text += `• Clases justificadas: ${stats.justificadas}\n`;
    text += `• Tasa de asistencia: ${stats.rate !== null ? `${stats.rate}%` : "Sin evaluar"}\n`;
    if (student.makeupCredits > 0) {
      text += `🎟️ *Créditos de recuperación disponibles:* ${student.makeupCredits}\n`;
    }
    text += `\n_Emitido por Dirección Académica Vibra Music Staff._`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedWhatsapp(true);
      toast.success("¡Reporte copiado para WhatsApp!", {
        description: "Pégalo en el chat con el apoderado o dueño.",
      });
      setTimeout(() => setCopiedWhatsapp(false), 3000);
    });
  };

  const isIntensivo = student.modality?.includes("Intensivo");
  const targetLessons = isIntensivo ? 4 : 8;

  const content = (
    <div className="space-y-4">
      {/* Encabezado con datos del Alumno */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-card/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-foreground">{student.name}</h3>
            <Badge variant="outline" className="text-xs font-bold border-primary/30 text-primary bg-primary/10">
              {student.instrument}
            </Badge>
            {student.isReentry && (
              <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-0 text-[10px] font-black">
                🔄 Reingreso
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              Prof. <strong>{student.teacher || "Por asignar"}</strong>
            </span>
            <span className="flex items-center gap-1">
              <DoorOpen className="h-3.5 w-3.5 text-primary" />
              {student.room || "Sala A"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {isIntensivo ? "Plan Intensivo (4 clases)" : "Plan Regular (8 clases)"}
            </span>
          </p>
        </div>

        {/* Selector de Mes del Ciclo con pestañas rápidas Agosto / Setiembre */}
        <div className="flex items-center gap-1.5 shrink-0 bg-muted/60 p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setSelectedMonth(7)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedMonth === 7
                ? "bg-background text-foreground shadow-2xs font-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Agosto
          </button>
          <button
            type="button"
            onClick={() => setSelectedMonth(8)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedMonth === 8
                ? "bg-primary text-primary-foreground shadow-2xs font-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Setiembre
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
          <Select
            value={String(selectedMonth)}
            onValueChange={(v) => setSelectedMonth(parseInt(v, 10))}
          >
            <SelectTrigger className="h-7 text-[11px] w-[115px] rounded-lg font-bold border-0 bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS_NAME.map((m, idx) => (
                <SelectItem key={m} value={String(idx)}>
                  {m} {selectedYear}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tarjetas de Métricas de Asistencia */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        <div className="p-3 rounded-xl border border-border bg-card text-center">
          <p className="text-[10px] uppercase font-bold text-muted-foreground">Programadas</p>
          <p className="text-xl font-black text-foreground mt-0.5">
            {stats.total} <span className="text-xs text-muted-foreground font-normal">/ {targetLessons}</span>
          </p>
        </div>
        <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-center">
          <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">🟢 Asistidas</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.asistidasTotal}</p>
        </div>
        <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/5 text-center">
          <p className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400">🔴 Faltas</p>
          <p className="text-xl font-black text-red-600 dark:text-red-400 mt-0.5">{stats.ausentes}</p>
        </div>
        <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-center">
          <p className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">🟡 Tardanzas</p>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{stats.tardes}</p>
        </div>
        <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 text-center">
          <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">🔵 Justificadas</p>
          <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{stats.justificadas}</p>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card text-center">
          <p className="text-[10px] uppercase font-bold text-muted-foreground">⚪ Pendientes</p>
          <p className={`text-xl font-black mt-0.5 ${stats.pendientes > 0 ? "text-amber-500" : "text-muted-foreground"}`}>
            {stats.pendientes}
          </p>
        </div>
        <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 text-center">
          <p className="text-[10px] uppercase font-bold text-primary">Tasa Global</p>
          <p className="text-xl font-black text-primary mt-0.5">
            {stats.rate !== null ? `${stats.rate}%` : "—"}
          </p>
        </div>
      </div>

      {/* Barra de Progreso y Acciones Rápidas de Secretaría */}
      <div className="p-3.5 rounded-2xl border border-border bg-card/60 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-[220px]">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-foreground">Cumplimiento del Plan del Mes:</span>
            <span className="font-mono text-primary">{stats.asistidasTotal} de {targetLessons} clases asistidas</span>
          </div>
          <Progress
            value={Math.min(100, (stats.asistidasTotal / targetLessons) * 100)}
            className="h-2"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {stats.pendientes > 0 && (
            <Button
              size="sm"
              onClick={handleRegularizeAllPending}
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-xl shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              ⚡ Regularizar todo como Presente ({stats.pendientes})
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyWhatsapp}
            className="text-xs font-bold gap-1.5 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 rounded-xl"
          >
            {copiedWhatsapp ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedWhatsapp ? "¡Copiado!" : "Copiar Reporte WhatsApp"}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.print()}
            className="text-xs font-bold gap-1.5 text-muted-foreground hover:text-foreground rounded-xl"
            title="Imprimir o exportar a PDF"
          >
            <Printer className="h-3.5 w-3.5" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Tabla Cronológica de Sesiones con Fecha y Hora */}
      <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-xs">
        <div className="px-4 py-2.5 bg-muted/60 border-b border-border flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-primary" />
            Historial Cronológico de Sesiones ({sessions.length} clases encontradas)
          </span>
          <span className="text-[11px] text-muted-foreground">
            {MONTHS_NAME[selectedMonth]} {selectedYear}
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
            <p>⚠️ No se encontraron clases programadas en agenda para este alumno en este mes.</p>
            <p className="text-[11px]">Verifica que el alumno tenga horarios asignados en la Agenda.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sessions.map((item) => {
              const isPast = new Date(item.dateStr).getTime() <= new Date().getTime();

              return (
                <div
                  key={item.id}
                  className={`p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-muted/30 transition-colors ${
                    item.status === "pendiente" ? "bg-amber-500/5" : ""
                  }`}
                >
                  {/* Info de Fecha y Hora */}
                  <div className="flex items-start gap-3 min-w-[240px]">
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                      <span className="text-[9px] font-black uppercase leading-none">{item.dayKey}</span>
                      <span className="text-sm font-black leading-tight">{item.dayNum}</span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-foreground">
                          Sesión {item.sessionIndex} · {item.dayName}
                        </span>
                        {item.isMakeup && (
                          <Badge className="bg-red-500/20 text-red-700 dark:text-red-300 text-[9px] font-black border-0">
                            🔴 Recuperación
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">({item.weekLabel})</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono font-bold text-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3 text-primary" />
                          {item.time} - {item.timeEnd}
                        </span>
                        <span>•</span>
                        <span>{item.room}</span>
                        <span>•</span>
                        <span>Prof. {item.teacher}</span>
                      </div>
                    </div>
                  </div>

                  {/* Estado Actual y Acciones en 1 Clic */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Badge Estado Actual */}
                    <Badge
                      className={`text-xs px-2.5 py-1 font-bold border-0 ${
                        item.status === "presente"
                          ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold"
                          : item.status === "ausente"
                          ? "bg-red-500/20 text-red-700 dark:text-red-300 font-extrabold"
                          : item.status === "tarde"
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold"
                          : item.status === "justificada"
                          ? "bg-blue-500/20 text-blue-700 dark:text-blue-300 font-extrabold"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {item.status === "presente" && "✓ Presente"}
                      {item.status === "ausente" && "✗ Falta"}
                      {item.status === "tarde" && "⏰ Tardanza"}
                      {item.status === "justificada" && "🔵 Justificada"}
                      {item.status === "pendiente" && "⚪ Sin marcar"}
                    </Badge>

                    {/* Botones de Actualización Inmediata en 1 Clic */}
                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
                      <Button
                        size="sm"
                        variant={item.status === "presente" ? "default" : "ghost"}
                        onClick={() => handleSetStatus(item, "presente")}
                        className={`h-7 px-2 text-[11px] font-bold rounded-lg ${
                          item.status === "presente"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "text-emerald-600 hover:bg-emerald-500/15"
                        }`}
                        title="Marcar como Presente"
                      >
                        ✓ Pres
                      </Button>
                      <Button
                        size="sm"
                        variant={item.status === "ausente" ? "default" : "ghost"}
                        onClick={() => handleSetStatus(item, "ausente")}
                        className={`h-7 px-2 text-[11px] font-bold rounded-lg ${
                          item.status === "ausente"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "text-red-600 hover:bg-red-500/15"
                        }`}
                        title="Marcar como Falta / Ausente"
                      >
                        ✗ Falta
                      </Button>
                      <Button
                        size="sm"
                        variant={item.status === "tarde" ? "default" : "ghost"}
                        onClick={() => handleSetStatus(item, "tarde")}
                        className={`h-7 px-2 text-[11px] font-bold rounded-lg ${
                          item.status === "tarde"
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : "text-amber-600 hover:bg-amber-500/15"
                        }`}
                        title="Marcar como Tardanza"
                      >
                        ⏰ Tar
                      </Button>
                      <Button
                        size="sm"
                        data-tour="kardex-btn-justificada"
                        variant={item.status === "justificada" ? "default" : "ghost"}
                        onClick={() => handleSetStatus(item, "justificada")}
                        className={`h-7 px-2 text-[11px] font-bold rounded-lg ${
                          item.status === "justificada"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "text-blue-600 hover:bg-blue-500/15"
                        }`}
                        title="Marcar como Justificada (Genera +1 Crédito)"
                      >
                        🔵 Just
                      </Button>
                      {item.status !== "pendiente" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSetStatus(item, "pendiente")}
                          className="h-7 px-1.5 text-[11px] text-muted-foreground hover:text-foreground rounded-lg"
                          title="Restablecer a Pendiente / Sin marcar"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  if (!isDialog) {
    return content;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-6 rounded-3xl bg-card border-border overflow-hidden">
        <DialogHeader className="pb-3 border-b border-border shrink-0">
          <DialogTitle className="text-lg font-black flex items-center gap-2 text-foreground">
            <BookOpen className="h-5 w-5 text-primary" />
            Kardex de Asistencias y Registro de Sesiones
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Historial cronológico auditado de clases con fecha exacta, horario, profesor y regularización retroactiva en 1 clic.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 pr-1">{content}</div>

        <div className="pt-3 border-t border-border flex justify-between items-center text-xs shrink-0">
          <span className="text-muted-foreground text-[11px]">
            {stats.asistidasTotal} clases asistidas registradas · {student.makeupCredits} créditos disponibles
          </span>
          <Button
            variant="outline"
            size="sm"
            data-tour="kardex-close-btn"
            onClick={onClose}
            className="text-xs rounded-xl"
          >
            Cerrar Kardex
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
