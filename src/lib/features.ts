/**
 * ================================================================
 * features.ts — Interruptores de despliegue de producto
 * ================================================================
 *
 * Fase 7 (ADR-0178). Un único lugar para saber si el módulo de Informes
 * está habilitado en el build actual.
 *
 * Reglas:
 * - `VITE_FEATURE_INFORMES=false` actúa como **kill switch** del cliente:
 *   apaga la bandeja de Dirección, la pestaña de Informes y el portal
 *   familia de progreso, aunque PostgreSQL diga lo contrario.
 * - Cualquier otro valor (o ausente) **no fuerza nada**: la decisión real
 *   vive en `org_settings` (`feature_flags` + `pilot_teacher_ids`) y se
 *   resuelve en `feature-flags.service.ts`.
 * - No existe un "forzar encendido" por variable de entorno: abrir el
 *   portal a las familias exige `parentReports = true` en PostgreSQL.
 *
 * Abrir o cerrar el módulo no requiere desplegar: basta cambiar el flag
 * en `org_settings` (efecto en ≤ 30 s por el caché del servicio).
 */

function readEnvFlag(name: string): boolean | null {
  try {
    const raw = (import.meta as any)?.env?.[name];
    if (raw === undefined || raw === null || raw === "") return null;
    const value = String(raw).trim().toLowerCase();
    if (["1", "true", "on", "yes"].includes(value)) return true;
    if (["0", "false", "off", "no"].includes(value)) return false;
    return null;
  } catch {
    // Sin import.meta (por ejemplo, en un runner de pruebas) no se apaga nada.
    return null;
  }
}

export const FEATURES = {
  /** `null` = decide PostgreSQL · `false` = apagado por build. */
  informes: readEnvFlag("VITE_FEATURE_INFORMES"),
} as const;

/** `false` solo cuando el build trae el kill switch explícito. */
export function isInformesEnabledByEnv(): boolean {
  return FEATURES.informes !== false;
}
