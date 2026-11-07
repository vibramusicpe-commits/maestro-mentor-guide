/**
 * ================================================================
 * family-account.ts — Cuenta familiar de SOLO LECTURA (ADR-0190)
 * ================================================================
 *
 * Responde UNA pregunta operativa: *¿cuánto contrató esta familia, cuánto
 * pagó realmente y cuánto le queda pendiente, instrumento por instrumento?*
 *
 * Reglas innegociables:
 *   - **Este módulo NO escribe nada.** Ni red, ni store, ni base de datos.
 *     Es una función pura sobre datos ya cargados por el store.
 *   - **NUNCA fusiona matrículas**: cada instrumento conserva su línea y sus
 *     montos. Solo se agrupan para mostrar el total del pagador.
 *   - **La agrupación NO es por `family_id` a secas.** En esta base, 56 de 62
 *     alumnos activos tienen `family_id` = su propio UUID de alumno, así que
 *     agrupar por ahí parte familias reales en pedazos. Se agrupa por unión de
 *     `personGroupId` (misma persona) y `familyId` REAL (≠ uuid del alumno).
 *   - **La matrícula se cobra UNA vez por familia** (ADR-0188 §93.4); el libro
 *     se cobra por instrumento. El resumen lo refleja y lo declara.
 *   - **El excedente es saldo a favor de la familia**: se muestra aparte y
 *     **jamás** se aplica automáticamente a otro instrumento.
 *   - Sin recibo en `invoices` se cae a la ficha y se marca `sin-recibo`, sin
 *     inventar montos en silencio.
 *
 * Fuente única: cualquier vista que muestre la cuenta de una familia debe
 * consumir este módulo (ADR-0119.3). Prohibido reimplementar los cálculos.
 */

import { normalizeStudentName } from "@/lib/student-matching";

// ---------------------------------------------------------------
// Tipos de entrada (estructurales: AdminStudent e Invoice los cumplen)
// ---------------------------------------------------------------

export interface FamilyStudentInput {
  id: string;
  name: string;
  instrument?: string;
  status?: string;
  familyId?: string;
  personGroupId?: string;
  personGroupLabel?: string;
  planPrice?: number;
  amountPaid?: number;
  balance?: number;
  planType?: string;
  matriculaType?: string;
  matriculaScope?: "familia" | "instrumento";
  packUtilesCost?: number;
  packUtilesAmountPaid?: number;
  packUtilesStatus?: string;
  packUtilesDelivered?: boolean;
  invoices?: Array<{ id: string }>;
  emergencyContact?: unknown;
}

export interface FamilyInvoiceInput {
  id: string;
  family?: string;
  /** UUID de `families` en PostgreSQL (ADR-0190: desambigua homónimos). */
  familyId?: string;
  student?: string;
  concept?: string;
  amount: number;
  amountPaid: number;
  remainingBalance: number;
  status?: string;
  paymentLogs?: Array<{ amount: number; method?: string; note?: string }>;
}

// ---------------------------------------------------------------
// Tipos de salida
// ---------------------------------------------------------------

export type FamilyRubro = "matricula" | "mensualidad" | "libro";

export type FamilyLineStatus =
  | "pagado"
  | "parcial"
  | "pendiente"
  | "exonerado"
  | "sin-recibo";

export interface FamilyAccountPayment {
  amount: number;
  method?: string;
  note?: string;
}

export interface FamilyAccountLine {
  key: string;
  rubro: FamilyRubro;
  rubroLabel: string;
  studentId: string;
  studentName: string;
  instrument: string;
  invoiceId: string | null;
  concept: string;
  contracted: number;
  applied: number;
  pending: number;
  status: FamilyLineStatus;
  note: string | null;
  payments: FamilyAccountPayment[];
}

export interface FamilyAccountMember {
  id: string;
  name: string;
  instrument: string;
  status: string;
  hasRealFamily: boolean;
  personGroupId: string | null;
}

export interface FamilyAccountTotals {
  contracted: number;
  applied: number;
  pending: number;
}

export interface FamilyAccountSummary {
  key: string;
  label: string;
  members: FamilyAccountMember[];
  lines: FamilyAccountLine[];
  totals: FamilyAccountTotals;
  /** Saldo a favor declarado (bolsa familiar). Nunca se aplica solo. */
  creditBalance: number;
  /** Excedente detectado en pagos (amountPaid > contratado). Informativo. */
  detectedOverpayment: number;
  warnings: string[];
  /** `true` cuando la cuenta agrupa 2+ matrículas reales. */
  isMultiInstrument: boolean;
  /** `true` si hay algo que valga la pena mostrar (evita ruido en fichas simples). */
  isRelevant: boolean;
}

