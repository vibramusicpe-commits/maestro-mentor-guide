# ADR 0005: Arquitectura de Edges en Insforge (RBAC Gates, Payload Passing, Fallback Routing)

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

Insforge orquesta el backend mediante un modelo de grafos de nodos conectados por **edges** (aristas). En ecosistemas como Insforge, un edge no es un simple puente A→B; actúa como **guardia de seguridad y traductor** entre nodos. Esto es especialmente crítico cuando se manejan 4 roles con permisos diferenciados (Super Admin, Staff, Profesor, Familia).

Sin una arquitectura de edges explícita, el riesgo es:
- Un rol Staff que llama directamente a un endpoint de `company_expenses`.
- Un profesor que modifica créditos de alumnos que no son suyos.
- Un abono registrado sin pasar por el audit log (fuga anti-fraude).

## Decisión

Implementar cada operación de backend siguiendo el patrón de **3 edges obligatorios**:

### Edge 1: RBAC Gate (Validación de Rol)
```typescript
assertRole(userRole, ['super_admin', 'staff'], 'registrar abono');
// Si falla → InsforgeEdgeError('PERMISSION_DENIED') → toast de error
```
Primera línea de defensa en el frontend. Segunda línea en la función PostgreSQL `SECURITY DEFINER`.

### Edge 2: Payload Extractor (Datos Mínimos)
Solo se pasan al nodo destino los campos estrictamente necesarios. Nunca el objeto global completo del store de Zustand.

```typescript
// ✅ Correcto:
postgrestPatch('students', { id: `eq.${id}` }, { modality });
// ❌ Incorrecto:
postgrestPatch('students', { id: `eq.${id}` }, { ...wholeStudentObject });
```

### Edge 3: Fallback Routing (Bifurcación por Error)
Cada flujo crítico tiene dos salidas:
- **Success**: Actualiza Zustand + toast de confirmación.
- **Error**: Captura el `InsforgeEdgeError`, muestra mensaje, encola en `syncQueue` para retry.

### Flujo Anti-Fraude (2 Edges secuenciales)
Para pagos, los edges son **ordenados y dependientes**:
1. INSERT en `payment_audit_logs` (si falla → abortar)
2. PATCH en `invoices` (solo si paso 1 exitoso)

## Consecuencias
- Seguridad por capas: frontend + función DB.
- Trazabilidad completa de cada operación.
- Rollback automático si falla el primer edge.
- Código de servicios predecible y testeable.
