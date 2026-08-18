import fs from "fs";
import path from "path";

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows = [];
  
  // Omitir cabecera
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cols = [];
    let cur = "";
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        if (inQuotes && line[c + 1] === '"') {
          cur += '"';
          c++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cols.push(cur.trim());
        cur = "";
      } else {
        cur += char;
      }
    }
    cols.push(cur.trim());

    if (cols[0]) {
      rows.push({
        alumno: cols[0] || "",
        diaCobro: cols[1] || "",
        observaciones: cols[2] || "",
        monto: cols[3] || "",
        junio: cols[4] || "",
        julio: cols[5] || "",
        agosto: cols[6] || "",
        septiembre: cols[7] || "",
        octubre: cols[8] || "",
        noviembre: cols[9] || "",
        diciembre: cols[10] || "",
      });
    }
  }
  return rows;
}

const csvPath = path.resolve("docs/Control_Pagos_Estructurado.csv");
const csvContent = fs.readFileSync(csvPath, "utf-8");
const parsedRows = parseCsv(csvContent);

console.log(`Total filas parseadas del CSV: ${parsedRows.length}`);

// Generar SQL para Insforge PostgreSQL
let sql = `-- ================================================================
-- Vibra Music / Insforge — Migración Oficial 006: 99 Alumnos y Control de Pagos
-- Ingesta de Alumnos, Familias, Días de Cobro y Facturación Histórica
-- ================================================================

DO $$
DECLARE
  v_admin_user_id UUID;
  v_staff_user_id UUID;
  v_family_id UUID;
  v_student_id UUID;
  v_inv_id UUID;
BEGIN
  -- Obtener o crear usuarios base si no existen
  SELECT id INTO v_admin_user_id FROM users WHERE role = 'super_admin' LIMIT 1;
  IF v_admin_user_id IS NULL THEN
    INSERT INTO users (email, full_name, role)
    VALUES ('direccion@vibramusic.pe', 'Claudia Villalobos (Dirección)', 'super_admin')
    RETURNING id INTO v_admin_user_id;
  END IF;

  SELECT id INTO v_staff_user_id FROM users WHERE role = 'staff' LIMIT 1;
  IF v_staff_user_id IS NULL THEN
    INSERT INTO users (email, full_name, role)
    VALUES ('nayeli@vibramusic.pe', 'Nayeli (Secretaría)', 'staff')
    RETURNING id INTO v_staff_user_id;
  END IF;

`;

const processedList = [];

parsedRows.forEach((r, idx) => {
  const cleanName = r.alumno.replace(/'/g, "''").trim();
  let dayNum = parseInt(r.diaCobro, 10);
  if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
    dayNum = 1; // Default día 1 de cada mes
  }

  let cleanMonto = 297;
  const montoMatch = r.monto.match(/(\d+(\.\d+)?)/);
  if (montoMatch) {
    cleanMonto = parseFloat(montoMatch[1]);
  } else if (r.observaciones.toLowerCase().includes("personalizada") || r.monto.includes("50")) {
    cleanMonto = 50;
  }

  let studentStatus = "activo";
  if (r.observaciones.toUpperCase().includes("NO CONTINUARÁ") || r.observaciones.toUpperCase().includes("BAJA")) {
    studentStatus = "baja";
  } else if (r.observaciones.toUpperCase().includes("EN PAUSA") || r.observaciones.toUpperCase().includes("PAUSA")) {
    studentStatus = "pausa";
  }

  let dueStatusAugust = "pendiente";
  const agoUpper = r.agosto.toUpperCase().trim();
  if (agoUpper.includes("CANCELADO") || agoUpper.includes("PAGADO")) {
    dueStatusAugust = "al-dia";
  } else if (agoUpper.includes("DEUDOR") || agoUpper.includes("PEN") || agoUpper.includes("FALTA")) {
    dueStatusAugust = "deudor";
  }

  processedList.push({
    name: r.alumno.trim(),
    paymentDay: dayNum,
    monthlyFee: cleanMonto,
    notes: r.observaciones.trim(),
    status: studentStatus,
    dueStatusAugust,
    junioStatus: r.junio.trim(),
    julioStatus: r.julio.trim(),
    agostoStatus: r.agosto.trim(),
  });

  const notesEscaped = r.observaciones.replace(/'/g, "''").trim();

  sql += `  -- [${idx + 1}/99] Alumno: ${cleanName}\n`;
  sql += `  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)\n`;
  sql += `  VALUES ('Familia ${cleanName}', '${cleanName}', '999000${String(idx + 1).padStart(3, '0')}', 'familia_${idx + 1}@vibramusic.pe', ${dayNum})\n`;
  sql += `  RETURNING id INTO v_family_id;\n\n`;

  sql += `  INSERT INTO students (family_id, full_name, instrument, level, status, notes)\n`;
  sql += `  VALUES (v_family_id, '${cleanName}', 'Piano/Guitarra/Canto', 'Nivel 1', '${studentStatus}', '${notesEscaped}')\n`;
  sql += `  RETURNING id INTO v_student_id;\n\n`;

  // Factura Agosto 2026
  let invStatusAgo = "pendiente";
  let paidAgo = 0;
  let remainingAgo = cleanMonto;

  if (dueStatusAugust === "al-dia") {
    invStatusAgo = "pagado";
    paidAgo = cleanMonto;
    remainingAgo = 0;
  } else if (agoUpper.includes("PEN 480")) {
    invStatusAgo = "parcial";
    paidAgo = 480;
    remainingAgo = Math.max(0, cleanMonto - 480);
  }

  sql += `  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)\n`;
  sql += `  VALUES (v_family_id, 'Mensualidad Agosto 2026 — ${cleanName}', ${cleanMonto}, ${paidAgo}, ${remainingAgo}, '2026-08-${String(dayNum).padStart(2, '0')}', '${invStatusAgo}')\n`;
  sql += `  RETURNING id INTO v_inv_id;\n\n`;

  if (paidAgo > 0) {
    sql += `  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)\n`;
    sql += `  VALUES (v_inv_id, v_staff_user_id, 'staff', ${paidAgo}, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');\n\n`;
  }
});

sql += `END $$;\n`;

fs.writeFileSync(path.resolve("docs/migrations/006_import_control_pagos_99_students.sql"), sql, "utf-8");
console.log("Archivo docs/migrations/006_import_control_pagos_99_students.sql generado exitosamente.");

// Generar archivo JSON de apoyo para sincronizar admin-seeds
fs.writeFileSync(
  path.resolve("docs/migrations/006_students_data.json"),
  JSON.stringify(processedList, null, 2),
  "utf-8"
);
console.log("Archivo docs/migrations/006_students_data.json generado exitosamente.");
