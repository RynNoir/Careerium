# TODO — Backend

Pemilik: **Backend**. Hanya Backend yang mengedit file ini. Frontend boleh membaca.
Nomor langkah dan detail "selesai jika" ada di `docs/alur-fitur.md`.

**Sedang dikerjakan:** 7.1 selesai. Berikutnya: 0.3 Turso + Vercel, lalu 3.1 `data/lowongan.json` (setelah itu jalankan ulang `npx tsx scripts/build-demo.ts`)

---

## Status endpoint

FE melihat tabel ini untuk tahu kapan beralih dari mock ke API asli.
Status: `belum` → `siap lokal` → `siap Vercel`.

| Endpoint | Fitur | Skema (`lib/schemas.ts`) | Status | Catatan |
|---|---|---|---|---|
| POST `/api/auth/register` | 0 | – | siap lokal | `{ok, recoveryCode}` |
| POST `/api/auth/login` | 0 | – | siap lokal | |
| POST `/api/auth/reset` | 0 | – | siap lokal | `{ok, recoveryCode}` (kode baru) |
| POST `/api/auth/logout` | 0 | – | siap lokal | |
| POST `/api/auth/delete` | 0 | – | siap lokal | Perlu login |
| GET `/api/auth/me` | 0 | – | siap lokal | `{email}` atau 401 |
| POST `/api/intent` | 1 | `IntentRequest` → `Intent` | siap lokal | Teruji LLM asli 10/10 |
| POST `/api/profile` | 2 | `ProfileRequest` → `Profile` | siap lokal | Teruji LLM asli. CV uji: `data/demo/cv-rani.txt` |
| POST `/api/gap` | 3 | `GapRequest` → `GapResult` | siap lokal (perkiraan umum) | Posisi tanpa data di `lowongan.json` → `perkiraanUmum: true` (butuh LLM). Kirim `posisi_preset` dari intent |
| POST `/api/roadmap` | 4 | `RoadmapRequest` → `Roadmap` | siap lokal | Kirim juga `posisi` & `tujuan` agar roadmap sesuai konteks |
| POST `/api/interview/questions` | 5 | `QuestionsRequest` → `QuestionsResponse` | siap lokal | Selalu 5; `gap_asal` selalu nama dari daftar gap |
| POST `/api/interview/grade` | 5 | `GradeRequest` → `Grade` | siap lokal | Jawaban manipulatif / < 5 kata → `tidak_dapat_dinilai` tanpa LLM. Tidak ada fallback demo |
| POST/GET `/api/analyses` | 6 | `AnalysisCreate` → `{id}` (201); GET → `AnalysisSummary[]` | siap lokal | Perlu login |
| GET `/api/analyses/[id]` | 6 | `AnalysisDetail` | siap lokal | Pemilik saja (lainnya 404). Roadmap per butir: `roadmap[].items[].id` |
| PATCH `/api/analyses/[id]/roadmap/[itemId]` | 6 | `{selesai}` → `{ok}` | siap lokal | Pemilik saja |
| POST `/api/analyses/[id]/interviews` | 6 | `InterviewAttemptCreate` → `{percobaan_ke, skor_total}` (201) | siap lokal | `skor_total` = rata-rata, dihitung server |

Semua error berbentuk `{ "error": string }` (pesan Bahasa Indonesia, siap ditampilkan).
Endpoint AI: 400 masukan tidak valid, 429 kuota habis (40 permintaan/jam/sesi), 503 semua LLM gagal. Request dengan `demo: true` tidak pernah 429/503 (kecuali grade): dapat data persona Rani.
Grade demo: hanya `contoh_jawaban[i].jawaban` dari `data/demo/rani.json` yang dikirim **persis** untuk pertanyaan ke-i yang mendapat nilai (nilai asli AI saat build). Jawaban lain tetap 503 — tidak ada nilai karangan. FE: sediakan tombol "Isi contoh jawaban Rani" di mode demo.

---

## Langkah

### Fitur 0 — Fondasi
- [x] 0.1 Scaffold, dependensi, auth + smoke test 15/15, `schema.sql`, draf `lib/schemas.ts`
- [ ] 0.2 (bersama FE) Sepakati `lib/schemas.ts`: 5 kategori radar + mekanisme mode demo
- [ ] 0.3 Turso + migrasi, GitHub, Vercel + env, `GEMINI_MODEL`

### Fitur 1 — Pemahaman tujuan
- [x] 1.1 `lib/llm.ts` fallback Gemini → Groq — teruji langsung (Gemini timeout/429 → Groq menjawab). `GEMINI_MODEL=gemini-3.5-flash` (2.5-flash ditolak untuk akun baru). Opsi `LLM_ORDER`
- [x] 1.2 Batas input (`lib/limits.ts`) + kuota per sesi & IP (`lib/quota.ts`, tabel `llm_usage`). Teruji: permintaan ke-41 → 429
- [x] 1.3 `/api/intent` + guardrail kategori — `scripts/test-intent.ts` 10/10 dengan LLM asli
- [ ] → Serah terima `/api/intent`

