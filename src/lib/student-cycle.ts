import type { ScheduledLesson, AdminStudent } from "@/store/app-store";
import { isMatchingStudentName } from "./student-matching";
import { WEEKDAYS_ORDER, MONTHS_NAME, WEEKDAY_FULL_NAMES } from "./calendar-utils";

export interface StudentCycleCalculation {
  validSlots: Set<string>; // "YYYY-MM-DD-HH:mm"
  validDates: Set<string>; // "YYYY-MM-DD"
  evaluatedSlots: Set<string>; // "YYYY-MM-DD-HH:mm"
  evaluatedDates: Set<string>; // "YYYY-MM-DD"
  lastEvaluatedDate?: string; // YYYY-MM-DD
  isCycleCompleted: boolean;
  targetQuota: number;
  evaluatedCount: number;
}

/**
 * Cache en memoria por ciclo de renderizado para evitar recálculos redundantes
 * en componentes de alta frecuencia de render como AgendaBoard.
 */
const cycleCache = new Map<string, { timestamp: number; result: StudentCycleCalculation }>();

/**
 * Calcula el ciclo contractual exacto de un alumno (8 clases Regular / 4 Intensivo / N Flexible).
 *
 * Reglas Fundamentales (ADR-0100, ADR-0105, ADR-0107, ADR-0108):
 * 1. Preservación incondicional de asistencias: Cualquier sesión evaluada (presente, ausente,
 *    tarde, justificada) forma parte inamovible del historial del alumno.
 * 2. Cierre estricto de ciclo: Si el alumno ya completó su cuota (evaluadas >= targetQuota,
 *    ej. Emma Sevilla con 8 clases al 18 de Setiembre), NO se proyecta ninguna clase pendiente
 *    adicional en fechas posteriores ni en meses siguientes.
 * 3. Proyección acotada: Si al alumno le faltan clases, solo se proyectan las pendientes necesarias
 *    hasta alcanzar exactamente su cuota contractual (targetQuota) y dentro de su vigencia.
 */
