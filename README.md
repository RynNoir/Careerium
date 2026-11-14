# Careerium

Mentor karier berbasis AI untuk **mahasiswa dan fresh graduate yang menargetkan karier di bidang TI**.
Ceritakan tujuanmu dengan kalimat bebas, tempel atau unggah CV, lalu dapatkan peta skill berbukti,
skor kecocokan berdasarkan data lowongan asli, roadmap belajar 4 minggu, dan simulasi wawancara.

**Production:** https://careerium-drab.vercel.app (bisa dipakai tanpa akun; ada tombol **Coba mode demo**)

## Fitur

1. **Pemahaman tujuan**: kalimat bebas → tujuan, posisi, dan tahap kuliah, dengan kartu konfirmasi yang bisa diedit.
2. **Peta skill dari CV**: setiap skill punya **kutipan bukti dari CV** yang diverifikasi kode.
3. **Skor kecocokan & gap**: dibandingkan dengan **75 lowongan asli** (Web Developer 35, Data Analyst 15, UI/UX Designer 14, Mobile Developer 11). Skor dihitung kode, bukan AI.
4. **Roadmap 4 minggu** sesuai tahap kuliah dan tujuan (magang/kerja).
5. **Simulasi wawancara** 5 pertanyaan dari gap pengguna, dinilai dengan rubrik (kejelasan, relevansi, kedalaman, struktur/STAR).
6. **Roadmap adaptif**: setelah wawancara, roadmap disusun ulang dengan fokus ke topik yang jawabannya paling lemah.
7. **Mode eksplorasi**: untuk yang belum punya target, CV dibandingkan ke semua posisi berdata.
8. **Akun & riwayat** (opsional): simpan hasil, centang roadmap, bandingkan percobaan wawancara, ekspor hasil ke PDF.
9. **Mode tamu & mode demo** persona Rani (fiktif), tetap berjalan walau semua penyedia AI gagal.

## Cara kerja singkat

| Tahap | Endpoint | Peran AI | Peran kode |
|---|---|---|---|
| Tujuan | `POST /api/intent` | Klasifikasi ke nilai enum | Normalisasi enum, tolak pola manipulasi, pesan penolakan template |
| Profil | `POST /api/profile` | Ekstraksi skill + kutipan | Hapus atribut sensitif, validasi kutipan ada di CV, pemindai skill deterministik |
| Gap | `POST /api/gap` | Pencocokan sisa skill | Kebutuhan dari `data/lowongan.json`, skor & radar (`lib/scoring.ts`) |
| Roadmap | `POST /api/roadmap`, `/api/roadmap/adaptif` | Menyusun 4 minggu | Cek 4 minggu, gap wajib di minggu 1–2, hapus URL |
| Wawancara | `POST /api/interview/questions`, `/grade` | Pertanyaan & rubrik 1–5 | Cek 5 pertanyaan + gap asal, hitung skor total, batasi jawaban tidak relevan |
| Eksplorasi | `POST /api/eksplorasi` | — | Sepenuhnya deterministik |

Penyedia LLM: Groq (`openai/gpt-oss-120b` → `openai/gpt-oss-20b`) lalu Gemini, dengan fallback otomatis dan
data demo bila semua gagal. Detail kontrak API ada di `lib/schemas.ts`; status endpoint di `docs/todo/backend.md`.

## Stack

Next.js 16 (App Router) + TypeScript · Tailwind CSS · Recharts · Vercel AI SDK v7 + Zod ·
Groq & Gemini · Turso (libSQL/SQLite) · `bcryptjs` + `jose` (sesi di cookie httpOnly) · pdf.js · Vercel.

## Menjalankan di lokal

```bash
npm install
cp .env.example .env.local      # lalu isi kunci (lihat di bawah)
npm run db:migrate              # buat tabel di local.db
npm run dev                     # http://localhost:3000
```

Isi `.env.local`:

