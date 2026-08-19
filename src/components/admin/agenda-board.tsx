import { useMemo, useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DoorOpen,
  GraduationCap,
  History,
  Search,
  FileSpreadsheet,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  HelpCircle,
  Lock,
  KeyRound,
  ShieldAlert,
  Settings2,
  Volume2,
  Sliders,
  PlusCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

// Función del Timbre Acústico de Fin/Inicio de Clase (nuevo timbre alto pitch)
export function playClassChime() {
  try {
    const audio = new Audio("/school bell.mp3?v=highpitch");
    audio.volume = 0.9;
    audio.play().catch((err) => {
      console.warn("Reproduciendo con Web Audio API fallback:", err);
      playSyntheticChime();
    });
  } catch (err) {
    playSyntheticChime();
  }
}

function playSyntheticChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Tono 1 (880 Hz - La5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.8);

    // Tono 2 (1320 Hz - Mi6 campana armónica)
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1320, ctx.currentTime);
      gain2.gain.setValueAtTime(0.4, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 1.2);
    }, 250);
  } catch (err) {
    console.error("Error en timbre sintético:", err);
  }
}
import { useAppStore, type ScheduledLesson, type WeekDay } from "@/store/app-store";
import { rooms, teachers, musicalInstruments, timeSlots, weekDays, timeSlotsWeekday, timeSlotsSaturday } from "@/store/admin-seeds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const ALL = "todos";

const instrumentTone: Record<string, string> = {
  "Guitarra clásica": "border-primary/40 bg-primary/10 text-primary",
  "Guitarra eléctrica": "border-primary/40 bg-primary/10 text-primary",
  Piano: "border-accent-foreground/25 bg-accent text-accent-foreground",
  Violín: "border-chart-3/40 bg-chart-3/15 text-foreground",
  Batería: "border-chart-4/40 bg-chart-4/15 text-foreground",
  Canto: "border-chart-2/40 bg-chart-2/15 text-foreground",
};

// Colores exactos del Excel de Nayeli
export const categoryStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
  JUNIOR: { bg: "bg-[#FFF2B2]", text: "text-[#8A6D00]", border: "border-[#FFE57F]", label: "CATEGORÍA JUNIOR (7 a 12)" },
  JUVENIL: { bg: "bg-[#4CAF50]", text: "text-white font-bold", border: "border-[#388E3C]", label: "CATEGORÍA JUVENIL (13 a 17)" },
  ADULTO: { bg: "bg-[#9E9E9E]", text: "text-white font-bold", border: "border-[#757575]", label: "CATEGORÍA ADULTO (18 a +)" },
  INFANTIL: { bg: "bg-[#B388FF]", text: "text-white font-bold", border: "border-[#7C4DFF]", label: "CATEGORÍA INFANTIL (5 y 6)" },
  RECUPERACION: { bg: "bg-[#FF8A80]", text: "text-[#B71C1C] font-bold", border: "border-[#FF5252]", label: "RECUPERACIÓN DE CLASES" },
  PERSONALIZADA: { bg: "bg-[#B2EBF2]", text: "text-[#006064] font-bold", border: "border-[#80DEEA]", label: "CLASES PERSONALIZADAS" },
};

function toneFor(instrument: string) {
  return instrumentTone[instrument] ?? "border-border bg-muted text-foreground";
}

