import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Info, Lock, MessageCircle, PenLine } from "lucide-react";
import { FamilyNoteForm } from "@/components/teacher/family-note-form";
import { InternalNoteForm } from "@/components/teacher/internal-note-form";
import { LessonNotes } from "@/components/teacher/lesson-notes";
import { useTeacherIdentity } from "@/hooks/use-teacher-identity";
import { useTeacherPilotAccess } from "@/hooks/use-teacher-pilot-access";

export const Route = createFileRoute("/teacher/notas")({
  head: () => ({
    meta: [
      { title: "Notas del docente — VM STAFF" },
      {
        name: "description",
        content:
          "Escribe una nota para la familia o una nota interna para Dirección desde el portal del docente.",
      },
    ],
  }),
  component: TeacherNotesPage,
});

type NotesView = "family" | "internal";

function TeacherNotesPage() {
  const { teacherDisplayName, teacherId, teacherStudentList } = useTeacherIdentity();
  const { loading, familyNoteAccess, internalNoteAccess, isPilotTeacher, v2FlagsOn } =
    useTeacherPilotAccess(teacherId);
  const [view, setView] = useState<NotesView>("family");

  const hasV2Access = familyNoteAccess || internalNoteAccess;

  // Mientras se resuelven los permisos no mostramos ningún formulario: evita
  // abrir un flujo que el docente no tiene habilitado.
  if (loading) {
    return (
      <div className="space-y-2">
        <h1 className="text-lg font-black text-foreground">Notas</h1>
        <p className="text-xs text-muted-foreground">Verificando permisos…</p>
      </div>
    );
  }

  // Docente fuera del piloto: conserva el flujo anterior intacto.
  if (!hasV2Access) {
    return (
      <div className="space-y-3">
        <div>
          <h1 className="text-lg font-black text-foreground">Notas</h1>
          <p className="text-xs text-muted-foreground">
            Nota a la familia o nota privada. Dirección revisa antes de publicar.
          </p>
        </div>
        <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>Tu cuenta usa el flujo anterior de notas.</span>
        </div>
        <LessonNotes />
      </div>
    );
  }

  const activeView: NotesView =
    view === "internal" && internalNoteAccess
      ? "internal"
      : view === "family" && familyNoteAccess
        ? "family"
        : familyNoteAccess
          ? "family"
          : "internal";

  const showSegmented = familyNoteAccess && internalNoteAccess;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-lg font-black text-foreground">Notas</h1>
          <p className="text-xs text-muted-foreground">
            {activeView === "family"
              ? "Dirección revisa cada nota antes de que llegue a la familia."
              : "Solo la lee Dirección y Secretaría. La familia no la ve."}
          </p>
        </div>
        {isPilotTeacher && !v2FlagsOn && (
          <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
            Piloto
          </span>
        )}
      </div>

      {showSegmented && (
        <div
          role="tablist"
          aria-label="Tipo de nota"
          className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "family"}
            onClick={() => setView("family")}
            className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeView === "family"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            A la familia
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "internal"}
            onClick={() => setView("internal")}
            className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeView === "internal"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Lock className="h-4 w-4" />
            Interna
          </button>
        </div>
      )}

      {activeView === "family" ? (
        <FamilyNoteForm
          teacherName={teacherDisplayName}
          teacherId={teacherId}
          students={teacherStudentList}
        />
      ) : (
        <InternalNoteForm
          teacherName={teacherDisplayName}
          teacherId={teacherId}
          students={teacherStudentList}
        />
      )}

      <div className="flex items-start gap-2 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <PenLine className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Ninguna nota se envía sola: Dirección aprueba o rechaza cada una antes de
          publicarla.
        </span>
      </div>
    </div>
  );
}
