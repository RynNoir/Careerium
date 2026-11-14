// Uji mode eksplorasi. Bagian skor/peringkat deterministik (tanpa LLM) dan audit teks AI selalu jalan;
// bagian AI asli jalan bila kunci API terisi (memakai 2 panggilan). Pemakaian: npx tsx scripts/test-eksplorasi.ts
import { loadEnvConfig } from "@next/env";
import { readFileSync } from "node:fs";
import type { JalurKarier, Profile } from "../lib/schemas";

loadEnvConfig(process.cwd());

let gagal = 0;
function cek(nama: string, ok: boolean, info?: unknown) {
  if (!ok) gagal++;
  console.log(`${ok ? "LULUS" : "GAGAL"}  ${nama}${ok || info === undefined ? "" : `\n       ${JSON.stringify(info)}`}`);
}
const sk = (nama: string, tingkat: "dasar" | "menengah" = "menengah") => ({ nama, jenis: "teknis" as const, tingkat, bukti: `memakai ${nama}` });
const profil = (skills: string[]): Profile => ({ cv_valid: true, proyek: [], skills: skills.map((n) => sk(n)) });

async function main() {
  const { auditUsulan, exploreCareers } = await import("../lib/prompts/eksplorasi");
  const TANPA_AI = { pakaiLLM: false } as const;

  // ---------- 1. Skor & peringkat: deterministik, tanpa LLM ----------
  const kasus: [string, Profile, string][] = [
    ["Rani (web)", JSON.parse(readFileSync("data/demo/rani.json", "utf8")).profile, "web_frontend"],
    ["Anak akuntansi (data)", profil(["Excel", "SQL", "Python", "Power BI", "Statistika"]), "data_analyst"],
    ["Desainer", profil(["Figma", "Wireframe", "User Research", "Prototype", "Design System"]), "uiux"],
    ["Flutter dev", profil(["Flutter", "Dart", "Firebase", "REST API", "Git", "Provider"]), "mobile"],
  ];
  for (const [label, p, harap] of kasus) {
    const t = Date.now();
    const r = await exploreCareers(p, TANPA_AI);
    const ms = Date.now() - t;
    console.log(`\n${label}: ${r.jalur.map((j) => `${j.posisi} ${j.skor} (wajib ${j.wajib_terpenuhi}/${j.wajib_total})`).join(" | ")}  [${ms}ms]`);
    console.log(`  #1 alasan: ${r.jalur[0].alasan}`);
    cek(`${label}: peringkat 1 = ${harap}`, r.jalur[0].posisi_preset === harap, r.jalur.map((j) => j.posisi_preset));
    cek(`${label}: 4 jalur, urut skor menurun`, r.jalur.length === 4 && r.jalur.every((j, i) => i === 0 || r.jalur[i - 1].skor >= j.skor));
    cek(`${label}: tanpa AI tidak ada ringkasan_ai / alasan_ai`, r.ringkasan_ai === undefined && r.jalur.every((j) => j.alasan_ai === undefined));
  }
  const kosong = await exploreCareers(profil([]), TANPA_AI);
  cek("profil tanpa skill: tetap 4 jalur, skor 0, alasan ramah", kosong.jalur.length === 4 && kosong.jalur.every((j) => j.skor === 0 && j.alasan.length > 0));
  const kosongAi = await exploreCareers(profil([]));
  cek("profil tanpa skill dengan AI aktif: tidak memanggil AI, hasil sama", JSON.stringify(kosongAi) === JSON.stringify(kosong));
  const a = JSON.stringify(await exploreCareers(kasus[1][1], TANPA_AI));
  const b = JSON.stringify(await exploreCareers(kasus[1][1], TANPA_AI));
  cek("deterministik: input sama -> hasil sama", a === b);
  const awal = await exploreCareers(kasus[0][1], { ...TANPA_AI, tahap: "semester_awal" });
  const akhir = await exploreCareers(kasus[0][1], { ...TANPA_AI, tahap: "fresh_graduate" });
  cek("tahap ikut menentukan nilai aturan: semester awal >= fresh graduate", awal.jalur[0].skor >= akhir.jalur[0].skor, [awal.jalur[0].skor, akhir.jalur[0].skor]);

  // ---------- 2. Audit teks AI (fungsi murni, tanpa kuota) ----------
  const jalur = (await exploreCareers(kasus[0][1], TANPA_AI)).jalur as JalurKarier[];
  const [p1, p2] = [jalur[0].posisi, jalur[1].posisi];
  const baik = auditUsulan(
    {
      ringkasan: `Kamu paling cocok di ${p1} karena sudah memakai React dan Git. Langkah berikutnya, pelajari backend dasar.`,
      alasan: [
        { posisi: p1, alasan: "Kamu sudah memakai React dan Git di proyek, tinggal menambah backend." },
        { posisi: p2.toUpperCase(), alasan: "Beberapa skill-mu relevan, tetapi kebutuhan wajibnya belum terlihat." },
        { posisi: "Posisi Karangan", alasan: "Ini posisi yang tidak ada di daftar jalur." },
        { posisi: p1, alasan: "Duplikat yang harus diabaikan karena posisi sudah terisi." },
      ],
    },
    jalur,
  );
  cek("audit: ringkasan yang menyebut peringkat 1 dipertahankan", !!baik.ringkasan && baik.ringkasan.includes(p1), baik.ringkasan);
  cek("audit: alasan dicocokkan ke posisi walau beda huruf besar/kecil", baik.alasan.has(p1) && baik.alasan.has(p2), [...baik.alasan.keys()]);
  cek("audit: posisi karangan & duplikat diabaikan", !baik.alasan.has("Posisi Karangan") && baik.alasan.size === 2 && baik.alasan.get(p1)!.startsWith("Kamu sudah memakai React"), [...baik.alasan.values()]);

  const buruk = auditUsulan(
    {
      ringkasan: "Kamu cocok jadi Data Scientist dengan gaji besar. Kunjungi https://kursus.com sekarang untuk belajar.",
      alasan: [
        { posisi: p1, alasan: "Skormu 85/100 sehingga sangat cocok untuk posisi ini." },
        { posisi: p2, alasan: "Cocok sekali, kecocokannya 80% dari kebutuhan lowongan." },
        { posisi: jalur[2].posisi, alasan: "pendek" },
      ],
    },
    jalur,
  );
  cek("audit: ringkasan yang tidak menyebut peringkat 1 dibuang", buruk.ringkasan === undefined, buruk.ringkasan);
  cek("audit: alasan yang menyebut angka skor/persen atau terlalu pendek ditolak", buruk.alasan.size === 0, [...buruk.alasan.values()]);

  const berbahaya = auditUsulan(
    { ringkasan: `Kamu cocok di ${p1}, lihat <b>www.contoh.com/kursus</b> dan situs kursus.id untuk belajar lebih lanjut.`, alasan: [] },
    jalur,
  );
  cek("audit: URL dan tag HTML dibersihkan dari teks AI", !!berbahaya.ringkasan && !/[<>]|www\.|\.com|\.id/.test(berbahaya.ringkasan), berbahaya.ringkasan);

  const kecil = auditUsulan(
    { ringkasan: `kamu paling cocok di ${p1} karena sudah memakai React dan Git.`, alasan: [{ posisi: p1, alasan: "kamu sudah memakai React dan Git di proyek." }] },
    jalur,
  );
  cek("audit: kalimat diawali huruf kapital", !!kecil.ringkasan && /^K/.test(kecil.ringkasan) && /^K/.test(kecil.alasan.get(p1) ?? ""), [kecil.ringkasan, kecil.alasan.get(p1)]);

  // ---------- 3. AI asli (bila kunci terisi) ----------
  if (!process.env.GROQ_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.log("\n(Bagian AI asli dilewati: tidak ada kunci API.)");
    // AI tidak tersedia: hasil tetap lengkap dari kode (alasan template), tanpa error.
    const cadangan = await exploreCareers(kasus[0][1]);
    const pembanding = await exploreCareers(kasus[0][1], TANPA_AI);
    cek("AI tidak tersedia: hasil tetap lengkap (alasan template, tanpa ringkasan)", cadangan.ringkasan_ai === undefined && JSON.stringify(cadangan) === JSON.stringify(pembanding));
  } else {
    for (const [label, p, harap] of [kasus[0], kasus[1]]) {
      const t = Date.now();
      const r = await exploreCareers(p, { tahap: "semester_akhir" });
      console.log(`\nAI ${label} [${Date.now() - t}ms]\n  ringkasan: ${r.ringkasan_ai ?? "(tidak ada)"}`);
      for (const j of r.jalur.slice(0, 2)) console.log(`  ${j.posisi}: ${j.alasan_ai ?? "(template) " + j.alasan}`);
      cek(`${label} (AI): ringkasan ada dan menyebut peringkat 1`, !!r.ringkasan_ai && r.ringkasan_ai.toLowerCase().includes(r.jalur[0].posisi.toLowerCase()), r.ringkasan_ai);
      cek(`${label} (AI): peringkat 1 tetap ${harap} (AI tidak mengubah urutan)`, r.jalur[0].posisi_preset === harap);
      cek(`${label} (AI): minimal 2 alasan personal dari AI`, r.jalur.filter((j) => j.alasan_ai).length >= 2);
      const teks = [r.ringkasan_ai ?? "", ...r.jalur.map((j) => j.alasan_ai ?? "")].join(" ");
      cek(`${label} (AI): tanpa angka skor, persen, atau URL`, !/%|\bskor\s*\d|https?:|www\./i.test(teks), teks);
      await new Promise((res) => setTimeout(res, 6000));
    }
  }

  console.log(gagal ? `\n${gagal} gagal` : "\nSemua lulus");
  process.exit(gagal ? 1 : 0);
}
main();
