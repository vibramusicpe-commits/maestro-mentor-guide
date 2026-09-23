# ADR-0121: Matriz Pedagógica de Cursos, Salas Oficiales, Aforos y Reglas de Convivencia

## Estado
Aceptado (Documentación y Especificación Oficial)

## Fecha
2026-09-23

## Contexto
Vibra Music Staff requiere estandarizar y blindar las reglas de asignación de salas, límites de aforo, rangos de edad y convivencia de planes de estudio para evitar conflictos pedagógicos y logísticos en la programación de horarios semanales y en la agenda administrativa.

---

## Decisiones Técnicas y Pedagógicas

### 1. Asignación Oficial de Salas y Especialidades Docentes
* **Prof. Jeremy** $\rightarrow$ **Sala "A"**: Batería y Guitarra (clásica y eléctrica).
* **Prof. Fernando** $\rightarrow$ **Sala "B"**: Violín y Piano (estándar, Juvenil y Master).
* **Prof. Nathaly** $\rightarrow$ **Sala "C"**: Piano Infantil (5 a 6 años) y Canto.
* **Prof. Claudia** $\rightarrow$ **Sala "D"**: Estimulación Musical (4 a 5 años) y Clases Demo de Principiantes exclusivamente.
* **Clases Demo de Nivelación**: Se dictan exclusivamente con el **Profesor Especialista** del instrumento en su respectiva sala (A, B o C). Nunca en Sala D.

---

### 2. Categorías por Edad, Aforos y Aislamiento de Sala

| Categoría | Rango de Edad | Docente Encargado | Aforo Máximo | Regla de Convivencia en Sala |
|---|---|---|---|---|
| **Estimulación Musical** | 4 a 5 años | Prof. Claudia (Sala D) | Hasta 5 alumnos | **Sala Única**. Solo comparte con niños de su misma categoría (4-5 años). Prohibido mezclar con otras edades. |
| **Infantil** | 5 a 6 años | Prof. Nathaly (Sala C) | Hasta 5 alumnos | **Sala Única**. Solo comparte con niños de su misma categoría (5-6 años). Prohibido mezclar con otras edades. |
| **Junior** | 7 a 12 años | Según instrumento | Hasta 5 alumnos | Puede compartir sala con **Juvenil (13-17)**. **PROHIBIDO compartir sala con Master (18+)**. |
| **Juvenil** | 13 a 17 años | Según instrumento | Hasta 5 alumnos | Puede compartir sala con **Junior (7-12)** o con **Master (18+)**. |
| **Master** | 18 a + años | Según instrumento | Hasta 5 alumnos | Puede compartir sala con **Juvenil (13-17)**. **PROHIBIDO compartir sala con Junior (7-12)**. En BD se mapea transparente con `ADULTO`. |
| **Personalizado** | Desde Infantil | Según instrumento | **1 alumno máx.** | **Aislamiento Absoluto**. Sesión de 45 min. Prohibido agregar cualquier otro alumno a la misma sala y turno. |
| **Clase Demo Principiante** | Según prospecto | Prof. Claudia (Sala D) | **1 alumno máx.** | **Sala D Exclusiva**. No comparte sala con ningún otro alumno. |
| **Clase Demo Nivelación** | Según prospecto | Profesor Especialista | **1 alumno máx.** | **Aislamiento Absoluto**. No comparte sala con ningún otro alumno. |

---

### 3. Convivencia de Planes por Duración de Sesión (45 min vs. 90 min)

1. **Sesiones de 45 minutos (SÍ pueden compartir sala)**:
   * **Regular Normal** (8 clases/mes · 2x sem · 45m).
   * **Regular Extenso** (8 clases · 1x sem · 45m $\times$ 2 meses).
   * **Paquete Flexible** (A demanda · 45m por defecto).
   * *Condición:* Los tres pueden convivir en la misma sala hasta el aforo máximo de 5, siempre que respeten la compatibilidad de edad (ej. Junior con Juvenil, o Juvenil con Master).

2. **Sesiones de 45 min vs. 90 min (NO pueden compartir sala)**:
   * **Plan Intensivo (90 min)** no puede compartir sala con **Regular Normal (45 min)**, **Regular Extenso (45 min)** ni **Paquete Flexible (45 min)**.
   * *Motivo pedagógico:* La disparidad en el tiempo de entrada y salida interrumpe la concentración y el ritmo de clase en sala.

3. **Excepción de 90 Minutos para Paquete Flexible**:
   * Si el alumno de Paquete Flexible solicita explícitamente una sesión de 90 minutos antes de agendar, **SÍ puede compartir sala con un alumno de Plan Intensivo (90m)**.

4. **Aislamiento de Personalizado y Demos de Nivelación**:
   * Los alumnos en modalidad **Personalizado** (atención individualizada, condiciones psicológicas leves) y **Demo de Nivelación** tienen aforo = 1. Jamás conviven con alumnos de planes Regulares, Extensos, Intensivos o Flexibles.

---

### 4. Experiencia de Usuario y Regla de Validación en Agenda

* **Nivel de Severidad en la UI**: **Alerta Visual Preventiva (Amarillo/Rojo) con Opción de Confirmación**.
* En lugar de un bloqueo ciego que impida la operativa de secretaría en situaciones excepcionales aprobadas por dirección, el sistema:
  1. Detecta la incompatibilidad (ej. *Junior + Master* o *45m + 90m* o *Personalizado con otro alumno*).
  2. Muestra un banner explicativo detallando la razón pedagógica.
  3. Permite a secretaría confirmar la excepción voluntariamente o elegir una franja/sala sugerida alternativa.

---

### 5. Compatibilidad de Base de Datos (PostgreSQL / Insforge)
* La columna `level` o `category` almacena valores históricos como `ADULTO`.
* Para garantizar que ninguna consulta ni registro existente en producción se rompa:
  * Backend y base de datos: tratan `ADULTO` y `MASTER` de forma intercambiable y normalizada (`category === 'MASTER' || category === 'ADULTO'`).
  * Frontend: muestra visualmente la etiqueta oficial **MASTER (18+)**.
