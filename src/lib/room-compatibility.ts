/**
 * room-compatibility.ts
 * Módulo de validación de compatibilidad pedagógica y reglas de convivencia de salas
 * según la Matriz Oficial Vibra Music Staff (ADR-0121).
 *
 * Reglas fundamentales:
 * 1. Estimulación Musical (4 a 5 años): Hasta 5 alumnos. Sala exclusiva (Sala D).
 * 2. Infantil (5 a 6 años): Hasta 5 alumnos. Sala exclusiva (Sala C).
 * 3. Junior (7 a 12 años): Hasta 5 alumnos. Comparte con Juvenil. PROHIBIDO compartir con Master (18+).
 * 4. Juvenil (13 a 17 años): Hasta 5 alumnos. Comparte con Junior o con Master.
 * 5. Master / Adulto (18+ años): Hasta 5 alumnos. Comparte con Juvenil. PROHIBIDO compartir con Junior.
 * 6. Personalizada: Aforo exclusivo de 1 alumno. Jamás comparte sala con ningún otro alumno.
 * 7. Duraciones: 45m con 45m es compatible. 45m con 90m (Intensivo) NO es compatible.
 */

import type { AgeCategory, ScheduledLesson } from "@/store/admin-seeds";

export type PedagogicalWarningType =
  | "age_incompatibility"
  | "duration_incompatibility"
  | "single_student_conflict"
  | "teacher_room_mismatch";

export interface PedagogicalConflict {
  type: PedagogicalWarningType;
  title: string;
  message: string;
  studentName?: string;
  conflictingStudentName?: string;
}

/**
 * Normaliza cualquier categoría o alias de la base de datos al estándar canónico.
 * Mapea 'ADULTO' -> 'MASTER' para evaluación homogénea.
 */
export function normalizeCategory(cat?: string | null): string {
  if (!cat) return "JUNIOR";
  const upper = cat.trim().toUpperCase();
  if (upper === "ADULTO" || upper === "MASTER") return "MASTER";
  if (upper.includes("ESTIMUL")) return "ESTIMULACION";
  if (upper.includes("INFANT")) return "INFANTIL";
  if (upper.includes("JUNIOR")) return "JUNIOR";
  if (upper.includes("JUVENIL")) return "JUVENIL";
  if (upper.includes("PERSON")) return "PERSONALIZADA";
  if (upper.includes("RECUP")) return "RECUPERACION";
  return upper;
}

/**
 * Evalúa si dos categorías de edad pueden coexistir en la misma sala pedagógica.
 */
export function checkAgeCompatibility(
  catA: string | AgeCategory,
  catB: string | AgeCategory
): { compatible: boolean; reason?: string } {
  const normA = normalizeCategory(catA);
  const normB = normalizeCategory(catB);

  // Clases personalizadas tienen aforo exclusivo (1 alumno máx.)
  if (normA === "PERSONALIZADA" || normB === "PERSONALIZADA") {
    return {
      compatible: false,
      reason: "Las clases personalizadas requieren aforo exclusivo (1 alumno máx.) y no pueden compartir sala.",
    };
  }

  // Si ambas categorías son idénticas, son 100% compatibles
  if (normA === normB) {
    return { compatible: true };
  }

  // Estimulación Musical (4 a 5 años) es sala única: no se mezcla con otras edades
  if (normA === "ESTIMULACION" || normB === "ESTIMULACION") {
    return {
      compatible: false,
      reason: "Estimulación Musical (4 a 5 años) requiere aislamiento de sala y no puede mezclarse con otras edades.",
    };
  }

  // Infantil (5 a 6 años) es sala única: no se mezcla con otras edades
  if (normA === "INFANTIL" || normB === "INFANTIL") {
    return {
      compatible: false,
      reason: "Categoría Infantil (5 a 6 años) requiere aislamiento de sala y no puede mezclarse con otras edades.",
    };
  }

  // JUNIOR (7 a 12) vs MASTER (18+): PROHIBIDO compartir sala
  if ((normA === "JUNIOR" && normB === "MASTER") || (normA === "MASTER" && normB === "JUNIOR")) {
    return {
      compatible: false,
      reason: "Alumnos JUNIOR (7 a 12 años) NO deben compartir sala con alumnos MASTER (18+ años).",
    };
  }

  // JUNIOR con JUVENIL: SÍ comparten sala
  if ((normA === "JUNIOR" && normB === "JUVENIL") || (normA === "JUVENIL" && normB === "JUNIOR")) {
    return { compatible: true };
  }

  // JUVENIL con MASTER: SÍ comparten sala
  if ((normA === "JUVENIL" && normB === "MASTER") || (normA === "MASTER" && normB === "JUVENIL")) {
    return { compatible: true };
  }

  return { compatible: true };
}

/**
 * Evalúa compatibilidad de duraciones de clase (45m vs 90m).
 */
export function checkDurationCompatibility(
  durA: number,
  durB: number
): { compatible: boolean; reason?: string } {
  if (durA === durB) return { compatible: true };

  if ((durA === 45 && durB === 90) || (durA === 90 && durB === 45)) {
    return {
      compatible: false,
      reason: "No se recomienda mezclar clases de 45 min con clases de 90 min (Plan Intensivo) en la misma sala y turno.",
    };
  }

  return { compatible: true };
}

/**
 * Retorna la sala oficial asignada a cada docente según ADR-0102 y ADR-0121.
 * Jeremy -> Sala A | Fernando -> Sala B | Nathaly -> Sala C | Claudia -> Sala D
 */
