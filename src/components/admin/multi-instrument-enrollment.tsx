/**
 * ================================================================
 * multi-instrument-enrollment.tsx — REGISTRO 2 (ADR-0188)
 * ================================================================
 *
 * Formulario para alumnos que contratan **2 instrumentos** con pagos
 * fraccionados (ej. paga S/ 400 el día 1 y S/ 200 en la 2da clase).
 *
 * RELACIÓN CON EL REGISTRO 1:
 *   - Registro 1 (el de siempre) queda INTACTO: ideal para 1 instrumento
 *     y planes establecidos.
 *   - Registro 2 (este) es la vía flexible para 2 instrumentos.
 *
 * REGLAS INNEGOCIABLES:
 *   - Cada instrumento es una MATRÍCULA REAL: su propia matrícula, plan,
 *     docente y abono. NUNCA se fusionan (ADR-0186).
 *   - Ambos registros quedan VINCULADOS por `personGroupId` y comparten
 *     `familyId` (una sola cuenta para el apoderado).
 *   - El excedente de un instrumento NO se aplica solo al otro: va como
 *     **saldo a favor de la familia** (decisión de Dirección).
 *   - Cada abono lleva su propia nota libre, porque secretaría anota en su
 *     lenguaje ("pagó en la 2da clase", "abono parcial 50").
 *   - CERO `ALTER TABLE`: todo se guarda en `emergency_contact` JSONB.
 */

import { useMemo, useState } from "react";
import { AlertCircle, Layers, Plus, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAppStore, type AdminStudent } from "@/store/app-store";
import { detectSamePersonCandidates, describeInstrumentBundle } from "@/lib/student-person-group";
import { toIsoDate } from "@/lib/informes/utils";

const INSTRUMENTS = [
  "Piano",
  "Piano Infantil",
  "Violín",
  "Guitarra",
  "Batería",
  "Canto",
  "Estimulación Musical",
];

const PAYMENT_METHODS = ["Yape / Plin", "Efectivo", "Transferencia Bancaria", "Tarjeta de Débito"];

interface InstrumentSlot {
  instrument: string;
  planPrice: number;
  amountPaid: number;
  note: string;
}

interface MultiInstrumentEnrollmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function emptySlot(instrument: string): InstrumentSlot {
  return { instrument, planPrice: 250, amountPaid: 0, note: "" };
}

/** Abono individual con fecha y nota (historial flexible). */
interface PaymentEntry {
  id: string;
  slotIndex: number;
  amount: number;
  date: string;
  method: string;
  note: string;
}

