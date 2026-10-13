import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Receipt, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import type { Invoice } from "@/store/admin-seeds";
import { familyAccountSummary } from "@/lib/laya/laya-family-scope";
import { PaymentOnboardingModal } from "./payment-onboarding-modal";

export function AccountCard() {
  const adminStudents = useAppStore((s) => s.adminStudents);
  const invoices = useAppStore((s) => (s as unknown as { invoices?: Invoice[] }).invoices || []);
  const currentUser = useAppStore((s) => s.currentUser);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado de cuenta real de la familia (reemplaza seeds estáticos, ADR-0172)
  const account = useMemo(
    () =>
      familyAccountSummary(adminStudents, invoices, {
        familyId: currentUser?.familyId ?? null,
        userEmail: currentUser?.email ?? null,
      }),
    [adminStudents, invoices, currentUser?.familyId, currentUser?.email]
  );
  const balance = account.balance;
  const paid = balance <= 0;

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Receipt className="h-3.5 w-3.5" /> Estado de cuenta
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums">
              S/ {Math.max(balance, 0).toLocaleString("es-PE")}
            </p>
            <p className="text-xs text-muted-foreground">
              {paid
                ? "Cuenta al día · gracias"
                : account.pendingInvoices[0]?.dueDate
                  ? `Vence el ${account.pendingInvoices[0]?.dueDate}`
                  : "Con saldo pendiente"}
            </p>
          </div>
          {paid && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> Al día
            </span>
          )}
        </div>

        <ul className="mt-4 divide-y divide-border border-y border-border">
          {account.pendingInvoices.length === 0 ? (
            <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="min-w-0 truncate text-muted-foreground">Sin pagos pendientes</span>
              <span className="shrink-0 font-semibold tabular-nums text-success">S/ 0</span>
            </li>
          ) : (
            account.pendingInvoices.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0 truncate text-muted-foreground">
                  {(l.concept?.split("—")[0]?.trim() || "Mensualidad") + (l.dueDate ? ` · vence ${l.dueDate}` : "")}
                </span>
                <span className="shrink-0 font-semibold tabular-nums">
                  S/ {(l.remainingBalance || 0).toLocaleString("es-PE")}
                </span>
              </li>
            ))
          )}
        </ul>

        <Button
          className="mt-4 w-full gap-2 font-bold"
          disabled={paid}
          onClick={() => setIsModalOpen(true)}
        >
          <CreditCard className="h-4 w-4" />
          {paid ? "Sin pagos pendientes" : "Pagar con..."}
        </Button>
      </motion.section>

      <PaymentOnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        balanceAmount={Math.max(balance, 0)}
      />
    </>
  );
}
