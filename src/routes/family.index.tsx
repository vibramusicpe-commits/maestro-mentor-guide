import { createFileRoute } from "@tanstack/react-router";
import { KidTabs } from "@/components/family/kid-tabs";
import { KidSummary } from "@/components/family/kid-summary";
import { AccountCard } from "@/components/family/account-card";
import { PracticeTracker } from "@/components/family/practice-tracker";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/family/")({
  head: () => ({
    meta: [
      { title: "Portal de Familia — VM STAFF" },
      {
        name: "description",
        content:
          "Estado de cuenta unificado, práctica en casa con cronómetro y créditos de recuperación de tus hijos.",
      },
      { property: "og:title", content: "Portal de Familia — VM STAFF" },
      {
        property: "og:description",
        content: "Una sola cuenta para todos tus hijos: pagos, práctica y clases.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FamilyPortal,
});

function FamilyPortal() {
  const kids = useAppStore((s) => s.kids);
  const activeKidId = useAppStore((s) => s.activeKidId);
  const currentUser = useAppStore((s) => s.currentUser);
  const kid = kids.find((k) => k.id === activeKidId) ?? kids[0];

  if (!kid) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3">
          <p className="text-base font-bold text-foreground">
            ¡Bienvenido/a {currentUser?.name || "a la Familia Vibra"}! 🎶
          </p>
          <p className="text-xs text-muted-foreground">
            Aún no tienes alumnos vinculados a tu cuenta familiar. Secretaría te asignará en breve la ficha de tu hijo/a.
          </p>
        </div>
        <AccountCard />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <KidTabs />
      <KidSummary kid={kid} />
      <AccountCard />
      <PracticeTracker kid={kid} />
    </div>
  );
}
