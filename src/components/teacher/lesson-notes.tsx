import { Lock, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/app-store";

export function LessonNotes() {
  const { privateNote, publicNote, setNote } = useAppStore((s) => ({
    privateNote: s.privateNote,
    publicNote: s.publicNote,
    setNote: s.setNote,
  }));

  return (
    <Tabs defaultValue="private" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="private" className="gap-1.5 text-xs">
          <Lock className="h-3.5 w-3.5" /> Nota privada
        </TabsTrigger>
        <TabsTrigger value="public" className="gap-1.5 text-xs">
          <Send className="h-3.5 w-3.5" /> Nota a la familia
        </TabsTrigger>
      </TabsList>
      <TabsContent value="private" className="mt-3">
        <Textarea
          value={privateNote}
          onChange={(e) => setNote("private", e.target.value)}
          placeholder="Solo tú y la dirección ven esta nota…"
          className="min-h-24"
        />
        <p className="mt-2 text-[11px] text-muted-foreground">
          Visible únicamente para el equipo docente.
        </p>
      </TabsContent>
      <TabsContent value="public" className="mt-3">
        <Textarea
          value={publicNote}
          onChange={(e) => setNote("public", e.target.value)}
          placeholder="Resumen de la clase para la familia…"
          className="min-h-24"
        />
        <p className="mt-2 text-[11px] text-muted-foreground">
          Se publica en el portal de la familia al cerrar la clase.
        </p>
      </TabsContent>
    </Tabs>
  );
}
