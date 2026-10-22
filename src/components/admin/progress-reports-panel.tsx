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
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAppStore } from "@/store/app-store";
import type { ProgressReportPeriodType, ProgressReportRow } from "@/lib/informes/types";
import { InformesValidationError, toIsoDate } from "@/lib/informes/utils";
import { resolveActor } from "@/lib/services/teacher-resolver";
import {
  createProgressReport,
  getReportsForStudent,
} from "@/lib/services/progress-reports.service";
import { formatIsoDateShort } from "@/lib/informes/progress-report-format";
import { ProgressReportDialog } from "@/components/admin/progress-report-dialog";

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
              <button
                type="button"
                onClick={() => setPeriodType("mensual")}
                className={`rounded-lg border px-2 py-1.5 text-[11px] font-bold transition-all ${
                  periodType === "mensual"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                Mensual
              </button>
              <button
                type="button"
                onClick={() => setPeriodType("trimestral")}
                className={`rounded-lg border px-2 py-1.5 text-[11px] font-bold transition-all ${
                  periodType === "trimestral"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                Trimestral
              </button>
            </div>
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
              disabled={creating || !studentId}
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

      <ProgressReportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        report={activeReport}
        guardianPhone={
          selectedStudent ? resolveGuardianPhone(selectedStudent) : null
        }
        onChanged={() => {
          void loadReports();
        }}
      />
    </div>
  );
}
