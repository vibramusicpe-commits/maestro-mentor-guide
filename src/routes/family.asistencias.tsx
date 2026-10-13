import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { StudentAttendanceKardex } from "@/components/admin/student-attendance-kardex";
import { resolveFamilyScope } from "@/lib/laya/laya-family-scope";

export const Route = createFileRoute("/family/asistencias")({
  head: () => ({
    meta: [
      { title: "Asistencias — Portal de Familia" },
      {
        name: "description",
        content: "Kardex de asistencias de tus hijos en solo lectura.",
      },
    ],
  }),
  component: FamilyAsistenciasPage,
});

function FamilyAsistenciasPage() {
  const adminStudents = useAppStore((s) => s.adminStudents);
  const currentUser = useAppStore((s) => s.currentUser);

  // Alcance desde la sesión (invitación aceptada, ADR-0172)
  const scope = useMemo(
    () =>
      resolveFamilyScope({
        inviteFamilyId: currentUser?.familyId ?? null,
        userEmail: currentUser?.email ?? null,
        adminStudents,
      }),
    [currentUser?.familyId, currentUser?.email, adminStudents]
  );

  const [kidId, setKidId] = useState<string | null>(null);
  const selected = scope.students.find((k) => k.id === kidId) ?? scope.students[0];

  if (!scope.resolved || !selected) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-2">
        <p className="text-sm font-bold text-foreground">Sin alumnos vinculados</p>
        <p className="text-xs text-muted-foreground">
          Secretaría te asignará en breve la ficha de tu hijo/a. Si ya tienes tu enlace de
          invitación, vuelve a ingresar con él.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scope.students.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {scope.students.map((k) => (
            <button
              key={k.id}
              onClick={() => setKidId(k.id)}
              className={`min-h-[44px] px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                (kidId ?? selected.id) === k.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-muted-foreground"
              }`}
            >
              {k.name.split(" ")[0]}
            </button>
          ))}
        </div>
      )}
      {/* 🔒 Solo lectura: candado de edición activo (ADR-0172) */}
      <StudentAttendanceKardex
        key={selected.id}
        student={selected}
        isDialog={false}
        isEditable={false}
        lockEditing
      />
    </div>
  );
}
