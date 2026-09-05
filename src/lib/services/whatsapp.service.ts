/**
 * ================================================================
 * whatsapp.service.ts — Capa de Datos: Módulo WhatsApp Business
 * ================================================================
 * ADR-001 §2.1, §2.2, §2.4 & Plan Maestro
 *
 * Administra configuración del bot, atajos deterministas sin IA,
 * conversaciones, historial de mensajes y handoff humano.
 * ================================================================
 */

import {
  assertRole,
  postgrestInsert,
  postgrestPatch,
  postgrestSelect,
} from "@/lib/insforge";
import type { Role } from "@/store/app-store";

export interface WhatsAppShortcut {
  command: string;
  title: string;
  text: string;
  enabled: boolean;
}

export interface WhatsAppBotConfig {
  id: string;
  agent_name: string;
  initial_greeting: string;
  business_context: string;
  phone_number_id?: string | null;
  phone_display: string;
  is_active: boolean;
  shortcuts: WhatsAppShortcut[];
  updated_at?: string;
}

export interface WhatsAppMessage {
  id: string;
  message_id?: string | null;
  phone: string;
  sender_name?: string | null;
  direction: "inbound" | "outbound";
  body: string;
  status: "recibido" | "enviado" | "entregado" | "leido" | "fallido";
  resolved_by: "bot" | "humano";
  demo_request_id?: string | null;
  created_at: string;
}

export interface WhatsAppConversation {
  phone: string;
  sender_name: string;
  last_message: string;
  last_message_at: string;
  resolved_by: "bot" | "humano";
  unread_count: number;
  messages_count: number;
  status_badge: "Resuelto por bot" | "Requiere asesor";
}

export const DEFAULT_BOT_CONFIG: WhatsAppBotConfig = {
  id: "default",
  agent_name: "Vibra Bot",
  initial_greeting:
    "¡Hola! 🎵 Soy Vibra Bot, asistente de Vibra Music Staff. ¿En qué puedo ayudarte hoy?",
  business_context:
    "Vibra Music Staff es una escuela de música especializada en formar músicos integrales. Contamos con clases de guitarra, piano, batería, bajo, canto y violín. Horarios flexibles de lunes a sábado de 8:00 a.m. a 9:00 p.m. Política de cancelación: avisar con mínimo 24 horas de anticipación. Los pagos se realizan al inicio de cada mes.",
  phone_display: "+51 987 654 321",
  is_active: true,
  shortcuts: [
    {
      command: "/precios",
      title: "Precios y matrículas",
      text: "💳 *Planes y Precios Vibra Music:*\n• Plan Regular: 8 clases al mes (2x semana, 45 min) a S/ 180.00 mensual.\n• Plan Intensivo: 4 clases al mes (1x semana, 90 min en viernes o sábado) a S/ 180.00 mensual.\n• Matrícula oficial: S/ 80.00 (pago único anual).",
      enabled: true,
    },
    {
      command: "/horarios",
      title: "Horarios disponibles",
      text: "⏰ *Horarios de Clases:*\n• Lunes a Viernes: 3:00 p.m. a 9:00 p.m. (turnos cada 45 min).\n• Sábados: 8:00 a.m. a 2:00 p.m. y 2:00 p.m. a 6:00 p.m.\n¿Qué día y turno te acomoda mejor?",
      enabled: true,
    },
    {
      command: "/ubicacion",
      title: "Sede y cómo llegar",
      text: "📍 *Sede Principal Vibra Music:*\nContamos con salas acústicas equipadas para cada instrumento.\nDirección: Sede Central Vibra Music.\nGoogle Maps: https://maps.google.com/?q=Vibra+Music",
      enabled: true,
    },
    {
      command: "/instrumentos",
      title: "Cursos e instrumentos",
      text: "🎼 *Cursos disponibles:*\nPiano / Teclado, Canto, Guitarra acústica y eléctrica, Batería, Bajo y Violín. Para niños (desde 5 años), jóvenes y adultos.",
      enabled: true,
    },
    {
      command: "/profesores",
      title: "Plana docente",
      text: "👨‍🏫 *Plana Docente Oficial:*\nProf. Fernando, Prof. Jeremy y Prof. Nathaly. Músicos profesionales con amplia experiencia pedagógica infantil y juvenil.",
      enabled: false,
    },
    {
      command: "/cancelar",
      title: "Políticas de cancelación",
      text: "⚠️ *Políticas de reprogramación:*\nPuedes reprogramar tu clase avisando con un mínimo de 24 horas de anticipación para no perder tu crédito de clase.",
      enabled: true,
    },
    {
      command: "/pagos",
      title: "Métodos de pago",
      text: "💰 *Métodos de pago aceptados:*\nYape, Plin, Transferencia bancaria (BCP / BBVA) y tarjeta de crédito/débito a través de nuestro portal de pago seguro Culqi.",
      enabled: true,
    },
  ],
};

