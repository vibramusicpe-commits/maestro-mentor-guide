/**
 * ==============================================================================
 * functions/_lib/clef.ts — Módulo Especializado de Clasificación y Guardrails Clef
 * ==============================================================================
 * 
 * PROPÓSITO ("AYUDAR A CLEF"):
 * Clef es un modelo clasificador de Cloudflare Workers AI. No genera texto conversacional,
 * sino que calcula probabilidades sobre categorías predefinidas.
 * 
 * Para que Clef funcione con máxima precisión en Vibra Music Staff, este módulo le brinda:
 * 1. Taxonomía de intenciones enriquecida con jerga local peruana ("yapeó", "saldo", "aforo", "de corrido").
 * 2. Inmunización de Falsos Positivos de Privacidad: La secretaria (Nayeli/Staff) TIENE autorización
 *    para consultar deudas y datos de apoderados. Solo se bloquean ataques reales de Prompt Injection.
 * 3. Extractor de Entidades (nombres de alumnos, profesores, salas, instrumentos).
 * 4. Fallback Heurístico Resiliente: Si Workers AI Clef tiene latencia o duda, el sistema no se cae.
 * ==============================================================================
 */

export type AssistantIntent =
  | "cobranzas"
  | "horarios_aforos"
  | "kardex_asistencias"
  | "prospectos_demos"
  | "recordatorios"
  | "ayuda_general"
  | "fuera_de_alcance";

export interface ExtractedEntities {
  studentName?: string;
  teacherName?: "Jeremy" | "Fernando" | "Nathaly" | "Claudia" | string;
  room?: "Sala A" | "Sala B" | "Sala C" | "Sala D";
  instrument?: "Piano" | "Piano Infantil" | "Guitarra" | "Batería" | "Canto" | "Violín" | string;
  timeSlot?: string;
  dateQuery?: string;
  statusFilter?: string;
}

export interface ClefClassificationResult {
  intent: AssistantIntent;
  confidence: number;
  is_sensitive: boolean;
  security_reason?: string;
  entities: ExtractedEntities;
  classified_by: "clef_workers_ai" | "heuristic_fallback";
}

// -----------------------------------------------------------------------------
// 1. Detección de Ataques y Prompt Injection (Seguridad Real vs Privilegio Administrativo)
// -----------------------------------------------------------------------------
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /ignora\s+(todas\s+las\s+)?instrucciones\s+(previas|anteriores)/i,
  /dame\s+(tu\s+)?(prompt|system\s+prompt|api\s*key|service_role|token)/i,
  /drop\s+table/i,
  /truncate\s+table/i,
  /delete\s+from\s+users/i,
  /<script>/i,
  /exec\s*\(/i,
];

export function evaluatePromptSafety(query: string): { is_attack: boolean; reason?: string } {
  const normalized = query.trim();
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        is_attack: true,
        reason: "Intento de inyección de prompt o violación de integridad del sistema.",
      };
    }
  }
  return { is_attack: false };
}

// -----------------------------------------------------------------------------
// 2. Extractor de Entidades del Negocio Musical Vibra Music
// -----------------------------------------------------------------------------
export function extractQueryEntities(query: string): ExtractedEntities {
  const qLower = query.toLowerCase();
  const entities: ExtractedEntities = {};

  // Profesores
  if (qLower.includes("jeremy")) entities.teacherName = "Jeremy";
  else if (qLower.includes("fernando")) entities.teacherName = "Fernando";
  else if (qLower.includes("nathaly") || qLower.includes("naty")) entities.teacherName = "Nathaly";
  else if (qLower.includes("claudia")) entities.teacherName = "Claudia";

  // Salas
  if (qLower.includes("sala a")) entities.room = "Sala A";
  else if (qLower.includes("sala b")) entities.room = "Sala B";
  else if (qLower.includes("sala c")) entities.room = "Sala C";
  else if (qLower.includes("sala d")) entities.room = "Sala D";

  // Instrumentos
  if (qLower.includes("piano infantil") || qLower.includes("piano para niños")) entities.instrument = "Piano Infantil";
  else if (qLower.includes("piano")) entities.instrument = "Piano";
  else if (qLower.includes("guitarra")) entities.instrument = "Guitarra";
  else if (qLower.includes("batería") || qLower.includes("bateria")) entities.instrument = "Batería";
  else if (qLower.includes("canto")) entities.instrument = "Canto";
  else if (qLower.includes("violín") || qLower.includes("violin")) entities.instrument = "Violín";

  // Horarios típicos
  const timeMatch = query.match(/\b(1[6-9]|20|0?[8-9]|1[0-2]):[0-5][0-9]\b/) || query.match(/\b(3|4|5|6|7|8|9|10|11|12)\s*(pm|am|p\.m\.|a\.m\.)\b/i);
  if (timeMatch) {
    entities.timeSlot = timeMatch[0];
  }

  // Extracción simple de posible nombre de alumno (ej: "de Ethan", "de Lucas", "para Benjamin")
  const studentMatch = query.match(/(?:alumno|alumna|de|para|estudiante|a)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/);
  if (studentMatch && !["Jeremy", "Fernando", "Nathaly", "Claudia", "Sala", "Piano", "Guitarra", "Vibra"].includes(studentMatch[1])) {
    entities.studentName = studentMatch[1];
  }

  return entities;
}

