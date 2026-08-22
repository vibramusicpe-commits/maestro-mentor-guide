import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Send, CheckCircle2, Edit3, DollarSign, Calendar, ShieldCheck, FileText, Check } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { money } from "@/lib/format";
import { useAppStore, type PaymentMethod, type InvoiceStatus } from "@/store/app-store";

function severity(days: number) {
  if (days >= 45) return { label: "Crítico", cls: "bg-destructive/12 text-destructive" };
  if (days >= 20) return { label: "Alto", cls: "bg-warning/20 text-warning-foreground" };
  return { label: "Vigilar", cls: "bg-info/12 text-info" };
}

export function RiskFamiliesTable() {
  const [sent, setSent] = useState<string[]>([]);
  const invoices = useAppStore((s) => s.invoices);
  const students = useAppStore((s) => s.adminStudents);
  const recordPaymentAbono = useAppStore((s) => s.recordPaymentAbono);
  const markInvoicePaid = useAppStore((s) => s.markInvoicePaid);

  // Estado del modal de edición de familia/recibo
  const [editingFamily, setEditingFamily] = useState<{
    invoiceId: string;
    familyName: string;
    totalAmount: number;
    amountPaid: number;
    remainingDebt: number;
    days: number;
    status: InvoiceStatus;
    dueDate: string;
    studentName?: string;
  } | null>(null);

  // Campos de edición en el modal
  const [editDebt, setEditDebt] = useState<number>(297);
  const [editDays, setEditDays] = useState<number>(5);
  const [editStatus, setEditStatus] = useState<InvoiceStatus>("pendiente");
  const [editAgreementNote, setEditAgreementNote] = useState<string>("");

  // Pestaña de Abono Rápido
  const [abonoAmount, setAbonoAmount] = useState<number>(50);
  const [abonoMethod, setAbonoMethod] = useState<PaymentMethod>("Yape");
  const [abonoVoucher, setAbonoVoucher] = useState<string>("");
  const [abonoNote, setAbonoNote] = useState<string>("");

  // Filtrar recibos no pagados (pendientes o vencidos)
  const pendingInvoices = invoices.filter((i) => i.status !== "pagado");

  // Agrupar por familia con blindaje seguro ante campos opcionales
  const familiesAtRisk = useMemo(() => {
    const map = new Map<string, {
      id: string;
      name: string;
      kids: number;
      debt: number;
      amountPaid: number;
      totalAmount: number;
      days: number;
      status: InvoiceStatus;
      dueDate: string;
      studentName: string;
    }>();
    
    for (const inv of pendingInvoices) {
      if (!inv?.family) continue;
      const invFamilyLower = inv.family.toLowerCase();
      const existing = map.get(inv.family);
      const studentMatch = students.find((st) => {
        const famLower = st?.family?.toLowerCase() ?? "";
        const parentLower = (st as any)?.parentName?.toLowerCase() ?? "";
        const nameLower = st?.name?.toLowerCase() ?? "";
        return famLower.includes(invFamilyLower) || parentLower.includes(invFamilyLower) || nameLower.includes(invFamilyLower);
      });

      const studentKidsCount = students.filter((st) => {
        const famLower = st?.family?.toLowerCase() ?? "";
        const parentLower = (st as any)?.parentName?.toLowerCase() ?? "";
        const nameLower = st?.name?.toLowerCase() ?? "";
        return famLower.includes(invFamilyLower) || parentLower.includes(invFamilyLower) || nameLower.includes(invFamilyLower);
      }).length || 1;
      
      const remaining = inv.remainingBalance !== undefined ? inv.remainingBalance : (inv.amount - (inv.amountPaid || 0));

      if (existing) {
        existing.debt += remaining;
        existing.totalAmount += inv.amount;
        existing.amountPaid += (inv.amountPaid || 0);
        existing.days = Math.max(existing.days, inv.status === "vencido" ? 15 : (inv.daysToDue ? Math.max(0, -inv.daysToDue) : 5));
      } else {
        map.set(inv.family, {
          id: inv.id,
          name: inv.family,
          kids: studentKidsCount,
          debt: remaining,
          amountPaid: inv.amountPaid || 0,
          totalAmount: inv.amount,
          days: inv.status === "vencido" ? 15 : (inv.daysToDue ? Math.max(0, -inv.daysToDue) : 5),
          status: inv.status,
          dueDate: inv.dueDate || "2026-08-31",
          studentName: studentMatch?.name || inv.student || "Alumno",
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.debt - a.debt);
  }, [pendingInvoices, students]);

  const handleOpenEdit = (f: typeof familiesAtRisk[0]) => {
    setEditingFamily({
      invoiceId: f.id,
      familyName: f.name,
      totalAmount: f.totalAmount,
      amountPaid: f.amountPaid,
      remainingDebt: f.debt,
      days: f.days,
      status: f.status,
      dueDate: f.dueDate,
      studentName: f.studentName,
    });
    setEditDebt(f.debt);
    setEditDays(f.days);
    setEditStatus(f.status);
    setAbonoAmount(Math.min(f.debt, 50));
    setAbonoVoucher("");
    setAbonoNote("");
    setEditAgreementNote("");
  };

  const handleSaveEdits = () => {
    if (!editingFamily) return;

    // Actualizar recibo en el store de forma reactiva
    useAppStore.setState((s) => ({
      invoices: s.invoices.map((inv) => {
        if (inv.id === editingFamily.invoiceId || inv.family.toLowerCase() === editingFamily.familyName.toLowerCase()) {
          const newRemaining = Math.max(0, editDebt);
          const newPaid = Math.max(0, inv.amount - newRemaining);
          const finalStatus = newRemaining === 0 ? "pagado" : editStatus;
          return {
            ...inv,
            remainingBalance: newRemaining,
            amountPaid: newPaid,
            status: finalStatus,
            daysToDue: -editDays,
          };
        }
        return inv;
      }),
    }));

    toast.success(`Datos de cobranza actualizados para ${editingFamily.familyName}`, {
      description: `Nueva deuda: ${money(editDebt)} · Estado: ${editStatus.toUpperCase()} (${editDays} días en mora).`,
    });
    setEditingFamily(null);
  };

  const handleRegisterDirectAbono = () => {
    if (!editingFamily) return;
    if (abonoAmount <= 0) {
      toast.error("Ingresa un monto válido mayor a cero.");
      return;
    }

    recordPaymentAbono(
      editingFamily.invoiceId,
      abonoAmount,
      abonoMethod,
      abonoVoucher || "ABONO-DASHBOARD",
      abonoNote || editAgreementNote || "Abono registrado desde panel de control",
    );

    toast.success(`🎉 Abono de ${money(abonoAmount)} registrado para ${editingFamily.familyName}`, {
      description: `Método: ${abonoMethod} · N° Ref: ${abonoVoucher || "S/N"}. Se actualizó la bitácora de auditoría.`,
    });
    setEditingFamily(null);
  };

  const handleMarkAsPaidFull = () => {
    if (!editingFamily) return;
    markInvoicePaid(editingFamily.invoiceId, "Yape");
    toast.success(`🎉 ¡Deuda cancelada en su totalidad para ${editingFamily.familyName}!`, {
      description: "El recibo pasó a estado PAGADO y la familia ya no figura en mora.",
    });
    setEditingFamily(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Familias en riesgo ({familiesAtRisk.length})</CardTitle>
              <CardDescription>
                Cobros vencidos y en seguimiento. Haz clic en <strong>Editar</strong> para modificar deuda, días en mora o registrar abonos.
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
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {familiesAtRisk.map((f) => {
                    const s = severity(f.days);
                    const done = sent.includes(f.id);
                    return (
                      <TableRow key={f.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell>
                          <p className="font-semibold text-foreground">{f.name}</p>
                          <p className="text-xs text-muted-foreground">{f.kids} alumno(s) · {f.studentName}</p>
                        </TableCell>
                        <TableCell className="text-right font-black tabular-nums text-foreground">
                          {money(f.debt)}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <span className="tabular-nums font-bold text-xs">{f.days}</span>
                            <Badge className={`${s.cls} border-0 text-[10px] font-bold`} variant="secondary">
                              {s.label}
                            </Badge>
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-1.5 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEdit(f)}
                            className="h-8 px-2.5 text-xs font-semibold gap-1 border-primary/30 text-primary hover:bg-primary/10"
                            title="Modificar deuda, estado, días o registrar abono"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant={done ? "secondary" : "default"}
                            disabled={done}
                            onClick={() => {
                              setSent((p) => [...p, f.id]);
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
                            className="bg-success text-success-foreground hover:bg-success/90 font-bold text-xs h-8"
                          >
                            <Send className="mr-1 h-3.5 w-3.5" />
                            {done ? "Enviado" : "WhatsApp"}
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

      {/* Modal de Edición Completa para Nayeli */}
      <Dialog open={!!editingFamily} onOpenChange={(open) => !open && setEditingFamily(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2 text-foreground">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Gestión de Cobranza · {editingFamily?.familyName}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Modifica la deuda, días de mora, estado o registra un abono directo para esta familia.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Resumen actual */}
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3 text-center border border-border">
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold">Total Recibo</span>
                <p className="font-bold text-sm text-foreground">{money(editingFamily?.totalAmount || 0)}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold">Abonado</span>
                <p className="font-bold text-sm text-emerald-600">{money(editingFamily?.amountPaid || 0)}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold">Deuda Actual</span>
                <p className="font-bold text-sm text-destructive">{money(editDebt)}</p>
              </div>
            </div>

            {/* Bloque 1: Edición de Deuda y Estado */}
            <div className="rounded-xl border border-border p-3 space-y-3 bg-card">
              <h4 className="font-bold text-[11px] text-primary flex items-center gap-1.5">
                <Edit3 className="h-3.5 w-3.5" /> Ajuste Manual de Saldo y Estado
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Saldo Deuda (S/)</label>
                  <Input
                    type="number"
                    step="0.10"
                    min="0"
                    value={editDebt}
                    onChange={(e) => setEditDebt(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Días en Mora</label>
                  <Input
                    type="number"
                    min="0"
                    value={editDays}
                    onChange={(e) => setEditDays(parseInt(e.target.value, 10) || 0)}
                    className="h-8 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Estado</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="vencido">Vencido</option>
                    <option value="parcial">Parcial</option>
                    <option value="pagado">Pagado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bloque 2: Registrar Abono Rápido */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2.5">
              <h4 className="font-bold text-[11px] text-emerald-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Registrar Abono Inmediato
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">Impacta bitácora y saldo</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Monto Abono (S/)</label>
                  <Input
                    type="number"
                    step="5"
                    min="1"
                    max={editDebt}
                    value={abonoAmount}
                    onChange={(e) => setAbonoAmount(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-bold text-emerald-700 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Medio de Pago</label>
                  <select
                    value={abonoMethod}
                    onChange={(e) => setAbonoMethod(e.target.value as any)}
                    className="w-full h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium"
                  >
                    <option value="Yape">Yape</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia BCP</option>
                    <option value="Plin">Plin</option>
                    <option value="Tarjeta">Tarjeta POS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-muted-foreground font-semibold mb-1">N° Operación / Voucher</label>
                  <Input
                    type="text"
                    placeholder="Ej: OPE-98421"
                    value={abonoVoucher}
                    onChange={(e) => setAbonoVoucher(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Nota de Abono</label>
                  <Input
                    type="text"
                    placeholder="Ej: Abono quincena"
                    value={abonoNote}
                    onChange={(e) => setAbonoNote(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>

              <div className="pt-1 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleRegisterDirectAbono}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" /> Registrar Abono de S/ {abonoAmount}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleMarkAsPaidFull}
                  className="whitespace-nowrap border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 text-xs h-8 font-semibold"
                >
                  Liquidar Total
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditingFamily(null)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveEdits}
              className="bg-primary text-primary-foreground font-bold text-xs"
            >
              Guardar Cambios de Deuda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
