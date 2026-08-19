# ADR 0054: Sincronización de Invitaciones Multi-Sesión en Insforge PostgreSQL y Resolución Cruzada de Alumnos por Docente

## Estado
Aceptado / Desplegado en Producción (Cloudflare Pages)

## Contexto y Puntos de Dolor
1. **Desincronización de Invitaciones en Incógnito / Multi-Dispositivo:** Al ingresar un docente o familiar a través de un enlace de invitación (`/invite/$token`) desde una pestaña de incógnito o celular, el cambio de contraseña y la aceptación se guardaban únicamente en el `localStorage` aislado de esa sesión de incógnito. Al recargar la consola de Secretaría (`/admin/invitaciones`), el estado seguía apareciendo como `"pendiente"`.
2. **Discrepancia en Directorio Docente de Alumnos (`/teacher/alumnos`):** Al filtrar por `Prof. Jeremy`, solo aparecía 1 alumno en la lista (`Huamali Cortez`), cuando en la realidad operativa Jeremy tiene más de 16 alumnos asignados en sus clases de Batería y Guitarra (Sala A). Esto se debía a que los datos de facturación iniciales (`officialControlPagosStudents`) habían asignado por defecto `"Fernando"` a la mayoría de filas que carecían de columna de profesor en el Excel original.

## Decisiones Arquitectónicas y de Implementación

### 1. Sincronización en la Nube con Insforge PostgreSQL (`invitations`)
- `acceptInvitation`: Realiza un patch/upsert directo en la tabla `invitations` de Insforge PostgreSQL (`status = 'aceptado'`, `accepted_at = NOW()`, `master_password = customPassword`).
- `getInvitations`: Ejecuta una consulta activa `postgrestSelect('invitations')` al backend de PostgreSQL y fusiona reactivamente el estado en la nube con las semillas locales.
- **Auto-refresco:** Se implementaron listeners de eventos (`focus` y `storage`) en `/admin/invitaciones` para que la lista se actualice inmediatamente cuando Secretaría regresa a su ventana.

### 2. Resolución Cruzada de Alumnos y Docentes en el Directorio (`/teacher/alumnos`)
- Se implementó un algoritmo de normalización y búsqueda difusa (*fuzzy matching*) que cruza los 99 alumnos de facturación con las 70+ clases del horario central (`schedule`).
- Se resuelven dinámicamente los profesores oficiales:
  * **Prof. Jeremy:** Alumnos con clases en Sala A o instrumentos (Batería, Guitarra, Bajo, Ukelele).
  * **Prof. Fernando:** Alumnos con clases en Sala B o instrumentos (Piano, Violín).
  * **Prof. Nathaly:** Alumnos con clases en Sala C o instrumentos (Canto, Piano Infantil, Estimulación).
- Se preselecciona automáticamente el profesor correspondiente según el usuario autenticado (`currentUser.name`).

## Consecuencias y Beneficios
- **Transparencia Total:** Toda aceptación de invitación desde cualquier navegador o móvil se refleja de inmediato en el panel de Nayeli.
- **Directorio Docente Completo:** Cada profesor visualiza la totalidad de sus alumnos asignados, con sus horarios de clase, apoderados y teléfonos de contacto en caso de suplencias o emergencias.
