import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FileText, Loader2, Music4, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProgressReportDocument } from "@/components/informes/progress-report-document";
import { useAppStore } from "@/store/app-store";
import { resolveFamilyScope } from "@/lib/laya/laya-family-scope";
import {
  buildProgressReportView,
  formatAttendanceRate,
  formatProgressPeriod,
} from "@/lib/informes/progress-report-format";
import { getPublishedReportsForStudent } from "@/lib/services/progress-reports.service";
import { useInformesAccess } from "@/hooks/use-informes-access";
import type { ProgressReportRow } from "@/lib/informes/types";

export const Route = createFileRoute("/family/progreso")({
  head: () => ({
    meta: [
      { title: "Progreso de tus hijos — Portal de Familia" },
      {
        name: "description",
        content:
          "Informes de progreso publicados por Vibra Music, en solo lectura y con descarga en PDF.",
      },
    ],
  }),
  component: FamilyProgressPage,
});

function FamilyProgressPage() {
  const currentUser = useAppStore((s) => s.currentUser);
  const adminStudents = useAppStore((s) => s.adminStudents);

  // Fase 7 (ADR-0178): el portal familia solo se abre con `parentReports`.
  const { family: progresoEnabled, loading: accessLoading } = useInformesAccess();

  const familyScope = useMemo(
    () =>
      resolveFamilyScope({
        inviteFamilyId: currentUser?.familyId ?? null,
        userEmail: currentUser?.email ?? null,
        adminStudents,
      }),
    [adminStudents, currentUser?.email, currentUser?.familyId],
  );

  const students = familyScope.students;
  const idsKey = students
    .map((student) => student.id)
    .sort()
    .join(",");

  const [reports, setReports] = useState<ProgressReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<ProgressReportRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!progresoEnabled) {
      setReports([]);
      return;
    }
    if (!idsKey) {
      setReports([]);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const groups = await Promise.all(
          students.map((student) => getPublishedReportsForStudent(student.id)),
        );
        if (cancelled) return;
        setReports(groups.flat());
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los informes de progreso.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, progresoEnabled]);

  const activeView = useMemo(
    () => (activeReport ? buildProgressReportView(activeReport) : null),
    [activeReport],
  );

  if (accessLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-6 text-xs text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Verificando acceso…
      </div>
    );
  }

  if (!progresoEnabled) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
        <FileText className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm font-bold text-foreground">
          Informes de progreso aún no disponibles
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Dirección habilitará esta sección para las familias cuando el primer
          informe esté publicado. Mientras tanto, puedes consultar el horario y
          las asistencias de tu hijo(a).
        </p>
        <Link
          to="/family"
          className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border px-4 text-xs font-bold text-foreground hover:bg-muted"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!familyScope.resolved) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
        <FileText className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm font-bold text-foreground">
          Vinculación pendiente
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Pide a Secretaría que vincule tu correo con la ficha de tu hijo(a) para
          ver los informes de progreso.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-base font-bold text-foreground">
          <Music4 className="h-4 w-4 text-primary" />
          Progreso
        </h1>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Informes publicados por Dirección. Solo lectura.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-6 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando informes…
        </div>
      )}

      {!loading && loadError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-600">
          {loadError}
        </div>
      )}

      {!loading && !loadError && reports.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
          <FileText className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 text-sm font-bold text-foreground">
            Aún no hay informes publicados
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Cuando Dirección publique el informe del periodo, aparecerá aquí con su
            detalle y la opción de descargarlo en PDF.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {reports.map((report) => {
          const view = buildProgressReportView(report);
          return (
            <article
              key={report.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    {view.studentName}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {view.instrument} · {formatProgressPeriod(view)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 bg-emerald-500/10 text-[10px] font-black text-emerald-600"
                >
                  Publicado
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1.5">
                <div className="rounded-lg border border-border bg-background px-2 py-1.5 text-center">
                  <p className="text-base font-black leading-none text-foreground">
                    {formatAttendanceRate(view.attendance)}
                  </p>
                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                    Asistencia
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background px-2 py-1.5 text-center">
                  <p className="text-base font-black leading-none text-foreground">
                    {view.attendance?.present ?? 0}
                  </p>
                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                    Asistidas
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background px-2 py-1.5 text-center">
                  <p className="text-base font-black leading-none text-foreground">
                    {view.criteria.length}
                  </p>
                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                    Criterios
                  </p>
                </div>
              </div>

              {view.goals && (
                <p className="mt-3 line-clamp-2 text-[11px] text-muted-foreground">
                  <span className="font-bold text-foreground">Próxima meta: </span>
                  {view.goals}
                </p>
              )}

              <Button
                type="button"
                onClick={() => {
                  setActiveReport(report);
                  setDialogOpen(true);
                }}
                className="mt-3 h-10 w-full gap-1.5 text-xs font-bold"
              >
                <FileText className="h-4 w-4" />
                Ver informe y descargar PDF
              </Button>
            </article>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] gap-0 overflow-y-auto border-primary/30 bg-background p-0 text-foreground shadow-2xl print:static print:left-0 print:top-0 print:h-auto print:max-h-none print:w-full print:max-w-none print:translate-x-0 print:translate-y-0 print:transform-none print:animate-none print:overflow-visible print:border-none print:p-0 print:shadow-none">
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card/95 px-3 py-2.5 backdrop-blur print:hidden">
            <p className="text-xs font-bold text-foreground">
              {activeView ? `Informe · ${activeView.studentName}` : "Informe"}
            </p>
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-9 gap-1.5 text-[11px] font-bold"
            >
              <Printer className="h-3.5 w-3.5" />
              Descargar PDF
            </Button>
          </div>

          {activeReport && activeView && (
            <ProgressReportDocument
              view={activeView}
              reportCode={`INF-${activeReport.id.slice(0, 8).toUpperCase()}`}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
