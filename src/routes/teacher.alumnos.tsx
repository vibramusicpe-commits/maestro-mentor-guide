import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X, UserCheck, Phone, Clock, AlertCircle, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppStore } from "@/store/app-store";
import { categoryStyles } from "@/components/admin/agenda-board";
import type { AdminStudent } from "@/store/admin-seeds";
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

/** Etiqueta corta de categoría para el chip del listado móvil (ADR-0176). */
const SHORT_CATEGORY: Record<string, string> = {
  ESTIMULACION: "ESTIM.",
  INFANTIL: "INFANTIL",
  JUNIOR: "JUNIOR",
  JUVENIL: "JUVENIL",
  MASTER: "MASTER",
  ADULTO: "MASTER",
  RECUPERACION: "RECUP.",
  PERSONALIZADA: "PERSONAL.",
};

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
    const q = normalize(query);
    return unifiedStudents.filter((s) => {
      const haystack = normalize(
        `${s.name} ${s.family || ""} ${s.instrument || ""} ${s.emergencyContact?.name || ""} ${s.emergencyContact?.phone || ""} ${s.phone || ""}`,
      );
      const matchQuery = !q || q.split(" ").every((token) => haystack.includes(token));

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
    <div className="space-y-3">
      {/* Cabecera compacta (móvil primero) */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="flex items-center gap-1.5 text-base font-black text-foreground sm:text-2xl">
            <UserCheck className="h-4 w-4 shrink-0 text-primary sm:h-6 sm:w-6" /> Directorio de alumnos
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Guía de alumnos de la academia para seguimiento, coordinación y suplencias ante imprevistos.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
          {filtered.length}/{unifiedStudents.length}
        </span>
      </div>

      {/* Acceso directo a mis informes de progreso (sin elegir alumno) */}
      <Link
        to="/teacher/informes"
        className="flex min-h-[44px] items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary/50"
      >
        <span>📄 Mis informes de progreso</span>
        <span className="text-xs font-black text-primary">Abrir ›</span>
      </Link>

      {/* 🔎 Búsqueda primero: sin scroll para encontrar al alumno */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar alumno, apoderado o instrumento…"
              className="h-10 rounded-xl pl-9 pr-9 text-sm"
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filtro por Profesor Asignado */}
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            aria-label="Filtrar por profesor"
            className="h-10 w-[6.75rem] shrink-0 rounded-xl border border-input bg-background px-2 text-xs font-bold shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto sm:px-3 sm:text-sm"
          >
            <option value="todos">Todos</option>
            {availableTeachers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leyenda colapsable: en móvil no roba pantalla */}
      <details className="rounded-xl border border-border bg-card px-3 py-2 shadow-xs">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-bold text-foreground">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-warning" />
          Leyenda de categorías
          <span className="ml-auto text-xs font-semibold text-muted-foreground">toca para ver</span>
        </summary>
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-bold">
          <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
            ● JUNIOR (7 a 12)
          </span>
          <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
            ● JUVENIL (13 a 17)
          </span>
          <span className="rounded-full border border-slate-400 bg-slate-200 px-2 py-0.5 text-slate-900 dark:bg-slate-800 dark:text-slate-300">
            ● MASTER (18 a +)
          </span>
          <span className="rounded-full border border-purple-300 bg-purple-100 px-2 py-0.5 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
            ● INFANTIL (5 y 6)
          </span>
          <span className="rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-red-900 dark:bg-red-950 dark:text-red-300">
            ● RECUPERACIÓN
          </span>
          <span className="rounded-full border border-cyan-300 bg-cyan-100 px-2 py-0.5 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-300">
            ● PERSONALIZADA
          </span>
        </div>
      </details>

      {/* Lista compacta de Alumnos */}
      <ul className="grid gap-2">
        {filtered.map((s, i) => {
          const cat = s.ageCategory || "JUNIOR";
          const catStyle = categoryStyles[cat] ?? {
            bg: "bg-muted",
            text: "text-muted-foreground",
            border: "border-border",
            label: cat,
          };
          const catShort = SHORT_CATEGORY[cat] ?? cat;

          // Buscar el horario de la clase del alumno en la agenda
          const studentLesson =
            s.matchingLessons?.[0] ||
            schedule.find(
              (l) => normalize(l.student) === normalize(s.name) && l.status !== "cancelada",
            );

          const isAdult = (s.age ?? 10) >= 18;
          const contactName = s.emergencyContact?.name || s.family || "Sin apoderado";
          const contactPhone = s.emergencyContact?.phone || s.phone || "sin tel.";

          return (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.2) }}
              className="rounded-xl border border-border bg-card px-2.5 py-2 shadow-xs transition-all hover:border-primary/40"
            >
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
                    {s.name
                      .split(" ")
                      .map((p: string) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[13px] font-bold leading-tight text-foreground">
                      {s.name}
                    </span>
                    <span
                      className={`shrink-0 rounded border px-1 text-xs font-bold leading-4 ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                    >
                      {catShort}
                    </span>
                    <span className="ml-auto shrink-0 text-xs font-bold text-muted-foreground">
                      {s.age ? `${s.age}a` : ""}
                    </span>
                  </div>

                  <p className="truncate text-xs font-medium text-muted-foreground">
                    {s.instrument} ·{" "}
                    <span className="font-semibold text-foreground">Prof. {s.teacher}</span>
                    {studentLesson
                      ? ` · ${studentLesson.day} ${studentLesson.time} · ${studentLesson.room}`
                      : ""}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    <Phone className="mr-1 inline h-2.5 w-2.5 text-primary" />
                    {isAdult
                      ? `Alumno (+18): ${s.phone || "sin tel."}`
                      : `${contactName} · ${contactPhone}`}
                  </p>

                  {!studentLesson && (
                    <p className="flex items-center gap-1 truncate text-xs italic text-muted-foreground">
                      <Clock className="h-2.5 w-2.5 shrink-0" />
                      Sin horario agendado · {s.modality}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <button
                    type="button"
                    onClick={() => setKardexStudent(s)}
                    className="min-h-[44px] rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-black text-primary transition-colors hover:bg-primary/20"
                    title="Ver Kardex de asistencias, fechas y horas"
                  >
                    📖 Kardex
                  </button>
                  <Link
                    to="/teacher/informes"
                    search={{ student: s.id }}
                    className="flex min-h-[44px] items-center rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-black text-foreground transition-colors hover:border-primary/50"
                    title="Generar borrador del informe de progreso con mis reportes de clase"
                  >
                    📄 Informe
                  </Link>
                  <span
                    className={`text-xs font-bold ${
                      s.attendanceRate > 0 ? "text-success" : "text-muted-foreground"
                    }`}
                  >
                    {s.attendanceRate > 0 ? `${s.attendanceRate}% asist.` : "sin registros"}
                  </span>
                </div>
              </div>
            </motion.li>
          );
        })}

        {filtered.length === 0 && (
          <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            <AlertCircle className="mx-auto mb-2 h-7 w-7 text-muted-foreground opacity-50" />
            {query ? (
              <>
                Sin resultados para “{query}”. Prueba con el apellido o el instrumento.
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSelectedTeacher("todos");
                  }}
                  className="mt-2 block w-full text-xs font-bold text-primary hover:underline"
                >
                  Ver todos los alumnos
                </button>
              </>
            ) : (
              "No hay alumnos activos para los filtros seleccionados."
            )}
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
