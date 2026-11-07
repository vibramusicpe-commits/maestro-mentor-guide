/**
 * ================================================================
 * family-account-card.tsx — Cuenta familiar de SOLO LECTURA (ADR-0190)
 * ================================================================
 *
 * Muestra, para el alumno abierto en la ficha: sus matrículas vinculadas,
 * los 3 rubros (matrícula / mensualidad / libro) y los totales reales de la
 * familia.
 *
 * Reglas:
 *   - **Cero escrituras**: no hay botones que cobren, apliquen ni muevan
 *     dinero. Los cobros viven en `/admin/facturacion`.
 *   - El saldo a favor se muestra **aparte** y se declara que **no se aplica
 *     automáticamente** a ningún instrumento (ADR-0188).
 *   - Todos los cálculos vienen de `src/lib/family-account.ts` (fuente única).
 *     Prohibido recalcular montos aquí (ADR-0119.3).
 *   - Si la cuenta no aporta nada (1 matrícula, sin saldo a favor, sin
 *     advertencias) el componente **no se renderiza**: las fichas simples se
 *     ven exactamente igual que antes.
 */

import { useMemo } from "react";
import { Building2, Info, Layers, ShieldCheck, TriangleAlert, Wallet } from "lucide-react";
import { useAppStore, type AdminStudent, type Invoice } from "@/store/app-store";
import {
  FAMILY_LINE_STATUS_LABELS,
  buildFamilyAccount,
  formatSoles,
  resolveCreditToShow,
  type FamilyLineStatus,
} from "@/lib/family-account";
import { Badge } from "@/components/ui/badge";

