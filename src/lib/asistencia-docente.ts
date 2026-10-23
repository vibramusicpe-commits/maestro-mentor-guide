/**
 * ================================================================
 * Motor único de Asistencia Docente (fichajes de entrada/salida)
 * ================================================================
 *
 * Fuente de verdad: tabla `teacher_time_logs` (PostgreSQL / Insforge).
 * NO lee ni escribe asistencia de alumnos (`attendance_logs`).
 *
 * Reglas innegociables (ADR-0181):
 *  1. Todas las horas se calculan en `America/Lima`, nunca en la zona del
 *     navegador ni en la del servidor (el servidor corre en GMT).
 *  2. El reporte muestra los fichajes tal como están registrados y, aparte,
 *     los días del mes con clase programada que no tienen fichaje, marcados
 *     como "Por regularizar".
 *  3. Las incidencias (turno sin salida, duración inusual, 0 minutos) se
 *     muestran en su fila y NO se suman al total de horas hasta que
 *     Dirección las regularice. No se corrige nada en silencio.
 *  4. CERO montos en soles: solo horario, días asistidos y horas. La
 *     valorización económica es exclusiva de Dirección.
 *  5. Un único formato para pantalla, CSV, PDF (A4), Markdown y WhatsApp.
 *     Prohibido reimplementar estos cálculos en un componente (ADR-0119.3).
 */

import type { ScheduledLesson } from "@/store/admin-seeds";
import { TEACHER_IDS } from "@/lib/services/teacher-resolver";

export const LIMA_TZ = "America/Lima";

/** Jornada máxima razonable. Por encima se considera turno sin cierre. */
export const MAX_SHIFT_HOURS = 14;

// ---------------------------------------------------------------
// Perfiles oficiales (id sintético -> nombre visible / área)
// ---------------------------------------------------------------
export type AttendanceArea =
  | "Docente"
  | "Secretaría"
  | "Dirección"
  | "Marketing"
  | "Sin identificar";

export interface AttendanceProfile {
  id: string;
  /** Primer nombre, para etiquetas cortas. */
  name: string;
  /** Etiqueta completa oficial. */
  label: string;
  area: AttendanceArea;
  /** Alias para emparejar `teacher_name` histórico. */
  aliases: string[];
}

/**
 * Roster único de perfiles con fichaje. Incluye a Secretaría (Jackeline /
 * Nayeli) y Dirección, que antes no aparecían en el selector del panel.
 */
export const ATTENDANCE_PROFILES: AttendanceProfile[] = [
  {
    id: TEACHER_IDS.ROCIO,
    name: "Rocío",
    label: "Rocío (Dirección)",
    area: "Dirección",
    aliases: ["rocio", "rocío", "dueña", "duena"],
  },
  {
    id: TEACHER_IDS.NAYELI,
    name: "Jackeline",
    label: "Jackeline / Nayeli (Secretaría)",
    area: "Secretaría",
    aliases: ["jackeline", "nayeli", "jaquelin"],
  },
  {
    id: TEACHER_IDS.SERGIO,
    name: "Sergio",
    label: "Sergio (Dirección)",
    area: "Dirección",
    aliases: ["sergio"],
  },
  {
    id: TEACHER_IDS.KARLA,
    name: "Karla",
    label: "Karla (Secretaría)",
    area: "Secretaría",
    aliases: ["karla"],
  },
  {
    id: TEACHER_IDS.NATHALY,
    name: "Nathaly",
    label: "Nathaly (Canto y Piano Infantil)",
    area: "Docente",
    aliases: ["nathaly", "nataly"],
  },
  {
    id: TEACHER_IDS.JEREMY,
    name: "Jeremy",
    label: "Jeremy (Guitarra y Batería)",
    area: "Docente",
    aliases: ["jeremy"],
  },
  {
    id: TEACHER_IDS.FERNANDO,
    name: "Fernando",
    label: "Fernando (Violín y Piano)",
    area: "Docente",
    aliases: ["fernando"],
  },
  {
    id: TEACHER_IDS.FABRICIO,
    name: "Fabricio",
    label: "Fabricio (Marketing)",
    area: "Marketing",
    aliases: ["fabricio", "marketing"],
  },
  {
    id: TEACHER_IDS.DEMO,
    name: "Sin identificar",
    label: "Turnos sin identidad (revisar)",
    area: "Sin identificar",
    aliases: ["profesor demo", "profesor/a vibra", "profesor", "profesora"],
  },
];

const profileById = new Map(ATTENDANCE_PROFILES.map((p) => [p.id, p]));

