# ADR 0019: Selector de Fecha Popover Mes/Año y Buscador Histórico de Alumnos y Bajas

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

Nayeli (Secretaria) necesitaba dos herramientas de exploración en la sección Horario de Clases (`/admin/agenda`):
1. **Navegación Temporal Futura/Pasada**: Posibilidad de explorar la programación mes a mes o año a año mediante un botón con icono de calendario y modal desplegable.
2. **Buscador de Alumnos Reingresantes / Bajas**: Un acceso rápido para consultar el historial de alumnos que estuvieron de baja o en pausa en meses anteriores, permitiendo reactivar su matrícula con 1 solo clic.

## Decisiones

1. **Selector de Fecha Pop-Up (`DatePicker Popover`)**:
   - Se añadió el botón con icono de calendario **`📅 [Mes] [Año]`** en la cabecera del Horario de Clases.
   - Al presionarlo se despliega un pop-up con cuadrícula de meses (*Enero, Febrero... Diciembre*) y flechas de navegación por año, permitiendo consultar cualquier periodo futuro o pasado.

2. **Panel Desplegable de Historial Reingresos / Bajas**:
   - Se añadió el botón **`🕒 Historial Reingresos / Bajas`**.
   - Abre un panel lateral con buscador en tiempo real para encontrar alumnos inactivos o dados de baja y reactivarlos inmediatamente a estado "Activo" con 1 clic.

## Consecuencias
- Nayeli y la Dueña pueden planificar la programación de cualquier mes del año y recuperar el historial de cualquier alumno reingresante en segundos.
