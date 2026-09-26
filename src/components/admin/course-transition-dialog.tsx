import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  Music,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  DoorOpen,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import {
  useAppStore,
  type AdminStudent,
  type WeekDay,
  type ScheduledLesson,
} from "@/store/app-store";
import {
  teachers,
  musicalInstruments,
  timeSlotsWeekday,
  timeSlotsSaturday,
} from "@/store/admin-seeds";
import { getOfficialTeacherRoom } from "@/lib/room-compatibility";
import { isSameStudentId, isMatchingStudentName } from "@/lib/student-matching";
import { toast } from "sonner";

interface CourseTransitionDialogProps {
  student: AdminStudent;
  isOpen: boolean;
  onClose: () => void;
}

const WEEKDAYS: WeekDay[] = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function CourseTransitionDialog({
  student,
  isOpen,
  onClose,
}: CourseTransitionDialogProps) {
  const adminStudents = useAppStore((s) => s.adminStudents);
  const schedule = useAppStore((s) => s.schedule);
  const transitionStudentCourse = useAppStore((s) => s.transitionStudentCourse);
  const revertStudentCourseTransition = useAppStore((s) => s.revertStudentCourseTransition);

  const liveStudent = useMemo(() => {
    return (
      adminStudents.find(
        (st) =>
          isSameStudentId(st.id, student.id) ||
          isMatchingStudentName(st.name, student.name)
      ) || student
    );
  }, [adminStudents, student]);

  // Extraer lecciones existentes para calcular fecha de próxima sesión y clases pasadas
  const existingLessons: ScheduledLesson[] = useMemo(() => {
    if (
      Array.isArray(liveStudent.scheduleLessons) &&
      liveStudent.scheduleLessons.length > 0
    ) {
      return liveStudent.scheduleLessons.filter((l) => l.status !== "cancelada");
    }
    return schedule.filter(
      (l) =>
        isMatchingStudentName(l.student, liveStudent.name) &&
        l.status !== "cancelada"
    );
  }, [liveStudent.scheduleLessons, liveStudent.name, schedule]);

  // Detección de transición de curso activa
  const hasActiveTransition = useMemo(() => {
    return existingLessons.some((l) => Boolean(l.effectiveFrom) || Boolean(l.effectiveUntil));
  }, [existingLessons]);

  const activeTransitionDetails = useMemo(() => {
    if (!hasActiveTransition) return null;
    const oldLesson = existingLessons.find((l) => l.effectiveUntil);
    const newLesson = existingLessons.find((l) => l.effectiveFrom);
    return {
      oldCourse: oldLesson ? `${oldLesson.instrument} (Prof. ${oldLesson.teacher})` : "Curso anterior",
      newCourse: newLesson ? `${newLesson.instrument} (Prof. ${newLesson.teacher})` : "Nuevo curso",
      effectiveFrom: newLesson?.effectiveFrom || oldLesson?.effectiveUntil || "",
    };
  }, [hasActiveTransition, existingLessons]);

  // Contar clases pasadas evaluadas
  const pastEvaluatedCount = useMemo(() => {
    const dates = new Set<string>();
    existingLessons.forEach((l) => {
      if (l.attendanceByDate) {
        Object.entries(l.attendanceByDate).forEach(([dateStr, att]) => {
          if (att && att !== "pendiente") {
            dates.add(dateStr);
          }
        });
      }
    });
    return dates.size;
  }, [existingLessons]);

  // Determinar la fecha de corte sugerida (próxima clase no evaluada del alumno)
  const defaultNextDate = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    // Buscar la fecha más próxima con clase que aún no esté evaluada
    const evaluatedDates = new Set<string>();
    existingLessons.forEach((l) => {
      if (l.attendanceByDate) {
        Object.entries(l.attendanceByDate).forEach(([dateStr, att]) => {
          if (att && att !== "pendiente") evaluatedDates.add(dateStr);
        });
      }
    });

    // Escanear los próximos 21 días para encontrar el siguiente día de clase del alumno
    const d = new Date();
    for (let i = 0; i < 21; i++) {
      const cur = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
      const curDateStr = cur.toISOString().slice(0, 10);
      const jsDay = cur.getDay();
      if (jsDay === 0) continue;
      const dayKey = (["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as WeekDay[])[
        jsDay - 1
      ];

      const hasClassThisDay = existingLessons.some((l) => {
        if (l.dateStr) return l.dateStr === curDateStr;
        if (l.day === dayKey && (!l.excludedDates || !l.excludedDates.includes(curDateStr))) {
          return true;
        }
        return false;
      });

      if (hasClassThisDay && !evaluatedDates.has(curDateStr)) {
        return curDateStr;
      }
    }
    return today;
  }, [existingLessons]);

  // Estado del nuevo instrumento (por defecto si estaba en Canto, sugerir Guitarra)
  const [newInstrument, setNewInstrument] = useState<string>(() => {
    return liveStudent.instrument === "Canto"
      ? "Guitarra"
      : liveStudent.instrument === "Piano"
      ? "Canto"
      : "Guitarra";
  });

  // Estado del nuevo docente (sugerir según instrumento oficial ADR-0102)
  const [newTeacher, setNewTeacher] = useState<string>(() => {
    if (newInstrument === "Guitarra" || newInstrument === "Batería") return "Jeremy";
    if (newInstrument === "Piano" || newInstrument === "Violín") return "Fernando";
    return "Nathaly";
  });

  // Sala asignada automáticamente
  const newRoom = useMemo(() => {
    return getOfficialTeacherRoom(newTeacher);
  }, [newTeacher]);

  // Al cambiar instrumento, actualizar docente sugerido
  const handleInstrumentChange = (inst: string) => {
    setNewInstrument(inst);
    if (inst === "Guitarra" || inst === "Batería") {
      setNewTeacher("Jeremy");
    } else if (inst === "Piano" || inst === "Violín") {
      setNewTeacher("Fernando");
    } else if (inst === "Canto") {
      setNewTeacher("Nathaly");
    }
  };

  // Fecha de inicio efectiva del nuevo curso
  const [transitionMode, setTransitionMode] = useState<"next" | "custom">("next");
  const [customEffectiveDate, setCustomEffectiveDate] = useState<string>(defaultNextDate);
  const effectiveDate = transitionMode === "next" ? defaultNextDate : customEffectiveDate;

  // Días y Horarios
  const isRegular1x =
    liveStudent.modality?.includes("1x") ||
    liveStudent.modality?.includes("1x/sem");
  const hasTwoWeeklySessions = !isRegular1x;

  // Días iniciales: mantener días pareados existentes (ej. Mar - Jue)
  const l1 = existingLessons[0];
  const l2 = existingLessons.length > 1 ? existingLessons[1] : null;

  const [day1, setDay1] = useState<WeekDay>(l1?.day || "Mar");
  const [day2, setDay2] = useState<WeekDay>(l2?.day || "Jue");

  // Helper para resolver los turnos oficiales de la escuela (L-V tarde: 16:00 a 19:00, Sáb mañana: 09:00 a 12:45)
  const getSlotsForDay = (d: WeekDay) => (d === "Sáb" ? timeSlotsSaturday : timeSlotsWeekday);

  // Inicializar con la hora existente del alumno si es un turno oficial válido para ese día
  const resolveInitialTime = (lesson: ScheduledLesson | null | undefined, d: WeekDay) => {
    const slots = getSlotsForDay(d);
    if (lesson?.time && slots.includes(lesson.time)) {
      return lesson.time;
    }
    return slots[0];
  };

  const [time1, setTime1] = useState<string>(() => resolveInitialTime(l1, l1?.day || "Mar"));
  const [time2, setTime2] = useState<string>(() => resolveInitialTime(l2 || l1, l2?.day || "Jue"));

  const handleDay1Change = (newD: WeekDay) => {
    setDay1(newD);
    const validSlots = getSlotsForDay(newD);
    if (!validSlots.includes(time1)) {
      setTime1(validSlots[0]);
    }
  };

  const handleDay2Change = (newD: WeekDay) => {
    setDay2(newD);
    const validSlots = getSlotsForDay(newD);
    if (!validSlots.includes(time2)) {
      setTime2(validSlots[0]);
    }
  };

  // Helper para verificar aforo de la sala con el nuevo profesor
  const getSlotOccupancy = (d: WeekDay, t: string, r: string) => {
    const count = schedule.filter((l) => {
      if (l.day !== d || l.time !== t || l.room !== r || l.status === "cancelada") return false;
      if (isMatchingStudentName(l.student, liveStudent.name)) return false;
      const st = adminStudents.find((s) => isMatchingStudentName(s.name, l.student));
      return st ? st.status === "activo" : true;
    }).length;
    return { count, vacancies: Math.max(0, 5 - count) };
  };

  const slot1Occ = useMemo(() => getSlotOccupancy(day1, time1, newRoom), [schedule, day1, time1, newRoom, liveStudent.name, adminStudents]);
  const slot2Occ = useMemo(() => getSlotOccupancy(day2, time2, newRoom), [schedule, day2, time2, newRoom, liveStudent.name, adminStudents]);

  // Manejar guardado
  const handleConfirm = () => {
    if (!effectiveDate) {
      toast.error("Selecciona una fecha válida de entrada en vigencia");
      return;
    }

    transitionStudentCourse({
      studentId: liveStudent.id,
      newInstrument,
      newTeacher,
      newRoom,
      effectiveDate,
      newDay1: day1,
      newTime1: time1,
      newDay2: hasTwoWeeklySessions ? day2 : undefined,
      newTime2: hasTwoWeeklySessions ? time2 : undefined,
      hasTwoWeeklySessions,
    });

    toast.success(`🎸 Transición de curso aplicada con éxito`, {
      description: `${liveStudent.name} iniciará ${newInstrument} con Prof. ${newTeacher} (${newRoom}) a partir del ${effectiveDate} a las ${time1}.`,
    });

    onClose();
  };

  // Reversión quirúrgica del cambio de curso (ADR-0131)
  const handleRevert = () => {
    revertStudentCourseTransition(liveStudent.id);
    toast.success(`🔄 Transición revertida con éxito`, {
      description: `${liveStudent.name} ha retornado a su curso anterior sin pérdida de asistencias ni pagos.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[94vw] max-w-2xl max-h-[92vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2 text-primary">
            <Music className="h-5 w-5 text-amber-500" />
            <DialogTitle className="text-lg font-black tracking-tight">
              Transición de Curso e Instrumento
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Configura el cambio de instrumento, nuevo docente y turno para{" "}
            <span className="font-bold text-foreground">{liveStudent.name}</span>.
            El historial anterior de clases y asistencias se preservará inmutablemente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Ficha Resumen Alumno */}
          <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold text-sm text-foreground">{liveStudent.name}</p>
              <p className="text-[11px] text-muted-foreground">
                Curso actual:{" "}
                <Badge variant="outline" className="font-bold border-amber-500/40 text-amber-700 dark:text-amber-300">
                  {liveStudent.instrument || "Canto"} · Prof. {liveStudent.teacher || "Nathaly"} ({liveStudent.room || "Sala C"})
                </Badge>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                ✓ {pastEvaluatedCount} clases impartidas
              </Badge>
              {liveStudent.makeupCredits > 0 && (
                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  💡 {liveStudent.makeupCredits} créditos de falta
                </Badge>
              )}
            </div>
          </div>

          {/* Banner de Transición Activa y Reversión */}
          {hasActiveTransition && activeTransitionDetails && (
            <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1 min-w-0 flex-1">
                <span className="font-black text-amber-800 dark:text-amber-200 flex items-center gap-1.5 text-xs">
                  <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Transición de Curso Activa en el Historial
                </span>
                <p className="text-[11px] text-amber-900/90 dark:text-amber-100/90">
                  El alumno pasó de <strong>{activeTransitionDetails.oldCourse}</strong> a <strong>{activeTransitionDetails.newCourse}</strong> con entrada en vigencia desde el <strong>{activeTransitionDetails.effectiveFrom}</strong>.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRevert}
                className="text-xs font-bold text-red-600 border-red-500/40 hover:bg-red-500/15 gap-1.5 rounded-xl h-8 shrink-0 shadow-2xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Deshacer Transición / Volver al Curso Anterior</span>
              </Button>
            </div>
          )}

          {/* 1. Selector de Nuevo Instrumento y Docente */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Nuevo Instrumento:</Label>
              <Select value={newInstrument} onValueChange={handleInstrumentChange}>
                <SelectTrigger className="h-9 text-xs font-bold bg-background border-primary/30">
                  <SelectValue placeholder="Instrumento" />
                </SelectTrigger>
                <SelectContent>
                  {musicalInstruments.map((inst) => (
                    <SelectItem key={inst} value={inst}>
                      {inst}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Nuevo Docente:</Label>
              <Select value={newTeacher} onValueChange={setNewTeacher}>
                <SelectTrigger className="h-9 text-xs font-bold bg-background border-primary/30">
                  <SelectValue placeholder="Docente" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teach) => (
                    <SelectItem key={teach} value={teach}>
                      Prof. {teach}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Sala Asignada (Oficial):</Label>
              <div className="h-9 px-3 rounded-md border border-border bg-muted/40 flex items-center gap-2 text-foreground font-black text-xs">
                <DoorOpen className="h-4 w-4 text-primary" />
                <span>{newRoom}</span>
                <span className="text-[10px] font-normal text-muted-foreground ml-auto">
                  (ADR-0102)
                </span>
              </div>
            </div>
          </div>

          {/* 2. Fecha de Entrada en Vigencia (Fecha de Corte) */}
          <div className="p-3 rounded-xl border border-border bg-card space-y-2">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              ¿A partir de cuándo rige la transición de curso?
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTransitionMode("next")}
                className={`p-2.5 rounded-lg border text-left transition-colors flex flex-col gap-0.5 ${
                  transitionMode === "next"
                    ? "border-primary bg-primary/10 text-foreground font-bold shadow-xs"
                    : "border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <span className="text-xs flex items-center gap-1 font-bold">
                  🔘 Próxima sesión programada
                </span>
                <span className="text-[11px] text-primary font-mono font-bold">
                  {defaultNextDate}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTransitionMode("custom")}
                className={`p-2.5 rounded-lg border text-left transition-colors flex flex-col gap-0.5 ${
                  transitionMode === "custom"
                    ? "border-primary bg-primary/10 text-foreground font-bold shadow-xs"
                    : "border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <span className="text-xs flex items-center gap-1 font-bold">
                  🔘 Fecha personalizada / Mismo día
                </span>
                {transitionMode === "custom" ? (
                  <Input
                    type="date"
                    value={customEffectiveDate}
                    onChange={(e) => setCustomEffectiveDate(e.target.value)}
                    className="h-7 text-[11px] font-mono mt-1 bg-background"
                  />
                ) : (
                  <span className="text-[11px] text-muted-foreground">
                    Seleccionar fecha exacta
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 3. Nuevo Horario y Franja Horaria */}
          <div className="p-3 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Nuevo Horario Semanal con Prof. {newTeacher}:
              </Label>
              <Badge variant="outline" className="text-[10px] font-bold border-primary/30">
                {hasTwoWeeklySessions ? "2 clases semanales (45m)" : "1 clase semanal (45m)"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sesión 1 */}
              <div className="p-2.5 rounded-lg border border-border/80 bg-background space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">Sesión 1 (Día Principal):</span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-bold ${
                      slot1Occ.vacancies > 0
                        ? "text-emerald-600 border-emerald-500/30 bg-emerald-500/10"
                        : "text-red-600 border-red-500/30 bg-red-500/10"
                    }`}
                  >
                    {slot1Occ.count}/5 alumnos ({slot1Occ.vacancies} vacantes)
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Día:</Label>
                    <Select value={day1} onValueChange={(v) => handleDay1Change(v as WeekDay)}>
                      <SelectTrigger className="h-8 text-xs font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WEEKDAYS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Hora de inicio:</Label>
                    <Select value={time1} onValueChange={setTime1}>
                      <SelectTrigger className="h-8 text-xs font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getSlotsForDay(day1).map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Sesión 2 */}
              {hasTwoWeeklySessions && (
                <div className="p-2.5 rounded-lg border border-border/80 bg-background space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">Sesión 2 (Día Pareado):</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-bold ${
                        slot2Occ.vacancies > 0
                          ? "text-emerald-600 border-emerald-500/30 bg-emerald-500/10"
                          : "text-red-600 border-red-500/30 bg-red-500/10"
                      }`}
                    >
                      {slot2Occ.count}/5 alumnos ({slot2Occ.vacancies} vacantes)
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Día:</Label>
                      <Select value={day2} onValueChange={(v) => handleDay2Change(v as WeekDay)}>
                        <SelectTrigger className="h-8 text-xs font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WEEKDAYS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Hora de inicio:</Label>
                      <Select value={time2} onValueChange={setTime2}>
                        <SelectTrigger className="h-8 text-xs font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getSlotsForDay(day2).map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Resumen Auditoría y Filosofía Vibra */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1.5 text-emerald-900 dark:text-emerald-200">
            <p className="font-bold text-xs flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Auditoría del Cambio: "La clase no se pierde, se recupera"
            </p>
            <ul className="text-[11px] space-y-1 list-disc list-inside">
              <li>
                <strong>Clases pasadas de Canto:</strong> Las {pastEvaluatedCount} clases impartidas con Prof. Nathaly en Sala C se mantienen inmutables en el registro histórico.
              </li>
              <li>
                <strong>Créditos por inasistencias:</strong> Los {liveStudent.makeupCredits} créditos de falta médica de Sasha se conservan íntegros y podrán recuperarse en Guitarra con el Prof. Jeremy.
              </li>
              <li>
                <strong>Clases futuras de Guitarra:</strong> A partir del {effectiveDate}, las clases pendientes del ciclo se programan en {newRoom} a las {time1}.
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Cancelar
            </Button>
            {hasActiveTransition && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRevert}
                className="text-xs font-bold text-red-600 hover:bg-red-500/10 gap-1.5 rounded-xl"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Deshacer Transición</span>
              </Button>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleConfirm}
            className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white gap-1.5 rounded-xl shadow-xs"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Confirmar y Aplicar Transición de Curso</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
