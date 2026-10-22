-- ============================================================================
-- 009_seed_evaluation_fields.sql
-- Fase 2 — Criterios validados de Nathaly (Canto / Piano Infantil) y
-- Fernando (Piano / Violín). Jeremy queda pendiente de levantamiento.
--
-- Aditivo e idempotente: no borra ni modifica filas existentes.
-- Rollback:
--   DELETE FROM public.evaluation_fields
--   WHERE created_by_name = 'Migración 009';
-- ============================================================================

WITH seed (
  owner_teacher_id,
  instrument,
  field_key,
  label,
  field_type,
  report_order,
  group_name
) AS (
  VALUES
    -- Nathaly — Canto (semáforo de 4)
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Canto', 'canto_relajacion', 'Relajación', 'traffic_light', 10, 'Técnica'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Canto', 'canto_respiracion', 'Respiración', 'traffic_light', 20, 'Técnica'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Canto', 'canto_apoyo_diafragmatico', 'Apoyo diafragmático', 'traffic_light', 30, 'Técnica'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Canto', 'canto_proyeccion', 'Proyección', 'traffic_light', 40, 'Técnica'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Canto', 'canto_afinacion', 'Afinación', 'traffic_light', 50, 'Técnica'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Canto', 'canto_ritmo_pulso', 'Ritmo y pulso', 'traffic_light', 60, 'Técnica'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Canto', 'canto_lenguaje_corporal', 'Lenguaje corporal', 'traffic_light', 70, 'Técnica'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Canto', 'canto_lenguaje_musical', 'Lenguaje musical', 'traffic_light', 80, 'Lectura y teoría'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Canto', 'canto_letra_diccion', 'Letra y dicción', 'traffic_light', 90, 'Repertorio'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Canto', 'canto_interpretacion', 'Interpretación', 'traffic_light', 100, 'Repertorio'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Canto', 'canto_conducta_disposicion', 'Conducta / disposición', 'traffic_light', 110, 'Actitud'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Canto', 'canto_practica_casa', 'Práctica en casa', 'traffic_light', 120, 'Actitud'),

    -- Nathaly — Piano Infantil (semáforo de 4)
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Piano Infantil', 'piano_inf_postura', 'Postura', 'traffic_light', 10, 'Técnica'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Piano Infantil', 'piano_inf_digitacion', 'Digitación', 'traffic_light', 20, 'Técnica'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Piano Infantil', 'piano_inf_mano_derecha', 'Mano derecha', 'traffic_light', 30, 'Técnica'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Piano Infantil', 'piano_inf_mano_izquierda', 'Mano izquierda', 'traffic_light', 40, 'Técnica'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Piano Infantil', 'piano_inf_ambas_manos', 'Ambas manos', 'traffic_light', 50, 'Técnica'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Piano Infantil', 'piano_inf_coordinacion', 'Coordinación', 'traffic_light', 60, 'Técnica'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Piano Infantil', 'piano_inf_lenguaje_musical', 'Lenguaje musical', 'traffic_light', 70, 'Lectura y teoría'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Piano Infantil', 'piano_inf_ubicacion_notas', 'Ubicación de notas', 'traffic_light', 80, 'Lectura y teoría'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Piano Infantil', 'piano_inf_figuras', 'Figuras musicales', 'traffic_light', 90, 'Lectura y teoría'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Piano Infantil', 'piano_inf_pieza', 'Pieza trabajada / interpretación', 'traffic_light', 100, 'Repertorio'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Piano Infantil', 'piano_inf_conducta', 'Conducta / disposición', 'traffic_light', 110, 'Actitud'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Piano Infantil', 'piano_inf_practica', 'Práctica en casa', 'traffic_light', 120, 'Actitud'),

    -- Fernando — Piano (escala 1–10)
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Piano', 'piano_postura', 'Postura corporal', 'score_1_10', 10, 'Técnica'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Piano', 'piano_posicion_manos', 'Posición de manos', 'score_1_10', 20, 'Técnica'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Piano', 'piano_digitacion', 'Digitación', 'score_1_10', 30, 'Técnica'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Piano', 'piano_coordinacion', 'Coordinación motriz', 'score_1_10', 40, 'Técnica'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Piano', 'piano_lectura_partitura', 'Lectura de partitura', 'score_1_10', 50, 'Lectura y teoría'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Piano', 'piano_figuras_silencios', 'Figuras y silencios', 'score_1_10', 60, 'Lectura y teoría'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Piano', 'piano_compases_tempo', 'Compases y tempo', 'score_1_10', 70, 'Lectura y teoría'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Piano', 'piano_piezas_completas', 'Toca piezas completas', 'score_1_10', 80, 'Repertorio'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Piano', 'piano_expresividad', 'Expresividad / interpretación', 'score_1_10', 90, 'Repertorio'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Piano', 'piano_concentracion', 'Concentración', 'score_1_10', 100, 'Actitud'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Piano', 'piano_practica', 'Práctica en casa', 'score_1_10', 110, 'Actitud'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Piano', 'piano_disposicion', 'Disposición y conducta', 'score_1_10', 120, 'Actitud'),

    -- Fernando — Violín (escala 1–10)
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Violín', 'violin_postura', 'Postura', 'score_1_10', 10, 'Técnica'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Violín', 'violin_sujecion_arco', 'Sujeción del arco', 'score_1_10', 20, 'Técnica'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Violín', 'violin_posicion_manos', 'Posición de manos', 'score_1_10', 30, 'Técnica'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Violín', 'violin_digitacion', 'Digitación', 'score_1_10', 40, 'Técnica'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Violín', 'violin_coordinacion', 'Coordinación', 'score_1_10', 50, 'Técnica'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Violín', 'violin_afinacion', 'Afinación', 'score_1_10', 60, 'Técnica'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Violín', 'violin_ritmo', 'Ritmo y pulso', 'score_1_10', 70, 'Técnica'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Violín', 'violin_lectura_partitura', 'Lectura de partitura', 'score_1_10', 80, 'Lectura y teoría'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Violín', 'violin_compases_tempo', 'Compases y tempo', 'score_1_10', 90, 'Lectura y teoría'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Violín', 'violin_piezas_completas', 'Piezas completas', 'score_1_10', 100, 'Repertorio'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Violín', 'violin_concentracion', 'Concentración', 'score_1_10', 110, 'Actitud'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Violín', 'violin_practica', 'Práctica en casa', 'score_1_10', 120, 'Actitud'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Violín', 'violin_disciplina', 'Disposición y disciplina', 'score_1_10', 130, 'Actitud')
)
INSERT INTO public.evaluation_fields (
  owner_teacher_id,
  instrument,
  program,
  age_min,
  age_max,
  field_key,
  label,
  field_type,
  options,
  ui_config,
  required,
  visible_in_report,
  report_order,
  help_text,
  is_active,
  created_by_name
)
SELECT
  owner_teacher_id,
  instrument,
  NULL,
  NULL,
  NULL,
  field_key,
  label,
  field_type,
  CASE
    WHEN field_type = 'traffic_light' THEN
      '[
        {"value":"logrado","label":"Logrado","color":"#43A047"},
        {"value":"en_proceso","label":"En proceso","color":"#FBC02D"},
        {"value":"pendiente","label":"No logrado","color":"#E53935"},
        {"value":"no_corresponde","label":"No corresponde","color":"#9E9E9E"}
      ]'::jsonb
    ELSE '[]'::jsonb
  END,
  jsonb_build_object('group', group_name, 'compact', true),
  FALSE,
  TRUE,
  report_order,
  NULL,
  TRUE,
  'Migración 009'
FROM seed
ON CONFLICT DO NOTHING;
