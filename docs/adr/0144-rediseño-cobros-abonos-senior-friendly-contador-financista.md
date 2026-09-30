# ADR-0144: Rediseño Integral de Cobros y Abonos Accesible para Personas Mayores (Senior-Friendly) con Perfil Dual Dueña/Contador y Cero Mock Data

## Estado
Aceptado e Implementado

## Fecha
2026-09-30

## Contexto
El panel de "Cobros, Abonos y Vouchers" (`/admin/facturacion`) conservaba dependencias de datos estáticos y semillas de prueba obsoletas (`billingTrend`, `recurringConcepts` de `admin-seeds.ts`), mientras que la dirección del negocio requería un panel con datos 100% reales conectados a PostgreSQL para los dos actores financieros clave de la academia:
1. **La Dueña (Financista / Dirección):** Necesita saber con exactitud matemática cuánto dinero ingresó a caja, quiénes deben este mes, cuánto deben y disponer de herramientas de cobranza rápida (WhatsApp pre-armado y registro de abonos sin fricción).
2. **El Contador:** Necesita un Libro Diario cronológico y correlativo con fecha, hora, alumno, medio de pago, N° de Operación bancario, concepto/rubro contable, importe exacto en PEN y la capacidad de descargar en 1 clic un archivo Excel/CSV compatible con Microsoft Excel (con cabecera UTF-8 BOM).
3. **Accesibilidad para Personas Mayores (Senior-Friendly):** Ambos usuarios pueden experimentar fatiga visual o requerir interfaces de máxima legibilidad, contraste elevado (WCAG AAA), tamaños de fuente ampliados (A, A+, A++ Senior), botones táctiles de mínimo 48px de altura ("fat-finger friendly"), cero iconos huérfanos sin texto explícito y un explicador en lenguaje natural impulsado por el Copiloto Laya.

## Decisiones Técnicas

### 1. Erradicación Total de Mock Data
- Se eliminaron las importaciones de `billingTrend` y `recurringConcepts`.
- **Fuente Única de Verdad:** PostgreSQL vía PostgREST e Insforge (`students`, `invoices`, `payment_audit_logs`).
- **Cálculo Dinámico de Cifras Clave (13 Alumnos Activos en Producción):**
  - **Total Facturado:** S/ 4,213.00 PEN (suma de precios de plan de los 13 alumnos activos).
  - **Total Cobrado en Caja:** S/ 3,425.00 PEN (81.3% recaudado).
  - **Saldo Pendiente (Deuda por Cobrar):** S/ 788.00 PEN (18.7%).
  - **Semáforo de Deudores (4 Alumnos con saldo pendiente):**
    1. *Fernanda Sofía Fajardo Condo:* Debe S/ 297.00 PEN (S/ 0 abonado).
    2. *Karlitoz Pazos Huatuco:* Debe S/ 277.00 PEN (S/ 20 abonado).
    3. *Sasha Dharma Contreras de la Cruz:* Debe S/ 197.00 PEN (S/ 100 abonado).
    4. *Marco Antonio Adrian Mamani Caro:* Debe S/ 17.00 PEN (S/ 280 abonado).
  - **Alumnos 100% al Día:** 9 alumnos con saldo S/ 0.00.

### 2. Barra de Accesibilidad y Perfil Dual (`SeniorAccessibilityBar`)
- Componente independiente `src/components/admin/senior-accessibility-bar.tsx` ubicado en la cabecera del panel.
- **Selector de Perfil:**
  - `💼 Vista Dueña (Caja y Cobranza)`: Enfocado en el dinero en caja, la cartera de cobro pendiente y el contacto directo con apoderados.
  - `📑 Vista Contador (Bancos y Cuadre)`: Enfocado en el Libro Diario correlativo, conciliación de comprobantes y exportación a hoja de cálculo.
- **Selector de Zoom Tipográfico (Senior Font Size):**
  - `A` (Normal): 14px base, compacto.
  - `A+` (Mediano): 16px base, mayor contraste y espaciado interlineal.
  - `A++ Senior` (Grande): 18px-24px base, números monetarios en 36px-48px monospace, botones táctiles `>= 48px` para evitar pulsaciones erróneas.
- **Botón `💡 Explicar con Laya`:** Modal de diálogo accesible que desglosa en español coloquial la situación financiera, los 4 alumnos deudores y cómo utilizar las funciones del panel.
- **Indicador de Estado PostgreSQL en Vivo:** Badge interactivo que muestra la sincronización en tiempo real y permite refrescar la caché con un solo clic.

### 3. Vista Ejecutiva Dueña (`viewProfile === "duena"`)
- **Semáforo de Cobranza Prioritaria:** Tarjetas de alta visibilidad para cada uno de los 4 alumnos con deuda.
- **Botón 48px `📲 Cobrar WhatsApp`:** Abre la API oficial de WhatsApp (`wa.me`) con un saludo cordial pre-redactado que incluye el nombre del alumno, el instrumento y el monto exacto pendiente.
- **Botón 48px `💵 Registrar Abono`:** Abre el modal de abono pre-cargando los datos del alumno y permitiendo pegar la captura de pantalla de Yape con `Ctrl+V`.
- **Sección Colapsable de Alumnos al Día:** Lista los 9 alumnos cumplidos sin saturar la vista principal.

### 4. Vista Contable Contador (`viewProfile === "contador"`)
- **Libro Diario de Ingresos y Abonos:** Tabla correlativa con Fecha, Hora, Alumno/Titular, Medio de Pago, N° de Operación bancario, Concepto/Rubro (Pensión Regular, Matrícula, Pack Útiles), Importe Cobrado (PEN), Comprobante WebP y Auditoría de quién registró el abono.
- **Botón `📥 Descargar Libro Contable (CSV / Excel)`:** Genera y descarga un archivo `.csv` con prefijo `\uFEFF` (UTF-8 BOM), garantizando que Microsoft Excel en español lo abra automáticamente sin corrupción tipográfica ni errores de codificación.
- **Filtro por Medio de Pago y Buscador:** Permite aislar transacciones de Yape, Plin, Transferencia BCP o Efectivo en tiempo real.

### 5. Preservación del Detalle Integral y Matriz Anual
- Debajo de ambas vistas especializadas, se preserva el acceso sin restricciones a las pestañas detalladas:
  - `Recibos Activos`
  - `Matriz Anual 2026 (13 Alumnos Activos)`
  - `Historial de Vouchers Yape`
  - `Conciliación y Caja` (ahora con `dynamicBillingTrend` y `dynamicPlanDistribution` 100% dinámicos).

## Consecuencias
- Cero mock data en todo el módulo financiero.
- Interfaz 100% amigable para personas mayores con problemas de visión o destreza motriz fina.
- El contador y la dueña disponen de vistas hechas a la medida de sus responsabilidades diarias.
- Cumplimiento de las directrices de producción de Vibra Music Staff.
