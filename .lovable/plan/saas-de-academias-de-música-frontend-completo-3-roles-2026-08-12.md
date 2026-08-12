# SaaS de academias de música — Frontend completo (3 roles)

Prototipo navegable con tres experiencias distintas (Admin, Profesor, Familia), estado global simulado y un selector de rol para probarlas.

## Nota sobre el stack
El proyecto usa **TanStack Router** (no React Router); es fijo en esta plataforma. El enrutado y los layouts se implementan con rutas de archivo equivalentes, sin perder nada de lo pedido. Estado global con Zustand.

## Estructura de rutas

```text
/                    Landing + Role Switcher (elige Admin / Profesor / Familia)
/admin               Layout con sidebar + topbar
/admin/              Dashboard (métricas, morosos, alertas)
/teacher             Layout móvil (max-w-md, bottom nav)
/teacher/            Kiosco (clase actual, asistencia, notas)
/teacher/alumnos     Lista de alumnos
/teacher/nomina      Resumen de pagos al profesor
/family              Layout tipo app
/family/             Portal (hermanos, estado de cuenta, práctica, créditos)
```

## Estado global (Zustand)
- Balance y detalle de facturación de la familia (tarifa fija + extras), créditos de recuperación.
- Clases de hoy con su estado de asistencia (pendiente / presente / ausente / tarde).
- Cola de sincronización offline: marcar asistencia encola una acción y se vacía sola tras un momento (UI optimista).
- Registro de práctica: sesiones y minutos acumulados por hijo.
- Rol activo, para que el switcher recuerde dónde estabas.

## Módulos

**Admin** — sidebar colapsable en móvil, topbar limpia. Tarjetas de métricas (ingresos del mes, clases impartidas, tasa de asistencia), tabla de familias en riesgo (familia, deuda, días en mora, botón "Reenviar cobro" con feedback toast) y panel de alertas (doble reserva evitada, contrato de alquiler por vencer).

**Profesor** — contenedor móvil fijo con bottom nav de 3 ítems. Header con ícono de nube que muestra "Sincronizando…" mientras haya acciones en cola. Hero card de la clase actual (hora, alumno, instrumento). Grid de 3 botones táctiles gigantes (min-h-80px) Presente / Ausente / Tarde con reacción instantánea al tocar. Tabs para nota privada (candado) y nota pública.

**Familia** — tabs superiores para alternar entre hijos (Mateo / Sofía) bajo la misma cuenta. Tarjeta de estado de cuenta unificada con desglose y botón "Pagar pendiente". Módulo de práctica con cronómetro real (iniciar/detener), minutos acumulados y barra de progreso motivacional. Badge de créditos de recuperación.

## Diseño
Paleta corporativa (slate + esmeralda, con azul y rosa como acentos) definida como tokens semánticos en el sistema de diseño, tipografía con carácter, animaciones sutiles con Framer Motion, iconos Lucide y componentes Shadcn. Todo modular: un componente por bloque, layouts separados por rol.

## Detalles técnicos
- Rutas de layout `admin.tsx`, `teacher.tsx`, `family.tsx` con `<Outlet />` e hijos `*.index.tsx`.
- Store en `src/store/app-store.ts` (Zustand), componentes en `src/components/{admin,teacher,family}`.
- Datos simulados en un módulo de seeds; sin backend en esta fase.
- `head()` propio con título y descripción en cada ruta de contenido.
