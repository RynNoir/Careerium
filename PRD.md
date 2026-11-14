# PRD — Careerium

**Platform berbasis AI untuk mengembangkan potensi mahasiswa menuju karier TI yang terarah.**

| Item | Keterangan |
|---|---|
| Dokumen | Product Requirements Document (PRD) |
| Versi | 1.0 (draf develop) |
| Konteks | Lomba hackathon, pengerjaan 24 jam (09.00 – 09.00 hari berikutnya) |
| Dokumen terkait | `CLAUDE.md` (aturan agen & teknis), `DESIGN.md` (gaya visual, status BELUM DIKUNCI) |
| Pembagian kerja | Track **Backend** dan track **Frontend** |

---

## Daftar isi
1. Ringkasan
2. Latar belakang dan masalah
3. Tujuan dan indikator keberhasilan
4. Pengguna dan persona
5. Lingkup
6. Alur pengguna
7. Kebutuhan fungsional
8. Kebutuhan AI
9. Kebutuhan non-fungsional
10. Arsitektur dan stack
11. Model data
12. Kontrak API
13. Desain UI/UX
14. Dataset kebutuhan skill
15. Etika, privasi, dan batasan
16. Risiko dan mitigasi
17. Aturan pengembangan (termasuk aturan commit)
18. Rencana pengerjaan 24 jam
19. Persiapan sebelum hari H
20. Checklist demo dan pitch
21. Hal yang belum diputuskan

---

## 1. Ringkasan

Careerium adalah aplikasi web yang bekerja sebagai mentor karier berbasis AI untuk mahasiswa dan fresh graduate yang menargetkan karier di bidang TI. Pengguna menceritakan tujuannya dengan kalimat bebas, memberikan CV, lalu Careerium menghasilkan:

1. **Peta skill** dari CV, dengan bukti kutipan untuk setiap skill.
2. **Skor kecocokan dan daftar gap** terhadap posisi target, berdasarkan dataset kebutuhan skill dari lowongan.
3. **Roadmap belajar 4 minggu** sesuai tahap kuliah.
4. **Simulasi wawancara** 5 pertanyaan yang dibuat dari gap pengguna sendiri, dinilai dengan rubrik eksplisit.
5. **Riwayat progres** untuk pengguna yang login, termasuk perbandingan skor wawancara antar percobaan.

**Posisi pembeda:** *skill gap berbasis bukti*. Setiap skill ditautkan ke kutipan CV, setiap kebutuhan ditautkan ke sumber lowongan, dan skor dinilai AI dengan rubrik berbukti lalu diaudit dan dijumlahkan oleh kode, bukan angka tebakan AI. Hasil wawancara menutup siklus dengan memperbarui riwayat progres.

---

## 2. Latar belakang dan masalah

| Masalah | Akibat |
|---|---|
| Tidak tahu skill apa yang dibutuhkan industri | Belajar tanpa arah atau ikut tren tanpa tahu relevansinya |
| Tidak tahu posisi diri terhadap target | Merasa belum siap, menunda melamar |
| Target karier belum jelas | Bingung memilih bidang, magang, dan mata kuliah pilihan |
| Kurang latihan wawancara | Gugup dan sulit menjelaskan kemampuan sendiri |
| Bimbingan karier terbatas | Konsultasi personal tidak selalu tersedia kapan saja |

Mahasiswa punya potensi, tetapi tidak punya peta yang menunjukkan **di mana mereka sekarang, ke mana tujuannya, dan jalan apa yang harus ditempuh**.

---

## 3. Tujuan dan indikator keberhasilan

### Tujuan produk
- Pengguna mengetahui gap skill-nya dalam waktu singkat, dengan alasan yang bisa diperiksa.
- Pengguna punya rencana belajar yang konkret dan sesuai tahapnya.
- Pengguna merasa lebih siap wawancara, terukur dari kenaikan skor antar percobaan.

### Tujuan lomba
- Alur end-to-end berjalan online, bisa dicoba juri tanpa akun.
- Menunjukkan implementasi AI yang matang: prompt chaining, structured output tervalidasi, intent extraction, rubrik penilaian, guardrail di luar konteks.

### Indikator (diukur lewat uji cepat 5–10 pengguna sebelum/selama lomba)
| Indikator | Cara ukur |
|---|---|
| Waktu sampai pengguna mengetahui gap skill | Stopwatch dari halaman Mulai sampai halaman Hasil tampil |
| Kenaikan skor wawancara | Skor percobaan 1 vs percobaan 2 (tersimpan di riwayat) |
| Ketepatan pemahaman tujuan | % kartu konfirmasi yang langsung disetujui tanpa diubah |
| Ketahanan guardrail | % dari 15–20 prompt uji yang mendapat respons sesuai harapan |

---

## 4. Pengguna dan persona

**Pengguna utama:** mahasiswa (semester awal sampai akhir) dan fresh graduate yang menargetkan karier TI, untuk mencari kerja, magang, atau meningkatkan skill.

**Penerima manfaat tidak langsung:** kampus dan pusat karier, perusahaan dan HR, lembaga pelatihan.

**Persona demo – Rani**
- Mahasiswa semester 6 jurusan TI.
- Ingin magang atau kerja di bidang web, tetapi bingung skill mana yang masih kurang.
- Membuka aplikasi dari ponsel.

