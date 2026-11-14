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
 *   - La **MATRÍCULA es institucional: se paga UNA sola vez por familia**
 *     (corrección de Dirección, ADR-0188 §10). No se cobra por instrumento.
 *   - Cada instrumento conserva su propio plan, docente, **libro** y abono.
 *     NUNCA se fusionan (ADR-0186).
 *   - Ambos registros quedan VINCULADOS por `personGroupId` y comparten
 *     `familyId` (una sola cuenta para el apoderado).
 *   - El excedente de un instrumento NO se aplica solo al otro: va como
 *     **saldo a favor de la familia** (decisión de Dirección).
 *   - Cada abono lleva su propia nota libre, porque secretaría anota en su
 *     lenguaje ("pagó en la 2da clase", "abono parcial 50").
 *   - CERO `ALTER TABLE`: todo se guarda en `emergency_contact` JSONB.
 */

import { useMemo, useState } from "react";
import { AlertCircle, BookOpen, CheckCircle2, Layers, Plus, Wallet } from "lucide-react";
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
import { useAppStore, type AdminStudent, type MatriculaType } from "@/store/app-store";
import { detectSamePersonCandidates, describeInstrumentBundle } from "@/lib/student-person-group";
import { studentCode, personCode } from "@/lib/student-code";
import { toIsoDate } from "@/lib/informes/utils";
import { TEACHER_IDS, resolveTeacherNameById } from "@/lib/services/teacher-resolver";
import { INSTRUMENT_SPECIALISTS, instrumentFamily } from "@/lib/informes/instrument-specialists";

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
  /** UUID del docente (TEACHER_IDS). Se guarda por UUID, NUNCA por nombre. */
  teacherId: string;
  /** Pack de útiles/libro de ESTE instrumento (uno por curso). */
  packUtilesCost: number;
  packUtilesAmountPaid: number;
}

/**
 * Matrícula institucional (ADR-0122): se cobra UNA vez por familia.
 * Se registra sobre el primer instrumento y los demás quedan exonerados
 * para que la ficha financiera y el recibo no la dupliquen.
 */
const MATRICULA_OPTIONS: Array<{ value: MatriculaType; label: string; cost: number }> = [
  { value: "Promo Demo (S/ 30)", label: "Promo Demo (S/ 30)", cost: 30 },
  { value: "Regular (S/ 120)", label: "Matrícula Regular (S/ 120)", cost: 120 },
  { value: "Exonerada", label: "Exonerada (S/ 0)", cost: 0 },
];

const BOOK_COST = 67;

interface MultiInstrumentEnrollmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** ADR-0189 — abrir el Kardex de una matrícula recién creada. */
  onOpenKardex?: (student: AdminStudent) => void;
}

/**
 * ADR-0189 — Resultado visible al terminar el registro.
 * Hoy el modal se cerraba sin dejar rastro y secretaría no sabía qué se creó.
 */
interface EnrollmentConfirmation {
  label: string;
  studentName: string;
  personGroupId: string;
  members: Array<{
    id: string;
    name: string;
    instrument: string;
    teacher: string;
    code: string;
    student: AdminStudent;
  }>;
  contratado: number;
  abonado: number;
  pendiente: number;
  saldoFavor: number;
}

/**
 * Docentes seleccionables, resueltos desde la fuente única `TEACHER_IDS`.
 *
 * IMPORTANTE: se guarda el **UUID**, nunca el nombre. Si un docente renuncia
 * y entra otro, se cambia el nombre asociado al UUID en el resolver y todas
 * las fichas siguen apuntando correctamente. Escribir "Nathaly" a mano en una
 * nota dejaría el dato mintiendo para siempre.
 */
const TEACHER_OPTIONS = (
  ["JEREMY", "FERNANDO", "NATHALY", "ROCIO", "KARLA", "SERGIO", "FABRICIO"] as const
).map((key) => ({
  id: TEACHER_IDS[key] as string,
  name: resolveTeacherNameById(TEACHER_IDS[key]) || key,
}));

