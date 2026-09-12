import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import {
  generatePayrollReport,
  exportPayrollToCSV,
  getAllActiveShifts,
  getTeacherTimeLogs,
  computeTeacherMonthlySummary,
  exportDetailedAttendanceCSV,
  clockOut,
  parseShiftLocation,
  SHIFT_SYNC_CHANNEL,
  type PayrollReportRow,
  type DBTeacherTimeLog,
  type TeacherMonthlySummary,
} from "@/lib/services/time-tracking.service";
import { formatDistance } from "@/lib/services/geolocation.service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Clock,
  Download,
  Calendar,
  UserCheck,
  CheckCircle2,
  Lock,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  Users,
  Timer,
  Filter,
  Check,
  Building2,
  CalendarDays,
  Music4,
  ExternalLink,
  MapPin,
  Navigation,
} from "lucide-react";

export const Route = createFileRoute("/admin/control-horario")({
  head: () => ({
    meta: [
      { title: "Control de Asistencia Docente y Horas — VM STAFF" },
      {
        name: "description",
        content:
          "Dashboard mensual de asistencia de profesores, monitoreo en vivo de la sede y reporte oficial de horas para nómina.",
      },
    ],
  }),
  component: AdminControlHorarioPage,
});

const MONTHS_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Setiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function AdminControlHorarioPage() {
  const activeRole = useAppStore((s) => s.activeRole);
  const currentUser = useAppStore((s) => s.currentUser);

  // Estados de carga y sincronización en vivo
  const [activeShifts, setActiveShifts] = useState<DBTeacherTimeLog[]>([]);
  const [allShifts, setAllShifts] = useState<DBTeacherTimeLog[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Filtros de navegación mensual
  const currentMonthIdx = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIdx >= 0 ? currentMonthIdx : 8); // 8 = Setiembre
  const [selectedYear, setSelectedYear] = useState<number>(currentYear || 2026);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("todos");
  const [activeTab, setActiveTab] = useState<"kardex" | "envivo" | "cierre">("kardex");

  // Estados de Cierre de Periodo
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-09-30");
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportData, setReportData] = useState<PayrollReportRow[] | null>(null);

  // Consulta combinada de datos de Insforge PostgreSQL
  const fetchAllData = async () => {
    try {
      setLoadingShifts(true);
      const [liveShifts, historyShifts] = await Promise.all([
        getAllActiveShifts(),
        getTeacherTimeLogs({ limit: 300 }),
      ]);
      setActiveShifts(liveShifts);
      setAllShifts(historyShifts);
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn("Aviso cargando asistencias de Insforge:", err);
    } finally {
      setLoadingShifts(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    // 1. Canal de sincronización en vivo entre pestañas
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel(SHIFT_SYNC_CHANNEL);
      bc.onmessage = () => {
        fetchAllData();
      };
    }

    // 2. Auto-polling en vivo cada 10 segundos para ver quién entra o sale
    const interval = setInterval(() => {
      fetchAllData();
    }, 10000);

    const onFocus = () => fetchAllData();
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);
    window.addEventListener("vibra-shift-updated", onFocus);

    return () => {
      clearInterval(interval);
      bc?.close();
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
      window.removeEventListener("vibra-shift-updated", onFocus);
    };
  }, []);

  // Filtrado de turnos por el Mes y Profesor seleccionado
  const filteredMonthShifts = useMemo(() => {
    return allShifts.filter((s) => {
      const d = new Date(s.clock_in);
      const matchMonth = d.getMonth() === selectedMonth;
      const matchYear = d.getFullYear() === selectedYear;
      if (!matchMonth || !matchYear) return false;

      if (selectedTeacherId !== "todos") {
        return (
          s.teacher_id === selectedTeacherId ||
          (selectedTeacherId.includes("05") && s.teacher_name?.toLowerCase().includes("nathaly")) ||
          (selectedTeacherId.includes("03") && s.teacher_name?.toLowerCase().includes("jeremy")) ||
          (selectedTeacherId.includes("04") && s.teacher_name?.toLowerCase().includes("fernando")) ||
          (selectedTeacherId.includes("08") && s.teacher_name?.toLowerCase().includes("karla")) ||
          (selectedTeacherId.includes("07") && s.teacher_name?.toLowerCase().includes("sergio")) ||
          (selectedTeacherId.includes("06") && s.teacher_name?.toLowerCase().includes("demo"))
        );
      }
      return true;
    });
  }, [allShifts, selectedMonth, selectedYear, selectedTeacherId]);

  // Consolidado mensual por docente
  const teacherSummaries = useMemo(() => {
    // Tomamos todos los turnos del mes para el desglose docente general
    const monthAll = allShifts.filter((s) => {
      const d = new Date(s.clock_in);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
    return computeTeacherMonthlySummary(monthAll, activeShifts);
  }, [allShifts, activeShifts, selectedMonth, selectedYear]);

  // Métricas globales del mes
  const monthMetrics = useMemo(() => {
    let totalMinutes = 0;
    filteredMonthShifts.forEach((s) => {
      let mins = s.total_minutes_worked || 0;
      if (mins === 0 && s.clock_out) {
        mins = Math.max(
          0,
          Math.floor((new Date(s.clock_out).getTime() - new Date(s.clock_in).getTime()) / 60000) -
            (s.break_minutes || 0),
        );
      } else if (mins === 0 && !s.clock_out) {
        mins = Math.max(
          0,
          Math.floor((Date.now() - new Date(s.clock_in).getTime()) / 60000) - (s.break_minutes || 0),
        );
      }
      totalMinutes += mins;
    });

    const totalHours = Number((totalMinutes / 60).toFixed(2));
    const totalShifts = filteredMonthShifts.length;
    const avgMinutesPerShift = totalShifts > 0 ? Math.round(totalMinutes / totalShifts) : 0;
    const avgHoursFormatted =
      avgMinutesPerShift > 0
        ? `${Math.floor(avgMinutesPerShift / 60)}h ${avgMinutesPerShift % 60}m`
        : "0h 0m";

    return {
      totalHours,
      totalMinutes,
      totalShifts,
      avgHoursFormatted,
    };
  }, [filteredMonthShifts]);

  // Acciones de administración
  const handleAdminClockOut = async (shiftId: string, teacherName: string) => {
    try {
      await clockOut(activeRole, shiftId);
      toast.success(`✓ Turno de ${teacherName} finalizado y guardado en PostgreSQL.`);
      fetchAllData();
    } catch (err: any) {
      toast.error("Error al finalizar turno: " + (err.message || "Error de servidor"));
    }
  };

  const handleExportMonthCSV = () => {
    if (filteredMonthShifts.length === 0) {
      toast.info("No hay registros de asistencia en el mes seleccionado para exportar.");
      return;
    }
    const monthLabel = `${MONTHS_NAMES[selectedMonth]} ${selectedYear}`;
    exportDetailedAttendanceCSV(filteredMonthShifts, monthLabel);
    toast.success(`✓ Archivo Excel (.CSV) descargado para ${monthLabel}`);
  };

  const handleGenerateReport = async () => {
    setLoadingReport(true);
    try {
      const data = await generatePayrollReport(
        activeRole,
        currentUser?.email ?? "admin-id",
        startDate,
        endDate,
      );
      setReportData(data);
      toast.success("Cierre de Horas generado y auditado.");
    } catch {
      setReportData([]);
      toast.info("No se registraron horas acumuladas en este rango de fechas.");
    } finally {
      setLoadingReport(false);
    }
  };

  const handleExportPayrollCSV = () => {
    if (!reportData) return;
    exportPayrollToCSV(reportData, startDate, endDate);
    toast.success("Archivo .CSV de nómina descargado para Excel.");
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Principal del Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Módulo Oficial de Recursos Humanos y Sedes
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2.5">
            <UserCheck className="h-7 w-7 text-primary" /> Asistencia Docente & Control Horario
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Supervisión en tiempo real de profesores en sede, kardex mensual de asistencias y exportación oficial de horas.
          </p>
        </div>

        {/* Estado en vivo y refresco manual */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-2xl shadow-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-left">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
                PostgreSQL Insforge En Vivo
              </p>
              <p className="text-[9px] text-muted-foreground leading-tight">
                Sincronizado: {lastSyncTime.toLocaleTimeString("es-PE")}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchAllData}
            disabled={loadingShifts}
            className="h-9 px-3 text-xs font-bold gap-1.5 rounded-xl border-border hover:bg-muted"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingShifts ? "animate-spin text-primary" : ""}`} />
            Actualizar
          </Button>

          <Button
            size="sm"
            onClick={handleExportMonthCSV}
            className="h-9 px-3.5 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Descargar Excel (.CSV)
          </Button>
        </div>
      </div>

      {/* Pestañas Principales de Navegación */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("kardex")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === "kardex"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          Kardex Mensual de Profesores ({MONTHS_NAMES[selectedMonth]} {selectedYear})
        </button>

        <button
          onClick={() => setActiveTab("envivo")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all relative ${
            activeTab === "envivo"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Profesores en Sede en Vivo
          {activeShifts.length > 0 && (
            <span className="ml-1 bg-white text-emerald-800 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {activeShifts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("cierre")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === "cierre"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Cierre de Nómina & Horas
        </button>
      </div>

      {/* Barra de Filtros: Selector de Mes, Año y Profesor */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Selector de Mes */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Mes:
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              aria-label="Seleccionar mes de asistencia"
              className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {MONTHS_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name} {selectedYear}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Profesor */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-primary" /> Profesor:
            </span>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              aria-label="Filtrar por profesor"
              className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="todos">Todos los Profesores ({teacherSummaries.length})</option>
              {teacherSummaries.map((t) => (
                <option key={t.teacherId} value={t.teacherId}>
                  {t.teacherName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Indicador de registros encontrados */}
        <div className="text-xs text-muted-foreground">
          Mostrando <strong>{filteredMonthShifts.length}</strong> asistencias registradas en{" "}
          <strong className="text-foreground">
            {MONTHS_NAMES[selectedMonth]} {selectedYear}
          </strong>
        </div>
      </div>

      {/* Tarjetas KPI del Mes Seleccionado */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Horas del Mes */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Horas Acumuladas</span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground">{monthMetrics.totalHours} hrs</p>
          <p className="text-[11px] text-muted-foreground">
            {monthMetrics.totalMinutes} minutos netos en {MONTHS_NAMES[selectedMonth]}
          </p>
        </div>

        {/* KPI 2: Total Turnos / Días Asistidos */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Días / Turnos Asistidos</span>
            <CalendarDays className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-foreground">{monthMetrics.totalShifts} turnos</p>
          <p className="text-[11px] text-muted-foreground">Fichajes completados en el mes</p>
        </div>

        {/* KPI 3: Docentes Activos en Sede Ahora */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">En Sede Ahora Mismo</span>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-black text-foreground">{activeShifts.length}</p>
            {activeShifts.length > 0 ? (
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
                EN VIVO
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-muted-foreground">Sin profesores en sede</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {activeShifts.length > 0
              ? activeShifts.map((s) => s.teacher_name).join(", ")
              : "Esperando próximo fichaje docente"}
          </p>
        </div>

        {/* KPI 4: Promedio por Asistencia */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Promedio por Turno</span>
            <Timer className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-foreground">{monthMetrics.avgHoursFormatted}</p>
          <p className="text-[11px] text-muted-foreground">Duración media de permanencia</p>
        </div>
      </div>

      {/* CONTENIDO SEGÚN LA PESTAÑA SELECCIONADA */}
      {activeTab === "kardex" && (
        <div className="space-y-6">
          {/* 1. Resumen de Desempeño por Profesor en el Mes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Resumen Mensual por Profesor —{" "}
                {MONTHS_NAMES[selectedMonth]} {selectedYear}
              </h2>
              <span className="text-xs text-muted-foreground">
                Haz clic en cualquier profesor para filtrar su kardex
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {teacherSummaries.map((t) => {
                const isSelected = selectedTeacherId === t.teacherId;
                return (
                  <div
                    key={t.teacherId}
                    onClick={() => setSelectedTeacherId(isSelected ? "todos" : t.teacherId)}
                    className={`rounded-2xl border p-4 space-y-3 cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                        : "border-border bg-card hover:border-primary/40 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-black text-foreground">{t.teacherName}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{t.specialty}</p>
                      </div>

                      {t.isCurrentlyInSede ? (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 animate-pulse shrink-0">
                          ● EN SEDE
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                          FUERA
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-semibold">Turnos Asistidos</p>
                        <p className="text-base font-black text-foreground">{t.totalShifts}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-semibold">Horas en Sede</p>
                        <p className="text-base font-black text-primary">{t.totalHours} hrs</p>
                      </div>
                    </div>

                    <div className="text-[10px] text-muted-foreground pt-1 flex items-center justify-between">
                      <span>
                        Último fichaje:{" "}
                        <strong>
                          {t.lastShiftDate
                            ? new Date(t.lastShiftDate).toLocaleDateString("es-PE", {
                                day: "2-digit",
                                month: "short",
                              })
                            : "Sin turnos"}
                        </strong>
                      </span>
                      <span className="text-primary font-bold hover:underline">
                        {isSelected ? "Ver todos" : "Ver kardex →"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Tabla Detallada: Kardex Cronológico de Asistencias del Mes */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-black text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Kardex y Registro de Fichajes Detallados
                </h2>
                <p className="text-xs text-muted-foreground">
                  Detalle cronológico de cada entrada, salida, tiempo de descanso y horas netas trabajadas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportMonthCSV}
                  className="h-8 text-xs font-bold gap-1.5 border-border hover:bg-muted"
                >
                  <Download className="h-3 w-3 text-emerald-600" /> Exportar a Excel (.CSV)
                </Button>
              </div>
            </div>

            {filteredMonthShifts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-xs text-muted-foreground space-y-2">
                <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <p className="font-bold text-foreground text-sm">
                  No hay asistencias registradas para este filtro en {MONTHS_NAMES[selectedMonth]} {selectedYear}
                </p>
                <p className="max-w-md mx-auto text-muted-foreground">
                  Cuando los profesores marquen su entrada desde su móvil o quiosco de sede, cada sesión quedará
                  auditada aquí con fecha, hora exacta y duración.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-muted text-muted-foreground text-[11px] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-3.5">Fecha</th>
                      <th className="p-3.5">Profesor / Staff</th>
                      <th className="p-3.5">Geocontrol GPS</th>
                      <th className="p-3.5">Hora Entrada</th>
                      <th className="p-3.5">Hora Salida</th>
                      <th className="p-3.5">Pausa</th>
                      <th className="p-3.5">Tiempo en Sede</th>
                      <th className="p-3.5">Estado</th>
                      <th className="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-background font-medium">
                    {filteredMonthShifts.map((shift) => {
                      const d = new Date(shift.clock_in);
                      const dateStr = d.toLocaleDateString("es-PE", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });

                      const inTime = d.toLocaleTimeString("es-PE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      const outTime = shift.clock_out
                        ? new Date(shift.clock_out).toLocaleTimeString("es-PE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "En sede";

                      const loc = parseShiftLocation(shift);
                      const inLoc = loc.in;
                      const outLoc = loc.out;

                      let mins = shift.total_minutes_worked || 0;
                      if (mins === 0 && shift.clock_out) {
                        mins = Math.max(
                          0,
                          Math.floor(
                            (new Date(shift.clock_out).getTime() - d.getTime()) / 60000,
                          ) - (shift.break_minutes || 0),
                        );
                      } else if (mins === 0 && !shift.clock_out) {
                        mins = Math.max(
                          0,
                          Math.floor((Date.now() - d.getTime()) / 60000) - (shift.break_minutes || 0),
                        );
                      }
                      const hrs = Math.floor(mins / 60);
                      const remMins = mins % 60;
                      const formattedDuration = hrs > 0 ? `${hrs}h ${remMins}m` : `${remMins}m`;

                      return (
                        <tr key={shift.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3.5 font-bold text-foreground capitalize whitespace-nowrap">
                            {dateStr}
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-foreground block">{shift.teacher_name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {loc.device === "admin_header"
                                ? "Panel Admin"
                                : loc.device === "kiosk_mobile"
                                ? "Móvil Docente"
                                : loc.device || "Sede Fija"}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="space-y-1">
                              {inLoc ? (
                                inLoc.status === "en_sede" ? (
                                  <a
                                    href={inLoc.googleMapsUrl || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/25 transition-colors"
                                    title={`Entrada verificada a ${formatDistance(inLoc.distanceMeters)} de sede`}
                                  >
                                    <Navigation className="h-3 w-3" />
                                    <span>En Sede ({formatDistance(inLoc.distanceMeters)})</span>
                                  </a>
                                ) : inLoc.status === "fuera_de_sede" ? (
                                  <a
                                    href={inLoc.googleMapsUrl || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/25 transition-colors"
                                    title={`Marcó fuera de sede a ${formatDistance(inLoc.distanceMeters)}. Clic para abrir en Google Maps.`}
                                  >
                                    <MapPin className="h-3 w-3 text-rose-500" />
                                    <span>Fuera ({formatDistance(inLoc.distanceMeters)})</span>
                                    <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                                  </a>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                                    ⚠️ Sin GPS
                                  </span>
                                )
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                                  <Building2 className="h-3 w-3" /> Sede Fija
                                </span>
                              )}

                              {outLoc && outLoc.distanceMeters !== undefined && (
                                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <span>Salida:</span>
                                  <a
                                    href={outLoc.googleMapsUrl || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`hover:underline font-bold ${
                                      outLoc.status === "en_sede"
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-amber-600 dark:text-amber-400"
                                    }`}
                                  >
                                    {formatDistance(outLoc.distanceMeters)}
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-mono bg-muted px-2 py-0.5 rounded-md font-bold text-foreground">
                              {inTime} hs
                            </span>
                          </td>
                          <td className="p-3.5">
                            {shift.clock_out ? (
                              <span className="font-mono bg-muted px-2 py-0.5 rounded-md font-bold text-foreground">
                                {outTime} hs
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-bold animate-pulse text-xs">
                                ● En curso...
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-muted-foreground">
                            {shift.break_minutes > 0 ? `${shift.break_minutes} min` : "0 min"}
                          </td>
                          <td className="p-3.5">
                            <span className="font-mono font-black text-primary">
                              {formattedDuration}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              {(mins / 60).toFixed(2)} hrs
                            </span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                                shift.status === "trabajando"
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 animate-pulse"
                                  : shift.status === "pausa"
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                  : "bg-muted text-muted-foreground border-border"
                              }`}
                            >
                              {shift.status === "trabajando"
                                ? "● EN SEDE"
                                : shift.status === "pausa"
                                ? "PAUSA"
                                : "FINALIZADO"}
                            </span>
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            {shift.status !== "finalizado" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAdminClockOut(shift.id, shift.teacher_name)}
                                className="h-7 text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 px-2 rounded-lg"
                              >
                                Finalizar
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA: Profesores en Sede en Vivo */}
      {activeTab === "envivo" && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-black text-foreground flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-500" /> Profesores Físicamente en Sede (En Vivo)
              </h2>
              <p className="text-xs text-muted-foreground">
                Monitoreo en tiempo real de docentes que se encuentran actualmente dictando o en espera de alumnos.
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {activeShifts.length} {activeShifts.length === 1 ? "profesor en sede" : "profesores en sede"}
            </span>
          </div>

          {activeShifts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-xs text-muted-foreground space-y-2">
              <UserCheck className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="font-bold text-foreground text-sm">No hay profesores en sede actualmente</p>
              <p className="max-w-md mx-auto text-muted-foreground">
                Cuando los profesores fichen su entrada desde su móvil o quiosco docente, su registro aparecerá aquí en
                tiempo real sincronizado vía PostgreSQL / Insforge.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeShifts.map((shift) => {
                const elapsedMinutes = Math.max(
                  0,
                  Math.floor((Date.now() - new Date(shift.clock_in).getTime()) / 60000) -
                    (shift.break_minutes || 0),
                );
                const hrs = Math.floor(elapsedMinutes / 60);
                const mins = elapsedMinutes % 60;
                const formattedDuration = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} min`;

                return (
                  <div
                    key={shift.id}
                    className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-black text-foreground">{shift.teacher_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Entrada:{" "}
                          <strong>
                            {new Date(shift.clock_in).toLocaleTimeString("es-PE", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            hs
                          </strong>
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          shift.status === "trabajando"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 animate-pulse"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {shift.status === "trabajando" ? "● EN SEDE" : "PAUSA"}
                      </span>
                    </div>

                    {/* Geocontrol GPS del turno activo */}
                    {(() => {
                      const loc = parseShiftLocation(shift);
                      const inLoc = loc.in;
                      if (!inLoc) {
                        return (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            <span>Registrado desde sede fija</span>
                          </div>
                        );
                      }
                      return (
                        <div className="pt-0.5">
                          {inLoc.status === "en_sede" ? (
                            <a
                              href={inLoc.googleMapsUrl || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 px-2 py-0.5 rounded-lg border border-emerald-500/30 transition-colors"
                              title={`GPS verificado a ${formatDistance(inLoc.distanceMeters)} de sede`}
                            >
                              <Navigation className="h-3 w-3" />
                              <span>En Sede ({formatDistance(inLoc.distanceMeters)})</span>
                            </a>
                          ) : inLoc.status === "fuera_de_sede" ? (
                            <a
                              href={inLoc.googleMapsUrl || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 px-2 py-0.5 rounded-lg border border-amber-500/30 transition-colors"
                              title={`Marcó fuera de sede a ${formatDistance(inLoc.distanceMeters)}. Clic para abrir en Google Maps.`}
                            >
                              <MapPin className="h-3 w-3 text-rose-500 animate-pulse" />
                              <span>Marcó Fuera ({formatDistance(inLoc.distanceMeters)})</span>
                              <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                              ⚠️ Marcado sin GPS
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                      <span className="text-xs text-muted-foreground">
                        Tiempo acumulado: <strong className="text-foreground">{formattedDuration}</strong>
                      </span>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAdminClockOut(shift.id, shift.teacher_name)}
                        className="h-7 text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 px-2 rounded-lg"
                      >
                        Finalizar Turno
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA: Cierre de Nómina & Horas */}
      {activeTab === "cierre" && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-black text-foreground flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" /> Generar Cierre e Informe de Nómina Oficial (.CSV)
            </h2>
            <p className="text-xs text-muted-foreground">
              Consolidación auditada de horas netas trabajadas para el cálculo de sueldos o pago por horas a docentes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 items-end">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Fecha Inicio Periodo</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Fecha Fin Periodo</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <Button
                onClick={handleGenerateReport}
                disabled={loadingReport}
                className="w-full font-bold gap-2 bg-primary hover:bg-primary/90 rounded-xl"
              >
                <Lock className="h-4 w-4" /> Generar Cierre de Horas
              </Button>
            </div>
          </div>

          {/* Tabla Resultado del Cierre */}
          {reportData && (
            <div className="pt-4 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" /> Consolidado de Horas Listo para Excel
                </p>
                <Button
                  onClick={handleExportPayrollCSV}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  <Download className="h-4 w-4" /> Exportar a Excel (.CSV)
                </Button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted text-muted-foreground text-xs uppercase font-semibold">
                    <tr>
                      <th className="p-3.5">Profesor</th>
                      <th className="p-3.5">Turnos / Días</th>
                      <th className="p-3.5">Total Minutos</th>
                      <th className="p-3.5">Total Horas Netas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-background font-medium">
                    {reportData.map((row) => (
                      <tr key={row.teacher_id} className="hover:bg-muted/40">
                        <td className="p-3.5 font-bold text-foreground">{row.teacher_name}</td>
                        <td className="p-3.5 text-muted-foreground">{row.shift_count} turnos</td>
                        <td className="p-3.5 font-mono text-muted-foreground">{row.total_minutes} min</td>
                        <td className="p-3.5 font-mono font-bold text-primary">
                          {row.total_hours.toFixed(2)} hrs
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
