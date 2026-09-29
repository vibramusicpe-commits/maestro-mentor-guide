/**
 * ============================================================================
 * LAYA KNOWLEDGE BASE — Base Canónica de Inducción Técnica y Operativa
 * Vibra Music Staff · Reglas Arquitectónicas, Pedagógicas y Guardrails
 * ============================================================================
 */

export interface AcademyKnowledgeResponse {
  isMatch: boolean;
  isRestricted: boolean;
  category: "horarios_pareados" | "ciclo_activacion" | "intensivo_recuperacion" | "aforos_docentes" | "seguridad_restringida" | "general";
  title: string;
  markdownContent: string;
}

/**
 * Evalúa si una consulta es una pregunta sobre el sistema o una solicitud de datos restringidos
 */
export function resolveAcademyKnowledge(text: string): AcademyKnowledgeResponse | null {
  const norm = (text || "").toLowerCase().trim();

  // 1. 🛡️ GUARDRAILS DE SEGURIDAD FINANCIERA Y PRIVACIDAD (ADR-0142)
  const sensitivePatterns = [
    "tarjeta", "credito", "debito", "cvv", "numero de tarjeta",
    "password", "contrasena", "contraseña", "token", "credencial",
    "cuenta bancaria", "extraer datos de dueno", "extraer datos de dueño", "claves", "clave secreta"
  ];

  if (sensitivePatterns.some((pattern) => norm.includes(pattern))) {
    return {
      isMatch: true,
      isRestricted: true,
      category: "seguridad_restringida",
      title: "🔒 Solicitud Restringida por Políticas de Seguridad (ADR-0142)",
      markdownContent:
        "Por políticas estrictas de seguridad, cumplimiento normativo y privacidad de Vibra Music:\n\n" +
        "• Las credenciales de base de datos, accesos de superadministrador y datos financieros sensibles (tarjetas de crédito, pasarelas de pago Culqi o tokens) están **estrictamente protegidos y bloqueados** para cualquier asistente o consulta en lenguaje natural.\n" +
        "• Para balances de facturación, recibos oficiales y conciliación bancaria, utiliza los módulos autorizados:\n" +
        "  - 💳 **Cobros y Abonos**: `/admin/facturacion`\n" +
        "  - 📊 **Reportes y Auditoría**: `/admin/reportes`",
    };
  }

  // 2. HORARIOS PAREADOS OFICIALES
  if (
    norm.includes("horario pareado") ||
    norm.includes("horarios pareados") ||
    norm.includes("dias pareados") ||
    norm.includes("días pareados") ||
    norm.includes("l-m") ||
    norm.includes("m-j") ||
    norm.includes("v-s")
  ) {
    return {
      isMatch: true,
      isRestricted: false,
      category: "horarios_pareados",
      title: "🔗 Días Pareados Oficiales de Vibra Music (ADR-0104 / ADR-0130)",
      markdownContent:
        "En Vibra Music, los planes regulares de 2 clases por semana (8 clases al mes de 45 minutos) se organizan bajo **Días Pareados Oficiales** para garantizar la continuidad pedagógica:\n\n" +
        "• **Lunes y Miércoles (L-M)**: Turnos vespertinos oficiales de 45 min:\n" +
        "  `16:00 - 16:45` | `16:45 - 17:30` | `17:30 - 18:15` | `18:15 - 19:00` | `19:00 - 19:45` | `19:45 - 20:30`\n\n" +
        "• **Martes y Jueves (M-J)**: Mismos turnos vespertinos oficiales (16:00 a 19:45).\n\n" +
        "• **Viernes y Sábado (V-S)**: Turno vespertino el Viernes y matutino el Sábado:\n" +
        "  `Sábados: 09:00, 09:45, 10:30, 11:15, 12:00, 12:45, 13:30`\n\n" +
        "*Nota: No existen turnos después de las 20:30 ni sábados por la tarde.*",
    };
  }

  // 3. CICLO DE VIDA DE ACTIVACIÓN DEL ALUMNO (1. REGISTRO ➔ 2. HORARIO ➔ 3. KARDEX)
  if (
    norm.includes("como se activa") ||
    norm.includes("cómo se activa") ||
    norm.includes("proceso de activacion") ||
    norm.includes("proceso de activación") ||
    norm.includes("proceso para que un alumno se active") ||
    norm.includes("pasos para matricular") ||
    norm.includes("flujo de matricula") ||
    norm.includes("flujo de matrícula")
  ) {
    return {
      isMatch: true,
      isRestricted: false,
      category: "ciclo_activacion",
      title: "📋 Ciclo Canónico de Activación del Alumno (ADR-0111)",
      markdownContent:
        "Para que un alumno quede formalmente activo en la plataforma y habilitado en sala, se sigue el flujo oficial de 3 pasos innegociables:\n\n" +
        "1. **Paso 1: Ficha y Registro (`/admin/alumnos`)**:\n" +
        "   - Se registra el nombre completo del alumno y fecha de nacimiento.\n" +
        "   - Se ingresan los datos del apoderado (nombre, teléfono para WhatsApp y correo).\n" +
        "   - Se define el plan contractual (Regular S/ 297, Trimestral S/ 261, Anual S/ 237).\n" +
        "   - Se registra el Pack de Libros y Útiles (S/ 67) y la matrícula (S/ 30 o exonerada).\n\n" +
        "2. **Paso 2: Horario de Clases (`/admin/agenda`)**:\n" +
        "   - Se asigna sala y docente respetando estrictamente el **ADR-0102** por instrumento y rango de edad.\n" +
        "   - Se programa en Días Pareados (L-M, M-J, V-S) o modalidad 1x/sem.\n" +
        "   - **Regla de candado**: Una vez guardado el horario, la modalidad queda bloqueada para evitar desajustes contractuales.\n\n" +
        "3. **Paso 3: Kardex de Asistencias**:\n" +
        "   - Se proyectan automáticamente exactamente 8 clases lectivas (o 4 en intensivo).\n" +
        "   - Cada clase cuenta con control de asistencia (`✓ Presente`, `✗ Falta`, `⏰ Tarde`, `🔵 Justificada`).\n" +
        "   - Las faltas justificadas abonan automáticamente créditos de recuperación.",
    };
  }

  // 4. CURSOS INTENSIVOS (90m) VS RECUPERACIONES (45m) EN VIERNES Y SÁBADO
  if (
    norm.includes("intensivo") ||
    norm.includes("90 minutos") ||
    norm.includes("90 min") ||
    norm.includes("recuperacion viernes") ||
    norm.includes("recuperacion sabado") ||
    norm.includes("recuperaciones en viernes")
  ) {
    return {
      isMatch: true,
      isRestricted: false,
      category: "intensivo_recuperacion",
      title: "⚡ Cursos Intensivos (90m) y Recuperaciones (45m) (ADR-0142)",
      markdownContent:
        "Reglas pedagógicas oficiales de duración y ocupación de salas:\n\n" +
        "• **Cursos Intensivos (4 clases de 90 minutos)**:\n" +
        "  - Se imparten 1 sola vez por semana en bloques continuos de **90 minutos** (2 bloques seguidos de 45m).\n" +
        "  - Sus días prioritarios oficiales son **Jueves, Viernes o Sábados**.\n\n" +
        "• **Viernes y Sábados para Recuperaciones de Plan Regular (45 min)**:\n" +
        "  - Aunque Viernes y Sábados están destinados a turnos intensivos, **si una sala dispone de aforo libre (< 5 alumnos en ese bloque de 45 minutos), SÍ se pueden agendar clases de recuperación de 45 minutos** de alumnos de Plan Regular.\n" +
        "  - Máximo 5 alumnos por sala en cualquier turno para resguardar la calidad formativa.",
    };
  }

  // 5. ASIGNACIÓN DOCENTE Y SALAS (ADR-0102)
  if (
    norm.includes("profesores y salas") ||
    norm.includes("docentes y salas") ||
    norm.includes("quien enseña") ||
    norm.includes("quién enseña") ||
    norm.includes("nathaly") ||
    norm.includes("fernando") ||
    norm.includes("jeremy")
  ) {
    return {
      isMatch: true,
      isRestricted: false,
      category: "aforos_docentes",
      title: "🏛️ Reglas Pedagógicas de Salas y Docentes (ADR-0102)",
      markdownContent:
        "La asignación docente se rige exclusivamente por especialidad y edad, **nunca por falta de espacio en sala**:\n\n" +
        "• **Prof. Nathaly (Sala C)**:\n" +
        "  - Especialista en **Piano Infantil** (niños de 4 a 8 años / Infantil, Tiny, Junior inicial).\n" +
        "  - Especialista en **Canto**.\n\n" +
        "• **Prof. Fernando (Sala B)**:\n" +
        "  - **Piano Estándar** (jóvenes, adultos 9+ años, niveles intermedios/avanzados/MASTER).\n" +
        "  - **Violín**.\n\n" +
        "• **Prof. Jeremy (Sala A)**:\n" +
        "  - **Guitarra clásica y eléctrica**.\n" +
        "  - **Batería y percusión**.\n\n" +
        "*Aforo estricto: Máximo 5 alumnos por sala en cada turno.*",
    };
  }

  return null;
}
