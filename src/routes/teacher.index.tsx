import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CurrentLessonCard } from "@/components/teacher/current-lesson-card";
import { AttendanceButtons } from "@/components/teacher/attendance-buttons";
import { LessonNotes } from "@/components/teacher/lesson-notes";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/teacher/")({
  head: () => ({
    meta: [
      { title: "Kiosco de clase — Cadencia" },
      {
        name: "description",
        content:
          "Marca asistencia en un toque, revisa la clase en curso y deja notas privadas o para la familia.",
      },
      { property: "og:title", content: "Kiosco de clase — Cadencia" },
      {
        property: "og:description",
        content: "Asistencia instantánea y notas de clase desde el móvil del profesor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeacherKiosk,
});

const statusStyles: Record<string, string> = {
  pendiente: "bg-muted text-muted-foreground",
  presente: "bg-success/15 text-success",
  ausente: "bg-destructive/15 text-destructive",
  tarde: "bg-warning/20 text-warning",
};

function TeacherKiosk() {
  const lessons = useAppStore((s) => s.lessons);
  const setAttendance = useAppStore((s) => s.setAttendance);

  const current = lessons.find((l) => l.status === "pendiente") ?? lessons[0]!;
  const rest = lessons.filter((l) => l.id !== current.id);

  return (
    <div className="space-y-5">
      <CurrentLessonCard lesson={current} />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Marcar asistencia</h3>
        <AttendanceButtons
          current={current.status}
          onSelect={(status) => setAttendance(current.id, status)}
        />
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <LessonNotes />
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Resto de la agenda de hoy</h3>
        <ul className="space-y-2">
          {rest.map((l, i) => (
            <motion.li
              key={l.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
            >
              <span className="text-sm font-semibold tabular-nums">{l.time}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{l.student}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {l.instrument} · {l.room}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusStyles[l.status]}`}
              >
                {l.status}
              </span>
            </motion.li>
          ))}
        </ul>
      </section>
    </div>
  );
}
