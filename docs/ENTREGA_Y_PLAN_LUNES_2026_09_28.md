# 📋 Documento de Entrega y Plan de Continuidad — Lunes 28 de Septiembre de 2026

**Fecha y Hora de Cierre:** Sábado 26 de Septiembre de 2026 — 13:54 (PET)  
**Proyecto:** Vibra Music Staff — Plataforma de Gestión y Asistencia  
**Objetivo Inmediato para el Lunes:** Calibrar los paneles `/admin/facturacion` y `/admin/reportes` para operar **exclusivamente con los alumnos activos oficiales (13)** en tiempo real con PostgreSQL (Insforge).

---

## 1. Resumen Ejecutivo del Estado del Sistema

1. **Compilación y Build:**
   - `npm run build` ejecutado exitosamente con **0 errores** (SSR + Nitro Cloudflare Worker compilado y empaquetado al 100%).
   - Se respetó la indicación del usuario: **sin comandos git** (no git push/pull pendientes en esta instrucción).

2. **Diagnóstico Quirúrgico de la Base de Datos PostgreSQL (Insforge):**
   - **Total de Alumnos en `students`:** 83 alumnos históricos.
     - **13 Alumnos Activos (`status = 'activo'`):** Base real y productiva.
     - **58 en Pausa (`status = 'pausa'`):** Alumnos históricos preservados para migración progresiva 1 a 1.
     - **24 en Baja (`status = 'baja'`):** Registros históricos protegidos (no eliminados).
   - **Total de Recibos en `invoices`:** 17 registros en PostgreSQL.
     - Contiene los recibos de los 13 alumnos activos.
     - Contiene registros de alumnos inactivos (ej. Emma Micaela Sevilla Perez en `baja`) y duplicados históricos que **deben ser filtrados para no contaminar la interfaz ni los totales**.

---

## 2. Los 13 Alumnos Activos Oficiales (Fuente de Verdad PostgreSQL)

| # | Alumno | Instrumento | Modalidad | Familia | Celular Apoderado | Recibo DB | Monto (S/) | Saldo (S/) | Estado Pago |
|---|--------|-------------|-----------|---------|-------------------|-----------|------------|------------|-------------|
| 1 | **Andrea Fernanda Meza Llallahui** | Piano | Regular (8 cl / 45m) | Familia Meza Llallahui | 947317903 | `513431ee...` | 781.00 | 0.00 | Pagado |
| 2 | **Camila Valentina Pastor Conco** | Violín | Regular (8 cl / 45m) | Familia Pastor Conco | 910875526 | `00000000...45` | 261.00 | 0.00 | Pagado |
| 3 | **Ethan Paolo Jara Saldarriaga** | Piano | Regular (8 cl / 45m) | Familia Jara Saldarriaga | 992534035 | `f7ab1cf4...` | 329.00 | 0.00 | Pagado |
| 4 | **Fernanda Sofía Fajardo Condo** | Canto | Regular (8 cl / 45m) | Familia Fajardo Condo | 959791002 | `d8edf4ab...` | 297.00 | 297.00 | Pendiente |
| 5 | **Flavia Nicole Concepcion** | Piano | Intensivo (4 cl / 90m) | Familia Concepcion | 933 125 352 | `4c46a27f...` | 297.00 | 0.00 | Pagado |
| 6 | **GIUSEPPE GRANDA SUAREZ** | Batería | Intensivo (4 cl / 90m) | Familia GRANDA SUAREZ | +51 940 776 497 | `87a2d6d7...` | 297.00 | 0.00 | Pagado |
| 7 | **Karlitoz Pazos Huatuco** | Canto | Regular (8 cl / 45m) | Familia Pazos Huatuco | 902026677 | `91b548d7...` | 297.00 | 277.00 | Pendiente (Abonó 20) |
| 8 | **Kenny Armando Llallahui Alvarado** | Guitarra | Regular (8 cl / 45m) | Familia Llallahui Alvarado | +51 977 931 974 | `f65807e4...` | 297.00 | 0.00 | Pagado |
| 9 | **Marco Antonio Adrian Mamani Caro** | Guitarra | Regular (8 cl / 45m) | Familia Mamani Caro | nn | `ccfa0fbf...` | 297.00 | 17.00 | Pendiente (Abonó 280) |
| 10 | **Mia Lucero Bellido Alvan** | Canto | Regular (8 cl / 45m) | Familia Bellido Alvan | 934106343 | `71a376d8...` | 297.00 | 0.00 | Pagado |
| 11 | **Sasha Dharma Contreras de la Cruz** | Guitarra | Regular (8 cl / 45m) | Familia contreras de la cruz | 903 562 953 | `a4b3fe8a...` | 297.00 | 197.00 | Pendiente (Abonó 100) |
| 12 | **Valerie Yidda Angulo Chipana** | Piano | Regular (8 cl / 45m) | Familia Angulo Chipana | 934164251 | `ce810a19...` | 261.00 | 0.00 | Pagado |
| 13 | **Yasumi Cielo Chamorro Amasifuen** | Piano | Regular (8 cl / 45m) | Familia Chamorro Amasifuen | 922 781 091 | `e449f550...` | 297.00 | 0.00 | Pagado |

