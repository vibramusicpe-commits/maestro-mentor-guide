# ADR 0068: Corrección de ReferenceError en Copia de Invitaciones y Diferenciación de Iconos de Navegación

## Estado
Aceptado e Implementado

## Contexto
1. **Error en Panel de Invitaciones:**
   - Al hacer clic en el botón de ver credenciales (ojo) en /admin/invitaciones y presionar el botón de copiar enlace directo o ID de cuenta, la aplicación lanzaba la excepción:
     ReferenceError: CheckCircle2 is not defined at admin.invitaciones-r6zw_2aw.js
   - Causa raíz: En src/routes/admin.invitaciones.tsx, se renderizaba <CheckCircle2 className=h-3.5 w-3.5 text-success /> al activarse el estado de copiado, pero el componente CheckCircle2 no había sido importado desde lucide-react.
2. **Duplicidad Visual de Iconos en Sidebar/Navegación:**
   - La sección **Alumnos** (/admin/alumnos) y la sección **Invitaciones** (/admin/invitaciones) utilizaban el mismo icono (Users2), generando confusión visual en la barra lateral de administración.

## Decisiones Técnicas

### 1. Corrección del Import de CheckCircle2 en src/routes/admin.invitaciones.tsx
- Se agregó explícitamente CheckCircle2 a la lista de importaciones de lucide-react.
- Con esto, al copiar el enlace o las credenciales, el feedback visual cambia a un check circular verde sin romper el ciclo de renderizado de React.

### 2. Diferenciación de Iconos en src/routes/admin.tsx
- **Alumnos (/admin/alumnos):** Asignado a GraduationCap (birrete académico característico de estudiantes).
- **Invitaciones (/admin/invitaciones):** Asignado a UserPlus (añadir usuarios / invitar accesos y credenciales).

## Consecuencias
- Resolución completa del crash al copiar enlaces o credenciales de invitaciones.
- Jerarquía y distinción visual clara e intuitiva en la barra de navegación del administrador.
- Verificación exitosa de compilación (
pm run build exitoso con 0 errores).
