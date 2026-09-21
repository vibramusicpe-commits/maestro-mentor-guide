/**
 * Canal de Difusión en Tiempo Real — Vibra Music Staff (ADR-0117)
 * Permite que mutaciones en el panel administrativo (reprogramaciones, asistencias,
 * matrículas, pagos) se reflejen instantáneamente en todas las demás pestañas abiertas
 * (Agenda de Profesor, Kiosco, etc.) mediante BroadcastChannel y Storage Events.
 */

export const DATA_SYNC_CHANNEL = "vibra_live_data_sync";
export const STORAGE_SYNC_KEY = "vibra_last_data_sync";

export interface DataSyncMessage {
  type: "DATA_MUTATED";
  reason: string;
  timestamp: number;
}

/**
 * Emite una notificación inter-pestañas para que todas las vistas abiertas
 * (Agenda de Admin, Kiosco de Profesor, Agenda de Profesor, Facturación)
 * rehidraten inmediatamente sus datos desde PostgreSQL.
 */
export function triggerDataSyncBroadcast(reason = "mutation") {
  if (typeof window === "undefined") return;
  try {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel(DATA_SYNC_CHANNEL);
      const msg: DataSyncMessage = {
        type: "DATA_MUTATED",
        reason,
        timestamp: Date.now(),
      };
      bc.postMessage(msg);
      bc.close();
    }
    // Fallback con localStorage para garantizar compatibilidad entre contextos y ventanas
    localStorage.setItem(STORAGE_SYNC_KEY, Date.now().toString());
  } catch (err) {
    console.warn("[DataSync] Error emitiendo broadcast:", err);
  }
}
