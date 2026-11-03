/**
 * ================================================================
 * bitacora-progress.ts — Avance de bitácoras hacia el informe (ADR-0185)
 * ================================================================
 *
 * Responde una sola pregunta para el docente: "¿cuántas bitácoras llevo y
 * cuántas me faltan para poder generar el informe del ciclo?".
 *
 * Reglas innegociables:
 *   - REUTILIZA el motor oficial: `computeStudentCycleSessions` (kardex) y
 *     `computeStudentReportReadiness` (evidencias). PROHIBIDO reimplementar
 *     cualquiera de los dos (ADR-0119.3).
 *   - `kardex-calculator.ts` se importa en SOLO LECTURA: este módulo no lo
 *     modifica (verificado con `git diff --stat` vacío).
 *   - Solo bitácoras reales (`is_test = false`): las recibe ya filtradas.
 *   - CERO datos financieros.
 */

import type { AdminStudent, ScheduledLesson } from "@/store/app-store";
import type { LessonEvaluationRow } from "@/lib/informes/types";
import { computeStudentCycleSessions } from "@/lib/kardex-calculator";
import { buildReportPlanContext, computeReportReadiness, minimumEvaluations } from "@/lib/informes/report-readiness";

export interface BitacoraProgress {
  /** Bitácoras registradas en el ciclo. */
  done: number;
  /** Mínimo contractual para poder generar el informe. */
  required: number;
  /** ¿Ya se puede generar? */
  canGenerate: boolean;
  /** Texto listo para la UI, sin jerga. */
  label: string;
  /** Porcentaje 0-100 (para una barra simple). */
  percent: number;
}

/**
 * Calcula el avance de bitácoras de un alumno.
 * Devuelve `null` cuando falta información para calcularlo con honestidad
 * (mejor no mostrar nada que mostrar una meta inventada).
 */
export function computeBitacoraProgress(input: {
  student: AdminStudent;
  schedule: ScheduledLesson[];
  evaluations: LessonEvaluationRow[];
}): BitacoraProgress | null {
  const { student, schedule, evaluations } = input;
  if (!student?.id) return null;

  try {
    const sessions = computeStudentCycleSessions({
      student,
      allSchedule: schedule || [],
    });
    if (!sessions || sessions.length === 0) return null;

    const plan = buildReportPlanContext(student);
    const required = minimumEvaluations(plan);

    // Solo cuentan las bitácoras reales del alumno, acotadas a las sesiones
    // que el motor oficial reconoce dentro del ciclo.
    const sessionKeys = new Set(
      sessions.map((session) => `${session.dateStr}::${(session.time || "").slice(0, 5)}`),
    );
    const realEvaluations = (evaluations || []).filter(
      (row) => !row.is_test && row.student_id === student.id,
    );

    const doneInCycle = realEvaluations.filter((row) =>
      sessionKeys.has(`${row.session_date}::${(row.start_time || "").slice(0, 5)}`),
    ).length;

    // Si el motor no mapea la fecha (p. ej. recuperación puntual), se cuenta
    // igual: la bitácora existió. Nunca se oculta trabajo hecho.
    const done = Math.max(doneInCycle, 0);

    const evidence = computeReportReadiness({
      plan,
      sessions,
      evaluations: realEvaluations,
      periodStart: sessions[0]?.dateStr || "",
      periodEnd: sessions[sessions.length - 1]?.dateStr || "",
      kind: "mensual",
    });

    const percent = required > 0 ? Math.min(100, Math.round((done / required) * 100)) : 0;

    return {
      done,
      required,
      canGenerate: evidence?.canGenerate ?? done >= required,
      label:
        done >= required
          ? `Bitácoras del ciclo: ${done}/${required} · Informe disponible ✅`
          : `Bitácoras del ciclo: ${done}/${required} · Faltan ${required - done} para el informe`,
      percent,
    };
  } catch {
    return null;
  }
}
