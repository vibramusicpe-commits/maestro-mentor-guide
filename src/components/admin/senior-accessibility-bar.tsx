import React from "react";
import { 
  Briefcase, 
  FileSpreadsheet, 
  Sparkles, 
  Type, 
  RefreshCw, 
  ShieldCheck,
  Eye,
  HelpCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type SeniorFontSize = "normal" | "mediano" | "grande";
export type FinanceViewProfile = "duena" | "contador";

interface SeniorAccessibilityBarProps {
  profile: FinanceViewProfile;
  onProfileChange: (p: FinanceViewProfile) => void;
  fontSize: SeniorFontSize;
  onFontSizeChange: (s: SeniorFontSize) => void;
  onOpenLayaExplainer?: () => void;
  activeCount: number;
  isSyncing: boolean;
  onSync: () => void;
}

export function SeniorAccessibilityBar({
  profile,
  onProfileChange,
  fontSize,
  onFontSizeChange,
  onOpenLayaExplainer,
  activeCount,
  isSyncing,
  onSync,
}: SeniorAccessibilityBarProps) {
  return (
    <div className="w-full bg-[#1A1410] border-2 border-[#F47B20]/30 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
      {/* Fila Superior: Perfil + Asistente + Accesibilidad */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Selector de Perfil: Dueña vs Contador */}
        <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => onProfileChange("duena")}
            className={`px-4 py-2.5 rounded-lg font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              profile === "duena"
                ? "bg-[#F47B20] text-[#0D0B0A] shadow-md scale-102"
                : "text-[#FFF8EC]/70 hover:text-white hover:bg-white/5"
            }`}
            title="Vista ejecutiva de caja, cobros y metas para la dueña"
          >
            <Briefcase className="h-4 w-4" />
            <span>💼 Vista Dueña (Caja y Cobranza)</span>
          </button>

          <button
            type="button"
            onClick={() => onProfileChange("contador")}
            className={`px-4 py-2.5 rounded-lg font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              profile === "contador"
                ? "bg-emerald-500 text-[#0D0B0A] shadow-md scale-102"
                : "text-[#FFF8EC]/70 hover:text-white hover:bg-white/5"
            }`}
            title="Vista contable con Libro Diario, conciliación de N° de Operación y exportación fiscal"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>📑 Vista Contador (Bancos y Cuadre)</span>
          </button>
        </div>

        {/* Controles de Accesibilidad Visual (A- / A / A+) y Asistente Agéntico */}
        <div className="flex items-center gap-2.5">
          {/* Botón Asistente Agéntico Laya */}
          {onOpenLayaExplainer && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenLayaExplainer}
              className="h-10 px-3.5 bg-purple-500/15 border-purple-500/40 text-purple-300 hover:bg-purple-500/25 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xs"
              title="Laya te explica en palabras sencillas el estado del dinero y las deudas"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>💡 Explicar con Laya</span>
            </Button>
          )}

          {/* Selector de Tamaño de Letra (A- / A / A+) */}
          <div className="flex items-center bg-black/60 rounded-xl border border-white/10 p-1">
            <span className="text-[11px] font-bold text-muted-foreground px-2 hidden sm:inline flex items-center gap-1">
              <Type className="h-3.5 w-3.5" /> Letra:
            </span>

            <button
              type="button"
              onClick={() => onFontSizeChange("normal")}
              className={`h-8 px-2.5 rounded-md text-xs font-black transition-all ${
                fontSize === "normal"
                  ? "bg-white/20 text-white font-bold"
                  : "text-muted-foreground hover:text-white"
              }`}
              title="Tamaño de letra normal (14px)"
            >
              A
            </button>

            <button
              type="button"
              onClick={() => onFontSizeChange("mediano")}
              className={`h-8 px-2.5 rounded-md text-sm font-black transition-all ${
                fontSize === "mediano"
                  ? "bg-white/20 text-white font-bold"
                  : "text-muted-foreground hover:text-white"
              }`}
              title="Tamaño de letra mediano (16px)"
            >
              A+
            </button>

            <button
              type="button"
              onClick={() => onFontSizeChange("grande")}
              className={`h-8 px-3 rounded-md text-base font-black transition-all ${
                fontSize === "grande"
                  ? "bg-[#FFB52E] text-black font-black shadow-xs"
                  : "text-[#FFB52E]/70 hover:text-[#FFB52E]"
              }`}
              title="Tamaño de letra grande para descanso visual (18px a 24px)"
            >
              A++ Senior
            </button>
          </div>

          {/* Botón Sincronizar PostgreSQL */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSync}
            disabled={isSyncing}
            className="h-10 px-3 bg-black/40 border-white/10 text-muted-foreground hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            title="Refrescar datos en vivo con PostgreSQL"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin text-primary" : "text-emerald-400"}`} />
            <span className="hidden sm:inline">{isSyncing ? "Actualizando..." : "Sincronizar"}</span>
          </Button>
        </div>
      </div>

      {/* Franja Informativa de Garantía Cero Mock */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold py-0.5">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            100% Datos Reales en Vivo ({activeCount} Alumnos Activos)
          </Badge>
          <span className="hidden md:inline text-[11px] text-[#FFF8EC]/60">
            • Sin datos simulados ni estimaciones de prueba. Todos los montos provienen de PostgreSQL.
          </span>
        </div>

        <div className="text-[11px] text-[#FFB52E] font-medium flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          <span>
            {profile === "duena"
              ? "Modo Dueña: Enfoque en dinero ingresado, deudas por cobrar y WhatsApp"
              : "Modo Contador: Enfoque en N° de Operación bancario, conciliación y exportación"}
          </span>
        </div>
      </div>
    </div>
  );
}
