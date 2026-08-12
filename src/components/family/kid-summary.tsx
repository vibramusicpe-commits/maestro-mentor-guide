import { motion } from "framer-motion";
import { CalendarClock, GraduationCap, Ticket } from "lucide-react";
import type { Kid } from "@/store/app-store";

export function KidSummary({ kid }: { kid: Kid }) {
  return (
    <motion.section
      key={kid.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-sidebar p-5 text-sidebar-foreground"
    >
      <h1 className="text-2xl font-bold">{kid.name}</h1>
      <p className="text-sm text-sidebar-foreground/80">{kid.instrument}</p>

      <div className="mt-4 space-y-2 text-sm text-sidebar-foreground/80">
        <p className="inline-flex items-center gap-2">
          <GraduationCap className="h-4 w-4" /> {kid.teacher}
        </p>
        <p className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4" /> {kid.nextLesson}
        </p>
        <p className="flex items-center gap-2">
          <Ticket className="h-4 w-4" /> {kid.makeupCredits} créditos de recuperación
        </p>
      </div>
    </motion.section>
  );
}
