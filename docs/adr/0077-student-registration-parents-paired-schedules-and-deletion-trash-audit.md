# ADR 0077: Registro Integral de Padres, Horarios Pareados Oficiales y Papelera de Auditoría de Alumnos Eliminados

## Estado
Aceptado

## Fecha
2026-09-08

## Contexto
La administración y dirección de Vibra Music School identificaron tres requerimientos operacionales críticos:
1. **Ficha de Alumno y Matrícula Incompleta**:
   - Anteriormente sólo se solicitaba un contacto de 'Familia/Apoderado', lo cual generaba problemas cuando se requería contactar al padre, a la madre o a un apoderado alternativo (abuela, tía, tutor) en casos de emergencia o coordinación de pagos.
   - En alumnos adultos, dichos campos debían ser opcionales, permitiendo que el alumno sea su propio contacto directo.
2. **Organización de Horarios y Modalidades Oficiales**:
   - En el panel de asignación de horario, la selección libre de días permitía combinaciones erróneas que no cumplían las reglas pedagógicas de Vibra Music.
   - La regla oficial predeterminada de Vibra Music establece que las clases regulares (2 veces por semana) se imparten en **días pareados**:
     - **Lunes** se vincula automáticamente con **Miércoles**.
     - **Martes** se vincula automáticamente con **Jueves**.
     - Ambas clases comparten la misma hora y sala recomendada.
   - No obstante, secretaría requería mantener la capacidad de activar un **Modo Personalizado** para situaciones particulares (ej. Miércoles + Viernes, o Lunes + Sábado).
   - Para planes **Intensivos (1 vez por semana / 90 minutos)**, el horario debe sugerir **Viernes** o **Sábados**, y las recuperaciones deben poder ubicarse en cualquier día con vacante disponible.
3. **Pérdida de Información por Eliminaciones Accidentales o Falta de Justificación**:
   - Cuando secretaría o dirección eliminaban alumnos, se utilizaba un diálogo genérico del navegador ('confirm()'), sin registrar el motivo ni permitir restaurar al alumno en caso de error administrativo o regularización de pagos.
   - Se requería una **Papelera de Alumnos Eliminados** permanente en base de datos con justificación categorizada obligatoria y auditoría completa.

## Decisiones

### 1. Extensión del Modelo de Datos de Alumnos (`AdminStudent`)
Se agregaron los siguientes campos al tipo `AdminStudent` en `src/store/admin-seeds.ts`:
- `fatherName?: string`: Nombre completo del padre.
- `fatherPhone?: string`: Teléfono/WhatsApp del padre.
- `motherName?: string`: Nombre completo de la madre.
- `motherPhone?: string`: Teléfono/WhatsApp de la madre.
- `emergencyContact?: { name: string; phone: string; relation: string }`: Contacto de emergencia (abuelo/a, tío/a, tutor).

### 2. Papelera de Alumnos Eliminados (`DeletedStudentLog`)
Se diseñó el modelo de auditoría:
```typescript
export type DeletionReasonCategory =
  | "falta_pago"
  | "error_registro"
  | "prueba_sistema"
  | "retiro_voluntario"
  | "otro";

export interface DeletedStudentLog {
  id: string;
  studentId: string;
  studentName: string;
  instrument: string;
  modality: string;
  family: string;
  phone: string;
  fatherName?: string;
  fatherPhone?: string;
  motherName?: string;
  motherPhone?: string;
  deletedAt: string;
  deletedBy: string;
  reasonCategory: DeletionReasonCategory;
  reasonText: string;
  studentSnapshot: AdminStudent;
}
```
En `src/store/app-store.ts`:
- Se agregaron las acciones:
  - `deleteStudent(id, reasonCategory, reasonText, deletedBy)`: Guarda un snapshot completo en `deletedStudents`, limpia sus clases agendadas y borra al estudiante de la lista activa.
  - `deleteStudents(ids, reasonCategory, reasonText, deletedBy)`: Eliminación masiva con registro individualizado para cada alumno.
  - `restoreDeletedStudent(logId)`: Restaura al alumno intacto a la lista activa y lo retira de la papelera con notificación toast.
- Se elevó la versión de persistencia en localStorage a **23** asegurando hidratación de `deletedStudents`.

### 3. Interfaz de Eliminación con Justificación Obligatoria
- Se eliminaron todos los `confirm()` nativos de JavaScript.
- Se implementó un modal interactivo con selección de categoría:
  - 🔴 Falta de pago / Deudor
  - ⚠️ Error de registro de secretaría
  - 🧪 Prueba técnica / Test del sistema
  - 🚪 Retiro voluntario / Traslado
  - 📝 Otro motivo (especificar)
  - Campo de notas y detalles de auditoría.
- Se agregó el botón **'🗑️ Papelera (N)'** en la barra de herramientas de `/admin/alumnos` con tabla detallada de alumnos archivados, motivo, fecha y botón de **Restaurar Alumno**.

### 4. Fichas de Alumno y Formularios de Registro / Edición
- **`NewStudentDialog`**:
  - Sección 'Datos de los Padres y Contactos':
    - Papá: Nombre y WhatsApp.
    - Mamá: Nombre y WhatsApp.
    - Contacto de Emergencia / Apoderado Adicional: Nombre, Parentesco (Abuela, Abuelo, Tía, Tío, Tutor, etc.) y Teléfono.
    - Si se activa el switch 'Alumno Adulto (Mayor de edad)', los datos de los padres pasan a ser opcionales y se habilita el teléfono directo del alumno.
- **`EditStudentSheet`**:
  - Pestaña de edición completa con sincronización de padres y contacto de emergencia.
- **Drawer de Detalle del Alumno**:
  - Tarjetas diferenciadas para Papá, Mamá y Contacto de Emergencia con enlaces directos para enviar WhatsApp con un solo clic.

### 5. Planificador de Horarios (`ScheduleStudentForm`)
- **Modo Días Pareados (Oficial por Defecto)**:
  - Botones de acceso rápido: `[ 🎹 Par Lunes + Miércoles ]` y `[ 🎸 Par Martes + Jueves ]`.
  - Al cambiar el Día 1 a Lunes, Día 2 pasa a Miércoles; Martes a Jueves; Viernes a Sábado.
  - Cambiar hora o sala en Día 1 sincroniza automáticamente el Día 2.
- **Modo Personalizado**:
  - Permite la libre combinación de cualquier día de la semana (ej. Mié + Vie, Lun + Sáb).
  - Si en modo pareado se altera el Día 2 directamente, el sistema conmuta a modo personalizado notificando a la secretaria.
- **Intensivos y Recuperaciones**:
  - Botones directos sugeridos para Viernes y Sábados (4 clases mensuales de 90 minutos).
  - Categorías oficiales con colores del Excel de Nayeli preservados estrictamente.

## Consecuencias
- Cero pérdida de datos: cada alumno eliminado cuenta con respaldo restaurable y trazabilidad completa del porqué y quién lo retiró.
- Matrículas de menores cuentan con la información de ambos progenitores y contacto de emergencia.
- El proceso de asignación de horarios garantiza el cumplimiento de las franjas oficiales de Vibra Music sin cruces y con sincronización automática de días pareados.
