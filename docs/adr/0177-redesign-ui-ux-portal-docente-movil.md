# ADR-0177: Rediseño UI/UX Portal Docente Móvil (390 px)

**Fecha:** 2026-10-22  
**Estado:** Aprobado  
**Autores:** Equipo Vibra (Open Code + Antigravity)

---

## Contexto

El portal docente (`/teacher`) presentaba los siguientes problemas en móvil (390×844 px):

1. Las pestañas montaban todos los paneles a la vez (sin `data-[state=inactive]:hidden`), causando scroll innecesario.
2. Las notas del docente estaban mezcladas con el Kiosco de asistencia.
3. El selector de docente era visible para todos los roles, incluyendo los propios docentes.
4. La cabecera del Kiosco duplicaba el nombre del docente y la sede.
5. El botón "Salir" no tenía confirmación y estaba junto al botón "Pausa".
6. Etiquetas BETA aparecían en cada bloque de piloto.
7. Texto con tamaños text-[9px], text-[10px], text-[11px]; botones con altura < 44 px.
8. La tira de fechas mostraba un rótulo redundante.
9. El selector de semanas usaba w.dateRangeLabel (propiedad inexistente) en lugar de w.startDayNum/w.endDayNum.

---

## Decisiones

### 1. Fix paneles de pestañas (tabs.tsx)
Añadir data-[state=inactive]:hidden al TabsContent. Paneles siguen montados pero ocultos cuando inactivos.

### 2. Navegación 5 pestañas en /teacher
Kiosco | Agenda | Alumnos | Notas | Nómina con grid-cols-5, altura 48 px, etiquetas sin truncar.

### 3. Página /teacher/notas con segmentado v2
- Segmentado [A la familia] [Interna] solo si el docente es piloto.
- Un formulario siempre visible; historial en details colapsado.
- Fallback LessonNotes para no-piloto.

### 4. Helpers puros en src/lib/teacher-portal.ts
resolveTeacherClean, filterTeacherScheduleLessons, resolveTeacherStudentList, AUDIT_TEACHER_STORAGE_KEY.

### 5. Hooks compartidos
useTeacherIdentity y useTeacherPilotAccess. Reutilizados por Kiosco, Notas y Agenda.

### 6. integrated-kiosk-header.tsx compacto
Sin nombre/sede duplicados. Cronómetro + Pausa + Salir en una fila. Salir abre AlertDialog.

### 7. Selector de docente solo a Dirección
isDirector = super_admin | staff | admin. Docentes no ven el select de Prof. Fernando/Nathaly/Jeremy.

### 8. Chip "Piloto" único
Un solo Badge naranja "Piloto" en la cabecera, sin etiqueta BETA por bloque.

### 9. Tira de días con flechas ‹ ›
Navegar por semanas con botones flecha. Selector compacto mes/semana en una fila.
Bug corregido: w.dateRangeLabel -> w.startDayNum-w.endDayNum.

### 10. ClassLog en Sheet inferior
Registro de clase en Sheet side=bottom, abierto desde botón de tarjeta. Elimina sección fija al final.

### 11. Tipografía y táctiles normalizados
text-[9px]/[10px]/[11px] -> text-xs (12 px). Botones a min-h-[44px]. Naranja solo para acción principal.

---

## Archivos modificados

- src/components/ui/tabs.tsx: Fix data-[state=inactive]:hidden
- src/routes/teacher.tsx: Nav 5 pestañas, chip Piloto único
- src/routes/teacher.index.tsx: Kiosco reescrito
- src/routes/teacher.notas.tsx: Nueva página Notas v2 + fallback
- src/routes/teacher.agenda.tsx: useTeacherIdentity, selector solo Dirección
- src/components/teacher/integrated-kiosk-header.tsx: Compacto, AlertDialog Salir
- src/lib/teacher-portal.ts: Helpers puros
- src/hooks/use-teacher-identity.ts: Hook identidad
- src/hooks/use-teacher-pilot-access.ts: Hook gate piloto
- src/components/teacher/family-note-form.tsx: Historial en acordeón
- src/components/teacher/internal-note-form.tsx: Historial en acordeón
- src/components/teacher/class-log.tsx: Textos normalizados, acción 48 px
- src/routes/teacher.alumnos.tsx: Textos normalizados, táctiles 44 px
- src/routes/teacher.nomina.tsx: Textos normalizados

---

## Criterio de aceptación

- 390x844: Primera pantalla con cabecera, tira de días y próxima clase sin scroll.
- npm run build verde (✓ built in 2.24 s).
- Rutas /teacher, /teacher/notas, /teacher/agenda, /teacher/alumnos, /teacher/nomina -> 200.
- Selector de docente oculto cuando activeRole === teacher.
- Un solo chip "Piloto" visible en pantalla.

---

## Consecuencias

- Docentes piloto usan flujo v2 de notas.
- Docentes no-piloto ven fallback LessonNotes.
- ClassLog sigue accesible desde botón de tarjeta (no desaparece, se reubica).
- communicado_general no se implementa en piloto hasta moderar via family_notes scope:academy (propuesta pendiente).