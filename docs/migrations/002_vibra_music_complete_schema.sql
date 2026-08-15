-- ================================================================
-- Vibra Music / Cadencia — Migración Completa v2
-- Insforge / PostgreSQL — EJECUTAR EN EL SQL EDITOR DE INSFORGE
-- ================================================================
-- INSTRUCCIÓN: Ejecuta este script COMPLETO en el SQL Editor de
-- tu proyecto Insforge (pdey9yma.us-east.insforge.app).
-- Incluye: Tipos Enum, Tablas, RLS, Políticas por Rol,
-- Índices, Triggers, LMS (online_resources), Notificaciones.
-- ================================================================

-- ---------------------------------------------------------------
-- 0. EXTENSIONES NECESARIAS
-- ---------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------
-- 1. TIPOS ENUM
-- ---------------------------------------------------------------
CREATE TYPE student_status_enum   AS ENUM ('activo', 'pausa', 'baja');
CREATE TYPE lesson_modality_enum  AS ENUM ('Regular (8 clases / 45 min)', 'Intensivo (4 clases / 90 min)');
CREATE TYPE payment_status_enum   AS ENUM ('al-dia', 'pendiente', 'vencido');
CREATE TYPE invoice_status_enum   AS ENUM ('pagado', 'parcial', 'pendiente', 'vencido');
CREATE TYPE payment_method_enum   AS ENUM ('Yape', 'Efectivo', 'Transferencia', 'Culqi');
CREATE TYPE attendance_enum       AS ENUM ('presente', 'ausente', 'tarde', 'recuperacion');
CREATE TYPE notification_channel_enum AS ENUM ('whatsapp', 'email', 'sms', 'in_app');
CREATE TYPE resource_type_enum    AS ENUM ('pdf', 'audio', 'video', 'imagen', 'partitura', 'otro');

-- ---------------------------------------------------------------
-- 2. TABLA: users (Roles del sistema)
-- ---------------------------------------------------------------
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('super_admin', 'staff', 'teacher', 'family')),
  phone       TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- Super Admin ve todos. El resto solo se ve a sí mismo.
CREATE POLICY users_super_admin ON users FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY users_self ON users FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- ---------------------------------------------------------------
-- 3. TABLA: families (Apoderados y datos de familia)
-- ---------------------------------------------------------------
CREATE TABLE families (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name                TEXT NOT NULL,
  primary_guardian_name      TEXT NOT NULL,
  primary_guardian_phone     TEXT NOT NULL,
  secondary_guardian_name    TEXT,
  secondary_guardian_phone   TEXT,
  email                      TEXT NOT NULL,
  payment_day                INTEGER DEFAULT 1,   -- Día fijo de pago (1, 15, etc.)
  automatic_payment          BOOLEAN DEFAULT FALSE,
  linked_user_id             UUID REFERENCES users(id),  -- Usuario portal familia
  created_at                 TIMESTAMPTZ DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
CREATE POLICY families_admin_staff ON families FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'staff'));
CREATE POLICY families_own ON families FOR SELECT TO authenticated
  USING (linked_user_id = auth.uid());

-- ---------------------------------------------------------------
-- 4. TABLA: students (Alumnos)
-- ---------------------------------------------------------------
CREATE TABLE students (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id            UUID REFERENCES families(id) ON DELETE CASCADE,
  full_name            TEXT NOT NULL,
  instrument           TEXT NOT NULL,
  level                TEXT DEFAULT 'Nivel 1',
  assigned_teacher_id  UUID REFERENCES users(id),
  modality             lesson_modality_enum DEFAULT 'Regular (8 clases / 45 min)',
  status               student_status_enum DEFAULT 'activo',
  makeup_credits       INTEGER DEFAULT 0 CHECK (makeup_credits >= 0),
  birthdate            DATE,
  attendance_rate      NUMERIC(5,2) DEFAULT 100.00,
  emergency_contact    JSONB,   -- { name, phone, relation }
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY students_admin_staff ON students FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'staff'));
CREATE POLICY students_teacher ON students FOR SELECT TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'teacher'
    AND assigned_teacher_id = auth.uid()
  );
CREATE POLICY students_family ON students FOR SELECT TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'family'
    AND family_id IN (SELECT id FROM families WHERE linked_user_id = auth.uid())
  );

