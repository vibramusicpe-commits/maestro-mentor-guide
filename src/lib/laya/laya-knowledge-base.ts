/**
 * ============================================================================
 * LAYA KNOWLEDGE BASE — Base Canónica de Inducción Técnica y Operativa
 * Vibra Music Staff · Reglas Arquitectónicas, Pedagógicas y Guardrails
 * ============================================================================
 */

export interface AcademyKnowledgeResponse {
  isMatch: boolean;
  isRestricted: boolean;
  category:
    | "horarios_pareados"
    | "ciclo_activacion"
    | "intensivo_recuperacion"
    | "aforos_docentes"
    | "categorias_edad"
    | "master_adulto"
    | "convivencia_salas"
    | "planes_estudio"
    | "renovacion_retencion"
    | "pack_utiles_pagos"
    | "seguridad_restringida"
    | "general";
  title: string;
  markdownContent: string;
}

/**
 * Normaliza texto eliminando tildes y signos para facilitar matching robusto
 */
function cleanText(text: string): string {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Evalúa si una consulta es una pregunta sobre el sistema o una solicitud de datos restringidos
 */
export function resolveAcademyKnowledge(text: string): AcademyKnowledgeResponse | null {
  const norm = cleanText(text);
  if (!norm) return null;

  // 1. 🛡️ GUARDRAILS DE SEGURIDAD FINANCIERA Y PRIVACIDAD (ADR-0142)
  const sensitivePatterns = [
    "tarjeta", "credito", "debito", "cvv", "numero de tarjeta",
    "password", "contrasena", "token", "credencial",
    "cuenta bancaria", "extraer datos de dueno", "claves", "clave secreta", "acceso maestro"
  ];

  if (sensitivePatterns.some((pattern) => norm.includes(pattern))) {
    return {
      isMatch: true,
      isRestricted: true,
      category: "seguridad_restringida",
      title: "🔒 Solicitud Restringida por Políticas de Seguridad (ADR-0142)",
      markdownContent:
        "Por políticas estrictas de seguridad, cumplimiento normativo y privacidad de Vibra Music:\n\n" +
        "• Las credenciales de base de datos, contraseñas de dirección y datos financieros sensibles (tarjetas de crédito, pasarelas de pago Culqi o tokens) están **estrictamente protegidos y bloqueados** para cualquier asistente o consulta en lenguaje natural.\n" +
        "• Para balances de facturación, recibos oficiales y conciliación bancaria, utiliza los módulos autorizados:\n" +
        "  - 💳 **Cobros y Abonos**: `/admin/facturacion`\n" +
        "  - 📊 **Reportes y Auditoría**: `/admin/reportes`",
    };
  }

  // 2. CICLO DE VIDA Y PROCESO DE REGISTRO / ACTIVACIÓN DEL ALUMNO (ADR-0111)
  const isActivationQuery =
    norm.includes("como se registra") ||
    norm.includes("como registrar") ||
    norm.includes("como registro") ||
    norm.includes("registro de alumno") ||
    norm.includes("registrar alumno") ||
    norm.includes("registra un alumno") ||
    norm.includes("como inscribir") ||
    norm.includes("como se inscribe") ||
    norm.includes("inscribir alumno") ||
    norm.includes("como matricular") ||
    norm.includes("matricular alumno") ||
    norm.includes("matricula de alumno") ||
    norm.includes("como se activa") ||
    norm.includes("activar alumno") ||
    norm.includes("activacion de alumno") ||
    norm.includes("proceso de activacion") ||
    norm.includes("proceso de matricula") ||
    norm.includes("proceso de registro") ||
    norm.includes("flujo de registro") ||
    norm.includes("flujo de matricula") ||
    norm.includes("pasos para matricular") ||
    norm.includes("pasos para registrar") ||
    norm.includes("dar de alta") ||
    norm.includes("alta de alumno") ||
    norm.includes("crear alumno") ||
    norm.includes("agregar alumno") ||
    norm.includes("nuevo alumno") ||
    ((norm.includes("registra") || norm.includes("matricul") || norm.includes("inscrib") || norm.includes("activ")) &&
      (norm.includes("alumno") || norm.includes("estudiante") || norm.includes("proceso") || norm.includes("pasos") || norm.includes("como")));

  if (isActivationQuery) {
    return {
      isMatch: true,
      isRestricted: false,
      category: "ciclo_activacion",
      title: "📋 Proceso Oficial para Registrar y Activar un Alumno (ADR-0111)",
      markdownContent:
        "Para que un alumno quede formalmente registrado, asignado en sala y habilitado en el sistema, se sigue el ciclo oficial de 3 pasos innegociables:\n\n" +
        "1. **Paso 1: Ficha y Registro (`/admin/alumnos`)**:\n" +
        "   - En el menú lateral, ve a **Alumnos** y presiona el botón **`+ Nuevo Alumno`**.\n" +
        "   - Ingresa los datos personales: **Nombre Completo** del alumno y **Fecha de Nacimiento**.\n" +
        "   - Completa los datos del apoderado: **Nombre de Padre/Madre**, **Teléfono para WhatsApp** y correo.\n" +
        "   - Selecciona el **Plan Contractual** (Regular 2x S/ 297, Regular 1x/sem, Intensivo S/ 297, Trimestral S/ 261, Anual S/ 237).\n" +
        "   - Registra el **Pack de Libros y Útiles (S/ 67)** y la matrícula (S/ 30 o exonerada).\n" +
        "   - Al guardar, el backend auto-aprovisiona de inmediato su recibo en `/admin/facturacion` (ADR-0109).\n\n" +
        "2. **Paso 2: Horario de Clases (`/admin/agenda` o botón Horario en Ficha)**:\n" +
        "   - Se abre el organizador de horario para asignar docente y sala según edad e instrumento (**ADR-0102**):\n" +
        "     • **Prof. Nathaly (Sala C)**: Piano Infantil (4 a 8 años) y Canto.\n" +
        "     • **Prof. Fernando (Sala B)**: Piano estándar (9+ años, jóvenes y adultos) y Violín.\n" +
        "     • **Prof. Jeremy (Sala A)**: Guitarra clásica/eléctrica y Batería.\n" +
        "   - Selecciona los **Días Pareados** (L-M, M-J, V-S) o modalidad 1x/sem.\n" +
        "   - **Regla de Candado (ADR-0111)**: Una vez agendadas las clases, la modalidad se bloquea con candado (`🔒 Horario activo`) para blindar el contrato.\n\n" +
        "3. **Paso 3: Kardex de Asistencias**:\n" +
        "   - El sistema proyecta exactamente **8 clases al mes** en Plan Regular (o **4 clases de 90 min** en Intensivo).\n" +
        "   - En cada clase, el docente evalúa en sala desde su Kiosco (`✓ Presente`, `✗ Falta`, `⏰ Tarde`, `🔵 Justificada`).\n" +
        "   - Las inasistencias justificadas generan automáticamente créditos de recuperación bajo la máxima: *\"En Vibra Music las clases no se pierden, se recuperan\"*.",
    };
  }

  // 3. HORARIOS PAREADOS OFICIALES (ADR-0104 / ADR-0130)
  if (
    norm.includes("pareado") ||
    norm.includes("pareada") ||
    norm.includes("dias pareados") ||
    norm.includes("horario pareado") ||
    norm.includes("l-m") ||
    norm.includes("m-j") ||
    norm.includes("v-s") ||
    norm.includes("lunes y miercoles") ||
    norm.includes("martes y jueves") ||
    norm.includes("viernes y sabado")
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

  // 4. CURSOS INTENSIVOS (90m) VS RECUPERACIONES (45m) EN VIERNES Y SÁBADO (ADR-0142)
  if (
    norm.includes("intensivo") ||
    norm.includes("90 minutos") ||
    norm.includes("90 min") ||
    norm.includes("recuperacion viernes") ||
    norm.includes("recuperacion sabado") ||
    norm.includes("recuperaciones en viernes") ||
    norm.includes("recuperaciones en sabado") ||
    ((norm.includes("recupera") || norm.includes("recuperacion")) && (norm.includes("viernes") || norm.includes("sabado")))
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

  // 5. EQUIVALENCIA CANÓNICA: MASTER ES IGUAL A ADULTO (ADR-0121)
  const isMasterAdultoQuery =
    (norm.includes("master") &&
      (norm.includes("adult") ||
        norm.includes("igual") ||
        norm.includes("mismo") ||
        norm.includes("diferen") ||
        norm.includes("que es") ||
        norm.includes("significa") ||
        norm.includes("edad") ||
        norm.includes("rango") ||
        norm.includes("quien es"))) ||
    (norm.includes("adulto") &&
      (norm.includes("master") || norm.includes("categoria") || norm.includes("edad"))) ||
    norm === "master" ||
    norm === "categoria master" ||
    norm === "adulto" ||
    norm === "categoria adulto" ||
    norm.includes("master es adulto") ||
    norm.includes("master es igual");

  if (isMasterAdultoQuery) {
    return {
      isMatch: true,
      isRestricted: false,
      category: "master_adulto",
      title: "🎓 Equivalencia Oficial: Master es Igual a Adulto (ADR-0121)",
      markdownContent:
        "**SÍ, la categoría Master es exactamente igual a Adulto (alumnos de 18 años a más)**.\n\n" +
        "Pautas normativas y de persistencia oficial en Vibra Music:\n\n" +
        "• **Compatibilidad en PostgreSQL (ADR-0121)**:\n" +
        "  - En la base de datos PostgreSQL se almacena bajo el valor histórico `ADULTO` para garantizar compatibilidad técnica sin romper registros de producción.\n" +
        "  - En la webapp, fichas de alumno y vista del horario semanal se presenta oficialmente con la etiqueta visible **`MASTER (18+)`**.\n\n" +
        "• **Reglas Estrictas de Convivencia en Sala (ADR-0121)**:\n" +
        "  - ✅ **SÍ puede compartir sala** con la categoría **Juvenil (13 a 17 años)** hasta el aforo de 5 alumnos.\n" +
        "  - ❌ **TERMINANTEMENTE PROHIBIDO compartir sala** con la categoría **Junior (7 a 12 años)** para cuidar la madurez del grupo y la metodología formativa.\n\n" +
        "• **Docentes y Salas Asignadas**:\n" +
        "  - **Piano y Violín**: Prof. Fernando (Sala B).\n" +
        "  - **Guitarra y Batería**: Prof. Jeremy (Sala A).\n" +
        "  - **Aforo**: Máximo 5 alumnos por turno de 45 minutos.",
    };
  }

  // 6. CATEGORÍAS OFICIALES POR EDAD, RANGOS Y SALAS (ADR-0121 / ADR-0102)
  const isCategoriasEdadQuery =
    (norm.includes("infantil") &&
      (norm.includes("edad") ||
        norm.includes("categoria") ||
        norm.includes("anos") ||
        norm.includes("rango") ||
        norm.includes("que es") ||
        norm.includes("cuando") ||
        norm.includes("cuanto") ||
        norm.includes("piano infantil") ||
        norm.includes("clase"))) ||
    norm.includes("categoria de edad") ||
    norm.includes("categorias de edad") ||
    norm.includes("rango de edad") ||
    norm.includes("rangos de edad") ||
    norm.includes("que categorias") ||
    norm.includes("cuales son las categorias") ||
    norm.includes("categoria por edad") ||
    norm.includes("edades de los alumnos") ||
    norm.includes("que edad") ||
    ((norm.includes("junior") || norm.includes("juvenil") || norm.includes("estimulacion")) &&
      (norm.includes("edad") || norm.includes("anos") || norm.includes("categoria") || norm.includes("rango"))) ||
    norm === "infantil" ||
    norm === "categoria infantil" ||
    norm === "junior" ||
    norm === "juvenil" ||
    norm === "estimulacion musical";

  if (isCategoriasEdadQuery) {
    return {
      isMatch: true,
      isRestricted: false,
      category: "categorias_edad",
      title: "👶 Categorías Oficiales por Rango de Edad y Salas (ADR-0121 / ADR-0102)",
      markdownContent:
        "En Vibra Music Staff, los alumnos se clasifican de forma innegociable según su edad y nivel técnico:\n\n" +
        "1. **👶 Estimulación Musical (4 a 5 años)**:\n" +
        "   - **Prof. Claudia (Sala D)** · Aforo máx. 5 niños.\n" +
        "   - **Sala Única**: Prohibido mezclar con otras edades o niveles.\n\n" +
        "2. **🧒 Infantil (5 a 6 años)**:\n" +
        "   - **Prof. Nathaly (Sala C)** · Aforo máx. 5 niños.\n" +
        "   - **Sala Única**: Solo comparte con niños de su misma categoría (5-6 años). Prohibido mezclar con alumnos mayores.\n" +
        "   - *Piano Infantil*: Abarca de **4 a 8 años** (categorías Infantil, Tiny, Junior inicial) dictado exclusivamente por la Prof. Nathaly en Sala C (ADR-0102).\n\n" +
        "3. **🎒 Junior (7 a 12 años)**:\n" +
        "   - Jeremy (Sala A) / Fernando (Sala B) según instrumento.\n" +
        "   - ✅ Puede compartir sala con **Juvenil (13 a 17 años)**.\n" +
        "   - ❌ **PROHIBIDO compartir sala con Master (18+)**.\n\n" +
        "4. **🧑 Juvenil (13 a 17 años)**:\n" +
        "   - Jeremy (Sala A) / Fernando (Sala B).\n" +
        "   - **Puente etario**: Puede compartir sala tanto con Junior (7-12) como con Master (18+).\n\n" +
        "5. **🧑‍🎓 Master = Adulto (18 a + años)**:\n" +
        "   - Jeremy (Sala A) / Fernando (Sala B).\n" +
        "   - ✅ Comparte con Juvenil (13-17). ❌ **PROHIBIDO con Junior (7-12)**. (En PostgreSQL se almacena como `ADULTO`).\n\n" +
        "6. **🎯 Personalizado y Demos de Nivelación**:\n" +
        "   - **Aforo = 1 alumno máx.** (Aislamiento total, 45 min). Jamás comparte sala con otros alumnos.",
    };
  }

  // 7. REGLAS PEDAGÓGICAS DE CONVIVENCIA Y CRUCES EN SALA (ADR-0121)
  const isConvivenciaSalasQuery =
    norm.includes("compartir sala") ||
    norm.includes("comparten sala") ||
    norm.includes("convivencia") ||
    norm.includes("reglas de convivencia") ||
    norm.includes("cruces de sala") ||
    norm.includes("mezclar alumnos") ||
    norm.includes("mezclar edades") ||
    (norm.includes("junior") && norm.includes("master")) ||
    (norm.includes("master") && norm.includes("junior")) ||
    norm.includes("junior puede") ||
    norm.includes("master puede") ||
    norm.includes("infantil puede") ||
    (norm.includes("45") && norm.includes("90")) ||
    norm.includes("45 min con 90");

  if (isConvivenciaSalasQuery) {
    return {
      isMatch: true,
      isRestricted: false,
      category: "convivencia_salas",
      title: "🏛️ Reglas Pedagógicas de Convivencia y Cruces en Sala (ADR-0121)",
      markdownContent:
        "Pautas oficiales de convivencia para agendar clases sin cruces pedagógicos:\n\n" +
        "• **Convivencia Etaria (¿Quiénes pueden compartir sala?)**:\n" +
        "  - ✅ **Junior (7-12) + Juvenil (13-17)**: SÍ está permitido.\n" +
        "  - ✅ **Juvenil (13-17) + Master (18+)**: SÍ está permitido.\n" +
        "  - ❌ **Junior (7-12) + Master (18+)**: **TERMINANTEMENTE PROHIBIDO**.\n" +
        "  - ❌ **Estimulación (4-5) e Infantil (5-6)**: **Sala Única** (jamás se mezclan con otras categorías).\n" +
        "  - ❌ **Personalizado**: Aforo estricto de 1 alumno (aislamiento absoluto).\n\n" +
        "• **Convivencia por Duración de Sesión (45 min vs. 90 min)**:\n" +
        "  - ✅ **Sesiones de 45 min** (Regular 2x, Regular 1x y Flexible 45m) SÍ pueden convivir en la misma sala hasta 5 alumnos si respetan la edad.\n" +
        "  - ❌ **Sesiones de 90 min (Intensivo)** NO pueden convivir con sesiones de 45 min porque la entrada y salida de alumnos interrumpe la concentración (salvo Paquete Flexible de 90m).",
    };
  }

  // 8. MODALIDADES Y PLANES DE ESTUDIO (ADR-0110 / ADR-0113)
  const isPlanesEstudioQuery =
    norm.includes("regular 1x") ||
    norm.includes("regular 2x") ||
    norm.includes("regular extenso") ||
    norm.includes("paquete flexible") ||
    norm.includes("a demanda") ||
    ((norm.includes("diferencia") || norm.includes("comparar")) &&
      (norm.includes("regular") || norm.includes("intensivo"))) ||
    norm.includes("modalidades de estudio") ||
    norm.includes("tipos de planes") ||
    norm.includes("modalidades");

  if (isPlanesEstudioQuery) {
    return {
      isMatch: true,
      isRestricted: false,
      category: "planes_estudio",
      title: "🎵 Planes de Estudio, Frecuencias y Duración (ADR-0110 / ADR-0113)",
      markdownContent:
        "Modalidades formativas oficiales en Vibra Music:\n\n" +
        "• **Plan Regular Normal (2x/sem · 45 min)**:\n" +
        "  - **8 clases al mes** en Días Pareados (L-M, M-J o V-S). Tarifa: S/ 297/mes.\n\n" +
        "• **Plan Regular Extenso (1x/sem · 45 min)**:\n" +
        "  - **8 clases a lo largo de 2 meses** (1 clase por semana de 45m). Pensado para alumnos con agendas ocupadas.\n\n" +
        "• **Plan Intensivo (1x/sem · 90 min)**:\n" +
        "  - **4 clases al mes** de **90 minutos continuos** (2 bloques de 45m seguidos). Días: Jueves, Viernes o Sábados. Tarifa: S/ 297/mes.\n\n" +
        "• **Paquete Flexible (A demanda · 45 min por defecto)**:\n" +
        "  - Bolsas de clases (ej. 24 sesiones a S/ 500). Vigencia por consumo de clases contratadas, configurable en 1x ó 2x por semana.",
    };
  }

  // 9. ASIGNACIÓN DOCENTE, SALAS Y AFOROS (ADR-0102)
  if (
    norm.includes("profesores y salas") ||
    norm.includes("docentes y salas") ||
    norm.includes("quien ensena") ||
    norm.includes("quien dicta") ||
    norm.includes("especialidad de profesor") ||
    norm.includes("aforo") ||
    norm.includes("cupos por sala") ||
    norm.includes("capacidad") ||
    norm.includes("nathaly") ||
    norm.includes("fernando") ||
    norm.includes("jeremy") ||
    norm.includes("piano infantil")
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
        "*Aforo estricto: Cada docente maneja un aforo máximo estricto de 5 alumnos por turno de 45 minutos.*",
    };
  }

  // 6. SEGUIMIENTO, RETENCIÓN Y RENOVACIÓN DE CICLOS (ADR-0139)
  if (
    norm.includes("renov") ||
    norm.includes("retencion") ||
    norm.includes("semaforo") ||
    norm.includes("cortesia") ||
    norm.includes("culminado") ||
    norm.includes("proximo a culminar")
  ) {
    return {
      isMatch: true,
      isRestricted: false,
      category: "renovacion_retencion",
      title: "🔄 Sistema de Seguimiento, Retención y Renovación (ADR-0139)",
      markdownContent:
        "En Vibra Music **no existe plazo de gracia o cortesía post-vencimiento** para cuidar las vacantes en sala:\n\n" +
        "• **🟡 Fase Amarilla (Alerta Preventiva)**: Se activa cuando restan **1 ó 2 clases o créditos**. Secretaría contacta al apoderado con días de anticipación por WhatsApp para confirmar continuidad antes de la última clase.\n" +
        "• **🔴 Fase Roja (Culminado)**: Se activa cuando completó al 100% sus clases y créditos ($S_{pend} = 0$). Solo en este estado se habilita el botón **`[🔄 Renovar Ciclo]`**.\n" +
        "• **Renovación Limpia**: El nuevo ciclo arranca limpio con sus 8 clases nuevas (o 4 intensivas) sin arrastrar créditos anteriores.\n" +
        "• **Pestaña Dedicada**: Se gestiona en `/admin/alumnos` en la pestaña **`[🔄 Seguimiento & Renovación]`**.",
    };
  }

  // 7. PLANES, TARIFAS Y PACK DE ÚTILES (ADR-0104)
  if (
    norm.includes("precio") ||
    norm.includes("costo") ||
    norm.includes("tarifa") ||
    norm.includes("cuanto cuesta") ||
    norm.includes("pack de utiles") ||
    norm.includes("libro") ||
    norm.includes("planes")
  ) {
    return {
      isMatch: true,
      isRestricted: false,
      category: "pack_utiles_pagos",
      title: "💰 Planes, Tarifas Oficiales y Pack de Útiles (ADR-0104)",
      markdownContent:
        "Estructura oficial de precios y materiales de Vibra Music:\n\n" +
        "• **Plan Regular Mensual**: S/ 297 al mes (8 clases de 45 min, 2x/sem).\n" +
        "• **Plan Intensivo Mensual**: S/ 297 al mes (4 clases de 90 min, 1x/sem).\n" +
        "• **Plan Trimestral con Descuento**: S/ 261 al mes (compromiso de 3 meses).\n" +
        "• **Plan Anual**: S/ 237 al mes.\n" +
        "• **Pack de Libros y Útiles**: **S/ 67** (pago único por ciclo formativo).\n" +
        "• **Matrícula**: S/ 30 (o exonerada según campaña vigente).\n" +
        "• **Cobros y Recibos**: Se gestionan en tiempo real en `/admin/facturacion` con soporte para Yape, Plin, transferencias y pasarela Culqi.",
    };
  }

  return null;
}
