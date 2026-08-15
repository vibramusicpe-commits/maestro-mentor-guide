-- ================================================================
-- Migración 004: Sistema de Invitaciones & Control de Acceso
-- EJECUTAR EN: SQL Editor de Insforge
-- Depende de: 002_vibra_music_complete_schema.sql
-- ================================================================

-- ---------------------------------------------------------------
-- 1. TIPOS ENUM
-- ---------------------------------------------------------------
CREATE TYPE invite_status_enum AS ENUM ('pendiente', 'aceptado', 'expirado', 'revocado');
CREATE TYPE invite_target_role AS ENUM ('teacher', 'family');
CREATE TYPE password_event_enum AS ENUM ('master_set', 'user_changed', 'reset_to_master', 'access_blocked');

-- ---------------------------------------------------------------
-- 2. TABLA: invitations (Links de Invitación)
-- La Dueña/Secretaria genera un link único por profesor o familia.
-- ---------------------------------------------------------------
CREATE TABLE invitations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token               TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  target_role         invite_target_role NOT NULL,
  target_name         TEXT NOT NULL,           -- Nombre del invitado (personaliza la pantalla)
  target_email        TEXT NOT NULL,
  target_family_id    UUID REFERENCES families(id),   -- Solo si role=family
  target_teacher_id   UUID REFERENCES users(id),       -- Solo si role=teacher
  master_password     TEXT NOT NULL,           -- Contraseña maestra hasheada (bcrypt)
  master_password_hint TEXT,                  -- Primeros 3 chars para ayuda de secretaria
  created_by_user_id  UUID REFERENCES users(id) NOT NULL,
  created_by_role     TEXT NOT NULL,
  status              invite_status_enum DEFAULT 'pendiente',
  accepted_at         TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 3. TABLA: user_passwords (Control de Contraseñas por Usuario)
-- ---------------------------------------------------------------
CREATE TABLE user_passwords (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
  invitation_id       UUID REFERENCES invitations(id),
  has_changed_once    BOOLEAN DEFAULT FALSE,   -- Cambió de master → personal
  is_blocked          BOOLEAN DEFAULT FALSE,   -- Bloqueado por exceso de intentos
  failed_attempts     INTEGER DEFAULT 0,
  last_failed_at      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 4. TABLA: password_audit_trail (Historial de Eventos de Contraseña)
-- Inmutable: Super Admin y Staff pueden ver el historial.
-- ---------------------------------------------------------------
CREATE TABLE password_audit_trail (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  invitation_id   UUID REFERENCES invitations(id),
  event           password_event_enum NOT NULL,
  performed_by    UUID REFERENCES users(id),    -- Quien realizó la acción (admin o el mismo)
  performed_role  TEXT NOT NULL,
  ip_hint         TEXT,                          -- Primeros bytes de la IP (privacidad)
  note            TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
  -- SIN updated_at: este registro es INMUTABLE
);

-- ---------------------------------------------------------------
-- 5. RLS — invitations
-- ---------------------------------------------------------------
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY invitations_super_admin ON invitations FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Staff puede crear invitaciones y ver las que creó
CREATE POLICY invitations_staff_insert ON invitations FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY invitations_staff_select ON invitations FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'staff'));

-- Staff puede revocar (UPDATE status) pero no borrar
CREATE POLICY invitations_staff_update ON invitations FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'role' = 'staff')
  WITH CHECK (auth.jwt() ->> 'role' = 'staff');

-- ---------------------------------------------------------------
-- 6. RLS — user_passwords
-- ---------------------------------------------------------------
ALTER TABLE user_passwords ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_passwords_admin ON user_passwords FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY user_passwords_staff_select ON user_passwords FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'staff');

-- Staff puede resetear contraseña (UPDATE is_blocked, failed_attempts)
CREATE POLICY user_passwords_staff_reset ON user_passwords FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'staff'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'staff'));

