/**
 * ================================================================
 * Snapshot pedagógico de asistencia
 * ================================================================
 *
 * Envuelve el motor oficial (`computeStudentCycleSessions` +
 * `computeStudentCycleLiquidation`) para que los informes de progreso no
 * dupliquen reglas de cuota, recuperaciones, transiciones ni exclusiones.
 *
 * Lo que devuelve:
 *   - Asistencia del período (presente/falta/tarde/justificada/pendiente).
 *   - Estado del ciclo contractual (cuota, asistidas, créditos, %).
 *   - Repertorio consolidado desde las evaluaciones del período.
 *   - Campos extra consolidados (último snapshot por campo).
 *
 * Lo que NO devuelve:
 *   - Precios, abonos, saldos, facturas ni auditoría financiera.
 */

import {
  computeStudentCycleLiquidation,
  computeStudentCycleSessions,
  type StudentSessionItem,
} from "@/lib/kardex-calculator";
import type { AdminStudent, ScheduledLesson } from "@/store/admin-seeds";
import type {
  AttendanceCycleSummary,
  AttendancePeriodSummary,
  AttendanceSnapshot,
  ExtraScoreSnapshot,
  LessonEvaluationRow,
  ProgressReportPeriodType,
  RepertoireItem,
  SessionLogEntry,
} from "./types";
import {
  buildReportPlanContext,
  computeReportReadiness,
} from "./report-readiness";
import { buildSessionLog } from "./session-log";
import {
  aggregateRepertoire,
  asArray,
  deepFreeze,
  isIsoDate,
  toIsoDate,
} from "./utils";

export interface BuildAttendanceSnapshotInput {
  student: AdminStudent;
  allSchedule: ScheduledLesson[];
  periodStart: string;
  periodEnd: string;
  evaluations?: LessonEvaluationRow[];
  /** Tipo de informe; define la ventana y la consolidación de la bitácora. */
  kind?: ProgressReportPeriodType;
}

/**
 * Tipo por defecto cuando el llamador no lo indica: los paquetes flexibles,
 * personalizados y demos cierran ciclo; el resto informa su ciclo mensual.
 */
function defaultKindForPlan(plan: {
  isFlexiblePackage: boolean;
  isPersonalized: boolean;
  isDemo: boolean;
}): ProgressReportPeriodType {
  if (plan.isFlexiblePackage || plan.isPersonalized || plan.isDemo) {
    return "cierre_ciclo";
  }
  return "mensual";
}

function summarizePeriod(
  sessions: StudentSessionItem[],
  periodStart: string,
  periodEnd: string,
): AttendancePeriodSummary {
  let present = 0;
  let absent = 0;
  let late = 0;
  let justified = 0;
  let pending = 0;

  for (const session of sessions) {
    switch (session.status) {
      case "presente":
        present++;
        break;
      case "ausente":
        absent++;
        break;
      case "tarde":
        late++;
        break;
      case "justificada":
        justified++;
        break;
      default:
        pending++;
        break;
    }
  }

  const total = sessions.length;
  const evaluated = present + absent + late + justified;

  return {
    start: periodStart,
    end: periodEnd,
    present,
    absent,
    late,
    justified,
    pending,
    total,
    evaluated,
    attendanceRate:
      evaluated > 0 ? Math.round(((present + late) / evaluated) * 100) : null,
  };
}

function summarizeCycle(
  student: AdminStudent,
  sessions: StudentSessionItem[],
): AttendanceCycleSummary {
  // El quinto argumento vacío evita que la liquidación consulte facturas y
  // mantiene el snapshot estrictamente pedagógico.
  const liquidation = computeStudentCycleLiquidation(
    student,
    sessions,
    undefined,
    undefined,
    [],
  );

  return {
    targetQuota: liquidation.targetQuota,
    attended: liquidation.attendedCount,
    missed: liquidation.missedCount,
    justified: liquidation.justifiedCount,
    tardy: liquidation.tardyCount,
    pending: liquidation.pendingCount,
    makeups: liquidation.makeupCount,
    makeupCreditsAvailable: liquidation.makeupCreditsAvailable,
    completionPercentage: liquidation.completionPercentage,
    isCompleted: liquidation.isCompleted,
  };
}

