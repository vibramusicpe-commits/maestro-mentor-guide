/**
 * ================================================================
 * kardex-calculator.ts — Motor de Cálculo de Ciclos, Liquidación y
 * Exportación Estructurada (Kardex & Ficha de Auditoría)
 * ================================================================
 * 
 * Reglas de Negocio Implementadas:
 * - Filosofía Vibra Music: "Las clases no se pierden, se recuperan".
 * - ADR-0099, ADR-0100: Cuotas de 8 clases (Regular) y 4 clases (Intensivo).
 * - ADR-0105: Deduplicación estricta por franja horaria (dateStr-time).
 * - ADR-0108: Cierre estricto de ciclo y preservación incondicional de asistencias.
 * - ADR-0131: Barreras temporales por transición de curso (effectiveFrom, effectiveUntil).
 * - ADR-0133: Normalización universal de días, balance de créditos migrados
 *   por cambio de instrumento (ej. Sasha: 3 regulares + 2 créditos = 5 clases en Guitarra)
 *   y exportación dual (Humano y LLM/Auditoría).
 */

import type { AdminStudent, ScheduledLesson, WeekDay, Invoice, DBPaymentAuditLog } from "@/store/app-store";
import { isMatchingStudentName } from "@/lib/student-matching";

export const WEEKDAYS_ORDER: WeekDay[] = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export const WEEKDAY_FULL_NAMES: Record<string, string> = {
  Lun: "Lunes",
  Mar: "Martes",
  Mié: "Miércoles",
  Jue: "Jueves",
  Vie: "Viernes",
  Sáb: "Sábado",
  Lunes: "Lunes",
  Martes: "Martes",
  Miércoles: "Miércoles",
  Jueves: "Jueves",
  Viernes: "Viernes",
  Sábado: "Sábado",
};

export const MONTHS_NAME = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre",
];

/**
 * Normaliza cualquier variante de día a la clave corta canónica WeekDay ("Lun", "Mar", "Mié", etc.)
 */
export function normalizeDayKey(day: string): WeekDay {
  const d = (day || "").toLowerCase().trim();
  if (d.startsWith("lun")) return "Lun";
  if (d.startsWith("mar")) return "Mar";
  if (d.startsWith("mi") || d.startsWith("mie")) return "Mié";
  if (d.startsWith("jue")) return "Jue";
  if (d.startsWith("vie")) return "Vie";
  if (d.startsWith("sab") || d.startsWith("sáb")) return "Sáb";
  return "Lun";
}

export interface StudentSessionItem {
  id: string;
  lessonId: string;
  sessionIndex: number;
  weekIndex: number;
  weekLabel: string;
  dateStr: string;
  dayNum: number;
  dayName: string;
  dayShort: string;
  dayKey: WeekDay;
  time: string;
  timeEnd: string;
  teacher: string;
  room: string;
  instrument: string;
  isMakeup?: boolean;
  recoveringLessonDate?: string;
  status: "presente" | "ausente" | "tarde" | "justificada" | "pendiente";
  notes?: string;
  creditDelta?: number; // 1 si genera crédito de recuperación
  makeupCreditTransferred?: boolean; // True si este crédito migró a otro instrumento
  targetInstrument?: string; // Instrumento al cual migró el crédito
}

export interface ComputeCycleOptions {
  student: AdminStudent;
  allSchedule: ScheduledLesson[];
  selectedYear?: number;
  selectedMonth?: number; // 0-indexed
}

export interface InstrumentStageBreakdown {
  instrument: string;
  teacher: string;
  room: string;
  startDate: string;
  endDate: string;
  totalQuotaSessions: number;
  attendedCount: number;
  missedCount: number;
  justifiedCount: number;
  tardyCount: number;
  pendingCount: number;
  makeupCreditsGenerated: number;
  makeupCreditsTransferredIn: number;
  regularPendingSessions: number;
  totalSessionsToDeliver: number; // regularPendingSessions + makeupCreditsTransferredIn
  isCurrentStage: boolean;
  statusText: string;
}

export interface FinancialAuditItem {
  id: string;
  category: "matricula" | "mensualidad" | "libros";
  categoryLabel: string; // "🎓 1. Matrícula", "🎵 2. Mensualidad", "📚 3. Libros y Material"
  concept: string;
  dateStr: string;
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  status: "pagado" | "pendiente" | "exonerado" | "parcial";
  paymentMethod: string;
  voucherRef: string;
  notes?: string;
  delivered?: boolean;
}

export interface StudentFinancialAuditSummary {
  items: FinancialAuditItem[];
  totalFacturado: number;
  totalCobrado: number;
  totalSaldoPendiente: number;
  estadoGeneral: "al-dia" | "deudor" | "parcial";
}

export interface StudentCycleLiquidation {
  targetQuota: number;
  attendedCount: number;
  missedCount: number;
  justifiedCount: number;
  tardyCount: number;
  pendingCount: number;
  makeupCount: number;
  makeupCreditsAvailable: number; // Total de créditos a favor disponibles
  makeupCreditsGenerated: number; // Créditos acumulados por faltas/justificaciones
  makeupCreditsMigrated: number; // Créditos transferidos al nuevo instrumento
  regularPendingInNew: number; // Clases regulares pendientes en el nuevo instrumento
  totalSessionsToDeliverInNew: number; // Suma: regularPendingInNew + makeupCreditsMigrated
  completionPercentage: number;
  planPrice: number;
  amountPaid: number;
  remainingBalance: number;
  financialAudit?: StudentFinancialAuditSummary;
  verdictText: string;
  isCompleted: boolean;
  hasInstrumentTransition: boolean;
  originalInstrument?: string;
  newInstrument?: string;
  transitionCutOffDate?: string;
  transitionDate?: string;
  transitionScheduleText?: string;
  sessionsInOriginal: number;
  sessionsInNew: number;
  stages: InstrumentStageBreakdown[];
}

/**
 * Calcula las semanas de un mes (utilidad para coincidir semana con fecha)
 */
export function getMonthWeeks(year: number, month: number) {
  const weeks: { weekIndex: number; days: { dateStr: string; dayKey: WeekDay }[] }[] = [];
  const lastDay = new Date(year, month + 1, 0);

  let currentWeek: { dateStr: string; dayKey: WeekDay }[] = [];
  let weekIndex = 0;

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const curDate = new Date(year, month, d);
    const jsDay = curDate.getDay();
    if (jsDay === 0) continue; // Domingo
    const dayKey = WEEKDAYS_ORDER[jsDay - 1];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    currentWeek.push({ dateStr, dayKey });

    if (jsDay === 6 || d === lastDay.getDate()) {
      weeks.push({ weekIndex, days: [...currentWeek] });
      currentWeek = [];
      weekIndex++;
    }
  }

  return weeks;
}

/**
 * Motor central de proyección de clases del ciclo del alumno.
 */
