import { useState, useMemo, useRef } from "react";
import {
  useAppStore,
  type AdminStudent,
  type AgeCategory,
  type LessonModality,
} from "@/store/app-store";
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet,
  Upload,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  ShieldAlert,
  ChevronRight,
  Filter,
  Check,
  X,
  Phone,
  Eye,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { musicalInstruments, teachers, rooms, HISTORICAL_BASE_METADATA } from "@/store/admin-seeds";
import { toast } from "sonner";

interface StudentCleanupPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StudentCleanupPanel({ isOpen, onClose }: StudentCleanupPanelProps) {
  const students = useAppStore((s) => s.adminStudents);
  const historicalStudents = useAppStore((s) => s.historicalStudents || s.adminStudents);
  const setStudentStatus = useAppStore((s) => s.setStudentStatus);
  const updateStudentDetails = useAppStore((s) => s.updateStudentDetails);
  const addNewStudent = useAppStore((s) => s.addNewStudent);

  const [activeTab, setActiveTab] = useState<"activar" | "excel" | "pausar">("activar");

  // --- TAB 1: Búsqueda y Activación 1 a 1 ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(null);
  const [viewingHistoricalStudent, setViewingHistoricalStudent] = useState<AdminStudent | null>(null);

  // Campos para configurar datos al activar
  const [schTeacher, setSchTeacher] = useState(teachers[0] || "Jeremy");
  const [schInstrument, setSchInstrument] = useState(musicalInstruments[0] || "Piano");
  const [schPhone, setSchPhone] = useState("");
  const [schAttendanceRate, setSchAttendanceRate] = useState<number>(100);

