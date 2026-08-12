import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck,
  History,
  PlusCircle,
  QrCode,
  Send,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  useAppStore,
  type InvoiceStatus,
  type PaymentMethod,
} from "@/store/app-store";
import { billingTrend, recurringConcepts, type Invoice } from "@/store/admin-seeds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { money } from "@/lib/format";

export const Route = createFileRoute("/admin/facturacion")({
  head: () => ({
    meta: [
      { title: "Cobros, Abonos e Historial WhatsApp — Cadencia" },
      {
        name: "description",
        content:
          "Registro de abonos recibidos por WhatsApp (Yape, Efectivo, Transferencia) con bitácora inmutable de auditoría.",
      },
      { property: "og:title", content: "Cobros, Abonos e Historial WhatsApp — Cadencia" },
      {
        property: "og:description",
        content: "Gestión de recibos por familia, abonos parciales y bitácora anti-fraude.",
      },
    ],
  }),
  component: AdminFacturacionPage,
});

function invoiceStatusBadge(inv: Invoice) {
  if (inv.status === "pagado") {
    return (
      <Badge className="bg-success/15 text-success border-0 flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Pagado (S/ {inv.amount})
      </Badge>
    );
  }
  if (inv.status === "parcial") {
    return (
      <Badge className="bg-primary/15 text-primary border-0 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Abonado S/ {inv.amountPaid} (Resta S/ {inv.remainingBalance})
      </Badge>
    );
  }
  if (inv.daysToDue === 2 || inv.daysToDue === 0 || inv.daysToDue === 1) {
    return (
      <Badge className="bg-warning/25 text-warning-foreground border-0 flex items-center gap-1 font-bold animate-pulse">
        <BellRing className="h-3 w-3 text-warning" />
        Vence en {inv.daysToDue}d
      </Badge>
    );
  }
  if (inv.status === "pendiente") {
    return (
      <Badge className="bg-warning/15 text-warning-foreground border-0 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Pendiente (S/ {inv.remainingBalance ?? inv.amount})
      </Badge>
    );
  }
  return (
    <Badge className="bg-destructive/15 text-destructive border-0 flex items-center gap-1">
      <AlertTriangle className="h-3 w-3" />
      Vencido
    </Badge>
  );
}

