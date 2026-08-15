import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarCheck2, CircleSlash, Wallet, Clock } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/teacher/nomina")({
  head: () => ({
    meta: [
      { title: "Mi nómina — VM STAFF" },
      {
        name: "description",
        content:
          "Resumen de pagos al profesor: total del mes, clases impartidas, cancelaciones y desglose semanal.",
      },
      { property: "og:title", content: "Mi Nómina — VM STAFF" },
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

  const lessons = payroll.reduce((a, w) => a + w.lessons, 0);
  const cancelled = payroll.reduce((a, w) => a + w.cancelled, 0);
  const totalHoursWorked = Math.round((lessons * 45) / 60); // Horas aproximadas impartidas

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Registro de Horas y Clases</h1>
        <p className="text-xs text-muted-foreground">Agosto 2026 · Cierre contable mensual</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-lg"
      >
        <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest opacity-90">
          <Clock className="h-4 w-4" /> Horas Impartidas del Mes
        </p>
        <p className="mt-2 text-4xl font-bold tabular-nums">{totalHoursWorked} hrs</p>
        <p className="mt-1 text-xs opacity-90">Basado en fichajes y asistencia registrada en el kiosco</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <CalendarCheck2 className="h-4 w-4 text-success" />
          <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{lessons}</p>
          <p className="text-xs text-muted-foreground">Clases impartidas</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <CircleSlash className="h-4 w-4 text-destructive" />
          <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{cancelled}</p>
          <p className="text-xs text-muted-foreground font-medium">Clases canceladas</p>
        </div>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Desglose Semanal de Clases</h3>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {payroll.map((w, i) => (
            <li key={w.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{w.label}</p>
                <p className="text-xs text-muted-foreground">
                  {w.lessons} clases realizas · {w.cancelled} canceladas
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    i < 2
                      ? "bg-success/15 text-success border border-success/30"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {i < 2 ? "Auditado" : "Pendiente"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
