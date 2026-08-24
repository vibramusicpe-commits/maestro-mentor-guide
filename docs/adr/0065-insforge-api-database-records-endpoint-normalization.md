# ADR 0065: Normalización de Endpoint REST Insforge a /api/database/records y Supresión de 404 en Consola

## Estado
Aceptado e Implementado

## Contexto
1. Al iniciar sesión en la WebApp con las credenciales de secretaría (Nayeli — 
ayeli@vibramusic.pe) o acceder al módulo de invitaciones (/admin/invitaciones), la consola de Edge/Chrome registraba peticiones en rojo:
   `
   GET https://pdey9yma.us-east.insforge.app/rest/v1/students?... 404 (Not Found)
   GET https://pdey9yma.us-east.insforge.app/rest/v1/invitations?... 404 (Not Found)
   `
2. La causa raíz radicaba en que la configuración del cliente en src/lib/insforge.ts utilizaba el prefijo /rest/v1, cuando el servidor backend de Insforge en pdey9yma.us-east.insforge.app expone los endpoints de datos relacionales bajo la ruta /api/database/records/{tabla}.
3. Aunque el frontend operaba de manera segura bajo el modo híbrido con fallback local (Zustand + LocalStorage), era necesario corregir el enrutamiento base para que las peticiones devuelvan 200 OK y la consola de producción permanezca completamente limpia.

## Decisiones Técnicas

### 1. Normalización de INSFORGE_CONFIG.baseUrl
En src/lib/insforge.ts:
- Se actualizó la URL base por defecto a https://pdey9yma.us-east.insforge.app/api/database/records.
- Se añadió un mecanismo de normalización automática que reemplaza cualquier sufijo /rest/v1 proveniente de variables de entorno por /api/database/records.

### 2. Validación de Respuestas de Red
- GET /api/database/records/students -> Responde 200 OK.
- GET /api/database/records/invitations -> Responde 200 OK.
- GET /api/database/records/invoices -> Responde 200 OK.

## Consecuencias
- Cero errores 404 Not Found en la consola de inspección del navegador.
- Sincronización transparente entre el cliente y el backend PostgreSQL de Insforge.
- Despliegue continuo limpio en Cloudflare Pages.
