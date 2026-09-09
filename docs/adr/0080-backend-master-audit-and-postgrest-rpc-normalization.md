# ADR 0080: Auditoría Maestra de Backend Insforge PostgreSQL y Normalización PostgREST / RPC

## Estado
Aprobado e Implementado

## Fecha
2026-09-08

## Contexto
Tras resolver el desacople del fichaje en vivo del quiosco docente (ADR 0079), se requirió una auditoría integral de todo el backend para garantizar que:
1. No existan otras tablas o endpoints de PostgREST bloqueados por políticas de Row Level Security (código 42501).
2. Los procedimientos almacenados de PostgreSQL ejecutados mediante RPC (`/api/database/rpc/`) se invoquen a la ruta correcta sin colisionar con `/api/database/records/`.
3. Ningún servicio sufra errores de sintaxis al concatenar filtros o parámetros de consulta (`?select=*&...`).
4. La información física almacenada en PostgreSQL refleje la realidad operativa de Vibra Music (83 familias, 83 alumnos, 83 facturas y 7 usuarios RBAC).

---

## Decisiones Técnicas Adoptadas

### 1. Desacople y Enrutamiento Inteligente en `fetchFromInsforge`
En [`src/lib/insforge.ts`](file:///c:/Users/USER/my%20music%20staff%20backend/src/lib/insforge.ts), se implementó un enrutador inteligente para llamadas a la API de Insforge:
- Si el endpoint inicia con `/rpc/` o `rpc/`, se dirige automáticamente a la URL base de funciones: `${baseUrl.replace(/\/records\/?$/, "")}/rpc/...` (`https://pdey9yma.us-east.insforge.app/api/database/rpc/...`).
- Si el endpoint es una tabla para operaciones CRUD, se mantiene en `/api/database/records/...`.

### 2. Sanitización Universal de Tablas y Filtros
Se reforzaron las funciones auxiliares `postgrestSelect`, `postgrestInsert`, `postgrestPatch` y `postgrestDelete`:
- Detección automática de signos de interrogación (`?`) en el parámetro `table`. Si una consulta previa incluye query string (ej. `demo_requests?select=*&order=created_at.desc`), los parámetros se fusionan limpiamente usando `URLSearchParams`, evitando dobles `??` y asegurando respuestas `HTTP 200 OK`.
- Eliminación de barras duplicadas iniciales (`cleanTable = table.replace(/^\/+/, "")`).

### 3. Tipado Estricto en Capa de Servicios
Se actualizó [`leads.service.ts`](file:///c:/Users/USER/my%20music%20staff%20backend/src/lib/services/leads.service.ts) para usar `postgrestSelect<DBDemoRequest>("demo_requests", { order: "created_at.desc" })`, eliminando tipos anidados erróneos (`DBDemoRequest[][]`).

### 4. Auditoría de Seguridad RLS en las 18 Tablas
Se verificó que las 18 tablas de la base de datos tengan políticas activas para `anon` y `authenticated`, permitiendo el funcionamiento transparente del frontend cliente sin sacrificar la integridad referencial de claves foráneas.

---

## Verificación de Resultados
- **18 tablas comprobadas:** 83 alumnos, 83 familias, 83 facturas oficiales, 7 usuarios RBAC.
- **10 endpoints de lectura probados:** 100% exitosos con `Status: 200 OK`.
- **Pruebas de escritura / eliminación:** `Status: 201 Created` y `Status: 204 No Content`.
- **Pruebas de RPC:** `/verify_invitation_token` respondiendo con `Status: 200 OK`.
- **Compilación de producción:** `npm run build` ejecutado con éxito (código de salida 0).