/** Docente especialista sugerido para el instrumento (ADR-0179). */
function suggestedTeacherFor(instrument: string): string {
  const family = instrumentFamily(instrument);
  return INSTRUMENT_SPECIALISTS[family]?.teacherId ?? "";
}

function emptySlot(instrument: string): InstrumentSlot {
  return {
    instrument,
    planPrice: 250,
    amountPaid: 0,
    note: "",
    teacherId: suggestedTeacherFor(instrument),
    packUtilesCost: BOOK_COST,
    packUtilesAmountPaid: 0,
  };
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

export function MultiInstrumentEnrollment({ open, onOpenChange, onOpenKardex }: MultiInstrumentEnrollmentProps) {
  const addNewStudent = useAppStore((s) => s.addNewStudent);
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

  /**
   * ADR-0194 — Modo de distribución del plan.
   *
   * "completo": Cada instrumento tiene sus propias 8 clases (modo original).
   *   → packageTotalSessions = 8 por ficha.
   *
   * "compartido": Un solo Plan Regular (8 clases) dividido en 4+4.
   *   El alumno viene 4 veces/mes; en cada visita asiste 45 min a un
   *   instrumento y 45 min al otro (de corrido, salas distintas).
   *   → packageTotalSessions = 4 por ficha.
   *   → El precio del plan se registra en el Instrumento 1 (el que
   *     cobra). El Instrumento 2 queda con planPrice = 0 y nota
   *     explicativa para que facturación no lo duplique.
   *   → Cada docente ve exactamente 4 sesiones en su Kardex y Kiosco.
   */
  const [planMode, setPlanMode] = useState<"completo" | "compartido">("completo");
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [saving, setSaving] = useState(false);
  // ADR-0189 — confirmación visible con códigos y acceso a cada Kardex.
  const [confirmation, setConfirmation] = useState<EnrollmentConfirmation | null>(null);

  // 🎓 Matrícula institucional: UNA sola por familia, sin importar cuántos
  // instrumentos contrate el alumno (corrección de Dirección, ADR-0188 §10).
  const [matriculaType, setMatriculaType] = useState<MatriculaType>("Promo Demo (S/ 30)");
  const [matriculaAmountPaid, setMatriculaAmountPaid] = useState(30);

  const matriculaCost =
    MATRICULA_OPTIONS.find((option) => option.value === matriculaType)?.cost ?? 0;

  // Aviso de alumno ya existente (misma fecha + apoderado) — informa, no bloquea.
  const duplicates = useMemo(() => {
    if (!birthdate || !guardian.trim()) return { activos: [], historicos: [] };
    return detectSamePersonCandidates(
      { birthdate, emergencyContact: { name: guardian } } as Partial<AdminStudent>,
      adminStudents,
    );
  }, [birthdate, guardian, adminStudents]);

  const totals = useMemo(() => {
    // La matrícula suma UNA sola vez; el plan y el libro sí son por instrumento.
    const contratado =
      slots.reduce((sum, slot) => sum + (slot.planPrice || 0), 0) +
      slots.reduce((sum, slot) => sum + (slot.packUtilesCost || 0), 0) +
      matriculaCost;

    const abonado =
      slots.reduce((sum, slot) => sum + (slot.amountPaid || 0), 0) +
      slots.reduce((sum, slot) => sum + (slot.packUtilesAmountPaid || 0), 0) +
      (matriculaAmountPaid || 0);

    const excedente = slots.reduce(
      (sum, slot) => sum + Math.max(0, (slot.amountPaid || 0) - (slot.planPrice || 0)),
      0,
    );
    const pendiente =
      slots.reduce(
        (sum, slot) =>
          sum +
          Math.max(0, (slot.planPrice || 0) - (slot.amountPaid || 0)) +
          Math.max(0, (slot.packUtilesCost || 0) - (slot.packUtilesAmountPaid || 0)),
        0,
      ) + Math.max(0, matriculaCost - (matriculaAmountPaid || 0));
    return { contratado, abonado, excedente, pendiente, saldoFavorFamilia: excedente };
  }, [slots, matriculaCost, matriculaAmountPaid]);

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
    setMatriculaType("Promo Demo (S/ 30)");
    setMatriculaAmountPaid(30);
    setPlanMode("completo");
  };

  const updateSlot = (index: number, patch: Partial<InstrumentSlot>) => {
    setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  };

  const addPayment = (slotIndex: number) => {
    const fallbackMethod = PAYMENT_METHODS[0] as string;
    const slot = slots[slotIndex];
    // Se precarga el SALDO PENDIENTE del plan: en la mayoría de casos se paga
    // completo y así no hay que escribir el monto cada vez.
    const pending = slot ? Math.max(0, (slot.planPrice || 0) - (slot.amountPaid || 0)) : 0;
    setPayments((prev) => [
      ...prev,
      {
        id: `pay-${Date.now()}-${prev.length}`,
        slotIndex,
        amount: pending,
        date: toIsoDate(new Date()),
        method: method || fallbackMethod,
        note: "",
      },
    ]);
  };

  /** Aplica rápidamente un monto al abono y sincroniza el total del instrumento. */
  const applyQuickPayment = (slotIndex: number, entryId: string, amount: number) => {
    updatePayment(entryId, { amount });
    const slotPayments = payments
      .filter((entry) => entry.slotIndex === slotIndex)
      .map((entry) => (entry.id === entryId ? amount : entry.amount));
    const total = slotPayments.reduce((sum, value) => sum + (value || 0), 0);
    updateSlot(slotIndex, { amountPaid: total });
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

        // ADR-0194: En modo "compartido" (Plan 4+4) el precio del plan solo se
        // registra en el Instrumento 1 para que facturación no lo duplique.
        // El Instrumento 2 lleva planPrice = 0 con nota explicativa.
        const effectivePlanPrice =
          planMode === "compartido" && index > 0 ? 0 : slot.planPrice;
        const balance = Math.max(0, (effectivePlanPrice || 0) - abonado);

        // ADR-0194: cuota por ficha = 4 en modo compartido, 8 en modo completo.
        const sessionsPerSlot = planMode === "compartido" ? 4 : 8;

        addNewStudent({
          name: index === 0 ? name.trim() : `${name.trim()} (${slot.instrument})`,
          family: sharedFamily,
          familyId: baseFamilyId,
          phone: phone.trim(),
          email: "",
          instrument: slot.instrument,
          level: "Principiante",
          modality: "Regular (8 clases / 45 min)" as AdminStudent["modality"],
          teacher: slot.teacherId ? (resolveTeacherNameById(slot.teacherId) || "") : "",
          age: 0,
          ageCategory: "JUNIOR" as AdminStudent["ageCategory"],
          status: "activo",
          planType: "Mensual" as AdminStudent["planType"],
          planPrice: effectivePlanPrice,
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
            matriculaScope: "familia",
            matriculaAmountPaid: index === 0 ? Math.max(0, matriculaAmountPaid || 0) : 0,
            matriculaFamilyNote:
              index === 0
                ? `Matrícula institucional única de la familia (${matriculaType}).`
                : "Matrícula institucional ya cubierta por el primer instrumento de la familia.",
            // ADR-0194: traza el modo para que futuras consultas sean transparentes.
            sharedPlanType: planMode === "compartido" ? "compartido_4+4" : undefined,
          },
          paymentMethod: method,
          enrollmentDate,
          planStartDate: enrollmentDate,
          matriculaType: index === 0 ? matriculaType : "Exonerada",
          packUtilesCost: slot.packUtilesCost,
          packUtilesAmountPaid: slot.packUtilesAmountPaid,
          packUtilesStatus:
            slot.packUtilesAmountPaid >= slot.packUtilesCost
              ? "cancelado"
              : slot.packUtilesAmountPaid > 0
                ? "parcial"
                : "pendiente",
          packUtilesDelivered: slot.packUtilesAmountPaid >= slot.packUtilesCost,
          personGroupId,
          personGroupLabel: label,
          teacherNote:
            planMode === "compartido"
              ? `Plan Compartido 4+4: ${slots[0]?.instrument ?? "Instr. 1"} (Sesiones 1–4) + ${slots[1]?.instrument ?? "Instr. 2"} (Sesiones 1–4). ${slot.note}`.trim()
              : slot.note,
          // ADR-0194: cuota explícita → el Kardex proyecta exactamente N sesiones.
          packageTotalSessions: sessionsPerSlot,
        } as unknown as AdminStudent);

        // Notas de cada abono: se guardan en el historial del alumno.
        if (slotPayments.length > 0) {
          const history = slotPayments
            .map((entry) => `${entry.date} · S/ ${entry.amount.toFixed(2)} · ${entry.method}${entry.note ? ` · ${entry.note}` : ""}`)
            .join("\n");
          toast.success(`Abonos registrados para ${slot.instrument}`, { description: history });
        }
      });

      // ADR-0189 — Confirmación visible: hoy el modal se cerraba sin rastro.
      // Se leen del store las matrículas REALES recién creadas (UUID definitivo)
      // para mostrar su código y abrir cada Kardex en un clic.
      const created = useAppStore
        .getState()
        .adminStudents.filter((st) => st.personGroupId === personGroupId);

      const abonadoReal =
        slots.reduce((sum, slot, index) => {
          const slotPayments = payments.filter((entry) => entry.slotIndex === index && entry.amount > 0);
          const paidTotal = slotPayments.reduce((partial, entry) => partial + entry.amount, 0);
          const abonado = paidTotal > 0 ? paidTotal : slot.amountPaid || 0;
          return sum + abonado + (slot.packUtilesAmountPaid || 0);
        }, 0) + Math.max(0, matriculaAmountPaid || 0);

      const saldoFavor = slots.reduce(
        (sum, slot) => sum + Math.max(0, (slot.amountPaid || 0) - (slot.planPrice || 0)),
        0,
      );

      setConfirmation({
        label,
        studentName: name.trim(),
        personGroupId,
        members: created.map((st) => ({
          id: st.id,
          name: st.name,
          instrument: st.instrument,
          teacher: st.teacher,
          code: studentCode(st.id),
          student: st,
        })),
        contratado: totals.contratado,
        abonado: abonadoReal,
        pendiente: Math.max(0, totals.contratado - abonadoReal),
        saldoFavor,
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
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-black">
            <Layers className="h-4 w-4 text-primary" />
            Matrícula Multi-Instrumento
          </DialogTitle>
          <DialogDescription className="text-xs">
            Para alumnos que contratan <strong>2 instrumentos</strong> con pagos fraccionados.
            La <strong>matrícula se paga una sola vez por familia</strong>; cada instrumento
            conserva su plan, su libro y su abono.
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

          {/* 🎓 Matrícula institucional: UNA sola vez por familia (ADR-0188 §10).
              No se cobra por instrumento: se registra sobre el primer registro y
              los demás quedan exonerados para no duplicarla en la ficha. */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <p className="text-[11px] font-black uppercase tracking-wide text-primary">
                🎓 Matrícula institucional
              </p>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                Se paga 1 sola vez por familia
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <label className="text-[11px] font-semibold text-muted-foreground">
                Tipo de matrícula
                <select
                  value={matriculaType}
                  onChange={(e) => {
                    const value = e.target.value as MatriculaType;
                    const cost = MATRICULA_OPTIONS.find((option) => option.value === value)?.cost ?? 0;
                    setMatriculaType(value);
                    setMatriculaAmountPaid(cost);
                  }}
                  className="mt-1 h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                >
                  {MATRICULA_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-[11px] font-semibold text-muted-foreground">
                Costo de matrícula
                <Input
                  type="number"
                  value={matriculaCost}
                  readOnly
                  disabled
                  className="mt-1 h-8 text-xs font-bold"
                />
              </label>
              <label className="text-[11px] font-semibold text-muted-foreground">
                Abonado a matrícula
                <Input
                  type="number"
                  min={0}
                  value={matriculaAmountPaid}
                  onChange={(e) => setMatriculaAmountPaid(parseFloat(e.target.value) || 0)}
                  className="mt-1 h-8 text-xs"
                />
              </label>
            </div>
            {matriculaCost - matriculaAmountPaid > 0 ? (
              <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                Saldo de matrícula: S/ {(matriculaCost - matriculaAmountPaid).toFixed(2)} (se registra sobre el primer instrumento)
              </p>
            ) : (
              <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                ✓ Matrícula familiar cubierta. Los demás instrumentos quedan exonerados de matrícula.
              </p>
            )}
          </div>

          {/* ADR-0194 — Selector de distribución del plan */}
          <div className="rounded-xl border border-border bg-background p-3 space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">
              🎵 Distribución del Plan
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPlanMode("completo")}
                className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                  planMode === "completo"
                    ? "border-primary bg-primary/10 font-bold text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                <span className="block font-black">Dos Planes Completos</span>
                <span className="text-[10px]">
                  Cada instrumento tiene sus propias 8 clases al mes. Total: 16 clases.
                  (Ej. Luciana: Piano 8 + Canto 8)
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPlanMode("compartido")}
                className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                  planMode === "compartido"
                    ? "border-orange-500 bg-orange-500/10 font-bold text-orange-700 dark:text-orange-300"
                    : "border-border text-muted-foreground hover:border-orange-400/50"
                }`}
              >
                <span className="block font-black">🔗 Plan Regular Compartido (4+4)</span>
                <span className="text-[10px]">
                  Un solo Plan Regular dividido en 2 instrumentos. El alumno viene
                  4 veces/mes: 45 min Instrumento 1 → 45 min Instrumento 2 de corrido.
                  Cada Kardex proyecta exactamente 4 sesiones.
                </span>
              </button>
            </div>
            {planMode === "compartido" && (
              <div className="rounded-lg border border-orange-400/40 bg-orange-400/10 px-2.5 py-2 text-[10px] text-orange-900 dark:text-orange-100 space-y-1">
                <p className="font-bold">📋 Reglas del Plan Compartido (ADR-0194):</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>El <strong>precio del plan se registra solo en el Instrumento 1</strong>. El Instrumento 2 queda con precio S/ 0 para no duplicar en facturación.</li>
                  <li>Cada docente verá <strong>4 sesiones</strong> en su Kiosco y Kardex.</li>
                  <li>El <strong>libro (S/ 67) sí es por instrumento</strong>: se cobran 2 libros (con flexibilidad de pago según secretaría).</li>
                  <li>La <strong>matrícula es UNA sola</strong> por familia.</li>
                  <li>Agenda: registra ambas clases el mismo día, horas contiguas, salas distintas.</li>
                </ul>
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
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">
                      Instrumento {index + 1}
                    </p>
                    {/* ADR-0194: Badge de cuota según modo */}
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                      planMode === "compartido"
                        ? "bg-orange-500/15 text-orange-700 dark:text-orange-300"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {planMode === "compartido" ? "4 sesiones / mes" : "8 sesiones / mes"}
                    </span>
                  </div>
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

                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Instrumento
                    <select
                      value={slot.instrument}
                      onChange={(e) => {
                        const nextInstrument = e.target.value;
                        // Al cambiar de instrumento se sugiere el especialista
                        // correspondiente, pero el docente sigue siendo elegible.
                        updateSlot(index, {
                          instrument: nextInstrument,
                          teacherId: suggestedTeacherFor(nextInstrument),
                        });
                      }}
                      className="mt-1 h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                    >
                      {INSTRUMENTS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Docente a cargo *
                    <select
                      value={slot.teacherId}
                      onChange={(e) => updateSlot(index, { teacherId: e.target.value })}
                      className="mt-1 h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="">Sin asignar</option>
                      {TEACHER_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                          {option.id === suggestedTeacherFor(slot.instrument) ? " (especialista)" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Costo del plan
                    {/* ADR-0194: En modo compartido el Instrumento 2 lleva precio S/ 0
                        para que facturación no duplique el cobro. */}
                    {planMode === "compartido" && index > 0 ? (
                      <>
                        <Input
                          type="number"
                          value={0}
                          readOnly
                          disabled
                          className="mt-1 h-8 text-xs opacity-60"
                        />
                        <p className="text-[9px] text-orange-600 dark:text-orange-400 font-semibold mt-0.5">
                          S/ 0 — precio registrado en el Instrumento 1 (Plan Compartido)
                        </p>
                      </>
                    ) : (
                      <Input
                        type="number"
                        min={0}
                        value={slot.planPrice}
                        onChange={(e) => updateSlot(index, { planPrice: parseFloat(e.target.value) || 0 })}
                        className="mt-1 h-8 text-xs"
                      />
                    )}
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

                {!slot.teacherId && (
                  <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-800 dark:text-amber-200">
                    ⚠️ Sin docente asignado. Podrás asignarlo luego desde el Horario de Clases,
                    pero conviene definirlo ahora.
                  </p>
                )}

                {/* Libro / Pack de útiles: SÍ es por instrumento (uno por curso).
                    La matrícula, en cambio, es familiar y se captura una sola vez arriba. */}
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Libro / Pack de útiles
                    <Input
                      type="number"
                      min={0}
                      value={slot.packUtilesCost}
                      onChange={(e) => updateSlot(index, { packUtilesCost: parseFloat(e.target.value) || 0 })}
                      className="mt-1 h-8 text-xs"
                    />
                  </label>
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Abonado a libro
                    <Input
                      type="number"
                      min={0}
                      value={slot.packUtilesAmountPaid}
                      onChange={(e) => updateSlot(index, { packUtilesAmountPaid: parseFloat(e.target.value) || 0 })}
                      className="mt-1 h-8 text-xs"
                    />
                  </label>
                </div>

                {(slot.packUtilesCost - slot.packUtilesAmountPaid) > 0 && (
                  <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                    Libro pendiente: S/ {(slot.packUtilesCost - slot.packUtilesAmountPaid).toFixed(2)}
                  </p>
                )}
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
                    placeholder="Ej. 2do instrumento, horario a coordinar"
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
                    <div key={entry.id} className="space-y-1.5 rounded-lg border border-border/70 bg-muted/30 p-2">
                      <div className="grid gap-1.5 sm:grid-cols-3">
                        <label className="text-[10px] font-semibold text-muted-foreground">
                          Monto
                          <Input
                            type="number"
                            min={0}
                            value={entry.amount}
                            onChange={(e) => applyQuickPayment(index, entry.id, parseFloat(e.target.value) || 0)}
                            className="mt-0.5 h-7 text-[11px] font-bold"
                          />
                        </label>
                        <label className="text-[10px] font-semibold text-muted-foreground">
                          Fecha
                          <Input type="date" value={entry.date} onChange={(e) => updatePayment(entry.id, { date: e.target.value })} className="mt-0.5 h-7 text-[11px]" />
                        </label>
                        <label className="text-[10px] font-semibold text-muted-foreground">
                          Método
                          <select value={entry.method} onChange={(e) => updatePayment(entry.id, { method: e.target.value })} className="mt-0.5 h-7 w-full rounded-md border border-input bg-background px-1 text-[11px]">
                            {PAYMENT_METHODS.map((option) => (<option key={option} value={option}>{option}</option>))}
                          </select>
                        </label>
                      </div>

                      {/* Atajos: no hay que calcular mentalmente ni escribir */}
                      <div className="flex flex-wrap items-center gap-1">
                        {[50, 100].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => applyQuickPayment(index, entry.id, (entry.amount || 0) + value)}
                            className="min-h-[26px] rounded-md border border-primary/30 bg-primary/5 px-2 text-[10px] font-bold text-primary"
                          >
                            +S/ {value}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => applyQuickPayment(index, entry.id, Math.max(0, (slot.planPrice || 0) - (slot.amountPaid || 0) + (entry.amount || 0)))}
                          className="min-h-[26px] rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-300"
                        >
                          Pagar saldo
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPayments((prev) => prev.filter((item) => item.id !== entry.id));
                            const rest = payments.filter((item) => item.id !== entry.id && item.slotIndex === index);
                            updateSlot(index, { amountPaid: rest.reduce((sum, item) => sum + (item.amount || 0), 0) });
                          }}
                          className="ml-auto min-h-[26px] rounded-md px-2 text-[10px] font-bold text-rose-600"
                        >
                          Quitar
                        </button>
                      </div>

                      <Input
                        value={entry.note}
                        onChange={(e) => updatePayment(entry.id, { note: e.target.value })}
                        className="h-7 text-[11px]"
                        placeholder="Nota: ej. 2da clase, abono parcial…"
                      />
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
            <div className="mt-2 flex flex-wrap items-center justify-between gap-1 rounded-lg bg-background/70 px-2 py-1 text-[10px]">
              <span className="font-semibold text-muted-foreground">
                🎓 Matrícula familiar ({matriculaType}):{" "}
                <strong className="text-foreground">S/ {matriculaCost.toFixed(2)}</strong>
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Abonado: S/ {matriculaAmountPaid.toFixed(2)}
              </span>
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

    {/* ADR-0189 — Confirmación con códigos y acceso directo a cada Kardex. */}
    <Dialog open={Boolean(confirmation)} onOpenChange={(next) => !next && setConfirmation(null)}>
      <DialogContent className="w-[96vw] max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-black">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Matrícula multi-instrumento registrada
          </DialogTitle>
          <DialogDescription className="text-xs">
            {confirmation?.studentName} quedó en {confirmation?.members.length ?? 0} matrículas.
            Cada instrumento tiene su propio código y su propio Kardex.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2">
            <Layers className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
            <span className="text-[11px] font-black uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
              {confirmation?.label || "Instrumentos contratados"}
            </span>
            {confirmation && (
              <Badge
                variant="outline"
                className="font-mono text-[10px] border-emerald-500/50 text-emerald-700 dark:text-emerald-300"
                title="Código de la persona (compartido por sus matrículas)"
              >
                {personCode(confirmation.personGroupId)}
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground">código de persona</span>
          </div>

          <div className="space-y-2">
            {confirmation?.members.map((member) => (
              <div key={member.id} className="rounded-lg border border-border bg-background px-3 py-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      {member.instrument}
                      <span className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                        {member.code}
                      </span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Prof. {member.teacher || "Sin docente asignado"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-[11px] font-bold border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                    onClick={() => {
                      onOpenKardex?.(member.student);
                      setConfirmation(null);
                    }}
                    title={`Abrir el Kardex de ${member.instrument}`}
                  >
                    <BookOpen className="h-3 w-3" /> Kardex
                  </Button>
                </div>
              </div>
            ))}

            {confirmation && confirmation.members.length === 0 && (
              <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-800 dark:text-amber-200">
                Las matrículas se crearon, pero no se pudieron leer del directorio. Recarga la
                página para verlas.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/40 p-3 text-[11px] sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Contratado</p>
              <p className="font-mono font-black">S/ {(confirmation?.contratado ?? 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Abonado</p>
              <p className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                S/ {(confirmation?.abonado ?? 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Pendiente</p>
              <p className="font-mono font-black text-rose-600">S/ {(confirmation?.pendiente ?? 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">A favor</p>
              <p className="font-mono font-black text-sky-600 dark:text-sky-400">
                S/ {(confirmation?.saldoFavor ?? 0).toFixed(2)}
              </p>
            </div>
          </div>

          <p className="text-[10px] leading-snug text-muted-foreground">
            La matrícula institucional se cobró una sola vez por familia. El excedente queda como
            saldo a favor y no se aplica automáticamente a ningún instrumento.
          </p>

          <div className="flex justify-end gap-2 border-t border-border pt-3">
            <Button type="button" size="sm" className="text-xs font-bold" onClick={() => setConfirmation(null)}>
              Listo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
