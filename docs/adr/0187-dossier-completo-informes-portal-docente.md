# ADR-0187: Dossier Completo de Informes en el Portal Docente

**Fecha:** 2026-11-03
**Estado:** Implementado y verificado.
**Autores:** Equipo Vibra (Open Code & Dirección)
**Versión:** 2.0.58
**Relación:** ADR-0175 (Fase 5), ADR-0180, ADR-0182, ADR-0185, ADR-0119.3

---

## Contexto

El docente ya podía **crear** informes en `/teacher/informes`, pero solo veía su lista como filas resumidas. Podía **Completar/Revisar** mientras estaba en borrador; al publicarse quedaba únicamente un ✓ verde.

**El hueco:** el profesor **no podía abrir el documento final** de un informe publicado para revisar qué se entregó a la familia.

Dirección pidió: conexión nueva en el portal del profesor para **ver y revisar sus informes**, con dossiers personalizados y visualizaciones quirúrgicas.

---

## Decisión

### 1. Reutilizar, no duplicar (ADR-0119.3)

Se verificó que **ya existían** todos los componentes, así que no se reescribió nada:

| Componente | Función |
|---|---|
| `buildProgressReportView` | Modelo del informe |
| `ProgressReportDocument` | A4 de solo lectura + anexo |
| `ReportSessionLogAnnex` | Bitácora clase por clase |
| `generateProgressReportMarkdown` | Salida para LLM |
| `generateProgressReportWhatsApp` | Mensaje para la familia |
| `PROGRESS_REPORT_PRINT_CSS` | CSS de impresión (ADR-0136/0137) |

Lo único nuevo es el **visor del docente** que los conecta.

### 2. Nuevo visor (`src/components/teacher/teacher-report-viewer.tsx`)

Dossier completo en un `Dialog`, en **solo lectura**:

- **Documento del apoderado** (páginas 1-2).
- **Anexo de bitácora clase por clase** desde la página 3, con rótulo `PÁGINA N DE 2 · ANEXO`.
- Barra de acciones: **Copiar LLM**, **WhatsApp**, **Imprimir / PDF**, y toggle de **fuente Markdown**.
- Chip **`🔒 Solo lectura`** visible.
- Aviso cuando el informe **no está publicado**: *"es una vista previa interna"*.
- Muestra **código de informe** y **periodo**.

### 3. Lista quirúrgica en el portal docente

- **Filtros por estado**: Todos · Borradores · En revisión · Publicados · Devueltos.
- Contador dinámico: `Mis informes (N de M)` cuando hay filtro activo.
- Botón **`👁 Ver informe`** en **cada** fila, incluidos los publicados.
- Mensaje de vacío diferenciado: sin informes vs. sin resultados para el filtro.

### 4. Aislamiento por cohorte (seguridad)

`filteredReports` excluye cualquier informe cuyo `student_id` **no esté en la cohorte del docente** (`myStudentIds`):

```
report.student_id && !myStudentIds.has(report.student_id) → se descarta
```

Un docente **no puede abrir** el informe de un alumno que no dicta, aunque llegue por datos manipulados.

### 5. El docente NO publica

`approveProgressReport` / `publishProgressReport` siguen siendo **exclusivos de Dirección**. El visor no expone ninguna acción de mutación sobre el estado del informe.

---

## Verificación

### Con datos sintéticos (producción tiene 0 informes)

**Sin bitácora:**
```
sessionLog: 0 → anexo: NO
etiqueta página 1: PÁGINA 1 DE 2
```

**Con bitácora (dossier completo):**
```
sessionLog: 2 → anexo: SI (DOSSIER COMPLETO)
etiqueta página 1: PÁGINA 1 DE 2 · ANEXO
etiqueta página 2: PÁGINA 2 DE 2 · ANEXO
markdown: 1136 chars | sección bitácora: true
```

**Cero datos financieros:**
```
markdown contiene S/ / saldo / deuda → false
whatsapp contiene S/                → false
```

`npm run build` en verde.

---

## Estados y límites

| Situación | Comportamiento |
|---|---|
| Informe `draft` | Se abre con aviso de vista previa interna |
| Informe `pending` | Ídem; Dirección aún revisa |
| Informe `published` | Se abre completo, con anexo si hay bitácora |
| Informe `rejected` | Se abre + motivo de devolución en la lista |
| Sin informes | Mensaje que explica el mínimo de 2 bitácoras |

**Límites honestos:**
- Con **0 informes** en producción, la lista aparecerá vacía hasta que se generen los primeros. La vista está lista; el dato no existe aún.
- El anexo solo aparece si el informe tiene `content.sessionLog` (informes antiguos pueden no tenerlo).
- No se añadió buscador por alumno dentro de la lista del docente (los filtros por estado cubren el caso actual). Se puede añadir con volumen.
- El docente **no** puede descargar un PDF generado en servidor: usa `window.print()` (igual que Dirección y el portal familia).
