# ADR-001: Integración de Agente de WhatsApp y Pagos en Vibra Music Staff

**Estado:** Aprobado para iniciar desarrollo
**Fecha:** 2026-09-05
**Sistema:** Vibra Music Staff (webapp propia, copia mejorada de My Music Staff)
**Autor del contexto:** conversación de planeamiento previa al desarrollo con el agente antigravity

---

## 1. Contexto

Vibra Music Staff ya está en producción y resuelve el 80% del problema de gestión de la escuela:

- Backend en **TanStack Start / Nitro**.
- Base de datos **PostgreSQL vía Insforge**, con la tabla demo_requests (parent_name, parent_phone, student_name, instrument, preferred_date, preferred_time, status, 
otes).
- Motor de aforo y vacantes en tiempo real (acancy-availability-panel.tsx) por profesor (Jeremy, Fernando, Nathaly), sala y turno.
- Enlaces propios de acceso para padres y para profesores.
- Panel de administración donde operan la secretaria y los dos dueños, que controlan todo el negocio.

Lo que **falta** y motiva este ADR:

1. Un agente conversacional de WhatsApp que capture leads y agende clases demo sin salirse de flujo, conectado a demo_requests.
2. Cobro de matrículas/mensualidades, hoy inexistente (la webapp tiene el flujo pensado pero sin pasarela integrada).

Restricciones ya decididas por el equipo, no negociables para este ADR:

- **No ManyChat ni Kommo** — costo recurrente en USD y duplican lo que la webapp ya hace.
- **No Baileys / conexión no oficial tipo QR** — el número ya sufrió un bloqueo permanente usando n8n con una conexión no oficial. Se exige seguridad de cuenta ante todo.
- **No Stripe / PayPal / MercadoPago** — el equipo opera en Perú y usa **Culqi**.

Se revisaron dos referencias externas durante el research:

- **Wispify** (SaaS mexicano): panel multi-agente sobre Cloud API oficial, con saludo/contexto editable por bot, estimador de costo antes de enviar campañas, y (ojo) también ofrece un modo Baileys que este equipo descarta explícitamente.
- **Ferretería Castor** (proyecto de referencia, Python/FastAPI + Chatwoot + Redis + Postgres + Docker): resuelve multilínea oficial de WhatsApp con handoff transparente a asesores humanos vía Chatwoot, idempotencia de webhooks con Redis, y el procedimiento correcto para generar un **token permanente** de Meta vía usuario de sistema.

No se encontró información pública confirmada sobre el stack técnico exacto de Wispify (Python u otro); no se asume.

---

## 2. Decisión

Se adopta el **patrón** de Ferretería Castor, no su stack ni su código, montado sobre la infraestructura Node/TanStack que Vibra Music Staff ya tiene en producción. Reescribir el backend en Python/FastAPI no está justificado: el backend actual funciona y function calling + estado en Postgres se implementan igual de bien en Nitro.

### 2.1 Conexión de WhatsApp
- Meta **Cloud API oficial**, exclusivamente. Cero Baileys, cero QR.
- Token de acceso **permanente**, generado vía usuario de sistema en Business Manager (no el token temporal de 24h de pruebas):
  Business Manager → Configuración del negocio → Usuarios del sistema → crear usuario admin → Asignar activos → Cuentas de WhatsApp → permiso Administrar cuenta → Generar nuevo token con los scopes whatsapp_business_messaging y whatsapp_business_management.
- El webhook vive donde ya está planeado: /api/webhook/whatsapp sobre Nitro.

### 2.2 Motor del agente
- **Function calling obligatorio** (	ool_choice forzado) para extraer {alumno, edad, instrumento, fecha} — el modelo nunca decide el flujo libremente, solo llena campos de un schema.
- **Estado de la conversación en Postgres/Insforge**, no en el LLM ni en un vector store. El pedido/agenda en curso es una fila de estado, recuperable por ID.
- **RAG ligero, solo para conocimiento estático** (instrumentos, metodología, precios) — chunks pequeños, 	op_k 3-5, nunca para el pedido activo.
- Contexto del bot editable (nombre del agente, saludo inicial, contexto del negocio) expuesto en el panel de administración existente — inspirado en el panel de Wispify, pero como un tab nuevo dentro de Vibra Music Staff, no una herramienta externa.

