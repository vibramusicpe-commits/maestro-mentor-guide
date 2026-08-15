# 0045. Dual Password Validation and Hybrid Invitation Acceptance State

## Context
When sending invitations to teachers or family members:
1. The system creates an invitation link with a generated master password (e.g., `Vibra-MEP2-NJXH`).
2. Upon first login, the user enters the master password, is prompted to create a personalized password (e.g. `asdasd12`), and the invitation status should transition to `aceptado`.
3. Previously, on subsequent logins from the invitation URL:
   - The system strictly checked only the initial master password hash and did not recognize the newly created `custom_password`.
   - The status in the administrative invitations table retained `pendiente` if the cloud REST endpoint returned 404 in local dev mode.

## Decision
1. **Dual Password Validation (`master_password` + `custom_password`)**:
   - In `invite.$token.tsx`, password verification now checks against both the initial master key and the updated custom password stored in the invitation record.
2. **Persistent Acceptance State Synchronization**:
   - When the user sets their password in Step 2, the status is immediately committed as `status: "aceptado"` with `accepted_at` timestamp in both the database and `cadencia-invitations` storage.
   - Subsequent visits to the invitation link automatically grant direct login into the respective portal without re-prompting for the master key.
3. **Graceful Hybrid PostgREST Error Handling**:
   - Suppressed raw 404 network warnings on local endpoints and guaranteed smooth fallback to local persistent state for local development while preparing for full cloud deployment.

## Consequences
- **Positive**:
  - Teachers and families can log in seamlessly with either their original master key or their new custom password.
  - The invitations dashboard accurately reflects the `aceptado` badge.
  - Ready for production cloud server provisioning.