export function AgendaBoard() {
  const activeRole = useAppStore((s) => s.activeRole);
  const schedule = useAppStore((s) => s.schedule);
  const adminStudents = useAppStore((s) => s.adminStudents);
  const rescheduleLesson = useAppStore((s) => s.rescheduleLesson);
  const cancelLesson = useAppStore((s) => s.cancelLesson);
  const removeLessonFromSchedule = useAppStore((s) => s.removeLessonFromSchedule);
  const importScheduleFromCSV = useAppStore((s) => s.importScheduleFromCSV);
  const clearSchedule = useAppStore((s) => s.clearSchedule);

  const [viewMode, setViewMode] = useState<"semanal" | "diario" | "excel">("excel");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // Lunes por defecto
  const [selectedPairIndex, setSelectedPairIndex] = useState(0); // Par 0: Lunes - Miércoles por defecto
  const [teacher, setTeacher] = useState(ALL);
  const [room, setRoom] = useState(ALL);
  const [instrument, setInstrument] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [dayGroup, setDayGroup] = useState(ALL);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [moveDay, setMoveDay] = useState<WeekDay>("Lun");
  const [moveTime, setMoveTime] = useState(timeSlots[0]!);
  const [moveScope, setMoveScope] = useState<"only-this-week" | "all">("only-this-week");

  // Estado del Selector de Fecha (Meses / Años / Histórico / Semanas)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 7, 12)); // Agosto 2026
  const [currentWeekIndex, setCurrentWeekIndex] = useState(1); // Semana 2 (Semana activa de Agosto 2026)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  // Estado de Importación Masiva CSV para Nayeli
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvPreview, setCsvPreview] = useState<ScheduledLesson[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chimeSettings = useAppStore((s) => s.chimeSettings);
  const setChimeSettings = useAppStore((s) => s.setChimeSettings);
  const playOfficialChime = useAppStore((s) => s.playOfficialChime);
  const markLessonAttendance = useAppStore((s) => s.markLessonAttendance);
  const scheduleMakeupLesson = useAppStore((s) => s.scheduleMakeupLesson);
  const [isChimeSettingsOpen, setIsChimeSettingsOpen] = useState(false);

  // Sub-modo de Vista Didáctica: "pareado" (2x2) | "individual" (1x1)
  const [excelSubMode, setExcelSubMode] = useState<"pareado" | "individual">("pareado");
  const [excelSingleDayIndex, setExcelSingleDayIndex] = useState(0); // 0=Lun, 1=Mar, 2=Mié, 3=Jue, 4=Vie, 5=Sáb

  // Estados de Programar Nueva Clase individual
  const addLessonToSchedule = useAppStore((s) => s.addLessonToSchedule);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [newLessonStudent, setNewLessonStudent] = useState("");
  const [newLessonTeacher, setNewLessonTeacher] = useState("");
  const [newLessonInstrument, setNewLessonInstrument] = useState(musicalInstruments[0] || "Piano");
  const [newLessonDay, setNewLessonDay] = useState<WeekDay>("Lun");
  const [newLessonTime, setNewLessonTime] = useState(timeSlotsWeekday[0] || "16:00");
  const [newLessonRoom, setNewLessonRoom] = useState(rooms[0] || "Sala A");
  const [newLessonCategory, setNewLessonCategory] = useState<AgeCategory>("JUNIOR");

  // Estados de Programar Recuperación de Clase para Alumnos
  const [isMakeupModalOpen, setIsMakeupModalOpen] = useState(false);
  const [makeupStudent, setMakeupStudent] = useState("");
  const [makeupTeacher, setMakeupTeacher] = useState("");
  const [makeupInstrument, setMakeupInstrument] = useState("Piano");
  const [makeupDay, setMakeupDay] = useState<WeekDay>("Lun");
  const [makeupTime, setMakeupTime] = useState("16:00");
  const [makeupRoom, setMakeupRoom] = useState("Sala A");
  const [makeupCategory, setMakeupCategory] = useState<AgeCategory>("JUNIOR");
  const [makeupOriginalDate, setMakeupOriginalDate] = useState("");

  // Estados de Vaciar Horario Seguro (Exclusivo Dueña con 2 filtros: Contraseña + Reconfirmación GitHub Style)
  const [isClearSecureOpen, setIsClearSecureOpen] = useState(false);
  const [ownerPassword, setOwnerPassword] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const EXPECTED_PHRASE = "VACIAR HORARIO VIBRA";

  // Estados de Solicitud de Eliminación de Clase para Secretaría Nayeli
  const createDeletionRequest = useAppStore((s) => s.createDeletionRequest);
  const [isDeleteReqLessonOpen, setIsDeleteReqLessonOpen] = useState(false);
  const [deleteLessonReason, setDeleteLessonReason] = useState("");

  // Monitoreo en segundo plano del Timbre Automático por Horarios de Vibra Music
  useEffect(() => {
    if (!chimeSettings?.autoPlayEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const dayOfWeek = now.getDay(); // 0: Dom, 1: Lun, ..., 6: Sáb

      // De Lunes a Viernes: Turno Tarde
      // Horarios inicio/fin: 16:00, 16:45, 17:30, 18:15, 19:00, 19:45
      const weekdayTimes = ["16:00", "16:45", "17:30", "18:15", "19:00", "19:45"];

      // Sábados: Turno Mañana
      // Horarios inicio/fin: 09:00, 09:45, 10:30, 11:15, 12:00, 12:45, 13:30
      const saturdayTimes = ["09:00", "09:45", "10:30", "11:15", "12:00", "12:45", "13:30"];

      const targetTimes = dayOfWeek === 6 ? saturdayTimes : (dayOfWeek >= 1 && dayOfWeek <= 5 ? weekdayTimes : []);

      if (targetTimes.includes(currentTimeStr) && now.getSeconds() === 0) {
        playOfficialChime();
        toast.info("🔔 Timbre Automático", {
          description: `Cambio de bloque horario (${currentTimeStr}) emitido.`,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [chimeSettings, playOfficialChime]);

  const monthsName = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const currentDayName = weekDays[selectedDayIndex] ?? "Lun";

  // Lista de instrumentos: catálogo oficial completo + los que vengan en el CSV
  const instruments = useMemo(() => {
    const fromSchedule = schedule.map((l) => l.instrument).filter(Boolean);
    const combined = Array.from(new Set([...musicalInstruments, ...fromSchedule]));
    return combined.sort();
  }, [schedule]);

  // Lista de profesores: catálogo oficial + los que vengan en el horario/alumnos
  const availableTeachers = useMemo(() => {
    const fromSchedule = schedule.map((l) => l.teacher).filter(Boolean);
    const fromStudents = adminStudents.map((s) => s.teacher).filter(Boolean);
    const combined = Array.from(new Set([...teachers, ...fromSchedule, ...fromStudents]));
    return combined.sort();
  }, [schedule, adminStudents]);

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth(); // 0 = Enero, 7 = Agosto
  const selectedYearMonthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;

  // Filtrado reactivo estricto para eliminar cruces o datos no solicitados (Bugfix Crítico)
  const visible = useMemo(
    () =>
      schedule.filter(
        (l) => {
          // 1. Buscar si el alumno tiene un rango de vigencia específico en su ficha
          const studentProfile = adminStudents.find(
            (st) => st.name.toLowerCase() === l.student.toLowerCase(),
          );

          if (studentProfile?.planStartMonth && studentProfile?.planEndMonth) {
            const isWithinPlan =
              selectedYearMonthStr >= studentProfile.planStartMonth &&
              selectedYearMonthStr <= studentProfile.planEndMonth;

            if (!isWithinPlan) return false;
          } else {
            // Por defecto si no tiene rango configurado: solo ciclo activo de Agosto 2026
            const lYear = l.year ?? 2026;
            const lMonth = l.month ?? 7;
            const matchesDate = lYear === selectedYear && lMonth === selectedMonth;
            if (!matchesDate) return false;
          }

          // 2. Filtro de semana específica (si aplica a semana individual o al mes completo)
          if (l.weekIndex !== undefined && l.weekIndex !== currentWeekIndex) {
            return false;
          }

          // 3. Filtro por Profesor
          if (teacher !== ALL) {
            const teacherMatch = l.teacher.toLowerCase().includes(teacher.toLowerCase());
            if (!teacherMatch) return false;
          }

          // 4. Filtro por Sala (Sala A, B, C, D)
          if (room !== ALL) {
            const roomMatch = l.room.toLowerCase().trim() === room.toLowerCase().trim();
            if (!roomMatch) return false;
          }

          // 5. Filtro por Instrumento
          if (instrument !== ALL) {
            const instMatch = l.instrument.toLowerCase().trim() === instrument.toLowerCase().trim();
            if (!instMatch) return false;
          }

          // 6. Filtro por Categoría de Edad
          if (category !== ALL) {
            if (l.category !== category) return false;
          }

          // 7. Filtro por Modalidad de Días (L-M, M-J, Viernes Intensivo, Sábado Intensivo, Personalizado)
          if (dayGroup !== ALL) {
            if (dayGroup === "L-M" && l.day !== "Lun" && l.day !== "Mié") return false;
            if (dayGroup === "M-J" && l.day !== "Mar" && l.day !== "Jue") return false;
            if (dayGroup === "Vie" && l.day !== "Vie") return false;
            if (dayGroup === "Sáb" && l.day !== "Sáb") return false;
            if (dayGroup === "Personalizado" && l.category !== "PERSONALIZADA") return false;
          }

          return true;
        },
      ),
    [schedule, adminStudents, teacher, room, instrument, category, dayGroup, currentWeekIndex, selectedYear, selectedMonth, selectedYearMonthStr],
  );

  // Clases del día seleccionado para la vista diaria (swipe)
  const dayLessons = useMemo(
    () => visible.filter((l) => l.day === currentDayName && l.status !== "cancelada"),
    [visible, currentDayName],
  );

  // Conflictos reales:
  // 1. Docentes distintos intentando usar la misma sala a la misma hora.
  // 2. Mismo docente asignado en dos salas distintas a la misma hora.
  // (Nota: Varios alumnos con el mismo docente en la misma sala es una clase grupal legítima).
  const conflictIds = useMemo(() => {
    const ids = new Set<string>();
    const byRoomTime = new Map<string, ScheduledLesson[]>();
    const byTeacherTime = new Map<string, ScheduledLesson[]>();

    for (const l of schedule) {
      if (l.status === "cancelada") continue;

      // Agrupar por sala y hora
      const rKey = `${l.day}|${l.time}|${l.room}`;
      const rList = byRoomTime.get(rKey) ?? [];
      rList.push(l);
      byRoomTime.set(rKey, rList);

      // Agrupar por profesor y hora
      const tKey = `${l.day}|${l.time}|${l.teacher.toLowerCase().replace(/\s*\(.*?\)/, "").trim()}`;
      const tList = byTeacherTime.get(tKey) ?? [];
      tList.push(l);
      byTeacherTime.set(tKey, tList);
    }

    // 1. Verificar cruce en sala (si hay más de 1 profesor diferente en la misma sala)
    for (const list of byRoomTime.values()) {
      const distinctTeachers = new Set(list.map((l) => l.teacher.toLowerCase().replace(/\s*\(.*?\)/, "").trim()));
      if (distinctTeachers.size > 1) {
        list.forEach((l) => ids.add(l.id));
      }
    }

    // 2. Verificar cruce de profesor (si el mismo profesor está en salas diferentes a la misma hora)
    for (const list of byTeacherTime.values()) {
      const distinctRooms = new Set(list.map((l) => l.room));
      if (distinctRooms.size > 1) {
        list.forEach((l) => ids.add(l.id));
      }
    }

    return ids;
  }, [schedule]);

  const active = schedule.filter((l) => l.status !== "cancelada");
  const capacity = weekDays.length * timeSlots.length * rooms.length;
  const occupancy = Math.round((active.length / capacity) * 100);
  const selected = schedule.find((l) => l.id === selectedId) ?? null;

  function openLesson(lesson: ScheduledLesson) {
    setSelectedId(lesson.id);
    setMoveDay(lesson.day);
    setMoveTime(lesson.time);
  }

  const handleNextDay = () => {
    setSelectedDayIndex((prev) => (prev + 1) % weekDays.length);
  };

  const handlePrevDay = () => {
    setSelectedDayIndex((prev) => (prev - 1 + weekDays.length) % weekDays.length);
  };

  // Parser inteligente de CSV/Excel para Nayeli
  function parseCsvContent(text: string) {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setCsvPreview([]);
      setCsvErrors(["El archivo o texto está vacío."]);
      return;
    }

    const errors: string[] = [];
    const parsed: ScheduledLesson[] = [];
    const validDays: WeekDay[] = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const validRooms = ["Sala A", "Sala B", "Sala C", "Sala D"];

    // Detectar si la primera línea es cabecera
    const firstLineLower = lines[0]!.toLowerCase();
    const startIndex =
      firstLineLower.includes("alumno") ||
      firstLineLower.includes("dia") ||
      firstLineLower.includes("hora")
        ? 1
        : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i]!;
      // Soportar coma (,) o punto y coma (;) como separador de Excel
      const cols = line.includes(";") ? line.split(";") : line.split(",");
      const cleanCols = cols.map((c) => c.trim().replace(/^["']|["']$/g, ""));

      if (cleanCols.length < 5) {
        errors.push(`Línea ${i + 1}: Faltan columnas (se esperan al menos 5: Alumno, Día, Hora, Sala, Profesor).`);
        continue;
      }

      const [student, dayRaw, timeRaw, roomRaw, teacherRaw, instrumentRaw, categoryRaw] = cleanCols;

      if (!student) {
        errors.push(`Línea ${i + 1}: Nombre de alumno obligatorio.`);
        continue;
      }

      // Normalizar día
      let day: WeekDay = "Lun";
      const dLower = (dayRaw || "").toLowerCase();
      if (dLower.startsWith("lun")) day = "Lun";
      else if (dLower.startsWith("mar")) day = "Mar";
      else if (dLower.startsWith("mi") || dLower.startsWith("mie")) day = "Mié";
      else if (dLower.startsWith("jue")) day = "Jue";
      else if (dLower.startsWith("vie")) day = "Vie";
      else if (dLower.startsWith("s") || dLower.startsWith("sab")) day = "Sáb";
      else {
        errors.push(`Línea ${i + 1}: Día inválido '${dayRaw}' (Use Lun, Mar, Mié, Jue, Vie o Sáb).`);
      }

      // Normalizar hora (ej. 16:00, 16:45, 17:30, 09:00, etc.)
      const time = (timeRaw || "16:00").trim();

      // Normalizar sala (Sala A, B, C, D)
      let room = roomRaw || "Sala A";
      if (!validRooms.includes(room)) {
        const rLower = room.toLowerCase();
        if (rLower.includes("a") || rLower.includes("1")) room = "Sala A";
        else if (rLower.includes("b") || rLower.includes("2")) room = "Sala B";
        else if (rLower.includes("c") || rLower.includes("3")) room = "Sala C";
        else if (rLower.includes("d") || rLower.includes("4") || rLower.includes("5")) room = "Sala D";
        else room = "Sala A";
      }

      const teacher = teacherRaw || "Prof. por Asignar";
      const instrument = instrumentRaw || "Piano";
      const category = categoryRaw || "JUNIOR";

      parsed.push({
        id: `csv-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        day,
        time,
        room,
        student,
        teacher,
        instrument,
        category,
        status: "confirmada",
      });
    }

    setCsvPreview(parsed);
    setCsvErrors(errors);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      parseCsvContent(content);
    };
    reader.readAsText(file, "UTF-8");
  }

  function handleApplyCsv(mode: "replace" | "append") {
    if (csvPreview.length === 0) {
      toast.error("No hay clases válidas para importar.");
      return;
    }

    if (mode === "replace") {
      importScheduleFromCSV(csvPreview);
      toast.success("✅ Horario reemplazado con éxito", {
        description: `Se han cargado ${csvPreview.length} clases desde el archivo CSV.`,
      });
    } else {
      importScheduleFromCSV([...schedule, ...csvPreview]);
      toast.success("✅ Clases añadidas al horario", {
        description: `Se sumaron ${csvPreview.length} clases al horario existente.`,
      });
    }

    setIsCsvModalOpen(false);
    setCsvText("");
    setCsvPreview([]);
    setCsvErrors([]);
  }

  function downloadCsvTemplate() {
    const header = "Alumno,Dia,Hora,Sala,Profesor,Instrumento,Categoria\n";
    const samples = [
      "Valentina Ríos,Lun,16:00,Sala A,Prof. Jeremy,Batería,JUNIOR",
      "Lucas Medina,Lun,16:45,Sala B,Prof. Fernando,Piano,INFANTIL",
      "Camila Morales,Mar,17:30,Sala C,Prof. Nathaly,Canto,JUVENIL",
      "Mateo Salazar,Sáb,09:00,Sala A,Prof. Jeremy,Guitarra clásica,ADULTO",
    ].join("\n");

    const blob = new Blob([header + samples], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_horario_vibra_music.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("📥 Plantilla CSV descargada", {
      description: "Ábrela en Excel, llena los datos de los alumnos y súbela aquí.",
    });
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryTile icon={GraduationCap} label="Clases programadas" value={`${active.length}`} />
        <SummaryTile
          icon={DoorOpen}
          label="Ocupación de salas"
          value={`${occupancy}%`}
          hint={`${capacity - active.length} franjas libres`}
        />
        <SummaryTile
          icon={AlertTriangle}
          label="Conflictos detectados"
          value={`${conflictIds.size / 2 || 0}`}
          hint="Mismo profesor o sala a la vez"
          alert={conflictIds.size > 0}
        />
      </div>

      {/* Switch de Vista & Filtros & Popover de Fecha */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-muted p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewMode("excel")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                viewMode === "excel"
                  ? "bg-success text-success-foreground shadow-xs ring-2 ring-success/30"
                  : "text-muted-foreground hover:text-foreground font-bold"
              }`}
            >
              📊 Vista Didáctica (Excel Nayeli)
            </button>
            <button
              onClick={() => setViewMode("diario")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "diario"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📱 Vista por Día
            </button>
            <button
              onClick={() => setViewMode("semanal")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "semanal"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🗓️ Rejilla Semanal
            </button>
          </div>

          {/* Botón de Calendario Pop-Up (Exploración Mes a Mes) y Navegador de Semanas */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDatePickerOpen((v) => !v)}
                className="gap-1.5 font-bold text-xs text-primary bg-primary/10 hover:bg-primary/20 h-8 px-2.5 rounded-lg"
              >
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {monthsName[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </Button>

              {/* Pop-Up Modal Calendario de Meses y Años */}
              {isDatePickerOpen && (
                <div className="absolute left-0 top-10 z-50 w-72 rounded-2xl border border-border bg-card p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <button
                      onClick={() =>
                        setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
                      }
                      className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-bold text-sm">
                      {monthsName[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </span>
                    <button
                      onClick={() =>
                        setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
                      }
                      className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Rejilla de Meses */}
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {monthsName.map((m, idx) => (
                      <button
                        key={m}
                        onClick={() => {
                          const newYear = selectedDate.getFullYear();
                          setSelectedDate(new Date(newYear, idx, 1));
                          setCurrentWeekIndex(0);
                          setIsDatePickerOpen(false);
                          toast.success(`Programación actualizada a ${m} ${newYear}`);
                        }}
                        className={`p-2 rounded-xl text-center font-semibold transition-all ${
                          selectedDate.getMonth() === idx
                            ? "bg-primary text-primary-foreground font-bold shadow-sm"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {m.slice(0, 3)}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t text-center">
                    <button
                      onClick={() => {
                        setSelectedDate(new Date(2026, 7, 12));
                        setCurrentWeekIndex(1);
                        setIsDatePickerOpen(false);
                      }}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Ir al mes actual (Agosto 2026)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Selector de Semanas del Mes */}
            <div className="flex items-center gap-1 pl-1 border-l border-border/80 text-xs">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentWeekIndex((w) => Math.max(0, w - 1))}
                disabled={currentWeekIndex === 0}
                className="h-7 w-7 rounded-md"
                title="Semana anterior"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="font-bold text-[11px] px-1.5 py-0.5 rounded bg-background text-foreground shadow-2xs whitespace-nowrap">
                Semana {currentWeekIndex + 1} de 4
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentWeekIndex((w) => Math.min(3, w + 1))}
                disabled={currentWeekIndex === 3}
                className="h-7 w-7 rounded-md"
                title="Semana siguiente"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Botón de Asignar / Programar Nueva Clase en Horario */}
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsAddLessonOpen(true)}
            className="gap-1.5 font-bold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4" />
            + Programar Clase
          </Button>

          {/* Botón de Programar Clase de Recuperación */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const studentWithCredit = adminStudents.find((st) => st.makeupCredits > 0) || adminStudents[0];
              if (studentWithCredit) {
                setMakeupStudent(studentWithCredit.name);
                setMakeupTeacher(studentWithCredit.teacher || availableTeachers[0] || "Jeremy");
                setMakeupInstrument(studentWithCredit.instrument || "Piano");
                setMakeupCategory(studentWithCredit.ageCategory || "JUNIOR");
              }
              setIsMakeupModalOpen(true);
            }}
            className="gap-1.5 font-bold border-red-500/40 text-red-700 dark:text-red-300 bg-red-500/10 hover:bg-red-500/20"
          >
            <RotateCcw className="h-4 w-4 text-red-600" />
            🔄 Programar Recuperación
          </Button>

          {/* Botón de Registro Histórico de Alumnos Reingresantes / Bajas */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHistoryOpen(true)}
            className="gap-1.5 font-bold border-border"
          >
            <History className="h-4 w-4 text-warning" />
            Historial Reingresos / Bajas
          </Button>

          {/* Botón de Importar Horario desde CSV/Excel (Para Nayeli) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCsvModalOpen(true)}
            className="gap-1.5 font-bold border-success/40 text-success bg-success/10 hover:bg-success/20"
          >
            <FileSpreadsheet className="h-4 w-4 text-success" />
            📊 Subir Horario (CSV/Excel)
          </Button>

          {/* Grupo de Controles de Timbre Escolar Oficial (school bell.mp3) */}
          <div className="flex items-center gap-1 bg-warning/10 p-1 rounded-xl border border-warning/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                playOfficialChime();
                toast.success("🔔 Timbre Oficial Emitido", {
                  description: "Reproduciendo 'school bell.mp3' en la academia.",
                });
              }}
              className="gap-1.5 text-xs font-bold text-warning-foreground hover:bg-warning/20"
            >
              <Bell className="h-4 w-4 text-warning animate-bounce" />
              🔔 Timbre
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsChimeSettingsOpen(true)}
              className="h-8 w-8 text-warning-foreground hover:bg-warning/20 rounded-lg"
              title="Configuración de Timbre Automático"
            >
              <Settings2 className="h-4 w-4 text-warning" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect value={teacher} onChange={setTeacher} placeholder="Profesor" options={availableTeachers} />
          <FilterSelect value={room} onChange={setRoom} placeholder="Sala" options={rooms} />
          <FilterSelect
            value={instrument}
            onChange={setInstrument}
            placeholder="Instrumento"
            options={instruments}
          />
          <FilterSelect
            value={category}
            onChange={setCategory}
            placeholder="Categoría / Edad"
            options={[
              { value: "JUNIOR", label: "🟡 Junior (7 a 12)" },
              { value: "JUVENIL", label: "🟢 Juvenil (13 a 17)" },
              { value: "ADULTO", label: "⚫ Adulto (18 a +)" },
              { value: "INFANTIL", label: "🟣 Infantil (5 y 6)" },
              { value: "PERSONALIZADA", label: "🔵 Personalizada" },
              { value: "RECUPERACION", label: "🔴 Recuperación" },
            ]}
          />
          <FilterSelect
            value={dayGroup}
            onChange={setDayGroup}
            placeholder="Modalidad / Días"
            options={[
              { value: "L-M", label: "Lunes y Miércoles (Regular)" },
              { value: "M-J", label: "Martes y Jueves (Regular)" },
              { value: "Vie", label: "Viernes Intensivo" },
              { value: "Sáb", label: "Sábado Intensivo" },
              { value: "Personalizado", label: "Solo Personalizadas" },
            ]}
          />
          {(teacher !== ALL || room !== ALL || instrument !== ALL || category !== ALL || dayGroup !== ALL) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-semibold text-primary hover:underline"
              onClick={() => {
                setTeacher(ALL);
                setRoom(ALL);
                setInstrument(ALL);
                setCategory(ALL);
                setDayGroup(ALL);
              }}
            >
              Restablecer filtros
            </Button>
          )}
        </div>
      </div>

      {/* VISTA 0: VISTA DIDÁCTICA ULTRA-COMPACTA (EXCEL NAYELI - 2 DÍAS PAREADOS) */}
      {viewMode === "excel" && (
        <div className="space-y-3.5">
          {/* Leyenda de Colores del Excel de Nayeli */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-2.5 rounded-2xl border border-border text-xs">
            <span className="font-black text-foreground">Leyenda de Categorías:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {Object.entries(categoryStyles).map(([key, style]) => (
                <span
                  key={key}
                  className={`px-2 py-0.5 rounded-md text-[10px] ${style.bg} ${style.text} border ${style.border} font-bold`}
                >
                  ● {style.label}
                </span>
              ))}
            </div>
          </div>

          {/* Navegador de Pares de Días (Formato Original Excel Nayeli) */}
          {(() => {
            const pairs: Array<{
              id: string;
              title: string;
              badge: string;
              day1: WeekDay;
              day2: WeekDay;
              day1Offset: number;
              day2Offset: number;
            }> = [
              {
                id: "L-M",
                title: "Lunes y Miércoles",
                badge: "Plan Regular (2x semana)",
                day1: "Lun",
                day2: "Mié",
                day1Offset: 0,
                day2Offset: 2,
              },
              {
                id: "M-J",
                title: "Martes y Jueves",
                badge: "Plan Regular (2x semana)",
                day1: "Mar",
                day2: "Jue",
                day1Offset: 1,
                day2Offset: 3,
              },
              {
                id: "V-S",
                title: "Viernes y Sábado",
                badge: "Turno Intensivo (Fines de Semana)",
                day1: "Vie",
                day2: "Sáb",
                day1Offset: 4,
                day2Offset: 5,
              },
            ];

            const activePair = pairs[selectedPairIndex] || pairs[0]!;
            const monthName = monthsName[selectedDate.getMonth()];
            const baseDayNum = 3 + currentWeekIndex * 7; // Agosto 2026

            const renderSingleDayTable = (dayName: WeekDay, dayOffset: number) => {
              const dayLessonsForTable = visible.filter((l) => l.day === dayName && l.status !== "cancelada");
              const currentSlots = dayName === "Sáb" ? timeSlotsSaturday : timeSlotsWeekday;
              const mainTeachersList = [
                { name: "Jeremy", room: "Sala A", instrumentHint: "Guitarra y Batería" },
                { name: "Fernando", room: "Sala B", instrumentHint: "Violín y Piano" },
                { name: "Nathaly", room: "Sala C", instrumentHint: "Canto y Piano Infantil" },
                { name: "Demo", room: "Sala D", instrumentHint: "Demos y Proyección" },
              ];

              const actualDateNum = baseDayNum + dayOffset;

              return (
                <div className="flex-1 rounded-2xl border-2 border-slate-400 bg-white dark:bg-slate-950 shadow-md overflow-hidden flex flex-col w-full">
                  {/* Encabezado del Día */}
                  <div className="bg-[#FCD7D2] px-3 py-1.5 border-b-2 border-slate-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs sm:text-sm text-slate-950 uppercase tracking-wide">
                        {dayName === "Lun"
                          ? "LUNES"
                          : dayName === "Mar"
                          ? "MARTES"
                          : dayName === "Mié"
                          ? "MIÉRCOLES"
                          : dayName === "Jue"
                          ? "JUEVES"
                          : dayName === "Vie"
                          ? "VIERNES"
                          : "SÁBADO"}{" "}
                        {actualDateNum} {monthName?.slice(0, 3)}
                      </span>
                    </div>
                    <span className="text-[10.5px] font-black px-2 py-0.5 rounded-full bg-slate-950/10 text-slate-950 shrink-0">
                      {dayLessonsForTable.length} Clases
                    </span>
                  </div>

                  {/* Tabla del Día con ancho 100% fluido y sin scrollbar horizontal */}
                  <div className="w-full">
                    <table className="w-full table-fixed border-collapse text-xs font-sans">
                      <colgroup>
                        <col className="w-[66px]" />
                        <col className="w-[calc((100%-66px)/4)]" />
                        <col className="w-[calc((100%-66px)/4)]" />
                        <col className="w-[calc((100%-66px)/4)]" />
                        <col className="w-[calc((100%-66px)/4)]" />
                      </colgroup>
                      <thead>
                        <tr className="border-b-2 border-slate-400 bg-slate-100 dark:bg-slate-900 text-center font-black text-xs uppercase tracking-wider">
                          <th className="p-1.5 border-r-2 border-slate-400 bg-[#F4A59C] text-slate-950 font-black text-center text-[10.5px]">
                            HORA
                          </th>
                          {mainTeachersList.map((tInfo, tIdx) => (
                            <th
                              key={tInfo.name}
                              className={`p-1.5 border-r-2 border-slate-400 last:border-r-0 text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/80 font-black text-center ${
                                tIdx === mainTeachersList.length - 1 ? "border-r-0" : ""
                              }`}
                            >
                              <div className="leading-tight text-[10.5px] truncate">{tInfo.name.toUpperCase()}</div>
                              <span className="text-[9px] font-bold text-primary block opacity-90 leading-tight">({tInfo.room})</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-slate-300 dark:divide-slate-800">
                        {currentSlots.map((timeSlot) => {
                          const [hh, mm] = timeSlot.split(":").map((v) => parseInt(v, 10));
                          const endMinuteTotal = hh! * 60 + mm! + 45;
                          const endH = String(Math.floor(endMinuteTotal / 60)).padStart(2, "0");
                          const endM = String(endMinuteTotal % 60).padStart(2, "0");

                          return (
                            <tr key={timeSlot} className="border-b border-slate-300 dark:border-slate-800 min-h-[48px]">
                              {/* Columna HORA Salmón Oficial */}
                              <td className="p-1 border-r-2 border-slate-400 bg-[#FCD7D2] text-center font-mono font-black text-[10.5px] text-slate-950 align-middle">
                                <div>{timeSlot}</div>
                                <div className="text-[9px] text-slate-700 font-bold">{endH}:{endM}</div>
                              </td>

                              {/* 4 Columnas por Profesor y Sala */}
                              {mainTeachersList.map((tInfo, tIdx) => {
                                const lessons = dayLessonsForTable.filter(
                                  (l) =>
                                    l.time === timeSlot &&
                                    (l.teacher.toLowerCase().includes(tInfo.name.toLowerCase()) ||
                                     l.room.toLowerCase().trim() === tInfo.room.toLowerCase().trim())
                                );

                                return (
                                  <td
                                    key={tInfo.name}
                                    className={`p-0 border-r-2 border-slate-400 last:border-r-0 align-top ${
                                      tIdx === mainTeachersList.length - 1 ? "border-r-0" : ""
                                    }`}
                                  >
                                    {lessons.length === 0 ? (
                                      <div
                                        onClick={() => {
                                          setNewLessonDay(dayName);
                                          setNewLessonTime(timeSlot);
                                          setNewLessonTeacher(tInfo.name);
                                          setNewLessonRoom(tInfo.room);
                                          setIsAddLessonOpen(true);
                                        }}
                                        className="h-full min-h-[48px] w-full p-1 flex items-center justify-center text-[10px] text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition-colors"
                                      >
                                        <span className="opacity-0 hover:opacity-100 font-semibold text-primary text-[9.5px]">+ Añadir</span>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col sm:flex-row h-full min-h-[48px] divide-y sm:divide-y-0 sm:divide-x border-slate-300">
                                        {lessons.map((lesson) => {
                                          const catStyle = categoryStyles[lesson.category ?? "JUNIOR"]!;
                                          const studentProfile = adminStudents.find(
                                            (st) => st.name.toLowerCase() === lesson.student.toLowerCase()
                                          );

                                          // Detección de Categoría de Edad para Clases Personalizadas
                                          const studentAgeCat =
                                            studentProfile?.ageCategory ||
                                            (lesson.student.toLowerCase().includes("joan paolo")
                                              ? "ADULTO"
                                              : lesson.student.toLowerCase().includes("mishel")
                                              ? "JUVENIL"
                                              : lesson.student.toLowerCase().includes("mirko")
                                              ? "JUNIOR"
                                              : "JUNIOR");

                                          // Colores del puntito indicador según el Excel oficial:
                                          // 🟢 Juvenil: #4CAF50 | ⚫ Adulto: #757575 | 🟡 Junior: #FBC02D | 🟣 Infantil: #7C4DFF
                                          const dotColor =
                                            studentAgeCat === "JUVENIL"
                                              ? "bg-[#4CAF50]" // Verde Juvenil (13 a 17)
                                              : studentAgeCat === "ADULTO"
                                              ? "bg-[#757575]" // Plomo Adulto (18 a +)
                                              : studentAgeCat === "INFANTIL"
                                              ? "bg-[#7C4DFF]" // Morado Infantil (5 y 6)
                                              : "bg-[#FBC02D]"; // Amarillo Junior (7 a 12)

                                          const dotLabel =
                                            studentAgeCat === "JUVENIL"
                                              ? "Categoría Juvenil (13 a 17 años)"
                                              : studentAgeCat === "ADULTO"
                                              ? "Categoría Adulto (18 a + años)"
                                              : studentAgeCat === "INFANTIL"
                                              ? "Categoría Infantil (5 y 6 años)"
                                              : "Categoría Junior (7 a 12 años)";

                                          return (
                                            <div
                                              key={lesson.id}
                                              onClick={() => openLesson(lesson)}
                                              className={`flex-1 p-1 ${catStyle.bg} border-b sm:border-b-0 border-slate-300 cursor-pointer hover:brightness-95 transition-all flex flex-col justify-center text-center relative overflow-hidden`}
                                              title={`${lesson.student} (${lesson.instrument}) - ${lesson.room} · ${
                                                lesson.category === "PERSONALIZADA"
                                                  ? `Clase Personalizada (${dotLabel})`
                                                  : catStyle.label
                                              }`}
                                            >
                                              <p className={`font-black text-[10px] leading-tight ${catStyle.text} line-clamp-2 break-words`}>
                                                {lesson.student}
                                              </p>
                                              <p className={`text-[9px] font-bold ${catStyle.text} opacity-90 truncate mt-0.5`}>
                                                ({lesson.instrument})
                                              </p>
                                              {/* Chip de Clase de Recuperación */}
                                              {lesson.isMakeup && (
                                                <span className="text-[8px] font-black uppercase text-[#B71C1C] bg-[#FFCDD2] px-1 py-0.2 rounded mt-0.5 inline-block">
                                                  🔄 Recuperación
                                                </span>
                                              )}
                                              {/* Puntito Indicador de Asistencia Marcada */}
                                              {lesson.attendanceStatus && (
                                                <span
                                                  className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full border border-white shadow-2xs ${
                                                    lesson.attendanceStatus === "presente"
                                                      ? "bg-emerald-500 ring-1 ring-emerald-400/50"
                                                      : lesson.attendanceStatus === "ausente"
                                                      ? "bg-red-500 ring-1 ring-red-400/50"
                                                      : lesson.attendanceStatus === "tarde"
                                                      ? "bg-amber-500 ring-1 ring-amber-400/50"
                                                      : "bg-blue-500 ring-1 ring-blue-400/50"
                                                  }`}
                                                  title={`Asistencia: ${lesson.attendanceStatus.toUpperCase()}`}
                                                />
                                              )}
                                              {/* Puntito Indicador de Categoría de Edad en Clases Personalizadas */}
                                              {lesson.category === "PERSONALIZADA" && (
                                                <span
                                                  className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${dotColor} border border-white shadow-2xs`}
                                                  title={`Clase Personalizada · ${dotLabel}`}
                                                />
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            };

            const singleDays: Array<{ day: WeekDay; label: string; offset: number; badge: string }> = [
              { day: "Lun", label: "Lunes", offset: 0, badge: "L-M" },
              { day: "Mar", label: "Martes", offset: 1, badge: "M-J" },
              { day: "Mié", label: "Miércoles", offset: 2, badge: "L-M" },
              { day: "Jue", label: "Jueves", offset: 3, badge: "M-J" },
              { day: "Vie", label: "Viernes", offset: 4, badge: "Intensivo" },
              { day: "Sáb", label: "Sábado", offset: 5, badge: "Intensivo" },
            ];

            return (
              <div className="space-y-3">
                {/* Switch de Formato: 2x2 Pareado vs 1x1 Día Individual */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-muted p-1 rounded-xl border border-border text-xs font-bold">
                      <button
                        onClick={() => setExcelSubMode("pareado")}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          excelSubMode === "pareado"
                            ? "bg-background text-foreground shadow-2xs font-black"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        👥 Pareado (2x2)
                      </button>
                      <button
                        onClick={() => setExcelSubMode("individual")}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          excelSubMode === "individual"
                            ? "bg-background text-foreground shadow-2xs font-black text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        🎯 Día a Día (1x1)
                      </button>
                    </div>

                    {/* Pestañas según el sub-modo */}
                    {excelSubMode === "pareado" ? (
                      <div className="flex flex-wrap items-center gap-1.5 ml-2">
                        {pairs.map((p, pIdx) => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedPairIndex(pIdx)}
                            className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 ${
                              selectedPairIndex === pIdx
                                ? "bg-primary text-primary-foreground shadow-xs scale-[1.02]"
                                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                            }`}
                          >
                            <span>{p.title}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                selectedPairIndex === pIdx
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-background/80 text-muted-foreground"
                              }`}
                            >
                              {p.badge}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5 ml-2">
                        {singleDays.map((sd, sdIdx) => (
                          <button
                            key={sd.day}
                            onClick={() => setExcelSingleDayIndex(sdIdx)}
                            className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 ${
                              excelSingleDayIndex === sdIdx
                                ? "bg-primary text-primary-foreground shadow-xs scale-[1.02]"
                                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                            }`}
                          >
                            <span>{sd.label}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                excelSingleDayIndex === sdIdx
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-background/80 text-muted-foreground"
                              }`}
                            >
                              {sd.badge}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-foreground uppercase tracking-wide">
                      Semana {currentWeekIndex + 1} de 4 · {monthName} {selectedDate.getFullYear()}
                    </span>
                  </div>
                </div>

                {/* Renderizado de Tablas según Sub-Modo */}
                {excelSubMode === "pareado" ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 items-start">
                    {renderSingleDayTable(activePair.day1, activePair.day1Offset)}
                    {renderSingleDayTable(activePair.day2, activePair.day2Offset)}
                  </div>
                ) : (
                  <div className="w-full">
                    {renderSingleDayTable(
                      singleDays[excelSingleDayIndex].day,
                      singleDays[excelSingleDayIndex].offset
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* VISTA 1: POR DÍA (MODO TARJETAS) */}
      {viewMode === "diario" && (
        <div className="space-y-4">
          {/* Leyenda de Colores del Excel de Nayeli */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-3 rounded-2xl border border-border text-xs">
            <span className="font-bold text-foreground">Leyenda de Categorías:</span>
            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(categoryStyles).map(([key, style]) => (
                <span
                  key={key}
                  className={`px-2.5 py-1 rounded-lg text-[10px] ${style.bg} ${style.text} border ${style.border}`}
                >
                  ● {style.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
            <Button variant="outline" size="sm" onClick={handlePrevDay} className="gap-1 font-bold">
              ← Día anterior
            </Button>

            <div className="text-center">
              {(() => {
                const dayNames: Record<WeekDay, string> = {
                  Lun: "Lunes",
                  Mar: "Martes",
                  Mié: "Miércoles",
                  Jue: "Jueves",
                  Vie: "Viernes",
                  Sáb: "Sábado",
                };
                // Días de Agosto 2026: Semana 1 (3-8), Semana 2 (10-15), Semana 3 (17-22), Semana 4 (24-29)
                const dayNum = 3 + (currentWeekIndex * 7) + selectedDayIndex;
                const monthName = monthsName[selectedDate.getMonth()];
                return (
                  <>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                      Semana {currentWeekIndex + 1} de 4 · {monthName} {selectedDate.getFullYear()}
                    </span>
                    <h3 className="text-xl font-black text-foreground">
                      {dayNames[currentDayName]} {dayNum} de {monthName}
                    </h3>
                  </>
                );
              })()}
            </div>

            <Button variant="outline" size="sm" onClick={handleNextDay} className="gap-1 font-bold">
              Siguiente día →
            </Button>
          </div>

          {/* Selector de días por Pestañas con Fechas Dinámicas de la Semana */}
          <div className="grid grid-cols-6 gap-1.5 rounded-xl border border-border bg-muted p-1.5">
            {weekDays.map((d, idx) => {
              const dayNum = 3 + (currentWeekIndex * 7) + idx;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-0.5 ${
                    selectedDayIndex === idx
                      ? "bg-primary text-primary-foreground shadow-sm font-black"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                  }`}
                >
                  <span className="uppercase text-[11px]">{d}</span>
                  <span className={`text-[10px] ${selectedDayIndex === idx ? "text-primary-foreground/90 font-black" : "text-muted-foreground/80 font-medium"}`}>
                    {dayNum} {monthsName[selectedDate.getMonth()].slice(0, 3)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Lista de Alumnos/Clases del Día Agrupadas por Bloque Horario (Diseño TDAH-Friendly con jerarquía visual nítida) */}
          <div className="space-y-6">
            {dayLessons.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <Calendar className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-foreground">Día despejado</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  No hay clases programadas para el {currentDayName}.
                </p>
              </div>
            ) : (
              (() => {
                // Obtener horas ordenadas cronológicamente para el día seleccionado
                const timeGroups = Array.from(new Set(dayLessons.map((l) => l.time))).sort((a, b) =>
                  a.localeCompare(b)
                );

                // Los 4 profesores y salas principales
                const mainTeachersList = [
                  { name: "Jeremy", room: "Sala A" },
                  { name: "Fernando", room: "Sala B" },
                  { name: "Nathaly", room: "Sala C" },
                  { name: "Demo", room: "Sala D" },
                ];

                return (
                  <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
                    {/* Encabezado de Columnas por Profesor Estilo Excel Oficial */}
                    <div className="grid grid-cols-[110px_repeat(4,1fr)] bg-muted/90 border-b border-border text-center font-black text-xs uppercase tracking-wider sticky top-0 z-10">
                      <div className="p-3 border-r border-border bg-[#F4A59C] text-slate-950 flex items-center justify-center gap-1 font-black tracking-widest shadow-2xs">
                        <Clock className="h-3.5 w-3.5 text-slate-950" /> HORA
                      </div>
                      {mainTeachersList.map((tInfo) => (
                        <div
                          key={tInfo.name}
                          className="p-3 border-r border-border last:border-r-0 flex flex-col items-center justify-center gap-0.5 font-bold text-foreground"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                            <span>PROF. {tInfo.name.toUpperCase()}</span>
                          </div>
                          <span className="text-[9.5px] font-bold text-primary opacity-90">({tInfo.room})</span>
                        </div>
                      ))}
                    </div>

                    {/* Filas por Bloque Horario */}
                    <div className="divide-y divide-border">
                      {timeGroups.map((timeSlot) => {
                        // Calcular fin de bloque (+45 min)
                        const [hh, mm] = timeSlot.split(":").map((v) => parseInt(v, 10));
                        const endMinuteTotal = hh! * 60 + mm! + 45;
                        const endH = String(Math.floor(endMinuteTotal / 60)).padStart(2, "0");
                        const endM = String(endMinuteTotal % 60).padStart(2, "0");

                        return (
                          <div
                            key={timeSlot}
                            className="grid grid-cols-[110px_repeat(4,1fr)] min-h-[90px] hover:bg-muted/10 transition-colors"
                          >
                            {/* Columna de Hora con alto contraste: Fondo salmón del Excel + texto oscuro nítido */}
                            <div className="p-2 border-r border-border bg-[#FCD7D2] flex flex-col items-center justify-center text-center font-mono font-black text-xs text-slate-950 shadow-2xs">
                              <span className="text-sm font-black text-slate-950 tracking-tight">{timeSlot}</span>
                              <span className="text-[10px] font-bold text-slate-700 mt-0.5">{endH}:{endM}</span>
                            </div>

                            {/* 4 Columnas para los 4 Profesores y Salas */}
                            {mainTeachersList.map((tInfo) => {
                              const lessonsForTeacher = dayLessons.filter(
                                (l) =>
                                  l.time === timeSlot &&
                                  (l.teacher.toLowerCase().includes(tInfo.name.toLowerCase()) ||
                                   l.room.toLowerCase().trim() === tInfo.room.toLowerCase().trim())
                              );

                              return (
                                <div
                                  key={tInfo.name}
                                  className="p-1.5 border-r border-border last:border-r-0 flex flex-col gap-1.5 justify-center"
                                >
                                  {lessonsForTeacher.length === 0 ? (
                                    <div
                                      onClick={() => {
                                        setNewLessonDay(currentDayName);
                                        setNewLessonTime(timeSlot);
                                        setNewLessonTeacher(tInfo.name);
                                        setNewLessonRoom(tInfo.room);
                                        setIsAddLessonOpen(true);
                                      }}
                                      className="h-full min-h-[65px] rounded-xl border border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center text-[10px] text-muted-foreground transition-colors cursor-pointer group"
                                    >
                                      <span className="group-hover:text-primary font-medium flex items-center gap-1">
                                        <PlusCircle className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                                        Disponible
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-1.5 h-full">
                                      {lessonsForTeacher.map((lesson) => {
                                        const catStyle = categoryStyles[lesson.category ?? "JUNIOR"]!;
                                        const studentProfile = adminStudents.find(
                                          (st) => st.name.toLowerCase() === lesson.student.toLowerCase()
                                        );
                                        
                                        // Detección de Categoría de Edad para Clases Personalizadas
                                        const studentAgeCat =
                                          studentProfile?.ageCategory ||
                                          (lesson.student.toLowerCase().includes("joan paolo")
                                            ? "ADULTO"
                                            : lesson.student.toLowerCase().includes("mishel")
                                            ? "JUVENIL"
                                            : lesson.student.toLowerCase().includes("mirko")
                                            ? "JUNIOR"
                                            : "JUNIOR");

                                        // Colores del puntito indicador según el Excel oficial:
                                        // 🟢 Juvenil: #4CAF50 | ⚫ Adulto: #757575 | 🟡 Junior: #FBC02D | 🟣 Infantil: #7C4DFF
                                        const dotColor =
                                          studentAgeCat === "JUVENIL"
                                            ? "bg-[#4CAF50]" // Verde Juvenil (13 a 17)
                                            : studentAgeCat === "ADULTO"
                                            ? "bg-[#757575]" // Plomo Adulto (18 a +)
                                            : studentAgeCat === "INFANTIL"
                                            ? "bg-[#7C4DFF]" // Morado Infantil (5 y 6)
                                            : "bg-[#FBC02D]"; // Amarillo Junior (7 a 12)

                                        const dotLabel =
                                          studentAgeCat === "JUVENIL"
                                            ? "Categoría Juvenil (13 a 17 años)"
                                            : studentAgeCat === "ADULTO"
                                            ? "Categoría Adulto (18 a + años)"
                                            : studentAgeCat === "INFANTIL"
                                            ? "Categoría Infantil (5 y 6 años)"
                                            : "Categoría Junior (7 a 12 años)";

                                        return (
                                          <div
                                            key={lesson.id}
                                            onClick={() => openLesson(lesson)}
                                            className={`cursor-pointer rounded-xl border ${catStyle.border} ${catStyle.bg} p-2 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative`}
                                            title={`${lesson.student} (${lesson.instrument}) - ${lesson.room} · ${lesson.category === "PERSONALIZADA" ? `Clase Personalizada (${dotLabel})` : catStyle.label}`}
                                          >
                                            <div className="flex items-start justify-between gap-1">
                                              <div className="flex items-center gap-1">
                                                <p className={`font-black text-[10px] leading-tight ${catStyle.text} line-clamp-2 break-words`}>
                                                  {lesson.student}
                                                </p>
                                                <p className={`text-[9px] font-bold ${catStyle.text} opacity-90 truncate mt-0.5`}>
                                                  ({lesson.instrument})
                                                </p>
                                                {/* Distintivo de Alumno Nuevo en su primera semana */}
                                                {(studentProfile?.joinedAt?.includes("18/08") ||
                                                  studentProfile?.teacherNote?.toLowerCase().includes("nueva") ||
                                                  studentProfile?.teacherNote?.toLowerCase().includes("nuevo") ||
                                                  studentProfile?.teacherNote?.toLowerCase().includes("prueba")) && (
                                                  <span
                                                    className="absolute top-0.5 left-0.5 px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[7.5px] leading-none shadow-xs border border-amber-500/40"
                                                    title="Alumno Nuevo / Recién Matriculado"
                                                  >
                                                    ✨ Nuevo
                                                  </span>
                                                )}
                                                {/* Puntito Indicador de Categoría de Edad en Clases Personalizadas */}
                                                {lesson.category === "PERSONALIZADA" && (
                                                  <span
                                                    className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${dotColor} border border-white shadow-2xs`}
                                                    title={`Clase Personalizada · ${dotLabel}`}
                                                  />
                                                )}
                                              </div>
                                              <span className="font-mono text-[9px] font-bold bg-background/90 text-foreground px-1.5 rounded border border-border shrink-0">
                                                {lesson.room}
                                              </span>
                                            </div>

                                            <h4 className={`text-xs font-black ${catStyle.text} leading-tight group-hover:underline mt-1`}>
                                              {lesson.student}
                                            </h4>

                                            <div className="flex items-center justify-between text-[10px] pt-1 mt-1 border-t border-black/10">
                                              <span className={`font-bold ${catStyle.text} truncate`}>
                                                🎵 {lesson.instrument}
                                              </span>
                                              <span className={`font-black underline ${catStyle.text} text-[9px]`}>
                                                Editar →
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* VISTA 2: REJILLA SEMANAL (PANORÁMICA DE LA SEMANA COMPLETA CON COLORES DEL EXCEL) */}
      {viewMode === "semanal" && (
        <div className="space-y-4">
          {/* Leyenda de Colores del Excel de Nayeli */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-3 rounded-2xl border border-border text-xs">
            <span className="font-bold text-foreground">Leyenda de Categorías:</span>
            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(categoryStyles).map(([key, style]) => (
                <span
                  key={key}
                  className={`px-2.5 py-1 rounded-lg text-[10px] ${style.bg} ${style.text} border ${style.border}`}
                >
                  ● {style.label}
                </span>
              ))}
            </div>
          </div>

          {/* Rejilla Semanal Separada y Perfectamente Alineada */}
          <div className="space-y-6">
            {/* Bloque 1: Lunes a Viernes (Horario de Tarde: 16:00 - 19:45) */}
            <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
              <div className="bg-primary/5 px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Turno Tarde · Lunes a Viernes (16:00 a 19:45)
                </span>
                <span className="text-[11px] font-bold text-muted-foreground">
                  Bloques de 45 minutos · Salas A a D
                </span>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[48rem]">
                  {/* Cabecera de Días L-V con Fechas */}
                  <div className="grid grid-cols-[6rem_repeat(5,1fr)] border-b border-border bg-muted/40 text-center">
                    <div className="p-2.5 text-xs font-black text-muted-foreground uppercase flex items-center justify-center">
                      Horario
                    </div>
                    {(["Lun", "Mar", "Mié", "Jue", "Vie"] as WeekDay[]).map((d, dIdx) => {
                      const dayNames = { Lun: "Lunes", Mar: "Martes", Mié: "Miércoles", Jue: "Jueves", Vie: "Viernes" };
                      // Fechas referenciales de Agosto 2026: Semana 1 (3 al 7), Semana 2 (10 al 14), Semana 3 (17 al 21), Semana 4 (24 al 28)
                      const dayNum = 3 + (currentWeekIndex * 7) + dIdx;

                      return (
                        <div key={d} className="p-2 text-xs font-black text-foreground border-l border-border/60">
                          <div>{dayNames[d]}</div>
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {dayNum} {monthsName[selectedDate.getMonth()].slice(0, 3)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Filas de Horario L-V */}
                  {timeSlotsWeekday.map((slot) => (
                    <div
                      key={`weekday-${slot}`}
                      className="grid grid-cols-[6rem_repeat(5,1fr)] border-b border-border last:border-b-0"
                    >
                      <div className="p-3 font-mono text-xs font-black text-foreground flex items-center justify-center bg-muted/20">
                        {slot}
                      </div>
                      {(["Lun", "Mar", "Mié", "Jue", "Vie"] as WeekDay[]).map((day) => {
                        const cell = visible.filter((l) => l.day === day && l.time === slot);
                        return (
                          <div
                            key={`cell-${day}-${slot}`}
                            className="border-l border-border/60 p-2 min-h-[5.5rem] flex flex-col gap-1.5 justify-start bg-background/50"
                          >
                            {cell.map((lesson) => {
                              const catStyle = categoryStyles[lesson.category ?? "JUNIOR"] ?? categoryStyles.JUNIOR!;
                              const studentProfile = adminStudents.find(
                                (st) => st.name.toLowerCase() === lesson.student.toLowerCase()
                              );
                              
                              // Detección de Categoría de Edad para Clases Personalizadas
                              const studentAgeCat =
                                studentProfile?.ageCategory ||
                                (lesson.student.toLowerCase().includes("joan paolo")
                                  ? "ADULTO"
                                  : lesson.student.toLowerCase().includes("mishel")
                                  ? "JUVENIL"
                                  : lesson.student.toLowerCase().includes("mirko")
                                  ? "JUNIOR"
                                  : "JUNIOR");

                              // Colores del puntito indicador según el Excel oficial:
                              // 🟢 Juvenil: #4CAF50 | ⚫ Adulto: #757575 | 🟡 Junior: #FBC02D | 🟣 Infantil: #7C4DFF
                              const dotColor =
                                studentAgeCat === "JUVENIL"
                                  ? "bg-[#4CAF50]" // Verde Juvenil (13 a 17)
                                  : studentAgeCat === "ADULTO"
                                  ? "bg-[#757575]" // Plomo Adulto (18 a +)
                                  : studentAgeCat === "INFANTIL"
                                  ? "bg-[#7C4DFF]" // Morado Infantil (5 y 6)
                                  : "bg-[#FBC02D]"; // Amarillo Junior (7 a 12)

                              const dotLabel =
                                studentAgeCat === "JUVENIL"
                                  ? "Categoría Juvenil (13 a 17 años)"
                                  : studentAgeCat === "ADULTO"
                                  ? "Categoría Adulto (18 a + años)"
                                  : studentAgeCat === "INFANTIL"
                                  ? "Categoría Infantil (5 y 6 años)"
                                  : "Categoría Junior (7 a 12 años)";

                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => openLesson(lesson)}
                                  aria-label={`Clase de ${lesson.student}, ${lesson.instrument}, ${lesson.teacher}, ${lesson.room}`}
                                  className={`w-full rounded-xl border p-2 text-left transition-all hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary relative ${
                                    lesson.status === "cancelada"
                                      ? "border-dashed border-border bg-muted text-muted-foreground line-through opacity-50"
                                      : `${catStyle.bg} ${catStyle.border} ${catStyle.text}`
                                  }`}
                                  title={`${lesson.student} (${lesson.instrument}) - ${lesson.room} · ${lesson.category === "PERSONALIZADA" ? `Clase Personalizada (${dotLabel})` : catStyle.label}`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1 min-w-0">
                                      <span className="block truncate font-black text-xs">
                                        {lesson.student}
                                      </span>
                                      {/* Puntito Indicador de Categoría de Edad en Clases Personalizadas */}
                                      {lesson.category === "PERSONALIZADA" && (
                                        <span
                                          className={`inline-block w-2.5 h-2.5 rounded-full ${dotColor} border border-white shadow-2xs shrink-0`}
                                          title={`Clase Personalizada · ${dotLabel}`}
                                        />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {lesson.sessionNumber && (
                                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-black/20 text-foreground border border-black/10">
                                          {lesson.sessionNumber === 1 ? "1ra Clase" : "2da Clase"}
                                        </span>
                                      )}
                                      {conflictIds.has(lesson.id) && lesson.status !== "cancelada" && (
                                        <AlertTriangle className="h-3 w-3 text-destructive" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] font-bold opacity-90 mt-0.5">
                                    <span className="truncate">{lesson.instrument}</span>
                                    <span className="shrink-0 bg-background/40 px-1 rounded">{lesson.room}</span>
                                  </div>
                                  <div className="text-[9px] font-semibold text-muted-foreground/90 truncate mt-0.5">
                                    Prof. {lesson.teacher}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bloque 2: Sábados (Horario de Mañana: 09:00 - 13:30) */}
            <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
              <div className="bg-primary/5 px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Turno Mañana · Sábados (09:00 a 13:30)
                </span>
                <span className="text-[11px] font-bold text-muted-foreground">
                  Bloques intensivos y regulares · Salas A a D
                </span>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[32rem]">
                  {/* Cabecera Sábados con Fecha */}
                  <div className="grid grid-cols-[6rem_1fr] border-b border-border bg-muted/40 text-center">
                    <div className="p-2.5 text-xs font-black text-muted-foreground uppercase flex items-center justify-center">
                      Horario
                    </div>
                    <div className="p-2 text-xs font-black text-foreground border-l border-border/60">
                      <div>Sábado</div>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {8 + (currentWeekIndex * 7)} {monthsName[selectedDate.getMonth()].slice(0, 3)}
                      </span>
                    </div>
                  </div>

                  {/* Filas Sábados */}
                  {timeSlotsSaturday.map((slot) => {
                    const cell = visible.filter((l) => l.day === "Sáb" && l.time === slot);
                    return (
                      <div
                        key={`saturday-${slot}`}
                        className="grid grid-cols-[6rem_1fr] border-b border-border last:border-b-0"
                      >
                        <div className="p-3 font-mono text-xs font-black text-foreground flex items-center justify-center bg-muted/20">
                          {slot}
                        </div>
                        <div className="border-l border-border/60 p-2 min-h-[5rem] flex flex-wrap gap-2 items-center bg-background/50">
                          {cell.map((lesson) => {
                            const catStyle = categoryStyles[lesson.category ?? "JUNIOR"] ?? categoryStyles.JUNIOR!;
                            const studentProfile = adminStudents.find(
                              (st) => st.name.toLowerCase() === lesson.student.toLowerCase()
                            );
                            
                            // Detección de Categoría de Edad para Clases Personalizadas
                            const studentAgeCat =
                              studentProfile?.ageCategory ||
                              (lesson.student.toLowerCase().includes("joan paolo")
                                ? "ADULTO"
                                : lesson.student.toLowerCase().includes("mishel")
                                ? "JUVENIL"
                                : lesson.student.toLowerCase().includes("mirko")
                                ? "JUNIOR"
                                : "JUNIOR");

                            // Colores del puntito indicador según el Excel oficial:
                            // 🟢 Juvenil: #4CAF50 | ⚫ Adulto: #757575 | 🟡 Junior: #FBC02D | 🟣 Infantil: #7C4DFF
                            const dotColor =
                              studentAgeCat === "JUVENIL"
                                ? "bg-[#4CAF50]" // Verde Juvenil (13 a 17)
                                : studentAgeCat === "ADULTO"
                                ? "bg-[#757575]" // Plomo Adulto (18 a +)
                                : studentAgeCat === "INFANTIL"
                                ? "bg-[#7C4DFF]" // Morado Infantil (5 y 6)
                                : "bg-[#FBC02D]"; // Amarillo Junior (7 a 12)

                            const dotLabel =
                              studentAgeCat === "JUVENIL"
                                ? "Categoría Juvenil (13 a 17 años)"
                                : studentAgeCat === "ADULTO"
                                ? "Categoría Adulto (18 a + años)"
                                : studentAgeCat === "INFANTIL"
                                ? "Categoría Infantil (5 y 6 años)"
                                : "Categoría Junior (7 a 12 años)";

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => openLesson(lesson)}
                                aria-label={`Clase de ${lesson.student}, ${lesson.instrument}, ${lesson.teacher}, ${lesson.room}`}
                                className={`flex-1 min-w-[14rem] max-w-[20rem] rounded-xl border p-2 text-left transition-all hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary relative ${
                                  lesson.status === "cancelada"
                                    ? "border-dashed border-border bg-muted text-muted-foreground line-through opacity-50"
                                    : `${catStyle.bg} ${catStyle.border} ${catStyle.text}`
                                }`}
                                title={`${lesson.student} (${lesson.instrument}) - ${lesson.room} · ${lesson.category === "PERSONALIZADA" ? `Clase Personalizada (${dotLabel})` : catStyle.label}`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="block truncate font-black text-xs">
                                      {lesson.student}
                                    </span>
                                    {/* Puntito Indicador de Categoría de Edad en Clases Personalizadas */}
                                    {lesson.category === "PERSONALIZADA" && (
                                      <span
                                        className={`inline-block w-2.5 h-2.5 rounded-full ${dotColor} border border-white shadow-2xs shrink-0`}
                                        title={`Clase Personalizada · ${dotLabel}`}
                                      />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    {lesson.sessionNumber && (
                                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-black/20 text-foreground border border-black/10">
                                        {lesson.sessionNumber === 1 ? "1ra Clase" : "2da Clase"}
                                      </span>
                                    )}
                                    {conflictIds.has(lesson.id) && lesson.status !== "cancelada" && (
                                      <AlertTriangle className="h-3 w-3 text-destructive" />
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold opacity-90 mt-0.5">
                                  <span className="truncate">{lesson.instrument}</span>
                                  <span className="shrink-0 bg-background/40 px-1 rounded">{lesson.room}</span>
                                </div>
                                <div className="text-[9px] font-semibold text-muted-foreground/90 truncate mt-0.5">
                                  Prof. {lesson.teacher}
                                </div>
                              </button>
                            );
                          })}
                          {cell.length === 0 && (
                            <span className="text-[11px] text-muted-foreground/60 italic pl-2">
                              Sin clases programadas en este horario
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detalle */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.student}</SheetTitle>
                <SheetDescription>
                  {selected.instrument} · {selected.teacher}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-4 pb-8">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    <Clock className="mr-1 h-3 w-3" />
                    {selected.day} {selected.time}
                  </Badge>
                  <Badge variant="secondary">{selected.room}</Badge>
                  {selected.status === "cancelada" && <Badge variant="destructive">Cancelada</Badge>}
                  {conflictIds.has(selected.id) && selected.status !== "cancelada" && (
                    <Badge variant="destructive">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Conflicto de horario
                    </Badge>
                  )}
                </div>

                {/* PANEL DE ASISTENCIA RÁPIDA (DIRECTO EN GRILLA) */}
                <div className="space-y-3 rounded-2xl border-2 border-primary/20 p-4 bg-card shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <p className="text-xs font-black text-foreground uppercase tracking-wide">
                        Marcar Asistencia Rápida
                      </p>
                    </div>
                    {selected.attendanceStatus && (
                      <Badge
                        className={`text-[10px] font-black uppercase ${
                          selected.attendanceStatus === "presente"
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            : selected.attendanceStatus === "ausente"
                            ? "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30"
                            : selected.attendanceStatus === "tarde"
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                            : "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30"
                        }`}
                      >
                        ● {selected.attendanceStatus}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        markLessonAttendance(selected.id, "presente");
                        toast.success(`Asistencia marcada: ${selected.student} PRESENTE 🟢`);
                      }}
                      className={`h-9 font-bold text-xs gap-1.5 transition-all ${
                        selected.attendanceStatus === "presente"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800"
                      }`}
                    >
                      🟢 Presente
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => {
                        markLessonAttendance(selected.id, "ausente");
                        toast.error(`Asistencia marcada: ${selected.student} AUSENTE 🔴`);
                      }}
                      className={`h-9 font-bold text-xs gap-1.5 transition-all ${
                        selected.attendanceStatus === "ausente"
                          ? "bg-red-600 text-white shadow-xs"
                          : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 hover:bg-red-100 border border-red-300 dark:border-red-800"
                      }`}
                    >
                      🔴 Ausente
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => {
                        markLessonAttendance(selected.id, "tarde");
                        toast.warning(`Asistencia marcada: ${selected.student} TARDE 🟡`);
                      }}
                      className={`h-9 font-bold text-xs gap-1.5 transition-all ${
                        selected.attendanceStatus === "tarde"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100 border border-amber-300 dark:border-amber-800"
                      }`}
                    >
                      🟡 Tarde
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => {
                        markLessonAttendance(selected.id, "justificada");
                        toast.info(`Asistencia marcada: ${selected.student} JUSTIFICADA 🔵 (+1 Crédito de Recuperación)`);
                      }}
                      className={`h-9 font-bold text-xs gap-1.5 transition-all ${
                        selected.attendanceStatus === "justificada"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 hover:bg-blue-100 border border-blue-300 dark:border-blue-800"
                      }`}
                    >
                      🔵 Justificada (+1 Créd)
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border border-border p-4 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">Reprogramar Horario</p>
                    {selected.sessionNumber && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                        {selected.sessionNumber === 1 ? "1ra Clase Semanal" : "2da Clase Semanal"}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Nuevo Día</label>
                      <Select value={moveDay} onValueChange={(v) => setMoveDay(v as WeekDay)}>
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {weekDays.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Nueva Hora</label>
                      <Select value={moveTime} onValueChange={setMoveTime}>
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Selector de Alcance: Solo esta semana vs Todo el Mes */}
                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <label className="text-[11px] font-bold text-foreground block">
                      ¿Dónde aplicar el cambio de horario?
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setMoveScope("only-this-week")}
                        className={`p-2 rounded-xl border text-left font-semibold transition-all ${
                          moveScope === "only-this-week"
                            ? "border-primary bg-primary/10 text-primary shadow-2xs"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="font-bold">⚡ Solo esta semana</div>
                        <div className="text-[10px] opacity-80">Semana {currentWeekIndex + 1} de 4</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMoveScope("all")}
                        className={`p-2 rounded-xl border text-left font-semibold transition-all ${
                          moveScope === "all"
                            ? "border-primary bg-primary/10 text-primary shadow-2xs"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="font-bold">🗓️ Todo el mes</div>
                        <div className="text-[10px] opacity-80">Las 4 semanas de Agosto</div>
                      </button>
                    </div>
                  </div>

                  <Button
                    className="w-full font-bold text-xs"
                    disabled={selected.status === "cancelada"}
                    onClick={() => {
                      rescheduleLesson(selected.id, moveDay, moveTime, moveScope, currentWeekIndex);
                      toast.success(`Clase reprogramada a ${moveDay} ${moveTime}`, {
                        description: moveScope === "only-this-week"
                          ? `Aplicado únicamente para la Semana ${currentWeekIndex + 1} de 4.`
                          : "Aplicado para todas las 4 semanas del mes.",
                      });
                      setSelectedId(null);
                    }}
                  >
                    Guardar nuevo horario ({moveScope === "only-this-week" ? `Semana ${currentWeekIndex + 1}` : "Mes Completo"})
                  </Button>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/60">
                  <Button
                    variant="outline"
                    className="w-full text-warning border-warning/30 hover:bg-warning/10"
                    disabled={selected.status === "cancelada"}
                    onClick={() => {
                      const isPersonalizada = selected.category === "PERSONALIZADA";
                      cancelLesson(selected.id);
                      toast(isPersonalizada ? "Clase personalizada cancelada" : "Clase cancelada", {
                        description: isPersonalizada
                          ? "Política Vibra Music: Las clases personalizadas (S/ 50) no generan créditos de recuperación."
                          : "Se emitió 1 crédito de recuperación a la familia.",
                      });
                    }}
                  >
                    <CalendarX2 className="mr-2 h-4 w-4" />
                    {selected.category === "PERSONALIZADA"
                      ? "Cancelar clase personalizada (Sin crédito)"
                      : "Cancelar clase y emitir crédito"}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full text-destructive hover:bg-destructive/10 font-bold text-xs"
                    onClick={() => {
                      if (activeRole === "staff") {
                        setIsDeleteReqLessonOpen(true);
                        setDeleteLessonReason("");
                      } else {
                        if (confirm(`¿Estás seguro de eliminar permanentemente esta clase de ${selected.student} del horario?`)) {
                          removeLessonFromSchedule(selected.id);
                          toast.success(`Clase de ${selected.student} eliminada del horario`);
                          setSelectedId(null);
                        }
                      }
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {activeRole === "staff"
                      ? "🗑️ Eliminar Clase del Horario (Sin Crédito)"
                      : "Eliminar clase definitivamente del horario"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal de Solicitud de Eliminación de Clase para Secretaría Nayeli */}
      <Dialog open={isDeleteReqLessonOpen} onOpenChange={setIsDeleteReqLessonOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl border-destructive/30 bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Solicitar Eliminación de Clase a Dirección
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Como personal de Secretaría, la eliminación de una clase del horario requiere la aprobación de la Dueña.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!deleteLessonReason.trim()) {
                  toast.error("Por favor ingresa el motivo.");
                  return;
                }

                createDeletionRequest({
                  entityType: "lesson",
                  entityId: selected.id,
                  entityName: `Clase de ${selected.student}`,
                  details: `${selected.instrument} con Prof. ${selected.teacher} (${selected.day} ${selected.time} - ${selected.room})`,
                  reason: deleteLessonReason.trim(),
                });

                toast.success(`Solicitud enviada a Dirección`, {
                  description: `La Dueña autorizará la eliminación de la clase de ${selected.student}.`,
                });

                setIsDeleteReqLessonOpen(false);
                setSelectedId(null);
                setDeleteLessonReason("");
              }}
              className="space-y-4 py-2 text-xs"
            >
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3.5 space-y-1">
                <p className="font-black text-sm text-foreground">{selected.student}</p>
                <p className="text-[11px] text-muted-foreground">
                  {selected.instrument} · Prof. {selected.teacher} · <strong>{selected.day} {selected.time}</strong> ({selected.room})
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Motivo de la eliminación de la clase</label>
                <textarea
                  value={deleteLessonReason}
                  onChange={(e) => setDeleteLessonReason(e.target.value)}
                  placeholder="Ej: Alumno solicitó cambio de instrumento / Horario cancelado definitivamente / Clase duplicada..."
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/40 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteReqLessonOpen(false)}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Enviar a Dirección
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Sheet Modal: Historial Completo de Alumnos Reingresantes / Bajas */}
      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader className="border-b pb-3">
            <SheetTitle className="text-xl flex items-center gap-2">
              <History className="h-5 w-5 text-warning" />
              Historial de Alumnos y Bajas
            </SheetTitle>
            <SheetDescription>
              Busca alumnos anteriores para consultar su historial de clases, pagos o registrarlos como reingresantes.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por alumno, apoderado o instrumento..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="space-y-3">
              {adminStudents
                .filter(
                  (st) =>
                    st.name.toLowerCase().includes(historySearch.toLowerCase()) ||
                    st.family.toLowerCase().includes(historySearch.toLowerCase()) ||
                    st.instrument.toLowerCase().includes(historySearch.toLowerCase()),
                )
                .map((st) => (
                  <div
                    key={st.id}
                    className="rounded-2xl border border-border bg-card p-3.5 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-foreground">{st.name}</h4>
                      <Badge
                        className={`text-[10px] border-0 capitalize ${
                          st.status === "activo"
                            ? "bg-success/20 text-success"
                            : st.status === "pausa"
                            ? "bg-warning/20 text-warning-foreground"
                            : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {st.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground font-medium">
                      {st.family} · {st.instrument} ({st.teacher})
                    </p>

                    <div className="pt-2 border-t border-border space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                        <span className="text-muted-foreground">
                          Plan: <strong className="text-foreground">{st.planType || "Mensual"}</strong> (S/ {st.planPrice || 329}/m)
                        </span>
                        <span className="text-muted-foreground">
                          Período: <strong className="text-foreground">{st.planStartDate || "03/08/2026"} al {st.planEndDate || "31/08/2026"}</strong>
                        </span>
                      </div>

                      {/* Selectores de Cambio Rápido de Estado y Plan */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="text-[10px] text-muted-foreground font-semibold block mb-0.5">Estado</label>
                          <select
                            value={st.status}
                            onChange={(e) => {
                              useAppStore.getState().setStudentStatus(st.id, e.target.value as any);
                              toast.success(`Estado de ${st.name} actualizado a ${e.target.value}`);
                            }}
                            className="w-full h-7 rounded-lg border border-border bg-background px-2 text-[11px] font-medium"
                          >
                            <option value="activo">Activo</option>
                            <option value="pausa">En Pausa</option>
                            <option value="baja">Baja</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-muted-foreground font-semibold block mb-0.5">Plan Dossier</label>
                          <select
                            value={st.planType || "Mensual"}
                            onChange={(e) => {
                              const plan = e.target.value as "Mensual" | "Trimestral" | "Anual";
                              const prices = { Mensual: 329.0, Trimestral: 289.4, Anual: 263.2 };
                              useAppStore.getState().updateStudentDetails(st.id, {
                                planType: plan,
                                planPrice: prices[plan],
                              });
                              toast.success(`Plan de ${st.name} cambiado a ${plan}`);
                            }}
                            className="w-full h-7 rounded-lg border border-border bg-background px-2 text-[11px] font-medium"
                          >
                            <option value="Mensual">Mensual (S/ 329)</option>
                            <option value="Trimestral">Trimestral (S/ 289.40)</option>
                            <option value="Anual">Anual (S/ 263.20)</option>
                          </select>
                        </div>
                      </div>

                      {/* Fechas exactas de inicio y fin */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground font-semibold block mb-0.5">Fecha Inicio</label>
                          <input
                            type="date"
                            value={st.planStartDate || "2026-08-03"}
                            onChange={(e) => {
                              const newStart = e.target.value;
                              if (!newStart) return;
                              const [y, m, d] = newStart.split("-").map((v) => parseInt(v, 10));
                              const durationMonths = st.planType === "Trimestral" ? 3 : st.planType === "Anual" ? 12 : 1;
                              const endD = new Date(y!, (m! - 1) + durationMonths, d!);
                              endD.setDate(endD.getDate() - 1);
                              const endY = endD.getFullYear();
                              const endM = String(endD.getMonth() + 1).padStart(2, "0");
                              const endDay = String(endD.getDate()).padStart(2, "0");
                              const calculatedEndDate = `${endY}-${endM}-${endDay}`;

                              useAppStore.getState().updateStudentDetails(st.id, {
                                planStartDate: newStart,
                                planEndDate: calculatedEndDate,
                                planStartMonth: `${y}-${String(m).padStart(2, "0")}`,
                                planEndMonth: `${endY}-${endM}`,
                              });
                              toast.success(`Fecha de inicio de ${st.name} actualizada.`);
                            }}
                            className="w-full h-7 rounded-lg border border-border bg-background px-2 text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-muted-foreground font-semibold block mb-0.5">Fecha Vencimiento</label>
                          <input
                            type="date"
                            value={st.planEndDate || "2026-08-31"}
                            onChange={(e) => {
                              const newEnd = e.target.value;
                              if (!newEnd) return;
                              const [y, m] = newEnd.split("-");
                              useAppStore.getState().updateStudentDetails(st.id, {
                                planEndDate: newEnd,
                                planEndMonth: `${y}-${m}`,
                              });
                              toast.success(`Vencimiento de ${st.name} actualizado.`);
                            }}
                            className="w-full h-7 rounded-lg border border-border bg-background px-2 text-[11px]"
                          />
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-end">
                        {st.status !== "activo" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              useAppStore.getState().setStudentStatus(st.id, "activo");
                              toast.success(`Alumno ${st.name} reactivado como Activo.`);
                            }}
                            className="text-[11px] font-bold h-7 bg-success text-success-foreground hover:bg-success/90"
                          >
                            🚀 Confirmar Reingreso (Activar)
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal Dialog de Importación de Horario CSV/Excel para Nayeli */}
      <Dialog open={isCsvModalOpen} onOpenChange={setIsCsvModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <FileSpreadsheet className="h-5 w-5 text-success" />
              Importar Horario desde CSV / Excel
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Convierte y sube el horario de Nayeli en formato .CSV (valores separados por comas o punto y coma) para organizar toda la academia en segundos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 overflow-y-auto flex-1 pr-1">
            {/* Guía rápida y descarga de plantilla */}
            <div className="rounded-2xl border border-success/30 bg-success/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-success flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4" /> Formato de Columnas Requerido
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadCsvTemplate}
                  className="h-7 text-xs font-bold border-success/40 text-success hover:bg-success/10 gap-1"
                >
                  <Download className="h-3.5 w-3.5" /> Descargar Plantilla .CSV
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                El archivo debe tener las columnas: <br />
                <code className="font-mono font-bold text-foreground">
                  Alumno, Dia, Hora, Sala, Profesor, Instrumento, Categoria
                </code>
                <br />
                (Ej: <code className="text-xs">Valentina Ríos, Lun, 16:00, Sala A, Prof. Jeremy, Batería, JUNIOR</code>)
              </p>
            </div>

            {/* Zona de Subida de Archivo */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">1. Seleccionar archivo .csv</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,text/csv,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 text-xs font-bold border-dashed border-2 flex-1 py-5"
                >
                  <Upload className="h-4 w-4 text-primary" /> Subir archivo .CSV desde la computadora
                </Button>
              </div>
            </div>

            {/* O pegar texto directo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                O pegar directamente el contenido de Excel / CSV:
              </label>
              <textarea
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  parseCsvContent(e.target.value);
                }}
                placeholder="Alumno,Dia,Hora,Sala,Profesor,Instrumento,Categoria&#10;Lucas Medina,Lun,16:45,Sala 2,Prof. Fernando,Piano,INFANTIL"
                rows={4}
                className="w-full rounded-xl border border-border bg-background p-3 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
              />
            </div>

            {/* Errores de validación si existen */}
            {csvErrors.length > 0 && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 space-y-1">
                <p className="text-xs font-bold text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Errores detectados ({csvErrors.length})
                </p>
                <ul className="text-[11px] text-destructive list-disc list-inside max-h-24 overflow-y-auto">
                  {csvErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Previsualización de clases parseadas */}
            {csvPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" /> Vista Previa: {csvPreview.length} Clases Listas
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">
                    Horario estructurado
                  </span>
                </div>

                <div className="max-h-40 overflow-y-auto rounded-xl border border-border divide-y divide-border text-xs bg-muted/20">
                  {csvPreview.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-foreground">{item.student}</span>
                        <span className="text-[11px] text-muted-foreground ml-2">
                          ({item.instrument} · {item.teacher})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {item.day} {item.time}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {item.room}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción final */}
          {/* Botones de acción final */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border mt-2">
            {/* Solo la Dueña (super_admin) puede vaciar el horario */}
            {activeRole === "super_admin" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOwnerPassword("");
                  setConfirmPhrase("");
                  setIsClearSecureOpen(true);
                }}
                className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1 font-bold"
              >
                <Trash2 className="h-3.5 w-3.5" /> Vaciar Horario (Solo Dueña)
              </Button>
            ) : (
              <span className="text-[11px] text-muted-foreground italic flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Vaciado reservado a Dirección
              </span>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCsvModalOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={csvPreview.length === 0}
                onClick={() => handleApplyCsv("append")}
                className="text-xs font-bold"
              >
                Añadir al Horario (+{csvPreview.length})
              </Button>
              <Button
                size="sm"
                disabled={csvPreview.length === 0}
                onClick={() => handleApplyCsv("replace")}
                className="text-xs font-bold bg-success hover:bg-success/90 text-success-foreground"
              >
                🚀 Reemplazar Todo el Horario ({csvPreview.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Vaciado Seguro Estilo GitHub para la Dueña (2 Filtros de Seguridad) */}
      <Dialog open={isClearSecureOpen} onOpenChange={setIsClearSecureOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl border-destructive/40 bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Confirmación Crítica: Vaciar Horario
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Esta acción es irreversible y eliminará todas las clases programadas en la agenda de Vibra Music. Para proceder, debes completar los 2 filtros de seguridad de Dirección.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Filtro 1: Contraseña de la Dueña */}
            <div className="space-y-1.5 rounded-xl border border-border bg-muted/30 p-3">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-primary" /> 1. Contraseña de Dirección (Dueña)
              </label>
              <Input
                type="password"
                placeholder="Ingresa tu contraseña de ingreso..."
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                className="text-xs bg-background"
              />
            </div>

            {/* Filtro 2: Reconfirmación de Texto (Estilo GitHub) */}
            <div className="space-y-1.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
              <label className="text-xs font-bold text-destructive">
                2. Para confirmar, escribe exactamente:
              </label>
              <p className="font-mono text-xs font-black select-all bg-background/80 p-1.5 rounded border border-destructive/30 text-center tracking-wider text-destructive">
                {EXPECTED_PHRASE}
              </p>
              <Input
                type="text"
                placeholder={`Escribe '${EXPECTED_PHRASE}'`}
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                className="text-xs bg-background font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClearSecureOpen(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={
                ownerPassword.trim().length === 0 ||
                confirmPhrase.trim() !== EXPECTED_PHRASE
              }
              onClick={() => {
                clearSchedule();
                toast.success("🗑️ Horario vaciado con éxito por la Dueña.");
                setIsClearSecureOpen(false);
                setIsCsvModalOpen(false);
              }}
              className="text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ⚠️ Confirmar y Vaciar Horario
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Configuración de Timbre Acústico Oficial (school bell.mp3) */}
      <Dialog open={isChimeSettingsOpen} onOpenChange={setIsChimeSettingsOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl border-warning/40 bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-warning-foreground">
              <Bell className="h-5 w-5 text-warning" />
               Configuración de Timbre de Clases
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Configura la reproducción automática de <code className="text-xs font-mono font-bold text-foreground">school bell.mp3</code> para marcar el inicio y fin de las clases en sede.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Activar / Desactivar Timbre Automático */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/30">
              <div>
                <p className="text-xs font-bold text-foreground">Timbre Automático por Horario</p>
                <p className="text-[11px] text-muted-foreground">Suena solo al iniciar y finalizar cada bloque</p>
              </div>
              <input
                type="checkbox"
                checked={chimeSettings?.autoPlayEnabled ?? true}
                onChange={(e) => setChimeSettings({ autoPlayEnabled: e.target.checked })}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>

            {/* Franjas Horarias Programadas de Vibra Music */}
            <div className="space-y-2 p-3 rounded-2xl border border-border bg-muted/15 text-xs">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> Franjas configuradas:
              </p>
              <div className="space-y-1 text-[11px] text-muted-foreground">
                <p>
                  <strong className="text-foreground">Lunes a Viernes (Turno Tarde):</strong> 16:00, 16:45, 17:30, 18:15, 19:00, 19:45
                </p>
                <p>
                  <strong className="text-foreground">Sábados (Turno Mañana):</strong> 09:00, 09:45, 10:30, 11:15, 12:00, 12:45, 13:30
                </p>
              </div>
            </div>

            {/* Control de Volumen y Prueba */}
            <div className="space-y-2 p-3 rounded-2xl border border-border bg-muted/30">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Volume2 className="h-3.5 w-3.5 text-primary" /> Volumen del Timbre
                </span>
                <span className="text-primary">{Math.round((chimeSettings?.volume ?? 0.8) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={chimeSettings?.volume ?? 0.8}
                onChange={(e) => setChimeSettings({ volume: parseFloat(e.target.value) })}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                playOfficialChime();
                toast.success("🔔 Timbre de prueba emitido");
              }}
              className="text-xs font-bold gap-1"
            >
              <Bell className="h-3.5 w-3.5" /> Probar Sonido
            </Button>
            <Button
              size="sm"
              onClick={() => setIsChimeSettingsOpen(false)}
              className="text-xs font-bold bg-primary text-primary-foreground"
            >
              Guardar Configuración
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Programar Nueva Clase en Horario */}
      <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl border-primary/30 bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <PlusCircle className="h-5 w-5 text-primary" />
              Programar Clase en Horario
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Asigna a un alumno existente o ingresa su nombre, elige profesor, sala y horario de clase.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newLessonStudent.trim()) {
                toast.error("Ingresa el nombre del alumno");
                return;
              }
              const finalTeacher = newLessonTeacher || availableTeachers[0] || "Prof. por Asignar";

              addLessonToSchedule({
                student: newLessonStudent.trim(),
                teacher: finalTeacher,
                instrument: newLessonInstrument,
                day: newLessonDay,
                time: newLessonTime,
                room: newLessonRoom,
                category: newLessonCategory,
                status: "programada",
              });

              toast.success(`Clase de ${newLessonStudent} programada`, {
                description: `${newLessonDay} a las ${newLessonTime} en ${newLessonRoom} con Prof. ${finalTeacher}.`,
              });

              setIsAddLessonOpen(false);
              setNewLessonStudent("");
            }}
            className="space-y-4 py-2 text-xs"
          >
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Alumno</label>
              <div className="space-y-1">
                <Input
                  type="text"
                  placeholder="Escribe el nombre del alumno..."
                  value={newLessonStudent}
                  onChange={(e) => setNewLessonStudent(e.target.value)}
                  className="text-xs"
                  required
                />
                {adminStudents.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[10px] text-muted-foreground">Sugeridos:</span>
                    {adminStudents.slice(0, 4).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setNewLessonStudent(st.name);
                          if (st.teacher) setNewLessonTeacher(st.teacher);
                          if (st.instrument) setNewLessonInstrument(st.instrument);
                          if (st.ageCategory) setNewLessonCategory(st.ageCategory);
                        }}
                        className="text-[10px] bg-muted px-2 py-0.5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {st.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Profesor Asignado</label>
                <Select
                  value={newLessonTeacher || availableTeachers[0] || ""}
                  onValueChange={setNewLessonTeacher}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Seleccionar profesor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeachers.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Instrumento</label>
                <Select value={newLessonInstrument} onValueChange={setNewLessonInstrument}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {instruments.map((inst) => (
                      <SelectItem key={inst} value={inst}>
                        {inst}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Categoría Oficial</label>
                <Select value={newLessonCategory} onValueChange={(v) => setNewLessonCategory(v as AgeCategory)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JUNIOR">🟡 Junior (7 a 12)</SelectItem>
                    <SelectItem value="JUVENIL">🟢 Juvenil (13 a 17)</SelectItem>
                    <SelectItem value="ADULTO">⚫ Adulto (18 a +)</SelectItem>
                    <SelectItem value="INFANTIL">🟣 Infantil (5 y 6)</SelectItem>
                    <SelectItem value="RECUPERACION">🔴 Recuperación</SelectItem>
                    <SelectItem value="PERSONALIZADA">🔵 Personalizada (S/ 50)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Día</label>
                <Select value={newLessonDay} onValueChange={(v) => setNewLessonDay(v as WeekDay)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {weekDays.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Horario</label>
                <Select
                  value={newLessonTime}
                  onValueChange={setNewLessonTime}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(newLessonDay === "Sáb" ? timeSlotsSaturday : timeSlotsWeekday).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Sala</label>
                <Select value={newLessonRoom} onValueChange={setNewLessonRoom}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddLessonOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs font-bold bg-primary text-primary-foreground"
              >
                Guardar en Horario
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog: Programar Clase de Recuperación */}
      <Dialog open={isMakeupModalOpen} onOpenChange={setIsMakeupModalOpen}>
        <DialogContent className="sm:max-w-lg p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-red-700 dark:text-red-300">
              <span className="p-1.5 rounded-lg bg-red-500/10 text-red-600">
                <RotateCcw className="h-4 w-4" />
              </span>
              Programar Clase de Recuperación
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Agenda una sesión de recuperación oficial (categoría RECUPERACIÓN) y descuenta automáticamente 1 crédito del alumno.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!makeupStudent.trim()) {
                toast.error("Por favor selecciona un alumno.");
                return;
              }

              scheduleMakeupLesson({
                studentName: makeupStudent.trim(),
                teacher: makeupTeacher || availableTeachers[0] || "Jeremy",
                instrument: makeupInstrument,
                day: makeupDay,
                time: makeupTime,
                room: makeupRoom,
                category: makeupCategory,
                recoveringLessonDate: makeupOriginalDate.trim() || "Clase previa justificada",
              });

              toast.success(`Recuperación programada para ${makeupStudent}`, {
                description: `${makeupDay} a las ${makeupTime} en ${makeupRoom} con Prof. ${makeupTeacher || "Jeremy"}. Se descontó 1 crédito.`,
              });

              setIsMakeupModalOpen(false);
              setMakeupOriginalDate("");
            }}
            className="space-y-4 py-2 text-xs"
          >
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Alumno que Recupera</label>
              <Select
                value={makeupStudent}
                onValueChange={(val) => {
                  setMakeupStudent(val);
                  const st = adminStudents.find((s) => s.name === val);
                  if (st) {
                    if (st.teacher) setMakeupTeacher(st.teacher);
                    if (st.instrument) setMakeupInstrument(st.instrument);
                    if (st.ageCategory) setMakeupCategory(st.ageCategory);
                  }
                }}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Selecciona el alumno..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {adminStudents.map((st) => (
                    <SelectItem key={st.id} value={st.name}>
                      {st.name} {st.makeupCredits > 0 ? `(${st.makeupCredits} crédito${st.makeupCredits > 1 ? "s" : ""} disponible${st.makeupCredits > 1 ? "s" : ""})` : "(0 créditos)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Profesor</label>
                <Select
                  value={makeupTeacher || availableTeachers[0] || ""}
                  onValueChange={setMakeupTeacher}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Profesor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeachers.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Instrumento</label>
                <Select value={makeupInstrument} onValueChange={setMakeupInstrument}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {instruments.map((inst) => (
                      <SelectItem key={inst} value={inst}>
                        {inst}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Sala</label>
                <Select value={makeupRoom} onValueChange={setMakeupRoom}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Día de Recuperación</label>
                <Select value={makeupDay} onValueChange={(v) => setMakeupDay(v as WeekDay)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {weekDays.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Hora de Recuperación</label>
                <Select value={makeupTime} onValueChange={setMakeupTime}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(makeupDay === "Sáb" ? timeSlotsSaturday : timeSlotsWeekday).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Motivo / Fecha de la Falta Original</label>
              <Input
                type="text"
                placeholder="Ej: Falta justificada del Viernes 08/08 (Salud / Viaje)"
                value={makeupOriginalDate}
                onChange={(e) => setMakeupOriginalDate(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-800 dark:text-red-300">
              💡 <strong>Regla Vibra Music:</strong> La sesión aparecerá con el color Salmón Oficial de Recuperación y descontará 1 crédito del alumno al guardar.
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMakeupModalOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Guardar y Descontar Crédito
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: Array<string | { value: string; label: string }>;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[11.5rem] h-8 text-xs bg-background">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}: Todos</SelectItem>
        {options.map((opt) => {
          const optVal = typeof opt === "string" ? opt : opt.value;
          const optLabel = typeof opt === "string" ? opt : opt.label;
          return (
            <SelectItem key={optVal} value={optVal}>
              {optLabel}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  hint,
  alert,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  hint?: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className={`h-4 w-4 ${alert ? "text-destructive" : "text-primary"}`} />
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
