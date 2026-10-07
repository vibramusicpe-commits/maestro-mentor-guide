# ADR 0160: Asignación Docente y de Sala Estricta para Piano Infantil (Caso Ethan Paolo Jara Saldarriaga)

## Estado
Aprobado e Implementado (v2.0.30) — 06 de Octubre, 2026

## Contexto
1. **Regla Pedagógica Innegociable (ADR-0102)**:
   - La asignación de profesores y salas en Vibra Music se rige por edad y nivel:
     - **Prof. Nathaly (Sala C)**: Exclusiva para **Piano Infantil** (4 a 8 años / categorías Infantil, Tiny, Junior inicial) y Canto.
     - **Prof. Fernando (Sala B)**: Piano estándar (jóvenes, adultos, intermedios/avanzados) y Violín.
     - **Prof. Jeremy (Sala A)**: Guitarra y Batería.
   - Jamás se asigna un niño pequeño con Fernando por falta de aforo ni viceversa.
2. **Caso Ethan Paolo Jara Saldarriaga (`ee03db47-1a4d-492a-a442-99bdabd8d66f`)**:
   - 7 años, nacido en 2019, categoría `INFANTIL`.
   - Se encontraba erróneamente vinculado a Sala B y no figuraba en la vista docente de Prof. Nathaly.
   - Su recuperación del 05 de Octubre de 2026 no se reflejaba en el horario ni en el portal de la profesora.

## Decisiones Técnicas
1. **Saneamiento en Insforge PostgreSQL**:
   - `instrument`: `"Piano Infantil"`.
   - `assigned_teacher_id`: `"00000000-0000-0000-0000-000000000005"` (Prof. Nathaly).
   - `emergency_contact.teacher`: `"Nathaly"`.
   - `emergency_contact.room`: `"Sala C"`.
   - `emergency_contact.ageCategory`: `"INFANTIL"`.
   - Lecciones recurrentes (`sch-1790119019904-f6g0` Lun 17:30 y `sch-1790119019904-pegg` Mié 17:30) y recuperaciones puntuales (23/09 y 05/10 a las 18:15) reasignadas formalmente a Nathaly en Sala C.
2. **Reflejo Inmediato en Portales**:
   - Ethan figura con asistencia `presente` para el `2026-10-05` en `/teacher` y `/teacher/agenda` de Prof. Nathaly.
   - En `/admin/agenda`, aparece ordenado en Sala C sin cruces indebidos en Sala B.

## Verificación
- Verificado en PostgreSQL y en las vistas de Kiosco y Agenda.
- Compilación `npm run build` exitosa con 0 errores.
