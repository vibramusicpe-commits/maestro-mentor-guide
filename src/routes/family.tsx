import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Music4, Ticket, LogOut, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { RoleSwitcher } from "@/components/role-switcher";
import { LayaCopilotFlow } from "@/components/admin/laya-copilot-flow";
import { resolveFamilyScope, kidsFromScope } from "@/lib/laya/laya-family-scope";

export const Route = createFileRoute("/family")({
  // ──────────────────────────────────────────────
  // ROUTE GUARD — Portal de Familia
  // Roles permitidos: family
  // ──────────────────────────────────────────────
  beforeLoad: () => {
    if (typeof window === "undefined") {
      return;
    }
    const { activeRole, isAuthenticated } = useAppStore.getState();

    // 🔒 GUARD DE AUTENTICACIÓN: Sin iniciar sesión → Redirige al Login (Landing)
    if (!isAuthenticated) {
      throw redirect({ to: "/", replace: true });
    }

    // Sin sesión → Landing
    if (!activeRole || activeRole === ("admin" as unknown)) {
      throw redirect({ to: "/", replace: true });
    }

    // Admin/Staff → su panel
    if (activeRole === "super_admin" || activeRole === "staff") {
      throw redirect({ to: "/admin", replace: true });
    }

    // Profesor → su kiosco
    if (activeRole === "teacher") {
      throw redirect({ to: "/teacher", replace: true });
    }

    // activeRole === 'family' → pasa
  },
  component: FamilyLayout,
});

function FamilyLayout() {
  const credits = useAppStore((s) => s.kids.reduce((a, k) => a + k.makeupCredits, 0));
  const setActiveRole = useAppStore((s) => s.setActiveRole);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const logout = useAppStore((s) => s.logout);
  const currentUser = useAppStore((s) => s.currentUser);
  const adminStudents = useAppStore((s) => s.adminStudents);
  const kids = useAppStore((s) => s.kids);
  const setKids = useAppStore((s) => s.setKids);
  const [isLayaOpen, setIsLayaOpen] = useState(false);

  // Alcance del asistente: solo los hijos vinculados a la invitación (ADR-0172).
  // Sin alcance resuelto, Laya responde el mensaje de vinculación, sin datos.
  const familyScope = useMemo(
    () =>
      resolveFamilyScope({
        inviteFamilyId: currentUser?.familyId ?? null,
        userEmail: currentUser?.email ?? null,
        adminStudents,
      }),
    [currentUser?.familyId, currentUser?.email, adminStudents]
  );

  // Hijos reales desde el alcance (sustituye los seeds estáticos, ADR-0172)
  useEffect(() => {
    if (!familyScope.resolved) return;
    const next = kidsFromScope(familyScope);
    const same =
      next.length === kids.length && next.every((k, i) => kids[i]?.id === k.id);
    if (!same) setKids(next);
  }, [familyScope, kids, setKids]);

  // Redirección reactiva infalible al cerrar sesión (ADR-0127)
  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setActiveRole("family");
  }, [setActiveRole]);

  // Atajo Ctrl+Shift+L paridad con secretaría
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") || (e.altKey && e.key.toLowerCase() === "l")) {
        e.preventDefault();
        setIsLayaOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-secondary/60 py-0 sm:py-8">
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col bg-background shadow-xl sm:min-h-[80vh] sm:rounded-3xl sm:border sm:border-border">
        <header className="flex items-center gap-3 rounded-t-3xl border-b border-border bg-background/90 px-5 py-4 backdrop-blur">
          <Link to="/" className="flex items-center gap-2 font-display font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Music4 className="h-4 w-4" />
            </div>
            <span className="font-sans text-lg font-bold tracking-tight text-foreground">
              VM STAFF
            </span>
          </Link>
          <div className="flex-1" />
          <button
            onClick={() => {
              logout();
              try { sessionStorage.clear(); } catch {}
              if (typeof window !== "undefined") window.location.href = "/";
            }}
            className="p-1.5 rounded-full border border-border bg-card/60 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-info/15 px-2.5 py-1 text-[11px] font-semibold text-info">
            <Ticket className="h-3.5 w-3.5" />
            {credits} créditos de recuperación
          </span>
        </header>

        {/* Navegación por pestañas del portal familia (móvil, ADR-0172) */}
        <nav className="flex items-center gap-1 px-3 py-2 border-b border-border bg-background overflow-x-auto">
          {[
            { to: "/family", label: "Inicio", end: true },
            { to: "/family/agenda", label: "Horario" },
            { to: "/family/asistencias", label: "Asistencias" },
            { to: "/family/progreso", label: "Progreso" },
            { to: "/family/avisos", label: "Avisar" },
          ].map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              activeOptions={tab.end ? { exact: true } : undefined}
              activeProps={{
                className:
                  "flex-1 min-h-[44px] inline-flex items-center justify-center px-3 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-xs whitespace-nowrap",
              }}
              className="flex-1 min-h-[44px] inline-flex items-center justify-center px-3 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted whitespace-nowrap"
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 px-5 pb-10 pt-5">
          <Outlet />
        </main>

        {/* Botón flotante del Asistente Familiar (móvil, 56px táctil) */}
        <button
          onClick={() => setIsLayaOpen(true)}
          className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full bg-[#F47B20] hover:bg-[#FF9E3D] text-[#0D0B0A] flex items-center justify-center shadow-xl transition-all hover:scale-105 cursor-pointer"
          title="Abrir Asistente Familiar (Ctrl+Shift+L)"
        >
          <Sparkles className="h-6 w-6" />
        </button>

        {/* Asistente Familiar en modo alcance-por-familia (solo lectura, ADR-0172) */}
        <LayaCopilotFlow
          isOpen={isLayaOpen}
          onToggle={() => setIsLayaOpen((prev) => !prev)}
          onClose={() => setIsLayaOpen(false)}
          familyScope={familyScope}
        />
      </div>
    </div>
  );
}
