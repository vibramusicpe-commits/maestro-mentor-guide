/**
 * ================================================================
 * Tipos compartidos — Evaluaciones, informes y notas (Fase 1)
 * ================================================================
 *
 * Estos tipos reflejan las tablas creadas en la migración 008/008b:
 *   - org_settings / evaluation_fields
 *   - lesson_evaluations
 *   - progress_reports
 *   - family_notes
 *   - internal_notes
 *
 * Reglas:
 *   - No incluir datos financieros en el snapshot pedagógico.
 *   - El portal familia solo debe leer `published_snapshot` de un informe.
 *   - `internal_notes` jamás se expone al portal familia.
 */

export type ClassMode = "individual" | "grupal" | "no_aplica";

export type OverallStatus =
  | "logrado"
  | "en_proceso"
  | "pendiente"
  | "no_corresponde"
  | "sin_evaluar";

export type RepertoireStatus =
  | "logrado"
  | "en_proceso"
  | "pendiente"
  | "no_corresponde";

export type EvaluationFieldType =
  | "checkbox"
  | "dropdown"
  | "traffic_light"
  | "score_1_10"
  | "short_text"
  | "long_text";

export type ProgressReportPeriodType = "mensual" | "trimestral";

export type ProgressReportStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected";

export type FamilyNoteScope = "student" | "teacher_cohort" | "academy";

export type FamilyNoteStatus = "pendiente" | "publicado" | "rechazado";

export type InternalNoteStatus = "nueva" | "leida" | "archivada";

export type InternalNoteVisibility = "staff" | "direction";

export type FeatureFlagKey =
  | "evaluationsV2"
  | "familyNotesV2"
  | "progressReportsV2"
  | "parentReports";

export type FeatureFlags = Record<FeatureFlagKey, boolean>;

/** Actor que ejecuta una acción (docente, secretaría o dirección). */
export interface ActorRef {
  id?: string | null;
  name?: string | null;
  role?: string | null;
}

/** Resultado normalizado de is_test / test_run_id. */
export interface TestFlags {
  is_test: boolean;
  test_run_id: string | null;
}

export interface RepertoireItem {
  title: string;
  normalized_title: string;
  status: RepertoireStatus;
  score?: number | null;
  /** Solo se agrega al consolidar un informe; no se guarda por sesión. */
  last_seen_date?: string;
}

export interface ExtraScoreSnapshot {
  field_id?: string | null;
  field_key?: string | null;
  label: string;
  type: EvaluationFieldType | string;
  raw_value: unknown;
  band?: string | null;
}

