import { Link, useRouterState } from "@tanstack/react-router";
import { Building2, Guitar, ShieldCheck, UserCheck, Users } from "lucide-react";
import { useAppStore, type Role } from "@/store/app-store";

const roles: { to: "/admin" | "/teacher" | "/family"; label: string; role: Role; email: string; name: string; icon: typeof Building2 }[] = [
  { to: "/admin", label: "Dueña (Super Admin)", role: "super_admin", email: "duena@vibramusic.pe", name: "Rocío (Dueña)", icon: ShieldCheck },
  { to: "/admin", label: "Sergio (Super Admin)", role: "super_admin", email: "sergio@vibramusic.pe", name: "Sergio (Dirección)", icon: ShieldCheck },
  { to: "/admin", label: "Nayeli (Secretaría)", role: "staff", email: "nayeli@vibramusic.pe", name: "Nayeli (Secretaría)", icon: UserCheck },
  { to: "/teacher", label: "Profesor", role: "teacher", email: "jeremy@vibramusic.pe", name: "Prof. Jeremy", icon: Guitar },
  { to: "/family", label: "Familia", role: "family", email: "familia@vibramusic.pe", name: "Familia García", icon: Users },
];

export function RoleSwitcher({ className = "" }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { activeRole, currentUser, login, logout } = useAppStore();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 ${className}`}
    >
      {roles.map((r) => {
        const isCurrentPath = pathname.startsWith(r.to);
        const isSuperAdmin = r.role === "super_admin" && (activeRole === "super_admin" || (activeRole as any) === "admin");
        const active =
          r.to === "/admin"
            ? isCurrentPath && (currentUser?.email ? currentUser.email === r.email : isSuperAdmin)
            : isCurrentPath && activeRole === r.role;

        return (
          <Link
            key={r.email}
            to={r.to}
            onClick={() => login(r.email, r.role, r.name)}
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
