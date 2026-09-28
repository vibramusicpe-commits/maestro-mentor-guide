/**
 * ================================================================
 * kardex-calculator.ts — Motor de Cálculo de Ciclos, Liquidación y
 * Exportación Estructurada (Kardex & Ficha de Auditoría)
 * ================================================================
 * 
 * Reglas de Negocio Implementadas:
 * - ADR-0099, ADR-0100: Cuotas de 8 clases (Regular) y 4 clases (Intensivo).
 * - ADR-0105: Deduplicación estricta por franja horaria (dateStr-time).
 * - ADR-0108: Cierre estricto de ciclo y preservación incondicional de asistencias.
 * - ADR-0131: Barreras temporales por transición de curso (effectiveFrom, effectiveUntil).
 * - Generador de formato dual (Humano y LLM/Auditoría).
 */

import type { AdminStudent, ScheduledLesson, WeekDay, Invoice, DBPaymentAuditLog } from "@/store/app-store";
import { isMatchingStudentName } from "@/lib/student-matching";

export const WEEKDAYS_ORDER: WeekDay[] = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export const WEEKDAY_FULL_NAMES: Record<string, string> = {
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
}

export interface ComputeCycleOptions {
  student: AdminStudent;
  allSchedule: ScheduledLesson[];
  selectedYear?: number;
  selectedMonth?: number; // 0-indexed
}

export interface StudentCycleLiquidation {
  targetQuota: number;
  attendedCount: number;
  missedCount: number;
  justifiedCount: number;
  tardyCount: number;
  pendingCount: number;
  makeupCount: number;
  completionPercentage: number;
  planPrice: number;
  amountPaid: number;
  remainingBalance: number;
  verdictText: string;
  isCompleted: boolean;
  hasInstrumentTransition: boolean;
  originalInstrument?: string;
  newInstrument?: string;
  transitionDate?: string;
  sessionsInOriginal: number;
  sessionsInNew: number;
}

/**
 * Calcula las semanas de un mes (utilidad para coincidir semana con fecha)
 */
