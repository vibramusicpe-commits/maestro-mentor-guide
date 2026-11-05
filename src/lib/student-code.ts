/**
 * ================================================================
 * student-code.ts — Código legible por matrícula y por persona (ADR-0189)
 * ================================================================
 *
 * PROBLEMA QUE RESUELVE
 * Un alumno con 2 instrumentos tiene 2 matrículas (`students.id`) y una sola
 * persona (`personGroupId`). En el día a día secretaría necesita un
 * identificador **corto, estable y dictable** para hablar de "la matrícula de
 * Piano" sin depender del nombre (que se repite entre instrumentos, ej.
 * "Luciana" y "Luciana (Canto)") ni del UUID completo.
 *
 * REGLAS INNEGOCIABLES
 *   - El código se **deriva del UUID**: no hay columna, no hay DDL, no hay
 *     escritura en la base. Mismo id ⇒ mismo código, siempre, en cualquier
 *     dispositivo.
 *   - **Nunca** se guarda el código como fuente de verdad: si se edita la
 *     ficha, el código no cambia; si se re-crea el alumno, cambia porque
 *     cambió el UUID (y eso es correcto: es otra matrícula).
 *   - Para ids heredados que no son UUID (semillas `st-001`) se usa un hash
 *     FNV-1a estable, de modo que también obtienen código legible.
 *   - Función pura: sin red, sin estado, testeable (ADR-0119.3).
 */

const CODE_PREFIX = "VM";
const CODE_LENGTH = 6;

/** FNV-1a 32 bits: hash estable y sin dependencias. */
function fnv1a(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Código legible de un UUID (matrícula) o de un `personGroupId`.
 *
 *   `2307efd3-4553-4676-9e7a-027334e90015` → `VM-2307EF`
 *   `st-001` (semilla heredada)            → `VM-XXXXXXXX` (hash)
 *   `""` / `null`                          → `VM-SIN-ID`
 */
export function formatStudentCode(id?: string | null): string {
  const raw = (id || "").trim();
  if (!raw) return `${CODE_PREFIX}-SIN-ID`;

  const hex = raw.replace(/-/g, "");
  const body = /^[0-9a-fA-F]{32}$/.test(hex) ? hex : fnv1a(raw);

  return `${CODE_PREFIX}-${body.slice(0, CODE_LENGTH).toUpperCase()}`;
}

/** Código de la **matrícula** (un instrumento). */
export function studentCode(id?: string | null): string {
  return formatStudentCode(id);
}

/** Código de la **persona** (todas sus matrículas). */
export function personCode(personGroupId?: string | null): string {
  return formatStudentCode(personGroupId);
}

/**
 * Normaliza lo que escribe el usuario para comparar contra un código.
 * Admite `vm-2307ef`, `2307EF`, `VM 2307 EF`.
 */
export function normalizeCodeQuery(value?: string | null): string {
  return (value || "")
    .toUpperCase()
    .replace(/^VM[\s-]*/, "")
    .replace(/[^0-9A-Z]/g, "");
}

/**
 * ¿El término escrito apunta al código de esta matrícula?
 *
 * Pensado para el buscador del directorio: exige al menos 2 caracteres
 * útiles para no secuestrar búsquedas normales por nombre.
 */
export function matchesStudentCode(id: string | null | undefined, query: string): boolean {
  const term = normalizeCodeQuery(query);
  if (term.length < 2) return false;
  const code = normalizeCodeQuery(studentCode(id));
  return code.includes(term);
}

/**
 * Etiqueta combinada para la ficha: `VM-2307EF · Piano`.
 * Devuelve solo el código si no hay instrumento.
 */
export function describeStudentCode(
  id: string | null | undefined,
  instrument?: string | null,
): string {
  const code = studentCode(id);
  const name = (instrument || "").trim();
  return name ? `${code} · ${name}` : code;
}
