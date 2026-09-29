# ADR-0140: Motor de Decisiones Tipo Sistema 1 Laya ($0 Costo), Copiloto de Triage y Exportador de Contexto para Meta

## Estado
Aceptado e Implementado

## Contexto
El flujo de atención y coordinación de reprogramaciones en Vibra Music Staff exige agilidad inmediata sin incurrir en costos operativos desmedidos por uso de modelos de lenguaje LLM comerciales ni tarifas de WhatsApp Cloud API por cada interacción. 
Asimismo, se requería una herramienta que permita a secretaría (Nayeli) clasificar intenciones, verificar aforos de sala en tiempo real y exportar la matriz de cupos hacia plataformas externas como Meta Business Suite o archivos CSV.

---

## Decisión de Arquitectura y Negocio

### 1. Costo Cero Absoluto ($0 Cost) y Arquitectura Edge
- Inferencia no-autoregresiva tipo Sistema 1 desarrollada en TypeScript nativo.
- Ejecución directa en el runtime cliente y Cloudflare Workers & Pages (<35 ms por evaluación).
- Eliminación de dependencias de Python o llamadas a APIs pagadas de LLMs para el triage rutinario.
- Los mensajes dirigidos a apoderados se envían sin costo mediante el protocolo `wa.me` con URLs codificadas.

### 2. Triage Quirúrgico y Cumplimiento Pedagógico (ADR-0102)
- Extracción determinista de la entidad alumno desde la nómina activa en PostgreSQL (`students`).
- Asignación estricta de docente y sala por instrumento y edad:
  - Prof. Nathaly: Sala C (Piano Infantil 4-8 años y Canto).
  - Prof. Fernando: Sala B (Piano estándar 9+ años y Violín).
  - Prof. Jeremy: Sala A (Guitarra y Batería).
- Validación de aforo en vivo sobre `schedule` y `adminStudents` en la franja solicitada:
  - 🟢 **Disponible (<5 alumnos)**: Habilita el agendamiento y prepara el mensaje de confirmación.
  - 🔴 **Lleno (5/5)**: Bloquea el sobrecupo y calcula alternativas viables en la misma semana.

### 3. Exportador de Contexto para Meta Business Suite y CSV
- Botón **"📋 Copiar Snapshot para Agente Meta Business"**: Formato Markdown estructurado con matriz horaria y vacantes para usar como system context.
- Botón **"📥 Descargar Horarios Disponibles (.CSV)"**: Exportación de datos tabulares para catálogos y sistemas externos.

### 4. Accesibilidad Global
- Botón en barra superior (`⚡ Copiloto Laya`) y atajo universal `Ctrl+Shift+L`.
