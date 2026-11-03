/**
 * ================================================================
 * teacher-reminders.ts — Motor de recordatorio de bitácora (ADR-0184)
 * ================================================================
 *
 * Detecta docentes que llevan 2+ DIAS HABILES sin registrar ninguna bitácora
 * y arma el mensaje personalizado de WhatsApp.
 *
 * Reglas innegociables:
 *   - Solo cuenta `lesson_evaluations` con `is_test = false`.
 *   - Días hábiles = lunes a sábado (domingo no dicta la escuela).
 *   - NO evalúa puntualidad ni fichaje: la empresa tiene su propia política
 *     de asistencia y los docentes ya la conocen (decisión D3 de Dirección).
 *   - Función PURA y determinista: sin red, sin estado, testeable.
 *   - El envío NUNCA es automático: genera un enlace `wa.me` que una persona
 *     de Dirección abre y envía. Costo cero (ADR-0140).
 */

export const REMINDER_THRESHOLD_WORKDAYS = 2;

export interface ReminderEvaluationRef {
  /** UUID del docente dueño de la bitácora (`lesson_evaluations.teacher_id`). */
  teacherId?: string | null;
  /** Nombre del docente tal como viaja en la fila (fallback de resolución). */
  teacherName?: string | null;
  /** Fecha de la clase evaluada (`YYYY-MM-DD`). */
  sessionDate: string;
  /** Debe venir ya filtrado por el servicio; se revalida aquí por seguridad. */
  isTest?: boolean;
}

export interface TeacherReminderTarget {
  /** UUID sintético (`TEACHER_IDS`) del docente. */
  teacherId: string;
  teacherName: string;
  /** Última bitácora registrada (`YYYY-MM-DD`) o `null` si nunca registró. */
  lastEvaluationDate: string | null;
  /** Días hábiles transcurridos desde la última bitácora (o desde `baseline`). */
  workdaysSinceLast: number;
  needsReminder: boolean;
  /** Teléfono `wa.me` (solo dígitos). `null` si no hay número válido. */
  phone: string | null;
}

/** Día hábil = lunes (1) a sábado (6). Domingo (0) no cuenta. */
export function isWorkday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 6;
}

/**
 * Cuenta días hábiles estrictamente posteriores a `from` y anteriores o
 * iguales a `to`. Si `from` es null, cuenta desde `to` hacia atrás hasta
 * `baseline` cuando exista; si no, devuelve 0 (no se inventa antigüedad).
 */
export function countWorkdaysBetween(from: string | null, to: string): number {
  const end = parseIsoDate(to);
  if (!end) return 0;
  const start = from ? parseIsoDate(from) : null;
  if (!start) return 0;

  let cursor = new Date(start.getTime());
  cursor.setDate(cursor.getDate() + 1);
  let count = 0;
  let guard = 0;

  while (cursor <= end && guard < 400) {
    if (isWorkday(cursor)) count += 1;
    cursor.setDate(cursor.getDate() + 1);
    guard += 1;
  }
  return count;
}

function parseIsoDate(value?: string | null): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  // Construcción local: evita el desfase UTC de `new Date("YYYY-MM-DD")`.
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `YYYY-MM-DD` de la fecha local del sistema. */
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Calcula, por docente, si necesita recordatorio.
 *
 * @param evaluations Bitácoras reales (idealmente ya filtradas por mes).
 * @param teachers    Docentes a evaluar, con `teacherId`, `teacherName`, `phone`.
 * @param today       Fecha de corte en `YYYY-MM-DD`.
 */
export function computeTeachersNeedingReminder(
  evaluations: ReminderEvaluationRef[],
  teachers: Array<{ teacherId: string; teacherName: string; phone?: string | null }>,
  today: string = todayIso(),
): TeacherReminderTarget[] {
  return teachers.map((teacher) => {
    const own = evaluations.filter((evaluation) => {
      if (evaluation.isTest) return false;
      if (evaluation.teacherId) return evaluation.teacherId === teacher.teacherId;
      // Fallback por nombre solo si la fila no trae UUID.
      return (evaluation.teacherName || "").trim().toLowerCase() ===
        teacher.teacherName.trim().toLowerCase();
    });

    const lastEvaluationDate =
      own
        .map((evaluation) => evaluation.sessionDate)
        .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
        .sort()
        .at(-1) ?? null;

    const workdaysSinceLast = countWorkdaysBetween(lastEvaluationDate, today);

    return {
      teacherId: teacher.teacherId,
      teacherName: teacher.teacherName,
      lastEvaluationDate,
      workdaysSinceLast,
      needsReminder:
        lastEvaluationDate !== null && workdaysSinceLast >= REMINDER_THRESHOLD_WORKDAYS,
      phone: teacher.phone ?? null,
    };
  });
}

/**
 * Mensaje personalizado para el docente. Sin sanciones ni cifras de dinero.
 * Si nunca registró, el texto invita a empezar en vez de reclamar.
 */
export function buildTeacherReminderMessage(target: TeacherReminderTarget): string {
  const name = target.teacherName;
  if (!target.lastEvaluationDate) {
    return (
      `Hola ${name}, te escribimos de Vibra Music. Aún no registras bitácoras ` +
      `de clase este ciclo. Recuerda que toma 2 minutos por alumno desde tu ` +
      `kiosco y que con ellas podemos preparar el informe del ciclo. ¡Gracias!`
    );
  }
  const days = target.workdaysSinceLast;
  return (
    `Hola ${name}, te escribimos de Vibra Music. Vemos que hace ${days} días ` +
    `no registras la bitácora de clase. Recuerda que toma 2 minutos por alumno ` +
    `y que la necesitamos para poder emitir el informe del ciclo. Gracias.`
  );
}

/**
 * Enlace `wa.me` listo para abrir. Devuelve `null` si no hay teléfono válido
 * — la UI debe deshabilitar el botón, nunca inventar un número.
 */
export function buildTeacherReminderWhatsAppUrl(target: TeacherReminderTarget): string | null {
  if (!target.phone) return null;
  return `https://wa.me/${target.phone}?text=${encodeURIComponent(
    buildTeacherReminderMessage(target),
  )}`;
}
