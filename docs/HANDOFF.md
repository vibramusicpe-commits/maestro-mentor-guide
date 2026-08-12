# Documento de Traspaso (Handoff): Maestro Mentor Guide / Cadencia

Este documento detalla el estado del frontend, el inventario de pantallas, el modelo de datos simulados (`seeds.ts` y `admin-seeds.ts`), la arquitectura del estado con Zustand (`app-store.ts`), la matriz de permisos por rol ajustada a las necesidades de la Secretaria y el prompt final para la migración del backend hacia la plataforma **Insforge**.

---

## 1. Inventario de Pantallas

| Ruta | Nombre / Módulo | Descripción / Funciones Principales | Roles Permitidos |
|---|---|---|---|
| `/` | Landing / Role Switcher | Selección de rol activo: Super Admin, Staff, Profesor, Familia | Todos |
| `/admin` | Dashboard de Dirección | Métricas operativas, widget de **Cumpleaños del Mes**, alertas y morosidad | Super Admin, Staff |
| `/admin/agenda` | Módulo Agenda | Rejilla semanal de horarios, ocupación de salas, franjas por modalidad | Super Admin, Staff |
| `/admin/alumnos` | Módulo Alumnos | Conteo de **Activos vs Inactivos**, modalidades (**Regular: 8 clases/45m** vs **Intensivo: 4 clases/90m**), **Gestión de Créditos** por falta (+1/-1) y ficha con datos de emergencia | Super Admin, Staff |
| `/admin/facturacion` | Módulo Facturación | Registro de abonos por **Yape**, **Efectivo** o **Transferencia**, **avisos a 2 días de vencer**, recibos por familia (egresos corporativos ocultos a Staff) | Super Admin, Staff (modo abonos) |
| `/teacher` | Kiosco Profesor | Listado de clases del día, asistencia rápida y observaciones de avance pedagógico | Profesor, Admin |
| `/family` | Portal Familia | Resumen del hogar, alumnos vinculados, créditos y registro de práctica | Familia |

---

## 2. Modelo de Datos (Actualizado según Operación Vibra Music)

```typescript
export type StudentStatus = "activo" | "pausa" | "baja";
export type PaymentStatus = "al-dia" | "pendiente" | "vencido";
export type LessonModality = "Regular (8 clases / 45 min)" | "Intensivo (4 clases / 90 min)";

export type EmergencyContact = {
  name: string;
  phone: string;
  relation: string;
};

export type AdminStudent = {
  id: string;
  name: string;
  family: string;
  instrument: string;
  level: string;
  teacher: string;
  modality: LessonModality;
  status: StudentStatus;
  attendanceRate: number;
  payment: PaymentStatus;
  risk: number;
  joinedAt: string;
  makeupCredits: number; // Créditos acumulados por falta
  balance: number;
  recentAttendance: ("presente" | "ausente" | "tarde")[];
  teacherNote: string;
  email: string;
  phone: string;
  emergencyContact: EmergencyContact;
  birthdate: string;
};

export type InvoiceStatus = "pagado" | "pendiente" | "vencido";
export type PaymentMethod = "Yape" | "Efectivo" | "Transferencia";

export type Invoice = {
  id: string;
  family: string;
  concept: string;
  students: number;
  amount: number;
  dueDate: string;
  daysToDue: number; // Alerta a los 2 días de vencer
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod | null;
  remindedAt: string | null;
};
```

---

## 3. Mapeo de Acciones del Store (`app-store.ts`) a Backend Futuro

| Acción Zustand | Parámetros | Operación Backend Futura (REST / GraphQL / RPC) | Efecto / Mutación en DB |
|---|---|---|---|
| `setAttendance` | `lessonId, status` | `POST /api/v1/lessons/:id/attendance` | Actualiza estado de asistencia y calcula créditos si hay ausencia |
| `setStudentModality` | `id, modality` | `PATCH /api/v1/admin/students/:id/modality` | Cambia entre plan Regular (45 min x2) e Intensivo (90 min x1) |
| `addStudentCredit` | `id` | `POST /api/v1/admin/students/:id/credits/add` | Suma +1 crédito al alumno por falta justificada |
| `consumeStudentCredit` | `id` | `POST /api/v1/admin/students/:id/credits/use` | Descuenta -1 crédito tras asistir a clase de recuperación |
| `markInvoicePaid` | `id, method` | `POST /api/v1/admin/invoices/:id/pay` | Registra abono especificando Yape, Efectivo o Transferencia |
| `remindInvoice` | `id` | `POST /api/v1/admin/invoices/:id/remind` | Envía notificación preventiva (WhatsApp/Email) faltando 2 días |

---

## 4. Matriz de Permisos por Rol (Ajustada)

| Recurso / Función | Super Admin (Dueña) | Staff (Secretaria) | Profesor | Familia |
|---|:---:|:---:|:---:|:---:|
| **Egresos y Cuentas Corporativas** | ✅ Acceso Total | 🚫 Protegido | ❌ Oculto | ❌ Oculto |
| **Registrar Abonos (Yape/Efectivo)** | ✅ Permitido | ✅ Permitido | ❌ Sin acceso | ❌ Sin acceso |
| **Avisos a 2 Días de Vencer** | ✅ Enviar | ✅ Enviar | ❌ Sin acceso | ❌ Sin acceso |
| **Modalidad Regular / Intensiva** | ✅ Configurar | ✅ Configurar | 👁 Ver horario | 👁 Ver plan |
| **Créditos de Recuperación** | ✅ Administrar | ✅ Administrar | 👁 Ver saldo | 👁 Ver saldo |
| **Cumpleaños del Mes** | ✅ Ver / Felicitar | ✅ Ver / Felicitar | ❌ Sin acceso | ❌ Sin acceso |

---

## 5. Prompt Final para Migración del Backend a Insforge

```text
PROMPT DE MIGRACIÓN DE BACKEND A INSFORGE (VIBRA MUSIC)

Hola. Necesito implementar la arquitectura de backend en Insforge para la plataforma SaaS "Cadencia / Maestro Mentor Guide" de la academia Vibra Music.

Requerimientos clave basados en la operación real:
1. Base de Datos:
   - Tabla `students` con modalidades (`Regular 8 clases/45m` vs `Intensivo 4 clases/90m`), conteo de `makeup_credits`, `email`, `phone`, `birthdate` y `emergency_contact_json`.
   - Tabla `invoices` con `days_to_due`, `payment_method` (Yape, Efectivo, Transferencia) y `reminded_at`.

2. Lógica de Permisos (RLS):
   - Rol `staff` (Secretaria): puede registrar abonos recibidos (Yape/Efectivo) y enviar notificaciones a 2 días de vencer, pero NO puede leer ni modificar la tabla de `company_expenses` ni `bank_accounts`.
   - Rol `super_admin` (Dueña): acceso ilimitado a ingresos, egresos y utilidades.

3. Endpoints Principales:
   - POST /api/v1/admin/students/:id/credits/add
   - POST /api/v1/admin/students/:id/credits/use
   - POST /api/v1/admin/invoices/:id/pay (acepta { method: 'Yape' | 'Efectivo' | 'Transferencia' })
   - POST /api/v1/admin/invoices/notify-due-soon (envía avisos masivos a recibos con <= 2 días)

Por favor, genera la migración SQL, esquemas de RLS y cliente TypeScript `src/lib/insforge.ts`.
```
