# ADR 0067: Sincronización Real del Calendario Dinámico y Soporte de Semanas Completas (Semana 5 / Lunes 31 de Agosto)

## Estado
Aceptado e Implementado

## Contexto
1. **Problema Detectado en Secretaría:**
   - La secretaria Nayeli reportó que las fechas mensuales no coincidían con la realidad física del calendario y no contenían los meses completos.
   - En **Agosto 2026**, el selector de semanas estaba acotado de forma fija a 4 semanas (disabled={currentWeekIndex === 3}), lo que impedía acceder a la **Semana 5 (Lunes 31 de Agosto)**.
   - Al navegar a otros meses (como **Setiembre 2026**), el sistema calculaba los días mediante una fórmula estática 3 + currentWeekIndex * 7, lo que resultaba en que Setiembre mostraba incorrectamente *Lunes 3 de Setiembre* (cuando el 3 de Setiembre es Jueves, y el primer lunes es 7 de Setiembre o 31 de Agosto).
2. **Requisitos de Operación en Producción:**
   - Todo mes debe calcular automáticamente sus semanas formativas reales (Lunes a Sábado).
   - Días de cierre de mes (como Lunes 31 de Agosto) deben quedar perfectamente accesibles y vinculados a la Semana 5.
   - El selector de semanas debe ser dinámico (Semana X de TOTAL, ej. Semana 1 de 5).
   - Las tres vistas (Vista Didáctica Oficial 1x1 y 2x2, Vista por Día y Rejilla Semanal) deben reflejar fechas 100% exactas y sincronizadas.

## Decisiones Técnicas

### 1. Creación del Módulo de Utilidades de Calendario (src/lib/calendar-utils.ts)
- Se implementó la función getMonthWeeks(year: number, monthIndex: number): CalendarWeekInfo[]:
  - Determina todas las semanas lectivas de Lunes a Sábado que contienen días del mes seleccionado.
  - Para Agosto 2026: genera 5 semanas exactas (Semana 1: 3-8 Ago, Semana 2: 10-15 Ago, Semana 3: 17-22 Ago, Semana 4: 24-29 Ago, Semana 5: 31 Ago - 5 Set).
  - Para Setiembre 2026: genera 5 semanas exactas (Semana 1: 31 Ago - 5 Set, Semana 2: 7-12 Set, Semana 3: 14-19 Set, Semana 4: 21-26 Set, Semana 5: 28 Set - 3 Oct).
  - Devuelve objetos fuertemente tipados con dayNum, monthName, dateStr, isCurrentMonth, ormattedShort y ullLabel.

### 2. Integración en src/components/admin/agenda-board.tsx
- **Semanas Dinámicas:** Se sustituyó el selector estático de 4 semanas por un cálculo reactivo monthWeeks y safeWeekIndex.
- **Vista Didáctica Oficial (1x1 y 2x2):** Los encabezados de cada tabla toman el día exacto de currentWeekObj.days.find(d => d.dayKey === dayName).
- **Vista por Día:** Muestra {WEEKDAY_FULL_NAMES[currentDayName]} {dayInfo.dayNum} de {dayInfo.monthName} y pestañas con días reales.
- **Rejilla Semanal:** Los encabezados de Lunes a Viernes y Sábado muestran los días reales calculados.
- **Libreta de Asistencias y Modal de Reprogramación:** Etiquetas actualizadas dinámicamente a Semana {safeWeekIndex + 1} de {monthWeeks.length}.

### 3. Integración en src/components/agenda/minimal-agenda-calendar.tsx
- Sincronización de las semanas dinámicas y números de días en la tira interactiva para profesores y familias.

## Consecuencias
- Resolución definitiva de la incongruencia de fechas reportada por secretaría.
- El Lunes 31 de Agosto y todos los días de fin de mes quedan totalmente operativos para asistencia, visualización y reprogramación.
- 0 errores de compilación (
pm run build verificado).
