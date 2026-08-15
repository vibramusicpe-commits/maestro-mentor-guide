import { Link, useRouterState } from "@tanstack/react-router";
import { Building2, Guitar, ShieldCheck, UserCheck, Users } from "lucide-react";
import { useAppStore, type Role } from "@/store/app-store";

const roles: { to: "/admin" | "/teacher" | "/family"; label: string; role: Role; icon: typeof Building2 }[] = [
  { to: "/admin", label: "Super Admin (Dueña)", role: "super_admin", icon: ShieldCheck },
  { to: "/admin", label: "Staff (Secretaria)", role: "staff", icon: UserCheck },
  { to: "/teacher", label: "Profesor", role: "teacher", icon: Guitar },
  { to: "/family", label: "Familia", role: "family", icon: Users },
];

export function RoleSwitcher({ className = "" }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { activeRole, login, logout } = useAppStore();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 ${className}`}
    >
      {roles.map((r) => {
        const isCurrentPath = pathname.startsWith(r.to);
        const active =
          r.to === "/admin"
            ? isCurrentPath && (activeRole === r.role || (r.role === "super_admin" && activeRole === "admin"))
            : isCurrentPath && activeRole === r.role;

        return (
          <Link
            key={r.role}
            to={r.to}
            onClick={() => login(`${r.role}@vibramusic.pe`, r.role)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <r.icon className="h-3.5 w-3.5" />
            {r.label}
          </Link>
        );
      })}
      <button
        onClick={() => logout()}
        className="ml-1 text-[11px] font-semibold text-destructive hover:bg-destructive/10 px-2 py-1 rounded-full transition-colors"
      >
        Salir
      </button>
    </div>
  );
}
