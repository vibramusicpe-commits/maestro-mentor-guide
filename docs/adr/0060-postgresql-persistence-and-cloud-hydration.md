# ADR 0060: Persistencia Real en Base de Datos PostgreSQL y Auto-Sincronización en la Nube

## Estado
Aceptado e Implementado

## Contexto
Para evitar que se pierdan modificaciones si Nayeli o la administración limpian la caché del navegador, cookies o reinician la computadora, se requería estructurar la persistencia directa en la base de datos central PostgreSQL en la nube (Insforge).

## Decisiones Técnicas

### 1. Script SQL Maestro de Poblado Inicial ([`004_populate_real_data_seeds.sql`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/migrations/004_populate_real_data_seeds.sql))
- Inserción de usuarios del personal (`super_admin` Dueña, `staff` Nayeli, `teacher` Jeremy, `teacher` Fernando, `teacher` Nathaly, `teacher` Demo).
- Inserción de las familias (`families`) y los **99 alumnos reales** (`students`) con nombres, teléfonos, instrumentos, niveles, profesores asignados, modalidades, planes contratados, fechas de vigencia y contactos de emergencia.
- Inserción de las **99 facturas oficiales** (`invoices`) con estados de pago reales (`pagado`, `pendiente`, `vencido`).

### 2. Mapeadores Tipados de Base de Datos a Modelo UI
- Creados `mapDBStudentToAdminStudent` en [`students.service.ts`](file:///C:/Users/USER/my%20music%20staff%20backend/src/lib/services/students.service.ts) y `mapDBInvoiceToInvoice` en [`invoices.service.ts`](file:///C:/Users/USER/my%20music%20staff%20backend/src/lib/services/invoices.service.ts) para transformar los registros relacionales de PostgreSQL en la estructura utilizada por los componentes.

### 3. Hidratación y Auto-Sincronización en el Layout Admin
- Añadida la acción `hydrateFromBackend` en el store global Zustand ([`app-store.ts`](file:///C:/Users/USER/my%20music%20staff%20backend/src/store/app-store.ts)).
- Integrado el hook `useInsforgeSync` en el componente [`AdminLayout`](file:///C:/Users/USER/my%20music%20staff%20backend/src/routes/admin.tsx) para consultar y sincronizar en vivo los datos desde PostgreSQL al montar la aplicación.

## Consecuencias y Validación
- Los datos se leen y persisten de forma segura en la base de datos central.
- Limpiar caché o abrir desde un dispositivo nuevo recarga automáticamente la información más reciente desde el backend.
- `npm run build` ejecutado exitosamente (0 errores, 470ms).
