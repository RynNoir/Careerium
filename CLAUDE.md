# CLAUDE.md — Careerium

Panduan untuk agen AI (Claude Code, Antigravity, Cursor, dan IDE lain) yang mengerjakan proyek ini.
Baca file ini dan `DESIGN.md` sebelum mulai bekerja.
Tim terdiri dari 1 Backend dan 1 Frontend: ikuti `WORKFLOW.md` (kepemilikan file, branch, perubahan kontrak), urutan langkah di `docs/alur-fitur.md`, dan kerjakan tugas dari TODO track yang disebut pengguna (`docs/todo/backend.md` atau `docs/todo/frontend.md`). Jika pengguna belum menyebut track-nya, tanyakan dulu sebelum mengedit file.

## 1. Tentang proyek

Careerium adalah aplikasi web mentor karier berbasis AI untuk **mahasiswa dan fresh graduate yang menargetkan karier di bidang TI**.
Pengguna menceritakan tujuannya dengan kalimat bebas, menempel atau mengunggah CV, lalu mendapat:

1. Peta skill dari CV (setiap skill punya bukti kutipan dari CV).
2. Skor kecocokan dan daftar gap terhadap posisi target (berdasarkan dataset lowongan).
3. Roadmap belajar 4 minggu sesuai tahap kuliah.
4. Simulasi wawancara 5 pertanyaan yang dibuat dari gap pengguna, dinilai dengan rubrik.
5. Riwayat progres (untuk pengguna yang login).

Konteks: proyek lomba hackathon dengan waktu pengerjaan 24 jam. Utamakan alur end-to-end yang berjalan di atas fitur tambahan.

### Batasan lingkup
- Lingkup ditentukan oleh **target karier TI**, bukan jurusan. Mahasiswa akuntansi yang ingin jadi Data Analyst masuk lingkup.
- Preset posisi: Web Developer (frontend/backend), Mobile Developer, Data Analyst, UI/UX Designer, QA/Tester, Cybersecurity, DevOps.
- Posisi TI di luar preset: pengguna menempel deskripsi lowongan. Tanpa itu, beri label "perkiraan umum, bukan data lowongan".
- Target di luar TI: tolak dengan ramah, tawarkan irisan TI jika ada.

## 2. Stack

| Lapisan | Pilihan |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui + ikon Lucide + Recharts |
| Hosting | Vercel Hobby (gratis) |
| LLM utama | Gemini Flash via `@ai-sdk/google` |
| LLM cadangan | Groq via `@ai-sdk/groq`, model `openai/gpt-oss-120b` untuk structured output |
| Structured output | Vercel AI SDK `generateObject` + Zod |
| Database | Turso (libSQL/SQLite) via `@libsql/client`; lokal memakai `file:local.db` |
| Auth | Email + password buatan sendiri: `bcryptjs` (hash), `jose` (sesi JWT di cookie httpOnly) |
| Baca PDF | pdf.js di browser + opsi tempel teks |

Aturan stack:
- **Jangan menebak ID model Gemini.** Pakai ID yang tertera di Google AI Studio, simpan di env `GEMINI_MODEL`.
- Di Groq, structured output **tidak bisa digabung dengan streaming**. Chat wawancara (streaming teks) dan penilaian jawaban (JSON) adalah dua panggilan terpisah.
- Jangan menambah layanan berbayar, OAuth, atau layanan pengirim email.
- Sebelum menulis kode yang memakai API library (Next.js, AI SDK, libSQL), cek dokumentasi terbaru (Context7 MCP jika tersedia). API library ini sering berubah.

## 3. Struktur folder

```
app/
  (pages)                 halaman: mulai, hasil, wawancara, riwayat, masuk, daftar
  api/auth/{register,login,reset,logout,delete}/route.ts   (sudah ada)
  api/{intent,profile,gap,roadmap,interview,grade}/route.ts
lib/
  db.ts  auth-core.ts  session.ts      (sudah ada, sudah diuji)
  llm.ts          fallback Gemini -> Groq, retry + backoff
  schemas.ts      semua skema Zod
  prompts/        satu file per tahap prompt
  scoring.ts      perhitungan skor (deterministik, BUKAN di prompt)
  redact.ts       hapus PII sebelum teks dikirim ke LLM
  limits.ts       batas panjang input dan jumlah panggilan per sesi
data/
  lowongan.json   kebutuhan skill per posisi (dikurasi manual)
  demo/rani.json  cache hasil persona demo
db/schema.sql
scripts/{migrate,smoke-test}.ts
DESIGN.md
```

