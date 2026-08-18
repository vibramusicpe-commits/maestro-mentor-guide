import fs from "fs";
import path from "path";

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows = [];
  
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

console.log(`Parseando ${parsedRows.length} alumnos para el registro anual completo...`);

function parseMonthStatus(rawVal) {
  if (!rawVal) return { status: "vacio", text: "" };
  const upper = rawVal.trim().toUpperCase();
  if (upper.includes("CANCELADO") || upper.includes("PAGADO") || upper.includes("YA PAGO")) {
    return { status: "pagado", text: rawVal.trim() };
  }
  if (upper.includes("DEUDOR") || upper.includes("FALTA")) {
    return { status: "deudor", text: rawVal.trim() };
  }
  if (upper.includes("PEN") || upper.includes("PENDIENTE") || /^\d+$/.test(rawVal.trim())) {
    return { status: "parcial", text: rawVal.trim() };
  }
  if (upper.includes("PERSONALIZADO")) {
    return { status: "personalizado", text: rawVal.trim() };
  }
  return { status: "otro", text: rawVal.trim() };
}

const monthsKeys = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

let tsContent = `// ===== Datos Semilla Oficiales Generados desde Control_Pagos_Estructurado.csv =====
// Registro Anual Completo 2026 (Enero a Diciembre) para reemplazo definitivo del Excel
import type { AdminStudent, Invoice, VibraPlanType, MatriculaType, PaymentMethod, PaymentStatus, InvoiceStatus } from "./admin-seeds";

export interface AnnualMonthRecord {
  month: string;
  status: "pagado" | "deudor" | "parcial" | "pendiente" | "personalizado" | "vacio";
  rawText: string;
  amountExpected: number;
  amountPaid: number;
}

export interface ControlPagosStudentWithAnnual extends AdminStudent {
  annualRecords: Record<string, AnnualMonthRecord>;
  rawMontoText: string;
}

export const officialControlPagosStudents: ControlPagosStudentWithAnnual[] = [
`;

const invoicesList = [];

