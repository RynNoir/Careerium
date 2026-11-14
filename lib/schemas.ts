// KONTRAK BERSAMA backend <-> frontend (PRD §12).
// Status: v2 (radar per posisi) — disepakati tim di Fase 0. Perubahan wajib diberitahukan ke track lain sebelum di-commit.
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
// Sumbu radar mengikuti posisi (dari data/lowongan.json), mis. web: frontend, backend, database, tools, profesional.
// id kategori = string; teks tampilan ada di RadarPoint.label.
export const KategoriRadar = z.string().min(1).max(40);
// Kunci posisi preset di data/lowongan.json. null = posisi TI di luar preset.
export const PosisiPreset = z.enum([
  "web_frontend",
  "web_backend",
  "mobile",
  "data_analyst",
  "uiux",
  "qa",
  "cybersecurity",
  "devops",
]);

// true = jalankan seperti biasa; jika semua LLM gagal, kembalikan data persona Rani.
const Demo = z.boolean().optional();

// ---------- 1. Pemahaman tujuan: POST /api/intent ----------
export const IntentRequest = z.object({ text: z.string().trim().min(1).max(MAX_GOAL_CHARS), demo: Demo });
export const Intent = z.object({
  kategori: Kategori,
  tujuan: Tujuan,
  posisi_target: z.string().nullable(), // teks tampilan, mis. "Web Developer"
  posisi_preset: PosisiPreset.nullable(),
  tahap: Tahap.nullable(),
  kekhawatiran: z.string().nullable(),
  kepercayaan: z.number().min(0).max(1),
});

// ---------- 2. Ekstraksi profil: POST /api/profile ----------
export const ProfileRequest = z.object({ cvText: z.string().trim().min(1).max(MAX_CV_CHARS), demo: Demo });
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
  posisi_preset: PosisiPreset.nullable().optional(),
  tahap: Tahap,
  tujuan: Tujuan.optional(), // standar penilaian AI: magang menurunkan ekspektasi pengalaman
  jobDescription: z.string().max(MAX_JOB_DESC_CHARS).optional(),
  demo: Demo,
});
export const Kekuatan = z.object({ nama: z.string(), tingkat: Tingkat, bukti: z.string() });
export const GapItem = z.object({
  nama: z.string(),
  prioritas: Prioritas,
  kategori_radar: KategoriRadar,
  jumlah_muncul: z.number().int().min(0), // "muncul di N dari M lowongan"
});
export const RadarPoint = z.object({
  kategori: KategoriRadar,
  label: z.string(), // teks sumbu untuk UI, mis. "Tools & DevOps"
  kamu: z.number().min(0).max(100),
  target: z.number().min(0).max(100),
});
// Penilaian per kebutuhan oleh AI asesor (rubrik 0–4), diaudit kode. sumber "aturan" = cadangan tanpa AI.
export const PenilaianKebutuhan = z.object({
  nama: z.string(), // = nama kebutuhan (sama dengan GapItem.nama untuk yang belum dimiliki)
  prioritas: Prioritas,
  nilai: z.number().int().min(0).max(4), // 0 tidak ada bukti · 1 disebut · 2 latihan/kursus · 3 cukup untuk tahapnya · 4 menonjol
  alasan: z.string(), // 1 kalimat untuk pengguna
  bukti: z.string().optional(), // kutipan CV yang mendasari nilai (sudah divalidasi kode)
  sumber: z.enum(["ai", "aturan"]),
});
export const GapResult = z.object({
  kekuatan: z.array(Kekuatan),
  gap: z.array(GapItem),
  skor: z.number().int().min(0).max(100), // agregasi lib/scoring.ts dari nilai rubrik AI (bukan angka skor dari LLM): inti (wajib+penting) + bonus nilai_tambah maks 10
  // Jumlah kebutuhan terpenuhi per prioritas, untuk menjelaskan skor di UI (mis. "wajib 3/4").
  skor_rincian: z
    .object({ wajib: z.object({ terpenuhi: z.number().int().min(0), total: z.number().int().min(0) }), penting: z.object({ terpenuhi: z.number().int().min(0), total: z.number().int().min(0) }), nilai_tambah: z.object({ terpenuhi: z.number().int().min(0), total: z.number().int().min(0) }) })
    .optional(),
  radar: z.array(RadarPoint),
  penilaian: z.array(PenilaianKebutuhan).optional(), // urut sesuai kebutuhan posisi
  ringkasan_ai: z.string().optional(), // 2–3 kalimat penilaian mentor AI (kosong bila AI gagal)
  metode_skor: z.enum(["ai_rubrik", "aturan"]).optional(), // "aturan" = AI gagal / mode eksplorasi
  sumberLowongan: z.object({
    jumlah: z.number().int().min(0), // M lowongan
    perkiraanUmum: z.boolean(), // true = posisi di luar preset tanpa deskripsi lowongan
    posisi_data: z.string().optional(), // nama posisi di dataset, mis. "Web Developer"
    diakses: z.string().optional(), // tanggal akses data lowongan (YYYY-MM-DD)
  }),
});

