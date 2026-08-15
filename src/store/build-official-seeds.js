import fs from 'fs';

// 1. Parsear Alumnos
const contentAlumnos = fs.readFileSync('./public/alumnos_final.csv', 'utf8');
const linesAlumnos = contentAlumnos.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0).slice(1);

const students = linesAlumnos.map((line, i) => {
  const parts = line.split(',');
  const name = parts[0]?.trim() || '';
  const family = parts[1]?.trim() || ('Familia ' + (name.split(' ')[1] || name));
  const instrument = parts[2]?.trim() || 'Piano';
  const teacher = parts[3]?.trim() || 'Prof. por Asignar';
  const modalityRaw = parts[4]?.trim() || '';
  const email = parts[5]?.trim() || (name.toLowerCase().replace(/\s+/g, '.') + '@gmail.com');
  const phone = parts[6]?.trim() || '+51 900 000 000';
  const emergencyName = parts[7]?.trim() || (family + ' (Titular)');
  const emergencyPhone = parts[8]?.trim() || phone || '+51 900 000 000';

  const modality = modalityRaw.toLowerCase().includes('inten')
    ? 'Intensivo (4 clases / 90 min)'
    : 'Regular (8 clases / 45 min)';

  return {
    id: 'as-' + (i + 1),
    name,
    family,
    instrument,
    level: 'Nivel 1',
    teacher,
    modality,
    status: 'activo',
    attendanceRate: 100,
    payment: 'al-dia',
    risk: 0,
    joinedAt: 'Ago 2026',
    makeupCredits: 0,
    balance: 0,
    recentAttendance: ['presente', 'presente', 'presente'],
    teacherNote: 'Alumno importado del registro oficial.',
    email,
    phone,
    emergencyContact: {
      name: emergencyName,
      phone: emergencyPhone,
      relation: 'Apoderado',
    },
    birthdate: '15 de Agosto',
  };
});

// 2. Parsear Horarios
const contentHorarios = fs.readFileSync('./public/horarios_final.csv', 'utf8');
const linesHorarios = contentHorarios.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0).slice(1);

const schedule = linesHorarios.map((line, i) => {
  const parts = line.split(',');
  const student = parts[0]?.trim() || '';
  const day = parts[1]?.trim() || 'Lun';
  const time = parts[2]?.trim() || '16:00';
  const room = parts[3]?.trim() || 'Sala 1';
  const teacher = parts[4]?.trim() || 'Jeremy';
  const instrument = parts[5]?.trim() || 'Piano';
  const category = parts[6]?.trim() || 'JUNIOR';

  return {
    id: 'sch-' + (i + 1),
    day,
    time,
    room,
    student,
    teacher,
    instrument,
    category,
    status: 'programada',
  };
});

const outputCode = `// ===== Datos Semilla Oficiales Generados desde CSV =====
import type { AdminStudent, ScheduledLesson } from "./admin-seeds";

export const officialAdminStudents: AdminStudent[] = ${JSON.stringify(students, null, 2)};

export const officialSchedule: ScheduledLesson[] = ${JSON.stringify(schedule, null, 2)};
`;

fs.writeFileSync('./src/store/official-seeds.ts', outputCode, 'utf8');
console.log('Generado ./src/store/official-seeds.ts con exito');
console.log('Alumnos:', students.length);
console.log('Clases de Horario:', schedule.length);
