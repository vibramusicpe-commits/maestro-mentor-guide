// ===== Tipos del módulo de dirección (Admin) =====

export type WeekDay = "Lun" | "Mar" | "Mié" | "Jue" | "Vie" | "Sáb";

export const weekDays: WeekDay[] = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const timeSlots = ["15:00", "15:45", "16:30", "17:15", "18:00", "18:45"];
export const rooms = ["Sala 1", "Sala 2", "Sala 3", "Sala 4", "Sala 5"];
export const teachers = [
  "Prof. Elena Márquez",
  "Prof. Daniel Ocampo",
  "Prof. Nadia Ruiz",
  "Prof. Bruno Sáenz",
];

export type ScheduledLesson = {
  id: string;
  day: WeekDay;
  time: string;
  student: string;
  instrument: string;
  teacher: string;
  room: string;
  status: "programada" | "cancelada";
};

export type StudentStatus = "activo" | "pausa" | "baja";
export type PaymentStatus = "al-dia" | "pendiente" | "vencido";

export type AdminStudent = {
  id: string;
  name: string;
  family: string;
  instrument: string;
  level: string;
  teacher: string;
  status: StudentStatus;
  attendanceRate: number;
  payment: PaymentStatus;
  risk: number; // 0-100, mayor = más riesgo de baja
  joinedAt: string;
  makeupCredits: number;
  balance: number;
  recentAttendance: ("presente" | "ausente" | "tarde")[];
  teacherNote: string;
};

export type InvoiceStatus = "pagado" | "pendiente" | "vencido";

export type Invoice = {
  id: string;
  family: string;
  concept: string;
  students: number;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  remindedAt: string | null;
};

export type RecurringConcept = {
  id: string;
  label: string;
  detail: string;
  amount: number;
  families: number;
};

// ===== Datos simulados =====

export const initialSchedule: ScheduledLesson[] = [
  { id: "sc1", day: "Lun", time: "15:00", student: "Camila Ferrer", instrument: "Canto", teacher: "Prof. Nadia Ruiz", room: "Sala 4", status: "programada" },
  { id: "sc2", day: "Lun", time: "16:30", student: "Tomás Aguirre", instrument: "Guitarra eléctrica", teacher: "Prof. Bruno Sáenz", room: "Sala 5", status: "programada" },
  { id: "sc3", day: "Lun", time: "17:15", student: "Sofía Rivas", instrument: "Piano", teacher: "Prof. Daniel Ocampo", room: "Sala 1", status: "programada" },
  { id: "sc4", day: "Mar", time: "15:45", student: "Luana Prado", instrument: "Violín", teacher: "Prof. Elena Márquez", room: "Sala 2", status: "programada" },
  { id: "sc5", day: "Mar", time: "17:15", student: "Iker Solano", instrument: "Batería", teacher: "Prof. Bruno Sáenz", room: "Sala 5", status: "programada" },
  { id: "sc6", day: "Mié", time: "15:00", student: "Mateo Rivas", instrument: "Guitarra clásica", teacher: "Prof. Elena Márquez", room: "Sala 3", status: "programada" },
  { id: "sc7", day: "Mié", time: "15:00", student: "Valeria Núñez", instrument: "Piano", teacher: "Prof. Elena Márquez", room: "Sala 1", status: "programada" },
  { id: "sc8", day: "Mié", time: "18:00", student: "Camila Ferrer", instrument: "Canto", teacher: "Prof. Nadia Ruiz", room: "Sala 4", status: "programada" },
  { id: "sc9", day: "Jue", time: "16:30", student: "Mateo Rivas", instrument: "Guitarra clásica", teacher: "Prof. Elena Márquez", room: "Sala 3", status: "programada" },
  { id: "sc10", day: "Jue", time: "16:30", student: "Sofía Rivas", instrument: "Piano", teacher: "Prof. Daniel Ocampo", room: "Sala 1", status: "programada" },
  { id: "sc11", day: "Jue", time: "17:15", student: "Luana Prado", instrument: "Violín", teacher: "Prof. Elena Márquez", room: "Sala 2", status: "programada" },
  { id: "sc12", day: "Jue", time: "18:00", student: "Iker Solano", instrument: "Batería", teacher: "Prof. Bruno Sáenz", room: "Sala 5", status: "programada" },
  { id: "sc13", day: "Vie", time: "15:00", student: "Camila Ferrer", instrument: "Canto", teacher: "Prof. Nadia Ruiz", room: "Sala 4", status: "programada" },
  { id: "sc14", day: "Vie", time: "17:15", student: "Tomás Aguirre", instrument: "Guitarra eléctrica", teacher: "Prof. Bruno Sáenz", room: "Sala 5", status: "programada" },
  { id: "sc15", day: "Vie", time: "18:45", student: "Valeria Núñez", instrument: "Piano", teacher: "Prof. Daniel Ocampo", room: "Sala 1", status: "programada" },
  { id: "sc16", day: "Sáb", time: "15:45", student: "Mateo Rivas", instrument: "Guitarra clásica", teacher: "Prof. Elena Márquez", room: "Sala 3", status: "programada" },
  { id: "sc17", day: "Sáb", time: "15:45", student: "Luana Prado", instrument: "Violín", teacher: "Prof. Elena Márquez", room: "Sala 3", status: "programada" },
  { id: "sc18", day: "Sáb", time: "16:30", student: "Sofía Rivas", instrument: "Piano", teacher: "Prof. Daniel Ocampo", room: "Sala 1", status: "programada" },
];

