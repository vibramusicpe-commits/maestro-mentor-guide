/**
 * ================================================================
 * report-kinds.ts — Tipos de informe en un solo lugar
 * ================================================================
 *
 * Fuente única de las etiquetas, pistas y colores del semáforo de evidencia
 * para la bandeja de Dirección y el portal del docente.
 *
 * Queda PROHIBIDO reimplementar estas listas en un componente (ADR-0119.3):
 * una divergencia de etiquetas entre Dirección y Docente hace que el mismo
 * informe parezca distinto según quién lo mire.
 */

import type { ProgressReportPeriodType, ReportEvidenceLevel } from "./types";

export interface ReportKindOption {
  value: ProgressReportPeriodType;
  /** Etiqueta corta para botones y filtros. */
  label: string;
  /** Para qué plan aplica. Se muestra como ayuda al elegir. */
  hint: string;
}

export const REPORT_KIND_OPTIONS: ReportKindOption[] = [
  {
    value: "mensual",
    label: "Ciclo mensual",
    hint: "Ciclo vigente: 8 clases regular o 4 intensivo.",
  },
  {
    value: "trimestral",
    label: "Trimestral",
    hint: "Vigencia completa del plan trimestral.",
  },
  {
    value: "avance",
    label: "Avance",
    hint: "Corte intermedio de un paquete largo (ej. 24 clases).",
  },
  {
    value: "cierre_ciclo",
    label: "Cierre",
    hint: "Cierre de paquete flexible, personalizado o retiro del alumno.",
  },
];

/** Etiqueta larga para listados, CSV y fichas. */
export const PERIOD_TYPE_LABELS: Record<string, string> = {
  mensual: "Ciclo mensual",
  trimestral: "Trimestral",
  avance: "Avance",
  cierre_ciclo: "Cierre de ciclo",
};

/** Color del semáforo de evidencia (borde + fondo + texto). */
export const EVIDENCE_TONE: Record<ReportEvidenceLevel, string> = {
  insuficiente: "border-red-500/40 bg-red-500/5 text-red-600",
  basico: "border-orange-500/40 bg-orange-500/5 text-orange-600",
  parcial: "border-amber-500/40 bg-amber-500/5 text-amber-600",
  completo: "border-emerald-500/40 bg-emerald-500/5 text-emerald-600",
};

export function reportKindLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return PERIOD_TYPE_LABELS[value] || value;
}

export function reportKindHint(value: string | null | undefined): string {
  if (!value) return "";
  return REPORT_KIND_OPTIONS.find((option) => option.value === value)?.hint || "";
}

export function evidenceTone(level: string | null | undefined): string {
  if (level && level in EVIDENCE_TONE) {
    return EVIDENCE_TONE[level as ReportEvidenceLevel];
  }
  return EVIDENCE_TONE.insuficiente;
}
