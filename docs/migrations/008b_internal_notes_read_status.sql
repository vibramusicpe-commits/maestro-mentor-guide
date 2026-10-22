-- ============================================================================
-- Migración 008b: estado de lectura de notas internas (Dirección / Staff)
-- Fecha: 2026-10-21
-- Depende de: public.internal_notes (migración 008)
--
-- Motivo:
--   La migración 008 creó internal_notes con body, visibility y autoría, pero
--   sin columnas para la bandeja de Dirección. El prompt de informes exige
--   estado "nueva | leida | archivada" y marcar leída con actor/fecha.
--
-- Seguridad:
--   Migración aditiva e idempotente. No borra ni transforma datos existentes.
--   internal_notes no se expone al portal familia.
-- ============================================================================

ALTER TABLE public.internal_notes
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'nueva',
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS read_by_id UUID NULL,
  ADD COLUMN IF NOT EXISTS read_by_name TEXT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM pg_constraint
     WHERE conname = 'internal_notes_status_check'
       AND conrelid = 'public.internal_notes'::regclass
  ) THEN
    ALTER TABLE public.internal_notes
      ADD CONSTRAINT internal_notes_status_check
      CHECK (status IN ('nueva', 'leida', 'archivada'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS ix_internal_notes_status
  ON public.internal_notes (status, created_at DESC);

COMMENT ON COLUMN public.internal_notes.status IS
  'nueva | leida | archivada. Bandeja interna de Dirección/Staff; no se publica a familias.';

COMMENT ON COLUMN public.internal_notes.read_at IS
  'Momento en que Dirección/Staff marcó la nota como leída.';

COMMENT ON COLUMN public.internal_notes.read_by_id IS
  'UUID del actor que marcó leída la nota (resolvedor de docente/staff).';

COMMENT ON COLUMN public.internal_notes.read_by_name IS
  'Nombre del actor que marcó leída la nota.';

-- Verificación rápida (solo lectura)
SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
 WHERE table_schema = 'public'
   AND table_name = 'internal_notes'
 ORDER BY ordinal_position;
