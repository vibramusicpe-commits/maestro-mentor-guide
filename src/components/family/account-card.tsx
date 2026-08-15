import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Receipt, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { PaymentOnboardingModal } from "./payment-onboarding-modal";

export function AccountCard() {
  const billing = useAppStore((s) => s.billing);
  const balance = useAppStore((s) => s.balance);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              {paid ? "Cuenta al día · gracias" : "Vence el 20 de agosto"}
            </p>
          </div>
          {paid && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> Al día
            </span>
          )}
        </div>

        <ul className="mt-4 divide-y divide-border border-y border-border">
          {billing.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="min-w-0 truncate text-muted-foreground">{l.label}</span>
              <span
                className={`shrink-0 font-semibold tabular-nums ${
                  l.amount < 0 ? "text-success" : ""
                }`}
              >
                {l.amount < 0 ? "-" : ""}S/ {Math.abs(l.amount)}
              </span>
            </li>
          ))}
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
