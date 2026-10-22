-- ============================================================================
-- Migración 008: Evaluaciones de clase, informes de progreso y notas a familias
-- Fecha: 2026-10-21
-- Ejecutar en: SQL Editor de Insforge (PostgreSQL)
-- Depende de: public.students (id uuid), public.families (opcional)
--
-- IMPORTANTE:
--   * Este archivo NO se ejecuta automáticamente. Lo corre el usuario/dirección.
--   * El agente no ejecuta DDL en producción.
--   * El rollback está al final, comentado. No ejecutarlo sin respaldo previo.
--   * Si ya se ejecutó una versión parcial, revisar columnas antes de re-ejecutar:
--     el script es idempotente para tablas/índices/triggers, no para cambios de
--     columnas dentro de una tabla ya creada.
--
-- SEGURIDAD (leer antes de publicar):
--   La app usa la anon key y NO hay JWT real, por lo que RLS no protege estas
--   tablas. Cualquiera con la anon key puede leer/escribir, igual que en el resto
--   del esquema actual. El flag parentReports es un control de PRODUCTO, no un
--   control de SEGURIDAD. Antes de exponer el portal familia a todas las familias,
--   migrar a JWT/RLS o poner una capa server-side con service role.
-- ============================================================================

-- ============================================================================
-- 1. CONFIGURACIÓN GLOBAL / POR ORGANIZACIÓN
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.org_settings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NULL,
  setting_key       TEXT NOT NULL,
  setting_value     JSONB NOT NULL DEFAULT '{}'::jsonb,
  description       TEXT NULL,
  updated_by_id     UUID NULL,
  updated_by_name   TEXT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT org_settings_setting_key_not_empty
    CHECK (length(trim(setting_key)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_org_settings_global
  ON public.org_settings (setting_key)
  WHERE org_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_org_settings_org
  ON public.org_settings (org_id, setting_key)
  WHERE org_id IS NOT NULL;

COMMENT ON TABLE public.org_settings IS
  'Configuración global o por organización. org_id NULL = configuración global. Contiene umbrales, flags, catálogo, branding y textos.';

COMMENT ON COLUMN public.org_settings.setting_value IS
  'JSONB. Claves sembradas: score_bands, feature_flags, pilot_teacher_ids, pilot_student_ids, evaluation_catalog, teacher_specialties, branding, report_texts, evaluation_defaults.';

-- ----------------------------------------------------------------------------
-- 1.1 Seeds de configuración (idempotentes, sin sobrescribir valores existentes)
-- ----------------------------------------------------------------------------

INSERT INTO public.org_settings (org_id, setting_key, setting_value, description)
SELECT NULL, 'score_bands', $json$
{
  "scale": "1-10",
  "bands": [
    {"key": "rojo",     "label": "Necesita refuerzo", "min": 1, "max": 4, "color": "#E53935"},
    {"key": "amarillo", "label": "En proceso",       "min": 5, "max": 7, "color": "#FBC02D"},
    {"key": "verde",    "label": "Logrado",          "min": 8, "max": 10, "color": "#43A047"}
  ],
  "gray": {"key": "no_corresponde", "label": "Todavía no corresponde", "color": "#9E9E9E"}
}
$json$::jsonb,
  'Umbrales del semáforo 1-10. El piloto arranca con 1-4 rojo, 5-7 amarillo, 8-10 verde; Fernando los ajusta.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.org_settings WHERE org_id IS NULL AND setting_key = 'score_bands'
);

INSERT INTO public.org_settings (org_id, setting_key, setting_value, description)
SELECT NULL, 'feature_flags', $json$
{
  "evaluationsV2": false,
  "familyNotesV2": false,
  "progressReportsV2": false,
  "parentReports": false
}
$json$::jsonb,
  'Flags de producto. parentReports (4b) queda apagado hasta validar 4a y el control de acceso familiar.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.org_settings WHERE org_id IS NULL AND setting_key = 'feature_flags'
);

INSERT INTO public.org_settings (org_id, setting_key, setting_value, description)
SELECT NULL, 'pilot_teacher_ids', $json$
[
  "00000000-0000-0000-0000-000000000004",
  "00000000-0000-0000-0000-000000000005"
]
$json$::jsonb,
  'Docentes del piloto: Fernando (...004) y Nathaly (...005). IDs sintéticos del resolvedor de docente.';

INSERT INTO public.org_settings (org_id, setting_key, setting_value, description)
SELECT NULL, 'pilot_student_ids', $json$
[
  "a118ba83-d07d-4b28-8d84-8792e94292c5",
  "ee03db47-1a4d-492a-a442-99bdabd8d66f",
  "ddace811-eb0d-4c0a-9e2d-1bdacc6afbef",
  "a87800e7-3f18-4783-bdd2-2dd391b1dfe7"
]
$json$::jsonb,
  'Alumnos piloto: Kayra Valery (Canto Intensivo, Nathaly), Ethan Paolo Jara (Piano Infantil, Nathaly), Alonso (Piano, Fernando) y Layla Mariapaula (Violín, Fernando).';

