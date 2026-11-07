// Solo lectura — auditoría de la base activa antes de las Fases 4–5 (dinero).
const key = "anon_897abc3685c27a2e113b8022caaf12a8dc8233b25aa9ce5397c83ffa88362804";
const host = "https://pdey9yma.us-east.insforge.app/api/database/records";

async function get(path) {
  const res = await fetch(`${host}/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

const students = await get(
  "students?status=eq.activo&select=id,full_name,instrument,family_id,modality,emergency_contact,created_at&order=full_name.asc",
);
const invoices = await get(
  "invoices?select=id,family_id,concept,amount,amount_paid,remaining_balance,status&order=created_at.desc",
);

console.log(`Activos: ${students.length} · Recibos: ${invoices.length}\n`);

// 1. Agrupación por nombre base (sin sufijo de instrumento)
const baseName = (name) => String(name || "").replace(/\s*\([^)]*\)\s*$/, "").trim().toLowerCase();
const byName = new Map();
for (const s of students) {
  const k = baseName(s.full_name);
  if (!byName.has(k)) byName.set(k, []);
  byName.get(k).push(s);
}

const multi = [...byName.entries()].filter(([, list]) => list.length > 1);
console.log(`Nombres con más de una matrícula activa: ${multi.length}`);
for (const [name, list] of multi) {
  console.log(`\n• ${name} (${list.length})`);
  for (const s of list) {
    const ec = s.emergency_contact || {};
    console.log(
      `   ${s.instrument.padEnd(18)} id=${s.id.slice(0, 8)}  family=${String(s.family_id).slice(0, 8)}  ` +
        `persona=${ec.personGroupId ? String(ec.personGroupId).slice(0, 8) : "—"}  ` +
        `plan=${ec.planPrice ?? "?"} pagado=${ec.amountPaid ?? "?"} saldo=${ec.balance ?? "?"}  ` +
        `matr=${ec.matriculaType ?? "?"}`,
    );
  }
}

// 2. Familias con más de un alumno
const byFamily = new Map();
for (const s of students) {
  const f = s.family_id || "sin-family";
  if (!byFamily.has(f)) byFamily.set(f, []);
  byFamily.get(f).push(s);
}
const famMulti = [...byFamily.entries()].filter(([, l]) => l.length > 1);
console.log(`\nFamilias con más de un alumno activo: ${famMulti.length}`);
for (const [fid, list] of famMulti) {
  console.log(`   ${fid.slice(0, 8)} → ${list.map((s) => `${s.full_name}(${s.instrument})`).join(", ")}`);
}

// 3. Alumnos sin persona vinculada teniendo hermano de mismo nombre
const unlinked = multi.filter(([, l]) => l.some((s) => !s.emergency_contact?.personGroupId));
console.log(`\nNombres con matrículas SIN personGroupId: ${unlinked.length}`);
for (const [name, list] of unlinked) {
  console.log(`   ${name}: ${list.map((s) => `${s.instrument}=${s.emergency_contact?.personGroupId ? "sí" : "NO"}`).join(" · ")}`);
}

// 4. Total facturado/cobrado/pendiente de la base viva
const sum = (arr, f) => arr.reduce((a, x) => a + (Number(f(x)) || 0), 0);
console.log(
  `\nCartera (todos los recibos): facturado S/ ${sum(invoices, (i) => i.amount).toFixed(2)} · ` +
    `cobrado S/ ${sum(invoices, (i) => i.amount_paid).toFixed(2)} · ` +
    `saldo S/ ${sum(invoices, (i) => i.remaining_balance).toFixed(2)}`,
);

// 5. Activos sin recibo (por nombre en el concepto)
const missing = students.filter((s) => {
  const n = baseName(s.full_name);
  return !invoices.some((i) => String(i.concept || "").toLowerCase().includes(n));
});
console.log(`\nActivos sin recibo identificable: ${missing.length}`);
for (const s of missing.slice(0, 15)) console.log(`   ${s.full_name} (${s.instrument})`);
if (missing.length > 15) console.log(`   … y ${missing.length - 15} más`);

// 6. Familia = UUID de alumno (defecto conocido)
const selfFamily = students.filter((s) => String(s.family_id).toLowerCase() === String(s.id).toLowerCase());
console.log(`\nAlumnos cuyo family_id es su propio UUID: ${selfFamily.length}`);
for (const s of selfFamily) console.log(`   ${s.full_name} (${s.instrument}) → ${s.family_id}`);
