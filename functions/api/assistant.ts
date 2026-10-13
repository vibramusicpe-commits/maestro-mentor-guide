/**
 * ==============================================================================
 * functions/api/assistant.ts — Endpoint Cloudflare Pages Function: /api/assistant
 * ==============================================================================
 * 
 * Pipeline del Asistente:
 * 1. Autenticación opcional (ADMIN_TOKEN).
 * 2. Clasificación & Guardrails con Clef (functions/_lib/clef.ts).
 * 3. Consulta a Insforge PostgreSQL con PostgREST (functions/_lib/insforge.ts).
 * 4. Inyección de reglas pedagógicas y datos en Prompt (functions/_lib/prompts.ts).
 * 5. Generación de respuesta con Workers AI Llama 3.1 8B Instruct.
 * ==============================================================================
 */

import { classifyQueryWithClef } from "../_lib/clef";
import { InsforgeClient, limaToday, limaWeekBounds } from "../_lib/insforge";
import {
  SYSTEM_PROMPT_SECRETARY_ASSISTANT,
  buildContextualPrompt,
} from "../_lib/prompts";

// Rechazo oficial de niveles (la academia no trabaja con niveles).
const RECHAZO_NIVELES =
  "En Vibra Music no trabajamos con niveles. Puedo ayudarte a filtrar alumnos " +
  "por instrumento (Piano, Guitarra, Batería, Canto, Violín), por modalidad " +
  "(Regular o Intensivo), por profesor (Nathaly, Fernando, Jeremy) o por estado " +
  "(activo, pausa, baja). ¿Cómo quieres filtrar?";

interface Env {
  AI?: any;
  INSFORGE_URL?: string;
  INSFORGE_ANON_KEY?: string;
  ADMIN_TOKEN?: string;
}

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-token",
    },
  });
};

/**
 * Respuesta determinista en español cuando Workers AI no está disponible.
 * Devuelve "" si no reconoce la forma de dbData (el llamador usa JSON crudo).
 */
