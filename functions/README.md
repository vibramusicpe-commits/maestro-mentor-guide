# Asistente IA de Secretaría — Vibra Music Staff (Cloudflare Pages Function)

Endpoint server-side oficial impulsado por **Cloudflare Workers AI**, clasificador/guardrails **Clef** y consultas en tiempo real a **Insforge PostgreSQL** vía **PostgREST**.

---

## 1. Arquitectura del Asistente

```
[Cliente: Frontend / Nayeli]
             │  POST /api/assistant
             ▼
[functions/api/assistant.ts]
             │
    ┌────────┴──────────────────────────┐
    ▼                                   ▼
[functions/_lib/clef.ts]       [functions/_lib/prompts.ts]
- Detección de Prompt Injection - Reglas pedagógicas (ADR-0102)
- Clasificación de Intención    - Cuotas contractuales (8 / 4)
- Extracción de Entidades       - Formato ejecutivo
    │                                   │
    ▼                                   │
[functions/_lib/insforge.ts]            │
- Consultas seguras PostgREST           │
  (invoices, students, lessons, etc.)   │
    │                                   │
    └─────────────────┬─────────────────┘
                      ▼
        [@cf/meta/llama-3.1-8b-instruct]
                      │
                      ▼
         Respuesta redactada en JSON
```

---

## 2. Variables de Entorno Requeridas (Cloudflare Dashboard)

Configuradas en **Workers & Pages ➔ musicstaff-vm ➔ Settings ➔ Variables and Secrets** (Entorno Production, tipo **Secret**):

| Nombre de Variable | Tipo | Descripción |
| :--- | :--- | :--- |
| `INSFORGE_URL` | Secret | Endpoint de Insforge: `https://pdey9yma.us-east.insforge.app/api/database/records` |
| `INSFORGE_ANON_KEY` | Secret | API Key de Insforge PostgREST. |
| `ADMIN_TOKEN` | Secret (Opcional) | Token de autorización para proteger el endpoint. |

> **Nota:** Estas variables se configuran SIN prefijo `VITE_` para garantizar que permanezcan exclusivamente en el servidor (Pages Function) y nunca se expongan al navegador del cliente.

---

## 3. Especificación del Endpoint

### `POST /api/assistant`

#### Headers
```http
Content-Type: application/json
Authorization: Bearer <ADMIN_TOKEN>  (opcional si ADMIN_TOKEN está configurado)
```

#### Request Body
```json
{
  "query": "¿Qué alumnos tienen pagos pendientes?",
  "studentName": "Lucas" // (Opcional) para acotar la búsqueda
}
```

#### Response (HTTP 200)
```json
{
  "success": true,
  "intent": "cobranzas",
  "confidence": 0.95,
  "classified_by": "clef_workers_ai",
  "entities": {
    "studentName": "Lucas"
  },
  "response": "Tienes 3 alumnos con saldo pendiente en Insforge:\n• Lucas Bellido: Total S/ 297.00, Saldo pendiente S/ 147.00 (Vence: 2026-10-15)\n...",
  "model_used": "@cf/meta/llama-3.1-8b-instruct",
  "data_count": 3
}
```

---

## 4. Intenciones Soportadas por Clef

1. **`cobranzas`**: Deudas, estados de cuenta, recibos, saldos, avisos de vencimiento y confirmación de abonos.
2. **`horarios_aforos`**: Disponibilidad de turnos y cumplimiento estricto de aforo (máx. 5 alumnos por sala) y especialidad docente (Nathaly Sala C, Fernando Sala B, Jeremy Sala A).
3. **`kardex_asistencias`**: Cuántas clases le restan al alumno en su ciclo contractual (8 en Regular / 4 en Intensivo), faltas, asistencias y justificaciones.
4. **`prospectos_demos`**: Solicitudes de clases de prueba agendadas o pendientes de confirmación.
5. **`recordatorios`**: Apoyo administrativo para seguimiento a apoderados y docentes.
6. **`ayuda_general`**: Preguntas de operación general de la escuela.

---

## 5. Pruebas Rápidas con `curl`

### Consulta de Cobranzas:
```bash
curl -X POST https://musicstaff-vm.pages.dev/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"query": "¿Qué alumnos tienen pagos pendientes?"}'
```

### Consulta de Horarios y Aforos:
```bash
curl -X POST https://musicstaff-vm.pages.dev/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"query": "¿Hay cupo para piano con el profesor Fernando el viernes a las 5pm?"}'
```

### Consulta de Kardex de Asistencia:
```bash
curl -X POST https://musicstaff-vm.pages.dev/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"query": "¿Cuántas clases le faltan a Benjamin en su mes?"}'
```

---

## 6. Referencias y ADRs
- [ADR-0168: Asistente IA de Secretaría con Workers AI, Clef y PostgREST](../docs/adr/0168-asistente-ia-secretaria-workers-ai-clef-postgrest.md)
- [ADR-0102: Reglas Pedagógicas y Asignación de Profesores/Salas](../AGENTS.md)
- [ADR-0106: Gestión Quirúrgica de Cobros y Facturación](../AGENTS.md)