**Batasan lingkup pengguna**
- Lingkup ditentukan oleh **target karier TI**, bukan jurusan. Mahasiswa non-TI yang ingin jadi Data Analyst tetap dilayani.
- Target di luar TI ditolak dengan ramah, dan ditawarkan irisan TI jika ada.

---

## 5. Lingkup

### 5.1 MVP (wajib selesai)
| Kode | Fitur |
|---|---|
| F1 | Ketik bebas tujuan + kartu konfirmasi yang bisa diedit |
| F2 | Input profil: tempel teks CV atau unggah PDF (dibaca di browser) |
| F3 | Ekstraksi skill dengan bukti kutipan |
| F4 | Analisis gap + skor kecocokan (AI asesor dengan rubrik, diaudit & dijumlahkan kode) + alasan per kebutuhan + ringkasan mentor + radar chart |
| F5 | Roadmap 4 minggu dengan kotak centang |
| F6 | Simulasi wawancara 5 pertanyaan + penilaian rubrik + saran |
| F7 | Daftar, masuk, keluar, lupa password (kode pemulihan), hapus akun |
| F8 | Riwayat analisis dan percobaan wawancara (pengguna login) |
| F9 | Mode tamu (tanpa akun) dan mode demo persona Rani |
| F10 | Guardrail input di luar konteks dan upaya manipulasi |

### 5.2 Bonus (hanya jika semua MVP sudah stabil)
| Kode | Fitur |
|---|---|
| B1 | Mode eksplorasi: skor & peringkat jalur dari kode (data lowongan); AI menulis usulan mentor dan alasan per jalur, diaudit kode, dengan cadangan alasan template |
| B2 | Roadmap adaptif setelah wawancara |
| B3 | Kotak "Tanya mentor" yang hanya menjawab dari hasil pengguna |
| B4 | Ekspor hasil ke PDF |

### 5.3 Tidak dikerjakan
OAuth/login pihak ketiga, verifikasi email, layanan pengirim email, scraping lowongan real-time, wawancara suara/video, dashboard kampus dan perusahaan, pelacakan jangka panjang dengan pengingat.

---

## 6. Alur pengguna

```
[Mulai] ketik tujuan
   └─> AI pahami tujuan ─> kartu konfirmasi (Ya / Ubah)
         ├─ tidak jelas ─> 1 pertanyaan lanjutan / pilihan tujuan
         ├─ di luar topik / manipulasi ─> pesan penolakan + contoh kalimat
         └─ non-TI ─> pesan fokus TI + tawaran irisan TI
[Profil] tempel CV / unggah PDF ─> redaksi PII di browser ─> AI ekstraksi skill
         └─ bukan CV ─> minta ulang
[Hasil] skor + radar + kekuatan (bukti) + gap (sumber, prioritas) + roadmap
         └─ (login) simpan ke riwayat
[Wawancara] 5 pertanyaan dari gap ─> jawab ─> umpan balik per jawaban ─> ringkasan skor
         └─ (login) simpan percobaan ─> bandingkan dengan percobaan sebelumnya
[Riwayat] daftar analisis + grafik skor wawancara
```

---

## 7. Kebutuhan fungsional

Format: kebutuhan, lalu kriteria penerimaan (KP).

### F1 – Pemahaman tujuan
- FR1.1 Kolom teks bebas (maks 500 karakter) dengan chip contoh kalimat yang bisa diklik.
- FR1.2 Sistem mengubah kalimat menjadi JSON: `kategori`, `tujuan`, `posisi_target`, `tahap`, `kekhawatiran`, `kepercayaan`.
- FR1.3 Kartu konfirmasi menampilkan tujuan, posisi, dan tahap sebagai chip yang bisa diedit.
- FR1.4 Jika `kepercayaan` < 0,6 atau `tujuan = tidak_jelas`, tampilkan satu pertanyaan lanjutan atau pilihan tujuan.
- FR1.5 `kategori` selain `karier_ti` menampilkan pesan template sesuai kategori (lihat 8.4).
- **KP:** kalimat persona Rani menghasilkan Magang · Web Developer · Semester akhir; "resep nasi goreng" menghasilkan pesan penolakan; tidak ada teks bebas dari LLM yang tampil di pesan penolakan.

### F2 – Input profil
- FR2.1 Dua jalur: tempel teks CV, atau unggah PDF yang diekstrak teksnya di browser (pdf.js).
- FR2.2 Formulir singkat untuk yang belum punya CV: jurusan, mata kuliah favorit, proyek, tools, minat.
- FR2.3 Sebelum dikirim, nama, email, nomor telepon, dan alamat dihapus di browser.
- FR2.4 Batas 6.000 karakter; jika PDF gagal dibaca, arahkan ke opsi tempel teks.
- **KP:** teks yang dikirim ke server tidak mengandung email/nomor telepon dari CV uji.

### F3 – Ekstraksi skill
- FR3.1 Hasil: skill teknis, tools, soft skill, proyek, tingkat (dasar/menengah/mahir), dan **kutipan bukti** untuk setiap skill.
- FR3.2 Hanya informasi yang tertulis di CV; skill tanpa bukti tidak boleh muncul.
- FR3.3 Kolom `cv_valid`; teks yang bukan CV diminta diulang.
- **KP:** setiap skill di UI punya "Bukti di CV" yang cocok dengan teks asli.

