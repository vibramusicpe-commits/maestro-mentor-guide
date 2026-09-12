/**
 * geolocation.service.ts — Control de Geolocalización y Geocontrol de Sede
 * Vibra Music Staff — ADR-001
 *
 * Permite capturar la posición GPS del dispositivo de forma puntual (1 única vez al marcar)
 * y calcular la distancia respecto a la Sede Miraflores para verificar si el personal
 * o docente está físicamente en sede o marcando remotamente.
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
  lat: number;
  lng: number;
  radiusMeters: number;
}

// ─────────────────────────────────────────────────────────────
// Coordenadas oficiales de Sede Miraflores (Lima, Perú)
// Radio de tolerancia: 250 metros (para compensar señal en interiores)
// ─────────────────────────────────────────────────────────────
export const DEFAULT_SEDE_MIRAFLORES: SedeCoords = {
  name: "Sede Miraflores",
  lat: -12.1215,
  lng: -77.0295,
  radiusMeters: 250,
};

const STORAGE_SEDE_KEY = "vibra-sede-coords";

export function getOfficialSedeCoords(): SedeCoords {
  try {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STORAGE_SEDE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    }
  } catch {}
  return DEFAULT_SEDE_MIRAFLORES;
}

export function saveOfficialSedeCoords(coords: SedeCoords): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_SEDE_KEY, JSON.stringify(coords));
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
    // Opciones de alta precisión con timeout prudente para no congelar la app
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0,
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