// ---------- 4. Roadmap: POST /api/roadmap ----------
export const RoadmapRequest = z.object({
  gap: GapResult,
  tahap: Tahap,
  posisi: z.string().min(1).max(100).optional(),
  tujuan: Tujuan.optional(), // magang menurunkan ekspektasi pengalaman, kerja menekankan proyek nyata
  demo: Demo,
});
export const RoadmapWeek = z.object({
  minggu: z.number().int().min(1).max(4),
  fokus: z.string(),
  kegiatan: z.array(z.string()).min(1),
  mini_proyek: z.string(),
});
export const Roadmap = z.object({ minggu: z.array(RoadmapWeek).length(4) });

// ---------- 5. Pertanyaan wawancara: POST /api/interview/questions ----------
export const QuestionsRequest = z.object({ gap: GapResult, posisi: z.string().min(1).max(100), demo: Demo });
export const Question = z.object({
  pertanyaan: z.string().min(1).max(500),
  jenis: JenisPertanyaan,
  gap_asal: z.string().min(1).max(100),
});
export const QuestionsResponse = z.object({ questions: z.array(Question).length(5) });

// ---------- 6. Penilaian jawaban: POST /api/interview/grade ----------
export const GradeRequest = z.object({
  question: Question,
  answer: z.string().trim().min(1).max(MAX_ANSWER_CHARS),
  demo: Demo,
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

// ---------- Bonus B2. Roadmap adaptif: POST /api/roadmap/adaptif ----------
// Setelah sesi wawancara: roadmap disusun ulang dengan fokus ke topik yang jawabannya paling lemah.
export const HasilWawancara = z.object({
  gap_asal: z.string().min(1).max(100),
  status: z.enum(["dinilai", "tidak_dapat_dinilai"]),
  skor_total: z.number().int().min(0).max(100),
  skor: GradeLLM.shape.skor.optional(), // rubrik 1–5, untuk mencari rubrik terlemah
});
export const AdaptiveRoadmapRequest = z.object({
  gap: GapResult,
  tahap: Tahap,
  posisi: z.string().min(1).max(100).optional(),
  tujuan: Tujuan.optional(),
  hasil_wawancara: z.array(HasilWawancara).min(1).max(10),
  roadmap_lama: Roadmap.optional(), // dipakai sebagai cadangan mode demo bila AI gagal
  demo: Demo,
});
export const AdaptiveRoadmap = Roadmap.extend({
  fokus_ulang: z.array(z.string()).max(3), // topik yang diprioritaskan ulang (dihitung kode)
  catatan: z.string(), // penjelasan perubahan, template kode
  diperbarui: z.boolean(), // false = AI gagal, roadmap lama dikembalikan (mode demo)
});

// ---------- Bonus B1. Mode eksplorasi: POST /api/eksplorasi ----------
// Untuk pengguna yang belum punya target (tujuan "eksplorasi"): bandingkan profil ke semua posisi berdata.
export const ExplorationRequest = z.object({ profile: Profile, demo: Demo });
export const JalurKarier = z.object({
  posisi_preset: PosisiPreset, // kirim ke /api/gap jika pengguna memilih jalur ini
  posisi: z.string(), // nama tampilan dari dataset, mis. "Data Analyst"
  skor: z.number().int().min(0).max(100), // dihitung lib/scoring.ts
  wajib_terpenuhi: z.number().int().min(0),
  wajib_total: z.number().int().min(0),
  kekuatan: z.array(z.string()), // nama skill CV yang relevan untuk posisi ini (maks 4)
  gap_teratas: z.array(z.object({ nama: z.string(), prioritas: Prioritas })), // maks 3
  alasan: z.string(), // kalimat template dari kode, bukan LLM
  sumberLowongan: z.object({ jumlah: z.number().int(), diakses: z.string() }),
});
export const ExplorationResult = z.object({ jalur: z.array(JalurKarier).min(1) });

// ---------- Riwayat (login) ----------
export const AnalysisSummary = z.object({
  id: z.string(),
  target_posisi: z.string(),
  tahap: Tahap,
  skor: z.number().int(),
  created_at: z.number().int(),
});

// POST /api/analyses -> { id }. Hanya hasil terstruktur; teks CV tidak pernah dikirim ke sini.
export const AnalysisCreate = z.object({
  posisi: z.string().trim().min(1).max(100),
  tahap: Tahap,
  profile: Profile,
  gap: GapResult,
  roadmap: Roadmap,
});
// Roadmap tersimpan per butir agar setiap kegiatan bisa dicentang (PATCH .../roadmap/[itemId]).
export const RoadmapItem = z.object({
  id: z.number().int(),
  jenis: z.enum(["kegiatan", "mini_proyek"]),
  teks: z.string(),
  selesai: z.boolean(),
});
export const SavedRoadmapWeek = z.object({ minggu: z.number().int(), fokus: z.string(), items: z.array(RoadmapItem) });

// POST /api/analyses/[id]/interviews -> { percobaan_ke, skor_total }. skor_total dihitung server (rata-rata).
export const InterviewAttemptCreate = z.object({
  detail: z
    .array(
      z.object({
        pertanyaan: z.string().max(500),
        gap_asal: z.string().max(100),
        status: z.enum(["dinilai", "tidak_dapat_dinilai"]),
        skor_total: z.number().int().min(0).max(100),
      }),
    )
    .min(1)
    .max(5),
});
export const InterviewAttempt = InterviewAttemptCreate.extend({
  percobaan_ke: z.number().int(),
  skor_total: z.number().int(),
  created_at: z.number().int(),
});

// GET /api/analyses/[id]
export const AnalysisDetail = AnalysisSummary.extend({
  profile: Profile,
  gap: GapResult,
  roadmap: z.array(SavedRoadmapWeek),
  interviews: z.array(InterviewAttempt),
});

export type Intent = z.infer<typeof Intent>;
export type KategoriRadar = z.infer<typeof KategoriRadar>;
export type PosisiPreset = z.infer<typeof PosisiPreset>;
export type Profile = z.infer<typeof Profile>;
export type Skill = z.infer<typeof Skill>;
export type GapResult = z.infer<typeof GapResult>;
export type GapItem = z.infer<typeof GapItem>;
export type PenilaianKebutuhan = z.infer<typeof PenilaianKebutuhan>;
export type Roadmap = z.infer<typeof Roadmap>;
export type Question = z.infer<typeof Question>;
export type GradeLLM = z.infer<typeof GradeLLM>;
export type Grade = z.infer<typeof Grade>;
export type AnalysisSummary = z.infer<typeof AnalysisSummary>;
export type JalurKarier = z.infer<typeof JalurKarier>;
export type HasilWawancara = z.infer<typeof HasilWawancara>;
export type AdaptiveRoadmap = z.infer<typeof AdaptiveRoadmap>;
export type ExplorationResult = z.infer<typeof ExplorationResult>;
export type AnalysisCreate = z.infer<typeof AnalysisCreate>;
export type AnalysisDetail = z.infer<typeof AnalysisDetail>;
export type RoadmapItem = z.infer<typeof RoadmapItem>;
export type InterviewAttemptCreate = z.infer<typeof InterviewAttemptCreate>;
export type InterviewAttempt = z.infer<typeof InterviewAttempt>;
export type QuestionsResponse = z.infer<typeof QuestionsResponse>;
