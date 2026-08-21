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

-- Alumno #1: Ticona Cachay, Jonathan
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000001', 'Familia Ticona Cachay', 'Ticona Cachay, Jonathan', '962386336', 'alumno_1@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 'Ticona Cachay, Jonathan', 'Canto', 'Nivel 2', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Ticona Cachay, Jonathan","phone":"962386336","relation":"Titular Directo"}'::jsonb, 'Invitación Retorno', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #2: Conislla Huerta, Iker Samín
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000002', 'Familia Conislla Huerta', 'Julio Cesar Conislla Hinostroza', '994827408', 'alumno_2@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000002', 'Conislla Huerta, Iker Samín', 'Piano Infantil', 'Iniciación Musical', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Julio Cesar Conislla Hinostroza","phone":"994827408","relation":"Apoderado"}'::jsonb, 'Valor con Video', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #3: De La Cruz Pucyura, Carlomagno Tomas
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000003', 'Familia De La Cruz Pucyura', 'Magno Angel De La Cruz Valencia', '990621266', 'alumno_3@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000003', 'De La Cruz Pucyura, Carlomagno Tomas', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'baja'::student_status_enum, 0, 75, '{"name":"Magno Angel De La Cruz Valencia","phone":"990621266","relation":"Apoderado"}'::jsonb, 'Valor con Video', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #4: Sanchez Justa, Johandry Henry
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000004', 'Familia Sanchez Justa', 'Mark Anthony Sanchez Justo', '900617145', 'alumno_4@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000004', 'Sanchez Justa, Johandry Henry', 'Batería', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Mark Anthony Sanchez Justo","phone":"900617145","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #5: Meza Llallahui, Andrea Fernanda
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000005', 'Familia Meza Llallahui', 'Luggi Boore', '930182010', 'alumno_5@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000005', 'Meza Llallahui, Andrea Fernanda', 'Batería', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Luggi Boore","phone":"930182010","relation":"Titular Directo"}'::jsonb, 'Valor con Video', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #6: Huerta Mitma, Juan Diego
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000006', 'Familia Huerta Mitma', 'Juan Carlos Huerta Concepción', '997549474', 'alumno_6@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000006', 'Huerta Mitma, Juan Diego', 'Guitarra clásica', 'Nivel 1', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Juan Carlos Huerta Concepción","phone":"997549474","relation":"Apoderado"}'::jsonb, 'Blog Beneficios', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #7: Álvares Galarreta, Gabriel Fabiano
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000007', 'Familia Álvares Galarreta', 'Galarreta Sanches, Janet', '975687085', 'alumno_7@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000007', 'Álvares Galarreta, Gabriel Fabiano', 'Batería', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Galarreta Sanches, Janet","phone":"975687085","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #8: Anton, Junior Gabriel
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000008', 'Familia Anton', 'Anton Rodriguez, Anthony', '977783340', 'alumno_8@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000008', 'Anton, Junior Gabriel', 'Batería', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Anton Rodriguez, Anthony","phone":"977783340","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #9: Anton, Uriel
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000009', 'Familia Anton', 'Anton Rodriguez, Anthony', '977783340', 'alumno_9@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0001-000000000009', 'Anton, Uriel', 'Batería', 'Nivel 1', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Anton Rodriguez, Anthony","phone":"977783340","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #10: Bellido Alvan, Mia Lucero
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000000a', 'Familia Bellido Alvan', 'Alvan Souza, Luz Elena', '934106343', 'alumno_10@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000000a', '00000000-0000-0000-0001-00000000000a', 'Bellido Alvan, Mia Lucero', 'Canto', 'Nivel 1', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Alvan Souza, Luz Elena","phone":"934106343","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #11: Chapi, Eitan Anton
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000000b', 'Familia Chapi', 'Anton Rodriguez, Anthony', '977783340', 'alumno_11@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000000b', '00000000-0000-0000-0001-00000000000b', 'Chapi, Eitan Anton', 'Piano', 'Nivel 2', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Anton Rodriguez, Anthony","phone":"977783340","relation":"Apoderado"}'::jsonb, 'Blog Beneficios', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #12: De La Cruz Huapaya, Romina Nathaly
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000000c', 'Familia De La Cruz Huapaya', 'Huapaya Cuzcano, Jessica Nadia', '956249085', 'alumno_12@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000000c', '00000000-0000-0000-0001-00000000000c', 'De La Cruz Huapaya, Romina Nathaly', 'Guitarra clásica', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'baja'::student_status_enum, 0, 75, '{"name":"Huapaya Cuzcano, Jessica Nadia","phone":"956249085","relation":"Apoderado"}'::jsonb, 'Blog Beneficios', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #13: Sofía Valentina Conde
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000000d', 'Familia Valentina Conde', 'Aniceto Conde Galindo', '996087235', 'alumno_13@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000000d', '00000000-0000-0000-0001-00000000000d', 'Sofía Valentina Conde', 'Canto', 'Nivel 1', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Aniceto Conde Galindo","phone":"996087235","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #14: Ethan Paolo Jara Saldarriaga
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000000e', 'Familia Jara Saldarriaga', 'Cristian Paolo Jara Perea', '984309257', 'alumno_14@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000000e', '00000000-0000-0000-0001-00000000000e', 'Ethan Paolo Jara Saldarriaga', 'Piano Infantil', 'Iniciación Musical', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Cristian Paolo Jara Perea","phone":"984309257","relation":"Apoderado"}'::jsonb, 'Valor con Video', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #15: Joshua Leon Gonzales
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000000f', 'Familia Leon Gonzales', 'Soledad Gonzales Castro', '918148199', 'alumno_15@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000000f', '00000000-0000-0000-0001-00000000000f', 'Joshua Leon Gonzales', 'Guitarra clásica', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Soledad Gonzales Castro","phone":"918148199","relation":"Titular Directo"}'::jsonb, 'Blog Beneficios', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #16: Jhosua Ruben Meza Salome
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000010', 'Familia Meza Salome', 'Alida Salomé Huali', '934715287', 'alumno_16@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0001-000000000010', 'Jhosua Ruben Meza Salome', 'Guitarra clásica', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'baja'::student_status_enum, 0, 75, '{"name":"Alida Salomé Huali","phone":"934715287","relation":"Apoderado"}'::jsonb, 'Blog Beneficios', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #17: Miguel Angel Miranda Aquino
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000011', 'Familia Miranda Aquino', 'Adela Aquino Suarez', '962039082', 'alumno_17@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000011', '00000000-0000-0000-0001-000000000011', 'Miguel Angel Miranda Aquino', 'Piano', 'Nivel 2', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Adela Aquino Suarez","phone":"962039082","relation":"Titular Directo"}'::jsonb, 'Blog Beneficios', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #18: Juan Mateo Azael Pariona Pumahuillca
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000012', 'Familia Pariona Pumahuillca', 'Erika Pumahuillca Ppacco', '989726595', 'alumno_18@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000012', '00000000-0000-0000-0001-000000000012', 'Juan Mateo Azael Pariona Pumahuillca', 'Canto', 'Nivel 2', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Erika Pumahuillca Ppacco","phone":"989726595","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #19: Liam Jesús Sanches Sanchez
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000013', 'Familia Sanches Sanchez', 'Paola Karina Sanchez Arata', '924265315', 'alumno_19@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0001-000000000013', 'Liam Jesús Sanches Sanchez', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Paola Karina Sanchez Arata","phone":"924265315","relation":"Apoderado"}'::jsonb, 'Blog Beneficios', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #20: Yamir Suarez Salazar
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000014', 'Familia Suarez Salazar', 'Gustavo Salazar Paucar', '985501740', 'alumno_20@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000014', '00000000-0000-0000-0001-000000000014', 'Yamir Suarez Salazar', 'Guitarra clásica', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Gustavo Salazar Paucar","phone":"985501740","relation":"Apoderado"}'::jsonb, 'Blog Beneficios', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #21: Stefano Yrco Samaniego
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000015', 'Familia Yrco Samaniego', 'Milagros Samaniego Castro', '902211277', 'alumno_21@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000015', '00000000-0000-0000-0001-000000000015', 'Stefano Yrco Samaniego', 'Batería', 'Nivel 1', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Milagros Samaniego Castro","phone":"902211277","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #22: Irribarren Paz, Francesco
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000016', 'Familia Irribarren Paz', 'Paz Bazan, Francesca', '916704270', 'alumno_22@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000016', '00000000-0000-0000-0001-000000000016', 'Irribarren Paz, Francesco', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Paz Bazan, Francesca","phone":"916704270","relation":"Apoderado"}'::jsonb, 'Blog Beneficios', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #23: Castillo Bueno, Mathew
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000017', 'Familia Castillo Bueno', 'Bueno, Leyla', '932133618', 'alumno_23@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000017', '00000000-0000-0000-0001-000000000017', 'Castillo Bueno, Mathew', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Bueno, Leyla","phone":"932133618","relation":"Apoderado"}'::jsonb, 'Blog Beneficios', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #24: Pineda Espinoza, Alonso
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000018', 'Familia Pineda Espinoza', 'Espinoza Merma, Nelida', '984384180', 'alumno_24@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000018', '00000000-0000-0000-0001-000000000018', 'Pineda Espinoza, Alonso', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'baja'::student_status_enum, 0, 75, '{"name":"Espinoza Merma, Nelida","phone":"984384180","relation":"Apoderado"}'::jsonb, 'Blog Beneficios', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #25: Moscoso Valentin, Yuriana
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000019', 'Familia Moscoso Valentin', 'Valentin Ricaldi, Pierina', '904781203', 'alumno_25@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000019', '00000000-0000-0000-0001-000000000019', 'Moscoso Valentin, Yuriana', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'baja'::student_status_enum, 0, 75, '{"name":"Valentin Ricaldi, Pierina","phone":"904781203","relation":"Apoderado"}'::jsonb, 'Blog Beneficios', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #26: Valladolid Sanchez, Santiago Mathias
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000001a', 'Familia Valladolid Sanchez', 'Valladolid Ayala, Santiago Joel', '987921575', 'alumno_26@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000001a', '00000000-0000-0000-0001-00000000001a', 'Valladolid Sanchez, Santiago Mathias', 'Batería', 'Nivel 1', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Valladolid Ayala, Santiago Joel","phone":"987921575","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #27: Verástegui Picón, Krizia Verónica
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000001b', 'Familia Verástegui Picón', 'Picón de Verástegui, Laura Verónica', '941482574', 'alumno_27@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000001b', '00000000-0000-0000-0001-00000000001b', 'Verástegui Picón, Krizia Verónica', 'Guitarra clásica', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Picón de Verástegui, Laura Verónica","phone":"941482574","relation":"Apoderado"}'::jsonb, 'Blog Beneficios', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #28: Verástegui Picón, Thiago Manuel
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000001c', 'Familia Verástegui Picón', 'Picón de Verástegui, Laura Verónica', '941482574', 'alumno_28@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000001c', '00000000-0000-0000-0001-00000000001c', 'Verástegui Picón, Thiago Manuel', 'Piano', 'Nivel 2', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Picón de Verástegui, Laura Verónica","phone":"941482574","relation":"Apoderado"}'::jsonb, 'Blog Beneficios', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #29: Gonzales Cuba, Jose Angel
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000001d', 'Familia Gonzales Cuba', 'Gonzales Cuba, Jose Angel', '992872645', 'alumno_29@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000001d', '00000000-0000-0000-0001-00000000001d', 'Gonzales Cuba, Jose Angel', 'Guitarra clásica', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'baja'::student_status_enum, 0, 75, '{"name":"Gonzales Cuba, Jose Angel","phone":"992872645","relation":"Titular Directo"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #30: Pérez Huamancha, Dylan
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000001e', 'Familia Pérez Huamancha', 'Pérez Zamora, Joel', '982119525', 'alumno_30@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000001e', '00000000-0000-0000-0001-00000000001e', 'Pérez Huamancha, Dylan', 'Canto', 'Nivel 2', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'baja'::student_status_enum, 0, 75, '{"name":"Pérez Zamora, Joel","phone":"982119525","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #31: Joan Paolo Rodriguez
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000001f', 'Familia Paolo Rodriguez', 'Joan Paolo Rodriguez', '920085424', 'alumno_31@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000001f', '00000000-0000-0000-0001-00000000001f', 'Joan Paolo Rodriguez', 'Canto', 'Nivel 2', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Joan Paolo Rodriguez","phone":"920085424","relation":"Titular Directo"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #32: Adonis Yeret,Tocas Vasquez
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000020', 'Familia Adonis Yeret', 'Rafael Tocas', '994010377', 'alumno_32@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000020', '00000000-0000-0000-0001-000000000020', 'Adonis Yeret,Tocas Vasquez', 'Piano', 'Nivel 2', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Rafael Tocas","phone":"994010377","relation":"Titular Directo"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #33: Edward Rios de la Cruz
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000021', 'Familia la Cruz', 'Familia la Cruz', '987654321', 'alumno_33@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000021', '00000000-0000-0000-0001-000000000021', 'Edward Rios de la Cruz', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'baja'::student_status_enum, 0, 75, '{"name":"Familia la Cruz","phone":"987654321","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #34: García Zuñiga, Celeste Elizabeth
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000022', 'Familia García Zuñiga', 'Zuñiga Fernandez Elizabeth', '968657514', 'alumno_34@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000022', '00000000-0000-0000-0001-000000000022', 'García Zuñiga, Celeste Elizabeth', 'Canto', 'Nivel 2', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Zuñiga Fernandez Elizabeth","phone":"968657514","relation":"Apoderado"}'::jsonb, 'Valor con Video', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #35: Matias Gabriel Quispe Vilcapoma
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000023', 'Familia Quispe Vilcapoma', 'Enma Vilcapoma Coaguila', '989625788', 'alumno_35@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000023', '00000000-0000-0000-0001-000000000023', 'Matias Gabriel Quispe Vilcapoma', 'Canto', 'Nivel 1', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Enma Vilcapoma Coaguila","phone":"989625788","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #36: Luis Soto Soto
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000024', 'Familia Soto Soto', 'Diana Soto Serrano', '918148199', 'alumno_36@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000024', '00000000-0000-0000-0001-000000000024', 'Luis Soto Soto', 'Guitarra clásica', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Diana Soto Serrano","phone":"918148199","relation":"Titular Directo"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #37: Ivana Soto Soto
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000025', 'Familia Soto Soto', 'Diana Soto Serrano', '946528367', 'alumno_37@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000025', '00000000-0000-0000-0001-000000000025', 'Ivana Soto Soto', 'Piano Infantil', 'Nivel 1', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Diana Soto Serrano","phone":"946528367","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #38: Llallahui Alvarado, Kenny Armando
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000026', 'Familia Llallahui Alvarado', 'Andrea Alvarado Quintana', '977931974', 'alumno_38@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000026', '00000000-0000-0000-0001-000000000026', 'Llallahui Alvarado, Kenny Armando', 'Guitarra clásica', 'Nivel 1', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Andrea Alvarado Quintana","phone":"977931974","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #39: Luciano Leonardo Franco Cabrera
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000027', 'Familia Franco Cabrera', 'Nahomi Cabrera Gutierrez', '987427289', 'alumno_39@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000027', '00000000-0000-0000-0001-000000000027', 'Luciano Leonardo Franco Cabrera', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Nahomi Cabrera Gutierrez","phone":"987427289","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #40: Emmanuel Rospigliosi Gonzales
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000028', 'Familia Rospigliosi Gonzales', 'Lorena Gonzales Teves', '940705701', 'alumno_40@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000028', '00000000-0000-0000-0001-000000000028', 'Emmanuel Rospigliosi Gonzales', 'Guitarra clásica', 'Nivel 1', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Lorena Gonzales Teves","phone":"940705701","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #41: Alexandra Maritza Rodríguez Guzmán
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000029', 'Familia Rodríguez Guzmán', 'Maritza Guzman Ayvar', '941305165', 'alumno_41@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000029', '00000000-0000-0000-0001-000000000029', 'Alexandra Maritza Rodríguez Guzmán', 'Canto', 'Nivel 1', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'baja'::student_status_enum, 0, 75, '{"name":"Maritza Guzman Ayvar","phone":"941305165","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #42: Sara Torres Leon
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000002a', 'Familia Torres Leon', 'No aplica', '912834887', 'alumno_42@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000002a', '00000000-0000-0000-0001-00000000002a', 'Sara Torres Leon', 'Canto', 'Nivel 2', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"No aplica","phone":"912834887","relation":"Titular Directo"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #43: Ethan Romero Manrique
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000002b', 'Familia Romero Manrique', 'Olga Manrique Medrano', '923786068', 'alumno_43@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000002b', '00000000-0000-0000-0001-00000000002b', 'Ethan Romero Manrique', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Olga Manrique Medrano","phone":"923786068","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #44: Aithana Rivas Badajoz
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000002c', 'Familia Rivas Badajoz', 'Jose Rivas', '977528878', 'alumno_44@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000002c', '00000000-0000-0000-0001-00000000002c', 'Aithana Rivas Badajoz', 'Piano Infantil', 'Nivel 1', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Jose Rivas","phone":"977528878","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #45: Yajaira Ayquipa
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000002d', 'Familia Yajaira Ayquipa', 'Patricia Zae', '924868844', 'alumno_45@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000002d', '00000000-0000-0000-0001-00000000002d', 'Yajaira Ayquipa', 'Guitarra clásica', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'baja'::student_status_enum, 0, 75, '{"name":"Patricia Zae","phone":"924868844","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #46: Kiara Mariños Huachahuilca
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000002e', 'Familia Mariños Huachahuilca', 'Huachuilca Flores, Olga Sandra', '951058318', 'alumno_46@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000002e', '00000000-0000-0000-0001-00000000002e', 'Kiara Mariños Huachahuilca', 'Canto', 'Nivel 2', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Huachuilca Flores, Olga Sandra","phone":"951058318","relation":"Titular Directo"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #47: Zarate Alcarraz, Stephanie Abigail
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000002f', 'Familia Zarate Alcarraz', 'No Aplica', '970090351', 'alumno_47@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000002f', '00000000-0000-0000-0001-00000000002f', 'Zarate Alcarraz, Stephanie Abigail', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"No Aplica","phone":"970090351","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #48: Layla Mariapaula Florindez Alguilar
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000030', 'Familia Florindez Alguilar', 'Aide Teresa Aguilar', '934563643', 'alumno_48@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000030', '00000000-0000-0000-0001-000000000030', 'Layla Mariapaula Florindez Alguilar', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Aide Teresa Aguilar","phone":"934563643","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #49: Eithan David Florindez Alguilar
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000031', 'Familia Florindez Alguilar', 'Aide Teresa Aguilar', '934563643', 'alumno_49@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000031', '00000000-0000-0000-0001-000000000031', 'Eithan David Florindez Alguilar', 'Violín', 'Iniciación Musical', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Aide Teresa Aguilar","phone":"934563643","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #50: Juan Diego Flores
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000032', 'Familia Diego Flores', 'Juan Flores', '996288151', 'alumno_50@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000032', '00000000-0000-0000-0001-000000000032', 'Juan Diego Flores', 'Guitarra clásica', 'Nivel 1', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'baja'::student_status_enum, 0, 75, '{"name":"Juan Flores","phone":"996288151","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #51: Ethan Romero Manrique
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000033', 'Familia Romero Manrique', 'Olga Manrique Medrano', '923786068', 'alumno_51@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000033', '00000000-0000-0000-0001-000000000033', 'Ethan Romero Manrique', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Olga Manrique Medrano","phone":"923786068","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #52: Francezca Esther
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000034', 'Familia Francezca Esther', 'Juan Aylas', '987654321', 'alumno_52@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000034', '00000000-0000-0000-0001-000000000034', 'Francezca Esther', 'Piano Infantil', 'Iniciación Musical', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Juan Aylas","phone":"987654321","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #53: Bruno Marcelo Juan de Dios
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000035', 'Familia de Dios', 'Peter Marcelo Romero', '995954060', 'alumno_53@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000035', '00000000-0000-0000-0001-000000000035', 'Bruno Marcelo Juan de Dios', 'Guitarra clásica', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Peter Marcelo Romero","phone":"995954060","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #54: Boris Axel Marcelo Juan de Dios
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000036', 'Familia de Dios', 'Peter Marcelo Romero', '995954060', 'alumno_54@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000036', '00000000-0000-0000-0001-000000000036', 'Boris Axel Marcelo Juan de Dios', 'Piano', 'Nivel 2', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Peter Marcelo Romero","phone":"995954060","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #55: Antonella Osorio Huaman
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000037', 'Familia Osorio Huaman', 'Milagros Huaman', '969065775', 'alumno_55@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000037', '00000000-0000-0000-0001-000000000037', 'Antonella Osorio Huaman', 'Piano', 'Nivel 2', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Milagros Huaman","phone":"969065775","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #56: Liliana Mandujano
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000038', 'Familia Liliana Mandujano', 'No aplica', '928570603', 'alumno_56@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000038', '00000000-0000-0000-0001-000000000038', 'Liliana Mandujano', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"No aplica","phone":"928570603","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #57: Micaela Sofia Vilchez
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000039', 'Familia Sofia Vilchez', 'Jessica Oroncoy', '952324832', 'alumno_57@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000039', '00000000-0000-0000-0001-000000000039', 'Micaela Sofia Vilchez', 'Guitarra clásica', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Jessica Oroncoy","phone":"952324832","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #58: Carlos Carhuachin
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000003a', 'Familia Carlos Carhuachin', 'Karin Sahuarcura', '991279213', 'alumno_58@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000003a', '00000000-0000-0000-0001-00000000003a', 'Carlos Carhuachin', 'Violín', 'Nivel 2', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'baja'::student_status_enum, 0, 75, '{"name":"Karin Sahuarcura","phone":"991279213","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #59: Samantha Castillo
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000003b', 'Familia Samantha Castillo', 'Lucy Verónica', '960580399', 'alumno_59@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000003b', '00000000-0000-0000-0001-00000000003b', 'Samantha Castillo', 'Violín', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Lucy Verónica","phone":"960580399","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #60: Niah Jimena Montalvo Huerta
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000003c', 'Familia Montalvo Huerta', 'Elizabeth Huerta', '935993601', 'alumno_60@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000003c', '00000000-0000-0000-0001-00000000003c', 'Niah Jimena Montalvo Huerta', 'Piano Infantil', 'Iniciación Musical', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Elizabeth Huerta","phone":"935993601","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #61: Carolina Luna Tito
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000003d', 'Familia Luna Tito', 'No aplica', '936370723', 'alumno_61@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000003d', '00000000-0000-0000-0001-00000000003d', 'Carolina Luna Tito', 'Guitarra clásica', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"No aplica","phone":"936370723","relation":"Titular Directo"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #62: Flavia Nicole Concepcion
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000003e', 'Familia Nicole Concepcion', 'Felipe Concepción', '933125352', 'alumno_62@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000003e', '00000000-0000-0000-0001-00000000003e', 'Flavia Nicole Concepcion', 'Piano', 'Nivel 2', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Felipe Concepción","phone":"933125352","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #63: Fabiana Arroyo Tineo
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000003f', 'Familia Arroyo Tineo', 'Juana Tineo', '966716051', 'alumno_63@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000003f', '00000000-0000-0000-0001-00000000003f', 'Fabiana Arroyo Tineo', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Juana Tineo","phone":"966716051","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #64: Thaisa Lucero Dyarce Cruz
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000040', 'Familia Dyarce Cruz', 'Magaly Cruz', '989708032', 'alumno_64@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000040', '00000000-0000-0000-0001-000000000040', 'Thaisa Lucero Dyarce Cruz', 'Batería', 'Nivel 1', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Magaly Cruz","phone":"989708032","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #65: Valerie Yidda Angulo
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000041', 'Familia Yidda Angulo', 'Joselyn Chipana Regalado', '934164251', 'alumno_65@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000041', '00000000-0000-0000-0001-000000000041', 'Valerie Yidda Angulo', 'Violín', 'Nivel 2', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Joselyn Chipana Regalado","phone":"934164251","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #66: Sofía De la Cruz Vellaneda
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000042', 'Familia Cruz Vellaneda', 'No aplica', '987584730', 'alumno_66@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000042', '00000000-0000-0000-0001-000000000042', 'Sofía De la Cruz Vellaneda', 'Violín', 'Nivel 2', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"No aplica","phone":"987584730","relation":"Titular Directo"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #67: Antonela Diaz Sanchez
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000043', 'Familia Diaz Sanchez', 'No aplica', '923080434', 'alumno_67@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000043', '00000000-0000-0000-0001-000000000043', 'Antonela Diaz Sanchez', 'Canto', 'Nivel 2', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"No aplica","phone":"923080434","relation":"Titular Directo"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #68: Sara Xiamena Ortiz Vivas
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000044', 'Familia Ortiz Vivas', 'Rosio del Pilar Vivas', '923785176', 'alumno_68@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000044', '00000000-0000-0000-0001-000000000044', 'Sara Xiamena Ortiz Vivas', 'Guitarra clásica', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Rosio del Pilar Vivas","phone":"923785176","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #69: Camila Valentina Pastor Conco
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000045', 'Familia Pastor Conco', 'Olivia Norma Conco', '910875526', 'alumno_69@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000045', '00000000-0000-0000-0001-000000000045', 'Camila Valentina Pastor Conco', 'Violín', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Olivia Norma Conco","phone":"910875526","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #70: Asaf Chipana Urribarri
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000046', 'Familia Chipana Urribarri', 'Ruth Urribarri', '987404984', 'alumno_70@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000046', '00000000-0000-0000-0001-000000000046', 'Asaf Chipana Urribarri', 'Batería', 'Nivel 1', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Ruth Urribarri","phone":"987404984","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #71: Liam Huanca Huamantupa
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000047', 'Familia Huanca Huamantupa', 'Margot Huamantupa', '969085167', 'alumno_71@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000047', '00000000-0000-0000-0001-000000000047', 'Liam Huanca Huamantupa', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'baja'::student_status_enum, 0, 75, '{"name":"Margot Huamantupa","phone":"969085167","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #72: Emma Sevilla Perez
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000048', 'Familia Sevilla Perez', 'Sara Perez Mancilla', '986740292', 'alumno_72@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000048', '00000000-0000-0000-0001-000000000048', 'Emma Sevilla Perez', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Sara Perez Mancilla","phone":"986740292","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #73: Aarón Balarezo Sosa
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000049', 'Familia Balarezo Sosa', 'Kely Sosa Torres', '920493604', 'alumno_73@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000049', '00000000-0000-0000-0001-000000000049', 'Aarón Balarezo Sosa', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Kely Sosa Torres","phone":"920493604","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #74: Giusseppe Granda Suarez
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000004a', 'Familia Granda Suarez', 'Celeste Suarez', '940776497', 'alumno_74@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000004a', '00000000-0000-0000-0001-00000000004a', 'Giusseppe Granda Suarez', 'Batería', 'Nivel 1', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Celeste Suarez","phone":"940776497","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #75: Mirko Malpartida
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000004b', 'Familia Mirko Malpartida', 'no aplica', '935188205', 'alumno_75@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000004b', '00000000-0000-0000-0001-00000000004b', 'Mirko Malpartida', 'Piano', 'Nivel 1', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"no aplica","phone":"935188205","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #76: Gael Mathias Lopez
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000004c', 'Familia Mathias Lopez', 'no aplica', '925994271', 'alumno_76@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000004c', '00000000-0000-0000-0001-00000000004c', 'Gael Mathias Lopez', 'Canto', 'Nivel 2', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"no aplica","phone":"925994271","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #77: Karen Gutierrez
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000004d', 'Familia Karen Gutierrez', 'No aplica', '923277024', 'alumno_77@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000004d', '00000000-0000-0000-0001-00000000004d', 'Karen Gutierrez', 'Canto', 'Nivel 2', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"No aplica","phone":"923277024","relation":"Titular Directo"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #78: Raphaela Yangali Polloac
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000004e', 'Familia Yangali Polloac', 'Maricruz Yangali', '962395849', 'alumno_78@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000004e', '00000000-0000-0000-0001-00000000004e', 'Raphaela Yangali Polloac', 'Piano Infantil', 'Iniciación Musical', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Maricruz Yangali","phone":"962395849","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #79: Isabelle Yangali Polloac
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-00000000004f', 'Familia Yangali Polloac', 'Maricruz Yangali', '962395850', 'alumno_79@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-00000000004f', '00000000-0000-0000-0001-00000000004f', 'Isabelle Yangali Polloac', 'Piano Infantil', 'Iniciación Musical', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Maricruz Yangali","phone":"962395850","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #80: Mishel Suarez Cardenas
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000050', 'Familia Suarez Cardenas', 'Arnold  Suarez', '970855468', 'alumno_80@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000050', '00000000-0000-0000-0001-000000000050', 'Mishel Suarez Cardenas', 'Guitarra clásica', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'baja'::student_status_enum, 0, 75, '{"name":"Arnold  Suarez","phone":"970855468","relation":"Titular Directo"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #81: Lireth Aguilar Alberca
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000051', 'Familia Aguilar Alberca', 'Mercedes Alberca', '907479667', 'alumno_81@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000051', '00000000-0000-0000-0001-000000000051', 'Lireth Aguilar Alberca', 'Canto', 'Nivel 2', '00000000-0000-0000-0000-000000000005', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'baja'::student_status_enum, 0, 75, '{"name":"Mercedes Alberca","phone":"907479667","relation":"Titular Directo"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #82: Yasumi Cielo Chamorro Amasifuen
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000052', 'Familia Chamorro Amasifuen', 'Jenny Amasifuen', '922781091', 'alumno_82@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000052', '00000000-0000-0000-0001-000000000052', 'Yasumi Cielo Chamorro Amasifuen', 'Piano', 'Nivel 2', '00000000-0000-0000-0000-000000000004', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"Jenny Amasifuen","phone":"922781091","relation":"Apoderado"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- Alumno #83: Gustavo Tenorio
INSERT INTO families (id, family_name, primary_guardian_name, primary_guardian_phone, email, payment_day, created_at, updated_at)
VALUES ('00000000-0000-0000-0001-000000000053', 'Familia Gustavo Tenorio', 'No aplica', '986933521', 'alumno_83@vibramusic.pe', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET family_name = EXCLUDED.family_name, primary_guardian_phone = EXCLUDED.primary_guardian_phone;

INSERT INTO students (id, family_id, full_name, instrument, level, assigned_teacher_id, modality, status, makeup_credits, attendance_rate, emergency_contact, notes, created_at, updated_at)
VALUES ('00000000-0000-0000-0002-000000000053', '00000000-0000-0000-0001-000000000053', 'Gustavo Tenorio', 'Guitarra clásica', 'Nivel 2', '00000000-0000-0000-0000-000000000003', 'Regular (8 clases / 45 min)'::lesson_modality_enum, 'activo'::student_status_enum, 0, 100, '{"name":"No aplica","phone":"986933521","relation":"Titular Directo"}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, instrument = EXCLUDED.instrument, level = EXCLUDED.level, assigned_teacher_id = EXCLUDED.assigned_teacher_id, notes = EXCLUDED.notes;

-- 3. Insertar Facturas Oficiales de Agosto 2026

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0001-000000000001', 'Mensualidad Agosto 2026 (Canto)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0001-000000000002', 'Mensualidad Agosto 2026 (Piano Infantil)', 261.4, 261.4, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0001-000000000003', 'Mensualidad Agosto 2026 (Piano)', 297, 0, 297, '2026-08-31', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0001-000000000004', 'Mensualidad Agosto 2026 (Batería)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0001-000000000005', 'Mensualidad Agosto 2026 (Batería)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0001-000000000006', 'Mensualidad Agosto 2026 (Guitarra clásica)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0001-000000000007', 'Mensualidad Agosto 2026 (Batería)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0001-000000000008', 'Mensualidad Agosto 2026 (Batería)', 261.4, 261.4, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0001-000000000009', 'Mensualidad Agosto 2026 (Batería)', 261.4, 261.4, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000000a', '00000000-0000-0000-0001-00000000000a', 'Mensualidad Agosto 2026 (Canto)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000000b', '00000000-0000-0000-0001-00000000000b', 'Mensualidad Agosto 2026 (Piano)', 261.4, 261.4, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000000c', '00000000-0000-0000-0001-00000000000c', 'Mensualidad Agosto 2026 (Guitarra clásica)', 297, 0, 297, '2026-08-31', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000000d', '00000000-0000-0000-0001-00000000000d', 'Mensualidad Agosto 2026 (Canto)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000000e', '00000000-0000-0000-0001-00000000000e', 'Mensualidad Agosto 2026 (Piano Infantil)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000000f', '00000000-0000-0000-0001-00000000000f', 'Mensualidad Agosto 2026 (Guitarra clásica)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0001-000000000010', 'Mensualidad Agosto 2026 (Guitarra clásica)', 297, 0, 297, '2026-08-31', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000011', '00000000-0000-0000-0001-000000000011', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0001-000000000012', 'Mensualidad Agosto 2026 (Canto)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000013', '00000000-0000-0000-0001-000000000013', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000014', '00000000-0000-0000-0001-000000000014', 'Mensualidad Agosto 2026 (Guitarra clásica)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000015', '00000000-0000-0000-0001-000000000015', 'Mensualidad Agosto 2026 (Batería)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000016', '00000000-0000-0000-0001-000000000016', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000017', '00000000-0000-0000-0001-000000000017', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000018', '00000000-0000-0000-0001-000000000018', 'Mensualidad Agosto 2026 (Piano)', 297, 0, 297, '2026-08-31', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000019', '00000000-0000-0000-0001-000000000019', 'Mensualidad Agosto 2026 (Piano)', 261.4, 0, 261.4, '2026-08-31', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000001a', '00000000-0000-0000-0001-00000000001a', 'Mensualidad Agosto 2026 (Batería)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000001b', '00000000-0000-0000-0001-00000000001b', 'Mensualidad Agosto 2026 (Guitarra clásica)', 261.4, 261.4, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000001c', '00000000-0000-0000-0001-00000000001c', 'Mensualidad Agosto 2026 (Piano)', 261.4, 261.4, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000001d', '00000000-0000-0000-0001-00000000001d', 'Mensualidad Agosto 2026 (Guitarra clásica)', 297, 0, 297, '2026-08-31', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000001e', '00000000-0000-0000-0001-00000000001e', 'Mensualidad Agosto 2026 (Canto)', 297, 0, 297, '2026-08-31', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000001f', '00000000-0000-0000-0001-00000000001f', 'Mensualidad Agosto 2026 (Canto)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000020', '00000000-0000-0000-0001-000000000020', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000021', '00000000-0000-0000-0001-000000000021', 'Mensualidad Agosto 2026 (Piano)', 297, 0, 297, '2026-08-31', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000022', '00000000-0000-0000-0001-000000000022', 'Mensualidad Agosto 2026 (Canto)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000023', '00000000-0000-0000-0001-000000000023', 'Mensualidad Agosto 2026 (Canto)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000024', '00000000-0000-0000-0001-000000000024', 'Mensualidad Agosto 2026 (Guitarra clásica)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000025', '00000000-0000-0000-0001-000000000025', 'Mensualidad Agosto 2026 (Piano Infantil)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000026', '00000000-0000-0000-0001-000000000026', 'Mensualidad Agosto 2026 (Guitarra clásica)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000027', '00000000-0000-0000-0001-000000000027', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000028', '00000000-0000-0000-0001-000000000028', 'Mensualidad Agosto 2026 (Guitarra clásica)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000029', '00000000-0000-0000-0001-000000000029', 'Mensualidad Agosto 2026 (Canto)', 297, 0, 297, '2026-08-31', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000002a', '00000000-0000-0000-0001-00000000002a', 'Mensualidad Agosto 2026 (Canto)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000002b', '00000000-0000-0000-0001-00000000002b', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000002c', '00000000-0000-0000-0001-00000000002c', 'Mensualidad Agosto 2026 (Piano Infantil)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000002d', '00000000-0000-0000-0001-00000000002d', 'Mensualidad Agosto 2026 (Guitarra clásica)', 297, 0, 297, '2026-08-31', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000002e', '00000000-0000-0000-0001-00000000002e', 'Mensualidad Agosto 2026 (Canto)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000002f', '00000000-0000-0000-0001-00000000002f', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000030', '00000000-0000-0000-0001-000000000030', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000031', '00000000-0000-0000-0001-000000000031', 'Mensualidad Agosto 2026 (Violín)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000032', '00000000-0000-0000-0001-000000000032', 'Mensualidad Agosto 2026 (Guitarra clásica)', 297, 0, 297, '2026-08-31', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000033', '00000000-0000-0000-0001-000000000033', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000034', '00000000-0000-0000-0001-000000000034', 'Mensualidad Agosto 2026 (Piano Infantil)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000035', '00000000-0000-0000-0001-000000000035', 'Mensualidad Agosto 2026 (Guitarra clásica)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000036', '00000000-0000-0000-0001-000000000036', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000037', '00000000-0000-0000-0001-000000000037', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000038', '00000000-0000-0000-0001-000000000038', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000039', '00000000-0000-0000-0001-000000000039', 'Mensualidad Agosto 2026 (Guitarra clásica)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000003a', '00000000-0000-0000-0001-00000000003a', 'Mensualidad Agosto 2026 (Violín)', 297, 0, 297, '2026-08-31', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000003b', '00000000-0000-0000-0001-00000000003b', 'Mensualidad Agosto 2026 (Violín)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000003c', '00000000-0000-0000-0001-00000000003c', 'Mensualidad Agosto 2026 (Piano Infantil)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000003d', '00000000-0000-0000-0001-00000000003d', 'Mensualidad Agosto 2026 (Guitarra clásica)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000003e', '00000000-0000-0000-0001-00000000003e', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000003f', '00000000-0000-0000-0001-00000000003f', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000040', '00000000-0000-0000-0001-000000000040', 'Mensualidad Agosto 2026 (Batería)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000041', '00000000-0000-0000-0001-000000000041', 'Mensualidad Agosto 2026 (Violín)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000042', '00000000-0000-0000-0001-000000000042', 'Mensualidad Agosto 2026 (Violín)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000043', '00000000-0000-0000-0001-000000000043', 'Mensualidad Agosto 2026 (Canto)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000044', '00000000-0000-0000-0001-000000000044', 'Mensualidad Agosto 2026 (Guitarra clásica)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000045', '00000000-0000-0000-0001-000000000045', 'Mensualidad Agosto 2026 (Violín)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000046', '00000000-0000-0000-0001-000000000046', 'Mensualidad Agosto 2026 (Batería)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000047', '00000000-0000-0000-0001-000000000047', 'Mensualidad Agosto 2026 (Piano)', 297, 0, 297, '2026-08-31', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000048', '00000000-0000-0000-0001-000000000048', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000049', '00000000-0000-0000-0001-000000000049', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000004a', '00000000-0000-0000-0001-00000000004a', 'Mensualidad Agosto 2026 (Batería)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000004b', '00000000-0000-0000-0001-00000000004b', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000004c', '00000000-0000-0000-0001-00000000004c', 'Mensualidad Agosto 2026 (Canto)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000004d', '00000000-0000-0000-0001-00000000004d', 'Mensualidad Agosto 2026 (Canto)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000004e', '00000000-0000-0000-0001-00000000004e', 'Mensualidad Agosto 2026 (Piano Infantil)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-00000000004f', '00000000-0000-0000-0001-00000000004f', 'Mensualidad Agosto 2026 (Piano Infantil)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000050', '00000000-0000-0000-0001-000000000050', 'Mensualidad Agosto 2026 (Guitarra clásica)', 297, 0, 297, '2026-08-31', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000051', '00000000-0000-0000-0001-000000000051', 'Mensualidad Agosto 2026 (Canto)', 297, 0, 297, '2026-08-31', 'pendiente'::invoice_status_enum, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000052', '00000000-0000-0000-0001-000000000052', 'Mensualidad Agosto 2026 (Piano)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;

INSERT INTO invoices (id, family_id, concept, amount, amount_paid, remaining_balance, due_date, status, payment_method, created_at, updated_at)
VALUES ('00000000-0000-0000-0003-000000000053', '00000000-0000-0000-0001-000000000053', 'Mensualidad Agosto 2026 (Guitarra clásica)', 297, 297, 0, '2026-08-31', 'pagado'::invoice_status_enum, 'Yape'::payment_method_enum, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, amount_paid = EXCLUDED.amount_paid, remaining_balance = EXCLUDED.remaining_balance, status = EXCLUDED.status;
