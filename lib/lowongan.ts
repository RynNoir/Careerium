// Skema & pemuat data/lowongan.json (v2, dibangun oleh data/kurasi/build.py dari data/sumber.csv).
// Prioritas & persentase sudah dihitung di dataset (PRD §14: >= 60% wajib, 30–59% penting, < 30% nilai_tambah).
import { z } from "zod";
import sinonimData from "@/data/sinonim.json";
import { Prioritas, type PosisiPreset } from "./schemas";

const SkillData = z.object({
  id: z.string(),
  nama: z.string(),
  kategori_radar: z.string(),
  jumlah_muncul: z.number().int().min(0),
  persen_muncul: z.number(),
  prioritas: Prioritas,
  opsi_teknologi: z.array(z.object({ nama: z.string(), jumlah: z.number() })).optional(),
});

const PosisiData = z.object({
  id: z.string(),
  nama: z.string(),
  jumlah_lowongan: z.number().int().min(1),
  kategori_radar: z.record(z.string(), z.string()), // id -> label
  skill: z.array(SkillData).min(1),
  sumber: z.object({ tanggal_akses: z.string(), platform: z.array(z.string()) }),
});

export const LowonganFile = z.object({ versi: z.number(), posisi: z.array(PosisiData) });
export type LowonganFile = z.infer<typeof LowonganFile>;
export type PosisiData = z.infer<typeof PosisiData>;

// Preset intent -> id posisi di dataset. Web frontend & backend memakai data Web Developer gabungan (35 lowongan).
export const PRESET_KE_DATA: Partial<Record<PosisiPreset, string>> = {
  web_frontend: "web_developer",
  web_backend: "web_developer",
  data_analyst: "data_analyst",
  uiux: "ui_ux_designer",
  mobile: "mobile_developer",
};

export function prioritasDari(jumlahMuncul: number, jumlahLowongan: number): z.infer<typeof Prioritas> {
  const persen = jumlahMuncul / jumlahLowongan;
  if (persen >= 0.6) return "wajib";
  if (persen >= 0.3) return "penting";
  return "nilai_tambah";
}

const SINONIM = sinonimData as unknown as Record<string, string[]>;

/** Alias untuk pencocokan nama skill CV: nama kelompok, isi kurung, opsi_teknologi, sinonim kurasi. */
export function aliasSkill(s: z.infer<typeof SkillData>): string[] {
  const out = new Set<string>([s.nama]);
  const [luar, dalam] = s.nama.split("(");
  out.add(luar.trim());
  for (const bagian of luar.split(/\s+&\s+|\//)) out.add(bagian.trim());
  if (dalam) {
    for (const t of dalam.replace(")", "").split(/[\/,]/)) {
      const bersih = t.replace(/^\s*(mis\.|dll\.?)\s*/i, "").trim();
      if (bersih && !/^dll\.?$/i.test(bersih)) out.add(bersih);
    }
  }
  for (const o of s.opsi_teknologi ?? []) out.add(o.nama);
  for (const a of SINONIM[s.id] ?? []) out.add(a);
  return [...out].filter((a) => a.length >= 1);
}
