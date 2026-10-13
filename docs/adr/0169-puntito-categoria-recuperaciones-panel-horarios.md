# ADR-0169: Puntito de Categoría de Edad en Clases de Recuperación del Panel de Horarios

## Estado
Aprobado e Implementado

## Fecha
2026-10-12

## Contexto
En el Panel de Horarios Administrativo (`/admin/agenda`), las clases de recuperación se pintan con el estilo completo de recuperación (`categoryStyles.RECUPERACION`: fondo `#EF4444`, texto blanco). El rojo correcto y solicitado oculta, sin embargo, la **categoría de edad** del alumno, que es información operativa necesaria para validar las restricciones de convivencia de sala (ADR-0121: Junior no comparte sala con Master, Infantil y Estimulación son salas exclusivas, etc.).

### Causa Raíz
1. **La fila roja no guarda la categoría**: `scheduleMakeupLesson` (`src/store/app-store.ts:2984`) persiste `category: data.category || "RECUPERACION"`, y el alta por "Añadir evento → Recuperación" (`agenda-board.tsx`) envía literalmente `"RECUPERACION"`. La categoría real del alumno no vive en la lección de recuperación.
2. **Lógica de puntito duplicada 4 veces con paletas divergentes**: el puntito indicador solo existía para clases Personalizadas y estaba reimplementado en las 4 vistas del panel (Vista Excel, Por Día, Rejilla Semanal y Rejilla de Sábado), con hexes distintos por vista (`#795548 / #9C27B0 / #FFEB3B` en la vista semanal contra `#757575 / #7C4DFF / #FBC02D` en las otras), violando la regla de fuente única de ADR-0119.3.
3. **Bug latente detectado**: ese mapeo no contemplaba la categoría `MASTER`, por lo que un alumno de 18+ caía en el fallback amarillo de `JUNIOR` — precisamente la categoría con la que Master **no puede** compartir sala.

## Decisiones Técnicas

### 1. Puntito indicador en la esquina superior derecha
Toda píldora de recuperación (pill rojo) muestra un **puntito de 8px en la esquina superior derecha** cuyo color identifica la categoría de edad real del alumno. Nada más cambia: el fondo rojo, el chip `🔴 Recuperación`, la tipografía, los badges de asistencia, la sala y el layout permanecen idénticos. Alcance: las 4 vistas del panel admin (Excel pareado/día a día, Por Día, Rejilla Semanal y Rejilla de Sábado).

### 2. Fuente única de verdad: `src/lib/lesson-category-visual.ts`
Módulo puro (sin JSX, sin store, sin React) que centraliza la paleta y el resolvedor:

```ts
export const CATEGORY_DOT_CLASSES: Record<string, string> = {
  ESTIMULACION: "bg-[#EC407A]", // rosa
  INFANTIL:     "bg-[#7C4DFF]", // morado
  JUNIOR:       "bg-[#FBC02D]", // amarillo
  JUVENIL:      "bg-[#4CAF50]", // verde
  MASTER:       "bg-[#546E7A]", // plomo (mismo tono que la leyenda MASTER)
  ADULTO:       "bg-[#546E7A]", // alias de compatibilidad SQL
};

resolveRecoveryCategoryVisual(lesson, students) → { isRecup, ageCategory, dotClass }
```

Orden de resolución de la categoría (fijo):
1. `ageCategory` del perfil resuelto con `findStudentProfileByName` (prioriza `status: "activo"`, ADR-0107) normalizado con `normalizeCategory` (ADULTO → MASTER).
2. `lesson.category` cuando es una categoría real (cubre las recuperaciones creadas desde el Kardex, que sí envían la categoría acordada).
3. Fallbacks heredados por nombre (perfiles históricos sin `ageCategory`), preservados verbatim para no alterar lo que ya se veía.
4. `JUNIOR`.

### 3. Blindaje ADR-0155 intacto
`isRecup` conserva exactamente la semántica blindada: `Boolean(lesson.isMakeup || (lesson.dateStr && lesson.category === "RECUPERACION"))`. Una plantilla semanal recurrente (sin `dateStr` y sin `isMakeup`) **jamás** se considera recuperación aunque arrastre un residuo `category: "RECUPERACION"`, por lo que tampoco recibe el puntito.

