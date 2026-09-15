import { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  MessageCircle,
  Search,
  User,
  GraduationCap,
  Calendar,
  AlertTriangle,
  Edit3,
  Check,
  X,
  Phone,
  Filter,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import {
  fetchAllTeacherNotes,
  approveTeacherNote,
  rejectTeacherNote,
  NOTES_SYNC_CHANNEL,
  type TeacherParentNote,
} from "@/lib/services/teacher-notes.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function TeacherNotesModeration() {
  const activeRole = useAppStore((s) => s.activeRole);
  const currentUser = useAppStore((s) => s.currentUser);
  const teacherNotes = useAppStore((s) => s.teacherNotes);
  const setTeacherNotes = useAppStore((s) => s.setTeacherNotes);
  const addOrUpdateTeacherNote = useAppStore((s) => s.addOrUpdateTeacherNote);
  const updateStudentDetails = useAppStore((s) => s.updateStudentDetails);

  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"todas" | "pendiente" | "aprobado" | "rechazado">("pendiente");
  const [searchQuery, setSearchQuery] = useState("");

  // Modales de Acción
  const [rejectModalNote, setRejectModalNote] = useState<TeacherParentNote | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [editModalNote, setEditModalNote] = useState<TeacherParentNote | null>(null);
  const [editedText, setEditedText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const adminDisplayName = currentUser?.name || (activeRole === "staff" ? "Nayeli (Secretaría)" : "Dirección (Dueña)");

  // Carga inicial y escucha reactiva en vivo
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

    return () => {
      window.removeEventListener("vibra-notes-updated", onUpdate);
      bc?.close();
    };
  }, []);

  // Contadores por estado
  const counts = useMemo(() => {
    return {
      todas: teacherNotes.length,
      pendiente: teacherNotes.filter((n) => n.status === "pendiente").length,
      aprobado: teacherNotes.filter((n) => n.status === "aprobado").length,
      rechazado: teacherNotes.filter((n) => n.status === "rechazado").length,
    };
  }, [teacherNotes]);

  // Lista filtrada
  const filteredNotes = useMemo(() => {
    return teacherNotes.filter((n) => {
      const matchStatus = filterStatus === "todas" ? true : n.status === filterStatus;
      if (!matchStatus) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        n.studentName.toLowerCase().includes(q) ||
        n.teacherName.toLowerCase().includes(q) ||
        n.familyName.toLowerCase().includes(q) ||
        n.instrument.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      );
    });
  }, [teacherNotes, filterStatus, searchQuery]);

  // ─── ACCIÓN: Aprobar Nota ───
  const handleApprove = async (note: TeacherParentNote, customContent?: string) => {
    setActionLoading(true);
    try {
      const approved = await approveTeacherNote(activeRole, adminDisplayName, note.id, customContent);
      addOrUpdateTeacherNote(approved);

      // Actualizar ficha del alumno para que el Portal Familiar y Alumnos lo vean inmediatamente
      if (approved.studentId) {
        updateStudentDetails(approved.studentId, { teacherNote: approved.content });
      }

      toast.success(`✓ Nota de ${note.studentName} aprobada y publicada.`, {
        description: "El Portal de Familia ya muestra la recomendación pedagógica.",
      });
      setEditModalNote(null);
    } catch (err: any) {
      toast.error("Error al aprobar nota: " + (err.message || "Error del servidor"));
    } finally {
      setActionLoading(false);
    }
  };

  // ─── ACCIÓN: Rechazar / Desaprobar Nota ───
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

  // ─── ACCIÓN: Enviar por WhatsApp a la Familia (Aprobada) ───
  const handleSendWhatsApp = (note: TeacherParentNote) => {
    const rawPhone = note.parentPhone?.replace(/[^0-9]/g, "") || "";
    if (!rawPhone || rawPhone.length < 8) {
      toast.error("Este alumno no cuenta con un número de teléfono registrado.");
      return;
    }

    const cleanPhone = rawPhone.startsWith("51") ? rawPhone : `51${rawPhone}`;
    const msg =
      `¡Hola ${note.familyName}! 🎶 Le saludamos de parte del equipo y Dirección de *Vibra Music Staff*.\n\n` +
      `📝 *Reporte Pedagógico de Clase — ${note.studentName}* (${note.instrument}):\n` +
      `"${note.content}"\n\n` +
      `👨‍🏫 *Docente*: ${note.teacherName}\n` +
      `🌐 Pueden consultar asistencias, horarios y más detalles en su *Portal de Familia*: https://vibramusic.pe/family\n\n` +
      `¡Muchas gracias por confiar en la formación musical de ${note.studentName}! 🎹🎸🥁`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    toast.info(`Abriendo WhatsApp con la Familia ${note.familyName}...`);
  };

  return (
    <div className="space-y-4">
      {/* Banner Encabezado de Moderación */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
              Filtro & Moderación de Notas Pedagógicas
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control de calidad institucional: los profesores redactan retroalimentación para los padres y aquí la administración valida el contenido antes de que se publique o se envíe por WhatsApp.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={loadNotes}
            disabled={loading}
            className="h-8 text-xs font-bold gap-1.5 shrink-0 rounded-xl"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {/* Pestañas de Filtro Rápido */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
          <Button
            size="sm"
            variant={filterStatus === "pendiente" ? "default" : "outline"}
            onClick={() => setFilterStatus("pendiente")}
            className={`h-8 text-xs font-bold gap-1.5 rounded-xl ${
              filterStatus === "pendiente"
                ? "bg-amber-500 text-black hover:bg-amber-400"
                : "bg-background text-foreground"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Pendientes
            <Badge
              variant="secondary"
              className={`ml-1 text-[10px] px-1.5 py-0 h-4 font-black ${
                counts.pendiente > 0 ? "bg-amber-600 text-white animate-pulse" : "bg-muted text-muted-foreground"
              }`}
            >
              {counts.pendiente}
            </Badge>
          </Button>

          <Button
            size="sm"
            variant={filterStatus === "aprobado" ? "default" : "outline"}
            onClick={() => setFilterStatus("aprobado")}
            className={`h-8 text-xs font-bold gap-1.5 rounded-xl ${
              filterStatus === "aprobado"
                ? "bg-emerald-600 text-white hover:bg-emerald-500"
                : "bg-background text-foreground"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Aprobadas
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 font-black">
              {counts.aprobado}
            </Badge>
          </Button>

          <Button
            size="sm"
            variant={filterStatus === "rechazado" ? "default" : "outline"}
            onClick={() => setFilterStatus("rechazado")}
            className={`h-8 text-xs font-bold gap-1.5 rounded-xl ${
              filterStatus === "rechazado"
                ? "bg-rose-600 text-white hover:bg-rose-500"
                : "bg-background text-foreground"
            }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            Devueltas con Observación
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 font-black">
              {counts.rechazado}
            </Badge>
          </Button>

          <Button
            size="sm"
            variant={filterStatus === "todas" ? "default" : "outline"}
            onClick={() => setFilterStatus("todas")}
            className={`h-8 text-xs font-bold gap-1.5 rounded-xl ${
              filterStatus === "todas" ? "bg-primary text-primary-foreground" : "bg-background text-foreground"
            }`}
          >
            Todas ({counts.todas})
          </Button>
        </div>

        {/* Buscador de notas */}
        <div className="relative pt-1">
          <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar por alumno, profesor, instrumento o palabras del mensaje..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-8 rounded-xl bg-background"
          />
        </div>
      </div>

      {/* Lista de Notas */}
      {filteredNotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-2 bg-card/40">
          <ShieldCheck className="h-8 w-8 text-muted-foreground/60 mx-auto" />
          <p className="text-sm font-bold text-foreground">
            {filterStatus === "pendiente"
              ? "¡Al día! No hay notas pendientes de moderación en este momento."
              : "No se encontraron notas con el filtro seleccionado."}
          </p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Cuando los profesores redacten reportes pedagógicos desde su portal docente, aparecerán aquí para tu revisión y visto bueno.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note) => {
            const isPending = note.status === "pendiente";
            const isApproved = note.status === "aprobado";
            const isRejected = note.status === "rechazado";

            return (
              <div
                key={note.id}
                className={`rounded-2xl border p-4 space-y-3 shadow-xs transition-all ${
                  isPending
                    ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60"
                    : isApproved
                    ? "border-emerald-500/30 bg-card hover:border-emerald-500/50"
                    : "border-rose-500/30 bg-rose-500/5"
                }`}
              >
                {/* Cabecera de la Ficha */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-black text-foreground flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        {note.studentName}
                      </span>
                      <span className="text-xs text-muted-foreground">({note.instrument})</span>
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {note.familyName}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                      <span>Docente: <strong className="text-foreground">{note.teacherName}</strong></span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(note.createdAt).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {note.parentPhone && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1 font-semibold text-foreground">
                            <Phone className="h-3 w-3 text-emerald-500" />
                            {note.parentPhone}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Estado Badge */}
                  <div>
                    {isPending && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                        <Clock className="h-3 w-3" />
                        PENDIENTE DE APROBACIÓN
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <Check className="h-3 w-3" />
                        APROBADA · PUBLICADA
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        <X className="h-3 w-3" />
                        DEVUELTA CON OBSERVACIONES
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenido de la Nota Redactada */}
                <div className="rounded-xl border border-border/60 bg-background/80 p-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    Mensaje redactado por el profesor para la familia:
                  </span>
                  <p className="text-xs text-foreground font-serif leading-relaxed whitespace-pre-wrap">
                    &ldquo;{note.content}&rdquo;
                  </p>
                </div>

                {/* Observación de Rechazo si existe */}
                {isRejected && note.moderationComment && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs space-y-0.5">
                    <p className="font-bold text-rose-600 dark:text-rose-400">
                      Motivo del rechazo / Corrección solicitada:
                    </p>
                    <p className="text-[11px] text-foreground">{note.moderationComment}</p>
                  </div>
                )}

                {/* Barra de Acciones de Moderación */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 flex-wrap">
                  <div className="text-[11px] text-muted-foreground">
                    {isApproved && note.moderatedBy && (
                      <span>Aprobada por: <strong>{note.moderatedBy}</strong></span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {isPending && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditModalNote(note);
                            setEditedText(note.content);
                          }}
                          className="h-8 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground rounded-xl"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Editar y Aprobar
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRejectModalNote(note);
                            setRejectionReason("");
                          }}
                          className="h-8 text-xs font-bold gap-1 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/30 rounded-xl"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Desaprobar
                        </Button>

                        <Button
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleApprove(note)}
                          className="h-8 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Aprobar Nota
                        </Button>
                      </>
                    )}

                    {isApproved && (
                      <Button
                        size="sm"
                        onClick={() => handleSendWhatsApp(note)}
                        className="h-8 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs"
                      >
                        <MessageCircle className="h-3.5 w-3.5 fill-current" />
                        Enviar WhatsApp Oficial a los Padres
                      </Button>
                    )}

                    {isRejected && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditModalNote(note);
                          setEditedText(note.content);
                        }}
                        className="h-8 text-xs font-bold gap-1 rounded-xl"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Reconsiderar y Aprobar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── MODAL: Desaprobar Nota ─── */}
      <Dialog open={!!rejectModalNote} onOpenChange={(open) => !open && setRejectModalNote(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
              Desaprobar Nota Pedagógica
            </DialogTitle>
            <DialogDescription className="text-xs">
              Indica la razón por la cual no es recomendable enviar esta nota a los padres. El profesor recibirá esta retroalimentación en su portal para que pueda corregirla.
            </DialogDescription>
          </DialogHeader>

          {rejectModalNote && (
            <div className="space-y-3 py-2 text-xs">
              <div className="rounded-lg bg-muted/50 p-2.5 space-y-1">
                <p className="font-bold text-foreground">
                  {rejectModalNote.studentName} · Prof. {rejectModalNote.teacherName}
                </p>
                <p className="text-muted-foreground italic">&ldquo;{rejectModalNote.content}&rdquo;</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Motivo de la Observación (Obligatorio)</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ej: Replantear con tono más motivador, evitar mencionar faltas de pago, consultar antes con secretaría..."
                  className="min-h-20 text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRejectModalNote(null)}
              className="text-xs rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={actionLoading || !rejectionReason.trim()}
              onClick={handleRejectConfirm}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl"
            >
              Confirmar Desaprobación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: Editar y Aprobar ─── */}
      <Dialog open={!!editModalNote} onOpenChange={(open) => !open && setEditModalNote(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Edit3 className="h-5 w-5" />
              Editar y Aprobar Nota
            </DialogTitle>
            <DialogDescription className="text-xs">
              Puedes hacer ajustes de ortografía o redacción antes de dar el visto bueno y publicar la nota en el Portal Familiar.
            </DialogDescription>
          </DialogHeader>

          {editModalNote && (
            <div className="space-y-3 py-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Alumno: <strong className="text-foreground">{editModalNote.studentName}</strong></span>
                <span>Docente: <strong className="text-foreground">{editModalNote.teacherName}</strong></span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Texto de la Nota para los Padres</label>
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="min-h-28 text-xs font-serif"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditModalNote(null)}
              className="text-xs rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={actionLoading || !editedText.trim()}
              onClick={() => editModalNote && handleApprove(editModalNote, editedText)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
            >
              Guardar y Aprobar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
