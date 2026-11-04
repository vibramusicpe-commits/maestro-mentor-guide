# PLAN MAESTRO QUIRÚRGICO: CLARIFICACIÓN DE VISTAS (AUDITORÍA VS INFORMES) Y ACTIVACIÓN DE BITÁCORA DOCENTE

**Fecha de emisión:** 2026-11-03  
**Versión Base del Sistema:** 2.0.53 (Commit `dadc698`)  
**Autor del Plan:** Antigravity Architect  
**Destinatario:** Open Code (Agente Ejecutor)  
**Entorno:** Producción en Vivo (TanStack Start + Nitro + PostgreSQL Insforge)  

---

## 1. CONTEXTO HISTÓRICO Y DIAGNÓSTICO DE PRODUCCIÓN

### 1.1. Estado Real de la Base de Datos (Comprobado vía MCP PostgreSQL)
1. **`lesson_evaluations` (Bitácora de clase):**
   - Actualmente **solo existen 3 registros reales** en toda la historia de producción (Hans con Fernando en Piano, Alexis con Jeremy en Guitarra y Fernanda Sofía con Nathaly en Canto — todos de octubre 2026).
   - Los docentes **no están registrando las clases diarias**.
2. **`progress_reports` (Informes consolidados de progreso):**
   - Existen **0 registros en producción**. Ningún informe se ha podido emitir aún porque los informes requieren como mínimo 2 bitácoras de clase para desbloquearse (`report-readiness.ts`).
3. **`org_settings` (Feature Flags y Piloto):**
   - `feature_flags`: `evaluationsV2: false`, `progressReportsV2: false`.
   - `pilot_teacher_ids`: Contiene explícitamente a Jeremy (`...003`), Fernando (`...004`) y Nathaly (`...005`). **Por tanto, los 3 profesores oficiales SÍ tienen acceso al módulo ClassLog en su Kiosco móvil.**
4. **Criterios de Evaluación:**
   - Jeremy ya validó sus 17 criterios de Guitarra y Batería (`ui_config.draft = false`, `visible_in_report = true`). Ya no hay criterios bloqueantes.

---

## 2. LA GRAN CONFUSIÓN: EL MAPA DE LAS 3 ENTIDADES

En Vibra Music Staff se ha generado un solapamiento terminológico entre tres conceptos totalmente distintos:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. BITÁCORA DE CLASE (Evaluación diaria clase a clase)                                 │
│    • Dónde vive: Tabla "lesson_evaluations" en PostgreSQL.                             │
│    • Dónde se llena: En el Kiosco móvil del profesor (/teacher) al marcar la clase.   │
│    • Duración: 2 a 3 minutos. Marca criterios (1-10 o logrado), tema y repertorio.     │
│    • Quién lo hace: El docente en el aula.                                             │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │  (Se acumulan ≥ 2 bitácoras)
                                         ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. INFORME PEDAGÓGICO DE PROGRESO (Consolidado del ciclo lectivo)                      │
│    • Dónde vive: Tabla "progress_reports" (Rutas /admin/informes y /teacher/informes). │
│    • Qué es: Documento formal A4 / PDF / WhatsApp para entregar al apoderado.         │
│      Consolida las bitácoras acumuladas + asistencia del alumno.                       │
│    • Quién lo hace: Docente redacta borrador, Dirección aprueba y publica.             │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. AUDITORÍA DE ALUMNOS / CONTROL MAESTRO (Control Institucional y Financiero)         │
│    • Dónde vive: Ruta /admin/reportes (Consume students, invoices, payment_audit_logs).│
│    • Qué es: Reporte de los 57 alumnos activos, saldos deudores en Soles (PEN),       │
│      cuotas pendientes, teléfonos de apoderados y exportación a Excel CSV.             │
│    • Quién lo hace: Dirección y Secretaría Nayeli para cobranzas y administración.    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Problemas Actuales Detectados:
1. **En Dirección (`/admin`):** En el menú lateral conviven dos botones con nombres casi idénticos: `"Informes"` y `"Reportes"`. Dirección no sabe a cuál entrar para auditar deudas vs ver avances pedagógicos.
2. **En el Portal Docente (`/teacher`):** 
   - El botón `"Registrar clase"` es un botón secundario gris pálido al final de la celda, debajo de los 4 botones de asistencia. Pasa totalmente desapercibido.
   - El componente `<ClassLog>` se invoca en un Sheet inferior, pero **no se le pasa la prop `onSaved`**. Cuando el profesor guarda, la hoja no se cierra ni da feedback claro de éxito.
   - El profesor cree que "Registrar clase" significa redactar un informe largo de 20 minutos, cuando en realidad es un checklist de 2 minutos.
   - El botón no indica si esa sesión ya fue registrada previamente o si está pendiente.

