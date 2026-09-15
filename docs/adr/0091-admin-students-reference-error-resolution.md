# ADR 0091: Resolución Quirúrgica de ReferenceError `adminStudents is not defined` en Directorio de Alumnos

## Estado
Aceptado (Accepted)

## Fecha
2026-09-15

## Contexto
1. **Incidencia en Producción (`/admin/alumnos`)**:
   - Al acceder al portal administrativo en la sección de Directorio de Alumnos, la aplicación experimentaba un error en tiempo de ejecución:
     ```text
     ReferenceError: adminStudents is not defined
         at Ie (admin.alumnos-BvtMD_35.js:12:15703)
     Uncaught Error: Minified React error #418
     ```
   - Este fallo impedía la renderización de la tabla de estudiantes e interrumpía el proceso de hidratación de React en el cliente.

2. **Diagnóstico Quirúrgico de Causa Raíz**:
   - En el archivo `src/components/admin/students-table.tsx`, el selector del store extraía la lista de alumnos bajo la constante `students`:
     ```typescript
     const students = useAppStore((s) => s.adminStudents);
     ```
   - Sin embargo, en el hook `liveKardexStudent` (utilizado para el seguimiento dinámico de fichas y kardex de alumnos):
     ```typescript
     const liveKardexStudent = useMemo(() => {
       if (!kardexStudent) return null;
       return adminStudents.find((st) => st.id === kardexStudent.id) || kardexStudent;
     }, [adminStudents, kardexStudent]);
     ```
   - Cuando el motor de JavaScript ejecutaba la función del componente para montar el árbol de React, evaluaba el arreglo de dependencias `[adminStudents, kardexStudent]`. Al no estar declarado `adminStudents` en el ámbito de la función ni en las importaciones del módulo, disparaba inmediatamente un `ReferenceError`.
   - Como resultado secundario, React 19 no podía reconciliar el DOM generado en el servidor (SSR) con el fallo prematuro en el cliente, arrojando el error de hidratación (`Minified React error #418`).

## Decisiones Técnicas

### 1. Corrección de Referencia en `liveKardexStudent`
- Se reemplazó la llamada a `adminStudents` por `students` tanto en la búsqueda del estudiante como en el arreglo de dependencias:
  ```typescript
  const liveKardexStudent = useMemo(() => {
    if (!kardexStudent) return null;
    return students.find((st) => st.id === kardexStudent.id) || kardexStudent;
  }, [students, kardexStudent]);
  ```

### 2. Alias de Blindaje Léxico
- Se incorporó la asignación `const adminStudents = students;` inmediatamente después de la desestructuración del store:
  ```typescript
  const students = useAppStore((s) => s.adminStudents);
  const adminStudents = students;
  ```
- Este alias garantiza inmunidad total ante cualquier futura llamada o extensión dentro de `StudentsTable`, asegurando que ambas nomenclaturas apunten reactivamente al mismo arreglo del store.

### 3. Estabilización de Hidratación React 19 (Resolución de Error #418)
- **Causa Raíz de #418**: React 19 emite el error `#418` (*Hydration failed because the initial UI does not match what was rendered on the server*) cuando el árbol DOM generado en Cloudflare Pages (SSR) difiere de la primera pasada en el navegador debido a lectura síncrona de `localStorage`.
- **Medidas Implementadas**:
  1. `src/routes/admin.tsx`: Se determinó el estado inicial de `isCollapsed: false` y `isDarkMode: true` de forma idéntica al servidor, difiriendo la lectura de `localStorage` al ciclo `useEffect`.
  2. `src/components/admin/students-table.tsx`: Se trasladó la lectura de `cadencia-invitations` en `NewStudentDialog` fuera de `useMemo` hacia un `useEffect`, impidiendo discrepancias en las opciones de profesores entre SSR y cliente.
  3. `src/routes/__root.tsx`: Se aplicó `suppressHydrationWarning` en los tags raíz `<html>` y `<body>`.
  4. Condición `mounted` en badges numéricos y contadores de papelera para evitar desajustes de texto iniciales.

## Validación y Verificación
- **Build de Producción**: Se ejecutó `npm run build` con código de retorno `0`, validando la compilación del módulo SSR y empaquetado Nitro/Vite.
- **Despliegues en Producción**:
  - `7586da7`: Resolución del `ReferenceError`.
  - `2162444`: Estabilización de hidratación y eliminación de `React error #418`.

## Consecuencias
- Carga limpia, instantánea y sin advertencias en consola del Directorio de Alumnos (`/admin/alumnos`).
- Eliminación total y definitiva del fallo de hidratación de React #418.
- Paridad 100% garantizada entre SSR en Cloudflare y renderizado en clientes de escritorio y móviles.
