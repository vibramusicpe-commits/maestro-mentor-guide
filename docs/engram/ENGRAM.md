# Mapa de Memoria y Conocimiento (Engram): Vibra Music

Este documento constituye la memoria del sistema (**Engram**) que persiste el conocimiento de dominio, las reglas del negocio de la escuela de música Vibra Music y las restricciones arquitectónicas para la futura migración y trabajo en casa.

---

## 🧠 Grafo de Conocimiento del Dominio (Engram Nodes)

```mermaid
graph TD
    Node_SuperAdmin[Node: Super Admin / Dueña] -->|Control Total & Autorización| Node_Security[Aprobación de Eliminaciones & Wipe]
    Node_SuperAdmin -->|Finanzas & Egresos| Node_Expenses[Egresos Corporativos & Cuentas]
    
    Node_Staff[Node: Staff / Nayeli Secretaria] -->|6 Funciones Operativas| Node_SecFunctions[Operaciones Diarias]
    Node_SecFunctions -->|F1: Asistencia| Node_Attendance[Marcado en Vivo & Tasa Real]
    Node_SecFunctions -->|F2: Matrículas| Node_Matriculas[Alta Alumnos & Fechas Exactas]
    Node_SecFunctions -->|F3: Reprogramaciones| Node_Reschedule[Scope: Semana vs Mes]
    Node_SecFunctions -->|F4: WhatsApp Business| Node_WhatsApp[Bienvenida, Cobros y Recibos]
    Node_SecFunctions -->|F5: Retiros / Pausas| Node_Retiros[Pausas & Bajas con Historial]
    Node_SecFunctions -->|F6: Cobranzas & Abonos| Node_Cobranzas[Yape/Plin/Transf con N° Op]

    Node_SecFunctions -.->|Intento de Borrado| Node_DeletionReq[Solicitud de Eliminación Protegida]
    Node_DeletionReq -->|Revisión Dueña| Node_SuperAdmin

    Node_Students[Directorio de Alumnos] -->|Planes Dossier| Node_Planes[Mensual S/ 329 | Trim S/ 289.40 | Anual S/ 263.20]
    Node_Students -->|Clase Personalizada| Node_Personalizada[S/ 50 por clase · Sin Matrícula · Sin Recuperación]
    Node_Personalizada -->|Puntitos de Edad| Node_AgeDots[Verde: Juvenil | Plomo: Adulto | Amarillo: Junior]
```

---

## 📌 Principios de Memoria Operativa Engram (Versión v8)
1. **Segregación Estricta de Roles**:
   - Super Admin (Dueña): Autoriza eliminaciones, vaciados protegidos, reportes y configuración maestra.
   - Staff (Secretaría Nayeli): Opera las 6 funciones completas sin permisos de borrado físico directo.
2. **Clases Personalizadas (S/ 50)**:
   - No generan créditos de recuperación (`makeupCredits`) al cancelarse (ADR 004).
   - Fondo celeste (`#B2EBF2`) con puntito discreto en la esquina según rango de edad.
3. **Control Temporal Meticuloso**:
   - Fechas exactas `planStartDate` y `planEndDate` con cálculo determinista de fin (+1m, +3m, +12m).
   - La agenda de clases solo muestra las sesiones dentro del rango activo.
4. **Base de Datos Insforge PostgreSQL (MCP)**:
   - 18 tablas operativas sincronizadas en el esquema `public`.

---

## 🔗 Referencias de Arquitectura y Grafos
- **Grafo de Dependencias (Graphify)**: [`docs/graphify/dependency_graph.mermaid`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/graphify/dependency_graph.mermaid)
- **Grafo de Flujo de Datos (Graphify)**: [`docs/graphify/data_flow_graph.mermaid`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/graphify/data_flow_graph.mermaid)
- **Matriz de Memoria JSON (Engram)**: [`docs/engram/memory_graph.json`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/engram/memory_graph.json)
- **Registro de Auditoría de Bucles**: [`docs/logs/system_audit.log`](file:///C:/Users/USER/my%20music%20staff%20backend/docs/logs/system_audit.log)
