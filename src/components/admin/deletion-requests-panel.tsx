import { useState } from "react";
import { toast } from "sonner";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  User,
  Trash2,
  AlertTriangle,
  Calendar,
  History,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppStore } from "@/store/app-store";

export function DeletionRequestsPanel() {
  const activeRole = useAppStore((s) => s.activeRole);
  const deletionRequests = useAppStore((s) => s.deletionRequests || []);
  const approveDeletionRequest = useAppStore((s) => s.approveDeletionRequest);
  const rejectDeletionRequest = useAppStore((s) => s.rejectDeletionRequest);

  const [selectedReport, setSelectedReport] = useState<(typeof deletionRequests)[0] | null>(null);

  // Filtrar solicitudes
  const pendingRequests = deletionRequests.filter((r) => r.status === "pendiente");
  const historyRequests = deletionRequests.filter((r) => r.status !== "pendiente");

  const isSuperAdmin = activeRole === "super_admin";

  if (deletionRequests.length === 0 && !isSuperAdmin) {
    return null;
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-destructive/10 p-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                Solicitudes de Eliminación (Control de Dirección)
                {pendingRequests.length > 0 && (
                  <Badge variant="destructive" className="h-5 px-2 text-[10px] font-black animate-pulse">
                    {pendingRequests.length} pendientes
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                {isSuperAdmin
                  ? "Autorizaciones requeridas de Secretaría (Nayeli). La Dueña revisa, aprueba, deniega y audita con fecha/hora."
                  : "Estado de tus solicitudes de eliminación enviadas a Dirección."}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {pendingRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground space-y-1">
            <CheckCircle2 className="h-6 w-6 text-success mx-auto opacity-70" />
            <p className="font-bold text-foreground">Sin solicitudes pendientes de eliminación</p>
            <p>Todo el padrón de alumnos, horarios y recibos está sincronizado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-3 transition-all hover:border-destructive/50"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-foreground">{req.entityName}</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold border-destructive/40 text-destructive bg-destructive/10">
                        {req.entityType === "student"
                          ? "Alumno"
                          : req.entityType === "lesson"
                          ? "Clase de Horario"
                          : req.entityType === "invoice"
                          ? "Recibo / Pago"
                          : "Alerta"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{req.details}</p>
                  </div>

                  <div className="text-right text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground flex items-center gap-1 justify-end">
                      <Clock className="h-3 w-3 text-primary" /> {req.requestedAt}
                    </span>
                    <span>Solicitado por: <strong>{req.requestedBy}</strong></span>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background/80 p-2.5 text-xs text-foreground">
                  <span className="font-bold text-muted-foreground text-[10px] uppercase block mb-0.5">
                    Motivo justificado:
                  </span>
                  "{req.reason}"
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-destructive/20">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedReport(req)}
                    className="h-8 text-xs font-bold gap-1.5 border-border hover:bg-muted"
                  >
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    Ver Reporte de Auditoría
                  </Button>

                  {isSuperAdmin ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          rejectDeletionRequest(req.id);
                          toast("Solicitud Denegada", {
                            description: `Se mantuvo a ${req.entityName} en el sistema.`,
                          });
                        }}
                        className="h-8 text-xs font-bold text-muted-foreground hover:text-destructive border-border gap-1"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Denegar
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => {
                          approveDeletionRequest(req.id);
                          toast.success("Eliminación Aprobada y Ejecutada", {
                            description: `${req.entityName} fue eliminado permanentemente por la Dueña.`,
                          });
                        }}
                        className="h-8 text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Aceptar y Eliminar
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-warning font-semibold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Esperando revisión de la Dueña
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Historial de Solicitudes Revisadas */}
        {historyRequests.length > 0 && (
          <div className="pt-2 border-t border-border space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" /> Historial de Decisiones Recientes ({historyRequests.length})
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {historyRequests.slice(0, 5).map((h) => (
                <div
                  key={h.id}
                  onClick={() => setSelectedReport(h)}
                  className="p-2.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{h.entityName}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-bold ${
                        h.status === "aprobado"
                          ? "border-success/40 bg-success/10 text-success"
                          : "border-destructive/40 bg-destructive/10 text-destructive"
                      }`}
                    >
                      {h.status === "aprobado" ? "Aprobado (Eliminado)" : "Denegado (Conservado)"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{h.reviewedAt || h.requestedAt}</span>
                    <Button size="icon" variant="ghost" className="h-6 w-6 p-0">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Modal de Reporte / Ficha de Auditoría con Timestamp */}
      <Dialog open={!!selectedReport} onOpenChange={(o) => !o && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Reporte Oficial de Auditoría de Eliminación
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ficha inmutable con trazabilidad horaria de la solicitud y resolución de Dirección.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-2xl border border-border bg-muted/30 p-3.5 space-y-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-muted-foreground uppercase text-[10px]">Elemento:</span>
                  <span className="font-black text-sm text-foreground">{selectedReport.entityName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tipo de Registro:</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold">
                    {selectedReport.entityType}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Detalle / Instrumento:</span>
                  <span className="font-bold text-foreground">{selectedReport.details}</span>
                </div>
              </div>

              {/* Trazabilidad de Solicitud */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 space-y-1.5">
                <p className="font-bold text-primary text-xs flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Solicitante: {selectedReport.requestedBy}
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 text-primary" /> Fecha y Hora: <strong>{selectedReport.requestedAt}</strong>
                </p>
                <div className="mt-2 pt-2 border-t border-primary/10">
                  <p className="font-bold text-[10px] text-muted-foreground uppercase">Motivo registrado:</p>
                  <p className="italic text-foreground mt-0.5">"{selectedReport.reason}"</p>
                </div>
              </div>

              {/* Resolución de Dirección */}
              <div
                className={`rounded-2xl border p-3.5 space-y-1.5 ${
                  selectedReport.status === "aprobado"
                    ? "border-success/30 bg-success/5"
                    : selectedReport.status === "rechazado"
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-warning/30 bg-warning/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Estado de la Solicitud:</span>
                  <Badge
                    className={`text-[10px] font-black border-0 ${
                      selectedReport.status === "aprobado"
                        ? "bg-success text-success-foreground"
                        : selectedReport.status === "rechazado"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-warning text-warning-foreground"
                    }`}
                  >
                    {selectedReport.status.toUpperCase()}
                  </Badge>
                </div>
                {selectedReport.reviewedBy && (
                  <>
                    <p className="text-[11px] text-muted-foreground">
                      Revisado por: <strong>{selectedReport.reviewedBy}</strong>
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 text-foreground" /> Fecha de Resolución: <strong>{selectedReport.reviewedAt}</strong>
                    </p>
                    <p className="text-[11px] font-semibold text-foreground pt-1 border-t">
                      Nota de Dirección: {selectedReport.reviewNotes}
                    </p>
                  </>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <Button size="sm" onClick={() => setSelectedReport(null)} className="text-xs font-bold">
                  Cerrar Reporte
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
