# ADR 0006: Culqi como Pasarela de Pago (reemplaza Stripe) + LMS & Comunicación

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

### Culqi (reemplaza Stripe)
La escuela Vibra Music opera en Perú. Stripe requiere documentación legal compleja para negocios en Perú y no tiene soporte nativo para Yape. **Culqi** es la pasarela de pago líder en Perú, con:
- Soporte nativo para tarjetas de débito/crédito peruanas.
- Integración con Yape Business en su roadmap.
- API simple con tokenización PCI DSS via `Culqi.js`.
- Moneda nativa: PEN (Soles peruanos).

**Nota importante**: El flujo principal de Vibra Music sigue siendo Yape/Efectivo/Transferencia registrado manualmente por la Secretaria. Culqi complementa para pagos online con tarjeta.

### LMS & Comunicación
Se detectó la necesidad de:
1. **Repositorio de Materiales**: Los profesores suben partituras, audios y videos de referencia; las familias los descargan desde el Portal.
2. **Historial de Mensajería**: Registro auditable de todos los recordatorios enviados (WhatsApp, Email, SMS) para evitar duplicados y tener evidencia de gestión de cobros.

## Decisión

### Culqi
1. Clave pública (`pk_`) en frontend via `VITE_CULQI_PUBLIC_KEY`.
2. Clave secreta (`sk_`) NUNCA en el frontend. Se usa en un endpoint del servidor (`/api/culqi/charge`).
3. Flujo: Culqi.js tokeniza la tarjeta → token `tkn_...` → backend crea cargo → `chr_...` se guarda en `invoices.culqi_charge_id`.
4. Monto siempre en céntimos de sol (S/ 297.00 → `29700`).

### LMS
1. Tabla `online_resources` con control de acceso por instrumento y nivel via RLS.
2. Archivos almacenados en Insforge Storage (o URL externa).
3. Familias solo descargan materiales de los instrumentos de sus hijos.
4. Tabla `notification_logs` registra cada mensaje enviado con canal, estado y referencia al recibo/clase.

## Consecuencias
- Pagos online disponibles sin Stripe ni dólares.
- Trazabilidad completa de mensajería (anti-duplicación de alertas).
- Portal de familia enriquecido con materiales de estudio.
- Profesor tiene herramienta para compartir recursos pedagógicos.
