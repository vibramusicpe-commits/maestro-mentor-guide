/**
 * ================================================================
 * student-audit-report-dialog.tsx — Ficha Oficial de Auditoría y
 * Rendición de Cuentas por Alumno (Previsualización, Edición en Caliente
 * y Exportación Dual Humano/LLM)
 * ================================================================
 * 
 * Cumplimiento de ADRs:
 * - Filosofía Vibra Music: "Las clases no se pierden, se recuperan".
 * - ADR-0099, ADR-0100: Cuotas de 8 clases (Regular) / 4 clases (Intensivo).
 * - ADR-0103, ADR-0106: Mutación segura en PostgreSQL Insforge.
 * - ADR-0131: Transición de instrumento y vigencias temporales.
 * - ADR-0133: Normalización de días, balance de créditos migrados
 *   (ej. Sasha: 3 regulares + 2 créditos = 5 clases en Guitarra)
 *   y deduplicación contable por ID.
 */

import { useState, useMemo, Fragment } from "react";
import { useAppStore, type AdminStudent, type PaymentMethod, type Invoice } from "@/store/app-store";
import {
  computeStudentCycleSessions,
  computeStudentCycleLiquidation,
  computeStudentFinancialAudit,
  generateStudentAuditMarkdown,
  type StudentSessionItem,
} from "@/lib/kardex-calculator";
import { isMatchingStudentName } from "@/lib/student-matching";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Printer,
  Download,
  Copy,
  MessageCircle,
  PlusCircle,
  Edit3,
  Calendar,
  CreditCard,
  ShieldCheck,
  DollarSign,
  Sparkles,
  ArrowRight,
  BookmarkCheck,
} from "lucide-react";

interface StudentAuditReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: AdminStudent | null;
}

