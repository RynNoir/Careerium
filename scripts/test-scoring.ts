// Uji lib/scoring.ts (tanpa LLM). Pemakaian: npx tsx scripts/test-scoring.ts
import { hitungSkor, susunGap, SUMBU_UMUM, type Kebutuhan } from "../lib/scoring";
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

// Hitung manual (rumus revisi): inti = (3×0,8 + 2×0) / (3+2) = 48; bonus nilai_tambah = 1×1,0/1 × 10 = 10 -> 58
const punya = new Map([["JavaScript", "menengah" as const], ["Testing", "mahir" as const]]);
const r = hitungSkor(K, punya, SUMBU_UMUM);
cek("skor contoh manual = 58 (inti 48 + bonus 10)", r.skor, 58);
cek("rincian per prioritas", r.rincian, { wajib: { terpenuhi: 1, total: 1 }, penting: { terpenuhi: 0, total: 1 }, nilai_tambah: { terpenuhi: 1, total: 1 } });
const tanpaBonus = hitungSkor(K, new Map([["JavaScript", "menengah" as const]]), SUMBU_UMUM);
cek("tanpa nilai_tambah: skor = inti saja (48)", tanpaBonus.skor, 48);
cek("nilai_tambah saja tidak menaikkan skor melewati 10", hitungSkor(K, new Map([["Testing", "mahir" as const]]), SUMBU_UMUM).skor, 10);
cek("hanya kebutuhan nilai_tambah: dihitung penuh (bukan bonus)", hitungSkor([K[2]], new Map([["Testing", "mahir" as const]]), SUMBU_UMUM).skor, 100);
cek("deterministik (dua kali hitung sama)", hitungSkor(K, punya, SUMBU_UMUM), r);
// Radar: bobot teknologi_inti 3, tools_workflow 3 (maks 3). teknologi_inti kamu 2,4/3=80; tools 1/3=33.
cek(
  "radar 5 sumbu",
  r.radar,
  [
    { kategori: "fondasi", label: "Fondasi", kamu: 0, target: 0 },
    { kategori: "teknologi_inti", label: "Teknologi inti", kamu: 80, target: 100 },
    { kategori: "tools_workflow", label: "Tools & alur kerja", kamu: 33, target: 100 },
    { kategori: "proyek_praktik", label: "Proyek & praktik", kamu: 0, target: 0 },
    { kategori: "soft_skill", label: "Soft skill", kamu: 0, target: 0 },
  ],
);
cek("semua mahir = 100", hitungSkor(K, new Map(K.map((k) => [k.nama, "mahir" as const])), SUMBU_UMUM).skor, 100);
cek("tidak punya apa-apa = 0", hitungSkor(K, new Map(), SUMBU_UMUM).skor, 0);
cek("kebutuhan kosong = 0, tidak NaN", hitungSkor([], new Map(), SUMBU_UMUM).skor, 0);
cek("gap hanya yang belum dimiliki, urut prioritas", susunGap(K, punya).map((g) => g.nama), ["Git"]);
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
