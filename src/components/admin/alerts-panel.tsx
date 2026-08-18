import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  CalendarX2,
  ShieldCheck,
  Timer,
  Wrench,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  DoorOpen,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import { rooms } from "@/store/admin-seeds";

export type MaintenanceReport = {
  id: string;
  room: string;
  item: string; // ej: "Piano Acústico", "Violín #2", "Aire Acondicionado"
  description: string;
  priority: "alta" | "media" | "baja";
  createdAt: string;
  status: "pendiente" | "resuelto";
};

export function AlertsPanel() {
  const schedule = useAppStore((s) => s.schedule);
  const students = useAppStore((s) => s.adminStudents);
  const invoices = useAppStore((s) => s.invoices);
  const studentAlerts = useAppStore((s) => s.studentAlerts || []);
  const resolveStudentAlert = useAppStore((s) => s.resolveStudentAlert);

  // Estados locales para Mantenimientos
  const [maintenanceReports, setMaintenanceReports] = useState<MaintenanceReport[]>(() => {
    try {
      const raw = localStorage.getItem("cadencia-maintenance-reports");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [reportRoom, setReportRoom] = useState(rooms[0] || "Sala A");
  const [reportItem, setReportItem] = useState("Piano");
  const [reportDesc, setReportDesc] = useState("");
  const [reportPriority, setReportPriority] = useState<"alta" | "media" | "baja">("media");

  const saveReports = (newList: MaintenanceReport[]) => {
    setMaintenanceReports(newList);
    localStorage.setItem("cadencia-maintenance-reports", JSON.stringify(newList));
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDesc.trim()) {
      toast.error("Por favor describe el mantenimiento necesario");
      return;
    }

    const newReport: MaintenanceReport = {
      id: `maint-${Date.now()}`,
      room: reportRoom,
      item: reportItem,
      description: reportDesc.trim(),
      priority: reportPriority,
      createdAt: "Hoy",
      status: "pendiente",
    };

    const updated = [newReport, ...maintenanceReports];
    saveReports(updated);
    setIsNewReportOpen(false);
    setReportDesc("");
    toast.success(`Reporte de Mantenimiento Creado`, {
      description: `${reportItem} en ${reportRoom} programado.`,
    });
  };

  // Alertas calculadas dinámicamente según el estado real de la academia
  const activeAlerts = useMemo(() => {
    const list: Array<{
      id: string;
      icon: typeof Wrench;
      tone: string;
      title: string;
      body: string;
      time: string;
      onResolve?: () => void;
    }> = [];

    // 1. Conflictos de horario reales (dos docentes distintos en la misma sala o mismo docente en salas distintas)
    const activeLessons = schedule.filter((l) => l.status !== "cancelada");
    const byRoomTime = new Map<string, ScheduledLesson[]>();
    const byTeacherTime = new Map<string, ScheduledLesson[]>();

    for (const l of activeLessons) {
      const rKey = `${l.day}|${l.time}|${l.room}`;
      const rList = byRoomTime.get(rKey) ?? [];
      rList.push(l);
      byRoomTime.set(rKey, rList);

      const tKey = `${l.day}|${l.time}|${l.teacher.toLowerCase().replace(/\s*\(.*?\)/, "").trim()}`;
      const tList = byTeacherTime.get(tKey) ?? [];
      tList.push(l);
      byTeacherTime.set(tKey, tList);
    }

    let conflictsFound = 0;
    for (const list of byRoomTime.values()) {
      const distinctTeachers = new Set(list.map((l) => l.teacher.toLowerCase().replace(/\s*\(.*?\)/, "").trim()));
      if (distinctTeachers.size > 1) conflictsFound++;
    }
    for (const list of byTeacherTime.values()) {
      const distinctRooms = new Set(list.map((l) => l.room));
      if (distinctRooms.size > 1) conflictsFound++;
    }

    if (conflictsFound > 0) {
      list.push({
        id: "alert-conflicts",
        icon: AlertTriangle,
        tone: "text-destructive bg-destructive/10",
        title: `${conflictsFound} conflicto(s) de sala`,
        body: "Hay cruce de docentes en el mismo espacio o docente en dos salas. Revisa el Horario.",
        time: "en vivo",
      });
    }

    // 2. Reportes de Mantenimiento de Pianos / Salas
    for (const rep of maintenanceReports.filter((r) => r.status === "pendiente")) {
      list.push({
        id: rep.id,
        icon: Wrench,
        tone: rep.priority === "alta" ? "text-destructive bg-destructive/10" : "text-info bg-info/12",
        title: `Mantenimiento: ${rep.item} (${rep.room})`,
        body: rep.description,
        time: rep.createdAt,
        onResolve: () => {
          const updated = maintenanceReports.map((m) =>
            m.id === rep.id ? { ...m, status: "resuelto" as const } : m,
          );
          saveReports(updated);
          toast.success(`Mantenimiento resuelto: ${rep.item}`);
        },
      });
    }

    // 3. Incidencias y Alertas Operativas de Alumnos (Salud, Comportamiento, Logros)
    for (const al of studentAlerts.filter((a) => a.status === "pendiente")) {
      const toneMap = {
        alta: "text-destructive bg-destructive/10",
        media: "text-warning bg-warning/18",
        baja: "text-info bg-info/12",
        positiva: "text-success bg-success/15",
      };
      list.push({
        id: al.id,
        icon: AlertTriangle,
        tone: toneMap[al.severity] || "text-info bg-info/12",
        title: `Alerta Alumno: ${al.studentName}`,
        body: al.message,
        time: al.createdAt,
        onResolve: () => {
          resolveStudentAlert(al.id);
          toast.success(`Alerta de ${al.studentName} resuelta.`);
        },
      });
    }

    // 4. Alumnos en Riesgo de Deserción
    const highRiskStudents = students.filter((s) => s.status === "activo" && s.risk >= 70);
    if (highRiskStudents.length > 0) {
      list.push({
        id: "alert-risk-students",
        icon: CalendarX2,
        tone: "text-warning bg-warning/18",
        title: `${highRiskStudents.length} alumno(s) en riesgo alto`,
        body: `${highRiskStudents.map((s) => s.name).slice(0, 2).join(", ")} ${highRiskStudents.length > 2 ? `y ${highRiskStudents.length - 2} más` : ""}.`,
        time: "esta semana",
      });
    }

    // 5. Cobranzas vencidas
    const overdueInvoices = invoices.filter((i) => i.status === "vencido");
    if (overdueInvoices.length > 0) {
      list.push({
        id: "alert-overdue-invoices",
        icon: Timer,
        tone: "text-destructive bg-destructive/10",
        title: `${overdueInvoices.length} recibo(s) vencido(s)`,
        body: "Familias pendientes de regularización de mensualidad.",
        time: "hoy",
      });
    }

    return list;
  }, [schedule, maintenanceReports, studentAlerts, students, invoices]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Alertas ({activeAlerts.length})</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsNewReportOpen(true)}
            className="gap-1.5 text-xs font-bold border-info/40 text-info bg-info/5 hover:bg-info/10"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            + Mantenimiento
          </Button>
        </div>
        <CardDescription>Incidencias operativas e instrumentos</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {activeAlerts.length === 0 ? (
          <div className="text-center py-8 px-4 text-muted-foreground space-y-2">
            <CheckCircle2 className="h-8 w-8 text-success mx-auto opacity-80" />
            <p className="text-sm font-bold text-foreground">¡Todo en orden!</p>
            <p className="text-xs">No hay conflictos de sala, averías ni incidencias pendientes.</p>
          </div>
        ) : (
          activeAlerts.map((a) => (
            <div
              key={a.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-muted/40 p-3"
            >
              <div className="flex gap-3 min-w-0">
                <span className={`h-fit rounded-lg p-2 ${a.tone}`}>
                  <a.icon className="h-4 w-4 shrink-0" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{a.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{a.body}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground/70">
                    {a.time}
                  </p>
                </div>
              </div>

              {a.onResolve && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={a.onResolve}
                  className="h-7 text-xs font-bold text-success hover:bg-success/10 shrink-0"
                  title="Marcar como resuelto"
                >
                  ✓ Listo
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>

      {/* Modal de Crear Reporte de Mantenimiento */}
      <Dialog open={isNewReportOpen} onOpenChange={setIsNewReportOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl border-info/40 bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Wrench className="h-5 w-5 text-info" />
              Nuevo Reporte de Mantenimiento
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Registra afinaciones de piano, cuerdas rotas, limpieza o reparaciones en sede.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateReport} className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Sala afectada</label>
                <Select value={reportRoom} onValueChange={setReportRoom}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Elemento / Instrumento</label>
                <Input
                  type="text"
                  placeholder="ej. Piano Acústico, Violín"
                  value={reportItem}
                  onChange={(e) => setReportItem(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Prioridad</label>
              <div className="flex gap-2">
                {(["baja", "media", "alta"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setReportPriority(p)}
                    className={`flex-1 py-1.5 rounded-lg font-bold capitalize transition-all border text-xs ${
                      reportPriority === p
                        ? p === "alta"
                          ? "bg-destructive text-destructive-foreground border-destructive"
                          : "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Descripción del trabajo</label>
              <textarea
                placeholder="ej. Afinación programada para el viernes o cambio de cuerda Mi."
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsNewReportOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs font-bold bg-primary text-primary-foreground"
              >
                Guardar Reporte
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
