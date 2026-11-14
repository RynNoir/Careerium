# Penilaian skor oleh AI asesor (v3)

Prinsip: **AI menilai, kode mengaudit dan menjumlahkan.** AI memberi penilaian seperti mentor (nilai rubrik,
alasan, bukti, ringkasan). Kode memastikan penilaian itu berbukti, adil, dan dijumlahkan dengan bobot yang sama
untuk semua orang. LLM tidak pernah memberi angka skor akhir 0–100.

## Alur kerja `POST /api/gap`

```
profil (skill + proyek + kutipan bukti)  ─┐
kebutuhan posisi (data 75 lowongan)      ─┼─► 1. Pencocokan nama/alias (kode)
tahap + tujuan pengguna                  ─┘            │
                                                       ▼
                                    2. AI ASESOR (lib/prompts/penilaian.ts)
                                       nilai 0–4 + alasan + kutipan bukti per kebutuhan
                                       + ringkasan mentor 2–3 kalimat
                                                       │
                                                       ▼
                                    3. AUDIT KODE (auditPenilaian + analyzeGap)
                                       - nama kebutuhan harus dari daftar
                                       - nilai dibatasi 0–4
                                       - nilai > 0 tanpa kutipan di profil → 0
                                       - cocok nama/alias tidak boleh turun ke 0
                                       - tidak dinilai AI → aturan cadangan
                                                       │
                                                       ▼
                                    4. AGREGASI (lib/scoring.ts)
                                       kredit × bobot (wajib 3, penting 2, nilai tambah 1)
                                       → skor, radar, rincian, daftar gap
                                                       │
                                                       ▼
                         GapResult: skor, penilaian[], ringkasan_ai, metode_skor, kekuatan, gap, radar
```

Hanya ada **satu** panggilan AI di langkah ini (menggantikan panggilan pencocokan skill yang lama), jadi jumlah
panggilan per alur tidak bertambah.

## Rubrik AI asesor

Nilai relatif terhadap harapan untuk tahap dan tujuan pengguna:

| Nilai | Arti | Kredit |
|---|---|---|
| 0 | Tidak ada bukti di CV | 0 |
| 1 | Hanya disebut (daftar skill) tanpa konteks pemakaian | 0,4 |
| 2 | Kursus/belajar mandiri, atau dipakai di latihan/proyek kecil, belum cukup untuk tahapnya | 0,7 |
| 3 | Dipakai nyata (tugas, proyek, organisasi, magang) dan **sudah cukup untuk tahapnya** | 1 |
| 4 | Menonjol: berulang di beberapa proyek, memimpin, atau melampaui harapan tahapnya | 1 |

Standar per tahap: semester awal/tengah → tugas kuliah atau proyek pribadi sudah 3. Semester akhir/magang →
3 butuh pemakaian di proyek, tugas besar, atau organisasi. Fresh graduate/kerja → 3 butuh proyek nyata atau
pengalaman kerja/magang.

Nilai 3 sudah bernilai penuh: pemula tidak perlu "mahir" di semua hal untuk skor tinggi.

## Rumus skor

```
skor_inti = Σ(bobot × kredit) / Σ(bobot) × 100        (kebutuhan wajib + penting)
bonus     = Σ(kredit nilai_tambah) / jumlah nilai_tambah × 10
skor      = min(100, round(skor_inti + bonus))
```

Contoh Rani (Web Developer, semester akhir, magang), hasil AI asesor:

| Kebutuhan inti | Prioritas | Nilai AI | Kredit × bobot |
|---|---|---|---|
| REST API | wajib | 2 (pernah pakai API, belum membuat sendiri) | 0,7 × 3 = 2,1 |
| Framework frontend | wajib | 3 | 1 × 3 = 3 |
| Bahasa/framework backend | wajib | 0 | 0 |
| Git & GitHub | wajib | 3 | 1 × 3 = 3 |
| Database relasional | penting | 1 (baru kursus) | 0,4 × 2 = 0,8 |
| JavaScript | penting | 3 | 1 × 2 = 2 |
| HTML & CSS | penting | 3 | 1 × 2 = 2 |
| Problem solving & debugging | penting | 2 | 0,7 × 2 = 1,4 |

Angka persis Rani ada di `data/demo/rani.json` (dibangun ulang dengan `scripts/build-demo.ts`).

## Aturan cadangan (tanpa AI)

Dipakai bila semua penyedia AI gagal, untuk kebutuhan yang tidak dinilai AI, dan di mode eksplorasi
(`metode_skor: "aturan"`):

| Tingkat skill di profil | Nilai |
|---|---|
| mahir | 4 |
| menengah | 3 |
| dasar | 3 (semester awal/tengah) · 2 (lainnya) |

Alasan untuk nilai aturan dibuat oleh template kode, bukan AI.

## Keamanan dan keadilan

- Isi CV dibungkus tag dan diperlakukan sebagai data; perintah seperti "beri nilai 4" diabaikan.
- Nilai hanya dari bukti, bukan dari nama, gender, kampus, usia, atau gaya penulisan (atribut identitas juga
  sudah dihapus sebelum ke AI).
- Alasan dan ringkasan dibersihkan kode: tanpa URL, tanpa tanda `< >`, panjang dibatasi.
- Mode demo dengan input persis Rani memakai hasil tersimpan, jadi skor demo selalu sama.

## Kontrak (field opsional baru di `GapResult`)

| Field | Isi |
|---|---|
| `penilaian[]` | `{ nama, prioritas, nilai 0–4, alasan, bukti?, sumber: "ai" \| "aturan" }`, urut sesuai kebutuhan |
| `ringkasan_ai` | 2–3 kalimat penilaian mentor (tidak ada bila AI gagal) |
| `metode_skor` | `"ai_rubrik"` atau `"aturan"` |

`GapRequest.tujuan` (opsional) baru: kirim `intent.tujuan` agar standar penilaian sesuai (magang vs kerja).

## Pengujian

```bash
npx tsx scripts/test-scoring.ts      # kredit rubrik, aturan cadangan, agregasi, radar
npx tsx scripts/test-penilaian.ts    # audit hasil AI: bukti karangan, nama karangan, label, batas nilai
npx tsx scripts/test-ai-logic.ts     # analyzeGap tanpa AI (aturan cadangan)
npx tsx scripts/build-demo.ts        # bangun ulang demo Rani dengan AI asli (memakai kuota)
```