---

## 3. REGLAS ARQUITECTÓNICAS ESTRICTAS (STOP & VERIFY)

Cualquier cambio debe apegarse rigurosamente a las reglas del repositorio:
1. **Intocables Absolutos:** PROHIBIDO modificar `src/store/app-store.ts`, `src/lib/kardex-calculator.ts`, `src/lib/student-cycle.ts` o los motores de cálculo de asistencia.
2. **Cero Datos Financieros en Vistas Pedagógicas:** En `/admin/informes` y `/teacher` está terminantemente prohibido renderizar montos en Soles (`S/`), saldos pendientes o deudas.
3. **Filtro de Seguridad en BD:** Cualquier consulta a `lesson_evaluations` o `progress_reports` debe incluir `is_test = false`.
4. **Identidad por UUID:** Usar siempre `student.id` (UUID), nunca el nombre como llave primaria para operaciones.
5. **No Breaking Changes:** La app está en producción en vivo. `npm run build` debe compilar limpio sin errores de TypeScript.
6. **Git Remotes:** Los cambios deben pushearse a `origin main` Y a `core main`.

---

## 4. ESPECIFICACIÓN DETALLADA DE CAMBIOS POR ARCHIVO

### FASE 1: Renombrar y Distinguir Vistas en Sidebar Administrativo

**Archivo:** `src/routes/admin.tsx`  
**Objetivo:** Eliminar la ambigüedad en el menú lateral de Dirección.

1. **Importar iconos de `lucide-react`:**
   Asegurar que estén disponibles:
   - `FileBarChart2` (para Informes Pedagógicos)
   - `ShieldCheck` (para Auditoría de Alumnos)
2. **Modificar el array `navItems`:**
   ```tsx
   // ANTES:
   { label: "Dashboard", to: "/admin" as const, icon: BarChart3, exact: true },
   { label: "Alumnos", to: "/admin/alumnos" as const, icon: GraduationCap },
   { label: "Informes", to: "/admin/informes" as const, icon: FileBarChart2 },
   { label: "Reportes", to: "/admin/reportes" as const, icon: FileSpreadsheet },
   { label: "Clases Demo", to: "/admin/demos" as const, icon: Sparkles },

   // DESPUÉS:
   { label: "Dashboard", to: "/admin" as const, icon: BarChart3, exact: true },
   { label: "Alumnos", to: "/admin/alumnos" as const, icon: GraduationCap },
   { label: "Informes Pedagógicos", to: "/admin/informes" as const, icon: FileBarChart2 },
   { label: "Auditoría de Alumnos", to: "/admin/reportes" as const, icon: ShieldCheck },
   { label: "Clases Demo", to: "/admin/demos" as const, icon: Sparkles },
   ```

---

### FASE 2: Vincular Auditoría de Alumnos (`/admin/reportes`) con Informes Pedagógicos

**Archivo:** `src/routes/admin.reportes.tsx`  
**Objetivo:** Permitir que Dirección, al revisar la nómina oficial de alumnos y saldos, pueda hacer clic en el estado del informe para abrir su seguimiento pedagógico.