function AdminFacturacionPage() {
  const activeRole = useAppStore((s) => s.activeRole);
  const invoices = useAppStore((s) => s.invoices);
  const recordPaymentAbono = useAppStore((s) => s.recordPaymentAbono);
  const remindInvoice = useAppStore((s) => s.remindInvoice);
  const generateMonthlyInvoices = useAppStore((s) => s.generateMonthlyInvoices);

  const [generating, setGenerating] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [viewLogsInvoiceId, setViewLogsInvoiceId] = useState<string | null>(null);

  // Form states para abono
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Yape");
  const [abonoAmount, setAbonoAmount] = useState<string>("");
  const [voucherRef, setVoucherRef] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const isStaff = activeRole === "staff";

  const selectedInv = useMemo(
    () => invoices.find((i) => i.id === selectedInvoiceId),
    [invoices, selectedInvoiceId],
  );

  const viewLogsInv = useMemo(
    () => invoices.find((i) => i.id === viewLogsInvoiceId),
    [invoices, viewLogsInvoiceId],
  );

  const dueSoonInvoices = useMemo(
    () => invoices.filter((i) => i.status !== "pagado" && i.daysToDue <= 2 && i.daysToDue >= 0),
    [invoices],
  );

  const totals = useMemo(() => {
    const totalFacturado = invoices.reduce((acc, inv) => acc + inv.amount, 0);
    const totalCobrado = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
    const totalMorosidad = invoices
      .filter((inv) => inv.status === "vencido")
      .reduce((acc, inv) => acc + (inv.remainingBalance ?? inv.amount), 0);
    const totalPendiente = invoices
      .filter((inv) => inv.status === "pendiente" || inv.status === "parcial")
      .reduce((acc, inv) => acc + (inv.remainingBalance ?? inv.amount), 0);

    return { totalFacturado, totalCobrado, totalMorosidad, totalPendiente };
  }, [invoices]);

  const handleGenerateInvoices = () => {
    setGenerating(true);
    setTimeout(() => {
      generateMonthlyInvoices();
      setGenerating(false);
      toast.success("Recibos del mes generados", {
        description: `Se han procesado los conceptos de las familias.`,
      });
    }, 600);
  };

  const handleOpenAbonoModal = (inv: Invoice) => {
    setSelectedInvoiceId(inv.id);
    setAbonoAmount(String(inv.remainingBalance ?? inv.amount));
    setVoucherRef("");
    setNote("");
  };

  const handleRegisterPayment = () => {
    if (!selectedInvoiceId || !selectedInv) return;
    const amountNum = parseFloat(abonoAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Ingresa un monto de abono válido.");
      return;
    }

    recordPaymentAbono(selectedInvoiceId, amountNum, paymentMethod, voucherRef, note);
    setSelectedInvoiceId(null);

    toast.success(`Abono registrado para ${selectedInv.family}`, {
      description: `S/ ${amountNum} recibido por ${paymentMethod}. Bitácora de auditoría actualizada.`,
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Registro de Cobros y Abonos (WhatsApp)</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isStaff
              ? "Vista de Secretaría: Registra abonos recibidos por WhatsApp con N° de Operación. Bitácora inmutable protegida."
              : "Vista de Dirección: Control mensual de cobros, auditoría de abonos y conciliación bancaria."}
          </p>
        </div>

        <Button onClick={handleGenerateInvoices} disabled={generating} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          {generating ? "Generando..." : "Generar Recibos del Mes"}
        </Button>
      </div>

      {/* Alerta Preventiva: Faltando 2 Días */}
      {dueSoonInvoices.length > 0 && (
        <Card className="border-warning/40 bg-warning/10 shadow-sm">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-warning/20 p-2 text-warning-foreground">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">
                  {dueSoonInvoices.length} recibos vencen en 2 días o menos
                </p>
                <p className="text-xs text-muted-foreground">
                  Envía el aviso preventivo por WhatsApp a las familias antes de la fecha límite.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="default"
              className="bg-warning text-warning-foreground hover:bg-warning/90 gap-1.5"
              onClick={() => {
                dueSoonInvoices.forEach((inv) => remindInvoice(inv.id));
                toast.success(`Notificaciones enviadas`, {
                  description: `Se enviaron avisos preventivos a ${dueSoonInvoices.length} familias por WhatsApp y Email.`,
                });
              }}
            >
              <Send className="h-3.5 w-3.5" />
              Notificar a Todos ({dueSoonInvoices.length})
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resumen de Ingresos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          icon={DollarSign}
          label="Total Servicios (Facturado)"
          value={money(totals.totalFacturado)}
          hint="Monto total contratado"
          tone="text-primary bg-primary/10"
        />
        <Tile
          icon={CheckCircle2}
          label="Abonado / Cobrado"
          value={money(totals.totalCobrado)}
          hint={`${Math.round((totals.totalCobrado / (totals.totalFacturado || 1)) * 100)}% en caja`}
          tone="text-success bg-success/10"
        />
        <Tile
          icon={Clock}
          label="Saldo Pendiente"
          value={money(totals.totalPendiente)}
          hint={`${dueSoonInvoices.length} recibos próximos`}
          tone="text-warning bg-warning/15"
        />
        <Tile
          icon={AlertCircle}
          label="Morosidad Vencida"
          value={money(totals.totalMorosidad)}
          hint="Requiere cobranza"
          tone="text-destructive bg-destructive/10"
          alert={totals.totalMorosidad > 0}
        />
      </div>

      {/* Solo Super Admin ve el desglose corporativo y de egresos */}
      {!isStaff ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Conciliación e Histórico Financiero (Dueña)</CardTitle>
              <CardDescription>Resumen de cobros por mes y verificación de caja</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {billingTrend.map((b) => {
                const rate = Math.round((b.collected / b.billed) * 100);
                return (
                  <div key={b.month} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{b.month}</span>
                      <span className="tabular-nums">
                        {money(b.collected)} de {money(b.billed)} ({rate}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tarifario de Servicios</CardTitle>
              <CardDescription>Precios inmutables de la academia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recurringConcepts.map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b pb-2 text-xs last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold">{c.label}</p>
                    <p className="text-muted-foreground">{c.detail}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold tabular-nums">{money(c.amount)}</p>
                    <p className="text-[10px] text-muted-foreground">{c.families} familias</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="rounded-xl border border-border p-4 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Perfil de Secretaría: Todos los abonos registrados alimentan la bitácora inalterable de auditoría.</span>
          </div>
          <Badge variant="outline">Modo Registro WhatsApp & Auditoría</Badge>
        </div>
      )}

      {/* Tabla de Recibos y Abonos por Familia */}
      <Card>
        <CardHeader>
          <CardTitle>Recibos, Abonos y Bitácora de Auditoría</CardTitle>
          <CardDescription>
            Registra abonos recibidos por el WhatsApp de la escuela con N° de Operación.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Familia</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead className="text-right">Precio Total</TableHead>
                  <TableHead className="text-right">Abonado</TableHead>
                  <TableHead className="text-right">Saldo Restante</TableHead>
                  <TableHead>Estado / Aviso</TableHead>
                  <TableHead>Último Medio</TableHead>
                  <TableHead className="text-right">Acciones de Cobro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-semibold">{inv.family}</TableCell>
                    <TableCell className="text-sm">{inv.concept}</TableCell>
                    <TableCell className="text-right font-bold tabular-nums">{money(inv.amount)}</TableCell>
                    <TableCell className="text-right font-semibold text-success tabular-nums">
                      {money(inv.amountPaid || 0)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-destructive tabular-nums">
                      {money(inv.remainingBalance ?? inv.amount)}
                    </TableCell>
                    <TableCell>{invoiceStatusBadge(inv)}</TableCell>
                    <TableCell className="text-xs">
                      {inv.paymentMethod ? (
                        <Badge variant="secondary" className="gap-1">
                          {inv.paymentMethod === "Yape" ? (
                            <QrCode className="h-3 w-3 text-purple-600" />
                          ) : (
                            <Wallet className="h-3 w-3" />
                          )}
                          {inv.paymentMethod}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground opacity-60">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status !== "pagado" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleOpenAbonoModal(inv)}
                          >
                            <FileCheck className="mr-1 h-3.5 w-3.5" />
                            Registrar Abono
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewLogsInvoiceId(inv.id)}
                          title="Ver Bitácora inmutable de auditoría"
                        >
                          <History className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:ml-1">Audit</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            remindInvoice(inv.id);
                            toast.info(`Aviso enviado a ${inv.family}`, {
                              description: "Mensaje preventivo enviado a WhatsApp.",
                            });
                          }}
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Registrar Abono por WhatsApp */}
      <Dialog open={!!selectedInvoiceId} onOpenChange={(o) => !o && setSelectedInvoiceId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Abono (Comprobante WhatsApp)</DialogTitle>
            <DialogDescription>
              Registra el abono recibido en el WhatsApp de la escuela para {selectedInv?.family}:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precio Servicio Original:</span>
                <span className="font-bold">{money(selectedInv?.amount ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto Abonado Anteriormente:</span>
                <span className="font-semibold text-success">{money(selectedInv?.amountPaid ?? 0)}</span>
              </div>
              <div className="flex justify-between border-t pt-1 font-bold">
                <span>Saldo Pendiente Actual:</span>
                <span className="text-destructive">{money(selectedInv?.remainingBalance ?? 0)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Monto Abonado Ahora (S/)</label>
              <Input
                type="number"
                value={abonoAmount}
                onChange={(e) => setAbonoAmount(e.target.value)}
                placeholder="Ej. 100.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Medio de Pago</label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yape">Yape / Plin (WhatsApp)</SelectItem>
                  <SelectItem value="Efectivo">Efectivo (Presencial en Academia)</SelectItem>
                  <SelectItem value="Transferencia">Transferencia Bancaria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">
                N° de Operación / Ref. WhatsApp (Opcional)
              </label>
              <Input
                value={voucherRef}
                onChange={(e) => setVoucherRef(e.target.value)}
                placeholder="Ej. YAPE-889123 o Captura #042"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Nota / Observación</label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej. Pagó parcial, promete saldo en 3 días"
              />
            </div>

            <Button className="w-full mt-2" onClick={handleRegisterPayment}>
              Guardar Abono en Bitácora de Auditoría
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Ver Bitácora inmutable de Auditoría */}
      <Dialog open={!!viewLogsInvoiceId} onOpenChange={(o) => !o && setViewLogsInvoiceId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Bitácora de Auditoría Inmutable
            </DialogTitle>
            <DialogDescription>
              Historial completo de abonos para {viewLogsInv?.family} ({viewLogsInv?.concept})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="rounded-lg bg-muted/60 p-3 text-xs flex justify-between">
              <div>
                <p className="text-muted-foreground">Precio Original: <strong className="text-foreground">{money(viewLogsInv?.amount ?? 0)}</strong></p>
                <p className="text-muted-foreground">Total Cobrado: <strong className="text-success">{money(viewLogsInv?.amountPaid ?? 0)}</strong></p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Saldo Restante:</p>
                <p className="text-sm font-bold text-destructive">{money(viewLogsInv?.remainingBalance ?? 0)}</p>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {viewLogsInv?.paymentLogs && viewLogsInv.paymentLogs.length > 0 ? (
                viewLogsInv.paymentLogs.map((log) => (
                  <div key={log.id} className="rounded-lg border border-border p-3 text-xs space-y-1 bg-card">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-success text-sm">+ {money(log.amount)} ({log.method})</span>
                      <span className="text-[10px] text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Registrado por: <strong>{log.registeredBy}</strong></span>
                      <span>Ref: <strong>{log.voucherRef || "N/A"}</strong></span>
                    </div>
                    {log.note && <p className="italic text-muted-foreground pt-1 border-t text-[11px]">"{log.note}"</p>}
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                  Aún no existen registros de abono para este recibo.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  alert,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  hint: string;
  tone: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span className={`rounded-lg p-1.5 ${tone}`}>
          <Icon className="h-4 w-4" />
        </span>
        {label}
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className={`text-xs mt-0.5 ${alert ? "text-destructive font-semibold" : "text-muted-foreground"}`}>{hint}</p>
    </div>
  );
}
