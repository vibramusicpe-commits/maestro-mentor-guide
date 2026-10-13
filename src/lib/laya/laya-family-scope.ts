/**
 * ============================================================================
 * LAYA FAMILY SCOPE — Alcance por Familia para el Modo Padre (Fase 1, ADR-0170)
 * ============================================================================
 *
 * REGLA INNEGOCIABLE: en modo padre, Laya SOLO ve datos de la familia
 * vinculada a la invitación aceptada. Listados globales (deudores, alumnos
 * por filtro, snapshots con nombres) quedan prohibidos; @menciones, nombres
 * y pronombres ("mi hijo") se resuelven ÚNICAMENTE dentro de sus hijos.
 * Sin alcance resuelto no se responde con datos (mensaje de vinculación).
 *
 * Sin UI en Fase 1: este módulo es lógica pura, verificable con harness.
 * ============================================================================
 */
import type { AdminStudent } from "@/store/app-store";
import type { Invoice } from "@/store/admin-seeds";
import { isMatchingStudentName } from "@/lib/student-matching";

export type FamilyScopeResolution =
  | "invite_family_id"
  | "guardian_email"
  | "manual_name"
  | "unresolved";

export interface FamilyScopeInput {
  inviteFamilyId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  manualName?: string | null;
  adminStudents: AdminStudent[];
}

export interface FamilyScope {
  resolved: boolean;
  resolvedHow: FamilyScopeResolution;
  familyId: string | null;
  familyName: string;
  guardianEmail: string;
  students: AdminStudent[];
}

const normEmail = (e?: string | null) => (e || "").trim().toLowerCase();
const normText = (t?: string | null) => (t || "").trim().toLowerCase();

/**
 * Resuelve a qué familia e hijos pertenece quien entra con invitación.
 * Prioridad: family_id de la invitación > email del apoderado > nombre manual.
 * La identidad NO se pregunta cuando el enlace ya la trae (Fase 1).
 */
export function resolveFamilyScope(input: FamilyScopeInput): FamilyScope {
  const pool = (input.adminStudents || []).filter((s) => s.status === "activo");
  const empty: FamilyScope = {
    resolved: false,
    resolvedHow: "unresolved",
    familyId: null,
    familyName: "",
    guardianEmail: normEmail(input.userEmail),
    students: [],
  };
  if (pool.length === 0) return empty;

  // 1. family_id exacto de la invitación aceptada (agrupa hermanos)
  const fid = (input.inviteFamilyId || "").trim();
  if (fid) {
    const firstPass = pool.filter((s) => (s.familyId || "") === fid);
    if (firstPass.length > 0) {
      const hits = expandSiblings(pool, firstPass);
      return {
        resolved: true,
        resolvedHow: "invite_family_id",
        familyId: fid,
        familyName: hits[0]?.family || "",
        guardianEmail: normEmail(input.userEmail),
        students: hits,
      };
    }
  }

  // 2. Email del apoderado (email de la ficha), expandido a hermanos:
  // los hermanos pueden traer emails distintos, así que el alcance se amplía
  // a todos los activos con igual familyId o igual nombre de familia.
  const em = normEmail(input.userEmail);
  if (em) {
    const firstPass = pool.filter((s) => normEmail(s.email) === em);
    if (firstPass.length > 0) {
      const hits = expandSiblings(pool, firstPass);
      return {
        resolved: true,
        resolvedHow: "guardian_email",
        familyId: hits[0]?.familyId || null,
        familyName: hits[0]?.family || "",
        guardianEmail: em,
        students: hits,
      };
    }
  }

  // 3. Nombre manual (fallback explícito, una sola pregunta)
  const manual = normText(input.manualName);
  if (manual) {
    const firstPass = pool.filter((s) => isMatchingStudentName(s.name, input.manualName || ""));
    if (firstPass.length > 0) {
      const hits = expandSiblings(pool, firstPass);
      return {
        resolved: true,
        resolvedHow: "manual_name",
        familyId: hits[0]?.familyId || null,
        familyName: hits[0]?.family || "",
        guardianEmail: em,
        students: hits,
      };
    }
  }

  return empty;
}

