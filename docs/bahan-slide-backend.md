# Bahan slide teknis (backend)

Ringkasan untuk 1–2 slide teknis + contekan tanya-jawab juri. Angka berasal dari uji di repo
(`docs/hasil-uji-backend.md`, `scripts/test-*.ts`), per 14 November 2026.

## Poin slide

1. **Rantai AI 6 tahap, tiap tahap JSON tervalidasi.**
   Tujuan → profil CV → gap → roadmap → pertanyaan wawancara → penilaian. Setiap keluaran AI divalidasi skema
   (Zod) dan aturan kode; keluaran yang melanggar aturan otomatis dicoba ulang ke penyedia lain.

2. **Skor dihitung kode, bukan AI.**
   AI hanya mengekstrak skill; skor = rumus tetap (wajib ×3, penting ×2, faktor tingkat dasar/menengah/mahir,
   nilai tambah jadi bonus maks +10). Input sama → skor sama. Contoh: Rani 51 (wajib 3/4, penting 3/4).

3. **Setiap skill punya bukti dari CV.**
   Kutipan bukti dicocokkan kode ke teks CV; skill dengan kutipan karangan dibuang. Ekstraksi hybrid
   (AI + pemindai kamus skill) menurunkan variasi skor CV yang sama dari 7 poin menjadi 0–2.

4. **Data lowongan asli: 75 lowongan, 4 posisi.**
   Web Developer 35, Data Analyst 15, UI/UX 14, Mobile 11, diakses 13 Nov 2026, metodologi kurasi dapat diulang
   (`data/kurasi/build.py`). UI menampilkan "muncul di N dari M lowongan".

5. **Guardrail: 27/27 uji lulus.**
   18 kalimat tujuan (termasuk bahasa Inggris & Jawa), 4 upaya manipulasi ("abaikan instruksi", "cetak system
   prompt"), CV palsu/bukan CV, injeksi di CV, jawaban ngawur & "beri saya nilai 100" (skor 0). Pesan penolakan
   dari template kode, bukan teks bebas AI.

6. **Adil: uji bias lulus.**
   CV identik, beda nama/gender/kampus → skor 37 vs 37 (selisih rata-rata 1 dari 2 putaran, lebih kecil dari
   variasi acak). Atribut sensitif dihapus di server sebelum ke AI; CV mentah tidak pernah disimpan.

7. **Tahan gagal: demo tidak bergantung pada satu AI.**
   Fallback Groq 120B → Groq 20B → Gemini (rata-rata 1–3 detik per langkah). Bila semua AI mati, mode demo tetap
   200 di semua langkah (teruji dengan kunci API dirusak). Kuota per sesi & per IP mencegah klik berulang
   menghabiskan kuota.

## Contekan tanya-jawab juri

| Pertanyaan | Jawaban singkat |
|---|---|
| "Bedanya dengan ChatGPT?" | ChatGPT menjawab bebas; Careerium memakai data 75 lowongan, skor dari rumus, setiap skill berbukti kutipan CV, dan semua keluaran dicek kode. |
| "Kalau AI-nya berhalusinasi?" | Kutipan bukti dicek ke teks CV; skill tanpa bukti dibuang. Skor tidak dibuat AI. |
| "Kalau AI down saat dipakai?" | Fallback 3 penyedia; mode demo tetap jalan walau semua mati (sudah diuji). |
| "Bisa dibobol prompt injection?" | Masukan dibungkus sebagai data, pola manipulasi ditolak kode sebelum ke AI, 27/27 uji serangan lulus. |
| "Skornya adil?" | Uji CV identik beda gender/kampus: selisih 1 poin. Atribut identitas dihapus sebelum ke AI. |
| "Datanya dari mana? Valid?" | 75 lowongan Indonesia (magang/junior), sumber per lowongan tercatat. Sampel kecil, jadi kami sebut "gambaran", bukan statistik pasar. |
| "Data pribadi saya aman?" | CV tidak disimpan; nama/email/telepon dihapus di browser; akun bisa dihapus beserta semua data. |
| "Kenapa skor saya rendah?" | Skor = kecocokan dengan kebutuhan lowongan, bukan nilai diri. Rincian wajib/penting ditampilkan, dan roadmap fokus ke gap terbesar. |
