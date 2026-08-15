import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { Music4, Ticket } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { RoleSwitcher } from "@/components/role-switcher";

export const Route = createFileRoute("/family")({
  // ──────────────────────────────────────────────
  // ROUTE GUARD — Portal de Familia
  // Roles permitidos: family
  // ──────────────────────────────────────────────
  beforeLoad: () => {
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

  useEffect(() => {
    setActiveRole("family");
  }, [setActiveRole]);

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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-info/15 px-2.5 py-1 text-[11px] font-semibold text-info">
            <Ticket className="h-3.5 w-3.5" />
            {credits} créditos de recuperación
          </span>
        </header>

        <main className="flex-1 px-5 pb-10 pt-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
