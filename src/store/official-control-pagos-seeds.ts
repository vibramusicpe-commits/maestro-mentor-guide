// ===== Datos Semilla Oficiales Generados desde Control_Pagos_Estructurado.csv y Segmentación de Clientes =====
// Registro Anual Completo 2026 (Enero a Diciembre) con CELULARES REALES para envío 1-clic por WhatsApp
import type { AdminStudent, Invoice, AnnualMonthRecord, VibraPlanType, MatriculaType, PaymentMethod, PaymentStatus, InvoiceStatus } from "./admin-seeds";

export interface ControlPagosStudentWithAnnual extends AdminStudent {
  annualRecords: Record<string, AnnualMonthRecord>;
  rawMontoText: string;
}

export const officialControlPagosStudents: ControlPagosStudentWithAnnual[] = [
  {
  "id": "as-cp-1",
  "name": "Sanchez Justa, Johandry Henry",
  "family": "Familia Sanchez Justa",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "vencido",
  "risk": 75,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 297,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "pagó 200 falta 97 mas la mensualidad de agosto",
  "email": "alumno_1@vibramusic.pe",
  "phone": "984100000",
  "emergencyContact": {
    "name": "Familia Sanchez Justa",
    "phone": "984100000",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "parcial",
      "rawText": "200",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "deudor",
      "rawText": "DEUDOR",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-2",
  "name": "Gonzales Cuba, Jose Angel",
  "family": "Familia Gonzales Cuba",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "197.00 ( JUNIO Y JULIO)",
  "email": "alumno_2@vibramusic.pe",
  "phone": "992872645",
  "emergencyContact": {
    "name": "Familia Gonzales Cuba",
    "phone": "992872645",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 197,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-01",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "197.00 ( JUNIO Y JULIO)",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "YA PAGO JUNIO",
      "amountExpected": 197,
      "amountPaid": 197
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 197,
      "amountPaid": 197
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-3",
  "name": "Rodríguez Guzmán, Alexandra Maritza",
  "family": "Familia Rodríguez Guzmán",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "vencido",
  "risk": 75,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 297,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Recien en julio en adelante pagara (nueva)",
  "email": "alumno_3@vibramusic.pe",
  "phone": "941305165",
  "emergencyContact": {
    "name": "Familia Rodríguez Guzmán",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "YA PAGO JUNIO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "deudor",
      "rawText": "DEUDOR",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-4",
  "name": "Franco Cabrera, Luciano Leonardo",
  "family": "Familia Franco Cabrera",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_4@vibramusic.pe",
  "phone": "987427289",
  "emergencyContact": {
    "name": "Familia Franco Cabrera",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-5",
  "name": "Conislla Huerta, Iker Samín",
  "family": "Familia Conislla Huerta",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_5@vibramusic.pe",
  "phone": "994827408",
  "emergencyContact": {
    "name": "Familia Conislla Huerta",
    "phone": "994827408",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 252,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-01",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "252",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 252,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 252,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 252,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 252,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 252,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 252,
      "amountPaid": 252
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 252,
      "amountPaid": 252
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 252,
      "amountPaid": 252
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 252,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 252,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 252,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 252,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-6",
  "name": "Malpartina Ramos, Mateo Salvador",
  "family": "Familia Malpartina Ramos",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "vencido",
  "risk": 75,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 297,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "viene sábado 15/08",
  "email": "alumno_6@vibramusic.pe",
  "phone": "910180362",
  "emergencyContact": {
    "name": "Familia Malpartina Ramos",
    "phone": "910180362",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "deudor",
      "rawText": "DEUDOR",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-7",
  "name": "Yajaira Ayquipa",
  "family": "Familia Yajaira Ayquipa",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "vencido",
  "risk": 75,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 297,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "no contesta",
  "email": "alumno_7@vibramusic.pe",
  "phone": "924868844",
  "emergencyContact": {
    "name": "Familia Yajaira Ayquipa",
    "phone": "924868844",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "deudor",
      "rawText": "DEUDOR",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-8",
  "name": "Guastavo Zuñiga Quispe",
  "family": "Familia Guastavo Zuñiga Quispe",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "vencido",
  "risk": 75,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 297,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Nuevo - Pendiente pago del mes junio. Se cobra automático",
  "email": "alumno_8@vibramusic.pe",
  "phone": "984100049",
  "emergencyContact": {
    "name": "Familia Guastavo Zuñiga Quispe",
    "phone": "984100049",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "deudor",
      "rawText": "DEUDOR",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-9",
  "name": "Francezca Esther Aylas Naupari",
  "family": "Familia Francezca Esther Aylas Naupari",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Se cobra automático (revisar ingresos)",
  "email": "alumno_9@vibramusic.pe",
  "phone": "984100056",
  "emergencyContact": {
    "name": "Familia Francezca Esther Aylas Naupari",
    "phone": "984100056",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-10",
  "name": "Bruno Marcelo Juan de Dios y Boris Marcelo Juan de Dios",
  "family": "Familia Bruno Marcelo Juan de Dios y Boris Marcelo Juan de Dios",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Nuevo se le cobra 1 de agosto",
  "email": "alumno_10@vibramusic.pe",
  "phone": "997549474",
  "emergencyContact": {
    "name": "Familia Bruno Marcelo Juan de Dios y Boris Marcelo Juan de Dios",
    "phone": "997549474",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Trimestral",
  "planPrice": 522,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-01",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "522",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 522,
      "amountPaid": 522
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 522,
      "amountPaid": 522
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-11",
  "name": "Leonardo Villacorta",
  "family": "Familia Leonardo Villacorta",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "vencido",
  "risk": 75,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 297,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_11@vibramusic.pe",
  "phone": "933520330",
  "emergencyContact": {
    "name": "Familia Leonardo Villacorta",
    "phone": "933520330",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "deudor",
      "rawText": "DEUDOR",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-12",
  "name": "Antonella Osorio Huaman",
  "family": "Familia Antonella Osorio Huaman",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_12@vibramusic.pe",
  "phone": "969065775",
  "emergencyContact": {
    "name": "Familia Antonella Osorio Huaman",
    "phone": "969065775",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-13",
  "name": "Carlos Isaac Carhuachin",
  "family": "Familia Carlos Isaac Carhuachin",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "vencido",
  "risk": 75,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 297,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "nuevo",
  "email": "alumno_13@vibramusic.pe",
  "phone": "991279213",
  "emergencyContact": {
    "name": "Familia Carlos Isaac Carhuachin",
    "phone": "991279213",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "deudor",
      "rawText": "DEUDOR",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-14",
  "name": "Yrco Samaniego, Stefano",
  "family": "Familia Yrco Samaniego",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Pago el 5 de junio",
  "email": "alumno_14@vibramusic.pe",
  "phone": "902211277",
  "emergencyContact": {
    "name": "Familia Yrco Samaniego",
    "phone": "902211277",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-08",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-15",
  "name": "Soto Soto, Ivanna",
  "family": "Familia Soto Soto",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_15@vibramusic.pe",
  "phone": "953686972",
  "emergencyContact": {
    "name": "Familia Soto Soto",
    "phone": "953686972",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Trimestral",
  "planPrice": 522,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-08",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "522",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 522,
      "amountPaid": 522
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 522,
      "amountPaid": 522
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 522,
      "amountPaid": 522
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-16",
  "name": "Soto Soto, Ivanna + Luis Soto soto",
  "family": "Familia Soto Soto",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_16@vibramusic.pe",
  "phone": "953686972",
  "emergencyContact": {
    "name": "Familia Soto Soto",
    "phone": "953686972",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Trimestral",
  "planPrice": 522,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-03",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "522",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 522,
      "amountPaid": 522
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 522,
      "amountPaid": 522
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "PAGADO",
      "amountExpected": 522,
      "amountPaid": 522
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-17",
  "name": "Ethan Romero Manrique",
  "family": "Familia Ethan Romero Manrique",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "CANCELÓ POR 3 MESES",
  "email": "alumno_17@vibramusic.pe",
  "phone": "923786068",
  "emergencyContact": {
    "name": "Familia Ethan Romero Manrique",
    "phone": "923786068",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-03",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-18",
  "name": "Liliana Mandujano",
  "family": "Familia Liliana Mandujano",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Clase personalizada - se le cobra por clase",
  "email": "alumno_18@vibramusic.pe",
  "phone": "928570603",
  "emergencyContact": {
    "name": "Familia Liliana Mandujano",
    "phone": "928570603",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 50,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-01",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "50",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "personalizado",
      "rawText": "PERSONALIZADO",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-19",
  "name": "Meza Salome, Jhosua Ruben",
  "family": "Familia Meza Salome",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_19@vibramusic.pe",
  "phone": "934715287",
  "emergencyContact": {
    "name": "Familia Meza Salome",
    "phone": "934715287",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Trimestral",
  "planPrice": 397,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-04",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "397",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 397,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 397,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 397,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 397,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 397,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 397,
      "amountPaid": 397
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 397,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 397,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 397,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 397,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 397,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 397,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-20",
  "name": "Sanches Sanchez, Liam Jesús",
  "family": "Familia Sanches Sanchez",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_20@vibramusic.pe",
  "phone": "924265315",
  "emergencyContact": {
    "name": "Familia Sanches Sanchez",
    "phone": "924265315",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-04",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-21",
  "name": "Marco Antonio",
  "family": "Familia Marco Antonio",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Nuevo - revisar . pága en dos partes",
  "email": "alumno_21@vibramusic.pe",
  "phone": "994774940",
  "emergencyContact": {
    "name": "Familia Marco Antonio",
    "phone": "994774940",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-22",
  "name": "Miranda Aquino, Miguel Angel",
  "family": "Familia Miranda Aquino",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "se le debe 6 clases",
  "email": "alumno_22@vibramusic.pe",
  "phone": "962039082",
  "emergencyContact": {
    "name": "Familia Miranda Aquino",
    "phone": "962039082",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-23",
  "name": "Tocas Vasquez, Adonis Yeret",
  "family": "Familia Tocas Vasquez",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_23@vibramusic.pe",
  "phone": "984100154",
  "emergencyContact": {
    "name": "Familia Tocas Vasquez",
    "phone": "984100154",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-05",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-24",
  "name": "Torres Leon, Sara",
  "family": "Familia Torres Leon",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "desde agosto",
  "email": "alumno_24@vibramusic.pe",
  "phone": "912834887",
  "emergencyContact": {
    "name": "Familia Torres Leon",
    "phone": "912834887",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Trimestral",
  "planPrice": 522,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-05",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "522",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 522,
      "amountPaid": 522
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 522,
      "amountPaid": 522
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-25",
  "name": "Farfan Mendoza, Marycielo Nicole",
  "family": "Familia Farfan Mendoza",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_25@vibramusic.pe",
  "phone": "984100168",
  "emergencyContact": {
    "name": "Familia Farfan Mendoza",
    "phone": "984100168",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 290,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-06",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "290",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 290,
      "amountPaid": 290
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 290,
      "amountPaid": 290
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 290,
      "amountPaid": 290
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-26",
  "name": "Farfan Mendoza, Maryfer",
  "family": "Familia Farfan Mendoza",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_26@vibramusic.pe",
  "phone": "984100175",
  "emergencyContact": {
    "name": "Familia Farfan Mendoza",
    "phone": "984100175",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 290,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-01",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "290",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 290,
      "amountPaid": 290
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 290,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-27",
  "name": "Micaela Vilchez",
  "family": "Familia Micaela Vilchez",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "se le debe 5 clases",
  "email": "alumno_27@vibramusic.pe",
  "phone": "952324832",
  "emergencyContact": {
    "name": "Familia Micaela Vilchez",
    "phone": "952324832",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-28",
  "name": "Anton, Uriel, Gabriel y Eitan",
  "family": "Familia Anton",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "pagará el sábado",
  "email": "alumno_28@vibramusic.pe",
  "phone": "977783340",
  "emergencyContact": {
    "name": "Familia Anton",
    "phone": "977783340",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Trimestral",
  "planPrice": 783,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-07",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "783",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 783,
      "amountPaid": 783
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 783,
      "amountPaid": 783
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 783,
      "amountPaid": 783
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-29",
  "name": "Samantha Castillo",
  "family": "Familia Samantha Castillo",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "vencido",
  "risk": 75,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 297,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "ingreso 7 de julio - no contesta",
  "email": "alumno_29@vibramusic.pe",
  "phone": "960580399",
  "emergencyContact": {
    "name": "Familia Samantha Castillo",
    "phone": "960580399",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-07",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "deudor",
      "rawText": "DEUDOR",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-30",
  "name": "Carolina Luna Tito",
  "family": "Familia Carolina Luna Tito",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_30@vibramusic.pe",
  "phone": "936370723",
  "emergencyContact": {
    "name": "Familia Carolina Luna Tito",
    "phone": "936370723",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-07",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-31",
  "name": "De La Cruz Huapaya, Romina Nathaly",
  "family": "Familia De La Cruz Huapaya",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Pago el 8 de junio",
  "email": "alumno_31@vibramusic.pe",
  "phone": "956249085",
  "emergencyContact": {
    "name": "Familia De La Cruz Huapaya",
    "phone": "956249085",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-08",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "YA PAGO JUNIO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-32",
  "name": "Jara Saldarriaga, Ethan Paolo",
  "family": "Familia Jara Saldarriaga",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_32@vibramusic.pe",
  "phone": "984309257",
  "emergencyContact": {
    "name": "Familia Jara Saldarriaga",
    "phone": "984309257",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 329,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-18",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "329",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 329,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 329,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 329,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 329,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 329,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 329,
      "amountPaid": 329
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 329,
      "amountPaid": 329
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 329,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 329,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 329,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 329,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 329,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-33",
  "name": "Mesa Llallahui, Andrea Fernanda",
  "family": "Familia Mesa Llallahui",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "SE LE COBRA EL 10 DE OCTUBRE???",
  "email": "alumno_33@vibramusic.pe",
  "phone": "930182010",
  "emergencyContact": {
    "name": "Familia Mesa Llallahui",
    "phone": "930182010",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Trimestral",
  "planPrice": 783,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-10",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "783",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 783,
      "amountPaid": 783
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 783,
      "amountPaid": 783
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 783,
      "amountPaid": 783
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 783,
      "amountPaid": 783
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-34",
  "name": "Huamali Cortez, Carlos (BATERIA)",
  "family": "Familia Huamali Cortez",
  "instrument": "Batería",
  "level": "Nivel 1",
  "teacher": "Jeremy",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "NO CONTESTA",
  "email": "alumno_34@vibramusic.pe",
  "phone": "947215751",
  "emergencyContact": {
    "name": "Familia Huamali Cortez",
    "phone": "947215751",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 261,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-11",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "261",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-35",
  "name": "Conde, Sofía Valentina",
  "family": "Familia Conde",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Proximo pago de julio se normaliza a 297 - no contesta",
  "email": "alumno_35@vibramusic.pe",
  "phone": "996087235",
  "emergencyContact": {
    "name": "Familia Conde",
    "phone": "996087235",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-11",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-36",
  "name": "Valladolid Sanchez, Santiago Mathias",
  "family": "Familia Valladolid Sanchez",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_36@vibramusic.pe",
  "phone": "987921575",
  "emergencyContact": {
    "name": "Familia Valladolid Sanchez",
    "phone": "987921575",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-11",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-37",
  "name": "Curi Qquecho, Renzo y Angie",
  "family": "Familia Curi Qquecho",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_37@vibramusic.pe",
  "phone": "961023495",
  "emergencyContact": {
    "name": "Familia Curi Qquecho",
    "phone": "961023495",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Trimestral",
  "planPrice": 522,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-14",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "522",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 522,
      "amountPaid": 522
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 522,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-38",
  "name": "Alvarez Moya, Leonardo",
  "family": "Familia Alvarez Moya",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Proximo pago de julio se normaliza a 297",
  "email": "alumno_38@vibramusic.pe",
  "phone": "971112371",
  "emergencyContact": {
    "name": "Familia Alvarez Moya",
    "phone": "971112371",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-15",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-39",
  "name": "García Zuñiga, Celeste Elizabeth",
  "family": "Familia García Zuñiga",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_39@vibramusic.pe",
  "phone": "968657514",
  "emergencyContact": {
    "name": "Familia García Zuñiga",
    "phone": "968657514",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-30",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-40",
  "name": "Solorzano Cuya, Saúl",
  "family": "Familia Solorzano Cuya",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_40@vibramusic.pe",
  "phone": "961494127",
  "emergencyContact": {
    "name": "Familia Solorzano Cuya",
    "phone": "961494127",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-16",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-41",
  "name": "Zarate Alcarraz, Stephanie Abigail",
  "family": "Familia Zarate Alcarraz",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_41@vibramusic.pe",
  "phone": "970090351",
  "emergencyContact": {
    "name": "Familia Zarate Alcarraz",
    "phone": "970090351",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-16",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-42",
  "name": "Sara Ximena Ortiz Vivas",
  "family": "Familia Sara Ximena Ortiz Vivas",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "NUEVA EN JULIO",
  "email": "alumno_42@vibramusic.pe",
  "phone": "923785176",
  "emergencyContact": {
    "name": "Familia Sara Ximena Ortiz Vivas",
    "phone": "923785176",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-16",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-43",
  "name": "Pineda Espinoza, Alonso",
  "family": "Familia Pineda Espinoza",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_43@vibramusic.pe",
  "phone": "984384180",
  "emergencyContact": {
    "name": "Familia Pineda Espinoza",
    "phone": "984384180",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-17",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-44",
  "name": "Verástegui Picón, Krizia Verónica",
  "family": "Familia Verástegui Picón",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "FALTARA POR 3 SEMANAS",
  "email": "alumno_44@vibramusic.pe",
  "phone": "941482574",
  "emergencyContact": {
    "name": "Familia Verástegui Picón",
    "phone": "941482574",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Trimestral",
  "planPrice": 868.2,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-17",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "868.2",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 868.2,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 868.2,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 868.2,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 868.2,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 868.2,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 868.2,
      "amountPaid": 868.2
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 868.2,
      "amountPaid": 868.2
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 868.2,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 868.2,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 868.2,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 868.2,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 868.2,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-45",
  "name": "Del Quiroz Sulca, Carlos Ignacio",
  "family": "Familia Del Quiroz Sulca",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "QUIERE PAGAR CUANDO RECUPERE LAS CLASES 6",
  "email": "alumno_45@vibramusic.pe",
  "phone": "936138686",
  "emergencyContact": {
    "name": "Familia Del Quiroz Sulca",
    "phone": "936138686",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-17",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-46",
  "name": "Flavia Nicole Concepcion",
  "family": "Familia Flavia Nicole Concepcion",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_46@vibramusic.pe",
  "phone": "933125352",
  "emergencyContact": {
    "name": "Familia Flavia Nicole Concepcion",
    "phone": "933125352",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-17",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-47",
  "name": "Álvarez Galarreta, Gabriel Fabiano",
  "family": "Familia Álvarez Galarreta",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_47@vibramusic.pe",
  "phone": "975687085",
  "emergencyContact": {
    "name": "Familia Álvarez Galarreta",
    "phone": "975687085",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-18",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-48",
  "name": "Sofía De la Cruz Vellaneda",
  "family": "Familia Sofía De la Cruz Vellaneda",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "nueva - ingreso julio",
  "email": "alumno_48@vibramusic.pe",
  "phone": "987584730",
  "emergencyContact": {
    "name": "Familia Sofía De la Cruz Vellaneda",
    "phone": "987584730",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-18",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-49",
  "name": "Bellido Alvan, Mia Lucero",
  "family": "Familia Bellido Alvan",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_49@vibramusic.pe",
  "phone": "934106343",
  "emergencyContact": {
    "name": "Familia Bellido Alvan",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-50",
  "name": "Aithana Rivas Badajoz",
  "family": "Familia Aithana Rivas Badajoz",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Pago completo, por yape.",
  "email": "alumno_50@vibramusic.pe",
  "phone": "977528878",
  "emergencyContact": {
    "name": "Familia Aithana Rivas Badajoz",
    "phone": "977528878",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-20",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-51",
  "name": "Suarez Salazar, Yamir",
  "family": "Familia Suarez Salazar",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "QUIERE RECUPERAR CLASES PRIMERO le faltan 2 clases",
  "email": "alumno_51@vibramusic.pe",
  "phone": "985501740",
  "emergencyContact": {
    "name": "Familia Suarez Salazar",
    "phone": "985501740",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-21",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-52",
  "name": "Llallahui Alvarado, Kenny Armando",
  "family": "Familia Llallahui Alvarado",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_52@vibramusic.pe",
  "phone": "977931974",
  "emergencyContact": {
    "name": "Familia Llallahui Alvarado",
    "phone": "977931974",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-21",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-53",
  "name": "Huerta Mitma, Juan Diego",
  "family": "Familia Huerta Mitma",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_53@vibramusic.pe",
  "phone": "997549474",
  "emergencyContact": {
    "name": "Familia Huerta Mitma",
    "phone": "997549474",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-22",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-54",
  "name": "Florindez Aguilar, Layla Mariapaula",
  "family": "Familia Florindez Aguilar",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_54@vibramusic.pe",
  "phone": "934563643",
  "emergencyContact": {
    "name": "Familia Florindez Aguilar",
    "phone": "934563643",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 261,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-22",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "261",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 261,
      "amountPaid": 261
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 261,
      "amountPaid": 261
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-55",
  "name": "Florindez Aguilar, Eithan David",
  "family": "Familia Florindez Aguilar",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_55@vibramusic.pe",
  "phone": "934563643",
  "emergencyContact": {
    "name": "Familia Florindez Aguilar",
    "phone": "934563643",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 261,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-22",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "261",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 261,
      "amountPaid": 261
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 261,
      "amountPaid": 261
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-56",
  "name": "Rios de la Cruz, Edward",
  "family": "Familia Rios de la Cruz",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "se le cobra en agosto 297",
  "email": "alumno_56@vibramusic.pe",
  "phone": "984100385",
  "emergencyContact": {
    "name": "Familia Rios de la Cruz",
    "phone": "984100385",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-22",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-57",
  "name": "Quispe Vilcapoma, Matias Gabriel",
  "family": "Familia Quispe Vilcapoma",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_57@vibramusic.pe",
  "phone": "989625788",
  "emergencyContact": {
    "name": "Familia Quispe Vilcapoma",
    "phone": "989625788",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-23",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-58",
  "name": "Judith Chaparro Gonzales",
  "family": "Familia Judith Chaparro Gonzales",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "se va por dos semanas",
  "email": "alumno_58@vibramusic.pe",
  "phone": "947504097",
  "emergencyContact": {
    "name": "Familia Judith Chaparro Gonzales",
    "phone": "947504097",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-59",
  "name": "Magallanes Frisancho, Yesenia Maria",
  "family": "Familia Magallanes Frisancho",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "baja",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "NO CONTINUARÁ",
  "email": "alumno_59@vibramusic.pe",
  "phone": "984100406",
  "emergencyContact": {
    "name": "Familia Magallanes Frisancho",
    "phone": "984100406",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-25",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-60",
  "name": "Irribarren Paz, Francesco",
  "family": "Familia Irribarren Paz",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_60@vibramusic.pe",
  "phone": "916704270",
  "emergencyContact": {
    "name": "Familia Irribarren Paz",
    "phone": "916704270",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-25",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-61",
  "name": "Rodriguez, Joan Paolo",
  "family": "Familia Rodriguez",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "CLASE PERSONALIZADA LE FALTAN 3 CLASES  HASTA 22/07",
  "email": "alumno_61@vibramusic.pe",
  "phone": "984100420",
  "emergencyContact": {
    "name": "Familia Rodriguez",
    "phone": "984100420",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-26",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-62",
  "name": "Castillo Bueno, Mathew",
  "family": "Familia Castillo Bueno",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_62@vibramusic.pe",
  "phone": "932133618",
  "emergencyContact": {
    "name": "Familia Castillo Bueno",
    "phone": "932133618",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-28",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-63",
  "name": "Leon Gonzales, Joshua",
  "family": "Familia Leon Gonzales",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "PAGO 3 MESES (RECIEN PAGA EN AGOSTO ) pagara el sábado",
  "email": "alumno_63@vibramusic.pe",
  "phone": "918148199",
  "emergencyContact": {
    "name": "Familia Leon Gonzales",
    "phone": "918148199",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-07",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-64",
  "name": "De La Cruz Pucyura, Carlomagno Tomas",
  "family": "Familia De La Cruz Pucyura",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_64@vibramusic.pe",
  "phone": "990621266",
  "emergencyContact": {
    "name": "Familia De La Cruz Pucyura",
    "phone": "990621266",
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
  "rawMontoText": "",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-65",
  "name": "Pariona Pumahuillca, Juan Mateo Azael",
  "family": "Familia Pariona Pumahuillca",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_65@vibramusic.pe",
  "phone": "989726595",
  "emergencyContact": {
    "name": "Familia Pariona Pumahuillca",
    "phone": "989726595",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-07",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-66",
  "name": "Loja Villajuan, Kaled Radamel",
  "family": "Familia Loja Villajuan",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Aun no inicia clases (debe libros y mensualidad )}",
  "email": "alumno_66@vibramusic.pe",
  "phone": "951558668",
  "emergencyContact": {
    "name": "Familia Loja Villajuan",
    "phone": "951558668",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 197,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-01",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "197",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 197,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-67",
  "name": "De la Cruz, Geraldine",
  "family": "Familia De la Cruz",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Proximo pago de julio se normaliza a 297, sin embargo 197 + 67 es primer mes",
  "email": "alumno_67@vibramusic.pe",
  "phone": "992413230",
  "emergencyContact": {
    "name": "Familia De la Cruz",
    "phone": "992413230",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "parcial",
      "rawText": "PENDIENTE",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-68",
  "name": "Dulce, Dulce",
  "family": "Familia Dulce",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Proximo pago de julio se normaliza a 297,  sin embargo 197 + 67 es primer mes",
  "email": "alumno_68@vibramusic.pe",
  "phone": "992413230",
  "emergencyContact": {
    "name": "Familia Dulce",
    "phone": "992413230",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "parcial",
      "rawText": "PENDIENTE",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-69",
  "name": "Moscoso Valentin, Yuriana",
  "family": "Familia Moscoso Valentin",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Pago 3 meses le toca pagar en Julio (se reincorpora en agosto)",
  "email": "alumno_69@vibramusic.pe",
  "phone": "904781203",
  "emergencyContact": {
    "name": "Familia Moscoso Valentin",
    "phone": "904781203",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-70",
  "name": "Estela Nuñes, Max Benjamin",
  "family": "Familia Estela Nuñes",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "pausa",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "EN PAUSA",
  "email": "alumno_70@vibramusic.pe",
  "phone": "984100483",
  "emergencyContact": {
    "name": "Familia Estela Nuñes",
    "phone": "984100483",
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
  "rawMontoText": "",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-71",
  "name": "Ticona Cachay, Jonathan",
  "family": "Familia Ticona Cachay",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "pago 3 meses por 24 clases hasta el 13/04 ya no tiene clases por recuperar",
  "email": "alumno_71@vibramusic.pe",
  "phone": "962386336",
  "emergencyContact": {
    "name": "Familia Ticona Cachay",
    "phone": "962386336",
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
  "rawMontoText": "",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-72",
  "name": "Tomas (piano --particulares)",
  "family": "Familia Tomas (piano --particulares)",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "2 clases 75.00 soles / 1 clase  45 soles",
  "email": "alumno_72@vibramusic.pe",
  "phone": "984100497",
  "emergencyContact": {
    "name": "Familia Tomas (piano --particulares)",
    "phone": "984100497",
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
  "rawMontoText": "",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-73",
  "name": "Meza, Jamil",
  "family": "Familia Meza",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "CLASES PARTICULARES PIANO",
  "email": "alumno_73@vibramusic.pe",
  "phone": "984100504",
  "emergencyContact": {
    "name": "Familia Meza",
    "phone": "984100504",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 50,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-01",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "50",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-74",
  "name": "Edinson Omar Centeno Huayta",
  "family": "Familia Edinson Omar Centeno Huayta",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "PENDIENTE mensualidad primera cuota",
  "email": "alumno_74@vibramusic.pe",
  "phone": "968002242",
  "emergencyContact": {
    "name": "Familia Edinson Omar Centeno Huayta",
    "phone": "968002242",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 261,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-01",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "261",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 261,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-75",
  "name": "Luana Camila Zamora Ochoa",
  "family": "Familia Luana Camila Zamora Ochoa",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Nuevo - por definir fecha de ingreso y por consiguiente  pago",
  "email": "alumno_75@vibramusic.pe",
  "phone": "915067137",
  "emergencyContact": {
    "name": "Familia Luana Camila Zamora Ochoa",
    "phone": "915067137",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-76",
  "name": "Niah Jimena Montalvo Huerta",
  "family": "Familia Niah Jimena Montalvo Huerta",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Nueva paga sábado 11 | y el resto fin de mes ingresa el 11dejuli",
  "email": "alumno_76@vibramusic.pe",
  "phone": "935993601",
  "emergencyContact": {
    "name": "Familia Niah Jimena Montalvo Huerta",
    "phone": "935993601",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Trimestral",
  "planPrice": 783,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-01",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "783",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "parcial",
      "rawText": "Pendiente s/173",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 783,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-77",
  "name": "Catalina Salvador Gutierrez",
  "family": "Familia Catalina Salvador Gutierrez",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "nueva - aun no tiene decha de inicio, probablemente sea en agosto.",
  "email": "alumno_77@vibramusic.pe",
  "phone": "929913991",
  "emergencyContact": {
    "name": "Familia Catalina Salvador Gutierrez",
    "phone": "929913991",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-78",
  "name": "Sasha Contreras de la Cruz",
  "family": "Familia Sasha Contreras de la Cruz",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "PENDIENTE 47 SOLES",
  "email": "alumno_78@vibramusic.pe",
  "phone": "984100539",
  "emergencyContact": {
    "name": "Familia Sasha Contreras de la Cruz",
    "phone": "984100539",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-30",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "parcial",
      "rawText": "PEN 47",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-79",
  "name": "Fabiana Arroyo Tineo",
  "family": "Familia Fabiana Arroyo Tineo",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_79@vibramusic.pe",
  "phone": "966716051",
  "emergencyContact": {
    "name": "Familia Fabiana Arroyo Tineo",
    "phone": "966716051",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-21",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-80",
  "name": "Thaisa Lucero Oyarce Cruz",
  "family": "Familia Thaisa Lucero Oyarce Cruz",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "nueva agosto",
  "email": "alumno_80@vibramusic.pe",
  "phone": "989708032",
  "emergencyContact": {
    "name": "Familia Thaisa Lucero Oyarce Cruz",
    "phone": "989708032",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-04",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-81",
  "name": "Valerie Yidda Angulo Chipana",
  "family": "Familia Valerie Yidda Angulo Chipana",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "LE FALTAN 5 CLASES PARA COMPLETAR",
  "email": "alumno_81@vibramusic.pe",
  "phone": "934164251",
  "emergencyContact": {
    "name": "Familia Valerie Yidda Angulo Chipana",
    "phone": "934164251",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-14",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-82",
  "name": "Enzo Raul Ayala",
  "family": "Familia Enzo Raul Ayala",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "nuevo julio - pendiente de pago mensualidad",
  "email": "alumno_82@vibramusic.pe",
  "phone": "954056837",
  "emergencyContact": {
    "name": "Familia Enzo Raul Ayala",
    "phone": "954056837",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-83",
  "name": "Camila Valentina Pastor Conco",
  "family": "Familia Camila Valentina Pastor Conco",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "2 clases para recuperar",
  "email": "alumno_83@vibramusic.pe",
  "phone": "910875526",
  "emergencyContact": {
    "name": "Familia Camila Valentina Pastor Conco",
    "phone": "910875526",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-30",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-84",
  "name": "Asaf Chipana Urribarri",
  "family": "Familia Asaf Chipana Urribarri",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_84@vibramusic.pe",
  "phone": "987404984",
  "emergencyContact": {
    "name": "Familia Asaf Chipana Urribarri",
    "phone": "987404984",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-03",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-85",
  "name": "Liam Huanca Huamantupa",
  "family": "Familia Liam Huanca Huamantupa",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "nuevo julio - pendiente mensualidad y utiles",
  "email": "alumno_85@vibramusic.pe",
  "phone": "969085167",
  "emergencyContact": {
    "name": "Familia Liam Huanca Huamantupa",
    "phone": "969085167",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-86",
  "name": "Emma Micaela Sevilla",
  "family": "Familia Emma Micaela Sevilla",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_86@vibramusic.pe",
  "phone": "986740292",
  "emergencyContact": {
    "name": "Familia Emma Micaela Sevilla",
    "phone": "986740292",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-31",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-87",
  "name": "Aarón Balarezo Sosa",
  "family": "Familia Aarón Balarezo Sosa",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "nuevo agosto - pendiente pago de mensualidad y útiles",
  "email": "alumno_87@vibramusic.pe",
  "phone": "920493604",
  "emergencyContact": {
    "name": "Familia Aarón Balarezo Sosa",
    "phone": "920493604",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-13",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "parcial",
      "rawText": "PEN 480",
      "amountExpected": 297,
      "amountPaid": 480
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-88",
  "name": "Alexis Bringos Facho",
  "family": "Familia Alexis Bringos Facho",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "clases personalizadas",
  "email": "alumno_88@vibramusic.pe",
  "phone": "984100609",
  "emergencyContact": {
    "name": "Familia Alexis Bringos Facho",
    "phone": "984100609",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 50,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-01",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "50",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 50,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-89",
  "name": "Emmanuel Rospligiosi",
  "family": "Familia Emmanuel Rospligiosi",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_89@vibramusic.pe",
  "phone": "984100616",
  "emergencyContact": {
    "name": "Familia Emmanuel Rospligiosi",
    "phone": "984100616",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-03",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-90",
  "name": "Giussepe Granda",
  "family": "Familia Giussepe Granda",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "ingresa el 6 de agosto",
  "email": "alumno_90@vibramusic.pe",
  "phone": "984100623",
  "emergencyContact": {
    "name": "Familia Giussepe Granda",
    "phone": "984100623",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-06",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-91",
  "name": "Mateo Quispe Trujillo",
  "family": "Familia Mateo Quispe Trujillo",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "nuevo agosto pendiente utiles y mensualidad (364)",
  "email": "alumno_91@vibramusic.pe",
  "phone": "993478448",
  "emergencyContact": {
    "name": "Familia Mateo Quispe Trujillo",
    "phone": "993478448",
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
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-92",
  "name": "Mirko Malpartida",
  "family": "Familia Mirko Malpartida",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Paga por clase personalizada",
  "email": "alumno_92@vibramusic.pe",
  "phone": "935188205",
  "emergencyContact": {
    "name": "Familia Mirko Malpartida",
    "phone": "935188205",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 60,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-01",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "60",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 60,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 60,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 60,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 60,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 60,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 60,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 60,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 60,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 60,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 60,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 60,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 60,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-93",
  "name": "Marco Antonio  Adrian",
  "family": "Familia Marco Antonio  Adrian",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_93@vibramusic.pe",
  "phone": "936888840",
  "emergencyContact": {
    "name": "Familia Marco Antonio  Adrian",
    "phone": "936888840",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-11",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-94",
  "name": "Kiara Mariños",
  "family": "Familia Kiara Mariños",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "Alumno importado del Control de Pagos Oficial.",
  "email": "alumno_94@vibramusic.pe",
  "phone": "984100651",
  "emergencyContact": {
    "name": "Familia Kiara Mariños",
    "phone": "984100651",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-13",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-95",
  "name": "Karen Gutierrez",
  "family": "Familia Karen Gutierrez",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "nueva agosto",
  "email": "alumno_95@vibramusic.pe",
  "phone": "923277024",
  "emergencyContact": {
    "name": "Familia Karen Gutierrez",
    "phone": "923277024",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-10",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-96",
  "name": "Raphaela Yangali -  Isabella Yangali",
  "family": "Familia Raphaela Yangali -  Isabella Yangali",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "nuevas agosto",
  "email": "alumno_96@vibramusic.pe",
  "phone": "984100665",
  "emergencyContact": {
    "name": "Familia Raphaela Yangali -  Isabella Yangali",
    "phone": "984100665",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Trimestral",
  "planPrice": 687,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-11",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "687",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 687,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 687,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 687,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 687,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 687,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 687,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 687,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 687,
      "amountPaid": 687
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 687,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 687,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 687,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 687,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-97",
  "name": "Mishel Suarez Cardenas",
  "family": "Familia Mishel Suarez Cardenas",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "pendiente",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "nueva agosto - pendiente pago de mensualidad y libro",
  "email": "alumno_97@vibramusic.pe",
  "phone": "984100672",
  "emergencyContact": {
    "name": "Familia Mishel Suarez Cardenas",
    "phone": "984100672",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-17",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-98",
  "name": "Antonela Diaz Sanchez",
  "family": "Familia Antonela Diaz Sanchez",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "vencido",
  "risk": 75,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 297,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "pagará el lunes 17",
  "email": "alumno_98@vibramusic.pe",
  "phone": "923080434",
  "emergencyContact": {
    "name": "Familia Antonela Diaz Sanchez",
    "phone": "923080434",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-15",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Agosto": {
      "month": "Agosto",
      "status": "deudor",
      "rawText": "DEUDOR",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
  {
  "id": "as-cp-99",
  "name": "Gael Mathias Lopez Loayza",
  "family": "Familia Gael Mathias Lopez Loayza",
  "instrument": "Piano",
  "level": "Nivel 1",
  "teacher": "Fernando",
  "modality": "Regular (8 clases / 45 min)",
  "status": "activo",
  "attendanceRate": 100,
  "payment": "al-dia",
  "risk": 0,
  "joinedAt": "Ago 2026",
  "makeupCredits": 0,
  "balance": 0,
  "recentAttendance": [
    "presente",
    "presente",
    "presente"
  ],
  "teacherNote": "nuevo agosto",
  "email": "alumno_99@vibramusic.pe",
  "phone": "901958954",
  "emergencyContact": {
    "name": "Familia Gael Mathias Lopez Loayza",
    "phone": "901958954",
    "relation": "Apoderado"
  },
  "birthdate": "15 de Agosto",
  "planType": "Mensual",
  "planPrice": 297,
  "matriculaType": "Promo Demo (S/ 30)",
  "packUtilesPaid": true,
  "planStartDate": "2026-08-04",
  "planEndDate": "2026-08-31",
  "planStartMonth": "2026-08",
  "planEndMonth": "2026-08",
  "rawMontoText": "297",
  "annualRecords": {
    "Enero": {
      "month": "Enero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Febrero": {
      "month": "Febrero",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Marzo": {
      "month": "Marzo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Abril": {
      "month": "Abril",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Mayo": {
      "month": "Mayo",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Junio": {
      "month": "Junio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Julio": {
      "month": "Julio",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Agosto": {
      "month": "Agosto",
      "status": "pagado",
      "rawText": "CANCELADO",
      "amountExpected": 297,
      "amountPaid": 297
    },
    "Septiembre": {
      "month": "Septiembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Octubre": {
      "month": "Octubre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Noviembre": {
      "month": "Noviembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    },
    "Diciembre": {
      "month": "Diciembre",
      "status": "vacio",
      "rawText": "",
      "amountExpected": 297,
      "amountPaid": 0
    }
  }
},
];

export const officialControlPagosInvoices: Invoice[] = [
  {
    "id": "inv-cp-1",
    "family": "Familia Sanchez Justa",
    "concept": "Mensualidad Agosto 2026 — Sanchez Justa, Johandry Henry",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": -5,
    "status": "vencido",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-2",
    "family": "Familia Gonzales Cuba",
    "concept": "Mensualidad Agosto 2026 — Gonzales Cuba, Jose Angel",
    "students": 1,
    "amount": 197,
    "amountPaid": 0,
    "remainingBalance": 197,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-3",
    "family": "Familia Rodríguez Guzmán",
    "concept": "Mensualidad Agosto 2026 — Rodríguez Guzmán, Alexandra Maritza",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": -5,
    "status": "vencido",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-4",
    "family": "Familia Franco Cabrera",
    "concept": "Mensualidad Agosto 2026 — Franco Cabrera, Luciano Leonardo",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-4",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-5",
    "family": "Familia Conislla Huerta",
    "concept": "Mensualidad Agosto 2026 — Conislla Huerta, Iker Samín",
    "students": 1,
    "amount": 252,
    "amountPaid": 252,
    "remainingBalance": 0,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-5",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 252,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-6",
    "family": "Familia Malpartina Ramos",
    "concept": "Mensualidad Agosto 2026 — Malpartina Ramos, Mateo Salvador",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": -5,
    "status": "vencido",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-7",
    "family": "Familia Yajaira Ayquipa",
    "concept": "Mensualidad Agosto 2026 — Yajaira Ayquipa",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": -5,
    "status": "vencido",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-8",
    "family": "Familia Guastavo Zuñiga Quispe",
    "concept": "Mensualidad Agosto 2026 — Guastavo Zuñiga Quispe",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": -5,
    "status": "vencido",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-9",
    "family": "Familia Francezca Esther Aylas Naupari",
    "concept": "Mensualidad Agosto 2026 — Francezca Esther Aylas Naupari",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-9",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-10",
    "family": "Familia Bruno Marcelo Juan de Dios y Boris Marcelo Juan de Dios",
    "concept": "Mensualidad Agosto 2026 — Bruno Marcelo Juan de Dios y Boris Marcelo Juan de Dios",
    "students": 1,
    "amount": 522,
    "amountPaid": 522,
    "remainingBalance": 0,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-10",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 522,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-11",
    "family": "Familia Leonardo Villacorta",
    "concept": "Mensualidad Agosto 2026 — Leonardo Villacorta",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": -5,
    "status": "vencido",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-12",
    "family": "Familia Antonella Osorio Huaman",
    "concept": "Mensualidad Agosto 2026 — Antonella Osorio Huaman",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-12",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-13",
    "family": "Familia Carlos Isaac Carhuachin",
    "concept": "Mensualidad Agosto 2026 — Carlos Isaac Carhuachin",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": -5,
    "status": "vencido",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-14",
    "family": "Familia Yrco Samaniego",
    "concept": "Mensualidad Agosto 2026 — Yrco Samaniego, Stefano",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-08",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-14",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-15",
    "family": "Familia Soto Soto",
    "concept": "Mensualidad Agosto 2026 — Soto Soto, Ivanna",
    "students": 1,
    "amount": 522,
    "amountPaid": 522,
    "remainingBalance": 0,
    "dueDate": "2026-08-08",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-15",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 522,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-16",
    "family": "Familia Soto Soto",
    "concept": "Mensualidad Agosto 2026 — Soto Soto, Ivanna + Luis Soto soto",
    "students": 1,
    "amount": 522,
    "amountPaid": 522,
    "remainingBalance": 0,
    "dueDate": "2026-08-03",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-16",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 522,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-17",
    "family": "Familia Ethan Romero Manrique",
    "concept": "Mensualidad Agosto 2026 — Ethan Romero Manrique",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-03",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-17",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-18",
    "family": "Familia Liliana Mandujano",
    "concept": "Mensualidad Agosto 2026 — Liliana Mandujano",
    "students": 1,
    "amount": 50,
    "amountPaid": 0,
    "remainingBalance": 50,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-19",
    "family": "Familia Meza Salome",
    "concept": "Mensualidad Agosto 2026 — Meza Salome, Jhosua Ruben",
    "students": 1,
    "amount": 397,
    "amountPaid": 0,
    "remainingBalance": 397,
    "dueDate": "2026-08-04",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-20",
    "family": "Familia Sanches Sanchez",
    "concept": "Mensualidad Agosto 2026 — Sanches Sanchez, Liam Jesús",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-04",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-20",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-21",
    "family": "Familia Marco Antonio",
    "concept": "Mensualidad Agosto 2026 — Marco Antonio",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-22",
    "family": "Familia Miranda Aquino",
    "concept": "Mensualidad Agosto 2026 — Miranda Aquino, Miguel Angel",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-23",
    "family": "Familia Tocas Vasquez",
    "concept": "Mensualidad Agosto 2026 — Tocas Vasquez, Adonis Yeret",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-05",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-23",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-24",
    "family": "Familia Torres Leon",
    "concept": "Mensualidad Agosto 2026 — Torres Leon, Sara",
    "students": 1,
    "amount": 522,
    "amountPaid": 0,
    "remainingBalance": 522,
    "dueDate": "2026-08-05",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-25",
    "family": "Familia Farfan Mendoza",
    "concept": "Mensualidad Agosto 2026 — Farfan Mendoza, Marycielo Nicole",
    "students": 1,
    "amount": 290,
    "amountPaid": 290,
    "remainingBalance": 0,
    "dueDate": "2026-08-06",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-25",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 290,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-26",
    "family": "Familia Farfan Mendoza",
    "concept": "Mensualidad Agosto 2026 — Farfan Mendoza, Maryfer",
    "students": 1,
    "amount": 290,
    "amountPaid": 290,
    "remainingBalance": 0,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-26",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 290,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-27",
    "family": "Familia Micaela Vilchez",
    "concept": "Mensualidad Agosto 2026 — Micaela Vilchez",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-28",
    "family": "Familia Anton",
    "concept": "Mensualidad Agosto 2026 — Anton, Uriel, Gabriel y Eitan",
    "students": 1,
    "amount": 783,
    "amountPaid": 783,
    "remainingBalance": 0,
    "dueDate": "2026-08-07",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-28",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 783,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-29",
    "family": "Familia Samantha Castillo",
    "concept": "Mensualidad Agosto 2026 — Samantha Castillo",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-07",
    "daysToDue": -5,
    "status": "vencido",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-30",
    "family": "Familia Carolina Luna Tito",
    "concept": "Mensualidad Agosto 2026 — Carolina Luna Tito",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-07",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-30",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-31",
    "family": "Familia De La Cruz Huapaya",
    "concept": "Mensualidad Agosto 2026 — De La Cruz Huapaya, Romina Nathaly",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-08",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-32",
    "family": "Familia Jara Saldarriaga",
    "concept": "Mensualidad Agosto 2026 — Jara Saldarriaga, Ethan Paolo",
    "students": 1,
    "amount": 329,
    "amountPaid": 0,
    "remainingBalance": 329,
    "dueDate": "2026-08-18",
    "daysToDue": 1,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-33",
    "family": "Familia Mesa Llallahui",
    "concept": "Mensualidad Agosto 2026 — Mesa Llallahui, Andrea Fernanda",
    "students": 1,
    "amount": 783,
    "amountPaid": 783,
    "remainingBalance": 0,
    "dueDate": "2026-08-10",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-33",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 783,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-34",
    "family": "Familia Huamali Cortez",
    "concept": "Mensualidad Agosto 2026 — Huamali Cortez, Carlos (BATERIA)",
    "students": 1,
    "amount": 261,
    "amountPaid": 0,
    "remainingBalance": 261,
    "dueDate": "2026-08-11",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-35",
    "family": "Familia Conde",
    "concept": "Mensualidad Agosto 2026 — Conde, Sofía Valentina",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-11",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-36",
    "family": "Familia Valladolid Sanchez",
    "concept": "Mensualidad Agosto 2026 — Valladolid Sanchez, Santiago Mathias",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-11",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-36",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-37",
    "family": "Familia Curi Qquecho",
    "concept": "Mensualidad Agosto 2026 — Curi Qquecho, Renzo y Angie",
    "students": 1,
    "amount": 522,
    "amountPaid": 0,
    "remainingBalance": 522,
    "dueDate": "2026-08-14",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-38",
    "family": "Familia Alvarez Moya",
    "concept": "Mensualidad Agosto 2026 — Alvarez Moya, Leonardo",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-15",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-39",
    "family": "Familia García Zuñiga",
    "concept": "Mensualidad Agosto 2026 — García Zuñiga, Celeste Elizabeth",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-30",
    "daysToDue": 13,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-40",
    "family": "Familia Solorzano Cuya",
    "concept": "Mensualidad Agosto 2026 — Solorzano Cuya, Saúl",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-16",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-41",
    "family": "Familia Zarate Alcarraz",
    "concept": "Mensualidad Agosto 2026 — Zarate Alcarraz, Stephanie Abigail",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-16",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-42",
    "family": "Familia Sara Ximena Ortiz Vivas",
    "concept": "Mensualidad Agosto 2026 — Sara Ximena Ortiz Vivas",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-16",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-43",
    "family": "Familia Pineda Espinoza",
    "concept": "Mensualidad Agosto 2026 — Pineda Espinoza, Alonso",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-17",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-44",
    "family": "Familia Verástegui Picón",
    "concept": "Mensualidad Agosto 2026 — Verástegui Picón, Krizia Verónica",
    "students": 1,
    "amount": 868.2,
    "amountPaid": 0,
    "remainingBalance": 868.2,
    "dueDate": "2026-08-17",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-45",
    "family": "Familia Del Quiroz Sulca",
    "concept": "Mensualidad Agosto 2026 — Del Quiroz Sulca, Carlos Ignacio",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-17",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-46",
    "family": "Familia Flavia Nicole Concepcion",
    "concept": "Mensualidad Agosto 2026 — Flavia Nicole Concepcion",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-17",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-47",
    "family": "Familia Álvarez Galarreta",
    "concept": "Mensualidad Agosto 2026 — Álvarez Galarreta, Gabriel Fabiano",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-18",
    "daysToDue": 1,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-48",
    "family": "Familia Sofía De la Cruz Vellaneda",
    "concept": "Mensualidad Agosto 2026 — Sofía De la Cruz Vellaneda",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-18",
    "daysToDue": 1,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-49",
    "family": "Familia Bellido Alvan",
    "concept": "Mensualidad Agosto 2026 — Bellido Alvan, Mia Lucero",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-49",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-50",
    "family": "Familia Aithana Rivas Badajoz",
    "concept": "Mensualidad Agosto 2026 — Aithana Rivas Badajoz",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-20",
    "daysToDue": 3,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-51",
    "family": "Familia Suarez Salazar",
    "concept": "Mensualidad Agosto 2026 — Suarez Salazar, Yamir",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-21",
    "daysToDue": 4,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-52",
    "family": "Familia Llallahui Alvarado",
    "concept": "Mensualidad Agosto 2026 — Llallahui Alvarado, Kenny Armando",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-21",
    "daysToDue": 4,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-53",
    "family": "Familia Huerta Mitma",
    "concept": "Mensualidad Agosto 2026 — Huerta Mitma, Juan Diego",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-22",
    "daysToDue": 5,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-54",
    "family": "Familia Florindez Aguilar",
    "concept": "Mensualidad Agosto 2026 — Florindez Aguilar, Layla Mariapaula",
    "students": 1,
    "amount": 261,
    "amountPaid": 0,
    "remainingBalance": 261,
    "dueDate": "2026-08-22",
    "daysToDue": 5,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-55",
    "family": "Familia Florindez Aguilar",
    "concept": "Mensualidad Agosto 2026 — Florindez Aguilar, Eithan David",
    "students": 1,
    "amount": 261,
    "amountPaid": 0,
    "remainingBalance": 261,
    "dueDate": "2026-08-22",
    "daysToDue": 5,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-56",
    "family": "Familia Rios de la Cruz",
    "concept": "Mensualidad Agosto 2026 — Rios de la Cruz, Edward",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-22",
    "daysToDue": 5,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-57",
    "family": "Familia Quispe Vilcapoma",
    "concept": "Mensualidad Agosto 2026 — Quispe Vilcapoma, Matias Gabriel",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-23",
    "daysToDue": 6,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-58",
    "family": "Familia Judith Chaparro Gonzales",
    "concept": "Mensualidad Agosto 2026 — Judith Chaparro Gonzales",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-59",
    "family": "Familia Magallanes Frisancho",
    "concept": "Mensualidad Agosto 2026 — Magallanes Frisancho, Yesenia Maria",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-25",
    "daysToDue": 8,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-60",
    "family": "Familia Irribarren Paz",
    "concept": "Mensualidad Agosto 2026 — Irribarren Paz, Francesco",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-25",
    "daysToDue": 8,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-60",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-61",
    "family": "Familia Rodriguez",
    "concept": "Mensualidad Agosto 2026 — Rodriguez, Joan Paolo",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-26",
    "daysToDue": 9,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-62",
    "family": "Familia Castillo Bueno",
    "concept": "Mensualidad Agosto 2026 — Castillo Bueno, Mathew",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-28",
    "daysToDue": 11,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-63",
    "family": "Familia Leon Gonzales",
    "concept": "Mensualidad Agosto 2026 — Leon Gonzales, Joshua",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-07",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-64",
    "family": "Familia De La Cruz Pucyura",
    "concept": "Mensualidad Agosto 2026 — De La Cruz Pucyura, Carlomagno Tomas",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-65",
    "family": "Familia Pariona Pumahuillca",
    "concept": "Mensualidad Agosto 2026 — Pariona Pumahuillca, Juan Mateo Azael",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-07",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-65",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-66",
    "family": "Familia Loja Villajuan",
    "concept": "Mensualidad Agosto 2026 — Loja Villajuan, Kaled Radamel",
    "students": 1,
    "amount": 197,
    "amountPaid": 0,
    "remainingBalance": 197,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-67",
    "family": "Familia De la Cruz",
    "concept": "Mensualidad Agosto 2026 — De la Cruz, Geraldine",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-68",
    "family": "Familia Dulce",
    "concept": "Mensualidad Agosto 2026 — Dulce, Dulce",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-69",
    "family": "Familia Moscoso Valentin",
    "concept": "Mensualidad Agosto 2026 — Moscoso Valentin, Yuriana",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-70",
    "family": "Familia Estela Nuñes",
    "concept": "Mensualidad Agosto 2026 — Estela Nuñes, Max Benjamin",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-71",
    "family": "Familia Ticona Cachay",
    "concept": "Mensualidad Agosto 2026 — Ticona Cachay, Jonathan",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-72",
    "family": "Familia Tomas (piano --particulares)",
    "concept": "Mensualidad Agosto 2026 — Tomas (piano --particulares)",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-73",
    "family": "Familia Meza",
    "concept": "Mensualidad Agosto 2026 — Meza, Jamil",
    "students": 1,
    "amount": 50,
    "amountPaid": 0,
    "remainingBalance": 50,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-74",
    "family": "Familia Edinson Omar Centeno Huayta",
    "concept": "Mensualidad Agosto 2026 — Edinson Omar Centeno Huayta",
    "students": 1,
    "amount": 261,
    "amountPaid": 0,
    "remainingBalance": 261,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-75",
    "family": "Familia Luana Camila Zamora Ochoa",
    "concept": "Mensualidad Agosto 2026 — Luana Camila Zamora Ochoa",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-76",
    "family": "Familia Niah Jimena Montalvo Huerta",
    "concept": "Mensualidad Agosto 2026 — Niah Jimena Montalvo Huerta",
    "students": 1,
    "amount": 783,
    "amountPaid": 0,
    "remainingBalance": 783,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-77",
    "family": "Familia Catalina Salvador Gutierrez",
    "concept": "Mensualidad Agosto 2026 — Catalina Salvador Gutierrez",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-78",
    "family": "Familia Sasha Contreras de la Cruz",
    "concept": "Mensualidad Agosto 2026 — Sasha Contreras de la Cruz",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-30",
    "daysToDue": 13,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-79",
    "family": "Familia Fabiana Arroyo Tineo",
    "concept": "Mensualidad Agosto 2026 — Fabiana Arroyo Tineo",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-21",
    "daysToDue": 4,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-80",
    "family": "Familia Thaisa Lucero Oyarce Cruz",
    "concept": "Mensualidad Agosto 2026 — Thaisa Lucero Oyarce Cruz",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-04",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-80",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-81",
    "family": "Familia Valerie Yidda Angulo Chipana",
    "concept": "Mensualidad Agosto 2026 — Valerie Yidda Angulo Chipana",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-14",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-82",
    "family": "Familia Enzo Raul Ayala",
    "concept": "Mensualidad Agosto 2026 — Enzo Raul Ayala",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-83",
    "family": "Familia Camila Valentina Pastor Conco",
    "concept": "Mensualidad Agosto 2026 — Camila Valentina Pastor Conco",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-30",
    "daysToDue": 13,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-84",
    "family": "Familia Asaf Chipana Urribarri",
    "concept": "Mensualidad Agosto 2026 — Asaf Chipana Urribarri",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-03",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-84",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-85",
    "family": "Familia Liam Huanca Huamantupa",
    "concept": "Mensualidad Agosto 2026 — Liam Huanca Huamantupa",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-86",
    "family": "Familia Emma Micaela Sevilla",
    "concept": "Mensualidad Agosto 2026 — Emma Micaela Sevilla",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-31",
    "daysToDue": 14,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-87",
    "family": "Familia Aarón Balarezo Sosa",
    "concept": "Mensualidad Agosto 2026 — Aarón Balarezo Sosa",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-13",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-88",
    "family": "Familia Alexis Bringos Facho",
    "concept": "Mensualidad Agosto 2026 — Alexis Bringos Facho",
    "students": 1,
    "amount": 50,
    "amountPaid": 0,
    "remainingBalance": 50,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-89",
    "family": "Familia Emmanuel Rospligiosi",
    "concept": "Mensualidad Agosto 2026 — Emmanuel Rospligiosi",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-03",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-89",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-90",
    "family": "Familia Giussepe Granda",
    "concept": "Mensualidad Agosto 2026 — Giussepe Granda",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-06",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-90",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-91",
    "family": "Familia Mateo Quispe Trujillo",
    "concept": "Mensualidad Agosto 2026 — Mateo Quispe Trujillo",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-92",
    "family": "Familia Mirko Malpartida",
    "concept": "Mensualidad Agosto 2026 — Mirko Malpartida",
    "students": 1,
    "amount": 60,
    "amountPaid": 0,
    "remainingBalance": 60,
    "dueDate": "2026-08-01",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-93",
    "family": "Familia Marco Antonio  Adrian",
    "concept": "Mensualidad Agosto 2026 — Marco Antonio  Adrian",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-11",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-93",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-94",
    "family": "Familia Kiara Mariños",
    "concept": "Mensualidad Agosto 2026 — Kiara Mariños",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-13",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-94",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-95",
    "family": "Familia Karen Gutierrez",
    "concept": "Mensualidad Agosto 2026 — Karen Gutierrez",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-10",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-95",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-96",
    "family": "Familia Raphaela Yangali -  Isabella Yangali",
    "concept": "Mensualidad Agosto 2026 — Raphaela Yangali -  Isabella Yangali",
    "students": 1,
    "amount": 687,
    "amountPaid": 687,
    "remainingBalance": 0,
    "dueDate": "2026-08-11",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-96",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 687,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  },
  {
    "id": "inv-cp-97",
    "family": "Familia Mishel Suarez Cardenas",
    "concept": "Mensualidad Agosto 2026 — Mishel Suarez Cardenas",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-17",
    "daysToDue": 0,
    "status": "pendiente",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-98",
    "family": "Familia Antonela Diaz Sanchez",
    "concept": "Mensualidad Agosto 2026 — Antonela Diaz Sanchez",
    "students": 1,
    "amount": 297,
    "amountPaid": 0,
    "remainingBalance": 297,
    "dueDate": "2026-08-15",
    "daysToDue": -5,
    "status": "vencido",
    "paymentMethod": null,
    "remindedAt": null,
    "paymentLogs": []
  },
  {
    "id": "inv-cp-99",
    "family": "Familia Gael Mathias Lopez Loayza",
    "concept": "Mensualidad Agosto 2026 — Gael Mathias Lopez Loayza",
    "students": 1,
    "amount": 297,
    "amountPaid": 297,
    "remainingBalance": 0,
    "dueDate": "2026-08-04",
    "daysToDue": 0,
    "status": "pagado",
    "paymentMethod": "Yape",
    "remindedAt": null,
    "paymentLogs": [
      {
        "id": "log-cp-99",
        "timestamp": "17/08/2026 10:00:00",
        "registeredBy": "Secretaría (Nayeli)",
        "amount": 297,
        "method": "Yape",
        "voucherRef": "RECIBO-AGOSTO",
        "note": "Pago conciliado Agosto 2026 (Excel de Pagos)"
      }
    ]
  }
];