  // Descarga oficial de la Base Histórica (Excel/CSV con UTF-8 BOM)
  const handleDownloadHistoricalCSV = () => {
    const list = historicalStudents.length > 0 ? historicalStudents : students;
    const header = "Nombre,Familia,Telefono,Instrumento,Profesor,Modalidad,Nivel,Estado,FechaIngreso,Apoderado,TelefonoApoderado\n";
    const rows = list.map((s) => {
      const escape = (val: any) => `"${String(val || "").replace(/"/g, '""')}"`;
      return [
        escape(s.name),
        escape(s.family),
        escape(s.phone),
        escape(s.instrument),
        escape(s.teacher),
        escape(s.modality),
        escape(s.level),
        escape(s.status),
        escape(s.joinedAt),
        escape(s.emergencyContact?.name),
        escape(s.emergencyContact?.phone),
      ].join(",");
    }).join("\n");

    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Base_Historica_Vibra_Music_${HISTORICAL_BASE_METADATA.createdAt}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`📥 Base Histórica (${list.length} alumnos) descargada en Excel.`);
  };

  // Descarga oficial de la Base Activa 2026 (Excel/CSV con UTF-8 BOM)
  const handleDownloadActiveCSV = () => {
    const activeList = students.filter((s) => s.status === "activo");
    const header = "Nombre,Familia,Telefono,Instrumento,Profesor,Modalidad,Nivel,Estado,Plan,FechaInicio,FechaFin,Apoderado,TelefonoApoderado\n";
    const rows = activeList.map((s) => {
      const escape = (val: any) => `"${String(val || "").replace(/"/g, '""')}"`;
      return [
        escape(s.name),
        escape(s.family),
        escape(s.phone),
        escape(s.instrument),
        escape(s.teacher),
        escape(s.modality),
        escape(s.level),
        escape(s.status),
        escape(s.planType || "Mensual"),
        escape(s.planStartDate || "2026-08-01"),
        escape(s.planEndDate || "2026-12-31"),
        escape(s.emergencyContact?.name),
        escape(s.emergencyContact?.phone),
      ].join(",");
    }).join("\n");

    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Base_Activa_Vibra_Music_2026.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`📥 Base Activa 2026 (${activeList.length} alumnos) descargada en Excel.`);
  };

  // Lista de alumnos inactivos o en pausa que se pueden reactivar
  const inactiveStudents = useMemo(() => {
    return students.filter((s) => s.status !== "activo");
  }, [students]);

  const activeStudentsCount = useMemo(() => {
    return students.filter((s) => s.status === "activo").length;
  }, [students]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return inactiveStudents.slice(0, 8);
    }
    const q = searchQuery.toLowerCase().trim();
    return inactiveStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.family.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)) ||
        (s.instrument && s.instrument.toLowerCase().includes(q))
    );
  }, [inactiveStudents, searchQuery]);

  // Manejar selección de un alumno inactivo para activar
  const handleSelectToActivate = (st: AdminStudent) => {
    setSelectedStudent(st);
    setSchTeacher(st.teacher || "Jeremy");
    setSchInstrument(st.instrument || "Piano");
    setSchPhone(st.phone || st.emergencyContact?.phone || "");
    setSchAttendanceRate(st.attendanceRate && st.attendanceRate > 0 ? st.attendanceRate : 100);
  };

  // Confirmar activación 1 a 1 limpia
  const handleConfirmActivate = () => {
    if (!selectedStudent) return;

    // 1. Cambiar estado a activo
    setStudentStatus(selectedStudent.id, "activo");

    // 2. Actualizar datos con ciclo 2026 limpio
    updateStudentDetails(selectedStudent.id, {
      teacher: schTeacher,
      instrument: schInstrument,
      phone: schPhone || selectedStudent.phone,
      attendanceRate: schAttendanceRate,
      recentAttendance: [], // Ciclo 2026 inicia limpio sin mocks
    });

    // 🛡️ REGLA DE ORO (ADR 0100): El alumno inicia con HORARIO EN LIMPIO (0 clases en schedule).
    // Secretaría coordina y asigna manualmente con el botón "+ Horario".
    toast.success(`✓ ¡${selectedStudent.name} activado oficialmente en la Base 2026!`, {
      description: `Inicia con horario limpio (0 clases). Ahora puedes programar sus clases con el botón + Horario.`,
    });

    setSelectedStudent(null);
    setSearchQuery("");
  };

  // --- TAB 2: Subida de Excel Limpio con Match ---
  const [csvRawText, setCsvRawText] = useState("");
  const [csvPreview, setCsvPreview] = useState<{
    matched: Array<{ student: AdminStudent; newSchedule?: string }>;
    unmatched: Array<{ name: string; phone?: string; instrument?: string; teacher?: string }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessCSV = (text: string) => {
    setCsvRawText(text);
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length <= 1) {
      setCsvPreview(null);
      return;
    }

    const matched: Array<{ student: AdminStudent; newSchedule?: string; newAttendanceRate?: number }> = [];
    const unmatched: Array<{ name: string; phone?: string; instrument?: string; teacher?: string; attendanceRate?: number }> = [];

    // Ignorar cabecera
    const dataLines = lines.slice(1);

    dataLines.forEach((line) => {
      const parts = line.split(/[;,|\t]/).map((p) => p.trim().replace(/^"|"$/g, ""));
      if (parts.length === 0 || !parts[0]) return;

      const candidateName = parts[0].toLowerCase();
      const phone = parts[1] || "";
      const instrument = parts[2] || "Piano";
      const teacher = parts[3] || "Jeremy";
      const scheduleStr = parts[4] || "";
      const rawAttendance = parts[5] ? parts[5].replace("%", "").trim() : "";
      const parsedAttendance = rawAttendance && !isNaN(Number(rawAttendance)) ? Math.min(100, Math.max(0, Number(rawAttendance))) : undefined;

      // Buscar coincidencia en alumnos existentes
      const found = students.find((st) => {
        const stName = st.name.toLowerCase();
        return (
          stName === candidateName ||
          stName.includes(candidateName) ||
          candidateName.includes(stName) ||
          (phone && st.phone && st.phone.replace(/\D/g, "").includes(phone.replace(/\D/g, "")))
        );
      });

      if (found) {
        matched.push({ student: found, newSchedule: scheduleStr, newAttendanceRate: parsedAttendance });
      } else {
        unmatched.push({ name: parts[0], phone, instrument, teacher, attendanceRate: parsedAttendance });
      }
    });

    setCsvPreview({ matched, unmatched });
  };

  const handleDownloadTemplate = () => {
    const templateContent =
      "\uFEFF" +
      [
        "Nombre Alumno;Familia;Celular WhatsApp;Instrumento;Profesor;Horario;% Asistencia",
        "Alonso Ruiz;Familia Ruiz;51987654321;Piano;Jeremy;Lun-Mié 16:00;100",
        "Valeria Flores;Familia Flores;51912345678;Canto;Nathaly;Mar-Jue 17:30;95",
        "Mateo Castro;Familia Castro;51955443322;Violín;Fernando;Vie 18:15;90",
      ].join("\r\n");

    const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Plantilla_Limpia_Alumnos_VibraMusic_2026.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Plantilla CSV oficial descargada.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleProcessCSV(content);
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleApplyMatch = () => {
    if (!csvPreview) return;

    let activatedCount = 0;
    let createdCount = 0;

    // 1. Activar coincidentes y actualizar asistencia si fue provista
    csvPreview.matched.forEach(({ student, newAttendanceRate }) => {
      setStudentStatus(student.id, "activo");
      if (newAttendanceRate !== undefined) {
        updateStudentDetails(student.id, { attendanceRate: newAttendanceRate });
      }
      activatedCount += 1;
    });

    // 2. Insertar nuevos alumnos no coincidentes como activos
    csvPreview.unmatched.forEach((un) => {
      addNewStudent({
        name: un.name,
        family: `Familia ${un.name.split(" ").slice(-1)[0] || un.name}`,
        phone: un.phone || "51900000000",
        instrument: un.instrument || "Piano",
        teacher: un.teacher || "Jeremy",
        modality: "Regular (2 clases/semana)",
        status: "activo",
        plan: "Mensual",
        category: "JUNIOR",
        price: 297,
        monthlyDueDate: 15,
        paymentStatus: "al_dia",
        risk: 10,
        makeupCredits: 0,
        completedClasses: 0,
        attendanceRate: un.attendanceRate !== undefined ? un.attendanceRate : 100,
        notes: "Matriculado mediante importación limpia 2026",
      });
      createdCount += 1;
    });

    toast.success(`✓ ¡Base 2026 sincronizada con éxito!`, {
      description: `${activatedCount} alumnos reactivados por coincidencia y ${createdCount} nuevos alumnos ingresados.`,
    });

    setCsvPreview(null);
    setCsvRawText("");
    onClose();
  };

  // --- TAB 3: Pausar Base Histórica Masiva ---
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const EXPECTED_PHRASE = "PAUSAR BASE 2026";
  const [isPausing, setIsPausing] = useState(false);

  const handleBulkPause = () => {
    if (confirmPhrase.trim().toUpperCase() !== EXPECTED_PHRASE) {
      toast.error(`Escribe exactamente "${EXPECTED_PHRASE}" para confirmar.`);
      return;
    }

    setIsPausing(true);
    let count = 0;
    students.forEach((st) => {
      if (st.status === "activo") {
        setStudentStatus(st.id, "pausa");
        count += 1;
      }
    });

    setIsPausing(false);
    setConfirmPhrase("");
    toast.info(`✓ Se pausaron ${count} alumnos para depuración.`, {
      description: "Todos los historiales están a salvo. Ahora puedes activar 1 a 1 a los alumnos vigentes.",
    });
    setActiveTab("activar");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#F47B20]/10 p-2 text-[#F47B20]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-foreground">
                Depuración & Activación de Alumnos Reales 2026
              </DialogTitle>
              <DialogDescription className="text-xs">
                Sanea la base de datos sin borrar el historial. Pausa registros obsoletos y activa solo a los alumnos confirmados.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Banner de las Dos Bases Separadas con Descarga Directa a Excel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-2xl bg-muted/40 border border-border">
          {/* Base Antigua */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border/80">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground">{HISTORICAL_BASE_METADATA.name}</span>
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold">
                  {historicalStudents.length || 83} reg.
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">Corte: {HISTORICAL_BASE_METADATA.createdAt} · Inmutable</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleDownloadHistoricalCSV}
              className="h-7 text-[11px] font-bold gap-1 rounded-lg border-border hover:bg-muted"
              title="Descargar todos los alumnos de la base histórica en CSV para Excel"
            >
              <Download className="h-3 w-3 text-primary" />
              Descargar Excel
            </Button>
          </div>

          {/* Base Activa 2026 */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-emerald-500/30">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground">Base Activa 2026</span>
                <Badge className="text-[9px] px-1 py-0 h-4 bg-emerald-500 text-white font-bold">
                  {activeStudentsCount} activos
                </Badge>
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Ciclo lectivo confirmado</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleDownloadActiveCSV}
              className="h-7 text-[11px] font-bold gap-1 rounded-lg border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
              title="Descargar los alumnos activos del ciclo 2026 en CSV para Excel"
            >
              <Download className="h-3 w-3 text-emerald-500" />
              Descargar Excel
            </Button>
          </div>
        </div>

        {/* Pestañas Superiores */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border">
          <button
            type="button"
            onClick={() => setActiveTab("activar")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "activar"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Activar 1 a 1</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-bold ml-1">
              {inactiveStudents.length} en espera
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("excel")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "excel"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-blue-500" />
            <span>Subir Excel Limpio (Match)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pausar")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "pausar"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span>Pausar Base Antigua</span>
            {activeStudentsCount > 0 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-bold ml-1 border-amber-500/40 text-amber-500">
                {activeStudentsCount} activos
              </Badge>
            )}
          </button>
        </div>

        {/* CONTENIDO TAB 1: Activar 1 a 1 */}
        {activeTab === "activar" && (
          <div className="space-y-4 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar alumno histórico por nombre, familia o teléfono..."
                className="pl-9 text-xs rounded-xl"
              />
            </div>

            {selectedStudent ? (
              /* Formulario de Activación de Alumno Seleccionado */
              <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/[0.03] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                      Activando Alumno Real 2026:
                    </span>
                    <h3 className="text-base font-black text-foreground">{selectedStudent.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Familia: {selectedStudent.family} · Instrumento actual: {selectedStudent.instrument}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStudent(null)}
                    className="h-7 text-xs"
                  >
                    Cambiar Alumno
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Profesor de Planta:</label>
                    <Select value={schTeacher} onValueChange={setSchTeacher}>
                      <SelectTrigger className="h-8 text-xs rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">Instrumento / Curso:</label>
                    <Select value={schInstrument} onValueChange={setSchInstrument}>
                      <SelectTrigger className="h-8 text-xs rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {musicalInstruments.map((inst) => (
                          <SelectItem key={inst} value={inst}>
                            {inst}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2 rounded-xl bg-primary/5 border border-primary/20 p-3 space-y-1">
                    <span className="font-bold text-foreground text-xs flex items-center gap-1.5 text-primary">
                      <Calendar className="h-4 w-4 text-primary" />
                      Horario Inicial en Blanco (0 clases programadas)
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      El alumno se activará en la <strong>Base Activa 2026</strong> con su horario limpio. Secretaría coordinará y asignará sus días y horas manualmente usando el botón <strong>+ Horario</strong>.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">Celular WhatsApp:</label>
                    <Input
                      value={schPhone}
                      onChange={(e) => setSchPhone(e.target.value)}
                      placeholder="51900000000"
                      className="h-8 text-xs rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2 rounded-xl bg-card border border-border p-2.5 space-y-1.5">
                    <label className="block font-bold text-foreground text-xs">
                      Asistencia Inicial Mapeada (Editar según seguimiento real):
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={schAttendanceRate}
                          onChange={(e) => setSchAttendanceRate(Number(e.target.value))}
                          className="h-8 text-xs rounded-xl w-20 font-mono font-bold"
                        />
                        <span className="text-xs font-bold text-muted-foreground">%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[100, 90, 85, 80, 75].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => setSchAttendanceRate(rate)}
                            className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all border ${
                              schAttendanceRate === rate
                                ? "bg-emerald-500 text-black border-emerald-500 shadow-xs"
                                : "bg-muted/60 text-muted-foreground hover:text-foreground border-border"
                            }`}
                          >
                            {rate}%
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground italic">
                        (Corrige si el Excel antiguo tenía asistencias incompletas)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)}>
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmActivate}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    ✓ Activar Alumno (Confirmar Continuidad)
                  </Button>
                </div>
              </div>
            ) : (
              /* Lista de Resultados de Búsqueda */
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {searchResults.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-xs">
                    No se encontraron alumnos inactivos con ese criterio.
                  </div>
                ) : (
                  searchResults.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:border-emerald-500/50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-xs">{st.name}</span>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {st.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {st.family} · {st.instrument || "Piano"} · {st.phone || "Sin cel"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingHistoricalStudent(st)}
                          className="h-7 px-2 text-xs font-bold rounded-xl border-border hover:bg-muted text-muted-foreground hover:text-foreground gap-1"
                          title="Ver ficha antigua completa de este alumno (Base Histórica)"
                        >
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          <span className="hidden sm:inline">Ver Ficha Antigua</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleSelectToActivate(st)}
                          className="h-7 px-3 text-xs font-bold rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
                        >
                          Activar este alumno →
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO TAB 2: Subida de Excel Limpio */}
        {activeTab === "excel" && (
          <div className="space-y-4 pt-2">
            <div className="rounded-2xl border border-border p-4 bg-muted/20 text-xs space-y-2">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                Cruce Inteligente con Base de Datos
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Sube el archivo Excel o CSV limpio con los alumnos que continúan. El sistema buscará coincidencias en la base histórica:
                los alumnos que coincidan se pasarán a <strong>Activo</strong> con su curso asignado, y los alumnos nuevos se registrarán automáticamente.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 font-bold rounded-xl text-xs"
              >
                <Upload className="h-4 w-4 text-primary" />
                Cargar Archivo CSV (.csv)
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleDownloadTemplate}
                className="gap-2 font-bold rounded-xl text-xs border-primary/40 text-primary hover:bg-primary/10"
              >
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                Descargar Plantilla Ejemplo (.csv)
              </Button>
            </div>

            <Textarea
              value={csvRawText}
              onChange={(e) => handleProcessCSV(e.target.value)}
              placeholder="Nombre;Celular;Instrumento;Profesor;Horario&#10;Alonso Ruiz;987654321;Piano;Jeremy;Lun-Mié 16:00&#10;Valeria Flores;912345678;Canto;Nathaly;Mar-Jue 17:30"
              className="text-xs min-h-[100px] font-mono"
            />

            {csvPreview && (
              <div className="rounded-xl border border-border p-3 bg-card space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span>Resultado del análisis previo:</span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-emerald-500">
                      ✓ {csvPreview.matched.length} alumnos existentes por reactivar
                    </span>
                    <span className="text-blue-500">
                      + {csvPreview.unmatched.length} alumnos nuevos
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={handleApplyMatch}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs"
                >
                  Confirmar y Aplicar Activación Masiva ({csvPreview.matched.length + csvPreview.unmatched.length} alumnos)
                </Button>
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO TAB 3: Pausar Base Antigua */}
        {activeTab === "pausar" && (
          <div className="space-y-4 pt-2">
            <div className="rounded-2xl border-2 border-amber-500/30 bg-amber-500/[0.04] p-4 text-xs space-y-2">
              <h4 className="font-bold text-amber-500 flex items-center gap-2 text-sm">
                <ShieldAlert className="h-4 w-4" />
                Pausar Alumnos para Inicio Limpio 2026
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Esta acción cambia temporalmente el estado de los <strong>{activeStudentsCount} alumnos activos</strong> actuales a <strong>PAUSA</strong>.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pt-1">
                <li><strong>No se borra ningún alumno</strong> de la base de datos de PostgreSQL.</li>
                <li>Se conservan todas sus facturas, asistencias y notas históricas.</li>
                <li>Permite que tu lista activa empiece en cero para ir activando 1 a 1 a los alumnos que realmente siguen.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground">
                Para confirmar, escribe exactamente <code className="text-amber-500 font-mono font-black">{EXPECTED_PHRASE}</code>:
              </label>
              <Input
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                placeholder={EXPECTED_PHRASE}
                className="text-xs rounded-xl uppercase font-mono"
              />
            </div>

            <Button
              variant="destructive"
              size="sm"
              disabled={confirmPhrase.trim().toUpperCase() !== EXPECTED_PHRASE || isPausing}
              onClick={handleBulkPause}
              className="w-full font-black text-xs rounded-xl gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Pausar Base Antigua y Comenzar Depuración 2026
            </Button>
          </div>
        )}

        <DialogFooter className="pt-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Modal de Ficha Antigua (Ojito 👁️ para apoyo visual a Secretaría) */}
    <Dialog
      open={!!viewingHistoricalStudent}
      onOpenChange={(open) => !open && setViewingHistoricalStudent(null)}
    >
      <DialogContent className="sm:max-w-lg rounded-3xl p-5 space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-foreground">
                Ficha Histórica Inicial
              </DialogTitle>
              <DialogDescription className="text-xs">
                Información registrada en la base antigua (Corte: {HISTORICAL_BASE_METADATA.createdAt}).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {viewingHistoricalStudent && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">{viewingHistoricalStudent.name}</span>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {viewingHistoricalStudent.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Familia: <strong>{viewingHistoricalStudent.family}</strong>
              </p>
              <p className="text-muted-foreground">
                Celular / WhatsApp: <strong>{viewingHistoricalStudent.phone || "No registrado"}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl border border-border bg-card space-y-0.5">
                <span className="text-[10px] text-muted-foreground block font-semibold">Instrumento:</span>
                <span className="font-bold text-foreground">{viewingHistoricalStudent.instrument || "Piano"}</span>
              </div>
              <div className="p-2.5 rounded-xl border border-border bg-card space-y-0.5">
                <span className="text-[10px] text-muted-foreground block font-semibold">Nivel Registrado:</span>
                <span className="font-bold text-foreground">{viewingHistoricalStudent.level || "Nivel 1"}</span>
              </div>
              <div className="p-2.5 rounded-xl border border-border bg-card space-y-0.5">
                <span className="text-[10px] text-muted-foreground block font-semibold">Profesor Histórico:</span>
                <span className="font-bold text-foreground">{viewingHistoricalStudent.teacher || "Por asignar"}</span>
              </div>
              <div className="p-2.5 rounded-xl border border-border bg-card space-y-0.5">
                <span className="text-[10px] text-muted-foreground block font-semibold">Modalidad Registrada:</span>
                <span className="font-bold text-foreground">{viewingHistoricalStudent.modality || "Regular"}</span>
              </div>
            </div>

            {viewingHistoricalStudent.emergencyContact && (
              <div className="p-2.5 rounded-xl border border-border bg-card space-y-1">
                <span className="text-[10px] text-primary block font-bold">Apoderado / Contacto de Emergencia:</span>
                <p className="text-muted-foreground">
                  {viewingHistoricalStudent.emergencyContact.name} ({viewingHistoricalStudent.emergencyContact.relation || "Apoderado"})
                  {viewingHistoricalStudent.emergencyContact.phone && ` · Tel: ${viewingHistoricalStudent.emergencyContact.phone}`}
                </p>
              </div>
            )}

            {viewingHistoricalStudent.teacherNote && (
              <div className="p-2.5 rounded-xl border border-border bg-card space-y-1">
                <span className="text-[10px] text-muted-foreground block font-semibold">Observaciones / Notas Previas:</span>
                <p className="italic text-foreground">{viewingHistoricalStudent.teacherNote}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setViewingHistoricalStudent(null)}
                className="text-xs"
              >
                Cerrar Consulta
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const target = viewingHistoricalStudent;
                  setViewingHistoricalStudent(null);
                  handleSelectToActivate(target);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs gap-1.5"
              >
                Activar este Alumno en Base 2026 →
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