1. **Ubicación en el código:** Líneas ~707-730, en la celda de la columna `Último informe`:
   ```tsx
   {/* ANTES: */}
   <td className="py-3 px-3 text-center">
     {latestReport ? (
       <div className="flex flex-col items-center gap-0.5">
         <Badge
           variant="outline"
           className={`text-[10px] font-black ${
             REPORT_STATUS_CLASS[latestReport.status] ||
             REPORT_STATUS_CLASS.draft
           }`}
         >
           {REPORT_STATUS_LABEL[latestReport.status] ||
             latestReport.status}
         </Badge>
         <span className="font-mono text-[10px] text-muted-foreground">
           {formatIsoDateShort(latestReport.period_end)}
         </span>
       </div>
     ) : (
       <span className="text-[10px] font-bold text-muted-foreground">
         Sin informe
       </span>
     )}
   </td>
   ```

2. **Modificación:** Envolver el badge / estado en un `<Link>` que navegue hacia `/admin/informes` pasando el nombre o filtro del alumno:
   ```tsx
   {/* DESPUÉS: */}
   <td className="py-3 px-3 text-center">
     <Link
       to="/admin/informes"
       className="inline-flex flex-col items-center gap-0.5 group/report hover:opacity-85 transition-opacity"
       title={`Ver seguimiento pedagógico de ${st.name}`}
     >
       {latestReport ? (
         <>
           <Badge
             variant="outline"
             className={`text-[10px] font-black group-hover/report:border-primary transition-colors cursor-pointer ${
               REPORT_STATUS_CLASS[latestReport.status] ||
               REPORT_STATUS_CLASS.draft
             }`}
           >
             {REPORT_STATUS_LABEL[latestReport.status] || latestReport.status} ↗
           </Badge>
           <span className="font-mono text-[10px] text-muted-foreground">
             {formatIsoDateShort(latestReport.period_end)}
           </span>
         </>
       ) : (
         <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground group-hover/report:text-primary transition-colors cursor-pointer">
           Sin informe ↗
         </span>
       )}
     </Link>
   </td>
   ```

---

### FASE 3: Eliminar Fricción en el Kiosco Móvil del Docente (`/teacher`)

**Archivo:** `src/routes/teacher.index.tsx`  
**Objetivo:** Guiar a Jeremy, Fernando y Nathaly para que completen la bitácora de 2 minutos inmediatamente después de marcar asistencia.

1. **Paso 3.1: Conectar el callback `onSaved` en `<ClassLog>`:**
   En las líneas ~658-668 de `src/routes/teacher.index.tsx`:
   ```tsx
   {/* ANTES: */}
   {classLogSeed && classLogAccess && (
     <ClassLog
       key={classLogSeed.nonce}
       teacherName={teacherDisplayName}
       teacherClean={teacherClean}
       students={teacherStudentList}
       schedule={teacherScheduleLessons}
       initialSeed={classLogSeed}
     />
   )}

   {/* DESPUÉS: */}
   {classLogSeed && classLogAccess && (
     <ClassLog
       key={classLogSeed.nonce}
       teacherName={teacherDisplayName}
       teacherClean={teacherClean}
       students={teacherStudentList}
       schedule={teacherScheduleLessons}
       initialSeed={classLogSeed}
       onSaved={() => {
         setClassLogSeed(null);
         toast.success("✓ Bitácora de clase guardada correctamente", {
           description: `Se registró la evaluación de ${classLogSeed.studentName || "la sesión"}.`,
         });
       }}
     />
   )}
   ```

