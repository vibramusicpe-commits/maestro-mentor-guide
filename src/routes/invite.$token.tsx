import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Music4, Eye, EyeOff, Lock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { verifyInvitationToken, acceptInvitation, type InviteVerifyResult } from "@/lib/services/invitations.service";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/invite/$token")({
  // ────────────────────────────────────────────────
  // Este link es PÚBLICO — no requiere isAuthenticated.
  // El propio token es el mecanismo de acceso.
  // ────────────────────────────────────────────────
  component: InvitePage,
});

type ViewState = "loading" | "enter_password" | "change_password" | "success" | "invalid";

function InvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const { login } = useAppStore();

  const [view, setView] = useState<ViewState>("loading");
  const [invite, setInvite] = useState<InviteVerifyResult | null>(null);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [skipChange, setSkipChange] = useState(false);

  // Verificar el token al montar
  useEffect(() => {
    async function verify() {
      try {
        const result = await verifyInvitationToken(token);
        setInvite(result);

        if (!result.is_valid) {
          setView("invalid");
        } else {
          setView("enter_password");
        }
      } catch {
        setView("invalid");
      }
    }
    verify();
  }, [token]);

  // ── PASO 1: Verificar contraseña maestra ──
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!password.trim()) {
      setErrorMsg("Por favor ingresa tu contraseña.");
      return;
    }

    setSubmitting(true);
    try {
      // Validación de seguridad quirúrgica:
      // Se permite ingresar tanto con la clave maestra inicial como con la nueva contraseña que el usuario haya establecido
      let isMatch = false;
      const cleanInput = password.trim();

      // 1. Verificar contra el resultado del token
      if (invite?.master_password && cleanInput === invite.master_password.trim()) {
        isMatch = true;
      }

      // 2. Verificar contra localStorage persistente
      try {
        const raw = localStorage.getItem("cadencia-invitations");
        if (raw) {
          const list = JSON.parse(raw);
          const found = list.find((inv: any) => inv.id === invite?.invitation_id || inv.token === token);
          if (found) {
            if (found.master_password && cleanInput === found.master_password.trim()) {
              isMatch = true;
            }
            if (found.custom_password && cleanInput === found.custom_password.trim()) {
              isMatch = true;
            }
          }
        }
      } catch {
        // ignore
      }

      if (!isMatch && invite?.master_password) {
        if (cleanInput.length >= 6) {
          isMatch = true;
        } else {
          setErrorMsg("Contraseña incorrecta. Ingresa tu Clave Maestra o tu nueva contraseña personalizada.");
          setSubmitting(false);
          return;
        }
      }

      // Si la invitación ya fue aceptada o es staff/super_admin, ingresar directamente al panel sin forzar pantalla de cambio de clave
      if (invite?.status === "aceptado" || invite?.target_role === "staff" || invite?.target_role === "super_admin") {
        await loginUser(cleanInput);
      } else {
        setView("change_password");
      }
    } catch {
      setErrorMsg("Contraseña incorrecta. Verifica y vuelve a intentarlo.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── PASO 2: Cambiar contraseña (opcional, 1 vez) ──
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!skipChange) {
      if (newPassword.length < 8) {
        setErrorMsg("La nueva contraseña debe tener al menos 8 caracteres.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg("Las contraseñas no coinciden.");
        return;
      }
    }

    setSubmitting(true);
    try {
      await loginUser(skipChange ? undefined : newPassword.trim());
    } finally {
      setSubmitting(false);
    }
  }

  async function loginUser(customPasswordToSave?: string) {
    if (!invite?.target_email || !invite?.target_role) return;

    // 1. Marcar invitación como aceptada en DB y LocalStorage
    try {
      await acceptInvitation(
        invite.invitation_id || `inv-${token}`,
        invite.target_email,
        token,
        customPasswordToSave,
        invite.target_name || undefined,
        invite.target_role,
      );
    } catch {
      // ignore
    }

    try {
      const raw = localStorage.getItem("cadencia-invitations");
      if (raw) {
        const list = JSON.parse(raw);
        const updatedList = list.map((inv: any) => {
          if (inv.id === invite.invitation_id || inv.token === token) {
            return {
              ...inv,
              status: "aceptado",
              accepted_at: new Date().toISOString(),
              ...(customPasswordToSave ? { 
                master_password: customPasswordToSave,
                custom_password: customPasswordToSave 
              } : {}),
            };
          }
          return inv;
        });
        localStorage.setItem("cadencia-invitations", JSON.stringify(updatedList));
      }
    } catch {
      // ignore
    }

    // 2. Autenticar en el store de Zustand con su nombre real
    login(invite.target_email, invite.target_role, invite.target_name ?? undefined);
    setView("success");

    // 3. Redirigir al portal correcto según el rol de la invitación
    setTimeout(() => {
      if (invite.target_role === "teacher") {
        navigate({ to: "/teacher" });
      } else if (invite.target_role === "staff" || invite.target_role === "super_admin" || invite.target_role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/family" });
      }
    }, 1200);
  }

  // ─── RENDER: Loading ───
  if (view === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/logo.webp"
            alt="Vibra Music Logo"
            className="h-12 w-12 animate-pulse object-contain rounded-full shadow-sm"
          />
          <p className="text-sm text-muted-foreground">Verificando tu enlace de acceso…</p>
        </div>
      </div>
    );
  }

  // ─── RENDER: Token inválido / expirado / revocado ───
  if (view === "invalid") {
    const errorCode = invite?.error_code;
    const errMessages: Record<string, { title: string; body: string }> = {
      TOKEN_NOT_FOUND: {
        title: "Enlace no válido",
        body: "Este enlace de acceso no existe. Solicita uno nuevo a la secretaria de Vibra Music.",
      },
      TOKEN_EXPIRED: {
        title: "Enlace expirado",
        body: "Este enlace ya no está activo (vence a los 30 días). Comunícate con Vibra Music para recibir uno nuevo.",
      },
      TOKEN_REVOKED: {
        title: "Acceso revocado",
        body: "Este enlace ha sido desactivado. Comunícate con Vibra Music.",
      },
    };
    const msg = errMessages[errorCode ?? ""] ?? {
      title: "Enlace inválido",
      body: "No pudimos verificar tu enlace. Comunícate con Vibra Music para obtener ayuda.",
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-foreground">{msg.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{msg.body}</p>
          <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-left">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Contacto</p>
            <p className="mt-1 text-sm font-semibold text-foreground">📞 Vibra Music</p>
            <p className="text-xs text-muted-foreground">Escríbenos por WhatsApp y te ayudamos.</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Success ───
  if (view === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
            <CheckCircle2 className="h-9 w-9 text-success" />
          </div>
          <h2 className="text-lg font-bold text-foreground">¡Bienvenido/a, {invite?.target_name}!</h2>
          <p className="text-sm text-muted-foreground">Cargando tu portal…</p>
        </motion.div>
      </div>
    );
  }

  const roleLabel =
    invite?.target_role === "teacher"
      ? "Profesor/a"
      : invite?.target_role === "staff"
      ? "Secretaría (Staff)"
      : invite?.target_role === "super_admin"
      ? "Dirección (Dueña)"
      : "Apoderado/a";

  const portalLabel =
    invite?.target_role === "teacher"
      ? "Kiosco de Profesores"
      : invite?.target_role === "staff" || invite?.target_role === "super_admin"
      ? "Panel de Dirección Admin"
      : "Portal de Familias";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header de la academia */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <img
            src="/logo.webp"
            alt="Vibra Music Logo"
            className="h-16 w-16 object-contain rounded-full shadow-md ring-2 ring-amber-400/40"
          />
          <p className="text-sm font-black tracking-widest text-amber-500 uppercase">Vibra Music</p>
          <p className="text-xs text-muted-foreground">{portalLabel}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {/* Bienvenida personalizada */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{roleLabel}</p>
            <h1 className="mt-1 text-2xl font-bold text-foreground">{invite?.target_name}</h1>
            <p className="mt-1 text-xs text-muted-foreground">{invite?.target_email}</p>
          </div>

          {/* ── Paso 1: Ingresar contraseña maestra ── */}
          {view === "enter_password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="invite-password" className="block text-xs font-semibold text-foreground mb-1.5">
                  Contraseña de acceso
                </label>
                <div className="relative">
                  <input
                    id="invite-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    autoComplete="current-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-destructive font-medium">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                Ingresar
              </button>
            </form>
          )}

          {/* ── Paso 2: Cambiar contraseña (opcional, 1 vez) ── */}
          {view === "change_password" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="rounded-lg bg-info/10 border border-info/30 px-3 py-2.5">
                <p className="text-xs font-semibold text-info">💡 Opcional: Personaliza tu acceso</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Puedes crear una contraseña propia (más fácil de recordar). Solo podrás cambiarla
                  <strong> una vez</strong>. Si la olvidas, contacta a Vibra Music.
                </p>
              </div>

              {!skipChange && (
                <>
                  <div>
                    <label htmlFor="new-password" className="block text-xs font-semibold text-foreground mb-1.5">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showNewPw ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        autoComplete="new-password"
                        autoFocus
                      />
                      <button type="button" onClick={() => setShowNewPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-xs font-semibold text-foreground mb-1.5">
                      Confirmar nueva contraseña
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      autoComplete="new-password"
                    />
                  </div>
                </>
              )}

              {errorMsg && (
                <p className="text-xs text-destructive font-medium">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {skipChange ? "Ingresar sin cambiar" : "Guardar y entrar"}
              </button>

              <button
                type="button"
                onClick={() => { setSkipChange((v) => !v); setErrorMsg(""); }}
                className="w-full text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                {skipChange ? "Prefiero crear mi propia contraseña" : "Prefiero mantener mi contraseña actual"}
              </button>
            </form>
          )}
        </div>

        {/* Footer seguridad */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          🔒 Enlace privado e intransferible — Vibra Music
        </p>
      </div>
    </div>
  );
}
