import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Sparkles,
  Calendar,
  Clock,
  UserCheck,
  UserPlus,
  Phone,
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  GraduationCap,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Music,
  Check,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useAppStore,
  type AgeCategory,
  type LessonModality,
} from "@/store/app-store";
import { musicalInstruments, teachers, rooms, VIBRA_PRICING } from "@/store/admin-seeds";
import {
  getLeadsFromDB,
  createLeadInDB,
  updateLeadStatusInDB,
  type DBDemoRequest,
  type LeadStatus,
} from "@/lib/services/leads.service";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/demos")({
  head: () => ({
    meta: [
      { title: "Clases Demo — Dirección General | VM STAFF" },
      {
        name: "description",
        content:
          "Gestión de prospectos para clases demo dictadas por la Directora Claudia (a partir de las 4pm) y conversión directa a alumnos activos.",
      },
      { property: "og:title", content: "Clases Demo — Dirección General | VM STAFF" },
    ],
  }),
  component: AdminDemosPage,
});

// Semilla inicial referencial de prospectos demo
const INITIAL_DEMOS: DBDemoRequest[] = [
  {
    id: "demo-001",
    student_name: "Luciana Morales (7 años)",
    parent_name: "Patricia Vega",
    parent_phone: "51987321654",
    instrument: "Piano",
    preferred_date: new Date().toISOString().split("T")[0],
    preferred_time: "16:00",
    status: "confirmada",
    notes: "Interesada en estimulación musical de piano. Primera experiencia.",
    handled_by: "Claudia (Directora)",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-002",
    student_name: "Thiago Ramos (10 años)",
    parent_name: "Gonzalo Ramos",
    parent_phone: "51912876543",
    instrument: "Violín",
    preferred_date: new Date().toISOString().split("T")[0],
    preferred_time: "17:30",
    status: "pendiente",
    notes: "Viene de campaña en Instagram. Consulta disponibilidad para horario tarde.",
    handled_by: "Claudia (Directora)",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-003",
    student_name: "Camila Salcedo (14 años)",
    parent_name: "Lorena Paredes",
    parent_phone: "51955112233",
    instrument: "Canto",
    preferred_date: new Date(Date.now() - 3600000 * 24 * 2).toISOString().split("T")[0],
    preferred_time: "16:45",
    status: "asistio",
    notes: "Asistió a la clase con Claudia. Excelente técnica vocal, lista para inscribirse en plan mensual.",
    handled_by: "Claudia (Directora)",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-004",
    student_name: "Joaquín Navarro (12 años)",
    parent_name: "Eduardo Navarro",
    parent_phone: "51944887766",
    instrument: "Guitarra",
    preferred_date: new Date(Date.now() - 3600000 * 24 * 3).toISOString().split("T")[0],
    preferred_time: "18:15",
    status: "matriculado",
    notes: "Matriculado con el Prof. Jeremy. Pagó cuota completa de septiembre.",
    handled_by: "Claudia (Directora)",
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Horarios demo disponibles dictados por Claudia (a partir de las 16:00)
const DEMO_TIME_SLOTS = [
  "16:00",
  "16:45",
  "17:30",
  "18:15",
  "19:00",
  "19:45",
];

// Profesores oficiales de planta para clases regulares
const OFFICIAL_TEACHERS = [
  { name: "Jeremy", specialties: "Piano, Batería, Guitarra" },
  { name: "Fernando", specialties: "Violín, Piano" },
  { name: "Nathaly", specialties: "Canto, Piano Infantil" },
];

export function AdminDemosPage() {
  const [mounted, setMounted] = useState(false);
  const activeRole = useAppStore((s) => s.activeRole);
  const addNewStudent = useAppStore((s) => s.addNewStudent);
  const addLessonToSchedule = useAppStore((s) => s.addLessonToSchedule);

  const [demos, setDemos] = useState<DBDemoRequest[]>(INITIAL_DEMOS);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [instrumentFilter, setInstrumentFilter] = useState<string>("todos");

  // Modal: Nueva Demo
  const [isNewDemoOpen, setIsNewDemoOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newParentName, setNewParentName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newInstrument, setNewInstrument] = useState("Piano");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newTime, setNewTime] = useState("16:00");
  const [newNotes, setNewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal: Matrícula Oficial en 1 Clic
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedDemoForEnroll, setSelectedDemoForEnroll] = useState<DBDemoRequest | null>(null);
  const [enrollTeacher, setEnrollTeacher] = useState("Jeremy");
  const [enrollInstrument, setEnrollInstrument] = useState("Piano");
  const [enrollCategory, setEnrollCategory] = useState<AgeCategory>("JUNIOR");
  const [enrollPlan, setEnrollPlan] = useState<"Mensual" | "Trimestral" | "Anual">("Mensual");
  const [enrollModality, setEnrollModality] = useState<LessonModality>("Regular (2 clases/semana)");
  const [enrollDay, setEnrollDay] = useState<"Lun" | "Mar" | "Mié" | "Jue" | "Vie" | "Sáb">("Lun");
  const [enrollTime, setEnrollTime] = useState("16:00");
  const [enrollRoom, setEnrollRoom] = useState("Sala A");
  const [enrollPrice, setEnrollPrice] = useState(297);

  // Cargar prospectos desde PostgreSQL
  useEffect(() => {
    setMounted(true);
    async function fetchLeads() {
      try {
        const dbRecords = await getLeadsFromDB(activeRole);
        if (dbRecords && dbRecords.length > 0) {
          setDemos(dbRecords);
        }
      } catch (err) {
        console.warn("Utilizando catálogo local referencial de clases demo:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, [activeRole]);

  // Actualizar estado de demo
  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await updateLeadStatusInDB(activeRole, leadId, newStatus);
    } catch {
      // Ignorar fallback en entorno de desarrollo
    }
    setDemos((prev) =>
      prev.map((d) => (d.id === leadId ? { ...d, status: newStatus, updated_at: new Date().toISOString() } : d))
    );
    toast.success(`Estado de clase demo actualizado a "${newStatus}".`);
  };

  // Guardar nueva clase demo
  const handleCreateDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newParentName.trim() || !newPhone.trim()) {
      toast.error("Por favor completa los nombres y el celular de contacto.");
      return;
    }

    setIsSubmitting(true);
    const cleanPhone = newPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`;

    const newLeadData: DBDemoRequest = {
      id: `demo-${Date.now()}`,
      student_name: newStudentName.trim(),
      parent_name: newParentName.trim(),
      parent_phone: formattedPhone,
      instrument: newInstrument,
      preferred_date: newDate,
      preferred_time: newTime,
      status: "pendiente",
      notes: newNotes.trim() || `Clase demo agendada con Directora Claudia a las ${newTime}`,
      handled_by: "Claudia (Directora)",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const created = await createLeadInDB(activeRole, {
        student_name: newLeadData.student_name,
        parent_name: newLeadData.parent_name,
        parent_phone: newLeadData.parent_phone,
        instrument: newLeadData.instrument,
        preferred_date: newLeadData.preferred_date,
        preferred_time: newLeadData.preferred_time,
        notes: newLeadData.notes,
        status: "pendiente",
      });
      if (created?.id) {
        newLeadData.id = created.id;
      }
    } catch {
      console.warn("Guardando demo en estado reactivo local.");
    }

    setDemos((prev) => [newLeadData, ...prev]);
    setIsSubmitting(false);
    setIsNewDemoOpen(false);

    // Limpiar campos
    setNewStudentName("");
    setNewParentName("");
    setNewPhone("");
    setNewNotes("");

    toast.success("✓ ¡Clase demo agendada con la Directora Claudia!", {
      description: `Programada para el ${newDate} a las ${newTime} h.`,
    });
  };

  // Abrir modal de conversión
  const handleOpenEnrollModal = (demo: DBDemoRequest) => {
    setSelectedDemoForEnroll(demo);
    setEnrollInstrument(demo.instrument || "Piano");
    // Elegir profesor recomendado según instrumento
    if (demo.instrument.toLowerCase().includes("violín")) {
      setEnrollTeacher("Fernando");
    } else if (demo.instrument.toLowerCase().includes("canto")) {
      setEnrollTeacher("Nathaly");
    } else {
      setEnrollTeacher("Jeremy");
    }
    setEnrollTime(demo.preferred_time || "16:00");
    setIsEnrollModalOpen(true);
  };

  // Confirmar inscripción oficial
  const handleConfirmEnroll = async () => {
    if (!selectedDemoForEnroll) return;

    // 1. Extraer nombre limpio (quitar edad si está entre paréntesis)
    const cleanStudentName = selectedDemoForEnroll.student_name.replace(/\(.*?\)/g, "").trim();

    // 2. Insertar alumno en el store oficial
    addNewStudent({
      name: cleanStudentName,
      family: selectedDemoForEnroll.parent_name.toLowerCase().startsWith("familia")
        ? selectedDemoForEnroll.parent_name
        : `Familia ${selectedDemoForEnroll.parent_name.split(" ").slice(-1)[0] || cleanStudentName}`,
      phone: selectedDemoForEnroll.parent_phone,
      instrument: enrollInstrument,
      teacher: enrollTeacher,
      modality: enrollModality,
      status: "activo",
      plan: enrollPlan,
      category: enrollCategory,
      price: enrollPrice,
      monthlyDueDate: 15,
      paymentStatus: "al_dia",
      emergencyContact: {
        name: selectedDemoForEnroll.parent_name,
        relationship: "Madre / Padre",
        phone: selectedDemoForEnroll.parent_phone,
      },
      notes: `Matriculado tras clase demo dictada por Directora Claudia (${selectedDemoForEnroll.preferred_date || ""}). Notas iniciales: ${selectedDemoForEnroll.notes || "Sin observaciones"}`,
    });

    // 3. Programar lección regular en el horario
    const pairedDays: Record<string, "Lun" | "Mar" | "Mié" | "Jue" | "Vie" | "Sáb"> = {
      Lun: "Mié",
      Mié: "Lun",
      Mar: "Jue",
      Jue: "Mar",
    };

    addLessonToSchedule({
      student: cleanStudentName,
      teacher: enrollTeacher,
      instrument: enrollInstrument,
      day: enrollDay,
      time: enrollTime,
      room: enrollRoom,
      category: enrollCategory,
    });

    if (enrollModality.includes("2 clases") && pairedDays[enrollDay]) {
      addLessonToSchedule({
        student: cleanStudentName,
        teacher: enrollTeacher,
        instrument: enrollInstrument,
        day: pairedDays[enrollDay],
        time: enrollTime,
        room: enrollRoom,
        category: enrollCategory,
      });
    }

    // 4. Actualizar demo_requests a "matriculado"
    await handleUpdateStatus(selectedDemoForEnroll.id, "matriculado");

    toast.success(`🎉 ¡${cleanStudentName} inscrito como Alumno Oficial Activo!`, {
      description: `Asignado con Prof. ${enrollTeacher} (${enrollDay} ${enrollTime}).`,
    });

    setIsEnrollModalOpen(false);
    setSelectedDemoForEnroll(null);
  };

  // Enlace directo de WhatsApp con mensaje personalizado
  const getWhatsAppLink = (demo: DBDemoRequest) => {
    const rawPhone = demo.parent_phone.replace(/\D/g, "");
    const cleanPhone = rawPhone.startsWith("51") ? rawPhone : `51${rawPhone}`;
    const cleanStudentName = demo.student_name.replace(/\(.*?\)/g, "").trim();

    const msg = encodeURIComponent(
      `¡Hola ${demo.parent_name}! Le saluda el equipo de Vibra Music 🎵.\n\nLe confirmamos con mucho gusto la Clase Demostrativa de ${demo.instrument} para ${cleanStudentName}, dictada personalmente por nuestra Directora Claudia en nuestra sede de Miraflores.\n\n📅 Fecha: ${demo.preferred_date || "Por coordinar"}\n⏰ Hora: ${demo.preferred_time || "16:00"} h\n📍 Dirección: Av. Paseo de la República 5895, Miraflores\n\n¿Nos confirma su asistencia? ¡Los esperamos con mucho entusiasmo!`
    );

    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  // Filtrado de Demos
  const filteredDemos = useMemo(() => {
    return demos.filter((d) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        d.student_name.toLowerCase().includes(q) ||
        d.parent_name.toLowerCase().includes(q) ||
        d.parent_phone.includes(q) ||
        d.instrument.toLowerCase().includes(q);

      const matchStatus = statusFilter === "todos" || d.status === statusFilter;
      const matchInstrument =
        instrumentFilter === "todos" ||
        d.instrument.toLowerCase() === instrumentFilter.toLowerCase();

      return matchSearch && matchStatus && matchInstrument;
    });
  }, [demos, search, statusFilter, instrumentFilter]);

  // KPIs
  const stats = useMemo(() => {
    const total = demos.length;
    const agendadas = demos.filter((d) => d.status === "pendiente" || d.status === "confirmada").length;
    const asistieron = demos.filter((d) => d.status === "asistio").length;
    const matriculados = demos.filter((d) => d.status === "matriculado").length;
    const conversionRate = total > 0 ? Math.round((matriculados / total) * 100) : 0;

    const todayStr = new Date().toISOString().split("T")[0];
    const demosHoy = demos.filter((d) => d.preferred_date === todayStr && d.status !== "cancelada").length;

    return { total, agendadas, asistieron, matriculados, conversionRate, demosHoy };
  }, [demos]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFB52E]/15 text-[#FFB52E]">
              Exclusivo Dirección General · Vibra Music
            </span>
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#F47B20]" />
              Dictadas por Directora Claudia a partir de las 16:00 h
            </span>
          </div>
          <h1 className="text-2xl font-black sm:text-3xl text-foreground mt-1 tracking-tight flex items-center gap-2.5">
            <Sparkles className="h-7 w-7 text-[#F47B20]" />
            Módulo de Clases Demo & Prospectos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestión de familias interesadas en clases demostrativas con Claudia y conversión oficial a alumnos regulares con 1 clic.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsNewDemoOpen(true)}
            className="gap-2 font-bold bg-[#F47B20] hover:bg-[#FF9E3D] text-[#15120F] rounded-xl shadow-xs"
          >
            <UserPlus className="h-4 w-4" />
            + Agendar Clase Demo
          </Button>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="border-border shadow-xs bg-card">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Demos de Hoy</span>
              <Calendar className="h-4 w-4 text-[#FFB52E]" />
            </div>
            <p className="text-2xl font-black text-foreground">{mounted ? stats.demosHoy : "—"}</p>
            <p className="text-[11px] text-muted-foreground">A partir de las 16:00 h</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-card">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Agendadas Activas</span>
              <Clock className="h-4 w-4 text-sky-500" />
            </div>
            <p className="text-2xl font-black text-foreground">{mounted ? stats.agendadas : "—"}</p>
            <p className="text-[11px] text-muted-foreground">Por confirmar o confirmadas</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-card">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Asistieron a Demo</span>
              <UserCheck className="h-4 w-4 text-violet-500" />
            </div>
            <p className="text-2xl font-black text-foreground">{mounted ? stats.asistieron : "—"}</p>
            <p className="text-[11px] text-muted-foreground">Listos para matricular</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-card">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Matriculados Oficiales</span>
              <GraduationCap className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-foreground">{mounted ? stats.matriculados : "—"}</p>
            <p className="text-[11px] text-muted-foreground">Alumnos regulares activos</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-card">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Conversión (%)</span>
              <Sparkles className="h-4 w-4 text-[#F47B20]" />
            </div>
            <p className="text-2xl font-black text-foreground">{mounted ? `${stats.conversionRate}%` : "—"}</p>
            <p className="text-[11px] text-muted-foreground">Tasa de éxito a matrícula</p>
          </CardContent>
        </Card>
      </div>

      {/* Banner Informativo de Roles */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Regla Operativa Institucional</h4>
            <p className="text-xs text-muted-foreground">
              La <strong>Directora Claudia</strong> dicta exclusivamente las clases demostrativas a partir de las 4:00 p.m. Al inscribir oficialmente a un alumno, debe asignarse a uno de nuestros profesores de planta regulares: <strong>Jeremy</strong>, <strong>Fernando</strong> o <strong>Nathaly</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Filtros y Buscador */}
      <Card className="border-border shadow-xs bg-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por alumno, apoderado o teléfono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background rounded-xl text-xs"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-background rounded-xl text-xs">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los Estados</SelectItem>
                <SelectItem value="pendiente">Por Confirmar (Pendientes)</SelectItem>
                <SelectItem value="confirmada">Confirmadas</SelectItem>
                <SelectItem value="asistio">Asistió a Demo (Listos)</SelectItem>
                <SelectItem value="matriculado">Matriculados Oficiales</SelectItem>
                <SelectItem value="cancelada">Canceladas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={instrumentFilter} onValueChange={setInstrumentFilter}>
              <SelectTrigger className="bg-background rounded-xl text-xs">
                <SelectValue placeholder="Filtrar por instrumento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los Instrumentos</SelectItem>
                {musicalInstruments.map((inst) => (
                  <SelectItem key={inst} value={inst}>
                    {inst}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Demos */}
      <Card className="border-border shadow-xs bg-card overflow-hidden">
        <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Prospectos de Clases Demo ({filteredDemos.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Listado ordenado de alumnos interesados con seguimiento directo por WhatsApp y opción de matrícula oficial.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Fecha & Hora</th>
                  <th className="py-3 px-4">Alumno & Apoderado</th>
                  <th className="py-3 px-4">Instrumento</th>
                  <th className="py-3 px-4">Docente Demo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Notas / Observaciones</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDemos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No se encontraron clases demo con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  filteredDemos.map((demo) => {
                    const isEnrolled = demo.status === "matriculado";

                    return (
                      <tr key={demo.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            {demo.preferred_date || "Por definir"}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {demo.preferred_time || "16:00"} h
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground">{demo.student_name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            Apoderado: {demo.parent_name}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            +{demo.parent_phone}
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge variant="outline" className="font-semibold bg-muted/50">
                            <Music className="h-3 w-3 mr-1 text-primary" />
                            {demo.instrument}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-foreground text-xs">
                            Claudia (Directora)
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {demo.status === "pendiente" && (
                            <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/30">
                              Por Confirmar
                            </Badge>
                          )}
                          {demo.status === "confirmada" && (
                            <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/30">
                              Confirmada
                            </Badge>
                          )}
                          {demo.status === "asistio" && (
                            <Badge className="bg-violet-500/10 text-violet-400 border border-violet-500/30">
                              Asistió a Demo
                            </Badge>
                          )}
                          {demo.status === "matriculado" && (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              ✓ Matriculado Oficial
                            </Badge>
                          )}
                          {demo.status === "cancelada" && (
                            <Badge variant="outline" className="text-muted-foreground">
                              Cancelada
                            </Badge>
                          )}
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {demo.notes || "Sin observaciones adicionales."}
                          </p>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                          {/* Botón WhatsApp */}
                          <a
                            href={getWhatsAppLink(demo)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-semibold transition-all border border-emerald-500/20"
                            title="Contactar apoderado por WhatsApp"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            WhatsApp
                          </a>

                          {/* Cambio rápido de estado */}
                          {demo.status === "pendiente" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(demo.id, "confirmada")}
                              className="h-7 text-xs rounded-xl"
                            >
                              Confirmar
                            </Button>
                          )}

                          {demo.status === "confirmada" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(demo.id, "asistio")}
                              className="h-7 text-xs rounded-xl text-violet-400 border-violet-500/30 hover:bg-violet-500/10"
                            >
                              Marcar Asistió
                            </Button>
                          )}

                          {/* Botón Estrella: Inscribir Oficialmente */}
                          {!isEnrolled && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenEnrollModal(demo)}
                              className="h-7 gap-1 font-bold bg-[#F47B20] hover:bg-[#FF9E3D] text-[#15120F] rounded-xl text-xs shadow-xs"
                            >
                              <Sparkles className="h-3 w-3" />
                              Inscribir Oficial
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL 1: Agendar Nueva Clase Demo */}
      <Dialog open={isNewDemoOpen} onOpenChange={setIsNewDemoOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black">
              <UserPlus className="h-5 w-5 text-[#F47B20]" />
              Agendar Nueva Clase Demo con Claudia
            </DialogTitle>
            <DialogDescription className="text-xs">
              Registra los datos del prospecto interesado. La clase será impartida exclusivamente por la Directora Claudia a partir de las 16:00 h.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDemo} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Nombre del Alumno *</label>
                <Input
                  required
                  placeholder="Ej. Santiago Flores (9 años)"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="rounded-xl text-xs bg-background"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Nombre del Apoderado *</label>
                <Input
                  required
                  placeholder="Ej. Valeria Flores (Mamá)"
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  className="rounded-xl text-xs bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Celular WhatsApp *</label>
                <Input
                  required
                  type="tel"
                  placeholder="Ej. 987654321"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="rounded-xl text-xs bg-background"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Instrumento de Interés</label>
                <Select value={newInstrument} onValueChange={setNewInstrument}>
                  <SelectTrigger className="rounded-xl text-xs bg-background">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Fecha de la Demo</label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="rounded-xl text-xs bg-background"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Hora (A partir de 16:00 h)</label>
                <Select value={newTime} onValueChange={setNewTime}>
                  <SelectTrigger className="rounded-xl text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_TIME_SLOTS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t} h · Directora Claudia
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Notas u Objetivos del Prospecto</label>
              <Textarea
                placeholder="Ej. Quiere aprender por diversión, le interesa piano clásico, viene recomendado..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={2}
                className="rounded-xl text-xs bg-background resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewDemoOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-1.5 font-bold bg-[#F47B20] hover:bg-[#FF9E3D] text-[#15120F] rounded-xl text-xs"
              >
                <Check className="h-4 w-4" />
                Agendar Clase Demo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Inscribir Oficialmente como Alumno Activo */}
      <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-foreground">
              <Sparkles className="h-5 w-5 text-[#F47B20]" />
              Inscribir Oficialmente a {selectedDemoForEnroll?.student_name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Asigna a uno de nuestros profesores regulares de planta (Jeremy, Fernando o Nathaly), define el plan y fija el horario semanal oficial.
            </DialogDescription>
          </DialogHeader>

          {selectedDemoForEnroll && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted-foreground">Apoderado: </span>
                  <span className="font-bold text-foreground">{selectedDemoForEnroll.parent_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Celular: </span>
                  <span className="font-bold text-foreground">+{selectedDemoForEnroll.parent_phone}</span>
                </div>
              </div>

              {/* Selección de Profesor Regular */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Profesor Oficial de Planta *
                </label>
                <Select value={enrollTeacher} onValueChange={setEnrollTeacher}>
                  <SelectTrigger className="rounded-xl text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OFFICIAL_TEACHERS.map((t) => (
                      <SelectItem key={t.name} value={t.name}>
                        Prof. {t.name} ({t.specialties})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  La Directora Claudia solo dicta la demo inicial; las clases regulares pertenecen al docente asignado.
                </p>
              </div>

              {/* Instrumento y Categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Instrumento</label>
                  <Select value={enrollInstrument} onValueChange={setEnrollInstrument}>
                    <SelectTrigger className="rounded-xl text-xs bg-background">
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

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Categoría de Edad</label>
                  <Select
                    value={enrollCategory}
                    onValueChange={(val) => setEnrollCategory(val as AgeCategory)}
                  >
                    <SelectTrigger className="rounded-xl text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KIDS">KIDS (4 a 6 años)</SelectItem>
                      <SelectItem value="JUNIOR">JUNIOR (7 a 12 años)</SelectItem>
                      <SelectItem value="TEEN">TEEN (13 a 17 años)</SelectItem>
                      <SelectItem value="ADULTO">ADULTO (18+ años)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Modalidad y Plan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Modalidad</label>
                  <Select
                    value={enrollModality}
                    onValueChange={(val) => setEnrollModality(val as LessonModality)}
                  >
                    <SelectTrigger className="rounded-xl text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular (2 clases/semana)">
                        Regular (2 clases/semana)
                      </SelectItem>
                      <SelectItem value="Intensivo (3 clases/semana)">
                        Intensivo (3 clases/semana)
                      </SelectItem>
                      <SelectItem value="Sabatino (1 clase/semana)">
                        Sabatino (1 clase/semana)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Plan y Mensualidad</label>
                  <Select
                    value={enrollPlan}
                    onValueChange={(val) => {
                      setEnrollPlan(val as any);
                      if (val === "Mensual") setEnrollPrice(297);
                      else if (val === "Trimestral") setEnrollPrice(790);
                      else setEnrollPrice(2800);
                    }}
                  >
                    <SelectTrigger className="rounded-xl text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mensual">Plan Mensual (S/ 297)</SelectItem>
                      <SelectItem value="Trimestral">Plan Trimestral (S/ 790)</SelectItem>
                      <SelectItem value="Anual">Plan Anual (S/ 2,800)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Horario Semanal */}
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Horario de Clase en Agenda Semanal
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-muted-foreground">Día Base</label>
                    <Select
                      value={enrollDay}
                      onValueChange={(val) => setEnrollDay(val as any)}
                    >
                      <SelectTrigger className="rounded-xl text-xs bg-background mt-0.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lun">Lunes (y Mié)</SelectItem>
                        <SelectItem value="Mar">Martes (y Jue)</SelectItem>
                        <SelectItem value="Mié">Miércoles (y Lun)</SelectItem>
                        <SelectItem value="Jue">Jueves (y Mar)</SelectItem>
                        <SelectItem value="Vie">Viernes</SelectItem>
                        <SelectItem value="Sáb">Sábado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground">Hora</label>
                    <Input
                      type="time"
                      value={enrollTime}
                      onChange={(e) => setEnrollTime(e.target.value)}
                      className="rounded-xl text-xs bg-background mt-0.5"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground">Sala</label>
                    <Select value={enrollRoom} onValueChange={setEnrollRoom}>
                      <SelectTrigger className="rounded-xl text-xs bg-background mt-0.5">
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
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmEnroll}
                  className="gap-1.5 font-bold bg-[#F47B20] hover:bg-[#FF9E3D] text-[#15120F] rounded-xl text-xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar Matrícula Oficial
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
