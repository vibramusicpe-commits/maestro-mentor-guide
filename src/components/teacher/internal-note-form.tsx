/**
 * ================================================================
 * internal-note-form.tsx — Nota interna del docente a Dirección (Fase 4)
 * ================================================================
 *
 * El docente registra una observación que SOLO ve Dirección/Secretaría.
 * NUNCA se expone al portal familia ni modifica `students.notes`.
 *
 * Flujo del estado: `nueva` (recién enviada) -> `leida` (Dirección la abrió)
 * -> `archivada` (Dirección la dio por atendida). Nada se borra.
 *
 * Reglas que este componente respeta:
 *   - No escribe `students.notes` (legacy congelado).
 *   - No incluye datos financieros.
 *   - La fuente de verdad es PostgreSQL (`internal_notes`).
 *   - Sin visibilidad para la familia en ningún caso.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCheck,
  Clock,
  Lock,
  RefreshCw,
  Send,
  StickyNote,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StudentPicker } from "@/components/teacher/student-picker";
import { toast } from "sonner";
import type { InternalNoteRow, InternalNoteVisibility } from "@/lib/informes/types";
import { InformesValidationError } from "@/lib/informes/utils";
import {
  createInternalNote,
  listInternalNotes,
  notifyInternalNotesChanged,
  subscribeToInternalNotesChanges,
} from "@/lib/services/internal-notes.service";

export interface InternalNoteStudentOption {
  id: string;
  name: string;
  instrument?: string | null;
}

interface InternalNoteFormProps {
  teacherName: string;
  teacherId?: string | null;
  students: InternalNoteStudentOption[];
}

const BODY_MAX = 2000;

const STATUS_META: Record<
  InternalNoteRow["status"],
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

const VISIBILITY_META: Record<
  InternalNoteVisibility,
  { label: string; hint: string; className: string }
> = {
  direction: {
    label: "Solo Dirección",
    hint: "La ven únicamente Dirección y coordinación.",
    className: "border-primary bg-primary/10 text-primary",
  },
  staff: {
    label: "Dirección y Secretaría",
    hint: "La ve también secretaría para coordinar con la familia.",
    className: "border-primary bg-primary/10 text-primary",
  },
};

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InternalNoteForm({
  teacherName,
  teacherId,
  students,
}: InternalNoteFormProps) {
  const [studentId, setStudentId] = useState("");
  const [visibility, setVisibility] =
    useState<InternalNoteVisibility>("direction");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [notes, setNotes] = useState<InternalNoteRow[]>([]);
  const [loading, setLoading] = useState(false);

  const activeStudents = useMemo(
    () =>
      [...students]
        .filter((student) => Boolean(student.id))
        .sort((a, b) => a.name.localeCompare(b.name, "es")),
    [students],
  );

  const loadNotes = useCallback(async () => {
    if (!teacherId) {
      setNotes([]);
      return;
    }
    try {
      setLoading(true);
      const rows = await listInternalNotes({
        teacherId,
        includeArchived: true,
        limit: 20,
      });
      setNotes(rows);
    } catch {
      // Silencioso: el formulario sigue usable aunque falle la lectura.
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  useEffect(
    () => subscribeToInternalNotesChanges(() => void loadNotes()),
    [loadNotes],
  );

  const handleSubmit = async () => {
    const cleanBody = body.trim();
    if (cleanBody.length < 10) {
      toast.error("Escribe la observación interna (mínimo 10 caracteres).");
      return;
    }

    const student = activeStudents.find((item) => item.id === studentId);

    try {
      setSubmitting(true);
      await createInternalNote({
        studentId: studentId || null,
        studentName: student?.name || null,
        teacherId: teacherId || null,
        teacherName,
        body: cleanBody,
        visibility,
        createdById: teacherId || null,
        createdByName: teacherName,
        isTest: false,
      });

      toast.success("Nota interna enviada a Dirección. No es visible para la familia.");
      setBody("");
      setStudentId("");
      await loadNotes();
      notifyInternalNotesChanged();
    } catch (error) {
      const message =
        error instanceof InformesValidationError
          ? error.message
          : "No se pudo enviar la nota interna. Revisa tu conexión e inténtalo de nuevo.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-background/60 p-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <Lock className="h-3.5 w-3.5 text-primary" />
            Nota interna para Dirección
          </p>
          <p className="text-xs text-muted-foreground">
            Queda dentro del equipo. La familia nunca la ve. No incluyas montos ni
            datos de pago.
          </p>
        </div>

        {/* Alumno (opcional) */}
        <div className="mt-3 grid gap-1.5">
          <label
            htmlFor="internal-note-student"
            className="text-xs font-black uppercase tracking-wide text-muted-foreground"
          >
            Alumno (opcional)
          </label>
          <StudentPicker
            id="internal-note-student"
            students={activeStudents}
            value={studentId}
            onChange={setStudentId}
            allowEmpty
            emptyLabel="Nota general (sin alumno)"
            placeholder="Buscar alumno (opcional)…"
          />
        </div>

        {/* Visibilidad */}
        <div className="mt-3 grid gap-1.5">
          <span className="text-xs font-black uppercase tracking-wide text-muted-foreground">
            Quién la puede leer
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {(["direction", "staff"] as InternalNoteVisibility[]).map((option) => {
              const meta = VISIBILITY_META[option];
              const isActive = visibility === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setVisibility(option)}
                  className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? meta.className
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option === "direction" ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    <Users className="h-3.5 w-3.5" />
                  )}
                  {meta.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {VISIBILITY_META[visibility].hint}
          </p>
        </div>

        {/* Contenido */}
        <div className="mt-3 grid gap-1.5">
          <label
            htmlFor="internal-note-body"
            className="text-xs font-black uppercase tracking-wide text-muted-foreground"
          >
            Observación interna
          </label>
          <Textarea
            id="internal-note-body"
            value={body}
            maxLength={BODY_MAX}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Ej. El alumno llegó sin el libro; conviene avisar a la familia antes del sábado…"
            className="min-h-[110px] text-sm"
          />
          <span className="text-right text-xs text-muted-foreground">
            {body.length}/{BODY_MAX}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Se enviará como <strong>{teacherName}</strong>.
          </p>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="min-h-[44px] gap-1.5 px-4 text-xs font-bold"
          >
            {submitting ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {submitting ? "Enviando…" : "Enviar a Dirección"}
          </Button>
        </div>
      </div>

      {/* Mis notas internas (acordeón colapsado) */}
      <details className="rounded-xl border border-border bg-background/60 px-3 py-1">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <StickyNote className="h-3.5 w-3.5 text-primary" />
            Mis notas internas
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-bold text-muted-foreground">
              {notes.length}
            </span>
          </span>
          <span className="text-xs font-semibold text-muted-foreground">Ver / ocultar</span>
        </summary>

        <div className="flex items-center justify-between gap-2 pb-1 pt-1">
          <p className="text-xs text-muted-foreground">
            Solo Dirección y Secretaría pueden leerlas.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void loadNotes()}
            disabled={loading || !teacherId}
            className="h-9 gap-1 px-2 text-xs"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {!teacherId && (
          <p className="mt-1 text-xs text-muted-foreground">
            No se pudo resolver tu identificador docente; podrás enviar la nota, pero
            el historial no se mostrará en este dispositivo.
          </p>
        )}

        {teacherId && notes.length === 0 && !loading && (
          <p className="mt-1 pb-2 text-xs text-muted-foreground">
            Aún no registraste notas internas desde este sistema.
          </p>
        )}

        <div className="mt-2 space-y-2 pb-1">
          {notes.map((note) => {
            const meta = STATUS_META[note.status];
            const StatusIcon = meta.icon;
            return (
              <div
                key={note.id}
                className="rounded-lg border border-border bg-background p-2.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-foreground">
                      {note.student_name_snapshot || "Nota general"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {VISIBILITY_META[note.visibility].label} ·{" "}
                      {formatDateTime(note.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`gap-1 text-xs font-bold ${meta.className}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {meta.label}
                  </Badge>
                </div>

                <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">
                  {note.body}
                </p>

                {note.read_at && note.read_by_name && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Vista por {note.read_by_name} · {formatDateTime(note.read_at)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}
