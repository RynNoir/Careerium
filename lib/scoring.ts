// Perhitungan skor kecocokan & radar (PRD §8.3). Deterministik: input sama -> hasil sama. BUKAN di prompt.
import type { z } from "zod";
import type { GapItem, KategoriRadar, Prioritas, Tingkat } from "./schemas";
import { KategoriRadar as KategoriRadarEnum } from "./schemas";

type PrioritasT = z.infer<typeof Prioritas>;
type TingkatT = z.infer<typeof Tingkat>;

export const BOBOT: Record<PrioritasT, number> = { wajib: 3, penting: 2, nilai_tambah: 1 };
export const FAKTOR: Record<TingkatT, number> = { dasar: 0.5, menengah: 0.8, mahir: 1 };
const URUTAN: Record<PrioritasT, number> = { wajib: 0, penting: 1, nilai_tambah: 2 };

export type Kebutuhan = {
  nama: string;
  prioritas: PrioritasT;
  kategori_radar: KategoriRadar;
  jumlah_muncul: number;
};

/** tingkatDimiliki: nama kebutuhan -> tingkat skill pengguna (tidak ada = tidak dimiliki). */
export function hitungSkor(kebutuhan: Kebutuhan[], tingkatDimiliki: Map<string, TingkatT>) {
  const nilai = (k: Kebutuhan) => {
    const t = tingkatDimiliki.get(k.nama);
    return BOBOT[k.prioritas] * (t ? FAKTOR[t] : 0);
  };
  const total = kebutuhan.reduce((s, k) => s + BOBOT[k.prioritas], 0);
  const skor = total === 0 ? 0 : Math.round((kebutuhan.reduce((s, k) => s + nilai(k), 0) / total) * 100);

  // Radar: target = bobot kategori relatif terhadap kategori terberat (bentuk khas posisi);
  // kamu = capaian di kategori itu pada skala yang sama, jadi selalu <= target.
  const perKat = KategoriRadarEnum.options.map((kat) => {
    const ks = kebutuhan.filter((k) => k.kategori_radar === kat);
    return { kat, bobot: ks.reduce((s, k) => s + BOBOT[k.prioritas], 0), capai: ks.reduce((s, k) => s + nilai(k), 0) };
  });
  const maks = Math.max(0, ...perKat.map((p) => p.bobot));
  const radar = perKat.map((p) => ({
    kategori: p.kat,
    kamu: maks === 0 ? 0 : Math.round((p.capai / maks) * 100),
    target: maks === 0 ? 0 : Math.round((p.bobot / maks) * 100),
  }));

  return { skor, radar };
}

/** Kebutuhan yang belum dimiliki, urut prioritas lalu seberapa sering muncul di lowongan. */
export function susunGap(kebutuhan: Kebutuhan[], tingkatDimiliki: Map<string, TingkatT>): GapItem[] {
  return kebutuhan
    .filter((k) => !tingkatDimiliki.has(k.nama))
    .sort((a, b) => URUTAN[a.prioritas] - URUTAN[b.prioritas] || b.jumlah_muncul - a.jumlah_muncul || a.nama.localeCompare(b.nama))
    .map((k) => ({ nama: k.nama, prioritas: k.prioritas, kategori_radar: k.kategori_radar, jumlah_muncul: k.jumlah_muncul }));
}
