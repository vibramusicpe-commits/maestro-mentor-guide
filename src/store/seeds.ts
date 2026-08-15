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

export const initialLessons: Lesson[] = [];

export const initialKids: Kid[] = [];

export const initialBilling: BillingLine[] = [];

export const initialStudents: StudentRow[] = [];

export const payrollWeeks: PayrollWeek[] = [];