export function getAttendanceProfile(id?: string | null): AttendanceProfile | null {
  if (!id) return null;
  return profileById.get(id) ?? null;
}

export function normalizePersonName(value?: string | null): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z\s/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Empareja un `teacher_name` histórico con su perfil oficial. */
export function resolveProfileForShift(
  teacherId?: string | null,
  teacherName?: string | null,
): AttendanceProfile | null {
  const byId = getAttendanceProfile(teacherId);
  if (byId) return byId;

  const haystack = normalizePersonName(teacherName);
  if (!haystack) return null;

  for (const profile of ATTENDANCE_PROFILES) {
    if (profile.aliases.some((alias) => haystack.includes(normalizePersonName(alias)))) {
      return profile;
    }
  }
  return null;
}

/**
 * Identidad del usuario logueado a partir de su email y nombre visibles.
 *
 * No se apoya en `resolveTeacherUserId` porque ese resolvedor devuelve el
 * UUID genérico "Profesor Demo" para cualquier persona que no sea Jeremy,
 * Fernando o Nathaly: Secretaría, Dirección y Marketing caerían en el perfil
 * equivocado. Se usa la misma lista de alias del roster.
 */
export function resolveProfileForIdentity(
  email?: string | null,
  name?: string | null,
): AttendanceProfile | null {
  const haystack = normalizePersonName(`${email || ""} ${name || ""}`);
  if (!haystack) return null;

  let best: { profile: AttendanceProfile; score: number } | null = null;
  for (const profile of ATTENDANCE_PROFILES) {
    for (const alias of profile.aliases) {
      const token = normalizePersonName(alias);
      // Los alias de una letra ("a", "b") generarían falsos positivos.
      if (token.length < 4) continue;
      if (!haystack.includes(token)) continue;
      if (!best || token.length > best.score) {
        best = { profile, score: token.length };
      }
    }
  }
  return best?.profile ?? null;
}

/**
 * True si un fichaje pertenece al perfil.
 *
 * Manda el UUID cuando existe: un turno marcado como "Profesor/a Vibra"
 * (id genérico) no se atribuye a Nathaly solo porque el nombre se parezca.
 */
export function shiftBelongsToProfile(
  shift: TeacherShiftLike,
  profile: AttendanceProfile,
): boolean {
  const resolved = resolveProfileForShift(shift.teacher_id, shift.teacher_name);
  return resolved ? resolved.id === profile.id : false;
}

