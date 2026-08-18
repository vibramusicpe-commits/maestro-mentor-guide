-- ================================================================
-- Vibra Music / Insforge — Migración Oficial 006: 99 Alumnos y Control de Pagos
-- Ingesta de Alumnos, Familias con CELULARES REALES y Facturación Histórica
-- ================================================================

DO $$
DECLARE
  v_admin_user_id UUID;
  v_staff_user_id UUID;
  v_family_id UUID;
  v_student_id UUID;
  v_inv_id UUID;
BEGIN
  -- Obtener o crear usuarios base si no existen
  SELECT id INTO v_admin_user_id FROM users WHERE role = 'super_admin' LIMIT 1;
  IF v_admin_user_id IS NULL THEN
    INSERT INTO users (email, full_name, role)
    VALUES ('direccion@vibramusic.pe', 'Claudia Villalobos (Dirección)', 'super_admin')
    RETURNING id INTO v_admin_user_id;
  END IF;

  SELECT id INTO v_staff_user_id FROM users WHERE role = 'staff' LIMIT 1;
  IF v_staff_user_id IS NULL THEN
    INSERT INTO users (email, full_name, role)
    VALUES ('nayeli@vibramusic.pe', 'Nayeli (Secretaría)', 'staff')
    RETURNING id INTO v_staff_user_id;
  END IF;

  -- [1/99] Alumno: Sanchez Justa, Johandry Henry
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Sanchez Justa', 'Sanchez Justa, Johandry Henry', '984100000', 'familia_1@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Sanchez Justa, Johandry Henry', 'Piano', 'Nivel 1', 'activo', 'pagó 200 falta 97 mas la mensualidad de agosto')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Sanchez Justa, Johandry Henry', 297, 0, 297, '2026-08-01', 'vencido')
  RETURNING id INTO v_inv_id;

  -- [2/99] Alumno: Gonzales Cuba, Jose Angel
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Gonzales Cuba', 'Gonzales Cuba, Jose Angel', '992872645', 'familia_2@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Gonzales Cuba, Jose Angel', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Gonzales Cuba, Jose Angel', 197, 0, 197, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [3/99] Alumno: Rodríguez Guzmán, Alexandra Maritza
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Rodríguez Guzmán', 'Maritza Guzman Ayvar', '941305165', 'familia_3@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Rodríguez Guzmán, Alexandra Maritza', 'Piano', 'Nivel 1', 'activo', 'Recien en julio en adelante pagara (nueva)')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Rodríguez Guzmán, Alexandra Maritza', 297, 0, 297, '2026-08-01', 'vencido')
  RETURNING id INTO v_inv_id;

  -- [4/99] Alumno: Franco Cabrera, Luciano Leonardo
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Franco Cabrera', 'Nahomi Cabrera Gutierrez', '987427289', 'familia_4@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Franco Cabrera, Luciano Leonardo', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Franco Cabrera, Luciano Leonardo', 297, 297, 0, '2026-08-01', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [5/99] Alumno: Conislla Huerta, Iker Samín
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Conislla Huerta', 'Julio Cesar Conislla Hinostroza', '994827408', 'familia_5@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Conislla Huerta, Iker Samín', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Conislla Huerta, Iker Samín', 252, 252, 0, '2026-08-01', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 252, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [6/99] Alumno: Malpartina Ramos, Mateo Salvador
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Malpartina Ramos', 'Liz Joseline Ramos Torrez', '910180362', 'familia_6@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Malpartina Ramos, Mateo Salvador', 'Piano', 'Nivel 1', 'activo', 'viene sábado 15/08')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Malpartina Ramos, Mateo Salvador', 297, 0, 297, '2026-08-01', 'vencido')
  RETURNING id INTO v_inv_id;

  -- [7/99] Alumno: Yajaira Ayquipa
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Yajaira Ayquipa', 'Patricia Zae', '924868844', 'familia_7@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Yajaira Ayquipa', 'Piano', 'Nivel 1', 'activo', 'no contesta')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Yajaira Ayquipa', 297, 0, 297, '2026-08-01', 'vencido')
  RETURNING id INTO v_inv_id;

  -- [8/99] Alumno: Guastavo Zuñiga Quispe
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Guastavo Zuñiga Quispe', 'Guastavo Zuñiga Quispe', '984100049', 'familia_8@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Guastavo Zuñiga Quispe', 'Piano', 'Nivel 1', 'activo', 'Nuevo - Pendiente pago del mes junio. Se cobra automático')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Guastavo Zuñiga Quispe', 297, 0, 297, '2026-08-01', 'vencido')
  RETURNING id INTO v_inv_id;

  -- [9/99] Alumno: Francezca Esther Aylas Naupari
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Francezca Esther Aylas Naupari', 'Francezca Esther Aylas Naupari', '984100056', 'familia_9@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Francezca Esther Aylas Naupari', 'Piano', 'Nivel 1', 'activo', 'Se cobra automático (revisar ingresos)')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Francezca Esther Aylas Naupari', 297, 297, 0, '2026-08-01', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [10/99] Alumno: Bruno Marcelo Juan de Dios y Boris Marcelo Juan de Dios
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Bruno Marcelo Juan de Dios y Boris Marcelo Juan de Dios', 'Juan Carlos Huerta Concepción', '997549474', 'familia_10@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Bruno Marcelo Juan de Dios y Boris Marcelo Juan de Dios', 'Piano', 'Nivel 1', 'activo', 'Nuevo se le cobra 1 de agosto')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Bruno Marcelo Juan de Dios y Boris Marcelo Juan de Dios', 522, 522, 0, '2026-08-01', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 522, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [11/99] Alumno: Leonardo Villacorta
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Leonardo Villacorta', 'Yenny Ramires', '933520330', 'familia_11@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Leonardo Villacorta', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Leonardo Villacorta', 297, 0, 297, '2026-08-01', 'vencido')
  RETURNING id INTO v_inv_id;

  -- [12/99] Alumno: Antonella Osorio Huaman
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Antonella Osorio Huaman', 'Milagros Huaman', '969065775', 'familia_12@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Antonella Osorio Huaman', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Antonella Osorio Huaman', 297, 297, 0, '2026-08-01', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [13/99] Alumno: Carlos Isaac Carhuachin
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Carlos Isaac Carhuachin', 'Karin Sahuarcura', '991279213', 'familia_13@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Carlos Isaac Carhuachin', 'Piano', 'Nivel 1', 'activo', 'nuevo')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Carlos Isaac Carhuachin', 297, 0, 297, '2026-08-01', 'vencido')
  RETURNING id INTO v_inv_id;

  -- [14/99] Alumno: Yrco Samaniego, Stefano
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Yrco Samaniego', 'Milagros Samaniego Castro', '902211277', 'familia_14@vibramusic.pe', 8)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Yrco Samaniego, Stefano', 'Piano', 'Nivel 1', 'activo', 'Pago el 5 de junio')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Yrco Samaniego, Stefano', 297, 297, 0, '2026-08-08', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [15/99] Alumno: Soto Soto, Ivanna
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Soto Soto', 'Soto Susy', '953686972', 'familia_15@vibramusic.pe', 8)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Soto Soto, Ivanna', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Soto Soto, Ivanna', 522, 522, 0, '2026-08-08', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 522, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [16/99] Alumno: Soto Soto, Ivanna + Luis Soto soto
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Soto Soto', 'Soto Susy', '953686972', 'familia_16@vibramusic.pe', 3)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Soto Soto, Ivanna + Luis Soto soto', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Soto Soto, Ivanna + Luis Soto soto', 522, 522, 0, '2026-08-03', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 522, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [17/99] Alumno: Ethan Romero Manrique
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Ethan Romero Manrique', 'Olga Manrique Medrano', '923786068', 'familia_17@vibramusic.pe', 3)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Ethan Romero Manrique', 'Piano', 'Nivel 1', 'activo', 'CANCELÓ POR 3 MESES')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Ethan Romero Manrique', 297, 297, 0, '2026-08-03', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [18/99] Alumno: Liliana Mandujano
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Liliana Mandujano', 'No aplica', '928570603', 'familia_18@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Liliana Mandujano', 'Piano', 'Nivel 1', 'activo', 'Clase personalizada - se le cobra por clase')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Liliana Mandujano', 50, 0, 50, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [19/99] Alumno: Meza Salome, Jhosua Ruben
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Meza Salome', 'Alida Salomé Huali', '934715287', 'familia_19@vibramusic.pe', 4)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Meza Salome, Jhosua Ruben', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Meza Salome, Jhosua Ruben', 397, 0, 397, '2026-08-04', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [20/99] Alumno: Sanches Sanchez, Liam Jesús
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Sanches Sanchez', 'Paola Karina Sanchez Arata', '924265315', 'familia_20@vibramusic.pe', 4)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Sanches Sanchez, Liam Jesús', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Sanches Sanchez, Liam Jesús', 297, 297, 0, '2026-08-04', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [21/99] Alumno: Marco Antonio
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Marco Antonio', 'No aplica', '994774940', 'familia_21@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Marco Antonio', 'Piano', 'Nivel 1', 'activo', 'Nuevo - revisar . pága en dos partes')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Marco Antonio', 297, 0, 297, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [22/99] Alumno: Miranda Aquino, Miguel Angel
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Miranda Aquino', 'Adela Aquino Suarez', '962039082', 'familia_22@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Miranda Aquino, Miguel Angel', 'Piano', 'Nivel 1', 'activo', 'se le debe 6 clases')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Miranda Aquino, Miguel Angel', 297, 0, 297, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [23/99] Alumno: Tocas Vasquez, Adonis Yeret
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Tocas Vasquez', 'Tocas Vasquez, Adonis Yeret', '984100154', 'familia_23@vibramusic.pe', 5)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Tocas Vasquez, Adonis Yeret', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Tocas Vasquez, Adonis Yeret', 297, 297, 0, '2026-08-05', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [24/99] Alumno: Torres Leon, Sara
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Torres Leon', 'No aplica', '912834887', 'familia_24@vibramusic.pe', 5)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Torres Leon, Sara', 'Piano', 'Nivel 1', 'activo', 'desde agosto')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Torres Leon, Sara', 522, 0, 522, '2026-08-05', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [25/99] Alumno: Farfan Mendoza, Marycielo Nicole
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Farfan Mendoza', 'Farfan Mendoza, Marycielo Nicole', '984100168', 'familia_25@vibramusic.pe', 6)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Farfan Mendoza, Marycielo Nicole', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Farfan Mendoza, Marycielo Nicole', 290, 290, 0, '2026-08-06', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 290, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [26/99] Alumno: Farfan Mendoza, Maryfer
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Farfan Mendoza', 'Farfan Mendoza, Maryfer', '984100175', 'familia_26@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Farfan Mendoza, Maryfer', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Farfan Mendoza, Maryfer', 290, 290, 0, '2026-08-01', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 290, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [27/99] Alumno: Micaela Vilchez
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Micaela Vilchez', 'Jessica Oroncoy', '952324832', 'familia_27@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Micaela Vilchez', 'Piano', 'Nivel 1', 'activo', 'se le debe 5 clases')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Micaela Vilchez', 297, 0, 297, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [28/99] Alumno: Anton, Uriel, Gabriel y Eitan
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Anton', 'Anton Rodriguez, Anthony', '977783340', 'familia_28@vibramusic.pe', 7)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Anton, Uriel, Gabriel y Eitan', 'Piano', 'Nivel 1', 'activo', 'pagará el sábado')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Anton, Uriel, Gabriel y Eitan', 783, 783, 0, '2026-08-07', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 783, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [29/99] Alumno: Samantha Castillo
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Samantha Castillo', 'Lucy Verónica', '960580399', 'familia_29@vibramusic.pe', 7)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Samantha Castillo', 'Piano', 'Nivel 1', 'activo', 'ingreso 7 de julio - no contesta')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Samantha Castillo', 297, 0, 297, '2026-08-07', 'vencido')
  RETURNING id INTO v_inv_id;

  -- [30/99] Alumno: Carolina Luna Tito
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Carolina Luna Tito', 'No aplica', '936370723', 'familia_30@vibramusic.pe', 7)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Carolina Luna Tito', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Carolina Luna Tito', 297, 297, 0, '2026-08-07', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [31/99] Alumno: De La Cruz Huapaya, Romina Nathaly
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia De La Cruz Huapaya', 'Huapaya Cuzcano, Jessica Nadia', '956249085', 'familia_31@vibramusic.pe', 8)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'De La Cruz Huapaya, Romina Nathaly', 'Piano', 'Nivel 1', 'activo', 'Pago el 8 de junio')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — De La Cruz Huapaya, Romina Nathaly', 297, 0, 297, '2026-08-08', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [32/99] Alumno: Jara Saldarriaga, Ethan Paolo
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Jara Saldarriaga', 'Cristian Paolo Jara Perea', '984309257', 'familia_32@vibramusic.pe', 18)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Jara Saldarriaga, Ethan Paolo', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Jara Saldarriaga, Ethan Paolo', 329, 0, 329, '2026-08-18', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [33/99] Alumno: Mesa Llallahui, Andrea Fernanda
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Mesa Llallahui', 'Luggi Boore', '930182010', 'familia_33@vibramusic.pe', 10)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Mesa Llallahui, Andrea Fernanda', 'Piano', 'Nivel 1', 'activo', 'SE LE COBRA EL 10 DE OCTUBRE???')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Mesa Llallahui, Andrea Fernanda', 783, 783, 0, '2026-08-10', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 783, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [34/99] Alumno: Huamali Cortez, Carlos (BATERIA)
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Huamali Cortez', 'Cortez Basteres, Maria Isabel', '947215751', 'familia_34@vibramusic.pe', 11)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Huamali Cortez, Carlos (BATERIA)', 'Batería', 'Nivel 1', 'activo', 'NO CONTESTA')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Huamali Cortez, Carlos (BATERIA)', 261, 0, 261, '2026-08-11', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [35/99] Alumno: Conde, Sofía Valentina
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Conde', 'Aniceto Conde Galindo', '996087235', 'familia_35@vibramusic.pe', 11)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Conde, Sofía Valentina', 'Piano', 'Nivel 1', 'activo', 'Proximo pago de julio se normaliza a 297 - no contesta')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Conde, Sofía Valentina', 297, 0, 297, '2026-08-11', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [36/99] Alumno: Valladolid Sanchez, Santiago Mathias
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Valladolid Sanchez', 'Valladolid Ayala, Santiago Joel', '987921575', 'familia_36@vibramusic.pe', 11)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Valladolid Sanchez, Santiago Mathias', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Valladolid Sanchez, Santiago Mathias', 297, 297, 0, '2026-08-11', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [37/99] Alumno: Curi Qquecho, Renzo y Angie
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Curi Qquecho', 'Saúl Curi', '961023495', 'familia_37@vibramusic.pe', 14)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Curi Qquecho, Renzo y Angie', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Curi Qquecho, Renzo y Angie', 522, 0, 522, '2026-08-14', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [38/99] Alumno: Alvarez Moya, Leonardo
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Alvarez Moya', 'Jeniffer Mava Vazquez', '971112371', 'familia_38@vibramusic.pe', 15)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Alvarez Moya, Leonardo', 'Piano', 'Nivel 1', 'activo', 'Proximo pago de julio se normaliza a 297')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Alvarez Moya, Leonardo', 297, 0, 297, '2026-08-15', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [39/99] Alumno: García Zuñiga, Celeste Elizabeth
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia García Zuñiga', 'Zuñiga Fernandez Elizabeth', '968657514', 'familia_39@vibramusic.pe', 30)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'García Zuñiga, Celeste Elizabeth', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — García Zuñiga, Celeste Elizabeth', 297, 0, 297, '2026-08-30', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [40/99] Alumno: Solorzano Cuya, Saúl
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Solorzano Cuya', 'Elizabeth Cuya', '961494127', 'familia_40@vibramusic.pe', 16)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Solorzano Cuya, Saúl', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Solorzano Cuya, Saúl', 297, 0, 297, '2026-08-16', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [41/99] Alumno: Zarate Alcarraz, Stephanie Abigail
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Zarate Alcarraz', 'No Aplica', '970090351', 'familia_41@vibramusic.pe', 16)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Zarate Alcarraz, Stephanie Abigail', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Zarate Alcarraz, Stephanie Abigail', 297, 0, 297, '2026-08-16', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [42/99] Alumno: Sara Ximena Ortiz Vivas
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Sara Ximena Ortiz Vivas', 'Rosio del Pilar Vivas', '923785176', 'familia_42@vibramusic.pe', 16)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Sara Ximena Ortiz Vivas', 'Piano', 'Nivel 1', 'activo', 'NUEVA EN JULIO')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Sara Ximena Ortiz Vivas', 297, 0, 297, '2026-08-16', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [43/99] Alumno: Pineda Espinoza, Alonso
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Pineda Espinoza', 'Espinoza Merma, Nelida', '984384180', 'familia_43@vibramusic.pe', 17)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Pineda Espinoza, Alonso', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Pineda Espinoza, Alonso', 297, 0, 297, '2026-08-17', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [44/99] Alumno: Verástegui Picón, Krizia Verónica
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Verástegui Picón', 'Picón de Verástegui, Laura Verónica', '941482574', 'familia_44@vibramusic.pe', 17)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Verástegui Picón, Krizia Verónica', 'Piano', 'Nivel 1', 'activo', 'FALTARA POR 3 SEMANAS')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Verástegui Picón, Krizia Verónica', 868.2, 0, 868.2, '2026-08-17', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [45/99] Alumno: Del Quiroz Sulca, Carlos Ignacio
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Del Quiroz Sulca', 'Juan Carlos Del Quiroz', '936138686', 'familia_45@vibramusic.pe', 17)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Del Quiroz Sulca, Carlos Ignacio', 'Piano', 'Nivel 1', 'activo', 'QUIERE PAGAR CUANDO RECUPERE LAS CLASES 6')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Del Quiroz Sulca, Carlos Ignacio', 297, 0, 297, '2026-08-17', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [46/99] Alumno: Flavia Nicole Concepcion
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Flavia Nicole Concepcion', 'Felipe Concepción', '933125352', 'familia_46@vibramusic.pe', 17)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Flavia Nicole Concepcion', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Flavia Nicole Concepcion', 297, 0, 297, '2026-08-17', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [47/99] Alumno: Álvarez Galarreta, Gabriel Fabiano
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Álvarez Galarreta', 'Galarreta Sanches, Janet', '975687085', 'familia_47@vibramusic.pe', 18)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Álvarez Galarreta, Gabriel Fabiano', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Álvarez Galarreta, Gabriel Fabiano', 297, 0, 297, '2026-08-18', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [48/99] Alumno: Sofía De la Cruz Vellaneda
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Sofía De la Cruz Vellaneda', 'No aplica', '987584730', 'familia_48@vibramusic.pe', 18)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Sofía De la Cruz Vellaneda', 'Piano', 'Nivel 1', 'activo', 'nueva - ingreso julio')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Sofía De la Cruz Vellaneda', 297, 0, 297, '2026-08-18', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [49/99] Alumno: Bellido Alvan, Mia Lucero
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Bellido Alvan', 'Alvan Souza, Luz Elena', '934106343', 'familia_49@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Bellido Alvan, Mia Lucero', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Bellido Alvan, Mia Lucero', 297, 297, 0, '2026-08-01', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [50/99] Alumno: Aithana Rivas Badajoz
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Aithana Rivas Badajoz', 'Jose Rivas', '977528878', 'familia_50@vibramusic.pe', 20)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Aithana Rivas Badajoz', 'Piano', 'Nivel 1', 'activo', 'Pago completo, por yape.')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Aithana Rivas Badajoz', 297, 0, 297, '2026-08-20', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [51/99] Alumno: Suarez Salazar, Yamir
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Suarez Salazar', 'Gustavo Salazar Paucar', '985501740', 'familia_51@vibramusic.pe', 21)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Suarez Salazar, Yamir', 'Piano', 'Nivel 1', 'activo', 'QUIERE RECUPERAR CLASES PRIMERO le faltan 2 clases')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Suarez Salazar, Yamir', 297, 0, 297, '2026-08-21', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [52/99] Alumno: Llallahui Alvarado, Kenny Armando
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Llallahui Alvarado', 'Andrea Alvarado Quintana', '977931974', 'familia_52@vibramusic.pe', 21)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Llallahui Alvarado, Kenny Armando', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Llallahui Alvarado, Kenny Armando', 297, 0, 297, '2026-08-21', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [53/99] Alumno: Huerta Mitma, Juan Diego
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Huerta Mitma', 'Juan Carlos Huerta Concepción', '997549474', 'familia_53@vibramusic.pe', 22)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Huerta Mitma, Juan Diego', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Huerta Mitma, Juan Diego', 297, 0, 297, '2026-08-22', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [54/99] Alumno: Florindez Aguilar, Layla Mariapaula
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Florindez Aguilar', 'Aide Teresa Aguilar', '934563643', 'familia_54@vibramusic.pe', 22)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Florindez Aguilar, Layla Mariapaula', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Florindez Aguilar, Layla Mariapaula', 261, 0, 261, '2026-08-22', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [55/99] Alumno: Florindez Aguilar, Eithan David
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Florindez Aguilar', 'Aide Teresa Aguilar', '934563643', 'familia_55@vibramusic.pe', 22)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Florindez Aguilar, Eithan David', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Florindez Aguilar, Eithan David', 261, 0, 261, '2026-08-22', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [56/99] Alumno: Rios de la Cruz, Edward
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Rios de la Cruz', 'Rios de la Cruz, Edward', '984100385', 'familia_56@vibramusic.pe', 22)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Rios de la Cruz, Edward', 'Piano', 'Nivel 1', 'activo', 'se le cobra en agosto 297')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Rios de la Cruz, Edward', 297, 0, 297, '2026-08-22', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [57/99] Alumno: Quispe Vilcapoma, Matias Gabriel
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Quispe Vilcapoma', 'Enma Vilcapoma Coaguila', '989625788', 'familia_57@vibramusic.pe', 23)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Quispe Vilcapoma, Matias Gabriel', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Quispe Vilcapoma, Matias Gabriel', 297, 0, 297, '2026-08-23', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [58/99] Alumno: Judith Chaparro Gonzales
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Judith Chaparro Gonzales', 'Judith Chaparro Gonzales', '947504097', 'familia_58@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Judith Chaparro Gonzales', 'Piano', 'Nivel 1', 'activo', 'se va por dos semanas')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Judith Chaparro Gonzales', 297, 0, 297, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [59/99] Alumno: Magallanes Frisancho, Yesenia Maria
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Magallanes Frisancho', 'Magallanes Frisancho, Yesenia Maria', '984100406', 'familia_59@vibramusic.pe', 25)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Magallanes Frisancho, Yesenia Maria', 'Piano', 'Nivel 1', 'activo', 'NO CONTINUARÁ')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Magallanes Frisancho, Yesenia Maria', 297, 0, 297, '2026-08-25', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [60/99] Alumno: Irribarren Paz, Francesco
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Irribarren Paz', 'Paz Bazan, Francesca', '916704270', 'familia_60@vibramusic.pe', 25)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Irribarren Paz, Francesco', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Irribarren Paz, Francesco', 297, 297, 0, '2026-08-25', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [61/99] Alumno: Rodriguez, Joan Paolo
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Rodriguez', 'Rodriguez, Joan Paolo', '984100420', 'familia_61@vibramusic.pe', 26)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Rodriguez, Joan Paolo', 'Piano', 'Nivel 1', 'activo', 'CLASE PERSONALIZADA LE FALTAN 3 CLASES  HASTA 22/07')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Rodriguez, Joan Paolo', 297, 0, 297, '2026-08-26', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [62/99] Alumno: Castillo Bueno, Mathew
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Castillo Bueno', 'Bueno, Leyla', '932133618', 'familia_62@vibramusic.pe', 28)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Castillo Bueno, Mathew', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Castillo Bueno, Mathew', 297, 0, 297, '2026-08-28', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [63/99] Alumno: Leon Gonzales, Joshua
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Leon Gonzales', 'Soledad Gonzales Castro', '918148199', 'familia_63@vibramusic.pe', 7)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Leon Gonzales, Joshua', 'Piano', 'Nivel 1', 'activo', 'PAGO 3 MESES (RECIEN PAGA EN AGOSTO ) pagara el sábado')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Leon Gonzales, Joshua', 297, 0, 297, '2026-08-07', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [64/99] Alumno: De La Cruz Pucyura, Carlomagno Tomas
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia De La Cruz Pucyura', 'Magno Angel De La Cruz Valencia', '990621266', 'familia_64@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'De La Cruz Pucyura, Carlomagno Tomas', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — De La Cruz Pucyura, Carlomagno Tomas', 297, 0, 297, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [65/99] Alumno: Pariona Pumahuillca, Juan Mateo Azael
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Pariona Pumahuillca', 'Erika Pumahuillca Ppacco', '989726595', 'familia_65@vibramusic.pe', 7)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Pariona Pumahuillca, Juan Mateo Azael', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Pariona Pumahuillca, Juan Mateo Azael', 297, 297, 0, '2026-08-07', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [66/99] Alumno: Loja Villajuan, Kaled Radamel
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Loja Villajuan', 'Yanette Gianina Villajuan Baltazar', '951558668', 'familia_66@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Loja Villajuan, Kaled Radamel', 'Piano', 'Nivel 1', 'activo', 'Aun no inicia clases (debe libros y mensualidad )}')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Loja Villajuan, Kaled Radamel', 197, 0, 197, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [67/99] Alumno: De la Cruz, Geraldine
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia De la Cruz', 'Dulce', '992413230', 'familia_67@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'De la Cruz, Geraldine', 'Piano', 'Nivel 1', 'activo', 'Proximo pago de julio se normaliza a 297, sin embargo 197 + 67 es primer mes')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — De la Cruz, Geraldine', 297, 0, 297, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [68/99] Alumno: Dulce, Dulce
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Dulce', 'No aplica', '992413230', 'familia_68@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Dulce, Dulce', 'Piano', 'Nivel 1', 'activo', 'Proximo pago de julio se normaliza a 297,  sin embargo 197 + 67 es primer mes')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Dulce, Dulce', 297, 0, 297, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [69/99] Alumno: Moscoso Valentin, Yuriana
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Moscoso Valentin', 'Valentin Ricaldi, Pierina', '904781203', 'familia_69@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Moscoso Valentin, Yuriana', 'Piano', 'Nivel 1', 'activo', 'Pago 3 meses le toca pagar en Julio (se reincorpora en agosto)')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Moscoso Valentin, Yuriana', 297, 0, 297, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [70/99] Alumno: Estela Nuñes, Max Benjamin
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Estela Nuñes', 'Estela Nuñes, Max Benjamin', '984100483', 'familia_70@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Estela Nuñes, Max Benjamin', 'Piano', 'Nivel 1', 'activo', 'EN PAUSA')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Estela Nuñes, Max Benjamin', 297, 0, 297, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [71/99] Alumno: Ticona Cachay, Jonathan
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Ticona Cachay', 'Ticona Cachay, Jonathan', '962386336', 'familia_71@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Ticona Cachay, Jonathan', 'Piano', 'Nivel 1', 'activo', 'pago 3 meses por 24 clases hasta el 13/04 ya no tiene clases por recuperar')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Ticona Cachay, Jonathan', 297, 0, 297, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [72/99] Alumno: Tomas (piano --particulares)
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Tomas (piano --particulares)', 'Tomas (piano --particulares)', '984100497', 'familia_72@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Tomas (piano --particulares)', 'Piano', 'Nivel 1', 'activo', '2 clases 75.00 soles / 1 clase  45 soles')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Tomas (piano --particulares)', 297, 0, 297, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [73/99] Alumno: Meza, Jamil
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Meza', 'Meza, Jamil', '984100504', 'familia_73@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Meza, Jamil', 'Piano', 'Nivel 1', 'activo', 'CLASES PARTICULARES PIANO')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Meza, Jamil', 50, 0, 50, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [74/99] Alumno: Edinson Omar Centeno Huayta
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Edinson Omar Centeno Huayta', 'No aplica', '968002242', 'familia_74@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Edinson Omar Centeno Huayta', 'Piano', 'Nivel 1', 'activo', 'PENDIENTE mensualidad primera cuota')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Edinson Omar Centeno Huayta', 261, 0, 261, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [75/99] Alumno: Luana Camila Zamora Ochoa
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Luana Camila Zamora Ochoa', 'Esperanza Ochoa', '915067137', 'familia_75@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Luana Camila Zamora Ochoa', 'Piano', 'Nivel 1', 'activo', 'Nuevo - por definir fecha de ingreso y por consiguiente  pago')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Luana Camila Zamora Ochoa', 297, 0, 297, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [76/99] Alumno: Niah Jimena Montalvo Huerta
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Niah Jimena Montalvo Huerta', 'Elizabeth Huerta', '935993601', 'familia_76@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Niah Jimena Montalvo Huerta', 'Piano', 'Nivel 1', 'activo', 'Nueva paga sábado 11 | y el resto fin de mes ingresa el 11dejuli')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Niah Jimena Montalvo Huerta', 783, 0, 783, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [77/99] Alumno: Catalina Salvador Gutierrez
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Catalina Salvador Gutierrez', 'Jazmin Gutierrez Gómez', '929913991', 'familia_77@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Catalina Salvador Gutierrez', 'Piano', 'Nivel 1', 'activo', 'nueva - aun no tiene decha de inicio, probablemente sea en agosto.')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Catalina Salvador Gutierrez', 297, 0, 297, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [78/99] Alumno: Sasha Contreras de la Cruz
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Sasha Contreras de la Cruz', 'Sasha Contreras de la Cruz', '984100539', 'familia_78@vibramusic.pe', 30)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Sasha Contreras de la Cruz', 'Piano', 'Nivel 1', 'activo', 'PENDIENTE 47 SOLES')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Sasha Contreras de la Cruz', 297, 0, 297, '2026-08-30', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [79/99] Alumno: Fabiana Arroyo Tineo
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Fabiana Arroyo Tineo', 'Juana Tineo', '966716051', 'familia_79@vibramusic.pe', 21)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Fabiana Arroyo Tineo', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Fabiana Arroyo Tineo', 297, 0, 297, '2026-08-21', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [80/99] Alumno: Thaisa Lucero Oyarce Cruz
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Thaisa Lucero Oyarce Cruz', 'Magaly Cruz', '989708032', 'familia_80@vibramusic.pe', 4)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Thaisa Lucero Oyarce Cruz', 'Piano', 'Nivel 1', 'activo', 'nueva agosto')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Thaisa Lucero Oyarce Cruz', 297, 297, 0, '2026-08-04', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [81/99] Alumno: Valerie Yidda Angulo Chipana
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Valerie Yidda Angulo Chipana', 'Joselyn Chipana Regalado', '934164251', 'familia_81@vibramusic.pe', 14)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Valerie Yidda Angulo Chipana', 'Piano', 'Nivel 1', 'activo', 'LE FALTAN 5 CLASES PARA COMPLETAR')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Valerie Yidda Angulo Chipana', 297, 0, 297, '2026-08-14', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [82/99] Alumno: Enzo Raul Ayala
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Enzo Raul Ayala', 'No aplica', '954056837', 'familia_82@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Enzo Raul Ayala', 'Piano', 'Nivel 1', 'activo', 'nuevo julio - pendiente de pago mensualidad')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Enzo Raul Ayala', 297, 0, 297, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [83/99] Alumno: Camila Valentina Pastor Conco
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Camila Valentina Pastor Conco', 'Olivia Norma Conco', '910875526', 'familia_83@vibramusic.pe', 30)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Camila Valentina Pastor Conco', 'Piano', 'Nivel 1', 'activo', '2 clases para recuperar')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Camila Valentina Pastor Conco', 297, 0, 297, '2026-08-30', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [84/99] Alumno: Asaf Chipana Urribarri
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Asaf Chipana Urribarri', 'Ruth Urribarri', '987404984', 'familia_84@vibramusic.pe', 3)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Asaf Chipana Urribarri', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Asaf Chipana Urribarri', 297, 297, 0, '2026-08-03', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [85/99] Alumno: Liam Huanca Huamantupa
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Liam Huanca Huamantupa', 'Margot Huamantupa', '969085167', 'familia_85@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Liam Huanca Huamantupa', 'Piano', 'Nivel 1', 'activo', 'nuevo julio - pendiente mensualidad y utiles')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Liam Huanca Huamantupa', 297, 0, 297, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [86/99] Alumno: Emma Micaela Sevilla
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Emma Micaela Sevilla', 'Sara Perez Mancilla', '986740292', 'familia_86@vibramusic.pe', 31)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Emma Micaela Sevilla', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Emma Micaela Sevilla', 297, 0, 297, '2026-08-31', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [87/99] Alumno: Aarón Balarezo Sosa
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Aarón Balarezo Sosa', 'Kely Sosa Torres', '920493604', 'familia_87@vibramusic.pe', 13)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Aarón Balarezo Sosa', 'Piano', 'Nivel 1', 'activo', 'nuevo agosto - pendiente pago de mensualidad y útiles')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Aarón Balarezo Sosa', 297, 0, 297, '2026-08-13', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [88/99] Alumno: Alexis Bringos Facho
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Alexis Bringos Facho', 'Alexis Bringos Facho', '984100609', 'familia_88@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Alexis Bringos Facho', 'Piano', 'Nivel 1', 'activo', 'clases personalizadas')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Alexis Bringos Facho', 50, 0, 50, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [89/99] Alumno: Emmanuel Rospligiosi
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Emmanuel Rospligiosi', 'Emmanuel Rospligiosi', '984100616', 'familia_89@vibramusic.pe', 3)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Emmanuel Rospligiosi', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Emmanuel Rospligiosi', 297, 297, 0, '2026-08-03', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [90/99] Alumno: Giussepe Granda
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Giussepe Granda', 'Giussepe Granda', '984100623', 'familia_90@vibramusic.pe', 6)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Giussepe Granda', 'Piano', 'Nivel 1', 'activo', 'ingresa el 6 de agosto')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Giussepe Granda', 297, 297, 0, '2026-08-06', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [91/99] Alumno: Mateo Quispe Trujillo
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Mateo Quispe Trujillo', 'Lizeth Trujillo', '993478448', 'familia_91@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Mateo Quispe Trujillo', 'Piano', 'Nivel 1', 'activo', 'nuevo agosto pendiente utiles y mensualidad (364)')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Mateo Quispe Trujillo', 297, 0, 297, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [92/99] Alumno: Mirko Malpartida
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Mirko Malpartida', 'no aplica', '935188205', 'familia_92@vibramusic.pe', 1)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Mirko Malpartida', 'Piano', 'Nivel 1', 'activo', 'Paga por clase personalizada')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Mirko Malpartida', 60, 0, 60, '2026-08-01', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [93/99] Alumno: Marco Antonio  Adrian
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Marco Antonio  Adrian', 'Jose Luis Mamani', '936888840', 'familia_93@vibramusic.pe', 11)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Marco Antonio  Adrian', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Marco Antonio  Adrian', 297, 297, 0, '2026-08-11', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [94/99] Alumno: Kiara Mariños
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Kiara Mariños', 'Kiara Mariños', '984100651', 'familia_94@vibramusic.pe', 13)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Kiara Mariños', 'Piano', 'Nivel 1', 'activo', '')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Kiara Mariños', 297, 297, 0, '2026-08-13', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [95/99] Alumno: Karen Gutierrez
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Karen Gutierrez', 'No aplica', '923277024', 'familia_95@vibramusic.pe', 10)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Karen Gutierrez', 'Piano', 'Nivel 1', 'activo', 'nueva agosto')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Karen Gutierrez', 297, 297, 0, '2026-08-10', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [96/99] Alumno: Raphaela Yangali -  Isabella Yangali
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Raphaela Yangali -  Isabella Yangali', 'Raphaela Yangali -  Isabella Yangali', '984100665', 'familia_96@vibramusic.pe', 11)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Raphaela Yangali -  Isabella Yangali', 'Piano', 'Nivel 1', 'activo', 'nuevas agosto')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Raphaela Yangali -  Isabella Yangali', 687, 687, 0, '2026-08-11', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 687, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

  -- [97/99] Alumno: Mishel Suarez Cardenas
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Mishel Suarez Cardenas', 'Mishel Suarez Cardenas', '984100672', 'familia_97@vibramusic.pe', 17)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Mishel Suarez Cardenas', 'Piano', 'Nivel 1', 'activo', 'nueva agosto - pendiente pago de mensualidad y libro')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Mishel Suarez Cardenas', 297, 0, 297, '2026-08-17', 'pendiente')
  RETURNING id INTO v_inv_id;

  -- [98/99] Alumno: Antonela Diaz Sanchez
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Antonela Diaz Sanchez', 'No aplica', '923080434', 'familia_98@vibramusic.pe', 15)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Antonela Diaz Sanchez', 'Piano', 'Nivel 1', 'activo', 'pagará el lunes 17')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Antonela Diaz Sanchez', 297, 0, 297, '2026-08-15', 'vencido')
  RETURNING id INTO v_inv_id;

  -- [99/99] Alumno: Gael Mathias Lopez Loayza
  INSERT INTO families (family_name, primary_guardian_name, primary_guardian_phone, email, payment_day)
  VALUES ('Familia Gael Mathias Lopez Loayza', 'Carla Quispe Ruiz', '901958954', 'familia_99@vibramusic.pe', 4)
  RETURNING id INTO v_family_id;

  INSERT INTO students (family_id, full_name, instrument, level, status, notes)
  VALUES (v_family_id, 'Gael Mathias Lopez Loayza', 'Piano', 'Nivel 1', 'activo', 'nuevo agosto')
  RETURNING id INTO v_student_id;

  INSERT INTO invoices (family_id, concept, amount, amount_paid, remaining_balance, due_date, status)
  VALUES (v_family_id, 'Mensualidad Agosto 2026 — Gael Mathias Lopez Loayza', 297, 297, 0, '2026-08-04', 'pagado')
  RETURNING id INTO v_inv_id;

  INSERT INTO payment_audit_logs (invoice_id, registered_by_user_id, registered_by_role, amount, payment_method, note)
  VALUES (v_inv_id, v_staff_user_id, 'staff', 297, 'Yape', 'Pago conciliado Agosto 2026 (Migración CSV)');

END $$;
