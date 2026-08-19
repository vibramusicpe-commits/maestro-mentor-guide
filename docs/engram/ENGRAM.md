# Mapa de Memoria y Conocimiento (Engram): Vibra Music

Este documento constituye la memoria del sistema (**Engram**) que persiste el conocimiento de dominio, las reglas del negocio de la escuela de música Vibra Music y las restricciones arquitectónicas para la escalabilidad institucional.

---

## 🧠 Grafo de Conocimiento del Dominio (Engram Nodes - v16)

```mermaid
graph TD
    Node_SuperAdmin[Node: Super Admin / Dueña] -->|Control Total & Auditoría| Node_Security[Aprobación de Eliminaciones Protegidas & Wipe]
    Node_SuperAdmin -->|Finanzas & Egresos| Node_Expenses[Egresos Corporativos & Cuentas]
    
    Node_Staff[Node: Staff / Nayeli Secretaria] -->|Operaciones Autónomas| Node_SecFunctions[Operaciones de Agenda & Cobranza]
    Node_SecFunctions -->|Horario Autónomo| Node_ScheduleCtrl[ADR 0052: Edición & Eliminación Directa de Clases]
    Node_SecFunctions -->|Buscador 99 Alumnos| Node_Autocomplete[ADR 0053: Combobox & Autocompletado Inteligente]
    Node_SecFunctions -->|Libreta de Asistencias| Node_PlanLedger[ADR 0053: Supervisión 8 Clases Regular / 4 Intensivo]
    Node_SecFunctions -->|Cobranzas & Abonos| Node_Cobranzas[Yape/Plin con Vouchers & N° Op]
    Node_SecFunctions -->|Reingresos| Node_Reentry[Registro Histórico & Reactivación]
    
    Node_SecFunctions -.->|Borrado de Alumno/Factura| Node_DeletionReq[Solicitud de Eliminación Protegida]
    Node_DeletionReq -->|Revisión Dueña| Node_SuperAdmin

    Node_Students[Directorio 99 Alumnos] -->|Planes Vibra| Node_Planes[Regular: 8 clases/mes | Intensivo: 4 clases/mes]
    Node_Students -->|Clase Personalizada| Node_Personalizada[S/ 50 por clase · Sin Matrícula · Sin Recuperación]
    Node_Students -->|Créditos de Falta| Node_Credits[1 Falta Ausente o Justificada = +1 Crédito]
```

---

## 📌 Principios de Memoria Operativa Engram (Versión v16)

1. **Autonomía de Secretaría en Agenda (ADR 0052)**:
   - Nayeli tiene control 100% autónomo para crear, mover, reprogramar (Semana vs Mes) y eliminar clases por error de tipeo sin trámites ni confirmaciones bloqueantes de Dirección.
2. **Programación Inteligente con Autocompletado (ADR 0053)**:
   - Al buscar cualquier alumno en el modal de agendamiento, se autocompletan instantáneamente su profesor, instrumento y categoría oficial.
3. **Control Estricto de Regla 8 / 4 Clases (Libreta de Asistencias)**:
   - Plan Regular = 8 clases mensuales obligatorias.
   - Plan Intensivo = 4 clases mensuales obligatorias.
   - La libreta de asistencias supervisa en tiempo real el cumplimiento y saldo de créditos de recuperación.
4. **Base de Datos Insforge PostgreSQL (MCP & PostgREST)**:
   - 18 tablas operativas en el esquema `public`.
   - Autenticación y RBAC verificado mediante `assertRole(userRole, ['super_admin', 'staff'])`.

---

## 🔗 Referencias de Arquitectura y Grafos
- **ADR 0052 (Autonomía Secretaría)**: [`docs/adr/0052-secretaria-autonomous-schedule-management-and-direct-deletion.md`](file:///c:/Users/USER/my%20music%20staff%20backend/docs/adr/0052-secretaria-autonomous-schedule-management-and-direct-deletion.md)
- **ADR 0053 (Buscador y Libreta Asistencias)**: [`docs/adr/0053-autocomplete-student-combobox-and-plan-attendance-ledger.md`](file:///c:/Users/USER/my%20music%20staff%20backend/docs/adr/0053-autocomplete-student-combobox-and-plan-attendance-ledger.md)
- **Grafo de Flujo de Datos (Graphify)**: [`docs/graphify/data_flow_graph.mermaid`](file:///c:/Users/USER/my%20music%20staff%20backend/docs/graphify/data_flow_graph.mermaid)
- **Log Maestro de Auditoría**: [`docs/logs/system_audit.log`](file:///c:/Users/USER/my%20music%20staff%20backend/docs/logs/system_audit.log)
