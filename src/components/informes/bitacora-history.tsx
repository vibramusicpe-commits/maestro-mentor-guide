/**
 * ================================================================
 * bitacora-history.tsx — Historial de bitácoras clase por clase (ADR-0185)
 * ================================================================
 *
 * Muestra las bitácoras reales del rango visible, agrupadas por día, con su
 * contenido completo (tema, repertorio, criterios, tarea y comentario).
 *
 * Se usa en DOS lugares con el MISMO componente (ADR-0119.3):
 *   - `/admin/informes` → pestaña "Bitácora Diaria" (Dirección, todos los docentes)
 *   - `/teacher`        → "Mi bitácora" (solo lo del docente logueado)
 *
 * Reglas:
 *   - Solo lectura. No crea ni edita bitácoras.
 *   - Solo `is_test = false` (garantizado por `listBitacoras`).
 *   - CERO datos financieros.
 *   - UI amigable: filas táctiles de 44px, fechas en lenguaje humano
 *     ("Hoy", "Ayer", "vie 23 oct"), sin tablas apretadas en móvil.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Loader2, Music4 } from "lucide-react";
import { listBitacoras, groupBitacorasByDate } from "@/lib/services/bitacora.service";
import type { LessonEvaluationRow } from "@/lib/informes/types";
import { toIsoDate } from "@/lib/informes/utils";

const WEEKDAY_SHORT = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
// Índice 0 = enero. En Perú "set" es setiembre y "oct" octubre; deben ir en su
// posición exacta o las fechas mienten (bug detectado en pruebas: octubre→"set").
const MONTH_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "set", "oct", "nov", "dic"];

/** "Hoy" / "Ayer" / "vie 23 oct" — fechas legibles sin jerga técnica. */
export function friendlyDateLabel(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!match) return iso || "—";
  const [, y, m, d] = match;
  const target = new Date(Number(y), Number(m) - 1, Number(d));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";

  // `getMonth()` YA devuelve 0-11: no se resta 1 (bug detectado en pruebas).
  return `${WEEKDAY_SHORT[target.getDay()]} ${Number(d)} ${MONTH_SHORT[target.getMonth()]}`;
}

