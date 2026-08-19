// ===== Tipos del módulo de dirección (Admin) =====

export type WeekDay = "Lun" | "Mar" | "Mié" | "Jue" | "Vie" | "Sáb";

export const weekDays: WeekDay[] = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const timeSlotsWeekday = ["16:00", "16:45", "17:30", "18:15", "19:00"];
export const timeSlotsSaturday = ["09:00", "09:45", "10:30", "11:15", "12:00"];
export const timeSlots = ["16:00", "16:45", "17:30", "18:15", "19:00"];
export const rooms = ["Sala A", "Sala B", "Sala C", "Sala D"];
export const teachers: string[] = [
  "Jeremy",
  "Fernando",
  "Nathaly",
  "Demo",
];
export const availableTeachers = teachers;
export const musicalInstruments = [
  "Batería",
  "Canto",
  "Guitarra",
  "Piano",
  "Piano Infantil",
  "Violín",
];

export type AgeCategory = "JUNIOR" | "JUVENIL" | "ADULTO" | "INFANTIL" | "RECUPERACION" | "PERSONALIZADA";

export function getCategoryFromAge(age: number): AgeCategory {
  if (age >= 5 && age <= 6) return "INFANTIL";
  if (age >= 7 && age <= 12) return "JUNIOR";
  if (age >= 13 && age <= 17) return "JUVENIL";
  if (age >= 18) return "ADULTO";
  return "JUNIOR";
}

// ===== Planes Oficiales (Dossier Comunidad Vibra) =====
export type VibraPlanType = "Mensual" | "Trimestral" | "Anual";
export type MatriculaType = "Regular (S/ 120)" | "Promo Demo (S/ 30)" | "Exonerada";

export const VIBRA_PRICING = {
  Mensual: {
    name: "Mensual (Regular)",
    priceMonthly: 329.0,
    discountPct: 0,
    totalMonths: 1,
    description: "Tarifa Regular · 8 clases / mes (2x semana)",
  },
  Trimestral: {
    name: "Trimestral (12% Dcto.)",
    priceMonthly: 289.4,
    discountPct: 12,
    totalMonths: 3,
    description: "S/ 289.40 / mes (Total S/ 868.20 por 3 meses)",
  },
  Anual: {
    name: "Anual (20% Dcto.)",
    priceMonthly: 263.2,
    discountPct: 20,
    totalMonths: 12,
    description: "S/ 263.20 / mes (Total S/ 3,158.40 por 12 meses)",
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
  category?: AgeCategory;
  sessionNumber?: 1 | 2; // 1ra Clase o 2da Clase de la semana
  weekIndex?: number; // 0, 1, 2, 3 (semana específica) o undefined si aplica a todo el mes
  year?: number; // Año de vigencia (ej: 2026)
  month?: number; // Mes de vigencia 0 a 11 (ej: 7 para Agosto)
  attendanceStatus?: "presente" | "ausente" | "tarde" | "justificada";
  attendanceByWeek?: Record<number, "presente" | "ausente" | "tarde" | "justificada">;
  excludedWeeks?: number[];
  isMakeup?: boolean;
  recoveringLessonDate?: string;
};

export type StudentStatus = "activo" | "pausa" | "baja";
export type PaymentStatus = "al-dia" | "pendiente" | "vencido";
export type LessonModality = "Regular (8 clases / 45 min)" | "Intensivo (4 clases / 90 min)";

export type EmergencyContact = {
  name: string;
  phone: string;
  relation: string;
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
  instrument: string;
  level: string;
  teacher: string;
  modality: LessonModality;
  ageCategory?: AgeCategory;
  age?: number;
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
  emergencyContact: EmergencyContact;
  birthdate: string;
  // Campos del Dossier con control exacto día por día
  planType?: VibraPlanType;
  planPrice?: number;
  matriculaType?: MatriculaType;
  packUtilesPaid?: boolean;
  planStartDate?: string; // "2026-08-03" (Día exacto de inicio)
  planEndDate?: string; // "2026-08-31" (Día exacto de fin de ciclo)
  planStartMonth?: string; // "2026-08"
  planEndMonth?: string; // "2026-08"
  // Matriz Anual de Pagos (Reemplazo definitivo de Excel Ene-Dic)
  annualRecords?: Record<string, AnnualMonthRecord>;
  rawMontoText?: string;
  // Historial de Reingreso y Seguimiento
  isReentry?: boolean;
  reentryHistory?: Array<{ date: string; reason: string; notes?: string }>;
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
  concept: string;
  students: number;
  amount: number; // Precio total inmutable
  amountPaid: number; // Monto abonado hasta el momento
  remainingBalance: number; // Saldo pendiente
  dueDate: string;
  daysToDue: number; // Alerta a los 2 días de vencer
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod | null;
  remindedAt: string | null;
  paymentLogs: PaymentLog[];
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

// ===== Datos de Producción Oficiales (Alumnos y Horarios desde CSV con vigencia Agosto 2026) =====

export const initialSchedule: ScheduledLesson[] = officialSchedule.map((l) => ({
  ...l,
  year: 2026,
  month: 7, // Agosto (0-indexed)
}));

// Lista oficial de 99 alumnos extraída directamente del Control de Pagos de Vibra Music
export const adminStudents: AdminStudent[] = officialControlPagosStudents;

// Lista oficial de 99 facturas y estados de pago reales de Agosto 2026
export const initialInvoices: Invoice[] = officialControlPagosInvoices;

export const recurringConcepts: RecurringConcept[] = [
  { id: "rc1", label: "Plan Mensual Regular", detail: "8 clases de 45 min (2x semana)", amount: 329, families: 48 },
  { id: "rc2", label: "Plan Trimestral (12% Dcto.)", detail: "S/ 289.40/mes (3 meses)", amount: 289.4, families: 22 },
  { id: "rc3", label: "Plan Anual (20% Dcto.)", detail: "S/ 263.20/mes (12 meses)", amount: 263.2, families: 10 },
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

