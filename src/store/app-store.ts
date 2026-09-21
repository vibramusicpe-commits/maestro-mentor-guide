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
  type DeletedStudentLog,
  type DeletionReasonCategory,
  VIBRA_PRICING,
  HISTORICAL_BASE_METADATA,
} from "./admin-seeds";
import { getCurrentWeekIndex } from "@/lib/calendar-utils";
import { isMatchingStudentName, resolveStudentUUID, isSameStudentId } from "@/lib/student-matching";
import type { TeacherParentNote } from "@/lib/services/teacher-notes.service";

export type { AttendanceStatus, BillingLine, Kid, Lesson, PayrollWeek, StudentRow, TeacherParentNote };
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
  DeletedStudentLog,
  DeletionReasonCategory,
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
  historicalStudents: AdminStudent[];
  rescheduleLesson: (id: string, day: WeekDay, time: string, scope?: "only-this-week" | "all", targetWeekIndex?: number, teacher?: string, room?: string, originalDateStr?: string, newDateStr?: string) => void;
  removeLessonFromSchedule: (id: string) => void;
  deleteLessonFromSchedule: (id: string) => void;
  addLessonToSchedule: (lesson: Omit<ScheduledLesson, "id">) => void;
  setStudentSchedule: (studentName: string, lessons: Omit<ScheduledLesson, "id">[]) => void;
  importScheduleFromCSV: (newLessons: ScheduledLesson[]) => void;
  clearSchedule: () => void;
  importStudentsFromCSV: (newStudents: AdminStudent[]) => void;
  clearStudents: () => void;
  resetToOfficialStudents: () => void;
  addNewStudent: (newSt: Omit<AdminStudent, "id" | "risk" | "joinedAt" | "attendanceRate" | "makeupCredits" | "balance" | "recentAttendance" | "teacherNote">) => void;
  deletedStudents: DeletedStudentLog[];
  deleteStudent: (id: string, reasonCategory?: DeletionReasonCategory, reasonText?: string, deletedBy?: string) => void;
  deleteStudents: (ids: string[], reasonCategory?: DeletionReasonCategory, reasonText?: string, deletedBy?: string) => void;
  restoreDeletedStudent: (logId: string) => void;
  updateStudentDetails: (id: string, updates: Partial<AdminStudent>) => void;
  updateLessonCategory: (id: string, category: AgeCategory) => void;
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
  setStudentSessionAttendance: (
    studentName: string,
    lessonId: string,
    weekIndex: number,
    status: "presente" | "ausente" | "tarde" | "justificada" | "pendiente",
    notes?: string,
    dateStr?: string
  ) => void;
  bulkRegularizeStudentAttendance: (
    studentName: string,
    attendances: Array<{
      lessonId: string;
      weekIndex: number;
      status: "presente" | "ausente" | "tarde" | "justificada" | "pendiente";
      dateStr?: string;
    }>
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
    weekIndex?: number;
    year?: number;
    month?: number;
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
  hydrateFromBackend: (data: {
    students?: AdminStudent[];
    invoices?: Invoice[];
    attendanceLogs?: any[];
  }) => void;

  // Moderación de Notas Pedagógicas de Profesores para Familias
  teacherNotes: TeacherParentNote[];
  addOrUpdateTeacherNote: (note: TeacherParentNote) => void;
  setTeacherNotes: (notes: TeacherParentNote[]) => void;
};

