/**
 * ================================================================
 * vite-env.d.ts — Tipado de las variables de entorno
 * ================================================================
 *
 * ¿Por qué existe este archivo?
 *
 * `tsconfig.json` activa `noPropertyAccessFromIndexSignature`. Sin declarar
 * las variables de entorno, TypeScript las resuelve por la firma de índice
 * (`[key: string]: any` de Vite, `[key: string]: string | undefined` de
 * `NodeJS.ProcessEnv`) y entonces exige acceso por corchetes:
 *
 *   import.meta.env["VITE_INSFORGE_URL"]   // TS4111 con punto
 *
 * Escribir corchetes en cada archivo es ruido y no documenta nada: el valor
 * sigue siendo `any`. Declarar aquí los nombres reales es la corrección de
 * raíz: se obtiene `string | undefined` (que es la verdad: una variable de
 * entorno puede no estar definida) y el acceso con punto vuelve a ser válido.
 *
 * Este archivo es un *script global* (no tiene `import`/`export` a propósito):
 * así sus interfaces se fusionan con las de `vite/client` y `@types/node` en
 * lugar de reemplazarlas.
 *
 * Regla de la casa (AGENTS.md §92): al consumir una variable de entorno nueva,
 * se declara aquí; nunca se silencia con `as any` ni con accesos por corchete.
 */

interface ImportMetaEnv {
  /** URL de PostgREST de Insforge. */
  readonly VITE_INSFORGE_URL?: string;
  /** Clave anónima (pública) de Insforge. */
  readonly VITE_INSFORGE_ANON_KEY?: string;
  /** URL REST de Upstash Redis (almacén de sesiones de WhatsApp). */
  readonly VITE_UPSTASH_REDIS_REST_URL?: string;
  /** Token REST de Upstash Redis. */
  readonly VITE_UPSTASH_REDIS_REST_TOKEN?: string;
  /** URL pública de la aplicación (enlaces de invitación). */
  readonly VITE_APP_URL?: string;
  /** Clave pública (pk_) de Culqi: no es secreta, viaja al navegador. */
  readonly VITE_CULQI_PUBLIC_KEY?: string;
  /** Token de verificación del webhook de WhatsApp Cloud API. */
  readonly VITE_META_WA_VERIFY_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    /** Mismas variables, leídas en el servidor (Nitro / Cloudflare Workers). */
    readonly VITE_INSFORGE_URL?: string;
    readonly VITE_INSFORGE_ANON_KEY?: string;
    readonly VITE_UPSTASH_REDIS_REST_URL?: string;
    readonly VITE_UPSTASH_REDIS_REST_TOKEN?: string;
    readonly VITE_CULQI_PUBLIC_KEY?: string;
    readonly VITE_META_WA_VERIFY_TOKEN?: string;
    /** Upstash sin prefijo `VITE_`: solo servidor, nunca llega al navegador. */
    readonly UPSTASH_REDIS_REST_URL?: string;
    readonly UPSTASH_REDIS_REST_TOKEN?: string;
    /** Meta WhatsApp Cloud API (server-side). */
    readonly META_WA_VERIFY_TOKEN?: string;
  }
}
