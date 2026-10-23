/**
 * ================================================================
 * progress-reports-panel.tsx — Bandeja de Informes de Progreso (Fase 5)
 * ================================================================
 *
 * Dirección/Secretaría elige un alumno activo, define el periodo y genera
 * el informe consolidado (evaluaciones + snapshot de asistencia).
 *
 * El informe nace en `draft`; desde el diálogo se edita, se envía a
 * revisión, se publica o se rechaza con motivo.
 *
 * Reglas:
 *   - Solo alumnos activos.
 *   - Cero datos financieros.
 *   - La fuente de verdad es PostgreSQL (`progress_reports`).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Download,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InformesRolloutCard } from "@/components/admin/informes-rollout-card";
import { toast } from "sonner";
import { useAppStore } from "@/store/app-store";
import type {
  LessonEvaluationRow,
  ProgressReportPeriodType,
  ProgressReportRow,
} from "@/lib/informes/types";
import { InformesValidationError, toIsoDate } from "@/lib/informes/utils";
import {
  EVIDENCE_TONE as EVIDENCE_TONE_MAP,
  PERIOD_TYPE_LABELS,
  REPORT_KIND_OPTIONS,
} from "@/lib/informes/report-kinds";
import {
  buildReportPlanContext,
  computeReportReadiness,
  resolveReportWindow,
} from "@/lib/informes/report-readiness";
import { computeStudentCycleSessions } from "@/lib/kardex-calculator";
import { getStudentEvaluations } from "@/lib/services/evaluations.service";
import { resolveActor } from "@/lib/services/teacher-resolver";
import {
  createProgressReport,
  getReportInstrument,
  getReportsForStudent,
  listProgressReports,
} from "@/lib/services/progress-reports.service";
import { formatIsoDateShort } from "@/lib/informes/progress-report-format";
import { ProgressReportDialog } from "@/components/admin/progress-report-dialog";
import { musicalInstruments } from "@/store/admin-seeds";

const STATUS_META: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Borrador",
    className: "border-slate-400/40 bg-slate-500/10 text-slate-600",
  },
  pending: {
    label: "En revisión",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  },
  published: {
    label: "Publicado",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  },
  rejected: {
    label: "Rechazado",
    className: "border-red-500/40 bg-red-500/10 text-red-600",
  },
};

function currentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: toIsoDate(start), end: toIsoDate(end) };
}

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

/**
 * Tipos de informe. La etiqueta corta es para los botones; la descripción
 * explica para qué plan aplica. Viven en `report-kinds.ts` para que la
 * bandeja de Dirección y el portal del docente nunca diverjan.
 */
const KIND_OPTIONS = REPORT_KIND_OPTIONS;

const EVIDENCE_TONE = EVIDENCE_TONE_MAP;

const STATUS_FILTERS = [
  { value: "todos", label: "Todos los estados" },
  { value: "draft", label: "Borradores" },
  { value: "pending", label: "En revisión" },
  { value: "published", label: "Publicados" },
  { value: "rejected", label: "Rechazados" },
] as const;

