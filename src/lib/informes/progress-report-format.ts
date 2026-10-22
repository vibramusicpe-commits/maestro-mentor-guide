/**
 * ================================================================
 * progress-report-format.ts — Vista, Markdown y WhatsApp (Fase 5)
 * ================================================================
 *
 * Funciones puras para convertir una fila de `progress_reports` en:
 *   - un modelo de vista listo para la UI / impresión A4,
 *   - un documento Markdown (auditoría / LLM / archivo),
 *   - un mensaje breve para WhatsApp.
 *
 * Reglas:
 *   - Cero datos financieros (ni montos, ni saldos, ni facturas).
 *   - El contenido publicado manda: si existe `published_snapshot`, el
 *     servicio ya lo fusionó en la fila; aquí solo se lee `content`.
 *   - Criterios en borrador (`ui_config.draft = true`) se filtran en el
 *     servicio antes de publicar; este módulo solo da formato.
 */

import type {
  AttendanceCycleSummary,
  AttendancePeriodSummary,
  ProgressReportRow,
  RepertoireItem,
} from "./types";

const TRAFFIC_LABELS: Record<string, string> = {
  inicia: "Inicia",
  iniciando: "Inicia",
  en_proceso: "En proceso",
  proceso: "En proceso",
  logrado: "Logrado",
  destacado: "Destacado",
  pendiente: "No logrado",
  no_logrado: "No logrado",
  no_logrado_aun: "No logrado aún",
  // ADR-0176: "no_corresponde" se muestra al docente y a la familia como
  // "No aplicó" (el aspecto no se trabajó esa clase). El valor en la base de
  // datos no cambia.
  no_corresponde: "No aplicó",
  no_aplica: "No aplicó",
};

export interface ProgressReportCriterion {
  label: string;
  value: string;
  band: string | null;
  fieldType: string;
}

export interface ProgressReportView {
  reportId: string;
  studentName: string;
  studentId: string | null;
  instrument: string;
  levelStart: string | null;
  levelEnd: string | null;
  teacherName: string;
  modality: string;
  ageCategory: string | null;
  periodType: string;
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  attendance: AttendancePeriodSummary | null;
  cycle: AttendanceCycleSummary | null;
  criteria: ProgressReportCriterion[];
  repertoire: RepertoireItem[];
  strengths: string;
  goals: string;
  recommendations: string;
  familyMessage: string;
  teacherComment: string;
  status: string;
  publishedAt: string | null;
  publishedByName: string | null;
  generatedAt: string | null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function formatValue(raw: unknown): string {
  if (raw === null || raw === undefined) return "—";
  if (typeof raw === "string") return raw.trim() || "—";
  if (typeof raw === "number") return Number.isFinite(raw) ? String(raw) : "—";
  if (typeof raw === "boolean") return raw ? "Sí" : "No";
  if (Array.isArray(raw)) {
    const parts = raw.map((item) => formatValue(item)).filter((item) => item !== "—");
    return parts.length > 0 ? parts.join(", ") : "—";
  }
  if (typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    const label = asString(record.label) || asString(record.name) || asString(record.value);
    return label || "—";
  }
  return "—";
}

/** Etiqueta legible de una banda de semáforo o rúbrica. */
export function formatBand(band?: string | null): string {
  const clean = (band || "").trim();
  if (!clean) return "";
  const key = clean.toLowerCase().replace(/\s+/g, "_");
  return TRAFFIC_LABELS[key] || clean;
}

/** Valor legible de un criterio (banda primero, luego el valor crudo). */
export function formatCriterionValue(raw: unknown, band?: string | null): string {
  const bandLabel = formatBand(band);
  if (bandLabel) return bandLabel;
  return formatValue(raw);
}

const MONTHS_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Oct",
  "Nov",
  "Dic",
];

