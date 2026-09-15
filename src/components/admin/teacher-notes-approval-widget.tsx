import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  MessageCircle,
  User,
  GraduationCap,
  Sparkles,
  Edit3,
  Check,
  X,
  Phone,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import {
  fetchAllTeacherNotes,
  approveTeacherNote,
  rejectTeacherNote,
  NOTES_SYNC_CHANNEL,
  type TeacherParentNote,
} from "@/lib/services/teacher-notes.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function TeacherNotesApprovalWidget() {
  const activeRole = useAppStore((s) => s.activeRole);
  const currentUser = useAppStore((s) => s.currentUser);
  const teacherNotes = useAppStore((s) => s.teacherNotes);
  const setTeacherNotes = useAppStore((s) => s.setTeacherNotes);
  const addOrUpdateTeacherNote = useAppStore((s) => s.addOrUpdateTeacherNote);
  const updateStudentDetails = useAppStore((s) => s.updateStudentDetails);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modales de moderación
  const [rejectModalNote, setRejectModalNote] = useState<TeacherParentNote | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [editModalNote, setEditModalNote] = useState<TeacherParentNote | null>(null);
  const [editedText, setEditedText] = useState("");

  const isStaff = activeRole === "staff";
  const adminDisplayName =
    currentUser?.name || (isStaff ? "Karla (Secretaría)" : "Dirección (Dueña)");

  // Carga de notas pedagógicas
  const loadNotes = async () => {
    try {
      setLoading(true);
      const notes = await fetchAllTeacherNotes();
      setTeacherNotes(notes);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();

    const onUpdate = () => loadNotes();
    window.addEventListener("vibra-notes-updated", onUpdate);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel(NOTES_SYNC_CHANNEL);
      bc.onmessage = () => onUpdate();
    }

    // Polling ligero cada 15 segundos para captar notas en tiempo real
    const interval = setInterval(loadNotes, 15000);

    return () => {
      window.removeEventListener("vibra-notes-updated", onUpdate);
      bc?.close();
      clearInterval(interval);
    };
  }, []);

  // Notas pendientes de aprobación
  const pendingNotes = useMemo(() => {
    return teacherNotes.filter((n) => n.status === "pendiente");
  }, [teacherNotes]);

  // Acción: Aprobar nota
  const handleApprove = async (note: TeacherParentNote, customContent?: string) => {
    setActionLoading(true);
    try {
      const approved = await approveTeacherNote(
        activeRole,
        adminDisplayName,
        note.id,
        customContent
      );
      addOrUpdateTeacherNote(approved);

      if (approved.studentId) {
        updateStudentDetails(approved.studentId, { teacherNote: approved.content });
      }

      toast.success(`✓ Nota de ${note.studentName} aprobada y publicada.`, {
        description: "Visible inmediatamente en el Portal de Familia.",
      });
      setEditModalNote(null);
    } catch (err: any) {
      toast.error("Error al aprobar nota: " + (err.message || "Error del servidor"));
    } finally {
      setActionLoading(false);
    }
  };

  // Acción: Rechazar / Desaprobar nota con observaciones
  const handleRejectConfirm = async () => {
    if (!rejectModalNote) return;
    if (!rejectionReason.trim()) {
      toast.error("Por favor ingresa un motivo para que el profesor pueda corregir la nota.");
      return;
    }

    setActionLoading(true);
    try {
      const rejected = await rejectTeacherNote(
        activeRole,
        adminDisplayName,
        rejectModalNote.id,
        rejectionReason
      );
      addOrUpdateTeacherNote(rejected);

      toast.info(`Nota devuelta al profesor con observaciones.`);
      setRejectModalNote(null);
      setRejectionReason("");
    } catch (err: any) {
      toast.error("Error al rechazar nota: " + (err.message || "Error del servidor"));
    } finally {
      setActionLoading(false);
    }
  };

  // Acción: Enviar WhatsApp a la familia
  const handleSendWhatsApp = (note: TeacherParentNote) => {
    const rawPhone = note.parentPhone?.replace(/[^0-9]/g, "") || "";
    if (!rawPhone || rawPhone.length < 8) {
      toast.error("Este alumno no cuenta con un número de teléfono registrado.");
      return;
    }

    const cleanPhone = rawPhone.startsWith("51") ? rawPhone : `51${rawPhone}`;
    const msg =
      `¡Hola ${note.familyName}! 🎶 Le saludamos de parte del equipo de *Vibra Music*.\n\n` +
      `📝 *Reporte Pedagógico de Clase — ${note.studentName}* (${note.instrument}):\n` +
      `"${note.content}"\n\n` +
      `👨‍🏫 *Docente*: ${note.teacherName}\n` +
      `🌐 Pueden consultar asistencias y horarios en su *Portal de Familia*: https://vibramusic.pe/family\n\n` +
      `¡Muchas gracias por confiar en Vibra Music! 🎹🎸🥁`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    toast.info(`Abriendo WhatsApp con la Familia ${note.familyName}...`);
  };

  return (
    <Card className="border-border shadow-xs overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-500/10 via-background to-background pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-amber-500/20 p-2 text-amber-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-black flex items-center gap-2 text-foreground">
                Bandeja de Aprobación: Notas Docentes a Familias
                {pendingNotes.length > 0 && (
                  <Badge className="h-5 px-2 text-[10px] font-black bg-amber-500 text-black animate-pulse">
                    {pendingNotes.length} pendiente{pendingNotes.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Filtro institucional antes de que los mensajes redactados por los profesores (Jeremy, Fernando, Nathaly) lleguen a los padres.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={loadNotes}
              disabled={loading}
              className="h-8 text-xs font-bold gap-1.5 rounded-xl border-border"
              title="Refrescar notas"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refrescar</span>
            </Button>

            <Link
              to="/admin/alumnos"
              search={{ tab: "notas" } as any}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-bold rounded-xl bg-muted/60 text-foreground hover:bg-muted transition-colors border border-border"
            >
              <span>Ver todas en Alumnos</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {pendingNotes.length === 0 ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-muted/20 border border-border/50 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Todas las notas docentes están revisadas y al día
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cuando Jeremy, Fernando o Nathaly envíen observaciones pedagógicas de sus clases, aparecerán aquí para tu aprobación.
                </p>
              </div>
            </div>

            <Link
              to="/admin/alumnos"
              search={{ tab: "notas" } as any}
              className="text-xs font-bold text-primary hover:underline shrink-0 flex items-center gap-1"
            >
              Ver historial de notas aprobadas →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium pb-1">
              <span>Notas esperando tu revisión ({pendingNotes.length}):</span>
              <span className="text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md font-bold">
                ⚠️ Los padres no las verán hasta que las apruebes
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {pendingNotes.map((note) => {
                const formattedDate = new Date(note.createdAt).toLocaleString("es-PE", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={note.id}
                    className="flex flex-col justify-between p-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.03] space-y-3 transition-all hover:border-amber-500/60 shadow-xs"
                  >
                    {/* Header de la Tarjeta */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-foreground">
                              {note.studentName}
                            </span>
                            <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/30">
                              {note.instrument}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Familia: <strong className="text-foreground">{note.familyName}</strong>
                          </p>
                        </div>

                        <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black border border-amber-500/40">
                          Pendiente
                        </Badge>
                      </div>

                      {/* Info del Profesor Emisor */}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50 pt-2">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <User className="h-3 w-3 text-primary" />
                          <span>Prof. {note.teacherName}</span>
                        </div>
                        <span className="flex items-center gap-1 text-[10px]">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formattedDate}
                        </span>
                      </div>

                      {/* Cuerpo de la Nota */}
                      <div className="rounded-xl bg-card p-3 border border-border text-xs text-foreground font-medium leading-relaxed italic relative">
                        <span className="text-primary font-black text-sm absolute top-1 left-1.5">“</span>
                        <p className="pl-3.5 pr-1">{note.content}</p>
                      </div>
                    </div>

                    {/* Botones de Acción Inmediata */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => {
                            setRejectModalNote(note);
                            setRejectionReason("");
                          }}
                          className="h-7 px-2.5 text-[11px] font-bold rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                          title="Desaprobar y devolver con observaciones"
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Observar
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading}
                          onClick={() => {
                            setEditModalNote(note);
                            setEditedText(note.content);
                          }}
                          className="h-7 px-2.5 text-[11px] font-bold rounded-xl border-border"
                          title="Editar redacción antes de aprobar"
                        >
                          <Edit3 className="h-3.5 w-3.5 mr-1 text-primary" />
                          Editar
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => handleApprove(note)}
                        className="h-7 px-3 text-[11px] font-black rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:opacity-90 shadow-xs"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Aprobar y Publicar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      {/* Modal: Observar / Desaprobar Nota */}
      <Dialog open={!!rejectModalNote} onOpenChange={(open) => !open && setRejectModalNote(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500 text-base font-bold">
              <AlertTriangle className="h-5 w-5" /> Devolver Nota al Profesor
            </DialogTitle>
            <DialogDescription className="text-xs">
              El profesor <strong>{rejectModalNote?.teacherName}</strong> verá esta observación en su portal docente para corregir el contenido de <strong>{rejectModalNote?.studentName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground">
              <span className="font-bold text-foreground block mb-1">Nota original del profesor:</span>
              <p className="italic">"{rejectModalNote?.content}"</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Motivo / Instrucción para el profesor:
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ej. Por favor aclarar los ejercicios que debe practicar en casa y cuidar la ortografía..."
                className="text-xs min-h-[80px]"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setRejectModalNote(null)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={actionLoading || !rejectionReason.trim()}
              onClick={handleRejectConfirm}
              className="font-bold gap-1"
            >
              <XCircle className="h-4 w-4" /> Devolver Nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Redacción y Aprobar */}
      <Dialog open={!!editModalNote} onOpenChange={(open) => !open && setEditModalNote(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Edit3 className="h-5 w-5 text-primary" /> Editar y Aprobar Nota
            </DialogTitle>
            <DialogDescription className="text-xs">
              Ajusta la redacción u ortografía antes de publicarla a la Familia de <strong>{editModalNote?.studentName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Profesor: <strong>{editModalNote?.teacherName}</strong></span>
              <span>Instrumento: <strong>{editModalNote?.instrument}</strong></span>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Contenido final que verán los padres:
              </label>
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="text-xs min-h-[110px] leading-relaxed"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setEditModalNote(null)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={actionLoading || !editedText.trim()}
              onClick={() => editModalNote && handleApprove(editModalNote, editedText)}
              className="bg-emerald-600 hover:bg-emerald-500 font-bold gap-1 text-white"
            >
              <Check className="h-4 w-4" /> Guardar y Aprobar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
