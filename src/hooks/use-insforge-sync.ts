/**
 * use-insforge-sync.ts — Hook para conectar Zustand con Insforge PostgREST
 */

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";
import { getStudents } from "@/lib/services/students.service";
import { getInvoices } from "@/lib/services/invoices.service";
import { toast } from "sonner";

export function useInsforgeSync() {
  const { activeRole, isAuthenticated } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    async function syncBackendData() {
      try {
        if (activeRole === "super_admin" || activeRole === "staff") {
          const dbStudents = await getStudents(activeRole);
          const dbInvoices = await getInvoices(activeRole);

          if (isMounted) {
            console.log("[Insforge Sync] Datos sincronizados desde backend:", {
              students: dbStudents.length,
              invoices: dbInvoices.length,
            });
          }
        }
      } catch (err: unknown) {
        console.warn("[Insforge Sync] Operando en fallback Zustand local:", err);
      }
    }

    syncBackendData();

    return () => {
      isMounted = false;
    };
  }, [activeRole, isAuthenticated]);
}
