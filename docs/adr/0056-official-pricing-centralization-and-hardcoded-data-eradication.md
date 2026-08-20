# ADR 0056: Centralización de Tarifas Oficiales y Erradicación de Datos Hardcodeados

## Estado
Aceptado / Desplegado en Producción (Cloudflare Pages)

## Contexto y Puntos de Dolor
1. **Precios Desactualizados y Dispersos:** Se mostraban tarifas obsoletas (S/ 329 mensual, S/ 289.40 trimestral, S/ 263.20 anual) quemadas en múltiples archivos JSX, cuando las tarifas oficiales del dossier comercial son:
   * **Mensual:** S/ 297.00
   * **Trimestral (12% Dcto.):** S/ 261.40 / mes (Total S/ 784.20)
   * **Anual (20% Dcto.):** S/ 237.60 / mes (Total S/ 2,851.20)
2. **IP Fija de Red Hardcodeada:** Se utilizaba `http://192.168.18.51:5173` en generadores de enlaces de invitación en lugar del origen dinámico de producción.
3. **Fecha de Vencimiento Estática:** Se utilizaba `"2026-08-20"` fijo en la facturación en lugar de un cálculo dinámico de ciclo.
4. **Mapeo Docente Duplicado:** En la agenda se duplicaban arrays con nombres de salas y profesores.

## Decisiones y Soluciones Implementadas
1. **Única Fuente de Verdad para Tarifas (`VIBRA_PRICING`):**
   * Centralizada en `src/store/admin-seeds.ts` con los valores oficiales exactos (297.0, 261.4, 237.6).
   * Consumida en `students-table.tsx`, `agenda-board.tsx`, `admin.facturacion.tsx` y `app-store.ts`.
2. **Eliminación de IP Fija y Enlaces Dinámicos:**
   * `buildInviteLink` y el modal de invitaciones ahora utilizan `window.location.origin` / `import.meta.env.VITE_APP_URL`.
3. **Fechas Dinámicas:**
   * Sustituida la fecha fija por cálculo de vencimiento dinámico al día 20 del ciclo activo.
4. **Mapeo Docente Centralizado:**
   * Creada la constante `defaultTeacherRooms` en `admin-seeds.ts` para eliminar arrays duplicados en la agenda.

## Beneficios
- Total coherencia en precios en todas las pantallas.
- Generación de links de invitación 100% compatibles en producción (`musicstaff-vm.pages.dev`).
- Mantenimiento simplificado y libre de inconsistencias.
