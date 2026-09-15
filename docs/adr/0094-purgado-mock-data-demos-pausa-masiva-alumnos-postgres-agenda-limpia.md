# ADR 0094: Purgado Total de Mock Data en Demos, Pausa Masiva en PostgreSQL y Limpieza del Horario Activo

## Estado
Aceptado e Implementado en Producción

## Fecha
2026-09-15

## Contexto
Durante la verificación en el entorno de producción de Vibra Music Staff, se identificaron dos requerimientos indispensables para la operación administrativa real del equipo:
1. **Existencia de Mock Data en Clases Demo**: En `src/routes/admin.demos.tsx` se había incluido una semilla estática (`INITIAL_DEMOS`) con nombres simulados ("Luciana Morales", "Thiago Ramos", etc.) como fallback cuando la tabla `demo_requests` de PostgreSQL estaba vacía. La política del negocio prohíbe terminantemente datos simulados en módulos funcionales; todo debe conectarse en tiempo real a la base de datos de PostgreSQL en Insforge.
2. **Alumnos Antiguos Aún Visibles en el Horario de Clases**: A pesar de tener habilitada la herramienta de depuración en la interfaz, la base de datos de PostgreSQL aún conservaba a 68 alumnos históricos con `status = 'activo'`. Además, la cuadrícula didáctica semanal (`AgendaBoard`) mostraba a dichos alumnos porque únicamente excluía a los que tenían `status === 'baja'`. El equipo requería que **todos los alumnos históricos pasaran a estado `pausa` de inmediato en PostgreSQL** y que el horario semanal quedara despejado, para que Secretaría y Dirección vayan activando y regularizando a los alumnos reales 1 a 1 de forma manual o vía Excel limpio.

## Decisiones Técnicas

### 1. Actualización Directa en PostgreSQL Insforge (`public.students`)
- Se ejecutó una mutación HTTP `PATCH` autenticada contra el endpoint PostgREST:
  `PATCH /students?status=eq.activo` con payload `{ "status": "pausa" }`.
- **Auditoría de Registros**:
  - 68 alumnos activos antiguos pasaron inmediatamente a estado `pausa`.
  - Los 15 alumnos en estado `baja` se mantuvieron en `baja`.
  - Total actual en PostgreSQL: 68 en `pausa`, 15 en `baja`, 0 en `activo`.
  - **Preservación Total**: No se eliminó ningún registro; las familias, historiales de pagos, notas y asistencias previas permanecen íntegras.

### 2. Condicionamiento Estricto de la Agenda Semanal (`src/components/admin/agenda-board.tsx`)
- Se modificó la regla de filtrado reactivo de lecciones visibles (`visible`):
  ```tsx
  // 1. Filtrado por estado de alumno (solo alumnos activos se muestran en el horario)
  const studentProfile = adminStudents.find(
    (st) => isMatchingStudentName(st.name, l.student) || st.name.toLowerCase() === l.student.toLowerCase(),
  );
  ...
  // 1. Alumnos en pausa o de baja nunca se muestran en la agenda lectiva activa
  if (studentProfile && studentProfile.status !== "activo") return false;
  ```
- **Efecto Inmediato**: Al encontrarse todos los alumnos en estado `pausa`, la cuadrícula de clases no dibuja celdas ocupadas de alumnos desactualizados.
- **Activación Dinámica**: Apenas la administración activa a un alumno confirmado (vía `StudentCleanupPanel` 1 a 1 o importación de Excel limpio), su estado cambia a `activo` y sus lecciones reaparecen al instante en la sala y hora correspondientes.

### 3. Purgado Absoluto de Mock Data en Clases Demo (`src/routes/admin.demos.tsx`)
- Se eliminó por completo la constante `INITIAL_DEMOS` del código fuente.
- El estado inicial de `demos` se inicializa como arreglo vacío `[]`.
- La función `fetchLeads()` consulta directamente `demo_requests` de PostgreSQL mediante `getLeadsFromDB(activeRole)`.
- Si la tabla no contiene registros, se despliega una tarjeta de estado vacío informativo que invita a registrar el primer prospecto mediante el modal `+ Agendar Clase Demo`.
- Cada demo registrada se inserta de forma persistente en PostgreSQL con `createLeadInDB`.

### 4. Migración de Caché Local del Navegador a `v24` (`src/store/app-store.ts`)
- Se incrementó la versión de persistencia de `localStorage` a `cadencia-app-v24`.
- La función `migrate()` purga automáticamente las versiones anteriores (`cadencia-app-v1` a `cadencia-app-v23`) y garantiza que cualquier alumno en caché local cuyo estado no sea `baja` se normalice a `pausa`.
- En `src/store/admin-seeds.ts`, los arreglos de inicialización (`baseControlStudents`, `missingAdminStudents`, `missingScheduleStudents`) fueron actualizados para que el estado por defecto sea `pausa`.

## Consecuencias y Verificación
- **Cero Mock Data**: La sección de demos refleja exactamente la realidad de PostgreSQL sin interferencias de datos simulados.
- **Pizarra de Horarios Despejada**: El equipo puede iniciar el proceso de validación y reactivación sin confusión visual de cupos ocupados ficticiamente.
- **Compilación Exitosa**: `npm run build` ejecutado exitosamente con código de salida `0`.
- **Despliegue a Producción**: Sincronizado en la rama `main` de GitHub con el commit `6429e9f`.
