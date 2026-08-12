import { motion } from "framer-motion";
import { CheckCircle2, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";

export function AccountCard() {
  const billing = useAppStore((s) => s.billing);
  const balance = useAppStore((s) => s.balance);
  const payBalance = useAppStore((s) => s.payBalance);

  const paid = balance <= 0;

  return (
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
        className="mt-4 w-full"
        disabled={paid}
        onClick={() => {
          payBalance();
          toast.success("Pago registrado", {
            description: "Tu cuenta familiar quedó al día.",
          });
        }}
      >
        {paid ? "Sin pagos pendientes" : "Pagar pendiente"}
      </Button>
    </motion.section>
  );
}
