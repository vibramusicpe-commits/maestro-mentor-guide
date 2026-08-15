-- ================================================================
-- Vibra Music / Cadencia — Migración 003: Cierre de Caja Diario
-- EJECUTAR EN: SQL Editor de Insforge (pdey9yma.us-east.insforge.app)
-- Depende de: 002_vibra_music_complete_schema.sql
-- ================================================================

-- ---------------------------------------------------------------
-- 1. TIPO ENUM para estado del cierre
-- ---------------------------------------------------------------
CREATE TYPE closing_status_enum AS ENUM ('abierto', 'cerrado', 'exportado');

-- ---------------------------------------------------------------
-- 2. TABLA: daily_closings (Cierre de Caja Diario)
-- ---------------------------------------------------------------
CREATE TABLE daily_closings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  closing_date          DATE NOT NULL UNIQUE,        -- Un solo cierre por día
  total_cash            NUMERIC(10,2) DEFAULT 0.00,  -- Efectivo del día
  total_yape            NUMERIC(10,2) DEFAULT 0.00,  -- Yape del día
  total_transfer        NUMERIC(10,2) DEFAULT 0.00,  -- Transferencia bancaria
  total_culqi_card      NUMERIC(10,2) DEFAULT 0.00,  -- Pagos con tarjeta Culqi
  total_day             NUMERIC(10,2) GENERATED ALWAYS AS  -- Total calculado automáticamente
    (total_cash + total_yape + total_transfer + total_culqi_card) STORED,
  num_transactions      INTEGER DEFAULT 0,            -- Cantidad de abonos incluidos
  closed_by_user_id     UUID REFERENCES users(id),
  closed_by_role        TEXT NOT NULL DEFAULT 'staff',
  status                closing_status_enum DEFAULT 'cerrado',
  export_url            TEXT,                         -- URL del CSV generado (Insforge Storage)
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
  -- Inmutable: sin updated_at por diseño (el cierre es un hecho histórico)
);

-- ---------------------------------------------------------------
-- 3. TABLA: closing_audit_links (Liga cierre ↔ payment_audit_logs)
-- Registra qué logs de pago quedaron 'bloqueados' en este cierre.
-- ---------------------------------------------------------------
CREATE TABLE closing_audit_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  closing_id      UUID REFERENCES daily_closings(id) ON DELETE CASCADE,
  audit_log_id    UUID REFERENCES payment_audit_logs(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 4. CAMPO ADICIONAL en payment_audit_logs: is_closed
-- Marca si un log ya fue incluido en un cierre (bloqueado para edición).
-- ---------------------------------------------------------------
ALTER TABLE payment_audit_logs
  ADD COLUMN IF NOT EXISTS is_closed      BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS closing_id     UUID REFERENCES daily_closings(id);

-- ---------------------------------------------------------------
-- 5. RLS — daily_closings
-- ---------------------------------------------------------------
ALTER TABLE daily_closings ENABLE ROW LEVEL SECURITY;

-- Super Admin: acceso total
CREATE POLICY closings_super_admin ON daily_closings FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Staff: puede INSERT (crear cierre) y SELECT (ver su propio cierre del día)
CREATE POLICY closings_staff_insert ON daily_closings FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY closings_staff_select ON daily_closings FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'staff');

-- Staff NO puede UPDATE ni DELETE (cierre es inmutable)

-- ---------------------------------------------------------------
-- 6. RLS — closing_audit_links
-- ---------------------------------------------------------------
ALTER TABLE closing_audit_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_links_admin ON closing_audit_links FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY audit_links_staff ON closing_audit_links FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'staff');

-- ---------------------------------------------------------------
-- 7. ÍNDICES
-- ---------------------------------------------------------------
CREATE INDEX idx_closing_date         ON daily_closings(closing_date DESC);
CREATE INDEX idx_closing_status       ON daily_closings(status);
CREATE INDEX idx_audit_link_closing   ON closing_audit_links(closing_id);
CREATE INDEX idx_audit_log_closed     ON payment_audit_logs(is_closed) WHERE is_closed = FALSE;

-- ---------------------------------------------------------------
-- 8. FUNCIÓN: perform_daily_closing
-- Lógica central del "Cierre de Caja":
--   1. Suma los payment_audit_logs del día por método de pago
--   2. Inserta fila en daily_closings
--   3. Marca los logs como is_closed = TRUE (bloqueados)
--   4. Retorna la data lista para exportar a CSV
--
-- RBAC Gate: solo super_admin y staff pueden ejecutarla.
-- Llamar con: SELECT * FROM perform_daily_closing('2025-06-15', 'user-uuid');
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION perform_daily_closing(
  p_closing_date    DATE,
  p_user_id         UUID
)
RETURNS TABLE (
  closing_id        UUID,
  closing_date      DATE,
  total_cash        NUMERIC,
  total_yape        NUMERIC,
  total_transfer    NUMERIC,
  total_culqi_card  NUMERIC,
  total_day         NUMERIC,
  num_transactions  INTEGER,
  status            closing_status_enum
) AS $$
DECLARE
  v_role              TEXT;
  v_closing_id        UUID;
  v_total_cash        NUMERIC := 0;
  v_total_yape        NUMERIC := 0;
  v_total_transfer    NUMERIC := 0;
  v_total_culqi       NUMERIC := 0;
  v_num_transactions  INTEGER := 0;