export function MultiInstrumentEnrollment({ open, onOpenChange }: MultiInstrumentEnrollmentProps) {
  const addNewStudent = useAppStore((s) => s.addNewStudent);
  const updateStudentDetails = useAppStore((s) => s.updateStudentDetails);
  const adminStudents = useAppStore((s) => s.adminStudents);

  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [guardian, setGuardian] = useState("");
  const [phone, setPhone] = useState("");
  const [family, setFamily] = useState("");
  const [enrollmentDate, setEnrollmentDate] = useState(() => toIsoDate(new Date()));
  const [method, setMethod] = useState<string>(PAYMENT_METHODS[0] ?? "Yape / Plin");
  const [slots, setSlots] = useState<InstrumentSlot[]>([
    emptySlot("Piano"),
    emptySlot("Canto"),
  ]);
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [saving, setSaving] = useState(false);

  // Aviso de alumno ya existente (misma fecha + apoderado) — informa, no bloquea.
  const duplicates = useMemo(() => {
    if (!birthdate || !guardian.trim()) return { activos: [], historicos: [] };
    return detectSamePersonCandidates(
      { birthdate, emergencyContact: { name: guardian } } as Partial<AdminStudent>,
      adminStudents,
    );
  }, [birthdate, guardian, adminStudents]);

  const totals = useMemo(() => {
    const contratado = slots.reduce((sum, slot) => sum + (slot.planPrice || 0), 0);
    const abonado = slots.reduce((sum, slot) => sum + (slot.amountPaid || 0), 0);
    const excedente = slots.reduce(
      (sum, slot) => sum + Math.max(0, (slot.amountPaid || 0) - (slot.planPrice || 0)),
      0,
    );
    const pendiente = slots.reduce(
      (sum, slot) => sum + Math.max(0, (slot.planPrice || 0) - (slot.amountPaid || 0)),
      0,
    );
    return { contratado, abonado, excedente, pendiente, saldoFavorFamilia: excedente };
  }, [slots]);

  const resetForm = () => {
    setName("");
    setBirthdate("");
    setGuardian("");
    setPhone("");
    setFamily("");
    setEnrollmentDate(toIsoDate(new Date()));
    setMethod(PAYMENT_METHODS[0] ?? "Yape / Plin");
    setSlots([emptySlot("Piano"), emptySlot("Canto")]);
    setPayments([]);
  };

  const updateSlot = (index: number, patch: Partial<InstrumentSlot>) => {
    setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  };

  const addPayment = (slotIndex: number) => {
    const fallbackMethod = PAYMENT_METHODS[0] as string;
    setPayments((prev) => [
      ...prev,
      {
        id: `pay-${Date.now()}-${prev.length}`,
        slotIndex,
        amount: 0,
        date: toIsoDate(new Date()),
        method: method || fallbackMethod,
        note: "",
      },
    ]);
  };

  const updatePayment = (id: string, patch: Partial<PaymentEntry>) => {
    setPayments((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Escribe el nombre del alumno");
      return;
    }
    if (slots.length < 2) {
      toast.error("Este registro es para 2 instrumentos. Usa el Registro 1 para uno solo.");
      return;
    }
    if (slots.some((slot) => !slot.instrument)) {
      toast.error("Cada instrumento debe tener un nombre");
      return;
    }

    setSaving(true);
    try {
      const personGroupId = crypto.randomUUID();
      const label = describeInstrumentBundle(slots.map((slot) => ({ instrument: slot.instrument })));
      const sharedFamily = family.trim() || `Familia ${name.trim()}`;
      const baseFamilyId = crypto.randomUUID();

      slots.forEach((slot, index) => {
        const slotPayments = payments.filter((entry) => entry.slotIndex === index && entry.amount > 0);
        const paidTotal = slotPayments.reduce((sum, entry) => sum + entry.amount, 0);
        const abonado = paidTotal > 0 ? paidTotal : slot.amountPaid || 0;
        const balance = Math.max(0, (slot.planPrice || 0) - abonado);

        addNewStudent({
          name: index === 0 ? name.trim() : `${name.trim()} (${slot.instrument})`,
          family: sharedFamily,
          familyId: baseFamilyId,
          phone: phone.trim(),
          email: "",
          instrument: slot.instrument,
          level: "Principiante",
          teacher: "",
          age: 0,
          ageCategory: "JUNIOR" as AdminStudent["ageCategory"],
          status: "activo",
          planType: "Mensual" as AdminStudent["planType"],
          planPrice: slot.planPrice,
          amountPaid: abonado,
          balance,
          birthdate: birthdate || "15 de Agosto",
          fatherName: "",
          fatherPhone: "",
          motherName: guardian.trim(),
          motherPhone: phone.trim(),
          emergencyContact: {
            name: guardian.trim() || name.trim(),
            phone: phone.trim(),
            relation: "Tutor Legal",
          },
          paymentMethod: method,
          enrollmentDate,
          planStartDate: enrollmentDate,
          matriculaType: "Promo Demo (S/ 30)" as AdminStudent["matriculaType"],
          packUtilesCost: 67,
          packUtilesAmountPaid: 0,
          packUtilesStatus: "pendiente",
          packUtilesDelivered: false,
          personGroupId,
          personGroupLabel: label,
          teacherNote: slot.note,
        } as AdminStudent);

        // Notas de cada abono: se guardan en el historial del alumno.
        if (slotPayments.length > 0) {
          const history = slotPayments
            .map((entry) => `${entry.date} · S/ ${entry.amount.toFixed(2)} · ${entry.method}${entry.note ? ` · ${entry.note}` : ""}`)
            .join("\n");
          toast.success(`Abonos registrados para ${slot.instrument}`, { description: history });
        }
      });

      toast.success(`✅ Matrícula multi-instrumento creada: ${label}`, {
        description: `${name.trim()} · ${totals.excedente > 0 ? `Saldo a favor de la familia: S/ ${totals.excedente.toFixed(2)}` : "Sin excedente"}`,
      });

      resetForm();
      onOpenChange(false);
    } catch {
      toast.error("No se pudo registrar. Revisa los datos e intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-black">
            <Layers className="h-4 w-4 text-primary" />
            Matrícula Multi-Instrumento
          </DialogTitle>
          <DialogDescription className="text-xs">
            Para alumnos que contratan <strong>2 instrumentos</strong> con pagos fraccionados.
            Cada instrumento conserva su propia matrícula y su propio abono.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Datos del alumno */}
          <div className="rounded-xl border border-border bg-background p-3 space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">
              Datos del alumno y apoderado
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-[11px] font-semibold text-muted-foreground">
                Nombre del alumno *
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-8 text-xs" placeholder="Ej. Luciana Campo" />
              </label>
              <label className="text-[11px] font-semibold text-muted-foreground">
                Fecha de nacimiento
                <Input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="mt-1 h-8 text-xs" />
              </label>
              <label className="text-[11px] font-semibold text-muted-foreground">
                Apoderado / Tutor
                <Input value={guardian} onChange={(e) => setGuardian(e.target.value)} className="mt-1 h-8 text-xs" placeholder="Ej. Olivia Norma Conco" />
              </label>
              <label className="text-[11px] font-semibold text-muted-foreground">
                Teléfono
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 h-8 text-xs" placeholder="Ej. 934 164 251" />
              </label>
              <label className="text-[11px] font-semibold text-muted-foreground">
                Familia (una sola cuenta)
                <Input value={family} onChange={(e) => setFamily(e.target.value)} className="mt-1 h-8 text-xs" placeholder="Ej. Familia Campo Ruiz" />
              </label>
              <label className="text-[11px] font-semibold text-muted-foreground">
                Fecha de matrícula
                <Input type="date" value={enrollmentDate} onChange={(e) => setEnrollmentDate(e.target.value)} className="mt-1 h-8 text-xs" />
              </label>
            </div>

            {duplicates.activos.length > 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-2 text-[11px] text-amber-900 dark:text-amber-100">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                <span>
                  Ya existe un alumno con esta fecha y apoderado:{" "}
                  <strong>{duplicates.activos.map((s) => s.name.trim()).join(", ")}</strong>.
                  Si es la misma persona, vincúlalos después desde la ficha en lugar de duplicar.
                </span>
              </div>
            )}
          </div>

          {/* Instrumentos */}
          {slots.map((slot, index) => {
            const balance = Math.max(0, (slot.planPrice || 0) - (slot.amountPaid || 0));
            const excedente = Math.max(0, (slot.amountPaid || 0) - (slot.planPrice || 0));
            const slotPayments = payments.filter((entry) => entry.slotIndex === index);

            return (
              <div key={index} className="rounded-xl border border-border bg-background p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">
                    Instrumento {index + 1}
                  </p>
                  {slots.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setSlots((prev) => prev.filter((_, i) => i !== index))}
                      className="text-[11px] font-bold text-rose-600"
                    >
                      Quitar
                    </button>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Instrumento
                    <select
                      value={slot.instrument}
                      onChange={(e) => updateSlot(index, { instrument: e.target.value })}
                      className="mt-1 h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                    >
                      {INSTRUMENTS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Costo del plan
                    <Input
                      type="number"
                      min={0}
                      value={slot.planPrice}
                      onChange={(e) => updateSlot(index, { planPrice: parseFloat(e.target.value) || 0 })}
                      className="mt-1 h-8 text-xs"
                    />
                  </label>
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Abonado
                    <Input
                      type="number"
                      min={0}
                      value={slot.amountPaid}
                      onChange={(e) => updateSlot(index, { amountPaid: parseFloat(e.target.value) || 0 })}
                      className="mt-1 h-8 text-xs"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                  {balance === 0 && excedente === 0 && (
                    <Badge className="border border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      ✓ Cancelado (S/ {(slot.planPrice || 0).toFixed(2)})
                    </Badge>
                  )}
                  {balance > 0 && (
                    <Badge className="border border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300">
                      ⚠️ Debe S/ {balance.toFixed(2)}
                    </Badge>
                  )}
                  {excedente > 0 && (
                    <Badge className="border border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-300">
                      ➕ Excedente S/ {excedente.toFixed(2)} a favor de la familia
                    </Badge>
                  )}
                </div>

                <label className="block text-[11px] font-semibold text-muted-foreground">
                  Nota de este instrumento
                  <Textarea
                    value={slot.note}
                    onChange={(e) => updateSlot(index, { note: e.target.value })}
                    className="mt-1 min-h-[52px] text-xs"
                    placeholder="Ej. Entra a piano con Fernando, canto con Nathaly"
                  />
                </label>

                {/* Abonos fraccionados con nota por cada uno */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                      Abonos de este instrumento
                    </p>
                    <button
                      type="button"
                      onClick={() => addPayment(index)}
                      className="inline-flex min-h-[28px] items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2 text-[10px] font-bold text-primary"
                    >
                      <Plus className="h-3 w-3" />
                      Agregar abono
                    </button>
                  </div>

                  {slotPayments.length === 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      Sin abonos detallados. Usa el campo "Abonado" arriba o agrega pagos por clase.
                    </p>
                  )}

                  {slotPayments.map((entry) => (
                    <div key={entry.id} className="grid gap-1.5 rounded-lg border border-border/70 bg-muted/30 p-2 sm:grid-cols-4">
                      <label className="text-[10px] font-semibold text-muted-foreground">
                        Fecha
                        <Input type="date" value={entry.date} onChange={(e) => updatePayment(entry.id, { date: e.target.value })} className="mt-0.5 h-7 text-[11px]" />
                      </label>
                      <label className="text-[10px] font-semibold text-muted-foreground">
                        Monto
                        <Input type="number" min={0} value={entry.amount} onChange={(e) => updatePayment(entry.id, { amount: parseFloat(e.target.value) || 0 })} className="mt-0.5 h-7 text-[11px]" />
                      </label>
                      <label className="text-[10px] font-semibold text-muted-foreground">
                        Método
                        <select value={entry.method} onChange={(e) => updatePayment(entry.id, { method: e.target.value })} className="mt-0.5 h-7 w-full rounded-md border border-input bg-background px-1 text-[11px]">
                          {PAYMENT_METHODS.map((option) => (<option key={option} value={option}>{option}</option>))}
                        </select>
                      </label>
                      <label className="text-[10px] font-semibold text-muted-foreground">
                        Nota
                        <Input value={entry.note} onChange={(e) => updatePayment(entry.id, { note: e.target.value })} className="mt-0.5 h-7 text-[11px]" placeholder="Ej. 2da clase" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => setSlots((prev) => [...prev, emptySlot("Violín")])}
            className="inline-flex min-h-[36px] w-full items-center justify-center gap-1 rounded-xl border border-dashed border-border text-[11px] font-bold text-muted-foreground hover:bg-muted"
          >
            <Plus className="h-3 w-3" />
            Agregar un tercer instrumento
          </button>

          {/* Resumen financiero familiar */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-primary">
              <Wallet className="h-3.5 w-3.5" />
              Resumen familiar
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
              <div>
                <p className="text-muted-foreground">Contratado</p>
                <p className="font-mono font-black text-foreground">S/ {totals.contratado.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Abonado</p>
                <p className="font-mono font-black text-emerald-600 dark:text-emerald-400">S/ {totals.abonado.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pendiente</p>
                <p className="font-mono font-black text-rose-600">S/ {totals.pendiente.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">A favor</p>
                <p className="font-mono font-black text-sky-600 dark:text-sky-400">S/ {totals.saldoFavorFamilia.toFixed(2)}</p>
              </div>
            </div>
            {totals.excedente > 0 && (
              <p className="mt-2 text-[10px] text-muted-foreground">
                El excedente <strong>no se aplica automáticamente</strong> al otro instrumento:
                queda como saldo a favor de la familia.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
              Cancelar
            </Button>
            <Button type="button" size="sm" onClick={handleSubmit} disabled={saving} className="text-xs font-bold">
              {saving ? "Guardando…" : "Registrar matrícula"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