function aggregateExtraScores(
  evaluations: LessonEvaluationRow[],
): ExtraScoreSnapshot[] {
  const ordered = [...evaluations].sort((a, b) => {
    const byDate = a.session_date.localeCompare(b.session_date);
    if (byDate !== 0) return byDate;
    return (a.start_time || "").localeCompare(b.start_time || "");
  });

  const latest = new Map<string, ExtraScoreSnapshot>();

  for (const evaluation of ordered) {
    for (const raw of asArray<ExtraScoreSnapshot>(evaluation.extra_scores)) {
      const label = String(raw.label || "").trim();
      if (!label) continue;
      const key =
        (raw.field_id && `id:${raw.field_id}`) ||
        (raw.field_key && `key:${raw.field_key}`) ||
        `label:${label}`;
      latest.set(key, {
        field_id: raw.field_id ?? null,
        field_key: raw.field_key ?? null,
        label,
        type: raw.type || "short_text",
        raw_value: raw.raw_value ?? null,
        band: raw.band ?? null,
      });
    }
  }

  return [...latest.values()].sort((a, b) =>
    a.label.localeCompare(b.label, "es", { sensitivity: "base" }),
  );
}

export function buildAttendanceSnapshot(
  input: BuildAttendanceSnapshotInput,
): Readonly<AttendanceSnapshot> {
  const periodStart = toIsoDate(input.periodStart);
  const periodEnd = toIsoDate(input.periodEnd);

  if (!isIsoDate(periodStart) || !isIsoDate(periodEnd)) {
    throw new Error("El período debe tener fechas YYYY-MM-DD.");
  }
  if (periodStart > periodEnd) {
    throw new Error("La fecha de inicio del período no puede ser posterior al fin.");
  }

  const allSchedule = Array.isArray(input.allSchedule) ? input.allSchedule : [];
  const allSessions = computeStudentCycleSessions({
    student: input.student,
    allSchedule,
  });

  const periodSessions = allSessions.filter(
    (session) => session.dateStr >= periodStart && session.dateStr <= periodEnd,
  );

  const evaluations = (input.evaluations || []).filter((evaluation) => {
    const date = String(evaluation.session_date || "").slice(0, 10);
    return isIsoDate(date) && date >= periodStart && date <= periodEnd;
  });

  const plan = buildReportPlanContext(input.student, allSessions, evaluations);
  const evidence = computeReportReadiness({
    plan,
    sessions: allSessions,
    evaluations,
    periodStart,
    periodEnd,
    kind: input.kind || defaultKindForPlan(plan),
  });

  const attendanceByDate: Record<string, SessionLogEntry["attendance"]> = {};
  for (const session of periodSessions) {
    const current = attendanceByDate[session.dateStr];
    if (current === "presente" || current === "tarde") continue;
    attendanceByDate[session.dateStr] = session.status;
  }

  const sessionLog = buildSessionLog({
    evaluations,
    isIntensive: plan.isIntensive,
    attendanceByDate,
  });

  const repertoire: RepertoireItem[] = aggregateRepertoire(
    evaluations.map((evaluation) => ({
      session_date: evaluation.session_date,
      start_time: evaluation.start_time,
      repertoire: evaluation.repertoire,
    })),
  );

  const snapshot: AttendanceSnapshot = {
    studentId: input.student.id,
    studentName: input.student.name,
    instrument: input.student.instrument,
    level: input.student.level,
    modality: String(input.student.modality || ""),
    teacher: input.student.teacher,
    period: summarizePeriod(periodSessions, periodStart, periodEnd),
    cycle: summarizeCycle(input.student, allSessions),
    repertoire,
    extraScores: aggregateExtraScores(evaluations),
    plan,
    evidence,
    sessionLog,
    generatedAt: new Date().toISOString(),
  };

  return deepFreeze(snapshot);
}
