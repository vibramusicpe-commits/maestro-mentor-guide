# Tarea & Incidente: Navegación Automática a Días Pareados y Cierre de Sesión en Panel Administrativo (2026-09-25)

## 1. Resumen Ejecutivo
- **Fecha**: 2026-09-25
- **Severidad**: Media-Alta (Bloqueo de salida de sesión en perfiles de administración y fricción operativa diaria en el selector de horario al iniciar jornada)
- **Estado**: Resuelto, Verificado con `npm run build` y Documentado
- **Componentes Afectados**: `src/components/admin/agenda-board.tsx`, `src/routes/admin.tsx`, `src/components/role-switcher.tsx`, `src/routes/teacher.tsx`, `src/routes/family.tsx`.

---

## 2. Síntomas Reportados por el Usuario
> *"Haber hay que arreglar esto que antes funcionaba , supongamos que empiezo un dia nuevo y abro mi sistema un dia viernes , al abrir la webapp deberia mandarme automaticamente al dia pareado viernes y sabado de la semana tal (x) , creo qeu actualmente solo me bota a la semana , si es muy complicado y vas a romper el backned mejor no lo hagas y otra cosa , no puedo cerrar las sesiones en los perfiles de administracion del panel de administracion , le doly a cerrar sesion yno cierran , parecen bloqueados porque?, acuerdate de documentar , porfavor todo /plan"*
> 
> *"okey empieza pero acuerdate que tenemos 3 tipos de vista '📊 Vista Didáctica (Horario Pareado), 📱 Vista por Día & 🗓️ Rejilla Semanal' , cada una aplica difernete , en la semanal creo qeu ya esta todo ok? porque se ajala semanal pero en losotros dos si ajustar , gracias por entenderle , e n la 'vista por dia' y la 'vista didactica' ACUERDATE QUE SE DEBEN CAMBIAR MANUALMENTE NO PUEDEN ESTAR BLOQUEADOS OBVIO SI INICIARAN EN EL DIA COMO ACORDAMOS PERO NO DEBES BLOQUEARLOS, ACUERDAT QUE ESTAMOS EN PRODUCCION , Y CAUQLUIER CAMBIO PODRIA ROMPER POR ESO TE PROPUSE HACER UN PLAN , REVISA BACKEND Y FRONTNED SI ES NECESARIO PORFAVOR"*

---

## 3. Análisis Forense y Causa Raíz

### A. Horario de Clases (`agenda-board.tsx`)
- `currentWeekIndex` usaba `getCurrentWeekIndex(now.getFullYear(), now.getMonth())` para calcular correctamente la semana que contiene a la fecha actual (ej. Semana 4 de Setiembre).
- Sin embargo, los estados de día y par estaban hardcodeados:
  ```ts
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // Fijo en Lunes
  const [selectedPairIndex, setSelectedPairIndex] = useState(0); // Fijo en Par 0 (L-M)
  const [excelSingleDayIndex, setExcelSingleDayIndex] = useState(0); // Fijo en Lunes
  ```
- Al abrir la webapp un Viernes, el usuario caía en la Semana 4 pero viendo "Lunes y Miércoles".
- En la Vista por Día, caía en "Lunes".
- En la Rejilla Semanal, ya se mostraban todos los días.
- Además, el botón "Ir al mes actual" tenía hardcodeado `new Date(2026, 8, 21)` en lugar de evaluar dinámicamente la fecha y restablecer el par y día de hoy.

### B. Cierre de Sesión en `/admin` (`admin.tsx`)
- `useAppStore.getState().logout()` solo alteraba el estado Zustand (`isAuthenticated: false, currentUser: null`).
- En TanStack Router, `beforeLoad` se evalúa únicamente al transicionar entre rutas. Al permanecer en `/admin`, la aplicación no realizaba ninguna navegación.
- `AdminLayout` no contaba con un listener reactivo de `isAuthenticated`.
- En mobile (`< 640px`), el botón tenía `hidden sm:inline-flex`, por lo que era invisible.
- En la barra lateral (`<aside>`), no existía un botón de salida.
- En `RoleSwitcher`, el botón "Salir" invocaba `logout()` sin forzar la redirección a `/`.

---

## 4. Acciones Quirúrgicas Implementadas

1. **Detección Dinámica Sin Bloqueo Manual (`agenda-board.tsx`)**:
   - Se implementó `initialScheduleDayState` con `useMemo`:
     - Viernes (5) / Sábado (6) $\rightarrow$ `pairIdx: 2` ("Viernes y Sábado"), `dayIdx: 4` ("Vie") / `5` ("Sáb").
     - Martes (2) / Jueves (4) $\rightarrow$ `pairIdx: 1` ("Martes y Jueves"), `dayIdx: 1` ("Mar") / `3` ("Jue").
     - Lunes (1) / Miércoles (3) $\rightarrow$ `pairIdx: 0` ("Lunes y Miércoles"), `dayIdx: 0` ("Lun") / `2` ("Mié").
     - Domingo (0) $\rightarrow$ `pairIdx: 0`, `dayIdx: 0`.
   - Se inicializaron `selectedPairIndex`, `selectedDayIndex` y `excelSingleDayIndex` mediante lazy initializers (`() => initialScheduleDayState...`).
   - **Regla estricta**: No se incluyó ningún `useEffect` que resetee estos índices ante re-renders. Las 3 vistas (Didáctica, Por Día y Semanal) se pueden cambiar y navegar manualmente con total libertad y sin bloqueos.
   - El botón "Ir al mes actual" ahora reinicializa fecha, semana, día y par de hoy.

2. **Cierre de Sesión Resiliente y Multi-Dispositivo (`admin.tsx`, `role-switcher.tsx`)**:
   - Se creó `handleLogout` que limpia `sessionStorage`, ejecuta `logout()` y fuerza `window.location.href = "/"`.
   - Se añadió en `AdminLayout`, `TeacherLayout` y `FamilyLayout` el efecto reactivo:
     ```ts
     useEffect(() => {
       if (!isAuthenticated && typeof window !== "undefined") {
         window.location.href = "/";
       }
     }, [isAuthenticated]);
     ```
   - Se añadió el botón con ícono `LogOut` visible en móviles en la cabecera superior.
   - Se añadió el botón dedicado "Cerrar Sesión" en el pie de la barra lateral (tanto en modo expandido como colapsado y en el drawer de mobile).
   - Se actualizó el botón "Salir" en `RoleSwitcher` para limpiar sesión y redirigir a `/`.

3. **Verificación de Calidad**:
   - `npm run build` ejecutado exitosamente con 0 errores de compilación ni advertencias de SSR.
   - Estado de base de datos verificado con `insforge-postgres`: 95 alumnos totales, 13 alumnos activos preservados al 100%.
   - Graphify y Engram actualizados con los últimos artefactos de conocimiento.
