/**
 * ================================================================
 * closing.service.ts — Cierre de Caja Diario & Exportación CSV
 * ================================================================
 *
 * MAPA DE EDGES DEL GRAFO (Insforge):
 *
 * [UI: Botón "Cerrar Caja del Día"]
 *   │
 *   ├─[Edge 1: RBAC Gate] → solo super_admin / staff
 *   ├─[Edge 2: Idempotency Check] → ¿ya existe cierre para hoy?
 *   │    └─ Sí → Error 'ALREADY_CLOSED' → toast warning
 *   ├─[Edge 3: RPC → perform_daily_closing()]
 *   │    ├─ Suma pagos por método
 *   │    ├─ INSERT en daily_closings
 *   │    └─ UPDATE payment_audit_logs SET is_closed = TRUE (bloqueo)
 *   ├─[Edge Success] → genera CSV + muestra resumen
 *   └─[Edge Error]   → toast + syncQueue (sin bloqueo parcial)
 *
 * [UI: Historial de Cierres] → solo super_admin
 * ================================================================
 */

import {
  assertRole,
  postgrestRPC,
  postgrestSelect,
} from "@/lib/insforge";
import type { Role } from "@/store/app-store";

// ---------------------------------------------------------------
// Tipos DB
// ---------------------------------------------------------------
export type ClosingStatus = "abierto" | "cerrado" | "exportado";

export interface DBDailyClosing {
  id: string;
  closing_date: string;
  total_cash: number;
  total_yape: number;
  total_transfer: number;
  total_culqi_card: number;
  total_day: number;
  num_transactions: number;
  closed_by_user_id: string;
  closed_by_role: string;
  status: ClosingStatus;
  export_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface ClosingDetailRow {
  fecha: string;
  familia: string;
  concepto: string;
  metodo_pago: string;
  monto: number;
  n_operacion: string;
  registrado_por: string;
  nota: string;
}

// ---------------------------------------------------------------
// EDGE: performDailyClosing
// Ejecuta el cierre de caja del día especificado.
// Llama a la función PostgreSQL SECURITY DEFINER.
// ---------------------------------------------------------------
export async function performDailyClosing(
  userRole: Role,
  userId: string,
  closingDate?: string,  // ISO 'YYYY-MM-DD'. Si no se pasa, usa hoy (Lima)
): Promise<DBDailyClosing> {
  // [RBAC Gate]
  assertRole(userRole, ["super_admin", "staff"], "ejecutar cierre de caja");

  // Fecha en zona horaria de Lima
  const date =
    closingDate ??
    new Date()
      .toLocaleDateString("sv-SE", { timeZone: "America/Lima" });

  const result = await postgrestRPC<DBDailyClosing[]>("perform_daily_closing", {
    p_closing_date: date,
    p_user_id: userId,
  });

  if (!result || result.length === 0) {
    throw new Error("El cierre no retornó datos.");
  }
  return result[0]!;
}

// ---------------------------------------------------------------
// EDGE: getClosingDetail
// Devuelve el detalle línea a línea de un cierre (para CSV).
// ---------------------------------------------------------------
export async function getClosingDetail(
  userRole: Role,
  closingId: string,
): Promise<ClosingDetailRow[]> {
  assertRole(userRole, ["super_admin", "staff"], "ver detalle del cierre");
  return postgrestRPC<ClosingDetailRow[]>("get_closing_detail_for_csv", {
    p_closing_id: closingId,
  });
}

// ---------------------------------------------------------------
// EDGE: getClosingHistory
// Historial de cierres pasados — solo super_admin.
// ---------------------------------------------------------------
export async function getClosingHistory(
  userRole: Role,
  limit = 30,
): Promise<DBDailyClosing[]> {
  assertRole(userRole, ["super_admin"], "ver historial de cierres");
  return postgrestSelect<DBDailyClosing>(
    "daily_closings",
    { order: "closing_date.desc", limit: String(limit) },
  );
}

// ---------------------------------------------------------------
// HELPER: exportClosingToCSV
// Genera y descarga un archivo .csv en el navegador del usuario.
// No requiere servidor — puro client-side con Blob API.
// ---------------------------------------------------------------
export function exportClosingToCSV(
  rows: ClosingDetailRow[],
  closingDate: string,
  summary: Pick<DBDailyClosing, "total_cash" | "total_yape" | "total_transfer" | "total_culqi_card" | "total_day" | "num_transactions">,
): void {
  const BOM = "\uFEFF";  // BOM para compatibilidad con Excel en español

  // Cabecera del resumen
  const headerLines = [
    `"CIERRE DE CAJA DIARIO — VIBRA MUSIC"`,
    `"Fecha:","${closingDate}"`,
    `"Total Efectivo:","S/ ${summary.total_cash.toFixed(2)}"`,
    `"Total Yape:","S/ ${summary.total_yape.toFixed(2)}"`,
    `"Total Transferencia:","S/ ${summary.total_transfer.toFixed(2)}"`,
    `"Total Culqi (Tarjeta):","S/ ${summary.total_culqi_card.toFixed(2)}"`,
    `"TOTAL DEL DÍA:","S/ ${summary.total_day.toFixed(2)}"`,
    `"N° Transacciones:","${summary.num_transactions}"`,
    `""`,
  ];

  // Columnas del detalle
  const columnHeaders = [
    '"Fecha/Hora"',
    '"Familia"',
    '"Concepto"',
    '"Método de Pago"',
    '"Monto (S/)"',
    '"N° Operación"',
    '"Registrado Por"',
    '"Nota"',
  ].join(",");

  // Filas de detalle
  const dataRows = rows.map((row) =>
    [
      `"${row.fecha}"`,
      `"${row.familia}"`,
      `"${row.concepto}"`,
      `"${row.metodo_pago}"`,
      `"${row.monto.toFixed(2)}"`,
      `"${row.n_operacion}"`,
      `"${row.registrado_por}"`,
      `"${row.nota}"`,
    ].join(","),
  );

  const csvContent = [
    BOM,
    ...headerLines,
    columnHeaders,
    ...dataRows,
  ].join("\r\n");

  // Descarga en el navegador
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cierre-caja-vibramusic-${closingDate}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
