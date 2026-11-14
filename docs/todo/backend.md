# TODO — Backend

Pemilik: **Backend**. Hanya Backend yang mengedit file ini. Frontend boleh membaca.
Nomor langkah dan detail "selesai jika" ada di `docs/alur-fitur.md`.

**Sedang dikerjakan:** 9.1 selesai. Berikutnya: siaga bantu FE menyambung endpoint; persiapan demo (9.5)

---

## Status endpoint

FE melihat tabel ini untuk tahu kapan beralih dari mock ke API asli.
Status: `belum` → `siap lokal` → `siap Vercel`.

| Endpoint | Fitur | Skema (`lib/schemas.ts`) | Status | Catatan |
|---|---|---|---|---|
| POST `/api/auth/register` | 0 | – | siap Vercel | `{ok, recoveryCode}` |
| POST `/api/auth/login` | 0 | – | siap Vercel | |
| POST `/api/auth/reset` | 0 | – | siap Vercel | `{ok, recoveryCode}` (kode baru) |
| POST `/api/auth/logout` | 0 | – | siap Vercel | |
| POST `/api/auth/delete` | 0 | – | siap Vercel | Perlu login |
| GET `/api/auth/me` | 0 | – | siap Vercel | `{email}` atau 401 |
| POST `/api/intent` | 1 | `IntentRequest` → `Intent` | siap Vercel | Teruji LLM asli 10/10 |
| POST `/api/profile` | 2 | `ProfileRequest` → `Profile` | siap Vercel | Teruji LLM asli. CV uji: `data/demo/cv-rani.txt` |
| POST `/api/gap` | 3 | `GapRequest` → `GapResult` | siap lokal (data lowongan asli) | Posisi tanpa data di `lowongan.json` → `perkiraanUmum: true` (butuh LLM). Kirim `posisi_preset` dari intent |
| POST `/api/roadmap` | 4 | `RoadmapRequest` → `Roadmap` | siap Vercel | Kirim juga `posisi` & `tujuan` agar roadmap sesuai konteks |
| POST `/api/interview/questions` | 5 | `QuestionsRequest` → `QuestionsResponse` | siap Vercel | Selalu 5; `gap_asal` selalu nama dari daftar gap |
| POST `/api/interview/grade` | 5 | `GradeRequest` → `Grade` | siap Vercel | Jawaban manipulatif / < 5 kata → `tidak_dapat_dinilai` tanpa LLM. Tidak ada fallback demo |
| POST `/api/roadmap/adaptif` | 9.1 | `AdaptiveRoadmapRequest` → `AdaptiveRoadmap` | siap lokal | Kirim setelah sesi wawancara: `hasil_wawancara[{gap_asal, status, skor_total, skor}]` (dari Grade) + `roadmap_lama`. Tampilkan `catatan`; `diperbarui:false` = roadmap lama |
| POST `/api/eksplorasi` | 9.2 | `ExplorationRequest` → `ExplorationResult` | siap lokal | Tanpa LLM. Pakai bila `intent.tujuan = eksplorasi` atau `posisi_preset` null: setelah profil, tampilkan 2–3 jalur teratas; jalur dipilih → set posisi/`posisi_preset` lalu panggil `/api/gap` |
| POST/GET `/api/analyses` | 6 | `AnalysisCreate` → `{id}` (201); GET → `AnalysisSummary[]` | siap Vercel | Perlu login |
| GET `/api/analyses/[id]` | 6 | `AnalysisDetail` | siap Vercel | Pemilik saja (lainnya 404). Roadmap per butir: `roadmap[].items[].id` |
| PATCH `/api/analyses/[id]/roadmap/[itemId]` | 6 | `{selesai}` → `{ok}` | siap Vercel | Pemilik saja |
| POST `/api/analyses/[id]/interviews` | 6 | `InterviewAttemptCreate` → `{percobaan_ke, skor_total}` (201) | siap Vercel | `skor_total` = rata-rata, dihitung server |

Semua error berbentuk `{ "error": string }` (pesan Bahasa Indonesia, siap ditampilkan).
Endpoint AI: 400 masukan tidak valid, 429 kuota habis (40 permintaan/jam/sesi), 503 semua LLM gagal. Request dengan `demo: true` tidak pernah 429/503 (kecuali grade): dapat data persona Rani.
Grade demo: hanya `contoh_jawaban[i].jawaban` dari `data/demo/rani.json` yang dikirim **persis** untuk pertanyaan ke-i yang mendapat nilai (nilai asli AI saat build). Jawaban lain tetap 503 — tidak ada nilai karangan. FE: sediakan tombol "Isi contoh jawaban Rani" di mode demo.

