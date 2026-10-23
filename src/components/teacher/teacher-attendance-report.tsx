import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardCheck,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  MessageCircle,
  Printer,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import {
  getTeacherTimeLogs,
  type DBTeacherTimeLog,
} from "@/lib/services/time-tracking.service";
import {
  ATTENDANCE_PROFILES,
  INCIDENT_LABELS,
  attendanceFileName,
  buildAttendanceCSV,
  buildAttendanceMarkdown,
  buildAttendanceRosterCSV,
  buildAttendanceWhatsApp,
  buildMonthlyAttendance,
  downloadTextFile,
  formatDuration,
  limaMonthRange,
  limaTodayKey,
  monthLabel,
  normalizePersonName,
  openAttendancePrintWindow,
  resolveProfileForIdentity,
  shiftBelongsToProfile,
  weekdayLabel,
  MONTH_NAMES,
  type AttendanceMonthReport,
} from "@/lib/asistencia-docente";

/**
 * Reporte mensual de asistencia (fichajes) reutilizable.
 *
 * Una sola fuente de cálculo (`src/lib/asistencia-docente.ts`) y una sola
 * presentación para los dos consumidores:
 *   - `/teacher/nomina`  → el docente ve su propio mes (solo lectura).
 *   - `/admin/control-horario` → Dirección elige el perfil y descarga.
 *
 * Reglas de producto (ADR-0181):
 *   - Se muestran TODOS los fichajes y, aparte, los días con clase sin marcaje
 *     como "Por regularizar".
 *   - Un solo total de horas. Los turnos con incidencia se muestran entre
 *     paréntesis y no suman hasta la regularización de Dirección.
 *   - Cero soles: este documento es de horario, no de remuneración.
 */

const pad2 = (value: number) => String(value).padStart(2, "0");

function currentLimaMonth(): { year: number; monthIndex: number } {
  const key = limaTodayKey();
  return { year: Number(key.slice(0, 4)), monthIndex: Number(key.slice(5, 7)) - 1 };
}

function yearOptions(currentYear: number): number[] {
  const set = new Set<number>([2026, currentYear, currentYear + 1]);
  return [...set].sort((a, b) => a - b);
}

