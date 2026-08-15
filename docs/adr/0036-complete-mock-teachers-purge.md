# ADR 0036: Purga Integral de Profesores Mock Ficticios en Control Horario y Paneles del Sistema

- **Estado**: Aceptado
- **Fecha**: 2026-08-13
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
- En `/admin/control-horario` aparecían 3 profesores ficticios fijados en el código (`Prof. Elena Márquez`, `Prof. Carlos Ruiz`, `Prof. Ana Torres`) con estados de trabajo simulados ("● TRABAJANDO", "PAUSA").
- Asimismo, en los formularios de matriculación, kiosco docente y servicios de sesión se mantenían fallbacks a nombres hardcodeados.
- Se requirió limpiar todo el mock data de profesores sin alterar la estructura del backend de PostgreSQL.

## Decisiones
1. En `src/routes/admin.control-horario.tsx`:
   - Se eliminaron los arrays estáticos `mockActiveShifts` y los datos ficticios del reporte de nómina `demoData`.
   - Se implementó un estado dinámico limpio: si ningún profesor ha fichado en el Kiosco / Panel Docente, se muestra un mensaje informativo y accesible indicando que la sede está libre.
   - Cuando los profesores reales fichen entrada, aparecerán en vivo en esa pantalla.
2. En `src/routes/teacher.tsx`, `integrated-kiosk-header.tsx`, `students-table.tsx`, `auth.service.ts` y `seeds.ts`:
   - Se reemplazaron todas las referencias fijas a profesores inventados por el usuario autenticado real (`currentUser?.name`) o fallbacks neutros (`Profesor/a Vibra` o `Prof. por Asignar`).

## Consecuencias
- La interfaz de Control Horario queda limpia y lista para operar exclusivamente con los fichajes verídicos de los profesores de la academia.
- Ningún dato inventado genera confusión en secretaría o dirección.
