/**
 * ================================================================
 * internal-notes-inbox.tsx — Bandeja de Dirección (Fase 4)
 * ================================================================
 *
 * Dirección/Secretaría revisa lo que observan los docentes:
 *   nueva     -> leida      (al marcarla leída, queda constancia de quién y cuándo)
 *   leida     -> archivada  (dio por atendida la observación)
 *   archivada -> leida      (reabrir, por si se archivó sin querer)
 *
 * Nada se borra y nada de esto llega al portal familia.
 * La auditoría la registra el trigger `trg_audit_internal_notes` en
 * `evaluation_audit_log` con `entity_type = 'internal_note'`; esta UI no la
 * duplica.
 *
 * No toca `students.notes` (legacy congelado), no toca facturación y no
 * contiene datos financieros.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  CheckCheck,
  Clock,
  FileText,
  Lock,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAppStore } from "@/store/app-store";
import type { InternalNoteRow, InternalNoteStatus } from "@/lib/informes/types";
import { InformesValidationError } from "@/lib/informes/utils";
import { resolveActor } from "@/lib/services/teacher-resolver";
import {
  archiveInternalNote,
  listInternalNotes,
  markInternalNoteRead,
  notifyInternalNotesChanged,
  reopenInternalNote,
  subscribeToInternalNotesChanges,
} from "@/lib/services/internal-notes.service";

type StatusFilter = InternalNoteStatus | "todas";

const STATUS_META: Record<
  InternalNoteStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  nueva: {
    label: "Nueva",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-600",
    icon: Clock,
  },
  leida: {
    label: "Leída",
    className: "border-sky-500/40 bg-sky-500/10 text-sky-600",
    icon: CheckCheck,
  },
  archivada: {
    label: "Archivada",
    className: "border-border bg-muted/40 text-muted-foreground",
    icon: Archive,
  },
};

const VISIBILITY_LABEL: Record<InternalNoteRow["visibility"], string> = {
  direction: "Solo Dirección",
  staff: "Dirección y Secretaría",
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

export function InternalNotesInbox() {
  const currentUser = useAppStore((s) => s.currentUser);
  const activeRole = useAppStore((s) => s.activeRole);

  const [notes, setNotes] = useState<InternalNoteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("nueva");
  const [search, setSearch] = useState("");
  const [workingId, setWorkingId] = useState<string | null>(null);

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
      const rows = await listInternalNotes({
        includeArchived: true,
        limit: 200,
      });
      setNotes(rows);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "No se pudo leer la bandeja de notas internas.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  useEffect(
    () => subscribeToInternalNotesChanges(() => void loadNotes()),
    [loadNotes],
  );

  const counts = useMemo(
    () => ({
      nueva: notes.filter((note) => note.status === "nueva").length,
      leida: notes.filter((note) => note.status === "leida").length,
      archivada: notes.filter((note) => note.status === "archivada").length,
      todas: notes.length,
    }),
    [notes],
  );

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return notes.filter((note) => {
      if (filter !== "todas" && note.status !== filter) return false;
      if (!query) return true;
      return [note.body, note.student_name_snapshot, note.teacher_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [filter, notes, search]);

  const runAction = async (
    note: InternalNoteRow,
    action: "read" | "archive" | "reopen",
  ) => {
    try {
      setWorkingId(note.id);
      if (action === "read") {
        await markInternalNoteRead(note.id, actor.id, actor.name);
        toast.success("Nota marcada como leída.");
      } else if (action === "archive") {
        await archiveInternalNote(note.id, actor.id, actor.name);
        toast.success("Nota archivada. Se puede reabrir cuando quieras.");
      } else {
        await reopenInternalNote(note.id, actor.id, actor.name);
        toast.success("Nota reabierta en la bandeja.");
      }
      await loadNotes();
      notifyInternalNotesChanged();
    } catch (error) {
      toast.error(
        error instanceof InformesValidationError
          ? error.message
          : "No se pudo actualizar la nota interna.",
      );
    } finally {
      setWorkingId(null);
    }
  };

  const filterButtons: Array<{ key: StatusFilter; label: string; count: number }> = [
    { key: "nueva", label: "Nuevas", count: counts.nueva },
    { key: "leida", label: "Leídas", count: counts.leida },
    { key: "archivada", label: "Archivadas", count: counts.archivada },
    { key: "todas", label: "Todas", count: counts.todas },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Lock className="h-4 w-4 text-primary" />
            Notas internas del equipo
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 text-[10px] font-black text-primary"
            >
              BETA
            </Badge>
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Observaciones que los docentes dejan para Dirección. No son visibles para
            la familia y no modifican la ficha del alumno.
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
              ? "Todavía no hay notas internas enviadas por docentes."
              : "No hay notas con este filtro."}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Las notas nuevas llegan aquí en estado “Nueva”.
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {filteredNotes.map((note) => {
          const meta = STATUS_META[note.status];
          const StatusIcon = meta.icon;
          const isWorking = workingId === note.id;
          return (
            <article
              key={note.id}
              className="rounded-2xl border border-border bg-card p-3.5 shadow-xs"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    {note.student_name_snapshot || "Nota general"}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {note.visibility === "direction" ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <Users className="h-3 w-3" />
                      )}
                      {VISIBILITY_LABEL[note.visibility]}
                    </span>
                    <span>·</span>
                    <span>
                      Enviada por {note.teacher_name || "docente"}
                    </span>
                    <span>·</span>
                    <span>{formatDateTime(note.created_at)}</span>
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

              {note.read_at && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Vista por {note.read_by_name || "Dirección"} el{" "}
                  {formatDateTime(note.read_at)}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {note.status === "nueva" && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void runAction(note, "read")}
                    disabled={isWorking}
                    className="h-8 gap-1.5 text-xs font-bold"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    {isWorking ? "Guardando…" : "Marcar leída"}
                  </Button>
                )}

                {note.status !== "archivada" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void runAction(note, "archive")}
                    disabled={isWorking}
                    className="h-8 gap-1.5 text-xs font-bold"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Archivar
                  </Button>
                )}

                {note.status === "archivada" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void runAction(note, "reopen")}
                    disabled={isWorking}
                    className="h-8 gap-1.5 text-xs font-bold"
                  >
                    <ArchiveRestore className="h-3.5 w-3.5" />
                    Reabrir
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        Cada cambio queda auditado en
        <code className="mx-1 rounded bg-muted px-1 py-0.5">
          evaluation_audit_log
        </code>
        con <code className="mx-1 rounded bg-muted px-1 py-0.5">entity_type = internal_note</code>.
        Esta bandeja no modifica{" "}
        <code className="mx-1 rounded bg-muted px-1 py-0.5">students.notes</code> ni
        datos financieros.
      </p>
    </div>
  );
}
