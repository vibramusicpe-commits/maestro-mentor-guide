import type { WeekDay } from "@/store/app-store";

export const MONTHS_NAME = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Setiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const WEEKDAYS_ORDER: WeekDay[] = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export const WEEKDAY_FULL_NAMES: Record<WeekDay, string> = {
  Lun: "Lunes",
  Mar: "Martes",
  Mié: "Miércoles",
  Jue: "Jueves",
  Vie: "Viernes",
  Sáb: "Sábado",
};

export interface CalendarDayInfo {
  dayKey: WeekDay;
  dayNum: number;
  monthIndex: number;
  monthName: string;
  year: number;
  isCurrentMonth: boolean;
  dateStr: string; // YYYY-MM-DD
  formattedShort: string; // 3 Ago
}

export interface CalendarWeekInfo {
  weekIndex: number;
  label: string; // Semana 1, Semana 2, etc.
  days: CalendarDayInfo[];
  startDayNum: number;
  endDayNum: number;
  summary: string; // 3 Ago - 8 Ago
  fullLabel: string; // Semana 1 de 5 · Agosto 2026
}

/**
 * Calcula dinámicamente todas las semanas lectivas (Lunes a Sábado) para cualquier mes y año dado.
 * Garantiza que días finales como el Lunes 31 de Agosto pertenezcan a la Semana 5 real,
 * y que meses como Setiembre comiencen en sus días reales (Mar 1, Mié 2, Jue 3, etc.).
 */
export function getMonthWeeks(year: number, monthIndex: number): CalendarWeekInfo[] {
  const weeks: CalendarWeekInfo[] = [];

  const d1 = new Date(year, monthIndex, 1);
  const dow1 = d1.getDay(); // 0=Dom, 1=Lun, 2=Mar... 6=Sab

  // Desplazamiento para ubicar el lunes de inicio
  const firstMonOffset = dow1 === 0 ? 1 : dow1 === 1 ? 0 : 1 - dow1;
  let curMon = new Date(year, monthIndex, 1 + firstMonOffset);

  // Si el 1 de Agosto cae sábado, el primer ciclo formativo arranca el lunes 3
  if (dow1 === 6) {
    curMon = new Date(year, monthIndex, 3);
  }

  while (true) {
    const weekDays: CalendarDayInfo[] = WEEKDAYS_ORDER.map((dayKey, idx) => {
      const dayDate = new Date(curMon.getFullYear(), curMon.getMonth(), curMon.getDate() + idx);
      const mIdx = dayDate.getMonth();
      const mName = MONTHS_NAME[mIdx] || "";
      const dNum = dayDate.getDate();
      const dYear = dayDate.getFullYear();
      const isCurrentMonth = mIdx === monthIndex && dYear === year;
      const dateStr = `${dYear}-${String(mIdx + 1).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`;

      return {
        dayKey,
        dayNum: dNum,
        monthIndex: mIdx,
        monthName: mName,
        year: dYear,
        isCurrentMonth,
        dateStr,
        formattedShort: `${dNum} ${mName.slice(0, 3)}`,
      };
    });

    // Validar si esta semana contiene días pertenecientes a este mes
    const hasDaysInThisMonth = weekDays.some((d) => d.isCurrentMonth);
    if (!hasDaysInThisMonth) break;

    const wIdx = weeks.length;
    const startDay = weekDays[0]!;
    const endDay = weekDays[5]!;

    weeks.push({
      weekIndex: wIdx,
      label: `Semana ${wIdx + 1}`,
      days: weekDays,
      startDayNum: startDay.dayNum,
      endDayNum: endDay.dayNum,
      summary: `${startDay.formattedShort} - ${endDay.formattedShort}`,
      fullLabel: `Semana ${wIdx + 1} de [TOTAL] · ${MONTHS_NAME[monthIndex]} ${year}`,
    });

    // Avanzar al siguiente lunes
    curMon = new Date(curMon.getFullYear(), curMon.getMonth(), curMon.getDate() + 7);
    if (curMon.getFullYear() > year || (curMon.getFullYear() === year && curMon.getMonth() > monthIndex)) {
      const sat = new Date(curMon.getFullYear(), curMon.getMonth(), curMon.getDate() + 5);
      if (curMon.getMonth() !== monthIndex && sat.getMonth() !== monthIndex) {
        break;
      }
    }
  }

  // Actualizar fullLabel con el total real de semanas calculadas
  return weeks.map((w) => ({
    ...w,
    fullLabel: `Semana ${w.weekIndex + 1} de ${weeks.length} · ${MONTHS_NAME[monthIndex]} ${year}`,
  }));
}