BEGIN
  -- [RBAC Gate] — Solo super_admin y staff
  v_role := auth.jwt() ->> 'role';
  IF v_role NOT IN ('super_admin', 'staff') THEN
    RAISE EXCEPTION 'PERMISSION_DENIED: Solo super_admin o staff pueden ejecutar el cierre de caja.';
  END IF;

  -- [Idempotency Check] — No crear doble cierre para el mismo día
  IF EXISTS (SELECT 1 FROM daily_closings WHERE closing_date = p_closing_date) THEN
    RAISE EXCEPTION 'ALREADY_CLOSED: Ya existe un cierre para la fecha %.', p_closing_date;
  END IF;

  -- [Aggregate Edge] — Suma por método de pago del día
  SELECT
    COALESCE(SUM(CASE WHEN payment_method = 'Efectivo'     THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN payment_method = 'Yape'         THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN payment_method = 'Transferencia' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN payment_method = 'Culqi'        THEN amount ELSE 0 END), 0),
    COUNT(*)
  INTO
    v_total_cash, v_total_yape, v_total_transfer, v_total_culqi, v_num_transactions
  FROM payment_audit_logs
  WHERE
    created_at::DATE = p_closing_date
    AND is_closed = FALSE;

  -- [Insert Edge] — Registrar el cierre
  INSERT INTO daily_closings (
    closing_date, total_cash, total_yape, total_transfer, total_culqi_card,
    num_transactions, closed_by_user_id, closed_by_role, status
  )
  VALUES (
    p_closing_date, v_total_cash, v_total_yape, v_total_transfer, v_total_culqi,
    v_num_transactions, p_user_id, v_role, 'cerrado'
  )
  RETURNING id INTO v_closing_id;

  -- [Lock Edge] — Marcar los logs del día como bloqueados
  UPDATE payment_audit_logs
  SET is_closed = TRUE, closing_id = v_closing_id
  WHERE
    created_at::DATE = p_closing_date
    AND is_closed = FALSE;

  -- Registrar las ligas de auditoría
  INSERT INTO closing_audit_links (closing_id, audit_log_id)
  SELECT v_closing_id, id
  FROM payment_audit_logs
  WHERE closing_id = v_closing_id;

  -- [Return Edge] — Datos para exportar a CSV
  RETURN QUERY
  SELECT
    dc.id,
    dc.closing_date,
    dc.total_cash,
    dc.total_yape,
    dc.total_transfer,
    dc.total_culqi_card,
    dc.total_day,
    dc.num_transactions,
    dc.status
  FROM daily_closings dc
  WHERE dc.id = v_closing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------
-- 9. FUNCIÓN: get_closing_detail_for_csv
-- Devuelve el detalle línea a línea de un cierre (para el CSV del contador).
-- Llamar con: SELECT * FROM get_closing_detail_for_csv('closing-uuid');
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_closing_detail_for_csv(p_closing_id UUID)
RETURNS TABLE (
  fecha           TEXT,
  familia         TEXT,
  concepto        TEXT,
  metodo_pago     TEXT,
  monto           NUMERIC,
  n_operacion     TEXT,
  registrado_por  TEXT,
  nota            TEXT
) AS $$
BEGIN
  -- [RBAC Gate]
  IF auth.jwt() ->> 'role' NOT IN ('super_admin', 'staff') THEN
    RAISE EXCEPTION 'PERMISSION_DENIED';
  END IF;

  RETURN QUERY
  SELECT
    TO_CHAR(pal.created_at AT TIME ZONE 'America/Lima', 'YYYY-MM-DD HH24:MI') AS fecha,
    f.family_name                                                               AS familia,
    i.concept                                                                   AS concepto,
    pal.payment_method::TEXT                                                    AS metodo_pago,
    pal.amount                                                                  AS monto,
    COALESCE(pal.voucher_reference, '')                                        AS n_operacion,
    COALESCE(u.full_name, pal.registered_by_role)                              AS registrado_por,
    COALESCE(pal.note, '')                                                     AS nota
  FROM closing_audit_links cal
  JOIN payment_audit_logs  pal ON pal.id = cal.audit_log_id
  JOIN invoices             i   ON i.id  = pal.invoice_id
  JOIN families             f   ON f.id  = i.family_id
  LEFT JOIN users           u   ON u.id  = pal.registered_by_user_id
  WHERE cal.closing_id = p_closing_id
  ORDER BY pal.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- FIN DEL SCRIPT 003
-- ================================================================
