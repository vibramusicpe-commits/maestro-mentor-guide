import { useState, useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { DeletedStudentLog, DeletionReasonCategory } from "@/store/admin-seeds";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  RotateCcw,
  Search,
  Download,
  Copy,
  MessageCircle,
  Filter,
  Calendar,
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle,
  Send,
  HelpCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

interface DeletedStudentsTrashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletedStudentsTrashModal({
  open,
  onOpenChange,
}: DeletedStudentsTrashModalProps) {
  const deletedStudents = useAppStore((s) => s.deletedStudents || []);
  const restoreDeletedStudent = useAppStore((s) => s.restoreDeletedStudent);

  // Estados de Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReason, setSelectedReason] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "last7" | "last30" | "thisMonth" | "custom">("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [segmentTab, setSegmentTab] = useState<"reincorporacion" | "all" | "descartables">("reincorporacion");

  // Conteo de métricas rápidas
  const metrics = useMemo(() => {
    let reincorpCount = 0;
    let discardCount = 0;
    deletedStudents.forEach((d) => {
      if (d.reasonCategory === "falta_pago" || d.reasonCategory === "retiro_voluntario") {
        reincorpCount++;
      } else if (d.reasonCategory === "error_registro" || d.reasonCategory === "prueba_sistema") {
        discardCount++;
      }
    });
    return {
      total: deletedStudents.length,
      reincorporacion: reincorpCount,
      descartables: discardCount,
    };
  }, [deletedStudents]);

  // Filtrado reactivo completo
  const filteredList = useMemo(() => {
    return deletedStudents.filter((del) => {
      // 1. Filtro por Segmento (Leads Reincorporación vs Descartables vs Todos)
      if (segmentTab === "reincorporacion") {
        if (del.reasonCategory !== "falta_pago" && del.reasonCategory !== "retiro_voluntario") {
          return false;
        }
      } else if (segmentTab === "descartables") {
        if (del.reasonCategory !== "error_registro" && del.reasonCategory !== "prueba_sistema") {
          return false;
        }
      }

      // 2. Filtro por Motivo Específico
      if (selectedReason !== "all" && del.reasonCategory !== selectedReason) {
        return false;
      }

      // 3. Filtro por Búsqueda de Texto
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchName = del.studentName.toLowerCase().includes(q);
        const matchFamily = del.family?.toLowerCase().includes(q);
        const matchInstrument = del.instrument?.toLowerCase().includes(q);
        const matchPhone = del.phone?.includes(q);
        const matchFather = del.fatherName?.toLowerCase().includes(q) || del.fatherPhone?.includes(q);
        const matchMother = del.motherName?.toLowerCase().includes(q) || del.motherPhone?.includes(q);
        const matchReason = del.reasonText?.toLowerCase().includes(q);
        if (!matchName && !matchFamily && !matchInstrument && !matchPhone && !matchFather && !matchMother && !matchReason) {
          return false;
        }
      }

      // 4. Filtro por Fecha y Hora de Eliminación
      if (dateFilter !== "all") {
        const delDate = new Date(del.deletedAt);
        const now = new Date();

        if (dateFilter === "today") {
          const isToday =
            delDate.getFullYear() === now.getFullYear() &&
            delDate.getMonth() === now.getMonth() &&
            delDate.getDate() === now.getDate();
          if (!isToday) return false;
        } else if (dateFilter === "last7") {
          const diffDays = (now.getTime() - delDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7 || diffDays < 0) return false;
        } else if (dateFilter === "last30") {
          const diffDays = (now.getTime() - delDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 30 || diffDays < 0) return false;
        } else if (dateFilter === "thisMonth") {
          const isSameMonth =
            delDate.getFullYear() === now.getFullYear() &&
            delDate.getMonth() === now.getMonth();
          if (!isSameMonth) return false;
        } else if (dateFilter === "custom") {
          if (customStartDate) {
            const start = new Date(customStartDate + "T00:00:00");
            if (delDate < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate + "T23:59:59");
            if (delDate > end) return false;
          }
        }
      }

      return true;
    });
  }, [deletedStudents, segmentTab, selectedReason, searchQuery, dateFilter, customStartDate, customEndDate]);

  // Helper para extraer el teléfono prioritario del alumno / familia
  const getPrimaryPhone = (del: DeletedStudentLog) => {
    return del.motherPhone || del.fatherPhone || del.phone || del.studentSnapshot?.emergencyContact?.phone || "";
  };

  const getPrimaryContactName = (del: DeletedStudentLog) => {
    if (del.motherName) return `Sra. ${del.motherName}`;
    if (del.fatherName) return `Sr. ${del.fatherName}`;
    if (del.family) return `Familia ${del.family}`;
    return del.studentName;
  };

  // 1. Exportar a CSV (Compatible con Microsoft Excel UTF-8 BOM)
  const handleExportCSV = () => {
    if (filteredList.length === 0) {
      toast.error("No hay registros para exportar con los filtros actuales");
      return;
    }

    const headers = [
      "ID",
      "Nombre Alumno",
      "Familia",
      "Instrumento",
      "Modalidad",
      "Motivo Categoria",
      "Detalle Motivo",
      "Fecha y Hora Retiro",
      "Eliminado Por",
      "Telefono Alumno",
      "Nombre Papa",
      "Telefono Papa",
      "Nombre Mama",
      "Telefono Mama",
      "Contacto Emergencia",
      "Telefono Emergencia",
    ];

    const rows = filteredList.map((del) => [
      del.id,
      `"${(del.studentName || "").replace(/"/g, '""')}"`,
      `"${(del.family || "").replace(/"/g, '""')}"`,
      `"${(del.instrument || "").replace(/"/g, '""')}"`,
      `"${(del.modality || "").replace(/"/g, '""')}"`,
      `"${del.reasonCategory}"`,
      `"${(del.reasonText || "").replace(/"/g, '""')}"`,
      `"${new Date(del.deletedAt).toLocaleString("es-PE")}"`,
      `"${del.deletedBy}"`,
      `"${del.phone || ""}"`,
      `"${(del.fatherName || "").replace(/"/g, '""')}"`,
      `"${del.fatherPhone || ""}"`,
      `"${(del.motherName || "").replace(/"/g, '""')}"`,
      `"${del.motherPhone || ""}"`,
      `"${(del.studentSnapshot?.emergencyContact?.name || "").replace(/"/g, '""')} (${del.studentSnapshot?.emergencyContact?.relation || ""})"`,
      `"${del.studentSnapshot?.emergencyContact?.phone || ""}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    const segmentName = segmentTab === "reincorporacion" ? "Leads_Reincorporacion" : segmentTab === "descartables" ? "Descartables" : "Historico_Eliminados";
    link.setAttribute("href", url);
    link.setAttribute("download", `VibraMusic_${segmentName}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`✓ Se exportaron ${filteredList.length} registros a CSV para Excel`, {
      description: "Archivo listo con números de teléfono y motivos detallados.",
    });
  };

  // 2. Copiar lista de teléfonos limpios al portapapeles para difusión
  const handleCopyPhones = () => {
    if (filteredList.length === 0) {
      toast.error("No hay registros en la vista actual");
      return;
    }

    const phoneSet = new Set<string>();
    filteredList.forEach((del) => {
      [del.phone, del.fatherPhone, del.motherPhone, del.studentSnapshot?.emergencyContact?.phone].forEach((p) => {
        if (p) {
          const clean = p.replace(/\D/g, "");
          if (clean.length >= 9) {
            phoneSet.add(clean.startsWith("51") ? clean : `51${clean}`);
          }
        }
      });
    });

    const phoneList = Array.from(phoneSet);
    if (phoneList.length === 0) {
      toast.error("No se encontraron números de teléfono válidos en los registros seleccionados");
      return;
    }

    navigator.clipboard.writeText(phoneList.join("\n"));
    toast.success(`📋 ${phoneList.length} teléfonos copiados al portapapeles`, {
      description: "Listos para pegar en listas de difusión o Excel.",
    });
  };

  // 3. Generar enlace de WhatsApp para promo de reincorporación
  const getWhatsAppPromoUrl = (del: DeletedStudentLog) => {
    const rawPhone = getPrimaryPhone(del);
    const cleanPhone = rawPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`;
    const contactName = getPrimaryContactName(del);

    const message = `¡Hola ${contactName}! 🎵 Te saludamos de parte del equipo de Vibra Music School.

Recordamos con mucho aprecio a ${del.studentName} y sus clases de ${del.instrument}. Nos encantaría verle retomar su formación musical este mes con nosotros.

🎁 Tenemos una *Promoción Exclusiva de Reincorporación* para ustedes:
✨ Matrícula 100% libre de costo.
✨ Tarifa preferencial en su plan mensual.
✨ Reserva prioritaria en los horarios disponibles.

¿Te gustaría que te comparta los cupos y horarios para coordinar su regreso? ¡Será un gusto tenerlos de vuelta en la academia! 🎹🎸🥁`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl border-primary/30 bg-card">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Trash2 className="h-5 w-5 text-rose-500" />
              <span>Papelera & Leads de Reincorporación</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-bold text-rose-600 border-rose-500/40 bg-rose-500/10">
                {metrics.total} {metrics.total === 1 ? "eliminado" : "eliminados"}
              </Badge>
              <Badge variant="outline" className="text-xs font-bold text-amber-500 border-amber-500/40 bg-amber-500/10">
                🎯 {metrics.reincorporacion} Leads Promos
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Gestión de auditoría histórica y extracción de prospectos para campañas de promociones y recuperación de alumnos.
          </DialogDescription>
        </DialogHeader>

        {/* Pestañas de Segmentación Inteligente */}
        <div className="flex items-center gap-2 border-b border-border pb-3 pt-2">
          <button
            type="button"
            data-tour="trash-tab-reincorp"
            onClick={() => setSegmentTab("reincorporacion")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              segmentTab === "reincorporacion"
                ? "bg-amber-500 text-black shadow-sm"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            🎯 Leads de Reincorporación ({metrics.reincorporacion})
          </button>
          <button
            type="button"
            onClick={() => setSegmentTab("all")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              segmentTab === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Todos los Registros ({metrics.total})
          </button>
          <button
            type="button"
            onClick={() => setSegmentTab("descartables")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              segmentTab === "descartables"
                ? "bg-muted text-foreground border border-border"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            Descartables / Errores ({metrics.descartables})
          </button>
        </div>

        {/* Notificación explicativa del segmento activo */}
        {segmentTab === "reincorporacion" && (
          <div className="p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-500 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>
                <strong>Modo Campaña Activo:</strong> Se muestran solo alumnos que dejaron de pagar o se retiraron voluntariamente. Los errores de registro y pruebas técnicas están filtrados y excluidos automáticamente para no ensuciar tus promociones.
              </span>
            </div>
            <Link
              to="/admin/campanas"
              onClick={() => onOpenChange(false)}
              className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500 text-black px-2.5 py-1 rounded-lg hover:bg-amber-400 transition-colors"
            >
              <Send className="h-3 w-3" />
              Ir a Campañas WhatsApp
            </Link>
          </div>
        )}

        {/* Barra de Filtros y Búsqueda */}
        <div className="space-y-3 p-3.5 rounded-2xl border border-border bg-muted/20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Buscador de texto */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar alumno, familia, teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs bg-background h-8"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Filtro por Motivo Específico */}
            <div>
              <Select value={selectedReason} onValueChange={setSelectedReason}>
                <SelectTrigger data-tour="trash-filter-reason" className="text-xs bg-background h-8">
                  <SelectValue placeholder="Filtrar por motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🔍 Todos los motivos</SelectItem>
                  <SelectItem value="falta_pago">🔴 Falta de pago / Deudor</SelectItem>
                  <SelectItem value="retiro_voluntario">🚪 Retiro voluntario / Traslado</SelectItem>
                  <SelectItem value="error_registro">⚠️ Error de secretaría (Descartable)</SelectItem>
                  <SelectItem value="prueba_sistema">🧪 Prueba técnica (Descartable)</SelectItem>
                  <SelectItem value="otro">📝 Otro motivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Fecha y Hora */}
            <div>
              <Select value={dateFilter} onValueChange={(v: any) => setDateFilter(v)}>
                <SelectTrigger className="text-xs bg-background h-8">
                  <SelectValue placeholder="Filtrar por fecha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📅 Cualquier fecha</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="last7">Últimos 7 días</SelectItem>
                  <SelectItem value="last30">Últimos 30 días</SelectItem>
                  <SelectItem value="thisMonth">Este mes</SelectItem>
                  <SelectItem value="custom">Rango personalizado...</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rango Personalizado de Fechas (si se activa) */}
          {dateFilter === "custom" && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-muted-foreground font-semibold">Desde:</span>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="text-xs bg-background h-7 w-36"
              />
              <span className="text-[11px] text-muted-foreground font-semibold">Hasta:</span>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="text-xs bg-background h-7 w-36"
              />
              {(customStartDate || customEndDate) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setCustomStartDate("");
                    setCustomEndDate("");
                  }}
                  className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                >
                  Limpiar fechas
                </Button>
              )}
            </div>
          )}

          {/* Botones de Extracción para Campaña */}
          <div className="flex items-center justify-between pt-1 border-t border-border flex-wrap gap-2">
            <span className="text-[11px] text-muted-foreground">
              Mostrando <strong>{filteredList.length}</strong> de {deletedStudents.length} registros
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyPhones}
                disabled={filteredList.length === 0}
                className="h-7 text-[11px] font-semibold gap-1.5 bg-background border-border"
              >
                <Copy className="h-3 w-3 text-muted-foreground" />
                Copiar Teléfonos para Difusión
              </Button>
              <Button
                size="sm"
                onClick={handleExportCSV}
                disabled={filteredList.length === 0}
                className="h-7 text-[11px] font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Download className="h-3 w-3" />
                Exportar Leads a CSV (Excel)
              </Button>
            </div>
          </div>
        </div>

        {/* Listado de Alumnos / Leads */}
        <div className="space-y-3 py-1">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-2xl space-y-2">
              <Trash2 className="h-10 w-10 mx-auto text-muted-foreground/30" />
              <p className="text-sm font-bold text-foreground">No se encontraron registros</p>
              <p className="text-xs text-muted-foreground">
                Prueba ajustando los filtros de búsqueda, motivo o rango de fechas.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredList.map((del) => {
                const categoryBadge = {
                  falta_pago: { label: "🔴 Falta de pago / Deudor", color: "bg-destructive/15 text-destructive border-destructive/30" },
                  error_registro: { label: "⚠️ Error de registro", color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
                  prueba_sistema: { label: "🧪 Prueba de sistema", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30" },
                  retiro_voluntario: { label: "🚪 Retiro voluntario", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30" },
                  otro: { label: "📝 Otro motivo", color: "bg-muted text-muted-foreground border-border" },
                }[del.reasonCategory] || { label: del.reasonCategory, color: "bg-muted text-muted-foreground" };

                const isPromoLead = del.reasonCategory === "falta_pago" || del.reasonCategory === "retiro_voluntario";
                const primaryPhone = getPrimaryPhone(del);

                return (
                  <div
                    key={del.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-3 shadow-xs ${
                      isPromoLead
                        ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
                        : "border-border bg-card/60 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-sm">{del.studentName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${categoryBadge.color}`}>
                            {categoryBadge.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {del.family} · {del.instrument} · {del.modality}
                          </span>
                        </div>

                        {del.reasonText && (
                          <p className="text-[11px] text-foreground italic bg-muted/40 px-2.5 py-1 rounded-md">
                            "{del.reasonText}"
                          </p>
                        )}
                      </div>

                      {/* Botones de acción rápida por alumno */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {isPromoLead && primaryPhone && (
                          <a
                            href={getWhatsAppPromoUrl(del)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            WhatsApp Promo
                          </a>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          data-tour="trash-btn-restore"
                          onClick={() => {
                            restoreDeletedStudent(del.id);
                            toast.success(`✓ Alumno ${del.studentName} restaurado con éxito al directorio activo.`);
                          }}
                          className="h-8 text-xs font-bold gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Restaurar Alumno
                        </Button>
                      </div>
                    </div>

                    {/* Ficha de contactos para campaña */}
                    <div className="pt-2 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                      {/* Papá */}
                      <div className="bg-background/80 p-2 rounded-xl border border-border">
                        <span className="text-[10px] font-bold text-muted-foreground block">👨 Papá</span>
                        <p className="font-semibold text-foreground truncate">{del.fatherName || "No registrado"}</p>
                        {del.fatherPhone ? (
                          <a
                            href={`https://wa.me/51${del.fatherPhone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1"
                          >
                            <MessageCircle className="h-3 w-3" /> {del.fatherPhone}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-[10px]">Sin teléfono</span>
                        )}
                      </div>

                      {/* Mamá */}
                      <div className="bg-background/80 p-2 rounded-xl border border-border">
                        <span className="text-[10px] font-bold text-muted-foreground block">👩 Mamá</span>
                        <p className="font-semibold text-foreground truncate">{del.motherName || "No registrada"}</p>
                        {del.motherPhone ? (
                          <a
                            href={`https://wa.me/51${del.motherPhone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1"
                          >
                            <MessageCircle className="h-3 w-3" /> {del.motherPhone}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-[10px]">Sin teléfono</span>
                        )}
                      </div>

                      {/* Contacto Alumno / Emergencia */}
                      <div className="bg-background/80 p-2 rounded-xl border border-border">
                        <span className="text-[10px] font-bold text-muted-foreground block">
                          📞 {del.studentSnapshot?.emergencyContact?.relation ? `Emergencia (${del.studentSnapshot.emergencyContact.relation})` : "Alumno Directo"}
                        </span>
                        <p className="font-semibold text-foreground truncate">
                          {del.studentSnapshot?.emergencyContact?.name || del.studentName}
                        </p>
                        {del.studentSnapshot?.emergencyContact?.phone || del.phone ? (
                          <a
                            href={`https://wa.me/51${(del.studentSnapshot?.emergencyContact?.phone || del.phone || "").replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1"
                          >
                            <MessageCircle className="h-3 w-3" /> {del.studentSnapshot?.emergencyContact?.phone || del.phone}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-[10px]">Sin teléfono</span>
                        )}
                      </div>
                    </div>

                    {/* Metadatos de auditoría */}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                      <span>👤 Eliminado por: <strong>{del.deletedBy}</strong></span>
                      <span>📅 Fecha y hora: <strong>{new Date(del.deletedAt).toLocaleString("es-PE")}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex justify-end pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            data-tour="trash-close-btn"
            onClick={() => onOpenChange(false)}
            className="text-xs rounded-xl"
          >
            Cerrar Papelera
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
