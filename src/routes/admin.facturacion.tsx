import { useMemo, useState, useRef } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck,
  FileSpreadsheet,
  History,
  Image as ImageIcon,
  Maximize2,
  PlusCircle,
  QrCode,
  Search,
  Send,
  ShieldCheck,
  Upload,
  Wallet,
  X,
  Smartphone,
  Eye,
  Download,
  Trash2,
} from "lucide-react";
import {
  useAppStore,
  type InvoiceStatus,
  type PaymentMethod,
} from "@/store/app-store";
import {
  billingTrend,
  recurringConcepts,
  VIBRA_PRICING,
  type Invoice,
  type PaymentLog,
} from "@/store/admin-seeds";
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
  beforeLoad: () => {
    const { activeRole } = useAppStore.getState();
    if (activeRole !== "super_admin" && activeRole !== "staff") {
      throw redirect({ to: "/admin", replace: true });
    }
  },
  head: () => ({
    meta: [
      { title: "Cobros, Abonos y Vouchers Yape — VM STAFF" },
      {
        name: "description",
        content:
          "Registro de abonos con captura fotográfica Yape/Plin, historial de evidencias y carga masiva de pagos.",
      },
      { property: "og:title", content: "Cobros, Abonos y Vouchers Yape — VM STAFF" },
      {
        property: "og:description",
        content: "Gestión de recibos por familia, abonos con vouchers fotográficos y bitácora anti-fraude.",
      },
    ],
  }),
  component: AdminFacturacionPage,
});

function invoiceStatusBadge(inv: Invoice) {
  if (inv.status === "pagado") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0 flex items-center gap-1 font-bold">
        <CheckCircle2 className="h-3 w-3" />
        Pagado ({money(inv.amount)})
      </Badge>
    );
  }
  if (inv.status === "parcial") {
    return (
      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0 flex items-center gap-1 font-bold">
        <Clock className="h-3 w-3" />
        Abonado {money(inv.amountPaid)} (Resta {money(inv.remainingBalance)})
      </Badge>
    );
  }
  if (inv.daysToDue === 2 || inv.daysToDue === 0 || inv.daysToDue === 1) {
    return (
      <Badge className="bg-destructive/15 text-destructive border-0 flex items-center gap-1 font-black animate-pulse">
        <BellRing className="h-3 w-3 text-destructive" />
        Vence en {inv.daysToDue}d ({money(inv.remainingBalance ?? inv.amount)})
      </Badge>
    );
  }
  if (inv.status === "pendiente") {
    return (
      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0 flex items-center gap-1 font-semibold">
        <Clock className="h-3 w-3" />
        Pendiente ({money(inv.remainingBalance ?? inv.amount)})
      </Badge>
    );
  }
  return (
    <Badge className="bg-destructive/15 text-destructive border-0 flex items-center gap-1 font-bold">
      <AlertTriangle className="h-3 w-3" />
      Vencido ({money(inv.remainingBalance ?? inv.amount)})
    </Badge>
  );
}