// ---------------------------------------------------------------
// Fechas en hora de Lima
// ---------------------------------------------------------------
const DATE_KEY_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: LIMA_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const TIME_FMT = new Intl.DateTimeFormat("es-PE", {
  timeZone: LIMA_TZ,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function limaDateKey(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return DATE_KEY_FMT.format(date);
}

export function limaMonthKey(iso?: string | null): string | null {
  const key = limaDateKey(iso);
  return key ? key.slice(0, 7) : null;
}

export function limaTimeHM(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return TIME_FMT.format(date);
}

/** ISO de "hoy" en Lima (YYYY-MM-DD). */
export function limaTodayKey(now: Date = new Date()): string {
  return DATE_KEY_FMT.format(now);
}

/**
 * Rango UTC exacto del mes calendario de Lima.
 * Lima es UTC-5 todo el año (sin horario de verano), así que el mes empieza
 * a las 05:00 UTC del día 1 y termina a las 05:00 UTC del día 1 siguiente.
 */
export function limaMonthRange(
  year: number,
  monthIndex: number,
): { startIso: string; endIso: string } {
  const start = new Date(Date.UTC(year, monthIndex, 1, 5, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1, 5, 0, 0, 0));
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function weekdayLabel(dateKey: string): string {
  const [y = 1970, m = 1, d = 1] = dateKey.split("-").map(Number);
  return WEEKDAY_LABELS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] ?? "";
}

export const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Setiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function monthLabel(year: number, monthIndex: number): string {
  return `${MONTH_NAMES[monthIndex] ?? ""} ${year}`;
}

// ---------------------------------------------------------------
// Cálculo de un turno
// ---------------------------------------------------------------
export type AttendanceIncident =
  | "sin_salida"
  | "duracion_inusual"
  | "sin_minutos"
  | "duplicado";

export const INCIDENT_LABELS: Record<AttendanceIncident, string> = {
  sin_salida: "Sin salida registrada",
  duracion_inusual: "Duración inusual (más de 14 h)",
  sin_minutos: "Sin tiempo registrado",
  duplicado: "Fichajes superpuestos (doble marcaje)",
};

export interface TeacherShiftLike {
  id: string;
  teacher_id?: string | null;
  teacher_name?: string | null;
  clock_in: string;
  clock_out?: string | null;
  break_minutes?: number | null;
  total_minutes_worked?: number | null;
  status?: string | null;
  origin_device?: string | null;
}

export interface AttendanceShiftRow {
  id: string;
  dateKey: string;
  weekday: string;
  entrada: string;
  salida: string;
  breakMinutes: number;
  minutes: number;
  hoursLabel: string;
  /** `null` = turno válido; si no, requiere regularización de Dirección. */
  incident: AttendanceIncident | null;
  /** Minutos crudos cuando el turno es válido; `null` si es incidencia. */
  countedMinutes: number | null;
  device: string;
  isOpen: boolean;
}

function resolveDevice(raw?: string | null): string {
  if (!raw) return "Sede";
  try {
    const parsed = JSON.parse(raw) as { device?: string };
    const device = parsed?.device;
    if (device === "kiosk_mobile") return "Móvil docente";
    if (device === "admin_header") return "Panel admin";
    if (device) return device;
  } catch {
    /* texto plano */
  }
  return raw;
}

export function computeShiftMinutes(shift: TeacherShiftLike): number {
  // Turno abierto: todavía no hay horas cerradas (se muestra como incidencia).
  if (!shift.clock_out) return 0;

  // El total persistido es el registro oficial del fichaje: es el valor con el
  // que se liquidó el turno en su momento. Se prefiere siempre sobre el cálculo
  // por timestamps, que trunca segundos y pierde ~1 min por turno (en setiembre
  // de Nathaly eso restaba 9 minutos al mes y no cuadraba con la base).
  const stored = shift.total_minutes_worked || 0;
  if (stored > 0) return stored;

  // Respaldo para registros antiguos que no guardaron el total.
  const inMs = new Date(shift.clock_in).getTime();
  const outMs = new Date(shift.clock_out).getTime();
  if (Number.isNaN(inMs) || Number.isNaN(outMs)) return 0;
  const diff = Math.floor((outMs - inMs) / 60000) - (shift.break_minutes || 0);
  return diff > 0 ? diff : 0;
}

export function formatDuration(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function toRow(shift: TeacherShiftLike): AttendanceShiftRow | null {
  const dateKey = limaDateKey(shift.clock_in);
  if (!dateKey) return null;

  const minutes = computeShiftMinutes(shift);
  const isOpen = !shift.clock_out;

  let incident: AttendanceIncident | null = null;
  if (isOpen) incident = "sin_salida";
  else if (minutes > MAX_SHIFT_HOURS * 60) incident = "duracion_inusual";
  else if (minutes <= 0) incident = "sin_minutos";

  return {
    id: shift.id,
    dateKey,
    weekday: weekdayLabel(dateKey),
    entrada: limaTimeHM(shift.clock_in),
    salida: shift.clock_out ? limaTimeHM(shift.clock_out) : "",
    breakMinutes: shift.break_minutes || 0,
    minutes,
    hoursLabel: isOpen ? "—" : formatDuration(minutes),
    incident,
    countedMinutes: incident ? null : minutes,
    device: resolveDevice(shift.origin_device),
    isOpen,
  };
}

// ---------------------------------------------------------------
// Proyección de días con clase programada
// ---------------------------------------------------------------
function dayCodeOfLesson(day?: string | null): number {
  const value = normalizePersonName(day);
  const map: Record<string, number> = {
    dom: 0,
    domingo: 0,
    lun: 1,
    lunes: 1,
    mar: 2,
    martes: 2,
    mie: 3,
    miercoles: 3,
    jue: 4,
    jueves: 4,
    vie: 5,
    viernes: 5,
    sab: 6,
    sabado: 6,
  };
  return map[value] ?? -1;
}

/**
 * Días del mes en los que el perfil tenía clase agendada, según la plantilla
 * del horario (lecciones recurrentes + sesiones con fecha exacta).
 *
 * Es una proyección de calendario, NO el motor de cuota contractual. Se usa
 * únicamente para señalar "día con clase sin fichaje" y se presenta como
 * "Por regularizar", nunca como una falta disciplinaria.
 */
export function projectScheduledDates(
  lessons: ScheduledLesson[] | undefined,
  profile: AttendanceProfile,
  year: number,
  monthIndex: number,
  todayKey: string = limaTodayKey(),
): string[] {
  if (!lessons || lessons.length === 0) return [];

  const aliases = profile.aliases.map(normalizePersonName);
  const mine = lessons.filter((lesson) => {
    if (lesson.status === "cancelada") return false;
    const teacher = normalizePersonName(lesson.teacher);
    return aliases.some((alias) => teacher.includes(alias));
  });
  if (mine.length === 0) return [];

  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const found = new Set<string>();

  for (const lesson of mine) {
    if (lesson.dateStr) {
      if (lesson.dateStr.startsWith(monthPrefix) && lesson.dateStr <= todayKey) {
        found.add(lesson.dateStr);
      }
      continue;
    }

    const target = dayCodeOfLesson(lesson.day);
    if (target < 0) continue;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${monthPrefix}-${String(day).padStart(2, "0")}`;
      if (dateKey > todayKey) continue;
      if (new Date(Date.UTC(year, monthIndex, day)).getUTCDay() !== target) continue;
      if (lesson.effectiveFrom && dateKey < lesson.effectiveFrom) continue;
      if (lesson.effectiveUntil && dateKey > lesson.effectiveUntil) continue;
      if (lesson.excludedDates?.includes(dateKey)) continue;
      found.add(dateKey);
    }
  }

  return [...found].sort();
}

// ---------------------------------------------------------------
// Reporte mensual
// ---------------------------------------------------------------
export interface AttendanceMonthTotals {
  shifts: number;
  validShifts: number;
  incidentShifts: number;
  /** Minutos de turnos válidos (los que suman al total de horas). */
  validMinutes: number;
  /** Minutos crudos de los turnos con incidencia (informativos). */
  incidentMinutes: number;
  attendedDays: number;
  missingDays: number;
  avgMinutesPerValidShift: number;
}

export interface AttendanceMonthReport {
  profile: AttendanceProfile;
  year: number;
  monthIndex: number;
  monthLabel: string;
  rows: AttendanceShiftRow[];
  incidents: AttendanceShiftRow[];
  totals: AttendanceMonthTotals;
  scheduledDates: string[];
  /** Días con clase programada sin ningún fichaje. */
  missingDates: string[];
  generatedAtIso: string;
}

export function buildMonthlyAttendance(params: {
  shifts: TeacherShiftLike[];
  profile: AttendanceProfile;
  year: number;
  monthIndex: number;
  scheduledLessons?: ScheduledLesson[];
  todayKey?: string;
  now?: Date;
}): AttendanceMonthReport {
  const { shifts, profile, year, monthIndex, scheduledLessons } = params;
  const now = params.now ?? new Date();
  const todayKey = params.todayKey ?? limaTodayKey(now);
  const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

  const monthShifts = shifts.filter((shift) => {
    const key = limaMonthKey(shift.clock_in);
    return key === monthPrefix;
  });

  const rows = monthShifts
    .map(toRow)
    .filter((row): row is AttendanceShiftRow => row !== null)
    .sort((a, b) => {
      if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
      return a.entrada.localeCompare(b.entrada);
    });

  // Duplicados del mismo día: solo se marcan cuando hay superposición real
  // (doble marcaje desde dos dispositivos) o cuando uno de los registros está
  // abierto. Dos turnos separados el mismo día son jornada partida válida y
  // suman sus horas.
  //
  // Se marca ÚNICAMENTE el par que se superpone: un turno real de 4 h el mismo
  // día que dos micro-marcajes solapados sigue siendo válido (no se castiga
  // toda la jornada por un par de pruebas del kiosco).
  const rawByDate = new Map<string, TeacherShiftLike[]>();
  for (const shift of monthShifts) {
    const key = limaDateKey(shift.clock_in);
    if (!key) continue;
    const list = rawByDate.get(key) ?? [];
    list.push(shift);
    rawByDate.set(key, list);
  }
  const duplicateIds = new Set<string>();
  for (const list of rawByDate.values()) {
    if (list.length < 2) continue;
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      if (!a) continue;
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j];
        if (!b) continue;
        const overlaps =
          !a.clock_out || !b.clock_out
            ? true
            : new Date(a.clock_in).getTime() < new Date(b.clock_out).getTime() &&
              new Date(b.clock_in).getTime() < new Date(a.clock_out).getTime();
        if (!overlaps) continue;
        duplicateIds.add(a.id);
        duplicateIds.add(b.id);
      }
    }
  }
  for (const row of rows) {
    if (duplicateIds.has(row.id) && !row.incident) {
      row.incident = "duplicado";
      row.countedMinutes = null;
    }
  }

  const incidents = rows.filter((row) => row.incident !== null);
  const validRows = rows.filter((row) => row.incident === null);

  const validMinutes = validRows.reduce((sum, row) => sum + (row.countedMinutes || 0), 0);
  const incidentMinutes = incidents.reduce((sum, row) => sum + row.minutes, 0);

  const scheduledDates = projectScheduledDates(
    scheduledLessons,
    profile,
    year,
    monthIndex,
    todayKey,
  );
  const attendedDateSet = new Set(rows.map((row) => row.dateKey));
  const missingDates = scheduledDates.filter((dateKey) => !attendedDateSet.has(dateKey));

  return {
    profile,
    year,
    monthIndex,
    monthLabel: monthLabel(year, monthIndex),
    rows,
    incidents,
    totals: {
      shifts: rows.length,
      validShifts: validRows.length,
      incidentShifts: incidents.length,
      validMinutes,
      incidentMinutes,
      attendedDays: attendedDateSet.size,
      missingDays: missingDates.length,
      avgMinutesPerValidShift:
        validRows.length > 0 ? Math.round(validMinutes / validRows.length) : 0,
    },
    scheduledDates,
    missingDates,
    generatedAtIso: now.toISOString(),
  };
}

// ---------------------------------------------------------------
// Formatos de salida (fuente única)
// ---------------------------------------------------------------
const ATTENDANCE_DOC_TITLE = "REPORTE MENSUAL DE ASISTENCIA DOCENTE";

function csvCell(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function buildAttendanceCSV(report: AttendanceMonthReport): string {
  const lines: string[] = [];
  lines.push(csvCell(`VIBRA MUSIC — ${ATTENDANCE_DOC_TITLE}`));
  lines.push(`${csvCell("Colaborador")},${csvCell(report.profile.label)}`);
  lines.push(`${csvCell("Área")},${csvCell(report.profile.area)}`);
  lines.push(`${csvCell("Periodo")},${csvCell(report.monthLabel)}`);
  lines.push(
    `${csvCell("Emitido")},${csvCell(
      new Date(report.generatedAtIso).toLocaleString("es-PE", { timeZone: LIMA_TZ }),
    )}`,
  );
  lines.push(`${csvCell("Fuente")},${csvCell("teacher_time_logs (PostgreSQL / Insforge)")}`);
  lines.push("");

  lines.push(
    [
      "Fecha",
      "Día",
      "Entrada",
      "Salida",
      "Pausa (min)",
      "Horas",
      "Estado",
      "Origen",
      "Observación",
    ]
      .map(csvCell)
      .join(","),
  );

  for (const row of report.rows) {
    lines.push(
      [
        row.dateKey,
        row.weekday,
        row.entrada,
        row.salida || "—",
        row.breakMinutes,
        row.incident ? `(${row.hoursLabel})` : row.hoursLabel,
        row.incident ? "Con incidencia" : "Válido",
        row.device,
        row.incident ? INCIDENT_LABELS[row.incident] : "",
      ]
        .map(csvCell)
        .join(","),
    );
  }

  for (const dateKey of report.missingDates) {
    lines.push(
      [
        dateKey,
        weekdayLabel(dateKey),
        "—",
        "—",
        0,
        "—",
        "Por regularizar",
        "—",
        "Día con clase programada sin fichaje",
      ]
        .map(csvCell)
        .join(","),
    );
  }

  lines.push("");
  lines.push(`${csvCell("Turnos registrados")},${csvCell(report.totals.shifts)}`);
  lines.push(`${csvCell("Turnos válidos")},${csvCell(report.totals.validShifts)}`);
  lines.push(`${csvCell("Turnos con incidencia")},${csvCell(report.totals.incidentShifts)}`);
  lines.push(`${csvCell("Horas registradas")},${csvCell(formatDuration(report.totals.validMinutes))}`);
  lines.push(`${csvCell("Días asistidos")},${csvCell(report.totals.attendedDays)}`);
  lines.push(`${csvCell("Días por regularizar")},${csvCell(report.totals.missingDays)}`);
  lines.push("");
  lines.push(
    csvCell(
      "Las horas de los turnos con incidencia no se suman al total hasta que Dirección las regularice.",
    ),
  );

  return `\uFEFF${lines.join("\r\n")}`;
}

/**
 * Consolidado de varios perfiles en un solo CSV (uso de Dirección).
 *
 * Mantiene el mismo criterio que el reporte individual: los turnos con
 * incidencia van entre paréntesis y no suman al total.
 */
export function buildAttendanceRosterCSV(reports: AttendanceMonthReport[]): string {
  const lines: string[] = [];
  const period = reports[0]?.monthLabel ?? "";
  lines.push(csvCell(`VIBRA MUSIC — ${ATTENDANCE_DOC_TITLE} · CONSOLIDADO`));
  lines.push(`${csvCell("Periodo")},${csvCell(period)}`);
  lines.push(
    `${csvCell("Emitido")},${csvCell(new Date().toLocaleString("es-PE", { timeZone: LIMA_TZ }))}`,
  );
  lines.push(`${csvCell("Fuente")},${csvCell("teacher_time_logs (PostgreSQL / Insforge)")}`);
  lines.push("");

  lines.push(
    ["Colaborador", "Área", "Turnos", "Válidos", "Incidencias", "Horas válidas", "Días asistidos", "Por regularizar"]
      .map(csvCell)
      .join(","),
  );
  for (const report of reports) {
    lines.push(
      [
        report.profile.label,
        report.profile.area,
        report.totals.shifts,
        report.totals.validShifts,
        report.totals.incidentShifts,
        formatDuration(report.totals.validMinutes),
        report.totals.attendedDays,
        report.totals.missingDays,
      ]
        .map(csvCell)
        .join(","),
    );
  }

  lines.push("");
  lines.push(
    ["Colaborador", "Fecha", "Día", "Entrada", "Salida", "Horas", "Estado", "Observación"]
      .map(csvCell)
      .join(","),
  );

  for (const report of reports) {
    for (const row of report.rows) {
      lines.push(
        [
          report.profile.label,
          row.dateKey,
          row.weekday,
          row.entrada,
          row.salida || "—",
          row.incident ? `(${row.hoursLabel})` : row.hoursLabel,
          row.incident ? "Con incidencia" : "Válido",
          row.incident ? INCIDENT_LABELS[row.incident] : "",
        ]
          .map(csvCell)
          .join(","),
      );
    }
    for (const dateKey of report.missingDates) {
      lines.push(
        [
          report.profile.label,
          dateKey,
          weekdayLabel(dateKey),
          "—",
          "—",
          "—",
          "Por regularizar",
          "Día con clase programada sin fichaje",
        ]
          .map(csvCell)
          .join(","),
      );
    }
  }

  lines.push("");
  lines.push(
    csvCell(
      "Las horas de los turnos con incidencia no se suman al total hasta que Dirección las regularice.",
    ),
  );
  return `\uFEFF${lines.join("\r\n")}`;
}

export function buildAttendanceMarkdown(report: AttendanceMonthReport): string {
  const out: string[] = [];
  out.push(`# Asistencia docente — ${report.profile.label}`);
  out.push("");
  out.push(`- **Periodo:** ${report.monthLabel}`);
  out.push(`- **Área:** ${report.profile.area}`);
  out.push(`- **Colaborador (UUID):** \`${report.profile.id}\``);
  out.push(`- **Fuente:** \`teacher_time_logs\` (PostgreSQL / Insforge)`);
  out.push(
    `- **Emitido:** ${new Date(report.generatedAtIso).toLocaleString("es-PE", { timeZone: LIMA_TZ })}`,
  );
  out.push("- **Moneda:** no aplica (documento de horario, sin importes)");
  out.push("");
  out.push("## Resumen");
  out.push("");
  out.push("| Métrica | Valor |");
  out.push("|---|---|");
  out.push(`| Turnos registrados | ${report.totals.shifts} |`);
  out.push(`| Turnos válidos | ${report.totals.validShifts} |`);
  out.push(`| Turnos con incidencia | ${report.totals.incidentShifts} |`);
  out.push(`| Horas registradas | ${formatDuration(report.totals.validMinutes)} |`);
  out.push(`| Días asistidos | ${report.totals.attendedDays} |`);
  out.push(`| Días por regularizar | ${report.totals.missingDays} |`);
  out.push("");
  out.push("## Fichajes");
  out.push("");
  out.push("| Fecha | Día | Entrada | Salida | Horas | Origen | Observación |");
  out.push("|---|---|---|---|---|---|---|");
  for (const row of report.rows) {
    out.push(
      `| ${row.dateKey} | ${row.weekday} | ${row.entrada} | ${row.salida || "—"} | ${
        row.incident ? `(${row.hoursLabel})` : row.hoursLabel
      } | ${row.device} | ${row.incident ? INCIDENT_LABELS[row.incident] : "—"} |`,
    );
  }
  if (report.missingDates.length > 0) {
    out.push("");
    out.push("## Días con clase programada sin fichaje (por regularizar)");
    out.push("");
    for (const dateKey of report.missingDates) {
      out.push(`- ${dateKey} (${weekdayLabel(dateKey)})`);
    }
  }
  out.push("");
  out.push(
    "> Los turnos con incidencia se muestran entre paréntesis y no se suman al total de horas hasta la regularización de Dirección.",
  );
  out.push("");
  return out.join("\n");
}

export function buildAttendanceWhatsApp(report: AttendanceMonthReport): string {
  const lines: string[] = [];
  lines.push(`Hola ${report.profile.name} 👋`);
  lines.push(`Te comparto tu asistencia de *${report.monthLabel}* registrada en Vibra Music Staff:`);
  lines.push("");
  lines.push(`🗓️ Días asistidos: *${report.totals.attendedDays}*`);
  lines.push(`⏱️ Horas registradas: *${formatDuration(report.totals.validMinutes)}*`);
  lines.push(`🕐 Turnos: *${report.totals.shifts}*`);
  lines.push("");
  lines.push("*Detalle de fichajes:*");
  for (const row of report.rows) {
    const mark = row.incident ? " ⚠️" : "";
    lines.push(
      `• ${row.weekday} ${row.dateKey.slice(8)}/${row.dateKey.slice(5, 7)} · ${row.entrada} → ${
        row.salida || "s/salida"
      } · ${row.hoursLabel}${mark}`,
    );
  }
  if (report.missingDates.length > 0) {
    lines.push("");
    lines.push("*Días sin marcaje (por regularizar):*");
    lines.push(report.missingDates.map((d) => `${d.slice(8)}/${d.slice(5, 7)}`).join(", "));
  }
  if (report.totals.incidentShifts > 0) {
    lines.push("");
    lines.push(
      `⚠️ ${report.totals.incidentShifts} turno(s) con incidencia requieren revisión con Dirección.`,
    );
  }
  lines.push("");
  lines.push("Cualquier corrección de horario la gestiona Dirección desde el sistema.");
  return lines.join("\n");
}

// ---------------------------------------------------------------
// PDF / A4 (ventana de impresión autocontenida)
// ---------------------------------------------------------------
function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildAttendancePrintHtml(report: AttendanceMonthReport): string {
  const emitted = new Date(report.generatedAtIso).toLocaleString("es-PE", { timeZone: LIMA_TZ });

  const rows = report.rows
    .map(
      (row) => `<tr class="${row.incident ? "incident" : ""}">
        <td>${escapeHtml(row.dateKey)}</td>
        <td>${escapeHtml(row.weekday)}</td>
        <td class="mono">${escapeHtml(row.entrada)}</td>
        <td class="mono">${escapeHtml(row.salida || "—")}</td>
        <td class="num">${escapeHtml(row.incident ? `(${row.hoursLabel})` : row.hoursLabel)}</td>
        <td>${escapeHtml(row.device)}</td>
        <td>${escapeHtml(row.incident ? INCIDENT_LABELS[row.incident] : "—")}</td>
      </tr>`,
    )
    .join("");

  const missing = report.missingDates
    .map(
      (dateKey) =>
        `<tr class="missing"><td>${escapeHtml(dateKey)}</td><td>${escapeHtml(
          weekdayLabel(dateKey),
        )}</td><td colspan="3">Sin marcaje de entrada</td><td>—</td><td>Por regularizar</td></tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8" />
<title>Asistencia ${escapeHtml(report.profile.label)} — ${escapeHtml(report.monthLabel)}</title>
<style>
  @page { size: A4 portrait; margin: 12mm 10mm; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", system-ui, sans-serif; color: #15120f; margin: 0; font-size: 11px; }
  header { border-bottom: 3px solid #f47b20; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end; }
  .brand { font-size: 18px; font-weight: 800; letter-spacing: .5px; }
  .brand span { color: #f47b20; }
  .doc { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #555; }
  .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
  .card { border: 1px solid #e5e0d8; border-radius: 8px; padding: 7px 9px; background: #fff8ec; }
  .card b { display: block; font-size: 9px; text-transform: uppercase; color: #8a7f70; letter-spacing: .4px; }
  .card span { font-size: 12px; font-weight: 700; }
  .kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 12px; }
  .kpi { border: 1px solid #e5e0d8; border-radius: 8px; padding: 8px; text-align: center; }
  .kpi b { display: block; font-size: 8.5px; text-transform: uppercase; color: #8a7f70; }
  .kpi span { font-size: 15px; font-weight: 800; }
  h2 { font-size: 11px; text-transform: uppercase; letter-spacing: .6px; margin: 12px 0 5px; color: #15120f; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th, td { border: 1px solid #ded7cc; padding: 4px 5px; font-size: 9.5px; word-break: break-word; }
  th { background: #1a1410; color: #fff8ec; text-transform: uppercase; font-size: 8.5px; letter-spacing: .4px; }
  td.mono { font-family: ui-monospace, monospace; }
  td.num { text-align: right; font-weight: 700; }
  tr.incident td { background: #fff1e6; }
  tr.missing td { background: #eef4ff; }
  tfoot td { font-weight: 800; background: #fff8ec; }
  .note { margin-top: 10px; font-size: 9px; color: #6b6157; line-height: 1.45; }
  .signs { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 34px; }
  .sign { border-top: 1px solid #15120f; padding-top: 4px; text-align: center; font-size: 9.5px; }
</style></head>
<body>
  <header>
    <div>
      <div class="brand">VIBRA <span>MUSIC</span></div>
      <div class="doc">Reporte mensual de asistencia docente</div>
    </div>
    <div style="text-align:right;font-size:9.5px;color:#6b6157">
      <div><strong>${escapeHtml(report.monthLabel)}</strong></div>
      <div>Emitido: ${escapeHtml(emitted)}</div>
    </div>
  </header>

  <div class="meta">
    <div class="card"><b>Colaborador</b><span>${escapeHtml(report.profile.label)}</span></div>
    <div class="card"><b>Área</b><span>${escapeHtml(report.profile.area)}</span></div>
    <div class="card"><b>Periodo</b><span>${escapeHtml(report.monthLabel)}</span></div>
  </div>

  <div class="kpis">
    <div class="kpi"><b>Turnos</b><span>${report.totals.shifts}</span></div>
    <div class="kpi"><b>Horas registradas</b><span>${escapeHtml(formatDuration(report.totals.validMinutes))}</span></div>
    <div class="kpi"><b>Días asistidos</b><span>${report.totals.attendedDays}</span></div>
    <div class="kpi"><b>Promedio / turno</b><span>${escapeHtml(formatDuration(report.totals.avgMinutesPerValidShift))}</span></div>
    <div class="kpi"><b>Por regularizar</b><span>${report.totals.missingDays}</span></div>
  </div>

  <h2>Fichajes de entrada y salida</h2>
  <table>
    <colgroup>
      <col style="width:13%" /><col style="width:8%" /><col style="width:11%" /><col style="width:11%" />
      <col style="width:12%" /><col style="width:14%" /><col style="width:31%" />
    </colgroup>
    <thead><tr>
      <th>Fecha</th><th>Día</th><th>Entrada</th><th>Salida</th><th>Horas</th><th>Origen</th><th>Observación</th>
    </tr></thead>
    <tbody>${rows || `<tr><td colspan="7">Sin fichajes registrados en el periodo.</td></tr>`}${missing}</tbody>
    <tfoot><tr>
      <td colspan="4">Días asistidos: ${report.totals.attendedDays} · Turnos válidos: ${report.totals.validShifts}</td>
      <td class="num">${escapeHtml(formatDuration(report.totals.validMinutes))}</td>
      <td colspan="2">Días por regularizar: ${report.totals.missingDays}</td>
    </tr></tfoot>
  </table>

  <p class="note">
    Documento generado automáticamente desde Vibra Music Staff. Fuente: <strong>teacher_time_logs</strong>
    (PostgreSQL / Insforge). Horas en zona horaria de Lima (UTC-5). Los turnos marcados con incidencia
    se muestran entre paréntesis y no se suman al total hasta que Dirección los regularice.
    Este documento registra horario y días de asistencia; no contiene información económica.
  </p>

  <div class="signs">
    <div class="sign">Firma del colaborador<br />${escapeHtml(report.profile.label)}</div>
    <div class="sign">Dirección / Secretaría Vibra Music</div>
  </div>
</body></html>`;
}

/** Abre una ventana A4 lista para "Guardar como PDF". */
export function openAttendancePrintWindow(report: AttendanceMonthReport): void {
  if (typeof window === "undefined") return;
  const win = window.open("", "_blank", "width=900,height=1200");
  if (!win) return;
  win.document.open();
  win.document.write(buildAttendancePrintHtml(report));
  win.document.close();
  win.focus();
  setTimeout(() => {
    try {
      win.print();
    } catch {
      /* el usuario puede imprimir manualmente */
    }
  }, 350);
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function attendanceFileName(
  report: AttendanceMonthReport,
  extension: "csv" | "md",
): string {
  const month = `${report.year}-${String(report.monthIndex + 1).padStart(2, "0")}`;
  const person = normalizePersonName(report.profile.name).replace(/\s+/g, "-");
  return `asistencia-${person}-${month}.${extension}`;
}