// ---------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------

const MONEY_EPSILON = 0.005;

const RUBRO_LABELS: Record<FamilyRubro, string> = {
  matricula: "1. Matrícula",
  mensualidad: "2. Mensualidad",
  libro: "3. Libro / Útiles",
};

function round2(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

function money(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? round2(parsed) : 0;
}

function isRealFamilyId(familyId: string | undefined, studentId: string): boolean {
  const raw = String(familyId || "").trim();
  if (!raw) return false;
  if (raw.toLowerCase() === "sin-family") return false;
  if (raw.toLowerCase() === String(studentId || "").toLowerCase()) return false;
  return true;
}

/** Nombre del alumno dentro del concepto del recibo (`Plan … — Nombre`). */
function studentNameFromConcept(concept: string | undefined): string {
  const raw = String(concept || "");
  if (!raw.includes("—")) return "";
  return (raw.split("—")[1] || "").trim();
}

function normalizeText(value: string | undefined): string {
  return String(value || "").trim().toLowerCase();
}

/** Matrícula institucional por tipo declarado en la ficha. */
export function matriculaAmountForType(type: string | undefined): number {
  const value = normalizeText(type);
  if (!value) return 0;
  if (value.includes("exonerad")) return 0;
  if (value.includes("promo") || value.includes("demo")) return 30;
  if (value.includes("regular")) return 120;
  return 0;
}

/** Costo del libro por defecto (S/ 67) salvo exoneración declarada. */
export function libroAmountFor(student: FamilyStudentInput): number {
  const status = normalizeText(student.packUtilesStatus);
  if (status.includes("exonerad")) return 0;
  const declared = money(student.packUtilesCost);
  if (declared > 0) return declared;
  if (status.includes("cancelad") || status.includes("parcial") || status.includes("pendiente") || student.packUtilesDelivered) {
    return 67;
  }
  return 0;
}

function lineStatusFor(contracted: number, pending: number, applied: number): FamilyLineStatus {
  if (contracted <= 0) return "exonerado";
  if (pending <= MONEY_EPSILON) return "pagado";
  if (applied > MONEY_EPSILON) return "parcial";
  return "pendiente";
}

/** Clasifica el rubro de un recibo a partir de su concepto. */
export function classifyInvoiceRubro(concept: string | undefined): FamilyRubro {
  const value = normalizeText(concept);
  if (!value) return "mensualidad";
  if (value.includes("matr") || value.includes("inscrip")) return "matricula";
  if (
    value.includes("libro") ||
    value.includes("útil") ||
    value.includes("util") ||
    value.includes("pack") ||
    value.includes("material")
  ) {
    return "libro";
  }
  return "mensualidad";
}

// ---------------------------------------------------------------
// Agrupación de familia (unión de persona + familia real)
// ---------------------------------------------------------------

interface GroupNode {
  parent: string;
}

function createUnionFind() {
  const parent = new Map<string, string>();

  const find = (node: string): string => {
    if (!parent.has(node)) parent.set(node, node);
    let current = node;
    while (parent.get(current) !== current) {
      const grandParent = parent.get(parent.get(current) as string) as string;
      parent.set(current, grandParent);
      current = grandParent;
    }
    return current;
  };

  const union = (a: string, b: string): void => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent.set(rootB, rootA);
  };

  return { find, union };
}

/**
 * Agrupa alumnos en cuentas familiares.
 *
 * Une por `personGroupId` (misma persona, varios instrumentos) **y** por
 * `familyId` REAL (varios hijos del mismo apoderado). Si ninguno de los dos
 * existe, el alumno queda solo: exactamente como hoy.
 */
export function groupStudentsByFamily(
  students: FamilyStudentInput[],
): Map<string, FamilyStudentInput[]> {
  // Nodo de cada alumno: `s:<id>` para no colisionar con los otros prefijos.
  const { find, union } = createUnionFind();

  for (const student of students) {
    find(`s:${student.id}`);
    if (student.personGroupId) union(`s:${student.id}`, `p:${student.personGroupId}`);
    if (isRealFamilyId(student.familyId, student.id)) {
      union(`s:${student.id}`, `f:${String(student.familyId).trim().toLowerCase()}`);
    }
  }

  const groups = new Map<string, FamilyStudentInput[]>();
  for (const student of students) {
    const root = find(`s:${student.id}`);
    const bucket = groups.get(root);
    if (bucket) bucket.push(student);
    else groups.set(root, [student]);
  }
  return groups;
}

