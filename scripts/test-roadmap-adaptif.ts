// Uji roadmap adaptif. Bagian offline selalu jalan; bagian LLM jalan bila kunci API terisi.
// Pemakaian: npx tsx scripts/test-roadmap-adaptif.ts
import { loadEnvConfig } from "@next/env";
import { readFileSync } from "node:fs";

let gagal = 0;
function cek(nama: string, ok: boolean, info?: unknown) {
  if (!ok) gagal++;
  console.log(`${ok ? "LULUS" : "GAGAL"}  ${nama}${ok || info === undefined ? "" : `\n       ${JSON.stringify(info).slice(0, 300)}`}`);
}

async function main() {
  loadEnvConfig(process.cwd());
  const { analisisWawancara, adaptiveFallback, makeAdaptiveRoadmap } = await import("../lib/prompts/roadmap-adaptif");
  const { kataKunci } = await import("../lib/prompts/roadmap");
  const rani = JSON.parse(readFileSync("data/demo/rani.json", "utf8"));
  const q = rani.questions.questions as { gap_asal: string }[];
  const r = (skor: number) => ({ kejelasan: skor, relevansi: skor, kedalaman: skor, struktur: skor });

  // Topik 1 lemah (35), topik 3 tidak dapat dinilai, sisanya bagus. Rubrik struktur paling lemah.
  const hasil = [
    { gap_asal: q[0].gap_asal, status: "dinilai" as const, skor_total: 35, skor: { ...r(3), struktur: 1 } },
    { gap_asal: q[1].gap_asal, status: "dinilai" as const, skor_total: 81, skor: { ...r(4), struktur: 2 } },
    { gap_asal: q[2].gap_asal, status: "tidak_dapat_dinilai" as const, skor_total: 0 },
    { gap_asal: q[3].gap_asal, status: "dinilai" as const, skor_total: 75, skor: { ...r(4), struktur: 3 } },
    { gap_asal: q[4].gap_asal, status: "dinilai" as const, skor_total: 88, skor: r(5) },
  ];

  // ---- Offline ----
  const a = analisisWawancara(hasil);
  cek("fokus = topik 'tidak dapat dinilai' lalu skor 35 (urut terlemah)", a.fokus.map((f) => f.nama).join("|") === [q[2].gap_asal, q[0].gap_asal].join("|"), a.fokus);
  cek("rubrik terlemah = struktur", a.rubrikLemah === "struktur", a.rubrikLemah);
  cek("rata-rata total dihitung (0 untuk tidak dapat dinilai)", a.rataTotal === Math.round((35 + 81 + 0 + 75 + 88) / 5));
  const bagus = analisisWawancara(hasil.filter((h) => h.status === "dinilai" && h.skor_total >= 75));
  cek("semua bagus -> tidak ada fokus ulang", bagus.fokus.length === 0);
  cek("topik sama muncul 2x -> dirata-rata", analisisWawancara([
    { gap_asal: "X", status: "dinilai", skor_total: 40 },
    { gap_asal: "X", status: "dinilai", skor_total: 90 },
  ]).fokus.length === 0);

  const req = { gap: rani.gap, tahap: "semester_akhir" as const, posisi: "Web Developer", tujuan: "magang" as const, hasil_wawancara: hasil, roadmap_lama: rani.roadmap };
  const fb = adaptiveFallback(req);
  cek("fallback demo: roadmap lama + diperbarui=false + catatan jujur", !!fb && fb.diperbarui === false && fb.minggu.length === 4 && /belum bisa diperbarui/.test(fb.catatan));
  cek("fallback tanpa roadmap_lama -> null (tidak mengarang)", adaptiveFallback({ ...req, roadmap_lama: undefined }) === null);

  // ---- LLM ----
  if (!process.env.GROQ_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.log("\n(lewati uji LLM: kunci API belum diisi)");
  } else {
    const t = Date.now();
    const hasilAI = await makeAdaptiveRoadmap(req);
    console.log(`\n[${Date.now() - t}ms] catatan: ${hasilAI.catatan}`);
    hasilAI.minggu.forEach((w) => console.log(`  M${w.minggu}: ${w.fokus}`));
    const awal = JSON.stringify(hasilAI.minggu.slice(0, 2)).toLowerCase();
    cek("LLM: diperbarui=true, 4 minggu, fokus_ulang dari kode", hasilAI.diperbarui && hasilAI.minggu.length === 4 && hasilAI.fokus_ulang[0] === q[2].gap_asal);
    cek("LLM: topik terlemah muncul di minggu 1–2", kataKunci(hasilAI.fokus_ulang[0]).some((k) => awal.includes(k)), hasilAI.minggu.slice(0, 2));
    cek("LLM: tanpa URL", !/https?:\/\/|www\./i.test(JSON.stringify(hasilAI)));
  }

  console.log(gagal ? `\n${gagal} gagal` : "\nSemua lulus");
  process.exitCode = gagal ? 1 : 0;
}
main();
