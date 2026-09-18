import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";
import { getStudents, mapDBStudentToAdminStudent } from "@/lib/services/students.service";
import { getInvoicesWithAudit, mapDBInvoiceToInvoice } from "@/lib/services/invoices.service";

export function useInsforgeSync() {
  const activeRole = useAppStore((s) => s.activeRole);
  const hydrateFromBackend = useAppStore((s) => s.hydrateFromBackend);

  useEffect(() => {
    let isMounted = true;

    async function syncBackendData() {
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
          } catch {}

          if (isMounted) {
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
              console.log("[Insforge Sync] Hidratación exitosa desde backend PostgreSQL:", {
                role: activeRole,
                students: mappedStudents?.length || 0,
                invoices: mappedInvoices?.length || 0,
                attendanceLogs: dbAttendance?.length || 0,
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