### F4 – Analisis gap dan skor
- FR4.1 Kebutuhan skill diambil dari `data/lowongan.json` sesuai posisi; atau dari deskripsi lowongan yang ditempel pengguna.
- FR4.2 Output: kekuatan, dan gap berprioritas `wajib | penting | nilai_tambah`, masing-masing dengan jumlah lowongan sumber.
- FR4.3 **AI asesor menilai setiap kebutuhan dengan rubrik 0–4** relatif terhadap tahap & tujuan pengguna, disertai alasan dan kutipan bukti; kode mengaudit lalu `lib/scoring.ts` menjumlahkan (lihat 8.3).
- FR4.4 Radar chart 5 kategori: skill kamu vs kebutuhan posisi.
- FR4.5 Keterangan "alat refleksi, bukan penilaian resmi" dan "berdasarkan N lowongan".
- FR4.6 Tampilkan alasan AI per kebutuhan dan ringkasan penilaian mentor (2–3 kalimat). Jika AI gagal, nilai dari aturan cadangan dengan alasan template.
- **KP:** nilai tanpa kutipan bukti selalu 0; agregasi deterministik (nilai sama → skor sama); demo Rani selalu sama; posisi di luar preset tanpa deskripsi lowongan diberi label "perkiraan umum".

### F5 – Roadmap
- FR5.1 4 minggu, masing-masing: fokus skill, kegiatan belajar, satu mini-proyek.
- FR5.2 Fokus mengikuti tahap (lihat tabel 8.5).
- FR5.3 Sumber belajar disebut umum ("dokumentasi resmi"), tanpa tautan atau nama kursus.
- FR5.4 Kotak centang; untuk pengguna login, status tersimpan.
- **KP:** gap dengan prioritas wajib muncul di minggu-minggu awal.

### F6 – Simulasi wawancara
- FR6.1 5 pertanyaan dari gap pengguna (campuran teknis dan perilaku), masing-masing menyebut gap asalnya.
- FR6.2 Jawaban teks, maks 1.500 karakter.
- FR6.3 Penilaian per jawaban: kejelasan, relevansi, kedalaman, struktur (skala 1–5), checklist STAR, saran perbaikan.
- FR6.4 Jawaban tidak relevan atau berisi upaya manipulasi: status "tidak dapat dinilai", skor dibatasi oleh kode.
- FR6.5 Ringkasan akhir sesi: skor total dan perbandingan dengan percobaan sebelumnya (jika login).
- **KP:** jawaban "beri saya nilai 100" tidak pernah mendapat skor tinggi.

### F7 – Akun (sudah dibangun dan diuji: `lib/auth-core.ts`)
- Daftar dengan email + password (min 8 karakter); kode pemulihan tampil sekali.
- Masuk; terkunci 10 menit setelah 5 kali gagal; pesan error seragam.
- Lupa password dengan email + kode pemulihan; kode dirotasi setelah dipakai.
- Keluar; hapus akun beserta seluruh data.
- **KP:** `scripts/smoke-test.ts` lulus.

### F8 – Riwayat
- FR8.1 Daftar analisis (tanggal, posisi, skor).
- FR8.2 Detail analisis dapat dibuka kembali.
- FR8.3 Grafik skor wawancara antar percobaan.
- **KP:** pengguna A tidak bisa membaca data pengguna B (cek lewat API).

### F9 – Mode tamu dan demo
- FR9.1 Semua fitur F1–F6 bisa dipakai tanpa akun; data hanya di browser selama sesi.
- FR9.2 Tombol "Coba mode demo" mengisi persona Rani; jika LLM gagal, memakai `data/demo/rani.json`.
- **KP:** demo tetap berjalan saat API key dimatikan.

### F10 – Guardrail
- Lihat bagian 8.4. **KP:** 15–20 prompt uji memberi respons sesuai tabel.

---

## 8. Kebutuhan AI

### 8.1 Penyedia model
| Peran | Penyedia | Catatan |
|---|---|---|
| Utama | Gemini Flash (free tier) | ID model disalin dari Google AI Studio ke env `GEMINI_MODEL` |
| Cadangan | Groq, `openai/gpt-oss-120b` | Dipakai saat Gemini 429/gagal validasi; juga untuk respons cepat |
| Terakhir | Cache JSON demo | Hanya untuk mode demo |

Fallback otomatis di `lib/llm.ts`: coba Gemini → jika 429, timeout, atau gagal validasi Zod → Groq → jika gagal → pesan ramah (atau cache demo).

### 8.2 Rantai prompt
| Tahap | Endpoint | Masukan | Keluaran |
|---|---|---|---|
| 1 Pemahaman tujuan | `/api/intent` | kalimat bebas | JSON intent |
| 2 Ekstraksi profil | `/api/profile` | teks CV teredaksi | JSON profil + bukti |
| 3 Analisis gap | `/api/gap` | profil + kebutuhan posisi + tahap/tujuan | nilai rubrik 0–4 + alasan + bukti per kebutuhan, ringkasan mentor (skor diagregasi kode) |
| 4 Roadmap | `/api/roadmap` | gap + tahap | 4 minggu |
| 5 Pertanyaan | `/api/interview/questions` | gap + posisi | 5 pertanyaan |
| 6 Penilaian | `/api/interview/grade` | pertanyaan + jawaban + rubrik | skor per kriteria + saran |