// ---------------------------------------------------------------
// Carga de turnos del mes (rango resuelto en el servidor)
// ---------------------------------------------------------------
function useMonthShifts(year: number, monthIndex: number) {
  const [shifts, setShifts] = useState<DBTeacherTimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let alive = true;
    const range = limaMonthRange(year, monthIndex);
    setLoading(true);
    getTeacherTimeLogs({
      rangeStart: range.startIso,
      rangeEnd: range.endIso,
      limit: 1000,
    })
      .then((list) => {
        if (!alive) return;
        setShifts(list);
        setError(null);
      })
      .catch((err) => {
        if (!alive) return;
        setShifts([]);
        setError(err instanceof Error ? err.message : "No se pudo leer el historial de fichajes.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [year, monthIndex, reloadKey]);

  // Refresco cuando el kiosco o el widget del header marcan entrada/salida.
  useEffect(() => {
    const onShiftUpdated = () => refresh();
    window.addEventListener("vibra-shift-updated", onShiftUpdated);
    return () => window.removeEventListener("vibra-shift-updated", onShiftUpdated);
  }, [refresh]);

  return { shifts, loading, error, refresh };
}

function useActiveSchedule() {
  const schedule = useAppStore((s) => s.schedule);
  const adminStudents = useAppStore((s) => s.adminStudents);

  return useMemo(() => {
    const activeNames = new Set(
      adminStudents
        .filter((student) => student.status === "activo")
        .map((student) => normalizePersonName(student.name)),
    );
    return schedule.filter((lesson) => activeNames.has(normalizePersonName(lesson.student)));
  }, [schedule, adminStudents]);
}

// ---------------------------------------------------------------
// Descargas (una sola implementación para docente y Dirección)
// ---------------------------------------------------------------
function downloadCSV(report: AttendanceMonthReport) {
  downloadTextFile(
    attendanceFileName(report, "csv"),
    buildAttendanceCSV(report),
    "text/csv;charset=utf-8;",
  );
  toast.success(`CSV descargado · ${report.profile.name} · ${report.monthLabel}`);
}

function downloadMarkdown(report: AttendanceMonthReport) {
  downloadTextFile(
    attendanceFileName(report, "md"),
    buildAttendanceMarkdown(report),
    "text/markdown;charset=utf-8;",
  );
  toast.success("Formato para auditoría descargado (.md)");
}

function printReport(report: AttendanceMonthReport) {
  openAttendancePrintWindow(report);
  toast.success("Abriendo la vista A4 para Guardar como PDF…");
}

async function copyWhatsApp(report: AttendanceMonthReport) {
  const text = buildAttendanceWhatsApp(report);
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Resumen copiado. Pégalo en WhatsApp.");
  } catch {
    toast.error("El navegador no permitió copiar. Usa el PDF o el CSV.");
  }
}

// ---------------------------------------------------------------
// Vista del reporte de un perfil
// ---------------------------------------------------------------
export function AttendanceMonthReportView({
  report,
  loading,
  onRefresh,
  showArea = true,
}: {
  report: AttendanceMonthReport;
  loading?: boolean;
  onRefresh?: () => void;
  showArea?: boolean;
}) {
  const { totals } = report;

  return (
    <div className="space-y-4">
      {/* Tarjeta cabecera + acciones */}
      <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-wider text-primary">
              Asistencia docente · {report.monthLabel}
            </p>
            <h2 className="text-lg sm:text-xl font-black text-foreground truncate">
              {report.profile.label}
            </h2>
            <p className="text-xs text-muted-foreground">
              {showArea ? `${report.profile.area} · ` : ""}
              Fichajes de entrada y salida registrados en el kiosco y el panel.
            </p>
          </div>

          {onRefresh && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              disabled={loading}
              className="h-11 min-h-[44px] gap-1.5 rounded-xl text-xs font-bold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
              Actualizar
            </Button>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          <div className="rounded-2xl border border-border bg-background p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Horas registradas
            </p>
            <p className="text-xl font-black text-primary tabular-nums">
              {formatDuration(totals.validMinutes)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Días asistidos
            </p>
            <p className="text-xl font-black text-foreground tabular-nums">
              {totals.attendedDays}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Turnos
            </p>
            <p className="text-xl font-black text-foreground tabular-nums">{totals.shifts}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Promedio / turno
            </p>
            <p className="text-xl font-black text-foreground tabular-nums">
              {formatDuration(totals.avgMinutesPerValidShift)}
            </p>
          </div>
          <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">
              Por regularizar
            </p>
            <p className="text-xl font-black text-sky-700 dark:text-sky-300 tabular-nums">
              {totals.missingDays}
            </p>
          </div>
        </div>

        {/* Descargas */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => printReport(report)}
            className="h-11 min-h-[44px] gap-1.5 rounded-xl text-xs font-bold"
          >
            <Printer className="h-4 w-4" /> PDF / Imprimir A4
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadCSV(report)}
            className="h-11 min-h-[44px] gap-1.5 rounded-xl text-xs font-bold"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel (.CSV)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyWhatsApp(report)}
            className="h-11 min-h-[44px] gap-1.5 rounded-xl text-xs font-bold"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" /> Copiar resumen
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => downloadMarkdown(report)}
            className="h-11 min-h-[44px] gap-1.5 rounded-xl text-xs font-bold text-muted-foreground"
          >
            <FileText className="h-4 w-4" /> .md
          </Button>
        </div>
      </div>

      {/* Incidencias */}
      {totals.incidentShifts > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            {totals.incidentShifts} turno(s) con incidencia
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-200/90">
            Se muestran entre paréntesis y <strong>no se suman</strong> al total de horas hasta que
            Dirección los regularice. No se ha corregido nada en silencio.
          </p>
        </div>
      )}

      {/* Fichajes */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <h3 className="flex items-center gap-1.5 text-sm font-black text-foreground">
            <Clock className="h-4 w-4 text-primary" /> Fichajes del mes
          </h3>
          <span className="text-[11px] font-bold text-muted-foreground">
            {totals.shifts} registro(s)
          </span>
        </div>

        {report.rows.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground/30" />
            <p className="mt-2 text-xs font-bold text-foreground">
              Sin fichajes en {report.monthLabel}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Si trabajaste ese mes y no aparece ningún turno, avisa a Dirección para regularizarlo.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {report.rows.map((row) => {
              const incident = row.incident;
              return (
                <li
                  key={row.id}
                  className={`px-4 py-3 ${incident ? "bg-amber-500/5" : "hover:bg-muted/30"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-foreground">
                        {row.weekday} {row.dateKey.slice(8)}/{row.dateKey.slice(5, 7)}/{row.dateKey.slice(0, 4)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        <span className="font-mono font-bold text-foreground">{row.entrada || "—"}</span>
                        <span className="mx-1">→</span>
                        <span className="font-mono font-bold text-foreground">
                          {row.isOpen ? "sin salida" : row.salida || "—"}
                        </span>
                        {row.breakMinutes > 0 && (
                          <span className="ml-2">· pausa {row.breakMinutes} min</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`font-mono text-sm font-black tabular-nums ${
                          incident ? "text-amber-700 dark:text-amber-300" : "text-primary"
                        }`}
                      >
                        {incident ? `(${row.hoursLabel})` : row.hoursLabel}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{row.device}</p>
                    </div>
                  </div>
                  {incident && (
                    <p className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="h-3 w-3" />
                      {INCIDENT_LABELS[incident]}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-3">
          <p className="text-[11px] font-bold text-foreground">
            Días asistidos: {totals.attendedDays} · Turnos válidos: {totals.validShifts}
          </p>
          <p className="font-mono text-sm font-black text-primary">
            Total: {formatDuration(totals.validMinutes)}
          </p>
        </div>
      </div>

      {/* Días sin marcaje */}
      <div className="overflow-hidden rounded-3xl border border-sky-500/30 bg-card">
        <div className="flex items-center justify-between gap-2 border-b border-sky-500/20 px-4 py-3">
          <h3 className="flex items-center gap-1.5 text-sm font-black text-foreground">
            <CalendarDays className="h-4 w-4 text-sky-600" /> Días con clase sin marcaje
          </h3>
          <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-black text-sky-700 dark:text-sky-300">
            {totals.missingDays} por regularizar
          </span>
        </div>

        {report.missingDates.length === 0 ? (
          <p className="px-4 py-5 text-[11px] text-muted-foreground">
            Sin días pendientes: todos los días con clase programada del periodo tienen su fichaje.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-sky-500/10">
              {report.missingDates.map((dateKey) => (
                <li key={dateKey} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div>
                    <p className="text-xs font-black text-foreground">
                      {weekdayLabel(dateKey)} {dateKey.slice(8)}/{dateKey.slice(5, 7)}/{dateKey.slice(0, 4)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Día con clase programada · no hay entrada registrada
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300">
                    Por regularizar
                  </span>
                </li>
              ))}
            </ul>
            <p className="border-t border-sky-500/10 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
              Este listado es un recordatorio, no una sanción: son días con clase en el horario que
              no tienen marcaje de entrada. Dirección puede corregirlos desde el control horario.
            </p>
          </>
        )}
      </div>

      <p className="flex items-start gap-1.5 rounded-2xl border border-border bg-muted/30 px-3.5 py-3 text-[10.5px] leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
        <span>
          Documento generado desde <strong>Vibra Music Staff</strong> · Fuente:{" "}
          <code className="font-mono">teacher_time_logs</code> (PostgreSQL). Horas en zona horaria de
          Lima (UTC-5). No incluye información económica ni descuentos: es tu constancia de horario.
        </span>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------
// Modo docente: mi asistencia (/teacher/nomina)
// ---------------------------------------------------------------
export function TeacherAttendanceReport() {
  const currentUser = useAppStore((s) => s.currentUser);
  const activeSchedule = useActiveSchedule();

  const now = currentLimaMonth();
  const [year, setYear] = useState(now.year);
  const [monthIndex, setMonthIndex] = useState(now.monthIndex);

  const profile = useMemo(
    () => resolveProfileForIdentity(currentUser?.email, currentUser?.name),
    [currentUser?.email, currentUser?.name],
  );

  const { shifts, loading, error, refresh } = useMonthShifts(year, monthIndex);

  const report = useMemo(() => {
    if (!profile) return null;
    return buildMonthlyAttendance({
      shifts: shifts.filter((shift) => shiftBelongsToProfile(shift, profile)),
      profile,
      year,
      monthIndex,
      scheduledLessons: activeSchedule,
    });
  }, [profile, shifts, year, monthIndex, activeSchedule]);

  if (!profile) {
    return (
      <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-2">
        <p className="flex items-center gap-2 text-sm font-black text-amber-700 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4" /> No pudimos identificar tu perfil de asistencia
        </p>
        <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-200/90">
          Tu cuenta ({currentUser?.email || "sin correo"}) no está vinculada a un perfil con fichaje.
          Pide a Dirección que revise tu invitación; tus turnos ya registrados no se pierden.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-black text-foreground">Mi asistencia</h1>
        <p className="text-xs text-muted-foreground">
          Tus fichajes de entrada y salida, mes por mes. Descarga tu constancia cuando la necesites.
        </p>
      </div>

      <MonthPicker
        year={year}
        monthIndex={monthIndex}
        onChange={(nextYear, nextMonth) => {
          setYear(nextYear);
          setMonthIndex(nextMonth);
        }}
      />

      {error && (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-[11px] font-bold text-destructive">
          {error}
        </p>
      )}

      {loading && !report ? (
        <div className="flex items-center justify-center gap-2 rounded-3xl border border-border bg-card py-12 text-xs font-bold text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando tus fichajes…
        </div>
      ) : report ? (
        <AttendanceMonthReportView
          report={report}
          loading={loading}
          onRefresh={refresh}
          showArea={false}
        />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------
// Selector de mes/año compartido
// ---------------------------------------------------------------
export function MonthPicker({
  year,
  monthIndex,
  onChange,
  compact = false,
}: {
  year: number;
  monthIndex: number;
  onChange: (year: number, monthIndex: number) => void;
  compact?: boolean;
}) {
  const currentYear = Number(limaTodayKey().slice(0, 4));
  const years = useMemo(() => yearOptions(currentYear), [currentYear]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5">
        <label
          htmlFor="attendance-month"
          className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground"
        >
          <CalendarDays className="mr-1 inline h-3.5 w-3.5 text-primary" />
          Mes
        </label>
        <select
          id="attendance-month"
          value={monthIndex}
          onChange={(event) => onChange(year, Number(event.target.value))}
          className={`rounded-xl border border-input bg-background px-2.5 font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${
            compact ? "h-9 text-[11px]" : "h-11 text-xs"
          }`}
        >
          {MONTH_NAMES.map((name, index) => (
            <option key={name} value={index}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <label
          htmlFor="attendance-year"
          className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground"
        >
          Año
        </label>
        <select
          id="attendance-year"
          value={year}
          onChange={(event) => onChange(Number(event.target.value), monthIndex)}
          className={`rounded-xl border border-input bg-background px-2.5 font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${
            compact ? "h-9 text-[11px]" : "h-11 text-xs"
          }`}
        >
          {years.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <span className="text-[11px] font-bold text-muted-foreground">
        {monthLabel(year, monthIndex)}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------
// Modo Dirección: roster completo y descarga por perfil
// ---------------------------------------------------------------
export function AttendanceProfilesPanel() {
  const now = currentLimaMonth();
  const [year, setYear] = useState(now.year);
  const [monthIndex, setMonthIndex] = useState(now.monthIndex);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    ATTENDANCE_PROFILES[0]?.id ?? "todos",
  );

  const activeSchedule = useActiveSchedule();
  const { shifts, loading, error, refresh } = useMonthShifts(year, monthIndex);

  const reports = useMemo(() => {
    return ATTENDANCE_PROFILES.map((profile) => {
      const profileShifts = shifts.filter((shift) => shiftBelongsToProfile(shift, profile));
      return buildMonthlyAttendance({
        shifts: profileShifts,
        profile,
        year,
        monthIndex,
        scheduledLessons: activeSchedule,
      });
    }).filter((report) => {
      // "Turnos sin identidad" solo aparece si realmente hay fichajes sueltos.
      if (report.profile.area === "Sin identificar") return report.totals.shifts > 0;
      return true;
    });
  }, [shifts, year, monthIndex, activeSchedule]);

  const selectedReport =
    reports.find((report) => report.profile.id === selectedProfileId) ?? reports[0] ?? null;

  const globalTotals = useMemo(() => {
    return reports.reduce(
      (acc, report) => {
        acc.validMinutes += report.totals.validMinutes;
        acc.incidentShifts += report.totals.incidentShifts;
        acc.missingDays += report.totals.missingDays;
        acc.shifts += report.totals.shifts;
        if (report.totals.shifts > 0) acc.activeProfiles += 1;
        return acc;
      },
      { validMinutes: 0, incidentShifts: 0, missingDays: 0, shifts: 0, activeProfiles: 0 },
    );
  }, [reports]);

  const handleRosterCSV = () => {
    const withShifts = reports.filter((report) => report.totals.shifts > 0 || report.totals.missingDays > 0);
    if (withShifts.length === 0) {
      toast.info("No hay fichajes en el mes seleccionado.");
      return;
    }
    downloadTextFile(
      `asistencia-consolidado-${year}-${pad2(monthIndex + 1)}.csv`,
      buildAttendanceRosterCSV(withShifts),
      "text/csv;charset=utf-8;",
    );
    toast.success("Consolidado descargado (.CSV)");
  };

  return (
    <div className="space-y-5">
      {/* Cabecera del panel */}
      <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-primary">
              Asistencia por perfil
            </p>
            <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Fichajes de todo el equipo —{" "}
              {monthLabel(year, monthIndex)}
            </h2>
            <p className="text-xs text-muted-foreground">
              Docentes, secretaría, dirección y marketing. Descarga el reporte de cualquier perfil sin
              montos: la valorización económica es exclusiva de Dirección.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={refresh}
              disabled={loading}
              className="h-9 gap-1.5 rounded-xl text-xs font-bold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
              Actualizar
            </Button>
            <Button
              size="sm"
              onClick={handleRosterCSV}
              className="h-9 gap-1.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <Download className="h-3.5 w-3.5" /> Consolidado (.CSV)
            </Button>
          </div>
        </div>

        <MonthPicker
          year={year}
          monthIndex={monthIndex}
          onChange={(nextYear, nextMonth) => {
            setYear(nextYear);
            setMonthIndex(nextMonth);
          }}
          compact
        />

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-background p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Horas registradas (válidas)
            </p>
            <p className="text-xl font-black text-primary tabular-nums">
              {formatDuration(globalTotals.validMinutes)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Turnos del mes
            </p>
            <p className="text-xl font-black text-foreground tabular-nums">
              {globalTotals.shifts}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
              Turnos con incidencia
            </p>
            <p className="text-xl font-black text-amber-700 dark:text-amber-300 tabular-nums">
              {globalTotals.incidentShifts}
            </p>
          </div>
          <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">
              Días por regularizar
            </p>
            <p className="text-xl font-black text-sky-700 dark:text-sky-300 tabular-nums">
              {globalTotals.missingDays}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-[11px] font-bold text-destructive">
          {error}
        </p>
      )}

      {/* Roster */}
      <div className="overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-muted text-[10px] font-black uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5">Colaborador</th>
              <th className="px-3 py-2.5">Área</th>
              <th className="px-3 py-2.5 text-right">Turnos</th>
              <th className="px-3 py-2.5 text-right">Horas</th>
              <th className="px-3 py-2.5 text-right">Días</th>
              <th className="px-3 py-2.5 text-right">Incidencias</th>
              <th className="px-3 py-2.5 text-right">Por regularizar</th>
              <th className="px-3 py-2.5 text-right">Descargar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reports.map((report) => {
              const isSelected = selectedReport?.profile.id === report.profile.id;
              return (
                <tr
                  key={report.profile.id}
                  onClick={() => setSelectedProfileId(report.profile.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? "bg-primary/5" : "hover:bg-muted/40"
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <p className="font-black text-foreground">{report.profile.label}</p>
                    {report.totals.shifts === 0 && (
                      <p className="text-[10px] text-muted-foreground">Sin fichajes en el mes</p>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{report.profile.area}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold tabular-nums">
                    {report.totals.shifts}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-black text-primary tabular-nums">
                    {formatDuration(report.totals.validMinutes)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                    {report.totals.attendedDays}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                    {report.totals.incidentShifts > 0 ? (
                      <span className="font-bold text-amber-700 dark:text-amber-300">
                        {report.totals.incidentShifts}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                    {report.totals.missingDays > 0 ? (
                      <span className="font-bold text-sky-700 dark:text-sky-300">
                        {report.totals.missingDays}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          downloadCSV(report);
                        }}
                        className="h-8 gap-1 rounded-lg px-2 text-[10px] font-bold"
                        title={`Descargar CSV de ${report.profile.name}`}
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> CSV
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          printReport(report);
                        }}
                        className="h-8 gap-1 rounded-lg px-2 text-[10px] font-bold"
                        title={`Descargar PDF de ${report.profile.name}`}
                      >
                        <Printer className="h-3.5 w-3.5 text-primary" /> PDF
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detalle del perfil seleccionado */}
      {selectedReport && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-black text-foreground">
              <ClipboardCheck className="h-4 w-4 text-primary" /> Detalle por perfil
            </span>
            <select
              value={selectedReport.profile.id}
              onChange={(event) => setSelectedProfileId(event.target.value)}
              aria-label="Seleccionar perfil"
              className="h-11 min-h-[44px] rounded-xl border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {reports.map((report) => (
                <option key={report.profile.id} value={report.profile.id}>
                  {report.profile.label}
                </option>
              ))}
            </select>
          </div>

          <AttendanceMonthReportView report={selectedReport} loading={loading} onRefresh={refresh} />
        </div>
      )}
    </div>
  );
}
