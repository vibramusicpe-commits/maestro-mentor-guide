# 📋 Memorando de Auditoría y Plan de Continuidad — Vibra Music Staff
**Fecha de corte:** Martes, 06 de Octubre de 2026 (Cierre de Jornada Nocturna)  
**Objetivo:** Preservación de datos críticos de producción, explicación matemática de la causa raíz de Planes Intensivos (90m vs 45m), y hoja de ruta inmediata para retomar mañana al abrir la escuela.

---

## 🛑 1. ADVERTENCIA URGENTE DE PRODUCCIÓN: STOP & VERIFY

> [!CAUTION]
> **NO ELIMINAR NI DESACTIVAR AL ALUMNO "EITAN ANTON CHAPI" EN PRODUCCIÓN.**  
> Su ficha, asistencias históricas y recibo están 100% íntegros en PostgreSQL. El error visual de 45 minutos **no está en los datos del alumno**, sino en una función de renderizado del Kardex que ya fue localizada quirúrgicamente.

### Estado Real de Eitan en PostgreSQL (Auditado con Insforge MCP):
- **UUID Activo Oficial**: `482dd79d-630e-41dd-91d8-4730e73651d8`
- **Nombre en BD**: `"EITAN"` (Apoderado: Anthony Anton Rodriguez / Familia: Familia ANTON CHAPI)
- **Modalidad Contractual**: `"Intensivo (4 clases / 90 min)"` · Cuota: **4 sesiones mensuales de 90 min**
- **Horario Físico Agendado**: **Sábados 09:00 a 10:30** con **Prof. Fernando en Sala B (Piano)**
  - Bloque 1: `09:00 - 09:45` (Sesión 1)
  - Bloque 2: `09:45 - 10:30` (Sesión 2)
- **Asistencias Evaluadas Históricas (attendance_logs)**:
  1. `2026-09-12`: **Presente 🟢** (Asistió a su primera clase)
  2. `2026-09-26`: **Presente 🟢** (Clase recuperada / adelantada)
- **Facturación & Recibo**: Recibo pagado por **S/ 261** (Plan Intensivo mensual exonerado de matrícula).

*Si se elimina o da de baja a Eitan en la interfaz, se perderán sus registros de auditoría de pago y asistencias en sala.*

---

## 🔬 2. Causa Raíz Descubierta: ¿Por qué marcaba 45 minutos en Kardex?

Durante la auditoría de código se descubrió **el origen exacto** del problema reportado tanto para **Benjamin** como para **Eitan**:

1. **El Bug de Código en `student-attendance-kardex.tsx`**:
   - En el archivo `src/components/admin/student-attendance-kardex.tsx` (líneas 277 a 460), el componente tenía su propio generador interno de sesiones `allCycleSessions` que **no utilizaba** la función unificada de `src/lib/kardex-calculator.ts`.
   - En la línea 373 tenía hardcodeado:
     ```typescript
     // ❌ ERROR PREVIO: Siempre sumaba 45 minutos sin importar la modalidad
     const endMinuteTotal = (hh || 16) * 60 + (mm || 0) + 45;
     ```
   - Y en la línea 426 deduplicaba por fecha y hora:
     ```typescript
     // ❌ ERROR PREVIO: No agrupaba los 2 bloques de 45m de los intensivos
     const slotKey = `${item.dateStr}-${item.time}`;
     ```
2. **Consecuencia en Pantalla**:
   - El Kardex mostraba a los alumnos intensivos con horario de 45 minutos (ej. `10:30 - 11:15` para Benjamin o `09:00 - 09:45` para Eitan) en vez de `90 minutos` (`10:30 - 12:00` o `09:00 - 10:30`).
   - Además, trataba a cada bloque de 45 minutos como una clase separada, desconfigurando la cuota mensual de 4 clases.

---

## 📋 3. Estado de Alumnos Clave Detectados en la Auditoría

| Alumno | UUID | Estado Actual en BD | Modalidad | Situación / Diagnóstico |
| :--- | :--- | :--- | :--- | :--- |
| **EITAN** (Eitan Anton Chapi) | `482dd79d-630e-41dd-91d8-4730e73651d8` | **Activo 🟢** | Intensivo (4 clases / 90 min) | **Íntegro y Seguro.** Sáb 09:00-10:30 con Fernando (Sala B). Sus 2 clases de Septiembre están marcadas `presente`. |
| **Chapi, Eitan Anton** | `00000000-0000-0000-0002-00000000000b` | **Pausa ⚪** | Regular (8 clases / 45 min) | Registro histórico antiguo de semillas. Mantener en pausa para no interferir. |
| **Benjamin** | `57db57ae-ad12-4e58-bedc-659ac7dbef24` | **Baja 🔴** (Pausado hoy) | Intensivo (4 clases / 90 min) | Fue dado de baja hoy al ver el error de 45m en Kardex. **Listo para reactivar a activo** mañana con sus clases de Sáb 10:30-12:00 con Jeremy. |
| **Antonella** | Activo | **Activo 🟢** | Intensivo (4 clases / 90 min) | Viernes 09:00 a 10:30 con Jeremy (Sala A). Ocupa 2 bloques pedagógicos. |

---

## 🎯 4. Hoja de Ruta para Mañana al Abrir la Escuela (Paso a Paso)

Al abrir la jornada mañana, retomaremos directamente con este plan quirúrgico:

### Paso 1: Conexión Definitiva del Kardex al Motor Central (5 minutos)
- En `src/components/admin/student-attendance-kardex.tsx`:
  - Reemplazar el bucle duplicado de `allCycleSessions` por la llamada oficial a `computeStudentCycleSessions`:
    ```typescript
    const allCycleSessions: StudentSessionItem[] = useMemo(() => {
      return computeStudentCycleSessions({
        student: liveStudent,
        allSchedule: studentLessons,
        selectedYear,
        selectedMonth,
      });
    }, [liveStudent, studentLessons, selectedYear, selectedMonth]);
    ```
  - Esto activará de inmediato la duración de **90 minutos** (`09:00 - 10:30`), la consolidación de 1 sola fila por fecha intensiva, y la cuota estricta de 4 clases al mes en el Kardex.

### Paso 2: Distintivo Visual `⚡ 90m (Intensivo)` en Horario y Kiosco
- En `src/components/admin/agenda-board.tsx` y `src/routes/teacher.index.tsx`:
  - Mostrar la etiqueta `⚡ 90 min (Intensivo)` tanto en el bloque de las 09:00 como en el de las 09:45, para que los profesores y secretaría vean con total claridad que el alumno está en turno doble continuo.

### Paso 3: Reactivación Quirúrgica de Benjamin
- En PostgreSQL, actualizar el `status` de Benjamin (`57db57ae-ad12-4e58-bedc-659ac7dbef24`) de `"baja"` a `"activo"`.
- Verificar que su Kardex cargue automáticamente sus 4 clases de 90 min de Sábados 10:30 a 12:00 con Prof. Jeremy.

### Paso 4: Normalización de Nombre de Eitan
- Actualizar `full_name` en `482dd79d-630e-41dd-91d8-4730e73651d8` de `"EITAN"` a `"Eitan Anton Chapi"` para que coincida perfectamente en todas las búsquedas del directorio y reportes de Nayeli.

### Paso 5: Verificación, Build y Git Push
- Ejecutar `npm run build` para garantizar cero errores de TypeScript.
- Realizar commit y sincronizar a `origin main` y `core main`.

---

**Nota:** Toda esta información ya está indexada en el vault de **Engram** (Memoria ID: `703dc6f0-1ad9-4f65-86aa-a531173f8141`). ¡Hasta mañana!
