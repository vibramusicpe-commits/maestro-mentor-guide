import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/app-store";
import {
  createInvitation,
  getInvitations,
  resetUserToMasterPassword,
  revokeInvitation,
  type DBInvitation,
  type InviteTargetRole,
} from "@/lib/services/invitations.service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  UserPlus,
  Copy,
  Check,
  RotateCcw,
  Ban,
  MessageSquare,
  ShieldCheck,
  Users,
  Search,
  Eye,
  Lock,
  ExternalLink,
} from "lucide-react";
import { musicalInstruments } from "@/store/admin-seeds";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/invitaciones")({
  component: AdminInvitationsPage,
});

function AdminInvitationsPage() {
  const activeRole = useAppStore((s) => s.activeRole);
  const currentUser = useAppStore((s) => s.currentUser);

  const [invitations, setInvitations] = useState<DBInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [targetName, setTargetName] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [targetRole, setTargetRole] = useState<InviteTargetRole>("teacher");
  const [selectedSkill, setSelectedSkill] = useState<string>("Piano");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [inviteType, setInviteType] = useState<"teacher" | "family_apoderado" | "adult_student">("teacher");
  const [createdModalData, setCreatedModalData] = useState<{
    masterPassword: string;
    whatsappMessage: string;
  } | null>(null);
  const [viewModalInvite, setViewModalInvite] = useState<(DBInvitation & { master_password?: string }) | null>(null);

  const adminStudents = useAppStore((s) => s.adminStudents);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const data = await getInvitations(activeRole);
      setInvitations(data);
    } catch {
      // Fallback si no hay backend activo
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();

    // Auto-refrescar cuando la ventana recupera el foco (ej. tras probar en otra pestaña/celular)
    const onFocus = () => fetchInvites();
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
    };
  }, [activeRole]);

  // Al seleccionar un alumno de la lista, auto-completar según sea menor o adulto
  const handleSelectStudent = (stId: string) => {
    setSelectedStudentId(stId);
    const st = adminStudents.find((s) => s.id === stId);
    if (!st) return;

    const isAdult = (st.age ?? 10) >= 18;
    if (isAdult) {
      setInviteType("adult_student");
      setTargetRole("family");
      setTargetName(st.name);
      setTargetEmail(st.email || `${st.name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`);
    } else {
      setInviteType("family_apoderado");
      setTargetRole("family");
      setTargetName(st.emergencyContact?.name ? `${st.emergencyContact.name} (${st.family})` : st.family);
      setTargetEmail(st.email || `familia.${st.name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim() || !targetEmail.trim()) {
      toast.error("Por favor completa el nombre y correo del destinatario.");
      return;
    }

    const finalName =
      inviteType === "teacher"
        ? `${targetName.trim()} (${selectedSkill})`
        : targetName.trim();

    try {
      const res = await createInvitation(activeRole, currentUser?.email ?? "admin-id", {
        targetName: finalName,
        targetEmail,
        targetRole,
        targetFamilyId: selectedStudentId || undefined,
      });

      setCreatedModalData({
        masterPassword: res.masterPassword,
        whatsappMessage: res.whatsappMessage,
      });

      toast.success("Invitación creada correctamente");
      setTargetName("");
      setTargetEmail("");
      setSelectedStudentId("");
      fetchInvites();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al crear invitación";
      toast.error(msg);
    }
  };

  // Copia robusta al portapapeles con fallback execCommand para todas las plataformas
  const handleCopyWhatsApp = async (message: string, id: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = message;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopiedId(id);
      toast.success("¡Mensaje copiado al portapapeles! 📋", {
        description: "Ya puedes pegarlo (Ctrl + V) en WhatsApp, Instagram, correo o donde desees.",
      });
      setTimeout(() => setCopiedId(null), 3000);
    } catch {
      toast.error("No se pudo copiar automáticamente. Por favor selecciónalo manualmente.");
    }
  };

  const handleResetPassword = async (targetUser: DBInvitation) => {
    // Seguridad estricta: Nadie excepto la dueña puede alterar accesos de super_admin
    if (targetUser.target_role === ("super_admin" as unknown as InviteTargetRole) || targetUser.target_name.toLowerCase().includes("dueña")) {
      toast.error("Acción denegada", {
        description: "Solo la Dirección General puede gestionar las credenciales de la Dueña.",
      });
      return;
    }

    try {
      await resetUserToMasterPassword(activeRole, currentUser?.email ?? "admin-id", targetUser.id);
      toast.success("Contraseña restablecida 🔄", {
        description: `Se restauró la Clave Maestra y el estado de ${targetUser.target_name} volvió a PENDIENTE.`,
      });
      await fetchInvites();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al restablecer contraseña";
      toast.error(msg);
    }
  };

  const handleRevokeInvite = async (inv: DBInvitation) => {
    if (inv.target_role === ("super_admin" as unknown as InviteTargetRole) || inv.target_name.toLowerCase().includes("dueña")) {
      toast.error("Acción denegada", {
        description: "No se puede eliminar el acceso de la Dirección General.",
      });
      return;
    }

    try {
      await revokeInvitation(activeRole, currentUser?.email ?? "admin-id", inv.id);
      toast.success("Invitación eliminada con éxito.");
      await fetchInvites();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al revocar";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestión de Invitaciones y Accesos</h1>
        <p className="text-sm text-muted-foreground">
          Genera enlaces de invitación y gestiona las contraseñas maestras de Profesores y Apoderados.
        </p>
      </div>

      {/* Formulario de Nueva Invitación */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
          <UserPlus className="h-5 w-5 text-primary" /> Generar Nueva Invitación
        </h2>

        {/* Selector de Tipo de Invitación */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <button
            type="button"
            onClick={() => {
              setInviteType("teacher");
              setTargetRole("teacher");
              setSelectedStudentId("");
              setTargetName("");
              setTargetEmail("");
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              inviteType === "teacher"
                ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                : "border-border bg-background hover:bg-muted/50 text-muted-foreground"
            }`}
          >
            <span className="text-xs uppercase tracking-wider block font-black">1. Profesor / Docente</span>
            <span className="text-xs">Para acceso al Kiosco y toma de asistencia</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setInviteType("family_apoderado");
              setTargetRole("family");
              setSelectedStudentId("");
              setTargetName("");
              setTargetEmail("");
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              inviteType === "family_apoderado"
                ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                : "border-border bg-background hover:bg-muted/50 text-muted-foreground"
            }`}
          >
            <span className="text-xs uppercase tracking-wider block font-black">2. Familiar / Apoderado</span>
            <span className="text-xs">Para papás de alumnos menores de 18 años</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setInviteType("adult_student");
              setTargetRole("family");
              setSelectedStudentId("");
              setTargetName("");
              setTargetEmail("");
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              inviteType === "adult_student"
                ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                : "border-border bg-background hover:bg-muted/50 text-muted-foreground"
            }`}
          >
            <span className="text-xs uppercase tracking-wider block font-black">3. Alumno Adulto (+18)</span>
            <span className="text-xs">El alumno gestiona y paga su propia clase</span>
          </button>
        </div>

        {/* Si es Familiar o Alumno Adulto, permitir vincularlo desde la base de datos de Alumnos */}
        {inviteType !== "teacher" && (
          <div className="mb-4 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
            <label className="block text-xs font-bold text-foreground">
              Vincular con Alumno de la Base de Datos:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => handleSelectStudent(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            >
              <option value="">-- Selecciona un alumno para autocompletar --</option>
              {adminStudents.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.instrument}) · {st.family} {st.age ? `· ${st.age} años (${st.age >= 18 ? 'Adulto' : 'Menor'})` : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground">
              Al seleccionar un alumno, se completará automáticamente el nombre de su apoderado o sus datos personales.
            </p>
          </div>
        )}

        <form onSubmit={handleCreateInvite} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {inviteType === "teacher"
                ? "Nombre del Profesor"
                : inviteType === "family_apoderado"
                ? "Nombre del Apoderado / Familia"
                : "Nombre del Alumno Adulto"}
            </label>
            <input
              type="text"
              placeholder={inviteType === "teacher" ? "Ej. Prof. Juan Pérez" : "Ej. Sra. Carmen Rivas"}
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Si es Profesor, seleccionar la Habilidad Musical / Instrumento */}
          {inviteType === "teacher" && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Especialidad / Habilidad Musical
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              >
                {musicalInstruments.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={inviteType === "teacher" ? "sm:col-span-2" : ""}>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Correo Electrónico (Para envío de Clave Maestra)
            </label>
            <input
              type="email"
              placeholder="destinatario@ejemplo.com"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" /> Generar Clave Maestra y Link de WhatsApp
            </button>
          </div>
        </form>
      </div>

      {/* Modal Mensaje Creado */}
      {createdModalData && (
        <div className="rounded-2xl border border-success/40 bg-success/5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-success flex items-center gap-2">
              <Check className="h-5 w-5" /> Invitación generada exitosamente
            </p>
            <Button size="sm" variant="ghost" onClick={() => setCreatedModalData(null)}>
              Cerrar
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Contraseña Maestra asignada:{" "}
            <strong className="font-mono text-foreground font-bold">{createdModalData.masterPassword}</strong>
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              size="sm"
              className="gap-2 bg-success hover:bg-success/90 text-success-foreground font-bold"
              onClick={() => handleCopyWhatsApp(createdModalData.whatsappMessage, "new-modal")}
            >
              {copiedId === "new-modal" ? (
                <>
                  <Check className="h-4 w-4" /> ¡Copiado al Portapapeles!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> 1. Copiar Mensaje (Ctrl+C)
                </>
              )}
            </Button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(createdModalData.whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              🚀 2. Abrir WhatsApp Web / App →
            </a>
          </div>
        </div>
      )}

      {/* Historial de Invitaciones */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-primary" /> Historial de Invitaciones
        </h2>

        {loading ? (
          <p className="text-xs text-muted-foreground py-4">Cargando invitaciones...</p>
        ) : invitations.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4">No se han generado invitaciones aún.</p>
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    {inv.target_name}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-bold">
                      {inv.target_role === "teacher" ? "Profesor" : inv.target_role === "staff" ? "Secretaría" : "Familia"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{inv.target_email}</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span
                    className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                      inv.status === "aceptado"
                        ? "bg-success/15 text-success"
                        : inv.status === "pendiente"
                        ? "bg-warning/15 text-warning"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {inv.status}
                  </span>

                  {/* Botón de Ojo: Ver Enlace Generado y Contraseña (Todos excepto la Dueña) */}
                  {!inv.target_name.toLowerCase().includes("dueña") && inv.target_role !== ("super_admin" as unknown as InviteTargetRole) && (
                    <Button
                      size="sm"
                      variant="outline"
                      title="Ver enlace de acceso y contraseña generada"
                      onClick={() => setViewModalInvite(inv)}
                      className="gap-1 px-2.5 font-semibold text-foreground hover:text-primary hover:border-primary"
                    >
                      <Eye className="h-3.5 w-3.5" /> Ver Acceso
                    </Button>
                  )}

                  {/* Reset de Contraseña Maestra (Para Profesores y Familias) */}
                  <Button
                    size="sm"
                    variant="outline"
                    title="Restablecer a Clave Maestra original si el usuario la olvidó"
                    onClick={() => handleResetPassword(inv)}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
                  </Button>

                  {/* Eliminación / Revocación para Secretaría (Nayeli) y Dirección */}
                  {!inv.target_name.toLowerCase().includes("dueña") && inv.target_role !== ("super_admin" as unknown as InviteTargetRole) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      title="Eliminar acceso / Revocar invitación"
                      onClick={() => handleRevokeInvite(inv)}
                    >
                      <Ban className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para Visualizar Enlace y Contraseña con el Icono de Ojo */}
      <Dialog open={!!viewModalInvite} onOpenChange={(o) => !o && setViewModalInvite(null)}>
        <DialogContent className="max-w-[92vw] sm:max-w-md w-full rounded-2xl p-6 bg-card border border-border shadow-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" /> Credenciales y Enlace de Acceso
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Consulta el enlace generado y la clave de acceso de este perfil para soporte o reenvío.
            </DialogDescription>
          </DialogHeader>

          {viewModalInvite && (
            <div className="space-y-4 pt-2 w-full overflow-hidden">
              <div className="rounded-xl border border-border bg-muted/50 p-3 space-y-1.5 w-full">
                <p className="text-xs font-semibold text-muted-foreground">Destinatario:</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-foreground truncate">{viewModalInvite.target_name}</p>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold shrink-0">
                    {viewModalInvite.target_role === "teacher" ? "Profesor" : viewModalInvite.target_role === "staff" ? "Secretaría" : "Familia"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono truncate">{viewModalInvite.target_email}</p>
              </div>

              {/* Contraseña Maestra */}
              <div className="rounded-xl border border-border bg-background p-3 space-y-1 w-full">
                <p className="text-xs font-semibold text-muted-foreground">Contraseña de Ingreso:</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-black text-foreground truncate">
                    {viewModalInvite.master_password || `${viewModalInvite.master_password_hint || 'Vibra'} (Clave Maestra)`}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs shrink-0"
                    onClick={() =>
                      handleCopyWhatsApp(
                        viewModalInvite.master_password || "Vibra-JEWN-CUUP",
                        `pw-${viewModalInvite.id}`
                      )
                    }
                  >
                    {copiedId === `pw-${viewModalInvite.id}` ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>

              {/* Enlace Directo de Acceso Seguro */}
              <div className="rounded-xl border border-border bg-background p-3 space-y-1 w-full">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">Enlace Directo de Acceso (Para cualquier PC/Móvil):</p>
                  <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded">Enlace Seguro Web / Móvil</span>
                </div>
                {(() => {
                  const currentOrigin =
                    typeof window !== "undefined" && window.location.origin
                      ? window.location.origin
                      : import.meta.env.VITE_APP_URL || "https://musicstaff-vm.pages.dev";
                  const directUrl = `${currentOrigin}/invite/${viewModalInvite.token}`;

                  return (
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-primary truncate font-bold select-all">
                        {directUrl}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs shrink-0"
                        onClick={() => handleCopyWhatsApp(directUrl, `url-${viewModalInvite.id}`)}
                      >
                        {copiedId === `url-${viewModalInvite.id}` ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  );
                })()}
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewModalInvite(null)}
                >
                  Cerrar
                </Button>
                <a
                  href={`/invite/${viewModalInvite.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Abrir Portal de Acceso →
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
