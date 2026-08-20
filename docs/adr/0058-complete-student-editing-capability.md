# ADR 0058: Módulo Integral de Edición de Estudiantes y Corrección de Matrícula

## Estado
Aceptado e Implementado

## Contexto (Feedback Secretaría - Nayeli)
Secretaría solicitó una función directa para editar cualquier dato de un alumno ya registrado ("se debería poder editar en el panel la opción de agregar estudiante por si hay algún error"), de modo que ante cualquier equivocación al ingresar datos (ej. error ortográfico en nombre, instrumento incorrecto, profesor mal asignado, cambio de edad, rectificación de titularidad o fechas de plan), se pueda corregir de inmediato sin tener que eliminar o volver a matricular.

## Decisiones Técnicas

### 1. Componente `EditStudentSheet` ([`students-table.tsx`](file:///C:/Users/USER/my%20music%20staff%20backend/src/components/admin/students-table.tsx))
- Formulario de edición completo prellenado con todos los datos existentes del alumno:
  * Nombre Completo del Alumno.
  * Switch de Alumno Adulto (Mayor de 18 años) con titularidad directa.
  * Apellidos de la Familia / Apoderado (opcional si es adulto).
  * Edad y Categoría de Edad asignada (`Infantil`, `Junior`, `Juvenil`, `Adulto`, `Personalizada`).
  * Instrumento y Nivel formativo (`Principiante`, `Intermedio`, `Avanzado`).
  * Profesor Asignado (lista sincronizada).
  * Frecuencia y Modalidad (`Regular 8 clases`, `Intensivo 4 clases`).
  * Plan Oficial Dossier (`Mensual`, `Trimestral`, `Anual`), Matrícula y Pack de Útiles.
  * Fechas exactas de inicio y fin/vencimiento.
  * Contactos: Teléfono/WhatsApp, Correo, Cumpleaños y Contacto de Emergencia completo.

### 2. Puntos de Acceso en la Interfaz
- **Botón "✏️ Editar":** En cada fila de la tabla de alumnos para acceso rápido.
- **Botón "✏️ Editar Ficha":** En la cabecera del Drawer de detalles del alumno.

### 3. Sincronización Automática en Zustand Store ([`app-store.ts`](file:///C:/Users/USER/my%20music%20staff%20backend/src/store/app-store.ts))
- `updateStudentDetails` ahora propaga instantáneamente los cambios clave (`name`, `instrument`, `teacher`, `ageCategory`) a todas las clases programadas del alumno en el horario (`schedule`), manteniendo total coherencia entre el directorio y la agenda.

## Consecuencias y Validación
- Secretaría puede rectificar cualquier error tipográfico u operativo en segundos.
- La integridad referencial entre alumnos y horario se mantiene al 100%.
- Compilación `npm run build` verificada exitosamente (0 errores).
