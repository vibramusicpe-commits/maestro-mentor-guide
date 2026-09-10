/**
 * Utilidades de normalización, matching difuso de nombres de alumnos
 * y resolución de UUIDs deterministas para Insforge PostgreSQL.
 */

export function normalizeStudentName(name: string): string {
  return (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[,.\-_/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Compara dos nombres de alumnos tolerando:
 * - Apellidos invertidos ("Ticona Cachay, Jonathan" vs "Jonathan Ticona Cachay")
 * - Segundos nombres omitidos ("Camila Pastor Conco" vs "Camila Valentina Pastor Conco")
 * - Nombres con ligeras variaciones ("Valerie Angulo Chipana" vs "Valerie Yidda Angulo")
 * - Acentos y caracteres especiales ("Aarón" vs "Aaron")
 */
export function isMatchingStudentName(nameA: string, nameB: string): boolean {
  if (!nameA || !nameB) return false;
  const a = normalizeStudentName(nameA);
  const b = normalizeStudentName(nameB);

  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;

  const wordsA = a.split(" ").filter((w) => w.length > 2);
  const wordsB = b.split(" ").filter((w) => w.length > 2);

  const stopWords = new Set(["del", "los", "las", "san", "santa", "dos", "tres", "para"]);
  const cleanA = wordsA.filter((w) => !stopWords.has(w));
  const cleanB = wordsB.filter((w) => !stopWords.has(w));

  const matchingWords = cleanA.filter((w) => cleanB.includes(w));

  // Si coinciden al menos 2 palabras clave (ej: "valerie" + "angulo", "camila" + "pastor")
  if (matchingWords.length >= 2) return true;

  // Si uno de los nombres tiene solo 1 palabra significativa y coincide (ej: "Dulce", "Sasha")
  if (matchingWords.length >= 1 && (cleanA.length === 1 || cleanB.length === 1)) {
    return true;
  }

  return false;
}

/**
 * Resuelve cualquier identificador de alumno al formato UUID estándar de PostgreSQL:
 * - Si ya es UUID: lo retorna en minúsculas.
 * - Si es "as-cp-65" o "student-65" o "65": extrae 65 -> hex "41" -> "00000000-0000-0000-0002-000000000041"
 */
export function resolveStudentUUID(id: string | number | null | undefined): string | null {
  if (!id) return null;
  const str = String(id).trim();

  // UUID canónico
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return str.toLowerCase();
  }

  // Extracción de número para IDs como "as-cp-1", "student-10", 15
  const match = str.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (!isNaN(num) && num > 0) {
      const hex = num.toString(16).padStart(12, "0");
      return `00000000-0000-0000-0002-${hex}`;
    }
  }

  return null;
}
