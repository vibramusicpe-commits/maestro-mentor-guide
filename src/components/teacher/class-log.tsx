import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Clock,
  Loader2,
  Music2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminStudent, ScheduledLesson } from "@/store/app-store";
import {
  getCriteria,
  getLatestEvaluation,
  saveLessonEvaluation,
} from "@/lib/services/evaluations.service";
import { resolveTeacherUserId } from "@/lib/services/teacher-resolver";
import type {
  ClassMode,
  EvaluationFieldRow,
  ExtraScoreSnapshot,
  LessonEvaluationRow,
  OverallStatus,
  RepertoireStatus,
} from "@/lib/informes/types";
import { normalizeTitle, toIsoDate } from "@/lib/informes/utils";
import { toast } from "sonner";

export interface ClassLogSeed {
  studentId: string;
  studentName?: string;
  lessonId?: string;
  sessionDate: string;
  startTime: string;
  durationMin: number;
  instrument?: string;
  nonce: number;
}

export interface ClassLogProps {
  teacherName: string;
  teacherClean: string;
  students: AdminStudent[];
  schedule: ScheduledLesson[];
  initialSeed?: ClassLogSeed | null;
  onSaved?: () => void;
}

const STATUS_OPTIONS: Array<{
  value: OverallStatus;
  label: string;
  emoji: string;
  className: string;
  selectedClassName: string;
}> = [
  {
    value: "logrado",
    label: "Logrado",
    emoji: "🟢",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    selectedClassName:
      "border-emerald-600 bg-emerald-600 text-white shadow-sm scale-[1.02]",
  },
  {
    value: "en_proceso",
    label: "En proceso",
    emoji: "🟡",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    selectedClassName:
      "border-amber-500 bg-amber-500 text-white shadow-sm scale-[1.02]",
  },
  {
    value: "pendiente",
    label: "No logrado",
    emoji: "🔴",
    className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
    selectedClassName:
      "border-red-600 bg-red-600 text-white shadow-sm scale-[1.02]",
  },
  {
    value: "no_corresponde",
    label: "No corresponde",
    emoji: "⚪",
    className:
      "border-slate-400/40 bg-slate-400/10 text-slate-600 dark:text-slate-300",
    selectedClassName:
      "border-slate-500 bg-slate-500 text-white shadow-sm scale-[1.02]",
  },
];

const STATUS_LABELS: Record<OverallStatus, string> = {
  logrado: "Logrado",
  en_proceso: "En proceso",
  pendiente: "No logrado",
  no_corresponde: "No corresponde",
  sin_evaluar: "Sin marcar",
};

const DEFAULT_TRAFFIC_OPTIONS = [
  { value: "logrado", label: "Logrado", color: "#43A047" },
  { value: "en_proceso", label: "En proceso", color: "#FBC02D" },
  { value: "pendiente", label: "No logrado", color: "#E53935" },
  { value: "no_corresponde", label: "No corresponde", color: "#9E9E9E" },
];

