// Uji lib/scoring.ts (tanpa LLM). Pemakaian: npx tsx scripts/test-scoring.ts
import { hitungSkor, kredit, nilaiDariTingkat, susunGap, SUMBU_UMUM, type Kebutuhan } from "../lib/scoring";
import { prioritasDari } from "../lib/lowongan";

let gagal = 0;
function cek(nama: string, dapat: unknown, harap: unknown) {
  const ok = JSON.stringify(dapat) === JSON.stringify(harap);
  if (!ok) gagal++;
  console.log(`${ok ? "LULUS" : "GAGAL"}  ${nama}${ok ? "" : `\n       dapat ${JSON.stringify(dapat)}\n       harap ${JSON.stringify(harap)}`}`);
}

const K: Kebutuhan[] = [
  { nama: "JavaScript", prioritas: "wajib", kategori_radar: "teknologi_inti", jumlah_muncul: 10 },
  { nama: "Git", prioritas: "penting", kategori_radar: "tools_workflow", jumlah_muncul: 5 },
  { nama: "Testing", prioritas: "nilai_tambah", kategori_radar: "tools_workflow", jumlah_muncul: 2 },
];

// Rubrik 0–4 -> kredit 0 / 0,4 / 0,7 / 1 / 1. "Cukup untuk tahapnya" (3) sudah penuh.
cek("kredit rubrik 0–4", [0, 1, 2, 3, 4].map(kredit), [0, 0.4, 0.7, 1, 1]);
cek("kredit di luar rentang dibatasi", [kredit(-2), kredit(9), kredit(2.6)], [0, 1, 1]);
cek("aturan cadangan: dasar di semester awal/tengah = 3 (cukup)", [nilaiDariTingkat("dasar", "semester_awal"), nilaiDariTingkat("dasar", "semester_tengah")], [3, 3]);
cek("aturan cadangan: dasar di semester akhir/fresh graduate/tanpa tahap = 2", [nilaiDariTingkat("dasar", "semester_akhir"), nilaiDariTingkat("dasar", "fresh_graduate"), nilaiDariTingkat("dasar")], [2, 2, 2]);
cek("aturan cadangan: menengah = 3, mahir = 4", [nilaiDariTingkat("menengah"), nilaiDariTingkat("mahir")], [3, 4]);

// Hitung manual: inti = (3×0,7 + 2×0) / (3+2) = 42; bonus nilai_tambah = 1×1/1 × 10 = 10 -> 52
const punya = new Map([["JavaScript", 2], ["Testing", 4]]);
const r = hitungSkor(K, punya, SUMBU_UMUM);
cek("skor contoh manual = 52 (inti 42 + bonus 10)", r.skor, 52);
cek("rincian per prioritas", r.rincian, { wajib: { terpenuhi: 1, total: 1 }, penting: { terpenuhi: 0, total: 1 }, nilai_tambah: { terpenuhi: 1, total: 1 } });
cek("tanpa nilai_tambah: skor = inti saja (42)", hitungSkor(K, new Map([["JavaScript", 2]]), SUMBU_UMUM).skor, 42);
cek("nilai_tambah saja tidak menaikkan skor melewati 10", hitungSkor(K, new Map([["Testing", 4]]), SUMBU_UMUM).skor, 10);
cek("hanya kebutuhan nilai_tambah: dihitung penuh (bukan bonus)", hitungSkor([K[2]], new Map([["Testing", 4]]), SUMBU_UMUM).skor, 100);
cek("deterministik (dua kali hitung sama)", hitungSkor(K, punya, SUMBU_UMUM), r);
// Radar: bobot teknologi_inti 3, tools_workflow 3 (maks 3). teknologi_inti kamu 2,1/3=70; tools 1/3=33.
cek(
  "radar 5 sumbu",
  r.radar,
  [
    { kategori: "fondasi", label: "Fondasi", kamu: 0, target: 0 },
    { kategori: "teknologi_inti", label: "Teknologi inti", kamu: 70, target: 100 },
    { kategori: "tools_workflow", label: "Tools & alur kerja", kamu: 33, target: 100 },
    { kategori: "proyek_praktik", label: "Proyek & praktik", kamu: 0, target: 0 },
    { kategori: "soft_skill", label: "Soft skill", kamu: 0, target: 0 },
  ],
);
cek("semua \"cukup untuk tahapnya\" (3) = 100, tanpa harus menonjol", hitungSkor(K, new Map(K.map((k) => [k.nama, 3])), SUMBU_UMUM).skor, 100);
cek("tidak punya apa-apa = 0", hitungSkor(K, new Map(), SUMBU_UMUM).skor, 0);
cek("nilai 0 dihitung belum dimiliki", hitungSkor(K, new Map([["JavaScript", 0]]), SUMBU_UMUM).rincian.wajib.terpenuhi, 0);
cek("kebutuhan kosong = 0, tidak NaN", hitungSkor([], new Map(), SUMBU_UMUM).skor, 0);
cek("gap hanya yang belum dimiliki, urut prioritas", susunGap(K, punya).map((g) => g.nama), ["Git"]);
cek("gap memuat kebutuhan bernilai 0", susunGap(K, new Map([["JavaScript", 0], ["Git", 3], ["Testing", 1]])).map((g) => g.nama), ["JavaScript"]);
cek(
  "gap urut wajib -> penting -> nilai_tambah",
  susunGap(K, new Map()).map((g) => g.prioritas),
  ["wajib", "penting", "nilai_tambah"],
);
cek("prioritas 60% = wajib", prioritasDari(6, 10), "wajib");
cek("prioritas 30% = penting", prioritasDari(3, 10), "penting");
cek("prioritas 29% = nilai_tambah", prioritasDari(29, 100), "nilai_tambah");

console.log(gagal ? `\n${gagal} gagal` : "\nSemua lulus");
process.exit(gagal ? 1 : 0);
