// Bonus B1: mode eksplorasi. Profil dibandingkan ke semua posisi yang punya data lowongan.
// Sepenuhnya deterministik (tanpa LLM): pencocokan alias + scoring.ts, alasan dari template kode.
import data from "@/data/lowongan.json";
import { LowonganFile, PRESET_KE_DATA } from "../lowongan";
import { ExplorationResult, type JalurKarier, type PosisiPreset, type Profile } from "../schemas";
import { analyzeGap } from "./gap";

const lowongan = LowonganFile.parse(data);

// Satu preset per posisi berdata (web_frontend mewakili data Web Developer gabungan).
const PRESET_EKSPLORASI: PosisiPreset[] = ["web_frontend", "data_analyst", "uiux", "mobile"];

function alasan(j: Omit<JalurKarier, "alasan">): string {
  if (j.wajib_total > 0 && j.wajib_terpenuhi === j.wajib_total) {
    const jumlah = j.wajib_total === 1 ? "skill wajib" : `semua ${j.wajib_total} skill wajib`;
    return `Kamu sudah punya ${jumlah} untuk ${j.posisi}. Tinggal memperdalam skill pendukung.`;
  }
  if (j.wajib_terpenuhi > 0) {
    const kurang = j.gap_teratas.find((g) => g.prioritas === "wajib")?.nama.split(" (")[0];
    return `Kamu sudah punya ${j.wajib_terpenuhi} dari ${j.wajib_total} skill wajib untuk ${j.posisi}${kurang ? `; langkah berikutnya: ${kurang}` : ""}.`;
  }
  if (j.kekuatan.length > 0) {
    return `Beberapa skill-mu (${j.kekuatan.slice(0, 2).join(", ")}) relevan untuk ${j.posisi}, tetapi skill wajibnya belum terlihat di CV.`;
  }
  return `Skill untuk ${j.posisi} belum terlihat di CV-mu. Jalur ini bisa dicoba jika kamu tertarik memulai dari dasar.`;
}

export async function exploreCareers(profile: Profile): Promise<ExplorationResult> {
  const jalur: JalurKarier[] = [];
  for (const preset of PRESET_EKSPLORASI) {
    const pos = lowongan.posisi.find((p) => p.id === PRESET_KE_DATA[preset]);
    if (!pos) continue;
    const g = await analyzeGap({ profile, posisi: pos.nama, posisi_preset: preset, pakaiLLM: false });
    const belum = new Set(g.gap.map((x) => x.nama));
    const wajib = pos.skill.filter((s) => s.prioritas === "wajib");
    const tanpaAlasan = {
      posisi_preset: preset,
      posisi: pos.nama,
      skor: g.skor,
      wajib_terpenuhi: wajib.filter((s) => !belum.has(s.nama)).length,
      wajib_total: wajib.length,
      kekuatan: g.kekuatan.slice(0, 4).map((k) => k.nama),
      gap_teratas: g.gap.slice(0, 3).map((x) => ({ nama: x.nama, prioritas: x.prioritas })),
      sumberLowongan: { jumlah: pos.jumlah_lowongan, diakses: pos.sumber.tanggal_akses },
    };
    jalur.push({ ...tanpaAlasan, alasan: alasan(tanpaAlasan) });
  }
  jalur.sort((a, b) => b.skor - a.skor || b.wajib_terpenuhi - a.wajib_terpenuhi);
  return ExplorationResult.parse({ jalur });
}
