// ===== Tipos del módulo de dirección (Admin) =====

export type WeekDay = "Lun" | "Mar" | "Mié" | "Jue" | "Vie" | "Sáb";

export const weekDays: WeekDay[] = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const timeSlotsWeekday = ["16:00", "16:45", "17:30", "18:15", "19:00"];
export const timeSlotsSaturday = ["09:00", "09:45", "10:30", "11:15", "12:00", "12:45"];
export const timeSlots = ["16:00", "16:45", "17:30", "18:15", "19:00"];
export const rooms = ["Sala A", "Sala B", "Sala C", "Sala D"];
export const teachers: string[] = [
  "Jeremy",
  "Fernando",
  "Nathaly",
  "Claudia",
  "Demo",
];
export const availableTeachers = teachers;
export const defaultTeacherRooms: Array<{ name: string; room: string; instrumentHint: string }> = [
  { name: "Jeremy", room: "Sala A", instrumentHint: "Guitarra y Batería" },
  { name: "Fernando", room: "Sala B", instrumentHint: "Violín y Piano" },
  { name: "Nathaly", room: "Sala C", instrumentHint: "Canto y Piano Infantil" },
  { name: "Claudia", room: "Sala D", instrumentHint: "Estimulación Musical y Demos Principiantes" },
  { name: "Demo", room: "Sala D", instrumentHint: "Demos y Proyección" },
];

export const musicalInstruments = [
  "Batería",
  "Canto",
  "Estimulación Musical",
  "Guitarra",
  "Piano",
  "Piano Infantil",
  "Violín",
];

export type AgeCategory = "ESTIMULACION" | "INFANTIL" | "JUNIOR" | "JUVENIL" | "MASTER" | "ADULTO" | "RECUPERACION" | "PERSONALIZADA";

export function getCategoryFromAge(age: number): AgeCategory {
  if (age >= 18) return "MASTER";
  if (age >= 13) return "JUVENIL";
  if (age >= 7) return "JUNIOR";
  if (age >= 5) return "INFANTIL";
  if (age >= 4) return "ESTIMULACION";
  return "JUNIOR";
}

// ===== Planes Oficiales (Dossier Comunidad Vibra) =====
export type VibraPlanType = "Mensual" | "Trimestral" | "Anual" | "Demo Nivelación" | "Paquete Flexible" | "Paquete Especial";
export type MatriculaType = "Regular (S/ 120)" | "Promo Demo (S/ 30)" | "Exonerada";

export const VIBRA_PRICING = {
  Mensual: {
    name: "Mensual (Regular)",
    priceMonthly: 297.0,
    discountPct: 0,
    totalMonths: 1,
    totalPlan: 297.0,
    description: "S/ 297.00 / mes (Tarifa Regular · 8 clases / mes)",
  },
  Trimestral: {
    name: "Trimestral (12% Dcto.)",
    priceMonthly: 261.4,
    discountPct: 12,
    totalMonths: 3,
    totalPlan: 784.08,
    description: "S/ 261.40 / mes (Tarifa Trimestral)",
  },
  Anual: {
    name: "Anual (20% Dcto.)",
    priceMonthly: 237.6,
    discountPct: 20,
    totalMonths: 12,
    totalPlan: 2851.2,
    description: "S/ 237.60 / mes (Tarifa Anual)",
  },
  "Demo Nivelación": {
    name: "Demo Nivelación (Personalizada)",
    priceMonthly: 0.0,
    discountPct: 0,
    totalMonths: 1,
    totalPlan: 0.0,
    description: "Clase de nivelación personalizada (1 alumno · 45 min con especialista · Tarifa abierta)",
  },
  "Paquete Flexible": {
    name: "Paquete Flexible (A Demanda)",
    priceMonthly: 500.0,
    discountPct: 0,
    totalMonths: 0,
    totalPlan: 500.0,
    description: "Tarifa personalizada (Vigencia por clases terminadas)",
  },
  "Paquete Especial": {
    name: "Paquete Flexible (A Demanda)",
    priceMonthly: 500.0,
    discountPct: 0,
    totalMonths: 0,
    totalPlan: 500.0,
    description: "Tarifa personalizada (Vigencia por clases terminadas)",
  },
  MatriculaRegular: 120.0,
  MatriculaPromoDemo: 30.0, // 75% descuento
  PackUtilesAnual: 67.0, // Método Vibra, Practikid, Partituras
};

