import { useState, useMemo } from "react";
import { toast } from "sonner";
import { RotateCw, Calendar, CheckCircle2, ShieldCheck, CreditCard, DollarSign } from "lucide-react";
import { useAppStore, type AdminStudent, type PaymentMethod } from "@/store/app-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface RenewStudentCycleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  student: AdminStudent | null;
}

export function RenewStudentCycleDialog({
  isOpen,
  onClose,
  student,
}: RenewStudentCycleDialogProps) {
  const renewStudentCycle = useAppStore((s) => s.renewStudentCycle);

  // Calcular fechas iniciales
  const defaultStartDate = useMemo(() => {
    if (!student?.planEndDate) return new Date().toISOString().slice(0, 10);
    const [y, m, d] = student.planEndDate.split("-").map(Number);
    if (!y || !m || !d) return new Date().toISOString().slice(0, 10);
    const nextD = new Date(y, m - 1, d + 1);
    if (nextD.getDay() === 0) nextD.setDate(nextD.getDate() + 1); // Saltear domingo
    return `${nextD.getFullYear()}-${String(nextD.getMonth() + 1).padStart(2, "0")}-${String(nextD.getDate()).padStart(2, "0")}`;
  }, [student]);

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [planPrice, setPlanPrice] = useState<number>(student?.planPrice || 297);
  const [paymentMethod, setPaymentMethod] = useState<string>(student?.paymentMethod || "Yape");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Actualizar cuando cambie el alumno
  useMemo(() => {
    if (student) {
      setStartDate(defaultStartDate);
      setPlanPrice(student.planPrice || 297);
      setPaymentMethod(student.paymentMethod || "Yape");
      setNotes(`Renovación mensual regular (${student.instrument || "Música"} - Prof. ${student.teacher || ""})`);
    }
  }, [student, defaultStartDate]);

  const is1x = (student?.modality || "").includes("1x");
  const durationMonths = is1x ? 2 : 1;

  const calculatedEndDate = useMemo(() => {
    if (!startDate) return "";
    const [y, m, d] = startDate.split("-").map(Number);
    if (!y || !m || !d) return "";
    const endD = new Date(y, (m - 1) + durationMonths, d);
    endD.setDate(endD.getDate() - 1);
    return `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, "0")}-${String(endD.getDate()).padStart(2, "0")}`;
  }, [startDate, durationMonths]);

  if (!student) return null;

  const handleConfirm = async () => {
    if (!startDate) {
      toast.error("Por favor ingrese la fecha de inicio del nuevo ciclo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await renewStudentCycle(student.id, {
        newStartDate: startDate,
        planPrice: Number(planPrice) || 297,
        paymentMethod,
        notes,
      });

      if (success) {
        toast.success(`🎉 ¡Ciclo renovado con éxito para ${student.name}!`, {
          description: `Nuevo ciclo: ${startDate} al ${calculatedEndDate}. Recibo generado en Facturación.`,
        });
        onClose();
      } else {
        toast.error("No se pudo completar la renovación. Inténtalo nuevamente.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error al procesar la renovación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg border-[#F47B20]/40 bg-card shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground text-lg font-black">
            <RotateCw className="h-5 w-5 text-[#F47B20] animate-spin-slow" />
            Renovar Ciclo Mensual
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Apertura de nuevo periodo lectivo para <strong>{student.name}</strong> ({student.instrument} · {student.teacher}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Ficha Resumen de Alumno */}
          <div className="p-3 rounded-xl border border-border bg-muted/40 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-foreground">{student.name}</p>
                <p className="text-muted-foreground">{student.family} · {student.modality}</p>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 font-bold">
                ✓ Clases Cumplidas
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/50 text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">Ciclo Previo: </span>
                {student.planStartDate || "N/A"} al {student.planEndDate || "N/A"}
              </div>
              <div>
                <span className="font-semibold text-foreground">Saldo Créditos: </span>
                0 pendientes (Limpio)
              </div>
            </div>
          </div>

          {/* Formulario de Renovación */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="renew-start" className="text-xs font-bold text-foreground">
                Fecha Inicio Nuevo Ciclo
              </Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="renew-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-8 text-xs h-9 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                Fecha Fin Calculada ({durationMonths} mes{durationMonths > 1 ? "es" : ""})
              </Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="date"
                  value={calculatedEndDate}
                  disabled
                  className="pl-8 text-xs h-9 bg-muted/60 font-semibold text-muted-foreground"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="renew-price" className="text-xs font-bold text-foreground">
                Monto de Mensualidad (S/)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="renew-price"
                  type="number"
                  value={planPrice}
                  onChange={(e) => setPlanPrice(Number(e.target.value))}
                  className="pl-8 text-xs h-9 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="renew-method" className="text-xs font-bold text-foreground">
                Medio de Pago Comprometido
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="renew-method" className="text-xs h-9">
                  <SelectValue placeholder="Medio de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yape">Yape</SelectItem>
                  <SelectItem value="Plin">Plin</SelectItem>
                  <SelectItem value="Transferencia BCP">Transferencia BCP</SelectItem>
                  <SelectItem value="Transferencia BBVA">Transferencia BBVA</SelectItem>
                  <SelectItem value="Efectivo">Efectivo en Recepción</SelectItem>
                  <SelectItem value="Culqi">Culqi (Tarjeta Online)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Aviso Institucional */}
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed">
            <p className="font-bold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              Garantía de Renovación Vibra Music
            </p>
            Al confirmar, se extenderá la vigencia en la base de datos de PostgreSQL, se generará el recibo en estado <strong>Pendiente</strong> en Facturación y se preservará su horario habitual en sala con el profesor asignado.
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={onClose} className="text-xs">
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !startDate}
            onClick={handleConfirm}
            className="gap-1.5 font-bold text-xs bg-[#F47B20] text-black hover:bg-[#F47B20]/90 shadow-md"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isSubmitting ? "Renovando..." : "Confirmar Renovación y Generar Recibo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
