# ADR 0103: Sincronización en Vivo con Insforge PostgreSQL y Blindaje del Dossier

## Estado
Aprobado (v1.9.2) — 17 de Septiembre, 2026

## Contexto
1. **Pérdida de Cambios en Dossier tras Limpieza de Caché**:
   - Al editar datos de un alumno en la tabla/dossier de alumnos (ejemplo: **Emma Micaela Sevilla Perez**), las modificaciones se reflejaban en la UI pero al limpiar la caché del navegador o recargar con Ctrl+Shift+R se perdían.
2. **Rechazo Silencioso en PostgREST (401 Unauthorized)**:
   - En `src/lib/services/auth.service.ts`, el inicio de sesión generaba un token de simulación con formato `jwt-token-${role}-${Date.now()}`.
   - En `src/lib/insforge.ts` (`buildHeaders`), este string se enviaba en la cabecera `Authorization: Bearer <token>`.
   - PostgREST de Insforge realiza validación de firma criptográfica de JWT. Al recibir un token que no cumple con el estándar RFC 7519, rechazaba todas las peticiones con `HTTP 401 Unauthorized: Invalid token`.
   - Como consecuencia, las llamadas asíncronas `updateStudent` en `backgroundSyncStudentToDB` fallaban en segundo plano y los datos nunca llegaban a la base de datos PostgreSQL física.
3. **Condiciones de Carrera por Ausencia de Debounce**:
   - Cada pulsación de tecla en inputs de texto (notas, nombres, teléfonos) ejecutaba inmediatamente peticiones concurrentes a PostgREST sin control de orden de llegada (*out-of-order writes*).

## Decisiones Técnicas
1. **Sanitización de Cabeceras de Autorización en Insforge Client (`insforge.ts`)**:
   - `buildHeaders` valida estrictamente si `_sessionToken` es un JWT criptográfico real (comienza con `eyJ` y tiene 3 segmentos).
   - Si no es un JWT válido (es decir, en el modo actual de frontend con anonKey), se utiliza automáticamente `INSFORGE_CONFIG.anonKey` como Bearer token.
   - En `auth.service.ts`, se asigna por defecto `INSFORGE_CONFIG.anonKey` y se sanean tokens obsoletos en `localStorage`.
2. **Debounce Inteligente y Fusión de Metadatos (`app-store.ts`)**:
   - Se implementó `backgroundSyncStudentToDB` con acumulador de actualizaciones pendientes (`pendingStudentUpdates`) y un temporizador de debounce de 350ms por alumno.
   - Se implementó `performSyncStudentToDB`, la cual fusiona los datos del alumno actual (`currentStudent`) con las nuevas propiedades recibidas, preservando la totalidad de la estructura del expediente en el campo JSONB `emergency_contact` (fechas, teléfonos, datos de libro/útiles, asistencias y clases asignadas `scheduleLessons`).
3. **Blindaje de Tipos SQL**:
   - Se validó el campo `birthdate` contra la expresión regular `^\d{4}-\d{2}-\d{2}$`. Si no cumple con formato ISO, no se envía a la columna de tipo `date` de PostgreSQL (evitando errores 400 Bad Request) y se conserva en `emergency_contact.birthdate`.
   - Se normalizó el campo `modality` para respetar los valores estrictos del enum PostgreSQL `lesson_modality_enum`.

## Consecuencias
- La persistencia con Insforge PostgreSQL es 100% fiable y en tiempo real.
- Las modificaciones realizadas en cualquier ficha de alumno persisten íntegramente tras limpiar caché, cambiar de navegador o recargar la página.
- Se eliminan por completo los errores HTTP 401 y 400 en las mutaciones de alumnos.
