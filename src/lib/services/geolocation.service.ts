/**
 * geolocation.service.ts — Control de Geolocalización y Geocontrol de Sede
 * Vibra Music Staff — ADR-001 / ADR-0089
 *
 * Permite capturar la posición GPS del dispositivo de forma puntual (1 única vez al marcar)
 * y calcular la distancia respecto a la Sede SJL (Av. Las Flores de Primavera 1284) para verificar
 * si el personal o docente está físicamente en sede o marcando remotamente.
 */

export interface ShiftLocationMeta {
  lat: number;
  lng: number;
  accuracy: number; // en metros
  distanceMeters: number;
  status: "en_sede" | "fuera_de_sede" | "sin_gps";
  timestamp: string;
  googleMapsUrl?: string;
  sedeName: string;
}

export interface SedeCoords {
  name: string;
  address?: string;
  lat: number;
  lng: number;
  radiusMeters: number;
}

// ─────────────────────────────────────────────────────────────
// Coordenadas oficiales de Sede Vibra Music: San Juan de Lurigancho
// Dirección: Av. Las Flores de Primavera 1284, SJL 15404
// Coordenadas GPS verificadas en terreno con Google Maps:
// Lat: -12.008976, Lng: -77.010846
// Radio de tolerancia: 300 metros (para compensar señal en interiores de concreto)
// ─────────────────────────────────────────────────────────────
export const DEFAULT_SEDE_SJL: SedeCoords = {
  name: "Sede SJL (Las Flores 1284)",
  address: "Av. Las Flores de Primavera 1284, San Juan de Lurigancho 15404",
  lat: -12.008976,
  lng: -77.010846,
  radiusMeters: 300,
};

// Mantenemos alias para compatibilidad retroactiva
export const DEFAULT_SEDE_MIRAFLORES: SedeCoords = DEFAULT_SEDE_SJL;

const STORAGE_SEDE_KEY = "vibra-sede-coords";

export function getOfficialSedeCoords(): SedeCoords {
  try {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STORAGE_SEDE_KEY);
      if (saved) {
        const parsed: SedeCoords = JSON.parse(saved);
        // Si el dispositivo tenía en caché la referencia obsoleta de Miraflores, migrar a SJL
        if (
          parsed.lat === -12.1215 ||
          parsed.name?.toLowerCase().includes("miraflores") ||
          !parsed.lat
        ) {
          saveOfficialSedeCoords(DEFAULT_SEDE_SJL);
          return DEFAULT_SEDE_SJL;
        }
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_SEDE_SJL;
}

export function saveOfficialSedeCoords(coords: SedeCoords): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_SEDE_KEY, JSON.stringify(coords));
      window.dispatchEvent(new CustomEvent("vibra-sede-coords-updated", { detail: coords }));
    }
  } catch {}
}

/**
 * Cálculo de distancia ortodrómica (Gran Círculo) con fórmula Haversine en metros.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Obtiene la ubicación GPS del usuario una única vez al pulsar el botón.
 * No activa rastreo en segundo plano ni watchPosition.
 */
export async function getCurrentGPSPosition(): Promise<ShiftLocationMeta> {
  const sede = getOfficialSedeCoords();
  const nowIso = new Date().toISOString();

  // Si el navegador no soporta geolocalización (ej. entorno sin HTTPS o muy antiguo)
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return {
      lat: 0,
      lng: 0,
      accuracy: 0,
      distanceMeters: 0,
      status: "sin_gps",
      timestamp: nowIso,
      sedeName: sede.name,
    };
  }

  return new Promise<ShiftLocationMeta>((resolve) => {
    // Opciones de alta precisión con timeout prudente y caché reciente de 30s
    // Esto evita bloqueos en interiores y acelera la respuesta del navegador móvil
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 0);

        const distance = calculateDistanceMeters(lat, lng, sede.lat, sede.lng);
        const isWithinSede = distance <= sede.radiusMeters;
        const status = isWithinSede ? "en_sede" : "fuera_de_sede";
        const googleMapsUrl = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

        resolve({
          lat,
          lng,
          accuracy,
          distanceMeters: distance,
          status,
          timestamp: nowIso,
          googleMapsUrl,
          sedeName: sede.name,
        });
      },
      (error) => {
        console.warn("Aviso de geolocalización al marcar turno:", error.message);
        resolve({
          lat: 0,
          lng: 0,
          accuracy: 0,
          distanceMeters: 0,
          status: "sin_gps",
          timestamp: nowIso,
          sedeName: sede.name,
        });
      },
      options,
    );
  });
}

/**
 * Formato legible para distancia en metros o kilómetros
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
}
