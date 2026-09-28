import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppStore, type AdminStudent } from "@/store/app-store";
import {
  FileSpreadsheet,
  Search,
  Filter,
  Users,
  UserCheck,
  UserX,
  CreditCard,
  GraduationCap,
  Calendar,
  Clock,
  Download,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { musicalInstruments, teachers } from "@/store/admin-seeds";
import { toast } from "sonner";
import { useInsforgeSync } from "@/hooks/use-insforge-sync";
import { isMatchingStudentName } from "@/lib/student-matching";

export const Route = createFileRoute("/admin/reportes")({
  head: () => ({
    meta: [
      { title: "Reporte Maestro de Alumnos y Clientes — VM STAFF" },
      {
        name: "description",
        content:
          "Lista consolidada y enumerada de alumnos clientes, estado de matrícula, horarios, saldos pendientes y porcentaje de asistencia.",
      },
      { property: "og:title", content: "Reporte Maestro de Alumnos y Clientes — VM STAFF" },
    ],
  }),
  component: AdminReportesPage,
});

export function AdminReportesPage() {
  const [mounted, setMounted] = useState(false);
  const students = useAppStore((s) => s.adminStudents);
  const invoices = useAppStore((s) => s.invoices);
  const schedule = useAppStore((s) => s.schedule);
  const activeRole = useAppStore((s) => s.activeRole);

  const { syncNow, isSyncing, lastSyncTime } = useInsforgeSync();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Base Oficial de Alumnos Activos (100% PostgreSQL Insforge)
  const activeStudents = useMemo(
    () => students.filter((s) => s.status === "activo"),
    [students]
  );

  // Estados de Filtro y Búsqueda
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("todos");
  const [teacherFilter, setTeacherFilter] = useState<string>("todos");
  const [instrumentFilter, setInstrumentFilter] = useState<string>("todos");

  // Calcular deuda consolidada por familia / alumno
  const getStudentDebt = (st: AdminStudent): { totalDebt: number; pendingCount: number } => {
    const fam = (st.family || "").toLowerCase().trim();
    const stName = (st.name || "").toLowerCase().trim();

    const relatedInvoices = invoices.filter((inv) => {
      const invFam = (inv.family || "").toLowerCase().trim();
      const invConcept = (inv.concept || "").toLowerCase().trim();
      const invStudent = (inv.student || "").toLowerCase().trim();
      return (
        (stName && (invStudent === stName || isMatchingStudentName(st.name, inv.student || "") || invConcept.includes(stName))) ||
        (fam && invFam && (invFam.includes(fam) || fam.includes(invFam))) ||
        st.invoices?.some((i) => i.id === inv.id)
      );
    });

    const pendingInvs = relatedInvoices.filter((inv) => inv.status !== "pagado");
    const totalDebt = pendingInvs.reduce((acc, inv) => {
      const remaining =
        inv.remainingBalance !== undefined
          ? inv.remainingBalance
          : Math.max(0, (inv.amount || 0) - (inv.amountPaid || 0));
      return acc + remaining;
    }, 0);

    return { totalDebt, pendingCount: pendingInvs.length };
  };

  // Obtener horario consolidado del alumno
  const getStudentScheduleText = (st: AdminStudent): string => {
    const stName = st.name.toLowerCase().trim();
    const matchedLessons = schedule.filter(
      (l) => l.student.toLowerCase().trim() === stName
    );

    if (matchedLessons.length === 0) {
      if (st.modality) {
        return `${st.teacher || "Profesor por asignar"} (${st.modality.split(" ")[0]})`;
      }
      return "Sin horario registrado";
    }

    const days = Array.from(new Set(matchedLessons.map((l) => l.day))).join(" y ");
    const time = matchedLessons[0].time;
    const teacher = matchedLessons[0].teacher || st.teacher || "Docente";
    const room = matchedLessons[0].room || "";

    return `${days} ${time} · ${teacher}${room ? ` (${room})` : ""}`;
  };

  // Filtrado de Alumnos (Exclusivamente Alumnos Activos Oficiales)
  const filteredStudents = useMemo(() => {
    return activeStudents.filter((st) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        st.name.toLowerCase().includes(q) ||
        st.family.toLowerCase().includes(q) ||
        (st.instrument && st.instrument.toLowerCase().includes(q)) ||
        (st.teacher && st.teacher.toLowerCase().includes(q)) ||
        (st.phone && st.phone.includes(q));

      const { totalDebt } = getStudentDebt(st);
      const matchPayment =
        paymentFilter === "todos" ||
        (paymentFilter === "con_deuda" && totalDebt > 0) ||
        (paymentFilter === "al_dia" && totalDebt === 0);

      const matchTeacher =
        teacherFilter === "todos" ||
        (st.teacher && st.teacher.toLowerCase().includes(teacherFilter.toLowerCase()));

      const matchInstrument =
        instrumentFilter === "todos" ||
        (st.instrument && st.instrument.toLowerCase() === instrumentFilter.toLowerCase());

      return matchSearch && matchPayment && matchTeacher && matchInstrument;
    });
  }, [activeStudents, search, paymentFilter, teacherFilter, instrumentFilter, invoices]);

  // Indicadores Globales (KPIs) sobre Alumnos Activos Oficiales
  const stats = useMemo(() => {
    const total = activeStudents.length;
    const activos = total;

    // Asistencia Promedio
    const evaluated = activeStudents.filter((s) => (s.attendanceRate || 0) > 0);
    const avgAttendance =
      evaluated.length > 0
        ? Math.round(
            evaluated.reduce((acc, s) => acc + (s.attendanceRate || 0), 0) / evaluated.length
          )
        : 88; // Promedio histórico referencial

    // Deuda Total Acumulada sobre Alumnos Activos
    let deudaTotalPEN = 0;
    let alumnosConDeuda = 0;

    activeStudents.forEach((st) => {
      const { totalDebt } = getStudentDebt(st);
      if (totalDebt > 0) {
        deudaTotalPEN += totalDebt;
        alumnosConDeuda += 1;
      }
    });

    return {
      total,
      activos,
      avgAttendance,
      deudaTotalPEN,
      alumnosConDeuda,
      alumnosAlDia: total - alumnosConDeuda,
    };
  }, [activeStudents, invoices]);

  // Exportar reporte consolidado a Excel CSV con UTF-8 BOM
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      toast.warning("No hay alumnos en la vista para exportar.");
      return;
    }

    const headers = [
      "N°",
      "Nombre del Alumno (Cliente)",
      "Familia / Apoderado",
      "Estado",
      "Curso / Instrumento",
      "Modalidad",
      "Horario Asignado",
      "Profesor",
      "Asistencia (%)",
      "Deuda Pendiente (S/)",
      "Celular WhatsApp",
    ];

    const rows = filteredStudents.map((st, index) => {
      const { totalDebt } = getStudentDebt(st);
      const scheduleText = getStudentScheduleText(st);
      return [
        index + 1,
        `"${st.name.replace(/"/g, '""')}"`,
        `"${(st.family || "").replace(/"/g, '""')}"`,
        st.status.toUpperCase(),
        `"${st.instrument || "Piano"}"`,
        `"${st.modality || "Regular"}"`,
        `"${scheduleText.replace(/"/g, '""')}"`,
        `"${st.teacher || "Por asignar"}"`,
        `${st.attendanceRate || 0}%`,
        `S/ ${totalDebt.toFixed(2)}`,
        `"${st.phone || st.emergencyContact?.phone || ""}"`,
      ];
    });

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Reporte_Alumnos_VibraMusic_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Reporte oficial descargado en formato CSV compatible con Excel.");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              Control Institucional · Vibra Music
            </span>
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-bold flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="h-3.5 w-3.5" /> Base Activa Oficial PostgreSQL ({activeStudents.length})
            </Badge>
          </div>
          <h1 className="text-2xl font-black sm:text-3xl text-foreground mt-1 tracking-tight">
            Reporte Maestro de Alumnos (Clientes)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Listado consolidado enumerado, estado de matrícula, saldo pendiente, asignación de cursos y horarios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => syncNow()}
            disabled={isSyncing}
            className="gap-2 font-bold rounded-xl shadow-xs border-border hover:bg-muted"
            title="Sincronizar en tiempo real con PostgreSQL"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin text-primary" : "text-emerald-500"}`} />
            {isSyncing ? "Sincronizando..." : "Sincronizar en Vivo"}
          </Button>

          <Button
            onClick={handleExportCSV}
            className="gap-2 font-bold bg-[#F47B20] hover:bg-[#FF9E3D] text-[#15120F] rounded-xl shadow-xs"
          >
            <Download className="h-4 w-4" />
            Descargar Reporte Excel
          </Button>
        </div>
      </div>

      {/* Tarjetas KPI Superiores sobre Alumnos Activos Oficiales */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="border-border shadow-xs bg-card">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Alumnos Activos</span>
              <UserCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-foreground">{mounted ? stats.activos : "—"}</p>
            <p className="text-[11px] text-muted-foreground">
              100% en vivo con PostgreSQL
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-card">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Al Día en Pagos</span>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-emerald-500">
              {mounted ? stats.alumnosAlDia : "—"}
            </p>
            <p className="text-[11px] text-muted-foreground">Sin saldo pendiente</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-card">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Con Saldo Pendiente</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-500">
              {mounted ? `${stats.alumnosConDeuda} familias` : "—"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Cuotas del ciclo por cobrar
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-card">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Deuda por Cobrar</span>
              <CreditCard className="h-4 w-4 text-rose-500" />
            </div>
            <p className="text-2xl font-black text-rose-500">
              {mounted ? `S/ ${stats.deudaTotalPEN.toFixed(2)}` : "—"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Saldo total acumulado
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-card col-span-2 sm:col-span-1">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Asistencia Promedio</span>
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-black text-foreground">
              {mounted ? `${stats.avgAttendance}%` : "—"}
            </p>
            <p className="text-[11px] text-emerald-500 font-bold">Registro de kardex en vivo</p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Buscador de Alumno / Apoderado */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre de alumno, familia, celular o curso..."
                className="pl-9 text-xs font-medium rounded-xl"
              />
            </div>

            {/* Filtros Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="text-xs rounded-xl h-9">
                  <SelectValue placeholder="Pagos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Cobro: Todos</SelectItem>
                  <SelectItem value="con_deuda">Con Deuda (Mora)</SelectItem>
                  <SelectItem value="al_dia">Al Día (Sin deuda)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={teacherFilter} onValueChange={setTeacherFilter}>
                <SelectTrigger className="text-xs rounded-xl h-9">
                  <SelectValue placeholder="Profesor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Docente: Todos</SelectItem>
                  <SelectItem value="Jeremy">Jeremy</SelectItem>
                  <SelectItem value="Fernando">Fernando</SelectItem>
                  <SelectItem value="Nathaly">Nathaly</SelectItem>
                  <SelectItem value="Demo">Claudia (Demo)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={instrumentFilter} onValueChange={setInstrumentFilter}>
                <SelectTrigger className="text-xs rounded-xl h-9">
                  <SelectValue placeholder="Curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Curso: Todos</SelectItem>
                  {musicalInstruments.map((inst) => (
                    <SelectItem key={inst} value={inst}>
                      {inst}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
            <span>
              Mostrando <strong>{filteredStudents.length}</strong> de <strong>{activeStudents.length}</strong> alumnos activos oficiales
            </span>

            {(search || paymentFilter !== "todos" || teacherFilter !== "todos" || instrumentFilter !== "todos") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPaymentFilter("todos");
                  setTeacherFilter("todos");
                  setInstrumentFilter("todos");
                }}
                className="text-primary hover:underline font-bold text-xs"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla Enumerada 1 a N de Alumnos (Clientes) */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground font-black text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-3 text-left">Alumno / Cliente</th>
                <th className="py-3 px-3 text-left">Familia & Contacto</th>
                <th className="py-3 px-3 text-center">Estado</th>
                <th className="py-3 px-3 text-left">Curso / Instrumento</th>
                <th className="py-3 px-3 text-left">Horario & Sala</th>
                <th className="py-3 px-3 text-center">Asistencia</th>
                <th className="py-3 px-3 text-right">Saldo Deudor</th>
                <th className="py-3 px-3 text-center">WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <p className="text-sm font-bold">No se encontraron alumnos con los filtros seleccionados.</p>
                    <p className="text-xs mt-1">Prueba limpiando la búsqueda o cambiando de estado.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, index) => {
                  const { totalDebt } = getStudentDebt(st);
                  const scheduleText = getStudentScheduleText(st);
                  const phone = st.phone || st.emergencyContact?.phone || "";
                  const cleanPhone = phone.replace(/\D/g, "");
                  const waNumber = cleanPhone.startsWith("51") ? cleanPhone : cleanPhone ? `51${cleanPhone}` : "";

                  return (
                    <tr
                      key={st.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Correlativo Enumerado 1 a N */}
                      <td className="py-3 px-3 text-center font-mono font-black text-muted-foreground text-[11px]">
                        {index + 1}
                      </td>

                      {/* Nombre del Alumno */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                          {st.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {st.category || "JUNIOR"} {st.age ? `· ${st.age} años` : ""}
                        </div>
                      </td>

                      {/* Familia & Apoderado */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground">
                          {st.family || "Familia Vibra"}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {phone || "Sin teléfono"}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-3 text-center">
                        <Badge
                          variant={
                            st.status === "activo"
                              ? "default"
                              : st.status === "pausa"
                              ? "secondary"
                              : "destructive"
                          }
                          className={`text-[10px] font-black uppercase ${
                            st.status === "activo"
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : st.status === "pausa"
                              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                              : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {st.status}
                        </Badge>
                      </td>

                      {/* Curso / Instrumento */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-foreground">{st.instrument || "Piano"}</span>
                        <div className="text-[11px] text-muted-foreground">
                          {st.modality || "Regular"}
                        </div>
                      </td>

                      {/* Horario y Profesor */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Clock className="h-3 w-3 text-primary shrink-0" />
                          <span>{scheduleText}</span>
                        </div>
                      </td>

                      {/* Asistencia */}
                      <td className="py-3 px-3 text-center">
                        <div className="font-bold font-mono text-xs">
                          {st.attendanceRate || 0}%
                        </div>
                        <div className="w-16 mx-auto h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.min(100, st.attendanceRate || 0)}%` }}
                          />
                        </div>
                      </td>

                      {/* Deuda Pendiente */}
                      <td className="py-3 px-3 text-right">
                        {totalDebt > 0 ? (
                          <div>
                            <span className="font-black text-rose-500 text-xs font-mono">
                              S/ {totalDebt.toFixed(2)}
                            </span>
                            <div className="text-[10px] text-rose-500 font-medium">
                              Cuota pendiente
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-emerald-500 text-xs font-mono">
                              S/ 0.00
                            </span>
                            <div className="text-[10px] text-emerald-500 font-medium">
                              Al día
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Enlace WhatsApp */}
                      <td className="py-3 px-3 text-center">
                        {waNumber ? (
                          <a
                            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                              `Hola Familia ${st.family || ""}, le saludamos de la Dirección de Vibra Music respecto al seguimiento de las clases de ${st.name}.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                            title={`Escribir a WhatsApp (${phone})`}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
