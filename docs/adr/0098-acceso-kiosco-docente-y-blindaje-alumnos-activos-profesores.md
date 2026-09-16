# ADR 0098: Acceso al Kiosco Docente y Blindaje de Alumnos Activos para Profesores

## Estado
Aprobado (v1.8.7) — 16 de Septiembre, 2026

## Contexto
1. **Redirección No Deseada a `/admin`**:
   Cuando un usuario logueado como administrador o secretaría intentaba abrir los enlaces del portal docente (`/teacher`, `/teacher/agenda`, `/teacher/alumnos`, `/teacher/nomina`), el guard `beforeLoad` de `src/routes/teacher.tsx` ejecutaba:
   `if (activeRole === "super_admin" || activeRole === "staff") throw redirect({ to: "/admin" })`.
   Esto expulsaba al usuario y le impedía inspeccionar o auditar las vistas del profesor.
2. **Visualización de Alumnos Inactivos ("Base de Datos Sucia") en Vistas Docentes**:
   Aunque los alumnos pausados o inactivos eran excluidos de la agenda administrativa (ADR 0095), las rutas del portal docente (`teacher.alumnos.tsx`, `teacher.agenda.tsx`, `teacher.index.tsx`) seguían iterando sobre la totalidad de `adminStudents` y `schedule` sin validar si el alumno tenía `status === 'activo'`.
3. **Falta de Accesos en Selector de Roles**:
   El `RoleSwitcher` solo contenía a "Prof. Jeremy", imposibilitando probar de forma directa la vista del portal como "Prof. Nathaly" o "Prof. Fernando".
4. **Desalineación del Layout Móvil**:
   El menú de navegación inferior del portal docente usaba `grid-cols-3` teniendo 4 elementos en la lista (Kiosco, Agenda, Alumnos, Nómina).

## Decisiones Técnicas
1. **Acceso Flexibilizado en Route Guard (`src/routes/teacher.tsx`)**:
   - Se eliminó el `throw redirect({ to: "/admin" })` para roles `super_admin` y `staff`.
   - Se preservó el estado de sesión sin sobreescribir el `activeRole` del administrador cuando visita la sección docente.
2. **Filtro Estricto de Alumnos Activos (`status === 'activo'`)**:
   - `src/routes/teacher.alumnos.tsx`: Se filtró `adminStudents` únicamente por `s.status === 'activo'`.
   - `src/routes/teacher.agenda.tsx`: Se cruzó el horario con `adminStudents` para ocultar clases pertenecientes a alumnos pausados o inactivos.
   - `src/routes/teacher.index.tsx`: Se filtraron los turnos del Kiosco diario para mostrar exclusivamente alumnos activos.
3. **Ampliación del `RoleSwitcher` (`src/components/role-switcher.tsx`)**:
   - Se añadieron accesos directos para `Prof. Nathaly` (`nathaly@vibramusic.pe`) y `Prof. Fernando` (`fernando@vibramusic.pe`).
4. **Corrección Estética de la Barra Navegación**:
   - Se actualizó el contenedor del navbar en `src/routes/teacher.tsx` a `grid-cols-4`.

## Consecuencias
- Los administradores pueden auditar e inspeccionar las rutas docentes sin ser redirigidos forzosamente a `/admin`.
- Los profesores solo ven alumnos cuyo estado es explícitamente `'activo'`. A medida que administración reactive alumnos 1 a 1, estos aparecerán de forma limpia y reactiva en el kiosco y agenda docente.
- La navegación móvil del portal docente encaja los 4 botones en una sola fila.
