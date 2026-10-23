/**
 * ================================================================
 * report-readiness.ts — Elegibilidad y ventana de un informe
 * ================================================================
 *
 * Un **informe** es el consolidado de varios **reportes de clase**
 * (`lesson_evaluations`) más la asistencia del periodo. No se alimenta de
 * informes anteriores: sin reportes de clase no hay informe.
 *
 * Este módulo es puro (no hace red) y concentra:
 *   - El contexto del plan real del alumno (planType, no la columna SQL
 *     `modality`, que dice "Regular" incluso en paquetes flexibles).
 *   - La ventana sugerida del informe según el tipo y el plan.
 *   - La regla de evidencia: mínimo 2 reportes de clase (1 en Demo o
 *     Personalizado de una sola sesión) y etiqueta de calidad por cobertura.
 *
 * No recalcula ciclos: recibe las sesiones que ya produjo el motor oficial
 * (`computeStudentCycleSessions`) para no duplicar reglas (ADR-0175).
 */

import type { StudentSessionItem } from "@/lib/kardex-calculator";
import type { AdminStudent } from "@/store/admin-seeds";
import type {
  LessonEvaluationRow,
  ProgressReportPeriodType,
  ReportEvidence,
  ReportEvidenceLevel,
  ReportPlanContext,
} from "./types";
import { normalizeTitle } from "./utils";

export type {
  ReportEvidence,
  ReportEvidenceLevel,
  ReportPlanContext,
} from "./types";

export const MIN_EVALUATIONS_DEFAULT = 2;
export const MIN_EVALUATIONS_SINGLE_SESSION = 1;

/** Umbral de calidad (no bloquea por encima del mínimo). */
export const COVERAGE_PARTIAL = 40;
export const COVERAGE_COMPLETE = 70;

export interface ReportReadinessInput {
  plan: ReportPlanContext;
  sessions: StudentSessionItem[];
  evaluations: LessonEvaluationRow[];
  periodStart: string;
  periodEnd: string;
  kind: ProgressReportPeriodType;
}

export interface ReportReadinessResult {
  evidence: ReportEvidence;
  window: { start: string; end: string };
}

export const REPORT_KIND_META: Record<
  ProgressReportPeriodType,
  { label: string; hint: string }
> = {
  mensual: {
    label: "Informe del ciclo",
    hint: "Consolida los reportes de clase del ciclo vigente (8 o 4 clases).",
  },
  trimestral: {
    label: "Informe trimestral",
    hint: "Consolida los reportes de clase del trimestre completo.",
  },
  avance: {
    label: "Informe de avance",
    hint: "Corte intermedio de un paquete largo (ej. 24 clases).",
  },
  cierre_ciclo: {
    label: "Informe de cierre",
    hint: "Cierre de paquete, personalizado o retiro del alumno.",
  },
};

/**
 * Construye el contexto del plan desde la ficha. Usa `planType` y
 * `packageTotalSessions`, nunca la columna SQL `modality` como fuente de
 * verdad (ADR-0151: en flexibles dice "Regular").
 */
export function buildReportPlanContext(
  student: AdminStudent,
  sessions: StudentSessionItem[] = [],
  evaluations: LessonEvaluationRow[] = [],
): ReportPlanContext {
  const planType = String(student.planType || "Mensual");
  const modality = String(student.modality || "");
  const haystack = normalizeTitle(`${planType} ${modality} ${student.level || ""}`);

  const isDemo =
    haystack.includes("demo") || haystack.includes("nivelaci");
  const isIntensive =
    haystack.includes("inten") ||
    haystack.includes("90 min") ||
    (haystack.includes("4 clases") && !haystack.includes("45 min"));
  const isPersonalized =
    haystack.includes("personaliz") || planType === "Paquete Especial";
  const isFlexiblePackage =
    haystack.includes("flex") ||
    haystack.includes("demanda") ||
    haystack.includes("paquete") ||
    Number(student.packageTotalSessions) > 8;

  // El contrato manda sobre `packageTotalSessions`, que en alumnos históricos
  // arrastra el 8 del plan regular aunque su modalidad sea otra.
  const contractedSessions = isDemo
    ? 1
    : isIntensive
      ? 4
      : isPersonalized && !isFlexiblePackage
        ? 1
        : isFlexiblePackage
          ? Number(student.packageTotalSessions) || 8
          : 8;

  const activityDates = [
    ...sessions
      .filter((session) => session.status !== "pendiente")
      .map((session) => session.dateStr),
    ...evaluations.map((evaluation) => evaluation.session_date),
  ]
    .filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value || ""))
    .sort();

  return {
    planType,
    modality,
    contractedSessions,
    isFlexiblePackage,
    isPersonalized,
    isDemo,
    isIntensive,
    planStartDate: student.planStartDate || null,
    planEndDate: student.planEndDate || null,
    firstClassDate: activityDates[0] || null,
  };
}

/** Mínimo de reportes de clase para habilitar el informe. */
export function minimumEvaluations(plan: ReportPlanContext): number {
  if (plan.isDemo) return MIN_EVALUATIONS_SINGLE_SESSION;
  if (plan.isPersonalized && plan.contractedSessions <= 2) {
    return MIN_EVALUATIONS_SINGLE_SESSION;
  }
  return MIN_EVALUATIONS_DEFAULT;
}

/** Claves únicas de reportes: un intensivo cuenta una vez por fecha. */
function evaluationKeys(
  evaluations: LessonEvaluationRow[],
  plan: ReportPlanContext,
  start: string,
  end: string,
): Set<string> {
  const keys = new Set<string>();
  for (const evaluation of evaluations) {
    const date = evaluation.session_date;
    if (!date || date < start || date > end) continue;
    keys.add(
      plan.isIntensive ? date : `${date}::${evaluation.start_time || "00:00"}`,
    );
  }
  return keys;
}

