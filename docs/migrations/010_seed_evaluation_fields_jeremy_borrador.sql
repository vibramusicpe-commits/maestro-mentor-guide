-- ============================================================================
-- 010_seed_evaluation_fields_jeremy_borrador.sql
-- Fase 2 — Criterios de Guitarra y Batería (Prof. Jeremy) como
-- VERSIÓN 0 BORRADOR, pendientes de validación por el docente.
--
-- Reglas aplicadas:
--   1. Son datos de configuración (tabla evaluation_fields), no código.
--      Se editan sin volver a desplegar.
--   2. Marcados como borrador en ui_config (draft/status/version) y con los
--      campos de aprobación VACÍOS (approved_by_id, approved_by_name,
--      approved_at, approved_role). Cada criterio lleva su propio comentario
--      libre en ui_config.validation.comment.
--   3. NO expuestos a familias ni a informes: visible_in_report = FALSE
--      mientras sigan en borrador. La Fase 5 debe seguir exigiendo
--      draft = false para incluirlos.
--   4. Escala: traffic_light de 4 niveles — Inicia, En proceso, Logrado,
--      Destacado (la escala móvil de la Fase 2).
--
-- Aditivo e idempotente: no borra ni modifica filas existentes.
-- Rollback:
--   DELETE FROM public.evaluation_fields
--   WHERE created_by_name = 'Criterios v0 borrador (010)';
-- ============================================================================

WITH seed (
  owner_teacher_id,
  instrument,
  field_key,
  label,
  help_text,
  group_name,
  report_order,
  criterion_comment
) AS (
  VALUES
    -- =====================================================================
    -- GUITARRA (8 criterios) — Prof. Jeremy
    -- =====================================================================
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Guitarra', 'guitarra_postura_sujecion', 'Postura y sujeción',
     'Posición del cuerpo y de la guitarra, relajación de hombros y muñecas', 'Técnica', 10, ''),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Guitarra', 'guitarra_mano_izquierda', 'Mano izquierda',
     'Digitación, presión y notas limpias, sin trastes apagados', 'Técnica', 20, ''),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Guitarra', 'guitarra_mano_derecha', 'Mano derecha',
     'Rasgueo o punteo con púa o dedos, control y regularidad', 'Técnica', 30, ''),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Guitarra', 'guitarra_acordes_cambios', 'Acordes y cambios',
     'Precisión de los acordes del nivel y fluidez al cambiar', 'Técnica', 40, ''),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Guitarra', 'guitarra_ritmo_pulso', 'Ritmo y pulso',
     'Mantiene el tempo con base o metrónomo', 'Técnica', 50, ''),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Guitarra', 'guitarra_lectura', 'Lectura',
     'Cifrado, tablatura o partitura, según el nivel', 'Lectura y teoría', 60, ''),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Guitarra', 'guitarra_afinacion_oido', 'Afinación y oído',
     'Afina su guitarra y reconoce si algo suena desafinado', 'Lectura y teoría', 70, ''),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Guitarra', 'guitarra_practica_actitud', 'Práctica y actitud',
     'Constancia, tarea cumplida y concentración en clase', 'Actitud', 80, ''),

    -- =====================================================================
    -- BATERÍA (9 criterios) — Prof. Jeremy
    -- =====================================================================
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Batería', 'bateria_postura_agarre', 'Postura y agarre',
     'Altura del taburete, posición de brazos y agarre de las baquetas', 'Técnica', 10, ''),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Batería', 'bateria_coordinacion', 'Coordinación',
     'Independencia de manos y pies (bombo, caja y hi-hat)', 'Técnica', 20, ''),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Batería', 'bateria_tecnica_baquetas', 'Técnica de baquetas',
     'Golpes simples y dobles, rebote y rudimentos del nivel', 'Técnica', 30, ''),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Batería', 'bateria_pulso_tempo', 'Pulso y tempo',
     'Estabilidad con metrónomo o base, sin acelerar ni frenar', 'Técnica', 40, ''),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Batería', 'bateria_grooves_patrones', 'Grooves y patrones',
     'Dominio de los ritmos del nivel y cambios entre patrones', 'Repertorio', 50, ''),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Batería', 'bateria_fills_transiciones', 'Fills y transiciones',
     'Rellenos limpios que vuelven al ritmo a tiempo', 'Repertorio', 60, ''),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Batería', 'bateria_lectura_ritmica', 'Lectura rítmica',
     'Figuras, compases y lectura de partitura rítmica', 'Lectura y teoría', 70, ''),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Batería', 'bateria_dinamica_musicalidad', 'Dinámica y musicalidad',
     'Control del volumen, escucha y tocar junto a una base', 'Repertorio', 80, ''),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Batería', 'bateria_practica_actitud', 'Práctica y actitud',
     'Constancia, tarea cumplida y concentración en clase', 'Actitud', 90, '')
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
  'traffic_light',
  -- Escala móvil de 4 niveles (misma familia que la Fase 2).
  '[
    {"value":"inicia","label":"Inicia","color":"#E53935"},
    {"value":"en_proceso","label":"En proceso","color":"#FBC02D"},
    {"value":"logrado","label":"Logrado","color":"#43A047"},
    {"value":"destacado","label":"Destacado","color":"#1E88E5"}
  ]'::jsonb,
  jsonb_build_object(
    'group', group_name,
    'compact', true,
    -- Marca de borrador: ninguna vista de familia/informe debe consumirlo
    -- hasta que Jeremy valide y se cambie a draft=false.
    'draft', true,
    'status', 'borrador',
    'version', 0,
    'needs_validation', true,
    'validation', jsonb_build_object(
      'status', 'pendiente_validacion',
      'required_by_id', '00000000-0000-0000-0000-000000000003',
      'required_by_name', 'Jeremy',
      'approved_by_id', NULL,
      'approved_by_name', NULL,
      'approved_at', NULL,
      'approved_role', NULL,
      'comment', criterion_comment
    ),
    'comment_enabled', true,
    'comment_field', 'validation_comment',
    'source', 'Borrador Dirección 2026-10-22'
  ),
  FALSE,
  -- BORRADOR: fuera de informes y del portal familia (Fases 3 a 5).
  FALSE,
  report_order,
  help_text,
  TRUE,
  'Criterios v0 borrador (010)'
FROM seed
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- Verificación rápida (opcional, solo lectura)
-- ----------------------------------------------------------------------------
-- SELECT instrument, count(*) AS criterios,
--        bool_and(visible_in_report) AS expuesto_en_informes
-- FROM public.evaluation_fields
-- WHERE owner_teacher_id = '00000000-0000-0000-0000-000000000003'
-- GROUP BY instrument;
-- Esperado: Batería 9 | Guitarra 8 | expuesto_en_informes = false
