/**
 * ================================================================
 * invoices.service.ts — Capa de Datos: Facturación & Auditoría
 * ================================================================
 *
 * MAPA DE EDGES DEL GRAFO (Insforge):
 *
 * [UI: Módulo Facturación]
 *   │
 *   ├─[Edge: Auth Check]
 *   │    ├─ super_admin → acceso total (invoices + audit + expenses)
 *   │    └─ staff       → solo invoices + insertar en audit_logs
 *   │
 *   ├─[Edge: Payload Extract]
 *   │    registerPayment: { amount, method, voucherRef, note }
 *   │    (NUNCA modifica el campo `amount` original del invoice)
 *   │
 *   ├─[Edge: Anti-Fraude Gate]
 *   │    Inserta en payment_audit_logs ANTES de actualizar invoice
 *   │    (Si el INSERT falla → rollback → el invoice no se actualiza)
 *   │
 *   ├─[Edge: Success] → UI actualiza saldo + muestra audit log
 *   └─[Edge: Error]   → toast de error, syncQueue mantiene intento
 *
 * Tablas: invoices, payment_audit_logs, families
 * Integración: Culqi (cargos con tarjeta)
 * ================================================================
 */

import {
  assertRole,
  InsforgeEdgeError,
  postgrestInsert,
  postgrestPatch,
  postgrestRPC,
  postgrestSelect,
} from "@/lib/insforge";
import type { Role } from "@/store/app-store";

// ---------------------------------------------------------------
// Tipos DB
// ---------------------------------------------------------------
export type PaymentMethodDB = "Yape" | "Efectivo" | "Transferencia" | "Culqi";
export type InvoiceStatusDB = "pagado" | "parcial" | "pendiente" | "vencido";

export interface DBInvoice {
  id: string;
  family_id: string;
  concept: string;
  amount: number;           // INMUTABLE — precio original
  amount_paid: number;
  remaining_balance: number;
  due_date: string;
  status: InvoiceStatusDB;
  payment_method: PaymentMethodDB | null;
  reminded_at: string | null;
  culqi_charge_id: string | null;
  created_at: string;
  updated_at: string;
  // Joins embebidos:
  families?: {
    family_name: string;
    email: string;
    primary_guardian_name: string;
    primary_guardian_phone: string;
  };
}

export interface DBPaymentAuditLog {
  id: string;
  invoice_id: string;
  registered_by_user_id: string;
  registered_by_role: string;
  amount: number;
  payment_method: PaymentMethodDB;
  voucher_reference: string | null;
  note: string | null;
  culqi_token_id: string | null;
  created_at: string;
}

export interface DueSoonInvoice {
  invoice_id: string;
  family_name: string;
  amount: number;
  remaining: number;
  due_date: string;
  days_to_due: number;
  email: string;
  phone: string;
}

export function mapDBInvoiceToInvoice(db: DBInvoice): import("@/store/app-store").Invoice {
  return {
    id: db.id,
    family: db.families?.family_name || "Familia",
    student: db.families?.primary_guardian_name || "Alumno",
    phone: db.families?.primary_guardian_phone || "987654321",
    concept: db.concept || "Mensualidad Agosto 2026",
    amount: Number(db.amount) || 297,
    amountPaid: Number(db.amount_paid) || 0,
    remainingBalance: Number(db.remaining_balance) || 0,
    dueDate: db.due_date || "2026-08-31",
    status: db.status || "pendiente",
    daysToDue: 10,
    paymentMethod: db.payment_method ? (db.payment_method as any) : undefined,
    remindedAt: db.reminded_at || undefined,
    paymentLogs: [],
    items: [],
  };
}

// ---------------------------------------------------------------
// EDGE: getInvoices
// Carga recibos con datos de familia. Staff ve todos excepto
// company_expenses (controlado por RLS, no por este edge).
// ---------------------------------------------------------------
export async function getInvoices(
  userRole: Role,
  filterStatus?: InvoiceStatusDB,
): Promise<DBInvoice[]> {
  assertRole(userRole, ["super_admin", "staff"], "ver facturas");

  const params: Record<string, string> = { order: "due_date.asc" };
  if (filterStatus) params["status"] = `eq.${filterStatus}`;

  return postgrestSelect<DBInvoice>(
    "invoices",
    params,
    "id,family_id,concept,amount,amount_paid,remaining_balance,due_date,status,payment_method,reminded_at,culqi_charge_id,families(family_name,email,primary_guardian_name,primary_guardian_phone)",
  );
}

// ---------------------------------------------------------------
// EDGE: getInvoicesDueSoon
// Llama a la función PG que retorna facturas venciendo en N días.
// Alimenta el widget de alertas del Dashboard.
// ---------------------------------------------------------------
export async function getInvoicesDueSoon(
  userRole: Role,
  daysAhead = 2,
): Promise<DueSoonInvoice[]> {
  assertRole(userRole, ["super_admin", "staff"], "ver alertas de vencimiento");
  return postgrestRPC<DueSoonInvoice[]>("get_invoices_due_soon", { days_ahead: daysAhead });
}