// ----------------------------------------------------------------
// Semillas de conversaciones iniciales para pruebas locales y MVP
// ----------------------------------------------------------------
let localConfigState: WhatsAppBotConfig = { ...DEFAULT_BOT_CONFIG };

let localMessagesState: WhatsAppMessage[] = [
  {
    id: "wm-1",
    phone: "+51 987 111 222",
    sender_name: "Ana María López",
    direction: "inbound",
    body: "¡Hola! Quiero información sobre clases de guitarra.",
    status: "leido",
    resolved_by: "bot",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "wm-2",
    phone: "+51 987 111 222",
    sender_name: "Ana María López",
    direction: "outbound",
    body: "¡Hola Ana María! 🎵 Claro, con gusto te brindo la información.\n\nOfrecemos clases de guitarra en los siguientes horarios:\n• Lunes a viernes: 3:00 p.m. a 9:00 p.m.\n• Sábados: 8:00 a.m. a 2:00 p.m.\nDisponemos de clases presenciales en nuestra sede. ¿Te gustaría reservar un horario?",
    status: "leido",
    resolved_by: "bot",
    created_at: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
  },
  {
    id: "wm-3",
    phone: "+51 987 111 222",
    sender_name: "Ana María López",
    direction: "inbound",
    body: "¿Cuál es el precio mensual?",
    status: "leido",
    resolved_by: "bot",
    created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
  {
    id: "wm-4",
    phone: "+51 987 111 222",
    sender_name: "Ana María López",
    direction: "outbound",
    body: "El precio mensual de guitarra es S/ 180.00. La matrícula es S/ 80.00 (pago único anual).",
    status: "leido",
    resolved_by: "bot",
    created_at: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
  },
  {
    id: "wm-5",
    phone: "+51 987 111 222",
    sender_name: "Ana María López",
    direction: "inbound",
    body: "Perfecto, quiero inscribirme.",
    status: "leido",
    resolved_by: "bot",
    created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: "wm-6",
    phone: "+51 987 111 222",
    sender_name: "Ana María López",
    direction: "outbound",
    body: "Excelente, te pongo en contacto con un asesor para completar tu inscripción.",
    status: "leido",
    resolved_by: "bot",
    created_at: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
  },
  {
    id: "wm-7",
    phone: "+51 912 345 678",
    sender_name: "Carlos Gutiérrez",
    direction: "inbound",
    body: "Gracias, ya confirmé mi pago.",
    status: "leido",
    resolved_by: "bot",
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "wm-8",
    phone: "+51 998 112 233",
    sender_name: "Diego Salazar",
    direction: "inbound",
    body: "Quiero más información sobre clases de batería y si tienen descuento para hermanos.",
    status: "recibido",
    resolved_by: "humano",
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: "wm-9",
    phone: "+51 956 789 012",
    sender_name: "Elena Rojas",
    direction: "inbound",
    body: "¿Puedo reprogramar mi clase de mañana por motivos de salud?",
    status: "recibido",
    resolved_by: "humano",
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
];

/**
 * Obtener la configuración actual del bot.
 */
export async function getWhatsAppBotConfig(userRole?: Role): Promise<WhatsAppBotConfig> {
  if (userRole) assertRole(userRole, ["super_admin", "staff"]);
  try {
    const records = await postgrestSelect<WhatsAppBotConfig[]>(
      "whatsapp_bot_config?id=eq.default&limit=1"
    );
    if (records && records.length > 0) {
      localConfigState = { ...DEFAULT_BOT_CONFIG, ...records[0] };
      return localConfigState;
    }
  } catch {
    // Si la tabla aún no se ha ejecutado en Postgres, usa el estado local
  }
  return localConfigState;
}

/**
 * Guardar cambios en la configuración del bot (Nombre, Saludo, Contexto, Atajos).
 */
export async function saveWhatsAppBotConfig(
  userRole: Role,
  newConfig: Partial<WhatsAppBotConfig>
): Promise<WhatsAppBotConfig> {
  assertRole(userRole, ["super_admin", "staff"]);
  localConfigState = {
    ...localConfigState,
    ...newConfig,
    updated_at: new Date().toISOString(),
  };

  try {
    await postgrestPatch("whatsapp_bot_config?id=eq.default", {
      agent_name: localConfigState.agent_name,
      initial_greeting: localConfigState.initial_greeting,
      business_context: localConfigState.business_context,
      shortcuts: localConfigState.shortcuts,
      is_active: localConfigState.is_active,
      updated_at: localConfigState.updated_at,
    });
  } catch {
    // Modo offline resiliente
  }

  return localConfigState;
}

/**
 * Obtener lista de conversaciones agrupadas por teléfono (Columna 3).
 */
export async function getWhatsAppConversations(userRole?: Role): Promise<WhatsAppConversation[]> {
  if (userRole) assertRole(userRole, ["super_admin", "staff"]);

  let allMessages = [...localMessagesState];
  try {
    const fromDb = await postgrestSelect<WhatsAppMessage[]>(
      "whatsapp_messages?select=*&order=created_at.desc&limit=200"
    );
    if (fromDb && fromDb.length > 0) {
      allMessages = fromDb;
    }
  } catch {
    // Fallback a mensajes locales
  }

  const map = new Map<string, WhatsAppConversation>();

  for (const m of allMessages) {
    const existing = map.get(m.phone);
    if (!existing) {
      const isNeedsAdvisor = m.resolved_by === "humano";
      map.set(m.phone, {
        phone: m.phone,
        sender_name: m.sender_name || m.phone,
        last_message: m.body,
        last_message_at: m.created_at,
        resolved_by: m.resolved_by,
        unread_count: m.status === "recibido" ? 1 : 0,
        messages_count: 1,
        status_badge: isNeedsAdvisor ? "Requiere asesor" : "Resuelto por bot",
      });
    } else {
      existing.messages_count += 1;
      if (m.status === "recibido") existing.unread_count += 1;
      if (m.resolved_by === "humano") {
        existing.resolved_by = "humano";
        existing.status_badge = "Requiere asesor";
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  );
}

/**
 * Obtener historial de mensajes de un teléfono (Columna 4).
 */
export async function getWhatsAppMessagesForPhone(phone: string): Promise<WhatsAppMessage[]> {
  try {
    const fromDb = await postgrestSelect<WhatsAppMessage[]>(
      `whatsapp_messages?phone=eq.${encodeURIComponent(phone)}&order=created_at.asc`
    );
    if (fromDb && fromDb.length > 0) {
      return fromDb;
    }
  } catch {
    // Fallback
  }
  return localMessagesState
    .filter((m) => m.phone === phone)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

/**
 * Enviar respuesta manual de un asesor humano desde el panel web.
 */
export async function sendManualWhatsAppMessage(
  userRole: Role,
  phone: string,
  text: string,
  senderName: string = "Asesor Vibra"
): Promise<WhatsAppMessage> {
  assertRole(userRole, ["super_admin", "staff"]);

  const newMessage: WhatsAppMessage = {
    id: `wm-${Date.now()}`,
    phone,
    sender_name: senderName,
    direction: "outbound",
    body: text.trim(),
    status: "enviado",
    resolved_by: "humano",
    created_at: new Date().toISOString(),
  };

  localMessagesState.push(newMessage);

  try {
    await postgrestInsert("whatsapp_messages", {
      phone,
      sender_name: senderName,
      direction: "outbound",
      body: text.trim(),
      status: "enviado",
      resolved_by: "humano",
    });
  } catch {
    // Resiliente
  }

  return newMessage;
}

/**
 * Cambiar estado de la conversación (Bot vs Humano).
 */
export async function setConversationResolvedBy(
  userRole: Role,
  phone: string,
  resolvedBy: "bot" | "humano"
): Promise<void> {
  assertRole(userRole, ["super_admin", "staff"]);

  localMessagesState = localMessagesState.map((m) =>
    m.phone === phone ? { ...m, resolved_by: resolvedBy } : m
  );

  try {
    await postgrestPatch(`whatsapp_messages?phone=eq.${encodeURIComponent(phone)}`, {
      resolved_by: resolvedBy,
    });
  } catch {
    // Resiliente
  }
}
