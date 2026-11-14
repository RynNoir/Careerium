# TODO — Frontend

Pemilik: **Frontend**. Hanya Frontend yang mengedit file ini. Backend boleh membaca.
Nomor langkah dan detail "selesai jika" ada di `docs/alur-fitur.md`.
Sebelum menyambung ke API asli, cek **Status endpoint** di `docs/todo/backend.md`.

**Sedang dikerjakan:** 5.3 (alur Mulai → Hasil selesai, teruji demo + LLM asli)

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
- [x] 2.3 Layar Profil: tempel teks + unggah PDF (`lib/pdf.ts`). **Unggah PDF belum diuji dengan file PDF asli**
- [x] 2.4 `lib/redact.ts` (email, telepon, tautan profil, nama, alamat, TTL) + sambung `/api/profile`. Teruji: body request berisi placeholder, teks CV tidak masuk sessionStorage

### Fitur 3 — Hasil (tunggu serah terima `/api/gap`)
- [x] 3.4 Ubin skor (pengganti cincin, sesuai DESIGN.md) + radar chart (sumbu dari `label`)
- [x] 3.5 Daftar Kekuatan (bukti) + Perlu ditingkatkan (sumber, prioritas); ringkas 5 teratas + "Lihat semua"

### Fitur 4 — Roadmap (tunggu serah terima `/api/roadmap`)
- [x] 4.2 Roadmap 4 minggu + kotak centang (state sesi; simpan ke server menunggu 6.4)
- [x] 4.3 Loading bertahap + tombol menempel "Mulai latihan wawancara"; roadmap gagal → tombol susun ulang

### Fitur 5 — Wawancara (tunggu serah terima `/api/interview/*`)
- [ ] 5.3 Layar Wawancara (n/5, gelembung chat, input menempel)
- [ ] 5.4 Kartu umpan balik + ringkasan sesi

### Fitur 6 — Akun & riwayat (tunggu serah terima `/api/analyses/*`)
- [ ] 6.3 Masuk, Daftar (kode pemulihan), Lupa password, status login
- [ ] 6.4 Simpan hasil, centang tersimpan, layar Riwayat + grafik, perbandingan percobaan

### Fitur 7 — Mode tamu & demo (tunggu serah terima mode demo)
- [x] 7.3 Mode tamu (data sesi di browser) — teruji: centang roadmap bertahan setelah muat ulang
- [x] 7.4 Tombol "Coba mode demo" + "Isi CV contoh Rani" (tombol contoh jawaban wawancara menyusul di 5.3)

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

- (file bersama) `eslint.config.mjs`: tambahkan `.claude/**` ke `globalIgnores`. Saat ini `npm run lint` gagal karena skrip `.cjs` di `.claude/skills/` (bukan kode aplikasi). Sementara FE memakai `npx eslint app components lib`.
- (file bersama) `package.json`: skrip `typecheck` sebaiknya `next typegen && tsc --noEmit`. Tanpa typegen, `RouteContext` di `app/api/analyses/**` tidak dikenal di clone baru.

## Catatan / blocker

- Font Geist bawaan scaffold dilepas (gagal diunduh saat build, dan belum ada di `DESIGN.md`).
- Cache Components aktif: halaman yang membaca data dinamis perlu dibungkus `<Suspense>`.
- shadcn/ui sengaja tidak dipasang: `init` membuat `lib/utils.ts` (di luar kepemilikan FE) dan menambah dependensi, sedangkan gaya Stiker Biru menimpa hampir semua gaya bawaannya. Komponen ditulis sendiri dengan Tailwind + token; bisa ditambah per komponen nanti bila perlu.
- Kelas token Tailwind: `bg-bg`, `bg-surface`, `border-ink` (= token `border`), `text-text`, `text-text-muted`, `bg-primary`, `text-primary-text`, `bg-gap-soft`, dst. Kelas komponen: `.btn .btn-primary .btn-secondary .card .chip .field .badge-* .skeleton .hl .display .label-caps`.
