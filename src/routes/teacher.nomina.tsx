import { createFileRoute } from "@tanstack/react-router";
import { TeacherAttendanceReport } from "@/components/teacher/teacher-attendance-report";

export const Route = createFileRoute("/teacher/nomina")({
  head: () => ({
    meta: [
      { title: "Mi asistencia — VM STAFF" },
      {
        name: "description",
        content:
          "Fichajes de entrada y salida del docente, mes por mes, con días por regularizar y descarga en PDF o Excel.",
      },
      { property: "og:title", content: "Mi Asistencia — VM STAFF" },
      {
        property: "og:description",
        content:
          "Transparencia total sobre tus fichajes: horas registradas, días asistidos y días pendientes de regularizar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeacherPayroll,
});

function TeacherPayroll() {
  return <TeacherAttendanceReport />;
}
