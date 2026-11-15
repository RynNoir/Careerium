# Careerium

**Mentor karier berbasis AI yang menilai berdasarkan bukti.**

Careerium membantu mahasiswa dan fresh graduate mengetahui posisinya terhadap karier yang diincar, skill apa yang masih kurang, dan langkah belajar berikutnya. Ceritakan tujuanmu dengan kalimat bebas, tempel atau unggah CV, lalu dapatkan peta skill berbukti, skor kecocokan dari data lowongan asli, roadmap belajar 4 minggu, dan simulasi wawancara.

**Coba langsung:** https://careerium-drab.vercel.app (tanpa akun; ada tombol **Coba mode demo**)

> **Lingkup saat ini:** data lowongan yang tersedia baru mencakup posisi TI (Web Developer, Data Analyst, UI/UX Designer, Mobile Developer). Pendekatannya bisa diperluas ke bidang lain dengan menambah data lowongan dan rubrik per bidang.

---

## Masalah

Mahasiswa punya banyak sumber belajar, tetapi sedikit arah:

- Tidak tahu skill apa yang sebenarnya dibutuhkan industri.
- Tidak tahu seberapa siap dirinya terhadap posisi target.
- Bingung memilih bidang bila belum punya target.
- Jarang berlatih wawancara, dan bimbingan karier terbatas.

AI bisa membantu, tetapi hanya jika penilaiannya **berbukti dan bisa diperiksa**. Skor tanpa alasan atau skill karangan justru menyesatkan keputusan karier.

## Solusi

Satu alur dengan lima hasil, di mana **AI menilai dan kode mengaudit**:

1. **Pemahaman tujuan:** kalimat bebas diubah menjadi tujuan, posisi, dan tahap kuliah, dengan kartu konfirmasi yang bisa diedit.
2. **Peta skill dari CV:** setiap skill punya **kutipan bukti dari CV** yang diverifikasi kode.
3. **Skor kecocokan dan gap:** dibandingkan dengan **75 lowongan asli** (Web Developer 35, Data Analyst 15, UI/UX Designer 14, Mobile Developer 11).
4. **Roadmap 4 minggu** sesuai tahap kuliah dan tujuan (magang atau kerja).
5. **Simulasi wawancara** 5 pertanyaan dari gap pengguna, dinilai dengan rubrik.

Fitur tambahan:
- **Roadmap adaptif:** setelah wawancara, roadmap disusun ulang ke topik yang jawabannya paling lemah.
- **Mode eksplorasi:** untuk yang belum punya target, CV dibandingkan ke semua posisi berdata, lalu AI menulis usulan mentor dan alasan per jalur.
- **Akun dan riwayat** (opsional): simpan hasil, centang roadmap, bandingkan percobaan wawancara, ekspor PDF.
- **Mode tamu dan mode demo** persona Rani (fiktif), tetap berjalan walau semua penyedia AI gagal.

## Pembeda: AI menilai, kode mengaudit

| | Peran AI | Peran kode |
|---|---|---|
| Penilaian | Memberi nilai rubrik 0–4 per kebutuhan, relatif terhadap tahap kuliah, beserta alasan dan kutipan bukti | Membatalkan nilai yang buktinya tidak ada di CV, lalu menjumlahkan dengan bobot dari data lowongan |
| Skor akhir | Tidak pernah memberi angka 0–100 | Menghitung skor dan radar secara deterministik (`lib/scoring.ts`) |
| Pesan error dan penolakan | Tidak terlibat | Template tetap, tidak bisa dimanipulasi |
| Masukan pengguna | Diperlakukan sebagai data, bukan instruksi | Dibungkus pembatas, pola manipulasi ditolak |

Penjelasan lengkap: [`docs/penilaian-ai.md`](docs/penilaian-ai.md).

## Cara kerja

| Tahap | Endpoint | Peran AI | Peran kode |
|---|---|---|---|
| Tujuan | `POST /api/intent` | Klasifikasi ke nilai enum | Normalisasi enum, tolak pola manipulasi, pesan penolakan template |
| Profil | `POST /api/profile` | Ekstraksi skill dan kutipan | Hapus atribut sensitif, validasi kutipan ada di CV, pemindai skill deterministik |
| Gap | `POST /api/gap` | **Asesor:** nilai rubrik 0–4, alasan, bukti, ringkasan mentor | Kebutuhan dari `data/lowongan.json`, batalkan nilai tanpa bukti, aturan cadangan, agregasi skor dan radar |
| Roadmap | `POST /api/roadmap`, `/api/roadmap/adaptif` | Menyusun 4 minggu | Cek 4 minggu, gap wajib di minggu 1–2, hapus URL |
| Wawancara | `POST /api/interview/questions`, `/grade` | Pertanyaan dan rubrik 1–5 | Cek 5 pertanyaan, hitung skor total, batasi jawaban tidak relevan |
| Eksplorasi | `POST /api/eksplorasi` | Ringkasan usulan mentor dan alasan per jalur | Skor dan peringkat deterministik, audit teks AI, alasan template bila AI gagal |

**Penyedia LLM:** Groq (`openai/gpt-oss-120b` lalu `openai/gpt-oss-20b`) dan Gemini, dengan fallback otomatis, batas waktu total 40 detik, klasifikasi error (kuota, lambat, tidak tersedia), dan data demo bila semua gagal. Setiap panggilan AI dicatat di log audit (`llm-audit`).

Kontrak API ada di `lib/schemas.ts`; status endpoint di `docs/todo/backend.md`.

## Tech stack

