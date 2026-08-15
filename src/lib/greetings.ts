// Catálogo de 31 frases motivacionales e inspiradoras personalizadas para Nayeli y el equipo de Vibra Music
export const dailyGreetings = [
  "¡Hoy es un gran día para transformar vidas con la música!",
  "Tu dedicación hace que la academia funcione en perfecta armonía.",
  "Cada alumno que recibe una clase hoy da un paso hacia su pasión musical.",
  "¡Excelente energía para la jornada de hoy en Vibra Music!",
  "La puntualidad y organización son la clave del éxito de nuestra sede.",
  "Un día productivo comienza con tu sonrisa y buena actitud.",
  "La música inspira el alma, y tu gestión hace que todo sea posible.",
  "¡Vamos con todo el entusiasmo para atender a nuestras familias!",
  "Cada llamada y cada mensaje tuyo refleja la calidez de Vibra Music.",
  "El orden de la agenda hoy garantiza la felicidad de nuestros alumnos.",
  "¡Qué gran día para seguir creciendo juntos como equipo!",
  "La paciencia y el cariño con los niños marcan la diferencia.",
  "Gracias por ponerle corazón y profesionalismo a cada detalle.",
  "Hoy nuevas familias descubrirán el maravilloso mundo de la música.",
  "Tu esfuerzo diario es el motor de toda nuestra comunidad musical.",
  "¡Mantengamos el ritmo y la mejor vibra durante las clases de hoy!",
  "Cada horario bien organizado es una clase que fluye con alegría.",
  "La música une a las personas y tu labor las guía con excelencia.",
  "¡Que hoy sea una jornada llena de logros y aprendizajes!",
  "Tu amabilidad en recepción alegra el día de cada alumno y apoderado.",
  "Todo gran músico empezó con una administración impecable como la tuya.",
  "¡Hoy es una nueva oportunidad para brillar en nuestra academia!",
  "La constancia y el compromiso construyen el prestigio de Vibra Music.",
  "Gracias por tu valiosa entrega y dedicación en cada jornada.",
  "¡Adelante con toda la fuerza para hacer de hoy un día extraordinario!",
  "La armonía no solo se toca en los instrumentos, también se vive en recepción.",
  "Cada meta alcanzada es fruto de tu impecable trabajo diario.",
  "¡Sonríe, que hoy la música llenará cada rincón de nuestra sede!",
  "Tu atención y calidez hacen que las familias se sientan en casa.",
  "¡Un día más construyendo el futuro musical de nuestros niños!",
  "La excelencia en el servicio es nuestra mejor melodía. ¡A darlo todo!"
];

export function getDailyGreeting(): string {
  const dayOfMonth = new Date().getDate(); // 1 al 31
  const index = (dayOfMonth - 1) % dailyGreetings.length;
  return dailyGreetings[index] ?? dailyGreetings[0]!;
}
