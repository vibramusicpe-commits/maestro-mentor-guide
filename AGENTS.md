# Guía y Reglas para Agentes de Código — Vibra Music Staff

## Decisiones Técnicas Fundamentales (ADR-001)
1. **WhatsApp Cloud API Oficial de Meta**: Usar la API oficial de la nube de Meta; nunca emuladores QR ni librerías no oficiales como Baileys.
2. **Pasarela de Pagos Culqi**: Integración oficial con Culqi para cobros en Perú (Soles PEN).
3. **Persistencia y Estado**: Postgres / Insforge como única fuente de verdad para pedidos, prospectos (`demo_requests`) y configuración (`whatsapp_bot_config`). Nunca almacenar estado transaccional en prompts o vector stores.
4. **Stack Tecnológico**: TanStack Start / Nitro sobre Cloudflare Pages y Node.js.
5. **Paleta Oficial Vibra Music**:
   - Fondo principal: `#0D0B0A` (Negro profundo)
   - Negro secundario: `#1A1410` (Negro cálido)
   - Naranja intenso: `#F47B20`
   - Amarillo/dorado luminoso: `#FFB52E`
   - Naranja acento: `#FF9E3D`
   - Texto claro: `#FFF8EC`
   - Texto oscuro: `#15120F`
6. **Horario de Clases**: Preservar estrictamente los colores funcionales del Excel físico de Nayeli para las celdas, categorías de alumnos y estados de asistencia.
