import { useEffect, useState } from "react";
import type { ProgressReportsAccess } from "@/lib/services/feature-flags.service";
import { getProgressReportsAccess } from "@/lib/services/feature-flags.service";
import { isInformesEnabledByEnv } from "@/lib/features";

export interface InformesAccess extends ProgressReportsAccess {
  /** La consulta de flags todavía está en vuelo. */
  loading: boolean;
}

const DISABLED: InformesAccess = {
  panel: false,
  family: false,
  source: "none",
  loading: false,
};

/**
 * Gate de UI del módulo de Informes (Fase 7, ADR-0178).
 *
 * - `panel`: Dirección/Secretaría puede ver la bandeja de informes.
 * - `family`: el portal familia puede ver la pestaña "Progreso".
 *
 * La respuesta sale de PostgreSQL (`feature_flags` + `pilot_teacher_ids`),
 * con el kill switch de build `VITE_FEATURE_INFORMES=false` por encima.
 * Ante cualquier error, todo queda cerrado.
 */
export function useInformesAccess(): InformesAccess {
  const [access, setAccess] = useState<InformesAccess>({
    ...DISABLED,
    loading: isInformesEnabledByEnv(),
  });

  useEffect(() => {
    if (!isInformesEnabledByEnv()) {
      setAccess(DISABLED);
      return;
    }

    let cancelled = false;

    getProgressReportsAccess()
      .then((resolved) => {
        if (cancelled) return;
        setAccess({ ...resolved, loading: false });
      })
      .catch(() => {
        if (!cancelled) setAccess(DISABLED);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return access;
}
