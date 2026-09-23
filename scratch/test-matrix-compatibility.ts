import {
  normalizeCategory,
  checkAgeCompatibility,
  checkDurationCompatibility,
  getOfficialTeacherRoom,
  evaluateSlotPedagogicalCompatibility,
} from "../src/lib/room-compatibility";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("=== INICIANDO TEST DE COMPATIBILIDAD PEDAGÓGICA (ADR-0121) ===");

// 1. Normalización
assert(normalizeCategory("ADULTO") === "MASTER", "ADULTO normaliza a MASTER");
assert(normalizeCategory("adulto") === "MASTER", "adulto minúscula normaliza a MASTER");
assert(normalizeCategory("MASTER") === "MASTER", "MASTER normaliza a MASTER");
assert(normalizeCategory("Estimulación Musical") === "ESTIMULACION", "Estimulación Musical normaliza a ESTIMULACION");
assert(normalizeCategory("Infantil") === "INFANTIL", "Infantil normaliza a INFANTIL");
assert(normalizeCategory("Junior") === "JUNIOR", "Junior normaliza a JUNIOR");
assert(normalizeCategory("Juvenil") === "JUVENIL", "Juvenil normaliza a JUVENIL");
assert(normalizeCategory("Personalizada") === "PERSONALIZADA", "Personalizada normaliza a PERSONALIZADA");

// 2. Compatibilidad de Edad
assert(!checkAgeCompatibility("JUNIOR", "MASTER").compatible, "Junior vs Master debe ser incompatible");
assert(!checkAgeCompatibility("MASTER", "JUNIOR").compatible, "Master vs Junior debe ser incompatible");
assert(!checkAgeCompatibility("JUNIOR", "ADULTO").compatible, "Junior vs ADULTO (alias) debe ser incompatible");
assert(checkAgeCompatibility("JUNIOR", "JUVENIL").compatible, "Junior vs Juvenil debe ser compatible");
assert(checkAgeCompatibility("JUVENIL", "MASTER").compatible, "Juvenil vs Master debe ser compatible");
assert(checkAgeCompatibility("JUNIOR", "JUNIOR").compatible, "Junior vs Junior debe ser compatible");
assert(checkAgeCompatibility("MASTER", "MASTER").compatible, "Master vs Master debe ser compatible");

assert(checkAgeCompatibility("INFANTIL", "INFANTIL").compatible, "Infantil con Infantil debe ser compatible");
assert(!checkAgeCompatibility("INFANTIL", "JUNIOR").compatible, "Infantil con Junior debe ser incompatible");
assert(!checkAgeCompatibility("INFANTIL", "MASTER").compatible, "Infantil con Master debe ser incompatible");

assert(checkAgeCompatibility("ESTIMULACION", "ESTIMULACION").compatible, "Estimulación con Estimulación debe ser compatible");
assert(!checkAgeCompatibility("ESTIMULACION", "INFANTIL").compatible, "Estimulación con Infantil debe ser incompatible");
assert(!checkAgeCompatibility("ESTIMULACION", "JUNIOR").compatible, "Estimulación con Junior debe ser incompatible");

assert(!checkAgeCompatibility("PERSONALIZADA", "PERSONALIZADA").compatible, "Personalizada nunca comparte sala");
assert(!checkAgeCompatibility("PERSONALIZADA", "JUNIOR").compatible, "Personalizada con Junior incompatible");

// 3. Compatibilidad de Duraciones
assert(checkDurationCompatibility(45, 45).compatible, "45m con 45m debe ser compatible");
assert(checkDurationCompatibility(90, 90).compatible, "90m con 90m debe ser compatible");
assert(!checkDurationCompatibility(45, 90).compatible, "45m con 90m debe ser incompatible");
assert(!checkDurationCompatibility(90, 45).compatible, "90m con 45m debe ser incompatible");

// 4. Salas Oficiales Docentes (Corrección de error tipográfico del diagrama)
assert(getOfficialTeacherRoom("Jeremy") === "Sala A", "Jeremy dicta en Sala A");
assert(getOfficialTeacherRoom("Fernando") === "Sala B", "Fernando dicta en Sala B");
assert(getOfficialTeacherRoom("Nathaly") === "Sala C", "Nathaly dicta en Sala C");
assert(getOfficialTeacherRoom("Claudia") === "Sala D", "Claudia dicta en Sala D");

