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
import { InsforgeClient } from "../_lib/insforge";
import {
  SYSTEM_PROMPT_SECRETARY_ASSISTANT,
  buildContextualPrompt,
} from "../_lib/prompts";

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
        dbData = await insforge.getInvoices(classification.entities.studentName);
        break;
      }

      case "kardex_asistencias": {
        if (classification.entities.studentName) {
          const students = await insforge.searchStudent(classification.entities.studentName);
          if (students.length > 0) {
            const logs = await insforge.getAttendanceLogs(students[0].id);
            dbData = { alumno: students[0], historial_asistencias: logs };
          } else {
            dbData = { mensaje: "Alumno no encontrado en Insforge." };
          }
        } else {
          dbData = { mensaje: "Por favor especifica el nombre del alumno para consultar su kardex." };
        }
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

    // Fallback en caso de que Workers AI esté saturado o no configurado
    if (!generatedText) {
      if (classification.intent === "cobranzas" && Array.isArray(dbData)) {
        generatedText = `Tienes ${dbData.length} recibos registrados con saldo pendiente. Detalles:\n` +
          dbData
            .slice(0, 5)
            .map((i: any) => `• ${i.concepto}: Total S/ ${i.total}, Saldo pendiente S/ ${i.saldo_pendiente} (Vence: ${i.fecha_vencimiento})`)
            .join("\n");
      } else {
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
