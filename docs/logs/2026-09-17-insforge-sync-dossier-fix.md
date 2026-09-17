# Bitácora de Incidencias: Sincronización en Vivo Insforge PostgreSQL y Blindaje del Dossier
Fecha: 17 de Septiembre, 2026
Hora: 16:55 PET (21:55 UTC)
Responsable: Antigravity AI & Equipo Vibra Music

## Resumen Ejecutivo
Se identificó y solucionó la falla crítica de persistencia donde las ediciones realizadas en el Dossier de Alumnos (ejemplo: ficha de Emma Micaela Sevilla Perez) no se guardaban en la base de datos PostgreSQL de Insforge, provocando la pérdida de datos al limpiar la caché del navegador.

## Causa Raíz Detectada
1. `src/lib/services/auth.service.ts` generaba tokens ficticios `jwt-token-super_admin-...`.
2. `src/lib/insforge.ts` enviaba dicho token en `Authorization: Bearer ...`.
3. PostgREST de Insforge rechazaba la petición con `HTTP 401 Unauthorized: {"error":"AUTH_UNAUTHORIZED","message":"Invalid token","statusCode":401}`.
4. Los métodos de actualización en `app-store.ts` capturaban el error silenciosamente sin persistir en base de datos.
5. Al pulsar teclas rápidamente, se generaban múltiples peticiones asíncronas no debouncificadas.

## Acciones Aplicadas
1. **Modificación de `src/lib/insforge.ts`**: Se ajustó `buildHeaders` para validar si el token es un JWT real (`startsWith("eyJ")`). De lo contrario, utiliza siempre `INSFORGE_CONFIG.anonKey` como Bearer token válido ante PostgREST.
2. **Modificación de `src/lib/services/auth.service.ts`**: Se asignó `INSFORGE_CONFIG.anonKey` a las sesiones de usuario y se sanitizaron tokens simulados heredados en `localStorage`.
3. **Optimización de `src/store/app-store.ts`**:
   - Implementación de `performSyncStudentToDB` con fusión completa de `currentStudent` y `updates` para preservar todos los atributos en `emergency_contact` JSONB.
   - Implementación de `backgroundSyncStudentToDB` con debounce de 350ms por alumno y acumulador de cambios pendientes.
   - Validación de `birthdate` contra formato ISO date y normalización de enum `modality`.
4. **Verificación Automatizada**:
   - Se ejecutó script de prueba actualizando a Emma Micaela Sevilla Perez (`00000000-0000-0000-0002-000000000048`).
   - PostgREST respondió `200 OK`.
   - Se consultó la base de datos mediante la herramienta MCP `insforge-postgres` confirmando que los datos actualizados se grabaron físicamente en PostgreSQL.
5. **Actualización Documental**:
   - Se crearon los documentos ADR 0102, 0103 y 0104.
   - Se actualizó el archivo `docs/CHANGELOG.md`.
