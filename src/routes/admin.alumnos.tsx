import { createFileRoute } from "@tanstack/react-router";
import { StudentsTable } from "@/components/admin/students-table";

export const Route = createFileRoute("/admin/alumnos")({
  head: () => ({
    meta: [
      { title: "Gestión de Alumnos — Cadencia" },
      {
        name: "description",
        content:
          "Directorio de alumnos, asistencia, profesores asignados, estado de morosidad y fichas individuales.",
      },
      { property: "og:title", content: "Gestión de Alumnos — Cadencia" },
      {
        property: "og:description",
        content: "Administración integral de alumnos, familias y seguimiento académico.",
      },
    ],
  }),
  component: AdminAlumnosPage,
});

function AdminAlumnosPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Directorio de Alumnos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestión de fichas, asignación de profesores, asistencia y seguimiento de deserciones.
        </p>
      </div>

      <StudentsTable />
    </div>
  );
}