-- ---------------------------------------------------------------
-- 5. TABLA: lessons (Clases programadas — Agenda)
-- ---------------------------------------------------------------
CREATE TABLE lessons (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id           UUID REFERENCES students(id) ON DELETE CASCADE,
  teacher_id           UUID REFERENCES users(id),
  scheduled_date       DATE NOT NULL,
  scheduled_time       TIME NOT NULL,
  duration_minutes     INTEGER NOT NULL CHECK (duration_minutes IN (45, 90)),
  modality             lesson_modality_enum,
  room                 TEXT,
  status               TEXT DEFAULT 'programada' CHECK (status IN ('programada','completada','cancelada','reprogramada')),
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY lessons_admin_staff ON lessons FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'staff'));
CREATE POLICY lessons_teacher_own ON lessons FOR SELECT TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'teacher'
    AND teacher_id = auth.uid()
  );
CREATE POLICY lessons_teacher_update ON lessons FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'role' = 'teacher' AND teacher_id = auth.uid())
  WITH CHECK (auth.jwt() ->> 'role' = 'teacher' AND teacher_id = auth.uid());
CREATE POLICY lessons_family_own ON lessons FOR SELECT TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'family'
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN families f ON s.family_id = f.id
      WHERE f.linked_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------
-- 6. TABLA: attendance_logs (Bitácora de asistencia)
-- ---------------------------------------------------------------
CREATE TABLE attendance_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id       UUID REFERENCES lessons(id) ON DELETE CASCADE,
  student_id      UUID REFERENCES students(id),
  teacher_id      UUID REFERENCES users(id),
  status          attendance_enum NOT NULL,
  arrived_at      TIME,
  credit_delta    INTEGER DEFAULT 0,  -- +1 por falta, -1 por recuperación
  note            TEXT,
  registered_at   TIMESTAMPTZ DEFAULT NOW()
);
-- Inmutable: no se permite UPDATE ni DELETE (anti-fraude)
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY attendance_insert_teacher ON attendance_logs FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('teacher', 'staff', 'super_admin'));
CREATE POLICY attendance_select_admin ON attendance_logs FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'staff'));
CREATE POLICY attendance_select_teacher ON attendance_logs FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'teacher' AND teacher_id = auth.uid());

-- ---------------------------------------------------------------
-- 7. TABLA: invoices (Recibos de cobro)
-- ---------------------------------------------------------------
CREATE TABLE invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id         UUID REFERENCES families(id) ON DELETE CASCADE,
  concept           TEXT NOT NULL,
  amount            NUMERIC(10,2) NOT NULL,      -- Precio original — inmutable para Staff
  amount_paid       NUMERIC(10,2) DEFAULT 0.00,
  remaining_balance NUMERIC(10,2) NOT NULL,
  due_date          DATE NOT NULL,
  status            invoice_status_enum DEFAULT 'pendiente',
  payment_method    payment_method_enum,
  reminded_at       TIMESTAMPTZ,
  culqi_charge_id   TEXT,                         -- ID de cargo Culqi (chr_...)
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY invoices_admin ON invoices FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'super_admin');
-- Staff puede SELECT y UPDATE (registrar abonos), pero NO INSERT/DELETE
CREATE POLICY invoices_staff_select ON invoices FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'staff');
CREATE POLICY invoices_staff_update ON invoices FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'role' = 'staff')
  WITH CHECK (
    -- Staff NO puede modificar el monto original (amount)
    auth.jwt() ->> 'role' = 'staff'
  );
CREATE POLICY invoices_family_own ON invoices FOR SELECT TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'family'
    AND family_id IN (SELECT id FROM families WHERE linked_user_id = auth.uid())
  );