export type ScheduledLesson = {
  id: string;
  day: WeekDay;
  time: string;
  student: string;
  instrument: string;
  teacher: string;
  room: string;
  status: "programada" | "cancelada";
  // Todas las claves opcionales pueden llegar EXPLÍCITAMENTE `undefined`
  // desde el JSONB `scheduleLessons` (no están en todas las filas). Declararlo
  // evita tener que ocultarlo con un cast en cada constructor de lección.
  category?: AgeCategory | undefined;
  sessionNumber?: 1 | 2 | undefined; // 1ra Clase o 2da Clase de la semana
  weekIndex?: number | undefined; // 0, 1, 2, 3 o undefined si aplica a todo el mes
  year?: number | undefined; // Año de vigencia (ej: 2026)
  month?: number | undefined; // Mes de vigencia 0 a 11 (ej: 7 para Agosto)
  attendanceStatus?: "presente" | "ausente" | "tarde" | "justificada" | undefined;
  attendanceByWeek?: Record<number, "presente" | "ausente" | "tarde" | "justificada"> | undefined;
  attendanceByDate?: Record<string, "presente" | "ausente" | "tarde" | "justificada"> | undefined;
  excludedWeeks?: number[] | undefined;
  isMakeup?: boolean | undefined;
  recoveringLessonDate?: string | undefined;
  dateStr?: string | undefined; // Fecha exacta YYYY-MM-DD si es una sesión única o reprogramada
  excludedDates?: string[] | undefined; // Fechas específicas YYYY-MM-DD excluidas
  effectiveUntil?: string | undefined; // Fecha límite YYYY-MM-DD de vigencia
  effectiveFrom?: string | undefined; // Fecha de inicio YYYY-MM-DD de vigencia
};

export type StudentStatus = "activo" | "pausa" | "baja";
export type PaymentStatus = "al-dia" | "pendiente" | "vencido";
export type LessonModality =
  | "Regular (8 clases / 45 min)"
  | "Regular 1x/sem (8 clases / 45 min)"
  | "Intensivo (4 clases / 90 min)"
  | "Demo Nivelación (1 Alumno · 45 min)"
  | "Paquete Flexible (A demanda)"
  | "Irregular (Clases a demanda / Paquete flexible)";

export const HISTORICAL_BASE_METADATA = {
  name: "Base Histórica Inicial Vibra Music",
  createdAt: "2026-08-15",
  totalRecords: 83,
};

/**
 * Contrato real del JSONB `students.emergency_contact`.
 *
 * Es la superficie de persistencia documentada para todo lo que no tiene
 * columna propia (ADR-0188/0190/0191/0194): metadatos de matrícula, pack de
 * útiles, horario (`scheduleLessons`), vigencias, categoría de edad y el
 * vínculo de misma persona entre instrumentos (ADR-0186).
 *
 * Antes estaba tipado solo con `name/phone/relation`, así que cada servicio
 * tenía que leerlo como `Record<string, any>` y perdía el chequeo de tipos en
 * más de 200 accesos. Este tipo es la fuente única para leerlo y escribirlo.
 */