### Totales Matemáticos Exactos de Alumnos Activos
- **Total Facturado Ciclo:** S/ 4,505.00
- **Total Cobrado / Abonado:** S/ 3,717.00 (82.5% cobrado)
- **Total Deuda por Cobrar:** S/ 788.00 (17.5% pendiente)
- **Alumnos al Día:** 9 alumnos
- **Alumnos con Saldo Pendiente:** 4 alumnos (Fernanda Fajardo: S/ 297, Karlitoz Pazos: S/ 277, Marco Mamani: S/ 17, Sasha Contreras: S/ 197)

---

## 3. Lo que se Avanzó y Dejó Protegido Hoy

### Modificación en `src/store/app-store.ts`:
1. **Blindaje de `hydrateFromBackend` (Líneas 920-935 y Líneas 1210-1235):**
   - Cuando llega una sincronización desde PostgreSQL (`hydrateFromBackend`), `mergedInvoices` ahora se filtra **estrictamente contra los alumnos activos (`status === "activo"`)**.
   - Los recibos pertenecientes a alumnos en `baja` (como Emma Sevilla) o semillas dummy quedan automáticamente excluidos del estado de Zustand.
   - Si `hydrateFromBackend` se invoca sin la lista de estudiantes, filtra igualmente contra los `activeStudents` en memoria para prevenir filtraciones residuales.

---

## 4. Tareas Específicas para Retomar el Lunes

### Tarea A: Calibrar `src/routes/admin.reportes.tsx` (`/admin/reportes`)
1. **Scoping Estricto de Alumnos:**
   - Definir `activeStudents = useMemo(() => students.filter(s => s.status === "activo"), [students]);`.
   - Modificar `filteredStudents` para iterar **exclusivamente sobre `activeStudents`**.
2. **Calibrar las 5 Tarjetas KPI Superiores:**
   - **Card 1:** "Alumnos Activos Oficiales" -> `stats.activos` (13 alumnos, "100% en vivo con PostgreSQL").
   - **Card 2:** "Al Día en Pagos" -> `stats.alumnosAlDia` (9 alumnos).
   - **Card 3:** "Con Deuda (Mora)" -> `stats.alumnosConDeuda` (4 familias).
   - **Card 4:** "Deuda por Cobrar" -> `S/ ${stats.deudaTotalPEN.toFixed(2)}` (S/ 788.00).
   - **Card 5:** "Asistencia Promedio" -> `stats.avgAttendance` (% calculado sobre activos).
3. **Botón de Sincronización en Vivo:**
   - Incorporar `const { syncNow, isSyncing, lastSyncTime } = useInsforgeSync();`.
   - Agregar el botón `[🔄 Sincronizar en Vivo]` en la barra superior junto al botón de descarga Excel.
4. **Exportación CSV:**
   - Garantizar que `handleExportCSV` descargue los 13 alumnos activos filtrados.

