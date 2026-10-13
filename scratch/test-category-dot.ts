/**
 * Verificación en tiempo de ejecución del PUNTITO DE CATEGORÍA en recuperaciones (ADR-0169).
 * Ejecutar con: node scratch/test-category-dot.ts
 */
import {
  resolveRecoveryCategoryVisual,
  dotClassForCategory,
  type StudentProfileLike,
} from "../src/lib/lesson-category-visual.ts";

let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✓ PASSED: ${message}`);
  } else {
    failed += 1;
    console.error(`❌ FAILED: ${message}`);
  }
}

function check(
  label: string,
  lesson: { student: string; category?: string | null; isMakeup?: boolean; dateStr?: string },
  students: StudentProfileLike[],
  expected: { isRecup: boolean; ageCategory?: string; dotClass?: string },
) {
  const v = resolveRecoveryCategoryVisual(lesson, students);
  assert(v.isRecup === expected.isRecup, `${label} → isRecup=${expected.isRecup} (obtenido ${v.isRecup})`);
  if (expected.ageCategory) {
    assert(
      v.ageCategory === expected.ageCategory,
      `${label} → ageCategory=${expected.ageCategory} (obtenido ${v.ageCategory})`,
    );
  }
  if (expected.dotClass) {
    assert(v.dotClass === expected.dotClass, `${label} → dotClass=${expected.dotClass} (obtenido ${v.dotClass})`);
  }
}

console.log("=== TEST PUNTITO DE CATEGORÍA EN RECUPERACIONES (ADR-0169) ===");

// --- Paleta del puntito ---
assert(dotClassForCategory("JUNIOR") === "bg-[#FBC02D]", "Junior → amarillo #FBC02D");
assert(dotClassForCategory("JUVENIL") === "bg-[#4CAF50]", "Juvenil → verde #4CAF50");
assert(dotClassForCategory("INFANTIL") === "bg-[#7C4DFF]", "Infantil → morado #7C4DFF");
assert(dotClassForCategory("ESTIMULACION") === "bg-[#EC407A]", "Estimulación → rosa #EC407A");
assert(dotClassForCategory("MASTER") === "bg-[#546E7A]", "Master → plomo #546E7A");
assert(dotClassForCategory("ADULTO") === "bg-[#546E7A]", "Alias ADULTO → plomo Master #546E7A");
assert(dotClassForCategory(null) === "bg-[#FBC02D]", "Categoría nula → fallback Junior");

// --- Categoría desde el perfil del alumno (la recuperación roja no la guarda) ---
const perfiles: StudentProfileLike[] = [
  { name: "Santiago Matías", status: "activo", ageCategory: "JUNIOR" },
  { name: "Andrea Fernanda", status: "activo", ageCategory: "JUVENIL" },
  { name: "Joan Paolo Rios Sotomayor", status: "activo", ageCategory: "ADULTO" },
  { name: "Fernando Sofía Fajardo Condo", status: "activo", ageCategory: "INFANTIL" },
  { name: "Bebé Estimulación", status: "activo", ageCategory: "ESTIMULACION" },
  { name: "Alumno Sin Categoria", status: "activo" },
];

check("Recup Junior", { student: "Santiago Matías", category: "RECUPERACION", isMakeup: true }, perfiles, {
  isRecup: true,
  ageCategory: "JUNIOR",
  dotClass: "bg-[#FBC02D]",
});
check("Recup Juvenil", { student: "Andrea Fernanda", category: "RECUPERACION", isMakeup: true }, perfiles, {
  isRecup: true,
  ageCategory: "JUVENIL",
  dotClass: "bg-[#4CAF50]",
});
check("Recup Adulto (alias) → Master plomo", { student: "Joan Paolo Rios Sotomayor", isMakeup: true }, perfiles, {
  isRecup: true,
  ageCategory: "MASTER",
  dotClass: "bg-[#546E7A]",
});
check("Recup Infantil", { student: "Fernando Sofía Fajardo Condo", isMakeup: true }, perfiles, {
  isRecup: true,
  ageCategory: "INFANTIL",
  dotClass: "bg-[#7C4DFF]",
});
check("Recup Estimulación", { student: "Bebé Estimulación", isMakeup: true }, perfiles, {
  isRecup: true,
  ageCategory: "ESTIMULACION",
  dotClass: "bg-[#EC407A]",
});

// --- Sin ageCategory en el perfil: manda la categoría real de la lección ---
check(
  "Recup sin perfil pero con category MASTER → plomo (no amarillo)",
  { student: "Alumno Sin Categoria", category: "MASTER", isMakeup: true },
  perfiles,
  { isRecup: true, ageCategory: "MASTER", dotClass: "bg-[#546E7A]" },
);

// --- Fallbacks heredados por nombre (perfiles históricos sin ageCategory) ---
check(
  "Recup sin perfil ni category, nombre 'Mishel' → Juvenil",
  { student: "Mishel Torres", category: "RECUPERACION", isMakeup: true },
  perfiles,
  { isRecup: true, ageCategory: "JUVENIL", dotClass: "bg-[#4CAF50]" },
);
check(
  "Recup sin datos, nombre 'Mirko' → Junior",
  { student: "Mirko Alvarez", category: "RECUPERACION", isMakeup: true },
  perfiles,
  { isRecup: true, ageCategory: "JUNIOR", dotClass: "bg-[#FBC02D]" },
);
check(
  "Recup sin datos y nombre desconocido → Junior",
  { student: "Alumno Desconocido", category: "RECUPERACION", isMakeup: true },
  perfiles,
  { isRecup: true, ageCategory: "JUNIOR", dotClass: "bg-[#FBC02D]" },
);

// --- Blindaje ADR-0155: la plantilla recurrente nunca es recuperación ---
check(
  "Plantilla recurrente con residuo category RECUPERACION → NO es recuperación",
  { student: "Aaron Balarezo Sosa", category: "RECUPERACION" },
  perfiles,
  { isRecup: false },
);
check(
  "Plantilla recurrente regular Junior → NO es recuperación",
  { student: "Santiago Matías", category: "JUNIOR" },
  perfiles,
  { isRecup: false, ageCategory: "JUNIOR" },
);
check(
  "Clase puntual con dateStr y category RECUPERACION → SÍ es recuperación",
  { student: "Andrea Fernanda", category: "RECUPERACION", dateStr: "2026-10-12" },
  perfiles,
  { isRecup: true, ageCategory: "JUVENIL", dotClass: "bg-[#4CAF50]" },
);

// --- Clase Personalizada: conserva su puntito con la edad del alumno ---
check(
  "Personalizada Adulto → plomo (no amarillo Junior)",
  { student: "Joan Paolo Rios Sotomayor", category: "PERSONALIZADA" },
  perfiles,
  { isRecup: false, ageCategory: "MASTER", dotClass: "bg-[#546E7A]" },
);

// --- Prioridad de perfil activo sobre homónimo inactivo (ADR-0107) ---
const homonimos: StudentProfileLike[] = [
  { name: "Homónimo Prueba", status: "baja", ageCategory: "INFANTIL" },
  { name: "Homónimo Prueba", status: "activo", ageCategory: "JUVENIL" },
];
check("Homónimo inactivo vs activo → gana el activo", { student: "Homónimo Prueba", isMakeup: true }, homonimos, {
  isRecup: true,
  ageCategory: "JUVENIL",
  dotClass: "bg-[#4CAF50]",
});

console.log("");
if (failed > 0) {
  console.error(`❌ ${failed} aserción(es) fallaron.`);
  process.exit(1);
}
console.log("✅ Todas las aserciones del puntito de categoría pasaron.");
