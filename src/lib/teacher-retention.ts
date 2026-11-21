/**
 * ================================================================
 * teacher-retention.ts — Motor de Seguimiento y Retención Docente 360° (ADR-0198)
 * ================================================================
 *
 * Permite a los profesores (Fernando, Nathaly, Jeremy) tener visibilidad de
 * sus propios alumnos que:
 *   1. Culminaron su ciclo contratado (ej. 8/8 clases o 4/4 intensivo) y están
 *      pendientes de renovación.
 *   2. Están próximos a culminar (resta 1 o 2 clases) para coordinar con
 *      anticipación.
 *   3. Fueron puestos en pausa o baja administrativa por secretaría al no renovar.
 *
 * 🛡️ REGLAS DE ORO ARQUITECTÓNICAS (ADR-0187, ADR-0183, ADR-0198):
 *   - CERO DATOS FINANCIEROS: El docente jamás ve montos de deuda, precios,
 *     comprobantes ni saldos bancarios. Solo información pedagógica y asistencias.
 *   - PUENTE 360° CON SECRETARÍA: El docente puede enviar un aviso estructurado
 *     a secretaría (Nayeli) mediante una nota interna directa en `internal_notes`,
 *     o contactar por WhatsApp preformateado sin interrumpir la recepción.
 *   - AISLAMIENTO DOCENTE: Cada profesor solo visualiza a sus alumnos asignados
 *     o de sus salas correspondientes.
 * ================================================================
 */

import type { AdminStudent, ScheduledLesson } from "@/store/admin-seeds";
import {
  computeStudentCycleSessions,
  computeStudentRetentionStatus,
  type StudentRetentionStatus,
  type StudentSessionItem,
} from "@/lib/kardex-calculator";
import { cleanTeacherToken } from "@/lib/teacher-portal";
import { isMatchingStudentName } from "@/lib/student-matching";
import {
  createInternalNote,
  notifyInternalNotesChanged,
} from "@/lib/services/internal-notes.service";

export interface TeacherRetentionItem {
  id: string;
  student: AdminStudent;
  teacherName: string;
  instrument: string;
  room: string;
  scheduleText: string;
  retention: StudentRetentionStatus;
  lastAttendedText: string;
  contactName: string;
  contactPhone: string;
  isInactiveStatus: boolean;
  sessions: StudentSessionItem[];
}

/**
 * Normaliza nombres para comparación robusta y sin diacríticos.
 */
