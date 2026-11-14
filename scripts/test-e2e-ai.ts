// Uji rantai AI lengkap dengan LLM asli (memakai kuota API): profil -> gap -> roadmap -> pertanyaan -> penilaian.
// Pemakaian: npx tsx scripts/test-e2e-ai.ts   (hasil disimpan ke folder temp OS)
import { loadEnvConfig } from "@next/env";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let gagal = 0;
function cek(nama: string, ok: boolean, info?: unknown) {
  if (!ok) gagal++;
  console.log(`${ok ? "LULUS" : "GAGAL"}  ${nama}${ok || info === undefined ? "" : `\n       ${JSON.stringify(info).slice(0, 300)}`}`);
}

async function main() {
  loadEnvConfig(process.cwd());
  const { extractProfile } = await import("../lib/prompts/profile");
  const { analyzeGap } = await import("../lib/prompts/gap");
  const { makeRoadmap } = await import("../lib/prompts/roadmap");
  const { makeQuestions } = await import("../lib/prompts/questions");
  const { gradeAnswer } = await import("../lib/prompts/grade");

  const t0 = Date.now();
  const profile = await extractProfile(readFileSync("data/demo/cv-rani.txt", "utf8"));
  cek(`profil: ${profile.skills.length} skill`, profile.cv_valid && profile.skills.length >= 5);

  const gap = await analyzeGap({ profile, posisi: "Web Developer", posisi_preset: "web_frontend" });
  console.log(`       skor ${gap.skor}, kekuatan: ${gap.kekuatan.map((k) => k.nama).join(", ")}`);
  console.log(`       gap: ${gap.gap.map((g) => `${g.nama}(${g.prioritas})`).join(", ")}`);
  cek("gap: skor 0–100, ada gap & kekuatan, radar 5 sumbu", gap.skor >= 0 && gap.skor <= 100 && gap.gap.length > 0 && gap.kekuatan.length > 0 && gap.radar.length === 5);
  cek("gap: label sumber jujur (tanpa data lowongan -> perkiraanUmum)", gap.sumberLowongan.perkiraanUmum === true || gap.sumberLowongan.jumlah > 0, gap.sumberLowongan);

  const roadmap = await makeRoadmap({ gap, tahap: "semester_akhir", posisi: "Web Developer", tujuan: "magang" });
  const teks = JSON.stringify(roadmap);
  cek("roadmap: 4 minggu, tiap minggu ada kegiatan", roadmap.minggu.length === 4 && roadmap.minggu.every((w) => w.kegiatan.length > 0));
  cek("roadmap: tanpa URL", !/https?:\/\/|www\./i.test(teks));
  const wajib = gap.gap.filter((g) => g.prioritas === "wajib").map((g) => g.nama.toLowerCase());
  const awal = JSON.stringify(roadmap.minggu.slice(0, 2)).toLowerCase();
  cek("roadmap: gap wajib muncul di minggu 1–2", wajib.length === 0 || wajib.some((w) => awal.includes(w)), { wajib });
  roadmap.minggu.forEach((w) => console.log(`       M${w.minggu}: ${w.fokus}`));

  const { questions } = await makeQuestions(gap, "Web Developer");
  const namaGap = new Set(gap.gap.map((g) => g.nama));
  cek("pertanyaan: tepat 5, semua gap_asal dari daftar gap", questions.length === 5 && questions.every((q) => namaGap.has(q.gap_asal)), questions);
  cek("pertanyaan: sapaan \"kamu\", bukan \"Anda\"", !questions.some((q) => /Anda/.test(q.pertanyaan)), questions.map((q) => q.pertanyaan));
  cek("pertanyaan: topik beragam (>= 4 gap_asal berbeda bila gap >= 4)", new Set(questions.map((q) => q.gap_asal)).size >= Math.min(gap.gap.length, 4));
  questions.forEach((q, i) => console.log(`       Q${i + 1} [${q.jenis}/${q.gap_asal}] ${q.pertanyaan}`));

  const perilaku = questions.find((q) => q.jenis === "perilaku") ?? questions[0];
  const bagus = await gradeAnswer(
    perilaku,
    "Saat tugas Pemrograman Web semester lalu, tim kami harus membuat website katalog UMKM dalam tiga minggu. Tugas saya membangun halaman katalog. Saya memecah halaman menjadi komponen React, membuat jadwal harian di GitHub Projects, dan setiap dua hari menyamakan data dengan teman yang membuat API. Hasilnya website selesai dua hari lebih cepat dan dosen memberi nilai A.",
  );
  cek(`jawaban STAR lengkap -> dinilai, skor ${bagus.skor_total}`, bagus.status === "dinilai" && bagus.skor_total >= 50, bagus);
  const ngawur = await gradeAnswer(perilaku, "Kucing saya suka makan ikan asin dan tidur di atas lemari setiap sore hari.");
  cek(`jawaban ngawur -> tidak dapat dinilai, skor ${ngawur.skor_total}`, ngawur.status === "tidak_dapat_dinilai" && ngawur.skor_total === 0, ngawur);

  const out = join(tmpdir(), "careerium-e2e-hasil.json");
  writeFileSync(out, JSON.stringify({ profile, gap, roadmap, questions, grade: bagus }, null, 2));
  console.log(`       hasil: ${out}`);
  console.log(`\nTotal ${Math.round((Date.now() - t0) / 1000)} detik. ${gagal ? `${gagal} gagal` : "Semua lulus"}`);
  process.exit(gagal ? 1 : 0);
}
main();
