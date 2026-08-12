import { useMemo, useState } from "react";
import { AlertTriangle, CalendarX2, Clock, DoorOpen, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useAppStore, type ScheduledLesson, type WeekDay } from "@/store/app-store";
import { rooms, teachers, timeSlots, weekDays } from "@/store/admin-seeds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const ALL = "todos";

const instrumentTone: Record<string, string> = {
  "Guitarra clásica": "border-primary/40 bg-primary/10 text-primary",
  "Guitarra eléctrica": "border-primary/40 bg-primary/10 text-primary",
  Piano: "border-accent-foreground/25 bg-accent text-accent-foreground",
  Violín: "border-chart-3/40 bg-chart-3/15 text-foreground",
  Batería: "border-chart-4/40 bg-chart-4/15 text-foreground",
  Canto: "border-chart-2/40 bg-chart-2/15 text-foreground",
};

function toneFor(instrument: string) {
  return instrumentTone[instrument] ?? "border-border bg-muted text-foreground";
}

export function AgendaBoard() {
  const schedule = useAppStore((s) => s.schedule);
  const rescheduleLesson = useAppStore((s) => s.rescheduleLesson);
  const cancelLesson = useAppStore((s) => s.cancelLesson);

  const [teacher, setTeacher] = useState(ALL);
  const [room, setRoom] = useState(ALL);
  const [instrument, setInstrument] = useState(ALL);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [moveDay, setMoveDay] = useState<WeekDay>("Lun");
  const [moveTime, setMoveTime] = useState(timeSlots[0]!);

  const instruments = useMemo(
    () => Array.from(new Set(schedule.map((l) => l.instrument))).sort(),
    [schedule],
  );

  const visible = useMemo(
    () =>
      schedule.filter(
        (l) =>
          (teacher === ALL || l.teacher === teacher) &&
          (room === ALL || l.room === room) &&
          (instrument === ALL || l.instrument === instrument),
      ),
    [schedule, teacher, room, instrument],
  );

  // Conflictos: mismo profesor o misma sala en el mismo día y hora.
  const conflictIds = useMemo(() => {
    const ids = new Set<string>();
    const byKey = new Map<string, ScheduledLesson[]>();
    for (const l of schedule) {
      if (l.status === "cancelada") continue;
      for (const key of [`${l.day}|${l.time}|t:${l.teacher}`, `${l.day}|${l.time}|r:${l.room}`]) {
        const list = byKey.get(key) ?? [];
        list.push(l);
        byKey.set(key, list);
      }
    }
    for (const list of byKey.values()) {
      if (list.length > 1) list.forEach((l) => ids.add(l.id));
    }
    return ids;
  }, [schedule]);

  const active = schedule.filter((l) => l.status !== "cancelada");
  const capacity = weekDays.length * timeSlots.length * rooms.length;
  const occupancy = Math.round((active.length / capacity) * 100);
  const selected = schedule.find((l) => l.id === selectedId) ?? null;

  function openLesson(lesson: ScheduledLesson) {
    setSelectedId(lesson.id);
    setMoveDay(lesson.day);
    setMoveTime(lesson.time);
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryTile icon={GraduationCap} label="Clases programadas" value={`${active.length}`} />
        <SummaryTile
          icon={DoorOpen}
          label="Ocupación de salas"
          value={`${occupancy}%`}
          hint={`${capacity - active.length} franjas libres`}
        />
        <SummaryTile
          icon={AlertTriangle}
          label="Conflictos detectados"
          value={`${conflictIds.size / 2 || 0}`}
          hint="Mismo profesor o sala a la vez"
          alert={conflictIds.size > 0}
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <FilterSelect value={teacher} onChange={setTeacher} placeholder="Profesor" options={teachers} />
        <FilterSelect value={room} onChange={setRoom} placeholder="Sala" options={rooms} />
        <FilterSelect
          value={instrument}
          onChange={setInstrument}
          placeholder="Instrumento"
          options={instruments}
        />
        {(teacher !== ALL || room !== ALL || instrument !== ALL) && (
          <Button
            variant="ghost"
            onClick={() => {
              setTeacher(ALL);
              setRoom(ALL);
              setInstrument(ALL);
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Rejilla semanal */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <div className="min-w-[52rem]">
          <div className="grid grid-cols-[5rem_repeat(6,1fr)] border-b border-border bg-muted/50">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Hora</div>
            {weekDays.map((d) => (
              <div key={d} className="px-3 py-2 text-xs font-semibold">
                {d}
              </div>
            ))}
          </div>
          {timeSlots.map((slot) => (
            <div
              key={slot}
              className="grid grid-cols-[5rem_repeat(6,1fr)] border-b border-border last:border-b-0"
            >
              <div className="px-3 py-3 font-mono text-xs text-muted-foreground">{slot}</div>
              {weekDays.map((day) => {
                const cell = visible.filter((l) => l.day === day && l.time === slot);
                return (
                  <div key={day} className="space-y-1.5 border-l border-border/60 p-1.5">
                    {cell.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => openLesson(lesson)}
                        className={`w-full rounded-lg border px-2 py-1.5 text-left text-xs transition hover:shadow-sm ${
                          lesson.status === "cancelada"
                            ? "border-dashed border-border bg-muted text-muted-foreground line-through"
                            : toneFor(lesson.instrument)
                        }`}
                      >
                        <span className="block truncate font-semibold">{lesson.student}</span>
                        <span className="block truncate opacity-80">{lesson.instrument}</span>
                        <span className="mt-0.5 flex items-center gap-1 text-[10px] opacity-70">
                          {lesson.room}
                          {conflictIds.has(lesson.id) && lesson.status !== "cancelada" && (
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Detalle */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.student}</SheetTitle>
                <SheetDescription>
                  {selected.instrument} · {selected.teacher}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-4 pb-8">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    <Clock className="mr-1 h-3 w-3" />
                    {selected.day} {selected.time}
                  </Badge>
                  <Badge variant="secondary">{selected.room}</Badge>
                  {selected.status === "cancelada" && <Badge variant="destructive">Cancelada</Badge>}
                  {conflictIds.has(selected.id) && selected.status !== "cancelada" && (
                    <Badge variant="destructive">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Conflicto de horario
                    </Badge>
                  )}
                </div>

                <div className="space-y-3 rounded-xl border border-border p-4">
                  <p className="text-sm font-semibold">Reprogramar</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={moveDay} onValueChange={(v) => setMoveDay(v as WeekDay)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={moveTime} onValueChange={setMoveTime}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    disabled={selected.status === "cancelada"}
                    onClick={() => {
                      rescheduleLesson(selected.id, moveDay, moveTime);
                      toast.success(`Clase movida a ${moveDay} ${moveTime}`);
                    }}
                  >
                    Guardar nuevo horario
                  </Button>
                </div>

                <Button
                  variant="outline"
                  className="w-full text-destructive"
                  disabled={selected.status === "cancelada"}
                  onClick={() => {
                    cancelLesson(selected.id);
                    toast("Clase cancelada", {
                      description: "Se emitió un crédito de recuperación a la familia.",
                    });
                  }}
                >
                  <CalendarX2 className="mr-2 h-4 w-4" />
                  Cancelar clase y emitir crédito
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[11rem]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}: todos</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  hint,
  alert,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  hint?: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className={`h-4 w-4 ${alert ? "text-destructive" : "text-primary"}`} />
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
