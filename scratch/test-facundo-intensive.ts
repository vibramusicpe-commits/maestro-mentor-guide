/**
 * Harness de verificación en runtime (ADR-0165 / ADR-0167).
 * Comprueba contra los motores OFICIALES del Horario/Kardex que los alumnos
 * de Plan Intensivo (90 min) proyectan DOS bloques contiguos de 45m y que el
 * filtro `isLessonInStudentCycle` (el que usa AgendaBoard) los aprueba.
 *
 * Uso:
 *   npx esbuild scratch/test-facundo-intensive.ts --bundle --platform=node \
 *     --format=esm --alias:@=./src --outfile=scratch/.tmp-facu.mjs && node scratch/.tmp-facu.mjs
 */
import { computeStudentMonthSessions } from "@/lib/kardex-calculator";
import { isLessonInStudentCycle } from "@/lib/student-cycle";

const KEY = "anon_897abc3685c27a2e113b8022caaf12a8dc8233b25aa9ce5397c83ffa88362804";
const BASE = "https://pdey9yma.us-east.insforge.app/api/database/records";

const STUDENTS: { id: string; label: string }[] = [
  { id: "837823f4-693e-469a-8bc9-fe74628ac73f", label: "Facundo Joaquin" },
  { id: "af9e9ac4-910f-4c66-901b-7c65ab7f5f80", label: "Matias Gabriel" },
];

async function load(id: string) {
  const rows = await fetch(
    `${BASE}/students?id=eq.${id}&select=id,full_name,status,instrument,modality,emergency_contact`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
  ).then((r) => r.json());
  const db = rows[0];
  const ec = db.emergency_contact || {};
  const student: any = {
    id: db.id,
    name: db.full_name,
    status: db.status,
    instrument: db.instrument,
    modality: db.modality,
    ...ec,
    scheduleLessons: ec.scheduleLessons,
  };
  const allSchedule = (ec.scheduleLessons || []).map((l: any) => ({ ...l, student: db.full_name }));
  return { student, allSchedule };
}

async function main() {
  let allOk = true;
  for (const { id, label } of STUDENTS) {
    const { student, allSchedule } = await load(id);
    console.log(`\n================ ${label} (${student.modality}) ================`);

    // 1) Motor del Kardex: consolidación mensual (Octubre 2026)
    const oct = computeStudentMonthSessions({ student, allSchedule, selectedYear: 2026, selectedMonth: 9 });
    const octMap: Record<string, string[]> = {};
    oct
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
      .forEach((s) => {
        (octMap[s.dateStr] = octMap[s.dateStr] || []).push(`${s.time}–${s.timeEnd} [${s.status}]`);
      });
    console.log("Kardex Octubre (consolidado):");
    Object.entries(octMap).forEach(([d, v]) => console.log(`  ${d}: ${v.join(" | ")}`));

    // 2) Filtro del Horario de Clases (AgendaBoard): por franja y fecha
    const recurring = allSchedule.filter((l: any) => !l.dateStr && !l.isMakeup);
    // Expectativa por alumno: Facundo excluye el 31/10 (su 4ª fecha es el 24/10);
    // Matias arranca el 10/10, así que su 4ª fecha SÍ es el 31/10.
    const perStudent: Record<string, { date: string; expect: number; note: string }[]> = {
      "837823f4-693e-469a-8bc9-fe74628ac73f": [
        { date: "2026-10-24", expect: 2, note: "Semana 4 (el reclamo del usuario)" },
        { date: "2026-10-31", expect: 0, note: "Fecha excluida / 5ª semana" },
      ],
      "af9e9ac4-910f-4c66-901b-7c65ab7f5f80": [
        { date: "2026-10-24", expect: 2, note: "Semana 4 (el reclamo del usuario)" },
        { date: "2026-10-31", expect: 2, note: "4ª clase legítima de su ciclo (10/10→09/11)" },
      ],
    };
    const checks = perStudent[id];
    console.log("Horario de Clases (isLessonInStudentCycle) por fecha:");
    for (const c of checks) {
      const dayKey = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][
        new Date(`${c.date}T12:00:00`).getDay()
      ];
      const shown = recurring.filter((l: any) =>
        isLessonInStudentCycle(student, l, c.date, l.time, allSchedule)
      );
      const ok = shown.length === c.expect;
      if (!ok) allOk = false;
      console.log(
        `  ${c.date} (${dayKey}) → ${shown.length} bloque(s) ${ok ? "✅" : "❌"} · ${c.note}`
      );
      shown.forEach((l: any) => console.log(`      · ${l.time} (sn:${l.sessionNumber}) ${l.room}/${l.teacher}`));
    }
  }
  console.log(`\nRESULTADO GLOBAL: ${allOk ? "✅ TODO OK" : "❌ HAY FALLOS"}`);
  if (!allOk) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
