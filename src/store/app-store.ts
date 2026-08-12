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
  type EmergencyContact,
  type Invoice,
  type InvoiceStatus,
  type LessonModality,
  type PaymentMethod,
  type ScheduledLesson,
  type StudentStatus,
  type WeekDay,
} from "./admin-seeds";

export type { AttendanceStatus, BillingLine, Kid, Lesson, PayrollWeek, StudentRow };
export type { AdminStudent, EmergencyContact, Invoice, InvoiceStatus, LessonModality, PaymentMethod, ScheduledLesson, StudentStatus, WeekDay };


export type Role = "super_admin" | "staff" | "teacher" | "family" | "admin";
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
  setStudentModality: (id: string, modality: LessonModality) => void;
  addStudentCredit: (id: string) => void;
  consumeStudentCredit: (id: string) => void;  markInvoicePaid: (id: string, method?: PaymentMethod) => void;
  recordPaymentAbono: (
    id: string,
    amount: number,
    method: PaymentMethod,
    voucherRef?: string,
    note?: string,
  ) => void;
  remindInvoice: (id: string) => void;
  generateMonthlyInvoices: () => number;
};
// Crea un item de cola optimista que se vacía solo (simula la escritura en backend).
function queueItem(label: string): SyncItem {
  const id = `q-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  setTimeout(() => {
    useAppStore.getState().flushSync(id);
  }, 1500);
  return { id, label };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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
      setStudentModality: (id, modality) =>
        set((s) => ({
          adminStudents: s.adminStudents.map((st) => (st.id === id ? { ...st, modality } : st)),
          syncQueue: [...s.syncQueue, queueItem(`Modalidad actualizada · ${modality}`)],
        })),
      addStudentCredit: (id) =>
        set((s) => ({
          adminStudents: s.adminStudents.map((st) =>
            st.id === id ? { ...st, makeupCredits: st.makeupCredits + 1 } : st,
          ),
          syncQueue: [...s.syncQueue, queueItem("Crédito de falta añadido")],
        })),
      consumeStudentCredit: (id) =>
        set((s) => ({
          adminStudents: s.adminStudents.map((st) =>
            st.id === id ? { ...st, makeupCredits: Math.max(0, st.makeupCredits - 1) } : st,
          ),
          syncQueue: [...s.syncQueue, queueItem("Crédito de recuperación utilizado")],
        })),
      markInvoicePaid: (id, method = "Yape") =>
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: "pagado" as const,
                  amountPaid: i.amount,
                  remainingBalance: 0,
                  paymentMethod: method,
                  paymentLogs: [
                    ...i.paymentLogs,
                    {
                      id: `log-${Date.now()}`,
                      timestamp: new Date().toLocaleString("es-PE"),
                      registeredBy: s.activeRole === "staff" ? "Secretaría (Staff)" : "Dueña",
                      amount: i.remainingBalance || i.amount,
                      method,
                      voucherRef: "PAGO-DIRECTO",
                      note: "Pago total confirmado",
                    },
                  ],
                }
              : i,
          ),
          syncQueue: [...s.syncQueue, queueItem(`Recibo cobrado · ${method}`)],
        })),
      recordPaymentAbono: (id, amount, method, voucherRef = "", note = "") =>
        set((s) => {
          const inv = s.invoices.find((i) => i.id === id);
          if (!inv) return s;

          const newPaid = Math.min(inv.amount, inv.amountPaid + amount);
          const newRemaining = Math.max(0, inv.amount - newPaid);
          const newStatus = newRemaining === 0 ? ("pagado" as const) : ("parcial" as const);

          const newLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleString("es-PE"),
            registeredBy: s.activeRole === "staff" ? "Secretaría (Staff)" : "Dueña",
            amount,
            method,
            voucherRef: voucherRef || "WSAP-COMPROBANTE",
            note: note || "Abono registrado vía WhatsApp",
          };

          return {
            invoices: s.invoices.map((i) =>
              i.id === id
                ? {
                    ...i,
                    amountPaid: newPaid,
                    remainingBalance: newRemaining,
                    status: newStatus,
                    paymentMethod: method,
                    paymentLogs: [...i.paymentLogs, newLog],
                  }
                : i,
            ),
            syncQueue: [
              ...s.syncQueue,
              queueItem(`Abono registrado · S/ ${amount} vía ${method}`),
            ],
          };
        }),
      remindInvoice: (id) =>
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === id ? { ...i, remindedAt: "Hoy" } : i,
          ),
          syncQueue: [...s.syncQueue, queueItem("Recordatorio enviado")],
        })),
      generateMonthlyInvoices: (): number => {
        const pending = get().invoices.filter((i: Invoice) => i.status !== "pagado");
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