### Tarea B: Calibrar `src/routes/admin.facturacion.tsx` (`/admin/facturacion`)
1. **Scoping de `activeInvoices`:**
   - Crear `activeInvoices` filtrando y deduplicando sobre `activeStudents`:
     ```ts
     const activeInvoices = useMemo(() => {
       const matched = invoices.filter((inv) => {
         const rawStudentName = inv.student || (inv.concept?.includes("—") ? inv.concept.split("—")[1]?.trim() : "");
         return activeStudents.some((st) =>
           isMatchingStudentName(st.name, rawStudentName) ||
           st.invoices?.some((i) => i.id === inv.id) ||
           (st.family && inv.family && (
             inv.family.toLowerCase().includes(st.family.toLowerCase()) ||
             st.family.toLowerCase().includes(inv.family.toLowerCase())
           ))
         );
       });

       const uniqueMap = new Map<string, Invoice>();
       matched.forEach((inv) => {
         const rawStudentName = (inv.student || (inv.concept?.includes("—") ? inv.concept.split("—")[1]?.trim() : "")).toLowerCase();
         const studentMatch = activeStudents.find((st) => isMatchingStudentName(st.name, rawStudentName));
         const baseConcept = inv.concept?.split("—")[0]?.trim() || "Mensualidad";
         const key = studentMatch ? `${studentMatch.id}-${baseConcept}` : inv.id;
         const existing = uniqueMap.get(key);
         if (!existing) {
           uniqueMap.set(key, inv);
         } else {
           const existingDate = existing.dueDate || "";
           const curDate = inv.dueDate || "";
           if (curDate > existingDate || (inv.paymentLogs && inv.paymentLogs.length > (existing.paymentLogs?.length || 0))) {
             uniqueMap.set(key, inv);
           }
         }
       });
       return Array.from(uniqueMap.values());
     }, [invoices, activeStudents]);
     ```
2. **Sustituir `invoices` por `activeInvoices` en:**
   - `totals` (Total Facturado, Cobrado, Saldo Pendiente, Morosidad).
   - `filteredInvoices` (Pestaña "Recibos Activos").
   - `dueSoonInvoices` (Alertas de vencimiento).
   - `allVoucherLogs` (Galería y bitácora de vouchers).
3. **Limpiar Texto Heredado en la Matriz Anual:**
   - Cambiar `Matriz Anual de Control de Pagos 2026 (99 Alumnos Oficiales)` por:
     `Matriz Anual de Control de Pagos 2026 (${activeStudents.length} Alumnos Activos Oficiales)`.
4. **Botón de Sincronización en Vivo:**
   - Incorporar `useInsforgeSync()` con botón `[🔄 Sincronizar en Vivo]` en la barra superior de acciones.

### Tarea C: Persistencia en `persist.merge` (`src/store/app-store.ts`)
- Asegurar que al rehidratar desde `localStorage`, los recibos persistidos de sesiones anteriores también se filtren contra los alumnos activos (`migratedStudents.filter(st => st.status === "activo")`) para evitar que cachés locales antiguas muestren datos seed de meses anteriores.

---

## 5. Instrucciones Rápidas para el Agente que Inicie el Lunes

1. Leer este archivo: `docs/ENTREGA_Y_PLAN_LUNES_2026_09_28.md`.
2. Ejecutar `npm run build` para confirmar estado limpio inicial.
3. Aplicar las modificaciones quirúrgicas descritas en la Sección 4 sobre `src/routes/admin.reportes.tsx` y `src/routes/admin.facturacion.tsx`.
4. Probar en preview y validar que ambos paneles muestren **exactamente los 13 alumnos activos y sus recibos reales (Facturado: S/ 4,505.00, Cobrado: S/ 3,717.00, Pendiente: S/ 788.00)**.
5. Actualizar la documentación y registrar el commit con el usuario.

---
*Fin del reporte de entrega. Todo el trabajo queda debidamente respaldado y listo para ejecución inmediata el lunes.*
