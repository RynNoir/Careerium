// Bonus B2: roadmap adaptif setelah wawancara. Analisis hasil latihan oleh KODE;
// LLM hanya menyusun ulang roadmap dengan topik terlemah di minggu 1–2.
import type { z } from "zod";
import { AdaptiveRoadmap, type AdaptiveRoadmapRequest, type GapResult, type HasilWawancara } from "../schemas";
import { makeRoadmap } from "./roadmap";

const BATAS_LEMAH = 60; // skor_total di bawah ini = topik perlu diulang
const LABEL_RUBRIK = { kejelasan: "kejelasan", relevansi: "relevansi", kedalaman: "kedalaman", struktur: "struktur (pola STAR)" } as const;
type Rubrik = keyof typeof LABEL_RUBRIK;

export function analisisWawancara(hasil: HasilWawancara[]) {
  // Rata-rata per topik; "tidak dapat dinilai" dihitung 0.
  const perTopik = new Map<string, number[]>();
  for (const h of hasil) {
    const skor = h.status === "tidak_dapat_dinilai" ? 0 : h.skor_total;
    perTopik.set(h.gap_asal, [...(perTopik.get(h.gap_asal) ?? []), skor]);
  }
  const topik = [...perTopik].map(([nama, s]) => ({ nama, rata: Math.round(s.reduce((a, b) => a + b, 0) / s.length) }));
  const fokus = topik
    .filter((t) => t.rata < BATAS_LEMAH)
    .sort((a, b) => a.rata - b.rata || a.nama.localeCompare(b.nama))
    .slice(0, 3);

  // Rubrik terlemah dari jawaban yang dinilai (rata-rata 1–5).
  const dinilai = hasil.filter((h) => h.status === "dinilai" && h.skor);
  let rubrikLemah: Rubrik | null = null;
  if (dinilai.length) {
    const rata = (k: Rubrik) => dinilai.reduce((a, h) => a + h.skor![k], 0) / dinilai.length;
    const urut = (Object.keys(LABEL_RUBRIK) as Rubrik[]).map((k) => ({ k, v: rata(k) })).sort((a, b) => a.v - b.v);
    if (urut[0].v < 3.5) rubrikLemah = urut[0].k;
  }
  const rataTotal = Math.round(hasil.reduce((a, h) => a + (h.status === "tidak_dapat_dinilai" ? 0 : h.skor_total), 0) / hasil.length);
  return { fokus, rubrikLemah, rataTotal };
}

function catatanDari(a: ReturnType<typeof analisisWawancara>): string {
  const pendek = (n: string) => n.split(" (")[0];
  const rubrik = a.rubrikLemah ? ` Aspek jawaban yang paling perlu dilatih: ${LABEL_RUBRIK[a.rubrikLemah]}.` : "";
  if (!a.fokus.length) {
    return `Latihan wawancaramu sudah baik (rata-rata ${a.rataTotal}). Roadmap tetap memperdalam skill yang masih kurang.${rubrik}`;
  }
  const daftar = a.fokus.map((f) => `${pendek(f.nama)} (skor ${f.rata})`).join(", ");
  return `Roadmap diperbarui: minggu 1–2 kini fokus ke ${daftar} karena jawaban latihanmu di topik itu masih lemah.${rubrik}`;
}

// Topik fokus dipindah ke depan daftar gap dan dianggap "wajib" agar roadmap mendahulukannya.
function gapDenganFokus(gap: GapResult, fokus: string[]): GapResult {
  if (!fokus.length) return gap;
  const set = new Set(fokus);
  const depan = fokus.map((nama) => {
    const ada = gap.gap.find((g) => g.nama === nama);
    return { ...(ada ?? { nama, kategori_radar: "lainnya", jumlah_muncul: 0 }), prioritas: "wajib" as const };
  });
  return { ...gap, gap: [...depan, ...gap.gap.filter((g) => !set.has(g.nama))] };
}

export async function makeAdaptiveRoadmap(input: z.infer<typeof AdaptiveRoadmapRequest>): Promise<AdaptiveRoadmap> {
  const a = analisisWawancara(input.hasil_wawancara);
  const fokus = a.fokus.map((f) => f.nama);
  const catatan = catatanDari(a);
  const roadmap = await makeRoadmap({
    gap: gapDenganFokus(input.gap, fokus),
    tahap: input.tahap,
    posisi: input.posisi,
    tujuan: input.tujuan,
    fokusUtama: fokus,
    catatanLatihan: `${catatan} Rata-rata skor latihan: ${a.rataTotal}.`,
  });
  return AdaptiveRoadmap.parse({ ...roadmap, fokus_ulang: fokus, catatan, diperbarui: true });
}

/** Cadangan mode demo bila AI gagal: roadmap lama + catatan jujur (tidak mengarang roadmap baru). */
export function adaptiveFallback(input: z.infer<typeof AdaptiveRoadmapRequest>): AdaptiveRoadmap | null {
  if (!input.roadmap_lama) return null;
  const a = analisisWawancara(input.hasil_wawancara);
  const fokus = a.fokus.map((f) => f.nama);
  const topik = fokus.length ? ` Sementara itu, tambahkan latihan untuk: ${fokus.map((f) => f.split(" (")[0]).join(", ")}.` : "";
  return AdaptiveRoadmap.parse({
    ...input.roadmap_lama,
    fokus_ulang: fokus,
    catatan: `Roadmap belum bisa diperbarui karena mentor AI sedang sibuk; ini roadmap sebelumnya.${topik}`,
    diperbarui: false,
  });
}
