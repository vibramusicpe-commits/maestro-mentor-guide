/**
 * ============================================================================
 * LAYA REALTIME MATCHER — Enlazador en Tiempo Real con la Agenda de Clases
 * Conexión de decisiones Laya con PostgreSQL, Desambiguación de Homónimos y Kardex
 * ============================================================================
 */
import type { AdminStudent, ScheduledLesson } from "@/store/app-store";
import { normalizeStudentName } from "@/lib/student-matching";
import { availableTeachers, rooms, timeSlotsWeekday, timeSlotsSaturday } from "@/store/admin-seeds";
import { stringSimilarity, levenshteinDistance } from "./laya-engine";
import { resolveAcademyKnowledge, type AcademyKnowledgeResponse } from "./laya-knowledge-base";

export interface DisambiguationCandidate {
  student: AdminStudent;
  score: number;
  matchReasons: string[];
}

export interface StudentMatchResult {
  student?: AdminStudent;
  confidence: number;
  candidates: DisambiguationCandidate[];
  isAmbiguous: boolean;
}

export interface StudentKardexSummary {
  studentName: string;
  targetQuota: number;
  attendedCount: number;
  absentCount: number;
  tardyCount: number;
  justifiedCount: number;
  evaluatedCount: number;
  remainingRegularCount: number;
  makeupCredits: number;
  cycleCompleted: boolean;
}

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
  pedagogicalNote?: string;
}

