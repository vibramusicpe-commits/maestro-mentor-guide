# ADR 0102: Separación Pedagógica Estricta de Piano vs. Piano Infantil (Fernando vs. Nathaly) y Blindaje del Bot de WhatsApp

## Estado
Aprobado (v1.9.1) — 17 de Septiembre, 2026

## Contexto
Durante el proceso de asignación de vacantes y registro de alumnos en Vibra Music Staff se presentaron asignaciones ambiguas en el instrumento "Piano":
1. Alumnos principiantes de muy corta edad (categorías Kids / Tiny) eran asignados indistintamente entre el Prof. Fernando y la Prof. Nathaly.
2. Existía el riesgo de que, ante la saturación de cupos de un docente, el bot de WhatsApp o secretaría reasignaran al alumno a otra sala sin considerar la idoneidad pedagógica ni la especialidad por edades.
3. El perfil docente requiere una frontera nítida:
   - **Prof. Nathaly (Sala C)**: Especialista exclusivamente en **Piano Infantil** (niños pequeños / iniciales) y **Canto**.
   - **Prof. Fernando (Sala B)**: **Piano Estándar**, jóvenes, adultos, niveles avanzados / Master y **Violín**.

## Decisiones Técnicas y Pedagógicas
1. **Separación Estricta por Edad y Nivel**:
   - Criterio innegociable: La división entre docentes se realiza por rango de edad y nivel técnico, jamás por falta de espacio en sala.
   - Todo alumno de Piano menor a 8 años o en nivel inicial/infantil se asigna exclusivamente a Nathaly en Sala C.
   - Jóvenes, adultos o niveles intermedios/avanzados se asignan exclusivamente a Fernando en Sala B.
2. **Blindaje del Bot de WhatsApp (`whatsapp-bot.service.ts` y Edge Functions)**:
   - Si Fernando no tiene cupos para Piano o Violín, el bot **NUNCA** deriva al alumno con Nathaly.
   - En su lugar, el bot ofrece turnos alternativos con Fernando o deriva el prospecto al estado `en_evaluacion` para coordinación personalizada de secretaría (Nayeli).
   - Del mismo modo, si Nathaly no dispone de turnos para Piano Infantil, no se transfieren niños pequeños a la sala de Fernando.
3. **Mapeo de Profesores en el Backend (`app-store.ts`, `students.service.ts`)**:
   - `assigned_teacher_id` y `emergency_contact.teacher` se vinculan automáticamente al detectar la categoría de edad (`KIDS`, `TINY` -> Nathaly para Piano; `JUNIOR`, `TEEN`, `ADULTO` -> Fernando).

## Consecuencias
- Se preserva la calidad metodológica de la escuela y se evita la frustración de alumnos y docentes por desajuste pedagógico.
- El bot opera con total predictibilidad y respeto por la capacidad real de cada sala y docente.
