# TODO — Frontend

Pemilik: **Frontend**. Hanya Frontend yang mengedit file ini. Backend boleh membaca.
Nomor langkah dan detail "selesai jika" ada di `docs/alur-fitur.md`.
Sebelum menyambung ke API asli, cek **Status endpoint** di `docs/todo/backend.md`.

**Sedang dikerjakan:** _(tulis nomor langkah, contoh: 0.4)_

---

## Langkah

### Fitur 0 — Fondasi
- [ ] 0.2 (bersama BE) Sepakati `lib/schemas.ts`: 5 kategori radar + mekanisme mode demo
- [ ] 0.4 Kunci `DESIGN.md`
- [ ] 0.5 shadcn/ui, token ke `globals.css`, font `next/font`, layout dasar
- [ ] 0.6 Komponen dasar, `lib/api-client.ts`, `mocks/` persona Rani

> Selama `DESIGN.md` BELUM DIKUNCI: jangan membuat tampilan final. Struktur halaman, state, dan logika klien boleh dikerjakan.

### Fitur 1 — Pemahaman tujuan (tunggu serah terima `/api/intent`)
- [ ] 1.4 Layar Mulai
- [ ] 1.5 Kartu konfirmasi, pertanyaan lanjutan, pesan penolakan template (`lib/pesan-template.ts`)

### Fitur 2 — Profil (tunggu serah terima `/api/profile`)
- [ ] 2.3 Layar Profil: tempel teks + unggah PDF (`lib/pdf.ts`)
- [ ] 2.4 `lib/redact.ts` + sambung `/api/profile`

### Fitur 3 — Hasil (tunggu serah terima `/api/gap`)
- [ ] 3.4 Cincin skor + radar chart
- [ ] 3.5 Daftar Kekuatan (bukti) + Perlu ditingkatkan (sumber, prioritas)

### Fitur 4 — Roadmap (tunggu serah terima `/api/roadmap`)
- [ ] 4.2 Roadmap 4 minggu + kotak centang
- [ ] 4.3 Loading bertahap + tombol menempel "Mulai latihan wawancara"

### Fitur 5 — Wawancara (tunggu serah terima `/api/interview/*`)
- [ ] 5.3 Layar Wawancara (n/5, gelembung chat, input menempel)
- [ ] 5.4 Kartu umpan balik + ringkasan sesi

### Fitur 6 — Akun & riwayat (tunggu serah terima `/api/analyses/*`)
- [ ] 6.3 Masuk, Daftar (kode pemulihan), Lupa password, status login
- [ ] 6.4 Simpan hasil, centang tersimpan, layar Riwayat + grafik, perbandingan percobaan

### Fitur 7 — Mode tamu & demo (tunggu serah terima mode demo)
- [ ] 7.3 Mode tamu (data sesi di browser)
- [ ] 7.4 Tombol "Coba mode demo"

### Fitur 8 — Penguatan
- [ ] 8.2 Status loading/kosong/error, uji 360 px, aksesibilitas, audit desain

### Fitur 9 — Bonus & finalisasi
- [ ] 9.1 (bonus) Roadmap adaptif — UI
- [ ] 9.2 (bonus) Mode eksplorasi — UI
- [ ] 9.3 (bonus) Ekspor PDF
- [ ] 9.4 (bonus) Tanya mentor — UI
- [ ] 9.6 Video demo cadangan, screenshot, slide

---

## Butuh dari backend

_(tulis permintaan di sini, lalu beri tahu BE lewat chat)_

## Catatan / blocker

- Font Geist bawaan scaffold dilepas (gagal diunduh saat build, dan belum ada di `DESIGN.md`).
- Cache Components aktif: halaman yang membaca data dinamis perlu dibungkus `<Suspense>`.
