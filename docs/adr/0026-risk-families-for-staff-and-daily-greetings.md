# ADR 0026: Habilitación de Familias en Riesgo para Nayeli, Catálogo de 31 Frases Rotativas y Personalización de Perfil

- **Estado**: Aceptado
- **Fecha**: 2026-08-13
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

1. **Gestión de Cobranzas para Nayeli**:
   - En el Dashboard (`/admin`), la tabla **"Familias en riesgo"** (cobros vencidos, morosidad y reenvío de recordatorios con 1 clic por WhatsApp) estaba oculta para el rol `staff`. Nayeli es quien gestiona directamente a los apoderados en recepción, por lo que necesitaba ver y operar esta tabla para cobrar deudas y emitir recordatorios.
2. **Experiencia Humana y Personalización**:
   - El saludo genérico "Buenas tardes, Secretaría" resultaba frío y despersonalizado. Se requería:
     - Que el sistema salude a Nayeli por su nombre.
     - Un botón/ícono de configuración para que pueda personalizar cómo quiere ser llamada en la plataforma en cualquier momento sin alterar la base de datos central.
     - Un catálogo de **31 frases inspiradoras y motivacionales** que roten automáticamente cada día del mes para que cada jornada de trabajo sea agradable.

## Decisiones

1. **Habilitación de Familias en Riesgo en el Dashboard**:
   - Se removió la restricción `!isStaff` en `src/routes/admin.index.tsx`. Ahora Nayeli puede ver las familias con deudas vencidas y presionar **"Reenviar cobro"**.
2. **Catálogo de 31 Frases Rotativas (`src/lib/greetings.ts`)**:
   - Creado el módulo `getDailyGreeting()` que calcula la frase del día en base al día del mes (1 al 31) con mensajes enfocados en excelencia musical, calidez y motivación.
3. **Modal de Personalización de Perfil**:
   - Añadido el botón **`⚙️ Personalizar Perfil`** en la cabecera del dashboard.
   - Permite a Nayeli editar su nombre visible en el sistema (ej. *Nayeli*, *Nayeli Solórzano*, etc.) y guarda la preferencia en su sesión local.

## Consecuencias
- Nayeli tiene control total de las cobranzas y recordatorios de morosidad desde su panel.
- La interfaz ofrece una experiencia cálida, motivadora y 100% personalizada.
