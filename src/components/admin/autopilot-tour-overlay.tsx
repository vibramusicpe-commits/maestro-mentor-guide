import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  useAutopilotStore,
  AUTOPILOT_STEPS,
} from "@/store/autopilot-store";
import {
  Play,
  Pause,
  FastForward,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  MousePointer2,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  MessageCircle,
  Copy,
  Users,
  Check,
  Calendar,
  CreditCard,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AutopilotTourOverlay() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const {
    isActive,
    isPaused,
    currentStepIndex,
    speedMultiplier,
    cursorPos,
    cursorVisible,
    clickRipple,
    bubble,
    stopTour,
    pauseTour,
    resumeTour,
    nextStep,
    prevStep,
    toggleSpeed,
    setStep,
    setCursorPos,
    triggerClick,
    setBubble,
  } = useAutopilotStore();

  // Estados locales para simulación visual interactiva dentro del tour
  const [typedStudentName, setTypedStudentName] = useState("");
  const [typedDadName, setTypedDadName] = useState("");
  const [typedDadPhone, setTypedDadPhone] = useState("");
  const [typedMomName, setTypedMomName] = useState("");
  const [typedMomPhone, setTypedMomPhone] = useState("");
  const [typedEmergName, setTypedEmergName] = useState("");
  const [typedEmergPhone, setTypedEmergPhone] = useState("");
  const [demoModalOpen, setDemoModalOpen] = useState<"student" | "kardex" | "trash" | null>(null);
  const [demoTrashTab, setDemoTrashTab] = useState<"reincorporacion" | "descartables">("reincorporacion");
  const [demoCopiedMsg, setDemoCopiedMsg] = useState(false);
  const [demoRestored, setDemoRestored] = useState(false);
  const [demoAttendanceChoice, setDemoAttendanceChoice] = useState<string>("justificada");
  const [demoInvoicePaid, setDemoInvoicePaid] = useState(false);

  // Referencia para cancelar bucles de animación si el usuario sale o pausa
  const abortRef = useRef<boolean>(false);

  // Pausar y reanudar con tecla Espacio, salir con Escape
  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        stopTour();
      } else if (e.key === " " && (e.target as HTMLElement)?.tagName !== "INPUT") {
        e.preventDefault();
        if (isPaused) resumeTour();
        else pauseTour();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, isPaused, stopTour, pauseTour, resumeTour]);

  // Función de espera reactiva a la velocidad y a la pausa
  const wait = useCallback(
    async (ms: number) => {
      const adjusted = ms / speedMultiplier;
      const start = Date.now();
      while (Date.now() - start < adjusted) {
        if (abortRef.current) return;
        if (useAutopilotStore.getState().isPaused) {
          while (useAutopilotStore.getState().isPaused) {
            if (abortRef.current) return;
            await new Promise((r) => setTimeout(r, 100));
          }
        }
        await new Promise((r) => setTimeout(r, 50));
      }
    },
    [speedMultiplier]
  );

  // Simulación de tipeo con efecto máquina de escribir (Letras iniciales mayúsculas)
  const typeText = useCallback(
    async (text: string, setter: (val: string) => void) => {
      let current = "";
      for (let i = 0; i < text.length; i++) {
        if (abortRef.current) return;
        current += text[i];
        setter(current);
        await wait(35);
      }
    },
    [wait]
  );

  // EJECUCIÓN SECUENCIAL DEL TOUR SEGÚN EL PASO ACTUAL
  useEffect(() => {
    if (!isActive) {
      setDemoModalOpen(null);
      return;
    }

    abortRef.current = false;
    let isCancelled = false;

    const runCurrentStep = async () => {
      const step = AUTOPILOT_STEPS[currentStepIndex];

      // 1. Asegurar navegación a la ruta real correspondiente
      if (pathname !== step.route) {
        navigate({ to: step.route });
        await wait(600);
        if (isCancelled || abortRef.current) return;
      }

      // ─── PASO 1: REGISTRO DE ALUMNO CON PAPÁ, MAMÁ Y CONTACTO DE EMERGENCIA ───
      if (currentStepIndex === 0) {
        setDemoModalOpen(null);
        setTypedStudentName("");
        setTypedDadName("");
        setTypedDadPhone("");
        setTypedMomName("");
        setTypedMomPhone("");
        setTypedEmergName("");
        setTypedEmergPhone("");

        setBubble(
          "Paso 1: Registro de Alumnos con Contactos Completos",
          "El cursor se desplaza automáticamente hacia el botón de nuevo alumno...",
          "Regla Vibra: Papá, Mamá y Apoderado de Emergencia obligatorios."
        );

        // Mover cursor al botón de "+ Registrar Alumno"
        setCursorPos({ x: Math.min(window.innerWidth - 180, 850), y: 190 });
        await wait(1000);
        if (isCancelled || abortRef.current) return;

        triggerClick({ x: Math.min(window.innerWidth - 180, 850), y: 190 });
        await wait(400);

        // Abrir demostración visual del formulario de registro completo
        setDemoModalOpen("student");
        setBubble(
          "Ficha Familiar Completa",
          "Escribiendo datos del alumno con iniciales mayúsculas por respeto y gramática...",
          "Nombres completos y teléfonos verificados."
        );

        // Simular tipeo del Alumno
        setCursorPos({ x: window.innerWidth / 2 - 120, y: window.innerHeight / 2 - 140 });
        await wait(500);
        await typeText("Luciana Mendoza Gómez", setTypedStudentName);
        await wait(400);

        // Simular Papá
        setCursorPos({ x: window.innerWidth / 2 - 120, y: window.innerHeight / 2 - 60 });
        await typeText("Carlos Mendoza", setTypedDadName);
        setCursorPos({ x: window.innerWidth / 2 + 100, y: window.innerHeight / 2 - 60 });
        await typeText("987 654 321", setTypedDadPhone);
        await wait(400);

        // Simular Mamá
        setCursorPos({ x: window.innerWidth / 2 - 120, y: window.innerHeight / 2 + 20 });
        await typeText("Rosa Huamán", setTypedMomName);
        setCursorPos({ x: window.innerWidth / 2 + 100, y: window.innerHeight / 2 + 20 });
        await typeText("984 123 456", setTypedMomPhone);
        await wait(400);

        // Simular Contacto de Emergencia
        setCursorPos({ x: window.innerWidth / 2 - 120, y: window.innerHeight / 2 + 100 });
        await typeText("Elena Gómez (Abuela)", setTypedEmergName);
        setCursorPos({ x: window.innerWidth / 2 + 100, y: window.innerHeight / 2 + 100 });
        await typeText("991 000 222", setTypedEmergPhone);
        await wait(800);

        setBubble(
          "¡Registro Familiar Impecable!",
          "Tener el contacto de ambos padres y la abuela garantiza 0 llamadas perdidas ante emergencias o cambios.",
          "El sistema ahora vinculará su plan y horario pareado."
        );
        await wait(2200);
      }

      // ─── PASO 2: HORARIOS PAREADOS Y AFORO MÁXIMO ───
      else if (currentStepIndex === 1) {
        setDemoModalOpen(null);
        setBubble(
          "Paso 2: Horarios de Clases Pareados",
          "Navegando a la Agenda. Vibra Music utiliza días pareados predefinidos (Lunes jala Miércoles, Martes jala Jueves).",
          "Aforo máximo estricto: 5 alumnos por profesor."
        );

        // Mover cursor a una celda de horario
        setCursorPos({ x: window.innerWidth / 2 - 80, y: 320 });
        await wait(1000);
        triggerClick();
        await wait(500);

        setCursorPos({ x: window.innerWidth / 2 + 120, y: 320 });
        triggerClick();
        await wait(500);

        setBubble(
          "Sincronización Automática",
          "Al matricular a un alumno en el par Lunes+Miércoles, ambas casillas se bloquean en conjunto.",
          "Si el cupo llega a 5/5, la casilla se tiñe de rojo indicando aforo completo."
        );
        await wait(2400);
      }

      // ─── PASO 3: ASISTENCIA EN KARDEX Y JUSTIFICADA (+1 CRÉDITO) ───
      else if (currentStepIndex === 2) {
        setDemoModalOpen("kardex");
        setDemoAttendanceChoice("justificada");
        setBubble(
          "Paso 3: Asistencia y Kardex del Alumno",
          "El profesor marca desde su celular (/teacher) o Secretaría desde el Directorio. Probando Justificada...",
          "Las faltas con aviso previo generan crédito de recuperación."
        );

        // Mover cursor al botón de Justificada
        setCursorPos({ x: window.innerWidth / 2 + 110, y: window.innerHeight / 2 + 30 });
        await wait(1000);
        triggerClick();
        setDemoAttendanceChoice("justificada");

        await wait(600);
        setBubble(
          "⭐ ¡+1 Crédito Otorgado!",
          "Como la mamá avisó con anticipación por WhatsApp, el sistema le suma automáticamente 1 Crédito de Recuperación en su ficha.",
          "Si fuera 'Ausente' no justificada, el porcentaje baja sin crédito."
        );
        await wait(2400);
      }

      // ─── PASO 4: PAPELERA INTELIGENTE, FILTROS Y RESTAURACIÓN DE ALUMNOS ───
      else if (currentStepIndex === 3) {
        setDemoModalOpen(null);
        setDemoCopiedMsg(false);
        setDemoRestored(false);
        setDemoTrashTab("reincorporacion");

        setBubble(
          "Paso 4: Papelera y Leads de Reincorporación",
          "El cursor se dirige a la Papelera de Alumnos para gestionar las bajas...",
          "Los alumnos no se borran a ciegas; se conservan por motivo."
        );

        // Mover cursor al botón "Papelera" en Alumnos
        setCursorPos({ x: Math.min(window.innerWidth - 300, 720), y: 190 });
        await wait(1000);
        triggerClick();
        await wait(400);

        // Abrir modal simulado de Papelera con filtros reales
        setDemoModalOpen("trash");
        setBubble(
          "Filtros de Reincorporación",
          "Mostrando alumnos retirados por Falta de Pago o Retiro Voluntario que pueden reactivarse con promociones...",
          "Separados quirúrgicamente de errores de digitación."
        );

        // Mover al botón de copiar mensaje de WhatsApp
        setCursorPos({ x: window.innerWidth / 2 + 130, y: window.innerHeight / 2 - 10 });
        await wait(1200);
        triggerClick();
        setDemoCopiedMsg(true);

        setBubble(
          "📲 Mensaje de WhatsApp Copiado",
          "Se genera un mensaje personalizado con el nombre del alumno para reconquistarlo con matrícula gratis.",
          "Ahora veamos cómo restaurarlo al directorio activo si la familia decide volver..."
        );
        await wait(1800);

        // Mover al botón "Restaurar Alumno"
        setCursorPos({ x: window.innerWidth / 2 + 130, y: window.innerHeight / 2 + 50 });
        await wait(1000);
        triggerClick();
        setDemoRestored(true);

        setBubble(
          "🟢 ¡Alumno Restaurado con Éxito!",
          "El alumno vuelve inmediatamente a la lista activa con todas sus clases, horario y pagos intactos.",
          "Cero pérdida de datos históricos."
        );
        await wait(2400);
      }

      // ─── PASO 5: COBROS Y FACTURACIÓN EN SOLES (PEN) ───
      else if (currentStepIndex === 4) {
        setDemoModalOpen(null);
        setDemoInvoicePaid(false);
        setBubble(
          "Paso 5: Facturación y Cobros en Soles",
          "En Cobros y Abonos se monitorea la morosidad y las cuotas mensuales...",
          "Integración oficial con Culqi para pagos con tarjeta en Soles PEN."
        );

        // Mover cursor a un pago pendiente
        setCursorPos({ x: window.innerWidth / 2, y: 350 });
        await wait(1100);
        triggerClick();
        setDemoInvoicePaid(true);

        setBubble(
          "🟢 Pago Conciliado en Soles (PEN)",
          "El estado cambia a 'Al Día' y el comprobante oficial queda registrado para la administración.",
          "Las familias en mora se visualizan en el panel de riesgo del Dashboard."
        );
        await wait(2400);
      }

      // ─── PASO 6: INVITACIONES Y ASISTENCIA DOCENTE EN SEDE ───
      else if (currentStepIndex === 5) {
        setDemoModalOpen(null);
        setBubble(
          "Paso 6: Monitoreo Docente en Sede en Vivo",
          "En el Dashboard ves qué profesores están trabajando en sede con su reloj en vivo...",
          "Cada profesor tiene su Clave Maestra oficial inmutable en Invitaciones."
        );

        // Mover cursor al widget de asistencia de profesores
        setCursorPos({ x: window.innerWidth / 2, y: 300 });
        await wait(1500);

        setBubble(
          "🎉 ¡Inducción en Vivo Completada!",
          "La secretaria o directora ahora conoce el flujo real completo de Vibra Music.",
          "Pulsa 'Finalizar' o sal en cualquier momento para operar el sistema."
        );
      }
    };

    runCurrentStep();

    return () => {
      isCancelled = true;
      abortRef.current = true;
    };
  }, [currentStepIndex, isActive, navigate, pathname, setBubble, setCursorPos, triggerClick, wait, typeText]);

  if (!isActive) return null;

  const currentStep = AUTOPILOT_STEPS[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / AUTOPILOT_STEPS.length) * 100);

  return (
    <div className="fixed inset-0 z-[999999] pointer-events-none select-none overflow-hidden">
      {/* 🌟 SOMBRA PERIFÉRICA ELEGANTE (Permite ver el fondo sin perder foco) */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px] transition-opacity duration-300" />

      {/* 🖱️ CURSOR VIRTUAL AUTÓNOMO CON ESTELA LUMINOSA */}
      {cursorVisible && (
        <motion.div
          className="absolute z-50 pointer-events-none"
          animate={{ x: cursorPos.x, y: cursorPos.y }}
          transition={{ type: "spring", damping: 28, stiffness: 180 }}
          style={{ willChange: "transform" }}
        >
          {/* Estela luminosa */}
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -top-3 -left-3 h-10 w-10 rounded-full bg-[#FFB52E]/30 blur-md pointer-events-none"
            />

            {/* Ícono de Puntero SVG Estilizado Oficial */}
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_4px_12px_rgba(244,123,32,0.8)] filter"
            >
              <defs>
                <linearGradient id="cursorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFB52E" />
                  <stop offset="60%" stopColor="#F47B20" />
                  <stop offset="100%" stopColor="#FF9E3D" />
                </linearGradient>
              </defs>
              <path
                d="M4.5 3.5L10.5 20.5L13.5 13.5L20.5 10.5L4.5 3.5Z"
                fill="url(#cursorGrad)"
                stroke="#15120F"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>

            {/* Etiqueta animada "Autopiloto" al lado del cursor */}
            <div className="absolute top-6 left-5 px-2 py-0.5 rounded-full bg-[#0D0B0A]/90 border border-[#F47B20]/60 text-[9px] font-black text-[#FFB52E] shadow-md flex items-center gap-1 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Autopiloto Vibra</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 💥 EFECTO DE ONDA EXPANSIVA DE CLIC (RIPPLE EFFECT) */}
      {clickRipple && (
        <motion.div
          key={clickRipple.key}
          initial={{ scale: 0.2, opacity: 1 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute z-40 h-14 w-14 -ml-7 -mt-7 rounded-full border-2 border-[#FFB52E] bg-[#F47B20]/30 pointer-events-none"
          style={{ left: clickRipple.x, top: clickRipple.y }}
        />
      )}

      {/* 💬 CARTEL EXPLICATIVO FLOTANTE DE ACCIÓN (SPEECH BUBBLE) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-xl pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="rounded-3xl border-2 border-[#F47B20]/60 bg-[#0D0B0A]/95 p-4 sm:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-[#FFF8EC] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#F47B20]/20 text-[#FFB52E] border border-[#F47B20]/40">
                {currentStep.badge}
              </span>
              <span className="text-xs text-neutral-400 font-semibold">
                Modo Demostración en Vivo
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#FFB52E] font-black">
              <span>{progressPercent}% completado</span>
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#FFB52E] shrink-0" />
            {bubble.title}
          </h3>

          <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
            {bubble.text}
          </p>

          {bubble.subtext && (
            <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-[#1A1410] border border-[#F47B20]/30 text-[11px] text-[#FFB52E] font-medium flex items-center gap-1.5">
              <span className="text-sm">💡</span>
              <span>{bubble.subtext}</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── MODAL DEMO EN VIVO: FORMULARIO DE ALUMNO (PASO 1) ── */}
      {demoModalOpen === "student" && (
        <div className="absolute inset-0 flex items-center justify-center z-40 p-4 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="w-full max-w-lg rounded-3xl border-2 border-[#F47B20]/50 bg-[#0D0B0A] p-5 sm:p-6 shadow-2xl text-[#FFF8EC] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎓</span>
                <div>
                  <h4 className="text-sm font-black text-white">Registro Oficial de Alumno</h4>
                  <p className="text-[11px] text-neutral-400">Demostración en vivo de campos obligatorios</p>
                </div>
              </div>
              <Badge className="bg-[#FFB52E]/20 text-[#FFB52E] text-[10px]">Tipeo en Tiempo Real</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-[#FFB52E] block mb-1">
                  Nombre Completo del Alumno (Iniciales Mayúsculas):
                </label>
                <div className="h-9 px-3 rounded-xl bg-[#1A1410] border border-[#F47B20]/40 flex items-center font-bold text-white text-sm">
                  {typedStudentName}
                  <span className="inline-block w-1.5 h-4 bg-[#FFB52E] ml-1 animate-pulse" />
                </div>
              </div>

              {/* Ficha Familiar Papá y Mamá */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-300 block">👨 Papá</label>
                  <div className="h-8 px-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center text-xs text-white">
                    {typedDadName}
                  </div>
                  <div className="h-7 px-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center text-[11px] font-mono text-[#FF9E3D]">
                    {typedDadPhone}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-300 block">👩 Mamá</label>
                  <div className="h-8 px-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center text-xs text-white">
                    {typedMomName}
                  </div>
                  <div className="h-7 px-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center text-[11px] font-mono text-[#FF9E3D]">
                    {typedMomPhone}
                  </div>
                </div>
              </div>

              {/* Apoderado de Emergencia */}
              <div className="p-3 rounded-2xl bg-[#F47B20]/10 border border-[#F47B20]/30 space-y-1.5">
                <label className="text-[10px] font-black text-[#FFB52E] uppercase block">
                  👵 Apoderado de Emergencia (Obligatorio)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 flex items-center text-xs text-white">
                    {typedEmergName}
                  </div>
                  <div className="h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 flex items-center text-[11px] font-mono text-[#FFB52E]">
                    {typedEmergPhone}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── MODAL DEMO EN VIVO: KARDEX Y JUSTIFICADA (PASO 3) ── */}
      {demoModalOpen === "kardex" && (
        <div className="absolute inset-0 flex items-center justify-center z-40 p-4 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl border-2 border-emerald-500/50 bg-[#0D0B0A] p-5 shadow-2xl text-[#FFF8EC] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="text-sm font-black text-white">Kardex de Asistencias</h4>
                <p className="text-[11px] text-neutral-400">Alumno: Mateo Morales (Piano)</p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">Demostración en Vivo</Badge>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-neutral-300 block">
                Selección de estado por parte de la secretaria o profesor:
              </span>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className={`p-2 rounded-xl border text-center font-bold transition-all ${demoAttendanceChoice === "presente" ? "bg-emerald-600 text-white" : "bg-white/5 border-white/10 opacity-50"}`}>
                  🟢 Presente
                </div>
                <div className={`p-2 rounded-xl border text-center font-bold transition-all ${demoAttendanceChoice === "ausente" ? "bg-red-600 text-white" : "bg-white/5 border-white/10 opacity-50"}`}>
                  🔴 Ausente
                </div>
                <div className={`p-2 rounded-xl border text-center font-bold transition-all ${demoAttendanceChoice === "tarde" ? "bg-amber-600 text-white" : "bg-white/5 border-white/10 opacity-50"}`}>
                  🟡 Tarde
                </div>
                <div className={`p-2 rounded-xl border text-center font-black transition-all ${demoAttendanceChoice === "justificada" ? "bg-blue-600 text-white border-blue-400 shadow-lg scale-105 ring-2 ring-blue-400" : "bg-white/5 border-white/10"}`}>
                  🔵 Justificada
                </div>
              </div>

              {demoAttendanceChoice === "justificada" && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-2xl bg-blue-500/15 border border-blue-400/40 text-xs text-blue-200 space-y-1"
                >
                  <p className="font-black flex items-center gap-1.5">
                    ✨ Crédito Abonado Automáticamente
                  </p>
                  <p className="text-[11px] leading-relaxed text-blue-100/90">
                    Al marcar <strong>Justificada</strong>, el sistema sumó +1 a los créditos de recuperación del alumno para coordinar su clase compensatoria.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* ── MODAL DEMO EN VIVO: PAPELERA, FILTROS Y RESTAURAR (PASO 4) ── */}
      {demoModalOpen === "trash" && (
        <div className="absolute inset-0 flex items-center justify-center z-40 p-4 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl rounded-3xl border-2 border-rose-500/50 bg-[#0D0B0A] p-5 sm:p-6 shadow-2xl text-[#FFF8EC] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🗑️</span>
                <div>
                  <h4 className="text-sm font-black text-white">Papelera y Leads de Reincorporación</h4>
                  <p className="text-[11px] text-neutral-400">Demostración de filtros, mensajes de WhatsApp y restauración</p>
                </div>
              </div>
              <Badge className="bg-rose-500/20 text-rose-300 text-[10px]">Módulo Crítico</Badge>
            </div>

            {/* Pestañas de Segmentación */}
            <div className="flex gap-2">
              <button
                onClick={() => setDemoTrashTab("reincorporacion")}
                className={`flex-1 py-1.5 px-3 rounded-xl font-black text-xs border transition-all ${
                  demoTrashTab === "reincorporacion"
                    ? "bg-[#F47B20] text-[#15120F] border-[#FFB52E] shadow-md"
                    : "bg-white/5 text-neutral-400 border-white/10"
                }`}
              >
                🎯 Leads Reincorporación (Falta de Pago / Retiro)
              </button>
              <button
                onClick={() => setDemoTrashTab("descartables")}
                className={`py-1.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                  demoTrashTab === "descartables"
                    ? "bg-white/20 text-white border-white/40"
                    : "bg-white/5 text-neutral-400 border-white/10"
                }`}
              >
                🗑️ Descartables
              </button>
            </div>

            {/* Fila de Alumno en Papelera con Acciones */}
            <div className="p-3.5 rounded-2xl bg-[#1A1410] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-white text-xs">Valentina Rivas (Batería)</p>
                  <p className="text-[11px] text-neutral-400">
                    Motivo: <strong className="text-amber-400">Falta de Pago</strong> · Retirada hace 15 días
                  </p>
                </div>

                <Badge className={demoRestored ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}>
                  {demoRestored ? "🟢 Restaurado" : "🔴 En Papelera"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-white/10">
                {/* Botón Copiar Mensaje WhatsApp */}
                <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white font-bold flex items-center gap-1.5">
                  {demoCopiedMsg ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-300">¡Copiado para WhatsApp!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-[#FFB52E]" />
                      <span>Copiar Mensaje de Reincorporación</span>
                    </>
                  )}
                </div>

                {/* Botón Restaurar Alumno */}
                <div className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                  demoRestored
                    ? "bg-emerald-500 text-[#15120F] shadow-md"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{demoRestored ? "¡Alumno en Lista Activa!" : "Restaurar Alumno"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 🎛️ BARRA FLOTANTE INFERIOR (HUD CONTROLLER) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-2xl pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border-2 border-[#F47B20]/40 bg-[#0D0B0A]/95 p-3 sm:p-4 shadow-[0_8px_32px_rgba(0,0,0,0.85)] text-[#FFF8EC] backdrop-blur-xl flex flex-wrap items-center justify-between gap-3"
        >
          {/* Controles de Reproducción y Pasos */}
          <div className="flex items-center gap-2">
            {/* Pausar / Reanudar */}
            <Button
              size="sm"
              onClick={isPaused ? resumeTour : pauseTour}
              className={`h-9 px-3.5 rounded-xl font-bold text-xs gap-1.5 shadow-md ${
                isPaused
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-white/10 hover:bg-white/15 text-white"
              }`}
              title={isPaused ? "Reanudar autopiloto" : "Pausar para inspeccionar la pantalla"}
            >
              {isPaused ? (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" /> Reanudar
                </>
              ) : (
                <>
                  <Pause className="h-3.5 w-3.5" /> Pausar
                </>
              )}
            </Button>

            {/* Velocidad Normal / Rápido */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSpeed}
              className="h-9 px-2.5 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs gap-1"
              title="Alternar velocidad de animación"
            >
              <FastForward className="h-3.5 w-3.5 text-[#FFB52E]" />
              {speedMultiplier === 1 ? "1x" : "1.8x"}
            </Button>

            {/* Navegación manual de pasos */}
            <div className="flex items-center gap-1 pl-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className="h-8 w-8 p-0 rounded-lg text-white hover:bg-white/10 disabled:opacity-30"
                title="Paso anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Píldoras 1..6 */}
              <div className="flex items-center gap-1 px-1">
                {AUTOPILOT_STEPS.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setStep(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === currentStepIndex
                        ? "w-6 bg-[#FFB52E]"
                        : idx < currentStepIndex
                        ? "w-2.5 bg-[#F47B20]"
                        : "w-2.5 bg-white/20 hover:bg-white/40"
                    }`}
                    title={`Ir al Paso ${s.id}: ${s.title}`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={nextStep}
                disabled={currentStepIndex === AUTOPILOT_STEPS.length - 1}
                className="h-8 w-8 p-0 rounded-lg text-white hover:bg-white/10 disabled:opacity-30"
                title="Siguiente paso"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Salir / Tomar el Control */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={stopTour}
              className="h-9 px-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 text-xs font-bold gap-1"
              title="Detener el tour y tomar el control manual"
            >
              <X className="h-3.5 w-3.5" /> Salir / Tomar Control
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
