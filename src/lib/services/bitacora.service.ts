/**
 * ================================================================
 * bitacora.service.ts — Historial de bitácoras clase por clase (ADR-0185)
 * ================================================================
 *
 * Lista las bitácoras (`lesson_evaluations`) de un rango de fechas para que
 * Dirección pueda LEERLAS (no solo contar cuántas hay) y para que el docente
 * revise lo que ya registró.
 *
 * Reglas innegociables:
 *   - `is_test = eq.false` SIEMPRE. Prohibido listar bitácoras de prueba en
 *     vistas de producción (ADR-0175 / ADR-0180).
 *   - Solo lectura: este servicio no crea, no edita y no borra.
 *   - CERO datos financieros: la bitácora es pedagógica por definición.
 *   - Es la ÚNICA fuente del listado. Prohibido reimplementar la consulta
 *     dentro de un componente (ADR-0119.3).
 */

import { postgrestSelect } from "@/lib/insforge";
import type { LessonEvaluationRow } from "@/lib/informes/types";

export interface BitacoraQuery {
  /** Inicio del rango (`YYYY-MM-DD`), inclusive. */
  from: string;
  /** Fin del rango (`YYYY-MM-DD`), inclusive. */
  to: string;
  /** Filtra por docente (UUID sintético o real). Opcional. */
  teacherId?: string | null;
  /** Filtra por alumno (UUID). Opcional. */
  studentId?: string | null;
  /** Tope defensivo de filas. Por defecto 500. */
  limit?: number;
}

function assertIsoDate(value: string, label: string): string {
  const clean = (value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    throw new Error(`${label} debe tener formato YYYY-MM-DD.`);
  }
  return clean;
}

/**
 * Bitácoras reales del rango, ordenadas de la más reciente a la más antigua.
 * Nunca devuelve filas `is_test = true`.
 */
export async function listBitacoras(query: BitacoraQuery): Promise<LessonEvaluationRow[]> {
  const from = assertIsoDate(query.from, "from");
  const to = assertIsoDate(query.to, "to");
  if (from > to) {
    throw new Error("La fecha inicial no puede ser posterior a la final.");
  }

  const limit = Math.min(Math.max(1, Math.trunc(query.limit ?? 500)), 1000);

  const params: Record<string, string> = {
    is_test: "eq.false",
    order: "session_date.desc,start_time.desc",
    limit: String(limit),
    and: `(session_date.gte.${from},session_date.lte.${to})`,
  };

  if (query.teacherId) params.teacher_id = `eq.${query.teacherId}`;
  if (query.studentId) params.student_id = `eq.${query.studentId}`;

  const rows = await postgrestSelect<LessonEvaluationRow>("lesson_evaluations", params, "*");

  // Defensa extra: el filtro ya va en la consulta, pero nunca se confía en el cliente.
  return rows.filter((row) => row.is_test === false);
}

/** Agrupa bitácoras por fecha (`YYYY-MM-DD`) conservando el orden recibido. */
export function groupBitacorasByDate(
  rows: LessonEvaluationRow[],
): Array<{ dateStr: string; rows: LessonEvaluationRow[] }> {
  const map = new Map<string, LessonEvaluationRow[]>();
  for (const row of rows) {
    const key = row.session_date;
    const bucket = map.get(key);
    if (bucket) bucket.push(row);
    else map.set(key, [row]);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dateStr, group]) => ({ dateStr, rows: group }));
}
