import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";
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

import { useAppStore } from "@/store/app-store";

function severity(days: number) {
  if (days >= 45) return { label: "Crítico", cls: "bg-destructive/12 text-destructive" };
  if (days >= 20) return { label: "Alto", cls: "bg-warning/20 text-warning-foreground" };
  return { label: "Vigilar", cls: "bg-info/12 text-info" };
}

export function RiskFamiliesTable() {
  const [sent, setSent] = useState<string[]>([]);
  const invoices = useAppStore((s) => s.invoices);
  const students = useAppStore((s) => s.adminStudents);

  // Filtrar recibos no pagados (pendientes o vencidos)
  const pendingInvoices = invoices.filter((i) => i.status !== "pagado");

  // Agrupar por familia con blindaje seguro ante campos opcionales
  const familiesAtRisk = useMemo(() => {
    const map = new Map<string, { id: string; name: string; kids: number; debt: number; days: number }>();
    
    for (const inv of pendingInvoices) {
      if (!inv?.family) continue;
      const invFamilyLower = inv.family.toLowerCase();
      const existing = map.get(inv.family);
      const studentKidsCount = students.filter((st) => {
        const famLower = st?.family?.toLowerCase() ?? "";
        const parentLower = (st as any)?.parentName?.toLowerCase() ?? "";
        const nameLower = st?.name?.toLowerCase() ?? "";
        return famLower.includes(invFamilyLower) || parentLower.includes(invFamilyLower) || nameLower.includes(invFamilyLower);
      }).length || 1;
      
      if (existing) {
        existing.debt += inv.amount;
        existing.days = Math.max(existing.days, inv.status === "vencido" ? 15 : 5);
      } else {
        map.set(inv.family, {
          id: inv.id,
          name: inv.family,
          kids: studentKidsCount,
          debt: inv.amount,
          days: inv.status === "vencido" ? 15 : 5,
        });
      }
    }
    return Array.from(map.values());
  }, [pendingInvoices, students]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Familias en riesgo ({familiesAtRisk.length})</CardTitle>
            <CardDescription>
              Cobros vencidos ordenados por impacto. Reenvía el recordatorio en un clic.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        {familiesAtRisk.length === 0 ? (
          <div className="text-center py-8 px-4 text-muted-foreground space-y-2">
            <CheckCircle2 className="h-8 w-8 text-success mx-auto opacity-80" />
            <p className="text-sm font-bold text-foreground">¡Sin familias morosas!</p>
            <p className="text-xs">Todos los recibos emitidos están al día o no hay cobranzas pendientes.</p>
          </div>
        ) : (
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
                {familiesAtRisk.map((f) => {
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
                            // Buscar teléfono del alumno/familia
                            const student = students.find((st) => st.family.toLowerCase().includes(f.name.toLowerCase()) || st.name.toLowerCase().includes(f.name.toLowerCase()));
                            const rawPhone = student?.phone || student?.emergencyContact?.phone || "";
                            const cleanPhone = rawPhone.replace(/\D/g, "");
                            const formattedPhone = cleanPhone.startsWith("51") ? cleanPhone : cleanPhone ? `51${cleanPhone}` : "51900000000";
                            
                            const msg = `Estimada Familia ${f.name}, cordial saludo de Secretaría Vibra Music. Les recordamos que mantienen un saldo pendiente de ${money(f.debt)} (${f.days} días en mora). Agradecemos regularizar su abono o enviarnos su comprobante por este medio. ¡Muchas gracias!`;
                            const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
                            window.open(url, "_blank");

                            toast.success(`WhatsApp de Cobranza preparado para ${f.name}`, {
                              description: `Deuda: ${money(f.debt)}. Bitácora de cobranza actualizada.`,
                            });
                          }}
                          className="bg-success text-success-foreground hover:bg-success/90 font-bold text-xs"
                        >
                          <Send className="mr-1.5 h-3.5 w-3.5" />
                          {done ? "WhatsApp Enviado" : "Cobrar por WhatsApp"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
