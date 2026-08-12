import { useAppStore } from "@/store/app-store";

export function KidTabs() {
  const kids = useAppStore((s) => s.kids);
  const activeKidId = useAppStore((s) => s.activeKidId);
  const setActiveKid = useAppStore((s) => s.setActiveKid);

  return (
    <div className="grid grid-cols-2 gap-1 rounded-full border border-border bg-secondary p-1">
      {kids.map((k) => {
        const active = k.id === activeKidId;
        return (
          <button
            key={k.id}
            onClick={() => setActiveKid(k.id)}
            className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {k.name}
          </button>
        );
      })}
    </div>
  );
}