export const adminStudents: AdminStudent[] = [
  {
    id: "as1",
    name: "Mateo Rivas",
    family: "Familia Rivas",
    instrument: "Guitarra clásica",
    level: "Nivel 2",
    teacher: "Prof. Elena Márquez",
    status: "activo",
    attendanceRate: 96,
    payment: "pendiente",
    risk: 18,
    joinedAt: "Mar 2024",
    makeupCredits: 2,
    balance: 203,
    recentAttendance: ["presente", "presente", "tarde", "presente", "presente"],
    teacherNote: "Avanza muy bien con arpegios. Listo para repertorio nivel 3.",
  },
  {
    id: "as2",
    name: "Sofía Rivas",
    family: "Familia Rivas",
    instrument: "Piano",
    level: "Nivel 1",
    teacher: "Prof. Daniel Ocampo",
    status: "activo",
    attendanceRate: 88,
    payment: "pendiente",
    risk: 26,
    joinedAt: "Ago 2024",
    makeupCredits: 1,
    balance: 203,
    recentAttendance: ["presente", "ausente", "presente", "presente", "tarde"],
    teacherNote: "Necesita reforzar lectura rítmica en casa.",
  },
  {
    id: "as3",
    name: "Luana Prado",
    family: "Familia Prado",
    instrument: "Violín",
    level: "Nivel 3",
    teacher: "Prof. Elena Márquez",
    status: "activo",
    attendanceRate: 74,
    payment: "vencido",
    risk: 72,
    joinedAt: "Ene 2023",
    makeupCredits: 3,
    balance: 145,
    recentAttendance: ["ausente", "ausente", "presente", "tarde", "presente"],
    teacherNote: "Tres faltas seguidas el mes pasado. Conviene llamar a la familia.",
  },
  {
    id: "as4",
    name: "Iker Solano",
    family: "Familia Solano",
    instrument: "Batería",
    level: "Nivel 2",
    teacher: "Prof. Bruno Sáenz",
    status: "activo",
    attendanceRate: 91,
    payment: "al-dia",
    risk: 12,
    joinedAt: "Jun 2024",
    makeupCredits: 0,
    balance: 0,
    recentAttendance: ["presente", "presente", "presente", "ausente", "presente"],
    teacherNote: "Muy constante. Interesado en la banda de la academia.",
  },
  {
    id: "as5",
    name: "Camila Ferrer",
    family: "Familia Ferrer",
    instrument: "Canto",
    level: "Nivel 4",
    teacher: "Prof. Nadia Ruiz",
    status: "activo",
    attendanceRate: 99,
    payment: "al-dia",
    risk: 5,
    joinedAt: "Feb 2022",
    makeupCredits: 1,
    balance: 0,
    recentAttendance: ["presente", "presente", "presente", "presente", "presente"],
    teacherNote: "Preparando audición de fin de ciclo.",
  },
  {
    id: "as6",
    name: "Tomás Aguirre",
    family: "Familia Aguirre",
    instrument: "Guitarra eléctrica",
    level: "Nivel 1",
    teacher: "Prof. Bruno Sáenz",
    status: "pausa",
    attendanceRate: 63,
    payment: "vencido",
    risk: 84,
    joinedAt: "Abr 2025",
    makeupCredits: 4,
    balance: 260,
    recentAttendance: ["ausente", "ausente", "ausente", "presente", "ausente"],
    teacherNote: "Pausa por viaje familiar. Riesgo alto de no volver.",
  },
  {
    id: "as7",
    name: "Valeria Núñez",
    family: "Familia Núñez",
    instrument: "Piano",
    level: "Nivel 2",
    teacher: "Prof. Daniel Ocampo",
    status: "activo",
    attendanceRate: 82,
    payment: "pendiente",
    risk: 34,
    joinedAt: "Sep 2024",
    makeupCredits: 1,
    balance: 90,
    recentAttendance: ["presente", "tarde", "presente", "ausente", "presente"],
    teacherNote: "Buena técnica, poca práctica en casa.",
  },
  {
    id: "as8",
    name: "Joaquín Vera",
    family: "Familia Vera",
    instrument: "Violín",
    level: "Nivel 1",
    teacher: "Prof. Elena Márquez",
    status: "baja",
    attendanceRate: 41,
    payment: "vencido",
    risk: 95,
    joinedAt: "Nov 2024",
    makeupCredits: 0,
    balance: 180,
    recentAttendance: ["ausente", "ausente", "ausente", "ausente", "ausente"],
    teacherNote: "Baja solicitada en julio. Queda saldo por cobrar.",
  },
];

