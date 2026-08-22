import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAppStore, type Role } from "@/store/app-store";
import { motion } from "motion/react";
import { Music4, ShieldCheck, UserCheck, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VM STAFF — Acceso al Panel Vibra Music" },
      {
        name: "description",
        content:
          "Acceso exclusivo para el equipo de dirección y administración de Vibra Music.",
      },
      { property: "og:title", content: "VM STAFF — Vibra Music" },
    ],
  }),
  component: AdminLoginPage,
});

// ────────────────────────────────────────────────────────────
// Esta página es SOLO para la Dueña y la Secretaria.
// Profesores y Familias acceden por su link de invitación.
// ────────────────────────────────────────────────────────────

type AdminProfileKey = "duena" | "sergio" | "staff";

const adminProfiles: {
  key: AdminProfileKey;
  role: Role;
  icon: typeof ShieldCheck;
  label: string;
  tag: string;
  accent: string;
  email: string;
  name: string;
  passwords: string[];
}[] = [
  {
    key: "duena",
    role: "super_admin",
    icon: ShieldCheck,
    label: "Dueña (Super Admin)",
    tag: "Acceso Total",
    accent: "text-info",
    email: "direccion@vibramusic.pe",
    name: "Rocío (Dueña)",
    passwords: ["VibraDuena2026!", "Duena2026!"],
  },
  {
    key: "sergio",
    role: "super_admin",
    icon: ShieldCheck,
    label: "Sergio (Super Admin)",
    tag: "Dirección Ejecutiva",
    accent: "text-amber-500",
    email: "sergio@vibramusic.pe",
    name: "Sergio (Dirección)",
    passwords: ["VibraSergio2026!", "SergioVibra2026!", "VibraDuena2026!"],
  },
  {
    key: "staff",
    role: "staff",
    icon: UserCheck,
    label: "Secretaria (Staff)",
    tag: "Gestión Operativa",
    accent: "text-primary",
    email: "nayeli@vibramusic.pe",
    name: "Nayeli (Secretaria)",
    passwords: ["NayeliVibra2026*"],
  },
];

function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, activeRole, logout, currentUser } = useAppStore();

  const [selectedKey, setSelectedKey] = useState<AdminProfileKey | null>(null);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Si ya está autenticado, mostrar su portal correspondiente
  if (isAuthenticated && currentUser) {
    const isTeacher = activeRole === "teacher";
    const isFamily = activeRole === "family";
    const isAdmin = activeRole === "super_admin" || activeRole === "staff";

    const targetUrl = isTeacher ? "/teacher" : isFamily ? "/family" : "/admin";
    const roleTitle = isTeacher
      ? "Profesor/a"
      : isFamily
      ? "Familia / Alumno"
      : currentUser.email?.includes("sergio")
      ? "Sergio (Dirección)"
      : activeRole === "super_admin"
      ? "Dueña (Dirección)"
      : "Secretaria (Staff)";

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center">
            <img
              src="/logo.webp"
              alt="Vibra Music Logo"
              className="h-16 w-16 object-contain rounded-full shadow-md ring-2 ring-amber-400/40"
            />
          </div>
          <h1 className="mt-4 text-xl font-bold text-foreground">
            Hola, {currentUser?.name} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tienes una sesión activa como{" "}
            <span className="font-semibold text-foreground">{roleTitle}</span>.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to={targetUrl}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Ir a tu Portal ({isTeacher ? "Kiosco" : isFamily ? "Mi Cuenta" : "Administración"}) →
            </Link>
            <button
              onClick={() => logout()}
              className="text-xs text-muted-foreground hover:text-destructive underline-offset-4 hover:underline"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedKey) return;
    setErrorMsg("");
    setSubmitting(true);

    try {
      const profile = adminProfiles.find((p) => p.key === selectedKey);
      if (!profile) return;

      if (!profile.passwords.includes(password.trim())) {
        setErrorMsg("Contraseña incorrecta para este perfil. Verifica tus credenciales.");
        return;
      }

      login(profile.email, profile.role, profile.name);
      navigate({ to: "/admin" });
    } catch {
      setErrorMsg("Error al iniciar sesión. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <img
            src="/logo.webp"
            alt="Vibra Music Logo"
            className="h-16 w-16 object-contain rounded-full shadow-md ring-2 ring-amber-400/40"
          />
          <p className="text-sm font-black tracking-widest text-amber-500 uppercase">VM STAFF</p>
          <p className="text-xs text-muted-foreground">Vibra Music — Panel de Gestión</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-lg font-bold text-foreground">Acceso al equipo</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Selecciona tu perfil e ingresa tu contraseña.
          </p>

          {/* Selector de perfil */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {adminProfiles.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => { setSelectedKey(r.key); setErrorMsg(""); }}
                className={`flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-all ${
                  selectedKey === r.key
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                <r.icon className={`h-4 w-4 ${r.accent}`} />
                <span className="text-[11px] font-bold leading-tight text-foreground">
                  {r.label}
                </span>
                <span className="text-[10px] text-muted-foreground">{r.tag}</span>
              </button>
            ))}
          </div>

          {/* Campo de contraseña */}
          {selectedKey && (
            <form onSubmit={handleLogin} className="mt-4 space-y-3">
              <div>
                <label htmlFor="admin-password" className="block text-xs font-semibold text-foreground mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña de acceso"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                Ingresar al panel
              </button>
            </form>
          )}
        </div>

        {/* Nota para Profesores y Familias */}
        <div className="mt-4 rounded-xl border border-border bg-muted/50 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">
            ¿Eres Profesor o Apoderado?{" "}
            <span className="font-semibold text-foreground">
              Usa el enlace de acceso que te enviamos por WhatsApp.
            </span>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          🔒 Panel privado — Solo equipo Vibra Music
        </p>
      </div>
    </div>
  );
}
