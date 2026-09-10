import { create } from "zustand";

export interface AutopilotStepInfo {
  id: number;
  title: string;
  badge: string;
  route: string;
  summary: string;
}

export const AUTOPILOT_STEPS: AutopilotStepInfo[] = [
  {
    id: 1,
    title: "Registro de Alumnos con Contactos Completos",
    badge: "Paso 1 de 7 · Directorio",
    route: "/admin/alumnos",
    summary: "Obligatorio registrar a Papá, Mamá y Contacto de Emergencia con teléfonos para evitar llamadas perdidas.",
  },
  {
    id: 2,
    title: "Asignación de Horario: Días Pareados vs Modo Personalizado",
    badge: "Paso 2 de 7 · Horario del Alumno",
    route: "/admin/alumnos",
    summary: "En la ficha del alumno, presiona '+ Horario' para asignar: Días Pareados (Oficial) o Modo Personalizado (aforo máx 5).",
  },
  {
    id: 3,
    title: "Agenda General Semanal y Aforo Máximo",
    badge: "Paso 3 de 7 · Agenda",
    route: "/admin/agenda",
    summary: "Plan Regular de 2 clases semanales: Lunes jala Miércoles (o Martes jala Jueves). Límite estricto: 5 alumnos por profesor.",
  },
  {
    id: 4,
    title: "Asistencia en Kardex y Justificaciones",
    badge: "Paso 4 de 7 · Asistencia",
    route: "/admin/alumnos",
    summary: "Al marcar Justificada por WhatsApp anticipado, el sistema abona +1 Crédito de Recuperación automáticamente.",
  },
  {
    id: 5,
    title: "Eliminación y Papelera: Filtros y Restauración",
    badge: "Paso 5 de 7 · Papelera",
    route: "/admin/alumnos",
    summary: "Filtra por Leads de Reincorporación, copia mensajes de reconquista para WhatsApp o restaura alumnos con 1 clic.",
  },
  {
    id: 6,
    title: "Cobros y Facturación en Soles (Culqi)",
    badge: "Paso 6 de 7 · Pagos",
    route: "/admin/facturacion",
    summary: "Control de cuotas mensuales en PEN, pagos bancarios o tarjetas vía Culqi con emisión de comprobante.",
  },
  {
    id: 7,
    title: "Accesos WhatsApp y Asistencia Docente en Sede",
    badge: "Paso 7 de 7 · Sede y Docentes",
    route: "/admin",
    summary: "Claves Maestras oficiales inmutables con botón Reset y reloj de fichaje en vivo de los profesores en sede.",
  },
];

interface AutopilotState {
  isActive: boolean;
  isPaused: boolean;
  currentStepIndex: number;
  speedMultiplier: number; // 1 = Normal, 1.8 = Rápido
  cursorPos: { x: number; y: number };
  cursorVisible: boolean;
  isClicking: boolean;
  clickRipple: { x: number; y: number; key: number } | null;
  spotlightRect: { top: number; left: number; width: number; height: number } | null;
  bubble: {
    title: string;
    text: string;
    subtext?: string;
  };

  // Acciones
  startTour: () => void;
  stopTour: () => void;
  pauseTour: () => void;
  resumeTour: () => void;
  setStep: (stepIndex: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  toggleSpeed: () => void;
  setCursorPos: (pos: { x: number; y: number }) => void;
  triggerClick: (pos?: { x: number; y: number }) => void;
  setSpotlight: (rect: { top: number; left: number; width: number; height: number } | null) => void;
  setBubble: (title: string, text: string, subtext?: string) => void;
}

export const useAutopilotStore = create<AutopilotState>((set, get) => ({
  isActive: false,
  isPaused: false,
  currentStepIndex: 0,
  speedMultiplier: 1,
  cursorPos: { x: 300, y: 300 },
  cursorVisible: false,
  isClicking: false,
  clickRipple: null,
  spotlightRect: null,
  bubble: {
    title: "Iniciando Tour Autopiloto",
    text: "Preparando demostración en vivo...",
  },

  startTour: () =>
    set({
      isActive: true,
      isPaused: false,
      currentStepIndex: 0,
      cursorVisible: true,
      cursorPos: {
        x: typeof window !== "undefined" ? window.innerWidth / 2 : 400,
        y: typeof window !== "undefined" ? window.innerHeight / 2 : 300,
      },
    }),

  stopTour: () =>
    set({
      isActive: false,
      isPaused: false,
      cursorVisible: false,
      spotlightRect: null,
    }),

  pauseTour: () => set({ isPaused: true }),
  resumeTour: () => set({ isPaused: false }),

  setStep: (stepIndex: number) => {
    const valid = Math.max(0, Math.min(AUTOPILOT_STEPS.length - 1, stepIndex));
    set({ currentStepIndex: valid });
  },

  nextStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex < AUTOPILOT_STEPS.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      get().stopTour();
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  toggleSpeed: () => {
    const { speedMultiplier } = get();
    set({ speedMultiplier: speedMultiplier === 1 ? 1.8 : 1 });
  },

  setCursorPos: (pos) => set({ cursorPos: pos }),

  triggerClick: (pos) => {
    const current = pos || get().cursorPos;
    set({
      isClicking: true,
      clickRipple: { x: current.x, y: current.y, key: Date.now() },
    });
    setTimeout(() => {
      set({ isClicking: false });
    }, 300);
  },

  setSpotlight: (rect) => set({ spotlightRect: rect }),

  setBubble: (title, text, subtext) =>
    set({
      bubble: { title, text, subtext },
    }),
}));
