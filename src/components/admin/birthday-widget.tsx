import { toast } from "sonner";
import { Cake, Gift, Send } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function BirthdayWidget() {
  const students = useAppStore((s) => s.adminStudents);

  const augustBirthdays = students.filter((s) => s.birthdate.includes("Agosto"));

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Cake className="h-5 w-5 text-warning" />
            Cumpleaños de Agosto ({augustBirthdays.length})
          </CardTitle>
          <Gift className="h-4 w-4 text-warning/70" />
        </div>
        <CardDescription>
          Recordatorios automáticos para enviar felicitaciones de la academia Vibra Music.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {augustBirthdays.map((st) => (
          <div
            key={st.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-xs"
          >
            <div>
              <p className="font-bold text-sm">{st.name}</p>
              <p className="text-muted-foreground">
                {st.family} · Cumple el <span className="font-semibold text-warning">{st.birthdate}</span>
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-xs"
              onClick={() => {
                toast.success(`Felicitación enviada a ${st.name}`, {
                  description: "Mensaje festivo enviado por WhatsApp con cupón de regalo.",
                });
              }}
            >
              <Send className="h-3 w-3 text-primary" />
              Felicitar
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