-- ---------------------------------------------------------------
-- 7. RLS — password_audit_trail
-- ---------------------------------------------------------------
ALTER TABLE password_audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY pwd_audit_admin ON password_audit_trail FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY pwd_audit_staff_select ON password_audit_trail FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY pwd_audit_insert ON password_audit_trail FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'staff', 'teacher', 'family'));

-- ---------------------------------------------------------------
-- 8. ÍNDICES
-- ---------------------------------------------------------------
CREATE INDEX idx_invitations_token      ON invitations(token);
CREATE INDEX idx_invitations_email      ON invitations(target_email);
CREATE INDEX idx_invitations_status     ON invitations(status);
CREATE INDEX idx_invitations_role       ON invitations(target_role);
CREATE INDEX idx_user_passwords_user    ON user_passwords(user_id);
CREATE INDEX idx_pwd_audit_user         ON password_audit_trail(user_id);
CREATE INDEX idx_pwd_audit_created      ON password_audit_trail(created_at DESC);

-- ---------------------------------------------------------------
-- 9. TRIGGER: updated_at en user_passwords
-- ---------------------------------------------------------------
CREATE TRIGGER trg_user_passwords_updated_at
  BEFORE UPDATE ON user_passwords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------
-- 10. FUNCIÓN: verify_invitation_token
-- Verifica un token de invitación y retorna los datos del invitado.
-- Llamar con: SELECT * FROM verify_invitation_token('hex-token-aqui');
-- NO requiere autenticación (es pública para la pantalla de login).
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION verify_invitation_token(p_token TEXT)
RETURNS TABLE (
  invitation_id   UUID,
  target_name     TEXT,
  target_role     invite_target_role,
  target_email    TEXT,
  status          invite_status_enum,
  is_valid        BOOLEAN,
  error_code      TEXT
) AS $$
DECLARE
  v_invite invitations%ROWTYPE;
BEGIN
  SELECT * INTO v_invite FROM invitations WHERE token = p_token;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::invite_target_role, NULL::TEXT,
      NULL::invite_status_enum, FALSE, 'TOKEN_NOT_FOUND';
    RETURN;
  END IF;

  IF v_invite.status = 'revocado' THEN
    RETURN QUERY SELECT v_invite.id, v_invite.target_name, v_invite.target_role,
      v_invite.target_email, v_invite.status, FALSE, 'TOKEN_REVOKED';
    RETURN;
  END IF;

  IF v_invite.expires_at < NOW() THEN
    -- Marcar como expirado automáticamente
    UPDATE invitations SET status = 'expirado' WHERE id = v_invite.id;
    RETURN QUERY SELECT v_invite.id, v_invite.target_name, v_invite.target_role,
      v_invite.target_email, 'expirado'::invite_status_enum, FALSE, 'TOKEN_EXPIRED';
    RETURN;
  END IF;

  -- Token válido
  RETURN QUERY SELECT v_invite.id, v_invite.target_name, v_invite.target_role,
    v_invite.target_email, v_invite.status, TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------
-- 11. FUNCIÓN: reset_user_to_master_password
-- Ejecutable por super_admin o staff para restablecer acceso.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION reset_user_to_master_password(
  p_user_id       UUID,
  p_performed_by  UUID
)
RETURNS VOID AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := auth.jwt() ->> 'role';
  IF v_role NOT IN ('super_admin', 'staff') THEN
    RAISE EXCEPTION 'PERMISSION_DENIED';
  END IF;

  -- Restablecer estado: desbloquear y resetear intentos fallidos
  UPDATE user_passwords
  SET
    is_blocked      = FALSE,
    failed_attempts = 0,
    has_changed_once = FALSE,   -- Permite volver a cambiar 1 vez
    updated_at       = NOW()
  WHERE user_id = p_user_id;

  -- Registrar en el audit trail
  INSERT INTO password_audit_trail (user_id, event, performed_by, performed_role, note)
  VALUES (p_user_id, 'reset_to_master', p_performed_by, v_role,
    'Acceso restablecido a contraseña maestra por administración');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- FIN DEL SCRIPT 004
-- ================================================================