// -----------------------------------------------------------------------------
// 3. Heurística de Fallback para Intenciones (Resiliencia Garantizada)
// -----------------------------------------------------------------------------
export function classifyHeuristically(query: string): AssistantIntent {
  const q = query.toLowerCase();

  // Cobranzas y facturación
  if (
    q.includes("pago") ||
    q.includes("debe") ||
    q.includes("deudor") ||
    q.includes("saldo") ||
    q.includes("recibo") ||
    q.includes("factura") ||
    q.includes("yape") ||
    q.includes("cobrar") ||
    q.includes("cuota") ||
    q.includes("vence") ||
    q.includes("vencid") ||
    q.includes("abono")
  ) {
    return "cobranzas";
  }

  // Kardex y asistencias
  if (
    q.includes("asistencia") ||
    q.includes("falta") ||
    q.includes("tardanza") ||
    q.includes("kardex") ||
    q.includes("clases que le quedan") ||
    q.includes("cuántas clases") ||
    q.includes("reprogram") ||
    q.includes("recupera") ||
    q.includes("de corrido")
  ) {
    return "kardex_asistencias";
  }

  // Horarios, cupos y aforos
  if (
    q.includes("horario") ||
    q.includes("cupo") ||
    q.includes("aforo") ||
    q.includes("vacante") ||
    q.includes("turno") ||
    q.includes("sala") ||
    q.includes("disponib")
  ) {
    return "horarios_aforos";
  }

  // Clases demo y prospectos
  if (
    q.includes("demo") ||
    q.includes("prueba") ||
    q.includes("prospecto") ||
    q.includes("interesado") ||
    q.includes("nivelación") ||
    q.includes("informes")
  ) {
    return "prospectos_demos";
  }

  // Recordatorios
  if (
    q.includes("recuérdame") ||
    q.includes("recuerdame") ||
    q.includes("nota") ||
    q.includes("recordar") ||
    q.includes("pendiente para el")
  ) {
    return "recordatorios";
  }

  // Ayuda o fuera de alcance
  if (q.includes("profesor") || q.includes("instrumento") || q.includes("academia") || q.includes("dirección")) {
    return "ayuda_general";
  }

  return "ayuda_general";
}

// -----------------------------------------------------------------------------
// 4. Clasificador Principal (Workers AI Clef + Fallback Híbrido)
// -----------------------------------------------------------------------------
export async function classifyQueryWithClef(
  aiBinding: any,
  query: string
): Promise<ClefClassificationResult> {
  const safety = evaluatePromptSafety(query);
  if (safety.is_attack) {
    return {
      intent: "fuera_de_alcance",
      confidence: 1.0,
      is_sensitive: true,
      security_reason: safety.reason,
      entities: {},
      classified_by: "heuristic_fallback",
    };
  }

  const entities = extractQueryEntities(query);

  // Si no hay binding de Workers AI disponible en el entorno local, usar fallback directo
  if (!aiBinding || typeof aiBinding.run !== "function") {
    return {
      intent: classifyHeuristically(query),
      confidence: 0.9,
      is_sensitive: false,
      entities,
      classified_by: "heuristic_fallback",
    };
  }

  try {
    // Consulta a Clef / Clasificador de Workers AI
    // Clef evalúa opciones de clasificación de intents
    const clefPrompt = `Clasifica la intención de la siguiente consulta administrativa de la escuela de música Vibra Music Staff en una sola palabra:
Opciones: cobranzas, horarios_aforos, kardex_asistencias, prospectos_demos, recordatorios, ayuda_general.
Consulta: "${query}"
Intención:`;

    const response = await aiBinding.run("@cf/cloudflare/clef-1b", {
      text: query,
      labels: [
        "cobranzas",
        "horarios_aforos",
        "kardex_asistencias",
        "prospectos_demos",
        "recordatorios",
        "ayuda_general",
      ],
    }).catch(async () => {
      // Fallback a text-classification estándar si clef-1b tiene diferente schema
      return await aiBinding.run("@cf/huggingface/distilbert-sst-2-int8", {
        text: query,
      }).catch(() => null);
    });

    if (response && response.label) {
      const detectedLabel = response.label.toLowerCase() as AssistantIntent;
      return {
        intent: detectedLabel,
        confidence: response.score || 0.85,
        is_sensitive: false,
        entities,
        classified_by: "clef_workers_ai",
      };
    }

    // Si Clef no devolvió formato esperado, la heurística asiste a Clef
    return {
      intent: classifyHeuristically(query),
      confidence: 0.88,
      is_sensitive: false,
      entities,
      classified_by: "heuristic_fallback",
    };
  } catch (error) {
    console.warn("[Clef Classifier Warning] Error en Workers AI Clef, recurriendo a fallback asistido:", error);
    return {
      intent: classifyHeuristically(query),
      confidence: 0.8,
      is_sensitive: false,
      entities,
      classified_by: "heuristic_fallback",
    };
  }
}
