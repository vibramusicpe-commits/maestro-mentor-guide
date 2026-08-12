# Mapa de Memoria y Conocimiento (Engram): Vibra Music

Este documento constituye la memoria del sistema (**Engram**) que persiste el conocimiento de dominio, las reglas del negocio de la escuela de música Vibra Music y las restricciones arquitectónicas para la futura migración.

---

## 🧠 Grafo de Conocimiento del Dominio (Engram Nodes)

```mermaid
graph TD
    Node_SuperAdmin[Node: Super Admin / Dueña] -->|Control Total| Node_Expenses[Egresos Corporativos & Cuentas]
    Node_Staff[Node: Staff / Secretaria] -->|Gestión Directa| Node_Students[Directorio de Alumnos]
    Node_Staff -->|Rejilla Semanal| Node_Agenda[Agenda de Clases]
    Node_Staff -->|Registra Abonos| Node_Payments[Cobros Yape / Efectivo / Transferencia]
    Node_Staff -->|Dispara Avisos| Node_Alerts[Avisos a 2 Días de Vencer]

    Node_Students -->|Modalidad A| Node_Regular[Regular: 8 clases / 45m]
    Node_Students -->|Modalidad B| Node_Intensivo[Intensivo: 4 clases / 90m]
    Node_Students -->|Faltas & Recuperación| Node_Credits[Créditos: +1 Falta / -1 Recuperación]
    Node_Students -->|Atención Social| Node_Birthdays[Cumpleaños & 25% Desc]
```

---

## 📌 Principios de Memoria Operativa Engram
1. **Segregación de Roles**: Super Admin vs Staff (Egresos protegidos vs Ingresos operativos).
2. **Modalidades Oficiales**:
   - Regular (8 clases x 45 min).
   - Intensivo (4 clases x 90 min).
3. **Gestión Transparente de Créditos**: Acumulación por inasistencia y deducción por recuperación asistida.
4. **Ciclo de Cobros a 2 Días**: Alertas preventivas previas a la fecha fija de vencimiento.

---

## 🔗 Referencias de Arquitectura y Grafos
- **Grafo de Dependencias (Graphify)**: [`docs/graphify/dependency_graph.mermaid`](file:///c:/Users/USER/my%20music%20staff/docs/graphify/dependency_graph.mermaid)
- **Grafo de Flujo de Datos (Graphify)**: [`docs/graphify/data_flow_graph.mermaid`](file:///c:/Users/USER/my%20music%20staff/docs/graphify/data_flow_graph.mermaid)
- **Matriz de Memoria JSON (Engram)**: [`docs/engram/memory_graph.json`](file:///c:/Users/USER/my%20music%20staff/docs/engram/memory_graph.json)
- **Registro de Auditoría de Bucles**: [`docs/logs/execution_tracker.log`](file:///c:/Users/USER/my%20music%20staff/docs/logs/execution_tracker.log)
