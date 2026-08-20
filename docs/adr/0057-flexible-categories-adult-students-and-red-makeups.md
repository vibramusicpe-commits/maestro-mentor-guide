# ADR 0057: Categorías Flexibles, Registro de Adultos sin Apoderados y Resaltado Rojo de Recuperaciones

## Estado
Aceptado e Implementado

## Contexto y Feedback Operativo (Secretaría - Nayeli)
Durante las pruebas de operación diaria en producción, el equipo de secretaría (Nayeli) identificó tres necesidades críticas de usabilidad para agilizar el flujo de trabajo:
1. **Flexibilidad en Categorías:** Posibilidad de cambiar la categoría de edad (`Infantil`, `Junior`, `Juvenil`, `Adulto`, `Personalizada`) de forma dinámica tanto en la ficha del alumno como directamente en el detalle de la clase en la agenda.
2. **Registro de Alumnos Adultos:** Los alumnos adultos no deben exigir un apoderado ni apellidos de familia obligatorios; el alumno actúa como su propio titular con contacto directo.
3. **Identificación Visual de Recuperaciones:** Las clases de recuperación deben destacarse de forma inequívoca en la agenda con un color rojo vivo (`#EF4444` con texto blanco de alto contraste), diferenciándose claramente de los colores pedagógicos estándar.

## Decisiones de Arquitectura

### 1. Store Zustand (`src/store/app-store.ts`)
- Se implementó `updateLessonCategory(id: string, category: AgeCategory)` para permitir la reasignación instantánea de categorías de una clase.
- Se mejoró `updateStudentDetails(id, updates)` para sincronizar bidireccionalmente el campo `ageCategory` con todas las clases activas del alumno en el horario (`schedule`).

### 2. Módulo de Alumnos (`src/components/admin/students-table.tsx`)
- **Ficha del Alumno (Sheet de Detalles):** Se integró un selector editable de `AgeCategory` que actualiza el perfil y sincroniza la agenda en tiempo real.
- **Modal de Matrícula ("Registrar Nuevo Alumno"):**
  - Se añadió un switch explícito para *Alumno Adulto (Mayor de 18 años)*.
  - Si está activado o la edad es $\ge 18$, el campo de apoderado/familia se vuelve opcional y se asigna el alumno como titular directo.
  - Se agregó un selector manual de categorías para sobreescribir la asignación automática por edad según criterio de secretaría.

### 3. Agenda Didáctica (`src/components/admin/agenda-board.tsx`)
- `categoryStyles.RECUPERACION` actualizado a `bg-[#EF4444] text-white font-black border-[#DC2626]`.
- Se configuró la resolución unificada `isRecup = lesson.isMakeup || lesson.category === "RECUPERACION"` en las 4 vistas de la agenda (Vista Didáctica Excel, Vista Diaria, Vista Rejilla Semanal y Vista Sábados).
- En el Sheet de detalle de la clase se incluyó un selector de categoría interactivo.

## Consecuencias y Validación
- **Cero bloqueos:** Secretaría puede matricular adultos sin tener que inventar datos de apoderados.
- **Trazabilidad:** Cada cambio de categoría emite un toast de confirmación y encola la sincronización en Zustand.
- **Compilación:** `npm run build` ejecutado exitosamente con 0 errores de TypeScript y empaquetado Nitro/Cloudflare completo.