function formatDeterministicResponse(intent: string, dbData: any): string {
  // Cobranzas: lista de recibos con saldo (array directo)
  if (intent === "cobranzas" && Array.isArray(dbData)) {
    if (dbData.length === 0) return "No hay recibos con saldo pendiente. Cartera al día. ✅";
    return (
      `Tienes ${dbData.length} recibos registrados con saldo pendiente. Detalles:\n` +
      dbData
        .slice(0, 8)
        .map((i: any) => `• ${i.concepto}: Total S/ ${i.total}, Saldo pendiente S/ ${i.saldo_pendiente} (Vence: ${i.fecha_vencimiento})`)
        .join("\n")
    );
  }

  // Cobranzas: vencimientos de la semana
  if (dbData && dbData.tipo === "vencimientos_semana") {
    const items = dbData.items || [];
    if (items.length === 0) {
      return `No hay vencimientos con saldo entre ${dbData.rango?.desde} y ${dbData.rango?.hasta}. ✅`;
    }
    const total = items.reduce((a: number, i: any) => a + Number(i.saldo_pendiente || 0), 0);
    return (
      `Vencimientos de la semana (${dbData.rango?.desde} al ${dbData.rango?.hasta}):\n` +
      items
        .map((i: any) => `• ${i.concepto} — ${i.familia || ""} — Saldo S/ ${i.saldo_pendiente} (Vence: ${i.fecha_vencimiento})`)
        .join("\n") +
      `\nTotal por cobrar en la semana: S/ ${total.toFixed(2)}.`
    );
  }

  // Cobranzas: recaudación del mes
  if (dbData && dbData.tipo === "recaudacion_mes" && dbData.resumen) {
    const r = dbData.resumen;
    return (
      `Recaudación de ${r.mes}: ${r.recibos} recibo(s). ` +
      `Facturado S/ ${Number(r.total_facturado || 0).toFixed(2)} · ` +
      `Cobrado S/ ${Number(r.total_cobrado || 0).toFixed(2)} · ` +
      `Saldo pendiente S/ ${Number(r.saldo_pendiente || 0).toFixed(2)}.`
    );
  }

  // Kardex por alumno (resumen de ciclo)
  if (dbData && dbData.resumen_ciclo && !dbData.resumen_ciclo.mensaje) {
    const s = dbData.resumen_ciclo;
    return (
      `Kardex de ${s.alumno}: cuota ${s.cuota} clases. ` +
      `Asistidas ${s.asistidas} · Faltas ${s.faltas} · Tardanzas ${s.tardanzas} · Justificadas ${s.justificadas}. ` +
      `Restantes ${s.restantes}, créditos de recuperación ${s.creditos_recuperacion}. ` +
      (s.ciclo_cumplido ? "🎓 Ciclo culminado." : "Ciclo en curso.")
    );
  }

  // Alumnos por filtro
  if (dbData && dbData.tipo === "alumnos_filtrados") {
    const list = dbData.alumnos || [];
    if (list.length === 0) return "No encontré alumnos con ese filtro en la base de datos.";
    return (
      `Alumnos encontrados (${list.length}):\n` +
      list
        .slice(0, 15)
        .map((a: any) => `• ${a.nombre} — ${a.instrumento || ""} · ${a.modalidad || ""} · Prof. ${a.profesor || ""} · ${a.estado || ""}`)
        .join("\n")
    );
  }

  return "";
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  // Headers CORS para respuestas
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    // 1. Verificación de Seguridad opcional (ADMIN_TOKEN)
    if (env.ADMIN_TOKEN) {
      const authHeader =
        request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ||
        request.headers.get("x-admin-token");
      if (authHeader !== env.ADMIN_TOKEN) {
        return new Response(
          JSON.stringify({
            error: "No autorizado. Token de administración no válido o ausente.",
          }),
          { status: 401, headers: corsHeaders }
        );
      }
    }

    // 2. Parseo de la consulta
    const body: any = await request.json().catch(() => ({}));
    const query: string = (body.query || "").trim();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "El campo 'query' es requerido." }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Clasificación e Intención asistida con Clef
    const classification = await classifyQueryWithClef(env.AI, query);

    // Rechazo determinista de niveles (sin costo de IA, respuesta exacta)
    if (classification.intent === "niveles_rechazo") {
      return new Response(
        JSON.stringify({
          success: true,
          intent: classification.intent,
          confidence: classification.confidence,
          classified_by: classification.classified_by,
          entities: classification.entities,
          response: RECHAZO_NIVELES,
          model_used: "deterministic_rejection",
          data_count: 0,
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Guardrail de Seguridad: si intenta inyección o ataque
    if (classification.is_sensitive) {
      return new Response(
        JSON.stringify({
          success: false,
          intent: "bloqueado_por_seguridad",
          response:
            "Lo siento, no puedo procesar esta solicitud por políticas de seguridad del sistema escolar.",
          reason: classification.security_reason,
        }),
        { status: 403, headers: corsHeaders }
      );
    }

    // 4. Consulta a Insforge PostgreSQL con PostgREST
    const insforge = new InsforgeClient(env.INSFORGE_URL, env.INSFORGE_ANON_KEY);
    let dbData: any = null;

    switch (classification.intent) {
      case "cobranzas": {
        const qLower = query.toLowerCase();
        // Vencimientos de la semana
        if (qLower.includes("semana") || qLower.includes("vence") || qLower.includes("vencen")) {
          const { monday, sunday } = limaWeekBounds();
          const items = await insforge.getUpcomingDueDates(monday, sunday);
          dbData = { tipo: "vencimientos_semana", rango: { desde: monday, hasta: sunday }, items };
        } else if (qLower.includes("recaud") || qLower.includes("este mes") || qLower.includes("del mes")) {
          // Recaudación del mes en curso (Lima)
          const [yy, mm] = limaToday().split("-").map(Number);
          const resumen = await insforge.getMonthCollection(yy as number, mm as number);
          dbData = { tipo: "recaudacion_mes", resumen };
        } else {
          dbData = await insforge.getInvoices(classification.entities.studentName);
        }
        break;
      }

      case "kardex_asistencias": {
        if (classification.entities.studentName) {
          const students = await insforge.searchStudent(classification.entities.studentName);
          // 🛡️ Prioridad al registro ACTIVO ante homónimos históricos (ADR-0107)
          const target = students.find((s: any) => s.estado === "activo") || students[0];
          if (target) {
            const resumen = await insforge.getKardexSummary(target.id);
            const logs = await insforge.getAttendanceLogs(target.id);
            dbData = { alumno: target, resumen_ciclo: resumen, historial_reciente: logs.slice(0, 5) };
          } else {
            dbData = { mensaje: "Alumno no encontrado en Insforge." };
          }
        } else {
          dbData = { mensaje: "Por favor especifica el nombre del alumno para consultar su kardex." };
        }
        break;
      }

      case "alumnos_por_filtro": {
        const filtro = {
          instrument: classification.entities.instrument,
          modality: classification.entities.modality,
          status: classification.entities.statusFilter,
          teacherName: classification.entities.teacherName,
        };
        // Sin estado explícito (ni mención de inactivos/histórico): base activa,
        // como el Directorio y Facturación (ADR-0124/ADR-0132).
        if (!filtro.status && !/(inactiv|pausa|baja|hist[oó]ric)/i.test(query)) {
          filtro.status = "activo";
        }
        const alumnos = await insforge.getStudentsByFilter(filtro);
        dbData = { tipo: "alumnos_filtrados", filtro, alumnos };
        break;
      }

      case "horarios_aforos": {
        dbData = await insforge.getLessons({
          room: classification.entities.room,
          teacherName: classification.entities.teacherName,
          dateStr: classification.entities.dateQuery,
        });
        break;
      }

      case "prospectos_demos": {
        dbData = await insforge.getDemoRequests();
        break;
      }

      case "recordatorios": {
        // En recordatorios, traemos facturas próximas a vencer como apoyo
        dbData = await insforge.getInvoices();
        break;
      }

      case "ayuda_general":
      default: {
        dbData = {
          mensaje: "Consulta general de la academia.",
          reglas_docentes: [
            "Nathaly: Sala C (Piano Infantil 4-8 años y Canto)",
            "Fernando: Sala B (Piano estándar y Violín)",
            "Jeremy: Sala A (Guitarra y Batería)",
          ],
        };
        break;
      }
    }

    // 5. Generación de Respuesta con Workers AI (Llama 3.1 8B Instruct)
    const userPrompt = buildContextualPrompt({
      query,
      intent: classification.intent,
      dbData,
      entities: classification.entities,
    });

    let generatedText = "";
    let modelUsed = "deterministic_fallback";

    if (env.AI && typeof env.AI.run === "function") {
      try {
        const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          messages: [
            { role: "system", content: SYSTEM_PROMPT_SECRETARY_ASSISTANT },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 512,
          temperature: 0.2, // Baja temperatura para máxima fidelidad a los datos
        });

        generatedText = aiResponse.response || "";
        modelUsed = "@cf/meta/llama-3.1-8b-instruct";
      } catch (aiErr) {
        console.warn("[Workers AI Warning] Falló Llama 3.1, intentando modelo alternativo:", aiErr);
        try {
          const fallbackAi = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
            messages: [
              { role: "system", content: SYSTEM_PROMPT_SECRETARY_ASSISTANT },
              { role: "user", content: userPrompt },
            ],
            max_tokens: 512,
          });
          generatedText = fallbackAi.response || "";
          modelUsed = "@cf/meta/llama-3-8b-instruct";
        } catch {
          generatedText = "";
        }
      }
    }

    // Fallback en caso de que Workers AI esté saturado o no configurado.
    // Respuestas deterministas en español (sin costo) por tipo de dato.
    if (!generatedText) {
      generatedText = formatDeterministicResponse(classification.intent, dbData);
      if (!generatedText) {
        generatedText = `Datos obtenidos de Insforge para ${classification.intent}:\n` + JSON.stringify(dbData, null, 2);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        intent: classification.intent,
        confidence: classification.confidence,
        classified_by: classification.classified_by,
        entities: classification.entities,
        response: generatedText,
        model_used: modelUsed,
        data_count: Array.isArray(dbData) ? dbData.length : dbData ? 1 : 0,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("[Assistant Endpoint Error]:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Error interno del servidor.",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
};
