import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/store/app-store";
import { getStudents, mapDBStudentToAdminStudent } from "@/lib/services/students.service";
import { getInvoicesWithAudit, mapDBInvoiceToInvoice } from "@/lib/services/invoices.service";

import {
  DATA_SYNC_CHANNEL,
  STORAGE_SYNC_KEY,
  triggerDataSyncBroadcast,
} from "@/lib/sync-broadcast";

export { DATA_SYNC_CHANNEL, STORAGE_SYNC_KEY, triggerDataSyncBroadcast };

export function useInsforgeSync() {
  const activeRole = useAppStore((s) => s.activeRole);
  const hydrateFromBackend = useAppStore((s) => s.hydrateFromBackend);
  const [isSyncing, setIsSyncing] = useState(false);
  const inFlightRef = useRef(false);
  const lastSyncTimestampRef = useRef(0);

  const syncBackendData = useCallback(async (forced = false) => {
    // Throttling: Evitar peticiones concurrentes o con menos de 2 segundos de separación salvo forzado
    const now = Date.now();
    if (inFlightRef.current) return;
    if (!forced && now - lastSyncTimestampRef.current < 2000) return;

    inFlightRef.current = true;
    setIsSyncing(true);

    try {
      if (activeRole === "super_admin" || activeRole === "staff" || activeRole === "teacher") {
        const dbStudents = await getStudents(activeRole);
        const { invoices: dbInvoices, auditLogs: dbPaymentLogs } =
          activeRole === "teacher"
            ? { invoices: [], auditLogs: [] }
            : await getInvoicesWithAudit(activeRole);

        let dbAttendance: any[] = [];
        try {
          const { postgrestSelect } = await import("@/lib/insforge");
          dbAttendance = await postgrestSelect(
            "attendance_logs",
            { order: "registered_at.asc", limit: "1000" },
            "id,student_id,status,credit_delta,note,registered_at"
          );
        } catch (attErr) {
          console.warn("[Insforge Sync] Error al obtener attendance_logs:", attErr);
        }

        const mappedStudents =
          dbStudents && dbStudents.length > 0
            ? dbStudents.map(mapDBStudentToAdminStudent)
            : undefined;

        const mappedInvoices =
          dbInvoices
            ? dbInvoices.map((inv) => mapDBInvoiceToInvoice(inv, dbPaymentLogs))
            : undefined;

        if (mappedStudents || mappedInvoices || (dbAttendance && dbAttendance.length > 0)) {
          hydrateFromBackend({
            students: mappedStudents,
            invoices: mappedInvoices,
            attendanceLogs: dbAttendance,
          });
          lastSyncTimestampRef.current = Date.now();
          console.log("[Insforge Sync] Sincronización en tiempo real exitosa:", {
            role: activeRole,
            students: mappedStudents?.length || 0,
            invoices: mappedInvoices?.length || 0,
            attendanceLogs: dbAttendance?.length || 0,
            forced,
          });
        }
      }
    } catch (err: unknown) {
      console.warn("[Insforge Sync] Operando en fallback Zustand local:", err);
    } finally {
      inFlightRef.current = false;
      setIsSyncing(false);
    }
  }, [activeRole, hydrateFromBackend]);

  useEffect(() => {
    let isMounted = true;

    // 1. Sincronización inicial al montar
    syncBackendData();

    // 2. Listener de BroadcastChannel para sincronización instantánea entre pestañas
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel(DATA_SYNC_CHANNEL);
        bc.onmessage = (ev) => {
          if (ev?.data?.type === "DATA_MUTATED" && isMounted) {
            syncBackendData(true);
          }
        };
      } catch (e) {
        console.warn("[DataSync] No se pudo inicializar BroadcastChannel:", e);
      }
    }

    // 3. Listener de Storage Event (fallback multi-pestaña)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_SYNC_KEY && isMounted) {
        syncBackendData(true);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }

    // 4. Revalidación inmediata al enfocar la pestaña o desbloquear celular (visibilitychange / focus)
    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible" && isMounted) {
        syncBackendData(false);
      }
    };
    const handleWindowFocus = () => {
      if (isMounted) {
        syncBackendData(false);
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleWindowFocus);
    }

    // 5. Polling inteligente en segundo plano cada 20 segundos (solo si la ventana está visible)
    const pollInterval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible" && isMounted) {
        syncBackendData(false);
      }
    }, 20000);

    return () => {
      isMounted = false;
      if (bc) {
        bc.close();
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("focus", handleWindowFocus);
      }
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      clearInterval(pollInterval);
    };
  }, [syncBackendData]);

  return {
    syncNow: () => syncBackendData(true),
    isSyncing,
  };
}
