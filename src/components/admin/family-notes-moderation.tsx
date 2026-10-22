/**
 * ================================================================
 * family-notes-moderation.tsx — Bandeja de Dirección (Fase 3)
 * ================================================================
 *
 * Dirección/Secretaría revisa las notas que envían los docentes:
 *   - Aprobar  -> `publicado` (visible para la familia)
 *   - Rechazar -> `rechazado` + motivo (el contenido NO se borra)
 *
 * La auditoría la registra el trigger `trg_audit_family_notes` en
 * `evaluation_audit_log`; esta UI no la duplica.
 *
 * No toca `students.notes` (legacy congelado), no toca facturación y no
 * contiene datos financieros.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useAppStore } from "@/store/app-store";
import type { FamilyNoteRow } from "@/lib/informes/types";
import { InformesValidationError } from "@/lib/informes/utils";
import { resolveActor } from "@/lib/services/teacher-resolver";
import {
  approveFamilyNote,
  listFamilyNotes,
  notifyFamilyNotesChanged,
  rejectFamilyNote,
  subscribeToFamilyNotesChanges,
} from "@/lib/services/family-notes.service";

type StatusFilter = "pendiente" | "publicado" | "rechazado" | "todas";

const STATUS_META: Record<
  FamilyNoteRow["status"],
  { label: string; className: string; icon: typeof Clock }
> = {
  pendiente: {
    label: "Pendiente",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-600",
    icon: Clock,
  },
  publicado: {
    label: "Publicada",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
    icon: CheckCircle2,
  },
  rechazado: {
    label: "Rechazada",
    className: "border-red-500/40 bg-red-500/10 text-red-600",
    icon: XCircle,
  },
};

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function targetLabel(note: FamilyNoteRow): string {
  if (note.scope === "student") {
    return note.student_name_snapshot || "Alumno";
  }
  if (note.scope === "teacher_cohort") {
    const count = note.cohort_student_ids?.length || 0;
    return count > 0
      ? `Cohorte de ${note.teacher_name || "docente"} (${count} alumnos)`
      : `Cohorte de ${note.teacher_name || "docente"}`;
  }
  return "Toda la academia";
}

export function FamilyNotesModeration() {
  const currentUser = useAppStore((s) => s.currentUser);
  const activeRole = useAppStore((s) => s.activeRole);

  const [notes, setNotes] = useState<FamilyNoteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("pendiente");
  const [search, setSearch] = useState("");

  const [approveTarget, setApproveTarget] = useState<FamilyNoteRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<FamilyNoteRow | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [working, setWorking] = useState(false);

  const actor = useMemo(
    () =>
      resolveActor(
        currentUser?.email,
        currentUser?.name ||
          (activeRole === "staff" ? "Secretaría" : "Dirección"),
        activeRole,
      ),
    [activeRole, currentUser?.email, currentUser?.name],
  );

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const rows = await listFamilyNotes({ limit: 200 });
      setNotes(rows);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "No se pudo leer la bandeja de notas.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  useEffect(() => subscribeToFamilyNotesChanges(() => void loadNotes()), [loadNotes]);

  const counts = useMemo(
    () => ({
      pendiente: notes.filter((note) => note.status === "pendiente").length,
      publicado: notes.filter((note) => note.status === "publicado").length,
      rechazado: notes.filter((note) => note.status === "rechazado").length,
      todas: notes.length,
    }),
    [notes],
  );

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return notes.filter((note) => {
      if (filter !== "todas" && note.status !== filter) return false;
      if (!query) return true;
      return [
        note.title,
        note.body,
        note.student_name_snapshot,
        note.teacher_name,
        note.submitted_by_name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [filter, notes, search]);

  const handleApprove = async () => {
    if (!approveTarget) return;
    try {
      setWorking(true);
      const published = await approveFamilyNote(
        approveTarget.id,
        actor.id,
        actor.name,
      );
      toast.success(
        published.scope === "teacher_cohort"
          ? `Nota publicada y cohorte congelada (${published.cohort_student_ids?.length || 0} alumnos).`
          : "Nota publicada. La familia ya puede verla.",
      );
      setApproveTarget(null);
      await loadNotes();
      notifyFamilyNotesChanged();
    } catch (error) {
      toast.error(
        error instanceof InformesValidationError
          ? error.message
          : "No se pudo publicar la nota.",
      );
    } finally {
      setWorking(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    const reason = rejectionReason.trim();
    if (reason.length < 5) {
      toast.error("Escribe el motivo del rechazo (mínimo 5 caracteres).");
      return;
    }
    try {
      setWorking(true);
      await rejectFamilyNote(rejectTarget.id, actor.id, actor.name, reason);
      toast.success("Nota rechazada. El docente verá el motivo y podrá corregirla.");
      setRejectTarget(null);
      setRejectionReason("");
      await loadNotes();
      notifyFamilyNotesChanged();
    } catch (error) {
      toast.error(
        error instanceof InformesValidationError
          ? error.message
          : "No se pudo rechazar la nota.",
      );
    } finally {
      setWorking(false);
    }
  };

  const filterButtons: Array<{ key: StatusFilter; label: string; count: number }> = [
    { key: "pendiente", label: "Pendientes", count: counts.pendiente },
    { key: "publicado", label: "Publicadas", count: counts.publicado },
    { key: "rechazado", label: "Rechazadas", count: counts.rechazado },
    { key: "todas", label: "Todas", count: counts.todas },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Notas a Familia (v2) · Moderación
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 text-[10px] font-black text-primary"
            >
              BETA
            </Badge>
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Solo lo que apruebes aquí llega al portal familia. Rechazar no borra el
            contenido: el docente recibe el motivo para corregirlo.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void loadNotes()}
          disabled={loading}
          className="h-8 shrink-0 gap-1.5 text-xs font-bold"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {filterButtons.map((button) => (
            <button
              key={button.key}
              type="button"
              onClick={() => setFilter(button.key)}
              className={`rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition-all ${
                filter === button.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {button.label}
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-black">
                {button.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por alumno, docente o texto…"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {loadError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-600">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {!loadError && !loading && filteredNotes.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
          <FileText className="mx-auto h-5 w-5 text-muted-foreground" />
          <p className="mt-2 text-xs font-semibold text-foreground">
            {notes.length === 0
              ? "Todavía no hay notas enviadas por docentes."
              : "No hay notas con este filtro."}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Las notas nuevas llegan aquí en estado pendiente.
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {filteredNotes.map((note) => {
          const meta = STATUS_META[note.status];
          const StatusIcon = meta.icon;
          return (
            <article
              key={note.id}
              className="rounded-2xl border border-border bg-card p-3.5 shadow-xs"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">{note.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {note.scope === "teacher_cohort" ? (
                        <Users className="h-3 w-3" />
                      ) : (
                        <FileText className="h-3 w-3" />
                      )}
                      {targetLabel(note)}
                    </span>
                    <span>·</span>
                    <span>
                      Enviada por {note.submitted_by_name || note.teacher_name || "docente"}
                    </span>
                    <span>·</span>
                    <span>{formatDateTime(note.submitted_at)}</span>
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`gap-1 text-[10px] font-black ${meta.className}`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {meta.label}
                </Badge>
              </div>

              <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">
                {note.body}
              </p>

              {note.status === "rechazado" && note.rejection_reason && (
                <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-red-500/30 bg-red-500/5 p-2 text-[11px] font-semibold text-red-600">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>
                    Motivo del rechazo: {note.rejection_reason}
                    {note.reviewed_by_name ? ` · ${note.reviewed_by_name}` : ""}
                  </span>
                </p>
              )}

              {note.status === "publicado" && (
                <p className="mt-2 text-[11px] text-emerald-600">
                  Publicada el {formatDateTime(note.published_at)}
                  {note.published_by_name ? ` por ${note.published_by_name}` : ""}
                  {note.cohort_snapshot_at
                    ? ` · Cohorte congelada (${note.cohort_student_ids?.length || 0} alumnos)`
                    : ""}
                </p>
              )}

              {note.status === "pendiente" && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setApproveTarget(note)}
                    className="h-8 gap-1.5 text-xs font-bold"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Aprobar y publicar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRejectTarget(note);
                      setRejectionReason("");
                    }}
                    className="h-8 gap-1.5 border-red-500/40 text-xs font-bold text-red-600 hover:bg-red-500/10"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Rechazar
                  </Button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        Aprobar publica para la familia; el historial queda auditado en
        <code className="mx-1 rounded bg-muted px-1 py-0.5">evaluation_audit_log</code>.
        Esta bandeja no modifica <code className="mx-1 rounded bg-muted px-1 py-0.5">students.notes</code>
        ni datos financieros.
      </p>

      {/* Confirmar publicación */}
      <Dialog
        open={Boolean(approveTarget)}
        onOpenChange={(open) => {
          if (!open && !working) setApproveTarget(null);
        }}
      >
        <DialogContent className="w-[94vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Publicar esta nota</DialogTitle>
            <DialogDescription className="text-xs">
              {approveTarget
                ? `Se publicará "${approveTarget.title}" para ${targetLabel(approveTarget)}. Una vez publicada no se puede rechazar.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {approveTarget?.scope === "teacher_cohort" && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2 text-[11px] text-amber-700">
              Al publicarse se congela la lista actual de alumnos de la cohorte. Si
              entra un alumno nuevo después, no recibirá esta nota.
            </p>
          )}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setApproveTarget(null)}
              disabled={working}
              className="h-9 text-xs font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void handleApprove()}
              disabled={working}
              className="h-9 gap-1.5 text-xs font-bold"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {working ? "Publicando…" : "Publicar ahora"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rechazar con motivo */}
      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open && !working) {
            setRejectTarget(null);
            setRejectionReason("");
          }
        }}
      >
        <DialogContent className="w-[94vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Rechazar nota</DialogTitle>
            <DialogDescription className="text-xs">
              El contenido se conserva y el docente verá el motivo para corregirlo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <label
              htmlFor="family-note-rejection"
              className="text-[10px] font-black uppercase tracking-wide text-muted-foreground"
            >
              Motivo del rechazo (obligatorio)
            </label>
            <Textarea
              id="family-note-rejection"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              maxLength={500}
              placeholder="Ej. Falta indicar la próxima clase; ajusta el tono para la familia…"
              className="min-h-[90px] text-sm"
            />
            <span className="text-right text-[10px] text-muted-foreground">
              {rejectionReason.length}/500
            </span>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setRejectTarget(null);
                setRejectionReason("");
              }}
              disabled={working}
              className="h-9 text-xs font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => void handleReject()}
              disabled={working}
              className="h-9 gap-1.5 text-xs font-bold"
            >
              <XCircle className="h-3.5 w-3.5" />
              {working ? "Rechazando…" : "Rechazar nota"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
