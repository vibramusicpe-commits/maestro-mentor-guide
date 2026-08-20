-- ================================================================
-- 004_populate_real_data_seeds.sql
-- Poblado Oficial de Datos en PostgreSQL (Insforge / Vibra Music)
-- ================================================================

-- 1. Insertar Usuarios del Personal y Docentes
INSERT INTO users (id, email, full_name, role, phone, is_active, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'dueña@vibramusic.pe', 'Dirección (Dueña)', 'super_admin', '987654320', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'nayeli@vibramusic.pe', 'Nayeli (Secretaría)', 'staff', '987654321', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'jeremy@vibramusic.pe', 'Jeremy', 'teacher', '987654322', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'fernando@vibramusic.pe', 'Fernando', 'teacher', '987654323', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000005', 'nathaly@vibramusic.pe', 'Nathaly', 'teacher', '987654324', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000006', 'demo@vibramusic.pe', 'Profesor Demo', 'teacher', '987654325', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 2. Insertar Familias y Alumnos Oficiales

-- Alumno #1: Sanchez Justa, Johandry Henry
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000001', 'Familia Sanchez Justa', 'Familia Sanchez Justa', '984100000', 'alumno_1@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 'Sanchez Justa, Johandry Henry', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Sanchez Justa","phone":"984100000","relation":"Apoderado"}'::jsonb, 'pagó 200 falta 97 mas la mensualidad de agosto', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #2: Gonzales Cuba, Jose Angel
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000002', 'Familia Gonzales Cuba', 'Familia Gonzales Cuba', '992872645', 'alumno_2@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000002', 'Gonzales Cuba, Jose Angel', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Gonzales Cuba","phone":"992872645","relation":"Apoderado"}'::jsonb, '197.00 ( JUNIO Y JULIO)', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #3: Rodríguez Guzmán, Alexandra Maritza
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000003', 'Familia Rodríguez Guzmán', 'Familia Rodríguez Guzmán', '941305165', 'alumno_3@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000003', 'Rodríguez Guzmán, Alexandra Maritza', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Rodríguez Guzmán","phone":"941305165","relation":"Apoderado"}'::jsonb, 'Recien en julio en adelante pagara (nueva)', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #4: Franco Cabrera, Luciano Leonardo
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000004', 'Familia Franco Cabrera', 'Familia Franco Cabrera', '987427289', 'alumno_4@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000004', 'Franco Cabrera, Luciano Leonardo', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Franco Cabrera","phone":"987427289","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #5: Conislla Huerta, Iker Samín
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000005', 'Familia Conislla Huerta', 'Familia Conislla Huerta', '994827408', 'alumno_5@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000005', 'Conislla Huerta, Iker Samín', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Conislla Huerta","phone":"994827408","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #6: Malpartina Ramos, Mateo Salvador
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000006', 'Familia Malpartina Ramos', 'Familia Malpartina Ramos', '910180362', 'alumno_6@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000006', 'Malpartina Ramos, Mateo Salvador', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Malpartina Ramos","phone":"910180362","relation":"Apoderado"}'::jsonb, 'viene sábado 15/08', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #7: Yajaira Ayquipa
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000007', 'Familia Yajaira Ayquipa', 'Familia Yajaira Ayquipa', '924868844', 'alumno_7@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000007', 'Yajaira Ayquipa', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Yajaira Ayquipa","phone":"924868844","relation":"Apoderado"}'::jsonb, 'no contesta', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #8: Guastavo Zuñiga Quispe
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000008', 'Familia Guastavo Zuñiga Quispe', 'Familia Guastavo Zuñiga Quispe', '984100049', 'alumno_8@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000008', 'Guastavo Zuñiga Quispe', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Guastavo Zuñiga Quispe","phone":"984100049","relation":"Apoderado"}'::jsonb, 'Nuevo - Pendiente pago del mes junio. Se cobra automático', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #9: Francezca Esther Aylas Naupari
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000009', 'Familia Francezca Esther Aylas Naupari', 'Familia Francezca Esther Aylas Naupari', '984100056', 'alumno_9@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0001-000000000009', 'Francezca Esther Aylas Naupari', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Francezca Esther Aylas Naupari","phone":"984100056","relation":"Apoderado"}'::jsonb, 'Se cobra automático (revisar ingresos)', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #10: Bruno Marcelo Juan de Dios y Boris Marcelo Juan de Dios
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000000a', 'Familia Bruno Marcelo Juan de Dios y Boris Marcelo Juan de Dios', 'Familia Bruno Marcelo Juan de Dios y Boris Marcelo Juan de Dios', '997549474', 'alumno_10@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000000a', '00000000-0000-0000-0001-00000000000a', 'Bruno Marcelo Juan de Dios y Boris Marcelo Juan de Dios', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Bruno Marcelo Juan de Dios y Boris Marcelo Juan de Dios","phone":"997549474","relation":"Apoderado"}'::jsonb, 'Nuevo se le cobra 1 de agosto', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #11: Leonardo Villacorta
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000000b', 'Familia Leonardo Villacorta', 'Familia Leonardo Villacorta', '933520330', 'alumno_11@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000000b', '00000000-0000-0000-0001-00000000000b', 'Leonardo Villacorta', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Leonardo Villacorta","phone":"933520330","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #12: Antonella Osorio Huaman
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000000c', 'Familia Antonella Osorio Huaman', 'Familia Antonella Osorio Huaman', '969065775', 'alumno_12@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000000c', '00000000-0000-0000-0001-00000000000c', 'Antonella Osorio Huaman', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Antonella Osorio Huaman","phone":"969065775","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #13: Carlos Isaac Carhuachin
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000000d', 'Familia Carlos Isaac Carhuachin', 'Familia Carlos Isaac Carhuachin', '991279213', 'alumno_13@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000000d', '00000000-0000-0000-0001-00000000000d', 'Carlos Isaac Carhuachin', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Carlos Isaac Carhuachin","phone":"991279213","relation":"Apoderado"}'::jsonb, 'nuevo', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #14: Yrco Samaniego, Stefano
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000000e', 'Familia Yrco Samaniego', 'Familia Yrco Samaniego', '902211277', 'alumno_14@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000000e', '00000000-0000-0000-0001-00000000000e', 'Yrco Samaniego, Stefano', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Yrco Samaniego","phone":"902211277","relation":"Apoderado"}'::jsonb, 'Pago el 5 de junio', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #15: Soto Soto, Ivanna
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000000f', 'Familia Soto Soto', 'Familia Soto Soto', '953686972', 'alumno_15@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000000f', '00000000-0000-0000-0001-00000000000f', 'Soto Soto, Ivanna', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Soto Soto","phone":"953686972","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #16: Soto Soto, Ivanna + Luis Soto soto
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000010', 'Familia Soto Soto', 'Familia Soto Soto', '953686972', 'alumno_16@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0001-000000000010', 'Soto Soto, Ivanna + Luis Soto soto', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Soto Soto","phone":"953686972","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #17: Ethan Romero Manrique
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000011', 'Familia Ethan Romero Manrique', 'Familia Ethan Romero Manrique', '923786068', 'alumno_17@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000011', '00000000-0000-0000-0001-000000000011', 'Ethan Romero Manrique', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Ethan Romero Manrique","phone":"923786068","relation":"Apoderado"}'::jsonb, 'CANCELÓ POR 3 MESES', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #18: Liliana Mandujano
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000012', 'Familia Liliana Mandujano', 'Familia Liliana Mandujano', '928570603', 'alumno_18@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000012', '00000000-0000-0000-0001-000000000012', 'Liliana Mandujano', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Liliana Mandujano","phone":"928570603","relation":"Apoderado"}'::jsonb, 'Clase personalizada - se le cobra por clase', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #19: Meza Salome, Jhosua Ruben
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000013', 'Familia Meza Salome', 'Familia Meza Salome', '934715287', 'alumno_19@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0001-000000000013', 'Meza Salome, Jhosua Ruben', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Meza Salome","phone":"934715287","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #20: Sanches Sanchez, Liam Jesús
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000014', 'Familia Sanches Sanchez', 'Familia Sanches Sanchez', '924265315', 'alumno_20@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000014', '00000000-0000-0000-0001-000000000014', 'Sanches Sanchez, Liam Jesús', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Sanches Sanchez","phone":"924265315","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #21: Marco Antonio
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000015', 'Familia Marco Antonio', 'Familia Marco Antonio', '994774940', 'alumno_21@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000015', '00000000-0000-0000-0001-000000000015', 'Marco Antonio', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Marco Antonio","phone":"994774940","relation":"Apoderado"}'::jsonb, 'Nuevo - revisar . pága en dos partes', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #22: Miranda Aquino, Miguel Angel
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000016', 'Familia Miranda Aquino', 'Familia Miranda Aquino', '962039082', 'alumno_22@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000016', '00000000-0000-0000-0001-000000000016', 'Miranda Aquino, Miguel Angel', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Miranda Aquino","phone":"962039082","relation":"Apoderado"}'::jsonb, 'se le debe 6 clases', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #23: Tocas Vasquez, Adonis Yeret
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000017', 'Familia Tocas Vasquez', 'Familia Tocas Vasquez', '984100154', 'alumno_23@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000017', '00000000-0000-0000-0001-000000000017', 'Tocas Vasquez, Adonis Yeret', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Tocas Vasquez","phone":"984100154","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #24: Torres Leon, Sara
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000018', 'Familia Torres Leon', 'Familia Torres Leon', '912834887', 'alumno_24@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000018', '00000000-0000-0000-0001-000000000018', 'Torres Leon, Sara', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Torres Leon","phone":"912834887","relation":"Apoderado"}'::jsonb, 'desde agosto', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #25: Farfan Mendoza, Marycielo Nicole
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000019', 'Familia Farfan Mendoza', 'Familia Farfan Mendoza', '984100168', 'alumno_25@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000019', '00000000-0000-0000-0001-000000000019', 'Farfan Mendoza, Marycielo Nicole', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Farfan Mendoza","phone":"984100168","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #26: Farfan Mendoza, Maryfer
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000001a', 'Familia Farfan Mendoza', 'Familia Farfan Mendoza', '984100175', 'alumno_26@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000001a', '00000000-0000-0000-0001-00000000001a', 'Farfan Mendoza, Maryfer', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Farfan Mendoza","phone":"984100175","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #27: Micaela Vilchez
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000001b', 'Familia Micaela Vilchez', 'Familia Micaela Vilchez', '952324832', 'alumno_27@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000001b', '00000000-0000-0000-0001-00000000001b', 'Micaela Vilchez', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Micaela Vilchez","phone":"952324832","relation":"Apoderado"}'::jsonb, 'se le debe 5 clases', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #28: Anton, Uriel, Gabriel y Eitan
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000001c', 'Familia Anton', 'Familia Anton', '977783340', 'alumno_28@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000001c', '00000000-0000-0000-0001-00000000001c', 'Anton, Uriel, Gabriel y Eitan', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Anton","phone":"977783340","relation":"Apoderado"}'::jsonb, 'pagará el sábado', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #29: Samantha Castillo
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000001d', 'Familia Samantha Castillo', 'Familia Samantha Castillo', '960580399', 'alumno_29@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000001d', '00000000-0000-0000-0001-00000000001d', 'Samantha Castillo', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Samantha Castillo","phone":"960580399","relation":"Apoderado"}'::jsonb, 'ingreso 7 de julio - no contesta', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #30: Carolina Luna Tito
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000001e', 'Familia Carolina Luna Tito', 'Familia Carolina Luna Tito', '936370723', 'alumno_30@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000001e', '00000000-0000-0000-0001-00000000001e', 'Carolina Luna Tito', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Carolina Luna Tito","phone":"936370723","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #31: De La Cruz Huapaya, Romina Nathaly
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000001f', 'Familia De La Cruz Huapaya', 'Familia De La Cruz Huapaya', '956249085', 'alumno_31@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000001f', '00000000-0000-0000-0001-00000000001f', 'De La Cruz Huapaya, Romina Nathaly', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia De La Cruz Huapaya","phone":"956249085","relation":"Apoderado"}'::jsonb, 'Pago el 8 de junio', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #32: Jara Saldarriaga, Ethan Paolo
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000020', 'Familia Jara Saldarriaga', 'Familia Jara Saldarriaga', '984309257', 'alumno_32@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000020', '00000000-0000-0000-0001-000000000020', 'Jara Saldarriaga, Ethan Paolo', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Jara Saldarriaga","phone":"984309257","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #33: Mesa Llallahui, Andrea Fernanda
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000021', 'Familia Mesa Llallahui', 'Familia Mesa Llallahui', '930182010', 'alumno_33@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000021', '00000000-0000-0000-0001-000000000021', 'Mesa Llallahui, Andrea Fernanda', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Mesa Llallahui","phone":"930182010","relation":"Apoderado"}'::jsonb, 'SE LE COBRA EL 10 DE OCTUBRE???', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #34: Huamali Cortez, Carlos (BATERIA)
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000022', 'Familia Huamali Cortez', 'Familia Huamali Cortez', '947215751', 'alumno_34@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000022', '00000000-0000-0000-0001-000000000022', 'Huamali Cortez, Carlos (BATERIA)', 'Batería', 'Nivel 1', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Huamali Cortez","phone":"947215751","relation":"Apoderado"}'::jsonb, 'NO CONTESTA', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #35: Conde, Sofía Valentina
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000023', 'Familia Conde', 'Familia Conde', '996087235', 'alumno_35@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000023', '00000000-0000-0000-0001-000000000023', 'Conde, Sofía Valentina', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Conde","phone":"996087235","relation":"Apoderado"}'::jsonb, 'Proximo pago de julio se normaliza a 297 - no contesta', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #36: Valladolid Sanchez, Santiago Mathias
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000024', 'Familia Valladolid Sanchez', 'Familia Valladolid Sanchez', '987921575', 'alumno_36@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000024', '00000000-0000-0000-0001-000000000024', 'Valladolid Sanchez, Santiago Mathias', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Valladolid Sanchez","phone":"987921575","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #37: Curi Qquecho, Renzo y Angie
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000025', 'Familia Curi Qquecho', 'Familia Curi Qquecho', '961023495', 'alumno_37@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000025', '00000000-0000-0000-0001-000000000025', 'Curi Qquecho, Renzo y Angie', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Curi Qquecho","phone":"961023495","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #38: Alvarez Moya, Leonardo
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000026', 'Familia Alvarez Moya', 'Familia Alvarez Moya', '971112371', 'alumno_38@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000026', '00000000-0000-0000-0001-000000000026', 'Alvarez Moya, Leonardo', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Alvarez Moya","phone":"971112371","relation":"Apoderado"}'::jsonb, 'Proximo pago de julio se normaliza a 297', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #39: García Zuñiga, Celeste Elizabeth
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000027', 'Familia García Zuñiga', 'Familia García Zuñiga', '968657514', 'alumno_39@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000027', '00000000-0000-0000-0001-000000000027', 'García Zuñiga, Celeste Elizabeth', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia García Zuñiga","phone":"968657514","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #40: Solorzano Cuya, Saúl
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000028', 'Familia Solorzano Cuya', 'Familia Solorzano Cuya', '961494127', 'alumno_40@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000028', '00000000-0000-0000-0001-000000000028', 'Solorzano Cuya, Saúl', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Solorzano Cuya","phone":"961494127","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #41: Zarate Alcarraz, Stephanie Abigail
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000029', 'Familia Zarate Alcarraz', 'Familia Zarate Alcarraz', '970090351', 'alumno_41@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000029', '00000000-0000-0000-0001-000000000029', 'Zarate Alcarraz, Stephanie Abigail', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Zarate Alcarraz","phone":"970090351","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #42: Sara Ximena Ortiz Vivas
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000002a', 'Familia Sara Ximena Ortiz Vivas', 'Familia Sara Ximena Ortiz Vivas', '923785176', 'alumno_42@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000002a', '00000000-0000-0000-0001-00000000002a', 'Sara Ximena Ortiz Vivas', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Sara Ximena Ortiz Vivas","phone":"923785176","relation":"Apoderado"}'::jsonb, 'NUEVA EN JULIO', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #43: Pineda Espinoza, Alonso
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000002b', 'Familia Pineda Espinoza', 'Familia Pineda Espinoza', '984384180', 'alumno_43@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000002b', '00000000-0000-0000-0001-00000000002b', 'Pineda Espinoza, Alonso', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Pineda Espinoza","phone":"984384180","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #44: Verástegui Picón, Krizia Verónica
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000002c', 'Familia Verástegui Picón', 'Familia Verástegui Picón', '941482574', 'alumno_44@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000002c', '00000000-0000-0000-0001-00000000002c', 'Verástegui Picón, Krizia Verónica', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Verástegui Picón","phone":"941482574","relation":"Apoderado"}'::jsonb, 'FALTARA POR 3 SEMANAS', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #45: Del Quiroz Sulca, Carlos Ignacio
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000002d', 'Familia Del Quiroz Sulca', 'Familia Del Quiroz Sulca', '936138686', 'alumno_45@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000002d', '00000000-0000-0000-0001-00000000002d', 'Del Quiroz Sulca, Carlos Ignacio', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Del Quiroz Sulca","phone":"936138686","relation":"Apoderado"}'::jsonb, 'QUIERE PAGAR CUANDO RECUPERE LAS CLASES 6', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #46: Flavia Nicole Concepcion
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000002e', 'Familia Flavia Nicole Concepcion', 'Familia Flavia Nicole Concepcion', '933125352', 'alumno_46@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000002e', '00000000-0000-0000-0001-00000000002e', 'Flavia Nicole Concepcion', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Flavia Nicole Concepcion","phone":"933125352","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #47: Álvarez Galarreta, Gabriel Fabiano
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000002f', 'Familia Álvarez Galarreta', 'Familia Álvarez Galarreta', '975687085', 'alumno_47@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000002f', '00000000-0000-0000-0001-00000000002f', 'Álvarez Galarreta, Gabriel Fabiano', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Álvarez Galarreta","phone":"975687085","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #48: Sofía De la Cruz Vellaneda
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000030', 'Familia Sofía De la Cruz Vellaneda', 'Familia Sofía De la Cruz Vellaneda', '987584730', 'alumno_48@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000030', '00000000-0000-0000-0001-000000000030', 'Sofía De la Cruz Vellaneda', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Sofía De la Cruz Vellaneda","phone":"987584730","relation":"Apoderado"}'::jsonb, 'nueva - ingreso julio', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #49: Bellido Alvan, Mia Lucero
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000031', 'Familia Bellido Alvan', 'Familia Bellido Alvan', '934106343', 'alumno_49@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000031', '00000000-0000-0000-0001-000000000031', 'Bellido Alvan, Mia Lucero', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Bellido Alvan","phone":"934106343","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #50: Aithana Rivas Badajoz
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000032', 'Familia Aithana Rivas Badajoz', 'Familia Aithana Rivas Badajoz', '977528878', 'alumno_50@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000032', '00000000-0000-0000-0001-000000000032', 'Aithana Rivas Badajoz', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Aithana Rivas Badajoz","phone":"977528878","relation":"Apoderado"}'::jsonb, 'Pago completo, por yape.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #51: Suarez Salazar, Yamir
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000033', 'Familia Suarez Salazar', 'Familia Suarez Salazar', '985501740', 'alumno_51@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000033', '00000000-0000-0000-0001-000000000033', 'Suarez Salazar, Yamir', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Suarez Salazar","phone":"985501740","relation":"Apoderado"}'::jsonb, 'QUIERE RECUPERAR CLASES PRIMERO le faltan 2 clases', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #52: Llallahui Alvarado, Kenny Armando
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000034', 'Familia Llallahui Alvarado', 'Familia Llallahui Alvarado', '977931974', 'alumno_52@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000034', '00000000-0000-0000-0001-000000000034', 'Llallahui Alvarado, Kenny Armando', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Llallahui Alvarado","phone":"977931974","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #53: Huerta Mitma, Juan Diego
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000035', 'Familia Huerta Mitma', 'Familia Huerta Mitma', '997549474', 'alumno_53@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000035', '00000000-0000-0000-0001-000000000035', 'Huerta Mitma, Juan Diego', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Huerta Mitma","phone":"997549474","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #54: Florindez Aguilar, Layla Mariapaula
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000036', 'Familia Florindez Aguilar', 'Familia Florindez Aguilar', '934563643', 'alumno_54@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000036', '00000000-0000-0000-0001-000000000036', 'Florindez Aguilar, Layla Mariapaula', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Florindez Aguilar","phone":"934563643","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #55: Florindez Aguilar, Eithan David
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000037', 'Familia Florindez Aguilar', 'Familia Florindez Aguilar', '934563643', 'alumno_55@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000037', '00000000-0000-0000-0001-000000000037', 'Florindez Aguilar, Eithan David', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Florindez Aguilar","phone":"934563643","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #56: Rios de la Cruz, Edward
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000038', 'Familia Rios de la Cruz', 'Familia Rios de la Cruz', '984100385', 'alumno_56@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000038', '00000000-0000-0000-0001-000000000038', 'Rios de la Cruz, Edward', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Rios de la Cruz","phone":"984100385","relation":"Apoderado"}'::jsonb, 'se le cobra en agosto 297', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #57: Quispe Vilcapoma, Matias Gabriel
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000039', 'Familia Quispe Vilcapoma', 'Familia Quispe Vilcapoma', '989625788', 'alumno_57@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000039', '00000000-0000-0000-0001-000000000039', 'Quispe Vilcapoma, Matias Gabriel', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Quispe Vilcapoma","phone":"989625788","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #58: Judith Chaparro Gonzales
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000003a', 'Familia Judith Chaparro Gonzales', 'Familia Judith Chaparro Gonzales', '947504097', 'alumno_58@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000003a', '00000000-0000-0000-0001-00000000003a', 'Judith Chaparro Gonzales', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Judith Chaparro Gonzales","phone":"947504097","relation":"Apoderado"}'::jsonb, 'se va por dos semanas', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #59: Magallanes Frisancho, Yesenia Maria
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000003b', 'Familia Magallanes Frisancho', 'Familia Magallanes Frisancho', '984100406', 'alumno_59@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000003b', '00000000-0000-0000-0001-00000000003b', 'Magallanes Frisancho, Yesenia Maria', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'baja'::student_status_enum, 0, 100, '{"name":"Familia Magallanes Frisancho","phone":"984100406","relation":"Apoderado"}'::jsonb, 'NO CONTINUARÁ', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #60: Irribarren Paz, Francesco
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000003c', 'Familia Irribarren Paz', 'Familia Irribarren Paz', '916704270', 'alumno_60@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000003c', '00000000-0000-0000-0001-00000000003c', 'Irribarren Paz, Francesco', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Irribarren Paz","phone":"916704270","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #61: Rodriguez, Joan Paolo
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000003d', 'Familia Rodriguez', 'Familia Rodriguez', '984100420', 'alumno_61@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000003d', '00000000-0000-0000-0001-00000000003d', 'Rodriguez, Joan Paolo', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Rodriguez","phone":"984100420","relation":"Apoderado"}'::jsonb, 'CLASE PERSONALIZADA LE FALTAN 3 CLASES  HASTA 22/07', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #62: Castillo Bueno, Mathew
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000003e', 'Familia Castillo Bueno', 'Familia Castillo Bueno', '932133618', 'alumno_62@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000003e', '00000000-0000-0000-0001-00000000003e', 'Castillo Bueno, Mathew', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Castillo Bueno","phone":"932133618","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #63: Leon Gonzales, Joshua
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000003f', 'Familia Leon Gonzales', 'Familia Leon Gonzales', '918148199', 'alumno_63@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000003f', '00000000-0000-0000-0001-00000000003f', 'Leon Gonzales, Joshua', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Leon Gonzales","phone":"918148199","relation":"Apoderado"}'::jsonb, 'PAGO 3 MESES (RECIEN PAGA EN AGOSTO ) pagara el sábado', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #64: De La Cruz Pucyura, Carlomagno Tomas
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000040', 'Familia De La Cruz Pucyura', 'Familia De La Cruz Pucyura', '990621266', 'alumno_64@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000040', '00000000-0000-0000-0001-000000000040', 'De La Cruz Pucyura, Carlomagno Tomas', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia De La Cruz Pucyura","phone":"990621266","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #65: Pariona Pumahuillca, Juan Mateo Azael
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000041', 'Familia Pariona Pumahuillca', 'Familia Pariona Pumahuillca', '989726595', 'alumno_65@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000041', '00000000-0000-0000-0001-000000000041', 'Pariona Pumahuillca, Juan Mateo Azael', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Pariona Pumahuillca","phone":"989726595","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #66: Loja Villajuan, Kaled Radamel
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000042', 'Familia Loja Villajuan', 'Familia Loja Villajuan', '951558668', 'alumno_66@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000042', '00000000-0000-0000-0001-000000000042', 'Loja Villajuan, Kaled Radamel', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Loja Villajuan","phone":"951558668","relation":"Apoderado"}'::jsonb, 'Aun no inicia clases (debe libros y mensualidad )}', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #67: De la Cruz, Geraldine
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000043', 'Familia De la Cruz', 'Familia De la Cruz', '992413230', 'alumno_67@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000043', '00000000-0000-0000-0001-000000000043', 'De la Cruz, Geraldine', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia De la Cruz","phone":"992413230","relation":"Apoderado"}'::jsonb, 'Proximo pago de julio se normaliza a 297, sin embargo 197 + 67 es primer mes', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #68: Dulce, Dulce
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000044', 'Familia Dulce', 'Familia Dulce', '992413230', 'alumno_68@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000044', '00000000-0000-0000-0001-000000000044', 'Dulce, Dulce', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Dulce","phone":"992413230","relation":"Apoderado"}'::jsonb, 'Proximo pago de julio se normaliza a 297,  sin embargo 197 + 67 es primer mes', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #69: Moscoso Valentin, Yuriana
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000045', 'Familia Moscoso Valentin', 'Familia Moscoso Valentin', '904781203', 'alumno_69@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000045', '00000000-0000-0000-0001-000000000045', 'Moscoso Valentin, Yuriana', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Moscoso Valentin","phone":"904781203","relation":"Apoderado"}'::jsonb, 'Pago 3 meses le toca pagar en Julio (se reincorpora en agosto)', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #70: Estela Nuñes, Max Benjamin
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000046', 'Familia Estela Nuñes', 'Familia Estela Nuñes', '984100483', 'alumno_70@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000046', '00000000-0000-0000-0001-000000000046', 'Estela Nuñes, Max Benjamin', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'pausa'::student_status_enum, 0, 100, '{"name":"Familia Estela Nuñes","phone":"984100483","relation":"Apoderado"}'::jsonb, 'EN PAUSA', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #71: Ticona Cachay, Jonathan
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000047', 'Familia Ticona Cachay', 'Familia Ticona Cachay', '962386336', 'alumno_71@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000047', '00000000-0000-0000-0001-000000000047', 'Ticona Cachay, Jonathan', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Ticona Cachay","phone":"962386336","relation":"Apoderado"}'::jsonb, 'pago 3 meses por 24 clases hasta el 13/04 ya no tiene clases por recuperar', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #72: Tomas (piano --particulares)
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000048', 'Familia Tomas (piano --particulares)', 'Familia Tomas (piano --particulares)', '984100497', 'alumno_72@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000048', '00000000-0000-0000-0001-000000000048', 'Tomas (piano --particulares)', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Tomas (piano --particulares)","phone":"984100497","relation":"Apoderado"}'::jsonb, '2 clases 75.00 soles / 1 clase  45 soles', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #73: Meza, Jamil
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000049', 'Familia Meza', 'Familia Meza', '984100504', 'alumno_73@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000049', '00000000-0000-0000-0001-000000000049', 'Meza, Jamil', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Meza","phone":"984100504","relation":"Apoderado"}'::jsonb, 'CLASES PARTICULARES PIANO', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #74: Edinson Omar Centeno Huayta
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000004a', 'Familia Edinson Omar Centeno Huayta', 'Familia Edinson Omar Centeno Huayta', '968002242', 'alumno_74@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000004a', '00000000-0000-0000-0001-00000000004a', 'Edinson Omar Centeno Huayta', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Edinson Omar Centeno Huayta","phone":"968002242","relation":"Apoderado"}'::jsonb, 'PENDIENTE mensualidad primera cuota', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #75: Luana Camila Zamora Ochoa
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000004b', 'Familia Luana Camila Zamora Ochoa', 'Familia Luana Camila Zamora Ochoa', '915067137', 'alumno_75@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000004b', '00000000-0000-0000-0001-00000000004b', 'Luana Camila Zamora Ochoa', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Luana Camila Zamora Ochoa","phone":"915067137","relation":"Apoderado"}'::jsonb, 'Nuevo - por definir fecha de ingreso y por consiguiente  pago', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #76: Niah Jimena Montalvo Huerta
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000004c', 'Familia Niah Jimena Montalvo Huerta', 'Familia Niah Jimena Montalvo Huerta', '935993601', 'alumno_76@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000004c', '00000000-0000-0000-0001-00000000004c', 'Niah Jimena Montalvo Huerta', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Niah Jimena Montalvo Huerta","phone":"935993601","relation":"Apoderado"}'::jsonb, 'Nueva paga sábado 11 | y el resto fin de mes ingresa el 11dejuli', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #77: Catalina Salvador Gutierrez
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000004d', 'Familia Catalina Salvador Gutierrez', 'Familia Catalina Salvador Gutierrez', '929913991', 'alumno_77@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000004d', '00000000-0000-0000-0001-00000000004d', 'Catalina Salvador Gutierrez', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Catalina Salvador Gutierrez","phone":"929913991","relation":"Apoderado"}'::jsonb, 'nueva - aun no tiene decha de inicio, probablemente sea en agosto.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #78: Sasha Contreras de la Cruz
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000004e', 'Familia Sasha Contreras de la Cruz', 'Familia Sasha Contreras de la Cruz', '984100539', 'alumno_78@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000004e', '00000000-0000-0000-0001-00000000004e', 'Sasha Contreras de la Cruz', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Sasha Contreras de la Cruz","phone":"984100539","relation":"Apoderado"}'::jsonb, 'PENDIENTE 47 SOLES', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #79: Fabiana Arroyo Tineo
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000004f', 'Familia Fabiana Arroyo Tineo', 'Familia Fabiana Arroyo Tineo', '966716051', 'alumno_79@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000004f', '00000000-0000-0000-0001-00000000004f', 'Fabiana Arroyo Tineo', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Fabiana Arroyo Tineo","phone":"966716051","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #80: Thaisa Lucero Oyarce Cruz
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000050', 'Familia Thaisa Lucero Oyarce Cruz', 'Familia Thaisa Lucero Oyarce Cruz', '989708032', 'alumno_80@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000050', '00000000-0000-0000-0001-000000000050', 'Thaisa Lucero Oyarce Cruz', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Thaisa Lucero Oyarce Cruz","phone":"989708032","relation":"Apoderado"}'::jsonb, 'nueva agosto', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #81: Valerie Yidda Angulo Chipana
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000051', 'Familia Valerie Yidda Angulo Chipana', 'Familia Valerie Yidda Angulo Chipana', '934164251', 'alumno_81@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000051', '00000000-0000-0000-0001-000000000051', 'Valerie Yidda Angulo Chipana', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Valerie Yidda Angulo Chipana","phone":"934164251","relation":"Apoderado"}'::jsonb, 'LE FALTAN 5 CLASES PARA COMPLETAR', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #82: Enzo Raul Ayala
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000052', 'Familia Enzo Raul Ayala', 'Familia Enzo Raul Ayala', '954056837', 'alumno_82@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000052', '00000000-0000-0000-0001-000000000052', 'Enzo Raul Ayala', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Enzo Raul Ayala","phone":"954056837","relation":"Apoderado"}'::jsonb, 'nuevo julio - pendiente de pago mensualidad', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #83: Camila Valentina Pastor Conco
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000053', 'Familia Camila Valentina Pastor Conco', 'Familia Camila Valentina Pastor Conco', '910875526', 'alumno_83@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000053', '00000000-0000-0000-0001-000000000053', 'Camila Valentina Pastor Conco', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Camila Valentina Pastor Conco","phone":"910875526","relation":"Apoderado"}'::jsonb, '2 clases para recuperar', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #84: Asaf Chipana Urribarri
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000054', 'Familia Asaf Chipana Urribarri', 'Familia Asaf Chipana Urribarri', '987404984', 'alumno_84@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000054', '00000000-0000-0000-0001-000000000054', 'Asaf Chipana Urribarri', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Asaf Chipana Urribarri","phone":"987404984","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #85: Liam Huanca Huamantupa
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000055', 'Familia Liam Huanca Huamantupa', 'Familia Liam Huanca Huamantupa', '969085167', 'alumno_85@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000055', '00000000-0000-0000-0001-000000000055', 'Liam Huanca Huamantupa', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Liam Huanca Huamantupa","phone":"969085167","relation":"Apoderado"}'::jsonb, 'nuevo julio - pendiente mensualidad y utiles', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #86: Emma Micaela Sevilla
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000056', 'Familia Emma Micaela Sevilla', 'Familia Emma Micaela Sevilla', '986740292', 'alumno_86@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000056', '00000000-0000-0000-0001-000000000056', 'Emma Micaela Sevilla', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Emma Micaela Sevilla","phone":"986740292","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #87: Aarón Balarezo Sosa
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000057', 'Familia Aarón Balarezo Sosa', 'Familia Aarón Balarezo Sosa', '920493604', 'alumno_87@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000057', '00000000-0000-0000-0001-000000000057', 'Aarón Balarezo Sosa', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Aarón Balarezo Sosa","phone":"920493604","relation":"Apoderado"}'::jsonb, 'nuevo agosto - pendiente pago de mensualidad y útiles', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #88: Alexis Bringos Facho
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000058', 'Familia Alexis Bringos Facho', 'Familia Alexis Bringos Facho', '984100609', 'alumno_88@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000058', '00000000-0000-0000-0001-000000000058', 'Alexis Bringos Facho', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Alexis Bringos Facho","phone":"984100609","relation":"Apoderado"}'::jsonb, 'clases personalizadas', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #89: Emmanuel Rospligiosi
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000059', 'Familia Emmanuel Rospligiosi', 'Familia Emmanuel Rospligiosi', '984100616', 'alumno_89@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000059', '00000000-0000-0000-0001-000000000059', 'Emmanuel Rospligiosi', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Emmanuel Rospligiosi","phone":"984100616","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #90: Giussepe Granda
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000005a', 'Familia Giussepe Granda', 'Familia Giussepe Granda', '984100623', 'alumno_90@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000005a', '00000000-0000-0000-0001-00000000005a', 'Giussepe Granda', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Giussepe Granda","phone":"984100623","relation":"Apoderado"}'::jsonb, 'ingresa el 6 de agosto', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #91: Mateo Quispe Trujillo
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000005b', 'Familia Mateo Quispe Trujillo', 'Familia Mateo Quispe Trujillo', '993478448', 'alumno_91@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000005b', '00000000-0000-0000-0001-00000000005b', 'Mateo Quispe Trujillo', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Mateo Quispe Trujillo","phone":"993478448","relation":"Apoderado"}'::jsonb, 'nuevo agosto pendiente utiles y mensualidad (364)', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #92: Mirko Malpartida
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000005c', 'Familia Mirko Malpartida', 'Familia Mirko Malpartida', '935188205', 'alumno_92@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000005c', '00000000-0000-0000-0001-00000000005c', 'Mirko Malpartida', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Mirko Malpartida","phone":"935188205","relation":"Apoderado"}'::jsonb, 'Paga por clase personalizada', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #93: Marco Antonio  Adrian
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000005d', 'Familia Marco Antonio  Adrian', 'Familia Marco Antonio  Adrian', '936888840', 'alumno_93@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000005d', '00000000-0000-0000-0001-00000000005d', 'Marco Antonio  Adrian', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Marco Antonio  Adrian","phone":"936888840","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #94: Kiara Mariños
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000005e', 'Familia Kiara Mariños', 'Familia Kiara Mariños', '984100651', 'alumno_94@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000005e', '00000000-0000-0000-0001-00000000005e', 'Kiara Mariños', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Kiara Mariños","phone":"984100651","relation":"Apoderado"}'::jsonb, 'Alumno importado del Control de Pagos Oficial.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #95: Karen Gutierrez
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000005f', 'Familia Karen Gutierrez', 'Familia Karen Gutierrez', '923277024', 'alumno_95@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000005f', '00000000-0000-0000-0001-00000000005f', 'Karen Gutierrez', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Karen Gutierrez","phone":"923277024","relation":"Apoderado"}'::jsonb, 'nueva agosto', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #96: Raphaela Yangali -  Isabella Yangali
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000060', 'Familia Raphaela Yangali -  Isabella Yangali', 'Familia Raphaela Yangali -  Isabella Yangali', '984100665', 'alumno_96@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000060', '00000000-0000-0000-0001-000000000060', 'Raphaela Yangali -  Isabella Yangali', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Raphaela Yangali -  Isabella Yangali","phone":"984100665","relation":"Apoderado"}'::jsonb, 'nuevas agosto', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #97: Mishel Suarez Cardenas
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000061', 'Familia Mishel Suarez Cardenas', 'Familia Mishel Suarez Cardenas', '984100672', 'alumno_97@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000061', '00000000-0000-0000-0001-000000000061', 'Mishel Suarez Cardenas', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Mishel Suarez Cardenas","phone":"984100672","relation":"Apoderado"}'::jsonb, 'nueva agosto - pendiente pago de mensualidad y libro', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #98: Antonela Diaz Sanchez
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000062', 'Familia Antonela Diaz Sanchez', 'Familia Antonela Diaz Sanchez', '923080434', 'alumno_98@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000062', '00000000-0000-0000-0001-000000000062', 'Antonela Diaz Sanchez', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Antonela Diaz Sanchez","phone":"923080434","relation":"Apoderado"}'::jsonb, 'pagará el lunes 17', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #99: Gael Mathias Lopez Loayza
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000063', 'Familia Gael Mathias Lopez Loayza', 'Familia Gael Mathias Lopez Loayza', '901958954', 'alumno_99@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000063', '00000000-0000-0000-0001-000000000063', 'Gael Mathias Lopez Loayza', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Familia Gael Mathias Lopez Loayza","phone":"901958954","relation":"Apoderado"}'::jsonb, 'nuevo agosto', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- 3. Insertar Facturas Oficiales de Agosto 2026

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0001-000000000001', 'Mensualidad Agosto 2026 — Sanchez Justa, Johandry Henry', 297, 0, 297, '2026-08-01', 'vencido'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0001-000000000002', 'Mensualidad Agosto 2026 — Gonzales Cuba, Jose Angel', 197, 0, 197, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0001-000000000003', 'Mensualidad Agosto 2026 — Rodríguez Guzmán, Alexandra Maritza', 297, 0, 297, '2026-08-01', 'vencido'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0001-000000000004', 'Mensualidad Agosto 2026 — Franco Cabrera, Luciano Leonardo', 297, 297, 0, '2026-08-01', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0001-000000000005', 'Mensualidad Agosto 2026 — Conislla Huerta, Iker Samín', 252, 252, 0, '2026-08-01', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0001-000000000006', 'Mensualidad Agosto 2026 — Malpartina Ramos, Mateo Salvador', 297, 0, 297, '2026-08-01', 'vencido'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0001-000000000007', 'Mensualidad Agosto 2026 — Yajaira Ayquipa', 297, 0, 297, '2026-08-01', 'vencido'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0001-000000000008', 'Mensualidad Agosto 2026 — Guastavo Zuñiga Quispe', 297, 0, 297, '2026-08-01', 'vencido'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0001-000000000009', 'Mensualidad Agosto 2026 — Francezca Esther Aylas Naupari', 297, 297, 0, '2026-08-01', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000000a', '00000000-0000-0000-0001-00000000000a', 'Mensualidad Agosto 2026 — Bruno Marcelo Juan de Dios y Boris Marcelo Juan de Dios', 522, 522, 0, '2026-08-01', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000000b', '00000000-0000-0000-0001-00000000000b', 'Mensualidad Agosto 2026 — Leonardo Villacorta', 297, 0, 297, '2026-08-01', 'vencido'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000000c', '00000000-0000-0000-0001-00000000000c', 'Mensualidad Agosto 2026 — Antonella Osorio Huaman', 297, 297, 0, '2026-08-01', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000000d', '00000000-0000-0000-0001-00000000000d', 'Mensualidad Agosto 2026 — Carlos Isaac Carhuachin', 297, 0, 297, '2026-08-01', 'vencido'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000000e', '00000000-0000-0000-0001-00000000000e', 'Mensualidad Agosto 2026 — Yrco Samaniego, Stefano', 297, 297, 0, '2026-08-08', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000000f', '00000000-0000-0000-0001-00000000000f', 'Mensualidad Agosto 2026 — Soto Soto, Ivanna', 522, 522, 0, '2026-08-08', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0001-000000000010', 'Mensualidad Agosto 2026 — Soto Soto, Ivanna + Luis Soto soto', 522, 522, 0, '2026-08-03', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000011', '00000000-0000-0000-0001-000000000011', 'Mensualidad Agosto 2026 — Ethan Romero Manrique', 297, 297, 0, '2026-08-03', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0001-000000000012', 'Mensualidad Agosto 2026 — Liliana Mandujano', 50, 0, 50, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000013', '00000000-0000-0000-0001-000000000013', 'Mensualidad Agosto 2026 — Meza Salome, Jhosua Ruben', 397, 0, 397, '2026-08-04', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000014', '00000000-0000-0000-0001-000000000014', 'Mensualidad Agosto 2026 — Sanches Sanchez, Liam Jesús', 297, 297, 0, '2026-08-04', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000015', '00000000-0000-0000-0001-000000000015', 'Mensualidad Agosto 2026 — Marco Antonio', 297, 0, 297, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000016', '00000000-0000-0000-0001-000000000016', 'Mensualidad Agosto 2026 — Miranda Aquino, Miguel Angel', 297, 0, 297, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000017', '00000000-0000-0000-0001-000000000017', 'Mensualidad Agosto 2026 — Tocas Vasquez, Adonis Yeret', 297, 297, 0, '2026-08-05', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000018', '00000000-0000-0000-0001-000000000018', 'Mensualidad Agosto 2026 — Torres Leon, Sara', 522, 0, 522, '2026-08-05', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000019', '00000000-0000-0000-0001-000000000019', 'Mensualidad Agosto 2026 — Farfan Mendoza, Marycielo Nicole', 290, 290, 0, '2026-08-06', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000001a', '00000000-0000-0000-0001-00000000001a', 'Mensualidad Agosto 2026 — Farfan Mendoza, Maryfer', 290, 290, 0, '2026-08-01', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000001b', '00000000-0000-0000-0001-00000000001b', 'Mensualidad Agosto 2026 — Micaela Vilchez', 297, 0, 297, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000001c', '00000000-0000-0000-0001-00000000001c', 'Mensualidad Agosto 2026 — Anton, Uriel, Gabriel y Eitan', 783, 783, 0, '2026-08-07', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000001d', '00000000-0000-0000-0001-00000000001d', 'Mensualidad Agosto 2026 — Samantha Castillo', 297, 0, 297, '2026-08-07', 'vencido'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000001e', '00000000-0000-0000-0001-00000000001e', 'Mensualidad Agosto 2026 — Carolina Luna Tito', 297, 297, 0, '2026-08-07', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000001f', '00000000-0000-0000-0001-00000000001f', 'Mensualidad Agosto 2026 — De La Cruz Huapaya, Romina Nathaly', 297, 0, 297, '2026-08-08', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000020', '00000000-0000-0000-0001-000000000020', 'Mensualidad Agosto 2026 — Jara Saldarriaga, Ethan Paolo', 329, 0, 329, '2026-08-18', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000021', '00000000-0000-0000-0001-000000000021', 'Mensualidad Agosto 2026 — Mesa Llallahui, Andrea Fernanda', 783, 783, 0, '2026-08-10', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000022', '00000000-0000-0000-0001-000000000022', 'Mensualidad Agosto 2026 — Huamali Cortez, Carlos (BATERIA)', 261, 0, 261, '2026-08-11', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000023', '00000000-0000-0000-0001-000000000023', 'Mensualidad Agosto 2026 — Conde, Sofía Valentina', 297, 0, 297, '2026-08-11', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000024', '00000000-0000-0000-0001-000000000024', 'Mensualidad Agosto 2026 — Valladolid Sanchez, Santiago Mathias', 297, 297, 0, '2026-08-11', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000025', '00000000-0000-0000-0001-000000000025', 'Mensualidad Agosto 2026 — Curi Qquecho, Renzo y Angie', 522, 0, 522, '2026-08-14', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000026', '00000000-0000-0000-0001-000000000026', 'Mensualidad Agosto 2026 — Alvarez Moya, Leonardo', 297, 0, 297, '2026-08-15', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000027', '00000000-0000-0000-0001-000000000027', 'Mensualidad Agosto 2026 — García Zuñiga, Celeste Elizabeth', 297, 0, 297, '2026-08-30', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000028', '00000000-0000-0000-0001-000000000028', 'Mensualidad Agosto 2026 — Solorzano Cuya, Saúl', 297, 0, 297, '2026-08-16', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000029', '00000000-0000-0000-0001-000000000029', 'Mensualidad Agosto 2026 — Zarate Alcarraz, Stephanie Abigail', 297, 0, 297, '2026-08-16', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000002a', '00000000-0000-0000-0001-00000000002a', 'Mensualidad Agosto 2026 — Sara Ximena Ortiz Vivas', 297, 0, 297, '2026-08-16', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000002b', '00000000-0000-0000-0001-00000000002b', 'Mensualidad Agosto 2026 — Pineda Espinoza, Alonso', 297, 0, 297, '2026-08-17', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000002c', '00000000-0000-0000-0001-00000000002c', 'Mensualidad Agosto 2026 — Verástegui Picón, Krizia Verónica', 868.2, 0, 868.2, '2026-08-17', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000002d', '00000000-0000-0000-0001-00000000002d', 'Mensualidad Agosto 2026 — Del Quiroz Sulca, Carlos Ignacio', 297, 0, 297, '2026-08-17', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000002e', '00000000-0000-0000-0001-00000000002e', 'Mensualidad Agosto 2026 — Flavia Nicole Concepcion', 297, 0, 297, '2026-08-17', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000002f', '00000000-0000-0000-0001-00000000002f', 'Mensualidad Agosto 2026 — Álvarez Galarreta, Gabriel Fabiano', 297, 0, 297, '2026-08-18', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000030', '00000000-0000-0000-0001-000000000030', 'Mensualidad Agosto 2026 — Sofía De la Cruz Vellaneda', 297, 0, 297, '2026-08-18', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000031', '00000000-0000-0000-0001-000000000031', 'Mensualidad Agosto 2026 — Bellido Alvan, Mia Lucero', 297, 297, 0, '2026-08-01', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000032', '00000000-0000-0000-0001-000000000032', 'Mensualidad Agosto 2026 — Aithana Rivas Badajoz', 297, 0, 297, '2026-08-20', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000033', '00000000-0000-0000-0001-000000000033', 'Mensualidad Agosto 2026 — Suarez Salazar, Yamir', 297, 0, 297, '2026-08-21', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000034', '00000000-0000-0000-0001-000000000034', 'Mensualidad Agosto 2026 — Llallahui Alvarado, Kenny Armando', 297, 0, 297, '2026-08-21', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000035', '00000000-0000-0000-0001-000000000035', 'Mensualidad Agosto 2026 — Huerta Mitma, Juan Diego', 297, 0, 297, '2026-08-22', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000036', '00000000-0000-0000-0001-000000000036', 'Mensualidad Agosto 2026 — Florindez Aguilar, Layla Mariapaula', 261, 0, 261, '2026-08-22', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000037', '00000000-0000-0000-0001-000000000037', 'Mensualidad Agosto 2026 — Florindez Aguilar, Eithan David', 261, 0, 261, '2026-08-22', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000038', '00000000-0000-0000-0001-000000000038', 'Mensualidad Agosto 2026 — Rios de la Cruz, Edward', 297, 0, 297, '2026-08-22', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000039', '00000000-0000-0000-0001-000000000039', 'Mensualidad Agosto 2026 — Quispe Vilcapoma, Matias Gabriel', 297, 0, 297, '2026-08-23', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000003a', '00000000-0000-0000-0001-00000000003a', 'Mensualidad Agosto 2026 — Judith Chaparro Gonzales', 297, 0, 297, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000003b', '00000000-0000-0000-0001-00000000003b', 'Mensualidad Agosto 2026 — Magallanes Frisancho, Yesenia Maria', 297, 0, 297, '2026-08-25', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000003c', '00000000-0000-0000-0001-00000000003c', 'Mensualidad Agosto 2026 — Irribarren Paz, Francesco', 297, 297, 0, '2026-08-25', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000003d', '00000000-0000-0000-0001-00000000003d', 'Mensualidad Agosto 2026 — Rodriguez, Joan Paolo', 297, 0, 297, '2026-08-26', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000003e', '00000000-0000-0000-0001-00000000003e', 'Mensualidad Agosto 2026 — Castillo Bueno, Mathew', 297, 0, 297, '2026-08-28', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000003f', '00000000-0000-0000-0001-00000000003f', 'Mensualidad Agosto 2026 — Leon Gonzales, Joshua', 297, 0, 297, '2026-08-07', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000040', '00000000-0000-0000-0001-000000000040', 'Mensualidad Agosto 2026 — De La Cruz Pucyura, Carlomagno Tomas', 297, 0, 297, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000041', '00000000-0000-0000-0001-000000000041', 'Mensualidad Agosto 2026 — Pariona Pumahuillca, Juan Mateo Azael', 297, 297, 0, '2026-08-07', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000042', '00000000-0000-0000-0001-000000000042', 'Mensualidad Agosto 2026 — Loja Villajuan, Kaled Radamel', 197, 0, 197, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000043', '00000000-0000-0000-0001-000000000043', 'Mensualidad Agosto 2026 — De la Cruz, Geraldine', 297, 0, 297, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000044', '00000000-0000-0000-0001-000000000044', 'Mensualidad Agosto 2026 — Dulce, Dulce', 297, 0, 297, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000045', '00000000-0000-0000-0001-000000000045', 'Mensualidad Agosto 2026 — Moscoso Valentin, Yuriana', 297, 0, 297, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000046', '00000000-0000-0000-0001-000000000046', 'Mensualidad Agosto 2026 — Estela Nuñes, Max Benjamin', 297, 0, 297, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000047', '00000000-0000-0000-0001-000000000047', 'Mensualidad Agosto 2026 — Ticona Cachay, Jonathan', 297, 0, 297, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000048', '00000000-0000-0000-0001-000000000048', 'Mensualidad Agosto 2026 — Tomas (piano --particulares)', 297, 0, 297, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000049', '00000000-0000-0000-0001-000000000049', 'Mensualidad Agosto 2026 — Meza, Jamil', 50, 0, 50, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000004a', '00000000-0000-0000-0001-00000000004a', 'Mensualidad Agosto 2026 — Edinson Omar Centeno Huayta', 261, 0, 261, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000004b', '00000000-0000-0000-0001-00000000004b', 'Mensualidad Agosto 2026 — Luana Camila Zamora Ochoa', 297, 0, 297, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000004c', '00000000-0000-0000-0001-00000000004c', 'Mensualidad Agosto 2026 — Niah Jimena Montalvo Huerta', 783, 0, 783, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000004d', '00000000-0000-0000-0001-00000000004d', 'Mensualidad Agosto 2026 — Catalina Salvador Gutierrez', 297, 0, 297, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000004e', '00000000-0000-0000-0001-00000000004e', 'Mensualidad Agosto 2026 — Sasha Contreras de la Cruz', 297, 0, 297, '2026-08-30', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000004f', '00000000-0000-0000-0001-00000000004f', 'Mensualidad Agosto 2026 — Fabiana Arroyo Tineo', 297, 0, 297, '2026-08-21', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000050', '00000000-0000-0000-0001-000000000050', 'Mensualidad Agosto 2026 — Thaisa Lucero Oyarce Cruz', 297, 297, 0, '2026-08-04', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000051', '00000000-0000-0000-0001-000000000051', 'Mensualidad Agosto 2026 — Valerie Yidda Angulo Chipana', 297, 0, 297, '2026-08-14', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000052', '00000000-0000-0000-0001-000000000052', 'Mensualidad Agosto 2026 — Enzo Raul Ayala', 297, 0, 297, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000053', '00000000-0000-0000-0001-000000000053', 'Mensualidad Agosto 2026 — Camila Valentina Pastor Conco', 297, 0, 297, '2026-08-30', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000054', '00000000-0000-0000-0001-000000000054', 'Mensualidad Agosto 2026 — Asaf Chipana Urribarri', 297, 297, 0, '2026-08-03', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000055', '00000000-0000-0000-0001-000000000055', 'Mensualidad Agosto 2026 — Liam Huanca Huamantupa', 297, 0, 297, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000056', '00000000-0000-0000-0001-000000000056', 'Mensualidad Agosto 2026 — Emma Micaela Sevilla', 297, 0, 297, '2026-08-31', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000057', '00000000-0000-0000-0001-000000000057', 'Mensualidad Agosto 2026 — Aarón Balarezo Sosa', 297, 0, 297, '2026-08-13', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000058', '00000000-0000-0000-0001-000000000058', 'Mensualidad Agosto 2026 — Alexis Bringos Facho', 50, 0, 50, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000059', '00000000-0000-0000-0001-000000000059', 'Mensualidad Agosto 2026 — Emmanuel Rospligiosi', 297, 297, 0, '2026-08-03', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000005a', '00000000-0000-0000-0001-00000000005a', 'Mensualidad Agosto 2026 — Giussepe Granda', 297, 297, 0, '2026-08-06', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000005b', '00000000-0000-0000-0001-00000000005b', 'Mensualidad Agosto 2026 — Mateo Quispe Trujillo', 297, 0, 297, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000005c', '00000000-0000-0000-0001-00000000005c', 'Mensualidad Agosto 2026 — Mirko Malpartida', 60, 0, 60, '2026-08-01', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000005d', '00000000-0000-0000-0001-00000000005d', 'Mensualidad Agosto 2026 — Marco Antonio  Adrian', 297, 297, 0, '2026-08-11', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000005e', '00000000-0000-0000-0001-00000000005e', 'Mensualidad Agosto 2026 — Kiara Mariños', 297, 297, 0, '2026-08-13', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000005f', '00000000-0000-0000-0001-00000000005f', 'Mensualidad Agosto 2026 — Karen Gutierrez', 297, 297, 0, '2026-08-10', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000060', '00000000-0000-0000-0001-000000000060', 'Mensualidad Agosto 2026 — Raphaela Yangali -  Isabella Yangali', 687, 687, 0, '2026-08-11', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000061', '00000000-0000-0000-0001-000000000061', 'Mensualidad Agosto 2026 — Mishel Suarez Cardenas', 297, 0, 297, '2026-08-17', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000062', '00000000-0000-0000-0001-000000000062', 'Mensualidad Agosto 2026 — Antonela Diaz Sanchez', 297, 0, 297, '2026-08-15', 'vencido'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000063', '00000000-0000-0000-0001-000000000063', 'Mensualidad Agosto 2026 — Gael Mathias Lopez Loayza', 297, 297, 0, '2026-08-04', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;