INSERT INTO public.org_settings (org_id, setting_key, setting_value, description)
SELECT NULL, 'evaluation_catalog', $json$
{
  "instruments": ["Canto", "Piano", "Piano Infantil", "Violín", "Guitarra", "Batería", "Estimulación Musical", "Flauta", "Saxofón"],
  "official_instruments": ["Canto", "Piano", "Piano Infantil", "Violín", "Guitarra", "Batería", "Estimulación Musical"],
  "programs": [
    {"key": "regular_2x",       "label": "Regular (8 clases / 45 min)",        "sessions": 8,    "minutes": 45},
    {"key": "regular_1x",       "label": "Regular 1x/sem (8 clases / 45 min)", "sessions": 8,    "minutes": 45},
    {"key": "intensivo",        "label": "Intensivo (4 clases / 90 min)",      "sessions": 4,    "minutes": 90},
    {"key": "flexible",         "label": "Paquete Flexible (A demanda)",       "sessions": null, "minutes": 45},
    {"key": "demo_nivelacion",  "label": "Demo Nivelación",                    "sessions": 1,    "minutes": 45},
    {"key": "personalizado",    "label": "Personalizado",                      "sessions": null, "minutes": 45}
  ],
  "class_modes": [
    {"key": "individual", "label": "Individual (1 alumno)"},
    {"key": "grupal",     "label": "Grupal (2 a 5 alumnos)"},
    {"key": "no_aplica",  "label": "No aplica"}
  ],
  "canto": {
    "min_students": 1,
    "max_students": 5,
    "modes": ["individual", "grupal"],
    "not_choir": true,
    "note": "No es coro. El modo depende del día y del horario: 1 alumno = individual; 2 a 5 = grupal."
  },
  "age_ranges": [
    {"key": "estimulacion", "label": "Estimulación Musical", "min": 4,  "max": 5},
    {"key": "infantil",     "label": "Infantil",             "min": 5,  "max": 6},
    {"key": "junior",       "label": "Junior",               "min": 7,  "max": 12},
    {"key": "juvenil",      "label": "Juvenil",              "min": 13, "max": 17},
    {"key": "master",       "label": "Master (18+)",         "min": 18, "max": 120}
  ]
}
$json$::jsonb,
  'Catálogo editable de instrumentos, programas, modos de clase y rangos de edad (ADR-0121). Canto: 1 a 5 alumnos, individual o grupal; no es coro.';

INSERT INTO public.org_settings (org_id, setting_key, setting_value, description)
SELECT NULL, 'teacher_specialties', $json$
{
  "official": [
    {
      "teacher_id": "00000000-0000-0000-0000-000000000003",
      "teacher": "Jeremy",
      "room": "Sala A",
      "instruments": ["Guitarra", "Batería"]
    },
    {
      "teacher_id": "00000000-0000-0000-0000-000000000004",
      "teacher": "Fernando",
      "room": "Sala B",
      "instruments": ["Violín", "Piano"],
      "excludes": ["Piano Infantil"]
    },
    {
      "teacher_id": "00000000-0000-0000-0000-000000000005",
      "teacher": "Nathaly",
      "room": "Sala C",
      "instruments": ["Canto", "Piano Infantil"]
    }
  ],
  "exceptions": [
    {
      "teacher_id": "00000000-0000-0000-0000-000000000004",
      "teacher": "Fernando",
      "instrument": "Guitarra",
      "authorized_by": "Dirección",
      "condition": "Solo cuando Jeremy no tenga cupo, para no perder al cliente",
      "case": "Sylvia"
    },
    {
      "teacher_id": "00000000-0000-0000-0000-000000000004",
      "teacher": "Fernando",
      "instrument": "Flauta",
      "authorized_by": "Dirección",
      "condition": "No oficial; caso por caso"
    },
    {
      "teacher_id": "00000000-0000-0000-0000-000000000004",
      "teacher": "Fernando",
      "instrument": "Saxofón",
      "authorized_by": "Dirección",
      "condition": "No oficial; caso por caso"
    }
  ],
  "pending": [
    {
      "teacher": "Claudia",
      "room": "Sala D",
      "instruments": ["Estimulación Musical"],
      "note": "Sin alumnos activos en la base actual; agregar su UUID cuando corresponda."
    }
  ]
}
$json$::jsonb,
  'Especialidades oficiales y excepciones autorizadas. Piano Infantil es exclusivo de Nathaly. Fernando oficialmente dicta Violín y Piano; Guitarra es excepción (caso Sylvia) solo si Jeremy no tiene cupo; Flauta y Saxofón no son oficiales.';

INSERT INTO public.org_settings (org_id, setting_key, setting_value, description)
SELECT NULL, 'branding', $json$
{
  "schoolName": "Vibra Music",
  "logoUrl": null,
  "signatures": [
    {"role": "Dirección", "name": ""},
    {"role": "Docente",   "name": ""}
  ]
}
$json$::jsonb,
  'Membrete, logo y firmas para informes A4. Editable por Dirección.';

INSERT INTO public.org_settings (org_id, setting_key, setting_value, description)
SELECT NULL, 'report_texts', $json$
{
  "monthly": {
    "title": "Informe Mensual de Progreso",
    "intro": "Resumen del avance del alumno durante el mes.",
    "closing": "Gracias por acompañar el proceso musical de tu hijo(a)."
  },
  "quarterly": {
    "title": "Informe Trimestral de Progreso",
    "intro": "Resumen del avance del alumno durante el trimestre.",
    "closing": "Gracias por acompañar el proceso musical de tu hijo(a)."
  }
}
$json$::jsonb,
  'Textos base de los informes. El contenido pedagógico se genera por reglas en el cliente, sin IA.';

INSERT INTO public.org_settings (org_id, setting_key, setting_value, description)
SELECT NULL, 'evaluation_defaults', $json$
{
  "levelStartSource": "previous_quarterly_report",
  "defaultOverallStatus": "sin_evaluar",
  "allowEmptyComment": true,
  "requireRepertoire": false
}
$json$::jsonb,
  'Defaults del registro de clase. level_start de un trimestral se precarga con level_end del trimestral anterior (lógica de app).';