// Crea un item de cola optimista que se vacía solo (simula la escritura en backend).
function queueItem(label: string): SyncItem {
  const id = `q-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  setTimeout(() => {
    useAppStore.getState().flushSync(id);
  }, 1500);
  return { id, label };
}

// Helper para generar UUIDs estándar RFC4122 v4
function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Persiste alumnos nuevos en Insforge PostgreSQL de forma resiliente
function backgroundCreateStudentInDB(role: Role, student: AdminStudent) {
  try {
    if (typeof window === "undefined") return;

    import("@/lib/services/students.service").then(async ({ createStudent, updateStudent }) => {
      const teacherIdMap: Record<string, string> = {
        Jeremy: "00000000-0000-0000-0000-000000000003",
        Fernando: "00000000-0000-0000-0000-000000000004",
        Nathaly: "00000000-0000-0000-0000-000000000005",
        Demo: "00000000-0000-0000-0000-000000000006",
        "Profesor Demo": "00000000-0000-0000-0000-000000000006",
      };

      let assigned_teacher_id: string | null = null;
      if (student.teacher) {
        const cleanT = student.teacher
          .replace(/^prof\.\s*/i, "")
          .replace(/\s*\(.*?\)/, "")
          .trim()
          .toLowerCase();
        if (cleanT.includes("jeremy")) assigned_teacher_id = "00000000-0000-0000-0000-000000000003";
        else if (cleanT.includes("fernando")) assigned_teacher_id = "00000000-0000-0000-0000-000000000004";
        else if (cleanT.includes("nathaly")) assigned_teacher_id = "00000000-0000-0000-0000-000000000005";
        else if (cleanT.includes("demo")) assigned_teacher_id = "00000000-0000-0000-0000-000000000006";
        else if (teacherIdMap[student.teacher]) assigned_teacher_id = teacherIdMap[student.teacher];
      }

      // Modality compatible con enum PostgreSQL lesson_modality_enum
      const dbModality = student.modality === "Intensivo (4 clases / 90 min)"
        ? "Intensivo (4 clases / 90 min)"
        : "Regular (8 clases / 45 min)";

      const ecData: Record<string, any> = {
        ...(typeof student.emergencyContact === "object" ? student.emergencyContact : {}),
        name: student.emergencyContact?.name || student.family || student.name,
        phone: student.phone || student.emergencyContact?.phone || "",
        relation: student.emergencyContact?.relation || "Apoderado",
        family: student.family || "",
        email: student.email || "",
        teacher: student.teacher,
        modality: student.modality,
        planType: student.planType || "Mensual",
        planPrice: student.planPrice ?? 297,
        amountPaid: student.amountPaid ?? 297,
        balance: student.balance ?? 0,
        packageTotalSessions: student.packageTotalSessions || (student.modality?.includes("Intensivo") ? 4 : 8),
        matriculaType: student.matriculaType || "Promo Demo (S/ 30)",
        enrollmentDate: student.enrollmentDate || new Date().toISOString().slice(0, 10),
        paymentMethod: student.paymentMethod || "Yape / Plin",
        packUtilesPaid: student.packUtilesPaid !== undefined ? student.packUtilesPaid : true,
        packUtilesCost: student.packUtilesCost ?? 67,
        packUtilesAmountPaid: student.packUtilesAmountPaid !== undefined ? student.packUtilesAmountPaid : (student.packUtilesPaid === false ? 0 : 67),
        packUtilesStatus: student.packUtilesStatus || (student.packUtilesPaid === false ? "pendiente" : "cancelado"),
        packUtilesDelivered: student.packUtilesDelivered !== undefined ? student.packUtilesDelivered : (student.packUtilesPaid !== false),
        packUtilesNotes: student.packUtilesNotes || "",
        planStartDate: student.planStartDate || new Date().toISOString().slice(0, 10),
        planEndDate: student.planEndDate,
        planStartMonth: student.planStartMonth,
        planEndMonth: student.planEndMonth,
        age: student.age,
        ageCategory: student.ageCategory,
        fatherName: student.fatherName,
        fatherPhone: student.fatherPhone,
        motherName: student.motherName,
        motherPhone: student.motherPhone,
        teacherNote: student.teacherNote,
        recentAttendance: student.recentAttendance || [],
        scheduleLessons: Array.isArray(student.scheduleLessons) ? student.scheduleLessons : undefined,
      };

      const resolvedStudentUUID = resolveStudentUUID(student.id) || (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(student.id)
          ? student.id.toLowerCase()
          : generateUUID()
      );

      const payload: any = {
        id: resolvedStudentUUID,
        full_name: student.name,
        instrument: student.instrument || "Piano",
        level: student.level || "Nivel 1",
        status: student.status || "activo",
        modality: dbModality,
        attendance_rate: student.attendanceRate ?? 0,
        makeup_credits: student.makeupCredits ?? 0,
        notes: student.teacherNote || "",
        emergency_contact: ecData,
      };

      if (assigned_teacher_id) {
        payload.assigned_teacher_id = assigned_teacher_id;
      }
      let normalizedBirthdate: string | undefined = undefined;
      if (student.birthdate) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(student.birthdate)) {
          normalizedBirthdate = student.birthdate;
        } else {
          const dmyMatch = student.birthdate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (dmyMatch) {
            normalizedBirthdate = `${dmyMatch[3]}-${dmyMatch[2]!.padStart(2, "0")}-${dmyMatch[1]!.padStart(2, "0")}`;
          }
        }
      }
      if (normalizedBirthdate) {
        payload.birthdate = normalizedBirthdate;
        ecData.birthdate = normalizedBirthdate;
      }

      const syncRole: Role = role === "super_admin" || role === "staff" ? role : "staff";
      try {
        await createStudent(syncRole, payload);
        console.log(`[Insforge Sync] Alumno nuevo ${student.name} (${payload.id}) creado exitosamente en PostgreSQL`);
      } catch (err) {
        console.warn(`[Insforge Sync] Aviso al crear alumno ${student.name} en PostgreSQL, aplicando fallback PATCH:`, err);
        updateStudent(syncRole, payload.id, payload).catch(() => {});
      }
    }).catch(() => {});
  } catch {}
}

// Persiste recibos nuevos y pagos iniciales en Insforge PostgreSQL
function backgroundCreateInvoiceInDB(role: Role, invoice: Invoice, student: AdminStudent) {
  try {
    if (typeof window === "undefined") return;

    import("@/lib/services/invoices.service").then(async ({ createInvoice }) => {
      const resolvedStudentUUID = resolveStudentUUID(student.id);
      const familyId = resolvedStudentUUID
        ? resolvedStudentUUID.replace(/^00000000-0000-0000-0002-/, "00000000-0000-0000-0001-")
        : undefined;

      // 1. Asegurar registro en families antes de crear la factura (FK estricta)
      if (familyId) {
        try {
          const { postgrestInsert, postgrestSelect } = await import("@/lib/insforge");
          const existingFamilies = await postgrestSelect("families", { id: `eq.${familyId}` });
          if (!existingFamilies || existingFamilies.length === 0) {
            await postgrestInsert("families", {
              id: familyId,
              family_name: student.family || `Familia ${student.name}`,
              primary_guardian_name: student.emergencyContact?.name || student.name,
              primary_guardian_phone: student.emergencyContact?.phone || student.phone?.trim() || "987654321",
              email: student.emergencyContact?.email || student.email?.trim() || `alumno_${student.id.slice(0, 8)}@vibramusic.pe`,
            });
          }
        } catch (fErr) {
          console.warn("[Insforge Sync] Aviso al asegurar familia:", fErr);
        }
      }

      // 2. Insertar factura en tabla invoices de PostgreSQL
      const syncRole: Role = role === "super_admin" || role === "staff" ? role : "staff";
      const dbMethod: any = invoice.paymentMethod === "Yape / Plin" || invoice.paymentMethod === "Yape" || invoice.paymentMethod === "Plin"
        ? "Yape"
        : (invoice.paymentMethod === "Efectivo" ? "Efectivo" : (invoice.paymentMethod?.includes("Tarjeta") || invoice.paymentMethod?.includes("Culqi") ? "Culqi" : "Transferencia"));

      try {
        await createInvoice(syncRole, {
          id: invoice.id,
          family_id: familyId,
          concept: invoice.concept,
          amount: invoice.amount,
          amount_paid: invoice.amountPaid || 0,
          remaining_balance: invoice.remainingBalance ?? Math.max(0, invoice.amount - (invoice.amountPaid || 0)),
          due_date: invoice.dueDate,
          status: invoice.status as any,
          payment_method: dbMethod,
        });
        console.log(`[Insforge Sync] Recibo ${invoice.id} creado en PostgreSQL`);

        // 3. Si hubo pago inicial, persistir en payment_audit_logs
        if (invoice.amountPaid && invoice.amountPaid > 0) {
          const { postgrestInsert } = await import("@/lib/insforge");
          await postgrestInsert("payment_audit_logs", {
            invoice_id: invoice.id,
            registered_by_role: syncRole,
            amount: invoice.amountPaid,
            payment_method: dbMethod,
            voucher_reference: "ABONO-MATRICULA",
            note: `Abono inicial al matricular (${student.planType || "Mensual"})`,
          });
        }
      } catch (err) {
        console.warn(`[Insforge Sync] Error creando recibo ${invoice.id} en PostgreSQL:`, err);
      }
    }).catch(() => {});
  } catch {}
}

// Mapa de timers y actualizaciones pendientes para debounce por alumno
const pendingStudentUpdates = new Map<string, Partial<AdminStudent>>();
const syncDebounceTimers = new Map<string, any>();

function performSyncStudentToDB(role: Role, studentId: string, updates: Partial<AdminStudent>) {
  try {
    if (typeof window === "undefined") return;
    const currentStudent = useAppStore.getState().adminStudents.find((st) => isSameStudentId(st.id, studentId));
    const resolvedStudentId = resolveStudentUUID(studentId);
    if (!resolvedStudentId) {
      if (currentStudent) {
        backgroundCreateStudentInDB(role, currentStudent);
      }
      return;
    }

    import("@/lib/services/students.service").then(({ updateStudent, updateFamily }) => {
      // Combinar alumno actual con las actualizaciones para preservar integridad de datos
      const mergedStudent: Partial<AdminStudent> = {
        ...currentStudent,
        ...updates,
      };

      const payload: Record<string, unknown> = {};
      if (mergedStudent.name) payload.full_name = mergedStudent.name;
      if (mergedStudent.instrument) payload.instrument = mergedStudent.instrument;
      if (mergedStudent.level) payload.level = mergedStudent.level;
      if (mergedStudent.status) payload.status = mergedStudent.status;
      if (mergedStudent.modality) {
        // La columna SQL 'modality' usa el enum lesson_modality_enum ('Regular (8 clases / 45 min)' | 'Intensivo (4 clases / 90 min)')
        payload.modality = mergedStudent.modality === "Intensivo (4 clases / 90 min)"
          ? "Intensivo (4 clases / 90 min)"
          : "Regular (8 clases / 45 min)";
      }
      if (mergedStudent.teacherNote !== undefined) payload.notes = mergedStudent.teacherNote;
      if (mergedStudent.attendanceRate !== undefined) payload.attendance_rate = mergedStudent.attendanceRate;
      if (mergedStudent.makeupCredits !== undefined) payload.makeup_credits = mergedStudent.makeupCredits;

      // Mapear profesor oficial a assigned_teacher_id de forma robusta
      const teacherIdMap: Record<string, string> = {
        Jeremy: "00000000-0000-0000-0000-000000000003",
        Fernando: "00000000-0000-0000-0000-000000000004",
        Nathaly: "00000000-0000-0000-0000-000000000005",
        Demo: "00000000-0000-0000-0000-000000000006",
        "Profesor Demo": "00000000-0000-0000-0000-000000000006",
      };
      const teacherToUse = mergedStudent.teacher;
      if (teacherToUse) {
        const cleanT = teacherToUse
          .replace(/^prof\.\s*/i, "")
          .replace(/\s*\(.*?\)/, "")
          .trim();
        if (cleanT.toLowerCase().includes("jeremy")) {
          payload.assigned_teacher_id = "00000000-0000-0000-0000-000000000003";
        } else if (cleanT.toLowerCase().includes("fernando")) {
          payload.assigned_teacher_id = "00000000-0000-0000-0000-000000000004";
        } else if (cleanT.toLowerCase().includes("nathaly")) {
          payload.assigned_teacher_id = "00000000-0000-0000-0000-000000000005";
        } else if (cleanT.toLowerCase().includes("demo")) {
          payload.assigned_teacher_id = "00000000-0000-0000-0000-000000000006";
        } else if (teacherIdMap[teacherToUse]) {
          payload.assigned_teacher_id = teacherIdMap[teacherToUse];
        }
      }

      // Validar y normalizar formato de fecha de nacimiento (YYYY-MM-DD) para columna SQL date
      let normalizedBirthdate: string | undefined = undefined;
      if (mergedStudent.birthdate) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(mergedStudent.birthdate)) {
          normalizedBirthdate = mergedStudent.birthdate;
        } else {
          const dmyMatch = mergedStudent.birthdate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (dmyMatch) {
            normalizedBirthdate = `${dmyMatch[3]}-${dmyMatch[2]!.padStart(2, "0")}-${dmyMatch[1]!.padStart(2, "0")}`;
          }
        }
      }
      if (normalizedBirthdate) {
        payload.birthdate = normalizedBirthdate;
      }

      // Persistir metadatos extendidos en columna JSONB emergency_contact
      const ecData: Record<string, any> = {
        ...(typeof currentStudent?.emergencyContact === "object" ? currentStudent.emergencyContact : {}),
        ...(typeof updates.emergencyContact === "object" ? updates.emergencyContact : {}),
      };

      if (mergedStudent.phone) ecData.phone = mergedStudent.phone;
      if (mergedStudent.email) ecData.email = mergedStudent.email;
      if (mergedStudent.family) ecData.family = mergedStudent.family;
      if (mergedStudent.teacher) ecData.teacher = mergedStudent.teacher;
      if (mergedStudent.birthdate) ecData.birthdate = normalizedBirthdate || mergedStudent.birthdate;
      if (mergedStudent.age !== undefined) ecData.age = mergedStudent.age;
      if (mergedStudent.ageCategory) ecData.ageCategory = mergedStudent.ageCategory;
      if (mergedStudent.fatherName !== undefined) ecData.fatherName = mergedStudent.fatherName;
      if (mergedStudent.fatherPhone !== undefined) ecData.fatherPhone = mergedStudent.fatherPhone;
      if (mergedStudent.motherName !== undefined) ecData.motherName = mergedStudent.motherName;
      if (mergedStudent.motherPhone !== undefined) ecData.motherPhone = mergedStudent.motherPhone;
      if (mergedStudent.planType) ecData.planType = mergedStudent.planType;
      if (mergedStudent.planPrice !== undefined) ecData.planPrice = mergedStudent.planPrice;
      if (mergedStudent.amountPaid !== undefined) ecData.amountPaid = mergedStudent.amountPaid;
      if (mergedStudent.balance !== undefined) ecData.balance = mergedStudent.balance;
      if (mergedStudent.packageTotalSessions !== undefined) ecData.packageTotalSessions = mergedStudent.packageTotalSessions;
      if (mergedStudent.modality) ecData.modality = mergedStudent.modality;
      if (mergedStudent.matriculaType) ecData.matriculaType = mergedStudent.matriculaType;
      if (mergedStudent.enrollmentDate !== undefined) ecData.enrollmentDate = mergedStudent.enrollmentDate;
      if (mergedStudent.paymentMethod !== undefined) ecData.paymentMethod = mergedStudent.paymentMethod;
      if (mergedStudent.packUtilesPaid !== undefined) ecData.packUtilesPaid = mergedStudent.packUtilesPaid;
      if (mergedStudent.packUtilesCost !== undefined) ecData.packUtilesCost = mergedStudent.packUtilesCost;
      if (mergedStudent.packUtilesAmountPaid !== undefined) ecData.packUtilesAmountPaid = mergedStudent.packUtilesAmountPaid;
      if (mergedStudent.packUtilesStatus !== undefined) ecData.packUtilesStatus = mergedStudent.packUtilesStatus;
      if (mergedStudent.packUtilesDelivered !== undefined) ecData.packUtilesDelivered = mergedStudent.packUtilesDelivered;
      if (mergedStudent.packUtilesNotes !== undefined) ecData.packUtilesNotes = mergedStudent.packUtilesNotes;
      if (mergedStudent.planStartDate) ecData.planStartDate = mergedStudent.planStartDate;
      if (mergedStudent.planEndDate) ecData.planEndDate = mergedStudent.planEndDate;
      if (mergedStudent.planStartMonth) ecData.planStartMonth = mergedStudent.planStartMonth;
      if (mergedStudent.planEndMonth) ecData.planEndMonth = mergedStudent.planEndMonth;
      if (mergedStudent.attendanceRate !== undefined) ecData.attendanceRate = mergedStudent.attendanceRate;
      if (mergedStudent.recentAttendance !== undefined) ecData.recentAttendance = mergedStudent.recentAttendance;
      if (mergedStudent.scheduleLessons !== undefined) ecData.scheduleLessons = mergedStudent.scheduleLessons;

      payload.emergency_contact = ecData;

      const syncRole: Role = role === "super_admin" || role === "staff" ? role : "staff";
      updateStudent(syncRole, resolvedStudentId, payload)
        .then((res) => {
          if (!res || !res.id) {
            if (currentStudent) {
              backgroundCreateStudentInDB(role, currentStudent);
            }
          } else {
            console.log(`[Insforge Sync] Alumno ${resolvedStudentId} (${mergedStudent.name}) sincronizado en PostgreSQL`);
          }
        })
        .catch((err) => {
          console.warn(`[Insforge Sync] Error sincronizando alumno ${resolvedStudentId}, intentando create:`, err);
          if (currentStudent) {
            backgroundCreateStudentInDB(role, currentStudent);
          }
        });

      // Sincronizar familia asociada en tabla families de PostgreSQL
      const familyId = resolvedStudentId.replace(
        /^00000000-0000-0000-0002-/,
        "00000000-0000-0000-0001-",
      );
      if (familyId !== resolvedStudentId) {
        const famPayload: Record<string, string> = {};
        if (mergedStudent.family) famPayload.family_name = mergedStudent.family;
        if (mergedStudent.email) famPayload.email = mergedStudent.email;
        if (mergedStudent.phone) famPayload.primary_guardian_phone = mergedStudent.phone;
        if (Object.keys(famPayload).length > 0) {
          updateFamily(role, familyId, famPayload).catch(() => {});
        }
      }
    }).catch(() => {});
  } catch {}
}

// Sincronizador en segundo plano de alumnos con Insforge PostgreSQL (con Debounce inteligente)
function backgroundSyncStudentToDB(role: Role, studentId: string, updates: Partial<AdminStudent>) {
  try {
    if (typeof window === "undefined") return;

    // Acumular actualizaciones en memoria mientras se escribe
    const currentPending = pendingStudentUpdates.get(studentId) || {};
    pendingStudentUpdates.set(studentId, { ...currentPending, ...updates });

    const existingTimer = syncDebounceTimers.get(studentId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      syncDebounceTimers.delete(studentId);
      const accumulatedUpdates = pendingStudentUpdates.get(studentId) || updates;
      pendingStudentUpdates.delete(studentId);
      performSyncStudentToDB(role, studentId, accumulatedUpdates);
    }, 350);

    syncDebounceTimers.set(studentId, timer);
  } catch {
    // Si falla el timer, ejecución síncrona de respaldo
    performSyncStudentToDB(role, studentId, updates);
  }
}

// Sincronizador en segundo plano de eliminación / baja de alumnos con Insforge PostgreSQL
function backgroundDeleteStudentFromDB(role: Role, studentId: string) {
  try {
    if (typeof window === "undefined") return;
    const resolvedStudentId = resolveStudentUUID(studentId);
    if (!resolvedStudentId) return;

    import("@/lib/services/students.service").then(({ deleteStudent, updateStudent }) => {
      const syncRole: Role = role === "super_admin" || role === "staff" ? role : "staff";
      deleteStudent(syncRole, resolvedStudentId).catch(() => {
        updateStudent(syncRole, resolvedStudentId, { status: "baja" }).catch(() => {});
      });
    }).catch(() => {});
  } catch {}
}

// Sincronizador en segundo plano de bitácora de asistencias con Insforge PostgreSQL
function backgroundSyncAttendanceLogToDB(
  role: Role,
  studentId: string,
  status: "presente" | "ausente" | "tarde" | "justificada" | "pendiente",
  note?: string
) {
  try {
    if (typeof window === "undefined") return;
    const resolvedStudentId = resolveStudentUUID(studentId);
    const dateMatch = note?.match(/Fecha\s+(\d{4}-\d{2}-\d{2})/i);
    const dateStr = dateMatch ? dateMatch[1] : undefined;

    // Si se restablece a "pendiente", limpiar los logs de esa fecha en PostgreSQL
    if (status === "pendiente") {
      if (dateStr) {
        import("@/lib/insforge").then(({ postgrestDelete }) => {
          postgrestDelete("attendance_logs", {
            student_id: `eq.${resolvedStudentId}`,
            note: `like.*Fecha ${dateStr}*`,
          })
            .then(() => console.log(`[Insforge Sync] Asistencia eliminada de attendance_logs para ${resolvedStudentId} (${dateStr})`))
            .catch((err) => console.warn(`[Insforge Sync] Error eliminando attendance_log:`, err));
        }).catch(() => {});
      }
      return;
    }

    // Insforge attendance_enum acepta: 'presente', 'ausente', 'tarde', 'recuperacion'
    let dbStatus: "presente" | "ausente" | "tarde" | "recuperacion" = "presente";
    let dbNote = note || "";
    if (status === "ausente") {
      dbStatus = "ausente";
    } else if (status === "tarde") {
      dbStatus = "tarde";
    } else if (status === "justificada") {
      dbStatus = "ausente";
      dbNote = `Inasistencia justificada (+1 crédito). ${dbNote}`.trim();
    } else {
      dbStatus = "presente";
    }

    import("@/lib/insforge").then(async ({ postgrestInsert, postgrestDelete }) => {
      // Si tiene fecha exacta, primero eliminar cualquier log previo de esa misma fecha para evitar duplicados
      if (dateStr) {
        await postgrestDelete("attendance_logs", {
          student_id: `eq.${resolvedStudentId}`,
          note: `like.*Fecha ${dateStr}*`,
        }).catch(() => {});
      }
      postgrestInsert("attendance_logs", {
        student_id: resolvedStudentId,
        status: dbStatus,
        credit_delta: status === "justificada" ? 1 : 0,
        note: dbNote || null,
        registered_at: new Date().toISOString(),
      })
        .then(() => console.log(`[Insforge Sync] Asistencia guardada en attendance_logs para ${resolvedStudentId} (${status})`))
        .catch((err) => console.warn(`[Insforge Sync] Error guardando attendance_log:`, err));
    }).catch(() => {});
  } catch {}
}

// Sincronizador en segundo plano de pagos con Insforge PostgreSQL
function backgroundSyncPaymentToDB(
  role: Role,
  invoiceId: string,
  amount: number,
  method: PaymentMethod,
  voucherRef?: string,
  note?: string,
  currentInvoiceData?: { amount: number; amount_paid: number; remaining_balance: number },
) {
  try {
    if (typeof window === "undefined") return;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invoiceId);
    if (!isUUID) return;

    const email = useAppStore.getState().currentUser?.email?.toLowerCase() || "";
    let userId = "00000000-0000-0000-0000-000000000001";
    if (email.includes("sergio")) {
      userId = "00000000-0000-0000-0000-000000000007";
    } else if (email.includes("fabricio")) {
      userId = "00000000-0000-0000-0000-000000000009";
    } else if (email.includes("karla")) {
      userId = "00000000-0000-0000-0000-000000000008";
    } else if (role === "staff" || email.includes("nayeli")) {
      userId = "00000000-0000-0000-0000-000000000002";
    }

    import("@/lib/services/invoices.service").then(({ registerPayment }) => {
      const invData = currentInvoiceData || {
        amount: Math.max(297, amount),
        amount_paid: 0,
        remaining_balance: Math.max(297, amount),
      };
      const cleanMethod: any = (
        method === "Plin" || (method as string)?.includes("Yape")
          ? "Yape"
          : method === "Efectivo"
          ? "Efectivo"
          : (method as string)?.includes("Culqi") || (method as string)?.includes("Tarjeta")
          ? "Culqi"
          : "Transferencia"
      );
      registerPayment(
        role,
        userId,
        invoiceId,
        {
          amount,
          method: cleanMethod,
          voucherRef: voucherRef || undefined,
          note: note || undefined,
        },
        invData,
      )
        .then(() => console.log(`[Insforge Sync] Abono en recibo ${invoiceId} sincronizado en PostgreSQL (Usuario: ${userId})`))
        .catch((err) => console.warn(`[Insforge Sync] Error sincronizando abono ${invoiceId}:`, err));
    }).catch(() => {});
  } catch {}
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeRole: "super_admin",
      isAuthenticated: false,
      currentUser: null,
      setActiveRole: (role) => set({ activeRole: role }),
      hydrateFromBackend: (data) =>
        set((s) => {
          if (!data.students || data.students.length === 0) {
            return {
              invoices: Array.isArray(data.invoices) ? data.invoices : s.invoices,
            };
          }

          // Fusión no destructiva: PostgreSQL enriquece datos sin borrar alumnos locales ni activaciones válidas
          const mergedStudents: AdminStudent[] = [...s.adminStudents];

          data.students.forEach((dbSt) => {
            // 🛡️ REGLA: Si el registro de PostgreSQL es ACTIVO, tiene prioridad absoluta y reemplaza cualquier registro previo
            if (dbSt.status === "activo") {
              const existingIdx = mergedStudents.findIndex(
                (locSt) => isSameStudentId(locSt.id, dbSt.id) || isMatchingStudentName(locSt.name, dbSt.name)
              );

              if (existingIdx >= 0) {
                const localSt = mergedStudents[existingIdx]!;
                const keepLocalTeacher =
                  localSt.teacher &&
                  localSt.teacher !== "Prof. por Asignar" &&
                  (!dbSt.teacher || dbSt.teacher === "Prof. por Asignar");

                const isEmma = isMatchingStudentName(dbSt.name, "Emma Micaela") || isMatchingStudentName(dbSt.name, "Emma Sevilla");
                const isJonathan =
                  isMatchingStudentName(dbSt.name, "Jonathan Ticona Cachay") ||
                  isMatchingStudentName(dbSt.name, "Ticona Cachay, Jonathan");

                const effectiveStartDate = dbSt.planStartDate || localSt.planStartDate || (isEmma ? "2026-08-28" : (isJonathan ? "2026-08-18" : "2026-08-01"));
                const effectiveEndDate = dbSt.planEndDate || localSt.planEndDate || (isEmma ? "2026-09-27" : (isJonathan ? "2026-12-31" : "2026-09-30"));
                const effectivePackage = isJonathan
                  ? 24
                  : (dbSt.packageTotalSessions || localSt.packageTotalSessions || (dbSt.modality?.includes("Intensivo") ? 4 : 8));

                const hasAttendanceHistory = (localSt.recentAttendance && localSt.recentAttendance.length > 0) || (dbSt.recentAttendance && dbSt.recentAttendance.length > 0);
                let resolvedAttendanceRate = 0;
                if (hasAttendanceHistory) {
                  resolvedAttendanceRate = typeof localSt.attendanceRate === "number" && localSt.attendanceRate > 0
                    ? localSt.attendanceRate
                    : (typeof dbSt.attendanceRate === "number" ? dbSt.attendanceRate : 0);
                }

                mergedStudents[existingIdx] = {
                  ...dbSt,
                  id: dbSt.id,
                  status: "activo",
                  teacher: keepLocalTeacher ? localSt.teacher : (dbSt.teacher && dbSt.teacher !== "Prof. por Asignar" ? dbSt.teacher : localSt.teacher),
                  modality: isJonathan ? "Paquete Flexible (A demanda)" : (dbSt.modality || localSt.modality || "Regular (8 clases / 45 min)"),
                  planType: isJonathan ? "Paquete Flexible" : (dbSt.planType || localSt.planType),
                  scheduleLessons: dbSt.scheduleLessons?.length ? dbSt.scheduleLessons : localSt.scheduleLessons,
                  recentAttendance: localSt.recentAttendance?.length ? localSt.recentAttendance : dbSt.recentAttendance,
                  attendanceRate: resolvedAttendanceRate,
                  planStartDate: effectiveStartDate,
                  planEndDate: effectiveEndDate,
                  packageTotalSessions: effectivePackage,
                  amountPaid: isJonathan ? 500 : (dbSt.amountPaid !== undefined ? dbSt.amountPaid : localSt.amountPaid),
                  balance: isJonathan ? 0 : (dbSt.balance !== undefined ? dbSt.balance : localSt.balance),
                  planPrice: isJonathan ? 500 : (dbSt.planPrice !== undefined ? dbSt.planPrice : localSt.planPrice),
                  payment: isJonathan ? "al-dia" : ((dbSt.balance !== undefined && dbSt.balance > 0) ? "pendiente" : (localSt.payment || dbSt.payment || "al-dia")),
                };
                return;
              } else {
                mergedStudents.push(dbSt);
                return;
              }
            }

            // Para registros no activos (pausa, baja): jamás degradar un alumno que ya está activo
            const existingIdx = mergedStudents.findIndex((locSt) => {
              if (isSameStudentId(locSt.id, dbSt.id)) return true;
              return isMatchingStudentName(locSt.name, dbSt.name);
            });

            if (existingIdx >= 0) {
              const localSt = mergedStudents[existingIdx]!;
              if (localSt.status === "activo") return; // Mantener activo, no degradar con baja
              mergedStudents[existingIdx] = { ...localSt, ...dbSt };
            } else {
              mergedStudents.push(dbSt);
            }
          });

          // Deduplicación estricta por nombre: eliminar registros en baja/pausa que tengan un homónimo activo
          const activeNormNames = new Set(
            mergedStudents.filter((st) => st.status === "activo").map((st) => normalizeStudentName(st.name))
          );
          const cleanStudents = mergedStudents.filter((st) => {
            if (st.status === "activo") return true;
            return !Array.from(activeNormNames).some((act) => isMatchingStudentName(act, st.name));
          });

          // Ordenar siempre los alumnos activos al inicio para que cualquier búsqueda devuelva el perfil activo
          cleanStudents.sort((a, b) => (b.status === "activo" ? 1 : 0) - (a.status === "activo" ? 1 : 0));

          // Rehidratar y sincronizar el horario (schedule) con los alumnos activos
          const activeStudents = cleanStudents.filter((st) => st.status === "activo");
          const activeNames = activeStudents.map((st) => st.name);

          const scheduleMap = new Map<string, ScheduledLesson>();

          // 1. Conservar clases existentes en memoria local si corresponden a alumnos activos
          (s.schedule || []).forEach((l) => {
            if (l.status !== "cancelada" && activeNames.some((actName) => isMatchingStudentName(actName, l.student))) {
              scheduleMap.set(l.id, l);
            }
          });

          // 2. Fusionar clases persistidas en PostgreSQL (emergency_contact.scheduleLessons)
          activeStudents.forEach((st) => {
            if (Array.isArray(st.scheduleLessons) && st.scheduleLessons.length > 0) {
              st.scheduleLessons.forEach((l) => {
                const lessonId = l.id || `db-sch-${st.id}-${l.day}-${l.time}${l.dateStr ? `-${l.dateStr}` : ""}`;
                // Las clases semanales recurrentes regulares no deben estar bloqueadas a un solo mes
                const isRecurringTemplate = l.weekIndex === undefined;
                scheduleMap.set(lessonId, {
                  ...l,
                  id: lessonId,
                  student: st.name,
                  teacher: l.teacher || st.teacher,
                  instrument: l.instrument || st.instrument,
                  month: isRecurringTemplate ? undefined : l.month,
                });
              });
            }
          });

          // 3. Garantizar que alumnos activos oficiales de planta (Camila Pastor, Marco Antonio, etc.)
          // tengan sus clases oficiales desde initialSchedule si aún no estuvieran en el horario
          (initialSchedule || []).forEach((l) => {
            if (l.status !== "cancelada") {
              const matchedActive = activeStudents.find((actSt) => isMatchingStudentName(actSt.name, l.student));
              if (matchedActive) {
                // Si el alumno activo ya cuenta con scheduleLessons explícitas en su ficha, respetarlas
                if (matchedActive.scheduleLessons && matchedActive.scheduleLessons.length > 0) return;

                const alreadyScheduled = Array.from(scheduleMap.values()).some(
                  (existing) =>
                    existing.id === l.id ||
                    (isMatchingStudentName(existing.student, matchedActive.name) &&
                     existing.day === l.day &&
                     existing.time === l.time &&
                     (existing.weekIndex === l.weekIndex || existing.weekIndex === undefined || l.weekIndex === undefined))
                );
                if (!alreadyScheduled) {
                  scheduleMap.set(l.id, {
                    ...l,
                    student: matchedActive.name,
                    teacher: l.teacher || matchedActive.teacher,
                    instrument: l.instrument || matchedActive.instrument,
                  });
                }
              }
            }
          });

          // 4. Rehidratar asistencias reales históricas desde attendance_logs en PostgreSQL
          if (data.attendanceLogs && data.attendanceLogs.length > 0) {
            data.attendanceLogs.forEach((log: any) => {
              if (!log.student_id) return;
              const matchedStudent = cleanStudents.find(
                (st) =>
                  st.status === "activo" &&
                  (resolveStudentUUID(st.id) === log.student_id ||
                   isSameStudentId(st.id, log.student_id) ||
                   (log.note && isMatchingStudentName(st.name, log.note)))
              );
              if (matchedStudent) {
                const dateMatch = log.note?.match(/Fecha\s+(\d{4}-\d{2}-\d{2})/i);
                const dateStr = dateMatch ? dateMatch[1] : log.registered_at?.slice(0, 10);
                if (dateStr) {
                  let attStatus: "presente" | "ausente" | "tarde" | "justificada" = "presente";
                  if (log.status === "ausente") {
                    attStatus = log.credit_delta > 0 ? "justificada" : "ausente";
                  } else if (log.status === "tarde") {
                    attStatus = "tarde";
                  } else {
                    attStatus = "presente";
                  }

                  scheduleMap.forEach((lesson, lId) => {
                    if (isMatchingStudentName(lesson.student, matchedStudent.name)) {
                      const prevByDate = { ...(lesson.attendanceByDate || {}) };
                      prevByDate[dateStr] = attStatus;
                      scheduleMap.set(lId, {
                        ...lesson,
                        attendanceByDate: prevByDate,
                      });
                    }
                  });

                  if (Array.isArray(matchedStudent.scheduleLessons)) {
                    matchedStudent.scheduleLessons = matchedStudent.scheduleLessons.map((l) => {
                      const prevByDate = { ...(l.attendanceByDate || {}) };
                      prevByDate[dateStr] = attStatus;
                      return {
                        ...l,
                        attendanceByDate: prevByDate,
                      };
                    });
                  }
                }
              }
            });
          }

          const cleanSchedule = Array.from(scheduleMap.values());

          // Fusión inteligente de recibos: PostgreSQL es fuente de verdad, preservando
          // recibos locales de alumnos activos recién creados o en vuelo
          const mergedInvoices: Invoice[] = Array.isArray(data.invoices) ? [...data.invoices] : [...s.invoices];
          (s.invoices || []).forEach((localInv) => {
            const alreadyInMerged = mergedInvoices.some((inv) => inv.id === localInv.id);
            if (!alreadyInMerged) {
              const studentName = localInv.student || (localInv.concept?.includes("—") ? localInv.concept.split("—")[1]?.trim() : "");
              if (studentName && cleanStudents.some((st) => st.status === "activo" && isMatchingStudentName(st.name, studentName))) {
                mergedInvoices.push(localInv);
              }
            }
          });

          return {
            adminStudents: cleanStudents,
            schedule: cleanSchedule,
            invoices: mergedInvoices,
          };
        }),
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
              (email.toLowerCase().includes("sergio")
                ? "Sergio (Dirección)"
                : email.toLowerCase().includes("fabricio")
                ? "Fabricio (Marketing)"
                : email.toLowerCase().includes("karla")
                ? "Karla (Secretaría)"
                : email.toLowerCase().includes("fernando")
                ? "Fernando (Violín y Piano)"
                : email.toLowerCase().includes("nathaly")
                ? "Nathaly (Canto y Piano Infantil)"
                : email.toLowerCase().includes("jeremy")
                ? "Jeremy (Guitarra y Batería)"
                : role === "super_admin"
                ? "Rocío (Dueña)"
                : role === "staff"
                ? "Nayeli (Secretaría)"
                : role === "teacher"
                ? (email.toLowerCase().includes("fernando") ? "Fernando (Violín y Piano)" : email.toLowerCase().includes("nathaly") ? "Nathaly (Canto y Piano Infantil)" : "Jeremy (Guitarra y Batería)")
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
      historicalStudents: adminStudents,
      historicalMetadata: HISTORICAL_BASE_METADATA,
      deletedStudents: [],
      invoices: initialInvoices,
      rescheduleLesson: (
        id,
        day,
        time,
        scope = "only-this-week",
        targetWeekIndex,
        teacher,
        room,
        originalDateStr,
        newDateStr
      ) =>
        set((s) => {
          const targetLesson = s.schedule.find((l) => l.id === id);
          if (!targetLesson) return s;

          const newTeacher = teacher || targetLesson.teacher;
          const newRoom = room || targetLesson.room;

          if (scope === "only-this-week") {
            const excludedWeeks = targetLesson.excludedWeeks || [];
            const excludedDates = targetLesson.excludedDates || [];

            const updatedOriginal: ScheduledLesson = {
              ...targetLesson,
              excludedWeeks: targetWeekIndex !== undefined
                ? Array.from(new Set([...excludedWeeks, targetWeekIndex]))
                : excludedWeeks,
              excludedDates: originalDateStr
                ? Array.from(new Set([...excludedDates, originalDateStr]))
                : excludedDates,
            };

            const newSingleWeekLesson: ScheduledLesson = {
              ...targetLesson,
              id: `sch-resched-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              day: day,
              time: time,
              teacher: newTeacher,
              room: newRoom,
              dateStr: newDateStr, // Fecha exacta YYYY-MM-DD
              weekIndex: newDateStr ? undefined : targetWeekIndex,
              excludedWeeks: undefined,
              excludedDates: undefined,
              attendanceStatus: undefined,
              attendanceByWeek: undefined,
              attendanceByDate: undefined,
              isMakeup: true,
              recoveringLessonDate: originalDateStr,
            };

            const updatedSchedule = [
              ...s.schedule.map((l) => (l.id === id ? updatedOriginal : l)),
              newSingleWeekLesson,
            ];

            // Sincronizar en adminStudents.scheduleLessons para el alumno activo
            const targetSt = s.adminStudents.find((st) => isMatchingStudentName(st.name, targetLesson.student));
            let updatedAdminStudents = s.adminStudents;
            if (targetSt) {
              const currentLessons = targetSt.scheduleLessons || [];
              const updatedPersisted = [
                ...currentLessons.map((l) => (l.id === id ? updatedOriginal : l)),
                newSingleWeekLesson,
              ];
              updatedAdminStudents = s.adminStudents.map((st) =>
                isSameStudentId(st.id, targetSt.id) ? { ...st, scheduleLessons: updatedPersisted } : st
              );
              backgroundSyncStudentToDB(s.activeRole, targetSt.id, { scheduleLessons: updatedPersisted });
            }

            return {
              schedule: updatedSchedule,
              adminStudents: updatedAdminStudents,
              syncQueue: [
                ...s.syncQueue,
                queueItem(
                  `Clase reprogramada: ${originalDateStr || targetLesson.day} ➔ ${newDateStr || day} ${time}`,
                ),
              ],
            };
          }

          // Por defecto: Aplica a todo el mes (las 4 o 5 semanas)
          const updatedSchedule = s.schedule.map((l) => {
            if (l.id === id) {
              const { weekIndex, excludedWeeks, excludedDates, dateStr, ...rest } = l;
              return {
                ...rest,
                day,
                time,
                teacher: newTeacher,
                room: newRoom,
                excludedWeeks: [],
                excludedDates: [],
              };
            }
            return l;
          });

          const targetSt = s.adminStudents.find((st) => isMatchingStudentName(st.name, targetLesson.student));
          let updatedAdminStudents = s.adminStudents;
          if (targetSt) {
            const currentLessons = targetSt.scheduleLessons || [];
            const updatedPersisted = currentLessons.map((l) =>
              l.id === id ? { ...l, day, time, teacher: newTeacher, room: newRoom } : l
            );
            updatedAdminStudents = s.adminStudents.map((st) =>
              isSameStudentId(st.id, targetSt.id) ? { ...st, scheduleLessons: updatedPersisted } : st
            );
            backgroundSyncStudentToDB(s.activeRole, targetSt.id, { scheduleLessons: updatedPersisted });
          }

          return {
            schedule: updatedSchedule,
            adminStudents: updatedAdminStudents,
            syncQueue: [
              ...s.syncQueue,
              queueItem(`Horario permanente actualizado a ${day} ${time}`),
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
          const updatedSchedule = [...s.schedule, newLesson];
          const targetSt = s.adminStudents.find(
            (st) => isMatchingStudentName(st.name, lesson.student) || st.name.toLowerCase() === lesson.student.toLowerCase()
          );
          let updatedStudents = s.adminStudents;
          if (targetSt) {
            const studentLessons = updatedSchedule.filter(
              (l) => (isMatchingStudentName(l.student, targetSt.name) || l.student.toLowerCase() === targetSt.name.toLowerCase()) && l.status !== "cancelada"
            );
            backgroundSyncStudentToDB(s.activeRole, targetSt.id, {
              scheduleLessons: studentLessons,
            });
            updatedStudents = s.adminStudents.map((st) =>
              isSameStudentId(st.id, targetSt.id) ? { ...st, scheduleLessons: studentLessons } : st
            );
          }
          return {
            adminStudents: updatedStudents,
            schedule: updatedSchedule,
            syncQueue: [...s.syncQueue, queueItem(`Clase programada: ${lesson.student} (${lesson.day} ${lesson.time})`)],
          };
        }),
      setStudentSchedule: (studentName, lessons) =>
        set((s) => {
          const filtered = s.schedule.filter(
            (l) => !isMatchingStudentName(l.student, studentName) && l.student.toLowerCase() !== studentName.toLowerCase()
          );
          const newLessons: ScheduledLesson[] = lessons.map((lesson) => ({
            ...lesson,
            id: `sch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          }));
          const finalSchedule = [...filtered, ...newLessons];
          const targetSt = s.adminStudents.find(
            (st) => isMatchingStudentName(st.name, studentName) || st.name.toLowerCase() === studentName.toLowerCase()
          );
          let updatedStudents = s.adminStudents;
          if (targetSt) {
            backgroundSyncStudentToDB(s.activeRole, targetSt.id, {
              scheduleLessons: newLessons,
            });
            updatedStudents = s.adminStudents.map((st) =>
              isMatchingStudentName(st.name, studentName) || st.name.toLowerCase() === studentName.toLowerCase()
                ? { ...st, scheduleLessons: newLessons }
                : st
            );
          }
          return {
            adminStudents: updatedStudents,
            schedule: finalSchedule,
            syncQueue: [
              ...s.syncQueue,
              queueItem(`Horario actualizado para ${studentName}: ${newLessons.length} clases programadas`),
            ],
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
      addNewStudent: (newSt) =>
        set((s) => {
          const id = generateUUID();
          const planPrice = newSt.planPrice || 297;
          const amountPaid = newSt.amountPaid !== undefined ? newSt.amountPaid : planPrice;
          const planBalance = Math.max(0, planPrice - amountPaid);
          const bookCost = newSt.packUtilesCost ?? 67;
          const bookStatus = newSt.packUtilesStatus || (newSt.packUtilesPaid === false ? "pendiente" : "cancelado");
          const bookPaid = newSt.packUtilesAmountPaid !== undefined
            ? newSt.packUtilesAmountPaid
            : (bookStatus === "cancelado" ? bookCost : 0);
          const bookBalance = bookStatus === "exonerado" ? 0 : Math.max(0, bookCost - bookPaid);
          const totalBalance = newSt.balance !== undefined ? newSt.balance : (planBalance + bookBalance);
          const fullStudent: AdminStudent = {
            ...newSt,
            id,
            planPrice,
            amountPaid,
            balance: totalBalance,
            payment: totalBalance > 0 ? "pendiente" : "al-dia",
            risk: 10,
            joinedAt: newSt.joinedAt || "Set 2026",
            attendanceRate: newSt.attendanceRate !== undefined ? newSt.attendanceRate : 0,
            makeupCredits: newSt.makeupCredits || 0,
            recentAttendance: newSt.recentAttendance || [],
            teacherNote: newSt.teacherNote || "",
            enrollmentDate: newSt.enrollmentDate || new Date().toISOString().slice(0, 10),
            paymentMethod: newSt.paymentMethod || "Yape / Plin",
            packUtilesCost: bookCost,
            packUtilesAmountPaid: bookPaid,
            packUtilesStatus: bookStatus,
            packUtilesDelivered: newSt.packUtilesDelivered !== undefined ? newSt.packUtilesDelivered : (bookStatus === "cancelado"),
            packUtilesNotes: newSt.packUtilesNotes || "",
          };
          backgroundCreateStudentInDB(s.activeRole, fullStudent);

          const newInvStatus = planBalance === 0 ? ("pagado" as const) : (amountPaid > 0 ? ("parcial" as const) : ("pendiente" as const));
          const studentInvoice: Invoice = {
            id: generateUUID(),
            family: fullStudent.family,
            student: fullStudent.name,
            phone: fullStudent.phone,
            concept: `Plan ${fullStudent.planType || "Mensual"} (${fullStudent.instrument}) — ${fullStudent.name}`,
            amount: planPrice,
            amountPaid: amountPaid,
            remainingBalance: planBalance,
            dueDate: fullStudent.enrollmentDate || new Date().toISOString().slice(0, 10),
            daysToDue: 10,
            status: newInvStatus,
            paymentMethod: (fullStudent.paymentMethod as any) || "Yape",
            paymentLogs: amountPaid > 0 ? [{
              id: `log-${Date.now()}`,
              timestamp: new Date().toLocaleString("es-PE"),
              registeredBy: s.activeRole === "staff" ? "Secretaría (Nayeli)" : "Dirección (Dueña)",
              amount: amountPaid,
              method: (fullStudent.paymentMethod as any) || "Yape",
              voucherRef: "ABONO-MATRICULA",
              paymentTime: new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
              note: `Abono inicial al matricular (${fullStudent.planType || "Mensual"})`,
            }] : [],
          };
          backgroundCreateInvoiceInDB(s.activeRole, studentInvoice, fullStudent);

          return {
            adminStudents: [fullStudent, ...s.adminStudents],
            invoices: [studentInvoice, ...s.invoices],
            syncQueue: [...s.syncQueue, queueItem(`Nuevo alumno matriculado: ${newSt.name} (${newSt.instrument})`)],
          };
        }),
      resetToOfficialStudents: () => {
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            for (let i = 1; i <= 30; i++) {
              window.localStorage.removeItem(`cadencia-app-v${i}`);
            }
          }
        } catch {}
        set((s) => ({
          adminStudents: adminStudents,
          invoices: initialInvoices,
          schedule: initialSchedule,
          syncQueue: [...s.syncQueue, queueItem("Base oficial de 83 alumnos individualizados restaurada con éxito")],
        }));
        // Rehidratar inmediatamente desde la base de datos PostgreSQL para preservar alumnos y activaciones en la nube
        try {
          if (typeof window !== "undefined") {
            import("@/lib/services/students.service").then(({ getStudents, mapDBStudentToAdminStudent }) => {
              getStudents("staff")
                .then((dbStudents) => {
                  if (dbStudents && dbStudents.length > 0) {
                    useAppStore.getState().hydrateFromBackend({
                      students: dbStudents.map(mapDBStudentToAdminStudent),
                    });
                  }
                })
                .catch(() => {});
            }).catch(() => {});
          }
        } catch {}
      },
      deleteStudent: (id, reasonCategory = "otro", reasonText = "", deletedBy = "Nayeli (Secretaría)") =>
        set((s) => {
          const studentToDelete = s.adminStudents.find((st) => isSameStudentId(st.id, id));
          if (!studentToDelete) return s;
          const studentName = studentToDelete.name;
          backgroundDeleteStudentFromDB(s.activeRole, id);

          const logEntry: DeletedStudentLog = {
            id: `del-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            studentId: studentToDelete.id,
            studentName: studentToDelete.name,
            family: studentToDelete.family,
            instrument: studentToDelete.instrument,
            teacher: studentToDelete.teacher,
            deletedBy,
            deletedAt: new Date().toISOString(),
            reasonCategory,
            reasonText,
            studentSnapshot: { ...studentToDelete },
          };

          return {
            adminStudents: s.adminStudents.filter((st) => !isSameStudentId(st.id, id)),
            schedule: s.schedule.filter((l) => !isMatchingStudentName(l.student, studentName)),
            deletedStudents: [logEntry, ...(s.deletedStudents || [])],
            syncQueue: [...s.syncQueue, queueItem(`Alumno ${studentName} movido a papelera [${reasonCategory}]`)],
          };
        }),
      deleteStudents: (ids, reasonCategory = "otro", reasonText = "", deletedBy = "Nayeli (Secretaría)") =>
        set((s) => {
          ids.forEach((id) => backgroundDeleteStudentFromDB(s.activeRole, id));
          const studentsToDelete = s.adminStudents.filter((st) => ids.some((id) => isSameStudentId(st.id, id)));
          const namesToDelete = studentsToDelete.map((st) => st.name);
          const now = new Date().toISOString();

          const newLogs: DeletedStudentLog[] = studentsToDelete.map((st, idx) => ({
            id: `del-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
            studentId: st.id,
            studentName: st.name,
            family: st.family,
            instrument: st.instrument,
            teacher: st.teacher,
            deletedBy,
            deletedAt: now,
            reasonCategory,
            reasonText,
            studentSnapshot: { ...st },
          }));

          return {
            adminStudents: s.adminStudents.filter((st) => !ids.some((id) => isSameStudentId(st.id, id))),
            schedule: s.schedule.filter(
              (l) => !namesToDelete.some((n) => isMatchingStudentName(n, l.student)),
            ),
            deletedStudents: [...newLogs, ...(s.deletedStudents || [])],
            syncQueue: [...s.syncQueue, queueItem(`${ids.length} alumnos movidos a papelera [${reasonCategory}]`)],
          };
        }),
      restoreDeletedStudent: (logId) =>
        set((s) => {
          const log = (s.deletedStudents || []).find((l) => l.id === logId);
          if (!log) return s;

          const alreadyExists = s.adminStudents.some((st) => isSameStudentId(st.id, log.studentSnapshot.id));
          const restoredStudent: AdminStudent = alreadyExists
            ? { ...log.studentSnapshot, id: generateUUID() }
            : { ...log.studentSnapshot };

          backgroundSyncStudentToDB(s.activeRole, restoredStudent.id, { status: "activo" });

          return {
            adminStudents: [restoredStudent, ...s.adminStudents],
            deletedStudents: (s.deletedStudents || []).filter((l) => l.id !== logId),
            syncQueue: [...s.syncQueue, queueItem(`Alumno ${restoredStudent.name} restaurado de la papelera`)],
          };
        }),
      updateStudentDetails: (id, updates) =>
        set((s) => {
          backgroundSyncStudentToDB(s.activeRole, id, updates);
          const targetStudent = s.adminStudents.find((st) => isSameStudentId(st.id, id) || isMatchingStudentName(st.name, id));
          let updatedSchedule = s.schedule;
          const updatedStudents = s.adminStudents.map((st) => {
            const isMatch = isSameStudentId(st.id, id) || (targetStudent && isMatchingStudentName(st.name, targetStudent.name));
            if (!isMatch) return st;
            const newPrice = updates.planPrice !== undefined ? updates.planPrice : st.planPrice;
            const newPaid = updates.amountPaid !== undefined ? updates.amountPaid : st.amountPaid;
            let newBalance = updates.balance !== undefined ? updates.balance : st.balance;
            if (updates.balance === undefined && newPrice !== undefined && newPaid !== undefined) {
              newBalance = Math.max(0, newPrice - newPaid);
            }
            const newPayment = (newBalance !== undefined && newBalance > 0) ? "pendiente" : (updates.payment || st.payment || "al-dia");
            return {
              ...st,
              ...updates,
              balance: newBalance !== undefined ? newBalance : st.balance,
              payment: newPayment,
            };
          });

          // Propagar cambios clave al horario (nombre, instrumento, profesor, categoría)
          if (targetStudent) {
            const hasNameChange = updates.name && updates.name !== targetStudent.name;
            const hasCatChange = updates.ageCategory && updates.ageCategory !== targetStudent.ageCategory;
            const hasTeacherChange = updates.teacher && updates.teacher !== targetStudent.teacher;
            const hasInstrumentChange = updates.instrument && updates.instrument !== targetStudent.instrument;

            if (hasNameChange || hasCatChange || hasTeacherChange || hasInstrumentChange) {
              updatedSchedule = s.schedule.map((l) => {
                const isMatch =
                  isMatchingStudentName(targetStudent.name, l.student) ||
                  (updates.name ? isMatchingStudentName(updates.name, l.student) : false);

                if (isMatch) {
                  return {
                    ...l,
                    ...(hasNameChange ? { student: updates.name! } : {}),
                    ...(hasCatChange ? { category: updates.ageCategory! } : {}),
                    ...(hasTeacherChange && updates.teacher !== "Prof. por Asignar" ? { teacher: updates.teacher! } : {}),
                    ...(hasInstrumentChange ? { instrument: updates.instrument! } : {}),
                  };
                }
                return l;
              });
            }
          }

          const updatedInvoices = s.invoices.map((inv) => {
            const isMatch = targetStudent && (
              isMatchingStudentName(inv.student || "", targetStudent.name) ||
              isMatchingStudentName(inv.family, targetStudent.family) ||
              (inv.concept && isMatchingStudentName(targetStudent.name, inv.concept.split("—")[1]?.trim() || ""))
            );
            if (!isMatch) return inv;
            const newPrice = updates.planPrice !== undefined ? updates.planPrice : inv.amount;
            const newPaid = updates.amountPaid !== undefined ? updates.amountPaid : inv.amountPaid;
            const newRemaining = Math.max(0, newPrice - newPaid);
            const newStatus = newRemaining === 0 ? ("pagado" as const) : (newPaid > 0 ? ("parcial" as const) : ("pendiente" as const));
            return {
              ...inv,
              amount: newPrice,
              amountPaid: newPaid,
              remainingBalance: newRemaining,
              status: newStatus,
            };
          });

          return {
            adminStudents: updatedStudents,
            schedule: updatedSchedule,
            invoices: updatedInvoices,
            syncQueue: [...s.syncQueue, queueItem("Ficha de alumno actualizada")],
          };
        }),
      updateLessonCategory: (id, category) =>
        set((s) => ({
          schedule: s.schedule.map((l) =>
            l.id === id ? { ...l, category } : l
          ),
          syncQueue: [...s.syncQueue, queueItem(`Categoría de clase actualizada · ${category}`)],
        })),
      setStudentStatus: (id, status) =>
        set((s) => {
          backgroundSyncStudentToDB(s.activeRole, id, { status });
          const target = s.adminStudents.find((st) => isSameStudentId(st.id, id) || isMatchingStudentName(st.name, id));
          let updatedSchedule = s.schedule;
          let updatedInvoices = s.invoices;
          // Si pasa a activo, asegurar que sus clases oficiales (initialSchedule o scheduleLessons) estén presentes
          if (status === "activo" && target) {
            const hasExistingLessons = updatedSchedule.some(
              (l) => isMatchingStudentName(l.student, target.name) && l.status !== "cancelada"
            );
            if (!hasExistingLessons) {
              const seedLessons = (initialSchedule || []).filter(
                (l) => isMatchingStudentName(l.student, target.name) && l.status !== "cancelada"
              );
              const persistedLessons = (target.scheduleLessons || []).filter(
                (l) => isMatchingStudentName(l.student, target.name) && l.status !== "cancelada"
              );
              const lessonsToAdd = persistedLessons.length > 0 ? persistedLessons : seedLessons;
              if (lessonsToAdd.length > 0) {
                updatedSchedule = [...updatedSchedule, ...lessonsToAdd.map((l) => ({
                  ...l,
                  student: target.name,
                  teacher: l.teacher || target.teacher,
                  instrument: l.instrument || target.instrument,
                }))];
              }
            }

            // Asegurar que el alumno activo cuente con su recibo correspondiente en facturación
            const hasExistingInvoice = updatedInvoices.some(
              (i) =>
                isMatchingStudentName(i.student || "", target.name) ||
                isMatchingStudentName(i.family, target.family) ||
                (i.concept && isMatchingStudentName(target.name, i.concept.split("—")[1]?.trim() || ""))
            );
            if (!hasExistingInvoice) {
              const planPrice = target.planPrice || 297;
              const amountPaid = target.amountPaid || 0;
              const remaining = Math.max(0, planPrice - amountPaid);
              const invStatus = remaining === 0 ? ("pagado" as const) : (amountPaid > 0 ? ("parcial" as const) : ("pendiente" as const));
              const newInvoice: Invoice = {
                id: generateUUID(),
                family: target.family || `Familia ${target.name}`,
                student: target.name,
                phone: target.phone,
                concept: `Plan ${target.planType || "Mensual"} (${target.instrument || "Piano"}) — ${target.name}`,
                amount: planPrice,
                amountPaid: amountPaid,
                remainingBalance: remaining,
                dueDate: target.planStartDate || new Date().toISOString().slice(0, 10),
                daysToDue: 10,
                status: invStatus,
                paymentMethod: (target.paymentMethod as any) || "Yape",
                paymentLogs: [],
              };
              backgroundCreateInvoiceInDB(s.activeRole, newInvoice, target);
              updatedInvoices = [newInvoice, ...updatedInvoices];
            }
          }
          return {
            adminStudents: s.adminStudents.map((st) =>
              isSameStudentId(st.id, id) || (target && isMatchingStudentName(st.name, target.name))
                ? { ...st, status }
                : st
            ),
            schedule: updatedSchedule,
            invoices: updatedInvoices,
            syncQueue: [...s.syncQueue, queueItem(`Estado actualizado · ${status}`)],
          };
        }),
      assignTeacher: (id, teacher) =>
        set((s) => {
          backgroundSyncStudentToDB(s.activeRole, id, { teacher });
          const targetStudent = s.adminStudents.find((st) => isSameStudentId(st.id, id));
          let updatedSchedule = s.schedule;
          if (targetStudent) {
            updatedSchedule = s.schedule.map((l) =>
              isMatchingStudentName(targetStudent.name, l.student)
                ? { ...l, teacher }
                : l
            );
          }
          return {
            adminStudents: s.adminStudents.map((st) => (isSameStudentId(st.id, id) ? { ...st, teacher } : st)),
            schedule: updatedSchedule,
            syncQueue: [...s.syncQueue, queueItem(`Profesor asignado · ${teacher}`)],
          };
        }),
      setStudentModality: (id, modality) =>
        set((s) => {
          const target = s.adminStudents.find((st) => isSameStudentId(st.id, id));
          let planEndDate = target?.planEndDate;
          let planEndMonth = target?.planEndMonth;
          if (target?.planStartDate) {
            const is1x = modality.includes("1x");
            const durationMonths = is1x ? 2 : 1;
            const [y, m, d] = target.planStartDate.split("-").map((v) => parseInt(v, 10));
            if (y && m && d) {
              const endD = new Date(y, (m - 1) + durationMonths, d);
              endD.setDate(endD.getDate() - 1);
              const endY = endD.getFullYear();
              const endM = String(endD.getMonth() + 1).padStart(2, "0");
              const endDay = String(endD.getDate()).padStart(2, "0");
              planEndDate = `${endY}-${endM}-${endDay}`;
              planEndMonth = `${endY}-${endM}`;
            }
          }
          const updates: Partial<AdminStudent> = {
            modality,
            ...(planEndDate ? { planEndDate, planEndMonth } : {}),
          };
          backgroundSyncStudentToDB(s.activeRole, id, updates);
          return {
            adminStudents: s.adminStudents.map((st) => (isSameStudentId(st.id, id) ? { ...st, ...updates } : st)),
            syncQueue: [...s.syncQueue, queueItem(`Modalidad actualizada · ${modality}`)],
          };
        }),
      addStudentCredit: (id) =>
        set((s) => ({
          adminStudents: s.adminStudents.map((st) =>
            isSameStudentId(st.id, id) ? { ...st, makeupCredits: st.makeupCredits + 1 } : st,
          ),
          syncQueue: [...s.syncQueue, queueItem("Crédito de falta añadido")],
        })),
      consumeStudentCredit: (id) =>
        set((s) => ({
          adminStudents: s.adminStudents.map((st) =>
            isSameStudentId(st.id, id) ? { ...st, makeupCredits: Math.max(0, st.makeupCredits - 1) } : st,
          ),
          syncQueue: [...s.syncQueue, queueItem("Crédito de recuperación utilizado")],
        })),
      markLessonAttendance: (lessonId, status, notes = "", targetWeekIndex?: number) =>
        set((s) => {
          const lesson = s.schedule.find((l) => l.id === lessonId);
          const studentName = lesson?.student;
          const isJustificada = status === "justificada";
          const weekIdx = targetWeekIndex ?? lesson?.weekIndex ?? getCurrentWeekIndex();

          const newSchedule = s.schedule.map((l) => {
            if (l.id === lessonId) {
              const prevByWeek = { ...(l.attendanceByWeek || {}) };
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
          });

          // Recalcular estadísticas del alumno para reflejar en el directorio y Kardex
          const studentLessons = studentName
            ? newSchedule.filter(
                (l) => isMatchingStudentName(l.student, studentName) && l.status !== "cancelada"
              )
            : [];

          let totalPresentes = 0;
          let totalTardes = 0;
          let totalAusentes = 0;
          let totalJustificadas = 0;
          const allMarked: ("presente" | "ausente" | "tarde")[] = [];

          studentLessons.forEach((l) => {
            if (l.attendanceByWeek) {
              Object.entries(l.attendanceByWeek).forEach(([_, st]) => {
                if (st === "presente") {
                  totalPresentes++;
                  allMarked.push("presente");
                } else if (st === "tarde") {
                  totalTardes++;
                  allMarked.push("tarde");
                } else if (st === "ausente") {
                  totalAusentes++;
                  allMarked.push("ausente");
                } else if (st === "justificada") {
                  totalJustificadas++;
                }
              });
            }
          });

          const totalEvaluated = totalPresentes + totalTardes + totalAusentes + totalJustificadas;
          const newRate = totalEvaluated > 0
            ? Math.round(((totalPresentes + totalTardes) / totalEvaluated) * 100)
            : 0;

          const newStudents = s.adminStudents.map((st) => {
            if (studentName && isMatchingStudentName(st.name, studentName)) {
              return {
                ...st,
                attendanceRate: newRate,
                recentAttendance: [status === "justificada" ? "ausente" : status, ...(st.recentAttendance || []).slice(0, 4)],
                makeupCredits: isJustificada ? st.makeupCredits + 1 : st.makeupCredits,
              };
            }
            return st;
          });

          const updatedStudent = studentName
            ? newStudents.find((st) => isMatchingStudentName(st.name, studentName))
            : undefined;

          if (updatedStudent) {
            backgroundSyncStudentToDB(s.activeRole, updatedStudent.id, {
              attendanceRate: newRate,
              makeupCredits: updatedStudent.makeupCredits,
            });
            backgroundSyncAttendanceLogToDB(
              s.activeRole,
              updatedStudent.id,
              status,
              `Semana ${weekIdx + 1} - Marcado por Profesor en Kiosco${notes ? `: ${notes}` : ""}`
            );
          }

          return {
            schedule: newSchedule,
            adminStudents: newStudents,
            syncQueue: [
              ...s.syncQueue,
              queueItem(
                `Asistencia marcada por Profesor (Semana ${weekIdx + 1}) · ${studentName || "Alumno"} (${status.toUpperCase()})`,
              ),
            ],
          };
        }),
      setStudentSessionAttendance: (studentName, lessonId, weekIndex, status, notes = "", dateStr?: string) =>
        set((s) => {
          const targetLesson = s.schedule.find((l) => l.id === lessonId);
          const prevStatus = dateStr
            ? targetLesson?.attendanceByDate?.[dateStr]
            : (weekIndex !== undefined ? targetLesson?.attendanceByWeek?.[weekIndex] : undefined);

          const isAbsence = status === "ausente" || status === "justificada";
          const wasAbsence = prevStatus === "ausente" || prevStatus === "justificada";
          let creditDelta = 0;
          if (isAbsence && !wasAbsence) creditDelta = 1;
          else if (!isAbsence && wasAbsence) creditDelta = -1;

          const newSchedule = s.schedule.map((l) => {
            if (l.id === lessonId) {
              const prevByWeek = { ...(l.attendanceByWeek || {}) };
              const prevByDate = { ...(l.attendanceByDate || {}) };

              if (status === "pendiente") {
                if (weekIndex !== undefined) delete prevByWeek[weekIndex];
                if (dateStr) delete prevByDate[dateStr];
              } else {
                if (weekIndex !== undefined) prevByWeek[weekIndex] = status;
                if (dateStr) prevByDate[dateStr] = status;
              }

              return {
                ...l,
                // 🛡️ REGLA DE ORO ADR 0099: NO sobreescribir attendanceStatus global en la lección recurrente
                attendanceByWeek: prevByWeek,
                attendanceByDate: prevByDate,
              };
            }
            return l;
          });

          // Recalcular estadísticas del alumno
          const studentLessons = newSchedule.filter(
            (l) => isMatchingStudentName(l.student, studentName) && l.status !== "cancelada"
          );

          let totalPresentes = 0;
          let totalTardes = 0;
          let totalAusentes = 0;
          let totalJustificadas = 0;
          const allMarked: ("presente" | "ausente" | "tarde")[] = [];

          studentLessons.forEach((l) => {
            if (l.attendanceByDate && Object.keys(l.attendanceByDate).length > 0) {
              // Ordenar fechas para que recentAttendance refleje las sesiones más recientes
              const sortedDates = Object.keys(l.attendanceByDate).sort();
              sortedDates.forEach((dKey) => {
                const st = l.attendanceByDate![dKey];
                if (st === "presente") {
                  totalPresentes++;
                  allMarked.push("presente");
                } else if (st === "tarde") {
                  totalTardes++;
                  allMarked.push("tarde");
                } else if (st === "ausente") {
                  totalAusentes++;
                  allMarked.push("ausente");
                } else if (st === "justificada") {
                  totalJustificadas++;
                }
              });
            } else if (l.attendanceByWeek) {
              Object.entries(l.attendanceByWeek).forEach(([_, st]) => {
                if (st === "presente") {
                  totalPresentes++;
                  allMarked.push("presente");
                } else if (st === "tarde") {
                  totalTardes++;
                  allMarked.push("tarde");
                } else if (st === "ausente") {
                  totalAusentes++;
                  allMarked.push("ausente");
                } else if (st === "justificada") {
                  totalJustificadas++;
                }
              });
            }
          });

          const totalEvaluated = totalPresentes + totalTardes + totalAusentes + totalJustificadas;
          const newRate = totalEvaluated > 0
            ? Math.round(((totalPresentes + totalTardes) / totalEvaluated) * 100)
            : 0;

          const recentList = allMarked.length > 0 ? allMarked.slice(-5) : [];

          const targetLessons = newSchedule.filter(
            (l) => (isMatchingStudentName(l.student, studentName) || l.student.toLowerCase() === studentName.toLowerCase()) && l.status !== "cancelada"
          );

          const newStudents = s.adminStudents.map((st) => {
            if (isMatchingStudentName(st.name, studentName)) {
              const updatedCredits = Math.max(0, (st.makeupCredits || 0) + creditDelta);
              return {
                ...st,
                attendanceRate: newRate,
                recentAttendance: recentList,
                makeupCredits: updatedCredits,
                scheduleLessons: targetLessons,
              };
            }
            return st;
          });

          const updatedStudent = newStudents.find((st) => isMatchingStudentName(st.name, studentName));
          if (updatedStudent) {
            backgroundSyncStudentToDB(s.activeRole, updatedStudent.id, {
              attendanceRate: newRate,
              recentAttendance: recentList,
              makeupCredits: updatedStudent.makeupCredits,
              scheduleLessons: targetLessons,
            });
            backgroundSyncAttendanceLogToDB(
              s.activeRole,
              updatedStudent.id,
              status,
              dateStr ? `Fecha ${dateStr} - Regularización Kardex` : `Semana ${(weekIndex ?? 0) + 1} - Regularización Kardex`
            );
          }

          return {
            schedule: newSchedule,
            adminStudents: newStudents,
            syncQueue: [
              ...s.syncQueue,
              queueItem(`Asistencia regularizada: ${studentName} (${dateStr || `Semana ${weekIndex + 1}`}: ${status.toUpperCase()})`),
            ],
          };
        }),
      bulkRegularizeStudentAttendance: (studentName, attendances) =>
        set((s) => {
          let extraCredits = 0;
          const updatesMapWeek = new Map<string, Record<number, "presente" | "ausente" | "tarde" | "justificada">>();
          const updatesMapDate = new Map<string, Record<string, "presente" | "ausente" | "tarde" | "justificada">>();

          attendances.forEach(({ lessonId, weekIndex, status, dateStr }) => {
            if (status === "justificada") extraCredits++;
            if (!updatesMapWeek.has(lessonId)) {
              updatesMapWeek.set(lessonId, {});
            }
            if (!updatesMapDate.has(lessonId)) {
              updatesMapDate.set(lessonId, {});
            }
            if (status !== "pendiente") {
              updatesMapWeek.get(lessonId)![weekIndex] = status;
              if (dateStr) {
                updatesMapDate.get(lessonId)![dateStr] = status;
              }
            }
          });

          const newSchedule = s.schedule.map((l) => {
            if (updatesMapWeek.has(l.id) || updatesMapDate.has(l.id)) {
              const prevByWeek = { ...(l.attendanceByWeek || {}) };
              const prevByDate = { ...(l.attendanceByDate || {}) };

              const currentUpdatesW = updatesMapWeek.get(l.id) || {};
              Object.entries(currentUpdatesW).forEach(([wStr, st]) => {
                prevByWeek[Number(wStr)] = st;
              });

              const currentUpdatesD = updatesMapDate.get(l.id) || {};
              Object.entries(currentUpdatesD).forEach(([dKey, st]) => {
                prevByDate[dKey] = st;
              });

              return {
                ...l,
                attendanceByWeek: prevByWeek,
                attendanceByDate: prevByDate,
              };
            }
            return l;
          });

          // Recalcular estadísticas del alumno
          const studentLessons = newSchedule.filter(
            (l) => isMatchingStudentName(l.student, studentName) && l.status !== "cancelada"
          );

          let totalPresentes = 0;
          let totalTardes = 0;
          let totalAusentes = 0;
          let totalJustificadas = 0;
          const allMarked: ("presente" | "ausente" | "tarde")[] = [];

          studentLessons.forEach((l) => {
            if (l.attendanceByDate && Object.keys(l.attendanceByDate).length > 0) {
              const sortedDates = Object.keys(l.attendanceByDate).sort();
              sortedDates.forEach((dKey) => {
                const st = l.attendanceByDate![dKey];
                if (st === "presente") {
                  totalPresentes++;
                  allMarked.push("presente");
                } else if (st === "tarde") {
                  totalTardes++;
                  allMarked.push("tarde");
                } else if (st === "ausente") {
                  totalAusentes++;
                  allMarked.push("ausente");
                } else if (st === "justificada") {
                  totalJustificadas++;
                }
              });
            } else if (l.attendanceByWeek) {
              Object.entries(l.attendanceByWeek).forEach(([_, st]) => {
                if (st === "presente") {
                  totalPresentes++;
                  allMarked.push("presente");
                } else if (st === "tarde") {
                  totalTardes++;
                  allMarked.push("tarde");
                } else if (st === "ausente") {
                  totalAusentes++;
                  allMarked.push("ausente");
                } else if (st === "justificada") {
                  totalJustificadas++;
                }
              });
            }
          });

          const totalEvaluated = totalPresentes + totalTardes + totalAusentes + totalJustificadas;
          const newRate = totalEvaluated > 0
            ? Math.round(((totalPresentes + totalTardes) / totalEvaluated) * 100)
            : 0;

          const recentList = allMarked.length > 0 ? allMarked.slice(-5) : [];

          const newStudents = s.adminStudents.map((st) => {
            if (isMatchingStudentName(st.name, studentName)) {
              return {
                ...st,
                attendanceRate: newRate,
                recentAttendance: recentList,
                makeupCredits: st.makeupCredits + extraCredits,
              };
            }
            return st;
          });

          const updatedStudent = newStudents.find((st) => isMatchingStudentName(st.name, studentName));
          if (updatedStudent) {
            backgroundSyncStudentToDB(s.activeRole, updatedStudent.id, {
              attendanceRate: newRate,
              recentAttendance: recentList,
              makeupCredits: updatedStudent.makeupCredits,
            });
            attendances.forEach(({ weekIndex, status: attStatus, dateStr }) => {
              if (attStatus !== "pendiente") {
                backgroundSyncAttendanceLogToDB(
                  s.activeRole,
                  updatedStudent.id,
                  attStatus,
                  dateStr ? `Fecha ${dateStr} - Regularización Masiva Kardex` : `Semana ${weekIndex + 1} - Regularización Masiva Kardex`
                );
              }
            });
          }

          return {
            schedule: newSchedule,
            adminStudents: newStudents,
            syncQueue: [
              ...s.syncQueue,
              queueItem(`Regularización masiva de asistencias para ${studentName} (${attendances.length} sesiones)`),
            ],
          };
        }),
      scheduleMakeupLesson: (data) =>
        set((s) => {
          const newLesson: ScheduledLesson = {
            id: `sch-mk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            day: data.day,
            time: data.time,
            student: data.studentName,
            instrument: data.instrument,
            teacher: data.teacher,
            room: data.room,
            category: data.category || "RECUPERACION",
            status: "programada",
            isMakeup: true,
            weekIndex: data.weekIndex,
            year: data.year,
            month: data.month,
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
            if (isSameStudentId(st.id, studentId)) {
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

          backgroundSyncPaymentToDB(s.activeRole, id, amount, method, voucherRef, note, {
            amount: inv.amount,
            amount_paid: inv.amountPaid || 0,
            remaining_balance: inv.remainingBalance ?? Math.max(0, inv.amount - (inv.amountPaid || 0)),
          });

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

          const updatedStudents = s.adminStudents.map((st) => {
            const isMatch = isMatchingStudentName(st.name, inv.student || "") ||
              isMatchingStudentName(st.family, inv.family) ||
              (inv.concept && isMatchingStudentName(st.name, inv.concept.split("—")[1]?.trim() || ""));
            if (!isMatch) return st;
            const updatedPaid = (st.amountPaid || 0) + amount;
            const updatedBalance = Math.max(0, (st.planPrice || inv.amount) - updatedPaid);
            const updatedPayment = updatedBalance === 0 ? ("al-dia" as const) : ("pendiente" as const);
            backgroundSyncStudentToDB(s.activeRole, st.id, {
              amountPaid: updatedPaid,
              balance: updatedBalance,
              payment: updatedPayment,
            });
            return {
              ...st,
              amountPaid: updatedPaid,
              balance: updatedBalance,
              payment: updatedPayment,
            };
          });

          return {
            adminStudents: updatedStudents,
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
            backgroundSyncPaymentToDB(s.activeRole, existingInv.id, amount, method, voucherRef, note, {
              amount: existingInv.amount,
              amount_paid: existingInv.amountPaid || 0,
              remaining_balance: existingInv.remainingBalance ?? Math.max(0, existingInv.amount - (existingInv.amountPaid || 0)),
            });

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

          const targetStudent = s.adminStudents.find((st) =>
            isMatchingStudentName(st.name, cleanSearch) || isMatchingStudentName(st.family, cleanSearch)
          );
          const newInvoiceId = generateUUID();
          const newInvoice: Invoice = {
            id: newInvoiceId,
            family: familyOrStudent.startsWith("Familia ") ? familyOrStudent : `Familia ${familyOrStudent}`,
            student: targetStudent ? targetStudent.name : familyOrStudent,
            concept: concept || "Abono de Clases",
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

          if (targetStudent) {
            backgroundCreateInvoiceInDB(s.activeRole, newInvoice, targetStudent);
          }

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
              const now = new Date();
              const dynDueDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-20`;
              const newInv: Invoice = {
                id: `inv-imp-${Date.now()}-${idx}`,
                family: p.familyOrStudent.startsWith("Familia ") ? p.familyOrStudent : `Familia ${p.familyOrStudent}`,
                concept: p.concept || "Mensualidad Regular",
                students: 1,
                amount: p.amount,
                amountPaid: p.amount,
                remainingBalance: 0,
                dueDate: dynDueDate,
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
        const currentStudents = get().adminStudents.filter(
          (st) =>
            st.status === "activo" &&
            !st.modality?.toLowerCase().includes("flexible") &&
            st.planType !== "Paquete Flexible"
        );
        const now = new Date();
        const dynDueDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-20`;
        const generatedInvoices: Invoice[] = currentStudents.map((st, idx) => {
          const planAmount =
            st.planPrice ||
            (st.planType === "Trimestral"
              ? VIBRA_PRICING.Trimestral.priceMonthly
              : st.planType === "Anual"
              ? VIBRA_PRICING.Anual.priceMonthly
              : VIBRA_PRICING.Mensual.priceMonthly);
          const conceptLabel = `Mensualidad ${st.planType || "Mensual"} · ${st.instrument} (${st.teacher})`;

          return {
            id: `inv-${Date.now()}-${idx}`,
            family: st.family || `Familia ${st.name.split(" ")[1] || st.name}`,
            concept: conceptLabel,
            students: 1,
            amount: planAmount,
            amountPaid: 0,
            remainingBalance: planAmount,
            dueDate: dynDueDate,
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

          let newDeletedLog: DeletedStudentLog | null = null;

          if (req.entityType === "student") {
            const studentToDelete = s.adminStudents.find((st) => isSameStudentId(st.id, req.entityId) || isMatchingStudentName(st.name, req.entityName));
            const studentName = studentToDelete?.name || req.entityName;
            if (studentToDelete) {
              newDeletedLog = {
                id: `del-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                studentId: studentToDelete.id,
                studentName: studentToDelete.name,
                family: studentToDelete.family,
                instrument: studentToDelete.instrument,
                teacher: studentToDelete.teacher,
                deletedBy: req.requestedBy || "Dirección (Dueña)",
                deletedAt: new Date().toISOString(),
                reasonCategory: "retiro_voluntario",
                reasonText: req.reason || "Solicitud de baja aprobada por Dirección",
                studentSnapshot: { ...studentToDelete },
              };
            }
            updatedStudents = s.adminStudents.filter((st) => !isSameStudentId(st.id, req.entityId) && !isMatchingStudentName(st.name, studentName));
            updatedSchedule = s.schedule.filter((l) => !isMatchingStudentName(l.student, studentName));
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
            deletedStudents: newDeletedLog ? [newDeletedLog, ...(s.deletedStudents || [])] : (s.deletedStudents || []),
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
                reviewNotes: notes || "Rechazado por Dirección",
              }
              : r,
          );

          return {
            deletionRequests: updatedRequests,
            syncQueue: [...s.syncQueue, queueItem(`Solicitud de eliminación rechazada · ${requestId}`)],
          };
        }),

      // Moderación de Notas Pedagógicas Docentes
      teacherNotes: [],
      addOrUpdateTeacherNote: (note) =>
        set((s) => ({
          teacherNotes: [note, ...s.teacherNotes.filter((n) => n.id !== note.id)],
        })),
      setTeacherNotes: (notes) => set({ teacherNotes: notes }),
    }),

    {
      name: "cadencia-app-v31",
      storage: createJSONStorage(() => localStorage),
      version: 31,
      migrate: (persistedState: any, version: number) => {
        try {
          if (typeof window !== "undefined") {
            for (let i = 1; i <= 30; i++) {
              window.localStorage.removeItem(`cadencia-app-v${i}`);
            }
          }
        } catch {}

        // Migración limpia alineada con la base de datos PostgreSQL:
        // Respeta alumnos activados por administración y los alumnos confirmados activos:
        // Camila Pastor, Emma Sevilla / Micaela, Marco Antonio Adrian y Jonathan Ticona Cachay.
        const migratedStudents = (persistedState?.adminStudents || adminStudents).map((st: any) => {
          const isCamila = isMatchingStudentName(st.name, "Camila Valentina Pastor Conco");
          const isEmma = isMatchingStudentName(st.name, "Emma Micaela") || isMatchingStudentName(st.name, "Emma Sevilla");
          const isMarco = isMatchingStudentName(st.name, "Marco Antonio Adrian");
          const isJonathan = isMatchingStudentName(st.name, "Ticona Cachay, Jonathan") || isMatchingStudentName(st.name, "Jonathan Ticona Cachay");
          const isAlreadyActive = st.status === "activo";
          const isActive = isAlreadyActive || isCamila || isEmma || isMarco || isJonathan;

          let resolvedTeacher = st.teacher;
          if (isCamila || isEmma) resolvedTeacher = "Fernando";
          else if (isMarco) resolvedTeacher = "Jeremy";
          else if (isJonathan) resolvedTeacher = "Nathaly";

          let planStartDate = st.planStartDate || "2026-08-01";
          let planEndDate = st.planEndDate || "2026-08-31";
          let modality = st.modality || "Regular (8 clases / 45 min)";
          let planType = st.planType || "Mensual";
          let planPrice = st.planPrice !== undefined ? st.planPrice : 297;
          let amountPaid = st.amountPaid !== undefined ? st.amountPaid : planPrice;
          let balance = st.balance !== undefined ? st.balance : Math.max(0, planPrice - amountPaid);
          let packageTotalSessions = st.packageTotalSessions || (modality.includes("Intensivo") ? 4 : 8);

          if (isCamila) {
            planStartDate = "2026-09-10";
            planEndDate = "2026-10-09";
          } else if (isEmma) {
            planStartDate = "2026-08-28";
            planEndDate = "2026-09-27";
          } else if (isJonathan) {
            planStartDate = "2026-08-18";
            planEndDate = "2026-12-31";
            modality = "Paquete Flexible (A demanda)";
            planType = "Paquete Flexible";
            planPrice = 500;
            amountPaid = 500;
            balance = 0;
            packageTotalSessions = 24;
          }

          return {
            ...st,
            status: isActive ? "activo" : (st.status === "baja" ? "baja" : "pausa"),
            recentAttendance: Array.isArray(st.recentAttendance) ? st.recentAttendance : [],
            attendanceRate: typeof st.attendanceRate === "number" ? st.attendanceRate : 0,
            teacher: resolvedTeacher && resolvedTeacher !== "Prof. por Asignar" ? resolvedTeacher : (st.teacher || "Prof. por Asignar"),
            modality,
            planType,
            planPrice,
            amountPaid,
            balance,
            packageTotalSessions,
            payment: balance > 0 ? "pendiente" : "al-dia",
            planStartDate,
            planEndDate,
            planStartMonth: planStartDate.slice(0, 7),
            planEndMonth: planEndDate.slice(0, 7),
          };
        });

        // 🛡️ REGLA DE ORO ADR 0098, 0099 & 0100:
        // En el horario de clases (schedule), solo deben figurar clases de alumnos ACTIVOS.
        const activeStudentNames = migratedStudents
          .filter((st: any) => st.status === "activo")
          .map((st: any) => st.name);

        // Fusión inteligente de schedule: combina initialSchedule y persistedState.schedule
        // para garantizar que clases oficiales de alumnos activos (Emma, Marco, Jonathan, Camila)
        // se encuentren disponibles y no se pierdan reprogramaciones locales.
        const scheduleMap = new Map<string, any>();
        (initialSchedule || []).forEach((l: any) => {
          if (l.status !== "cancelada" && activeStudentNames.some((actName: string) => isMatchingStudentName(actName, l.student))) {
            scheduleMap.set(l.id, l);
          }
        });
        (persistedState?.schedule || []).forEach((l: any) => {
          if (l.status !== "cancelada" && activeStudentNames.some((actName: string) => isMatchingStudentName(actName, l.student))) {
            scheduleMap.set(l.id, l);
          }
        });

        const cleanSchedule = Array.from(scheduleMap.values()).map((l: any) => ({
          ...l,
          attendanceStatus: undefined,
        }));

        return {
          ...persistedState,
          adminStudents: migratedStudents,
          historicalStudents: persistedState?.historicalStudents || adminStudents,
          historicalMetadata: HISTORICAL_BASE_METADATA,
          invoices: persistedState?.invoices || initialInvoices,
          schedule: cleanSchedule,
          deletedStudents: persistedState?.deletedStudents || [],
          teacherNotes: persistedState?.teacherNotes || [],
        };
      },
      partialize: (s) =>
        ({
          activeRole: s.activeRole,
          isAuthenticated: s.isAuthenticated,
          currentUser: s.currentUser,
          adminStudents: s.adminStudents,
          deletedStudents: s.deletedStudents,
          invoices: s.invoices,
          schedule: s.schedule,
          lessons: s.lessons,
          chimeSettings: s.chimeSettings,
          studentAlerts: s.studentAlerts,
          deletionRequests: s.deletionRequests,
          teacherNotes: s.teacherNotes,
        }) as unknown as AppState,
    },
  ),
);