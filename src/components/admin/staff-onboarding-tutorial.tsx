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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "@tanstack/react-router";

interface StaffOnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StepData {
  step: number;
  badge: string;
  icon: any;
  title: string;
  subtitle: string;
  route: string;
  routeLabel: string;
  color: string;
  tips: { title: string; desc: string; icon?: string }[];
  keyRule: string;
}

const TUTORIAL_STEPS: StepData[] = [
  {
    step: 1,
    badge: "Paso 1 de 6 · Directorio y Fichas",
    icon: GraduationCap,
    title: "Registro de Nuevos Alumnos",
    subtitle: "Cómo matricular correctamente a un alumno asegurando datos completos de contacto y emergencia.",
    route: "/admin/alumnos",
    routeLabel: "Ir al Directorio de Alumnos",
    color: "text-[#FFB52E]",
    tips: [
      {
        icon: "👤",
        title: "Ficha del Alumno",
        desc: "Ingresa nombre completo, edad exacta (define su categoría oficial) e instrumento de estudio (Piano, Canto, Guitarra, Batería, etc.).",
      },
      {
        icon: "👨‍👩‍👧",
        title: "Papá y Mamá Obligatorios",
        desc: "Pide siempre los nombres y teléfonos completos tanto de la mamá como del papá para asegurar contacto en caso de pagos o ausencias.",
      },
      {
        icon: "🚨",
        title: "Contacto de Emergencia Extra",
        desc: "Registra siempre un apoderado adicional (abuela, tío, tutor) por si los padres no contestan ante emergencias médicas o retrasos al recoger.",
      },
    ],
    keyRule: "💡 Regla Vibra: Un alumno bien registrado desde el día 1 previene morosidades y llamadas perdidas.",
  },
  {
    step: 2,
    badge: "Paso 2 de 6 · Horario y Vacantes",
    icon: Calendar,
    title: "Implementación del Horario",
    subtitle: "Asignación de clases semanales respetando los Días Pareados y el aforo máximo de 5 alumnos por clase.",
    route: "/admin/agenda",
    routeLabel: "Ver Horario de Clases",
    color: "text-[#F47B20]",
    tips: [
      {
        icon: "🔗",
        title: "Modo Días Pareados (Predefinido)",
        desc: "Al elegir Lunes se jala automáticamente Miércoles a la misma hora y sala; si eliges Martes jala Jueves. Cumple 2 veces por semana (8 clases al mes).",
      },
      {
        icon: "⚙️",
        title: "Modo Personalizado",
        desc: "Si el alumno no puede días pareados, activa el modo personalizado para elegir libremente cualquier par de días (ej. Miércoles + Viernes o Lunes + Sábado).",
      },
      {
        icon: "✋",
        title: "Límite Estricto: Máximo 5 Alumnos",
        desc: "Ninguna clase puede tener más de 5 alumnos por profesor. El sistema bloquea automáticamente la franja si está en (5/5) para proteger la calidad educativa.",
      },
    ],
    keyRule: "💡 Regla Vibra: Intensivos son 1 vez por semana (Viernes o Sábados). Recuperaciones se dan según disponibilidad.",
  },
  {
    step: 3,
    badge: "Paso 3 de 6 · Asistencia en Vivo",
    icon: CheckCircle2,
    title: "Control de Asistencias y Kardex",
    subtitle: "Cómo registran asistencia los profesores desde su celular y cómo la supervisa la secretaría.",
    route: "/admin/alumnos",
    routeLabel: "Ver Asistencias en Kardex",
    color: "text-emerald-400",
    tips: [
      {
        icon: "📱",
        title: "Marcado Docente en 1 Clic (/teacher)",
        desc: "El profesor ingresa a su quiosco móvil y marca a cada alumno en su bloque horario: 🟢 Presente, 🔴 Ausente, 🟡 Tarde o 🔵 Justificada.",
      },
      {
        icon: "🔄",
        title: "Créditos de Recuperación Automáticos",
        desc: "Si el profesor o secretaría marca 'Justificada' (avisó antes), el sistema le suma automáticamente +1 crédito de recuperación al alumno.",
      },
      {
        icon: "📊",
        title: "Kardex Histórico en Tiempo Real",
        desc: "La secretaría puede abrir la ficha del alumno en cualquier momento para ver fecha por fecha cuándo vino, con qué profesor y porcentaje de asistencia.",
      },
    ],
    keyRule: "💡 Regla Vibra: Se sincroniza al instante con la base de datos en la nube y se refleja en el portal familiar.",
  },
  {
    step: 4,
    badge: "Paso 4 de 6 · Pagos y Morosidad",
    icon: CreditCard,
    title: "Cobros, Cuotas y Facturación",
    subtitle: "Seguimiento del estado de pago de las familias y registro de transferencias o pasarela Culqi.",
    route: "/admin/facturacion",
    routeLabel: "Ir a Cobros y Facturación",
    color: "text-[#FF9E3D]",
    tips: [
      {
        icon: "🏷️",
        title: "Estados: Al Día vs Pendiente/Vencido",
        desc: "El semáforo financiero te indica en verde las familias que ya pagaron y en rojo/naranja las cuotas que requieren recordatorio por WhatsApp.",
      },
      {
        icon: "🧾",
        title: "Registro Rápido de Pagos",
        desc: "Registra pagos en Soles (PEN) indicando método (Transferencia BCP/BBVA, Yape, Plin o Tarjeta Culqi). Emite recibo digital inmediato.",
      },
      {
        icon: "🚨",
        title: "Familias en Riesgo",
        desc: "El panel principal detecta automáticamente si una familia acumula faltas o pagos pendientes para coordinar su reincorporación o promociones.",
      },
    ],
    keyRule: "💡 Regla Vibra: Culqi es la pasarela oficial para cobros en Soles peruanos (PEN).",
  },
  {
    step: 5,
    badge: "Paso 5 de 6 · Claves y Accesos",
    icon: UserPlus,
    title: "Invitaciones y Claves Maestras",
    subtitle: "Envío de accesos seguros por WhatsApp con contraseñas maestras estables de contingencia.",
    route: "/admin/invitaciones",
    routeLabel: "Gestionar Invitaciones",
    color: "text-[#FFB52E]",
    tips: [
      {
        icon: "💬",
        title: "Mensaje Oficial de WhatsApp",
        desc: "Al crear una invitación, el sistema genera el texto listo para copiar y enviar al profesor o familia con su enlace personalizado.",
      },
      {
        icon: "🔑",
        title: "Claves Maestras Únicas",
        desc: "Cada profesor tiene su Clave Maestra oficial (Fernando: Vibra-FERNAN-2026, Jeremy: Vibra-ZL3F-EMGN, Nathaly: Vibra-NATHAL-2026). No cambian solas.",
      },
      {
        icon: "🔄",
        title: "Botón Reset Seguro",
        desc: "Si un profesor olvida su clave personal, el botón 'Reset' restaura su Clave Maestra oficial a estado pendiente para que vuelva a ingresar.",
      },
    ],
    keyRule: "💡 Regla Vibra: Una vez aceptada en su teléfono, el docente entra directo sin volver a crear clave.",
  },
  {
    step: 6,
    badge: "Paso 6 de 6 · Fichaje y Nómina",
    icon: UserCheck,
    title: "Asistencia Docente en Sede",
    subtitle: "Monitoreo en vivo de los profesores presentes en la sede de Miraflores y cálculo mensual de horas.",
    route: "/admin/control-horario",
    routeLabel: "Ver Asistencia Docente",
    color: "text-emerald-400",
    tips: [
      {
        icon: "⏱️",
        title: "Reloj de Fichaje al Llegar",
        desc: "Al ingresar a la academia, el profesor presiona 'Marcar Entrada' en su móvil. El sistema empieza a contabilizar sus horas trabajadas en sede.",
      },
      {
        icon: "🟢",
        title: "Monitoreo en Vivo para Secretaría",
        desc: "En el dashboard y en Control Horario ves la lista de profesores que están actualmente 'Trabajando' en sede esperando a sus alumnos.",
      },
      {
        icon: "📑",
        title: "Kardex Mensual de Nómina",
        desc: "Al final del mes, secretaría y dirección pueden ver el total de horas netas y turnos de cada docente para el cierre de pagos.",
      },
    ],
    keyRule: "💡 Regla Vibra: Los profesores fichan desde su enlace personal en cualquier celular o tablet de sede.",
  },
];

