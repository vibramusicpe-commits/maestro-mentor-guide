# Log 2026-10-12 — Puntito de Categoría en Clases de Recuperación (Panel de Horarios)

## Objetivo
En `/admin/agenda` (Panel de Horarios), las clases de recuperación se pintan de rojo y se perdía la categoría de edad del alumno. Se pidió **agregar solo un puntito de categoría en la esquina superior derecha** de cada recuperación, sin cambiar nada más del diseño. Alcance confirmado: las 4 vistas del panel admin.

## Cambios
- **Nuevo** `src/lib/lesson-category-visual.ts`: paleta oficial del puntito (`CATEGORY_DOT_CLASSES`) y resolvedor puro `resolveRecoveryCategoryVisual(lesson, students)` → `{ isRecup, ageCategory, dotClass }`.
  - Paleta: Estimulación `#EC407A` · Infantil `#7C4DFF` · Junior `#FBC02D` · Juvenil `#4CAF50` · Master/Adulto `#546E7A`.
  - Orden de resolución: perfil activo (`ageCategory`) → `lesson.category` real → fallbacks históricos por nombre → Junior.
- `src/components/admin/agenda-board.tsx`: se reemplazaron las **4 copias divergentes** de `dotColor`/`dotLabel` (Vista Excel, Por Día, Rejilla Semanal, Rejilla de Sábado) por el resolvedor compartido, y el puntito ahora se dibuja también en recuperaciones (`isRecup || category === "PERSONALIZADA"`), absoluto `top-0.5 right-0.5 z-10`, `pointer-events-none`, `aria-hidden`.
  - Reserva de espacio (`pr-2.5` / `mr-2.5`) para no tapar el chip de sala ni las siglas `1ra/2da` en las vistas de tarjeta.
  - El `title` de la píldora roja ahora agrega `· CATEGORÍA …` (accesibilidad para daltonismo, sin cambio visual).
- **Bug corregido de paso**: `MASTER`/`ADULTO` ya no cae en el fallback amarillo de Junior (categoría que no puede compartir sala con Junior según ADR-0121).

## Verificación ejecutada
- `node scratch/test-category-dot.ts` → **45 aserciones aprobadas** (paleta, alias ADULTO→Master, categoría desde la lección, fallbacks heredados, blindaje ADR-0155 de plantilla recurrente, prioridad de homónimo activo ADR-0107).
- `node node_modules/typescript/bin/tsc --noEmit` → **0 errores en las 47 líneas nuevas**; los 30 errores de `agenda-board.tsx` y el resto del repo son preexistentes (verificado por intersección con `git diff -U0`).
- `eslint` → sin hallazgos nuevos (solo ruido preexistente de CRLF/`prettier` y avisos ya existentes).
- `npm run build` → build de producción exitoso (exit 0).

## Verificación contra Insforge PostgreSQL (PRODUCCIÓN · SOLO LECTURA)
Herramienta creada: `scratch/db-readonly.mjs` — abre la sesión con `SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY`, bloquea escrituras/DDL por regex, `statement_timeout` 20s y lee la URL de `INSFORGE_DB_URL` (nunca se escribe en el repositorio).

| Comprobación | Resultado |
|---|---|
| Volumen | `students` 140 · activos **49** · `families` 149 · `invoices` 72 · `attendance_logs` 271 · `lessons` **0** |
| Alumnos activos **sin** `ageCategory` | **0** (todos los activos tienen categoría) |
| Alumnos con horario (`emergency_contact.scheduleLessons`) | 64, **todos** con `ageCategory` (25 JUNIOR, 13 JUVENIL, 9 MASTER, 2 INFANTIL + inactivos) |
| Recuperaciones programadas | **114** recuperaciones en **42** alumnos |
| Fuente del horario | `lessons` está vacía → la agenda se sirve de `students.emergency_contact.scheduleLessons` (confirma ADR-0118.4) |

**Ejemplos reales de la captura y color que tomará el puntito:**
- `Santiago Mathias` → JUNIOR (amarillo) · `Alonso` → JUNIOR (amarillo) · `Aaron` → JUNIOR (amarillo)
- `Andrea Fernanda` → JUVENIL (verde) · `Alejandro Huarca` → JUVENIL (verde) · `Fernanda Sofía Fajardo Condo` → JUVENIL (verde)
- `Ethan Paolo Jara Saldarriaga` → INFANTIL (morado)

**Homónimos detectados (por qué importa ADR-0107):** existen 3 registros `Andrea Fernanda` (1 activo + 2 en `baja`) y duplicados históricos como `Valladolid Sanchez, Santiago Mathias` (`pausa`), `Pineda Espinoza, Alonso` (`baja`). `resolveRecoveryCategoryVisual` usa `findStudentProfileByName`, que prioriza `activo`, por lo que el puntito toma la categoría del perfil activo.

**Conclusión:** la "Limitación Conocida" del ADR-0169 (perfil sin `ageCategory`) **no aplica a los datos actuales de producción** (0 activos sin categoría): los 114 puntitos de recuperación resolverán su categoría real desde el perfil.
**Garantía:** cero escrituras — la sesión SQL es de solo lectura a nivel de PostgreSQL y no se ejecutó ninguna sentencia de mutación.

## Pendiente
- Verificación visual humana en el entorno donde la app renderice (dev local bloqueado por causa ajena, ver abajo): semana 3 de 5 · Octubre 2026 (Lunes 12 / Miércoles 14), en las 4 vistas.

## Bloqueo Local Detectado (Ajeno a este Cambio)
- `npm run dev` levanta el servidor en `http://localhost:5173/` pero **todas** las rutas (`/`, `/admin/agenda`, `/teacher`, `/admin/alumnos`) responden **500** con:
  `Error: [module runner] Dynamic access of "import.meta.env" is not supported. Please, use "import.meta.env.VITE_UPSTASH_REDIS_REST_URL" instead.` → `createSessionStore` (`src/lib/session-store.ts`).
- Es preexistente e independiente del puntito: la ruta raíz `/` falla igual y la traza no toca ningún archivo modificado. Mientras no se corrija ese acceso dinámico a `import.meta.env`, la verificación visual debe hacerse en el entorno donde la app ya renderiza (deploy/Cloudflare Pages).
- Verificación equivalente ejecutada aquí: el bundle compilado `agenda-board-*.js` contiene exactamente **4** ocurrencias del nuevo markup (`pointer-events-none absolute top-0.5 right-0.5 z-10`) y la paleta (`#FBC02D`, `#4CAF50`, `#7C4DFF`, `#EC407A`, `#546E7A`).

## Referencias
- ADR-0169: `docs/adr/0169-puntito-categoria-recuperaciones-panel-horarios.md`
- ADR-0155 (blindaje de categoría de recuperación), ADR-0119.3 (fuente única de verdad), ADR-0121 (restricciones de sala).