function formatDate(iso: string): string {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

function detectDuration(student: AdminStudent): number {
  const modality = (student.modality || "").toLowerCase();
  const isIntensive =
    modality.includes("inten") ||
    modality.includes("90 min") ||
    (modality.includes("4 clases") && !modality.includes("45 min"));
  return isIntensive ? 90 : 45;
}

function findLessonForStudent(
  student: AdminStudent,
  schedule: ScheduledLesson[],
): ScheduledLesson | null {
  const targetName = normalizeTitle(student.name);
  const fromSchedule = schedule.filter(
    (lesson) =>
      lesson.status !== "cancelada" &&
      normalizeTitle(lesson.student) === targetName,
  );
  if (fromSchedule.length > 0) return fromSchedule[0];

  const fromProfile = (student.scheduleLessons || []).filter(
    (lesson) => lesson.status !== "cancelada",
  );
  return fromProfile[0] || null;
}

function resolveTrafficOptions(field: EvaluationFieldRow) {
  const raw = Array.isArray(field.options) ? field.options : [];
  const parsed = raw
    .map((option) => {
      if (typeof option === "string") {
        return { value: option, label: option, color: "#9E9E9E" };
      }
      if (!option || typeof option !== "object") return null;
      const record = option as Record<string, unknown>;
      const value = String(record.value ?? record.key ?? "").trim();
      if (!value) return null;
      return {
        value,
        label: String(record.label ?? value),
        color: String(record.color ?? "#9E9E9E"),
      };
    })
    .filter(Boolean) as Array<{ value: string; label: string; color: string }>;

  return parsed.length > 0 ? parsed : DEFAULT_TRAFFIC_OPTIONS;
}

function CriterionField({
  field,
  value,
  onChange,
}: {
  field: EvaluationFieldRow;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const label = (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-foreground">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </p>
        {field.help_text && (
          <p className="text-[10px] text-muted-foreground">{field.help_text}</p>
        )}
      </div>
    </div>
  );

  if (field.field_type === "traffic_light") {
    const options = resolveTrafficOptions(field);
    return (
      <div className="rounded-xl border border-border/60 bg-background/60 p-2 space-y-1.5">
        {label}
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          {options.map((option) => {
            const selected = String(value ?? "") === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(selected ? "" : option.value)}
                className={`rounded-lg border px-1.5 py-1.5 text-[10px] font-black transition-all ${
                  selected
                    ? "text-white shadow-sm scale-[1.02]"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
                style={
                  selected
                    ? { backgroundColor: option.color, borderColor: option.color }
                    : { borderColor: `${option.color}66` }
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.field_type === "score_1_10") {
    return (
      <div className="rounded-xl border border-border/60 bg-background/60 p-2 space-y-1.5">
        {label}
        <select
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(event) =>
            onChange(event.target.value ? Number(event.target.value) : "")
          }
          className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">— Sin puntaje —</option>
          {Array.from({ length: 10 }, (_, index) => index + 1).map((score) => (
            <option key={score} value={score}>
              {score}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.field_type === "checkbox") {
    const checked = Boolean(value);
    return (
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`w-full rounded-xl border p-2 text-left transition-all ${
          checked
            ? "border-primary bg-primary/10 text-foreground"
            : "border-border/60 bg-background/60 text-muted-foreground"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold">{field.label}</p>
          <span className="text-xs">{checked ? "✅" : "⬜"}</span>
        </div>
        {field.help_text && (
          <p className="text-[10px] text-muted-foreground">{field.help_text}</p>
        )}
      </button>
    );
  }

  if (field.field_type === "dropdown") {
    const options = Array.isArray(field.options) ? field.options : [];
    return (
      <div className="rounded-xl border border-border/60 bg-background/60 p-2 space-y-1.5">
        {label}
        <select
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">— Elegir —</option>
          {options.map((option, index) => {
            if (typeof option === "string") {
              return (
                <option key={`${option}-${index}`} value={option}>
                  {option}
                </option>
              );
            }
            if (!option || typeof option !== "object") return null;
            const record = option as Record<string, unknown>;
            const optionValue = String(record.value ?? record.key ?? "");
            return (
              <option key={`${optionValue}-${index}`} value={optionValue}>
                {String(record.label ?? optionValue)}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  if (field.field_type === "long_text") {
    return (
      <div className="rounded-xl border border-border/60 bg-background/60 p-2 space-y-1.5">
        {label}
        <Textarea
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          rows={2}
          className="text-xs"
          placeholder="Escribe una observación breve"
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-2 space-y-1.5">
      {label}
      <Input
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 text-xs"
        placeholder="Escribe una observación breve"
      />
    </div>
  );
}

export function ClassLog({
  teacherName,
  teacherClean,
  students,
  schedule,
  initialSeed,
  onSaved,
}: ClassLogProps) {
  const [selectedStudentId, setSelectedStudentId] = useState(
    () => initialSeed?.studentId || "",
  );
  const [sessionDate, setSessionDate] = useState(
    () => initialSeed?.sessionDate || toIsoDate(new Date()),
  );
  const [startTime, setStartTime] = useState(
    () => initialSeed?.startTime || "",
  );
  const [durationMin, setDurationMin] = useState(
    () => initialSeed?.durationMin || 45,
  );
  const [instrument, setInstrument] = useState(
    () => initialSeed?.instrument || "",
  );
  const [lessonId, setLessonId] = useState<string | null>(
    () => initialSeed?.lessonId || null,
  );
  const [classMode, setClassMode] = useState<ClassMode>("no_aplica");
  const [overallStatus, setOverallStatus] =
    useState<OverallStatus>("sin_evaluar");
  const [numericScore, setNumericScore] = useState("");
  const [topic, setTopic] = useState("");
  const [repertoire, setRepertoire] = useState<
    Array<{ title: string; status: RepertoireStatus }>
  >([{ title: "", status: "en_proceso" }]);
  const [homework, setHomework] = useState("");
  const [comment, setComment] = useState("");
  const [extraValues, setExtraValues] = useState<Record<string, unknown>>({});
  const [criteria, setCriteria] = useState<EvaluationFieldRow[]>([]);
  const [criteriaLoading, setCriteriaLoading] = useState(false);
  const [latest, setLatest] = useState<LessonEvaluationRow | null>(null);
  const [latestLoading, setLatestLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const teacherId = useMemo(
    () => resolveTeacherUserId(undefined, teacherName),
    [teacherName],
  );
  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || null,
    [students, selectedStudentId],
  );
  const usesNumericScale = teacherClean.includes("fernando");
  const isCanto = normalizeTitle(
    instrument || selectedStudent?.instrument || "",
  ).includes("canto");

  const groupedCriteria = useMemo(() => {
    const groups = new Map<string, EvaluationFieldRow[]>();
    for (const field of criteria) {
      const config =
        field.ui_config && typeof field.ui_config === "object"
          ? (field.ui_config as Record<string, unknown>)
          : {};
      const group = String(config.group || "Criterios");
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(field);
    }
    return Array.from(groups.entries());
  }, [criteria]);

  useEffect(() => {
    if (!selectedStudent) return;

    setClassMode((previous) =>
      normalizeTitle(selectedStudent.instrument || "").includes("canto")
        ? previous === "no_aplica"
          ? "individual"
          : previous
        : "no_aplica",
    );

    if (!startTime) {
      const lesson = findLessonForStudent(selectedStudent, schedule);
      if (lesson) {
        setStartTime(lesson.time);
        setLessonId(lesson.id);
        setDurationMin(detectDuration(selectedStudent));
        setInstrument(
          (previous) =>
            previous || selectedStudent.instrument || lesson.instrument || "",
        );
      }
    }
  }, [selectedStudent?.id]);

  useEffect(() => {
    if (!selectedStudent) {
      setCriteria([]);
      return;
    }

    let cancelled = false;
    setCriteriaLoading(true);
    getCriteria({
      instrument: selectedStudent.instrument,
      ageCategory: selectedStudent.ageCategory,
      level: selectedStudent.level,
      teacherId,
    })
      .then((rows) => {
        if (!cancelled) setCriteria(rows);
      })
      .catch((error) => {
        if (cancelled) return;
        setCriteria([]);
        console.warn("[ClassLog] No se pudieron cargar los criterios:", error);
      })
      .finally(() => {
        if (!cancelled) setCriteriaLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedStudent?.id, teacherId]);

  useEffect(() => {
    if (!selectedStudent) {
      setLatest(null);
      return;
    }

    let cancelled = false;
    setLatestLoading(true);
    getLatestEvaluation(selectedStudent.id)
      .then((row) => {
        if (!cancelled) setLatest(row);
      })
      .catch(() => {
        if (!cancelled) setLatest(null);
      })
      .finally(() => {
        if (!cancelled) setLatestLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedStudent?.id, savedAt]);

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    setOverallStatus("sin_evaluar");
    setNumericScore("");
    setTopic("");
    setRepertoire([{ title: "", status: "en_proceso" }]);
    setHomework("");
    setComment("");
    setExtraValues({});
    setLatest(null);
    setSavedAt(null);

    const student = students.find((item) => item.id === studentId);
    if (!student) return;

    const lesson = findLessonForStudent(student, schedule);
    setLessonId(lesson?.id || null);
    setInstrument(student.instrument || lesson?.instrument || "");
    setDurationMin(detectDuration(student));
    setStartTime((previous) => lesson?.time || previous);
    setSessionDate((previous) => lesson?.dateStr || previous);
    setClassMode(
      normalizeTitle(student.instrument || "").includes("canto")
        ? "individual"
        : "no_aplica",
    );
  };

  const updateRepertoireRow = (
    index: number,
    patch: Partial<{ title: string; status: RepertoireStatus }>,
  ) => {
    setRepertoire((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const addRepertoireRow = () => {
    setRepertoire((previous) => [
      ...previous,
      { title: "", status: "en_proceso" },
    ]);
  };

  const removeRepertoireRow = (index: number) => {
    setRepertoire((previous) =>
      previous.length <= 1
        ? previous
        : previous.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const buildExtraScores = (): ExtraScoreSnapshot[] => {
    return criteria
      .map((field) => {
        const raw = extraValues[field.field_key];
        if (raw === undefined || raw === null || raw === "") return null;

        let band: string | null = null;
        if (field.field_type === "traffic_light") {
          band = String(raw);
        } else if (field.field_type === "score_1_10") {
          const score = Number(raw);
          band = score >= 8 ? "verde" : score >= 5 ? "amarillo" : "rojo";
        }

        return {
          field_id: field.id,
          field_key: field.field_key,
          label: field.label,
          type: field.field_type,
          raw_value: raw,
          band,
        };
      })
      .filter(Boolean) as ExtraScoreSnapshot[];
  };

  const handleSave = async () => {
    if (!selectedStudent) {
      toast.error("Elige un alumno antes de guardar.");
      return;
    }
    if (!sessionDate || !startTime) {
      toast.error("Completa la fecha y la hora de la clase.");
      return;
    }

    const cleanRepertoire = repertoire
      .map((item) => ({ ...item, title: item.title.trim() }))
      .filter((item) => item.title.length > 0);
    const hasContent =
      Boolean(topic.trim()) ||
      Boolean(comment.trim()) ||
      cleanRepertoire.length > 0 ||
      overallStatus !== "sin_evaluar" ||
      Object.keys(extraValues).length > 0;

    if (!hasContent) {
      toast.error(
        "Registra al menos el tema, un comentario, el repertorio o un estado.",
      );
      return;
    }

    const missingRequired = criteria.find(
      (field) =>
        field.required &&
        (extraValues[field.field_key] === undefined ||
          extraValues[field.field_key] === null ||
          extraValues[field.field_key] === ""),
    );
    if (missingRequired) {
      toast.error(`Falta completar: ${missingRequired.label}`);
      return;
    }

    setSaving(true);
    try {
      const saved = await saveLessonEvaluation({
        lessonId,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        teacherId,
        teacherName,
        createdById: teacherId,
        createdByName: teacherName,
        sessionDate,
        startTime,
        durationMin,
        modality: selectedStudent.modality,
        instrument: instrument || selectedStudent.instrument,
        program: selectedStudent.modality,
        classMode,
        topic: topic.trim() || null,
        overallStatus,
        score:
          usesNumericScale && numericScore.trim()
            ? Number(numericScore)
            : null,
        repertoire: cleanRepertoire,
        homework: homework.trim() || null,
        teacherComment: comment.trim() || null,
        extraScores: buildExtraScores(),
        isTest: false,
      });

      setLatest(saved);
      setSavedAt(Date.now());
      toast.success("✓ Registro de clase guardado", {
        description: `${selectedStudent.name} · ${formatDate(sessionDate)} ${startTime}`,
      });
      onSaved?.();
    } catch (error: any) {
      toast.error(
        "No se pudo guardar el registro: " +
          (error?.message || "Error de conexión"),
      );
    } finally {
      setSaving(false);
    }
  };

  if (students.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center space-y-2">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Music2 className="h-5 w-5" />
        </div>
        <p className="text-sm font-black text-foreground">
          No hay alumnos activos vinculados a tu perfil
        </p>
        <p className="text-xs text-muted-foreground">
          Cuando tengas un alumno activo en el horario, podrás registrar su
          clase aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-4 space-y-2.5 shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-black text-foreground">
              Registro de clase
            </p>
            <p className="text-[11px] text-muted-foreground">
              Objetivo: 30–90 segundos. Se guarda por sesión y puedes corregirlo
              después.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
            BETA
          </span>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
            Alumno
          </label>
          <select
            value={selectedStudentId}
            onChange={(event) => handleStudentChange(event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Elegir alumno...</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} · {student.instrument}
              </option>
            ))}
          </select>
        </div>

        {!selectedStudent ? (
          <div className="rounded-xl border border-dashed border-border bg-background/50 p-4 text-center space-y-1">
            <Sparkles className="mx-auto h-5 w-5 text-primary" />
            <p className="text-xs font-bold text-foreground">
              Elige un alumno para empezar
            </p>
            <p className="text-[11px] text-muted-foreground">
              También puedes entrar desde el botón “Registrar clase” de su
              tarjeta en el kiosco.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-[10px] font-bold text-foreground">
                <Music2 className="h-3 w-3 text-primary" />
                {instrument || selectedStudent.instrument}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-[10px] font-bold text-foreground">
                <BookOpen className="h-3 w-3 text-primary" />
                {selectedStudent.level || "Nivel no registrado"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-[10px] font-bold text-foreground">
                <Clock className="h-3 w-3 text-primary" />
                {durationMin} min
              </span>
              {selectedStudent.ageCategory && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-[10px] font-bold text-foreground">
                  <User className="h-3 w-3 text-primary" />
                  {selectedStudent.ageCategory}
                </span>
              )}
            </div>

            <div className="rounded-xl border border-border/70 bg-background/70 p-2.5 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-black text-foreground">
                  Última evaluación
                </p>
                {latestLoading && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </div>
              {latest ? (
                <>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDate(latest.session_date)} ·{" "}
                    {STATUS_LABELS[latest.overall_status]}
                  </p>
                  {latest.topic && (
                    <p className="text-xs font-semibold text-foreground">
                      Tema: {latest.topic}
                    </p>
                  )}
                  {latest.repertoire?.length > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      Repertorio:{" "}
                      {latest.repertoire.map((item) => item.title).join(" · ")}
                    </p>
                  )}
                  {latest.teacher_comment && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {latest.teacher_comment}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Sin evaluaciones previas. Esta será la primera.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                  Fecha
                </label>
                <Input
                  type="date"
                  value={sessionDate}
                  onChange={(event) => setSessionDate(event.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                  Hora de inicio
                </label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {isCanto && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                  Modalidad de Canto
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setClassMode("individual")}
                    className={`rounded-xl border px-2 py-2 text-[11px] font-black transition-all ${
                      classMode === "individual"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    Individual (1 alumno)
                  </button>
                  <button
                    type="button"
                    onClick={() => setClassMode("grupal")}
                    className={`rounded-xl border px-2 py-2 text-[11px] font-black transition-all ${
                      classMode === "grupal"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    Grupal (2 a 5)
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Canto nunca se registra como coro.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                  Estado general de la clase
                </label>
                <button
                  type="button"
                  onClick={() => setOverallStatus("sin_evaluar")}
                  className="text-[10px] font-bold text-muted-foreground hover:text-primary"
                >
                  Limpiar
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={overallStatus === option.value}
                    onClick={() => setOverallStatus(option.value)}
                    className={`rounded-xl border px-2 py-2 text-[10px] font-black transition-all ${
                      overallStatus === option.value
                        ? option.selectedClassName
                        : option.className
                    }`}
                  >
                    <span className="mr-1">{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {usesNumericScale && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/70 p-2.5">
                <div>
                  <p className="text-[11px] font-black text-foreground">
                    Puntaje general 1–10
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Escala del Prof. Fernando
                  </p>
                </div>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={10}
                  value={numericScore}
                  onChange={(event) => setNumericScore(event.target.value)}
                  placeholder="—"
                  className="h-9 w-20 text-center text-sm font-black"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                  Criterios de la clase
                </p>
                {criteriaLoading && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </div>

              {criteria.length === 0 && !criteriaLoading ? (
                <div className="flex items-start gap-2 rounded-xl border border-dashed border-border bg-background/50 p-2.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p className="text-[11px] text-muted-foreground">
                    {teacherClean.includes("jeremy")
                      ? "Los criterios de Guitarra y Batería están pendientes de levantamiento con el Prof. Jeremy. Puedes guardar la clase con los campos base."
                      : "Aún no hay criterios configurados para este instrumento. Puedes guardar la clase con los campos base."}
                  </p>
                </div>
              ) : (
                groupedCriteria.map(([group, fields]) => (
                  <div key={group} className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                      {group}
                    </p>
                    {fields.map((field) => (
                      <CriterionField
                        key={field.id}
                        field={field}
                        value={extraValues[field.field_key]}
                        onChange={(value) =>
                          setExtraValues((previous) => ({
                            ...previous,
                            [field.field_key]: value,
                          }))
                        }
                      />
                    ))}
                  </div>
                ))
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                  Repertorio trabajado
                </p>
                <button
                  type="button"
                  onClick={addRepertoireRow}
                  className="inline-flex items-center gap-1 text-[10px] font-black text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  Agregar pieza
                </button>
              </div>
              {repertoire.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <Input
                    value={item.title}
                    onChange={(event) =>
                      updateRepertoireRow(index, { title: event.target.value })
                    }
                    placeholder="Canción o pieza"
                    className="h-9 flex-1 text-xs"
                  />
                  <select
                    value={item.status}
                    onChange={(event) =>
                      updateRepertoireRow(index, {
                        status: event.target.value as RepertoireStatus,
                      })
                    }
                    className="h-9 w-28 rounded-lg border border-border bg-background px-1.5 text-[10px] font-bold text-foreground outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="logrado">Logrado</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="no_corresponde">No corresponde</option>
                  </select>
                  {repertoire.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRepertoireRow(index)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                      aria-label="Quitar pieza"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                Tema trabajado
              </label>
              <Input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Ej. Respiración y apoyo diafragmático"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                Tarea para casa
              </label>
              <Input
                value={homework}
                onChange={(event) => setHomework(event.target.value)}
                placeholder="Práctica sugerida (opcional)"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                Comentario corto
              </label>
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="2–3 líneas para el informe o la familia"
                rows={3}
                className="text-xs"
              />
            </div>

            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || !selectedStudent}
              className="min-h-[48px] w-full font-black"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving
                ? "Guardando..."
                : latest
                  ? "Guardar cambios de la clase"
                  : "Guardar registro de clase"}
            </Button>

            {savedAt && (
              <p className="text-center text-[11px] font-bold text-emerald-600">
                ✓ Guardado. Puedes corregir y volver a guardar; se actualiza el
                mismo registro.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
