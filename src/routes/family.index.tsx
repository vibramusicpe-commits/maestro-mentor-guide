import { createFileRoute } from "@tanstack/react-router";
import { KidTabs } from "@/components/family/kid-tabs";
import { KidSummary } from "@/components/family/kid-summary";
import { AccountCard } from "@/components/family/account-card";
import { PracticeTracker } from "@/components/family/practice-tracker";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/family/")({
  head: () => ({
    meta: [
      { title: "Portal de familia — Cadencia" },
      {
        name: "description",
        content:
          "Estado de cuenta unificado, práctica en casa con cronómetro y créditos de recuperación de tus hijos.",
      },
      { property: "og:title", content: "Portal de familia — Cadencia" },
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
  const kid = kids.find((k) => k.id === activeKidId) ?? kids[0]!;

  return (
    <div className="space-y-5">
      <KidTabs />
      <KidSummary kid={kid} />
      <AccountCard />
      <PracticeTracker kid={kid} />
    </div>
  );
}
