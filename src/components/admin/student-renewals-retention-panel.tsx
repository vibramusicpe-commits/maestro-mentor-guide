import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  RotateCw,
  Search,
  Phone,
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  UserCheck,
  Music,
  ShieldCheck,
} from "lucide-react";
import { useAppStore, type AdminStudent } from "@/store/app-store";
import {
  computeStudentCycleSessions,
  computeStudentRetentionStatus,
  type StudentRetentionStatus,
} from "@/lib/kardex-calculator";
import { RenewStudentCycleDialog } from "@/components/admin/renew-student-cycle-dialog";
import { StudentAttendanceKardex } from "@/components/admin/student-attendance-kardex";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isSameStudentId, isMatchingStudentName, normalizeStudentName } from "@/lib/student-matching";

type RetentionFilter = "todos" | "culminado" | "proximo_culminar" | "en_curso";

export function StudentRenewalsRetentionPanel() {
  const students = useAppStore((s) => s.adminStudents);
  const schedule = useAppStore((s) => s.schedule);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RetentionFilter>("todos");
  const [renewStudent, setRenewStudent] = useState<AdminStudent | null>(null);
  const [kardexStudent, setKardexStudent] = useState<AdminStudent | null>(null);

  // 🛡️ REGLA FUNDAMENTAL (ADR-0106 & ADR-0159):
  // El Panel de Seguimiento & Renovación trabaja EXCLUSIVAMENTE con la base de datos activa oficial.
  // Los registros históricos inactivos se preservan únicamente en el panel de Depuración & Reactivación.
  const computedData = useMemo(() => {
    const activeStudents = students.filter((st) => st.status === "activo");

    return activeStudents.map((st) => {
      const modalityStr = (st.modality || "").toLowerCase();
      const isIntensive = modalityStr.includes("inten") || modalityStr.includes("90 min");
      const targetQuota = isIntensive ? 4 : (st.packageTotalSessions || 8);

      const sessions = computeStudentCycleSessions({
        student: st,
        allSchedule: schedule,
        selectedYear: new Date().getFullYear(),
        selectedMonth: new Date().getMonth(),
      });

      const retention = computeStudentRetentionStatus(st, sessions, targetQuota);

      return {
        student: st,
        retention,
      };
    });
  }, [students, schedule]);

  // Contadores de métricas por categoría (exclusivamente alumnos activos)
  const metrics = useMemo(() => {
    let culminados = 0;
    let proximoCulminar = 0;
    let enCurso = 0;

    computedData.forEach(({ retention }) => {
      if (retention.category === "culminado") culminados++;
      else if (retention.category === "proximo_culminar") proximoCulminar++;
      else if (retention.category === "en_curso") enCurso++;
    });

    return {
      total: computedData.length,
      culminados,
      proximoCulminar,
      enCurso,
    };
  }, [computedData]);

  // Lista filtrada y ordenada estrictamente por ORDEN DE URGENCIA VISUAL:
  // 1. 🔴 Rojos (Culminados - Urgencia máxima de renovación o liberación de vacante)
  // 2. 🟡 Amarillos (Próximos a culminar - Alerta preventiva de 1 ó 2 clases restantes)
  // 3. 🟢 Verdes (En curso - Ciclo lectivo normal > 2 clases)
  const filteredList = useMemo(() => {
    const list = computedData.filter(({ student, retention }) => {
      // Filtro por categoría de retención
      if (filter === "culminado" && retention.category !== "culminado") return false;
      if (filter === "proximo_culminar" && retention.category !== "proximo_culminar") return false;
      if (filter === "en_curso" && retention.category !== "en_curso") return false;

      // Filtro por búsqueda
      if (search.trim() !== "") {
        const q = search.toLowerCase();
        const matchName = student.name.toLowerCase().includes(q);
        const matchFamily = (student.family || "").toLowerCase().includes(q);
        const matchInstrument = (student.instrument || "").toLowerCase().includes(q);
        const matchTeacher = (student.teacher || "").toLowerCase().includes(q);
        if (!matchName && !matchFamily && !matchInstrument && !matchTeacher) return false;
      }

      return true;
    });

    // 🛡️ REGLA: Orden visual de urgencia estricto (ADR-0139)
    const categoryPriority: Record<StudentRetentionStatus["category"], number> = {
      culminado: 1,        // 🔴 Rojo primero
      proximo_culminar: 2, // 🟡 Amarillo segundo
      en_curso: 3,         // 🟢 Verde tercero
      pausa_baja: 4,       // ⚪ Blanco al final
    };

    return list.sort((a, b) => {
      const pA = categoryPriority[a.retention.category] || 99;
      const pB = categoryPriority[b.retention.category] || 99;
      if (pA !== pB) return pA - pB;

      // Desempate interno para amarillos: menos clases restantes = mayor urgencia (1 clase antes que 2)
      if (a.retention.category === "proximo_culminar") {
        const remDiff = a.retention.remainingSessionsToDeliver - b.retention.remainingSessionsToDeliver;
        if (remDiff !== 0) return remDiff;
      }

      return a.student.name.localeCompare(b.student.name);
    });
  }, [computedData, filter, search]);

  // Enviar mensaje de WhatsApp
  const handleOpenWhatsApp = (st: AdminStudent, retention: StudentRetentionStatus) => {
    const rawPhone = st.phone || st.emergencyContact?.phone || "";
    const cleanPhone = rawPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("51") ? cleanPhone : cleanPhone ? `51${cleanPhone}` : "51900000000";

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(retention.suggestedMessage)}`;
    window.open(url, "_blank");
    toast.success(`Abriendo WhatsApp con Familia ${st.family || st.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Banner Explicativo Institucional */}
      <div className="p-4 rounded-2xl border border-[#F47B20]/40 bg-[#F47B20]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <RotateCw className="h-5 w-5 text-[#F47B20]" />
            <h2 className="text-base font-black text-foreground">
              Panel de Retención, Seguimiento & Renovación de Alumnos
            </h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-3xl">
            En Vibra Music <strong>no hay vacante de cortesía</strong> tras el vencimiento. Por ello, la comunicación preventiva se realiza con días de anticipación durante la fase <strong>🟡 AMARILLA (1 ó 2 clases/créditos restantes)</strong> para confirmar continuidad o liberar el cupo al finalizar la última clase.
          </p>
        </div>
      </div>

      {/* Tarjetas de Métricas Superior Ordenadas por Urgencia (Exclusivamente Alumnos Activos) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Todos los Alumnos Activos */}
        <div
          onClick={() => setFilter("todos")}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            filter === "todos"
              ? "bg-card border-primary shadow-sm ring-1 ring-primary/40"
              : "bg-muted/40 border-border hover:bg-muted/70"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Total Alumnos Activos</span>
            <UserCheck className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground mt-1">{metrics.total}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Base activa oficial</p>
        </div>

        {/* 2. 🔴 Culminados */}
        <div
          onClick={() => setFilter("culminado")}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            filter === "culminado"
              ? "bg-rose-500/10 border-rose-500 shadow-sm ring-1 ring-rose-500/40"
              : "bg-muted/40 border-border hover:bg-muted/70"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
            <span>🔴 Culminados</span>
            <CheckCircle2 className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {metrics.culminados}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Listos para renovar mes</p>
        </div>

        {/* 3. 🟡 Por Culminar */}
        <div
          onClick={() => setFilter("proximo_culminar")}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            filter === "proximo_culminar"
              ? "bg-amber-500/10 border-amber-500 shadow-sm ring-1 ring-amber-500/40"
              : "bg-muted/40 border-border hover:bg-muted/70"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span>🟡 Por Culminar</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {metrics.proximoCulminar}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Alerta preventiva (≤2)</p>
        </div>

        {/* 4. 🟢 En Curso */}
        <div
          onClick={() => setFilter("en_curso")}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            filter === "en_curso"
              ? "bg-emerald-500/10 border-emerald-500 shadow-sm ring-1 ring-emerald-500/40"
              : "bg-muted/40 border-border hover:bg-muted/70"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span>🟢 En Curso</span>
            <Clock className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.enCurso}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Progreso regular (&gt;2)</p>
        </div>
      </div>

      {/* Barra de Filtros y Buscador */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[14rem] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por alumno, apoderado, instrumento o docente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border text-xs">
          <Button
            size="sm"
            variant={filter === "todos" ? "default" : "ghost"}
            onClick={() => setFilter("todos")}
            className="h-7 text-xs font-bold"
          >
            Todos ({metrics.total})
          </Button>
          <Button
            size="sm"
            variant={filter === "culminado" ? "default" : "ghost"}
            onClick={() => setFilter("culminado")}
            className="h-7 text-xs font-bold gap-1 text-rose-600 dark:text-rose-400 hover:text-rose-500"
          >
            🔴 Culminados ({metrics.culminados})
          </Button>
          <Button
            size="sm"
            variant={filter === "proximo_culminar" ? "default" : "ghost"}
            onClick={() => setFilter("proximo_culminar")}
            className="h-7 text-xs font-bold gap-1 text-amber-600 dark:text-amber-400 hover:text-amber-500"
          >
            🟡 Por Culminar ({metrics.proximoCulminar})
          </Button>
          <Button
            size="sm"
            variant={filter === "en_curso" ? "default" : "ghost"}
            onClick={() => setFilter("en_curso")}
            className="h-7 text-xs font-bold gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500"
          >
            🟢 En Curso ({metrics.enCurso})
          </Button>
        </div>

        {search && (
          <Button variant="ghost" size="sm" onClick={() => setSearch("")} className="text-xs">
            Limpiar búsqueda
          </Button>
        )}
      </div>

      {/* Tabla de Alumnos para Seguimiento & Renovación */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Alumno / Apoderado</TableHead>
                <TableHead>Curso & Sala</TableHead>
                <TableHead>Horario Habitual</TableHead>
                <TableHead>Estado del Ciclo</TableHead>
                <TableHead>Semáforo de Retención</TableHead>
                <TableHead className="text-right">Acciones de Seguimiento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-xs">
                    No se encontraron alumnos con los criterios seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredList.map(({ student, retention }) => {
                  const firstLesson = student.scheduleLessons?.[0];
                  const scheduleStr = firstLesson
                    ? `${firstLesson.day} ${firstLesson.time}`
                    : "Por asignar";

                  return (
                    <TableRow key={student.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.family || "Apoderado"} · {student.modality}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Vigencia: {student.planStartDate || "N/A"} al {student.planEndDate || "N/A"}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-0.5 text-xs">
                          <span className="font-semibold text-foreground flex items-center gap-1">
                            <Music className="h-3 w-3 text-primary" />
                            {student.instrument}
                          </span>
                          <span className="text-muted-foreground">
                            {student.teacher} · {firstLesson?.room || student.room || "Sala"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-0.5 text-xs">
                          <span className="inline-flex items-center gap-1 font-mono font-semibold text-foreground">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {scheduleStr}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 font-medium">
                            <span>Asistidas: <strong>{retention.attendedCount}</strong> / {retention.targetQuota}</span>
                          </div>
                          {retention.pendingCredits > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                              {retention.pendingCredits} crédito{retention.pendingCredits > 1 ? "s" : ""} por inasistencia
                            </span>
                          )}
                          {retention.pendingRegular > 0 && (
                            <span className="text-[10px] text-muted-foreground block">
                              {retention.pendingRegular} regulares pendientes
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          title={retention.badgeTooltip}
                          className={`font-bold text-xs px-2.5 py-1 ${
                            retention.color === "yellow"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40"
                              : retention.color === "red"
                              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40"
                              : retention.color === "zinc"
                              ? "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/40"
                              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                          }`}
                        >
                          {retention.badgeLabel}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón WhatsApp con plantilla preventiva o de renovación */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenWhatsApp(student, retention)}
                            className="gap-1 text-xs font-bold border-success/40 text-success hover:bg-success/10"
                            title={`Enviar WhatsApp a ${student.name} (${retention.whatsappSuggestedType})`}
                          >
                            <Phone className="h-3.5 w-3.5 text-success" />
                            <span>WhatsApp</span>
                          </Button>

                          {/* Botón Kardex */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setKardexStudent(student)}
                            className="gap-1 text-xs font-semibold border-border hover:bg-muted"
                            title={`Ver Kardex de asistencias de ${student.name}`}
                          >
                            <BookOpen className="h-3.5 w-3.5 text-primary" />
                            <span>Kardex</span>
                          </Button>

                          {/* Botón Renovar Ciclo: Habilitado cuando canRenew es true (0 créditos/clases pendientes) */}
                          {retention.canRenew ? (
                            <Button
                              size="sm"
                              onClick={() => setRenewStudent(student)}
                              className="gap-1 text-xs font-bold bg-[#F47B20] text-black hover:bg-[#F47B20]/90 shadow-xs"
                              title="Renovar ciclo mensual (+1 mes) y generar nuevo recibo"
                            >
                              <RotateCw className="h-3.5 w-3.5" />
                              <span>Renovar</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              disabled
                              variant="ghost"
                              className="text-xs text-muted-foreground opacity-50 cursor-not-allowed"
                              title="No se puede renovar mientras existan clases o créditos pendientes"
                            >
                              <span>En curso</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal de Renovación */}
      <RenewStudentCycleDialog
        isOpen={!!renewStudent}
        onClose={() => setRenewStudent(null)}
        student={renewStudent}
      />

      {/* Modal de Kardex de Asistencias */}
      {kardexStudent && (
        <StudentAttendanceKardex
          isOpen={!!kardexStudent}
          onClose={() => setKardexStudent(null)}
          student={kardexStudent}
        />
      )}
    </div>
  );
}