Teknik: structured output dengan skema tetap (Zod), nilai enum terbatas, blok konteks per tujuan (magang menurunkan ekspektasi pengalaman, kerja menekankan proyek nyata), rubrik eksplisit, batasan sumber (tidak menambah fakta di luar masukan), input pengguna dibungkus pembatas sebagai data.

### 8.3 Penilaian & rumus skor (v3: AI asesor + agregasi kode)
Alur lengkap: `docs/penilaian-ai.md`.
- **AI asesor** (`lib/prompts/penilaian.ts`) menilai SETIAP kebutuhan posisi dengan rubrik 0–4, relatif terhadap tahap & tujuan: 0 tidak ada bukti · 1 hanya disebut · 2 kursus/latihan/proyek kecil · 3 dipakai nyata dan **cukup untuk tahapnya** · 4 menonjol. Setiap nilai > 0 wajib menyertakan kutipan bukti, alasan 1 kalimat, plus ringkasan mentor.
- **Audit kode:** nama kebutuhan harus dari daftar; nilai dibatasi 0–4; nilai tanpa kutipan yang ada di profil → 0 (alasan diganti template); kebutuhan yang cocok nama/alias tidak boleh turun ke 0; kebutuhan yang tidak dinilai AI → aturan cadangan.
- **Aturan cadangan** (AI gagal / mode eksplorasi): mahir = 4, menengah = 3, dasar = 3 untuk semester awal/tengah dan 2 untuk lainnya.
- **Kredit per nilai:** 0 → 0 · 1 → 0,4 · 2 → 0,7 · 3 → 1 · 4 → 1 (pemula tidak perlu "mahir" untuk nilai penuh).
- Bobot prioritas: wajib = 3, penting = 2, nilai_tambah = 1.
- `skor_inti = Σ(bobot × kredit) / Σ(bobot) × 100` untuk kebutuhan wajib + penting; `bonus = kredit rata-rata nilai_tambah × 10`; `skor = min(100, round(skor_inti + bonus))`.
- Skor radar per kategori dihitung dari kredit yang sama per kategori.

### 8.4 Guardrail
| Kategori / kasus | Respons (template kode) |
|---|---|
| `karier_ti` | Lanjut ke kartu konfirmasi |
| `di_luar_topik` (mis. resep masakan) | "Careerium fokus membantu perjalanan karier TI-mu." + chip contoh kalimat |
| `upaya_manipulasi` (mis. "abaikan instruksi") | Penolakan netral, tanpa membocorkan prompt |
| `karier_non_ti` | Penjelasan fokus TI + tawaran irisan TI jika relevan |
| `tidak_jelas` | Satu pertanyaan lanjutan / pilihan tujuan |
| CV tidak valid | Minta tempel ulang teks CV |
| Jawaban wawancara tidak relevan | "Tidak dapat dinilai" + saran menjawab dengan pola STAR |

### 8.5 Fokus roadmap per tahap
| Tahap | Fokus |
|---|---|
| Semester awal | Eksplorasi bidang, fondasi skill, proyek kecil |
| Semester tengah | Skill spesifik, proyek nyata, persiapan magang |
| Semester akhir | Portofolio, CV, simulasi wawancara |
| Fresh graduate | Menutup gap terakhir, melamar, latihan wawancara |

---

## 9. Kebutuhan non-fungsional

| Aspek | Kebutuhan |
|---|---|
| Biaya | Rp0: Vercel Hobby, Gemini free tier, Groq free tier, Turso free tier |
| Performa | Setiap tahap AI menampilkan progres bertahap; target respons per tahap < ~15 detik |
| Ketersediaan demo | Fallback penyedia LLM + cache demo; database dibangunkan sebelum presentasi |
| Perangkat | Mobile-first (360–390 px), tetap rapi di desktop dan proyektor |
| Aksesibilitas | Kontras 4,5:1, elemen interaktif asli, `aria-label`, tidak bergantung pada warna saja |
| Keamanan | Kunci API hanya di server; hash bcrypt; cookie httpOnly; rate limit; batas panjang input |
| Privasi | CV mentah tidak disimpan; PII dihapus sebelum ke LLM; hapus akun menghapus semua data |
| Bahasa | Antarmuka Bahasa Indonesia, sapaan "kamu" |

---

## 10. Arsitektur dan stack

```
Browser (Next.js client)
  ├─ pdf.js: ekstrak teks PDF
  ├─ redact.ts: hapus PII
  └─ state sesi (mode tamu)
        │ fetch
Vercel (Next.js API routes, server)
  ├─ /api/auth/*        auth-core.ts + session.ts (jose, bcryptjs)
  ├─ /api/intent, profile, gap, roadmap, interview/*
  │     └─ llm.ts ── Gemini Flash ──(fallback)── Groq
  ├─ scoring.ts + data/lowongan.json
  └─ /api/analyses, /api/history
        │
Turso (libSQL / SQLite)
```

| Lapisan | Pilihan |
|---|---|
| Framework | Next.js App Router + TypeScript |
| UI | Tailwind CSS + shadcn/ui + Lucide + Recharts |
| AI | Vercel AI SDK (`generateObject`) + Zod, `@ai-sdk/google`, `@ai-sdk/groq` |
| Database | Turso via `@libsql/client` (lokal: `file:local.db`) |
| Auth | Email + password buatan sendiri (`bcryptjs`, `jose`) |
| Hosting | Vercel Hobby |

---