export type EmergencyContact = {
  name: string;
  phone: string;
  relation: string;
  // ── Contacto y datos del alumno ──
  email?: string | undefined;
  family?: string | undefined;
  teacher?: string | undefined;
  birthdate?: string | undefined;
  notes?: string | undefined;
  /** Nota pedagógica histórica escrita en la ficha (columna legacy congelada). */
  teacherNote?: string | undefined;
  /** El JSONB puede traerlo como número o como texto ("7"). */
  age?: number | string | undefined;
  ageCategory?: AgeCategory | undefined;
  fatherName?: string | undefined;
  fatherPhone?: string | undefined;
  motherName?: string | undefined;
  motherPhone?: string | undefined;
  // ── Plan contratado y cobros ──
  planType?: VibraPlanType | undefined;
  planPrice?: number | undefined;
  amountPaid?: number | undefined;
  balance?: number | undefined;
  packageTotalSessions?: number | undefined;
  modality?: LessonModality | undefined;
  matriculaType?: MatriculaType | undefined;
  enrollmentDate?: string | undefined;
  paymentMethod?: string | undefined;
  // ── Pack de útiles / libros ──
  packUtilesPaid?: boolean | undefined;
  packUtilesCost?: number | undefined;
  packUtilesAmountPaid?: number | undefined;
  packUtilesStatus?: "cancelado" | "parcial" | "pendiente" | "exonerado" | undefined;
  packUtilesDelivered?: boolean | undefined;
  packUtilesNotes?: string | undefined;
  // ── Vigencia contractual ──
  planStartDate?: string | undefined;
  planEndDate?: string | undefined;
  planStartMonth?: string | undefined;
  planEndMonth?: string | undefined;
  // ── Asistencia ──
  attendanceRate?: number | undefined;
  recentAttendance?: ("presente" | "ausente" | "tarde" | "justificada")[] | undefined;
  // ── Horario persistido (ADR-0118.4) ──
  scheduleLessons?: ScheduledLesson[] | undefined;
  // ── Saldo a favor de la familia (ADR-0190 §6 / ADR-0191) ──
  creditBalance?: number | undefined;
  creditNote?: string | undefined;
  creditSetAt?: string | undefined;
  // ── ADR-0186 — Vínculo de misma persona con varios instrumentos ──
  personGroupId?: string | undefined;
  personGroupLabel?: string | undefined;
  // ── ADR-0188 §10 — Metadatos de la matrícula institucional (JSONB, sin DDL).
  // La matrícula se paga UNA vez por familia; el libro sí es por instrumento.
  matriculaScope?: "familia" | "instrumento" | undefined;
  matriculaAmountPaid?: number | undefined;
  matriculaFamilyNote?: string | undefined;
  // ── ADR-0194 — Modo "Plan Regular Compartido (4+4)" entre 2 instrumentos.
  // Vive SOLO en el JSONB `emergency_contact` (sin DDL). Se lee de vuelta en
  // `mapDBStudentToAdminStudent`; sin esa lectura el marcador se perdía al
  // recargar la página y el formulario dependía únicamente de
  // `packageTotalSessions === 4`.
  sharedPlanType?: string | undefined;
};

export type AnnualMonthRecord = {
  month: string;
  status: "pagado" | "deudor" | "parcial" | "pendiente" | "personalizado" | "vacio";
  rawText: string;
  amountExpected: number;
  amountPaid: number;
};

export type AdminStudent = {
  id: string;
  name: string;
  family: string;
  familyId?: string | undefined; // UUID de families en PostgreSQL (vínculo exacto invitación-padre-hijos, Fase 1 modo padre)
  instrument: string;
  level: string;
  teacher: string;
  modality: LessonModality;
  ageCategory?: AgeCategory | undefined;
  age?: number | undefined;
  status: StudentStatus;
  attendanceRate: number;
  payment: PaymentStatus;
  risk: number; // 0-100, mayor = más riesgo de baja
  joinedAt: string;
  makeupCredits: number;
  balance: number;
  recentAttendance: ("presente" | "ausente" | "tarde" | "justificada")[];
  teacherNote: string;
  email: string;
  phone: string;
  // Datos completos de Padres y Contacto de Emergencia
  fatherName?: string | undefined;
  fatherPhone?: string | undefined;
  motherName?: string | undefined;
  motherPhone?: string | undefined;
  emergencyContact: EmergencyContact;
  birthdate: string;
  // Campos del Dossier con control exacto día por día
  planType?: VibraPlanType | undefined;
  planPrice?: number | undefined;
  amountPaid?: number | undefined; // Monto abonado al momento de la matrícula
  paymentMethod?: ("Yape / Plin" | "Tarjeta de Débito" | "Tarjeta de Crédito" | "Efectivo" | "Transferencia Bancaria" | string) | undefined;
  enrollmentDate?: string | undefined; // Fecha de matrícula / pago (YYYY-MM-DD)
  packageTotalSessions?: number | undefined; // Total de clases del paquete (ej. 24 para Jonathan, 8 para regular)
  matriculaType?: MatriculaType | undefined;
  // Pack de Útiles / Libro (S/ 67)
  packUtilesPaid?: boolean | undefined; // legacy compatibility
  packUtilesCost?: number | undefined; // Costo base (S/ 67 por defecto)
  packUtilesAmountPaid?: number | undefined; // Monto efectivamente abonado (ej. S/ 30 o S/ 67)
  packUtilesStatus?: ("cancelado" | "parcial" | "pendiente" | "exonerado") | undefined;
  packUtilesDelivered?: boolean | undefined; // Entregado físicamente
  packUtilesNotes?: string | undefined; // Notas de prorrateo (ej. "Pagó S/ 30, saldo S/ 37 la próxima clase")
  planStartDate?: string | undefined; // "2026-08-03" (Día exacto de primera clase)
  planEndDate?: string | undefined; // "2026-08-31" (Día exacto de fin de ciclo)
  planStartMonth?: string | undefined; // "2026-08"
  planEndMonth?: string | undefined; // "2026-08"
  // Matriz Anual de Pagos (Reemplazo definitivo de Excel Ene-Dic)
  annualRecords?: Record<string, AnnualMonthRecord> | undefined;
  rawMontoText?: string;
  // Historial de Reingreso y Seguimiento
  isReentry?: boolean;
  reentryHistory?: Array<{ date: string; reason: string; notes?: string }>;
  // Horario persistido desde PostgreSQL (emergency_contact.scheduleLessons)
  scheduleLessons?: ScheduledLesson[] | undefined;
  // ADR-0186 — Vínculo de misma persona con varios instrumentos.
  // Los registros de un mismo alumno con 2+ instrumentos comparten este UUID.
  // NO fusiona las matrículas: solo indica que son la misma persona.
  personGroupId?: string;
  personGroupLabel?: string;
  // Sala oficial asignada (ADR-0102: A=Jeremy, B=Fernando, C=Nathaly, D=Claudia).
  room?: string | undefined;
  // Categoría de edad efectiva usada en el Dossier de auditoría (ADR-0121).
  category?: AgeCategory | undefined;
  // Marca de última sincronización con PostgreSQL (invalida cachés de ciclo, ADR-0119).
  updatedAt?: string | undefined;
  // ADR-0129 — Transición de curso/instrumento con fecha de corte.
  courseTransition?: {
    originalInstrument?: string;
    newInstrument?: string;
    cutOffDate?: string;
    effectiveDate?: string;
  } | undefined;
  // Recibos atribuidos a ESTA matrícula (ADR-0190 — jamás al homónimo).
  invoices?: Invoice[] | undefined;
};

