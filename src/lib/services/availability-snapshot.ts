/**
 * ================================================================
 * availability-snapshot.ts — Motor de Snapshot de Vacantes en Vivo
 * ================================================================
 * Genera el resumen en texto plano del inventario real de cupos
 * para el bot de WhatsApp (Karla) siguiendo estrictamente el
 * formato del Plan Maestro y las 4 Reglas de Negocio Oficiales.
 * ================================================================
 */

import type { ScheduledLesson, AdminStudent, WeekDay } from "@/store/admin-seeds";
import { isMatchingStudentName } from "@/lib/student-matching";

export const MAX_ROOM_CAPACITY = 5; // Aforo máximo por clase / profesor / sala: 5 alumnos

export interface RoomAvailabilitySummary {
  roomName: string;
  instruments: string;
  teacher: string;
  lunMie: string;
  marJue: string;
  vieSab: string;
}

export interface AvailabilitySnapshotResult {
  text: string;
  updatedAt: string;
  rooms: RoomAvailabilitySummary[];
}

/**
 * Convierte formato militar 24h ("16:00", "09:45") a formato legible ("4:00pm", "9:45am").
 */
export function formatTime24to12(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  const ampm = h >= 12 ? "pm" : "am";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${m}${ampm}`;
}

/**
 * Cuenta cuántos alumnos activos ocupan una sala / profesor / horario específico.
 */
function getOccupiedCount(
  schedule: ScheduledLesson[],
  adminStudents: AdminStudent[],
  day: WeekDay,
  time: string,
  teacherKeyword: string
): number {
  const activeStudentMap = new Map<string, boolean>();
  adminStudents.forEach((st) => {
    activeStudentMap.set(st.name.toLowerCase().trim(), st.status === "activo");
  });

  const matchingLessons = schedule.filter((l) => {
    if (l.day !== day || l.time !== time) return false;
    if (l.status === "cancelada") return false;
    if (!l.teacher.toLowerCase().includes(teacherKeyword.toLowerCase())) return false;

    // Verificar si el alumno está activo
    const studentProfile = adminStudents.find((s) => isMatchingStudentName(s.name, l.student));
    if (studentProfile) {
      return studentProfile.status === "activo";
    }
    // Si no se encuentra en el directorio maestro, asumir ocupado si la clase está programada
    return true;
  });

  return matchingLessons.length;
}

/**
 * Calcula el bloque para días pares (ej: Lun/Mié o Mar/Jue).
 * Para no sobreagendar combos 2x/sem, la vacante efectiva es min(5 - día1, 5 - día2).
 */
function formatPairedDaysBlock(
  schedule: ScheduledLesson[],
  adminStudents: AdminStudent[],
  day1: WeekDay,
  day2: WeekDay,
  times: string[],
  teacherKeyword: string
): string {
  const slotsFormatted = times.map((t) => {
    const count1 = getOccupiedCount(schedule, adminStudents, day1, t, teacherKeyword);
    const count2 = getOccupiedCount(schedule, adminStudents, day2, t, teacherKeyword);
    const maxOccupied = Math.max(count1, count2);
    const free = Math.max(0, MAX_ROOM_CAPACITY - maxOccupied);

    const timeLabel = formatTime24to12(t);
    const statusLabel = free === 0 ? "LLENO" : `${free}`;
    return `${timeLabel} (${statusLabel})`;
  });

  return slotsFormatted.join(", ");
}

/**
 * Genera el bloque especial de Viernes y Sábados (Intensivos).
 */
function formatVieSabBlock(
  schedule: ScheduledLesson[],
  adminStudents: AdminStudent[],
  teacherKeyword: string
): string {
  const vieTimes = ["16:00", "16:45", "17:30", "18:15", "19:00"];
  const sabTimes = ["09:00", "09:45", "10:30", "11:15", "12:00", "12:45"];

  const vieSlots = vieTimes
    .map((t) => {
      const count = getOccupiedCount(schedule, adminStudents, "Vie", t, teacherKeyword);
      const free = Math.max(0, MAX_ROOM_CAPACITY - count);
      return `${formatTime24to12(t)} (${free === 0 ? "LLENO" : free})`;
    })
    .slice(0, 3); // Muestra los turnos principales de la tarde

  const sabSlots = sabTimes
    .map((t) => {
      const count = getOccupiedCount(schedule, adminStudents, "Sáb", t, teacherKeyword);
      const free = Math.max(0, MAX_ROOM_CAPACITY - count);
      return `${formatTime24to12(t)} (${free === 0 ? "LLENO" : free})`;
    })
    .slice(0, 4); // Muestra turnos de la mañana

  return `Vie ${vieSlots.join(", ")} | Sáb ${sabSlots.join(", ")}`;
}

/**
 * Genera el Snapshot de Vacantes de texto plano completo conforme a la especificación técnica.
 */
export function generateAvailabilitySnapshot(
  schedule: ScheduledLesson[],
  adminStudents: AdminStudent[],
  customDate?: Date
): AvailabilitySnapshotResult {
  const now = customDate || new Date();
  const dayStr = String(now.getDate()).padStart(2, "0");
  const monthStr = String(now.getMonth() + 1).padStart(2, "0");
  const yearStr = now.getFullYear();
  const hoursStr = String(now.getHours()).padStart(2, "0");
  const minsStr = String(now.getMinutes()).padStart(2, "0");
  const updatedAtFormatted = `${dayStr}/${monthStr}/${yearStr} ${hoursStr}:${minsStr}`;

  const standardTimes = ["16:00", "16:45", "17:30", "18:15", "19:00"];

  // Sala A — Jeremy (Guitarra / Batería)
  const salaALunMie = formatPairedDaysBlock(schedule, adminStudents, "Lun", "Mié", standardTimes, "Jeremy");
  const salaAMarJue = formatPairedDaysBlock(schedule, adminStudents, "Mar", "Jue", standardTimes, "Jeremy");
  const salaAVieSab = formatVieSabBlock(schedule, adminStudents, "Jeremy");

  // Sala B — Fernando (Piano / Violín)
  const salaBLunMie = formatPairedDaysBlock(schedule, adminStudents, "Lun", "Mié", standardTimes, "Fernando");
  const salaBMarJue = formatPairedDaysBlock(schedule, adminStudents, "Mar", "Jue", standardTimes, "Fernando");
  const salaBVieSab = formatVieSabBlock(schedule, adminStudents, "Fernando");

  // Sala C — Nathaly (Piano Infantil / Canto)
  const salaCLunMie = formatPairedDaysBlock(schedule, adminStudents, "Lun", "Mié", standardTimes, "Nathaly");
  const salaCMarJue = formatPairedDaysBlock(schedule, adminStudents, "Mar", "Jue", standardTimes, "Nathaly");
  const salaCVieSab = formatVieSabBlock(schedule, adminStudents, "Nathaly");

  // Sala D — Demos (Directora Claudia / Especialista)
  const salaDLunVie = "3:30pm (1), 4:15pm (1), 5:00pm (1), 5:45pm (1), 6:30pm (1) (Sujeto a confirmación Directora Claudia)";
  const salaDSab = "10:00am (1), 11:30am (1), 3:30pm (1), 5:00pm (1) (Previa coordinación con Directora)";

  const rooms: RoomAvailabilitySummary[] = [
    {
      roomName: "SALA A",
      instruments: "GUITARRA/BATERÍA",
      teacher: "Prof. Jeremy",
      lunMie: salaALunMie,
      marJue: salaAMarJue,
      vieSab: salaAVieSab,
    },
    {
      roomName: "SALA B",
      instruments: "PIANO/VIOLÍN",
      teacher: "Prof. Fernando",
      lunMie: salaBLunMie,
      marJue: salaBMarJue,
      vieSab: salaBVieSab,
    },
    {
      roomName: "SALA C",
      instruments: "PIANO INFANTIL/CANTO",
      teacher: "Prof. Nathaly",
      lunMie: salaCLunMie,
      marJue: salaCMarJue,
      vieSab: salaCVieSab,
    },
    {
      roomName: "SALA D",
      instruments: "DEMOS",
      teacher: "Directora Claudia / Especialista",
      lunMie: salaDLunVie,
      marJue: salaDLunVie,
      vieSab: salaDSab,
    },
  ];

  const lines: string[] = [
    "SNAPSHOT DE VACANTES - VIBRA MUSIC",
    `Actualizado: ${updatedAtFormatted}`,
    "",
    "SALA A - GUITARRA/BATERÍA (Prof. Jeremy):",
    `- Lun/Mié: ${salaALunMie}.`,
    `- Mar/Jue: ${salaAMarJue}.`,
    `- Vie/Sáb (Intensivo): ${salaAVieSab}.`,
    "",
    "SALA B - PIANO/VIOLÍN (Prof. Fernando):",
    `- Lun/Mié: ${salaBLunMie}.`,
    `- Mar/Jue: ${salaBMarJue}.`,
    `- Vie/Sáb (Intensivo): ${salaBVieSab}.`,
    "",
    "SALA C - PIANO INFANTIL/CANTO (Prof. Nathaly):",
    `- Lun/Mié: ${salaCLunMie}.`,
    `- Mar/Jue: ${salaCMarJue}.`,
    `- Vie/Sáb (Intensivo): ${salaCVieSab}.`,
    "",
    "SALA D - DEMOS (Directora Claudia / Especialista):",
    `- Lun a Vie: ${salaDLunVie}.`,
    `- Sábados: ${salaDSab}.`,
    "",
    "REGLAS CRÍTICAS DEL NEGOCIO (INNEGOCIABLES):",
    "1. REGLA DE CUPO: Si un horario no está en la lista o dice (LLENO), el bot debe ofrecer las alternativas más cercanas de la misma sala y docente.",
    "2. REGLA ESTRICTA PIANO VS. PIANO INFANTIL: La división es por RANGO DE EDAD Y EXPERIENCIA. Prof. Nathaly (Sala C) atiende exclusivamente Piano Infantil (iniciación/niños) y Canto. Prof. Fernando (Sala B) atiende Piano estándar, juvenil, adultos, niveles avanzados/Master y Violín. Regla diagnóstica 8, 9 y 10 años: Alumnos de 8, 9 y 10 años pueden ir con Prof. Nathaly (Sala C) si NO tienen experiencia previa y ella TIENE cupo; si TIENEN experiencia intermedia/avanzada, van con Prof. Fernando (Sala B). JAMÁS transferir a un alumno de Fernando con Nathaly por falta de cupo de sala. Si Fernando está lleno, ofrecer otro horario con Fernando.",
    "3. DISPONIBILIDAD SALA D (DEMOS): Horario sugerido de 3:30 pm a 7:00 pm. Respuesta obligatoria del bot al prospecto: 'Te daremos la confirmación en un momento mientras coordinamos con nuestra Directora Claudia 🎵'. NO confirmar la cita de inmediato; esperar el visto bueno de Claudia.",
    "4. ESCALAMIENTO POR PAGOS: Ante cualquier captura/imagen o mención de pago/transferencia (Yape, Plin, BCP), escalar inmediatamente a Karla de administración para validar abono en cuenta bancaria. Nunca dar por confirmado un pago sin visto bueno humano.",
    "5. CLIENTES VIP (PAQUETE FLEXIBLE): Alumnos identificados con metadato 'paquete flexible' (tarifas especiales o bolsa de horas) NO reciben precios de lista estándar. Transferir de inmediato a Karla.",
  ];

  return {
    text: lines.join("\n"),
    updatedAt: updatedAtFormatted,
    rooms,
  };
}
