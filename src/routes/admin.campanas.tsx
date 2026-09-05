import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Send,
  Calendar,
  DollarSign,
  FileCheck,
  CheckCircle2,
  Lock,
  Search,
  History,
  ShieldCheck,
  Info,
  Clock,
  Sparkles,
  Users,
  Check,
  Megaphone,
} from "lucide-react";

export const Route = createFileRoute("/admin/campanas")({
  component: AdminCampanasPage,
});

interface CampaignTemplate {
  id: string;
  name: string;
  category: "Utilidad" | "Marketing";
  body: string;
}

interface CampaignContact {
  id: string;
  name: string;
  phone: string;
  avatarColor: string;
  selected: boolean;
}

interface CampaignHistoryItem {
  id: string;
  name: string;
  template: string;
  recipientsCount: number;
  cost: string;
  status: "Enviado" | "Programado";
  date: string;
}

const TEMPLATES_SEED: CampaignTemplate[] = [
  {
    id: "tpl-1",
    name: "Recordatorio de pago",
    category: "Utilidad",
    body: "Hola {{1}}, te recordamos que tienes un pago pendiente de {{2}}.",
  },
  {
    id: "tpl-2",
    name: "Confirmación de pago",
    category: "Utilidad",
    body: "¡Hola {{1}}! Confirmamos tu pago de {{2}}. Gracias por ser parte de Vibra Music.",
  },
  {
    id: "tpl-3",
    name: "Cambio de horario",
    category: "Utilidad",
    body: "Hola {{1}}, te informamos que tu clase del {{2}} será reprogramada según lo coordinado.",
  },
  {
    id: "tpl-4",
    name: "Bienvenida nuevo alumno",
    category: "Marketing",
    body: "¡Bienvenido {{1}} a Vibra Music Staff! Estamos felices de acompañarte en tu formación musical.",
  },
  {
    id: "tpl-5",
    name: "Invitación a concierto",
    category: "Marketing",
    body: "Hola {{1}}, te invitamos a nuestro próximo concierto de ensamble este {{2}}.",
  },
  {
    id: "tpl-6",
    name: "Promoción de hermanos",
    category: "Marketing",
    body: "Hola {{1}}, disfruta este mes de 15% de descuento por matrícula de hermano.",
  },
];

const CONTACTS_SEED: CampaignContact[] = [
  { id: "c-1", name: "Ana María López", phone: "+51 987 654 321", avatarColor: "from-orange-500 to-amber-500", selected: true },
  { id: "c-2", name: "Carlos Gutiérrez", phone: "+51 912 345 678", avatarColor: "from-amber-500 to-yellow-500", selected: true },
  { id: "c-3", name: "Diego Salazar", phone: "+51 998 112 233", avatarColor: "from-orange-600 to-red-500", selected: true },
  { id: "c-4", name: "Elena Rojas", phone: "+51 956 789 012", avatarColor: "from-purple-500 to-indigo-500", selected: false },
  { id: "c-5", name: "Fernando Quispe", phone: "+51 941 223 344", avatarColor: "from-blue-500 to-cyan-500", selected: false },
  { id: "c-6", name: "Gabriela Torres", phone: "+51 977 665 544", avatarColor: "from-emerald-500 to-teal-500", selected: false },
  { id: "c-7", name: "Iván Mendoza", phone: "+51 923 334 455", avatarColor: "from-sky-500 to-blue-600", selected: false },
];

const HISTORY_SEED: CampaignHistoryItem[] = [
  {
    id: "hist-1",
    name: "Cierre Mensual Agosto 2026",
    template: "Recordatorio de pago",
    recipientsCount: 42,
    cost: "S/ 3.96",
    status: "Enviado",
    date: "2026-08-30 09:30",
  },
  {
    id: "hist-2",
    name: "Concierto Primavera Vibra",
    template: "Invitación a concierto",
    recipientsCount: 180,
    cost: "S/ 16.99",
    status: "Enviado",
    date: "2026-08-15 11:00",
  },
  {
    id: "hist-3",
    name: "Aviso de Feriado",
    template: "Cambio de horario",
    recipientsCount: 65,
    cost: "S/ 6.13",
    status: "Programado",
    date: "2026-09-12 08:00",
  },
];

