import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppStore, type Role } from "@/store/app-store";
import { motion } from "motion/react";
import { ArrowRight, Building2, Guitar, Users, Music4 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cadencia — Un sistema, tres experiencias" },
      {
        name: "description",
        content:
          "Elige tu experiencia: torre de control para dirección, kiosco móvil para profesores o portal familiar con pagos y práctica.",
      },
      { property: "og:title", content: "Cadencia — Un sistema, tres experiencias" },
      {
        property: "og:description",
        content:
          "Gestión de academias de música con vistas dedicadas para dirección, profesores y familias.",
      },
    ],
  }),
  component: Landing,
});

import { ShieldCheck, UserCheck } from "lucide-react";

const roles: {
  to: "/admin" | "/teacher" | "/family";
  role: Role;
  icon: typeof Building2;
  name: string;
  tag: string;
  desc: string;
  accent: string;
  ring: string;
}[] = [
  {
    to: "/admin",
    role: "super_admin",
    icon: ShieldCheck,
    name: "Super Admin (Dueña)",
    tag: "Acceso Total",
    desc: "Ingresos, morosidad, facturación, ocupación de salas y alertas operativas.",
    accent: "text-info",
    ring: "hover:border-info/50",
  },
  {
    to: "/admin",
    role: "staff",
    icon: UserCheck,
    name: "Staff (Secretaria)",
    tag: "Operaciones y Agenda",
    desc: "Gestión de alumnos, agenda de clases y asistencia sin métricas ni módulos de facturación.",
    accent: "text-accent-foreground",
    ring: "hover:border-accent-foreground/50",
  },
  {
    to: "/teacher",
    role: "teacher",
    icon: Guitar,
    name: "Profesor",
    tag: "Kiosco móvil",
    desc: "Asistencia en dos toques, notas privadas y públicas, y sincronización optimista.",
    accent: "text-primary",
    ring: "hover:border-primary/50",
  },
  {
    to: "/family",
    role: "family",
    icon: Users,
    name: "Familia",
    tag: "Portal del hogar",
    desc: "Un solo cobro para todos los hijos, créditos de recuperación y registro de práctica.",
    accent: "text-warning",
    ring: "hover:border-warning/50",
  },
];

function Landing() {
  const setActiveRole = useAppStore((s) => s.setActiveRole);

  return (
    <main className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-primary">
            <Music4 className="h-5 w-5" />
            CADENCIA
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
            Una academia de música. Vistas adaptadas por rol.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Dirección, secretaria, profesorado y familias comparten los mismos datos pero necesitan
            interfaces adaptadas a su rol y privacidad.
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((role, i) => (
              <motion.div
                key={role.role}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Link
                  to={role.to}
                  onClick={() => setActiveRole(role.role)}
                  className={`group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${role.ring}`}
                >
                  <role.icon className={`h-7 w-7 ${role.accent}`} />
                  <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {role.tag}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">{role.name}</h2>
                  <p className="mt-2 flex-1 text-xs text-muted-foreground">{role.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    Entrar
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          <ResumeLink />
        </div>
      </div>
    </main>
  );
}

function ResumeLink() {
  const activeRole = useAppStore((s) => s.activeRole);
  const target =
    activeRole === "teacher" ? "/teacher" : activeRole === "family" ? "/family" : "/admin";

  const label =
    activeRole === "super_admin"
      ? "Super Admin (Dueña)"
      : activeRole === "staff"
        ? "Staff (Secretaria)"
        : activeRole === "teacher"
          ? "Profesor"
          : "Familia";

  return (
    <p className="mt-8 text-sm text-muted-foreground">
      La última vez estuviste en{" "}
      <Link to={target} className="font-semibold text-primary underline-offset-4 hover:underline">
        {label}
      </Link>
      .
    </p>
  );
}
