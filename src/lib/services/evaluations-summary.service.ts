/**
 * ================================================================
 * evaluations-summary.service.ts — Resumen de evaluaciones por alumno
 * ================================================================
 *
 * Servicio ligero para el Dashboard de Seguimiento de Informes.
 * Cruza las evaluaciones de clase (`lesson_evaluations`) con alumnos activos
 * sin necesidad de lanzar N consultas individuales.
 *
 * Reglas de negocio:
 *   - is_test = false siempre.
 *   - Solo lectura (no muta ni elimina datos).
 *   - Orden cronológico descendente para obtener última actividad.
 *   - Cero datos financieros.
 */

import { postgrestSelect } from "@/lib/insforge";
import type { LessonEvaluationRow } from "@/lib/informes/types";

export interface StudentEvaluationSummary {
  studentId: string;
  studentNameSnapshot: string | null;
  totalEvaluations: number;
  lastEvaluationDate: string | null;
  lastTeacherName: string | null;
  lastInstrument: string | null;
  evaluations: LessonEvaluationRow[];
}

/**
 * Consulta todas las evaluaciones reales (is_test = false) agrupadas por alumno.
 * Si se pasa un conjunto de `studentIds`, filtra para optimizar cuando sea necesario.
 */
export async function getEvaluationsSummaryMap(
  studentIds?: string[],
): Promise<Map<string, StudentEvaluationSummary>> {
  const params: Record<string, string> = {
    is_test: "eq.false",
    order: "session_date.desc,start_time.desc",
  };

  if (studentIds && studentIds.length > 0) {
    // Si la lista es finita y manejable (< 100), filtramos en PostgREST
    if (studentIds.length <= 100) {
      params.student_id = `in.(${studentIds.join(",")})`;
    }
  }

  const rows = await postgrestSelect<LessonEvaluationRow>(
    "lesson_evaluations",
    params,
    "*",
  );

  const summaryMap = new Map<string, StudentEvaluationSummary>();

  for (const row of rows) {
    if (!row.student_id) continue;
    const existing = summaryMap.get(row.student_id);
    if (!existing) {
      summaryMap.set(row.student_id, {
        studentId: row.student_id,
        studentNameSnapshot: row.student_name_snapshot || null,
        totalEvaluations: 1,
        lastEvaluationDate: row.session_date || null,
        lastTeacherName: row.teacher_name || null,
        lastInstrument: row.instrument || null,
        evaluations: [row],
      });
    } else {
      existing.totalEvaluations += 1;
      existing.evaluations.push(row);
      // Como vienen ordenadas por session_date.desc, la primera ya es la última
    }
  }

  return summaryMap;
}