/** Etiqueta legible del grupo: `personGroupLabel` → apellido familiar → nombre. */
function resolveGroupLabel(students: FamilyStudentInput[]): string {
  const explicit = students
    .map((student) => (student.personGroupLabel || "").trim())
    .find((value) => value.length > 0);
  if (explicit) return explicit;

  const first = students[0];
  if (!first) return "Familia";
  if (students.length === 1) return first.name;
  const family = (first as { family?: string }).family;
  if (family && family.trim().length > 0) return family.trim();
  return first.name;
}

// ---------------------------------------------------------------
// Motor principal
// ---------------------------------------------------------------

function readDeclaredCredit(student: FamilyStudentInput): number {
  const contact = student.emergencyContact as
    | { creditBalance?: unknown; saldoAFavor?: unknown; familyCredit?: unknown }
    | undefined;
  if (!contact || typeof contact !== "object") return 0;
  return money(contact.creditBalance ?? contact.saldoAFavor ?? contact.familyCredit);
}

/**
 * Índice de atribución recibo → matrícula.
 *
 * El problema real: dos matrículas pueden llamarse EXACTAMENTE igual
 * ("Luciana" y "Luciana" en Piano tras un reintento). Atribuir por nombre
 * entonces duplica el recibo en las dos cuentas. Aquí se resuelve con una
 * cadena de prioridad y, si nada desambigua, se declara **ambiguo** y el
 * recibo NO se suma a ninguna cuenta (se avisa). Nunca se adivina.
 */
interface StudentIndex {
  byId: Map<string, FamilyStudentInput>;
  byNameActive: Map<string, string[]>;
  byNameInactive: Map<string, string[]>;
  byFamily: Map<string, string[]>;
  byDeclaredInvoice: Map<string, string>;
}

function buildStudentIndex(students: FamilyStudentInput[]): StudentIndex {
  const index: StudentIndex = {
    byId: new Map(),
    byNameActive: new Map(),
    byNameInactive: new Map(),
    byFamily: new Map(),
    byDeclaredInvoice: new Map(),
  };

  const push = (map: Map<string, string[]>, key: string, id: string) => {
    const bucket = map.get(key);
    if (bucket) {
      if (!bucket.includes(id)) bucket.push(id);
    } else {
      map.set(key, [id]);
    }
  };

  for (const student of students) {
    index.byId.set(student.id, student);

    const normalized = normalizeStudentName(student.name);
    if (normalized) {
      push(student.status === "activo" ? index.byNameActive : index.byNameInactive, normalized, student.id);
    }

    const familyId = String(student.familyId || "").trim().toLowerCase();
    if (familyId) push(index.byFamily, familyId, student.id);

    for (const declared of student.invoices || []) {
      index.byDeclaredInvoice.set(declared.id, student.id);
    }
  }
  return index;
}

export interface InvoiceOwnership {
  studentId: string | null;
  ambiguous: boolean;
  reason: "vinculo" | "familia" | "nombre" | "ambiguo" | "sin-datos";
}

/**
 * Atribuye un recibo a UNA matrícula. Prioridad:
 *   1. Vínculo explícito (`student.invoices`).
 *   2. `family_id` del recibo (desambigua homónimos con distinta familia).
 *   3. Nombre exacto normalizado, **solo si es único** entre los activos.
 * Si nada lo desambigua → `ambiguous` y el recibo no entra en ninguna cuenta.
 */
