/**
 * ==============================================================================
 * functions/_lib/insforge.ts — Cliente Server-Side Insforge PostgREST para Pages
 * ==============================================================================
 * 
 * Consulta directamente la base de datos PostgreSQL de Insforge usando la API
 * PostgREST autorizada con API Key segura server-side.
 * ==============================================================================
 */

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
}