-- ============================================================================
-- 2. CAMPOS EXTRA CONFIGURABLES POR DOCENTE / INSTRUMENTO / PROGRAMA
--    El núcleo (repertorio, tema, estado, tarea, comentario) son columnas de
--    lesson_evaluations. Esta tabla es SOLO para extras.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.evaluation_fields (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NULL,
  owner_teacher_id  UUID NULL,
  instrument        TEXT NULL,
  program           TEXT NULL,
  age_min           INTEGER NULL,
  age_max           INTEGER NULL,
  field_key         TEXT NOT NULL,
  label             TEXT NOT NULL,
  field_type        TEXT NOT NULL,
  options           JSONB NOT NULL DEFAULT '[]'::jsonb,
  ui_config         JSONB NOT NULL DEFAULT '{}'::jsonb,
  required          BOOLEAN NOT NULL DEFAULT FALSE,
  visible_in_report BOOLEAN NOT NULL DEFAULT TRUE,
  report_order      INTEGER NOT NULL DEFAULT 0,
  help_text         TEXT NULL,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_id     UUID NULL,
  created_by_name   TEXT NULL,
  updated_by_id     UUID NULL,
  updated_by_name   TEXT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT evaluation_fields_field_key_not_empty
    CHECK (length(trim(field_key)) > 0),
  CONSTRAINT evaluation_fields_label_not_empty
    CHECK (length(trim(label)) > 0),
  CONSTRAINT evaluation_fields_field_type_check
    CHECK (field_type IN ('checkbox', 'dropdown', 'traffic_light', 'score_1_10', 'short_text', 'long_text')),
  CONSTRAINT evaluation_fields_age_range_check
    CHECK (age_min IS NULL OR age_max IS NULL OR age_min <= age_max),
  CONSTRAINT evaluation_fields_options_array_check
    CHECK (jsonb_typeof(options) = 'array'),
  CONSTRAINT evaluation_fields_ui_config_object_check
    CHECK (jsonb_typeof(ui_config) = 'object')
);

