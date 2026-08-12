import { motion } from "framer-motion";
import { Clock, DoorOpen, Music2 } from "lucide-react";
import type { Lesson } from "@/store/app-store";

export function CurrentLessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <motion.div
      key={lesson.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-2xl bg-sidebar p-5 text-sidebar-foreground shadow-lg"
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-sidebar-primary">
        Clase en curso
      </p>
      <h2 className="mt-2 text-2xl font-bold">{lesson.student}</h2>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-sidebar-foreground/80">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> {lesson.time}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Music2 className="h-4 w-4" /> {lesson.instrument}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <DoorOpen className="h-4 w-4" /> {lesson.room}
        </span>
      </div>
    </motion.div>
  );
}
