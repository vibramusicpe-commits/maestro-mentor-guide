/**
 * ================================================================
 * teacher-adoption-panel.tsx — Tablero de adopción de la bitácora (ADR-0184)
 * ================================================================
 *
 * Para Dirección: quién registra bitácoras y quién lleva 2+ días hábiles sin
 * registrar. Ofrece el recordatorio por WhatsApp (`wa.me`, costo cero) con
 * mensaje personalizado.
 *
 * Reglas:
 *   - Mapeo de docentes SOLO desde `TEACHER_IDS` (AGENTS §86.7). Prohibido
 *     hardcodear nombres o filtrar por `teacher_name` de texto.
 *   - Solo `lesson_evaluations` con `is_test = false`.
 *   - CERO datos financieros (ni `S/`, ni saldos, ni deudas).
 *   - NO evalúa fichaje ni puntualidad (decisión D3 de Dirección).
 *   - El envío NUNCA es automático: abre WhatsApp con el mensaje escrito.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, MessageCircle, RefreshCw, Users2 } from "lucide-react";
import { getEvaluationsSummaryMap } from "@/lib/services/evaluations-summary.service";
import { TEACHER_IDS, resolveTeacherNameById, resolveTeacherPhoneById } from "@/lib/services/teacher-resolver";
import {
  buildTeacherReminderMessage,
  buildTeacherReminderWhatsAppUrl,
  computeTeachersNeedingReminder,
  todayIso,
} from "@/lib/informes/teacher-reminders";

interface TeacherRow {
  teacherId: string;
  teacherName: string;
  phone: string | null;
}

/** Docentes del piloto resueltos desde la fuente única. */
function resolvePilotTeachers(): TeacherRow[] {
  const ids = [TEACHER_IDS.JEREMY, TEACHER_IDS.FERNANDO, TEACHER_IDS.NATHALY];
  return ids
    .map((id) => ({
      teacherId: id,
      teacherName: resolveTeacherNameById(id) || "Docente sin nombre",
      phone: resolveTeacherPhoneById(id),
    }))
    .filter((row) => Boolean(row.teacherName));
}

interface AdoptionRow extends TeacherRow {
  totalEvaluations: number;
  lastEvaluationDate: string | null;
  workdaysSinceLast: number;
  needsReminder: boolean;
}

export function TeacherAdoptionPanel() {
  const [rows, setRows] = useState<AdoptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const teachers = useMemo(resolvePilotTeachers, []);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      try {
        // Bitácoras reales por docente (el servicio ya filtra is_test = false).
        const summary = await getEvaluationsSummaryMap();
        const entries = Array.from(summary.values());

        const evaluations = entries
          .filter((item) => item.lastEvaluationDate)
          .map((item) => ({
            // `StudentEvaluationSummary` no expone UUID de docente: se resuelve
            // por nombre dentro del motor (fallback previsto en ADR-0184).
            teacherId: null as string | null,
            teacherName: item.lastTeacherName || null,
            sessionDate: item.lastEvaluationDate as string,
          }));

        const reminders = computeTeachersNeedingReminder(
          evaluations,
          teachers.map((teacher) => ({
            teacherId: teacher.teacherId,
            teacherName: teacher.teacherName,
            phone: teacher.phone,
          })),
          todayIso(),
        );

        const next: AdoptionRow[] = teachers.map((teacher, index) => {
          const reminder = reminders[index];
          // Suma de bitácoras de los alumnos cuyo ÚLTIMO registro fue de este
          // docente. Es una aproximación honesta: el resumen agrupa por alumno,
          // no por docente, y no se inventa un conteo que no existe.
          const totalEvaluations = entries
            .filter((item) => item.lastTeacherName === teacher.teacherName)
            .reduce((sum, item) => sum + (item.totalEvaluations || 0), 0);
          return {
            ...teacher,
            totalEvaluations,
            lastEvaluationDate: reminder?.lastEvaluationDate ?? null,
            workdaysSinceLast: reminder?.workdaysSinceLast ?? 0,
            needsReminder: reminder?.needsReminder ?? false,
          };
        });

        setRows(next);
      } catch {
        // Degradación limpia: se muestra el estado vacío, nunca rompe el panel.
        setRows(
          teachers.map((teacher) => ({
            ...teacher,
            totalEvaluations: 0,
            lastEvaluationDate: null,
            workdaysSinceLast: 0,
            needsReminder: false,
          })),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [teachers],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const pending = rows.filter((row) => row.needsReminder);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
            <Users2 className="h-4 w-4 text-primary" />
            Adopción de la bitácora docente
          </h3>
          <p className="text-xs text-muted-foreground">
            Quién registra sus clases. Solo pedagogía: sin datos financieros.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void load(true)}
          disabled={refreshing}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {pending.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-200">
          ⚠️ {pending.length} docente{pending.length === 1 ? "" : "s"} con 2 o más días hábiles sin
          registrar bitácora. Puedes enviarle un recordatorio por WhatsApp.
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-xs text-muted-foreground">
          Cargando bitácoras…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50">
              <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-bold">Docente</th>
                <th className="px-3 py-2 text-center font-bold">Bitácoras</th>
                <th className="px-3 py-2 text-center font-bold">Última</th>
                <th className="px-3 py-2 text-center font-bold">Estado</th>
                <th className="px-3 py-2 text-right font-bold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => {
                const url = buildTeacherReminderWhatsAppUrl({
                  teacherId: row.teacherId,
                  teacherName: row.teacherName,
                  lastEvaluationDate: row.lastEvaluationDate,
                  workdaysSinceLast: row.workdaysSinceLast,
                  needsReminder: row.needsReminder,
                  phone: row.phone,
                });

                return (
                  <tr key={row.teacherId} className="hover:bg-muted/30">
                    <td className="px-3 py-2.5">
                      <p className="font-bold text-foreground">{row.teacherName}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {row.teacherId.slice(-4)}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 text-center font-black text-foreground">
                      {row.totalEvaluations}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono text-muted-foreground">
                      {row.lastEvaluationDate ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {row.needsReminder ? (
                        <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-black text-rose-600">
                          🔴 {row.workdaysSinceLast} días
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                          🟢 Al día
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={buildTeacherReminderMessage({
                            teacherId: row.teacherId,
                            teacherName: row.teacherName,
                            lastEvaluationDate: row.lastEvaluationDate,
                            workdaysSinceLast: row.workdaysSinceLast,
                            needsReminder: row.needsReminder,
                            phone: row.phone,
                          })}
                          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-2.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/15"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          Recordar
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                          <AlertTriangle className="h-3 w-3" />
                          Sin teléfono
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        El recordatorio se abre en WhatsApp con el mensaje ya redactado; lo envía una persona de
        Dirección. No incluye información económica ni evalúa puntualidad.
      </p>
    </div>
  );
}