## 11. Model data

Skema lengkap: `db/schema.sql` (sudah dibuat).

| Tabel | Kolom utama | Keterangan |
|---|---|---|
| `users` | id, email, password_hash, recovery_hash, created_at | Email dinormalisasi, unik |
| `login_attempts` | email, success, created_at | Pembatasan percobaan |
| `analyses` | id, user_id, target_posisi, tahap, skor, skill_json, gap_json, created_at | Hasil terstruktur, tanpa CV mentah |
| `roadmap_items` | analysis_id, minggu, isi_json, selesai | Status centang |
| `interview_attempts` | analysis_id, percobaan_ke, skor_total, skor_detail_json, created_at | Dasar grafik kemajuan |

---

## 12. Kontrak API

Semua body JSON. Error: `{ "error": string }` dengan status HTTP sesuai. Skema Zod lengkap ada di `lib/schemas.ts` dan menjadi **kontrak bersama** antara backend dan frontend.

| Method & path | Body | Respons sukses | Login? |
|---|---|---|---|
| POST `/api/auth/register` | `{email, password}` | `{ok, recoveryCode}` | – |
| POST `/api/auth/login` | `{email, password}` | `{ok}` | – |
| POST `/api/auth/reset` | `{email, recoveryCode, newPassword}` | `{ok, recoveryCode}` | – |
| POST `/api/auth/logout` | – | `{ok}` | – |
| POST `/api/auth/delete` | – | `{ok}` | Ya |
| GET `/api/auth/me` | – | `{email}` atau 401 | – |
| POST `/api/intent` | `{text}` | `Intent` | – |
| POST `/api/profile` | `{cvText}` (teredaksi) | `Profile` | – |
| POST `/api/gap` | `{profile, posisi, tahap, tujuan?, jobDescription?}` | `GapResult` (termasuk `skor`, `radar`, `sumberLowongan`, `penilaian[]`, `ringkasan_ai`, `metode_skor`) | – |
| POST `/api/roadmap` | `{gap, tahap}` | `Roadmap` | – |
| POST `/api/interview/questions` | `{gap, posisi}` | `{questions: Question[5]}` | – |
| POST `/api/interview/grade` | `{question, answer}` | `Grade` | – |
| POST `/api/analyses` | `{intent, profileSummary, gap, roadmap}` | `{id}` | Ya |
| GET `/api/analyses` | – | `AnalysisSummary[]` | Ya |
| GET `/api/analyses/[id]` | – | `AnalysisDetail` | Ya (pemilik) |
| PATCH `/api/analyses/[id]/roadmap/[itemId]` | `{selesai}` | `{ok}` | Ya (pemilik) |
| POST `/api/analyses/[id]/interviews` | `{skorTotal, skorDetail}` | `{percobaanKe}` | Ya (pemilik) |

---

## 13. Desain UI/UX

- Sumber kebenaran gaya: **`DESIGN.md`**. Statusnya BELUM DIKUNCI; gaya ditentukan di awal hari H (lihat Fase 0).
- Acuan alur dan isi layar: kanvas mockup "Careerium – Mockup UI" (Mulai, Hasil, Wawancara).
- Layar: Mulai, Profil, Hasil, Wawancara, Riwayat, Masuk/Daftar/Lupa password.
- Prinsip tetap: gap tidak berwarna merah, mobile-first, satu aksi utama per layar, transparansi AI (bukti & sumber), loading bertahap, error yang menolong.
- Skill desain dipakai sesuai tabel peran di `CLAUDE.md`, hanya saat diminta.

---

## 14. Dataset kebutuhan skill (`data/lowongan.json`)

- Dikurasi manual **sebelum hari H**: 30–50 lowongan untuk posisi preset (prioritas: Web Developer, Data Analyst, UI/UX Designer, Mobile Developer).
- Yang disimpan: agregat kebutuhan skill per posisi, bukan salinan teks lowongan.
- Struktur per posisi: nama posisi, jumlah lowongan, daftar skill `{nama, kategori_radar, jumlah_muncul, prioritas}`, sumber (nama situs + tanggal akses).
- Prioritas: muncul ≥ 60% lowongan = wajib, 30–59% = penting, < 30% = nilai_tambah (bisa disesuaikan).

---

## 15. Etika, privasi, dan batasan

- **Bukan penentu kelayakan.** Skor adalah alat refleksi.
- **Privasi.** CV mentah tidak disimpan; PII dihapus sebelum ke LLM. Untuk akun, yang disimpan: email, hash password, hash kode pemulihan, hasil terstruktur. Free tier Gemini dapat memakai data untuk peningkatan produk Google, karena itu redaksi PII wajib.
- **Transparansi.** Kartu konfirmasi bisa dikoreksi; bukti dan sumber selalu ditampilkan.
- **Anti-halusinasi.** AI dibatasi pada masukan; tidak menyebut gaji, tautan kursus, atau lowongan nyata.
- **Bias.** Penilaian berdasarkan skill dan bukti, bukan nama, gender, kampus, atau latar belakang. Bukti uji: dua CV identik dengan nama/gender berbeda menghasilkan skor sama.
- **Batasan.** Careerium bukan pengganti konselor karier profesional. Email tidak diverifikasi.

---

## 16. Risiko dan mitigasi

