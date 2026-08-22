import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Cake, Gift, Send, Edit3, Calendar, Check, Phone } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// Parser inteligente para detectar el mes de cumpleaños en cualquier formato
function getStudentBirthMonthIndex(birthdateStr?: string): number | null {
  if (!birthdateStr) return null;
  const raw = birthdateStr.trim().toLowerCase();

  // 1. Coincidencia por nombre de mes
  for (let i = 0; i < MONTH_NAMES.length; i++) {
    const mName = MONTH_NAMES[i]!.toLowerCase();
    if (raw.includes(mName)) return i;
  }

  // 2. Coincidencia por formato numérico DD/MM/YYYY o DD-MM-YYYY
  const partsSlash = raw.split(/[\/\-]/);
  if (partsSlash.length >= 2) {
    // Si primer elemento tiene 4 dígitos (YYYY-MM-DD)
    if (partsSlash[0]!.length === 4) {
      const monthNum = parseInt(partsSlash[1]!, 10);
      if (monthNum >= 1 && monthNum <= 12) return monthNum - 1;
    } else {
      // DD/MM/YYYY
      const monthNum = parseInt(partsSlash[1]!, 10);
      if (monthNum >= 1 && monthNum <= 12) return monthNum - 1;
    }
  }

  return null;
}

export function BirthdayWidget() {
  const students = useAppStore((s) => s.adminStudents);
  const updateStudentDetails = useAppStore((s) => s.updateStudentDetails);

  // Mes actual por defecto (0 = Enero, 7 = Agosto, 8 = Septiembre)
  const currentMonthIdx = new Date().getMonth();
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(currentMonthIdx >= 0 ? currentMonthIdx : 7);

  // Estado del modal de edición
  const [editingStudent, setEditingStudent] = useState<{
    id: string;
    name: string;
    birthdate: string;
    phone: string;
    family: string;
  } | null>(null);

  const [editBirthdate, setEditBirthdate] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Filtrar alumnos que cumplen años en el mes seleccionado
  const monthBirthdays = useMemo(() => {
    return students.filter((s) => {
      const bMonth = getStudentBirthMonthIndex(s.birthdate);
      // Si coincide con el mes seleccionado o si la cadena incluye el nombre del mes
      return bMonth === selectedMonthIdx || (s.birthdate && s.birthdate.toLowerCase().includes(MONTH_NAMES[selectedMonthIdx]!.toLowerCase()));
    });
  }, [students, selectedMonthIdx]);

  const handleOpenEdit = (st: typeof students[0]) => {
    setEditingStudent({
      id: st.id,
      name: st.name,
      birthdate: st.birthdate || "",
      phone: st.phone || st.emergencyContact?.phone || "",
      family: st.family,
    });
    setEditBirthdate(st.birthdate || "");
    setEditPhone(st.phone || st.emergencyContact?.phone || "");
  };

  const handleSaveStudent = () => {
    if (!editingStudent) return;
    if (!editBirthdate.trim()) {
      toast.error("Ingresa la fecha de cumpleaños");
      return;
    }

    updateStudentDetails(editingStudent.id, {
      birthdate: editBirthdate.trim(),
      phone: editPhone.trim(),
    });

    toast.success(`Cumpleaños actualizado para ${editingStudent.name}`, {
      description: `Nueva fecha: ${editBirthdate.trim()} · Teléfono: ${editPhone.trim() || "S/N"}.`,
    });
    setEditingStudent(null);
  };

  const handleSendWhatsAppGreeting = (st: typeof students[0]) => {
    const rawPhone = st.phone || st.emergencyContact?.phone || "";
    const cleanPhone = rawPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("51") ? cleanPhone : cleanPhone ? `51${cleanPhone}` : "51900000000";

    const msg = `🎂 ¡Feliz Cumpleaños, ${st.name}! 🎉 De parte de todo el equipo y profesores de Vibra Music, te deseamos un día extraordinario lleno de alegría y música. ¡Sigue brillando en tu instrumento! 🎶🎁`;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");

    toast.success(`WhatsApp de Cumpleaños preparado para ${st.name}`, {
      description: `Mensaje enviado al ${rawPhone || "número registrado"}.`,
    });
  };

  return (
    <>
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Cake className="h-5 w-5 text-warning" />
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  Cumpleaños de {MONTH_NAMES[selectedMonthIdx]} ({monthBirthdays.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Recordatorios automáticos para enviar felicitaciones y editar fechas de los alumnos.
                </CardDescription>
              </div>
            </div>

            {/* Selector de Mes Dinámico */}
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">Mes:</label>
              <select
                value={selectedMonthIdx}
                onChange={(e) => setSelectedMonthIdx(parseInt(e.target.value, 10))}
                className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-bold text-foreground"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {monthBirthdays.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              <Gift className="h-6 w-6 text-muted-foreground/50 mx-auto mb-1.5" />
              <p className="font-semibold text-foreground">No hay cumpleaños registrados en {MONTH_NAMES[selectedMonthIdx]}</p>
              <p className="text-[11px]">Puedes asignar o modificar la fecha de cumpleaños en la ficha de cada alumno.</p>
            </div>
          ) : (
            monthBirthdays.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs hover:border-warning/50 transition-colors gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-foreground truncate">{st.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {st.family} · <span className="font-semibold text-warning">{st.birthdate || "Fecha no asignada"}</span>
                    {st.phone && <span className="ml-1 text-[10px]">({st.phone})</span>}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-xs font-semibold gap-1"
                    onClick={() => handleOpenEdit(st)}
                    title="Editar fecha de nacimiento o celular"
                  >
                    <Edit3 className="h-3 w-3 text-muted-foreground" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="h-8 px-2.5 text-xs font-bold gap-1 bg-warning text-warning-foreground hover:bg-warning/90"
                    onClick={() => handleSendWhatsAppGreeting(st)}
                  >
                    <Send className="h-3 w-3" />
                    Felicitar
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Modal de Edición de Cumpleaños para Nayeli */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2 text-foreground">
              <Cake className="h-5 w-5 text-warning" />
              Editar Cumpleaños · {editingStudent?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Familia: <strong>{editingStudent?.family}</strong>. Modifica la fecha de nacimiento y contacto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="block text-[10px] text-muted-foreground font-semibold mb-1">
                🗓️ Fecha de Cumpleaños (ej: 15 de Septiembre o 15/09/2015)
              </label>
              <Input
                type="text"
                placeholder="Ej: 15 de Septiembre o 15/09/2015"
                value={editBirthdate}
                onChange={(e) => setEditBirthdate(e.target.value)}
                className="h-8 text-xs font-bold bg-background"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-muted-foreground font-semibold mb-1">
                📱 Teléfono / WhatsApp para Felicitación
              </label>
              <Input
                type="text"
                placeholder="Ej: 987 654 321"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditingStudent(null)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveStudent}
              className="bg-primary text-primary-foreground font-bold text-xs gap-1"
            >
              <Check className="h-3.5 w-3.5" /> Guardar Cumpleaños
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
