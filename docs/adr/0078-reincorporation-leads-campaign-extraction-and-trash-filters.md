# ADR 0078: Extractor de Leads de Reincorporación para Campañas y Filtros Avanzados en Papelera de Eliminados

## Estado
Aceptado

## Fecha
2026-09-08

## Contexto
El registro histórico de alumnos eliminados (`deletedStudents` establecido en ADR 0077) contenía información comercial de alto valor. Sin embargo, la dirección y secretaría requerían transformar esta papelera en un **motor proactivo de reactivación comercial y generación de leads**:
1. **Necesidad de Campañas de Reincorporación**:
   - Alumnos que dejaron de estudiar (`retiro_voluntario`) o que dejaron de pagar (`falta_pago`) representan prospectos idóneos para promociones exclusivas (matrícula gratis, descuentos en mensualidad, horarios preferentes).
2. **Filtrado Excluyente de Datos Basura**:
   - Errores de tipeo de secretaría (`error_registro`) y registros de prueba o demostración (`prueba_sistema`) NO deben contaminar las listas de difusión ni los reportes de marketing.
3. **Agilidad en la Extracción de Datos**:
   - Se requería la exportación directa a formato CSV estructurado compatible con Microsoft Excel en Windows (UTF-8 con BOM) y el copiado masivo de teléfonos limpios con código de país para listas de difusión de WhatsApp o herramientas de mensajería masiva.

## Decisiones

### 1. Componente Especializado `DeletedStudentsTrashModal`
Se creó `src/components/admin/deleted-students-trash-modal.tsx` con capacidades de:
- **Pestañas de Segmentación Inteligente**:
  - `🎯 Leads de Reincorporación (Promos)`: Aísla exclusivamente `falta_pago` y `retiro_voluntario`.
  - `📋 Todos los Registros`: Vista completa de auditoría histórica.
  - `⚠️ Descartables / Errores`: Aísla `error_registro` y `prueba_sistema`.
- **Búsqueda y Filtros Multicriterio**:
  - Búsqueda en tiempo real por nombre de alumno, familia, instrumento, profesor, teléfono del alumno, teléfono del padre o de la madre.
  - Filtro por motivo exacto.
  - Filtro por fecha y hora (Hoy, Últimos 7 días, Últimos 30 días, Este mes, Rango personalizado desde/hasta).
- **Herramientas de Extracción Directa**:
  - `📥 Exportar Leads a CSV (Excel)`: Genera un archivo con BOM `\uFEFF` con columnas completas (Alumno, Familia, Instrumento, Modalidad, Motivo, Detalle, Fecha/Hora Retiro, Teléfono Alumno, Papá, Teléfono Papá, Mamá, Teléfono Mamá, Contacto Emergencia).
  - `📋 Copiar Teléfonos para Difusión`: Extrae todos los teléfonos únicos válidos sin caracteres extraños para listas de difusión.
  - `💬 WhatsApp Promo Directo`: Abre WhatsApp con una plantilla personalizada cordial invitando a la reincorporación con promoción exclusiva y reserva de cupo.
  - `♻️ Restaurar Alumno`: Botón individual para reincorporar al alumno al padrón activo si acepta la propuesta.

### 2. Integración con el Módulo de Campañas WhatsApp (`/admin/campanas`)
En `src/routes/admin.campanas.tsx`:
- Se agregó la plantilla oficial `tpl-7`: "Promoción de reincorporación".
- Se conectó `useAppStore` para alimentar la lista de destinatarios con los alumnos activos y los leads de reincorporación de `deletedStudents`.
- Se implementó el selector de audiencia:
  - `Todos`
  - `Activos`
  - `🎯 Reincorporación (N)`: Excluye automáticamente errores y pruebas técnicas, permitiendo enviar la campaña masiva oficial por Meta Cloud API en un solo clic.

## Consecuencias
- La administración y dirección pueden ejecutar campañas de reactivación comercial en cualquier momento con datos limpios y clasificados.
- Se previene el contacto erróneo con pruebas o registros descartables.
- Trazabilidad y recuperación inmediata de alumnos en caso de aceptación de promociones.
