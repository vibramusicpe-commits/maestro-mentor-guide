# ADR 0039: Limpieza Definitiva de Semillas Mock de Producción y Migración de Estado

- **Estado**: Aceptado
- **Fecha**: 2026-08-13
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
- Para la entrega oficial del sistema, era imperativo que la aplicación no naciera con datos de prueba inventados (`initialSchedule`, `adminStudents`, `initialInvoices`, `initialLessons`, `initialKids`).
- Todas las estructuras de la base de datos de PostgreSQL en Insforge (`lessons`, `students`, `invoices`, `families`, `invitations`) ya cuentan con sus esquemas y columnas oficiales correspondientes.

## Decisiones
1. En `src/store/admin-seeds.ts` y `src/store/seeds.ts`:
   - Se inicializaron todas las constantes como colecciones vacías (`[]`).
   - Los contadores de las tarjetas superiores ahora calcularán directamente sobre los datos reales que ingrese secretaría o dirección mediante los importadores CSV o altas manuales.
2. En `src/store/app-store.ts`:
   - Se actualizó la clave de almacenamiento local a `cadencia-app-v2` (version: 2) para forzar la migración y evitar que datos cacheados de sesiones previas en los navegadores reaparezcan.

## Consecuencias
- La aplicación arranca 100% limpia en blanco, lista para que Nayeli suba los archivos de Excel reales.
- Se preservan intactas todas las funcionalidades, validaciones y filtros de seguridad.
