import { CalendarX2, ShieldCheck, Timer, Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const alerts = [
  {
    icon: ShieldCheck,
    tone: "text-success bg-success/12",
    title: "Doble reserva evitada",
    body: "Sala 2 · 17:30 — el sistema reubicó a Luana Prado en Sala 4.",
    time: "hace 12 min",
  },
  {
    icon: Timer,
    tone: "text-warning bg-warning/18",
    title: "Contrato de alquiler por vencer",
    body: "Violín 3/4 (Familia Prado) vence en 6 días.",
    time: "hoy",
  },
  {
    icon: CalendarX2,
    tone: "text-destructive bg-destructive/10",
    title: "3 ausencias sin justificar",
    body: "Grupo de teoría B — se generarán créditos de recuperación.",
    time: "ayer",
  },
  {
    icon: Wrench,
    tone: "text-info bg-info/12",
    title: "Mantenimiento de piano pendiente",
    body: "Sala 1 · afinación programada para el viernes.",
    time: "esta semana",
  },
];

export function AlertsPanel() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Alertas</CardTitle>
        <CardDescription>Lo que necesita tu atención hoy</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((a) => (
          <div
            key={a.title}
            className="flex gap-3 rounded-xl border border-border/70 bg-muted/40 p-3"
          >
            <span className={`h-fit rounded-lg p-2 ${a.tone}`}>
              <a.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{a.body}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground/70">
                {a.time}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
