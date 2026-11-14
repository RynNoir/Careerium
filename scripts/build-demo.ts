// Bangun ulang data/demo/rani.json dari hasil ASLI alur lengkap (langkah 7.1). Memakai kuota API.
// Jalankan ulang setelah data/lowongan.json atau prompt berubah. Pemakaian: npx tsx scripts/build-demo.ts
import { loadEnvConfig } from "@next/env";
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "data/demo/rani.json";

async function main() {
  loadEnvConfig(process.cwd());
  const { understandIntent } = await import("../lib/prompts/intent");
  const { extractProfile } = await import("../lib/prompts/profile");
  const { analyzeGap } = await import("../lib/prompts/gap");
  const { makeRoadmap } = await import("../lib/prompts/roadmap");
  const { makeQuestions } = await import("../lib/prompts/questions");
  const { gradeAnswer } = await import("../lib/prompts/grade");
  const { askJSON } = await import("../lib/llm");
  const { z } = await import("zod");
  const S = await import("../lib/schemas");

  const lama = JSON.parse(readFileSync(FILE, "utf8"));
  const tujuan: string = lama.input.tujuan;
  const cv = readFileSync("data/demo/cv-rani.txt", "utf8");

  const intent = await understandIntent(tujuan);
  if (intent.kategori !== "karier_ti" || !intent.tahap) throw new Error(`Intent Rani tidak sesuai: ${JSON.stringify(intent)}`);
  console.log("intent  :", intent.tujuan, intent.posisi_target, intent.posisi_preset, intent.tahap);

  const profile = await extractProfile(cv);
  if (!profile.cv_valid || profile.skills.length < 5) throw new Error("Profil Rani terlalu sedikit skill");
  console.log("profile :", profile.skills.map((s) => s.nama).join(", "));

  const posisi = intent.posisi_target ?? "Web Developer";
  const gap = await analyzeGap({ profile, posisi, posisi_preset: intent.posisi_preset });
  console.log(`gap     : skor ${gap.skor}, ${gap.gap.length} gap, perkiraanUmum=${gap.sumberLowongan.perkiraanUmum}`);

  const roadmap = await makeRoadmap({ gap, tahap: intent.tahap, posisi, tujuan: intent.tujuan });
  console.log("roadmap :", roadmap.minggu.map((w) => w.fokus).join(" | "));

  const questions = await makeQuestions(gap, posisi);
  console.log("pertanyaan:", questions.questions.length);

  // Contoh jawaban Rani (hanya dari isi CV) + nilai ASLI dari AI untuk jawaban persis itu.
  const contoh = await askJSON({
    label: "demo-jawaban",
    schema: z.object({ jawaban: z.array(z.string()) }),
    instructions:
      "Tulis contoh jawaban wawancara dari sudut pandang Rani, mahasiswa semester 6, dalam bahasa Indonesia santai-sopan, 50–90 kata per jawaban, pola STAR untuk pertanyaan perilaku. Hanya pakai pengalaman yang ada di <cv>; jika topik belum dikuasai, jawab jujur apa yang sudah dipelajari dan rencana belajarnya. Kembalikan satu jawaban per pertanyaan, urutan sama.",
    prompt: `<cv>\n${cv}\n</cv>\n<pertanyaan>\n${questions.questions.map((q, i) => `${i + 1}. ${q.pertanyaan}`).join("\n")}\n</pertanyaan>`,
    check: (o) => (o.jawaban.length >= 5 ? null : "jawaban kurang dari 5"),
  });
  const contoh_jawaban: { pertanyaan: string; jawaban: string; grade: unknown }[] = [];
  for (const [i, q] of questions.questions.entries()) {
    const jawaban = contoh.jawaban[i].replace(/\s+/g, " ").trim().slice(0, 1500);
    const grade = S.Grade.parse(await gradeAnswer(q, jawaban));
    contoh_jawaban.push({ pertanyaan: q.pertanyaan, jawaban, grade });
    console.log(`jawaban ${i + 1}: ${grade.status} ${grade.skor_total}`);
  }

  const out = {
    _catatan: `Persona demo Rani (fiktif). Dibangun dari hasil asli oleh scripts/build-demo.ts pada ${new Date().toISOString().slice(0, 10)}. Jangan diedit manual; jalankan ulang skripnya.`,
    input: { tujuan, posisi },
    intent: S.Intent.parse(intent),
    profile: S.Profile.parse(profile),
    gap: S.GapResult.parse(gap),
    roadmap: S.Roadmap.parse(roadmap),
    questions: S.QuestionsResponse.parse(questions),
    contoh_jawaban,
  };
  writeFileSync(FILE, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nTersimpan: ${FILE}`);
}

main().catch((e) => {
  console.error("GAGAL:", e.message);
  process.exit(1);
});
