# Mapa de Memoria y Conocimiento (Engram): Vibra Music

Este documento constituye la memoria viva del sistema (**Engram**) que persiste el conocimiento de dominio, las reglas del negocio de la escuela de música Vibra Music y las restricciones arquitectónicas para la escalabilidad institucional.

---

## 🧠 Grafo de Conocimiento del Dominio (Engram Nodes - v2.0.36 / Octubre 2026)

```mermaid
graph TD
    Node_SuperAdmin[Node: Super Admin / Dueña & Sergio] -->|Control Total & Auditoría| Node_Security[Aprobación de Eliminaciones Protegidas & Wipe]
    Node_SuperAdmin -->|Finanzas & Egresos| Node_Expenses[Egresos Corporativos & Cuentas]
    
    Node_Staff[Node: Staff / Secretaría] -->|Operaciones Autónomas| Node_SecFunctions[Operaciones de Agenda & Cobranza]
    Node_SecFunctions -->|Horario Autónomo| Node_ScheduleCtrl[ADR 0052: Edición & Eliminación Directa de Clases]
    Node_SecFunctions -->|Buscador Inmunizado| Node_Autocomplete[ADR 0164: Anti-Autofill 'camila' & Limpieza en 1 Clic]
    Node_SecFunctions -->|Libreta de Asistencias & Kardex| Node_PlanLedger[ADR 0053 & 0163: Supervisión 8 Clases Regular / 4 Intensivo 90m]
    Node_SecFunctions -->|Edición In-Place de Ficha| Node_InPlaceEdit[ADR 0059: Edición de Todos los Campos en Drawer]
    Node_SecFunctions -->|Cobranzas & Abonos| Node_Cobranzas[Yape/Plin con Vouchers & N° Op]
    Node_SecFunctions -->|Reingresos| Node_Reentry[Registro Histórico & Reactivación]
    Node_SecFunctions -->|Calendario Dinámico| Node_Calendar[ADR 0067 & 0158: Navegación Multimes y Semanas Reales]
    Node_SecFunctions -->|Vistas Compactas| Node_CompactAgenda[ADR 0066: Vista Diaria & Rejilla Semanal Alta Densidad]
    
    Node_SecFunctions -.->|Borrado de Alumno/Factura| Node_DeletionReq[Solicitud de Eliminación Protegida]
    Node_DeletionReq -->|Revisión Dueña| Node_SuperAdmin

    Node_Students[Directorio Alumnos Activos] -->|Planes Vibra| Node_Planes[Regular 8x45m | Intensivo 4x90m | Flexible 24x45m]
    Node_Students -->|Categorías de Edad| Node_Categories[Infantil: 4-6a | Junior: 7-12a | Juvenil: 13-17a | Adulto: 18+a]
    Node_Students -->|Clase Personalizada| Node_Personalizada[S/ 50 por clase · Sin Matrícula · Sin Recuperación]
    Node_Students -->|Créditos de Falta| Node_Credits[1 Falta Ausente o Justificada = +1 Crédito]
    Node_Students -->|Clases Recuperación| Node_Recup[Rojo Vivo en Agenda]
    Node_Students -->|Kardex Multi-Mes| Node_KardexEngine[ADR 0166: Preservación de Clases Contiguas +45m tras planEndDate]

    Node_Backend[PostgreSQL Insforge] -->|ADR 0060 & 0065: Records Endpoint & Live Hydration| Node_Hydration[useInsforgeSync en AdminLayout]
    Node_Backend -->|ADR 0165: Aprovisionamiento Bloques 90m| Node_IntensiveBlocks[Bloques Contiguos Sábados y Viernes]
```

---

## 📌 Principios de Memoria Operativa Engram (Versión v2.0.36 / Octubre 2026)

1. **Inmunización Absoluta de Autofill en Búsqueda (ADR 0164)**:
   - Toda entrada de búsqueda de alumnos implementa `autoComplete="off"`, `data-1p-ignore`, `data-lpignore="true"` y botón de reseteo rápido `<X />`.
   - Inicialización forzada de `search = ""` en ciclo de vida de montaje para erradicar precargas residuales de Chromium.
