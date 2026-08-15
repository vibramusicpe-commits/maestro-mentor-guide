# ADR 0035: Eliminación de Mock Data de Profesores e Importador Universal de Horarios CSV/Excel

- **Estado**: Aceptado
- **Fecha**: 2026-08-13
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
1. **Eliminación de Semillas Mock Data de Invitaciones**:
   - Existían registros antiguos de prueba (`Prof. Jeremy` y `Prof. Fernando`) en las semillas locales (`baseSeeds`) de `invitations.service.ts` con estado pendiente/aceptado.
   - Para que la academia trabaje con datos 100% verídicos y sin confusión, se eliminaron estas semillas de prueba. Solo se conserva la cuenta oficial de la secretaría (`Nayeli`).
2. **Carga e Importación Automatizada de Horarios desde Excel / CSV**:
   - Nayeli trabaja los horarios en Excel, lo cual resulta tedioso y propenso a errores al transcribirlo manualmente.
   - Se diseñó e implementó un importador de `.CSV` inteligente en el panel de agenda (`/admin/agenda` -> `AgendaBoard`).
   - El importador:
     - Permite subir un archivo `.csv` exportado desde Excel o pegar el texto directamente.
     - Acepta separadores por coma (`,`) o punto y coma (`;`).
     - Normaliza automáticamente los días (`Lun, Mar, Mié, Jue, Vie, Sáb`), horas, salas (`Sala 1` a `Sala 4`), profesores, instrumentos y categorías de edad.
     - Ofrece descarga de **Plantilla Oficial `.CSV`** para que Nayeli solo tenga que rellenarla en Excel y cargarla.
     - Valida errores línea por línea antes de aplicar cambios.
     - Ofrece opciones de **Reemplazo Total** o **Anexar al Horario Existente**, además de un botón para **Vaciar Horario**.

## Decisiones
1. En `src/lib/services/invitations.service.ts`:
   - Se depuraron las semillas `inv-profe-jeremy` e `inv-profe-fernando`. Al cargar el panel, se limpian automáticamente del almacenamiento local.
2. En `src/store/app-store.ts`:
   - Se añadieron las acciones `importScheduleFromCSV(newLessons)` y `clearSchedule()`, integradas con la cola de auditoría `syncQueue`.
3. En `src/components/admin/agenda-board.tsx`:
   - Se añadió el botón `📊 Subir Horario (CSV/Excel)` en la barra de controles.
   - Se implementó el modal con descarga de plantilla, previsualización en tiempo real y validación de sintaxis.

## Consecuencias
- La lista de invitaciones queda limpia para el registro de los profesores reales de la academia.
- Nayeli puede importar semanas enteras de horarios creados en Excel en menos de 5 segundos.