export function StaffOnboardingTutorial({ isOpen, onClose }: StaffOnboardingTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const navigate = useNavigate();

  const currentStep = TUTORIAL_STEPS[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / TUTORIAL_STEPS.length) * 100);

  const handleNext = () => {
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
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
      <DialogContent className="max-w-[94vw] sm:max-w-2xl w-full p-0 overflow-hidden rounded-3xl bg-[#0D0B0A] border-2 border-[#F47B20]/30 shadow-2xl text-[#FFF8EC]">
        {/* Cabecera con Progreso y Colores Oficiales */}
        <div className="bg-[#1A1410] border-b border-[#F47B20]/20 p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-[#F47B20]/20 text-[#F47B20] font-black text-sm">
                🎓
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#FFB52E]">
                  Guía de Inducción Operativa · Vibra Music
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Paso a paso para Secretaría y Dirección General
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
              title="Cerrar tutorial"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-[#FF9E3D]">{currentStep.badge}</span>
              <span className="text-muted-foreground font-mono">{progressPercent}% completado</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#F47B20] to-[#FFB52E] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Contenido del Paso */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Título del paso */}
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                  <currentStep.icon className={`h-6 w-6 ${currentStep.color} shrink-0`} />
                  {currentStep.title}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 font-medium">
                  {currentStep.subtitle}
                </p>
              </div>

              {/* Tarjetas con Consejos y Reglas Operativas */}
              <div className="grid gap-2.5 sm:gap-3">
                {currentStep.tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#1A1410] border border-white/10 hover:border-[#F47B20]/40 transition-colors shadow-xs"
                  >
                    <span className="text-xl shrink-0 p-1 bg-white/5 rounded-xl">{tip.icon}</span>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white">{tip.title}</p>
                      <p className="text-[11px] sm:text-xs text-neutral-300 leading-relaxed font-normal">
                        {tip.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Regla de Oro / Alerta Clave */}
              <div className="rounded-2xl border border-[#FFB52E]/30 bg-[#FFB52E]/10 p-3 text-xs font-semibold text-[#FFB52E] flex items-center gap-2">
                <Lightbulb className="h-4 w-4 shrink-0 text-[#FFB52E]" />
                <span>{currentStep.keyRule}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pie de navegación */}
        <div className="bg-[#1A1410] border-t border-[#F47B20]/20 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="border-white/10 hover:bg-white/10 text-white font-bold h-9 text-xs"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigateToModule(currentStep.route)}
              className="text-[#FF9E3D] hover:bg-[#FF9E3D]/10 font-bold h-9 text-xs gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {currentStep.routeLabel}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFinish}
              className="text-muted-foreground hover:text-white text-xs"
            >
              Saltar
            </Button>

            <Button
              size="sm"
              onClick={handleNext}
              className="bg-gradient-to-r from-[#F47B20] to-[#FF9E3D] hover:from-[#F47B20]/90 hover:to-[#FF9E3D]/90 text-white font-black h-9 text-xs gap-1.5 shadow-md px-4"
            >
              {currentStepIndex === TUTORIAL_STEPS.length - 1 ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> ¡Entendido! Completar
                </>
              ) : (
                <>
                  Siguiente <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
