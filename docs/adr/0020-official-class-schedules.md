# ADR 0020: Estandarización de Horarios Oficiales de Vibra Music (Lunes-Viernes & Sábados)

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

El sistema utilizaba previamente rangos horarios genéricos (como `15:00` a `18:45`). Tras revisar la plantilla oficial entregada por Nayeli:
1. **Lunes a Viernes**: Las clases inician a las **16:00 (4:00 pm)** y se dividen en 5 bloques de 45 minutos:
   - `16:00 - 16:45`
   - `16:45 - 17:30`
   - `17:30 - 18:15`
   - `18:15 - 19:00`
   - `19:00 - 19:45`
2. **Sábados**: Las clases inician a las **09:00 am** y se dividen en bloques hasta la 01:30 pm:
   - `09:00 - 09:45 am`
   - `09:45 - 10:30`
   - `10:30 - 11:15`
   - `11:15 - 12:00`
   - `12:00 - 13:30 pm`
3. **Profesores Oficiales**: Jeremy, Fernando, Nathaly.

## Decisiones

1. **Actualización de `admin-seeds.ts`**:
   - Reemplazados los horarios viejos por la matriz oficial de Vibra Music (`timeSlotsWeekday` y `timeSlotsSaturday`).
   - Actualizados los profesores a la lista oficial (`Jeremy`, `Fernando`, `Nathaly`).
2. **Semillas Reales Cargadas**:
   - Se precargaron los grupos reales indicados en la hoja de Nayeli (ej: *Asaf Chipana en Batería 16:00, Mariño Huachuilca Kiara en Canto 16:00, Valerie Yidda Angulo en Violín 16:00, etc.*).

## Consecuencias
- El sistema muestra exactamente los horarios y profesores con los que trabaja la escuela. Nayeli y la Dueña verán su plantilla real 100% reflejada.
