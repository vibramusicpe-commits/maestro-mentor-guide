# ADR 0087: Notas de Familia en Portal Docente, Unificación de Programación en Agenda y Recuperación Inteligente Proyectada

## Estado
Aceptado (Accepted)

## Fecha
2026-09-10

## Contexto
1. **Control de Profesores (/teacher)**: Los docentes necesitaban una forma estructurada de redactar notas pedagógicas individuales a las familias (con buscador de alumnos asignados, datos de contacto del padre/madre y botón directo a WhatsApp con enlace al Portal Familiar), o emitir una **Nota General** visible para todas sus familias.
2. **Unificación de + Programar Clase vs + Horario**: En /admin/alumnos, el botón + Horario organizaba el plan oficial de 2 clases pareadas (o 1 intensiva) con diagnóstico de conflictos en 1 o 2 días. Sin embargo, en /admin/agenda, + Programar Clase estaba concebido únicamente para una sesión suelta o mover una casilla individual, lo que causaba confusión funcional.
3. **Regla de Reprogramación y Recuperación para Días Avanzados (Jueves / Fin de Ciclo Regular)**:
   - Las clases regulares en Vibra Music se dictan estrictamente en días pareados oficiales:
     - **Par 1**: Lunes – Miércoles (45 min)
     - **Par 2**: Martes – Jueves (45 min)
     - **Intensivos**: Viernes o Sábados (90 min)
   - Si un alumno matriculado o que asiste un **Jueves** falta o requiere reprogramar, ya no existen días hábiles regulares en esa misma semana.
   - **Regla de Negocio**:
     - **Por defecto (Días Regulares)**: La reprogramación debe proyectarse a la **Próxima Semana** (Semana actual + 1), sugiriendo Lunes o Martes con vacantes.
     - **Excepción Oficial (Misma Semana en Intensivos)**: Si en **Viernes o Sábado** el docente tiene vacantes libres en su grupo pedagógico (aforo < 5 alumnos), el sistema permite agendar la recuperación en esa misma semana para que el alumno no pierda el ritmo de práctica.
     - **Validación Estricta de Aforo**: El aforo pedagógico de Vibra Music es de máximo 5 alumnos por sala/profesor. Si una franja tiene 5/5 o cruce de profesor en sala, el sistema bloquea el guardado e instruye al usuario a elegir una franja disponible.

## Decisiones Técnicas y de Diseño

### 1. Portal Docente: Selector de Destinatario y WhatsApp Directo (src/components/teacher/lesson-notes.tsx)
- Selector con autocompletado que lista a los alumnos asignados al docente activo o con clases en su horario.
- Opción destacada: 📢 Nota General (Todas mis Familias) para difusión de comunicados institucionales.
- Al seleccionar a un alumno:
  - Ficha resumen con nombre, instrumento, familia y número telefónico del apoderado.
  - Plantillas pedagógicas de 1 clic: Avance Técnico, Nueva Canción, Felicitación.
  - Botón de WhatsApp institucional preformateado que abre https://wa.me/51... con enlace al Portal de Familia (https://vibramusic.pe/family).
  - Botón Guardar en Portal Familiar que persiste el campo teacherNote en el almacén de estado y base de datos.
  - Pestaña de Notas Privadas conservada para reportes confidenciales exclusivos con Dirección y Secretaría.

### 2. Unificación de Programación en Agenda (src/components/admin/agenda-board.tsx)
- En el modal Programar Clase en Horario (isAddLessonOpen), se incorporó un interruptor de modalidad:
  - Plan Regular (Días Pareados): Permite programar el plan completo recurrente (L-M, M-J, Vie, Sáb) con el mismo motor reactivo de conflictos que evalúa en vivo Día 1 y Día 2, mostrando si el horario tiene conflicto en 1 o 2 días y ofreciendo chips de franjas recomendadas disponibles.
  - Sesión Individual / Mover Casilla: Conserva la funcionalidad de ajuste fino para reubicar sesiones existentes o añadir una clase suelta.

### 3. Motor de Recuperación Inteligente (isMakeupModalOpen)
- Detección automática al seleccionar al alumno: si tiene clase habitual los Jueves o la falta registrada es de Jueves, el sistema preselecciona la **Próxima Semana** (Semana actual + 1) en días regulares (Lunes).
- Panel de sugerencias inteligentes dividido en:
  - **Opción A (Misma Semana en Intensivos)**: Escanea Viernes y Sábados de la semana activa. Si encuentra franjas con aforo < 5, genera chips interactivos con el número de cupos libres disponibles.
  - **Opción B (Próxima Semana en Días Regulares)**: Escanea Lunes a Jueves de la semana siguiente y ofrece franjas con vacantes libres.
- Banner de conflicto de aforo y cruce de sala en tiempo real: si la franja elegida tiene 5 alumnos o existe otro docente en la misma sala, se muestra advertencia destructiva y el botón de guardado se deshabilita.

## Consecuencias
- Cero sobrecupos pedagógicos en las salas (respeto estricto del límite de 5 alumnos).
- Claridad total para Secretaría Nayeli y Dirección: la programación pareada y la recuperación proyectada siguen las reglas oficiales de la escuela sin ambigüedades.
- Mayor comunicación y fidelización con los apoderados a través de las notas docentes enviadas por WhatsApp y reflejadas en el Portal de Familia.
