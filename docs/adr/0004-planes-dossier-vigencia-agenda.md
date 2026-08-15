# ADR 004: Esquema Tarifario Oficial (Dossier Comunidad Vibra) y Vigencia Temporal en Agenda

## Estado
Aceptado e Implementado

## Contexto
1. La academia Vibra Music formalizó su esquema de inversión y modalidades en el documento oficial *COMUNIDAD VIBRA • DOSSIER COMPLETO*.
2. El sistema anterior presentaba una limitación temporal: al navegar en el calendario interactivo a meses pasados o futuros (ej. Enero o Febrero de 2026), mostraba las 138 clases de Agosto como si fueran recurrentes infinitamente, sin respetar el ciclo de pago mensual contratado.
3. Se requería que la secretaria (Nayeli) pudiera consultar y modificar individualmente el tipo de plan de cada alumno (**Mensual S/ 329**, **Trimestral S/ 289.40**, **Anual S/ 263.20**), su estado de matrícula (**Regular S/ 120** vs **Promo Demo S/ 30**) y el pack de útiles anual (**S/ 67**), con sincronización inmediata a la facturación y la agenda.

## Decisiones de Arquitectura

### 1. Definición de Tipos Oficiales de Planes
Se crearon los tipos `VibraPlanType` y `MatriculaType` con su tabla de precios inmutable en `src/store/admin-seeds.ts`:
- **Mensual**: S/ 329.00 / mes (Tarifa Regular).
- **Trimestral**: S/ 289.40 / mes (12% Descuento · Compromiso de 3 meses).
- **Anual**: S/ 263.20 / mes (20% Descuento · Compromiso de 12 meses).
- **Matrícula Promo Demo**: S/ 30.00 (75% descuento si se inscribe el mismo día de la clase demo).
- **Matrícula Regular**: S/ 120.00.
- **Pack de Útiles Anual**: S/ 67.00 (Método Vibra, Practikid, Partituras).

### 2. Filtrado de Vigencia Temporal en la Agenda
Se enriqueció la entidad `ScheduledLesson` con `year` y `month` (0 a 11).
- El filtro `visible` en `src/components/admin/agenda-board.tsx` ahora compara el año y mes seleccionados en el explorador de meses (`selectedDate`).
- Las 138 clases del ciclo actual pertenecen a **Agosto 2026** (`year: 2026, month: 7`).
- Al navegar a **Enero** u otros meses sin programación activa, la agenda se presenta despejada y lista para nuevas matrículas o renovaciones de alumnos con planes trimestrales o anuales.

### 3. Control Temporal Meticuloso Día por Día (DD/MM/AAAA)
Se agregaron los campos `planStartDate` y `planEndDate` a `AdminStudent` con selección de tipo `date`:
- Al fijar la fecha exacta de inicio, el sistema calcula de forma determinista la fecha exacta de fin según la duración contratada (+1 mes, +3 meses o +12 meses menos 1 día).
- La agenda de clases valida que la fecha consultada se encuentre dentro del rango exacto `[planStartMonth, planEndMonth]` de cada alumno.

### 5. Matriz Diaria de 3 Columnas por Docente (Estilo Excel Oficial)
Se adaptó la vista diaria (Swipe) en [`src/components/admin/agenda-board.tsx`](file:///C:/Users/USER/my%20music%20staff%20backend/src/components/admin/agenda-board.tsx) para estructurar el horario del día en 3 columnas maestras (**PROF. JEREMY**, **PROF. FERNANDO**, **PROF. NATHALY**), manteniendo el orden de las franjas horarias del Excel.
- **Accesibilidad y Contraste**: La columna de franja horaria utiliza fondo salmón claro (`#FCD7D2`) y tipografía en carbón oscuro nítido (`text-slate-950`), eliminando el texto blanco sobre fondo claro para optimizar la legibilidad de secretaría y personas con fatiga visual o TDAH.

### 6. Política y Representación de Clases Personalizadas (S/ 50)
- **Definición**: Modalidad individual (1 a 1) cobrada a S/ 50 por sesión, exenta de costo de matrícula.
- **Incompatibilidad con Créditos de Recuperación**: Por política de la academia, **las clases personalizadas nunca generan créditos de recuperación (`makeupCredits`)** al ser canceladas.
- **Sistema de Puntitos de Categoría de Edad (Multi-Etario)**:
  Dado que una clase personalizada puede ser tomada por alumnos de cualquier rango de edad, el fondo del cuadrante es **Celeste (`#B2EBF2`)** y la categoría etaria del alumno se indica mediante un **puntito discreto en la esquina superior derecha**:
  - 🟢 **Puntito Verde**: Categoría Juvenil (13 a 17 años) — *Ej. Mishel Suarez Cardenas (17 años)*.
  - ⚫ **Puntito Plomo**: Categoría Adulto (18 a + años) — *Ej. Joan Paolo (24 años)*.
  - 🟡 **Puntito Amarillo**: Categoría Junior (7 a 12 años) — *Ej. Mirko Malpartida (9 años)*.
  - 🟣 **Puntito Morado**: Categoría Infantil (5 y 6 años).

## Consecuencias
- **Precisión Operativa**: Control exhaustivo con fecha exacta de inicio y fin de cada alumno.
- **Trazabilidad Contable**: Los cobros y abonos reflejan fielmente el plan del Dossier con auditoría inmutable.
- **Sincronización Total**: Alumnos, Horarios, Finanzas e Historial de Bajas operan bajo una única fuente de verdad reactiva.
- **Facilidad de Lectura**: Secretaría navega el horario con la misma familiaridad visual de su hoja de cálculo original, con doble codificación cromática (Modalidad + Rango de Edad).
