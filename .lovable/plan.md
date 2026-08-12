# Completar el frontend de Admin + documento de handoff

Los enlaces dicen "Pronto" porque solo existe `/admin` (dashboard). Agenda, Alumnos y Facturación aún no tienen ruta, así que el menú los muestra deshabilitados. El objetivo de este plan es construirlos completos (solo frontend, con datos simulados en el store) y quitar todos los "Pronto".

## 1. Agenda (`/admin/agenda`)

- Vista semanal tipo rejilla: columnas = días (Lun–Sáb), filas = franjas horarias.
- Tarjetas de clase con alumno, instrumento, profesor y sala; color por instrumento.
- Filtros por profesor, sala e instrumento.
- Detección visual de conflictos (misma sala/profesor a la misma hora) con badge de aviso.
- Panel lateral al hacer clic en una clase: detalle, botón "Reprogramar" (mueve la clase a otra franja) y "Cancelar" (genera crédito de recuperación).
- Contador de ocupación de salas y horas libres.

## 2. Alumnos (`/admin/alumnos`)

- Tabla con búsqueda, filtros (instrumento, nivel, estado, profesor) y orden por columna.
- Columnas: alumno, familia, instrumento, profesor, asistencia %, estado de pago, riesgo de baja.
- Chips de estado y semáforo de riesgo reutilizando los tokens actuales.
- Ficha de alumno en panel deslizante: datos, historial de asistencia reciente, notas del profesor, saldo de la familia y créditos.
- Acciones simuladas: cambiar estado (activo / pausa / baja) y asignar profesor.
- Vacío y "sin resultados" bien resueltos.

## 3. Facturación (`/admin/facturacion`)

- Resumen del mes: facturado, cobrado, pendiente, morosidad — con mini gráficas.
- Tabla de recibos por familia: importe, concepto, vencimiento, estado (pagado / pendiente / vencido).
- Acciones simuladas: marcar como cobrado, enviar recordatorio (toast), generar recibo del mes.
- Vista de conceptos recurrentes (planes, alquiler de instrumento, descuento hermanos).

## 4. Ajustes del layout y estado

- Rutas reales en el sidebar con estado activo correcto; se elimina el badge "Pronto".
- Menú móvil que cierra al navegar.
- `src/store/seeds.ts` se amplía con agenda semanal, alumnos ampliados, familias y recibos.
- `src/store/app-store.ts` gana acciones de admin: reprogramar / cancelar clase, cambiar estado de alumno, marcar recibo cobrado, enviar recordatorio.
- Cada acción pasa por la misma cola de sincronización optimista que ya usa el kiosco, para que el patrón sea uniforme al migrar al backend.

## 5. Documento de handoff para la migración

Al terminar creo `docs/HANDOFF.md` con:

- Inventario de rutas, componentes y lo que hace cada pantalla.
- El modelo de datos completo (todas las entidades y campos que hoy viven en `seeds.ts`), listo para convertirse en tablas.
- Cada acción del store mapeada a la operación de backend que necesitará (crear, actualizar, listar) con sus reglas.
- Reglas de permisos por rol (admin / profesor / familia).
- Un prompt final, listo para copiar y pegar, para pedir la migración del backend a Insforge sin tocar el frontend.

## Notas técnicas

- Todo sigue siendo frontend: TanStack Router (rutas `admin.agenda.tsx`, `admin.alumnos.tsx`, `admin.facturacion.tsx`), Zustand como única fuente de datos, sin llamadas de red.
- Se reutilizan los tokens semánticos de `src/styles.css` y los componentes shadcn ya presentes; sin colores fijos nuevos.
- Cada ruta lleva su propio `head()` con título y descripción únicos.
- El store mantiene la forma actual para que sustituir seeds por datos reales sea un cambio localizado.
