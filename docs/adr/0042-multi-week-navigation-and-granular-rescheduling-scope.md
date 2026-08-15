# 0042. Multi-Week Navigation and Granular Rescheduling Scope

## Context
In music academy management, an academic month consists of 4 billing weeks. Classes operate with distinct scheduling scopes:
1. **Recurring Monthly Schedule**: Classes repeat automatically across all 4 weeks of the month.
2. **Single-Week Exception (Suplencias / Permisos temporales)**: A student might need to change a single class slot (e.g. Wednesday to Friday) only for Week 2, without permanently altering Weeks 1, 3, and 4.
3. **Session Identification for ADHD / Cognitive Accessibility**: In 2x-per-week modalities (Regular Plan with 8 lessons), staff and teachers need clear visual indicators on each card identifying whether a scheduled lesson corresponds to **"1ra Clase Semanal"** or **"2da Clase Semanal"** to avoid manual deduction.

## Decision
1. **Interactive Multi-Week Navigator**:
   - Added a weekly selector `[ < ] Semana X de 4 [ > ]` beside the month selector in `AgendaBoard` (`agenda-board.tsx`).
   - Dynamically calculates and renders the exact dates of the month in the column headers for Monday through Saturday.

2. **Granular Rescheduling Scope (`only-this-week` vs `all`)**:
   - When editing/moving a class in `AgendaBoard`, staff are presented with two options:
     - ⚡ **Solo esta semana**: Applies the move specifically to the active week index (`weekIndex: currentWeekIndex`), keeping other weeks unchanged.
     - 🗓️ **Todo el mes**: Applies the move to all 4 weeks of the month (`weekIndex: undefined`).

3. **Cognitive Session Indicator (`1ra Clase` / `2da Clase`)**:
   - Every scheduled lesson card in both the Weekly Grid and the Daily Swipe view now features an explicit badge (`1ra Clase` or `2da Clase`).
   - Integrated into `ScheduleStudentForm` (`students-table.tsx`) to tag sessions 1 and 2 upon student enrollment.

## Consequences
- **Positive**:
  - Staff (including members with ADHD) can immediately identify the exact class session without guessing.
  - Granular control over single-week substitutions vs permanent schedule alterations.
  - Fully backward compatible with existing schedule data.
