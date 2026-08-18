import fs from "fs";
import path from "path";

const studentsData = JSON.parse(
  fs.readFileSync(path.resolve("docs/migrations/006_students_data.json"), "utf-8")
);

console.log(`Cargando ${studentsData.length} alumnos del control de pagos...`);

let tsContent = `// ===== Datos Semilla Oficiales Generados desde Control_Pagos_Estructurado.csv =====
import type { AdminStudent, Invoice, VibraPlanType, MatriculaType, PaymentMethod, PaymentStatus, InvoiceStatus } from "./admin-seeds";

export const officialControlPagosStudents: AdminStudent[] = [
`;

const invoicesList = [];

studentsData.forEach((st, idx) => {
  const id = `as-cp-${idx + 1}`;
  const familyName = `Familia ${st.name.split(',')[0] || st.name}`;
  
  let paymentStatus = "pendiente";
  if (st.dueStatusAugust === "al-dia") {
    paymentStatus = "al-dia";
  } else if (st.dueStatusAugust === "deudor") {
    paymentStatus = "vencido";
  }

  // Instrumento estimado o por notas
  let inst = "Piano";
  const upperNotes = (st.notes + " " + st.name).toUpperCase();
  if (upperNotes.includes("BATERIA") || upperNotes.includes("BATERÍA")) inst = "Batería";
  else if (upperNotes.includes("GUITARRA")) inst = "Guitarra";
  else if (upperNotes.includes("VIOLIN") || upperNotes.includes("VIOLÍN")) inst = "Violín";
  else if (upperNotes.includes("CANTO")) inst = "Canto";
  else if (upperNotes.includes("INFANTIL")) inst = "Piano Infantil";

  let teacher = "Fernando";
  if (inst === "Guitarra" || inst === "Batería") teacher = "Jeremy";
  else if (inst === "Canto" || inst === "Piano Infantil") teacher = "Nathaly";

  const studentObj = {
    id,
    name: st.name,
    family: familyName,
    instrument: inst,
    level: "Nivel 1",
    teacher,
    modality: st.notes.toLowerCase().includes("personalizada") ? "Regular (8 clases / 45 min)" : "Regular (8 clases / 45 min)",
    status: st.status,
    attendanceRate: 100,
    payment: paymentStatus,
    risk: paymentStatus === "vencido" ? 75 : 0,
    joinedAt: "Ago 2026",
    makeupCredits: 0,
    balance: paymentStatus === "vencido" ? st.monthlyFee : 0,
    recentAttendance: ["presente", "presente", "presente"],
    teacherNote: st.notes || "Alumno importado del Control de Pagos Oficial.",
    email: `alumno_${idx + 1}@vibramusic.pe`,
    phone: "+51 900 000 000",
    emergencyContact: {
      name: familyName,
      phone: "+51 900 000 000",
      relation: "Apoderado",
    },
    birthdate: "15 de Agosto",
    planType: (st.monthlyFee > 350 ? "Trimestral" : "Mensual"),
    planPrice: st.monthlyFee,
    matriculaType: "Promo Demo (S/ 30)",
    packUtilesPaid: true,
    planStartDate: `2026-08-${String(st.paymentDay).padStart(2, "0")}`,
    planEndDate: `2026-08-31`,
    planStartMonth: "2026-08",
    planEndMonth: "2026-08",
  };

  tsContent += `  ${JSON.stringify(studentObj, null, 2)},\n`;

  // Factura Agosto 2026
  let invStatus = "pendiente";
  let amountPaid = 0;
  let remainingBalance = st.monthlyFee;
  let paymentMethod = null;
  const paymentLogs = [];

  if (st.dueStatusAugust === "al-dia") {
    invStatus = "pagado";
    amountPaid = st.monthlyFee;
    remainingBalance = 0;
    paymentMethod = "Yape";
    paymentLogs.push({
      id: `log-cp-${idx + 1}`,
      timestamp: "17/08/2026 10:00:00",
      registeredBy: "Secretaría (Nayeli)",
      amount: st.monthlyFee,
      method: "Yape",
      voucherRef: "RECIBO-AGOSTO",
      note: "Pago conciliado Agosto 2026 (Excel de Pagos)",
    });
  } else if (st.dueStatusAugust === "deudor") {
    invStatus = "vencido";
  }

  invoicesList.push({
    id: `inv-cp-${idx + 1}`,
    family: familyName,
    concept: `Mensualidad Agosto 2026 — ${st.name}`,
    students: 1,
    amount: st.monthlyFee,
    amountPaid,
    remainingBalance,
    dueDate: `2026-08-${String(st.paymentDay).padStart(2, "0")}`,
    daysToDue: st.dueStatusAugust === "deudor" ? -5 : Math.max(0, st.paymentDay - 17),
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
console.log("Archivo src/store/official-control-pagos-seeds.ts generado exitosamente.");
