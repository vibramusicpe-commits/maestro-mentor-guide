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

export interface TeacherMonthlySummary {
  teacherId: string;
  teacherName: string;
  specialty?: string;
  totalShifts: number;
  totalMinutes: number;
  totalHours: number;
  lastShiftDate: string | null;
  lastShiftStatus: ShiftStatus | "fuera";
  isCurrentlyInSede: boolean;
}

import { formatDistance, type ShiftLocationMeta } from "./geolocation.service";

export interface ShiftDeviceMeta {
  device: string;
  in?: ShiftLocationMeta;
  out?: ShiftLocationMeta;
}

export function parseShiftLocation(shift?: DBTeacherTimeLog | null): ShiftDeviceMeta {
  if (!shift || !shift.origin_device) return { device: "kiosk_mobile" };
  try {
    if (shift.origin_device.startsWith("{")) {
      return JSON.parse(shift.origin_device);
    }
  } catch {}
  return { device: shift.origin_device };
}

// ---------------------------------------------------------------
// MAPEO DE UUIDs DE PROFESORES Y STAFF EN POSTGRESQL
// ---------------------------------------------------------------
export function resolveTeacherUserId(email?: string, name?: string): string {
  const e = (email || "").toLowerCase();
  const n = (name || "").toLowerCase();
  if (e.includes("jeremy") || n.includes("jeremy")) return "00000000-0000-0000-0000-000000000003";
  if (e.includes("fernando") || n.includes("fernando")) return "00000000-0000-0000-0000-000000000004";
  if (e.includes("nathaly") || n.includes("nathaly")) return "00000000-0000-0000-0000-000000000005";
  if (e.includes("karla") || n.includes("karla")) return "00000000-0000-0000-0000-000000000008"; // Karla (Staff / Secretaría)
  if (e.includes("sergio") || n.includes("sergio")) return "00000000-0000-0000-0000-000000000007"; // Sergio (Dirección)
  if (e.includes("fabricio") || n.includes("fabricio")) return "00000000-0000-0000-0000-000000000009"; // Fabricio (Marketing)
  if (e.includes("dueña") || e.includes("duena") || n.includes("dueña") || n.includes("rocío") || n.includes("rocio")) return "00000000-0000-0000-0000-000000000001"; // Rocío (Dueña)
  if (e.includes("nayeli") || n.includes("nayeli")) return "00000000-0000-0000-0000-000000000002"; // Nayeli (Secretaría)
  return "00000000-0000-0000-0000-000000000006"; // Profesor Demo / General
}

export const SHIFT_SYNC_CHANNEL = "vibra_shifts_channel";
export const SHIFT_STORAGE_KEY = "cadencia-active-shifts";
export const SHIFT_SYNC_EVENT_KEY = "vibra-shift-last-sync";
// Duración máxima de un turno antes de considerarse zombie / abandonado de días anteriores (14 horas)
export const MAX_SHIFT_DURATION_HOURS = 14;

export function notifyShiftUpdated(teacherId?: string) {
  try {
    if (typeof window !== "undefined") {
      // 1. BroadcastChannel en tiempo real entre pestañas
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel(SHIFT_SYNC_CHANNEL);
        bc.postMessage({ type: "SHIFT_UPDATED", teacherId, timestamp: Date.now() });
        bc.close();
      }
      // 2. Storage event nativo para sincronización entre pestañas
      window.localStorage.setItem(SHIFT_SYNC_EVENT_KEY, Date.now().toString());
      // 3. CustomEvent en la misma ventana para reactividad inmediata
      window.dispatchEvent(new CustomEvent("vibra-shift-updated", { detail: { teacherId } }));
    }
  } catch {
    // ignore
  }
}

