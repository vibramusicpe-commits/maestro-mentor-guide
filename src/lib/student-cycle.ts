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

  const modalityStr = (studentProfile.modality || "").toLowerCase();
  const isDemoNivelacion = modalityStr.includes("nivelaci") || studentProfile.planType === "Demo Nivelación";
  const isIntensive = modalityStr.includes("inten") || modalityStr.includes("90 min") || (modalityStr.includes("4 clases") && !modalityStr.includes("45 min"));
  const isIntensivo = isIntensive;
  const isFlexiblePackage =
    modalityStr.includes("flex") ||
    modalityStr.includes("demanda") ||
    modalityStr.includes("paquete") ||
    studentProfile.planType === "Paquete Flexible" ||
    studentProfile.planType === "Paquete Especial" ||
    (studentProfile.packageTotalSessions !== undefined && studentProfile.packageTotalSessions > 8);
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

  let scanStartDate = startDate;
  // 🛡️ REGLA (ADR-0164): Si hay clases puntuales agendadas antes de planStartDate (hasta 30 días previos), incluir su fecha en la ventana de escaneo
  studentLessons.forEach((l) => {
    if (l.dateStr) {
      const [ly, lm, ld] = l.dateStr.split("-").map(Number);
      if (ly && lm && ld) {
        const lDate = new Date(ly, lm - 1, ld);
        const diffDays = Math.ceil((startDate.getTime() - lDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 0 && diffDays <= 30) {
          if (lDate < scanStartDate) {
            scanStartDate = lDate;
          }
        }
      }
    }
  });

  // 1. Recolectar todas las clases que ya cuentan con evaluación real
  const evaluatedSlots = new Set<string>();
  const evaluatedDates = new Set<string>();
  const attendedSlots = new Set<string>();
  const attendedDates = new Set<string>();
  let latestEvaluatedDate = "";

  // 🛡️ REGLA INSTITUCIONAL DE RENOVACIÓN DE CICLO (ADR-0139 & ADR-0161):
  // Evaluaciones y asistencias acotadas a la vigencia del ciclo contractual activo (dateStr >= planStartDate).
  // Esto permite que al renovar mes con un nuevo planStartDate, las 8 clases del mes anterior no agoten
  // falsamente la cuota del nuevo ciclo. Al mismo tiempo, evaluatedSlots/evaluatedDates conserva el historial
  // global para que las marcas de asistencia pasadas sigan visibles en el calendario.
  const cycleEvaluatedSlots = new Set<string>();
  const cycleEvaluatedDates = new Set<string>();
  const cycleAttendedSlots = new Set<string>();
  const cycleAttendedDates = new Set<string>();

  studentLessons.forEach((l) => {
    if (l.attendanceByDate) {
      Object.entries(l.attendanceByDate).forEach(([dateStr, att]) => {
        // 🛡️ REGLA (ADR-0105 & ADR-0152): Si la fecha está excluida por reprogramación, no considerar evaluación huérfana
        if (l.excludedDates && l.excludedDates.includes(dateStr)) {
          return;
        }
        if (att && att !== "pendiente") {
          const slot = `${dateStr}-${l.time || "16:00"}`;
          evaluatedSlots.add(slot);
          evaluatedDates.add(dateStr);
          if (att === "presente" || att === "tarde") {
            attendedSlots.add(slot);
            attendedDates.add(dateStr);
          }
          if (!latestEvaluatedDate || dateStr > latestEvaluatedDate) {
            latestEvaluatedDate = dateStr;
          }

          // Computar para el ciclo activo si coincide con o es posterior a scanStartDate
          const minCycleDate = studentProfile.planStartDate && scanStartDate < startDate ? scanStartDate.toISOString().slice(0, 10) : (studentProfile.planStartDate || "2026-08-01");
          if (dateStr >= minCycleDate) {
            cycleEvaluatedSlots.add(slot);
            cycleEvaluatedDates.add(dateStr);
            if (att === "presente" || att === "tarde") {
              cycleAttendedSlots.add(slot);
              cycleAttendedDates.add(dateStr);
            }
          }
        }
      });
    }
  });

  // 🛡️ REGLA (ADR-0157 & ADR-0165): En Plan Intensivo la cuota se rige por fechas completas (90 min),
  // mientras que en Plan Regular o Paquete Flexible se rige por bloques/sesiones individuales de 45 min.
  const evaluatedCount = isIntensive ? cycleEvaluatedDates.size : cycleEvaluatedSlots.size;
  const attendedCount = isIntensive ? cycleAttendedDates.size : cycleAttendedSlots.size;
  // 🛡️ REGLA (ADR-0134, ADR-0149 & ADR-0161): Un ciclo lectivo solo se considera formalmente culminado
  // cuando el alumno ha asistido efectivamente a todas las clases contratadas de su ciclo activo (attendedCount >= targetQuota)
  const isCycleCompleted = attendedCount >= targetQuota;

  const effectiveEndDate = studentProfile.planEndDate;
  const effectiveEndMonth = studentProfile.planEndMonth || (effectiveEndDate ? effectiveEndDate.slice(0, 7) : undefined);

  // 2. Proyectar candidatas pendientes desde planStartDate respetando días de la semana y horas
  // Escaneo dinámico: para Paquetes Flexibles o vigencias extendidas, proyectar hasta la fecha fin (mínimo 180 días)
  const daysToEnd = effectiveEndDate
    ? Math.max(isFlexiblePackage ? 180 : 90, Math.ceil((new Date(effectiveEndDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 15)
    : (isFlexiblePackage ? 180 : 90);
  const maxDaysToScan = Math.max(isFlexiblePackage ? 180 : 90, daysToEnd);
  const pendingCandidates: Array<{ dateStr: string; time: string; slot: string; isMakeup?: boolean }> = [];

  if (!isCycleCompleted) {
    for (let offset = 0; offset < maxDaysToScan; offset++) {
      const cur = new Date(scanStartDate.getFullYear(), scanStartDate.getMonth(), scanStartDate.getDate() + offset);
      const curY = cur.getFullYear();
      const curM = cur.getMonth();
      const curD = cur.getDate();
      const curDateStr = `${curY}-${String(curM + 1).padStart(2, "0")}-${String(curD).padStart(2, "0")}`;

      const jsDay = cur.getDay(); // 0=Dom, 1=Lun... 6=Sáb
      if (jsDay === 0) continue; // Domingos no lectivos
      const dayKey = WEEKDAYS_ORDER[jsDay - 1];

      // 🛡️ REGLA (ADR-0113 & ADR-0150): Paquetes Flexibles se rigen por clases consumidas (no por mes calendario rígido)
      if (!isFlexiblePackage && effectiveEndDate && curDateStr > effectiveEndDate) continue;
      if (!isFlexiblePackage && effectiveEndMonth && curDateStr.slice(0, 7) > effectiveEndMonth) continue;

      studentLessons.forEach((lesson) => {
        // Validación de fecha puntual o día de semana
        if (lesson.dateStr) {
          if (lesson.dateStr !== curDateStr) return;
        } else {
          if (curDateStr < startStr) return; // 🛡️ Clases recurrentes no se proyectan antes de planStartDate
          if (lesson.day !== dayKey) return;
        }

        // Validación de fechas excluidas (ADR-0105 & ADR-0152: exclusión incondicional)
        if (lesson.excludedDates && lesson.excludedDates.includes(curDateStr)) {
          return;
        }

        // Validación de vigencia limitada por transición (effectiveUntil / effectiveFrom)
        if (lesson.effectiveUntil && curDateStr > lesson.effectiveUntil) {
          return;
        }
        // 🛡️ REGLA ADR-0157: effectiveFrom solo aplica a plantillas recurrentes (sin dateStr)
        if (!lesson.dateStr && lesson.effectiveFrom && curDateStr < lesson.effectiveFrom) {
          if (!studentProfile.planStartDate || curDateStr < studentProfile.planStartDate) {
            return;
          }
        }

        const slot = `${curDateStr}-${lesson.time || "16:00"}`;
        // Si ya está evaluada, no duplicar como pendiente
        if (evaluatedSlots.has(slot) || (!isIntensive && evaluatedDates.has(curDateStr))) {
          return;
        }

        pendingCandidates.push({
          dateStr: curDateStr,
          time: lesson.time || "16:00",
          slot,
          isMakeup: !!lesson.isMakeup,
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
  // Si falta completar la cuota, sumar recuperaciones pendientes agendadas y próximas clases pendientes.
  const validSlots = new Set<string>(evaluatedSlots);
  const validDates = new Set<string>(evaluatedDates);

  if (!isCycleCompleted) {
    const pendingMakeups = pendingCandidates.filter((p) => p.isMakeup);
    const pendingRegular = pendingCandidates.filter((p) => !p.isMakeup);
    let chosenPendingRegular: typeof pendingRegular = [];
    if (isIntensive) {
      // 🛡️ REGLA ADR-0157 & ADR-0165: Plan Intensivo (4 clases / 90 min).
      // Cada fecha lectiva consta de 2 bloques contiguos de 45 min.
      // Se acotan las fechas pendientes completas para cumplir exactamente la cuota de targetQuota fechas.
      // ⚠️ FIX ADR-0165: Las fechas que ya tienen al menos un bloque evaluado (evaluatedDates) ya computaron
      // en evaluatedCount. Por ende, solo filtramos fechas verdaderamente futuras para datesNeeded.
      const futureDates = Array.from(new Set(pendingRegular.map((p) => p.dateStr)))
        .filter((d) => !evaluatedDates.has(d));
      const datesNeeded = Math.max(0, targetQuota - evaluatedCount - pendingMakeups.length);
      const chosenDates = new Set(futureDates.slice(0, datesNeeded));

      // Se eligen los bloques de las fechas futuras necesarias, MÁS cualquier bloque pendiente huérfano
      // en fechas que ya estaban parcialmente evaluadas (para completar sus 90 minutos si faltaba un bloque)
      chosenPendingRegular = pendingRegular.filter(
        (p) => chosenDates.has(p.dateStr) || evaluatedDates.has(p.dateStr)
      );
    } else {
      const slotsNeeded = Math.max(0, targetQuota - evaluatedCount - pendingMakeups.length);
      chosenPendingRegular = pendingRegular.slice(0, slotsNeeded);
    }
    const chosenPending = [...pendingMakeups, ...chosenPendingRegular];

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

  // A. Exclusiones directas por fecha puntual (ADR-0105 & ADR-0152: Si la fecha fue excluida por reprogramación, no mostrar)
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

  // C. Si la clase tiene fecha puntual exacta fijada por reprogramación/adelanto y coincide con la fecha
  if (lesson.dateStr && lesson.dateStr === lessonDateStr) {
    return true;
  }

  // B.1. Límites de vigencia por transición de curso para sesiones no evaluadas
  if (lesson.effectiveUntil && lessonDateStr > lesson.effectiveUntil) {
    return false;
  }
  if (!lesson.dateStr && lesson.effectiveFrom && lessonDateStr < lesson.effectiveFrom) {
    if (!studentProfile.planStartDate || lessonDateStr < studentProfile.planStartDate) {
      return false;
    }
  }

  // D. Límites de inicio de plan
  if (studentProfile.planStartDate && lessonDateStr < studentProfile.planStartDate) {
    return false;
  }

  // E. Validación contra el ciclo contractual calculado
  const cycle = computeStudentCycle(studentProfile, allScheduleLessons);
  const slotKey = `${lessonDateStr}-${lessonTime || lesson.time || "16:00"}`;

  // 🛡️ REGLA (ADR-0105, ADR-0108 & ADR-0156):
  // La sesión solo se aprueba si su franja horaria exacta (dateStr-time) forma parte de los slots
  // válidos del ciclo (evaluados, recuperaciones o regulares pendientes necesarios para la cuota).
  // No usar fallback por fecha para lecciones abiertas (!lesson.dateStr) porque causaría duplicados
  // cuando una clase fue reprogramada para ese mismo día con otra hora (ej. Mia Lucero 09:00 vs 10:30).
  if (cycle.validSlots.has(slotKey)) {
    return true;
  }

  return false;
}