export function resolveInvoiceOwnership(
  invoice: FamilyInvoiceInput,
  index: StudentIndex,
): InvoiceOwnership {
  const declared = index.byDeclaredInvoice.get(invoice.id);
  if (declared) return { studentId: declared, ambiguous: false, reason: "vinculo" };

  const rawName = invoice.student || studentNameFromConcept(invoice.concept);
  const normalizedName = normalizeStudentName(rawName || "");
  const familyId = String(invoice.familyId || "").trim().toLowerCase();
  const familyCandidates = familyId ? index.byFamily.get(familyId) || [] : [];

  // 2. Familia exacta.
  if (familyCandidates.length === 1) {
    return { studentId: familyCandidates[0] as string, ambiguous: false, reason: "familia" };
  }
  if (familyCandidates.length > 1) {
    if (!normalizedName) {
      return { studentId: null, ambiguous: true, reason: "ambiguo" };
    }
    const withinFamily = familyCandidates.filter((id) => {
      const student = index.byId.get(id);
      return student ? normalizeStudentName(student.name) === normalizedName : false;
    });
    if (withinFamily.length === 1) {
      return { studentId: withinFamily[0] as string, ambiguous: false, reason: "familia" };
    }
    return { studentId: null, ambiguous: true, reason: "ambiguo" };
  }

  if (!normalizedName) return { studentId: null, ambiguous: false, reason: "sin-datos" };

  // 3. Nombre exacto, solo si es único.
  const activeMatches = index.byNameActive.get(normalizedName) || [];
  if (activeMatches.length === 1) {
    return { studentId: activeMatches[0] as string, ambiguous: false, reason: "nombre" };
  }
  if (activeMatches.length > 1) {
    return { studentId: null, ambiguous: true, reason: "ambiguo" };
  }

  const inactiveMatches = index.byNameInactive.get(normalizedName) || [];
  if (inactiveMatches.length === 1) {
    return { studentId: inactiveMatches[0] as string, ambiguous: false, reason: "nombre" };
  }
  if (inactiveMatches.length > 1) {
    return { studentId: null, ambiguous: true, reason: "ambiguo" };
  }

  return { studentId: null, ambiguous: false, reason: "sin-datos" };
}

function invoiceToLine(
  invoice: FamilyInvoiceInput,
  student: FamilyStudentInput,
): FamilyAccountLine {
  const rubro = classifyInvoiceRubro(invoice.concept);
  const contracted = money(invoice.amount);
  const applied = money(invoice.amountPaid);
  const pending =
    invoice.remainingBalance !== undefined && invoice.remainingBalance !== null
      ? money(invoice.remainingBalance)
      : Math.max(0, round2(contracted - applied));

  return {
    key: invoice.id,
    rubro,
    rubroLabel: RUBRO_LABELS[rubro],
    studentId: student.id,
    studentName: student.name,
    instrument: student.instrument || "Sin instrumento",
    invoiceId: invoice.id,
    concept: invoice.concept || RUBRO_LABELS[rubro],
    contracted,
    applied,
    pending,
    status: lineStatusFor(contracted, pending, applied),
    note: null,
    payments: (invoice.paymentLogs || []).map((log) => ({
      amount: money(log.amount),
      ...(log.method ? { method: log.method } : {}),
      ...(log.note ? { note: log.note } : {}),
    })),
  };
}

function buildFichaLine(
  student: FamilyStudentInput,
  rubro: FamilyRubro,
  contracted: number,
  applied: number,
  note: string | null,
): FamilyAccountLine {
  const safeContracted = money(contracted);
  const safeApplied = Math.min(money(applied), safeContracted > 0 ? safeContracted : money(applied));
  const pending = Math.max(0, round2(safeContracted - safeApplied));
  return {
    key: `${student.id}:${rubro}:ficha`,
    rubro,
    rubroLabel: RUBRO_LABELS[rubro],
    studentId: student.id,
    studentName: student.name,
    instrument: student.instrument || "Sin instrumento",
    invoiceId: null,
    concept: RUBRO_LABELS[rubro],
    contracted: safeContracted,
    applied: safeApplied,
    pending,
    status: lineStatusFor(safeContracted, pending, safeApplied),
    note,
    payments: [],
  };
}

/**
 * Construye la cuenta familiar completa.
 *
 * @param students Todos los alumnos del store (se filtran internamente los del
 *                 grupo del alumno consultado cuando se pasa `focusStudentId`).
 * @param invoices Recibos del store.
 * @param focusStudentId Alumno cuya cuenta se quiere ver.
 */
