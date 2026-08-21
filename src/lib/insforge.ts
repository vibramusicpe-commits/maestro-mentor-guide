/**
 * ================================================================
 * Cliente Insforge v2 — Vibra Music / Cadencia
 * ================================================================
 *
 * ARQUITECTURA DE EDGES (Insforge Node-Graph):
 * ─────────────────────────────────────────────
 * Cada función aquí representa un "edge" tipado del grafo de backend:
 *
 *  [Nodo Origen: UI Action]
 *       │
 *       ▼
 *  [Edge: RBAC Gate] ──── ❌ Rol no autorizado → Error 403 (fallback)
 *       │ ✅ Autorizado
 *       ▼
 *  [Edge: Payload Extractor] — Solo extrae campos necesarios
 *       │
 *       ▼
 *  [Nodo Destino: Insforge PostgREST / RPC]
 *       │
 *  ┌────┴────┐
 *  ▼         ▼
 * Success   Error → Fallback Routing (toast + syncQueue)
 *
 * Variables de entorno requeridas en .env.local:
 *   VITE_INSFORGE_URL      → https://pdey9yma.us-east.insforge.app/rest/v1
 *   VITE_INSFORGE_ANON_KEY → anon_897abc...
 *
 * La clave anónima es segura en el frontend porque el RLS de PostgreSQL
 * en Insforge filtra los datos por rol/usuario en cada query.
 * ================================================================
 */

import type { Role } from "@/store/app-store";

// ---------------------------------------------------------------
// Configuración base
// ---------------------------------------------------------------
export const INSFORGE_CONFIG = {
  baseUrl:
    import.meta.env.VITE_INSFORGE_URL ||
    "https://pdey9yma.us-east.insforge.app/rest/v1",
  anonKey:
    import.meta.env.VITE_INSFORGE_ANON_KEY ||
    "anon_897abc3685c27a2e113b8022caaf12a8dc8233b25aa9ce5397c83ffa88362804",
  isConfigured: true,
};

// ---------------------------------------------------------------
// Token de sesión activo (JWT del usuario autenticado)
// Se actualiza tras el login con auth.setSession()
// ---------------------------------------------------------------
let _sessionToken: string | null = null;

export function setSessionToken(token: string | null) {
  _sessionToken = token;
}

// ---------------------------------------------------------------
// Headers estándar PostgREST (Insforge)
// Siempre se incluyen: apikey + Authorization + Content-Type
// ---------------------------------------------------------------
function buildHeaders(extra: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: INSFORGE_CONFIG.anonKey,                     // Requerido por PostgREST
    Authorization: `Bearer ${_sessionToken ?? INSFORGE_CONFIG.anonKey}`,
    ...extra,
  };
  return headers;
}

// ---------------------------------------------------------------
// Errores tipados del sistema de Edges
// ---------------------------------------------------------------
export class InsforgeEdgeError extends Error {
  constructor(
    public code: "MOCK_MODE" | "PERMISSION_DENIED" | "NOT_FOUND" | "API_ERROR" | "NETWORK_ERROR",
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "InsforgeEdgeError";
  }
}

// ---------------------------------------------------------------
// EDGE PRIMARIO: fetchFromInsforge
// Punto de entrada para todas las peticiones al backend.
// Aplica: validación de configuración, headers, manejo de errores.
// ---------------------------------------------------------------
export async function fetchFromInsforge<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (!INSFORGE_CONFIG.isConfigured) {
    throw new InsforgeEdgeError(
      "MOCK_MODE",
      "[Insforge] Operando en modo Mock/Local. Configura VITE_INSFORGE_URL.",
    );
  }

  let response: Response;
  try {
    response = await fetch(`${INSFORGE_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...buildHeaders(),
        ...(options.headers as Record<string, string> | undefined),
      },
    });
  } catch (networkErr) {
    throw new InsforgeEdgeError("NETWORK_ERROR", `Error de red: ${networkErr}`);
  }

  if (response.status === 403 || response.status === 401) {
    throw new InsforgeEdgeError(
      "PERMISSION_DENIED",
      `Acceso denegado (${response.status}). Verifica el rol del usuario y las políticas RLS.`,
      response.status,
    );
  }

  if (response.status === 404) {
    throw new InsforgeEdgeError("NOT_FOUND", `[Modo Híbrido MVP] Endpoint local/PostgREST en caché: ${endpoint}`, 404);
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new InsforgeEdgeError(
      "API_ERROR",
      `[Insforge ${response.status}]: ${errText}`,
      response.status,
    );
  }

  // PostgREST devuelve 204 sin cuerpo en DELETE/PATCH exitosos
  if (response.status === 204) return {} as T;

  return response.json();
}

// ---------------------------------------------------------------
// EDGE: RBAC Gate (validación de roles antes de la petición)
// Uso: assertRole(activeRole, ['super_admin', 'staff'])
// Si el rol no está permitido → lanza InsforgeEdgeError
// ---------------------------------------------------------------
export function assertRole(
  userRole: Role,
  allowedRoles: Role[],
  context = "esta acción",
): void {
  if (!allowedRoles.includes(userRole)) {
    throw new InsforgeEdgeError(
      "PERMISSION_DENIED",
      `El rol '${userRole}' no está autorizado para ${context}. Roles permitidos: ${allowedRoles.join(", ")}.`,
    );
  }
}

// ---------------------------------------------------------------
// HELPER: SELECT con filtros PostgREST
// Ejemplo: postgrestSelect('/students', { status: 'eq.activo' })
// ---------------------------------------------------------------
export async function postgrestSelect<T>(
  table: string,
  params: Record<string, string> = {},
  select = "*",
): Promise<T[]> {
  const qs = new URLSearchParams({ select, ...params });
  return fetchFromInsforge<T[]>(`/${table}?${qs.toString()}`);
}

// ---------------------------------------------------------------
// HELPER: INSERT (single row)
// ---------------------------------------------------------------
export async function postgrestInsert<T>(
  table: string,
  payload: Partial<T>,
): Promise<T> {
  const result = await fetchFromInsforge<T[]>(`/${table}`, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  return result[0]!;
}

// ---------------------------------------------------------------
// HELPER: PATCH (update por filtro)
// Ejemplo: postgrestPatch('/students', { id: 'eq.abc' }, { status: 'baja' })
// ---------------------------------------------------------------
export async function postgrestPatch<T>(
  table: string,
  filter: Record<string, string>,
  payload: Partial<T>,
): Promise<T> {
  const qs = new URLSearchParams(filter);
  const result = await fetchFromInsforge<T[]>(`/${table}?${qs.toString()}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  return result[0]!;
}

// ---------------------------------------------------------------
// HELPER: RPC (llamar a funciones PostgreSQL)
// Ejemplo: postgrestRPC('get_invoices_due_soon', { days_ahead: 2 })
// ---------------------------------------------------------------
export async function postgrestRPC<T>(
  functionName: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  return fetchFromInsforge<T>(`/rpc/${functionName}`, {
    method: "POST",
    body: JSON.stringify(args),
  });
}

// ---------------------------------------------------------------
// HELPER: DELETE por filtro
// ---------------------------------------------------------------
export async function postgrestDelete(
  table: string,
  filter: Record<string, string>,
): Promise<void> {
  const qs = new URLSearchParams(filter);
  await fetchFromInsforge<unknown>(`/${table}?${qs.toString()}`, {
    method: "DELETE",
  });
}