export type DeletionReasonCategory =
  | "falta_pago"
  | "error_registro"
  | "prueba_sistema"
  | "retiro_voluntario"
  | "otro";

export type DeletedStudentLog = {
  id: string;
  studentId: string;
  studentName: string;
  family: string;
  instrument: string;
  teacher: string;
  deletedBy: string;
  deletedAt: string; // ISO string
  reasonCategory: DeletionReasonCategory;
  reasonText: string;
  studentSnapshot: AdminStudent;
};

export type InvoiceStatus = "pagado" | "parcial" | "pendiente" | "vencido";
export type PaymentMethod = "Yape" | "Plin" | "Transferencia" | "Efectivo";

export type PaymentLog = {
  id: string;
  timestamp: string;
  registeredBy: string; // ej: "Secretaría (Staff)" o "Dueña"
  amount: number;
  method: PaymentMethod;
  voucherRef?: string; // N° de Operación / Código Yape
  voucherImage?: string; // Captura / foto del voucher en DataURL base64
  paymentTime?: string; // Hora indicada en el comprobante
  note?: string;
};

export type Invoice = {
  id: string;
  family: string;
  // ADR-0190 — UUID de `families` en PostgreSQL. Necesario para atribuir un
  // recibo a UNA matrícula cuando dos alumnos comparten exactamente el mismo
  // nombre (caso Luciana: 2 registros "Luciana"). Opcional por compatibilidad.
  familyId?: string | undefined;
  concept: string;
  students?: number; // Nº de alumnos facturados en este recibo
  amount: number; // Precio total inmutable
  amountPaid: number; // Monto abonado hasta el momento
  remainingBalance: number; // Saldo pendiente
  dueDate: string;
  daysToDue?: number; // Alerta a los 2 días de vencer
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod | null;
  remindedAt?: string | null | undefined;
  paymentLogs?: PaymentLog[];
  // Nombre del alumno al que pertenece el recibo (atribución exacta, ADR-0190).
  student?: string;
  // Teléfono de contacto del apoderado (dato operativo del recibo).
  phone?: string;
  // Fecha de emisión del comprobante.
  issueDate?: string | undefined;
  // Detalle de conceptos del recibo (jsonb `items` en PostgreSQL).
  items?: Array<Record<string, unknown>> | undefined;
  // Notas del recibo (observaciones de secretaría).
  notes?: string;
};

export type RecurringConcept = {
  id: string;
  label: string;
  detail: string;
  amount: number;
  families: number;
};

import { officialAdminStudents, officialSchedule } from "./official-seeds";
import { officialControlPagosStudents, officialControlPagosInvoices } from "./official-control-pagos-seeds";
import { isMatchingStudentName } from "@/lib/student-matching";