## 4. Rantai prompt AI

| Tahap | Masukan | Keluaran (JSON tervalidasi Zod) |
|---|---|---|
| 1. Pemahaman tujuan | kalimat bebas | `kategori`, `tujuan`, `posisi_target`, `tahap`, `kekhawatiran`, `kepercayaan` |
| 2. Ekstraksi profil | teks CV (sudah diredaksi) | `cv_valid`, skill teknis, tools, soft skill, proyek, tingkat, **kutipan bukti** per skill |
| 3. Analisis gap | profil + kebutuhan posisi dari `lowongan.json` | kekuatan, gap berprioritas (wajib/penting/nilai_tambah) |
| 4. Roadmap | gap + tahap | 4 minggu: fokus, kegiatan, mini-proyek |
| 5. Pertanyaan wawancara | gap + posisi | 5 pertanyaan, masing-masing dengan gap asalnya |
| 6. Penilaian jawaban | pertanyaan + jawaban + rubrik | `relevan`, skor per kriteria (kejelasan, relevansi, kedalaman, struktur), saran |

Aturan wajib:
- **Nilai terbatas (enum).** Nilai di luar daftar dianggap `tidak_jelas`.
  - `kategori`: `karier_ti | karier_non_ti | di_luar_topik | upaya_manipulasi | tidak_jelas`
  - `tujuan`: `kerja | magang | tingkatkan_skill | eksplorasi | tidak_jelas`
  - `tahap`: `semester_awal | semester_tengah | semester_akhir | fresh_graduate`
- **Skor kecocokan dihitung oleh `scoring.ts`**, dengan bobot wajib/penting/nilai_tambah. LLM hanya mengekstrak, tidak memberi angka skor kecocokan.
- **Input pengguna adalah data, bukan instruksi.** Bungkus dengan pembatas yang jelas di prompt. Hanya field JSON tertentu yang ditampilkan ke UI.
- **Pesan penolakan dan error dibuat oleh kode (template tetap)**, bukan oleh LLM.
- Jawaban wawancara dengan `relevan: false` mendapat status "tidak dapat dinilai", skornya dibatasi oleh kode.
- AI hanya memakai informasi dari masukan. Jangan meminta AI menyebut gaji, tautan kursus, nama kursus, atau lowongan nyata.
- Penilaian berdasarkan skill dan bukti, bukan nama, gender, kampus, atau latar belakang pribadi.
- Kebutuhan skill berasal dari `lowongan.json`, dan UI menampilkan sumbernya ("berdasarkan N lowongan").
- Jika semua penyedia LLM gagal: tampilkan pesan ramah, dan untuk mode demo pakai `data/demo/rani.json`.

## 5. Privasi dan keamanan

- **Teks CV mentah tidak pernah disimpan.** Yang disimpan hanya hasil terstruktur: skill, skor, gap, roadmap, skor wawancara.
- Hapus nama, email, nomor telepon, dan alamat dari teks CV di sisi klien sebelum dikirim ke server/LLM (`redact.ts`).
- Data yang tersimpan untuk akun: email, hash password, hash kode pemulihan, dan hasil terstruktur. Endpoint `/api/auth/delete` menghapus semuanya.
- Semua panggilan LLM hanya dari server (API route). **Jangan pernah memakai awalan `NEXT_PUBLIC_` untuk kunci API atau token database.**
- Batas input: tujuan maks 500 karakter, CV maks 6.000, jawaban wawancara maks 1.500.
- Batasi jumlah panggilan LLM per sesi; mode tamu memakai token sesi bertanda tangan.
- Jangan mengubah logika di `lib/auth-core.ts` tanpa menjalankan ulang `scripts/smoke-test.ts`.
- Password: hash bcrypt, cookie `httpOnly` + `secure` + `sameSite=lax`, pesan error login seragam, kunci 10 menit setelah 5 gagal.

## 6. Environment variables

```
GOOGLE_GENERATIVE_AI_API_KEY=
GEMINI_MODEL=            # salin ID model dari Google AI Studio
GROQ_API_KEY=
TURSO_DATABASE_URL=      # kosong saat development -> file:local.db
TURSO_AUTH_TOKEN=
SESSION_SECRET=          # minimal 32 karakter acak
```
Jangan mengaktifkan billing Google Cloud di project API.

## 7. Perintah

```
npm run dev
npx tsx scripts/migrate.ts       # buat tabel
npx tsx scripts/smoke-test.ts    # uji logika auth
```