/** `2026-09-01` -> `01 Set 2026`. No usa zonas horarias. */
export function formatIsoDateShort(value?: string | null): string {
  const clean = (value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean || "—";
  const [year, month, day] = clean.split("-");
  const monthIndex = Number(month) - 1;
  return `${day} ${MONTHS_ES[monthIndex] || month} ${year}`;
}

export function formatProgressPeriod(view: {
  periodStart: string;
  periodEnd: string;
  periodLabel?: string;
  periodType?: string;
}): string {
  if (view.periodLabel) return view.periodLabel;
  const start = formatIsoDateShort(view.periodStart);
  const end = formatIsoDateShort(view.periodEnd);
  const type = view.periodType === "trimestral" ? "Trimestre" : "Mes";
  return `${type} · ${start} – ${end}`;
}

export function formatAttendanceRate(period?: AttendancePeriodSummary | null): string {
  if (!period || period.attendanceRate === null || period.attendanceRate === undefined) {
    return "—";
  }
  return `${Math.round(period.attendanceRate)}%`;
}

/** Construye el modelo de vista a partir de la fila de PostgreSQL. */
export function buildProgressReportView(report: ProgressReportRow): ProgressReportView {
  const content = asRecord(report.content);
  const student = asRecord(content.student);
  const period = asRecord(content.period);
  const attendanceSnapshot = asRecord(content.attendance);

  const attendance =
    (attendanceSnapshot.period as AttendancePeriodSummary | undefined) ||
    (report.attendance_summary as unknown as AttendancePeriodSummary | undefined) ||
    null;

  const cycle =
    (attendanceSnapshot.cycle as AttendanceCycleSummary | undefined) || null;

  const criteriaRaw = asArray<Record<string, unknown>>(
    content.criteria ?? attendanceSnapshot.extraScores,
  );

  const criteria: ProgressReportCriterion[] = criteriaRaw
    .map((item) => {
      const label = asString(item.label);
      const band = asString(item.band) || null;
      return {
        label,
        value: formatCriterionValue(item.raw_value, band),
        band,
        fieldType: asString(item.type) || "text",
      };
    })
    .filter((item) => Boolean(item.label));

  const repertoire = Array.isArray(report.repertoire_summary)
    ? report.repertoire_summary
    : asArray<RepertoireItem>(attendanceSnapshot.repertoire);

  return {
    reportId: report.id,
    studentName:
      asString(report.student_name_snapshot) ||
      asString(student.name) ||
      "Alumno",
    studentId: report.student_id || (asString(student.id) || null),
    instrument: asString(student.instrument) || "Música",
    levelStart: report.level_start || asString(student.level) || null,
    levelEnd: report.level_end || null,
    teacherName: asString(report.teacher_name) || asString(student.teacher) || "Docente",
    modality: asString(student.modality) || "",
    ageCategory: asString(student.ageCategory) || null,
    periodType: report.period_type || asString(period.type) || "mensual",
    periodStart: report.period_start || asString(period.start),
    periodEnd: report.period_end || asString(period.end),
    periodLabel: asString(period.label),
    attendance,
    cycle,
    criteria,
    repertoire,
    strengths: report.strengths || "",
    goals: report.goals || "",
    recommendations: report.recommendations || "",
    familyMessage: report.family_message || "",
    teacherComment: report.teacher_comment || "",
    status: report.status,
    publishedAt: report.published_at,
    publishedByName: report.published_by_name,
    generatedAt: asString(content.generatedAt) || report.created_at || null,
  };
}

/** Encabezado estándar reutilizado por Markdown y WhatsApp. */
export function progressReportTitle(view: ProgressReportView): string {
  return `Informe de Progreso — ${view.studentName}`;
}

/**
 * Documento Markdown estructurado (clave-valor + tablas) para archivo,
 * auditoría humana o ingestión por un LLM.
 */
export function generateProgressReportMarkdown(report: ProgressReportRow): string {
  const view = buildProgressReportView(report);
  const periodText = formatProgressPeriod(view);
  const lines: string[] = [];

  lines.push(`# ${progressReportTitle(view)}`);
  lines.push("");
  lines.push(`- **Informe ID:** \`${view.reportId}\``);
  lines.push(`- **Estado:** ${view.status}`);
  lines.push(`- **Periodo (${view.periodType}):** ${view.periodStart} → ${view.periodEnd} (${periodText})`);
  lines.push(`- **Alumno:** ${view.studentName}`);
  lines.push(`- **Instrumento:** ${view.instrument}`);
  lines.push(`- **Nivel:** ${view.levelStart || "—"}${view.levelEnd ? ` → ${view.levelEnd}` : ""}`);
  lines.push(`- **Docente:** ${view.teacherName}`);
  if (view.modality) lines.push(`- **Modalidad:** ${view.modality}`);
  if (view.ageCategory) lines.push(`- **Categoría de edad:** ${view.ageCategory}`);
  if (view.publishedAt) {
    lines.push(
      `- **Publicado:** ${view.publishedAt}${view.publishedByName ? ` por ${view.publishedByName}` : ""}`,
    );
  }
  lines.push("");

  lines.push("## Asistencia del periodo");
  lines.push("");
  if (view.attendance) {
    const a = view.attendance;
    lines.push("| Métrica | Valor |");
    lines.push("|---|---|");
    lines.push(`| Asistidas | ${a.present} |`);
    lines.push(`| Tardanzas | ${a.late} |`);
    lines.push(`| Faltas | ${a.absent} |`);
    lines.push(`| Justificadas | ${a.justified} |`);
    lines.push(`| Pendientes | ${a.pending} |`);
    lines.push(`| Sesiones del periodo | ${a.total} |`);
    lines.push(`| Sesiones evaluadas | ${a.evaluated} |`);
    lines.push(`| Tasa de asistencia | ${formatAttendanceRate(a)} |`);
  } else {
    lines.push("_Sin resumen de asistencia registrado para el periodo._");
  }
  lines.push("");

  if (view.cycle) {
    const c = view.cycle;
    lines.push("## Ciclo contractual");
    lines.push("");
    lines.push("| Métrica | Valor |");
    lines.push("|---|---|");
    lines.push(`| Clases contratadas | ${c.targetQuota} |`);
    lines.push(`| Asistidas | ${c.attended} |`);
    lines.push(`| Faltas | ${c.missed} |`);
    lines.push(`| Justificadas | ${c.justified} |`);
    lines.push(`| Tardanzas | ${c.tardy} |`);
    lines.push(`| Pendientes | ${c.pending} |`);
    lines.push(`| Recuperaciones agendadas | ${c.makeups} |`);
    lines.push(`| Créditos disponibles | ${c.makeupCreditsAvailable} |`);
    lines.push(`| Avance del ciclo | ${c.completionPercentage}% |`);
    lines.push("");
  }

  lines.push("## Criterios evaluados");
  lines.push("");
  if (view.criteria.length > 0) {
    lines.push("| Criterio | Resultado |");
    lines.push("|---|---|");
    for (const criterion of view.criteria) {
      lines.push(`| ${criterion.label} | ${criterion.value} |`);
    }
  } else {
    lines.push("_Sin criterios registrados en el periodo._");
  }
  lines.push("");

  if (view.repertoire.length > 0) {
    lines.push("## Repertorio trabajado");
    lines.push("");
    lines.push("| Obra | Estado |");
    lines.push("|---|---|");
    for (const item of view.repertoire) {
      const status =
        item.status === "consolidada"
          ? "Consolidada"
          : item.status === "en_proceso"
            ? "En proceso"
            : "Iniciada";
      lines.push(`| ${item.title}${item.last_seen_date ? ` (${item.last_seen_date})` : ""} | ${status} |`);
    }
    lines.push("");
  }

  const narratives: Array<[string, string]> = [
    ["Fortalezas observadas", view.strengths],
    ["Próxima meta", view.goals],
    ["Recomendaciones", view.recommendations],
    ["Mensaje a la familia", view.familyMessage],
    ["Comentario del docente", view.teacherComment],
  ];

  for (const [title, body] of narratives) {
    if (!body) continue;
    lines.push(`## ${title}`);
    lines.push("");
    lines.push(body);
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "Documento emitido por Vibra Music Staff. Contiene información pedagógica y de asistencia; no incluye datos financieros.",
  );
  lines.push("");

  return lines.join("\n");
}

/**
 * Mensaje corto y cordial para WhatsApp. No incluye montos ni enlaces
 * internos: solo el periodo, el logro general y la invitación a leerlo.
 */export function generateProgressReportWhatsApp(report: ProgressReportRow): string {
  const view = buildProgressReportView(report);
  const periodText = formatProgressPeriod(view);
  const rate = formatAttendanceRate(view.attendance);

  const achievements = view.criteria.filter(
    (criterion) =>
      criterion.value === "Logrado" ||
      criterion.value === "Destacado" ||
      criterion.band === "logrado" ||
      criterion.band === "destacado",
  );

  const lines: string[] = [];
  lines.push(`🎵 *Vibra Music · Informe de Progreso*`);
  lines.push("");
  lines.push(`Familia de *${view.studentName}*:`);
  lines.push("");
  lines.push(
    `Ya está disponible el informe de progreso de *${view.instrument}* correspondiente a *${periodText}*.`,
  );
  if (view.attendance) {
    lines.push(
      `Asistencia del periodo: *${rate}* (${view.attendance.present} clases asistidas).`,
    );
  }
  if (achievements.length > 0) {
    lines.push("");
    lines.push(
      `Destacamos: ${achievements
        .slice(0, 4)
        .map((criterion) => criterion.label)
        .join(", ")}.`,
    );
  }
  if (view.goals) {
    lines.push("");
    lines.push(`Próxima meta: ${view.goals}`);
  }
  if (view.familyMessage) {
    lines.push("");
    lines.push(view.familyMessage);
  }
  lines.push("");
  lines.push(
    `Puede ver el informe completo en el Portal de Familia, pestaña *Progreso*, y descargarlo en PDF.`,
  );
  lines.push("");
  lines.push(`_Dirección · Vibra Music_`);

  return lines.join("\n");
}

/**
 * CSS de impresión A4 compartido por el diálogo de administración y el
 * portal familia (ADR-0136 / ADR-0137). Una sola fuente para no repetir
 * reglas de paginación en dos componentes.
 */
export const PROGRESS_REPORT_PRINT_CSS = `
@media print {
  @page { size: A4 portrait; margin: 7mm 8mm 7mm 8mm; }

  *, *::before, *::after {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    box-sizing: border-box !important;
  }

  html, body {
    background: #ffffff !important;
    color: #000000 !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: 100% !important;
    overflow: visible !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  body > *:not([data-radix-portal]) { display: none !important; }

  [data-radix-portal] > div[data-state]:not([role="dialog"]),
  [data-radix-portal] > div[class*="bg-black"],
  .fixed.inset-0 { display: none !important; }

  [data-radix-portal], [data-radix-portal] * {
    --tw-translate-x: 0px !important;
    --tw-translate-y: 0px !important;
    --tw-scale-x: 1 !important;
    --tw-scale-y: 1 !important;
    --tw-transform: none !important;
  }

  [data-radix-portal] {
    position: static !important;
    display: block !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
  }

  [data-radix-portal] > div {
    position: static !important;
    display: block !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
  }

  div[role="dialog"], [role="dialog"] {
    position: static !important;
    display: block !important;
    transform: none !important;
    -webkit-transform: none !important;
    top: 0 !important; left: 0 !important; right: 0 !important; bottom: auto !important;
    margin: 0 !important; padding: 0 !important;
    width: 100% !important; max-width: 100% !important; min-width: 100% !important;
    height: auto !important; max-height: none !important;
    overflow: visible !important;
    box-shadow: none !important; border: none !important;
    animation: none !important; transition: none !important;
    background: #ffffff !important; color: #000000 !important;
  }

  div[role="dialog"] > button[class*="absolute"] { display: none !important; }

  table { width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; margin: 0 !important; }
  th, td { word-break: break-word !important; overflow-wrap: break-word !important; }
  tr { break-inside: avoid !important; page-break-inside: avoid !important; }
  thead { display: table-header-group !important; }

  .print-page-break { break-before: page !important; page-break-before: always !important; margin-top: 0 !important; padding-top: 1mm !important; }
  .print-avoid-break { break-inside: avoid !important; page-break-inside: avoid !important; }
  .overflow-x-auto, .overflow-hidden, .overflow-y-auto { overflow: visible !important; }
}
`;