// 2. Procesar los 99 alumnos del CSV estrictamente oficiales
parsedRows.forEach((r, idx) => {
  const id = `as-cp-${idx + 1}`;
  const familyName = `Familia ${r.alumno.split(',')[0] || r.alumno}`;
  
  let dayNum = parseInt(r.diaCobro, 10);
  if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
    dayNum = 1;
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

  const junParsed = parseMonthStatus(r.junio);
  const julParsed = parseMonthStatus(r.julio);
  const agoParsed = parseMonthStatus(r.agosto);
  const sepParsed = parseMonthStatus(r.septiembre);
  const octParsed = parseMonthStatus(r.octubre);
  const novParsed = parseMonthStatus(r.noviembre);
  const dicParsed = parseMonthStatus(r.diciembre);

  let paymentStatus = "pendiente";
  if (agoParsed.status === "pagado") {
    paymentStatus = "al-dia";
  } else if (agoParsed.status === "deudor") {
    paymentStatus = "vencido";
  }

  let inst = "Piano";
  const upperNotes = (r.observaciones + " " + r.alumno).toUpperCase();
  if (upperNotes.includes("BATERIA") || upperNotes.includes("BATERÍA")) inst = "Batería";
  else if (upperNotes.includes("GUITARRA")) inst = "Guitarra";
  else if (upperNotes.includes("VIOLIN") || upperNotes.includes("VIOLÍN")) inst = "Violín";
  else if (upperNotes.includes("CANTO")) inst = "Canto";
  else if (upperNotes.includes("INFANTIL")) inst = "Piano Infantil";

  let teacher = "Fernando";
  if (inst === "Guitarra" || inst === "Batería") teacher = "Jeremy";
  else if (inst === "Canto" || inst === "Piano Infantil") teacher = "Nathaly";

  const annualRecords = {
    Enero: { month: "Enero", status: "vacio", rawText: "", amountExpected: cleanMonto, amountPaid: 0 },
    Febrero: { month: "Febrero", status: "vacio", rawText: "", amountExpected: cleanMonto, amountPaid: 0 },
    Marzo: { month: "Marzo", status: "vacio", rawText: "", amountExpected: cleanMonto, amountPaid: 0 },
    Abril: { month: "Abril", status: "vacio", rawText: "", amountExpected: cleanMonto, amountPaid: 0 },
    Mayo: { month: "Mayo", status: "vacio", rawText: "", amountExpected: cleanMonto, amountPaid: 0 },
    Junio: {
      month: "Junio",
      status: junParsed.status,
      rawText: junParsed.text,
      amountExpected: cleanMonto,
      amountPaid: junParsed.status === "pagado" ? cleanMonto : 0,
    },
    Julio: {
      month: "Julio",
      status: julParsed.status,
      rawText: julParsed.text,
      amountExpected: cleanMonto,
      amountPaid: julParsed.status === "pagado" ? cleanMonto : 0,
    },
    Agosto: {
      month: "Agosto",
      status: agoParsed.status,
      rawText: agoParsed.text,
      amountExpected: cleanMonto,
      amountPaid: agoParsed.status === "pagado" ? cleanMonto : (agoParsed.text.includes("480") ? 480 : 0),
    },
    Septiembre: {
      month: "Septiembre",
      status: sepParsed.status,
      rawText: sepParsed.text,
      amountExpected: cleanMonto,
      amountPaid: sepParsed.status === "pagado" ? cleanMonto : 0,
    },
    Octubre: {
      month: "Octubre",
      status: octParsed.status,
      rawText: octParsed.text,
      amountExpected: cleanMonto,
      amountPaid: octParsed.status === "pagado" ? cleanMonto : 0,
    },
    Noviembre: {
      month: "Noviembre",
      status: novParsed.status,
      rawText: novParsed.text,
      amountExpected: cleanMonto,
      amountPaid: novParsed.status === "pagado" ? cleanMonto : 0,
    },
    Diciembre: {
      month: "Diciembre",
      status: dicParsed.status,
      rawText: dicParsed.text,
      amountExpected: cleanMonto,
      amountPaid: dicParsed.status === "pagado" ? cleanMonto : 0,
    },
  };

  const studentObj = {
    id,
    name: r.alumno.trim(),
    family: familyName,
    instrument: inst,
    level: "Nivel 1",
    teacher,
    modality: r.observaciones.toLowerCase().includes("personalizada") ? "Regular (8 clases / 45 min)" : "Regular (8 clases / 45 min)",
    status: studentStatus,
    attendanceRate: 100,
    payment: paymentStatus,
    risk: paymentStatus === "vencido" ? 75 : 0,
    joinedAt: "Ago 2026",
    makeupCredits: 0,
    balance: paymentStatus === "vencido" ? cleanMonto : 0,
    recentAttendance: ["presente", "presente", "presente"],
    teacherNote: r.observaciones.trim() || (r.monto.includes("(") ? r.monto.trim() : "Alumno importado del Control de Pagos Oficial."),
    email: `alumno_${idx + 1}@vibramusic.pe`,
    phone: "+51 900 000 000",
    emergencyContact: {
      name: familyName,
      phone: "+51 900 000 000",
      relation: "Apoderado",
    },
    birthdate: "15 de Agosto",
    planType: cleanMonto > 350 ? "Trimestral" : "Mensual",
    planPrice: cleanMonto,
    matriculaType: "Promo Demo (S/ 30)",
    packUtilesPaid: true,
    planStartDate: `2026-08-${String(dayNum).padStart(2, "0")}`,
    planEndDate: `2026-08-31`,
    planStartMonth: "2026-08",
    planEndMonth: "2026-08",
    rawMontoText: r.monto.trim(),
    annualRecords,
  };

  tsContent += `  ${JSON.stringify(studentObj, null, 2)},\n`;

  // Factura Agosto 2026
  let invStatus = "pendiente";
  let amountPaid = 0;
  let remainingBalance = cleanMonto;
  let paymentMethod = null;
  const paymentLogs = [];

  if (agoParsed.status === "pagado") {
    invStatus = "pagado";
    amountPaid = cleanMonto;
    remainingBalance = 0;
    paymentMethod = "Yape";
    paymentLogs.push({
      id: `log-cp-${idx + 1}`,
      timestamp: "17/08/2026 10:00:00",
      registeredBy: "Secretaría (Nayeli)",
      amount: cleanMonto,
      method: "Yape",
      voucherRef: "RECIBO-AGOSTO",
      note: "Pago conciliado Agosto 2026 (Excel de Pagos)",
    });
  } else if (agoParsed.status === "deudor") {
    invStatus = "vencido";
  }

  invoicesList.push({
    id: `inv-cp-${idx + 1}`,
    family: familyName,
    concept: `Mensualidad Agosto 2026 — ${r.alumno.trim()}`,
    students: 1,
    amount: cleanMonto,
    amountPaid,
    remainingBalance,
    dueDate: `2026-08-${String(dayNum).padStart(2, "0")}`,
    daysToDue: agoParsed.status === "deudor" ? -5 : Math.max(0, dayNum - 17),
    status: invStatus,
    paymentMethod,
    remindedAt: null,
    paymentLogs,
  });
});

tsContent += `];\n\nexport const officialControlPagosInvoices: Invoice[] = ${JSON.stringify(
  invoicesList,
  null,
  2
)};\n`;

fs.writeFileSync(
  path.resolve("src/store/official-control-pagos-seeds.ts"),
  tsContent,
  "utf-8"
);
console.log("Archivo src/store/official-control-pagos-seeds.ts con Matriz Anual generado exitosamente.");
