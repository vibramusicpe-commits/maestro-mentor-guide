/**
 * ============================================================================
 * LAYA REALTIME MATCHER — Enlazador en Tiempo Real con la Agenda de Clases
 * Conexión de decisiones Laya con la base de datos viva y reglas ADR-0102
 * ============================================================================
 */
import type { AdminStudent, ScheduledLesson } from "@/store/app-store";
import { findStudentProfileByName, isMatchingStudentName, normalizeStudentName } from "@/lib/student-matching";
import { availableTeachers, rooms, timeSlotsWeekday, timeSlotsSaturday } from "@/store/admin-seeds";

export interface MatchedSlotAnalysis {
  requestedDay: string;
  requestedTime: string;
  assignedTeacher: string;
  assignedRoom: string;
  enrolledCount: number;
  availableVacancies: number;
  isAvailable: boolean;
  enrolledStudents: string[];
  alternatives: {
    day: string;
    time: string;
    teacher: string;
    room: string;
    availableVacancies: number;
  }[];
}

export interface LayaParsedRequest {
  detectedStudent?: AdminStudent;
  detectedStudentConfidence: number;
  intent: string;
  day: string;
  time: string;
  reason: string;
  isJustified: boolean;
  urgencyLabel: string;
  slotAnalysis?: MatchedSlotAnalysis;
  suggestedWhatsAppMessage: string;
}

/**
 * Resuelve qué docente y sala corresponden según el instrumento y la edad (ADR-0102)
 */
export function resolveTeacherAndRoomByPedagogy(params: {
  instrument?: string;
  age?: number;
  preferredTeacher?: string;
}): { teacher: string; room: string } {
  const { instrument = "", age, preferredTeacher } = params;
  const instLower = instrument.toLowerCase();

  if (preferredTeacher && preferredTeacher !== "Prof. por Asignar") {
    if (preferredTeacher.toLowerCase().includes("nathaly")) return { teacher: "Nathaly", room: "Sala C" };
    if (preferredTeacher.toLowerCase().includes("fernando")) return { teacher: "Fernando", room: "Sala B" };
    if (preferredTeacher.toLowerCase().includes("jeremy")) return { teacher: "Jeremy", room: "Sala A" };
  }

  // 🛡️ REGLA INNEGOCIABLE ADR-0102:
  // 1. Guitarra y Batería -> Prof. Jeremy (Sala A)
  if (instLower.includes("guitar") || instLower.includes("bater") || instLower.includes("percu")) {
    return { teacher: "Jeremy", room: "Sala A" };
  }

  // 2. Violín -> Prof. Fernando (Sala B)
  if (instLower.includes("violin")) {
    return { teacher: "Fernando", room: "Sala B" };
  }

  // 3. Canto -> Prof. Nathaly (Sala C)
  if (instLower.includes("canto") || instLower.includes("vocal")) {
    return { teacher: "Nathaly", room: "Sala C" };
  }

  // 4. Piano: separación estricta por edad (ADR-0102)
  if (age !== undefined && age >= 4 && age <= 8) {
    return { teacher: "Nathaly", room: "Sala C" }; // Piano Infantil
  }

  // Por defecto para Piano adultos/jóvenes
  return { teacher: "Fernando", room: "Sala B" };
}

/**
 * Escanea el texto libre para identificar al alumno mencionado
 */
export function extractStudentFromText(
  text: string,
  students: AdminStudent[]
): { student?: AdminStudent; confidence: number } {
  if (!text.trim()) return { confidence: 0 };

  const normInput = normalizeStudentName(text);

  // 1. Coincidencia directa con nombres completos
  for (const st of students) {
    const normName = normalizeStudentName(st.name);
    if (normInput.includes(normName)) {
      return { student: st, confidence: 0.95 };
    }
  }

  // 2. Coincidencia por partes de nombre (primer nombre + primer apellido o solo primer nombre distintivo)
  let bestStudent: AdminStudent | undefined;
  let highestScore = 0;

  students.forEach((st) => {
    const parts = normalizeStudentName(st.name).split(" ").filter((p) => p.length > 2);
    let matchedParts = 0;

    parts.forEach((p) => {
      const regex = new RegExp(`\\b${p}\\b`, "i");
      if (regex.test(normInput)) matchedParts++;
    });

    if (matchedParts > 0) {
      const score = matchedParts / parts.length;
      if (score > highestScore) {
        highestScore = score;
        bestStudent = st;
      }
    }
  });

  if (bestStudent && highestScore >= 0.4) {
    return { student: bestStudent, confidence: Math.round(highestScore * 100) / 100 };
  }

  return { confidence: 0 };
}

/**
 * Evalúa en tiempo real si el turno solicitado tiene aforo disponible (< 5 alumnos)
 */
