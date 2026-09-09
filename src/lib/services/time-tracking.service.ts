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
// MAPEO DE UUIDs DE PROFESORES EN POSTGRESQL
// ---------------------------------------------------------------
export function resolveTeacherUserId(email?: string, name?: string): string {
  const e = (email || "").toLowerCase();
  const n = (name || "").toLowerCase();
  if (e.includes("jeremy") || n.includes("jeremy")) return "00000000-0000-0000-0000-000000000003";
  if (e.includes("fernando") || n.includes("fernando")) return "00000000-0000-0000-0000-000000000004";
  if (e.includes("nathaly") || n.includes("nathaly")) return "00000000-0000-0000-0000-000000000005";
  return "00000000-0000-0000-0000-000000000006"; // Profesor Demo / General
}

export function saveShiftToLocalCache(shift: DBTeacherTimeLog) {
  try {
    const existing = getShiftsFromLocalCache();
    const updated = [shift, ...existing.filter((s) => s.id !== shift.id)];
    localStorage.setItem("cadencia-active-shifts", JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getShiftsFromLocalCache(): DBTeacherTimeLog[] {
  try {
    const raw = localStorage.getItem("cadencia-active-shifts");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------
// EDGE: clockIn (Profesor marca entrada)
// ---------------------------------------------------------------
export async function clockIn(
  userRole: Role,
  teacherId: string,
  teacherName: string,
): Promise<DBTeacherTimeLog> {
  assertRole(userRole, ["teacher", "super_admin", "staff"], "marcar entrada");

  // Validar formato UUID para la foreign key en PostgreSQL
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(teacherId);
  const resolvedId = isUuid ? teacherId : resolveTeacherUserId(teacherId, teacherName);

  // 1. Verificar si ya tiene un turno activo sin cerrar en PostgreSQL
  try {
    const activeLogs = await postgrestSelect<DBTeacherTimeLog>("teacher_time_logs", {
      teacher_id: `eq.${resolvedId}`,
      status: "neq.finalizado",
    });

    if (activeLogs.length > 0) {
      saveShiftToLocalCache(activeLogs[0]);
      return activeLogs[0];
    }
  } catch {
    // continuar
  }

  // 2. Insertar nuevo turno en PostgreSQL
  try {
    const newLog = await postgrestInsert<DBTeacherTimeLog>("teacher_time_logs", {
      teacher_id: resolvedId,
      teacher_name: teacherName,
      status: "trabajando",
      clock_in: new Date().toISOString(),
      break_minutes: 0,
      origin_device: "kiosk_mobile",
    });

    saveShiftToLocalCache(newLog);
    return newLog;
  } catch (err) {
    console.warn("Aviso Insforge en clockIn, activando fallback sincronizado:", err);
    const localLog: DBTeacherTimeLog = {
      id: `local-shift-${Date.now()}`,
      teacher_id: resolvedId,
      teacher_name: teacherName,
      status: "trabajando",
      clock_in: new Date().toISOString(),
      clock_out: null,
      break_minutes: 0,
      total_minutes_worked: 0,
      origin_device: "kiosk_mobile",
      is_closed: false,
      payroll_closing_id: null,
      created_at: new Date().toISOString(),
    };
    saveShiftToLocalCache(localLog);
    return localLog;
  }
}

// ---------------------------------------------------------------
// EDGE: toggleBreak (Profesor inicia / termina pausa)
// ---------------------------------------------------------------
export async function toggleBreak(
  userRole: Role,
  shiftId: string,
  currentStatus: ShiftStatus,
): Promise<DBTeacherTimeLog> {
  assertRole(userRole, ["teacher", "super_admin", "staff"], "cambiar estado de pausa");

  const newStatus: ShiftStatus = currentStatus === "pausa" ? "trabajando" : "pausa";

  try {
    const res = await postgrestPatch<DBTeacherTimeLog>(
      "teacher_time_logs",
      { id: `eq.${shiftId}` },
      { status: newStatus },
    );
    saveShiftToLocalCache(res);
    return res;
  } catch {
    const local = getShiftsFromLocalCache().map((s) =>
      s.id === shiftId ? { ...s, status: newStatus } : s
    );
    localStorage.setItem("cadencia-active-shifts", JSON.stringify(local));
    const target = local.find((s) => s.id === shiftId);
    return target || {
      id: shiftId,
      teacher_id: "00000000-0000-0000-0000-000000000006",
      teacher_name: "Profesor",
      clock_in: new Date().toISOString(),
      clock_out: null,
      break_minutes: 0,
      total_minutes_worked: 0,
      status: newStatus,
      origin_device: "kiosk_mobile",
      is_closed: false,
      payroll_closing_id: null,
      created_at: new Date().toISOString(),
    };
  }
}

// ---------------------------------------------------------------
// EDGE: clockOut (Profesor marca salida)
// ---------------------------------------------------------------
export async function clockOut(
  userRole: Role,
  shiftId: string,
): Promise<DBTeacherTimeLog> {
  assertRole(userRole, ["teacher", "super_admin", "staff"], "marcar salida");

  const nowIso = new Date().toISOString();
  try {
    const res = await postgrestPatch<DBTeacherTimeLog>(
      "teacher_time_logs",
      { id: `eq.${shiftId}` },
      {
        status: "finalizado",
        clock_out: nowIso,
      },
    );
    const local = getShiftsFromLocalCache().filter((s) => s.id !== shiftId);
    localStorage.setItem("cadencia-active-shifts", JSON.stringify(local));
    return res;
  } catch {
    const local = getShiftsFromLocalCache().filter((s) => s.id !== shiftId);
    localStorage.setItem("cadencia-active-shifts", JSON.stringify(local));
    return {
      id: shiftId,
      teacher_id: "00000000-0000-0000-0000-000000000006",
      teacher_name: "Profesor",
      clock_in: nowIso,
      clock_out: nowIso,
      break_minutes: 0,
      total_minutes_worked: 0,
      status: "finalizado",
      origin_device: "kiosk_mobile",
      is_closed: true,
      payroll_closing_id: null,
      created_at: nowIso,
    };
  }
}

// ---------------------------------------------------------------
// EDGE: getActiveShift (Obtiene turno activo del profesor individual)
// ---------------------------------------------------------------
export async function getActiveShift(
  teacherId: string,
  teacherName?: string,
): Promise<DBTeacherTimeLog | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(teacherId);
  const resolvedId = isUuid ? teacherId : resolveTeacherUserId(teacherId, teacherName);

  try {
    const active = await postgrestSelect<DBTeacherTimeLog>("teacher_time_logs", {
      teacher_id: `eq.${resolvedId}`,
      status: "neq.finalizado",
      limit: "1",
    });
    if (active && active.length > 0) return active[0];
  } catch (err) {
    console.warn("Aviso al consultar turno activo en Insforge:", err);
  }

  // Fallback a caché local y auto-sincronización con PostgreSQL si estaba pendiente
  const local = getShiftsFromLocalCache().find(
    (s) => (s.teacher_id === resolvedId || s.teacher_name === teacherName) && s.status !== "finalizado"
  );

  if (local && local.id.startsWith("local-shift-")) {
    try {
      const synced = await postgrestInsert<DBTeacherTimeLog>("teacher_time_logs", {
        teacher_id: local.teacher_id,
        teacher_name: local.teacher_name,
        status: local.status,
        clock_in: local.clock_in,
        break_minutes: local.break_minutes || 0,
        origin_device: local.origin_device || "kiosk_mobile",
      });
      saveShiftToLocalCache(synced);
      return synced;
    } catch (e) {
      console.warn("Aviso al auto-sincronizar turno pendiente:", e);
    }
  }

  return local ?? null;
}

// ---------------------------------------------------------------
// EDGE: getAllActiveShifts (Super Admin / Staff ven todos los profes en sede EN VIVO)
// ---------------------------------------------------------------
export async function getAllActiveShifts(): Promise<DBTeacherTimeLog[]> {
  try {
    const remote = await postgrestSelect<DBTeacherTimeLog>("teacher_time_logs", {
      status: "neq.finalizado",
      order: "clock_in.desc",
    });

    const local = getShiftsFromLocalCache().filter((s) => s.status !== "finalizado");
    const combinedMap = new Map<string, DBTeacherTimeLog>();
    remote.forEach((r) => combinedMap.set(r.id, r));
    local.forEach((l) => {
      if (!combinedMap.has(l.id)) combinedMap.set(l.id, l);
    });

    return Array.from(combinedMap.values());
  } catch (err) {
    console.warn("Aviso al consultar turnos de Insforge, usando fallback:", err);
    return getShiftsFromLocalCache().filter((s) => s.status !== "finalizado");
  }
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
