# ADR 0003: Estrategia de Estado Frontend y Migración Futura a Backend

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
El objetivo actual es construir la totalidad de las pantallas y lógica del frontend (UI, ruteo con TanStack Router, Zustand store persistente, cola optimista de sincronización y mockups interactivos) para validar la experiencia antes de clonar el proyecto y conectarle la infraestructura backend en Insforge.

## Decisión
1. Mantener toda la lógica del cliente en Zustand (`app-store.ts`) con simulación de latencia/sincronización (`syncQueue`).
2. Generar el documento [`docs/HANDOFF.md`](file:///c:/Users/USER/my%20music%20staff/docs/HANDOFF.md) con el inventario completo, mapeo de acciones a API endpoints y prompt de migración.
3. Crear un registro de control de ejecución en `docs/logs/execution_tracker.log` para prevenir bucles de ejecución.

## Consecuencias
- Cero acoplamiento prematuro a APIs inestables.
- Prototipo 100% funcional navegable y listo para presentar a los usuarios finales (Secretaria y Dueña).
- Proceso de clonación e integración con backend limpio y predecible.