export function analyzeSlotAvailability(params: {
  day: string;
  time: string;
  teacher: string;
  room: string;
  schedule: ScheduledLesson[];
  activeStudents: AdminStudent[];
}): MatchedSlotAnalysis {
  const { day, time, teacher, room, schedule, activeStudents } = params;
  const maxCapacity = 5;

  const activeNames = new Set(activeStudents.map((st) => normalizeStudentName(st.name)));

  // Contar alumnos inscritos en este turno exacto
  const matchingLessons = schedule.filter((l) => {
    if (l.status === "cancelada") return false;
    if (l.day !== day) return false;
    if (l.time !== time) return false;
    if (l.teacher !== teacher) return false;

    // Solo alumnos activos
    return activeNames.has(normalizeStudentName(l.student));
  });

  const enrolledStudents = matchingLessons.map((l) => l.student);
  const enrolledCount = enrolledStudents.length;
  const availableVacancies = Math.max(0, maxCapacity - enrolledCount);
  const isAvailable = enrolledCount < maxCapacity;

  // Si no está disponible o para ofrecer opciones, buscar las 2 mejores alternativas con el mismo docente
  const alternatives: MatchedSlotAnalysis["alternatives"] = [];
  const candidateTimes = day === "Sáb" ? timeSlotsSaturday : timeSlotsWeekday;

  for (const cTime of candidateTimes) {
    if (cTime === time) continue;

    const count = schedule.filter((l) => {
      if (l.status === "cancelada") return false;
      if (l.day !== day) return false;
      if (l.time !== cTime) return false;
      if (l.teacher !== teacher) return false;
      return activeNames.has(normalizeStudentName(l.student));
    }).length;

    if (count < maxCapacity) {
      alternatives.push({
        day,
        time: cTime,
        teacher,
        room,
        availableVacancies: maxCapacity - count,
      });
      if (alternatives.length >= 2) break;
    }
  }

  return {
    requestedDay: day,
    requestedTime: time,
    assignedTeacher: teacher,
    assignedRoom: room,
    enrolledCount,
    availableVacancies,
    isAvailable,
    enrolledStudents,
    alternatives,
  };
}

/**
 * Genera el texto estructurado de respuesta para WhatsApp (wa.me)
 */
export function buildWhatsAppReply(params: {
  studentName?: string;
  familyName?: string;
  intent: string;
  day: string;
  time: string;
  teacher: string;
  room: string;
  isAvailable: boolean;
  alternatives: { day: string; time: string }[];
}): string {
  const { studentName = "el alumno", familyName, intent, day, time, teacher, room, isAvailable, alternatives } = params;
  const greeting = familyName ? `¡Hola Familia ${familyName}! 🎵` : "¡Hola! Te saluda Secretaría de Vibra Music. 🎵";

  if (intent === "reprogramacion" || intent === "consulta_vacantes") {
    if (isAvailable && day !== "indeterminado" && time !== "indeterminado") {
      return (
        `${greeting}\n\n` +
        `Revisamos la agenda y *SÍ tenemos vacante disponible* para ${studentName} el *${day} a las ${time}* ` +
        `en ${room} con el Prof. ${teacher}.\n\n` +
        `¿Desean que lo dejemos registrado formalmente como su clase de recuperación? ¡Quedamos atentos para confirmarlo!`
      );
    } else if (!isAvailable && day !== "indeterminado" && time !== "indeterminado") {
      const altText = alternatives.length > 0
        ? `Te proponemos estos turnos alternativos disponibles con el mismo profesor:\n` +
          alternatives.map((a) => `• *${a.day} a las ${a.time}* (${room})`).join("\n")
        : `Por favor coméntanos qué otro día u horario te acomodaría.`;

      return (
        `${greeting}\n\n` +
        `Te comentamos que el turno del *${day} a las ${time}* con el Prof. ${teacher} ya se encuentra con *aforo completo (5/5 alumnos)* para cuidar la calidad pedagógica.\n\n` +
        `${altText}\n\n` +
        `¿Cuál de estas opciones te gustaría reservar para ${studentName}?`
      );
    }
  }

  if (intent === "justificar_falta") {
    return (
      `${greeting}\n\n` +
      `Agradecemos mucho que nos avises con anticipación la inasistencia de ${studentName}. ` +
      `Ya quedó registrada en el Kardex. Recuerda que en Vibra Music *las clases no se pierden, se recuperan*. ` +
      `En cuanto ${studentName} se encuentre mejor, coordinamos su clase de recuperación en el horario que más les convenga.`
    );
  }

  return (
    `${greeting}\n\n` +
    `Recibimos tu mensaje respecto a ${studentName}. Estamos a tu disposición para ayudarte con cualquier consulta de clases, pagos o asistencias. ¿En qué podemos apoyarte hoy?`
  );
}

