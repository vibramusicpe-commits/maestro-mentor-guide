import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  initialBilling,
  initialKids,
  initialLessons,
  initialStudents,
  payrollWeeks,
  type AttendanceStatus,
  type BillingLine,
  type Kid,
  type Lesson,
  type PayrollWeek,
  type StudentRow,
} from "./seeds";
import {
  adminStudents,
  initialInvoices,
  initialSchedule,
  type AdminStudent,
  type Invoice,
  type ScheduledLesson,
  type StudentStatus,
  type WeekDay,
} from "./admin-seeds";

export type { AttendanceStatus, BillingLine, Kid, Lesson, PayrollWeek, StudentRow };
export type { AdminStudent, Invoice, ScheduledLesson, StudentStatus, WeekDay };


export type Role = "admin" | "teacher" | "family";
export type SyncItem = { id: string; label: string };

type AppState = {
  // Rol activo
  activeRole: Role;
  setActiveRole: (role: Role) => void;

  // Profesor
  lessons: Lesson[];
  students: StudentRow[];
  payroll: PayrollWeek[];
  syncQueue: SyncItem[];
  privateNote: string;
  publicNote: string;
  setAttendance: (lessonId: string, status: AttendanceStatus) => void;
  flushSync: (id: string) => void;
  setNote: (kind: "private" | "public", value: string) => void;

  // Familia
  kids: Kid[];
  activeKidId: string;
  billing: BillingLine[];
  balance: number;
  setActiveKid: (id: string) => void;
  addPractice: (kidId: string, minutes: number) => void;
  payBalance: () => void;

  // Dirección (admin)
  schedule: ScheduledLesson[];
  adminStudents: AdminStudent[];
  invoices: Invoice[];
  rescheduleLesson: (id: string, day: WeekDay, time: string) => void;
  cancelLesson: (id: string) => void;
  setStudentStatus: (id: string, status: StudentStatus) => void;
  assignTeacher: (id: string, teacher: string) => void;
  markInvoicePaid: (id: string) => void;
  remindInvoice: (id: string) => void;
  generateMonthlyInvoices: () => number;
};


export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeRole: "admin",
      setActiveRole: (role) => set({ activeRole: role }),

      lessons: initialLessons,
      students: initialStudents,
      payroll: payrollWeeks,
      syncQueue: [],
      privateNote: "",
      publicNote: "",
      setAttendance: (lessonId, status) =>
        set((s) => {
          const lesson = s.lessons.find((l) => l.id === lessonId);
          const syncId = `${lessonId}-${Date.now()}`;
          // Se vacía sola: UI optimista con cola de sincronización simulada.
          setTimeout(() => {
            useAppStore.getState().flushSync(syncId);
          }, 1500);
          return {
            lessons: s.lessons.map((l) => (l.id === lessonId ? { ...l, status } : l)),
            syncQueue: [
              ...s.syncQueue,
              { id: syncId, label: `${lesson?.student ?? "Alumno"} · ${status}` },
            ],
          };
        }),
      flushSync: (id) => set((s) => ({ syncQueue: s.syncQueue.filter((i) => i.id !== id) })),
      setNote: (kind, value) =>
        set(kind === "private" ? { privateNote: value } : { publicNote: value }),

      kids: initialKids,
      activeKidId: initialKids[0]!.id,
      billing: initialBilling,
      balance: initialBilling.reduce((acc, l) => acc + l.amount, 0),
      setActiveKid: (id) => set({ activeKidId: id }),
      addPractice: (kidId, minutes) =>
        set((s) => ({
          kids: s.kids.map((k) =>
            k.id === kidId
              ? {
                  ...k,
                  practicedMinutes: k.practicedMinutes + minutes,
                  practiceSessions: k.practiceSessions + 1,
                }
              : k,
          ),
        })),
      payBalance: () => set({ balance: 0 }),

      // ===== Dirección =====
      schedule: initialSchedule,
      adminStudents: adminStudents,
      invoices: initialInvoices,
      rescheduleLesson: (id, day, time) =>
        set((s) => ({
          schedule: s.schedule.map((l) => (l.id === id ? { ...l, day, time } : l)),
          syncQueue: [...s.syncQueue, queueItem(`Clase reprogramada · ${day} ${time}`)],
        })),
      cancelLesson: (id) =>
        set((s) => ({
          schedule: s.schedule.map((l) =>
            l.id === id ? { ...l, status: "cancelada" as const } : l,
          ),
          syncQueue: [...s.syncQueue, queueItem("Clase cancelada · crédito emitido")],
          adminStudents: s.adminStudents.map((st) =>
            st.name === s.schedule.find((l) => l.id === id)?.student
              ? { ...st, makeupCredits: st.makeupCredits + 1 }
              : st,
          ),
        })),
      setStudentStatus: (id, status) =>
        set((s) => ({
          adminStudents: s.adminStudents.map((st) => (st.id === id ? { ...st, status } : st)),
          syncQueue: [...s.syncQueue, queueItem(`Estado actualizado · ${status}`)],
        })),
      assignTeacher: (id, teacher) =>
        set((s) => ({
          adminStudents: s.adminStudents.map((st) => (st.id === id ? { ...st, teacher } : st)),
          syncQueue: [...s.syncQueue, queueItem(`Profesor asignado · ${teacher}`)],
        })),
      markInvoicePaid: (id) =>
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === id ? { ...i, status: "pagado" as const } : i,
          ),
          syncQueue: [...s.syncQueue, queueItem("Recibo marcado como cobrado")],
        })),
      remindInvoice: (id) =>
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === id ? { ...i, remindedAt: "Hoy" } : i,
          ),
          syncQueue: [...s.syncQueue, queueItem("Recordatorio enviado")],
        })),
      generateMonthlyInvoices: () => {
        const pending = useAppStore.getState().invoices.filter((i) => i.status !== "pagado");
        set((s) => ({ syncQueue: [...s.syncQueue, queueItem("Recibos del mes generados")] }));
        return pending.length;
      },
    }),

    {
      name: "cadencia-app",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ activeRole: s.activeRole }) as unknown as AppState,
    },
  ),
);
