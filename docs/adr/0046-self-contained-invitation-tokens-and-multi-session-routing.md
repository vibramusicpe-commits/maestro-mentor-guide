# 0046. Self-Contained Invitation Tokens and Multi-Session Incognito Routing

## Context
1. **Multi-Session Incognito Isolation**:
   - In modern browsers, private/incognito tabs do not share `localStorage` with standard tabs.
   - When generating an invitation for a Teacher (e.g. Pepito Canto) in standard mode and opening the link in Incognito, previous tokens (e.g. `inv-mss3eje9-rceo`) lacked serialized role headers.
   - If the backend RPC was disconnected or blocked by RLS policies, the fallback defaulted the role to `family`, causing the Teacher to land on the Family Portal instead of the Teacher Kiosk.
2. **Session Collision on Single Browser Profile**:
   - When logging in as a Teacher in the same browser session as Admin/Staff, Zustand's active user replaced the administrative session.

## Decision
1. **Self-Contained Deterministic Token Architecture**:
   - Format: `inv-{targetRole}-{targetNameSlug}-{timestamp}-{entropy}`
   - Example: `inv-teacher-PEPITO2_Canto-mss3eje9-rceo`
   - Regardless of whether the token is resolved via PostgREST RPC, local state, or decoded offline in incognito mode / mobile apps (Flutter, Android, iOS), the client and backend deterministically decode:
     - `target_role`: `teacher` | `family` | `staff`
     - `target_name`: `PEPITO2 (Canto)`
     - `target_email`: `teacher-...@vibramusic.pe`
2. **Deterministic Route Redirection**:
   - `invite.$token.tsx` routes strictly based on `target_role`:
     - `teacher` ➔ `/teacher` (Kiosco del Profesor)
     - `family` ➔ `/family` (Portal de Familias)
     - `staff` / `super_admin` ➔ `/admin` (Panel de Dirección)
3. **Session State Isolation**:
   - Documented recommended operational practice: Use separate browser windows (or distinct mobile profiles) for Admin management vs. Teacher kiosk testing.

## Consequences
- **Positive**:
  - Full interoperability between incognito mode, standard mode, external WhatsApp clicks, and future Flutter / native mobile clients.
  - Zero role mismatches upon login.
