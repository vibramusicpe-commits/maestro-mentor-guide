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
import { isMatchingStudentName } from "@/lib/student-matching";

interface DBStudentSnapshotRow {
  id: string;
  full_name: string;
  instrument?: string;
  status: string;
  emergency_contact?: {
    teacher?: string;
    modality?: string;
    scheduleLessons?: ScheduledLesson[];
    family?: string;
    email?: string;
    phone?: string;
    name?: string;
    relation?: string;
  } | null;
}

export async function handleAvailabilitySnapshot(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "text";

  // Intentar enriquecer con alumnos activos de PostgreSQL si está disponible
  let students: AdminStudent[] = [...officialAdminStudents];
  let schedule: ScheduledLesson[] = [...officialSchedule];

  try {
    const dbStudents = await postgrestSelect<DBStudentSnapshotRow>(
      "students",
      { limit: "200" },
      "id,full_name,instrument,status,emergency_contact"
    );
    if (dbStudents && dbStudents.length > 0) {
      // Combinar estado activo desde PostgreSQL
      students = students.map((st) => {
        const found = dbStudents.find(
          (db) =>
            isMatchingStudentName(db.full_name, st.name) ||
            db.full_name.toLowerCase().trim() === st.name.toLowerCase().trim()
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
          (st) =>
            isMatchingStudentName(st.name, db.full_name) ||
            st.name.toLowerCase().trim() === db.full_name.toLowerCase().trim()
        );
        if (!exists) {
          const ec = db.emergency_contact || {};
          students.push({
            id: db.id,
            name: db.full_name,
            family: ec.family || `Familia ${db.full_name}`,
            instrument: db.instrument || "Piano",
            level: "Nivel 1",
            teacher: ec.teacher || "Fernando",
            status: db.status === "activo" ? "activo" : db.status === "pausa" ? "pausa" : "baja",
            attendanceRate: 100,
            payment: "al-dia",
            risk: 0,
            joinedAt: "Ago 2026",
            makeupCredits: 0,
            balance: 0,
            recentAttendance: [],
            teacherNote: "",
            email: ec.email || `alumno_${db.id.slice(0, 4)}@vibramusic.pe`,
            phone: ec.phone || "+51 900 000 000",
            emergencyContact: {
              name: ec.name || db.full_name,
              phone: ec.phone || "+51 900 000 000",
              relation: ec.relation || "Apoderado",
            },
            birthdate: "15 de Agosto",
            modality: (ec.modality as any) || "Regular (8 clases / 45 min)",
          });
        }
      });

      // Incorporar clases persistidas en PostgreSQL (emergency_contact.scheduleLessons) para inventario real
      dbStudents.forEach((db) => {
        const ec = db.emergency_contact;
        if (db.status === "activo" && ec && Array.isArray(ec.scheduleLessons)) {
          ec.scheduleLessons.forEach((lesson: ScheduledLesson) => {
            const alreadyInSchedule = schedule.some(
              (s) =>
                s.day === lesson.day &&
                s.time === lesson.time &&
                (isMatchingStudentName(s.student, db.full_name) || s.student === db.full_name)
            );
            if (!alreadyInSchedule) {
              schedule.push({
                ...lesson,
                id: lesson.id || `db-sch-${db.id}-${lesson.day}-${lesson.time}`,
                student: db.full_name,
                teacher: lesson.teacher || ec.teacher || "Fernando",
                instrument: lesson.instrument || db.instrument || "Piano",
                status: "programada",
                month: undefined,
              });
            }
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
