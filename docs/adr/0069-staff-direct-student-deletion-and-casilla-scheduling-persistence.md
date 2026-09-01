# ADR 0069: Habilitación de Eliminación Directa de Alumnos para Secretaría (Nayeli) y Visibilidad Continua de Horarios en Casillas

## Estado
Aceptado e Implementado

## Contexto
1. **Permiso de Eliminación y Retiro de Alumnos:**
   - La secretaria Nayeli no podía eliminar directamente a los alumnos que ya no continúan en la escuela, ya que el sistema forzaba una *Solicitud de Eliminación Protegida* que requería la aprobación de la Dueña (Claudia).
   - Dado que Dirección delega la gestión operativa de alumnos en Secretaría, se solicitó habilitar a Nayeli para poder retirar y eliminar alumnos directamente sin bloqueos de rol.
2. **Registro de Alumnos en las Casillas de la Agenda:**
   - Se reportó que al inscribir alumnos en las casillas o al cambiar de mes, algunas clases no se mostraban o parecían no registrarse.
   - Causa raíz 1: El filtro isible en AgendaBoard ocultaba las clases si el planEndDate del alumno en el seed de pagos terminaba en Agosto (2026-08-31), haciendo que desaparecieran al navegar a Setiembre o meses posteriores.
   - Causa raíz 2: En la selección de alumnos desde la casilla + Añadir, el autocompletado sobreescribía el profesor seleccionado con el profesor previo del alumno, desubicando la casilla.
   - Causa raíz 3: En la vista de tabla diaria, la correspondencia de columnas dependía de un filtro disyuntivo que podía causar discrepancias de visualización.

## Decisiones Técnicas

### 1. Habilitación de Eliminación Directa para Secretaría (students-table.tsx & students.service.ts)
- Se actualizó el botón de eliminación en la tabla de alumnos para permitir que Nayeli (ctiveRole === staff) y la Dueña (super_admin) eliminen directamente a cualquier alumno con ventana de confirmación segura.
- Se agregó una sección dedicada de **Retiro Definitivo / Eliminación** en la ficha lateral del alumno (Sheet), permitiendo tanto **Dar de Baja** (conserva historial) como **Eliminar Definitivamente** (libera horarios).
- Se actualizó ssertRole(userRole, [super_admin, staff]) en src/lib/services/students.service.ts.

### 2. Visibilidad Continua de Clases en Casillas (genda-board.tsx)
- Se eliminó la restricción rígida de meses que ocultaba las clases recurrentes cuando planEndDate era el fin de mes inicial. Las clases semanales se mantienen visibles de forma continua mientras el alumno no esté en estado baja.
- Se corrigió handleSelectStudentForNewLesson para preservar el profesor y sala fijados al hacer clic en + Añadir de una casilla específica.
- Se optimizó el mapeo de columnas en la matriz diaria para asegurar que cada clase se renderice exactamente en la casilla del docente asignado.

## Consecuencias
- Nayeli tiene autonomía total para eliminar alumnos retirados y gestionar la base de datos sin esperas.
- Las clases programadas en las casillas se registran y visualizan de forma inmediata y persistente en todos los meses del ciclo escolar.
- 
pm run build verificado exitosamente con 0 errores.
