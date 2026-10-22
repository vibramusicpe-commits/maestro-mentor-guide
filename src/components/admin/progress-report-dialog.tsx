/**
 * ================================================================
 * progress-report-dialog.tsx — Informe de Progreso (Fase 5)
 * ================================================================
 *
 * Dirección/Secretaría consolida el informe del periodo con lo que el
 * docente registró en clase (evaluaciones) y el snapshot de asistencia.
 *
 * Flujo:
 *   draft     -> borrador editable
 *   pending   -> enviado a revisión
 *   published -> congelado (published_snapshot) y visible en el portal familia
 *   rejected  -> devuelto con motivo para corregir
 *
 * Salidas:
 *   - PDF A4 de 2 páginas (window.print con CSS dedicado, ADR-0136/0137).
 *   - Markdown para archivo / auditoría / LLM.
 *   - Mensaje corto para WhatsApp.
 *
 * Reglas:
 *   - Cero datos financieros.
 *   - No escribe `students.notes` ni `notification_logs`.
 *   - Un criterio en borrador (ui_config.draft = true) bloquea el envío a
 *     revisión y la publicación (ADR-0175).
 *   - Un informe publicado es inmutable (lo impone el servicio).
 */

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  FileText,
  Loader2,
  Lock,
  MessageCircle,
  Printer,
  Save,
  Send,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAppStore } from "@/store/app-store";
import type { ProgressReportRow } from "@/lib/informes/types";
import { InformesValidationError } from "@/lib/informes/utils";
import {
  PROGRESS_REPORT_PRINT_CSS,
  buildProgressReportView,
  formatAttendanceRate,
  formatProgressPeriod,
  formatIsoDateShort,
  generateProgressReportMarkdown,
  generateProgressReportWhatsApp,
} from "@/lib/informes/progress-report-format";
import { resolveActor } from "@/lib/services/teacher-resolver";
import {
  approveProgressReport,
  getDraftCriteriaInReport,
  rejectProgressReport,
  updateProgressReport,
} from "@/lib/services/progress-reports.service";

interface ProgressReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ProgressReportRow | null;
  onChanged?: () => void;
  guardianPhone?: string | null;
}

const STATUS_META: Record<
  string,
  { label: string; className: string; hint: string }
> = {
  draft: {
    label: "Borrador",
    className: "border-slate-400/40 bg-slate-500/10 text-slate-600",
    hint: "Solo visible para el equipo. Editable.",
  },
  pending: {
    label: "En revisión",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-600",
    hint: "Esperando aprobación de Dirección.",
  },
  published: {
    label: "Publicado",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
    hint: "Visible para la familia. Contenido congelado.",
  },
  rejected: {
    label: "Rechazado",
    className: "border-red-500/40 bg-red-500/10 text-red-600",
    hint: "Devuelto con motivo. Corrige y vuelve a enviar.",
  },
};

const TEXT_FIELDS = [
  {
    key: "strengths",
    label: "Fortalezas observadas",
    placeholder: "Qué logró el alumno en este periodo…",
  },
  {
    key: "goals",
    label: "Próxima meta",
    placeholder: "Qué trabajaremos en el siguiente periodo…",
  },
  {
    key: "recommendations",
    label: "Recomendaciones para casa",
    placeholder: "Rutina breve de práctica, materiales, cuidados…",
  },
  {
    key: "familyMessage",
    label: "Mensaje a la familia",
    placeholder: "Mensaje cordial y claro, sin datos financieros…",
  },
  {
    key: "teacherComment",
    label: "Comentario del docente",
    placeholder: "Observación pedagógica del docente (opcional)…",
  },
] as const;

type TextFieldKey = (typeof TEXT_FIELDS)[number]["key"];

const EMPTY_FORM: Record<TextFieldKey, string> = {
  strengths: "",
  goals: "",
  recommendations: "",
  familyMessage: "",
  teacherComment: "",
};

