// Skema & pemuat data/lowongan.json (agregat kurasi manual, PRD §14). Prioritas dihitung kode.
import { z } from "zod";
import { KategoriRadar, PosisiPreset, Prioritas } from "./schemas";

export const SkillLowongan = z.object({
  nama: z.string().min(1),
  sinonim: z.array(z.string()).default([]), // mis. JavaScript: ["JS", "ES6"]
  kategori_radar: KategoriRadar,
  jumlah_muncul: z.number().int().min(0),
  prioritas: Prioritas.optional(), // kosong = dihitung dari persentase kemunculan
});

export const PosisiLowongan = z.object({
  nama: z.string().min(1), // nama tampilan, mis. "Frontend Web Developer"
  jumlah_lowongan: z.number().int().min(1),
  sumber: z.array(z.object({ situs: z.string(), diakses: z.string() })).min(1),
  skills: z.array(SkillLowongan).min(1),
});

export const LowonganFile = z.object({
  posisi: z.partialRecord(PosisiPreset, PosisiLowongan),
});

export type SkillLowongan = z.infer<typeof SkillLowongan>;
export type PosisiLowongan = z.infer<typeof PosisiLowongan>;

// PRD §14: >= 60% wajib, 30–59% penting, < 30% nilai_tambah.
export function prioritasDari(jumlahMuncul: number, jumlahLowongan: number): z.infer<typeof Prioritas> {
  const persen = jumlahMuncul / jumlahLowongan;
  if (persen >= 0.6) return "wajib";
  if (persen >= 0.3) return "penting";
  return "nilai_tambah";
}
