import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { IntegratedTeacherKioskHeader } from "@/components/teacher/integrated-kiosk-header";
import { LessonNotes } from "@/components/teacher/lesson-notes";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/teacher/")({
  head: () => ({
    meta: [
      { title: "Kiosco de clase — VM STAFF" },
      {
        name: "description",
        content:
          "Marca asistencia en un toque, revisa la clase en curso y deja notas privadas o para la familia.",
      },
      { property: "og:title", content: "Kiosco de Clase — VM STAFF" },
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
  const allLessons = useAppStore((s) => s.lessons);
  const schedule = useAppStore((s) => s.schedule);
  const currentUser = useAppStore((s) => s.currentUser);

  // Extraer el nombre del profesor del usuario actual (ej. "pepito (Piano)" -> "pepito")
  const teacherRawName = currentUser?.name ?? "Profesor";
  const teacherClean = teacherRawName.toLowerCase().replace(/\s*\(.*?\)/, "").trim();

  // Obtener las clases correspondientes a este profesor desde el horario central
  const teacherScheduleLessons: Lesson[] = useMemo(() => {
    const matched = schedule.filter((sch) => {
      const schTeacher = sch.teacher.toLowerCase().replace(/\s*\(.*?\)/, "").trim();
      return (
        schTeacher.includes(teacherClean) ||
        teacherClean.includes(schTeacher) ||
        sch.teacher.toLowerCase().includes(teacherClean)
      );
    });

    if (matched.length > 0) {
      return matched.map((m) => ({
        id: m.id,
        time: m.time,
        student: m.student,
        instrument: m.instrument,
        room: m.room,
        status: (m.status === "cancelada" ? "ausente" : "pendiente") as AttendanceStatus,
      }));
    }

    return allLessons.filter((l) =>
      teacherRawName.toLowerCase().includes(l.instrument.toLowerCase())
    );
  }, [schedule, allLessons, teacherClean, teacherRawName]);

  const current = teacherScheduleLessons.find((l) => l.status === "pendiente") ?? teacherScheduleLessons[0];
  const rest = teacherScheduleLessons.filter((l) => l.id !== current?.id);

  return (
    <div className="space-y-5">
      {/* 🚀 CABECERA INTEGRADA 3-EN-1: FICHAJE + CLASE EN CURSO + ASISTENCIA */}
      <IntegratedTeacherKioskHeader currentLesson={current} />

      {current ? (
        <>
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
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            🎻
          </div>
          <h3 className="text-base font-bold text-foreground">
            ¡Bienvenido/a al Kiosco Docente, {teacherRawName}!
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Tu cuenta de profesor ha sido activada con éxito. La Dirección y Secretaría (Nayeli) están asignando tus alumnos y horarios de clases en la sede.
          </p>
          <p className="text-[11px] font-semibold text-primary">
            📌 Puedes usar el botón "Fichaje de Sede" arriba para marcar tus turnos al llegar a la academia.
          </p>
        </div>
      )}
    </div>
  );
}
