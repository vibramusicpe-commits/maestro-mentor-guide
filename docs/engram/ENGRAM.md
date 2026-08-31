# Mapa de Memoria y Conocimiento (Engram): Vibra Music

Este documento constituye la memoria viva del sistema (**Engram**) que persiste el conocimiento de dominio, las reglas del negocio de la escuela de música Vibra Music y las restricciones arquitectónicas para la escalabilidad institucional.

---

## 🧠 Grafo de Conocimiento del Dominio (Engram Nodes - v18 / Agosto 2026)

```mermaid
graph TD
    Node_SuperAdmin[Node: Super Admin / Dueña] -->|Control Total & Auditoría| Node_Security[Aprobación de Eliminaciones Protegidas & Wipe]
    Node_SuperAdmin -->|Finanzas & Egresos| Node_Expenses[Egresos Corporativos & Cuentas]
    
    Node_Staff[Node: Staff / Nayeli Secretaria] -->|Operaciones Autónomas| Node_SecFunctions[Operaciones de Agenda & Cobranza]
    Node_SecFunctions -->|Horario Autónomo| Node_ScheduleCtrl[ADR 0052: Edición & Eliminación Directa de Clases]
    Node_SecFunctions -->|Buscador 83 Alumnos Separados| Node_Autocomplete[ADR 0053 & 0061: Combobox & Individualización Total]
    Node_SecFunctions -->|Libreta de Asistencias| Node_PlanLedger[ADR 0053: Supervisión 8 Clases Regular / 4 Intensivo]
    Node_SecFunctions -->|Edición In-Place de Ficha| Node_InPlaceEdit[ADR 0059: Edición de Todos los Campos en Drawer]
    Node_SecFunctions -->|Cobranzas & Abonos| Node_Cobranzas[Yape/Plin con Vouchers & N° Op]
    Node_SecFunctions -->|Reingresos| Node_Reentry[Registro Histórico & Reactivación]
    Node_SecFunctions -->|Calendario Dinámico| Node_Calendar[ADR 0067: Semanas Reales, Semana 5 & Lun 31 Ago]
    Node_SecFunctions -->|Vistas Compactas| Node_CompactAgenda[ADR 0066: Vista Diaria & Rejilla Semanal Alta Densidad]
    
    Node_SecFunctions -.->|Borrado de Alumno/Factura| Node_DeletionReq[Solicitud de Eliminación Protegida]
    Node_DeletionReq -->|Revisión Dueña| Node_SuperAdmin

    Node_Students[Directorio 83 Alumnos Separados] -->|Planes Vibra| Node_Planes[Mensual S/ 297 | Trimestral S/ 261.40 | Anual S/ 237.60]
    Node_Students -->|Categorías de Edad| Node_Categories[Infantil: 5-6a | Junior: 7-12a | Juvenil: 13-17a | Adulto: 18+a]
    Node_Students -->|Clase Personalizada| Node_Personalizada[S/ 50 por clase · Sin Matrícula · Sin Recuperación]
    Node_Students -->|Créditos de Falta| Node_Credits[1 Falta Ausente o Justificada = +1 Crédito]
    Node_Students -->|Clases Recuperación| Node_Recup[Rojo Vivo en Agenda]

    Node_Backend[PostgreSQL Insforge] -->|ADR 0060 & 0065: Records Endpoint & Live Hydration| Node_Hydration[useInsforgeSync en AdminLayout]
```

---

## 📌 Principios de Memoria Operativa Engram (Versión v19 / Agosto 2026)

1. **Sincronización Real del Calendario Dinámico (ADR 0067)**:
   - Toda visualización mensual calcula de forma reactiva las semanas formativas de Lunes a Sábado (`calendar-utils.ts`).
   - Soporte total para la Semana 5 de Agosto (Lunes 31 de Agosto) y coincidencia matemática exacta en todos los meses del año (Setiembre, Octubre, etc.).
2. **Optimización de Alta Densidad en Agenda (ADR 0066)**:
   - Vista por Día y Rejilla Semanal compactadas en más del 50% de altura vertical, suprimiendo textos e instrumentos duplicados y manteniendo 100% inalterada la Vista Didáctica Oficial de Nayeli (1x1 y 2x2).
3. **Normalización de Base de Datos en Insforge (ADR 0065 & 0060)**:
   - El cliente de Insforge se conecta a `/api/database/records` garantizando 0 errores 404 en consola y sincronización aditiva segura sin borrado de datos.
4. **Individualización Total de Alumnos (ADR 0061)**:
   - Los 83 alumnos reales extraídos de `ESTUDIANTES VIBRA MUSIC .xlsx` son entidades individuales e independientes.
5. **Autonomía de Secretaría en Agenda (ADR 0052 & 0053)**:
   - Nayeli tiene control autónomo para crear, mover, reprogramar (Semana vs Mes) y eliminar clases por error de tipeo sin trámites bloqueantes de Dirección.

---

## 🔗 Referencias de Arquitectura y Grafos
- **ADR 0067 (Calendario Dinámico & Semana 5)**: [`docs/adr/0067-dynamic-calendar-weeks-and-real-date-synchronization.md`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/adr/0067-dynamic-calendar-weeks-and-real-date-synchronization.md)
- **ADR 0066 (Vistas Compactas de Alta Densidad)**: [`docs/adr/0066-compact-day-and-weekly-agenda-views.md`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/adr/0066-compact-day-and-weekly-agenda-views.md)
- **ADR 0065 (Normalización Insforge API Records)**: [`docs/adr/0065-insforge-api-database-records-endpoint-normalization.md`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/adr/0065-insforge-api-database-records-endpoint-normalization.md)
- **ADR 0061 (Individualización Alumnos)**: [`docs/adr/0061-individual-student-data-separation.md`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/adr/0061-individual-student-data-separation.md)
- **ADR 0060 (Persistencia PostgreSQL)**: [`docs/adr/0060-postgresql-persistence-and-cloud-hydration.md`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/adr/0060-postgresql-persistence-and-cloud-hydration.md)
- **ADR 0059 (Edición In-Place en Ficha)**: [`docs/adr/0059-full-in-place-student-panel-editing.md`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/adr/0059-full-in-place-student-panel-editing.md)
- **ADR 0057 (Categorías y Recuperaciones)**: [`docs/adr/0057-age-categories-adult-support-and-red-makeup-color.md`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/adr/0057-age-categories-adult-support-and-red-makeup-color.md)
- **Grafo de Flujo de Datos (Graphify)**: [`docs/graphify/data_flow_graph.mermaid`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/graphify/data_flow_graph.mermaid)