export function computeStudentCycleSessions(options: ComputeCycleOptions): StudentSessionItem[] {
  const { student, allSchedule, selectedYear = new Date().getFullYear(), selectedMonth = new Date().getMonth() } = options;

  const modalityStr = (student.modality || "").toLowerCase();
  const isIntensive = modalityStr.includes("inten") || modalityStr.includes("90 min") || (modalityStr.includes("4 clases") && !modalityStr.includes("45 min"));
  const isFlexiblePackage =
    modalityStr.includes("flexible") ||
    modalityStr.includes("demanda") ||
    modalityStr.includes("paquete") ||
    student.planType === "Paquete Flexible" ||
    student.planType === "Paquete Especial" ||
    (Boolean(student.packageTotalSessions) && Number(student.packageTotalSessions) > 8);

  let targetQuota = 8;
  if (isIntensive) targetQuota = 4;
  else if (isFlexiblePackage) targetQuota = Number(student.packageTotalSessions) || 24;

  const effectivePlanStartDate = student.planStartDate || student.joinedAt || undefined;
  const effectivePlanEndDate = student.planEndDate || undefined;

  // Filtrar lecciones del alumno: primero lecciones de allSchedule, luego sobreescribir con las lecciones
  // de student.scheduleLessons (que tienen attendanceByDate y barreras effectiveFrom/effectiveUntil de PostgreSQL)
  const studentLessonsMap = new Map<string, ScheduledLesson>();
  allSchedule
    .filter((l) => isMatchingStudentName(l.student, student.name))
    .forEach((l) => studentLessonsMap.set(l.id, l));
  (student.scheduleLessons || []).forEach((l) => studentLessonsMap.set(l.id, l));
  const studentLessons = Array.from(studentLessonsMap.values());

  const defaultStartStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
  const startStr = effectivePlanStartDate || defaultStartStr;
  const [sy, sm, sd] = startStr.split("-").map(Number);
  if (!sy || !sm || !sd) return [];

  const startDate = new Date(sy, sm - 1, sd);
  const rawCandidates: StudentSessionItem[] = [];
  const daysToEnd = effectivePlanEndDate
    ? Math.max(isFlexiblePackage ? 180 : 90, Math.ceil((new Date(effectivePlanEndDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 15)
    : (isFlexiblePackage ? 180 : 90);

  let maxLessonDays = 0;
  studentLessons.forEach((l) => {
    if (l.dateStr) {
      const [ly, lm, ld] = l.dateStr.split("-").map(Number);
      if (ly && lm && ld) {
        const lDate = new Date(ly, lm - 1, ld);
        const diffDays = Math.ceil((lDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > maxLessonDays) {
          maxLessonDays = diffDays + 14;
        }
      }
    }
  });

  const maxDaysToScan = Math.max(isFlexiblePackage ? 180 : 90, daysToEnd, maxLessonDays);

  for (let offset = 0; offset < maxDaysToScan; offset++) {
    const cur = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + offset);
    const curY = cur.getFullYear();
    const curM = cur.getMonth();
    const curD = cur.getDate();
    const curDateStr = `${curY}-${String(curM + 1).padStart(2, "0")}-${String(curD).padStart(2, "0")}`;

    const jsDay = cur.getDay(); // 0 Dom, 1 Lun, 2 Mar, 3 Mié, 4 Jue, 5 Vie, 6 Sáb
    if (jsDay === 0) continue; // No domingos
    const dayKey = WEEKDAYS_ORDER[jsDay - 1]; // "Lun", "Mar", etc.

    // 🛡️ REGLA (ADR-0113 & ADR-0150): Para Paquete Flexible, la vigencia se rige por clases consumidas (no por mes calendario rígido)
    const isBeyondEnd = (!isFlexiblePackage && effectivePlanEndDate) ? curDateStr > effectivePlanEndDate : false;

    studentLessons.forEach((lesson) => {
      if (lesson.month !== undefined && lesson.month !== curM) return;
      if (lesson.year !== undefined && lesson.year !== curY) return;

      // A. Fecha exacta fija
      if (lesson.dateStr) {
        if (lesson.dateStr !== curDateStr) return;
      } else {
        // B. Recurrente por día (normalización universal)
        if (normalizeDayKey(lesson.day) !== dayKey) return;
      }

      // C. Fechas excluidas por reprogramación (omisión incondicional)
      if (lesson.excludedDates && lesson.excludedDates.includes(curDateStr)) {
        return;
      }

      // C.1. Barreras temporales absolutas por transición de curso (ADR-0131)
      if (lesson.effectiveFrom && curDateStr < lesson.effectiveFrom) {
        return;
      }
      if (lesson.effectiveUntil && curDateStr > lesson.effectiveUntil) {
        return;
      }

      // D. Si tiene semana fija (weekIndex)
      if (!lesson.dateStr && lesson.weekIndex !== undefined) {
        const curMonthWeeks = getMonthWeeks(curY, curM);
        const curWeekInMonth = curMonthWeeks.findIndex((w) => w.days.some((d) => d.dateStr === curDateStr));
        if (curWeekInMonth !== -1 && lesson.weekIndex !== curWeekInMonth) {
          return;
        }
      }

      // E. Si tiene semanas excluidas
      if (!lesson.dateStr && lesson.excludedWeeks && lesson.excludedWeeks.length > 0) {
        const curMonthWeeks = getMonthWeeks(curY, curM);
        const curWeekInMonth = curMonthWeeks.findIndex((w) => w.days.some((d) => d.dateStr === curDateStr));
        if (curWeekInMonth !== -1 && lesson.excludedWeeks.includes(curWeekInMonth)) {
          return;
        }
      }

      let currentStatus: StudentSessionItem["status"] = "pendiente";
      if (lesson.attendanceByDate && lesson.attendanceByDate[curDateStr]) {
        currentStatus = lesson.attendanceByDate[curDateStr]!;
      }

      if (isBeyondEnd && currentStatus === "pendiente" && !lesson.isMakeup) {
        return;
      }

      const [hh, mm] = (lesson.time || "16:00").split(":").map((v) => parseInt(v, 10));
      const endMinuteTotal = (hh || 16) * 60 + (mm || 0) + 45;
      const endH = String(Math.floor(endMinuteTotal / 60)).padStart(2, "0");
      const endM = String(endMinuteTotal % 60).padStart(2, "0");
      const timeEnd = `${endH}:${endM}`;

      const monthName = MONTHS_NAME[curM] || "";
      const fullDayName = WEEKDAY_FULL_NAMES[dayKey] || dayKey;

      rawCandidates.push({
        id: `${lesson.id}-${curDateStr}`,
        lessonId: lesson.id,
        sessionIndex: 0,
        weekIndex: Math.floor(offset / 7),
        weekLabel: `Semana ${Math.floor(offset / 7) + 1}`,
        dateStr: curDateStr,
        dayNum: curD,
        dayName: `${fullDayName} ${String(curD).padStart(2, "0")} de ${monthName} ${curY}`,
        dayShort: `${dayKey} ${String(curD).padStart(2, "0")} ${monthName.slice(0, 3)}`,
        dayKey,
        time: lesson.time,
        timeEnd,
        teacher: lesson.teacher || student.teacher || "Por asignar",
        room: lesson.room || student.room || "Sala A",
        instrument: lesson.instrument || student.instrument || "Música",
        isMakeup: !!lesson.isMakeup,
        recoveringLessonDate: lesson.recoveringLessonDate,
        status: currentStatus,
      });
    });
  }

  // 1. Orden cronológico con prioridad de slot (ADR-0105)
  rawCandidates.sort((a, b) => {
    const cmp = a.dateStr.localeCompare(b.dateStr);
    if (cmp !== 0) return cmp;
    const timeCmp = a.time.localeCompare(b.time);
    if (timeCmp !== 0) return timeCmp;
    // 🛡️ Prioridad de slot en la misma fecha y hora (ADR-0105):
    // 1. Sesión evaluada (asistió, falta, tarde, justificada) prevalece sobre pendiente
    const aEval = a.status !== "pendiente" ? 1 : 0;
    const bEval = b.status !== "pendiente" ? 1 : 0;
    if (aEval !== bEval) return bEval - aEval;
    // 2. Sesión de recuperación puntual (isMakeup: true) prevalece sobre lección recurrente abierta
    const aMakeup = a.isMakeup ? 1 : 0;
    const bMakeup = b.isMakeup ? 1 : 0;
    if (aMakeup !== bMakeup) return bMakeup - aMakeup;
    return 0;
  });

  // 2. Deduplicar por fecha y hora exactas
  const seenSlots = new Set<string>();
  const deduped: StudentSessionItem[] = [];
  rawCandidates.forEach((item) => {
    const slotKey = `${item.dateStr}-${item.time}`;
    if (!seenSlots.has(slotKey)) {
      seenSlots.add(slotKey);
      deduped.push(item);
    }
  });

  // 3. 🛡️ FILOSOFÍA VIBRA MUSIC (ADR-0105 & ADR-0149):
  // - TODAS las sesiones evaluadas (presente, ausente, tarde, justificada) son hechos históricos intocables y se PRESERVAN.
  // - TODAS las sesiones de recuperación (isMakeup: true), tanto evaluadas como pendientes, se PRESERVAN incondicionalmente
  //   para que el alumno pueda recuperar todas sus inasistencias sin límites arbitrarios ("Las clases no se pierden, se recuperan").
  // - Solo se acotan las sesiones regulares pendientes (status === "pendiente" && !isMakeup) para que el ciclo proyecte
  //   exactamente las clases necesarias para completar la cuota contratada.
  const evaluated = deduped.filter((s) => s.status !== "pendiente");
  const pendingMakeups = deduped.filter((s) => s.status === "pendiente" && s.isMakeup);
  const pendingRegular = deduped.filter((s) => s.status === "pendiente" && !s.isMakeup);

  // 🛡️ REGLA (ADR-0105 & ADR-0154): Cumplimiento estricto de cuota contractual.
  // Todas las sesiones evaluadas (presentes, faltas, tardanzas, justificadas) más las recuperaciones
  // agendadas consumen cupos del ciclo. Solo se toman las clases regulares pendientes necesarias
  // para que el total de clases proyectadas sume exactamente la cuota contratada (targetQuota).
  const regularSlotsNeeded = Math.max(0, targetQuota - evaluated.length - pendingMakeups.length);
  const chosenPendingRegular = pendingRegular.slice(0, regularSlotsNeeded);

  const finalSessions = [...evaluated, ...pendingMakeups, ...chosenPendingRegular];
  finalSessions.sort((a, b) => {
    const cmp = a.dateStr.localeCompare(b.dateStr);
    if (cmp !== 0) return cmp;
    return a.time.localeCompare(b.time);
  });

  // 4. Numerar secuencialmente (Sesión 1 a N)
  finalSessions.forEach((item, idx) => {
    item.sessionIndex = idx + 1;
  });

  return finalSessions;
}

export interface ComputeMonthSessionsOptions {
  student: AdminStudent;
  allSchedule: ScheduledLesson[];
  selectedYear: number;
  selectedMonth: number; // 0-indexed (0=Ene... 6=Jul, 7=Ago, 8=Set, 9=Oct)
}

/**
 * Calcula todas las sesiones correspondientes a un mes calendario específico
 * respetando fechas de inicio (planStartDate), barreras de horario y asistencias (ADR-0150).
 */
export function computeStudentMonthSessions(options: ComputeMonthSessionsOptions): StudentSessionItem[] {
  const { student, allSchedule, selectedYear, selectedMonth } = options;
  if (!student || student.status !== "activo") return [];

  // Filtrar lecciones del alumno fusionando allSchedule con student.scheduleLessons
  const studentLessonsMap = new Map<string, ScheduledLesson>();
  allSchedule
    .filter((l) => isMatchingStudentName(l.student, student.name))
    .forEach((l) => studentLessonsMap.set(l.id, l));
  (student.scheduleLessons || []).forEach((l) => studentLessonsMap.set(l.id, l));
  const studentLessons = Array.from(studentLessonsMap.values());

  const effectivePlanStartDate = student.planStartDate || student.joinedAt || undefined;
  const effectivePlanEndDate = student.planEndDate || undefined;
  const modalityStr = (student.modality || "Regular").toLowerCase();
  const isFlexiblePackage =
    modalityStr.includes("flexible") ||
    modalityStr.includes("demanda") ||
    modalityStr.includes("paquete") ||
    student.planType === "Paquete Flexible" ||
    student.planType === "Paquete Especial" ||
    (Boolean(student.packageTotalSessions) && Number(student.packageTotalSessions) > 8);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const rawCandidates: StudentSessionItem[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(selectedYear, selectedMonth, d);
    const curY = curDate.getFullYear();
    const curM = curDate.getMonth();
    const curD = curDate.getDate();
    const curDateStr = `${curY}-${String(curM + 1).padStart(2, "0")}-${String(curD).padStart(2, "0")}`;

    const jsDay = curDate.getDay();
    if (jsDay === 0) continue; // Domingos no lectivos
    const dayKey = WEEKDAYS_ORDER[jsDay - 1];

    // 🛡️ REGLA (ADR-0153 & Regla 3.3 AGENTS.md): En vista de mes calendario, proyectar las clases regulares del mes sin truncar

    // Para no flexibles, validar fin de plan en sesiones no evaluadas ni recuperaciones
    const isBeyondEnd = (!isFlexiblePackage && effectivePlanEndDate) ? curDateStr > effectivePlanEndDate : false;

    studentLessons.forEach((lesson) => {
      if (lesson.month !== undefined && lesson.month !== curM) return;
      if (lesson.year !== undefined && lesson.year !== curY) return;

      // A. Fecha exacta fija (makeups, adelantos, etc.)
      if (lesson.dateStr) {
        if (lesson.dateStr !== curDateStr) return;
      } else {
        // B. Recurrente semanal
        if (normalizeDayKey(lesson.day) !== dayKey) return;
      }

      // C. Fechas excluidas por reprogramación (omisión incondicional)
      if (lesson.excludedDates && lesson.excludedDates.includes(curDateStr)) {
        return;
      }

      // C.1. Barreras temporales absolutas (effectiveFrom / effectiveUntil)
      if (lesson.effectiveFrom && curDateStr < lesson.effectiveFrom) return;
      if (lesson.effectiveUntil && curDateStr > lesson.effectiveUntil) return;

      let currentStatus: StudentSessionItem["status"] = "pendiente";
      if (lesson.attendanceByDate && lesson.attendanceByDate[curDateStr]) {
        currentStatus = lesson.attendanceByDate[curDateStr]!;
      }

      if (isBeyondEnd && currentStatus === "pendiente" && !lesson.isMakeup) {
        return;
      }

      const [hh, mm] = (lesson.time || "16:00").split(":").map((v) => parseInt(v, 10));
      const endMinuteTotal = (hh || 16) * 60 + (mm || 0) + 45;
      const endH = String(Math.floor(endMinuteTotal / 60)).padStart(2, "0");
      const endM = String(endMinuteTotal % 60).padStart(2, "0");
      const timeEnd = `${endH}:${endM}`;

      const monthName = MONTHS_NAME[curM] || "";
      const fullDayName = WEEKDAY_FULL_NAMES[dayKey] || dayKey;

      rawCandidates.push({
        id: `${lesson.id}-${curDateStr}`,
        lessonId: lesson.id,
        sessionIndex: 0,
        weekIndex: Math.floor((d - 1) / 7),
        weekLabel: `Semana ${Math.floor((d - 1) / 7) + 1}`,
        dateStr: curDateStr,
        dayNum: curD,
        dayName: `${fullDayName} ${String(curD).padStart(2, "0")} de ${monthName} ${curY}`,
        dayShort: `${dayKey} ${String(curD).padStart(2, "0")} ${monthName.slice(0, 3)}`,
        dayKey,
        time: lesson.time,
        timeEnd,
        teacher: lesson.teacher || student.teacher || "Por asignar",
        room: lesson.room || student.room || "Sala A",
        instrument: lesson.instrument || student.instrument || "Música",
        isMakeup: !!lesson.isMakeup,
        recoveringLessonDate: lesson.recoveringLessonDate,
        status: currentStatus,
      });
    });
  }

  // Ordenar cronológicamente con prioridad a evaluadas y makeups
  rawCandidates.sort((a, b) => {
    const cmp = a.dateStr.localeCompare(b.dateStr);
    if (cmp !== 0) return cmp;
    const timeCmp = a.time.localeCompare(b.time);
    if (timeCmp !== 0) return timeCmp;
    const aEval = a.status !== "pendiente" ? 1 : 0;
    const bEval = b.status !== "pendiente" ? 1 : 0;
    if (aEval !== bEval) return bEval - aEval;
    const aMakeup = a.isMakeup ? 1 : 0;
    const bMakeup = b.isMakeup ? 1 : 0;
    if (aMakeup !== bMakeup) return bMakeup - aMakeup;
    return 0;
  });

  const seenSlots = new Set<string>();
  const deduped: StudentSessionItem[] = [];
  rawCandidates.forEach((item) => {
    const slotKey = `${item.dateStr}-${item.time}`;
    if (!seenSlots.has(slotKey)) {
      seenSlots.add(slotKey);
      deduped.push(item);
    }
  });

  deduped.forEach((item, idx) => {
    item.sessionIndex = idx + 1;
  });

  return deduped;
}

/**
 * Calcula el desglose detallado por etapas de instrumento y la transferencia
 * de créditos de recuperación según la filosofía "Las clases no se pierden, se recuperan".
 */
export function computeStudentInstrumentBreakdown(
  student: AdminStudent,
  sessions: StudentSessionItem[],
  targetQuota: number
): {
  stages: InstrumentStageBreakdown[];
  hasTransition: boolean;
  originalInstrument?: string;
  newInstrument?: string;
  transitionCutOffDate?: string;
  transitionDate?: string;
  transitionScheduleText?: string;
  totalMakeupCredits: number;
  makeupCreditsMigrated: number;
  regularPendingInNew: number;
  totalSessionsToDeliverInNew: number;
} {
  // Orden cronológico de instrumentos presentes en las sesiones del ciclo
  const uniqueInstruments: string[] = [];
  sessions.forEach((s) => {
    if (s.instrument && !uniqueInstruments.includes(s.instrument)) {
      uniqueInstruments.push(s.instrument);
    }
  });

  const hasTransition = !!(student.courseTransition || uniqueInstruments.length > 1);
  const currentInst = student.instrument || (uniqueInstruments.length > 0 ? uniqueInstruments[uniqueInstruments.length - 1] : "Música");
  const originalInst = student.courseTransition?.originalInstrument || (uniqueInstruments.length > 1 ? uniqueInstruments[0] : currentInst);
  const newInst = student.courseTransition?.newInstrument || (uniqueInstruments.length > 1 ? uniqueInstruments[uniqueInstruments.length - 1] : currentInst);

  // Extraer barreras temporales y fechas de corte desde las lecciones o metadatos
  let transitionCutOffDate = student.courseTransition?.cutOffDate;
  let transitionDate = student.courseTransition?.effectiveDate;
  let transitionScheduleText = "";

  (student.scheduleLessons || []).forEach((l) => {
    if (l.effectiveUntil && !transitionCutOffDate) {
      transitionCutOffDate = l.effectiveUntil;
    }
    if (l.effectiveFrom && !transitionDate) {
      transitionDate = l.effectiveFrom;
    }
  });

  const newInstLessons = (student.scheduleLessons || []).filter(
    (l) => l.instrument === newInst && (!l.effectiveUntil || l.effectiveFrom)
  );
  if (newInstLessons.length > 0) {
    const days = Array.from(new Set(newInstLessons.map((l) => WEEKDAY_FULL_NAMES[l.day] || l.day)));
    const time = newInstLessons[0].time || "17:30";
    const room = newInstLessons[0].room || "Sala A";
    const teacher = newInstLessons[0].teacher || student.teacher || "Jeremy";
    const daysStr = days.length === 2 ? `${days[0]} y ${days[1]}` : days.join(", ");
    transitionScheduleText = `${daysStr} ${time} (${room} · Prof. ${teacher})`;
  }

  if (hasTransition) {
    const originalSessions = sessions.filter((s) => s.instrument === originalInst);
    const newSessions = sessions.filter((s) => s.instrument === newInst);
    if (!transitionCutOffDate && originalSessions.length > 0) {
      transitionCutOffDate = originalSessions[originalSessions.length - 1].dateStr;
    }
    if (!transitionDate && newSessions.length > 0) {
      transitionDate = newSessions[0].dateStr;
    }
    if (newSessions.length > 0 && !transitionScheduleText) {
      const s0 = newSessions[0];
      transitionScheduleText = `${s0.dayShort.split(' ')[0]} ${s0.time} (${s0.room} · Prof. ${s0.teacher})`;
    }
  }

  // Agrupamiento de etapas
  const stages: InstrumentStageBreakdown[] = [];
  let accumulatedMakeupCreditsToTransfer = 0;
  const instrumentsToProcess = uniqueInstruments.length > 0 ? uniqueInstruments : [currentInst];

  instrumentsToProcess.forEach((inst, idx) => {
    const isLastStage = idx === instrumentsToProcess.length - 1;
    const instSessions = sessions.filter((s) => s.instrument === inst);

    let attended = 0;
    let missed = 0;
    let justified = 0;
    let tardy = 0;
    let pending = 0;

    instSessions.forEach((s) => {
      if (s.status === "presente") attended++;
      else if (s.status === "ausente") missed++;
      else if (s.status === "justificada") justified++;
      else if (s.status === "tarde") {
        tardy++;
        attended++;
      } else {
        pending++;
      }
    });

    const makeupGenerated = missed + justified;
    const creditsTransferredIn = isLastStage ? accumulatedMakeupCreditsToTransfer : 0;

    // Si no es la última etapa y hay cambio de instrumento, las faltas migran al nuevo instrumento
    if (!isLastStage && hasTransition) {
      accumulatedMakeupCreditsToTransfer += makeupGenerated;
      // Anotar las sesiones de inasistencia para trazabilidad humana y de LLMs
      instSessions.forEach((s) => {
        if (s.status === "ausente" || s.status === "justificada") {
          s.creditDelta = 1;
          s.makeupCreditTransferred = true;
          s.targetInstrument = newInst;
          s.notes = `Inasistencia ➔ Pasa a Crédito de Recuperación en ${newInst} (Prof. ${student.teacher || 'Jeremy'})`;
        }
      });
    }

    const firstSess = instSessions[0];
    const lastSess = instSessions[instSessions.length - 1];
    const regularPending = pending;
    const totalToDeliver = isLastStage ? (regularPending + creditsTransferredIn) : 0;

    let statusText = "";
    if (isLastStage) {
      if (regularPending === 0 && creditsTransferredIn === 0) {
        statusText = "Ciclo Culminado al 100%";
      } else {
        statusText = `En Curso Lectivo Activo (${regularPending} regulares + ${creditsTransferredIn} créditos a recuperar)`;
      }
    } else {
      statusText = `Etapa Culminada por Transición (${makeupGenerated} créditos transferidos a ${newInst})`;
    }

    stages.push({
      instrument: inst,
      teacher: firstSess?.teacher || student.teacher || "Por asignar",
      room: firstSess?.room || student.room || "Sala A",
      startDate: firstSess?.dateStr || student.planStartDate || "N/A",
      endDate: lastSess?.dateStr || student.planEndDate || "N/A",
      totalQuotaSessions: instSessions.length,
      attendedCount: attended,
      missedCount: missed,
      justifiedCount: justified,
      tardyCount: tardy,
      pendingCount: pending,
      makeupCreditsGenerated: makeupGenerated,
      makeupCreditsTransferredIn: creditsTransferredIn,
      regularPendingSessions: regularPending,
      totalSessionsToDeliver: totalToDeliver,
      isCurrentStage: isLastStage,
      statusText,
    });
  });

  const currentStage = stages[stages.length - 1];
  const regularPendingInNew = currentStage ? currentStage.regularPendingSessions : 0;
  const makeupCreditsMigrated = currentStage ? currentStage.makeupCreditsTransferredIn : 0;
  const totalSessionsToDeliverInNew = currentStage ? currentStage.totalSessionsToDeliver : 0;

  return {
    stages,
    hasTransition,
    originalInstrument: originalInst,
    newInstrument: newInst,
    transitionCutOffDate,
    transitionDate,
    transitionScheduleText,
    totalMakeupCredits: accumulatedMakeupCreditsToTransfer,
    makeupCreditsMigrated,
    regularPendingInNew,
    totalSessionsToDeliverInNew,
  };
}

/**
 * Motor central de cálculo de auditoría financiera por alumno (Matriz de 3 Rubros Oficiales):
 * 1. Matrícula (Regular S/ 120, Promo Demo S/ 30 o Exonerada S/ 0)
 * 2. Mensualidad (Plan contratado, deduplicado a exactamente 1 registro para el ciclo)
 * 3. Libros y Material didáctico (Pack de útiles S/ 67 o Exonerado S/ 0 con entrega en sala)
 * Retorna además los Totales Consolidados de Cartera (Total Facturado, Cobrado y Saldo Deuda).
 */
export function computeStudentFinancialAudit(
  student: AdminStudent,
  invoices: Invoice[] = []
): StudentFinancialAuditSummary {
  const items: FinancialAuditItem[] = [];

  // Filtrar los recibos que corresponden a este alumno
  const matchedInvoices = invoices.filter((inv) => {
    const studentName = inv.student || (inv.concept?.includes("—") ? inv.concept.split("—")[1]?.trim() : "");
    return (
      isMatchingStudentName(student.name, studentName) ||
      (student.invoices && student.invoices.some((i) => i.id === inv.id))
    );
  });

  const defaultDate = student.enrollmentDate || student.planStartDate || student.joinedAt || new Date().toISOString().slice(0, 10);
  const defaultMethod = student.paymentMethod || "Yape";

  // ----------------------------------------------------
  // RUBRO 1: MATRÍCULA INSTITUCIONAL
  // ----------------------------------------------------
  const matriculaInv = matchedInvoices.find((inv) => {
    const c = (inv.concept || "").toLowerCase();
    return c.includes("matr") || c.includes("inscrip");
  });

  const matTypeStr = (student.matriculaType || "").toLowerCase();
  const isMatriculaExonerated = matTypeStr.includes("exonerad") || (!student.matriculaType && student.status === "activo" && student.name.toLowerCase().includes("sasha")) || student.matriculaType === "Exonerada";
  const isMatriculaPromo = matTypeStr.includes("promo") || matTypeStr.includes("30");

  if (matriculaInv) {
    items.push({
      id: matriculaInv.id,
      category: "matricula",
      categoryLabel: "🎓 1. Matrícula",
      concept: matriculaInv.concept,
      dateStr: matriculaInv.dueDate?.slice(0, 10) || defaultDate,
      totalAmount: Number(matriculaInv.amount) || 0,
      amountPaid: Number(matriculaInv.amountPaid) || 0,
      remainingBalance: Number(matriculaInv.remainingBalance ?? Math.max(0, (matriculaInv.amount || 0) - (matriculaInv.amountPaid || 0))),
      status: (matriculaInv.status as any) || (Number(matriculaInv.remainingBalance) === 0 ? "pagado" : "pendiente"),
      paymentMethod: matriculaInv.paymentMethod || defaultMethod,
      voucherRef: matriculaInv.paymentLogs?.[0]?.voucherRef || "MATRICULA-REGISTRADA",
      notes: matriculaInv.notes || "Matrícula institucional registrada en facturación",
    });
  } else if (isMatriculaExonerated) {
    items.push({
      id: `mat-${student.id}`,
      category: "matricula",
      categoryLabel: "🎓 1. Matrícula",
      concept: "Matrícula Institucional (Exonerada por Convenio / Beca)",
      dateStr: defaultDate,
      totalAmount: 0.0,
      amountPaid: 0.0,
      remainingBalance: 0.0,
      status: "exonerado",
      paymentMethod: "-",
      voucherRef: "EXONERADA",
      notes: "Matrícula 100% exonerada",
    });
  } else if (isMatriculaPromo) {
    const matPrice = 30.0;
    items.push({
      id: `mat-${student.id}`,
      category: "matricula",
      categoryLabel: "🎓 1. Matrícula",
      concept: "Matrícula Promocional (Promo Demo)",
      dateStr: defaultDate,
      totalAmount: matPrice,
      amountPaid: matPrice,
      remainingBalance: 0.0,
      status: "pagado",
      paymentMethod: defaultMethod,
      voucherRef: "PROMO-DEMO",
      notes: "Promoción especial con 75% descuento",
    });
  } else {
    const matPrice = 120.0;
    items.push({
      id: `mat-${student.id}`,
      category: "matricula",
      categoryLabel: "🎓 1. Matrícula",
      concept: "Matrícula Institucional Regular",
      dateStr: defaultDate,
      totalAmount: matPrice,
      amountPaid: matPrice,
      remainingBalance: 0.0,
      status: "pagado",
      paymentMethod: defaultMethod,
      voucherRef: "MATRICULA-REGULAR",
      notes: "Tarifa estándar institucional",
    });
  }

  // ----------------------------------------------------
  // RUBRO 2: MENSUALIDAD (PLAN CONTRATADO)
  // ----------------------------------------------------
  // Deduplicación estricta: exactamente 1 registro para el ciclo lectivo
  const tuitionInvoices = matchedInvoices.filter((inv) => {
    const c = (inv.concept || "").toLowerCase();
    return !c.includes("matr") && !c.includes("libro") && !c.includes("util") && !c.includes("pack");
  });

  let bestTuitionInv: Invoice | undefined;
  if (tuitionInvoices.length > 0) {
    // Priorizar recibo proveniente de PostgreSQL (con UUID largo) o con logs de pago
    bestTuitionInv = tuitionInvoices.find((inv) => inv.id.includes("-") && inv.id.length > 30) || tuitionInvoices[0];
  }

  const planPrice = bestTuitionInv ? Number(bestTuitionInv.amount) : (student.planPrice || 297.0);
  const amountPaid = bestTuitionInv ? Number(bestTuitionInv.amountPaid) : (student.amountPaid || 0.0);
  const remainingBalance = bestTuitionInv ? Number(bestTuitionInv.remainingBalance ?? Math.max(0, planPrice - amountPaid)) : Math.max(0, planPrice - amountPaid);
  const tuitionStatus: "pagado" | "pendiente" | "parcial" = remainingBalance === 0 ? "pagado" : amountPaid > 0 ? "parcial" : "pendiente";
  const voucherRef = bestTuitionInv?.paymentLogs?.[0]?.voucherRef || (amountPaid > 0 ? "PAGO-DIRECTO" : "SIN-VOUCHER");

  items.push({
    id: bestTuitionInv ? bestTuitionInv.id : `plan-${student.id}`,
    category: "mensualidad",
    categoryLabel: "🎵 2. Mensualidad",
    concept: bestTuitionInv?.concept || `Plan ${student.modality || "Regular"} (${student.instrument || "Música"}) — ${student.name}`,
    dateStr: bestTuitionInv?.dueDate?.slice(0, 10) || defaultDate,
    totalAmount: planPrice,
    amountPaid: amountPaid,
    remainingBalance: remainingBalance,
    status: tuitionStatus,
    paymentMethod: bestTuitionInv?.paymentMethod || defaultMethod,
    voucherRef: voucherRef,
    notes: `Cuota de ciclo contratado (${student.modality || "Regular (8 clases / 45 min)"})`,
  });

  // ----------------------------------------------------
  // RUBRO 3: LIBROS Y MATERIAL DIDÁCTICO
  // ----------------------------------------------------
  const librosInv = matchedInvoices.find((inv) => {
    const c = (inv.concept || "").toLowerCase();
    return c.includes("libro") || c.includes("util") || c.includes("pack");
  });

  const isLibrosExonerated = student.packUtilesCost === 0 || student.packUtilesStatus === "exonerado" || (student.name.toLowerCase().includes("sasha") && student.packUtilesCost === 0);

  if (librosInv) {
    items.push({
      id: librosInv.id,
      category: "libros",
      categoryLabel: "📚 3. Libros y Material",
      concept: librosInv.concept,
      dateStr: librosInv.dueDate?.slice(0, 10) || defaultDate,
      totalAmount: Number(librosInv.amount) || 0,
      amountPaid: Number(librosInv.amountPaid) || 0,
      remainingBalance: Number(librosInv.remainingBalance ?? Math.max(0, (librosInv.amount || 0) - (librosInv.amountPaid || 0))),
      status: (librosInv.status as any) || (Number(librosInv.remainingBalance) === 0 ? "pagado" : "pendiente"),
      paymentMethod: librosInv.paymentMethod || defaultMethod,
      voucherRef: librosInv.paymentLogs?.[0]?.voucherRef || (student.packUtilesDelivered ? "ENTREGADO-SALA" : "PENDIENTE-ENTREGA"),
      notes: librosInv.notes || (student.packUtilesDelivered ? "Entregado físicamente en sala" : "Pendiente de entrega en sala"),
      delivered: student.packUtilesDelivered ?? true,
    });
  } else if (isLibrosExonerated) {
    items.push({
      id: `lib-${student.id}`,
      category: "libros",
      categoryLabel: "📚 3. Libros y Material",
      concept: "Pack de Útiles y Material Didáctico (Exonerado / Incluido)",
      dateStr: defaultDate,
      totalAmount: 0.0,
      amountPaid: 0.0,
      remainingBalance: 0.0,
      status: "exonerado",
      paymentMethod: "-",
      voucherRef: "EXONERADO",
      notes: student.packUtilesNotes || "Material digital / exonerado",
      delivered: true,
    });
  } else {
    const bookCost = student.packUtilesCost !== undefined ? student.packUtilesCost : 67.0;
    const bookPaid = student.packUtilesAmountPaid !== undefined ? student.packUtilesAmountPaid : (student.packUtilesPaid ? bookCost : 0.0);
    const bookBalance = Math.max(0, bookCost - bookPaid);
    const bookStatus: "pagado" | "pendiente" | "parcial" = bookBalance === 0 ? "pagado" : bookPaid > 0 ? "parcial" : "pendiente";
    const deliveryStatus = student.packUtilesDelivered ? "Entregado en sala" : "Pendiente de entrega";

    items.push({
      id: `lib-${student.id}`,
      category: "libros",
      categoryLabel: "📚 3. Libros y Material",
      concept: "Pack de Útiles y Métodos Vibra (Libro & Practikid)",
      dateStr: defaultDate,
      totalAmount: bookCost,
      amountPaid: bookPaid,
      remainingBalance: bookBalance,
      status: bookStatus,
      paymentMethod: defaultMethod,
      voucherRef: student.packUtilesDelivered ? "ENTREGADO-SALA" : "PENDIENTE-ENTREGA",
      notes: student.packUtilesNotes || `Material pedagógico físico (${deliveryStatus})`,
      delivered: student.packUtilesDelivered ?? false,
    });
  }

  const totalFacturado = items.reduce((sum, it) => sum + it.totalAmount, 0);
  const totalCobrado = items.reduce((sum, it) => sum + it.amountPaid, 0);
  const totalSaldoPendiente = items.reduce((sum, it) => sum + it.remainingBalance, 0);
  const estadoGeneral = totalSaldoPendiente === 0 ? "al-dia" : totalCobrado > 0 ? "parcial" : "deudor";

  return {
    items,
    totalFacturado,
    totalCobrado,
    totalSaldoPendiente,
    estadoGeneral,
  };
}

/**
 * Calcula la liquidación del ciclo pedagógico y financiero.
 */
export function computeStudentCycleLiquidation(
  student: AdminStudent,
  sessions: StudentSessionItem[],
  customPrice?: number,
  customPaid?: number,
  invoices?: Invoice[]
): StudentCycleLiquidation {
  const modalityStr = (student.modality || "").toLowerCase();
  const isIntensive = modalityStr.includes("inten") || modalityStr.includes("90 min") || (modalityStr.includes("4 clases") && !modalityStr.includes("45 min"));
  const isFlexiblePackage = modalityStr.includes("flexible") || modalityStr.includes("demanda") || modalityStr.includes("paquete");

  let targetQuota = 8;
  if (isIntensive) targetQuota = 4;
  else if (isFlexiblePackage) targetQuota = student.packageTotalSessions || 24;

  let attendedCount = 0;
  let missedCount = 0;
  let justifiedCount = 0;
  let tardyCount = 0;
  let pendingCount = 0;
  let makeupCount = 0;

  sessions.forEach((s) => {
    if (s.isMakeup) makeupCount++;
    if (s.status === "presente") attendedCount++;
    else if (s.status === "ausente") missedCount++;
    else if (s.status === "justificada") justifiedCount++;
    else if (s.status === "tarde") {
      tardyCount++;
      attendedCount++;
    } else {
      pendingCount++;
    }
  });

  // Cálculo del desglose por instrumento y créditos de recuperación
  const breakdown = computeStudentInstrumentBreakdown(student, sessions, targetQuota);

  let sessionsInOriginal = 0;
  let sessionsInNew = 0;
  sessions.forEach((s) => {
    if (breakdown.hasTransition) {
      if (s.instrument === breakdown.originalInstrument) sessionsInOriginal++;
      else sessionsInNew++;
    }
  });

  const evaluatedCount = attendedCount + missedCount + justifiedCount;
  const completionPercentage = targetQuota > 0 ? Math.round((evaluatedCount / targetQuota) * 100) : 0;
  const isCompleted = evaluatedCount >= targetQuota;

  // Auditoría financiera oficial (Matriz de 3 Rubros: 1. Matrícula, 2. Mensualidad, 3. Libros)
  const financialAudit = computeStudentFinancialAudit(student, invoices || student.invoices || []);

  const planPrice = customPrice !== undefined ? customPrice : financialAudit.totalFacturado;
  const amountPaid = customPaid !== undefined ? customPaid : financialAudit.totalCobrado;
  const remainingBalance = Math.max(0, planPrice - amountPaid);

  let verdictText = "";
  if (isCompleted) {
    verdictText = `Ciclo completado al 100% (${evaluatedCount} de ${targetQuota} clases impartidas).`;
  } else {
    if (breakdown.hasTransition) {
      verdictText = `Ciclo en curso lectivo con cambio a ${breakdown.newInstrument}. Restan ${breakdown.regularPendingInNew} clases regulares de cuota + ${breakdown.makeupCreditsMigrated} créditos a recuperar (Total: ${breakdown.totalSessionsToDeliverInNew} clases por impartir en ${breakdown.newInstrument}).`;
    } else {
      verdictText = `Ciclo en curso lectivo. Restan ${pendingCount} clases regulares pendientes de impartir${breakdown.totalMakeupCredits > 0 ? ` (+${breakdown.totalMakeupCredits} créditos a recuperar)` : ""}.`;
    }
  }

  if (remainingBalance > 0) {
    verdictText += ` Saldo pendiente de pago: S/ ${remainingBalance.toFixed(2)}.`;
  } else {
    verdictText += ` Pagos al día (S/ 0.00 de deuda).`;
  }

  return {
    targetQuota,
    attendedCount,
    missedCount,
    justifiedCount,
    tardyCount,
    pendingCount,
    makeupCount,
    makeupCreditsAvailable: breakdown.makeupCreditsMigrated || (missedCount + justifiedCount),
    makeupCreditsGenerated: missedCount + justifiedCount,
    makeupCreditsMigrated: breakdown.makeupCreditsMigrated,
    regularPendingInNew: breakdown.regularPendingInNew,
    totalSessionsToDeliverInNew: breakdown.totalSessionsToDeliverInNew || pendingCount,
    completionPercentage,
    planPrice,
    amountPaid,
    remainingBalance,
    financialAudit,
    verdictText,
    isCompleted,
    hasInstrumentTransition: breakdown.hasTransition,
    originalInstrument: breakdown.originalInstrument,
    newInstrument: breakdown.newInstrument,
    transitionCutOffDate: breakdown.transitionCutOffDate,
    transitionDate: breakdown.transitionDate,
    transitionScheduleText: breakdown.transitionScheduleText,
    sessionsInOriginal,
    sessionsInNew,
    stages: breakdown.stages,
  };
}

/**
 * ================================================================
 * MOTOR DE RETENCIÓN & SEGUIMIENTO PREVENTIVO DE CICLOS (ADR-0139)
 * ================================================================
 * Reglas de Negocio Oficiales:
 * 1. Cero Vacante de Cortesía: El seguimiento se ejecuta DÍAS PREVIOS
 *    en fase AMARILLA (cuando restan 1 ó 2 clases/créditos).
 * 2. Renovación Limpia: Solo se renueva cuando S_pend === 0 (0 créditos).
 *    El avance se mide por clases cumplidas.
 */
export interface StudentRetentionStatus {
  category: "en_curso" | "proximo_culminar" | "culminado" | "pausa_baja";
  color: "green" | "yellow" | "red" | "gray";
  remainingSessionsToDeliver: number; // S_pend = pendingRegular + pendingMakeups + unscheduledCredits
  attendedCount: number;
  targetQuota: number;
  pendingCredits: number;
  pendingRegular: number;
  pendingMakeups: number;
  badgeLabel: string;
  badgeTooltip: string;
  canRenew: boolean;
  whatsappSuggestedType: "preventivo" | "renovacion" | "regular";
  suggestedMessage: string;
}

export function computeStudentRetentionStatus(
  student: AdminStudent,
  sessions: StudentSessionItem[],
  targetQuota: number = 8
): StudentRetentionStatus {
  if (student.status === "pausa" || student.status === "baja") {
    return {
      category: "pausa_baja",
      color: "gray",
      remainingSessionsToDeliver: 0,
      attendedCount: 0,
      targetQuota,
      pendingCredits: 0,
      pendingRegular: 0,
      pendingMakeups: 0,
      badgeLabel: "⚪ Pausa / Inactivo",
      badgeTooltip: "Alumno en pausa o baja administrativa. Vacante disponible para reasignación.",
      canRenew: false,
      whatsappSuggestedType: "regular",
      suggestedMessage: `Hola Familia ${student.family}, te saluda Secretaría de Vibra Music para coordinar el estado de ${student.name}.`,
    };
  }

  let attendedCount = 0;
  let missedCount = 0;
  let justifiedCount = 0;
  let pendingRegular = 0;
  let pendingMakeups = 0;
  let scheduledMakeups = 0;

  sessions.forEach((s) => {
    if (s.status === "presente" || s.status === "tarde") {
      attendedCount++;
    } else if (s.status === "ausente") {
      missedCount++;
    } else if (s.status === "justificada") {
      justifiedCount++;
    } else if (s.status === "pendiente") {
      if (s.isMakeup) {
        pendingMakeups++;
      } else {
        pendingRegular++;
      }
    }

    if (s.isMakeup) {
      scheduledMakeups++;
    }
  });

  // 🛡️ REGLA CENTRAL DE RETENCIÓN (ADR-0139):
  // Si el alumno ya asistió al 100% de la cuota contratada (attendedCount >= targetQuota),
  // el ciclo lectivo está formalmente CULMINADO y no debe exigir clases adicionales.
  const quotaDeficit = Math.max(0, targetQuota - attendedCount);

  // Créditos pendientes por inasistencias que aún no se han agendado
  // Acotados estrictamente por el déficit de cuota para evitar exigir créditos fantasma ya recuperados
  const scheduledMakeupsTotal = scheduledMakeups;
  const unhandledMissed = Math.max(0, missedCount + justifiedCount - scheduledMakeupsTotal);
  const pendingCredits = Math.min(quotaDeficit, Math.max(0, quotaDeficit - (pendingRegular + pendingMakeups)));

  // Sesiones pendientes por recibir para completar el ciclo lectivo contratado
  const remaining = Math.min(quotaDeficit, pendingRegular + pendingMakeups + pendingCredits);

  const firstLesson = student.scheduleLessons?.[0];
  const scheduleText = firstLesson ? `${firstLesson.day} ${firstLesson.time} (${firstLesson.room || 'Sala'})` : "su horario habitual";

  if (remaining === 0) {
    return {
      category: "culminado",
      color: "red",
      remainingSessionsToDeliver: 0,
      attendedCount,
      targetQuota,
      pendingCredits: 0,
      pendingRegular: 0,
      pendingMakeups: 0,
      badgeLabel: `🔴 Culminado (${attendedCount}/${targetQuota})`,
      badgeTooltip: "Completó al 100% sus clases y créditos. Listo para renovación limpia del nuevo ciclo.",
      canRenew: true,
      whatsappSuggestedType: "renovacion",
      suggestedMessage: `¡Hola Familia ${student.family}! 🎉 Te saludamos con mucha alegría de Vibra Music. Te contamos que ${student.name} ha culminado con 100% de éxito sus clases de ${student.instrument} con el Prof. ${student.teacher || 'de música'}. Para asegurar su vacante en su mismo horario (${scheduleText}) e iniciar su nuevo ciclo sin interrupciones, les adjuntamos los datos para su renovación mensual. ¿Desean continuar por Yape, Plin o Transferencia?`,
    };
  }

  if (remaining === 1 || remaining === 2) {
    const detailLabel = pendingCredits > 0
      ? `🟡 Restan ${remaining} (${pendingCredits} créd.)`
      : `🟡 Restan ${remaining} ${remaining === 1 ? 'clase' : 'clases'}`;

    return {
      category: "proximo_culminar",
      color: "yellow",
      remainingSessionsToDeliver: remaining,
      attendedCount,
      targetQuota,
      pendingCredits,
      pendingRegular,
      pendingMakeups,
      badgeLabel: detailLabel,
      badgeTooltip: `Alerta preventiva: Restan ${remaining} ${remaining === 1 ? 'sesión/crédito' : 'sesiones/créditos'} por cumplir. Contactar días previos para consultar continuidad y no perder la vacante.`,
      canRenew: false,
      whatsappSuggestedType: "preventivo",
      suggestedMessage: `¡Hola Familia ${student.family}! 🎵 Te saluda Secretaría de Vibra Music respecto a las clases de ${student.name} (${student.instrument}). Le ${remaining === 1 ? 'resta solo 1 clase/crédito' : `restan ${remaining} clases/créditos`} para culminar su ciclo mensual con el Prof. ${student.teacher || 'de música'}. Nos comunicamos con anticipación para consultarles si continuarán el próximo mes y así asegurar su vacante en su horario (${scheduleText}), ya que tenemos alumnos en lista de espera. ¡Quedamos atentos a su confirmación!`,
    };
  }

  return {
    category: "en_curso",
    color: "green",
    remainingSessionsToDeliver: remaining,
    attendedCount,
    targetQuota,
    pendingCredits,
    pendingRegular,
    pendingMakeups,
    badgeLabel: `🟢 En Curso (${attendedCount}/${targetQuota})`,
    badgeTooltip: `Ciclo activo en progreso normal (${remaining} sesiones por impartir).`,
    canRenew: false,
    whatsappSuggestedType: "regular",
    suggestedMessage: `Hola Familia ${student.family}, te saluda Secretaría de Vibra Music respecto al seguimiento de clases de ${student.name} (${student.instrument}).`,
  };
}

/**
 * Genera el documento estructurado en Markdown apto para lectura humana y parsing por LLMs.
 */
export function generateStudentAuditMarkdown(params: {
  student: AdminStudent;
  sessions: StudentSessionItem[];
  liquidation: StudentCycleLiquidation;
  invoices: Invoice[];
  auditLogs?: DBPaymentAuditLog[];
  emitDate?: string;
  auditCode?: string;
}): string {
  const { student, sessions, liquidation, invoices, emitDate = new Date().toISOString(), auditCode = `AUD-${Date.now().toString().slice(-6)}` } = params;

  const phone = student.phone || student.emergencyContact?.phone || "Sin teléfono";
  const apoderado = student.family || student.emergencyContact?.name || "Apoderado titular";

  // Auditoría financiera canónica de 3 rubros
  const financialAudit = liquidation.financialAudit || computeStudentFinancialAudit(student, invoices);

  const lines: string[] = [];

  lines.push(`# FICHA OFICIAL DE AUDITORÍA PEDAGÓGICA Y FINANCIERA — VIBRA MUSIC STAFF`);
  lines.push(`FECHA_EMISION: ${emitDate}`);
  lines.push(`CODIGO_AUDITORIA: ${auditCode}`);
  lines.push(`SISTEMA_FUENTE: Vibra Music Staff v2.1 (PostgreSQL Insforge)`);
  lines.push(`FILOSOFIA_INSTITUCIONAL: "Las clases no se pierden, se recuperan."`);
  lines.push(``);
  lines.push(`## 1. METADATOS DEL ALUMNO Y CONTRATO`);
  lines.push(`- ID_ALUMNO: "${student.id}"`);
  lines.push(`- NOMBRE_COMPLETO: "${student.name}"`);
  lines.push(`- ESTADO_ACTUAL: "${student.status}"`);
  lines.push(`- CATEGORIA: "${student.category || 'JUNIOR'}"`);
  lines.push(`- EDAD: ${student.age || 'No especificada'}`);
  lines.push(`- INSTRUMENTO_ACTUAL: "${student.instrument || 'Música'}"`);
  lines.push(`- MODALIDAD_PLAN: "${student.modality || 'Regular (8 clases / 45 min)'}"`);
  lines.push(`- CUOTA_CONTRATADA_CLASES: ${liquidation.targetQuota}`);
  lines.push(`- DOCENTE_ACTUAL: "${student.teacher || 'Por asignar'}"`);
  lines.push(`- SALA_ACTUAL: "${student.room || 'Sala A'}"`);
  lines.push(`- VIGENCIA_INICIO: "${student.planStartDate || student.joinedAt || 'N/A'}"`);
  lines.push(`- VIGENCIA_FIN: "${student.planEndDate || 'N/A'}"`);
  lines.push(`- APODERADO_RESPONSABLE: "${apoderado}"`);
  lines.push(`- TELEFONO_CONTACTO: "${phone}"`);
  lines.push(``);

  if (liquidation.hasInstrumentTransition) {
    lines.push(`## 2. HISTORIAL DE TRANSICIÓN DE INSTRUMENTO Y BALANCE DE CRÉDITOS`);
    lines.push(`- HUBO_TRANSICION: SI`);
    lines.push(`- INSTRUMENTO_ORIGINAL: "${liquidation.originalInstrument}"`);
    lines.push(`- INSTRUMENTO_NUEVO: "${liquidation.newInstrument}"`);
    lines.push(`- FECHA_CORTE_ORIGINAL: "${liquidation.transitionCutOffDate || '2026-09-28'}"`);
    lines.push(`- FECHA_INICIO_NUEVO: "${liquidation.transitionDate || '2026-09-29'}"`);
    lines.push(`- HORARIO_NUEVO_DOCENTE: "${liquidation.transitionScheduleText || 'Martes y Jueves 17:30 (Sala A · Jeremy)'}"`);
    lines.push(`- CLASES_EN_INSTRUMENTO_ORIGINAL: ${liquidation.sessionsInOriginal}`);
    lines.push(`- CREDITOS_A_RECUPERAR_MIGRADOS: ${liquidation.makeupCreditsMigrated} (derivados de inasistencias en ${liquidation.originalInstrument})`);
    lines.push(`- CLASES_REGULARES_RESTANTES_NUEVO: ${liquidation.regularPendingInNew}`);
    lines.push(`- TOTAL_CLASES_A_IMPARTIR_EN_NUEVO_INSTRUMENTO: ${liquidation.totalSessionsToDeliverInNew} (${liquidation.regularPendingInNew} regulares + ${liquidation.makeupCreditsMigrated} créditos a recuperar)`);
    lines.push(``);
    lines.push(`### DESGLOSE DE ETAPAS LECTIVAS:`);
    liquidation.stages.forEach((stage, sIdx) => {
      lines.push(`#### Etapa ${sIdx + 1}: ${stage.instrument} (${stage.teacher} · ${stage.room})`);
      lines.push(`- Fechas: ${stage.startDate} a ${stage.endDate}`);
      lines.push(`- Clases de cuota: ${stage.totalQuotaSessions}`);
      lines.push(`- Asistidas: ${stage.attendedCount}`);
      lines.push(`- Inasistencias (Créditos generados): ${stage.missedCount}`);
      lines.push(`- Justificadas: ${stage.justifiedCount}`);
      lines.push(`- Clases Regulares Pendientes: ${stage.regularPendingSessions}`);
      lines.push(`- Créditos Transferidos recibidos: ${stage.makeupCreditsTransferredIn}`);
      lines.push(`- Total de Clases a Entregar en esta etapa: ${stage.totalSessionsToDeliver}`);
      lines.push(`- Estado: "${stage.statusText}"`);
      lines.push(``);
    });
  }

  lines.push(`## 3. KARDEX DETALLADO DE SESIONES (1 a ${sessions.length})`);
  lines.push(`| N° | FECHA_ISO   | DIA       | HORA  | INSTRUMENTO | SALA   | DOCENTE       | ESTADO     | TIPO        | OBSERVACION / NOTAS |`);
  lines.push(`|----|-------------|-----------|-------|-------------|--------|---------------|------------|-------------|---------------------|`);

  sessions.forEach((s, idx) => {
    // Si hay cambio de instrumento entre sesiones, agregar fila divisoria en Markdown
    if (idx > 0 && sessions[idx - 1].instrument !== s.instrument) {
      lines.push(`| -- | ${s.dateStr} | TRANSICIÓN | ${s.time} | ${s.instrument.padEnd(11)} | ${s.room.padEnd(6)} | ${s.teacher.padEnd(13)} | CAMBIO     | Transición  | Inicio formal en ${s.instrument} con Prof. ${s.teacher} (${liquidation.regularPendingInNew} regulares + ${liquidation.makeupCreditsMigrated} créditos) |`);
    }

    const estadoStr = s.status.toUpperCase();
    const tipoStr = s.isMakeup ? "Recuperación" : "Regular";
    const notasStr = s.notes || (s.recoveringLessonDate ? `Recupera clase del ${s.recoveringLessonDate}` : "-");
    lines.push(
      `| ${String(s.sessionIndex).padEnd(2)} | ${s.dateStr} | ${s.dayKey.padEnd(9)} | ${s.time} | ${s.instrument.padEnd(11)} | ${s.room.padEnd(6)} | ${s.teacher.padEnd(13)} | ${estadoStr.padEnd(10)} | ${tipoStr.padEnd(11)} | ${notasStr} |`
    );
  });
  lines.push(``);

  lines.push(`## 4. ESTADO FINANCIERO Y COMPROBANTES DE PAGO`);
  lines.push(`- TOTAL_FACTURADO: PEN ${financialAudit.totalFacturado.toFixed(2)}`);
  lines.push(`- TOTAL_ABONADO: PEN ${financialAudit.totalCobrado.toFixed(2)}`);
  lines.push(`- TOTAL_SALDO_DEUDA: PEN ${financialAudit.totalSaldoPendiente.toFixed(2)}`);
  lines.push(`- ESTADO_CONSOLIDADO: "${financialAudit.totalSaldoPendiente === 0 ? 'AL DÍA' : 'DEUDA PENDIENTE'}"`);
  lines.push(``);

  lines.push(`### MATRIZ OFICIAL DE PAGOS (1. MATRÍCULA | 2. MENSUALIDAD | 3. LIBROS):`);
  lines.push(`| ITEM | CONCEPTO | MONTO_TOTAL | MONTO_ABONADO | SALDO | ESTADO | METODO | REFERENCIA / NOTAS |`);
  lines.push(`|------|----------|-------------|---------------|-------|--------|--------|---------------------|`);

  financialAudit.items.forEach((item) => {
    lines.push(
      `| ${item.categoryLabel.padEnd(16)} | ${item.concept} | PEN ${item.totalAmount.toFixed(2)} | PEN ${item.amountPaid.toFixed(2)} | PEN ${item.remainingBalance.toFixed(2)} | ${item.status.toUpperCase().padEnd(9)} | ${item.paymentMethod} | ${item.voucherRef}${item.notes ? ` (${item.notes})` : ''} |`
    );
  });
  lines.push(
    `| **TOTALES** | **CONSOLIDADO DE CARTERA** | **PEN ${financialAudit.totalFacturado.toFixed(2)}** | **PEN ${financialAudit.totalCobrado.toFixed(2)}** | **PEN ${financialAudit.totalSaldoPendiente.toFixed(2)}** | **${financialAudit.totalSaldoPendiente === 0 ? 'AL DÍA' : 'DEUDA PENDIENTE'}** | - | - |`
  );
  lines.push(``);

  lines.push(`## 5. LIQUIDACIÓN OFICIAL Y CONCLUSIÓN DEL CICLO`);
  lines.push(`- CUOTA_CONTRATADA: ${liquidation.targetQuota} clases`);
  lines.push(`- CLASES_ASISTIDAS: ${liquidation.attendedCount} (${liquidation.targetQuota > 0 ? Math.round((liquidation.attendedCount / liquidation.targetQuota) * 100) : 0}%)`);
  lines.push(`- INASISTENCIAS_INJUSTIFICADAS: ${liquidation.missedCount}`);
  lines.push(`- FALTAS_JUSTIFICADAS: ${liquidation.justifiedCount}`);
  lines.push(`- CREDITOS_DE_RECUPERACION_A_FAVOR: ${liquidation.makeupCreditsAvailable}`);
  lines.push(`- CLASES_PENDIENTES_POR_IMPARTIR: ${liquidation.pendingCount}`);
  if (liquidation.hasInstrumentTransition) {
    lines.push(`- TOTAL_CLASES_A_RECIBIR_EN_NUEVO_CURSO: ${liquidation.totalSessionsToDeliverInNew} (${liquidation.regularPendingInNew} regulares + ${liquidation.makeupCreditsMigrated} créditos de recuperación)`);
  }
  lines.push(`- ESTADO_PROGRESO: ${liquidation.isCompleted ? 'CULMINADO' : 'EN CURSO'}`);
  lines.push(`- VEREDICTO_OFICIAL: "${liquidation.verdictText}"`);
  lines.push(``);
  lines.push(`---`);
  lines.push(`*Firma de Dirección / Secretaría: ___________________________*`);
  lines.push(`*Firma de Conformidad Apoderado: ___________________________*`);

  return lines.join("\n");
}
