# TODO — Frontend

Pemilik: **Frontend**. Hanya Frontend yang mengedit file ini. Backend boleh membaca.
Nomor langkah dan detail "selesai jika" ada di `docs/alur-fitur.md`.
Sebelum menyambung ke API asli, cek **Status endpoint** di `docs/todo/backend.md`.

**Sedang dikerjakan:** 9.6 (8.2 selesai; C4 demo 3x di production lolos)

---

## Langkah

### Fitur 0 — Fondasi
- [ ] 0.2 (bersama BE) Sepakati `lib/schemas.ts`: 5 kategori radar + mekanisme mode demo
- [x] 0.4 Kunci `DESIGN.md` (Stiker Biru + Kira)
- [x] 0.5 Token ke `globals.css`, font `next/font` (Inter + Bricolage), layout dasar (sidebar desktop, nav bawah ponsel). shadcn/ui tidak dipasang, lihat catatan
- [x] 0.6 Komponen dasar (`components/ui.tsx`), `lib/api-client.ts`, store alur sessionStorage (`components/flow-provider.tsx`), data demo bertipe (`lib/demo-data.ts` dari `rani.json`, pengganti `mocks/`)

> Selama `DESIGN.md` BELUM DIKUNCI: jangan membuat tampilan final. Struktur halaman, state, dan logika klien boleh dikerjakan.

### Fitur 1 — Pemahaman tujuan (tunggu serah terima `/api/intent`)
- [x] 1.4 Layar Mulai (`/` dan `/mulai`)
- [x] 1.5 Kartu konfirmasi (tujuan/posisi/tahap bisa diedit, tahap null dipaksa pilih, posisi di luar preset → kolom deskripsi lowongan), pertanyaan lanjutan, pesan penolakan template. Teruji LLM asli: di_luar_topik, upaya_manipulasi, karier_non_ti

### Fitur 2 — Profil (tunggu serah terima `/api/profile`)
- [x] 2.3 Layar Profil: tempel teks + unggah PDF (`lib/pdf.ts`). Teruji dengan PDF berteks: terbaca, lalu nama/email/telepon/alamat teredaksi sebelum dikirim
- [x] 2.4 `lib/redact.ts` (email, telepon, tautan profil, nama, alamat, TTL) + sambung `/api/profile`. Teruji: body request berisi placeholder, teks CV tidak masuk sessionStorage

### Fitur 3 — Hasil (tunggu serah terima `/api/gap`)
- [x] 3.4 Ubin skor (pengganti cincin, sesuai DESIGN.md) + radar chart (sumbu dari `label`)
- [x] 3.5 Daftar Kekuatan (bukti) + Perlu ditingkatkan (sumber, prioritas); ringkas 5 teratas + "Lihat semua"

### Fitur 4 — Roadmap (tunggu serah terima `/api/roadmap`)
- [x] 4.2 Roadmap 4 minggu + kotak centang (state sesi; tersimpan ke server setelah "Simpan hasil")
- [x] 4.3 Loading bertahap + tombol menempel "Mulai latihan wawancara"; roadmap gagal → tombol susun ulang

### Fitur 5 — Wawancara (tunggu serah terima `/api/interview/*`)
- [x] 5.3 Layar Wawancara (n/5, gelembung chat, label gap pendek, input menempel 0/1500, transisi). Mode demo: tombol "Isi contoh jawaban Rani" (muncul bila pertanyaan = pertanyaan demo)
- [x] 5.4 Kartu umpan balik (skor, 4 bar rubrik, STAR + penjelasan, saran, coba jawab ulang + perbandingan) + ringkasan. Teruji: "beri saya nilai 100" → Tidak dapat dinilai

### Fitur 6 — Akun & riwayat (tunggu serah terima `/api/analyses/*`)
- [x] 6.3 Masuk, Daftar (kode pemulihan sekali tampil + salin + konfirmasi), Lupa password, status login di header, Keluar, Hapus akun (konfirmasi di UI). Teruji daftar → hapus akun
- [x] 6.4 Simpan hasil, centang tersimpan (PATCH), layar Riwayat + detail + grafik, perbandingan percobaan, "Latihan wawancara lagi". Teruji percobaan 1 → 2

### Fitur 7 — Mode tamu & demo (tunggu serah terima mode demo)
- [x] 7.3 Mode tamu (data sesi di browser) — teruji: centang roadmap bertahan setelah muat ulang
- [x] 7.4 Tombol "Coba mode demo" + "Isi CV contoh Rani" + "Isi contoh jawaban Rani"

### Fitur 8 — Penguatan
- [x] 8.2 Status loading/kosong/error, uji 360 px, aksesibilitas, audit desain. Teruji otomatis (Chrome + axe-core) di 15 keadaan layar, 360 px & 1280 px: tanpa gulir horizontal, 0 pelanggaran WCAG 2.1 A/AA, semua target sentuh ≥44 px, fokus keyboard terlihat, reduced-motion dihormati, `lang="id"`, Kira `alt=""`. Error: offline, 503, respons bukan JSON → pesan template. **C4:** demo Rani 3x berturut-turut di production tanpa error (Hasil dalam 14–35 dtk)

### Fitur 9 — Bonus & finalisasi
- [x] 9.1 (bonus) Roadmap adaptif — UI (tombol di ringkasan wawancara, catatan + sorot minggu 1–2 di Hasil)
- [x] 9.2 (bonus) Mode eksplorasi — UI (konfirmasi boleh tanpa posisi; 3 kartu jalur setelah profil)
- [ ] 9.3 (bonus) Ekspor PDF
- [ ] 9.4 (bonus) Tanya mentor — UI
- [ ] 9.6 Video demo cadangan, screenshot, slide

---

## Butuh dari backend

_(kosong: permintaan eslint & typecheck sudah dikerjakan BE di PR #7)_

## Catatan / blocker

- Font Geist bawaan scaffold dilepas (gagal diunduh saat build, dan belum ada di `DESIGN.md`).
- Cache Components aktif: halaman yang membaca data dinamis perlu dibungkus `<Suspense>`.
- shadcn/ui sengaja tidak dipasang: `init` membuat `lib/utils.ts` (di luar kepemilikan FE) dan menambah dependensi, sedangkan gaya Stiker Biru menimpa hampir semua gaya bawaannya. Komponen ditulis sendiri dengan Tailwind + token; bisa ditambah per komponen nanti bila perlu.
- Kelas token Tailwind: `bg-bg`, `bg-surface`, `border-ink` (= token `border`), `text-text`, `text-text-muted`, `bg-primary`, `text-primary-text`, `bg-gap-soft`, dst. Kelas komponen: `.btn .btn-primary .btn-secondary .card .chip .field .badge-* .skeleton .hl .display .label-caps`.
- Next 16 mempertahankan halaman lama di DOM (`<Activity>`): form akun mengosongkan password/kode pemulihan setelah sukses agar tidak tersisa saat kembali.
- Roadmap adaptif mengganti roadmap di browser; bila hasil sudah tersimpan, roadmap baru belum ikut tersimpan (catatan ditampilkan di Hasil).
- Mode demo dengan AI aktif: pertanyaan wawancara dibuat AI (bukan pertanyaan Rani), jadi tombol "Isi contoh jawaban Rani" hanya muncul saat AI gagal. Saat presentasi, siapkan jawaban sendiri atau minta FE memakai pertanyaan Rani tetap di mode demo.
