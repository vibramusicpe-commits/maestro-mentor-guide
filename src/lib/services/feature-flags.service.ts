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