---

## Langkah

### Fitur 0 — Fondasi
- [x] 0.1 Scaffold, dependensi, auth + smoke test 15/15, `schema.sql`, draf `lib/schemas.ts`
- [ ] 0.2 (bersama FE) Sepakati `lib/schemas.ts`: 5 kategori radar + mekanisme mode demo
- [x] 0.3 Turso (aws-ap-southeast-1) + migrasi, GitHub, Vercel + env. Production: auth 401, intent/profile LLM asli 3–4 dtk, guardrail OK, `test-analyses` 12/12 ke Turso, demo OK, cookie Secure+HttpOnly+SameSite=lax

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
- [x] 3.1 `data/lowongan.json` v2: 75 lowongan (Web 35, Data Analyst 15, UI/UX 14, Mobile 11), sumber per lowongan di `data/sumber.csv`, dapat dibangun ulang dengan `python data/kurasi/build.py` (hasil identik). Alias pencocokan: nama kelompok + opsi_teknologi + `data/sinonim.json`
- [x] 3.2 `lib/scoring.ts` + `scripts/test-scoring.ts` (11/11 lulus, contoh manual 57)
- [x] 3.3 `/api/gap` dengan data asli: sumbu radar per posisi + label, `sumberLowongan.posisi_data`/`diakses`, proyek berbukti = portofolio. Posisi tanpa data (QA, Cybersecurity, DevOps) → perkiraan umum
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
- [x] 8.1 `scripts/test-guardrail.ts`: 27/27 lulus (18 intent: sesuai topik termasuk bahasa Inggris & Jawa, di luar topik, non-TI, 4 manipulasi, ambigu; 4 profil; 4 penilaian; 1 bias). Laporan untuk slide: `docs/hasil-uji-backend.md`. Perbaikan: hapus atribut sensitif di server, temperature 0 untuk ekstraksi, pemindai skill deterministik (`lib/skill-scan.ts`) → variasi skor CV yang sama 7 → 0–2, selisih antar-identitas 1

### Fitur 9 — Bonus & finalisasi
- [x] 9.1 (bonus) Roadmap adaptif — `POST /api/roadmap/adaptif`: analisis hasil wawancara oleh kode (topik skor < 60 / tidak dapat dinilai, rubrik terlemah), LLM menyusun ulang roadmap dengan topik terlemah di minggu 1–2 (dicek kode). Demo: AI gagal → roadmap lama + `diperbarui:false`. `scripts/test-roadmap-adaptif.ts` lulus
- [x] 9.2 (bonus) Mode eksplorasi — `POST /api/eksplorasi` `{profile}` → peringkat 4 posisi berdata (skor, wajib terpenuhi, kekuatan, gap teratas, alasan template). Deterministik tanpa LLM (2–30 ms). `scripts/test-eksplorasi.ts` lulus
- [ ] 9.4 (bonus) Tanya mentor — endpoint
- [ ] 9.5 Feature freeze, deploy final, cek env, bangunkan DB

---

## Log kontrak (`lib/schemas.ts`)

| Tanggal | Perubahan | Dampak ke FE |
|---|---|---|
| 2026-11-14 | Draf v0: Intent, Profile, GapResult, Roadmap, Question, Grade, AnalysisSummary | Mulai membuat mock dari tipe ini |
| 2026-11-14 | Tambahan (non-breaking): `HasilWawancara`, `AdaptiveRoadmapRequest`, `AdaptiveRoadmap` (= Roadmap + `fokus_ulang`, `catatan`, `diperbarui`) | Tombol "Perbarui roadmap" di ringkasan wawancara |
| 2026-11-14 | Tambahan (non-breaking): `ExplorationRequest`, `JalurKarier`, `ExplorationResult` untuk `/api/eksplorasi` | Layar pilihan jalur karier (mode eksplorasi) |
| 2026-11-14 | **v2 radar per posisi (disepakati BE):** `KategoriRadar` enum → string (id dari dataset, mis. `frontend`, `backend`, `database`, `tools`, `profesional`); **`RadarPoint.label` baru** (teks sumbu, wajib ditampilkan FE); jumlah sumbu 4–5 tergantung posisi; `sumberLowongan.posisi_data?` & `diakses?` baru. `GapItem.nama` bisa panjang (nama kelompok, mis. "Framework frontend (React/Vue/...)") | FE: tampilkan `label` untuk sumbu radar (jangan memetakan enum lama); teks "berdasarkan {jumlah} lowongan {posisi_data}, diakses {diakses}"; potong/wrap nama gap yang panjang |
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
