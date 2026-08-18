import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Sparkles,
  CalendarCheck,
  Clock,
  UserCheck,
  DoorOpen,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { musicalInstruments, availableTeachers, rooms } from "@/store/admin-seeds";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MAX_CAPACITY = 5; // Aforo máximo por clase / profesor / sala: 5 alumnos

export type WeekDay = "Lun" | "Mar" | "Mié" | "Jue" | "Vie" | "Sáb";

const WEEK_DAYS: WeekDay[] = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const WEEKDAY_TIMES = ["16:00", "16:45", "17:30", "18:15", "19:00", "19:45", "20:30", "21:15"];
const SATURDAY_TIMES = [
  "09:00", "09:45", "10:30", "11:15", "12:00", "12:45", "13:30",
  "14:15", "15:00", "15:45", "16:30", "17:15", "18:00",
];

interface VacancySlot {
  day: WeekDay;
  time: string;
  teacher: string;
  room: string;
  instrument?: string;
  enrolledCount: number;
  availableVacancies: number;
  isFull: boolean;
  students: string[];
}

export function VacancyAvailabilityPanel({
  onSelectSlot,
}: {
  onSelectSlot?: (slot: { day: WeekDay; time: string; teacher: string; room: string }) => void;
}) {
  const schedule = useAppStore((s) => s.schedule);

  // Filtros de búsqueda
  const [filterTeacher, setFilterTeacher] = useState<string>("all");
  const [filterDay, setFilterDay] = useState<string>("all");
  const [filterInstrument, setFilterInstrument] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterTime, setFilterTime] = useState<string>("all");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal para Asistente de Matrícula y Clases Consecutivas (Días Seguidos)
  const [isConsecutiveHelperOpen, setIsConsecutiveHelperOpen] = useState(false);
  const [selectedStudentForMatching, setSelectedStudentForMatching] = useState<string>("");
  const [consecutiveDay1, setConsecutiveDay1] = useState<WeekDay>("Lun");
  const [consecutiveDay2, setConsecutiveDay2] = useState<WeekDay>("Mar");
  const [consecutiveTeacher, setConsecutiveTeacher] = useState<string>(availableTeachers[0] || "");

  // Calcular la matriz de todas las combinaciones de horarios y ocupación real
  const allSlots: VacancySlot[] = useMemo(() => {
    const slots: VacancySlot[] = [];

    // Profesores oficiales
    const teachersList = availableTeachers.filter((t) => t && t !== "Prof. por Asignar");

    WEEK_DAYS.forEach((day) => {
      const times = day === "Sáb" ? SATURDAY_TIMES : WEEKDAY_TIMES;

      times.forEach((time) => {
        teachersList.forEach((t) => {
          // Filtrar clases activas en este horario, día y profesor
          const matchingLessons = schedule.filter(
            (l) =>
              l.day === day &&
              l.time === time &&
              l.teacher.toLowerCase().includes(t.toLowerCase()) &&
              l.status !== "cancelada",
          );

          const enrolledCount = matchingLessons.length;
          const availableVacancies = Math.max(0, MAX_CAPACITY - enrolledCount);
          const roomName =
            matchingLessons[0]?.room ||
            (t.toLowerCase().includes("jeremy")
              ? "Sala A"
              : t.toLowerCase().includes("fernando")
              ? "Sala B"
              : t.toLowerCase().includes("nathaly")
              ? "Sala C"
              : "Sala D");
          const instName = matchingLessons[0]?.instrument || undefined;
          const students = matchingLessons.map((l) => l.student);

          slots.push({
            day,
            time,
            teacher: t,
            room: roomName,
            instrument: instName,
            enrolledCount,
            availableVacancies,
            isFull: enrolledCount >= MAX_CAPACITY,
            students,
          });
        });
      });
    });

    return slots;
  }, [schedule]);

  // Filtrado reactivo de cupos
  const filteredSlots = useMemo(() => {
    return allSlots.filter((slot) => {
      if (filterTeacher !== "all" && !slot.teacher.toLowerCase().includes(filterTeacher.toLowerCase())) {
        return false;
      }
      if (filterDay !== "all" && slot.day !== filterDay) {
        return false;
      }
      if (filterTime !== "all" && slot.time !== filterTime) {
        return false;
      }
      if (filterInstrument !== "all" && slot.instrument && !slot.instrument.toLowerCase().includes(filterInstrument.toLowerCase())) {
        return false;
      }
      if (filterCategory !== "all") {
        // Verificar si alguna lección del slot coincide con la categoría
        const matchingLessons = schedule.filter(
          (l) =>
            l.day === slot.day &&
            l.time === slot.time &&
            l.teacher.toLowerCase().includes(slot.teacher.toLowerCase()) &&
            l.status !== "cancelada"
        );
        if (matchingLessons.length > 0) {
          const hasCategory = matchingLessons.some((l) => l.category === filterCategory);
          if (!hasCategory) return false;
        }
      }
      if (onlyAvailable && slot.availableVacancies === 0) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTeacher = slot.teacher.toLowerCase().includes(q);
        const matchesStudent = slot.students.some((st) => st.toLowerCase().includes(q));
        const matchesDayTime = `${slot.day} ${slot.time}`.toLowerCase().includes(q);
        if (!matchesTeacher && !matchesStudent && !matchesDayTime) return false;
      }
      return true;
    });
  }, [allSlots, schedule, filterTeacher, filterDay, filterTime, filterInstrument, filterCategory, onlyAvailable, searchQuery]);

  // Métricas rápidas
  const totalSlotsCount = allSlots.length;
  const availableSlotsCount = allSlots.filter((s) => s.availableVacancies > 0).length;
  const fullSlotsCount = allSlots.filter((s) => s.isFull).length;
  const totalVacanciesRemaining = allSlots.reduce((acc, s) => acc + s.availableVacancies, 0);

  // Evaluador de Clases Seguidas (Días Consecutivos Excepcionales)
  const consecutivePairs = useMemo(() => {
    const day1Slots = allSlots.filter(
      (s) => s.day === consecutiveDay1 && s.teacher.toLowerCase().includes(consecutiveTeacher.toLowerCase()) && s.availableVacancies > 0,
    );
    const day2Slots = allSlots.filter(
      (s) => s.day === consecutiveDay2 && s.teacher.toLowerCase().includes(consecutiveTeacher.toLowerCase()) && s.availableVacancies > 0,
    );

    const matches: Array<{ time1: string; time2: string; vac1: number; vac2: number }> = [];

    day1Slots.forEach((s1) => {
      // Buscar si el mismo horario o cualquier horario tiene cupo el día 2
      const matchingS2 = day2Slots.find((s2) => s2.time === s1.time);
      if (matchingS2) {
        matches.push({
          time1: s1.time,
          time2: matchingS2.time,
          vac1: s1.availableVacancies,
          vac2: matchingS2.availableVacancies,
        });
      }
    });

    return { day1Slots, day2Slots, matches };
  }, [allSlots, consecutiveDay1, consecutiveDay2, consecutiveTeacher]);

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                Explorador de Vacantes y Disponibilidad por Horario
                <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary bg-primary/5">
                  Capacidad: {MAX_CAPACITY} alumnos / clase
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Consulta al instante qué profesor tiene cupos libres el día (X) a la hora (X), vacantes restantes y buscador de días seguidos.
              </CardDescription>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsConsecutiveHelperOpen(true)}
            className="h-8 text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Emparejar Días Seguidos (Excepcional)
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* KPI Tiles Resumen de Cupos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-2xl border border-border bg-muted/20 p-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase block">Total Vacantes Libres</span>
            <span className="text-xl font-black text-primary tabular-nums">{totalVacanciesRemaining}</span>
            <span className="text-[10px] text-muted-foreground block">en todo el mes</span>
          </div>

          <div className="rounded-2xl border border-success/30 bg-success/5 p-3">
            <span className="text-[10px] font-bold text-success uppercase block">Horarios con Cupo</span>
            <span className="text-xl font-black text-success tabular-nums">{availableSlotsCount}</span>
            <span className="text-[10px] text-muted-foreground block">disponibles para matricular</span>
          </div>

          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3">
            <span className="text-[10px] font-bold text-destructive uppercase block">Horarios Llenos</span>
            <span className="text-xl font-black text-destructive tabular-nums">{fullSlotsCount}</span>
            <span className="text-[10px] text-muted-foreground block">5/5 alumnos inscritos</span>
          </div>

          <div className="rounded-2xl border border-border bg-muted/20 p-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase block">Aforo Oficial</span>
            <span className="text-xl font-black text-foreground tabular-nums">Máx. 5</span>
            <span className="text-[10px] text-muted-foreground block">alumnos por docente</span>
          </div>
        </div>

        {/* Barra de Filtros Inteligentes */}
        <div className="rounded-2xl border border-border bg-muted/30 p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
            <span className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-primary" /> Filtrar disponibilidad en vivo
            </span>
            <button
              onClick={() => {
                setFilterTeacher("all");
                setFilterDay("all");
                setFilterTime("all");
                setFilterInstrument("all");
                setFilterCategory("all");
                setSearchQuery("");
                setOnlyAvailable(true);
              }}
              className="text-[11px] text-primary hover:underline font-semibold"
            >
              Restablecer filtros
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 text-xs">
            {/* Filtro Profesor */}
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold block mb-1">Profesor / Sala</label>
              <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Todos los profesores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los profesores</SelectItem>
                  {availableTeachers.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Día */}
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold block mb-1">Día de la semana</label>
              <Select value={filterDay} onValueChange={setFilterDay}>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Todos los días" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los días (Lun-Sáb)</SelectItem>
                  {WEEK_DAYS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Hora */}
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold block mb-1">Franja Horaria</label>
              <Select value={filterTime} onValueChange={setFilterTime}>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Todas las horas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las horas</SelectItem>
                  {WEEKDAY_TIMES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Instrumento */}
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold block mb-1">Instrumento</label>
              <Select value={filterInstrument} onValueChange={setFilterInstrument}>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Todos los cursos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los instrumentos</SelectItem>
                  {musicalInstruments.map((inst) => (
                    <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Categoría de Edad */}
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold block mb-1">Categoría / Edad</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="JUNIOR">🟡 Junior (7 a 12)</SelectItem>
                  <SelectItem value="JUVENIL">🟢 Juvenil (13 a 17)</SelectItem>
                  <SelectItem value="ADULTO">⚫ Adulto (18 a +)</SelectItem>
                  <SelectItem value="INFANTIL">🟣 Infantil (5 y 6)</SelectItem>
                  <SelectItem value="PERSONALIZADA">🔵 Personalizada</SelectItem>
                  <SelectItem value="RECUPERACION">🔴 Recuperación</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buscador de Alumno / Texto */}
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold block mb-1">Buscar por Alumno / Texto</label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej: Joan, Jeremy, 16:45..."
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="only-avail-check"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-primary text-primary"
            />
            <label htmlFor="only-avail-check" className="text-xs font-semibold text-foreground cursor-pointer">
              Mostrar únicamente horarios con vacantes libres (Ocultar clases con 5/5)
            </label>
          </div>
        </div>

        {/* Grid de Resultados de Disponibilidad */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Resultados encontrados: <strong>{filteredSlots.length} horarios</strong></span>
            <span className="text-[11px]">Haz clic en un horario con cupo para auto-completar matrícula</span>
          </div>

          {filteredSlots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground space-y-1">
              <AlertCircle className="h-6 w-6 text-warning mx-auto opacity-70" />
              <p className="font-bold text-foreground">No se encontraron horarios con los filtros seleccionados</p>
              <p>Prueba seleccionando otro profesor, día o franja horaria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredSlots.map((slot, idx) => {
                const percentOccupied = Math.round((slot.enrolledCount / MAX_CAPACITY) * 100);
                const isAvail = slot.availableVacancies > 0;

                return (
                  <div
                    key={`${slot.day}-${slot.time}-${slot.teacher}-${idx}`}
                    onClick={() => {
                      if (onSelectSlot && isAvail) {
                        onSelectSlot({
                          day: slot.day,
                          time: slot.time,
                          teacher: slot.teacher,
                          room: slot.room,
                        });
                      }
                    }}
                    className={`rounded-2xl border p-3 text-xs transition-all space-y-2 ${
                      isAvail
                        ? "border-border bg-card hover:border-primary/50 hover:shadow-md cursor-pointer"
                        : "border-destructive/20 bg-destructive/5 opacity-75 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="font-black text-[11px] bg-muted/40">
                            {slot.day} {slot.time}
                          </Badge>
                          <span className="font-bold text-foreground truncate max-w-[130px]">
                            {slot.teacher}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {slot.room} {slot.instrument ? `· ${slot.instrument}` : ""}
                        </p>
                      </div>

                      <Badge
                        className={`text-[10px] font-black border-0 ${
                          slot.availableVacancies >= 3
                            ? "bg-success/20 text-success"
                            : slot.availableVacancies > 0
                            ? "bg-warning/20 text-warning-foreground"
                            : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {slot.availableVacancies > 0
                          ? `${slot.availableVacancies} libres (${slot.enrolledCount}/5)`
                          : "COMPLETO (5/5)"}
                      </Badge>
                    </div>

                    {/* Barra de progreso de aforo */}
                    <div className="space-y-1">
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            slot.enrolledCount >= 5
                              ? "bg-destructive"
                              : slot.enrolledCount >= 3
                              ? "bg-warning"
                              : "bg-success"
                          }`}
                          style={{ width: `${percentOccupied}%` }}
                        />
                      </div>
                    </div>

                    {/* Alumnos inscritos en este cuadrante */}
                    {slot.students.length > 0 ? (
                      <div className="text-[10px] text-muted-foreground truncate">
                        <span className="font-semibold text-foreground">Inscritos: </span>
                        {slot.students.join(", ")}
                      </div>
                    ) : (
                      <div className="text-[10px] text-success font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Todo el cuadrante disponible (5 vacantes)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>

      {/* Modal Asistente de Clases Consecutivas (Días Seguidos Excepcionales) */}
      <Dialog open={isConsecutiveHelperOpen} onOpenChange={setIsConsecutiveHelperOpen}>
        <DialogContent className="sm:max-w-xl p-6 rounded-3xl border-primary/30 bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              Asistente de Matrícula en Días Seguidos (Casos Excepcionales)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              En casos excepcionales donde el alumno requiere 2 clases consecutivas (ej. Lunes y Martes, o Martes y Miércoles), este módulo analiza automáticamente la disponibilidad del mismo profesor y horario para evitar cruces.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground block mb-1">Día 1 Consecutivo</label>
                <Select value={consecutiveDay1} onValueChange={(v: any) => setConsecutiveDay1(v)}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEK_DAYS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground block mb-1">Día 2 Consecutivo</label>
                <Select value={consecutiveDay2} onValueChange={(v: any) => setConsecutiveDay2(v)}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEK_DAYS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground block mb-1">Profesor</label>
                <Select value={consecutiveTeacher} onValueChange={setConsecutiveTeacher}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeachers.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Resultados de Emparejamiento Simultáneo */}
            <div className="rounded-2xl border border-border bg-muted/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                  <CalendarCheck className="h-4 w-4 text-primary" />
                  Horarios con Doble Disponibilidad ({consecutiveDay1} y {consecutiveDay2})
                </span>
                <Badge variant="outline" className="text-[10px] font-bold text-primary">
                  Prof. {consecutiveTeacher}
                </Badge>
              </div>

              {consecutivePairs.matches.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground space-y-1">
                  <AlertCircle className="h-5 w-5 text-warning mx-auto opacity-70" />
                  <p className="font-bold text-foreground">Sin coincidencia exacta en el mismo horario</p>
                  <p>El profesor no tiene el mismo bloque libre en ambos días, pero puedes elegir horarios diferentes.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-muted-foreground">
                    Los siguientes bloques horarios tienen cupo libre tanto el <strong>{consecutiveDay1}</strong> como el <strong>{consecutiveDay2}</strong>:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {consecutivePairs.matches.map((m, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-success/30 bg-success/5 p-2.5 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-black text-xs text-foreground block">{m.time1}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {consecutiveDay1} ({m.vac1} libres) · {consecutiveDay2} ({m.vac2} libres)
                          </span>
                        </div>
                        <Badge className="bg-success text-success-foreground font-bold text-[10px] border-0">
                          ✓ Emparejado
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button size="sm" onClick={() => setIsConsecutiveHelperOpen(false)} className="text-xs font-bold">
                Cerrar Asistente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
