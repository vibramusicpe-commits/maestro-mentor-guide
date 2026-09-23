import { useState, useMemo, useEffect } from "react";
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
  Lock,
  CalendarSync,
  PlusCircle,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAppStore,
  type AdminStudent,
  type ScheduledLesson,
  type WeekDay,
} from "@/store/app-store";
import {
  weekDays,
  timeSlots,
  timeSlotsWeekday,
  timeSlotsSaturday,
  rooms,
  teachers,
} from "@/store/admin-seeds";
import {
  getMonthWeeks,
  MONTHS_NAME,
  WEEKDAY_FULL_NAMES,
  WEEKDAYS_ORDER,
  getCurrentWeekIndex,
  type CalendarWeekInfo,
} from "@/lib/calendar-utils";
import { isMatchingStudentName, isSameStudentId } from "@/lib/student-matching";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
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
  recoveringLessonDate?: string;
  status: "presente" | "ausente" | "tarde" | "justificada" | "pendiente";
}

interface StudentAttendanceKardexProps {
  student: AdminStudent;
  isOpen?: boolean;
  onClose?: () => void;
  defaultMonth?: number; // 0 a 11 (7 para Agosto)
  defaultYear?: number;
  isDialog?: boolean;
  isEditable?: boolean; // 🔒 Si es false, los botones de marcar quedan bloqueados en modo solo lectura
}

