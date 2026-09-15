# ADR 0092: Bandeja de Aprobación de Notas Docentes en Dashboard Principal y Segregación de Roles Docentes

## Estado
Aceptado (Accepted)

## Fecha
2026-09-15

## Contexto
1. **Requerimiento Operativo de Dirección y Marketing**:
   - Fabricio (Marketing) indicó la necesidad de contar con la bandeja de aprobación de notas pedagógicas directamente en el **Dashboard Principal (`/admin`)**, sin obligar al equipo administrativo a navegar a rutas secundarias para autorizar o desaprobar los comunicados redactados por los profesores.
2. **Definición de Roles de la Academia**:
   - **Administración / Operaciones**:
     * **Fabricio**: Marketing y Estrategia Comercial (rol `admin` / Staff administrativo). No imparte clases.
     * **Karla**: Secretaría y Atención al Cliente (rol `staff`, en sustitución de Nayeli). No imparte clases.
     * **Nayeli**: Ex-secretaria (preservada en base de datos como histórico/contingencia).
     * **Directora (Dueña - Rocío)**: Dirección General (rol `super_admin`). No dicta clases de planta regulares; dicta exclusivamente las clases DEMO a partir de las 4:00 p.m.
   - **Planta Docente Oficial (3 Profesores)**:
     * **Jeremy**: Profesor de Música (Piano, Guitarra, etc.).
     * **Fernando**: Profesor de Música (Violín, Piano, etc.).
     * **Nathaly**: Profesora de Música (Canto, Piano Infantil, etc.).

## Decisiones Técnicas

### 1. Componente `TeacherNotesApprovalWidget` (`src/components/admin/teacher-notes-approval-widget.tsx`)
- Se diseñó un widget especializado e integrado al Dashboard principal (`src/routes/admin.index.tsx`):
  - **Insignia y Estado en Vivo**: Muestra el conteo de notas pendientes de revisión con badge ámbar pulsante y actualización en tiempo real mediante `BroadcastChannel(NOTES_SYNC_CHANNEL)` y eventos personalizados.
  - **Ficha Resumen por Nota**:
    * Identificación del docente remitente (Jeremy, Fernando, Nathaly o Demo).
    * Alumno destinatario, familia, número de contacto e instrumento musical.
    * Bloque de cita destacada con el mensaje exacto redactado por el profesor.
    * Fecha y hora relativa del envío.
  - **Acciones Rápidas Directas**:
    * **Aprobar y Publicar**: Actualiza en PostgreSQL (`notification_logs` con estado `'enviado'` y `students.notes`), sincroniza con el Portal de Familia (`/family`) y ofrece el enlace de WhatsApp institucional.
    * **Editar y Aprobar**: Modal emergente para corregir ortografía o redacción antes de dar el visto bueno institucional.
    * **Observar / Devolver al Docente**: Modal para redactar el motivo de la observación. El estado pasa a `'rechazado'` y el profesor visualiza la devolución en su portal para corregirla.
  - **Estado Vacío Elegante**: Si no hay solicitudes pendientes, muestra un banner que confirma que todas las notas pedagógicas están revisadas y al día.

### 2. Soporte para Navegación Profunda (`/admin/alumnos?tab=notas`)
- En `src/routes/admin.alumnos.tsx`, se habilitó la lectura segura en cliente del parámetro `?tab=notas`, permitiendo que el botón "Ver todas en Alumnos" del Dashboard redirija de forma instantánea a la pestaña correspondiente sin recargas de página ni desajustes de hidratación.

## Consecuencias
- Cero retrasos en la revisión de notas: cualquier administrador (Dueña, Karla o Fabricio) visualiza los mensajes de los profesores apenas ingresa al panel de control.
- Preservación estricta de la imagen institucional: ningún mensaje sale a los padres de familia sin el consentimiento de administración.
- Claridad organizativa en los roles del equipo Vibra Music.
