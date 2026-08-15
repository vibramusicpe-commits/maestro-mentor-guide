import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, CalendarCheck, DollarSign, UserCheck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";

export function MetricCards() {
  const activeRole = useAppStore((s) => s.activeRole);
  const students = useAppStore((s) => s.adminStudents);
  const schedule = useAppStore((s) => s.schedule);
  const invoices = useAppStore((s) => s.invoices);

  // Cálculos dinámicos reales
  const activeStudentsCount = students.filter((s) => s.status === "activo").length;
  const activeLessonsCount = schedule.filter((l) => l.status !== "cancelada").length;
  
  // Tasa de asistencia promedio real
  const avgAttendance = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.attendanceRate || 0), 0) / students.length)
    : 0;

  // Ingresos cobrados reales del mes
  const totalPaidInvoices = invoices
    .filter((i) => i.status === "pagado")
    .reduce((sum, i) => sum + i.amount, 0);

  const metrics = [
    ...(activeRole !== "staff"
      ? [
          {
            label: "Ingresos del mes (Cobrados)",
            value: `S/ ${totalPaidInvoices.toLocaleString("es-PE")}`,
            delta: totalPaidInvoices > 0 ? "+100%" : "S/ 0",
            up: totalPaidInvoices > 0,
            hint: `${invoices.filter((i) => i.status === "pendiente").length} recibos pendientes`,
            icon: DollarSign,
            tone: "text-primary bg-primary/10",
          },
        ]
      : [
          {
            label: "Alumnos Activos",
            value: `${activeStudentsCount}`,
            delta: `${students.length} registrados`,
            up: activeStudentsCount > 0,
            hint: `${students.filter((s) => s.status === "pausa" || s.status === "baja").length} inactivos / pausa`,
            icon: Users,
            tone: "text-primary bg-primary/10",
          },
        ]),
    {
      label: "Clases programadas",
      value: `${activeLessonsCount}`,
      delta: `${activeLessonsCount} activas`,
      up: activeLessonsCount > 0,
      hint: "En horario semanal vigente",
      icon: CalendarCheck,
      tone: "text-info bg-info/10",
    },
    {
      label: "Tasa de asistencia",
      value: students.length > 0 ? `${avgAttendance}%` : "0%",
      delta: students.length > 0 ? "Promedio alumnos" : "Sin datos",
      up: avgAttendance >= 80,
      hint: "Objetivo academia: 85%",
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
