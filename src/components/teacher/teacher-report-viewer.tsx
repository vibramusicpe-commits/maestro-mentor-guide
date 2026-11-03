/**
 * ================================================================
 * teacher-report-viewer.tsx — Dossier completo del informe (ADR-0187)
 * ================================================================
 *
 * Permite al DOCENTE abrir y revisar el informe consolidado de sus alumnos
 * en modo SOLO LECTURA: documento del apoderado + anexo de bitácora clase
 * por clase (el dossier completo).
 *
 * Reutiliza sin duplicar (ADR-0119.3):
 *   - `buildProgressReportView`  → modelo del informe
 *   - `ProgressReportDocument`   → A4 con anexo
 *   - `generateProgressReportMarkdown` / `...WhatsApp` → copias
 *
 * Reglas innegociables:
 *   - SOLO LECTURA. El docente NUNCA publica ni aprueba: eso es de Dirección.
 *   - El docente solo puede abrir informes de SU cohorte (`allowedStudentIds`).
 *   - CERO datos financieros: el documento por diseño no los incluye.
 */

import { useMemo, useState } from "react";
import { Copy, FileText, Lock, MessageCircle, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ProgressReportRow } from "@/lib/informes/types";
import {
  PROGRESS_REPORT_PRINT_CSS,
  buildProgressReportView,
  formatIsoDateShort,
  generateProgressReportMarkdown,
  generateProgressReportWhatsApp,
  progressReportTitle,
} from "@/lib/informes/progress-report-format";
import { ProgressReportDocument } from "@/components/informes/progress-report-document";
import { reportKindLabel } from "@/lib/informes/report-kinds";

interface TeacherReportViewerProps {
  report: ProgressReportRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeacherReportViewer({
  report,
  open,
  onOpenChange,
}: TeacherReportViewerProps) {
  const [showRaw, setShowRaw] = useState(false);

  const view = useMemo(
    () => (report ? buildProgressReportView(report) : null),
    [report],
  );

  const reportCode = report ? `INF-${report.id.slice(0, 8).toUpperCase()}` : "";

  const handleCopyMarkdown = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(generateProgressReportMarkdown(report));
      toast.success("Formato LLM copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar. Revisa los permisos del navegador.");
    }
  };

  const handleCopyWhatsApp = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(generateProgressReportWhatsApp(report));
      toast.success("Mensaje para la familia copiado");
    } catch {
      toast.error("No se pudo copiar. Revisa los permisos del navegador.");
    }
  };

  if (!report || !view) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] gap-0 overflow-y-auto border-primary/30 bg-background p-0 text-foreground shadow-2xl print:static print:left-0 print:top-0 print:h-auto print:max-h-none print:w-full print:max-w-none print:translate-x-0 print:translate-y-0 print:transform-none print:animate-none print:overflow-visible print:border-none print:p-0 print:shadow-none">
        <style>{PROGRESS_REPORT_PRINT_CSS}</style>

        {/* Barra de acciones (no se imprime) */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-border bg-card/95 px-3 py-2.5 backdrop-blur print:hidden">
          <DialogHeader className="p-0">
            <DialogTitle className="flex items-center gap-2 text-xs font-black">
              <FileText className="h-3.5 w-3.5 text-primary" />
              {progressReportTitle(view)}
            </DialogTitle>
          </DialogHeader>

          <Badge variant="outline" className="text-[10px] font-black">
            {reportKindLabel(report.period_type)}
          </Badge>
          <Badge
            variant="outline"
            className="gap-1 border-primary/30 bg-primary/5 text-[10px] font-black text-primary"
          >
            <Lock className="h-3 w-3" />
            Solo lectura
          </Badge>

          <div className="flex-1" />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleCopyMarkdown()}
            className="h-8 gap-1.5 text-[11px] font-bold"
          >
            <Copy className="h-3 w-3" />
            Copiar LLM
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleCopyWhatsApp()}
            className="h-8 gap-1.5 text-[11px] font-bold"
          >
            <MessageCircle className="h-3 w-3" />
            WhatsApp
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => window.print()}
            className="h-8 gap-1.5 text-[11px] font-bold"
          >
            <Printer className="h-3 w-3" />
            Imprimir / PDF
          </Button>
        </div>

        {/* Aviso de contexto */}
        <div className="border-b border-border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground print:hidden">
          Dossier completo: documento del apoderado + bitácora clase por clase.
          Código <span className="font-mono font-bold">{reportCode}</span> · Periodo{" "}
          {formatIsoDateShort(report.period_start)} – {formatIsoDateShort(report.period_end)}.
          {report.status !== "published" && (
            <span className="ml-1 font-bold text-amber-700 dark:text-amber-300">
              Este informe aún no está publicado: es una vista previa interna.
            </span>
          )}
        </div>

        {/* Documento (A4 + anexo de bitácora) */}
        <div className="p-2 print:p-0">
          <ProgressReportDocument view={view} reportCode={reportCode} />

          {showRaw && (
            <pre className="mt-4 max-h-64 overflow-auto rounded-xl border border-border bg-muted/40 p-3 text-[10px] leading-relaxed">
              {generateProgressReportMarkdown(report)}
            </pre>
          )}
          <div className="mt-2 print:hidden">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowRaw((value) => !value)}
              className="h-8 text-[11px] font-bold"
            >
              {showRaw ? "Ocultar fuente Markdown" : "Ver fuente Markdown"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