function uniqueSortedDates(values: string[]): string[] {
  return Array.from(
    new Set(values.filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value || ""))),
  ).sort();
}

/**
 * Ventana sugerida del informe.
 *
 * - mensual / trimestral: vigencia del ciclo (`planStartDate` → `planEndDate`).
 * - avance: hasta la fecha en que se consumió la mitad de las clases.
 * - cierre_ciclo: hasta la última clase evaluada o asistida.
 */
export function resolveReportWindow(input: {
  plan: ReportPlanContext;
  sessions: StudentSessionItem[];
  evaluations: LessonEvaluationRow[];
  kind: ProgressReportPeriodType;
}): { start: string; end: string } {
  const { plan, sessions, evaluations, kind } = input;

  const activityDates = uniqueSortedDates([
    ...sessions
      .filter((session) => session.status !== "pendiente")
      .map((session) => session.dateStr),
    ...evaluations.map((evaluation) => evaluation.session_date),
  ]);

  const start =
    (plan.planStartDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(plan.planStartDate) &&
      plan.planStartDate) ||
    activityDates[0] ||
    new Date().toISOString().slice(0, 10);

  const lastActivity = activityDates[activityDates.length - 1] || start;

  let end = lastActivity;

  if (kind === "mensual" || kind === "trimestral") {
    const planEnd = plan.planEndDate;
    if (planEnd && /^\d{4}-\d{2}-\d{2}$/.test(planEnd) && planEnd >= start) {
      end = planEnd;
    } else {
      end = lastActivity;
    }
  } else if (kind === "avance") {
    const evaluatedDates = uniqueSortedDates(
      sessions
        .filter(
          (session) =>
            session.status === "presente" || session.status === "tarde",
        )
        .map((session) => session.dateStr),
    );
    const target = Math.max(1, Math.ceil(plan.contractedSessions / 2));
    end = evaluatedDates[target - 1] || lastActivity;
  } else {
    // cierre_ciclo: hasta la última actividad real, no hasta el fin teórico.
    end = lastActivity;
  }

  if (end < start) end = start;

  return { start, end };
}

/**
 * Evalúa si el informe se puede generar y con qué calidad.
 *
 * Regla aprobada (2026-10-23):
 *   - Menos de 2 reportes de clase → NO se genera.
 *   - 2 o más → se genera, etiquetado por cobertura:
 *       < 40 %  → Básico
 *       40–69 % → Parcial
 *       ≥ 70 %  → Completo
 *   - Demo / Personalizado de una sola sesión: mínimo 1.
 */
export function computeReportReadiness(
  input: ReportReadinessInput,
): ReportEvidence {
  const { plan, sessions, evaluations, periodStart, periodEnd } = input;
  const minimum = minimumEvaluations(plan);

  const periodSessions = sessions.filter(
    (session) =>
      session.dateStr >= periodStart && session.dateStr <= periodEnd,
  );

  const attended = periodSessions.filter(
    (session) => session.status === "presente" || session.status === "tarde",
  ).length;

  const evaluated = evaluationKeys(
    evaluations,
    plan,
    periodStart,
    periodEnd,
  ).size;

  // Defensa: un reporte de clase implica una clase dictada, aunque la
  // asistencia no se haya marcado. Evita división por cero y coberturas >100 %.
  const effectiveAttended = Math.max(attended, evaluated);
  const coverage =
    effectiveAttended > 0
      ? Math.min(100, Math.round((evaluated / effectiveAttended) * 100))
      : null;

  const missing = Math.max(0, minimum - evaluated);
  const canGenerate =
    evaluated >= minimum && (attended > 0 || evaluated > 0);

  let level: ReportEvidenceLevel = "insuficiente";
  if (canGenerate && coverage !== null) {
    if (coverage >= COVERAGE_COMPLETE) level = "completo";
    else if (coverage >= COVERAGE_PARTIAL) level = "parcial";
    else level = "basico";
  }

  const label =
    level === "completo"
      ? "Completo"
      : level === "parcial"
        ? "Parcial"
        : level === "basico"
          ? "Básico"
          : "Insuficiente";

  let message: string;
  if (!canGenerate) {
    if (evaluated === 0 && attended === 0) {
      message =
        "No hay clases asistidas ni reportes de clase en el periodo. No se puede generar un informe.";
    } else if (missing > 0) {
      message = `Faltan ${missing} reporte(s) de clase para generar el informe (mínimo ${minimum}). Registra la clase en el portal docente.`;
    } else {
      message =
        "No hay clases asistidas en el periodo. No se puede generar un informe.";
    }
  } else if (level === "basico") {
    message = `Informe básico: ${evaluated} reporte(s) de clase sobre ${effectiveAttended} clase(s) asistida(s).`;
  } else if (level === "parcial") {
    message = `Informe parcial: ${evaluated} reporte(s) de clase sobre ${effectiveAttended} clase(s) asistida(s) (${coverage} %).`;
  } else {
    message = `Informe completo: ${evaluated} reporte(s) de clase sobre ${effectiveAttended} clase(s) asistida(s) (${coverage} %).`;
  }

  return {
    level,
    label,
    coverage,
    attended,
    evaluated,
    missing,
    minimum,
    canGenerate,
    message,
  };
}

export function computeStudentReportReadiness(
  input: ReportReadinessInput,
): ReportReadinessResult {
  return {
    evidence: computeReportReadiness(input),
    window: resolveReportWindow({
      plan: input.plan,
      sessions: input.sessions,
      evaluations: input.evaluations,
      kind: input.kind,
    }),
  };
}
