# 0044. Batch and Individual Student Deletion Controls

## Context
In the Director / Owner view of the Students Directory (`/admin/alumnos`), while a two-step full wipe exists for master resets (`VACIAR ALUMNOS VIBRA`), the director needed fine-grained management to:
1. Delete individual student records directly without opening full management forms.
2. Select multiple students via checkboxes and perform batch deletions in a single action.

## Decision
1. **Multi-Selection Checkboxes**:
   - Added a master checkbox in the table header to select/deselect all currently filtered students.
   - Added individual row checkboxes with active row highlight state (`bg-primary/5`).

2. **Cascade Schedule Cleanup on Student Deletion**:
   - When deleting an individual student or batch deleting selected students, all associated scheduled lesson blocks (`s.schedule`) across all rooms, days, and weeks are **automatically purged in cascade**, instantly freeing up room slots and teacher schedules.

3. **Batch Delete Action (`Eliminar Seleccionados (N)`)**:
   - When one or more students are checked, a prominent red button appears on the actions toolbar: `🗑️ Eliminar Seleccionados (N)`.
   - Prompts for explicit confirmation before removing the selected IDs via `deleteStudents(ids)`.

3. **Individual Row Delete Icon**:
   - Added an individual trash icon (`Trash2`) on each row under the Actions column for rapid 1-click single-student removal with confirmation toast.

## Consequences
- **Positive**:
  - The Director has complete operational control to remove 1, several, or all students seamlessly.
  - Zero performance overhead; state updates optimistically and syncs with the central store.
