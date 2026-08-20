import { useMemo, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  BookOpen,
  CalendarCheck,
  Cake,
  Clock,
  CreditCard,
  GraduationCap,
  Mail,
  MinusCircle,
  Phone,
  PlusCircle,
  Search,
  ShieldAlert,
  UserCheck,
  UserX,
  Users,
  FileSpreadsheet,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  HelpCircle,
  KeyRound,
  Lock,
  Calendar,
  RotateCcw,
} from "lucide-react";
import {
  useAppStore,
  type AdminStudent,
  type AgeCategory,
  type LessonModality,
  type StudentStatus,
} from "@/store/app-store";
import { teachers, musicalInstruments, VIBRA_PRICING } from "@/store/admin-seeds";
import { categoryStyles } from "@/components/admin/agenda-board";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { money } from "@/lib/format";

const ALL = "todos";

function statusBadge(status: StudentStatus) {
  switch (status) {
    case "activo":
      return <Badge className="bg-success/15 text-success hover:bg-success/20 border-0">Activo</Badge>;
    case "pausa":
      return <Badge className="bg-warning/20 text-warning-foreground hover:bg-warning/25 border-0">En Pausa</Badge>;
    case "baja":
      return <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/20 border-0">Baja</Badge>;
  }
}

function modalityBadge(modality: LessonModality) {
  if (modality.startsWith("Intensivo")) {
    return (
      <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[11px]">
        <Clock className="mr-1 h-3 w-3" />
        Intensivo (90m x1)
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-border bg-muted/60 text-foreground text-[11px]">
      <Clock className="mr-1 h-3 w-3" />
      Regular (45m x2)
    </Badge>
  );
}

function riskBadge(risk: number) {
  if (risk >= 70) {
    return (
      <Badge className="bg-destructive/15 text-destructive border-0">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Alto ({risk}%)
      </Badge>
    );
  }
  if (risk >= 30) {
    return (
      <Badge className="bg-warning/20 text-warning-foreground border-0">
        Medio ({risk}%)
      </Badge>
    );
  }
  return (
    <Badge className="bg-success/15 text-success border-0">
      Bajo ({risk}%)
    </Badge>
  );
}

export function StudentsTable() {
  const activeRole = useAppStore((s) => s.activeRole);
  const students = useAppStore((s) => s.adminStudents);
  const setStudentStatus = useAppStore((s) => s.setStudentStatus);
  const assignTeacher = useAppStore((s) => s.assignTeacher);
  const setStudentModality = useAppStore((s) => s.setStudentModality);
  const addStudentCredit = useAppStore((s) => s.addStudentCredit);
  const consumeStudentCredit = useAppStore((s) => s.consumeStudentCredit);
  const importStudentsFromCSV = useAppStore((s) => s.importStudentsFromCSV);
  const clearStudents = useAppStore((s) => s.clearStudents);
  const deleteStudent = useAppStore((s) => s.deleteStudent);
  const deleteStudents = useAppStore((s) => s.deleteStudents);
  const updateStudentDetails = useAppStore((s) => s.updateStudentDetails);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [teacherFilter, setTeacherFilter] = useState(ALL);
  const [modalityFilter, setModalityFilter] = useState(ALL);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]); // Selección múltiple para eliminar

  // Estados de Importador CSV de Alumnos
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvPreview, setCsvPreview] = useState<AdminStudent[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Vaciar Directorio Seguro (Exclusivo Dueña: Contraseña + Frase GitHub Style)
  const [isClearSecureOpen, setIsClearSecureOpen] = useState(false);
  const [ownerPassword, setOwnerPassword] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const EXPECTED_PHRASE = "VACIAR ALUMNOS VIBRA";

  // Estado para Programar Horario de Alumno
  const addLessonToSchedule = useAppStore((s) => s.addLessonToSchedule);
  const [scheduleModalStudent, setScheduleModalStudent] = useState<AdminStudent | null>(null);
  const [schTeacher, setSchTeacher] = useState("");
  const [schInstrument, setSchInstrument] = useState(musicalInstruments[0] || "Piano");
  const [schDay, setSchDay] = useState<"Lun" | "Mar" | "Mié" | "Jue" | "Vie" | "Sáb">("Lun");
  const [schTime, setSchTime] = useState("16:00");
  const [schRoom, setSchRoom] = useState("Sala A");
  const [schCategory, setSchCategory] = useState<AgeCategory>("JUNIOR");

  // Estado para Crear Alerta / Incidencia de Alumno
  const addStudentAlert = useAppStore((s) => s.addStudentAlert);
  const [alertModalStudent, setAlertModalStudent] = useState<AdminStudent | null>(null);
  const [alertType, setAlertType] = useState<"salud" | "comportamiento" | "logro" | "coordinacion" | "otro">("salud");
  const [alertSeverity, setAlertSeverity] = useState<"alta" | "media" | "baja" | "positiva">("media");
  const [alertMessage, setAlertMessage] = useState("");

  // Estado para Solicitud de Eliminación (Exclusivo Secretaría Nayeli -> Dueña)
  const createDeletionRequest = useAppStore((s) => s.createDeletionRequest);
  const addStudentReentryRecord = useAppStore((s) => s.addStudentReentryRecord);
  const [deleteReqStudent, setDeleteReqStudent] = useState<AdminStudent | null>(null);
  const [deleteReqReason, setDeleteReqReason] = useState("");

  // Estado para Registrar Reingreso de Alumno
  const [isReentryFormOpen, setIsReentryFormOpen] = useState(false);
  const [reentryDate, setReentryDate] = useState("2026-08-18");
  const [reentryReason, setReentryReason] = useState("");
  const [reentryNotes, setReentryNotes] = useState("");

  // Handler de WhatsApp Business con plantillas oficiales
  const handleOpenWhatsApp = (st: AdminStudent, templateType: "bienvenida" | "recordatorio" | "coordinacion" = "coordinacion") => {
    const rawPhone = st.phone || st.emergencyContact?.phone || "";
    const cleanPhone = rawPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("51") ? cleanPhone : cleanPhone ? `51${cleanPhone}` : "51900000000";
    
    let message = "";
    if (templateType === "bienvenida") {
      message = `¡Hola Familia ${st.family}! 🎶 Te damos una cordial bienvenida a Vibra Music. Confirmamos la matrícula de ${st.name} en el curso de ${st.instrument} con el ${st.teacher}. ¡Estamos muy felices de acompañarlos en su formación musical!`;
    } else if (templateType === "recordatorio") {
      message = `Estimada Familia ${st.family}, cordial saludo de Secretaría Vibra Music. Les recordamos que la mensualidad de ${st.name} vence en los próximos días. Si ya realizaron el abono por Yape/Transferencia, por favor envíennos la captura de pantalla por este medio. ¡Muchas gracias!`;
    } else {
      message = `Hola Familia ${st.family}, te saluda Secretaría de Vibra Music respecto a las clases de ${st.name} (${st.instrument}).`;
    }

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast.success(`Abriendo WhatsApp Business con Familia ${st.family}`);
  };

  // Parser inteligente de CSV de Alumnos para Nayeli
  function parseStudentsCsv(text: string) {
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
    const parsed: AdminStudent[] = [];

    const firstLineLower = lines[0]!.toLowerCase();
    const startIndex =
      firstLineLower.includes("alumno") ||
      firstLineLower.includes("nombre") ||
      firstLineLower.includes("familia")
        ? 1
        : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i]!;
      const cols = line.includes(";") ? line.split(";") : line.split(",");
      const cleanCols = cols.map((c) => c.trim().replace(/^["']|["']$/g, ""));

      if (cleanCols.length < 4) {
        errors.push(`Línea ${i + 1}: Faltan columnas (se esperan al menos: Nombre, Familia, Instrumento, Profesor).`);
        continue;
      }

      const [name, family, instrument, teacher, modalityRaw, email, phone, emergencyName, emergencyPhone] = cleanCols;

      if (!name) {
        errors.push(`Línea ${i + 1}: Nombre de alumno obligatorio.`);
        continue;
      }

      const modality: LessonModality = (modalityRaw || "").toLowerCase().includes("inten")
        ? "Intensivo (4 clases / 90 min)"
        : "Regular (8 clases / 45 min)";

      parsed.push({
        id: `as-csv-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        name,
        family: family || `Familia ${name.split(" ")[1] || name}`,
        instrument: instrument || "Piano",
        level: "Nivel 1",
        teacher: teacher || "Prof. por Asignar",
        modality,
        status: "activo",
        attendanceRate: 100,
        payment: "al-dia",
        risk: 0,
        joinedAt: "Ago 2026",
        makeupCredits: 0,
        balance: 0,
        recentAttendance: ["presente", "presente", "presente"],
        teacherNote: "Alumno importado desde el registro oficial.",
        email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
        phone: phone || "+51 900 000 000",
        emergencyContact: {
          name: emergencyName || `${family || "Apoderado"} (Titular)`,
          phone: emergencyPhone || phone || "+51 900 000 000",
          relation: "Apoderado",
        },
        birthdate: "15 de Agosto",
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
      parseStudentsCsv(content);
    };
    reader.readAsText(file, "UTF-8");
  }

  function handleApplyCsv(mode: "replace" | "append") {
    if (csvPreview.length === 0) {
      toast.error("No hay alumnos válidos para importar.");
      return;
    }

    if (mode === "replace") {
      importStudentsFromCSV(csvPreview);
      toast.success("✅ Directorio de alumnos reemplazado con éxito", {
        description: `Se han registrado ${csvPreview.length} alumnos desde el archivo CSV.`,
      });
    } else {
      importStudentsFromCSV([...students, ...csvPreview]);
      toast.success("✅ Alumnos añadidos al directorio", {
        description: `Se sumaron ${csvPreview.length} alumnos al directorio existente.`,
      });
    }

    setIsCsvModalOpen(false);
    setCsvText("");
    setCsvPreview([]);
    setCsvErrors([]);
  }

  function downloadCsvTemplate() {
    const header = "Nombre,Familia,Instrumento,Profesor,Modalidad,Email,Telefono,ContactoEmergencia,TelefonoEmergencia\n";
    const samples = [
      "Mateo Rivas,Familia Rivas,Guitarra,Prof. Jeremy,Regular,fam.rivas@gmail.com,+51 984 123 456,Carlos Rivas,+51 984 123 400",
      "Sofía Rivas,Familia Rivas,Piano,Prof. Fernando,Regular,fam.rivas@gmail.com,+51 984 123 456,Carlos Rivas,+51 984 123 400",
      "Luana Prado,Familia Prado,Violín,Prof. Fernando,Intensivo,prado.musica@hotmail.com,+51 972 888 112,Mariana Prado,+51 972 888 999",
    ].join("\n");

    const blob = new Blob([header + samples], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_alumnos_vibra_music.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("📥 Plantilla de Alumnos CSV descargada", {
      description: "Ábrela en Excel, llena los datos de los alumnos y súbela aquí.",
    });
  }

  const availableTeachers = useMemo(() => {
    const fromStudents = students.map((s) => s.teacher).filter(Boolean);
    return Array.from(new Set([...teachers, ...fromStudents])).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      const matchSearch =
        search.trim() === "" ||
        st.name.toLowerCase().includes(search.toLowerCase()) ||
        st.family.toLowerCase().includes(search.toLowerCase()) ||
        st.instrument.toLowerCase().includes(search.toLowerCase()) ||
        st.email.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === ALL || st.status === statusFilter;
      const matchTeacher = teacherFilter === ALL || st.teacher === teacherFilter;
      const matchModality =
        modalityFilter === ALL ||
        (modalityFilter === "regular" && st.modality.startsWith("Regular")) ||
        (modalityFilter === "intensivo" && st.modality.startsWith("Intensivo"));

      return matchSearch && matchStatus && matchTeacher && matchModality;
    });
  }, [students, search, statusFilter, teacherFilter, modalityFilter]);

  const activeCount = students.filter((s) => s.status === "activo").length;
  const inactiveCount = students.filter((s) => s.status !== "activo").length;

  const selectedStudent = students.find((s) => s.id === selectedStudentId) ?? null;

  return (
    <div className="space-y-6">
      {/* Resumen superior */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Tile
          icon={UserCheck}
          label="Alumnos Activos"
          value={`${activeCount}`}
          hint="En clase regular o intensiva"
          tone="text-success"
        />
        <Tile
          icon={UserX}
          label="Alumnos Inactivos"
          value={`${inactiveCount}`}
          hint={`${students.filter((s) => s.status === "pausa").length} pausa, ${students.filter((s) => s.status === "baja").length} baja`}
          tone="text-warning"
        />
        <Tile
          icon={GraduationCap}
          label="Asistencia Promedio"
          value={`${Math.round(
            students.reduce((acc, s) => acc + s.attendanceRate, 0) / (students.length || 1),
          )}%`}
          hint="Promedio general mensual"
        />
        <Tile
          icon={AlertTriangle}
          label="En Riesgo de Deserción"
          value={`${students.filter((s) => s.risk >= 70).length}`}
          hint="Riesgo > 70%"
          alert={students.filter((s) => s.risk >= 70).length > 0}
        />
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[14rem] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar alumno, apoderado, correo o instrumento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[11rem]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Estado: todos</SelectItem>
            <SelectItem value="activo">Activos ({activeCount})</SelectItem>
            <SelectItem value="pausa">En pausa</SelectItem>
            <SelectItem value="baja">Bajas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={modalityFilter} onValueChange={setModalityFilter}>
          <SelectTrigger className="w-[12rem]">
            <SelectValue placeholder="Modalidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Modalidad: todas</SelectItem>
            <SelectItem value="regular">Regular (8 clases / 45m)</SelectItem>
            <SelectItem value="intensivo">Intensivo (4 clases / 90m)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={teacherFilter} onValueChange={setTeacherFilter}>
          <SelectTrigger className="w-[13rem]">
            <SelectValue placeholder="Profesor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Profesor: todos</SelectItem>
            {availableTeachers.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(search || statusFilter !== ALL || teacherFilter !== ALL || modalityFilter !== ALL) && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("");
              setStatusFilter(ALL);
              setTeacherFilter(ALL);
              setModalityFilter(ALL);
            }}
          >
            Limpiar filtros
          </Button>
        )}

        {/* Botón de Eliminar Alumnos Seleccionados (Solo cuando hay seleccionados) */}
        {selectedStudentIds.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => {
              const count = selectedStudentIds.length;
              if (confirm(`¿Estás seguro de eliminar a los ${count} alumno(s) seleccionados y liberar todos sus horarios asignados?`)) {
                deleteStudents(selectedStudentIds);
                toast.success(`🗑️ ${count} alumno(s) y sus horarios fueron eliminados correctamente`);
                setSelectedStudentIds([]);
              }
            }}
            className="gap-1.5 font-bold animate-in fade-in"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar Seleccionados ({selectedStudentIds.length})
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => setIsCsvModalOpen(true)}
          className="gap-1.5 font-bold border-success/40 text-success bg-success/10 hover:bg-success/20"
        >
          <FileSpreadsheet className="h-4 w-4 text-success" />
          📊 Subir Alumnos (CSV/Excel)
        </Button>

        <NewStudentDialog />
      </div>

      {/* Tabla de Alumnos */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredStudents.length > 0 &&
                      selectedStudentIds.length === filteredStudents.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudentIds(filteredStudents.map((s) => s.id));
                      } else {
                        setSelectedStudentIds([]);
                      }
                    }}
                    className="h-4 w-4 rounded border-border text-primary cursor-pointer align-middle"
                    title="Seleccionar todos los alumnos"
                  />
                </TableHead>
                <TableHead>Alumno / Apoderado</TableHead>
                <TableHead>Modalidad</TableHead>
                <TableHead>Instrumento</TableHead>
                <TableHead>Profesor</TableHead>
                <TableHead className="w-[9rem]">Asistencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Riesgo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                    No se encontraron alumnos con los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((st) => (
                  <TableRow
                    key={st.id}
                    className={`cursor-pointer transition-colors ${
                      selectedStudentIds.includes(st.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/40"
                    }`}
                    onClick={() => setSelectedStudentId(st.id)}
                  >
                    <TableCell className="w-10 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(st.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudentIds((prev) => [...prev, st.id]);
                          } else {
                            setSelectedStudentIds((prev) => prev.filter((id) => id !== st.id));
                          }
                        }}
                        className="h-4 w-4 rounded border-border text-primary cursor-pointer align-middle"
                      />
                    </TableCell>
                    <TableCell>
                      {(() => {
                        // Calcular categoría si no estuviera asignada explícitamente
                        let cat = st.ageCategory;
                        if (!cat) {
                          const birthYear = st.birthdate ? parseInt(st.birthdate.split(/[-/]/)[0] || st.birthdate.split(/[-/]/)[2] || "0") : 0;
                          const age = st.age || (birthYear > 1900 ? 2026 - birthYear : 20);
                          cat = age >= 18 ? "ADULTO" : age >= 13 ? "JUVENIL" : age >= 7 ? "JUNIOR" : "INFANTIL";
                        }
                        // Obtener nombre simple de categoría: JUNIOR, ADULTO, JUVENIL, INFANTIL, etc.
                        const simpleCat = cat === "RECUPERACION"
                          ? "RECUPERACIÓN"
                          : cat === "PERSONALIZADA"
                          ? "PERSONALIZADA"
                          : cat;

                        const cs = categoryStyles[cat] || categoryStyles.ADULTO;

                        return (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-foreground text-sm">{st.name}</span>
                              <span className={`inline-flex items-center px-1.5 py-0.2 rounded-md text-[10px] font-bold border ${cs.bg} ${cs.text} ${cs.border}`}>
                                ({simpleCat})
                              </span>
                              {(st.isReentry || (st.reentryHistory && st.reentryHistory.length > 0)) && (
                                <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-[10px] font-black gap-0.5 px-1.5 py-0.2">
                                  🔄 Reingreso
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {st.family} · {st.level}
                            </div>
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>{modalityBadge(st.modality)}</TableCell>
                    <TableCell className="text-sm font-medium">{st.instrument}</TableCell>
                    <TableCell className="text-sm">{st.teacher}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span>{st.attendanceRate}%</span>
                        </div>
                        <Progress value={st.attendanceRate} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell>{statusBadge(st.status)}</TableCell>
                    <TableCell>{riskBadge(st.risk)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setScheduleModalStudent(st);
                            setSchTeacher(st.teacher && st.teacher !== "Prof. por Asignar" ? st.teacher : availableTeachers[0] || "");
                            setSchInstrument(st.instrument || "Piano");
                            if (st.ageCategory) setSchCategory(st.ageCategory);
                          }}
                          className="gap-1 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          + Horario
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAlertModalStudent(st);
                            setAlertMessage("");
                            setAlertType("salud");
                            setAlertSeverity("media");
                          }}
                          className="gap-1 text-xs font-semibold border-warning/40 text-warning bg-warning/10 hover:bg-warning/20"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Alerta
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenWhatsApp(st, "coordinacion");
                          }}
                          className="h-8 w-8 p-0 text-success hover:bg-success/10 hover:text-success border-success/30 rounded-lg"
                          title={`Enviar WhatsApp a Familia ${st.family} (${st.phone})`}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentId(st.id);
                          }}
                          className="text-xs"
                        >
                          Ver Ficha
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeRole === "staff") {
                              // Secretaría: Crea Solicitud de Eliminación para la Dueña
                              setDeleteReqStudent(st);
                              setDeleteReqReason("");
                            } else {
                              // Dueña: Eliminación directa con confirmación
                              if (confirm(`¿Estás seguro de eliminar a ${st.name} y liberar todos sus horarios asignados?`)) {
                                deleteStudent(st.id);
                                toast.success(`Alumno ${st.name} y sus horarios eliminados`);
                              }
                            }
                          }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          title={activeRole === "staff" ? `Solicitar baja/eliminación de ${st.name} a Dirección` : `Eliminar ${st.name} y sus horarios`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sheet Ficha del Alumno Ampliada */}
      <Sheet open={!!selectedStudent} onOpenChange={(o) => !o && setSelectedStudentId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selectedStudent && (
            <>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-xl">{selectedStudent.name}</SheetTitle>
                  {statusBadge(selectedStudent.status)}
                </div>
                <SheetDescription>
                  {selectedStudent.family} · {selectedStudent.instrument} ({selectedStudent.level})
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 pt-5">
                {/* Plan de Inversión Oficial (Dossier Comunidad Vibra) */}
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4" />
                      Plan de Inversión y Tarifas (Dossier Oficial)
                    </span>
                    <Badge variant="outline" className="text-xs font-black bg-primary text-primary-foreground border-0">
                      {selectedStudent.planType || "Mensual"} · S/ {(selectedStudent.planPrice || VIBRA_PRICING.Mensual.priceMonthly).toFixed(2)} / mes
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground block">
                        Tipo de Plan Contratado
                      </label>
                      <Select
                        value={selectedStudent.planType || "Mensual"}
                        onValueChange={(v: "Mensual" | "Trimestral" | "Anual") => {
                          const prices = {
                            Mensual: VIBRA_PRICING.Mensual.priceMonthly,
                            Trimestral: VIBRA_PRICING.Trimestral.priceMonthly,
                            Anual: VIBRA_PRICING.Anual.priceMonthly,
                          };
                          const endMonths = {
                            Mensual: "2026-08",
                            Trimestral: "2026-10",
                            Anual: "2027-07",
                          };
                          updateStudentDetails(selectedStudent.id, {
                            planType: v,
                            planPrice: prices[v],
                            planEndMonth: endMonths[v],
                          });
                          toast.success(`Plan actualizado a ${v}`, {
                            description: `Tarifa mensual: S/ ${prices[v].toFixed(2)}`,
                          });
                        }}
                      >
                        <SelectTrigger className="bg-background text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mensual">
                            Mensual — S/ {VIBRA_PRICING.Mensual.priceMonthly.toFixed(2)} / mes (Tarifa Regular)
                          </SelectItem>
                          <SelectItem value="Trimestral">
                            Trimestral — S/ {VIBRA_PRICING.Trimestral.priceMonthly.toFixed(2)} / mes (12% Dcto.)
                          </SelectItem>
                          <SelectItem value="Anual">
                            Anual — S/ {VIBRA_PRICING.Anual.priceMonthly.toFixed(2)} / mes (20% Dcto.)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground block">
                        Frecuencia y Duración
                      </label>
                      <Select
                        value={selectedStudent.modality}
                        onValueChange={(v) => {
                          setStudentModality(selectedStudent.id, v as LessonModality);
                          toast.success(`Modalidad actualizada a ${v}`);
                        }}
                      >
                        <SelectTrigger className="bg-background text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Regular (8 clases / 45 min)">
                            Regular: 8 clases/mes (2x semana, 45 min)
                          </SelectItem>
                          <SelectItem value="Intensivo (4 clases / 90 min)">
                            Intensivo: 4 clases/mes (1x semana, 90 min)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground block">
                        Estado de Matrícula
                      </label>
                      <Select
                        value={selectedStudent.matriculaType || "Promo Demo (S/ 30)"}
                        onValueChange={(v: any) => {
                          updateStudentDetails(selectedStudent.id, { matriculaType: v });
                          toast.success(`Matrícula asignada: ${v}`);
                        }}
                      >
                        <SelectTrigger className="bg-background text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Promo Demo (S/ 30)">Promo Demostrativa — S/ 30.00 (75% Dcto.)</SelectItem>
                          <SelectItem value="Regular (S/ 120)">Matrícula Regular — S/ 120.00</SelectItem>
                          <SelectItem value="Exonerada">Exonerada — S/ 0.00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1 flex flex-col justify-end">
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Pack de Útiles Anual (S/ 67.00)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const current = selectedStudent.packUtilesPaid ?? true;
                          updateStudentDetails(selectedStudent.id, { packUtilesPaid: !current });
                          toast.success(`Pack de útiles ${!current ? "Entregado y Pagado" : "Pendiente"}`);
                        }}
                        className={`h-8 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-between ${
                          (selectedStudent.packUtilesPaid ?? true)
                            ? "bg-success/15 border-success/30 text-success"
                            : "bg-destructive/10 border-destructive/30 text-destructive"
                        }`}
                      >
                        <span>{(selectedStudent.packUtilesPaid ?? true) ? "✓ Pack Entregado (S/ 67)" : "⚠️ Pendiente de entrega"}</span>
                        <span className="text-[10px] underline">Cambiar</span>
                      </button>
                    </div>

                    {/* Vigencia Temporal: Día Exacto de Inicio y Día Exacto de Vencimiento */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-primary flex items-center gap-1">
                        🗓️ Fecha Exacta de Inicio
                      </label>
                      <Input
                        type="date"
                        value={selectedStudent.planStartDate || "2026-08-03"}
                        onChange={(e) => {
                          const newStartDate = e.target.value;
                          if (!newStartDate) return;

                          // Calcular fecha exacta de fin según el plan
                          const [y, m, d] = newStartDate.split("-").map((v) => parseInt(v, 10));
                          const durationMonths =
                            selectedStudent.planType === "Trimestral"
                              ? 3
                              : selectedStudent.planType === "Anual"
                              ? 12
                              : 1;

                          // Fecha de fin = +N meses menos 1 día
                          const endD = new Date(y!, (m! - 1) + durationMonths, d!);
                          endD.setDate(endD.getDate() - 1);

                          const endY = endD.getFullYear();
                          const endM = String(endD.getMonth() + 1).padStart(2, "0");
                          const endDay = String(endD.getDate()).padStart(2, "0");
                          const calculatedEndDate = `${endY}-${endM}-${endDay}`;
                          const startMonthStr = `${y}-${String(m).padStart(2, "0")}`;
                          const endMonthStr = `${endY}-${endM}`;

                          updateStudentDetails(selectedStudent.id, {
                            planStartDate: newStartDate,
                            planEndDate: calculatedEndDate,
                            planStartMonth: startMonthStr,
                            planEndMonth: endMonthStr,
                          });
                          toast.success(`Inicio fijado al ${newStartDate}`, {
                            description: `Vence el: ${calculatedEndDate} (${durationMonths} meses de clases)`,
                          });
                        }}
                        className="text-xs h-8 bg-background"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-primary flex items-center gap-1">
                        🏁 Fecha Exacta de Vencimiento (Fin)
                      </label>
                      <Input
                        type="date"
                        value={selectedStudent.planEndDate || "2026-08-31"}
                        onChange={(e) => {
                          const newEndDate = e.target.value;
                          if (!newEndDate) return;
                          const [y, m] = newEndDate.split("-");
                          updateStudentDetails(selectedStudent.id, {
                            planEndDate: newEndDate,
                            planEndMonth: `${y}-${m}`,
                          });
                          toast.success(`Fecha de fin actualizada al ${newEndDate}`);
                        }}
                        className="text-xs h-8 bg-background"
                      />
                    </div>
                  </div>

                  {/* Resumen Informativo de Cobertura Exacta */}
                  <div className="pt-2 border-t border-primary/20 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-muted-foreground font-medium">
                      Período activo:{" "}
                      <strong className="text-foreground font-bold">
                        {selectedStudent.planStartDate || "03/08/2026"} al {selectedStudent.planEndDate || "31/08/2026"}
                      </strong>
                    </span>
                    <span className="text-primary font-bold">
                      {selectedStudent.planType === "Anual"
                        ? "12 meses contratados (20% Dcto.)"
                        : selectedStudent.planType === "Trimestral"
                        ? "3 meses contratados (12% Dcto.)"
                        : "1 mes contratado (Renovable)"}
                    </span>
                  </div>
                </div>

                {/* Contacto, Cumpleaños y Contacto de Emergencia EDITABLES */}
                <div className="space-y-4 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <p className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      Ficha de Contacto & Cumpleaños (Editable)
                    </p>
                    <span className="text-[10px] text-muted-foreground">Guardado automático</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3 text-primary" /> Correo Electrónico
                      </label>
                      <Input
                        type="email"
                        value={selectedStudent.email}
                        onChange={(e) => updateStudentDetails(selectedStudent.id, { email: e.target.value })}
                        placeholder="correo@ejemplo.com"
                        className="text-xs h-8 bg-background"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3 text-primary" /> Teléfono / WhatsApp
                      </label>
                      <Input
                        type="text"
                        value={selectedStudent.phone}
                        onChange={(e) => updateStudentDetails(selectedStudent.id, { phone: e.target.value })}
                        placeholder="Ej: +51 987 654 321"
                        className="text-xs h-8 bg-background"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-warning flex items-center gap-1">
                        <Cake className="h-3 w-3 text-warning" /> Fecha de Cumpleaños
                      </label>
                      <Input
                        type="text"
                        value={selectedStudent.birthdate}
                        onChange={(e) => updateStudentDetails(selectedStudent.id, { birthdate: e.target.value })}
                        placeholder="Ej: 15 de Agosto / 15/08/2014"
                        className="text-xs h-8 bg-background"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3 text-primary" /> Nombre de la Familia
                      </label>
                      <Input
                        type="text"
                        value={selectedStudent.family}
                        onChange={(e) => updateStudentDetails(selectedStudent.id, { family: e.target.value })}
                        placeholder="Ej: Familia Chipana"
                        className="text-xs h-8 bg-background"
                      />
                    </div>
                  </div>

                  {/* Sección de Emergencia */}
                  <div className="pt-2 border-t border-border/70 space-y-2">
                    <p className="font-bold text-[11px] text-destructive flex items-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5" /> Contacto de Emergencia
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-0.5">Nombre</label>
                        <Input
                          type="text"
                          value={selectedStudent.emergencyContact.name}
                          onChange={(e) =>
                            updateStudentDetails(selectedStudent.id, {
                              emergencyContact: { ...selectedStudent.emergencyContact, name: e.target.value },
                            })
                          }
                          placeholder="Nombre apoderado"
                          className="text-xs h-8 bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-0.5">Parentesco</label>
                        <Input
                          type="text"
                          value={selectedStudent.emergencyContact.relation}
                          onChange={(e) =>
                            updateStudentDetails(selectedStudent.id, {
                              emergencyContact: { ...selectedStudent.emergencyContact, relation: e.target.value },
                            })
                          }
                          placeholder="Ej: Mamá / Papá"
                          className="text-xs h-8 bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-0.5">Teléfono Emergencia</label>
                        <Input
                          type="text"
                          value={selectedStudent.emergencyContact.phone}
                          onChange={(e) =>
                            updateStudentDetails(selectedStudent.id, {
                              emergencyContact: { ...selectedStudent.emergencyContact, phone: e.target.value },
                            })
                          }
                          placeholder="Número emergencia"
                          className="text-xs h-8 bg-background"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Historial de Reingresos y Seguimiento Especial */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <RotateCcw className="h-4 w-4 text-amber-600" />
                      Historial de Reingresos y Seguimiento
                    </span>
                    {(selectedStudent.isReentry || (selectedStudent.reentryHistory && selectedStudent.reentryHistory.length > 0)) && (
                      <Badge className="bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/40 text-[10px] font-black">
                        Alumno Reingresante
                      </Badge>
                    )}
                  </div>

                  {/* Listado de Reingresos Previos */}
                  {selectedStudent.reentryHistory && selectedStudent.reentryHistory.length > 0 ? (
                    <div className="space-y-2">
                      {selectedStudent.reentryHistory.map((re, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border border-border bg-background text-xs space-y-1 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground flex items-center gap-1">
                              📅 {re.date}
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              Reingreso #{selectedStudent.reentryHistory!.length - idx}
                            </span>
                          </div>
                          <p className="text-[11.5px] text-foreground font-medium">
                            <strong>Motivo:</strong> {re.reason}
                          </p>
                          {re.notes && (
                            <p className="text-[10.5px] text-muted-foreground italic">
                              <strong>Seguimiento:</strong> {re.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Este alumno no cuenta con bajas previas registradas.
                    </p>
                  )}

                  {/* Botón o Formulario de Registro de Reingreso */}
                  {!isReentryFormOpen ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReentryDate(new Date().toISOString().split("T")[0]);
                        setReentryReason("");
                        setReentryNotes("");
                        setIsReentryFormOpen(true);
                      }}
                      className="w-full text-xs font-bold border-amber-500/40 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> + Registrar Nuevo Reingreso a Clases
                    </Button>
                  ) : (
                    <div className="p-3 rounded-xl border border-amber-500/30 bg-background space-y-2.5 text-xs animate-in fade-in">
                      <p className="font-bold text-foreground flex items-center gap-1">
                        📝 Registrar Retorno de {selectedStudent.name}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground font-semibold block mb-0.5">
                            Fecha de Reingreso
                          </label>
                          <Input
                            type="date"
                            value={reentryDate}
                            onChange={(e) => setReentryDate(e.target.value)}
                            className="text-xs h-7 bg-muted/40"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground font-semibold block mb-0.5">
                            Motivo de Retorno
                          </label>
                          <Input
                            type="text"
                            placeholder="Ej: Fin de vacaciones / Reactivación"
                            value={reentryReason}
                            onChange={(e) => setReentryReason(e.target.value)}
                            className="text-xs h-7 bg-muted/40"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-muted-foreground font-semibold block mb-0.5">
                          Notas de Seguimiento para Secretaría y Profesor
                        </label>
                        <textarea
                          placeholder="Ej: Dar bienvenida especial en recepción, reforzar postura en piano..."
                          value={reentryNotes}
                          onChange={(e) => setReentryNotes(e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-input bg-muted/40 p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsReentryFormOpen(false)}
                          className="h-7 text-xs"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            if (!reentryReason.trim()) {
                              toast.error("Por favor ingresa el motivo del reingreso.");
                              return;
                            }
                            addStudentReentryRecord(selectedStudent.id, {
                              date: reentryDate,
                              reason: reentryReason.trim(),
                              notes: reentryNotes.trim(),
                            });
                            setIsReentryFormOpen(false);
                            toast.success(`🚀 Reingreso registrado para ${selectedStudent.name}`, {
                              description: "El alumno ha sido reactivado como Activo con seguimiento especial.",
                            });
                          }}
                          className="h-7 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar y Activar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Estado y Profesor */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Estado del alumno</label>
                    <Select
                      value={selectedStudent.status}
                      onValueChange={(v) => {
                        setStudentStatus(selectedStudent.id, v as StudentStatus);
                        toast.success(`Estado actualizado a ${v}`);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="pausa">En pausa</SelectItem>
                        <SelectItem value="baja">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Profesor Asignado</label>
                    <Select
                      value={selectedStudent.teacher || "Prof. por Asignar"}
                      onValueChange={(v) => {
                        assignTeacher(selectedStudent.id, v);
                        toast.success(`Profesor asignado: ${v}`);
                      }}
                    >
                      <SelectTrigger>
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
                </div>

                {/* 3. BENEFICIOS INCLUIDOS (Dossier Oficial de la Comunidad Vibra) */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Beneficios y Servicios Incluidos (Dossier Oficial)
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                      <span className="text-success font-black">✓</span>
                      <div>
                        <p className="font-bold">Frecuencia Semanal</p>
                        <p className="text-[10px] text-muted-foreground">2 Clases Semanales (45 min c/u)</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                      <span className="text-success font-black">✓</span>
                      <div>
                        <p className="font-bold">Recuperación de Clases</p>
                        <p className="text-[10px] text-muted-foreground">{selectedStudent.makeupCredits} créditos disponibles</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                      <span className="text-success font-black">✓</span>
                      <div>
                        <p className="font-bold">Concursos y Desafíos</p>
                        <p className="text-[10px] text-muted-foreground">Eventos periódicos de la sede</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                      <span className="text-success font-black">✓</span>
                      <div>
                        <p className="font-bold">Talleres para Padres</p>
                        <p className="text-[10px] text-muted-foreground">Integración y acompañamiento</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                      <span className="text-success font-black">✓</span>
                      <div>
                        <p className="font-bold">Sesión de Fotos Oficial</p>
                        <p className="text-[10px] text-muted-foreground">Material fotográfico profesional</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                      <span className="text-success font-black">✓</span>
                      <div>
                        <p className="font-bold">Videos Demostrativos</p>
                        <p className="text-[10px] text-muted-foreground">Seguimiento de progreso</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                      <span className="text-success font-black">✓</span>
                      <div>
                        <p className="font-bold">Niveles Graduales ({selectedStudent.level})</p>
                        <p className="text-[10px] text-muted-foreground">Estructura formativa progresiva</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                      <span className="text-success font-black">✓</span>
                      <div>
                        <p className="font-bold">Recitales y Conciertos</p>
                        <p className="text-[10px] text-muted-foreground">Presentaciones en vivo Comunidad Vibra</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Historial y Marcado de Asistencia en Vivo */}
                <div className="space-y-3 rounded-xl border border-border p-4 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <CalendarCheck className="h-4 w-4 text-primary" />
                      Control de Asistencia ({selectedStudent.attendanceRate}%)
                    </span>
                    <span className="text-[10px] text-muted-foreground">Últimas sesiones</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.recentAttendance.map((att, idx) => (
                      <Badge
                        key={idx}
                        className={`capitalize border-0 text-xs px-2.5 py-0.5 ${
                          att === "presente"
                            ? "bg-success/20 text-success font-bold"
                            : att === "tarde"
                              ? "bg-warning/25 text-warning-foreground font-bold"
                              : "bg-destructive/20 text-destructive font-bold"
                        }`}
                      >
                        {att === "presente" ? "✓ Presente" : att === "tarde" ? "⏰ Tarde" : "✗ Ausente"}
                      </Badge>
                    ))}
                  </div>

                  {/* Acciones de marcado rápido de asistencia por Secretaría */}
                  <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground">Marcar hoy:</span>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const updated = ["presente", ...selectedStudent.recentAttendance.slice(0, 4)] as ("presente" | "ausente" | "tarde")[];
                          const rate = Math.round((updated.filter((a) => a === "presente").length / updated.length) * 100);
                          updateStudentDetails(selectedStudent.id, {
                            recentAttendance: updated,
                            attendanceRate: rate,
                          });
                          toast.success(`Asistencia marcada: Presente (${selectedStudent.name})`);
                        }}
                        className="h-7 text-xs font-bold border-success/40 text-success hover:bg-success/10"
                      >
                        ✓ Presente
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const updated = ["tarde", ...selectedStudent.recentAttendance.slice(0, 4)] as ("presente" | "ausente" | "tarde")[];
                          const rate = Math.round((updated.filter((a) => a === "presente").length / updated.length) * 100);
                          updateStudentDetails(selectedStudent.id, {
                            recentAttendance: updated,
                            attendanceRate: rate,
                          });
                          toast.warning(`Asistencia marcada: Tarde (${selectedStudent.name})`);
                        }}
                        className="h-7 text-xs font-bold border-warning/40 text-warning hover:bg-warning/10"
                      >
                        ⏰ Tarde
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const updated = ["ausente", ...selectedStudent.recentAttendance.slice(0, 4)] as ("presente" | "ausente" | "tarde")[];
                          const rate = Math.round((updated.filter((a) => a === "presente").length / updated.length) * 100);
                          updateStudentDetails(selectedStudent.id, {
                            recentAttendance: updated,
                            attendanceRate: rate,
                          });
                          toast.error(`Asistencia marcada: Falta (${selectedStudent.name})`);
                        }}
                        className="h-7 text-xs font-bold border-destructive/40 text-destructive hover:bg-destructive/10"
                      >
                        ✗ Falta
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Reportes de Avance del Profesor */}
                <div className="rounded-xl border border-border p-4 space-y-2 bg-card">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Reportes de Avance del Profesor
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Observaciones registradas para el seguimiento del alumno:
                  </p>
                  <div className="rounded-lg bg-muted/40 p-3 text-xs italic text-foreground">
                    "{selectedStudent.teacherNote}"
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal Dialog de Importación de Alumnos CSV/Excel para Nayeli */}
      <Dialog open={isCsvModalOpen} onOpenChange={setIsCsvModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <FileSpreadsheet className="h-5 w-5 text-success" />
              Importar Alumnos desde CSV / Excel
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Sube el padrón de alumnos de Nayeli en formato .CSV para poblar o actualizar el directorio en segundos.
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
                  Nombre, Familia, Instrumento, Profesor, Modalidad, Email, Telefono, ContactoEmergencia, TelefonoEmergencia
                </code>
                <br />
                (Ej: <code className="text-xs">Mateo Rivas, Familia Rivas, Guitarra, Prof. Jeremy, Regular, fam.rivas@gmail.com, +51 984 123 456, Carlos Rivas, +51 984 123 400</code>)
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
                O pegar directamente las filas de Excel / CSV:
              </label>
              <textarea
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  parseStudentsCsv(e.target.value);
                }}
                placeholder="Nombre,Familia,Instrumento,Profesor,Modalidad,Email,Telefono,ContactoEmergencia,TelefonoEmergencia&#10;Mateo Rivas,Familia Rivas,Guitarra,Prof. Jeremy,Regular,fam.rivas@gmail.com,+51 984 123 456,Carlos Rivas,+51 984 123 400"
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

            {/* Previsualización de alumnos parseados */}
            {csvPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" /> Vista Previa: {csvPreview.length} Alumnos Listos
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">
                    Padrón estructurado
                  </span>
                </div>

                <div className="max-h-40 overflow-y-auto rounded-xl border border-border divide-y divide-border text-xs bg-muted/20">
                  {csvPreview.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-foreground">{item.name}</span>
                        <span className="text-[11px] text-muted-foreground ml-2">
                          ({item.family} · {item.instrument})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {item.teacher}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {item.modality.startsWith("Inten") ? "Intensivo" : "Regular"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción final */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border mt-2">
            {/* Solo la Dueña (super_admin) puede vaciar el directorio */}
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
                <Trash2 className="h-3.5 w-3.5" /> Vaciar Directorio (Solo Dueña)
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
                Añadir al Directorio (+{csvPreview.length})
              </Button>
              <Button
                size="sm"
                disabled={csvPreview.length === 0}
                onClick={() => handleApplyCsv("replace")}
                className="text-xs font-bold bg-success hover:bg-success/90 text-success-foreground"
              >
                🚀 Reemplazar Directorio ({csvPreview.length})
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
              Confirmación Crítica: Vaciar Directorio de Alumnos
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Esta acción es irreversible y eliminará todos los alumnos y fichas registradas en Vibra Music. Para proceder, debes completar los 2 filtros de seguridad de Dirección.
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
                clearStudents();
                toast.success("🗑️ Directorio de alumnos vaciado con éxito por la Dueña.");
                setIsClearSecureOpen(false);
                setIsCsvModalOpen(false);
              }}
              className="text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ⚠️ Confirmar y Vaciar Alumnos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Organizar / Programar Horario del Alumno */}
      <Dialog open={!!scheduleModalStudent} onOpenChange={(o) => !o && setScheduleModalStudent(null)}>
        <DialogContent className="sm:max-w-lg p-6 rounded-3xl border-primary/30 bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              Organizar Horario según Plan Oficial
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configura el horario de <strong>{scheduleModalStudent?.name}</strong> según su modalidad. Se agendarán automáticamente todas las sesiones en el calendario interactivo.
            </DialogDescription>
          </DialogHeader>

          {scheduleModalStudent && (
            <ScheduleStudentForm
              student={scheduleModalStudent}
              availableTeachers={availableTeachers}
              onClose={() => setScheduleModalStudent(null)}
              onSaved={() => setScheduleModalStudent(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para Registrar Alerta / Incidencia de Alumno */}
      <Dialog open={!!alertModalStudent} onOpenChange={(o) => !o && setAlertModalStudent(null)}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl border-warning/30 bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Nueva Alerta / Incidencia
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Registra una novedad o aviso sobre <strong>{alertModalStudent?.name}</strong> para que aparezca en el Dashboard de Alertas.
            </DialogDescription>
          </DialogHeader>

          {alertModalStudent && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!alertMessage.trim()) {
                  toast.error("Por favor ingresa el detalle de la alerta.");
                  return;
                }

                addStudentAlert({
                  studentId: alertModalStudent.id,
                  studentName: alertModalStudent.name,
                  type: alertType,
                  severity: alertSeverity,
                  message: alertMessage.trim(),
                });

                toast.success(`Alerta de ${alertModalStudent.name} registrada`, {
                  description: "Aparecerá en el panel de Alertas del Dashboard para seguimiento del equipo.",
                });

                setAlertModalStudent(null);
                setAlertMessage("");
              }}
              className="space-y-4 py-2 text-xs"
            >
              <div className="rounded-xl border border-warning/20 bg-warning/5 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{alertModalStudent.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {alertModalStudent.instrument} · {alertModalStudent.teacher}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Apoderado: {alertModalStudent.emergencyContact.name} ({alertModalStudent.phone})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Tipo de Aviso</label>
                  <Select value={alertType} onValueChange={(v: any) => setAlertType(v)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salud">🩺 Salud / Accidente / Lesión</SelectItem>
                      <SelectItem value="comportamiento">⚠️ Comportamiento / Disciplina</SelectItem>
                      <SelectItem value="logro">🌟 Logro / Felicitación Especial</SelectItem>
                      <SelectItem value="coordinacion">📞 Coordinación Familiar</SelectItem>
                      <SelectItem value="otro">📝 Otra Novedad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Nivel de Prioridad</label>
                  <Select value={alertSeverity} onValueChange={(v: any) => setAlertSeverity(v)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">🔴 Alta / Urgente</SelectItem>
                      <SelectItem value="media">🟡 Media (Atención hoy)</SelectItem>
                      <SelectItem value="baja">🔵 Informativa</SelectItem>
                      <SelectItem value="positiva">🟢 Positiva (Felicitar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Detalle del mensaje / novedad</label>
                <textarea
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  placeholder="Ej: El alumno se lastimó el dedo jugando fútbol y requiere ejercicios suaves de mano izquierda, o aviso de viaje..."
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-warning/40 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAlertModalStudent(null)}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs font-bold bg-warning text-warning-foreground hover:bg-warning/90"
                >
                  Publicar en Alertas
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Solicitud de Eliminación a Dirección (Exclusivo Secretaría Nayeli) */}
      <Dialog open={!!deleteReqStudent} onOpenChange={(o) => !o && setDeleteReqStudent(null)}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl border-destructive/30 bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Solicitar Baja / Eliminación a Dirección
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Como personal de Secretaría, la eliminación de un alumno requiere la aprobación de la Dueña. Por favor detalla el motivo para enviar la solicitud.
            </DialogDescription>
          </DialogHeader>

          {deleteReqStudent && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!deleteReqReason.trim()) {
                  toast.error("Por favor ingresa el motivo de la eliminación.");
                  return;
                }

                createDeletionRequest({
                  entityType: "student",
                  entityId: deleteReqStudent.id,
                  entityName: deleteReqStudent.name,
                  details: `${deleteReqStudent.family} · ${deleteReqStudent.instrument} (${deleteReqStudent.teacher || "Sin profesor"})`,
                  reason: deleteReqReason.trim(),
                });

                toast.success(`Solicitud de baja para ${deleteReqStudent.name} enviada`, {
                  description: "La Dueña revisará y autorizará la eliminación desde su Dashboard.",
                });

                setDeleteReqStudent(null);
                setDeleteReqReason("");
              }}
              className="space-y-4 py-2 text-xs"
            >
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-foreground">{deleteReqStudent.name}</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-destructive border-destructive/30">
                    {deleteReqStudent.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Familia: <strong>{deleteReqStudent.family}</strong> · Instrumento: <strong>{deleteReqStudent.instrument}</strong>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Apoderado: {deleteReqStudent.emergencyContact.name} ({deleteReqStudent.phone})
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Motivo justificado de la eliminación / baja</label>
                <textarea
                  value={deleteReqReason}
                  onChange={(e) => setDeleteReqReason(e.target.value)}
                  placeholder="Ej: Apoderado solicitó retiro definitivo por viaje / Alumno registrado por error / Cambio de sede..."
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
                  onClick={() => setDeleteReqStudent(null)}
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
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  alert,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint: string;
  tone?: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className={`h-4 w-4 ${alert ? "text-destructive" : tone ?? "text-primary"}`} />
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
    </div>
  );
}

function NewStudentDialog() {
  const addNewStudent = useAppStore((s) => s.addNewStudent);
  const students = useAppStore((s) => s.adminStudents);
  const schedule = useAppStore((s) => s.schedule);

  // Obtener todos los profesores reales (de invitaciones creadas, horario y alumnos)
  const availableTeachers = useMemo(() => {
    let fromInvites: string[] = [];
    try {
      const raw = localStorage.getItem("cadencia-invitations");
      if (raw) {
        const parsed = JSON.parse(raw);
        fromInvites = parsed
          .filter((inv: { target_role: string; target_name?: string }) => inv.target_role === "teacher" && inv.target_name)
          .map((inv: { target_name: string }) => inv.target_name.trim());
      }
    } catch {
      // ignore
    }

    const fromStudents = students.map((s) => s.teacher).filter(Boolean);
    const fromSchedule = schedule.map((l) => l.teacher).filter(Boolean);
    const all = Array.from(new Set([...fromInvites, ...fromStudents, ...fromSchedule, "Prof. por Asignar"])).filter(Boolean);
    return all.sort();
  }, [students, schedule]);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [family, setFamily] = useState("");
  const [instrument, setInstrument] = useState("Piano");
  const [teacher, setTeacher] = useState(availableTeachers[0] ?? "Prof. por Asignar");
  const [modality, setModality] = useState<LessonModality>("Regular (8 clases / 45 min)");
  const [age, setAge] = useState<number>(8);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState("15/05/2015");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [planType, setPlanType] = useState<"Mensual" | "Trimestral" | "Anual">("Mensual");
  const [matriculaType, setMatriculaType] = useState<"Promo Demo (S/ 30)" | "Regular (S/ 120)" | "Exonerada">("Promo Demo (S/ 30)");
  const [packUtilesPaid, setPackUtilesPaid] = useState<boolean>(true);
  const [planStartDate, setPlanStartDate] = useState<string>("2026-08-03");

  // Mantener profesor seleccionado sincronizado si cambia la lista
  useEffect(() => {
    if (!teacher || teacher === "Prof. por Asignar") {
      if (availableTeachers.length > 0 && availableTeachers[0] !== "Prof. por Asignar") {
        setTeacher(availableTeachers[0]);
      }
    }
  }, [availableTeachers, teacher]);

  // Cálculo automático de categoría por rango de edad
  const autoCategory: AgeCategory = isPersonalized
    ? "PERSONALIZADA"
    : age >= 5 && age <= 6
    ? "INFANTIL"
    : age >= 7 && age <= 12
    ? "JUNIOR"
    : age >= 13 && age <= 17
    ? "JUVENIL"
    : "ADULTO";

  const catStyle = categoryStyles[autoCategory] ?? {
    bg: "bg-[#FFF2B2]",
    text: "text-[#8A6D00]",
    border: "border-[#FFE57F]",
    label: "CATEGORÍA JUNIOR (7 a 12)",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !family.trim()) {
      toast.error("Ingresa el nombre del alumno y apoderado.");
      return;
    }

    // Calcular fecha de fin según el plan contratado
    const durationMonths = planType === "Trimestral" ? 3 : planType === "Anual" ? 12 : 1;
    const [y, m, d] = (planStartDate || "2026-08-03").split("-").map((v) => parseInt(v, 10));
    const endD = new Date(y!, (m! - 1) + durationMonths, d!);
    endD.setDate(endD.getDate() - 1);
    const endY = endD.getFullYear();
    const endM = String(endD.getMonth() + 1).padStart(2, "0");
    const endDay = String(endD.getDate()).padStart(2, "0");
    const calculatedEndDate = `${endY}-${endM}-${endDay}`;
    const startMonthStr = `${y}-${String(m).padStart(2, "0")}`;
    const endMonthStr = `${endY}-${endM}`;
    const prices = {
      Mensual: VIBRA_PRICING.Mensual.priceMonthly,
      Trimestral: VIBRA_PRICING.Trimestral.priceMonthly,
      Anual: VIBRA_PRICING.Anual.priceMonthly,
    };

    addNewStudent({
      name,
      family: `Familia ${family}`,
      instrument,
      level: "Principiante",
      teacher,
      modality,
      ageCategory: autoCategory,
      age,
      status: "activo",
      payment: "al-dia",
      email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      phone: phone || "987 654 321",
      birthdate,
      planType,
      planPrice: prices[planType],
      matriculaType,
      packUtilesPaid,
      planStartDate: planStartDate || "2026-08-03",
      planEndDate: calculatedEndDate,
      planStartMonth: startMonthStr,
      planEndMonth: endMonthStr,
      emergencyContact: {
        name: emergencyName || family,
        phone: emergencyPhone || phone || "987 654 321",
        relation: "Apoderado",
      },
    });

    toast.success(`Alumno ${name} matriculado en plan ${planType} (${autoCategory}).`, {
      description: `Período activo: ${planStartDate || "03/08/2026"} al ${calculatedEndDate}.`,
    });
    setOpen(false);
    setName("");
    setFamily("");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} className="ml-auto font-bold gap-2">
        <PlusCircle className="h-4 w-4" /> Registrar Nuevo Alumno
      </Button>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Matricular Nuevo Alumno</SheetTitle>
          <SheetDescription>
            Ingresa los datos y selecciona su plan oficial del Dossier para vincularlo a su ficha y horario.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Nombre Completo del Alumno</label>
            <Input
              placeholder="Ej. Mateo García"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Apellidos de la Familia / Apoderado</label>
            <Input
              placeholder="Ej. García Rivas"
              value={family}
              onChange={(e) => setFamily(e.target.value)}
              required
            />
          </div>

          {/* Plan de Inversión del Dossier */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" /> Plan Oficial del Dossier
              </span>
              <span className="text-[11px] font-bold text-primary">
                {planType === "Anual"
                  ? `S/ ${VIBRA_PRICING.Anual.priceMonthly.toFixed(2)}/m`
                  : planType === "Trimestral"
                  ? `S/ ${VIBRA_PRICING.Trimestral.priceMonthly.toFixed(2)}/m`
                  : `S/ ${VIBRA_PRICING.Mensual.priceMonthly.toFixed(2)}/m`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Plan Contratado</label>
                <select
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value as any)}
                  className="w-full h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium"
                >
                  <option value="Mensual">Mensual — S/ {VIBRA_PRICING.Mensual.priceMonthly.toFixed(2)}</option>
                  <option value="Trimestral">Trimestral — S/ {VIBRA_PRICING.Trimestral.priceMonthly.toFixed(2)} (12% Dcto.)</option>
                  <option value="Anual">Anual — S/ {VIBRA_PRICING.Anual.priceMonthly.toFixed(2)} (20% Dcto.)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Matrícula</label>
                <select
                  value={matriculaType}
                  onChange={(e) => setMatriculaType(e.target.value as any)}
                  className="w-full h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium"
                >
                  <option value="Promo Demo (S/ 30)">Promo Demo — S/ 30</option>
                  <option value="Regular (S/ 120)">Regular — S/ 120</option>
                  <option value="Exonerada">Exonerada — S/ 0</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[10px] text-primary font-bold mb-1">🗓️ Fecha de Inicio de Clases</label>
                <Input
                  type="date"
                  value={planStartDate}
                  onChange={(e) => setPlanStartDate(e.target.value)}
                  className="h-8 text-xs bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Pack Útiles Anual (S/ 67)</label>
                <button
                  type="button"
                  onClick={() => setPackUtilesPaid(!packUtilesPaid)}
                  className={`w-full h-8 px-2 rounded-lg border text-xs font-bold flex items-center justify-between ${
                    packUtilesPaid
                      ? "bg-success/15 border-success/30 text-success"
                      : "bg-destructive/10 border-destructive/30 text-destructive"
                  }`}
                >
                  <span>{packUtilesPaid ? "✓ Entregado (S/ 67)" : "⚠️ Pendiente"}</span>
                  <span className="text-[10px] underline">Cambiar</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Edad del Alumno</label>
              <Input
                type="number"
                min={3}
                max={99}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 7)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Categoría Auto-Asignada</label>
              <div className={`px-3 py-2 rounded-lg border text-xs text-center ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                {catStyle.label}
              </div>
            </div>
          </div>

          {/* Opción de Clase Personalizada */}
          <div className="flex items-center gap-2 rounded-xl border border-border p-3 bg-muted/30">
            <input
              type="checkbox"
              id="personalized-check"
              checked={isPersonalized}
              onChange={(e) => setIsPersonalized(e.target.checked)}
              className="h-4 w-4 rounded border-primary text-primary"
            />
            <label htmlFor="personalized-check" className="text-xs font-bold text-foreground cursor-pointer">
              🩵 Marcar como "Clase Personalizada" (Celeste)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Instrumento</label>
              <Select value={instrument} onValueChange={setInstrument}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Piano">Piano</SelectItem>
                  <SelectItem value="Guitarra clásica">Guitarra clásica</SelectItem>
                  <SelectItem value="Guitarra eléctrica">Guitarra eléctrica</SelectItem>
                  <SelectItem value="Violín">Violín</SelectItem>
                  <SelectItem value="Batería">Batería</SelectItem>
                  <SelectItem value="Canto">Canto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Profesor Asignado</label>
              <Select value={teacher} onValueChange={setTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un profesor" />
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
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Frecuencia y Modalidad</label>
            <Select value={modality} onValueChange={(v) => setModality(v as LessonModality)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Regular (8 clases / 45 min)">
                  Regular: 8 clases/mes (2x semana, 45 min)
                </SelectItem>
                <SelectItem value="Intensivo (4 clases / 90 min)">
                  Intensivo: 4 clases/mes (1x semana, 90 min)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Teléfono Apoderado</label>
              <Input
                placeholder="987654321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Fecha de Cumpleaños</label>
              <Input
                placeholder="DD/MM/AAAA"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full font-bold mt-4">
            Guardar Matrícula
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function ScheduleStudentForm({
  student,
  availableTeachers,
  onClose,
  onSaved,
}: {
  student: AdminStudent;
  availableTeachers: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const addLessonToSchedule = useAppStore((s) => s.addLessonToSchedule);
  const assignTeacher = useAppStore((s) => s.assignTeacher);

  const isRegular = student.modality.toLowerCase().includes("reg") || student.modality.includes("8");

  // Estado del formulario
  const [teacher, setTeacher] = useState(
    student.teacher && student.teacher !== "Prof. por Asignar" ? student.teacher : availableTeachers[0] || "",
  );
  const [instrument, setInstrument] = useState(student.instrument || "Piano");
  const [category, setCategory] = useState<AgeCategory>(student.ageCategory || "JUNIOR");

  // Sesión 1 (obligatoria para todos los planes)
  const [day1, setDay1] = useState<"Lun" | "Mar" | "Mié" | "Jue" | "Vie" | "Sáb">("Lun");
  const [time1, setTime1] = useState("16:00");
  const [room1, setRoom1] = useState("Sala A");

  // Sesión 2 (para modalidad Regular: 2 veces por semana)
  const [day2, setDay2] = useState<"Lun" | "Mar" | "Mié" | "Jue" | "Vie" | "Sáb">("Mié");
  const [time2, setTime2] = useState("16:00");
  const [room2, setRoom2] = useState("Sala A");

  const weekdayTimes = ["16:00", "16:45", "17:30", "18:15", "19:00", "19:45", "20:30", "21:15"];
  const saturdayTimes = [
    "09:00", "09:45", "10:30", "11:15", "12:00", "12:45", "13:30",
    "14:15", "15:00", "15:45", "16:30", "17:15", "18:00",
  ];

  const schedule = useAppStore((s) => s.schedule);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTeacher = teacher || student.teacher || availableTeachers[0] || "Prof. por Asignar";

    // Validar aforo máximo de 5 alumnos por clase / profesor
    const countSession1 = schedule.filter(
      (l) => l.day === day1 && l.time === time1 && l.teacher.toLowerCase().includes(finalTeacher.toLowerCase()) && l.status !== "cancelada"
    ).length;

    if (countSession1 >= 5) {
      toast.error(`Aforo completo en ${day1} ${time1} con Prof. ${finalTeacher} (5/5 alumnos)`, {
        description: "Por favor elige otra franja horaria o consulta el Explorador de Vacantes.",
      });
      return;
    }

    if (isRegular) {
      const countSession2 = schedule.filter(
        (l) => l.day === day2 && l.time === time2 && l.teacher.toLowerCase().includes(finalTeacher.toLowerCase()) && l.status !== "cancelada"
      ).length;

      if (countSession2 >= 5) {
        toast.error(`Aforo completo en ${day2} ${time2} con Prof. ${finalTeacher} (5/5 alumnos)`, {
          description: "Por favor elige otra franja horaria para la 2da clase semanal.",
        });
        return;
      }
    }

    // Extraer año y mes del alumno
    const startStr = student.planStartDate || student.planStartMonth || "2026-08";
    const [yStr, mStr] = startStr.split("-");
    const lessonYear = parseInt(yStr || "2026", 10);
    const lessonMonth = parseInt(mStr || "8", 10) - 1; // 0-indexed (7 para Agosto)

    // 1. Agendar Primera Sesión Semanal (1ra Clase)
    addLessonToSchedule({
      student: student.name,
      teacher: finalTeacher,
      instrument: instrument,
      day: day1,
      time: time1,
      room: room1,
      category: category,
      sessionNumber: 1,
      status: "programada",
      year: lessonYear,
      month: lessonMonth,
    });

    // 2. Si es plan Regular (2x semana), agendar Segunda Sesión Semanal (2da Clase)
    if (isRegular) {
      addLessonToSchedule({
        student: student.name,
        teacher: finalTeacher,
        instrument: instrument,
        day: day2,
        time: time2,
        room: room2,
        category: category,
        sessionNumber: 2,
        status: "programada",
        year: lessonYear,
        month: lessonMonth,
      });
    }

    // Actualizar profesor en la ficha si no tenía
    if (!student.teacher || student.teacher === "Prof. por Asignar") {
      assignTeacher(student.id, finalTeacher);
    }

    toast.success(`🗓️ Horario de ${student.name} programado con éxito`, {
      description: isRegular
        ? `Plan Regular (8 clases): ${day1} ${time1} (${room1}) y ${day2} ${time2} (${room2}) con Prof. ${finalTeacher}.`
        : `Plan Intensivo (4 clases): ${day1} ${time1} (${room1}) con Prof. ${finalTeacher}.`,
    });

    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
      {/* Resumen del Plan del Alumno */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-sm text-foreground">{student.name}</span>
            <p className="text-[11px] text-muted-foreground">{student.family} · {student.instrument}</p>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30 font-bold text-[11px]">
            {isRegular ? "Plan Regular (2x semana · 8 clases)" : "Plan Intensivo (1x semana · 4 clases)"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="font-bold text-foreground">Profesor Asignado</label>
          <Select value={teacher} onValueChange={setTeacher}>
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
          <Select value={instrument} onValueChange={setInstrument}>
            <SelectTrigger className="text-xs">
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
      </div>

      {/* Selector de Categoría Oficial / Rango de Edad */}
      <div className="space-y-1.5 p-3 rounded-2xl border border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <label className="font-bold text-foreground">Categoría y Rango de Edad Oficial</label>
          <span className="text-[10px] text-muted-foreground">Edad registrada: <strong>{student.age} años</strong></span>
        </div>
        <Select value={category} onValueChange={(v) => setCategory(v as AgeCategory)}>
          <SelectTrigger className="text-xs bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="JUNIOR">🟡 Junior (7 a 12 años) — #FBC02D</SelectItem>
            <SelectItem value="JUVENIL">🟢 Juvenil (13 a 17 años) — #4CAF50</SelectItem>
            <SelectItem value="ADULTO">⚫ Adulto (18 a + años) — #757575</SelectItem>
            <SelectItem value="INFANTIL">🟣 Infantil (5 y 6 años) — #7C4DFF</SelectItem>
            <SelectItem value="PERSONALIZADA">🔵 Clase Personalizada (S/ 50)</SelectItem>
            <SelectItem value="RECUPERACION">🔴 Clase de Recuperación</SelectItem>
          </SelectContent>
        </Select>
        {category === "PERSONALIZADA" && (
          <p className="text-[10px] text-primary font-semibold mt-1">
            🩵 Clase Personalizada: Se identificará con el puntito {student.age >= 18 ? "⚫ Plomo (Adulto)" : student.age >= 13 ? "🟢 Verde (Juvenil)" : student.age >= 7 ? "🟡 Amarillo (Junior)" : "🟣 Morado (Infantil)"} en la agenda.
          </p>
        )}
      </div>

      {/* Bloque Sesión 1 */}
      <div className="rounded-2xl border border-border p-3.5 space-y-2.5 bg-muted/20">
        <span className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {isRegular ? "Primera Clase Semanal (Día 1)" : "Horario Semanal Oficial"}
        </span>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Día</label>
            <Select value={day1} onValueChange={(v: any) => setDay1(v)}>
              <SelectTrigger className="text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Hora</label>
            <Select value={time1} onValueChange={setTime1}>
              <SelectTrigger className="text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(day1 === "Sáb" ? saturdayTimes : weekdayTimes).map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Sala</label>
            <Select value={room1} onValueChange={setRoom1}>
              <SelectTrigger className="text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Sala A", "Sala B", "Sala C", "Sala D"].map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Bloque Sesión 2 (Solo si es Plan Regular) */}
      {isRegular && (
        <div className="rounded-2xl border border-border p-3.5 space-y-2.5 bg-muted/20">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Segunda Clase Semanal (Día 2)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Día</label>
              <Select value={day2} onValueChange={(v: any) => setDay2(v)}>
                <SelectTrigger className="text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Hora</label>
              <Select value={time2} onValueChange={setTime2}>
                <SelectTrigger className="text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(day2 === "Sáb" ? saturdayTimes : weekdayTimes).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Sala</label>
              <Select value={room2} onValueChange={setRoom2}>
                <SelectTrigger className="text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Sala A", "Sala B", "Sala C", "Sala D"].map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          className="text-xs"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size="sm"
          className="text-xs font-bold bg-primary text-primary-foreground"
        >
          Guardar Horario Completo ({isRegular ? "2 Clases Semanales" : "1 Clase Semanal"})
        </Button>
      </div>
    </form>
  );
}
