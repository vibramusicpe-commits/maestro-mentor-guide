/**
 * ================================================================
 * family-note-form.tsx — Nota del docente a la familia (Fase 3)
 * ================================================================
 *
 * El docente redacta una nota y la envía a Dirección/Secretaría.
 * SIEMPRE nace en estado `pendiente`: nada llega a la familia sin
 * moderación previa.
 *
 * Reglas que este componente respeta:
 *   - No escribe `students.notes` (legacy congelado).
 *   - No incluye datos financieros.
 *   - La nota de cohorte congela la lista de alumnos al publicarse
 *     (lo hace el servicio, no la UI).
 *   - La fuente de verdad es PostgreSQL (`family_notes`).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  Send,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StudentPicker } from "@/components/teacher/student-picker";
import { toast } from "sonner";
import type { FamilyNoteRow, FamilyNoteScope } from "@/lib/informes/types";
import { InformesValidationError } from "@/lib/informes/utils";
import {
  listFamilyNotes,
  notifyFamilyNotesChanged,
  resolveTeacherCohort,
  submitFamilyNote,
  subscribeToFamilyNotesChanges,
} from "@/lib/services/family-notes.service";

export interface FamilyNoteStudentOption {
  id: string;
  name: string;
  instrument?: string | null;
}

interface FamilyNoteFormProps {
  teacherName: string;
  teacherId?: string | null;
  students: FamilyNoteStudentOption[];
}

const TITLE_MAX = 120;
const BODY_MAX = 1200;

const STATUS_META: Record<
  FamilyNoteRow["status"],
  { label: string; className: string; icon: typeof Clock }
> = {
  pendiente: {
    label: "En revisión",
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scopeLabel(note: FamilyNoteRow): string {
  if (note.scope === "student") {
    return note.student_name_snapshot || "Alumno";
  }
  if (note.scope === "teacher_cohort") {
    const count = note.cohort_student_ids?.length || 0;
    return count > 0
      ? `Cohorte (${count} alumnos)`
      : "Cohorte de alumnos";
  }
  return "Toda la academia";
}

export function FamilyNoteForm({
  teacherName,
  teacherId,
  students,
}: FamilyNoteFormProps) {
  const [scope, setScope] = useState<Extract<FamilyNoteScope, "student" | "teacher_cohort">>(
    "student",
  );
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [notes, setNotes] = useState<FamilyNoteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [cohortCount, setCohortCount] = useState<number | null>(null);

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
      const rows = await listFamilyNotes({ teacherId, limit: 20 });
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

  useEffect(() => subscribeToFamilyNotesChanges(() => void loadNotes()), [loadNotes]);

  useEffect(() => {
    let cancelled = false;
    if (!teacherId && !teacherName) {
      setCohortCount(null);
      return () => {
        cancelled = true;
      };
    }
    resolveTeacherCohort(teacherId, teacherName)
      .then((ids) => {
        if (!cancelled) setCohortCount(ids.length);
      })
      .catch(() => {
        if (!cancelled) setCohortCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [teacherId, teacherName]);

  const resetMessage = () => {
    setTitle("");
    setBody("");
    setStudentId("");
  };

  const handleSubmit = async () => {
    const cleanTitle = title.trim();
    const cleanBody = body.trim();

    if (cleanTitle.length < 4) {
      toast.error("Escribe un título de al menos 4 caracteres.");
      return;
    }
    if (cleanBody.length < 10) {
      toast.error("Escribe un mensaje de al menos 10 caracteres.");
      return;
    }
    if (scope === "student" && !studentId) {
      toast.error("Selecciona el alumno destinatario.");
      return;
    }

    const student = activeStudents.find((item) => item.id === studentId);

    try {
      setSubmitting(true);
      await submitFamilyNote({
        scope,
        studentId: scope === "student" ? studentId : null,
        studentName: scope === "student" ? student?.name || null : null,
        teacherId: teacherId || null,
        teacherName,
        title: cleanTitle,
        body: cleanBody,
        submittedById: teacherId || null,
        submittedByName: teacherName,
        isTest: false,
      });

      toast.success("Nota enviada a Dirección. Queda en revisión antes de llegar a la familia.");
      resetMessage();
      await loadNotes();
      notifyFamilyNotesChanged();
    } catch (error) {
      const message =
        error instanceof InformesValidationError
          ? error.message
          : "No se pudo enviar la nota. Revisa tu conexión e inténtalo de nuevo.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const loadAsDraft = (note: FamilyNoteRow) => {
    setTitle(note.title);
    setBody(note.body);
    if (note.scope === "student") {
      setScope("student");
      setStudentId(note.student_id || "");
    } else if (note.scope === "teacher_cohort") {
      setScope("teacher_cohort");
      setStudentId("");
    }
    toast.info("Contenido cargado. Corrige lo que pidió Dirección y vuelve a enviarlo.");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-background/60 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-foreground">
              Escribir nota para la familia
            </p>
            <p className="text-[11px] text-muted-foreground">
              Dirección revisa cada nota antes de publicarla. No incluyas montos ni
              datos de pago.
            </p>
          </div>
          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] font-black text-primary">
            BETA
          </Badge>
        </div>

        {/* Alcance */}
        <div className="mt-3 grid gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
            Para quién es la nota
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setScope("student")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-bold transition-all ${
                scope === "student"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Un alumno
            </button>
            <button
              type="button"
              onClick={() => setScope("teacher_cohort")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-bold transition-all ${
                scope === "teacher_cohort"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Todos mis alumnos
            </button>
          </div>
        </div>

        {/* Alumno */}
        {scope === "student" && (
          <div className="mt-3 grid gap-1.5">
            <label
              htmlFor="family-note-student"
              className="text-[10px] font-black uppercase tracking-wide text-muted-foreground"
            >
              Alumno
            </label>
            <StudentPicker
              id="family-note-student"
              students={activeStudents}
              value={studentId}
              onChange={setStudentId}
              allowEmpty
              emptyLabel="Sin alumno específico"
              placeholder="Buscar alumno: escribe 2 letras…"
            />
            {activeStudents.length === 0 && (
              <p className="text-[11px] text-amber-600">
                No hay alumnos activos en tu lista. La nota de cohorte sigue disponible.
              </p>
            )}
          </div>
        )}

        {scope === "teacher_cohort" && (
          <p className="mt-3 rounded-lg border border-border bg-muted/40 px-2 py-1.5 text-[11px] text-muted-foreground">
            {cohortCount === null
              ? "La lista de alumnos se congela al publicarse."
              : `Se publicará para ${cohortCount} alumno(s) activo(s) de tu cohorte. La lista se congela al publicarse.`}
          </p>
        )}

        {/* Título */}
        <div className="mt-3 grid gap-1.5">
          <label
            htmlFor="family-note-title"
            className="text-[10px] font-black uppercase tracking-wide text-muted-foreground"
          >
            Título
          </label>
          <Input
            id="family-note-title"
            value={title}
            maxLength={TITLE_MAX}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. Excelente avance en el repertorio de octubre"
            className="h-9 text-sm"
          />
          <span className="text-right text-[10px] text-muted-foreground">
            {title.length}/{TITLE_MAX}
          </span>
        </div>

        {/* Mensaje */}
        <div className="mt-1 grid gap-1.5">
          <label
            htmlFor="family-note-body"
            className="text-[10px] font-black uppercase tracking-wide text-muted-foreground"
          >
            Mensaje para la familia
          </label>
          <Textarea
            id="family-note-body"
            value={body}
            maxLength={BODY_MAX}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Describe el avance del alumno en lenguaje claro para la familia…"
            className="min-h-[110px] text-sm"
          />
          <span className="text-right text-[10px] text-muted-foreground">
            {body.length}/{BODY_MAX}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] text-muted-foreground">
            Se enviará como <strong>{teacherName}</strong>.
          </p>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="h-9 gap-1.5 text-xs font-bold"
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

      {/* Mis notas enviadas */}
      <div className="rounded-xl border border-border bg-background/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-foreground">Mis notas enviadas</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void loadNotes()}
            disabled={loading || !teacherId}
            className="h-7 gap-1 px-2 text-[11px]"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {!teacherId && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            No se pudo resolver tu identificador docente; podrás enviar la nota, pero
            el historial no se mostrará en este dispositivo.
          </p>
        )}

        {teacherId && notes.length === 0 && !loading && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Aún no enviaste notas desde este sistema.
          </p>
        )}

        <div className="mt-2 space-y-2">
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
                      {note.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {scopeLabel(note)} · {formatDateTime(note.submitted_at)}
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

                {note.status === "rechazado" && note.rejection_reason && (
                  <div className="mt-2 rounded-md border border-red-500/30 bg-red-500/5 p-2">
                    <p className="flex items-start gap-1 text-[11px] font-semibold text-red-600">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>Motivo: {note.rejection_reason}</span>
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => loadAsDraft(note)}
                      className="mt-1.5 h-7 px-2 text-[10px] font-bold"
                    >
                      Usar como base para corregir
                    </Button>
                  </div>
                )}

                {note.status === "publicado" && (
                  <p className="mt-1 text-[10px] text-emerald-600">
                    Publicada el {formatDateTime(note.published_at)}
                    {note.cohort_snapshot_at
                      ? ` · Cohortes congeladas (${note.cohort_student_ids?.length || 0} alumnos)`
                      : ""}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
