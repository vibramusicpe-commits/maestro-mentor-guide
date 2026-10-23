import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Cloud,
  CloudOff,
  ClipboardList,
  Users2,
  Clock,
  CalendarDays,
  LogOut,
  PenLine,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useInsforgeSync } from "@/hooks/use-insforge-sync";
import { RoleSwitcher } from "@/components/role-switcher";

export const Route = createFileRoute("/teacher")({
  // ─────────────────────────────────────────────────
  // ROUTE GUARD — Kiosco del Profesor
  // Roles permitidos: teacher
  // Admins pueden entrar para soporte, redirigidos igual a su ruta.
  // ─────────────────────────────────────────────────
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

    // Familia → su portal
    if (activeRole === "family") {
      throw redirect({ to: "/family", replace: true });
    }

    // super_admin, staff y teacher pueden ver el portal docente sin ser expulsados
  },
  component: TeacherLayout,
});

const nav = [
  { to: "/teacher" as const, label: "Kiosco", icon: ClipboardList, exact: true },
  { to: "/teacher/agenda" as const, label: "Agenda", icon: CalendarDays, exact: false },
  { to: "/teacher/alumnos" as const, label: "Alumnos", icon: Users2, exact: false },
  { to: "/teacher/notas" as const, label: "Notas", icon: PenLine, exact: false },
  { to: "/teacher/nomina" as const, label: "Asistencia", icon: Clock, exact: false },
];

function TeacherLayout() {
  const syncing = useAppStore((s) => s.syncQueue.length > 0);
  const activeRole = useAppStore((s) => s.activeRole);
  const setActiveRole = useAppStore((s) => s.setActiveRole);
  const currentUser = useAppStore((s) => s.currentUser);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const logout = useAppStore((s) => s.logout);

  // Redirección reactiva infalible al cerrar sesión (ADR-0127)
  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, [isAuthenticated]);

  // Sincronizar alumnos en vivo desde PostgreSQL para que el portal docente refleje datos limpios
  useInsforgeSync();

  useEffect(() => {
    if (activeRole !== "super_admin" && activeRole !== "staff") {
      setActiveRole("teacher");
    }
  }, [activeRole, setActiveRole]);

  return (
    <div className="min-h-screen bg-secondary/60 py-0 sm:py-8">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background shadow-xl sm:min-h-[80vh] sm:rounded-3xl sm:border sm:border-border">
        <header className="sticky top-0 z-20 flex items-center gap-2 rounded-t-3xl border-b border-border bg-background/90 px-4 py-2.5 backdrop-blur">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{currentUser?.name ?? "Profesor/a Vibra"}</p>
            <p className="truncate text-xs text-muted-foreground">Sede SJL (Las Flores) · Hoy</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              syncing ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
            }`}
          >
            {syncing ? (
              <CloudOff className="h-3.5 w-3.5 animate-pulse" />
            ) : (
              <Cloud className="h-3.5 w-3.5" />
            )}
            {syncing ? "Sincronizando…" : "Al día"}
          </span>
          <button
            onClick={() => {
              logout();
              try { sessionStorage.clear(); } catch {}
              if (typeof window !== "undefined") window.location.href = "/";
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        <main className="flex-1 px-4 pb-28 pt-4">
          <Outlet />
        </main>

        <nav className="sticky bottom-0 z-20 grid grid-cols-5 gap-0.5 rounded-b-3xl border-t border-border bg-background/95 px-1 py-1.5 backdrop-blur">
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              activeProps={{ className: "text-primary bg-primary/10" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 text-xs font-semibold transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