export function StudentAuditReportDialog({
  open,
  onOpenChange,
  student,
}: StudentAuditReportDialogProps) {
  const allSchedule = useAppStore((s) => s.schedule);
  const adminStudents = useAppStore((s) => s.adminStudents);
  const invoices = useAppStore((s) => s.invoices);
  const recordPaymentAbono = useAppStore((s) => s.recordPaymentAbono);
  const recordNewDirectAbono = useAppStore((s) => s.recordNewDirectAbono);
  const setStudentSessionAttendance = useAppStore((s) => s.setStudentSessionAttendance);

  // Estados de edición en caliente
  const [showAbonoForm, setShowAbonoForm] = useState(false);
  const [abonoAmount, setAbonoAmount] = useState<string>("100");
  const [abonoMethod, setAbonoMethod] = useState<PaymentMethod>("Yape");
  const [abonoVoucher, setAbonoVoucher] = useState<string>("");
  const [abonoTime, setAbonoTime] = useState<string>(
    new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
  );
  const [abonoNote, setAbonoNote] = useState<string>("Abono regularizado");
  const [isSavingAbono, setIsSavingAbono] = useState(false);

  // Modo edición de asistencias
  const [attendanceEditMode, setAttendanceEditMode] = useState(false);

  // Resolver el alumno en vivo desde el store Zustand para reactividad inmediata
  const liveStudent = useMemo(() => {
    if (!student) return null;
    return adminStudents.find((st) => st.id === student.id || isMatchingStudentName(st.name, student.name)) || student;
  }, [student, adminStudents]);

  // Código único de auditoría persistente durante la sesión del modal
  const auditCode = useMemo(() => {
    if (!liveStudent) return "";
    const cleanId = liveStudent.id.slice(0, 6).toUpperCase();
    const dStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `AUD-${dStr}-${cleanId}`;
  }, [liveStudent?.id]);

  // Cálculo de sesiones del ciclo (respetando normalización y barreras de transición)
  const sessions: StudentSessionItem[] = useMemo(() => {
    if (!liveStudent) return [];
    return computeStudentCycleSessions({
      student: liveStudent,
      allSchedule,
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth(),
    });
  }, [liveStudent, allSchedule]);

  // Auditoría financiera canónica de 3 rubros (Matrícula, Mensualidad, Libros)
  const financialAudit = useMemo(() => {
    if (!liveStudent) return null;
    return computeStudentFinancialAudit(liveStudent, invoices);
  }, [liveStudent, invoices]);

  // Cálculo de liquidación pedagógica, balance de créditos y financiero
  const liquidation = useMemo(() => {
    if (!liveStudent) return null;
    return computeStudentCycleLiquidation(liveStudent, sessions, undefined, undefined, invoices);
  }, [liveStudent, sessions, invoices]);

  // Recibos asociados al alumno deduplicados estrictamente por ID
  const matchingInvoices = useMemo(() => {
    if (!liveStudent) return [];
    const map = new Map<string, Invoice>();
    invoices.forEach((inv) => {
      const isMatch =
        isMatchingStudentName(liveStudent.name, inv.student || "") ||
        (inv.concept && isMatchingStudentName(liveStudent.name, inv.concept.split("—")[1]?.trim() || "")) ||
        (liveStudent.invoices && liveStudent.invoices.some((i) => i.id === inv.id));
      if (isMatch && !map.has(inv.id)) {
        map.set(inv.id, inv);
      }
    });
    return Array.from(map.values());
  }, [liveStudent, invoices]);

  if (!liveStudent || !liquidation || !financialAudit) return null;

  const phone = liveStudent.phone || liveStudent.emergencyContact?.phone || "";
  const cleanPhone = phone.replace(/\D/g, "");
  const waNumber = cleanPhone.startsWith("51") ? cleanPhone : cleanPhone ? `51${cleanPhone}` : "";
  const apoderado = liveStudent.family || liveStudent.emergencyContact?.name || "Apoderado titular";

  // Manejador: Registrar Abono en Caliente (ej. pago de las 7:50 PM)
  const handleSaveAbono = async () => {
    const amountNum = parseFloat(abonoAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Por favor ingrese un monto válido mayor a 0.");
      return;
    }

    setIsSavingAbono(true);
    try {
      const tuitionItem = financialAudit.items.find((i) => i.category === "mensualidad");
      const relatedInv = tuitionItem ? matchingInvoices.find((inv) => inv.id === tuitionItem.id) || matchingInvoices[0] : matchingInvoices[0];
      if (relatedInv) {
        recordPaymentAbono(
          relatedInv.id,
          amountNum,
          abonoMethod,
          abonoVoucher || `VOUCHER-${Date.now().toString().slice(-4)}`,
          abonoNote,
          "",
          abonoTime
        );
      } else {
        recordNewDirectAbono({
          familyOrStudent: liveStudent.name,
          concept: `Plan ${liveStudent.modality || "Regular"} — ${liveStudent.name}`,
          amount: tuitionItem?.totalAmount || liveStudent.planPrice || 297,
          amountPaid: amountNum,
          method: abonoMethod,
          voucherRef: abonoVoucher || `OP-${Date.now().toString().slice(-6)}`,
          note: abonoNote,
          paymentTime: abonoTime,
        });
      }

      toast.success(`Abono de S/ ${amountNum.toFixed(2)} registrado exitosamente en PostgreSQL.`, {
        description: `Saldo recalculado al instante para ${liveStudent.name}.`,
      });
      setShowAbonoForm(false);
      setAbonoVoucher("");
    } catch (err) {
      toast.error("Error al registrar el abono.");
      console.error(err);
    } finally {
      setIsSavingAbono(false);
    }
  };

  // Manejador: Modificar Asistencia en Caliente
  const handleToggleAttendance = (
    session: StudentSessionItem,
    newStatus: "presente" | "ausente" | "tarde" | "justificada" | "pendiente"
  ) => {
    setStudentSessionAttendance(
      liveStudent.name,
      session.lessonId,
      session.weekIndex,
      newStatus,
      session.notes || "",
      session.dateStr
    );
    toast.success(`Sesión ${session.sessionIndex} actualizada a: ${newStatus.toUpperCase()}`, {
      description: `Fecha ${session.dateStr} sincronizada con attendance_logs.`,
    });
  };

  // Manejador: Imprimir Documento A4
  const handlePrint = () => {
    window.print();
  };

  // Manejador: Descargar Ficha Estructurada (.md / .txt)
  const handleDownloadMarkdown = () => {
    const mdContent = generateStudentAuditMarkdown({
      student: liveStudent,
      sessions,
      liquidation,
      invoices: matchingInvoices,
      auditCode,
    });

    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const sanitizedName = liveStudent.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    link.href = url;
    link.download = `ficha_auditoria_${sanitizedName}_${auditCode}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Ficha de Auditoría descargada en formato Markdown estructurado (.md)", {
      description: "Compatible para lectura humana y análisis de modelos de lenguaje (LLM).",
    });
  };

  // Manejador: Copiar Formato LLM
  const handleCopyMarkdown = () => {
    const mdContent = generateStudentAuditMarkdown({
      student: liveStudent,
      sessions,
      liquidation,
      invoices: matchingInvoices,
      auditCode,
    });

    navigator.clipboard.writeText(mdContent);
    toast.success("Ficha estructurada copiada al portapapeles", {
      description: "Puedes pegarla directamente en un chat con un LLM, correo o reporte interno.",
    });
  };

  // Manejador: Enviar por WhatsApp con la explicación pedagógica y financiera oficial
  const handleSendWhatsApp = () => {
    if (!waNumber) {
      toast.warning("El alumno no cuenta con un número de WhatsApp registrado.");
      return;
    }

    const matItem = financialAudit.items.find((i) => i.category === "matricula");
    const planItem = financialAudit.items.find((i) => i.category === "mensualidad");
    const libItem = financialAudit.items.find((i) => i.category === "libros");

    const matText =
      matItem?.status === "exonerado"
        ? "Exonerada (S/ 0.00)"
        : `S/ ${matItem?.totalAmount.toFixed(2)} (${matItem?.status.toUpperCase()})`;

    const planText = planItem
      ? `S/ ${planItem.totalAmount.toFixed(2)} (Abonado: S/ ${planItem.amountPaid.toFixed(2)} · Saldo: *S/ ${planItem.remainingBalance.toFixed(2)}*)`
      : `S/ ${liquidation.planPrice.toFixed(2)}`;

    const libText =
      libItem?.status === "exonerado"
        ? "Exonerado / Digital (S/ 0.00)"
        : `S/ ${libItem?.totalAmount.toFixed(2)} (${libItem?.delivered ? "Entregado en sala" : "Pendiente de entrega"})`;

    const totalDeuda = financialAudit.totalSaldoPendiente;

    const message =
      `*VIBRA MUSIC STAFF — FICHA OFICIAL DE AUDITORÍA PEDAGÓGICA Y RENDICIÓN* 🎵\n` +
      `Código Oficial: \`${auditCode}\`\n\n` +
      `Estimada Familia *${apoderado}*, compartimos la rendición detallada de clases y estado de cuenta de *${liveStudent.name}*:\n\n` +
      `📌 *Filosofía Vibra Music:* En nuestra academia las clases no se pierden, se recuperan.\n\n` +
      (liquidation.hasInstrumentTransition
        ? `🔄 *TRANSICIÓN DE CURSO REALIZADA:*\n` +
          `• Etapa 1: *${liquidation.originalInstrument}* (Prof. Nathaly) — 5 clases de cuota (3 asistidas, 2 inasistencias los días 15/09 y 17/09).\n` +
          `• Inicio en *${liquidation.newInstrument}*: *Martes 29 de Setiembre de 2026* con Prof. Jeremy en Sala A (Mar y Jue 17:30).\n` +
          `• Clases regulares de cuota pendientes en Guitarra: *${liquidation.regularPendingInNew} clases* (Sesiones 6, 7 y 8).\n` +
          `• Créditos a recuperar en Guitarra: *+${liquidation.makeupCreditsMigrated} clases* (por las 2 faltas de Canto transferidas).\n` +
          `👉 *Total de clases que Sasha recibirá en Guitarra con Prof. Jeremy: ${liquidation.totalSessionsToDeliverInNew} clases* (3 regulares + 2 recuperaciones programables).\n\n`
        : `📊 *RESUMEN DE CLASES DEL CICLO:*\n` +
          `• Contratadas: ${liquidation.targetQuota} clases\n` +
          `• Asistidas: ${liquidation.attendedCount} clases\n` +
          `• Inasistencias (Créditos a favor): ${liquidation.missedCount} créditos\n` +
          `• Justificadas: ${liquidation.justifiedCount} clases\n` +
          `• Pendientes: ${liquidation.pendingCount} clases\n\n`) +
      `💳 *ESTADO FINANCIERO Y COMPROBANTES:*\n` +
      `• 1. Matrícula: ${matText}\n` +
      `• 2. Mensualidad (${liveStudent.instrument || 'Música'}): ${planText}\n` +
      `• 3. Libros y Material: ${libText}\n` +
      `👉 *Total Saldo Deuda: *S/ ${totalDeuda.toFixed(2)}*\n\n` +
      `*Veredicto Oficial:* ${liquidation.verdictText}\n\n` +
      `Quedamos a su disposición para coordinar los turnos de recuperación.\n_Dirección / Secretaría Vibra Music_`;

    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-primary/30 bg-background text-foreground shadow-2xl print:max-w-none print:max-h-none print:shadow-none print:border-none print:p-0 print:static print:transform-none print:overflow-visible print:w-full print:h-auto">
        {/* Estilos dedicados para exportación de alta fidelidad a PDF e Impresión A4 ejecutiva */}
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 12mm 12mm;
            }

            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              height: auto !important;
              min-height: 100% !important;
              overflow: visible !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* Ocultar la aplicación de fondo */
            body > *:not([data-radix-portal]) {
              display: none !important;
            }

            /* Ocultar el backdrop negro del diálogo Radix */
            div[data-radix-portal] > div[data-state]:not([role="dialog"]),
            div[data-radix-portal] > div[class*="bg-black"] {
              display: none !important;
            }

            /* Desactivar contenedores fijos y permitir paginación fluida en Chromium */
            div[data-radix-portal] {
              position: static !important;
              display: block !important;
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
            }

            div[role="dialog"] {
              position: static !important;
              transform: none !important;
              top: auto !important;
              left: auto !important;
              right: auto !important;
              bottom: auto !important;
              width: 100% !important;
              max-width: 100% !important;
              height: auto !important;
              max-height: none !important;
              overflow: visible !important;
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              display: block !important;
              background: #ffffff !important;
              color: #000000 !important;
            }

            div[role="dialog"] > button[class*="absolute"] {
              display: none !important;
            }

            /* Reglas de paginación de tablas para evitar corte horizontal de filas */
            table {
              width: 100% !important;
              border-collapse: collapse !important;
            }
            tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            thead {
              display: table-header-group !important;
            }
            tfoot {
              display: table-footer-group !important;
            }

            /* Salto estricto para inicio de Página 2 (Rendición Financiera y Liquidación) */
            .print-page-break {
              break-before: page !important;
              page-break-before: always !important;
              margin-top: 0 !important;
              padding-top: 4mm !important;
            }

            .print-avoid-break {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .overflow-x-auto, .overflow-hidden, .overflow-y-auto {
              overflow: visible !important;
            }
          }
        `}</style>

        {/* Cabecera Oficial del Reporte */}
        <div className="bg-muted/30 border-b border-border p-5 print:bg-white print:border-b-2 print:border-black print:p-0 print:pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-primary animate-pulse print:hidden" />
                <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2 print:text-black">
                  <span>VIBRA MUSIC STAFF</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono font-bold print:bg-black print:text-white">
                    OFICIAL
                  </span>
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 print:text-gray-700">
                Ficha Oficial de Auditoría Pedagógica, Asistencia y Rendición Financiera
              </p>
            </div>

            <div className="text-right flex flex-col sm:items-end font-mono">
              <span className="text-[11px] font-bold text-muted-foreground print:text-black">
                CÓDIGO: <span className="text-primary font-black print:text-black">{auditCode}</span>
              </span>
              <span className="text-[10px] text-muted-foreground print:text-gray-700">
                Emisión: {new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })}
              </span>
              <span className="hidden print:inline-block text-[9px] font-black text-gray-700 mt-0.5">
                PÁGINA 1 DE 2
              </span>
            </div>
          </div>

          {/* Badges de Estado Rápido */}
          <div className="flex flex-wrap items-center gap-2 mt-4 print:mt-2">
            <Badge
              variant="outline"
              className={
                liveStudent.status === "activo"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold print:border-emerald-600 print:text-emerald-800 print:bg-emerald-50"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/30 font-bold print:border-amber-600 print:text-amber-800 print:bg-amber-50"
              }
            >
              ESTADO: {liveStudent.status.toUpperCase()}
            </Badge>

            <Badge
              variant="outline"
              className={
                financialAudit.totalSaldoPendiente === 0
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold print:border-emerald-600 print:text-emerald-800 print:bg-emerald-50"
                  : "bg-rose-500/10 text-rose-600 border-rose-500/30 font-bold print:border-rose-600 print:text-rose-800 print:bg-rose-50"
              }
            >
              {financialAudit.totalSaldoPendiente === 0 ? "✓ PAGOS AL DÍA" : `⚠ DEUDA: S/\u00A0${financialAudit.totalSaldoPendiente.toFixed(2)}`}
            </Badge>

            <Badge
              variant="outline"
              className={
                liquidation.isCompleted
                  ? "bg-purple-500/10 text-purple-600 border-purple-500/30 font-bold print:border-purple-600 print:text-purple-800 print:bg-purple-50"
                  : "bg-blue-500/10 text-blue-600 border-blue-500/30 font-bold print:border-blue-600 print:text-blue-800 print:bg-blue-50"
              }
            >
              {liquidation.isCompleted ? "🏆 CICLO CULMINADO" : `⏳ EN CURSO (${liquidation.attendedCount}/${liquidation.targetQuota} asistidas)`}
            </Badge>

            {liquidation.hasInstrumentTransition && (
              <Badge variant="outline" className="bg-amber-500/15 text-amber-600 border-amber-500/40 font-bold print:border-amber-600 print:text-amber-900 print:bg-amber-50">
                🔄 TRANSICIÓN: {liquidation.originalInstrument} ➔ {liquidation.newInstrument}
              </Badge>
            )}

            {liquidation.makeupCreditsMigrated > 0 && (
              <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/40 font-bold print:border-emerald-600 print:text-emerald-900 print:bg-emerald-50">
                ✨ +{liquidation.makeupCreditsMigrated} CRÉDITOS A RECUPERAR
              </Badge>
            )}
          </div>
        </div>

        {/* Barra de Acciones en Caliente (Hot-Editing) - Solo visible en pantalla */}
        <div className="p-4 bg-muted/15 border-b border-border/80 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={showAbonoForm ? "default" : "outline"}
              className="text-xs font-bold gap-1.5"
              onClick={() => setShowAbonoForm(!showAbonoForm)}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              {showAbonoForm ? "Ocultar Formulario Abono" : "+ Registrar Abono Faltante"}
            </Button>

            <Button
              size="sm"
              variant={attendanceEditMode ? "secondary" : "outline"}
              className="text-xs font-bold gap-1.5"
              onClick={() => setAttendanceEditMode(!attendanceEditMode)}
            >
              <Edit3 className="h-3.5 w-3.5" />
              {attendanceEditMode ? "Finalizar Ajuste Asistencias" : "✏️ Ajustar Asistencias"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-bold gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
              onClick={handleSendWhatsApp}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-xs font-bold gap-1"
              onClick={handleCopyMarkdown}
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar LLM
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-xs font-bold gap-1"
              onClick={handleDownloadMarkdown}
            >
              <Download className="h-3.5 w-3.5" />
              Descargar .md
            </Button>

            <Button
              size="sm"
              variant="default"
              className="text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              onClick={handlePrint}
              title="Imprimir o Guardar como PDF en formato A4 ejecutivo (2 páginas)"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimir / PDF
            </Button>
          </div>
        </div>

        {/* Formulario Inline de Registro de Abono Faltante (Hot-Editing) */}
        {showAbonoForm && (
          <div className="p-4 bg-primary/5 border-b border-primary/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 print:hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                Registrar Abono Inmediato (Ej. Pago de las 7:50 PM)
              </span>
              <span className="text-[11px] text-muted-foreground">
                Se guardará en PostgreSQL (`invoices` y `payment_audit_logs`)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-[11px] font-bold">Monto del Abono (S/)</Label>
                <Input
                  type="number"
                  step="0.10"
                  value={abonoAmount}
                  onChange={(e) => setAbonoAmount(e.target.value)}
                  placeholder="Ej. 100.00"
                  className="h-8 text-xs font-mono font-bold mt-1"
                />
              </div>

              <div>
                <Label className="text-[11px] font-bold">Medio de Pago</Label>
                <Select value={abonoMethod} onValueChange={(v) => setAbonoMethod(v as PaymentMethod)}>
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yape">Yape</SelectItem>
                    <SelectItem value="Plin">Plin</SelectItem>
                    <SelectItem value="Transferencia">Transferencia Bancaria</SelectItem>
                    <SelectItem value="Efectivo">Efectivo en Caja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[11px] font-bold">N° Op. / Comprobante</Label>
                <Input
                  value={abonoVoucher}
                  onChange={(e) => setAbonoVoucher(e.target.value)}
                  placeholder="Ej. OP-983420"
                  className="h-8 text-xs font-mono mt-1"
                />
              </div>

              <div>
                <Label className="text-[11px] font-bold">Hora del Pago</Label>
                <Input
                  value={abonoTime}
                  onChange={(e) => setAbonoTime(e.target.value)}
                  placeholder="19:50"
                  className="h-8 text-xs font-mono mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Input
                value={abonoNote}
                onChange={(e) => setAbonoNote(e.target.value)}
                placeholder="Nota contable / motivo de regularización"
                className="h-8 text-xs max-w-md"
              />

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => setShowAbonoForm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleSaveAbono}
                  disabled={isSavingAbono}
                >
                  {isSavingAbono ? "Guardando..." : "Guardar y Actualizar Saldo"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Cuerpo del Reporte */}
        <div className="p-6 space-y-6 print:p-0 print:space-y-4">
          {/* 1. Tarjeta de Datos del Alumno y Contrato */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/20 border border-border p-4 rounded-xl text-xs print:grid-cols-3 print:bg-gray-50 print:border-gray-300 print:p-3 print:gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block print:text-gray-600">
                Alumno
              </span>
              <span className="text-sm font-black text-foreground print:text-black">{liveStudent.name}</span>
              <div className="text-[11px] text-muted-foreground mt-0.5 print:text-gray-700">
                {liveStudent.category || "JUNIOR"} {liveStudent.age ? `· ${liveStudent.age} años` : ""}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block print:text-gray-600">
                Apoderado & Contacto
              </span>
              <span className="font-bold text-foreground print:text-black">{apoderado}</span>
              <div className="text-[11px] text-muted-foreground font-mono mt-0.5 print:text-gray-700">
                {phone || "Sin teléfono"}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block print:text-gray-600">
                Plan & Horario Actual
              </span>
              <span className="font-bold text-foreground print:text-black">
                {liveStudent.instrument || "Guitarra"} · {liveStudent.modality || "Regular (8 clases / 45 min)"}
              </span>
              <div className="text-[11px] text-muted-foreground mt-0.5 print:text-gray-700">
                {liveStudent.teacher || "Jeremy"} ({liveStudent.room || "Sala A"})
              </div>
              <div className="text-[10px] font-mono text-muted-foreground mt-0.5 print:text-gray-600">
                Vigencia: {liveStudent.planStartDate || "2026-09-10"} a {liveStudent.planEndDate || "2026-10-09"}
              </div>
            </div>
          </div>

          {/* Banner Institucional de Filosofía Vibra Music y Transición de Instrumento */}
          {liquidation.hasInstrumentTransition && (
            <div className="bg-amber-500/10 border-2 border-amber-500/40 p-4 rounded-2xl text-xs space-y-3 print:bg-amber-50/60 print:border-amber-400 print:p-3 print:space-y-2 print-avoid-break">
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 print:hidden" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-sm text-foreground print:text-black">
                      Transición Formal de Curso: {liquidation.originalInstrument} ➔ {liquidation.newInstrument}
                    </span>
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border-amber-500/30 print:border-amber-600 print:text-amber-950 print:bg-amber-100">
                      Filosofía Oficial: "Las clases no se pierden, se recuperan"
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed print:text-gray-800">
                    El alumno cursó inicialmente <strong className="text-foreground print:text-black">{liquidation.originalInstrument}</strong> con Prof. Nathaly en Sala C ({liquidation.sessionsInOriginal} clases del ciclo lectivo: 3 asistidas y 2 inasistencias los días 15/09 y 17/09). A partir del <strong className="text-foreground print:text-black">Martes 29 de Setiembre de 2026</strong> inició formalmente en <strong className="text-foreground print:text-black">{liquidation.newInstrument}</strong> con <strong className="text-foreground print:text-black">{liveStudent.teacher || 'Prof. Jeremy'}</strong> en <strong className="text-foreground print:text-black">Sala A</strong> ({liquidation.transitionScheduleText || 'Mar y Jue 17:30'}).
                  </p>
                </div>
              </div>

              {/* Tarjetas de Desglose Matemático de Clases a Dictar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 print:grid-cols-3 print:gap-2">
                <div className="bg-background/90 border border-border p-3 rounded-xl flex items-center gap-3 print:bg-white print:border-gray-300 print:p-2">
                  <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 font-black text-sm flex items-center justify-center shrink-0 print:border print:border-blue-400 print:text-blue-800">
                    {liquidation.regularPendingInNew}
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block print:text-gray-600">
                      Clases Regulares Cuota
                    </span>
                    <span className="text-xs font-black text-foreground print:text-black">
                      Pendientes en {liquidation.newInstrument}
                    </span>
                    <span className="text-[10px] text-muted-foreground block print:text-gray-600">
                      Sesiones 6, 7 y 8 del mes
                    </span>
                  </div>
                </div>

                <div className="bg-background/90 border border-border p-3 rounded-xl flex items-center gap-3 print:bg-white print:border-gray-300 print:p-2">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 font-black text-sm flex items-center justify-center shrink-0 print:border print:border-emerald-400 print:text-emerald-800">
                    +{liquidation.makeupCreditsMigrated}
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block print:text-gray-600">
                      Créditos a Recuperar
                    </span>
                    <span className="text-xs font-black text-emerald-600 print:text-emerald-800">
                      Transferidos a {liquidation.newInstrument}
                    </span>
                    <span className="text-[10px] text-muted-foreground block print:text-gray-600">
                      Por inasistencias en {liquidation.originalInstrument}
                    </span>
                  </div>
                </div>

                <div className="bg-primary/10 border-2 border-primary/40 p-3 rounded-xl flex items-center gap-3 print:bg-primary/5 print:border-primary/60 print:p-2">
                  <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground font-black text-base flex items-center justify-center shrink-0 shadow print:border print:border-primary">
                    {liquidation.totalSessionsToDeliverInNew}
                  </div>
                  <div>
                    <span className="text-[10px] text-primary uppercase font-black block print:text-primary">
                      Total a Dictar en {liquidation.newInstrument}
                    </span>
                    <span className="text-xs font-black text-foreground print:text-black">
                      Con {liveStudent.teacher || 'Prof. Jeremy'} (Sala A)
                    </span>
                    <span className="text-[10px] text-muted-foreground block font-medium print:text-gray-600">
                      3 regulares + 2 recuperaciones
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Kardex Sesión por Sesión (1 a N) con Divisor Visual de Transición */}
          <div className="space-y-2 print-avoid-break">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5 print:text-black">
                <Calendar className="h-3.5 w-3.5 text-primary print:text-black" />
                Kardex Detallado de Clases ({sessions.length} Sesiones del Ciclo)
              </h3>
              {attendanceEditMode && (
                <span className="text-[10px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded animate-pulse print:hidden">
                  Modo Edición Activo: Haz clic en los botones de estado para corregir
                </span>
              )}
            </div>

            <div className="border border-border rounded-xl overflow-hidden overflow-x-auto shadow-sm print:border-black print:rounded-none print:shadow-none print:overflow-visible">
              <table className="w-full text-xs print:text-[10px]">
                <thead className="bg-muted/40 border-b border-border text-[10px] uppercase font-black text-muted-foreground print:bg-gray-100 print:text-black print:border-b-2 print:border-black">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10 whitespace-nowrap">N°</th>
                    <th className="py-2.5 px-3 text-left whitespace-nowrap">Fecha</th>
                    <th className="py-2.5 px-3 text-left whitespace-nowrap">Hora</th>
                    <th className="py-2.5 px-3 text-left whitespace-nowrap">Curso / Sala</th>
                    <th className="py-2.5 px-3 text-left whitespace-nowrap">Docente</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Estado Asistencia</th>
                    <th className="py-2.5 px-3 text-left">Observación / Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 print:divide-gray-300">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No hay sesiones registradas en el ciclo para este alumno.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((session, idx) => {
                      const prevSession = idx > 0 ? sessions[idx - 1] : null;
                      const isTransitionBoundary = prevSession && prevSession.instrument !== session.instrument;

                      return (
                        <Fragment key={`row-wrap-${session.id}`}>
                          {isTransitionBoundary && (
                            <tr key={`divider-${session.id}`} className="bg-amber-500/15 border-y-2 border-amber-500/40 print:bg-amber-100/70 print:border-amber-600">
                              <td colSpan={7} className="py-2.5 px-4 text-center print:py-1.5">
                                <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-black text-amber-700 dark:text-amber-300 print:text-amber-950">
                                  <span>🎸</span>
                                  <span>
                                    {session.dayShort} ({session.dateStr}): Inicio Oficial de Transición a {session.instrument} con Prof. {session.teacher} en {session.room}
                                  </span>
                                  <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-800 dark:text-amber-200 print:bg-amber-200 print:text-amber-950 print:border-amber-400">
                                    {liquidation.regularPendingInNew} clases regulares de cuota + {liquidation.makeupCreditsMigrated} créditos a recuperar = {liquidation.totalSessionsToDeliverInNew} clases totales en {session.instrument}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )}
                          <tr className="hover:bg-muted/20 transition-colors print:hover:bg-transparent">
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-muted-foreground print:text-black whitespace-nowrap">
                              {session.sessionIndex}
                            </td>

                            <td className="py-2.5 px-3 font-medium whitespace-nowrap">
                              <span className="font-bold text-foreground print:text-black">{session.dayShort}</span>
                              <span className="text-[10px] text-muted-foreground block font-mono print:text-gray-600">
                                {session.dateStr}
                              </span>
                            </td>

                            <td className="py-2.5 px-3 font-mono text-[11px] print:text-black whitespace-nowrap">
                              {session.time} - {session.timeEnd}
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="font-bold text-foreground print:text-black">{session.instrument}</span>
                              <span className="text-[10px] text-muted-foreground block print:text-gray-600">{session.room}</span>
                            </td>

                            <td className="py-2.5 px-3 font-medium text-foreground print:text-black whitespace-nowrap">
                              {session.teacher}
                            </td>

                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              {attendanceEditMode ? (
                                <div className="flex items-center justify-center gap-1 print:hidden">
                                  <button
                                    onClick={() => handleToggleAttendance(session, "presente")}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      session.status === "presente"
                                        ? "bg-emerald-600 text-white"
                                        : "bg-muted text-muted-foreground hover:bg-emerald-500/20"
                                    }`}
                                    title="Marcar Presente"
                                  >
                                    Pres
                                  </button>
                                  <button
                                    onClick={() => handleToggleAttendance(session, "tarde")}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      session.status === "tarde"
                                        ? "bg-amber-600 text-white"
                                        : "bg-muted text-muted-foreground hover:bg-amber-500/20"
                                    }`}
                                    title="Marcar Tardanza"
                                  >
                                    Tarde
                                  </button>
                                  <button
                                    onClick={() => handleToggleAttendance(session, "ausente")}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      session.status === "ausente"
                                        ? "bg-rose-600 text-white"
                                        : "bg-muted text-muted-foreground hover:bg-rose-500/20"
                                    }`}
                                    title="Marcar Falta"
                                  >
                                    Falta
                                  </button>
                                  <button
                                    onClick={() => handleToggleAttendance(session, "justificada")}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      session.status === "justificada"
                                        ? "bg-sky-600 text-white"
                                        : "bg-muted text-muted-foreground hover:bg-sky-500/20"
                                    }`}
                                    title="Marcar Justificada"
                                  >
                                    Just
                                  </button>
                                  <button
                                    onClick={() => handleToggleAttendance(session, "pendiente")}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      session.status === "pendiente"
                                        ? "bg-zinc-700 text-white"
                                        : "bg-muted text-muted-foreground hover:bg-zinc-500/20"
                                    }`}
                                    title="Sin marcar / Pendiente"
                                  >
                                    Pend
                                  </button>
                                </div>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] font-black uppercase ${
                                    session.status === "presente"
                                      ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 print:border-emerald-700 print:text-emerald-900 print:bg-emerald-50"
                                      : session.status === "tarde"
                                      ? "bg-amber-500/15 text-amber-600 border-amber-500/30 print:border-amber-700 print:text-amber-900 print:bg-amber-50"
                                      : session.status === "ausente"
                                      ? "bg-rose-500/15 text-rose-600 border-rose-500/30 print:border-rose-700 print:text-rose-900 print:bg-rose-50"
                                      : session.status === "justificada"
                                      ? "bg-sky-500/15 text-sky-600 border-sky-500/30 print:border-blue-700 print:text-blue-900 print:bg-blue-50"
                                      : "bg-muted text-muted-foreground border-border print:border-gray-400 print:text-gray-700 print:bg-gray-100"
                                  }`}
                                >
                                  {session.status === "presente"
                                    ? "✓ PRESENTE"
                                    : session.status === "tarde"
                                    ? "⏰ TARDE"
                                    : session.status === "ausente"
                                    ? "✗ FALTA"
                                    : session.status === "justificada"
                                    ? "🔵 JUSTIFICADA"
                                    : "PENDIENTE"}
                                </Badge>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-[11px] text-muted-foreground print:text-gray-800 print:py-1.5">
                              {session.isMakeup && (
                                <span className="text-primary font-bold mr-1.5 print:text-black">
                                  [Recuperación{session.recoveringLessonDate ? ` de ${session.recoveringLessonDate}` : ""}]
                                </span>
                              )}
                              <div className="space-y-0.5">
                                {session.status === "ausente" && session.makeupCreditTransferred ? (
                                  <div className="text-[10px] font-bold text-amber-700 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 inline-flex items-center gap-1 print:border-amber-500 print:text-amber-950 print:bg-amber-50">
                                    <span>🔄</span>
                                    <span>Pasa a Crédito en {session.targetInstrument || "Guitarra"} (Prof. {session.teacher || "Jeremy"})</span>
                                  </div>
                                ) : (
                                  <span>{session.notes || "Clase regular de calendario"}</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Bitácora de Pagos y Abonos (Matriz Oficial: 1. Matrícula · 2. Mensualidad · 3. Libros) */}
          <div className="space-y-2 print-page-break print:space-y-3">
            {/* Sub-cabecera Oficial de Continuación en Página 2 (Visible exclusivamente en Impresión / PDF) */}
            <div className="hidden print:flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs tracking-tight text-black">VIBRA MUSIC STAFF</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-black text-white font-mono font-bold">
                    OFICIAL
                  </span>
                  <span className="text-[10px] font-bold text-gray-700 uppercase">
                    — Rendición Financiera, Matriz de Pagos y Liquidación
                  </span>
                </div>
                <p className="text-[9px] text-gray-600 mt-0.5">
                  Alumno: <strong>{liveStudent.name}</strong> · Plan: <strong>{liveStudent.instrument || "Guitarra"} ({liveStudent.modality || "Regular 8 clases"})</strong>
                </p>
              </div>
              <div className="text-right font-mono text-[9px] text-gray-700">
                <span>CÓDIGO: <strong className="text-black">{auditCode}</strong></span>
                <span className="block font-bold text-black mt-0.5">PÁGINA 2 DE 2</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5 print:text-black">
                <CreditCard className="h-3.5 w-3.5 text-primary print:text-black" />
                Historial de Pagos y Comprobantes Registrados (Matriz Oficial: 1. Matrícula · 2. Mensualidad · 3. Libros)
              </h3>
              <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary print:border-black print:text-black">
                {financialAudit.totalSaldoPendiente === 0 ? "✓ 100% Cancelado" : `Saldo Deuda Total: S/\u00A0${financialAudit.totalSaldoPendiente.toFixed(2)}`}
              </Badge>
            </div>

            <div className="border border-border rounded-xl overflow-hidden overflow-x-auto shadow-sm print:border-black print:rounded-none print:shadow-none print:overflow-visible">
              <table className="w-full text-xs print:text-[10px]">
                <thead className="bg-muted/40 border-b border-border text-[10px] uppercase font-black text-muted-foreground print:bg-gray-100 print:text-black print:border-b-2 print:border-black">
                  <tr>
                    <th className="py-2.5 px-3 text-left w-32 whitespace-nowrap">Rubro / Item</th>
                    <th className="py-2.5 px-3 text-left whitespace-nowrap">Concepto Oficial</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Monto Total</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Abonado</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Saldo Restante</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Estado</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Método</th>
                    <th className="py-2.5 px-3 text-left whitespace-nowrap">Referencia / Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 print:divide-gray-300">
                  {financialAudit.items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors print:hover:bg-transparent">
                      <td className="py-2.5 px-3 font-bold text-foreground print:text-black whitespace-nowrap">
                        {item.categoryLabel}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-foreground print:text-black">{item.concept}</span>
                        {item.notes && (
                          <span className="text-[10px] text-muted-foreground block font-mono print:text-gray-600">
                            {item.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground print:text-black whitespace-nowrap">
                        S/&nbsp;{item.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 print:text-emerald-800 whitespace-nowrap">
                        S/&nbsp;{item.amountPaid.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 print:text-rose-800 whitespace-nowrap">
                        S/&nbsp;{item.remainingBalance.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            item.status === "pagado"
                              ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 print:border-emerald-700 print:text-emerald-900 print:bg-emerald-50"
                              : item.status === "exonerado"
                              ? "bg-sky-500/15 text-sky-600 border-sky-500/30 print:border-sky-700 print:text-sky-900 print:bg-sky-50"
                              : item.status === "parcial"
                              ? "bg-amber-500/15 text-amber-600 border-amber-500/30 print:border-amber-700 print:text-amber-900 print:bg-amber-50"
                              : "bg-rose-500/15 text-rose-600 border-rose-500/30 print:border-rose-700 print:text-rose-900 print:bg-rose-50"
                          }`}
                        >
                          {item.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="text-[11px] text-muted-foreground print:text-black">{item.paymentMethod}</span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] font-mono text-muted-foreground print:text-black whitespace-nowrap">
                        {item.voucherRef}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/50 border-t-2 border-border font-black text-xs print:bg-gray-100 print:border-black">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3 uppercase tracking-wider text-foreground print:text-black whitespace-nowrap">
                      Total Consolidado de Cartera
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground print:text-black whitespace-nowrap">
                      S/&nbsp;{financialAudit.totalFacturado.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-600 print:text-emerald-800 whitespace-nowrap">
                      S/&nbsp;{financialAudit.totalCobrado.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-600 print:text-rose-800 whitespace-nowrap">
                      S/&nbsp;{financialAudit.totalSaldoPendiente.toFixed(2)}
                    </td>
                    <td colSpan={3} className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className={financialAudit.totalSaldoPendiente === 0 ? "text-emerald-600 font-bold print:text-emerald-800" : "text-rose-600 font-bold print:text-rose-800"}>
                        {financialAudit.totalSaldoPendiente === 0 ? "✓ PAGOS AL DÍA" : `DEUDA: S/\u00A0${financialAudit.totalSaldoPendiente.toFixed(2)}`}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 4. Tarjetas de Liquidación Oficial del Ciclo */}
          <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl space-y-4 print:bg-gray-50 print:border-gray-300 print:p-4 print:space-y-3 print-avoid-break">
            <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5 print:text-black">
              <ShieldCheck className="h-4 w-4 text-primary print:text-black" />
              Cuadro de Liquidación Oficial del Ciclo
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center print:grid-cols-5 print:gap-2">
              <div className="bg-background border border-border p-3 rounded-xl print:bg-white print:border-gray-300 print:p-2">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block print:text-gray-600">
                  Contratadas
                </span>
                <span className="text-lg font-black text-foreground print:text-black">
                  {liquidation.targetQuota}
                </span>
              </div>

              <div className="bg-background border border-border p-3 rounded-xl print:bg-white print:border-gray-300 print:p-2">
                <span className="text-[10px] text-emerald-600 uppercase font-bold block print:text-emerald-800">
                  Asistidas
                </span>
                <span className="text-lg font-black text-emerald-600 print:text-emerald-800">
                  {liquidation.attendedCount}
                </span>
              </div>

              <div className="bg-background border border-border p-3 rounded-xl print:bg-white print:border-gray-300 print:p-2">
                <span className="text-[10px] text-rose-600 uppercase font-bold block print:text-rose-800">
                  Inasistencias
                </span>
                <span className="text-lg font-black text-rose-600 print:text-rose-800">
                  {liquidation.missedCount}
                </span>
              </div>

              <div className="bg-background border border-border p-3 rounded-xl print:bg-white print:border-gray-300 print:p-2">
                <span className="text-[10px] text-sky-600 uppercase font-bold block print:text-sky-800">
                  Créditos a Favor
                </span>
                <span className="text-lg font-black text-sky-600 print:text-sky-800">
                  {liquidation.makeupCreditsAvailable}
                </span>
              </div>

              <div className="bg-background border border-border p-3 rounded-xl print:bg-white print:border-gray-300 print:p-2">
                <span className="text-[10px] text-amber-600 uppercase font-bold block print:text-amber-800">
                  Pendientes
                </span>
                <span className="text-lg font-black text-amber-600 print:text-amber-800">
                  {liquidation.pendingCount}
                </span>
              </div>
            </div>

            <div className="bg-background/80 border border-border p-3.5 rounded-xl flex items-center justify-between text-xs print:bg-white print:border-gray-300 print:p-2.5">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground print:text-black">Veredicto Oficial Institucional:</span>
                <p className="text-muted-foreground text-[11px] print:text-gray-700">{liquidation.verdictText}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-muted-foreground uppercase block font-bold print:text-gray-600">Saldo Total</span>
                <span className={`text-base font-black font-mono whitespace-nowrap ${financialAudit.totalSaldoPendiente === 0 ? "text-emerald-600 print:text-emerald-800" : "text-rose-600 print:text-rose-800"}`}>
                  S/&nbsp;{financialAudit.totalSaldoPendiente.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Casillas de Firmas Oficiales (Visibles exclusivamente para Impresión / PDF) */}
          <div className="hidden print:grid grid-cols-2 gap-12 pt-10 mt-2 text-center text-xs print-avoid-break">
            <div className="border-t-2 border-black pt-2">
              <p className="font-bold text-black">Dirección / Secretaría Vibra Music</p>
              <p className="text-[10px] text-gray-600">Firma y Sello Oficial</p>
            </div>

            <div className="border-t-2 border-black pt-2">
              <p className="font-bold text-black">Padre de Familia / Apoderado</p>
              <p className="text-[10px] text-gray-600">Firma de Conformidad</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
