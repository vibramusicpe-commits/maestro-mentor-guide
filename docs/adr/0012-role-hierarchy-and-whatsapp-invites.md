# ADR 0012: Jerarquía Estricta de Permisos por Rol y Agilización de Invitaciones por WhatsApp

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

El cliente requiere formalizar la matriz de permisos para 4 niveles de jerarquía operativa y agilizar el proceso de invitación sin conocimientos técnicos por parte de la Dueña y la Secretaria.

## Decisiones

1. **Jerarquía Operativa de Accesos**:
   - **Nivel 1: 👑 Dueña (`super_admin`)**: Control total del sistema, incluyendo métricas globales, ingresos, egresos corporativos, cuentas bancarias y cierre de nómina.
   - **Nivel 2: 📋 Secretaria / Nayeli (`staff`)**: Gestión operativa diaria (registro/baja de alumnos, agenda, marcado de créditos por falta, recepción de abonos por Yape/Efectivo, envío de avisos y creación de invitaciones). **Acceso denegado a Finanzas Corporativas/Egresos**.
   - **Nivel 3: 🎸 Profesores (`teacher`)**: Kiosco 3-en-1 (fichaje de horario en sede, marcado rápido de asistencia, notas privadas de clase) y Registro Transparente de Horas Impartidas (**sin sueldos ni montos**).
   - **Nivel 4: 👨‍👩‍👧 Familias (`family`)**: Portal de seguimiento del alumno, saldo de créditos de recuperación y onboarding de pagos con redirección directa a WhatsApp (`51970608367`).

2. **Agilización de Invitaciones por WhatsApp**:
   - Se incorporó en `/admin/invitaciones` el botón **`🚀 2. Enviar por WhatsApp Ahora →`** que utiliza el protocolo `wa.me/?text=` para abrir la App de WhatsApp con el mensaje precargado en 1 solo clic.

## Consecuencias
- Cero barrera técnica para la Dueña y Nayeli al invitar profesores y padres.
- Protección total de los estados financieros de la Dueña frente al personal de secretaría.