// ---------------------------------------------------------------
// EDGE: registerPayment (Abono por WhatsApp: Yape/Efectivo/Transferencia)
//
// Flujo anti-fraude de 2 pasos (edge bifurcado):
//   1. INSERT en payment_audit_logs (inmutable, siempre primero)
//   2. PATCH en invoices (actualiza saldo)
//
// Si el paso 1 falla → el paso 2 NO se ejecuta (protección integridad).
// ---------------------------------------------------------------
export async function registerPayment(
  userRole: Role,
  userId: string,
  invoiceId: string,
  payload: {
    amount: number;
    method: PaymentMethodDB;
    voucherRef?: string;
    note?: string;
    culqiTokenId?: string;
    culqiChargeId?: string;
  },
  currentInvoice: Pick<DBInvoice, "amount" | "amount_paid" | "remaining_balance">,
): Promise<{ auditLog: DBPaymentAuditLog; updatedInvoice: DBInvoice }> {
  // [RBAC Gate]
  assertRole(userRole, ["super_admin", "staff"], "registrar abono");

  // [Payload validation]
  if (payload.amount <= 0) {
    throw new InsforgeEdgeError("API_ERROR", "El monto del abono debe ser mayor a cero.");
  }
  if (payload.amount > currentInvoice.remaining_balance) {
    throw new InsforgeEdgeError(
      "API_ERROR",
      `El abono (S/ ${payload.amount}) supera el saldo pendiente (S/ ${currentInvoice.remaining_balance}).`,
    );
  }

  // [Anti-Fraude Gate] — PASO 1: Insertar audit log (inmutable)
  const auditLog = await postgrestInsert<DBPaymentAuditLog>("payment_audit_logs", {
    invoice_id: invoiceId,
    registered_by_user_id: userId,
    registered_by_role: userRole,
    amount: payload.amount,
    payment_method: payload.method,
    voucher_reference: payload.voucherRef ?? null,
    note: payload.note ?? "Abono registrado vía WhatsApp",
    culqi_token_id: payload.culqiTokenId ?? null,
  });

  // [Success Edge] — PASO 2: Actualizar saldo del invoice
  const newAmountPaid = Math.min(
    currentInvoice.amount,
    currentInvoice.amount_paid + payload.amount,
  );
  const newRemaining = Math.max(0, currentInvoice.amount - newAmountPaid);
  const newStatus: InvoiceStatusDB = newRemaining === 0 ? "pagado" : "parcial";

  const updatePayload: Partial<DBInvoice> = {
    amount_paid: newAmountPaid,
    remaining_balance: newRemaining,
    status: newStatus,
    payment_method: payload.method,
  };
  if (payload.culqiChargeId) updatePayload.culqi_charge_id = payload.culqiChargeId;

  const updatedInvoice = await postgrestPatch<DBInvoice>(
    "invoices",
    { id: `eq.${invoiceId}` },
    updatePayload,
  );

  return { auditLog, updatedInvoice };
}

// ---------------------------------------------------------------
// EDGE: markReminded
// Registra que se envió recordatorio a 2 días de vencer.
// ---------------------------------------------------------------
export async function markReminded(
  userRole: Role,
  invoiceId: string,
): Promise<DBInvoice> {
  assertRole(userRole, ["super_admin", "staff"], "enviar recordatorio de cobro");
  return postgrestPatch<DBInvoice>(
    "invoices",
    { id: `eq.${invoiceId}` },
    { reminded_at: new Date().toISOString() },
  );
}

// ---------------------------------------------------------------
// EDGE: getAuditLogsForInvoice
// Solo super_admin y staff pueden ver el audit trail.
// ---------------------------------------------------------------
export async function getAuditLogsForInvoice(
  userRole: Role,
  invoiceId: string,
): Promise<DBPaymentAuditLog[]> {
  assertRole(userRole, ["super_admin", "staff"], "ver bitácora de auditoría");
  return postgrestSelect<DBPaymentAuditLog>(
    "payment_audit_logs",
    { invoice_id: `eq.${invoiceId}`, order: "created_at.desc" },
  );
}

// ---------------------------------------------------------------
// EDGE: createInvoice (solo super_admin puede crear recibos nuevos)
// ---------------------------------------------------------------
export async function createInvoice(
  userRole: Role,
  payload: Pick<DBInvoice, "family_id" | "concept" | "amount" | "due_date">,
): Promise<DBInvoice> {
  assertRole(userRole, ["super_admin"], "crear recibo");
  return postgrestInsert<DBInvoice>("invoices", {
    ...payload,
    remaining_balance: payload.amount,
    status: "pendiente",
  });
}
