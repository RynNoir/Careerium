// Perhitungan skor kecocokan & radar (PRD §8.3, direvisi). Deterministik: input sama -> hasil sama. BUKAN di prompt.
//
// Revisi: skor inti hanya dari kebutuhan "wajib" + "penting"; "nilai_tambah" menjadi bonus maks +10.
// Alasan: dataset punya belasan skill nilai_tambah yang jarang dimiliki pemula, sehingga dengan rumus
// lama skor kandidat layak pun tertahan di ~30 dan terasa menghakimi.
import type { z } from "zod";
import type { GapItem, Prioritas, Tingkat } from "./schemas";

type PrioritasT = z.infer<typeof Prioritas>;
type TingkatT = z.infer<typeof Tingkat>;

export const BOBOT: Record<PrioritasT, number> = { wajib: 3, penting: 2, nilai_tambah: 1 };
export const FAKTOR: Record<TingkatT, number> = { dasar: 0.5, menengah: 0.8, mahir: 1 };
export const BONUS_MAKS = 10;
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

/** tingkatDimiliki: nama kebutuhan -> tingkat skill pengguna (tidak ada = tidak dimiliki). */
export function hitungSkor(kebutuhan: Kebutuhan[], tingkatDimiliki: Map<string, TingkatT>, sumbu: Sumbu[]) {
  const nilai = (k: Kebutuhan) => {
    const t = tingkatDimiliki.get(k.nama);
    return BOBOT[k.prioritas] * (t ? FAKTOR[t] : 0);
  };
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
    return { terpenuhi: ks.filter((k) => tingkatDimiliki.has(k.nama)).length, total: ks.length };
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
export function susunGap(kebutuhan: Kebutuhan[], tingkatDimiliki: Map<string, TingkatT>): GapItem[] {
  return kebutuhan
    .filter((k) => !tingkatDimiliki.has(k.nama))
    .sort((a, b) => URUTAN[a.prioritas] - URUTAN[b.prioritas] || b.jumlah_muncul - a.jumlah_muncul || a.nama.localeCompare(b.nama))
    .map((k) => ({ nama: k.nama, prioritas: k.prioritas, kategori_radar: k.kategori_radar, jumlah_muncul: k.jumlah_muncul }));
}
