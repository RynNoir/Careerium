// Data persona demo Rani: dipakai saat request membawa demo: true dan LLM/kuota gagal.
// Dibangun dari hasil asli oleh scripts/build-demo.ts. Bagian yang belum ada bernilai null.
import rani from "@/data/demo/rani.json";
import { normalizeForMatch } from "./evidence";
import { GapResult, Grade, Intent, Profile, QuestionsResponse, Roadmap } from "./schemas";

const r = rani as Record<string, unknown>;
const opt = <T>(schema: { parse: (v: unknown) => T }, v: unknown): T | null => (v == null ? null : schema.parse(v));

type Contoh = { pertanyaan: string; jawaban: string; grade: Grade };
const contoh = ((r.contoh_jawaban as Contoh[] | undefined) ?? []).map((c) => ({ ...c, grade: Grade.parse(c.grade) }));

export const demoRani = {
  input: rani.input,
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
