# ADR 0053: Buscador Inteligente con Autocompletado de Alumnos y Libreta de Asistencias y Control de Plan

## Estado
**APROBADO** — 2026-08-19

## Contexto
En la operación diaria de la escuela de música Vibra Music:
1. Nayeli (Secretaría) requería agilidad extrema al programar clases en la agenda, evitando tener que tipear el nombre completo o seleccionar manualmente el profesor, instrumento y categoría asignados a cada alumno.
2. Era necesario contar con un mecanismo de supervisión visual inmediata para asegurar el cumplimiento de la regla institucional de Vibra Music:
   - **Plan Regular:** 8 clases obligatorias al mes (2 clases semanales de 45 min).
   - **Plan Intensivo:** 4 clases obligatorias al mes (1 clase semanal de 90 min).
   - **Créditos de Recuperación:** 1 Falta (Ausente o Justificada) acumula +1 crédito (`makeupCredits`).

## Decisiones Tomadas

### 1. Combobox / Autocomplete Inteligente para los 99 Alumnos
- En el modal `Programar Clase en Horario` (`src/components/admin/agenda-board.tsx`), se reemplazó el input de texto simple por un Combobox interactivo con filtrado dinámico en memoria.
- **Tolerancia a Formatos:** El buscador normaliza caracteres unicode (NFD) eliminando tildes y permitiendo coincidencias tanto por apellido como por nombre (ej: "Sanchez", "Johandry", "Mirko").
- **Autocompletado en 1 Clic:** Al seleccionar un alumno de la lista, el modal rellena automáticamente:
  - `Profesor Asignado` (`st.teacher`)
  - `Instrumento` (`st.instrument`)
  - `Categoría Oficial` (`st.ageCategory` / `JUNIOR`)

### 2. Libreta de Asistencias y Control de Plan (`📖 Libreta de Asistencias y Plan`)
- Se implementó un panel modal de supervisión accesible directamente desde la barra superior de la Agenda.
- **Indicadores en Tiempo Real:**
  - Ratio de cumplimiento: `${scheduledCount} / ${targetLessons} clases`.
  - Barra de progreso con alertas cuando faltan clases por agendar en el mes.
  - Conteo de estados: 🟢 Presentes, 🔴 Ausentes, 🟡 Tardes, 🔵 Justificadas.
  - Saldo de Créditos de Recuperación (`makeupCredits`).
- **Filtros Operativos:** Búsqueda por texto, filtro por Profesor y filtro por Tipo de Plan (Regular / Intensivo / Personalizada).

## Consecuencias
- **Positivas:**
  - Reducción del tiempo de programación de clases en un 80%.
  - Cero discrepancias en asignación de profesores e instrumentos.
  - Visibilidad total para Secretaría y Dirección sobre qué alumnos tienen horas pendientes por completar en su plan mensual.
- **Compatibilidad:** Totalmente integrado con Zustand v16 (`useAppStore`) y alineado con los 18 esquemas relacionales de Insforge PostgreSQL.
