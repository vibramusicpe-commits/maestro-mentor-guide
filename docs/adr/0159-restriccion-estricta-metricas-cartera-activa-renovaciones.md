# ADR 0159: Restricción Estricta de Métricas a Cartera Activa en Seguimiento & Renovación

## Estado
Aprobado e Implementado (v2.0.29) — 05 de Octubre, 2026

## Contexto
1. **Conteo Inflado en Pestaña "Seguimiento & Renovación" (`/admin/alumnos`)**:
   - En `src/components/admin/student-renewals-retention-panel.tsx`, el panel inyectaba alumnos inactivos (`inactiveStudents` en estado `pausa` o `baja`), mostrando un número inflado de 93 alumnos ("Cartera global").
   - La directiva administrativa estipula que todos los paneles operativos deben trabajar exclusivamente con la base de datos activa (`status === "activo"`).

## Decisiones Técnicas
1. **Aislamiento Exclusivo de la Cartera Activa**:
   - Se removió la inyección de `inactiveStudents` en el cómputo de métricas `computedData`.
   - Se eliminó la categoría y el botón de filtro `⚪ Pausa / Baja` de este panel.
2. **Reestructuración de Métricas a 4 Columnas**:
   - `Total Alumnos Activos`: Base activa oficial en cartera.
   - `🔴 Culminados`: Alumnos listos para renovar mes.
   - `🟡 Por Culminar`: Alumnos en alerta preventiva (≤ 2 clases restantes).
   - `🟢 En Curso`: Progreso regular (> 2 clases restantes).

## Verificación
- Verificado en `/admin/alumnos` pestaña "Seguimiento & Renovación": el total coincide rigurosamente con los alumnos activos.
- Compilación `npm run build` exitosa con 0 errores.
