import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/teacher/alumnos")({
  head: () => ({
    meta: [
      { title: "Mis alumnos — Cadencia" },
      {
        name: "description",
        content:
          "Lista de alumnos del profesor con instrumento, nivel, próxima clase y asistencia reciente.",
      },
      { property: "og:title", content: "Mis alumnos — Cadencia" },
      {
        property: "og:description",
        content: "Consulta el nivel, la próxima clase y la asistencia de cada alumno.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeacherStudents,
});

function TeacherStudents() {
  const students = useAppStore((s) => s.students);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.instrument.toLowerCase().includes(q),
    );
  }, [students, query]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Mis alumnos</h1>
        <p className="text-xs text-muted-foreground">{students.length} alumnos activos</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o instrumento"
          className="pl-9"
        />
      </div>

      <ul className="space-y-2">
        {filtered.map((s, i) => (
          <motion.li
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                {s.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{s.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {s.instrument} · {s.level}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">{s.nextLesson}</p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                s.attendanceRate >= 90
                  ? "bg-success/15 text-success"
                  : s.attendanceRate >= 75
                    ? "bg-warning/20 text-warning"
                    : "bg-destructive/15 text-destructive"
              }`}
            >
              {s.attendanceRate}%
            </span>
          </motion.li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Sin resultados para “{query}”.
          </li>
        )}
      </ul>
    </div>
  );
}
