# ADR 0007: Modal Onboarding de Pagos por WhatsApp y Sistema de Invitaciones

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

### Modal Onboarding de Pagos por WhatsApp (N° 970608367)
En el portal familiar, la interacción de cobros requería un flujo adaptado a la operativa real peruana. La pasarela automática (Culqi) se mantendrá como apoyo opcional sin forzarla como única vía. El medio principal de regularización son las transferencias bancarias directas y Yape, seguidas de la confirmación humana mediante comprobante/voucher vía WhatsApp.

### Sistema de Invitaciones y Autenticación Controlada
Para evitar que usuarios no autorizados (profesores y familias) naveguen libremente entre perfiles o creen cuentas sin control, se implementó un sistema de acceso basado exclusivamente en **links de invitación con contraseñas maestras** autogeneradas.

## Decisiones de Arquitectura

1. **Reformulación del Botón de Pago (`AccountCard`)**:
   - Cambiado de "Pagar pendiente" a **"Pagar con..."**.
   - Abre el modal `PaymentOnboardingModal` con 3 alternativas:
     1. Cuenta Bancaria (BCP e Interbank con botón de copiado).
     2. Yape (Número `970 608 367` con botón de copiado).
     3. Tarjeta de Débito/Crédito.
   - **Paso Final Obligatorio**: Botón destacado que redirige a `https://wa.me/51970608367` con el mensaje pre-armado especificando el monto y método de pago para adjuntar el comprobante.

2. **Acceso por Invitación & Gestión Admin (`/admin/invitaciones`)**:
   - La Dueña (Super Admin) y la Secretaria (Staff) generan invitaciones en el panel `/admin`.
   - Se crea una contraseña maestra aleatoria (`Vibra-XXXX-XXXX`).
   - El invitado accede mediante la URL única `/invite/{token}`, donde visualiza exclusivamente su nombre y su perfil.
   - **Regla de Cambio de Contraseña**: Se permite personalizar la contraseña **una sola vez**. En caso de olvido o bloqueo por intentos fallidos, el usuario debe contactar a Vibra Music y la administración puede restablecer el acceso a la contraseña maestra original vía `resetUserToMasterPassword()`.

## Consecuencias
- 100% de alineación con el flujo operativo por WhatsApp de Vibra Music.
- Cero contraseñas olvidadas descontroladas: la administración mantiene el control y la capacidad de reseteo.
- Privacidad y aislamiento total de rutas entre perfiles.