export const initialInvoices: Invoice[] = [
  { id: "inv1", family: "Familia Rivas", concept: "Plan mensual · agosto", students: 2, amount: 203, dueDate: "20 ago", status: "pendiente", remindedAt: null },
  { id: "inv2", family: "Familia Prado", concept: "Plan mensual · agosto", students: 1, amount: 145, dueDate: "5 ago", status: "vencido", remindedAt: null },
  { id: "inv3", family: "Familia Solano", concept: "Plan mensual · agosto", students: 1, amount: 120, dueDate: "10 ago", status: "pagado", remindedAt: null },
  { id: "inv4", family: "Familia Ferrer", concept: "Plan mensual + canto extra", students: 1, amount: 168, dueDate: "10 ago", status: "pagado", remindedAt: null },
  { id: "inv5", family: "Familia Aguirre", concept: "Plan mensual · julio y agosto", students: 1, amount: 260, dueDate: "1 ago", status: "vencido", remindedAt: null },
  { id: "inv6", family: "Familia Núñez", concept: "Plan mensual · agosto", students: 1, amount: 90, dueDate: "25 ago", status: "pendiente", remindedAt: null },
  { id: "inv7", family: "Familia Vera", concept: "Saldo pendiente de baja", students: 1, amount: 180, dueDate: "15 jul", status: "vencido", remindedAt: null },
  { id: "inv8", family: "Familia Castro", concept: "Plan mensual · agosto", students: 2, amount: 210, dueDate: "20 ago", status: "pagado", remindedAt: null },
];

export const recurringConcepts: RecurringConcept[] = [
  { id: "rc1", label: "Plan mensual individual", detail: "4 clases de 45 min", amount: 120, families: 18 },
  { id: "rc2", label: "Plan mensual hermanos", detail: "2 alumnos, 8 clases", amount: 203, families: 6 },
  { id: "rc3", label: "Alquiler de instrumento", detail: "Violín o guitarra", amount: 25, families: 9 },
  { id: "rc4", label: "Clase extra de teoría", detail: "Sesión suelta de 60 min", amount: 18, families: 4 },
  { id: "rc5", label: "Descuento hermanos", detail: "Aplicado sobre el plan", amount: -20, families: 6 },
];

// Facturación de los últimos meses para la mini gráfica.
export const billingTrend = [
  { month: "Abr", billed: 3980, collected: 3720 },
  { month: "May", billed: 4210, collected: 4010 },
  { month: "Jun", billed: 4380, collected: 4090 },
  { month: "Jul", billed: 4120, collected: 3680 },
  { month: "Ago", billed: 4460, collected: 3210 },
];
