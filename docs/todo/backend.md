# TODO — Backend

Pemilik: **Backend**. Hanya Backend yang mengedit file ini. Frontend boleh membaca.
Nomor langkah dan detail "selesai jika" ada di `docs/alur-fitur.md`.

**Sedang dikerjakan:** _(tulis nomor langkah, contoh: 1.1)_

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
| POST `/api/intent` | 1 | `IntentRequest` → `Intent` | belum | |
| POST `/api/profile` | 2 | `ProfileRequest` → `Profile` | belum | |
| POST `/api/gap` | 3 | `GapRequest` → `GapResult` | belum | |
| POST `/api/roadmap` | 4 | `RoadmapRequest` → `Roadmap` | belum | |
| POST `/api/interview/questions` | 5 | `QuestionsRequest` → `QuestionsResponse` | belum | |
| POST `/api/interview/grade` | 5 | `GradeRequest` → `Grade` | belum | |
| POST/GET `/api/analyses` | 6 | `AnalysisSummary` | belum | Perlu login |
| GET `/api/analyses/[id]` | 6 | – | belum | Pemilik saja |
| PATCH `/api/analyses/[id]/roadmap/[itemId]` | 6 | – | belum | Pemilik saja |
| POST `/api/analyses/[id]/interviews` | 6 | – | belum | Pemilik saja |

Semua error berbentuk `{ "error": string }` (pesan Bahasa Indonesia, siap ditampilkan).

---

## Langkah

### Fitur 0 — Fondasi
- [x] 0.1 Scaffold, dependensi, auth + smoke test 15/15, `schema.sql`, draf `lib/schemas.ts`
- [ ] 0.2 (bersama FE) Sepakati `lib/schemas.ts`: 5 kategori radar + mekanisme mode demo
- [ ] 0.3 Turso + migrasi, GitHub, Vercel + env, `GEMINI_MODEL`

### Fitur 1 — Pemahaman tujuan
- [ ] 1.1 `lib/llm.ts` fallback Gemini → Groq (cek dokumentasi AI SDK v7 dulu)
- [ ] 1.2 `lib/limits.ts` batas input + panggilan per sesi
- [ ] 1.3 `/api/intent` + guardrail kategori
- [ ] → Serah terima `/api/intent`

### Fitur 2 — Profil
- [ ] 2.1 `/api/profile` dengan `cv_valid` dan bukti
- [ ] 2.2 Validasi bukti oleh kode
- [ ] → Serah terima `/api/profile`

### Fitur 3 — Gap & skor
- [ ] 3.1 `data/lowongan.json`
- [ ] 3.2 `lib/scoring.ts` + `scripts/test-scoring.ts`
- [ ] 3.3 `/api/gap`
- [ ] → Serah terima `/api/gap`

### Fitur 4 — Roadmap
- [ ] 4.1 `/api/roadmap` + deploy Vercel
- [ ] → Serah terima `/api/roadmap`

### Fitur 5 — Wawancara
- [ ] 5.1 `/api/interview/questions`
- [ ] 5.2 `/api/interview/grade` + batas skor oleh kode
- [ ] → Serah terima `/api/interview/*`

### Fitur 6 — Riwayat
- [ ] 6.1 `/api/analyses` (simpan, daftar, detail)
- [ ] 6.2 PATCH roadmap item, POST percobaan wawancara, cek pemilik
- [ ] → Serah terima `/api/analyses/*`

### Fitur 7 — Mode demo
- [ ] 7.1 `data/demo/rani.json` + fallback demo
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

---

## Butuh dari frontend

_(kosong)_

## Catatan / blocker

- `next.config.ts` memakai `cacheComponents: true` (bawaan Next 16).
- Cookie sesi `secure` hanya di production (Safari menolak cookie secure di http://localhost).
