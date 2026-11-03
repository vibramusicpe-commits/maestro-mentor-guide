/**
 * use-session-evaluations.ts — Bitácoras registradas por sesión (ADR-0184)
 *
 * Permite que el Kiosco docente sepa si una clase YA tiene bitácora
 * ("✓ Bitácora registrada"), en vez de mostrar siempre el mismo botón.
 *
 * Reglas:
 *   - Usa `getStudentEvaluations`, que filtra `is_test = false` por defecto.
 *   - PROHIBIDO usar `getEvaluationBySessionKey`: NO filtra `is_test`
 *     (AGENTS §86.6) y marcaría como real una bitácora de prueba.
 *   - Una sola consulta por alumno y rango de fechas; nunca por tarjeta.
 *   - Cualquier error ⇒ mapa vacío (la UI degrada a "sin registrar"),
 *     jamás rompe el Kiosco.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getStudentEvaluations } from "@/lib/services/evaluations.service";
import type { LessonEvaluationRow } from "@/lib/informes/types";

/** Clave determinista de una sesión: `YYYY-MM-DD::HH:MM`. */
export function sessionEvaluationKey(sessionDate?: string | null, startTime?: string | null): string {
  const date = (sessionDate || "").trim();
  const time = (startTime || "").trim().slice(0, 5);
  if (!date || !time) return "";
  return `${date}::${time}`;
}

/**
 * Carga las bitácoras de un alumno en un rango y las indexa por sesión.
 *
 * @param studentIds UUIDs visibles en el Kiosco (se consulta cada uno una vez).
 * @param from       Inicio del rango (`YYYY-MM-DD`).
 * @param to         Fin del rango (`YYYY-MM-DD`).
 */
export function useSessionEvaluations(
  studentIds: string[],
  from: string,
  to: string,
): {
  evaluated: Set<string>;
  isLoading: boolean;
  refresh: () => void;
} {
  const [rows, setRows] = useState<LessonEvaluationRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tick, setTick] = useState(0);

  // Firma estable: evita refetch por cambios de identidad del arreglo.
  const idsKey = useMemo(
    () => Array.from(new Set(studentIds.filter(Boolean))).sort().join(","),
    [studentIds],
  );

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const ids = idsKey ? idsKey.split(",") : [];
    if (ids.length === 0 || !from || !to) {
      setRows([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    Promise.all(
      ids.map((studentId) =>
        getStudentEvaluations(studentId, { from, to }).catch(() => [] as LessonEvaluationRow[]),
      ),
    )
      .then((groups) => {
        if (cancelled || !mounted.current) return;
        setRows(groups.flat());
      })
      .catch(() => {
        if (cancelled || !mounted.current) return;
        setRows([]);
      })
      .finally(() => {
        if (cancelled || !mounted.current) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [idsKey, from, to, tick]);

  const evaluated = useMemo(() => {
    const set = new Set<string>();
    for (const row of rows) {
      if (row.is_test) continue; // defensa extra, el servicio ya filtra
      const key = sessionEvaluationKey(row.session_date, row.start_time);
      if (key) set.add(key);
    }
    return set;
  }, [rows]);

  const refresh = useCallback(() => setTick((value) => value + 1), []);

  return { evaluated, isLoading, refresh };
}
