import { Link, useRouterState } from "@tanstack/react-router";
import { Building2, Guitar, Users } from "lucide-react";

const roles = [
  { to: "/admin" as const, label: "Admin", icon: Building2 },
  { to: "/teacher" as const, label: "Profesor", icon: Guitar },
  { to: "/family" as const, label: "Familia", icon: Users },
];

export function RoleSwitcher({ className = "" }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 ${className}`}
    >
      {roles.map((r) => {
        const active = pathname.startsWith(r.to);
        return (
          <Link
            key={r.to}
            to={r.to}
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
    </div>
  );
}