export function saveShiftToLocalCache(shift: DBTeacherTimeLog) {
  try {
    const existing = getShiftsFromLocalCache();
    const updated = [shift, ...existing.filter((s) => s.id !== shift.id)];
    localStorage.setItem(SHIFT_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function clearShiftFromLocalCache(shiftId: string) {
  try {
    const existing = getShiftsFromLocalCache();
    const updated = existing.filter((s) => s.id !== shiftId);
    localStorage.setItem(SHIFT_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function purgeStaleShiftsFromLocalCache(teacherId?: string) {
  try {
    const now = Date.now();
    const maxAgeMs = MAX_SHIFT_DURATION_HOURS * 3600 * 1000;
    const existing = getShiftsFromLocalCache();
    const filtered = existing.filter((s) => {
      if (s.status === "finalizado") return false;
      if (teacherId && s.teacher_id === teacherId && s.status === "finalizado") return false;
      const clockInMs = new Date(s.clock_in).getTime();
      if (isNaN(clockInMs) || now - clockInMs > maxAgeMs) {
        return false; // eliminar turnos zombies de más de 14 horas
      }
      return true;
    });
    localStorage.setItem(SHIFT_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

export function getShiftsFromLocalCache(): DBTeacherTimeLog[] {
  try {
    const raw = localStorage.getItem(SHIFT_STORAGE_KEY);
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
  location?: ShiftLocationMeta,
): Promise<DBTeacherTimeLog> {
  assertRole(userRole, ["teacher", "super_admin", "staff"], "marcar entrada");

  // Validar formato UUID para la foreign key en PostgreSQL
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(teacherId);
  const resolvedId = isUuid ? teacherId : resolveTeacherUserId(teacherId, teacherName);

  purgeStaleShiftsFromLocalCache(resolvedId);

  const deviceMeta: ShiftDeviceMeta = {
    device: "kiosk_mobile",
    ...(location ? { in: location } : {}),
  };
  const originDeviceStr = JSON.stringify(deviceMeta);

  // 1. Verificar si ya tiene un turno activo en PostgreSQL
  try {
    const activeLogs = await postgrestSelect<DBTeacherTimeLog>("teacher_time_logs", {
      teacher_id: `eq.${resolvedId}`,
      status: "neq.finalizado",
    });

    if (activeLogs.length > 0) {
      const activeLog = activeLogs[0];
      const elapsedHours = (Date.now() - new Date(activeLog.clock_in).getTime()) / (1000 * 3600);
      if (elapsedHours > MAX_SHIFT_DURATION_HOURS) {
        // Auto-finalizar turno zombie abandonado de días anteriores en la BD
        const autoOutTime = new Date(new Date(activeLog.clock_in).getTime() + 4 * 3600 * 1000).toISOString();
        await postgrestPatch<DBTeacherTimeLog>(
          "teacher_time_logs",
          { id: `eq.${activeLog.id}` },
          {
            status: "finalizado",
            clock_out: autoOutTime,
            total_minutes_worked: 240,
            is_closed: true,
          }
        ).catch(() => {});
        clearShiftFromLocalCache(activeLog.id);
        // Continuar para abrir el turno fresco de hoy
      } else {
        saveShiftToLocalCache(activeLog);
        notifyShiftUpdated(resolvedId);
        return activeLog;
      }
    }
  } catch {
    // continuar si falla la lectura
  }

  // 2. Insertar nuevo turno en PostgreSQL
  try {
    const newLog = await postgrestInsert<DBTeacherTimeLog>("teacher_time_logs", {
      teacher_id: resolvedId,
      teacher_name: teacherName,
      status: "trabajando",
      clock_in: new Date().toISOString(),
      break_minutes: 0,
      origin_device: originDeviceStr,
    });

    saveShiftToLocalCache(newLog);
    notifyShiftUpdated(resolvedId);
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
      origin_device: originDeviceStr,
      is_closed: false,
      payroll_closing_id: null,
      created_at: new Date().toISOString(),
    };
    saveShiftToLocalCache(localLog);
    notifyShiftUpdated(resolvedId);
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
    notifyShiftUpdated(res.teacher_id);
    return res;
  } catch {
    const local = getShiftsFromLocalCache().map((s) =>
      s.id === shiftId ? { ...s, status: newStatus } : s
    );
    localStorage.setItem(SHIFT_STORAGE_KEY, JSON.stringify(local));
    notifyShiftUpdated();
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
  location?: ShiftLocationMeta,
): Promise<DBTeacherTimeLog> {
  assertRole(userRole, ["teacher", "super_admin", "staff"], "marcar salida");

  const nowIso = new Date().toISOString();

  // Obtener metadatos previos de entrada para combinarlos con la salida
  const localCached = getShiftsFromLocalCache().find((s) => s.id === shiftId);
  const currentMeta = parseShiftLocation(localCached);
  if (location) {
    currentMeta.out = location;
  }
  const updatedOriginDevice = JSON.stringify(currentMeta);

  try {
    const res = await postgrestPatch<DBTeacherTimeLog>(
      "teacher_time_logs",
      { id: `eq.${shiftId}` },
      {
        status: "finalizado",
        clock_out: nowIso,
        origin_device: updatedOriginDevice,
      },
    );
    clearShiftFromLocalCache(shiftId);
    notifyShiftUpdated(res.teacher_id);
    return res;
  } catch {
    clearShiftFromLocalCache(shiftId);
    notifyShiftUpdated();
    return {
      id: shiftId,
      teacher_id: "00000000-0000-0000-0000-000000000006",
      teacher_name: "Profesor",
      clock_in: nowIso,
      clock_out: nowIso,
      break_minutes: 0,
      total_minutes_worked: 0,
      status: "finalizado",
      origin_device: updatedOriginDevice,
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

  purgeStaleShiftsFromLocalCache(resolvedId);

  let pgQueriedSuccessfully = false;

  try {
    const active = await postgrestSelect<DBTeacherTimeLog>("teacher_time_logs", {
      teacher_id: `eq.${resolvedId}`,
      status: "neq.finalizado",
      limit: "1",
    });
    pgQueriedSuccessfully = true;

    if (active && active.length > 0) {
      const shift = active[0];
      const elapsedHours = (Date.now() - new Date(shift.clock_in).getTime()) / (1000 * 3600);
      if (elapsedHours > MAX_SHIFT_DURATION_HOURS) {
        // Auto-cerrar turno zombie abandonado de días anteriores en la BD
        const autoOutTime = new Date(new Date(shift.clock_in).getTime() + 4 * 3600 * 1000).toISOString();
        await postgrestPatch<DBTeacherTimeLog>(
          "teacher_time_logs",
          { id: `eq.${shift.id}` },
          {
            status: "finalizado",
            clock_out: autoOutTime,
            total_minutes_worked: 240,
            is_closed: true,
          }
        ).catch(() => {});
        clearShiftFromLocalCache(shift.id);
        notifyShiftUpdated(resolvedId);
        return null;
      }
      saveShiftToLocalCache(shift);
      return shift;
    } else {
      // PostgreSQL respondió con éxito y NO HAY TURNO ACTIVO para este docente.
      // Erradicar de inmediato cualquier turno residual de este profesor en la caché local
      const localShifts = getShiftsFromLocalCache();
      const cleaned = localShifts.filter((s) => {
        if (s.teacher_id === resolvedId || (teacherName && s.teacher_name === teacherName)) {
          // Si es un shift offline recién creado (< 5 min), conservarlo para sync
          if (s.id.startsWith("local-shift-")) {
            const ageMin = (Date.now() - new Date(s.clock_in).getTime()) / 60000;
            return ageMin < 5;
          }
          return false;
        }
        return true;
      });
      localStorage.setItem(SHIFT_STORAGE_KEY, JSON.stringify(cleaned));
    }
  } catch (err) {
    console.warn("Aviso al consultar turno activo en Insforge:", err);
  }

  // Fallback a caché local solo si PostgreSQL falló o para turnos locales recientes
  const local = getShiftsFromLocalCache().find(
    (s) => (s.teacher_id === resolvedId || (teacherName && s.teacher_name === teacherName)) && s.status !== "finalizado"
  );

  if (local) {
    const elapsedHours = (Date.now() - new Date(local.clock_in).getTime()) / (1000 * 3600);
    if (elapsedHours > MAX_SHIFT_DURATION_HOURS) {
      clearShiftFromLocalCache(local.id);
      return null;
    }

    if (local.id.startsWith("local-shift-") && !pgQueriedSuccessfully) {
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
        notifyShiftUpdated(resolvedId);
        return synced;
      } catch (e) {
        console.warn("Aviso al auto-sincronizar turno pendiente:", e);
      }
    }
    return local;
  }

  return null;
}

// ---------------------------------------------------------------
// EDGE: getAllActiveShifts (Super Admin / Staff ven todos los profes en sede EN VIVO)
// ---------------------------------------------------------------
export async function getAllActiveShifts(): Promise<DBTeacherTimeLog[]> {
  purgeStaleShiftsFromLocalCache();

  try {
    const remote = await postgrestSelect<DBTeacherTimeLog>("teacher_time_logs", {
      status: "neq.finalizado",
      order: "clock_in.desc",
    });

    const validRemote: DBTeacherTimeLog[] = [];
    const now = Date.now();

    for (const r of remote) {
      const elapsedHours = (now - new Date(r.clock_in).getTime()) / (1000 * 3600);
      if (elapsedHours > MAX_SHIFT_DURATION_HOURS) {
        // Zombie shift: auto-cerrar en background
        const autoOutTime = new Date(new Date(r.clock_in).getTime() + 4 * 3600 * 1000).toISOString();
        postgrestPatch<DBTeacherTimeLog>(
          "teacher_time_logs",
          { id: `eq.${r.id}` },
          {
            status: "finalizado",
            clock_out: autoOutTime,
            total_minutes_worked: 240,
            is_closed: true,
          }
        ).catch(() => {});
        clearShiftFromLocalCache(r.id);
      } else {
        validRemote.push(r);
      }
    }

    // Solo conservar del local turnos offline recientes (< 2 horas) con prefijo local-shift-
    const local = getShiftsFromLocalCache().filter(
      (s) =>
        s.status !== "finalizado" &&
        s.id.startsWith("local-shift-") &&
        now - new Date(s.clock_in).getTime() < 2 * 3600 * 1000
    );

    const combinedMap = new Map<string, DBTeacherTimeLog>();
    validRemote.forEach((r) => combinedMap.set(r.id, r));
    local.forEach((l) => {
      if (!combinedMap.has(l.id)) combinedMap.set(l.id, l);
    });

    return Array.from(combinedMap.values());
  } catch (err) {
    console.warn("Aviso al consultar turnos de Insforge, usando fallback:", err);
    return getShiftsFromLocalCache().filter((s) => {
      if (s.status === "finalizado") return false;
      const elapsedHours = (Date.now() - new Date(s.clock_in).getTime()) / (1000 * 3600);
      return elapsedHours <= MAX_SHIFT_DURATION_HOURS;
    });
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

// ---------------------------------------------------------------
// EDGE: getTeacherTimeLogs (Historial completo de asistencias docentes)
// ---------------------------------------------------------------
export async function getTeacherTimeLogs(params?: {
  teacherId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<DBTeacherTimeLog[]> {
  try {
    const filter: Record<string, string> = {
      order: "clock_in.desc",
      limit: String(params?.limit || 200),
    };

    if (params?.teacherId && params.teacherId !== "todos") {
      filter.teacher_id = `eq.${params.teacherId}`;
    }

    const remote = await postgrestSelect<DBTeacherTimeLog>("teacher_time_logs", filter);
    const local = getShiftsFromLocalCache();

    // Combinar y desduplicar por ID
    const map = new Map<string, DBTeacherTimeLog>();
    remote.forEach((r) => map.set(r.id, r));
    local.forEach((l) => {
      if (!map.has(l.id)) map.set(l.id, l);
    });

    let list = Array.from(map.values()).sort(
      (a, b) => new Date(b.clock_in).getTime() - new Date(a.clock_in).getTime()
    );

    if (params?.teacherId && params.teacherId !== "todos") {
      list = list.filter((s) => s.teacher_id === params.teacherId);
    }
    if (params?.startDate) {
      const startMs = new Date(params.startDate).getTime();
      list = list.filter((s) => new Date(s.clock_in).getTime() >= startMs);
    }
    if (params?.endDate) {
      const endMs = new Date(params.endDate).getTime() + 86400000;
      list = list.filter((s) => new Date(s.clock_in).getTime() <= endMs);
    }

    return list;
  } catch (err) {
    console.warn("Aviso al consultar historial de turnos en Insforge:", err);
    return getShiftsFromLocalCache();
  }
}

// ---------------------------------------------------------------
// HELPER: computeTeacherMonthlySummary (Consolidado por docente para el Dashboard)
// ---------------------------------------------------------------
export function computeTeacherMonthlySummary(
  shifts: DBTeacherTimeLog[],
  activeShifts: DBTeacherTimeLog[],
): TeacherMonthlySummary[] {
  const teachersList = [
    {
      id: "00000000-0000-0000-0000-000000000005",
      name: "Nathaly",
      fullName: "Nathaly (Canto y Piano)",
      specialty: "Canto, Técnica Vocal & Piano",
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      name: "Jeremy",
      fullName: "Jeremy (Batería & Guitarra)",
      specialty: "Batería, Percusión & Guitarra",
    },
    {
      id: "00000000-0000-0000-0000-000000000004",
      name: "Fernando",
      fullName: "Fernando (Guitarra & Violín)",
      specialty: "Guitarra Clásica/Eléctrica & Violín",
    },
    {
      id: "00000000-0000-0000-0000-000000000008",
      name: "Karla",
      fullName: "Karla (Secretaría / Staff)",
      specialty: "Secretaría, Cobranzas & Atención",
    },
    {
      id: "00000000-0000-0000-0000-000000000007",
      name: "Sergio",
      fullName: "Sergio (Dirección)",
      specialty: "Dirección General & Supervisión",
    },
    {
      id: "00000000-0000-0000-0000-000000000009",
      name: "Fabricio",
      fullName: "Fabricio (Marketing)",
      specialty: "Marketing, Growth & Contenidos",
    },
    {
      id: "00000000-0000-0000-0000-000000000006",
      name: "Profesor Demo",
      fullName: "Profesor Demo (General)",
      specialty: "Iniciación Musical & Suplencias",
    },
  ];

  return teachersList.map((t) => {
    const teacherShifts = shifts.filter(
      (s) => s.teacher_id === t.id || s.teacher_name?.toLowerCase().includes(t.name.toLowerCase())
    );

    const activeShift = activeShifts.find(
      (s) => (s.teacher_id === t.id || s.teacher_name?.toLowerCase().includes(t.name.toLowerCase())) && s.status !== "finalizado"
    );

    let totalMinutes = 0;
    teacherShifts.forEach((s) => {
      let mins = s.total_minutes_worked || 0;
      if (mins === 0 && s.clock_out) {
        mins = Math.max(0, Math.floor((new Date(s.clock_out).getTime() - new Date(s.clock_in).getTime()) / 60000) - (s.break_minutes || 0));
      } else if (mins === 0 && !s.clock_out) {
        mins = Math.max(0, Math.floor((Date.now() - new Date(s.clock_in).getTime()) / 60000) - (s.break_minutes || 0));
      }
      totalMinutes += mins;
    });

    const latestShift = teacherShifts[0];

    return {
      teacherId: t.id,
      teacherName: t.fullName,
      specialty: t.specialty,
      totalShifts: teacherShifts.length,
      totalMinutes,
      totalHours: Number((totalMinutes / 60).toFixed(2)),
      lastShiftDate: latestShift ? latestShift.clock_in : null,
      lastShiftStatus: activeShift ? activeShift.status : (latestShift ? latestShift.status : "fuera"),
      isCurrentlyInSede: !!activeShift,
    };
  });
}

// ---------------------------------------------------------------
// HELPER: exportDetailedAttendanceCSV (Exportación detallada de asistencias docentes)
// ---------------------------------------------------------------
export function exportDetailedAttendanceCSV(
  shifts: DBTeacherTimeLog[],
  monthLabel: string,
): void {
  const BOM = "\uFEFF";
  const headerLines = [
    `"VIBRA MUSIC — REPORTE DE ASISTENCIA Y CONTROL HORARIO DOCENTE"`,
    `"Periodo:","${monthLabel}"`,
    `"Fecha de Exportación:","${new Date().toLocaleDateString("es-PE")} ${new Date().toLocaleTimeString("es-PE")}"`,
    `""`,
  ];

  const columnHeaders = [
    '"Fecha"',
    '"Profesor / Staff"',
    '"Geocontrol GPS Entrada"',
    '"Geocontrol GPS Salida"',
    '"Hora Ingreso"',
    '"Hora Salida"',
    '"Pausa (Min)"',
    '"Minutos Netos"',
    '"Horas Decimales"',
    '"Tiempo Formateado"',
    '"Estado"',
    '"Origen / Dispositivo"',
  ].join(",");

  const dataRows = shifts.map((s) => {
    const d = new Date(s.clock_in);
    const dateStr = d.toLocaleDateString("es-PE", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const inTime = d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
    const outTime = s.clock_out
      ? new Date(s.clock_out).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
      : "En sede (Sin salida)";

    const loc = parseShiftLocation(s);
    const inLoc = loc.in;
    const outLoc = loc.out;
    const inGpsStr = inLoc
      ? inLoc.status === "en_sede"
        ? `En Sede (${formatDistance(inLoc.distanceMeters)})`
        : inLoc.status === "fuera_de_sede"
        ? `Fuera de Sede (${formatDistance(inLoc.distanceMeters)})`
        : "Sin GPS"
      : "Sede Fija / Manual";
    const outGpsStr = outLoc
      ? outLoc.status === "en_sede"
        ? `En Sede (${formatDistance(outLoc.distanceMeters)})`
        : outLoc.status === "fuera_de_sede"
        ? `Fuera de Sede (${formatDistance(outLoc.distanceMeters)})`
        : "Sin GPS"
      : "-";
    const deviceStr =
      loc.device === "admin_header"
        ? "Panel Admin"
        : loc.device === "kiosk_mobile"
        ? "Móvil Docente"
        : loc.device || "Sede";

    let mins = s.total_minutes_worked || 0;
    if (mins === 0 && s.clock_out) {
      mins = Math.max(0, Math.floor((new Date(s.clock_out).getTime() - d.getTime()) / 60000) - (s.break_minutes || 0));
    } else if (mins === 0 && !s.clock_out) {
      mins = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000) - (s.break_minutes || 0));
    }
    const hrsDecimal = (mins / 60).toFixed(2);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    const formattedHours = hrs > 0 ? `${hrs}h ${remMins}m` : `${remMins}m`;

    return [
      `"${dateStr}"`,
      `"${s.teacher_name}"`,
      `"${inGpsStr}"`,
      `"${outGpsStr}"`,
      `"${inTime}"`,
      `"${outTime}"`,
      `"${s.break_minutes || 0}"`,
      `"${mins}"`,
      `"${hrsDecimal}"`,
      `"${formattedHours}"`,
      `"${s.status === "trabajando" ? "En Sede" : s.status === "pausa" ? "En Pausa" : "Finalizado"}"`,
      `"${deviceStr}"`,
    ].join(",");
  });

  const csvContent = [BOM, ...headerLines, columnHeaders, ...dataRows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `asistencias_docentes_${monthLabel.replace(/[\s\/]+/g, "_").toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
