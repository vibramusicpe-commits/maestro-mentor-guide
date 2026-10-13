/**
 * ==============================================================================
 * functions/_lib/insforge.ts — Cliente Server-Side Insforge PostgREST para Pages
 * ==============================================================================
 * 
 * Consulta directamente la base de datos PostgreSQL de Insforge usando la API
 * PostgREST autorizada con API Key segura server-side.
 * ==============================================================================
 */

/**
 * Fecha YYYY-MM-DD en America/Lima (UTC-5 fijo, Perú no tiene horario de verano).
 */
export function limaToday(date = new Date()): string {
  return new Date(date.getTime() - 5 * 3600 * 1000).toISOString().slice(0, 10);
}

/** Lunes y domingo (YYYY-MM-DD) de la semana actual en Lima. */
export function limaWeekBounds(date = new Date()): { monday: string; sunday: string } {
  const [y, m, d] = limaToday(date).split("-").map(Number);
  const jsDay = new Date(y, (m as number) - 1, d as number).getDay();
  const mondayOff = (jsDay + 6) % 7;
  const mon = new Date(y, (m as number) - 1, (d as number) - mondayOff);
  const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
  const fmt = (x: Date) =>
    `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  return { monday: fmt(mon), sunday: fmt(sun) };
}

export class InsforgeClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(url?: string, key?: string) {
    const rawUrl = url || "https://pdey9yma.us-east.insforge.app/api/database/records";
    // Normalizar para admitir tanto /rest/v1 como /api/database/records
    this.baseUrl = rawUrl.replace(/\/+$/, "");
    this.apiKey = key || "anon_897abc3685c27a2e113b8022caaf12a8dc8233b25aa9ce5397c83ffa88362804";
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      apikey: this.apiKey,
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  private async fetchTable<T = any>(endpoint: string): Promise<T[]> {
    try {
      const url = `${this.baseUrl}/${endpoint.replace(/^\/+/, "")}`;
      const res = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        console.warn(`[Insforge PostgREST Error] HTTP ${res.status} al consultar ${endpoint}`);
        return [];
      }

      return (await res.json()) as T[];
    } catch (err) {
      console.error(`[Insforge Network Error] en ${endpoint}:`, err);
      return [];
    }
  }

  /**
   * Obtiene facturas pendientes o vencidas con opción de filtro por alumno
   */
  async getInvoices(studentName?: string): Promise<any[]> {
    let endpoint = "invoices?status=in.(pendiente,vencido,parcial)&order=due_date.asc&limit=30";
    if (studentName) {
      endpoint = `invoices?concept=ilike.*${encodeURIComponent(studentName)}*&order=due_date.desc&limit=10`;
    }
    const invoices = await this.fetchTable(endpoint);

    return invoices.map((inv) => ({
      id: inv.id,
      concepto: inv.concept,
      total: Number(inv.amount || 0),
      abonado: Number(inv.amount_paid || 0),
      saldo_pendiente: Number(inv.remaining_balance || 0),
      fecha_vencimiento: inv.due_date,
      estado: inv.status,
      metodo_pago: inv.payment_method || "No especificado",
    }));
  }

  /**
   * Busca un alumno por nombre o parte del nombre
   */
  async searchStudent(nameQuery: string): Promise<any[]> {
    const endpoint = `students?full_name=ilike.*${encodeURIComponent(nameQuery)}*&select=id,full_name,instrument,level,modality,status,makeup_credits,emergency_contact,notes&limit=5`;
    const students = await this.fetchTable(endpoint);
    return students.map((s) => ({
      id: s.id,
      nombre: s.full_name,
      instrumento: s.instrument,
      nivel: s.level,
      modalidad: s.modality,
      estado: s.status,
      creditos_recuperacion: s.makeup_credits,
      apoderado: s.emergency_contact?.name || "No registrado",
      telefono_apoderado: s.emergency_contact?.phone || "No registrado",
      fechas_plan: {
        inicio: s.emergency_contact?.planStartDate,
        fin: s.emergency_contact?.planEndDate,
      },
    }));
  }

  /**
   * Obtiene la agenda de clases para un día o sala específica
   */
  async getLessons(params?: { dateStr?: string; room?: string; teacherName?: string }): Promise<any[]> {
    const today = new Date().toISOString().split("T")[0];
    const targetDate = params?.dateStr || today;

    let endpoint = `lessons?scheduled_date=eq.${targetDate}&order=scheduled_time.asc&limit=50`;
    if (params?.room) {
      endpoint += `&room=eq.${encodeURIComponent(params.room)}`;
    }

    const lessons = await this.fetchTable(endpoint);
    return lessons.map((l) => ({
      id: l.id,
      hora: l.scheduled_time,
      duracion_minutos: l.duration_minutes,
      sala: l.room,
      estado: l.status,
      fecha: l.scheduled_date,
    }));
  }

  /**
   * Obtiene historial de asistencias (Kardex) para un alumno filtrado por ciclo actual
   */
  async getAttendanceLogs(studentId: string, startDate?: string): Promise<any[]> {
    let endpoint = `attendance_logs?student_id=eq.${studentId}&order=registered_at.desc&limit=20`;
    if (startDate) {
      endpoint += `&registered_at=gte.${startDate}`;
    }
    const logs = await this.fetchTable(endpoint);
    return logs.map((log) => ({
      fecha_registro: log.registered_at,
      estado_asistencia: log.status,
      observacion: log.note,
    }));
  }

  /**
   * Obtiene solicitudes de clases demo / prospectos
   */
  async getDemoRequests(statusFilter?: string): Promise<any[]> {
    const status = statusFilter || "pendiente";
    const endpoint = `demo_requests?status=eq.${encodeURIComponent(status)}&order=created_at.desc&limit=15`;
    const demos = await this.fetchTable(endpoint);
    return demos.map((d) => ({
      id: d.id,
      alumno_prospecto: d.student_name,
      apoderado: d.parent_name,
      telefono: d.parent_phone,
      instrumento: d.instrument,
      fecha_preferida: d.preferred_date,
      hora_preferida: d.preferred_time,
      estado: d.status,
      notas: d.notes,
    }));
  }

  // ---------------------------------------------------------------------------
  // Fase 1 (ADR-0170): consultas para las nuevas ramas del asistente.
  // Todas contra tablas verificadas con datos vivos. Fechas en America/Lima.
  // ---------------------------------------------------------------------------

  /** Fecha YYYY-MM-DD de hoy en Lima (UTC-5, sin horario de verano). */
  private static todayLima(date = new Date()): string {
    const lima = new Date(date.getTime() - 5 * 3600 * 1000);
    return lima.toISOString().slice(0, 10);
  }

  /** Resuelve la familia (nombre/apoderado/teléfono) para una lista de family_id. */
  private async fetchFamiliesByIds(ids: string[]): Promise<Record<string, any>> {
    const uniq = [...new Set(ids.filter(Boolean))];
    if (uniq.length === 0) return {};
    const rows = await this.fetchTable(
      `families?id=in.(${uniq.map((id) => encodeURIComponent(id)).join(",")})&select=id,family_name,primary_guardian_name,primary_guardian_phone&limit=${uniq.length}`
    );
    const map: Record<string, any> = {};
    rows.forEach((f: any) => {
      map[f.id] = f;
    });
    return map;
  }

  private mapInvoiceWithFamily(inv: any, families: Record<string, any>) {
    const fam = families[inv.family_id] || {};
    return {
      id: inv.id,
      concepto: inv.concept,
      familia: fam.family_name || "",
      apoderado: fam.primary_guardian_name || "",
      telefono_apoderado: fam.primary_guardian_phone || "",
      total: Number(inv.amount || 0),
      abonado: Number(inv.amount_paid || 0),
      saldo_pendiente: Number(inv.remaining_balance || 0),
      fecha_vencimiento: inv.due_date,
      estado: inv.status,
      metodo_pago: inv.payment_method || "No especificado",
    };
  }

  /**
   * Lista deudores: recibos con saldo (pendiente/vencido/parcial),
   * con familia resuelta. Base de "PAGOS PENDIENTES".
   */
  async getDebtorsList(statuses = ["pendiente", "vencido", "parcial"]): Promise<any[]> {
    const endpoint = `invoices?status=in.(${statuses.join(",")})&order=due_date.asc&limit=30`;
    const invoices = await this.fetchTable(endpoint);
    const families = await this.fetchFamiliesByIds(invoices.map((i: any) => i.family_id));
    return invoices.map((inv: any) => this.mapInvoiceWithFamily(inv, families));
  }

  /**
   * Vencimientos en un rango [from, to] (YYYY-MM-DD) con saldo pendiente.
   */
  async getUpcomingDueDates(from: string, to: string): Promise<any[]> {
    const endpoint =
      `invoices?due_date=gte.${from}&due_date=lte.${to}` +
      `&status=in.(pendiente,vencido,parcial)&order=due_date.asc&limit=30`;
    const invoices = await this.fetchTable(endpoint);
    const families = await this.fetchFamiliesByIds(invoices.map((i: any) => i.family_id));
    return invoices.map((inv: any) => this.mapInvoiceWithFamily(inv, families));
  }

  /**
   * Recaudación del mes: recibos con vencimiento en YYYY-MM y suma de abonos.
   */
  async getMonthCollection(year: number, monthIndex1: number): Promise<any> {
    const mm = String(monthIndex1).padStart(2, "0");
    const lastDay = new Date(year, monthIndex1, 0).getDate();
    const from = `${year}-${mm}-01`;
    const to = `${year}-${mm}-${String(lastDay).padStart(2, "0")}`;
    const endpoint = `invoices?due_date=gte.${from}&due_date=lte.${to}&limit=100`;
    const invoices = await this.fetchTable(endpoint);
    return {
      mes: `${year}-${mm}`,
      recibos: invoices.length,
      total_facturado: invoices.reduce((a: number, i: any) => a + Number(i.amount || 0), 0),
      total_cobrado: invoices.reduce((a: number, i: any) => a + Number(i.amount_paid || 0), 0),
      saldo_pendiente: invoices.reduce((a: number, i: any) => a + Number(i.remaining_balance || 0), 0),
    };
  }

  /**
   * Alumnos por filtro (instrumento / modalidad / estado / profesor).
   * modality SQL solo admite el enum ('Regular…'|'Intensivo…'): flexible se
   * filtra en código sobre emergency_contact. teacherName se mapea a
   * assigned_teacher_id oficial (Jeremy 003 / Fernando 004 / Nathaly 005).
   */
  async getStudentsByFilter(filter: {
    instrument?: string;
    modality?: string;
    status?: string;
    teacherName?: string;
  }): Promise<any[]> {
    const params: string[] = [
      "select=id,full_name,instrument,modality,status,assigned_teacher_id,emergency_contact",
      "limit=50",
    ];
    if (filter.instrument) params.push(`instrument=ilike.*${encodeURIComponent(filter.instrument)}*`);
    if (filter.status) params.push(`status=eq.${encodeURIComponent(filter.status)}`);
    if (filter.modality === "intensivo") params.push(`modality=eq.${encodeURIComponent("Intensivo (4 clases / 90 min)")}`);
    else if (filter.modality === "regular") params.push(`modality=eq.${encodeURIComponent("Regular (8 clases / 45 min)")}`);
    const teacherIds: Record<string, string> = {
      jeremy: "00000000-0000-0000-0000-000000000003",
      fernando: "00000000-0000-0000-0000-000000000004",
      nathaly: "00000000-0000-0000-0000-000000000005",
    };
    const tKey = (filter.teacherName || "").toLowerCase();
    if (teacherIds[tKey]) params.push(`assigned_teacher_id=eq.${teacherIds[tKey]}`);

    const rows = await this.fetchTable(`students?${params.join("&")}`);
    const mod = (filter.modality || "").toLowerCase();
    return rows
      .filter((s: any) => {
        if (mod === "flexible") {
          const ecMod = String(s.emergency_contact?.modality || s.modality || "").toLowerCase();
          if (!(ecMod.includes("flex") || ecMod.includes("demanda") || ecMod.includes("paquete"))) return false;
        }
        if (tKey === "claudia") {
          const ecTeacher = String(s.emergency_contact?.teacher || "").toLowerCase();
          if (!ecTeacher.includes("claudia")) return false;
        }
        return true;
      })
      .map((s: any) => ({
        id: s.id,
        nombre: s.full_name,
        instrumento: s.instrument,
        modalidad: s.emergency_contact?.modality || s.modality,
        estado: s.status,
        profesor: s.emergency_contact?.teacher || "",
      }));
  }

  /**
   * Resumen de ciclo del alumno desde attendance_logs + marcas de sus
   * lecciones (scheduleLessons), con filtro de elegibilidad por
   * (lección, fecha) igual que el motor del Kardex (ADR-0170).
   * Piso planStartDate (ADR-0161); ausente con credit_delta>0 cuenta como
   * justificada; recuperacion cuenta como asistida.
   */
  async getKardexSummary(studentId: string): Promise<any> {
    const students = await this.fetchTable(
      `students?id=eq.${encodeURIComponent(studentId)}&select=id,full_name,modality,status,makeup_credits,emergency_contact&limit=1`
    );
    const st = students[0];
    if (!st) return { mensaje: "Alumno no encontrado en Insforge." };
    const ec = st.emergency_contact || {};
    const planStart: string = ec.planStartDate || "2000-01-01";
    const modStr = String(ec.modality || st.modality || "").toLowerCase();
    const targetQuota =
      Number(ec.packageTotalSessions) > 0
        ? Number(ec.packageTotalSessions)
        : modStr.includes("inten") || modStr.includes("90 min") || (modStr.includes("4 clases") && !modStr.includes("45 min"))
          ? 4
          : 8;

    const logs = await this.fetchTable(
      `attendance_logs?student_id=eq.${encodeURIComponent(st.id)}&order=registered_at.desc&limit=100`
    );

    // Unión de evaluaciones por clave lección-fecha: primero las marcas de
    // las lecciones (fuente del Kardex UI), luego los logs que aporten
    // fechas no cubiertas. Misma elegibilidad que el motor oficial.
    const WD = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const wkey = (ds: string): string => {
      const m = ds.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (!m) return "";
      return WD[new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getDay()] || "";
    };
    // status normalizado por clave; los logs solo agregan claves ausentes
    const byKey = new Map<string, string>();
    const lessons: any[] = Array.isArray(ec.scheduleLessons) ? ec.scheduleLessons : [];
    lessons.forEach((l: any) => {
      const att = l.attendanceByDate || {};
      Object.entries(att).forEach(([dateStr, status]) => {
        if (Array.isArray(l.excludedDates) && l.excludedDates.includes(dateStr)) return;
        if (l.dateStr) {
          if (l.dateStr !== dateStr || dateStr < planStart) return;
        } else {
          if (wkey(dateStr) !== l.day) return;
          if (dateStr < planStart || (ec.planEndDate && dateStr > ec.planEndDate)) return;
        }
        byKey.set(`${l.id || `${l.day || ""}-${l.time || ""}`}-${dateStr}`, String(status));
      });
    });
    logs.forEach((log: any) => {
      const dateMatch = String(log.note || "").match(/Fecha\s+(\d{4}-\d{2}-\d{2})/i) || String(log.note || "").match(/(\d{4}-\d{2}-\d{2})/);
      const dateStr: string = dateMatch ? dateMatch[1] : String(log.registered_at || "").slice(0, 10);
      if (!dateStr || dateStr < planStart) return;
      // El log solo aporta si ninguna lección cubre esa fecha
      const covered = [...byKey.keys()].some((k) => k.endsWith(`-${dateStr}`));
      if (covered) return;
      const status = String(log.status || "");
      byKey.set(`log-${dateStr}`, status === "ausente" && Number(log.credit_delta || 0) > 0 ? "justificada" : status);
    });

    let attended = 0;
    let absent = 0;
    let tardy = 0;
    let justified = 0;
    byKey.forEach((status) => {
      if (status === "presente" || status === "tarde" || status === "recuperacion") {
        attended++;
        if (status === "tarde") tardy++;
      } else if (status === "ausente") {
        absent++;
      } else if (status === "justificada") {
        justified++;
      }
    });
    const evaluated = attended + absent + justified;
    return {
      alumno: st.full_name,
      cuota: targetQuota,
      asistidas: attended,
      faltas: absent,
      tardanzas: tardy,
      justificadas: justified,
      evaluadas: evaluated,
      restantes: Math.max(0, targetQuota - evaluated),
      creditos_recuperacion: Number(st.makeup_credits || 0),
      ciclo_cumplido: evaluated >= targetQuota,
      vigencia: { inicio: ec.planStartDate || null, fin: ec.planEndDate || null },
    };
  }
}
