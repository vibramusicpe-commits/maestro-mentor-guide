import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Zap,
  Clock,
  Calendar,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  DoorOpen,
  Phone,
  Copy,
  Download,
  BookOpen,
  Send,
  MessageSquare,
  FileSpreadsheet,
  X,
  Minus,
  EyeOff,
  ChevronUp,
  ArrowRight,
  Plus,
  SlidersHorizontal,
  ExternalLink,
  RotateCw,
  HelpCircle,
  Users2,
} from "lucide-react";
import { useAppStore, type AdminStudent } from "@/store/app-store";
import { defaultLaya } from "@/lib/laya/laya-engine";
import { LAYA_REPROGRAMACION_QUESTIONS } from "@/lib/laya/laya-schemas";
import {
  extractStudentFromText,
  resolveTeacherAndRoomByPedagogy,
  analyzeSlotAvailability,
  computeStudentKardexSummary,
  buildWhatsAppReply,
  generateRealtimeVacancySnapshot,
  type MatchedSlotAnalysis,
  type StudentKardexSummary,
  type DisambiguationCandidate,
} from "@/lib/laya/laya-realtime-matcher";
import { resolveAcademyKnowledge, type AcademyKnowledgeResponse } from "@/lib/laya/laya-knowledge-base";
import { StudentAttendanceKardex } from "@/components/admin/student-attendance-kardex";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LayaCopilotFlowProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function LayaCopilotFlow({ isOpen, onToggle, onClose }: LayaCopilotFlowProps) {
  const adminStudents = useAppStore((s) => s.adminStudents);
  const schedule = useAppStore((s) => s.schedule);

  // Modo de visualización: 'capsule' (barra inferior minimizada) o 'sidebar' (panel lateral derecho)
  const [viewMode, setViewMode] = useState<"capsule" | "sidebar">("capsule");
  // 🛡️ Ocultamiento total (EyeOff): retira panel lateral y cápsula flotante hasta pulsar Ctrl+Shift+L
  const [isFullyHidden, setIsFullyHidden] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // Alumno seleccionado manualmente (por desambiguación)
  const [manualStudent, setManualStudent] = useState<AdminStudent | null>(null);

  // Alumno seleccionado para abrir Kardex modal
  const [kardexStudent, setKardexStudent] = useState<AdminStudent | null>(null);

  // Modal para ver y exportar Snapshot de Meta
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);

  // Referencia para enfocar input
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar alumnos activos
  const activeStudents = useMemo(() => {
    return adminStudents.filter((st) => st.status === "activo");
  }, [adminStudents]);

  // Estado del análisis de Laya
  const [parsedData, setParsedData] = useState<{
    detectedStudent?: AdminStudent;
    studentConfidence: number;
    candidates: DisambiguationCandidate[];
    isAmbiguous: boolean;
    intent: string;
    day: string;
    time: string;
    reason: string;
    isJustified: boolean;
    urgencyLabel: string;
    kardexSummary?: StudentKardexSummary;
    slotAnalysis?: MatchedSlotAnalysis;
    academyKnowledge?: AcademyKnowledgeResponse | null;
    whatsAppReply: string;
  } | null>(null);

  // Ejecutar inferencia de Sistema 1 con Laya (<35 ms)
  const runLayaAnalysis = async (textToAnalyze: string, forcedStudent?: AdminStudent) => {
    if (!textToAnalyze.trim()) {
      setParsedData(null);
      return;
    }

    setIsProcessing(true);
    const start = performance.now();

    try {
      // 1. Predicción no-autorregresiva tipada de Laya (Sistema 1)
      const prediction = await defaultLaya.predict(textToAnalyze, LAYA_REPROGRAMACION_QUESTIONS);
      const { answers, routing } = prediction;

      // 2. Extracción y matching de alumno con Pauta Anti-Colisión (ADR-0140 / ADR-0142)
      let matchedSt: AdminStudent | undefined = forcedStudent;
      let stConfidence = 1.0;
      let candidates: DisambiguationCandidate[] = [];
      let isAmbiguous = false;

      if (!matchedSt) {
        const matchResult = extractStudentFromText(textToAnalyze, activeStudents);
        matchedSt = matchResult.student;
        stConfidence = matchResult.confidence;
        candidates = matchResult.candidates;
        isAmbiguous = matchResult.isAmbiguous;
      }

      // 2b. Evaluación de Base de Conocimientos de Inducción y Guardrails de Seguridad (ADR-0142)
      const academyKnowledge = resolveAcademyKnowledge(textToAnalyze);

      // 3. Resolución de docente y sala por pedagogía oficial (ADR-0102)
      const dayVal = answers.dia?.choice || "indeterminado";
      const timeVal = answers.horario?.choice || "indeterminado";
      let intentVal = answers.intent?.choice || "general";
      if (academyKnowledge) {
        intentVal = "consulta_sistema_academia";
      }
      const reasonVal = answers.motivo_falta?.choice || "injustificada";
      const isJustifiedVal = !!answers.es_justificada?.noul;
      const urgencyLabel = answers.urgencia?.label || "Normal";

      const { teacher: assignedTeacher, room: assignedRoom } = resolveTeacherAndRoomByPedagogy({
        instrument: matchedSt?.instrument,
        age: matchedSt?.age,
        preferredTeacher: matchedSt?.teacher,
      });

      // 4. Si el alumno está resuelto, calcular su resumen matemático de Kardex en vivo
      let kardexSummary: StudentKardexSummary | undefined;
      if (matchedSt) {
        kardexSummary = computeStudentKardexSummary(matchedSt, schedule);
      }

      // 5. Análisis de aforo en vivo si hay día y hora válidos
      let slotAnalysis: MatchedSlotAnalysis | undefined = undefined;
      if (dayVal !== "indeterminado" && timeVal !== "indeterminado") {
        slotAnalysis = analyzeSlotAvailability({
          day: dayVal,
          time: timeVal,
          teacher: assignedTeacher,
          room: assignedRoom,
          schedule,
          activeStudents,
        });
      }

      // 6. Redacción instantánea de respuesta de WhatsApp
      const whatsAppReply = buildWhatsAppReply({
        studentName: matchedSt?.name,
        familyName: matchedSt?.family,
        intent: intentVal,
        day: dayVal,
        time: timeVal,
        teacher: assignedTeacher,
        room: assignedRoom,
        isAvailable: slotAnalysis?.isAvailable ?? true,
        alternatives: slotAnalysis?.alternatives || [],
        kardexSummary,
        academyKnowledge,
      });

      setLatencyMs(routing.latencyMs || Math.round((performance.now() - start) * 10) / 10);
      setParsedData({
        detectedStudent: matchedSt,
        studentConfidence: stConfidence,
        candidates,
        isAmbiguous,
        intent: intentVal,
        day: dayVal,
        time: timeVal,
        reason: reasonVal,
        isJustified: isJustifiedVal,
        urgencyLabel,
        kardexSummary,
        slotAnalysis,
        academyKnowledge,
        whatsAppReply,
      });
    } catch (err) {
      console.error("[Laya Copilot] Error en inferencia:", err);
      toast.error("Error al procesar el texto con Laya");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reaccionar cuando el usuario abre la barra o escribe
  useEffect(() => {
    if (inputPrompt.trim()) {
      const handler = setTimeout(() => {
        runLayaAnalysis(inputPrompt, manualStudent || undefined);
      }, 200);
      return () => clearTimeout(handler);
    } else {
      setParsedData(null);
      setManualStudent(null);
    }
  }, [inputPrompt, manualStudent]);

  // Si se abre desde fuera con isOpen, asegurar que se muestre en modo sidebar y reactivar visibilidad
  useEffect(() => {
    if (isOpen) {
      setIsFullyHidden(false);
      setViewMode("sidebar");
    }
  }, [isOpen]);

  // 🛡️ Inyectar mención @Nombre del alumno y fijar 100% de confianza (ADR-0142)
  const handleInjectMention = (student: AdminStudent) => {
    const mention = `@${student.name} `;
    let newPrompt = inputPrompt;
    if (newPrompt.includes("@")) {
      newPrompt = newPrompt.replace(/@[a-zA-ZÁ-ÿ0-9\s]+?(?=$|[,\.\?!]|\s{2,})/, mention);
    } else {
      const firstName = student.name.split(" ")[0].toLowerCase();
      const regex = new RegExp(`\\b${firstName}\\b`, "i");
      if (regex.test(newPrompt)) {
        newPrompt = newPrompt.replace(regex, mention);
      } else {
        newPrompt = `${mention}${newPrompt}`.trim();
      }
    }
    setInputPrompt(newPrompt);
    setManualStudent(student);
    toast.success(`Alumno fijado con @: ${student.name}`);
    runLayaAnalysis(newPrompt, student);
  };

  // Selección manual en caso de ambigüedad / homónimos
  const handleSelectCandidate = (candidate: AdminStudent) => {
    handleInjectMention(candidate);
  };

  // Enviar mensaje / expandir a sidebar
  const handleSubmitPrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim()) {
      setViewMode("sidebar");
      return;
    }
    setViewMode("sidebar");
    runLayaAnalysis(inputPrompt, manualStudent || undefined);
  };

  // Copiar respuesta de WhatsApp
  const handleCopyWhatsApp = () => {
    if (!parsedData?.whatsAppReply) return;
    navigator.clipboard.writeText(parsedData.whatsAppReply);
    toast.success("Respuesta copiada al portapapeles");
  };

  // Abrir WhatsApp Web con el mensaje pre-llenado (wa.me)
  const handleOpenWhatsAppWeb = () => {
    if (!parsedData) return;
    const phone = parsedData.detectedStudent?.phone || parsedData.detectedStudent?.emergencyContact?.phone || "";
    const cleanPhone = phone.replace(/\D/g, "");
    const finalPhone = cleanPhone.startsWith("51") ? cleanPhone : cleanPhone ? `51${cleanPhone}` : "51900000000";

    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(parsedData.whatsAppReply)}`;
    window.open(url, "_blank");
    toast.success(`Abriendo WhatsApp Web con Familia ${parsedData.detectedStudent?.family || "del Alumno"}`);
  };

  // Snapshot de vacantes en tiempo real
  const vacancySnapshot = useMemo(() => {
    return generateRealtimeVacancySnapshot({ schedule, activeStudents });
  }, [schedule, activeStudents]);

  const handleCopyPromptContext = () => {
    navigator.clipboard.writeText(vacancySnapshot.markdownPromptContext);
    toast.success("Snapshot de vacantes copiado para Meta Business / Prompt IA");
  };

  const handleDownloadCSV = () => {
    const blob = new Blob([vacancySnapshot.csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `vacantes_vibra_staff_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Archivo CSV de vacantes descargado con éxito");
  };

  // Renderizar la Cápsula Inferior (Modo Google Flow)
  const renderBottomCapsule = () => {
    if (viewMode === "sidebar" || isFullyHidden) return null;

    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 pointer-events-auto">
        <form
          onSubmit={handleSubmitPrompt}
          className="flex items-center gap-2 bg-[#1A1410]/95 backdrop-blur-md border border-white/10 hover:border-[#F47B20]/40 rounded-full px-4 py-2.5 shadow-2xl transition-all group"
        >
          {/* Botón Acción (+) */}
          <button
            type="button"
            onClick={() => setIsSnapshotOpen(true)}
            className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Exportar Snapshot de Vacantes para Meta Business"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Badge del Agente Copiloto Laya */}
          <button
            type="button"
            onClick={() => setViewMode("sidebar")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-black font-bold text-xs shadow-sm hover:bg-white/90 transition-all shrink-0 cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 fill-black text-black" />
            <span>Copiloto Laya</span>
          </button>

          {/* Input de Texto Libre con Autocompletado Tab (ADR-0142) */}
          <input
            ref={inputRef}
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                const topStudent = parsedData?.detectedStudent || parsedData?.candidates?.[0]?.student;
                if (topStudent) {
                  e.preventDefault();
                  handleInjectMention(topStudent);
                }
              }
            }}
            placeholder="Pega el mensaje o escribe @alumno... (Tab autocompleta)"
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none px-2 min-w-0"
          />

          {/* Botón Snapshot Rápido */}
          <button
            type="button"
            onClick={() => setIsSnapshotOpen(true)}
            className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground hover:text-[#F47B20] px-2 py-1 rounded-md transition-colors shrink-0"
            title="Snapshot Meta"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
          </button>

          {/* Botón Enviar / Desplegar (➔) */}
          <button
            type="submit"
            className="h-8 w-8 rounded-full bg-[#F47B20] hover:bg-[#FF9E3D] text-[#0D0B0A] flex items-center justify-center font-black transition-all hover:scale-105 shrink-0 shadow-md cursor-pointer"
            title="Analizar con Laya en Panel Lateral"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    );
  };

  // Renderizar el Panel Lateral Derecho (Modo Google Flow Sidebar)
  const renderRightSidebar = () => {
    if (viewMode !== "sidebar" || isFullyHidden) return null;

    return (
      <div className="fixed top-0 right-0 h-screen w-full sm:w-[460px] lg:w-[480px] z-50 bg-[#0D0B0A] border-l border-white/10 shadow-2xl flex flex-col text-foreground animate-in slide-in-from-right duration-300">
        {/* Cabecera del Panel Lateral */}
        <div className="p-4 border-b border-white/10 bg-[#1A1410] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#F47B20]/20 text-[#F47B20] border border-[#F47B20]/30 shadow-2xs">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-wide text-foreground">Copiloto Laya</h3>
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
                  {latencyMs !== null ? `${latencyMs} ms` : "Sistema 1 · <35ms"}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">Triage inteligente en tiempo real con PostgreSQL</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Snapshot Meta */}
            <button
              onClick={() => setIsSnapshotOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              title="Exportar Snapshot de Vacantes para Meta"
            >
              <FileSpreadsheet className="h-4 w-4" />
            </button>

            {/* 👁️ Ocultar completamente Copiloto Laya (EyeOff) — Exclusivo en vista lateral (ADR-0142) */}
            <button
              onClick={() => {
                setIsFullyHidden(true);
                onClose();
                toast.info("Copiloto Laya ocultado. Presiona Ctrl+Shift+L o el botón superior para reactivarlo.");
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-[#F47B20] transition-colors cursor-pointer"
              title="Ocultar Copiloto Laya (Reactivar con Ctrl+Shift+L o botón superior)"
            >
              <EyeOff className="h-4 w-4" />
            </button>

            {/* Minimizar a cápsula inferior */}
            <button
              onClick={() => {
                setViewMode("capsule");
                onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              title="Minimizar a cápsula inferior"
            >
              <Minus className="h-4 w-4" />
            </button>

            {/* Cerrar completamente */}
            <button
              onClick={() => {
                setViewMode("capsule");
                onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
              title="Cerrar panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Cuerpo Desplazable del Panel Lateral */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Mensaje Analizado */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground flex items-center justify-between">
              <span>Mensaje del apoderado o solicitud:</span>
              {inputPrompt && (
                <button
                  onClick={() => {
                    setInputPrompt("");
                    setManualStudent(null);
                  }}
                  className="text-[10px] text-primary hover:underline"
                >
                  Limpiar
                </button>
              )}
            </label>
            <div className="p-3 rounded-xl bg-card border border-white/10 text-xs text-foreground focus-within:border-[#F47B20]/50 transition-colors">
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Tab") {
                    const topStudent = parsedData?.detectedStudent || parsedData?.candidates?.[0]?.student;
                    if (topStudent) {
                      e.preventDefault();
                      handleInjectMention(topStudent);
                    }
                  }
                }}
                placeholder="Pega aquí el mensaje o consulta... (Presiona Tab para autocompletar @alumno)"
                className="w-full bg-transparent resize-none focus:outline-none min-h-[55px] text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* PAUTA ANTI-COLISIÓN: Estado de Desambiguación de Homónimos (ADR-0141 / ADR-0142) */}
          {parsedData?.isAmbiguous && (
            <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-2.5 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="text-xs font-black">
                  Ambigüedad detectada: Varios alumnos coinciden con este nombre
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Para evitar errores pedagógicos o cruces de horario, confirma a cuál de las siguientes alumnas te refieres:
              </p>
              <div className="space-y-1.5 pt-1">
                {parsedData.candidates.map((cand) => (
                  <button
                    key={cand.student.id}
                    onClick={() => handleInjectMention(cand.student)}
                    className="w-full text-left p-2.5 rounded-lg bg-card/80 hover:bg-card border border-white/10 hover:border-amber-500/50 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground group-hover:text-amber-400">
                        {cand.student.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {cand.student.instrument} · Prof. {cand.student.teacher} · {cand.student.family}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400 font-bold">
                      @ Elegir
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BASE DE CONOCIMIENTOS / INDUCCIÓN / GUARDRAILS (ADR-0142) */}
          {parsedData?.academyKnowledge && (
            <div
              className={`p-3.5 rounded-xl border ${
                parsedData.academyKnowledge.isRestricted
                  ? "border-rose-500/40 bg-rose-500/10"
                  : "border-primary/30 bg-primary/5"
              } space-y-2.5 animate-in fade-in`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  Manual & Reglas de Academia
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    parsedData.academyKnowledge.isRestricted
                      ? "border-rose-500/40 text-rose-400 bg-rose-500/20"
                      : "border-primary/40 text-primary bg-primary/10"
                  }`}
                >
                  {parsedData.academyKnowledge.isRestricted
                    ? "🔒 Restringido"
                    : parsedData.academyKnowledge.category === "master_adulto"
                    ? "🎓 Master = Adulto"
                    : parsedData.academyKnowledge.category === "categorias_edad"
                    ? "👶 Categorías & Edades"
                    : parsedData.academyKnowledge.category === "convivencia_salas"
                    ? "🏛️ Regla Convivencia"
                    : parsedData.academyKnowledge.category === "planes_estudio"
                    ? "🎵 Planes de Estudio"
                    : "📘 Inducción Oficial"}
                </Badge>
              </div>

              <div>
                <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                  {parsedData.academyKnowledge.title}
                </h4>
                <div className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed font-sans mt-2 p-2.5 rounded-lg bg-black/40 border border-white/5">
                  {parsedData.academyKnowledge.markdownContent}
                </div>
              </div>
            </div>
          )}

          {/* Alumno Resuelto Inequívocamente */}
          {parsedData?.detectedStudent && (
            <div className="p-3 rounded-xl bg-card border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                  Alumno Identificado en PostgreSQL
                </span>
                {parsedData.candidates.length > 1 && (
                  <button
                    onClick={() => {
                      setManualStudent(null);
                      runLayaAnalysis(inputPrompt);
                    }}
                    className="text-[10px] text-primary hover:underline"
                  >
                    Cambiar alumno
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-black text-foreground">
                    {parsedData.detectedStudent.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {parsedData.detectedStudent.instrument} · Prof. {parsedData.detectedStudent.teacher} · {parsedData.detectedStudent.family}
                  </p>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  {Math.round(parsedData.studentConfidence * 100)}% Certeza
                </Badge>
              </div>

              {/* Botón rápido para abrir Kardex */}
              <button
                type="button"
                onClick={() => setKardexStudent(parsedData.detectedStudent || null)}
                className="w-full mt-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-primary border border-primary/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Ver Kardex Completo de {parsedData.detectedStudent.name.split(" ")[0]}</span>
              </button>
            </div>
          )}

          {/* LECTURA EN VIVO DE KARDEX: Si la intención es consulta de clases faltantes */}
          {parsedData?.kardexSummary && (
            <div className="p-3.5 rounded-xl bg-card border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-primary" />
                  Estado de Clases & Cuota (PostgreSQL)
                </span>
                <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                  {parsedData.kardexSummary.cycleCompleted ? "Ciclo Cumplido" : "En Curso"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <p className="text-[10px] text-muted-foreground">Contratadas</p>
                  <p className="text-sm font-black text-foreground">{parsedData.kardexSummary.targetQuota}</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[10px] text-emerald-400">Asistidas</p>
                  <p className="text-sm font-black text-emerald-400">{parsedData.kardexSummary.attendedCount}</p>
                </div>
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <p className="text-[10px] text-rose-400">Inasistencias</p>
                  <p className="text-sm font-black text-rose-400">
                    {parsedData.kardexSummary.absentCount + parsedData.kardexSummary.justifiedCount}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[10px] text-amber-400">Restantes</p>
                  <p className="text-sm font-black text-amber-400">{parsedData.kardexSummary.remainingRegularCount}</p>
                </div>
              </div>

              {parsedData.kardexSummary.makeupCredits > 0 && (
                <div className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg flex items-center justify-between">
                  <span>Créditos de recuperación disponibles:</span>
                  <span className="font-bold font-mono">+{parsedData.kardexSummary.makeupCredits} créditos</span>
                </div>
              )}
            </div>
          )}

          {/* ANÁLISIS DE AFORO EN SALA (Si hay reprogramación) */}
          {parsedData?.slotAnalysis && (
            <div className="p-3.5 rounded-xl bg-card border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
                <DoorOpen className="h-3 w-3 text-primary" />
                Aforo en Sala ({parsedData.slotAnalysis.assignedRoom} · Prof. {parsedData.slotAnalysis.assignedTeacher})
              </span>

              {parsedData.slotAnalysis.pedagogicalNote && (
                <div className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>{parsedData.slotAnalysis.pedagogicalNote}</span>
                </div>
              )}

              {parsedData.slotAnalysis.isAvailable ? (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400">
                      Vacante Disponible ({parsedData.slotAnalysis.enrolledCount}/5 Ocupados)
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400">
                    {parsedData.slotAnalysis.availableVacancies} cupos libres
                  </Badge>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                      <span className="text-xs font-bold text-rose-400">Aforo Completo (5/5 Alumnos)</span>
                    </div>
                    <Badge variant="destructive" className="text-[10px]">
                      Sin cupos
                    </Badge>
                  </div>
                  {parsedData.slotAnalysis.alternatives.length > 0 && (
                    <div className="text-[11px] text-muted-foreground space-y-1">
                      <p className="font-bold text-foreground">Turnos alternativos disponibles:</p>
                      {parsedData.slotAnalysis.alternatives.map((alt, i) => (
                        <div key={i} className="flex items-center justify-between py-1 px-2 rounded bg-white/5">
                          <span>{alt.day} a las {alt.time} ({alt.room})</span>
                          <span className="text-emerald-400 font-bold">{alt.availableVacancies} cupos</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* RESPUESTA LISTA PARA WHATSAPP */}
          {parsedData?.whatsAppReply && (
            <div className="p-3.5 rounded-xl bg-card border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-emerald-400" />
                  Respuesta Lista para Enviar (Costo $0)
                </span>
                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copiar texto</span>
                </button>
              </div>

              <div className="p-3 rounded-lg bg-[#15120F] border border-white/5 text-xs text-foreground/90 whitespace-pre-line leading-relaxed font-sans">
                {parsedData.whatsAppReply}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyWhatsApp}
                  className="gap-1.5 text-xs font-bold border-white/10 hover:bg-white/10"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handleOpenWhatsAppWeb}
                  className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Abrir WhatsApp</span>
                </Button>
              </div>
            </div>
          )}

          {/* Mensaje de bienvenida inicial si está vacío */}
          {!parsedData && !inputPrompt && (
            <div className="py-12 px-4 text-center space-y-3 text-muted-foreground">
              <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#F47B20]">
                <Zap className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-foreground">
                ¿En qué puedo ayudarte hoy?
              </p>
              <p className="text-[11px] max-w-xs mx-auto leading-relaxed">
                Pega el mensaje del apoderado para resolver reprogramaciones, justificar faltas o revisar el balance de clases sin alucinaciones.
              </p>
            </div>
          )}
        </div>

        {/* Barra de Entrada Pinned en el Fondo del Sidebar */}
        <div className="p-3 border-t border-white/10 bg-[#1A1410] shrink-0">
          <form onSubmit={handleSubmitPrompt} className="flex items-center gap-2">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Tab") {
                  const topStudent = parsedData?.detectedStudent || parsedData?.candidates?.[0]?.student;
                  if (topStudent) {
                    e.preventDefault();
                    handleInjectMention(topStudent);
                  }
                }
              }}
              placeholder="Escribe una nueva consulta... (Tab autocompleta @)"
              className="flex-1 bg-card border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#F47B20]/60 transition-colors"
            />
            <Button
              type="submit"
              size="sm"
              className="h-9 w-9 p-0 rounded-xl bg-[#F47B20] hover:bg-[#FF9E3D] text-[#0D0B0A] font-black shrink-0"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. Cápsula Flotante Inferior (Modo Google Flow) */}
      {renderBottomCapsule()}

      {/* 2. Panel Lateral Derecho Deslizable (Modo Google Flow) */}
      {renderRightSidebar()}

      {/* 3. Modal de Kardex si se abre desde el copiloto */}
      {kardexStudent && (
        <StudentAttendanceKardex
          student={kardexStudent}
          isOpen={true}
          onClose={() => setKardexStudent(null)}
        />
      )}

      {/* 4. Diálogo de Snapshot para Meta Business Suite */}
      <Dialog open={isSnapshotOpen} onOpenChange={setIsSnapshotOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto border-white/10 bg-[#15120F] text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2 text-foreground">
              <FileSpreadsheet className="h-4 w-4 text-[#F47B20]" />
              Snapshot de Vacantes en Tiempo Real (Meta Business / IA)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Matriz viva generada desde la agenda de Vibra Music. Cópiala para alimentar el agente de Meta Business Suite o descárgala en CSV.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">
                Vista previa del Prompt Context:
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadCSV}
                  className="gap-1.5 text-xs font-bold border-white/10 hover:bg-white/10"
                >
                  <Download className="h-3.5 w-3.5" />
                  Descargar CSV
                </Button>
                <Button
                  size="sm"
                  onClick={handleCopyPromptContext}
                  className="gap-1.5 text-xs font-bold bg-[#F47B20] hover:bg-[#FF9E3D] text-[#0D0B0A]"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copiar Contexto
                </Button>
              </div>
            </div>

            <pre className="p-3 rounded-xl bg-black/50 border border-white/10 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-64 whitespace-pre-wrap leading-relaxed">
              {vacancySnapshot.markdownPromptContext}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
