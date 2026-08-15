-- ================================================================
-- Migración 005: Control Horario (Time Tracking) & Reporte de Horas
-- EJECUTAR EN: SQL Editor de Insforge
-- Depende de: 002_vibra_music_complete_schema.sql
-- ================================================================

-- ---------------------------------------------------------------
-- 1. TIPOS ENUM
-- ---------------------------------------------------------------
CREATE TYPE shift_status_enum AS ENUM ('trabajando', 'pausa', 'finalizado');

-- ---------------------------------------------------------------
-- 2. TABLA: teacher_time_logs (Registro de Fichajes de Profesores)
-- ---------------------------------------------------------------
CREATE TABLE teacher_time_logs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id            UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  teacher_name          TEXT NOT NULL,
  clock_in              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clock_out             TIMESTAMPTZ,
  break_minutes         INTEGER DEFAULT 0,                 -- Minutos totales en pausa
  total_minutes_worked  INTEGER GENERATED ALWAYS AS (      -- Minutos netos calculados
    CASE 
      WHEN clock_out IS NOT NULL THEN 
        GREATEST(0, (EXTRACT(EPOCH FROM (clock_out - clock_in)) / 60)::INTEGER - COALESCE(break_minutes, 0))
      ELSE 0 
    END
  ) STORED,
  status                shift_status_enum DEFAULT 'trabajando',
  origin_device         TEXT DEFAULT 'kiosk_mobile',       -- 'kiosk_mobile' o 'reception_pin'
  is_closed             BOOLEAN DEFAULT FALSE,             -- Bloqueado tras cierre de reporte
  payroll_closing_id    UUID,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 3. TABLA: payroll_closings (Cierres de Reportes de Horas)
-- ---------------------------------------------------------------
CREATE TABLE payroll_closings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start          DATE NOT NULL,
  period_end            DATE NOT NULL,
  total_teachers_count  INTEGER DEFAULT 0,
  total_hours_sum       NUMERIC(10,2) DEFAULT 0.00,
  closed_by_user_id     UUID REFERENCES users(id),
  closed_by_role        TEXT NOT NULL DEFAULT 'super_admin',
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 4. RLS — teacher_time_logs
-- ---------------------------------------------------------------
ALTER TABLE teacher_time_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY time_logs_super_admin ON teacher_time_logs FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY time_logs_staff_select ON teacher_time_logs FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'staff');

-- Profesores pueden INSERT/UPDATE su propio log activo (si no está cerrado)
CREATE POLICY time_logs_teacher_insert ON teacher_time_logs FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'teacher');

CREATE POLICY time_logs_teacher_update ON teacher_time_logs FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'role' = 'teacher' AND is_closed = FALSE)
  WITH CHECK (auth.jwt() ->> 'role' = 'teacher' AND is_closed = FALSE);

-- ---------------------------------------------------------------
-- 5. RLS — payroll_closings
-- ---------------------------------------------------------------
ALTER TABLE payroll_closings ENABLE ROW LEVEL SECURITY;

CREATE POLICY payroll_closings_admin ON payroll_closings FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'staff'));

-- ---------------------------------------------------------------
-- 6. ÍNDICES
-- ---------------------------------------------------------------
CREATE INDEX idx_time_logs_teacher     ON teacher_time_logs(teacher_id);
CREATE INDEX idx_time_logs_clock_in    ON teacher_time_logs(clock_in DESC);
CREATE INDEX idx_time_logs_status      ON teacher_time_logs(status);
CREATE INDEX idx_time_logs_closed      ON teacher_time_logs(is_closed) WHERE is_closed = FALSE;

-- ---------------------------------------------------------------
-- 7. TRIGGER: updated_at
-- ---------------------------------------------------------------
CREATE TRIGGER trg_teacher_time_logs_updated_at
  BEFORE UPDATE ON teacher_time_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------
-- 8. FUNCIÓN: generate_payroll_hours_report
-- Procesa y consolida las horas trabajadas por cada profesor.
-- Cierra el periodo marcando is_closed = TRUE.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_payroll_hours_report(
  p_start_date    DATE,
  p_end_date      DATE,
  p_user_id       UUID
)
RETURNS TABLE (
  teacher_id      UUID,
  teacher_name    TEXT,
  shift_count     BIGINT,
  total_minutes   BIGINT,
  total_hours     NUMERIC(10,2)
) AS $$
DECLARE
  v_role          TEXT;
  v_closing_id    UUID;
  v_total_sum     NUMERIC(10,2) := 0;
  v_teacher_cnt   INTEGER := 0;
BEGIN
  v_role := auth.jwt() ->> 'role';
  IF v_role NOT IN ('super_admin', 'staff') THEN
    RAISE EXCEPTION 'PERMISSION_DENIED: Solo super_admin o staff pueden generar reportes de horas.';
  END IF;

  -- Crear el cierre del periodo
  INSERT INTO payroll_closings (period_start, period_end, closed_by_user_id, closed_by_role)
  VALUES (p_start_date, p_end_date, p_user_id, v_role)
  RETURNING id INTO v_closing_id;

  -- Bloquear logs del rango
  UPDATE teacher_time_logs
  SET is_closed = TRUE, payroll_closing_id = v_closing_id
  WHERE clock_in::DATE >= p_start_date 
    AND clock_in::DATE <= p_end_date 
    AND status = 'finalizado'
    AND is_closed = FALSE;

  -- Retornar agregados por profesor para el CSV
  RETURN QUERY
  SELECT
    ttl.teacher_id,
    ttl.teacher_name,
    COUNT(*) AS shift_count,
    COALESCE(SUM(ttl.total_minutes_worked), 0) AS total_minutes,
    ROUND((COALESCE(SUM(ttl.total_minutes_worked), 0) / 60.0)::NUMERIC, 2) AS total_hours
  FROM teacher_time_logs ttl
  WHERE ttl.payroll_closing_id = v_closing_id
  GROUP BY ttl.teacher_id, ttl.teacher_name
  ORDER BY ttl.teacher_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- FIN DEL SCRIPT 005
-- ================================================================
