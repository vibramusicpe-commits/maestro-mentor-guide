/**
 * ================================================================
 * availability-snapshot-handler.ts — Handler HTTP para el Snapshot
 * ================================================================
 * Expone GET /api/availability/snapshot
 * Provee texto plano o JSON con el estado de vacantes en tiempo
 * real para que el Bot Karla (o cualquier webhook) lo consuma sin costo.
 * ================================================================
 */

import { generateAvailabilitySnapshot } from "@/lib/services/availability-snapshot";
import { officialSchedule, officialAdminStudents } from "@/store/official-seeds";
import { postgrestSelect } from "@/lib/insforge";
import type { AdminStudent, ScheduledLesson } from "@/store/admin-seeds";

export async function handleAvailabilitySnapshot(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "text";

  // Intentar enriquecer con alumnos activos de PostgreSQL si está disponible
  let students: AdminStudent[] = [...officialAdminStudents];
  let schedule: ScheduledLesson[] = [...officialSchedule];

  try {
    const dbStudents = await postgrestSelect<Array<{ id: string; name: string; status: string; emergency_contact?: unknown }>>(
      "students?select=id,name,status,emergency_contact&limit=200"
    );
    if (dbStudents && dbStudents.length > 0) {
      // Combinar estado activo desde PostgreSQL
      students = students.map((st) => {
        const found = dbStudents.find(
          (db) => db.name.toLowerCase().trim() === st.name.toLowerCase().trim()
        );
        if (found) {
          return {
            ...st,
            status: found.status === "activo" ? "activo" : found.status === "pausa" ? "pausa" : "baja",
          };
        }
        return st;
      });

      // Añadir alumnos creados en DB que no estén en semillas
      dbStudents.forEach((db) => {
        const exists = students.some(
          (st) => st.name.toLowerCase().trim() === db.name.toLowerCase().trim()
        );
        if (!exists) {
          students.push({
            id: db.id,
            name: db.name,
            family: db.name,
            instrument: "General",
            level: "Principiante",
            teacher: "Jeremy",
            status: db.status === "activo" ? "activo" : db.status === "pausa" ? "pausa" : "baja",
            paymentStatus: "al-dia",
            hourlyRate: 0,
            notes: "",
            modality: "Regular (8 clases / 45 min)",
            history: [],
          });
        }
      });
    }
  } catch {
    // Si la conexión a BD no está disponible en este ciclo, continúa con las semillas oficiales
  }

  const snapshot = generateAvailabilitySnapshot(schedule, students);

  // Manejo de CORS
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "public, max-age=60, s-maxage=60",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (format === "json") {
    return new Response(JSON.stringify(snapshot, null, 2), {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  }

  return new Response(snapshot.text, {
    status: 200,
    headers: {
      ...headers,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
