// KONTRAK BERSAMA backend <-> frontend (PRD §12).
// Status: DRAF v0 — disepakati tim di Fase 0. Perubahan wajib diberitahukan ke track lain sebelum di-commit.
import { z } from "zod";
import { MAX_ANSWER_CHARS, MAX_CV_CHARS, MAX_GOAL_CHARS, MAX_JOB_DESC_CHARS } from "./limits";

// ---------- Enum (nilai terbatas, CLAUDE.md §4) ----------
export const Kategori = z.enum(["karier_ti", "karier_non_ti", "di_luar_topik", "upaya_manipulasi", "tidak_jelas"]);
export const Tujuan = z.enum(["kerja", "magang", "tingkatkan_skill", "eksplorasi", "tidak_jelas"]);
export const Tahap = z.enum(["semester_awal", "semester_tengah", "semester_akhir", "fresh_graduate"]);
export const Tingkat = z.enum(["dasar", "menengah", "mahir"]);
export const Prioritas = z.enum(["wajib", "penting", "nilai_tambah"]);
export const JenisSkill = z.enum(["teknis", "tools", "soft_skill"]);
export const JenisPertanyaan = z.enum(["teknis", "perilaku"]);

// ---------- 1. Pemahaman tujuan: POST /api/intent ----------
export const IntentRequest = z.object({ text: z.string().trim().min(1).max(MAX_GOAL_CHARS) });
export const Intent = z.object({
  kategori: Kategori,
  tujuan: Tujuan,
  posisi_target: z.string().nullable(),
  tahap: Tahap.nullable(),
  kekhawatiran: z.string().nullable(),
  kepercayaan: z.number().min(0).max(1),
});

// ---------- 2. Ekstraksi profil: POST /api/profile ----------
export const ProfileRequest = z.object({ cvText: z.string().trim().min(1).max(MAX_CV_CHARS) });
export const Skill = z.object({
  nama: z.string(),
  jenis: JenisSkill,
  tingkat: Tingkat,
  bukti: z.string().min(1), // kutipan persis dari CV; skill tanpa bukti tidak boleh muncul
});
export const Proyek = z.object({
  nama: z.string(),
  deskripsi: z.string(),
  bukti: z.string().min(1),
});
export const Profile = z.object({
  cv_valid: z.boolean(),
  skills: z.array(Skill),
  proyek: z.array(Proyek),
});

// ---------- 3. Analisis gap: POST /api/gap ----------
export const GapRequest = z.object({
  profile: Profile,
  posisi: z.string().min(1).max(100),
  tahap: Tahap,
  jobDescription: z.string().max(MAX_JOB_DESC_CHARS).optional(),
});
export const Kekuatan = z.object({ nama: z.string(), tingkat: Tingkat, bukti: z.string() });
export const GapItem = z.object({
  nama: z.string(),
  prioritas: Prioritas,
  kategori_radar: z.string(),
  jumlah_muncul: z.number().int().min(0), // "muncul di N dari M lowongan"
});
export const RadarPoint = z.object({
  kategori: z.string(),
  kamu: z.number().min(0).max(100),
  target: z.number().min(0).max(100),
});
export const GapResult = z.object({
  kekuatan: z.array(Kekuatan),
  gap: z.array(GapItem),
  skor: z.number().int().min(0).max(100), // dihitung lib/scoring.ts, BUKAN LLM
  radar: z.array(RadarPoint),
  sumberLowongan: z.object({
    jumlah: z.number().int().min(0), // M lowongan
    perkiraanUmum: z.boolean(), // true = posisi di luar preset tanpa deskripsi lowongan
  }),
});

// ---------- 4. Roadmap: POST /api/roadmap ----------
export const RoadmapRequest = z.object({ gap: GapResult, tahap: Tahap });
export const RoadmapWeek = z.object({
  minggu: z.number().int().min(1).max(4),
  fokus: z.string(),
  kegiatan: z.array(z.string()).min(1),
  mini_proyek: z.string(),
});
export const Roadmap = z.object({ minggu: z.array(RoadmapWeek).length(4) });

// ---------- 5. Pertanyaan wawancara: POST /api/interview/questions ----------
export const QuestionsRequest = z.object({ gap: GapResult, posisi: z.string().min(1).max(100) });
export const Question = z.object({
  pertanyaan: z.string(),
  jenis: JenisPertanyaan,
  gap_asal: z.string(),
});
export const QuestionsResponse = z.object({ questions: z.array(Question).length(5) });

// ---------- 6. Penilaian jawaban: POST /api/interview/grade ----------
export const GradeRequest = z.object({
  question: Question,
  answer: z.string().trim().min(1).max(MAX_ANSWER_CHARS),
});
const Skala = z.number().int().min(1).max(5);
// Keluaran LLM.
export const GradeLLM = z.object({
  relevan: z.boolean(),
  skor: z.object({ kejelasan: Skala, relevansi: Skala, kedalaman: Skala, struktur: Skala }),
  star: z.object({ situation: z.boolean(), task: z.boolean(), action: z.boolean(), result: z.boolean() }),
  saran: z.array(z.string()).max(3),
});
// Respons API: ditambah oleh kode (skor total & status; relevan=false dibatasi kode).
export const Grade = GradeLLM.extend({
  status: z.enum(["dinilai", "tidak_dapat_dinilai"]),
  skor_total: z.number().int().min(0).max(100),
});

// ---------- Riwayat (login) ----------
export const AnalysisSummary = z.object({
  id: z.string(),
  target_posisi: z.string(),
  tahap: Tahap,
  skor: z.number().int(),
  created_at: z.number().int(),
});

export type Intent = z.infer<typeof Intent>;
export type Profile = z.infer<typeof Profile>;
export type Skill = z.infer<typeof Skill>;
export type GapResult = z.infer<typeof GapResult>;
export type GapItem = z.infer<typeof GapItem>;
export type Roadmap = z.infer<typeof Roadmap>;
export type Question = z.infer<typeof Question>;
export type GradeLLM = z.infer<typeof GradeLLM>;
export type Grade = z.infer<typeof Grade>;
export type AnalysisSummary = z.infer<typeof AnalysisSummary>;