export function computeStudentCycle(
  studentProfile: AdminStudent | undefined,
  allScheduleLessons: ScheduledLesson[]
): StudentCycleCalculation {
  if (!studentProfile || studentProfile.status !== "activo") {
    return {
      validSlots: new Set(),
      validDates: new Set(),
      evaluatedSlots: new Set(),
      evaluatedDates: new Set(),
      isCycleCompleted: false,
      targetQuota: 0,
      evaluatedCount: 0,
    };
  }

  const cacheKey = `${studentProfile.id}-${studentProfile.updatedAt || ""}-${allScheduleLessons.length}`;
  const cached = cycleCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < 1000) {
    return cached.result;
  }

  const isDemoNivelacion = studentProfile.modality?.toLowerCase().includes("nivelaci") || studentProfile.planType === "Demo Nivelación";
  const isIntensivo = studentProfile.modality?.includes("Intensivo");
  const isFlexiblePackage = studentProfile.modality?.includes("Paquete Flexible") || studentProfile.planType === "Paquete Flexible" || (studentProfile.packageTotalSessions !== undefined && studentProfile.packageTotalSessions > 8);
  const targetQuota = studentProfile.packageTotalSessions || (isDemoNivelacion ? 1 : isFlexiblePackage ? 24 : isIntensivo ? 4 : 8);

  const startStr = studentProfile.planStartDate || "2026-08-01";
  const [sy, sm, sd] = startStr.split("-").map(Number);
  const startDate = sy && sm && sd ? new Date(sy, sm - 1, sd) : new Date(2026, 7, 1);

  // Filtrar lecciones correspondientes a este alumno (fusionando lecciones en memoria con las guardadas en studentProfile de PostgreSQL)
  const profileLessons = Array.isArray(studentProfile.scheduleLessons) && studentProfile.scheduleLessons.length > 0
    ? studentProfile.scheduleLessons.filter((l) => l.status !== "cancelada")
    : [];

  const storeLessons = allScheduleLessons.filter(
    (l) => l.status !== "cancelada" && isMatchingStudentName(l.student, studentProfile.name)
  );

  const mergedLessonsMap = new Map<string, ScheduledLesson>();
  storeLessons.forEach((l) => mergedLessonsMap.set(l.id || `${l.day}-${l.time}-${l.dateStr || ""}`, l));
  profileLessons.forEach((l) => mergedLessonsMap.set(l.id || `${l.day}-${l.time}-${l.dateStr || ""}`, l));
  const studentLessons = Array.from(mergedLessonsMap.values());

  // 1. Recolectar todas las clases que ya cuentan con evaluación real
  const evaluatedSlots = new Set<string>();
  const evaluatedDates = new Set<string>();
  let latestEvaluatedDate = "";

  studentLessons.forEach((l) => {
    if (l.attendanceByDate) {
      Object.entries(l.attendanceByDate).forEach(([dateStr, att]) => {
        if (att && att !== "pendiente") {
          const slot = `${dateStr}-${l.time || "16:00"}`;
          evaluatedSlots.add(slot);
          evaluatedDates.add(dateStr);
          if (!latestEvaluatedDate || dateStr > latestEvaluatedDate) {
            latestEvaluatedDate = dateStr;
          }
        }
      });
    }
  });

  const evaluatedCount = evaluatedDates.size;
  const isCycleCompleted = evaluatedCount >= targetQuota;

  const effectiveEndDate = studentProfile.planEndDate;
  const effectiveEndMonth = studentProfile.planEndMonth || (effectiveEndDate ? effectiveEndDate.slice(0, 7) : undefined);

  // 2. Proyectar candidatas pendientes desde planStartDate respetando días de la semana y horas
  // Escaneo dinámico: para Paquetes Flexibles o vigencias extendidas, proyectar hasta la fecha fin (mínimo 180 días)
  const daysToEnd = effectiveEndDate
    ? Math.max(90, Math.ceil((new Date(effectiveEndDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 15)
    : (isFlexiblePackage ? 180 : 90);
  const maxDaysToScan = Math.max(isFlexiblePackage ? 180 : 90, daysToEnd);
  const pendingCandidates: Array<{ dateStr: string; time: string; slot: string }> = [];

  if (!isCycleCompleted) {
    for (let offset = 0; offset < maxDaysToScan; offset++) {
      const cur = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + offset);
      const curY = cur.getFullYear();
      const curM = cur.getMonth();
      const curD = cur.getDate();
      const curDateStr = `${curY}-${String(curM + 1).padStart(2, "0")}-${String(curD).padStart(2, "0")}`;

      const jsDay = cur.getDay(); // 0=Dom, 1=Lun... 6=Sáb
      if (jsDay === 0) continue; // Domingos no lectivos
      const dayKey = WEEKDAYS_ORDER[jsDay - 1];

      // Si supera la fecha o mes de fin del plan, no proyectar clases pendientes
      if (effectiveEndDate && curDateStr > effectiveEndDate) continue;
      if (effectiveEndMonth && curDateStr.slice(0, 7) > effectiveEndMonth) continue;

      studentLessons.forEach((lesson) => {
        // Validación de fecha puntual o día de semana
        if (lesson.dateStr) {
          if (lesson.dateStr !== curDateStr) return;
        } else {
          if (lesson.day !== dayKey) return;
        }

        // Validación de fechas excluidas
        if (lesson.excludedDates && lesson.excludedDates.includes(curDateStr)) {
          return;
        }

        // Validación de vigencia limitada por transición (effectiveUntil / effectiveFrom)
        if (lesson.effectiveUntil && curDateStr > lesson.effectiveUntil) {
          return;
        }
        if (lesson.effectiveFrom && curDateStr < lesson.effectiveFrom) {
          return;
        }

        const slot = `${curDateStr}-${lesson.time || "16:00"}`;
        // Si ya está evaluada, no duplicar como pendiente
        if (evaluatedSlots.has(slot) || evaluatedDates.has(curDateStr)) {
          return;
        }

        pendingCandidates.push({
          dateStr: curDateStr,
          time: lesson.time || "16:00",
          slot,
        });
      });
    }

    // Ordenar pendientes cronológicamente
    pendingCandidates.sort((a, b) => {
      const cmp = a.dateStr.localeCompare(b.dateStr);
      if (cmp !== 0) return cmp;
      return a.time.localeCompare(b.time);
    });
  }

  // 3. Consolidar slots válidos:
  // Si el ciclo ya culminó, ÚNICAMENTE las sesiones evaluadas son válidas.
  // Si falta completar la cuota, sumar exactamente las próximas N clases pendientes necesarias.
  const validSlots = new Set<string>(evaluatedSlots);
  const validDates = new Set<string>(evaluatedDates);

  if (!isCycleCompleted) {
    const slotsNeeded = targetQuota - evaluatedCount;
    const chosenPending = pendingCandidates.slice(0, Math.max(0, slotsNeeded));

    chosenPending.forEach((p) => {
      validSlots.add(p.slot);
      validDates.add(p.dateStr);
    });
  }

  const result: StudentCycleCalculation = {
    validSlots,
    validDates,
    evaluatedSlots,
    evaluatedDates,
    lastEvaluatedDate: latestEvaluatedDate || undefined,
    isCycleCompleted,
    targetQuota,
    evaluatedCount,
  };

  cycleCache.set(cacheKey, { timestamp: now, result });
  return result;
}

/**
 * Valida si una lección en una fecha y hora específicas forma parte del ciclo
 * lectivo activo del alumno, respetando asistencias previas y cuota contractual.
 */
export function isLessonInStudentCycle(
  studentProfile: AdminStudent | undefined,
  lesson: ScheduledLesson,
  lessonDateStr: string,
  lessonTime: string | undefined,
  allScheduleLessons: ScheduledLesson[]
): boolean {
  if (!studentProfile || studentProfile.status !== "activo") {
    return false;
  }

  // A. Exclusiones directas por fecha puntual
  if (lesson.excludedDates && lesson.excludedDates.includes(lessonDateStr)) {
    return false;
  }
  if (lesson.dateStr && lesson.dateStr !== lessonDateStr) {
    return false;
  }

  // B. Preservación incondicional de asistencias evaluadas en esta fecha
  const evaluatedAtt = lesson.attendanceByDate?.[lessonDateStr];
  if (evaluatedAtt && evaluatedAtt !== "pendiente") {
    return true;
  }

  // B.1. Límites de vigencia por transición de curso para sesiones no evaluadas
  if (lesson.effectiveUntil && lessonDateStr > lesson.effectiveUntil) {
    return false;
  }
  if (lesson.effectiveFrom && lessonDateStr < lesson.effectiveFrom) {
    return false;
  }

  // C. Si la clase tiene fecha puntual exacta fijada por reprogramación/adelanto y coincide con la fecha
  if (lesson.dateStr && lesson.dateStr === lessonDateStr) {
    return true;
  }

  // D. Límites de inicio de plan
  if (studentProfile.planStartDate && lessonDateStr < studentProfile.planStartDate) {
    return false;
  }

  // E. Validación contra el ciclo contractual calculado
  const cycle = computeStudentCycle(studentProfile, allScheduleLessons);
  const slotKey = `${lessonDateStr}-${lessonTime || lesson.time || "16:00"}`;

  // Si la celda coincide con un slot válido del ciclo (evaluado o pendiente necesario)
  if (cycle.validSlots.has(slotKey) || (cycle.validDates.has(lessonDateStr) && !lesson.dateStr)) {
    return true;
  }

  return false;
}
