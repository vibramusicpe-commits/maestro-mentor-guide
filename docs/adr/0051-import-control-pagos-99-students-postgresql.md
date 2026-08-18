# ADR 0051: Migración e Ingesta de 99 Alumnos y Control de Pagos Históricos a PostgreSQL Insforge

## Estado
Aprobado e Implementado

## Fecha
2026-08-17

## Contexto
El control de pagos de Vibra Music se gestionaba históricamente mediante una hoja de cálculo con macros (`Control_Pagos_Estructurado.csv` con 99 registros). 
Existía riesgo de sobrescritura manual de celdas y falta de inmutabilidad.
En una sesión externa se propuso crear tablas genéricas `alumnos` y `pagos` con claves enteras (`SERIAL`), lo cual hubiera generado colisiones y roto el frontend de este workspace que ya utiliza la arquitectura relacional oficial de Insforge PostgreSQL (`families`, `students`, `invoices`, `payment_audit_logs`) con identificadores UUID y seguridad RLS.

## Decisiones de Arquitectura

1. **Integración con la Arquitectura Oficial de Insforge**:
   - Mapeo directo y determinista de los 99 alumnos a las entidades oficiales:
     * `families`: Registro de cada grupo familiar con su `payment_day` real (1 a 31).
     * `students`: Registro de cada alumno con `full_name`, `notes` (observaciones del Excel) y estado operativo (`activo`, `pausa`, `baja`).
     * `invoices`: Generación de recibos de cobro de Agosto 2026 y periodos previos con estados reales (`pagado`, `parcial`, `pendiente`, `vencido`).
     * `payment_audit_logs`: Inserción de bitácora inmutable anti-fraude para los 29 alumnos al día con montos conciliados.

2. **Migración SQL Transaccional**:
   - Creado el script [`docs/migrations/006_import_control_pagos_99_students.sql`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/migrations/006_import_control_pagos_99_students.sql) encapsulado en un bloque `DO $$ ... BEGIN ... END $$;` listo para ejecutarse en el SQL Editor de Insforge sin dependencias externas.

3. **Sincronización del Store Frontend (Zustand `cadencia-app-v11`)**:
   - Generadas las semillas oficiales [`src/store/official-control-pagos-seeds.ts`](file:///C:/Users/USER/my%20music%20staff%20backend/src/store/official-control-pagos-seeds.ts).
   - Enlazadas en [`src/store/admin-seeds.ts`](file:///C:/Users/USER/my%20music%20staff%20backend/src/store/admin-seeds.ts) como `adminStudents` e `initialInvoices`.
   - Persistencia actualizada a `cadencia-app-v11` para actualización en caliente.

4. **Identificación de Deudores Críticos**:
   - Los 9 deudores señalados en el diagnóstico quedan claramente identificados en el sistema con badge de cobro pendiente y alerta para recepción.

## Consecuencias
- Eliminación de la dependencia de hojas de cálculo propensas a error humano.
- Nayeli puede registrar abonos y vouchers fotográficos en 1 clic directamente sobre los 99 alumnos.
- Cero disrupción en las vistas y rutas existentes (`/admin/agenda`, `/admin/facturacion`, `/admin/alumnos`).