export function AdminCampanasPage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tpl-1");
  const [templateSearch, setTemplateSearch] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [contacts, setContacts] = useState<CampaignContact[]>(CONTACTS_SEED);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Filtrado de plantillas
  const filteredTemplates = useMemo(() => {
    return TEMPLATES_SEED.filter(
      (t) =>
        t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
        t.body.toLowerCase().includes(templateSearch.toLowerCase())
    );
  }, [templateSearch]);

  const selectedTemplate = useMemo(() => {
    return TEMPLATES_SEED.find((t) => t.id === selectedTemplateId) || TEMPLATES_SEED[0];
  }, [selectedTemplateId]);

  // Filtrado de contactos
  const filteredContacts = useMemo(() => {
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.phone.includes(contactSearch)
    );
  }, [contacts, contactSearch]);

  // Selección de contactos
  const selectedContactsCount = useMemo(() => {
    return contacts.filter((c) => c.selected).length;
  }, [contacts]);

  const isAllSelected = contacts.length > 0 && selectedContactsCount === contacts.length;

  function handleToggleSelectAll() {
    const nextState = !isAllSelected;
    setContacts((prev) => prev.map((c) => ({ ...c, selected: nextState })));
  }

  function handleToggleContact(id: string) {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  }

  // Costo estimado (S/ 0.08 por mensaje oficial Meta)
  const ratePerMessage = 0.08;
  const subtotal = Number((selectedContactsCount * ratePerMessage).toFixed(2));
  const igv = Number((subtotal * 0.18).toFixed(2));
  const totalCost = Number((subtotal + igv).toFixed(2));

  // Enviar ahora
  function handleSendNow() {
    if (selectedContactsCount === 0) {
      toast.error("Selecciona al menos un destinatario");
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast.success("¡Campaña iniciada con éxito!", {
        description: `Enviando "${selectedTemplate.name}" a ${selectedContactsCount} contactos vía Meta Cloud API.`,
      });
    }, 1200);
  }

  // Programar envío
  function handleConfirmSchedule() {
    if (!scheduleDate || !scheduleTime) {
      toast.error("Selecciona fecha y hora para programar");
      return;
    }
    setIsScheduleModalOpen(false);
    toast.success("Campaña programada con éxito", {
      description: `Se enviará el ${scheduleDate} a las ${scheduleTime} a ${selectedContactsCount} contactos.`,
    });
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header de Campañas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
            <span className="bg-gradient-to-r from-[#F47B20] to-[#FFB52E] text-transparent bg-clip-text">
              CAMPAÑAS
            </span>
            <span className="text-xs uppercase px-2.5 py-0.5 rounded-full bg-orange-500/10 text-[#F47B20] dark:text-[#FF9E3D] border border-orange-500/30 font-semibold tracking-wider font-sans">
              Mensajería Masiva Oficial
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Envía mensajes masivos y notificaciones a tus contactos de forma segura con Meta Cloud API.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHistoryModalOpen(true)}
            className="border-border bg-card hover:bg-muted text-foreground text-xs"
          >
            <History className="w-3.5 h-3.5 mr-1.5 text-[#F47B20]" />
            Ver historial
          </Button>
        </div>
      </div>

      {/* 4 Tarjetas de Métricas (Matching media_1788622148468.jpg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Campañas Activas */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Campañas Activas
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-[#F47B20] flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground mt-2 font-display">4</div>
          <div className="text-[11px] text-muted-foreground mt-1 font-medium">
            2 programadas para esta semana
          </div>
        </div>

        {/* Card 2: Enviados este mes */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Enviados este mes
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-[#F47B20] flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground mt-2 font-display">1,248</div>
          <div className="text-[11px] text-emerald-500 font-semibold mt-1">
            +32% vs. mes anterior
          </div>
        </div>

        {/* Card 3: Costo estimado este mes */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Costo estimado este mes
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#FFB52E] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#F47B20] dark:text-[#FFB52E] mt-2 font-display">
            S/ 186.40
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 font-medium">
            Saldo disponible: <span className="text-foreground font-bold">S/ 513.60</span>
          </div>
        </div>

        {/* Card 4: Plantillas aprobadas */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Plantillas aprobadas
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-[#F47B20] flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground mt-2 font-display">12</div>
          <div className="text-[11px] text-muted-foreground mt-1 font-medium">
            Listas para usar por Meta
          </div>
        </div>
      </div>

      {/* Sección Wizard: Crear Nueva Campaña */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            CREAR NUEVA CAMPAÑA
          </h2>
          <p className="text-xs text-muted-foreground">
            Sigue estos pasos para enviar tu campaña de forma rápida y segura.
          </p>
        </div>

        {/* Indicadores de Pasos 1 -> 2 -> 3 -> 4 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-card p-3 rounded-2xl border border-border">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#F47B20] to-[#FF9E3D] text-[#0D0B0A] font-extrabold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground truncate">Elegir plantilla</div>
              <div className="text-[10px] text-muted-foreground truncate">Plantilla aprobada</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40">
            <div className="w-7 h-7 rounded-full bg-muted border border-border text-foreground font-bold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground truncate">Destinatarios</div>
              <div className="text-[10px] text-muted-foreground truncate">Elige a quién enviar</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40">
            <div className="w-7 h-7 rounded-full bg-muted border border-border text-foreground font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground truncate">Costo estimado</div>
              <div className="text-[10px] text-muted-foreground truncate">Revisa el costo total</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40">
            <div className="w-7 h-7 rounded-full bg-muted border border-border text-foreground font-bold text-xs flex items-center justify-center shrink-0">
              4
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground truncate">Enviar o programar</div>
              <div className="text-[10px] text-muted-foreground truncate">Confirma el envío</div>
            </div>
          </div>
        </div>

        {/* 4 Columnas Interactivas (Matching media_1788622148468.jpg) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* ------------------------------------------------------------ */}
          {/* COLUMNA 1: 1. ELEGIR PLANTILLA */}
          {/* ------------------------------------------------------------ */}
          <div className="bg-card rounded-2xl p-5 border border-border flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  1. ELEGIR PLANTILLA
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Selecciona una plantilla de mensaje aprobada por Meta.
                </p>
              </div>

              {/* Buscador de plantillas */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Buscar plantilla..."
                  className="bg-background border-border pl-8 text-xs text-foreground h-9 rounded-xl"
                />
              </div>

              {/* Lista de plantillas */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {filteredTemplates.map((t) => {
                  const isSelected = t.id === selectedTemplateId;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTemplateId(t.id)}
                      className={`p-3 rounded-xl cursor-pointer border transition-all ${
                        isSelected
                          ? "bg-accent/30 border-[#F47B20] shadow-xs"
                          : "bg-background/80 hover:bg-muted/40 border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="radio"
                            name="campaign_template"
                            checked={isSelected}
                            onChange={() => setSelectedTemplateId(t.id)}
                            className="accent-[#F47B20] cursor-pointer"
                          />
                          <span className="text-xs font-bold text-foreground truncate">
                            {t.name}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0.2 ${
                            t.category === "Utilidad"
                              ? "border-sky-500/30 text-sky-500 dark:text-sky-400 bg-sky-500/10"
                              : "border-orange-500/30 text-orange-500 dark:text-orange-400 bg-orange-500/10"
                          }`}
                        >
                          {t.category}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                        {t.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground text-center border-t border-border pt-2">
              Mostrando {filteredTemplates.length} de 12 plantillas
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* COLUMNA 2: 2. SELECCIONAR DESTINATARIOS */}
          {/* ------------------------------------------------------------ */}
          <div className="bg-card rounded-2xl p-5 border border-border flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  2. SELECCIONAR DESTINATARIOS
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Elige los contactos que recibirán la campaña.
                </p>
              </div>

              {/* Buscador de contactos */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Buscar contacto..."
                  className="bg-background border-border pl-8 text-xs text-foreground h-9 rounded-xl"
                />
              </div>

              {/* Seleccionar Todos */}
              <div className="flex items-center gap-2 p-2 bg-muted/40 rounded-xl border border-border">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleToggleSelectAll}
                  className="data-[state=checked]:bg-[#F47B20] data-[state=checked]:border-[#F47B20]"
                />
                <span className="text-xs font-bold text-foreground">
                  Seleccionar todos ({contacts.length})
                </span>
              </div>

              {/* Lista de Contactos */}
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredContacts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleToggleContact(c.id)}
                    className={`p-2.5 rounded-xl cursor-pointer border flex items-center justify-between transition-all ${
                      c.selected
                        ? "bg-accent/20 border-[#F47B20]/60"
                        : "bg-background/80 hover:bg-muted/40 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Checkbox
                        checked={c.selected}
                        onCheckedChange={() => handleToggleContact(c.id)}
                        className="data-[state=checked]:bg-[#F47B20] data-[state=checked]:border-[#F47B20]"
                      />
                      <div
                        className={`w-7 h-7 rounded-full bg-gradient-to-tr ${c.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
                      >
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-foreground truncate">
                          {c.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono truncate">
                          {c.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] font-bold text-[#F47B20] dark:text-[#FF9E3D] text-center border-t border-border pt-2">
              {selectedContactsCount} de {contacts.length} seleccionados
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* COLUMNA 3: 3. COSTO ESTIMADO */}
          {/* ------------------------------------------------------------ */}
          <div className="bg-card rounded-2xl p-5 border border-border flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  3. COSTO ESTIMADO
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Revisa el detalle del costo de tu campaña.
                </p>
              </div>

              {/* Desglose de Costo */}
              <div className="bg-background rounded-2xl p-4 border border-border space-y-3">
                <div className="text-xs font-bold text-foreground uppercase tracking-wider">
                  RESUMEN DEL COSTO
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Destinatarios seleccionados</span>
                    <span className="font-bold text-foreground">{selectedContactsCount}</span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Tarifa por mensaje (S/)</span>
                    <span className="font-mono text-foreground">{ratePerMessage.toFixed(2)}</span>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono text-foreground">S/ {subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>IGV (18%)</span>
                    <span className="font-mono text-foreground">S/ {igv.toFixed(2)}</span>
                  </div>

                  <div className="pt-3 border-t border-border flex justify-between items-baseline">
                    <span className="text-xs font-bold uppercase text-foreground">
                      TOTAL ESTIMADO
                    </span>
                    <span className="text-2xl font-black text-[#F47B20] dark:text-[#FFB52E] font-display">
                      S/ {totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-600 dark:text-amber-300">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  El costo puede variar ligeramente según el estado de entrega final de los mensajes en Meta.
                </span>
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground text-center border-t border-border pt-2 font-medium">
              Saldo disponible: <span className="font-bold text-foreground">S/ 513.60</span>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* COLUMNA 4: 4. ENVIAR O PROGRAMAR */}
          {/* ------------------------------------------------------------ */}
          <div className="bg-card rounded-2xl p-5 border border-border flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  4. ENVIAR O PROGRAMAR
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Confirma el envío de tu campaña.
                </p>
              </div>

              {/* Resumen de la campaña */}
              <div className="bg-background rounded-2xl p-4 border border-border space-y-2.5 text-xs">
                <div className="font-bold text-foreground uppercase text-[11px]">
                  RESUMEN DE LA CAMPAÑA
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Plantilla seleccionada:</div>
                  <div className="font-semibold text-foreground">{selectedTemplate.name}</div>
                </div>

                <div>
                  <div className="text-[10px] text-muted-foreground">Destinatarios:</div>
                  <div className="font-semibold text-foreground">
                    {selectedContactsCount} contactos
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-muted-foreground">Costo total estimado:</div>
                  <div className="font-bold text-[#F47B20] dark:text-[#FFB52E]">
                    S/ {totalCost.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-bold uppercase text-muted-foreground">
                  ¿QUÉ DESEAS HACER?
                </div>

                <Button
                  onClick={handleSendNow}
                  disabled={isSending || selectedContactsCount === 0}
                  className="w-full bg-gradient-to-r from-[#F47B20] to-[#FF9E3D] hover:from-[#e06b12] hover:to-[#f08e2e] text-[#0D0B0A] font-extrabold text-xs py-3 rounded-xl shadow-md shadow-orange-500/25 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {isSending ? "ENVIANDO..." : "ENVIAR AHORA"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsScheduleModalOpen(true)}
                  disabled={selectedContactsCount === 0}
                  className="w-full border-border bg-card hover:bg-muted text-foreground font-bold text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#F47B20]" />
                  PROGRAMAR ENVÍO
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground text-center border-t border-border pt-3">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span>Los mensajes se envían a través de la Cloud API Oficial de Meta.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Historial de Campañas */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-display">
              Historial de Campañas Enviadas
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Registro auditado de campañas masivas ejecutadas a través de Meta Cloud API.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-x-auto py-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase text-[10px]">
                  <th className="py-2.5 px-3">Nombre</th>
                  <th className="py-2.5 px-3">Plantilla</th>
                  <th className="py-2.5 px-3">Destinatarios</th>
                  <th className="py-2.5 px-3">Costo</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {HISTORY_SEED.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="py-2.5 px-3 font-semibold text-foreground">{item.name}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{item.template}</td>
                    <td className="py-2.5 px-3 font-mono">{item.recipientsCount}</td>
                    <td className="py-2.5 px-3 font-bold text-[#F47B20]">{item.cost}</td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${
                          item.status === "Enviado"
                            ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
                            : "border-amber-500/30 text-amber-500 bg-amber-500/10"
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground font-mono text-[11px]">
                      {item.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button
              size="sm"
              onClick={() => setIsHistoryModalOpen(false)}
              className="bg-muted hover:bg-muted/80 text-foreground text-xs"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Programar Envío */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-display">Programar Envío</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define el día y la hora exacta en la que Meta enviará los mensajes a tus contactos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Fecha de Envío</label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="bg-background border-border text-foreground text-xs mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Hora</label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="bg-background border-border text-foreground text-xs mt-1"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScheduleModalOpen(false)}
              className="border-border bg-card text-foreground text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmSchedule}
              className="bg-gradient-to-r from-[#F47B20] to-[#FF9E3D] text-[#0D0B0A] font-extrabold text-xs"
            >
              Confirmar Programación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
