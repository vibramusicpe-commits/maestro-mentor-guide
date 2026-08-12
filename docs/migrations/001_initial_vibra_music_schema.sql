-- Migración Inicial de Base de Datos para Vibra Music (Insforge / PostgreSQL)
-- Cumple con la segregación de roles (super_admin vs staff) y las reglas de negocio de la escuela.

-- 1. Tipos Enum
CREATE TYPE student_status_enum AS ENUM ('activo', 'pausa', 'baja');
CREATE TYPE lesson_modality_enum AS ENUM ('Regular (8 clases / 45 min)', 'Intensivo (4 clases / 90 min)');
CREATE TYPE payment_status_enum AS ENUM ('al-dia', 'pendiente', 'vencido');
CREATE TYPE invoice_status_enum AS ENUM ('pagado', 'parcial', 'pendiente', 'vencido');
CREATE TYPE payment_method_enum AS ENUM ('Yape', 'Efectivo', 'Transferencia');

-- 2. Tabla de Usuarios y Roles
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'staff', 'teacher', 'family')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Familias
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name TEXT NOT NULL,
  primary_guardian_name TEXT NOT NULL,
  primary_guardian_phone TEXT NOT NULL,
  secondary_guardian_name TEXT,
  secondary_guardian_phone TEXT,
  email TEXT NOT NULL,
  payment_day INTEGER DEFAULT 1, -- Día fijo del mes asignado para cobro (1, 15, etc)
  automatic_payment BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Alumnos
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  instrument TEXT NOT NULL,
  level TEXT DEFAULT 'Nivel 1',
  assigned_teacher_id UUID REFERENCES users(id),
  modality lesson_modality_enum DEFAULT 'Regular (8 clases / 45 min)',
  status student_status_enum DEFAULT 'activo',
  makeup_credits INTEGER DEFAULT 0, -- Créditos de falta/recuperación
  birthdate TEXT, -- Fecha de cumpleaños
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Recibos y Cobros
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL, -- Precio original inmutable
  amount_paid NUMERIC(10, 2) DEFAULT 0.00,
  remaining_balance NUMERIC(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  status invoice_status_enum DEFAULT 'pendiente',
  reminded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de Bitácora Inmutable de Auditoría de Pagos (Audit Trail Anti-Fraude)
CREATE TABLE payment_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  registered_by_user_id UUID REFERENCES users(id),
  registered_by_role TEXT NOT NULL, -- 'staff' o 'super_admin'
  amount NUMERIC(10, 2) NOT NULL,
  payment_method payment_method_enum NOT NULL,
  voucher_reference TEXT, -- N° de Operación / Ref WhatsApp
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Egresos y Cuentas Corporativas (EXCLUSIVO SUPER ADMIN)
CREATE TABLE company_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  concept TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  expense_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Politica RLS para bloquear a Staff de leer egresos corporativos:
ALTER TABLE company_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY super_admin_only_expenses ON company_expenses
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'super_admin');
