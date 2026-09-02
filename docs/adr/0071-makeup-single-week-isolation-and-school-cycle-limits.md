# ADR 0071: Aislamiento Estricto de Clases de Recuperación a 1 Sola Semana y Delimitación Oficial del Ciclo Escolar (2026-2027)

## Estado
Aceptado e Implementado

## Contexto
1. **Queja Operativa de Secretaría (Nayeli):**
   - Al programar una clase de recuperación (RECUPERACIÓN), la clase se replicaba en todas las semanas del mes y en todos los meses del plan del alumno, cuando por regla de negocio una recuperación es únicamente para **una sola semana específica**. En las demás semanas, el alumno debe continuar con su horario normal sin modificaciones.
2. **Presencia Inesperada de Alumnos en 2028 y a Mediados de 2027:**
   - Al navegar a 2028 o a partir de mediados de 2027 (Agosto 2027 en adelante), la agenda mostraba alumnos activos de forma perpetua porque la consulta de clases no tenía límites de corte del ciclo escolar de Vibra Music.

## Decisiones Técnicas

### 1. Aislamiento Estricto de Clases de Recuperación a 1 Semana y 1 Mes
- **Persistencia con Metadatos Temporales:** Se actualizó scheduleMakeupLesson en src/store/app-store.ts y en genda-board.tsx para persistir obligatoriamente:
  - weekIndex: Índice de la semana específica (0 a 4) elegida por Nayeli.
  - month: Mes específico (0 a 11).
  - year: Año específico (ej. 2026).
- **Selector de Semana en Modal de Recuperación (isMakeupModalOpen):**
  - Se agregó una botonera visual para elegir entre las 5 semanas reales del mes actual (Semana 1 a Semana 5).
  - La recuperación se etiqueta como ⚡ Solo Semana X. En las demás semanas del mes, no se muestra y el alumno conserva su horario habitual.
- **Filtrado Reactivo en Agenda:**
  - Si l.isMakeup === true, se valida estrictamente l.year === selectedYear, l.month === selectedMonth y l.weekIndex === safeWeekIndex. Si alguno no coincide, la clase no se renderiza.

### 2. Delimitación Oficial del Ciclo Escolar Vibra Music (2026 - 2027)
- **Año 2028 o posterior:** No existen alumnos matriculados. La agenda se muestra completamente limpia (0 alumnos).
- **Año 2027 (Mediados en adelante - Ago a Dic 2027):** Los contratos anuales iniciados en Agosto 2026 vencen en Julio 2027 (2027-07). A partir de Agosto 2027 (selectedMonth >= 7), no hay clases activas (0 alumnos).
- **Año 2027 (Inicio - Ene a Jul 2027):** Únicamente se muestran los alumnos con planType === Anual. Los planes mensuales y trimestrales de 2026 no se desbordan al 2027.
- **Año 2026 (Ago a Dic 2026):** Todos los alumnos activos se muestran normalmente en sus horarios.
- **Año 2026 (Ene a Jul 2026):** El ciclo oficial de la academia comenzó en Agosto 2026, por lo que los meses previos no muestran horarios.

## Consecuencias
- Las recuperaciones quedan 100% aisladas en la semana asignada; el resto del mes conserva la rutina regular del estudiante.
- Al navegar al 2028 o mediados de 2027, la agenda refleja fielmente el ciclo académico sin mostrar alumnos fantasma ni extensiones artificiales.
- Validación de compilación 
pm run build exitosa con 0 errores.
