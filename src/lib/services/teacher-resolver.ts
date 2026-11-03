/**
 * ================================================================
 * Resolvedor de identidad de docentes y staff
 * ================================================================
 *
 * En la base viva no existen tablas `users`, `profiles` ni `teachers`.
 * Los UUID de docentes/staff son sintéticos y se resuelven por email/nombre.
 *
 * Este módulo centraliza ese mapeo. `time-tracking.service.ts` lo re-exporta
 * para no romper los imports existentes del kiosco y de los widgets de turno.
 */

import type { ActorRef } from "@/lib/informes/types";

export const TEACHER_IDS = {
  ROCIO: "00000000-0000-0000-0000-000000000001",
  NAYELI: "00000000-0000-0000-0000-000000000002",
  JEREMY: "00000000-0000-0000-0000-000000000003",
  FERNANDO: "00000000-0000-0000-0000-000000000004",
  NATHALY: "00000000-0000-0000-0000-000000000005",
  DEMO: "00000000-0000-0000-0000-000000000006",
  SERGIO: "00000000-0000-0000-0000-000000000007",
  KARLA: "00000000-0000-0000-0000-000000000008",
  FABRICIO: "00000000-0000-0000-0000-000000000009",
} as const;

export type TeacherKey = keyof typeof TEACHER_IDS;
export type TeacherId = (typeof TEACHER_IDS)[TeacherKey];

/**
 * Teléfonos oficiales del personal docente (ADR-0184).
 *
 * Formato canónico `wa.me`: código de país + número, SOLO dígitos.
 * (`51` + 9 dígitos peruanos, sin `+`, sin espacios ni guiones).
 *
 * Por qué vive aquí y no en `users.phone`:
 *   - Los UUID de `TEACHER_IDS` son sintéticos, no usuarios de auth; la tabla
 *     `users` no está expuesta por PostgREST (404 al hacer PATCH/GET).
 *   - Aquí es la fuente única junto al nombre y al UUID, y cualquier vista lo
 *     hereda (mismo criterio que `INSTRUMENT_SPECIALISTS`, ADR-0179).
 *
 * Privacidad: son números de contacto PROFESIONAL, ya publicados en el
 * WhatsApp Business de la escuela y en las invitaciones. NO son credenciales.
 * No se "cifran" porque el navegador debe descifrarlos para armar `wa.me`:
 * cifrarlos daría seguridad aparente. Jamás poner aquí contraseñas ni tokens.
 */
export const TEACHER_PHONES: Partial<Record<TeacherKey, string>> = {
  JEREMY: "51980308142",
  NATHALY: "51959387858",
  FERNANDO: "51983408944",
};

/** Teléfono `wa.me` de un docente por UUID sintético. `null` si no está mapeado. */
export function resolveTeacherPhoneById(id?: string | null): string | null {
  if (!id) return null;
  const entry = (Object.keys(TEACHER_IDS) as TeacherKey[]).find(
    (key) => TEACHER_IDS[key] === id,
  );
  if (!entry) return null;
  return TEACHER_PHONES[entry] ?? null;
}

/** Teléfono `wa.me` de un docente por nombre/email libre. `null` si no está mapeado. */
export function resolveTeacherPhone(email?: string, name?: string): string | null {
  const known = findKnownIdentity(email, name);
  if (!known) return null;
  return resolveTeacherPhoneById(known.id);
}

/**
 * Normaliza un teléfono a formato `wa.me` (solo dígitos, con `51`).
 * Devuelve `null` si no alcanza para ser un celular peruano válido,
 * evitando construir enlaces a números inexistentes.
 */
export function toWhatsAppNumber(raw?: string | null): string | null {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return null;
  const national = digits.startsWith("51") ? digits.slice(2) : digits;
  if (national.length !== 9 || !national.startsWith("9")) return null;
  return `51${national}`;
}

interface KnownIdentity {
  id: TeacherId;
  name: string;
  matches: string[];
}

const KNOWN_IDENTITIES: KnownIdentity[] = [
  {
    id: TEACHER_IDS.JEREMY,
    name: "Jeremy",
    matches: ["jeremy"],
  },
  {
    id: TEACHER_IDS.FERNANDO,
    name: "Fernando",
    matches: ["fernando"],
  },
  {
    id: TEACHER_IDS.NATHALY,
    name: "Nathaly",
    matches: ["nathaly", "nataly"],
  },
  {
    id: TEACHER_IDS.KARLA,
    name: "Karla",
    matches: ["karla"],
  },
  {
    id: TEACHER_IDS.SERGIO,
    name: "Sergio",
    matches: ["sergio"],
  },
  {
    id: TEACHER_IDS.FABRICIO,
    name: "Fabricio",
    matches: ["fabricio"],
  },
  {
    id: TEACHER_IDS.ROCIO,
    name: "Rocío",
    matches: ["dueña", "duena", "rocío", "rocio"],
  },
  {
    id: TEACHER_IDS.NAYELI,
    name: "Nayeli",
    matches: ["nayeli"],
  },
];

const NAME_BY_ID = new Map<string, string>(
  KNOWN_IDENTITIES.map((identity) => [identity.id, identity.name] as const),
);

function findKnownIdentity(email?: string, name?: string): KnownIdentity | null {
  const haystack = `${email || ""} ${name || ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  for (const identity of KNOWN_IDENTITIES) {
    if (identity.matches.some((match) => haystack.includes(match))) {
      return identity;
    }
  }
  return null;
}

function cleanDisplayName(name?: string): string {
  return (name || "")
    .replace(/^\s*(prof(?:e|esor|esora)?\.?)\s+/i, "")
    .trim();
}

/**
 * Mapeo histórico. Devuelve el UUID sintético o el genérico de "Profesor Demo".
 * Se mantiene idéntico al comportamiento anterior para no romper el kiosco.
 */
export function resolveTeacherUserId(email?: string, name?: string): string {
  const known = findKnownIdentity(email, name);
  return known ? known.id : TEACHER_IDS.DEMO;
}

/** Nombre canónico para auditoría (sin "Prof." y con tilde correcta). */
export function resolveTeacherName(email?: string, name?: string): string {
  const known = findKnownIdentity(email, name);
  if (known) return known.name;
  return cleanDisplayName(name) || "Profesor Demo";
}

/**
 * Nombre canónico a partir del UUID sintético.
 *
 * Se usa para explicar de quién son unos criterios (ADR-0179), sin depender
 * de que el nombre viaje en la fila.
 */
export function resolveTeacherNameById(id?: string | null): string | null {
  if (!id) return null;
  return NAME_BY_ID.get(id) ?? null;
}

/** Actor listo para `created_by_*`, `reviewed_by_*`, etc. */
export function resolveActor(
  email?: string,
  name?: string,
  role?: string | null,
): ActorRef {
  return {
    id: resolveTeacherUserId(email, name),
    name: resolveTeacherName(email, name),
    role: role || null,
  };
}

/** True si el UUID es uno de los IDs sintéticos conocidos. */
export function isSyntheticTeacherId(value?: string | null): boolean {
  if (!value) return false;
  return (Object.values(TEACHER_IDS) as string[]).includes(value);
}
