import { useState, useMemo, useEffect } from "react";
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
  RotateCw,
  Send,
  MessageSquare,
  FileSpreadsheet,
} from "lucide-react";
import { useAppStore, type AdminStudent } from "@/store/app-store";
import { defaultLaya } from "@/lib/laya/laya-engine";
import { LAYA_REPROGRAMACION_QUESTIONS } from "@/lib/laya/laya-schemas";
import {
  extractStudentFromText,
  resolveTeacherAndRoomByPedagogy,
  analyzeSlotAvailability,
  buildWhatsAppReply,
  generateRealtimeVacancySnapshot,
  type MatchedSlotAnalysis,
} from "@/lib/laya/laya-realtime-matcher";
import { StudentAttendanceKardex } from "@/components/admin/student-attendance-kardex";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LayaCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export function LayaCopilotModal({ isOpen, onClose, initialPrompt = "" }: LayaCopilotModalProps) {
  const adminStudents = useAppStore((s) => s.adminStudents);
  const schedule = useAppStore((s) => s.schedule);

  const [inputPrompt, setInputPrompt] = useState(initialPrompt);
  const [isProcessing, setIsProcessing] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // Alumno seleccionado para abrir Kardex
  const [kardexStudent, setKardexStudent] = useState<AdminStudent | null>(null);

  // Modal para ver y exportar Snapshot de Meta
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);

  // Estado de análisis
  const [parsedData, setParsedData] = useState<{
    detectedStudent?: AdminStudent;
    studentConfidence: number;
    intent: string;
    day: string;
    time: string;
    reason: string;
    isJustified: boolean;
    urgencyLabel: string;
    slotAnalysis?: MatchedSlotAnalysis;
    whatsAppReply: string;
  } | null>(null);

  const activeStudents = useMemo(() => {
    return adminStudents.filter((st) => st.status === "activo");
  }, [adminStudents]);

  // Ejecutar inferencia de Sistema 1 con Laya (<35 ms)
  const runLayaAnalysis = async (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) {
      setParsedData(null);
      return;
    }

    setIsProcessing(true);
    const start = performance.now();

    try {
      // 1. Predicción no-autorregresiva tipada de Laya
      const prediction = await defaultLaya.predict(textToAnalyze, LAYA_REPROGRAMACION_QUESTIONS);
      const { answers, routing } = prediction;

      // 2. Extracción y matching de alumno en tiempo real
      const { student: matchedSt, confidence: stConfidence } = extractStudentFromText(
        textToAnalyze,
        activeStudents
      );

      // 3. Resolución de docente y sala por pedagogía oficial (ADR-0102)
      const dayVal = answers.dia?.choice || "indeterminado";
      const timeVal = answers.horario?.choice || "indeterminado";
      const intentVal = answers.intent?.choice || "general";
      const reasonVal = answers.motivo_falta?.choice || "injustificada";
      const isJustifiedVal = !!answers.es_justificada?.noul;
      const urgencyLabel = answers.urgencia?.label || "Normal";

      const { teacher: assignedTeacher, room: assignedRoom } = resolveTeacherAndRoomByPedagogy({
        instrument: matchedSt?.instrument,
        age: matchedSt?.age,
        preferredTeacher: matchedSt?.teacher,
      });

      // 4. Análisis de aforo en vivo si hay día y hora válidos
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

      // 5. Redacción instantánea de respuesta de WhatsApp
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
      });

      setLatencyMs(routing.latencyMs || Math.round((performance.now() - start) * 10) / 10);
      setParsedData({
        detectedStudent: matchedSt,
        studentConfidence: stConfidence,
        intent: intentVal,
        day: dayVal,
        time: timeVal,
        reason: reasonVal,
        isJustified: isJustifiedVal,
        urgencyLabel,
        slotAnalysis,
        whatsAppReply,
      });
    } catch (err) {
      console.error("[Laya Copilot] Error en inferencia:", err);
      toast.error("Error al procesar el texto con Laya");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (initialPrompt) {
      setInputPrompt(initialPrompt);
      runLayaAnalysis(initialPrompt);
    }
  }, [initialPrompt]);

  // Manejar cambio en textarea con debounce automático de 250ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputPrompt.trim()) {
        runLayaAnalysis(inputPrompt);
      } else {
        setParsedData(null);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [inputPrompt]);

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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto p-0 border-border bg-card">
          {/* Cabecera del Copiloto Laya */}
          <div className="p-4 sm:p-5 border-b border-border bg-gradient-to-r from-[#F47B20]/15 via-background to-background flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#F47B20]/20 text-[#F47B20] border border-[#F47B20]/30 shadow-2xs">
                  <Zap className="h-4 w-4" />
                </span>
                <DialogTitle className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
                  Copiloto Laya · Inteligencia en Tiempo Real
                  <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary bg-primary/10">
                    Sistema 1 · ~33ms
                  </Badge>
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Pega el mensaje del apoderado o escribe la solicitud para verificar vacantes en sala y generar respuestas listas.
              </DialogDescription>
            </div>

            {/* Botón Snapshot de Vacantes para Agente Meta */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsSnapshotOpen(true)}
              className="gap-1.5 text-xs font-bold border-primary/40 text-primary hover:bg-primary/10 shrink-0"
              title="Exportar matriz de vacantes libres para el agente de Meta Business Suite"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Snapshot Meta</span>
            </Button>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Input de Texto Libre / Mensaje Copiado */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  Mensaje del apoderado o solicitud:
                </label>
                {latencyMs !== null && (
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    ⚡ Inferencia: {latencyMs} ms
                  </span>
                )}
              </div>

              <Textarea
                placeholder="Pega aquí el mensaje de WhatsApp o lo que te dijo el apoderado... (Ej: 'La mamá de Thiago solicita recuperar su clase este jueves a las 6pm con Jeremy')"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                className="text-xs min-h-[75px] resize-y bg-background"
              />

              {/* Chips de ejemplos rápidos */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
                <span className="text-[10px] font-semibold">Ejemplos rápidos:</span>
                <button
                  type="button"
                  onClick={() => setInputPrompt("La mamá de Thiago solicita recuperar su clase este jueves a las 6pm")}
                  className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-[10px] text-foreground border border-border"
                >
                  💡 Thiago jueves 6pm
                </button>
                <button
                  type="button"
                  onClick={() => setInputPrompt("Cielo Chamorro quiere recuperar el jueves a las 7pm")}
                  className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-[10px] text-foreground border border-border"
                >
                  💡 Cielo Chamorro jueves 7pm
                </button>
                <button
                  type="button"
                  onClick={() => setInputPrompt("Aviso que Mafer no podrá asistir hoy por fiebre médica")}
                  className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-[10px] text-foreground border border-border"
                >
                  💡 Mafer falta por salud
                </button>
              </div>
            </div>

            {/* Resultado del Análisis en Vivo */}
            {parsedData && (
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-3">
                {/* 1. Alumno Detectado e Intención */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-card border border-border space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Alumno Identificado
                    </span>
                    {parsedData.detectedStudent ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground text-sm">{parsedData.detectedStudent.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {parsedData.detectedStudent.instrument} · {parsedData.detectedStudent.teacher}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                          Activo ({(parsedData.studentConfidence * 100).toFixed(0)}%)
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-amber-600 dark:text-amber-400 font-semibold">
                        ⚠️ Alumno no identificado en el texto (menciona su nombre)
                      </p>
                    )}
                  </div>

                  <div className="p-2.5 rounded-lg bg-card border border-border space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Intención & Gestión
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge className="bg-primary/15 text-primary border-primary/30 text-xs font-bold">
                        {parsedData.intent.toUpperCase().replace("_", " ")}
                      </Badge>
                      {parsedData.isJustified && (
                        <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-[10px]">
                          Falta Justificada (Abona Crédito)
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Urgencia: <strong>{parsedData.urgencyLabel}</strong>
                    </p>
                  </div>
                </div>

                {/* 2. Semáforo de Aforo y Disponibilidad en Sala */}
                {parsedData.slotAnalysis && (
                  <div className="p-3 rounded-lg bg-card border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <DoorOpen className="h-3.5 w-3.5 text-primary" />
                        Disponibilidad en Sala: {parsedData.slotAnalysis.assignedRoom} ({parsedData.slotAnalysis.assignedTeacher})
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {parsedData.slotAnalysis.requestedDay} {parsedData.slotAnalysis.requestedTime}
                      </span>
                    </div>

                    {parsedData.slotAnalysis.isAvailable ? (
                      <div className="p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-bold text-emerald-700 dark:text-emerald-300">
                              🟢 Vacante Disponible ({parsedData.slotAnalysis.enrolledCount}/5 alumnos en sala)
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Quedan {parsedData.slotAnalysis.availableVacancies} cupos libres para este turno.
                            </p>
                          </div>
                        </div>

                        {parsedData.detectedStudent && (
                          <Button
                            size="sm"
                            onClick={() => setKardexStudent(parsedData.detectedStudent!)}
                            className="h-7 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          >
                            <RotateCw className="h-3 w-3" />
                            Agendar en Kardex
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
                        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <p className="font-bold">
                            🔴 Aforo Completo (5/5 alumnos inscritos). No se puede sobrecargar la sala.
                          </p>
                        </div>

                        {/* Turnos alternativos propuestos */}
                        {parsedData.slotAnalysis.alternatives.length > 0 && (
                          <div className="pt-1 border-t border-rose-500/20">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                              Turnos alternativos recomendados con el mismo docente:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {parsedData.slotAnalysis.alternatives.map((alt, aIdx) => (
                                <Button
                                  key={aIdx}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setInputPrompt((prev) => `${prev} - cambiar a ${alt.day} ${alt.time}`);
                                  }}
                                  className="h-6 text-[10px] font-bold border-primary/40 text-primary hover:bg-primary/10 gap-1"
                                >
                                  <Clock className="h-3 w-3" />
                                  {alt.day} {alt.time} ({alt.availableVacancies} libres)
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Respuesta Sugerida para WhatsApp Web */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-success" />
                      Respuesta Lista para Enviar (Costo $0):
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopyWhatsApp}
                        className="h-6 px-2 text-[10px] font-bold gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-3 w-3" />
                        Copiar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleOpenWhatsAppWeb}
                        className="h-6 px-2.5 text-[10px] font-bold bg-[#25D366] hover:bg-[#20ba59] text-white gap-1 shadow-2xs"
                      >
                        <Send className="h-3 w-3" />
                        Abrir WhatsApp
                      </Button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-card border border-border text-xs whitespace-pre-line font-sans text-muted-foreground">
                    {parsedData.whatsAppReply}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Secundario: Snapshot de Vacantes para Agente Meta */}
      <Dialog open={isSnapshotOpen} onOpenChange={setIsSnapshotOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              Snapshot de Disponibilidad en Tiempo Real
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Copia este contexto o descarga el CSV para alimentar al Agente de Meta Business Suite / Bot de WhatsApp y que responda con la verdad absoluta de cupos libres.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyPromptContext}
                className="gap-1.5 text-xs font-bold border-primary/40 text-primary hover:bg-primary/10"
              >
                <Copy className="h-3.5 w-3.5" />
                Copiar Prompt Context
              </Button>
              <Button
                size="sm"
                onClick={handleDownloadCSV}
                className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar CSV
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-3 max-h-[350px] overflow-y-auto">
              <pre className="text-[11px] font-mono text-muted-foreground whitespace-pre-wrap">
                {vacancySnapshot.markdownPromptContext}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Kardex si se desea agendar directamente */}
      {kardexStudent && (
        <StudentAttendanceKardex
          isOpen={!!kardexStudent}
          onClose={() => setKardexStudent(null)}
          student={kardexStudent}
          isEditable={true}
        />
      )}
    </>
  );
}
