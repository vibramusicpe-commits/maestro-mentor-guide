import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  GraduationCap,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  X,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Lightbulb,
  Check,
  Copy,
  RotateCcw,
  Star,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "@tanstack/react-router";

interface StaffOnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StaffOnboardingTutorial({ isOpen, onClose }: StaffOnboardingTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const navigate = useNavigate();

  // Estados interactivos para los mini-simuladores cute de cada paso
  const [simFamilyShown, setSimFamilyShown] = useState(true);
  const [simPairedDay, setSimPairedDay] = useState<"LM" | "MJ">("LM");
  const [simAttendanceState, setSimAttendanceState] = useState<"presente" | "ausente" | "tarde" | "justificada">("presente");
  const [simPaymentDone, setSimPaymentDone] = useState(false);
  const [simCopiedInvite, setSimCopiedInvite] = useState(false);
  const [simTeacherClockedIn, setSimTeacherClockedIn] = useState(true);
  const [simElapsedSeconds, setSimElapsedSeconds] = useState(24);

  // Timer para el simulador del paso 6
  useEffect(() => {
    if (!simTeacherClockedIn) return;
    const interval = setInterval(() => {
      setSimElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [simTeacherClockedIn]);

  const stepsCount = 6;
  const progressPercent = Math.round(((currentStepIndex + 1) / stepsCount) * 100);

  const handleNext = () => {
    if (currentStepIndex < stepsCount - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    try {
      localStorage.setItem("vibra-onboarding-completed", "true");
    } catch {}
    onClose();
  };

  const handleNavigateToModule = (route: string) => {
    onClose();
    navigate({ to: route });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl w-full p-0 overflow-hidden rounded-3xl bg-[#0D0B0A] border-2 border-[#F47B20]/40 shadow-2xl text-[#FFF8EC]">
        {/* Título oculto accesible para cumplir requerimientos de Dialog */}
        <DialogTitle className="sr-only">Guía de Inducción Operativa Vibra Music</DialogTitle>

        {/* 🌟 CABECERA OFICIAL VIBRA MUSIC */}
        <div className="bg-[#1A1410] border-b border-[#F47B20]/25 p-4 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="flex items-center justify-center h-9 w-9 rounded-2xl bg-gradient-to-br from-[#F47B20] to-[#FFB52E] text-[#15120F] font-black text-base shadow-md"
              >
                🎶
              </motion.div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#F47B20]/20 text-[#FFB52E] border border-[#F47B20]/30">
                    Vibra Music Staff
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">· Inducción</span>
                </div>
                <h3 className="text-sm font-black text-white">Guía Operativa Paso a Paso</h3>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              title="Cerrar guía"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Selector de Píldoras de Pasos (1..6) */}
          <div className="flex items-center justify-between gap-1.5 pt-1">
            {[
              { num: 1, label: "Alumnos", icon: "🎓" },
              { num: 2, label: "Horarios", icon: "🗓️" },
              { num: 3, label: "Asistencia", icon: "✅" },
              { num: 4, label: "Cobros", icon: "💳" },
              { num: 5, label: "Accesos", icon: "🔑" },
              { num: 6, label: "Docentes", icon: "⏱️" },
            ].map((p, idx) => (
              <motion.button
                key={p.num}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentStepIndex(idx)}
                className={`flex-1 py-1.5 px-1 rounded-xl text-center text-[10px] font-black transition-all border ${
                  currentStepIndex === idx
                    ? "bg-[#F47B20] text-[#15120F] border-[#FFB52E] shadow-md font-black"
                    : idx < currentStepIndex
                    ? "bg-[#1A1410] text-[#FFB52E] border-[#FFB52E]/30"
                    : "bg-white/5 text-neutral-400 border-white/10 hover:border-white/20"
                }`}
              >
                <span className="block sm:inline">{p.icon} </span>
                <span className="hidden sm:inline">{p.label}</span>
                <span className="sm:hidden">{p.num}</span>
              </motion.button>
            ))}
          </div>

          {/* Barra de progreso interactiva */}
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-[#F47B20] via-[#FF9E3D] to-[#FFB52E] h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* 📋 CUERPO DEL PASO CON MINI-SIMULADOR CUTE INTERACTIVO */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[68vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* ── PASO 1: REGISTRO DE ALUMNOS ── */}
            {currentStepIndex === 0 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div>
                  <Badge className="bg-[#FFB52E]/20 text-[#FFB52E] border-[#FFB52E]/40 font-black text-[10px] uppercase">
                    Paso 1 de 6 · Directorio y Matrículas
                  </Badge>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                    🎓 Registro de Alumnos con Contactos Completos
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300">
                    Al presionar <strong>"Registrar Nuevo Alumno"</strong>, es obligatorio registrar la información de ambos padres y un contacto de emergencia adicional.
                  </p>
                </div>

                {/* Simulador Interactivo Cute: Ficha Familiar */}
                <div className="rounded-2xl border-2 border-[#F47B20]/30 bg-[#1A1410] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#FFB52E] flex items-center gap-1.5">
                      ✨ Vista Interactiva: Ficha Familiar Vibra
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSimFamilyShown(!simFamilyShown)}
                      className="text-[11px] font-bold text-[#F47B20] hover:underline"
                    >
                      {simFamilyShown ? "Ocultar Ejemplo" : "Mostrar Ejemplo"}
                    </motion.button>
                  </div>

                  {simFamilyShown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="grid gap-2.5 text-xs"
                    >
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👧</span>
                          <div>
                            <p className="font-bold text-white">Luciana Mendoza (9 años)</p>
                            <p className="text-[11px] text-[#FFB52E]">Categoría: 🟡 Junior (7 a 12 años) · Piano</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">Activo</Badge>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-2">
                        <motion.div whileHover={{ scale: 1.02 }} className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-[10px] text-neutral-400 font-bold uppercase">👨 Papá</p>
                          <p className="font-bold text-white">Carlos Mendoza</p>
                          <p className="text-[10px] font-mono text-[#FF9E3D]">987-654-321</p>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-[10px] text-neutral-400 font-bold uppercase">👩 Mamá</p>
                          <p className="font-bold text-white">Rosa Huamán</p>
                          <p className="text-[10px] font-mono text-[#FF9E3D]">984-123-456</p>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} className="p-2.5 rounded-xl bg-[#F47B20]/15 border border-[#F47B20]/40">
                          <p className="text-[10px] text-[#FFB52E] font-black uppercase">👵 Apoderado Emergencia</p>
                          <p className="font-bold text-white">Elena (Abuela)</p>
                          <p className="text-[10px] font-mono text-[#FFB52E]">991-000-222</p>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="rounded-2xl border border-[#FFB52E]/30 bg-[#FFB52E]/10 p-3 text-xs font-semibold text-[#FFB52E] flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 shrink-0 text-[#FFB52E]" />
                  <span><strong>Regla de Oro:</strong> Contar con los teléfonos de ambos padres y la abuela/tío evita llamadas perdidas ante urgencias o reprogramaciones.</span>
                </div>
              </motion.div>
            )}

            {/* ── PASO 2: HORARIO Y DÍAS PAREADOS ── */}
            {currentStepIndex === 1 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div>
                  <Badge className="bg-[#F47B20]/20 text-[#F47B20] border-[#F47B20]/40 font-black text-[10px] uppercase">
                    Paso 2 de 6 · Horario y Vacantes
                  </Badge>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                    🗓️ Días Pareados (Regla Vibra) y Aforo Máximo
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300">
                    El Plan Regular tiene <strong>2 clases por semana</strong> (8 clases/mes). Vibra Music utiliza la lógica de días pareados predefinida.
                  </p>
                </div>

                {/* Simulador Interactivo Cute: Días Pareados */}
                <div className="rounded-2xl border-2 border-[#F47B20]/30 bg-[#1A1410] p-4 space-y-3">
                  <span className="text-xs font-black text-[#FFB52E] block">
                    ✨ Toca un botón para probar la sincronización automática:
                  </span>

                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSimPairedDay("LM")}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all border ${
                        simPairedDay === "LM"
                          ? "bg-[#F47B20] text-[#15120F] border-[#FFB52E] shadow-md"
                          : "bg-white/5 text-white border-white/10 hover:border-white/20"
                      }`}
                    >
                      🎹 Par Lunes + Miércoles
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSimPairedDay("MJ")}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all border ${
                        simPairedDay === "MJ"
                          ? "bg-[#F47B20] text-[#15120F] border-[#FFB52E] shadow-md"
                          : "bg-white/5 text-white border-white/10 hover:border-white/20"
                      }`}
                    >
                      🎸 Par Martes + Jueves
                    </motion.button>
                  </div>

                  {/* Visualización del par seleccionado */}
                  <div className="p-3 rounded-xl bg-black/50 border border-white/10 flex items-center justify-around text-center text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">1ra Sesión</span>
                      <p className="font-black text-lg text-white">
                        {simPairedDay === "LM" ? "Lunes" : "Martes"}
                      </p>
                      <Badge variant="outline" className="text-[10px] border-[#FFB52E] text-[#FFB52E]">4:00 PM · Sala A</Badge>
                    </div>

                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-[#F47B20] font-black text-lg">
                      🔗
                    </motion.div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">2da Sesión (Automática)</span>
                      <p className="font-black text-lg text-[#FFB52E]">
                        {simPairedDay === "LM" ? "Miércoles" : "Jueves"}
                      </p>
                      <Badge variant="outline" className="text-[10px] border-[#FFB52E] text-[#FFB52E]">4:00 PM · Sala A</Badge>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                    <span className="font-bold">👥 Aforo de esta clase: 3 / 5 alumnos</span>
                    <span className="text-[11px] font-black bg-emerald-500/20 px-2 py-0.5 rounded-md">2 vacantes libres</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#FFB52E]/30 bg-[#FFB52E]/10 p-3 text-xs font-semibold text-[#FFB52E] flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 shrink-0 text-[#FFB52E]" />
                  <span><strong>Modo Personalizado:</strong> Si el alumno no puede días pareados, activa "Modo Personalizado" para agendar cualquier día (ej. Miércoles + Sábado). Límite estricto: máximo 5 alumnos por profesor.</span>
                </div>
              </motion.div>
            )}

            {/* ── PASO 3: CONTROL DE ASISTENCIA Y KARDEX ── */}
            {currentStepIndex === 2 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-black text-[10px] uppercase">
                    Paso 3 de 6 · Asistencia en Vivo
                  </Badge>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                    ✅ Control de Asistencias y Sincronización en Kardex
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300">
                    El profesor toma asistencia desde su celular con 1 toque en <strong>/teacher</strong>. Se refleja al instante en el Kardex y en la base de datos PostgreSQL.
                  </p>
                </div>

                {/* Simulador Interactivo Cute: 4 Botones de Asistencia */}
                <div className="rounded-2xl border-2 border-emerald-500/30 bg-[#1A1410] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">
                      Alumno: <strong>Mateo Morales (Batería)</strong>
                    </span>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-black/40 border border-white/20">
                      Estado: <strong className="text-emerald-300">{simAttendanceState.toUpperCase()}</strong>
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    Prueba pulsar los 4 estados para ver qué ocurre en el sistema:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setSimAttendanceState("presente")}
                      className={`p-2 rounded-xl text-xs font-black border text-center transition-all ${
                        simAttendanceState === "presente"
                          ? "bg-emerald-600 text-white border-emerald-400 shadow-md"
                          : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                      }`}
                    >
                      🟢 Presente
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setSimAttendanceState("ausente")}
                      className={`p-2 rounded-xl text-xs font-black border text-center transition-all ${
                        simAttendanceState === "ausente"
                          ? "bg-red-600 text-white border-red-400 shadow-md"
                          : "bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20"
                      }`}
                    >
                      🔴 Ausente
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setSimAttendanceState("tarde")}
                      className={`p-2 rounded-xl text-xs font-black border text-center transition-all ${
                        simAttendanceState === "tarde"
                          ? "bg-amber-600 text-white border-amber-400 shadow-md"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                      }`}
                    >
                      🟡 Tarde
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setSimAttendanceState("justificada")}
                      className={`p-2 rounded-xl text-xs font-black border text-center transition-all ${
                        simAttendanceState === "justificada"
                          ? "bg-blue-600 text-white border-blue-400 shadow-md"
                          : "bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20"
                      }`}
                    >
                      🔵 Justificada
                    </motion.button>
                  </div>

                  {/* Feedback dinámico */}
                  <motion.div
                    key={simAttendanceState}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs flex items-center gap-2"
                  >
                    {simAttendanceState === "presente" && <span>🟢 Asistencia sumada (+1 clase computada en el mes).</span>}
                    {simAttendanceState === "ausente" && <span>🔴 Falta sin aviso registrada. El porcentaje de asistencia baja.</span>}
                    {simAttendanceState === "tarde" && <span>🟡 Marcado tardío registrado. El alumno ingresó a clase.</span>}
                    {simAttendanceState === "justificada" && (
                      <span className="text-blue-300 font-bold flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-blue-400 fill-blue-400" />
                        ¡Aviso anticipado! Se le abonó +1 Crédito de Recuperación automáticamente.
                      </span>
                    )}
                  </motion.div>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 shrink-0 text-emerald-300" />
                  <span><strong>Secretaría también puede marcar:</strong> En Directorio de Alumnos, toca "Kardex" para ver el historial y corregir o justificar una falta si la mamá avisó por WhatsApp.</span>
                </div>
              </motion.div>
            )}

            {/* ── PASO 4: COBROS Y FACTURACIÓN ── */}
            {currentStepIndex === 3 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div>
                  <Badge className="bg-[#FF9E3D]/20 text-[#FF9E3D] border-[#FF9E3D]/40 font-black text-[10px] uppercase">
                    Paso 4 de 6 · Pagos y Facturación
                  </Badge>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                    💳 Cobros de Cuotas en Soles (PEN) y Culqi
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300">
                    En <strong>Cobros y Abonos</strong> controlas qué familias están al día y registras los pagos de mensualidad o matrícula.
                  </p>
                </div>

                {/* Simulador Interactivo Cute: Cobro en 1 Clic */}
                <div className="rounded-2xl border-2 border-[#FF9E3D]/30 bg-[#1A1410] p-4 space-y-3">
                  <span className="text-xs font-black text-[#FFB52E] block">
                    ✨ Prueba registrar un pago en Soles peruanos:
                  </span>

                  <div className="p-3 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">Familia Paredes · Alumno: Thiago</p>
                      <p className="text-[11px] text-neutral-400">Cuota Mensual: <strong className="text-white font-mono">S/ 320.00 PEN</strong></p>
                    </div>

                    <Badge
                      className={`text-xs font-black ${
                        simPaymentDone
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-red-500/20 text-red-300 border-red-500/40"
                      }`}
                    >
                      {simPaymentDone ? "🟢 Al Día" : "🔴 Pendiente"}
                    </Badge>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSimPaymentDone(!simPaymentDone)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F47B20] to-[#FF9E3D] hover:opacity-95 text-[#15120F] font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {simPaymentDone ? (
                      <>
                        <RotateCcw className="h-4 w-4" /> Deshacer Pago de Prueba
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" /> Registrar Pago en Soles (Transferencia / Culqi)
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="rounded-2xl border border-[#FFB52E]/30 bg-[#FFB52E]/10 p-3 text-xs font-semibold text-[#FFB52E] flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 shrink-0 text-[#FFB52E]" />
                  <span><strong>Pasarela Culqi:</strong> Integrada para cobros oficiales con tarjeta y transferencias bancarias en Soles PEN. Emite comprobante automático.</span>
                </div>
              </motion.div>
            )}

            {/* ── PASO 5: INVITACIONES Y CLAVES MAESTRAS ── */}
            {currentStepIndex === 4 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div>
                  <Badge className="bg-[#FFB52E]/20 text-[#FFB52E] border-[#FFB52E]/40 font-black text-[10px] uppercase">
                    Paso 5 de 6 · Enlaces y Credenciales
                  </Badge>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                    🔑 Enlaces de WhatsApp y Claves Maestras Oficiales
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300">
                    A cada profesor y apoderado se le envía su enlace oficial para ingresar sin contraseña compleja. Cada docente tiene su <strong>Clave Maestra única</strong>.
                  </p>
                </div>

                {/* Simulador Interactivo Cute: Copiar Enlace y Reset */}
                <div className="rounded-2xl border-2 border-[#FFB52E]/30 bg-[#1A1410] p-4 space-y-3">
                  <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Prof. Fernando (Violín y Piano)</span>
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">Aceptado</Badge>
                    </div>

                    <div className="p-2 rounded-lg bg-white/5 font-mono text-[11px] text-[#FFB52E] flex items-center justify-between">
                      <span>Clave Maestra Oficial: <strong>Vibra-FERNAN-2026</strong></span>
                      <span className="text-[9px] text-muted-foreground">(Inmutable)</span>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSimCopiedInvite(true);
                        setTimeout(() => setSimCopiedInvite(false), 2500);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      {simCopiedInvite ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-400" /> ¡Mensaje Copiado para WhatsApp!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 text-[#FFB52E]" /> Copiar Enlace y Mensaje de WhatsApp
                        </>
                      )}
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
                    <span>Jeremy: <strong className="text-white font-mono">Vibra-ZL3F-EMGN</strong></span>
                    <span>Nathaly: <strong className="text-white font-mono">Vibra-NATHAL-2026</strong></span>
                    <span>Nayeli: <strong className="text-white font-mono">NayeliVibra2026*</strong></span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#FFB52E]/30 bg-[#FFB52E]/10 p-3 text-xs font-semibold text-[#FFB52E] flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 shrink-0 text-[#FFB52E]" />
                  <span><strong>Botón Reset:</strong> Si el profesor olvidó su clave personalizada, pulsar "Reset" en el panel restaura su Clave Maestra oficial directamente a estado pendiente.</span>
                </div>
              </motion.div>
            )}

            {/* ── PASO 6: ASISTENCIA DOCENTE EN SEDE ── */}
            {currentStepIndex === 5 && (
              <motion.div
                key="step-6"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-black text-[10px] uppercase">
                    Paso 6 de 6 · Fichaje y Nómina
                  </Badge>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                    ⏱️ Asistencia Docente en Sede y Cómputo de Nómina
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300">
                    Al llegar a la sede de San Juan de Lurigancho (Av. Las Flores 1284), los profesores pulsan <strong>"Marcar Entrada"</strong>. Secretaría y Dirección ven en tiempo real quiénes están presentes.
                  </p>
                </div>

                {/* Simulador Interactivo Cute: Reloj de Sede */}
                <div className="rounded-2xl border-2 border-emerald-500/30 bg-[#1A1410] p-4 space-y-3">
                  <div className="p-3 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black">
                        🎻
                      </div>
                      <div>
                        <p className="font-black text-white">Fernando (Violín y Piano)</p>
                        <p className="text-[11px] text-neutral-400">Sede Principal · Sala B</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                        Trabajando
                      </span>
                      <p className="font-mono text-[10px] text-neutral-400 mt-0.5">
                        {Math.floor(simElapsedSeconds / 60)}m {simElapsedSeconds % 60}s transcurridos
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs flex items-center justify-between text-neutral-300">
                    <span>Monitoreo en vivo: <strong>3 profesores en sede</strong></span>
                    <Badge variant="outline" className="text-[10px] border-emerald-400 text-emerald-400 font-bold">🟢 Sincronizado</Badge>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 shrink-0 text-emerald-300" />
                  <span><strong>Cierre de Mes:</strong> En "Asistencia Docente", la pestaña "Kardex Mensual" consolida automáticamente todas las horas netas y turnos de cada profesor para su pago.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 🔘 PIE DE NAVEGACIÓN CON ANIMACIONES CUTE */}
        <div className="bg-[#1A1410] border-t border-[#F47B20]/25 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-xs disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </motion.button>

            {currentStepIndex === 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigateToModule("/admin/alumnos")}
                className="text-[#FFB52E] hover:bg-[#FFB52E]/10 font-bold h-9 text-xs gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Ir a Alumnos
              </Button>
            )}
            {currentStepIndex === 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigateToModule("/admin/agenda")}
                className="text-[#F47B20] hover:bg-[#F47B20]/10 font-bold h-9 text-xs gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Ir a Horarios
              </Button>
            )}
            {currentStepIndex === 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigateToModule("/admin/facturacion")}
                className="text-[#FF9E3D] hover:bg-[#FF9E3D]/10 font-bold h-9 text-xs gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Ir a Facturación
              </Button>
            )}
            {currentStepIndex === 4 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigateToModule("/admin/invitaciones")}
                className="text-[#FFB52E] hover:bg-[#FFB52E]/10 font-bold h-9 text-xs gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Ir a Invitaciones
              </Button>
            )}
            {currentStepIndex === 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigateToModule("/admin/control-horario")}
                className="text-emerald-400 hover:bg-emerald-400/10 font-bold h-9 text-xs gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Ir a Control Horario
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFinish}
              className="text-neutral-400 hover:text-white text-xs"
            >
              Saltar
            </Button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F47B20] via-[#FF9E3D] to-[#FFB52E] text-[#15120F] font-black text-xs shadow-lg flex items-center gap-1.5 transition-all"
            >
              {currentStepIndex === stepsCount - 1 ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> ¡Entendido! Completar Inducción
                </>
              ) : (
                <>
                  Siguiente <ChevronRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