const STATUS_VISUAL: Record<string, { label: string; className: string }> = {
  logrado: { label: "Logrado", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  en_proceso: { label: "En proceso", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  pendiente: { label: "Necesita refuerzo", className: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
  sin_evaluar: { label: "Sin evaluar", className: "bg-muted text-muted-foreground" },
  no_corresponde: { label: "No aplicó", className: "bg-muted text-muted-foreground" },
};

const FALLBACK_VISUAL = { label: "Sin evaluar", className: "bg-muted text-muted-foreground" };

function statusVisual(status?: string | null): { label: string; className: string } {
  // Acceso con corchetes: el índice tiene firma, no propiedades nombradas.
  return STATUS_VISUAL[status || "sin_evaluar"] ?? FALLBACK_VISUAL;
}

/** Lunes de la semana que contiene `date`. */
export function startOfWeekIso(date: Date = new Date()): string {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay(); // 0 dom ... 6 sáb
  const offset = day === 0 ? 6 : day - 1; // semana empieza lunes
  copy.setDate(copy.getDate() - offset);
  return toIsoDate(copy);
}

function addDaysIso(iso: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

function formatRange(startIso: string, endIso: string): string {
  return `${friendlyDateLabel(startIso)} — ${friendlyDateLabel(endIso)}`;
}

interface BitacoraCardProps {
  row: LessonEvaluationRow;
  showTeacher: boolean;
}

function BitacoraCard({ row, showTeacher }: BitacoraCardProps) {
  const [open, setOpen] = useState(false);
  const status = statusVisual(row.overall_status);
  const hasDetails = Boolean(
    row.topic || row.homework || row.teacher_comment || (row.repertoire?.length ?? 0) > 0,
  );

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => hasDetails && setOpen((v) => !v)}
        className="flex min-h-[44px] w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <span className="w-11 shrink-0 font-mono text-xs font-bold text-foreground">
          {(row.start_time || "").slice(0, 5)}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-sm font-bold text-foreground">
              {row.student_name_snapshot || "Alumno"}
            </span>
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${status.className}`}>
              {status.label}
            </span>
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Music4 className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {row.instrument || "—"}
              {showTeacher && row.teacher_name ? ` · ${row.teacher_name}` : ""}
            </span>
          </span>
        </span>

        {hasDetails && (
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {open && (
        <div className="space-y-2 border-t border-border/60 px-3 py-2.5 text-xs">
          {row.topic && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                Tema
              </p>
              <p className="text-foreground">{row.topic}</p>
            </div>
          )}

          {(row.repertoire?.length ?? 0) > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                Repertorio
              </p>
              <ul className="list-inside list-disc text-foreground">
                {row.repertoire.map((item, index) => (
                  <li key={`${row.id}-rep-${index}`}>
                    {item.title}
                    {item.status ? ` · ${item.status}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {row.homework && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                Tarea
              </p>
              <p className="text-foreground">{row.homework}</p>
            </div>
          )}

          {row.teacher_comment && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                Comentario
              </p>
              <p className="text-foreground">{row.teacher_comment}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export interface BitacoraHistoryProps {
  /** Filtra por docente (UUID). En el Kiosco se pasa el docente logueado. */
  teacherId?: string | null;
  /** Filtra por alumno (UUID). Opcional. */
  studentId?: string | null;
  /** Muestra el nombre del docente en cada fila. */
  showTeacher?: boolean;
  /** Mensaje cuando no hay bitácoras. */
  emptyMessage?: string;
  title?: string;
  subtitle?: string;
}

export function BitacoraHistory({
  teacherId,
  studentId,
  showTeacher = true,
  emptyMessage = "Aún no hay bitácoras registradas en esta semana.",
  title = "Bitácora diaria",
  subtitle = "Lo que se trabajó en cada clase, día por día.",
}: BitacoraHistoryProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeekIso());
  const [rows, setRows] = useState<LessonEvaluationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const weekEnd = useMemo(() => addDaysIso(weekStart, 6), [weekStart]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listBitacoras({
        from: weekStart,
        to: weekEnd,
        teacherId: teacherId || null,
        studentId: studentId || null,
      });
      setRows(data);
    } catch {
      setRows([]);
      setError("No se pudo cargar la bitácora. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [weekStart, weekEnd, teacherId, studentId]);

  useEffect(() => {
    void load();
  }, [load, tick]);

  const grouped = useMemo(() => groupBitacorasByDate(rows), [rows]);
  const isCurrentWeek = weekStart === startOfWeekIso();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setWeekStart((prev) => addDaysIso(prev, -7))}
            className="min-h-[44px] rounded-xl border border-border px-3 text-xs font-bold text-foreground transition-colors hover:bg-muted"
            aria-label="Semana anterior"
          >
            ‹
          </button>
          <span className="min-w-[7.5rem] text-center text-xs font-bold text-foreground">
            {formatRange(weekStart, weekEnd)}
          </span>
          <button
            type="button"
            onClick={() => setWeekStart((prev) => addDaysIso(prev, 7))}
            disabled={isCurrentWeek}
            className="min-h-[44px] rounded-xl border border-border px-3 text-xs font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            aria-label="Semana siguiente"
          >
            ›
          </button>
          {!isCurrentWeek && (
            <button
              type="button"
              onClick={() => setWeekStart(startOfWeekIso())}
              className="min-h-[44px] rounded-xl border border-primary/30 bg-primary/5 px-2.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/15"
            >
              Hoy
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-6 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando bitácoras…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-semibold text-rose-700 dark:text-rose-300">
          {error}
        </div>
      ) : grouped.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-xs text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.dateStr} className="space-y-1.5">
              <p className="px-1 text-[11px] font-black uppercase tracking-wide text-muted-foreground">
                {friendlyDateLabel(group.dateStr)} · {group.rows.length}{" "}
                {group.rows.length === 1 ? "clase" : "clases"}
              </p>
              <div className="space-y-1.5">
                {group.rows.map((row) => (
                  <BitacoraCard key={row.id} row={row} showTeacher={showTeacher} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