export interface LayaParsedRequest {
  detectedStudent?: AdminStudent;
  detectedStudentConfidence: number;
  candidates: DisambiguationCandidate[];
  isAmbiguous: boolean;
  intent: string;
  day: string;
  time: string;
  reason: string;
  isJustified: boolean;
  urgencyLabel: string;
  kardexSummary?: StudentKardexSummary;
  slotAnalysis?: MatchedSlotAnalysis;
  academyKnowledge?: AcademyKnowledgeResponse | null;
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
 * 🛡️ PAUTA MULTIDIMENSIONAL ANTI-COLISIÓN DE HOMÓNIMOS Y RESOLUCIÓN DIFUSA (ADR-0140)
 * Evalúa similitud de nombre, apellidos, instrumento, docente y nombres de apoderados.
 */
export function extractStudentFromText(
  text: string,
  students: AdminStudent[]
): StudentMatchResult {
  if (!text || !text.trim()) {
    return { confidence: 0, candidates: [], isAmbiguous: false };
  }

  // 🛡️ REGLA ADR-0142: Detección y prioridad absoluta de @Menciones explícitas
  // Si el texto incluye @Nombre (ej. @Sasha Dharma Contreras de la Cruz), otorga 100% de certeza inmediata
  const atMatch = text.match(/@([a-zA-ZÁ-ÿ0-9\s]+?)(?:$|[,\.\?!]|\n|\s{2,})/);
  if (atMatch && atMatch[1].trim()) {
    const rawMention = atMatch[1].trim();
    const normMention = normalizeStudentName(rawMention);

    // Buscar coincidencia exacta o por inclusión entre los alumnos
    const explicitMatch =
      students.find((st) => {
        const normSt = normalizeStudentName(st.name);
        return normSt === normMention || normSt.startsWith(normMention) || normMention.startsWith(normSt);
      }) ||
      students.find((st) => {
        const normSt = normalizeStudentName(st.name);
        return normSt.includes(normMention) || normMention.includes(normSt);
      });

    if (explicitMatch) {
      return {
        student: explicitMatch,
        confidence: 1.0,
        candidates: [
          {
            student: explicitMatch,
            score: 200,
            matchReasons: [`Mención explícita directa (@${explicitMatch.name})`],
          },
        ],
        isAmbiguous: false,
      };
    }
  }

  const normInput = normalizeStudentName(text);
  const inputWords = normInput.split(/\s+/).filter((w) => w.length > 1);

  // Palabras comunes a ignorar para matching de nombres
  const stopWords = new Set([
    "de", "la", "el", "los", "las", "del", "un", "una", "y", "o", "en", "con", "por",
    "para", "que", "se", "su", "al", "hola", "buenas", "tardes", "dias", "noches",
    "mama", "papa", "apoderado", "madre", "padre", "senora", "senor", "dice", "avisa",
    "clase", "clases", "recuperar", "reprogramar", "falta", "faltas", "dos", "tres"
  ]);

  const relevantInputWords = inputWords.filter((w) => !stopWords.has(w));
  const scoredCandidates: DisambiguationCandidate[] = [];

  for (const st of students) {
    let score = 0;
    const matchReasons: string[] = [];
    const normFullName = normalizeStudentName(st.name);
    const nameParts = normFullName.split(/\s+/).filter((w) => w.length > 1 && !stopWords.has(w));

    // 1. Coincidencia de Nombre Completo Exacto
    if (normInput.includes(normFullName)) {
      score += 100;
      matchReasons.push("Nombre completo exacto");
    }

    // 2. Coincidencia Secuencial de 2 o más palabras consecutivas (ej: "sasha darma" ~ "sasha dharma")
    for (let i = 0; i < inputWords.length - 1; i++) {
      const bigram = `${inputWords[i]} ${inputWords[i + 1]}`;
      // Probar contra pares del nombre
      for (let j = 0; j < nameParts.length - 1; j++) {
        const nameBigram = `${nameParts[j]} ${nameParts[j + 1]}`;
        const sim = stringSimilarity(bigram, nameBigram);
        if (sim >= 0.8) {
          score += 45;
          matchReasons.push(`Par de nombres similar ("${bigram}" ~ "${nameBigram}")`);
        }
      }
    }

    // 3. Coincidencia Palabra por Palabra (Exacta + Levenshtein)
    for (const inWord of relevantInputWords) {
      for (let idx = 0; idx < nameParts.length; idx++) {
        const nPart = nameParts[idx];
        const sim = stringSimilarity(inWord, nPart);

        if (sim === 1.0) {
          // Si coincide el primer nombre
          if (idx === 0) {
            score += 40;
            matchReasons.push(`Primer nombre exacto ("${nPart}")`);
          } else {
            score += 25;
            matchReasons.push(`Apellido/segundo nombre exacto ("${nPart}")`);
          }
        } else if (sim >= 0.75) {
          // Coincidencia difusa (ej. "darma" ~ "dharma" sim = 0.83)
          score += 30;
          matchReasons.push(`Nombre con variación fonética ("${inWord}" ~ "${nPart}")`);
        }
      }
    }

    // 4. Bonificación por Contexto: Instrumento del alumno
    const inst = (st.instrument || "").toLowerCase();
    if (inst) {
      for (const inWord of inputWords) {
        if (inst.includes(inWord) && inWord.length >= 4) {
          score += 20;
          matchReasons.push(`Instrumento coincide (${st.instrument})`);
          break;
        }
      }
    }

    // 5. Bonificación por Contexto: Docente asignado
    const teacher = (st.teacher || "").toLowerCase();
    if (teacher && teacher !== "prof. por asignar") {
      for (const inWord of inputWords) {
        if (teacher.includes(inWord) && inWord.length >= 4) {
          score += 20;
          matchReasons.push(`Docente coincide (Prof. ${st.teacher})`);
          break;
        }
      }
    }

    // 6. Bonificación por Apoderado / Familia en PostgreSQL
    const mother = normalizeStudentName(st.emergencyContact?.motherName || "");
    const father = normalizeStudentName(st.emergencyContact?.fatherName || "");
    const family = normalizeStudentName(st.family || "");

    for (const inWord of relevantInputWords) {
      if (mother && mother.includes(inWord)) {
        score += 20;
        matchReasons.push(`Madre coincide en ficha (${st.emergencyContact?.motherName})`);
      }
      if (father && father.includes(inWord)) {
        score += 20;
        matchReasons.push(`Padre coincide en ficha (${st.emergencyContact?.fatherName})`);
      }
      if (family && family.includes(inWord) && inWord.length >= 4) {
        score += 15;
        matchReasons.push(`Familia coincide (${st.family})`);
      }
    }

    if (score >= 30) {
      scoredCandidates.push({
        student: st,
        score,
        matchReasons: Array.from(new Set(matchReasons)),
      });
    }
  }

  // Ordenar candidatos por puntuación descendente
  scoredCandidates.sort((a, b) => b.score - a.score);

  if (scoredCandidates.length === 0) {
    return { confidence: 0, candidates: [], isAmbiguous: false };
  }

  const topCandidate = scoredCandidates[0];
  const secondCandidate = scoredCandidates.length > 1 ? scoredCandidates[1] : null;

  // 🛡️ DETECCIÓN DE AMBIGÜEDAD / HOMÓNIMOS:
  // Si hay más de un candidato y la diferencia de puntuación es pequeña (< 25 puntos),
  // se activa el estado de desambiguación obligatoria para que la secretaria confirme.
  const isAmbiguous =
    secondCandidate !== null &&
    secondCandidate.score >= 35 &&
    topCandidate.score - secondCandidate.score < 25;

  if (isAmbiguous) {
    return {
      student: undefined, // No asumir a ciegas
      confidence: Math.round((topCandidate.score / 150) * 100) / 100,
      candidates: scoredCandidates.slice(0, 4), // Mostrar hasta 4 opciones para desambiguar
      isAmbiguous: true,
    };
  }

  // Coincidencia sólida inequívoca
  return {
    student: topCandidate.student,
    confidence: Math.min(0.98, Math.round((topCandidate.score / 100) * 100) / 100),
    candidates: scoredCandidates.slice(0, 3),
    isAmbiguous: false,
  };
}

/**
 * Calcula en vivo el balance matemático del ciclo del alumno (PostgreSQL / Zustand)
 */
export function computeStudentKardexSummary(
  student: AdminStudent,
  schedule: ScheduledLesson[] = []
): StudentKardexSummary {
  const normName = normalizeStudentName(student.name);

  // Cuota contratada (Regular: 8, Intensivo: 4, o personalizada en emergencyContact)
  const targetQuota =
    student.emergencyContact?.packageTotalSessions ||
    (student.modality?.toLowerCase().includes("intens") || student.modality?.includes("4 clases") ? 4 : 8);

  let attendedCount = 0;
  let absentCount = 0;
  let tardyCount = 0;
  let justifiedCount = 0;

  // 1. Escanear lecciones guardadas del alumno
  const lessons = student.scheduleLessons || [];
  lessons.forEach((l) => {
    if (l.attendanceByDate) {
      Object.values(l.attendanceByDate).forEach((status) => {
        if (status === "presente") attendedCount++;
        else if (status === "tarde") {
          tardyCount++;
          attendedCount++;
        } else if (status === "ausente") absentCount++;
        else if (status === "justificada") justifiedCount++;
      });
    }
  });

  const evaluatedCount = attendedCount + absentCount + justifiedCount;
  const remainingRegularCount = Math.max(0, targetQuota - evaluatedCount);
  const makeupCredits = student.makeupCredits || (absentCount + justifiedCount);
  const cycleCompleted = evaluatedCount >= targetQuota;

  return {
    studentName: student.name,
    targetQuota,
    attendedCount,
    absentCount,
    tardyCount,
    justifiedCount,
    evaluatedCount,
    remainingRegularCount,
    makeupCredits,
    cycleCompleted,
  };
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

  const isWeekendSlot = day === "Vie" || day === "Sáb";
  const pedagogicalNote = isWeekendSlot
    ? isAvailable
      ? "Turno en Viernes/Sábado con aforo disponible: Apto para recuperación de 45m de Plan Regular (Intensivos son de 90m)."
      : "Turno en Viernes/Sábado con aforo completo."
    : undefined;

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
    pedagogicalNote,
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
  kardexSummary?: StudentKardexSummary;
  academyKnowledge?: AcademyKnowledgeResponse | null;
}): string {
  const {
    studentName = "el alumno",
    familyName,
    intent,
    day,
    time,
    teacher,
    room,
    isAvailable,
    alternatives,
    kardexSummary,
    academyKnowledge,
  } = params;

  // 🛡️ REGLA ADR-0142: Saneamiento de nombre familiar para evitar "Familia Familia ..."
  const cleanFamily = (familyName || "").replace(/^familia\s+/i, "").trim();
  const greeting = cleanFamily ? `¡Hola Familia ${cleanFamily}! 🎵` : "¡Hola! Te saluda Secretaría de Vibra Music. 🎵";

  // 1. Caso Consulta de Clases Faltantes / Estado de Kardex
  if (intent === "consulta_clases_pendientes") {
    const total = kardexSummary?.targetQuota || 8;
    const attended = kardexSummary?.attendedCount || 0;
    const absences = (kardexSummary?.absentCount || 0) + (kardexSummary?.justifiedCount || 0);
    const remaining = kardexSummary?.remainingRegularCount ?? Math.max(0, total - attended - absences);
    const credits = kardexSummary?.makeupCredits || absences;

    let details = `Revisamos el Kardex de ${studentName} en tiempo real:\n` +
      `• *Ciclo contratado:* ${total} clases.\n` +
      `• *Clases asistidas:* ${attended} clases.\n`;

    if (absences > 0 || credits > 0) {
      details += `• *Inasistencias por recuperar:* ${credits} clase(s) (créditos disponibles).\n`;
    }

    details += `• *Clases regulares restantes del mes:* ${remaining} clase(s).\n\n`;

    if (credits > 0) {
      details += `Recuerda que en Vibra Music *las clases no se pierden, se recuperan*. Con gusto podemos coordinar la recuperación de sus clases pendientes. ¿Qué día les gustaría programarlas?`;
    } else {
      details += `¡El avance de ${studentName} va excelente! Quedamos atentos para cualquier consulta adicional.`;
    }

    return `${greeting}\n\n${details}`;
  }

  // 2. Caso Reprogramación o Consulta de Vacantes
  if (intent === "reprogramacion" || intent === "consulta_vacantes") {
    const isWeekendSlot = day === "Vie" || day === "Sáb";
    const slotNote = isWeekendSlot ? " (turno apto para su clase de recuperación de 45 minutos)" : "";

    if (isAvailable && day !== "indeterminado" && time !== "indeterminado") {
      return (
        `${greeting}\n\n` +
        `Revisamos la agenda y *SÍ tenemos vacante disponible* para ${studentName} el *${day} a las ${time}*${slotNote} ` +
        `en ${room} con el Prof. ${teacher}.\n\n` +
        `¿Desean que lo dejemos registrado formalmente como su clase de recuperación? ¡Quedamos atentos para confirmarlo!`
      );
    } else if (!isAvailable && day !== "indeterminado" && time !== "indeterminado") {
      const altText =
        alternatives.length > 0
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

  // 3. Caso Justificar Falta
  if (intent === "justificar_falta") {
    return (
      `${greeting}\n\n` +
      `Agradecemos mucho que nos avises con anticipación la inasistencia de ${studentName}. ` +
      `Ya quedó registrada en el Kardex. Recuerda que en Vibra Music *las clases no se pierden, se recuperan*. ` +
      `En cuanto ${studentName} se encuentre mejor, coordinamos su clase de recuperación en el horario que más les convenga.`
    );
  }

  // 4. Caso Consulta de Sistema / Academia / Inducción (ADR-0142)
  if (intent === "consulta_sistema_academia") {
    if (academyKnowledge?.category === "ciclo_activacion") {
      return (
        `¡Hola! Te saluda Secretaría de Vibra Music Staff. 🎵\n\n` +
        `Para registrar y activar a un alumno en Vibra Music seguimos el flujo oficial de 3 pasos:\n` +
        `1️⃣ *Ficha y Registro* (/admin/alumnos): Pulsa '+ Nuevo Alumno' e ingresa los datos del alumno, apoderado, plan y pack de útiles.\n` +
        `2️⃣ *Horario de Clases* (/admin/agenda): Asigna sala y docente según edad e instrumento (ADR-0102) en Días Pareados (L-M, M-J, V-S) con candado contractual.\n` +
        `3️⃣ *Kardex de Asistencias*: El sistema proyecta automáticamente exactamente 8 clases al mes (o 4 intensivas) con control de faltas y recuperaciones.\n\n` +
        `¡Quedamos a tu disposición para ayudarte con el registro!`
      );
    }
    if (academyKnowledge?.category === "horarios_pareados") {
      return (
        `¡Hola! Te saluda Secretaría de Vibra Music Staff. 🎵\n\n` +
        `Nuestras clases regulares (8 clases al mes de 45 min) se organizan en Días Pareados Oficiales:\n` +
        `• *Lunes y Miércoles (L-M)*: Turnos vespertinos de 16:00 a 20:30.\n` +
        `• *Martes y Jueves (M-J)*: Turnos vespertinos de 16:00 a 20:30.\n` +
        `• *Viernes y Sábado (V-S)*: Viernes tarde y Sábado mañana (09:00 a 14:15).\n\n` +
        `¡Quedamos atentos para coordinar el horario más cómodo para el alumno!`
      );
    }
    if (academyKnowledge?.category === "intensivo_recuperacion") {
      return (
        `¡Hola! Te saluda Secretaría de Vibra Music Staff. 🎵\n\n` +
        `Te recordamos nuestras normas pedagógicas oficiales:\n` +
        `• *Cursos Intensivos*: Son clases de 90 minutos continuos (1 vez por semana en Jueves, Viernes o Sábados).\n` +
        `• *Recuperaciones de Plan Regular*: Aunque Viernes y Sábados son de intensivo, si una sala tiene aforo disponible (< 5 alumnos), sí se pueden programar recuperaciones de 45 minutos.\n\n` +
        `¡Quedamos atentos para reservar la sala!`
      );
    }
    if (academyKnowledge?.category === "aforos_docentes") {
      return (
        `¡Hola! Te saluda Secretaría de Vibra Music Staff. 🎵\n\n` +
        `Nuestra asignación docente se rige exclusivamente por especialidad y edad (ADR-0102):\n` +
        `• *Prof. Nathaly (Sala C)*: Piano Infantil (4 a 8 años) y Canto.\n` +
        `• *Prof. Fernando (Sala B)*: Piano estándar (9+ años, jóvenes y adultos) y Violín.\n` +
        `• *Prof. Jeremy (Sala A)*: Guitarra clásica/eléctrica y Batería.\n\n` +
        `Manejamos un aforo máximo estricto de 5 alumnos por sala para cuidar la calidad pedagógica.`
      );
    }
    return (
      `${greeting}\n\n` +
      `¡Hola! Respecto a tu consulta sobre las pautas de Vibra Music, te comento que las clases regulares se organizan en Días Pareados (L-M, M-J, V-S) de 45 minutos y los intensivos son de 90 minutos (Jue, Vie o Sáb). Puedes revisar todos los detalles pedagógicos y de activación en el panel de Copiloto Laya. ¡Quedamos atentos para ayudarte!`
    );
  }

  // 5. Caso General
  return (
    `${greeting}\n\n` +
    `Recibimos tu mensaje respecto a ${studentName}. Estamos a tu disposición para ayudarte con cualquier consulta de clases, pagos o asistencias. ¿En qué podemos apoyarte hoy?`
  );
}

/**
 * 🛡️ Exportador Snapshot en Tiempo Real de Disponibilidad
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

  // Markdown Prompt Context para Meta Business Suite
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

  // CSV Content
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
