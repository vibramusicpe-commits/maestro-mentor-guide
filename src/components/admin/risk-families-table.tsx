import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { money } from "@/lib/format";

type Family = { id: string; name: string; kids: number; debt: number; days: number };

const families: Family[] = [
  { id: "f1", name: "Familia Rivas", kids: 2, debt: 223, days: 18 },
  { id: "f2", name: "Familia Prado", kids: 1, debt: 96, days: 34 },
  { id: "f3", name: "Familia Solano", kids: 3, debt: 310, days: 9 },
  { id: "f4", name: "Familia Quintana", kids: 1, debt: 78, days: 52 },
];

function severity(days: number) {
  if (days >= 45) return { label: "Crítico", cls: "bg-destructive/12 text-destructive" };
  if (days >= 20) return { label: "Alto", cls: "bg-warning/20 text-warning-foreground" };
  return { label: "Vigilar", cls: "bg-info/12 text-info" };
}

export function RiskFamiliesTable() {
  const [sent, setSent] = useState<string[]>([]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Familias en riesgo</CardTitle>
        <CardDescription>
          Cobros vencidos ordenados por impacto. Reenvía el recordatorio en un clic.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Familia</TableHead>
                <TableHead className="text-right">Deuda</TableHead>
                <TableHead>Días en mora</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {families.map((f) => {
                const s = severity(f.days);
                const done = sent.includes(f.id);
                return (
                  <TableRow key={f.id}>
                    <TableCell>
                      <p className="font-medium">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.kids} alumno(s)</p>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {money(f.debt)}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <span className="tabular-nums">{f.days}</span>
                        <Badge className={`${s.cls} border-0`} variant="secondary">
                          {s.label}
                        </Badge>
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={done ? "secondary" : "default"}
                        disabled={done}
                        onClick={() => {
                          setSent((p) => [...p, f.id]);
                          toast.success(`Cobro reenviado a ${f.name}`, {
                            description: "Recordatorio por email y WhatsApp.",
                          });
                        }}
                      >
                        <Send className="mr-1.5 h-3.5 w-3.5" />
                        {done ? "Enviado" : "Reenviar cobro"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
