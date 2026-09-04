# ADR 0072: Capa de Datos de Prospectos y Clases Demo (demo_requests) para WhatsApp Business y Facebook Ads

## Estado
Aceptado e Implementado

## Contexto
1. **Salida Inminente de Secretaría (Nayeli):**
   - Nayeli se retira de la empresa. Ella centralizaba manualmente la atención de mensajes entrantes de Facebook Ads en WhatsApp Business y el agendamiento de clases demostrativas.
   - Existe un riesgo operativo de pérdida de leads y desaprovechamiento del presupuesto publicitario sin una automatización o registro estructurado.
2. **Infraestructura Existente en Insforge:**
   - La base de datos PostgreSQL en Insforge ya contaba con la tabla nativa demo_requests, pero no existía una capa de servicio en el frontend/backend de la webapp para interactuar con ella.

## Decisiones Técnicas

### 1. Creación de leads.service.ts ([src/lib/services/leads.service.ts](file:///c:/Users/USER/my%20music%20staff%20backend/src/lib/services/leads.service.ts))
- **getLeadsFromDB(userRole)**: Consulta todas las solicitudes de clase demo ordenadas por fecha de creación descendente (created_at DESC), con validación de rol super_admin y staff.
- **createLeadInDB(userRole, payload)**: Permite registrar nuevos prospectos con validación de datos (parent_name, parent_phone, student_name, instrument, preferred_date, preferred_time, 
otes, status: 'pendiente').
- **updateLeadStatusInDB(userRole, leadId, newStatus, notes)**: Actualiza el estado (pendiente -> confirmada -> sistio -> matriculado -> cancelada).

### 2. Exportación en Barrel Oficial ([src/lib/services/index.ts](file:///c:/Users/USER/my%20music%20staff%20backend/src/lib/services/index.ts))
- Exportado para consumo tanto en componentes de React como en server functions / webhooks de TanStack Start.

## Consecuencias
- La aplicación queda técnicamente lista para recibir leads desde bots de WhatsApp (Evolution API, Meta Cloud API o Typebot) o formularios de WordPress y persistirlos directamente en PostgreSQL sin necesidad de pagar por un CRM externo.
- 
pm run build verificado exitosamente con 0 errores.
