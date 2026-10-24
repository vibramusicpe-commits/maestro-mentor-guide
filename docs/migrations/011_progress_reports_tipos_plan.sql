-- ================================================================
-- 011 — Informes por tipo de plan
-- ================================================================
-- Objetivo:
--   1. Permitir los 4 tipos de informe aprobados el 2026-10-23:
--        mensual | trimestral | avance | cierre_ciclo
--   2. Evitar informes duplicados vivos del mismo alumno, tipo y ventana.
--
-- Reglas:
--   - Aditiva y reversible. No borra ni reescribe filas.
--   - No agrega columnas: `content.plan`, `content.evidence` y
--     `content.sessionLog` viven en el jsonb existente.
--   - Cero datos financieros.
--
-- Ejecutar en Insforge PostgreSQL (Dirección / responsable de base de datos).
-- ================================================================

-- ================================================================
-- EJECUCIÓN (Compatible con InsForge Web SQL Editor)
-- Nota: En InsForge Web no incluir 'begin;' ni 'commit;' porque el
-- editor ejecuta cada lote dentro de su propia transacción administrada.
-- ================================================================

-- 1. Ampliar el CHECK constraint a los 4 tipos de informe oficiales
--    (mensual, trimestral, avance, cierre_ciclo)
alter table progress_reports
  drop constraint if exists progress_reports_period_type_check;

alter table progress_reports
  add constraint progress_reports_period_type_check
  check (period_type in ('mensual', 'trimestral', 'avance', 'cierre_ciclo'));

-- 2. Deduplicación por ventana lectiva: un solo informe vivo por alumno + tipo + periodo
--    Excluye informes de prueba (is_test = true) y rechazados (status = 'rejected')
create unique index if not exists progress_reports_unique_period
  on progress_reports (student_id, period_type, period_start, period_end)
  where is_test = false and status <> 'rejected';

-- ================================================================
-- ROLLBACK (solo si se revierte la funcionalidad)
-- ================================================================
-- begin;
--   drop index if exists progress_reports_unique_period;
--   alter table progress_reports
--     drop constraint if exists progress_reports_period_type_check;
--   alter table progress_reports
--     add constraint progress_reports_period_type_check
--     check (period_type in ('mensual', 'trimestral'));
-- commit;
--
-- Antes del rollback: mover o eliminar los informes con period_type
-- 'avance' / 'cierre_ciclo', o el CHECK fallará.
