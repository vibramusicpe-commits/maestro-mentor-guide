import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getAllActiveShifts, type DBTeacherTimeLog } from "@/lib/services/time-tracking.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, ArrowRight, RefreshCw, Building2 } from "lucide-react";

export function TeacherAttendanceWidget() {
  const [activeShifts, setActiveShifts] = useState<DBTeacherTimeLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadShifts = async () => {
    setLoading(true);
    try {
      const data = await getAllActiveShifts();
      setActiveShifts(data);
    } catch {
      setActiveShifts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
    const interval = setInterval(loadShifts, 45000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-border bg-card/75 shadow-xs backdrop-blur-sm overflow-hidden border-l-4 border-l-primary">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary">
                <UserCheck className="h-4 w-4" />
                Control de Asistencia Docente
              </span>
              {activeShifts.length > 0 ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold gap-1.5 px-2.5 py-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  {activeShifts.length} en sede en vivo
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground text-[10px] font-semibold">
                  Sin docentes en sede ahora
                </Badge>
              )}
            </div>

            <h3 className="text-lg font-black text-foreground">
              Monitoreo y Kardex Mensual de Profesores
            </h3>

            <p className="text-xs text-muted-foreground max-w-2xl">
              Supervisa el ingreso y salida de los docentes (Nathaly, Jeremy, Fernando), revisa el historial
              cronológico de cada día del mes y exporta las horas trabajadas para nómina.
            </p>

            {activeShifts.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Actualmente presentes:
                </span>
                {activeShifts.map((shift) => (
                  <span
                    key={shift.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {shift.teacher_name}
                    <span className="text-[10px] font-mono text-muted-foreground font-normal">
                      (desde{" "}
                      {new Date(shift.clock_in).toLocaleTimeString("es-PE", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                      )
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={loadShifts}
              disabled={loading}
              className="h-9 px-2.5 rounded-xl border-border hover:bg-muted text-xs font-semibold"
              title="Actualizar estado en vivo"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            </Button>

            <Button
              asChild
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#F47B20] to-[#FF9E3D] hover:opacity-95 text-[#0D0B0A] font-extrabold text-xs shadow-md shadow-orange-500/20 gap-1.5"
            >
              <Link to="/admin/control-horario">
                Ver Asistencias del Mes
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
