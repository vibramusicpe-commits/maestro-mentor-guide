/**
 * ================================================================
 * student-audit-report-dialog.tsx — Ficha Oficial de Auditoría y
 * Rendición de Cuentas por Alumno (Previsualización, Edición en Caliente
 * y Exportación Dual Humano/LLM)
 * ================================================================
 * 
 * Cumplimiento de ADRs:
 * - ADR-0099, ADR-0100: Cuotas de 8 clases (Regular) / 4 clases (Intensivo).
 * - ADR-0103, ADR-0106: Mutación segura en PostgreSQL Insforge.
 * - ADR-0131: Transición de instrumento y vigencias.
 * - Soporte de edición en caliente (hot editing) de abonos y asistencias.
 * - Exportación para humanos (A4 con firmas) y para LLMs (Markdown estructurado).
 */

import { useState, useMemo } from "react";
import { useAppStore, type AdminStudent, type PaymentMethod } from "@/store/app-store";
import {
  computeStudentCycleSessions,
  computeStudentCycleLiquidation,
  generateStudentAuditMarkdown,
  type StudentSessionItem,
} from "@/lib/kardex-calculator";
import { isMatchingStudentName } from "@/lib/student-matching";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CreditCard,
  User,
  Music,
  FileText,
  DollarSign,
  HelpCircle,
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

  // Cálculo de sesiones del ciclo
  const sessions: StudentSessionItem[] = useMemo(() => {
    if (!liveStudent) return [];
    return computeStudentCycleSessions({
      student: liveStudent,
      allSchedule,
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth(),
    });
  }, [liveStudent, allSchedule]);

  // Cálculo de liquidación pedagógica y financiera
  const liquidation = useMemo(() => {
    if (!liveStudent) return null;
    return computeStudentCycleLiquidation(liveStudent, sessions);
  }, [liveStudent, sessions]);

  // Recibos asociados al alumno
  const matchingInvoices = useMemo(() => {
    if (!liveStudent) return [];
    return invoices.filter((inv) => {
      return (
        isMatchingStudentName(liveStudent.name, inv.student || "") ||
        (inv.concept && isMatchingStudentName(liveStudent.name, inv.concept.split("—")[1]?.trim() || "")) ||
        (liveStudent.invoices && liveStudent.invoices.some((i) => i.id === inv.id))
      );
    });
  }, [liveStudent, invoices]);

  if (!liveStudent || !liquidation) return null;

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
      const relatedInv = matchingInvoices[0];
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
          amount: liveStudent.planPrice || 297,
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
      invoices,
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
      invoices,
      auditCode,
    });

    navigator.clipboard.writeText(mdContent);
    toast.success("Ficha estructurada copiada al portapapeles", {
      description: "Puedes pegarla directamente en un chat con un LLM, correo o reporte interno.",
    });
  };

  // Manejador: Enviar por WhatsApp
  const handleSendWhatsApp = () => {
    if (!waNumber) {
      toast.warning("El alumno no cuenta con un número de WhatsApp registrado.");
      return;
    }

    const message = `*VIBRA MUSIC STAFF — FICHA DE AUDITORÍA PEDAGÓGICA Y FINANCIERA* 🎵\n` +
      `Código Oficial: \`${auditCode}\`\n\n` +
      `Estimada Familia *${apoderado}*, compartimos la rendición de clases y estado de cuenta de *${liveStudent.name}*:\n\n` +
      `📌 *Curso:* ${liveStudent.instrument || "Música"} (${liveStudent.modality || "Regular"})\n` +
      `📅 *Vigencia:* ${liveStudent.planStartDate || "Inicio"} a ${liveStudent.planEndDate || "Fin"}\n` +
      `👨‍🏫 *Docente:* ${liveStudent.teacher || "Por asignar"} (${liveStudent.room || "Sala A"})\n\n` +
      `📊 *RESUMEN DE CLASES DEL CICLO:*\n` +
      `• Contratadas: ${liquidation.targetQuota} clases\n` +
      `• Asistidas: ${liquidation.attendedCount} clases\n` +
      `• Inasistencias: ${liquidation.missedCount} clases\n` +
      `• Justificadas: ${liquidation.justifiedCount} clases\n` +
      `• Pendientes: ${liquidation.pendingCount} clases\n\n` +
      `💳 *ESTADO DE PAGOS:*\n` +
      `• Plan: S/ ${liquidation.planPrice.toFixed(2)}\n` +
      `• Total Abonado: S/ ${liquidation.amountPaid.toFixed(2)}\n` +
      `• Saldo Pendiente: *S/ ${liquidation.remainingBalance.toFixed(2)}*\n\n` +
      `*Veredicto Oficial:* ${liquidation.verdictText}\n\n` +
      `Quedamos a su disposición para cualquier consulta adicional.\n_Dirección / Secretaría Vibra Music_`;

    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-primary/30 bg-background text-foreground shadow-2xl print:max-w-none print:max-h-none print:shadow-none print:border-none print:p-0">
        {/* Cabecera del Reporte */}
        <div className="bg-muted/30 border-b border-border p-5 print:bg-white print:border-b-2 print:border-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-primary animate-pulse print:hidden" />
                <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                  <span>VIBRA MUSIC STAFF</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono font-bold">
                    OFICIAL
                  </span>
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ficha Oficial de Auditoría Pedagógica, Asistencia y Rendición Financiera
              </p>
            </div>

            <div className="text-right flex flex-col sm:items-end">
              <span className="text-[11px] font-mono font-bold text-muted-foreground">
                CÓDIGO: <span className="text-primary font-black">{auditCode}</span>
              </span>
              <span className="text-[10px] text-muted-foreground">
                Emisión: {new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Badges de Estado Rápido */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Badge
              variant="outline"
              className={
                liveStudent.status === "activo"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/30 font-bold"
              }
            >
              ESTADO: {liveStudent.status.toUpperCase()}
            </Badge>

            <Badge
              variant="outline"
              className={
                liquidation.remainingBalance === 0
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold"
                  : "bg-rose-500/10 text-rose-600 border-rose-500/30 font-bold"
              }
            >
              {liquidation.remainingBalance === 0 ? "✓ PAGOS AL DÍA" : `⚠ DEUDA: S/ ${liquidation.remainingBalance.toFixed(2)}`}
            </Badge>

            <Badge
              variant="outline"
              className={
                liquidation.isCompleted
                  ? "bg-purple-500/10 text-purple-600 border-purple-500/30 font-bold"
                  : "bg-blue-500/10 text-blue-600 border-blue-500/30 font-bold"
              }
            >
              {liquidation.isCompleted ? "🏆 CICLO CULMINADO" : `⏳ EN CURSO (${liquidation.attendedCount}/${liquidation.targetQuota})`}
            </Badge>

            {liquidation.hasInstrumentTransition && (
              <Badge variant="outline" className="bg-amber-500/15 text-amber-600 border-amber-500/40 font-bold animate-pulse">
                🔄 TRANSICIÓN DE CURSO REALIZADA
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
              className="text-xs font-bold gap-1 bg-primary text-primary-foreground"
              onClick={handlePrint}
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimir A4
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
        <div className="p-6 space-y-6">
          {/* 1. Tarjeta de Datos del Alumno y Contrato */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/20 border border-border p-4 rounded-xl text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Alumno
              </span>
              <span className="text-sm font-black text-foreground">{liveStudent.name}</span>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {liveStudent.category || "JUNIOR"} {liveStudent.age ? `· ${liveStudent.age} años` : ""}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Apoderado & Contacto
              </span>
              <span className="font-bold text-foreground">{apoderado}</span>
              <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                {phone || "Sin teléfono"}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Plan & Horario
              </span>
              <span className="font-bold text-foreground">
                {liveStudent.instrument || "Piano"} · {liveStudent.modality || "Regular"}
              </span>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {liveStudent.teacher || "Por asignar"} ({liveStudent.room || "Sala A"})
              </div>
              <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                Vigencia: {liveStudent.planStartDate || "N/A"} a {liveStudent.planEndDate || "N/A"}
              </div>
            </div>
          </div>

          {/* Banner de Transición de Instrumento (si aplica, ej. Sasha Contreras) */}
          {liquidation.hasInstrumentTransition && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-xs flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-foreground block">
                  Transición de Instrumento a Mitad de Ciclo:
                </span>
                <p className="text-muted-foreground text-[11px]">
                  El alumno cursó inicialmente <strong className="text-foreground">{liquidation.originalInstrument}</strong> ({liquidation.sessionsInOriginal} clases impartidas) y pasó formalmente a <strong className="text-foreground">{liquidation.newInstrument}</strong> a partir del {liquidation.transitionDate || "26 de Agosto"} ({liquidation.sessionsInNew} clases programadas).
                </p>
              </div>
            </div>
          )}

          {/* 2. Kardex Sesión por Sesión (1 a N) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Kardex Detallado de Clases ({sessions.length} Sesiones del Ciclo)
              </h3>
              {attendanceEditMode && (
                <span className="text-[10px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded animate-pulse">
                  Modo Edición Activo: Haz clic en los botones de estado para corregir
                </span>
              )}
            </div>

            <div className="border border-border rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 border-b border-border text-[10px] uppercase font-black text-muted-foreground">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10">N°</th>
                    <th className="py-2.5 px-3 text-left">Fecha</th>
                    <th className="py-2.5 px-3 text-left">Hora</th>
                    <th className="py-2.5 px-3 text-left">Curso / Sala</th>
                    <th className="py-2.5 px-3 text-left">Docente</th>
                    <th className="py-2.5 px-3 text-center">Estado Asistencia</th>
                    <th className="py-2.5 px-3 text-left">Observación / Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No hay sesiones registradas en el ciclo para este alumno.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-muted-foreground">
                          {session.sessionIndex}
                        </td>

                        <td className="py-2.5 px-3 font-medium">
                          <span className="font-bold text-foreground">{session.dayShort}</span>
                          <span className="text-[10px] text-muted-foreground block font-mono">
                            {session.dateStr}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {session.time} - {session.timeEnd}
                        </td>

                        <td className="py-2.5 px-3">
                          <span className="font-bold text-foreground">{session.instrument}</span>
                          <span className="text-[10px] text-muted-foreground block">{session.room}</span>
                        </td>

                        <td className="py-2.5 px-3 font-medium text-foreground">
                          {session.teacher}
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          {attendanceEditMode ? (
                            <div className="flex items-center justify-center gap-1">
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
                                  ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                                  : session.status === "tarde"
                                  ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                                  : session.status === "ausente"
                                  ? "bg-rose-500/15 text-rose-600 border-rose-500/30"
                                  : session.status === "justificada"
                                  ? "bg-sky-500/15 text-sky-600 border-sky-500/30"
                                  : "bg-muted text-muted-foreground border-border"
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

                        <td className="py-2.5 px-3 text-[11px] text-muted-foreground">
                          {session.isMakeup && (
                            <span className="text-primary font-bold mr-1.5">
                              [Recuperación{session.recoveringLessonDate ? ` de ${session.recoveringLessonDate}` : ""}]
                            </span>
                          )}
                          {session.notes || "Clase regular de calendario"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Bitácora de Pagos y Abonos */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              Historial de Pagos y Comprobantes Registrados
            </h3>

            <div className="border border-border rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 border-b border-border text-[10px] uppercase font-black text-muted-foreground">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Fecha Registro</th>
                    <th className="py-2.5 px-3 text-left">Recibo / Concepto</th>
                    <th className="py-2.5 px-3 text-right">Precio Plan</th>
                    <th className="py-2.5 px-3 text-right">Abonado</th>
                    <th className="py-2.5 px-3 text-right">Saldo Restante</th>
                    <th className="py-2.5 px-3 text-center">Método</th>
                    <th className="py-2.5 px-3 text-left">Referencia / Voucher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {matchingInvoices.length === 0 ? (
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        {liveStudent.joinedAt || "2026-08-01"}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-foreground">
                        Plan {liveStudent.modality || "Regular"} — Mensualidad
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        S/ {liquidation.planPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                        S/ {liquidation.amountPaid.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                        S/ {liquidation.remainingBalance.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge variant="outline" className="text-[10px]">Yape</Badge>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground text-[11px]">
                        REGISTRO-INICIAL
                      </td>
                    </tr>
                  ) : (
                    matchingInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {inv.dueDate || "2026-08-31"}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-foreground">
                          {inv.concept}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          S/ {(inv.amount || 297).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                          S/ {(inv.amountPaid || 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                          S/ {(inv.remainingBalance ?? Math.max(0, (inv.amount || 297) - (inv.amountPaid || 0))).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant="outline" className="text-[10px]">
                            {inv.paymentMethod || "Yape"}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground text-[11px]">
                          {inv.paymentLogs?.[0]?.voucherRef || "PAGO-DIRECTO"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Tarjetas de Liquidación Oficial del Ciclo */}
          <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Cuadro de Liquidación Oficial del Ciclo
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="bg-background border border-border p-3 rounded-xl">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                  Contratadas
                </span>
                <span className="text-lg font-black text-foreground">
                  {liquidation.targetQuota}
                </span>
              </div>

              <div className="bg-background border border-border p-3 rounded-xl">
                <span className="text-[10px] text-emerald-600 uppercase font-bold block">
                  Asistidas
                </span>
                <span className="text-lg font-black text-emerald-600">
                  {liquidation.attendedCount}
                </span>
              </div>

              <div className="bg-background border border-border p-3 rounded-xl">
                <span className="text-[10px] text-rose-600 uppercase font-bold block">
                  Inasistencias
                </span>
                <span className="text-lg font-black text-rose-600">
                  {liquidation.missedCount}
                </span>
              </div>

              <div className="bg-background border border-border p-3 rounded-xl">
                <span className="text-[10px] text-sky-600 uppercase font-bold block">
                  Justificadas
                </span>
                <span className="text-lg font-black text-sky-600">
                  {liquidation.justifiedCount}
                </span>
              </div>

              <div className="bg-background border border-border p-3 rounded-xl">
                <span className="text-[10px] text-amber-600 uppercase font-bold block">
                  Pendientes
                </span>
                <span className="text-lg font-black text-amber-600">
                  {liquidation.pendingCount}
                </span>
              </div>
            </div>

            <div className="bg-background/80 border border-border p-3.5 rounded-xl flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground">Veredicto Oficial Institucional:</span>
                <p className="text-muted-foreground text-[11px]">{liquidation.verdictText}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-muted-foreground uppercase block font-bold">Saldo Total</span>
                <span className={`text-base font-black font-mono ${liquidation.remainingBalance === 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  S/ {liquidation.remainingBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Casillas de Firmas Oficiales (Visibles solo para Impresión o PDF) */}
          <div className="hidden print:grid grid-cols-2 gap-12 pt-16 text-center text-xs">
            <div className="border-t-2 border-black pt-2">
              <p className="font-bold">Dirección / Secretaría Vibra Music</p>
              <p className="text-[10px] text-gray-600">Firma y Sello Oficial</p>
            </div>

            <div className="border-t-2 border-black pt-2">
              <p className="font-bold">Padre de Familia / Apoderado</p>
              <p className="text-[10px] text-gray-600">Firma de Conformidad</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
