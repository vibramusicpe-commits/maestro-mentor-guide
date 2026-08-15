import { createFileRoute, Outlet, Link, useRouterState, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app-store";

import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Menu,
  Music4,
  Users2,
  X,
  Clock,
} from "lucide-react";
import { RoleSwitcher } from "@/components/role-switcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/admin")({
  // ────────────────────────────────────────────────────────────
  // ROUTE GUARD — Protección de acceso al área de administración
  // Roles permitidos: super_admin, staff
  // Cualquier otro rol es redirigido a su portal correcto.
  // ────────────────────────────────────────────────────────────
  beforeLoad: () => {
    const { activeRole, isAuthenticated } = useAppStore.getState();

    // 🔒 GUARD DE AUTENTICACIÓN: Sin iniciar sesión → Redirige al Login (Landing)
    if (!isAuthenticated) {
      throw redirect({ to: "/", replace: true });
    }

    // Sin sesión válida (rol nulo o 'admin' legacy) → redirige al Landing
    if (!activeRole || activeRole === ("admin" as unknown)) {
      throw redirect({ to: "/", replace: true });
    }

    // Profesor → su kiosco
    if (activeRole === "teacher") {
      throw redirect({ to: "/teacher", replace: true });
    }

    // Familia → su portal
    if (activeRole === "family") {
      throw redirect({ to: "/family", replace: true });
    }

    // super_admin y staff → pasan. El renderizado condicional
    // (ocultar finanzas a staff) se mantiene dentro del componente.
  },
  component: AdminLayout,
});

const nav = [
  { label: "Dashboard", to: "/admin" as const, icon: BarChart3, exact: true },
  { label: "Horario de Clases", to: "/admin/agenda" as const, icon: CalendarDays },
  { label: "Alumnos", to: "/admin/alumnos" as const, icon: Users2 },
  { label: "Cobros y Abonos", to: "/admin/facturacion" as const, icon: CreditCard },
  { label: "Invitaciones", to: "/admin/invitaciones" as const, icon: Users2 },
  { label: "Control Horario", to: "/admin/control-horario" as const, icon: Clock },
];

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeRole = useAppStore((s) => s.activeRole);
  const setActiveRole = useAppStore((s) => s.setActiveRole);

  // Preservar el rol auténtico de la sesión (super_admin o staff)
  const isStaff = activeRole === "staff";

  const visibleNav = nav.filter((item) => !(item.requiresSuperAdmin && activeRole === "staff"));

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:flex lg:translate-x-0 ${
          open ? "flex translate-x-0" : "hidden -translate-x-full lg:flex"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2 font-display font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Music4 className="h-5 w-5" />
            </div>
            <span className="font-sans text-xl font-bold tracking-tight text-foreground">
              VM STAFF
            </span>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {visibleNav.map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname.startsWith(item.to);
            const classes = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`;
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className={classes}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4 text-xs text-sidebar-foreground/60">
          Sede Miraflores · Plan Pro {activeRole === "staff" ? "(Modo Staff)" : "(Super Admin)"}
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              Torre de control {activeRole === "staff" && <span className="text-xs font-normal text-muted-foreground">(Personal de Secretaria)</span>}
            </p>
          </div>
          <button
            onClick={() => useAppStore.getState().logout()}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
          >
            Cerrar Sesión
          </button>
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {activeRole === "staff" ? "ST" : "RM"}
            </AvatarFallback>
          </Avatar>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
