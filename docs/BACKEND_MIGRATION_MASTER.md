# Manual Maestro de Migración Backend (Insforge / Vibra Music)

Este documento condensa todo el estado del proyecto, decisiones de arquitectura, mapa de archivos y guía de conexión para la nueva sesión de desarrollo.

---

## 📁 1. Inventario de Código y Archivos Clave

| Componente / Archivo | Ruta | Descripción |
|---|---|---|
| **Página Principal / Landing** | `src/routes/index.tsx` | Selector de roles (Super Admin, Staff, Profesor, Familia) |
| **Dashboard de Dirección** | `src/routes/admin.index.tsx` | Métricas, widget de cumpleaños del mes y alertas |
| **Módulo Agenda** | `src/routes/admin.agenda.tsx` | Rejilla semanal, franjas por modalidad, ocupación de salas |
| **Módulo Alumnos** | `src/routes/admin.alumnos.tsx` | Tabla de activos/inactivos, modalidades (Regular/Intensivo), créditos y apoderados |
| **Módulo Facturación & Auditoría** | `src/routes/admin.facturacion.tsx` | Registro de abonos por WhatsApp (Yape/Efectivo/Transferencia), avisos a 2 días y bitácora anti-fraude |
| **Portal de Familia** | `src/routes/family.index.tsx` | Ficha del alumno con modalidades, saldo de créditos y cronómetro de práctica |
| **Kiosco de Profesor** | `src/routes/teacher.index.tsx` | Marca de asistencia rápida y notas de avance pedagógico |
| **Estado Global Zustand** | `src/store/app-store.ts` | Lógica de estado persistente, cola optimista (`syncQueue`), crédito (+1/-1) y abonos |
| **Datos Iniciales (Seeds)** | `src/store/admin-seeds.ts` | Tipos TypeScript e información extraída de los 5 Excels reales |
| **Cliente API Insforge** | `src/lib/insforge.ts` | Capa de abstracción para conectar la API de producción |
| **Script de Migración SQL** | `docs/migrations/001_initial_vibra_music_schema.sql` | Esquema de tablas PostgreSQL/Insforge y políticas RLS |

---

## 🏛️ 2. Registros de Decisiones de Arquitectura (ADR)
- [`docs/adr/0001-role-segregation-and-privacy.md`](file:///c:/Users/USER/my%20music%20staff/docs/adr/0001-role-segregation-and-privacy.md): Segregación Super Admin vs Staff (Egresos ocultos a Staff).
- [`docs/adr/0002-data-modeling-from-excel-structures.md`](file:///c:/Users/USER/my%20music%20staff/docs/adr/0002-data-modeling-from-excel-structures.md): Modalidades Regular (8 clases/45m) vs Intensivo (4 clases/90m), créditos y contactos.
- [`docs/adr/0003-frontend-state-management-and-backend-migration-strategy.md`](file:///c:/Users/USER/my%20music%20staff/docs/adr/0003-frontend-state-management-and-backend-migration-strategy.md): Estrategia de cliente desacoplado para migración limpia a Insforge.
- [`docs/adr/0004-audit-trail-and-payment-reconciliation.md`](file:///c:/Users/USER/my%20music%20staff/docs/adr/0004-audit-trail-and-payment-reconciliation.md): Control de abonos por WhatsApp con N° de Operación y bitácora inmutable de auditoría.

---

## 📊 3. Datos Extraídos de los 5 Excels Operativos
- `Control Pagos.xlsx`: Días fijos de pago (Día 1, Día 15), avisos a 2 días de vencer, tarifas ($297, $252, $197).
- `Segmentación_de_Clientes Vms.xlsx`: Apoderados 1 y 2, cumpleaños con 25% descuento, seguimiento de clases perdidas.
- `Registro de Asistencia - Escuela.xlsx`: Asistencia mensual por instrumento, hora de llegada y observaciones.
- `Registro_Ventas_Compras.xlsx`: Ventas por medio de pago (Yape/Efectivo/Transferencia) y Egresos corporativos protegidos.
- `CLASE DEMO REGISTRO.xlsx`: Control de solicitudes de clases de prueba.

---

## 🚀 4. Guía de Conexión en Insforge
1. Ejecutar `docs/migrations/001_initial_vibra_music_schema.sql` en la base de datos PostgreSQL de Insforge.
2. Definir `.env.local`:
   ```env
   VITE_INSFORGE_URL=https://tu-proyecto.insforge.app/v1
   VITE_INSFORGE_ANON_KEY=tu-clave-anonima-insforge
   ```
