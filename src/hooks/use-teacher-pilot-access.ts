import { useEffect, useState } from "react";
import {
  getFamilyNotesAccess,
  getFeatureFlags,
  getInternalNotesAccess,
  getOrgSetting,
} from "@/lib/services/feature-flags.service";

export interface TeacherPilotAccess {
  loading: boolean;
  /** Registro de clase / evaluación (Fase 2). */
  classLogAccess: boolean;
  /** Nota a la familia con moderación (Fase 3). */
  familyNoteAccess: boolean;
  /** Nota interna a Dirección (Fase 4). */
  internalNoteAccess: boolean;
  /** Informes de progreso del docente (Fase C del plan por tipo de plan). */
  progressReportsAccess: boolean;
  /** El docente está en `org_settings.pilot_teacher_ids`. */
  isPilotTeacher: boolean;
  /** Al menos un flag global de las fases 2-4 está encendido. */
  v2FlagsOn: boolean;
}

const EMPTY_ACCESS: TeacherPilotAccess = {
  loading: false,
  classLogAccess: false,
  familyNoteAccess: false,
  internalNoteAccess: false,
  progressReportsAccess: false,
  isPilotTeacher: false,
  v2FlagsOn: false,
};

/**
 * Permisos del piloto de evaluaciones/notas para un docente.
 *
 * Reproduce exactamente la consulta que hacía el kiosco (flags + lista de
 * pilotos + accesos por fase) para que la pestaña de notas use el mismo gate.
 * Ante cualquier error, todo queda cerrado.
 */
export function useTeacherPilotAccess(teacherId?: string | null): TeacherPilotAccess {
  const [access, setAccess] = useState<TeacherPilotAccess>({
    ...EMPTY_ACCESS,
    loading: Boolean(teacherId),
  });

  useEffect(() => {
    if (!teacherId) {
      setAccess(EMPTY_ACCESS);
      return;
    }

    let cancelled = false;

    Promise.all([
      getFeatureFlags(),
      getOrgSetting<string[]>("pilot_teacher_ids", []),
      getFamilyNotesAccess(teacherId),
      getInternalNotesAccess(teacherId),
    ])
      .then(([flags, pilots, familyAccess, internalAccess]) => {
        if (cancelled) return;

        const pilotList = Array.isArray(pilots) ? pilots.map(String) : [];
        const isPilotTeacher = pilotList.includes(teacherId);

        setAccess({
          loading: false,
          classLogAccess: Boolean(flags.evaluationsV2 || isPilotTeacher),
          familyNoteAccess: Boolean(familyAccess.teacher),
          internalNoteAccess: Boolean(internalAccess.teacher),
          progressReportsAccess: Boolean(
            flags.progressReportsV2 || isPilotTeacher,
          ),
          isPilotTeacher,
          v2FlagsOn: Boolean(
            flags.evaluationsV2 || flags.familyNotesV2 || flags.progressReportsV2,
          ),
        });
      })
      .catch(() => {
        if (!cancelled) setAccess(EMPTY_ACCESS);
      });

    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  return access;
}
