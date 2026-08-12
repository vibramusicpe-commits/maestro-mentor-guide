/**
 * Cliente de Conexión para Insforge Backend API (Vibra Music)
 * 
 * Permite alternar transparente entre el modo Prototipo/Mock (Zustand)
 * y la API de Producción en Insforge mediante variables de entorno:
 * VITE_INSFORGE_URL y VITE_INSFORGE_ANON_KEY
 */

export const INSFORGE_CONFIG = {
  baseUrl: import.meta.env.VITE_INSFORGE_URL || "https://api.insforge.app/v1",
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY || "mock-anon-key",
  isConfigured: Boolean(import.meta.env.VITE_INSFORGE_URL),
};

export async function fetchFromInsforge<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (!INSFORGE_CONFIG.isConfigured) {
    console.warn(
      `[Insforge Client] VITE_INSFORGE_URL no está configurada. Operando en modo Mock/Local.`,
    );
    throw new Error("MOCK_MODE_ACTIVE");
  }

  const response = await fetch(`${INSFORGE_CONFIG.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${INSFORGE_CONFIG.anonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`[Insforge API Error ${response.status}]: ${errText}`);
  }

  return response.json();
}
