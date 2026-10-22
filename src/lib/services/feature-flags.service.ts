/**
 * ================================================================
 * feature-flags.service.ts — Flags de producto en org_settings
 * ================================================================
 *
 * Los flags viven en PostgreSQL (`org_settings.setting_key = 'feature_flags'`)
 * y se cachean 30 s para no consultar en cada render.
 *
 * Valor seguro por defecto: TODO APAGADO. Si la consulta falla, la app sigue
 * funcionando con el flujo anterior y no expone nada nuevo a las familias.
 */

import { postgrestSelect } from "@/lib/insforge";
import type { FeatureFlagKey, FeatureFlags } from "@/lib/informes/types";

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  evaluationsV2: false,
  familyNotesV2: false,
  progressReportsV2: false,
  parentReports: false,
};

const FLAG_KEYS: FeatureFlagKey[] = [
  "evaluationsV2",
  "familyNotesV2",
  "progressReportsV2",
  "parentReports",
];

const CACHE_TTL_MS = 30_000;

let cache: { value: FeatureFlags; at: number } | null = null;

/**
 * Lee un valor JSONB de `org_settings` (org_id NULL = configuración global).
 * Si no existe, devuelve el fallback.
 */
export async function getOrgSetting<T>(
  key: string,
  fallback: T,
): Promise<T> {
  const clean = (key || "").trim();
  if (!clean) return fallback;

  const rows = await postgrestSelect<{ setting_value: T }>(
    "org_settings",
    {
      setting_key: `eq.${clean}`,
      org_id: "is.null",
    },
    "setting_value",
  );

  if (!rows.length) return fallback;
  const value = rows[0]?.setting_value;
  return value === null || value === undefined ? fallback : value;
}

/**
 * Devuelve los flags normalizados. Solo acepta booleanos; cualquier valor
 * raro se ignora y queda el default seguro (false).
 */
export async function getFeatureFlags(
  options: { force?: boolean } = {},
): Promise<FeatureFlags> {
  if (!options.force && cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.value;
  }

  try {
    const raw = await getOrgSetting<Record<string, unknown>>(
      "feature_flags",
      {},
    );

    const value: FeatureFlags = { ...DEFAULT_FEATURE_FLAGS };
    for (const key of FLAG_KEYS) {
      if (raw && typeof raw[key] === "boolean") {
        value[key] = raw[key] as boolean;
      }
    }

    cache = { value, at: Date.now() };
    return value;
  } catch (error) {
    console.warn(
      "[FeatureFlags] No se pudo leer org_settings.feature_flags. Se usan valores seguros (todo apagado).",
      error,
    );
    cache = { value: { ...DEFAULT_FEATURE_FLAGS }, at: Date.now() };
    return { ...DEFAULT_FEATURE_FLAGS };
  }
}

/**
 * Atajo para condicionales de UI. Si ya tienes los flags cargados, pásalos
 * para evitar una consulta adicional.
 */
export async function isFeatureEnabled(
  flag: FeatureFlagKey,
  flags?: FeatureFlags,
): Promise<boolean> {
  const resolved = flags ?? (await getFeatureFlags());
  return Boolean(resolved[flag]);
}

/** Útil en pruebas o al cambiar flags desde Dirección. */
export function clearFeatureFlagsCache(): void {
  cache = null;
}

export interface FamilyNotesAccess {
  /** Formulario de nota del docente. */
  teacher: boolean;
  /** Bandeja de moderación de Dirección/Secretaría. */
  moderation: boolean;
  /** De dónde viene el acceso: flag global, piloto de docentes o ninguno. */
  source: "flag" | "pilot" | "none";
}

/**
 * Acceso a la Fase 3 (notas a familia + moderación).
 *
 * - Con `familyNotesV2 = true` se abre para todos.
 * - Sin flag, se abre solo por piloto: el docente debe estar en
 *   `pilot_teacher_ids`; la bandeja de Dirección aparece si hay al menos
 *   un docente en el piloto (para poder moderar lo que ellos envían).
 * - Ante cualquier error, todo cerrado.
 */
export async function getFamilyNotesAccess(
  teacherId?: string | null,
): Promise<FamilyNotesAccess> {
  try {
    const [flags, pilots] = await Promise.all([
      getFeatureFlags(),
      getOrgSetting<string[]>("pilot_teacher_ids", []),
    ]);

    const pilotList = Array.isArray(pilots) ? pilots.map(String) : [];

    if (flags.familyNotesV2) {
      return { teacher: true, moderation: true, source: "flag" };
    }

    if (pilotList.length > 0) {
      const clean = (teacherId || "").trim();
      return {
        teacher: Boolean(clean && pilotList.includes(clean)),
        moderation: true,
        source: "pilot",
      };
    }

    return { teacher: false, moderation: false, source: "none" };
  } catch {
    return { teacher: false, moderation: false, source: "none" };
  }
}

export interface InternalNotesAccess {
  /** Formulario de nota interna del docente. */
  teacher: boolean;
  /** Bandeja de Dirección/Secretaría. */
  inbox: boolean;
  /** De dónde viene el acceso: configuración explícita, piloto o ninguno. */
  source: "flag" | "pilot" | "none";
}

/**
 * Acceso a la Fase 4 (notas internas docente → Dirección).
 *
 * - Con `internal_notes_enabled = true` en `org_settings` se abre para todos.
 * - Sin esa clave, se abre solo por piloto (`pilot_teacher_ids`): el docente
 *   debe estar en la lista; la bandeja se muestra si hay al menos un docente
 *   en el piloto.
 * - Ante cualquier error, todo cerrado.
 *
 * Se controla por datos: abrir o cerrar no requiere desplegar.
 */
export async function getInternalNotesAccess(
  teacherId?: string | null,
): Promise<InternalNotesAccess> {
  try {
    const [enabled, pilots] = await Promise.all([
      getOrgSetting<boolean>("internal_notes_enabled", false),
      getOrgSetting<string[]>("pilot_teacher_ids", []),
    ]);

    const pilotList = Array.isArray(pilots) ? pilots.map(String) : [];

    if (enabled === true) {
      return { teacher: true, inbox: true, source: "flag" };
    }

    if (pilotList.length > 0) {
      const clean = (teacherId || "").trim();
      return {
        teacher: Boolean(clean && pilotList.includes(clean)),
        inbox: true,
        source: "pilot",
      };
    }

    return { teacher: false, inbox: false, source: "none" };
  } catch {
    return { teacher: false, inbox: false, source: "none" };
  }
}