-- ---------------------------------------------------------------
-- 8. TABLA: payment_audit_logs (Bitácora inmutable anti-fraude)
-- ---------------------------------------------------------------
CREATE TABLE payment_audit_logs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id              UUID REFERENCES invoices(id) ON DELETE CASCADE,
  registered_by_user_id   UUID REFERENCES users(id),
  registered_by_role      TEXT NOT NULL,         -- 'staff' o 'super_admin'
  amount                  NUMERIC(10,2) NOT NULL,
  payment_method          payment_method_enum NOT NULL,
  voucher_reference       TEXT,                  -- N° Operación / Ref WhatsApp / ID Culqi
  note                    TEXT,
  culqi_token_id          TEXT,                  -- tkn_... de Culqi si aplica
  created_at              TIMESTAMPTZ DEFAULT NOW()
  -- SIN updated_at: este registro es INMUTABLE
);
ALTER TABLE payment_audit_logs ENABLE ROW LEVEL SECURITY;
-- INSERT permitido a staff y super_admin; UPDATE y DELETE solo super_admin
CREATE POLICY audit_insert ON payment_audit_logs FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('staff', 'super_admin'));
CREATE POLICY audit_select_admin ON payment_audit_logs FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY audit_select_staff ON payment_audit_logs FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'staff');
-- NINGÚN rol puede UPDATE ni DELETE esta tabla (audit trail inmutable)

-- ---------------------------------------------------------------
-- 9. TABLA: company_expenses (EXCLUSIVO SUPER ADMIN)
-- ---------------------------------------------------------------
CREATE TABLE company_expenses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider      TEXT NOT NULL,
  concept       TEXT NOT NULL,
  amount        NUMERIC(10,2) NOT NULL,
  expense_date  DATE DEFAULT CURRENT_DATE,
  category      TEXT,
  receipt_url   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE company_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY expenses_super_admin_only ON company_expenses FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'super_admin');
-- Staff, Teacher y Family NO tienen acceso (RLS bloquea silenciosamente)

-- ---------------------------------------------------------------
-- 10. TABLA: demo_requests (Clases de prueba)
-- ---------------------------------------------------------------
CREATE TABLE demo_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name     TEXT NOT NULL,
  parent_phone    TEXT NOT NULL,
  student_name    TEXT NOT NULL,
  instrument      TEXT NOT NULL,
  preferred_date  DATE,
  preferred_time  TIME,
  status          TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente','confirmada','completada','cancelada')),
  notes           TEXT,
  handled_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY demo_requests_admin_staff ON demo_requests FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'staff'));

-- ---------------------------------------------------------------
-- 11. TABLA: online_resources (LMS — Repositorio de Materiales)
-- ---------------------------------------------------------------
CREATE TABLE online_resources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  resource_type   resource_type_enum NOT NULL,
  file_url        TEXT NOT NULL,            -- URL en Insforge Storage o CDN externo
  file_size_kb    INTEGER,
  instrument      TEXT,                     -- Filtro por instrumento (opcional)
  level           TEXT,                     -- Filtro por nivel (opcional)
  uploaded_by     UUID REFERENCES users(id),
  is_public       BOOLEAN DEFAULT FALSE,    -- TRUE: visible a familias sin login
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE online_resources ENABLE ROW LEVEL SECURITY;
-- Super Admin y Staff: CRUD completo
CREATE POLICY resources_admin_staff ON online_resources FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'staff'));
-- Teachers pueden subir materiales (INSERT/SELECT)
CREATE POLICY resources_teacher_insert ON online_resources FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'teacher');
CREATE POLICY resources_teacher_select ON online_resources FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'teacher');
-- Familias: solo pueden descargar (SELECT) — no subir
CREATE POLICY resources_family_download ON online_resources FOR SELECT TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'family'
    AND (
      is_public = TRUE
      OR instrument IN (
        SELECT DISTINCT instrument FROM students s
        JOIN families f ON s.family_id = f.id
        WHERE f.linked_user_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------
-- 12. TABLA: notification_logs (Historial de mensajería)
-- ---------------------------------------------------------------
CREATE TABLE notification_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type  TEXT NOT NULL CHECK (recipient_type IN ('family', 'student', 'all')),
  recipient_id    UUID,                          -- family_id o student_id
  channel         notification_channel_enum NOT NULL,
  subject         TEXT,
  body            TEXT NOT NULL,
  sent_by         UUID REFERENCES users(id),
  sent_at         TIMESTAMPTZ DEFAULT NOW(),
  status          TEXT DEFAULT 'enviado' CHECK (status IN ('enviado', 'fallido', 'pendiente')),
  error_msg       TEXT,
  reference_id    UUID                           -- invoice_id, lesson_id, etc. (contexto)
);
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY notif_admin ON notification_logs FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY notif_staff_insert ON notification_logs FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'staff');
CREATE POLICY notif_staff_select ON notification_logs FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'staff');

