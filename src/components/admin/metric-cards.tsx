import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, CalendarCheck, DollarSign, UserCheck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";

export function MetricCards() {
  const activeRole = useAppStore((s) => s.activeRole);

  const metrics = [
    ...(activeRole !== "staff"
      ? [
          {
            label: "Ingresos del mes",
            value: "$18,420",
            delta: "+12.4%",
            up: true,
            hint: "vs. julio",
            icon: DollarSign,
            tone: "text-primary bg-primary/10",
          },
        ]
      : [
          {
            label: "Alumnos Activos",
            value: "228",
            delta: "+14",
            up: true,
            hint: "vs. mes anterior",
            icon: Users,
            tone: "text-primary bg-primary/10",
          },
        ]),
    {
      label: "Clases impartidas",
      value: "486",
      delta: "+38",
      up: true,
      hint: "esta semana +112",
      icon: CalendarCheck,
      tone: "text-info bg-info/10",
    },
    {
      label: "Tasa de asistencia",
      value: "91.3%",
      delta: "-1.8%",
      up: false,
      hint: "objetivo 93%",
      icon: UserCheck,
      tone: "text-warning bg-warning/15",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
        >
          <Card className="h-full">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <span className={`rounded-xl p-2.5 ${m.tone}`}>
                  <m.icon className="h-5 w-5" />
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                    m.up ? "bg-success/12 text-success" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {m.up ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {m.delta}
                </span>
              </div>
              <p className="mt-5 text-3xl font-bold tracking-tight">{m.value}</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">{m.label}</p>
              <p className="mt-3 text-xs text-muted-foreground/80">{m.hint}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
