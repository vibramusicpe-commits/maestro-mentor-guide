# ADR 0095: Blindaje Estricto del Horario Lectivo (Solo Alumnos Activos) y Purgado de Mock Seeds en Agenda

## Estado
Aceptado e Implementado en Producción

## Fecha
2026-09-15

## Contexto
Tras pausar masivamente a los 68 alumnos históricos en la base de datos PostgreSQL de Insforge (ADR 0094), el equipo de Dirección y Marketing (Fabricio) observó que en la cuadrícula de horarios (`/admin/agenda`) todavía aparecían algunos alumnos y celdas ocupadas.

Tras una auditoría exhaustiva del flujo de datos, se identificaron dos causas de raíz complementarias:
1. **Fallo Lógico en la Condición de Filtrado (`if (studentProfile && studentProfile.status !== 'activo')`)**:
   - Dicha condición solo excluía clases si se encontraba un `studentProfile` en la base de datos Y su estado no era `activo`.
   - Si la lección pertenecía a un alumno no registrado en PostgreSQL, a un nombre simulado remanente de prototipado o a un placeholder ("Piano", "Piano Juvenil"), `studentProfile` era `undefined`. Al ser `undefined`, la condición no retornaba `false`, permitiendo que la lección se renderizara en la cuadrícula.
2. **Presencia de 10 Lecciones Semilla Simuladas en `official-seeds.ts`**:
   - En `officialSchedule` existían 10 entradas ficticias creadas durante el desarrollo inicial para probar la Sala A de Jeremy y la Sala B de Fernando:
     - `sch-1-b`, `sch-1-c`, `sch-1-d`, `sch-1-e` (Carlos Daniel Rojas, Rodrigo Silva Castro, Valentina Morales Ramos, Joaquín Vargas Peña — Lunes 16:00).
     - `sch-mie-2`, `sch-mie-3`, `sch-mie-4`, `sch-mie-5` (los mismos 4 nombres — Miércoles 16:00).
     - `sch-8-piano-lun` ("Piano" — Lunes 16:45).
     - `sch-17-piano-juv` ("Piano Juvenil" — Lunes 19:00).
3. **Discrepancia en Paneles Complementarios**:
   - El panel inferior de vacantes (`VacancyAvailabilityPanel`) y el cálculo de clases programadas en `MetricCards` no verificaban el estado `status === 'activo'` del alumno en la base de datos.

## Decisiones Técnicas

### 1. Blindaje Excluyente Estricto en `AgendaBoard` (`src/components/admin/agenda-board.tsx`)
- Se reescribió la regla de oro para el filtrado reactivo de lecciones visibles:
  ```tsx
  // Solo alumnos existentes en base de datos oficial Y con estado 'activo' se muestran en el horario
  const studentProfile = adminStudents.find(
    (st) => isMatchingStudentName(st.name, l.student) || st.name.toLowerCase() === l.student.toLowerCase(),
  );

  // REGLA FUNDAMENTAL DE VIBRA MUSIC:
  // Si el alumno no existe en la base de datos oficial O su estado no es estrictamente "activo"
  // (es decir: está en 'pausa', 'baja', o no está registrado), NUNCA debe figurar en el horario activo.
  if (!studentProfile || studentProfile.status !== "activo") return false;
  ```
- Se actualizaron las funciones dependientes:
  - `active` occupancy: ahora se calcula estrictamente sobre `visible.filter((l) => l.status !== 'cancelada')`.
  - `getSlotCapacityInfo`: verifica que cada lección concurrente pertenezca a un alumno con `status === 'activo'`.
  - `slotLessons`: sincronizado para basarse en `visible.filter`.

### 2. Purgado de las 10 Semillas Ficticias en `src/store/official-seeds.ts`
- Se eliminaron por completo las 10 entradas de prototipo (`sch-1-b` a `sch-1-e`, `sch-mie-2` a `sch-mie-5`, `sch-8-piano-lun` y `sch-17-piano-juv`).
- `officialSchedule` contiene única y exclusivamente las lecciones correspondientes a alumnos reales provenientes del registro administrativo de Vibra Music.

### 3. Sincronización en `VacancyAvailabilityPanel` y `MetricCards`
- En `VacancyAvailabilityPanel`, el cálculo de cupos ocupados (`enrolledCount`) y lista de alumnos por turno se condicionó a lecciones de alumnos con `status === 'activo'`.
- En `MetricCards` del Dashboard principal, `activeLessonsCount` contabiliza únicamente las lecciones de alumnos activos reales.

### 4. Actualización de Caché de Navegadores a `v25` (`src/store/app-store.ts`)
- Se elevó la versión de Zustand `persist` a `cadencia-app-v25`.
- La función de migración purga las versiones anteriores (`cadencia-app-v1` a `cadencia-app-v24`) y sustituye el `schedule` en caché por la versión depurada `initialSchedule`.

## Consecuencias y Verificación
- **Horario 100% Despejado**: Con todos los alumnos históricos en estado `pausa` o `baja` en PostgreSQL, la cuadrícula de clases no muestra a ningún alumno.
- **Reactivación Predecible y Progresiva**: Cuando la administración active a un alumno confirmado 1 a 1 (desde `/admin/alumnos` o el Panel de Depuración 2026), sus lecciones reaparecen inmediatamente en sus franjas correspondientes.
- **Compilación Exitosa**: `npm run build` ejecutado en 1.3s con código de salida `0`.