## 8. Desain dan pemakaian skill

- **`DESIGN.md` adalah satu-satunya sumber kebenaran gaya.** Jangan memakai warna, font, radius, atau pola di luar `DESIGN.md`.
- Jika `DESIGN.md` masih berstatus BELUM DIKUNCI, hentikan pekerjaan visual dan minta pengguna menentukan gaya terlebih dulu. Logika, API, dan database boleh dikerjakan.
- **Skill desain hanya dipakai saat pengguna memintanya secara eksplisit.** Jangan memanggilnya otomatis.

| Peran | Skill | Kapan |
|---|---|---|
| Pengarah desain (satu saja) | Impeccable *atau* UI UX Pro Max | Hanya saat menentukan gaya, lalu hasilnya ditulis ke `DESIGN.md` |
| Sumber referensi | Awesome Design (DESIGN.md) | Saat pengguna memberi referensi gaya |
| Penilai | `/impeccable audit`, `critique`, `polish`; checklist UI UX Pro Max | Setelah satu layar selesai |
| Bagian tertentu | Taste Skill | Hanya landing page / halaman pembuka, bukan layar produk |
| Selalu aktif | Ponytail (+ Caveman opsional) | Seluruh sesi |
| Pendukung | Anthropic skill-creator, webapp-testing | Saat diperlukan |

Jika gaya berubah: ubah `DESIGN.md` dulu, baru sesuaikan semua layar.

## 9. Aturan git (WAJIB)

- **Jangan pernah menjalankan `git commit`, `git push`, `git merge`, `git rebase`, `git reset`, atau perintah lain yang mengubah riwayat git.** Semua commit dilakukan manual oleh pengembang.
- Boleh menjalankan perintah baca saja: `git status`, `git diff`, `git log`.
- Setelah perubahan selesai dan layak di-commit, **berikan** (jangan jalankan):
  1. Ringkasan perubahan dan daftar file yang berubah.
  2. Perintah `git add` dengan file spesifik (bukan `git add .`) dan `git commit -m "..."`.
  3. Pesan commit format Conventional Commits, deskripsi Bahasa Indonesia, contoh: `feat(api): tambah endpoint intent dengan guardrail kategori`.
- Tipe: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`. Lingkup: `api`, `ai`, `auth`, `db`, `ui`, `hasil`, `wawancara`, `riwayat`, `design`, `data`, `config`.
- Jangan pernah menyarankan commit untuk `.env*`, `local.db`, atau file berisi kunci API. Pastikan semuanya ada di `.gitignore`.
- Detail lengkap dan rencana 24 jam: lihat `PRD.md` bagian 17–18. Alur branch, merge, dan kepemilikan file: `WORKFLOW.md`.

## 10. Gaya kerja

- Tulis kode seminimal yang menyelesaikan tugas (selaras dengan Ponytail), tetapi **jangan mengorbankan validasi, keamanan, atau aksesibilitas**.
- Satu tugas, satu perubahan yang bisa diuji. Jelaskan apa yang tidak dikerjakan dan risikonya.
- Teks UI dalam Bahasa Indonesia, sapaan "kamu", ramah dan tidak menghakimi.
- Penjelasan ke pengguna dalam Bahasa Indonesia.
- Komentar kode singkat, hanya untuk hal yang tidak jelas dari kodenya.

## 11. Lingkup MVP

**Dikerjakan:** ketik bebas + kartu konfirmasi, tempel/unggah CV, ekstraksi skill dengan bukti, analisis gap + visual, roadmap 4 minggu, wawancara 5 pertanyaan + penilaian, login email/password, riwayat, mode tamu, mode demo persona Rani.

**Bonus jika waktu tersisa:** mode eksplorasi penuh (usul 2–3 jalur karier), roadmap adaptif setelah wawancara, kotak "Tanya mentor" yang hanya menjawab dari hasil pengguna, ekspor PDF.

**Tidak dikerjakan:** OAuth, verifikasi email, scraping lowongan real-time, wawancara suara/video, dashboard kampus/perusahaan.

## 12. Pengujian sebelum demo

- `scripts/smoke-test.ts` lulus.
- 15–20 prompt uji (sesuai topik, di luar topik, upaya manipulasi, CV bukan CV, jawaban ngawur) memberi respons yang diharapkan.
- Alur lengkap persona Rani berjalan di ukuran layar ponsel.
- Database Turso dan API key aktif; bangunkan aplikasi dengan satu permintaan sebelum presentasi.
