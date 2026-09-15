import { useState, useMemo, useEffect } from "react";
import {
  Lock,
  Send,
  MessageCircle,
  Search,
  Sparkles,
  CheckCircle2,
  Users,
  GraduationCap,
  ExternalLink,
  User,
  Phone,
  BookOpen,
  Clock,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore, type AdminStudent } from "@/store/app-store";
import {
  submitTeacherNote,
  fetchAllTeacherNotes,
  NOTES_SYNC_CHANNEL,
  type TeacherParentNote,
} from "@/lib/services/teacher-notes.service";
import { toast } from "sonner";

export function LessonNotes() {
  const currentUser = useAppStore((s) => s.currentUser);
  const adminStudents = useAppStore((s) => s.adminStudents);
  const schedule = useAppStore((s) => s.schedule);
  const updateStudentDetails = useAppStore((s) => s.updateStudentDetails);
  const privateNote = useAppStore((s) => s.privateNote);
  const publicNote = useAppStore((s) => s.publicNote);
  const setNote = useAppStore((s) => s.setNote);

  // Extraer el nombre limpio del profesor activo
  const teacherRawName = currentUser?.name ?? "Jeremy";
  const teacherClean = teacherRawName
    .toLowerCase()
    .replace(/\s*\(.*?\)/, "")
    .replace(/^prof\.\s*/i, "")
    .trim();

  // Filtrar alumnos vinculados al profesor (por asignación directa o por horario)
  const teacherStudents = useMemo(() => {
    const studentsByTeacher = adminStudents.filter((st) => {
      const stTeacher = (st.teacher || "").toLowerCase();
      return stTeacher.includes(teacherClean) || teacherClean.includes(stTeacher);
    });

    // Si por algún motivo la lista es corta, incluir alumnos con clases programadas con este profesor
    const studentNamesInSchedule = new Set(
      schedule
        .filter((sch) => {
          const schT = sch.teacher.toLowerCase();
          return schT.includes(teacherClean) || teacherClean.includes(schT);
        })
        .map((l) => l.student.toLowerCase())
    );

    const merged = adminStudents.filter(
      (st) =>
        studentsByTeacher.some((s) => s.id === st.id) ||
        studentNamesInSchedule.has(st.name.toLowerCase())
    );

    return merged.length > 0 ? merged : adminStudents;
  }, [adminStudents, schedule, teacherClean]);

  // Modo de destinatario: "general" o id del alumno seleccionado
  const [selectedRecipient, setSelectedRecipient] = useState<string>("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [studentNote, setStudentNote] = useState("");
  const [generalNote, setGeneralNote] = useState(publicNote || "");
  const [submittingNote, setSubmittingNote] = useState(false);

  const teacherNotes = useAppStore((s) => s.teacherNotes);
  const addOrUpdateTeacherNote = useAppStore((s) => s.addOrUpdateTeacherNote);
  const setTeacherNotes = useAppStore((s) => s.setTeacherNotes);

  // Sincronización en vivo de notas docentes
  useEffect(() => {
    fetchAllTeacherNotes().then(setTeacherNotes);

    const onUpdate = () => {
      fetchAllTeacherNotes().then(setTeacherNotes);
    };
    window.addEventListener("vibra-notes-updated", onUpdate);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel(NOTES_SYNC_CHANNEL);
      bc.onmessage = () => onUpdate();
    }

    return () => {
      window.removeEventListener("vibra-notes-updated", onUpdate);
      bc?.close();
    };
  }, [setTeacherNotes]);

  // Alumno actualmente seleccionado
  const selectedStudent = useMemo<AdminStudent | null>(() => {
    if (selectedRecipient === "general") return null;
    return teacherStudents.find((s) => s.id === selectedRecipient) || null;
  }, [teacherStudents, selectedRecipient]);

  // Nota más reciente para el alumno seleccionado
  const latestStudentNote = useMemo(() => {
    if (!selectedStudent) return null;
    return teacherNotes.find((n) => n.studentId === selectedStudent.id) || null;
  }, [teacherNotes, selectedStudent]);

  // Al cambiar de alumno, pre-cargar su última nota redactada
  const handleSelectStudent = (st: AdminStudent) => {
    setSelectedRecipient(st.id);
    const existing = teacherNotes.find((n) => n.studentId === st.id);
    if (existing) {
      setStudentNote(existing.content);
    } else {
      setStudentNote(st.teacherNote || "");
    }
  };

  // Alumnos filtrados en el buscador
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return teacherStudents;
    const q = searchQuery.toLowerCase();
    return teacherStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.family.toLowerCase().includes(q) ||
        s.instrument.toLowerCase().includes(q)
    );
  }, [teacherStudents, searchQuery]);

  // Enviar nota pedagógica a moderación de administración
  const handleSubmitStudentNote = async () => {
    if (!selectedStudent) return;
    if (!studentNote.trim()) {
      toast.error("Por favor redacta la nota antes de enviarla.");
      return;
    }

    setSubmittingNote(true);
    try {
      const activeRole = useAppStore.getState().activeRole;
      const email = currentUser?.email?.toLowerCase() || "";
      const teacherId = email.includes("jeremy")
        ? "00000000-0000-0000-0000-000000000003"
        : email.includes("fernando")
        ? "00000000-0000-0000-0000-000000000004"
        : email.includes("nathaly")
        ? "00000000-0000-0000-0000-000000000005"
        : "00000000-0000-0000-0000-000000000006";

      const created = await submitTeacherNote(activeRole, {
        teacherId,
        teacherName: currentUser?.name || "Profesor Vibra",
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        familyName: selectedStudent.family,
        parentPhone: selectedStudent.phone || selectedStudent.emergencyContact?.phone,
        instrument: selectedStudent.instrument,
        content: studentNote,
      });

      addOrUpdateTeacherNote(created);
      toast.success(`✓ Nota enviada a revisión de administración para ${selectedStudent.name}`, {
        description: "Dirección o Secretaría evaluará el contenido antes de publicarlo a los padres.",
      });
    } catch (err: any) {
      toast.error("Error al enviar nota: " + (err.message || "Error de conexión"));
    } finally {
      setSubmittingNote(false);
    }
  };

  // Guardar comunicado general para todas las familias
  const handleSaveGeneralNote = () => {
    setNote("public", generalNote);
    toast.success("✓ Anuncio general publicado con éxito", {
      description: "Visible como aviso institucional para todas tus familias vinculadas.",
    });
  };

  // Generar enlace WhatsApp con mensaje pre-rellenado para los padres (solo habilitado si está aprobada)
  const handleSendWhatsApp = () => {
    if (!selectedStudent) return;
    if (latestStudentNote?.status !== "aprobado") {
      toast.warning("La nota debe ser aprobada por administración antes de enviarla a los padres.", {
        description: "Estado actual: " + (latestStudentNote?.status === "pendiente" ? "⏳ En Revisión" : "❌ Requiere Ajustes"),
      });
      return;
    }

    const phone =
      selectedStudent.phone?.replace(/[^0-9]/g, "") ||
      selectedStudent.emergencyContact?.phone?.replace(/[^0-9]/g, "") ||
      "";

    if (!phone || phone.length < 8) {
      toast.error("El alumno no tiene un teléfono válido registrado.");
      return;
    }

    const cleanPhone = phone.startsWith("51") ? phone : `51${phone}`;
    const teacherDisplayName = currentUser?.name?.split("(")[0]?.trim() || "Profesor de Música";

    const msg =
      `¡Hola ${selectedStudent.family}! 🎶 Le saluda el Prof. ${teacherDisplayName} de *Vibra Music Staff*.\n\n` +
      `📝 *Reporte Pedagógico de Clase — ${selectedStudent.name}* (${selectedStudent.instrument}):\n` +
      `"${studentNote.trim() || "Excelente desempeño en la clase de hoy."}"\n\n` +
      `Recuerden que pueden ingresar a su *Portal de Familia* para revisar fechas, asistencias y material de práctica: https://vibramusic.pe/family\n\n` +
      `¡Muchas gracias por su compromiso y apoyo constante! 🎹🎸🥁`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    toast.info(`Abriendo WhatsApp con la Familia ${selectedStudent.family}...`);
  };

  // Plantillas de retroalimentación pedagógica rápida
  const quickTemplates = [
    {
      label: "🎯 Avance Técnico",
      text: "¡Gran clase hoy! Mejoró notablemente la postura de manos, digitación y la precisión del ritmo con metrónomo.",
    },
    {
      label: "🎶 Nueva Canción",
      text: "Comenzamos el montaje de una nueva pieza musical. Por favor practicar 15 minutos diarios los compases trabajados.",
    },
    {
      label: "⭐ Felicitación",
      text: "¡Excelente concentración y motivación en la sesión de hoy! Se nota su constancia y amor por la música.",
    },
  ];

  return (
    <Tabs defaultValue="public" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="public" className="gap-1.5 text-xs font-bold">
          <Send className="h-3.5 w-3.5" /> Nota a la Familia
        </TabsTrigger>
        <TabsTrigger value="private" className="gap-1.5 text-xs font-bold">
          <Lock className="h-3.5 w-3.5" /> Nota Privada (Dirección)
        </TabsTrigger>
      </TabsList>

      {/* ─── PESTAÑA: NOTA A LA FAMILIA (CON BUSCADOR Y SELECCIÓN DE ALUMNO O GENERAL) ─── */}
      <TabsContent value="public" className="mt-3 space-y-3">
        {/* Selector de Destinatario: General vs Alumno Específico */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" /> Destinatario de la Nota
            </span>
            <span className="text-[10px] text-muted-foreground">
              {teacherStudents.length} alumnos asignados
            </span>
          </label>

          {/* Botones de Selección Rápida */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              size="sm"
              variant={selectedRecipient === "general" ? "default" : "outline"}
              onClick={() => setSelectedRecipient("general")}
              className={`h-8 text-xs font-bold gap-1.5 rounded-xl ${
                selectedRecipient === "general"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" /> 📢 Nota General (Todas las Familias)
            </Button>

            {selectedStudent && (
              <Badge
                variant="secondary"
                className="h-8 px-2.5 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/30 flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5" />
                <span>{selectedStudent.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedRecipient("general")}
                  className="ml-1 text-xs hover:opacity-75 font-black"
                >
                  ✕
                </button>
              </Badge>
            )}
          </div>

          {/* Panel Buscador de Alumnos si no ha elegido o quiere cambiar */}
          {selectedRecipient === "general" && (
            <div className="pt-2 space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Escribe el nombre del alumno para enviarle nota personalizada..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8 rounded-xl bg-background"
                />
              </div>

              {searchQuery.trim().length > 0 && (
                <div className="max-h-44 overflow-y-auto rounded-xl border border-border bg-popover p-1 space-y-1 shadow-md">
                  {filteredStudents.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        handleSelectStudent(st);
                        setSearchQuery("");
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-muted/80 flex items-center justify-between text-xs transition-colors group"
                    >
                      <div>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {st.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {st.family} · {st.instrument} ({st.ageCategory || "JUNIOR"})
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-bold">
                        Seleccionar →
                      </Badge>
                    </button>
                  ))}
                  {filteredStudents.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-2">
                      No se encontraron alumnos con ese nombre.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── CASO A: ALUMNO ESPECÍFICO SELECCIONADO ── */}
        {selectedStudent ? (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3.5 space-y-3">
            {/* Ficha Resumen del Alumno y Familia */}
            <div className="flex items-start justify-between gap-2 flex-wrap pb-2 border-b border-primary/20">
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  {selectedStudent.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {selectedStudent.family} · Instrumento: <strong>{selectedStudent.instrument}</strong>
                </p>
              </div>

              <div className="text-right text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 text-foreground font-semibold">
                  <Phone className="h-3 w-3 text-success" />
                  {selectedStudent.phone || selectedStudent.emergencyContact?.phone || "Sin teléfono"}
                </span>
                <span>Apoderado: {selectedStudent.emergencyContact?.name || "Titular"}</span>
              </div>
            </div>

            {/* Banner de Estado de Moderación de la Nota */}
            {latestStudentNote && (
              <div className="pt-1">
                {latestStudentNote.status === "pendiente" ? (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-500 dark:text-amber-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Clock className="h-4 w-4" />
                      <span>⏳ Nota en Revisión por Administración</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Esta nota fue enviada a Dirección / Secretaría y está en cola de moderación. Se publicará automáticamente en el Portal de la Familia en cuanto sea aprobada.
                    </p>
                  </div>
                ) : latestStudentNote.status === "aprobado" ? (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="h-4 w-4" />
                      <span>✅ Nota Aprobada y Publicada</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {latestStudentNote.moderatedBy ? `Autorizada por ${latestStudentNote.moderatedBy}. ` : ""}
                      Ya se encuentra disponible en el Portal Familiar del alumno y lista para enviarse por WhatsApp.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="h-4 w-4" />
                      <span>❌ Nota Devuelta con Observaciones</span>
                    </div>
                    <p className="text-[11px] text-foreground font-medium">
                      Motivo de administración: &ldquo;{latestStudentNote.moderationComment || "Ajustar redacción antes de enviar a la familia"}&rdquo;
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Corrige el texto a continuación y presiona &ldquo;Reenviar a Revisión&rdquo;.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Plantillas de texto rápido */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[#FFB52E]" /> Plantillas Rápidas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickTemplates.map((tpl) => (
                  <Button
                    key={tpl.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStudentNote(tpl.text)}
                    className="h-6 text-[10px] px-2 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
                  >
                    {tpl.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Editor de la Nota Personalizada */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Reporte Pedagógico / Mensaje para los Padres</span>
                <span className="text-[10px] text-muted-foreground">Filtro Administrativo Requerido</span>
              </label>
              <Textarea
                value={studentNote}
                onChange={(e) => setStudentNote(e.target.value)}
                placeholder={`Escribe aquí el resumen de la clase de ${selectedStudent.name}, sus avances técnicos y qué debe practicar en casa...`}
                className="min-h-24 text-xs bg-background"
              />
            </div>

            {/* Botones de Acción con Filtro de Moderación */}
            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
              <Button
                type="button"
                size="sm"
                disabled={submittingNote}
                onClick={handleSubmitStudentNote}
                className="h-8 text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
              >
                {submittingNote ? (
                  <span className="flex items-center gap-1">
                    <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                    Enviando a Revisión...
                  </span>
                ) : latestStudentNote?.status === "pendiente" ? (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Actualizar Nota en Revisión
                  </>
                ) : latestStudentNote?.status === "rechazado" ? (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Corregir y Reenviar a Revisión
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Enviar a Revisión de Administración
                  </>
                )}
              </Button>

              {latestStudentNote?.status === "aprobado" ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSendWhatsApp}
                  className="h-8 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs rounded-xl"
                >
                  <MessageCircle className="h-3.5 w-3.5 fill-current" />
                  📲 Enviar WhatsApp a la Familia (Aprobada)
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled
                  title="La nota debe ser revisada y aprobada por administración antes de enviarla a los padres"
                  className="h-8 text-xs font-semibold gap-1.5 opacity-60 cursor-not-allowed rounded-xl"
                >
                  <Lock className="h-3 w-3" />
                  WhatsApp Bloqueado (Requiere Aprobación)
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* ── CASO B: NOTA GENERAL PARA TODAS LAS FAMILIAS ── */
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-1 text-xs">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                📢 Comunicado General a Todas tus Familias
              </p>
              <p className="text-[11px] text-muted-foreground">
                Este mensaje se mostrará a todos los apoderados de tus alumnos en el Portal de Familia de Vibra Music.
              </p>
            </div>

            <Textarea
              value={generalNote}
              onChange={(e) => setGeneralNote(e.target.value)}
              placeholder="Escribe un anuncio para todas tus familias (ej: Recordatorio de materiales, bienvenida al mes, ensayos de ensamble)..."
              className="min-h-24 text-xs"
            />

            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={handleSaveGeneralNote}
                className="h-8 text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-3.5 w-3.5" /> Publicar Anuncio General
              </Button>
            </div>
          </div>
        )}
      </TabsContent>

      {/* ─── PESTAÑA: NOTA PRIVADA (DOCENTE / DIRECCIÓN) ─── */}
      <TabsContent value="private" className="mt-3 space-y-2">
        <Textarea
          value={privateNote}
          onChange={(e) => setNote("private", e.target.value)}
          placeholder="Solo tú y la dirección ven esta nota… (ej. incidencias de conducta, instrumentos de la sede, temas administrativos)"
          className="min-h-24 text-xs"
        />
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>🔒 Confidencial: Visible únicamente para el equipo docente y dirección.</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setNote("private", privateNote);
              toast.success("✓ Nota privada guardada");
            }}
            className="h-7 text-[11px] font-bold"
          >
            Guardar
          </Button>
        </div>
      </TabsContent>

      {/* ─── HISTORIAL DE NOTAS DEL DOCENTE (ESTADOS EN VIVO) ─── */}
      {teacherNotes.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" /> Historial de Notas Enviadas ({teacherNotes.length})
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {teacherNotes.slice(0, 5).map((n) => (
              <div
                key={n.id}
                className="rounded-xl border border-border/50 bg-background/50 p-2.5 flex items-start justify-between gap-2 text-xs"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-foreground">{n.studentName}</span>
                    <span className="text-[10px] text-muted-foreground">· {n.instrument}</span>
                    <span className="text-[10px] text-muted-foreground">
                      · {new Date(n.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                    &ldquo;{n.content}&rdquo;
                  </p>
                  {n.status === "rechazado" && n.moderationComment && (
                    <p className="text-[10px] text-rose-500 font-semibold">
                      Motivo: {n.moderationComment}
                    </p>
                  )}
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                    n.status === "aprobado"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : n.status === "rechazado"
                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse"
                  }`}
                >
                  {n.status === "aprobado" ? "APROBADA" : n.status === "rechazado" ? "OBSERVADA" : "EN REVISIÓN"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Tabs>
  );
}
