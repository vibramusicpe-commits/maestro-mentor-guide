import { motion } from "framer-motion";
import { CalendarClock, Clock, GraduationCap, Ticket } from "lucide-react";
import type { Kid } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";

export function KidSummary({ kid }: { kid: Kid }) {
  return (
    <motion.section
      key={kid.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-sidebar p-5 text-sidebar-foreground shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{kid.name}</h1>
          <p className="text-sm text-sidebar-foreground/80 font-medium">{kid.instrument}</p>
        </div>
        <Badge variant="secondary" className="gap-1 text-xs">
          <Clock className="h-3 w-3" />
          Plan Regular (8 clases / 45m)
        </Badge>
      </div>

      <div className="mt-4 space-y-2 text-sm text-sidebar-foreground/80">
        <p className="inline-flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-sidebar-primary" /> {kid.teacher}
        </p>
        <p className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-sidebar-primary" /> {kid.nextLesson}
        </p>
        <p className="flex items-center gap-2 font-medium">
          <Ticket className="h-4 w-4 text-warning" />
          <span className="text-sidebar-foreground">{kid.makeupCredits} créditos de recuperación disponibles</span>
        </p>
      </div>
    </motion.section>
  );
}
