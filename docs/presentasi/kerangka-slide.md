# Kerangka slide & naskah demo — Careerium

Bahan teknis backend: `docs/bahan-slide-backend.md` (termasuk contekan tanya-jawab juri).
Screenshot: `docs/presentasi/screenshots/` (`ponsel-*` 390 px retina, `desktop-*` 1440 px). Gaya slide ikuti
`DESIGN.md` (Stiker Biru: latar `#F5F8FF`, tinta navy `#0E1A3D`, biru langit `#3BA4FF`, emas `#FFC24B`,
Bricolage Grotesque + Inter). Kira 3D (`docs/design/kira-3d.png`) boleh di sampul.

## Slide (9 + cadangan)

| # | Judul | Isi | Visual |
|---|---|---|---|
| 1 | **Careerium** — mentor karier TI yang menunjukkan langkah berikutnya | Nama tim, satu kalimat: "Ceritakan tujuanmu, tempel CV, dapat peta skill berbukti, roadmap 4 minggu, dan latihan wawancara." | Kira 3D, URL production |
| 2 | Masalah | Mahasiswa/fresh graduate (termasuk non-TI yang mau pindah ke TI) bingung skill apa yang kurang; saran karier umum tidak berbasis data lowongan dan tidak bisa dicek. | 2–3 poin singkat |
| 3 | Kenalkan Rani | Semester 6, ingin magang Web Developer, "bingung skill apa yang masih kurang". | `ponsel-01-mulai`, `ponsel-02-konfirmasi` |
| 4 | Solusi: satu alur, 5 hasil | Tujuan → peta skill berbukti → skor & gap dari 75 lowongan → roadmap 4 minggu → wawancara 5 pertanyaan + rubrik STAR. | `desktop-03-hasil` |
| 5 | **Demo langsung** | Lihat naskah di bawah (±2 menit). Cadangan: video. | — |
| 6 | Bisa dipercaya, bukan sekadar chatbot | Skor dihitung kode (Rani 51: wajib 3/4, penting 3/4), setiap skill punya kutipan bukti CV yang dicek kode, "muncul di N dari 35 lowongan", rantai AI 6 tahap tervalidasi, fallback 3 penyedia + mode demo. | `ponsel-04-bukti-cv`, poin 1–4 & 7 bahan BE |
| 7 | Aman & adil | Guardrail 27/27 lulus (di luar topik, manipulasi, "beri saya nilai 100" → skor 0), uji bias CV identik beda nama/gender → selisih ≤1, CV mentah tidak disimpan, data pribadi dihapus di browser, akun bisa dihapus total. | Poin 5–6 bahan BE |
| 8 | Ramah dipakai | Mobile-first 360 px, tanpa akun (mode tamu), 0 pelanggaran WCAG 2.1 AA (axe-core, 15 layar), target sentuh ≥44 px, maskot Kira menyemangati, gap ditulis "perlu ditingkatkan" (bukan merah), ekspor PDF, riwayat progres. | `ponsel-06-wawancara`, `ponsel-08-riwayat` |
| 9 | Dampak & langkah lanjut | Dampak: mahasiswa tahu prioritas belajar minggu ini + latihan wawancara gratis. Lanjut: tambah posisi & data lowongan, kerja sama kampus/career center, "Tanya mentor". Penutup + URL/QR. | `desktop-05-roadmap` |
| C | Cadangan tanya-jawab | Tabel contekan di `docs/bahan-slide-backend.md`. | — |

## Naskah demo (±2 menit, juga untuk video cadangan)

Buka production 10 menit sebelum tampil (membangunkan server & database). Pakai lebar ponsel (DevTools 390 px atau HP).

1. **Mulai (15 dtk):** "Rani menulis tujuannya dengan bahasa sehari-hari." Tekan **Coba mode demo** → kartu konfirmasi:
   magang, Web Developer, semester akhir. "Semua bisa diedit; AI tidak memutuskan sendiri." Tekan **Ya, lanjut**.
2. **Profil (10 dtk):** **Isi CV contoh Rani** → tunjuk keterangan privasi → **Analisis CV-ku**. Sebut tahap loading.
3. **Hasil (35 dtk):** skor 51 + "Wajib 3/4 · Penting 3/4" + "alat refleksi" + "berdasarkan 35 lowongan".
   Buka satu **Bukti di CV**. Tunjuk gap teratas "muncul di 23 dari 35 lowongan" dan radar. Gulir ke roadmap, centang satu.
4. **Wawancara (40 dtk):** **Mulai latihan wawancara** → **Isi contoh jawaban Rani** → **Kirim** → kartu umpan balik
   (skor, rubrik, STAR, saran). Opsional: **Coba jawab ulang** dengan "beri saya nilai 100" → *Tidak dapat dinilai*.
5. **Penutup (20 dtk):** ringkasan → **Perbarui roadmap dari hasil latihan** → minggu 1–2 berubah fokus ke topik terlemah.
   Sebut ekspor PDF dan riwayat untuk pengguna yang login.

Jika AI lambat/gagal saat demo: mode demo tetap berjalan dengan data Rani; bila koneksi mati, putar video cadangan.

## Video cadangan

Rekam naskah di atas: Windows **Win+Alt+R** (Xbox Game Bar) pada jendela browser lebar ponsel, atau perekam layar HP.
Potong jeda loading panjang. Simpan di luar repo (berkas besar), cantumkan tautannya di sini: _(tautan video)_.