const STATUS_CLASSES: Record<FamilyLineStatus, string> = {
  pagado: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  parcial: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  pendiente: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  exonerado: "border-border bg-muted text-muted-foreground",
  "sin-recibo": "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

export interface FamilyAccountCardProps {
  student: AdminStudent;
}

export function FamilyAccountCard({ student }: FamilyAccountCardProps) {
  const students = useAppStore((s) => s.adminStudents);
  const invoices = useAppStore(
    (s) => (s as unknown as { invoices?: Invoice[] }).invoices || [],
  );

  const summary = useMemo(
    () => buildFamilyAccount(students, invoices, student.id),
    [students, invoices, student.id],
  );

  if (!summary || !summary.isRelevant) return null;

  const credit = resolveCreditToShow(summary);
  const pendingTotal = summary.totals.pending;

  return (
    <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
          <Wallet className="h-4 w-4" />
          Cuenta familiar
        </span>
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className="gap-1 border-sky-500/40 text-[10px] font-bold text-sky-700 dark:text-sky-300"
          >
            <Layers className="h-3 w-3" />
            {summary.members.length} matrícula{summary.members.length === 1 ? "" : "s"}
          </Badge>
          <Badge
            variant="outline"
            className="border-border text-[10px] font-semibold text-muted-foreground"
          >
            <ShieldCheck className="mr-1 h-3 w-3" />
            Solo lectura
          </Badge>
        </div>
      </div>

      <p className="text-[11px] font-semibold text-foreground">
        {summary.label}
        {summary.isMultiInstrument && (
          <span className="font-normal text-muted-foreground">
            {" "}
            · {summary.members.map((member) => member.instrument).join(" + ")}
          </span>
        )}
      </p>

      {/* Totales de la familia */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border bg-background px-2 py-1.5">
          <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
            Contratado
          </p>
          <p className="whitespace-nowrap font-mono text-sm font-black tabular-nums text-foreground">
            {formatSoles(summary.totals.contracted)}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-500/30 bg-background px-2 py-1.5">
          <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
            Pagado
          </p>
          <p className="whitespace-nowrap font-mono text-sm font-black tabular-nums text-emerald-700 dark:text-emerald-300">
            {formatSoles(summary.totals.applied)}
          </p>
        </div>
        <div
          className={`rounded-lg border bg-background px-2 py-1.5 ${
            pendingTotal > 0.005 ? "border-rose-500/30" : "border-border"
          }`}
        >
          <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
            Pendiente
          </p>
          <p
            className={`whitespace-nowrap font-mono text-sm font-black tabular-nums ${
              pendingTotal > 0.005
                ? "text-rose-700 dark:text-rose-300"
                : "text-muted-foreground"
            }`}
          >
            {formatSoles(pendingTotal)}
          </p>
        </div>
      </div>

      {/* Saldo a favor: nunca se aplica solo */}
      {credit > 0.005 && (
        <div className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">
            <Info className="h-3 w-3" />
            Saldo a favor de la familia
          </p>
          <p className="whitespace-nowrap font-mono text-base font-black tabular-nums text-sky-700 dark:text-sky-300">
            {formatSoles(credit)}
          </p>
          <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
            No se aplica automáticamente a ningún instrumento. Secretaría decide a qué
            matrícula se destina o si se devuelve.
          </p>
        </div>
      )}

      {/* Detalle por rubro y matrícula */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[460px] border-collapse text-[11px]">
          <thead>
            <tr className="text-left text-[9px] uppercase tracking-wide text-muted-foreground">
              <th className="pb-1 pr-2 font-bold">Rubro</th>
              <th className="pb-1 pr-2 font-bold">Matrícula</th>
              <th className="pb-1 pr-2 text-right font-bold">Contratado</th>
              <th className="pb-1 pr-2 text-right font-bold">Abonado</th>
              <th className="pb-1 pr-2 text-right font-bold">Saldo</th>
              <th className="pb-1 font-bold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {summary.lines.map((line) => (
              <tr key={line.key} className="border-t border-border/60 align-top">
                <td className="py-1.5 pr-2">
                  <span className="font-semibold text-foreground">{line.rubroLabel}</span>
                  {line.note && (
                    <span className="block text-[9px] leading-snug text-muted-foreground">
                      {line.note}
                    </span>
                  )}
                </td>
                <td className="py-1.5 pr-2">
                  <span className="font-semibold text-foreground">{line.instrument}</span>
                  <span className="block text-[9px] text-muted-foreground">{line.studentName}</span>
                  {line.payments.length > 0 && (
                    <span className="block text-[9px] text-muted-foreground">
                      {line.payments.length} abono{line.payments.length === 1 ? "" : "s"}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap py-1.5 pr-2 text-right font-mono tabular-nums text-foreground">
                  {formatSoles(line.contracted)}
                </td>
                <td className="whitespace-nowrap py-1.5 pr-2 text-right font-mono tabular-nums text-emerald-700 dark:text-emerald-300">
                  {formatSoles(line.applied)}
                </td>
                <td
                  className={`whitespace-nowrap py-1.5 pr-2 text-right font-mono font-bold tabular-nums ${
                    line.pending > 0.005
                      ? "text-rose-700 dark:text-rose-300"
                      : "text-muted-foreground"
                  }`}
                >
                  {formatSoles(line.pending)}
                </td>
                <td className="py-1.5">
                  <span
                    className={`inline-block whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${
                      STATUS_CLASSES[line.status]
                    }`}
                  >
                    {FAMILY_LINE_STATUS_LABELS[line.status]}
                  </span>
                </td>
              </tr>
            ))}
            {summary.lines.length === 0 && (
              <tr>
                <td colSpan={6} className="py-2 text-[10px] text-muted-foreground">
                  Sin rubros registrados todavía.
                </td>
              </tr>
            )}
          </tbody>
          {summary.lines.length > 0 && (
            <tfoot>
              <tr className="border-t border-border">
                <td className="py-1.5 pr-2 text-[10px] font-black uppercase text-foreground" colSpan={2}>
                  Total familia
                </td>
                <td className="whitespace-nowrap py-1.5 pr-2 text-right font-mono font-black tabular-nums text-foreground">
                  {formatSoles(summary.totals.contracted)}
                </td>
                <td className="whitespace-nowrap py-1.5 pr-2 text-right font-mono font-black tabular-nums text-emerald-700 dark:text-emerald-300">
                  {formatSoles(summary.totals.applied)}
                </td>
                <td className="whitespace-nowrap py-1.5 pr-2 text-right font-mono font-black tabular-nums text-rose-700 dark:text-rose-300">
                  {formatSoles(summary.totals.pending)}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {summary.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
            <TriangleAlert className="h-3 w-3" />
            Revisar antes de cobrar
          </p>
          <ul className="mt-1 space-y-0.5">
            {summary.warnings.map((warning) => (
              <li key={warning} className="text-[10px] leading-snug text-muted-foreground">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="flex items-start gap-1.5 text-[10px] leading-snug text-muted-foreground">
        <Building2 className="mt-0.5 h-3 w-3 shrink-0" />
        Los cobros y abonos se registran en <strong>Cobros y Abonos</strong>. Esta tarjeta
        solo refleja lo que ya está en la base de datos.
      </p>
    </div>
  );
}
