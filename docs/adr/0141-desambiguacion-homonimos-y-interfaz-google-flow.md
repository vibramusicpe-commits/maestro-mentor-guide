# ADR-0141: Pauta Anti-Colisión de Homónimos, Fuzzy Matching Fonético y UI/UX Google Flow

## Estado
Aceptado e Implementado

## Contexto
En Vibra Music Staff coexisten alumnos con nombres idénticos o muy similares (por ejemplo, múltiples alumnas con nombre "Sasha", o errores tipográficos habituales como "darma" en vez de "dharma"). Si un asistente automatizado asume a ciegas la identidad de un alumno para consultar o reprogramar una clase, se corren riesgos críticos de alterar el expediente pedagógico del alumno equivocado.

Además, el formato de diálogo modal centrado interrumpía el flujo de trabajo de secretaría en la agenda semanal y la tabla de alumnos.

---

## Decisión de Arquitectura y Negocio

### 1. Pauta Multidimensional Anti-Colisión de Alumnos
- Algoritmo de similitud fonética (Levenshtein $\le 1$) y cotejo de bigramas de palabras para tolerar erratas tipográficas.
- Scoring compuesto que pondera:
  - Coincidencia en nombre y apellidos.
  - Coincidencia en instrumento.
  - Coincidencia en profesor asignado.
  - Coincidencia en nombres de apoderados (padre/madre) registrados en PostgreSQL (`emergency_contact`).
- **Bloqueo de Suposición a Ciegas**: Si 2 o más candidatos tienen puntajes altos con una diferencia menor a 25 puntos, el sistema activa `isAmbiguous: true` y presenta las fichas comparativas de las candidatas para que secretaría elija con un clic quién es la persona correcta.

### 2. Consulta en Vivo de Clases Pendientes (`consulta_clases_pendientes`)
- Nueva intención que lee el historial real de asistencias en `attendance_logs` de PostgreSQL.
- Desglosa con precisión: clases contratadas, asistidas, inasistencias por recuperar (créditos de recuperación) y clases regulares restantes del mes.
- Previene que consultas como *"¿Cuántas clases le quedan a X?"* sean tratadas erróneamente como nuevas matrículas o reprogramaciones.

### 3. Interfaz de Usuario No Invasiva Estilo Google Flow
- **Cápsula Flotante Inferior**: Modo compacto en el centro inferior de la pantalla (`bottom-6 left-1/2 -translate-x-1/2`), con selector de rol, input rápido, botón de snapshot para Meta y botón de despliegue.
- **Panel Lateral Derecho (460px)**: Modo expandido acoplado a la derecha, con timeline interactivo de resolución, ficha de Kardex en vivo, selector de desambiguación y enlace directo de WhatsApp Web (`wa.me`).
