import { createFileRoute } from "@tanstack/react-router";
import { StudentsTable } from "@/components/admin/students-table";
import { VacancyAvailabilityPanel } from "@/components/admin/vacancy-availability-panel";

export const Route = createFileRoute("/admin/alumnos")({
  head: () => ({
    meta: [
      { title: "Directorio de Alumnos — VM STAFF" },
      {
        name: "description",
        content:
          "Directorio de alumnos, asistencia, profesores asignados, estado de morosidad y fichas individuales.",
      },
      { property: "og:title", content: "Directorio de Alumnos — VM STAFF" },
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
          Gestión de fichas, asignación de profesores, asistencia, matrículas y disponibilidad de vacantes (máx. 5 alumnos por clase).
        </p>
      </div>

      <StudentsTable />

      {/* Explorador de Vacantes y Disponibilidad para Nuevas Matrículas */}
      <VacancyAvailabilityPanel />
    </div>
  );
}
