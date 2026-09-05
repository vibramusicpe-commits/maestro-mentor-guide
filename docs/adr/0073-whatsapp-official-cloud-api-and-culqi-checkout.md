# ADR 0073: Integración Oficial de WhatsApp Cloud API, Panel Administrativo y Checkout Culqi

## Estado
Aprobado e Implementado

## Fecha
2026-09-05

## Contexto
Siguiendo las decisiones arquitectónicas vinculantes de **ADR-001** y el **Plan Maestro de WhatsApp + Pagos**, la escuela Vibra Music Staff requiere:
1. Conexión oficial y legítima con WhatsApp Business mediante la Cloud API Oficial de Meta (Graph API v21.0), descartando permanentemente librerías no oficiales basadas en QR/Puppeteer (Baileys/WPPConnect) para prevenir bloqueos de cuenta.
2. Un módulo administrativo `/admin/whatsapp` fiel a los mockups de diseño con 4 pestañas:
   - **Agente**: Configuración de conexión, nombre, saludo, contexto de escuela, atajos deterministas sin IA y chat en vivo interactivo con transcripción y respuesta de asesor humano.
   - **Reglas**: Reglas de escalamiento y disparadores para handoff a Claudia y Sergio (`requiere_asesor`).
   - **Conversaciones**: Historial unificado de mensajes con filtros y estados.
   - **Citas y Ventas**: Embudo de conversión y gestión de leads sincronizados con la tabla `demo_requests` de PostgreSQL en Insforge, con acciones directas para matricular alumno y generar enlace de pago.
3. Página de cobro segura `/checkout` integrada con Culqi (Perú), solicitando el correo del apoderado en la pantalla web oficial para tokenización segura con tarjetas, Yape y Plin.
4. Idempotencia de webhooks mediante Upstash Redis (`wa:msg:{message_id}`) con fallback en memoria (LRU Cache) para entornos locales y sin credenciales.

## Decisiones Técnicas

### 1. Webhook Server-Side en `src/server/whatsapp-webhook.ts`
- Implementado a nivel de Nitro/Cloudflare Worker en `src/server.ts`, interceptando `/api/webhook/whatsapp` antes de la hidratación SSR.
- **GET**: Verificación de handshake de Meta con `hub.mode`, `hub.verify_token` y `hub.challenge`.
- **POST**: Despacho de mensajes entrantes con verificación de idempotencia, persistencia en `whatsapp_messages`, evaluación de atajos sin IA (`/precios`, `/horarios`, `/ubicacion`, `/instrumentos`, `/profesores`, `/cancelar`, `/pagos`), detección de intención de asesor humano (handoff) y captura de prospectos en `demo_requests`.

### 2. Capa de Sesión e Idempotencia (`src/lib/session-store.ts`)
- Almacenamiento desacoplado con interfaz `SessionStore`:
  - `UpstashSessionStore`: Operaciones REST sobre Upstash Redis (`SET NX EX 86400` para idempotencia y TTL 30m para 6 turnos de historial).
  - `InMemorySessionStore`: Implementación LRU con TTL en memoria para desarrollo local y resiliencia offline.

### 3. Panel de Control de WhatsApp (`src/routes/admin.whatsapp.tsx`)
- Réplica visual exacta de `media_1788622148516.png` y `media_1788622148468.jpg`.
- Interfaz reactiva con edición de atajos en modal, guardado en runtime en PostgreSQL (`whatsapp_bot_config`), y vista interactiva de chat con soporte de envío manual por el asesor.
- Métricas en tiempo real de leads, demos agendadas, conversiones a matriculados y tasa de cierre.

### 4. Checkout Seguro Culqi (`src/routes/checkout.tsx`)
- Formulario de cobro que captura el email del apoderado y lanza el modal oficial de Culqi Checkout v4.
- Tokenización y confirmación de matrícula sin pasar datos sensibles de tarjeta por el servidor ni por WhatsApp.

## Consecuencias y Validación
- `npm run build` compila al 100% exitosamente (código 0) generando el worker Nitro para Cloudflare Pages.
- Cero advertencias ni errores en el chequeo de linting en los archivos del módulo.