export function StudentAttendanceKardex({
  student,
  isOpen = true,
  onClose,
  defaultMonth,
  defaultYear,
  isDialog = true,
  isEditable = false,
}: StudentAttendanceKardexProps) {
  const schedule = useAppStore((s) => s.schedule);
  const adminStudents = useAppStore((s) => s.adminStudents);
  const setStudentSessionAttendance = useAppStore((s) => s.setStudentSessionAttendance);
  const bulkRegularizeStudentAttendance = useAppStore((s) => s.bulkRegularizeStudentAttendance);
  const rescheduleLesson = useAppStore((s) => s.rescheduleLesson);
  const addLessonToSchedule = useAppStore((s) => s.addLessonToSchedule);
  const deleteLessonFromSchedule = useAppStore((s) => s.deleteLessonFromSchedule);
  const revertMakeupLesson = useAppStore((s) => s.revertMakeupLesson);
  const updateStudentDetails = useAppStore((s) => s.updateStudentDetails);

  // 🎛️ Selector Dual de Modo de Vista: Ciclo Activo Vigente (8 clases) vs Por Mes Calendario
  const [viewTab, setViewTab] = useState<"cycle" | "calendar">("cycle");
  // 🔒 Modo Edición Activa (inicia según isEditable o se desbloquea directamente)
  const [isEditMode, setIsEditMode] = useState<boolean>(isEditable);

  useEffect(() => {
    setIsEditMode(isEditable);
  }, [isEditable]);

  // Alumno reactivo sincronizado con el store general
  const liveStudent = useMemo(() => {
    return (
      adminStudents.find(
        (st) => isSameStudentId(st.id, student.id) || isMatchingStudentName(st.name, student.name)
      ) || student
    );
  }, [adminStudents, student]);

  // 🛡️ REGLA DE ORO (ADR 0100 & ADR 0104): Fecha de inicio oficial estricta
  const isEmma =
    isMatchingStudentName(liveStudent.name, "Emma Micaela") ||
    isMatchingStudentName(liveStudent.name, "Emma Sevilla");

  const effectivePlanStartDate =
    liveStudent.planStartDate ||
    (isMatchingStudentName(liveStudent.name, "Camila Valentina Pastor Conco")
      ? "2026-09-10"
      : isEmma
      ? "2026-08-28"
      : undefined);

  const effectivePlanEndDate =
    liveStudent.planEndDate ||
    (isMatchingStudentName(liveStudent.name, "Camila Valentina Pastor Conco")
      ? "2026-10-09"
      : isEmma
      ? "2026-09-27"
      : undefined);

  const isFlexiblePackage =
    liveStudent.modality?.includes("Flexible") ||
    liveStudent.modality?.includes("Irregular") ||
    liveStudent.planType === "Paquete Flexible" ||
    liveStudent.planType === "Paquete Especial";

  const isDemoNivelacion =
    liveStudent.modality?.toLowerCase().includes("nivelaci") ||
    liveStudent.planType === "Demo Nivelación";

  const packageTotal = liveStudent.packageTotalSessions || (isDemoNivelacion ? 1 : 24);
  const isIntensivo = liveStudent.modality?.toLowerCase().includes("inten");
  const targetQuota = isFlexiblePackage ? packageTotal : isDemoNivelacion ? 1 : isIntensivo ? 4 : 8;

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

  // 🔄 Estado para Reprogramar Clase (cuando hay Falta / Inasistencia)
  const [rescheduleSession, setRescheduleSession] = useState<StudentSessionItem | null>(null);
  const [reschedDate, setReschedDate] = useState<string>("");
  const [reschedDay, setReschedDay] = useState<WeekDay>("Lun");
  const [reschedTime, setReschedTime] = useState<string>("16:00");
  const [reschedTeacher, setReschedTeacher] = useState<string>("");
  const [reschedRoom, setReschedRoom] = useState<string>("Sala A");
  const [reschedScope, setReschedScope] = useState<"only-this-week" | "all">("only-this-week");

  // ➕ Estado para Agregar Sesión / Adelanto
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [addSessionWeekIndex, setAddSessionWeekIndex] = useState<number>(0);
  const [addSessionDay, setAddSessionDay] = useState<WeekDay>("Mié");
  const [addSessionTime, setAddSessionTime] = useState<string>("16:00");
  const [addSessionTeacher, setAddSessionTeacher] = useState<string>("");
  const [addSessionRoom, setAddSessionRoom] = useState<string>("Sala B");
  const [addSessionReason, setAddSessionReason] = useState<string>("adelanto");

  // Semanas del mes seleccionado
  const monthWeeks = useMemo(() => {
    return getMonthWeeks(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Clases agendadas para este alumno (fusionando store central y perfil oficial en PostgreSQL)
  const studentLessons = useMemo(() => {
    const rawStore = schedule.filter(
      (l) => isMatchingStudentName(l.student, liveStudent.name) && l.status !== "cancelada"
    );
    const rawProfile = (liveStudent.scheduleLessons || []).filter(
      (l) => l.status !== "cancelada"
    );

    const mergedMap = new Map<string, ScheduledLesson>();
    rawStore.forEach((l) => mergedMap.set(l.id || `${l.day}-${l.time}-${l.dateStr || ""}`, l));
    rawProfile.forEach((l) => mergedMap.set(l.id || `${l.day}-${l.time}-${l.dateStr || ""}`, l));
    const raw = Array.from(mergedMap.values());

    // Deduplicar lecciones para garantizar que no haya clases repetidas en el mismo día y hora
    const deduped: ScheduledLesson[] = [];
    raw.forEach((l) => {
      const already = deduped.some((ex) => {
        // Si ambas lecciones tienen fecha exacta (dateStr) y son fechas distintas, NO son duplicados
        if (ex.dateStr && l.dateStr && ex.dateStr !== l.dateStr) return false;
        // Si una lección tiene fecha exacta puntual y la otra es recurrente semanal (sin dateStr), NO son duplicados
        if (Boolean(ex.dateStr) !== Boolean(l.dateStr)) return false;
        // Si ambas tienen la misma fecha exacta puntual, son duplicados si coinciden en hora
        if (ex.dateStr && l.dateStr && ex.dateStr === l.dateStr) {
          return ex.time === l.time;
        }
        // Para lecciones recurrentes semanales abiertas (sin dateStr):
        return (
          ex.day === l.day &&
          ex.time === l.time &&
          (ex.weekIndex === l.weekIndex || ex.weekIndex === undefined || l.weekIndex === undefined)
        );
      });
      if (!already) deduped.push(l);
    });
    return deduped;
  }, [schedule, liveStudent.name, liveStudent.scheduleLessons]);

  // 🎯 Generador Exacto del Ciclo Contractual (8 clases Regular / 4 clases Intensivo)
  // Comienza estrictamente en planStartDate y abarca su cuota completa del contrato
  const allCycleSessions: StudentSessionItem[] = useMemo(() => {
    const defaultStartStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
    const startStr = effectivePlanStartDate || defaultStartStr;
    const [sy, sm, sd] = startStr.split("-").map(Number);
    if (!sy || !sm || !sd) return [];

    const startDate = new Date(sy, sm - 1, sd);
    const rawCandidates: StudentSessionItem[] = [];
    const daysToEnd = effectivePlanEndDate
      ? Math.max(90, Math.ceil((new Date(effectivePlanEndDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 15)
      : (isFlexiblePackage ? 180 : 90);
    const maxDaysToScan = Math.max(isFlexiblePackage ? 180 : 90, daysToEnd);

    for (let offset = 0; offset < maxDaysToScan; offset++) {
      const cur = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + offset);
      const curY = cur.getFullYear();
      const curM = cur.getMonth();
      const curD = cur.getDate();
      const curDateStr = `${curY}-${String(curM + 1).padStart(2, "0")}-${String(curD).padStart(2, "0")}`;

      const jsDay = cur.getDay(); // 0 Dom, 1 Lun, 2 Mar, 3 Mié, 4 Jue, 5 Vie, 6 Sáb
      if (jsDay === 0) continue; // Los domingos no son lectivos
      const dayKey = WEEKDAYS_ORDER[jsDay - 1];

      // Si supera la fecha fin del plan, solo incluir si ya tiene asistencia evaluada o es recuperación
      const isBeyondEnd = effectivePlanEndDate ? curDateStr > effectivePlanEndDate : false;

      studentLessons.forEach((lesson) => {
        if (lesson.month !== undefined && lesson.month !== curM) return;
        if (lesson.year !== undefined && lesson.year !== curY) return;

        // A. Si la lección tiene fecha exacta fija (dateStr), SOLO emitir en esa fecha exacta
        if (lesson.dateStr) {
          if (lesson.dateStr !== curDateStr) return;
        } else {
          // B. Si es recurrente por día de semana, validar que coincida con el día
          if (lesson.day !== dayKey) return;
        }

        // C. Si la lección tiene fechas excluidas (reprogramada fuera de este día), omitir
        if (lesson.excludedDates && lesson.excludedDates.includes(curDateStr)) {
          return;
        }

        // D. Si tiene semana fija (weekIndex) y no dateStr, verificar semana dentro del mes de la fecha
        if (!lesson.dateStr && lesson.weekIndex !== undefined) {
          const curMonthWeeks = getMonthWeeks(curY, curM);
          const curWeekInMonth = curMonthWeeks.findIndex((w) => w.days.some((d) => d.dateStr === curDateStr));
          if (curWeekInMonth !== -1 && lesson.weekIndex !== curWeekInMonth) {
            return;
          }
        }

        // E. Si tiene semanas excluidas en el mes, omitir
        if (!lesson.dateStr && lesson.excludedWeeks && lesson.excludedWeeks.length > 0) {
          const curMonthWeeks = getMonthWeeks(curY, curM);
          const curWeekInMonth = curMonthWeeks.findIndex((w) => w.days.some((d) => d.dateStr === curDateStr));
          if (curWeekInMonth !== -1 && lesson.excludedWeeks.includes(curWeekInMonth)) {
            return;
          }
        }

        let currentStatus: StudentSessionItem["status"] = "pendiente";
        if (lesson.attendanceByDate && lesson.attendanceByDate[curDateStr]) {
          currentStatus = lesson.attendanceByDate[curDateStr]!;
        }

        if (isBeyondEnd && currentStatus === "pendiente" && !lesson.isMakeup) {
          return;
        }

        const [hh, mm] = (lesson.time || "16:00").split(":").map((v) => parseInt(v, 10));
        const endMinuteTotal = (hh || 16) * 60 + (mm || 0) + 45;
        const endH = String(Math.floor(endMinuteTotal / 60)).padStart(2, "0");
        const endM = String(endMinuteTotal % 60).padStart(2, "0");
        const timeEnd = `${endH}:${endM}`;

        const monthName = MONTHS_NAME[curM] || "";
        const fullDayName = WEEKDAY_FULL_NAMES[dayKey] || dayKey;

        rawCandidates.push({
          id: `${lesson.id}-${curDateStr}`,
          lessonId: lesson.id,
          sessionIndex: 0,
          weekIndex: Math.floor(offset / 7),
          weekLabel: `Semana ${Math.floor(offset / 7) + 1}`,
          dateStr: curDateStr,
          dayNum: curD,
          dayName: `${fullDayName} ${String(curD).padStart(2, "0")} de ${monthName} ${curY}`,
          dayShort: `${dayKey} ${String(curD).padStart(2, "0")} ${monthName.slice(0, 3)}`,
          dayKey,
          time: lesson.time,
          timeEnd,
          teacher: lesson.teacher || liveStudent.teacher || "Por asignar",
          room: lesson.room || liveStudent.room || "Sala A",
          instrument: lesson.instrument || liveStudent.instrument || "Música",
          isMakeup: !!lesson.isMakeup,
          recoveringLessonDate: lesson.recoveringLessonDate,
          status: currentStatus,
        });
      });
    }

    // 1. Orden cronológico
    rawCandidates.sort((a, b) => {
      const cmp = a.dateStr.localeCompare(b.dateStr);
      if (cmp !== 0) return cmp;
      return a.time.localeCompare(b.time);
    });

    // 2. Deduplicar por fecha y hora exactas
    const seenSlots = new Set<string>();
    const deduped: StudentSessionItem[] = [];
    rawCandidates.forEach((item) => {
      const slotKey = `${item.dateStr}-${item.time}`;
      if (!seenSlots.has(slotKey)) {
        seenSlots.add(slotKey);
        deduped.push(item);
      }
    });

    // 3. Respetar cuota contractual (8 para Regular, 4 para Intensivo)
    let finalSessions: StudentSessionItem[] = [];
    if (isFlexiblePackage) {
      finalSessions = deduped.slice(0, targetQuota);
    } else {
      if (deduped.length <= targetQuota) {
        finalSessions = deduped;
      } else {
        // Separar clases ya evaluadas (asistió, falta, tarde, justificada) de las pendientes
        const evaluated = deduped.filter((s) => s.status !== "pendiente");

        if (evaluated.length >= targetQuota) {
          // Si ya completó o superó su cuota con clases reales evaluadas, mostrar las evaluadas
          finalSessions = evaluated;
        } else {
          // Mantener todas las evaluadas y completar con las próximas pendientes hasta llegar exactamente a targetQuota
          const pending = deduped.filter((s) => s.status === "pendiente");
          const slotsNeeded = targetQuota - evaluated.length;
          const chosenPending = pending.slice(0, slotsNeeded);

          const combined = [...evaluated, ...chosenPending];
          combined.sort((a, b) => {
            const cmp = a.dateStr.localeCompare(b.dateStr);
            if (cmp !== 0) return cmp;
            return a.time.localeCompare(b.time);
          });
          finalSessions = combined;
        }
      }
    }

    // 4. Numerar secuencialmente (Sesión 1 a N)
    finalSessions.forEach((item, idx) => {
      item.sessionIndex = idx + 1;
    });

    return finalSessions;
  }, [
    effectivePlanStartDate,
    effectivePlanEndDate,
    studentLessons,
    targetQuota,
    liveStudent.teacher,
    liveStudent.room,
    liveStudent.instrument,
    isFlexiblePackage,
    selectedYear,
    selectedMonth,
  ]);

  // Sesiones finales a renderizar según vista activa (Ciclo Activo vs Mes Calendario)
  const sessions: StudentSessionItem[] = useMemo(() => {
    if (viewTab === "cycle") {
      return allCycleSessions;
    }

    // Modo Por Mes Calendario: Filtrar sesiones del ciclo correspondientes al mes/año
    return allCycleSessions.filter((s) => {
      const [y, m] = s.dateStr.split("-").map(Number);
      return y === selectedYear && (m - 1) === selectedMonth;
    });
  }, [viewTab, allCycleSessions, selectedYear, selectedMonth]);

  // Total de asistencias en todo el ciclo contractual
  const cycleAttendedTotal = useMemo(() => {
    return allCycleSessions.filter((s) => s.status === "presente" || s.status === "tarde").length;
  }, [allCycleSessions]);

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

  // Para alumnos con Paquete Flexible: conteo global de todas las clases consumidas en su bolsa histórica
  const totalPackageAttended = useMemo(() => {
    let count = 0;
    studentLessons.forEach((lesson) => {
      if (lesson.attendanceByDate) {
        Object.values(lesson.attendanceByDate).forEach((st) => {
          if (st === "presente" || st === "tarde") count++;
        });
      } else if (lesson.attendanceByWeek) {
        Object.values(lesson.attendanceByWeek).forEach((st) => {
          if (st === "presente" || st === "tarde") count++;
        });
      } else if (lesson.attendanceStatus === "presente" || lesson.attendanceStatus === "tarde") {
        count++;
      }
    });

    if (count === 0 && Array.isArray(liveStudent.recentAttendance) && liveStudent.recentAttendance.length > 0) {
      count = liveStudent.recentAttendance.filter((st) => st === "presente" || st === "tarde").length;
    }
    return count;
  }, [studentLessons, liveStudent.recentAttendance]);

  const remainingPackageClasses = Math.max(0, packageTotal - totalPackageAttended);
  const isPackageCompleted = isFlexiblePackage && totalPackageAttended >= packageTotal;

  // Acción: Cambiar estado individual de una sesión
  const handleSetStatus = (
    item: StudentSessionItem,
    newStatus: "presente" | "ausente" | "tarde" | "justificada" | "pendiente"
  ) => {
    setStudentSessionAttendance(liveStudent.name, item.lessonId, item.weekIndex, newStatus, "", item.dateStr);
    const labels = {
      presente: "🟢 Presente",
      ausente: "🔴 Falta / Ausente",
      tarde: "🟡 Tardanza",
      justificada: "🔵 Justificada (+1 Crédito)",
      pendiente: "⚪ Pendiente",
    };
    toast.success(`Sesión ${item.sessionIndex} actualizada: ${labels[newStatus]}`, {
      description: `${item.dayShort} · ${item.time} (${liveStudent.name})`,
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
      dateStr: s.dateStr,
    }));

    bulkRegularizeStudentAttendance(liveStudent.name, updates);
    toast.success(`Se regularizaron ${updates.length} sesiones como PRESENTES`, {
      description: `Alumno: ${liveStudent.name}`,
    });
  };

  // Acción: Copiar reporte para WhatsApp
  const handleCopyWhatsapp = () => {
    const isDemo = student.modality?.toLowerCase().includes("nivelaci") || student.planType === "Demo Nivelación";
    const isIntensivo = student.modality?.includes("Intensivo");
    const planLabel = isDemo
      ? "Demo Nivelación (1 clase / 45m)"
      : isIntensivo
      ? "Plan Intensivo (4 clases / 90m)"
      : "Plan Regular (8 clases / 45m)";
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

  // 🔄 Helper: Obtener fecha exacta en la misma semana para reprogramación
  const getTargetDateInSameWeek = (originDateStr: string, targetDay: WeekDay): string => {
    const [y, m, d] = originDateStr.split("-").map(Number);
    const origin = new Date(y, m - 1, d);
    const originJsDay = origin.getDay(); // 0 Dom, 1 Lun, 2 Mar, 3 Mié, 4 Jue, 5 Vie, 6 Sáb
    const dayOrder: Record<WeekDay, number> = { Lun: 1, Mar: 2, Mié: 3, Jue: 4, Vie: 5, Sáb: 6 };
    const targetJsDay = dayOrder[targetDay] || 1;
    const jsDayNormalized = originJsDay === 0 ? 7 : originJsDay;
    const diffDays = targetJsDay - jsDayNormalized;
    const targetDate = new Date(origin.getFullYear(), origin.getMonth(), origin.getDate() + diffDays);
    return `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}-${String(targetDate.getDate()).padStart(2, "0")}`;
  };

  // 🔄 Handlers de Reprogramación de Clases
  const handleDayChange = (newDay: WeekDay) => {
    setReschedDay(newDay);
    const slots = newDay === "Sáb" ? timeSlotsSaturday : timeSlotsWeekday;
    if (!slots.includes(reschedTime)) {
      setReschedTime(slots[0] || "16:00");
    }
    if (rescheduleSession?.dateStr) {
      setReschedDate(getTargetDateInSameWeek(rescheduleSession.dateStr, newDay));
    }
  };

  const handleOpenReschedule = (session: StudentSessionItem) => {
    setRescheduleSession(session);
    setReschedDay(session.dayKey);
    setReschedDate(session.dateStr);
    const slots = session.dayKey === "Sáb" ? timeSlotsSaturday : timeSlotsWeekday;
    setReschedTime(slots.includes(session.time) ? session.time : slots[0] || "16:00");
    setReschedTeacher(
      session.teacher && teachers.includes(session.teacher)
        ? session.teacher
        : liveStudent.teacher && teachers.includes(liveStudent.teacher)
        ? liveStudent.teacher
        : "Jeremy"
    );
    setReschedRoom(
      session.room && rooms.includes(session.room)
        ? session.room
        : liveStudent.room && rooms.includes(liveStudent.room)
        ? liveStudent.room
        : "Sala A"
    );
    setReschedScope("only-this-week");
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleSession) return;

    rescheduleLesson(
      rescheduleSession.lessonId,
      reschedDay,
      reschedTime,
      reschedScope,
      rescheduleSession.weekIndex,
      reschedTeacher,
      reschedRoom,
      rescheduleSession.dateStr,
      reschedDate || undefined
    );

    toast.success(`Clase reprogramada para ${reschedDate || reschedDay} a las ${reschedTime}`, {
      description:
        reschedScope === "only-this-week"
          ? `Se reprogramó la clase de la ${rescheduleSession.weekLabel} con Prof. ${reschedTeacher} (${reschedRoom}).`
          : `Se reprogramaron todas las clases del mes con Prof. ${reschedTeacher} (${reschedRoom}).`,
    });

    setRescheduleSession(null);
  };

  // 🔄 Acción: Extender Vigencia del Plan (+X días) ante inasistencias ("La clase no se pierde, se recupera")
  const handleExtendPlan = (daysToAdd: number = 7) => {
    const currentEndStr = effectivePlanEndDate || "2026-09-27";
    const [y, m, d] = currentEndStr.split("-").map(Number);
    const curEnd = new Date(y, m - 1, d);
    const newEnd = new Date(curEnd.getFullYear(), curEnd.getMonth(), curEnd.getDate() + daysToAdd);
    const newEndStr = `${newEnd.getFullYear()}-${String(newEnd.getMonth() + 1).padStart(2, "0")}-${String(newEnd.getDate()).padStart(2, "0")}`;

    updateStudentDetails(liveStudent.id, {
      planEndDate: newEndStr,
    });

    toast.success(`✓ Vigencia de plan extendida (+${daysToAdd} días)`, {
      description: `Nueva fecha fin: ${newEnd.getDate()} de ${MONTHS_NAME[newEnd.getMonth()]} ${newEnd.getFullYear()} para recuperar clases pendientes.`,
    });
  };

  // ➕ Acción Rápida: Agregar Clase de Corrido (+45 min contiguo)
  const handleAddConsecutiveClass = (session: StudentSessionItem) => {
    const nextTime = session.timeEnd || "16:45";
    const alreadyExists = schedule.some(
      (l) =>
        isMatchingStudentName(l.student, liveStudent.name) &&
        l.day === session.dayKey &&
        l.time === nextTime &&
        (l.dateStr === session.dateStr || (!l.dateStr && (l.weekIndex === undefined || l.weekIndex === session.weekIndex))) &&
        l.status !== "cancelada"
    );

    if (alreadyExists) {
      toast.info(`Ya existe una clase a las ${nextTime} para ${liveStudent.name} este día.`);
      return;
    }

    const [y, m] = session.dateStr.split("-").map(Number);
    const targetMonth = m !== undefined ? m - 1 : selectedMonth;
    const targetYear = y || selectedYear;

    addLessonToSchedule({
      student: liveStudent.name,
      teacher: session.teacher && teachers.includes(session.teacher) ? session.teacher : liveStudent.teacher || "Fernando",
      instrument: session.instrument || liveStudent.instrument || "Piano",
      day: session.dayKey,
      time: nextTime,
      room: session.room && rooms.includes(session.room) ? session.room : liveStudent.room || "Sala B",
      category: liveStudent.ageCategory || "JUNIOR",
      status: "programada",
      dateStr: session.dateStr,
      weekIndex: session.weekIndex,
      month: targetMonth,
      year: targetYear,
      isMakeup: false,
    });

    toast.success(`¡Clase de corrido (+45m) agregada con éxito!`, {
      description: `${session.dayShort} · ${nextTime} con Prof. ${session.teacher || liveStudent.teacher} (${session.room || "Sala B"})`,
    });
  };

  // ➕ Handlers para Modal de Agregar Sesión o Adelanto
  const handleOpenAddSession = () => {
    const curWeek = getCurrentWeekIndex(selectedYear, selectedMonth);
    setAddSessionWeekIndex(curWeek >= 0 && curWeek < monthWeeks.length ? curWeek : 0);
    setAddSessionDay("Mié");
    setAddSessionTime("16:00");
    setAddSessionTeacher(liveStudent.teacher && teachers.includes(liveStudent.teacher) ? liveStudent.teacher : "Fernando");
    setAddSessionRoom(liveStudent.room && rooms.includes(liveStudent.room) ? liveStudent.room : "Sala B");
    setAddSessionReason("adelanto");
    setIsAddSessionOpen(true);
  };

  const handleConfirmAddSession = () => {
    // Calcular la fecha exacta en el calendario para esta sesión
    const targetWeekObj = monthWeeks[addSessionWeekIndex];
    const targetDayObj = targetWeekObj?.days.find((d) => d.dayKey === addSessionDay);
    const computedDateStr = targetDayObj?.dateStr;

    addLessonToSchedule({
      student: liveStudent.name,
      teacher: addSessionTeacher,
      instrument: liveStudent.instrument || "Piano",
      day: addSessionDay,
      time: addSessionTime,
      room: addSessionRoom,
      category: liveStudent.ageCategory || "JUNIOR",
      status: "programada",
      dateStr: computedDateStr,
      weekIndex: addSessionWeekIndex,
      month: selectedMonth,
      year: selectedYear,
      isMakeup: addSessionReason === "recuperacion",
    });

    const labels: Record<string, string> = {
      adelanto: "Adelanto de clase",
      recuperacion: "Recuperación de inasistencia",
      adicional: "Clase adicional",
      regular: "Clase regular",
    };

    toast.success(`Sesión agregada: ${addSessionDay} a las ${addSessionTime}`, {
      description: `${computedDateStr ? `${computedDateStr} · ` : ""}Semana ${addSessionWeekIndex + 1} (${labels[addSessionReason] || "Sesión"}) · Prof. ${addSessionTeacher}`,
    });

    setIsAddSessionOpen(false);
  };

  const targetLessons = targetQuota;

  const content = (
    <div className="space-y-4">
      {/* Encabezado con datos del Alumno */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-card/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-foreground">{liveStudent.name}</h3>
            <Badge variant="outline" className="text-xs font-bold border-primary/30 text-primary bg-primary/10">
              {liveStudent.instrument}
            </Badge>
            {liveStudent.isReentry && (
              <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-0 text-[10px] font-black">
                🔄 Reingreso
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              Prof. <strong>{liveStudent.teacher || "Por asignar"}</strong>
            </span>
            <span className="flex items-center gap-1">
              <DoorOpen className="h-3.5 w-3.5 text-primary" />
              {liveStudent.room || "Sala A"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {isFlexiblePackage
                ? `🎒 Paquete Flexible (${packageTotal} clases · Vigencia por clases terminadas)`
                : isIntensivo
                ? "Plan Intensivo (4 clases)"
                : "Plan Regular (8 clases)"}
            </span>
          </p>
        </div>

        {/* Selector Dual de Modo de Vista (Ciclo Activo vs Mes Calendario) */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-muted/80 p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setViewTab("cycle")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                viewTab === "cycle"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Ver las 8 clases continuas de su ciclo contractual según fecha de inicio"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>🎯 Ciclo Activo ({targetQuota} clases)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewTab("calendar")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                viewTab === "calendar"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Filtrar clases divididas por mes calendario oficial"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>📅 Mes Calendario</span>
            </button>
          </div>

          {/* Selector de Mes (solo activo en vista calendario) */}
          {viewTab === "calendar" && (
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border">
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
          )}
        </div>
      </div>

      {/* Banner de Control de Bolsa de Clases y Vigencia por Clases Terminadas */}
      {isFlexiblePackage && (
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-purple-800 dark:text-purple-200">
                🎒 BOLSA DE HORAS: {totalPackageAttended} de {packageTotal} clases consumidas
              </span>
              {isPackageCompleted ? (
                <Badge className="bg-amber-500 text-white font-bold text-[10px]">
                  ✓ Paquete Completado ({packageTotal}/{packageTotal})
                </Badge>
              ) : (
                <Badge className="bg-purple-600 text-white font-bold text-[10px]">
                  {remainingPackageClasses} clases disponibles
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-purple-500/40 bg-background text-foreground font-mono text-xs">
                Inversión: S/ {(liveStudent.planPrice || 500).toFixed(2)}
              </Badge>
              {liveStudent.balance === 0 ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  ✓ Al Día
                </Badge>
              ) : (
                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  ⚠️ Deuda: S/ {(liveStudent.balance || 0).toFixed(2)}
                </Badge>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Progress
              value={Math.min(100, (totalPackageAttended / packageTotal) * 100)}
              className="h-2.5 bg-purple-950/20"
            />
            <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-0.5">
              <span>
                📌 <strong>Vigencia:</strong> Por clases terminadas (no caduca mensualmente · Activo hasta completar las {packageTotal} clases).
              </span>
              {liveStudent.teacherNote && (
                <span className="italic text-purple-700 dark:text-purple-300">
                  Motivo: "{liveStudent.teacherNote}"
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 💡 Banner Filosofía Vibra: "La clase no se pierde, se recupera" */}
      {liveStudent.makeupCredits > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5">
            <p className="text-xs font-black text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              💡 Filosofía Vibra: {liveStudent.makeupCredits} clase(s) pendiente(s) por recuperar
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">
              "La clase no se pierde, se recupera". Puedes reprogramar en la fila de la falta o extender la vigencia del plan para completar sus {targetLessons} clases.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExtendPlan(7)}
              className="h-8 text-xs font-bold border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 rounded-xl"
              title="Sumar 7 días a la fecha fin del plan para recuperar sesiones"
            >
              <CalendarSync className="h-3.5 w-3.5 mr-1" />
              +1 Sem. Vigencia
            </Button>
            <Button
              size="sm"
              onClick={handleOpenAddSession}
              className="h-8 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" />
              Programar Recuperación
            </Button>
          </div>
        </div>
      )}

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
            <span className="text-foreground">
              {viewTab === "cycle"
                ? "Cumplimiento del Ciclo Oficial:"
                : isFlexiblePackage
                ? "Avance en este Mes Seleccionado:"
                : "Cumplimiento del Plan del Mes:"}
            </span>
            <span className="font-mono text-primary font-black">
              {viewTab === "cycle"
                ? `${stats.asistidasTotal} de ${targetLessons} clases asistidas`
                : isFlexiblePackage
                ? `${stats.asistidasTotal} clases asistidas en ${MONTHS_NAME[selectedMonth]} (${totalPackageAttended}/${packageTotal} en bolsa total)`
                : `${stats.asistidasTotal} clases en ${MONTHS_NAME[selectedMonth]} (${cycleAttendedTotal} de ${targetLessons} en ciclo)`}
            </span>
          </div>
          <Progress
            value={
              isFlexiblePackage
                ? Math.min(100, (totalPackageAttended / packageTotal) * 100)
                : Math.min(100, (stats.asistidasTotal / targetLessons) * 100)
            }
            className="h-2"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isEditMode && stats.pendientes > 0 && (
            <Button
              size="sm"
              onClick={handleRegularizeAllPending}
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-xl shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              ⚡ Regularizar todo como Presente ({stats.pendientes})
            </Button>
          )}

          {!isEditMode ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-xs">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>Modo Consulta</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditMode(true)}
                className="h-6 px-2 text-[11px] font-black underline hover:bg-amber-500/20 text-amber-900 dark:text-amber-100 rounded-md"
              >
                ✏️ Desbloquear Edición
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <span>Modo Edición Rápida</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditMode(false)}
                className="h-6 px-2 text-[10px] font-semibold text-muted-foreground hover:bg-emerald-500/20 rounded-md"
              >
                🔒 Bloquear
              </Button>
            </div>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenAddSession}
            className="text-xs font-bold gap-1.5 border-primary/40 text-primary hover:bg-primary/10 rounded-xl"
            title="Agregar una sesión puntual, adelanto o clase extra al cronograma"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>➕ Agregar Sesión / Adelanto</span>
          </Button>

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
            {viewTab === "cycle"
              ? `Historial del Ciclo Activo (${sessions.length} de ${targetLessons} clases)`
              : `Historial Cronológico de Sesiones (${sessions.length} clases encontradas)`}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono font-bold">
            {viewTab === "cycle"
              ? `${effectivePlanStartDate || "Inicio"} ➔ ${effectivePlanEndDate || "Fin"} · Plan ${liveStudent.modality || "Regular"}`
              : `${MONTHS_NAME[selectedMonth]} ${selectedYear}`}
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
            <p>
              {viewTab === "cycle"
                ? "⚠️ No se encontraron clases programadas en el ciclo vigente para este alumno."
                : `⚠️ No se encontraron clases programadas en ${MONTHS_NAME[selectedMonth]} ${selectedYear}.`}
            </p>
            <p className="text-[11px]">
              {viewTab === "calendar" && effectivePlanStartDate && (
                <>Ciclo lectivo contratado: <strong>{effectivePlanStartDate}</strong> al <strong>{effectivePlanEndDate || "Fin"}</strong>. </>
              )}
              Verifica que el alumno tenga horarios asignados en la Agenda.
            </p>
            {viewTab === "calendar" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewTab("cycle")}
                className="mt-2 text-xs font-bold text-primary border-primary/40 rounded-xl"
              >
                🎯 Ver Ciclo Activo Completo
              </Button>
            )}
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
                        {item.recoveringLessonDate ? (
                          <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[9px] font-black border-0">
                            🔄 Reprogramada (orig. {item.recoveringLessonDate})
                          </Badge>
                        ) : item.isMakeup ? (
                          <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[9px] font-black border-0">
                            🔄 Recuperación
                          </Badge>
                        ) : null}
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

                    {/* 🔄 Botón directo de Reprogramar si tiene Falta, Tardanza o Justificada */}
                    {(item.status === "ausente" || item.status === "tarde" || item.status === "justificada") && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenReschedule(item)}
                        className="h-7 px-2.5 text-[11px] font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
                        title="Reprogramar esta clase para recuperar la sesión"
                      >
                        <CalendarSync className="h-3.5 w-3.5" />
                        <span>🔄 Reprogramar</span>
                      </Button>
                    )}

                    {/* ➕ Botón rápido de clase de corrido (+45m contiguo) */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddConsecutiveClass(item)}
                      className="h-7 px-2 text-[11px] font-black text-primary hover:bg-primary/10 rounded-xl border border-primary/30 flex items-center gap-1 transition-transform active:scale-95 shadow-2xs"
                      title="Agregar sesión de corrido (+45 min contiguo inmediatamente después)"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>+ De corrido (+45m)</span>
                    </Button>

                    {/* Botones de Actualización Inmediata en 1 Clic (Solo en modo edición) */}
                    {isEditMode ? (
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
                          title="Marcar como Falta / Ausente (Suma +1 Crédito para recuperar)"
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
                          title="Marcar como Tardanza (Se cuenta como asistida)"
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
                          title="Marcar como Justificada (Genera +1 Crédito de recuperación)"
                        >
                          🔵 Just
                        </Button>
                        {item.status !== "pendiente" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSetStatus(item, "pendiente")}
                            className="h-7 px-1.5 text-[11px] text-muted-foreground hover:text-foreground rounded-lg"
                            title="Restablecer asistencia a Pendiente / Sin marcar"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                        {(item.isMakeup || item.recoveringLessonDate) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              revertMakeupLesson(item.lessonId, item.recoveringLessonDate);
                              toast.success("Clase reprogramada revertida", {
                                description: item.recoveringLessonDate
                                  ? `La clase del ${item.recoveringLessonDate} vuelve al horario original (+1 crédito restaurado).`
                                  : "Sesión eliminada y sincronizada.",
                              });
                            }}
                            className="h-7 px-1.5 text-[11px] text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 rounded-lg"
                            title="Eliminar esta clase reprogramada y restaurar original"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditMode(true)}
                        className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground italic flex items-center gap-1 font-medium bg-muted/40 hover:bg-muted/70 rounded-lg border border-border/50"
                        title="Haz clic para activar edición y registrar asistencia"
                      >
                        <Lock className="h-3 w-3 text-muted-foreground/60" />
                        <span>Consulta (Clic para editar)</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🔄 MODAL DE REPROGRAMACIÓN DE CLASE */}
      <Dialog
        open={Boolean(rescheduleSession)}
        onOpenChange={(open) => !open && setRescheduleSession(null)}
      >
        <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-card border-border z-[70]">
          <DialogHeader className="pb-2 border-b border-border">
            <DialogTitle className="text-base font-black flex items-center gap-2 text-foreground">
              <CalendarSync className="h-5 w-5 text-amber-500" />
              Reprogramar Clase
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Selecciona el nuevo día, hora y profesor para la clase de <strong>{liveStudent.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          {rescheduleSession && (
            <div className="space-y-4 py-2">
              {/* Resumen de la sesión original que tuvo falta */}
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/25 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-red-700 dark:text-red-300">
                  <span>Sesión {rescheduleSession.sessionIndex} (Inasistencia)</span>
                  <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-black border-0">
                    🔴 Falta registrada
                  </Badge>
                </div>
                <p className="text-xs text-foreground font-medium">
                  {rescheduleSession.dayName} · {rescheduleSession.time} - {rescheduleSession.timeEnd}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Prof. {rescheduleSession.teacher} · {rescheduleSession.room} ({rescheduleSession.weekLabel})
                </p>
              </div>

              {/* Selector de Fecha Específica */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Fecha Específica a Reprogramar</label>
                <Input
                  type="date"
                  value={reschedDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setReschedDate(val);
                    if (val) {
                      const [y, m, d] = val.split("-").map(Number);
                      const dt = new Date(y, m - 1, d);
                      const jsDay = dt.getDay();
                      if (jsDay >= 1 && jsDay <= 6) {
                        const newD = WEEKDAYS_ORDER[jsDay - 1];
                        setReschedDay(newD);
                      }
                    }
                  }}
                  className="h-9 rounded-xl text-xs bg-background"
                />
              </div>

              {/* Formulario de Nueva Fecha y Horario */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Nuevo Día</label>
                  <Select
                    value={reschedDay}
                    onValueChange={(v) => handleDayChange(v as WeekDay)}
                  >
                    <SelectTrigger className="h-9 rounded-xl text-xs font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[80]">
                      {weekDays.map((d) => (
                        <SelectItem key={d} value={d}>
                          {WEEKDAY_FULL_NAMES[d] || d} ({d})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Nueva Hora</label>
                  <Select
                    value={reschedTime}
                    onValueChange={(v) => setReschedTime(v)}
                  >
                    <SelectTrigger className="h-9 rounded-xl text-xs font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-56 z-[80]">
                      {(reschedDay === "Sáb" ? timeSlotsSaturday : timeSlotsWeekday).map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Profesor Asignado</label>
                  <Select
                    value={reschedTeacher}
                    onValueChange={(v) => setReschedTeacher(v)}
                  >
                    <SelectTrigger className="h-9 rounded-xl text-xs font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[80]">
                      {teachers.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Sala / Ambiente</label>
                  <Select
                    value={reschedRoom}
                    onValueChange={(v) => setReschedRoom(v)}
                  >
                    <SelectTrigger className="h-9 rounded-xl text-xs font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[80]">
                      {rooms.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Alcance de la reprogramación */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-foreground">Alcance del cambio</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReschedScope("only-this-week")}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      reschedScope === "only-this-week"
                        ? "border-primary bg-primary/10 font-bold text-foreground ring-1 ring-primary"
                        : "border-border bg-card text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    <p className="font-bold">Solo esta sesión</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Aplica a {rescheduleSession.weekLabel}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReschedScope("all")}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      reschedScope === "all"
                        ? "border-primary bg-primary/10 font-bold text-foreground ring-1 ring-primary"
                        : "border-border bg-card text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    <p className="font-bold">Todo el mes</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Cambio permanente de horario
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRescheduleSession(null)}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmReschedule}
              className="rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
            >
              <CalendarSync className="h-3.5 w-3.5" />
              Confirmar Reprogramación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ➕ MODAL DE AGREGAR SESIÓN O ADELANTO */}
      <Dialog open={isAddSessionOpen} onOpenChange={setIsAddSessionOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-card border-border z-[70]">
          <DialogHeader className="pb-2 border-b border-border">
            <DialogTitle className="text-base font-black flex items-center gap-2 text-foreground">
              <PlusCircle className="h-5 w-5 text-primary" />
              Agregar Sesión o Adelanto de Clase
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Programa una clase puntual (adelanto por inasistencia o clase adicional) para <strong>{liveStudent.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Selector de Semana */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Semana del Mes ({MONTHS_NAME[selectedMonth]} {selectedYear})
              </label>
              <Select
                value={String(addSessionWeekIndex)}
                onValueChange={(v) => setAddSessionWeekIndex(parseInt(v, 10))}
              >
                <SelectTrigger className="h-9 rounded-xl text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[80]">
                  {monthWeeks.map((w) => (
                    <SelectItem key={w.weekIndex} value={String(w.weekIndex)}>
                      {w.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Día y Hora */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Día de la Semana</label>
                <Select
                  value={addSessionDay}
                  onValueChange={(v) => {
                    const day = v as WeekDay;
                    setAddSessionDay(day);
                    const slots = day === "Sáb" ? timeSlotsSaturday : timeSlotsWeekday;
                    if (!slots.includes(addSessionTime)) {
                      setAddSessionTime(slots[0] || "16:00");
                    }
                  }}
                >
                  <SelectTrigger className="h-9 rounded-xl text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[80]">
                    {weekDays.map((d) => (
                      <SelectItem key={d} value={d}>
                        {WEEKDAY_FULL_NAMES[d] || d} ({d})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Hora de Inicio</label>
                <Select
                  value={addSessionTime}
                  onValueChange={setAddSessionTime}
                >
                  <SelectTrigger className="h-9 rounded-xl text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-56 z-[80]">
                    {(addSessionDay === "Sáb" ? timeSlotsSaturday : timeSlotsWeekday).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Profesor y Sala */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Profesor</label>
                <Select
                  value={addSessionTeacher}
                  onValueChange={setAddSessionTeacher}
                >
                  <SelectTrigger className="h-9 rounded-xl text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[80]">
                    {teachers.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Sala</label>
                <Select
                  value={addSessionRoom}
                  onValueChange={setAddSessionRoom}
                >
                  <SelectTrigger className="h-9 rounded-xl text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[80]">
                    {rooms.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Motivo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Tipo / Motivo de la Sesión</label>
              <Select
                value={addSessionReason}
                onValueChange={setAddSessionReason}
              >
                <SelectTrigger className="h-9 rounded-xl text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[80]">
                  <SelectItem value="adelanto">⏩ Adelanto de clase (por inasistencia programada)</SelectItem>
                  <SelectItem value="recuperacion">🔄 Recuperación de inasistencia previa</SelectItem>
                  <SelectItem value="adicional">➕ Clase adicional</SelectItem>
                  <SelectItem value="regular">📅 Sesión regular de horario</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddSessionOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmAddSession}
              className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Guardar Sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
