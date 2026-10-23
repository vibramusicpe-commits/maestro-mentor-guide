import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Circle, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDraftCriteriaFields } from "@/lib/services/evaluations.service";
import {
  getOrgSetting,
  getProgressReportsAccess,
  type ProgressReportsAccess,
} from "@/lib/services/feature-flags.service";
import { listProgressReports } from "@/lib/services/progress-reports.service";
import { TEACHER_IDS } from "@/lib/services/teacher-resolver";
import type { EvaluationFieldRow } from "@/lib/informes/types";

const TEACHER_LABELS: Record<string, string> = {
  [TEACHER_IDS.JEREMY]: "Jeremy",
  [TEACHER_IDS.FERNANDO]: "Fernando",
  [TEACHER_IDS.NATHALY]: "Nathaly",
  [TEACHER_IDS.DEMO]: "Demo",
};

interface RolloutState {
  loading: boolean;
  access: ProgressReportsAccess;
  pilots: string[];
  drafts: EvaluationFieldRow[];
  hasPublished: boolean;
}

const INITIAL: RolloutState = {
  loading: true,
  access: { panel: false, family: false, source: "none" },
  pilots: [],
  drafts: [],
  hasPublished: false,
};

function groupDraftsByInstrument(drafts: EvaluationFieldRow[]) {
  const map = new Map<string, number>();
  for (const field of drafts) {
    const key = field.instrument || "General";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

/**
 * Tablero de despliegue del módulo de Informes (Fase 7, ADR-0178).
 *
 * Solo lectura. No escribe flags ni publica nada: muestra el estado real de
 * `org_settings` y de los criterios para que Dirección decida cuándo abrir
 * el portal familia. Cero datos financieros.
 */
export function InformesRolloutCard() {
  const [state, setState] = useState<RolloutState>(INITIAL);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getProgressReportsAccess(),
      getOrgSetting<string[]>("pilot_teacher_ids", []),
      getDraftCriteriaFields(),
      listProgressReports({ status: "published", limit: 1 }),
    ])
      .then(([access, pilots, drafts, published]) => {
        if (cancelled) return;
        setState({
          loading: false,
          access,
          pilots: Array.isArray(pilots) ? pilots.map(String) : [],
          drafts,
          hasPublished: published.length > 0,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ ...INITIAL, loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const pilotNames = state.pilots.map(
    (id) => TEACHER_LABELS[id] || id.slice(-4),
  );
  const draftGroups = groupDraftsByInstrument(state.drafts);
  const draftsTotal = state.drafts.length;

  const checklist = [
    {
      done: !draftGroups.some(([instrument]) =>
        ["canto", "piano", "piano infantil", "violín", "violin"].includes(
          instrument.toLowerCase(),
        ),
      ),
      label: "Criterios de Nathaly (Canto / Piano Infantil) y Fernando (Piano / Violín) validados",
    },
    {
      done: draftsTotal === 0,
      label: "Criterios de Jeremy (Guitarra / Batería) validados",
    },
    {
      done: state.hasPublished,
      label: "Primer informe publicado y verificado en PDF A4 (2 páginas)",
    },
    {
      done: state.access.family,
      label: "Portal familia habilitado (`parentReports = true`)",
    },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Rocket className="h-4 w-4 text-primary" />
            Despliegue del módulo
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 text-xs font-black text-primary"
            >
              FASE 7
            </Badge>
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Estado real de PostgreSQL. Abrir o cerrar no requiere desplegar.
          </p>
        </div>
        {state.loading && (
          <span className="text-xs font-semibold text-muted-foreground">
            Leyendo estado…
          </span>
        )}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-2.5">
          <p className="text-xs font-semibold text-muted-foreground">
            Bandeja Dirección
          </p>
          <p className="mt-0.5 text-sm font-black text-foreground">
            {state.access.panel
              ? state.access.source === "flag"
                ? "Activa (flag)"
                : "Activa (piloto)"
              : "Apagada"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background p-2.5">
          <p className="text-xs font-semibold text-muted-foreground">
            Portal familia
          </p>
          <p
            className={`mt-0.5 text-sm font-black ${
              state.access.family ? "text-emerald-600" : "text-muted-foreground"
            }`}
          >
            {state.access.family ? "Habilitado" : "Apagado"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background p-2.5">
          <p className="text-xs font-semibold text-muted-foreground">
            Docentes en piloto
          </p>
          <p className="mt-0.5 text-sm font-black text-foreground">
            {state.pilots.length}
            <span className="ml-1 text-xs font-semibold text-muted-foreground">
              {pilotNames.length ? `· ${pilotNames.join(", ")}` : ""}
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background p-2.5">
          <p className="text-xs font-semibold text-muted-foreground">
            Criterios en borrador
          </p>
          <p
            className={`mt-0.5 text-sm font-black ${
              draftsTotal > 0 ? "text-amber-600" : "text-emerald-600"
            }`}
          >
            {draftsTotal}
          </p>
        </div>
      </div>

      {draftsTotal > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs font-semibold text-amber-700">
            {draftGroups
              .map(([instrument, count]) => `${instrument}: ${count}`)
              .join(" · ")}
            . Un criterio en borrador bloquea publicar cualquier informe que lo
            incluya.
          </p>
        </div>
      )}

      <ul className="mt-3 space-y-1.5">
        {checklist.map((item) => (
          <li key={item.label} className="flex items-start gap-2 text-xs">
            {item.done ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span
              className={
                item.done
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              }
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
