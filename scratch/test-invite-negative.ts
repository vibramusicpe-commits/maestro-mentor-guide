/**
 * Harness de verificación (ADR-0174) — control negativo SIN tocar la base viva.
 * Intercepta `fetch` para servir filas sintéticas y comprobar que la función
 * REAL `verifyInvitationToken`:
 *   - SÍ bloquea una invitación de FAMILIA vencida (is_valid=false, TOKEN_EXPIRED).
 *   - SÍ bloquea cualquier invitación REVOCADA (TOKEN_REVOKED), sea docente o familia.
 *   - NO bloquea un enlace de PROFESOR vencido (acceso permanente de personal).
 *
 * Uso:
 *   npx esbuild scratch/test-invite-negative.ts --bundle --platform=node \
 *     --format=esm --alias:@=./src --outfile=scratch/.tmp-invite-neg.mjs && node scratch/.tmp-invite-neg.mjs
 */

type Row = Record<string, unknown>;
let currentRows: Row[] = [];

const realFetch = globalThis.fetch;
// @ts-expect-error — interceptor de pruebas
globalThis.fetch = async (url: string | URL, init?: RequestInit) => {
  const u = String(url);
  if (u.includes("/invitations")) {
    return new Response(JSON.stringify(currentRows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return realFetch(url as any, init);
};

const { verifyInvitationToken } = await import("@/lib/services/invitations.service");

const past = new Date(Date.now() - 5 * 86400000).toISOString();

const scenarios: { label: string; row: Row; expectValid: boolean; expectError: string | null }[] = [
  {
    label: "Familia vencida (debe bloquear)",
    row: {
      id: "inv-fam-test", token: "inv-family-test", target_role: "family",
      target_name: "Familia Test", target_email: "familia-test@example.com",
      target_family_id: null, status: "aceptado", expires_at: past, master_password: "x",
    },
    expectValid: false,
    expectError: "TOKEN_EXPIRED",
  },
  {
    label: "Profesor vencido (acceso permanente, debe permitir)",
    row: {
      id: "inv-tea-test", token: "inv-teacher-testeo-test", target_role: "teacher",
      target_name: "Prof. Test", target_email: "prof.test@vibramusic.pe",
      target_family_id: null, status: "aceptado", expires_at: past, master_password: "x",
    },
    expectValid: true,
    expectError: null,
  },
  {
    label: "Docente REVOCADO (debe bloquear)",
    row: {
      id: "inv-tea-rev", token: "inv-teacher-revocado-test", target_role: "teacher",
      target_name: "Prof. Revocado", target_email: "prof.rev@vibramusic.pe",
      target_family_id: null, status: "revocado", expires_at: past, master_password: "x",
    },
    expectValid: false,
    expectError: "TOKEN_REVOKED",
  },
];

let failures = 0;
for (const s of scenarios) {
  currentRows = [s.row];
  const res = await verifyInvitationToken(String(s.row.token));
  const ok = res.is_valid === s.expectValid && (res.error_code ?? null) === s.expectError;
  if (!ok) failures++;
  console.log(`${ok ? "✅" : "❌"} ${s.label}: is_valid=${res.is_valid} error=${res.error_code ?? "none"}`);
}
console.log(failures === 0 ? "\nRESULTADO: OK" : `\nRESULTADO: ${failures} FALLOS`);
process.exit(failures === 0 ? 0 : 1);
