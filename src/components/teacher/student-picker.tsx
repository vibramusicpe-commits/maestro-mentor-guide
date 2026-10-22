import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { AdminStudent } from "@/store/app-store";

/**
 * Selector de alumno optimizado para celular (ADR-0176).
 *
 * Reemplaza los `<select>` con decenas de opciones: el docente escribe 2-3
 * letras y elige en una lista de filas tÃ¡ctiles (44 px). Con un alumno ya
 * elegido, el selector se colapsa a una sola fila con botÃ³n "Cambiar",
 * evitando scroll innecesario en el kiosco.
 */

export interface StudentPickerProps {
  id?: string;
  students: AdminStudent[];
  value: string;
  onChange: (studentId: string) => void;
  placeholder?: string;
  /** Permite dejar el campo vacÃ­o (p. ej. nota general sin alumno). */
  allowEmpty?: boolean;
  /** Etiqueta del botÃ³n para limpiar la selecciÃ³n. */
  emptyLabel?: string;
  /** Texto de ayuda bajo el buscador (opcional). */
  hint?: string;
}

function normalize(value: string): string {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function StudentPicker({
  id,
  students,
  value,
  onChange,
  placeholder = "Buscar alumno por nombre o instrumentoâ€¦",
  allowEmpty = false,
  emptyLabel = "Sin alumno",
  hint,
}: StudentPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  const selected = useMemo(
    () => students.find((student) => student.id === value) || null,
    [students, value],
  );

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return students;
    return students.filter((student) => {
      const haystack = normalize(
        `${student.name} ${student.instrument || ""} ${student.teacher || ""} ${student.ageCategory || ""}`,
      );
      return q.split(" ").every((token) => haystack.includes(token));
    });
  }, [students, query]);

  const openPicker = () => {
    setOpen(true);
    if (typeof window !== "undefined") {
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  };

  const selectStudent = (studentId: string) => {
    onChange(studentId);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      {selected && !open ? (
        <button
          type="button"
          id={id}
          onClick={openPicker}
          className="flex w-full items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-left transition-colors hover:border-primary/50"
        >
          <User className="h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-black text-foreground">
              {selected.name}
            </span>
            <span className="block truncate text-[10px] font-semibold text-muted-foreground">
              {selected.instrument || "Instrumento no registrado"}
              {selected.ageCategory ? ` Â· ${selected.ageCategory}` : ""}
            </span>
          </span>
          <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-black text-primary">
            Cambiar
          </span>
        </button>
      ) : (
        <>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={id}
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
              if (event.key === "Enter" && filtered.length === 1) {
                event.preventDefault();
                selectStudent(filtered[0].id);
              }
            }}
            placeholder={placeholder}
            className="h-11 rounded-xl pl-9 pr-9 text-sm"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="search"
            type="search"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Limpiar bÃºsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </>
      )}

      {hint && !open && (
        <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>
      )}

      {open && (
        <div className="absolute left-0 right-0 z-40 mt-1 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/40 px-3 py-1.5">
            <span className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
              {filtered.length} alumno{filtered.length === 1 ? "" : "s"}
            </span>
            <div className="flex items-center gap-2">
              {allowEmpty && (
                <button
                  type="button"
                  onClick={() => selectStudent("")}
                  className="text-[10px] font-bold text-muted-foreground hover:text-primary"
                >
                  {emptyLabel}
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[10px] font-bold text-muted-foreground hover:text-foreground"
              >
                Cerrar
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-[11px] font-semibold text-muted-foreground">
                Sin resultados para â€œ{query}â€. Prueba con el apellido o el
                instrumento.
              </p>
            ) : (
              filtered.map((student) => {
                const isSelected = student.id === value;
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => selectStudent(student.id)}
                    className={`flex min-h-[44px] w-full items-center gap-2 border-b border-border/40 px-3 py-2 text-left transition-colors last:border-b-0 ${
                      isSelected ? "bg-primary/10" : "hover:bg-muted/60"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-foreground">
                        {student.name}
                      </span>
                      <span className="block truncate text-[10px] font-semibold text-muted-foreground">
                        {student.instrument || "Instrumento no registrado"}
                        {student.ageCategory ? ` Â· ${student.ageCategory}` : ""}
                        {student.teacher ? ` Â· Prof. ${student.teacher}` : ""}
                      </span>
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

