import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Bot,
  Sliders,
  MessageSquare,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Send,
  User,
  Phone,
  Calendar,
  Clock,
  Music,
  ExternalLink,
  Edit3,
  Plus,
  RefreshCw,
  Sparkles,
  CreditCard,
  UserCheck,
  Check,
  CheckCheck,
  ArrowRight,
  ShieldCheck,
  Copy,
  Info,
} from "lucide-react";
import {
  getWhatsAppBotConfig,
  saveWhatsAppBotConfig,
  getWhatsAppConversations,
  getWhatsAppMessagesForPhone,
  sendManualWhatsAppMessage,
  setConversationResolvedBy,
  DEFAULT_BOT_CONFIG,
  type WhatsAppBotConfig,
  type WhatsAppConversation,
  type WhatsAppMessage,
  type WhatsAppShortcut,
} from "@/lib/services/whatsapp.service";
import {
  getLeadsFromDB,
  createLeadInDB,
  updateLeadStatusInDB,
  type DBDemoRequest,
  type LeadStatus,
} from "@/lib/services/leads.service";

export const Route = createFileRoute("/admin/whatsapp")({
  component: AdminWhatsAppPage,
});

export function AdminWhatsAppPage() {
  const activeRole = useAppStore((s) => s.activeRole);
  const navigate = useNavigate();

  // Tab activo: 'agente' | 'reglas' | 'conversaciones' | 'citas-ventas'
  const [activeTab, setActiveTab] = useState<"agente" | "reglas" | "conversaciones" | "citas-ventas">("agente");

  // Configuración del Bot
  const [botConfig, setBotConfig] = useState<WhatsAppBotConfig>(DEFAULT_BOT_CONFIG);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [agentName, setAgentName] = useState(DEFAULT_BOT_CONFIG.agent_name);
  const [initialGreeting, setInitialGreeting] = useState(DEFAULT_BOT_CONFIG.initial_greeting);
  const [businessContext, setBusinessContext] = useState(DEFAULT_BOT_CONFIG.business_context);
  const [botShortcuts, setBotShortcuts] = useState<WhatsAppShortcut[]>(DEFAULT_BOT_CONFIG.shortcuts);

  // Conversaciones & Mensajes
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string>("");
  const [activeMessages, setActiveMessages] = useState<WhatsAppMessage[]>([]);
  const [conversationSearch, setConversationSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Modal Edición de Atajo
  const [editingShortcut, setEditingShortcut] = useState<WhatsAppShortcut | null>(null);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [isNewShortcut, setIsNewShortcut] = useState(false);

  // Prospectos / Citas y Ventas (demo_requests)
  const [leads, setLeads] = useState<DBDemoRequest[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("todos");
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [selectedLeadForPayment, setSelectedLeadForPayment] = useState<DBDemoRequest | null>(null);
  const [paymentLinkGenerated, setPaymentLinkGenerated] = useState<string | null>(null);

  // Formulario nuevo lead manual
  const [newLeadParent, setNewLeadParent] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadStudent, setNewLeadStudent] = useState("");
  const [newLeadInstrument, setNewLeadInstrument] = useState("Guitarra");
  const [newLeadDate, setNewLeadDate] = useState("");
  const [newLeadTime, setNewLeadTime] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRole]);

  async function loadData() {
    try {
      const cfg = await getWhatsAppBotConfig(activeRole);
      setBotConfig(cfg);
      setAgentName(cfg.agent_name);
      setInitialGreeting(cfg.initial_greeting);
      setBusinessContext(cfg.business_context);
      setBotShortcuts(cfg.shortcuts || DEFAULT_BOT_CONFIG.shortcuts);

      const convs = await getWhatsAppConversations(activeRole);
      setConversations(convs);
      if (convs.length > 0 && !selectedPhone) {
        setSelectedPhone(convs[0].phone);
      }

      await loadLeads();
    } catch (err) {
      console.error("Error loading whatsapp bot data:", err);
    }
  }

  async function loadLeads() {
    setIsLoadingLeads(true);
    try {
      const dbLeads = await getLeadsFromDB(activeRole);
      if (dbLeads && dbLeads.length > 0) {
        setLeads(dbLeads);
      } else {
        // Semillas demostrativas para interfaz si la tabla está recién creada
        setLeads([
          {
            id: "lead-1",
            parent_name: "Ana María López",
            parent_phone: "+51 987 111 222",
            student_name: "Mateo López (8 años)",
            instrument: "Guitarra",
            preferred_date: "2026-09-08",
            preferred_time: "16:00",
            status: "confirmada",
            notes: "Interesada en plan regular 2x semana. Viene de Facebook Ads.",
            handled_by: null,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "lead-2",
            parent_name: "Carlos Gutiérrez",
            parent_phone: "+51 912 345 678",
            student_name: "Sofía Gutiérrez (11 años)",
            instrument: "Piano",
            preferred_date: "2026-09-09",
            preferred_time: "17:30",
            status: "matriculado",
            notes: "Realizó pago de matrícula y primera mensualidad vía Culqi.",
            handled_by: null,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "lead-3",
            parent_name: "Diego Salazar",
            parent_phone: "+51 998 112 233",
            student_name: "Joaquín Salazar (14 años)",
            instrument: "Batería",
            preferred_date: "2026-09-10",
            preferred_time: "18:15",
            status: "requiere_asesor",
            notes: "Consulta por descuento de hermanos y disponibilidad sábado mañana.",
            handled_by: null,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "lead-4",
            parent_name: "Elena Rojas",
            parent_phone: "+51 956 789 012",
            student_name: "Valentina Rojas (6 años)",
            instrument: "Violín",
            preferred_date: "2026-09-11",
            preferred_time: "16:45",
            status: "pendiente",
            notes: "Preguntó por iniciación musical infantil.",
            handled_by: null,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error("Error loading leads:", err);
    } finally {
      setIsLoadingLeads(false);
    }
  }

  // Cargar historial de mensajes al seleccionar teléfono
  useEffect(() => {
    if (!selectedPhone) return;
    async function loadPhoneMessages() {
      const msgs = await getWhatsAppMessagesForPhone(selectedPhone);
      setActiveMessages(msgs);
    }
    loadPhoneMessages();
  }, [selectedPhone]);

  // Guardar Configuración Principal del Bot
  async function handleSaveBotConfig() {
    setIsSavingConfig(true);
    try {
      const updated = await saveWhatsAppBotConfig(activeRole, {
        agent_name: agentName,
        initial_greeting: initialGreeting,
        business_context: businessContext,
        shortcuts: botShortcuts,
      });
      setBotConfig(updated);
      toast.success("Configuración guardada", {
        description: "Los cambios del bot están activos y sincronizados con Insforge.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Error al guardar", { description: msg });
    } finally {
      setIsSavingConfig(false);
    }
  }

  // Activar / Desactivar Atajo
  function handleToggleShortcut(index: number) {
    const updated = [...botShortcuts];
    updated[index].enabled = !updated[index].enabled;
    setBotShortcuts(updated);
    saveWhatsAppBotConfig(activeRole, { shortcuts: updated });
    toast.info(
      updated[index].enabled
        ? `Atajo ${updated[index].command} activado`
        : `Atajo ${updated[index].command} desactivado`
    );
  }

  // Abrir modal para editar o crear atajo
  function handleOpenShortcutModal(sc?: WhatsAppShortcut) {
    if (sc) {
      setEditingShortcut({ ...sc });
      setIsNewShortcut(false);
    } else {
      setEditingShortcut({
        command: "/nuevo",
        title: "Nuevo Atajo",
        text: "Texto de respuesta rápida...",
        enabled: true,
      });
      setIsNewShortcut(true);
    }
    setIsShortcutModalOpen(true);
  }

  // Guardar atajo editado
  function handleSaveShortcut() {
    if (!editingShortcut) return;
    let updated: WhatsAppShortcut[];
    if (isNewShortcut) {
      updated = [...botShortcuts, editingShortcut];
    } else {
      updated = botShortcuts.map((s) =>
        s.command === editingShortcut.command ? editingShortcut : s
      );
    }
    setBotShortcuts(updated);
    saveWhatsAppBotConfig(activeRole, { shortcuts: updated });
    setIsShortcutModalOpen(false);
    toast.success("Atajo actualizado con éxito");
  }

  // Enviar mensaje manual desde el chat web
  async function handleSendManualReply() {
    if (!replyText.trim() || !selectedPhone) return;
    setIsSendingMessage(true);
    try {
      const newMsg = await sendManualWhatsAppMessage(
        activeRole,
        selectedPhone,
        replyText.trim(),
        "Sergio / Asesor Vibra"
      );
      setActiveMessages((prev) => [...prev, newMsg]);
      setReplyText("");
      toast.success("Mensaje enviado al apoderado");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Error al enviar mensaje", { description: msg });
    } finally {
      setIsSendingMessage(false);
    }
  }

  // Cambiar resolución de conversación (Bot vs Asesor)
  async function handleToggleResolvedBy(targetResolvedBy: "bot" | "humano") {
    if (!selectedPhone) return;
    await setConversationResolvedBy(activeRole, selectedPhone, targetResolvedBy);
    setConversations((prev) =>
      prev.map((c) =>
        c.phone === selectedPhone
          ? {
              ...c,
              resolved_by: targetResolvedBy,
              status_badge: targetResolvedBy === "humano" ? "Requiere asesor" : "Resuelto por bot",
            }
          : c
      )
    );
    toast.success(
      targetResolvedBy === "humano"
        ? "Conversación asignada a Asesor Humano"
        : "Conversación marcada como Resuelta por Bot"
    );
  }

  // Crear lead manual
  async function handleCreateManualLead(e: React.FormEvent) {
    e.preventDefault();
    if (!newLeadParent || !newLeadPhone || !newLeadStudent) {
      toast.error("Completa los campos obligatorios");
      return;
    }

    try {
      const created = await createLeadInDB(activeRole, {
        parent_name: newLeadParent,
        parent_phone: newLeadPhone,
        student_name: newLeadStudent,
        instrument: newLeadInstrument,
        preferred_date: newLeadDate || null,
        preferred_time: newLeadTime || null,
        status: "pendiente",
        notes: "Registrado manualmente desde el panel de WhatsApp",
      });
      setLeads((prev) => [created, ...prev]);
      setIsNewLeadModalOpen(false);
      setNewLeadParent("");
      setNewLeadPhone("");
      setNewLeadStudent("");
      toast.success("Prospecto registrado con éxito en Insforge");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Error al registrar lead", { description: msg });
    }
  }

  // Cambiar estado de lead
  async function handleChangeLeadStatus(leadId: string, newStatus: LeadStatus) {
    try {
      await updateLeadStatusInDB(activeRole, leadId, newStatus);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      toast.success(`Estado actualizado a ${newStatus}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Error al actualizar estado", { description: msg });
    }
  }

  // Generar link de pago Culqi para lead
  function handleGenerateCulqiLink(lead: DBDemoRequest) {
    setSelectedLeadForPayment(lead);
    const checkoutUrl = `${window.location.origin}/checkout?lead_id=${lead.id}&phone=${encodeURIComponent(
      lead.parent_phone
    )}&amount=260`;
    setPaymentLinkGenerated(checkoutUrl);
  }

  // Filtrado de conversaciones
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const q = conversationSearch.toLowerCase();
      return (
        c.sender_name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.last_message.toLowerCase().includes(q)
      );
    });
  }, [conversations, conversationSearch]);

  // Conversación seleccionada actual
  const currentConversation = useMemo(() => {
    return conversations.find((c) => c.phone === selectedPhone);
  }, [conversations, selectedPhone]);

  // Filtrado de prospectos
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch =
        l.parent_name.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.student_name.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.parent_phone.includes(leadSearch) ||
        l.instrument.toLowerCase().includes(leadSearch.toLowerCase());

      const matchesStatus =
        leadStatusFilter === "todos" || l.status === leadStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, leadSearch, leadStatusFilter]);

  // Métricas de prospectos
  const leadMetrics = useMemo(() => {
    const total = leads.length;
    const agendadas = leads.filter((l) => l.status === "confirmada" || l.status === "asistio" || l.status === "matriculado").length;
    const matriculados = leads.filter((l) => l.status === "matriculado").length;
    const requierenAsesor = leads.filter((l) => l.status === "requiere_asesor").length;
    const conversionRate = total > 0 ? Math.round((matriculados / total) * 100) : 0;

    return { total, agendadas, matriculados, requierenAsesor, conversionRate };
  }, [leads]);

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100 p-4 md:p-6 lg:p-8 space-y-6">
      {/* ============================================================== */}
      {/* HEADER PRINCIPAL */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-transparent bg-clip-text">
              WHATSAPP
            </span>
            <span className="text-xs uppercase px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 font-semibold tracking-wider">
              Oficial Meta Cloud API
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Administra tu agente inteligente, atajos deterministas, conversaciones y embudo de ventas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Sincronizar
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Bot Activo
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TABS DE NAVEGACIÓN (Matching mockup media_1788622148516.png) */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("agente")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "agente"
              ? "border-orange-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Bot className="w-4 h-4 text-orange-400" />
          Agente
        </button>

        <button
          onClick={() => setActiveTab("reglas")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "reglas"
              ? "border-orange-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sliders className="w-4 h-4 text-slate-400" />
          Reglas
        </button>

        <button
          onClick={() => setActiveTab("conversaciones")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "conversaciones"
              ? "border-orange-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-slate-400" />
          Conversaciones
          {conversations.filter((c) => c.status_badge === "Requiere asesor").length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
              {conversations.filter((c) => c.status_badge === "Requiere asesor").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("citas-ventas")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "citas-ventas"
              ? "border-orange-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShoppingCart className="w-4 h-4 text-slate-400" />
          Citas y Ventas
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
            {leads.length}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: AGENTE (4 Columnas exactas de media_1788622148516.png) */}
      {/* ============================================================== */}
      {activeTab === "agente" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* ------------------------------------------------------------ */}
          {/* COLUMNA 1: CONFIGURACIÓN BÁSICA DEL AGENTE */}
          {/* ------------------------------------------------------------ */}
          <div className="space-y-5">
            {/* Card Estado de Conexión */}
            <div className="bg-[#14171d] rounded-2xl p-5 border border-slate-800 shadow-sm relative overflow-hidden">
              <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-400" />
                Estado de Conexión
              </div>

              <div className="flex items-start gap-3 mt-2">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-400">
                    Conectado · Cloud API Oficial de Meta
                  </div>
                  <div className="text-lg font-black text-white tracking-wide mt-0.5">
                    {botConfig.phone_display || "+51 987 654 321"}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tu bot está activo y listo para atender clientes.
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario Configuración */}
            <div className="bg-[#14171d] rounded-2xl p-5 border border-slate-800 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Nombre del Agente
                  </label>
                  <span className="text-[11px] text-slate-500">{agentName.length}/50</span>
                </div>
                <Input
                  value={agentName}
                  maxLength={50}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="bg-[#0f1115] border-slate-800 focus:border-orange-500 text-sm text-white"
                  placeholder="Vibra Bot"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Saludo Inicial
                  </label>
                  <span className="text-[11px] text-slate-500">{initialGreeting.length}/500</span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={initialGreeting}
                  onChange={(e) => setInitialGreeting(e.target.value)}
                  className="w-full bg-[#0f1115] border border-slate-800 focus:border-orange-500 rounded-lg p-3 text-xs text-white resize-none outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="¡Hola! 🎵 Soy Vibra Bot..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Contexto del Negocio
                  </label>
                  <span className="text-[11px] text-slate-500">{businessContext.length}/2000</span>
                </div>
                <textarea
                  rows={7}
                  maxLength={2000}
                  value={businessContext}
                  onChange={(e) => setBusinessContext(e.target.value)}
                  className="w-full bg-[#0f1115] border border-slate-800 focus:border-orange-500 rounded-lg p-3 text-xs text-white resize-none outline-none focus:ring-1 focus:ring-orange-500 leading-relaxed"
                  placeholder="Vibra Music Staff es una escuela de música..."
                />
              </div>

              <Button
                onClick={handleSaveBotConfig}
                disabled={isSavingConfig}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
              >
                {isSavingConfig ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Guardando...
                  </span>
                ) : (
                  "GUARDAR CAMBIOS"
                )}
              </Button>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* COLUMNA 2: ATAJOS DETERMINISTAS (SIN IA) */}
          {/* ------------------------------------------------------------ */}
          <div className="bg-[#14171d] rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Atajos (Respuestas Sin IA)
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenShortcutModal()}
                  className="h-7 px-2 text-[11px] text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                >
                  <Plus className="w-3 h-3 mr-1" /> Nuevo
                </Button>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">
                Respuestas automáticas e instantáneas para consultas frecuentes.
              </p>

              {/* Lista de Atajos */}
              <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                {botShortcuts.map((sc, idx) => (
                  <div
                    key={sc.command}
                    className="bg-[#0f1115] border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-orange-400 tracking-wide font-mono">
                          {sc.command}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{sc.title}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenShortcutModal(sc)}
                        className="h-7 px-2 text-[10px] text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 rounded-md"
                      >
                        Editar
                      </Button>
                      <Switch
                        checked={sc.enabled}
                        onCheckedChange={() => handleToggleShortcut(idx)}
                        className="data-[state=checked]:bg-orange-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Box Inferior */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-[11px] text-amber-300">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Cualquier otra pregunta se responde con IA y calificación forzada.</span>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* COLUMNA 3: CONVERSACIONES RECIENTES */}
          {/* ------------------------------------------------------------ */}
          <div className="bg-[#14171d] rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Conversaciones Recientes
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Últimas interacciones con tus contactos.
                </p>
              </div>

              {/* Barra de búsqueda */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  value={conversationSearch}
                  onChange={(e) => setConversationSearch(e.target.value)}
                  placeholder="Buscar conversación..."
                  className="bg-[#0f1115] border-slate-800 pl-8 pr-3 text-xs text-white h-9 rounded-lg"
                />
              </div>

              {/* Lista de Conversaciones */}
              <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
                {filteredConversations.map((c) => {
                  const isSelected = c.phone === selectedPhone;
                  const isNeedsAdvisor = c.status_badge === "Requiere asesor";

                  return (
                    <div
                      key={c.phone}
                      onClick={() => setSelectedPhone(c.phone)}
                      className={`p-3 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-slate-800/80 border-orange-500/60 shadow-md"
                          : "bg-[#0f1115]/80 hover:bg-[#0f1115] border-slate-800/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                            {c.sender_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">
                              {c.sender_name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono truncate">
                              {c.phone}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-slate-500">
                            {new Date(c.last_message_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="mt-1">
                            <span
                              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                                isNeedsAdvisor
                                  ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              }`}
                            >
                              {c.status_badge}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 truncate mt-2 leading-relaxed">
                        {c.last_message}
                      </p>
                    </div>
                  );
                })}

                {filteredConversations.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-500">
                    No se encontraron conversaciones.
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 text-center border-t border-slate-800 pt-3">
              Mostrando {filteredConversations.length} de {conversations.length} conversaciones
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* COLUMNA 4: CHAT EN VIVO & TRANSCRIPCIÓN */}
          {/* ------------------------------------------------------------ */}
          <div className="bg-[#14171d] rounded-2xl border border-slate-800 flex flex-col justify-between overflow-hidden">
            {/* Header del Chat */}
            {currentConversation ? (
              <div className="p-4 border-b border-slate-800/80 bg-[#121419] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      {currentConversation.sender_name}
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full border ${
                          currentConversation.status_badge === "Requiere asesor"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {currentConversation.status_badge}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {currentConversation.phone}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {currentConversation.status_badge === "Requiere asesor" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleResolvedBy("bot")}
                      className="h-7 text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Marcar Resuelto
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleResolvedBy("humano")}
                      className="h-7 text-[10px] border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20"
                    >
                      <User className="w-3 h-3 mr-1" />
                      Pedir Asesor
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 border-b border-slate-800 text-xs text-slate-400">
                Selecciona una conversación
              </div>
            )}

            {/* Cuerpo de Mensajes */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[500px] bg-[#0c0e12]">
              <div className="flex justify-center my-2">
                <span className="text-[10px] bg-slate-800/80 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-700/50">
                  Hoy
                </span>
              </div>

              {activeMessages.map((msg) => {
                const isInbound = msg.direction === "inbound";

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isInbound ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-sm ${
                        isInbound
                          ? "bg-[#1d222b] text-slate-200 border border-slate-700/50 rounded-tl-sm"
                          : "bg-gradient-to-br from-amber-950/70 to-orange-950/80 border border-orange-500/40 text-amber-50 rounded-tr-sm"
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{msg.body}</p>
                      <div className="flex items-center justify-end gap-1 mt-1.5 text-[9px] text-slate-400">
                        <span>
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {!isInbound && <CheckCheck className="w-3 h-3 text-orange-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {activeMessages.length === 0 && (
                <div className="text-center py-12 text-xs text-slate-500">
                  No hay mensajes registrados aún en este chat.
                </div>
              )}
            </div>

            {/* Input de Respuesta Asesor */}
            <div className="p-3 bg-[#14171d] border-t border-slate-800 flex items-center gap-2">
              <Input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendManualReply();
                  }
                }}
                placeholder="Escribe un mensaje como asesor..."
                className="bg-[#0f1115] border-slate-800 text-xs text-white focus:border-orange-500 h-10 rounded-xl"
              />
              <Button
                onClick={handleSendManualReply}
                disabled={isSendingMessage || !replyText.trim()}
                className="h-10 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: REGLAS Y DISPARADORES DEL AGENTE */}
      {/* ============================================================== */}
      {activeTab === "reglas" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#14171d] rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              Reglas de Escalamiento Humano (Handoff)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Palabras clave y patrones que transfieren automáticamente la conversación a Claudia y Sergio
              cambiando el estado a <code className="text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded">requiere_asesor</code>.
            </p>

            <div className="space-y-2">
              {[
                { tag: "asesor", desc: "Solicitud directa de hablar con una persona" },
                { tag: "humano", desc: "Petición explícita de atención humana" },
                { tag: "secretaria", desc: "Búsqueda de atención administrativa" },
                { tag: "hablar con alguien", desc: "Frases de contacto con equipo de sede" },
                { tag: "reclamo / queja", desc: "Inconformidad o soporte urgente" },
              ].map((r) => (
                <div
                  key={r.tag}
                  className="bg-[#0f1115] p-3 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400">"{r.tag}"</span>
                    <p className="text-[10px] text-slate-500">{r.desc}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-300">
                    Notifica a Dirección
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#14171d] rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Parámetros de Inteligencia (Gemini API)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configuración de inferencia según las especificaciones aprobadas en el <strong>ADR-001</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div className="bg-[#0f1115] p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Modelo LLM:</span>
                <span className="font-mono text-white font-bold">Gemini 2.5 Flash</span>
              </div>
              <div className="bg-[#0f1115] p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Temperature:</span>
                <span className="font-mono text-white font-bold">0.2 (Determinista)</span>
              </div>
              <div className="bg-[#0f1115] p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Tool Choice:</span>
                <span className="font-mono text-emerald-400 font-bold">required (Forzado en turnos de acción)</span>
              </div>
              <div className="bg-[#0f1115] p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Memoria Efímera:</span>
                <span className="font-mono text-white font-bold">Últimos 6 turnos (Upstash Redis)</span>
              </div>
              <div className="bg-[#0f1115] p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Fuente de Verdad:</span>
                <span className="font-mono text-orange-400 font-bold">PostgreSQL en Insforge</span>
              </div>
            </div>
          </div>

          <div className="bg-[#14171d] rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              Horario de Atención de Sede
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Disponibilidad informada a los padres para agendamiento de clases demostrativas.
            </p>

            <div className="space-y-2 text-xs">
              <div className="bg-[#0f1115] p-3 rounded-xl border border-slate-800">
                <div className="font-bold text-white">Lunes a Viernes</div>
                <div className="text-slate-400 mt-0.5">3:00 p.m. a 9:00 p.m. (Bloques de 45 min)</div>
              </div>
              <div className="bg-[#0f1115] p-3 rounded-xl border border-slate-800">
                <div className="font-bold text-white">Sábados</div>
                <div className="text-slate-400 mt-0.5">8:00 a.m. a 2:00 p.m. y 2:00 p.m. a 6:00 p.m.</div>
              </div>
              <div className="bg-[#0f1115] p-3 rounded-xl border border-slate-800">
                <div className="font-bold text-white">Domingos</div>
                <div className="text-slate-500 mt-0.5">Cerrado (Solo respuestas automáticas del bot)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CONVERSACIONES EXTENDIDAS */}
      {/* ============================================================== */}
      {activeTab === "conversaciones" && (
        <div className="bg-[#14171d] rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Historial Centralizado de Conversaciones</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Revisa y filtra los mensajes recibidos a través de la Cloud API Oficial de WhatsApp.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  value={conversationSearch}
                  onChange={(e) => setConversationSearch(e.target.value)}
                  placeholder="Buscar por teléfono o nombre..."
                  className="bg-[#0f1115] border-slate-800 pl-8 text-xs text-white h-9 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Último Mensaje</th>
                  <th className="py-3 px-4">Hora</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredConversations.map((c) => (
                  <tr key={c.phone} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{c.sender_name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{c.phone}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{c.last_message}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(c.last_message_at).toLocaleDateString()} {" "}
                      {new Date(c.last_message_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          c.status_badge === "Requiere asesor"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {c.status_badge}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedPhone(c.phone);
                          setActiveTab("agente");
                        }}
                        className="h-7 text-[11px] text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                      >
                        Abrir Chat
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CITAS Y VENTAS (EMBUDO DE CONVERSIÓN & PROSPECTOS) */}
      {/* ============================================================== */}
      {activeTab === "citas-ventas" && (
        <div className="space-y-6">
          {/* Tarjetas de Métricas (Inspirado en media_1788622148468.jpg) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#14171d] p-5 rounded-2xl border border-slate-800">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Total Prospectos
              </div>
              <div className="text-3xl font-black text-white mt-1">{leadMetrics.total}</div>
              <div className="text-[11px] text-slate-500 mt-1">WhatsApp & Facebook Ads</div>
            </div>

            <div className="bg-[#14171d] p-5 rounded-2xl border border-slate-800">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Clases Demo Agendadas
              </div>
              <div className="text-3xl font-black text-orange-400 mt-1">
                {leadMetrics.agendadas}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Confirmadas o en proceso</div>
            </div>

            <div className="bg-[#14171d] p-5 rounded-2xl border border-slate-800">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Alumnos Matriculados
              </div>
              <div className="text-3xl font-black text-emerald-400 mt-1">
                {leadMetrics.matriculados}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Tasa de Cierre: {leadMetrics.conversionRate}%
              </div>
            </div>

            <div className="bg-[#14171d] p-5 rounded-2xl border border-slate-800">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Requieren Asesor
              </div>
              <div className="text-3xl font-black text-amber-400 mt-1">
                {leadMetrics.requierenAsesor}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Atención personalizada</div>
            </div>
          </div>

          {/* Tabla de Prospectos de PostgreSQL (demo_requests) */}
          <div className="bg-[#14171d] rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-orange-400" />
                  Prospectos y Clases Demostrativas
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Registros en la tabla <code className="text-orange-400 font-mono">demo_requests</code> de Insforge.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-48 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    placeholder="Buscar prospecto..."
                    className="bg-[#0f1115] border-slate-800 pl-8 text-xs text-white h-9 rounded-lg"
                  />
                </div>

                <select
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                  className="bg-[#0f1115] border border-slate-800 text-xs text-slate-300 rounded-lg h-9 px-3 outline-none"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="asistio">Asistió</option>
                  <option value="matriculado">Matriculado</option>
                  <option value="requiere_asesor">Requiere Asesor</option>
                  <option value="cancelada">Cancelada</option>
                </select>

                <Button
                  size="sm"
                  onClick={() => setIsNewLeadModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-9 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Nuevo Prospecto
                </Button>
              </div>
            </div>

            {/* Contenedor de la Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Apoderado & WhatsApp</th>
                    <th className="py-3 px-4">Alumno</th>
                    <th className="py-3 px-4">Instrumento</th>
                    <th className="py-3 px-4">Fecha y Turno Demo</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones de Venta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{lead.parent_name}</div>
                        <a
                          href={`https://wa.me/${lead.parent_phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          {lead.parent_phone}
                        </a>
                      </td>

                      <td className="py-3 px-4 text-slate-200">{lead.student_name}</td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[10px] font-semibold">
                          {lead.instrument}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {lead.preferred_date ? (
                          <div>
                            <div className="flex items-center gap-1 text-slate-200">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {lead.preferred_date}
                            </div>
                            {lead.preferred_time && (
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {lead.preferred_time}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Por coordinar</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleChangeLeadStatus(lead.id, e.target.value as LeadStatus)}
                          className="bg-[#0f1115] border border-slate-700 text-[11px] rounded-md px-2 py-1 text-slate-200 outline-none"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmada">Confirmada</option>
                          <option value="asistio">Asistió</option>
                          <option value="matriculado">Matriculado</option>
                          <option value="requiere_asesor">Requiere Asesor</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGenerateCulqiLink(lead)}
                            className="h-7 text-[10px] border-orange-500/40 text-orange-400 bg-orange-500/10 hover:bg-orange-500/20"
                          >
                            <CreditCard className="w-3 h-3 mr-1" />
                            Link Culqi
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => {
                              handleChangeLeadStatus(lead.id, "matriculado");
                              navigate({ to: "/admin/alumnos" });
                            }}
                            className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            Matricular
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-xs text-slate-500">
                        No hay prospectos que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL EDITAR / CREAR ATAJO DETERMINISTA */}
      {/* ============================================================== */}
      <Dialog open={isShortcutModalOpen} onOpenChange={setIsShortcutModalOpen}>
        <DialogContent className="bg-[#14171d] border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {isNewShortcut ? "Crear Nuevo Atajo Rápido" : "Editar Atajo Rápido"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Configura el comando detonador y la respuesta automática inmediata que enviará el bot sin costo de IA.
            </DialogDescription>
          </DialogHeader>

          {editingShortcut && (
            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Comando</label>
                <Input
                  value={editingShortcut.command}
                  onChange={(e) =>
                    setEditingShortcut({ ...editingShortcut, command: e.target.value })
                  }
                  placeholder="/precios"
                  className="bg-[#0f1115] border-slate-800 text-white font-mono text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Título Descriptivo</label>
                <Input
                  value={editingShortcut.title}
                  onChange={(e) =>
                    setEditingShortcut({ ...editingShortcut, title: e.target.value })
                  }
                  placeholder="Precios y matrículas"
                  className="bg-[#0f1115] border-slate-800 text-white text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Texto de Respuesta</label>
                <textarea
                  rows={5}
                  value={editingShortcut.text}
                  onChange={(e) =>
                    setEditingShortcut({ ...editingShortcut, text: e.target.value })
                  }
                  placeholder="Escribe la respuesta del bot..."
                  className="w-full bg-[#0f1115] border border-slate-800 rounded-lg p-3 text-xs text-white resize-none mt-1 outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShortcutModalOpen(false)}
              className="border-slate-700 bg-transparent text-slate-300 text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSaveShortcut}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
            >
              Guardar Atajo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL REGISTRAR PROSPECTO MANUAL */}
      {/* ============================================================== */}
      <Dialog open={isNewLeadModalOpen} onOpenChange={setIsNewLeadModalOpen}>
        <DialogContent className="bg-[#14171d] border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Registrar Prospecto / Clase Demo</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Registra un interesado capturado por llamada telefónica, presencial o WhatsApp manual.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateManualLead} className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Nombre del Apoderado *</label>
              <Input
                required
                value={newLeadParent}
                onChange={(e) => setNewLeadParent(e.target.value)}
                placeholder="Ej. Carmen Del Solar"
                className="bg-[#0f1115] border-slate-800 text-white text-xs mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Teléfono WhatsApp *</label>
              <Input
                required
                value={newLeadPhone}
                onChange={(e) => setNewLeadPhone(e.target.value)}
                placeholder="Ej. +51 987 654 321"
                className="bg-[#0f1115] border-slate-800 text-white text-xs mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Nombre y Edad del Alumno *</label>
              <Input
                required
                value={newLeadStudent}
                onChange={(e) => setNewLeadStudent(e.target.value)}
                placeholder="Ej. Lucas Del Solar (7 años)"
                className="bg-[#0f1115] border-slate-800 text-white text-xs mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Instrumento</label>
                <select
                  value={newLeadInstrument}
                  onChange={(e) => setNewLeadInstrument(e.target.value)}
                  className="w-full bg-[#0f1115] border border-slate-800 text-white text-xs rounded-md h-9 px-2 mt-1 outline-none"
                >
                  <option value="Guitarra">Guitarra</option>
                  <option value="Piano">Piano</option>
                  <option value="Batería">Batería</option>
                  <option value="Bajo">Bajo</option>
                  <option value="Canto">Canto</option>
                  <option value="Violín">Violín</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Fecha Tentativa</label>
                <Input
                  type="date"
                  value={newLeadDate}
                  onChange={(e) => setNewLeadDate(e.target.value)}
                  className="bg-[#0f1115] border-slate-800 text-white text-xs mt-1"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsNewLeadModalOpen(false)}
                className="border-slate-700 bg-transparent text-slate-300 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
              >
                Guardar en Insforge
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL LINK CULQI GENERADO */}
      {/* ============================================================== */}
      <Dialog
        open={!!selectedLeadForPayment}
        onOpenChange={(open) => !open && setSelectedLeadForPayment(null)}
      >
        <DialogContent className="bg-[#14171d] border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-400" />
              Link de Cobro Seguro Culqi
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Envía este enlace al apoderado para que complete el pago con Culqi. Al ingresar, el apoderado colocará su correo electrónico en la pantalla oficial de checkout.
            </DialogDescription>
          </DialogHeader>

          {selectedLeadForPayment && (
            <div className="space-y-4 py-2 text-xs">
              <div className="bg-[#0f1115] p-3 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Apoderado:</span>
                  <span className="font-bold text-white">{selectedLeadForPayment.parent_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Alumno:</span>
                  <span className="text-white">{selectedLeadForPayment.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monto Sugerido:</span>
                  <span className="font-bold text-emerald-400">S/ 260.00 (Matrícula + 1er Mes)</span>
                </div>
              </div>

              {paymentLinkGenerated && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Enlace de Pago</label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={paymentLinkGenerated}
                      className="bg-[#0f1115] border-slate-800 font-mono text-[11px] text-slate-300"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(paymentLinkGenerated);
                        toast.success("Enlace copiado al portapapeles");
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              size="sm"
              onClick={() => setSelectedLeadForPayment(null)}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
