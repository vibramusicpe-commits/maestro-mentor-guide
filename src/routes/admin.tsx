import { createFileRoute, Outlet, Link, useRouterState, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { useInsforgeSync } from "@/hooks/use-insforge-sync";

import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Menu,
  Music4,
  Users2,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { RoleSwitcher } from "@/components/role-switcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    const { activeRole, isAuthenticated } = useAppStore.getState();

    if (!isAuthenticated) {
      throw redirect({ to: "/", replace: true });
    }

    if (!activeRole || activeRole === ("admin" as unknown)) {
      throw redirect({ to: "/", replace: true });
    }

    if (activeRole === "teacher") {
      throw redirect({ to: "/teacher", replace: true });
    }

    if (activeRole === "family") {
      throw redirect({ to: "/family", replace: true });
    }
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
  useInsforgeSync();
  const [open, setOpen] = useState(false); // Mobile drawer
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("cadencia-sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeRole = useAppStore((s) => s.activeRole);
  const adminStudents = useAppStore((s) => s.adminStudents);
  const invoices = useAppStore((s) => s.invoices);
  const resetToOfficialStudents = useAppStore((s) => s.resetToOfficialStudents);

  useEffect(() => {
    const hasLegacyGrouped = adminStudents.some(
      (s) =>
        s.name.includes(" y Boris") ||
        s.name.includes("Gabriel y Eitan") ||
        s.name.includes("Bruno Marcelo Juan de Dios y") ||
        s.family.includes("Bruno Marcelo Juan de Dios y")
    );
    if (hasLegacyGrouped) {
      resetToOfficialStudents();
    }
  }, [adminStudents, resetToOfficialStudents]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return adminStudents
      .filter(
        (st) =>
          st.name.toLowerCase().includes(q) ||
          st.family.toLowerCase().includes(q) ||
          st.instrument.toLowerCase().includes(q) ||
          st.teacher.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [adminStudents, searchQuery]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("cadencia-sidebar-collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const visibleNav = nav.filter((item) => !(item.requiresSuperAdmin && activeRole === "staff"));

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar Compacto / Expandible */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out lg:static lg:flex lg:translate-x-0 border-r border-sidebar-border shadow-xs ${
          isCollapsed ? "lg:w-[72px]" : "lg:w-64"
        } ${open ? "flex w-64 translate-x-0" : "hidden -translate-x-full lg:flex"}`}
      >
        <div className={`flex h-16 items-center ${isCollapsed ? "justify-center px-2" : "justify-between px-4"} transition-all`}>
          <Link
            to="/admin"
            className="flex items-center gap-2.5 font-display font-semibold min-w-0 group hover:opacity-90 transition-opacity"
            title="Ir al Dashboard Principal"
          >
            <img
              src="/logo.webp"
              alt="Vibra Music Logo"
              className="h-10 w-10 shrink-0 object-contain rounded-full shadow-xs ring-2 ring-amber-400/40 transition-transform group-hover:scale-105"
            />
            {!isCollapsed && (
              <span className="font-sans text-lg font-black tracking-wider text-amber-500 dark:text-amber-400 drop-shadow-xs truncate">
                VM STAFF
              </span>
            )}
          </Link>

          {/* Botón toggle en Desktop */}
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-foreground transition-colors shrink-0"
              title="Minimizar panel lateral (Modo Compacto)"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Botón cerrar en Mobile */}
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Botón para expandir cuando está colapsado */}
        {isCollapsed && (
          <div className="hidden lg:flex justify-center pb-2 pt-1">
            <button
              onClick={toggleCollapse}
              className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-sidebar-accent text-primary hover:text-primary transition-all"
              title="Expandir panel lateral"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <nav className="flex-1 space-y-1.5 px-2.5 py-3">
          {visibleNav.map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname.startsWith(item.to);
            const classes = `flex w-full items-center ${
              isCollapsed ? "justify-center px-2" : "gap-3 px-3.5"
            } py-2.5 rounded-xl text-left text-xs font-bold transition-all ${
              active
                ? "bg-primary text-primary-foreground shadow-xs scale-[1.02]"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`;
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className={classes}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!isCollapsed ? (
          <div className="border-t border-sidebar-border p-3.5 text-[11px] text-sidebar-foreground/60">
            Sede Miraflores · {activeRole === "staff" ? "Secretaría (Nayeli)" : "Super Admin"}
          </div>
        ) : (
          <div className="border-t border-sidebar-border py-3 flex justify-center text-[10px] font-bold text-primary">
            VM
          </div>
        )}
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Toggle rápido en Desktop para colapsar/expandir */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors"
            title={isCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4 text-primary" /> : <PanelLeftClose className="h-4 w-4" />}
            <span className="text-[11px]">{isCollapsed ? "Expandir menú" : "Minimizar menú"}</span>
          </button>

          {/* Buscador Rápido Global con Ctrl+K */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-2 bg-muted/60 hover:bg-muted border border-border px-3 py-1.5 rounded-xl text-xs text-muted-foreground transition-all ml-2 w-64 justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" /> Buscar alumno o recibo...
            </span>
            <kbd className="text-[10px] font-mono bg-background border border-border px-1.5 py-0.5 rounded shadow-2xs">
              Ctrl+K
            </kbd>
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-foreground">
              Torre de control {activeRole === "staff" && <span className="font-normal text-muted-foreground">(Secretaría Nayeli)</span>}
            </p>
          </div>

          <button
            onClick={() => useAppStore.getState().logout()}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
          >
            Cerrar Sesión
          </button>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
              {activeRole === "staff" ? "NAY" : "DIR"}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Main Content Area con Amplitud Total */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 w-full max-w-full">
          <Outlet />
        </main>
      </div>

      {/* DIÁLOGO BUSCADOR GLOBAL (CTRL+K) */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <div className="p-3 border-b border-border flex items-center gap-2 bg-muted/20">
            <Search className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
            <input
              autoFocus
              type="text"
              placeholder="Escribe el nombre del alumno, familia o instrumento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
            />
            <kbd className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border">
            {searchQuery.trim() === "" ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Escribe al menos 2 letras para buscar entre los 99 alumnos, cobros y clases.
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No se encontraron resultados para <span className="font-bold">"{searchQuery}"</span>.
              </div>
            ) : (
              searchResults.map((st) => (
                <div
                  key={st.id}
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate({ to: "/admin/alumnos" });
                  }}
                  className="p-2.5 hover:bg-muted/50 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <p className="text-xs font-black text-foreground">{st.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {st.instrument} · Prof. {st.teacher} · {st.family}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        st.payment === "al-dia"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      {st.payment === "al-dia" ? "Al Día" : "Vencido"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