/** Amplía un conjunto inicial a todos los hermanos activos (igual familyId o familia). */
function expandSiblings(pool: AdminStudent[], seed: AdminStudent[]): AdminStudent[] {
  const ids = new Set(seed.map((s) => s.id));
  const fids = new Set(seed.map((s) => s.familyId || "").filter(Boolean));
  const fnames = new Set(seed.map((s) => normText(s.family)).filter(Boolean));
  return pool.filter(
    (s) =>
      ids.has(s.id) ||
      ((s.familyId || "") !== "" && fids.has(s.familyId || "")) ||
      (normText(s.family) !== "" && fnames.has(normText(s.family)))
  );
}

/** Alumnos del pool restringidos al alcance (vacío si no resuelto). */
export function studentsInScope(pool: AdminStudent[], scope: FamilyScope): AdminStudent[] {
  if (!scope.resolved) return [];
  const ids = new Set(scope.students.map((s) => s.id));
  return (pool || []).filter((s) => s.status === "activo" && ids.has(s.id));
}

/**
 * Recibos del alcance: concepto enlazado a un hijo o familia idéntica.
 * Jamás incluye recibos de otras familias.
 */
export function invoicesInScope(invoices: Invoice[], scope: FamilyScope): Invoice[] {
  if (!scope.resolved) return [];
  const names = scope.students.map((s) => s.name);
  const fam = normText(scope.familyName);
  return (invoices || []).filter(
    (inv) =>
      names.some((n) => inv.concept && isMatchingStudentName(inv.concept, n)) ||
      (fam !== "" && normText(inv.family) === fam)
  );
}

export interface ChildRef {
  student?: AdminStudent;
  needsChoice?: AdminStudent[];
  notFound?: boolean;
}

/**
 * Resuelve a qué hijo se refiere el texto, SIEMPRE dentro del alcance:
 * @mención o nombre (solo hijos vinculados), pronombres ("mi hijo/hija").
 * Un nombre que existe FUERA del alcance responde notFound sin filtrar
 * su existencia (no se confirma ni se niega de más).
 */
export function resolveChildReference(
  text: string,
  scope: FamilyScope,
  pool: AdminStudent[]
): ChildRef {
  if (!scope.resolved || scope.students.length === 0) return { notFound: true };
  const kids = scope.students;

  // 1. @mención (exacta o contenida) dentro del alcance
  const at = (text || "").match(/@([A-Za-zÁÉÍÓÚÑáéíóúñ]{2,})(?:\s+[A-Za-zÁÉÍÓÚÑáéíóúñ]{2,}){0,3}/);
  if (at) {
    const mention = at[0].slice(1).trim().toLowerCase();
    const hits = kids.filter(
      (st) => st.name.toLowerCase() === mention || st.name.toLowerCase().includes(mention)
    );
    if (hits.length === 1) return { student: hits[0]! };
    if (hits.length > 1) return { needsChoice: hits };
    return { notFound: true };
  }

  // 2. Pronombres de apoderado
  if (/mi\s+(hijo|hija|niño|niña|nino|nina)\b|\b(hijo|hija)\b/i.test(text || "")) {
    if (kids.length === 1) return { student: kids[0]! };
    return { needsChoice: [...kids] };
  }

  // 3. Nombre explícito dentro del alcance
  const inHit = kids.find((st) => isMatchingStudentName(text || "", st.name));
  if (inHit) return { student: inHit };

  // 4. ¿Menciona a alguien fuera del alcance? No filtrar existencia.
  const poolHit = (pool || []).find(
    (st) => st.status === "activo" && isMatchingStudentName(text || "", st.name)
  );
  if (poolHit) return { notFound: true };

  // Sin referencia a ningún hijo: no es error, es consulta general del alcance
  return {};
}

/** Mensaje cuando el acceso aún no está vinculado a ninguna familia. */
export function unresolvedScopeReply(): string {
  return (
    "¡Hola! Te saluda Vibra Music. 🎵\n\n" +
    "Para mostrarte la información de tu familia necesito vincular tu acceso: " +
    "dime el nombre completo del alumno para continuar."
  );
}

/** Mensaje cuando la referencia no corresponde a un hijo vinculado. */
export function childNotFoundReply(scope: FamilyScope): string {
  const names =
    scope.students.length > 0
      ? scope.students.map((s) => s.name.split(" ")[0]).join(" o ")
      : "tu hijo";
  return (
    "¡Hola! Te saluda Vibra Music. 🎵\n\n" +
    `Entre tus hijos vinculados no encontré a quien mencionas. ¿Te refieres a ${names}?`
  );
}
