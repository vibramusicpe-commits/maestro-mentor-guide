# ADR-0143: Base de Conocimiento Pedagógico en Copiloto Laya — Categorías por Edad, Equivalencia Master = Adulto y Convivencia de Planes (ADR-0121)

## Estado
Aceptado (Implementado y Verificado en Producción)

## Fecha
2026-09-29

## Contexto
Durante las operaciones de secretaría y consultas en lenguaje natural en el Copiloto Laya, se detectó que el asistente Sistema 1 no reconocía preguntas directas sobre estructura académica, tales como:
1. *"¿Qué categoría de edad es infantil?"*
2. *"¿Categoría master es igual a adulto?"*
3. *"¿Junior puede compartir sala con master?"*
4. *"¿Qué diferencia hay entre plan regular e intensivo?"*

Estas preguntas retornaban `null` en `resolveAcademyKnowledge`, cayendo en un clasificador genérico que intentaba buscar alumnos inexistentes en PostgreSQL.

---

## Decisiones Técnicas y Pedagógicas

### 1. Equivalencia Oficial Canónica: Master = Adulto (ADR-0121)
* **SÍ, Master es exactamente igual a Adulto (alumnos de 18 años a más)**.
* **Persistencia PostgreSQL**: En la base de datos se mantiene la compatibilidad histórica transparente utilizando la columna de nivel con valor `ADULTO`, evitando roturas de migración o claves ajenas.
* **Presentación UI**: En la ficha del alumno, agenda y selector de horarios se muestra la etiqueta oficial **`MASTER (18+)`**.
* **Regla de Convivencia en Sala**:
  - ✅ **SÍ puede compartir sala** con la categoría **Juvenil (13 a 17 años)**.
  - ❌ **TERMINANTEMENTE PROHIBIDO compartir sala** con la categoría **Junior (7 a 12 años)** para preservar la pedagogía y madurez formativa.

### 2. Categorías Oficiales por Rango de Edad y Aislamiento (ADR-0102 / ADR-0121)
* **Estimulación Musical (4 a 5 años)**: Prof. Claudia en Sala D. Sala Única (prohibido mezclar con otras edades). Aforo máx. 5.
* **Infantil (5 a 6 años)**: Prof. Nathaly en Sala C. Sala Única (prohibido mezclar con mayores). Aforo máx. 5.
  - **Piano Infantil**: Especialidad de **4 a 8 años** (Infantil, Tiny, Junior inicial) dictada exclusivamente por la Prof. Nathaly en Sala C.
* **Junior (7 a 12 años)**: Jeremy (Sala A) / Fernando (Sala B). Puede compartir sala con Juvenil (13-17). **PROHIBIDO con Master (18+)**.
* **Juvenil (13 a 17 años)**: Jeremy (Sala A) / Fernando (Sala B). **Puente etario**: Puede compartir sala con Junior o con Master.
* **Personalizado y Demos de Nivelación**: Aforo = 1 alumno máx. (Aislamiento absoluto).

### 3. Convivencia de Planes por Duración (45 min vs. 90 min)
* **Sesiones de 45 min** (Regular 2x, Regular 1x, Flexible 45m): SÍ pueden compartir sala hasta el aforo de 5 si respetan la edad.
* **Sesiones de 90 min** (Intensivo): NO pueden convivir en la misma sala con clases de 45 min porque la rotación de alumnos a los 45 minutos distrae la sesión intensiva.
* **Viernes y Sábados para Recuperaciones**: Si una sala dispone de cupo libre (<5 alumnos en un turno de 45m), SÍ se pueden agendar recuperaciones de 45 minutos de Plan Regular.

### 4. Arquitectura de Código
* **`laya-knowledge-base.ts`**:
  - Incorporadas categorías `master_adulto`, `categorias_edad`, `convivencia_salas` y `planes_estudio` en el tipo `AcademyKnowledgeResponse["category"]`.
  - Normalización y evaluación semántica prioritaria con regex y subcadenas limpias (`cleanText`).
* **`laya-realtime-matcher.ts`**:
  - Actualizado `buildWhatsAppReply` con plantillas pulidas para respuesta inmediata vía WhatsApp.
* **`laya-copilot-flow.tsx`**:
  - Insignias contextuales automáticas en la tarjeta de manual: `🎓 Master = Adulto`, `👶 Categorías & Edades`, `🏛️ Regla Convivencia`, `🎵 Planes de Estudio`.

---

## Verificación y Calidad
1. **Pruebas Unitarias (`scratch/test-categories-laya.ts`)**: 27/27 casos de prueba aprobados con 100% de éxito, cubriendo las preguntas exactas del usuario y variaciones lingüísticas.
2. **Build de Producción**: Compilación limpia con 0 errores TypeScript.