### Fitur 2 — Profil
- [x] 2.1 `/api/profile` dengan `cv_valid` dan bukti — LLM asli: CV Rani valid, resep → `cv_valid:false`, injeksi di CV tidak menambah skill
- [x] 2.2 Validasi bukti oleh kode (`lib/evidence.ts`), 14 uji offline lulus
- [ ] → Serah terima `/api/profile`

### Fitur 3 — Gap & skor
- [ ] 3.1 `data/lowongan.json` — skema siap di `lib/lowongan.ts`; prioritas dihitung otomatis dari `jumlah_muncul/jumlah_lowongan`
- [x] 3.2 `lib/scoring.ts` + `scripts/test-scoring.ts` (11/11 lulus, contoh manual 57)
- [ ] 3.3 `/api/gap` — kode selesai; uji logika dengan fixture lulus (skor Rani 56, tanpa LLM). Menunggu data asli 3.1
- [ ] → Serah terima `/api/gap`

### Fitur 4 — Roadmap
- [ ] 4.1 `/api/roadmap` — lulus uji LLM (4 minggu, tanpa URL, gap wajib di minggu 1–2); tinggal deploy Vercel
- [ ] → Serah terima `/api/roadmap`

### Fitur 5 — Wawancara
- [x] 5.1 `/api/interview/questions` — LLM asli: tepat 5, `gap_asal` valid & beragam, sapaan "kamu"
- [x] 5.2 `/api/interview/grade` + batas skor oleh kode (`scripts/test-ai-logic.ts` 15/15). Kualitas saran LLM menunggu uji kunci
- [ ] → Serah terima `/api/interview/*`

### Fitur 6 — Riwayat
- [x] 6.1 `/api/analyses` (simpan, daftar, detail)
- [x] 6.2 PATCH roadmap item, POST percobaan wawancara, cek pemilik (`scripts/test-analyses.ts` 12/12, uji 2 akun)
- [ ] → Serah terima `/api/analyses/*`

### Fitur 7 — Mode demo
- [x] 7.1 `data/demo/rani.json` dari hasil asli (`scripts/build-demo.ts`) + fallback demo. Teruji dengan semua kunci API rusak: intent → profil → gap → roadmap → pertanyaan → nilai contoh jawaban semuanya 200
- [ ] 7.2 Uji batas panggilan sesi tamu
- [ ] → Serah terima mode demo

### Fitur 8 — Penguatan
- [ ] 8.1 15–20 prompt uji, uji bias, error & timeout

### Fitur 9 — Bonus & finalisasi
- [ ] 9.1 (bonus) Roadmap adaptif — endpoint
- [ ] 9.2 (bonus) Mode eksplorasi — endpoint
- [ ] 9.4 (bonus) Tanya mentor — endpoint
- [ ] 9.5 Feature freeze, deploy final, cek env, bangunkan DB

---

## Log kontrak (`lib/schemas.ts`)

| Tanggal | Perubahan | Dampak ke FE |
|---|---|---|
| 2026-11-14 | Draf v0: Intent, Profile, GapResult, Roadmap, Question, Grade, AnalysisSummary | Mulai membuat mock dari tipe ini |
| 2026-11-14 | Tambahan (non-breaking): `Question.pertanyaan` maks 500, `gap_asal` maks 100; `AnalysisCreate`, `AnalysisDetail`, `RoadmapItem`, `SavedRoadmapWeek`, `InterviewAttemptCreate` (`detail[]`, snake_case; beda dari PRD `skorTotal/skorDetail`), `InterviewAttempt` | Pakai tipe ini untuk layar Riwayat & simpan hasil |
| 2026-11-14 | Draf v1 (usulan, perlu konfirmasi FE): enum `KategoriRadar` (`fondasi`, `teknologi_inti`, `tools_workflow`, `proyek_praktik`, `soft_skill`) untuk `GapItem.kategori_radar` & `RadarPoint.kategori`; enum `PosisiPreset` + field `Intent.posisi_preset`; `GapRequest.posisi_preset?`; `RoadmapRequest.posisi?` & `tujuan?`; `demo?: boolean` di semua request AI | Mock radar/gap pakai nilai enum; label tampilan sumbu dibuat FE; kirim `posisi_preset` dari intent ke `/api/gap` |

---

## Butuh dari frontend

_(kosong)_

## Catatan / blocker

- Radar: `target` = bobot kategori relatif terhadap kategori terberat posisi itu; `kamu` = capaian pada skala yang sama (selalu ≤ target). Kategori tanpa kebutuhan = 0/0.
- Groq `gpt-oss-120b` free tier: batas 8.000 token/menit (±1 alur penuh). Ditambah cadangan `groq-20b` (`openai/gpt-oss-20b`, limit terpisah). Urutan lokal: `LLM_ORDER=groq,groq-20b,gemini`.
- Gemini free tier lambat (8–24 dtk/panggilan) dan cepat 429; satu alur penuh 95 dtk vs ±10 dtk dengan `LLM_ORDER=groq,gemini`. Perlu diset juga di env Vercel. Usul: tambahkan `LLM_ORDER` ke `.env.example` (file bersama, sepakati dulu).
- `next.config.ts` memakai `cacheComponents: true` (bawaan Next 16).
- Cookie sesi `secure` hanya di production (Safari menolak cookie secure di http://localhost).