// 5. Diagnóstico Integral de Turno
const resJuniorWithMaster = evaluateSlotPedagogicalCompatibility({
  studentName: "Lucas Master",
  category: "MASTER",
  modality: "Regular (8 clases / 45 min)",
  teacher: "Fernando",
  room: "Sala B",
  existingRoomLessons: [
    {
      student: "Mateo Junior",
      teacher: "Fernando",
      room: "Sala B",
      category: "JUNIOR",
      status: "programada",
    },
  ],
});
assert(resJuniorWithMaster.hasWarning, "Debe alertar incompatibilidad entre Master y Junior");
assert(
  resJuniorWithMaster.warnings.some((w) => w.type === "age_incompatibility"),
  "Debe incluir warning de tipo age_incompatibility"
);

const resJuniorWithJuvenil = evaluateSlotPedagogicalCompatibility({
  studentName: "Santiago Juvenil",
  category: "JUVENIL",
  modality: "Regular (8 clases / 45 min)",
  teacher: "Jeremy",
  room: "Sala A",
  existingRoomLessons: [
    {
      student: "Mateo Junior",
      teacher: "Jeremy",
      room: "Sala A",
      category: "JUNIOR",
      status: "programada",
    },
  ],
});
assert(!resJuniorWithJuvenil.hasWarning, "Junior y Juvenil no deben generar warnings");

const resDurationConflict = evaluateSlotPedagogicalCompatibility({
  studentName: "Ana Regular",
  category: "JUVENIL",
  modality: "Regular (8 clases / 45 min)",
  teacher: "Jeremy",
  room: "Sala A",
  existingRoomLessons: [
    {
      student: "Carlos Intensivo",
      teacher: "Jeremy",
      room: "Sala A",
      category: "JUVENIL",
      modality: "Intensivo (4 clases / 90 min)",
      status: "programada",
    },
  ],
});
assert(resDurationConflict.hasWarning, "Debe alertar incompatibilidad entre 45m y 90m");
assert(
  resDurationConflict.warnings.some((w) => w.type === "duration_incompatibility"),
  "Debe incluir warning de tipo duration_incompatibility"
);

const resPersonalizedConflict = evaluateSlotPedagogicalCompatibility({
  studentName: "Pedro Personalizado",
  category: "PERSONALIZADA",
  isPersonalized: true,
  modality: "Regular (8 clases / 45 min)",
  teacher: "Fernando",
  room: "Sala B",
  existingRoomLessons: [
    {
      student: "Mateo Alumno",
      teacher: "Fernando",
      room: "Sala B",
      category: "MASTER",
      status: "programada",
    },
  ],
});
assert(resPersonalizedConflict.hasWarning, "Clase personalizada debe alertar conflicto de aforo exclusivo");
assert(
  resPersonalizedConflict.warnings.some((w) => w.type === "single_student_conflict"),
  "Debe incluir warning de tipo single_student_conflict"
);

// 6. Test Demo Nivelación (Aforo exclusivo 1 alumno · 45 min)
const resDemoNivelacionConflict = evaluateSlotPedagogicalCompatibility({
  studentName: "Diego Nivelación",
  category: "JUNIOR",
  modality: "Demo Nivelación (1 Alumno · 45 min)",
  teacher: "Fernando",
  room: "Sala B",
  existingRoomLessons: [
    {
      student: "Mateo Alumno",
      teacher: "Fernando",
      room: "Sala B",
      category: "JUNIOR",
      status: "programada",
    },
  ],
});
assert(resDemoNivelacionConflict.hasWarning, "Demo Nivelación debe alertar conflicto si ya hay un alumno en la sala");
assert(
  resDemoNivelacionConflict.warnings.some((w) => w.type === "single_student_conflict"),
  "Debe incluir warning de tipo single_student_conflict para Demo Nivelación"
);

console.log("\n🎉 ¡TODAS LAS PRUEBAS DE LA MATRIZ PEDAGÓGICA (ADR-0121) PASARON CON ÉXITO!");
