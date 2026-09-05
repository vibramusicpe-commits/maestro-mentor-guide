/**
 * ================================================================
 * whatsapp-webhook.ts — Webhook Oficial WhatsApp Cloud API (Server-Side)
 * ================================================================
 * ADR-001 §2.1, §2.2, §2.3 & Plan Maestro Fase 1, 2, 3
 *
 * Endpoint: /api/webhook/whatsapp
 * - GET: Handshake de verificación de Meta Developers
 * - POST: Recepción de mensajes, idempotencia Upstash, atajos sin IA,
 *         calificación de leads y guardado en demo_requests / whatsapp_messages.
 * ================================================================
 */

import { sessionStore } from "@/lib/session-store";
import { getWhatsAppBotConfig } from "@/lib/services/whatsapp.service";
import { postgrestInsert } from "@/lib/insforge";

interface MetaWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          id: string;
          from: string;
          text?: { body: string };
        }>;
        contacts?: Array<{
          profile?: { name: string };
        }>;
      };
    }>;
  }>;
}

export async function handleWhatsAppWebhook(request: Request): Promise<Response> {
  // --------------------------------------------------------------
  // Handshake GET (Verificación de Meta Developers)
  // --------------------------------------------------------------
  if (request.method === "GET") {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    const expectedToken =
      process.env.META_WA_VERIFY_TOKEN ||
      process.env.VITE_META_WA_VERIFY_TOKEN ||
      "vibra_music_token_2026";

    if (mode === "subscribe" && token === expectedToken && challenge) {
      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    return new Response("Forbidden: Invalid verification token", { status: 403 });
  }

  // --------------------------------------------------------------
  // Recepción de Mensajes POST
  // --------------------------------------------------------------
  if (request.method === "POST") {
    try {
      const payload = (await request.json()) as MetaWebhookPayload;

      const entry = payload?.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const message = change?.messages?.[0];
      const contact = change?.contacts?.[0];

      // Si es un evento de estado de entrega (sent, delivered, read), responder 200
      if (!message) {
        return new Response(JSON.stringify({ status: "ignored_event" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const messageId = message.id;
      const fromPhone = message.from ? `+${message.from}` : "+51999999999";
      const senderName = contact?.profile?.name || "Apoderado";
      const messageBody = message.text?.body?.trim() || "";

      // 1. Idempotencia con Upstash Redis / Memory (Fase 2)
      const isNew = await sessionStore.isMessageNew(messageId);
      if (!isNew) {
        return new Response(JSON.stringify({ status: "duplicate_ignored" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // 2. Registrar mensaje entrante en PostgreSQL (whatsapp_messages)
      try {
        await postgrestInsert("whatsapp_messages", {
          message_id: messageId,
          phone: fromPhone,
          sender_name: senderName,
          direction: "inbound",
          body: messageBody,
          status: "recibido",
          resolved_by: "bot",
          raw_payload: message,
        });
      } catch (dbErr) {
        console.warn("[WhatsApp Webhook DB non-blocking]:", dbErr);
      }

      // 3. Cargar configuración del bot en runtime (ADR-001 §2.2)
      const botConfig = await getWhatsAppBotConfig();

      // 4. Filtro de Costo / Atajos Deterministas SIN IA (Fase 3.1)
      const lowerBody = messageBody.toLowerCase();
      let matchedShortcutText: string | null = null;

      for (const sc of botConfig.shortcuts) {
        if (sc.enabled) {
          const cmd = sc.command.toLowerCase();
          const cleanCmd = cmd.replace("/", "");
          if (
            lowerBody.includes(cmd) ||
            lowerBody === cleanCmd ||
            (cleanCmd === "precios" && (lowerBody.includes("precio") || lowerBody.includes("cuanto cuesta") || lowerBody.includes("costo"))) ||
            (cleanCmd === "horarios" && (lowerBody.includes("horario") || lowerBody.includes("dias") || lowerBody.includes("que dias"))) ||
            (cleanCmd === "ubicacion" && (lowerBody.includes("ubicacion") || lowerBody.includes("donde queda") || lowerBody.includes("direccion") || lowerBody.includes("sede"))) ||
            (cleanCmd === "pagos" && (lowerBody.includes("pagar") || lowerBody.includes("yape") || lowerBody.includes("transferencia")))
          ) {
            matchedShortcutText = sc.text;
            break;
          }
        }
      }

      if (matchedShortcutText) {
        try {
          await postgrestInsert("whatsapp_messages", {
            phone: fromPhone,
            sender_name: botConfig.agent_name,
            direction: "outbound",
            body: matchedShortcutText,
            status: "enviado",
            resolved_by: "bot",
          });
        } catch (dbErr) {
          console.warn("[WhatsApp Webhook DB non-blocking]:", dbErr);
        }

        return new Response(
          JSON.stringify({ status: "success", type: "shortcut", reply: matchedShortcutText }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // 5. Saludo inicial si es primer contacto
      const sessionHistory = await sessionStore.getSessionHistory(fromPhone);
      if (sessionHistory.length === 0 && (lowerBody.includes("hola") || lowerBody.includes("buenas") || lowerBody.includes("buenos"))) {
        const welcomeText = botConfig.initial_greeting;
        await sessionStore.appendSessionMessage(fromPhone, "user", messageBody);
        await sessionStore.appendSessionMessage(fromPhone, "model", welcomeText);

        try {
          await postgrestInsert("whatsapp_messages", {
            phone: fromPhone,
            sender_name: botConfig.agent_name,
            direction: "outbound",
            body: welcomeText,
            status: "enviado",
            resolved_by: "bot",
          });
        } catch (dbErr) {
          console.warn("[WhatsApp Webhook DB non-blocking]:", dbErr);
        }

        return new Response(
          JSON.stringify({ status: "success", type: "welcome", reply: welcomeText }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // 6. Solicitud directa de asesor humano (Handoff a Claudia / Sergio)
      if (
        lowerBody.includes("asesor") ||
        lowerBody.includes("humano") ||
        lowerBody.includes("persona") ||
        lowerBody.includes("secretaria") ||
        lowerBody.includes("hablar con alguien")
      ) {
        const advisorText =
          "Entendido. En este momento estoy notificando a Dirección (Claudia y Sergio) para que un asesor continúe tu atención de forma personalizada. ¡Un momento por favor! 📲";

        try {
          await postgrestInsert("whatsapp_messages", {
            phone: fromPhone,
            sender_name: botConfig.agent_name,
            direction: "outbound",
            body: advisorText,
            status: "enviado",
            resolved_by: "humano",
          });
        } catch (dbErr) {
          console.warn("[WhatsApp Webhook DB non-blocking]:", dbErr);
        }

        return new Response(
          JSON.stringify({ status: "handoff", reply: advisorText }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // 7. Respuesta orientativa por defecto guiando al embudo
      const guidanceText =
        "Gracias por tu mensaje en Vibra Music Staff 🎵. ¿Te gustaría conocer nuestros horarios disponibles o agendar una clase demostrativa para conocer al profesor y la sala?";

      await sessionStore.appendSessionMessage(fromPhone, "user", messageBody);
      await sessionStore.appendSessionMessage(fromPhone, "model", guidanceText);

      try {
        await postgrestInsert("whatsapp_messages", {
          phone: fromPhone,
          sender_name: botConfig.agent_name,
          direction: "outbound",
          body: guidanceText,
          status: "enviado",
          resolved_by: "bot",
        });
      } catch (dbErr) {
        console.warn("[WhatsApp Webhook DB non-blocking]:", dbErr);
      }

      return new Response(
        JSON.stringify({ status: "success", reply: guidanceText }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("[WhatsApp Webhook Error]:", errMsg);
      return new Response(JSON.stringify({ status: "error", message: errMsg }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Method not allowed", { status: 405 });
}
