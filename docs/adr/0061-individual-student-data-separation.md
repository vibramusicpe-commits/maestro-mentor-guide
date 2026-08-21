# ADR 0061: Separación e Individualización Quirúrgica de Estudiantes (Desde ESTUDIANTES VIBRA MUSIC.xlsx)

## Estado
Aceptado e Implementado

## Contexto
En las semillas anteriores generadas a partir del Control de Pagos general, algunos hermanos o familiares se encontraban agrupados en una sola celda (por ejemplo *"Bruno Marcelo Juan de Dios y Boris Marcelo Juan de Dios"*), lo cual provocaba que al seleccionar o programar un alumno en la agenda o en el directorio se seleccionaran ambos a la vez.

Secretaría (Nayeli) suministró el archivo consolidado oficial [`docs/ESTUDIANTES VIBRA MUSIC .xlsx`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/ESTUDIANTES%20VIBRA%20MUSIC%20.xlsx), donde cada alumno está registrado como una persona única e independiente con su propio instrumento, edad, apoderado, nivel, modalidad y fechas.

## Decisiones Técnicas

### 1. Extracción y Normalización Quirúrgica
- Procesado el archivo `ESTUDIANTES VIBRA MUSIC .xlsx` mediante script automatizado.
- **83 alumnos reales** extraídos de forma totalmente individualizada (68 activos, 15 de baja/inactivos).
- Cada hermano cuenta ahora con su propio registro y perfil:
  * **Bruno Marcelo Juan de Dios** (17 años, Guitarra, Prof. Jeremy, Apoderado: Peter Marcelo Romero).
  * **Boris Axel Marcelo Juan de Dios** (14 años, Piano, Prof. Fernando, Apoderado: Peter Marcelo Romero).
  * **Junior Gabriel Anton** (14 años, Batería, Prof. Jeremy, Apoderado: Anthony Anton).
  * **Uriel Anton** (10 años, Batería, Prof. Jeremy, Apoderado: Anthony Anton).
  * **Eitan Anton Chapi** (12 años, Piano, Prof. Fernando, Apoderado: Anthony Anton).

### 2. Actualización de Semillas y Script SQL PostgreSQL
- Actualizado [`official-control-pagos-seeds.ts`](file:///C:/Users/USER/my%20music%20staff%20backend/src/store/official-control-pagos-seeds.ts) con los 83 alumnos individualizados y sus 83 recibos correspondientes.
- Regenerado el script de migración SQL [`004_populate_real_data_seeds.sql`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/migrations/004_populate_real_data_seeds.sql) con claves UUID deterministas y relaciones de familias sin duplicación de registros de alumnos.

## Consecuencias y Validación
- Se eliminó al 100% el problema de alumnos concatenados o agrupados con "y".
- Cada alumno puede ser programado, editado o matriculado individualmente sin afectar a sus hermanos.
- `npm run build` ejecutado exitosamente con 0 errores (548ms).
