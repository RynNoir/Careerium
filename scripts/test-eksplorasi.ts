// Uji mode eksplorasi (deterministik, tanpa LLM). Pemakaian: npx tsx scripts/test-eksplorasi.ts
import { readFileSync } from "node:fs";
import { exploreCareers } from "../lib/prompts/eksplorasi";
import type { Profile } from "../lib/schemas";

let gagal = 0;
function cek(nama: string, ok: boolean, info?: unknown) {
  if (!ok) gagal++;
  console.log(`${ok ? "LULUS" : "GAGAL"}  ${nama}${ok || info === undefined ? "" : `\n       ${JSON.stringify(info)}`}`);
}
const sk = (nama: string, tingkat: "dasar" | "menengah" = "menengah") => ({ nama, jenis: "teknis" as const, tingkat, bukti: `memakai ${nama}` });
const profil = (skills: string[]): Profile => ({ cv_valid: true, proyek: [], skills: skills.map((n) => sk(n)) });

async function main() {
  const kasus: [string, Profile, string][] = [
    ["Rani (web)", JSON.parse(readFileSync("data/demo/rani.json", "utf8")).profile, "web_frontend"],
    ["Anak akuntansi (data)", profil(["Excel", "SQL", "Python", "Power BI", "Statistika"]), "data_analyst"],
    ["Desainer", profil(["Figma", "Wireframe", "User Research", "Prototype", "Design System"]), "uiux"],
    ["Flutter dev", profil(["Flutter", "Dart", "Firebase", "REST API", "Git", "Provider"]), "mobile"],
  ];
  for (const [label, p, harap] of kasus) {
    const t = Date.now();
    const r = await exploreCareers(p);
    const ms = Date.now() - t;
    console.log(`\n${label}: ${r.jalur.map((j) => `${j.posisi} ${j.skor} (wajib ${j.wajib_terpenuhi}/${j.wajib_total})`).join(" | ")}  [${ms}ms]`);
    console.log(`  #1 alasan: ${r.jalur[0].alasan}`);
    cek(`${label}: peringkat 1 = ${harap}`, r.jalur[0].posisi_preset === harap, r.jalur.map((j) => j.posisi_preset));
    cek(`${label}: 4 jalur, urut skor menurun`, r.jalur.length === 4 && r.jalur.every((j, i) => i === 0 || r.jalur[i - 1].skor >= j.skor));
  }
  const kosong = await exploreCareers(profil([]));
  cek("profil tanpa skill: tetap 4 jalur, skor 0, alasan ramah", kosong.jalur.length === 4 && kosong.jalur.every((j) => j.skor === 0 && j.alasan.length > 0));
  const a = JSON.stringify(await exploreCareers(kasus[1][1]));
  const b = JSON.stringify(await exploreCareers(kasus[1][1]));
  cek("deterministik: input sama -> hasil sama", a === b);

  console.log(gagal ? `\n${gagal} gagal` : "\nSemua lulus");
  process.exit(gagal ? 1 : 0);
}
main();
