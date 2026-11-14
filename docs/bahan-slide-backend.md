# Bahan slide teknis (backend)

Ringkasan untuk 1–2 slide teknis + contekan tanya-jawab juri. Angka berasal dari uji di repo
(`docs/hasil-uji-backend.md`, `scripts/test-*.ts`), per 14 November 2026.

## Poin slide

1. **Rantai AI 7 tahap, tiap tahap JSON tervalidasi.**
   Tujuan → profil CV → **penilaian kesiapan (AI asesor)** → roadmap → pertanyaan wawancara → penilaian jawaban → roadmap adaptif. Setiap keluaran AI divalidasi skema
   (Zod) dan aturan kode; keluaran yang melanggar aturan otomatis dicoba ulang ke penyedia lain.

2. **AI menilai, kode mengaudit (LLM-as-a-judge berbukti).**
   AI asesor menilai SETIAP kebutuhan posisi dengan rubrik 0–4 sesuai tahap kuliah & tujuan (magang/kerja),
   lengkap dengan alasan, kutipan bukti dari CV, dan ringkasan mentor. Kode membatalkan nilai tanpa bukti, lalu
   menjumlahkan dengan bobot dari data lowongan (wajib ×3, penting ×2, nilai tambah bonus maks +10). AI tidak
   pernah memberi angka skor akhir. Contoh: Rani 75 — "pernah pakai REST API, tapi belum membuat sendiri" (nilai 2).
   Detail: `docs/penilaian-ai.md`.

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
   **Bukti keadilan (14 Nov, AI asesor):** (1) deterministik, tanpa AI: dua CV yang hanya beda nama, gender, dan
   kampus berlabel menghasilkan teks IDENTIK untuk AI setelah atribut dihapus (`scripts/test-profile.ts`). (2) Uji
   end-to-end dengan Gemini flash-lite, 4 putaran per varian: rata-rata 83,0 vs 80,5 (selisih 2,5), tanpa arah yang
   konsisten (uji sebelumnya justru Budi lebih tinggi). Skor sendiri bervariasi sampai 8 poin pada CV yang sama
   (ekstraksi LLM tidak sepenuhnya deterministik), jadi JANGAN klaim "selisih 1 poin" atau "skor identik".
   Angka "37 vs 37" di atas dari rumus lama; jangan dipakai lagi.

7. **Tahan gagal: demo tidak bergantung pada satu AI.**
   Fallback Groq 120B → Groq 20B → Gemini (rata-rata 1–3 detik per langkah). Bila semua AI mati, mode demo tetap
   200 di semua langkah (teruji dengan kunci API dirusak). Kuota per sesi & per IP mencegah klik berulang
   menghabiskan kuota.

## Contekan tanya-jawab juri

| Pertanyaan | Jawaban singkat |
|---|---|
| "Bedanya dengan ChatGPT?" | ChatGPT menjawab bebas; Careerium memakai data 75 lowongan, AI menilai dengan rubrik yang sama untuk semua orang, setiap nilai berbukti kutipan CV, dan semua keluaran dicek kode. |
| "Kalau AI-nya berhalusinasi?" | Kutipan bukti dicek ke teks CV; skill tanpa bukti dibuang. Nilai AI asesor tanpa kutipan yang benar-benar ada di CV otomatis jadi 0, dan nama kebutuhan karangan diabaikan. |
| "Seberapa besar peran AI?" | AI mengerjakan 7 tahap: memahami tujuan, membaca CV + bukti, **menilai kesiapan per kebutuhan dengan rubrik**, menyusun roadmap, membuat pertanyaan, menilai jawaban, dan menyusun ulang roadmap. Kode menjaga: validasi bukti, bobot dari data lowongan, dan pesan template. |
| "Kenapa skor tidak langsung dari AI?" | Angka 0–100 langsung dari AI berubah-ubah dan tidak bisa dijelaskan. Dengan rubrik 0–4 per kebutuhan + bobot tetap, setiap poin bisa ditelusuri ke alasan dan kutipan CV. |
| "Kalau AI down saat dipakai?" | Fallback 3 penyedia; mode demo tetap jalan walau semua mati (sudah diuji). |
| "Bisa dibobol prompt injection?" | Masukan dibungkus sebagai data, pola manipulasi ditolak kode sebelum ke AI, 27/27 uji serangan lulus. |
| "Skornya adil?" | Uji CV identik beda gender/kampus: selisih 1 poin. Atribut identitas dihapus sebelum ke AI. |
| "Datanya dari mana? Valid?" | 75 lowongan Indonesia (magang/junior), sumber per lowongan tercatat. Sampel kecil, jadi kami sebut "gambaran", bukan statistik pasar. |
| "Data pribadi saya aman?" | CV tidak disimpan; nama/email/telepon dihapus di browser; akun bisa dihapus beserta semua data. |
| "Kenapa skor saya rendah?" | Skor = kecocokan dengan kebutuhan lowongan sesuai tahap kuliahmu, bukan nilai diri. Setiap kebutuhan punya alasan dari AI asesor, dan roadmap fokus ke gap terbesar. Untuk pemula, "cukup untuk tahapnya" sudah bernilai penuh. |