| Risiko | Mitigasi |
|---|---|
| Rate limit / API LLM gagal | Fallback Gemini → Groq, retry + backoff, cache demo |
| Kuota habis oleh percobaan berulang | Batas panjang input dan jumlah panggilan per sesi |
| Halusinasi skill | JSON + bukti kutipan wajib; validasi Zod |
| Skor tidak konsisten | AI hanya memberi nilai rubrik 0–4 berbukti (temperature 0); kode mengaudit dan menjumlahkan dengan bobot tetap; demo Rani memakai hasil tersimpan |
| Prompt injection lewat CV/jawaban | Input dibungkus sebagai data; pesan penolakan dari template kode |
| PDF berantakan | Opsi tempel teks |
| Input tak terduga dari juri | Kartu konfirmasi + guardrail + pertanyaan lanjutan |
| Gaya desain berubah di tengah jalan | DESIGN.md dikunci di Fase 0 |
| Kehabisan waktu | Bonus hanya setelah checkpoint MVP hijau; feature freeze dan code freeze |
| Database tidak merespons saat demo | Bangunkan dengan satu permintaan sebelum presentasi |
| Kunci API bocor | Hanya di env server, tanpa `NEXT_PUBLIC_`; `.env*` di `.gitignore` |

---

## 17. Aturan pengembangan

### 17.1 Aturan commit (WAJIB)
- **Agen AI tidak boleh menjalankan `git commit`, `git push`, `git merge`, `git rebase`, atau perintah git lain yang mengubah riwayat.** Semua commit dilakukan **manual** oleh pengembang.
- Agen boleh menjalankan perintah baca saja: `git status`, `git diff`, `git log`.
- Setiap kali sebuah perubahan selesai dan layak di-commit, agen **memberikan** (tidak menjalankan):
  1. Ringkasan perubahan dan daftar file yang berubah.
  2. Perintah commit yang siap disalin, menyebut file secara spesifik (bukan `git add .`).
  3. Pesan commit yang sesuai format di bawah.
- Format yang diberikan agen:
  ```bash
  git status
  git add lib/llm.ts lib/schemas.ts
  git commit -m "feat(ai): tambah fallback Gemini ke Groq di llm.ts"
  ```
- Jangan pernah meng-commit `.env`, `.env.local`, `local.db`, atau file berisi kunci API.

### 17.2 Format pesan commit (Conventional Commits, deskripsi Bahasa Indonesia)
`<tipe>(<lingkup>): <deskripsi singkat, kalimat perintah, maks ~72 karakter>`

| Tipe | Dipakai untuk |
|---|---|
| `feat` | Fitur baru |
| `fix` | Perbaikan bug |
| `refactor` | Perubahan struktur tanpa mengubah perilaku |
| `style` | Tampilan/CSS tanpa mengubah logika |
| `docs` | Dokumentasi (PRD, README, DESIGN.md) |
| `test` | Pengujian |
| `chore` | Konfigurasi, dependensi, skrip |

Lingkup yang dipakai: `api`, `ai`, `auth`, `db`, `ui`, `hasil`, `wawancara`, `riwayat`, `design`, `data`, `config`.

### 17.3 Branch
- `main` selalu bisa di-deploy (terhubung ke Vercel).
- Kerja di `be/<fitur>` dan `fe/<fitur>`; gabungkan ke `main` di setiap checkpoint (manual).
- Jika tim sangat kecil dan waktu sempit, boleh langsung ke `main` dengan commit kecil-kecil, asalkan deploy dicek setiap checkpoint.

### 17.4 Aturan lain
- Satu tugas = satu perubahan yang bisa diuji = satu commit.
- Frontend memakai **data mock sesuai `lib/schemas.ts`** sampai endpoint backend siap, sehingga kedua track tidak saling menunggu.
- Perubahan kontrak API (`lib/schemas.ts`) harus diberitahukan ke track lain sebelum di-commit.
- Detail teknis lain mengikuti `CLAUDE.md`.

---

## 18. Rencana pengerjaan 24 jam

> Jam bersifat **indikatif** dan bisa digeser sesuai jadwal lomba. Yang penting adalah **urutan** dan **checkpoint**.
> Rencana ini mengasumsikan minimal 2 orang (1 Backend, 1 Frontend). Jika sendirian, kerjakan per fase: Backend dulu, lalu Frontend, dan lewati bonus.

### Ringkasan
| Fase | Jam (indikatif) | Backend | Frontend | Checkpoint |
|---|---|---|---|---|
| 0 Kickoff & fondasi | 09.00 – 10.00 | Repo, env, Turso, migrasi | Kunci DESIGN.md, token, layout | Hello world ter-deploy, kontrak API disepakati |
| 1 Inti AI tahap 1–2 | 10.00 – 13.00 | llm.ts, intent, profile, redaksi, limits | Layar Mulai, kartu konfirmasi, input CV (mock) | **C1** 13.00 |
| Istirahat | 13.00 – 13.45 | | | |
| 2 Gap, skor, roadmap | 13.45 – 17.30 | lowongan.json, scoring, gap, roadmap | Layar Hasil (skor, radar, daftar, roadmap) | **C2** 17.30 |
| Istirahat | 17.30 – 18.30 | | | |
| 3 Wawancara, akun, riwayat | 18.30 – 22.00 | Pertanyaan, penilaian, API analyses/riwayat | Layar Wawancara, Masuk/Daftar, Riwayat | **C3** 22.00 |
| 4 Penguatan | 22.00 – 01.00 | Guardrail, rate limit, cache demo, error | Loading, error, mode tamu/demo, polish mobile | **C4** 01.00 |
| Istirahat bergantian | 01.00 – 04.00 | | | |
| 5 Uji & bonus | 04.00 – 06.30 | Uji prompt, bug fix, bonus | Audit desain, bug fix, bonus | **Feature freeze** 06.30 |
| 6 Finalisasi | 06.30 – 08.00 | Deploy final, cek env & DB | Video cadangan, slide, screenshot | **Code freeze** 08.00 |
| 7 Submit & pitch | 08.00 – 09.00 | Submit, latihan pitch, buffer | | Selesai |

