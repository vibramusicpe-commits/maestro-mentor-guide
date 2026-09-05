// TanStack Start & Nitro configuration
// Includes: TanStack devtools, tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (cloudflare)
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
