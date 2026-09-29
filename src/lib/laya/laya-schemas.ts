/**
 * Esquemas de Decisión Tipada para Vibra Music Staff — LAYA (Sistema 1)
 */
import type { LayaChoiceQuestion, LayaNoulQuestion, LayaScoreQuestion } from "./laya-engine";

export type ReprogramacionIntent =
  | "reprogramacion"
  | "consulta_clases_pendientes"
  | "justificar_falta"
  | "consulta_vacantes"
  | "nueva_matricula"
  | "pago_voucher"
  | "reclamo_urgente"
  | "general";

export type DayKey = "Lun" | "Mar" | "Mié" | "Jue" | "Vie" | "Sáb" | "indeterminado";

export const LAYA_REPROGRAMACION_QUESTIONS = {
  intent: {
    type: "choice",
    instructions: "¿Cuál es la intención o gestión solicitada en el mensaje?",
    criteria: {
      reprogramacion: "Solicita reprogramar, recuperar, cambiar de fecha o agendar clase pendiente o perdida.",
      consulta_clases_pendientes: "Pregunta cuántas clases le quedan, saldo de clases, cuántas faltan, clases pendientes, estado del ciclo o avance de asistencias.",
      justificar_falta: "Avisa que no podrá asistir por enfermedad, salud, exámenes o viaje.",
      consulta_vacantes: "Pregunta qué horarios, cupos o vacantes hay disponibles para un día o instrumento.",
      nueva_matricula: "Pregunta por precios, inscripciones o tarifas de alumno nuevo interesado en matricularse.",
      pago_voucher: "Envía comprobante, voucher de banco, pago de Yape/Plin o consulta de recibo.",
      reclamo_urgente: "Manifestación de molestia, desacuerdo con el servicio, docente o retraso.",
      general: "Saludos o mensajes que no solicitan ninguna gestión específica.",
    },
  } as LayaChoiceQuestion<ReprogramacionIntent>,

  dia: {
    type: "choice",
    instructions: "¿Para qué día de la semana se solicita o menciona el horario?",
    criteria: {
      Lun: "Lunes",
      Mar: "Martes",
      Mié: "Miércoles",
      Jue: "Jueves",
      Vie: "Viernes",
      Sáb: "Sábado",
      indeterminado: "No especifica día de la semana.",
    },
  } as LayaChoiceQuestion<DayKey>,

  horario: {
    type: "choice",
    instructions: "¿Qué hora aproximada o turno se menciona en la solicitud?",
    criteria: {
      "16:00": "4:00 pm, 4 de la tarde, 16:00",
      "16:45": "4:45 pm, 16:45",
      "17:30": "5:30 pm, 5 y media, 17:30",
      "18:15": "6:15 pm, 6 y cuarto, 18:15",
      "19:00": "7:00 pm, 7 de la noche, 19:00",
      "19:45": "7:45 pm, 19:45",
      "09:00": "9:00 am, mañana sábado temprano",
      "10:30": "10:30 am, media mañana",
      "12:00": "12:00 pm, mediodía",
      indeterminado: "No especifica hora exacta.",
    },
  } as LayaChoiceQuestion<string>,

  motivo_falta: {
    type: "choice",
    instructions: "¿Cuál es la causa o motivo de la ausencia?",
    criteria: {
      salud_medica: "Enfermedad, fiebre, gripe, cita médica, descanso médico, hospital.",
      estudios_colegio: "Exámenes, tareas, proyecto escolar, universidad, clases extracurriculares.",
      viaje_personal: "Viaje familiar, fuera de Lima, vacaciones, paseo.",
      fuerza_mayor: "Tráfico extremo, emergencia familiar imprevista, corte de luz.",
      injustificada: "Se quedó dormido, no quiso ir, se olvidó, sin motivo.",
    },
  } as LayaChoiceQuestion<string>,

  es_justificada: {
    type: "noul",
    instructions: "¿La falta califica como justificada otorgando crédito de recuperación según las normas?",
  } as LayaNoulQuestion,

  urgencia: {
    type: "score",
    instructions: "¿Qué nivel de urgencia tiene la atención de esta solicitud?",
    criteria: [
      "Baja: consulta general o para la próxima semana",
      "Media: para mañana o pasado mañana",
      "Alta: para hoy mismo o requiere respuesta urgente",
    ],
  } as LayaScoreQuestion,
};

export const LAYA_RENOVACION_QUESTIONS = {
  decision: {
    type: "choice",
    instructions: "¿Qué responde el apoderado respecto a renovar su ciclo mensual?",
    criteria: {
      confirma_continuidad: "Sí continuará, pide datos para pagar o avisa que enviará el pago.",
      pide_cambio_horario: "Quiere seguir pero necesita cambiar de hora o día.",
      pausa_temporal: "Pide pausar por 1 mes por colegio, vacaciones o motivos temporales.",
      objecion_precio: "Menciona que está caro, pide descuento o no tiene dinero ahora.",
      retiro_definitivo: "No desea continuar definitivamente en la escuela.",
    },
  } as LayaChoiceQuestion<string>,

  metodo_pago: {
    type: "choice",
    instructions: "¿Qué medio de pago menciona o prefiere?",
    criteria: {
      yape_plin: "Yape, Plin, billetera digital.",
      transferencia: "Transferencia BCP, BBVA, Interbank, cuenta bancaria.",
      efectivo_tarjeta: "Efectivo en sede o tarjeta de crédito Culqi.",
      indeciso: "No especifica medio de pago.",
    },
  } as LayaChoiceQuestion<string>,
};

export const LAYA_PEDAGOGICAL_RISK_QUESTIONS = {
  riesgo_abandono: {
    type: "noul",
    instructions: "¿La nota del docente evidencia riesgo de desmotivación o abandono del alumno?",
  } as LayaNoulQuestion,

  nivel_compromiso: {
    type: "score",
    instructions: "¿Qué nivel de práctica y compromiso refleja la observación?",
    criteria: [
      "Bajo: no practica, desinteresado o muy frustrado",
      "Medio: cumple parcialmente con las tareas del libro",
      "Alto: muy motivado, practica y avanza rápido de lección",
    ],
  } as LayaScoreQuestion,
};
