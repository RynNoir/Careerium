// Data persona demo Rani: dipakai saat request membawa demo: true.
// 1) Input PERSIS sama dengan data Rani -> hasil tersimpan langsung (tanpa AI, tanpa kuota) agar demo selalu sama.
// 2) Input lain -> diproses AI; data Rani hanya cadangan bila AI/kuota gagal.
// Dibangun dari hasil asli oleh scripts/build-demo.ts. Bagian yang belum ada bernilai null.
import rani from "@/data/demo/rani.json";
import { normalizeForMatch } from "./evidence";
import { GapResult, Grade, Intent, Profile, QuestionsResponse, Roadmap } from "./schemas";

const r = rani as Record<string, unknown>;
const input = rani.input as { tujuan: string; posisi?: string; cv?: string };
const opt = <T>(schema: { parse: (v: unknown) => T }, v: unknown): T | null => (v == null ? null : schema.parse(v));

type Contoh = { pertanyaan: string; jawaban: string; grade: Grade };
const contoh = ((r.contoh_jawaban as Contoh[] | undefined) ?? []).map((c) => ({ ...c, grade: Grade.parse(c.grade) }));

export const demoRani = {
  input,
  intent: Intent.parse(rani.intent),
  profile: Profile.parse(rani.profile),
  gap: opt(GapResult, r.gap),
  roadmap: opt(Roadmap, r.roadmap),
  questions: opt(QuestionsResponse, r.questions),
  contoh_jawaban: contoh,
};

/** Nilai asli (hasil AI saat build) hanya untuk contoh jawaban yang dikirim persis sama. */
export function demoGrade(pertanyaan: string, jawaban: string): Grade | null {
  const p = normalizeForMatch(pertanyaan);
  const j = normalizeForMatch(jawaban);
  return contoh.find((c) => normalizeForMatch(c.pertanyaan) === p && normalizeForMatch(c.jawaban) === j)?.grade ?? null;
}

// ---------- Pencocokan input persis ----------
const teksSama = (a: string, b: string) => normalizeForMatch(a) === normalizeForMatch(b);

// JSON dengan kunci terurut, agar objek yang dibangun ulang FE (urutan kunci berbeda) tetap dianggap sama.
function stabil(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stabil).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.keys(v)
      .filter((k) => (v as Record<string, unknown>)[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stabil((v as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v);
}
const objekSama = (a: unknown, b: unknown) => b != null && stabil(a) === stabil(b);

export const demoPersis = {
  intent: (text: string) => (teksSama(text, input.tujuan) ? demoRani.intent : null),
  profile: (cvText: string) => (input.cv && teksSama(cvText, input.cv) ? demoRani.profile : null),
  gap: (profile: unknown, posisiPreset: unknown) =>
    objekSama(profile, demoRani.profile) && posisiPreset === demoRani.intent.posisi_preset ? demoRani.gap : null,
  // Tahap/tujuan/posisi ikut dicocokkan: bila pengguna mengubahnya di kartu konfirmasi, hasil Rani tidak berlaku.
  roadmap: (b: { gap: unknown; tahap: string; tujuan?: string }) =>
    objekSama(b.gap, demoRani.gap) && b.tahap === demoRani.intent.tahap && (b.tujuan ?? demoRani.intent.tujuan) === demoRani.intent.tujuan
      ? demoRani.roadmap
      : null,
  questions: (gap: unknown, posisi: string) =>
    objekSama(gap, demoRani.gap) && teksSama(posisi, input.posisi ?? "") ? demoRani.questions : null,
  grade: demoGrade,
};
