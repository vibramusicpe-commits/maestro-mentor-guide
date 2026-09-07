import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Clock, GraduationCap, Ticket, CheckCircle2, BookOpen } from "lucide-react";
import type { Kid, AdminStudent } from "@/store/app-store";
import { useAppStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MinimalAgendaCalendar } from "@/components/agenda/minimal-agenda-calendar";
import { StudentAttendanceKardex } from "@/components/admin/student-attendance-kardex";

export function KidSummary({ kid }: { kid: Kid }) {
  const adminStudents = useAppStore((s) => s.adminStudents);
  const [isKardexOpen, setIsKardexOpen] = useState(false);

  const resolvedStudent: AdminStudent = useMemo(() => {
    const match = adminStudents.find(
      (s) =>
        s.name.toLowerCase() === kid.name.toLowerCase() ||
        s.name.toLowerCase().includes(kid.name.toLowerCase()) ||
        kid.name.toLowerCase().includes(s.name.toLowerCase())
    );
    if (match) return match;

    return {
      id: kid.id,
      name: kid.name,
      family: "Familia Vibra",
      age: 10,
      birthdate: "2016-05-10",
      ageCategory: "JUNIOR",
      instrument: kid.instrument,
      teacher: kid.teacher,
      room: "Sala A",
      modality: kid.id === "k1" ? "Regular (8 clases / 45 min)" : "Intensivo (4 clases / 90 min)",
      planType: "Mensual",
      status: "activo",
      risk: "bajo",
      attendanceRate: 85,
      makeupCredits: kid.makeupCredits,
      recentAttendance: ["presente", "presente"],
      balance: 0,
      lastPayment: "03/08/2026",
      joinedAt: "01/03/2026",
      emergencyContact: { name: "Contacto Familiar", relation: "Apoderado", phone: "+51 984 000 000" },
      email: "familia@vibramusic.pe",
      phone: "+51 984 000 000",
      level: 1,
    };
  }, [adminStudents, kid]);

  return (
    <motion.section
      key={kid.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-sidebar p-5 text-sidebar-foreground shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{kid.name}</h1>
          <p className="text-sm text-sidebar-foreground/80 font-medium">{kid.instrument}</p>
        </div>
        <Badge variant="secondary" className="gap-1 text-xs font-semibold bg-sidebar-accent text-sidebar-foreground border border-sidebar-border">
          <Clock className="h-3 w-3 text-sidebar-primary" />
          {kid.id === "k1" ? "Plan Regular (8 clases / 45m)" : "Plan Intensivo (4 clases / 90m)"}
        </Badge>
      </div>

      {/* Seguimiento de Asistencia para los Padres */}
      <div className="mt-4 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-sidebar-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            Progreso de Asistencia del Mes
          </span>
          <span className="text-sidebar-foreground font-mono font-bold">
            {kid.id === "k1" ? "2 de 8 clases completadas" : "1 de 4 clases completadas"}
          </span>
        </div>

        {/* Barra de progreso de clases */}
        <div className="w-full bg-sidebar-border h-2 rounded-full overflow-hidden">
          <div
            className="bg-success h-full rounded-full transition-all"
            style={{ width: kid.id === "k1" ? "25%" : "25%" }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <p className="text-[11px] text-sidebar-foreground/75">
            {kid.id === "k1"
              ? "Clases asistidas: 2 · Faltantes: 6 (2 clases por semana)"
              : "Clases asistidas: 1 · Faltantes: 3 (1 clase por semana)"}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsKardexOpen(true)}
            className="h-6 text-[10px] font-bold bg-sidebar-accent text-sidebar-foreground border-sidebar-border hover:bg-sidebar-border gap-1 rounded-lg"
          >
            <BookOpen className="h-3 w-3 text-primary" />
            Ver Kardex de Fechas
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm text-sidebar-foreground/80">
        <p className="inline-flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-sidebar-primary" /> {kid.teacher}
        </p>
        <p className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-sidebar-primary" /> {kid.nextLesson}
        </p>
        <p className="flex items-center gap-2 font-medium">
          <Ticket className="h-4 w-4 text-warning" />
          <span className="text-sidebar-foreground">{kid.makeupCredits} créditos de recuperación disponibles</span>
        </p>
      </div>

      <div className="mt-5 border-t border-sidebar-border pt-4">
        <MinimalAgendaCalendar
          lessons={useAppStore.getState().lessons}
          title={`Agenda Semanal de ${kid.name}`}
          subtitle={`Clases de ${kid.instrument}`}
          userType="family"
        />
      </div>

      {isKardexOpen && resolvedStudent && (
        <StudentAttendanceKardex
          student={resolvedStudent}
          isOpen={isKardexOpen}
          onClose={() => setIsKardexOpen(false)}
        />
      )}
    </motion.section>
  );
}
