/**
 * ================================================================
 * progress-report-document.tsx — Informe A4 de solo lectura (Fase 5)
 * ================================================================
 *
 * Documento de 2 páginas para la familia (y para imprimir/descargar PDF).
 * No edita nada y no incluye datos financieros.
 *
 * El CSS de impresión es el compartido `PROGRESS_REPORT_PRINT_CSS`, que
 * desmonta el portal Radix y evita cortes (ADR-0136 / ADR-0137).
 */

import { Lock } from "lucide-react";
import {
  PROGRESS_REPORT_PRINT_CSS,
  formatAttendanceRate,
  formatIsoDateShort,
  formatProgressPeriod,
  type ProgressReportView,
} from "@/lib/informes/progress-report-format";

interface ProgressReportDocumentProps {
  view: ProgressReportView;
  reportCode: string;
}

const STATUS_TEXT: Record<string, string> = {
  draft: "Borrador interno",
  pending: "En revisión",
  published: "Publicado",
  rejected: "Devuelto para corrección",
};

export function ProgressReportDocument({
  view,
  reportCode,
}: ProgressReportDocumentProps) {
  const attendance = view.attendance;

  const narratives = [
    ["Fortalezas observadas", view.strengths],
    ["Próxima meta", view.goals],
    ["Recomendaciones para casa", view.recommendations],
    ["Mensaje a la familia", view.familyMessage],
    ["Comentario del docente", view.teacherComment],
  ].filter(([, body]) => Boolean(body));

  return (
    <div className="bg-white px-5 py-4 text-[#15120F] print:px-0 print:py-0">
      <style>{PROGRESS_REPORT_PRINT_CSS}</style>

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
              {view.instrument} · {formatProgressPeriod(view)}
            </p>
          </div>
          <div className="text-right font-mono text-[9px] leading-relaxed text-slate-600">
            <p className="font-black text-slate-900">{reportCode}</p>
            {view.publishedAt && (
              <p>
                Publicado: {formatIsoDateShort(view.publishedAt.slice(0, 10))}
              </p>
            )}
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
          {narratives.length > 0 ? (
            narratives.map(([title, body]) => (
              <div key={title} className="print-avoid-break">
                <p className="text-[9px] font-black uppercase tracking-wide text-slate-700">
                  {title}
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-[10px] leading-snug text-slate-800">
                  {body}
                </p>
              </div>
            ))
          ) : (
            <p className="text-[10px] italic text-slate-500">
              El docente aún no agregó observaciones narrativas para este periodo.
            </p>
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

        <p className="mt-3 flex items-center gap-1 border-t border-slate-200 pt-1.5 text-[8px] leading-snug text-slate-500">
          <Lock className="h-2.5 w-2.5" />
          {STATUS_TEXT[view.status] || view.status} · Documento pedagógico sin
          datos financieros.
          {view.publishedByName ? ` Aprobado por ${view.publishedByName}.` : ""}
        </p>
      </div>
    </div>
  );
}
