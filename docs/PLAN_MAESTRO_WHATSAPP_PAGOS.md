# Plan Maestro: Agente de WhatsApp + Pagos — Vibra Music Staff

**Documento gobernante:** ADR-001-whatsapp-pagos-vibra-music-staff.md (leer primero, no contradecir)
**Estado:** Aprobado para iniciar desarrollo
**Fecha:** 2026-09-05

Este documento es el brief operativo. El ADR-001 tiene las decisiones de arquitectura y las razones; este plan tiene el orden de ejecución. Si hay conflicto entre ambos, gana el ADR.

---

## Fase 0 — Antes de tocar código (aplicar primero)
1. `tool_choice` forzado (`function_calling_config: { mode: "ANY" }` o `tool_choice: { allowed_tools: { mode: "any" } }`) en cada turno de calificación de lead — nunca `"AUTO"` ni texto libre alucinado.
2. Pedir el email del apoderado en la página de checkout propia (`/checkout`), no hardcodeado ni agregado como campo extra en WhatsApp.
3. El ID del modelo LLM se define en variable de entorno `GEMINI_MODEL_ID` (nunca hardcodeado en el código fuente), con fallback oficial por defecto a `gemini-3.1-flash-lite` (modelo oficial estable de Google AI Studio optimizado para alto volumen y bajo costo).

## Fase 1 — Conexión oficial de WhatsApp
1. Business Manager → Usuarios del sistema → crear usuario admin → Asignar activos (cuenta de WhatsApp, permiso "Administrar cuenta").
2. Generar token permanente con scopes `whatsapp_business_messaging` + `whatsapp_business_management` (nunca el token temporal de 24h).
3. Configurar el webhook en Meta Developers: URL `https://musicstaff-vm.pages.dev/api/webhook/whatsapp`, verify token propio, suscripción al campo `messages`.
4. Implementar el handshake GET y guardar token + `phone_number_id` como secrets en Cloudflare Pages.

## Fase 2 — Idempotencia y sesión (Upstash Redis)
1. Crear cuenta Upstash (free tier).
2. Clave `wa:msg:{message.id}`, TTL 24h → descarta webhooks duplicados con 200 OK.
3. Clave `wa:session:{from_phone}`, TTL 30 min → mantiene los últimos 4-6 turnos mientras se califica el lead.

## Fase 3 — Motor del agente
1. Filtro de costo: mensajes estándar (saludo, `/precios`, `/horarios`, y demás atajos definidos en el tab Reglas del panel) se responden por código directo, sin tocar el LLM.
2. Preguntas abiertas o intención de agendar → Motor Gemini vía Google AI Studio usando `GEMINI_MODEL_ID` (`gemini-3.1-flash-lite`) con las tools `consultar_vacantes` y `agendar_clase_demo`.
3. `tool_choice` forzado explícito con `mode: "ANY"` en cuanto se detecta intención de agendar clase demo o consultar vacantes.
4. Al completarse `agendar_clase_demo` → `createLeadInDB()` → escribe en `demo_requests` con `status: 'pendiente'`.
5. Los campos "Nombre del agente", "Saludo inicial" y "Contexto del negocio" del tab Agente del panel se inyectan como variables reales en el system prompt — no quedan solo como UI decorativa.

## Fase 4 — Panel admin y notificaciones
1. Nuevo status: 'requiere_asesor' en demo_requests para cuando el bot no resuelve o el padre lo pide — se refleja como badge en el tab Conversaciones.
2. Alerta visual en el panel admin existente (nada de Chatwoot todavía).
3. Notificar a Claudia y Sergio simultáneamente en cada demo agendada o pago confirmado.
4. El tab Citas y Ventas lee directo de demo_requests (y de invoices/students una vez exista la Fase 5).

## Fase 5 — Flujo de cobro con Culqi
1. POST /api/pagos/crear-orden en el backend, server-side, con CULQI_SECRET_KEY.
2. Página de checkout propia (/checkout?order_id=...) donde se pide el email antes de crear la orden — mismo diseño ya aprobado (resumen del pedido, método de pago, confirmación).
3. Bot envía la URL de esa página como mensaje normal de WhatsApp.
4. POST /api/webhook/culqi escucha order.status.changed con status: paid.
5. Al confirmarse: actualiza invoices y matricula al alumno en students.

## Fase 6 — QA antes de producción
1. Verificar el handshake del webhook contra el sandbox de Meta.
2. Correr un lead ficticio de punta a punta: mensaje → gendar_clase_demo → aparece en demo_requests y en el tab Citas y Ventas.
3. Probar el flujo de pago con las llaves de prueba de Culqi antes de pasar a llaves live.
4. Reenviar el mismo webhook a propósito y confirmar que la idempotencia lo descarta sin duplicar el lead.

## Fase 7 — Lanzamiento y monitoreo
1. Cambiar a token permanente y llaves de producción (Meta + Culqi).
2. Vigilar la primera factura de Meta después del 1 de octubre de 2026 (mensajes de servicio dentro de la ventana de 24h empiezan a cobrarse).
3. Reflejar ese costo real en las tarjetas de métricas del panel de Campañas (Costo estimado este mes), igual que ya está diseñado.

## Fuera del MVP (no bloquea el lanzamiento)
- Chatwoot, solo si el volumen de conversaciones lo justifica.
- WhatsApp Flows para reservar aforo directo dentro del chat.
- Mapeo multilínea, si Vibra Music abre una segunda sede.

## Referencias visuales aprobadas (entregar junto a este plan)
- panel_de_campañas.png — panel de Campañas, aprobado, define el estilo base.
- panel_de_whatsapp.png — panel de WhatsApp (Agente / Reglas / Conversaciones / Citas y Ventas), aprobado.
- Pantalla de checkout de pago (Culqi), aprobada, define el estilo de cara al padre de familia.
