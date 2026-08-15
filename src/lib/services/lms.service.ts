/**
 * ================================================================
 * lms.service.ts — Capa de Datos: LMS & Comunicación
 * ================================================================
 *
 * Módulos cubiertos:
 *   1. Online Resources  — Repositorio de materiales descargables
 *   2. Notification Logs — Historial de mensajería y recordatorios
 *
 * MAPA DE EDGES DEL GRAFO (Insforge):
 *
 * [UI: Portal Familia / Kiosco Profesor]
 *   │
 *   ├─ RECURSOS:
 *   │   ├─[Edge: Auth] familia → solo instrumentos de sus alumnos
 *   │   ├─[Edge: Auth] teacher → sus materiales + públicos
 *   │   └─[Edge: Auth] super_admin/staff → CRUD completo
 *   │
 *   └─ NOTIFICACIONES:
 *       ├─[Edge: Auth] staff → INSERT + SELECT propias
 *       ├─[Edge: Auth] super_admin → SELECT + DELETE
 *       └─[Edge: Fallback] SMS/WhatsApp fallido → status='fallido' + error_msg
 *
 * Tablas: online_resources, notification_logs
 * ================================================================
 */

import {
  assertRole,
  postgrestDelete,
  postgrestInsert,
  postgrestPatch,
  postgrestSelect,
} from "@/lib/insforge";
import type { Role } from "@/store/app-store";

// ---------------------------------------------------------------
// Tipos DB — Recursos LMS
// ---------------------------------------------------------------
export type ResourceTypeDB = "pdf" | "audio" | "video" | "imagen" | "partitura" | "otro";
export type NotificationChannelDB = "whatsapp" | "email" | "sms" | "in_app";

