/**
 * ================================================================
 * leads.service.ts — Capa de Datos: Módulo Prospectos & Clases Demo
 * ================================================================
 *
 * Conexión directa a la tabla demo_requests de PostgreSQL en Insforge.
 * Permite gestionar leads procedentes de Facebook Ads, WhatsApp Business
 * o Landing Page.
 *
 * Tablas: demo_requests, students, families
 * ================================================================
 */

import {
  assertRole,
  postgrestInsert,
  postgrestPatch,
  postgrestSelect,
} from @/lib/insforge;
import type { Role } from @/store/app-store;

export type LeadStatus = pendiente | confirmada | asistio | matriculado | cancelada;

export interface DBDemoRequest {
  id: string;
  parent_name: string;
  parent_phone: string;
  student_name: string;
  instrument: string;
  preferred_date: string | null;
  preferred_time: string | null;
  status: LeadStatus;
  notes: string | null;
  handled_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadPayload {
  parent_name: string;
  parent_phone: string;
  student_name: string;
  instrument: string;
  preferred_date?: string | null;
  preferred_time?: string | null;
  notes?: string | null;
  status?: LeadStatus;
}

/**
 * Obtener todos los prospectos / solicitudes de clase demo de Insforge.
 */
export async function getLeadsFromDB(userRole: Role): Promise<DBDemoRequest[]> {
  assertRole(userRole, [super_admin, staff]);
  const records = await postgrestSelect<DBDemoRequest[]>(
    demo_requests?select=*&order=created_at.desc
  );
  return records || [];
}

/**
 * Registrar un nuevo prospecto o solicitud de clase demostrativa.
 */
export async function createLeadInDB(
  userRole: Role,
  payload: CreateLeadPayload
): Promise<DBDemoRequest> {
  assertRole(userRole, [super_admin, staff]);
  const inserted = await postgrestInsert<DBDemoRequest>(demo_requests, {
    parent_name: payload.parent_name.trim(),
    parent_phone: payload.parent_phone.trim(),
    student_name: payload.student_name.trim(),
    instrument: payload.instrument.trim(),
    preferred_date: payload.preferred_date || null,
    preferred_time: payload.preferred_time || null,
    notes: payload.notes?.trim() || Lead capturado vía WhatsApp / Facebook Ads,
    status: payload.status || pendiente,
  });
  return inserted;
}

/**
 * Actualizar estado de una solicitud de clase demo (ej. confirmar, asistió, canceló).
 */
export async function updateLeadStatusInDB(
  userRole: Role,
  leadId: string,
  newStatus: LeadStatus,
  notes?: string
): Promise<void> {
  assertRole(userRole, [super_admin, staff]);
  const patch: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };
  if (notes !== undefined) {
    patch.notes = notes;
  }
  await postgrestPatch(demo_requests?id=eq., patch);
}
