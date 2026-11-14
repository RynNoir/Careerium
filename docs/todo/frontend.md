# TODO — Frontend

Pemilik: **Frontend**. Hanya Frontend yang mengedit file ini. Backend boleh membaca.
Nomor langkah dan detail "selesai jika" ada di `docs/alur-fitur.md`.
Sebelum menyambung ke API asli, cek **Status endpoint** di `docs/todo/backend.md`.

**Sedang dikerjakan:** 1.4 (fondasi 0.4–0.6 selesai)

---

## Langkah

### Fitur 0 — Fondasi
- [ ] 0.2 (bersama BE) Sepakati `lib/schemas.ts`: 5 kategori radar + mekanisme mode demo
- [x] 0.4 Kunci `DESIGN.md` (Stiker Biru + Kira)
- [x] 0.5 Token ke `globals.css`, font `next/font` (Inter + Bricolage), layout dasar (sidebar desktop, nav bawah ponsel). shadcn/ui tidak dipasang, lihat catatan
- [x] 0.6 Komponen dasar (`components/ui.tsx`), `lib/api-client.ts`, store alur sessionStorage (`components/flow-provider.tsx`), data demo bertipe (`lib/demo-data.ts` dari `rani.json`, pengganti `mocks/`)

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

- (file bersama) `eslint.config.mjs`: tambahkan `.claude/**` ke `globalIgnores`. Saat ini `npm run lint` gagal karena skrip `.cjs` di `.claude/skills/` (bukan kode aplikasi). Sementara FE memakai `npx eslint app components lib`.
- (file bersama) `package.json`: skrip `typecheck` sebaiknya `next typegen && tsc --noEmit`. Tanpa typegen, `RouteContext` di `app/api/analyses/**` tidak dikenal di clone baru.

## Catatan / blocker

- Font Geist bawaan scaffold dilepas (gagal diunduh saat build, dan belum ada di `DESIGN.md`).
- Cache Components aktif: halaman yang membaca data dinamis perlu dibungkus `<Suspense>`.
- shadcn/ui sengaja tidak dipasang: `init` membuat `lib/utils.ts` (di luar kepemilikan FE) dan menambah dependensi, sedangkan gaya Stiker Biru menimpa hampir semua gaya bawaannya. Komponen ditulis sendiri dengan Tailwind + token; bisa ditambah per komponen nanti bila perlu.
- Kelas token Tailwind: `bg-bg`, `bg-surface`, `border-ink` (= token `border`), `text-text`, `text-text-muted`, `bg-primary`, `text-primary-text`, `bg-gap-soft`, dst. Kelas komponen: `.btn .btn-primary .btn-secondary .card .chip .field .badge-* .skeleton .hl .display .label-caps`.