export function getMonthWeeks(year: number, month: number) {
  const weeks: { weekIndex: number; days: { dateStr: string; dayKey: WeekDay }[] }[] = [];
  const firstDay = new Date(year, month, 1);
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
  const isFlexiblePackage = modalityStr.includes("flexible") || modalityStr.includes("demanda") || modalityStr.includes("paquete");

  let targetQuota = 8;
  if (isIntensive) targetQuota = 4;
  else if (isFlexiblePackage) targetQuota = student.packageTotalSessions || 24;

  const effectivePlanStartDate = student.planStartDate || student.joinedAt || undefined;
  const effectivePlanEndDate = student.planEndDate || undefined;

  // Filtrar lecciones del alumno (tanto en adminStudents.scheduleLessons como en store.schedule)
  const studentLessonsMap = new Map<string, ScheduledLesson>();
  (student.scheduleLessons || []).forEach((l) => studentLessonsMap.set(l.id, l));
  allSchedule
    .filter((l) => isMatchingStudentName(l.student, student.name))
    .forEach((l) => studentLessonsMap.set(l.id, l));
  const studentLessons = Array.from(studentLessonsMap.values());

  const defaultStartStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
  const startStr = effectivePlanStartDate || defaultStartStr;
  const [sy, sm, sd] = startStr.split("-").map(Number);
  if (!sy || !sm || !sd) return [];

  const startDate = new Date(sy, sm - 1, sd);
  const rawCandidates: StudentSessionItem[] = [];
  const daysToEnd = effectivePlanEndDate
    ? Math.max(90, Math.ceil((new Date(effectivePlanEndDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 15)
    : (isFlexiblePackage ? 180 : 90);
  const maxDaysToScan = Math.max(isFlexiblePackage ? 180 : 90, daysToEnd);

  for (let offset = 0; offset < maxDaysToScan; offset++) {
    const cur = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + offset);
    const curY = cur.getFullYear();
    const curM = cur.getMonth();
    const curD = cur.getDate();
    const curDateStr = `${curY}-${String(curM + 1).padStart(2, "0")}-${String(curD).padStart(2, "0")}`;

    const jsDay = cur.getDay(); // 0 Dom, 1 Lun, 2 Mar, 3 Mié, 4 Jue, 5 Vie, 6 Sáb
    if (jsDay === 0) continue; // No domingos
    const dayKey = WEEKDAYS_ORDER[jsDay - 1];

    const isBeyondEnd = effectivePlanEndDate ? curDateStr > effectivePlanEndDate : false;

    studentLessons.forEach((lesson) => {
      if (lesson.month !== undefined && lesson.month !== curM) return;
      if (lesson.year !== undefined && lesson.year !== curY) return;

      // A. Fecha exacta fija
      if (lesson.dateStr) {
        if (lesson.dateStr !== curDateStr) return;
      } else {
        // B. Recurrente por día
        if (lesson.day !== dayKey) return;
      }

      // C. Fechas excluidas por reprogramación
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

  // 1. Orden cronológico
  rawCandidates.sort((a, b) => {
    const cmp = a.dateStr.localeCompare(b.dateStr);
    if (cmp !== 0) return cmp;
    return a.time.localeCompare(b.time);
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

  // 3. Respetar cuota contractual
  let finalSessions: StudentSessionItem[] = [];
  if (isFlexiblePackage) {
    finalSessions = deduped.slice(0, targetQuota);
  } else {
    if (deduped.length <= targetQuota) {
      finalSessions = deduped;
    } else {
      const evaluated = deduped.filter((s) => s.status !== "pendiente");
      if (evaluated.length >= targetQuota) {
        finalSessions = evaluated;
      } else {
        const pending = deduped.filter((s) => s.status === "pendiente");
        const slotsNeeded = targetQuota - evaluated.length;
        const chosenPending = pending.slice(0, slotsNeeded);

        const combined = [...evaluated, ...chosenPending];
        combined.sort((a, b) => {
          const cmp = a.dateStr.localeCompare(b.dateStr);
          if (cmp !== 0) return cmp;
          return a.time.localeCompare(b.time);
        });
        finalSessions = combined;
      }
    }
  }

  // 4. Numerar secuencialmente (Sesión 1 a N)
  finalSessions.forEach((item, idx) => {
    item.sessionIndex = idx + 1;
  });

  return finalSessions;
}

/**
 * Calcula la liquidación del ciclo pedagógico y financiero.
 */
export function computeStudentCycleLiquidation(
  student: AdminStudent,
  sessions: StudentSessionItem[],
  customPrice?: number,
  customPaid?: number,
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

  // Detección de transición de instrumento
  const instrumentsFound = Array.from(new Set(sessions.map((s) => s.instrument).filter(Boolean)));
  const hasTransition = !!(student.courseTransition || instrumentsFound.length > 1);
  const originalInst = student.courseTransition?.originalInstrument || (instrumentsFound.length > 1 ? instrumentsFound[0] : student.instrument);
  const newInst = student.courseTransition?.newInstrument || (instrumentsFound.length > 1 ? instrumentsFound[instrumentsFound.length - 1] : student.instrument);
  const transitionDate = student.courseTransition?.effectiveDate;

  let sessionsInOriginal = 0;
  let sessionsInNew = 0;

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

    if (hasTransition) {
      if (s.instrument === originalInst) sessionsInOriginal++;
      else sessionsInNew++;
    }
  });

  const evaluatedCount = attendedCount + missedCount + justifiedCount;
  const completionPercentage = targetQuota > 0 ? Math.round((evaluatedCount / targetQuota) * 100) : 0;
  const isCompleted = evaluatedCount >= targetQuota;

  const planPrice = customPrice !== undefined ? customPrice : (student.planPrice || 297);
  const amountPaid = customPaid !== undefined ? customPaid : (student.amountPaid || 0);
  const remainingBalance = Math.max(0, planPrice - amountPaid);

  let verdictText = "";
  if (isCompleted) {
    verdictText = `Ciclo completado al 100% (${evaluatedCount} de ${targetQuota} clases impartidas).`;
  } else {
    verdictText = `Ciclo en curso lectivo. Restan ${pendingCount} clases pendientes de impartir.`;
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
    completionPercentage,
    planPrice,
    amountPaid,
    remainingBalance,
    verdictText,
    isCompleted,
    hasInstrumentTransition: hasTransition,
    originalInstrument: originalInst,
    newInstrument: newInst,
    transitionDate,
    sessionsInOriginal,
    sessionsInNew,
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
  const { student, sessions, liquidation, invoices, auditLogs = [], emitDate = new Date().toISOString(), auditCode = `AUD-${Date.now().toString().slice(-6)}` } = params;

  const phone = student.phone || student.emergencyContact?.phone || "Sin teléfono";
  const apoderado = student.family || student.emergencyContact?.name || "Apoderado titular";

  // Filtrar recibos asociados a este alumno
  const matchingInvoices = invoices.filter((inv) => {
    return (
      isMatchingStudentName(student.name, inv.student || "") ||
      (inv.concept && isMatchingStudentName(student.name, inv.concept.split("—")[1]?.trim() || "")) ||
      (student.invoices && student.invoices.some((i) => i.id === inv.id))
    );
  });

  const lines: string[] = [];

  lines.push(`# FICHA OFICIAL DE AUDITORÍA PEDAGÓGICA Y FINANCIERA — VIBRA MUSIC STAFF`);
  lines.push(`FECHA_EMISION: ${emitDate}`);
  lines.push(`CODIGO_AUDITORIA: ${auditCode}`);
  lines.push(`SISTEMA_FUENTE: Vibra Music Staff v2.1 (PostgreSQL Insforge)`);
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
    lines.push(`## 2. HISTORIAL DE TRANSICIÓN DE CURSO / INSTRUMENTO`);
    lines.push(`- HUBO_TRANSICION: SI`);
    lines.push(`- INSTRUMENTO_ORIGINAL: "${liquidation.originalInstrument}"`);
    lines.push(`- INSTRUMENTO_NUEVO: "${liquidation.newInstrument}"`);
    lines.push(`- FECHA_EFECTIVA_CAMBIO: "${liquidation.transitionDate || 'En curso lectivo'}"`);
    lines.push(`- CLASES_EN_INSTRUMENTO_ORIGINAL: ${liquidation.sessionsInOriginal}`);
    lines.push(`- CLASES_EN_INSTRUMENTO_NUEVO: ${liquidation.sessionsInNew}`);
    lines.push(``);
  }

  lines.push(`## 3. KARDEX DETALLADO DE SESIONES (1 a ${sessions.length})`);
  lines.push(`| N° | FECHA_ISO   | DIA       | HORA  | INSTRUMENTO | SALA   | DOCENTE       | ESTADO     | TIPO        | OBSERVACION / NOTAS |`);
  lines.push(`|----|-------------|-----------|-------|-------------|--------|---------------|------------|-------------|---------------------|`);

  sessions.forEach((s) => {
    const estadoStr = s.status.toUpperCase();
    const tipoStr = s.isMakeup ? "Recuperación" : "Regular";
    const notasStr = s.notes || (s.recoveringLessonDate ? `Recupera clase del ${s.recoveringLessonDate}` : "-");
    lines.push(
      `| ${String(s.sessionIndex).padEnd(2)} | ${s.dateStr} | ${s.dayKey.padEnd(9)} | ${s.time} | ${s.instrument.padEnd(11)} | ${s.room.padEnd(6)} | ${s.teacher.padEnd(13)} | ${estadoStr.padEnd(10)} | ${tipoStr.padEnd(11)} | ${notasStr} |`
    );
  });
  lines.push(``);

  lines.push(`## 4. ESTADO FINANCIERO Y COMPROBANTES DE PAGO`);
  lines.push(`- PRECIO_PLAN_CONTRATADO: PEN ${liquidation.planPrice.toFixed(2)}`);
  lines.push(`- TOTAL_ABONADO: PEN ${liquidation.amountPaid.toFixed(2)}`);
  lines.push(`- SALDO_PENDIENTE: PEN ${liquidation.remainingBalance.toFixed(2)}`);
  lines.push(`- ESTADO_PAGO: "${liquidation.remainingBalance === 0 ? 'al-dia' : 'pendiente'}"`);
  lines.push(`- PACK_UTILES_ESTADO: "${student.packUtilesStatus || 'cancelado'}" (PEN ${(student.packUtilesCost || 67).toFixed(2)})`);
  lines.push(``);

  lines.push(`### DETALLE DE RECIBOS Y ABONOS REGISTRADOS:`);
  lines.push(`| FECHA_REGISTRO | RECIBO_ID | CONCEPTO | MONTO_TOTAL | MONTO_ABONADO | SALDO | METODO | REFERENCIA |`);
  lines.push(`|----------------|-----------|----------|-------------|---------------|-------|--------|------------|`);

  if (matchingInvoices.length === 0) {
    lines.push(`| ${student.joinedAt || '2026-08-01'} | REC-OFICIAL | Mensualidad ${student.modality || 'Regular'} | PEN ${liquidation.planPrice.toFixed(2)} | PEN ${liquidation.amountPaid.toFixed(2)} | PEN ${liquidation.remainingBalance.toFixed(2)} | Yape | REGISTRO-INICIAL |`);
  } else {
    matchingInvoices.forEach((inv) => {
      lines.push(
        `| ${inv.dueDate || '2026-08-31'} | ${inv.id.slice(0, 10)} | ${inv.concept} | PEN ${(inv.amount || 297).toFixed(2)} | PEN ${(inv.amountPaid || 0).toFixed(2)} | PEN ${(inv.remainingBalance ?? 0).toFixed(2)} | ${inv.paymentMethod || 'Yape'} | ${inv.paymentLogs?.[0]?.voucherRef || 'REF-ABONO'} |`
      );
    });
  }
  lines.push(``);

  lines.push(`## 5. LIQUIDACIÓN OFICIAL Y CONCLUSIÓN DEL CICLO`);
  lines.push(`- CUOTA_CONTRATADA: ${liquidation.targetQuota} clases`);
  lines.push(`- CLASES_ASISTIDAS: ${liquidation.attendedCount} (${liquidation.targetQuota > 0 ? Math.round((liquidation.attendedCount / liquidation.targetQuota) * 100) : 0}%)`);
  lines.push(`- INASISTENCIAS_INJUSTIFICADAS: ${liquidation.missedCount}`);
  lines.push(`- FALTAS_JUSTIFICADAS: ${liquidation.justifiedCount}`);
  lines.push(`- CLASES_CON_TARDANZA: ${liquidation.tardyCount}`);
  lines.push(`- CLASES_REPROGRAMADAS_RECUPERADAS: ${liquidation.makeupCount}`);
  lines.push(`- CLASES_PENDIENTES_POR_IMPARTIR: ${liquidation.pendingCount}`);
  lines.push(`- ESTADO_PROGRESO: ${liquidation.isCompleted ? 'CULMINADO' : 'EN CURSO'}`);
  lines.push(`- VEREDICTO_OFICIAL: "${liquidation.verdictText}"`);
  lines.push(``);
  lines.push(`---`);
  lines.push(`*Firma de Dirección / Secretaría: ___________________________*`);
  lines.push(`*Firma de Conformidad Apoderado: ___________________________*`);

  return lines.join("\n");
}
