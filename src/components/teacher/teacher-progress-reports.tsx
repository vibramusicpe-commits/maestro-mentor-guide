/**
 * ================================================================
 * teacher-progress-reports.tsx — Informes del docente (Fase C)
 * ================================================================
 *
 * El docente consolida SUS reportes de clase en un borrador de informe y lo
 * envía a revisión. **Nunca publica**: la publicación sigue siendo exclusiva
 * de Dirección (ADR-0175, Fase 3).
 *
 * Reglas:
 *   - Solo ve a sus propios alumnos (`useTeacherIdentity.teacherStudentList`).
 *   - Un informe es el consolidado de varios reportes de clase: sin el mínimo
 *     de 2 (1 en Demo/Personalizado) no se genera nada.
 *   - Solo puede guardar `draft` o enviar a `pending`. La bandeja no importa
 *     `approveProgressReport` ni `publishProgressReport`.
 *   - Cero datos financieros.
 *   - Fuente de verdad: PostgreSQL.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StudentPicker } from "@/components/teacher/student-picker";
import { ClassLog, type ClassLogSeed } from "@/components/teacher/class-log";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTeacherIdentity } from "@/hooks/use-teacher-identity";
import { useTeacherPilotAccess } from "@/hooks/use-teacher-pilot-access";
import { useAppStore } from "@/store/app-store";
import { computeStudentCycleSessions } from "@/lib/kardex-calculator";
import {
  buildReportPlanContext,
  computeReportReadiness,
  resolveReportWindow,
} from "@/lib/informes/report-readiness";
import {
  EVIDENCE_TONE,
  REPORT_KIND_OPTIONS,
  reportKindHint,
  reportKindLabel,
} from "@/lib/informes/report-kinds";
import type {
  LessonEvaluationRow,
  ProgressReportPeriodType,
  ProgressReportRow,
} from "@/lib/informes/types";
import { InformesValidationError } from "@/lib/informes/utils";
import { formatIsoDateShort } from "@/lib/informes/progress-report-format";
import { getStudentEvaluations } from "@/lib/services/evaluations.service";
import {
  createProgressReport,
  listProgressReports,
  updateProgressReport,
} from "@/lib/services/progress-reports.service";
import { resolveActor } from "@/lib/services/teacher-resolver";

const STATUS_META: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Borrador",
    className: "border-slate-400/40 bg-slate-500/10 text-slate-600",
  },
  pending: {
    label: "En revisión",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-700",
  },
  published: {
    label: "Publicado",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
  },
  rejected: {
    label: "Rechazado",
    className: "border-red-500/40 bg-red-500/10 text-red-700",
  },
};

const NARRATIVE_FIELDS = [
  { key: "strengths", label: "Fortalezas observadas" },
  { key: "goals", label: "Objetivos del periodo" },
  { key: "recommendations", label: "Recomendaciones para casa" },
  { key: "family_message", label: "Mensaje para la familia" },
] as const;

type NarrativeKey = (typeof NARRATIVE_FIELDS)[number]["key"];

export function TeacherProgressReports({
  initialStudentId,
}: {
  /** Alumno preseleccionado cuando se llega desde el directorio docente. */
  initialStudentId?: string | undefined;
} = {}) {
  const {
    currentUser,
    adminStudents,
    schedule,
    teacherId,
    teacherDisplayName,
    teacherClean,
    teacherStudentList,
  } = useTeacherIdentity();
  const { loading: accessLoading, progressReportsAccess, isPilotTeacher } =
    useTeacherPilotAccess(teacherId);
  const activeRole = useAppStore((s) => s.activeRole);

  const [studentId, setStudentId] = useState(initialStudentId || "");
  const [kind, setKind] = useState<ProgressReportPeriodType>("mensual");
  const [range, setRange] = useState({ start: "", end: "" });
  const [rangeKey, setRangeKey] = useState("");

  const [evaluations, setEvaluations] = useState<LessonEvaluationRow[]>([]);
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);
  const [classLogSeed, setClassLogSeed] = useState<ClassLogSeed | null>(null);

  const [myReports, setMyReports] = useState<ProgressReportRow[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [draftReport, setDraftReport] = useState<ProgressReportRow | null>(null);
  const [narrative, setNarrative] = useState<Record<NarrativeKey, string>>({
    strengths: "",
    goals: "",
    recommendations: "",
    family_message: "",
  });

  // ── Solo alumnos activos del propio docente ──
  const myStudents = useMemo(
    () => teacherStudentList.filter((student) => student.status === "activo"),
    [teacherStudentList],
  );

  const myStudentIds = useMemo(
    () => new Set(myStudents.map((student) => student.id)),
    [myStudents],
  );

  const selectedStudent = useMemo(
    () => myStudents.find((student) => student.id === studentId) || null,
    [myStudents, studentId],
  );

  const actor = useMemo(
    () =>
      resolveActor(
        currentUser?.email,
        currentUser?.name || teacherDisplayName,
        activeRole,
      ),
    [activeRole, currentUser?.email, currentUser?.name, teacherDisplayName],
  );

  // ── Reportes de clase del alumno elegido ──
  const loadEvaluations = useCallback(async () => {
    if (!studentId) {
      setEvaluations([]);
      return;
    }
    setEvaluationsLoading(true);
    try {
      const rows = await getStudentEvaluations(studentId);
      setEvaluations(rows);
    } catch {
      setEvaluations([]);
    } finally {
      setEvaluationsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void loadEvaluations();
  }, [loadEvaluations]);

  /**
   * Plan real, ventana sugerida y evidencia. Misma función pura que usa
   * Dirección: si aquí dijera algo distinto, el docente generaría un informe
   * que Dirección no podría conciliar.
   */
  const readiness = useMemo(() => {
    if (!selectedStudent) return null;
    const sessions = computeStudentCycleSessions({
      student: selectedStudent,
      allSchedule: selectedStudent.scheduleLessons || [],
    });
    const plan = buildReportPlanContext(selectedStudent, sessions, evaluations);
    const window = resolveReportWindow({
      plan,
      sessions,
      evaluations,
      kind,
    });
    const evidence = computeReportReadiness({
      plan,
      sessions,
      evaluations,
      periodStart: window.start,
      periodEnd: window.end,
      kind,
    });
    return { plan, window, evidence };
  }, [evaluations, kind, selectedStudent]);

  // ── Sesiones asistidas del ciclo para registro retroactivo de clases ──
  const attendedSessions = useMemo(() => {
    if (!selectedStudent) return [];
    const sessions = computeStudentCycleSessions({
      student: selectedStudent,
      allSchedule: selectedStudent.scheduleLessons || [],
    });
    // Filtrar sesiones asistidas (presente o tarde)
    const attended = sessions.filter(
      (s) => s.status === "presente" || s.status === "tarde",
    );
    // En intensivo los dos bloques de 45 min se consolidan por fecha
    const isIntensive = readiness?.plan.isIntensive;
    if (isIntensive) {
      const seen = new Set<string>();
      return attended.filter((s) => {
        if (seen.has(s.dateStr)) return false;
        seen.add(s.dateStr);
        return true;
      });
    }
    return attended;
  }, [readiness?.plan.isIntensive, selectedStudent]);

  // La ventana sugerida se aplica al cambiar de alumno o de tipo.
  useEffect(() => {
    if (!readiness) return;
    const key = `${studentId}|${kind}`;
    if (rangeKey === key) return;
    setRange(readiness.window);
    setRangeKey(key);
  }, [kind, rangeKey, readiness, studentId]);

  // ── Mis informes (solo de mis alumnos) ──
  const loadMyReports = useCallback(async () => {
    try {
      setReportsLoading(true);
      const rows = await listProgressReports({ limit: 300 });
      setMyReports(
        rows.filter((row) => Boolean(row.student_id) && myStudentIds.has(row.student_id as string)),
      );
    } catch {
      setMyReports([]);
    } finally {
      setReportsLoading(false);
    }
  }, [myStudentIds]);

  useEffect(() => {
    if (!progressReportsAccess) return;
    void loadMyReports();
  }, [loadMyReports, progressReportsAccess]);

  const studentById = useMemo(() => {
    const map = new Map<string, (typeof adminStudents)[number]>();
    for (const student of adminStudents) map.set(student.id, student);
    return map;
  }, [adminStudents]);

  const openEditor = (report: ProgressReportRow) => {
    setDraftReport(report);
    setNarrative({
      strengths: report.strengths || "",
      goals: report.goals || "",
      recommendations: report.recommendations || "",
      family_message: report.family_message || "",
    });
  };

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
    if (readiness && !readiness.evidence.canGenerate) {
      toast.error(readiness.evidence.message);
      return;
    }

    try {
      setCreating(true);
      const created = await createProgressReport(
        studentId,
        { type: kind, start: range.start, end: range.end },
        { actor, isTest: false },
      );
      setMyReports((prev) => [created, ...prev.filter((row) => row.id !== created.id)]);
      openEditor(created);
      toast.success("Borrador creado. Complétalo y envíalo a Dirección.");
    } catch (error) {
      toast.error(
        error instanceof InformesValidationError
          ? error.message
          : "No se pudo generar el borrador. Revisa la conexión con PostgreSQL.",
      );
    } finally {
      setCreating(false);
    }
  };

  const saveNarrative = async (report: ProgressReportRow, sendToReview: boolean) => {
    if (sendToReview) {
      const hasContent = NARRATIVE_FIELDS.some((field) =>
        (narrative[field.key] || "").trim(),
      );
      if (!hasContent) {
        toast.error("Escribe al menos una sección antes de enviar a revisión.");
        return;
      }
    }
    try {
      setSavingId(report.id);
      const updated = await updateProgressReport(
        report.id,
        {
          strengths: narrative.strengths.trim() || null,
          goals: narrative.goals.trim() || null,
          recommendations: narrative.recommendations.trim() || null,
          family_message: narrative.family_message.trim() || null,
          status: sendToReview ? "pending" : "draft",
        },
        actor,
      );
      setMyReports((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row)),
      );
      setDraftReport(updated);
      toast.success(
        sendToReview
          ? "Enviado a Dirección para revisión."
          : "Borrador guardado.",
      );
    } catch (error) {
      toast.error(
        error instanceof InformesValidationError
          ? error.message
          : "No se pudo guardar el informe.",
      );
    } finally {
      setSavingId(null);
    }
  };

  if (accessLoading) {
    return (
      <div className="space-y-2">
        <h1 className="text-lg font-black text-foreground">Informes de progreso</h1>
        <p className="text-xs text-muted-foreground">Verificando permisos…</p>
      </div>
    );
  }

  if (!progressReportsAccess) {
    return (
      <div className="space-y-3">
        <h1 className="text-lg font-black text-foreground">Informes de progreso</h1>
        <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Los informes de progreso todavía no están habilitados para tu cuenta.
            Dirección los abrirá cuando corresponda.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-lg font-black text-foreground">Informes de progreso</h1>
          <p className="text-xs text-muted-foreground">
            El informe consolida tus reportes de clase. Dirección revisa y publica
            antes de que llegue a la familia.
          </p>
        </div>
        {isPilotTeacher && (
          <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
            Piloto
          </span>
        )}
      </div>

      {myStudents.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          Aún no tienes alumnos activos con horario asignado.
        </p>
      ) : (
        <section className="space-y-2 rounded-2xl border border-border bg-card p-3">
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
            Nuevo informe
          </p>
          <StudentPicker
            id="teacher-report-student"
            students={myStudents}
            value={studentId}
            onChange={(next) => {
              setStudentId(next);
              setDraftReport(null);
            }}
            placeholder="Buscar mi alumno por nombre o instrumento…"
            hint="Solo aparecen tus alumnos activos."
          />

          {readiness && (
            <>
              <div className="grid grid-cols-2 gap-1.5">
                {REPORT_KIND_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setKind(option.value)}
                    title={option.hint}
                    className={`min-h-[44px] rounded-xl border px-2 text-xs font-bold transition-colors ${
                      kind === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs leading-snug text-muted-foreground">
                {reportKindHint(kind)}
              </p>

              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="date"
                  value={range.start}
                  onChange={(event) =>
                    setRange((prev) => ({ ...prev, start: event.target.value }))
                  }
                  aria-label="Inicio del periodo"
                  className="h-11 rounded-xl border border-border bg-background px-2 text-xs text-foreground"
                />
                <input
                  type="date"
                  value={range.end}
                  onChange={(event) =>
                    setRange((prev) => ({ ...prev, end: event.target.value }))
                  }
                  aria-label="Fin del periodo"
                  className="h-11 rounded-xl border border-border bg-background px-2 text-xs text-foreground"
                />
              </div>

              <div
                className={`flex items-start gap-2 rounded-xl border px-2.5 py-2 text-xs leading-snug ${
                  EVIDENCE_TONE[readiness.evidence.level] ||
                  EVIDENCE_TONE["insuficiente"]
                }`}
              >
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-current" />
                <span>
                  <strong>{readiness.evidence.label}</strong>
                  {` · ${readiness.evidence.evaluated}/${readiness.evidence.attended} clases con reporte`}
                  <br />
                  {evaluationsLoading
                    ? "Leyendo tus reportes de clase…"
                    : readiness.evidence.message}
                </span>
              </div>

              {/* Clases asistidas del periodo para evaluar o revisar */}
              {attendedSessions.length > 0 && (
                <div className="space-y-2 rounded-2xl border border-border/80 bg-background/80 p-3 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-black text-foreground">
                        Clases asistidas de este periodo ({attendedSessions.length})
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {readiness.evidence.evaluated >= 2
                          ? "✓ Mínimo cubierto. Puedes registrar más clases si deseas."
                          : "Evalúa al menos 2 clases para desbloquear el informe."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setClassLogSeed({
                          studentId: selectedStudent.id,
                          studentName: selectedStudent.name,
                          sessionDate: new Date().toISOString().slice(0, 10),
                          startTime: "16:00",
                          durationMin: readiness.plan.isIntensive ? 90 : 45,
                          instrument: selectedStudent.instrument,
                          nonce: Date.now(),
                        });
                      }}
                      className="shrink-0 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/10"
                    >
                      + Otra fecha
                    </button>
                  </div>

                  <div className="max-h-56 divide-y divide-border/60 overflow-y-auto rounded-xl border border-border/60 bg-muted/20">
                    {attendedSessions.map((session) => {
                      const evalForSession = evaluations.find(
                        (ev) => ev.session_date === session.dateStr,
                      );
                      const isEvaluated = Boolean(evalForSession);

                      return (
                        <div
                          key={`${session.dateStr}-${session.time}`}
                          className="flex items-center justify-between gap-2 p-2 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-foreground">
                                {session.dayShort} {formatIsoDateShort(session.dateStr)}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                · {session.time}
                              </span>
                              {session.isMakeup && (
                                <span className="rounded bg-amber-500/10 px-1 text-[10px] font-bold text-amber-700">
                                  Recup.
                                </span>
                              )}
                            </div>
                            {isEvaluated ? (
                              <p className="truncate text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                ✓ Evaluada ({evalForSession?.overall_status ? evalForSession.overall_status.replace("_", " ") : "registrada"})
                                {evalForSession?.topic ? ` · ${evalForSession.topic}` : ""}
                              </p>
                            ) : (
                              <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                ⚠️ Sin reporte de clase
                              </p>
                            )}
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant={isEvaluated ? "outline" : "default"}
                            onClick={() => {
                              setClassLogSeed({
                                studentId: selectedStudent.id,
                                studentName: selectedStudent.name,
                                sessionDate: session.dateStr,
                                startTime: session.time,
                                durationMin: readiness.plan.isIntensive ? 90 : 45,
                                instrument: session.instrument || selectedStudent.instrument,
                                nonce: Date.now(),
                              });
                            }}
                            className={`h-8 shrink-0 text-xs font-bold ${
                              isEvaluated
                                ? "border-border text-foreground hover:bg-muted"
                                : "bg-primary text-primary-foreground shadow-xs"
                            }`}
                          >
                            {isEvaluated ? "Ver / Editar" : "✏️ Evaluar"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={creating || !readiness.evidence.canGenerate}
                className="min-h-[44px] w-full gap-2 text-xs font-black"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {readiness.evidence.canGenerate
                  ? "Generar borrador del informe"
                  : "Faltan reportes de clase"}
              </Button>
              {readiness.evidence.canGenerate && (
                <p className="text-xs text-muted-foreground">
                  {readiness.evidence.coverage !== null
                    ? `Cobertura: ${readiness.evidence.coverage}% de las clases asistidas.`
                    : "Puedes generar el informe y completarlo antes de enviarlo."}
                </p>
              )}
            </>
          )}
        </section>
      )}

      {draftReport && (
        <section className="space-y-2 rounded-2xl border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-primary">
                {STATUS_META[draftReport.status]?.label || draftReport.status}
              </p>
              <p className="truncate text-xs font-bold text-foreground">
                {draftReport.student_name_snapshot}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {reportKindLabel(draftReport.period_type)} ·{" "}
                {formatIsoDateShort(draftReport.period_start)} –{" "}
                {formatIsoDateShort(draftReport.period_end)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDraftReport(null)}
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Cerrar
            </button>
          </div>

          {draftReport.status === "published" ? (
            <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-2 text-xs font-semibold text-emerald-700">
              Este informe ya fue publicado por Dirección y no se puede editar.
            </p>
          ) : draftReport.status === "pending" ? (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-2 text-xs font-semibold text-amber-700">
              En revisión por Dirección. Si necesitas corregirlo, vuelve a guardarlo
              como borrador.
            </p>
          ) : null}

          {draftReport.status === "rejected" && draftReport.rejection_reason && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-2.5 py-2 text-xs font-semibold text-red-700">
              Motivo del rechazo: {draftReport.rejection_reason}
            </p>
          )}

          <div className="space-y-2">
            {NARRATIVE_FIELDS.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-1 block text-xs font-bold text-foreground">
                  {field.label}
                </span>
                <textarea
                  value={narrative[field.key]}
                  onChange={(event) =>
                    setNarrative((prev) => ({
                      ...prev,
                      [field.key]: event.target.value,
                    }))
                  }
                  rows={3}
                  disabled={draftReport.status === "published"}
                  className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs text-foreground disabled:opacity-60"
                />
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void saveNarrative(draftReport, false)}
              disabled={savingId === draftReport.id || draftReport.status === "published"}
              className="min-h-[44px] gap-2 text-xs font-bold"
            >
              {savingId === draftReport.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Guardar borrador
            </Button>
            <Button
              type="button"
              onClick={() => void saveNarrative(draftReport, true)}
              disabled={
                savingId === draftReport.id ||
                draftReport.status === "published" ||
                draftReport.status === "pending"
              }
              className="min-h-[44px] gap-2 text-xs font-black"
            >
              {savingId === draftReport.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Enviar a Dirección
            </Button>
          </div>
        </section>
      )}

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
            Mis informes ({myReports.length})
          </p>
          <button
            type="button"
            onClick={() => void loadMyReports()}
            disabled={reportsLoading}
            className="flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-primary"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${reportsLoading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        {!reportsLoading && myReports.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Todavía no tienes informes. Genera uno cuando tengas al menos dos
            reportes de clase del alumno.
          </p>
        )}

        {myReports.map((report) => {
          const meta = STATUS_META[report.status] || STATUS_META["draft"];
          const student = report.student_id
            ? studentById.get(report.student_id)
            : null;
          return (
            <div
              key={report.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background p-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-foreground">
                  {report.student_name_snapshot || student?.name || "Alumno"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {reportKindLabel(report.period_type)} ·{" "}
                  {formatIsoDateShort(report.period_start)} –{" "}
                  {formatIsoDateShort(report.period_end)}
                </p>
                {report.status === "rejected" && report.rejection_reason && (
                  <p className="truncate text-xs font-semibold text-red-600">
                    {report.rejection_reason}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-black ${
                    meta?.className || ""
                  }`}
                >
                  {meta?.label || report.status}
                </span>
                {report.status !== "published" && (
                  <button
                    type="button"
                    onClick={() => openEditor(report)}
                    className="min-h-[44px] rounded-lg border border-primary/30 bg-primary/10 px-2.5 text-xs font-black text-primary"
                  >
                    {report.status === "draft" ? "Completar" : "Revisar"}
                  </button>
                )}
                {report.status === "published" && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Hoja inferior para registrar o editar reporte de clase */}
      <Sheet
        open={Boolean(classLogSeed)}
        onOpenChange={(open) => {
          if (!open) setClassLogSeed(null);
        }}
      >
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto p-3">
          <SheetHeader className="mb-2">
            <SheetTitle className="text-left text-sm font-black text-foreground">
              Registro de clase · {classLogSeed?.studentName || "Alumno"}
              {classLogSeed?.sessionDate ? ` · ${classLogSeed.sessionDate}` : ""}
              {classLogSeed?.startTime ? ` · ${classLogSeed.startTime}` : ""}
            </SheetTitle>
          </SheetHeader>
          {classLogSeed && (
            <ClassLog
              key={classLogSeed.nonce}
              teacherName={teacherDisplayName}
              teacherClean={teacherClean}
              students={adminStudents}
              schedule={schedule}
              initialSeed={classLogSeed}
              onSaved={() => {
                setClassLogSeed(null);
                void loadEvaluations();
                toast.success("✓ Reporte de clase guardado con éxito.");
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
