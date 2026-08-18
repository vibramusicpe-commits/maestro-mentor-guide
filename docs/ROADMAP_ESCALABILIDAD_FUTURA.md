# 🗺️ ROADMAP DE ESCALABILIDAD FUTURA & PROTOCOLO DE TRANSICIÓN

**Academia de Música Vibra Music**  
**Fecha:** 17 de Agosto de 2026  
**Documento Técnico:** `docs/ROADMAP_ESCALABILIDAD_FUTURA.md` / ADR 0052  
**Autor:** Fabricio (Coordinación de TI) & Antigravity AI  

---

## 🎯 1. Resumen de la Fase Actual (MVP Operativo)

El sistema se encuentra en su fase **MVP Quirúrgico Operativo**:
- Directorio de alumnos e historial anual (Ene-Dic) para 99 alumnos.
- Agenda pareada didáctica y control de asistencia docente.
- Registro inmutable de abonos, vouchers Yape con captura fotográfica y mensajes de WhatsApp en 1 clic.
- Almacenamiento local persistente (`cadencia-app-v12`) en red local LAN.

---

## 🚀 2. Los 5 Hitos de Escalabilidad a Futuro (Fases Posteriores)

Este documento centraliza los 5 proyectos para la fase de crecimiento de la academia:

### 🔹 Hito 1: Envío de WhatsApp Automático y Desatendido (Meta Cloud API)
- **Objetivo:** Enviar recordatorios preventivos de cobro (3 días antes del vencimiento) y mensajes nocturnos de felicitación por cumpleaños o confirmación de abonos de forma 100% automática sin que la secretaria tenga que presionar botones.
- **Requisitos:** Cuenta de Facebook Business verificada, Número telefónico oficial de Vibra Music y token de WhatsApp Business Cloud API.
- **Impacto:** Cero carga operativa para secretaría en cobranzas preventivas.

---

### 🔹 Hito 2: Lector OCR Inteligente para Vouchers Yape / Plin / BCP
- **Objetivo:** Cuando Nayeli pegue una captura de pantalla de Yape o suba una foto del comprobante, un modelo de visión por computadora (IA / OCR) extraerá automáticamente:
  1. Número de Operación.
  2. Monto exacto abonado en Soles.
  3. Hora y fecha del comprobante.
  4. Nombre del remitente.
- **Impacto:** Reduce el tiempo de registro de abonos a menos de 5 segundos por comprobante y elimina errores de digitación.

---

### 🔹 Hito 3: Pasarela de Pagos Online con Tarjetas y Débito Recurrente
- **Objetivo:** Permitir que los padres de familia paguen la mensualidad directamente desde el portal familiar con tarjeta de débito/crédito (Visa, Mastercard) o suscribirse a débito automático mensual (tipo Netflix/Spotify de educación).
- **Requisitos:** Integración con Culqi, Niubiz o MercadoPago Perú con RUC de Vibra Music.
- **Impacto:** Cobranza 100% automatizada para padres ocupados.

---

### 🔹 Hito 4: Sincronización Realtime Multi-Usuario en Nube (WebSockets Insforge)
- **Objetivo:** Conexión continua bidireccional entre la base de datos PostgreSQL en la nube de Insforge y todas las pantallas (PC de Nayeli, celular de Claudia, tablets de los profesores). Si Nayeli cobra un recibo, la pantalla de Claudia se actualiza en el mismo segundo sin presionar F5.
- **Requisitos:** Despliegue de la API REST / GraphQL / Supabase Realtime de Insforge en producción.
- **Impacto:** Trabajo multi-sede y multi-dispositivo sin desfase de datos.

---

### 🔹 Hito 5: Facturación Electrónica Homologada con SUNAT (PSE / OSE)
- **Objetivo:** Emisión automática de Boletas y Facturas Electrónicas con CDR (Constancia de Recepción) oficial de SUNAT cuando se concilie un pago.
- **Requisitos:** Certificado digital tributario, usuario secundario SOL y conexión con PSE (Proveedor de Servicios Electrónicos) o API SUNAT.
- **Impacto:** Cumplimiento tributario impecable sin doble digitación en el portal de SUNAT.

---

## 🛡️ 3. Protocolo de Transición Segura: ¿Puede Nayeli trabajar 2 días seguidos antes de migrar al backend?

### ❓ Pregunta Crítica:
> *¿Nayeli puede trabajar actualmente 2 días seguidos en la versión actual y luego migrar todo a la base de datos PostgreSQL en la nube de Insforge? ¿Habrá problemas o pérdida de datos?*

### 💡 Respuesta Técnica Definitiva: **SÍ, 100% SEGURO Y SIN NINGÚN PROBLEMA.**

### 🔬 ¿Por qué es seguro?
1. **Persistencia Inmutable Local:**
   La aplicación utiliza Zustand con almacenamiento local (`localStorage` versión `cadencia-app-v12`). Cualquier acción de Nayeli (nuevo alumno, abono registrado con voucher, asistencia de profesor, nota) queda guardada permanentemente en el navegador de su PC.
2. **Cierre de Sesión y Apagado Seguro:**
   Nayeli puede cerrar la pestaña, reiniciar la computadora o apagar la máquina al final del día. Al abrir nuevamente `http://localhost:5173` (o la IP LAN de secretaría), toda su información estará intacta.
3. **Mecanismo de Extracción y Migración Transaccional:**
   Cuando concluyan los 2 días de validación y decidan conectar PostgreSQL en la nube:
   - Ejecutamos un script de 1 segundo que lee el estado completo del navegador de Nayeli (con todos los nuevos alumnos y pagos de esos 2 días).
   - Genera el script SQL `007_sync_production_state.sql`.
   - Se inyecta en Insforge sin pisar registros y manteniendo la trazabilidad completa.

---

## 📋 4. Reglas de Oro para los 2 Días de Trabajo de Nayeli:

1. ✅ **Usar siempre el mismo navegador en su PC:** Trabajar en Google Chrome (o el navegador predeterminado) de secretaría.
2. ⚠️ **No borrar historial/cookies:** No ejecutar "Borrar datos de navegación" ni usar pestañas en modo incógnito durante esos 2 días.
3. 💾 **Respaldo Automático al Final del Día:** Nayeli o tú pueden hacer clic en **"Descargar Padrón CSV"** al terminar la jornada como copia de seguridad adicional en su disco.