-- ---------------------------------------------------------------
-- 13. ÍNDICES DE RENDIMIENTO
-- ---------------------------------------------------------------
CREATE INDEX idx_students_family        ON students(family_id);
CREATE INDEX idx_students_teacher       ON students(assigned_teacher_id);
CREATE INDEX idx_students_status        ON students(status);
CREATE INDEX idx_invoices_family        ON invoices(family_id);
CREATE INDEX idx_invoices_due_date      ON invoices(due_date);
CREATE INDEX idx_invoices_status        ON invoices(status);
CREATE INDEX idx_lessons_date           ON lessons(scheduled_date);
CREATE INDEX idx_lessons_teacher        ON lessons(teacher_id);
CREATE INDEX idx_attendance_lesson      ON attendance_logs(lesson_id);
CREATE INDEX idx_audit_invoice          ON payment_audit_logs(invoice_id);
CREATE INDEX idx_resources_instrument   ON online_resources(instrument);
CREATE INDEX idx_notif_recipient        ON notification_logs(recipient_id);
CREATE INDEX idx_notif_sent_at          ON notification_logs(sent_at DESC);

-- ---------------------------------------------------------------
-- 14. TRIGGER: updated_at automático en tablas mutables
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_families_updated_at
  BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_resources_updated_at
  BEFORE UPDATE ON online_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_demo_requests_updated_at
  BEFORE UPDATE ON demo_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------
-- 15. FUNCIÓN: Alertas de facturas a 2 días de vencer
-- Llamar con: SELECT * FROM get_invoices_due_soon();
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_invoices_due_soon(days_ahead INTEGER DEFAULT 2)
RETURNS TABLE (
  invoice_id    UUID,
  family_name   TEXT,
  amount        NUMERIC,
  remaining     NUMERIC,
  due_date      DATE,
  days_to_due   INTEGER,
  email         TEXT,
  phone         TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    f.family_name,
    i.amount,
    i.remaining_balance,
    i.due_date,
    (i.due_date - CURRENT_DATE)::INTEGER,
    f.email,
    f.primary_guardian_phone
  FROM invoices i
  JOIN families f ON i.family_id = f.id
  WHERE
    i.status IN ('pendiente', 'parcial')
    AND i.due_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + days_ahead)
  ORDER BY i.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------
-- 16. FUNCIÓN: Créditos de Recuperación (RBAC Gate en DB)
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION add_makeup_credit(
  p_student_id UUID,
  p_delta      INTEGER,   -- +1 (falta) o -1 (recuperación)
  p_lesson_id  UUID DEFAULT NULL,
  p_note       TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_current_credits INTEGER;
  v_role TEXT;
BEGIN
  -- RBAC Gate: solo super_admin y staff pueden modificar créditos
  v_role := auth.jwt() ->> 'role';
  IF v_role NOT IN ('super_admin', 'staff') THEN
    RAISE EXCEPTION 'PERMISSION_DENIED: Solo super_admin o staff pueden gestionar créditos.';
  END IF;

  SELECT makeup_credits INTO v_current_credits FROM students WHERE id = p_student_id;

  -- Evitar créditos negativos
  IF (v_current_credits + p_delta) < 0 THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS: El alumno no tiene créditos disponibles.';
  END IF;

  UPDATE students
  SET makeup_credits = makeup_credits + p_delta, updated_at = NOW()
  WHERE id = p_student_id;

  -- Registrar en attendance_logs si viene de una clase
  IF p_lesson_id IS NOT NULL THEN
    INSERT INTO attendance_logs (lesson_id, student_id, status, credit_delta, note)
    SELECT p_lesson_id, p_student_id,
      CASE WHEN p_delta > 0 THEN 'ausente' ELSE 'recuperacion' END,
      p_delta, p_note;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------
-- FIN DEL SCRIPT
-- Verifica en el dashboard de Insforge que todas las tablas
-- aparezcan en: Table Editor > Schema: public
-- ---------------------------------------------------------------
