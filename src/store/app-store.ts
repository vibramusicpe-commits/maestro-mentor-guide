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
  type AgeCategory,
  type EmergencyContact,
  type Invoice,
  type InvoiceStatus,
  type LessonModality,
  type PaymentLog,
  type PaymentMethod,
  type ScheduledLesson,
  type StudentStatus,
  type WeekDay,
  type VibraPlanType,
  type MatriculaType,
  VIBRA_PRICING,
} from "./admin-seeds";

export type { AttendanceStatus, BillingLine, Kid, Lesson, PayrollWeek, StudentRow };
export type {
  AdminStudent,
  AgeCategory,
  EmergencyContact,
  Invoice,
  InvoiceStatus,
  LessonModality,
  PaymentLog,
  PaymentMethod,
  ScheduledLesson,
  StudentStatus,
  WeekDay,
  VibraPlanType,
  MatriculaType,
};
export { VIBRA_PRICING };

// Helper de Timbre Sintético de Doble Armónico con Web Audio API
export function playSyntheticBellChime(volume: number = 0.85) {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const playHarmonic = (freq: number, startTime: number, duration: number, gainVal: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(gainVal * volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Campana de Escuela / Timbre Acústico (Do6 + Mi6 + Sol6 resonancia)
    playHarmonic(1046.5, now, 0.7, 0.4);
    playHarmonic(1318.5, now, 0.9, 0.35);
    playHarmonic(1567.98, now, 1.1, 0.3);

    // Segundo toque armónico a los 220ms
    playHarmonic(1046.5, now + 0.22, 0.8, 0.45);
    playHarmonic(1318.5, now + 0.22, 1.0, 0.4);
    playHarmonic(2093.0, now + 0.22, 1.3, 0.25);
  } catch (err) {
    console.warn("Error reproduciendo timbre sintético:", err);
  }
}

export type Role = "super_admin" | "staff" | "teacher" | "family" | "admin";
export type SyncItem = { id: string; label: string };

type AppState = {
  // Auth & Rol activo
  activeRole: Role;
  isAuthenticated: boolean;
  currentUser: { email: string; name: string } | null;
  setActiveRole: (role: Role) => void;
  updateUserName: (name: string) => void;
  login: (email: string, role: Role, customName?: string) => void;
  logout: () => void;

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
  rescheduleLesson: (id: string, day: WeekDay, time: string, scope?: "only-this-week" | "all", targetWeekIndex?: number) => void;
  cancelLesson: (id: string) => void;
  removeLessonFromSchedule: (id: string) => void;
  deleteLessonFromSchedule: (id: string) => void;
  addLessonToSchedule: (lesson: Omit<ScheduledLesson, "id">) => void;
  importScheduleFromCSV: (newLessons: ScheduledLesson[]) => void;
  clearSchedule: () => void;
  importStudentsFromCSV: (newStudents: AdminStudent[]) => void;
  clearStudents: () => void;
  addNewStudent: (newSt: Omit<AdminStudent, "id" | "risk" | "joinedAt" | "attendanceRate" | "makeupCredits" | "balance" | "recentAttendance" | "teacherNote">) => void;
  deleteStudent: (id: string) => void;
  deleteStudents: (ids: string[]) => void;
  updateStudentDetails: (id: string, updates: Partial<AdminStudent>) => void;
  setStudentStatus: (id: string, status: StudentStatus) => void;
  setStudentModality: (id: string, modality: LessonModality) => void;
  assignTeacher: (id: string, teacher: string) => void;
  addStudentCredit: (id: string) => void;
  consumeStudentCredit: (id: string) => void;
  markLessonAttendance: (
    lessonId: string,
    status: "presente" | "ausente" | "tarde" | "justificada",
    notes?: string,
    targetWeekIndex?: number
  ) => void;
  scheduleMakeupLesson: (data: {
    studentName: string;
    teacher: string;
    room: string;
    day: WeekDay;
    time: string;
    instrument: string;
    category?: AgeCategory;
    recoveringLessonDate?: string;
  }) => void;
  addStudentReentryRecord: (
    studentId: string,
    record: { date: string; reason: string; notes?: string }
  ) => void;
  markInvoicePaid: (id: string, method?: PaymentMethod) => void;
  recordPaymentAbono: (
    id: string,
    amount: number,
    method: PaymentMethod,
    voucherRef?: string,
    note?: string,
    voucherImage?: string,
    paymentTime?: string,
  ) => void;
  recordNewDirectAbono: (data: {
    familyOrStudent: string;
    concept: string;
    amount: number;
    method: PaymentMethod;
    voucherRef?: string;
    note?: string;
    voucherImage?: string;
    paymentTime?: string;
  }) => void;
  importBatchPayments: (
    payments: Array<{
      familyOrStudent: string;
      amount: number;
      method: PaymentMethod;
      voucherRef?: string;
      concept?: string;
      note?: string;
      date?: string;
    }>,
  ) => number;
  remindInvoice: (id: string) => void;
  generateMonthlyInvoices: () => number;
  // Configuración de Timbre Acústico (school bell.mp3)
  chimeSettings: {
    autoPlayEnabled: boolean;
    playOnClassStart: boolean;
    playOnClassEnd: boolean;
    volume: number; // 0 a 1
  };
  setChimeSettings: (settings: Partial<{ autoPlayEnabled: boolean; playOnClassStart: boolean; playOnClassEnd: boolean; volume: number }>) => void;
  playOfficialChime: () => void;

  // Alertas / Incidencias operativas de Alumnos (Dashboard Alerts)
  studentAlerts: Array<{
    id: string;
    studentId?: string;
    studentName: string;
    type: "salud" | "comportamiento" | "logro" | "coordinacion" | "otro";
    severity: "alta" | "media" | "baja" | "positiva";
    message: string;
    createdAt: string;
    status: "pendiente" | "resuelto";
  }>;
  addStudentAlert: (alert: {
    studentId?: string;
    studentName: string;
    type: "salud" | "comportamiento" | "logro" | "coordinacion" | "otro";
    severity: "alta" | "media" | "baja" | "positiva";
    message: string;
  }) => void;
  resolveStudentAlert: (alertId: string) => void;

  // Sistema de Solicitudes de Eliminación Protegidas (Nayeli solicita -> Dueña aprueba/deniega con reporte)
  deletionRequests: Array<{
    id: string;
    entityType: "student" | "lesson" | "invoice" | "alert";
    entityId: string;
    entityName: string;
    details: string;
    requestedBy: string;
    requestedAt: string; // ISO o fecha legible
    reason: string;
    status: "pendiente" | "aprobado" | "rechazado";
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
  }>;
  createDeletionRequest: (request: {
    entityType: "student" | "lesson" | "invoice" | "alert";
    entityId: string;
    entityName: string;
    details: string;
    reason: string;
  }) => void;
  approveDeletionRequest: (requestId: string, notes?: string) => void;
  rejectDeletionRequest: (requestId: string, notes?: string) => void;
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
      activeRole: "super_admin",
      isAuthenticated: false,
      currentUser: null,
      setActiveRole: (role) => set({ activeRole: role }),
      updateUserName: (name: string) =>
        set((s) => ({
          currentUser: s.currentUser ? { ...s.currentUser, name } : { email: "usuario@vibramusic.pe", name },
        })),
      login: (email, role, customName) =>
        set({
          activeRole: role,
          isAuthenticated: true,
          currentUser: {
            email,
            name:
              customName ||
              (role === "super_admin"
                ? "Dirección (Dueña)"
                : role === "staff"
                  ? "Nayeli"
                  : role === "teacher"
                    ? "Prof. Jeremy"
                    : "Familia García"),
          },
        }),
      logout: () => set({ isAuthenticated: false, currentUser: null }),

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
      activeKidId: initialKids[0]?.id ?? "",
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
      rescheduleLesson: (id, day, time, scope = "only-this-week", targetWeekIndex) =>
        set((s) => {
          const targetLesson = s.schedule.find((l) => l.id === id);
          if (!targetLesson) return s;

          if (scope === "only-this-week" && targetWeekIndex !== undefined) {
            // Si es un horario recurrente mensual (sin weekIndex fijado)
            if (targetLesson.weekIndex === undefined) {
              const excluded = targetLesson.excludedWeeks || [];
              const updatedOriginal = {
                ...targetLesson,
                excludedWeeks: Array.from(new Set([...excluded, targetWeekIndex])),
              };

              const newSingleWeekLesson: ScheduledLesson = {
                ...targetLesson,
                id: `sch-resched-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                day: day,
                time: time,
                weekIndex: targetWeekIndex,
                excludedWeeks: undefined,
                attendanceStatus: undefined,
                attendanceByWeek: undefined,
              };

              return {
                schedule: [
                  ...s.schedule.map((l) => (l.id === id ? updatedOriginal : l)),
                  newSingleWeekLesson,
                ],
                syncQueue: [
                  ...s.syncQueue,
                  queueItem(
                    `Clase reprogramada (Solo Semana ${targetWeekIndex + 1}) · ${day} ${time}`,
                  ),
                ],
              };
            } else {
              // Ya era una clase puntual de una semana específica
              const updated = s.schedule.map((l) => {
                if (l.id === id) {
                  return { ...l, day, time, weekIndex: targetWeekIndex };
                }
                return l;
              });
              return {
                schedule: updated,
                syncQueue: [
                  ...s.syncQueue,
                  queueItem(
                    `Clase reprogramada (Solo Semana ${targetWeekIndex + 1}) · ${day} ${time}`,
                  ),
                ],
              };
            }
          }

          // Por defecto: Aplica a todo el mes (las 4 semanas)
          const updatedSchedule = s.schedule.map((l) => {
            if (l.id === id) {
              const { weekIndex, excludedWeeks, ...rest } = l;
              return { ...rest, day, time, excludedWeeks: [] };
            }
            return l;
          });

          return {
            schedule: updatedSchedule,
            syncQueue: [
              ...s.syncQueue,
              queueItem(`Clase reprogramada (Mes completo) · ${day} ${time}`),
            ],
          };
        }),
      cancelLesson: (id) =>
        set((s) => {
          const targetLesson = s.schedule.find((l) => l.id === id);
          const isPersonalizada = targetLesson?.category === "PERSONALIZADA";

          return {
            schedule: s.schedule.map((l) =>
              l.id === id ? { ...l, status: "cancelada" as const } : l,
            ),
            syncQueue: [
              ...s.syncQueue,
              queueItem(
                isPersonalizada
                  ? "Clase personalizada cancelada (Sin crédito según política)"
                  : "Clase regular cancelada · crédito emitido"
              ),
            ],
            // Si es PERSONALIZADA, NUNCA se emite crédito de recuperación
            adminStudents: isPersonalizada
              ? s.adminStudents
              : s.adminStudents.map((st) =>
                st.name === targetLesson?.student
                  ? { ...st, makeupCredits: st.makeupCredits + 1 }
                  : st,
              ),
          };
        }),
      removeLessonFromSchedule: (id) =>
        set((s) => ({
          schedule: s.schedule.filter((l) => l.id !== id),
          syncQueue: [...s.syncQueue, queueItem("Clase removida permanentemente del horario")],
        })),
      // Alias directo para evitar "_t is not a function"
      deleteLessonFromSchedule: (id) =>
        set((s) => ({
          schedule: s.schedule.filter((l) => l.id !== id),
          syncQueue: [...s.syncQueue, queueItem("Clase removida permanentemente del horario")],
        })),
      addLessonToSchedule: (lesson) =>
        set((s) => {
          const newLesson: ScheduledLesson = {
            ...lesson,
            id: `sch-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          };
          return {
            schedule: [...s.schedule, newLesson],
            syncQueue: [...s.syncQueue, queueItem(`Clase programada: ${lesson.student} (${lesson.day} ${lesson.time})`)],
          };
        }),
      importScheduleFromCSV: (newLessons) =>
        set((s) => ({
          schedule: newLessons,
          syncQueue: [
            ...s.syncQueue,
            queueItem(`Importación masiva CSV: ${newLessons.length} clases cargadas al horario`),
          ],
        })),
      clearSchedule: () =>
        set((s) => ({
          schedule: [],
          syncQueue: [...s.syncQueue, queueItem("Horario limpiado por completo")],
        })),
      importStudentsFromCSV: (newStudents) =>
        set((s) => ({
          adminStudents: newStudents,
          syncQueue: [
            ...s.syncQueue,
            queueItem(`Importación masiva CSV: ${newStudents.length} alumnos registrados`),
          ],
        })),
      clearStudents: () =>
        set((s) => ({
          adminStudents: [],
          syncQueue: [...s.syncQueue, queueItem("Directorio de alumnos limpiado por completo")],
        })),
      deleteStudent: (id) =>
        set((s) => {
          const studentToDelete = s.adminStudents.find((st) => st.id === id);
          const studentName = studentToDelete?.name;

          return {
            adminStudents: s.adminStudents.filter((st) => st.id !== id),
            schedule: studentName
              ? s.schedule.filter((l) => l.student.toLowerCase() !== studentName.toLowerCase())
              : s.schedule,
            syncQueue: [...s.syncQueue, queueItem(`Alumno ${studentName || id} y sus horarios eliminados`)],
          };
        }),
      deleteStudents: (ids) =>
        set((s) => {
          const namesToDelete = s.adminStudents
            .filter((st) => ids.includes(st.id))
            .map((st) => st.name.toLowerCase());

          return {
            adminStudents: s.adminStudents.filter((st) => !ids.includes(st.id)),
            schedule: s.schedule.filter(
              (l) => !namesToDelete.includes(l.student.toLowerCase()),
            ),
            syncQueue: [...s.syncQueue, queueItem(`${ids.length} alumnos y sus respectivos horarios eliminados`)],
          };
        }),
      updateStudentDetails: (id, updates) =>
        set((s) => ({
          adminStudents: s.adminStudents.map((st) => (st.id === id ? { ...st, ...updates } : st)),
          syncQueue: [...s.syncQueue, queueItem("Ficha de alumno actualizada")],
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
      markLessonAttendance: (lessonId, status, notes = "", targetWeekIndex?: number) =>
        set((s) => {
          const lesson = s.schedule.find((l) => l.id === lessonId);
          const studentName = lesson?.student;
          const isJustificada = status === "justificada";
          const weekIdx = targetWeekIndex ?? lesson?.weekIndex ?? 1;

          return {
            schedule: s.schedule.map((l) => {
              if (l.id === lessonId) {
                const prevByWeek = l.attendanceByWeek || {};
                return {
                  ...l,
                  attendanceStatus: status,
                  attendanceByWeek: {
                    ...prevByWeek,
                    [weekIdx]: status,
                  },
                };
              }
              return l;
            }),
            adminStudents: s.adminStudents.map((st) => {
              if (
                studentName &&
                (st.name.toLowerCase() === studentName.toLowerCase() ||
                  st.name.toLowerCase().includes(studentName.toLowerCase()) ||
                  studentName.toLowerCase().includes(st.name.toLowerCase()))
              ) {
                return {
                  ...st,
                  recentAttendance: [status, ...(st.recentAttendance || []).slice(0, 4)],
                  makeupCredits: isJustificada ? st.makeupCredits + 1 : st.makeupCredits,
                };
              }
              return st;
            }),
            syncQueue: [
              ...s.syncQueue,
              queueItem(
                `Asistencia marcada (Semana ${weekIdx + 1}) · ${studentName || "Alumno"} (${status.toUpperCase()})`,
              ),
            ],
          };
        }),
      scheduleMakeupLesson: (data) =>
        set((s) => {
          const newLesson: ScheduledLesson = {
            id: `sch-mk-${Date.now()}`,
            day: data.day,
            time: data.time,
            student: data.studentName,
            instrument: data.instrument,
            teacher: data.teacher,
            room: data.room,
            category: data.category || "RECUPERACION",
            status: "programada",
            isMakeup: true,
            recoveringLessonDate: data.recoveringLessonDate || "Clase previa justificada",
          };

          return {
            schedule: [...s.schedule, newLesson],
            adminStudents: s.adminStudents.map((st) => {
              if (
                st.name.toLowerCase() === data.studentName.toLowerCase() ||
                st.name.toLowerCase().includes(data.studentName.toLowerCase()) ||
                data.studentName.toLowerCase().includes(st.name.toLowerCase())
              ) {
                return {
                  ...st,
                  makeupCredits: Math.max(0, st.makeupCredits - 1),
                };
              }
              return st;
            }),
            syncQueue: [
              ...s.syncQueue,
              queueItem(`Clase de Recuperación programada · ${data.studentName} (${data.day} ${data.time})`),
            ],
          };
        }),
      addStudentReentryRecord: (studentId, record) =>
        set((s) => ({
          adminStudents: s.adminStudents.map((st) => {
            if (st.id === studentId) {
              const currentHistory = st.reentryHistory || [];
              return {
                ...st,
                status: "activo" as const,
                isReentry: true,
                reentryHistory: [{ ...record }, ...currentHistory],
              };
            }
            return st;
          }),
          syncQueue: [
            ...s.syncQueue,
            queueItem(`Reingreso registrado · Alumno ID ${studentId}`),
          ],
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
                    paymentTime: new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
                    note: "Pago total confirmado",
                  },
                ],
              }
              : i,
          ),
          syncQueue: [...s.syncQueue, queueItem(`Recibo cobrado · ${method}`)],
        })),
      recordPaymentAbono: (id, amount, method, voucherRef = "", note = "", voucherImage = "", paymentTime = "") =>
        set((s) => {
          const inv = s.invoices.find((i) => i.id === id);
          if (!inv) return s;

          const newPaid = Math.min(inv.amount, inv.amountPaid + amount);
          const newRemaining = Math.max(0, inv.amount - newPaid);
          const newStatus = newRemaining === 0 ? ("pagado" as const) : ("parcial" as const);

          const newLog: PaymentLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            timestamp: new Date().toLocaleString("es-PE"),
            registeredBy: s.activeRole === "staff" ? "Secretaría (Nayeli)" : "Dirección (Dueña)",
            amount,
            method,
            voucherRef: voucherRef || (method === "Yape" ? "YAPE-VOUCHER" : "WSAP-COMPROBANTE"),
            paymentTime: paymentTime || new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
            note: note || "Abono registrado con evidencia",
            ...(voucherImage ? { voucherImage } : {}),
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
              queueItem(`Abono registrado · S/ ${amount} vía ${method} (${inv.family})`),
            ],
          };
        }),
      recordNewDirectAbono: (data) =>
        set((s) => {
          const { familyOrStudent, concept, amount, method, voucherRef, note, voucherImage, paymentTime } = data;
          const cleanSearch = familyOrStudent.trim().toLowerCase();

          const existingInv = s.invoices.find(
            (i) => i.family.toLowerCase().includes(cleanSearch) || cleanSearch.includes(i.family.toLowerCase())
          );

          const newLog: PaymentLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            timestamp: new Date().toLocaleString("es-PE"),
            registeredBy: s.activeRole === "staff" ? "Secretaría (Nayeli)" : "Dirección (Dueña)",
            amount,
            method,
            voucherRef: voucherRef || (method === "Yape" ? "YAPE-VOUCHER" : "PAGO-DIRECTO"),
            paymentTime: paymentTime || new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
            note: note || "Abono directo registrado con evidencia",
            ...(voucherImage ? { voucherImage } : {}),
          };

          if (existingInv) {
            const newPaid = Math.min(existingInv.amount, existingInv.amountPaid + amount);
            const newRemaining = Math.max(0, existingInv.amount - newPaid);
            const newStatus = newRemaining === 0 ? ("pagado" as const) : ("parcial" as const);

            return {
              invoices: s.invoices.map((i) =>
                i.id === existingInv.id
                  ? {
                    ...i,
                    amountPaid: newPaid,
                    remainingBalance: newRemaining,
                    status: newStatus,
                    paymentMethod: method,
                    paymentLogs: [...i.paymentLogs, newLog],
                  }
                  : i
              ),
              syncQueue: [...s.syncQueue, queueItem(`Abono aplicado a ${existingInv.family} · S/ ${amount}`)],
            };
          }

          const newInvoice: Invoice = {
            id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            family: familyOrStudent.startsWith("Familia ") ? familyOrStudent : `Familia ${familyOrStudent}`,
            concept: concept || "Abono de Clases",
            students: 1,
            amount: amount,
            amountPaid: amount,
            remainingBalance: 0,
            dueDate: new Date().toISOString().slice(0, 10),
            daysToDue: 0,
            status: "pagado",
            paymentMethod: method,
            remindedAt: null,
            paymentLogs: [newLog],
          };

          return {
            invoices: [newInvoice, ...s.invoices],
            syncQueue: [...s.syncQueue, queueItem(`Nuevo abono registrado · S/ ${amount} para ${newInvoice.family}`)],
          };
        }),
      importBatchPayments: (payments) => {
        let importedCount = 0;
        set((s) => {
          let currentInvoices = [...s.invoices];
          const nowStr = new Date().toLocaleString("es-PE");
          const regBy = s.activeRole === "staff" ? "Secretaría (Nayeli)" : "Dirección (Dueña)";

          payments.forEach((p, idx) => {
            if (!p.familyOrStudent || !p.amount || isNaN(p.amount) || p.amount <= 0) return;
            importedCount++;
            const cleanSearch = p.familyOrStudent.trim().toLowerCase();
            const invIndex = currentInvoices.findIndex(
              (i) => i.family.toLowerCase().includes(cleanSearch) || cleanSearch.includes(i.family.toLowerCase())
            );

            const newLog: PaymentLog = {
              id: `log-imp-${Date.now()}-${idx}`,
              timestamp: p.date || nowStr,
              registeredBy: regBy,
              amount: p.amount,
              method: p.method || "Yape",
              voucherRef: p.voucherRef || "IMPORTADO-EXCEL",
              paymentTime: nowStr,
              note: p.note || "Abono importado por archivo Excel/CSV",
            };

            if (invIndex >= 0) {
              const existing = currentInvoices[invIndex]!;
              const newPaid = Math.min(existing.amount, existing.amountPaid + p.amount);
              const newRemaining = Math.max(0, existing.amount - newPaid);
              const newStatus = newRemaining === 0 ? ("pagado" as const) : ("parcial" as const);

              currentInvoices[invIndex] = {
                ...existing,
                amountPaid: newPaid,
                remainingBalance: newRemaining,
                status: newStatus,
                paymentMethod: p.method || existing.paymentMethod,
                paymentLogs: [...existing.paymentLogs, newLog],
              };
            } else {
              const newInv: Invoice = {
                id: `inv-imp-${Date.now()}-${idx}`,
                family: p.familyOrStudent.startsWith("Familia ") ? p.familyOrStudent : `Familia ${p.familyOrStudent}`,
                concept: p.concept || "Mensualidad Regular",
                students: 1,
                amount: p.amount,
                amountPaid: p.amount,
                remainingBalance: 0,
                dueDate: "2026-08-20",
                daysToDue: 0,
                status: "pagado",
                paymentMethod: p.method || "Yape",
                remindedAt: null,
                paymentLogs: [newLog],
              };
              currentInvoices.unshift(newInv);
            }
          });

          return {
            invoices: currentInvoices,
            syncQueue: [...s.syncQueue, queueItem(`Importación masiva completada: ${importedCount} pagos conciliados`)],
          };
        });
        return importedCount;
      },
      remindInvoice: (id) =>
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === id ? { ...i, remindedAt: "Hoy" } : i,
          ),
          syncQueue: [...s.syncQueue, queueItem("Recordatorio enviado")],
        })),
      generateMonthlyInvoices: (): number => {
        const currentStudents = get().adminStudents;
        const generatedInvoices: Invoice[] = currentStudents.map((st, idx) => {
          const planAmount = st.planPrice || (st.planType === "Trimestral" ? 289.4 : st.planType === "Anual" ? 263.2 : 329.0);
          const conceptLabel = `Mensualidad ${st.planType || "Mensual"} · ${st.instrument} (${st.teacher})`;

          return {
            id: `inv-${Date.now()}-${idx}`,
            family: st.family || `Familia ${st.name.split(" ")[1] || st.name}`,
            concept: conceptLabel,
            students: 1,
            amount: planAmount,
            amountPaid: 0,
            remainingBalance: planAmount,
            dueDate: "2026-08-20",
            daysToDue: 6,
            status: "pendiente" as const,
            paymentMethod: null,
            remindedAt: null,
            paymentLogs: [],
          };
        });

        set((s) => ({
          invoices: generatedInvoices,
          syncQueue: [...s.syncQueue, queueItem(`Recibos del mes generados para ${generatedInvoices.length} familias`)],
        }));
        return generatedInvoices.length;
      },
      addNewStudent: (newSt) =>
        set((s) => {
          const created: AdminStudent = {
            id: `st-${Date.now()}`,
            ...newSt,
            risk: 10,
            joinedAt: new Date().toLocaleDateString("es-PE"),
            attendanceRate: 100,
            makeupCredits: 0,
            balance: 0,
            recentAttendance: ["presente"],
            teacherNote: "Alumno nuevo matriculado.",
          };
          return {
            adminStudents: [created, ...s.adminStudents],
            syncQueue: [...s.syncQueue, queueItem(`Nuevo alumno matriculado · ${created.name}`)],
          };
        }),

      // Configuración de Timbre Acústico Oficial
      chimeSettings: {
        autoPlayEnabled: true,
        playOnClassStart: true,
        playOnClassEnd: true,
        volume: 0.8,
      },
      setChimeSettings: (settings) =>
        set((s) => ({
          chimeSettings: { ...s.chimeSettings, ...settings },
        })),
      playOfficialChime: () => {
        const vol = get().chimeSettings?.volume ?? 0.85;
        try {
          const audio = new Audio("/school-bell.mp3");
          audio.volume = Math.max(0, Math.min(1, vol));
          audio.play().catch(() => {
            playSyntheticBellChime(vol);
          });
        } catch {
          playSyntheticBellChime(vol);
        }
      },
      // Alertas / Incidencias operativas de Alumnos
      studentAlerts: [],
      addStudentAlert: (alert) =>
        set((s) => {
          const newAlert = {
            id: `st-alert-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            ...alert,
            createdAt: "Hoy",
            status: "pendiente" as const,
          };
          return {
            studentAlerts: [newAlert, ...s.studentAlerts],
            syncQueue: [...s.syncQueue, queueItem(`Alerta registrada para ${alert.studentName}`)],
          };
        }),
      resolveStudentAlert: (alertId) =>
        set((s) => ({
          studentAlerts: s.studentAlerts.map((a) =>
            a.id === alertId ? { ...a, status: "resuelto" as const } : a,
          ),
          syncQueue: [...s.syncQueue, queueItem("Alerta de alumno resuelta")],
        })),

      // Sistema de Solicitudes de Eliminación Protegidas
      deletionRequests: [],
      createDeletionRequest: (req) =>
        set((s) => {
          const now = new Date();
          const formattedDate = `${now.toLocaleDateString("es-PE")} ${now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`;
          const newReq = {
            id: `del-req-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            ...req,
            requestedBy: s.activeRole === "staff" ? "Nayeli (Secretaría)" : "Dirección (Dueña)",
            requestedAt: formattedDate,
            status: "pendiente" as const,
          };
          return {
            deletionRequests: [newReq, ...s.deletionRequests],
            syncQueue: [...s.syncQueue, queueItem(`Solicitud de eliminación enviada a Dirección · ${req.entityName}`)],
          };
        }),

      approveDeletionRequest: (requestId, notes) =>
        set((s) => {
          const req = s.deletionRequests.find((r) => r.id === requestId);
          if (!req) return s;

          const now = new Date();
          const formattedDate = `${now.toLocaleDateString("es-PE")} ${now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`;

          let updatedStudents = s.adminStudents;
          let updatedSchedule = s.schedule;
          let updatedInvoices = s.invoices;
          let updatedAlerts = s.studentAlerts;

          if (req.entityType === "student") {
            const studentToDelete = s.adminStudents.find((st) => st.id === req.entityId || st.name.toLowerCase() === req.entityName.toLowerCase());
            const studentName = studentToDelete?.name || req.entityName;
            updatedStudents = s.adminStudents.filter((st) => st.id !== req.entityId && st.name.toLowerCase() !== studentName.toLowerCase());
            updatedSchedule = s.schedule.filter((l) => l.student.toLowerCase() !== studentName.toLowerCase());
          } else if (req.entityType === "lesson") {
            updatedSchedule = s.schedule.filter((l) => l.id !== req.entityId);
          } else if (req.entityType === "invoice") {
            updatedInvoices = s.invoices.filter((i) => i.id !== req.entityId);
          } else if (req.entityType === "alert") {
            updatedAlerts = s.studentAlerts.filter((a) => a.id !== req.entityId);
          }

          const updatedRequests = s.deletionRequests.map((r) =>
            r.id === requestId
              ? {
                ...r,
                status: "aprobado" as const,
                reviewedBy: "Dueña (Super Admin)",
                reviewedAt: formattedDate,
                reviewNotes: notes || "Aprobado por Dirección",
              }
              : r,
          );

          return {
            adminStudents: updatedStudents,
            schedule: updatedSchedule,
            invoices: updatedInvoices,
            studentAlerts: updatedAlerts,
            deletionRequests: updatedRequests,
            syncQueue: [...s.syncQueue, queueItem(`Eliminación aprobada y ejecutada por Dirección · ${req.entityName}`)],
          };
        }),

      rejectDeletionRequest: (requestId, notes) =>
        set((s) => {
          const now = new Date();
          const formattedDate = `${now.toLocaleDateString("es-PE")} ${now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`;

          const updatedRequests = s.deletionRequests.map((r) =>
            r.id === requestId
              ? {
                ...r,
                status: "rechazado" as const,
                reviewedBy: "Dueña (Super Admin)",
                reviewedAt: formattedDate,
                reviewNotes: notes || "Denegado por Dirección. Se mantiene el registro activo.",
              }
              : r,
          );

          return {
            deletionRequests: updatedRequests,
            syncQueue: [...s.syncQueue, queueItem(`Solicitud de eliminación denegada por Dirección`)],
          };
        }),
    }),

    {
      name: "cadencia-app-v16",
      version: 16,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any, version: number) => {
        if (version < 15 || !persistedState?.adminStudents?.length || !persistedState?.schedule?.length) {
          return {
            ...persistedState,
            adminStudents: adminStudents,
            invoices: initialInvoices,
            schedule: initialSchedule,
          };
        }

        const roomMap: Record<string, string> = {
          "Sala 1": "Sala A",
          "Sala 2": "Sala B",
          "Sala 3": "Sala C",
          "Sala 4": "Sala D",
          "Sala 5": "Sala D",
        };

        const migratedSchedule = Array.isArray(persistedState?.schedule)
          ? persistedState.schedule.map((lesson: any) => ({
            ...lesson,
            room: roomMap[lesson.room] || lesson.room || "Sala A",
          }))
          : initialSchedule;

        return {
          ...persistedState,
          schedule: migratedSchedule,
        };
      },
      partialize: (s) =>
        ({
          activeRole: s.activeRole,
          isAuthenticated: s.isAuthenticated,
          currentUser: s.currentUser,
          adminStudents: s.adminStudents,
          schedule: s.schedule,
          invoices: s.invoices,
          lessons: s.lessons,
          chimeSettings: s.chimeSettings,
          studentAlerts: s.studentAlerts,
        }) as unknown as AppState,
    },
  ),
);