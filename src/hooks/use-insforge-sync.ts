import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";
import { getStudents, mapDBStudentToAdminStudent } from "@/lib/services/students.service";
import { getInvoices, mapDBInvoiceToInvoice } from "@/lib/services/invoices.service";

export function useInsforgeSync() {
  const activeRole = useAppStore((s) => s.activeRole);
  const hydrateFromBackend = useAppStore((s) => s.hydrateFromBackend);

  useEffect(() => {
    let isMounted = true;

    async function syncBackendData() {
      try {
        if (activeRole === "super_admin" || activeRole === "staff") {
          const dbStudents = await getStudents(activeRole);
          const dbInvoices = await getInvoices(activeRole);

          if (isMounted) {
            const mappedStudents =
              dbStudents && dbStudents.length > 0
                ? dbStudents.map(mapDBStudentToAdminStudent)
                : undefined;

            const mappedInvoices =
              dbInvoices && dbInvoices.length > 0
                ? dbInvoices.map(mapDBInvoiceToInvoice)
                : undefined;

            if (mappedStudents || mappedInvoices) {
              hydrateFromBackend({
                students: mappedStudents,
                invoices: mappedInvoices,
              });
              console.log("[Insforge Sync] Hidratación exitosa desde backend PostgreSQL:", {
                students: mappedStudents?.length || 0,
                invoices: mappedInvoices?.length || 0,
              });
            }
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
  }, [activeRole, hydrateFromBackend]);
}