-- Un mismo field_key puede existir para Canto y para Piano Infantil del mismo
-- docente. NULL = aplica a todos (comodín '*'). El rango de edad es una
-- propiedad del campo, no parte de la clave.
CREATE UNIQUE INDEX IF NOT EXISTS ux_evaluation_fields_scope
  ON public.evaluation_fields (
    COALESCE(owner_teacher_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(instrument, '*'),
    COALESCE(program, '*'),
    field_key
  );

CREATE INDEX IF NOT EXISTS ix_evaluation_fields_owner_active
  ON public.evaluation_fields (owner_teacher_id, instrument, program, is_active);

COMMENT ON TABLE public.evaluation_fields IS
  'Solo campos EXTRA configurables. El núcleo (repertorio, tema, estado, tarea, comentario) vive como columnas en lesson_evaluations.';

COMMENT ON COLUMN public.evaluation_fields.owner_teacher_id IS
  'Docente dueño de la plantilla. NULL = plantilla global. No hay FK a users porque esa tabla no existe en la base viva; se usa el UUID sintético del resolvedor.';

COMMENT ON COLUMN public.evaluation_fields.instrument IS
  'Instrumento al que aplica la plantilla (ej. Canto, Piano Infantil, Violín). NULL = todos.';

COMMENT ON COLUMN public.evaluation_fields.program IS
  'Programa/modalidad al que aplica (ej. Regular, Intensivo, Paquete Flexible). NULL = todos.';

COMMENT ON COLUMN public.evaluation_fields.age_min IS
  'Edad mínima opcional del alumno para la que aplica el campo. NULL = sin límite.';

COMMENT ON COLUMN public.evaluation_fields.age_max IS
  'Edad máxima opcional del alumno para la que aplica el campo. NULL = sin límite.';

COMMENT ON COLUMN public.evaluation_fields.field_type IS
  'checkbox | dropdown | traffic_light | score_1_10 | short_text | long_text.';

COMMENT ON COLUMN public.evaluation_fields.options IS
  'Array JSONB. dropdown: [{"value":"...","label":"..."}]. traffic_light: [{"value":"logrado","label":"Logrado","color":"#43A047"}].';

-- ----------------------------------------------------------------------------
-- 2.1 Ejemplo de campo extra (NO se inserta automáticamente)
-- ----------------------------------------------------------------------------
-- INSERT INTO public.evaluation_fields (
--   owner_teacher_id, instrument, program, field_key, label, field_type,
--   options, required, visible_in_report, report_order
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000005',
--   'Canto',
--   NULL,
--   'respiracion',
--   'Respiración y apoyo',
--   'traffic_light',
--   '[{"value":"logrado","label":"Logrado","color":"#43A047"},{"value":"en_proceso","label":"En proceso","color":"#FBC02D"},{"value":"pendiente","label":"Pendiente","color":"#E53935"},{"value":"no_corresponde","label":"Todavía no corresponde","color":"#9E9E9E"}]'::jsonb,
--   TRUE,
--   TRUE,
--   10
-- );

-- ============================================================================
-- 3. REGISTRO DE CLASE (EVALUACIÓN POR SESIÓN)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lesson_evaluations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id               UUID NULL,
  session_key          TEXT NOT NULL,
  lesson_id            TEXT NULL,
  student_id           UUID NULL REFERENCES public.students(id) ON DELETE SET NULL,
  student_name_snapshot TEXT NULL,
  teacher_id           UUID NULL,
  teacher_name         TEXT NULL,
  created_by_id        UUID NULL,
  created_by_name      TEXT NULL,
  updated_by_id        UUID NULL,
  updated_by_name      TEXT NULL,
  session_date         DATE NOT NULL,
  start_time           TEXT NOT NULL,
  duration_min         INTEGER NOT NULL DEFAULT 45,
  modality             TEXT NULL,
  instrument           TEXT NULL,
  program              TEXT NULL,
  class_mode           TEXT NOT NULL DEFAULT 'no_aplica',
  topic                TEXT NULL,
  overall_status       TEXT NOT NULL DEFAULT 'sin_evaluar',
  score                NUMERIC(4,1) NULL,
  repertoire           JSONB NOT NULL DEFAULT '[]'::jsonb,
  homework             TEXT NULL,
  teacher_comment      TEXT NULL,
  extra_scores         JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_test              BOOLEAN NOT NULL DEFAULT FALSE,
  test_run_id          TEXT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT lesson_evaluations_session_key_unique UNIQUE (session_key),
  CONSTRAINT lesson_evaluations_session_key_not_empty
    CHECK (length(trim(session_key)) > 0),
  CONSTRAINT lesson_evaluations_start_time_format
    CHECK (start_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  CONSTRAINT lesson_evaluations_duration_positive
    CHECK (duration_min > 0),
  CONSTRAINT lesson_evaluations_class_mode_check
    CHECK (class_mode IN ('individual', 'grupal', 'no_aplica')),
  CONSTRAINT lesson_evaluations_overall_status_check
    CHECK (overall_status IN ('logrado', 'en_proceso', 'pendiente', 'no_corresponde', 'sin_evaluar')),
  CONSTRAINT lesson_evaluations_score_range
    CHECK (score IS NULL OR (score >= 1 AND score <= 10)),
  CONSTRAINT lesson_evaluations_repertoire_is_array
    CHECK (jsonb_typeof(repertoire) = 'array'),
  CONSTRAINT lesson_evaluations_extra_scores_is_array
    CHECK (jsonb_typeof(extra_scores) = 'array'),
  CONSTRAINT lesson_evaluations_test_run_check
    CHECK (is_test = (test_run_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS ix_lesson_evaluations_student_date
  ON public.lesson_evaluations (student_id, session_date DESC);

CREATE INDEX IF NOT EXISTS ix_lesson_evaluations_teacher_date
  ON public.lesson_evaluations (teacher_id, session_date DESC);

CREATE INDEX IF NOT EXISTS ix_lesson_evaluations_is_test
  ON public.lesson_evaluations (is_test, test_run_id);

COMMENT ON TABLE public.lesson_evaluations IS
  'Registro de clase. Un registro por sesión evaluada. session_key determinista evita duplicados.';

COMMENT ON COLUMN public.lesson_evaluations.session_key IS
  'Regular/Flexible: <student_id>::<YYYY-MM-DD>::<HH:MM>. Intensivo 90 min: <student_id>::<YYYY-MM-DD>::INT. Un solo registro por sesión de 90 min.';

COMMENT ON COLUMN public.lesson_evaluations.student_id IS
  'FK a students ON DELETE SET NULL. Si el alumno se elimina, el registro histórico se conserva con student_name_snapshot.';

COMMENT ON COLUMN public.lesson_evaluations.teacher_id IS
  'Docente que dictó la clase. Se guarda también teacher_name. NO confundir con created_by_id (quien digitó).';

COMMENT ON COLUMN public.lesson_evaluations.created_by_id IS
  'Actor que creó el registro (docente o staff). Separado de teacher_id para auditoría.';

COMMENT ON COLUMN public.lesson_evaluations.updated_by_id IS
  'Actor del último cambio. El trigger de auditoría lo usa como actor.';

COMMENT ON COLUMN public.lesson_evaluations.class_mode IS
  'Canto: individual (1 alumno) o grupal (2 a 5 alumnos), según disponibilidad del día y horario. No es coro. Se define por sesión, no por alumno.';

COMMENT ON COLUMN public.lesson_evaluations.overall_status IS
  'Semáforo de 4: logrado, en_proceso, pendiente, no_corresponde. sin_evaluar es el estado inicial (gris, sin precargar).';

COMMENT ON COLUMN public.lesson_evaluations.score IS
  'Puntaje global opcional 1-10. La app puede derivar la banda desde org_settings.score_bands; overall_status es la decisión pedagógica final.';

COMMENT ON COLUMN public.lesson_evaluations.repertoire IS
  'Array JSONB: [{"title":"...","normalized_title":"...","status":"logrado|en_proceso|pendiente|no_corresponde","score":8}]. Al generar el informe, agrupar por normalized_title y tomar el último estado por session_date.';

COMMENT ON COLUMN public.lesson_evaluations.extra_scores IS
  'Array JSONB de snapshots: [{"field_id":"uuid","label":"...","type":"...","raw_value":...,"band":"rojo|amarillo|verde|no_corresponde"}]. Congela la definición del campo al momento de evaluar.';

COMMENT ON COLUMN public.lesson_evaluations.is_test IS
  'TRUE = dato de piloto/prueba. Excluir de informes y reportes. Limpiar por test_run_id, nunca con DELETE masivo.';

COMMENT ON COLUMN public.lesson_evaluations.test_run_id IS
  'Identificador del lote de prueba (ej. PILOTO-2026-10). Permite limpieza quirúrgica por lote.';

-- ============================================================================
-- 4. INFORMES DE PROGRESO (MENSUAL / TRIMESTRAL)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.progress_reports (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                UUID NULL,
  student_id            UUID NULL REFERENCES public.students(id) ON DELETE SET NULL,
  student_name_snapshot TEXT NULL,
  teacher_id            UUID NULL,
  teacher_name          TEXT NULL,
  period_type           TEXT NOT NULL,
  period_start          DATE NOT NULL,
  period_end            DATE NOT NULL,
  level_start           TEXT NULL,
  level_end             TEXT NULL,
  attendance_summary    JSONB NOT NULL DEFAULT '{}'::jsonb,
  repertoire_summary    JSONB NOT NULL DEFAULT '[]'::jsonb,
  strengths             TEXT NULL,
  goals                 TEXT NULL,
  recommendations       TEXT NULL,
  family_message        TEXT NULL,
  teacher_comment       TEXT NULL,
  content               JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_snapshot    JSONB NULL,
  status                TEXT NOT NULL DEFAULT 'draft',
  submitted_at          TIMESTAMPTZ NULL,
  submitted_by_id       UUID NULL,
  submitted_by_name     TEXT NULL,
  reviewed_by_id        UUID NULL,
  reviewed_by_name      TEXT NULL,
  reviewed_at           TIMESTAMPTZ NULL,
  rejection_reason      TEXT NULL,
  published_at          TIMESTAMPTZ NULL,
  published_by_id       UUID NULL,
  published_by_name     TEXT NULL,
  retracted_at          TIMESTAMPTZ NULL,
  retracted_by_id       UUID NULL,
  retracted_by_name     TEXT NULL,
  retraction_reason     TEXT NULL,
  is_test               BOOLEAN NOT NULL DEFAULT FALSE,
  test_run_id           TEXT NULL,
  created_by_id         UUID NULL,
  created_by_name       TEXT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT progress_reports_period_type_check
    CHECK (period_type IN ('mensual', 'trimestral')),
  CONSTRAINT progress_reports_period_range_check
    CHECK (period_start <= period_end),
  CONSTRAINT progress_reports_status_check
    CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
  CONSTRAINT progress_reports_attendance_object_check
    CHECK (jsonb_typeof(attendance_summary) = 'object'),
  CONSTRAINT progress_reports_repertoire_array_check
    CHECK (jsonb_typeof(repertoire_summary) = 'array'),
  CONSTRAINT progress_reports_content_object_check
    CHECK (jsonb_typeof(content) = 'object'),
  CONSTRAINT progress_reports_published_snapshot_check
    CHECK (published_snapshot IS NULL OR jsonb_typeof(published_snapshot) = 'object'),
  CONSTRAINT progress_reports_published_at_check
    CHECK (status <> 'published' OR published_at IS NOT NULL),
  CONSTRAINT progress_reports_test_run_check
    CHECK (is_test = (test_run_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS ix_progress_reports_student_period
  ON public.progress_reports (student_id, period_type, period_end DESC);

CREATE INDEX IF NOT EXISTS ix_progress_reports_status
  ON public.progress_reports (status, period_end DESC);

CREATE INDEX IF NOT EXISTS ix_progress_reports_is_test
  ON public.progress_reports (is_test, test_run_id);

COMMENT ON TABLE public.progress_reports IS
  'Informe mensual/trimestral. Flujo draft -> pending -> published | rejected. Aprobar = publicar. Retiro de publicado solo Dirección con motivo.';

COMMENT ON COLUMN public.progress_reports.student_id IS
  'FK a students ON DELETE SET NULL. student_name_snapshot preserva la identidad histórica.';

COMMENT ON COLUMN public.progress_reports.level_start IS
  'Nivel inicial. En trimestral se precarga con level_end del informe trimestral anterior (lógica de app, no trigger).';

COMMENT ON COLUMN public.progress_reports.attendance_summary IS
  'JSONB: {"present":n,"absent":n,"late":n,"justified":n,"pending":n,"total":n}.';

COMMENT ON COLUMN public.progress_reports.repertoire_summary IS
  'Array JSONB: [{"title":"...","normalized_title":"...","status":"...","score":8,"last_seen_date":"YYYY-MM-DD"}].';

COMMENT ON COLUMN public.progress_reports.content IS
  'Borrador estructurado generado por reglas. No se publica directamente.';

COMMENT ON COLUMN public.progress_reports.published_snapshot IS
  'Copia inmutable del informe al publicar. La familia lee esto, no los borradores.';

COMMENT ON COLUMN public.progress_reports.status IS
  'draft (docente) -> pending (enviado) -> published (aprobado/publicado) | rejected (devuelto con motivo).';

-- ============================================================================
-- 5. COMUNICADOS A FAMILIAS (NOTAS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.family_notes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                UUID NULL,
  scope                 TEXT NOT NULL,
  student_id            UUID NULL REFERENCES public.students(id) ON DELETE SET NULL,
  student_name_snapshot TEXT NULL,
  teacher_id            UUID NULL,
  teacher_name          TEXT NULL,
  cohort_student_ids    UUID[] NOT NULL DEFAULT '{}'::uuid[],
  cohort_teacher_ids    UUID[] NOT NULL DEFAULT '{}'::uuid[],
  cohort_snapshot_at    TIMESTAMPTZ NULL,
  title                 TEXT NOT NULL,
  body                  TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pendiente',
  submitted_at          TIMESTAMPTZ NULL,
  submitted_by_id       UUID NULL,
  submitted_by_name     TEXT NULL,
  reviewed_by_id        UUID NULL,
  reviewed_by_name      TEXT NULL,
  reviewed_at           TIMESTAMPTZ NULL,
  rejection_reason      TEXT NULL,
  published_at          TIMESTAMPTZ NULL,
  published_by_id       UUID NULL,
  published_by_name     TEXT NULL,
  is_test               BOOLEAN NOT NULL DEFAULT FALSE,
  test_run_id           TEXT NULL,
  created_by_id         UUID NULL,
  created_by_name       TEXT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT family_notes_scope_check
    CHECK (scope IN ('student', 'teacher_cohort', 'academy')),
  CONSTRAINT family_notes_status_check
    CHECK (status IN ('pendiente', 'publicado', 'rechazado')),
  CONSTRAINT family_notes_title_not_empty
    CHECK (length(trim(title)) > 0),
  CONSTRAINT family_notes_body_not_empty
    CHECK (length(trim(body)) > 0),
  -- student_id puede quedar NULL si el alumno se elimina (ON DELETE SET NULL).
  -- Por eso el chequeo NO exige student_id no nulo para scope='student'.
  CONSTRAINT family_notes_scope_target_check
    CHECK (
      scope IN ('student', 'academy')
      OR (scope = 'teacher_cohort' AND teacher_id IS NOT NULL)
    ),
  CONSTRAINT family_notes_cohort_published_check
    CHECK (
      status <> 'publicado'
      OR scope <> 'teacher_cohort'
      OR cardinality(cohort_student_ids) > 0
    ),
  CONSTRAINT family_notes_published_at_check
    CHECK (status <> 'publicado' OR published_at IS NOT NULL),
  CONSTRAINT family_notes_test_run_check
    CHECK (is_test = (test_run_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS ix_family_notes_student
  ON public.family_notes (student_id, published_at DESC);

CREATE INDEX IF NOT EXISTS ix_family_notes_teacher_status
  ON public.family_notes (teacher_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_family_notes_cohort_gin
  ON public.family_notes USING GIN (cohort_student_ids);

CREATE INDEX IF NOT EXISTS ix_family_notes_is_test
  ON public.family_notes (is_test, test_run_id);

COMMENT ON TABLE public.family_notes IS
  'Comunicados a familias. scope student | teacher_cohort | academy. teacher_cohort congela cohort_student_ids al publicar.';

COMMENT ON COLUMN public.family_notes.teacher_id IS
  'Docente dueño de la cohorte en scope=teacher_cohort. No necesariamente el autor; created_by_id es el autor.';

COMMENT ON COLUMN public.family_notes.cohort_student_ids IS
  'Cohorte congelada al publicar: unión de assigned_teacher_id + docentes del horario. Un alumno con dos docentes aparece en ambas cohortes; la familia ve una copia por anuncio. Array sin FK: puede contener IDs históricos de alumnos eliminados.';

COMMENT ON COLUMN public.family_notes.cohort_teacher_ids IS
  'Docentes que originaron la cohorte (para auditoría y filtros).';

COMMENT ON COLUMN public.family_notes.cohort_snapshot_at IS
  'Momento exacto en que se congeló la cohorte. Se calcula al publicar.';

-- ============================================================================
-- 6. NOTAS INTERNAS (STAFF / DIRECCIÓN)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.internal_notes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                UUID NULL,
  student_id            UUID NULL REFERENCES public.students(id) ON DELETE SET NULL,
  student_name_snapshot TEXT NULL,
  teacher_id            UUID NULL,
  teacher_name          TEXT NULL,
  body                  TEXT NOT NULL,
  visibility            TEXT NOT NULL DEFAULT 'staff',
  is_test               BOOLEAN NOT NULL DEFAULT FALSE,
  test_run_id           TEXT NULL,
  created_by_id         UUID NULL,
  created_by_name       TEXT NULL,
  updated_by_id         UUID NULL,
  updated_by_name       TEXT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT internal_notes_body_not_empty
    CHECK (length(trim(body)) > 0),
  CONSTRAINT internal_notes_visibility_check
    CHECK (visibility IN ('staff', 'direction')),
  CONSTRAINT internal_notes_test_run_check
    CHECK (is_test = (test_run_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS ix_internal_notes_student
  ON public.internal_notes (student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_internal_notes_teacher
  ON public.internal_notes (teacher_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_internal_notes_is_test
  ON public.internal_notes (is_test, test_run_id);

COMMENT ON TABLE public.internal_notes IS
  'Notas internas staff/dirección. No se publican a familias.';

-- ============================================================================
-- 7. AUDITORÍA APPEND-ONLY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.evaluation_audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NULL,
  entity_type   TEXT NOT NULL,
  entity_id     UUID NOT NULL,
  action        TEXT NOT NULL,
  actor_id      UUID NULL,
  actor_name    TEXT NULL,
  before_data   JSONB NULL,
  after_data    JSONB NULL,
  reason        TEXT NULL,
  is_test       BOOLEAN NOT NULL DEFAULT FALSE,
  test_run_id   TEXT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT evaluation_audit_log_test_run_check
    CHECK (is_test = (test_run_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS ix_evaluation_audit_entity
  ON public.evaluation_audit_log (entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_evaluation_audit_actor
  ON public.evaluation_audit_log (actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_evaluation_audit_is_test
  ON public.evaluation_audit_log (is_test, test_run_id);

COMMENT ON TABLE public.evaluation_audit_log IS
  'Auditoría append-only de evaluaciones, informes, notas y configuración. Trigger genérico; la acción semántica se deriva de before/after.status. Uso interno: no exponer al portal familia.';

COMMENT ON COLUMN public.evaluation_audit_log.entity_type IS
  'lesson_evaluation | progress_report | family_note | internal_note | evaluation_field | org_setting.';

COMMENT ON COLUMN public.evaluation_audit_log.action IS
  'insert | update | delete. Para acciones semánticas (publish/reject/retract) la app puede insertar una fila con reason; el estado está en after_data.';

COMMENT ON COLUMN public.evaluation_audit_log.before_data IS
  'Fila completa antes del cambio (NULL en INSERT).';

COMMENT ON COLUMN public.evaluation_audit_log.after_data IS
  'Fila completa después del cambio (NULL en DELETE).';

-- ============================================================================
-- 8. FUNCIONES Y TRIGGERS
-- ============================================================================

-- 8.1 updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_updated_at_org_settings ON public.org_settings;
CREATE TRIGGER trg_set_updated_at_org_settings
  BEFORE UPDATE ON public.org_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_evaluation_fields ON public.evaluation_fields;
CREATE TRIGGER trg_set_updated_at_evaluation_fields
  BEFORE UPDATE ON public.evaluation_fields
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_lesson_evaluations ON public.lesson_evaluations;
CREATE TRIGGER trg_set_updated_at_lesson_evaluations
  BEFORE UPDATE ON public.lesson_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_progress_reports ON public.progress_reports;
CREATE TRIGGER trg_set_updated_at_progress_reports
  BEFORE UPDATE ON public.progress_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_family_notes ON public.family_notes;
CREATE TRIGGER trg_set_updated_at_family_notes
  BEFORE UPDATE ON public.family_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_internal_notes ON public.internal_notes;
CREATE TRIGGER trg_set_updated_at_internal_notes
  BEFORE UPDATE ON public.internal_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8.2 Auditoría genérica.
--     El actor se toma de las columnas de actor de la fila:
--     updated_by_id -> published_by_id -> reviewed_by_id -> submitted_by_id -> created_by_id.
CREATE OR REPLACE FUNCTION public.audit_row_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old          JSONB;
  v_new          JSONB;
  v_actor_id     UUID;
  v_actor_name   TEXT;
  v_org_id       UUID;
  v_is_test      BOOLEAN;
  v_test_run_id  TEXT;
  v_entity_id    UUID;
  v_entity_type  TEXT := TG_ARGV[0];
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
    v_new := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
  ELSE
    v_old := NULL;
    v_new := to_jsonb(NEW);
  END IF;

  v_actor_id := nullif(coalesce(
    v_new->>'updated_by_id',
    v_old->>'updated_by_id',
    v_new->>'published_by_id',
    v_old->>'published_by_id',
    v_new->>'reviewed_by_id',
    v_old->>'reviewed_by_id',
    v_new->>'submitted_by_id',
    v_old->>'submitted_by_id',
    v_new->>'created_by_id',
    v_old->>'created_by_id'
  ), '')::uuid;

  v_actor_name := nullif(coalesce(
    v_new->>'updated_by_name',
    v_old->>'updated_by_name',
    v_new->>'published_by_name',
    v_old->>'published_by_name',
    v_new->>'reviewed_by_name',
    v_old->>'reviewed_by_name',
    v_new->>'submitted_by_name',
    v_old->>'submitted_by_name',
    v_new->>'created_by_name',
    v_old->>'created_by_name'
  ), '');

  v_org_id := coalesce(
    (v_new->>'org_id')::uuid,
    (v_old->>'org_id')::uuid
  );

  v_is_test := coalesce(
    (v_new->>'is_test')::boolean,
    (v_old->>'is_test')::boolean,
    FALSE
  );

  v_test_run_id := coalesce(
    v_new->>'test_run_id',
    v_old->>'test_run_id'
  );

  v_entity_id := coalesce(
    (v_new->>'id')::uuid,
    (v_old->>'id')::uuid
  );

  INSERT INTO public.evaluation_audit_log (
    org_id,
    entity_type,
    entity_id,
    action,
    actor_id,
    actor_name,
    before_data,
    after_data,
    is_test,
    test_run_id
  ) VALUES (
    v_org_id,
    v_entity_type,
    v_entity_id,
    lower(TG_OP),
    v_actor_id,
    v_actor_name,
    v_old,
    v_new,
    v_is_test,
    v_test_run_id
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_lesson_evaluations ON public.lesson_evaluations;
CREATE TRIGGER trg_audit_lesson_evaluations
  AFTER INSERT OR UPDATE OR DELETE ON public.lesson_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change('lesson_evaluation');

DROP TRIGGER IF EXISTS trg_audit_progress_reports ON public.progress_reports;
CREATE TRIGGER trg_audit_progress_reports
  AFTER INSERT OR UPDATE OR DELETE ON public.progress_reports
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change('progress_report');

DROP TRIGGER IF EXISTS trg_audit_family_notes ON public.family_notes;
CREATE TRIGGER trg_audit_family_notes
  AFTER INSERT OR UPDATE OR DELETE ON public.family_notes
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change('family_note');

DROP TRIGGER IF EXISTS trg_audit_internal_notes ON public.internal_notes;
CREATE TRIGGER trg_audit_internal_notes
  AFTER INSERT OR UPDATE OR DELETE ON public.internal_notes
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change('internal_note');

DROP TRIGGER IF EXISTS trg_audit_evaluation_fields ON public.evaluation_fields;
CREATE TRIGGER trg_audit_evaluation_fields
  AFTER INSERT OR UPDATE OR DELETE ON public.evaluation_fields
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change('evaluation_field');

DROP TRIGGER IF EXISTS trg_audit_org_settings ON public.org_settings;
CREATE TRIGGER trg_audit_org_settings
  AFTER INSERT OR UPDATE OR DELETE ON public.org_settings
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change('org_setting');

-- ============================================================================
-- 9. VISTA DE DATOS DE PRUEBA (PARA LIMPIEZA QUIRÚRGICA)
-- ============================================================================

CREATE OR REPLACE VIEW public.v_test_records AS
SELECT 'lesson_evaluations'::text AS table_name, id, test_run_id, created_at
FROM public.lesson_evaluations WHERE is_test
UNION ALL
SELECT 'progress_reports'::text, id, test_run_id, created_at
FROM public.progress_reports WHERE is_test
UNION ALL
SELECT 'family_notes'::text, id, test_run_id, created_at
FROM public.family_notes WHERE is_test
UNION ALL
SELECT 'internal_notes'::text, id, test_run_id, created_at
FROM public.internal_notes WHERE is_test
UNION ALL
SELECT 'evaluation_audit_log'::text, id, test_run_id, created_at
FROM public.evaluation_audit_log WHERE is_test;

COMMENT ON VIEW public.v_test_records IS
  'Lista todos los registros is_test=true con su test_run_id. Permite limpiar un lote de piloto sin DELETE masivo.';

-- ============================================================================
-- 10. PERMISOS (ANON KEY / AUTHENTICATED)
--     Se otorgan permisos porque la app usa la anon key. evaluation_audit_log
--     es append-only: solo SELECT e INSERT (el trigger inserta como definer).
-- ============================================================================

DO $$
DECLARE
  v_role TEXT;
BEGIN
  FOREACH v_role IN ARRAY ARRAY['anon', 'authenticated']
  LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = v_role) THEN
      EXECUTE format('GRANT SELECT, INSERT, UPDATE ON public.org_settings TO %I', v_role);
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.evaluation_fields TO %I', v_role);
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_evaluations TO %I', v_role);
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_reports TO %I', v_role);
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_notes TO %I', v_role);
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.internal_notes TO %I', v_role);
      EXECUTE format('GRANT SELECT, INSERT ON public.evaluation_audit_log TO %I', v_role);
      EXECUTE format('GRANT SELECT ON public.v_test_records TO %I', v_role);
    END IF;
  END LOOP;
END;
$$;

-- ============================================================================
-- 11. DOCUMENTACIÓN LEGACY
-- ============================================================================

COMMENT ON COLUMN public.students.notes IS
  'LEGACY CONGELADO. No usar en el nuevo sistema de evaluación. Usar lesson_evaluations / progress_reports / family_notes.';

-- ============================================================================
-- 12. VERIFICACIÓN (SOLO LECTURA)
-- ============================================================================

-- 12.1 Tablas y vista creadas
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'org_settings',
    'evaluation_fields',
    'lesson_evaluations',
    'progress_reports',
    'family_notes',
    'internal_notes',
    'evaluation_audit_log',
    'v_test_records'
  )
ORDER BY table_name;

-- 12.2 Seeds de configuración
SELECT setting_key, jsonb_pretty(setting_value) AS value
FROM public.org_settings
WHERE org_id IS NULL
ORDER BY setting_key;

-- 12.3 Triggers de auditoría
SELECT event_object_table, trigger_name
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trg_audit_%'
ORDER BY event_object_table;

-- ============================================================================
-- 13. LIMPIEZA QUIRÚRGICA DE UN LOTE DE PRUEBA (COMENTADO)
--     Ejecutar como owner en el SQL Editor de Insforge (no con la anon key).
--     Reemplazar 'PILOTO-2026-10' por el test_run_id real.
--     NO usar DELETE sin condición de test_run_id ni TRUNCATE.
--     Borrar la auditoría al final para que no queden rastros del lote.
-- ============================================================================

-- DELETE FROM public.lesson_evaluations WHERE is_test = TRUE AND test_run_id = 'PILOTO-2026-10';
-- DELETE FROM public.progress_reports  WHERE is_test = TRUE AND test_run_id = 'PILOTO-2026-10';
-- DELETE FROM public.family_notes      WHERE is_test = TRUE AND test_run_id = 'PILOTO-2026-10';
-- DELETE FROM public.internal_notes    WHERE is_test = TRUE AND test_run_id = 'PILOTO-2026-10';
-- DELETE FROM public.evaluation_audit_log WHERE is_test = TRUE AND test_run_id = 'PILOTO-2026-10';

-- ============================================================================
-- 14. ROLLBACK (COMENTADO — SOLO EL USUARIO/DIRECCIÓN, CON RESPALDO PREVIO)
--     El agente nunca ejecuta este bloque.
-- ============================================================================

-- DROP VIEW IF EXISTS public.v_test_records;
--
-- DROP TRIGGER IF EXISTS trg_audit_org_settings ON public.org_settings;
-- DROP TRIGGER IF EXISTS trg_audit_evaluation_fields ON public.evaluation_fields;
-- DROP TRIGGER IF EXISTS trg_audit_internal_notes ON public.internal_notes;
-- DROP TRIGGER IF EXISTS trg_audit_family_notes ON public.family_notes;
-- DROP TRIGGER IF EXISTS trg_audit_progress_reports ON public.progress_reports;
-- DROP TRIGGER IF EXISTS trg_audit_lesson_evaluations ON public.lesson_evaluations;
--
-- DROP TRIGGER IF EXISTS trg_set_updated_at_internal_notes ON public.internal_notes;
-- DROP TRIGGER IF EXISTS trg_set_updated_at_family_notes ON public.family_notes;
-- DROP TRIGGER IF EXISTS trg_set_updated_at_progress_reports ON public.progress_reports;
-- DROP TRIGGER IF EXISTS trg_set_updated_at_lesson_evaluations ON public.lesson_evaluations;
-- DROP TRIGGER IF EXISTS trg_set_updated_at_evaluation_fields ON public.evaluation_fields;
-- DROP TRIGGER IF EXISTS trg_set_updated_at_org_settings ON public.org_settings;
--
-- DROP FUNCTION IF EXISTS public.audit_row_change();
-- DROP FUNCTION IF EXISTS public.set_updated_at();
--
-- DROP TABLE IF EXISTS public.evaluation_audit_log;
-- DROP TABLE IF EXISTS public.internal_notes;
-- DROP TABLE IF EXISTS public.family_notes;
-- DROP TABLE IF EXISTS public.progress_reports;
-- DROP TABLE IF EXISTS public.lesson_evaluations;
-- DROP TABLE IF EXISTS public.evaluation_fields;
-- DROP TABLE IF EXISTS public.org_settings;
