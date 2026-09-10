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
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Función utilitaria para inyectar texto real en un Input controlado por React
function setNativeInputValue(input: HTMLInputElement, value: string) {
  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set;
  if (nativeSetter) {
    nativeSetter.call(input, value);
  } else {
    input.value = value;
  }
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

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
    spotlightRect,
    stopTour,
    pauseTour,
    resumeTour,
    nextStep,
    prevStep,
    toggleSpeed,
    setStep,
    setCursorPos,
    triggerClick,
    setSpotlight,
    setBubble,
  } = useAutopilotStore();

  const abortRef = useRef<boolean>(false);

  // Pausar y reanudar con tecla Espacio, salir con Escape
  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAnyOpenTourModals();
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

  // Cierra cualquier sheet o modal abierto por el tour
  const closeAnyOpenTourModals = () => {
    const cancelSheet = document.querySelector<HTMLElement>('[data-tour="btn-cancel-new-student"]');
    if (cancelSheet) cancelSheet.click();

    const closeTrash = document.querySelector<HTMLElement>('[data-tour="trash-close-btn"]');
    if (closeTrash) closeTrash.click();

    const closeKardex = document.querySelector<HTMLElement>('[data-tour="kardex-close-btn"]');
    if (closeKardex) closeKardex.click();
  };

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

  // Esperar a que un elemento exista en el DOM real
  const waitForElement = useCallback(
    async (selector: string, timeoutMs = 7000): Promise<HTMLElement | null> => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        if (abortRef.current) return null;
        const el = document.querySelector<HTMLElement>(selector);
        if (el && el.getBoundingClientRect().width > 0) {
          return el;
        }
        await new Promise((r) => setTimeout(r, 100));
      }
      return null;
    },
    []
  );

  // Mover cursor suavemente a un elemento real del DOM
  const moveCursorToElement = useCallback(
    async (el: HTMLElement, clickIt = false) => {
      if (abortRef.current) return;
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      await wait(300);

      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      setCursorPos({ x, y });
      setSpotlight({
        top: Math.max(0, rect.top - 6),
        left: Math.max(0, rect.left - 6),
        width: rect.width + 12,
        height: rect.height + 12,
      });

      await wait(600);
      if (clickIt) {
        triggerClick({ x, y });
        el.click();
        await wait(400);
      }
    },
    [setCursorPos, setSpotlight, triggerClick, wait]
  );

  // Simulación de tipeo en vivo dentro del Input real
  const typeIntoRealInput = useCallback(
    async (input: HTMLInputElement, text: string) => {
      if (abortRef.current) return;
      input.focus();
      let current = "";
      for (let i = 0; i < text.length; i++) {
        if (abortRef.current) return;
        current += text[i];
        setNativeInputValue(input, current);
        await wait(35);
      }
    },
    [wait]
  );

  // EJECUCIÓN 100% REAL EN EL DOM SEGÚN EL PASO
  useEffect(() => {
    if (!isActive) {
      setSpotlight(null);
      return;
    }

    abortRef.current = false;
    let isCancelled = false;

    const executeRealTour = async () => {
      const step = AUTOPILOT_STEPS[currentStepIndex];

      // Navegar a la página real si es necesario
      if (pathname !== step.route) {
        navigate({ to: step.route });
        await wait(800);
        if (isCancelled || abortRef.current) return;
      }

      // ─── PASO 1: REGISTRO DE ALUMNOS (SHEET REAL) ───
      if (currentStepIndex === 0) {
        setBubble(
          "Paso 1: Registro de Alumnos con Contactos Completos",
          "Moviendo el cursor hacia el botón real '+ Registrar Nuevo Alumno'...",
          "Regla Vibra: Papá, Mamá y Contacto de Emergencia obligatorios."
        );

        const newStudentBtn = await waitForElement('[data-tour="btn-new-student"]');
        if (newStudentBtn) {
          await moveCursorToElement(newStudentBtn, true);
          await wait(600);
        }

        // Tipear en el Input Real del Nombre del Alumno
        const nameInput = await waitForElement('[data-tour="input-student-name"]');
        if (nameInput) {
          setBubble(
            "Tipeo Real en Vivo",
            "Escribiendo datos del alumno con iniciales mayúsculas por respeto y gramática...",
            "Nombre completo de la alumna."
          );
          await moveCursorToElement(nameInput);
          await typeIntoRealInput(nameInput as HTMLInputElement, "Luciana Mendoza Gómez");
          await wait(400);
        }

        // Tipear en Input Real de Papá
        const dadNameInput = await waitForElement('[data-tour="input-father-name"]');
        const dadPhoneInput = await waitForElement('[data-tour="input-father-phone"]');
        if (dadNameInput && dadPhoneInput) {
          await moveCursorToElement(dadNameInput);
          await typeIntoRealInput(dadNameInput as HTMLInputElement, "Carlos Mendoza");
          await moveCursorToElement(dadPhoneInput);
          await typeIntoRealInput(dadPhoneInput as HTMLInputElement, "987 654 321");
          await wait(300);
        }

        // Tipear en Input Real de Mamá
        const momNameInput = await waitForElement('[data-tour="input-mother-name"]');
        const momPhoneInput = await waitForElement('[data-tour="input-mother-phone"]');
        if (momNameInput && momPhoneInput) {
          await moveCursorToElement(momNameInput);
          await typeIntoRealInput(momNameInput as HTMLInputElement, "Rosa Huamán");
          await moveCursorToElement(momPhoneInput);
          await typeIntoRealInput(momPhoneInput as HTMLInputElement, "984 123 456");
          await wait(300);
        }

        // Tipear en Input Real de Contacto de Emergencia
        const emergNameInput = await waitForElement('[data-tour="input-emerg-name"]');
        const emergPhoneInput = await waitForElement('[data-tour="input-emerg-phone"]');
        if (emergNameInput && emergPhoneInput) {
          setBubble(
            "Contacto de Emergencia Obligatorio",
            "Registrando a la Abuela/Tío para evitar llamadas perdidas ante imprevistos...",
            "Vibra Music Staff garantiza contacto 100% efectivo."
          );
          await moveCursorToElement(emergNameInput);
          await typeIntoRealInput(emergNameInput as HTMLInputElement, "Elena Gómez (Abuela)");
          await moveCursorToElement(emergPhoneInput);
          await typeIntoRealInput(emergPhoneInput as HTMLInputElement, "991 000 222");
          await wait(600);
        }

        // Cerrar el Sheet real con el botón Cancelar para no guardar datos de prueba
        const cancelBtn = await waitForElement('[data-tour="btn-cancel-new-student"]');
        if (cancelBtn) {
          await moveCursorToElement(cancelBtn, true);
          await wait(500);
        }

        setBubble(
          "¡Registro Familiar Completado!",
          "Ficha demostrada en el formulario real. Ahora pasaremos a los Horarios Pareados.",
          "Cerrando formulario de forma segura."
        );
        await wait(1800);
      }

      // ─── PASO 2: HORARIOS PAREADOS Y AFORO MÁXIMO ───
      else if (currentStepIndex === 1) {
        setBubble(
          "Paso 2: Horarios Pareados y Aforo Máximo",
          "Navegando a la Agenda semanal. En Vibra Music, el plan regular tiene 2 clases por semana.",
          "Lunes jala Miércoles automáticamente (o Martes jala Jueves). Aforo máximo: 5 alumnos."
        );

        const slotCell = await waitForElement('[data-tour="agenda-slot-cell"]');
        if (slotCell) {
          await moveCursorToElement(slotCell);
          await wait(1800);
        }

        setBubble(
          "Control de Vacantes y Salas",
          "Cada profesor tiene su sala asignada y máximo 5 alumnos por hora para garantizar la calidad pedagógica.",
          "Pasemos al Kardex de Asistencias..."
        );
        await wait(2200);
      }

      // ─── PASO 3: ASISTENCIAS Y KARDEX DEL ALUMNO (MODAL REAL) ───
      else if (currentStepIndex === 2) {
        setBubble(
          "Paso 3: Asistencias y Kardex del Alumno",
          "Regresando al Directorio de Alumnos para abrir el Kardex real de la primera fila...",
          "El profesor toma asistencia desde su celular (/teacher) y se sincroniza aquí."
        );

        const kardexBtn = await waitForElement('[data-tour="btn-row-kardex"]');
        if (kardexBtn) {
          await moveCursorToElement(kardexBtn, true);
          await wait(800);
        }

        // Resaltar el botón Justificada en el modal real
        const justificadaBtn = await waitForElement('[data-tour="kardex-btn-justificada"]');
        if (justificadaBtn) {
          setBubble(
            "Justificación y Crédito de Recuperación",
            "Al marcar una falta como 'Justificada' (aviso previo por WhatsApp de la mamá), el sistema abona +1 crédito.",
            "El alumno podrá coordinar su clase compensatoria sin perder su inversión."
          );
          await moveCursorToElement(justificadaBtn);
          await wait(1800);
        }

        // Cerrar Kardex real
        const closeKardexBtn = await waitForElement('[data-tour="kardex-close-btn"]');
        if (closeKardexBtn) {
          await moveCursorToElement(closeKardexBtn, true);
          await wait(500);
        }

        await wait(1500);
      }

      // ─── PASO 4: PAPELERA, FILTROS Y RESTAURAR (MODAL REAL) ───
      else if (currentStepIndex === 3) {
        setBubble(
          "Paso 4: Papelera y Leads de Reincorporación",
          "El cursor abre la auténtica Papelera del sistema para auditar los alumnos eliminados...",
          "Los alumnos dados de baja no se pierden; se conservan clasificados por motivo."
        );

        const trashBtn = await waitForElement('[data-tour="btn-trash"]');
        if (trashBtn) {
          await moveCursorToElement(trashBtn, true);
          await wait(800);
        }

        // Pestaña real de Leads de Reincorporación
        const reincorpTab = await waitForElement('[data-tour="trash-tab-reincorp"]');
        if (reincorpTab) {
          setBubble(
            "Filtro de Leads de Reincorporación",
            "Muestra exclusivamente los alumnos retirados por Falta de Pago o Retiro Voluntario para campañas de reconquista.",
            "Los errores de registro quedan separados en 'Descartables'."
          );
          await moveCursorToElement(reincorpTab, true);
          await wait(1200);
        }

        // Filtro por motivo
        const filterReason = await waitForElement('[data-tour="trash-filter-reason"]');
        if (filterReason) {
          await moveCursorToElement(filterReason);
          await wait(1000);
        }

        // Botón real de Restaurar Alumno
        const restoreBtn = await waitForElement('[data-tour="trash-btn-restore"]');
        if (restoreBtn) {
          setBubble(
            "Restauración en 1 Clic",
            "Al pulsar 'Restaurar Alumno', el alumno vuelve inmediatamente a la lista activa con todas sus clases y pagos intactos.",
            "Cero pérdida de historial."
          );
          await moveCursorToElement(restoreBtn);
          await wait(1800);
        }

        // Cerrar Papelera real
        const closeTrashBtn = await waitForElement('[data-tour="trash-close-btn"]');
        if (closeTrashBtn) {
          await moveCursorToElement(closeTrashBtn, true);
          await wait(600);
        }

        await wait(1500);
      }

      // ─── PASO 5: FACTURACIÓN Y COBROS EN SOLES (PÁGINA REAL) ───
      else if (currentStepIndex === 4) {
        setBubble(
          "Paso 5: Facturación y Cobros en Soles",
          "En Cobros y Abonos se monitorea la cobranza de mensualidades y matrículas...",
          "Integración oficial con Culqi para pagos con tarjeta en Soles PEN."
        );

        const invoiceRow = await waitForElement('[data-tour="facturacion-invoice-row"]');
        if (invoiceRow) {
          await moveCursorToElement(invoiceRow);
          await wait(2200);
        }

        setBubble(
          "Pagos y Conciliación",
          "Puedes registrar abonos con transferencias bancarias o cobros online, emitiendo comprobante directo para la familia.",
          "Pasemos al último módulo..."
        );
        await wait(2000);
      }

      // ─── PASO 6: MONITOREO DOCENTE EN SEDE Y CIERRE ───
      else if (currentStepIndex === 5) {
        setBubble(
          "Paso 6: Monitoreo Docente en Sede en Vivo",
          "En el Dashboard ves qué profesores están trabajando en sede con su reloj en vivo...",
          "Cada profesor tiene su Clave Maestra oficial inmutable en Invitaciones."
        );

        const teacherWidget = await waitForElement('[data-tour="teacher-live-widget"]');
        if (teacherWidget) {
          await moveCursorToElement(teacherWidget);
          await wait(2500);
        }

        setSpotlight(null);
        setBubble(
          "🎉 ¡Tour Autopiloto en Vivo Completado!",
          "Has recorrido los 6 módulos auténticos de Vibra Music con sus componentes reales.",
          "Ahora estás listo(a) para operar el sistema con total confianza."
        );
      }
    };

    executeRealTour();

    return () => {
      isCancelled = true;
      abortRef.current = true;
      setSpotlight(null);
    };
  }, [
    currentStepIndex,
    isActive,
    navigate,
    pathname,
    setBubble,
    setCursorPos,
    setSpotlight,
    triggerClick,
    wait,
    waitForElement,
    moveCursorToElement,
    typeIntoRealInput,
  ]);

  if (!isActive) return null;

  const currentStep = AUTOPILOT_STEPS[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / AUTOPILOT_STEPS.length) * 100);

  return (
    <div className="fixed inset-0 z-[999999] pointer-events-none select-none overflow-hidden">
      {/* 🌟 RESPLANDOR / FOCO QUIRÚRGICO (SPOTLIGHT) SOBRE EL ELEMENTO REAL */}
      {spotlightRect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute pointer-events-none border-2 border-[#FFB52E] rounded-2xl shadow-[0_0_25px_rgba(244,123,32,0.7)] transition-all duration-300"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
          }}
        />
      )}

      {/* 🖱️ CURSOR VIRTUAL AUTÓNOMO CON ESTELA LUMINOSA */}
      {cursorVisible && (
        <motion.div
          className="absolute z-50 pointer-events-none"
          animate={{ x: cursorPos.x, y: cursorPos.y }}
          transition={{ type: "spring", damping: 26, stiffness: 190 }}
          style={{ willChange: "transform" }}
        >
          <div className="relative">
            {/* Halo pulsante */}
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0.2, 0.7] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="absolute -top-3 -left-3 h-10 w-10 rounded-full bg-[#FFB52E]/40 blur-md pointer-events-none"
            />

            {/* Puntero SVG Oficial Vibra Music */}
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_4px_12px_rgba(244,123,32,0.9)] filter"
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

            {/* Etiqueta animada "Autopiloto" */}
            <div className="absolute top-6 left-5 px-2 py-0.5 rounded-full bg-[#0D0B0A]/95 border border-[#F47B20]/60 text-[9px] font-black text-[#FFB52E] shadow-md flex items-center gap-1 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Autopiloto en Vivo</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 💥 ONDA EXPANSIVA DE CLIC (RIPPLE EFFECT) */}
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

      {/* 💬 CARTEL EXPLICATIVO FLOTANTE SUPERIOR */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-xl pointer-events-auto">
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

      {/* 🎛️ BARRA FLOTANTE INFERIOR (HUD CONTROLLER) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-2xl pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border-2 border-[#F47B20]/40 bg-[#0D0B0A]/95 p-3 sm:p-4 shadow-[0_8px_32px_rgba(0,0,0,0.85)] text-[#FFF8EC] backdrop-blur-xl flex flex-wrap items-center justify-between gap-3"
        >
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
                onClick={() => {
                  closeAnyOpenTourModals();
                  prevStep();
                }}
                disabled={currentStepIndex === 0}
                className="h-8 w-8 p-0 rounded-lg text-white hover:bg-white/10 disabled:opacity-30"
                title="Paso anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1 px-1">
                {AUTOPILOT_STEPS.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      closeAnyOpenTourModals();
                      setStep(idx);
                    }}
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
                onClick={() => {
                  closeAnyOpenTourModals();
                  nextStep();
                }}
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
              onClick={() => {
                closeAnyOpenTourModals();
                stopTour();
              }}
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
