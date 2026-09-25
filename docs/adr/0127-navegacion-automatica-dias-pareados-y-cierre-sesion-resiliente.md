# ADR-0127: Navegación Automática a Días Pareados por Día Actual y Cierre de Sesión Resiliente en Panel Administrativo

## Estado
Aprobado e Implementado en Producción.

## Contexto
El usuario y secretaría reportaron dos comportamientos críticos en producción:

1. **Selección estática en Horario de Clases al iniciar jornada**:
   - Al abrir la webapp en un día específico (ej. Viernes), el sistema calculaba adecuadamente la semana activa del mes vía `getCurrentWeekIndex`, pero los selectores de pestañas de días y días pareados (`selectedPairIndex`, `selectedDayIndex` y `excelSingleDayIndex` en `src/components/admin/agenda-board.tsx`) permanecían fijos en `0` (Lunes y Miércoles / Lunes).
   - En las tres vistas del horario:
     - **📊 Vista Didáctica (Horario Pareado)**: Se mostraba "Lunes y Miércoles" (Par 0) obligando al usuario a cambiar manualmente a "Viernes y Sábado" cada día.
     - **📱 Vista por Día**: Se mostraba "Lunes".
     - **🗓️ Rejilla Semanal**: Se mostraban todas las columnas de la semana.
   - Requisito innegociable: La selección inicial debe apuntar al día y par en curso, pero **NO DEBE BLOQUEAR** los cambios manuales entre pestañas o días; el usuario debe poder alternar libremente entre días y pares sin ser forzado de vuelta.

2. **Cierre de sesión bloqueado en el panel administrativo (`/admin`)**:
   - Al hacer clic en "Cerrar sesión" en la cabecera del panel de administración (`src/routes/admin.tsx:401`), la sesión no se cerraba y la pantalla no cambiaba ni redirigía, dando la apariencia de estar congelada o bloqueada.
   - En dispositivos móviles o tablets (`< 640px`), el botón de cierre de sesión estaba completamente oculto con `hidden sm:inline-flex`, y en el menú lateral desplegable no existía opción para salir.
   - Causa raíz técnica: `useAppStore.getState().logout()` solo actualizaba en memoria `{ isAuthenticated: false, currentUser: null }`. En TanStack Router, `beforeLoad` únicamente se evalúa al transicionar de ruta, no reactivamente al permanecer en `/admin`. Al no haber redirección imperativa ni escucha reactiva de `isAuthenticated`, el navegador se quedaba en `/admin`.

---

## Decisiones Técnicas

### 1. Detección Determinista del Día y Par Actual (`initialScheduleDayState`)
- En `src/components/admin/agenda-board.tsx`, se computa `initialScheduleDayState` a partir de `new Date().getDay()`:
  - **Viernes (5) o Sábado (6)**: `pairIdx = 2` ("Viernes y Sábado"), `dayIdx = 4` ("Vie") / `5` ("Sáb").
  - **Martes (2) o Jueves (4)**: `pairIdx = 1` ("Martes y Jueves"), `dayIdx = 1` ("Mar") / `3` ("Jue").
  - **Lunes (1) o Miércoles (3)**: `pairIdx = 0` ("Lunes y Miércoles"), `dayIdx = 0` ("Lun") / `2` ("Mié").
  - **Domingo (0)**: `pairIdx = 0` ("Lunes y Miércoles"), `dayIdx = 0` ("Lun").
- Los estados `selectedDayIndex`, `selectedPairIndex` y `excelSingleDayIndex` se inicializan exclusivamente mediante callbacks en `useState`:
  ```ts
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => initialScheduleDayState.dayIdx);
  const [selectedPairIndex, setSelectedPairIndex] = useState(() => initialScheduleDayState.pairIdx);
  const [excelSingleDayIndex, setExcelSingleDayIndex] = useState(() => initialScheduleDayState.dayIdx);
  ```
- **Sin efectos restrictivos**: Queda prohibido colocar un `useEffect` que resetee estos índices ante re-renders. Esto garantiza que la navegación manual entre pestañas y días funcione con total libertad y sin bloqueos.
- Al hacer clic en el botón "Ir al mes actual", se reinicializa `selectedDate`, `currentWeekIndex`, `selectedPairIndex`, `selectedDayIndex` y `excelSingleDayIndex` con los valores de la fecha actual en curso.

### 2. Cierre de Sesión Infalible y Universal (`handleLogout`)
- En `src/routes/admin.tsx`:
  - Se define `handleLogout`:
    ```ts
    const handleLogout = () => {
      logout();
      try {
        sessionStorage.clear();
      } catch {}
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    };
    ```
  - Se incorpora un guardián reactivo `useEffect` en `AdminLayout` que vigila `isAuthenticated`:
    ```ts
    useEffect(() => {
      if (!isAuthenticated && typeof window !== "undefined") {
        window.location.href = "/";
      }
    }, [isAuthenticated]);
    ```
- Se implementa el mismo guardián reactivo y botón de logout en `src/routes/teacher.tsx` y `src/routes/family.tsx`.
- En `src/components/role-switcher.tsx`, el botón "Salir" invoca la limpieza de sesión y redirección forzada a `/`.

### 3. Visibilidad Universal y Responsive de Cierre de Sesión
- En la cabecera de `admin.tsx`:
  - Se elimina la clase `hidden sm:inline-flex`.
  - Se incorpora el ícono `LogOut` visible en todas las resoluciones (móvil, tablet y desktop), con texto visible en pantallas medianas/grandes (`<span className="hidden sm:inline">Cerrar Sesión</span>`).
- En el pie de la barra lateral (`<aside>`):
  - Modo expandido: Botón completo con ícono `LogOut` y etiqueta *"Cerrar Sesión"*.
  - Modo colapsado: Botón compacto centrado con ícono `LogOut`.
  - Visible también dentro del drawer desplegable en dispositivos móviles.

---

## Consecuencias
- Al iniciar sesión o abrir la webapp un viernes, el horario se abre inmediatamente en **"Viernes y Sábado"** de la semana en curso en la Vista Didáctica, y en **"Viernes"** en la Vista por Día.
- La interacción manual en las 3 vistas (Didáctica pareada, Por Día y Rejilla semanal) permanece fluida, libre y 100% desbloqueada.
- El cierre de sesión en perfiles de administración (Dueña, Sergio, Fabricio, Karla, Nayeli) redirige al instante a la pantalla de login principal (`/`), permitiendo cambiar de perfil o cerrar la estación de trabajo de forma segura.
- Cero impacto o modificaciones en el backend o en las tablas de PostgreSQL de Insforge.
