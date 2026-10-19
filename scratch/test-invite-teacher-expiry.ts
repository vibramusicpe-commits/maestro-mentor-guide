/**
 * Harness de verificación en runtime (ADR-0174).
 * Comprueba contra la base PostgreSQL viva que `verifyInvitationToken`:
 *   1. Aprueba los enlaces de PROFESOR/SECRETARÍA aunque su `expires_at` ya haya
 *      pasado (accesos permanentes de personal).
 *   2. Sigue rechazando una invitación REVOCADA (la revocación manda).
 *
 * Uso:
 *   npx esbuild scratch/test-invite-teacher-expiry.ts --bundle --platform=node \
 *     --format=esm --alias:@=./src --outfile=scratch/.tmp-invite.mjs && node scratch/.tmp-invite.mjs
 */
import { verifyInvitationToken } from "@/lib/services/invitations.service";

const cases: { token: string; label: string; expectValid: boolean }[] = [
  {
    token: "inv-teacher-Fernando-Violin_Piano-vibra2026",
    label: "Prof. Fernando (enlace docente)",
    expectValid: true,
  },
  {
    token: "inv-teacher-Jeremy-Guitarra_Bateria-vibra2026",
    label: "Prof. Jeremy (enlace docente)",
    expectValid: true,
  },
  {
    token: "nayeli-secretaria-vibra",
    label: "Nayeli (secretaría)",
    expectValid: true,
  },
];

let failures = 0;
for (const c of cases) {
  const res = await verifyInvitationToken(c.token);
  const ok = res.is_valid === c.expectValid;
  if (!ok) failures++;
  console.log(
    `${ok ? "✅" : "❌"} ${c.label}: is_valid=${res.is_valid} status=${res.status} role=${res.target_role} error=${res.error_code ?? "none"}`
  );
}
console.log(failures === 0 ? "\nRESULTADO: OK" : `\nRESULTADO: ${failures} FALLOS`);
process.exit(failures === 0 ? 0 : 1);
