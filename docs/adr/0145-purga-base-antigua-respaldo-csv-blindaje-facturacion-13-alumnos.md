# ADR-0145: Purga de Semillas Heredadas, Respaldo Histórico en CSV y Blindaje de Facturación (13 Alumnos Activos)

## Estado
Aprobado e Implementado

## Fecha
2026-09-30

## Contexto
En el módulo de Cobros y Abonos (`/admin/facturacion`), al pulsar "Generar Recibos del Mes", el modal de confirmación desplegó un conteo erróneo de "97 familias activas", cuando en la base de datos de producción únicamente existen 13 alumnos activos confirmados.
La causa raíz se debió a:
1. El modal en `src/routes/admin.facturacion.tsx` renderizaba `{adminStudents.length}` (el tamaño del arreglo total en memoria) en lugar de `{activeStudents.length}` (alumnos con `status === "activo"`).
2. El array `adminStudents` en `src/store/admin-seeds.ts` continuaba cargando 95 registros de prueba heredados (`baseControlStudents`, `missingAdminStudents`, `missingScheduleStudents`), los cuales se propagaban a la memoria de Zustand y al `localStorage` del navegador.

La dirección y secretaría exigieron:
- Respaldar la totalidad de la base histórica antigua (142 registros) en un archivo Excel/CSV independiente para su gestión externa.
- Purgar las semillas mock del frontend para que el sistema opere al 100% con los 13 alumnos activos reales de PostgreSQL.
- Preservar incondicionalmente la papelera de reciclaje (`deletedStudents`) bajo el principio: *"Ninguna clase se pierde, ningún dato se pierde"*.
- Corregir el modal y la lógica de generación masiva de recibos para que deduplique por mes lectivo, preserve recibos ya emitidos/pagados y persista en PostgreSQL.

## Decisiones Técnicas

### 1. Respaldo Consolidado de la Base Histórica en CSV
- Se extrajeron y consolidaron los **142 alumnos históricos** en `archivo_historico_base_antigua_alumnos_vibra_music.csv` con codificación UTF-8 con BOM (`\uFEFF`), compatible con Microsoft Excel.
- Incluye todos los campos de contacto, profesor, instrumento, modalidad, costos, pack de útiles, notas y récords de pago y asistencia de Junio a Diciembre.

### 2. Desacoplamiento de Semillas en Frontend
- En `src/store/admin-seeds.ts`, `export const adminStudents: AdminStudent[] = [];` se inicializa como un array vacío.
- En `src/store/app-store.ts`, se actualizó la versión de persistencia de Zustand a `cadencia-app-v32`, limpiando las versiones residuales `v1` a `v31` de `localStorage`.
- En la función de migración (`migrate`), se purgaron los registros inactivos provenientes de semillas mock, conservando únicamente los alumnos activos.
- En `hydrateFromBackend`, se purgó cualquier residuo mock antes del merge, garantizando que PostgreSQL sea la única fuente de verdad.

### 3. Blindaje de Emisión de Recibos en Facturación
- En `src/routes/admin.facturacion.tsx` línea 2530, se reemplazó `{adminStudents.length}` por `{activeStudents.length}`.
- En `generateMonthlyInvoices` (`app-store.ts`):
  - Deduplica por alumno y mes lectivo (`currentYearMonth`).
  - No sobrescribe recibos pagados o existentes.
  - Sincroniza cada nuevo recibo en PostgreSQL vía `backgroundCreateInvoiceInDB`.

### 4. Preservación Incondicional de la Papelera de Reciclaje
- Se mantiene intacto el sistema de papelera (`deletedStudents`, `deleteStudent`, `deleteStudents`, `restoreStudentLog`) para que cualquier baja manual quede documentada con snapshot completo, motivo, usuario y fecha.

## Consecuencias
- La emisión de recibos en `/admin/facturacion` muestra y procesa exactamente las **13 familias activas**.
- Desaparece cualquier residuo de 97 o 95 alumnos ficticios en la memoria operativa.
- Cero regresiones en TypeScript y empaquetado SSR de TanStack Start / Nitro.
