# Manual de Procedimiento Operativo: Carga de CSV y Escalabilidad Semanal

Este manual describe el flujo estándar y continuo para que la administración (Dueña o Nayeli) mantenga actualizada la base de datos de alumnos y la malla horaria semanal en **Vibra Music (Cadencia)**.

---

## 1. Estructura Oficial de los Archivos CSV

### 📁 Archivo A: Directorio de Alumnos (`alumnos_final.csv`)
* **Ubicación de Plantilla / Muestra**: `public/alumnos_final.csv`
* **Columnas obligatorias**:
```csv
Nombre,Familia,Instrumento,Profesor,Modalidad,Email,Telefono,ContactoEmergencia,TelefonoEmergencia
```
* **Catálogo de Instrumentos Válidos**: `Piano`, `Canto`, `Guitarra`, `Batería`, `Violín`, `Piano Infantil`.
* **Catálogo de Profesores Actuales**: `Jeremy`, `Fernando`, `Nathaly`.
* **Modalidades Soportadas**:
  - `Regular (8 clases / 45 min)`
  - `Intensivo (4 clases / 90 min)`

### 📁 Archivo B: Horarios y Clases Semanales (`horarios_final.csv`)
* **Ubicación de Plantilla / Muestra**: `public/horarios_final.csv`
* **Columnas obligatorias**:
```csv
Alumno,Dia,Hora,Sala,Profesor,Instrumento,Categoria
```
* **Días Válidos**: `Lun`, `Mar`, `Mié`, `Jue`, `Vie`, `Sáb`.
* **Bloques Horarios Oficiales**:
  - **Lunes a Viernes**: `16:00`, `16:45`, `17:30`, `18:15`, `19:00`, `19:45`.
  - **Sábados**: `09:00`, `09:45`, `10:30`, `11:15`, `12:00`, `12:45`, `13:30`.
* **Salas Oficiales**: `Sala 1`, `Sala 2`, `Sala 3`, `Sala 4`, `Sala 5`.
* **Categorías de Edad**: `INFANTIL` (5-6 años), `JUNIOR` (7-12 años), `JUVENIL` (13-17 años), `ADULTO` (18+ años).

---

## 2. Procedimiento de Carga en la Plataforma

### Paso 1: Carga o Actualización del Directorio de Alumnos
1. Ingresar como Dueña o Secretaría (Nayeli) a [`http://localhost:5173/admin/alumnos`](http://localhost:5173/admin/alumnos).
2. Hacer clic en **"Importar Alumnos CSV"**.
3. Pegar el texto o subir el archivo CSV.
4. Seleccionar:
   - **"Reemplazar Directorio"**: Si es el inicio de un nuevo periodo o reestructuración completa.
   - **"Añadir Alumnos"**: Si se incorporan nuevos matriculados durante la semana.

### Paso 2: Carga o Actualización de la Agenda Semanal
1. Ingresar a [`http://localhost:5173/admin/agenda`](http://localhost:5173/admin/agenda).
2. Hacer clic en **"Importar Horario CSV"**.
3. Pegar el texto o subir el archivo CSV.
4. Seleccionar **"Reemplazar Horario Completo"** o **"Sumar al Horario Existente"**.

### Paso 3: Gestión y Envío de Credenciales a Docentes
1. Ingresar a [`http://localhost:5173/admin/invitaciones`](http://localhost:5173/admin/invitaciones).
2. Verificar las invitaciones de:
   - **Jeremy** (Guitarra y Batería) ➔ Clave Maestra: `Vibra-JEREMY-2026`
   - **Fernando** (Violín y Piano) ➔ Clave Maestra: `Vibra-FERNAN-2026`
   - **Nathaly** (Canto y Piano Infantil) ➔ Clave Maestra: `Vibra-NATHAL-2026`
3. Hacer clic en **"Ver Acceso"** para copiar el enlace directo o el mensaje de WhatsApp.

---

## 3. Matriz de Roles y Habilidades Multi-Materia

| Docente | Instrumentos Asignados | Acceso Kiosco |
| :--- | :--- | :--- |
| **Jeremy** | Guitarra & Batería | `/teacher` |
| **Fernando** | Violín & Piano | `/teacher` |
| **Nathaly** | Canto & Piano Infantil | `/teacher` |
| **Nayeli** | Staff (Secretaría) | `/admin` |
| **Dueña** | Dirección General (Super Admin) | `/admin` |
