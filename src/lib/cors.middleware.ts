/**
 * ================================================================
 * cors.middleware.ts — CORS Dinámico para Cloudflare Workers
 * ================================================================
 *
 * PROBLEMA QUE RESUELVE:
 * Al operar en dos dominios simultáneamente (Fase 1: .pages.dev,
 * Fase 2: vibramusic.com), el CORS estático rompe el pre-flight.
 *
 * SOLUCIÓN: CORS dinámico via variable de entorno ALLOWED_ORIGINS.
 * El edge lee ALLOWED_ORIGINS, valida el Origin del request y solo
 * añade el header si el origen está en la lista permitida.
 *
 * CONFIGURACIÓN EN CLOUDFLARE:
 *   Workers & Pages → Settings → Environment Variables:
 *   ALLOWED_ORIGINS=https://cadencia.pages.dev,https://vibramusic.com
 *
 * ================================================================
 *
 * EDGE DE CORS:
 *
 * [Request entrante]
 *   │
 *   ├─[Pre-flight OPTIONS] → responde headers CORS + 204 (sin tocar el handler)
 *   │
 *   ├─[Origin Check]
 *   │    ├─ Origen en ALLOWED_ORIGINS → añade Access-Control-Allow-Origin
 *   │    └─ Origen desconocido → NO añade headers (CORS bloqueado)
 *   │
 *   └─[Response] → pasa con headers CORS inyectados
 * ================================================================
 */

export interface CorsEnv {
  ALLOWED_ORIGINS?: string;   // CSV: "https://cadencia.pages.dev,https://vibramusic.com"
}

// ---------------------------------------------------------------
// Orígenes por defecto (development + staging Cloudflare Pages)
// Sobrescritos en producción por la variable de entorno.
// ---------------------------------------------------------------
const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://cadencia.pages.dev",         // Placeholder — actualizar con tu subdominio real
];

const CORS_HEADERS_BASE = {
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, apikey, X-Client-Info, X-Supabase-Api-Version",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true",
};

// ---------------------------------------------------------------
// Determina si el origen del request está en la lista permitida.
// Soporta wildcards parciales para subdominios de pages.dev.
// ---------------------------------------------------------------
function isOriginAllowed(origin: string, allowed: string[]): boolean {
  return allowed.some((allowedOrigin) => {
    if (allowedOrigin === origin) return true;
    // Soporte para wildcard de subdominio: *.pages.dev
    if (allowedOrigin.startsWith("*.")) {
      const suffix = allowedOrigin.slice(1); // ".pages.dev"
      return origin.endsWith(suffix);
    }
    return false;
  });
}

// ---------------------------------------------------------------
// corsMiddleware — Wrappea el fetch handler principal.
// Usar en server.ts o en el Cloudflare Worker entry point.
// ---------------------------------------------------------------
export function withCors(
  handler: (request: Request, env: CorsEnv & Record<string, unknown>, ctx: unknown) => Promise<Response>,
) {
  return async (
    request: Request,
    env: CorsEnv & Record<string, unknown>,
    ctx: unknown,
  ): Promise<Response> => {
    const origin = request.headers.get("Origin") ?? "";

    // Parsear orígenes desde variable de entorno (CSV) o usar defaults
    const allowedOrigins: string[] = env.ALLOWED_ORIGINS
      ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : DEFAULT_ORIGINS;

    const originAllowed = isOriginAllowed(origin, allowedOrigins);

    // [Pre-flight Edge] — Responder OPTIONS sin invocar el handler
    if (request.method === "OPTIONS") {
      const preflightHeaders: Record<string, string> = {
        ...CORS_HEADERS_BASE,
      };
      if (originAllowed) {
        preflightHeaders["Access-Control-Allow-Origin"] = origin;
      }
      return new Response(null, { status: 204, headers: preflightHeaders });
    }

    // [Handler Edge] — Ejecutar el handler real
    const response = await handler(request, env, ctx);

    // [Inject CORS Headers Edge] — Solo si el origen está permitido
    if (originAllowed) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Access-Control-Allow-Origin", origin);
      Object.entries(CORS_HEADERS_BASE).forEach(([k, v]) => {
        newHeaders.set(k, v);
      });
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    return response;
  };
}

// ---------------------------------------------------------------
// getCorsHeaders — Utilidad para construir headers CORS en RPCs
// individuales (cuando no se puede wrappear el handler completo).
// ---------------------------------------------------------------
export function getCorsHeaders(
  requestOrigin: string,
  allowedOrigins: string[] = DEFAULT_ORIGINS,
): Record<string, string> {
  if (!isOriginAllowed(requestOrigin, allowedOrigins)) return {};

  return {
    "Access-Control-Allow-Origin": requestOrigin,
    ...CORS_HEADERS_BASE,
  };
}
