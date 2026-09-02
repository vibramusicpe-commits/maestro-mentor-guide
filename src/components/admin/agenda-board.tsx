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
  BookOpen,
  Users,
  UserPlus,
  Sparkles,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import {
  useAppStore,
  playSyntheticBellChime,
  type ScheduledLesson,
  type WeekDay,
  type AdminStudent,
} from "@/store/app-store";

// Función del Timbre Acústico de Fin/Inicio de Clase (Campana Escolar y Armónico Web Audio)
export function playClassChime() {
  try {
    const audio = new Audio("/school-bell.mp3");
    audio.volume = 0.9;
    audio.play().catch(() => {
      playSyntheticBellChime(0.9);
    });
  } catch {
    playSyntheticBellChime(0.9);
  }
}

import {
  rooms,
  teachers,
  defaultTeacherRooms,
  musicalInstruments,
  timeSlots,
  weekDays,
  timeSlotsWeekday,
  timeSlotsSaturday,
  VIBRA_PRICING,
} from "@/store/admin-seeds";
import {
  getMonthWeeks,
  MONTHS_NAME,
  WEEKDAY_FULL_NAMES,
  type CalendarWeekInfo,
} from "@/lib/calendar-utils";
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
  RECUPERACION: { bg: "bg-[#EF4444]", text: "text-white font-black", border: "border-[#DC2626]", label: "RECUPERACIÓN DE CLASES" },
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
  const deleteLessonFromSchedule = useAppStore((s) => s.deleteLessonFromSchedule);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [newLessonStudent, setNewLessonStudent] = useState("");
  const [newLessonTeacher, setNewLessonTeacher] = useState("");
  const [newLessonInstrument, setNewLessonInstrument] = useState(musicalInstruments[0] || "Piano");
  const [newLessonDay, setNewLessonDay] = useState<WeekDay>("Lun");
  const [newLessonTime, setNewLessonTime] = useState(timeSlotsWeekday[0] || "16:00");
  const [newLessonRoom, setNewLessonRoom] = useState(rooms[0] || "Sala A");
  const [newLessonCategory, setNewLessonCategory] = useState<AgeCategory>("JUNIOR");
  const [newLessonScope, setNewLessonScope] = useState<"only-this-week" | "all">("only-this-week");
  const [targetExistingLessonId, setTargetExistingLessonId] = useState<string | "new">("new");

  // Estados de Búsqueda y Autocompletado de Alumnos (99 Alumnos)
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

  // Estados de Libreta de Asistencias y Control de Plan (8 o 4 clases)
  const [isAttendanceLedgerOpen, setIsAttendanceLedgerOpen] = useState(false);
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState("");
  const [ledgerTeacherFilter, setLedgerTeacherFilter] = useState("all");
  const [ledgerPlanFilter, setLedgerPlanFilter] = useState("all");

  // Filtro dinámico de alumnos: solo se activa cuando se escribe en la barra de búsqueda
  const filteredStudentsList = useMemo(() => {
    const trimmed = studentSearchQuery.trim();
    if (!trimmed) return [];
    const cleanQuery = trimmed.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return adminStudents.filter((st) => {
      const nameNorm = st.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return nameNorm.includes(cleanQuery);
    }).slice(0, 6);
  }, [adminStudents, studentSearchQuery]);

  // Detección de clases existentes del alumno para el modal de programación
  const currentStudentLessons = useMemo(() => {
    const q = (newLessonStudent || studentSearchQuery).trim().toLowerCase();
    if (!q) return [];
    return schedule.filter(
      (l) =>
        (l.student.toLowerCase() === q ||
          l.student.toLowerCase().includes(q) ||
          q.includes(l.student.toLowerCase())) &&
        l.status !== "cancelada",
    );
  }, [schedule, newLessonStudent, studentSearchQuery]);

  const handleSelectStudentForNewLesson = (st: AdminStudent) => {
    setNewLessonStudent(st.name);
    setStudentSearchQuery(st.name);
    if (!newLessonTeacher && st.teacher) setNewLessonTeacher(st.teacher);
    if (st.instrument) setNewLessonInstrument(st.instrument);
    if (st.ageCategory) setNewLessonCategory(st.ageCategory);

    // Detección automática de clases existentes para permitir mover o agregar sesión
    const existing = schedule.filter(
      (l) =>
        (l.student.toLowerCase() === st.name.toLowerCase() ||
          l.student.toLowerCase().includes(st.name.toLowerCase()) ||
          st.name.toLowerCase().includes(l.student.toLowerCase())) &&
        l.status !== "cancelada",
    );

    if (existing.length > 0) {
      const first = existing[0]!;
      setTargetExistingLessonId(first.id);
      if (!newLessonTeacher) setNewLessonTeacher(first.teacher);
      if (!newLessonRoom) setNewLessonRoom(first.room);
    } else {
      setTargetExistingLessonId("new");
    }

    setIsStudentDropdownOpen(false);
    toast.info(`Alumno: ${st.name}`, {
      description: existing.length > 0
        ? `Tiene ${existing.length} clase(s) agendada(s). Puedes mover su horario o agregar una nueva sesión.`
        : `Seleccionado: ${st.instrument} · Prof. ${newLessonTeacher || st.teacher || "Por asignar"} · ${st.ageCategory || "JUNIOR"}`,
    });
  };

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

  // Estados para Agregar Alumno / Evento en el Horario seleccionado (Zona de confort de Nayeli)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [addEventType, setAddEventType] = useState<"recuperacion" | "personalizada" | "regular">("recuperacion");
  const [addEventStudentQuery, setAddEventStudentQuery] = useState("");
  const [addEventSelectedStudent, setAddEventSelectedStudent] = useState<AdminStudent | null>(null);
  const [isAddEventDropdownOpen, setIsAddEventDropdownOpen] = useState(false);
  const [addEventScope, setAddEventScope] = useState<"only-this-week" | "all">("only-this-week");

  // Filtro reactivo de alumnos para el dropdown del panel lateral
  const filteredAddEventStudents = useMemo(() => {
    const trimmed = addEventStudentQuery.trim();
    if (!trimmed) return [];
    const cleanQuery = trimmed.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return adminStudents.filter((st) => {
      const nameNorm = st.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return nameNorm.includes(cleanQuery);
    }).slice(0, 6);
  }, [adminStudents, addEventStudentQuery]);

  // Estados de Solicitud de Eliminación de Clase para Secretaría Nayeli
  const createDeletionRequest = useAppStore((s) => s.createDeletionRequest);
  const [isDeleteReqLessonOpen, setIsDeleteReqLessonOpen] = useState(false);
  const [deleteLessonReason, setDeleteLessonReason] = useState("");


  const monthsName = MONTHS_NAME;

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

  // Semanas reales calculadas dinámicamente para el mes y año seleccionado (Soporte Semana 5 y fechas exactas)
  const monthWeeks = useMemo(() => {
    return getMonthWeeks(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const safeWeekIndex = Math.min(currentWeekIndex, Math.max(0, monthWeeks.length - 1));
  const currentWeekObj = monthWeeks[safeWeekIndex] || monthWeeks[0]!;

  // Filtrado reactivo estricto para eliminar cruces o datos no solicitados (Bugfix Crítico)
  const visible = useMemo(
    () =>
      schedule.filter(
        (l) => {
          // 1. Filtrado por estado de alumno (si el alumno está dado de baja, no mostrar en agenda)
          const studentProfile = adminStudents.find(
            (st) => st.name.toLowerCase() === l.student.toLowerCase(),
          );

          if (l.isMakeup) {
            // Clases de recuperación son puntuales para su mes/año específico
            const lYear = l.year ?? 2026;
            const lMonth = l.month ?? selectedMonth;
            if (lYear !== selectedYear || lMonth !== selectedMonth) return false;
          } else {
            // Si el alumno está dado de baja, no mostrar en la agenda activa
            if (studentProfile && studentProfile.status === "baja") return false;
          }

          // 2. Filtro de semana específica (si aplica a semana individual o al mes completo)
          if (l.weekIndex !== undefined && l.weekIndex !== safeWeekIndex) {
            return false;
          }
          if (l.excludedWeeks?.includes(safeWeekIndex)) {
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
    [schedule, adminStudents, teacher, room, instrument, category, dayGroup, safeWeekIndex, selectedYear, selectedMonth, selectedYearMonthStr],
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
                disabled={safeWeekIndex === 0}
                className="h-7 w-7 rounded-md"
                title="Semana anterior"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="font-bold text-[11px] px-1.5 py-0.5 rounded bg-background text-foreground shadow-2xs whitespace-nowrap">
                Semana {safeWeekIndex + 1} de {monthWeeks.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentWeekIndex((w) => Math.min(monthWeeks.length - 1, w + 1))}
                disabled={safeWeekIndex >= monthWeeks.length - 1}
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

          {/* Botón de Libreta de Asistencias y Control de Plan */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAttendanceLedgerOpen(true)}
            className="gap-1.5 font-bold border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20"
          >
            <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            📖 Libreta de Asistencias y Plan
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

            const renderSingleDayTable = (dayName: WeekDay, _dayOffset?: number) => {
              const dayLessonsForTable = visible.filter((l) => l.day === dayName && l.status !== "cancelada");
              const currentSlots = dayName === "Sáb" ? timeSlotsSaturday : timeSlotsWeekday;
              const mainTeachersList = defaultTeacherRooms;
              const dayInfo = currentWeekObj.days.find((d) => d.dayKey === dayName) || currentWeekObj.days[0]!;

              return (
                <div className="flex-1 rounded-2xl border-2 border-slate-400 bg-white dark:bg-slate-950 shadow-md overflow-hidden flex flex-col w-full">
                  {/* Encabezado del Día */}
                  <div className="bg-[#FCD7D2] px-3 py-1.5 border-b-2 border-slate-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs sm:text-sm text-slate-950 uppercase tracking-wide">
                        {WEEKDAY_FULL_NAMES[dayName]?.toUpperCase()} {dayInfo.dayNum} {dayInfo.monthName.slice(0, 3)}
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
                                const lessons = dayLessonsForTable.filter((l) => {
                                  if (l.time !== timeSlot) return false;
                                  const teacherMatches = l.teacher.toLowerCase().includes(tInfo.name.toLowerCase());
                                  if (teacherMatches) return true;
                                  const matchesOtherTeacher = mainTeachersList.some((m) => l.teacher.toLowerCase().includes(m.name.toLowerCase()));
                                  if (!matchesOtherTeacher && l.room.toLowerCase().trim() === tInfo.room.toLowerCase().trim()) {
                                    return true;
                                  }
                                  return false;
                                });

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
                                          const isRecup = lesson.isMakeup || lesson.category === "RECUPERACION";
                                          const catKey = isRecup ? "RECUPERACION" : (lesson.category ?? "JUNIOR");
                                          const catStyle = categoryStyles[catKey] || categoryStyles.JUNIOR!;
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
                                                isRecup
                                                  ? "CLASE DE RECUPERACIÓN (ROJO)"
                                                  : lesson.category === "PERSONALIZADA"
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
                                              {isRecup && (
                                                <span className="text-[8px] font-black uppercase text-white bg-black/30 px-1 py-0.2 rounded mt-0.5 inline-block shadow-2xs">
                                                  🔴 Recuperación
                                                </span>
                                              )}
                                              {/* Puntito Indicador de Asistencia Marcada (Aislado por Semana) */}
                                              {(() => {
                                                const cardAtt = lesson.attendanceByWeek?.[currentWeekIndex] ?? (lesson.weekIndex === currentWeekIndex ? lesson.attendanceStatus : undefined);
                                                if (!cardAtt) return null;
                                                return (
                                                  <span
                                                    className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full border border-white shadow-2xs ${
                                                      cardAtt === "presente"
                                                        ? "bg-emerald-500 ring-1 ring-emerald-400/50"
                                                        : cardAtt === "ausente"
                                                        ? "bg-red-500 ring-1 ring-red-400/50"
                                                        : cardAtt === "tarde"
                                                        ? "bg-amber-500 ring-1 ring-amber-400/50"
                                                        : "bg-blue-500 ring-1 ring-blue-400/50"
                                                    }`}
                                                    title={`Asistencia Semana ${currentWeekIndex + 1}: ${cardAtt.toUpperCase()}`}
                                                  />
                                                );
                                              })()}
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
                      {currentWeekObj.fullLabel}
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
                const dayInfo = currentWeekObj.days[selectedDayIndex] || currentWeekObj.days[0]!;
                return (
                  <>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                      {currentWeekObj.fullLabel}
                    </span>
                    <h3 className="text-xl font-black text-foreground">
                      {WEEKDAY_FULL_NAMES[currentDayName]} {dayInfo.dayNum} de {dayInfo.monthName}
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
              const dayInfo = currentWeekObj.days[idx] || currentWeekObj.days[0]!;
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
                    {dayInfo.dayNum} {dayInfo.monthName.slice(0, 3)}
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
                const mainTeachersList = defaultTeacherRooms;

                return (
                  <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                    {/* Encabezado de Columnas por Profesor Estilo Excel Oficial */}
                    <div className="grid grid-cols-[85px_repeat(4,1fr)] bg-muted/90 border-b border-border text-center font-black text-xs uppercase tracking-wider sticky top-0 z-10">
                      <div className="py-2 px-1.5 border-r border-border bg-[#F4A59C] text-slate-950 flex items-center justify-center gap-1 font-black tracking-wider shadow-2xs text-[11px]">
                        <Clock className="h-3 w-3 text-slate-950" /> HORA
                      </div>
                      {mainTeachersList.map((tInfo) => (
                        <div
                          key={tInfo.name}
                          className="py-1.5 px-2 border-r border-border last:border-r-0 flex items-center justify-center gap-1.5 font-bold text-foreground text-xs"
                        >
                          <span className="w-2 h-2 rounded-full bg-primary inline-block shrink-0" />
                          <span>PROF. {tInfo.name.toUpperCase()}</span>
                          <span className="text-[10px] font-bold text-primary opacity-90">({tInfo.room})</span>
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
                            className="grid grid-cols-[85px_repeat(4,1fr)] min-h-[48px] hover:bg-muted/10 transition-colors items-stretch"
                          >
                            {/* Columna de Hora con alto contraste: Fondo salmón del Excel + texto oscuro nítido */}
                            <div className="p-1 border-r border-border bg-[#FCD7D2] flex flex-col items-center justify-center text-center font-mono text-slate-950 shadow-2xs select-none">
                              <span className="text-xs font-black text-slate-950 tracking-tight leading-tight">{timeSlot}</span>
                              <span className="text-[9px] font-bold text-slate-700 leading-tight">{endH}:{endM}</span>
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
                                  className="p-1 border-r border-border last:border-r-0 flex flex-col gap-1 justify-center"
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
                                      className="h-full min-h-[40px] rounded-lg border border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center text-[10px] text-muted-foreground/80 transition-colors cursor-pointer group py-1"
                                    >
                                      <span className="group-hover:text-primary font-medium flex items-center gap-1">
                                        <PlusCircle className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                                        Disponible
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-1 h-full justify-center">
                                      {lessonsForTeacher.map((lesson) => {
                                        const isRecup = lesson.isMakeup || lesson.category === "RECUPERACION";
                                        const catKey = isRecup ? "RECUPERACION" : (lesson.category ?? "JUNIOR");
                                        const catStyle = categoryStyles[catKey] || categoryStyles.JUNIOR!;
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
                                            className={`cursor-pointer rounded-lg border ${catStyle.border} ${catStyle.bg} px-2 py-1 shadow-2xs hover:shadow-md transition-all flex flex-col justify-center group relative`}
                                            title={`${lesson.student} (${lesson.instrument}) - ${lesson.room} · ${
                                              isRecup
                                                ? "CLASE DE RECUPERACIÓN (ROJO)"
                                                : lesson.category === "PERSONALIZADA"
                                                ? `Clase Personalizada (${dotLabel})`
                                                : catStyle.label
                                            }`}
                                          >
                                            {/* Línea 1: Nombre + Badges */}
                                            <div className="flex items-center justify-between gap-1">
                                              <div className="flex items-center gap-1 min-w-0">
                                                <h4 className={`font-black text-[11px] leading-tight ${catStyle.text} truncate group-hover:underline`}>
                                                  {lesson.student}
                                                </h4>
                                                {isRecup && (
                                                  <span className="text-[7.5px] font-black uppercase text-white bg-black/40 px-1 py-0.2 rounded shrink-0">
                                                    🔴 Recup
                                                  </span>
                                                )}
                                                {/* Distintivo de Alumno Nuevo en su primera semana */}
                                                {(studentProfile?.joinedAt?.includes("18/08") ||
                                                  studentProfile?.teacherNote?.toLowerCase().includes("nueva") ||
                                                  studentProfile?.teacherNote?.toLowerCase().includes("nuevo") ||
                                                  studentProfile?.teacherNote?.toLowerCase().includes("prueba")) && (
                                                  <span
                                                    className="px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[7.5px] leading-none shrink-0"
                                                    title="Alumno Nuevo / Recién Matriculado"
                                                  >
                                                    ✨
                                                  </span>
                                                )}
                                                {/* Puntito Indicador de Categoría de Edad en Clases Personalizadas */}
                                                {lesson.category === "PERSONALIZADA" && (
                                                  <span
                                                    className={`w-2 h-2 rounded-full ${dotColor} border border-white shadow-2xs shrink-0`}
                                                    title={`Clase Personalizada · ${dotLabel}`}
                                                  />
                                                )}
                                              </div>
                                              <span className="font-mono text-[8.5px] font-bold bg-background/90 text-foreground px-1 py-0.2 rounded border border-border/80 shrink-0">
                                                {lesson.room}
                                              </span>
                                            </div>

                                            {/* Línea 2: Instrumento + Botón de Editar */}
                                            <div className="flex items-center justify-between text-[9.5px] pt-0.5 mt-0.5 border-t border-black/10">
                                              <span className={`font-semibold ${catStyle.text} opacity-90 truncate`}>
                                                🎵 {lesson.instrument}
                                              </span>
                                              <span className={`font-bold ${catStyle.text} opacity-80 text-[8.5px] group-hover:opacity-100 group-hover:underline`}>
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

          {/* Rejilla Semanal Separada y Perfectamente Alineada (Modo Compacto de Alta Densidad) */}
          <div className="space-y-4">
            {/* Bloque 1: Lunes a Viernes (Horario de Tarde: 16:00 - 19:45) */}
            <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
              <div className="bg-primary/5 px-3.5 py-2 border-b border-border flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Turno Tarde · Lunes a Viernes (16:00 a 19:45)
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">
                  Bloques de 45 minutos · Salas A a D
                </span>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[48rem]">
                  {/* Cabecera de Días L-V con Fechas */}
                  <div className="grid grid-cols-[5.5rem_repeat(5,1fr)] border-b border-border bg-muted/40 text-center">
                    <div className="py-1.5 px-2 text-[11px] font-black text-muted-foreground uppercase flex items-center justify-center">
                      Horario
                    </div>
                    {(["Lun", "Mar", "Mié", "Jue", "Vie"] as WeekDay[]).map((d, dIdx) => {
                      const dayInfo = currentWeekObj.days[dIdx] || currentWeekObj.days[0]!;
                      return (
                        <div key={d} className="py-1.5 px-2 text-xs font-black text-foreground border-l border-border/60">
                          <div>{WEEKDAY_FULL_NAMES[d]}</div>
                          <span className="text-[9.5px] font-semibold text-muted-foreground">
                            {dayInfo.dayNum} {dayInfo.monthName.slice(0, 3)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Filas de Horario L-V */}
                  {timeSlotsWeekday.map((slot) => (
                    <div
                      key={`weekday-${slot}`}
                      className="grid grid-cols-[5.5rem_repeat(5,1fr)] border-b border-border last:border-b-0 items-stretch"
                    >
                      <div className="p-1.5 font-mono text-[11px] font-black text-foreground flex items-center justify-center bg-muted/20 select-none">
                        {slot}
                      </div>
                      {(["Lun", "Mar", "Mié", "Jue", "Vie"] as WeekDay[]).map((day) => {
                        const cell = visible.filter((l) => l.day === day && l.time === slot);
                        return (
                          <div
                            key={`cell-${day}-${slot}`}
                            className="border-l border-border/60 p-1 min-h-[3.2rem] flex flex-col gap-1 justify-start bg-background/50"
                          >
                            {cell.map((lesson) => {
                              const isRecup = lesson.isMakeup || lesson.category === "RECUPERACION";
                              const catKey = isRecup ? "RECUPERACION" : (lesson.category ?? "JUNIOR");
                              const catStyle = categoryStyles[catKey] ?? categoryStyles.JUNIOR!;
                              const studentProfile = adminStudents.find(
                                (st) => st.name.toLowerCase() === lesson.student.toLowerCase()
                              );
                              
                              const studentAgeCat =
                                studentProfile?.ageCategory ||
                                (lesson.student.toLowerCase().includes("joan paolo")
                                  ? "ADULTO"
                                  : lesson.student.toLowerCase().includes("mishel")
                                  ? "JUVENIL"
                                  : lesson.student.toLowerCase().includes("mirko")
                                  ? "JUNIOR"
                                  : "JUNIOR");

                              const dotColor =
                                studentAgeCat === "JUVENIL"
                                  ? "bg-[#4CAF50]"
                                  : studentAgeCat === "ADULTO"
                                  ? "bg-[#757575]"
                                  : studentAgeCat === "INFANTIL"
                                  ? "bg-[#7C4DFF]"
                                  : "bg-[#FBC02D]";

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
                                  className={`w-full rounded-lg border px-1.5 py-0.5 text-left transition-all hover:scale-[1.01] hover:shadow-xs focus:outline-none focus:ring-1 focus:ring-primary relative ${
                                    lesson.status === "cancelada"
                                      ? "border-dashed border-border bg-muted text-muted-foreground line-through opacity-50"
                                      : `${catStyle.bg} ${catStyle.border} ${catStyle.text}`
                                  }`}
                                  title={`${lesson.student} (${lesson.instrument}) - ${lesson.room} · ${lesson.category === "PERSONALIZADA" ? `Clase Personalizada (${dotLabel})` : catStyle.label}`}
                                >
                                  <div className="flex items-center justify-between gap-1 leading-tight">
                                    <div className="flex items-center gap-1 min-w-0">
                                      <span className="block truncate font-black text-[10.5px] leading-tight">
                                        {lesson.student}
                                      </span>
                                      {lesson.category === "PERSONALIZADA" && (
                                        <span
                                          className={`inline-block w-2 h-2 rounded-full ${dotColor} border border-white shadow-2xs shrink-0`}
                                          title={`Clase Personalizada · ${dotLabel}`}
                                        />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-0.5 shrink-0">
                                      {lesson.sessionNumber && (
                                        <span className="text-[7.5px] font-black px-1 py-0.2 rounded bg-black/20 text-foreground border border-black/10">
                                          {lesson.sessionNumber === 1 ? "1ra" : "2da"}
                                        </span>
                                      )}
                                      {conflictIds.has(lesson.id) && lesson.status !== "cancelada" && (
                                        <AlertTriangle className="h-2.5 w-2.5 text-destructive" />
                                      )}
                                      <span className="font-mono text-[7.5px] font-bold bg-background/50 px-1 py-0.2 rounded shrink-0">
                                        {lesson.room}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-[8.5px] font-semibold opacity-90 mt-0.5 leading-none">
                                    <span className="truncate">{lesson.instrument}</span>
                                    <span className="truncate text-muted-foreground/90 ml-1">Prof. {lesson.teacher}</span>
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
              <div className="bg-primary/5 px-3.5 py-2 border-b border-border flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Turno Mañana · Sábados (09:00 a 13:30)
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">
                  Bloques intensivos y regulares · Salas A a D
                </span>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[32rem]">
                  {/* Cabecera Sábados con Fecha */}
                  <div className="grid grid-cols-[5.5rem_1fr] border-b border-border bg-muted/40 text-center">
                    <div className="py-1.5 px-2 text-[11px] font-black text-muted-foreground uppercase flex items-center justify-center">
                      Horario
                    </div>
                    {(() => {
                      const satInfo = currentWeekObj.days[5] || currentWeekObj.days[0]!;
                      return (
                        <div className="py-1.5 px-2 text-xs font-black text-foreground border-l border-border/60">
                          <div>Sábado</div>
                          <span className="text-[9.5px] font-semibold text-muted-foreground">
                            {satInfo.dayNum} {satInfo.monthName.slice(0, 3)}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Filas Sábados */}
                  {timeSlotsSaturday.map((slot) => {
                    const cell = visible.filter((l) => l.day === "Sáb" && l.time === slot);
                    return (
                      <div
                        key={`saturday-${slot}`}
                        className="grid grid-cols-[5.5rem_1fr] border-b border-border last:border-b-0 items-stretch"
                      >
                        <div className="p-1.5 font-mono text-[11px] font-black text-foreground flex items-center justify-center bg-muted/20 select-none">
                          {slot}
                        </div>
                        <div className="border-l border-border/60 p-1 min-h-[3rem] flex flex-wrap gap-1 items-center bg-background/50">
                          {cell.map((lesson) => {
                            const isRecup = lesson.isMakeup || lesson.category === "RECUPERACION";
                            const catKey = isRecup ? "RECUPERACION" : (lesson.category ?? "JUNIOR");
                            const catStyle = categoryStyles[catKey] ?? categoryStyles.JUNIOR!;
                            const studentProfile = adminStudents.find(
                              (st) => st.name.toLowerCase() === lesson.student.toLowerCase()
                            );
                            
                            const studentAgeCat =
                              studentProfile?.ageCategory ||
                              (lesson.student.toLowerCase().includes("joan paolo")
                                ? "ADULTO"
                                : lesson.student.toLowerCase().includes("mishel")
                                ? "JUVENIL"
                                : lesson.student.toLowerCase().includes("mirko")
                                ? "JUNIOR"
                                : "JUNIOR");

                            const dotColor =
                              studentAgeCat === "JUVENIL"
                                ? "bg-[#4CAF50]"
                                : studentAgeCat === "ADULTO"
                                ? "bg-[#757575]"
                                : studentAgeCat === "INFANTIL"
                                ? "bg-[#7C4DFF]"
                                : "bg-[#FBC02D]";

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
                                className={`flex-1 min-w-[11rem] max-w-[16rem] rounded-lg border px-1.5 py-0.5 text-left transition-all hover:scale-[1.01] hover:shadow-xs focus:outline-none focus:ring-1 focus:ring-primary relative ${
                                  lesson.status === "cancelada"
                                    ? "border-dashed border-border bg-muted text-muted-foreground line-through opacity-50"
                                    : `${catStyle.bg} ${catStyle.border} ${catStyle.text}`
                                }`}
                                title={`${lesson.student} (${lesson.instrument}) - ${lesson.room} · ${lesson.category === "PERSONALIZADA" ? `Clase Personalizada (${dotLabel})` : catStyle.label}`}
                              >
                                <div className="flex items-center justify-between gap-1 leading-tight">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="block truncate font-black text-[10.5px] leading-tight">
                                      {lesson.student}
                                    </span>
                                    {lesson.category === "PERSONALIZADA" && (
                                      <span
                                        className={`inline-block w-2 h-2 rounded-full ${dotColor} border border-white shadow-2xs shrink-0`}
                                        title={`Clase Personalizada · ${dotLabel}`}
                                      />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    {lesson.sessionNumber && (
                                      <span className="text-[7.5px] font-black px-1 py-0.2 rounded bg-black/20 text-foreground border border-black/10">
                                        {lesson.sessionNumber === 1 ? "1ra" : "2da"}
                                      </span>
                                    )}
                                    {conflictIds.has(lesson.id) && lesson.status !== "cancelada" && (
                                      <AlertTriangle className="h-2.5 w-2.5 text-destructive" />
                                    )}
                                    <span className="font-mono text-[7.5px] font-bold bg-background/50 px-1 py-0.2 rounded shrink-0">
                                      {lesson.room}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-[8.5px] font-semibold opacity-90 mt-0.5 leading-none">
                                  <span className="truncate">{lesson.instrument}</span>
                                  <span className="truncate text-muted-foreground/90 ml-1">Prof. {lesson.teacher}</span>
                                </div>
                              </button>
                            );
                          })}
                          {cell.length === 0 && (
                            <span className="text-[10px] text-muted-foreground/60 italic pl-1">
                              Sin clases programadas
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

                {/* SELECTOR DE CATEGORÍA DE LA CLASE / ALUMNO (SOLICITADO POR NAYELI) */}
                <div className="flex items-center justify-between p-3 rounded-2xl border border-primary/30 bg-primary/5">
                  <div className="space-y-0.5">
                    <label className="text-xs font-black text-foreground block">
                      🏷️ Categoría de Edad
                    </label>
                    <p className="text-[10px] text-muted-foreground">
                      Puedes cambiar la categoría libremente.
                    </p>
                  </div>
                  <Select
                    value={selected.category || "JUNIOR"}
                    onValueChange={(v: any) => {
                      useAppStore.getState().updateLessonCategory(selected.id, v);
                      const studentMatch = adminStudents.find(
                        (st) => st.name.toLowerCase() === selected.student.toLowerCase()
                      );
                      if (studentMatch) {
                        useAppStore.getState().updateStudentDetails(studentMatch.id, { ageCategory: v });
                      }
                      toast.success(`Categoría de ${selected.student} cambiada a ${v}`);
                    }}
                  >
                    <SelectTrigger className="w-[160px] h-8 text-xs font-bold bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INFANTIL">🟣 Infantil (5 y 6)</SelectItem>
                      <SelectItem value="JUNIOR">🟡 Junior (7 a 12)</SelectItem>
                      <SelectItem value="JUVENIL">🟢 Juvenil (13 a 17)</SelectItem>
                      <SelectItem value="ADULTO">⚫ Adulto (18 a +)</SelectItem>
                      <SelectItem value="RECUPERACION">🔴 Recuperación</SelectItem>
                      <SelectItem value="PERSONALIZADA">⭐ Personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* PANEL DE ASISTENCIA RÁPIDA (AISLADO POR SEMANA ESPECÍFICA) */}
                {(() => {
                  const currentAttendance =
                    selected.attendanceByWeek?.[safeWeekIndex] ??
                    (selected.weekIndex === safeWeekIndex ? selected.attendanceStatus : undefined);
                  return (
                    <div className="space-y-3 rounded-2xl border-2 border-primary/20 p-4 bg-card shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <CheckCircle2 className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-xs font-black text-foreground uppercase tracking-wide">
                              Asistencia · Semana {safeWeekIndex + 1} de {monthWeeks.length}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-semibold">
                              {selected.day} {selected.time} · {monthsName[selectedMonth]}
                            </p>
                          </div>
                        </div>
                        {currentAttendance && (
                          <Badge
                            className={`text-[10px] font-black uppercase ${
                              currentAttendance === "presente"
                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                : currentAttendance === "ausente"
                                ? "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30"
                                : currentAttendance === "tarde"
                                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                : "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30"
                            }`}
                          >
                            ● {currentAttendance}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            markLessonAttendance(selected.id, "presente", "", safeWeekIndex);
                            toast.success(
                              `Asistencia (Semana ${safeWeekIndex + 1}): ${selected.student} PRESENTE 🟢`,
                            );
                          }}
                          className={`h-9 font-bold text-xs gap-1.5 transition-all ${
                            currentAttendance === "presente"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800"
                          }`}
                        >
                          🟢 Presente
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => {
                            markLessonAttendance(selected.id, "ausente", "", safeWeekIndex);
                            toast.error(
                              `Asistencia (Semana ${safeWeekIndex + 1}): ${selected.student} AUSENTE 🔴`,
                            );
                          }}
                          className={`h-9 font-bold text-xs gap-1.5 transition-all ${
                            currentAttendance === "ausente"
                              ? "bg-red-600 text-white shadow-xs"
                              : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 hover:bg-red-100 border border-red-300 dark:border-red-800"
                          }`}
                        >
                          🔴 Ausente
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => {
                            markLessonAttendance(selected.id, "tarde", "", safeWeekIndex);
                            toast.warning(
                              `Asistencia (Semana ${safeWeekIndex + 1}): ${selected.student} TARDE 🟡`,
                            );
                          }}
                          className={`h-9 font-bold text-xs gap-1.5 transition-all ${
                            currentAttendance === "tarde"
                              ? "bg-amber-600 text-white shadow-xs"
                              : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100 border border-amber-300 dark:border-amber-800"
                          }`}
                        >
                          🟡 Tarde
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => {
                            markLessonAttendance(selected.id, "justificada", "", safeWeekIndex);
                            toast.info(
                              `Asistencia (Semana ${safeWeekIndex + 1}): ${selected.student} JUSTIFICADA 🔵 (+1 Crédito)`,
                            );
                          }}
                          className={`h-9 font-bold text-xs gap-1.5 transition-all ${
                            currentAttendance === "justificada"
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 hover:bg-blue-100 border border-blue-300 dark:border-blue-800"
                          }`}
                        >
                          🔵 Justificada (+1 Créd)
                        </Button>
                      </div>
                    </div>
                  );
                })()}

                {/* GESTIÓN DE EVENTOS Y VACANTES EN ESTE HORARIO (ZONA DE CONFORT DE NAYELI) */}
                {(() => {
                  const slotLessons = schedule.filter(
                    (l) =>
                      l.day === selected.day &&
                      l.time === selected.time &&
                      l.room === selected.room &&
                      l.teacher.toLowerCase().replace(/\s*\(.*?\)/, "").trim() ===
                        selected.teacher.toLowerCase().replace(/\s*\(.*?\)/, "").trim() &&
                      l.status !== "cancelada"
                  );
                  const currentCount = slotLessons.length;
                  const maxCap = 5;
                  const freeSpots = Math.max(0, maxCap - currentCount);

                  return (
                    <div className="space-y-3 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 shadow-xs">
                      {/* Encabezado de Cupos y Sala */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-primary" />
                          <p className="text-xs font-black text-foreground uppercase tracking-wide">
                            Alumnos en este Horario
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            freeSpots > 0
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                              : "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40"
                          }`}
                        >
                          {currentCount} / {maxCap} Cupos · {freeSpots > 0 ? `${freeSpots} libres` : "Lleno"}
                        </span>
                      </div>

                      {/* Lista de Alumnos en este mismo Slot */}
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">
                          Inscritos con Prof. {selected.teacher} ({selected.day} {selected.time} · {selected.room}):
                        </p>
                        <div className="space-y-1">
                          {slotLessons.map((sl, idx) => {
                            const isCurrentSelected = sl.id === selected.id;
                            return (
                              <div
                                key={sl.id}
                                onClick={() => {
                                  if (!isCurrentSelected) {
                                    openLesson(sl);
                                  }
                                }}
                                className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                                  isCurrentSelected
                                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                                    : "bg-card hover:bg-muted/80 border border-border text-foreground font-medium"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] opacity-75 font-mono">#{idx + 1}</span>
                                  <span>{sl.student}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {sl.isMakeup ? (
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                                      isCurrentSelected ? "bg-white/20 text-white" : "bg-red-500/20 text-red-600 border border-red-500/30"
                                    }`}>
                                      🔄 Recuperación
                                    </span>
                                  ) : sl.category === "PERSONALIZADA" ? (
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                                      isCurrentSelected ? "bg-white/20 text-white" : "bg-amber-500/20 text-amber-600 border border-amber-500/30"
                                    }`}>
                                      ⭐ Personalizada
                                    </span>
                                  ) : (
                                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                                      isCurrentSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                                    }`}>
                                      🎵 Regular
                                    </span>
                                  )}
                                  {isCurrentSelected && (
                                    <span className="text-[10px] ml-1">👉</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Botón o Formulario de Agregar Alumno (Recuperación / Personalizada) */}
                      {freeSpots > 0 ? (
                        <div className="pt-2 border-t border-primary/20">
                          {!isAddEventOpen ? (
                            <Button
                              type="button"
                              onClick={() => {
                                setIsAddEventOpen(true);
                                setAddEventStudentQuery("");
                                setAddEventSelectedStudent(null);
                              }}
                              className="w-full text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                            >
                              <UserPlus className="h-4 w-4" /> ➕ Agregar Alumno a este Horario ({freeSpots} vacantes)
                            </Button>
                          ) : (
                            <div className="space-y-3 p-3 rounded-xl bg-card border border-primary/30 text-xs animate-in fade-in-50 duration-200">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-foreground flex items-center gap-1">
                                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Inscribir Alumno en este Slot
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setIsAddEventOpen(false)}
                                  className="text-[10px] font-bold text-muted-foreground hover:text-foreground"
                                >
                                  ✕ Cerrar
                                </button>
                              </div>

                              {/* Selector de Tipo de Evento */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                                  Tipo de Evento
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setAddEventType("recuperacion")}
                                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border text-center ${
                                      addEventType === "recuperacion"
                                        ? "bg-red-500 text-white border-red-600 shadow-xs"
                                        : "bg-background border-border text-foreground hover:bg-muted"
                                    }`}
                                  >
                                    🔄 Recuperación
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setAddEventType("personalizada")}
                                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border text-center ${
                                      addEventType === "personalizada"
                                        ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                                        : "bg-background border-border text-foreground hover:bg-muted"
                                    }`}
                                  >
                                    ⭐ Personalizada
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setAddEventType("regular")}
                                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border text-center ${
                                      addEventType === "regular"
                                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                        : "bg-background border-border text-foreground hover:bg-muted"
                                    }`}
                                  >
                                    🎵 Regular
                                  </button>
                                </div>
                              </div>

                              {/* Buscador Predictivo de Alumnos con Dropdown Flotante */}
                              <div className="space-y-1 relative">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                                  Buscar Alumno (de los 99 oficiales)
                                </label>
                                <div className="relative">
                                  <Input
                                    type="text"
                                    value={addEventStudentQuery}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setAddEventStudentQuery(val);
                                      setAddEventSelectedStudent(null);
                                      setIsAddEventDropdownOpen(val.trim().length > 0);
                                    }}
                                    onFocus={() => {
                                      if (addEventStudentQuery.trim().length > 0) {
                                        setIsAddEventDropdownOpen(true);
                                      }
                                    }}
                                    placeholder="Escribe el nombre del alumno..."
                                    className="text-xs h-8 bg-background font-medium pr-7"
                                  />
                                  {addEventStudentQuery && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAddEventStudentQuery("");
                                        setAddEventSelectedStudent(null);
                                        setIsAddEventDropdownOpen(false);
                                      }}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>

                                {/* Dropdown flotante */}
                                {isAddEventDropdownOpen && filteredAddEventStudents.length > 0 && (
                                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-popover border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto p-1 divide-y divide-border/40">
                                    {filteredAddEventStudents.map((st) => {
                                      const isRecup = addEventType === "recuperacion";
                                      const hasCredits = (st.makeupCredits || 0) > 0;
                                      return (
                                        <div
                                          key={st.id}
                                          onClick={() => {
                                            setAddEventSelectedStudent(st);
                                            setAddEventStudentQuery(st.name);
                                            setIsAddEventDropdownOpen(false);
                                          }}
                                          className="p-2 hover:bg-primary/10 rounded-lg cursor-pointer transition-colors text-xs space-y-0.5"
                                        >
                                          <div className="flex items-center justify-between">
                                            <span className="font-bold text-foreground">{st.name}</span>
                                            {isRecup && (
                                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                                hasCredits
                                                  ? "bg-red-500/20 text-red-600 border border-red-500/30"
                                                  : "bg-muted text-muted-foreground"
                                              }`}>
                                                🎟️ {st.makeupCredits || 0} Créditos
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[10px] text-muted-foreground">
                                            {st.instrument || "Instrumento"} · Prof. {st.teacher || "Por asignar"} · {st.modality || "Plan Regular"}
                                          </p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Resumen del Alumno Seleccionado */}
                              {addEventSelectedStudent && (
                                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-[11px] space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-primary">{addEventSelectedStudent.name}</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-background border">
                                      {addEventSelectedStudent.instrument}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                                    <span>Plan: {addEventSelectedStudent.modality || "Regular"}</span>
                                    <span>Créditos: <strong>{addEventSelectedStudent.makeupCredits || 0} disp.</strong></span>
                                  </div>
                                  {addEventType === "recuperacion" && (addEventSelectedStudent.makeupCredits || 0) <= 0 && (
                                    <p className="text-[10px] text-amber-600 font-semibold pt-0.5">
                                      ⚠️ Este alumno no tiene créditos acumulados, pero se le permitirá agendar la recuperación según la política flexible.
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Parámetros Fijos del Horario */}
                              <div className="p-2 rounded-lg bg-muted/40 border border-border/60 text-[10px] space-y-0.5 text-muted-foreground">
                                <p><strong>Horario Fijo:</strong> {selected.day} {selected.time} · <strong>{selected.room}</strong></p>
                                <p><strong>Docente:</strong> Prof. {selected.teacher} · <strong>Curso:</strong> {selected.instrument}</p>
                              </div>

                              {/* Selector de Alcance en Inscribir en Horario */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                                  Alcance del Horario
                                </label>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setAddEventScope("only-this-week")}
                                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border text-center ${
                                      addEventScope === "only-this-week"
                                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                        : "bg-background border-border text-foreground hover:bg-muted"
                                    }`}
                                  >
                                    ⚡ Solo esta semana ({safeWeekIndex + 1})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setAddEventScope("all")}
                                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border text-center ${
                                      addEventScope === "all"
                                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                        : "bg-background border-border text-foreground hover:bg-muted"
                                    }`}
                                  >
                                    🗓️ Todo el mes ({monthWeeks.length} sem.)
                                  </button>
                                </div>
                              </div>

                              {/* Botón de Confirmación */}
                              <Button
                                type="button"
                                onClick={() => {
                                  if (!addEventSelectedStudent && !addEventStudentQuery.trim()) {
                                    toast.error("Selecciona un alumno para inscribirlo.");
                                    return;
                                  }
                                  const studentName = addEventSelectedStudent?.name || addEventStudentQuery.trim();

                                  // Validar si ya está en el slot
                                  if (slotLessons.some((l) => l.student.toLowerCase() === studentName.toLowerCase())) {
                                    toast.warning(`El alumno ${studentName} ya está en este mismo horario.`);
                                    return;
                                  }

                                  if (addEventType === "recuperacion") {
                                    scheduleMakeupLesson({
                                      studentName,
                                      day: selected.day,
                                      time: selected.time,
                                      room: selected.room,
                                      teacher: selected.teacher,
                                      instrument: selected.instrument,
                                      category: "RECUPERACION",
                                      recoveringLessonDate: `Recuperación en horario de ${selected.day} ${selected.time} (${selected.room})`,
                                    });
                                    toast.success(`🎉 Recuperación inscrita: ${studentName}`, {
                                      description: `Horario: ${selected.day} ${selected.time} (${selected.room}) con Prof. ${selected.teacher}. Se descontó 1 crédito.`,
                                    });
                                  } else if (addEventType === "personalizada") {
                                    addLessonToSchedule({
                                      student: studentName,
                                      day: selected.day,
                                      time: selected.time,
                                      room: selected.room,
                                      teacher: selected.teacher,
                                      instrument: selected.instrument,
                                      category: "PERSONALIZADA",
                                      status: "programada",
                                      weekIndex: addEventScope === "only-this-week" ? safeWeekIndex : undefined,
                                    });
                                    toast.success(`⭐ Clase personalizada inscrita: ${studentName}`, {
                                      description: `Horario: ${selected.day} ${selected.time} (${selected.room}) con Prof. ${selected.teacher} (${addEventScope === "only-this-week" ? `Solo Semana ${safeWeekIndex + 1}` : "Todo el mes"}).`,
                                    });
                                  } else {
                                    addLessonToSchedule({
                                      student: studentName,
                                      day: selected.day,
                                      time: selected.time,
                                      room: selected.room,
                                      teacher: selected.teacher,
                                      instrument: selected.instrument,
                                      category: addEventSelectedStudent?.ageCategory || "JUNIOR",
                                      status: "programada",
                                      weekIndex: addEventScope === "only-this-week" ? safeWeekIndex : undefined,
                                    });
                                    toast.success(`🎵 Clase regular inscrita: ${studentName}`, {
                                      description: `Horario: ${selected.day} ${selected.time} (${selected.room}) con Prof. ${selected.teacher} (${addEventScope === "only-this-week" ? `Solo Semana ${safeWeekIndex + 1}` : "Todo el mes"}).`,
                                    });
                                  }

                                  // Reset
                                  setAddEventStudentQuery("");
                                  setAddEventSelectedStudent(null);
                                  setIsAddEventDropdownOpen(false);
                                  setIsAddEventOpen(false);
                                }}
                                className="w-full text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5"
                              >
                                <CheckCircle2 className="h-4 w-4" /> Confirmar e Inscribir en este Horario
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-center text-xs font-bold text-red-600">
                          🚫 Capacidad máxima de 5 alumnos alcanzada en este horario con Prof. {selected.teacher}
                        </div>
                      )}
                    </div>
                  );
                })()}

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
                        <div className="text-[10px] opacity-80">Semana {safeWeekIndex + 1} de {monthWeeks.length}</div>
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
                        <div className="text-[10px] opacity-80">Las {monthWeeks.length} semanas de {monthsName[selectedMonth]}</div>
                      </button>
                    </div>
                  </div>

                  <Button
                    className="w-full font-bold text-xs"
                    disabled={selected.status === "cancelada"}
                    onClick={() => {
                      rescheduleLesson(selected.id, moveDay, moveTime, moveScope, safeWeekIndex);
                      toast.success(`Clase reprogramada a ${moveDay} ${moveTime}`, {
                        description: moveScope === "only-this-week"
                          ? `Aplicado únicamente para la Semana ${safeWeekIndex + 1} de ${monthWeeks.length}.`
                          : `Aplicado para todas las ${monthWeeks.length} semanas del mes.`,
                      });
                      setSelectedId(null);
                    }}
                  >
                    Guardar nuevo horario ({moveScope === "only-this-week" ? `Semana ${safeWeekIndex + 1}` : "Mes Completo"})
                  </Button>
                </div>

                {/* Control y Resumen de Asistencias del Alumno en el Mes (Zona de Confort Nayeli) */}
                {(() => {
                  const studentData = adminStudents.find(
                    (st) =>
                      st.name.toLowerCase() === selected.student.toLowerCase() ||
                      st.name.toLowerCase().includes(selected.student.toLowerCase()) ||
                      selected.student.toLowerCase().includes(st.name.toLowerCase())
                  );

                  const isIntensivo = studentData?.modality?.includes("Intensivo");
                  const targetLessons = isIntensivo ? 4 : 8;

                  const studentLessons = schedule.filter(
                    (l) =>
                      l.student.toLowerCase() === selected.student.toLowerCase() ||
                      (studentData && (
                        l.student.toLowerCase().includes(studentData.name.toLowerCase()) ||
                        studentData.name.toLowerCase().includes(l.student.toLowerCase())
                      ))
                  );

                  const scheduledCount = studentLessons.length;
                  const presentes = studentLessons.filter((l) => l.attendanceStatus === "presente").length;
                  const ausentes = studentLessons.filter((l) => l.attendanceStatus === "ausente").length;
                  const tardes = studentLessons.filter((l) => l.attendanceStatus === "tarde").length;
                  const justificadas = studentLessons.filter((l) => l.attendanceStatus === "justificada").length;
                  const isComplete = scheduledCount >= targetLessons;
                  const pending = Math.max(0, targetLessons - scheduledCount);
                  const credits = studentData?.makeupCredits ?? 0;

                  return (
                    <div className="space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <p className="text-xs font-black text-foreground">Control de Asistencias del Alumno</p>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            isComplete
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                              : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40"
                          }`}
                        >
                          {scheduledCount} / {targetLessons} clases ({isIntensivo ? "Intensivo" : "Regular"})
                        </span>
                      </div>

                      {/* Barra de progreso de clases en el mes */}
                      <div className="space-y-1">
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all rounded-full ${
                              isComplete ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.min(100, (scheduledCount / targetLessons) * 100)}%` }}
                          />
                        </div>
                        {pending > 0 && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                            ⚠️ Faltan {pending} clase{pending > 1 ? "s" : ""} por agendar para completar su plan de {targetLessons} clases.
                          </p>
                        )}
                      </div>

                      {/* Conteo de asistencias marcadas */}
                      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] pt-0.5">
                        <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <p className="font-black text-emerald-700 dark:text-emerald-300 text-xs">{presentes}</p>
                          <p className="text-[9px] text-muted-foreground font-semibold">Pres.</p>
                        </div>
                        <div className="p-1.5 rounded-xl bg-red-500/10 border border-red-500/20">
                          <p className="font-black text-red-700 dark:text-red-300 text-xs">{ausentes}</p>
                          <p className="text-[9px] text-muted-foreground font-semibold">Aus.</p>
                        </div>
                        <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <p className="font-black text-amber-700 dark:text-amber-300 text-xs">{tardes}</p>
                          <p className="text-[9px] text-muted-foreground font-semibold">Tar.</p>
                        </div>
                        <div className="p-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                          <p className="font-black text-blue-700 dark:text-blue-300 text-xs">{justificadas}</p>
                          <p className="text-[9px] text-muted-foreground font-semibold">Just.</p>
                        </div>
                      </div>

                      {/* Créditos de falta / recuperación */}
                      <div className="flex items-center justify-between pt-1 border-t border-emerald-500/20 text-[11px]">
                        <span className="text-muted-foreground font-medium">Bolsa de Recuperaciones:</span>
                        <span className="font-black px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30">
                          🎟️ {credits} Crédito{credits !== 1 ? "s" : ""} disponible{credits !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Lista rápida de clases del alumno */}
                      {studentLessons.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-emerald-500/20">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Horarios de {selected.student.split(" ")[0]} este mes:
                          </p>
                          <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                            {studentLessons.map((l) => (
                              <div
                                key={l.id}
                                className={`flex items-center justify-between p-1.5 rounded-lg text-[10px] border ${
                                  l.id === selected.id
                                    ? "bg-primary/15 border-primary/40 font-bold"
                                    : "bg-background/80 border-border"
                                }`}
                              >
                                <span>
                                  {l.day} {l.time} ({l.room}) · Prof. {l.teacher}
                                </span>
                                <span className="font-bold">
                                  {l.attendanceStatus === "presente" && "🟢 Presente"}
                                  {l.attendanceStatus === "ausente" && "🔴 Ausente"}
                                  {l.attendanceStatus === "tarde" && "🟡 Tarde"}
                                  {l.attendanceStatus === "justificada" && "🔵 Justificada"}
                                  {!l.attendanceStatus && (l.status === "cancelada" ? "❌ Cancelada" : "⏳ Programada")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

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
              Eliminar Clase del Horario
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Confirma la eliminación de la clase del horario. Esta acción liberará el espacio en la cuadrícula de inmediato.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                deleteLessonFromSchedule(selected.id);
                toast.success("🗑️ Clase de " + selected.student + " eliminada del horario correctamente");
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
                  Confirmar y Eliminar Clase
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
                          Plan: <strong className="text-foreground">{st.planType || "Mensual"}</strong> (S/ {(st.planPrice || VIBRA_PRICING.Mensual.priceMonthly).toFixed(2)}/m)
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
                              const prices = {
                                Mensual: VIBRA_PRICING.Mensual.priceMonthly,
                                Trimestral: VIBRA_PRICING.Trimestral.priceMonthly,
                                Anual: VIBRA_PRICING.Anual.priceMonthly,
                              };
                              useAppStore.getState().updateStudentDetails(st.id, {
                                planType: plan,
                                planPrice: prices[plan],
                              });
                              toast.success(`Plan de ${st.name} cambiado a ${plan}`);
                            }}
                            className="w-full h-7 rounded-lg border border-border bg-background px-2 text-[11px] font-medium"
                          >
                            <option value="Mensual">Mensual (S/ {VIBRA_PRICING.Mensual.priceMonthly.toFixed(2)})</option>
                            <option value="Trimestral">Trimestral (S/ {VIBRA_PRICING.Trimestral.priceMonthly.toFixed(2)})</option>
                            <option value="Anual">Anual (S/ {VIBRA_PRICING.Anual.priceMonthly.toFixed(2)})</option>
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
                toast.error("Ingresa o selecciona el nombre del alumno");
                return;
              }
              const finalTeacher = newLessonTeacher || availableTeachers[0] || "Prof. por Asignar";

              if (targetExistingLessonId && targetExistingLessonId !== "new") {
                // Reprogramar horario existente (Mover al niño de día / hora)
                rescheduleLesson(
                  targetExistingLessonId,
                  newLessonDay,
                  newLessonTime,
                  newLessonScope,
                  safeWeekIndex,
                  finalTeacher,
                  newLessonRoom,
                );
                toast.success(`Horario de ${newLessonStudent} reprogramado a ${newLessonDay} ${newLessonTime}`, {
                  description: newLessonScope === "only-this-week"
                    ? `Se cambió únicamente para la Semana ${safeWeekIndex + 1} (${monthsName[selectedMonth]}). Las demás semanas no se modificaron.`
                    : `Se actualizó para todas las semanas del mes con Prof. ${finalTeacher} (${newLessonRoom}).`,
                });
              } else {
                // Programar nueva clase / sesión adicional
                addLessonToSchedule({
                  student: newLessonStudent.trim(),
                  teacher: finalTeacher,
                  instrument: newLessonInstrument,
                  day: newLessonDay,
                  time: newLessonTime,
                  room: newLessonRoom,
                  category: newLessonCategory,
                  status: "programada",
                  weekIndex: newLessonScope === "only-this-week" ? safeWeekIndex : undefined,
                });

                toast.success(`Clase de ${newLessonStudent} programada para ${newLessonDay} ${newLessonTime}`, {
                  description: newLessonScope === "only-this-week"
                    ? `Agendado únicamente en la Semana ${safeWeekIndex + 1} (${monthsName[selectedMonth]}).`
                    : `Agendado para todas las semanas del mes con Prof. ${finalTeacher} (${newLessonRoom}).`,
                });
              }

              // Auto-sincronizar la pestaña visible al par de días correspondiente para que Nayeli lo vea de inmediato en pantalla
              if (newLessonDay === "Lun" || newLessonDay === "Mié") {
                setActivePair(0);
              } else if (newLessonDay === "Mar" || newLessonDay === "Jue") {
                setActivePair(1);
              } else if (newLessonDay === "Vie" || newLessonDay === "Sáb") {
                setActivePair(2);
              }

              setIsAddLessonOpen(false);
              setNewLessonStudent("");
              setStudentSearchQuery("");
              setTargetExistingLessonId("new");
            }}
            className="space-y-4 py-2 text-xs"
          >
            <div className="space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <label className="font-bold text-foreground">Alumno</label>
                <span className="text-[10px] text-muted-foreground">
                  {adminStudents.length} alumnos en directorio
                </span>
              </div>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Escribe para buscar alumno (ej: Mirko, Sanchez, Jose)..."
                  value={studentSearchQuery || newLessonStudent}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStudentSearchQuery(val);
                    setNewLessonStudent(val);
                    setIsStudentDropdownOpen(val.trim().length > 0);
                  }}
                  onFocus={() => {
                    if (studentSearchQuery.trim().length > 0) {
                      setIsStudentDropdownOpen(true);
                    }
                  }}
                  className="text-xs pr-8"
                  required
                />
                <Search className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />

                {/* Menú Desplegable Inteligente: Solo visible cuando el usuario escribe */}
                {isStudentDropdownOpen && studentSearchQuery.trim().length > 0 && filteredStudentsList.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-popover border border-border rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1.5 space-y-1">
                    {filteredStudentsList.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleSelectStudentForNewLesson(st)}
                        className="w-full text-left p-2 rounded-xl hover:bg-muted/80 flex items-center justify-between transition-colors text-xs group"
                      >
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{st.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {st.instrument} · Prof. {st.teacher || "Por asignar"} · {st.ageCategory || "JUNIOR"}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          Elegir ↵
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Botones sugeridos rápidos */}
              {adminStudents.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] text-muted-foreground">Sugeridos:</span>
                  {adminStudents.slice(0, 4).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleSelectStudentForNewLesson(st)}
                      className="text-[10px] bg-muted px-2 py-0.5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {st.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Panel Inteligente de Horarios Actuales del Alumno (Permite Mover de Día) */}
            {currentStudentLessons.length > 0 && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary flex items-center gap-1.5 text-xs">
                    <Calendar className="h-4 w-4" /> Horario(s) actual(es) del alumno:
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {currentStudentLessons.length} {currentStudentLessons.length === 1 ? "clase asignada" : "clases asignadas"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Elige si deseas mover/cambiar una de sus clases actuales a otro día/hora o agregar una sesión adicional:
                </p>
                <div className="space-y-1.5">
                  {currentStudentLessons.map((ex) => {
                    const isSelected = targetExistingLessonId === ex.id;
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => {
                          setTargetExistingLessonId(ex.id);
                          setNewLessonDay(ex.day);
                          setNewLessonTime(ex.time);
                          setNewLessonTeacher(ex.teacher);
                          setNewLessonRoom(ex.room);
                          setNewLessonInstrument(ex.instrument);
                          if (ex.category) setNewLessonCategory(ex.category);
                        }}
                        className={`w-full p-2 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? "border-primary bg-primary/15 text-primary font-bold shadow-xs ring-1 ring-primary"
                            : "border-border bg-background text-foreground hover:bg-muted/70"
                        }`}
                      >
                        <div>
                          <span className="font-bold">{ex.day} a las {ex.time}</span> · {ex.room} · Prof. {ex.teacher} ({ex.instrument})
                          {ex.weekIndex !== undefined && (
                            <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                              Semana {ex.weekIndex + 1}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary">
                          {isSelected ? "✓ Seleccionado para cambiar de día" : "Mover este día ↵"}
                        </span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setTargetExistingLessonId("new")}
                    className={`w-full p-2 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${
                      targetExistingLessonId === "new"
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-bold shadow-xs ring-1 ring-emerald-500"
                        : "border-dashed border-border bg-background text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    <span>➕ Inscribir como nueva sesión adicional (sin mover los anteriores)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600">
                      {targetExistingLessonId === "new" ? "✓ Nueva sesión" : "Elegir"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Selector de Alcance de la Programación: Solo esta semana vs Todo el mes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-foreground">Alcance del Horario</label>
                <span className="text-[10px] font-semibold text-primary">
                  {newLessonScope === "only-this-week" ? `⚡ Semana ${safeWeekIndex + 1}` : "🗓️ Mes Completo"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewLessonScope("only-this-week")}
                  className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                    newLessonScope === "only-this-week"
                      ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1">
                    ⚡ Solo esta semana
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    Semana {safeWeekIndex + 1} de {monthWeeks.length} ({monthsName[selectedMonth]})
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setNewLessonScope("all")}
                  className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                    newLessonScope === "all"
                      ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1">
                    🗓️ Todo el mes
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    Las {monthWeeks.length} semanas de {monthsName[selectedMonth]}
                  </div>
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                {newLessonScope === "only-this-week"
                  ? `Aplica únicamente para la Semana ${safeWeekIndex + 1}. Las demás semanas conservarán su horario habitual.`
                  : `Aplica de forma recurrente para todas las semanas del mes de ${monthsName[selectedMonth]}.`}
              </p>
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

      {/* Modal Libreta de Asistencias y Control de Plan Oficial (8 clases / 4 clases) */}
      <Dialog open={isAttendanceLedgerOpen} onOpenChange={setIsAttendanceLedgerOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[88vh] flex flex-col p-6 rounded-3xl bg-card border-emerald-500/30">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-black flex items-center gap-2 text-foreground">
                  <BookOpen className="h-5 w-5 text-emerald-500" />
                  📖 Libreta de Asistencias y Control de Plan Mensual
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Supervisión del cumplimiento de clases según regla oficial Vibra Music (8 clases Plan Regular / 4 clases Plan Intensivo).
                </DialogDescription>
              </div>
            </div>

            {/* Controles de Búsqueda y Filtros de la Libreta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar alumno en libreta..."
                  value={ledgerSearchQuery}
                  onChange={(e) => setLedgerSearchQuery(e.target.value)}
                  className="h-8 text-xs pl-7 rounded-xl"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              </div>

              <Select value={ledgerTeacherFilter} onValueChange={setLedgerTeacherFilter}>
                <SelectTrigger className="h-8 text-xs rounded-xl">
                  <SelectValue placeholder="Profesor: Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Profesor: Todos</SelectItem>
                  {availableTeachers.map((t) => (
                    <SelectItem key={t} value={t}>
                      Prof. {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ledgerPlanFilter} onValueChange={setLedgerPlanFilter}>
                <SelectTrigger className="h-8 text-xs rounded-xl">
                  <SelectValue placeholder="Plan: Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Plan: Todos</SelectItem>
                  <SelectItem value="Regular">Plan Regular (8 clases)</SelectItem>
                  <SelectItem value="Intensivo">Plan Intensivo (4 clases)</SelectItem>
                  <SelectItem value="Personalizada">Personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>

          {/* Lista de Alumnos con Control de Asistencias y Plan */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
            {(() => {
              const cleanSearch = ledgerSearchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

              const filteredLedgerList = adminStudents.filter((st) => {
                const nameNorm = st.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const matchesSearch = !cleanSearch || nameNorm.includes(cleanSearch);
                const matchesTeacher = ledgerTeacherFilter === "all" || st.teacher === ledgerTeacherFilter;
                const matchesPlan =
                  ledgerPlanFilter === "all" ||
                  (ledgerPlanFilter === "Regular" && (!st.planType || st.planType === "Mensual" || st.planType === "Trimestral" || st.planType === "Anual")) ||
                  (ledgerPlanFilter === "Intensivo" && st.modality?.includes("Intensivo")) ||
                  (ledgerPlanFilter === "Personalizada" && st.ageCategory === "PERSONALIZADA");

                return matchesSearch && matchesTeacher && matchesPlan;
              });

              if (filteredLedgerList.length === 0) {
                return (
                  <div className="text-center py-10 text-muted-foreground text-xs">
                    No se encontraron alumnos con los filtros seleccionados.
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredLedgerList.map((st) => {
                    const isIntensivo = st.modality?.includes("Intensivo");
                    const targetLessons = isIntensivo ? 4 : 8;

                    // Clases en la agenda para este alumno
                    const studentLessons = schedule.filter(
                      (l) => l.student.toLowerCase() === st.name.toLowerCase() ||
                        st.name.toLowerCase().includes(l.student.toLowerCase()) ||
                        l.student.toLowerCase().includes(st.name.toLowerCase())
                    );
                    const scheduledCount = studentLessons.length;
                    const presentes = studentLessons.filter((l) => l.attendanceStatus === "presente").length;
                    const ausentes = studentLessons.filter((l) => l.attendanceStatus === "ausente").length;
                    const tardes = studentLessons.filter((l) => l.attendanceStatus === "tarde").length;
                    const justificadas = studentLessons.filter((l) => l.attendanceStatus === "justificada").length;
                    const totalAsistidas = presentes + tardes;
                    const isComplete = scheduledCount >= targetLessons;
                    const pendingToSchedule = Math.max(0, targetLessons - scheduledCount);

                    return (
                      <div
                        key={st.id}
                        className="p-3.5 rounded-2xl border border-border bg-card/60 hover:border-emerald-500/40 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                              {st.name}
                              {st.isReentry && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-black">
                                  🔄 Reingreso
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {st.instrument} · Prof. <strong>{st.teacher || "Por asignar"}</strong> · <span className="font-semibold text-emerald-600 dark:text-emerald-400">{isIntensivo ? "Intensivo (4 clases)" : "Regular (8 clases)"}</span>
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                isComplete
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                              }`}
                            >
                              {scheduledCount} / {targetLessons} clases
                            </span>
                          </div>
                        </div>

                        {/* Barra de progreso de cumplimiento de clases */}
                        <div className="space-y-1">
                          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full transition-all rounded-full ${
                                isComplete ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                              style={{ width: `${Math.min(100, (scheduledCount / targetLessons) * 100)}%` }}
                            />
                          </div>
                          {pendingToSchedule > 0 && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                              ⚠️ Faltan {pendingToSchedule} clase{pendingToSchedule > 1 ? "s" : ""} en agenda para completar el mes.
                            </p>
                          )}
                        </div>

                        {/* Desglose de Asistencias y Créditos de Recuperación */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] pt-1 border-t border-border/50">
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                            🟢 {presentes} Pres
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-700 dark:text-red-300 font-bold">
                            🔴 {ausentes} Aus
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold">
                            🟡 {tardes} Tar
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold">
                            🔵 {justificadas} Just (+Créd)
                          </span>
                          {st.makeupCredits > 0 && (
                            <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/20 text-red-700 dark:text-red-300 font-black border border-red-500/30">
                              🎟️ {st.makeupCredits} Crédito{st.makeupCredits > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          <div className="pt-3 border-t border-border flex justify-between items-center text-xs">
            <span className="text-muted-foreground text-[11px]">
              Mostrando {adminStudents.length} alumnos registrados en Vibra Music
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAttendanceLedgerOpen(false)}
              className="text-xs rounded-xl"
            >
              Cerrar Libreta
            </Button>
          </div>
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
