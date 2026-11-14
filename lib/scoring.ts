// Agregasi skor kecocokan & radar (PRD §8.3, v3). Deterministik: nilai sama -> skor sama.
//
// v3: AI asesor (lib/prompts/penilaian.ts) menilai tiap kebutuhan dengan rubrik 0–4 relatif terhadap tahap
// pengguna; kode memvalidasi bukti lalu menjumlahkan di sini dengan bobot dari data lowongan.
// Skor inti hanya dari "wajib" + "penting"; "nilai_tambah" menjadi bonus maks +10.
import type { z } from "zod";
import type { GapItem, Prioritas, Tahap, Tingkat } from "./schemas";

type PrioritasT = z.infer<typeof Prioritas>;
type TingkatT = z.infer<typeof Tingkat>;

export const BOBOT: Record<PrioritasT, number> = { wajib: 3, penting: 2, nilai_tambah: 1 };
export const BONUS_MAKS = 10;

// Rubrik 0–4: 0 tidak ada bukti, 1 hanya disebut, 2 latihan/kursus/proyek kecil, 3 dipakai nyata & cukup
// untuk tahapnya, 4 menonjol. "Cukup untuk tahapnya" (3) sudah bernilai penuh: pemula tidak perlu mahir.
export const KREDIT = [0, 0.4, 0.7, 1, 1] as const;
export const kredit = (nilai: number) => KREDIT[Math.max(0, Math.min(4, Math.round(nilai)))];

/** Cadangan tanpa AI: nilai rubrik dari tingkat skill. Semester awal/tengah: tingkat dasar sudah cukup. */
export function nilaiDariTingkat(t: TingkatT, tahap?: z.infer<typeof Tahap> | null): number {
  if (t === "mahir") return 4;
  if (t === "menengah") return 3;
  return tahap === "semester_awal" || tahap === "semester_tengah" ? 3 : 2;
}
const URUTAN: Record<PrioritasT, number> = { wajib: 0, penting: 1, nilai_tambah: 2 };

export type Kebutuhan = {
  nama: string;
  prioritas: PrioritasT;
  kategori_radar: string;
  jumlah_muncul: number;
};
export type Sumbu = { id: string; label: string };

// Sumbu untuk kebutuhan "perkiraan umum" (tanpa data lowongan).
export const SUMBU_UMUM: Sumbu[] = [
  { id: "fondasi", label: "Fondasi" },
  { id: "teknologi_inti", label: "Teknologi inti" },
  { id: "tools_workflow", label: "Tools & alur kerja" },
  { id: "proyek_praktik", label: "Proyek & praktik" },
  { id: "soft_skill", label: "Soft skill" },
];

/** nilaiDimiliki: nama kebutuhan -> nilai rubrik 0–4 (tidak ada / 0 = belum dimiliki). */
export function hitungSkor(kebutuhan: Kebutuhan[], nilaiDimiliki: Map<string, number>, sumbu: Sumbu[]) {
  const dimiliki = (k: Kebutuhan) => (nilaiDimiliki.get(k.nama) ?? 0) > 0;
  const nilai = (k: Kebutuhan) => BOBOT[k.prioritas] * kredit(nilaiDimiliki.get(k.nama) ?? 0);
  const jumlah = (ks: Kebutuhan[], f: (k: Kebutuhan) => number) => ks.reduce((s, k) => s + f(k), 0);

  const inti = kebutuhan.filter((k) => k.prioritas !== "nilai_tambah");
  const tambah = kebutuhan.filter((k) => k.prioritas === "nilai_tambah");
  // Tanpa kebutuhan inti (jarang, mis. perkiraan umum yang semuanya nilai_tambah) -> pakai semua kebutuhan.
  const dasar = inti.length ? inti : kebutuhan;
  const totalDasar = jumlah(dasar, (k) => BOBOT[k.prioritas]);
  const skorInti = totalDasar === 0 ? 0 : (jumlah(dasar, nilai) / totalDasar) * 100;
  const totalTambah = jumlah(tambah, (k) => BOBOT[k.prioritas]);
  const bonus = inti.length && totalTambah ? (jumlah(tambah, nilai) / totalTambah) * BONUS_MAKS : 0;
  const skor = Math.min(100, Math.round(skorInti + bonus));

  const hitung = (p: PrioritasT) => {
    const ks = kebutuhan.filter((k) => k.prioritas === p);
    return { terpenuhi: ks.filter(dimiliki).length, total: ks.length };
  };
  const rincian = { wajib: hitung("wajib"), penting: hitung("penting"), nilai_tambah: hitung("nilai_tambah") };

  // Radar: target = bobot kategori relatif terhadap kategori terberat (bentuk khas posisi);
  // kamu = capaian di kategori itu pada skala yang sama, jadi selalu <= target. Radar memakai SEMUA kebutuhan.
  const perKat = sumbu.map((sb) => {
    const ks = kebutuhan.filter((k) => k.kategori_radar === sb.id);
    return { sb, bobot: jumlah(ks, (k) => BOBOT[k.prioritas]), capai: jumlah(ks, nilai) };
  });
  const maks = Math.max(0, ...perKat.map((p) => p.bobot));
  const radar = perKat.map((p) => ({
    kategori: p.sb.id,
    label: p.sb.label,
    kamu: maks === 0 ? 0 : Math.round((p.capai / maks) * 100),
    target: maks === 0 ? 0 : Math.round((p.bobot / maks) * 100),
  }));

  return { skor, radar, rincian };
}

/** Kebutuhan yang belum dimiliki, urut prioritas lalu seberapa sering muncul di lowongan. */
export function susunGap(kebutuhan: Kebutuhan[], nilaiDimiliki: Map<string, number>): GapItem[] {
  return kebutuhan
    .filter((k) => !((nilaiDimiliki.get(k.nama) ?? 0) > 0))
    .sort((a, b) => URUTAN[a.prioritas] - URUTAN[b.prioritas] || b.jumlah_muncul - a.jumlah_muncul || a.nama.localeCompare(b.nama))
    .map((k) => ({ nama: k.nama, prioritas: k.prioritas, kategori_radar: k.kategori_radar, jumlah_muncul: k.jumlah_muncul }));
}
