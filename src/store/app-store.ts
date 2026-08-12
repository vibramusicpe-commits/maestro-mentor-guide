import { create } from "zustand";

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
  weeklyGoalMinutes: number;
  practicedMinutes: number;
  makeupCredits: number;
};

export type BillingLine = {
  id: string;
  label: string;
  amount: number;
  kind: "flat" | "extra" | "credit";
};

export type SyncItem = { id: string; label: string };

type AppState = {
  // Teacher
  lessons: Lesson[];
  syncQueue: SyncItem[];
  privateNote: string;
  publicNote: string;
  setAttendance: (lessonId: string, status: AttendanceStatus) => void;
  flushSync: (id: string) => void;
  setNote: (kind: "private" | "public", value: string) => void;

  // Family
  kids: Kid[];
  activeKidId: string;
  billing: BillingLine[];
  balance: number;
  setActiveKid: (id: string) => void;
  addPractice: (kidId: string, minutes: number) => void;
  payBalance: () => void;
};

const initialLessons: Lesson[] = [
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

const initialKids: Kid[] = [
  {
    id: "k1",
    name: "Mateo",
    instrument: "Guitarra clásica",
    teacher: "Prof. Elena Márquez",
    weeklyGoalMinutes: 150,
    practicedMinutes: 85,
    makeupCredits: 2,
  },
  {
    id: "k2",
    name: "Sofía",
    instrument: "Piano",
    teacher: "Prof. Daniel Ocampo",
    weeklyGoalMinutes: 120,
    practicedMinutes: 40,
    makeupCredits: 1,
  },
];

const initialBilling: BillingLine[] = [
  { id: "b1", label: "Plan mensual · 2 alumnos", amount: 180, kind: "flat" },
  { id: "b2", label: "Alquiler de violín (Luana)", amount: 25, kind: "extra" },
  { id: "b3", label: "Clase extra de teoría", amount: 18, kind: "extra" },
  { id: "b4", label: "Descuento hermanos", amount: -20, kind: "credit" },
];

export const useAppStore = create<AppState>((set) => ({
  lessons: initialLessons,
  syncQueue: [],
  privateNote: "",
  publicNote: "",
  setAttendance: (lessonId, status) =>
    set((s) => {
      const lesson = s.lessons.find((l) => l.id === lessonId);
      return {
        lessons: s.lessons.map((l) => (l.id === lessonId ? { ...l, status } : l)),
        syncQueue: [
          ...s.syncQueue,
          {
            id: `${lessonId}-${Date.now()}`,
            label: `${lesson?.student ?? "Alumno"} · ${status}`,
          },
        ],
      };
    }),
  flushSync: (id) => set((s) => ({ syncQueue: s.syncQueue.filter((i) => i.id !== id) })),
  setNote: (kind, value) =>
    set(kind === "private" ? { privateNote: value } : { publicNote: value }),

  kids: initialKids,
  activeKidId: initialKids[0].id,
  billing: initialBilling,
  balance: initialBilling.reduce((acc, l) => acc + l.amount, 0),
  setActiveKid: (id) => set({ activeKidId: id }),
  addPractice: (kidId, minutes) =>
    set((s) => ({
      kids: s.kids.map((k) =>
        k.id === kidId ? { ...k, practicedMinutes: k.practicedMinutes + minutes } : k,
      ),
    })),
  payBalance: () => set({ balance: 0 }),
}));
