// ADR-0190 — verificación en runtime de la Cuenta Familiar (SOLO LECTURA).
// Usa el módulo real compilado (scratch/.family-account.mjs) + datos vivos.
import { buildFamilyAccount, groupStudentsByFamily, resolveCreditToShow, formatSoles } from "./.family-account.mjs";

const key = "anon_897abc3685c27a2e113b8022caaf12a8dc8233b25aa9ce5397c83ffa88362804";
const host = "https://pdey9yma.us-east.insforge.app/api/database/records";

async function get(path) {
  const res = await fetch(`${host}/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

let pass = 0;
let fail = 0;
function check(label, ok, detail = "") {
  if (ok) {
    pass += 1;
    console.log(`✅ ${label}${detail ? ` — ${detail}` : ""}`);
  } else {
    fail += 1;
    console.log(`❌ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

const rawStudents = await get(
  "students?status=eq.activo&select=id,full_name,instrument,family_id,emergency_contact,status&order=full_name.asc",
);
const rawInvoices = await get(
  "invoices?select=id,family_id,concept,amount,amount_paid,remaining_balance,status&order=created_at.desc",
);

// Réplica del mapeo de la app (students.service / invoices.service).
const students = rawStudents.map((row) => {
  const ec = row.emergency_contact || {};
  return {
    id: row.id,
    name: row.full_name,
    instrument: row.instrument,
    status: row.status,
    familyId: row.family_id,
    personGroupId: ec.personGroupId,
    personGroupLabel: ec.personGroupLabel,
    planPrice: ec.planPrice,
    amountPaid: ec.amountPaid,
    balance: ec.balance,
    matriculaType: ec.matriculaType,
    packUtilesCost: ec.packUtilesCost,
    packUtilesAmountPaid: ec.packUtilesAmountPaid,
    packUtilesStatus: ec.packUtilesStatus,
    packUtilesDelivered: ec.packUtilesDelivered,
    emergencyContact: ec,
  };
});

const invoices = rawInvoices.map((row) => {
  const concept = row.concept || "";
  const studentFromConcept = concept.includes("—") ? concept.split("—")[1]?.trim() : undefined;
  return {
    id: row.id,
    familyId: row.family_id,
    concept,
    student: studentFromConcept,
    amount: Number(row.amount) || 0,
    amountPaid: Number(row.amount_paid) || 0,
    remainingBalance: Number(row.remaining_balance) || 0,
    status: row.status,
    paymentLogs: [],
  };
});

const byName = (fragment) =>
  students.filter((s) => String(s.name).toLowerCase().includes(fragment.toLowerCase()));

// ---------------------------------------------------------------
// 1. Agrupación
// ---------------------------------------------------------------
const groups = groupStudentsByFamily(students);
const groupOf = (id) => {
  for (const [, list] of groups) if (list.some((s) => s.id === id)) return list;
  return [];
};

// Los conteos de "Luciana" CAMBIAN con los datos (se han creado registros
// nuevos en producción). El test verifica INVARIANTES, no fotos del día:
// los dos pares siguen identificables y no se contaminan entre sí.
const luciana = byName("luciana");
check("hay varias matrículas homónimas de Luciana", luciana.length >= 4, `${luciana.length}`);

const parAMembers = luciana.filter((s) => String(s.familyId).startsWith("2307efd3"));
const parBMembers = luciana.filter((s) => String(s.familyId).startsWith("1bb0c180"));
check(
  "par A conserva su Piano y su Canto (familia 2307efd3)",
  parAMembers.some((s) => s.instrument === "Piano") && parAMembers.some((s) => s.instrument === "Canto"),
  parAMembers.map((s) => s.instrument).join(" + "),
);
check(
  "par B conserva su Piano y su Canto (familia 1bb0c180)",
  parBMembers.some((s) => s.instrument === "Piano") && parBMembers.some((s) => s.instrument === "Canto"),
  parBMembers.map((s) => s.instrument).join(" + "),
);

const parA = luciana.find((s) => s.instrument === "Piano" && s.familyId === "2307efd3-4553-4676-9e7a-027334e90015");
const parB = luciana.find((s) => s.instrument === "Piano" && String(s.familyId).startsWith("1bb0c180"));

if (parA) {
  const g = groupOf(parA.id);
  // Invariante: TODOS los miembros comparten vínculo real (persona o familia),
  // nunca se agrupan solo por nombre. Hoy el grupo incluye además a
  // "Luciana Mendoza Gómez" porque comparte personGroupId f8fc5eef.
  check(
    "Par A agrupa solo por vínculo real (persona o familia)",
    g.length >= 2 &&
      g.every(
        (s) =>
          s.id === parA.id ||
          (s.personGroupId && s.personGroupId === parA.personGroupId) ||
          (s.familyId && String(s.familyId).startsWith("2307efd3")),
      ),
    g.map((s) => `${s.instrument}/${s.personGroupId ? "persona" : "sin-persona"}`).join(" + "),
  );
}
if (parB) {
  const g = groupOf(parB.id);
  check(
    "Par B agrupa 2 matrículas por family_id real (aunque una no tenga persona)",
    g.length === 2,
    g.map((s) => `${s.instrument}${s.personGroupId ? "" : "(sin persona)"}`).join(" + "),
  );
}

const camila = byName("camila valentina").filter((s) => s.status === "activo");
if (camila.length > 0) {
  const g = groupOf(camila[0].id);
  check("Familia Camila agrupa 2 hijas/instrumentos", g.length === 2, g.map((s) => s.name).join(" + "));
}
const mario = byName("mario kef").filter((s) => s.status === "activo");
if (mario.length > 0) {
  const g = groupOf(mario[0].id);
  check("Familia Mario agrupa 2 instrumentos", g.length === 2, g.map((s) => s.instrument).join(" + "));
}

// Alumnos con family_id = su propio UUID NO deben agruparse con ajenos:
// solo pueden compartir cuenta si comparten personGroupId o family_id real.
const selfFamily = students.filter((s) => String(s.familyId).toLowerCase() === String(s.id).toLowerCase());
const soloOk = selfFamily.every((s) => {
  const group = groupOf(s.id);
  return group.every(
    (other) =>
      other.id === s.id ||
      (other.personGroupId && other.personGroupId === s.personGroupId) ||
      (other.familyId && String(other.familyId).toLowerCase() === String(s.familyId).toLowerCase() &&
        String(other.familyId).toLowerCase() !== String(other.id).toLowerCase()),
  );
});
check("family_id = uuid propio no agrupa con ajenos", soloOk, `${selfFamily.length} alumnos`);

// ---------------------------------------------------------------
// 2. Cuenta de Luciana (Par A y Par B por separado)
// ---------------------------------------------------------------
const CLEAN = (s) => ({
  members: s?.members.map((m) => `${m.instrument}${m.personGroupId ? "" : "(sin persona)"}`).join(" + "),
  totals: s ? `${formatSoles(s.totals.contracted)} / ${formatSoles(s.totals.applied)} / ${formatSoles(s.totals.pending)}` : "null",
  lines: s?.lines.length ?? 0,
});

if (parA) {
  const acc = buildFamilyAccount(students, invoices, parA.id);
  console.log(`\n— Par A: ${CLEAN(acc).members} · ${CLEAN(acc).totals} · ${CLEAN(acc).lines} líneas`);
  const invoiceById = new Map(invoices.map((i) => [i.id, i]));
  const parAInvoiceFamilies = (acc?.lines || [])
    .filter((l) => l.invoiceId)
    .map((l) => String(invoiceById.get(l.invoiceId)?.familyId || "").slice(0, 8));
  check(
    "Par A NO recibe ningún recibo del par B (1bb0c180)",
    parAInvoiceFamilies.every((f) => f !== "1bb0c180"),
    parAInvoiceFamilies.join(", ") || "sin recibos",
  );
  check(
    "Par A incluye sus 2 matrículas por persona",
    acc && ["2307efd3", "57ee3ecc"].every((prefix) =>
      acc.members.some((m) => String(m.id).startsWith(prefix)),
    ),
    acc?.members.map((m) => m.instrument).join(" + ") ?? "",
  );
  check("Par A tiene mensualidad de Piano y de Canto", acc && acc.lines.filter((l) => l.rubro === "mensualidad").length >= 2);
  check(
    "Par A no marca ambigua su propia cuenta",
    acc && !acc.warnings.some((w) => w.includes("no se pudieron atribuir")),
    acc?.warnings.join(" | ") ?? "",
  );
  check("Par A exoneró la matrícula salvo una sola línea con monto", acc && acc.lines.filter((l) => l.rubro === "matricula" && l.contracted > 0).length <= 1);
}

if (parB) {
  const acc = buildFamilyAccount(students, invoices, parB.id);
  console.log(`— Par B: ${CLEAN(acc).members} · ${CLEAN(acc).totals} · ${CLEAN(acc).lines} líneas`);
  const invoiceById = new Map(invoices.map((i) => [i.id, i]));
  const parBInvoiceFamilies = (acc?.lines || [])
    .filter((l) => l.invoiceId)
    .map((l) => String(invoiceById.get(l.invoiceId)?.familyId || "").slice(0, 8));
  check(
    "Par B NO recibe ningún recibo del par A (2307efd3)",
    parBInvoiceFamilies.every((f) => f !== "2307efd3"),
    parBInvoiceFamilies.join(", ") || "sin recibos",
  );
  check(
    "Par B conserva su deuda de Canto sin inventar cero",
    acc && acc.lines.some((l) => l.rubro === "mensualidad" && l.status === "pendiente"),
    acc ? formatSoles(acc.totals.pending) : "",
  );
}

// ---------------------------------------------------------------
// 3. Sin doble conteo entre cuentas
// ---------------------------------------------------------------
const invoiceToAccounts = new Map();
for (const s of students) {
  const acc = buildFamilyAccount(students, invoices, s.id);
  if (!acc) continue;
  for (const line of acc.lines) {
    if (!line.invoiceId) continue;
    const bucket = invoiceToAccounts.get(line.invoiceId) || new Set();
    bucket.add(acc.key);
    invoiceToAccounts.set(line.invoiceId, bucket);
  }
}
const duplicated = [...invoiceToAccounts.entries()].filter(([, keys]) => keys.size > 1);
check("ningún recibo aparece en 2 cuentas", duplicated.length === 0, `${duplicated.length} duplicados`);

const globalApplied = rawInvoices.reduce((a, i) => a + (Number(i.amount_paid) || 0), 0);
const computedApplied = new Set();
let sumApplied = 0;
for (const [invoiceId, keys] of invoiceToAccounts) {
  if (computedApplied.has(invoiceId)) continue;
  computedApplied.add(invoiceId);
  const inv = invoices.find((i) => i.id === invoiceId);
  sumApplied += inv?.amountPaid || 0;
}
check(
  "suma de abonados no supera la cartera real",
  Math.round(sumApplied * 100) <= Math.round(globalApplied * 100),
  `${formatSoles(sumApplied)} ≤ ${formatSoles(globalApplied)}`,
);

// ---------------------------------------------------------------
// 4. Fichas simples no generan ruido (la tarjeta no se muestra)
// ---------------------------------------------------------------
const single = students.find((s) => s.familyId === s.id);
if (single) {
  const acc = buildFamilyAccount(students, invoices, single.id);
  check(
    "ficha simple con 1 recibo pagado no es 'relevante'",
    acc && acc.isRelevant === false,
    `${single.name} · líneas=${acc?.lines.length} · relevante=${acc?.isRelevant}`,
  );
}

// ---------------------------------------------------------------
// 5. Matrícula una sola vez por familia
// ---------------------------------------------------------------
for (const name of ["luciana", "camila valentina", "mario kef"]) {
  const list = byName(name);
  if (list.length < 2) continue;
  const acc = buildFamilyAccount(students, invoices, list[0].id);
  const matricula = acc?.lines.filter((l) => l.rubro === "matricula") || [];
  const charged = matricula.filter((l) => l.contracted > 0);
  check(
    `matrícula cobrada como máximo 1 vez (${name})`,
    charged.length <= 1,
    `${charged.length} línea(s) con monto`,
  );
}

// ---------------------------------------------------------------
// 6. Saldo a favor declarado (bolsa familiar)
// ---------------------------------------------------------------
const withCredit = { ...students.find((s) => s.id === (parB?.id || students[0].id)) };
if (withCredit) {
  withCredit.emergencyContact = { ...(withCredit.emergencyContact || {}), creditBalance: 250 };
  const roster = students.map((s) => (s.id === withCredit.id ? withCredit : s));
  const acc = buildFamilyAccount(roster, invoices, withCredit.id);
  check("saldo a favor declarado se lee de la ficha", acc && acc.creditBalance === 250, acc ? formatSoles(acc.creditBalance) : "");
  check("saldo a favor NO se aplica a la deuda", acc && acc.totals.pending > 0, acc ? formatSoles(acc.totals.pending) : "");
  check("resolveCreditToShow prioriza lo declarado", acc && resolveCreditToShow(acc) === 250);
}

// ---------------------------------------------------------------
// 7. Cero escrituras: el módulo no expone mutadores
// ---------------------------------------------------------------
const exportsList = Object.keys(await import("./.family-account.mjs"));
check(
  "el módulo solo exporta funciones de lectura",
  exportsList.every((name) => !/save|create|update|delete|apply|patch|post/i.test(name)),
  exportsList.join(", "),
);

console.log(`\n${pass}/${pass + fail} checks OK${fail > 0 ? ` · ${fail} fallidos` : ""}`);
process.exit(fail > 0 ? 1 : 0);
