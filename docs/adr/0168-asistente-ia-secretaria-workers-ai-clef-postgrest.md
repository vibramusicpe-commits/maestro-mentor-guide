# ADR 0168: Integración de Asistente IA para Secretaría con Cloudflare Workers AI, Clasificador/Guardrail Clef y Consultas PostgREST a Insforge PostgreSQL

## Estado
Aprobado e Implementado (v2.0.38) — 12 de Octubre, 2026

## Contexto
Con la aplicación web de Vibra Music Staff al 90% de desarrollo y desplegada en Cloudflare Pages (`musicstaff-vm`), la Dirección y Secretaría (Nayeli) solicitaron incorporar un asistente de inteligencia artificial para agilizar tareas operativas diarias:
1. Consultar alumnos con pagos pendientes, montos adeudados y fechas de vencimiento.
2. Verificar aforos y vacantes por turno respetando las reglas pedagógicas de salas y docentes (ADR-0102).
3. Revisar el Kardex de asistencias y las cuotas contractuales de clases restantes (ADR-0099, ADR-0110).
4. Dar seguimiento a prospectos y clases demo pendientes (`demo_requests`).
5. Redactar recordatorios y notas administrativas.

Inicialmente se consideró utilizar únicamente el modelo **Clef** de Cloudflare. Sin embargo, se identificó una distinción técnica fundamental:
- **Clef no es un asistente conversacional**: Clef es un modelo clasificador y evaluador probabilístico de opciones (Zero-Shot / Moderación). Clef no redacta respuestas en lenguaje natural ni resume tablas de bases de datos.
- Intentar usar Clef como bot generativo produce errores conceptuales o respuestas nulas.
- Al mismo tiempo, modelos conversacionales puros que operan sin conexión a la base de datos tienden a alucinar horarios y deudas ficticias.

Por tanto, se acordó diseñar una arquitectura híbrida server-side dentro del plan gratuito de Cloudflare Workers AI (10,000 neuronas/día) que combine clasificación, consulta segura a datos reales y síntesis de lenguaje natural.

---

## Decisiones Técnicas

### 1. Desacoplamiento de Roles en el Pipeline
El flujo del asistente se divide en 4 capas estrictamente delimitadas:
```
Secretaria (Query) 
       │
       ▼
[1. Clef / Heurística] ────> Clasifica Intención + Filtro de Inyección / Ataque
       │
       ▼
[2. Insforge PostgREST] ───> Consulta datos REALES (invoices, students, lessons, etc.)
       │
       ▼
[3. Prompts & Reglas] ────> Inyecta reglas pedagógicas (ADR-0102) y cuotas (ADR-0106)
       │
       ▼
[4. Workers AI LLM] ──────> Llama 3.1 8B Instruct redacta la respuesta ejecutiva en español
```

### 2. "Ayuda a Clef" y Optimización Semántica (`functions/_lib/clef.ts`)
Para que Clef opere de forma infalible en el entorno de la escuela, se implementaron 4 mecanismos de asistencia:
1. **Taxonomía Semántica Enriquecida**: Mapeo explícito a 6 intenciones operativas (`cobranzas`, `horarios_aforos`, `kardex_asistencias`, `prospectos_demos`, `recordatorios`, `ayuda_general`), incorporando jerga local peruana (*"yapeó"*, *"saldo"*, *"aforo"*, *"de corrido"*, *"reprogramación"*).
2. **Inmunización de Falsos Positivos de Privacidad**: En sistemas de moderación genéricos, consultar *"¿Cuánto debe el papá de Lucas?"* puede ser catalogado erróneamente como violación de datos sensibles (`is_sensitive: true`). El evaluador contextual enseña a Clef que la consulta proviene de un usuario administrativo con rol `staff`, por lo que el acceso a estados de cuenta y teléfonos de apoderados es legítimo. Solo se bloquean ataques reales de Prompt Injection o comandos destructivos.
3. **Extractor de Entidades Auxiliar (`extractQueryEntities`)**: Identifica automáticamente docentes (*Jeremy*, *Fernando*, *Nathaly*), salas (*Sala A*, *Sala B*, *Sala C*, *Sala D*), instrumentos (*Piano*, *Guitarra*, *Batería*, *Canto*, *Violín*) y nombres de alumnos para construir parámetros de búsqueda exactos.
4. **Fallback Heurístico Resiliente**: Si el binding de Workers AI Clef sufre latencia o devuelve formato inesperado, un clasificador determinista por reglas de negocio asume el control sin interrumpir la experiencia.

### 3. Cliente PostgREST Server-Side (`functions/_lib/insforge.ts`)
- Utiliza la URL y la Anon Key de Insforge (`pdey9yma.us-east.insforge.app`) configuradas en las variables de entorno server-side de Cloudflare Pages (sin prefijo `VITE_`), impidiendo la exposición innecesaria de credenciales en el cliente.
- Consultas tipadas y optimizadas:
  - `getInvoices(studentName)`: Filtrado por concepto o estado (`pendiente`, `vencido`, `parcial`).
  - `searchStudent(name)`: Búsqueda de alumnos en `students` con lectura de `emergency_contact`.
  - `getLessons({ dateStr, room })`: Agenda diaria para cómputo de vacantes por sala.
  - `getAttendanceLogs(studentId)`: Historial de marcas de asistencia en `attendance_logs`.
  - `getDemoRequests()`: Solicitudes de clases de prueba.

### 4. Blindaje Pedagógico y Contractual en el Prompt (`functions/_lib/prompts.ts`)
El modelo generativo (Llama 3.1 8B Instruct) recibe como directivas innegociables:
- **Especialidad Docente y Salas (ADR-0102)**:
  - Prof. Nathaly (Sala C): Piano Infantil (4 a 8 años) y Canto.
  - Prof. Fernando (Sala B): Piano Estándar (jóvenes/adultos) y Violín. Jamás mezclar con Nathaly.
  - Prof. Jeremy (Sala A): Guitarra clásica/eléctrica y Batería.
  - Aforo máximo: 5 alumnos por turno de 45 minutos.
- **Cuotas Contractuales (ADR-0099, ADR-0110)**:
  - Plan Regular: 8 clases de 45 min / mes.
  - Plan Intensivo: 4 clases de 90 min / mes (2 bloques contiguos de 45 min).
  - Pack de Útiles: S/ 67.00.
- **Tolerancia Cero a la Alucinación**: Temperatura configurada en 0.2. Si un dato no existe en Insforge, el asistente lo declara explícitamente en lugar de inventar.

### 5. Configuración de Cloudflare Pages (`wrangler.toml` y `functions/api/assistant.ts`)
- `wrangler.toml` declara el binding `[ai] binding = "AI"` con compatibilidad para `nodejs_compat`.
- `functions/api/assistant.ts` expone el endpoint `POST /api/assistant` con soporte CORS, autenticación opcional por `ADMIN_TOKEN`, y fallback determinista si los modelos de Workers AI alcanzaran el límite diario.

---

## Consecuencias y Beneficios
1. **Precisión Matemática y Operativa**: Las respuestas a Nayeli reflejan únicamente saldos reales de la tabla `invoices` y marcas reales de `attendance_logs`.
2. **Cero Costo Adicional**: Todo el cómputo de IA corre dentro de las 10,000 neuronas gratuitas por día de Workers AI en Cloudflare.
3. **Resiliencia Operativa**: Gracias al módulo de asistencia para Clef, las consultas nunca fallan por ambigüedad o falsos positivos de seguridad.
