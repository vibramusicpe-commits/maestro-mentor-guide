/**
 * ================================================================
 * culqi.service.ts — Integración Culqi (Pasarela de Pago Peruana)
 * ================================================================
 *
 * FLUJO DE EDGES CULQI:
 *
 * [UI: Formulario de Pago con Tarjeta]
 *   │
 *   ├─[Edge: Tokenización Culqi.js]
 *   │    └─ Culqi.js → API de Culqi → Token tkn_...
 *   │
 *   ├─[Edge: RBAC Gate]
 *   │    └─ Solo super_admin puede procesar cargos con tarjeta
 *   │
 *   ├─[Edge: Crear Cargo vía backend seguro]
 *   │    └─ POST /api/culqi/charge (server-side con sk_)
 *   │         └─ Retorna charge_id chr_...
 *   │
 *   ├─[Edge: Success] → registerPayment con culqiChargeId + method:'Culqi'
 *   └─[Edge: Error]   → Mostrar mensaje de Culqi al usuario
 *
 * IMPORTANTE:
 * - La clave pública (pk_) va en el frontend (VITE_CULQI_PUBLIC_KEY).
 * - La clave secreta (sk_) NUNCA va en el frontend.
 *   Si no hay servidor dedicado, usar un Insforge Edge Function
 *   o Cloudflare Worker para el paso del cargo.
 *
 * Para Vibra Music: Los pagos por Yape/Efectivo/Transferencia son
 * el flujo principal. Culqi es para pagos online con tarjeta.
 * ================================================================
 */

// ---------------------------------------------------------------
// Tipos Culqi
// ---------------------------------------------------------------
export interface CulqiTokenResult {
  id: string;         // tkn_...
  email: string;
  card_number: string;
  last_four: string;
}

export interface CulqiChargeRequest {
  tokenId: string;      // tkn_... generado por Culqi.js
  amount: number;       // En céntimos: S/ 297.00 → 29700
  currency: "PEN";
  email: string;
  description: string;  // Ej. "Mensualidad Junio 2025 - Familia García"
}

export interface CulqiChargeResponse {
  id: string;           // chr_...
  amount: number;
  currency_code: string;
  email: string;
  outcome: { type: string; merchant_message: string };
}

// ---------------------------------------------------------------
// Configuración Culqi (solo clave pública en frontend)
// ---------------------------------------------------------------
const CULQI_PUBLIC_KEY =
  import.meta.env.VITE_CULQI_PUBLIC_KEY || "pk_test_TuClavePublicaCulqi";

// ---------------------------------------------------------------
// EDGE: loadCulqiJS
// Carga el script de Culqi.js dinámicamente si no está cargado.
// ---------------------------------------------------------------
export async function loadCulqiJS(): Promise<void> {
  if (typeof window === "undefined") return;
  if ((window as any).Culqi) return; // Ya cargado

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.culqi.com/js/v4";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Culqi.js"));
    document.head.appendChild(script);
  });
}

// ---------------------------------------------------------------
// EDGE: createCulqiToken
// Tokeniza los datos de la tarjeta de forma segura (PCI DSS).
// Devuelve un token tkn_... para enviarlo al backend.
// ---------------------------------------------------------------
export async function createCulqiToken(cardData: {
  cardNumber: string;
  cvv: string;
  expirationMonth: string;
  expirationYear: string;
  email: string;
}): Promise<CulqiTokenResult> {
  await loadCulqiJS();

  return new Promise((resolve, reject) => {
    const culqi = new (window as any).Culqi({ publicKey: CULQI_PUBLIC_KEY });

    culqi.createToken({
      card_number: cardData.cardNumber.replace(/\s/g, ""),
      cvv: cardData.cvv,
      expiration_month: cardData.expirationMonth,
      expiration_year: cardData.expirationYear,
      email: cardData.email,
    })
      .then((token: CulqiTokenResult) => resolve(token))
      .catch((error: unknown) => {
        reject(new Error(`Culqi Error: ${JSON.stringify(error)}`));
      });
  });
}

// ---------------------------------------------------------------
// EDGE: processCulqiCharge
// Envía el token al backend (Insforge Edge Function o proxy)
// para crear el cargo real. La sk_ NUNCA toca el frontend.
//
// Endpoint: /api/culqi/charge (a implementar en server.ts)
// ---------------------------------------------------------------
export async function processCulqiCharge(
  req: CulqiChargeRequest,
): Promise<CulqiChargeResponse> {
  const response = await fetch("/api/culqi/charge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source_id: req.tokenId,
      amount: req.amount,       // En céntimos (S/ 297 → 29700)
      currency_code: req.currency,
      email: req.email,
      description: req.description,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    const userMsg =
      err?.user_message ||
      err?.merchant_message ||
      "Error al procesar el pago. Intenta de nuevo.";
    throw new Error(userMsg);
  }

  return response.json();
}

// ---------------------------------------------------------------
// HELPER: formatAmountForCulqi
// Convierte soles a céntimos para la API de Culqi.
// S/ 297.00 → 29700
// ---------------------------------------------------------------
export function formatAmountForCulqi(amountSoles: number): number {
  return Math.round(amountSoles * 100);
}