function normalizeName(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resuelve la lista de alumnos en seguimiento de retención para el docente seleccionado.
 * Filtra únicamente alumnos con culminación de ciclo, próximos a culminar o en pausa/baja.
 */
export function resolveTeacherRetentionList(params: {
  adminStudents: AdminStudent[];
  schedule: ScheduledLesson[];
  teacherClean: string;
}): TeacherRetentionItem[] {
  const { adminStudents, schedule, teacherClean } = params;
  const targetClean = cleanTeacherToken(teacherClean);
  const isAll = targetClean === "todos" || !targetClean;

  const results: TeacherRetentionItem[] = [];
  const seenIds = new Set<string>();

  for (const st of adminStudents) {
    if (seenIds.has(st.id)) continue;

    const normStudentName = normalizeName(st.name);

    // 1. Verificar si el alumno pertenece a este profesor
    const studentTeacherClean = cleanTeacherToken(st.teacher);
    const matchingScheduleLessons = schedule.filter((l) => {
      if (l.status === "cancelada") return false;
      return (
        isMatchingStudentName(st.name, l.student) ||
        normalizeName(l.student) === normStudentName
      );
    });

    const isCamilaOrEmma =
      targetClean === "fernando" &&
      (isMatchingStudentName(st.name, "Camila Valentina Pastor Conco") ||
        isMatchingStudentName(st.name, "Emma Micaela Sevilla Perez") ||
        isMatchingStudentName(st.name, "Emma Sevilla"));

    let belongsToTeacher = isAll;

    if (!belongsToTeacher) {
      if (isCamilaOrEmma) {
        belongsToTeacher = true;
      } else if (
        studentTeacherClean &&
        (studentTeacherClean.includes(targetClean) || targetClean.includes(studentTeacherClean))
      ) {
        belongsToTeacher = true;
      } else if (
        matchingScheduleLessons.some((l) => {
          const lTeacherClean = cleanTeacherToken(l.teacher);
          return lTeacherClean.includes(targetClean) || targetClean.includes(lTeacherClean);
        })
      ) {
        belongsToTeacher = true;
      } else if (
        st.scheduleLessons &&
        st.scheduleLessons.some((l) => {
          const lTeacherClean = cleanTeacherToken(l.teacher);
          return lTeacherClean.includes(targetClean) || targetClean.includes(lTeacherClean);
        })
      ) {
        belongsToTeacher = true;
      } else if (!studentTeacherClean || studentTeacherClean === "prof por asignar") {
        // Fallback pedagógico por especialidad de instrumento
        const instLower = (st.instrument || "").toLowerCase();
        if (
          instLower.includes("batería") ||
          instLower.includes("guitarra") ||
          instLower.includes("bajo") ||
          instLower.includes("ukelele")
        ) {
          belongsToTeacher = targetClean === "jeremy";
        } else if (
          instLower.includes("canto") ||
          instLower.includes("infantil") ||
          instLower.includes("estimulación")
        ) {
          belongsToTeacher = targetClean === "nathaly";
        } else {
          belongsToTeacher = targetClean === "fernando";
        }
      }
    }

    if (!belongsToTeacher) continue;

    // 2. Calcular cuota contractual y estado del ciclo lectivo
    const modalityStr = (st.modality || "").toLowerCase();
    const isIntensive = modalityStr.includes("inten") || modalityStr.includes("90 min");
    const targetQuota = isIntensive ? 4 : (st.packageTotalSessions || 8);

    const sessions = computeStudentCycleSessions({
      student: st,
      allSchedule: schedule,
    });

    const retention = computeStudentRetentionStatus(st, sessions, targetQuota);
    const isInactive = st.status === "pausa" || st.status === "baja";

    // 3. Criterio de inclusión: solo alumnos que requieran seguimiento/renovación
    // Excluir alumnos activos que están en progreso normal ('en_curso')
    if (!isInactive && retention.category === "en_curso") {
      continue;
    }

    // 4. Determinar última asistencia
    const attendedSessions = sessions.filter(
      (s) => s.status === "presente" || s.status === "tarde"
    );
    const lastSession = attendedSessions[attendedSessions.length - 1];
    let lastAttendedText = "Sin asistencias evaluadas";
    if (lastSession) {
      if (lastSession.dateStr) {
        const parts = lastSession.dateStr.split("-");
        if (parts.length === 3) {
          lastAttendedText = `Última clase: ${parts[2]}/${parts[1]}/${parts[0]}`;
        } else {
          lastAttendedText = `Última clase: ${lastSession.dateStr}`;
        }
      } else {
        lastAttendedText = `Última clase: ${lastSession.time || "evaluada"}`;
      }
    }

    // 5. Horario y sala
    const firstLesson =
      st.scheduleLessons?.[0] ||
      matchingScheduleLessons[0] ||
      null;

    let resolvedTeacher = st.teacher;
    if (isCamilaOrEmma) {
      resolvedTeacher = "Fernando";
    } else if (firstLesson) {
      resolvedTeacher = firstLesson.teacher;
    }

    const defaultRoom =
      cleanTeacherToken(resolvedTeacher) === "nathaly"
        ? "Sala C"
        : cleanTeacherToken(resolvedTeacher) === "jeremy"
        ? "Sala A"
        : "Sala B";

    const room = firstLesson?.room || defaultRoom;
    const scheduleText = firstLesson
      ? `${firstLesson.day} ${firstLesson.time}`
      : "Sin horario fijo";

    // 6. Datos de contacto para coordinación
    const contactName =
      st.emergencyContact?.name || st.family || "Sin apoderado registrado";
    const contactPhone =
      st.emergencyContact?.phone || st.phone || "";

    seenIds.add(st.id);
    results.push({
      id: st.id,
      student: st,
      teacherName: resolvedTeacher || "Profesor",
      instrument: st.instrument || firstLesson?.instrument || "Música",
      room,
      scheduleText,
      retention,
      lastAttendedText,
      contactName,
      contactPhone,
      isInactiveStatus: isInactive,
      sessions,
    });
  }

  // Ordenar prioritariamente: primero los culminados sin renovar, luego próximos a culminar, luego pausa/baja
  return results.sort((a, b) => {
    const priority = (item: TeacherRetentionItem) => {
      if (item.retention.category === "culminado") return 1;
      if (item.retention.category === "proximo_culminar") return 2;
      return 3;
    };
    return priority(a) - priority(b);
  });
}

/**
 * Dispara una alerta formal y estructurada a Secretaría (Nayeli / Dirección)
 * mediante la bandeja de `internal_notes`.
 */
export async function sendTeacherRenewalAlert(params: {
  item: TeacherRetentionItem;
  teacherName: string;
  teacherId?: string | null;
}): Promise<void> {
  const { item, teacherName, teacherId } = params;

  const cycleStatusDetail = item.isInactiveStatus
    ? "está en pausa/baja administrativa"
    : item.retention.category === "culminado"
    ? `culminó el 100% de sus clases (${item.retention.attendedCount}/${item.retention.targetQuota})`
    : `está próximo a culminar (resta solo ${item.retention.remainingSessionsToDeliver} clase)`;

  const body = `[ALERTA DOCENTE - RENOVACIÓN] El Prof. ${teacherName} reporta que el alumno ${item.student.name} (${item.instrument}) ${cycleStatusDetail}. Por favor coordinar renovación con apoderado ${item.contactName} (Tel: ${item.contactPhone || "sin tel."}) para reservar su vacante habitual (${item.scheduleText} · ${item.room}).`;

  await createInternalNote({
    studentId: item.student.id,
    studentName: item.student.name,
    teacherId: teacherId ?? null,
    teacherName,
    body,
    visibility: "staff",
  });

  notifyInternalNotesChanged();
}
