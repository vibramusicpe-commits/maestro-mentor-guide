# 2026-11-18 — ADR-0196: caso "Mathias Gutierrez Chavez"

## Consultas (Insforge MCP, solo lectura)

```sql
select id, full_name, status, instrument, family_id,
       emergency_contact->>'name', emergency_contact->>'fatherName'
from students where full_name ilike '%mathias%' order by created_at desc;
-- 539feb70… | "Mathias " | activo | Batería | … | nn | Carlos Gutierrez

select concept, family_id from invoices where concept ilike '%mathias%';
-- "Plan Mensual (Batería) — Mathias " | familia 539feb70…
```

Sin registros con "Gutierrez Chavez" como `full_name`. Únicamente Karen
Gutierrez (pausa) y la familia "Familia Gutierrez Chavéz".

## Ejecución real del matcher

`npx tsc src/lib/student-matching.ts --outDir scratch/.matching-check …` +
`scratch/check-matching.cjs`:

```
"Mathias Gutierrez Chavez" vs "Mathias "  => true   ← falso duplicado
"Mathias Gutierrez" vs "Mathias Chavez"   => false  ← correcto
```

## Cambios

- `students-table.tsx`: `matchSearch` usa `normalizeStudentName` + tokens.
- `students-table.tsx`: `useEffect([duplicateMatch?.id])` reinicia la
  confirmación de homónimo; se retira el `setAllowDuplicateConfirmed(false)`
  del `onChange` del nombre.

## Verificación

- `scratch/check-mathias-search.cjs` → búsqueda por nombre completo y con
  tilde: `true`.
- `tsc --noEmit`: 150 → 150 (0 nuevos).
- `npm run build`: verde.
- Sin DDL, sin escrituras en PostgreSQL, sin tocar motores de ciclo/asistencia.
