# ADR 0001: Segregación de Roles y Control de Privacidad Financiera

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
En la operación de la escuela de música Vibra Music, existen dos perfiles administrativos claramente diferenciados:
1. **Super Admin (Dueña)**: Requiere visión completa de ingresos, egresos corporativos, utilidades netas y cuentas bancarias.
2. **Staff (Secretaria)**: Gestiona la atención diaria, agendamiento de clases, altas/bajas de alumnos, notificaciones de cobro a 2 días y registro de abonos abonados por los apoderados (Yape, Efectivo, Transferencia).

## Decisión
1. Dividir el rol `"admin"` de Zustand en dos roles específicos: `"super_admin"` y `"staff"`.
2. Ocultar los módulos de **Egresos Corporativos**, **Cuentas Bancarias de la Empresa** y **Márgenes Financieros Netos** al rol `staff`.
3. Permitir al rol `staff` registrar los ingresos recibidos por familias sin comprometer la información confidencial de egresos corporativos.

## Consecuencias
- Interfaz adaptada a las responsabilidades operativas de la Secretaria.
- Protección total de datos financieros sensibles.
- Transición sencilla a políticas RLS (Row Level Security) en el backend futuro.
