import { createFileRoute } from "@tanstack/react-router";
import { MinimalAgendaCalendar } from "@/components/agenda/minimal-agenda-calendar";
import { useInsforgeSync } from "@/hooks/use-insforge-sync";
import { useTeacherIdentity } from "@/hooks/use-teacher-identity";
import { RotateCw } from "lucide-react";

export const Route = createFileRoute("/teacher/agenda")({
  head: () => ({
    meta: [
      { title: "Mi Agenda — Kiosco de Profesor" },
      {
        name: "description",
        content: "Consulta tus clases programadas de la semana en modo solo lectura.",
      },
    ],
  }),
  component: TeacherAgendaPage,
});

function TeacherAgendaPage() {
  const { syncNow, isSyncing, lastSyncTime } = useInsforgeSync();

  // Identidad y filtro compartidos con el Kiosco (ADR-0177):
  // solo Dirección puede inspeccionar a otro docente.
  const {
    teacherDisplayName,
    isDirector,
    teacherScheduleLessons: teacherLessons,
    selectTeacher,
  } = useTeacherIdentity();

  return (
    <div className="space-y-4">
      {/* Selector de docente (solo Dirección) + estado en vivo */}
      <div className="flex items-center justify-between gap-2">
        {isDirector ? (
          <div className="flex min-w-0 flex-1 items-center gap-1 rounded-2xl border border-border bg-card p-1 shadow-xs">
            {["Fernando", "Nathaly", "Jeremy"].map((t) => (
              <button
                key={t}
                onClick={() => selectTeacher(t)}
                aria-pressed={teacherDisplayName === t}
                className={`min-h-[40px] min-w-0 flex-1 rounded-xl px-1 text-xs font-bold transition-colors ${
                  teacherDisplayName === t
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        ) : (
          <div className="min-w-0 flex-1" />
        )}

        {/* 🟢 Indicador en vivo + Botón Sincronizar */}
        <div className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-border bg-card px-2.5 py-1 shadow-xs text-xs font-bold text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSyncing ? "bg-amber-400 animate-ping" : "bg-emerald-400 animate-ping"
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                isSyncing ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
          </span>
          <span className="hidden sm:inline">
            {isSyncing
              ? "Sincronizando..."
              : lastSyncTime
                ? `En vivo · ${new Date(lastSyncTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                : "En vivo"}
          </span>
          <button
            onClick={() => syncNow()}
            disabled={isSyncing}
            title="Actualizar horario en tiempo real con PostgreSQL"
            aria-label="Sincronizar horario con PostgreSQL"
            className="ml-0.5 flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
          >
            <RotateCw className={`h-4 w-4 ${isSyncing ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      <MinimalAgendaCalendar
        lessons={teacherLessons}
        title={`Mi Horario Semanal (${teacherDisplayName})`}
        subtitle="Clases asignadas y salas de la sede"
        userType="teacher"
        defaultYear={2026}
      />
    </div>
  );
}