| Lapisan | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| UI | Tailwind CSS, Recharts, Lucide, pdf.js |
| AI | Vercel AI SDK v7, Zod, Groq, Google Gemini |
| Database | Turso (libSQL/SQLite); lokal memakai `local.db` |
| Autentikasi | `bcryptjs` dan `jose` (sesi JWT di cookie httpOnly) |
| Hosting | Vercel |

## Menjalankan di lokal

Prasyarat: Node.js 20 atau lebih baru.

```bash
npm install
cp .env.example .env.local      # lalu isi kunci (lihat tabel)
npm run db:migrate              # buat tabel di local.db
npm run dev                     # http://localhost:3000
```

| Variabel | Keterangan |
|---|---|
| `GROQ_API_KEY` | Dari console.groq.com (cukup ini untuk mulai) |
| `GOOGLE_GENERATIVE_AI_API_KEY`, `GEMINI_MODEL` | Opsional, cadangan. Salin ID model dari Google AI Studio |
| `LLM_ORDER` | Urutan penyedia, disarankan `groq,groq-20b,gemini` |
| `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | Kosongkan untuk lokal (memakai `local.db`) |
| `SESSION_SECRET` | Minimal 32 karakter acak |

Tanpa kunci API pun aplikasi bisa dicoba lewat **mode demo**. Jangan pernah memakai awalan `NEXT_PUBLIC_` untuk kunci API atau token database, dan jangan meng-commit `.env.local`.

## Pengujian

```bash
npm run typecheck && npm run lint
npm run test:smoke                                   # autentikasi
npx tsx scripts/test-scoring.ts                      # rumus skor
npx tsx scripts/test-penilaian.ts                    # audit hasil AI asesor (tanpa kuota)
npx tsx scripts/test-ai-logic.ts                     # logika kode di sekitar AI (tanpa kunci)
npx tsx scripts/test-profile.ts                      # validasi bukti, atribut sensitif
npx tsx scripts/test-eksplorasi.ts                   # mode eksplorasi
npx tsx scripts/test-llm-audit.ts                    # klasifikasi error AI (tanpa kuota)
npx tsx scripts/test-guardrail.ts                    # guardrail dan uji bias (memakai kuota API)
npx tsx scripts/test-demo-http.ts http://localhost:3000   # alur demo lewat HTTP
npx tsx scripts/cek-token.ts                         # sisa kuota Groq dan status Gemini
```

Hasil uji guardrail dan bias terakhir: [`docs/hasil-uji-backend.md`](docs/hasil-uji-backend.md).

## Struktur proyek

```
app/            halaman (mulai, profil, hasil, wawancara, riwayat, akun) dan API route
components/     komponen UI per halaman
lib/            llm.ts (orkestrasi model), scoring.ts, schemas.ts (kontrak), prompts/, pesan-template.ts
data/           lowongan.json, sumber.csv, demo/rani.json, kurasi/ (pipeline data)
db/             skema SQL
scripts/        migrasi, uji, cek token
docs/           penilaian AI, alur fitur, progres, bahan presentasi
```

## Data lowongan

`data/lowongan.json` adalah agregat kebutuhan skill (bukan salinan teks lowongan) dari lowongan magang, junior, dan fresh graduate di Indonesia, diakses 13 November 2026. Sumber per lowongan ada di `data/sumber.csv`; keduanya dibangun ulang dengan `python data/kurasi/build.py`.

Prioritas: muncul di ≥ 60% lowongan = wajib, 30–59% = penting, < 30% = nilai tambah.

## Privasi dan keamanan

- **Teks CV tidak pernah disimpan.** Nama, email, telepon, dan alamat dihapus di browser sebelum dikirim; server menghapus lagi baris identitas sebelum ke AI.
- Yang disimpan untuk akun hanya hasil terstruktur. Hapus akun menghapus semuanya.
- Semua panggilan AI hanya dari server.
- Password di-hash bcrypt, sesi di cookie `httpOnly`, login terkunci 10 menit setelah 5 kali gagal.
- Batas input (tujuan 500, CV 6.000, jawaban 1.500 karakter) dan kuota permintaan per sesi dan per IP.
- Penilaian berdasarkan skill dan bukti, bukan nama, gender, kampus, atau latar belakang.

## Keterbatasan

- Sampel lowongan kecil (11–35 per posisi) dan sebagian besar dari satu agregator, jadi angkanya gambaran kebutuhan, bukan statistik pasar.
- Posisi tanpa data (QA, Cybersecurity, DevOps) diberi label "perkiraan umum".
- Nilai AI bisa bervariasi beberapa poin antar-percobaan dan antar-model; karena itu setiap nilai wajib berbukti.
- Skor adalah **alat refleksi, bukan penilaian resmi**, dan belum divalidasi terhadap hasil seleksi.
- Memakai kuota gratis penyedia AI; skala besar membutuhkan paket berbayar.

## Rencana pengembangan

- Memperluas cakupan ke profesi di bidang lain, dengan data lowongan per bidang.
- Roadmap dan tanya jawab mentor yang makin personal.
- Menguji skor terhadap hasil seleksi magang.
- Kerja sama dengan career center kampus.

## Dokumen proyek

[`PRD.md`](PRD.md) (kebutuhan) · [`CLAUDE.md`](CLAUDE.md) (aturan teknis) · [`DESIGN.md`](DESIGN.md) (gaya visual) · [`WORKFLOW.md`](WORKFLOW.md) (alur tim) · [`docs/alur-fitur.md`](docs/alur-fitur.md) · [`docs/todo/`](docs/todo/) (progres per track).
