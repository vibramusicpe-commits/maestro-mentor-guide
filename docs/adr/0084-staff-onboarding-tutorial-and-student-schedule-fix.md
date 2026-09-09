# ADR 0084: Tutorial Interactivo de Inducción para Secretaría y Corrección del Panel de Alumnos

## Estado
Aceptado e Implementado

## Contexto
1. **Error en Panel de Alumnos (`/admin/alumnos`)**: Al abrir el modal de organización de horario (`ScheduleStudentForm`), la consola arrojaba `ReferenceError: teacher is not defined` debido a que las variables de estado `teacher`, `instrument` y `category` eran consumidas en el JSX sin haberse declarado formalmente dentro del componente, provocando un fallo en tiempo de ejecución.
2. **Necesidad de Inducción Operativa Simplificada (TDAH-friendly)**: La dirección general solicitó un tutorial interactivo de inducción paso a paso para el personal de secretaría y directivos, que explique de manera visual, secuencial y sin tecnicismos confusos el flujo operativo completo de la academia:
   - Registro con datos completos de papá, mamá y contacto de emergencia.
   - Implementación del horario con días pareados oficiales (Lunes jala Miércoles, Martes jala Jueves) y aforo máximo de 5 alumnos.
   - Supervisión de asistencias (tanto desde el kiosco del profesor como desde secretaría y su reflejo en el kardex).
   - Cobros y facturación (al día vs. morosos).
   - Enlaces de invitación por WhatsApp y claves maestras inmutables.
   - Asistencia docente en sede y control de nómina.
3. **Control desde Configuración de Perfil**: El tutorial no debe ser intrusivo; debe contar con activación/desactivación en el modal de personalización de perfil y botones de apertura directa tanto en la cabecera como en la configuración.

## Decisiones Técnicas

1. **Corrección Quirúrgica de Variables en `ScheduleStudentForm`**:
   - En `src/components/admin/students-table.tsx`, se declararon los hooks de estado para `teacher`, `instrument` y `category` con valores iniciales seguros a partir de la ficha del alumno o de las semillas oficiales.

2. **Creación del Componente `StaffOnboardingTutorial`**:
   - Implementado en `src/components/admin/staff-onboarding-tutorial.tsx` usando la paleta oficial de Vibra Music (`#0D0B0A`, `#1A1410`, `#F47B20`, `#FFB52E`, `#FFF8EC`).
   - 6 Pasos interactivos con barra de progreso, tarjetas explicativas con íconos grandes, alertas con reglas de oro y botones de navegación directa hacia cada módulo del sistema.
   - **Micro-interacciones y mini-simuladores táctiles (TDAH-friendly)**: Cada paso cuenta con un simulador en vivo interactivo con animaciones de Framer Motion:
     - *Paso 1*: Toggle interactivo de Ficha Familiar con desglose de papá, mamá y contacto de emergencia.
     - *Paso 2*: Conmutador visual de pares Lun+Mié vs Mar+Jueves con indicador de aforo 3/5 alumnos.
     - *Paso 3*: Simulador de 4 botones de asistencia (Presente, Ausente, Tarde, Justificada) con feedback en vivo de créditos de recuperación (+1 crédito).
     - *Paso 4*: Simulador de cobro de cuota mensual en Soles PEN con toggle de estado al día / moroso.
     - *Paso 5*: Visualizador de claves maestras oficiales inmutables y botón táctil para copiar el formato de WhatsApp.
     - *Paso 6*: Reloj de sede en tiempo real con segundero en vivo y monitoreo de profesores en sede.

3. **Integración y Auto-Apertura en `src/routes/admin.index.tsx`**:
   - Botón `Guía de Inducción` accesible en la cabecera del Dashboard principal.
   - Detección automática en primer inicio de sesión para secretarias (`localStorage.getItem("vibra-onboarding-completed") !== "true"`), desactivable en cualquier momento.
   - Interruptor checkbox y botón directo `Iniciar Tutorial Guiado` dentro del modal "Personalizar Perfil" para controlar la inducción.

4. **Persistencia Backend Robusta (PostgreSQL / Insforge)**:
   - En `src/store/app-store.ts`, se implementó resolución determinista de UUID (`00000000-0000-0000-0002-${String(id).padStart(12, '0')}`) tanto para la sincronización de alumnos como para el registro relacional en `public.attendance_logs`, garantizando integridad referencial ante claves compuestas o numéricas.

## Consecuencias y Validación

* El panel `/admin/alumnos` compila y renderiza sin errores de referencia.
* El asistente interactivo puede abrirse en cualquier momento sin alterar el estado de las sesiones activas y se adapta de forma amigable a secretarias con TDAH.
* Las asistencias marcadas tanto en quiosco docente como en secretaría se sincronizan con `public.attendance_logs` y `public.students` en PostgreSQL.
* `npm run build` completado exitosamente (0 errores en Nitro y SSR).