### Fase 0 – Kickoff dan fondasi (09.00 – 10.00)
**Bersama**
1. Baca ulang PRD, CLAUDE.md, DESIGN.md (10 menit).
2. Sepakati `lib/schemas.ts` versi awal: Intent, Profile, GapResult, Roadmap, Question, Grade.

**Backend**
1. `create-next-app` (TypeScript, Tailwind, App Router), pasang dependensi.
2. Salin file auth yang sudah ada, `db/schema.sql`, skrip migrasi dan smoke test.
3. Buat database Turso, isi env lokal dan di Vercel, jalankan migrasi dan smoke test.
4. Hubungkan repo ke Vercel, deploy pertama.

**Frontend**
1. Tentukan gaya bersama skill pengarah, isi dan **kunci DESIGN.md**.
2. Pasang shadcn/ui, terapkan token ke `globals.css` dan tema.
3. Layout dasar: header, container mobile, font.

**Selesai jika:** URL Vercel aktif, smoke test lulus, DESIGN.md DIKUNCI, schemas.ts disepakati.
Contoh commit: `chore(config): inisialisasi Next.js, Tailwind, dan shadcn/ui` · `feat(db): tambah skema SQLite dan skrip migrasi` · `docs(design): kunci DESIGN.md`

### Fase 1 – Inti AI tahap 1–2 (10.00 – 13.00)
**Backend**
1. `lib/llm.ts`: fungsi `askJSON(schema, prompt)` dengan fallback Gemini → Groq, retry + backoff.
2. `lib/limits.ts`: batas panjang input dan panggilan per sesi.
3. Prompt + endpoint `/api/intent` dengan kategori guardrail.
4. Prompt + endpoint `/api/profile` dengan `cv_valid` dan bukti kutipan.
5. Uji manual dengan kalimat Rani dan CV dummy.

**Frontend**
1. Layar Mulai: kolom tujuan, chip contoh, penanda langkah.
2. Kartu konfirmasi dengan chip yang bisa diedit (data mock).
3. Layar Profil: tempel teks + unggah PDF (pdf.js) + formulir singkat.
4. `lib/redact.ts` di sisi klien.
5. Pesan penolakan dan pertanyaan lanjutan (template).

**C1 (13.00):** dari layar Mulai sampai profil terekstrak berjalan dengan API asli di lokal.
Contoh commit: `feat(ai): tambah fallback Gemini ke Groq di llm.ts` · `feat(api): tambah endpoint intent dengan guardrail kategori` · `feat(ui): tambah layar Mulai dan kartu konfirmasi`

### Fase 2 – Gap, skor, roadmap (13.45 – 17.30)
**Backend**
1. Masukkan `data/lowongan.json` (sudah dikurasi sebelum hari H).
2. `lib/scoring.ts` sesuai rumus 8.3 + skor radar per kategori.
3. Endpoint `/api/gap` (AI asesor menilai tiap kebutuhan dengan rubrik, kode mengaudit dan menghitung skor).
4. Endpoint `/api/roadmap` dengan blok konteks per tahap.

**Frontend**
1. Layar Hasil: cincin skor + keterangan, radar chart (Recharts).
2. Daftar Kekuatan dengan "Bukti di CV", daftar Perlu ditingkatkan dengan sumber dan lencana prioritas.
3. Roadmap 4 minggu dengan kotak centang.
4. Loading bertahap (skeleton + teks tahap).
5. Hubungkan ke endpoint asli.

**C2 (17.30):** alur Mulai → Hasil berjalan **di URL Vercel**.
Contoh commit: `feat(data): tambah dataset kebutuhan skill per posisi` · `feat(api): hitung skor kecocokan di scoring.ts` · `feat(hasil): tampilkan skor, radar, dan daftar gap`

### Fase 3 – Wawancara, akun, riwayat (18.30 – 22.00)
**Backend**
1. Endpoint `/api/interview/questions` (5 pertanyaan dari gap).
2. Endpoint `/api/interview/grade` (rubrik + `relevan` + batas skor oleh kode).
3. Endpoint `/api/auth/me`, `/api/analyses` (simpan, daftar, detail), roadmap PATCH, percobaan wawancara.
4. Cek kepemilikan data di setiap endpoint.

**Frontend**
1. Layar Wawancara: progres n/5, gelembung chat, input, kartu umpan balik, ringkasan.
2. Layar Masuk, Daftar (tampilkan kode pemulihan + tombol salin), Lupa password.
3. Layar Riwayat: daftar analisis + grafik skor wawancara.
4. Tombol simpan hasil untuk pengguna login.