// ===== Datos de Producción Oficiales (Alumnos y Horarios desde CSV con vigencia Agosto 2026) =====

export const initialSchedule: ScheduledLesson[] = officialSchedule.map((l) => ({
  ...l,
  year: l.year ?? 2026,
  month: l.month, // Preservar undefined si es clase recurrente semanal para que aplique a todos los meses
}));

// Lista oficial de alumnos extraída del Control de Pagos y Horario de Vibra Music
// Depuración 2026: Todos los alumnos históricos inician en "pausa" para permitir
// su reactivación y regularización de asistencia 1 a 1 de forma segura y controlada.
const baseControlStudents: AdminStudent[] = officialControlPagosStudents.map((st) => ({
  ...st,
  status: "pausa",
  recentAttendance: [],
  attendanceRate: 0,
}));

// Alumnos complementarios presentes en el horario oficial o registro administrativo
const missingAdminStudents = officialAdminStudents
  .filter((oSt) => !baseControlStudents.some((bSt) => isMatchingStudentName(bSt.name, oSt.name)))
  .map((st) => ({
    ...st,
    status: "pausa",
    recentAttendance: [],
    attendanceRate: 0,
  }));

const combinedNames = [...baseControlStudents, ...missingAdminStudents];
const missingScheduleStudents: AdminStudent[] = [];

officialSchedule.forEach((sch) => {
  if (!sch.student || sch.student.startsWith("Slot") || sch.student === "Piano" || sch.student === "Piano Juvenil") return;
  const exists =
    combinedNames.some((st) => isMatchingStudentName(st.name, sch.student)) ||
    missingScheduleStudents.some((st) => isMatchingStudentName(st.name, sch.student));
  if (!exists) {
    missingScheduleStudents.push({
      id: `as-sch-${missingScheduleStudents.length + 1}`,
      name: sch.student,
      family: `Familia ${sch.student.split(" ").slice(-1)[0] || sch.student}`,
      instrument: sch.instrument || "Música",
      level: "Nivel 1",
      teacher: sch.teacher,
      modality: "Regular (8 clases / 45 min)",
      status: "pausa",
      ageCategory: sch.category || "JUNIOR",
      age: 10,
      attendanceRate: 0,
      payment: "al-dia",
      risk: 10,
      joinedAt: "Ago 2026",
      makeupCredits: 0,
      balance: 297,
      recentAttendance: [],
      teacherNote: "Horario activo",
      email: `alumno_${sch.student.toLowerCase().replace(/[^a-z0-9]/g, "")}@vibramusic.pe`,
      phone: "999999999",
      planType: "Mensual",
      planPrice: 297,
      matriculaType: "Promo Demo (S/ 30)",
      packUtilesPaid: true,
      planStartDate: "2026-08-01",
      planEndDate: "2026-08-31",
      planStartMonth: "2026-08",
      planEndMonth: "2026-08",
    });
  }
});

// Base inicial desacoplada: Se inicializa vacía para operar exclusivamente con datos reales de PostgreSQL.
// Los 142 registros históricos fueron respaldados y exportados a archivo_historico_base_antigua_alumnos_vibra_music.csv.
export const adminStudents: AdminStudent[] = [];


// Lista de recibos oficiales sincronizados desde PostgreSQL para alumnos activos
export const initialInvoices: Invoice[] = [];

export const recurringConcepts: RecurringConcept[] = [
  { id: "rc1", label: "Plan Mensual Regular", detail: "8 clases de 45 min (2x semana)", amount: 297.0, families: 48 },
  { id: "rc2", label: "Plan Trimestral (12% Dcto.)", detail: "S/ 261.40/mes (3 meses)", amount: 261.4, families: 22 },
  { id: "rc3", label: "Plan Anual (20% Dcto.)", detail: "S/ 237.60/mes (12 meses)", amount: 237.6, families: 10 },
  { id: "rc4", label: "Matrícula Promo Demostrativa", detail: "75% Descuento pago único", amount: 30, families: 80 },
  { id: "rc5", label: "Pack de Útiles Anual", detail: "Método Vibra, Practikid y Partituras", amount: 67, families: 80 },
];

// Facturación de los últimos meses para la mini gráfica.
export const billingTrend = [
  { month: "Abr", billed: 21500, collected: 20800 },
  { month: "May", billed: 23200, collected: 22400 },
  { month: "Jun", billed: 24800, collected: 23900 },
  { month: "Jul", billed: 25100, collected: 24200 },
  { month: "Ago", billed: 26320, collected: 23800 },
];

