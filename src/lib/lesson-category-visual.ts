/**
 * lesson-category-visual.ts
 * Fuente única de verdad para el PUNTITO INDICADOR DE CATEGORÍA DE EDAD
 * que se dibuja en la esquina superior derecha de las píldoras del Horario de Clases.
 *
 * Origen (ADR-0169):
 * - Las clases de recuperación (`isMakeup`) pintan la píldora completa de rojo
 *   (`categoryStyles.RECUPERACION`), por lo que se pierde la categoría de edad del alumno.
 * - El puntito recupera esa información sin alterar el diseño: solo cambia su color
 *   según la categoría real del alumno (la misma información de la Leyenda de Categorías).
 *
 * Blindaje (ADR-0155):
 * - Una plantilla semanal recurrente (sin `dateStr` y sin `isMakeup`) JAMÁS se considera
 *   recuperación, aunque arrastre un residuo `category: "RECUPERACION"`.
 *
 * Módulo puro (sin JSX, sin store, sin React) para poder verificarse en tiempo de
 * ejecución con `node scratch/test-category-dot.ts` (ADR-0119.3 / ADR-0120).
 */

import { normalizeCategory } from "./room-compatibility.ts";
import { findStudentProfileByName } from "./student-matching.ts";

/**
 * Paleta oficial del puntito indicador (Excel de Nayeli / Leyenda de Categorías).
 * 🩷 Estimulación · 🟣 Infantil · 🟡 Junior · 🟢 Juvenil · ⚫ Master (Adulto)
 */
export const CATEGORY_DOT_CLASSES: Record<string, string> = {
  ESTIMULACION: "bg-[#EC407A]", // Rosa Estimulación Musical (4 a 5)
  INFANTIL: "bg-[#7C4DFF]", // Morado Infantil (5 y 6)
  JUNIOR: "bg-[#FBC02D]", // Amarillo Junior (7 a 12)
  JUVENIL: "bg-[#4CAF50]", // Verde Juvenil (13 a 17)
  MASTER: "bg-[#546E7A]", // Plomo Master (18 a +)
  ADULTO: "bg-[#546E7A]", // Alias de compatibilidad de base de datos
  PERSONALIZADA: "bg-[#00ACC1]", // Cian de respaldo (las personalizadas usan la edad del alumno)
  RECUPERACION: "bg-[#EF4444]", // Rojo de respaldo (nunca define el puntito de categoría)
};

const FALLBACK_AGE_CATEGORY = "JUNIOR";

/** Estructura mínima de lección requerida (evita depender del store). */
export interface LessonCategoryVisualInput {
  student: string;
  category?: string | null;
  isMakeup?: boolean;
  dateStr?: string;
}

/** Estructura mínima de perfil de alumno requerida (evita depender del store). */
export interface StudentProfileLike {
  name: string;
  status?: string;
  ageCategory?: string | null;
}

export interface RecoveryCategoryVisual {
  /** true si la píldora se pinta de rojo por recuperación (ADR-0155). */
  isRecup: boolean;
  /** Categoría canónica del alumno: ESTIMULACION | INFANTIL | JUNIOR | JUVENIL | MASTER. */
  ageCategory: string;
  /** Clase Tailwind del color del puntito. */
  dotClass: string;
}

/**
 * Devuelve la clase Tailwind del puntito para una categoría (acepta alias como ADULTO).
 * Nunca devuelve undefined (`noUncheckedIndexedAccess`).
 */
export function dotClassForCategory(cat?: string | null): string {
  const canonical = normalizeCategory(cat);
  return CATEGORY_DOT_CLASSES[canonical] ?? CATEGORY_DOT_CLASSES[FALLBACK_AGE_CATEGORY]!;
}

/**
 * Categoría canónica de edad para el puntito.
 * Orden de resolución (fijo, documentado en ADR-0169):
 * 1. `ageCategory` del perfil del alumno resuelto (PostgreSQL hidratado, prioriza activo).
 * 2. `lesson.category` cuando es una categoría real (recuperaciones creadas desde el Kardex).
 * 3. Fallbacks heredados por nombre (perfiles históricos sin `ageCategory`).
 * 4. JUNIOR.
 */
export function resolveAgeCategoryForDot(
  lesson: LessonCategoryVisualInput,
  students: StudentProfileLike[] = [],
): string {
  const profile = findStudentProfileByName(students, lesson.student);
  const profileCategory = profile?.ageCategory;
  if (profileCategory) {
    const canonical = normalizeCategory(profileCategory);
    if (canonical !== "RECUPERACION" && canonical !== "PERSONALIZADA") return canonical;
  }

  const lessonCategory = lesson.category;
  if (lessonCategory) {
    const canonicalLesson = normalizeCategory(lessonCategory);
    if (canonicalLesson !== "RECUPERACION" && canonicalLesson !== "PERSONALIZADA") return canonicalLesson;
  }

  // Fallbacks heredados (se preservan verbatim para no alterar lo que hoy se ve)
  const name = lesson.student.toLowerCase();
  if (name.includes("joan paolo")) return "MASTER";
  if (name.includes("mishel")) return "JUVENIL";
  if (name.includes("mirko")) return "JUNIOR";

  return FALLBACK_AGE_CATEGORY;
}

/**
 * Resolución completa para el puntito de una píldora del horario:
 * si es recuperación + categoría canónica + clase de color del puntito.
 */
export function resolveRecoveryCategoryVisual(
  lesson: LessonCategoryVisualInput,
  students: StudentProfileLike[] = [],
): RecoveryCategoryVisual {
  const isRecup = Boolean(lesson.isMakeup || (lesson.dateStr && lesson.category === "RECUPERACION"));
  const ageCategory = resolveAgeCategoryForDot(lesson, students);
  return {
    isRecup,
    ageCategory,
    dotClass: dotClassForCategory(ageCategory),
  };
}