**C3 (22.00):** alur lengkap end-to-end (termasuk login dan riwayat) berjalan di URL Vercel. **Ini batas MVP.**
Contoh commit: `feat(api): tambah pembuatan dan penilaian pertanyaan wawancara` · `feat(wawancara): tambah layar latihan wawancara` · `feat(riwayat): tampilkan riwayat analisis dan grafik skor`

### Fase 4 – Penguatan (22.00 – 01.00)
**Backend**
1. Jalankan 15–20 prompt uji (sesuai topik, di luar topik, manipulasi, bukan CV, jawaban ngawur); perbaiki prompt.
2. Siapkan `data/demo/rani.json` dari hasil asli.
3. Rapikan penanganan error dan timeout.

**Frontend**
1. Mode tamu dan tombol mode demo.
2. Semua status loading, kosong, dan error.
3. Uji di ukuran ponsel; perbaiki tata letak.
4. `/impeccable audit` lalu perbaiki temuan prioritas tinggi.

**C4 (01.00):** demo persona Rani lancar tiga kali berturut-turut tanpa error.
Contoh commit: `fix(ai): perketat prompt untuk input di luar topik` · `feat(ui): tambah mode demo persona Rani` · `style(ui): perbaiki tata letak mobile layar Hasil`

### Istirahat bergantian (01.00 – 04.00)
Tidur 1,5–2 jam secara bergantian. Satu orang tetap memantau dan mengerjakan tugas ringan (README, catatan pitch).

### Fase 5 – Uji dan bonus (04.00 – 06.30)
1. Uji cepat dengan 3–5 orang (jika memungkinkan) untuk indikator di bagian 3.
2. Perbaiki bug yang ditemukan.
3. **Hanya jika semua checkpoint hijau**, kerjakan bonus berurutan: B2 roadmap adaptif → B1 mode eksplorasi → B4 ekspor PDF → B3 Tanya mentor.
4. `/impeccable polish` pada layar utama.

**Feature freeze 06.30:** tidak ada fitur baru setelah ini, hanya perbaikan bug.

### Fase 6 – Finalisasi (06.30 – 08.00)
1. Deploy final, cek semua env di Vercel, bangunkan database.
2. Uji ulang alur lengkap di ponsel dan laptop.
3. Rekam video demo cadangan (jaga-jaga jika internet bermasalah).
4. Ambil screenshot untuk slide; lengkapi README (cara menjalankan, stack, fitur).
5. Siapkan slide: masalah, solusi, demo, implementasi AI, etika, dampak, rencana lanjutan.

**Code freeze 08.00.**

### Fase 7 – Submit dan pitch (08.00 – 09.00)
1. Submit repo, URL, video, dan dokumen sesuai ketentuan lomba.
2. Latihan pitch 2–3 kali dengan alur demo yang sama.
3. Sisa waktu sebagai buffer.

### Prioritas jika waktu mepet (yang dipotong lebih dulu)
1. Semua bonus.
2. Grafik riwayat (cukup daftar).
3. Unggah PDF (cukup tempel teks).
4. Formulir tanpa CV.
5. Lupa password (fitur tetap di backend, UI disederhanakan).

**Tidak boleh dipotong:** Mulai + konfirmasi, ekstraksi + bukti, gap + skor, roadmap, wawancara + penilaian, guardrail, mode demo.

---

## 19. Persiapan sebelum hari H
- [ ] Akun dan API key: Google AI Studio, Groq, Turso, Vercel, GitHub.
- [ ] Catat ID model Gemini yang tersedia di AI Studio.
- [ ] Kurasi `data/lowongan.json` (30–50 lowongan, minimal 4 posisi).
- [ ] CV dummy persona Rani + 2 CV uji bias (identik, nama/gender berbeda).
- [ ] Daftar 15–20 prompt uji beserta respons yang diharapkan.
- [ ] Referensi gaya desain (jika ada) untuk Fase 0.
- [ ] Pasang skill sesuai CLAUDE.md di level proyek; baca SKILL.md sebelum memasang.
- [ ] Coba deploy Next.js kosong ke Vercel untuk memastikan alurnya lancar.

---

## 20. Checklist demo dan pitch
- [ ] Alur demo: Rani ketik tujuan → konfirmasi → tempel CV → hasil (tunjukkan bukti dan sumber) → wawancara 1–2 pertanyaan → riwayat (bandingkan percobaan).
- [ ] Momen "juri mencoba sendiri": siapkan contoh input di luar topik untuk menunjukkan guardrail.
- [ ] Slide pengujian ketahanan (hasil prompt uji) dan uji bias.
- [ ] Angka indikator dampak dari uji cepat.
- [ ] Peta ke kriteria penilaian lomba.
- [ ] Rencana pengembangan: kelompok pengguna lain lewat blok konteks baru, dashboard kampus, wawancara suara, integrasi data lowongan terverifikasi.

---

## 21. Hal yang belum diputuskan
| Hal | Kapan diputuskan |
|---|---|
| Gaya visual (DESIGN.md) | Fase 0 hari H, atau sebelumnya jika referensi sudah ada |
| Nama hackathon, tema, dan kriteria resmi | Sebelum hari H; sesuaikan bagian 3 dan 20 |
| Jumlah anggota tim dan pembagian peran | Sebelum hari H |
| Bobot rumus skor final | Setelah dataset lowongan selesai dikurasi |
| Jadwal lomba yang sebenarnya | Geser jam di bagian 18, pertahankan urutan |
