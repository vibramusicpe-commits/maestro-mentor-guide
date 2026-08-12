import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarCheck2, CircleSlash, Wallet } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/teacher/nomina")({
  head: () => ({
    meta: [
      { title: "Mi nómina — Cadencia" },
      {
        name: "description",
        content:
          "Resumen de pagos al profesor: total del mes, clases impartidas, cancelaciones y desglose semanal.",
      },
      { property: "og:title", content: "Mi nómina — Cadencia" },
      {
        property: "og:description",
        content: "Transparencia total sobre tus clases impartidas y tu pago del mes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeacherPayroll,
});

function TeacherPayroll() {
  const payroll = useAppStore((s) => s.payroll);

  const total = payroll.reduce((a, w) => a + w.amount, 0);
  const lessons = payroll.reduce((a, w) => a + w.lessons, 0);
  const cancelled = payroll.reduce((a, w) => a + w.cancelled, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Mi nómina</h1>
        <p className="text-xs text-muted-foreground">Agosto 2026 · pago el 5 de septiembre</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-lg"
      >
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest opacity-90">
          <Wallet className="h-3.5 w-3.5" /> Total estimado
        </p>
        <p className="mt-2 text-4xl font-bold tabular-nums">S/ {total.toLocaleString("es-PE")}</p>
        <p className="mt-1 text-xs opacity-90">Tarifa S/ 18 por clase impartida</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <CalendarCheck2 className="h-4 w-4 text-success" />
          <p className="mt-2 text-2xl font-bold tabular-nums">{lessons}</p>
          <p className="text-xs text-muted-foreground">Clases impartidas</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <CircleSlash className="h-4 w-4 text-destructive" />
          <p className="mt-2 text-2xl font-bold tabular-nums">{cancelled}</p>
          <p className="text-xs text-muted-foreground">Canceladas</p>
        </div>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Desglose semanal</h3>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {payroll.map((w, i) => (
            <li key={w.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{w.label}</p>
                <p className="text-xs text-muted-foreground">
                  {w.lessons} clases · {w.cancelled} canceladas
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums">S/ {w.amount}</p>
                <p
                  className={`text-[11px] font-semibold ${
                    i < 2 ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  {i < 2 ? "Pagado" : "Pendiente"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
