/**
 * ================================================================
 * link-person-dialog.tsx — Vincular / desvincular alumnos con varios
 * instrumentos (ADR-0186, Fase 5)
 * ================================================================
 *
 * Permite declarar explícitamente que dos registros son la misma persona
 * con instrumentos distintos (ej. `JAN` Piano + `JAM` Canto).
 *
 * Reglas innegociables:
 *   - VINCULA, nunca fusiona: cada matrícula conserva docente, sala,
 *     horario, plan y asistencias.
 *   - Suggere candidatos por `detectSamePersonCandidates` (nacimiento +
 *     apoderado) pero **permite elegir manualmente**: los alias de un
 *     adulto solo los conoce Dirección.
 *   - Desvincular solo borra `personGroupId`; NO toca ningún otro dato.
 *   - Al vincular se alinea `familyId` para que el apoderado vea una sola
 *     cuenta (ADR-0186 Fase 4), conservando los UUID.
 */

import { useMemo, useState } from "react";
import { AlertTriangle, Link2, Search, Unlink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore, type AdminStudent } from "@/store/app-store";
import {
  detectSamePersonCandidates,
  describeInstrumentBundle,
  findLinkedSiblingsAtRisk,
  resolvePersonSiblings,
} from "@/lib/student-person-group";
import { toast } from "sonner";

interface LinkPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: AdminStudent | null;
}

export function LinkPersonDialog({ open, onOpenChange, student }: LinkPersonDialogProps) {
  const adminStudents = useAppStore((s) => s.adminStudents);
  const updateStudentDetails = useAppStore((s) => s.updateStudentDetails);
  const [query, setQuery] = useState("");

  const siblings = useMemo(
    () => (student ? resolvePersonSiblings(student, adminStudents) : []),
    [student, adminStudents],
  );

  const atRisk = useMemo(
    () => (student ? findLinkedSiblingsAtRisk([student.id], adminStudents) : []),
    [student, adminStudents],
  );

  // Candidatos sugeridos por señales duras (nacimiento + apoderado).
  const suggested = useMemo(() => {
    if (!student) return [] as AdminStudent[];
    const { activos, historicos } = detectSamePersonCandidates(student, adminStudents);
    return [...activos, ...historicos].filter(
      (candidate) => !siblings.some((sibling) => sibling.id === candidate.id),
    );
  }, [student, adminStudents, siblings]);

  // Búsqueda manual: aquí SÍ se permite elegir a cualquiera (alias de adultos).
  const manualMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !student) return [] as AdminStudent[];
    return adminStudents
      .filter((candidate) => candidate.id !== student.id)
      .filter((candidate) => candidate.status === "activo")
      .filter((candidate) => !siblings.some((sibling) => sibling.id === candidate.id))
      .filter((candidate) =>
        `${candidate.name} ${candidate.instrument} ${candidate.family}`
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 8);
  }, [query, adminStudents, student, siblings]);

  if (!student) return null;

  const handleLink = (target: AdminStudent) => {
    // El grupo toma el UUID del registro más antiguo como ancla estable.
    const groupId = student.personGroupId || student.id;
    const label = describeInstrumentBundle([student, target]);

    updateStudentDetails(student.id, {
      personGroupId: groupId,
      personGroupLabel: label,
      // Una sola cuenta para el apoderado (no mueve UUID ni montos).
      familyId: student.familyId || target.familyId || undefined,
    });
    updateStudentDetails(target.id, {
      personGroupId: groupId,
      personGroupLabel: label,
      familyId: student.familyId || target.familyId || undefined,
    });

    toast.success(`🔗 Vinculado: ${student.name} + ${target.name}`, {
      description: `${label}. Cada instrumento conserva su horario y asistencias.`,
    });
    setQuery("");
  };

  const handleUnlink = (target: AdminStudent) => {
    updateStudentDetails(student.id, { personGroupId: undefined, personGroupLabel: undefined });
    updateStudentDetails(target.id, { personGroupId: undefined, personGroupLabel: undefined });
    toast.success(`Desvinculado ${student.name} y ${target.name}`, {
      description: "No se modificó ningún horario, asistencia ni monto.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-black">
            <Link2 className="h-4 w-4 text-primary" />
            Vincular con otro instrumento
          </DialogTitle>
          <DialogDescription className="text-xs">
            Declara que dos registros son la <strong>misma persona</strong> con instrumentos
            distintos. Cada matrícula conserva su docente, sala, horario y asistencias.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Alumno actual */}
          <div className="rounded-xl border border-border bg-muted/40 px-3 py-2">
            <p className="text-sm font-black text-foreground">{student.name}</p>
            <p className="text-xs text-muted-foreground">
              {student.instrument || "Sin instrumento"} · {student.teacher || "Sin docente"}
            </p>
          </div>

          {/* Vinculados actuales */}
          {siblings.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">
                Vinculado con
              </p>
              {siblings.map((sibling) => (
                <div
                  key={sibling.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">
                      {sibling.name.trim()}
                    </p>
                    <p className="text-xs text-muted-foreground">{sibling.instrument}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnlink(sibling)}
                    className="h-8 shrink-0 gap-1 text-xs"
                  >
                    <Unlink className="h-3 w-3" />
                    Desvincular
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Sugerencias automáticas */}
          {suggested.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">
                Coincidencias detectadas
              </p>
              {suggested.map((candidate) => (
                <CandidateRow
                  key={candidate.id}
                  candidate={candidate}
                  badge="Misma fecha y apoderado"
                  onLink={() => handleLink(candidate)}
                />
              ))}
            </div>
          )}

          {/* Búsqueda manual */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">
              Buscar otro registro
            </p>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nombre, instrumento o familia…"
                className="pl-8 text-xs"
                autoComplete="off"
              />
            </div>
            {query.trim() !== "" && manualMatches.length === 0 && (
              <p className="text-xs text-muted-foreground">Sin coincidencias.</p>
            )}
            {manualMatches.map((candidate) => (
              <CandidateRow
                key={candidate.id}
                candidate={candidate}
                badge="Selección manual"
                onLink={() => handleLink(candidate)}
              />
            ))}
          </div>

          {/* Aviso de borrado relacionado */}
          {atRisk.length > 0 && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Al eliminar este alumno, <strong>{describeInstrumentBundle(atRisk)}</strong> se
                conserva. El borrado ya protege los registros vinculados.
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CandidateRow({
  candidate,
  badge,
  onLink,
}: {
  candidate: AdminStudent;
  badge: string;
  onLink: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-foreground">{candidate.name.trim()}</p>
        <p className="truncate text-xs text-muted-foreground">
          {candidate.instrument || "Sin instrumento"} · {candidate.teacher || "Sin docente"}
        </p>
        <Badge variant="outline" className="mt-1 text-[10px] font-bold">
          {badge}
        </Badge>
      </div>
      <Button
        type="button"
        size="sm"
        onClick={onLink}
        className="h-8 shrink-0 gap-1 text-xs font-bold"
      >
        <Link2 className="h-3 w-3" />
        Vincular
      </Button>
    </div>
  );
}