export interface EvaluationFieldRow {
  id: string;
  org_id: string | null;
  owner_teacher_id: string | null;
  instrument: string | null;
  program: string | null;
  age_min: number | null;
  age_max: number | null;
  field_key: string;
  label: string;
  field_type: EvaluationFieldType;
  options: unknown[];
  ui_config: Record<string, unknown>;
  required: boolean;
  visible_in_report: boolean;
  report_order: number;
  help_text: string | null;
  is_active: boolean;
  created_by_id: string | null;
  created_by_name: string | null;
  updated_by_id: string | null;
  updated_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonEvaluationRow {
  id: string;
  org_id: string | null;
  session_key: string;
  lesson_id: string | null;
  student_id: string | null;
  student_name_snapshot: string | null;
  teacher_id: string | null;
  teacher_name: string | null;
  created_by_id: string | null;
  created_by_name: string | null;
  updated_by_id: string | null;
  updated_by_name: string | null;
  session_date: string;
  start_time: string;
  duration_min: number;
  modality: string | null;
  instrument: string | null;
  program: string | null;
  class_mode: ClassMode;
  topic: string | null;
  overall_status: OverallStatus;
  score: number | null;
  repertoire: RepertoireItem[];
  homework: string | null;
  teacher_comment: string | null;
  extra_scores: ExtraScoreSnapshot[];
  is_test: boolean;
  test_run_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgressReportRow {
  id: string;
  org_id: string | null;
  student_id: string | null;
  student_name_snapshot: string | null;
  teacher_id: string | null;
  teacher_name: string | null;
  period_type: ProgressReportPeriodType;
  period_start: string;
  period_end: string;
  level_start: string | null;
  level_end: string | null;
  attendance_summary: Record<string, unknown>;
  repertoire_summary: RepertoireItem[];
  strengths: string | null;
  goals: string | null;
  recommendations: string | null;
  family_message: string | null;
  teacher_comment: string | null;
  content: Record<string, unknown>;
  published_snapshot: Record<string, unknown> | null;
  status: ProgressReportStatus;
  submitted_at: string | null;
  submitted_by_id: string | null;
  submitted_by_name: string | null;
  reviewed_by_id: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  published_at: string | null;
  published_by_id: string | null;
  published_by_name: string | null;
  retracted_at: string | null;
  retracted_by_id: string | null;
  retracted_by_name: string | null;
  retraction_reason: string | null;
  is_test: boolean;
  test_run_id: string | null;
  created_by_id: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyNoteRow {
  id: string;
  org_id: string | null;
  scope: FamilyNoteScope;
  student_id: string | null;
  student_name_snapshot: string | null;
  teacher_id: string | null;
  teacher_name: string | null;
  cohort_student_ids: string[];
  cohort_teacher_ids: string[];
  cohort_snapshot_at: string | null;
  title: string;
  body: string;
  status: FamilyNoteStatus;
  submitted_at: string | null;
  submitted_by_id: string | null;
  submitted_by_name: string | null;
  reviewed_by_id: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  published_at: string | null;
  published_by_id: string | null;
  published_by_name: string | null;
  is_test: boolean;
  test_run_id: string | null;
  created_by_id: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface InternalNoteRow {
  id: string;
  org_id: string | null;
  student_id: string | null;
  student_name_snapshot: string | null;
  teacher_id: string | null;
  teacher_name: string | null;
  body: string;
  visibility: InternalNoteVisibility;
  status: InternalNoteStatus;
  read_at: string | null;
  read_by_id: string | null;
  read_by_name: string | null;
  is_test: boolean;
  test_run_id: string | null;
  created_by_id: string | null;
  created_by_name: string | null;
  updated_by_id: string | null;
  updated_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendancePeriodSummary {
  start: string;
  end: string;
  present: number;
  absent: number;
  late: number;
  justified: number;
  pending: number;
  total: number;
  evaluated: number;
  /** % sobre sesiones evaluadas (presente + tarde cuentan como asistencia). */
  attendanceRate: number | null;
}

export interface AttendanceCycleSummary {
  targetQuota: number;
  attended: number;
  missed: number;
  justified: number;
  tardy: number;
  pending: number;
  makeups: number;
  makeupCreditsAvailable: number;
  completionPercentage: number;
  isCompleted: boolean;
}

/**
 * Snapshot pedagógico de asistencia. NO contiene montos, precios, saldos,
 * facturas ni auditoría financiera. Es la base del informe de progreso.
 */
export interface AttendanceSnapshot {
  studentId: string;
  studentName: string;
  instrument: string;
  level: string;
  modality: string;
  teacher: string;
  period: AttendancePeriodSummary;
  cycle: AttendanceCycleSummary;
  repertoire: RepertoireItem[];
  extraScores: ExtraScoreSnapshot[];
  generatedAt: string;
}

export interface ProgressReportPeriod {
  type: ProgressReportPeriodType;
  start: string;
  end: string;
  label?: string;
}

export interface SaveLessonEvaluationInput {
  lessonId?: string | null;
  studentId: string;
  studentName?: string | null;
  teacherId: string;
  teacherName: string;
  createdById?: string | null;
  createdByName?: string | null;
  sessionDate: string;
  startTime: string;
  durationMin?: number;
  modality?: string | null;
  instrument?: string | null;
  program?: string | null;
  classMode?: ClassMode;
  topic?: string | null;
  overallStatus?: OverallStatus;
  score?: number | null;
  repertoire?: RepertoireItem[] | unknown[];
  homework?: string | null;
  teacherComment?: string | null;
  extraScores?: ExtraScoreSnapshot[] | unknown[];
  isTest?: boolean;
  testRunId?: string | null;
  /** Opcional; si no se envía se calcula con buildSessionKey. */
  sessionKey?: string | null;
}

export interface UpdateProgressReportPatch {
  level_start?: string | null;
  level_end?: string | null;
  strengths?: string | null;
  goals?: string | null;
  recommendations?: string | null;
  family_message?: string | null;
  teacher_comment?: string | null;
  content?: Record<string, unknown>;
  repertoire_summary?: RepertoireItem[];
  attendance_summary?: Record<string, unknown>;
  status?: "draft" | "pending";
}

export interface SubmitFamilyNoteInput {
  scope: FamilyNoteScope;
  studentId?: string | null;
  studentName?: string | null;
  teacherId?: string | null;
  teacherName?: string | null;
  cohortStudentIds?: string[];
  cohortTeacherIds?: string[];
  title: string;
  body: string;
  submittedById?: string | null;
  submittedByName?: string | null;
  isTest?: boolean;
  testRunId?: string | null;
}

export interface CreateInternalNoteInput {
  studentId?: string | null;
  studentName?: string | null;
  teacherId?: string | null;
  teacherName?: string | null;
  body: string;
  visibility?: InternalNoteVisibility;
  createdById?: string | null;
  createdByName?: string | null;
  isTest?: boolean;
  testRunId?: string | null;
}

/** Resultado de una evaluación apto para la UI del docente. */
export interface EvaluationCriteriaQuery {
  instrument?: string | null;
  ageCategory?: string | null;
  level?: string | null;
  teacherId?: string | null;
  includeInactive?: boolean;
}

export interface StudentEvaluationQuery {
  from?: string;
  to?: string;
  includeTest?: boolean;
  limit?: number;
}