2. **Soporte de Adelantos Previos a `planStartDate` (ADR 0164)**:
   - El escaneo del ciclo lectivo (`scanStartDate`) retrocede dinámicamente hasta 30 días para incorporar clases adelantadas con `dateStr < startDate`.
   - Las plantillas recurrentes abiertas no se proyectan antes de `planStartDate`.
3. **Resolución Integral del Plan Intensivo (4 clases / 90 min) (ADR 0162, ADR 0163, ADR 0165)**:
   - Los bloques contiguos de 45 minutos se consolidan en una sola sesión de 90 minutos por fecha lectiva en Kardex.
   - En `student-cycle.ts`, `datesNeeded` filtra únicamente fechas no evaluadas previamente (`futureDates`), evitando que fechas parcialmente evaluadas consuman indebidamente la cuota.
   - Distintivo visual `⚡ 90m` en toda la plataforma (Kardex, AgendaBoard y Kiosco Docente).
4. **Preservación Incondicional de Clases Contiguas (+45m) más allá de `planEndDate` (ADR 0166)**:
   - Las lecciones con `dateStr` explícito nunca son descartadas por la barrera `isBeyondEnd` en Kardex.
   - La deduplicación por fecha en `student-cycle.ts` permite franjas horarias contiguas (`dateStr-time`) en una misma fecha lectiva para lecciones con fecha fija.
   - `handleAddConsecutiveClass` hereda `isMakeup` del bloque padre.
5. **Autonomía de Secretaría en Agenda (ADR 0052, ADR 0053, ADR 0105)**:
   - Control autónomo para reprogramar clases (alcance puntual por fecha vs recurrente) deduplicando estrictamente por slot (`dateStr-time`).

---

## 🔗 Referencias de Arquitectura y Grafos
- **ADR 0166 (Clases Contiguas de Corrido +45m)**: [`docs/adr/0166-preservacion-clases-contiguas-corrido-45m-mas-alla-planenddate-micaela-sofia.md`](file:///c:/Users/USER/my%20music%20staff%20backend/docs/adr/0166-preservacion-clases-contiguas-corrido-45m-mas-alla-planenddate-micaela-sofia.md)
- **ADR 0165 (Resolución Integral Plan Intensivo 90 min)**: [`docs/adr/0165-resolucion-integral-plan-intensivo-90min-horario-clases-motor-ciclos.md`](file:///c:/Users/USER/my%20music%20staff%20backend/docs/adr/0165-resolucion-integral-plan-intensivo-90min-horario-clases-motor-ciclos.md)
- **ADR 0164 (Inmunización Autofill y Adelantos Previos)**: [`docs/adr/0164-inmunizar-autofill-busqueda-corregir-duplicidad-bruno-marcelo-adelantos-santiago-valladolid.md`](file:///c:/Users/USER/my%20music%20staff%20backend/docs/adr/0164-inmunizar-autofill-busqueda-corregir-duplicidad-bruno-marcelo-adelantos-santiago-valladolid.md)
- **ADR 0163 (Unificación Kardex Intensivos 90m)**: [`docs/adr/0163-unificacion-kardex-intensivos-distintivos-visuales-reactivacion-benjamin.md`](file:///c:/Users/USER/my%20music%20staff%20backend/docs/adr/0163-unificacion-kardex-intensivos-distintivos-visuales-reactivacion-benjamin.md)
- **ADR 0162 (Consolidación 90m Kardex y Horario)**: [`docs/adr/0162-consolidacion-integral-90m-plan-intensivo-kardex-horarios.md`](file:///c:/Users/USER/my%20music%20staff%20backend/docs/adr/0162-consolidacion-integral-90m-plan-intensivo-kardex-horarios.md)
- **Grafo de Flujo de Datos (Graphify)**: [`docs/graphify/data_flow_graph.mermaid`](file:///c:/Users/USER/my%20music%20staff%20backend/docs/graphify/data_flow_graph.mermaid)
- **Grafo de Dependencias (Graphify)**: [`docs/graphify/dependency_graph.mermaid`](file:///c:/Users/USER/my%20music%20staff%20backend/docs/graphify/dependency_graph.mermaid)
