import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MinimalAgendaCalendar } from "@/components/agenda/minimal-agenda-calendar";
import { useAppStore } from "@/store/app-store";
import { isMatchingStudentName, findStudentProfileByName } from "@/lib/student-matching";
import { useInsforgeSync } from "@/hooks/use-insforge-sync";
import { RotateCw } from "lucide-react";

export const Route = createFileRoute("/teacher/agenda")({
  head: () => ({
    meta: [
      { title: "Mi Agenda — Kiosco de Profesor" },
      {
        name: "description",
        content: "Consulta tus clases programadas de la semana en modo solo lectura.",
      },
    ],
  }),
  component: TeacherAgendaPage,
});

function TeacherAgendaPage() {
  const { syncNow, isSyncing, lastSyncTime } = useInsforgeSync();
  const schedule = useAppStore((s) => s.schedule);
  const adminStudents = useAppStore((s) => s.adminStudents);
  const currentUser = useAppStore((s) => s.currentUser);
  const [adminSelectedTeacher, setAdminSelectedTeacher] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("vibra_audit_teacher");
    }
    return null;
  });

  const handleSelectTeacher = (t: string) => {
    setAdminSelectedTeacher(t);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vibra_audit_teacher", t);
    }
  };

  // Extraer nombre del profesor logueado de forma inteligente (por email o nombre)
  const teacherClean = useMemo(() => {
    if (adminSelectedTeacher) return adminSelectedTeacher.toLowerCase();
    const email = currentUser?.email?.toLowerCase() || "";
    if (email.includes("fernando")) return "fernando";
    if (email.includes("nathaly")) return "nathaly";
    if (email.includes("jeremy")) return "jeremy";
    const name = (currentUser?.name || "").toLowerCase().replace(/\s*\(.*?\)/, "").replace(/^prof\.\s*/i, "").trim();
    if (name.includes("fernando")) return "fernando";
    if (name.includes("nathaly")) return "nathaly";
    if (name.includes("jeremy")) return "jeremy";
    return "fernando";
  }, [currentUser, adminSelectedTeacher]);

  const teacherDisplayName = useMemo(() => {
    if (teacherClean === "fernando") return "Fernando";
    if (teacherClean === "nathaly") return "Nathaly";
    if (teacherClean === "jeremy") return "Jeremy";
    return currentUser?.name?.split(" ")[0] || "Fernando";
  }, [teacherClean, currentUser]);

  // Filtrar las clases reales de este profesor (únicamente de alumnos ACTIVOS)
  const teacherLessons = useMemo(() => {
    return schedule.filter((sch) => {
      if (sch.status === "cancelada") return false;

      // 🛡️ REGLA DE ORO (ADR 0095, 0098 & 0100): El profesor solo ve clases de alumnos con status === 'activo'
      const studentProfile = findStudentProfileByName(adminStudents, sch.student);
      if (!studentProfile || studentProfile.status !== "activo") {
        return false;
      }

      const isFernandoStudent = (teacherClean === "fernando") && (
        isMatchingStudentName("Camila Valentina Pastor Conco", sch.student) ||
        isMatchingStudentName("Emma Micaela Sevilla Perez", sch.student) ||
        isMatchingStudentName("Emma Sevilla", sch.student)
      );

      const schTeacher = (sch.teacher || "").toLowerCase().replace(/\s*\(.*?\)/, "").replace(/^prof\.\s*/i, "").trim();
      const profTeacher = (studentProfile.teacher || "").toLowerCase().replace(/\s*\(.*?\)/, "").replace(/^prof\.\s*/i, "").trim();
      return (
        isFernandoStudent ||
        schTeacher.includes(teacherClean) ||
        teacherClean.includes(schTeacher) ||
        profTeacher.includes(teacherClean) ||
        teacherClean.includes(profTeacher)
      );
    });
  }, [schedule, adminStudents, teacherClean]);

  return (
    <div className="space-y-4">
      {/* Selector de Profesor para Auditoría + Botón de Sincronización en Vivo */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 min-w-[240px] items-center gap-1 p-1 rounded-2xl bg-card border border-border shadow-xs">
          {["Fernando", "Nathaly", "Jeremy"].map((t) => (
            <button
              key={t}
              onClick={() => handleSelectTeacher(t)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                teacherDisplayName === t
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Prof. {t}
            </button>
          ))}
        </div>

        {/* 🟢 Indicador en vivo + Botón Sincronizar */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-card border border-border shadow-xs text-[11px] font-bold text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isSyncing ? "bg-amber-400 animate-ping" : "bg-emerald-400 animate-ping"}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isSyncing ? "bg-amber-500" : "bg-emerald-500"}`}></span>
          </span>
          <span className="hidden sm:inline">
            {isSyncing ? "Sincronizando..." : lastSyncTime ? `En vivo · ${new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : "En vivo"}
          </span>
          <button
            onClick={() => syncNow()}
            disabled={isSyncing}
            title="Actualizar horario en tiempo real con PostgreSQL"
            className="ml-1 text-muted-foreground hover:text-primary transition-all disabled:opacity-50"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      <MinimalAgendaCalendar
        lessons={teacherLessons}
        title={`Mi Horario Semanal (${teacherDisplayName})`}
        subtitle="Clases asignadas y salas de la sede"
        userType="teacher"
        defaultYear={2026}
        defaultMonth={8}
      />
    </div>
  );
}