/**
 * 🛡️ REQUERIMIENTO SOLICITADO: Exportar Snapshot en Tiempo Real de Disponibilidad
 * Genera dos salidas:
 * 1. Markdown Prompt Context: Formato diseñado para inyectarse como contexto vivo al Agente de Meta Business
 * 2. CSV Content: Formato tabular descargable
 */
export function generateRealtimeVacancySnapshot(params: {
  schedule: ScheduledLesson[];
  activeStudents: AdminStudent[];
}): { markdownPromptContext: string; csvContent: string } {
  const { schedule, activeStudents } = params;
  const maxCapacity = 5;

  const activeNames = new Set(activeStudents.map((st) => normalizeStudentName(st.name)));
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const teachersList = ["Nathaly", "Fernando", "Jeremy"];

  const teacherRoomMap: Record<string, { room: string; specialties: string }> = {
    Nathaly: { room: "Sala C", specialties: "Piano Infantil (4 a 8 años) y Canto" },
    Fernando: { room: "Sala B", specialties: "Piano Estándar (9+ años, jóvenes y adultos) y Violín" },
    Jeremy: { room: "Sala A", specialties: "Guitarra clásica, eléctrica y Batería" },
  };

  const rows: {
    day: string;
    time: string;
    teacher: string;
    room: string;
    specialties: string;
    enrolledCount: number;
    availableVacancies: number;
    status: string;
  }[] = [];

  days.forEach((day) => {
    const times = day === "Sáb" ? timeSlotsSaturday : timeSlotsWeekday;
    times.forEach((time) => {
      teachersList.forEach((teacher) => {
        const roomInfo = teacherRoomMap[teacher] || { room: "Sala A", specialties: "Música" };

        const enrolledCount = schedule.filter((l) => {
          if (l.status === "cancelada") return false;
          if (l.day !== day) return false;
          if (l.time !== time) return false;
          if (l.teacher !== teacher) return false;
          return activeNames.has(normalizeStudentName(l.student));
        }).length;

        const availableVacancies = Math.max(0, maxCapacity - enrolledCount);
        const status = availableVacancies === 0 ? "LLENO" : availableVacancies <= 2 ? "POCOS_CUPOS" : "DISPONIBLE";

        rows.push({
          day,
          time,
          teacher,
          room: roomInfo.room,
          specialties: roomInfo.specialties,
          enrolledCount,
          availableVacancies,
          status,
        });
      });
    });
  });

  const nowStr = new Date().toISOString().replace("T", " ").slice(0, 16);

  // 1. Generar Markdown Prompt Context para Meta Business Suite
  const mdLines: string[] = [
    `# MATRIZ VIVA DE DISPONIBILIDAD Y VACANTES — VIBRA MUSIC STAFF`,
    `FECHA_ACTUALIZACION: "${nowStr}"`,
    `AFORO_MAXIMO_ESTRICTO: 5 alumnos por turno de 45 minutos`,
    `REGLAS_PEDAGOGICAS_DOCENTES (ADR-0102):`,
    `- Prof. Nathaly (Sala C): Especialista en Piano Infantil (niños de 4 a 8 años) y Canto.`,
    `- Prof. Fernando (Sala B): Piano estándar (jóvenes y adultos 9+ años) y Violín.`,
    `- Prof. Jeremy (Sala A): Guitarra clásica/eléctrica y Batería.`,
    `NOTA_OPERATIVA: Si un turno tiene 0 vacantes libres, NUNCA ofrecerlo; ofrecer los turnos alternativos indicados.`,
    ``,
    `## HORARIOS CON VACANTES LIBRES (ORDENADOS POR DÍA):`,
  ];

  days.forEach((d) => {
    const dayRows = rows.filter((r) => r.day === d && r.availableVacancies > 0);
    if (dayRows.length > 0) {
      mdLines.push(`### ${d}:`);
      dayRows.forEach((r) => {
        mdLines.push(
          `- ${r.time} (${r.room} · Prof. ${r.teacher} · ${r.specialties}): ${r.availableVacancies} cupos libres (${r.enrolledCount}/5 ocupados)`
        );
      });
      mdLines.push(``);
    }
  });

  // 2. Generar CSV Content
  const csvLines: string[] = [
    "Dia,Hora,Profesor,Sala,Especialidades,Inscritos,Vacantes_Libres,Estado",
  ];
  rows.forEach((r) => {
    csvLines.push(
      `"${r.day}","${r.time}","${r.teacher}","${r.room}","${r.specialties}",${r.enrolledCount},${r.availableVacancies},"${r.status}"`
    );
  });

  return {
    markdownPromptContext: mdLines.join("\n"),
    csvContent: csvLines.join("\n"),
  };
}
