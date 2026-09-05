-- ==============================================================================
-- Migración 007: Tablas para Agente de WhatsApp, Configuración y Mensajes
-- ==============================================================================

-- 1. Actualizar check de estado en demo_requests para incluir 'requiere_asesor', 'asistio', 'matriculado'
ALTER TABLE demo_requests DROP CONSTRAINT IF EXISTS demo_requests_status_check;
ALTER TABLE demo_requests ADD CONSTRAINT demo_requests_status_check 
  CHECK (status = ANY (ARRAY['pendiente'::text, 'confirmada'::text, 'completada'::text, 'cancelada'::text, 'asistio'::text, 'matriculado'::text, 'requiere_asesor'::text]));

-- 2. Crear tabla whatsapp_bot_config
CREATE TABLE IF NOT EXISTS public.whatsapp_bot_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  agent_name TEXT NOT NULL DEFAULT 'Vibra Bot',
  initial_greeting TEXT NOT NULL DEFAULT '¡Hola! 🎵 Soy Vibra Bot, asistente de Vibra Music Staff. ¿En qué puedo ayudarte hoy?',
  business_context TEXT NOT NULL DEFAULT 'Vibra Music Staff es una escuela de música especializada en formar músicos integrales. Contamos con clases de guitarra, piano, batería, bajo, canto y violín. Horarios flexibles de lunes a sábado de 8:00 a.m. a 9:00 p.m. Política de cancelación: avisar con mínimo 24 horas de anticipación. Los pagos se realizan al inicio de cada mes.',
  phone_number_id TEXT,
  phone_display TEXT DEFAULT '+51 987 654 321',
  is_active BOOLEAN DEFAULT TRUE,
  shortcuts JSONB NOT NULL DEFAULT '[
    {"command": "/precios", "title": "Precios y matrículas", "text": "💳 *Planes y Precios Vibra Music:*\n• Plan Regular: 8 clases al mes (2x semana, 45 min) a S/ 180.00 mensual.\n• Plan Intensivo: 4 clases al mes (1x semana, 90 min en viernes o sábado) a S/ 180.00 mensual.\n• Matrícula oficial: S/ 80.00 (pago único anual).", "enabled": true},
    {"command": "/horarios", "title": "Horarios disponibles", "text": "⏰ *Horarios de Clases:*\n• Lunes a Viernes: 3:00 p.m. a 9:00 p.m. (turnos cada 45 min).\n• Sábados: 8:00 a.m. a 2:00 p.m. y 2:00 p.m. a 6:00 p.m.\n¿Qué día y turno te acomoda mejor?", "enabled": true},
    {"command": "/ubicacion", "title": "Sede y cómo llegar", "text": "📍 *Sede Principal Vibra Music:*\nContamos con salas acústicas equipadas para cada instrumento.\nDirección: Sede Central Vibra Music.\nGoogle Maps: https://maps.google.com/?q=Vibra+Music", "enabled": true},
    {"command": "/instrumentos", "title": "Cursos e instrumentos", "text": "🎼 *Cursos disponibles:*\nPiano / Teclado, Canto, Guitarra acústica y eléctrica, Batería, Bajo y Violín. Para niños (desde 5 años), jóvenes y adultos.", "enabled": true},
    {"command": "/profesores", "title": "Plana docente", "text": "👨‍🏫 *Plana Docente Oficial:*\nProf. Fernando, Prof. Jeremy y Prof. Nathaly. Músicos profesionales con amplia experiencia pedagógica infantil y juvenil.", "enabled": false},
    {"command": "/cancelar", "title": "Políticas de cancelación", "text": "⚠️ *Políticas de reprogramación:*\nPuedes reprogramar tu clase avisando con un mínimo de 24 horas de anticipación para no perder tu crédito de clase.", "enabled": true},
    {"command": "/pagos", "title": "Métodos de pago", "text": "💰 *Métodos de pago aceptados:*\nYape, Plin, Transferencia bancaria (BCP / BBVA) y tarjeta de crédito/débito a través de nuestro portal de pago seguro Culqi.", "enabled": true}
  ]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar fila inicial por defecto si no existe
INSERT INTO public.whatsapp_bot_config (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- 3. Crear tabla whatsapp_messages
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT UNIQUE,
  phone TEXT NOT NULL,
  sender_name TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body TEXT NOT NULL,
  status TEXT DEFAULT 'recibido' CHECK (status IN ('recibido', 'enviado', 'entregado', 'leido', 'fallido')),
  resolved_by TEXT DEFAULT 'bot' CHECK (resolved_by IN ('bot', 'humano')),
  demo_request_id UUID REFERENCES public.demo_requests(id) ON DELETE SET NULL,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON public.whatsapp_messages(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON public.whatsapp_messages(created_at DESC);