function csvCell(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

/** Descarga CSV con BOM UTF-8 (compatible con Excel), sin datos financieros. */
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

export function ProgressReportsPanel() {
  const adminStudents = useAppStore((s) => s.adminStudents);
  const currentUser = useAppStore((s) => s.currentUser);
  const activeRole = useAppStore((s) => s.activeRole);

  const activeStudents = useMemo(
    () =>
      [...adminStudents]
        .filter((student) => student.status === "activo")
        .sort((a, b) => a.name.localeCompare(b.name, "es")),
    [adminStudents],
  );

  const [studentId, setStudentId] = useState("");
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState<ProgressReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [periodType, setPeriodType] =
    useState<ProgressReportPeriodType>("mensual");
  const [range, setRange] = useState(currentMonthRange);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<ProgressReportRow | null>(null);

  // Evidencia del alumno seleccionado: sin reportes de clase no hay informe.
  const [studentEvaluations, setStudentEvaluations] = useState<LessonEvaluationRow[]>([]);
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);
  const [rangeKey, setRangeKey] = useState("");

  // ── Fase 6: bandeja general de informes (todos los alumnos activos) ──
  const [inboxReports, setInboxReports] = useState<ProgressReportRow[]>([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxError, setInboxError] = useState<string | null>(null);
  const [inboxStatus, setInboxStatus] = useState("todos");
  const [inboxTeacher, setInboxTeacher] = useState("todos");
  const [inboxInstrument, setInboxInstrument] = useState("todos");
  const [inboxType, setInboxType] = useState("todos");
  const [inboxFrom, setInboxFrom] = useState("");
  const [inboxTo, setInboxTo] = useState("");

  const selectedStudent = useMemo(
    () => activeStudents.find((student) => student.id === studentId) || null,
    [activeStudents, studentId],
  );

  const actor = useMemo(
    () =>
      resolveActor(
        currentUser?.email,
        currentUser?.name || (activeRole === "staff" ? "Secretaría" : "Dirección"),
        activeRole,
      ),
    [activeRole, currentUser?.email, currentUser?.name],
  );

  useEffect(() => {
    if (!studentId && activeStudents.length > 0) {
      setStudentId(activeStudents[0].id);
    }
  }, [activeStudents, studentId]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return activeStudents;
    return activeStudents.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        String(student.instrument || "").toLowerCase().includes(query),
    );
  }, [activeStudents, search]);

  // ── Evidencia real: reportes de clase del alumno seleccionado ──
  useEffect(() => {
    let cancelled = false;
    if (!studentId) {
      setStudentEvaluations([]);
      return;
    }
    setEvaluationsLoading(true);
    getStudentEvaluations(studentId)
      .then((rows) => {
        if (!cancelled) setStudentEvaluations(rows);
      })
      .catch(() => {
        if (!cancelled) setStudentEvaluations([]);
      })
      .finally(() => {
        if (!cancelled) setEvaluationsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  /**
   * Plan real, ventana sugerida y evidencia del alumno. Un informe es el
   * consolidado de varios reportes de clase: sin el mínimo no se habilita.
   */
  const readiness = useMemo(() => {
    if (!selectedStudent) return null;
    const sessions = computeStudentCycleSessions({
      student: selectedStudent,
      allSchedule: selectedStudent.scheduleLessons || [],
    });
    const plan = buildReportPlanContext(selectedStudent, sessions, []);
    const window = resolveReportWindow({
      plan,
      sessions,
      evaluations: studentEvaluations,
      kind: periodType,
    });
    const evidence = computeReportReadiness({
      plan,
      sessions,
      evaluations: studentEvaluations,
      periodStart: window.start,
      periodEnd: window.end,
      kind: periodType,
    });
    return { plan, window, evidence };
  }, [periodType, selectedStudent, studentEvaluations]);

  // La ventana sugerida se aplica al cambiar de alumno o de tipo de informe;
  // después el usuario puede ajustar las fechas a mano.
  useEffect(() => {
    if (!readiness) return;
    const key = `${studentId}|${periodType}`;
    if (rangeKey === key) return;
    setRange(readiness.window);
    setRangeKey(key);
  }, [periodType, rangeKey, readiness, studentId]);

  const loadReports = useCallback(async () => {
    if (!studentId) {
      setReports([]);
      return;
    }
    try {
      setLoading(true);
      setLoadError(null);
      const rows = await getReportsForStudent(studentId);
      setReports(rows);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "No se pudo leer el historial de informes.",
      );
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  // ── Fase 6: carga de la bandeja general (producción, sin `is_test`) ──
  const loadInbox = useCallback(async () => {
    try {
      setInboxLoading(true);
      setInboxError(null);
      const rows = await listProgressReports({
        status: inboxStatus === "todos" ? "" : inboxStatus,
        teacherName: inboxTeacher === "todos" ? "" : inboxTeacher,
        instrument: inboxInstrument === "todos" ? "" : inboxInstrument,
        periodType:
          inboxType === "todos" ? "" : (inboxType as ProgressReportPeriodType),
        periodFrom: inboxFrom,
        periodTo: inboxTo,
        limit: 400,
      });
      setInboxReports(rows);
    } catch (error) {
      setInboxError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la bandeja general de informes.",
      );
    } finally {
      setInboxLoading(false);
    }
  }, [
    inboxStatus,
    inboxTeacher,
    inboxInstrument,
    inboxType,
    inboxFrom,
    inboxTo,
  ]);

  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  const inboxCounts = useMemo(
    () => ({
      draft: inboxReports.filter((report) => report.status === "draft").length,
      pending: inboxReports.filter((report) => report.status === "pending").length,
      published: inboxReports.filter((report) => report.status === "published").length,
      rejected: inboxReports.filter((report) => report.status === "rejected").length,
    }),
    [inboxReports],
  );

  const studentById = useMemo(() => {
    const map = new Map<string, (typeof adminStudents)[number]>();
    for (const student of adminStudents) map.set(student.id, student);
    return map;
  }, [adminStudents]);

  const activeReportStudent = useMemo(() => {
    const id = activeReport?.student_id;
    if (!id) return null;
    return studentById.get(id) || null;
  }, [activeReport, studentById]);

  const inboxHasFilters =
    inboxStatus !== "todos" ||
    inboxTeacher !== "todos" ||
    inboxInstrument !== "todos" ||
    inboxType !== "todos" ||
    Boolean(inboxFrom) ||
    Boolean(inboxTo);

  const resetInboxFilters = () => {
    setInboxStatus("todos");
    setInboxTeacher("todos");
    setInboxInstrument("todos");
    setInboxType("todos");
    setInboxFrom("");
    setInboxTo("");
  };

  const handleExportInboxCsv = () => {
    if (inboxReports.length === 0) {
      toast.warning("No hay informes en la bandeja para exportar.");
      return;
    }
    const headers = [
      "N°",
      "Alumno",
      "Instrumento",
      "Docente",
      "Tipo de periodo",
      "Inicio del periodo",
      "Fin del periodo",
      "Estado",
      "Publicado por",
      "Fecha de publicación",
      "Última actualización",
      "ID del alumno",
      "ID del informe",
    ];
    const rows = inboxReports.map((report, index) => {
      const student = report.student_id ? studentById.get(report.student_id) : null;
      return [
        index + 1,
        report.student_name_snapshot || student?.name || "—",
        getReportInstrument(report) || student?.instrument || "—",
        report.teacher_name || "—",
        PERIOD_TYPE_LABELS[report.period_type] || report.period_type,
        report.period_start,
        report.period_end,
        STATUS_META[report.status]?.label || report.status,
        report.published_by_name || "—",
        report.published_at ? report.published_at.slice(0, 10) : "—",
        report.updated_at ? report.updated_at.slice(0, 10) : "—",
        report.student_id || "—",
        report.id,
      ];
    });
    downloadCsv(
      `Bandeja_Informes_Progreso_VibraMusic_${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
    );
    toast.success("Bandeja exportada en CSV (sin datos financieros).");
  };

  const counts = useMemo(
    () => ({
      draft: reports.filter((report) => report.status === "draft").length,
      pending: reports.filter((report) => report.status === "pending").length,
      published: reports.filter((report) => report.status === "published").length,
      rejected: reports.filter((report) => report.status === "rejected").length,
    }),
    [reports],
  );

  const handleGenerate = async () => {
    if (!studentId) {
      toast.error("Elige un alumno para generar el informe.");
      return;
    }
    if (!range.start || !range.end) {
      toast.error("Indica el inicio y el fin del periodo.");
      return;
    }
    if (range.start > range.end) {
      toast.error("La fecha de inicio no puede ser posterior al fin.");
      return;
    }
    // Un informe es el consolidado de varios reportes de clase: sin el
    // mínimo no hay nada que consolidar.
    if (readiness && !readiness.evidence.canGenerate) {
      toast.error(readiness.evidence.message);
      return;
    }

    const existing = reports.find(
      (report) =>
        report.period_type === periodType &&
        report.period_start === range.start &&
        report.period_end === range.end,
    );
    if (existing) {
      toast.info("Ya existe un informe para ese periodo. Se abrirá el existente.");
      setActiveReport(existing);
      setDialogOpen(true);
      return;
    }

    try {
      setCreating(true);
      const created = await createProgressReport(
        studentId,
        { type: periodType, start: range.start, end: range.end },
        { actor, isTest: false },
      );
      setReports((prev) => [created, ...prev]);
      setActiveReport(created);
      setDialogOpen(true);
      toast.success("Informe creado en borrador. Revísalo y envíalo a Dirección.");
    } catch (error) {
      toast.error(
        error instanceof InformesValidationError
          ? error.message
          : "No se pudo generar el informe. Revisa la conexión con PostgreSQL.",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              Informes de Progreso
              <Badge
                variant="outline"
                className="border-primary/40 bg-primary/10 text-[10px] font-black text-primary"
              >
                BETA
              </Badge>
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Consolida las evaluaciones de clase y la asistencia del periodo. Nada
              llega a la familia hasta que Dirección publique el informe.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                ["draft", "Borradores"],
                ["pending", "En revisión"],
                ["published", "Publicados"],
                ["rejected", "Rechazados"],
              ] as const
            ).map(([key, label]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[10px] font-bold text-muted-foreground"
              >
                {label}
                <span className="rounded-full bg-muted px-1.5 text-[10px] font-black text-foreground">
                  {counts[key]}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Alumno */}
        <div className="mt-3 grid gap-2 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-1.5">
            <label
              htmlFor="progress-report-student-search"
              className="text-[10px] font-black uppercase tracking-wide text-muted-foreground"
            >
              Alumno activo
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="progress-report-student-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre o instrumento…"
                className="h-9 pl-8 text-xs"
                autoComplete="off"
              />
            </div>
            <select
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm text-foreground"
            >
              {filteredStudents.length === 0 && (
                <option value="">Sin alumnos que coincidan…</option>
              )}
              {filteredStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                  {student.instrument ? ` · ${student.instrument}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
              Periodo del informe
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {KIND_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPeriodType(option.value)}
                  title={option.hint}
                  className={`rounded-lg border px-2 py-1.5 text-[11px] font-bold transition-all ${
                    periodType === option.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] leading-snug text-muted-foreground">
              {KIND_OPTIONS.find((option) => option.value === periodType)?.hint}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <Input
                type="date"
                value={range.start}
                onChange={(event) =>
                  setRange((prev) => ({ ...prev, start: event.target.value }))
                }
                className="h-8 text-[11px]"
                aria-label="Inicio del periodo"
              />
              <Input
                type="date"
                value={range.end}
                onChange={(event) =>
                  setRange((prev) => ({ ...prev, end: event.target.value }))
                }
                className="h-8 text-[11px]"
                aria-label="Fin del periodo"
              />
            </div>
            {readiness && (
              <div
                className={`flex items-start gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] leading-snug ${
                  EVIDENCE_TONE[readiness.evidence.level] ||
                  EVIDENCE_TONE["insuficiente"]
                }`}
              >
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-current" />
                <span>
                  <strong>{readiness.evidence.label}</strong>
                  {readiness.plan.planType ? ` · ${readiness.plan.planType}` : ""}
                  {` · ${readiness.evidence.evaluated}/${readiness.evidence.attended} clases con reporte`}
                  <br />
                  {evaluationsLoading
                    ? "Leyendo reportes de clase…"
                    : readiness.evidence.message}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            {formatIsoDateShort(range.start)} – {formatIsoDateShort(range.end)}
            {selectedStudent ? ` · ${selectedStudent.name}` : ""}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadReports()}
              disabled={loading || !studentId}
              className="h-8 gap-1.5 text-[11px] font-bold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void handleGenerate()}
              disabled={creating || !studentId || readiness?.evidence.canGenerate === false}
              title={
                readiness && !readiness.evidence.canGenerate
                  ? readiness.evidence.message
                  : undefined
              }
              className="h-8 gap-1.5 text-[11px] font-bold"
            >
              {creating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Generar informe
            </Button>
          </div>
        </div>
        {readiness && !readiness.evidence.canGenerate && (
          <p className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/5 px-2 py-1.5 text-[10px] font-semibold leading-snug text-amber-700">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            <span>{readiness.evidence.message}</span>
          </p>
        )}
      </div>

      {loadError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-600">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {!loadError && !loading && reports.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
          <FileText className="mx-auto h-5 w-5 text-muted-foreground" />
          <p className="mt-2 text-xs font-semibold text-foreground">
            {studentId
              ? "Este alumno todavía no tiene informes."
              : "Elige un alumno para comenzar."}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Genera el informe del periodo: se creará en borrador para revisarlo.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {reports.map((report) => {
          const meta = STATUS_META[report.status] || STATUS_META.draft;
          return (
            <div
              key={report.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-3 shadow-xs"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground">
                  {report.period_type === "trimestral" ? "Trimestre" : "Mes"} ·{" "}
                  {formatIsoDateShort(report.period_start)} –{" "}
                  {formatIsoDateShort(report.period_end)}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Docente: {report.teacher_name || "—"}
                  {report.published_by_name
                    ? ` · Publicado por ${report.published_by_name}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-black ${meta.className}`}
                >
                  {meta.label}
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveReport(report);
                    setDialogOpen(true);
                  }}
                  className="h-8 text-[11px] font-bold"
                >
                  Abrir
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Despliegue (Fase 7): flags reales, piloto y criterios pendientes ── */}
      <InformesRolloutCard />

      {/* ── Bandeja general (Fase 6): estado, docente, instrumento, periodo + CSV ── */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              Bandeja general de informes
              <Badge
                variant="outline"
                className="border-sky-500/40 bg-sky-500/10 text-[10px] font-black text-sky-600"
              >
                FASE 6
              </Badge>
            </h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Todos los informes de producción (nunca datos de prueba). Filtra por
              estado, docente, instrumento y periodo, y exporta la vista a CSV.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                ["draft", "Borradores"],
                ["pending", "En revisión"],
                ["published", "Publicados"],
                ["rejected", "Rechazados"],
              ] as const
            ).map(([key, label]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[10px] font-bold text-muted-foreground"
              >
                {label}
                <span className="rounded-full bg-muted px-1.5 text-[10px] font-black text-foreground">
                  {inboxCounts[key]}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_1fr_auto_auto]">
          <select
            value={inboxStatus}
            onChange={(event) => setInboxStatus(event.target.value)}
            aria-label="Filtrar por estado del informe"
            className="h-9 rounded-lg border border-border bg-background px-2 text-[11px] font-bold text-foreground"
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={inboxType}
            onChange={(event) => setInboxType(event.target.value)}
            aria-label="Filtrar por tipo de informe"
            className="h-9 rounded-lg border border-border bg-background px-2 text-[11px] font-bold text-foreground"
          >
            <option value="todos">Todos los tipos</option>
            {KIND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={inboxTeacher}
            onChange={(event) => setInboxTeacher(event.target.value)}
            aria-label="Filtrar por docente"
            className="h-9 rounded-lg border border-border bg-background px-2 text-[11px] font-bold text-foreground"
          >
            <option value="todos">Todos los docentes</option>
            <option value="Jeremy">Jeremy</option>
            <option value="Fernando">Fernando</option>
            <option value="Nathaly">Nathaly</option>
            <option value="Claudia">Claudia</option>
          </select>

          <select
            value={inboxInstrument}
            onChange={(event) => setInboxInstrument(event.target.value)}
            aria-label="Filtrar por instrumento"
            className="h-9 rounded-lg border border-border bg-background px-2 text-[11px] font-bold text-foreground"
          >
            <option value="todos">Todos los instrumentos</option>
            {musicalInstruments.map((instrument) => (
              <option key={instrument} value={instrument}>
                {instrument}
              </option>
            ))}
          </select>

          <Input
            type="date"
            value={inboxFrom}
            onChange={(event) => setInboxFrom(event.target.value)}
            className="h-9 text-[11px]"
            aria-label="Periodo desde"
          />
          <Input
            type="date"
            value={inboxTo}
            onChange={(event) => setInboxTo(event.target.value)}
            className="h-9 text-[11px]"
            aria-label="Periodo hasta"
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
          <span>
            Mostrando{" "}
            <strong className="text-foreground">{inboxReports.length}</strong>{" "}
            informe(s)
            {inboxHasFilters ? " con los filtros aplicados" : " de todos los alumnos"}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {inboxHasFilters && (
              <button
                type="button"
                onClick={resetInboxFilters}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                Limpiar filtros
              </button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadInbox()}
              disabled={inboxLoading}
              className="h-7 gap-1.5 text-[10px] font-bold"
            >
              <RefreshCw className={`h-3 w-3 ${inboxLoading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleExportInboxCsv}
              disabled={inboxLoading || inboxReports.length === 0}
              className="h-7 gap-1.5 text-[10px] font-bold"
            >
              <Download className="h-3 w-3" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {inboxError && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-600">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{inboxError}</span>
          </div>
        )}

        {!inboxError && inboxLoading && inboxReports.length === 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Cargando informes desde PostgreSQL…
          </p>
        )}

        {!inboxError && !inboxLoading && inboxReports.length === 0 && (
          <p className="mt-3 rounded-xl border border-dashed border-border p-4 text-center text-[11px] text-muted-foreground">
            No hay informes que coincidan. Genera uno arriba o ajusta los filtros.
          </p>
        )}

        <div className="mt-3 space-y-1.5">
          {inboxReports.map((report) => {
            const meta = STATUS_META[report.status] || STATUS_META.draft;
            const student = report.student_id
              ? studentById.get(report.student_id)
              : null;
            const instrument =
              getReportInstrument(report) || student?.instrument || "—";
            return (
              <div
                key={report.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background p-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-foreground">
                    {report.student_name_snapshot || student?.name || "Alumno"}
                    <span className="ml-1.5 text-[10px] font-semibold text-muted-foreground">
                      · {instrument}
                    </span>
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {PERIOD_TYPE_LABELS[report.period_type] || report.period_type} ·{" "}
                    {formatIsoDateShort(report.period_start)} –{" "}
                    {formatIsoDateShort(report.period_end)} · Docente:{" "}
                    {report.teacher_name || "—"}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    Actualizado:{" "}
                    {report.updated_at
                      ? formatIsoDateShort(report.updated_at.slice(0, 10))
                      : "—"}
                    {report.published_by_name
                      ? ` · Publicado por ${report.published_by_name}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-black ${meta.className}`}
                  >
                    {meta.label}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveReport(report);
                      setDialogOpen(true);
                    }}
                    className="h-8 text-[11px] font-bold"
                  >
                    Abrir
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ProgressReportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        report={activeReport}
        guardianPhone={
          activeReportStudent ? resolveGuardianPhone(activeReportStudent) : null
        }
        onChanged={() => {
          void loadReports();
          void loadInbox();
        }}
      />
    </div>
  );
}
