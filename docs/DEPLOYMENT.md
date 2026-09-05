# =============================================================
# Guía de Despliegue — Cadencia / Maestro Mentor Guide
# Plataforma: Cloudflare Pages + Workers (Nitro SSR)
# =============================================================
# Stack: TanStack Start (Nitro) → Cloudflare Workers (SSR)
# La configuración de vite/nitro usa 'cloudflare' como target por defecto.
# =============================================================

## Arquitectura

[Usuario]
    ↓
[Cloudflare Pages CDN]   ← Sirve el HTML/JS/CSS estático
    ↓
[Cloudflare Worker]      ← Ejecuta el SSR de TanStack Start (Nitro)
    ↓
[CORS Middleware]        ← src/lib/cors.middleware.ts (ALLOWED_ORIGINS)
    ↓
[Route Guard]            ← beforeLoad en admin.tsx / teacher.tsx / family.tsx
    ↓
[Insforge PostgREST]     ← pdey9yma.us-east.insforge.app/rest/v1
    ↓
[PostgreSQL + RLS]       ← Datos seguros por rol

=============================================================
## FASE 1: Subdominio Gratuito Cloudflare (.pages.dev)
=============================================================

### Paso 1 — Conectar repo a Cloudflare Pages
1. Dashboard → Workers & Pages → Create → Pages → Connect to Git
2. Build settings:
   - Build command:       npm run build   (o bun run build)
   - Build output dir:    .output/public
   - Root directory:      /

### Paso 2 — Variables de Entorno (Panel Pages → Settings → Env Vars)
Añadir en Production Y Preview:

  VITE_INSFORGE_URL      = https://pdey9yma.us-east.insforge.app/rest/v1
  VITE_INSFORGE_ANON_KEY = anon_897abc3685c27a2e113b8022caaf12a8dc8233b25aa9ce5397c83ffa88362804  [SECRET]
  VITE_CULQI_PUBLIC_KEY  = pk_live_TuClavePublicaRealDeCulqi
  VITE_API_BASE_URL      = https://<tu-proyecto>.pages.dev           ← Actualizar con tu subdominio real
  VITE_APP_ENV           = production
  ALLOWED_ORIGINS        = https://<tu-proyecto>.pages.dev           ← Igual que VITE_API_BASE_URL

### Paso 3 — Secrets del Worker (NUNCA en Pages)
Worker Settings → Variables → Add secret:

  CULQI_SECRET_KEY           = sk_live_TuClaveSecretaCulqi
  INSFORGE_SERVICE_ROLE_KEY  = (solo si necesitas bypass de RLS desde el servidor)

=============================================================
## FASE 2: Dominio Personalizado (ej. vibramusic.com)
=============================================================

### Paso 1 — Añadir dominio
Pages → tu-proyecto → Custom domains → Set up a custom domain
Ingresar: vibramusic.com (y opcionalmente www.vibramusic.com)
Cloudflare configura el DNS automáticamente.

### Paso 2 — SOLO ESTAS 2 VARIABLES CAMBIAN:

  VITE_API_BASE_URL  = https://vibramusic.com
  ALLOWED_ORIGINS    = https://<tu-proyecto>.pages.dev,https://vibramusic.com
                       ↑ Mantener ambos durante la transición de DNS (1-48hs)

### Paso 3 — Redeploy (push a main o trigger manual)

### Paso 4 — Después de confirmar que vibramusic.com funciona (≥1 semana):
  ALLOWED_ORIGINS    = https://vibramusic.com
                       ↑ Opcionalmente remover el subdominio viejo

=============================================================
## Nota sobre SSR vs SPA y Cloudflare Pages
=============================================================

Este proyecto usa TanStack Start con Nitro SSR (NO es SPA pura).
Nitro genera automaticamente un _worker.js que maneja todas las
rutas del servidor. NO necesitas _routes.json ni _redirects.

Si migras a modo SPA puro (solo Vite, sin SSR), añadir:
  public/_redirects:
    /*  /index.html  200

=============================================================
## Variables de Entorno — Referencia Completa
=============================================================

Variable                  | Frontend | Worker | Descripcion
--------------------------|----------|--------|------------------------------------------
VITE_INSFORGE_URL         |    SI    |   --   | URL base PostgREST de Insforge
VITE_INSFORGE_ANON_KEY    |    SI    |   --   | Clave anonima (segura con RLS activo)
VITE_CULQI_PUBLIC_KEY     |    SI    |   --   | Clave publica Culqi (tokenizacion)
VITE_API_BASE_URL         |    SI    |   --   | URL base del proyecto (cambia por fase)
VITE_APP_ENV              |    SI    |   --   | development / production
CULQI_SECRET_KEY          |   NUNCA  |   SI   | Clave secreta Culqi (cargos en servidor)
INSFORGE_SERVICE_ROLE_KEY |   NUNCA  |   SI   | Bypass RLS (operaciones admin del servidor)
ALLOWED_ORIGINS           |   --     |   SI   | CSV de dominios permitidos en CORS

=============================================================
## Checklist de Despliegue
=============================================================

FASE 1 (subdominio .pages.dev):
[ ] Conectar repo a Cloudflare Pages
[ ] Configurar variables de entorno en el panel (ver Paso 2)
[ ] Añadir secrets del Worker (Culqi sk_, Insforge service role)
[ ] Ejecutar SQL en Insforge: 002_vibra_music_complete_schema.sql
[ ] Ejecutar SQL en Insforge: 003_daily_closing.sql
[ ] Probar Route Guards: navegar manualmente a /admin como 'family'
[ ] Probar CORS: curl -H "Origin: https://tu-proyecto.pages.dev" ...
[ ] Verificar cierre de caja genera CSV legible en Excel

FASE 2 (dominio personalizado):
[ ] Añadir dominio en Pages → Custom domains
[ ] Actualizar VITE_API_BASE_URL
[ ] Actualizar ALLOWED_ORIGINS con ambos dominios
[ ] Trigger redeploy
[ ] Verificar SSL automatico de Cloudflare
[ ] Esperar propagacion DNS (5 min a 48hs, usualmente < 1 hora)

=============================================================
## Troubleshooting Frecuente
=============================================================

Error 404 en rutas despues del deploy:
  Causa: Build output dir incorrecto
  Fix:   Verificar que sea .output/public (no dist/ ni out/)

Error CORS 'blocked by CORS policy':
  Causa: ALLOWED_ORIGINS no incluye el origen exacto
  Fix:   Añadir la URL exacta a ALLOWED_ORIGINS en el Worker

Route Guard redirige en loop:
  Causa: activeRole = 'admin' (rol legacy) en vez de 'super_admin'
  Fix:   En el Role Switcher (index.tsx), setear 'super_admin'|'staff'
         nunca el string 'admin' al autenticar

Variables VITE_* undefined en el Worker:
  Causa: VITE_* son reemplazadas en build-time por Vite (client-side)
  Fix:   Las vars del Worker van en Workers Settings, no en Pages env
