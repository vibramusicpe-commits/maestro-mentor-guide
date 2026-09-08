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
  
  // Tasa de asistencia promedio real (solo sobre alumnos con asistencias evaluadas)
  const evaluatedStudents = students.filter(
    (s) => (s.attendanceRate || 0) > 0 || (s.recentAttendance?.length || 0) > 0
  );
  const avgAttendance =
    evaluatedStudents.length > 0
      ? Math.round(
          evaluatedStudents.reduce((acc, s) => acc + (s.attendanceRate || 0), 0) /
            evaluatedStudents.length
        )
      : null;

  // Ingresos cobrados reales del mes
  const totalPaidInvoices = invoices
    .filter((i) => i.status === "pagado")
    .reduce((sum, i) => sum + i.amount, 0);

  const metrics = [
    ...(activeRole !== "staff"
      ? [
          {
            label: "Ingresos del mes (Cobrados)",
            value: `S/ ${totalPaidInvoices.toLocaleString("es-PE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            delta: `83 recibos procesados`,
            up: true,
            hint: "Cobranzas efectivas de Agosto",
            icon: DollarSign,
            tone: "text-success bg-success/10",
          },
        ]
      : []),
    {
      label: "Alumnos activos",
      value: `${activeStudentsCount}`,
      delta: `${students.length} registrados`,
      up: true,
      hint: "En ciclo lectivo actual",
      icon: Users,
      tone: "text-primary bg-primary/10",
    },
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
      value: avgAttendance !== null ? `${avgAttendance}%` : "—",
      delta: avgAttendance !== null ? `${evaluatedStudents.length} evaluados` : "Sin registros",
      up: (avgAttendance || 0) >= 80,
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
