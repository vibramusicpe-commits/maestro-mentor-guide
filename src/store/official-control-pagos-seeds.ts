// ===== Datos Semilla Oficiales Generados desde ESTUDIANTES VIBRA MUSIC .xlsx =====
// Registro Individual Completo de Alumnos Separados (Sin agrupaciones)
import type { AdminStudent, Invoice, AnnualMonthRecord, VibraPlanType, MatriculaType, PaymentMethod, PaymentStatus, InvoiceStatus } from "./admin-seeds";

export interface ControlPagosStudentWithAnnual extends AdminStudent {
  annualRecords: Record<string, AnnualMonthRecord>;
  rawMontoText: string;
}

export const officialControlPagosStudents: ControlPagosStudentWithAnnual[] = [
  {
    "id": "as-cp-1",
    "name": "Ticona Cachay, Jonathan",
    "family": "Familia Ticona Cachay",
    "instrument": "Canto",
    "level": "Nivel 2",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "ADULTO",
    "age": 37,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Invitación Retorno",
    "email": "alumno_1@vibramusic.pe",
    "phone": "962386336",
    "emergencyContact": {
      "name": "Ticona Cachay, Jonathan",
      "phone": "962386336",
      "relation": "Titular Directo"
    },
    "birthdate": "15 de Setiembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-2",
    "name": "Conislla Huerta, Iker Samín",
    "family": "Familia Conislla Huerta",
    "instrument": "Piano Infantil",
    "level": "Iniciación Musical",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "INFANTIL",
    "age": 6,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 261.4,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Valor con Video",
    "email": "alumno_2@vibramusic.pe",
    "phone": "994827408",
    "emergencyContact": {
      "name": "Julio Cesar Conislla Hinostroza",
      "phone": "994827408",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Noviembre",
    "planType": "Trimestral",
    "planPrice": 261.4,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-10-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-10",
    "rawMontoText": "261.4",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "261.4",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-3",
    "name": "De La Cruz Pucyura, Carlomagno Tomas",
    "family": "Familia De La Cruz Pucyura",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "baja",
    "ageCategory": "JUNIOR",
    "age": 7,
    "attendanceRate": 75,
    "payment": "pendiente",
    "risk": 85,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 0,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Valor con Video",
    "email": "alumno_3@vibramusic.pe",
    "phone": "990621266",
    "emergencyContact": {
      "name": "Magno Angel De La Cruz Valencia",
      "phone": "990621266",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Marzo",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pendiente",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-4",
    "name": "Sanchez Justa, Johandry Henry",
    "family": "Familia Sanchez Justa",
    "instrument": "Batería",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUVENIL",
    "age": 16,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_4@vibramusic.pe",
    "phone": "900617145",
    "emergencyContact": {
      "name": "Mark Anthony Sanchez Justo",
      "phone": "900617145",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Octubre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-5",
    "name": "Meza Llallahui, Andrea Fernanda",
    "family": "Familia Meza Llallahui",
    "instrument": "Batería",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "ADULTO",
    "age": 24,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Valor con Video",
    "email": "alumno_5@vibramusic.pe",
    "phone": "930182010",
    "emergencyContact": {
      "name": "Luggi Boore",
      "phone": "930182010",
      "relation": "Titular Directo"
    },
    "birthdate": "15 de Mayo",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-6",
    "name": "Huerta Mitma, Juan Diego",
    "family": "Familia Huerta Mitma",
    "instrument": "Guitarra clásica",
    "level": "Nivel 1",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 9,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Blog Beneficios",
    "email": "alumno_6@vibramusic.pe",
    "phone": "997549474",
    "emergencyContact": {
      "name": "Juan Carlos Huerta Concepción",
      "phone": "997549474",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Diciembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-7",
    "name": "Álvares Galarreta, Gabriel Fabiano",
    "family": "Familia Álvares Galarreta",
    "instrument": "Batería",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 12,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_7@vibramusic.pe",
    "phone": "975687085",
    "emergencyContact": {
      "name": "Galarreta Sanches, Janet",
      "phone": "975687085",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Noviembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-8",
    "name": "Anton, Junior Gabriel",
    "family": "Familia Anton",
    "instrument": "Batería",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUVENIL",
    "age": 14,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 261.4,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_8@vibramusic.pe",
    "phone": "977783340",
    "emergencyContact": {
      "name": "Anton Rodriguez, Anthony",
      "phone": "977783340",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Mayo",
    "planType": "Trimestral",
    "planPrice": 261.4,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-10-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-10",
    "rawMontoText": "261.4",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "261.4",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-9",
    "name": "Anton, Uriel",
    "family": "Familia Anton",
    "instrument": "Batería",
    "level": "Nivel 1",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 10,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 261.4,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_9@vibramusic.pe",
    "phone": "977783340",
    "emergencyContact": {
      "name": "Anton Rodriguez, Anthony",
      "phone": "977783340",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Marzo",
    "planType": "Trimestral",
    "planPrice": 261.4,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-10-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-10",
    "rawMontoText": "261.4",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "261.4",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-10",
    "name": "Bellido Alvan, Mia Lucero",
    "family": "Familia Bellido Alvan",
    "instrument": "Canto",
    "level": "Nivel 1",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 8,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_10@vibramusic.pe",
    "phone": "934106343",
    "emergencyContact": {
      "name": "Alvan Souza, Luz Elena",
      "phone": "934106343",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-11",
    "name": "Chapi, Eitan Anton",
    "family": "Familia Chapi",
    "instrument": "Piano",
    "level": "Nivel 2",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 12,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 261.4,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Blog Beneficios",
    "email": "alumno_11@vibramusic.pe",
    "phone": "977783340",
    "emergencyContact": {
      "name": "Anton Rodriguez, Anthony",
      "phone": "977783340",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Junio",
    "planType": "Trimestral",
    "planPrice": 261.4,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-10-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-10",
    "rawMontoText": "261.4",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "261.4",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-12",
    "name": "De La Cruz Huapaya, Romina Nathaly",
    "family": "Familia De La Cruz Huapaya",
    "instrument": "Guitarra clásica",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "baja",
    "ageCategory": "JUVENIL",
    "age": 14,
    "attendanceRate": 75,
    "payment": "pendiente",
    "risk": 85,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 0,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Blog Beneficios",
    "email": "alumno_12@vibramusic.pe",
    "phone": "956249085",
    "emergencyContact": {
      "name": "Huapaya Cuzcano, Jessica Nadia",
      "phone": "956249085",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Diciembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pendiente",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-13",
    "name": "Sofía Valentina Conde",
    "family": "Familia Valentina Conde",
    "instrument": "Canto",
    "level": "Nivel 1",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 9,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_13@vibramusic.pe",
    "phone": "996087235",
    "emergencyContact": {
      "name": "Aniceto Conde Galindo",
      "phone": "996087235",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Abril",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-14",
    "name": "Ethan Paolo Jara Saldarriaga",
    "family": "Familia Jara Saldarriaga",
    "instrument": "Piano Infantil",
    "level": "Iniciación Musical",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "INFANTIL",
    "age": 6,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Valor con Video",
    "email": "alumno_14@vibramusic.pe",
    "phone": "984309257",
    "emergencyContact": {
      "name": "Cristian Paolo Jara Perea",
      "phone": "984309257",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Setiembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-15",
    "name": "Joshua Leon Gonzales",
    "family": "Familia Leon Gonzales",
    "instrument": "Guitarra clásica",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "ADULTO",
    "age": 25,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Blog Beneficios",
    "email": "alumno_15@vibramusic.pe",
    "phone": "918148199",
    "emergencyContact": {
      "name": "Soledad Gonzales Castro",
      "phone": "918148199",
      "relation": "Titular Directo"
    },
    "birthdate": "15 de Setiembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-16",
    "name": "Jhosua Ruben Meza Salome",
    "family": "Familia Meza Salome",
    "instrument": "Guitarra clásica",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "baja",
    "ageCategory": "JUVENIL",
    "age": 13,
    "attendanceRate": 75,
    "payment": "pendiente",
    "risk": 85,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 0,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Blog Beneficios",
    "email": "alumno_16@vibramusic.pe",
    "phone": "934715287",
    "emergencyContact": {
      "name": "Alida Salomé Huali",
      "phone": "934715287",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Junio",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pendiente",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-17",
    "name": "Miguel Angel Miranda Aquino",
    "family": "Familia Miranda Aquino",
    "instrument": "Piano",
    "level": "Nivel 2",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "ADULTO",
    "age": 19,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Blog Beneficios",
    "email": "alumno_17@vibramusic.pe",
    "phone": "962039082",
    "emergencyContact": {
      "name": "Adela Aquino Suarez",
      "phone": "962039082",
      "relation": "Titular Directo"
    },
    "birthdate": "15 de Diciembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-18",
    "name": "Juan Mateo Azael Pariona Pumahuillca",
    "family": "Familia Pariona Pumahuillca",
    "instrument": "Canto",
    "level": "Nivel 2",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 12,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_18@vibramusic.pe",
    "phone": "989726595",
    "emergencyContact": {
      "name": "Erika Pumahuillca Ppacco",
      "phone": "989726595",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Noviembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-19",
    "name": "Liam Jesús Sanches Sanchez",
    "family": "Familia Sanches Sanchez",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 10,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Blog Beneficios",
    "email": "alumno_19@vibramusic.pe",
    "phone": "924265315",
    "emergencyContact": {
      "name": "Paola Karina Sanchez Arata",
      "phone": "924265315",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Julio",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-20",
    "name": "Yamir Suarez Salazar",
    "family": "Familia Suarez Salazar",
    "instrument": "Guitarra clásica",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUVENIL",
    "age": 17,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Blog Beneficios",
    "email": "alumno_20@vibramusic.pe",
    "phone": "985501740",
    "emergencyContact": {
      "name": "Gustavo Salazar Paucar",
      "phone": "985501740",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-21",
    "name": "Stefano Yrco Samaniego",
    "family": "Familia Yrco Samaniego",
    "instrument": "Batería",
    "level": "Nivel 1",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 7,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_21@vibramusic.pe",
    "phone": "902211277",
    "emergencyContact": {
      "name": "Milagros Samaniego Castro",
      "phone": "902211277",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Setiembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-22",
    "name": "Irribarren Paz, Francesco",
    "family": "Familia Irribarren Paz",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 10,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Blog Beneficios",
    "email": "alumno_22@vibramusic.pe",
    "phone": "916704270",
    "emergencyContact": {
      "name": "Paz Bazan, Francesca",
      "phone": "916704270",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Diciembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-23",
    "name": "Castillo Bueno, Mathew",
    "family": "Familia Castillo Bueno",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 9,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Blog Beneficios",
    "email": "alumno_23@vibramusic.pe",
    "phone": "932133618",
    "emergencyContact": {
      "name": "Bueno, Leyla",
      "phone": "932133618",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Octubre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-24",
    "name": "Pineda Espinoza, Alonso",
    "family": "Familia Pineda Espinoza",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "baja",
    "ageCategory": "JUNIOR",
    "age": 7,
    "attendanceRate": 75,
    "payment": "pendiente",
    "risk": 85,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 0,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Blog Beneficios",
    "email": "alumno_24@vibramusic.pe",
    "phone": "984384180",
    "emergencyContact": {
      "name": "Espinoza Merma, Nelida",
      "phone": "984384180",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Enero",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pendiente",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-25",
    "name": "Moscoso Valentin, Yuriana",
    "family": "Familia Moscoso Valentin",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "baja",
    "ageCategory": "JUNIOR",
    "age": 7,
    "attendanceRate": 75,
    "payment": "pendiente",
    "risk": 85,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 0,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Blog Beneficios",
    "email": "alumno_25@vibramusic.pe",
    "phone": "904781203",
    "emergencyContact": {
      "name": "Valentin Ricaldi, Pierina",
      "phone": "904781203",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Trimestral",
    "planPrice": 261.4,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-10-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-10",
    "rawMontoText": "261.4",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pendiente",
        "rawText": "261.4",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-26",
    "name": "Valladolid Sanchez, Santiago Mathias",
    "family": "Familia Valladolid Sanchez",
    "instrument": "Batería",
    "level": "Nivel 1",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 8,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_26@vibramusic.pe",
    "phone": "987921575",
    "emergencyContact": {
      "name": "Valladolid Ayala, Santiago Joel",
      "phone": "987921575",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Julio",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-27",
    "name": "Verástegui Picón, Krizia Verónica",
    "family": "Familia Verástegui Picón",
    "instrument": "Guitarra clásica",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUVENIL",
    "age": 13,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 261.4,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Blog Beneficios",
    "email": "alumno_27@vibramusic.pe",
    "phone": "941482574",
    "emergencyContact": {
      "name": "Picón de Verástegui, Laura Verónica",
      "phone": "941482574",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Febrero",
    "planType": "Trimestral",
    "planPrice": 261.4,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-10-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-10",
    "rawMontoText": "261.4",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "261.4",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-28",
    "name": "Verástegui Picón, Thiago Manuel",
    "family": "Familia Verástegui Picón",
    "instrument": "Piano",
    "level": "Nivel 2",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUVENIL",
    "age": 13,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 261.4,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Blog Beneficios",
    "email": "alumno_28@vibramusic.pe",
    "phone": "941482574",
    "emergencyContact": {
      "name": "Picón de Verástegui, Laura Verónica",
      "phone": "941482574",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Febrero",
    "planType": "Trimestral",
    "planPrice": 261.4,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-10-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-10",
    "rawMontoText": "261.4",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "261.4",
        "amountExpected": 261.4,
        "amountPaid": 261.4
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 261.4,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-29",
    "name": "Gonzales Cuba, Jose Angel",
    "family": "Familia Gonzales Cuba",
    "instrument": "Guitarra clásica",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "baja",
    "ageCategory": "ADULTO",
    "age": 21,
    "attendanceRate": 75,
    "payment": "pendiente",
    "risk": 85,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 0,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_29@vibramusic.pe",
    "phone": "992872645",
    "emergencyContact": {
      "name": "Gonzales Cuba, Jose Angel",
      "phone": "992872645",
      "relation": "Titular Directo"
    },
    "birthdate": "15 de Octubre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pendiente",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-30",
    "name": "Pérez Huamancha, Dylan",
    "family": "Familia Pérez Huamancha",
    "instrument": "Canto",
    "level": "Nivel 2",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "baja",
    "ageCategory": "JUNIOR",
    "age": 11,
    "attendanceRate": 75,
    "payment": "pendiente",
    "risk": 85,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 0,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_30@vibramusic.pe",
    "phone": "982119525",
    "emergencyContact": {
      "name": "Pérez Zamora, Joel",
      "phone": "982119525",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pendiente",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-31",
    "name": "Joan Paolo Rodriguez",
    "family": "Familia Paolo Rodriguez",
    "instrument": "Canto",
    "level": "Nivel 2",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "ADULTO",
    "age": 44,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_31@vibramusic.pe",
    "phone": "920085424",
    "emergencyContact": {
      "name": "Joan Paolo Rodriguez",
      "phone": "920085424",
      "relation": "Titular Directo"
    },
    "birthdate": "15 de Abril",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-32",
    "name": "Adonis Yeret,Tocas Vasquez",
    "family": "Familia Adonis Yeret",
    "instrument": "Piano",
    "level": "Nivel 2",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "ADULTO",
    "age": 20,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_32@vibramusic.pe",
    "phone": "994010377",
    "emergencyContact": {
      "name": "Rafael Tocas",
      "phone": "994010377",
      "relation": "Titular Directo"
    },
    "birthdate": "15 de Abril",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-33",
    "name": "Edward Rios de la Cruz",
    "family": "Familia la Cruz",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "baja",
    "ageCategory": "JUNIOR",
    "age": 8,
    "attendanceRate": 75,
    "payment": "pendiente",
    "risk": 85,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 0,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_33@vibramusic.pe",
    "phone": "987654321",
    "emergencyContact": {
      "name": "Familia la Cruz",
      "phone": "987654321",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pendiente",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-34",
    "name": "García Zuñiga, Celeste Elizabeth",
    "family": "Familia García Zuñiga",
    "instrument": "Canto",
    "level": "Nivel 2",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUVENIL",
    "age": 16,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "Valor con Video",
    "email": "alumno_34@vibramusic.pe",
    "phone": "968657514",
    "emergencyContact": {
      "name": "Zuñiga Fernandez Elizabeth",
      "phone": "968657514",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Octubre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-35",
    "name": "Matias Gabriel Quispe Vilcapoma",
    "family": "Familia Quispe Vilcapoma",
    "instrument": "Canto",
    "level": "Nivel 1",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 8,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_35@vibramusic.pe",
    "phone": "989625788",
    "emergencyContact": {
      "name": "Enma Vilcapoma Coaguila",
      "phone": "989625788",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-36",
    "name": "Luis Soto Soto",
    "family": "Familia Soto Soto",
    "instrument": "Guitarra clásica",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "ADULTO",
    "age": 25,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_36@vibramusic.pe",
    "phone": "918148199",
    "emergencyContact": {
      "name": "Diana Soto Serrano",
      "phone": "918148199",
      "relation": "Titular Directo"
    },
    "birthdate": "15 de Setiembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-37",
    "name": "Ivana Soto Soto",
    "family": "Familia Soto Soto",
    "instrument": "Piano Infantil",
    "level": "Nivel 1",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 8,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_37@vibramusic.pe",
    "phone": "946528367",
    "emergencyContact": {
      "name": "Diana Soto Serrano",
      "phone": "946528367",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-38",
    "name": "Llallahui Alvarado, Kenny Armando",
    "family": "Familia Llallahui Alvarado",
    "instrument": "Guitarra clásica",
    "level": "Nivel 1",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 8,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_38@vibramusic.pe",
    "phone": "977931974",
    "emergencyContact": {
      "name": "Andrea Alvarado Quintana",
      "phone": "977931974",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-39",
    "name": "Luciano Leonardo Franco Cabrera",
    "family": "Familia Franco Cabrera",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 8,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_39@vibramusic.pe",
    "phone": "987427289",
    "emergencyContact": {
      "name": "Nahomi Cabrera Gutierrez",
      "phone": "987427289",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-40",
    "name": "Emmanuel Rospigliosi Gonzales",
    "family": "Familia Rospigliosi Gonzales",
    "instrument": "Guitarra clásica",
    "level": "Nivel 1",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 10,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_40@vibramusic.pe",
    "phone": "940705701",
    "emergencyContact": {
      "name": "Lorena Gonzales Teves",
      "phone": "940705701",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Setiembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-41",
    "name": "Alexandra Maritza Rodríguez Guzmán",
    "family": "Familia Rodríguez Guzmán",
    "instrument": "Canto",
    "level": "Nivel 1",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "baja",
    "ageCategory": "JUNIOR",
    "age": 8,
    "attendanceRate": 75,
    "payment": "pendiente",
    "risk": 85,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 0,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_41@vibramusic.pe",
    "phone": "941305165",
    "emergencyContact": {
      "name": "Maritza Guzman Ayvar",
      "phone": "941305165",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pendiente",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-42",
    "name": "Sara Torres Leon",
    "family": "Familia Torres Leon",
    "instrument": "Canto",
    "level": "Nivel 2",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "ADULTO",
    "age": 49,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_42@vibramusic.pe",
    "phone": "912834887",
    "emergencyContact": {
      "name": "No aplica",
      "phone": "912834887",
      "relation": "Titular Directo"
    },
    "birthdate": "15 de Diciembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-43",
    "name": "Ethan Romero Manrique",
    "family": "Familia Romero Manrique",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 8,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_43@vibramusic.pe",
    "phone": "923786068",
    "emergencyContact": {
      "name": "Olga Manrique Medrano",
      "phone": "923786068",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Noviembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-44",
    "name": "Aithana Rivas Badajoz",
    "family": "Familia Rivas Badajoz",
    "instrument": "Piano Infantil",
    "level": "Nivel 1",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 8,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_44@vibramusic.pe",
    "phone": "977528878",
    "emergencyContact": {
      "name": "Jose Rivas",
      "phone": "977528878",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Julio",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-45",
    "name": "Yajaira Ayquipa",
    "family": "Familia Yajaira Ayquipa",
    "instrument": "Guitarra clásica",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "baja",
    "ageCategory": "JUNIOR",
    "age": 12,
    "attendanceRate": 75,
    "payment": "pendiente",
    "risk": 85,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 0,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_45@vibramusic.pe",
    "phone": "924868844",
    "emergencyContact": {
      "name": "Patricia Zae",
      "phone": "924868844",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Junio",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pendiente",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-46",
    "name": "Kiara Mariños Huachahuilca",
    "family": "Familia Mariños Huachahuilca",
    "instrument": "Canto",
    "level": "Nivel 2",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "ADULTO",
    "age": 18,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_46@vibramusic.pe",
    "phone": "951058318",
    "emergencyContact": {
      "name": "Huachuilca Flores, Olga Sandra",
      "phone": "951058318",
      "relation": "Titular Directo"
    },
    "birthdate": "15 de Junio",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-47",
    "name": "Zarate Alcarraz, Stephanie Abigail",
    "family": "Familia Zarate Alcarraz",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 8,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_47@vibramusic.pe",
    "phone": "970090351",
    "emergencyContact": {
      "name": "No Aplica",
      "phone": "970090351",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-48",
    "name": "Layla Mariapaula Florindez Alguilar",
    "family": "Familia Florindez Alguilar",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 8,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_48@vibramusic.pe",
    "phone": "934563643",
    "emergencyContact": {
      "name": "Aide Teresa Aguilar",
      "phone": "934563643",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Junio",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-49",
    "name": "Eithan David Florindez Alguilar",
    "family": "Familia Florindez Alguilar",
    "instrument": "Violín",
    "level": "Iniciación Musical",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "INFANTIL",
    "age": 6,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_49@vibramusic.pe",
    "phone": "934563643",
    "emergencyContact": {
      "name": "Aide Teresa Aguilar",
      "phone": "934563643",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Marzo",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-50",
    "name": "Juan Diego Flores",
    "family": "Familia Diego Flores",
    "instrument": "Guitarra clásica",
    "level": "Nivel 1",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "baja",
    "ageCategory": "JUNIOR",
    "age": 9,
    "attendanceRate": 75,
    "payment": "pendiente",
    "risk": 85,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 0,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_50@vibramusic.pe",
    "phone": "996288151",
    "emergencyContact": {
      "name": "Juan Flores",
      "phone": "996288151",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Enero",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pendiente",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-51",
    "name": "Ethan Romero Manrique",
    "family": "Familia Romero Manrique",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 8,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_51@vibramusic.pe",
    "phone": "923786068",
    "emergencyContact": {
      "name": "Olga Manrique Medrano",
      "phone": "923786068",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Noviembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-52",
    "name": "Francezca Esther",
    "family": "Familia Francezca Esther",
    "instrument": "Piano Infantil",
    "level": "Iniciación Musical",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "INFANTIL",
    "age": 5,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_52@vibramusic.pe",
    "phone": "987654321",
    "emergencyContact": {
      "name": "Juan Aylas",
      "phone": "987654321",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Abril",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-53",
    "name": "Bruno Marcelo Juan de Dios",
    "family": "Familia de Dios",
    "instrument": "Guitarra clásica",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUVENIL",
    "age": 17,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_53@vibramusic.pe",
    "phone": "995954060",
    "emergencyContact": {
      "name": "Peter Marcelo Romero",
      "phone": "995954060",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Enero",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-54",
    "name": "Boris Axel Marcelo Juan de Dios",
    "family": "Familia de Dios",
    "instrument": "Piano",
    "level": "Nivel 2",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUVENIL",
    "age": 14,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_54@vibramusic.pe",
    "phone": "995954060",
    "emergencyContact": {
      "name": "Peter Marcelo Romero",
      "phone": "995954060",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Mayo",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-55",
    "name": "Antonella Osorio Huaman",
    "family": "Familia Osorio Huaman",
    "instrument": "Piano",
    "level": "Nivel 2",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 11,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_55@vibramusic.pe",
    "phone": "969065775",
    "emergencyContact": {
      "name": "Milagros Huaman",
      "phone": "969065775",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Julio",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-56",
    "name": "Liliana Mandujano",
    "family": "Familia Liliana Mandujano",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 8,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_56@vibramusic.pe",
    "phone": "928570603",
    "emergencyContact": {
      "name": "No aplica",
      "phone": "928570603",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-57",
    "name": "Micaela Sofia Vilchez",
    "family": "Familia Sofia Vilchez",
    "instrument": "Guitarra clásica",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 11,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_57@vibramusic.pe",
    "phone": "952324832",
    "emergencyContact": {
      "name": "Jessica Oroncoy",
      "phone": "952324832",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Junio",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-58",
    "name": "Carlos Carhuachin",
    "family": "Familia Carlos Carhuachin",
    "instrument": "Violín",
    "level": "Nivel 2",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "baja",
    "ageCategory": "JUNIOR",
    "age": 12,
    "attendanceRate": 75,
    "payment": "pendiente",
    "risk": 85,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 0,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_58@vibramusic.pe",
    "phone": "991279213",
    "emergencyContact": {
      "name": "Karin Sahuarcura",
      "phone": "991279213",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Mayo",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pendiente",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-59",
    "name": "Samantha Castillo",
    "family": "Familia Samantha Castillo",
    "instrument": "Violín",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 8,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_59@vibramusic.pe",
    "phone": "960580399",
    "emergencyContact": {
      "name": "Lucy Verónica",
      "phone": "960580399",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-60",
    "name": "Niah Jimena Montalvo Huerta",
    "family": "Familia Montalvo Huerta",
    "instrument": "Piano Infantil",
    "level": "Iniciación Musical",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 4,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_60@vibramusic.pe",
    "phone": "935993601",
    "emergencyContact": {
      "name": "Elizabeth Huerta",
      "phone": "935993601",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Noviembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-61",
    "name": "Carolina Luna Tito",
    "family": "Familia Luna Tito",
    "instrument": "Guitarra clásica",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "ADULTO",
    "age": 38,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_61@vibramusic.pe",
    "phone": "936370723",
    "emergencyContact": {
      "name": "No aplica",
      "phone": "936370723",
      "relation": "Titular Directo"
    },
    "birthdate": "15 de Noviembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-62",
    "name": "Flavia Nicole Concepcion",
    "family": "Familia Nicole Concepcion",
    "instrument": "Piano",
    "level": "Nivel 2",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 12,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_62@vibramusic.pe",
    "phone": "933125352",
    "emergencyContact": {
      "name": "Felipe Concepción",
      "phone": "933125352",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Julio",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-63",
    "name": "Fabiana Arroyo Tineo",
    "family": "Familia Arroyo Tineo",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 9,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_63@vibramusic.pe",
    "phone": "966716051",
    "emergencyContact": {
      "name": "Juana Tineo",
      "phone": "966716051",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-64",
    "name": "Thaisa Lucero Dyarce Cruz",
    "family": "Familia Dyarce Cruz",
    "instrument": "Batería",
    "level": "Nivel 1",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 9,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_64@vibramusic.pe",
    "phone": "989708032",
    "emergencyContact": {
      "name": "Magaly Cruz",
      "phone": "989708032",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Febrero",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-65",
    "name": "Valerie Yidda Angulo",
    "family": "Familia Yidda Angulo",
    "instrument": "Violín",
    "level": "Nivel 2",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 11,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_65@vibramusic.pe",
    "phone": "934164251",
    "emergencyContact": {
      "name": "Joselyn Chipana Regalado",
      "phone": "934164251",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Enero",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-66",
    "name": "Sofía De la Cruz Vellaneda",
    "family": "Familia Cruz Vellaneda",
    "instrument": "Violín",
    "level": "Nivel 2",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "ADULTO",
    "age": 19,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_66@vibramusic.pe",
    "phone": "987584730",
    "emergencyContact": {
      "name": "No aplica",
      "phone": "987584730",
      "relation": "Titular Directo"
    },
    "birthdate": "15 de Diciembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-67",
    "name": "Antonela Diaz Sanchez",
    "family": "Familia Diaz Sanchez",
    "instrument": "Canto",
    "level": "Nivel 2",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "ADULTO",
    "age": 22,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_67@vibramusic.pe",
    "phone": "923080434",
    "emergencyContact": {
      "name": "No aplica",
      "phone": "923080434",
      "relation": "Titular Directo"
    },
    "birthdate": "15 de Junio",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-68",
    "name": "Sara Xiamena Ortiz Vivas",
    "family": "Familia Ortiz Vivas",
    "instrument": "Guitarra clásica",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUVENIL",
    "age": 16,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_68@vibramusic.pe",
    "phone": "923785176",
    "emergencyContact": {
      "name": "Rosio del Pilar Vivas",
      "phone": "923785176",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-69",
    "name": "Camila Valentina Pastor Conco",
    "family": "Familia Pastor Conco",
    "instrument": "Violín",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 10,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_69@vibramusic.pe",
    "phone": "910875526",
    "emergencyContact": {
      "name": "Olivia Norma Conco",
      "phone": "910875526",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Febrero",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-70",
    "name": "Asaf Chipana Urribarri",
    "family": "Familia Chipana Urribarri",
    "instrument": "Batería",
    "level": "Nivel 1",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 7,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_70@vibramusic.pe",
    "phone": "987404984",
    "emergencyContact": {
      "name": "Ruth Urribarri",
      "phone": "987404984",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Mayo",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-71",
    "name": "Liam Huanca Huamantupa",
    "family": "Familia Huanca Huamantupa",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "baja",
    "ageCategory": "JUNIOR",
    "age": 9,
    "attendanceRate": 75,
    "payment": "pendiente",
    "risk": 85,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 0,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_71@vibramusic.pe",
    "phone": "969085167",
    "emergencyContact": {
      "name": "Margot Huamantupa",
      "phone": "969085167",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Noviembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pendiente",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-72",
    "name": "Emma Sevilla Perez",
    "family": "Familia Sevilla Perez",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 7,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_72@vibramusic.pe",
    "phone": "986740292",
    "emergencyContact": {
      "name": "Sara Perez Mancilla",
      "phone": "986740292",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Abril",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-73",
    "name": "Aarón Balarezo Sosa",
    "family": "Familia Balarezo Sosa",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 10,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_73@vibramusic.pe",
    "phone": "920493604",
    "emergencyContact": {
      "name": "Kely Sosa Torres",
      "phone": "920493604",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Abril",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-74",
    "name": "Giusseppe Granda Suarez",
    "family": "Familia Granda Suarez",
    "instrument": "Batería",
    "level": "Nivel 1",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 8,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_74@vibramusic.pe",
    "phone": "940776497",
    "emergencyContact": {
      "name": "Celeste Suarez",
      "phone": "940776497",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-75",
    "name": "Mirko Malpartida",
    "family": "Familia Mirko Malpartida",
    "instrument": "Piano",
    "level": "Nivel 1",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 8,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_75@vibramusic.pe",
    "phone": "935188205",
    "emergencyContact": {
      "name": "no aplica",
      "phone": "935188205",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-76",
    "name": "Gael Mathias Lopez",
    "family": "Familia Mathias Lopez",
    "instrument": "Canto",
    "level": "Nivel 2",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUVENIL",
    "age": 17,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_76@vibramusic.pe",
    "phone": "925994271",
    "emergencyContact": {
      "name": "no aplica",
      "phone": "925994271",
      "relation": "Apoderado"
    },
    "birthdate": "15 de junio",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-77",
    "name": "Karen Gutierrez",
    "family": "Familia Karen Gutierrez",
    "instrument": "Canto",
    "level": "Nivel 2",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "ADULTO",
    "age": 38,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_77@vibramusic.pe",
    "phone": "923277024",
    "emergencyContact": {
      "name": "No aplica",
      "phone": "923277024",
      "relation": "Titular Directo"
    },
    "birthdate": "15 de Octubre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-78",
    "name": "Raphaela Yangali Polloac",
    "family": "Familia Yangali Polloac",
    "instrument": "Piano Infantil",
    "level": "Iniciación Musical",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUNIOR",
    "age": 4,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_78@vibramusic.pe",
    "phone": "962395849",
    "emergencyContact": {
      "name": "Maricruz Yangali",
      "phone": "962395849",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Setiembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-79",
    "name": "Isabelle Yangali Polloac",
    "family": "Familia Yangali Polloac",
    "instrument": "Piano Infantil",
    "level": "Iniciación Musical",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "INFANTIL",
    "age": 6,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_79@vibramusic.pe",
    "phone": "962395850",
    "emergencyContact": {
      "name": "Maricruz Yangali",
      "phone": "962395850",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Enero",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-80",
    "name": "Mishel Suarez Cardenas",
    "family": "Familia Suarez Cardenas",
    "instrument": "Guitarra clásica",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "baja",
    "ageCategory": "ADULTO",
    "age": 18,
    "attendanceRate": 75,
    "payment": "pendiente",
    "risk": 85,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 0,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_80@vibramusic.pe",
    "phone": "970855468",
    "emergencyContact": {
      "name": "Arnold  Suarez",
      "phone": "970855468",
      "relation": "Titular Directo"
    },
    "birthdate": "15 de Setiembre",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pendiente",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-81",
    "name": "Lireth Aguilar Alberca",
    "family": "Familia Aguilar Alberca",
    "instrument": "Canto",
    "level": "Nivel 2",
    "teacher": "Nathaly",
    "modality": "Regular (8 clases / 45 min)",
    "status": "baja",
    "ageCategory": "ADULTO",
    "age": 21,
    "attendanceRate": 75,
    "payment": "pendiente",
    "risk": 85,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 0,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_81@vibramusic.pe",
    "phone": "907479667",
    "emergencyContact": {
      "name": "Mercedes Alberca",
      "phone": "907479667",
      "relation": "Titular Directo"
    },
    "birthdate": "15 de Abril",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pendiente",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-82",
    "name": "Yasumi Cielo Chamorro Amasifuen",
    "family": "Familia Chamorro Amasifuen",
    "instrument": "Piano",
    "level": "Nivel 2",
    "teacher": "Fernando",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "JUVENIL",
    "age": 17,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_82@vibramusic.pe",
    "phone": "922781091",
    "emergencyContact": {
      "name": "Jenny Amasifuen",
      "phone": "922781091",
      "relation": "Apoderado"
    },
    "birthdate": "15 de Agosto",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  },
  {
    "id": "as-cp-83",
    "name": "Gustavo Tenorio",
    "family": "Familia Gustavo Tenorio",
    "instrument": "Guitarra clásica",
    "level": "Nivel 2",
    "teacher": "Jeremy",
    "modality": "Regular (8 clases / 45 min)",
    "status": "activo",
    "ageCategory": "ADULTO",
    "age": 54,
    "attendanceRate": 100,
    "payment": "al-dia",
    "risk": 15,
    "joinedAt": "Ago 2026",
    "makeupCredits": 0,
    "balance": 297,
    "recentAttendance": [
      "presente",
      "presente",
      "presente"
    ],
    "teacherNote": "",
    "email": "alumno_83@vibramusic.pe",
    "phone": "986933521",
    "emergencyContact": {
      "name": "No aplica",
      "phone": "986933521",
      "relation": "Titular Directo"
    },
    "birthdate": "15 de Febrero",
    "planType": "Mensual",
    "planPrice": 297,
    "matriculaType": "Promo Demo (S/ 30)",
    "packUtilesPaid": true,
    "planStartDate": "2026-08-01",
    "planEndDate": "2026-08-31",
    "planStartMonth": "2026-08",
    "planEndMonth": "2026-08",
    "rawMontoText": "297",
    "annualRecords": {
      "Enero": {
        "month": "Enero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Febrero": {
        "month": "Febrero",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Marzo": {
        "month": "Marzo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Abril": {
        "month": "Abril",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Mayo": {
        "month": "Mayo",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Junio": {
        "month": "Junio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Julio": {
        "month": "Julio",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Agosto": {
        "month": "Agosto",
        "status": "pagado",
        "rawText": "297",
        "amountExpected": 297,
        "amountPaid": 297
      },
      "Setiembre": {
        "month": "Setiembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Octubre": {
        "month": "Octubre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Noviembre": {
        "month": "Noviembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      },
      "Diciembre": {
        "month": "Diciembre",
        "status": "pendiente",
        "rawText": "",
        "amountExpected": 297,
        "amountPaid": 0
      }
    }
  }
];

export const officialControlPagosInvoices: Invoice[] = [
  {
    "id": "inv-cp-1",
    "family": "Familia Ticona Cachay",
    "student": "Ticona Cachay, Jonathan",
    "phone": "962386336",
    "concept": "Mensualidad Agosto 2026 (Canto)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-2",
    "family": "Familia Conislla Huerta",
    "student": "Conislla Huerta, Iker Samín",
    "phone": "994827408",
    "concept": "Mensualidad Agosto 2026 (Piano Infantil)",
    "amount": 261.4,
    "amountPaid": 261.4,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-3",
    "family": "Familia De La Cruz Pucyura",
    "student": "De La Cruz Pucyura, Carlomagno Tomas",
    "phone": "990621266",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-31",
    "status": "pendiente"
  },
  {
    "id": "inv-cp-4",
    "family": "Familia Sanchez Justa",
    "student": "Sanchez Justa, Johandry Henry",
    "phone": "900617145",
    "concept": "Mensualidad Agosto 2026 (Batería)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-5",
    "family": "Familia Meza Llallahui",
    "student": "Meza Llallahui, Andrea Fernanda",
    "phone": "930182010",
    "concept": "Mensualidad Agosto 2026 (Batería)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-6",
    "family": "Familia Huerta Mitma",
    "student": "Huerta Mitma, Juan Diego",
    "phone": "997549474",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-7",
    "family": "Familia Álvares Galarreta",
    "student": "Álvares Galarreta, Gabriel Fabiano",
    "phone": "975687085",
    "concept": "Mensualidad Agosto 2026 (Batería)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-8",
    "family": "Familia Anton",
    "student": "Anton, Junior Gabriel",
    "phone": "977783340",
    "concept": "Mensualidad Agosto 2026 (Batería)",
    "amount": 261.4,
    "amountPaid": 261.4,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-9",
    "family": "Familia Anton",
    "student": "Anton, Uriel",
    "phone": "977783340",
    "concept": "Mensualidad Agosto 2026 (Batería)",
    "amount": 261.4,
    "amountPaid": 261.4,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-10",
    "family": "Familia Bellido Alvan",
    "student": "Bellido Alvan, Mia Lucero",
    "phone": "934106343",
    "concept": "Mensualidad Agosto 2026 (Canto)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-11",
    "family": "Familia Chapi",
    "student": "Chapi, Eitan Anton",
    "phone": "977783340",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 261.4,
    "amountPaid": 261.4,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-12",
    "family": "Familia De La Cruz Huapaya",
    "student": "De La Cruz Huapaya, Romina Nathaly",
    "phone": "956249085",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-31",
    "status": "pendiente"
  },
  {
    "id": "inv-cp-13",
    "family": "Familia Valentina Conde",
    "student": "Sofía Valentina Conde",
    "phone": "996087235",
    "concept": "Mensualidad Agosto 2026 (Canto)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-14",
    "family": "Familia Jara Saldarriaga",
    "student": "Ethan Paolo Jara Saldarriaga",
    "phone": "984309257",
    "concept": "Mensualidad Agosto 2026 (Piano Infantil)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-15",
    "family": "Familia Leon Gonzales",
    "student": "Joshua Leon Gonzales",
    "phone": "918148199",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-16",
    "family": "Familia Meza Salome",
    "student": "Jhosua Ruben Meza Salome",
    "phone": "934715287",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-31",
    "status": "pendiente"
  },
  {
    "id": "inv-cp-17",
    "family": "Familia Miranda Aquino",
    "student": "Miguel Angel Miranda Aquino",
    "phone": "962039082",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-18",
    "family": "Familia Pariona Pumahuillca",
    "student": "Juan Mateo Azael Pariona Pumahuillca",
    "phone": "989726595",
    "concept": "Mensualidad Agosto 2026 (Canto)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-19",
    "family": "Familia Sanches Sanchez",
    "student": "Liam Jesús Sanches Sanchez",
    "phone": "924265315",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-20",
    "family": "Familia Suarez Salazar",
    "student": "Yamir Suarez Salazar",
    "phone": "985501740",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-21",
    "family": "Familia Yrco Samaniego",
    "student": "Stefano Yrco Samaniego",
    "phone": "902211277",
    "concept": "Mensualidad Agosto 2026 (Batería)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-22",
    "family": "Familia Irribarren Paz",
    "student": "Irribarren Paz, Francesco",
    "phone": "916704270",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-23",
    "family": "Familia Castillo Bueno",
    "student": "Castillo Bueno, Mathew",
    "phone": "932133618",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-24",
    "family": "Familia Pineda Espinoza",
    "student": "Pineda Espinoza, Alonso",
    "phone": "984384180",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-31",
    "status": "pendiente"
  },
  {
    "id": "inv-cp-25",
    "family": "Familia Moscoso Valentin",
    "student": "Moscoso Valentin, Yuriana",
    "phone": "904781203",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 261.4,
    "amountPaid": 0,
    "remainingBalance": 261.4,
    "dueDate": "2026-08-31",
    "status": "pendiente"
  },
  {
    "id": "inv-cp-26",
    "family": "Familia Valladolid Sanchez",
    "student": "Valladolid Sanchez, Santiago Mathias",
    "phone": "987921575",
    "concept": "Mensualidad Agosto 2026 (Batería)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-27",
    "family": "Familia Verástegui Picón",
    "student": "Verástegui Picón, Krizia Verónica",
    "phone": "941482574",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 261.4,
    "amountPaid": 261.4,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-28",
    "family": "Familia Verástegui Picón",
    "student": "Verástegui Picón, Thiago Manuel",
    "phone": "941482574",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 261.4,
    "amountPaid": 261.4,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-29",
    "family": "Familia Gonzales Cuba",
    "student": "Gonzales Cuba, Jose Angel",
    "phone": "992872645",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-31",
    "status": "pendiente"
  },
  {
    "id": "inv-cp-30",
    "family": "Familia Pérez Huamancha",
    "student": "Pérez Huamancha, Dylan",
    "phone": "982119525",
    "concept": "Mensualidad Agosto 2026 (Canto)",
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-31",
    "status": "pendiente"
  },
  {
    "id": "inv-cp-31",
    "family": "Familia Paolo Rodriguez",
    "student": "Joan Paolo Rodriguez",
    "phone": "920085424",
    "concept": "Mensualidad Agosto 2026 (Canto)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-32",
    "family": "Familia Adonis Yeret",
    "student": "Adonis Yeret,Tocas Vasquez",
    "phone": "994010377",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-33",
    "family": "Familia la Cruz",
    "student": "Edward Rios de la Cruz",
    "phone": "987654321",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-31",
    "status": "pendiente"
  },
  {
    "id": "inv-cp-34",
    "family": "Familia García Zuñiga",
    "student": "García Zuñiga, Celeste Elizabeth",
    "phone": "968657514",
    "concept": "Mensualidad Agosto 2026 (Canto)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-35",
    "family": "Familia Quispe Vilcapoma",
    "student": "Matias Gabriel Quispe Vilcapoma",
    "phone": "989625788",
    "concept": "Mensualidad Agosto 2026 (Canto)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-36",
    "family": "Familia Soto Soto",
    "student": "Luis Soto Soto",
    "phone": "918148199",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-37",
    "family": "Familia Soto Soto",
    "student": "Ivana Soto Soto",
    "phone": "946528367",
    "concept": "Mensualidad Agosto 2026 (Piano Infantil)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-38",
    "family": "Familia Llallahui Alvarado",
    "student": "Llallahui Alvarado, Kenny Armando",
    "phone": "977931974",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-39",
    "family": "Familia Franco Cabrera",
    "student": "Luciano Leonardo Franco Cabrera",
    "phone": "987427289",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-40",
    "family": "Familia Rospigliosi Gonzales",
    "student": "Emmanuel Rospigliosi Gonzales",
    "phone": "940705701",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-41",
    "family": "Familia Rodríguez Guzmán",
    "student": "Alexandra Maritza Rodríguez Guzmán",
    "phone": "941305165",
    "concept": "Mensualidad Agosto 2026 (Canto)",
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-31",
    "status": "pendiente"
  },
  {
    "id": "inv-cp-42",
    "family": "Familia Torres Leon",
    "student": "Sara Torres Leon",
    "phone": "912834887",
    "concept": "Mensualidad Agosto 2026 (Canto)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-43",
    "family": "Familia Romero Manrique",
    "student": "Ethan Romero Manrique",
    "phone": "923786068",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-44",
    "family": "Familia Rivas Badajoz",
    "student": "Aithana Rivas Badajoz",
    "phone": "977528878",
    "concept": "Mensualidad Agosto 2026 (Piano Infantil)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-45",
    "family": "Familia Yajaira Ayquipa",
    "student": "Yajaira Ayquipa",
    "phone": "924868844",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-31",
    "status": "pendiente"
  },
  {
    "id": "inv-cp-46",
    "family": "Familia Mariños Huachahuilca",
    "student": "Kiara Mariños Huachahuilca",
    "phone": "951058318",
    "concept": "Mensualidad Agosto 2026 (Canto)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-47",
    "family": "Familia Zarate Alcarraz",
    "student": "Zarate Alcarraz, Stephanie Abigail",
    "phone": "970090351",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-48",
    "family": "Familia Florindez Alguilar",
    "student": "Layla Mariapaula Florindez Alguilar",
    "phone": "934563643",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-49",
    "family": "Familia Florindez Alguilar",
    "student": "Eithan David Florindez Alguilar",
    "phone": "934563643",
    "concept": "Mensualidad Agosto 2026 (Violín)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-50",
    "family": "Familia Diego Flores",
    "student": "Juan Diego Flores",
    "phone": "996288151",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-31",
    "status": "pendiente"
  },
  {
    "id": "inv-cp-51",
    "family": "Familia Romero Manrique",
    "student": "Ethan Romero Manrique",
    "phone": "923786068",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-52",
    "family": "Familia Francezca Esther",
    "student": "Francezca Esther",
    "phone": "987654321",
    "concept": "Mensualidad Agosto 2026 (Piano Infantil)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-53",
    "family": "Familia de Dios",
    "student": "Bruno Marcelo Juan de Dios",
    "phone": "995954060",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-54",
    "family": "Familia de Dios",
    "student": "Boris Axel Marcelo Juan de Dios",
    "phone": "995954060",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-55",
    "family": "Familia Osorio Huaman",
    "student": "Antonella Osorio Huaman",
    "phone": "969065775",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-56",
    "family": "Familia Liliana Mandujano",
    "student": "Liliana Mandujano",
    "phone": "928570603",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-57",
    "family": "Familia Sofia Vilchez",
    "student": "Micaela Sofia Vilchez",
    "phone": "952324832",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-58",
    "family": "Familia Carlos Carhuachin",
    "student": "Carlos Carhuachin",
    "phone": "991279213",
    "concept": "Mensualidad Agosto 2026 (Violín)",
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-31",
    "status": "pendiente"
  },
  {
    "id": "inv-cp-59",
    "family": "Familia Samantha Castillo",
    "student": "Samantha Castillo",
    "phone": "960580399",
    "concept": "Mensualidad Agosto 2026 (Violín)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-60",
    "family": "Familia Montalvo Huerta",
    "student": "Niah Jimena Montalvo Huerta",
    "phone": "935993601",
    "concept": "Mensualidad Agosto 2026 (Piano Infantil)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-61",
    "family": "Familia Luna Tito",
    "student": "Carolina Luna Tito",
    "phone": "936370723",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-62",
    "family": "Familia Nicole Concepcion",
    "student": "Flavia Nicole Concepcion",
    "phone": "933125352",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-63",
    "family": "Familia Arroyo Tineo",
    "student": "Fabiana Arroyo Tineo",
    "phone": "966716051",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-64",
    "family": "Familia Dyarce Cruz",
    "student": "Thaisa Lucero Dyarce Cruz",
    "phone": "989708032",
    "concept": "Mensualidad Agosto 2026 (Batería)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-65",
    "family": "Familia Yidda Angulo",
    "student": "Valerie Yidda Angulo",
    "phone": "934164251",
    "concept": "Mensualidad Agosto 2026 (Violín)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-66",
    "family": "Familia Cruz Vellaneda",
    "student": "Sofía De la Cruz Vellaneda",
    "phone": "987584730",
    "concept": "Mensualidad Agosto 2026 (Violín)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-67",
    "family": "Familia Diaz Sanchez",
    "student": "Antonela Diaz Sanchez",
    "phone": "923080434",
    "concept": "Mensualidad Agosto 2026 (Canto)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-68",
    "family": "Familia Ortiz Vivas",
    "student": "Sara Xiamena Ortiz Vivas",
    "phone": "923785176",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-69",
    "family": "Familia Pastor Conco",
    "student": "Camila Valentina Pastor Conco",
    "phone": "910875526",
    "concept": "Mensualidad Agosto 2026 (Violín)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-70",
    "family": "Familia Chipana Urribarri",
    "student": "Asaf Chipana Urribarri",
    "phone": "987404984",
    "concept": "Mensualidad Agosto 2026 (Batería)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-71",
    "family": "Familia Huanca Huamantupa",
    "student": "Liam Huanca Huamantupa",
    "phone": "969085167",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-31",
    "status": "pendiente"
  },
  {
    "id": "inv-cp-72",
    "family": "Familia Sevilla Perez",
    "student": "Emma Sevilla Perez",
    "phone": "986740292",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-73",
    "family": "Familia Balarezo Sosa",
    "student": "Aarón Balarezo Sosa",
    "phone": "920493604",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-74",
    "family": "Familia Granda Suarez",
    "student": "Giusseppe Granda Suarez",
    "phone": "940776497",
    "concept": "Mensualidad Agosto 2026 (Batería)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-75",
    "family": "Familia Mirko Malpartida",
    "student": "Mirko Malpartida",
    "phone": "935188205",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-76",
    "family": "Familia Mathias Lopez",
    "student": "Gael Mathias Lopez",
    "phone": "925994271",
    "concept": "Mensualidad Agosto 2026 (Canto)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-77",
    "family": "Familia Karen Gutierrez",
    "student": "Karen Gutierrez",
    "phone": "923277024",
    "concept": "Mensualidad Agosto 2026 (Canto)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-78",
    "family": "Familia Yangali Polloac",
    "student": "Raphaela Yangali Polloac",
    "phone": "962395849",
    "concept": "Mensualidad Agosto 2026 (Piano Infantil)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-79",
    "family": "Familia Yangali Polloac",
    "student": "Isabelle Yangali Polloac",
    "phone": "962395850",
    "concept": "Mensualidad Agosto 2026 (Piano Infantil)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-80",
    "family": "Familia Suarez Cardenas",
    "student": "Mishel Suarez Cardenas",
    "phone": "970855468",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-31",
    "status": "pendiente"
  },
  {
    "id": "inv-cp-81",
    "family": "Familia Aguilar Alberca",
    "student": "Lireth Aguilar Alberca",
    "phone": "907479667",
    "concept": "Mensualidad Agosto 2026 (Canto)",
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-31",
    "status": "pendiente"
  },
  {
    "id": "inv-cp-82",
    "family": "Familia Chamorro Amasifuen",
    "student": "Yasumi Cielo Chamorro Amasifuen",
    "phone": "922781091",
    "concept": "Mensualidad Agosto 2026 (Piano)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  },
  {
    "id": "inv-cp-83",
    "family": "Familia Gustavo Tenorio",
    "student": "Gustavo Tenorio",
    "phone": "986933521",
    "concept": "Mensualidad Agosto 2026 (Guitarra clásica)",
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-31",
    "status": "pagado",
    "paymentMethod": "Yape"
  }
];