### 4. Detalles de render (una sola píldora, un solo puntito)
- El puntito es `pointer-events-none` + `aria-hidden`, de modo que el click sobre la píldora sigue abriendo el modal de clase y no se agregan elementos interactivos.
- En las vistas de tarjeta (Por Día, Semanal y Sábado) se reserva `pr-2.5` / `mr-2.5` en el cluster derecho cuando la clase es recuperación, para que el puntito no tape el chip de sala (`Sala B`) ni las siglas `1ra / 2da`.
- Si una recuperación además es Personalizada, se dibuja **un solo** puntito (el de recuperación), sin solapamientos ni pérdida de información: ambos resolvían la misma categoría del alumno.
- La categoría también queda legible como texto (daltonismo) en el `title` de la píldora: `CLASE DE RECUPERACIÓN (ROJO) · CATEGORÍA JUNIOR (7 a 12)`, sin alterar la apariencia.

### 5. Efecto lateral intencional
Al unificar el resolvedor, el puntito de las clases **Personalizadas** en la Rejilla Semanal abandona su paleta divergente y adopta la oficial de la leyenda, y Master deja de verse amarillo en toda la agenda. Es un cambio estrictamente cromático del puntito existente, no del layout.

## Archivos Modificados
- **Nuevo**: `src/lib/lesson-category-visual.ts` (paleta + resolvedor puro).
- `src/components/admin/agenda-board.tsx` (4 sitios de render: Vista Excel, Por Día, Rejilla Semanal y Rejilla de Sábado).
- **Nuevo**: `scratch/test-category-dot.ts` (verificación en tiempo de ejecución con Node).

## Sin Cambios (Deliberado)
- No se modifica `scheduleMakeupLesson` ni el alta de recuperaciones: la categoría **no** se persiste en la lección (evita divergencias con ADR-001.3, PostgreSQL como única fuente de verdad).
- No se toca el Kardex, la facturación, la sincronización, los filtros, la leyenda ni el Kiosco Docente.
- Cero escrituras en PostgreSQL y cero cambios de esquema.

## Verificación
- `node scratch/test-category-dot.ts` → 45 aserciones aprobadas (Junior/Juvenil/Infantil/Estimulación/Master, alias ADULTO, categoría desde la lección, fallbacks heredados, blindaje ADR-0155, prioridad de homónimo activo).
- `tsc --noEmit`: **0 errores nuevos** (los 30 errores preexistentes de `agenda-board.tsx` y los ~900 del repo no recaen en ninguna de las 47 líneas nuevas).
- `eslint`: sin hallazgos nuevos fuera del ruido preexistente de CRLF/`prettier` y avisos ya existentes.
- `npm run build`: build de producción exitoso (exit 0).

## Limitación Conocida
Si un perfil activo no tuviera `ageCategory` en PostgreSQL y su recuperación se hubiera creado por el flujo "Añadir evento" (que guarda `category: "RECUPERACION"`), el puntito cae al fallback por nombre o a amarillo Junior. La corrección de fondo (derivar `ageCategory` de `birthdate` durante la hidratación) queda como trabajo futuro y fuera del alcance de este ADR.

**Medición en producción (2026-10-12, solo lectura):** `students` 140 · activos **49** · activos **sin** `ageCategory` = **0** · alumnos con horario 64, todos con `ageCategory` · **114 recuperaciones en 42 alumnos**. Es decir, la limitación **no afecta a los datos actuales**: todos los puntitos resolverán la categoría real desde el perfil.

## Consecuencias
- Secretaría y dirección identifican de un vistazo la categoría de cada recuperación programada y pueden validar las restricciones de sala (ADR-0121) sin abrir la ficha del alumno.
- Desaparece la cuarta copia divergente de la lógica de puntito; cualquier ajuste futuro de paleta o resolución se hace en un solo archivo.
