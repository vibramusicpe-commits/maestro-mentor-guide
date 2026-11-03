/**
 * ================================================================
 * informes-tracker-panel.tsx — Dashboard de Seguimiento de Informes
 * ================================================================
 *
 * Vista operativa para Dirección y Coordinación Pedagógica.
 * Muestra el panorama completo de TODOS los alumnos activos:
 *   - Quién tiene informe generado (y en qué estado)
 *   - Quién aún no lo tiene
 *   - Quién puede generarlo (cumple el mínimo de evaluaciones: ≥2 regular/intensivo, ≥1 demo)
 *   - Quién está bloqueado (no tiene evaluaciones suficientes)
 *
 * Reglas de negocio:
 *   - Solo alumnos activos (`status: "activo"`).
 *   - Cero datos financieros (sin S/, montos ni pagos).
 *   - Semáforos importados desde `report-kinds.ts`.
 *   - Acciones directas: abrir informe existente o generar borrador.
 *   - Layout dual: tabla completa en desktop y tarjetas compactas en móvil.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileBarChart2,
  FileText,
  Filter,
  Loader2,
  PlusCircle,
  RefreshCw,
  Search,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressReportDialog } from "@/components/admin/progress-report-dialog";
import {
  EVIDENCE_TONE,
  PERIOD_TYPE_LABELS,
  reportKindLabel,
} from "@/lib/informes/report-kinds";
import {
  buildReportPlanContext,
  computeReportReadiness,
  resolveReportWindow,
} from "@/lib/informes/report-readiness";
import { computeStudentCycleSessions } from "@/lib/kardex-calculator";
import { formatIsoDateShort } from "@/lib/informes/progress-report-format";
import { InformesValidationError, toIsoDate } from "@/lib/informes/utils";
import type {
  EvaluationFieldRow,
  ProgressReportPeriodType,
  ProgressReportRow,
} from "@/lib/informes/types";
import {
  getEvaluationsSummaryMap,
  type StudentEvaluationSummary,
} from "@/lib/services/evaluations-summary.service";
import { getDraftCriteriaFields } from "@/lib/services/evaluations.service";
import {
  createProgressReport,
  listProgressReports,
} from "@/lib/services/progress-reports.service";
import { resolveActor } from "@/lib/services/teacher-resolver";

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Borrador",
    className: "border-slate-400/40 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  },
  pending: {
    label: "En revisión",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  published: {
    label: "Publicado",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  rejected: {
    label: "Rechazado",
    className: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400",
  },
};

type ReadinessStatus = "con_informe" | "listo" | "insuficiente" | "sin_evaluaciones";

function resolveGuardianPhone(student: {
  phone?: string | null;
  motherPhone?: string | null;
  fatherPhone?: string | null;
  emergencyContact?: { phone?: string | null } | null;
}): string {
  return (
    student.phone ||
    student.emergencyContact?.phone ||
    student.motherPhone ||
    student.fatherPhone ||
    ""
  );
}

function csvCell(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>,
): void {
  const csvContent =
    "\uFEFF" +
    [headers.map(csvCell).join(","), ...rows.map((row) => row.map(csvCell).join(","))].join(
      "\r\n",
    );
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function InformesTrackerPanel({
  initialStudentName,
}: {
  /** Nombre preseleccionado desde Auditoría de Alumnos (ADR-0183). Solo filtro de lectura. */
  initialStudentName?: string;
} = {}) {
  const adminStudents = useAppStore((s) => s.adminStudents);
  const currentUser = useAppStore((s) => s.currentUser);
  const activeRole = useAppStore((s) => s.activeRole);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [evaluationsMap, setEvaluationsMap] = useState<Map<string, StudentEvaluationSummary>>(
    new Map(),
  );
  const [reports, setReports] = useState<ProgressReportRow[]>([]);
  const [draftFields, setDraftFields] = useState<EvaluationFieldRow[]>([]);

  // Filtros
  const [search, setSearch] = useState(initialStudentName ?? "");
  const [teacherFilter, setTeacherFilter] = useState("todos");
  const [instrumentFilter, setInstrumentFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState<"todos" | ReadinessStatus>("todos");
  const [reportStateFilter, setReportStateFilter] = useState<string>("todos");

  // Diálogo para ver/editar informe
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<ProgressReportRow | null>(null);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [generatingForStudentId, setGeneratingForStudentId] = useState<string | null>(null);

  // Alumnos activos ordenados por nombre
  const activeStudents = useMemo(() => {
    return [...adminStudents]
      .filter((student) => student.status === "activo")
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [adminStudents]);

  // Carga inicial y recarga
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [summaryMap, reportList, drafts] = await Promise.all([
        getEvaluationsSummaryMap(),
        listProgressReports({ limit: 500 }),
        getDraftCriteriaFields(),
      ]);

      setEvaluationsMap(summaryMap);
      setReports(reportList);
      setDraftFields(drafts);
    } catch (error) {
      console.error("Error al cargar datos del tracker de informes:", error);
      toast.error("No se pudo cargar la información de seguimiento.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Lista de docentes e instrumentos únicos para los selects
  const teacherOptions = useMemo(() => {
    const set = new Set<string>();
    for (const st of activeStudents) {
      const t = (st.teacher || "").trim();
      if (t) set.add(t);
    }
    return Array.from(set).sort();
  }, [activeStudents]);

  const instrumentOptions = useMemo(() => {
    const set = new Set<string>();
    for (const st of activeStudents) {
      const inst = (st.instrument || "").trim();
      if (inst) set.add(inst);
    }
    return Array.from(set).sort();
  }, [activeStudents]);

  // Mapa de informes más recientes por student_id
  const latestReportByStudent = useMemo(() => {
    const map = new Map<string, ProgressReportRow>();
    for (const r of reports) {
      if (!r.student_id) continue;
      // Como vienen ordenados o los agrupamos, nos quedamos con el más reciente
      const existing = map.get(r.student_id);
      if (!existing || (r.created_at || "") > (existing.created_at || "")) {
        map.set(r.student_id, r);
      }
    }
    return map;
  }, [reports]);

  // Docentes que tienen criterios en borrador
  const teachersWithDraftCriteria = useMemo(() => {
    const teacherIds = new Set<string>();
    for (const f of draftFields) {
      if (f.owner_teacher_id) teacherIds.add(f.owner_teacher_id);
    }
    return teacherIds;
  }, [draftFields]);

  // Construcción de filas de seguimiento con cálculo de semáforo
  const trackerRows = useMemo(() => {
    return activeStudents.map((student) => {
      const summary = evaluationsMap.get(student.id);
      const totalEval = summary?.totalEvaluations ?? 0;
      const lastEvalDate = summary?.lastEvaluationDate ?? null;
      const report = latestReportByStudent.get(student.id) || null;

      // Calcular contexto de plan y sesiones para determinar mínimo
      const sessions = computeStudentCycleSessions({
        student,
        allSchedule: student.scheduleLessons || [],
      });
      const planContext = buildReportPlanContext(student, sessions, summary?.evaluations || []);
      const minRequired = planContext.isDemo ? 1 : 2;

      // Determinar estado de semáforo operativo
      let readinessStatus: ReadinessStatus;
      if (report) {
        readinessStatus = "con_informe";
      } else if (totalEval === 0) {
        readinessStatus = "sin_evaluaciones";
      } else if (totalEval < minRequired) {
        readinessStatus = "insuficiente";
      } else {
        readinessStatus = "listo";
      }

      // Nombre amigable del plan (sin datos financieros)
      const planLabel = student.planType
        ? `${student.planType}${student.packageTotalSessions ? ` (${student.packageTotalSessions} cls)` : ""}`
        : "Regular (8 clases)";

      // Advertencia de criterios de docente
      const hasTeacherDraftCriteria = Boolean(
        student.assigned_teacher_id && teachersWithDraftCriteria.has(student.assigned_teacher_id),
      );

      return {
        student,
        summary,
        totalEval,
        lastEvalDate,
        minRequired,
        readinessStatus,
        report,
        planLabel,
        sessions,
        planContext,
        hasTeacherDraftCriteria,
      };
    });
  }, [activeStudents, evaluationsMap, latestReportByStudent, teachersWithDraftCriteria]);

  // Filtrado reactivo
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return trackerRows.filter((row) => {
      // Búsqueda por texto
      if (q) {
        const matchName = row.student.name.toLowerCase().includes(q);
        const matchTeacher = (row.student.teacher || "").toLowerCase().includes(q);
        const matchInst = (row.student.instrument || "").toLowerCase().includes(q);
        if (!matchName && !matchTeacher && !matchInst) return false;
      }
      // Filtro docente
      if (teacherFilter !== "todos" && row.student.teacher !== teacherFilter) {
        return false;
      }
      // Filtro instrumento
      if (instrumentFilter !== "todos" && row.student.instrument !== instrumentFilter) {
        return false;
      }
      // Filtro semáforo
      if (statusFilter !== "todos" && row.readinessStatus !== statusFilter) {
        return false;
      }
      // Filtro estado de informe
      if (reportStateFilter !== "todos") {
        if (reportStateFilter === "sin_informe" && row.report !== null) return false;
        if (reportStateFilter !== "sin_informe" && row.report?.status !== reportStateFilter) {
          return false;
        }
      }
      return true;
    });
  }, [trackerRows, search, teacherFilter, instrumentFilter, statusFilter, reportStateFilter]);

  // Contadores KPI
  const kpis = useMemo(() => {
    let conInforme = 0;
    let listos = 0;
    let insuficientes = 0;
    let sinEval = 0;

    for (const r of trackerRows) {
      if (r.readinessStatus === "con_informe") conInforme++;
      else if (r.readinessStatus === "listo") listos++;
      else if (r.readinessStatus === "insuficiente") insuficientes++;
      else if (r.readinessStatus === "sin_evaluaciones") sinEval++;
    }

    return {
      total: trackerRows.length,
      conInforme,
      listos,
      insuficientes,
      sinEval,
    };
  }, [trackerRows]);

  // Actor autenticado
  const actor = useMemo(() => {
    return resolveActor(
      currentUser?.email,
      currentUser?.name || (activeRole === "staff" ? "Secretaría" : "Dirección"),
      activeRole,
    );
  }, [activeRole, currentUser?.email, currentUser?.name]);

  // Generar borrador directo desde el tracker
  const handleGenerateDraft = async (row: (typeof trackerRows)[number]) => {
    try {
      setGeneratingForStudentId(row.student.id);

      const periodType: ProgressReportPeriodType = "mensual";
      const window = resolveReportWindow({
        plan: row.planContext,
        sessions: row.sessions,
        evaluations: row.summary?.evaluations || [],
        kind: periodType,
      });

      const readiness = computeReportReadiness({
        plan: row.planContext,
        sessions: row.sessions,
        evaluations: row.summary?.evaluations || [],
        periodStart: window.start,
        periodEnd: window.end,
        kind: periodType,
      });

      if (!readiness.evidence.canGenerate) {
        toast.error(readiness.evidence.message);
        return;
      }

      const created = await createProgressReport(
        row.student.id,
        { type: periodType, start: window.start, end: window.end },
        { actor, isTest: false },
      );

      // Actualizar estado local
      setReports((prev) => [created, ...prev]);
      setActiveReport(created);
      setActiveStudentId(row.student.id);
      setDialogOpen(true);
      toast.success(`Borrador generado para ${row.student.name}.`);
    } catch (error) {
      toast.error(
        error instanceof InformesValidationError
          ? error.message
          : "No se pudo generar el informe. Revisa la conexión.",
      );
    } finally {
      setGeneratingForStudentId(null);
    }
  };

  // Abrir informe existente
  const handleOpenExistingReport = (report: ProgressReportRow, studentId: string) => {
    setActiveReport(report);
    setActiveStudentId(studentId);
    setDialogOpen(true);
  };

  // Exportar CSV oficial de seguimiento (sin datos financieros)
  const handleExportCsv = () => {
    if (filteredRows.length === 0) {
      toast.warning("No hay registros que coincidan con los filtros.");
      return;
    }

    const headers = [
      "N°",
      "Alumno",
      "Docente Asignado",
      "Instrumento",
      "Plan Lectivo",
      "Evaluaciones Totales",
      "Mínimo Requerido",
      "Última Evaluación",
      "Semáforo Operativo",
      "Estado Informe",
      "Tipo Informe",
      "Periodo Inicio",
      "Periodo Fin",
      "ID Alumno",
    ];

    const rows = filteredRows.map((r, idx) => {
      const semaforoLabel =
        r.readinessStatus === "con_informe"
          ? "Con informe"
          : r.readinessStatus === "listo"
            ? "Listo para informe"
            : r.readinessStatus === "insuficiente"
              ? "Insuficiente"
              : "Sin evaluaciones";

      const reportState = r.report
        ? STATUS_BADGES[r.report.status]?.label || r.report.status
        : "Sin informe";

      return [
        idx + 1,
        r.student.name,
        r.student.teacher || "—",
        r.student.instrument || "—",
        r.planLabel,
        r.totalEval,
        r.minRequired,
        r.lastEvalDate || "—",
        semaforoLabel,
        reportState,
        r.report ? reportKindLabel(r.report.period_type) : "—",
        r.report?.period_start || "—",
        r.report?.period_end || "—",
        r.student.id,
      ];
    });

    downloadCsv(
      `Seguimiento_Informes_VibraMusic_${toIsoDate(new Date())}.csv`,
      headers,
      rows,
    );
    toast.success("Seguimiento exportado a CSV (sin datos financieros).");
  };

  // Alumno del diálogo activo
  const activeStudent = useMemo(() => {
    if (!activeStudentId) return null;
    return adminStudents.find((st) => st.id === activeStudentId) || null;
  }, [activeStudentId, adminStudents]);

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileBarChart2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-foreground sm:text-lg">
                Seguimiento Operativo de Informes
              </h1>
              <p className="text-xs text-muted-foreground">
                Control de cobertura de evaluaciones de clase y estado de informes de progreso.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadData(true)}
            disabled={loading || refreshing}
            className="h-8 gap-1.5 text-xs font-bold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredRows.length === 0}
            className="h-8 gap-1.5 text-xs font-bold"
          >
            <Download className="h-3.5 w-3.5 text-primary" />
            <span>Exportar CSV</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Alumnos Activos
          </p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-foreground">{kpis.total}</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Matrículas activas</p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Con Informe
          </p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {kpis.conInforme}
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-0.5 text-[10px] text-emerald-600/80">Generados en ciclo</p>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Listos para Generar
          </p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400">
              {kpis.listos}
            </span>
            <Sparkles className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-0.5 text-[10px] text-amber-600/80">Cumplen mín. evaluaciones</p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
            Falta Evaluación
          </p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-red-700 dark:text-red-400">
              {kpis.insuficientes + kpis.sinEval}
            </span>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
          <p className="mt-0.5 text-[10px] text-red-600/80">
            {kpis.sinEval} sin evaluar · {kpis.insuficientes} insuficientes
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-2xs">
        {/* Búsqueda por texto */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por alumno, docente o instrumento…"
            className="h-8 pl-8 text-xs"
          />
        </div>

        {/* Filtro por Docente */}
        <select
          value={teacherFilter}
          onChange={(e) => setTeacherFilter(e.target.value)}
          className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-semibold text-foreground"
        >
          <option value="todos">Todos los docentes</option>
          {teacherOptions.map((t) => (
            <option key={t} value={t}>
              Prof. {t}
            </option>
          ))}
        </select>

        {/* Filtro por Instrumento */}
        <select
          value={instrumentFilter}
          onChange={(e) => setInstrumentFilter(e.target.value)}
          className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-semibold text-foreground"
        >
          <option value="todos">Todos los instrumentos</option>
          {instrumentOptions.map((inst) => (
            <option key={inst} value={inst}>
              {inst}
            </option>
          ))}
        </select>

        {/* Filtro por Semáforo */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "todos" | ReadinessStatus)}
          className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-semibold text-foreground"
        >
          <option value="todos">Todos los semáforos</option>
          <option value="con_informe">🟢 Con informe</option>
          <option value="listo">🟡 Listo para informe</option>
          <option value="insuficiente">🟠 Insuficiente (&lt; mín)</option>
          <option value="sin_evaluaciones">🔴 Sin evaluaciones</option>
        </select>

        {/* Filtro por Estado de Informe */}
        <select
          value={reportStateFilter}
          onChange={(e) => setReportStateFilter(e.target.value)}
          className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-semibold text-foreground"
        >
          <option value="todos">Todos los estados de informe</option>
          <option value="sin_informe">Sin informe generado</option>
          <option value="draft">Borrador</option>
          <option value="pending">En revisión</option>
          <option value="published">Publicado</option>
          <option value="rejected">Rechazado</option>
        </select>

        {(search ||
          teacherFilter !== "todos" ||
          instrumentFilter !== "todos" ||
          statusFilter !== "todos" ||
          reportStateFilter !== "todos") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setTeacherFilter("todos");
              setInstrumentFilter("todos");
              setStatusFilter("todos");
              setReportStateFilter("todos");
            }}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Contenido Principal */}
      {loading ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card p-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Cargando seguimiento de alumnos…</p>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm font-bold text-foreground">No se encontraron alumnos</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ajusta los filtros de búsqueda para visualizar los registros.
          </p>
        </div>
      ) : (
        <>
          {/* Vista Desktop (Tabla) */}
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-xs md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2.5">Alumno</th>
                    <th className="px-3 py-2.5">Docente</th>
                    <th className="px-3 py-2.5">Instrumento</th>
                    <th className="px-3 py-2.5">Plan</th>
                    <th className="px-3 py-2.5">Evaluaciones</th>
                    <th className="px-3 py-2.5">Semáforo</th>
                    <th className="px-3 py-2.5">Informe Actual</th>
                    <th className="px-3 py-2.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRows.map((row) => {
                    const isGenerating = generatingForStudentId === row.student.id;

                    return (
                      <tr
                        key={row.student.id}
                        className="transition-colors hover:bg-muted/20"
                      >
                        {/* Alumno */}
                        <td className="px-3 py-2.5">
                          <div className="font-bold text-foreground">{row.student.name}</div>
                          {row.student.level && (
                            <span className="text-[10px] text-muted-foreground">
                              {row.student.level}
                            </span>
                          )}
                        </td>

                        {/* Docente */}
                        <td className="px-3 py-2.5 font-medium text-foreground">
                          {row.student.teacher ? `Prof. ${row.student.teacher}` : "—"}
                          {row.hasTeacherDraftCriteria && (
                            <span
                              title="Docente con criterios en borrador"
                              className="ml-1 text-[11px]"
                            >
                              ⚠️
                            </span>
                          )}
                        </td>

                        {/* Instrumento */}
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {row.student.instrument || "—"}
                        </td>

                        {/* Plan */}
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {row.planLabel}
                        </td>

                        {/* Evaluaciones */}
                        <td className="px-3 py-2.5">
                          <div className="font-bold text-foreground">
                            {row.totalEval}{" "}
                            <span className="text-[10px] font-normal text-muted-foreground">
                              / mín. {row.minRequired}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {row.lastEvalDate
                              ? `Últ: ${formatIsoDateShort(row.lastEvalDate)}`
                              : "Sin registros"}
                          </div>
                        </td>

                        {/* Semáforo Operativo */}
                        <td className="px-3 py-2.5">
                          {row.readinessStatus === "con_informe" ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                              🟢 Con informe
                            </span>
                          ) : row.readinessStatus === "listo" ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                              🟡 Listo ({row.totalEval} eval.)
                            </span>
                          ) : row.readinessStatus === "insuficiente" ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[11px] font-bold text-orange-700 dark:text-orange-400">
                              🟠 Insuficiente ({row.totalEval}/{row.minRequired})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-400">
                              🔴 Sin evaluaciones
                            </span>
                          )}
                        </td>

                        {/* Informe Actual */}
                        <td className="px-3 py-2.5">
                          {row.report ? (
                            <div className="space-y-0.5">
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-bold ${
                                  STATUS_BADGES[row.report.status]?.className || ""
                                }`}
                              >
                                {STATUS_BADGES[row.report.status]?.label || row.report.status}
                              </Badge>
                              <div className="text-[10px] text-muted-foreground">
                                {reportKindLabel(row.report.period_type)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Acción */}
                        <td className="px-3 py-2.5 text-right">
                          {row.report ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenExistingReport(row.report!, row.student.id)}
                              className="h-7 gap-1 text-[11px] font-bold"
                            >
                              <Eye className="h-3 w-3 text-primary" />
                              <span>Ver informe</span>
                            </Button>
                          ) : row.readinessStatus === "listo" ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => void handleGenerateDraft(row)}
                              disabled={isGenerating}
                              className="h-7 gap-1 bg-primary text-[11px] font-bold text-primary-foreground hover:bg-primary/90"
                            >
                              {isGenerating ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3" />
                              )}
                              <span>Generar borrador</span>
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              className="h-7 cursor-not-allowed text-[11px] text-muted-foreground opacity-60"
                              title={`Requiere al menos ${row.minRequired} evaluaciones de clase.`}
                            >
                              Faltan eval.
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista Móvil (Tarjetas Compactas) */}
          <div className="space-y-2 md:hidden">
            {filteredRows.map((row) => {
              const isGenerating = generatingForStudentId === row.student.id;

              return (
                <div
                  key={row.student.id}
                  className="space-y-2 rounded-xl border border-border bg-card p-3 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-foreground">{row.student.name}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        {row.student.instrument || "Instrumento"} · Prof. {row.student.teacher || "—"}
                      </p>
                    </div>

                    {/* Semáforo en móvil */}
                    {row.readinessStatus === "con_informe" ? (
                      <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        🟢 Con informe
                      </span>
                    ) : row.readinessStatus === "listo" ? (
                      <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                        🟡 Listo ({row.totalEval})
                      </span>
                    ) : row.readinessStatus === "insuficiente" ? (
                      <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:text-orange-400">
                        🟠 Faltan ({row.totalEval}/{row.minRequired})
                      </span>
                    ) : (
                      <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-400">
                        🔴 Sin eval.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                    <div>
                      <span>{row.totalEval} evaluaciones</span>
                      {row.lastEvalDate && (
                        <span> · Últ: {formatIsoDateShort(row.lastEvalDate)}</span>
                      )}
                    </div>

                    {row.report && (
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-bold ${
                          STATUS_BADGES[row.report.status]?.className || ""
                        }`}
                      >
                        {STATUS_BADGES[row.report.status]?.label || row.report.status}
                      </Badge>
                    )}
                  </div>

                  {/* Botón de acción */}
                  <div className="pt-1">
                    {row.report ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenExistingReport(row.report!, row.student.id)}
                        className="h-8 w-full gap-1.5 text-xs font-bold"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span>Ver informe ({STATUS_BADGES[row.report.status]?.label})</span>
                      </Button>
                    ) : row.readinessStatus === "listo" ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => void handleGenerateDraft(row)}
                        disabled={isGenerating}
                        className="h-8 w-full gap-1.5 bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90"
                      >
                        {isGenerating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                        <span>Generar borrador</span>
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="h-8 w-full cursor-not-allowed text-xs text-muted-foreground opacity-60"
                      >
                        Faltan evaluaciones para informe ({row.totalEval}/{row.minRequired})
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Diálogo unificado de Informe de Progreso */}
      {dialogOpen && activeReport && (
        <ProgressReportDialog
          open={dialogOpen}
          onOpenChange={(nextOpen) => {
            setDialogOpen(nextOpen);
            if (!nextOpen) {
              setActiveReport(null);
              setActiveStudentId(null);
            }
          }}
          report={activeReport}
          onChanged={() => {
            void loadData(true);
          }}
          guardianPhone={activeStudent ? resolveGuardianPhone(activeStudent) : ""}
        />
      )}
    </div>
  );
}

