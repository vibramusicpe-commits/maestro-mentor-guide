# 0043. Multi-Device Network Architecture, Cross-Origin Isolation and Backend Persistence

## Context
During local testing on development environments:
1. When switching local ports (e.g. from `http://localhost:5173` to `http://localhost:8080`) or accessing via Local Area Network (e.g. `http://192.168.18.48:5173` on mobile/tablet devices), browser security policies (**Same-Origin Policy**) isolate `localStorage` to that specific origin.
2. In production deployment, the academy operates under a single unified domain (e.g. `https://vibramusic.pe` or `https://cadencia.vibramusic.pe`), meaning all staff, teachers, and families share the same origin and backend synchronization without port collision issues.
3. For multi-device synchronization in production, data flows bidirectionally between the reactive local cache (`Zustand Persist`) and the **Insforge PostgreSQL Database** (`pdey9yma.us-east.insforge.app`).

## Decision
1. **Network & Multi-Device Synchronization Strategy**:
   - The application uses a **Hybrid Optimistic Strategy**:
     - Immediate local render & reactivity via Zustand state.
     - Background synchronization to Insforge PostgreSQL (`postgrestInsert`, `postgrestSelect`, `invitations`, `students`, `lessons`).
     - Persistent fallback queue (`syncQueue`) to handle intermittent connectivity.

2. **Strict Port Pinning for Local Development**:
   - Fixed Vite dev server configuration to `--port 5173 --strictPort` to avoid accidental port hopping and perceived state loss during local tests.

3. **Production Data Deployment Guidelines**:
   - Production builds connect directly to Cloudflare Pages + Insforge Edge with HTTPS (Port 443).
   - All network devices (mobile phones of teachers, tablets of secretary) hitting the production URL connect to the same central PostgreSQL database.

## Consequences
- **Positive**:
  - Clear architectural documentation explaining why different local URLs have isolated client caches while production uses unified cloud data.
  - Development port locked strictly to 5173 for seamless pair testing.
  - Zero risk of production cross-origin fragmentation.
