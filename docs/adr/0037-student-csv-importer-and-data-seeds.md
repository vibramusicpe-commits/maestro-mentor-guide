# ADR 0037: Importador Universal de Alumnos CSV/Excel y Control de Semillas de Datos

- **Estado**: Aceptado
- **Fecha**: 2026-08-13
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
1. **Origen de las 27 Clases y los 8 Alumnos**:
   - En `src/store/admin-seeds.ts` existen dos estructuras iniciales:
     - `initialSchedule` (27 clases distribuidas entre Lunes, Martes y Sábado).
     - `adminStudents` (8 alumnos: 6 activos, 1 pausa, 1 baja).
   - Estas estructuras alimentan automáticamente los contadores superiores (Ocupación de salas, Asistencia, Deserción) y la ventana lateral de **Historial Reingresos / Bajas** (que filtra la lista `adminStudents`).
2. **Necesidad Operativa de Nayeli**:
   - Para que secretaría y dirección no dependan de datos precargados y puedan cargar su padrón oficial en segundos, se requería un **Importador de Alumnos CSV/Excel** idéntico al de horarios, con opción de vaciado total y descarga de plantilla.

## Decisiones
1. En `src/store/app-store.ts`:
   - Se crearon las acciones `importStudentsFromCSV(newStudents)` y `clearStudents()`.
2. En `src/components/admin/students-table.tsx`:
   - Se agregó el botón `📊 Subir Alumnos (CSV/Excel)`.
   - Se implementó la descarga de `plantilla_alumnos_vibra_music.csv`.
   - Se incluyó el soporte de reemplazo total, adición progresiva y el botón `🗑️ Vaciar Directorio` para limpiar todos los alumnos con un solo clic.

## Consecuencias
- Nayeli tiene autonomía total para vaciar los alumnos de prueba y reemplazar el directorio completo con su Excel en un solo clic.
