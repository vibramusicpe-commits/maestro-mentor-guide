/**
 * ================================================================
 * index.ts — Barrel Export de Servicios Insforge
 * ================================================================
 * Importa todos los servicios desde un solo punto:
 *   import { getStudents, registerPayment, getResources } from "@/lib/services"
 * ================================================================
 */

export * from "./students.service";
export * from "./invoices.service";
export * from "./attendance.service";
export * from "./lms.service";
export * from "./culqi.service";
export * from "./closing.service";
export * from "./auth.service";
export * from "./invitations.service";
export * from "./time-tracking.service";
export * from "./leads.service";
export * from "./whatsapp.service";

// ================================================================
// Informes, evaluaciones y notas (Fase 1)
// ================================================================
// `resolveTeacherUserId` ya se re-exporta desde time-tracking.service.
// Aquí solo agregamos los helpers nuevos del resolvedor para no duplicar.
export {
  resolveTeacherName,
  resolveActor,
  TEACHER_IDS,
  isSyntheticTeacherId,
} from "./teacher-resolver";
export * from "./evaluations.service";
export * from "./progress-reports.service";
export * from "./family-notes.service";
export * from "./internal-notes.service";
export * from "./feature-flags.service";