export function getOfficialTeacherRoom(teacherName: string): string {
  const t = (teacherName || "").toLowerCase();
  if (t.includes("claudia")) return "Sala D";
  if (t.includes("nathaly")) return "Sala C";
  if (t.includes("fernando")) return "Sala B";
  if (t.includes("jeremy")) return "Sala A";
  return "Sala A";
}

/**
 * Retorna la duración estándar en minutos según la modalidad.
 */
export function getDurationMinutesFromModality(modality?: string): number {
  const mod = (modality || "").toLowerCase();
  if (mod.includes("inten") || mod.includes("90 min") || mod.includes("4 clases")) {
    return 90;
  }
  return 45;
}

export interface EvaluateCompatibilityParams {
  studentName: string;
  category: string | AgeCategory;
  modality: string;
  isPersonalized?: boolean;
  teacher: string;
  room: string;
  existingRoomLessons: Array<
    Pick<ScheduledLesson, "student" | "teacher" | "room" | "category" | "status"> & {
      modality?: string;
    }
  >;
}

/**
 * Evalúa integralmente las advertencias pedagógicas al agendar a un alumno en una sala.
 */
export function evaluateSlotPedagogicalCompatibility({
  studentName,
  category,
  modality,
  isPersonalized = false,
  teacher,
  room,
  existingRoomLessons,
}: EvaluateCompatibilityParams): {
  hasWarning: boolean;
  warnings: PedagogicalConflict[];
} {
  const warnings: PedagogicalConflict[] = [];
  const proposedDuration = getDurationMinutesFromModality(modality);
  const proposedCat = isPersonalized ? "PERSONALIZADA" : normalizeCategory(category);

  // Filtrar clases activas de otros alumnos en esta misma sala
  const otherLessonsInRoom = existingRoomLessons.filter((l) => {
    if (l.status === "cancelada") return false;
    if (l.student.toLowerCase() === studentName.toLowerCase()) return false;
    return true;
  });

  if (otherLessonsInRoom.length === 0) {
    // Sala vacía: solo verificar si el profesor está en su sala oficial
    const officialRoom = getOfficialTeacherRoom(teacher);
    if (room && officialRoom && room !== officialRoom) {
      warnings.push({
        type: "teacher_room_mismatch",
        title: "Sala No Oficial del Docente",
        message: `Prof. ${teacher} dicta oficialmente en ${officialRoom}, pero está siendo asignado a ${room}.`,
        studentName,
      });
    }

    return {
      hasWarning: warnings.length > 0,
      warnings,
    };
  }

  // 1. Regla de Alumno Único (Personalizada)
  if (proposedCat === "PERSONALIZADA") {
    warnings.push({
      type: "single_student_conflict",
      title: "Aforo Exclusivo Requerido",
      message: `La clase Personalizada de ${studentName} requiere aforo exclusivo (1 alumno máx.). La sala ya cuenta con ${otherLessonsInRoom.length} alumno(s).`,
      studentName,
    });
  }

  const existingPersonalized = otherLessonsInRoom.find(
    (l) => normalizeCategory(l.category) === "PERSONALIZADA"
  );
  if (existingPersonalized) {
    warnings.push({
      type: "single_student_conflict",
      title: "Sala con Alumno Personalizado",
      message: `La sala ya tiene a ${existingPersonalized.student} en Clase Personalizada (aforo exclusivo de 1 alumno).`,
      studentName,
      conflictingStudentName: existingPersonalized.student,
    });
  }

  // 2. Compatibilidad de Categoría de Edad
  for (const exLesson of otherLessonsInRoom) {
    const exCat = normalizeCategory(exLesson.category);
    const ageComp = checkAgeCompatibility(proposedCat, exCat);
    if (!ageComp.compatible) {
      // Evitar duplicar la misma advertencia si varios alumnos tienen la misma categoría incompatible
      const alreadyHasThisConflict = warnings.some(
        (w) =>
          w.type === "age_incompatibility" &&
          w.conflictingStudentName === exLesson.student
      );
      if (!alreadyHasThisConflict) {
        warnings.push({
          type: "age_incompatibility",
          title: "Incompatibilidad de Edad",
          message: `${ageComp.reason} (${studentName} [${proposedCat}] vs ${exLesson.student} [${exCat}]).`,
          studentName,
          conflictingStudentName: exLesson.student,
        });
      }
    }
  }

  // 3. Compatibilidad de Duración (45m vs 90m)
  for (const exLesson of otherLessonsInRoom) {
    const exDur = getDurationMinutesFromModality(exLesson.modality);
    const durComp = checkDurationCompatibility(proposedDuration, exDur);
    if (!durComp.compatible) {
      const alreadyHasDurConflict = warnings.some(
        (w) => w.type === "duration_incompatibility"
      );
      if (!alreadyHasDurConflict) {
        warnings.push({
          type: "duration_incompatibility",
          title: "Incompatibilidad de Duración",
          message: `${durComp.reason} (${studentName} [${proposedDuration} min] vs ${exLesson.student} [${exDur} min]).`,
          studentName,
          conflictingStudentName: exLesson.student,
        });
      }
    }
  }

  // 4. Verificación de Sala Oficial del Docente
  const officialRoom = getOfficialTeacherRoom(teacher);
  if (room && officialRoom && room !== officialRoom) {
    warnings.push({
      type: "teacher_room_mismatch",
      title: "Sala No Oficial del Docente",
      message: `Prof. ${teacher} dicta oficialmente en ${officialRoom}, pero está siendo asignado a ${room}.`,
      studentName,
    });
  }

  return {
    hasWarning: warnings.length > 0,
    warnings,
  };
}
