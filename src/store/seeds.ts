export type AttendanceStatus = "pendiente" | "presente" | "ausente" | "tarde";

export type Lesson = {
  id: string;
  time: string;
  student: string;
  instrument: string;
  room: string;
  status: AttendanceStatus;
};

export type Kid = {
  id: string;
  name: string;
  instrument: string;
  teacher: string;
  nextLesson: string;
  weeklyGoalMinutes: number;
  practicedMinutes: number;
  practiceSessions: number;
  makeupCredits: number;
};

export type BillingLine = {
  id: string;
  label: string;
  amount: number;
  kind: "flat" | "extra" | "credit";
};

export type StudentRow = {
  id: string;
  name: string;
  instrument: string;
  level: string;
  nextLesson: string;
  attendanceRate: number;
};

export type PayrollWeek = {
  id: string;
  label: string;
  lessons: number;
  cancelled: number;
  amount: number;
};

export const initialLessons: Lesson[] = [
  {
    id: "l1",
    time: "16:00",
    student: "Mateo Rivas",
    instrument: "Guitarra clásica",
    room: "Sala 3",
    status: "pendiente",
  },
  {
    id: "l2",
    time: "16:45",
    student: "Sofía Rivas",
    instrument: "Piano",
    room: "Sala 1",
    status: "pendiente",
  },
  {
    id: "l3",
    time: "17:30",
    student: "Luana Prado",
    instrument: "Violín",
    room: "Sala 2",
    status: "pendiente",
  },
  {
    id: "l4",
    time: "18:15",
    student: "Iker Solano",
    instrument: "Batería",
    room: "Sala 5",
    status: "pendiente",
  },
];

export const initialKids: Kid[] = [
  {
    id: "k1",
    name: "Mateo",
    instrument: "Guitarra clásica",
    teacher: "Prof. Elena Márquez",
    nextLesson: "Jueves 16:00 · Sala 3",
    weeklyGoalMinutes: 150,
    practicedMinutes: 85,
    practiceSessions: 4,
    makeupCredits: 2,
  },
  {
    id: "k2",
    name: "Sofía",
    instrument: "Piano",
    teacher: "Prof. Daniel Ocampo",
    nextLesson: "Jueves 16:45 · Sala 1",
    weeklyGoalMinutes: 120,
    practicedMinutes: 40,
    practiceSessions: 2,
    makeupCredits: 1,
  },
];

export const initialBilling: BillingLine[] = [
  { id: "b1", label: "Plan mensual · 2 alumnos", amount: 180, kind: "flat" },
  { id: "b2", label: "Alquiler de violín (Luana)", amount: 25, kind: "extra" },
  { id: "b3", label: "Clase extra de teoría", amount: 18, kind: "extra" },
  { id: "b4", label: "Descuento hermanos", amount: -20, kind: "credit" },
];

export const initialStudents: StudentRow[] = [
  {
    id: "s1",
    name: "Mateo Rivas",
    instrument: "Guitarra clásica",
    level: "Nivel 2",
    nextLesson: "Hoy 16:00",
    attendanceRate: 96,
  },
  {
    id: "s2",
    name: "Sofía Rivas",
    instrument: "Piano",
    level: "Nivel 1",
    nextLesson: "Hoy 16:45",
    attendanceRate: 88,
  },
  {
    id: "s3",
    name: "Luana Prado",
    instrument: "Violín",
    level: "Nivel 3",
    nextLesson: "Hoy 17:30",
    attendanceRate: 74,
  },
  {
    id: "s4",
    name: "Iker Solano",
    instrument: "Batería",
    level: "Nivel 2",
    nextLesson: "Hoy 18:15",
    attendanceRate: 91,
  },
  {
    id: "s5",
    name: "Camila Ferrer",
    instrument: "Canto",
    level: "Nivel 4",
    nextLesson: "Viernes 15:00",
    attendanceRate: 99,
  },
  {
    id: "s6",
    name: "Tomás Aguirre",
    instrument: "Guitarra eléctrica",
    level: "Nivel 1",
    nextLesson: "Viernes 17:00",
    attendanceRate: 63,
  },
];

export const payrollWeeks: PayrollWeek[] = [
  { id: "w1", label: "Semana 1 · 1–7 ago", lessons: 22, cancelled: 1, amount: 396 },
  { id: "w2", label: "Semana 2 · 8–14 ago", lessons: 24, cancelled: 0, amount: 432 },
  { id: "w3", label: "Semana 3 · 15–21 ago", lessons: 19, cancelled: 2, amount: 342 },
  { id: "w4", label: "Semana 4 · 22–28 ago", lessons: 12, cancelled: 1, amount: 216 },
];
