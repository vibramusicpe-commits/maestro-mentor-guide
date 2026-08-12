import { createFileRoute, Link } from "@tanstack/react-router";
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

const roles = [
  {
    to: "/admin" as const,
    icon: Building2,
    name: "Dirección",
    tag: "Torre de control",
    desc: "Ingresos, morosidad, ocupación de salas y alertas operativas en una sola pantalla.",
    accent: "text-info",
    ring: "hover:border-info/50",
  },
  {
    to: "/teacher" as const,
    icon: Guitar,
    name: "Profesor",
    tag: "Kiosco móvil",
    desc: "Asistencia en dos toques, notas privadas y públicas, y sincronización optimista.",
    accent: "text-primary",
    ring: "hover:border-primary/50",
  },
  {
    to: "/family" as const,
    icon: Users,
    name: "Familia",
    tag: "Portal del hogar",
    desc: "Un solo cobro para todos los hijos, créditos de recuperación y registro de práctica.",
    accent: "text-warning",
    ring: "hover:border-warning/50",
  },
];

function Landing() {
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
            Una academia de música. Tres formas de vivirla.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Dirección, profesorado y familias comparten los mismos datos pero necesitan
            interfaces opuestas. Entra en cualquiera de las tres experiencias y compruébalo.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {roles.map((role, i) => (
              <motion.div
                key={role.to}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Link
                  to={role.to}
                  className={`group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${role.ring}`}
                >
                  <role.icon className={`h-8 w-8 ${role.accent}`} />
                  <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {role.tag}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">{role.name}</h2>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground">{role.desc}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    Entrar
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
