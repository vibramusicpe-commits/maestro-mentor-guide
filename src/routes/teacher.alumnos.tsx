import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, UserCheck, Phone, Clock, AlertCircle, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
import { categoryStyles } from "@/components/admin/agenda-board";
import { teachers, type AdminStudent } from "@/store/admin-seeds";
import { StudentAttendanceKardex } from "@/components/admin/student-attendance-kardex";
import { isMatchingStudentName, findStudentProfileByName } from "@/lib/student-matching";

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

function normalize(str: string) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function TeacherStudents() {
  const adminStudents = useAppStore((s) => s.adminStudents);
  const schedule = useAppStore((s) => s.schedule);
  const currentUser = useAppStore((s) => s.currentUser);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");

  // Detectar profesor logueado para preselección inteligente
  const initialTeacher = useMemo(() => {
    const email = currentUser?.email?.toLowerCase() || "";
    const name = currentUser?.name?.toLowerCase() || "";
    if (email.includes("fernando") || name.includes("fernando")) return "Fernando";
    if (email.includes("nathaly") || name.includes("nathaly")) return "Nathaly";
    if (email.includes("jeremy") || name.includes("jeremy")) return "Jeremy";
    return "todos";
  }, [currentUser]);

  const [selectedTeacher, setSelectedTeacher] = useState<string>(initialTeacher);
  const [kardexStudent, setKardexStudent] = useState<AdminStudent | null>(null);

  // Sincronizar reactivamente el filtro de profesor con el usuario logueado en RoleSwitcher
  useEffect(() => {
    if (initialTeacher && initialTeacher !== "todos") {
      setSelectedTeacher(initialTeacher);
    }
  }, [initialTeacher]);

  // Lista unificada y enriquecida de alumnos cruzando datos con el horario oficial (schedule)
  const unifiedStudents = useMemo(() => {
    const result: Array<any> = [];
    const seenNames = new Set<string>();

    // 🛡️ REGLA DE ORO DE PROTECCIÓN (ADR 0098 & 0100): El profesor SOLO ve alumnos con status === 'activo'.
    // Los alumnos en 'pausa' o 'baja' quedan excluidos de la vista docente hasta ser activados por administración.
    const activeAdminStudents = adminStudents.filter((s) => s.status === "activo");

    for (const s of activeAdminStudents) {
      const normS = normalize(s.name);

      // Buscar si tiene clases en el horario activo (schedule)
      const matchingLessons = schedule.filter((l) => {
        if (l.status === "cancelada") return false;
        return isMatchingStudentName(s.name, l.student) || normalize(l.student) === normS;
      });

      let resolvedTeacher = s.teacher;
      let resolvedInstrument = s.instrument || "Piano";

      const isCamila = isMatchingStudentName(s.name, "Camila Valentina Pastor Conco");
      const isEmma = isMatchingStudentName(s.name, "Emma Micaela") || isMatchingStudentName(s.name, "Emma Sevilla");

      if (isCamila || isEmma) {
        resolvedTeacher = "Fernando";
        if (isCamila) resolvedInstrument = "Violín";
        if (isEmma) resolvedInstrument = "Piano";
      } else if (matchingLessons.length > 0) {
        // 1. Si el alumno tiene clases agendadas, respetar el profesor e instrumento del horario
        resolvedTeacher = matchingLessons[0].teacher;
        resolvedInstrument = matchingLessons[0].instrument;
      } else if (!resolvedTeacher || resolvedTeacher === "Prof. por Asignar") {
        // 2. Solo si NO tiene profesor asignado en su ficha, aplicar fallback según instrumento
        const instLower = (s.instrument || "").toLowerCase();
        if (
          instLower.includes("batería") ||
          instLower.includes("guitarra") ||
          instLower.includes("bajo") ||
          instLower.includes("ukelele")
        ) {
          resolvedTeacher = "Jeremy";
        } else if (
          instLower.includes("canto") ||
          instLower.includes("infantil") ||
          instLower.includes("estimulación")
        ) {
          resolvedTeacher = "Nathaly";
        } else {
          resolvedTeacher = "Fernando";
        }
      }

      result.push({
        ...s,
        teacher: resolvedTeacher,
        instrument: resolvedInstrument,
        matchingLessons,
      });
      seenNames.add(normS);
    }

    // Agregar alumnos adicionales presentes en el horario de clases solo si corresponden a un alumno activo
    for (const l of schedule) {
      if (l.status === "cancelada") continue;

      const normL = normalize(l.student);
      const words = normL.split(" ").filter((w) => w.length > 2);

      // Verificar si el alumno existe en adminStudents y está activo
      const studentProfile = findStudentProfileByName(adminStudents, l.student);

      if (!studentProfile || studentProfile.status !== "activo") {
        continue;
      }

      let exists = false;
      for (const seen of seenNames) {
        if (isMatchingStudentName(seen, l.student)) {
          exists = true;
          break;
        }
      }

      if (!exists) {
        result.push({
          id: `sched-st-${l.id}`,
          name: l.student,
          family: `Familia ${l.student.split(" ")[0]}`,
          phone: "984100000",
          instrument: l.instrument,
          teacher: l.teacher,
          ageCategory: "JUNIOR",
          attendanceRate: 0,
          modality: "Regular (8 clases / 45 min)",
          status: "activo",
          matchingLessons: [l],
        });
        seenNames.add(normL);
      }
    }

    return result;
  }, [adminStudents, schedule]);

  // Profesores oficiales
  const availableTeachers = ["Jeremy", "Fernando", "Nathaly"];

  // Filtrado de alumnos
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return unifiedStudents.filter((s) => {
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.family && s.family.toLowerCase().includes(q)) ||
        (s.instrument && s.instrument.toLowerCase().includes(q)) ||
        (s.emergencyContact?.name && s.emergencyContact.name.toLowerCase().includes(q));

      const cleanTarget = selectedTeacher.toLowerCase().replace(/\s*\(.*?\)/, "").replace(/^prof\.\s*/i, "").trim();
      const stTeacherClean = (s.teacher || "").toLowerCase().replace(/\s*\(.*?\)/, "").replace(/^prof\.\s*/i, "").trim();
      const matchTeacher =
        selectedTeacher === "todos" ||
        cleanTarget === "todos" ||
        stTeacherClean.includes(cleanTarget) ||
        cleanTarget.includes(stTeacherClean) ||
        (s.matchingLessons && s.matchingLessons.some((l: any) => {
          const lTeachClean = (l.teacher || "").toLowerCase().replace(/\s*\(.*?\)/, "").replace(/^prof\.\s*/i, "").trim();
          return lTeachClean.includes(cleanTarget) || cleanTarget.includes(lTeachClean);
        }));

      const matchCategory =
        selectedCategory === "todas" || s.ageCategory === selectedCategory;

      return matchQuery && matchTeacher && matchCategory;
    });
  }, [unifiedStudents, query, selectedTeacher, selectedCategory]);

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
          const studentLesson =
            s.matchingLessons?.[0] ||
            schedule.find(
              (l) => normalize(l.student) === normalize(s.name) && l.status !== "cancelada",
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
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setKardexStudent(s)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md transition-colors"
                    title="Ver Kardex de asistencias, fechas y horas"
                  >
                    📖 Kardex
                  </button>
                  {s.attendanceRate > 0 ? (
                    <span className="text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                      {s.attendanceRate}% asist.
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Sin registros
                    </span>
                  )}
                </div>
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

      {/* 📖 MODAL DE KARDEX DE ASISTENCIAS PARA PROFESORES */}
      {kardexStudent && (
        <StudentAttendanceKardex
          student={kardexStudent}
          isOpen={Boolean(kardexStudent)}
          onClose={() => setKardexStudent(null)}
        />
      )}
    </div>
  );
}