export function ProgressReportDialog({
  open,
  onOpenChange,
  report,
  onChanged,
  guardianPhone,
}: ProgressReportDialogProps) {
  const currentUser = useAppStore((s) => s.currentUser);
  const activeRole = useAppStore((s) => s.activeRole);

  const [localReport, setLocalReport] = useState<ProgressReportRow | null>(report);
  const [form, setForm] = useState<Record<TextFieldKey, string>>(EMPTY_FORM);
  const [levelEnd, setLevelEnd] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    setLocalReport(report);
    if (!report) {
      setForm(EMPTY_FORM);
      setLevelEnd("");
      return;
    }
    setForm({
      strengths: report.strengths || "",
      goals: report.goals || "",
      recommendations: report.recommendations || "",
      familyMessage: report.family_message || "",
      teacherComment: report.teacher_comment || "",
    });
    setLevelEnd(report.level_end || "");
    setShowReject(false);
    setRejectReason("");
  }, [report?.id, report?.updated_at, report]);

  const actor = useMemo(
    () =>
      resolveActor(
        currentUser?.email,
        currentUser?.name || (activeRole === "staff" ? "Secretaría" : "Dirección"),
        activeRole,
      ),
    [activeRole, currentUser?.email, currentUser?.name],
  );

  const view = useMemo(() => {
    if (!localReport) return null;
    return buildProgressReportView({
      ...localReport,
      level_end: levelEnd || null,
      strengths: form.strengths || null,
      goals: form.goals || null,
      recommendations: form.recommendations || null,
      family_message: form.familyMessage || null,
      teacher_comment: form.teacherComment || null,
    });
  }, [form, levelEnd, localReport]);

  if (!localReport || !view) return null;

  const status = localReport.status;
  const isEditable = status === "draft" || status === "rejected";
  const periodText = formatProgressPeriod(view);
  const reportCode = `INF-${localReport.id.slice(0, 8).toUpperCase()}`;
  const statusMeta = STATUS_META[status] || STATUS_META.draft;

  const handleSave = async (nextStatus?: "draft" | "pending") => {
    try {
      setBusy(nextStatus || "save");

      if (nextStatus === "pending") {
        const drafts = await getDraftCriteriaInReport(localReport);
        if (drafts.length > 0) {
          toast.error(
            `No se puede enviar: hay criterios en borrador sin validar (${drafts
              .slice(0, 3)
              .join(", ")}).`,
          );
          return;
        }
      }

      const updated = await updateProgressReport(
        localReport.id,
        {
          level_end: levelEnd || null,
          strengths: form.strengths || null,
          goals: form.goals || null,
          recommendations: form.recommendations || null,
          family_message: form.familyMessage || null,
          teacher_comment: form.teacherComment || null,
          ...(nextStatus ? { status: nextStatus } : {}),
        },
        actor,
      );

      setLocalReport(updated);
      toast.success(
        nextStatus === "pending"
          ? "Informe enviado a revisión de Dirección."
          : "Borrador guardado.",
      );
      onChanged?.();
    } catch (error) {
      toast.error(
        error instanceof InformesValidationError
          ? error.message
          : "No se pudo guardar el informe.",
      );
    } finally {
      setBusy(null);
    }
  };

  const handlePublish = async () => {
    try {
      setBusy("publish");
      const drafts = await getDraftCriteriaInReport(localReport);
      if (drafts.length > 0) {
        toast.error(
          `No se puede publicar: criterios en borrador sin validar (${drafts
            .slice(0, 3)
            .join(", ")}).`,
        );
        return;
      }
      const updated = await approveProgressReport(
        localReport.id,
        actor.id ?? null,
        actor.name ?? null,
      );
      setLocalReport(updated);
      toast.success("Informe publicado. Ya es visible en el Portal de Familia.");
      onChanged?.();
    } catch (error) {
      toast.error(
        error instanceof InformesValidationError
          ? error.message
          : "No se pudo publicar el informe.",
      );
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async () => {
    try {
      setBusy("reject");
      const updated = await rejectProgressReport(
        localReport.id,
        actor.id ?? null,
        actor.name ?? null,
        rejectReason,
      );
      setLocalReport(updated);
      setShowReject(false);
      setRejectReason("");
      toast.success("Informe devuelto al docente con el motivo.");
      onChanged?.();
    } catch (error) {
      toast.error(
        error instanceof InformesValidationError
          ? error.message
          : "No se pudo rechazar el informe.",
      );
    } finally {
      setBusy(null);
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      const markdown = generateProgressReportMarkdown({
        ...localReport,
        level_end: levelEnd || null,
        strengths: form.strengths || null,
        goals: form.goals || null,
        recommendations: form.recommendations || null,
        family_message: form.familyMessage || null,
        teacher_comment: form.teacherComment || null,
      });
      await navigator.clipboard.writeText(markdown);
      toast.success("Markdown copiado al portapapeles.");
    } catch {
      toast.error("No se pudo copiar el Markdown.");
    }
  };

  const handleWhatsApp = async () => {
    const message = generateProgressReportWhatsApp({
      ...localReport,
      level_end: levelEnd || null,
      strengths: form.strengths || null,
      goals: form.goals || null,
      recommendations: form.recommendations || null,
      family_message: form.familyMessage || null,
      teacher_comment: form.teacherComment || null,
    });

    const digits = (guardianPhone || "").replace(/\D/g, "");
    if (digits.length >= 9) {
      const phone = digits.startsWith("51") ? digits : `51${digits}`;
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(message);
      toast.success(
        "El alumno no tiene celular registrado. Mensaje copiado para pegarlo en WhatsApp.",
      );
    } catch {
      toast.error("No se pudo preparar el mensaje de WhatsApp.");
    }
  };

  const attendance = view.attendance;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] gap-0 overflow-y-auto border-primary/30 bg-background p-0 text-foreground shadow-2xl print:static print:left-0 print:top-0 print:h-auto print:max-h-none print:w-full print:max-w-none print:translate-x-0 print:translate-y-0 print:transform-none print:animate-none print:overflow-visible print:border-none print:p-0 print:shadow-none">
        <style>{PROGRESS_REPORT_PRINT_CSS}</style>

        {/* Barra de acciones (no se imprime) */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-border bg-card/95 px-3 py-2.5 backdrop-blur print:hidden">
          <Badge
            variant="outline"
            className={`gap-1 text-[10px] font-black ${statusMeta.className}`}
          >
            {status === "published" ? (
              <Lock className="h-3 w-3" />
            ) : status === "rejected" ? (
              <XCircle className="h-3 w-3" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
            {statusMeta.label}
          </Badge>
          <span className="hidden text-[10px] text-muted-foreground sm:inline">
            {statusMeta.hint}
          </span>

          <div className="flex-1" />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleCopyMarkdown()}
            className="h-8 gap-1.5 text-[11px] font-bold"
          >
            <ClipboardCopy className="h-3.5 w-3.5" />
            Markdown
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleWhatsApp()}
            className="h-8 gap-1.5 text-[11px] font-bold"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-8 gap-1.5 text-[11px] font-bold"
          >
            <Printer className="h-3.5 w-3.5" />
            PDF / Imprimir
          </Button>

          {isEditable && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleSave()}
              disabled={Boolean(busy)}
              className="h-8 gap-1.5 text-[11px] font-bold"
            >
              {busy === "save" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Guardar
            </Button>
          )}

          {isEditable && (
            <Button
              type="button"
              size="sm"
              onClick={() => void handleSave("pending")}
              disabled={Boolean(busy)}
              className="h-8 gap-1.5 text-[11px] font-bold"
            >
              {busy === "pending" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Enviar a revisión
            </Button>
          )}

          {status === "pending" && (
            <>
              <Button
                type="button"
                size="sm"
                onClick={() => void handlePublish()}
                disabled={Boolean(busy)}
                className="h-8 gap-1.5 bg-emerald-600 text-[11px] font-bold text-white hover:bg-emerald-700"
              >
                {busy === "publish" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                Publicar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowReject((prev) => !prev)}
                disabled={Boolean(busy)}
                className="h-8 gap-1.5 text-[11px] font-bold text-red-600"
              >
                <XCircle className="h-3.5 w-3.5" />
                Rechazar
              </Button>
            </>
          )}
        </div>

        {showReject && status === "pending" && (
          <div className="space-y-2 border-b border-border bg-red-500/5 px-4 py-3 print:hidden">
            <p className="text-[11px] font-bold text-red-600">
              Motivo del rechazo (obligatorio, el contenido no se borra)
            </p>
            <Textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Ej. La meta del periodo no coincide con el nivel alcanzado…"
              className="min-h-[70px] text-xs"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowReject(false)}
                className="h-8 text-[11px]"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void handleReject()}
                disabled={Boolean(busy) || rejectReason.trim().length < 5}
                className="h-8 bg-red-600 text-[11px] font-bold text-white hover:bg-red-700"
              >
                {busy === "reject" ? "Devolviendo…" : "Devolver al docente"}
              </Button>
            </div>
          </div>
        )}

        {/* ===================== DOCUMENTO A4 ===================== */}
        <div className="bg-white px-5 py-4 text-[#15120F] print:px-0 print:py-0">
          {/* ---------- PÁGINA 1 ---------- */}
          <header className="border-b-2 border-[#F47B20] pb-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F47B20]">
                  Vibra Music
                </p>
                <h2 className="text-lg font-black leading-tight tracking-tight">
                  Informe de Progreso
                </h2>
                <p className="text-[10px] text-slate-600">
                  {view.instrument} · {periodText}
                </p>
              </div>
              <div className="text-right font-mono text-[9px] leading-relaxed text-slate-600">
                <p className="font-black text-slate-900">{reportCode}</p>
                <p>Emisión: {formatIsoDateShort(localReport.created_at?.slice(0, 10))}</p>
                <p>PÁGINA 1 DE 2</p>
              </div>
            </div>
          </header>

          <section className="mt-3 grid gap-2 sm:grid-cols-3 print:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-2">
              <p className="text-[8px] font-black uppercase tracking-wide text-slate-500">
                Alumno
              </p>
              <p className="text-xs font-black leading-tight">{view.studentName}</p>
              <p className="text-[9px] text-slate-600">
                {view.instrument}
                {view.ageCategory ? ` · ${view.ageCategory}` : ""}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-2">
              <p className="text-[8px] font-black uppercase tracking-wide text-slate-500">
                Docente
              </p>
              <p className="text-xs font-black leading-tight">{view.teacherName}</p>
              <p className="text-[9px] text-slate-600">
                {view.modality || "Plan contratado"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-2">
              <p className="text-[8px] font-black uppercase tracking-wide text-slate-500">
                Periodo y nivel
              </p>
              <p className="text-xs font-black leading-tight">
                {formatIsoDateShort(view.periodStart)} –{" "}
                {formatIsoDateShort(view.periodEnd)}
              </p>
              <p className="text-[9px] text-slate-600">
                Nivel: {view.levelStart || "—"}
                {view.levelEnd ? ` → ${view.levelEnd}` : ""}
              </p>
            </div>
          </section>

          {/* Asistencia */}
          <section className="mt-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-wide text-slate-700">
                Asistencia del periodo
              </h3>
              <span className="text-[10px] font-black text-[#F47B20]">
                {formatAttendanceRate(attendance)}
              </span>
            </div>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5 sm:grid-cols-6 print:grid-cols-6">
              {[
                { label: "Asistidas", value: attendance?.present ?? 0 },
                { label: "Tardanzas", value: attendance?.late ?? 0 },
                { label: "Faltas", value: attendance?.absent ?? 0 },
                { label: "Justificadas", value: attendance?.justified ?? 0 },
                { label: "Pendientes", value: attendance?.pending ?? 0 },
                { label: "Sesiones", value: attendance?.total ?? 0 },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-center"
                >
                  <p className="text-base font-black leading-none">{kpi.value}</p>
                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wide text-slate-500">
                    {kpi.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Criterios */}
          <section className="mt-3">
            <h3 className="text-[10px] font-black uppercase tracking-wide text-slate-700">
              Criterios evaluados
            </h3>
            {view.criteria.length > 0 ? (
              <table className="mt-1.5 w-full border-collapse text-[9px]">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-200 px-1.5 py-1 text-left font-black">
                      Criterio
                    </th>
                    <th className="w-[28%] border border-slate-200 px-1.5 py-1 text-left font-black">
                      Resultado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {view.criteria.map((criterion, index) => (
                    <tr key={`${criterion.label}-${index}`}>
                      <td className="border border-slate-200 px-1.5 py-1">
                        {criterion.label}
                      </td>
                      <td className="border border-slate-200 px-1.5 py-1 font-bold">
                        {criterion.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-1 text-[9px] italic text-slate-500">
                Sin criterios registrados en el periodo.
              </p>
            )}
          </section>

          {/* Repertorio */}
          <section className="mt-3">
            <h3 className="text-[10px] font-black uppercase tracking-wide text-slate-700">
              Repertorio trabajado
            </h3>
            {view.repertoire.length > 0 ? (
              <table className="mt-1.5 w-full border-collapse text-[9px]">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-200 px-1.5 py-1 text-left font-black">
                      Obra
                    </th>
                    <th className="w-[26%] border border-slate-200 px-1.5 py-1 text-left font-black">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {view.repertoire.slice(0, 8).map((item, index) => (
                    <tr key={`${item.normalized_title}-${index}`}>
                      <td className="border border-slate-200 px-1.5 py-1">
                        {item.title}
                      </td>
                      <td className="border border-slate-200 px-1.5 py-1">
                        {item.status === "consolidada"
                          ? "Consolidada"
                          : item.status === "en_proceso"
                            ? "En proceso"
                            : "Iniciada"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-1 text-[9px] italic text-slate-500">
                Sin repertorio consolidado en el periodo.
              </p>
            )}
          </section>

          {/* ---------- PÁGINA 2 ---------- */}
          <div className="print-page-break mt-4">
            <header className="flex items-start justify-between border-b border-slate-300 pb-1.5">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#F47B20]">
                  Vibra Music · Informe de Progreso
                </p>
                <p className="text-[10px] font-bold">
                  {view.studentName} · {view.instrument}
                </p>
              </div>
              <div className="text-right font-mono text-[8px] text-slate-600">
                <p className="font-black text-slate-900">{reportCode}</p>
                <p>PÁGINA 2 DE 2</p>
              </div>
            </header>

            <section className="mt-2.5 space-y-2.5">
              {TEXT_FIELDS.map((field) => {
                const value = form[field.key];
                return (
                  <div key={field.key} className="print-avoid-break">
                    <div className="flex items-baseline justify-between">
                      <p className="text-[9px] font-black uppercase tracking-wide text-slate-700">
                        {field.label}
                      </p>
                      <span className="text-[8px] text-slate-400 print:hidden">
                        {value.length}/1200
                      </span>
                    </div>

                    {isEditable ? (
                      <Textarea
                        value={value}
                        maxLength={1200}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            [field.key]: event.target.value,
                          }))
                        }
                        placeholder={field.placeholder}
                        className="mt-0.5 min-h-[62px] text-[11px] leading-snug print:hidden"
                      />
                    ) : null}

                    <p
                      className={`mt-0.5 whitespace-pre-wrap text-[10px] leading-snug text-slate-800 ${
                        isEditable ? "hidden print:block" : ""
                      }`}
                    >
                      {value || "—"}
                    </p>
                  </div>
                );
              })}

              {isEditable && (
                <div className="print:hidden">
                  <p className="text-[9px] font-black uppercase tracking-wide text-slate-700">
                    Nivel alcanzado al cierre del periodo
                  </p>
                  <input
                    value={levelEnd}
                    onChange={(event) => setLevelEnd(event.target.value)}
                    placeholder="Ej. Inicial II, Intermedio I…"
                    className="mt-0.5 h-8 w-full rounded-lg border border-slate-300 px-2 text-[11px]"
                  />
                </div>
              )}

              {status === "rejected" && localReport.rejection_reason && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-2">
                  <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wide text-red-700">
                    <AlertTriangle className="h-3 w-3" /> Motivo del rechazo
                  </p>
                  <p className="mt-0.5 text-[10px] text-red-800">
                    {localReport.rejection_reason}
                  </p>
                </div>
              )}
            </section>

            <section className="mt-4 grid grid-cols-2 gap-6">
              <div className="print-avoid-break">
                <div className="h-10 border-b border-slate-400" />
                <p className="mt-1 text-center text-[8px] font-bold uppercase tracking-wide text-slate-600">
                  Dirección / Secretaría Vibra Music
                </p>
              </div>
              <div className="print-avoid-break">
                <div className="h-10 border-b border-slate-400" />
                <p className="mt-1 text-center text-[8px] font-bold uppercase tracking-wide text-slate-600">
                  Firma del apoderado
                </p>
              </div>
            </section>

            <p className="mt-3 border-t border-slate-200 pt-1.5 text-[8px] leading-snug text-slate-500">
              Documento pedagógico emitido por Vibra Music Staff. No contiene datos
              financieros. {view.publishedAt
                ? `Publicado el ${formatIsoDateShort(view.publishedAt.slice(0, 10))}${
                    view.publishedByName ? ` por ${view.publishedByName}` : ""
                  }.`
                : "Borrador interno: no visible para la familia."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