export function buildFamilyAccount(
  students: FamilyStudentInput[],
  invoices: FamilyInvoiceInput[],
  focusStudentId: string,
): FamilyAccountSummary | null {
  const focus = students.find((student) => student.id === focusStudentId);
  if (!focus) return null;

  const groups = groupStudentsByFamily(students);
  let members: FamilyStudentInput[] = [focus];
  for (const group of groups.values()) {
    if (group.some((student) => student.id === focusStudentId)) {
      members = group;
      break;
    }
  }

  // Activos primero; los inactivos del grupo se muestran pero no duplican cobros.
  const sortedMembers = [...members].sort((a, b) => {
    const aActive = a.status === "activo" ? 0 : 1;
    const bActive = b.status === "activo" ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return a.name.localeCompare(b.name, "es");
  });

  const warnings: string[] = [];
  const lines: FamilyAccountLine[] = [];
  const memberIds = new Set(sortedMembers.map((member) => member.id));
  const index = buildStudentIndex(students);

  // Atribución recibo → matrícula (una sola vez, sin duplicar entre cuentas).
  let ambiguousInvoices = 0;
  let unlinkedInvoices = 0;
  for (const invoice of invoices) {
    const ownership = resolveInvoiceOwnership(invoice, index);
    if (!ownership.studentId) {
      // La advertencia solo aplica si el recibo pertenece a ESTA familia.
      const invoiceFamily = String(invoice.familyId || "").trim().toLowerCase();
      const rawName = invoice.student || studentNameFromConcept(invoice.concept);
      const normalizedName = normalizeStudentName(rawName || "");
      const familyMatch =
        invoiceFamily.length > 0 &&
        sortedMembers.some(
          (member) => String(member.familyId || "").trim().toLowerCase() === invoiceFamily,
        );
      const nameMatch =
        normalizedName.length > 0 &&
        sortedMembers.some((member) => normalizeStudentName(member.name) === normalizedName);
      if (!familyMatch && !nameMatch) continue;

      if (ownership.ambiguous) ambiguousInvoices += 1;
      else if (ownership.reason === "sin-datos") unlinkedInvoices += 1;
      continue;
    }
    if (!memberIds.has(ownership.studentId)) continue;
    const owner = index.byId.get(ownership.studentId);
    if (!owner) continue;
    lines.push(invoiceToLine(invoice, owner));
  }

  if (ambiguousInvoices > 0) {
    warnings.push(
      `${ambiguousInvoices} recibo(s) no se pudieron atribuir: dos o más matrículas comparten el mismo nombre. Revísalos en Cobros y Abonos.`,
    );
  }
  if (unlinkedInvoices > 0) {
    warnings.push(
      `${unlinkedInvoices} recibo(s) de esta familia no indican el alumno en el concepto.`,
    );
  }

  // Relleno desde la ficha cuando un rubro no tiene recibo formal.
  const activeMembers = sortedMembers.filter((member) => member.status === "activo");
  const membersWithInvoice = (rubro: FamilyRubro) =>
    new Set(lines.filter((line) => line.rubro === rubro).map((line) => line.studentId));

  // --- Matrícula: UNA sola vez por familia (ADR-0188 §93.4) ---
  const matriculaCovered = membersWithInvoice("matricula");
  const explicitMatricula = activeMembers.filter(
    (member) => String(member.matriculaType || "").trim().length > 0,
  );
  const hasFormalMatriculaInvoice = matriculaCovered.size > 0;
  if (!hasFormalMatriculaInvoice && explicitMatricula.length > 0) {
    const payer = explicitMatricula.find(
      (member) => matriculaAmountForType(member.matriculaType) > 0,
    );
    for (const member of explicitMatricula) {
      const amount = matriculaAmountForType(member.matriculaType);
      const isPayer = payer ? payer.id === member.id : false;
      if (isPayer) {
        lines.push(
          buildFichaLine(
            member,
            "matricula",
            amount,
            money(member.emergencyContact && (member.emergencyContact as { matriculaAmountPaid?: unknown }).matriculaAmountPaid),
            "Matrícula institucional (una vez por familia).",
          ),
        );
      } else {
        lines.push({
          ...buildFichaLine(member, "matricula", 0, 0, null),
          note: payer
            ? `Exonerada: la matrícula institucional la cubre ${payer.name} (una sola vez por familia).`
            : "Exonerada por convenio.",
        });
      }
    }
  } else if (!hasFormalMatriculaInvoice && explicitMatricula.length === 0) {
    // Nada declarado: no se inventa matrícula.
  }

  // --- Libro: uno por instrumento ---
  const libroCovered = membersWithInvoice("libro");
  for (const member of activeMembers) {
    if (libroCovered.has(member.id)) continue;
    const cost = libroAmountFor(member);
    if (cost <= 0) continue;
    const paid = money(member.packUtilesAmountPaid);
    const delivered = Boolean(member.packUtilesDelivered);
    lines.push(
      buildFichaLine(
        member,
        "libro",
        cost,
        paid,
        delivered ? "Libro entregado en sala." : "Libro pendiente de entrega.",
      ),
    );
  }

  // --- Mensualidad sin recibo formal: se muestra la ficha, marcada ---
  const mensualidadCovered = membersWithInvoice("mensualidad");
  for (const member of activeMembers) {
    if (mensualidadCovered.has(member.id)) continue;
    const contracted = money(member.planPrice);
    const applied = money(member.amountPaid);
    if (contracted <= 0 && applied <= 0) continue;
    const line = buildFichaLine(
      member,
      "mensualidad",
      contracted,
      applied,
      "Sin recibo en facturación: montos tomados de la ficha.",
    );
    line.status = "sin-recibo";
    lines.push(line);
    warnings.push(`${member.name}: sin recibo de mensualidad en facturación.`);
  }

  // --- Totales (sin doble conteo de matrícula familiar) ---
  let totals: FamilyAccountTotals = { contracted: 0, applied: 0, pending: 0 };
  let detectedOverpayment = 0;
  let creditBalance = 0;

  for (const line of lines) {
    totals.contracted = round2(totals.contracted + line.contracted);
    totals.applied = round2(totals.applied + line.applied);
    totals.pending = round2(totals.pending + line.pending);
    detectedOverpayment = round2(
      detectedOverpayment +
        Math.max(0, round2(line.applied - line.contracted)),
    );
  }

  for (const member of sortedMembers) {
    creditBalance = round2(creditBalance + readDeclaredCredit(member));
  }

  // Recibos del grupo que no se pudieron enlazar a ningún alumno: se avisa,
  // no se suman (sumarlos inflaría la cuenta con datos de otra familia).

  // Homónimos activos dentro del grupo: riesgo real de confundir cuentas.
  const normalizedNames = new Map<string, string[]>();
  for (const member of sortedMembers) {
    const key = normalizeStudentName(member.name);
    const bucket = normalizedNames.get(key);
    if (bucket) bucket.push(member.id);
    else normalizedNames.set(key, [member.id]);
  }
  const duplicatedNames = Array.from(normalizedNames.values()).filter(
    (ids) => ids.length > 1,
  );
  if (duplicatedNames.length > 0) {
    warnings.push(
      "Hay 2 o más matrículas con el mismo nombre en esta cuenta. Verifica que no sean un duplicado antes de cobrar.",
    );
  }

  const isMultiInstrument = sortedMembers.length > 1;
  const isRelevant =
    isMultiInstrument ||
    creditBalance > MONEY_EPSILON ||
    detectedOverpayment > MONEY_EPSILON ||
    warnings.length > 0;

  return {
    key: `family:${sortedMembers.map((member) => member.id).sort().join("|")}`,
    label: resolveGroupLabel(sortedMembers),
    members: sortedMembers.map((member) => ({
      id: member.id,
      name: member.name,
      instrument: member.instrument || "Sin instrumento",
      status: member.status || "activo",
      hasRealFamily: isRealFamilyId(member.familyId, member.id),
      personGroupId: member.personGroupId || null,
    })),
    lines: lines.sort((a, b) => {
      const order: Record<FamilyRubro, number> = { matricula: 0, mensualidad: 1, libro: 2 };
      if (order[a.rubro] !== order[b.rubro]) return order[a.rubro] - order[b.rubro];
      return a.studentName.localeCompare(b.studentName, "es");
    }),
    totals,
    creditBalance,
    detectedOverpayment,
    warnings,
    isMultiInstrument,
    isRelevant,
  };
}

/** Total a favor exibible: lo declarado manda; si no, el excedente detectado. */
export function resolveCreditToShow(summary: FamilyAccountSummary): number {
  if (summary.creditBalance > MONEY_EPSILON) return summary.creditBalance;
  return summary.detectedOverpayment;
}

/** Formato monetario único de la cuenta familiar (PEN, 2 decimales). */
export function formatSoles(value: number): string {
  return `S/ ${money(value).toFixed(2)}`;
}

export const FAMILY_LINE_STATUS_LABELS: Record<FamilyLineStatus, string> = {
  pagado: "✓ Pagado",
  parcial: "⏳ Parcial",
  pendiente: "⚠ Pendiente",
  exonerado: "— Exonerado",
  "sin-recibo": "⚠ Sin recibo",
};
