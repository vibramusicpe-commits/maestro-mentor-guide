# ADR-0142: Autocompletado con Tab, Menciones @, Ocultamiento Lateral EyeOff, Guardrails de Seguridad y Recuperaciones de 45m

## Estado
Aceptado e Implementado

## Contexto
A medida que Copiloto Laya se integra al flujo operativo diario de Vibra Music Staff, se detectaron necesidades adicionales:
1. Agilidad en la digitación: la posibilidad de autocompletar el nombre del alumno sugerido con la tecla `Tab` e ingresar menciones explícitas (`@Nombre`) para fijar la identidad al 100% de inmediato.
2. Control visual: secretaría debe poder ocultar por completo el agente (sin que quede ni el panel lateral ni la cápsula flotante inferior) mediante un botón de ojo (`EyeOff`) situado exclusivamente en el panel lateral, y volver a invocarlo mediante el botón `⚡ Copiloto Laya Ctrl+Shift+L` o el atajo de teclado.
3. Precisión pedagógica: Clarificar que los Cursos Intensivos son de 90 minutos (1x/semana en Jueves, Viernes o Sábados), pero que los Viernes y Sábados pueden emplearse formalmente para recuperaciones de 45 minutos del Plan Regular siempre que haya aforo (< 5 alumnos).
4. Guardrails de seguridad y asistencia de inducción: Laya debe responder preguntas sobre las pautas de la academia (días pareados, 3 pasos de activación de alumno: Registro -> Horario -> Kardex), pero bloquear tajantemente cualquier intento de extraer contraseñas, tarjetas de crédito o datos confidenciales de los dueños.
5. Corrección de strings en WhatsApp: Evitar repeticiones no deseadas en el saludo ("Familia Familia ...").

---

## Decisión de Arquitectura y Negocio

### 1. Autocompletado con Tecla `Tab` y Sintaxis `@Menciones`
- Al presionar `Tab` en la caja de texto, el primer alumno identificado en "Alumno Identificado en PostgreSQL" se inserta como `@Nombre Completo `.
- Si el texto contiene `@Nombre`, el motor de matching prioriza dicha coincidencia con 100% de confianza, suprimiendo falsos positivos de homónimos.
- Al hacer clic en un candidato de la lista de desambiguación, se reemplaza o inserta la mención `@Nombre` en el input.

### 2. Ocultamiento Total Exclusivo en Vista Lateral (`EyeOff`)
- El botón de ojo (`EyeOff`) se renderiza **únicamente** en la cabecera del panel lateral derecho (sidebar).
- Al hacer clic en `EyeOff`, el estado pasa a `isFullyHidden = true`, retirando del DOM tanto el panel lateral como la cápsula flotante inferior.
- Para reactivarlo, el usuario presiona el botón `⚡ Copiloto Laya` de la barra superior o pulsa `Ctrl+Shift+L`.

### 3. Reglas Pedagógicas de Duración y Salas
- **Plan Intensivo**: 90 minutos continuos (2 bloques de 45m), 1x por semana en Jueves, Viernes o Sábados.
- **Recuperaciones de Plan Regular en Viernes y Sábados**: Autorizadas formalmente en bloques de 45 minutos si la sala dispone de vacante (< 5 alumnos).

### 4. Módulo de Inducción Técnica/Operativa y Guardrails de Seguridad
- Laya resuelve consultas del sistema: Días Pareados (Lunes-Miércoles, Martes-Jueves, Viernes-Sábado), los 3 pasos de alta de alumnos (1. Ficha/Registro -> 2. Horario según especialidad de docente y edad -> 3. Kardex), aforo máximo estricto de 5 alumnos.
- **Guardrails Estrictos**: Cualquier consulta sobre tarjetas de crédito, claves de base de datos o contraseñas de directores es rechazada con un mensaje de protección y derivación a `/admin/facturacion` y `/admin/reportes`.

### 5. Corrección de Plantilla de WhatsApp
- El nombre de familia se normaliza eliminando repeticiones del prefijo: `(familyName || "").replace(/^familia\s+/i, "").trim()`.
