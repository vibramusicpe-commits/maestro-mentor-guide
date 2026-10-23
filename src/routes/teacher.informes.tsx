import { createFileRoute } from "@tanstack/react-router";
import { TeacherProgressReports } from "@/components/teacher/teacher-progress-reports";

export const Route = createFileRoute("/teacher/informes")({
  head: () => ({
    meta: [
      { title: "Informes de progreso — VM STAFF" },
      {
        name: "description",
        content:
          "El docente consolida sus reportes de clase en un borrador de informe de progreso y lo envía a Dirección para revisión y publicación.",
      },
    ],
  }),
  /**
   * `?student=<uuid>` permite llegar desde el directorio docente con el alumno
   * ya elegido. Si falta o es inválido, el docente lo busca en el selector.
   */
  validateSearch: (search: Record<string, unknown>): { student?: string } => {
    const raw = search["student"];
    const student = typeof raw === "string" ? raw.trim() : "";
    return student ? { student } : {};
  },
  component: TeacherReportsPage,
});

function TeacherReportsPage() {
  const { student } = Route.useSearch();
  return <TeacherProgressReports initialStudentId={student} />;
}
