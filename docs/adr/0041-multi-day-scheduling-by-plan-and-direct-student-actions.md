# 0041. Multi-Day Scheduling by Plan and Direct Student Actions

## Context
In Vibra Music, student subscriptions operate under two official modalities:
1. **Regular**: 8 lessons per month, requiring 2 class days per week (45 min each).
2. **Intensivo**: 4 lessons per month, requiring 1 class day per week (90 min each).

Previously, scheduling a student from the directory required setting a single day manually or navigating back and forth across multiple views, which slowed down operational onboarding for Nayeli. Additionally, there was no way to quickly record operational health, behavioral, or achievement notes (alerts) directly from a student record to notify the administrative team on the Dashboard.

## Decision
1. **Direct Schedule Action (`+ Horario`) in Students Directory**:
   - Integrated a modal form (`ScheduleStudentForm`) directly into `students-table.tsx`.
   - The form detects the student's modality:
     - For **Regular (2x week)**: prompts for Day 1 (Time + Room) and Day 2 (Time + Room) simultaneously.
     - For **Intensivo (1x week)**: prompts for the single weekly slot.
   - On save, both classes are registered in `schedule` (`app-store.ts`) and immediately displayed in the interactive `AgendaBoard`.

2. **Direct Student Alerts & Incidents (`Alerta`)**:
   - Added an `Alerta` button on each row in `students-table.tsx`.
   - Allows logging student notes across 5 categories: Health/Injuries, Behavior, Special Achievements, Family Coordination, and Other.
   - Automatically populates the **Dashboard Alerts** panel (`alerts-panel.tsx`) with instant resolution (`✓ Listo`).

3. **Official Color Coding by Age Category**:
   - Formatted student representation to `Name (CATEGORY)` using the official colors:
     - 🟡 Junior (7-12)
     - 🟢 Juvenil (13-17)
     - ⚪ Adulto (18+)
     - 🟣 Infantil (5-6)
     - 🩵 Personalizadas
   - Synchronized across the Admin Student Directory and the Teacher's Kiosk (`/teacher/alumnos`).

## Consequences
- **Positive**:
  - Scheduling multi-day plans is now done in 1 single step.
  - Teachers and administrative staff share instant operational incident visibility.
  - Zero SQL schema modifications required; fully supported by existing state architecture.