2. **Paso 3.2: Destacar el botón de acción según asistencia en la tarjeta de clase:**
   En las líneas ~605-614 de `src/routes/teacher.index.tsx`:
   ```tsx
   {/* ANTES: */}
   {classLogAccess && studentProfile?.id && (
     <button
       type="button"
       onClick={() => openClassLog(studentProfile, lesson, targetDateStr)}
       className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 text-xs font-bold text-primary transition-colors hover:bg-primary/10"
     >
       <ClipboardList className="h-4 w-4" />
       Registrar clase
     </button>
   )}

   {/* DESPUÉS: */}
   {classLogAccess && studentProfile?.id && (
     <button
       type="button"
       onClick={() => openClassLog(studentProfile, lesson, targetDateStr)}
       className={`flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
         status === "presente"
           ? "border-2 border-primary bg-primary/15 text-primary hover:bg-primary/25 animate-pulse"
           : "border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
       }`}
     >
       <ClipboardList className="h-4 w-4" />
       {status === "presente" ? "📝 Llenar bitácora de hoy (2 min)" : "📝 Bitácora de clase"}
     </button>
   )}
   ```
   *(Nota: Si `status === "presente"`, el botón se resalta visualmente indicando claramente que solo tomará 2 minutos).*

3. **Paso 3.3: Mensaje pedagógico en el encabezado del Sheet inferior:**
   En las líneas ~649-656 de `src/routes/teacher.index.tsx`:
   ```tsx
   <SheetHeader className="mb-3 text-left">
     <div className="flex items-center justify-between">
       <SheetTitle className="text-base font-black">Bitácora de Clase</SheetTitle>
       <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
         ⏱ 2 minutos
       </span>
     </div>
     <SheetDescription className="text-xs">
       {classLogSeed?.studentName || "Alumno"}
       {classLogSeed?.sessionDate ? ` · ${classLogSeed.sessionDate}` : ""}
       {classLogSeed?.startTime ? ` · ${classLogSeed.startTime}` : ""}
     </SheetDescription>
     <p className="text-[11px] text-muted-foreground mt-1">
       Selecciona el tema visto, marca 1-2 criterios y añade el repertorio trabajado. No es un informe formal para apoderados.
     </p>
   </SheetHeader>
   ```

---

## 5. DOCUMENTACIÓN Y REGISTRO EN EL SISTEMA

Open Code debe generar los siguientes registros documentales:

1. **Crear archivo ADR:**
   `docs/adr/0183-clarificacion-vistas-auditoria-e-informes-kiosco-docente.md`
   - Documentar la separación conceptual entre Bitácora diaria (`lesson_evaluations`), Informe Pedagógico (`progress_reports`) y Auditoría de Alumnos (`admin.reportes`).
   - Documentar las mejoras de UX en `/teacher` y el enlace cruzado entre vistas.
2. **Actualizar `docs/CHANGELOG.md`:**
   Añadir la entrada bajo la versión `[2.0.54] - 2026-11-03`:
   - Clarificación de nomenclatura en navegación administrativa: "Informes Pedagógicos" y "Auditoría de Alumnos".
   - Conexión de `onSaved` en el modal `<ClassLog>` del Kiosco docente con cierre automático y feedback visual.
   - Enlace bidireccional desde la tabla de Auditoría hacia el seguimiento pedagógico de informes.
3. **Actualizar `AGENTS.md`:**
   Añadir la sección **§86** al final del archivo:
   - Resumen de la regla de oro: Bitácora de Clase (2-3 min, docente) $\neq$ Informe Pedagógico (formal A4, ciclo) $\neq$ Auditoría de Alumnos (control financiero institucional).

---

## 6. PROTOCOLO DE COMPILACIÓN Y DESPLIEGUE

Ejecutar en la terminal de PowerShell:

```powershell
# 1. Compilación estricta
npm run build

# 2. Si el build termina con exit code 0:
git status
git add src/routes/admin.tsx src/routes/admin.reportes.tsx src/routes/teacher.index.tsx docs/adr/0183-clarificacion-vistas-auditoria-e-informes-kiosco-docente.md docs/CHANGELOG.md AGENTS.md

git commit -m "feat: clarificación de vistas auditoría vs informes y optimización de bitácora docente (ADR-0183)"

# 3. Push a ambos remotos
git push origin main
git push core main
```

---
*Fin del plan maestro para Open Code.*
