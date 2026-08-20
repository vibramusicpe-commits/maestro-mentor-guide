# ADR 0059: Edición Directa e Integral en la Ficha del Alumno (In-Place Panel Editing)

## Estado
Aceptado e Implementado

## Contexto (Feedback Nayeli - Secretaría)
Al abrir la ficha de cualquier estudiante desde `/admin/alumnos` (Sheet Drawer), Nayeli requería poder modificar directamente en pantalla todos y cada uno de los campos del alumno (Nombre, Instrumento, Nivel, Profesor, Edad, Categoría de Color, Modalidad, Plan Oficial, Fechas de Inicio/Fin, Contactos y Observaciones) con guardado automático y sincronización en tiempo real.

## Decisiones Técnicas

### 1. Ficha Académica & Datos Principales 100% Editable ([`students-table.tsx`](file:///C:/Users/USER/my%20music%20staff%20backend/src/components/admin/students-table.tsx))
- Incorporada una tarjeta principal editable en el Drawer con:
  * **Nombre Completo del Alumno:** Input con sincronización a `schedule` de la agenda.
  * **Apellidos / Familia / Titular:** Input editable.
  * **Instrumento Musical:** Selector interactivo (`Piano`, `Guitarra clásica`, `Guitarra eléctrica`, `Violín`, `Batería`, `Canto`, `Piano Infantil`).
  * **Nivel Formativo:** Selector (`Principiante`, `Intermedio`, `Avanzado`).
  * **Profesor Asignado:** Selector interactivo con sincronización a la agenda docente.
  * **Edad del Alumno:** Input numérico.
  * **Categoría de Edad:** Selector con codificación de colores para la agenda (`Infantil`, `Junior`, `Juvenil`, `Adulto`, `Personalizada`).
  * **Estado de Matrícula:** Selector (`Activo`, `En pausa`, `Baja`).

### 2. Plan de Inversión y Matrícula Oficial (Dossier Comunidad Vibra)
- Selector de Planes Oficiales con precios actualizados:
  * **Mensual:** S/ 297.00 / mes.
  * **Trimestral:** S/ 261.40 / mes.
  * **Anual:** S/ 237.60 / mes.
- Cálculo automático de fecha de fin / vigencia al modificar fecha de inicio o tipo de plan.
- Badge con cálculo exacto de la mensualidad contratada.
- Toggle interactivo de entrega del Pack de Útiles Anual (S/ 67.00).

### 3. Ficha de Contacto, Emergencia y Notas Pedagógicas
- Correo, Teléfono / WhatsApp, Fecha de Cumpleaños, Nombre de Familia.
- Contacto de emergencia: Nombre, Parentesco y Teléfono de Emergencia.
- **Notas Pedagógicas y Observaciones:** Textarea de notas internas del docente y secretaría.

## Consecuencias y Validación
- Secretaría puede editar cualquier dato sin necesidad de navegar a otros formularios o salir de la ficha.
- `npm run build` ejecutado exitosamente con 0 errores (459ms).