| Variabel | Keterangan |
|---|---|
| `GROQ_API_KEY` | Dari console.groq.com (cukup ini saja untuk mulai) |
| `GOOGLE_GENERATIVE_AI_API_KEY`, `GEMINI_MODEL` | Opsional, cadangan. ID model disalin dari Google AI Studio |
| `LLM_ORDER` | Urutan penyedia, disarankan `groq,groq-20b,gemini` |
| `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | Kosongkan untuk lokal (memakai `local.db`) |
| `SESSION_SECRET` | Minimal 32 karakter acak |

Tanpa kunci API pun aplikasi bisa dicoba lewat **mode demo**.

## Pengujian

```bash
npm run typecheck && npm run lint
npm run test:smoke                                   # auth (15 uji)
npx tsx scripts/test-scoring.ts                      # rumus skor
npx tsx scripts/test-ai-logic.ts                     # logika kode di sekitar AI (tanpa kunci API)
npx tsx scripts/test-profile.ts                      # validasi bukti, atribut sensitif, pemindai skill
npx tsx scripts/test-eksplorasi.ts                   # mode eksplorasi
npx tsx scripts/test-guardrail.ts                    # 27 uji guardrail + uji bias (memakai kuota API)
npx tsx scripts/test-demo-http.ts http://localhost:3000   # alur demo lewat HTTP + kuota sesi
npx tsx scripts/cek-token.ts                         # sisa kuota Groq & status Gemini
npx tsx scripts/test-llm-audit.ts                     # klasifikasi error AI & gagal cepat (tanpa kuota)
```

Hasil uji guardrail & bias terakhir: `docs/hasil-uji-backend.md`.

## Data lowongan

`data/lowongan.json` adalah agregat kebutuhan skill (bukan salinan teks lowongan) dari lowongan magang, junior,
dan fresh graduate di Indonesia, diakses 13 November 2026. Sumber per lowongan ada di `data/sumber.csv`, dan
keduanya dibangun ulang dengan `python data/kurasi/build.py`. Prioritas: muncul di ≥ 60% lowongan = wajib,
30–59% = penting, < 30% = nilai tambah. Sampelnya kecil (11–35 per posisi), jadi persentase adalah gambaran,
bukan statistik pasar. Posisi tanpa data (QA, Cybersecurity, DevOps) diberi label "perkiraan umum".

## Privasi & keamanan

- **Teks CV tidak pernah disimpan.** Nama, email, nomor telepon, dan alamat dihapus di browser sebelum dikirim;
  server menghapus lagi baris identitas (nama, jenis kelamin, agama, tanggal lahir, status) sebelum ke AI.
- Yang disimpan untuk akun hanya hasil terstruktur (skill + kutipan bukti singkat, skor, gap, roadmap, skor wawancara).
  Hapus akun menghapus semuanya.
- Semua panggilan AI hanya dari server; tidak ada kunci dengan awalan `NEXT_PUBLIC_`.
- Masukan pengguna diperlakukan sebagai data, bukan instruksi; pesan penolakan dan error dibuat oleh kode.
- Batas input (tujuan 500, CV 6.000, jawaban 1.500 karakter) dan kuota permintaan per sesi & per IP.
- Skor adalah **alat refleksi, bukan penilaian resmi**, dan dinilai dari skill + bukti, bukan identitas.

## Antarmuka (frontend)

- **Halaman:** `/mulai` (tujuan + kartu konfirmasi) → `/profil` (tempel/unggah PDF CV) → `/hasil` (skor, radar,
  gap, kekuatan berbukti, roadmap, simpan, ekspor PDF) → `/wawancara` (5 pertanyaan, umpan balik, ringkasan,
  roadmap adaptif) · `/riwayat` · `/masuk` · `/daftar` · `/lupa-password` · `/akun`.
- **Gaya "Stiker Biru"** dengan maskot **Kira** (`DESIGN.md`): mobile-first (360 px), desktop dengan sidebar ikon
  dan tata letak bento. Gap ditulis "perlu ditingkatkan" berwarna oranye, tidak pernah merah.
- **Mode tamu:** hasil tersimpan di `sessionStorage` (muat ulang tidak menghapus hasil; teks CV tidak ikut disimpan).
- **Aksesibilitas:** diuji otomatis dengan axe-core di 15 keadaan layar (360 px & 1280 px): 0 pelanggaran
  WCAG 2.1 A/AA, target sentuh ≥44 px, fokus keyboard terlihat, `prefers-reduced-motion` dihormati,
  chart punya `aria-label` berisi angka.
- Satu pintu API di `lib/api-client.ts`; semua teks penolakan/error/gelembung Kira di `lib/pesan-template.ts`.

## Dokumen proyek

`PRD.md` (kebutuhan) · `CLAUDE.md` (aturan teknis) · `DESIGN.md` (gaya visual) · `WORKFLOW.md` (alur tim) ·
`docs/alur-fitur.md` (urutan kerja) · `docs/todo/` (progres per track).
