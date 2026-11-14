// Bangun ulang data/demo/rani.json dari hasil ASLI alur lengkap (langkah 7.1). Memakai kuota API.
// Jalankan ulang setelah data/lowongan.json atau prompt berubah. Pemakaian: npx tsx scripts/build-demo.ts
import { loadEnvConfig } from "@next/env";
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "data/demo/rani.json";
// Jeda antarpanggilan AI: batas Groq gratis 8.000 token/menit per model, alur lengkap ~11 panggilan.
const jeda = (ms = 7000) => new Promise((r) => setTimeout(r, ms));
// Kuota habis / JSON tidak valid dari model cadangan sering sementara: ulangi langkah yang sama, bukan seluruh alur.
async function coba<T>(label: string, fn: () => Promise<T>, kali = 4): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i >= kali) throw e;
      console.warn(`  ${label} gagal (percobaan ${i}/${kali}): ${e instanceof Error ? e.message : e}. Tunggu 60 dtk...`);
      await jeda(60_000);
    }
  }
}

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

  const intent = await coba("intent", () => understandIntent(tujuan));
  if (intent.kategori !== "karier_ti" || !intent.tahap) throw new Error(`Intent Rani tidak sesuai: ${JSON.stringify(intent)}`);
  console.log("intent  :", intent.tujuan, intent.posisi_target, intent.posisi_preset, intent.tahap);
  const tahap = intent.tahap; // sudah dipastikan tidak null di atas; disimpan agar tetap sempit di dalam closure

  await jeda();
  const profile = await coba("profile", () => extractProfile(cv));
  if (!profile.cv_valid || profile.skills.length < 5) throw new Error("Profil Rani terlalu sedikit skill");
  console.log("profile :", profile.skills.map((s) => s.nama).join(", "));

  const posisi = intent.posisi_target ?? "Web Developer";
  await jeda();
  const gap = await coba("gap", async () => {
    const g = await analyzeGap({ profile, posisi, posisi_preset: intent.posisi_preset, tahap: intent.tahap, tujuan: intent.tujuan });
    // Demo harus menampilkan penilaian AI asesor, bukan aturan cadangan.
    const dariAi = (g.penilaian ?? []).filter((p) => p.sumber === "ai").length;
    if (g.metode_skor !== "ai_rubrik" || dariAi < (g.penilaian?.length ?? 0) / 2 || !g.ringkasan_ai)
      throw new Error(`gap belum dinilai AI asesor (metode ${g.metode_skor}, ${dariAi} nilai AI)`);
    return g;
  });
  console.log(`gap     : skor ${gap.skor} (${gap.metode_skor}), ${gap.gap.length} gap, perkiraanUmum=${gap.sumberLowongan.perkiraanUmum}`);
  for (const p of gap.penilaian ?? []) console.log(`  ${p.nilai} [${p.sumber}] ${p.nama}: ${p.alasan}`);
  console.log("ringkasan:", gap.ringkasan_ai);

  await jeda();
  const roadmap = await coba("roadmap", () => makeRoadmap({ gap, tahap, posisi, tujuan: intent.tujuan }));
  console.log("roadmap :", roadmap.minggu.map((w) => w.fokus).join(" | "));

  await jeda();
  const questions = await coba("pertanyaan", () => makeQuestions(gap, posisi));
  console.log("pertanyaan:", questions.questions.length);

  // Contoh jawaban Rani (hanya dari isi CV) + nilai ASLI dari AI untuk jawaban persis itu.
  await jeda();
  const contoh = await coba("contoh jawaban", () => askJSON({
    label: "demo-jawaban",
    schema: z.object({ jawaban: z.array(z.string()) }),
    instructions:
      "Tulis contoh jawaban wawancara dari sudut pandang Rani, mahasiswa semester 6, dalam bahasa Indonesia santai-sopan, 50–90 kata per jawaban, pola STAR untuk pertanyaan perilaku. Hanya pakai pengalaman yang ada di <cv>; jika topik belum dikuasai, jawab jujur apa yang sudah dipelajari dan rencana belajarnya. Kembalikan satu jawaban per pertanyaan, urutan sama.",
    prompt: `<cv>\n${cv}\n</cv>\n<pertanyaan>\n${questions.questions.map((q, i) => `${i + 1}. ${q.pertanyaan}`).join("\n")}\n</pertanyaan>`,
    check: (o) => (o.jawaban.length >= 5 ? null : "jawaban kurang dari 5"),
  }));
  const contoh_jawaban: { pertanyaan: string; jawaban: string; grade: unknown }[] = [];
  for (const [i, q] of questions.questions.entries()) {
    const jawaban = contoh.jawaban[i].replace(/\s+/g, " ").trim().slice(0, 1500);
    await jeda();
    const grade = await coba(`nilai jawaban ${i + 1}`, async () => {
      const g = S.Grade.parse(await gradeAnswer(q, jawaban));
      // Contoh jawaban demo ditulis dari CV, jadi harus bisa dinilai; "tidak dapat dinilai" = hasil model yang meleset.
      if (g.status !== "dinilai") throw new Error("contoh jawaban dinilai tidak relevan");
      return g;
    });
    contoh_jawaban.push({ pertanyaan: q.pertanyaan, jawaban, grade });
    console.log(`jawaban ${i + 1}: ${grade.status} ${grade.skor_total}`);
  }

  const out = {
    _catatan: `Persona demo Rani (fiktif). Dibangun dari hasil asli oleh scripts/build-demo.ts pada ${new Date().toISOString().slice(0, 10)}. Jangan diedit manual; jalankan ulang skripnya.`,
    input: { tujuan, posisi, cv: cv.replace(/\r\n/g, "\n") }, // cv dipakai server untuk mencocokkan input demo persis
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