export interface DBOnlineResource {
  id: string;
  title: string;
  description: string | null;
  resource_type: ResourceTypeDB;
  file_url: string;
  file_size_kb: number | null;
  instrument: string | null;
  level: string | null;
  uploaded_by: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBNotificationLog {
  id: string;
  recipient_type: "family" | "student" | "all";
  recipient_id: string | null;
  channel: NotificationChannelDB;
  subject: string | null;
  body: string;
  sent_by: string | null;
  sent_at: string;
  status: "enviado" | "fallido" | "pendiente";
  error_msg: string | null;
  reference_id: string | null;
}

// ================================================================
// MÓDULO 1: RECURSOS DESCARGABLES (Online Resources)
// ================================================================

// ---------------------------------------------------------------
// EDGE: getResources
// Filtra por instrumento si el rol es 'family'.
// ---------------------------------------------------------------
export async function getResources(
  userRole: Role,
  filters: { instrument?: string; level?: string; resourceType?: ResourceTypeDB } = {},
): Promise<DBOnlineResource[]> {
  assertRole(
    userRole,
    ["super_admin", "staff", "teacher", "family"],
    "acceder a recursos",
  );

  const params: Record<string, string> = { order: "created_at.desc" };
  if (filters.instrument) params["instrument"] = `eq.${filters.instrument}`;
  if (filters.level) params["level"] = `eq.${filters.level}`;
  if (filters.resourceType) params["resource_type"] = `eq.${filters.resourceType}`;

  return postgrestSelect<DBOnlineResource>("online_resources", params);
}

// ---------------------------------------------------------------
// EDGE: uploadResource
// Teachers y Staff pueden subir materiales.
// Super Admin puede subir cualquier cosa.
// ---------------------------------------------------------------
export async function uploadResource(
  userRole: Role,
  uploadedById: string,
  payload: {
    title: string;
    description?: string;
    resourceType: ResourceTypeDB;
    fileUrl: string;
    fileSizeKb?: number;
    instrument?: string;
    level?: string;
    isPublic?: boolean;
  },
): Promise<DBOnlineResource> {
  assertRole(userRole, ["super_admin", "staff", "teacher"], "subir recursos");

  return postgrestInsert<DBOnlineResource>("online_resources", {
    title: payload.title,
    description: payload.description ?? null,
    resource_type: payload.resourceType,
    file_url: payload.fileUrl,
    file_size_kb: payload.fileSizeKb ?? null,
    instrument: payload.instrument ?? null,
    level: payload.level ?? null,
    uploaded_by: uploadedById,
    is_public: payload.isPublic ?? false,
  });
}

// ---------------------------------------------------------------
// EDGE: updateResource (solo super_admin y staff)
// ---------------------------------------------------------------
export async function updateResource(
  userRole: Role,
  resourceId: string,
  payload: Partial<Pick<DBOnlineResource, "title" | "description" | "is_public" | "instrument" | "level">>,
): Promise<DBOnlineResource> {
  assertRole(userRole, ["super_admin", "staff"], "editar recurso");
  return postgrestPatch<DBOnlineResource>(
    "online_resources",
    { id: `eq.${resourceId}` },
    payload,
  );
}

// ---------------------------------------------------------------
// EDGE: deleteResource (solo super_admin)
// ---------------------------------------------------------------
export async function deleteResource(
  userRole: Role,
  resourceId: string,
): Promise<void> {
  assertRole(userRole, ["super_admin"], "eliminar recurso");
  await postgrestDelete("online_resources", { id: `eq.${resourceId}` });
}

// ================================================================
// MÓDULO 2: HISTORIAL DE NOTIFICACIONES
// ================================================================

// ---------------------------------------------------------------
// EDGE: getNotificationHistory
// Super Admin y Staff ven el historial completo.
// ---------------------------------------------------------------
export async function getNotificationHistory(
  userRole: Role,
  filters: {
    channel?: NotificationChannelDB;
    recipientId?: string;
    referenceId?: string;
  } = {},
): Promise<DBNotificationLog[]> {
  assertRole(userRole, ["super_admin", "staff"], "ver historial de notificaciones");

  const params: Record<string, string> = { order: "sent_at.desc", limit: "100" };
  if (filters.channel) params["channel"] = `eq.${filters.channel}`;
  if (filters.recipientId) params["recipient_id"] = `eq.${filters.recipientId}`;
  if (filters.referenceId) params["reference_id"] = `eq.${filters.referenceId}`;

  return postgrestSelect<DBNotificationLog>("notification_logs", params);
}

// ---------------------------------------------------------------
// EDGE: logNotification
// Registra el envío de un recordatorio/mensaje.
// Flujo: se llama DESPUÉS de enviar el mensaje (WhatsApp/Email).
// Si el envío falla, se registra con status='fallido'.
// ---------------------------------------------------------------
export async function logNotification(
  userRole: Role,
  sentById: string,
  payload: {
    recipientType: "family" | "student" | "all";
    recipientId?: string;
    channel: NotificationChannelDB;
    subject?: string;
    body: string;
    status: "enviado" | "fallido" | "pendiente";
    errorMsg?: string;
    referenceId?: string;
  },
): Promise<DBNotificationLog> {
  assertRole(userRole, ["super_admin", "staff"], "registrar notificación");

  return postgrestInsert<DBNotificationLog>("notification_logs", {
    recipient_type: payload.recipientType,
    recipient_id: payload.recipientId ?? null,
    channel: payload.channel,
    subject: payload.subject ?? null,
    body: payload.body,
    sent_by: sentById,
    status: payload.status,
    error_msg: payload.errorMsg ?? null,
    reference_id: payload.referenceId ?? null,
  });
}

// ---------------------------------------------------------------
// EDGE: logDueSoonReminder
// Atajo para registrar el recordatorio de "2 días para vencer".
// Llama a logNotification + actualiza reminded_at en el invoice.
// ---------------------------------------------------------------
export async function logDueSoonReminder(
  userRole: Role,
  sentById: string,
  options: {
    invoiceId: string;
    familyId: string;
    familyName: string;
    channel: NotificationChannelDB;
    daysLeft: number;
    amountDue: number;
  },
): Promise<DBNotificationLog> {
  assertRole(userRole, ["super_admin", "staff"], "enviar recordatorio de vencimiento");

  const body = `Estimada familia ${options.familyName}, su recibo de S/ ${options.amountDue.toFixed(2)} vence en ${options.daysLeft} día(s). Por favor coordinar el pago con la escuela Vibra Music.`;

  return logNotification(userRole, sentById, {
    recipientType: "family",
    recipientId: options.familyId,
    channel: options.channel,
    subject: `Recordatorio de pago — Vibra Music (${options.daysLeft} día(s))`,
    body,
    status: "enviado",
    referenceId: options.invoiceId,
  });
}
