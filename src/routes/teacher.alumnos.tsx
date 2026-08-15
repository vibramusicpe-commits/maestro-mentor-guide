import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, UserCheck, Phone, Clock, AlertCircle, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
import { categoryStyles } from "@/components/admin/agenda-board";
import { teachers } from "@/store/admin-seeds";

export const Route = createFileRoute("/teacher/alumnos")({
  head: () => ({
    meta: [
      { title: "Directorio de Alumnos — Profesores · Vibra Music" },
      {
        name: "description",
        content:
          "Directorio de alumnos con instrumento, profesor asignado, horario, datos de contacto y categoría para coordinación y suplencias.",
      },
      { property: "og:title", content: "Directorio de Alumnos — Profesores · Vibra Music" },
      {
        property: "og:description",
        content: "Consulta horarios, profesores asignados y teléfonos de contacto para suplencias y emergencias.",
      },
    ],
  }),
  component: TeacherStudents,
});

function TeacherStudents() {
  const adminStudents = useAppStore((s) => s.adminStudents);
  const schedule = useAppStore((s) => s.schedule);
  const currentUser = useAppStore((s) => s.currentUser);

  const [query, setQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("todos");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");

  // Profesores disponibles en el directorio
  const availableTeachers = useMemo(() => {
    const fromStudents = adminStudents.map((s) => s.teacher).filter(Boolean);
    return Array.from(new Set([...teachers, ...fromStudents])).sort();
  }, [adminStudents]);

  // Filtrado de alumnos por profesor, nombre o instrumento
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return adminStudents.filter((s) => {
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.family.toLowerCase().includes(q) ||
        s.instrument.toLowerCase().includes(q) ||
        (s.emergencyContact?.name && s.emergencyContact.name.toLowerCase().includes(q));

      const matchTeacher =
        selectedTeacher === "todos" ||
        s.teacher.toLowerCase().includes(selectedTeacher.toLowerCase());

      const matchCategory =
        selectedCategory === "todas" || s.ageCategory === selectedCategory;

      return matchQuery && matchTeacher && matchCategory;
    });
  }, [adminStudents, query, selectedTeacher, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" /> Directorio de Alumnos y Horarios
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Guía de alumnos de la academia para seguimiento, coordinación y suplencias ante imprevistos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-full">
            {filtered.length} alumno(s) listados
          </span>
        </div>
      </div>

      {/* Leyenda Oficial de Categorías */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-2">
        <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-warning" /> Leyenda Oficial de Categorías:
        </p>
        <div className="flex flex-wrap gap-2 text-[11px] font-bold">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
            ● CATEGORÍA JUNIOR (7 a 12)
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
            ● CATEGORÍA JUVENIL (13 a 17)
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-300 border border-slate-400">
            ● CATEGORÍA ADULTO (18 a +)
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border border-purple-300">
            ● CATEGORÍA INFANTIL (5 y 6)
          </span>
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300 border border-red-300">
            ● RECUPERACIÓN DE CLASES
          </span>
          <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300">
            ● CLASES PERSONALIZADAS
          </span>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros de Profesor */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por alumno, apoderado, instrumento..."
            className="pl-9 rounded-xl text-sm"
          />
        </div>

        {/* Filtro por Profesor Asignado */}
        <div>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          >
            <option value="todos">Todos los profesores</option>
            {availableTeachers.map((t) => (
              <option key={t} value={t}>
                Prof. {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Alumnos */}
      <ul className="grid gap-3 sm:grid-cols-2">
        {filtered.map((s, i) => {
          const cat = s.ageCategory || "JUNIOR";
          const catStyle = categoryStyles[cat] ?? {
            badge: "bg-muted text-muted-foreground",
            label: cat,
          };

          // Buscar el horario de la clase del alumno en la agenda
          const studentLesson = schedule.find(
            (l) => l.student.toLowerCase() === s.name.toLowerCase() && l.status !== "cancelada",
          );

          const isAdult = (s.age ?? 10) >= 18;

          return (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs hover:border-primary/40 transition-all"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-11 w-11 shrink-0 mt-0.5">
                  <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
                    {s.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <p className="font-bold text-sm text-foreground truncate">{s.name}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                      {catStyle.label} {s.age ? `(${s.age}a)` : ""}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground font-medium">
                    {s.instrument} · <span className="text-foreground font-semibold">Prof. {s.teacher}</span>
                  </p>

                  {/* Horario de la clase para salvataje/suplencia */}
                  {studentLesson ? (
                    <div className="flex items-center gap-1.5 text-xs text-primary font-semibold pt-1">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{studentLesson.day} {studentLesson.time} · {studentLesson.room}</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic pt-1">
                      Horario: {s.modality}
                    </p>
                  )}
                </div>
              </div>

              {/* Información de Contacto / Apoderado o Propio */}
              <div className="border-t border-border/60 pt-2.5 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-primary" />
                  {isAdult ? (
                    <span>Alumno (+18): <strong className="text-foreground">{s.phone || "Sin tel."}</strong></span>
                  ) : (
                    <span>Apoderado: <strong className="text-foreground">{s.emergencyContact?.name || s.family}</strong> ({s.emergencyContact?.phone || s.phone || "Sin tel."})</span>
                  )}
                </span>
                <span className="text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                  {s.attendanceRate}% asist.
                </span>
              </div>
            </motion.li>
          );
        })}

        {filtered.length === 0 && (
          <li className="sm:col-span-2 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
            No se encontraron alumnos con los filtros seleccionados (“{query}”).
          </li>
        )}
      </ul>
    </div>
  );
}
