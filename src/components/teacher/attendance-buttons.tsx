import { motion } from "framer-motion";
import { Check, Clock4, X } from "lucide-react";
import type { AttendanceStatus } from "@/store/app-store";

const options: {
  status: Exclude<AttendanceStatus, "pendiente">;
  label: string;
  icon: typeof Check;
  active: string;
}[] = [
  { status: "presente", label: "Presente", icon: Check, active: "bg-success text-success-foreground border-success" },
  { status: "ausente", label: "Ausente", icon: X, active: "bg-destructive text-destructive-foreground border-destructive" },
  { status: "tarde", label: "Tarde", icon: Clock4, active: "bg-warning text-warning-foreground border-warning" },
];

export function AttendanceButtons({
  current,
  onSelect,
}: {
  current: AttendanceStatus;
  onSelect: (status: Exclude<AttendanceStatus, "pendiente">) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((o) => {
        const active = current === o.status;
        return (
          <motion.button
            key={o.status}
            whileTap={{ scale: 0.94 }}
            onClick={() => onSelect(o.status)}
            className={`flex min-h-[80px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 text-sm font-bold transition-colors ${
              active
                ? o.active
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <o.icon className="h-6 w-6" />
            {o.label}
          </motion.button>
        );
      })}
    </div>
  );
}
