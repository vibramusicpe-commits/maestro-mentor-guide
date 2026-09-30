# ADR-0147: Regla Inquebrantable de Transformación de Sala por Instrumento y Colindancia de Rangos Etarios

## Estado
Aprobado e Implementado

## Fecha
2026-09-30

## Contexto
En la Escuela de Música Vibra Music, existen docentes multidisciplinarios encargados de impartir más de una disciplina en su sala oficial:
* **Prof. Jeremy (Sala A)**: Batería y Guitarra (clásica y eléctrica).
* **Prof. Fernando (Sala B)**: Piano estándar y Violín.
* **Prof. Nathaly (Sala C)**: Piano Infantil y Canto.

Sin embargo, en la práctica pedagógica y acústica real, **está terminantemente prohibido mezclar instrumentos distintos en una misma sala y franja horaria**. La combinación de instrumentos con presiones sonoras dispares (ej. una batería acústica golpeando junto a un alumno de guitarra clásica aprendiendo acordes) deteriora la concentración, la escucha y el avance del estudiante.

Se requería formalizar e implementar en el software la **Regla de Transformación de Sala por Instrumento** y articularla con la matriz de colindancia de edades del PDF oficial de la academia:
1. Si un alumno entra a una sala vacía, **la sala en ese turno se transforma y queda reservada para ese instrumento**.
2. Alumnos de otros instrumentos (ej. Guitarra en turno de Batería) tienen prohibido el ingreso al turno.
3. Dentro del mismo instrumento (ej. Batería), se permite la convivencia únicamente si los rangos de edad son colindantes (Junior con Junior, o Junior con Juvenil). Queda prohibida la convivencia con rangos no colindantes (Junior con Master).
4. Excepción temporal de instrumentación: Guitarra Clásica y Guitarra Eléctrica pueden convivir entre sí (familia GUITARRA) mientras se captan alumnos, pero jamás con Batería.

## Decisiones Técnicas

### 1. Normalización y Validación de Familias de Instrumentos (`room-compatibility.ts`)
* Se implementó `normalizeInstrumentFamily`:
  * `BATERIA`: Batería y percusión (familia acústicamente aislada).
  * `GUITARRA`: Guitarra clásica, eléctrica, acústica, bajo y ukelele.
  * `PIANO`: Piano estándar y teclado (Sala B).
  * `PIANO_INFANTIL`: Piano infantil para niños de 4 a 8 años (Sala C).
  * `VIOLIN`: Violín clásico (Sala B).
  * `CANTO`: Canto y técnica vocal (Sala C).
  * `ESTIMULACION`: Estimulación musical (Sala D).
* Se creó la función `checkInstrumentCompatibility(instA, instB)`:
  * Si pertenecen a familias distintas, retorna `compatible: false` con la causal: *"Incompatibilidad Crítica de Instrumento: La sala en este turno se transformó a [Instrumento Ocupado]. No se permite combinar con [Nuevo Instrumento] en la misma sala."*
  * Guitarra clásica y eléctrica comparten la misma familia (`GUITARRA`), permitiendo su convivencia temporal.

### 2. Extensión del Motor de Compatibilidad Pedagógica
* En `EvaluateCompatibilityParams`, se añadió `instrument?: string` y se extendió `existingRoomLessons` para portar el instrumento de cada lección activa.
* Se agregó el tipo `"instrument_incompatibility"` a `PedagogicalWarningType`.
* `evaluateSlotPedagogicalCompatibility` evalúa prioritariamente la incompatibilidad de instrumento antes de pasar a la compatibilidad de edad o duración.

### 3. Diagnóstico Reactivo y Alerta Crítica en el Organizador de Horarios (`ScheduleStudentForm`)
* `getRoomActiveLessons` en `students-table.tsx` extrae reactivamente el instrumento de cada alumno activo en la franja horaria.
* Si el turno presenta incompatibilidad de instrumentos, el banner se renderiza con **estilo rojo crítico** (`border-red-500/60 bg-red-500/10`), ícono de alerta roja y título destacado: `🚨 Conflicto Crítico de Instrumentos en Sala (ADR-0147)`.
* Se requiere confirmación obligatoria mediante casilla: *"Comprendo la incompatibilidad de instrumentos y confirmo este agendamiento por excepción autorizada por Dirección"*. Mientras no se marque, el botón "Guardar Horario" permanece deshabilitado.

### 4. Actualización del Copiloto Laya (`laya-knowledge-base.ts`)
* Se amplió el clasificador de intenciones y la base de conocimiento en la categoría `convivencia_salas` para responder con exactitud que una sala con Batería se transforma y bloquea el ingreso de Guitarra, explicando que únicamente pueden entrar alumnos de Batería de edades colindantes (Junior o Juvenil).

## Consecuencias
* Se erradica por completo la combinación accidental de instrumentos acústicamente incompatibles en los horarios de secretaría.
* Se preserva la flexibilidad de dirección para excepciones expresas mediante confirmación explícita auditada.
* 0 errores de TypeScript y compilación exitosa en producción.
