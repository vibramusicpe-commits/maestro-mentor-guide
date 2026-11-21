# ADR-0198: Panel 360° de Seguimiento y Renovación Docente (Puente Docente-Secretaría)

## Estado
Aprobado e Implementado

## Contexto y Problema de Negocio
En la operativa diaria de Vibra Music, los profesores en aula (Fernando en Sala B, Nathaly en Sala C, Jeremy en Sala A) son los primeros en notar la ausencia de alumnos cuyos ciclos de 8 clases (o 4 clases intensivas) han culminado. Frecuentemente, los docentes se acercaban a recepción a consultar a secretaría (Nayeli): *"¿Qué pasó con el alumno X? ¿Renovó? ¿Va a continuar?"*.

Sin embargo:
1. Secretaría atiende llamadas, WhatsApp de prospectos, cobros y recepción simultáneamente, generando cuellos de botella e interrupciones constantes.
2. En el Directorio de Alumnos Docente (`/teacher/alumnos`), los alumnos en estado `pausa` o `baja` estaban completamente ocultos por las directrices de protección ADR-0098 y ADR-0100, impidiendo al docente saber si un alumno que dejó de asistir fue pausado o si simplemente culminó sus clases sin renovar.
3. Existía una desconexión entre la percepción del profesor en sala y la gestión de cobranza y retención en secretaría.
4. Por normas estrictas de confidencialidad y gobernanza (ADR-0187, ADR-0183), los profesores **NUNCA** deben tener acceso a datos financieros (saldos, deudas, precios, comprobantes de pago ni recibos).

## Decisiones de Arquitectura

### 1. Pestaña de Doble Propósito en Portal Docente (`/teacher/alumnos`)
Se incorpora un selector de pestañas reactivo en la cabecera del directorio docente:
- **🟢 Alumnos Activos**: Mantiene intacto el directorio oficial de alumnos con `status: "activo"` (ADR-0098/0100).
- **🔄 Por Renovar / Seguimiento**: Nueva vista 360° que filtra quirúrgicamente a los alumnos del docente que:
  - Han culminado el 100% de las clases de su ciclo (`retention.category === "culminado"`: ej. 8/8 clases dictadas).
  - Están a 1 o 2 clases de culminar (`retention.category === "proximo_culminar"`: alerta preventiva).
  - Están en estado `pausa` o `baja` administrativa por falta de renovación (`isInactiveStatus === true`).
  - **Excluye** a los alumnos activos que se encuentran en progreso normal (`en_curso`).

### 2. Blindaje Estricto de Datos Financieros (Zero Financial Exposure)
El motor `src/lib/teacher-retention.ts` y la vista en `/teacher/alumnos` respetan de forma estricta las directrices de seguridad:
- El docente visualiza: Nombre del alumno, categoría pedagógica (JUNIOR, INFANTIL, etc.), edad, instrumento, profesor asignado, sala (A, B, C), horario habitual, fecha de la última clase asistida evaluada en sala, nombre del apoderado y teléfono de contacto para emergencias.
- El docente **NUNCA** visualiza: saldos pendientes (`balance`), precios de lista (`planPrice`), montos abonados (`amountPaid`), códigos de recibos (`invoices`) ni fotos de vouchers.

### 3. Puente de Comunicación 360° con Secretaría
Cada tarjeta de seguimiento de alumno cuenta con 3 acciones directas:
1. **📢 Avisar a Secretaría**:
   - Dispara una nota interna formal en `internal_notes` con visibilidad `"staff"`, categorizada como `[ALERTA DOCENTE - RENOVACIÓN]`.
   - Incluye el detalle exacto: profesor que emite la alerta, instrumento, vacante y horario habitual que se liberaría, y teléfono del apoderado.
   - Secretaría (Nayeli) recibe la nota de forma inmediata y en tiempo real en su bandeja de notas internas (`/admin/alumnos?tab=notas-internas`).
   - La interfaz docente marca visualmente la tarjeta como `✓ Aviso enviado` para evitar duplicidad de solicitudes en la misma sesión.
2. **💬 Consultar a Nayeli (WhatsApp)**:
   - Enlace directo a WhatsApp con mensaje cortés pre-redactado que resume la consulta del profesor con datos del horario y sala para que secretaría responda con un solo toque.
3. **📖 Kardex**:
   - Abre el modal `StudentAttendanceKardex` para que el profesor pueda corroborar cada una de las fechas y asistencias registradas en sala.

### 4. Cero Alteración de Base de Datos (Zero ALTER TABLE)
- Utiliza la infraestructura existente de `internal_notes` y `students` en Insforge PostgreSQL sin requerir nuevas columnas ni migraciones DDL.

## Consecuencias y Beneficios
- **Reducción de fricción operativa**: Los profesores ya no interrumpen la recepción física para consultar estados de continuidad.
- **Aumento de tasa de retención (LTV)**: Alertas tempranas y oportunas permiten a secretaría contactar a las familias antes de que se pierda la vacante o se enfríe el interés.
- **Seguridad y Privacidad**: Cero exposición de datos contables al personal docente.
- **Trazabilidad auditada**: Cada aviso queda registrado en `internal_notes` con sello de tiempo y emisor.