### 2.3 Persistencia y estado efímero
- **Postgres (Insforge)** sigue siendo la fuente de verdad — ya tiene demo_requests.
- Se añade **Redis** solo para tres cosas puntuales: (a) idempotencia de webhooks entrantes por message_id, (b) rate limiting, (c) estado efímero de una conversación en curso antes de confirmarse (nunca el registro final).

### 2.4 Handoff humano (opcional, evaluar necesidad real primero)
- Si el volumen de conversaciones lo justifica, se adopta **Chatwoot** como bandeja omnicanal para cuando el bot no resuelve o el padre pide un asesor — mismo patrón que Ferretería Castor: transferencia transparente, nota interna con el motivo, estado open/snoozed.
- Si el volumen es bajo (como es hoy), esto puede posponerse: el panel de administración actual con notificación a Claudia o Sergio puede bastar para el MVP.

### 2.5 Pagos
- **Culqi Orders API** desde el backend (server-side) para crear la orden de cobro (monto, moneda, metadata del alumno).
- Página de checkout **propia**, hosteada en Vibra Music Staff, usando el widget Culqi Checkout / Culqi.js sobre esa orden.
- El bot envía la URL de esa página de checkout como mensaje normal de WhatsApp — no como botón de pago nativo de Meta (esa función, Enhanced Payment Links, hoy está orientada a mercados con UPI y no está confirmada para Culqi/Perú).
- Webhook de Culqi confirma el pago → actualiza el estado en demo_requests/matrícula → notifica en el panel.

### 2.6 Multilínea
- Se deja el diseño preparado para un mapeo tipo phone_number_id → sede (como WHATSAPP_INBOX_MAPPING en Ferretería Castor), pero **no se activa** — hoy Vibra Music opera con un solo número.

---

## 3. Alternativas consideradas

| Opción | Por qué se descarta |
|---|---|
| ManyChat / Kommo | Costo recurrente en USD, duplica funcionalidad ya construida |
| Evolution API en modo Baileys | Riesgo de bloqueo permanente, ya vivido con n8n |
| Reescribir backend en FastAPI/Python (copiar Ferretería Castor tal cual) | No hay necesidad de reescribir un backend en producción que funciona |
| Botón de pago nativo de WhatsApp (Enhanced Payment Links) | No confirmado para Culqi/Perú; se revisará más adelante |

---

## 4. Consecuencias

**A favor:** cero riesgo de bloqueo de cuenta, cero licencia SaaS recurrente, se reutiliza el 80% de lo ya construido, un solo lugar de verdad para el estado del pedido.

**Trade-offs:** Redis (y Chatwoot, si se activa) son piezas nuevas de infraestructura a desplegar y mantener; el token permanente de Meta requiere una configuración manual única en Business Manager; falta confirmar con Culqi si su Orders API permite generar la orden 100% server-side sin pasos manuales en su panel.

---

## 5. Contexto para el agente de código (antigravity)

Este bloque está pensado para pegarse directamente en el prompt de antigravity — es contexto, no código:

> Vibra Music Staff ya tiene en producción un backend en TanStack Start/Nitro con Postgres (Insforge), la tabla demo_requests y un motor de aforo (acancy-availability-panel.tsx). El trabajo nuevo es: (1) un webhook de WhatsApp Cloud API oficial (nunca Baileys) que reciba mensajes, use function calling obligatorio para extraer los datos de una clase demo y los escriba en demo_requests; (2) un flujo de cobro que cree una orden vía la API de Culqi (no Stripe) y sirva una página de checkout propia con Culqi Checkout/Culqi.js, cuya URL se manda por WhatsApp como mensaje normal. El estado de cada conversación en curso va en Redis (idempotencia y sesión efímera); el resultado final siempre en Postgres. No reescribir el backend existente en otro lenguaje — todo se integra sobre lo que ya hay. Si en algún punto el agente propone Baileys, Stripe, o mover el estado del pedido a un vector store, esas tres cosas están explícitamente descartadas por decisión del equipo.

---

## 6. Pendientes / preguntas abiertas

- ¿Se auto-hospeda Chatwoot en Docker (gratis) o se evalúa su versión cloud, y solo si el volumen de conversaciones lo justifica?
- Confirmar con soporte de Culqi si su Orders API permite generar y disparar la orden 100% server-side.
- Definir si Claudia o Sergio queda como responsable por defecto de las alertas de nuevas demos/pagos.