function AdminFacturacionPage() {
  const activeRole = useAppStore((s) => s.activeRole);
  const invoices = useAppStore((s) => s.invoices);
  const adminStudents = useAppStore((s) => s.adminStudents);
  const recordPaymentAbono = useAppStore((s) => s.recordPaymentAbono);
  const recordNewDirectAbono = useAppStore((s) => s.recordNewDirectAbono);
  const importBatchPayments = useAppStore((s) => s.importBatchPayments);
  const remindInvoice = useAppStore((s) => s.remindInvoice);
  const generateMonthlyInvoices = useAppStore((s) => s.generateMonthlyInvoices);

  const [activeTab, setActiveTab] = useState<"recibos" | "anual" | "vouchers" | "resumen">("recibos");
  const [selectedStudentHistory, setSelectedStudentHistory] = useState<any | null>(null);
  const [whatsappModalData, setWhatsappModalData] = useState<{
    isOpen: boolean;
    studentName: string;
    family: string;
    phone: string;
    amount: number;
    dueDate: string;
    type: "confirmacion" | "recordatorio";
    customText: string;
  }>({
    isOpen: false,
    studentName: "",
    family: "",
    phone: "",
    amount: 0,
    dueDate: "",
    type: "confirmacion",
    customText: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [generating, setGenerating] = useState(false);

  // Modales
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [viewLogsInvoiceId, setViewLogsInvoiceId] = useState<string | null>(null);
  const [isDirectAbonoOpen, setIsDirectAbonoOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [isConfirmGenerateOpen, setIsConfirmGenerateOpen] = useState(false);
  const [isMassNotifyModalOpen, setIsMassNotifyModalOpen] = useState(false);
  const [inspectedVoucher, setInspectedVoucher] = useState<{
    image: string;
    family: string;
    amount: number;
    method: string;
    voucherRef?: string;
    timestamp: string;
    registeredBy: string;
    note?: string;
  } | null>(null);

  // Form states para abono a recibo existente
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Yape");
  const [abonoAmount, setAbonoAmount] = useState<string>("");
  const [voucherRef, setVoucherRef] = useState<string>("");
  const [paymentTime, setPaymentTime] = useState<string>("");
  const [voucherImage, setVoucherImage] = useState<string>("");
  const [note, setNote] = useState<string>("");

  // Form states para abono directo
  const [directFamily, setDirectFamily] = useState<string>("");
  const [directConcept, setDirectConcept] = useState<string>("Mensualidad Regular");
  const [directAmount, setDirectAmount] = useState<string>("");
  const [directMethod, setDirectMethod] = useState<PaymentMethod>("Yape");
  const [directVoucherRef, setDirectVoucherRef] = useState<string>("");
  const [directPaymentTime, setDirectPaymentTime] = useState<string>("");
  const [directVoucherImage, setDirectVoucherImage] = useState<string>("");
  const [directNote, setDirectNote] = useState<string>("");

  // CSV Import States
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Todos los vouchers / abonos recopilados cronológicamente
  const allVoucherLogs = useMemo(() => {
    const logs: Array<{
      log: PaymentLog;
      invoiceId: string;
      family: string;
      concept: string;
    }> = [];

    invoices.forEach((inv) => {
      const pLogs = inv.paymentLogs || [];
      pLogs.forEach((l) => {
        logs.push({
          log: l,
          invoiceId: inv.id,
          family: inv.family,
          concept: inv.concept,
        });
      });
    });

    return logs.sort((a, b) => (b.log?.timestamp || "").localeCompare(a.log?.timestamp || ""));
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.family.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.concept.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "todos" ? true : inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

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
      const count = generateMonthlyInvoices();
      setGenerating(false);
      toast.success("Recibos del mes generados", {
        description: `Se han procesado ${count} conceptos para las familias registradas.`,
      });
    }, 500);
  };

  const handleOpenAbonoModal = (inv: Invoice) => {
    setSelectedInvoiceId(inv.id);
    setAbonoAmount(String(inv.remainingBalance ?? inv.amount));
    setVoucherRef("");
    setPaymentTime(new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }));
    setVoucherImage("");
    setNote("");
  };

  // Manejo de lectura de imagen y pegado directo desde el portapapeles (Ctrl+V)
  const processImageFile = (file: File, setImageState: (b64: string) => void) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      setImageState(res);
      toast.success("Foto del voucher cargada correctamente");
    };
    reader.readAsDataURL(file);
  };

  const handlePasteEvent = (e: React.ClipboardEvent, setImageState: (b64: string) => void) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i]!.type.indexOf("image") !== -1) {
        const blob = items[i]!.getAsFile();
        if (blob) {
          processImageFile(blob, setImageState);
          toast.success("¡Captura de Yape pegada desde el portapapeles!");
        }
      }
    }
  };

  const handleRegisterPayment = () => {
    if (!selectedInvoiceId || !selectedInv) return;
    const amountNum = parseFloat(abonoAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Ingresa un monto de abono válido.");
      return;
    }

    recordPaymentAbono(selectedInvoiceId, amountNum, paymentMethod, voucherRef, note, voucherImage, paymentTime);
    setSelectedInvoiceId(null);

    toast.success(`Abono registrado para ${selectedInv.family}`, {
      description: `${money(amountNum)} recibido vía ${paymentMethod}. Evidencia guardada en bitácora.`,
    });
  };

  const handleRegisterDirectPayment = () => {
    if (!directFamily.trim()) {
      toast.error("Ingresa o selecciona la familia / alumno.");
      return;
    }
    const amountNum = parseFloat(directAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Ingresa un monto válido.");
      return;
    }

    recordNewDirectAbono({
      familyOrStudent: directFamily,
      concept: directConcept,
      amount: amountNum,
      method: directMethod,
      voucherRef: directVoucherRef,
      note: directNote,
      voucherImage: directVoucherImage,
      paymentTime: directPaymentTime || new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
    });

    setIsDirectAbonoOpen(false);
    setDirectFamily("");
    setDirectAmount("");
    setDirectVoucherRef("");
    setDirectVoucherImage("");
    setDirectNote("");

    toast.success(`Abono directo registrado con éxito`, {
      description: `${money(amountNum)} registrado para ${directFamily}.`,
    });
  };

  // Procesador de CSV de Pagos
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      parsePaymentsCsv(text);
    };
    reader.readAsText(file, "UTF-8");
  };

  const parsePaymentsCsv = (content: string) => {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      setCsvErrors(["El archivo está vacío o solo contiene encabezados."]);
      return;
    }

    const rows: any[] = [];
    const errors: string[] = [];

    // Header esperado: Alumno/Familia, Fecha, Monto, Metodo, NroOperacion, Concepto, Nota
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]!.trim();
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length < 3) {
        errors.push(`Línea ${i + 1}: Faltan campos obligatorios (Familia, Fecha, Monto).`);
        continue;
      }

      const [familyOrStudent, date, amountStr, methodStr, voucherRef, concept, note] = parts;
      const amount = parseFloat(amountStr || "0");

      if (!familyOrStudent) {
        errors.push(`Línea ${i + 1}: Nombre de familia/alumno vacío.`);
        continue;
      }
      if (isNaN(amount) || amount <= 0) {
        errors.push(`Línea ${i + 1}: Monto inválido '${amountStr}'.`);
        continue;
      }

      const method: PaymentMethod =
        methodStr?.toLowerCase().includes("plin")
          ? "Plin"
          : methodStr?.toLowerCase().includes("transf")
          ? "Transferencia"
          : methodStr?.toLowerCase().includes("efect")
          ? "Efectivo"
          : "Yape";

      rows.push({
        familyOrStudent,
        date: date || new Date().toLocaleDateString("es-PE"),
        amount,
        method,
        voucherRef: voucherRef || "OP-EXCEL",
        concept: concept || "Mensualidad Regular",
        note: note || "Importación masiva",
      });
    }

    setCsvPreview(rows);
    setCsvErrors(errors);
  };

  const handleConfirmBatchImport = () => {
    if (csvPreview.length === 0) return;
    const count = importBatchPayments(csvPreview);
    setIsCsvImportOpen(false);
    setCsvPreview([]);
    setCsvErrors([]);
    setCsvFileName("");

    toast.success("Importación masiva completada", {
      description: `Se han conciliado ${count} abonos en el sistema.`,
    });
  };

  const downloadPaymentsTemplate = () => {
    const header = "Familia/Alumno,Fecha,Monto,Metodo,NroOperacion,Concepto,Nota\n";
    const samples = [
      `Familia Chipana,2026-08-17,${VIBRA_PRICING.Mensual.priceMonthly},Yape,04829103,Mensualidad Regular,Comprobante WhatsApp`,
      "Familia Castillo,2026-08-17,150,Plin,PLIN-9821,Abono Parcial,Pago mitad de mes",
      "Familia Balarezo,2026-08-17,30,Yape,04992102,Matrícula Promo,Pago único de bienvenida",
      "Familia Mariño,2026-08-17,50,Efectivo,EFEC-01,Clase Personalizada,Pagado en recepción",
    ].join("\n");

    const blob = new Blob([header + samples], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_pagos_vibra_music.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-full space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Control de Cobros, Abonos y Vouchers
            </h1>
            <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold border-0 flex items-center gap-1">
              <Smartphone className="h-3 w-3" /> Yape & Plin Perú
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isStaff
              ? "Secretaría (Nayeli): Registra abonos recibidos por WhatsApp con captura de voucher y N° de Operación."
              : "Dirección: Conciliación bancaria, galería auditada de comprobantes y carga masiva de pagos."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botón Cargar Excel / CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCsvImportOpen(true)}
            className="gap-1.5 font-bold border-primary/30 text-primary hover:bg-primary/5"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Subir Pagos (CSV/Excel)
          </Button>

          {/* Botón Nuevo Abono Rápido */}
          <Button
            size="sm"
            onClick={() => {
              setDirectFamily("");
              setDirectAmount("");
              setDirectVoucherRef("");
              setDirectVoucherImage("");
              setDirectPaymentTime(new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }));
              setIsDirectAbonoOpen(true);
            }}
            className="gap-1.5 font-bold bg-[#731052] hover:bg-[#5c0d41] text-white shadow-xs"
          >
            <PlusCircle className="h-4 w-4" />
            + Nuevo Abono / Voucher
          </Button>

          {/* Botón Generar Recibos del Mes */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsConfirmGenerateOpen(true)}
            disabled={generating}
            className="gap-1.5 font-bold"
          >
            <QrCode className="h-4 w-4" />
            {generating ? "Generando..." : "Generar Recibos del Mes"}
          </Button>
        </div>
      </div>

      {/* Alerta Preventiva: Faltando 2 Días */}
      {dueSoonInvoices.length > 0 && (
        <Card className="border-warning/40 bg-warning/10 shadow-xs">
          <CardContent className="p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-warning/20 p-2 text-warning-foreground shrink-0">
                <BellRing className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {dueSoonInvoices.length} recibos vencen en 2 días o menos
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Envía el aviso preventivo por WhatsApp a las familias antes de la fecha límite.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              className="bg-warning text-warning-foreground hover:bg-warning/90 gap-1.5 font-bold text-xs"
              onClick={() => setIsMassNotifyModalOpen(true)}
            >
              <Send className="h-3.5 w-3.5" />
              Notificar a Todos ({dueSoonInvoices.length})
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resumen de Ingresos en Soles (S/) */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Tile
          icon={DollarSign}
          label="Total Facturado"
          value={money(totals.totalFacturado)}
          hint="Monto total del ciclo"
          tone="text-primary bg-primary/10"
        />
        <Tile
          icon={CheckCircle2}
          label="Abonado / Cobrado"
          value={money(totals.totalCobrado)}
          hint={`${Math.round((totals.totalCobrado / (totals.totalFacturado || 1)) * 100)}% en caja`}
          tone="text-emerald-600 bg-emerald-500/10"
        />
        <Tile
          icon={Clock}
          label="Saldo Pendiente"
          value={money(totals.totalPendiente)}
          hint={`${dueSoonInvoices.length} recibos por cobrar`}
          tone="text-amber-600 bg-amber-500/15"
        />
        <Tile
          icon={AlertCircle}
          label="Morosidad Vencida"
          value={money(totals.totalMorosidad)}
          hint="Requiere cobranza activa"
          tone="text-destructive bg-destructive/10"
          alert={totals.totalMorosidad > 0}
        />
      </div>

      {/* Pestañas Principales */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex flex-wrap items-center gap-1.5 bg-muted p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("recibos")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === "recibos"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileCheck className="h-3.5 w-3.5" />
            Recibos Activos ({filteredInvoices.length})
          </button>

          <button
            onClick={() => setActiveTab("anual")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === "anual"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            Matriz Anual 2026 ({adminStudents.length})
          </button>

          <button
            onClick={() => setActiveTab("vouchers")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === "vouchers"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5 text-purple-500" />
            Historial de Vouchers Yape ({allVoucherLogs.length})
          </button>

          {!isStaff && (
            <button
              onClick={() => setActiveTab("resumen")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === "resumen"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <History className="h-3.5 w-3.5" />
              Conciliación y Caja
            </button>
          )}
        </div>

        {/* Buscador y Filtro de Estado */}
        {(activeTab === "recibos" || activeTab === "anual") && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar familia o alumno..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary w-48 sm:w-64"
              />
            </div>
            {activeTab === "recibos" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs w-32">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="parcial">Parciales</SelectItem>
                  <SelectItem value="pagado">Pagados</SelectItem>
                  <SelectItem value="vencido">Vencidos</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>

      {/* PESTAÑA 1: TABLA DE RECIBOS Y FACTURAS */}
      {activeTab === "recibos" && (
        <Card className="shadow-xs overflow-hidden border-border">
          <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black">Recibos, Abonos y Bitácora de Auditoría</CardTitle>
              <CardDescription className="text-xs">
                Registra abonos recibidos por el WhatsApp de la escuela con N° de Operación, día programado de cobro y captura.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <FileCheck className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-foreground">No hay recibos con el filtro seleccionado</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Puedes generar los recibos automáticos para todas las familias con el botón superior o registrar un nuevo abono.
                </p>
                <Button size="sm" onClick={handleGenerateInvoices} className="gap-1.5 font-bold">
                  <QrCode className="h-4 w-4" /> Generar Recibos del Mes
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 text-xs">
                      <TableHead className="font-black">Familia / Alumno</TableHead>
                      <TableHead className="font-black">Día Cobro / Vencimiento</TableHead>
                      <TableHead className="font-black">Concepto</TableHead>
                      <TableHead className="text-right font-black">Precio Total</TableHead>
                      <TableHead className="text-right font-black">Abonado</TableHead>
                      <TableHead className="text-right font-black">Saldo Restante</TableHead>
                      <TableHead className="font-black">Estado / Aviso</TableHead>
                      <TableHead className="font-black">Último Medio</TableHead>
                      <TableHead className="text-right font-black">Acciones de Cobro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((inv) => {
                      const studentName = inv.concept.split("—")[1]?.trim() || inv.family;
                      const dayNum = inv.dueDate ? inv.dueDate.split("-")[2] : "01";

                      return (
                        <TableRow key={inv.id} className="hover:bg-muted/30 text-xs">
                          <TableCell className="font-black text-foreground">{inv.family}</TableCell>
                          <TableCell className="font-semibold text-foreground">
                            <span className="font-mono font-bold bg-muted px-1.5 py-0.5 rounded text-[11px]">
                              Día {dayNum}
                            </span>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">
                              {inv.dueDate || "Agosto 2026"}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{inv.concept}</TableCell>
                          <TableCell className="text-right font-mono font-bold text-foreground">
                            {money(inv.amount)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {money(inv.amountPaid)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-black text-destructive">
                            {money(inv.remainingBalance ?? inv.amount)}
                          </TableCell>
                          <TableCell>{invoiceStatusBadge(inv)}</TableCell>
                          <TableCell>
                            {inv.paymentMethod ? (
                              <Badge variant="outline" className="text-[10px] font-bold">
                                {inv.paymentMethod}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-[10px]">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-1.5">
                            {inv.status !== "pagado" && (
                              <Button
                                size="sm"
                                onClick={() => handleOpenAbonoModal(inv)}
                                className="h-7 px-2.5 text-xs font-bold bg-[#731052] hover:bg-[#5c0d41] text-white gap-1"
                              >
                                <Smartphone className="h-3 w-3" /> Abonar
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const rawStudentName = inv.concept.includes("—") ? inv.concept.split("—")[1]?.trim() : inv.family;
                                const stProfile = adminStudents.find(
                                  (s) =>
                                    (rawStudentName && s.name.toLowerCase().includes(rawStudentName.toLowerCase())) ||
                                    (rawStudentName && rawStudentName.toLowerCase().includes(s.name.toLowerCase())) ||
                                    s.family.toLowerCase() === inv.family.toLowerCase() ||
                                    inv.concept.toLowerCase().includes(s.name.toLowerCase())
                                );
                                const rawPhone = stProfile?.phone || stProfile?.emergencyContact?.phone || "";
                                const cleanDigits = rawPhone.replace(/\D/g, "");
                                const formattedPhone = cleanDigits.length === 9 ? `+51 ${cleanDigits.slice(0, 3)} ${cleanDigits.slice(3, 6)} ${cleanDigits.slice(6)}` : rawPhone;
                                const isPaid = inv.status === "pagado";
                                const text = isPaid
                                  ? `Hola ${inv.family}, te saludamos de la Academia Vibra Music 🎶. Confirmamos la recepción de tu abono de S/ ${inv.amountPaid.toFixed(2)} por las clases de ${rawStudentName}. ¡Muchas gracias por tu puntualidad! 🎹🎸`
                                  : `Hola ${inv.family}, te saludamos de la Academia Vibra Music 🎶. Te recordamos que la mensualidad de ${rawStudentName} vence el día ${dayNum} por un monto de S/ ${(inv.remainingBalance ?? inv.amount).toFixed(2)}. Puedes abonar vía Yape o transferencia BCP. Si ya realizaste el pago, por favor compártenos el comprobante. ¡Que tengas un excelente día! ✨`;

                                setWhatsappModalData({
                                  isOpen: true,
                                  studentName: rawStudentName || inv.family,
                                  family: inv.family,
                                  phone: formattedPhone || "+51 984 123 456",
                                  amount: isPaid ? inv.amountPaid : (inv.remainingBalance ?? inv.amount),
                                  dueDate: inv.dueDate,
                                  type: isPaid ? "confirmacion" : "recordatorio",
                                  customText: text,
                                });
                              }}
                              className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-500/10"
                              title="Enviar mensaje oficial por WhatsApp"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewLogsInvoiceId(inv.id)}
                              className="h-7 px-2 text-[11px] font-semibold gap-1"
                              title="Ver bitácora y vouchers"
                            >
                              <History className="h-3 w-3" />
                              Bitácora ({(inv.paymentLogs || []).length})
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
      )}

      {/* PESTAÑA 2: MATRIZ ANUAL (EXCEL INTERACTIVO 2026) */}
      {activeTab === "anual" && (
        <Card className="shadow-xs overflow-hidden border-border">
          <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                Matriz Anual de Control de Pagos 2026 (99 Alumnos Oficiales)
              </CardTitle>
              <CardDescription className="text-xs">
                Reemplazo interactivo del Excel con historial mes a mes (Junio a Diciembre), montos y notas específicas.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Cancelado
              </span>
              <span className="flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Deudor
              </span>
              <span className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Parcial
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 text-[11px]">
                    <TableHead className="font-black">#</TableHead>
                    <TableHead className="font-black">Alumno</TableHead>
                    <TableHead className="font-black text-center">Día Cobro</TableHead>
                    <TableHead className="font-black text-right">Mensualidad</TableHead>
                    <TableHead className="font-black text-center">Junio</TableHead>
                    <TableHead className="font-black text-center">Julio</TableHead>
                    <TableHead className="font-black text-center bg-primary/5">Agosto (Actual)</TableHead>
                    <TableHead className="font-black text-center">Septiembre</TableHead>
                    <TableHead className="font-black text-center">Octubre</TableHead>
                    <TableHead className="font-black text-center">Noviembre</TableHead>
                    <TableHead className="font-black text-center">Diciembre</TableHead>
                    <TableHead className="font-black">Observaciones</TableHead>
                    <TableHead className="font-black text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminStudents
                    .filter((st) => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return st.name.toLowerCase().includes(q) || (st.teacherNote && st.teacherNote.toLowerCase().includes(q));
                    })
                    .map((st: any, idx) => {
                      const records = st.annualRecords || {};
                      const dayVal = st.planStartDate ? st.planStartDate.split("-")[2] : "1";

                      const renderBadge = (rec?: any) => {
                        if (!rec || !rec.rawText) {
                          return <span className="text-muted-foreground/40 text-[10px]">—</span>;
                        }
                        const t = rec.rawText;
                        if (rec.status === "pagado") {
                          return (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                              {t}
                            </span>
                          );
                        }
                        if (rec.status === "deudor") {
                          return (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 font-black text-[10px]">
                              {t}
                            </span>
                          );
                        }
                        if (rec.status === "parcial") {
                          return (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                              {t}
                            </span>
                          );
                        }
                        if (rec.status === "personalizado") {
                          return (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-bold text-[10px]">
                              {t}
                            </span>
                          );
                        }
                        return (
                          <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">
                            {t}
                          </span>
                        );
                      };

                      return (
                        <TableRow key={st.id} className="hover:bg-muted/30 text-xs">
                          <TableCell className="text-muted-foreground font-mono text-[10px]">{idx + 1}</TableCell>
                          <TableCell className="font-bold text-foreground max-w-[200px] truncate" title={st.name}>
                            {st.name}
                          </TableCell>
                          <TableCell className="text-center font-mono font-bold">
                            <span className="bg-muted px-1.5 py-0.5 rounded text-[11px]">
                              Día {dayVal}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold">
                            {st.rawMontoText || money(st.planPrice || 297)}
                          </TableCell>
                          <TableCell className="text-center">{renderBadge(records.Junio)}</TableCell>
                          <TableCell className="text-center">{renderBadge(records.Julio)}</TableCell>
                          <TableCell className="text-center bg-primary/5 font-bold">{renderBadge(records.Agosto)}</TableCell>
                          <TableCell className="text-center">{renderBadge(records.Septiembre)}</TableCell>
                          <TableCell className="text-center">{renderBadge(records.Octubre)}</TableCell>
                          <TableCell className="text-center">{renderBadge(records.Noviembre)}</TableCell>
                          <TableCell className="text-center">{renderBadge(records.Diciembre)}</TableCell>
                          <TableCell className="text-muted-foreground text-[11px] max-w-[220px] truncate" title={st.teacherNote}>
                            {st.teacherNote || "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setDirectFamily(st.name);
                                setDirectAmount(String(st.planPrice || 297));
                                setIsDirectAbonoOpen(true);
                              }}
                              className="h-6 px-2 text-[10px] font-bold gap-1 text-primary border-primary/30"
                            >
                              <Smartphone className="h-3 w-3" /> Abonar
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
      )}

      {/* PESTAÑA 3: HISTORIAL DE ABONOS Y GALERÍA DE VOUCHERS */}
      {activeTab === "vouchers" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3.5 rounded-2xl border border-border shadow-xs">
            <div>
              <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-purple-500" />
                Galería y Bitácora de Evidencias Fotográficas
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Historial cronológico de todos los vouchers de Yape, Plin y Transferencias subidos por recepción.
              </p>
            </div>
            <Badge variant="outline" className="font-bold text-xs">
              {allVoucherLogs.length} Comprobantes Registrados
            </Badge>
          </div>

          {allVoucherLogs.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 mb-3">
                <Smartphone className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-foreground">No hay vouchers registrados aún</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Cuando Nayeli registre un abono y adjunte la captura de Yape, aparecerá aquí con vista previa en alta resolución.
              </p>
              <Button
                size="sm"
                onClick={() => setIsDirectAbonoOpen(true)}
                className="mt-4 gap-1.5 font-bold bg-[#731052] hover:bg-[#5c0d41] text-white"
              >
                <PlusCircle className="h-4 w-4" /> Registrar Primer Voucher
              </Button>
            </Card>
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {allVoucherLogs.map(({ log, family, concept }) => (
                <Card key={log.id} className="overflow-hidden border-border hover:shadow-md transition-shadow">
                  {/* Foto del Voucher / Placeholder */}
                  <div className="relative h-44 bg-slate-900 flex items-center justify-center overflow-hidden group">
                    {log.voucherImage ? (
                      <>
                        <img
                          src={log.voucherImage}
                          alt={`Voucher ${family}`}
                          className="w-full h-full object-cover object-top transition-transform group-hover:scale-105 cursor-pointer"
                          onClick={() =>
                            setInspectedVoucher({
                              image: log.voucherImage!,
                              family,
                              amount: log.amount,
                              method: log.method,
                              voucherRef: log.voucherRef,
                              timestamp: log.timestamp,
                              registeredBy: log.registeredBy,
                              note: log.note,
                            })
                          }
                        />
                        <div
                          onClick={() =>
                            setInspectedVoucher({
                              image: log.voucherImage!,
                              family,
                              amount: log.amount,
                              method: log.method,
                              voucherRef: log.voucherRef,
                              timestamp: log.timestamp,
                              registeredBy: log.registeredBy,
                              note: log.note,
                            })
                          }
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-bold transition-opacity cursor-pointer"
                        >
                          <Maximize2 className="h-4 w-4" /> Ver Captura HD
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        <Smartphone className="h-8 w-8 text-purple-400 mb-1" />
                        <span className="text-[11px] font-semibold">Registro sin captura adjunta</span>
                        <span className="text-[10px] opacity-70">Op: {log.voucherRef || "N/A"}</span>
                      </div>
                    )}

                    <div className="absolute top-2 left-2">
                      <Badge
                        className={`text-[10px] font-black border-0 ${
                          log.method === "Yape"
                            ? "bg-[#731052] text-white"
                            : log.method === "Plin"
                            ? "bg-cyan-600 text-white"
                            : log.method === "Transferencia"
                            ? "bg-blue-600 text-white"
                            : "bg-emerald-600 text-white"
                        }`}
                      >
                        {log.method}
                      </Badge>
                    </div>

                    <div className="absolute bottom-2 right-2">
                      <Badge className="bg-black/80 text-white font-mono font-black text-xs border-0">
                        {money(log.amount)}
                      </Badge>
                    </div>
                  </div>

                  {/* Metadatos */}
                  <CardContent className="p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-foreground truncate">{family}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{log.timestamp.slice(0, 10)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{concept}</p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border">
                      <span>N° Op: <strong className="text-foreground font-mono">{log.voucherRef || "—"}</strong></span>
                      <span className="text-primary font-semibold">{log.registeredBy}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: RESUMEN FINANCIERO Y CONCILIACIÓN */}
      {activeTab === "resumen" && !isStaff && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-black">Conciliación e Histórico Financiero (Dirección)</CardTitle>
              <CardDescription>Resumen de cobros por mes y verificación de caja</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {billingTrend.map((b) => {
                const rate = Math.round((b.collected / b.billed) * 100);
                return (
                  <div key={b.month} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{b.month} 2026</span>
                      <span className="text-muted-foreground font-mono">
                        {money(b.collected)} / {money(b.billed)} ({rate}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${rate >= 95 ? "bg-emerald-500" : rate >= 85 ? "bg-primary" : "bg-warning"}`}
                        style={{ width: `${Math.min(rate, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-black">Conceptos del Dossier</CardTitle>
              <CardDescription>Planes vigentes en la academia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recurringConcepts.map((rc) => (
                <div key={rc.id} className="rounded-xl border border-border p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground">{rc.label}</p>
                    <p className="text-[10px] text-muted-foreground">{rc.detail}</p>
                  </div>
                  <span className="font-mono font-black text-foreground text-sm">{money(rc.amount)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL 1: REGISTRO DE ABONO A RECIBO EXISTENTE */}
      <Dialog open={!!selectedInvoiceId} onOpenChange={(open) => !open && setSelectedInvoiceId(null)}>
        <DialogContent
          className="sm:max-w-md"
          onPaste={(e) => handlePasteEvent(e, setVoucherImage)}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-[#731052]" />
              Registrar Abono con Evidencia de Voucher
            </DialogTitle>
            <DialogDescription className="text-xs">
              Familia: <strong className="text-foreground">{selectedInv?.family}</strong> · Concepto: {selectedInv?.concept}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            {/* Método de Pago */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Método de Pago</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: "Yape", label: "Yape", color: "bg-[#731052] text-white", border: "border-[#731052]" },
                  { id: "Plin", label: "Plin", color: "bg-cyan-600 text-white", border: "border-cyan-600" },
                  { id: "Transferencia", label: "BCP / Transf.", color: "bg-blue-600 text-white", border: "border-blue-600" },
                  { id: "Efectivo", label: "Efectivo", color: "bg-emerald-600 text-white", border: "border-emerald-600" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                      paymentMethod === m.id
                        ? `${m.color} shadow-xs font-black scale-[1.02]`
                        : "bg-muted text-muted-foreground border-transparent hover:text-foreground"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Monto y Hora */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Monto Abonado (S/)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={abonoAmount}
                  onChange={(e) => setAbonoAmount(e.target.value)}
                  className="font-mono font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Hora Comprobante</label>
                <Input
                  type="text"
                  placeholder="Ej: 16:45"
                  value={paymentTime}
                  onChange={(e) => setPaymentTime(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* N° de Operación */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">
                N° de Operación / Código Yape <span className="text-muted-foreground font-normal">(Opcional)</span>
              </label>
              <Input
                placeholder="Ej: 04829103"
                value={voucherRef}
                onChange={(e) => setVoucherRef(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            {/* Zona de Subida y Pegado de Foto de Voucher */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5 text-primary" /> Foto / Captura del Voucher
                </label>
                <span className="text-[10px] text-primary font-bold">💡 Puedes presionar Ctrl+V para pegar</span>
              </div>

              {voucherImage ? (
                <div className="relative rounded-xl border border-border overflow-hidden bg-slate-950 p-1 flex items-center justify-center">
                  <img src={voucherImage} alt="Preview Voucher" className="max-h-40 object-contain rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setVoucherImage("")}
                    className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-white hover:bg-destructive/90"
                    title="Eliminar imagen"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) processImageFile(file, setVoucherImage);
                    };
                    input.click();
                  }}
                  className="rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/30 p-4 text-center cursor-pointer transition-colors"
                >
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                  <p className="text-xs font-bold text-foreground">Haz clic para subir o arrastra la foto</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Soporta capturas de pantalla de WhatsApp Web (PNG, JPG, WEBP)</p>
                </div>
              )}
            </div>

            {/* Nota adicional */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Nota / Observación</label>
              <Input
                placeholder="Ej: Pago adelantado de ciclo agosto"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setSelectedInvoiceId(null)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleRegisterPayment} className="gap-1 font-bold bg-[#731052] hover:bg-[#5c0d41] text-white">
              <CheckCircle2 className="h-4 w-4" /> Guardar Abono
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: NUEVO ABONO DIRECTO */}
      <Dialog open={isDirectAbonoOpen} onOpenChange={setIsDirectAbonoOpen}>
        <DialogContent
          className="sm:max-w-md"
          onPaste={(e) => handlePasteEvent(e, setDirectVoucherImage)}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-[#731052]" />
              Nuevo Abono Directo / Depósito Yape
            </DialogTitle>
            <DialogDescription className="text-xs">
              Registra un pago recibido por WhatsApp asignándolo a un alumno o familia.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Familia / Alumno */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Familia o Alumno</label>
              <Input
                placeholder="Ej: Familia Chipana o Valentina Ríos"
                value={directFamily}
                onChange={(e) => setDirectFamily(e.target.value)}
                className="text-xs font-bold"
              />
            </div>

            {/* Concepto */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Concepto</label>
              <Select value={directConcept} onValueChange={setDirectConcept}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mensualidad Regular">
                    Mensualidad Regular (S/ {VIBRA_PRICING.Mensual.priceMonthly.toFixed(2)})
                  </SelectItem>
                  <SelectItem value="Plan Trimestral">
                    Plan Trimestral (S/ {VIBRA_PRICING.Trimestral.priceMonthly.toFixed(2)}/mes)
                  </SelectItem>
                  <SelectItem value="Plan Anual">
                    Plan Anual (S/ {VIBRA_PRICING.Anual.priceMonthly.toFixed(2)}/mes)
                  </SelectItem>
                  <SelectItem value="Matrícula Promo Demo">
                    Matrícula Promo Demo (S/ {VIBRA_PRICING.MatriculaPromoDemo})
                  </SelectItem>
                  <SelectItem value="Pack de Útiles Anual">
                    Pack de Útiles Anual (S/ {VIBRA_PRICING.PackUtilesAnual})
                  </SelectItem>
                  <SelectItem value="Clase Personalizada">Clase Personalizada (S/ 50)</SelectItem>
                  <SelectItem value="Abono Libre">Abono Libre / Saldo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Método de Pago */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Método de Pago</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: "Yape", label: "Yape", color: "bg-[#731052] text-white" },
                  { id: "Plin", label: "Plin", color: "bg-cyan-600 text-white" },
                  { id: "Transferencia", label: "BCP", color: "bg-blue-600 text-white" },
                  { id: "Efectivo", label: "Efectivo", color: "bg-emerald-600 text-white" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setDirectMethod(m.id as PaymentMethod)}
                    className={`py-1.5 text-center rounded-xl text-xs font-bold transition-all ${
                      directMethod === m.id
                        ? `${m.color} shadow-xs font-black`
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Monto y N° Operación */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Monto (S/)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={directAmount}
                  onChange={(e) => setDirectAmount(e.target.value)}
                  className="font-mono font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">N° de Operación</label>
                <Input
                  placeholder="Ej: 04829103"
                  value={directVoucherRef}
                  onChange={(e) => setDirectVoucherRef(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* Voucher Foto */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">Captura del Voucher</label>
                <span className="text-[10px] text-primary font-bold">💡 Pega con Ctrl+V</span>
              </div>
              {directVoucherImage ? (
                <div className="relative rounded-xl border border-border overflow-hidden bg-slate-950 p-1 flex items-center justify-center">
                  <img src={directVoucherImage} alt="Preview Voucher" className="max-h-36 object-contain rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setDirectVoucherImage("")}
                    className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) processImageFile(file, setDirectVoucherImage);
                    };
                    input.click();
                  }}
                  className="rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/30 p-3 text-center cursor-pointer"
                >
                  <Upload className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                  <p className="text-xs font-semibold text-foreground">Subir o pegar captura de Yape</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsDirectAbonoOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleRegisterDirectPayment} className="gap-1 font-bold bg-[#731052] hover:bg-[#5c0d41] text-white">
              <CheckCircle2 className="h-4 w-4" /> Registrar Abono
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: IMPORTACIÓN MASIVA DE EXCEL / CSV DE PAGOS */}
      <Dialog open={isCsvImportOpen} onOpenChange={setIsCsvImportOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Carga Masiva de Pagos (Excel / CSV)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Importa la lista de abonos realizados por las familias para conciliar saldos automáticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Plantilla y Formato */}
            <div className="bg-muted/40 p-3 rounded-xl border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">1. Formato requerido de columnas:</span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={downloadPaymentsTemplate}
                  className="h-6 text-xs text-primary font-bold gap-1 p-0"
                >
                  <Download className="h-3 w-3" /> Descargar Plantilla .CSV
                </Button>
              </div>
              <code className="block text-[11px] font-mono bg-background p-2 rounded-lg border border-border text-foreground">
                Familia/Alumno, Fecha, Monto, Metodo, NroOperacion, Concepto, Nota
              </code>
            </div>

            {/* Zona de Subida */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">2. Seleccionar archivo .csv</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,text/csv,text/plain"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full gap-2 border-dashed border-2 h-16 font-bold"
                >
                  <Upload className="h-5 w-5 text-primary" />
                  {csvFileName ? `Archivo: ${csvFileName}` : "Haz clic aquí para seleccionar el archivo CSV"}
                </Button>
              </div>
            </div>

            {/* Errores de Validación */}
            {csvErrors.length > 0 && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs space-y-1">
                <p className="font-bold text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" /> Se encontraron inconsistencias:
                </p>
                <ul className="list-disc list-inside text-[11px] text-destructive space-y-0.5 max-h-24 overflow-y-auto">
                  {csvErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Vista Previa de Filas Válidas */}
            {csvPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Filas a importar: {csvPreview.length}</span>
                  <span className="text-emerald-600 font-mono">
                    Total: {money(csvPreview.reduce((acc, r) => acc + r.amount, 0))}
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-[11px]">
                        <TableHead>Familia/Alumno</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Medio</TableHead>
                        <TableHead>N° Op</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvPreview.map((row, idx) => (
                        <TableRow key={idx} className="text-[11px]">
                          <TableCell className="font-bold">{row.familyOrStudent}</TableCell>
                          <TableCell className="font-mono text-emerald-600 font-bold">{money(row.amount)}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px]">{row.method}</Badge></TableCell>
                          <TableCell className="font-mono text-[10px]">{row.voucherRef}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsCsvImportOpen(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmBatchImport}
              disabled={csvPreview.length === 0}
              className="gap-1 font-bold bg-primary text-primary-foreground"
            >
              <CheckCircle2 className="h-4 w-4" /> Confirmar e Importar {csvPreview.length} Pagos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: VISOR DE VOUCHER EN ALTA RESOLUCIÓN */}
      <Dialog open={!!inspectedVoucher} onOpenChange={(open) => !open && setInspectedVoucher(null)}>
        <DialogContent className="sm:max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center justify-between">
              <span>Comprobante de Pago — {inspectedVoucher?.family}</span>
              <Badge className="bg-[#731052] text-white border-0 font-bold">
                {inspectedVoucher?.method} · {money(inspectedVoucher?.amount || 0)}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {inspectedVoucher && (
            <div className="space-y-3 py-2">
              <div className="rounded-2xl border border-border overflow-hidden bg-slate-950 flex items-center justify-center p-2">
                <img
                  src={inspectedVoucher.image}
                  alt="Voucher HD"
                  className="max-h-[65vh] w-auto object-contain rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-3 rounded-xl border border-border">
                <div>
                  <span className="text-muted-foreground block text-[10px]">N° de Operación / Código</span>
                  <strong className="font-mono text-foreground">{inspectedVoucher.voucherRef || "—"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Fecha y Hora</span>
                  <strong className="text-foreground">{inspectedVoucher.timestamp}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Registrado por</span>
                  <strong className="text-primary">{inspectedVoucher.registeredBy}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Observaciones</span>
                  <span className="text-foreground">{inspectedVoucher.note || "Sin notas"}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setInspectedVoucher(null)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: BITÁCORA DE UN RECIBO ESPECÍFICO */}
      <Dialog open={!!viewLogsInvoiceId} onOpenChange={(open) => !open && setViewLogsInvoiceId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Bitácora Inmutable de Auditoría
            </DialogTitle>
            <DialogDescription className="text-xs">
              Familia: <strong className="text-foreground">{viewLogsInv?.family}</strong> · Concepto: {viewLogsInv?.concept}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
            {(!viewLogsInv?.paymentLogs || viewLogsInv.paymentLogs.length === 0) ? (
              <p className="text-center py-6 text-xs text-muted-foreground">
                No hay movimientos registrados para este recibo.
              </p>
            ) : (
              (viewLogsInv.paymentLogs || []).map((log) => (
                <div key={log.id} className="rounded-xl border border-border p-3 space-y-2 bg-muted/20 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-emerald-600 text-sm">{money(log.amount)}</span>
                    <Badge variant="outline" className="font-bold">{log.method}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
                    <div>Fecha: <strong className="text-foreground">{log.timestamp}</strong></div>
                    <div>Registrado por: <strong className="text-primary">{log.registeredBy}</strong></div>
                    <div>N° Operación: <strong className="font-mono text-foreground">{log.voucherRef || "—"}</strong></div>
                    {log.paymentTime && <div>Hora comprobante: <strong>{log.paymentTime}</strong></div>}
                  </div>
                  {log.note && <p className="text-[11px] italic text-muted-foreground">"{log.note}"</p>}

                  {log.voucherImage && (
                    <div className="pt-2 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setInspectedVoucher({
                            image: log.voucherImage!,
                            family: viewLogsInv.family,
                            amount: log.amount,
                            method: log.method,
                            voucherRef: log.voucherRef,
                            timestamp: log.timestamp,
                            registeredBy: log.registeredBy,
                            note: log.note,
                          })
                        }
                        className="w-full gap-1 text-xs font-bold"
                      >
                        <Eye className="h-3.5 w-3.5" /> Ver Voucher Adjunto
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button size="sm" variant="outline" onClick={() => setViewLogsInvoiceId(null)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL OFICIAL: ENVIAR WHATSAPP EN 1 CLIC */}
      <Dialog
        open={whatsappModalData.isOpen}
        onOpenChange={(open) => setWhatsappModalData((prev) => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Send className="h-4 w-4" />
              </span>
              Enviar Mensaje WhatsApp Oficial
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirmación o recordatorio pre-armado para {whatsappModalData.family} ({whatsappModalData.studentName}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Teléfono de Contacto (Perú):</label>
              <Input
                type="text"
                value={whatsappModalData.phone}
                onChange={(e) => setWhatsappModalData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Ej: 987654321"
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Mensaje Pre-Armado (Editable):</label>
              <textarea
                value={whatsappModalData.customText}
                onChange={(e) => setWhatsappModalData((prev) => ({ ...prev, customText: e.target.value }))}
                rows={5}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none font-sans"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300">
              💡 <strong>Acceso Directo:</strong> Al hacer clic en el botón verde se abrirá WhatsApp Web o la App de WhatsApp con el chat listo para enviar.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setWhatsappModalData((prev) => ({ ...prev, isOpen: false }))}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const cleanPhone = whatsappModalData.phone.replace(/\D/g, "");
                const targetPhone = cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`;
                const encodedMsg = encodeURIComponent(whatsappModalData.customText);
                const url = `https://wa.me/${targetPhone}?text=${encodedMsg}`;
                window.open(url, "_blank");
                setWhatsappModalData((prev) => ({ ...prev, isOpen: false }));
                toast.success(`Abriendo WhatsApp para ${whatsappModalData.family}`);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
            >
              <Send className="h-3.5 w-3.5" /> Abrir WhatsApp Directo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 1: DOBLE PASO PARA GENERAR RECIBOS DEL MES */}
      <Dialog open={isConfirmGenerateOpen} onOpenChange={setIsConfirmGenerateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <QrCode className="h-4 w-4" />
              </span>
              ¿Generar los Recibos del Mes?
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirmación de doble paso para emisión masiva de cobranzas.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-2 text-xs text-foreground">
            <p>
              Esta acción creará o actualizará automáticamente los recibos de cobro para las <strong>{adminStudents.length} familias activas</strong> con su día programado de vencimiento y monto mensual en Soles.
            </p>
            <div className="p-3 rounded-xl bg-muted/60 border border-border text-[11px] text-muted-foreground space-y-1">
              <p className="font-bold text-foreground">🛡️ Seguridad de Secretaría:</p>
              <p>• Los recibos ya pagados no se duplicarán ni se modificarán.</p>
              <p>• Se calcularán los días restantes para el vencimiento de cada alumno.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsConfirmGenerateOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setIsConfirmGenerateOpen(false);
                handleGenerateInvoices();
              }}
              disabled={generating}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Sí, Generar Recibos del Mes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: DOBLE PASO Y AVISO DE NOTIFICACIÓN MASIVA (EN DESARROLLO) */}
      <Dialog open={isMassNotifyModalOpen} onOpenChange={setIsMassNotifyModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black text-amber-600 dark:text-amber-400">
              <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
              </span>
              Notificación Masiva WhatsApp (En Desarrollo)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Información técnica sobre el envío masivo desatendido.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3 text-xs text-foreground">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-1.5">
              <p className="font-black flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-amber-600" /> Requiere API Oficial de WhatsApp Cloud (Meta)
              </p>
              <p className="text-[11.5px]">
                El envío masivo desatendido a {dueSoonInvoices.length} familias a la vez requiere conectar el servidor con la API de WhatsApp de Meta (para evitar bloqueos de número).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300">
              💡 <strong>Método Oficial Seguro Activo:</strong> Puedes enviar el aviso preventivo personalizado a cada una de las {dueSoonInvoices.length} familias haciendo clic directamente en el botón verde <strong className="font-black text-emerald-700 dark:text-emerald-300">📲 (WhatsApp)</strong> al lado de cada recibo.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              size="sm"
              onClick={() => setIsMassNotifyModalOpen(false)}
              className="bg-primary text-primary-foreground font-bold"
            >
              Entendido, enviar individualmente
            </Button>
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
    <Card className={`shadow-xs ${alert ? "border-destructive/40 bg-destructive/5" : "border-border"}`}>
      <CardContent className="p-3.5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          <p className="text-lg sm:text-xl font-black text-foreground mt-0.5 tracking-tight font-mono">{value}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${tone} shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
