# Remix of Music Academy Hub

¡Entendido al 100%! Si quieres que Lovable te construya el frontend completo de la aplicación (Full Frontend App) y no solo una pantalla suelta, tenemos que subir el nivel arquitectónico del prompt. Lovable necesita saber cómo enrutar las páginas, cómo manejar el estado global entre los 3 roles, y cómo estructurar el Layout de cada uno.

Para hacer un "Full Frontend", le exigiremos a Lovable que configure un sistema de rutas (Router), un manejador de estado global (Zustand o Context) y las 3 vistas principales (Admin, Teacher, Family) en una sola generación.

Copia este Megaprompt de Arquitectura Frontend Completa y pégalo en Lovable. Es extenso, técnico y le dará todo el contexto del ecosistema.

📋 MEGA-PROMPT FULL FRONTEND PARA LOVABLE:

ROLE & MISSION Actúa como un Principal Frontend Architect. Tu misión es generar el andamiaje completo (Full Frontend App) para un SaaS de gestión de academias de música de grado empresarial. Stack Estricto: React, Vite, Tailwind CSS, Shadcn UI, Framer Motion, Lucide React, y React Router (o sistema de navegación simulado si es un solo canvas). Usa Zustand (o React Context) para simular el estado global.

SYSTEM CONTEXT & UX PHILOSOPHY (LOS 3 ROLES) Nuestra aplicación sirve a 3 usuarios distintos con modelos mentales opuestos. Todos conviven en el mismo frontend, pero sus Layouts son diferentes:

Admin (Dueño): Necesita una "Torre de Control". Pantallas ricas en datos, orientadas a escritorio/tablet.

Teacher (Profesor): Entorno hostil (instrumento en mano, sin red, 30 segundos de tiempo). UI estrictamente Mobile-first, botones gigantes, navegación inferior. "Optimistic UI" por defecto.

Family (Padres): Portal lúdico y comercial. Agrupa a varios hijos, pagos y un temporizador de práctica.

ARCHITECTURE & DELIVERABLES A CONSTRUIR: Genera una aplicación SPA con un "Role Switcher" (un selector en la pantalla de inicio o Navbar) para que yo pueda navegar y probar las 3 experiencias.

Construye los siguientes módulos y pantallas exactas:

📦 1. ESTADO GLOBAL (Global Store)

Crea un estado simulado que contenga: Un balance de cuenta (para la familia), un arreglo de "Clases de Hoy" y una cola de "Sincronización Offline" (para el profesor).

👑 2. MODULO ADMIN (AdminLayout & Dashboard)

Layout: Sidebar a la izquierda, Topbar limpia. Responsive (se colapsa en móvil).

Dashboard (Vista de Pájaro):

Tarjetas de métricas (Ingresos del Mes, Clases Impartidas, Tasa de Asistencia).

Una tabla o lista de "Familias en Riesgo" (Morosos) usando el componente Table de Shadcn, con columnas: Familia, Deuda, Días en Mora, y un botón "Reenviar Cobro" (Acción rápida).

Sección de Alertas: "Doble reserva evitada", "Contrato de alquiler por vencer".

🎸 3. MODULO TEACHER (TeacherLayout & Kiosco)

Layout: Restringido a formato móvil (max-w-md mx-auto h-[100dvh]). Bottom Navigation Bar obligatoria (Kiosco, Alumnos, Nómina).

Header Optimista: Ícono de nube que muestre "Sincronizando..." si hay acciones pendientes.

Hero Card: Tarjeta gigante con la clase actual (Hora, Nombre del Alumno, Instrumento).

Asistencia Masiva: Un grid de 3 columnas con botones gigantes y áreas táctiles masivas (min-h-[80px]): Presente (Verde), Ausente (Rojo), Tarde (Naranja). Aplica framer-motion (whileTap) para que reaccionen instantáneamente (simulando UI optimista).

Acciones Bifurcadas: Tabs de Shadcn para separar "Nota Privada" (Candado) y "Nota Pública" (Mensaje).

👨‍🎓 4. MODULO FAMILY (FamilyLayout & Portal)

Layout: Mobile/Tablet friendly. Navegación tipo App.

Selector de Hermanos: Un componente de Tabs superior para alternar entre perfiles de hijos (Ej: "Mateo" y "Sofía") bajo la misma cuenta de facturación.

Billing Ledger (Estado de Cuenta): Una tarjeta destacada que unifique el cobro mensual (Flat rate + Extras), con un botón prominente "Pagar Pendiente".

Practice Log (Gamificación): Un módulo con un Temporizador (Cronómetro real o simulado en UI) con botones "Iniciar Práctica" / "Detener". Al detener, debe mostrar los minutos acumulados y una barra de progreso motivacional.

Make-up Credits: Un Badge o tarjeta pequeña que muestre "2 Créditos de Recuperación disponibles".

INSTRUCCIONES DE EJECUCIÓN PARA EL AGENTE:

Inicia creando la estructura de enrutamiento/navegación.

Implementa el Layout base.

Construye las 3 vistas (Admin, Teacher, Family) asegurándote de usar clases de Tailwind para los espaciados, colores corporativos (paletas Slate, Emerald, Blue, Rose) y componentes de Shadcn UI limpios.

Haz que los botones tengan interactividad básica (ej. presionar "Presente" en el Kiosco cambia el estado visualmente).

El código debe ser modular, dividir en componentes lógicos, y entregar un prototipo navegable completo. ¡Sorpréndeme con la calidad visual!

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e61e2fd9-79e8-4165-a93f-4a9b532ac020).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
