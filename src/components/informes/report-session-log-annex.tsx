/**
 * ================================================================
 * report-session-log-annex.tsx — Anexo de bitácora del informe A4
 * ================================================================
 *
 * Páginas 3+ del informe: la evidencia que lo sustenta, clase por clase.
 * Un informe es el consolidado de varios reportes de clase; sin este anexo la
 * familia vería el resumen pero no qué se trabajó en cada sesión ni cuándo
 * inició el proceso.
 *
 * Fuente única: lo usan el diálogo de Dirección y el portal familia. Prohibido
 * duplicar esta tabla en otro componente (ADR-0119.3).
 *
 * Reglas:
 *   - Solo lectura, cero datos financieros.
 *   - Arranca en página nueva (`print-page-break`, ADR-0137).
 *   - Anchos porcentuales fijos que suman 100 % (ADR-0137).
 */

import {
  formatIsoDateShort,
  formatSessionAttendance,
  repertoireLabel,
  type ProgressReportView,
} from "@/lib/informes/progress-report-format";

interface ReportSessionLogAnnexProps {
  view: ProgressReportView;
  reportCode: string;
}

export function ReportSessionLogAnnex({
  view,
  reportCode,
}: ReportSessionLogAnnexProps) {
  const entries = view.sessionLog;
  if (entries.length === 0) return null;

  const firstDate = entries[0]?.date ?? "";
  const contracted = view.plan?.contractedSessions ?? null;

  return (
    <div className="print-page-break mt-4">
      <header className="flex items-start justify-between border-b border-slate-300 pb-1.5">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#F47B20]">
            Vibra Music · Anexo del Informe de Progreso
          </p>
          <p className="text-[10px] font-bold">
            Bitácora de clases · {view.studentName} · {view.instrument}
          </p>
        </div>
        <div className="text-right font-mono text-[8px] text-slate-600">
          <p className="font-black text-slate-900">{reportCode}</p>
          <p>ANEXO · BITÁCORA</p>
        </div>
      </header>

      <p className="mt-1.5 text-[9px] leading-snug text-slate-700">
        <strong>Inicio del proceso:</strong>{" "}
        {formatIsoDateShort(firstDate)} ·{" "}
        <strong>{entries.length}</strong> clase(s) documentadas
        {contracted ? ` de ${contracted} contratadas` : ""}
        {view.plan?.planType ? ` · Plan: ${view.plan.planType}` : ""}.
        Cada fila corresponde a un reporte de clase registrado por el docente en
        el periodo {formatIsoDateShort(view.periodStart)} –{" "}
        {formatIsoDateShort(view.periodEnd)}.
      </p>

      <table className="mt-2 w-full border-collapse text-[8.5px] leading-tight">
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "32%" }} />
          <col style={{ width: "22%" }} />
        </colgroup>
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-300 px-1 py-1 text-left font-black">
              N°
            </th>
            <th className="border border-slate-300 px-1 py-1 text-left font-black">
              Fecha
            </th>
            <th className="border border-slate-300 px-1 py-1 text-left font-black">
              Horario
            </th>
            <th className="border border-slate-300 px-1 py-1 text-left font-black">
              Min
            </th>
            <th className="border border-slate-300 px-1 py-1 text-left font-black">
              Asistencia
            </th>
            <th className="border border-slate-300 px-1 py-1 text-left font-black">
              Qué se trabajó
            </th>
            <th className="border border-slate-300 px-1 py-1 text-left font-black">
              Tarea y observación
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const repertoire = entry.repertoire.map(repertoireLabel);
            return (
              <tr key={`${entry.date}-${entry.time}-${index}`}>
                <td className="border border-slate-300 px-1 py-1 font-bold">
                  {index + 1}
                </td>
                <td className="border border-slate-300 px-1 py-1">
                  {formatIsoDateShort(entry.date)}
                </td>
                <td className="border border-slate-300 px-1 py-1 font-mono">
                  {entry.time}–{entry.timeEnd}
                </td>
                <td className="border border-slate-300 px-1 py-1">
                  {entry.durationMin}
                </td>
                <td className="border border-slate-300 px-1 py-1 font-bold">
                  {formatSessionAttendance(entry.attendance)}
                </td>
                <td className="border border-slate-300 px-1 py-1">
                  <p className="font-semibold">{entry.topic || "—"}</p>
                  {repertoire.length > 0 && (
                    <p className="mt-0.5 text-slate-600">
                      {repertoire.join(" · ")}
                    </p>
                  )}
                  {entry.overallLabel && (
                    <p className="mt-0.5 text-slate-600">
                      Estado general: {entry.overallLabel}
                    </p>
                  )}
                </td>
                <td className="border border-slate-300 px-1 py-1">
                  {entry.homework ? (
                    <p>
                      <span className="font-bold">Tarea:</span> {entry.homework}
                    </p>
                  ) : null}
                  {entry.comment ? (
                    <p className={entry.homework ? "mt-0.5 text-slate-600" : ""}>
                      {entry.comment}
                    </p>
                  ) : null}
                  {!entry.homework && !entry.comment && (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="mt-2 border-t border-slate-200 pt-1.5 text-[8px] leading-snug text-slate-500">
        Anexo pedagógico: consolida los reportes de clase ({entries.length}) y la
        asistencia del periodo. No contiene datos financieros.
      </p>
    </div>
  );
}
