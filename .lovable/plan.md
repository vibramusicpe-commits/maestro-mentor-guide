# Completar el frontend de los 3 roles

Ya existen: landing con selector de rol, layout Admin con sidebar/topbar, dashboard Admin (métricas, familias en riesgo, alertas), store Zustand base y `<Toaster />` montado. Falta todo el rol Profesor, todo el rol Familia y varios refinamientos del estado global.

## 1. Rol Profesor (nuevo)

- Layout móvil fijo (`max-w-md` centrado) con bottom nav de 3 ítems: Kiosco, Alumnos, Nómina.
- Header con ícono de nube: muestra "Sincronizando…" mientras la cola offline tenga elementos y "Todo al día" cuando se vacía.
- **Kiosco**: hero card de la clase actual (hora, alumno, instrumento, sala); grid de 3 botones táctiles gigantes (min-h 80px) Presente / Ausente / Tarde con reacción instantánea; tabs de nota privada (candado) y nota pública; lista compacta del resto de clases de hoy con su estado.
- **Alumnos**: lista de alumnos con instrumento, próxima clase, asistencia reciente y buscador simple.
- **Nómina**: total del mes, clases impartidas vs. canceladas, desglose por semana y estado de pago.

## 2. Rol Familia (nuevo)

- Layout tipo app (contenedor centrado, header con la cuenta y badge de créditos de recuperación).
- Tabs superiores para alternar entre hijos (Mateo / Sofía).
- Tarjeta de estado de cuenta unificada: desglose de tarifa fija + extras + descuentos, total pendiente y botón "Pagar pendiente" con toast y cambio a "Al día".
- Módulo de práctica con cronómetro real (iniciar / detener), minutos acumulados del hijo activo, barra de progreso hacia la meta semanal y mensaje motivacional.
- Tarjeta del profesor y próxima clase del hijo activo.

## 3. Estado global (ampliar el store)

- `activeRole` persistido para que el selector recuerde dónde estabas.
- Auto-vaciado de la cola de sincronización: cada acción encolada se elimina sola tras ~1.5 s (UI optimista).
- Datos de nómina y alumnos del profesor; sesiones de práctica (nº de sesiones + minutos) por hijo.
- Mover los datos simulados a un módulo de seeds separado.

## 4. Pulido transversal

- Animaciones sutiles con Framer Motion (entrada de tarjetas, feedback al marcar asistencia, cambio de hijo).
- Revisar la navegación del sidebar Admin para que no apunte todo a la misma ruta.
- `head()` propio (título + descripción + og) en cada ruta de contenido nueva.

## Detalles técnicos

- Rutas: `teacher.tsx`, `teacher.index.tsx`, `teacher.alumnos.tsx`, `teacher.nomina.tsx`, `family.tsx`, `family.index.tsx` (layouts con `<Outlet />`).
- Componentes en `src/components/teacher/*` y `src/components/family/*`, uno por bloque.
- Store en `src/store/app-store.ts`; seeds en `src/store/seeds.ts`.
- Se instala `framer-motion`; toasts con `sonner` (ya montado en `__root.tsx`).
- Sin backend en esta fase: todo simulado en memoria.
