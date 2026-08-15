/**
 * time-tracking.service.ts — Servicio de Control Horario y Reporte de Nómina
 */

import {
  assertRole,
  postgrestInsert,
  postgrestPatch,
  postgrestRPC,
  postgrestSelect,
  InsforgeEdgeError,
} from "@/lib/insforge";
import type { Role } from "@/store/app-store";

export type ShiftStatus = "trabajando" | "pausa" | "finalizado";

export interface DBTeacherTimeLog {
  id: string;
  teacher_id: string;
  teacher_name: string;
  clock_in: string;
  clock_out: string | null;
  break_minutes: number;
  total_minutes_worked: number;
  status: ShiftStatus;
  origin_device: string;
  is_closed: boolean;
  payroll_closing_id: string | null;
  created_at: string;
}

export interface PayrollReportRow {
  teacher_id: string;
  teacher_name: string;
  shift_count: number;
  total_minutes: number;
  total_hours: number;
}

// ---------------------------------------------------------------
// EDGE: clockIn (Profesor marca entrada)
// ---------------------------------------------------------------
export async function clockIn(
  userRole: Role,
  teacherId: string,
  teacherName: string,
): Promise<DBTeacherTimeLog> {
  assertRole(userRole, ["teacher"], "marcar entrada");

  // Verificar si ya tiene un turno activo sin cerrar
  const activeLogs = await postgrestSelect<DBTeacherTimeLog>("teacher_time_logs", {
    teacher_id: `eq.${teacherId}`,
    status: "neq.finalizado",
  });

  if (activeLogs.length > 0) {
    throw new InsforgeEdgeError("ALREADY_ACTIVE", "Ya tienes un turno activo en curso.");
  }

  return postgrestInsert<DBTeacherTimeLog>("teacher_time_logs", {
    teacher_id: teacherId,
    teacher_name: teacherName,
    status: "trabajando",
    clock_in: new Date().toISOString(),
    break_minutes: 0,
    origin_device: "kiosk_mobile",
  });
}

// ---------------------------------------------------------------
// EDGE: toggleBreak (Profesor inicia / termina pausa)
// ---------------------------------------------------------------
export async function toggleBreak(
  userRole: Role,
  shiftId: string,
  currentStatus: ShiftStatus,
): Promise<DBTeacherTimeLog> {
  assertRole(userRole, ["teacher"], "cambiar estado de pausa");

  const newStatus: ShiftStatus = currentStatus === "pausa" ? "trabajando" : "pausa";

  return postgrestPatch<DBTeacherTimeLog>(
    "teacher_time_logs",
    { id: `eq.${shiftId}` },
    { status: newStatus },
  );
}

// ---------------------------------------------------------------
// EDGE: clockOut (Profesor marca salida)
// ---------------------------------------------------------------
export async function clockOut(
  userRole: Role,
  shiftId: string,
): Promise<DBTeacherTimeLog> {
  assertRole(userRole, ["teacher"], "marcar salida");

  return postgrestPatch<DBTeacherTimeLog>(
    "teacher_time_logs",
    { id: `eq.${shiftId}` },
    {
      status: "finalizado",
      clock_out: new Date().toISOString(),
    },
  );
}

// ---------------------------------------------------------------
// EDGE: getActiveShift (Obtiene turno activo del profesor)
// ---------------------------------------------------------------
export async function getActiveShift(
  teacherId: string,
): Promise<DBTeacherTimeLog | null> {
  const active = await postgrestSelect<DBTeacherTimeLog>("teacher_time_logs", {
    teacher_id: `eq.${teacherId}`,
    status: "neq.finalizado",
    limit: "1",
  });
  return active[0] ?? null;
}

// ---------------------------------------------------------------
// EDGE: generatePayrollReport (Super Admin / Staff generan reporte)
// ---------------------------------------------------------------
export async function generatePayrollReport(
  userRole: Role,
  userId: string,
  startDate: string,
  endDate: string,
): Promise<PayrollReportRow[]> {
  assertRole(userRole, ["super_admin", "staff"], "generar reporte de horas");

  return postgrestRPC<PayrollReportRow[]>("generate_payroll_hours_report", {
    p_start_date: startDate,
    p_end_date: endDate,
    p_user_id: userId,
  });
}

// ---------------------------------------------------------------
// HELPER: exportPayrollToCSV (Genera archivo CSV de horas para Excel)
// ---------------------------------------------------------------
export function exportPayrollToCSV(
  rows: PayrollReportRow[],
  startDate: string,
  endDate: string,
): void {
  const BOM = "\uFEFF";
  const headerLines = [
    `"REPORTE CONSOLIDADO DE HORAS TRABAJADAS — VIBRA MUSIC"`,
    `"Periodo:","Del ${startDate} al ${endDate}"`,
    `""`,
  ];

  const columnHeaders = [
    '"Profesor"',
    '"N° Turnos / Días"',
    '"Total Minutos"',
    '"Total Horas Netas (Decimal)"',
  ].join(",");

  const dataRows = rows.map((r) =>
    [
      `"${r.teacher_name}"`,
      `"${r.shift_count}"`,
      `"${r.total_minutes}"`,
      `"${r.total_hours.toFixed(2)}"`,
    ].join(","),
  );

  const csvContent = [BOM, ...headerLines, columnHeaders, ...dataRows].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `reporte-horas-vibramusic-${startDate}-a-${endDate}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
